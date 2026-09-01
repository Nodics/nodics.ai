/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module cms/test/cmsDocumentationGovernanceService
 * @description Validates CMS-owned Axis documentation authoring, access, render, search, migration, and nPublish handoff contracts.
 * @layer test
 * @owner cms
 * @override Extend when Axis adds executable frontend authoring screens, but preserve CMS content-catalog ownership.
 */
const assert = require('assert');

const service = require('../src/service/documentation/defaultCmsDocumentationGovernanceService');
const routes = require('../src/router/routers').cms.cmsDocumentationGovernance;

function publication(targetType, targetCode) {
    return {
        code: 'pub' + targetType + targetCode,
        targetType,
        targetCode,
        lifecycleState: 'ONLINE',
        workflowRequired: true,
        workflowTriggers: service.WORKFLOW_TRIGGERS[targetType] || ['CONTENT_CHANGE'],
        active: true
    };
}

function search(targetType, targetCode, title, accessMode) {
    return {
        code: 'search' + targetType + targetCode,
        product: 'docsProduct',
        targetType,
        targetCode,
        title,
        summary: title + ' summary',
        searchText: title + ' schema configuration workflow',
        keywords: [title, 'schema', 'workflow'],
        facets: { targetType },
        accessPolicy: accessMode === 'PUBLIC' ? 'publicDocs' : 'authorDocs',
        accessMode,
        lifecycleState: 'ONLINE',
        indexState: 'INDEX_READY',
        active: true
    };
}

function fixture() {
    return {
        products: [{
            code: 'docsProduct',
            name: 'Docs',
            product: 'docsProduct',
            contentCatalog: 'documentationContentCatalog',
            site: 'docsSite',
            publicRootPath: '/docs',
            accessPolicy: 'publicDocs',
            accessMode: 'PUBLIC',
            lifecycleState: 'ONLINE',
            active: true
        }],
        navigation: [{
            code: 'docsNavigation',
            product: 'docsProduct',
            name: 'Docs Navigation',
            accessPolicy: 'publicDocs',
            accessMode: 'PUBLIC',
            lifecycleState: 'ONLINE',
            active: true
        }],
        nodes: [
            {
                code: 'root',
                product: 'docsProduct',
                navigation: 'docsNavigation',
                nodeLevel: 'SECTION',
                nodeType: 'CONTAINER',
                nodeTitle: 'Root',
                nodeSummary: 'Root summary',
                nodeDashboard: 'rootDashboard',
                nodeOrder: 10,
                accessPolicy: 'publicDocs',
                accessMode: 'PUBLIC',
                lifecycleState: 'ONLINE',
                active: true
            },
            {
                code: 'publicPageLink',
                product: 'docsProduct',
                navigation: 'docsNavigation',
                parentNode: 'root',
                nodeLevel: 'PAGE_LINK',
                nodeType: 'PAGE',
                nodeTitle: 'Public Page',
                nodeSummary: 'Public page summary',
                targetDocumentationPage: 'publicPage',
                nodeOrder: 20,
                accessPolicy: 'publicDocs',
                accessMode: 'PUBLIC',
                lifecycleState: 'ONLINE',
                active: true
            },
            {
                code: 'authorPageLink',
                product: 'docsProduct',
                navigation: 'docsNavigation',
                parentNode: 'root',
                nodeLevel: 'PAGE_LINK',
                nodeType: 'PAGE',
                nodeTitle: 'Author Page',
                nodeSummary: 'Author-only page summary',
                targetDocumentationPage: 'authorPage',
                nodeOrder: 30,
                accessPolicy: 'authorDocs',
                accessMode: 'PERMISSION_BASED',
                lifecycleState: 'ONLINE',
                active: true
            }
        ],
        dashboards: [{
            code: 'rootDashboard',
            product: 'docsProduct',
            ownerType: 'SECTION',
            ownerCode: 'root',
            title: 'Root Dashboard',
            summary: 'Dashboard summary',
            contentArea: { intent: 'Guide readers' },
            cards: [],
            accessPolicy: 'publicDocs',
            accessMode: 'PUBLIC',
            lifecycleState: 'ONLINE',
            active: true
        }],
        pages: [
            {
                code: 'publicPage',
                product: 'docsProduct',
                documentId: 'docs.public',
                title: 'Public Page',
                summary: 'Detailed summary',
                businessSummary: 'Business summary',
                technicalSummary: 'Technical summary',
                visualRequirements: ['diagram'],
                diagrams: [],
                visualAssets: [],
                sourcePath: 'docs/public.md',
                sourceChecksum: 'a'.repeat(64),
                ownerFunctionalModule: 'nodics.docs',
                accessPolicy: 'publicDocs',
                accessMode: 'PUBLIC',
                lifecycleState: 'ONLINE',
                active: true
            },
            {
                code: 'authorPage',
                product: 'docsProduct',
                documentId: 'docs.author',
                title: 'Author Page',
                summary: 'Detailed summary',
                businessSummary: 'Business summary',
                technicalSummary: 'Technical summary',
                visualRequirements: ['table'],
                diagrams: [],
                visualAssets: [],
                sourcePath: 'docs/author.md',
                sourceChecksum: 'b'.repeat(64),
                ownerFunctionalModule: 'nodics.docs',
                accessPolicy: 'authorDocs',
                accessMode: 'PERMISSION_BASED',
                lifecycleState: 'ONLINE',
                active: true
            }
        ],
        accessPolicies: [
            {
                code: 'publicDocs',
                targetType: 'PRODUCT',
                targetCode: 'docsProduct',
                accessMode: 'PUBLIC',
                publiclyAvailable: true,
                requiresAuthentication: false,
                lifecycleVisibility: ['ONLINE'],
                active: true
            },
            {
                code: 'authorDocs',
                targetType: 'PRODUCT',
                targetCode: 'docsProduct',
                accessMode: 'PERMISSION_BASED',
                publiclyAvailable: false,
                requiresAuthentication: true,
                allowedPermissions: ['axis.documentation.read'],
                lifecycleVisibility: ['ONLINE'],
                active: true
            }
        ],
        publicationStates: [
            publication('PRODUCT', 'docsProduct'),
            publication('NAVIGATION', 'docsNavigation'),
            publication('NODE', 'root'),
            publication('NODE', 'publicPageLink'),
            publication('NODE', 'authorPageLink'),
            publication('DASHBOARD', 'rootDashboard'),
            publication('PAGE', 'publicPage'),
            publication('PAGE', 'authorPage'),
            publication('ACCESS_POLICY', 'publicDocs'),
            publication('ACCESS_POLICY', 'authorDocs'),
            publication('SEARCH_METADATA', 'searchPRODUCTdocsProduct'),
            publication('SEARCH_METADATA', 'searchNAVIGATIONdocsNavigation'),
            publication('SEARCH_METADATA', 'searchNODEroot'),
            publication('SEARCH_METADATA', 'searchNODEpublicPageLink'),
            publication('SEARCH_METADATA', 'searchNODEauthorPageLink'),
            publication('SEARCH_METADATA', 'searchDASHBOARDrootDashboard'),
            publication('SEARCH_METADATA', 'searchPAGEpublicPage'),
            publication('SEARCH_METADATA', 'searchPAGEauthorPage')
        ],
        searchMetadata: [
            search('PRODUCT', 'docsProduct', 'Docs', 'PUBLIC'),
            search('NAVIGATION', 'docsNavigation', 'Docs Navigation', 'PUBLIC'),
            search('NODE', 'root', 'Root', 'PUBLIC'),
            search('NODE', 'publicPageLink', 'Public Page', 'PUBLIC'),
            search('NODE', 'authorPageLink', 'Author Page', 'PERMISSION_BASED'),
            search('DASHBOARD', 'rootDashboard', 'Root Dashboard', 'PUBLIC'),
            search('PAGE', 'publicPage', 'Public Page', 'PUBLIC'),
            search('PAGE', 'authorPage', 'Author Page', 'PERMISSION_BASED')
        ]
    };
}

const model = service.authoringModel();
assert.strictEqual(model.contract, 'cms.documentation.authoring/v1');
assert.strictEqual(model.sequence.length, 96);
assert.deepStrictEqual(Object.keys(model.sequenceByGroup), [
    'Axis Documentation Workspace',
    'Navigation Authoring',
    'Page Content',
    'Visual Documentation Contract',
    'Publishing Workflow',
    'Access and Visibility',
    'Runtime Rendering',
    'Search and Discovery',
    'Migration, Validation, and Certification',
    'Documentation Closure and Certification'
]);
assert(model.panels.every(panel => panel.schemaName || panel.code === 'validation'));
assert(model.accessModes.includes('GROUP_BASED'));
assert(model.accessModes.includes('PERMISSION_BASED'));

const pack = fixture();
const readiness = service.validateAuthoringRecords({ documentation: { records: pack } });
assert.strictEqual(readiness.status, 'READY');
assert.strictEqual(readiness.issueCount, 0);

const invalidPack = fixture();
invalidPack.pages[0].visualRequirements = [];
assert.strictEqual(
    service.validateAuthoringRecords({ documentation: { records: invalidPack } }).status,
    'BLOCKED'
);

const nexusProjection = service.renderProjection({ documentation: { records: pack, channel: 'NEXUS' } });
assert.strictEqual(nexusProjection.channel, 'NEXUS');
assert.deepStrictEqual(nexusProjection.pages.map(page => page.code), ['publicPage']);
assert.deepStrictEqual(nexusProjection.navigation[0].children.map(node => node.code), ['publicPageLink']);

const axisProjection = service.renderProjection({
    documentation: {
        records: pack,
        channel: 'AXIS',
        principal: { authenticated: true, permissions: ['axis.documentation.read'] }
    }
});
assert.deepStrictEqual(axisProjection.pages.map(page => page.code), ['publicPage', 'authorPage']);

const publicSearch = service.search({ documentation: { records: pack, query: 'author', channel: 'NEXUS' } });
assert.strictEqual(publicSearch.total, 0);
assert(publicSearch.noResultGuidance.includes('configuration key'));

const authorSearch = service.search({
    documentation: {
        records: pack,
        query: 'author',
        channel: 'AXIS',
        principal: { authenticated: true, permissions: ['axis.documentation.read'] }
    }
});
assert.strictEqual(authorSearch.total, 2);

const handoff = service.publicationHandoff({ documentation: { records: pack, productCode: 'docsProduct' } });
assert.strictEqual(handoff.status, 'READY_FOR_NPUBLISH');
assert.strictEqual(handoff.publicationAuthority, 'nPublish');
assert.strictEqual(handoff.domain, 'cms.documentation');
assert.strictEqual(handoff.rootType, 'documentationContentCatalog');
assert(handoff.targets.some(target => target.targetType === 'PAGE' && target.targetCode === 'publicPage'));
assert.strictEqual(handoff.validation.status, 'READY');
assert.strictEqual(handoff.publication.domain, 'cms.documentation');
assert.strictEqual(handoff.publication.rootType, 'documentationContentCatalog');

const migration = service.migrationPlan({ documentation: { records: pack, source: 'nodics.docs' } });
assert.strictEqual(migration.recordCount, 2);
assert.strictEqual(migration.sourceEvidence.length, 2);
assert(migration.actions.includes('enableAxisManagement'));
assert.strictEqual(migration.pageCount, 2);
assert(migration.pages.every(page => page.preserveSourceEvidence));

assert.deepStrictEqual(Object.keys(routes), [
    'authoringModel',
    'validateAuthoringRecords',
    'renderProjection',
    'search',
    'publicationHandoff',
    'migrationPlan'
]);
assert(Object.values(routes).every(route => route.controller === 'DefaultCmsDocumentationGovernanceController'));
assert.strictEqual(routes.publicationHandoff.permission, 'documentation.submitReview');

console.log('CMS documentation governance service contract validated');
