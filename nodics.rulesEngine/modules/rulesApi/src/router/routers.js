/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module rulesApi/src/router/routers @description Secured Rules management and simulation routes. @layer router @owner rulesApi */
module.exports = {
    rulesApi: {
        ruleDefinitions: {
            listDefinitions: {
                secured: true, authTokenTypes: ['access'], accessGroups: ['userGroup'],
                permission: 'rules.definition.read', apiExposure: 'rulesManagement',
                key: '/definitions', method: 'GET',
                controller: 'DefaultRuleDefinitionController', operation: 'listDefinitions'
            },
            getDefinition: {
                secured: true, authTokenTypes: ['access'], accessGroups: ['userGroup'],
                permission: 'rules.definition.read', apiExposure: 'rulesManagement',
                key: '/definitions/:ruleSetCode', method: 'GET',
                controller: 'DefaultRuleDefinitionController', operation: 'getDefinition'
            },
            createDefinition: {
                secured: true, authTokenTypes: ['access'], accessGroups: ['runtimeConfigAdminUserGroup'],
                permission: 'rules.definition.create', apiExposure: 'rulesManagement',
                key: '/definitions', method: 'POST',
                controller: 'DefaultRuleDefinitionController', operation: 'createDefinition'
            },
            updateDraft: {
                secured: true, authTokenTypes: ['access'], accessGroups: ['runtimeConfigAdminUserGroup'],
                permission: 'rules.definition.update', apiExposure: 'rulesManagement',
                key: '/definitions/:ruleSetCode/draft', method: 'PATCH',
                controller: 'DefaultRuleDefinitionController', operation: 'updateDraft'
            },
            validateDraft: {
                secured: true, authTokenTypes: ['access'], accessGroups: ['runtimeConfigAdminUserGroup'],
                permission: 'rules.definition.validate', apiExposure: 'rulesManagement',
                key: '/definitions/:ruleSetCode/draft/validate', method: 'POST',
                controller: 'DefaultRuleDefinitionController', operation: 'validateDraft'
            },
            simulateDraft: {
                secured: true, authTokenTypes: ['access'], accessGroups: ['runtimeConfigAdminUserGroup'],
                permission: 'rules.definition.simulate', apiExposure: 'rulesManagement',
                key: '/definitions/:ruleSetCode/draft/simulate', method: 'POST',
                controller: 'DefaultRuleDefinitionController', operation: 'simulateDraft'
            },
            prepareNextDraft: {
                secured: true, authTokenTypes: ['access'], accessGroups: ['runtimeConfigAdminUserGroup'],
                permission: 'rules.definition.update', apiExposure: 'rulesManagement',
                key: '/definitions/:ruleSetCode/draft/prepare', method: 'POST',
                controller: 'DefaultRuleDefinitionController', operation: 'prepareNextDraft'
            },
            submitForApproval: {
                secured: true, authTokenTypes: ['access'], accessGroups: ['runtimeConfigAdminUserGroup'],
                permission: 'rules.definition.submit', apiExposure: 'rulesManagement',
                key: '/definitions/:ruleSetCode/draft/submit', method: 'POST',
                controller: 'DefaultRuleDefinitionController', operation: 'submitForApproval'
            },
            publishDraft: {
                secured: true, authTokenTypes: ['access'], accessGroups: ['runtimeConfigAdminUserGroup'],
                permission: 'rules.definition.publish', apiExposure: 'rulesManagement',
                key: '/definitions/:ruleSetCode/draft/publish', method: 'POST',
                controller: 'DefaultRuleDefinitionController', operation: 'publishDraft'
            },
            listVersions: {
                secured: true, authTokenTypes: ['access'], accessGroups: ['userGroup'],
                permission: 'rules.definition.read', apiExposure: 'rulesManagement',
                key: '/definitions/:ruleSetCode/versions', method: 'GET',
                controller: 'DefaultRuleDefinitionController', operation: 'listVersions'
            }
        },
        propertyCatalogues: {
            getPropertyCatalogue: {
                secured: true, authTokenTypes: ['access'], accessGroups: ['userGroup'],
                permission: 'rules.definition.read', apiExposure: 'rulesManagement',
                key: '/property-catalogues/:propertyProviderCode', method: 'GET',
                controller: 'DefaultRuleDefinitionController', operation: 'propertyCatalogue'
            },
            getPropertyValues: {
                secured: true, authTokenTypes: ['access'], accessGroups: ['userGroup'],
                permission: 'rules.definition.read', apiExposure: 'rulesManagement',
                key: '/property-catalogues/:propertyProviderCode/properties/:propertyCode/values', method: 'GET',
                controller: 'DefaultRuleDefinitionController', operation: 'propertyValues'
            }
        },
        processActions: {
            applyDecision: {
                secured: true,
                authTokenTypes: ['service'],
                accessGroups: ['userGroup'],
                permissionConfig: 'authSecurity.internalToken.routePermission',
                apiExposure: 'moduleInternal',
                key: '/workflow/actions/applyDecision',
                method: 'POST',
                controller: 'DefaultRuleProcessActionController',
                operation: 'applyDecision',
                cache: { enabled: false }
            }
        },
        scoreBandSets: {
            listBandSets: {
                secured: true, authTokenTypes: ['access'], accessGroups: ['userGroup'],
                permission: 'rules.band.read', apiExposure: 'rulesManagement',
                key: '/band-sets', method: 'GET',
                controller: 'DefaultRuleDefinitionController', operation: 'listBandSets'
            },
            getBandSet: {
                secured: true, authTokenTypes: ['access'], accessGroups: ['userGroup'],
                permission: 'rules.band.read', apiExposure: 'rulesManagement',
                key: '/band-sets/:bandSetCode', method: 'GET',
                controller: 'DefaultRuleDefinitionController', operation: 'getBandSet'
            },
            listBandVersions: {
                secured: true, authTokenTypes: ['access'], accessGroups: ['userGroup'],
                permission: 'rules.band.read', apiExposure: 'rulesManagement',
                key: '/band-sets/:bandSetCode/versions', method: 'GET',
                controller: 'DefaultRuleDefinitionController', operation: 'listBandVersions'
            },
            createBandSet: {
                secured: true, authTokenTypes: ['access'], accessGroups: ['runtimeConfigAdminUserGroup'],
                permission: 'rules.band.create', apiExposure: 'rulesManagement',
                key: '/band-sets', method: 'POST',
                controller: 'DefaultRuleDefinitionController', operation: 'createBandSet'
            },
            updateBandSetDraft: {
                secured: true, authTokenTypes: ['access'], accessGroups: ['runtimeConfigAdminUserGroup'],
                permission: 'rules.band.update', apiExposure: 'rulesManagement',
                key: '/band-sets/:bandSetCode/draft', method: 'PATCH',
                controller: 'DefaultRuleDefinitionController', operation: 'updateBandSetDraft'
            },
            publishBandSetDraft: {
                secured: true, authTokenTypes: ['access'], accessGroups: ['runtimeConfigAdminUserGroup'],
                permission: 'rules.band.publish', apiExposure: 'rulesManagement',
                key: '/band-sets/:bandSetCode/draft/publish', method: 'POST',
                controller: 'DefaultRuleDefinitionController', operation: 'publishBandSetDraft'
            }
        }
    }
};
