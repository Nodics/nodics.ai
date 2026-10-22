/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";

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
    contributions: {
      workflow: {
        serviceNames: {
          DefaultProcessAuditEventService: true,
          DefaultProcessDefinitionService: true,
          DefaultProcessDefinitionVersionService: true,
          DefaultProcessIncidentService: true,
          DefaultProcessInstanceService: true,
          DefaultProcessTaskService: true,
          DefaultProcessTriggerService: true,
        },
      },
    },
  },

  process: {
    runtime: {
      deadLetterRequeue: {
        enabled: false,
        maximumRequeues: 1,
      },
      internalRetirements: {
        enabled: false,
        allowedDefinitions: [],
        permission: "process.instance.retire.internal",
      },
      internalStarts: {
        enabled: false,
        allowedDefinitions: [],
        permission: "process.instance.start.internal",
        maximumContextBytes: 16384,
      },
    },
    definitionContributions: {
      maximumDefinitionsPerContribution: 50,
      // Customer policy may assign existing TASK nodes; it cannot replace graphs or identities.
      reviewerAssignments: {},
      // Disabled by default; exact migration evidence is required. See ../llm/contracts/README.md.
      ownershipTransitions: [],
    },
    actionAdapters: {
      definitions: {
        "nodics.process.noop": {
          moduleName: "nodics.process",
          operation: "noop",
        },
        "cms.applyPublicationDecision": {
          moduleName: "cms",
          operation: "applyPublicationDecision",
          service: "DefaultProcessPublicationDecisionCallbackService",
          method: "applyPublicationDecision",
          requiresCompletedTask: true,
        },
        "editorial.applyDecision": {
          moduleName: "editorial",
          operation: "applyDecision",
          remote: {
            target: "editorial",
            moduleName: "editorial",
            runtimeRole: "WCMS_STAGED",
            apiName: "/workflow/actions/applyDecision",
            requiresCompletedTask: true,
          },
        },
        "editorial.publishApproved": {
          moduleName: "editorial",
          operation: "publishApproved",
          remote: {
            target: "editorial",
            moduleName: "editorial",
            runtimeRole: "WCMS_STAGED",
            apiName: "/workflow/actions/publishApproved",
          },
        },
        "rulesApi.applyDecision": {
          moduleName: "rulesApi",
          operation: "applyDecision",
          remote: {
            target: "rulesApi",
            moduleName: "rulesApi",
            runtimeRole: "WASTE",
            apiName: "/workflow/actions/applyDecision",
            requiresCompletedTask: true,
          },
        },
      },

      enabled: true,
      allowUnregisteredActions: false,
      allowedActions: [
        {
          moduleName: "nodics.process",
          operation: "noop",
          description:
            "Safe no-op adapter for framework smoke tests and beginner demos",
        },
      ],
    },
    remoteActions: {
      maximumExecutionAgeMs: 30000,
      connectionType: "abstract",
      timeoutMs: 10000,
      runtimeEnterpriseScope: {
        enabled: false,
        enterpriseCodes: [],
      },
      targets: {},
    },
    publicationDecisionCallback: {
      target: {
        moduleName: "cms",
        connectionType: "abstract",
        timeoutMs: 10000,
        maxAttempts: 2,
      },
    },

    designer: {
      enabled: false,
      provider: "NODICS_NATIVE_GRAPH",
      persistDrafts: false,
      allowBpmnImport: false,
      allowBpmnExport: false,
      maximumNodesPerDefinition: 250,
      maximumTransitionsPerDefinition: 500,
    },
  },
  apiExposure: {
    categories: {
      moduleInternal: {
        enabled: true,
      },
      processManagement: {
        enabled: true,
      },
    },
  },

  data: {
    dataReleases: {
      runtimeRoleProfiles: {
        PROCESS: {
          installers: {
            PROCESS_DEFINITION: "DefaultProcessDefinitionContributionService",
          },
        },
      },
    },
  },
};
