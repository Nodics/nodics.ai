/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';

/** @module copilotCapability/src/service/defaultCopilotExperienceCapabilityService @description Declares channel-neutral assistance and future commerce capability contracts for domain adapters. @layer service @owner copilotCapability @override Commerce, Engagement, WCMS, Platform, and project modules contribute handlers through these descriptors. */
module.exports = {
    /** Returns standard capability descriptors with no embedded domain implementation. @returns {Object[]} Provider-neutral capability descriptors. */
    descriptors: function () {
        return [
            { code: 'nodics.help.search', owner: 'copilotKnowledge', permission: 'copilot.help.read', mutates: false, maturity: 'IMPLEMENTED' },
            { code: 'framework.modules.list', owner: 'backoffice', permission: 'backoffice.registry.view', riskClass: 'INTERNAL_READ', mutates: false, maturity: 'IMPLEMENTED' },
            { code: 'framework.modules.count', owner: 'backoffice', permission: 'backoffice.registry.view', riskClass: 'INTERNAL_READ', mutates: false, maturity: 'IMPLEMENTED' },
            { code: 'framework.modules.describe', owner: 'backoffice', permission: 'backoffice.registry.view', riskClass: 'INTERNAL_READ', mutates: false, maturity: 'IMPLEMENTED' },
            { code: 'nodics.data.query', owner: 'copilotCapability', permission: 'copilot.data.query', mutates: false, maturity: 'IMPLEMENTED' },
            { code: 'nodics.data.export', owner: 'copilotCapability', permission: 'copilot.data.export', mutates: false, maturity: 'IMPLEMENTED' },
            { code: 'nodics.workbench.prepare', owner: 'copilotWorkbench', permission: 'copilot.mutation.prepare', mutates: false, maturity: 'IMPLEMENTED' },
            { code: 'nodics.workbench.execute', owner: 'copilotWorkbench', permission: 'copilot.mutation.execute', mutates: true, maturity: 'IMPLEMENTED' },
            { code: 'experience.issue.assist', owner: 'engagementCopilot', permission: 'copilot.experience.assist', mutates: false, maturity: 'ADAPTER_REQUIRED' },
            { code: 'commerce.product.discover', owner: 'commerceCopilot', permission: 'copilot.commerce.read', mutates: false, maturity: 'ADAPTER_REQUIRED' },
            { code: 'commerce.cart.propose', owner: 'commerceCopilot', permission: 'copilot.commerce.propose', mutates: false, maturity: 'FUTURE' },
            { code: 'commerce.checkout.execute', owner: 'commerceCopilot', permission: 'copilot.commerce.execute', mutates: true, maturity: 'FUTURE' }
        ];
    }
};
