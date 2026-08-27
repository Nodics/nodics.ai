/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module nTooling/service/DefaultApplicationDocumentationRecordValidationService
 * @description Validates generated documentation content-catalog records for hierarchy, access, lifecycle, rendering, search, source evidence, and certification reporting.
 * @layer service
 * @owner nTooling
 * @override Projects may add stricter validation rules while preserving content-catalog authority, nPublish lifecycle ownership, and Axis/Nexus visibility boundaries.
 */

const crypto = require('crypto');

const BLOCKING = 'error';
const ADVISORY = 'warning';
const INFO = 'info';
const VALID_LIFECYCLE = new Set([
    'DRAFT',
    'STAGED',
    'REVIEW_IN_PROGRESS',
    'CHANGES_REQUESTED',
    'APPROVED',
    'REJECTED',
    'ONLINE',
    'ARCHIVED',
    'RETIRED',
    'ROLLBACK_PENDING',
    'PUBLICATION_FAILED'
]);
const VALID_ACCESS = new Set(['PUBLIC', 'AUTHENTICATED', 'ROLE_BASED', 'GROUP_BASED', 'PERMISSION_BASED', 'RESTRICTED']);
const BLOCKING_CATEGORIES = ['hierarchy', 'access', 'lifecycle', 'rendering', 'search', 'sourceEvidence'];
const REQUIRED_TRIGGERS_BY_TARGET = {
    ACCESS_POLICY: ['ACCESS_POLICY_CHANGE'],
    NAVIGATION: ['NAVIGATION_CHANGE'],
    NODE: ['NAVIGATION_CHANGE'],
    DASHBOARD: ['DASHBOARD_CHANGE'],
    PAGE: ['CONTENT_CHANGE', 'ACCESS_POLICY_CHANGE', 'SOURCE_EVIDENCE_CHANGE'],
    SEARCH_METADATA: ['SEARCH_METADATA_CHANGE']
};

const exportedService = {
    /** Returns a deterministic SHA-256 checksum for report and record evidence. */
    sha256: function (value) {
        return crypto.createHash('sha256').update(String(value || '')).digest('hex');
    },

    /** Returns array values from generated record maps or already-normalized arrays. */
    values: function (records) {
        if (Array.isArray(records)) return records;
        if (!records || typeof records !== 'object') return [];
        return Object.values(records);
    },

    /** Builds a stable validation lookup key for target type and code pairs. */
    key: function (targetType, targetCode) {
        return targetType + ':' + targetCode;
    },

    /** Checks whether an access policy requires explicit principals. */
    isRestricted: function (policy) {
        return ['ROLE_BASED', 'GROUP_BASED', 'PERMISSION_BASED', 'RESTRICTED'].includes(policy && policy.accessMode);
    },

    /** Creates a frozen validation issue record for report export. */
    createIssue: function (severity, category, rule, target, message, remediation, owner, audience) {
        return Object.freeze({
            severity,
            category,
            rule,
            target,
            message,
            remediation,
            owner: owner || 'nodics.docs',
            audience: audience || ['administrator', 'business-user', 'developer', 'operator'],
        });
    },

    /** Adds one issue to category counters and report issue list. */
    addIssue: function (report, issue) {
        report.issues.push(issue);
        report.categories[issue.category] = report.categories[issue.category] || { errors: 0, warnings: 0, infos: 0 };
        if (issue.severity === BLOCKING) report.categories[issue.category].errors += 1;
        else if (issue.severity === ADVISORY) report.categories[issue.category].warnings += 1;
        else report.categories[issue.category].infos += 1;
    },

    /** Creates the empty Axis-friendly validation report envelope. */
    createReport: function (options) {
        const now = options && options.generatedAt || new Date().toISOString();
        const report = {
            contract: 'nodics.documentation.validation/v1',
            generatedAt: now,
            release: options && options.release || '0.0.0',
            source: options && options.source || 'documentationContentCatalog',
            owner: options && options.owner || 'nodics.docs',
            targetAudience: ['business-user', 'administrator', 'developer', 'operator'],
            categories: Object.fromEntries(BLOCKING_CATEGORIES.map(category => [category, { errors: 0, warnings: 0, infos: 0 }])),
            checks: [],
            issues: [],
            summary: {
                totalChecks: 0,
                passed: 0,
                errors: 0,
                warnings: 0,
                infos: 0,
                readinessStatus: 'UNKNOWN',
                readinessScore: 0
            },
            integrity: {
                checksum: null,
                meaning: 'Deterministic digest for validation-report integrity; it is not a production approval signature.'
            }
        };
        return report;
    },

    /** Adds one validation check and optional issue. */
    addCheck: function (report, check) {
        const normalized = Object.assign({
            id: 'unnamed-check',
            category: 'hierarchy',
            severity: BLOCKING,
            owner: report.owner,
            audience: ['administrator', 'business-user', 'developer', 'operator'],
            passed: true,
            target: 'documentation',
            message: 'Validation check passed',
            remediation: 'No action required.'
        }, check || {});
        report.checks.push(normalized);
        if (!normalized.passed) {
            this.addIssue(report, this.createIssue(
                normalized.severity,
                normalized.category,
                normalized.id,
                normalized.target,
                normalized.message,
                normalized.remediation,
                normalized.owner,
                normalized.audience
            ));
        }
        return normalized;
    },

    /** Finalizes summary, score, and digest after all checks are collected. */
    finalizeReport: function (report) {
        const errors = report.issues.filter(issue => issue.severity === BLOCKING).length;
        const warnings = report.issues.filter(issue => issue.severity === ADVISORY).length;
        const infos = report.issues.filter(issue => issue.severity === INFO).length;
        const passed = report.checks.filter(check => check.passed).length;
        const totalChecks = report.checks.length;
        const score = totalChecks === 0 ? 0 : Math.max(0, Math.round((passed / totalChecks) * 100) - Math.min(warnings, 20));
        report.summary = {
            totalChecks,
            passed,
            errors,
            warnings,
            infos,
            readinessStatus: errors > 0 ? 'BLOCKED' : warnings > 0 ? 'READY_WITH_WARNINGS' : 'READY',
            readinessScore: score
        };
        const digestSource = Object.assign({}, report, { integrity: undefined });
        report.integrity.checksum = this.sha256(JSON.stringify(digestSource));
        return Object.freeze(report);
    },

    /** Validates one generated documentation record pack and returns an Axis-ready report. */
    validateRecords: function (request) {
        const records = request && request.records || {};
        const options = request && request.options || {};
        const report = this.createReport(options);
        const productRecords = this.values(records.products);
        const navigationRecords = this.values(records.navigation);
        const nodeRecords = this.values(records.nodes);
        const dashboardRecords = this.values(records.dashboards);
        const pageMetadataRecords = this.values(records.pages);
        const accessPolicyRecords = this.values(records.accessPolicies);
        const publicationStateRecords = this.values(records.publicationStates);
        const searchMetadataRecords = this.values(records.searchMetadata);
        const cmsPageRecords = this.values(records.cmsPages);
        const routeRecords = this.values(records.routes);
        const componentRecords = this.values(records.components);
        const manifestHashes = records.manifestHashes || {};

        const products = new Set(productRecords.map(item => item.code));
        const navigations = new Set(navigationRecords.map(item => item.code));
        const nodes = new Map(nodeRecords.map(item => [item.code, item]));
        const dashboards = new Map(dashboardRecords.map(item => [item.code, item]));
        const pages = new Map(pageMetadataRecords.map(item => [item.code, item]));
        const cmsPages = new Set(cmsPageRecords.map(item => item.code));
        const routes = new Set(routeRecords.map(item => item.code));
        const components = new Set(componentRecords.map(item => item.code));
        const policies = new Map(accessPolicyRecords.map(item => [item.code, item]));
        const publicationByTarget = new Map(publicationStateRecords.map(item => [this.key(item.targetType, item.targetCode), item]));
        const searchByTarget = new Map(searchMetadataRecords.map(item => [this.key(item.targetType, item.targetCode), item]));
        const topicCountByPage = new Map();

        this.addCheck(report, {
            id: 'product-content-catalog-alignment',
            category: 'hierarchy',
            passed: productRecords.length > 0 && productRecords.every(item => item.contentCatalog === 'documentationContentCatalog' && item.site && item.publicRootPath),
            target: 'cmsDocumentationProduct',
            message: 'Documentation product must point to the documentation content catalog, CMS Site, and root route.',
            remediation: 'Set contentCatalog, site, and publicRootPath on every documentation product record.',
        });

        this.addCheck(report, {
            id: 'navigation-root-and-search-controls',
            category: 'hierarchy',
            passed: navigationRecords.length > 0 && navigationRecords.every(item => products.has(item.product) && item.renderer === 'documentation.component.navigation' && item.expandable === true && item.searchPlaceholder),
            target: 'cmsDocumentationNavigation',
            message: 'Navigation must be expandable, searchable, renderer-bound, and product-owned.',
            remediation: 'Generate or repair cmsDocumentationNavigation with product, renderer, expandable, and search placeholder metadata.',
        });

        const duplicateOrders = new Set();
        const seenOrders = new Map();
        for (const node of nodeRecords) {
            const orderKey = [node.product, node.navigation, node.parentNode || 'ROOT', node.nodeOrder, node.locale || 'en', node.channel || 'web'].join('|');
            if (seenOrders.has(orderKey)) duplicateOrders.add(orderKey);
            seenOrders.set(orderKey, node.code);
        }
        this.addCheck(report, {
            id: 'duplicate-navigation-sibling-order',
            category: 'hierarchy',
            passed: duplicateOrders.size === 0,
            target: 'cmsDocumentationNode.nodeOrder',
            message: 'Sibling navigation nodes must not share order inside the same parent, locale, and channel.',
            remediation: 'Change the nodeOrder or parentNode for the duplicate navigation siblings.',
        });

        const missingParents = nodeRecords.filter(node => node.parentNode && !nodes.has(node.parentNode));
        this.addCheck(report, {
            id: 'orphan-navigation-node',
            category: 'hierarchy',
            passed: missingParents.length === 0,
            target: missingParents.map(node => node.code).join(', ') || 'cmsDocumentationNode.parentNode',
            message: 'Every child node must reference an existing parent node.',
            remediation: 'Create the missing parent node or move the child under an existing section/group/subgroup.',
        });

        let hasCycle = false;
        for (const node of nodeRecords) {
            const visited = new Set();
            let cursor = node;
            while (cursor && cursor.parentNode) {
                if (visited.has(cursor.code)) {
                    hasCycle = true;
                    break;
                }
                visited.add(cursor.code);
                cursor = nodes.get(cursor.parentNode);
            }
        }
        this.addCheck(report, {
            id: 'circular-navigation-hierarchy',
            category: 'hierarchy',
            passed: !hasCycle,
            target: 'cmsDocumentationNode.parentNode',
            message: 'Documentation hierarchy must not contain circular parent-child relationships.',
            remediation: 'Break the loop by assigning one node to an ancestor-free parent.',
        });

        for (const node of nodeRecords.filter(item => item.nodeLevel === 'TOPIC')) {
            topicCountByPage.set(node.targetDocumentationPage, (topicCountByPage.get(node.targetDocumentationPage) || 0) + 1);
        }
        const pagesWithoutOneTopic = pageMetadataRecords.filter(page => topicCountByPage.get(page.code) !== 1);
        this.addCheck(report, {
            id: 'page-topic-cardinality',
            category: 'hierarchy',
            passed: pagesWithoutOneTopic.length === 0,
            target: pagesWithoutOneTopic.map(page => page.documentId || page.code).join(', ') || 'cmsDocumentationPage',
            message: 'Every documentation page must belong to exactly one topic node.',
            remediation: 'Create one topic node for the page, or remove duplicate topic nodes pointing to the same page.',
        });

        const brokenTopicTargets = nodeRecords.filter(node => node.nodeLevel === 'TOPIC' && (!node.targetDocumentationPage || !pages.has(node.targetDocumentationPage)));
        this.addCheck(report, {
            id: 'topic-page-target',
            category: 'rendering',
            passed: brokenTopicTargets.length === 0,
            target: brokenTopicTargets.map(node => node.code).join(', ') || 'cmsDocumentationNode.targetDocumentationPage',
            message: 'Every topic node must point to an existing documentation page metadata record.',
            remediation: 'Assign targetDocumentationPage to an existing page metadata record.',
        });

        const invalidDashboards = dashboardRecords.filter(item => !item.ownerType || !item.ownerCode || !item.summary || !item.contentArea || !Array.isArray(item.cards));
        this.addCheck(report, {
            id: 'dashboard-content-area',
            category: 'rendering',
            passed: invalidDashboards.length === 0,
            target: invalidDashboards.map(item => item.code).join(', ') || 'cmsDocumentationDashboard',
            message: 'Every hierarchy dashboard must have owner, summary, content area, and cards.',
            remediation: 'Populate dashboard ownerType, ownerCode, summary, contentArea, and cards.',
        });

        const missingNodeDashboards = nodeRecords.filter(node => node.nodeType === 'CONTAINER' && (!node.nodeDashboard || !dashboards.has(node.nodeDashboard) || !node.nodeContentArea));
        this.addCheck(report, {
            id: 'container-dashboard-reference',
            category: 'rendering',
            passed: missingNodeDashboards.length === 0,
            target: missingNodeDashboards.map(node => node.code).join(', ') || 'cmsDocumentationNode.nodeDashboard',
            message: 'Container nodes must expose dashboard/content-area metadata.',
            remediation: 'Attach a dashboard and nodeContentArea to every section, group, and subgroup node.',
        });

        const missingRenderRecords = pageMetadataRecords.filter(page => !cmsPages.has(page.targetPage) || !routes.has(page.targetRoute) || !components.has(page.articleComponent));
        this.addCheck(report, {
            id: 'page-route-component-reference',
            category: 'rendering',
            passed: missingRenderRecords.length === 0,
            target: missingRenderRecords.map(page => page.documentId || page.code).join(', ') || 'cmsDocumentationPage',
            message: 'Every documentation page metadata record must reference CMS page, route, and article component records.',
            remediation: 'Generate or repair targetPage, targetRoute, and articleComponent references.',
        });

        const policyTargets = [
            ...productRecords.map(item => ({ type: 'PRODUCT', code: item.code, accessPolicy: item.accessPolicy, accessMode: item.accessMode, lifecycleState: item.lifecycleState })),
            ...navigationRecords.map(item => ({ type: 'NAVIGATION', code: item.code, accessPolicy: item.accessPolicy, accessMode: item.accessMode, lifecycleState: item.lifecycleState })),
            ...nodeRecords.map(item => ({ type: 'NODE', code: item.code, accessPolicy: item.accessPolicy, accessMode: item.accessMode, lifecycleState: item.lifecycleState })),
            ...dashboardRecords.map(item => ({ type: 'DASHBOARD', code: item.code, accessPolicy: item.accessPolicy, accessMode: item.accessMode, lifecycleState: item.lifecycleState })),
            ...pageMetadataRecords.map(item => ({ type: 'PAGE', code: item.code, accessPolicy: item.accessPolicy, accessMode: item.accessMode, lifecycleState: item.lifecycleState })),
            ...searchMetadataRecords.map(item => ({ type: 'SEARCH_METADATA', code: item.code, accessPolicy: item.accessPolicy, accessMode: item.accessMode, lifecycleState: item.lifecycleState })),
        ];
        const policyCoversTarget = (item) => Boolean(item.accessPolicy && policies.has(item.accessPolicy)) ||
            accessPolicyRecords.some(policy => policy.targetType === item.type && policy.targetCode === item.code) ||
            accessPolicyRecords.some(policy => policy.targetType === 'PRODUCT' && products.has(policy.targetCode) && policy.accessMode === item.accessMode);
        const missingPolicies = policyTargets.filter(item => !VALID_ACCESS.has(item.accessMode) || !policyCoversTarget(item));
        this.addCheck(report, {
            id: 'access-policy-presence',
            category: 'access',
            passed: missingPolicies.length === 0,
            target: missingPolicies.map(item => this.key(item.type, item.code)).join(', ') || 'cmsDocumentationAccessPolicy',
            message: 'Every renderable documentation record must carry a valid access policy and access mode.',
            remediation: 'Assign a generated or Axis-managed access policy to each product, navigation, node, dashboard, page, and search record.',
        });

        const invalidPublicPolicies = accessPolicyRecords.filter(policy => policy.accessMode === 'PUBLIC' && (policy.publiclyAvailable !== true || policy.requiresAuthentication !== false || !Array.isArray(policy.lifecycleVisibility) || !policy.lifecycleVisibility.includes('ONLINE')));
        this.addCheck(report, {
            id: 'public-online-only-policy',
            category: 'access',
            passed: invalidPublicPolicies.length === 0,
            target: invalidPublicPolicies.map(policy => policy.code).join(', ') || 'PUBLIC access policy',
            message: 'Public documentation policies must be anonymous-readable and Online-only.',
            remediation: 'Set publiclyAvailable true, requiresAuthentication false, and lifecycleVisibility including ONLINE for public policies.',
        });

        const invalidRestrictedPolicies = accessPolicyRecords.filter(policy => this.isRestricted(policy) &&
            !(Array.isArray(policy.allowedGroups) && policy.allowedGroups.length ||
                Array.isArray(policy.allowedPermissions) && policy.allowedPermissions.length ||
                Array.isArray(policy.allowedRoles) && policy.allowedRoles.length));
        this.addCheck(report, {
            id: 'restricted-policy-principals',
            category: 'access',
            passed: invalidRestrictedPolicies.length === 0,
            target: invalidRestrictedPolicies.map(policy => policy.code).join(', ') || 'restricted access policy',
            message: 'Restricted policies must define allowed roles, groups, or permissions.',
            remediation: 'Add allowedRoles, allowedGroups, or allowedPermissions to restricted documentation policies.',
        });

        const publicNonOnline = policyTargets.filter(item => item.accessMode === 'PUBLIC' && item.lifecycleState && item.lifecycleState !== 'ONLINE');
        this.addCheck(report, {
            id: 'public-record-online-state',
            category: 'access',
            passed: publicNonOnline.length === 0,
            target: publicNonOnline.map(item => this.key(item.type, item.code)).join(', ') || 'public documentation records',
            message: 'Nexus-visible public documentation records must be Online.',
            remediation: 'Keep draft/staged/review records out of public payloads until nPublish activates them Online.',
        });

        const optionalPublicationStringFields = [
            'onlineVersion',
            'previousOnlineVersion',
            'submittedBy',
            'submittedAt',
            'reviewer',
            'reviewedAt',
            'approver',
            'approvedAt',
            'publisher',
            'publishedAt',
        ];
        const invalidPublication = publicationStateRecords.filter(item => !VALID_LIFECYCLE.has(item.lifecycleState) || !item.checksum || item.workflowRequired !== true ||
            !Array.isArray(item.workflowTriggers) || item.workflowTriggers.length === 0 || !item.validationResult ||
            item.validationResult.publicationPath !== 'STAGED_REVIEW_APPROVAL_ONLINE' || !item.decisionPolicy ||
            item.decisionPolicy.permissionEnforced !== true || item.decisionPolicy.adminOverrideAudited !== true ||
            !Object.prototype.hasOwnProperty.call(item, 'author') || !Object.prototype.hasOwnProperty.call(item, 'reviewer') ||
            !Object.prototype.hasOwnProperty.call(item, 'approver') || !Object.prototype.hasOwnProperty.call(item, 'publisher') ||
            optionalPublicationStringFields.some(field => item[field] === null));
        this.addCheck(report, {
            id: 'publication-state-evidence',
            category: 'lifecycle',
            passed: invalidPublication.length === 0,
            target: invalidPublication.map(item => item.code).join(', ') || 'cmsDocumentationPublicationState',
            message: 'Publication states must carry lifecycle, checksum, workflow, decision policy, and actor evidence.',
            remediation: 'Regenerate or repair publication state records with workflow triggers, decisionPolicy, and actor audit fields.',
        });

        const publishableTargets = [
            ...productRecords.map(item => ({ type: 'PRODUCT', code: item.code })),
            ...navigationRecords.map(item => ({ type: 'NAVIGATION', code: item.code })),
            ...nodeRecords.map(item => ({ type: 'NODE', code: item.code })),
            ...dashboardRecords.map(item => ({ type: 'DASHBOARD', code: item.code })),
            ...pageMetadataRecords.map(item => ({ type: 'PAGE', code: item.code })),
            ...accessPolicyRecords.map(item => ({ type: 'ACCESS_POLICY', code: item.code })),
            ...searchMetadataRecords.map(item => ({ type: 'SEARCH_METADATA', code: item.code })),
        ];
        const missingPublication = publishableTargets.filter(item => !publicationByTarget.has(this.key(item.type, item.code)));
        this.addCheck(report, {
            id: 'publication-state-coverage',
            category: 'lifecycle',
            passed: missingPublication.length === 0,
            target: missingPublication.map(item => this.key(item.type, item.code)).join(', ') || 'publishable documentation records',
            message: 'Every publishable documentation item must have publication-state evidence.',
            remediation: 'Generate cmsDocumentationPublicationState records for product, navigation, node, dashboard, and page items.',
        });

        const workflowTargets = [
            ...accessPolicyRecords.map(item => ({ type: 'ACCESS_POLICY', code: item.code, record: item })),
            ...navigationRecords.map(item => ({ type: 'NAVIGATION', code: item.code, record: item })),
            ...nodeRecords.map(item => ({ type: 'NODE', code: item.code, record: item })),
            ...dashboardRecords.map(item => ({ type: 'DASHBOARD', code: item.code, record: item })),
            ...pageMetadataRecords.map(item => ({ type: 'PAGE', code: item.code, record: item })),
            ...searchMetadataRecords.map(item => ({ type: 'SEARCH_METADATA', code: item.code, record: item })),
        ];
        const missingWorkflow = workflowTargets.filter(item => item.record.workflowRequired !== true || !Array.isArray(item.record.workflowTriggers) || item.record.workflowTriggers.length === 0);
        this.addCheck(report, {
            id: 'workflow-trigger-presence',
            category: 'lifecycle',
            passed: missingWorkflow.length === 0,
            target: missingWorkflow.map(item => this.key(item.type, item.code)).join(', ') || 'workflow-enabled records',
            message: 'Editable documentation records must define workflow triggers.',
            remediation: 'Add workflowRequired and workflowTriggers to Axis-managed documentation records.',
        });

        const triggerConflicts = workflowTargets.filter(item => (REQUIRED_TRIGGERS_BY_TARGET[item.type] || []).some(trigger => !item.record.workflowTriggers.includes(trigger)));
        this.addCheck(report, {
            id: 'field-change-workflow-trigger',
            category: 'lifecycle',
            passed: triggerConflicts.length === 0,
            target: triggerConflicts.map(item => this.key(item.type, item.code)).slice(0, 20).join(', ') || 'workflow trigger map',
            message: 'Records with editable content, navigation, dashboard, access, source, or search fields must include matching workflow triggers.',
            remediation: 'Add the relevant CONTENT_CHANGE, NAVIGATION_CHANGE, DASHBOARD_CHANGE, ACCESS_POLICY_CHANGE, SOURCE_EVIDENCE_CHANGE, or SEARCH_METADATA_CHANGE trigger.',
        });

        const invalidSearch = searchMetadataRecords.filter(item => !item.searchText || !Array.isArray(item.keywords) || !item.facets || !item.accessPolicy || !VALID_ACCESS.has(item.accessMode) || !VALID_LIFECYCLE.has(item.lifecycleState) || item.indexState !== 'INDEX_READY');
        this.addCheck(report, {
            id: 'search-metadata-index-ready',
            category: 'search',
            passed: invalidSearch.length === 0,
            target: invalidSearch.map(item => item.code).join(', ') || 'cmsDocumentationSearchMetadata',
            message: 'Search metadata must be index-ready with keyword, facet, access, and lifecycle filters.',
            remediation: 'Regenerate or repair title, summary, searchText, keywords, facets, accessPolicy, lifecycleState, and indexState.',
        });

        const missingSearch = [
            ...productRecords.map(item => ({ type: 'PRODUCT', code: item.code })),
            ...navigationRecords.map(item => ({ type: 'NAVIGATION', code: item.code })),
            ...nodeRecords.map(item => ({ type: 'NODE', code: item.code })),
            ...dashboardRecords.map(item => ({ type: 'DASHBOARD', code: item.code })),
            ...pageMetadataRecords.map(item => ({ type: 'PAGE', code: item.code })),
        ].filter(item => !searchByTarget.has(this.key(item.type, item.code)));
        this.addCheck(report, {
            id: 'search-metadata-coverage',
            category: 'search',
            passed: missingSearch.length === 0,
            target: missingSearch.map(item => this.key(item.type, item.code)).join(', ') || 'search target coverage',
            message: 'Products, navigation nodes, dashboards, and pages must have search metadata.',
            remediation: 'Generate cmsDocumentationSearchMetadata records for every searchable product, node, dashboard, and page.',
        });

        const invalidSources = pageMetadataRecords.filter(item => !item.sourceRepository || !item.sourcePath || !/^[a-f0-9]{64}$/.test(item.sourceChecksum || '') || !Number.isInteger(item.sourceWordCount));
        this.addCheck(report, {
            id: 'source-evidence-and-checksum',
            category: 'sourceEvidence',
            passed: invalidSources.length === 0,
            target: invalidSources.map(item => item.documentId || item.code).join(', ') || 'cmsDocumentationPage.sourceEvidence',
            message: 'Page metadata must preserve source repository, source path, checksum, and word count.',
            remediation: 'Regenerate page metadata from source Markdown or repair the source evidence fields.',
        });

        const missingVisuals = pageMetadataRecords.filter(item => !Array.isArray(item.visualRequirements) || item.visualRequirements.length === 0 || !Array.isArray(item.diagrams) || !Array.isArray(item.visualAssets));
        this.addCheck(report, {
            id: 'visual-requirement-evidence',
            category: 'rendering',
            passed: missingVisuals.length === 0,
            target: missingVisuals.map(item => item.documentId || item.code).join(', ') || 'visual requirements',
            message: 'Page metadata must preserve diagrams, visual assets, and declared visual requirements.',
            remediation: 'Add diagrams, tables, screenshots, schema models, or equivalent visual evidence and regenerate metadata.',
        });

        const brokenRelatedPages = pageMetadataRecords.filter(item => Array.isArray(item.relatedPages) && item.relatedPages.some(related => ![...pages.values()].some(page => page.documentId === related)));
        this.addCheck(report, {
            id: 'related-page-reference',
            category: 'hierarchy',
            passed: brokenRelatedPages.length === 0,
            target: brokenRelatedPages.map(item => item.documentId || item.code).join(', ') || 'relatedPages',
            message: 'Related page references must point to known documentation pages.',
            remediation: 'Correct relatedPages values or add the missing target page to the catalogue.',
        });

        const shallowSummaries = pageMetadataRecords.filter(item => !item.businessSummary || !item.technicalSummary || !item.summary);
        this.addCheck(report, {
            id: 'business-technical-summary',
            category: 'sourceEvidence',
            passed: shallowSummaries.length === 0,
            target: shallowSummaries.map(item => item.documentId || item.code).join(', ') || 'page summaries',
            message: 'Page metadata must contain detailed summary, business summary, and technical summary.',
            remediation: 'Add business and technical perspective content before publishing the page.',
        });

        const hashMismatch = Object.entries(manifestHashes).filter(([, hash]) => !/^[a-f0-9]{64}$/.test(hash || ''));
        this.addCheck(report, {
            id: 'manifest-checksum-shape',
            category: 'sourceEvidence',
            passed: hashMismatch.length === 0,
            target: hashMismatch.map(([file]) => file).join(', ') || 'data manifest generatedHashes',
            message: 'Generated manifest hashes must be stable SHA-256 values.',
            remediation: 'Regenerate the content pack manifest after generated records change.',
        });

        return this.finalizeReport(report);
    },

    /** Throws a concise error if the report contains blocking errors. */
    assertReady: function (report) {
        if (report.summary.errors > 0) {
            const first = report.issues.find(issue => issue.severity === BLOCKING);
            const detail = first ? ': ' + first.rule + ' - ' + first.message : '';
            const error = new Error('Documentation validation failed' + detail);
            error.report = report;
            throw error;
        }
        return true;
    },

    /** Formats a validation report for actionRepo or human review. */
    formatMarkdown: function (report) {
        const lines = [
            '# Documentation Validation Readiness Report',
            '',
            `Generated At: ${report.generatedAt}`,
            `Release: ${report.release}`,
            `Source: ${report.source}`,
            `Owner: ${report.owner}`,
            '',
            '## Summary',
            '',
            '| Metric | Value |',
            '| --- | ---: |',
            `| Total checks | ${report.summary.totalChecks} |`,
            `| Passed | ${report.summary.passed} |`,
            `| Errors | ${report.summary.errors} |`,
            `| Warnings | ${report.summary.warnings} |`,
            `| Infos | ${report.summary.infos} |`,
            `| Readiness score | ${report.summary.readinessScore} |`,
            '',
            `Readiness Status: ${report.summary.readinessStatus}`,
            '',
            '## Categories',
            '',
            '| Category | Errors | Warnings | Infos |',
            '| --- | ---: | ---: | ---: |',
            ...Object.entries(report.categories).map(([category, item]) => `| ${category} | ${item.errors} | ${item.warnings} | ${item.infos} |`),
            '',
            '## Issues',
            ''
        ];
        if (report.issues.length === 0) {
            lines.push('No blocking or advisory issues were found.');
        } else {
            lines.push('| Severity | Category | Rule | Target | Remediation |');
            lines.push('| --- | --- | --- | --- | --- |');
            report.issues.forEach(issue => {
                lines.push(`| ${issue.severity} | ${issue.category} | ${issue.rule} | ${issue.target || 'documentation'} | ${issue.remediation || ''} |`);
            });
        }
        lines.push('', '## Integrity', '', `Checksum: ${report.integrity.checksum}`, '');
        return lines.join('\n');
    }
};

module.exports = exportedService;
