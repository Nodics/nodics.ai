/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module tax/config/properties @description Defines Commerce capability and schema access policies. @layer config @owner tax */
module.exports = {
  publish: {
    "setup": {
      "permissions": {
        "tax": "publish.lifecycle.create"
      },
      "observation": {
        "targetObservers": {
          "tax": {
            "$config": "context",
            "name": "publication",
            "cases": {
              "STAGED": undefined,
              "ONLINE": "DefaultTaxPublicationService",
              "OPERATIONAL": "DefaultTaxPublicationService"
            }
          }
        }
      }
    },
    "providers": {
      "domainAdapters": {
        "tax": {
          "$config": "context",
          "name": "publication",
          "cases": {
            "STAGED": "DefaultTaxPublicationService",
            "ONLINE": null,
            "OPERATIONAL": null
          }
        }
      },
      "versionProviders": {
        "tax": {
          "$config": "context",
          "name": "publication",
          "cases": {
            "STAGED": "DefaultTaxPublicationService",
            "ONLINE": null,
            "OPERATIONAL": null
          }
        }
      },
      "workflowProviders": {
        "tax": {
          "$config": "context",
          "name": "publication",
          "cases": {
            "STAGED": "DefaultPublicationApprovalWorkflowService",
            "ONLINE": null,
            "OPERATIONAL": null
          }
        }
      }
    },
    "approvalWorkflow": {
      "domains": {
        "tax": {
          "definitionCode": "taxPublicationApproval",
          "ownerModule": "tax",
          "actionKey": "tax.applyPublicationDecision",
          "sourcePublication": "STAGED"
        }
      }
    }
  },
  process: {
    actionAdapters: {
      definitions: {
        "tax.applyPublicationDecision": {
          moduleName: "tax",
          operation: "applyPublicationDecision",
          remote: {
            target: "tax",
            moduleName: "tax",
            targetAuthority: { publication: "STAGED" },
            apiName: "/workflow/actions/applyPublicationDecision",
            requiresCompletedTask: true,
          },
        },
      },
    },
  },
  // Inert inventory; an allowed local server must explicitly select this capability.
  localResetProvider: {
    contributions: {
      tax: {
        serviceNames: {
          DefaultTaxDecisionService: true,
          DefaultTaxPolicyService: true,
        },
      },
    },
  },

  tax: {
    "enabled": true,
    "publication": {
      "runtimeRole": {
        "$config": "context",
        "name": "publication",
        "cases": {
          "STAGED": "STAGED",
          "ONLINE": "ONLINE",
          "OPERATIONAL": "ONLINE"
        }
      },
      "sourceVersioningQualified": false,
      "delivery": {
        "enabled": false,
        "rootCodes": []
      },
      "legacyCasRecovery": {
        "enabled": false,
        "operations": []
      },
      "targetTransportProvider": "DefaultTaxPublicationTransportService",
      "maxDependencies": 1000,
      "target": {
        "moduleName": "tax",
        "connectionName": null,
        "connectionType": "abstract",
        "publication": "OPERATIONAL"
      },
      "sourceAuthority": {
        "moduleName": "tax",
        "connectionName": null,
        "connectionType": "abstract",
        "publication": "STAGED"
      }
    }
  },
  schemaPolicies: {
    "tax": {
      "publicationVersioned": {
        "isVersionedEnabled": {
          "$config": "context",
          "name": "publication",
          "cases": {
            "STAGED": true,
            "ONLINE": false,
            "OPERATIONAL": false
          }
        },
        "versionedReadMode": {
          "$config": "context",
          "name": "publication",
          "cases": {
            "STAGED": "CURRENT",
            "ONLINE": undefined,
            "OPERATIONAL": undefined
          }
        }
      },
      "operational": {
        "accessGroups": {
          "adminGroup": 10,
          "commerceOperatorUserGroup": 10,
          "serviceAccountUserGroup": 10
        }
      },
      "tenantOwned": {
        "accessGroups": {
          "adminGroup": 10,
          "commerceOperatorUserGroup": 10,
          "serviceAccountUserGroup": 10
        }
      },
      "customerOwned": {
        "accessGroups": {
          "adminGroup": 10,
          "commerceOperatorUserGroup": 10,
          "serviceAccountUserGroup": 10,
          "customerUserGroup": 10
        },
        "ownership": {
          "enabled": true,
          "ownerProperty": "ownerId",
          "bypassGroups": {
            "adminGroup": true,
            "commerceOperatorUserGroup": true,
            "serviceAccountUserGroup": true
          },
          "subjectGroups": {
            "customerUserGroup": true
          },
          "principalTypes": {
            "customer": true
          }
        }
      }
    }
  },
  apiExposure: {
    categories: {
      taxPublicationAuthoring: { enabled: false },
      commercePublicationIngestion: {
        enabled: true,
      },
    },
  },
};
