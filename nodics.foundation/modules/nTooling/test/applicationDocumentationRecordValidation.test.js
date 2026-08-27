/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');
const service = require('../src/service/defaultApplicationDocumentationRecordValidationService');

/**
 * @module nTooling/test/applicationDocumentationRecordValidation
 * @description Proves documentation record validation, negative fixtures, readiness scoring, and Axis-friendly report export contracts.
 * @layer test
 * @owner nTooling
 * @override Projects may add stricter records while preserving content-catalog authority and nPublish publication lifecycle validation.
 */

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

function publication(targetType, targetCode) {
    return {
        code: `pub${targetType}${targetCode}`,
        targetType,
        targetCode,
        lifecycleState: 'ONLINE',
        publicationCode: 'sampleDocumentation',
        workflowReference: 'sampleDocumentationReviewWorkflow',
        stagedVersion: '0.0.0',
        onlineVersion: '0.0.0',
        validationResult: {
            generated: true,
            sourceAuthority: 'docs/catalogue.json',
            publicationPath: 'STAGED_REVIEW_APPROVAL_ONLINE',
            nexusVisibleOnlyWhenOnlineAndPublic: true,
        },
        checksum: service.sha256(`${targetType}:${targetCode}`),
        managedInAxis: true,
        axisAuthoringPermissions: ['documentation.draft.update'],
        workflowRequired: true,
        workflowTriggers: ['CONTENT_CHANGE', 'NAVIGATION_CHANGE', 'DASHBOARD_CHANGE', 'ACCESS_POLICY_CHANGE'],
        decisionPolicy: {
            reviewPermission: 'documentation.review',
            approvePermission: 'documentation.approve',
            publishPermission: 'documentation.publish',
            permissionEnforced: true,
            adminOverrideAudited: true,
        },
        actor: 'test',
        author: 'test',
        reviewer: 'test',
        approver: 'test',
        publisher: 'test',
        auditTrail: [],
        active: true,
    };
}

function workflow(triggers) {
    return {
        managedInAxis: true,
        axisAuthoringPermissions: ['documentation.draft.update'],
        workflowRequired: true,
        workflowTriggers: triggers,
    };
}

function search(targetType, targetCode, title) {
    return {
        code: `search${targetType}${targetCode}`,
        product: 'sampleProduct',
        targetType,
        targetCode,
        title,
        summary: `${title} summary`,
        searchText: `${title} searchable text`,
        keywords: [title],
        facets: { lifecycleState: 'ONLINE' },
        accessPolicy: 'publicPolicy',
        accessMode: 'PUBLIC',
        lifecycleState: 'ONLINE',
        indexState: 'INDEX_READY',
        ...workflow(['SEARCH_METADATA_CHANGE']),
        active: true,
    };
}

function fixture() {
    const product = {
        code: 'sampleProduct',
        name: 'Sample Documentation',
        contentCatalog: 'documentationContentCatalog',
        site: 'sampleSite',
        publicRootPath: '/docs/sample',
        accessMode: 'PUBLIC',
        lifecycleState: 'ONLINE',
        active: true,
    };
    const navigation = {
        code: 'sampleNavigation',
        product: product.code,
        name: 'Sample Navigation',
        renderer: 'documentation.component.navigation',
        expandable: true,
        searchPlaceholder: 'Search sample docs',
        accessMode: 'PUBLIC',
        lifecycleState: 'ONLINE',
        ...workflow(['NAVIGATION_CHANGE']),
        active: true,
    };
    const dashboard = {
        code: 'sampleDashboard',
        product: product.code,
        ownerType: 'PRODUCT',
        ownerCode: product.code,
        title: 'Sample Dashboard',
        summary: 'Detailed landing content for sample documentation.',
        contentArea: { intent: 'Guide readers' },
        cards: [],
        accessPolicy: 'publicPolicy',
        accessMode: 'PUBLIC',
        lifecycleState: 'ONLINE',
        ...workflow(['DASHBOARD_CHANGE']),
        active: true,
    };
    const rootNode = {
        code: 'rootNode',
        product: product.code,
        navigation: navigation.code,
        parentNode: null,
        nodeLevel: 'SECTION',
        nodeType: 'CONTAINER',
        nodeTitle: 'Sample',
        nodeSummary: 'Sample section',
        nodeContentArea: { dashboard: dashboard.code },
        nodeDashboard: dashboard.code,
        nodeOrder: 10,
        expandable: true,
        accessPolicy: 'publicPolicy',
        accessMode: 'PUBLIC',
        lifecycleState: 'ONLINE',
        ...workflow(['NAVIGATION_CHANGE', 'DASHBOARD_CHANGE', 'ACCESS_POLICY_CHANGE']),
        active: true,
    };
    const topicNode = {
        code: 'topicNode',
        product: product.code,
        navigation: navigation.code,
        parentNode: rootNode.code,
        nodeLevel: 'TOPIC',
        nodeType: 'PAGE',
        nodeTitle: 'Topic',
        nodeSummary: 'Topic summary',
        nodeContentArea: { route: '/docs/sample/topic' },
        targetDocumentationPage: 'samplePageMetadata',
        targetPage: 'sampleCmsPage',
        targetRoute: 'sampleRoute',
        nodeOrder: 20,
        expandable: false,
        accessPolicy: 'publicPolicy',
        accessMode: 'PUBLIC',
        lifecycleState: 'ONLINE',
        ...workflow(['NAVIGATION_CHANGE', 'DASHBOARD_CHANGE', 'ACCESS_POLICY_CHANGE']),
        active: true,
    };
    const page = {
        code: 'samplePageMetadata',
        product: product.code,
        documentId: 'sample.topic',
        title: 'Topic',
        summary: 'Detailed topic summary',
        businessSummary: 'Business summary',
        technicalSummary: 'Technical summary',
        targetPage: 'sampleCmsPage',
        targetRoute: 'sampleRoute',
        articleComponent: 'sampleArticle',
        diagrams: [],
        visualAssets: [],
        visualRequirements: ['table'],
        relatedPages: [],
        sourceRepository: 'sample.docs',
        sourcePath: 'docs/pages/topic.md',
        sourceChecksum: service.sha256('source'),
        sourceWordCount: 100,
        accessPolicy: 'publicPolicy',
        accessMode: 'PUBLIC',
        lifecycleState: 'ONLINE',
        searchMetadata: 'searchPAGEsamplePageMetadata',
        ...workflow(['CONTENT_CHANGE', 'ACCESS_POLICY_CHANGE', 'SOURCE_EVIDENCE_CHANGE']),
        active: true,
    };
    const policy = {
        code: 'publicPolicy',
        name: 'Public policy',
        targetType: 'PRODUCT',
        targetCode: product.code,
        accessMode: 'PUBLIC',
        publiclyAvailable: true,
        requiresAuthentication: false,
        allowedRoles: [],
        allowedGroups: [],
        allowedPermissions: [],
        lifecycleVisibility: ['ONLINE'],
        ...workflow(['ACCESS_POLICY_CHANGE']),
        active: true,
    };
    return {
        products: [product],
        navigation: [navigation],
        nodes: [rootNode, topicNode],
        dashboards: [dashboard],
        pages: [page],
        accessPolicies: [policy],
        publicationStates: [
            publication('PRODUCT', product.code),
            publication('NAVIGATION', navigation.code),
            publication('NODE', rootNode.code),
            publication('NODE', topicNode.code),
            publication('DASHBOARD', dashboard.code),
            publication('PAGE', page.code),
            publication('ACCESS_POLICY', policy.code),
            publication('SEARCH_METADATA', 'searchPRODUCTsampleProduct'),
            publication('SEARCH_METADATA', 'searchNAVIGATIONsampleNavigation'),
            publication('SEARCH_METADATA', 'searchNODErootNode'),
            publication('SEARCH_METADATA', 'searchNODEtopicNode'),
            publication('SEARCH_METADATA', 'searchDASHBOARDsampleDashboard'),
            publication('SEARCH_METADATA', 'searchPAGEsamplePageMetadata'),
        ],
        searchMetadata: [
            search('PRODUCT', product.code, 'Sample Documentation'),
            search('NAVIGATION', navigation.code, 'Sample Navigation'),
            search('NODE', rootNode.code, 'Sample Section'),
            search('NODE', topicNode.code, 'Topic Node'),
            search('DASHBOARD', dashboard.code, 'Sample Dashboard'),
            search('PAGE', page.code, 'Topic Page'),
        ],
        cmsPages: [{ code: 'sampleCmsPage' }],
        routes: [{ code: 'sampleRoute', site: 'sampleSite' }],
        components: [{ code: 'sampleArticle' }],
        manifestHashes: { 'core/data/documentation/sample.js': service.sha256('sample') },
    };
}

const positive = service.validateRecords({
    records: fixture(),
    options: { release: '0.0.0', source: 'test', owner: 'nTooling', generatedAt: '2026-08-26T00:00:00.000Z' },
});
assert.strictEqual(positive.summary.errors, 0);
assert.strictEqual(positive.summary.readinessStatus, 'READY');
assert.strictEqual(service.assertReady(positive), true);
assert(service.formatMarkdown(positive).includes('Readiness Status: READY'));
assert(/^[a-f0-9]{64}$/.test(positive.integrity.checksum));

[
    ['circular-navigation-hierarchy', (records) => { records.nodes[0].parentNode = 'topicNode'; }],
    ['container-dashboard-reference', (records) => { records.nodes[0].nodeDashboard = 'missingDashboard'; }],
    ['public-record-online-state', (records) => { records.pages[0].lifecycleState = 'STAGED'; }],
    ['source-evidence-and-checksum', (records) => { records.pages[0].sourceChecksum = null; }],
    ['workflow-trigger-presence', (records) => { records.pages[0].workflowTriggers = []; }],
    ['publication-state-coverage', (records) => { records.publicationStates = records.publicationStates.filter(item => item.targetType !== 'PAGE'); }],
    ['restricted-policy-principals', (records) => {
        records.accessPolicies[0].accessMode = 'ROLE_BASED';
        records.accessPolicies[0].publiclyAvailable = false;
        records.accessPolicies[0].requiresAuthentication = true;
    }],
].forEach(([rule, mutate]) => {
    const records = clone(fixture());
    mutate(records);
    const report = service.validateRecords({
        records,
        options: { release: '0.0.0', source: 'negative-test', owner: 'nTooling', generatedAt: '2026-08-26T00:00:00.000Z' },
    });
    assert(
        report.issues.some(issue => issue.rule === rule),
        `Expected validation issue for ${rule}`,
    );
    assert.throws(() => service.assertReady(report), /Documentation validation failed/);
});

console.log('Application documentation record validation service validated');
