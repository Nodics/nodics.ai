/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module wasteCarbon/router @description Owner routes with service mutations and self-scoped read admission. @owner wasteCarbon @layer router */
module.exports = {
    "wasteCarbon": {
        "internal": {
            "finalize": {
                "secured": true, "authTokenTypes": ["service"], "accessGroups": ["serviceAccountUserGroup"],
                "permission": "carbon.holdings.finalize", "apiExposure": "carbonInternal",
                "key": "/carbon/transfers/finalize", "method": "POST",
                "controller": "DefaultWasteCarbonController", "operation": "finalize",
                "cache": { "enabled": false }, "requestPrivacy": { "sensitive": true }
            },
            "holdings": {
                "secured": true,
                "authTokenTypes": [
                    "service",
                    "access"
                ],
                "accessGroups": [
                    "serviceAccountUserGroup",
                    "customerUserGroup",
                    "employeeUserGroup"
                ],
                "permission": "carbon.holdings.read",
                "apiExposure": "carbonRead",
                "requestPrivacy": { "sensitive": true },
                "key": "/carbon/holdings",
                "method": "POST",
                "controller": "DefaultWasteCarbonController",
                "operation": "holdings",
                "cache": {
                    "enabled": false
                }
            },
            "synchronize": {
                "secured": true,
                "authTokenTypes": [
                    "service"
                ],
                "accessGroups": [
                    "serviceAccountUserGroup"
                ],
                "permission": "carbon.evidence.record",
                "apiExposure": "carbonInternal",
                "key": "/carbon/lots/evidence",
                "method": "POST",
                "controller": "DefaultWasteCarbonController",
                "operation": "synchronize",
                "cache": {
                    "enabled": false
                }
            },
            "reserve": {
                "secured": true,
                "authTokenTypes": [
                    "service"
                ],
                "accessGroups": [
                    "serviceAccountUserGroup"
                ],
                "permission": "carbon.holdings.reserve",
                "apiExposure": "carbonInternal",
                "key": "/carbon/reservations",
                "method": "POST",
                "controller": "DefaultWasteCarbonController",
                "operation": "reserve",
                "cache": {
                    "enabled": false
                }
            },
            "transfer": {
                "secured": true,
                "authTokenTypes": [
                    "service"
                ],
                "accessGroups": [
                    "serviceAccountUserGroup"
                ],
                "permission": "carbon.holdings.transfer",
                "apiExposure": "carbonInternal",
                "key": "/carbon/transfers",
                "method": "POST",
                "controller": "DefaultWasteCarbonController",
                "operation": "transfer",
                "cache": {
                    "enabled": false
                }
            },
            "release": {
                "secured": true,
                "authTokenTypes": [
                    "service"
                ],
                "accessGroups": [
                    "serviceAccountUserGroup"
                ],
                "permission": "carbon.holdings.release",
                "apiExposure": "carbonInternal",
                "key": "/carbon/releases",
                "method": "POST",
                "controller": "DefaultWasteCarbonController",
                "operation": "release",
                "cache": {
                    "enabled": false
                }
            },
            "getOperation": {
                "secured": true,
                "authTokenTypes": [
                    "service",
                    "access"
                ],
                "accessGroups": [
                    "serviceAccountUserGroup",
                    "customerUserGroup",
                    "employeeUserGroup"
                ],
                "permission": "carbon.holdings.read",
                "apiExposure": "carbonRead",
                "requestPrivacy": { "sensitive": true },
                "key": "/carbon/operations/lookup",
                "method": "POST",
                "controller": "DefaultWasteCarbonController",
                "operation": "getOperation",
                "cache": {
                    "enabled": false
                }
            }
        }
    }
};
