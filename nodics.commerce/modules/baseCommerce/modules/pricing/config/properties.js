/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module pricing/config/properties @description Defines Commerce capability and schema access policies. @layer config @owner pricing */
module.exports = {
  publish: {
    "setup": {
      "permissions": {
        "pricing": "publish.lifecycle.create"
      },
      "observation": {
        "targetObservers": {
          "pricing": {
            "$config": "context",
            "name": "publication",
            "cases": {
              "STAGED": undefined,
              "ONLINE": "DefaultPricingPublicationService",
              "OPERATIONAL": "DefaultPricingPublicationService"
            }
          }
        }
      }
    },
    "providers": {
      "domainAdapters": {
        "pricing": {
          "$config": "context",
          "name": "publication",
          "cases": {
            "STAGED": "DefaultPricingPublicationService",
            "ONLINE": null,
            "OPERATIONAL": null
          }
        }
      },
      "versionProviders": {
        "pricing": {
          "$config": "context",
          "name": "publication",
          "cases": {
            "STAGED": "DefaultPricingPublicationService",
            "ONLINE": null,
            "OPERATIONAL": null
          }
        }
      },
      "workflowProviders": {
        "pricing": {
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
        "pricing": {
          "definitionCode": "pricingPublicationApproval",
          "ownerModule": "pricing",
          "actionKey": "pricing.applyPublicationDecision",
          "sourcePublication": "STAGED"
        }
      }
    }
  },
  process: {
    actionAdapters: {
      definitions: {
        "pricing.applyPublicationDecision": {
          moduleName: "pricing",
          operation: "applyPublicationDecision",
          remote: {
            target: "pricing",
            moduleName: "pricing",
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
      pricing: {
        serviceNames: {
          DefaultPriceBookService: true,
          DefaultPriceDecisionService: true,
          DefaultPriceQuoteService: true,
          DefaultPriceRowService: true,
        },
      },
    },
  },

  pricing: {
    "enabled": true,
    "administrativeAuthoring": {
      "readPermission": "commerce.pricing.read",
      "writePermission": "commerce.pricing.write",
      "publishPermission": "commerce.pricing.publish",
      "evidencePath": "/identity/platform-administrator/evidence",
      "recipientPath": "/participants/resolve",
      "identityTarget": {
        "moduleName": "profile",
        "connectionName": "profile",
        "targetAuthority": {
          "publication": "OPERATIONAL"
        },
        "apiVersion": "v0"
      },
      "timeoutMs": 10000,
      "maximumDecimalLength": 64
    },
    "bundleListings": {
      "enabled": false,
      "qualified": false,
      "maximumRecords": 1000,
      "maximumConfiguredBound": 10000
    },
    "merchantEvidence": {
      "qualified": false,
      "businessCallers": {
        "enabled": false,
        "callers": []
      }
    },
    "customerSummary": {
      "enabled": true,
      "defaultCurrency": "USD",
      "defaultQuantity": "1",
      "maximumProductsPerRequest": 100,
      "includeEvidence": false,
      "missingPriceBehavior": "omit"
    },
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
        "rootCodes": [],
        "rowReleases": false
      },
      "legacyCasRecovery": {
        "enabled": false,
        "operations": []
      },
      "targetTransportProvider": "DefaultPricingPublicationTransportService",
      "sourceAuthority": {
        "callers": [],
        "moduleName": "pricing",
        "connectionName": null,
        "connectionType": "abstract",
        "publication": "STAGED"
      },
      "target": {
        "callers": [],
        "moduleName": "pricing",
        "connectionName": null,
        "connectionType": "abstract",
        "publication": "OPERATIONAL"
      },
      "maxDependencies": 1000
    }
  },
  schemaPolicies: {
    "pricing": {
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
      pricingAdministrativeAuthoring: { enabled: true },
      commerceMerchantPricing: { enabled: false },
      pricingPublicationAuthoring: { enabled: false },
      commercePublicationIngestion: {
        enabled: true,
      },
    },
  },
};
