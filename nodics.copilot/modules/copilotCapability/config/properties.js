/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module copilotCapability/config/properties
 * @description Defines generated configurable defaults for copilotCapability.
 * @layer config
 * @owner generated
 * @override Project, environment, server, node, tenant, or customer layers may override these defaults through Nodics configuration layering.
 */
module.exports = {
  copilot: {
    capability: {
      maximumRows: 10000,
      maximumModuleRows: 500,
      allowedExportFormats: ["csv", "xlsx", "text"],
      mutationToolsEnabled: false,
      importInspection: {
        enabled: false,
        connectionName: null,
        targetAuthority: null,
        maximumRows: 25,
        scopes: [],
        presentation: {
          title: "Inspect data releases",
          operation: "Operation",
          code: "Release or profile",
          submit: "Inspect",
          cancel: "Cancel",
          failure: "Data-release inspection could not be submitted.",
          operations: {
            "import.release.init.catalogue": "Initialization releases",
            "import.release.init.validate": "Validate initialization release",
            "import.release.core.catalogue": "Core releases",
            "import.release.core.validate": "Validate core release",
            "import.release.sample.catalogue": "Sample releases",
            "import.release.sample.validate": "Validate sample release",
            "import.profile.list": "Initialization profiles",
            "import.profile.validate": "Validate initialization profile",
            "import.run.history": "Import run history",
          },
        },
      },
      processInspection: {
        enabled: false,
        connectionName: null,
        targetAuthority: null,
        maximumRows: 25,
        scopes: [],
        presentation: {
          title: "Inspect Process",
          operation: "Operation",
          code: "Record",
          submit: "Inspect",
          cancel: "Cancel",
          failure: "Process inspection could not be submitted.",
          operations: {
            "process.definition.list": "Definitions",
            "process.definition.inspect": "Definition summary",
            "process.definition.versions": "Definition versions",
            "process.instance.list": "Instances",
            "process.instance.inspect": "Instance summary",
            "process.instance.detail": "Instance detail",
            "process.instance.tasks": "Instance tasks",
            "process.instance.activity": "Instance activity",
            "process.instance.incidents": "Instance incidents",
            "process.trigger.list": "Triggers",
            "process.task.inspect": "Task summary",
            "process.incident.inspect": "Incident summary",
          },
        },
      },
      rulesInspection: {
        enabled: false,
        connectionName: null,
        targetAuthority: null,
        maximumRows: 25,
        scopes: [],
        presentation: {
          title: "Inspect Rules",
          operation: "Operation",
          code: "Definition",
          submit: "Inspect",
          cancel: "Cancel",
          failure: "Rules inspection could not be submitted.",
          operations: {
            "rules.definition.list": "Rule definitions",
            "rules.definition.inspect": "Rule summary",
            "rules.definition.versions": "Rule versions",
            "rules.definition.audit": "Rule activity",
            "rules.band.list": "Score-band sets",
            "rules.band.inspect": "Score-band summary",
            "rules.band.versions": "Score-band versions",
            "rules.property.catalogue": "Property catalogue",
          },
        },
      },
      orderNotificationInspection: {
        enabled: false,
        connectionName: null,
        targetAuthority: null,
        scopes: [],
        presentation: {
          title: "Inspect order notifications",
          operation: "Operation",
          code: "Order",
          kind: "Event",
          submit: "Inspect",
          cancel: "Cancel",
          failure: "Order notifications could not be inspected.",
          operations: {
            "commerce.orderNotification.workspace": "Notification workspace",
            "commerce.orderNotification.inspect": "Original delivery evidence",
          },
        },
      },
    },
  },
};
