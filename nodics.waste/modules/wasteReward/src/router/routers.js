/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module wasteReward/router @description Service-only mutations and Profile-authorized original-owner allocation reads. @owner wasteReward @layer router */
module.exports = {
    "wasteReward": {
        "materialValue": {
            "allocations": {
                "key": "/waste/material-value/allocations", "method": "POST",
                "secured": true, "authTokenTypes": ["service", "access"],
                "accessGroups": ["serviceAccountUserGroup", "customerUserGroup", "employeeUserGroup"],
                "permission": "waste.materialValue.read", "apiExposure": "wasteMaterialValueRead",
                "requestPrivacy": { "sensitive": true },
                "controller": "DefaultWasteMaterialValueController", "operation": "allocations", "cache": { "enabled": false }
            },
            "assess": {
                "key": "/waste/material-value/assessments",
                "method": "POST",
                "secured": true,
                "authTokenTypes": [
                    "service"
                ],
                "accessGroups": [
                    "serviceAccountUserGroup"
                ],
                "permission": "waste.materialValue.assess",
                "apiExposure": "wasteMaterialValueInternal",
                "controller": "DefaultWasteMaterialValueController",
                "operation": "assess",
                "cache": {
                    "enabled": false
                }
            },
            "release": {
                "key": "/waste/material-value/releases",
                "method": "POST",
                "secured": true,
                "authTokenTypes": [
                    "service"
                ],
                "accessGroups": [
                    "serviceAccountUserGroup"
                ],
                "permission": "waste.materialValue.release",
                "apiExposure": "wasteMaterialValueInternal",
                "controller": "DefaultWasteMaterialValueController",
                "operation": "release",
                "cache": {
                    "enabled": false
                }
            },
            "read": {
                "key": "/waste/material-value/lookup",
                "method": "POST",
                "secured": true,
                "authTokenTypes": [
                    "service"
                ],
                "accessGroups": [
                    "serviceAccountUserGroup"
                ],
                "permission": "waste.materialValue.read",
                "apiExposure": "wasteMaterialValueInternal",
                "controller": "DefaultWasteMaterialValueController",
                "operation": "read",
                "cache": {
                    "enabled": false
                }
            }
        }
    }
};
