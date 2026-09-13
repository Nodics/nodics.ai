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
