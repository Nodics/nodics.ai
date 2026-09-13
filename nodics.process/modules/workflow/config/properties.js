/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module nodics.process/modules/workflow/config/properties
 * @description Defines workflow module configuration defaults.
 * @layer config
 * @owner workflow
 * @override Projects and customer overlays may extend workflow capability defaults through standard Nodics configuration layering.
 */
module.exports = {
    // Inert inventory; an allowed local server must explicitly select this capability.
    localResetProvider: {
        "contributions": {
            "workflow": {
                "serviceNames": {
                    "DefaultProcessAuditEventService": true,
                    "DefaultProcessDefinitionService": true,
                    "DefaultProcessDefinitionVersionService": true,
                    "DefaultProcessIncidentService": true,
                    "DefaultProcessInstanceService": true,
                    "DefaultProcessTaskService": true,
                    "DefaultProcessTriggerService": true
                }
            }
        }
    },

    process: {
        definitionContributions: {
            maximumDefinitionsPerContribution: 50
        }
    }
};
