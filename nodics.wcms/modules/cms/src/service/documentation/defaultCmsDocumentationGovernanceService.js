/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const crypto = require('node:crypto');

const VALID_ACCESS_MODES = Object.freeze(['PUBLIC', 'AUTHENTICATED', 'ROLE_BASED', 'GROUP_BASED', 'PERMISSION_BASED', 'RESTRICTED']);
const ONLINE_READER_STATES = Object.freeze(['ONLINE']);
const AXIS_AUTHOR_STATES = Object.freeze(['DRAFT', 'STAGED', 'REVIEW_IN_PROGRESS', 'CHANGES_REQUESTED', 'APPROVED', 'REJECTED', 'ONLINE', 'ARCHIVED', 'RETIRED', 'ROLLBACK_PENDING', 'PUBLICATION_FAILED']);
const PUBLICATION_TARGET_TYPES = Object.freeze(['PRODUCT', 'NAVIGATION', 'NODE', 'PAGE', 'DASHBOARD', 'ACCESS_POLICY', 'SEARCH_METADATA']);
const WORKFLOW_TRIGGERS = Object.freeze({
    PRODUCT: ['CONTENT_CHANGE', 'ACCESS_POLICY_CHANGE'],
    NAVIGATION: ['NAVIGATION_CHANGE'],
    NODE: ['NAVIGATION_CHANGE', 'DASHBOARD_CHANGE', 'ACCESS_POLICY_CHANGE'],
    PAGE: ['CONTENT_CHANGE', 'ACCESS_POLICY_CHANGE', 'SOURCE_EVIDENCE_CHANGE'],
    DASHBOARD: ['DASHBOARD_CHANGE'],
    ACCESS_POLICY: ['ACCESS_POLICY_CHANGE'],
    SEARCH_METADATA: ['SEARCH_METADATA_CHANGE']
});
const AUTHORING_SEQUENCE = Object.freeze([
    { id: 1, group: 'Axis Documentation Workspace', code: 'workspace.shell', label: 'Documentation workspace shell', target: 'workspace', permission: 'axis.documentation.read' },
    { id: 2, group: 'Axis Documentation Workspace', code: 'workspace.dashboard', label: 'Documentation dashboard landing', target: 'dashboard', permission: 'axis.documentation.read' },
    { id: 3, group: 'Axis Documentation Workspace', code: 'workspace.navigationBuilder', label: 'Navigation Builder view', target: 'cmsDocumentationNode', permission: 'documentation.navigation.update' },
    { id: 4, group: 'Axis Documentation Workspace', code: 'workspace.pageManager', label: 'Page Content Manager view', target: 'cmsDocumentationPage', permission: 'documentation.draft.update' },
    { id: 5, group: 'Axis Documentation Workspace', code: 'workspace.dashboardManager', label: 'Dashboard/Content Area Manager', target: 'cmsDocumentationDashboard', permission: 'documentation.dashboard.update' },
    { id: 6, group: 'Axis Documentation Workspace', code: 'workspace.accessManager', label: 'Access Policy Manager', target: 'cmsDocumentationAccessPolicy', permission: 'documentation.accessPolicy.update' },
    { id: 7, group: 'Axis Documentation Workspace', code: 'workspace.publicationQueue', label: 'Publication Queue view', target: 'cmsDocumentationPublicationState', permission: 'documentation.review' },
    { id: 8, group: 'Axis Documentation Workspace', code: 'workspace.validationPanel', label: 'Validation Readiness panel', target: 'readinessReport', permission: 'documentation.submitReview' },
    { id: 9, group: 'Axis Documentation Workspace', code: 'workspace.sourceEvidence', label: 'Source Evidence panel', target: 'cmsDocumentationPage', permission: 'documentation.sourceEvidence.review' },
    { id: 10, group: 'Axis Documentation Workspace', code: 'workspace.previewMode', label: 'Documentation preview mode', target: 'preview', permission: 'axis.documentation.read' },
    { id: 11, group: 'Navigation Authoring', code: 'navigation.create', label: 'Create documentation navigation', target: 'cmsDocumentationNavigation', trigger: 'NAVIGATION_CHANGE' },
    { id: 12, group: 'Navigation Authoring', code: 'navigation.rename', label: 'Edit navigation name/label', target: 'cmsDocumentationNavigation', trigger: 'NAVIGATION_CHANGE' },
    { id: 13, group: 'Navigation Authoring', code: 'navigation.sequence', label: 'Manage navigation sequence', target: 'cmsDocumentationNode', trigger: 'NAVIGATION_CHANGE' },
    { id: 14, group: 'Navigation Authoring', code: 'navigation.addSection', label: 'Add section node', target: 'cmsDocumentationNode', trigger: 'NAVIGATION_CHANGE' },
    { id: 17, group: 'Navigation Authoring', code: 'navigation.addPageLink', label: 'Add page-link node', target: 'cmsDocumentationNode', trigger: 'NAVIGATION_CHANGE' },
    { id: 18, group: 'Navigation Authoring', code: 'navigation.moveParent', label: 'Move node under parent', target: 'cmsDocumentationNode', trigger: 'NAVIGATION_CHANGE' },
    { id: 19, group: 'Navigation Authoring', code: 'navigation.reorderSiblings', label: 'Reorder sibling nodes', target: 'cmsDocumentationNode', trigger: 'NAVIGATION_CHANGE' },
    { id: 20, group: 'Navigation Authoring', code: 'navigation.validateHierarchy', label: 'Validate hierarchy loops/orphans', target: 'readinessReport', trigger: 'NAVIGATION_CHANGE' },
    { id: 21, group: 'Page Content', code: 'page.create', label: 'Create documentation page', target: 'cmsDocumentationPage', trigger: 'CONTENT_CHANGE' },
    { id: 22, group: 'Page Content', code: 'page.attachPageLink', label: 'Attach page to page-link node', target: 'cmsDocumentationNode', trigger: 'NAVIGATION_CHANGE' },
    { id: 23, group: 'Page Content', code: 'page.summary', label: 'Edit detailed summary', target: 'cmsDocumentationPage', trigger: 'CONTENT_CHANGE' },
    { id: 24, group: 'Page Content', code: 'page.businessPerspective', label: 'Add business perspective block', target: 'cmsDocumentationPage', trigger: 'CONTENT_CHANGE' },
    { id: 25, group: 'Page Content', code: 'page.technicalPerspective', label: 'Add technical perspective block', target: 'cmsDocumentationPage', trigger: 'CONTENT_CHANGE' },
    { id: 26, group: 'Page Content', code: 'page.configurationDetails', label: 'Add configuration details', target: 'cmsDocumentationPage', trigger: 'CONTENT_CHANGE' },
    { id: 27, group: 'Page Content', code: 'page.extensionDetails', label: 'Add customization/extension details', target: 'cmsDocumentationPage', trigger: 'CONTENT_CHANGE' },
    { id: 28, group: 'Page Content', code: 'page.troubleshooting', label: 'Add troubleshooting section', target: 'cmsDocumentationPage', trigger: 'CONTENT_CHANGE' },
    { id: 29, group: 'Page Content', code: 'page.relatedPages', label: 'Add related pages', target: 'cmsDocumentationPage', trigger: 'CONTENT_CHANGE' },
    { id: 30, group: 'Page Content', code: 'page.sourceEvidence', label: 'Preserve source evidence', target: 'cmsDocumentationPage', trigger: 'SOURCE_EVIDENCE_CHANGE' },
    { id: 31, group: 'Visual Documentation Contract', code: 'visual.diagram', label: 'Add diagram block support', target: 'cmsDocumentationPage', trigger: 'CONTENT_CHANGE' },
    { id: 32, group: 'Visual Documentation Contract', code: 'visual.dataFlow', label: 'Add data-flow visual support', target: 'cmsDocumentationPage', trigger: 'CONTENT_CHANGE' },
    { id: 33, group: 'Visual Documentation Contract', code: 'visual.schemaModel', label: 'Add schema/model visual support', target: 'cmsDocumentationPage', trigger: 'CONTENT_CHANGE' },
    { id: 34, group: 'Visual Documentation Contract', code: 'visual.moduleHierarchy', label: 'Add module hierarchy visual support', target: 'cmsDocumentationPage', trigger: 'CONTENT_CHANGE' },
    { id: 35, group: 'Visual Documentation Contract', code: 'visual.tableComparison', label: 'Add table/comparison block support', target: 'cmsDocumentationPage', trigger: 'CONTENT_CHANGE' },
    { id: 36, group: 'Visual Documentation Contract', code: 'visual.codeSnippet', label: 'Add code snippet block support', target: 'cmsDocumentationPage', trigger: 'CONTENT_CHANGE' },
    { id: 37, group: 'Visual Documentation Contract', code: 'visual.screenshot', label: 'Add screenshot/image block support', target: 'cmsDocumentationPage', trigger: 'CONTENT_CHANGE' },
    { id: 38, group: 'Visual Documentation Contract', code: 'visual.validate', label: 'Validate required visuals', target: 'readinessReport', trigger: 'CONTENT_CHANGE' },
    { id: 39, group: 'Visual Documentation Contract', code: 'visual.axisPreview', label: 'Preview visual blocks in Axis', target: 'preview', trigger: 'CONTENT_CHANGE' },
    { id: 40, group: 'Visual Documentation Contract', code: 'visual.readerRender', label: 'Render visual blocks in reader view', target: 'renderer', trigger: 'CONTENT_CHANGE' },
    { id: 41, group: 'Publishing Workflow', code: 'publish.navigationEdit', label: 'Trigger workflow on navigation edit', target: 'cmsDocumentationNavigation', trigger: 'NAVIGATION_CHANGE' },
    { id: 42, group: 'Publishing Workflow', code: 'publish.pageEdit', label: 'Trigger workflow on page edit', target: 'cmsDocumentationPage', trigger: 'CONTENT_CHANGE' },
    { id: 43, group: 'Publishing Workflow', code: 'publish.dashboardEdit', label: 'Trigger workflow on dashboard edit', target: 'cmsDocumentationDashboard', trigger: 'DASHBOARD_CHANGE' },
    { id: 44, group: 'Publishing Workflow', code: 'publish.accessPolicyEdit', label: 'Trigger workflow on access policy edit', target: 'cmsDocumentationAccessPolicy', trigger: 'ACCESS_POLICY_CHANGE' },
    { id: 45, group: 'Publishing Workflow', code: 'publish.sourceEvidenceChange', label: 'Trigger workflow on source evidence change', target: 'cmsDocumentationPage', trigger: 'SOURCE_EVIDENCE_CHANGE' },
    { id: 46, group: 'Publishing Workflow', code: 'publish.draft', label: 'Save draft item state', target: 'cmsDocumentationPublicationState', state: 'DRAFT' },
    { id: 47, group: 'Publishing Workflow', code: 'publish.staged', label: 'Move item to Staged', target: 'cmsDocumentationPublicationState', state: 'STAGED' },
    { id: 48, group: 'Publishing Workflow', code: 'publish.review', label: 'Review item', target: 'cmsDocumentationPublicationState', state: 'REVIEW_IN_PROGRESS' },
    { id: 49, group: 'Publishing Workflow', code: 'publish.approve', label: 'Approve item', target: 'cmsDocumentationPublicationState', state: 'APPROVED' },
    { id: 50, group: 'Publishing Workflow', code: 'publish.online', label: 'Publish item Online', target: 'cmsDocumentationPublicationState', state: 'ONLINE' },
    { id: 51, group: 'Access and Visibility', code: 'access.public', label: 'Public page configuration', target: 'cmsDocumentationAccessPolicy', accessMode: 'PUBLIC' },
    { id: 52, group: 'Access and Visibility', code: 'access.authenticated', label: 'Authenticated page configuration', target: 'cmsDocumentationAccessPolicy', accessMode: 'AUTHENTICATED' },
    { id: 53, group: 'Access and Visibility', code: 'access.role', label: 'Role-based page configuration', target: 'cmsDocumentationAccessPolicy', accessMode: 'ROLE_BASED' },
    { id: 54, group: 'Access and Visibility', code: 'access.group', label: 'Group-based page configuration', target: 'cmsDocumentationAccessPolicy', accessMode: 'GROUP_BASED' },
    { id: 55, group: 'Access and Visibility', code: 'access.permission', label: 'Permission-based page configuration', target: 'cmsDocumentationAccessPolicy', accessMode: 'PERMISSION_BASED' },
    { id: 56, group: 'Access and Visibility', code: 'access.axisReader', label: 'Axis reader filtering', target: 'accessProjection' },
    { id: 57, group: 'Access and Visibility', code: 'access.axisAuthoring', label: 'Axis authoring permission check', target: 'authoringPolicy' },
    { id: 58, group: 'Access and Visibility', code: 'access.nexusPublic', label: 'Nexus public filtering', target: 'accessProjection' },
    { id: 59, group: 'Access and Visibility', code: 'access.noStagedLeak', label: 'Prevent staged content leakage', target: 'accessProjection' },
    { id: 60, group: 'Access and Visibility', code: 'access.auditEvidence', label: 'Add access audit evidence', target: 'cmsDocumentationPublicationState' },
    { id: 61, group: 'Runtime Rendering', code: 'render.navigation', label: 'Render expandable navigation from backend data', target: 'renderProjection' },
    { id: 62, group: 'Runtime Rendering', code: 'render.sectionDashboard', label: 'Render section dashboard', target: 'cmsDocumentationDashboard' },
    { id: 65, group: 'Runtime Rendering', code: 'render.pageLinkPage', label: 'Render page-link page', target: 'cmsDocumentationPage' },
    { id: 66, group: 'Runtime Rendering', code: 'render.breadcrumbs', label: 'Render breadcrumbs', target: 'renderProjection' },
    { id: 67, group: 'Runtime Rendering', code: 'render.toc', label: 'Render table of contents', target: 'renderProjection' },
    { id: 68, group: 'Runtime Rendering', code: 'render.badges', label: 'Render lifecycle/access badges', target: 'renderProjection' },
    { id: 69, group: 'Runtime Rendering', code: 'render.relatedPages', label: 'Render related pages', target: 'renderProjection' },
    { id: 70, group: 'Runtime Rendering', code: 'render.emptyError', label: 'Render empty/error states', target: 'renderProjection' },
    { id: 71, group: 'Search and Discovery', code: 'search.keyword', label: 'Keyword search over catalog records', target: 'cmsDocumentationSearchMetadata' },
    { id: 72, group: 'Search and Discovery', code: 'search.pageMetadataValidation', label: 'Page search metadata validation', target: 'cmsDocumentationSearchMetadata' },
    { id: 73, group: 'Search and Discovery', code: 'search.navigationNode', label: 'Navigation node search metadata', target: 'cmsDocumentationSearchMetadata' },
    { id: 74, group: 'Search and Discovery', code: 'search.dashboardMetadata', label: 'Dashboard search metadata', target: 'cmsDocumentationSearchMetadata' },
    { id: 75, group: 'Search and Discovery', code: 'search.pageMetadata', label: 'Page search metadata', target: 'cmsDocumentationSearchMetadata' },
    { id: 76, group: 'Search and Discovery', code: 'search.accessFiltered', label: 'Access-filtered search results', target: 'searchProjection' },
    { id: 77, group: 'Search and Discovery', code: 'search.noResult', label: 'No-result guidance', target: 'searchProjection' },
    { id: 78, group: 'Search and Discovery', code: 'search.axisPreview', label: 'Search preview in Axis', target: 'searchProjection' },
    { id: 79, group: 'Search and Discovery', code: 'search.readinessReport', label: 'Search readiness report', target: 'readinessReport' },
    { id: 80, group: 'Search and Discovery', code: 'search.indexProjection', label: 'Search index projection contract', target: 'searchProjection' },
    { id: 81, group: 'Migration, Validation, and Certification', code: 'migration.importGenerated', label: 'Import generated docs as editable records', target: 'migrationPlan' },
    { id: 82, group: 'Migration, Validation, and Certification', code: 'migration.checksum', label: 'Preserve generated checksum', target: 'migrationPlan' },
    { id: 83, group: 'Migration, Validation, and Certification', code: 'migration.sourcePath', label: 'Preserve source path', target: 'migrationPlan' },
    { id: 84, group: 'Migration, Validation, and Certification', code: 'migration.ownership', label: 'Preserve author/source ownership', target: 'migrationPlan' },
    { id: 85, group: 'Migration, Validation, and Certification', code: 'validation.beforeStaging', label: 'Run validation before staging', target: 'readinessReport' },
    { id: 86, group: 'Migration, Validation, and Certification', code: 'validation.beforePublishing', label: 'Run validation before publishing', target: 'readinessReport' },
    { id: 87, group: 'Migration, Validation, and Certification', code: 'tests.axisAuthoring', label: 'Add Axis authoring tests', target: 'tests' },
    { id: 88, group: 'Migration, Validation, and Certification', code: 'tests.publishingWorkflow', label: 'Add publishing workflow tests', target: 'tests' },
    { id: 89, group: 'Migration, Validation, and Certification', code: 'tests.nexusVisibility', label: 'Add Nexus visibility tests', target: 'tests' },
    { id: 90, group: 'Migration, Validation, and Certification', code: 'audit.actionRepo', label: 'Update actionRepo closure audit', target: 'audit' },
    { id: 91, group: 'Documentation Closure and Certification', code: 'closure.liveCmsRecords', label: 'Connect governance actions to live documentation records', target: 'cmsDocumentationProduct' },
    { id: 92, group: 'Documentation Closure and Certification', code: 'closure.recordEditorShortcuts', label: 'Expose saved record-editor shortcuts in Axis', target: 'axisDocumentationWorkspace' },
    { id: 93, group: 'Documentation Closure and Certification', code: 'closure.publishWorkflowHook', label: 'Wire item changes into review and publication workflow', target: 'nPublish', trigger: 'CONTENT_CHANGE' },
    { id: 94, group: 'Documentation Closure and Certification', code: 'closure.axisAccessProof', label: 'Prove authenticated and role-filtered Axis documentation access', target: 'accessProjection', accessMode: 'AUTHENTICATED' },
    { id: 95, group: 'Documentation Closure and Certification', code: 'closure.nexusPublicProof', label: 'Prove public-only Nexus documentation delivery', target: 'accessProjection', accessMode: 'PUBLIC' },
    { id: 96, group: 'Documentation Closure and Certification', code: 'closure.browserVisualProof', label: 'Capture browser visual evidence for imported documentation packs', target: 'browserEvidence' },
    { id: 97, group: 'Documentation Closure and Certification', code: 'closure.managedRecordMigration', label: 'Migrate generated records into Axis-managed content-catalog records', target: 'migrationPlan' },
    { id: 98, group: 'Documentation Closure and Certification', code: 'closure.searchIndexProjection', label: 'Project Online documentation records to search index metadata', target: 'searchProjection' },
    { id: 99, group: 'Documentation Closure and Certification', code: 'closure.visualEnrichment', label: 'Enrich pages with screenshots, flows, diagrams, and visual evidence', target: 'cmsDocumentationPage', trigger: 'CONTENT_CHANGE' },
    { id: 100, group: 'Documentation Closure and Certification', code: 'closure.freshSchemaBrowserE2e', label: 'Run fresh-schema browser E2E certification', target: 'certificationEvidence' }
]);

/**
 * @module cms/service/documentation/defaultCmsDocumentationGovernanceService
 * @description Publishes CMS-owned documentation authoring, visibility, search, migration, and publication-readiness contracts for Axis and Nexus.
 * @layer service
 * @owner cms
 * @override Project modules may extend authoring panels or validation strictness, but must preserve CMS content-catalog authority and nPublish lifecycle handoff.
 */
module.exports = {
    VALID_ACCESS_MODES,
    ONLINE_READER_STATES,
    AXIS_AUTHOR_STATES,
    PUBLICATION_TARGET_TYPES,
    WORKFLOW_TRIGGERS,
    AUTHORING_SEQUENCE,

    /** Initializes the documentation governance service lifecycle. */
    init: function () { return Promise.resolve(true); },

    /** Completes documentation governance service startup. */
    postInit: function () { return Promise.resolve(true); },

    /** Returns a stable digest used for generated-source and publication-readiness evidence. */
    checksum: function (value) {
        return crypto.createHash('sha256').update(JSON.stringify(value || {})).digest('hex');
    },

    /** Returns array values from generated maps or authoring arrays. */
    records: function (value) {
        if (Array.isArray(value)) return value;
        if (!value || typeof value !== 'object') return [];
        return Object.values(value);
    },

    /** Returns request body from Axis, service, or direct-test envelopes. */
    payload: function (request) {
        return request && (request.documentation || request.body || request.payload ||
            request.httpRequest && request.httpRequest.body) || {};
    },

    /** Groups the approved 90 implementation items for Axis dashboard rendering and certification. */
    sequenceByGroup: function () {
        return AUTHORING_SEQUENCE.reduce((result, item) => {
            result[item.group] = result[item.group] || [];
            result[item.group].push(Object.assign({}, item));
            return result;
        }, {});
    },

    /** Returns the Axis-facing documentation management workspace model. */
    authoringModel: function () {
        return {
            contract: 'cms.documentation.authoring/v1',
            ownerModule: 'cms',
            contentAuthority: 'documentationContentCatalog',
            rendererAuthority: 'axis-runtime-renderers',
            publicationAuthority: 'nPublish',
            workspace: {
                route: '/content/designer/documentation',
                landing: '/content/designer/documentation/dashboard',
                previewRoute: '/content/designer/documentation/preview',
                searchRoute: '/content/designer/documentation/search',
                expandableNavigation: true,
                backendDriven: true
            },
            panels: [
                { code: 'navigation', label: 'Navigation Builder', schemaName: 'cmsDocumentationNode', permission: 'documentation.navigation.update' },
                { code: 'pages', label: 'Page Content', schemaName: 'cmsDocumentationPage', permission: 'documentation.draft.update' },
                { code: 'dashboards', label: 'Dashboards and Content Areas', schemaName: 'cmsDocumentationDashboard', permission: 'documentation.dashboard.update' },
                { code: 'access', label: 'Audience and Access Policies', schemaName: 'cmsDocumentationAccessPolicy', permission: 'documentation.accessPolicy.update' },
                { code: 'publication', label: 'Review and Publication Queue', schemaName: 'cmsDocumentationPublicationState', permission: 'documentation.review' },
                { code: 'search', label: 'Search Metadata Preview', schemaName: 'cmsDocumentationSearchMetadata', permission: 'documentation.search.preview' },
                { code: 'sourceEvidence', label: 'Source Evidence Review', schemaName: 'cmsDocumentationPage', permission: 'documentation.sourceEvidence.review' },
                { code: 'validation', label: 'Validation Readiness', schemaName: 'cmsDocumentationPublicationState', permission: 'documentation.submitReview' }
            ],
            accessModes: VALID_ACCESS_MODES.slice(),
            lifecycle: {
                readerStates: ONLINE_READER_STATES.slice(),
                authorStates: AXIS_AUTHOR_STATES.slice(),
                workflowTriggers: Object.assign({}, WORKFLOW_TRIGGERS),
                targetTypes: PUBLICATION_TARGET_TYPES.slice()
            },
            sequence: AUTHORING_SEQUENCE.map(item => Object.assign({}, item)),
            sequenceByGroup: this.sequenceByGroup()
        };
    },

    /** Normalizes generated or Axis-authored documentation records into arrays. */
    normalizeRecordPack: function (pack) {
        const input = pack || {};
        return {
            products: this.records(input.products),
            navigation: this.records(input.navigation),
            nodes: this.records(input.nodes),
            dashboards: this.records(input.dashboards),
            pages: this.records(input.pages),
            accessPolicies: this.records(input.accessPolicies),
            publicationStates: this.records(input.publicationStates),
            searchMetadata: this.records(input.searchMetadata),
            routes: this.records(input.routes),
            cmsPages: this.records(input.cmsPages),
            components: this.records(input.components)
        };
    },

    /** Resolves an access policy for a renderable documentation record. */
    policyFor: function (record, records) {
        const policies = this.records(records.accessPolicies);
        return policies.find(policy => policy.code === record.accessPolicy) ||
            policies.find(policy => policy.targetType === record.targetType && policy.targetCode === record.code) ||
            policies.find(policy => policy.targetType === 'PRODUCT' && policy.targetCode === record.product && policy.accessMode === record.accessMode) ||
            null;
    },

    /** Checks whether the given principal can see a record in Axis or Nexus. */
    canView: function (record, policy, principal, channel) {
        const accessMode = record.accessMode || policy && policy.accessMode || 'AUTHENTICATED';
        const lifecycleState = record.lifecycleState || 'DRAFT';
        const readerChannel = channel || 'AXIS';
        const user = principal || {};
        if (readerChannel === 'NEXUS' && (accessMode !== 'PUBLIC' || lifecycleState !== 'ONLINE')) return false;
        if (policy && Array.isArray(policy.lifecycleVisibility) && !policy.lifecycleVisibility.includes(lifecycleState)) return false;
        if (accessMode === 'PUBLIC') return lifecycleState === 'ONLINE';
        if (!user.authenticated) return false;
        if (accessMode === 'AUTHENTICATED') return true;
        if (accessMode === 'ROLE_BASED') return this.intersects(policy && policy.allowedRoles, user.roles);
        if (accessMode === 'GROUP_BASED') return this.intersects(policy && policy.allowedGroups, user.groups);
        if (accessMode === 'PERMISSION_BASED') return this.intersects(policy && policy.allowedPermissions, user.permissions);
        if (accessMode === 'RESTRICTED') {
            return this.intersects(policy && policy.allowedRoles, user.roles) ||
                this.intersects(policy && policy.allowedGroups, user.groups) ||
                this.intersects(policy && policy.allowedPermissions, user.permissions);
        }
        return false;
    },

    /** Returns true when two optional arrays share at least one value. */
    intersects: function (left, right) {
        const rightSet = new Set([].concat(right || []));
        return [].concat(left || []).some(value => rightSet.has(value));
    },

    /** Produces an access-filtered render projection for Axis or Nexus. */
    renderProjection: function (request) {
        const body = this.payload(request);
        const records = this.normalizeRecordPack(body.records || body);
        const channel = body.channel || 'AXIS';
        const principal = body.principal || request && request.authData || {};
        const visible = {
            products: records.products.filter(record => this.canView(record, this.policyFor(record, records), principal, channel)),
            navigation: records.navigation.filter(record => this.canView(record, this.policyFor(record, records), principal, channel)),
            nodes: records.nodes.filter(record => this.canView(record, this.policyFor(record, records), principal, channel)),
            dashboards: records.dashboards.filter(record => this.canView(record, this.policyFor(record, records), principal, channel)),
            pages: records.pages.filter(record => this.canView(record, this.policyFor(record, records), principal, channel))
        };
        return {
            contract: 'cms.documentation.render-projection/v1',
            channel,
            navigation: this.navigationTree(visible.nodes),
            dashboards: visible.dashboards,
            pages: visible.pages,
            emptyState: visible.nodes.length ? null : 'No documentation is available for the current audience, lifecycle, locale, or channel.'
        };
    },

    /** Builds a hierarchical navigation tree from backend-owned node records. */
    navigationTree: function (nodes) {
        const byParent = this.records(nodes).reduce((result, node) => {
            const parent = node.parentNode || 'ROOT';
            result[parent] = result[parent] || [];
            result[parent].push(node);
            return result;
        }, {});
        Object.keys(byParent).forEach(parent => {
            byParent[parent].sort((left, right) => (left.nodeOrder || 0) - (right.nodeOrder || 0) ||
                String(left.nodeTitle || '').localeCompare(String(right.nodeTitle || '')));
        });
        return (byParent.ROOT || []).map(node => this.projectNode(node, byParent));
    },

    /** Projects one navigation node with children and renderer hints. */
    projectNode: function (node, byParent) {
        const children = (byParent[node.code] || []).map(child => this.projectNode(child, byParent));
        return {
            code: node.code,
            title: node.nodeTitle,
            summary: node.nodeSummary,
            level: node.nodeLevel,
            type: node.nodeType,
            expandable: node.expandable === true || children.length > 0,
            expandedByDefault: node.expandedByDefault === true,
            targetDocumentationPage: node.targetDocumentationPage,
            targetRoute: node.targetRoute,
            dashboard: node.nodeDashboard,
            accessMode: node.accessMode,
            lifecycleState: node.lifecycleState,
            children
        };
    },

    /** Searches documentation metadata with access filtering and no-result guidance. */
    search: function (request) {
        const body = this.payload(request);
        const records = this.normalizeRecordPack(body.records || body);
        const query = String(body.query || '').trim().toLowerCase();
        const channel = body.channel || 'AXIS';
        const principal = body.principal || request && request.authData || {};
        const results = records.searchMetadata
            .filter(record => !query || [record.title, record.summary, record.searchText, [].concat(record.keywords || []).join(' ')]
                .join(' ').toLowerCase().includes(query))
            .filter(record => this.canView(record, this.policyFor(record, records), principal, channel))
            .slice(0, body.limit || 25)
            .map(record => ({
                targetType: record.targetType,
                targetCode: record.targetCode,
                title: record.title,
                summary: record.summary,
                facets: record.facets || {},
                accessMode: record.accessMode,
                lifecycleState: record.lifecycleState
            }));
        return {
            contract: 'cms.documentation.search/v1',
            query,
            total: results.length,
            results,
            noResultGuidance: results.length ? null : 'Try a business capability, module name, configuration key, schema name, or workflow keyword.'
        };
    },

    /** Validates authoring records before staging or publishing. */
    validateAuthoringRecords: function (request) {
        const body = this.payload(request);
        const records = this.normalizeRecordPack(body.records || body);
        const issues = [];
        this.validateHierarchy(records, issues);
        this.validateAccess(records, issues);
        this.validateVisuals(records, issues);
        this.validatePublicationCoverage(records, issues);
        this.validateSearchCoverage(records, issues);
        return {
            contract: 'cms.documentation.readiness/v1',
            status: issues.some(issue => issue.severity === 'error') ? 'BLOCKED' : 'READY',
            issueCount: issues.length,
            issues,
            checksum: this.checksum({ records, issues })
        };
    },

    /** Validates hierarchy loops, orphan nodes, and page-link binding. */
    validateHierarchy: function (records, issues) {
        const nodes = new Map(records.nodes.map(node => [node.code, node]));
        records.nodes.filter(node => node.parentNode && !nodes.has(node.parentNode)).forEach(node =>
            issues.push({ severity: 'error', rule: 'orphan-node', target: node.code }));
        records.nodes.forEach(node => {
            const seen = new Set();
            let cursor = node;
            while (cursor && cursor.parentNode) {
                if (seen.has(cursor.code)) {
                    issues.push({ severity: 'error', rule: 'circular-node', target: node.code });
                    break;
                }
                seen.add(cursor.code);
                cursor = nodes.get(cursor.parentNode);
            }
        });
        const pageCodes = new Set(records.pages.map(page => page.code));
        records.nodes.filter(node => node.nodeLevel === 'PAGE_LINK' && !pageCodes.has(node.targetDocumentationPage))
            .forEach(node => issues.push({ severity: 'error', rule: 'page-link-without-page', target: node.code }));
    },

    /** Validates public/authenticated/role/group/permission access policies. */
    validateAccess: function (records, issues) {
        records.accessPolicies.forEach(policy => {
            if (!VALID_ACCESS_MODES.includes(policy.accessMode)) {
                issues.push({ severity: 'error', rule: 'invalid-access-mode', target: policy.code });
            }
            if (policy.accessMode === 'PUBLIC' && (policy.publiclyAvailable !== true || policy.requiresAuthentication !== false)) {
                issues.push({ severity: 'error', rule: 'public-policy-not-public', target: policy.code });
            }
            if (['ROLE_BASED', 'GROUP_BASED', 'PERMISSION_BASED', 'RESTRICTED'].includes(policy.accessMode) &&
                !([].concat(policy.allowedRoles || []).length || [].concat(policy.allowedGroups || []).length ||
                    [].concat(policy.allowedPermissions || []).length)) {
                issues.push({ severity: 'error', rule: 'restricted-policy-without-principals', target: policy.code });
            }
        });
    },

    /** Validates that documentation pages carry visual explanation metadata. */
    validateVisuals: function (records, issues) {
        records.pages.filter(page => !Array.isArray(page.visualRequirements) || page.visualRequirements.length === 0)
            .forEach(page => issues.push({ severity: 'error', rule: 'missing-visual-requirements', target: page.code }));
    },

    /** Validates publication-state coverage for every editable documentation item kind. */
    validatePublicationCoverage: function (records, issues) {
        const published = new Set(records.publicationStates.map(state => state.targetType + ':' + state.targetCode));
        [
            ...records.products.map(item => ['PRODUCT', item.code]),
            ...records.navigation.map(item => ['NAVIGATION', item.code]),
            ...records.nodes.map(item => ['NODE', item.code]),
            ...records.dashboards.map(item => ['DASHBOARD', item.code]),
            ...records.pages.map(item => ['PAGE', item.code]),
            ...records.accessPolicies.map(item => ['ACCESS_POLICY', item.code]),
            ...records.searchMetadata.map(item => ['SEARCH_METADATA', item.code])
        ].filter(([type, code]) => !published.has(type + ':' + code))
            .forEach(([type, code]) => issues.push({ severity: 'error', rule: 'missing-publication-state', target: type + ':' + code }));
    },

    /** Validates search metadata for products, navigation, nodes, dashboards, and pages. */
    validateSearchCoverage: function (records, issues) {
        const indexed = new Set(records.searchMetadata.map(record => record.targetType + ':' + record.targetCode));
        [
            ...records.products.map(item => ['PRODUCT', item.code]),
            ...records.navigation.map(item => ['NAVIGATION', item.code]),
            ...records.nodes.map(item => ['NODE', item.code]),
            ...records.dashboards.map(item => ['DASHBOARD', item.code]),
            ...records.pages.map(item => ['PAGE', item.code])
        ].filter(([type, code]) => !indexed.has(type + ':' + code))
            .forEach(([type, code]) => issues.push({ severity: 'error', rule: 'missing-search-metadata', target: type + ':' + code }));
    },

    /** Builds the nPublish handoff request without owning the publication state machine. */
    publicationHandoff: function (request) {
        const body = this.payload(request);
        const readiness = this.validateAuthoringRecords({ documentation: body });
        const records = this.normalizeRecordPack(body.records || body);
        const publication = {
            code: body.publicationCode || 'documentation-' + this.checksum(body.records || body).slice(0, 16),
            domain: 'cms.documentation',
            rootType: 'documentationContentCatalog',
            rootCode: body.productCode || (records.products[0] || {}).code,
            sourceVersion: body.sourceVersion || 'staged',
            reason: body.reason || 'Axis documentation authoring submit to Publishing'
        };
        const targets = [
            ...records.products.map(item => ({ targetType: 'PRODUCT', targetCode: item.code })),
            ...records.navigation.map(item => ({ targetType: 'NAVIGATION', targetCode: item.code })),
            ...records.nodes.map(item => ({ targetType: 'NODE', targetCode: item.code })),
            ...records.pages.map(item => ({ targetType: 'PAGE', targetCode: item.code })),
            ...records.dashboards.map(item => ({ targetType: 'DASHBOARD', targetCode: item.code })),
            ...records.accessPolicies.map(item => ({ targetType: 'ACCESS_POLICY', targetCode: item.code })),
            ...records.searchMetadata.map(item => ({ targetType: 'SEARCH_METADATA', targetCode: item.code }))
        ];
        if (readiness.status !== 'READY') {
            return {
                contract: 'cms.documentation.publication-handoff/v1',
                status: 'BLOCKED',
                publicationAuthority: 'nPublish',
                domain: publication.domain,
                rootType: publication.rootType,
                targets,
                validation: readiness,
                publication,
                readiness
            };
        }
        return {
            contract: 'cms.documentation.publication-handoff/v1',
            status: 'READY_FOR_NPUBLISH',
            publicationAuthority: 'nPublish',
            domain: publication.domain,
            rootType: publication.rootType,
            targets,
            validation: readiness,
            publication,
            readiness
        };
    },

    /** Builds a migration plan from generated records to Axis-managed authored records. */
    migrationPlan: function (request) {
        const body = this.payload(request);
        const records = this.normalizeRecordPack(body.records || body);
        const pages = records.pages.map(page => ({
            documentId: page.documentId,
            sourcePath: page.sourcePath,
            sourceChecksum: page.sourceChecksum,
            ownerFunctionalModule: page.ownerFunctionalModule,
            editableInAxis: page.managedInAxis === true,
            preserveSourceEvidence: Boolean(page.sourcePath && page.sourceChecksum)
        }));
        return {
            contract: 'cms.documentation.migration-plan/v1',
            source: body.source || 'generated-content-pack',
            target: 'Axis-managed documentation records',
            importsRemainSeedTools: true,
            recordCount: pages.length,
            sourceEvidence: pages,
            actions: ['preserveSourceEvidence', 'importGeneratedRecords', 'enableAxisManagement'],
            pageCount: pages.length,
            pages,
            checksum: this.checksum(pages)
        };
    }
};
