/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";

/**
 * @module axis/config/properties
 * @description Contributes Axis-specific backend-owned documentation and navigation metadata for BackOffice aggregation.
 * @layer config
 * @owner axis
 */
module.exports = {
  axis: {
    initialization: {
      baselineCode: "axis",
      target: {
        moduleName: "cms",
        connectionName: "wcmsStaged",
        connectionType: "abstract",
        timeoutMs: 120000,
        maxAttempts: 1,
      },
    },
  },
  cms: {
    publication: {
      baselines: {
        axis: {
          releaseCode: "axis:axisBaseline",
          rootType: "site",
          rootCode: "axisCmsSite",
          sourceVersion: "0",
        },
        axisassistant: {
          releaseCode: "axis:core-v002",
          dataType: "core",
          rootType: "site",
          rootCode: "axisCmsSite",
          sourceVersion: "0",
        },
      },
    },
  },
  backofficeApplicationInitialization: {
    profiles: {
      axisdocs: {
        code: "axisdocs",
        type: "DOCUMENTATION_BUNDLE",
        owner: "axis",
        applicationCode: "axis",
        siteCode: "axisDocumentationSite",
        baselineCode: "axisdocs",
        contentPackCode: "axisDocumentation",
        presentation: {
          title: "Nodics Axis Documentation",
          kind: "DOCUMENTATION",
          category: "documentation",
          order: 400,
          summary:
            "Axis product documentation content pack and Online delivery profile.",
          requiredServers: [
            "Platform",
            "WCMS Staged",
            "WCMS Online",
            "Process",
          ],
          activationPolicy: {
            approvalRequiredForOnline: true,
            requiredDataTrigger: "USER",
            sampleDataTrigger: "USER",
          },
        },
        enabled: false,
      },
    },
  },
  data: {
    dataReleases: {
      initializationProfileDefaults: {
        axisDocumentationFoundation: {
          steps: {
            $config: "replace",
            value: [
              {
                dataType: "init",
                releaseCodes: [
                  "axis:axisBaseline",
                  "cms:init-v001",
                  "wcms:init-v001",
                ],
              },
            ],
          },
        },
      },
    },
  },
};
