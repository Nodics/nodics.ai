/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module nTooling/test/documentationOwnershipComposition @description Verifies canonical module ownership, optional composition and independently selected documentation staging. @layer test @owner nTooling */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const contract = require('../src/service/defaultApplicationDocumentationContractService');
const importer = require('../../nData/nImport/import/src/service/contentPack/defaultContentPackService');
const framework = path.resolve(__dirname, '../../../..');
const docs = path.join(framework, 'nodics.docs');

test('the full library composes canonical capability records rather than retaining central copies', () => {
    const catalogue = contract.validateDataRelease(docs);
    assert.equal(catalogue.documents.length, 176);
    assert.equal(catalogue.documents.filter(document => document.ownerRoot === docs).length, 29);
    assert.equal(fs.existsSync(path.join(framework, 'nodics.foundation/modules/nSetup/data')), false);
    for (const document of catalogue.documents) {
        const metadata = JSON.parse(fs.readFileSync(path.join(document.ownerRoot, 'package.json')));
        assert.equal(document.sourceOwner, metadata.name, document.id);
        assert(metadata.nodics.owns.includes('data'), document.id + ': undeclared data ownership');
        assert.equal(document.functionalModule, path.relative(framework, document.ownerRoot).split(path.sep)[0], document.id);
        for (const reference of document.references || []) assert(reference.owner, document.id);
    }
    assert.equal(contract.validateReferenceGraph([catalogue]).documents, 176);
    const headerNames = new Set(), headerFiles = new Set();
    const inspectHeaders = selection => {
        (selection.children || []).forEach(inspectHeaders);
        for (const file of Object.keys(selection.manifest.generatedHashes).filter(file => file.includes('/headers/') && file.endsWith('.js'))) {
            const absolute = path.join(selection.fileRoot, file);
            if (headerFiles.has(absolute)) continue;
            headerFiles.add(absolute);
            for (const headers of Object.values(require(absolute))) {
                for (const name of Object.keys(headers)) {
                    assert(!headerNames.has(name), 'Combined documentation import header collision: ' + name);
                    headerNames.add(name);
                }
            }
        }
    };
    inspectHeaders(catalogue.releaseComposition);
    const media = contract.readReleaseRecords(catalogue.releaseComposition, 'Media');
    assert.equal(media.records.length, 54);
    const metadata = contract.readReleaseRecords(catalogue.releaseComposition, 'PageMetadata');
    const nodes = contract.readReleaseRecords(catalogue.releaseComposition, 'Node');
    for (const node of nodes.records.filter(node => node.nodeLevel === 'PAGE_LINK')) {
        assert.equal(nodes.origins.get(node.code).root, metadata.origins.get(node.targetDocumentationPage).root, node.code);
    }
    const families = Object.fromEntries(['Component', 'Page', 'Route', 'SearchMetadata', 'PublicationState'].map(suffix =>
        [suffix, contract.readReleaseRecords(catalogue.releaseComposition, suffix)]));
    for (const page of metadata.records) {
        const owner = metadata.origins.get(page.code).root;
        for (const [family, key] of [['Component', 'articleComponent'], ['Page', 'targetPage'], ['Route', 'targetRoute']]) {
            assert.equal(families[family].origins.get(page[key]).root, owner, page.documentId + ': ' + family);
        }
        const article = families.Component.records.find(record => record.code === page.articleComponent);
        const search = families.SearchMetadata.records.find(record => record.targetType === 'PAGE' && record.targetCode === page.code);
        assert.equal(search.searchText, article.properties.searchText, page.documentId + ': stale search projection');
    }
    const circa = catalogue.documents.find(document => document.id === 'accelerators.circa-overview');
    assert.match(circa.body, /implementing `eWaste` module owns/);
    assert.doesNotMatch(circa.body, /`nodics\.docs` owns this framework product guide/);
    const axis = contract.readDataCatalogue(path.join(framework, 'nodics.platform/modules/axis'));
    for (const id of ['axis.overview', 'axis.documentation-content']) {
        const guide = axis.documents.find(document => document.id === id);
        assert.match(guide.body, /implementing module|Implementing capability modules/);
        assert.doesNotMatch(guide.body, /framework documentation belongs to `nodics\.docs`/);
    }
    const targetOrigins = new Map([...metadata.origins, ...nodes.origins,
        ...families.Component.origins, ...families.Page.origins, ...families.Route.origins]);
    for (const family of ['SearchMetadata', 'PublicationState']) for (const record of families[family].records) {
        const target = targetOrigins.get(record.targetCode);
        if (target) assert.equal(families[family].origins.get(record.code).root, target.root, record.code);
    }
});

test('module-only selection stages its articles and shared foundation without unrelated guides or business data', t => {
    const owner = path.join(framework, 'nodics.accelerators/modules/electronics/modules/electronicsProduct');
    const catalogue = contract.validateDataRelease(owner);
    assert.equal(catalogue.documents.length, 30);
    assert(catalogue.documents.some(document => document.id === 'accelerators.agora-electronics-product-semantics'));
    assert(!catalogue.documents.some(document => document.id === 'accelerators.agora-apparel-product-data-authoring'));
    assert(!catalogue.documents.some(document => document.id === 'wcms.media-import-publication'));
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-docs-composition-'));
    t.after(() => fs.rmSync(root, { recursive: true, force: true }));
    global.NODICS = { getServerPath: () => root, getNodicsHome: () => path.join(framework, 'nodics.foundation') };
    global.CONFIG = { get: () => ({ dataDirName: 'temp' }) };
    const service = Object.assign({}, importer);
    const context = { enabled: true, configuration: { allowedContractVersions: [2] }, pack: { manifestPack: 'electronicsProduct' },
        source: { type: 'LOCAL_SIBLING', repositoryName: 'nodics.ai', manifestPath: path.relative(framework, path.join(owner, 'data/manifest.json')), manifestSection: 'documentation' } };
    const staged = service.prepareStaging(context, service.inspectRelease(context), 'selected');
    const files = fs.readdirSync(path.join(staged.inputPath, 'records/documentation'));
    assert(files.includes('electronicsProductDocumentationComponentData.js'));
    assert(files.includes('nodicsDocumentationComponentData.js'));
    assert(!files.includes('apparelProductDocumentationComponentData.js'));
    assert(!fs.existsSync(path.join(staged.inputPath, 'core-v001')));
    assert(!fs.existsSync(path.join(staged.inputPath, 'sample-v001')));
});

test('Commerce workflow guides are canonical optional packs and never pull business records or reference-only articles into staging', t => {
    const selections = [
        ['promotion', 'nodics.commerce/modules/baseCommerce/modules/promotion', 'promotion.campaigns-coupon-issuance'],
        ['cart', 'nodics.commerce/modules/checkout/modules/cart', 'cart.customer-intent-calculation'],
        ['digitalCore', 'nodics.commerce/modules/digitalCommerce/modules/digitalCore', 'digital.purchase-delivery-reveal']
    ];
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-commerce-docs-'));
    t.after(() => fs.rmSync(root, { recursive: true, force: true }));
    global.NODICS = { getServerPath: () => root, getNodicsHome: () => path.join(framework, 'nodics.foundation') };
    global.CONFIG = { get: () => ({ dataDirName: 'temp' }) };
    for (const [pack, relative, id] of selections) {
        const owner = path.join(framework, relative), catalogue = contract.validateDataRelease(owner);
        assert.equal(catalogue.documents.filter(document => document.ownerRoot === owner).length, 1);
        assert(catalogue.documents.some(document => document.id === id));
        assert.equal(catalogue.documents.length, 30);
        for (const [, , other] of selections) if (other !== id)
            assert(!catalogue.documents.some(document => document.id === other), id + ': validation references became imported content');
        const context = { enabled: true, configuration: { allowedContractVersions: [2] }, pack: { manifestPack: pack },
            source: { type: 'LOCAL_SIBLING', repositoryName: 'nodics.ai', manifestPath: relative + '/data/manifest.json', manifestSection: 'documentation' } };
        const service = Object.assign({}, importer), release = service.inspectRelease(context);
        const staged = service.prepareStaging(context, release, pack);
        const files = fs.readdirSync(path.join(staged.inputPath, 'records/documentation'));
        assert(files.includes(pack + 'DocumentationComponentData.js'));
        assert(files.includes('nodicsDocumentationComponentData.js'));
        assert(!fs.existsSync(path.join(staged.inputPath, 'sample-v001')));
        assert(!fs.existsSync(path.join(staged.inputPath, 'core-v001')));
        for (const [other] of selections) if (other !== pack)
            assert(!files.includes(other + 'DocumentationComponentData.js'));
    }
});

test('source-reviewed guides are staged with usable routes and no fabricated Online receipt', () => {
    const reviews = ['a', 'b'].flatMap(group => {
        const evidence = JSON.parse(fs.readFileSync(path.join(docs,
            'test/evidence/draft-editorial-review-' + group + '-2026-10-07.json')));
        return evidence.reviews.map(review => group === 'a' ? { ...review,
            approved: evidence.staging.processApproved,
            status: evidence.staging.authoringLifecycleState + '_NOT_APPROVED',
            sourceFiles: review.sourceEvidence } : review);
    });
    assert.equal(reviews.length, 14);
    for (const relative of ['nodics.accelerators/modules/electronics/modules/electronicsProduct', 'nodics.accelerators/modules/telco/modules/telcoSubscription',
        'nodics.copilot/modules/copilotProviders/modules/copilotProvider', 'nodics.copilot/modules/copilotEvaluation',
        'nodics.rulesEngine/modules/rulesEvaluation', 'nodics.waste/modules/wasteMaterial',
        'nodics.location/modules/locationApproval', 'nodics.location/modules/locationDraft',
        'nodics.location/modules/locationProjection', 'nodics.location/modules/locationSearch',
        'nodics.location/modules/locationType', 'nodics.location/modules/locationMap',
        'nodics.wcms/modules/wcmsExperience', 'nodics.foundation/modules/nCache/redisCache']) {
        const root = path.join(framework, relative), catalogue = contract.validateDataRelease(root);
        const documents = catalogue.documents.filter(document => document.ownerRoot === root);
        assert.equal(documents.length, 1);
        assert.equal(documents[0].lifecycleState, 'STAGED');
        const review = reviews.find(entry => entry.documentId === documents[0].id);
        assert(review, documents[0].id + ': source review required');
        assert.equal(review.approved, false);
        assert.equal(review.status, 'STAGED_NOT_APPROVED');
        assert(review.sourceFiles.length > 0);
        const routes = contract.readReleaseRecords(catalogue.releaseComposition, 'Route').records;
        assert.equal(routes.find(route => route.path === documents[0].routePath).active, true);
        const states = contract.readReleaseRecords(catalogue.releaseComposition, 'PublicationState');
        for (const state of states.records.filter(state => states.origins.get(state.code).root === root)) {
            assert.equal(state.lifecycleState, 'STAGED');
            assert.equal(state.onlineVersion, undefined);
            assert.equal(state.approver, '');
        }
    }
});

test('reviewed Circa reference guides remain independently staged without manufacturing approval', () => {
    const owner = path.join(framework, 'nodics.accelerators/modules/waste/modules/eWaste');
    const catalogue = contract.validateDataRelease(owner, 'referenceDocumentation');
    const evidence = JSON.parse(fs.readFileSync(path.join(docs, 'test/evidence/circa-editorial-review-2026-10-07.json')));
    assert.equal(catalogue.documents.length, 4);
    assert.equal(evidence.guides.length, 4);
    assert.equal(evidence.evidenceBoundary.processApprovalPerformed, false);
    const product = contract.readReleaseRecords(catalogue.releaseComposition, 'Product').records;
    assert.equal(product.length, 1);
    assert.equal(product[0].ownerFunctionalModule, 'nodics.accelerators');
    assert.equal(product[0].lifecycleState, 'STAGED');
    assert.doesNotMatch(product[0].description, /Project-owned|customer workspace/);
    for (const family of ['Navigation', 'Dashboard']) {
        const records = contract.readReleaseRecords(catalogue.releaseComposition, family).records;
        assert(records.length > 0);
        assert(!JSON.stringify(records).includes('"lifecycleState":"DRAFT"'), family);
    }
    const routes = contract.readReleaseRecords(catalogue.releaseComposition, 'Route').records;
    for (const document of catalogue.documents) {
        assert.equal(document.sourceOwner, 'eWaste');
        assert.equal(document.lifecycleState, 'STAGED');
        assert.equal(routes.find(route => route.path === document.routePath).active, true);
        const review = evidence.guides.find(guide => guide.documentId === document.id);
        assert.equal(review?.result, 'SOURCE_EDITORIAL_PASS');
        assert(review.sourceEvidence.length > 0);
        assert.doesNotMatch(document.body, /Parent integration|by this task|for this editorial review/);
    }
    for (const state of contract.readReleaseRecords(catalogue.releaseComposition, 'PublicationState').records) {
        assert.equal(state.lifecycleState, 'STAGED');
        assert.equal(state.onlineVersion, undefined);
        assert([undefined, ''].includes(state.approver));
    }
});

test('validation-only reference catalogues qualify owners and anchors without importing their records', () => {
    const owner = path.join(framework, 'nodics.accelerators/modules/waste/modules/eWaste');
    const catalogue = contract.readDataCatalogue(owner, 'referenceDocumentation');
    const section = JSON.parse(fs.readFileSync(path.join(owner, 'data/manifest.json'))).sections.referenceDocumentation;
    assert.equal(section.includes, undefined);
    assert.equal(contract.validateReferenceCatalogues(owner, section, catalogue), true);
    assert.equal(catalogue.documents.length, 4);
    assert(catalogue.documents.every(document => document.ownerRoot === owner));
    const reject = mutate => {
        const changed = structuredClone(section);
        mutate(changed);
        assert.throws(() => contract.validateReferenceCatalogues(owner, changed, catalogue));
    };
    reject(value => value.referenceCatalogues = []);
    reject(value => value.referenceCatalogues.push(value.referenceCatalogues[0]));
    reject(value => value.referenceCatalogues[0].manifestPack = 'foreign.pack');
    reject(value => value.referenceCatalogues[0].source.manifestPath = '../data/manifest.json');
    reject(value => value.referenceCatalogues[0].source.type = 'REMOTE_URL');
    for (const mutation of [reference => reference.owner = 'foreign.owner',
        reference => reference.anchor = 'unknown-anchor', reference => reference.documentId = 'unknown.guide']) {
        const changed = structuredClone(catalogue);
        mutation(changed.documents[0].references[0]);
        assert.throws(() => contract.validateReferenceCatalogues(owner, section, changed));
    }
});

test('explicit source coverage labels schema-only Location boundaries without claiming orchestration', () => {
    const catalogue = contract.validateDataRelease(docs);
    const claimed = catalogue.documents.filter(document => document.sourceCoverage?.length);
    assert.equal(claimed.length, 16);
    assert.equal(claimed.reduce((total, document) => total + document.sourceCoverage.length, 0), 18);
    const checkout = claimed.find(document => document.id === 'commerce.cart-order');
    assert(checkout.sourceCoverage.some(claim => claim.implementationState === 'IMPLEMENTED' &&
        claim.anchors.includes('checkout-physical-digital-branches') &&
        claim.anchors.includes('checkout-placement-recovery-matrix') &&
        claim.anchors.includes('checkout-branch-customization')));
    const schemaOnly = claimed.filter(document => document.sourceCoverage[0].implementationState === 'SCHEMA_DEFINED');
    assert.equal(schemaOnly.length, 5);
    for (const document of schemaOnly) {
        assert.equal(document.implementationState, 'schema-defined');
        assert.equal(document.lifecycleState, 'STAGED');
        assert.match(document.body, /generated/i);
        assert.match(document.body, /not.*workflow|no.*workflow|orchestration.*separately/i);
    }
});

test('a caller-supplied owner root cannot expand the selected catalogue composition', () => {
    const catalogue = contract.readDataCatalogue(docs);
    const document = { ...catalogue.documents[0], ownerRoot: path.join(framework, 'nodics.platform/modules/axis'),
        content: 'data/docs-v001/records/documentation/axisDocumentationComponentData.js' };
    assert.throws(() => contract.validateCatalogue({ ownerRoot: docs, catalogue: { ...catalogue, documents: [document] } }), /not in the selected composition/);
});

test('every explicitly configured documentation selection validates and stages independently of business data', t => {
    const properties = require(path.join(docs, 'config/properties'));
    const selections = Object.entries(properties.data.contentPacks.packs);
    const stagingRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-all-docs-selections-'));
    t.after(() => fs.rmSync(stagingRoot, { recursive: true, force: true }));
    global.NODICS = { getServerPath: () => stagingRoot, getNodicsHome: () => path.join(framework, 'nodics.foundation') };
    global.CONFIG = { get: () => ({ dataDirName: 'temp' }) };
    const service = Object.assign({}, importer);
    assert.equal(selections.length, 66);
    for (const [code, pack] of selections) {
        const owner = path.dirname(path.dirname(path.join(framework, pack.source.manifestPath)));
        contract.validateDataRelease(owner, pack.source.manifestSection);
        const context = { enabled: true, configuration: { allowedContractVersions: [2] }, pack, source: pack.source };
        const release = service.inspectRelease(context);
        const catalogue = contract.readDataCatalogue(owner, pack.source.manifestSection);
        const schemas = require(path.join(framework, 'nodics.wcms/modules/cms/src/schemas/schemas')).cms;
        for (const [suffix, schema] of [['Node', 'cmsDocumentationNode'], ['PageMetadata', 'cmsDocumentationPage']]) {
            for (const row of contract.readReleaseRecords(catalogue.releaseComposition, suffix).records) {
                for (const [field, rule] of Object.entries(schemas[schema].definition)) {
                    if (rule.enum && row[field] !== undefined) {
                        assert(rule.enum.includes(row[field]), code + ': ' + row.code + '.' + field);
                    }
                }
            }
        }
        const staged = service.prepareStaging(context, release, code);
        const declared = new Set();
        const collect = selected => {
            for (const file of Object.keys(selected.manifest.generatedHashes)) {
                declared.add(path.relative(selected.contentPath, path.join(selected.fileRoot, file)));
            }
            (selected.children || []).forEach(collect);
        };
        collect(release);
        const inspect = directory => {
            for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
                const file = path.join(directory, entry.name);
                if (entry.isDirectory()) inspect(file);
                else assert(declared.has(path.relative(staged.inputPath, file)), code + ': undeclared staged file');
            }
        };
        inspect(staged.inputPath);
        assert(!fs.existsSync(path.join(staged.inputPath, 'core-v001')), code);
        assert(!fs.existsSync(path.join(staged.inputPath, 'sample-v001')), code);
        const profile = Object.values(properties.backofficeApplicationInitialization.profiles).find(item => item.contentPackCode === code);
        assert(profile, code + ': missing independent Axis selection');
        const baseline = Object.values(properties.cms.publication.baselines).find(item => item.contentPackCode === code);
        assert(baseline, code + ': missing pack-specific publication baseline');
        assert.equal(baseline.releaseVersion, release.version, code + ': publication version drift');
        assert(release.manifest.sites.includes(baseline.rootCode), code + ': publication site drift');
    }
});

test('composition-only groups own neither business releases nor documentation packs', () => {
    const visit = directory => {
        for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
            if (!entry.isDirectory() || ['node_modules', '.git', 'test', 'llm', 'data'].includes(entry.name)) continue;
            const root = path.join(directory, entry.name), packageFile = path.join(root, 'package.json');
            if (fs.existsSync(packageFile)) {
                const metadata = JSON.parse(fs.readFileSync(packageFile));
                const implemented = metadata.nodics?.owns?.some(owner => ['service', 'pipeline', 'utility', 'schema', 'router'].includes(owner));
                if (metadata.nodics?.kind === 'group' && root !== docs && !implemented) {
                    assert(!fs.existsSync(path.join(root, 'data')), metadata.name + ': grouping-only package owns data');
                    assert(!metadata.nodics.owns.includes('data'), metadata.name + ': grouping-only package declares data ownership');
                }
            }
            visit(root);
        }
    };
    visit(framework);
    const catalogue = contract.validateDataRelease(docs);
    const owners = Object.fromEntries(catalogue.documents.map(document => [document.id, document.sourceOwner]));
    assert.equal(owners['schema.data-modeling-management'], 'database');
    assert.equal(owners['framework.module-loading-service-precedence'], 'config');
    assert.equal(owners['foundation.cache-provider-runbooks'], 'cache');
    assert.equal(owners['foundation.ems-runtime-client-runbook'], 'emsClient');
    assert.equal(owners['commerce.payment-provider-boundaries'], 'paymentCore');
    assert.equal(owners['accelerators.agora-telco-service-journey'], 'telcoSubscription');
    assert.equal(owners['framework.modular-architecture'], 'nodics.docs');
    assert.equal(owners['foundation.module-to-module-communication'], 'nService');
    assert(fs.existsSync(path.join(framework, 'nodics.foundation/modules/nService/src/service/module/defaultModuleService.js')));
});
