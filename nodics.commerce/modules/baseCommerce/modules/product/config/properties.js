/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module product/config/properties @description Defines Commerce capability and schema access policies. @layer config @owner product */
module.exports = {
  // Search participation follows this capability, independently of runtime role labels.
  search: { product: { options: { enabled: true } } },
  publish: {
    "setup": {
      "permissions": {
        "product": "commerce.product.publish"
      },
      "observation": {
        "targetObservers": {
          "product": {
            "$config": "context",
            "name": "publication",
            "cases": {
              "STAGED": undefined,
              "ONLINE": "DefaultProductPublicationVersionProviderService",
              "OPERATIONAL": "DefaultProductPublicationVersionProviderService"
            }
          }
        }
      }
    },
    "providers": {
      "domainAdapters": {
        "product": {
          "$config": "context",
          "name": "publication",
          "cases": {
            "STAGED": "DefaultProductPublicationAdapterService",
            "ONLINE": null,
            "OPERATIONAL": null
          }
        }
      },
      "versionProviders": {
        "product": {
          "$config": "context",
          "name": "publication",
          "cases": {
            "STAGED": "DefaultProductPublicationVersionProviderService",
            "ONLINE": null,
            "OPERATIONAL": null
          }
        }
      },
      "workflowProviders": {
        "product": {
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
        "product": {
          "definitionCode": "productPublicationApproval",
          "ownerModule": "product",
          "actionKey": "product.applyPublicationDecision",
          "sourcePublication": "STAGED"
        }
      }
    }
  },
  process: {
    actionAdapters: {
      definitions: {
        "product.applyPublicationDecision": {
          moduleName: "product",
          operation: "applyPublicationDecision",
          remote: {
            target: "product",
            moduleName: "product",
            targetAuthority: { publication: "STAGED" },
            apiName: "/workflow/actions/applyPublicationDecision",
            requiresCompletedTask: true,
          },
        },
      },
    },
  },
  tooling: {
    commands: {
      "acceptance:commerce-publication": {
        acceptanceContract: true,
        projectHome: true,
        handler: "@nTooling/node-script",
        script:
          "src/service/acceptance/defaultCommercePublicationAcceptanceService.mjs",
      },
      "acceptance:coupon-catalogue-availability": {
        acceptanceContract: true,
        projectHome: true,
        handler: "@nTooling/node-script",
        script:
          "src/service/acceptance/defaultCouponCatalogueAvailabilityAcceptanceService.mjs",
      },
    },
  },
  // Inert inventory; an allowed local server must explicitly select this capability.
  localResetProvider: {
    contributions: {
      product: {
        serviceNames: {
          DefaultCategoryLocalizationService: true,
          DefaultCategoryService: true,
          DefaultProductLocalizationService: true,
          DefaultProductPublicationService: true,
          DefaultProductSearchProjectionService: true,
          DefaultProductService: true,
          DefaultProductVariantLocalizationService: true,
          DefaultProductVariantService: true,
        },
      },
    },
  },

  product: {
    "enabled": true,
    "acceptance": {
      "couponCatalogueAvailability": {
        "requestTimeoutMs": 30000,
        "pageSize": 50,
        "maximumPages": 20
      }
    },
    "businessAuthoring": {
      "readPermission": "commerce.product.read",
      "writePermission": "commerce.product.write",
      "archivePermission": "commerce.product.archive",
      "maximumTextLength": 500,
      "maximumPageNumber": 10000
    },
    "administrativeAuthoring": {
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
      "maximumGraphRecords": 100,
      "maximumGraphBytes": 262144,
      "maximumDepth": 12,
      "labels": {
        "title": "Cross-enterprise Product management",
        "targetEnterpriseCode": "Product owner Enterprise",
        "createGraph": "Create catalogue graph"
      },
      "graphFields": {
        "product": [
          "code",
          "name",
          "catalogVersion",
          "productType",
          "fulfillmentStrategy",
          "digitalDeliveryType",
          "status"
        ],
        "productVariant": [
          "code",
          "productCode",
          "sku",
          "productType",
          "fulfillmentStrategy",
          "digitalDeliveryType",
          "attributes",
          "status"
        ],
        "productLocalization": [
          "code",
          "productCode",
          "locale",
          "name",
          "description",
          "slug",
          "seo",
          "attributes",
          "classificationValues",
          "media",
          "status"
        ],
        "productVariantLocalization": [
          "code",
          "productCode",
          "variantCode",
          "locale",
          "attributes",
          "media",
          "status"
        ]
      }
    },
    "marketplaceAuthoring": {
      "enabled": false,
      "catalogVersion": null,
      "locales": [],
      "bundlePublication": {
        "enabled": false,
        "source": {
          "moduleName": "digitalCore",
          "connectionName": "commerce",
          "targetAuthority": {
            "publication": "OPERATIONAL"
          },
          "apiVersion": "v0",
          "timeoutMs": 15000,
          "maxAttempts": 1
        }
      },
      "intentSource": {
        "moduleName": null,
        "targetAuthority": null,
        "connectionName": null,
        "connectionType": "abstract",
        "timeoutMs": 15000,
        "allowInsecureLoopback": false
      },
      "storeSource": {
        "moduleName": "store",
        "connectionName": null,
        "connectionType": "abstract",
        "targetAuthority": { "publication": "OPERATIONAL" },
        "timeoutMs": 15000,
        "allowInsecureLoopback": false
      }
    },
    "localization": {
      "supportedLocales": [
        "en",
        "ar"
      ],
      "defaultLocale": "en",
      "fallbackLocales": [
        "en"
      ],
      "requiredLocales": [
        "en",
        "ar"
      ],
      "requiredProductFields": [
        "name"
      ],
      "requiredCategoryFields": [
        "name"
      ],
      "requiredVariantFields": [],
      "allowLegacySharedText": true,
      "maximumLocalizedFields": 100,
      "maximumBatchSize": 100,
      "searchIndexName": "productLocalized",
      "searchCacheTtlSeconds": 300,
      "analyzerByLocale": {
        "en": "standard",
        "ar": "arabic"
      }
    },
    "discovery": {
      "activationService": {
        "$config": "context",
        "name": "publication",
        "cases": {
          "STAGED": null,
          "ONLINE": "DefaultProductPublicationTargetService",
          "OPERATIONAL": "DefaultProductPublicationTargetService"
        }
      },
      "activationScopes": null,
      "catalogue": {
        "enabled": {
          "$config": "context",
          "name": "publication",
          "cases": {
            "STAGED": false,
            "ONLINE": true,
            "OPERATIONAL": true
          }
        },
        "maximumCandidates": 1000,
        "readPageSize": 100,
        "dimensions": {
          "brands": {
            "paths": [
              "brand",
              "localizedAttributes.brand"
            ]
          },
          "categories": {
            "paths": [
              "categoryCodes"
            ]
          },
          "kinds": {
            "paths": [
              "localizedAttributes.kind"
            ]
          },
          "issuers": {
            "paths": [
              "localizedAttributes.issuerRef.code"
            ]
          },
          "conditions": {
            "paths": [
              "localizedAttributes.condition"
            ]
          },
          "collections": {
            "paths": [
              "collectionCodes",
              "localizedAttributes.collection"
            ]
          },
          "availability": {
            "paths": [
              "availability.status"
            ],
            "labels": {
              "IN_STOCK": "Available",
              "OUT_OF_STOCK": "Not available",
              "PREORDER": "Pre-order"
            }
          }
        },
        "saleCollectionCodes": []
      },
      "defaultStoreCode": "defaultStore",
      "defaultLocale": "en",
      "maximumPageSize": 100,
      "defaultPageSize": 24,
      "allowTenantQuery": false,
      "searchIndexName": "productLocalized",
      "mediaDeliveryBaseUrl": "/nodics/media/v0/content",
      "rankingFailureBehavior": "omit",
      "cardFields": [
        "productCode",
        "name",
        "slug",
        "summary",
        "categoryCodes",
        "variantCodes",
        "seo",
        "localizedAttributes",
        "media",
        "price",
        "availability"
      ],
      "detailFields": [
        "productCode",
        "name",
        "slug",
        "summary",
        "description",
        "categoryCodes",
        "variantCodes",
        "seo",
        "localizedAttributes",
        "media",
        "price",
        "availability"
      ],
      "filterableFields": [
        "categoryCodes"
      ],
      "exposedSorts": [
        "relevance",
        "name-asc",
        "name-desc"
      ]
    },
    "publication": {
      "targetTransportProvider": "DefaultProductPublicationTransportService",
      "target": {
        "moduleName": "product",
        "connectionName": null,
        "connectionType": "abstract",
        "publication": "OPERATIONAL"
      },
      "source": {
        "moduleName": "product",
        "connectionName": null,
        "connectionType": "abstract",
        "publication": "STAGED"
      },
      "defaultStoreCode": "defaultStore",
      "maximumBatchSize": 100,
      "maximumDependencies": 1000,
      "maximumActivationReceipts": 1000,
      "maximumActiveProducts": 1000,
      "searchEnrichment": {
        "pricing": {
          "enabled": true,
          "serviceName": "DefaultCustomerPriceSummaryService",
          "defaultCurrency": "USD",
          "defaultQuantity": "1",
          "missingBehavior": "omit"
        },
        "inventory": {
          "enabled": true,
          "serviceName": "DefaultCustomerAvailabilitySummaryService",
          "missingBehavior": "omit"
        },
        "domains": {
          "enabled": true,
          "contributors": {},
          "missingBehavior": "error"
        }
      }
    }
  },
  schemaPolicies: {
    "product": {
      "catalogueVersioned": {
        "isVersionedEnabled": true,
        "versionedReadMode": "CURRENT"
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
      productPublicationSource: { enabled: false },
      productPublicationTarget: { enabled: false },
      commerceCustomer: {
        enabled: true,
      },
      commerceManagement: {
        enabled: true,
      },
      commercePublicationIngestion: {
        enabled: true,
      },
    },
  },
};
