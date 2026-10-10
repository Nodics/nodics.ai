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
const releasePolicy = require('../../../nData/nImport/import/src/service/release/defaultDataReleaseService');
const contentPack = require('../../../nData/nImport/import/src/service/contentPack/defaultContentPackService');

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
    /** Reads documentation from the same governed CMS records that nImport consumes. */
    readDataCatalogue: function (ownerRoot, sectionName) {
        const root = path.resolve(ownerRoot);
        const release = this.readDocumentationRelease(root, sectionName);
        const section = release.manifest;
        if (!section || section.sourceMode !== 'cms-records') this.fail('ERR_TOOL_DOC_00002', 'Documentation requires module-owned CMS records');
        const components = this.readReleaseRecords(release, 'Component');
        const metadata = this.readReleaseRecords(release, 'PageMetadata');
        const routes = this.readReleaseRecords(release, 'Route').records;
        const product = this.readReleaseRecords(release, 'Product').records[0];
        const navigation = components.records.find(item => item.renderer === 'documentation.component.navigation');
        if (!product || !product.publicRootPath || !navigation || !navigation.properties) this.fail('ERR_TOOL_DOC_00005', 'Documentation requires product and navigation records');
        const items = navigation && navigation.properties && navigation.properties.items || [];
        const documents = metadata.records.map(page => {
            const component = components.records.find(item => item.code === page.articleComponent);
            if (!component || !Array.isArray(component.properties && component.properties.blocks)) this.fail('ERR_TOOL_DOC_00005', 'Missing documentation component: ' + page.documentId);
            const properties = component.properties;
            const origin = components.origins.get(component.code);
            const item = items.find(entry => entry.code === page.documentId) || {};
            const source = properties.source || {};
            return Object.assign({}, properties, {
                id: page.documentId, recordCode: page.documentId, title: page.title,
                functionalModule: source.functionalModule || page.ownerFunctionalModule,
                technicalModule: source.technicalModule || page.technicalModule,
                sourceOwner: source.owner || page.ownerFunctionalModule,
                content: origin.file, sourcePath: origin.file, ownerRoot: origin.root,
                locale: properties.locale || item.locale || 'en',
                slug: properties.slug || page.documentId.replace(/\./g, '-'),
                navigationSection: item.sectionTitle || properties.sectionTitle,
                navigationSectionCode: item.section || properties.section,
                navigationSectionOrder: item.sectionOrder,
                navigationGroup: properties.navigationGroup || item.groupTitle || properties.groupTitle,
                navigationGroupCode: properties.navigationGroupCode || item.group || properties.group,
                navigationGroupOrder: properties.navigationGroupOrder ?? item.groupOrder,
                navigationOrder: item.order ?? properties.navigationOrder,
                body: (properties.blocks[0] && properties.blocks[0].kind === 'heading' && properties.blocks[0].level === 1 ? '' : '# ' + page.title + '\n\n') + this.documentationText(properties.blocks),
                componentCode: component.code,
                routePath: (routes.find(route => route.code === page.targetRoute) || {}).path
            });
        });
        return {
            contract: 'nodics.documentation/v1', pack: section.pack,
            release: section.version, version: section.version, sourceMode: 'cms-records',
            title: product.name, navigationSections: navigation.properties.sections,
            publication: { sectionCode: product.publicRootPath.split('/').pop(), routeRoot: product.publicRootPath, publicRootPath: product.publicRootPath, contentPath: section.contentPath },
            documents, releaseComposition: release,
            pages: documents.map(document => Object.assign({}, document, { code: document.slug, source: document.content, evidence: (document.sourceEvidence || [])[0] }))
        };
    },

    /** Reuses the import source resolver for explicit offline documentation selections. */
    documentationSourceService: function (ownerRoot) {
        const root = path.resolve(ownerRoot);
        return Object.assign({}, contentPack, {
            resolveRepositoryPath(source) {
                if (source.type === 'LOCAL_PROJECT') return root;
                if (source.type !== 'LOCAL_SIBLING' || !/^[A-Za-z0-9._-]+$/.test(source.repositoryName || '')) throw new Error('Invalid documentation repository');
                for (let directory = root; ; directory = path.dirname(directory)) {
                    for (const candidate of [directory, path.join(directory, source.repositoryName)]) {
                        const file = path.join(candidate, 'package.json');
                        if (fs.existsSync(file) && JSON.parse(fs.readFileSync(file, 'utf8')).name === source.repositoryName) return candidate;
                    }
                    if (path.dirname(directory) === directory) break;
                }
                throw new Error('Documentation repository is unavailable: ' + source.repositoryName);
            }
        });
    },

    /** Resolves explicit composition with the same containment and checksum authority as runtime import. */
    readDocumentationRelease: function (ownerRoot, sectionName) {
        const root = path.resolve(ownerRoot);
        const manifest = JSON.parse(fs.readFileSync(path.join(root, 'data/manifest.json'), 'utf8'));
        const section = manifest.sections && manifest.sections[sectionName || 'documentation'];
        if (!section) this.fail('ERR_TOOL_DOC_00002', 'Documentation manifest section is missing');
        const service = this.documentationSourceService(root);
        return service.inspectRelease({ enabled: true, configuration: { allowedContractVersions: [0, 1, 2] },
            pack: { manifestPack: section.pack }, source: { type: 'LOCAL_PROJECT', manifestPath: 'data/manifest.json', manifestSection: sectionName || 'documentation' } });
    },

    /** Validates declared reference catalogues without adding their records or assets to import composition. */
    validateReferenceCatalogues: function (ownerRoot, section, catalogue) {
        if (section.referenceCatalogues === undefined) return false;
        const references = section.referenceCatalogues;
        if (!Array.isArray(references) || !references.length || references.length > 16)
            this.fail('ERR_TOOL_DOC_00011', 'Documentation reference catalogues require a bounded explicit selection');
        const resolver = this.documentationSourceService(ownerRoot);
        const documents = new Map(catalogue.documents.map(document => [document.id, document]));
        const selected = new Set();
        for (const reference of references) {
            const source = reference && reference.source;
            if (!source || typeof reference.manifestPack !== 'string' || !reference.manifestPack ||
                typeof source.manifestPath !== 'string' || !/(^|\/)data\/manifest\.json$/.test(source.manifestPath) ||
                typeof source.manifestSection !== 'string' || !source.manifestSection)
                this.fail('ERR_TOOL_DOC_00011', 'Documentation reference catalogue identity is invalid');
            const repository = resolver.resolveRepositoryPath(source);
            const manifestPath = this.containedPath(repository, source.manifestPath, 'Documentation reference catalogue');
            const identity = manifestPath + '#' + source.manifestSection;
            if (selected.has(identity)) this.fail('ERR_TOOL_DOC_00011', 'Documentation reference catalogue is duplicated');
            selected.add(identity);
            const target = this.readDataCatalogue(path.dirname(path.dirname(manifestPath)), source.manifestSection);
            if (target.pack !== reference.manifestPack)
                this.fail('ERR_TOOL_DOC_00011', 'Documentation reference catalogue pack does not match');
            for (const document of target.documents) {
                const existing = documents.get(document.id);
                if (existing && (existing.ownerRoot !== document.ownerRoot || existing.content !== document.content ||
                    existing.sourceOwner !== document.sourceOwner || existing.routePath !== document.routePath ||
                    JSON.stringify(existing.blocks) !== JSON.stringify(document.blocks)))
                    this.fail('ERR_TOOL_DOC_00011', 'Documentation reference catalogue has conflicting canonical identities');
                documents.set(document.id, existing || document);
            }
        }
        this.validateReferenceGraph([{ documents: [...documents.values()] }]);
        return true;
    },

    /** Reads each canonical file once, preserving the physical owner for content and asset validation. */
    readReleaseRecords: function (release, suffix) {
        const records = [], origins = new Map(), files = new Set();
        const visit = selected => {
            (selected.children || []).forEach(visit);
            for (const relative of Object.keys(selected.manifest.generatedHashes)) {
                if (!relative.endsWith(suffix + 'Data.js')) continue;
                const absolute = path.join(selected.fileRoot, relative);
                if (files.has(absolute)) continue;
                files.add(absolute);
                delete require.cache[require.resolve(absolute)];
                for (const record of Object.values(require(absolute))) {
                    if (origins.has(record.code)) this.fail('ERR_TOOL_DOC_00011', 'Duplicate canonical ' + suffix + ': ' + record.code);
                    records.push(record);
                    origins.set(record.code, { root: path.dirname(selected.fileRoot), file: 'data/' + relative, release: selected });
                }
            }
        };
        visit(release);
        return { records, origins };
    },

    /** Validates references across explicitly selected owner catalogues without importing or activating any pack. */
    validateReferenceGraph: function (catalogues) {
        if (!Array.isArray(catalogues) || !catalogues.length) this.fail('ERR_TOOL_DOC_00011', 'Select documentation catalogues for reference validation');
        const documents = new Map();
        const routes = new Map();
        const edges = [];
        for (const catalogue of catalogues) {
            for (const document of catalogue.documents || []) {
                if (documents.has(document.id)) this.fail('ERR_TOOL_DOC_00011', 'Duplicate canonical document: ' + document.id);
                const entry = { document, pack: catalogue.pack };
                documents.set(document.id, entry);
                if (document.routePath) {
                    if (routes.has(document.routePath)) this.fail('ERR_TOOL_DOC_00011', 'Duplicate canonical documentation route: ' + document.routePath);
                    routes.set(document.routePath, entry);
                }
            }
        }
        for (const { document, pack } of documents.values()) {
            for (const id of document.relatedPages || []) {
                const target = documents.get(id);
                if (!target) this.fail('ERR_TOOL_DOC_00011', document.id + ' references unavailable canonical document ' + id);
                edges.push({ from: document.id, to: id, sourcePack: pack, targetPack: target.pack });
            }
            for (const reference of document.references || []) {
                const target = documents.get(reference.documentId);
                if (!target || reference.owner !== target.document.sourceOwner) this.fail('ERR_TOOL_DOC_00011', document.id + ' has an unresolved or incorrectly owned reference');
                if (reference.anchor && !(target.document.headings || []).some(heading => heading.anchor === reference.anchor)) this.fail('ERR_TOOL_DOC_00011', document.id + ' references unknown section anchor ' + reference.anchor);
                edges.push({ from: document.id, to: target.document.id, sourcePack: pack, targetPack: target.pack, anchor: reference.anchor });
            }
        }
        return { documents: documents.size, routes: routes.size, edges };
    },

    /** Loads one declared canonical CMS record family, without retaining a stale require cache. */
    readDataRecords: function (root, files, suffix) {
        const matches = files.filter(name => name.endsWith(suffix + 'Data.js'));
        if (matches.length !== 1) this.fail('ERR_TOOL_DOC_00005', 'Expected one documentation record file: ' + suffix);
        const absolute = this.containedPath(root, 'data/' + matches[0], suffix);
        delete require.cache[require.resolve(absolute)];
        return { file: 'data/' + matches[0], records: Object.values(require(absolute)) };
    },

    /** Builds a transient text projection for depth/search checks; it is never an authored file. */
    documentationText: function (blocks) {
        return blocks.map(block => {
            if (block.kind === 'heading') return '#'.repeat(block.level) + ' ' + block.text;
            if (block.kind === 'code' || block.kind === 'diagram') return '```' + (block.language || (block.kind === 'diagram' ? 'mermaid' : '')) + '\n' + block.text + '\n```';
            if (block.kind === 'image') return '![' + (block.alt || block.title || 'Documentation image') + '](media:' + block.mediaCode + ')';
            if (block.kind === 'table') return ['| ' + block.headers.join(' | ') + ' |', '| ' + block.headers.map(() => '---').join(' | ') + ' |', ...block.rows.map(row => '| ' + row.join(' | ') + ' |')].join('\n');
            if (block.kind === 'ordered-list' || block.kind === 'unordered-list') return block.items.map((item, index) => (block.kind === 'ordered-list' ? (index + 1) + '. ' : '- ') + item).join('\n');
            return block.text || '';
        }).join('\n\n') + '\n';
    },

    /** Checks record bytes, local Media assets and CMS content without rewriting canonical records. */
    validateDataRelease: function (ownerRoot, sectionName) {
        const root = path.resolve(ownerRoot);
        const manifest = JSON.parse(fs.readFileSync(path.join(root, 'data/manifest.json'), 'utf8'));
        const section = manifest.sections[sectionName || 'documentation'];
        this.validateReleaseSection(section);
        const mediaRecords = [];
        for (const [file, hash] of Object.entries(section.generatedHashes)) {
            const absolute = this.containedPath(root, 'data/' + file, 'Documentation release file');
            if (this.sha256(fs.readFileSync(absolute)) !== hash) this.fail('ERR_TOOL_DOC_00006', 'Documentation checksum mismatch: ' + file);
        }
        const catalogue = this.readDataCatalogue(root, sectionName);
        const qualifiedReferences = this.validateReferenceCatalogues(root, section, catalogue);
        this.validateCatalogue({ ownerRoot: root, manifestSection: sectionName || 'documentation', catalogue, allowExternalReferences: !!section.includes || qualifiedReferences, requireNavigationSections: true, requireEnterpriseMetadata: true, validateContentQuality: true });
        const localDocuments = catalogue.documents.filter(document => document.ownerRoot === root);
        if (section.pages !== localDocuments.length) this.fail('ERR_TOOL_DOC_00005', 'Documentation page count does not match local CMS records');
        const mediaFamily = this.readReleaseRecords(catalogue.releaseComposition, 'Media');
        mediaRecords.push(...mediaFamily.records);
        for (const document of catalogue.documents) {
            for (const block of document.blocks.filter(item => item.kind === 'image')) {
                const media = mediaRecords.find(item => item.code === block.mediaCode);
                if (!media || !media.asset || !/^[A-Za-z0-9][A-Za-z0-9_.-]{0,159}$/.test(block.mediaCode || '') || block.source || !block.alt) this.fail('ERR_TOOL_DOC_00005', 'Documentation image requires a declared Media identity and alt text: ' + document.id);
                const origin = mediaFamily.origins.get(media.code);
                const selected = origin.release;
                const file = this.containedPath(origin.root, 'data/' + selected.manifest.contentPath + '/' + media.asset.sourceFile, 'Documentation image');
                const relative = path.relative(selected.fileRoot, file).replace(/\\/g, '/');
                if (!selected.manifest.generatedHashes[relative] || !fs.existsSync(file)) this.fail('ERR_TOOL_DOC_00005', 'Documentation image asset is not declared: ' + relative);
                if (media.asset.checksum && media.asset.checksum !== selected.manifest.generatedHashes[relative]) this.fail('ERR_TOOL_DOC_00006', 'Documentation Media checksum does not match its asset: ' + block.mediaCode);
            }
        }
        return catalogue;
    },
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
        if (fs.existsSync(resolved)) {
            const realOwner = fs.realpathSync(owner);
            const realPath = fs.realpathSync(resolved);
            if (realPath !== realOwner && !realPath.startsWith(realOwner + path.sep)) this.fail('ERR_TOOL_DOC_00001', label + ' escapes its owning module through a symlink');
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
                if (!ids.has(relatedPage) && !options.allowExternalReferences) {
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
            if (!documentsBySection.has(section.code) && !options.allowExternalReferences) {
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
        if (request && request.catalogue && request.catalogue.sourceMode === 'cms-records') {
            const catalogue = request.catalogue;
            this.validateNavigationSections(catalogue, request);
            const identities = new Set();
            let composedFiles;
            const documents = catalogue.documents.map(document => {
                if (!LOWER_DOCUMENT_IDENTITY.test(document.id || '') || identities.has(document.id)) this.fail('ERR_TOOL_DOC_00004', 'Document identities must be unique stable lowercase codes');
                identities.add(document.id);
                this.validateDocumentMetadata(document, catalogue, request);
                const documentRoot = path.resolve(document.ownerRoot || root);
                if (documentRoot !== root && !composedFiles) {
                    composedFiles = new Set();
                    const collect = selected => {
                        Object.keys(selected.manifest.generatedHashes).forEach(file => composedFiles.add(path.join(selected.fileRoot, file)));
                        (selected.children || []).forEach(collect);
                    };
                    collect(this.readDocumentationRelease(root, request.manifestSection));
                }
                const absolute = this.containedPath(documentRoot, document.content, document.id);
                if (documentRoot !== root && !composedFiles.has(absolute)) this.fail('ERR_TOOL_DOC_00001', 'Documentation owner is not in the selected composition');
                if (!/^data\/(docs|init|core|sample|project)-v\d{3}\/records\/documentation\/.+\.js$/.test(document.content) || !fs.existsSync(absolute)) this.fail('ERR_TOOL_DOC_00002', 'Documentation content must be module-owned CMS data');
                if (request.validateContentQuality) this.validateContentQuality(document, document.body, request);
                return { id: document.id, relativePath: document.content, absolutePath: absolute };
            });
            if (!documents.length) this.fail('ERR_TOOL_DOC_00003', 'Documentation requires at least one CMS page');
            this.validateCatalogueIntegrity(catalogue, request);
            return Object.freeze({ pack: catalogue.pack, version: catalogue.version, cataloguePath: 'data/manifest.json', sourceDirectory: 'data', documents });
        }
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
            if (!(/^(docs|init|core|sample|project)-v\d{3}(\/[A-Za-z0-9._-]+)*\/(headers|records|assets)\//.test(relative) ||
                relative.startsWith('core/data/') || relative.startsWith('core/headers/')) ||
                !/^[a-f0-9]{64}$/.test(checksum || '')) {
                this.fail('ERR_TOOL_DOC_00006', 'generated documentation files require governed data paths and SHA-256 checksums');
            }
        });
        return this.sha256(entries.sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0).map(([fileName, checksum]) => fileName + ':' + checksum).join('|'));
    },

    /**
     * Checks a complete documentation generation plan before any output is written.
     * @param {Object|null} previous Existing manifest section, when present.
     * @param {Object} next Proposed section with generated checksums.
     * @returns {Object} Validated proposed section; throws on identity, version or immutable path reuse.
     */
    validateGeneration: function (previous, next) {
        this.validateReleaseSection(next);
        if (!previous) return next;
        this.validateReleaseSection(previous);
        if (previous.pack !== next.pack || previous.owningDomain !== next.owningDomain) {
            this.fail('ERR_TOOL_DOC_00007', 'Documentation owner changes require an explicit migration');
        }
        if (releasePolicy.isDevelopmentRelease(previous.version)) return next;
        if (!SEMVER.test(previous.version) || !SEMVER.test(next.version) ||
            releasePolicy.compareVersions(next.version, previous.version) < 0) {
            this.fail('ERR_TOOL_DOC_00006', 'Documentation release versions must not move backwards');
        }
        if (previous.version === next.version && previous.releaseChecksum !== next.releaseChecksum) {
            this.fail('ERR_TOOL_DOC_00006', 'Immutable documentation release changed; select a forward version and a new publication.contentPath');
        }
        for (const [file, checksum] of Object.entries(next.generatedHashes)) {
            if (previous.generatedHashes[file] && previous.generatedHashes[file] !== checksum) {
                this.fail('ERR_TOOL_DOC_00006', 'Immutable documentation path would be overwritten: ' + file);
            }
        }
        return next;
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
            sourceMode: request.sourceMode || request.catalogue.sourceMode || 'catalogue-markdown-source',
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
        if (section.sourceMode === 'cms-records') {
            if (section.sourceAuthority !== 'data/' + section.contentPath + '/records/documentation') this.fail('ERR_TOOL_DOC_00002', 'Documentation source must be its governed CMS record directory');
        } else if (typeof section.sourceAuthority !== 'string' || !section.sourceAuthority ||
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
