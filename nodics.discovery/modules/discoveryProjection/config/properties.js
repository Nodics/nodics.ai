/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module discoveryProjection/config/properties @description Defines Discovery projection access policies. @layer config @owner discoveryProjection */
module.exports = {
  // Declare ownership without overriding existing unknown-category exposure policy.
  apiExposure: { categories: { moduleInternal: { inheritUnknown: true } } },
    discovery: { projection: { retirement: { authorityDefaults: { moduleName: null, serviceName: null, operationName: 'validateRetirementAuthority', apiName: '/internal/discovery/retirement-authority', targetAuthority: { publication: {$config: 'context', name: 'publication'} } }, receiptTargetAuthority: { publication: {$config: 'context', name: 'publication'}, server: null, environment: null } }, targetAuthority: { publication: {$config: 'context', name: 'publication'}, server: null, environment: null } } },
  // Search participation follows this capability, independently of runtime role labels.
  search: { discoveryProjection: { options: { enabled: true } } },
    // Inert inventory; an allowed local server must explicitly select this capability.
    localResetProvider: {
        "contributions": {
            "discoveryProjection": {
                "serviceNames": {
                    "DefaultDiscoveryDocumentProjectionService": true
                }
            }
        }
    },
 schemaPolicies: { discoveryProjection: { operational: { accessGroups: { adminGroup: 10, runtimeConfigAdminUserGroup: 10, serviceAccountUserGroup: 10 } } } } };
