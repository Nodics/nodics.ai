/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const DOCUMENT_IDENTITY = /^[A-Za-z][A-Za-z0-9._-]{0,127}$/;
const LOWER_DOCUMENT_IDENTITY = /^[a-z][a-z0-9.-]*$/;
const SEMVER = /^\d+\.\d+\.\d+$/;
const ALLOWED_DOCUMENT_TYPES = new Set([
    'overview',
    'concept',
    'quickstart',
    'how-to',
    'configuration',
    'customization',
    'integration',
    'operations',
    'reference',
    'contract'
]);
const ALLOWED_MATURITY_STATES = new Set([
    'concept',
    'design-contract',
    'partial',
    'current-read-only',
    'preview-only',
    'unavailable',
    'operational'
]);
const ALLOWED_LIFECYCLE_STATES = new Set([
    'DRAFT',
    'STAGED',
    'REVIEW_IN_PROGRESS',
    'CHANGES_REQUESTED',
    'APPROVED',
    'ONLINE',
    'ARCHIVED',
    'RETIRED',
    'ROLLBACK_PENDING',
    'PUBLICATION_FAILED'
]);
const ALLOWED_ACCESS_MODES = new Set([
    'PUBLIC',
    'AUTHENTICATED',
    'ROLE_BASED',
    'GROUP_BASED',
    'PERMISSION_BASED',
    'RESTRICTED'
]);
const ALLOWED_VISUAL_REQUIREMENTS = new Set([
    'diagram',
    'architecture-diagram',
    'sequence-flow',
    'data-flow',
    'schema-model',
    'module-hierarchy',
    'lifecycle-state-diagram',
    'decision-tree',
    'screen-flow',
    'screenshot',
    'table',
    'configuration-table',
    'comparison-table',
    'decision-table',
    'troubleshooting-matrix',
    'source-map-table',
    'image',
    'code-example',
    'command-example'
]);

/**
 * @module nTooling/service/defaultApplicationDocumentationContractService
 * @description Validates application-owned documentation sources and builds immutable WCMS Staged content-pack manifest sections without owning project renderers or runtime import behavior.
 * @layer tooling
 * @owner nTooling
 * @override Projects may narrow catalogue and release policy through a later tooling service while preserving path containment, immutable checksums, optional Axis administration, and Staged-to-Online publication.
 */
module.exports = {
    /** Returns a deterministic SHA-256 checksum. */
    sha256: function (value) {
        return crypto.createHash('sha256').update(value).digest('hex');
    },

    /** Raises a stable validation error. */
    fail: function (code, message) {
        const error = new Error(message);
        error.code = code;
        throw error;
    },

    /** Normalizes and validates a repository-relative path. */
    relativePath: function (value, label) {
        if (typeof value !== 'string' || !value.trim()) {
            this.fail('ERR_TOOL_DOC_00001', label + ' must be a non-empty relative path');
        }
        const normalized = value.replace(/\\/g, '/').replace(/^\.\//, '');
        if (path.isAbsolute(value) || normalized === '..' || normalized.startsWith('../') || normalized.includes('/../')) {
            this.fail('ERR_TOOL_DOC_00001', label + ' must remain inside its owning module');
        }
        return normalized;
    },

    /** Verifies that a resolved path stays inside an owning directory. */
    containedPath: function (ownerRoot, relativeValue, label) {
        const relative = this.relativePath(relativeValue, label);
        const owner = path.resolve(ownerRoot);
        const resolved = path.resolve(owner, relative);
        if (resolved !== owner && !resolved.startsWith(owner + path.sep)) {
            this.fail('ERR_TOOL_DOC_00001', label + ' escapes its owning module');
        }
        return resolved;
    },

    /** Counts human-readable words in Markdown or generated documentation text. */
    countWords: function (body) {
        return (String(body || '').match(/\b[\w'.-]+\b/g) || []).length;
    },

    /** Validates reusable, Axis-manageable top-level documentation navigation sections. */
    validateNavigationSections: function (catalogue, options) {
        const strict = Boolean(options && options.requireNavigationSections);
        const sections = Array.isArray(catalogue && catalogue.navigationSections) ? catalogue.navigationSections : [];
        if (!sections.length) {
            if (strict) {
                this.fail('ERR_TOOL_DOC_00008', 'documentation catalogue requires backend-owned navigation sections');
            }
            return Object.freeze([]);
        }
        const identities = new Set();
        sections.forEach((section, index) => {
            if (!section || !DOCUMENT_IDENTITY.test(section.code || '') || identities.has(section.code)) {
                this.fail('ERR_TOOL_DOC_00008', 'navigation section identities must be unique stable codes');
            }
            identities.add(section.code);
            if (!section.title || !Number.isInteger(section.order) || !section.summary) {
                this.fail('ERR_TOOL_DOC_00008', section.code + ' requires title, summary, and order');
            }
            if (section.accessMode && !ALLOWED_ACCESS_MODES.has(section.accessMode)) {
                this.fail('ERR_TOOL_DOC_00008', section.code + ' has invalid access mode');
            }
            if (section.lifecycleState && !ALLOWED_LIFECYCLE_STATES.has(section.lifecycleState)) {
                this.fail('ERR_TOOL_DOC_00008', section.code + ' has invalid lifecycle state');
            }
            if (!Number.isFinite(section.order) || section.order <= 0 || section.order !== Math.trunc(section.order)) {
                this.fail('ERR_TOOL_DOC_00008', section.code + ' order must be a positive integer');
            }
            if (index > 0 && section.order === sections[index - 1].order && section.title === sections[index - 1].title) {
                this.fail('ERR_TOOL_DOC_00008', section.code + ' duplicates adjacent navigation placement');
            }
        });
        return Object.freeze(sections.map(section => Object.freeze(Object.assign({}, section))));
    },

    /** Validates enterprise documentation metadata that every generated document must eventually carry. */
    validateDocumentMetadata: function (document, catalogue, options) {
        const strict = Boolean(options && options.requireEnterpriseMetadata);
        if (!strict) return Object.freeze(document);
        const sectionCodes = new Set((catalogue.navigationSections || []).map(section => section.code));
        if (!document.slug || !document.parentId || !Array.isArray(document.hierarchyPath) || document.hierarchyPath.length < 2) {
            this.fail('ERR_TOOL_DOC_00009', document.id + ' requires slug, parentId, and hierarchyPath');
        }
        if (!document.navigationSection || !document.navigationSectionCode || !document.navigationGroup || !Number.isInteger(document.navigationOrder)) {
            this.fail('ERR_TOOL_DOC_00009', document.id + ' requires navigation section, group, and order metadata');
        }
        if (!sectionCodes.has(document.navigationSectionCode)) {
            this.fail('ERR_TOOL_DOC_00009', document.id + ' references unknown navigation section');
        }
        if (!ALLOWED_DOCUMENT_TYPES.has(document.documentType || '')) {
            this.fail('ERR_TOOL_DOC_00009', document.id + ' has invalid document type');
        }
        if (!Array.isArray(document.audience) || !document.audience.length) {
            this.fail('ERR_TOOL_DOC_00009', document.id + ' requires audience metadata');
        }
        if (!document.sourceOwner || !document.sourcePath) {
            this.fail('ERR_TOOL_DOC_00009', document.id + ' requires source owner and source path');
        }
        this.relativePath(document.sourcePath, document.id + '.sourcePath');
        if (!ALLOWED_ACCESS_MODES.has(document.accessMode || '')) {
            this.fail('ERR_TOOL_DOC_00009', document.id + ' has invalid access mode');
        }
        if (!ALLOWED_LIFECYCLE_STATES.has(document.lifecycleState || '')) {
            this.fail('ERR_TOOL_DOC_00009', document.id + ' has invalid lifecycle state');
        }
        if (!ALLOWED_MATURITY_STATES.has(document.maturityState || '')) {
            this.fail('ERR_TOOL_DOC_00009', document.id + ' has invalid maturity state');
        }
        if (!Array.isArray(document.relatedPages) || !Array.isArray(document.sourceEvidence)) {
            this.fail('ERR_TOOL_DOC_00009', document.id + ' requires related pages and source evidence arrays');
        }
        if (!Array.isArray(document.visualRequirements) || !document.visualRequirements.length) {
            this.fail('ERR_TOOL_DOC_00009', document.id + ' requires explicit visual requirements');
        }
        document.visualRequirements.forEach((requirement, index) => {
            if (!ALLOWED_VISUAL_REQUIREMENTS.has(requirement)) {
                this.fail('ERR_TOOL_DOC_00009', document.id + ' has invalid visual requirement at index ' + index);
            }
        });
        return Object.freeze(document);
    },

    /** Detects Markdown visual and example evidence for page-level visual requirements. */
    detectVisualEvidence: function (content) {
        const body = String(content || '');
        return Object.freeze({
            diagram: body.includes('```mermaid'),
            table: /^\| .+ \|$/m.test(body),
            image: /^!\[.+\]\(.+\)/m.test(body),
            codeExample: /```(?!mermaid\b)[\w-]*\n[\s\S]*?```/m.test(body),
            commandExample: /```(?:bash|sh|zsh|shell|dotenv|env)\b[\s\S]*?```/m.test(body)
        });
    },

    /** Validates that declared visual requirements are backed by authored Markdown evidence. */
    validateVisualRequirements: function (document, content) {
        const requirements = Array.isArray(document && document.visualRequirements) ? document.visualRequirements : [];
        if (!requirements.length) return Object.freeze({ requirements: [], satisfied: [] });
        const evidence = this.detectVisualEvidence(content);
        const satisfies = {
            diagram: evidence.diagram,
            'architecture-diagram': evidence.diagram,
            'sequence-flow': evidence.diagram,
            'data-flow': evidence.diagram,
            'schema-model': evidence.diagram || evidence.table,
            'module-hierarchy': evidence.diagram || evidence.table,
            'lifecycle-state-diagram': evidence.diagram,
            'decision-tree': evidence.diagram,
            'screen-flow': evidence.diagram || evidence.image,
            screenshot: evidence.image,
            table: evidence.table,
            'configuration-table': evidence.table,
            'comparison-table': evidence.table,
            'decision-table': evidence.table,
            'troubleshooting-matrix': evidence.table,
            'source-map-table': evidence.table,
            image: evidence.image,
            'code-example': evidence.codeExample,
            'command-example': evidence.commandExample
        };
        requirements.forEach(requirement => {
            if (!satisfies[requirement]) {
                this.fail('ERR_TOOL_DOC_00010', document.id + ' is missing declared visual evidence: ' + requirement);
            }
        });
        return Object.freeze({ requirements: Object.freeze(requirements.slice()), satisfied: Object.freeze(requirements.slice()) });
    },

    /** Validates cross-document hierarchy and audit references for strict documentation catalogues. */
    validateCatalogueIntegrity: function (catalogue, options) {
        if (!(options && options.requireEnterpriseMetadata)) return Object.freeze({ documents: 0 });
        const documents = catalogue.documents || [];
        const ids = new Set(documents.map(document => document.id));
        const documentsBySection = new Map();
        const siblingOrders = new Map();
        documents.forEach(document => {
            documentsBySection.set(document.navigationSectionCode, (documentsBySection.get(document.navigationSectionCode) || 0) + 1);
            const hierarchyDepth = document.hierarchyDepth;
            if (!Number.isInteger(hierarchyDepth) || hierarchyDepth < 2 || hierarchyDepth !== document.hierarchyPath.length) {
                this.fail('ERR_TOOL_DOC_00011', document.id + ' hierarchy depth must match hierarchy path');
            }
            const siblingKey = document.parentId;
            const orderKey = siblingKey + ':' + document.navigationOrder;
            if (siblingOrders.has(orderKey)) {
                this.fail('ERR_TOOL_DOC_00011', document.id + ' duplicates navigation order with ' + siblingOrders.get(orderKey));
            }
            siblingOrders.set(orderKey, document.id);
            (document.relatedPages || []).forEach(relatedPage => {
                if (!ids.has(relatedPage)) {
                    this.fail('ERR_TOOL_DOC_00011', document.id + ' references unknown related page ' + relatedPage);
                }
            });
            (document.sourceEvidence || []).forEach((evidence, index) => {
                if (typeof evidence !== 'string' || !evidence.trim()) {
                    this.fail('ERR_TOOL_DOC_00011', document.id + ' has invalid source evidence at index ' + index);
                }
            });
        });
        (catalogue.navigationSections || []).forEach(section => {
            if (!documentsBySection.has(section.code)) {
                this.fail('ERR_TOOL_DOC_00011', section.code + ' navigation section requires at least one documentation page');
            }
        });
        return Object.freeze({ documents: documents.length });
    },

    /** Validates the reusable Nodics documentation depth and audit contract for authored pages. */
    validateContentQuality: function (document, body, options) {
        const content = String(body || '');
        const minimumWordCount = Number.isInteger(options && options.minimumWordCount) ? options.minimumWordCount : 500;
        const minimumSectionCount = Number.isInteger(options && options.minimumSectionCount) ? options.minimumSectionCount : 5;
        if (!content.trim().startsWith('# ')) {
            this.fail('ERR_TOOL_DOC_00010', document.id + ' must start with exactly one page title');
        }
        const wordCount = this.countWords(content);
        if (wordCount < minimumWordCount) {
            this.fail('ERR_TOOL_DOC_00010', document.id + ' is too shallow for enterprise documentation');
        }
        const sectionCount = (content.match(/^## /gm) || []).length;
        if (sectionCount < minimumSectionCount) {
            this.fail('ERR_TOOL_DOC_00010', document.id + ' needs more structured sections');
        }
        const hasVisualAid = content.includes('```mermaid') || /^!\[.+\]\(.+\)/m.test(content) || /^\| .+ \|$/m.test(content);
        if (!hasVisualAid) {
            this.fail('ERR_TOOL_DOC_00010', document.id + ' needs at least one visual aid, table, or diagram');
        }
        const visualRequirements = this.validateVisualRequirements(document, content);
        const requiredAudienceEvidence = [
            ['beginner', /\bbeginners?\b/i],
            ['business', /\bbusiness\b/i],
            ['developer', /\bdevelopers?\b/i],
            ['operator', /\b(devops|operator|production)\b/i]
        ];
        requiredAudienceEvidence.forEach(([label, pattern]) => {
            if (!pattern.test(content)) {
                this.fail('ERR_TOOL_DOC_00010', document.id + ' is missing ' + label + ' guidance');
            }
        });
        [
            ['common mistakes', /^## Common mistakes\b/im],
            ['verification', /^## Verification\b/im]
        ].forEach(([label, pattern]) => {
            if (!pattern.test(content)) {
                this.fail('ERR_TOOL_DOC_00010', document.id + ' is missing required ' + label + ' section');
            }
        });
        if (/\bPhase\s+\d+\b|future plan|future-plan/i.test(content)) {
            this.fail('ERR_TOOL_DOC_00010', document.id + ' contains delivery-phase or roadmap-promise wording');
        }
        if (/local-archive|legacy-repositories|nodicsaxis|old nodics repository/i.test(content)) {
            this.fail('ERR_TOOL_DOC_00010', document.id + ' contains legacy migration-only references');
        }
        if (/nodics\.axis[^.\n]*(owns|owner|source)[^.\n]*(catalog|site|page|component|route|documentation data)/i.test(content)) {
            this.fail('ERR_TOOL_DOC_00010', document.id + ' suggests frontend-owned backend data');
        }
        return Object.freeze({ documentId: document.id, wordCount: wordCount, sectionCount: sectionCount, hasVisualAid: true, visualRequirements: visualRequirements });
    },

    /** Validates a module-owned documentation catalogue and returns its source files. */
    validateCatalogue: function (request) {
        const root = path.resolve(request && request.ownerRoot || '');
        const sourceDirectory = this.relativePath(request && request.sourceDirectory || 'docs', 'sourceDirectory');
        if (sourceDirectory === 'data' || sourceDirectory.startsWith('data/')) {
            this.fail('ERR_TOOL_DOC_00002', 'documentation source must not live under generated/runtime data');
        }
        const cataloguePath = this.relativePath(request && request.cataloguePath || sourceDirectory + '/catalogue.json', 'cataloguePath');
        if (cataloguePath !== sourceDirectory + '/catalogue.json') {
            this.fail('ERR_TOOL_DOC_00002', 'catalogue must be owned by ' + sourceDirectory + '/catalogue.json');
        }
        const catalogue = request && request.catalogue;
        if (!catalogue || typeof catalogue.pack !== 'string' || !catalogue.pack || typeof catalogue.version !== 'string' || !catalogue.version) {
            this.fail('ERR_TOOL_DOC_00003', 'catalogue requires stable pack and version values');
        }
        if ((request && request.requireEnterpriseMetadata) && !SEMVER.test(catalogue.version)) {
            this.fail('ERR_TOOL_DOC_00003', 'strict documentation catalogue version must use semantic versioning');
        }
        this.validateNavigationSections(catalogue, request);
        const documents = Array.isArray(catalogue.documents) ? catalogue.documents : [];
        if (!documents.length) {
            this.fail('ERR_TOOL_DOC_00003', 'catalogue requires at least one document');
        }
        const identities = new Set();
        const sources = documents.map(document => {
            if (!document || !LOWER_DOCUMENT_IDENTITY.test(document.id || '') || identities.has(document.id)) {
                this.fail('ERR_TOOL_DOC_00004', 'document identities must be unique stable lowercase codes');
            }
            identities.add(document.id);
            this.validateDocumentMetadata(document, catalogue, request);
            const content = this.relativePath(document.content, document.id + '.content');
            if (!content.startsWith(sourceDirectory + '/pages/') || !content.endsWith('.md')) {
                this.fail('ERR_TOOL_DOC_00002', document.id + ' source must be Markdown below ' + sourceDirectory + '/pages');
            }
            const sourcePath = this.containedPath(root, content, document.id + '.content');
            if (!fs.existsSync(sourcePath) || !fs.statSync(sourcePath).isFile()) {
                this.fail('ERR_TOOL_DOC_00005', document.id + ' source does not exist');
            }
            if (request && request.validateContentQuality) {
                this.validateContentQuality(document, fs.readFileSync(sourcePath, 'utf8'), request);
            }
            return Object.freeze({ id: document.id, relativePath: content, absolutePath: sourcePath });
        });
        this.validateCatalogueIntegrity(catalogue, request);
        return Object.freeze({ pack: catalogue.pack, version: catalogue.version, cataloguePath: cataloguePath, sourceDirectory: sourceDirectory, documents: Object.freeze(sources) });
    },

    /** Validates generated data hashes and returns the aggregate release checksum. */
    releaseChecksum: function (generatedHashes) {
        const entries = Object.entries(generatedHashes || {});
        if (!entries.length) {
            this.fail('ERR_TOOL_DOC_00006', 'documentation release requires generated files');
        }
        entries.forEach(([fileName, checksum]) => {
            const relative = this.relativePath(fileName, 'generated file');
            if (!(/^(init|core|sample)-v\d{3}(\/[A-Za-z0-9._-]+)*\/(headers|records)\//.test(relative) ||
                relative.startsWith('core/data/') || relative.startsWith('core/headers/')) ||
                !/^[a-f0-9]{64}$/.test(checksum || '')) {
                this.fail('ERR_TOOL_DOC_00006', 'generated documentation files require governed data paths and SHA-256 checksums');
            }
        });
        return this.sha256(entries.sort(([left], [right]) => left.localeCompare(right)).map(([fileName, checksum]) => fileName + ':' + checksum).join('|'));
    },

    /** Builds the shared immutable application-documentation manifest contract. */
    buildReleaseSection: function (request) {
        const section = {
            kind: 'CONTENT_PACK',
            contentPath: this.relativePath(request.contentPath, 'contentPath'),
            pack: request.catalogue.pack,
            version: request.catalogue.version,
            owningDomain: request.owningDomain,
            lifecycle: 'PUBLISHABLE',
            destinationRole: 'WCMS_STAGED',
            environmentScope: request.environmentScope || ['ALL'],
            sensitivity: request.sensitivity || 'PUBLIC',
            versioningPolicy: 'IMMUTABLE',
            publicationPolicy: 'REQUIRED',
            initialPublicationPolicy: 'ADMIN_INITIATED',
            installationPolicy: 'OPTIONAL_AXIS_INITIATED',
            removalPolicy: 'UNPUBLISH_OR_RETIRE',
            sourceMode: 'catalogue-markdown-source',
            sourceAuthority: this.relativePath(request.sourceAuthority, 'sourceAuthority'),
            sites: request.sites,
            accessMode: request.accessMode || 'PUBLIC',
            pages: request.pages,
            components: request.components,
            routes: request.routes,
            releaseChecksum: this.releaseChecksum(request.generatedHashes),
            generatedHashes: request.generatedHashes
        };
        if (request.migrationRegister) {
            section.migrationRegister = this.relativePath(request.migrationRegister, 'migrationRegister');
        }
        return this.validateReleaseSection(section);
    },

    /** Validates the shared publication and installation invariants. */
    validateReleaseSection: function (section) {
        if (!section || section.kind !== 'CONTENT_PACK' || section.lifecycle !== 'PUBLISHABLE' || section.destinationRole !== 'WCMS_STAGED' ||
            section.versioningPolicy !== 'IMMUTABLE' || section.publicationPolicy !== 'REQUIRED' || section.initialPublicationPolicy !== 'ADMIN_INITIATED' ||
            section.installationPolicy !== 'OPTIONAL_AXIS_INITIATED' || section.removalPolicy !== 'UNPUBLISH_OR_RETIRE') {
            this.fail('ERR_TOOL_DOC_00007', 'application documentation must be optional Axis-installed, immutable Staged content requiring publication');
        }
        if (typeof section.sourceAuthority !== 'string' || !section.sourceAuthority ||
            section.sourceAuthority === 'data' || section.sourceAuthority.startsWith('data/')) {
            this.fail('ERR_TOOL_DOC_00002', 'authored documentation source must remain outside generated/runtime data');
        }
        if (!Array.isArray(section.sites) || !section.sites.length || !Number.isInteger(section.pages) || section.pages < 1 ||
            !Number.isInteger(section.components) || section.components < 1 || !Number.isInteger(section.routes) || section.routes < 1) {
            this.fail('ERR_TOOL_DOC_00007', 'application documentation release counts and Site ownership are incomplete');
        }
        if (section.releaseChecksum !== this.releaseChecksum(section.generatedHashes)) {
            this.fail('ERR_TOOL_DOC_00006', 'application documentation release checksum is inconsistent');
        }
        return Object.freeze(section);
    }
};
