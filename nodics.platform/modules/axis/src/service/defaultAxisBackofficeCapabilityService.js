/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module axis/service/DefaultAxisBackofficeCapabilityService @description Publishes the concrete axis-owned BackOffice capability projection. @layer service @owner axis */
const capability = {
    "enabled": true,
    "capabilityId": "axis-product-data",
    "displayName": "Nodics Axis",
    "category": "platform",
    "icon": "content",
    "contractVersion": 0,
    "minimumClientContractVersion": 0,
    "roles": [
        "UI_COMPOSITION_PROVIDER"
    ],
    "documentation": [
        {
            "id": "nodics-axis",
            "guide": "axis",
            "label": "Nodics Axis",
            "type": "CMS",
            "route": "/docs/nodics-axis",
            "order": 300,
            "connectionModule": "cms",
            "site": "axisDocumentationSite",
            "catalog": "documentationContentCatalog",
            "defaultPage": "/docs/nodics-axis",
            "packCode": "axisDocumentation",
            "initializationProfile": "axisdocs",
            "dashboard": {
                "kind": "Application guide",
                "icon": "schema",
                "summary": "Short user-facing guidance for the Nodics Axis BackOffice client, shell, workbench, and business workspaces.",
                "audiences": [
                    "administrator",
                    "business-user",
                    "operator"
                ],
                "coverage": {
                    "score": 78,
                    "status": "STRONG",
                    "signals": [
                        "Application shell guidance",
                        "Schema Workbench entry points",
                        "Media Management flow notes",
                        "OpenAPI reference grouping",
                        "Common mistakes and verification gates"
                    ],
                    "gaps": [
                        "More screenshot-led walkthroughs",
                        "More role-specific recipes",
                        "More live operator playbooks"
                    ]
                }
            }
        }
    ],
    "navigation": []
};

module.exports = {
    /** Registers this module BackOffice capability provider. */
    init: function () {
        SERVICE.DefaultModuleRegistrationAgentService.registerBackofficeCapabilityProvider('axis', this);
        return Promise.resolve(true);
    },
    /** Completes provider lifecycle initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns this module owned BackOffice capability contract. */
    getCapability: function () { return JSON.parse(JSON.stringify(capability)); },
    /** Contributes Axis shell copy to the Framework Localization owner. */
    getLocalizationContribution: function () {
        return {
            formatVersion: 1,
            ownerModule: 'axis',
            entries: [
                ['skip-to-main-content', 'Skip to main content'],
                ['unsaved.area-title', 'Switch documentation area?'],
                ['unsaved.description', 'Changes you have not saved will be lost.'],
                ['unsaved.keep-editing', 'Keep editing'],
                ['unsaved.switch-area', 'Discard and switch'],
                ['unsaved.leave-title', 'Leave this page?'],
                ['unsaved.leave-page', 'Leave page'],
                ['documentation.page-title', 'Page title'],
                ['documentation.title-required', 'Enter a page title.'],
                ['documentation.page-url', 'Page URL'],
                ['documentation.summary', 'Reader summary'],
                ['documentation.audience', 'Audience'],
                ['documentation.page-content', 'Page content'],
                ['documentation.details', 'Page details'],
                ['documentation.reader-metadata', 'Reader metadata saved with the staged page'],
                ['documentation.content-help', 'Write the page content. Add links, images, lists, code snippets, tables, and notes.'],
                ['documentation.new-page', 'New page'],
                ['documentation.navigation', 'Navigation'],
                ['documentation.editing-navigation', 'Editing navigation placement'],
                ['documentation.editing-page', 'Editing staged documentation'],
                ['documentation.preview-title', 'Staged documentation preview'],
                ['documentation.editing-navigation-help', 'Place this page in the reader navigation, then save it to Staged.'],
                ['documentation.editing-page-help', 'Update the reader page, then save it to Staged.'],
                ['documentation.preview-help', 'Preview exactly how this staged page reads before publishing.'],
                ['documentation.saving', 'Saving'],
                ['documentation.save', 'Save staged'],
                ['documentation.preview-page', 'Preview page'],
                ['documentation.back-editing', 'Back to page editing'],
                ['documentation.preview', 'Preview'],
                ['documentation.edit', 'Edit page'],
                ['documentation.link', 'Link navigation'],
                ['documentation.reopen', 'Reopen a staged page'],
                ['documentation.submit', 'Submit saved draft for review'],
                ['documentation.open-request', 'Open publication request'],
                ['documentation.submitted', 'The saved draft was submitted for review.'],
                ['documentation.heading', 'Create and publish documentation'],
                ['documentation.intro', 'Create pages, organize links, preview the reader experience, and publish approved documentation to Axis and Nexus.'],
                ['documentation.area', 'Documentation area'],
                ['authentication.axisauthenticationshowcasecomponent.eyebrow', 'Nodics enterprise operations'],
                ['authentication.axisauthenticationshowcasecomponent.title', 'One governed workspace for every business capability.'],
                ['authentication.axisauthenticationshowcasecomponent.message', 'Discover active modules, operate secure workflows, and keep every action inside its authoritative Nodics contract.'],
                ['authentication.axisauthenticationshowcasecomponent.highlights.0', 'Employee-only access'],
                ['authentication.axisauthenticationshowcasecomponent.highlights.1', 'Direct module connectivity'],
                ['authentication.axisauthenticationshowcasecomponent.highlights.2', 'Contract-governed operations'],
                ['authentication.axisbrandcomponent.tagline', 'Business operations, connected.'],
                ['authentication.axisloginintroductioncomponent.title', 'Welcome back'],
                ['authentication.axisloginintroductioncomponent.message', 'Sign in with your employee account to access Nodics Axis.'],
                ['authentication.axisemployeeloginformcomponent.enterpriselabel', 'Enterprise code'],
                ['authentication.axisemployeeloginformcomponent.usernamelabel', 'Username'],
                ['authentication.axisemployeeloginformcomponent.usernameplaceholder', 'Enter your username'],
                ['authentication.axisemployeeloginformcomponent.passwordlabel', 'Password'],
                ['authentication.axisemployeeloginformcomponent.passwordplaceholder', 'Enter your password'],
                ['authentication.axisemployeeloginformcomponent.submitlabel', 'Sign in'],
                ['authentication.axisforgotpasswordlinkcomponent.label', 'Forgot password?'],
                ['authentication.axisloginsecuritycomponent.title', 'Employee access only'],
                ['authentication.axisloginsecuritycomponent.message', 'Customer accounts cannot access this application.'],
                ['authentication.axislegalcomponent.title', 'Authorized use'],
                ['authentication.axislegalcomponent.message', 'Use of Nodics Axis is limited to authorized employees.'],
                ['authentication.secure-footer', 'Secure employee access • Nodics contract governance'],
                ['authentication.axisauthenticationshowcasecomponent.eyebrow.source', 'Nodics enterprise operations'],
                ['authentication.axisauthenticationshowcasecomponent.title.source', 'One governed workspace for every business capability.'],
                ['authentication.axisauthenticationshowcasecomponent.message.source', 'Discover active modules, operate secure workflows, and keep every action inside its authoritative Nodics contract.'],
                ['authentication.axisauthenticationshowcasecomponent.highlights.0.source', 'Employee-only access'],
                ['authentication.axisauthenticationshowcasecomponent.highlights.1.source', 'Direct module connectivity'],
                ['authentication.axisauthenticationshowcasecomponent.highlights.2.source', 'Contract-governed operations'],
                ['authentication.axisbrandcomponent.tagline.source', 'Business operations, connected.'],
                ['authentication.axisloginintroductioncomponent.title.source', 'Welcome back'],
                ['authentication.axisloginintroductioncomponent.message.source', 'Sign in with your employee account to access Nodics Axis.'],
                ['authentication.axisemployeeloginformcomponent.enterpriselabel.source', 'Enterprise code'],
                ['authentication.axisemployeeloginformcomponent.usernamelabel.source', 'Username'],
                ['authentication.axisemployeeloginformcomponent.usernameplaceholder.source', 'Enter your username'],
                ['authentication.axisemployeeloginformcomponent.passwordlabel.source', 'Password'],
                ['authentication.axisemployeeloginformcomponent.passwordplaceholder.source', 'Enter your password'],
                ['authentication.axisemployeeloginformcomponent.submitlabel.source', 'Sign in'],
                ['authentication.axisforgotpasswordlinkcomponent.label.source', 'Forgot password?'],
                ['authentication.axisloginsecuritycomponent.title.source', 'Employee access only'],
                ['authentication.axisloginsecuritycomponent.message.source', 'Customer accounts cannot access this application.'],
                ['authentication.axislegalcomponent.title.source', 'Authorized use'],
                ['authentication.axislegalcomponent.message.source', 'Use of Nodics Axis is limited to authorized employees.'],
                ['authentication.rejected', 'Sign-in was not accepted. Check your username, password and enterprise code.'],
                ['help.browse', 'Browse documentation for {label}', ['label']],
                ['help.open', 'Open {label} documentation', ['label']],
                ['help.summary', '{label} help', ['label']]
            ].map(([key, defaultMessage, parameters = []]) => ({
                namespace: 'common', key, defaultMessage, parameters, exposure: 'PUBLIC'
            })).concat(require('./localization/workflowMessages.json').entries.filter(entry => entry.namespace !== 'common' || entry.key !== 'skip-to-main-content').map(({ translations, ...entry }) => entry))
        };
    }
};
