/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module axis/data/init/data/axis/axisCmsTemplateData
 * @description Defines the initial Axis authentication and secured dashboard page templates.
 * @layer data
 * @owner axis
 */
const AXIS_FUNCTIONAL_MODULE = 'nodics.platform';
const withAxisOwnership = records => {
    Object.keys(records).forEach(key => {
        records[key].functionalModule = AXIS_FUNCTIONAL_MODULE;
        records[key].activationMode = 'PLATFORM_ACTIVE';
    });
    return records;
};

module.exports = withAxisOwnership({
    record0: {
        code: 'axisAuthenticationPageTemplate',
        name: 'Axis Authentication Page',
        renderer: 'axis.template.authentication',
        contractVersion: 0,
        slots: ['axisAuthenticationShowcaseSlot', 'axisAuthenticationBrandSlot', 'axisAuthenticationIntroductionSlot', 'axisAuthenticationFormSlot',
            'axisAuthenticationAssistanceSlot', 'axisAuthenticationLegalSlot'],
        active: true
    },
    record1: {
        code: 'axisDashboardPageTemplate',
        name: 'Axis Dashboard Page',
        renderer: 'axis.template.dashboard',
        contractVersion: 0,
        slots: ['axisDashboardWelcomeSlot', 'axisDashboardSummarySlot',
            'axisDashboardActionsSlot', 'axisDashboardActivitySlot', 'axisDashboardHelpSlot'],
        active: true
    },
    record2: {
        code: 'axisAssistantPageTemplate', name: 'Axis Assistant Workspace',
        renderer: 'axis.template.assistant', contractVersion: 0,
        slots: ['axisAssistantHeaderSlot', 'axisAssistantWorkspaceSlot'], active: true
    },
    record3: {
        code: 'axisSchemaWorkbenchPageTemplate', name: 'Axis Schema Workbench',
        renderer: 'axis.template.schema-workbench', contractVersion: 0,
        slots: ['axisSchemaWorkbenchHeaderSlot', 'axisSchemaWorkbenchContentSlot'], active: true
    },
    record4: {
        code: 'axisMediaManagementPageTemplate', name: 'Axis Media Management',
        renderer: 'axis.template.media-management', contractVersion: 0,
        slots: ['axisMediaManagementWorkspaceSlot'], active: true
    },
    record5: {
        code: 'axisPlatformPageTemplate', name: 'Axis Platform Workspace',
        renderer: 'axis.template.platform', contractVersion: 0,
        slots: ['axisPlatformContentSlot'], active: true
    }
});
