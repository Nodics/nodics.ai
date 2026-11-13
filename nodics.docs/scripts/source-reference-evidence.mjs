/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module nodics.docs/scripts/source-reference-evidence @description Validates local Framework citations and exact pinned external reference snapshots without requiring or trusting sibling checkouts. @owner nodics.docs @layer tooling */
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
const require = createRequire(import.meta.url);
const contract = require('../../nodics.foundation/modules/nTooling/src/service/defaultApplicationDocumentationContractService');
const sha256 = value => createHash('sha256').update(value).digest('hex');
const within = (root, target) => target === root || target.startsWith(root + path.sep);

/** Validates a citation against current Framework source or sealed reference-only Git evidence.
 * External snapshots prove source existence at a commit, never current customer compatibility,
 * editorial approval or live acceptance. Missing, changed or escaping evidence fails closed.
 */
export function validateFrameworkSourceEvidence({ frameworkRoot, ownerRoot, document, evidence,
    snapshotRoot = path.join(frameworkRoot, 'nodics.docs/test/fixtures/externalSourceEvidence') }) {
    const root = path.resolve(frameworkRoot), owner = path.resolve(ownerRoot);
    if (!within(root, owner)) throw new Error('Document owner is outside Framework');
    const reference = new URL(evidence, pathToFileURL(owner + path.sep));
    if (reference.protocol === 'https:' || reference.protocol === 'http:')
        return Object.freeze({ kind: 'EXTERNAL_URL_NOT_FETCHED', url: reference.href });
    if (reference.protocol !== 'file:' || reference.search) throw new Error('Invalid source reference');
    const target = path.resolve(fileURLToPath(reference));
    if (within(root, target)) return contract.validateSourceEvidence(owner, evidence);
    const snapshots = path.resolve(snapshotRoot);
    if (!within(root, snapshots) || !within(fs.realpathSync(root), fs.realpathSync(snapshots)))
        throw new Error('Snapshot root is outside Framework');
    const manifestPath = path.join(snapshots, 'manifest.json');
    if (!within(fs.realpathSync(snapshots), fs.realpathSync(manifestPath)))
        throw new Error('Snapshot manifest is outside its boundary');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const recorded = manifest.documents?.[document.id];
    if (manifest.schemaVersion !== 1 || !recorded ||
        recorded.owner !== path.relative(root, owner).split(path.sep).join('/') ||
        recorded.articleBlocksSha256 !== sha256(JSON.stringify(document.blocks)))
        throw new Error('External citation article or owner changed; requalification required');
    const source = manifest.sources?.[recorded.references?.[evidence]];
    if (!source || !/^[a-f0-9]{40}$/.test(source.commit) || !/^[a-f0-9]{64}$/.test(source.sha256) ||
        !['file', 'directory'].includes(source.kind)) throw new Error('Missing pinned external source evidence');
    if (!/^[A-Za-z0-9._-]+$/.test(source.repository) || typeof source.gitPath !== 'string' ||
        path.posix.isAbsolute(source.gitPath) || path.posix.normalize(source.gitPath) !== source.gitPath ||
        source.gitPath.startsWith('../') || !target.endsWith(path.sep + source.repository + path.sep + source.gitPath))
        throw new Error('External citation does not match its original repository path');
    const url = new URL(source.url);
    const prefix = '/Nodics/' + source.repository + '/' + (source.kind === 'file' ? 'blob' : 'tree') + '/' + source.commit + '/';
    if (url.protocol !== 'https:' || url.hostname !== 'github.com' || url.username || url.password ||
        url.search || url.hash || url.pathname !== prefix + source.gitPath)
        throw new Error('External citation must identify its exact Git source');
    const file = path.resolve(snapshots, source.snapshot);
    if (!within(snapshots, file) || !within(fs.realpathSync(snapshots), fs.realpathSync(file)) ||
        !fs.statSync(file).isFile() || sha256(fs.readFileSync(file)) !== source.sha256)
        throw new Error('External citation snapshot is missing, changed or outside its boundary');
    if (source.kind === 'file') contract.validateSourceEvidence(path.dirname(file),
        path.basename(file) + reference.hash);
    else if (reference.hash || !fs.readFileSync(file, 'utf8').trim())
        throw new Error('Directory citation requires a nonempty pinned Git tree without an article anchor');
    return Object.freeze({ kind: 'PINNED_EXTERNAL_REFERENCE', url: source.url, sha256: source.sha256 });
}
