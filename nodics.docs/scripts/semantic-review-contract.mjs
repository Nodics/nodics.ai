/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module nodics.docs/scripts/semantic-review-contract @description Binds manual semantic review dispositions to exact canonical sections and inspected source bytes; never performs semantic review itself. @layer tooling @owner nodics.docs */
import { createHash } from 'node:crypto';
import { readFileSync, realpathSync, statSync } from 'node:fs';
import { isAbsolute, relative, resolve, sep } from 'node:path';

const digest = value => createHash('sha256').update(value).digest('hex');

/** Reopens absent, incomplete or stale manual evidence without turning keyword matches into closure. */
export function qualifySemanticReview(definition, bundle, documents, root) {
    const open = (disposition, diagnostic) => ({ status: 'requires-semantic-review',
        reviewDisposition: disposition, reviewDiagnostic: diagnostic });
    if (!bundle || bundle.reviewType !== 'MANUAL_SEMANTIC_SOURCE_EDITORIAL_REVIEW' || !Array.isArray(bundle.items))
        return open('NOT_REVIEWED', 'Manual source review is required.');
    const matches = bundle.items.filter(item => item.item === definition.item);
    if (matches.length !== 1) return open('INVALID_REVIEW', 'Exactly one disposition is required.');
    const review = matches[0];
    if (review.disposition === 'OPEN_CONTENT_GAP') return open(review.disposition, review.remediation || []);
    if (review.disposition !== 'PASS_SOURCE_REVIEW' || review.requestedExplanationSatisfied !== true ||
        review.requestedAction !== definition.action || typeof review.rationale !== 'string' || review.rationale.length < 40 ||
        !Array.isArray(review.evidence) || !review.evidence.length ||
        !Array.isArray(review.sourceFiles) || new Set(review.sourceFiles).size < 2)
        return open('INVALID_REVIEW', 'A complete scope-matching source review is required.');
    try {
        const canonicalRoot = realpathSync(root);
        for (const reference of review.evidence) {
            const document = documents.find(item => item.id === reference.documentId);
            const pinned = bundle.canonicalDocuments?.[reference.documentId];
            if (!document || !pinned || pinned.owner !== relative(root, document.ownerRoot) ||
                pinned.componentFile !== relative(root, resolve(document.ownerRoot, document.content)) ||
                pinned.articleBlocksSha256 !== digest(JSON.stringify(document.blocks)) ||
                !Array.isArray(reference.anchors) || !reference.anchors.length ||
                reference.anchors.some(anchor => !document.blocks.some(block => block.kind === 'heading' && block.anchor === anchor)))
                throw Error('STALE_CANONICAL_SECTIONS');
        }
        for (const file of review.sourceFiles) {
            if (typeof file !== 'string' || isAbsolute(file) || file.split(/[\\/]/).some(segment => ['..', 'data', 'node_modules', '.git'].includes(segment)))
                throw Error('SOURCE_BOUNDARY_INVALID');
            const absolute = realpathSync(resolve(root, file));
            if (!absolute.startsWith(canonicalRoot + sep) || !statSync(absolute).isFile() ||
                bundle.sourceFileSha256?.[file] !== digest(readFileSync(absolute))) throw Error('STALE_SOURCE_BYTES');
        }
        return { status: 'closed-with-evidence', reviewDisposition: 'PASS_SOURCE_REVIEW',
            closureEvidence: review.evidence, sourceFiles: review.sourceFiles, reviewRationale: review.rationale,
            liveAcceptance: review.liveAcceptance || { status: 'NOT_EXECUTED' } };
    } catch (_) {
        return open('STALE_OR_INVALID_REVIEW', 'Canonical sections or inspected source bytes changed; re-review is required.');
    }
}
