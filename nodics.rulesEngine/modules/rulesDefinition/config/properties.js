/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module rulesDefinition/config/properties @description Configurable defaults for governed rule definitions. @layer config @owner rulesDefinition */
module.exports = {
    localResetProvider: {
        contributions: {
            rulesDefinition: {
                serviceNames: {
                    DefaultRuleSetService: true,
                    DefaultRuleSetVersionService: true,
                    DefaultScoreBandSetService: true,
                    DefaultScoreBandSetVersionService: true,
                    DefaultRuleAuditEventService: true
                }
            }
        }
    },
    schemaPolicies: {
        rulesDefinition: {
            operational: {
                accessGroups: {
                    adminGroup: 10,
                    serviceAccountUserGroup: 10,
                    employeeUserGroup: 10
                }
            }
        }
    }
};
