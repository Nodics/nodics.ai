/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module copilotPolicy/config/properties
 * @description Defines generated configurable defaults for copilotPolicy.
 * @layer config
 * @owner generated
 * @override Project, environment, server, node, tenant, or customer layers may override these defaults through Nodics configuration layering.
 */
module.exports = {
    copilot: { policy: {
        administration: { delegations: [], presentation: {
            title: 'Copilot Settings', refresh: 'Refresh settings', awaiting: 'Awaiting runtime approval',
            tenantScope: 'Tenant-wide setting. Affects all enterprises on this runtime.', enterpriseScope: 'Enterprise',
            checkProvider: 'Check configured model', maximum: 'Maximum', reason: 'Reason for change', schedule: 'Earliest activation (optional)',
            review: 'Review proposal', reviewTitle: 'Review changes', submit: 'Submit for approval', readOnly: 'Read-only access.',
            empty: 'No settings available in this context.', history: 'Configuration requests', historyRefresh: 'Refresh request history',
            historyEmpty: 'No enterprise-bound requests in this page.', previous: 'Previous page', next: 'Next page', page: 'Page',
            before: 'Before', after: 'After', section: 'Settings section'
        } },
        clarifyAmbiguousRequests: true, confirmationTtlMs: 300000,
        mutationPermissions: ['copilot.mutation.prepare', 'copilot.mutation.execute'],
        redactFields: ['password', 'secret', 'token', 'authorization'],
        channels: ['PUBLIC', 'CUSTOMER', 'EMPLOYEE', 'SYSTEM'],
        classifications: ['PUBLIC', 'CUSTOMER', 'INTERNAL', 'RESTRICTED'],
        riskClasses: ['PUBLIC_READ', 'AUTHENTICATED_SELF_READ', 'INTERNAL_READ', 'SENSITIVE_READ', 'EXPORT', 'CREATE', 'UPDATE', 'DELETE', 'ADMINISTRATIVE'],
        permissions: {
            internalKnowledge: 'copilot.knowledge.internal.read',
            restrictedKnowledge: 'copilot.knowledge.restricted.read',
            customerKnowledge: 'copilot.knowledge.customer.read',
            sourceManage: 'copilot.knowledge.source.manage'
        }
    } }
};
