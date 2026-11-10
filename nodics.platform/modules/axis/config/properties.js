/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module axis/config/properties @description Defines Axis product initialization, CMS baseline publication and BackOffice application setup defaults. @layer config @owner axis @override Later layers may override target runtimes, publication source versions and customer documentation profile bindings. */
module.exports = {
  "tooling": {
    "acceptance": {
      "localBootstrap": {
        "documentationPacks": {
          "axisDocumentation": {
            "code": "axisDocumentation",
            "profileCode": "axisdocs",
            "minimumRoutes": 14,
            "navigationComponent": "axisDocumentationNavigation",
            "site": "axisDocumentationSite",
            "path": "/docs/nodics-axis"
          }
        }
      }
    }
  },
  "axis": {
    "initialization": {
      "baselineCode": "axis",
      "target": {
        "moduleName": "cms",
        "connectionName": "wcmsStaged",
        "targetAuthority": { "publication": "STAGED" },
        "connectionType": "abstract",
        "timeoutMs": 120000,
        "maxAttempts": 1
      }
    }
  },
  "cms": {
    "publication": {
      "baselines": {
        "axis": {
          "releaseCode": "axis:axisBaseline",
          "releaseVersion": "0.0.1",
          "rootType": "site",
          "rootCode": "axisCmsSite",
          "employeeCompositionPaths": ["/dashboard", "/lock-screen", "/schema-workbench"],
          "sourceVersion": "0"
        },
        "axisassistant": {
          "releaseCode": "axis:core-v001",
          "releaseVersion": "0.0.1",
          "dataType": "core",
          "rootType": "site",
          "rootCode": "axisCmsSite",
          "sourceVersion": "0"
        }
      }
    }
  },
  "backofficeApplicationInitialization": {
    "profiles": {
      "frameworkdocs": {
        "code": "frameworkdocs",
        "type": "DOCUMENTATION_BUNDLE",
        "owner": "nodics.docs",
        "applicationCode": "axis",
        "siteCode": "nodicsDocumentationSite",
        "baselineCode": "frameworkdocs",
        "contentPackCode": "nodicsDocumentation",
        "presentation": {
          "title": "Framework Documentation",
          "kind": "DOCUMENTATION",
          "category": "documentation",
          "order": 300,
          "summary": "Framework documentation content pack and Online delivery profile.",
          "requiredServers": [
            "Platform",
            "WCMS Staged",
            "WCMS Online",
            "Process"
          ],
          "activationPolicy": {
            "approvalRequiredForOnline": true,
            "requiredDataTrigger": "USER",
            "sampleDataTrigger": "USER"
          }
        },
        "enabled": false
      },
      "axisdocs": {
        "code": "axisdocs",
        "type": "DOCUMENTATION_BUNDLE",
        "owner": "axis",
        "applicationCode": "axis",
        "siteCode": "axisDocumentationSite",
        "baselineCode": "axisdocs",
        "contentPackCode": "axisDocumentation",
        "presentation": {
          "title": "Nodics Axis Documentation",
          "kind": "DOCUMENTATION",
          "category": "documentation",
          "order": 400,
          "summary": "Axis product documentation content pack and Online delivery profile.",
          "requiredServers": [
            "Platform",
            "WCMS Staged",
            "WCMS Online",
            "Process"
          ],
          "activationPolicy": {
            "approvalRequiredForOnline": true,
            "requiredDataTrigger": "USER",
            "sampleDataTrigger": "USER"
          }
        },
        "enabled": false
      }
    }
  },
  "data": {
    "dataReleases": {
      "initializationProfileDefaults": {
        "axisAccessDefinitions": {
          "label": "Axis access definitions",
          "description": "Install Axis group definitions in each admitted Platform tenant before enterprise employee onboarding.",
          "completionMessage": "Axis access definitions are current. Employee responsibilities require a separate authorized assignment.",
          "steps": { "$config": "replace", "value": [{ "dataType": "init", "releaseCodes": ["axis:accessGroups"] }] }
        },
        "axisContentAccessDefinitions": {
          "label": "Content access definitions",
          "description": "Install the selected Content business group definitions in each admitted Platform tenant before Content responsibilities are assigned.",
          "completionMessage": "Content group definitions are current. Enterprise roles and employee assignments remain separate reviewed operations.",
          "steps": { "$config": "replace", "value": [{ "dataType": "init", "releaseCodes": ["cms:businessAccessGroups"] }] }
        },
        "axisDocumentationFoundation": {
          "steps": {
            "$config": "replace",
            "value": [
              {
                "dataType": "init",
                "releaseCodes": [
                  "axis:axisBaseline",
                  "cms:init-v001"
                ]
              }
            ]
          }
        }
      },
      "contributions": {
        "$config": "keyed",
        "key": "moduleName",
        "entries": [
          {
            "moduleName": "axis",
            "sections": {
              "$config": "replace",
              "value": [
                "axisBaseline",
                "core-v001"
              ]
            }
          }
        ],
        "remove": []
      }
    }
  }
};
