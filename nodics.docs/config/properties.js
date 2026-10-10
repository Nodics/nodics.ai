/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module nodics.docs/config/properties
 * @description Defines documentation-content package metadata without enabling runtime APIs or server behavior.
 * @layer config
 * @owner nodics.docs
 * @override Projects may contribute their own documentation packs through project-owned modules or repositories.
 */
module.exports = {
  "tooling": {
    "acceptance": {
      "localBootstrap": {
        "documentationPacks": {
          "nodicsDocumentation": {
            "code": "nodicsDocumentation",
            "profileCode": "frameworkdocs",
            "minimumRoutes": 9,
            "navigationComponent": "nodicsDocumentationNavigation",
            "site": "nodicsDocumentationSite",
            "path": "/docs/framework"
          }
        }
      }
    }
  },
  "docs": {
    "contentPack": {
      "enabled": true,
      "owner": "nodics.docs",
      "runtimeModule": false,
      "sourceRoot": "data/docs-v001/records/documentation",
      "generatedRoot": "data/docs-v001",
      "manifestPath": "data/manifest.json",
      "manifestSection": "documentation"
    }
  },
  "data": {
    "contentPacks": {
      "packs": {
        "apparelProductDocumentation": {
          "manifestPack": "apparelProduct",
          "enabled": true,
          "source": {
            "type": "LOCAL_SIBLING",
            "repositoryName": "nodics.ai",
            "manifestPath": "nodics.accelerators/modules/apparel/modules/apparelProduct/data/manifest.json",
            "manifestSection": "documentation"
          },
          "presentation": {
            "title": "apparelProduct Documentation"
          }
        },
        "domainCommerceCoreDocumentation": {
          "manifestPack": "domainCommerceCore",
          "enabled": true,
          "source": {
            "type": "LOCAL_SIBLING",
            "repositoryName": "nodics.ai",
            "manifestPath": "nodics.accelerators/modules/domainCommerceCore/data/manifest.json",
            "manifestSection": "documentation"
          },
          "presentation": {
            "title": "domainCommerceCore Documentation"
          }
        },
        "electronicsProductDocumentation": {
          "manifestPack": "electronicsProduct",
          "enabled": true,
          "source": {
            "type": "LOCAL_SIBLING",
            "repositoryName": "nodics.ai",
            "manifestPath": "nodics.accelerators/modules/electronics/modules/electronicsProduct/data/manifest.json",
            "manifestSection": "documentation"
          },
          "presentation": {
            "title": "electronicsProduct Documentation"
          }
        },
        "nexus_webDocumentation": {
          "manifestPack": "nexus.web",
          "enabled": true,
          "source": {
            "type": "LOCAL_SIBLING",
            "repositoryName": "nodics.ai",
            "manifestPath": "nodics.accelerators/modules/nexus/modules/nexus.web/data/manifest.json",
            "manifestSection": "documentation"
          },
          "presentation": {
            "title": "nexus.web Documentation"
          }
        },
        "telcoSubscriptionDocumentation": {
          "manifestPack": "telcoSubscription",
          "enabled": true,
          "source": {
            "type": "LOCAL_SIBLING",
            "repositoryName": "nodics.ai",
            "manifestPath": "nodics.accelerators/modules/telco/modules/telcoSubscription/data/manifest.json",
            "manifestSection": "documentation"
          },
          "presentation": {
            "title": "telcoSubscription Documentation"
          }
        },
        "eWasteDocumentation": {
          "manifestPack": "eWaste",
          "enabled": true,
          "source": {
            "type": "LOCAL_SIBLING",
            "repositoryName": "nodics.ai",
            "manifestPath": "nodics.accelerators/modules/waste/modules/eWaste/data/manifest.json",
            "manifestSection": "documentation"
          },
          "presentation": {
            "title": "eWaste Documentation"
          }
        },
        "commerceSearchCoreDocumentation": {
          "manifestPack": "commerceSearchCore",
          "enabled": true,
          "source": {
            "type": "LOCAL_SIBLING",
            "repositoryName": "nodics.ai",
            "manifestPath": "nodics.commerce/modules/baseCommerce/modules/commerceSearch/modules/commerceSearchCore/data/manifest.json",
            "manifestSection": "documentation"
          },
          "presentation": {
            "title": "commerceSearchCore Documentation"
          }
        },
        "promotionDocumentation": {
          "manifestPack": "promotion",
          "enabled": true,
          "source": {
            "type": "LOCAL_SIBLING",
            "repositoryName": "nodics.ai",
            "manifestPath": "nodics.commerce/modules/baseCommerce/modules/promotion/data/manifest.json",
            "manifestSection": "documentation"
          },
          "presentation": { "title": "Promotion Documentation" }
        },
        "cartDocumentation": {
          "manifestPack": "cart",
          "enabled": true,
          "source": {
            "type": "LOCAL_SIBLING",
            "repositoryName": "nodics.ai",
            "manifestPath": "nodics.commerce/modules/checkout/modules/cart/data/manifest.json",
            "manifestSection": "documentation"
          },
          "presentation": { "title": "Cart Documentation" }
        },
        "digitalCoreDocumentation": {
          "manifestPack": "digitalCore",
          "enabled": true,
          "source": {
            "type": "LOCAL_SIBLING",
            "repositoryName": "nodics.ai",
            "manifestPath": "nodics.commerce/modules/digitalCommerce/modules/digitalCore/data/manifest.json",
            "manifestSection": "documentation"
          },
          "presentation": { "title": "Digital Commerce Documentation" }
        },
        "inventoryDocumentation": {
          "manifestPack": "inventory",
          "enabled": true,
          "source": {
            "type": "LOCAL_SIBLING",
            "repositoryName": "nodics.ai",
            "manifestPath": "nodics.commerce/modules/baseCommerce/modules/inventory/data/manifest.json",
            "manifestSection": "documentation"
          },
          "presentation": {
            "title": "inventory Documentation"
          }
        },
        "pricingDocumentation": {
          "manifestPack": "pricing",
          "enabled": true,
          "source": {
            "type": "LOCAL_SIBLING",
            "repositoryName": "nodics.ai",
            "manifestPath": "nodics.commerce/modules/baseCommerce/modules/pricing/data/manifest.json",
            "manifestSection": "documentation"
          },
          "presentation": {
            "title": "pricing Documentation"
          }
        },
        "productDocumentation": {
          "manifestPack": "product",
          "enabled": true,
          "source": {
            "type": "LOCAL_SIBLING",
            "repositoryName": "nodics.ai",
            "manifestPath": "nodics.commerce/modules/baseCommerce/modules/product/data/manifest.json",
            "manifestSection": "documentation"
          },
          "presentation": {
            "title": "product Documentation"
          }
        },
        "shoppingListDocumentation": {
          "manifestPack": "shoppingList",
          "enabled": true,
          "source": {
            "type": "LOCAL_SIBLING",
            "repositoryName": "nodics.ai",
            "manifestPath": "nodics.commerce/modules/baseCommerce/modules/shoppingList/data/manifest.json",
            "manifestSection": "documentation"
          },
          "presentation": {
            "title": "shoppingList Documentation"
          }
        },
        "checkoutCoreDocumentation": {
          "manifestPack": "checkoutCore",
          "enabled": true,
          "source": {
            "type": "LOCAL_SIBLING",
            "repositoryName": "nodics.ai",
            "manifestPath": "nodics.commerce/modules/checkout/modules/checkoutCore/data/manifest.json",
            "manifestSection": "documentation"
          },
          "presentation": {
            "title": "checkoutCore Documentation"
          }
        },
        "orderDocumentation": {
          "manifestPack": "order",
          "enabled": true,
          "source": {
            "type": "LOCAL_SIBLING",
            "repositoryName": "nodics.ai",
            "manifestPath": "nodics.commerce/modules/checkout/modules/order/data/manifest.json",
            "manifestSection": "documentation"
          },
          "presentation": {
            "title": "order Documentation"
          }
        },
        "fulfillmentCoreDocumentation": {
          "manifestPack": "fulfillmentCore",
          "enabled": true,
          "source": {
            "type": "LOCAL_SIBLING",
            "repositoryName": "nodics.ai",
            "manifestPath": "nodics.commerce/modules/fulfillment/modules/fulfillmentCore/data/manifest.json",
            "manifestSection": "documentation"
          },
          "presentation": {
            "title": "fulfillmentCore Documentation"
          }
        },
        "paymentCoreDocumentation": {
          "manifestPack": "paymentCore",
          "enabled": true,
          "source": {
            "type": "LOCAL_SIBLING",
            "repositoryName": "nodics.ai",
            "manifestPath": "nodics.commerce/modules/payment/modules/paymentCore/data/manifest.json",
            "manifestSection": "documentation"
          },
          "presentation": {
            "title": "paymentCore Documentation"
          }
        },
        "commsCoreDocumentation": {
          "manifestPack": "commsCore",
          "enabled": true,
          "source": {
            "type": "LOCAL_SIBLING",
            "repositoryName": "nodics.ai",
            "manifestPath": "nodics.communication/modules/commsCore/data/manifest.json",
            "manifestSection": "documentation"
          },
          "presentation": {
            "title": "commsCore Documentation"
          }
        },
        "copilotCapabilityDocumentation": {
          "manifestPack": "copilotCapability",
          "enabled": true,
          "source": {
            "type": "LOCAL_SIBLING",
            "repositoryName": "nodics.ai",
            "manifestPath": "nodics.copilot/modules/copilotCapability/data/manifest.json",
            "manifestSection": "documentation"
          },
          "presentation": {
            "title": "copilotCapability Documentation"
          }
        },
        "copilotConversationDocumentation": {
          "manifestPack": "copilotConversation",
          "enabled": true,
          "source": {
            "type": "LOCAL_SIBLING",
            "repositoryName": "nodics.ai",
            "manifestPath": "nodics.copilot/modules/copilotConversation/data/manifest.json",
            "manifestSection": "documentation"
          },
          "presentation": {
            "title": "copilotConversation Documentation"
          }
        },
        "copilotKnowledgeDocumentation": {
          "manifestPack": "copilotKnowledge",
          "enabled": true,
          "source": {
            "type": "LOCAL_SIBLING",
            "repositoryName": "nodics.ai",
            "manifestPath": "nodics.copilot/modules/copilotKnowledge/data/manifest.json",
            "manifestSection": "documentation"
          },
          "presentation": {
            "title": "copilotKnowledge Documentation"
          }
        },
        "copilotWorkbenchDocumentation": {
          "manifestPack": "copilotWorkbench",
          "enabled": true,
          "source": {
            "type": "LOCAL_SIBLING",
            "repositoryName": "nodics.ai",
            "manifestPath": "nodics.copilot/modules/copilotWorkbench/data/manifest.json",
            "manifestSection": "documentation"
          },
          "presentation": {
            "title": "copilotWorkbench Documentation"
          }
        },
        "discoveryRuntimeDocumentation": {
          "manifestPack": "discoveryRuntime",
          "enabled": true,
          "source": {
            "type": "LOCAL_SIBLING",
            "repositoryName": "nodics.ai",
            "manifestPath": "nodics.discovery/modules/discoveryRuntime/data/manifest.json",
            "manifestSection": "documentation"
          },
          "presentation": {
            "title": "discoveryRuntime Documentation"
          }
        },
        "contactSubmissionDocumentation": {
          "manifestPack": "contactSubmission",
          "enabled": true,
          "source": {
            "type": "LOCAL_SIBLING",
            "repositoryName": "nodics.ai",
            "manifestPath": "nodics.engagement/modules/contactSubmission/data/manifest.json",
            "manifestSection": "documentation"
          },
          "presentation": {
            "title": "contactSubmission Documentation"
          }
        },
        "customerFeedbackDocumentation": {
          "manifestPack": "customerFeedback",
          "enabled": true,
          "source": {
            "type": "LOCAL_SIBLING",
            "repositoryName": "nodics.ai",
            "manifestPath": "nodics.engagement/modules/customerFeedback/data/manifest.json",
            "manifestSection": "documentation"
          },
          "presentation": {
            "title": "customerFeedback Documentation"
          }
        },
        "customerReviewDocumentation": {
          "manifestPack": "customerReview",
          "enabled": true,
          "source": {
            "type": "LOCAL_SIBLING",
            "repositoryName": "nodics.ai",
            "manifestPath": "nodics.engagement/modules/customerReview/data/manifest.json",
            "manifestSection": "documentation"
          },
          "presentation": {
            "title": "customerReview Documentation"
          }
        },
        "engagementCoreDocumentation": {
          "manifestPack": "engagementCore",
          "enabled": true,
          "source": {
            "type": "LOCAL_SIBLING",
            "repositoryName": "nodics.ai",
            "manifestPath": "nodics.engagement/modules/engagementCore/data/manifest.json",
            "manifestSection": "documentation"
          },
          "presentation": {
            "title": "engagementCore Documentation"
          }
        },
        "cacheDocumentation": {
          "manifestPack": "cache",
          "enabled": true,
          "source": {
            "type": "LOCAL_SIBLING",
            "repositoryName": "nodics.ai",
            "manifestPath": "nodics.foundation/modules/nCache/cache/data/manifest.json",
            "manifestSection": "documentation"
          },
          "presentation": {
            "title": "cache Documentation"
          }
        },
        "nCommonDocumentation": {
          "manifestPack": "nCommon",
          "enabled": true,
          "source": {
            "type": "LOCAL_SIBLING",
            "repositoryName": "nodics.ai",
            "manifestPath": "nodics.foundation/modules/nCommon/data/manifest.json",
            "manifestSection": "documentation"
          },
          "presentation": {
            "title": "nCommon Documentation"
          }
        },
        "configDocumentation": {
          "manifestPack": "config",
          "enabled": true,
          "source": {
            "type": "LOCAL_SIBLING",
            "repositoryName": "nodics.ai",
            "manifestPath": "nodics.foundation/modules/nConfig/data/manifest.json",
            "manifestSection": "documentation"
          },
          "presentation": {
            "title": "config Documentation"
          }
        },
        "importDocumentation": {
          "manifestPack": "import",
          "enabled": true,
          "source": {
            "type": "LOCAL_SIBLING",
            "repositoryName": "nodics.ai",
            "manifestPath": "nodics.foundation/modules/nData/nImport/import/data/manifest.json",
            "manifestSection": "documentation"
          },
          "presentation": {
            "title": "import Documentation"
          }
        },
        "databaseDocumentation": {
          "manifestPack": "database",
          "enabled": true,
          "source": {
            "type": "LOCAL_SIBLING",
            "repositoryName": "nodics.ai",
            "manifestPath": "nodics.foundation/modules/nDatabase/database/data/manifest.json",
            "manifestSection": "documentation"
          },
          "presentation": {
            "title": "database Documentation"
          }
        },
        "emsClientDocumentation": {
          "manifestPack": "emsClient",
          "enabled": true,
          "source": {
            "type": "LOCAL_SIBLING",
            "repositoryName": "nodics.ai",
            "manifestPath": "nodics.foundation/modules/nEms/emsClient/data/manifest.json",
            "manifestSection": "documentation"
          },
          "presentation": {
            "title": "emsClient Documentation"
          }
        },
        "nmsDocumentation": {
          "manifestPack": "nms",
          "enabled": true,
          "source": {
            "type": "LOCAL_SIBLING",
            "repositoryName": "nodics.ai",
            "manifestPath": "nodics.foundation/modules/nNms/data/manifest.json",
            "manifestSection": "documentation"
          },
          "presentation": {
            "title": "nms Documentation"
          }
        },
        "otpDocumentation": {
          "manifestPack": "otp",
          "enabled": true,
          "source": {
            "type": "LOCAL_SIBLING",
            "repositoryName": "nodics.ai",
            "manifestPath": "nodics.foundation/modules/nOtp/data/manifest.json",
            "manifestSection": "documentation"
          },
          "presentation": {
            "title": "otp Documentation"
          }
        },
        "pipelineDocumentation": {
          "manifestPack": "pipeline",
          "enabled": true,
          "source": {
            "type": "LOCAL_SIBLING",
            "repositoryName": "nodics.ai",
            "manifestPath": "nodics.foundation/modules/nPipeline/data/manifest.json",
            "manifestSection": "documentation"
          },
          "presentation": {
            "title": "pipeline Documentation"
          }
        },
        "routerDocumentation": {
          "manifestPack": "router",
          "enabled": true,
          "source": {
            "type": "LOCAL_SIBLING",
            "repositoryName": "nodics.ai",
            "manifestPath": "nodics.foundation/modules/nRouter/data/manifest.json",
            "manifestSection": "documentation"
          },
          "presentation": {
            "title": "router Documentation"
          }
        },
        "nServiceDocumentation": {
          "manifestPack": "nService",
          "enabled": true,
          "source": {
            "type": "LOCAL_SIBLING",
            "repositoryName": "nodics.ai",
            "manifestPath": "nodics.foundation/modules/nService/data/manifest.json",
            "manifestSection": "documentation"
          },
          "presentation": {
            "title": "nService Documentation"
          }
        },
        "nToolingDocumentation": {
          "manifestPack": "nTooling",
          "enabled": true,
          "source": {
            "type": "LOCAL_SIBLING",
            "repositoryName": "nodics.ai",
            "manifestPath": "nodics.foundation/modules/nTooling/data/manifest.json",
            "manifestSection": "documentation"
          },
          "presentation": {
            "title": "nTooling Documentation"
          }
        },
        "bpmDocumentation": {
          "manifestPack": "bpm",
          "enabled": true,
          "source": {
            "type": "LOCAL_SIBLING",
            "repositoryName": "nodics.ai",
            "manifestPath": "nodics.foundation/modules/nbpm/data/manifest.json",
            "manifestSection": "documentation"
          },
          "presentation": {
            "title": "bpm Documentation"
          }
        },
        "localizationCoreDocumentation": {
          "manifestPack": "localizationCore",
          "enabled": true,
          "source": {
            "type": "LOCAL_SIBLING",
            "repositoryName": "nodics.ai",
            "manifestPath": "nodics.localization/modules/localizationCore/data/manifest.json",
            "manifestSection": "documentation"
          },
          "presentation": {
            "title": "localizationCore Documentation"
          }
        },
        "loyaltyWalletDocumentation": {
          "manifestPack": "loyaltyWallet",
          "enabled": true,
          "source": {
            "type": "LOCAL_SIBLING",
            "repositoryName": "nodics.ai",
            "manifestPath": "nodics.loyalty/modules/loyaltyWallet/data/manifest.json",
            "manifestSection": "documentation"
          },
          "presentation": {
            "title": "loyaltyWallet Documentation"
          }
        },
        "backofficeDocumentation": {
          "manifestPack": "backoffice",
          "enabled": true,
          "source": {
            "type": "LOCAL_SIBLING",
            "repositoryName": "nodics.ai",
            "manifestPath": "nodics.platform/modules/backoffice/data/manifest.json",
            "manifestSection": "documentation"
          },
          "presentation": {
            "title": "backoffice Documentation"
          }
        },
        "installerDocumentation": {
          "manifestPack": "installer",
          "enabled": true,
          "source": {
            "type": "LOCAL_SIBLING",
            "repositoryName": "nodics.ai",
            "manifestPath": "nodics.platform/modules/installer/data/manifest.json",
            "manifestSection": "documentation"
          },
          "presentation": {
            "title": "installer Documentation"
          }
        },
        "profileDocumentation": {
          "manifestPack": "profile",
          "enabled": true,
          "source": {
            "type": "LOCAL_SIBLING",
            "repositoryName": "nodics.ai",
            "manifestPath": "nodics.platform/modules/profile/data/manifest.json",
            "manifestSection": "documentation"
          },
          "presentation": {
            "title": "profile Documentation"
          }
        },
        "cronjobDocumentation": {
          "manifestPack": "cronjob",
          "enabled": true,
          "source": {
            "type": "LOCAL_SIBLING",
            "repositoryName": "nodics.ai",
            "manifestPath": "nodics.process/modules/cronjob/data/manifest.json",
            "manifestSection": "documentation"
          },
          "presentation": {
            "title": "cronjob Documentation"
          }
        },
        "workflowDocumentation": {
          "manifestPack": "workflow",
          "enabled": true,
          "source": {
            "type": "LOCAL_SIBLING",
            "repositoryName": "nodics.ai",
            "manifestPath": "nodics.process/modules/workflow/data/manifest.json",
            "manifestSection": "documentation"
          },
          "presentation": {
            "title": "workflow Documentation"
          }
        },
        "wasteImpactDocumentation": {
          "manifestPack": "wasteImpact",
          "enabled": true,
          "source": {
            "type": "LOCAL_SIBLING",
            "repositoryName": "nodics.ai",
            "manifestPath": "nodics.waste/modules/wasteImpact/data/manifest.json",
            "manifestSection": "documentation"
          },
          "presentation": {
            "title": "wasteImpact Documentation"
          }
        },
        "cmsDocumentation": {
          "manifestPack": "cms",
          "enabled": true,
          "source": {
            "type": "LOCAL_SIBLING",
            "repositoryName": "nodics.ai",
            "manifestPath": "nodics.wcms/modules/cms/data/manifest.json",
            "manifestSection": "documentation"
          },
          "presentation": {
            "title": "cms Documentation"
          }
        },
        "mediaDocumentation": {
          "manifestPack": "media",
          "enabled": true,
          "source": {
            "type": "LOCAL_SIBLING",
            "repositoryName": "nodics.ai",
            "manifestPath": "nodics.wcms/modules/media/data/manifest.json",
            "manifestSection": "documentation"
          },
          "presentation": {
            "title": "media Documentation"
          }
        },
        "wcmsDocumentation": {
          "manifestPack": "wcms",
          "enabled": true,
          "source": {
            "type": "LOCAL_SIBLING",
            "repositoryName": "nodics.ai",
            "manifestPath": "nodics.wcms/modules/wcms/data/manifest.json",
            "manifestSection": "documentation"
          },
          "presentation": {
            "title": "wcms Documentation"
          }
        },
        "copilotProviderDocumentation": {
          "manifestPack": "copilotProvider",
          "enabled": true,
          "source": {
            "type": "LOCAL_SIBLING",
            "repositoryName": "nodics.ai",
            "manifestPath": "nodics.copilot/modules/copilotProviders/modules/copilotProvider/data/manifest.json",
            "manifestSection": "documentation"
          },
          "presentation": {
            "title": "copilotProvider Documentation"
          }
        },
        "copilotEvaluationDocumentation": {
          "manifestPack": "copilotEvaluation",
          "enabled": true,
          "source": {
            "type": "LOCAL_SIBLING",
            "repositoryName": "nodics.ai",
            "manifestPath": "nodics.copilot/modules/copilotEvaluation/data/manifest.json",
            "manifestSection": "documentation"
          },
          "presentation": {
            "title": "copilotEvaluation Documentation"
          }
        },
        "rulesEvaluationDocumentation": {
          "manifestPack": "rulesEvaluation",
          "enabled": true,
          "source": {
            "type": "LOCAL_SIBLING",
            "repositoryName": "nodics.ai",
            "manifestPath": "nodics.rulesEngine/modules/rulesEvaluation/data/manifest.json",
            "manifestSection": "documentation"
          },
          "presentation": {
            "title": "rulesEvaluation Documentation"
          }
        },
        "wasteMaterialDocumentation": {
          "manifestPack": "wasteMaterial",
          "enabled": true,
          "source": {
            "type": "LOCAL_SIBLING",
            "repositoryName": "nodics.ai",
            "manifestPath": "nodics.waste/modules/wasteMaterial/data/manifest.json",
            "manifestSection": "documentation"
          },
          "presentation": {
            "title": "wasteMaterial Documentation"
          }
        },
        "locationApprovalDocumentation": {
          "manifestPack": "locationApproval",
          "enabled": true,
          "source": {
            "type": "LOCAL_SIBLING",
            "repositoryName": "nodics.ai",
            "manifestPath": "nodics.location/modules/locationApproval/data/manifest.json",
            "manifestSection": "documentation"
          },
          "presentation": {
            "title": "locationApproval Documentation"
          }
        },
        "locationDraftDocumentation": {
          "manifestPack": "locationDraft",
          "enabled": true,
          "source": {
            "type": "LOCAL_SIBLING",
            "repositoryName": "nodics.ai",
            "manifestPath": "nodics.location/modules/locationDraft/data/manifest.json",
            "manifestSection": "documentation"
          },
          "presentation": {
            "title": "locationDraft Documentation"
          }
        },
        "locationProjectionDocumentation": {
          "manifestPack": "locationProjection",
          "enabled": true,
          "source": {
            "type": "LOCAL_SIBLING",
            "repositoryName": "nodics.ai",
            "manifestPath": "nodics.location/modules/locationProjection/data/manifest.json",
            "manifestSection": "documentation"
          },
          "presentation": {
            "title": "locationProjection Documentation"
          }
        },
        "locationSearchDocumentation": {
          "manifestPack": "locationSearch",
          "enabled": true,
          "source": {
            "type": "LOCAL_SIBLING",
            "repositoryName": "nodics.ai",
            "manifestPath": "nodics.location/modules/locationSearch/data/manifest.json",
            "manifestSection": "documentation"
          },
          "presentation": {
            "title": "locationSearch Documentation"
          }
        },
        "locationTypeDocumentation": {
          "manifestPack": "locationType",
          "enabled": true,
          "source": {
            "type": "LOCAL_SIBLING",
            "repositoryName": "nodics.ai",
            "manifestPath": "nodics.location/modules/locationType/data/manifest.json",
            "manifestSection": "documentation"
          },
          "presentation": {
            "title": "locationType Documentation"
          }
        },
        "locationMapDocumentation": {
          "manifestPack": "locationMap",
          "enabled": true,
          "source": {
            "type": "LOCAL_SIBLING",
            "repositoryName": "nodics.ai",
            "manifestPath": "nodics.location/modules/locationMap/data/manifest.json",
            "manifestSection": "documentation"
          },
          "presentation": {
            "title": "locationMap Documentation"
          }
        },
        "wcmsExperienceDocumentation": {
          "manifestPack": "wcmsExperience",
          "enabled": true,
          "source": {
            "type": "LOCAL_SIBLING",
            "repositoryName": "nodics.ai",
            "manifestPath": "nodics.wcms/modules/wcmsExperience/data/manifest.json",
            "manifestSection": "documentation"
          },
          "presentation": {
            "title": "wcmsExperience Documentation"
          }
        },
        "redisCacheDocumentation": {
          "manifestPack": "redisCache",
          "enabled": true,
          "source": {
            "type": "LOCAL_SIBLING",
            "repositoryName": "nodics.ai",
            "manifestPath": "nodics.foundation/modules/nCache/redisCache/data/manifest.json",
            "manifestSection": "documentation"
          },
          "presentation": {
            "title": "redisCache Documentation"
          }
        },
        "nodicsDocumentationFoundation": {
          "manifestPack": "nodics.docs",
          "enabled": true,
          "source": {
            "type": "LOCAL_SIBLING",
            "repositoryName": "nodics.ai",
            "manifestPath": "nodics.docs/data/manifest.json",
            "manifestSection": "foundation"
          },
          "presentation": {
            "title": "nodics.docs Documentation"
          }
        },
        "circaDocumentation": {
          "manifestPack": "eWaste",
          "enabled": true,
          "source": {
            "type": "LOCAL_SIBLING",
            "repositoryName": "nodics.ai",
            "manifestPath": "nodics.accelerators/modules/waste/modules/eWaste/data/manifest.json",
            "manifestSection": "referenceDocumentation"
          },
          "presentation": {
            "title": "eWaste Documentation"
          }
        }
      }
    }
  },
  "backofficeApplicationInitialization": {
    "profiles": {
      "docs-apparelproduct": {
        "code": "docs-apparelproduct",
        "type": "DOCUMENTATION_BUNDLE",
        "enabled": true,
        "owner": "apparelProduct",
        "applicationCode": "axis",
        "siteCode": "nodicsDocumentationSite",
        "baselineCode": "docs-apparelproduct",
        "contentPackCode": "apparelProductDocumentation",
        "presentation": {
          "title": "apparelProduct Documentation",
          "kind": "DOCUMENTATION",
          "category": "documentation",
          "order": 310,
          "summary": "Optional apparelProduct articles with the shared documentation foundation. Publication uses the shared framework documentation site.",
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
        }
      },
      "docs-domaincommercecore": {
        "code": "docs-domaincommercecore",
        "type": "DOCUMENTATION_BUNDLE",
        "enabled": true,
        "owner": "domainCommerceCore",
        "applicationCode": "axis",
        "siteCode": "nodicsDocumentationSite",
        "baselineCode": "docs-domaincommercecore",
        "contentPackCode": "domainCommerceCoreDocumentation",
        "presentation": {
          "title": "domainCommerceCore Documentation",
          "kind": "DOCUMENTATION",
          "category": "documentation",
          "order": 311,
          "summary": "Optional domainCommerceCore articles with the shared documentation foundation. Publication uses the shared framework documentation site.",
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
        }
      },
      "docs-electronicsproduct": {
        "code": "docs-electronicsproduct",
        "type": "DOCUMENTATION_BUNDLE",
        "enabled": true,
        "owner": "electronicsProduct",
        "applicationCode": "axis",
        "siteCode": "nodicsDocumentationSite",
        "baselineCode": "docs-electronicsproduct",
        "contentPackCode": "electronicsProductDocumentation",
        "presentation": {
          "title": "electronicsProduct Documentation",
          "kind": "DOCUMENTATION",
          "category": "documentation",
          "order": 312,
          "summary": "Optional electronicsProduct articles with the shared documentation foundation. Publication uses the shared framework documentation site.",
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
        }
      },
      "docs-nexus-web": {
        "code": "docs-nexus-web",
        "type": "DOCUMENTATION_BUNDLE",
        "enabled": true,
        "owner": "nexus.web",
        "applicationCode": "axis",
        "siteCode": "nodicsDocumentationSite",
        "baselineCode": "docs-nexus-web",
        "contentPackCode": "nexus_webDocumentation",
        "presentation": {
          "title": "nexus.web Documentation",
          "kind": "DOCUMENTATION",
          "category": "documentation",
          "order": 313,
          "summary": "Optional nexus.web articles with the shared documentation foundation. Publication uses the shared framework documentation site.",
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
        }
      },
      "docs-telcosubscription": {
        "code": "docs-telcosubscription",
        "type": "DOCUMENTATION_BUNDLE",
        "enabled": true,
        "owner": "telcoSubscription",
        "applicationCode": "axis",
        "siteCode": "nodicsDocumentationSite",
        "baselineCode": "docs-telcosubscription",
        "contentPackCode": "telcoSubscriptionDocumentation",
        "presentation": {
          "title": "telcoSubscription Documentation",
          "kind": "DOCUMENTATION",
          "category": "documentation",
          "order": 314,
          "summary": "Optional telcoSubscription articles with the shared documentation foundation. Publication uses the shared framework documentation site.",
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
        }
      },
      "docs-ewaste": {
        "code": "docs-ewaste",
        "type": "DOCUMENTATION_BUNDLE",
        "enabled": true,
        "owner": "eWaste",
        "applicationCode": "axis",
        "siteCode": "nodicsDocumentationSite",
        "baselineCode": "docs-ewaste",
        "contentPackCode": "eWasteDocumentation",
        "presentation": {
          "title": "eWaste Documentation",
          "kind": "DOCUMENTATION",
          "category": "documentation",
          "order": 315,
          "summary": "Optional eWaste articles with the shared documentation foundation. Publication uses the shared framework documentation site.",
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
        }
      },
      "docs-commercesearchcore": {
        "code": "docs-commercesearchcore",
        "type": "DOCUMENTATION_BUNDLE",
        "enabled": true,
        "owner": "commerceSearchCore",
        "applicationCode": "axis",
        "siteCode": "nodicsDocumentationSite",
        "baselineCode": "docs-commercesearchcore",
        "contentPackCode": "commerceSearchCoreDocumentation",
        "presentation": {
          "title": "commerceSearchCore Documentation",
          "kind": "DOCUMENTATION",
          "category": "documentation",
          "order": 316,
          "summary": "Optional commerceSearchCore articles with the shared documentation foundation. Publication uses the shared framework documentation site.",
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
        }
      },
      "docs-promotion": {
        "code": "docs-promotion",
        "type": "DOCUMENTATION_BUNDLE",
        "enabled": true,
        "owner": "promotion",
        "applicationCode": "axis",
        "siteCode": "nodicsDocumentationSite",
        "baselineCode": "docs-promotion",
        "contentPackCode": "promotionDocumentation",
        "presentation": {
          "title": "Promotion Documentation",
          "kind": "DOCUMENTATION",
          "category": "documentation",
          "order": 370,
          "summary": "Optional Promotion campaign and secure coupon issuance guidance with the shared documentation foundation.",
          "requiredServers": ["Platform", "WCMS Staged", "WCMS Online", "Process"],
          "activationPolicy": { "approvalRequiredForOnline": true, "requiredDataTrigger": "USER", "sampleDataTrigger": "USER" }
        }
      },
      "docs-cart": {
        "code": "docs-cart",
        "type": "DOCUMENTATION_BUNDLE",
        "enabled": true,
        "owner": "cart",
        "applicationCode": "axis",
        "siteCode": "nodicsDocumentationSite",
        "baselineCode": "docs-cart",
        "contentPackCode": "cartDocumentation",
        "presentation": {
          "title": "Cart Documentation",
          "kind": "DOCUMENTATION",
          "category": "documentation",
          "order": 371,
          "summary": "Optional Cart intent, availability, calculation and recovery guidance with the shared documentation foundation.",
          "requiredServers": ["Platform", "WCMS Staged", "WCMS Online", "Process"],
          "activationPolicy": { "approvalRequiredForOnline": true, "requiredDataTrigger": "USER", "sampleDataTrigger": "USER" }
        }
      },
      "docs-digitalcore": {
        "code": "docs-digitalcore",
        "type": "DOCUMENTATION_BUNDLE",
        "enabled": true,
        "owner": "digitalCore",
        "applicationCode": "axis",
        "siteCode": "nodicsDocumentationSite",
        "baselineCode": "docs-digitalcore",
        "contentPackCode": "digitalCoreDocumentation",
        "presentation": {
          "title": "Digital Commerce Documentation",
          "kind": "DOCUMENTATION",
          "category": "documentation",
          "order": 372,
          "summary": "Optional digital purchase, delivery and private reveal guidance with the shared documentation foundation.",
          "requiredServers": ["Platform", "WCMS Staged", "WCMS Online", "Process"],
          "activationPolicy": { "approvalRequiredForOnline": true, "requiredDataTrigger": "USER", "sampleDataTrigger": "USER" }
        }
      },
      "docs-inventory": {
        "code": "docs-inventory",
        "type": "DOCUMENTATION_BUNDLE",
        "enabled": true,
        "owner": "inventory",
        "applicationCode": "axis",
        "siteCode": "nodicsDocumentationSite",
        "baselineCode": "docs-inventory",
        "contentPackCode": "inventoryDocumentation",
        "presentation": {
          "title": "inventory Documentation",
          "kind": "DOCUMENTATION",
          "category": "documentation",
          "order": 317,
          "summary": "Optional inventory articles with the shared documentation foundation. Publication uses the shared framework documentation site.",
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
        }
      },
      "docs-pricing": {
        "code": "docs-pricing",
        "type": "DOCUMENTATION_BUNDLE",
        "enabled": true,
        "owner": "pricing",
        "applicationCode": "axis",
        "siteCode": "nodicsDocumentationSite",
        "baselineCode": "docs-pricing",
        "contentPackCode": "pricingDocumentation",
        "presentation": {
          "title": "pricing Documentation",
          "kind": "DOCUMENTATION",
          "category": "documentation",
          "order": 318,
          "summary": "Optional pricing articles with the shared documentation foundation. Publication uses the shared framework documentation site.",
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
        }
      },
      "docs-product": {
        "code": "docs-product",
        "type": "DOCUMENTATION_BUNDLE",
        "enabled": true,
        "owner": "product",
        "applicationCode": "axis",
        "siteCode": "nodicsDocumentationSite",
        "baselineCode": "docs-product",
        "contentPackCode": "productDocumentation",
        "presentation": {
          "title": "product Documentation",
          "kind": "DOCUMENTATION",
          "category": "documentation",
          "order": 319,
          "summary": "Optional product articles with the shared documentation foundation. Publication uses the shared framework documentation site.",
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
        }
      },
      "docs-shoppinglist": {
        "code": "docs-shoppinglist",
        "type": "DOCUMENTATION_BUNDLE",
        "enabled": true,
        "owner": "shoppingList",
        "applicationCode": "axis",
        "siteCode": "nodicsDocumentationSite",
        "baselineCode": "docs-shoppinglist",
        "contentPackCode": "shoppingListDocumentation",
        "presentation": {
          "title": "shoppingList Documentation",
          "kind": "DOCUMENTATION",
          "category": "documentation",
          "order": 320,
          "summary": "Optional shoppingList articles with the shared documentation foundation. Publication uses the shared framework documentation site.",
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
        }
      },
      "docs-checkoutcore": {
        "code": "docs-checkoutcore",
        "type": "DOCUMENTATION_BUNDLE",
        "enabled": true,
        "owner": "checkoutCore",
        "applicationCode": "axis",
        "siteCode": "nodicsDocumentationSite",
        "baselineCode": "docs-checkoutcore",
        "contentPackCode": "checkoutCoreDocumentation",
        "presentation": {
          "title": "checkoutCore Documentation",
          "kind": "DOCUMENTATION",
          "category": "documentation",
          "order": 321,
          "summary": "Optional checkoutCore articles with the shared documentation foundation. Publication uses the shared framework documentation site.",
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
        }
      },
      "docs-order": {
        "code": "docs-order",
        "type": "DOCUMENTATION_BUNDLE",
        "enabled": true,
        "owner": "order",
        "applicationCode": "axis",
        "siteCode": "nodicsDocumentationSite",
        "baselineCode": "docs-order",
        "contentPackCode": "orderDocumentation",
        "presentation": {
          "title": "order Documentation",
          "kind": "DOCUMENTATION",
          "category": "documentation",
          "order": 322,
          "summary": "Optional order articles with the shared documentation foundation. Publication uses the shared framework documentation site.",
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
        }
      },
      "docs-fulfillmentcore": {
        "code": "docs-fulfillmentcore",
        "type": "DOCUMENTATION_BUNDLE",
        "enabled": true,
        "owner": "fulfillmentCore",
        "applicationCode": "axis",
        "siteCode": "nodicsDocumentationSite",
        "baselineCode": "docs-fulfillmentcore",
        "contentPackCode": "fulfillmentCoreDocumentation",
        "presentation": {
          "title": "fulfillmentCore Documentation",
          "kind": "DOCUMENTATION",
          "category": "documentation",
          "order": 323,
          "summary": "Optional fulfillmentCore articles with the shared documentation foundation. Publication uses the shared framework documentation site.",
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
        }
      },
      "docs-paymentcore": {
        "code": "docs-paymentcore",
        "type": "DOCUMENTATION_BUNDLE",
        "enabled": true,
        "owner": "paymentCore",
        "applicationCode": "axis",
        "siteCode": "nodicsDocumentationSite",
        "baselineCode": "docs-paymentcore",
        "contentPackCode": "paymentCoreDocumentation",
        "presentation": {
          "title": "paymentCore Documentation",
          "kind": "DOCUMENTATION",
          "category": "documentation",
          "order": 324,
          "summary": "Optional paymentCore articles with the shared documentation foundation. Publication uses the shared framework documentation site.",
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
        }
      },
      "docs-commscore": {
        "code": "docs-commscore",
        "type": "DOCUMENTATION_BUNDLE",
        "enabled": true,
        "owner": "commsCore",
        "applicationCode": "axis",
        "siteCode": "nodicsDocumentationSite",
        "baselineCode": "docs-commscore",
        "contentPackCode": "commsCoreDocumentation",
        "presentation": {
          "title": "commsCore Documentation",
          "kind": "DOCUMENTATION",
          "category": "documentation",
          "order": 325,
          "summary": "Optional commsCore articles with the shared documentation foundation. Publication uses the shared framework documentation site.",
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
        }
      },
      "docs-copilotcapability": {
        "code": "docs-copilotcapability",
        "type": "DOCUMENTATION_BUNDLE",
        "enabled": true,
        "owner": "copilotCapability",
        "applicationCode": "axis",
        "siteCode": "nodicsDocumentationSite",
        "baselineCode": "docs-copilotcapability",
        "contentPackCode": "copilotCapabilityDocumentation",
        "presentation": {
          "title": "copilotCapability Documentation",
          "kind": "DOCUMENTATION",
          "category": "documentation",
          "order": 326,
          "summary": "Optional copilotCapability articles with the shared documentation foundation. Publication uses the shared framework documentation site.",
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
        }
      },
      "docs-copilotconversation": {
        "code": "docs-copilotconversation",
        "type": "DOCUMENTATION_BUNDLE",
        "enabled": true,
        "owner": "copilotConversation",
        "applicationCode": "axis",
        "siteCode": "nodicsDocumentationSite",
        "baselineCode": "docs-copilotconversation",
        "contentPackCode": "copilotConversationDocumentation",
        "presentation": {
          "title": "copilotConversation Documentation",
          "kind": "DOCUMENTATION",
          "category": "documentation",
          "order": 327,
          "summary": "Optional copilotConversation articles with the shared documentation foundation. Publication uses the shared framework documentation site.",
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
        }
      },
      "docs-copilotknowledge": {
        "code": "docs-copilotknowledge",
        "type": "DOCUMENTATION_BUNDLE",
        "enabled": true,
        "owner": "copilotKnowledge",
        "applicationCode": "axis",
        "siteCode": "nodicsDocumentationSite",
        "baselineCode": "docs-copilotknowledge",
        "contentPackCode": "copilotKnowledgeDocumentation",
        "presentation": {
          "title": "copilotKnowledge Documentation",
          "kind": "DOCUMENTATION",
          "category": "documentation",
          "order": 328,
          "summary": "Optional copilotKnowledge articles with the shared documentation foundation. Publication uses the shared framework documentation site.",
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
        }
      },
      "docs-copilotworkbench": {
        "code": "docs-copilotworkbench",
        "type": "DOCUMENTATION_BUNDLE",
        "enabled": true,
        "owner": "copilotWorkbench",
        "applicationCode": "axis",
        "siteCode": "nodicsDocumentationSite",
        "baselineCode": "docs-copilotworkbench",
        "contentPackCode": "copilotWorkbenchDocumentation",
        "presentation": {
          "title": "copilotWorkbench Documentation",
          "kind": "DOCUMENTATION",
          "category": "documentation",
          "order": 329,
          "summary": "Optional copilotWorkbench articles with the shared documentation foundation. Publication uses the shared framework documentation site.",
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
        }
      },
      "docs-discoveryruntime": {
        "code": "docs-discoveryruntime",
        "type": "DOCUMENTATION_BUNDLE",
        "enabled": true,
        "owner": "discoveryRuntime",
        "applicationCode": "axis",
        "siteCode": "nodicsDocumentationSite",
        "baselineCode": "docs-discoveryruntime",
        "contentPackCode": "discoveryRuntimeDocumentation",
        "presentation": {
          "title": "discoveryRuntime Documentation",
          "kind": "DOCUMENTATION",
          "category": "documentation",
          "order": 330,
          "summary": "Optional discoveryRuntime articles with the shared documentation foundation. Publication uses the shared framework documentation site.",
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
        }
      },
      "docs-contactsubmission": {
        "code": "docs-contactsubmission",
        "type": "DOCUMENTATION_BUNDLE",
        "enabled": true,
        "owner": "contactSubmission",
        "applicationCode": "axis",
        "siteCode": "nodicsDocumentationSite",
        "baselineCode": "docs-contactsubmission",
        "contentPackCode": "contactSubmissionDocumentation",
        "presentation": {
          "title": "contactSubmission Documentation",
          "kind": "DOCUMENTATION",
          "category": "documentation",
          "order": 331,
          "summary": "Optional contactSubmission articles with the shared documentation foundation. Publication uses the shared framework documentation site.",
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
        }
      },
      "docs-customerfeedback": {
        "code": "docs-customerfeedback",
        "type": "DOCUMENTATION_BUNDLE",
        "enabled": true,
        "owner": "customerFeedback",
        "applicationCode": "axis",
        "siteCode": "nodicsDocumentationSite",
        "baselineCode": "docs-customerfeedback",
        "contentPackCode": "customerFeedbackDocumentation",
        "presentation": {
          "title": "customerFeedback Documentation",
          "kind": "DOCUMENTATION",
          "category": "documentation",
          "order": 332,
          "summary": "Optional customerFeedback articles with the shared documentation foundation. Publication uses the shared framework documentation site.",
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
        }
      },
      "docs-customerreview": {
        "code": "docs-customerreview",
        "type": "DOCUMENTATION_BUNDLE",
        "enabled": true,
        "owner": "customerReview",
        "applicationCode": "axis",
        "siteCode": "nodicsDocumentationSite",
        "baselineCode": "docs-customerreview",
        "contentPackCode": "customerReviewDocumentation",
        "presentation": {
          "title": "customerReview Documentation",
          "kind": "DOCUMENTATION",
          "category": "documentation",
          "order": 333,
          "summary": "Optional customerReview articles with the shared documentation foundation. Publication uses the shared framework documentation site.",
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
        }
      },
      "docs-engagementcore": {
        "code": "docs-engagementcore",
        "type": "DOCUMENTATION_BUNDLE",
        "enabled": true,
        "owner": "engagementCore",
        "applicationCode": "axis",
        "siteCode": "nodicsDocumentationSite",
        "baselineCode": "docs-engagementcore",
        "contentPackCode": "engagementCoreDocumentation",
        "presentation": {
          "title": "engagementCore Documentation",
          "kind": "DOCUMENTATION",
          "category": "documentation",
          "order": 334,
          "summary": "Optional engagementCore articles with the shared documentation foundation. Publication uses the shared framework documentation site.",
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
        }
      },
      "docs-cache": {
        "code": "docs-cache",
        "type": "DOCUMENTATION_BUNDLE",
        "enabled": true,
        "owner": "cache",
        "applicationCode": "axis",
        "siteCode": "nodicsDocumentationSite",
        "baselineCode": "docs-cache",
        "contentPackCode": "cacheDocumentation",
        "presentation": {
          "title": "cache Documentation",
          "kind": "DOCUMENTATION",
          "category": "documentation",
          "order": 335,
          "summary": "Optional cache articles with the shared documentation foundation. Publication uses the shared framework documentation site.",
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
        }
      },
      "docs-ncommon": {
        "code": "docs-ncommon",
        "type": "DOCUMENTATION_BUNDLE",
        "enabled": true,
        "owner": "nCommon",
        "applicationCode": "axis",
        "siteCode": "nodicsDocumentationSite",
        "baselineCode": "docs-ncommon",
        "contentPackCode": "nCommonDocumentation",
        "presentation": {
          "title": "nCommon Documentation",
          "kind": "DOCUMENTATION",
          "category": "documentation",
          "order": 336,
          "summary": "Optional nCommon articles with the shared documentation foundation. Publication uses the shared framework documentation site.",
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
        }
      },
      "docs-config": {
        "code": "docs-config",
        "type": "DOCUMENTATION_BUNDLE",
        "enabled": true,
        "owner": "config",
        "applicationCode": "axis",
        "siteCode": "nodicsDocumentationSite",
        "baselineCode": "docs-config",
        "contentPackCode": "configDocumentation",
        "presentation": {
          "title": "config Documentation",
          "kind": "DOCUMENTATION",
          "category": "documentation",
          "order": 337,
          "summary": "Optional config articles with the shared documentation foundation. Publication uses the shared framework documentation site.",
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
        }
      },
      "docs-import": {
        "code": "docs-import",
        "type": "DOCUMENTATION_BUNDLE",
        "enabled": true,
        "owner": "import",
        "applicationCode": "axis",
        "siteCode": "nodicsDocumentationSite",
        "baselineCode": "docs-import",
        "contentPackCode": "importDocumentation",
        "presentation": {
          "title": "import Documentation",
          "kind": "DOCUMENTATION",
          "category": "documentation",
          "order": 338,
          "summary": "Optional import articles with the shared documentation foundation. Publication uses the shared framework documentation site.",
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
        }
      },
      "docs-database": {
        "code": "docs-database",
        "type": "DOCUMENTATION_BUNDLE",
        "enabled": true,
        "owner": "database",
        "applicationCode": "axis",
        "siteCode": "nodicsDocumentationSite",
        "baselineCode": "docs-database",
        "contentPackCode": "databaseDocumentation",
        "presentation": {
          "title": "database Documentation",
          "kind": "DOCUMENTATION",
          "category": "documentation",
          "order": 339,
          "summary": "Optional database articles with the shared documentation foundation. Publication uses the shared framework documentation site.",
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
        }
      },
      "docs-emsclient": {
        "code": "docs-emsclient",
        "type": "DOCUMENTATION_BUNDLE",
        "enabled": true,
        "owner": "emsClient",
        "applicationCode": "axis",
        "siteCode": "nodicsDocumentationSite",
        "baselineCode": "docs-emsclient",
        "contentPackCode": "emsClientDocumentation",
        "presentation": {
          "title": "emsClient Documentation",
          "kind": "DOCUMENTATION",
          "category": "documentation",
          "order": 340,
          "summary": "Optional emsClient articles with the shared documentation foundation. Publication uses the shared framework documentation site.",
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
        }
      },
      "docs-nms": {
        "code": "docs-nms",
        "type": "DOCUMENTATION_BUNDLE",
        "enabled": true,
        "owner": "nms",
        "applicationCode": "axis",
        "siteCode": "nodicsDocumentationSite",
        "baselineCode": "docs-nms",
        "contentPackCode": "nmsDocumentation",
        "presentation": {
          "title": "nms Documentation",
          "kind": "DOCUMENTATION",
          "category": "documentation",
          "order": 341,
          "summary": "Optional nms articles with the shared documentation foundation. Publication uses the shared framework documentation site.",
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
        }
      },
      "docs-otp": {
        "code": "docs-otp",
        "type": "DOCUMENTATION_BUNDLE",
        "enabled": true,
        "owner": "otp",
        "applicationCode": "axis",
        "siteCode": "nodicsDocumentationSite",
        "baselineCode": "docs-otp",
        "contentPackCode": "otpDocumentation",
        "presentation": {
          "title": "otp Documentation",
          "kind": "DOCUMENTATION",
          "category": "documentation",
          "order": 342,
          "summary": "Optional otp articles with the shared documentation foundation. Publication uses the shared framework documentation site.",
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
        }
      },
      "docs-pipeline": {
        "code": "docs-pipeline",
        "type": "DOCUMENTATION_BUNDLE",
        "enabled": true,
        "owner": "pipeline",
        "applicationCode": "axis",
        "siteCode": "nodicsDocumentationSite",
        "baselineCode": "docs-pipeline",
        "contentPackCode": "pipelineDocumentation",
        "presentation": {
          "title": "pipeline Documentation",
          "kind": "DOCUMENTATION",
          "category": "documentation",
          "order": 343,
          "summary": "Optional pipeline articles with the shared documentation foundation. Publication uses the shared framework documentation site.",
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
        }
      },
      "docs-router": {
        "code": "docs-router",
        "type": "DOCUMENTATION_BUNDLE",
        "enabled": true,
        "owner": "router",
        "applicationCode": "axis",
        "siteCode": "nodicsDocumentationSite",
        "baselineCode": "docs-router",
        "contentPackCode": "routerDocumentation",
        "presentation": {
          "title": "router Documentation",
          "kind": "DOCUMENTATION",
          "category": "documentation",
          "order": 344,
          "summary": "Optional router articles with the shared documentation foundation. Publication uses the shared framework documentation site.",
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
        }
      },
      "docs-nservice": {
        "code": "docs-nservice",
        "type": "DOCUMENTATION_BUNDLE",
        "enabled": true,
        "owner": "nService",
        "applicationCode": "axis",
        "siteCode": "nodicsDocumentationSite",
        "baselineCode": "docs-nservice",
        "contentPackCode": "nServiceDocumentation",
        "presentation": {
          "title": "nService Documentation",
          "kind": "DOCUMENTATION",
          "category": "documentation",
          "order": 345,
          "summary": "Optional nService articles with the shared documentation foundation. Publication uses the shared framework documentation site.",
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
        }
      },
      "docs-ntooling": {
        "code": "docs-ntooling",
        "type": "DOCUMENTATION_BUNDLE",
        "enabled": true,
        "owner": "nTooling",
        "applicationCode": "axis",
        "siteCode": "nodicsDocumentationSite",
        "baselineCode": "docs-ntooling",
        "contentPackCode": "nToolingDocumentation",
        "presentation": {
          "title": "nTooling Documentation",
          "kind": "DOCUMENTATION",
          "category": "documentation",
          "order": 346,
          "summary": "Optional nTooling articles with the shared documentation foundation. Publication uses the shared framework documentation site.",
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
        }
      },
      "docs-bpm": {
        "code": "docs-bpm",
        "type": "DOCUMENTATION_BUNDLE",
        "enabled": true,
        "owner": "bpm",
        "applicationCode": "axis",
        "siteCode": "nodicsDocumentationSite",
        "baselineCode": "docs-bpm",
        "contentPackCode": "bpmDocumentation",
        "presentation": {
          "title": "bpm Documentation",
          "kind": "DOCUMENTATION",
          "category": "documentation",
          "order": 347,
          "summary": "Optional bpm articles with the shared documentation foundation. Publication uses the shared framework documentation site.",
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
        }
      },
      "docs-localizationcore": {
        "code": "docs-localizationcore",
        "type": "DOCUMENTATION_BUNDLE",
        "enabled": true,
        "owner": "localizationCore",
        "applicationCode": "axis",
        "siteCode": "nodicsDocumentationSite",
        "baselineCode": "docs-localizationcore",
        "contentPackCode": "localizationCoreDocumentation",
        "presentation": {
          "title": "localizationCore Documentation",
          "kind": "DOCUMENTATION",
          "category": "documentation",
          "order": 348,
          "summary": "Optional localizationCore articles with the shared documentation foundation. Publication uses the shared framework documentation site.",
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
        }
      },
      "docs-loyaltywallet": {
        "code": "docs-loyaltywallet",
        "type": "DOCUMENTATION_BUNDLE",
        "enabled": true,
        "owner": "loyaltyWallet",
        "applicationCode": "axis",
        "siteCode": "nodicsDocumentationSite",
        "baselineCode": "docs-loyaltywallet",
        "contentPackCode": "loyaltyWalletDocumentation",
        "presentation": {
          "title": "loyaltyWallet Documentation",
          "kind": "DOCUMENTATION",
          "category": "documentation",
          "order": 349,
          "summary": "Optional loyaltyWallet articles with the shared documentation foundation. Publication uses the shared framework documentation site.",
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
        }
      },
      "docs-backoffice": {
        "code": "docs-backoffice",
        "type": "DOCUMENTATION_BUNDLE",
        "enabled": true,
        "owner": "backoffice",
        "applicationCode": "axis",
        "siteCode": "nodicsDocumentationSite",
        "baselineCode": "docs-backoffice",
        "contentPackCode": "backofficeDocumentation",
        "presentation": {
          "title": "backoffice Documentation",
          "kind": "DOCUMENTATION",
          "category": "documentation",
          "order": 350,
          "summary": "Optional backoffice articles with the shared documentation foundation. Publication uses the shared framework documentation site.",
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
        }
      },
      "docs-installer": {
        "code": "docs-installer",
        "type": "DOCUMENTATION_BUNDLE",
        "enabled": true,
        "owner": "installer",
        "applicationCode": "axis",
        "siteCode": "nodicsDocumentationSite",
        "baselineCode": "docs-installer",
        "contentPackCode": "installerDocumentation",
        "presentation": {
          "title": "installer Documentation",
          "kind": "DOCUMENTATION",
          "category": "documentation",
          "order": 351,
          "summary": "Optional installer articles with the shared documentation foundation. Publication uses the shared framework documentation site.",
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
        }
      },
      "docs-profile": {
        "code": "docs-profile",
        "type": "DOCUMENTATION_BUNDLE",
        "enabled": true,
        "owner": "profile",
        "applicationCode": "axis",
        "siteCode": "nodicsDocumentationSite",
        "baselineCode": "docs-profile",
        "contentPackCode": "profileDocumentation",
        "presentation": {
          "title": "profile Documentation",
          "kind": "DOCUMENTATION",
          "category": "documentation",
          "order": 352,
          "summary": "Optional profile articles with the shared documentation foundation. Publication uses the shared framework documentation site.",
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
        }
      },
      "docs-cronjob": {
        "code": "docs-cronjob",
        "type": "DOCUMENTATION_BUNDLE",
        "enabled": true,
        "owner": "cronjob",
        "applicationCode": "axis",
        "siteCode": "nodicsDocumentationSite",
        "baselineCode": "docs-cronjob",
        "contentPackCode": "cronjobDocumentation",
        "presentation": {
          "title": "cronjob Documentation",
          "kind": "DOCUMENTATION",
          "category": "documentation",
          "order": 353,
          "summary": "Optional cronjob articles with the shared documentation foundation. Publication uses the shared framework documentation site.",
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
        }
      },
      "docs-workflow": {
        "code": "docs-workflow",
        "type": "DOCUMENTATION_BUNDLE",
        "enabled": true,
        "owner": "workflow",
        "applicationCode": "axis",
        "siteCode": "nodicsDocumentationSite",
        "baselineCode": "docs-workflow",
        "contentPackCode": "workflowDocumentation",
        "presentation": {
          "title": "workflow Documentation",
          "kind": "DOCUMENTATION",
          "category": "documentation",
          "order": 354,
          "summary": "Optional workflow articles with the shared documentation foundation. Publication uses the shared framework documentation site.",
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
        }
      },
      "docs-wasteimpact": {
        "code": "docs-wasteimpact",
        "type": "DOCUMENTATION_BUNDLE",
        "enabled": true,
        "owner": "wasteImpact",
        "applicationCode": "axis",
        "siteCode": "nodicsDocumentationSite",
        "baselineCode": "docs-wasteimpact",
        "contentPackCode": "wasteImpactDocumentation",
        "presentation": {
          "title": "wasteImpact Documentation",
          "kind": "DOCUMENTATION",
          "category": "documentation",
          "order": 355,
          "summary": "Optional wasteImpact articles with the shared documentation foundation. Publication uses the shared framework documentation site.",
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
        }
      },
      "docs-cms": {
        "code": "docs-cms",
        "type": "DOCUMENTATION_BUNDLE",
        "enabled": true,
        "owner": "cms",
        "applicationCode": "axis",
        "siteCode": "nodicsDocumentationSite",
        "baselineCode": "docs-cms",
        "contentPackCode": "cmsDocumentation",
        "presentation": {
          "title": "cms Documentation",
          "kind": "DOCUMENTATION",
          "category": "documentation",
          "order": 356,
          "summary": "Optional cms articles with the shared documentation foundation. Publication uses the shared framework documentation site.",
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
        }
      },
      "docs-media": {
        "code": "docs-media",
        "type": "DOCUMENTATION_BUNDLE",
        "enabled": true,
        "owner": "media",
        "applicationCode": "axis",
        "siteCode": "nodicsDocumentationSite",
        "baselineCode": "docs-media",
        "contentPackCode": "mediaDocumentation",
        "presentation": {
          "title": "media Documentation",
          "kind": "DOCUMENTATION",
          "category": "documentation",
          "order": 357,
          "summary": "Optional media articles with the shared documentation foundation. Publication uses the shared framework documentation site.",
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
        }
      },
      "docs-wcms": {
        "code": "docs-wcms",
        "type": "DOCUMENTATION_BUNDLE",
        "enabled": true,
        "owner": "wcms",
        "applicationCode": "axis",
        "siteCode": "nodicsDocumentationSite",
        "baselineCode": "docs-wcms",
        "contentPackCode": "wcmsDocumentation",
        "presentation": {
          "title": "wcms Documentation",
          "kind": "DOCUMENTATION",
          "category": "documentation",
          "order": 358,
          "summary": "Optional wcms articles with the shared documentation foundation. Publication uses the shared framework documentation site.",
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
        }
      },
      "docs-copilotprovider": {
        "code": "docs-copilotprovider",
        "type": "DOCUMENTATION_BUNDLE",
        "enabled": true,
        "owner": "copilotProvider",
        "applicationCode": "axis",
        "siteCode": "nodicsDocumentationSite",
        "baselineCode": "docs-copilotprovider",
        "contentPackCode": "copilotProviderDocumentation",
        "presentation": {
          "title": "copilotProvider Documentation",
          "kind": "DOCUMENTATION",
          "category": "documentation",
          "order": 359,
          "summary": "Optional copilotProvider articles with the shared documentation foundation. Publication uses the shared framework documentation site.",
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
        }
      },
      "docs-copilotevaluation": {
        "code": "docs-copilotevaluation",
        "type": "DOCUMENTATION_BUNDLE",
        "enabled": true,
        "owner": "copilotEvaluation",
        "applicationCode": "axis",
        "siteCode": "nodicsDocumentationSite",
        "baselineCode": "docs-copilotevaluation",
        "contentPackCode": "copilotEvaluationDocumentation",
        "presentation": {
          "title": "copilotEvaluation Documentation",
          "kind": "DOCUMENTATION",
          "category": "documentation",
          "order": 360,
          "summary": "Optional copilotEvaluation articles with the shared documentation foundation. Publication uses the shared framework documentation site.",
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
        }
      },
      "docs-rulesevaluation": {
        "code": "docs-rulesevaluation",
        "type": "DOCUMENTATION_BUNDLE",
        "enabled": true,
        "owner": "rulesEvaluation",
        "applicationCode": "axis",
        "siteCode": "nodicsDocumentationSite",
        "baselineCode": "docs-rulesevaluation",
        "contentPackCode": "rulesEvaluationDocumentation",
        "presentation": {
          "title": "rulesEvaluation Documentation",
          "kind": "DOCUMENTATION",
          "category": "documentation",
          "order": 361,
          "summary": "Optional rulesEvaluation articles with the shared documentation foundation. Publication uses the shared framework documentation site.",
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
        }
      },
      "docs-wastematerial": {
        "code": "docs-wastematerial",
        "type": "DOCUMENTATION_BUNDLE",
        "enabled": true,
        "owner": "wasteMaterial",
        "applicationCode": "axis",
        "siteCode": "nodicsDocumentationSite",
        "baselineCode": "docs-wastematerial",
        "contentPackCode": "wasteMaterialDocumentation",
        "presentation": {
          "title": "wasteMaterial Documentation",
          "kind": "DOCUMENTATION",
          "category": "documentation",
          "order": 362,
          "summary": "Optional wasteMaterial articles with the shared documentation foundation. Publication uses the shared framework documentation site.",
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
        }
      },
      "docs-locationapproval": {
        "code": "docs-locationapproval",
        "type": "DOCUMENTATION_BUNDLE",
        "enabled": true,
        "owner": "locationApproval",
        "applicationCode": "axis",
        "siteCode": "nodicsDocumentationSite",
        "baselineCode": "docs-locationapproval",
        "contentPackCode": "locationApprovalDocumentation",
        "presentation": {
          "title": "locationApproval Documentation",
          "kind": "DOCUMENTATION",
          "category": "documentation",
          "order": 363,
          "summary": "Optional locationApproval articles with the shared documentation foundation. Publication uses the shared framework documentation site.",
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
        }
      },
      "docs-locationdraft": {
        "code": "docs-locationdraft",
        "type": "DOCUMENTATION_BUNDLE",
        "enabled": true,
        "owner": "locationDraft",
        "applicationCode": "axis",
        "siteCode": "nodicsDocumentationSite",
        "baselineCode": "docs-locationdraft",
        "contentPackCode": "locationDraftDocumentation",
        "presentation": {
          "title": "locationDraft Documentation",
          "kind": "DOCUMENTATION",
          "category": "documentation",
          "order": 364,
          "summary": "Optional locationDraft articles with the shared documentation foundation. Publication uses the shared framework documentation site.",
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
        }
      },
      "docs-locationprojection": {
        "code": "docs-locationprojection",
        "type": "DOCUMENTATION_BUNDLE",
        "enabled": true,
        "owner": "locationProjection",
        "applicationCode": "axis",
        "siteCode": "nodicsDocumentationSite",
        "baselineCode": "docs-locationprojection",
        "contentPackCode": "locationProjectionDocumentation",
        "presentation": {
          "title": "locationProjection Documentation",
          "kind": "DOCUMENTATION",
          "category": "documentation",
          "order": 365,
          "summary": "Optional locationProjection articles with the shared documentation foundation. Publication uses the shared framework documentation site.",
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
        }
      },
      "docs-locationsearch": {
        "code": "docs-locationsearch",
        "type": "DOCUMENTATION_BUNDLE",
        "enabled": true,
        "owner": "locationSearch",
        "applicationCode": "axis",
        "siteCode": "nodicsDocumentationSite",
        "baselineCode": "docs-locationsearch",
        "contentPackCode": "locationSearchDocumentation",
        "presentation": {
          "title": "locationSearch Documentation",
          "kind": "DOCUMENTATION",
          "category": "documentation",
          "order": 366,
          "summary": "Optional locationSearch articles with the shared documentation foundation. Publication uses the shared framework documentation site.",
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
        }
      },
      "docs-locationtype": {
        "code": "docs-locationtype",
        "type": "DOCUMENTATION_BUNDLE",
        "enabled": true,
        "owner": "locationType",
        "applicationCode": "axis",
        "siteCode": "nodicsDocumentationSite",
        "baselineCode": "docs-locationtype",
        "contentPackCode": "locationTypeDocumentation",
        "presentation": {
          "title": "locationType Documentation",
          "kind": "DOCUMENTATION",
          "category": "documentation",
          "order": 367,
          "summary": "Optional locationType articles with the shared documentation foundation. Publication uses the shared framework documentation site.",
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
        }
      },
      "docs-locationmap": {
        "code": "docs-locationmap",
        "type": "DOCUMENTATION_BUNDLE",
        "enabled": true,
        "owner": "locationMap",
        "applicationCode": "axis",
        "siteCode": "nodicsDocumentationSite",
        "baselineCode": "docs-locationmap",
        "contentPackCode": "locationMapDocumentation",
        "presentation": {
          "title": "locationMap Documentation",
          "kind": "DOCUMENTATION",
          "category": "documentation",
          "order": 368,
          "summary": "Optional locationMap articles with the shared documentation foundation. Publication uses the shared framework documentation site.",
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
        }
      },
      "docs-wcmsexperience": {
        "code": "docs-wcmsexperience",
        "type": "DOCUMENTATION_BUNDLE",
        "enabled": true,
        "owner": "wcmsExperience",
        "applicationCode": "axis",
        "siteCode": "nodicsDocumentationSite",
        "baselineCode": "docs-wcmsexperience",
        "contentPackCode": "wcmsExperienceDocumentation",
        "presentation": {
          "title": "wcmsExperience Documentation",
          "kind": "DOCUMENTATION",
          "category": "documentation",
          "order": 369,
          "summary": "Optional wcmsExperience articles with the shared documentation foundation. Publication uses the shared framework documentation site.",
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
        }
      },
      "docs-rediscache": {
        "code": "docs-rediscache",
        "type": "DOCUMENTATION_BUNDLE",
        "enabled": true,
        "owner": "redisCache",
        "applicationCode": "axis",
        "siteCode": "nodicsDocumentationSite",
        "baselineCode": "docs-rediscache",
        "contentPackCode": "redisCacheDocumentation",
        "presentation": {
          "title": "redisCache Documentation",
          "kind": "DOCUMENTATION",
          "category": "documentation",
          "order": 370,
          "summary": "Optional redisCache articles with the shared documentation foundation. Publication uses the shared framework documentation site.",
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
        }
      },
      "docs-foundation": {
        "code": "docs-foundation",
        "type": "DOCUMENTATION_BUNDLE",
        "enabled": true,
        "owner": "nodics.docs",
        "applicationCode": "axis",
        "siteCode": "nodicsDocumentationSite",
        "baselineCode": "docs-foundation",
        "contentPackCode": "nodicsDocumentationFoundation",
        "presentation": {
          "title": "nodics.docs Documentation",
          "kind": "DOCUMENTATION",
          "category": "documentation",
          "order": 371,
          "summary": "Optional nodics.docs articles with the shared documentation foundation. Publication uses the shared framework documentation site.",
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
        }
      },
      "circadocs": {
        "code": "circadocs",
        "type": "DOCUMENTATION_BUNDLE",
        "enabled": true,
        "owner": "eWaste",
        "applicationCode": "axis",
        "siteCode": "circaDocumentationSite",
        "baselineCode": "circadocs",
        "contentPackCode": "circaDocumentation",
        "presentation": {
          "title": "Circa Accelerator Guides",
          "kind": "DOCUMENTATION",
          "category": "documentation",
          "order": 372,
          "summary": "Optional canonical eWaste accelerator reference guides on their own documentation Site; shared capabilities are referenced, not imported.",
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
        }
      }
    }
  },
  "cms": {
    "publication": {
      "baselines": {
        "docs-apparelproduct": {
          "contentPackCode": "apparelProductDocumentation",
          "releaseVersion": "0.0.1",
          "rootType": "site",
          "rootCode": "nodicsDocumentationSite",
          "sourceVersion": "0"
        },
        "docs-domaincommercecore": {
          "contentPackCode": "domainCommerceCoreDocumentation",
          "releaseVersion": "0.0.1",
          "rootType": "site",
          "rootCode": "nodicsDocumentationSite",
          "sourceVersion": "0"
        },
        "docs-electronicsproduct": {
          "contentPackCode": "electronicsProductDocumentation",
          "releaseVersion": "0.0.1",
          "rootType": "site",
          "rootCode": "nodicsDocumentationSite",
          "sourceVersion": "0"
        },
        "docs-nexus-web": {
          "contentPackCode": "nexus_webDocumentation",
          "releaseVersion": "0.0.1",
          "rootType": "site",
          "rootCode": "nodicsDocumentationSite",
          "sourceVersion": "0"
        },
        "docs-telcosubscription": {
          "contentPackCode": "telcoSubscriptionDocumentation",
          "releaseVersion": "0.0.1",
          "rootType": "site",
          "rootCode": "nodicsDocumentationSite",
          "sourceVersion": "0"
        },
        "docs-ewaste": {
          "contentPackCode": "eWasteDocumentation",
          "releaseVersion": "0.0.5",
          "rootType": "site",
          "rootCode": "nodicsDocumentationSite",
          "sourceVersion": "0"
        },
        "docs-commercesearchcore": {
          "contentPackCode": "commerceSearchCoreDocumentation",
          "releaseVersion": "0.0.1",
          "rootType": "site",
          "rootCode": "nodicsDocumentationSite",
          "sourceVersion": "0"
        },
        "docs-promotion": {
          "contentPackCode": "promotionDocumentation",
          "releaseVersion": "0.0.1",
          "rootType": "site",
          "rootCode": "nodicsDocumentationSite",
          "sourceVersion": "0"
        },
        "docs-cart": {
          "contentPackCode": "cartDocumentation",
          "releaseVersion": "0.0.1",
          "rootType": "site",
          "rootCode": "nodicsDocumentationSite",
          "sourceVersion": "0"
        },
        "docs-digitalcore": {
          "contentPackCode": "digitalCoreDocumentation",
          "releaseVersion": "0.0.1",
          "rootType": "site",
          "rootCode": "nodicsDocumentationSite",
          "sourceVersion": "0"
        },
        "docs-inventory": {
          "contentPackCode": "inventoryDocumentation",
          "releaseVersion": "0.0.1",
          "rootType": "site",
          "rootCode": "nodicsDocumentationSite",
          "sourceVersion": "0"
        },
        "docs-pricing": {
          "contentPackCode": "pricingDocumentation",
          "releaseVersion": "0.0.1",
          "rootType": "site",
          "rootCode": "nodicsDocumentationSite",
          "sourceVersion": "0"
        },
        "docs-product": {
          "contentPackCode": "productDocumentation",
          "releaseVersion": "0.0.1",
          "rootType": "site",
          "rootCode": "nodicsDocumentationSite",
          "sourceVersion": "0"
        },
        "docs-shoppinglist": {
          "contentPackCode": "shoppingListDocumentation",
          "releaseVersion": "0.0.1",
          "rootType": "site",
          "rootCode": "nodicsDocumentationSite",
          "sourceVersion": "0"
        },
        "docs-checkoutcore": {
          "contentPackCode": "checkoutCoreDocumentation",
          "releaseVersion": "0.0.1",
          "rootType": "site",
          "rootCode": "nodicsDocumentationSite",
          "sourceVersion": "0"
        },
        "docs-order": {
          "contentPackCode": "orderDocumentation",
          "releaseVersion": "0.0.1",
          "rootType": "site",
          "rootCode": "nodicsDocumentationSite",
          "sourceVersion": "0"
        },
        "docs-fulfillmentcore": {
          "contentPackCode": "fulfillmentCoreDocumentation",
          "releaseVersion": "0.0.1",
          "rootType": "site",
          "rootCode": "nodicsDocumentationSite",
          "sourceVersion": "0"
        },
        "docs-paymentcore": {
          "contentPackCode": "paymentCoreDocumentation",
          "releaseVersion": "0.0.1",
          "rootType": "site",
          "rootCode": "nodicsDocumentationSite",
          "sourceVersion": "0"
        },
        "docs-commscore": {
          "contentPackCode": "commsCoreDocumentation",
          "releaseVersion": "0.0.1",
          "rootType": "site",
          "rootCode": "nodicsDocumentationSite",
          "sourceVersion": "0"
        },
        "docs-copilotcapability": {
          "contentPackCode": "copilotCapabilityDocumentation",
          "releaseVersion": "0.0.1",
          "rootType": "site",
          "rootCode": "nodicsDocumentationSite",
          "sourceVersion": "0"
        },
        "docs-copilotconversation": {
          "contentPackCode": "copilotConversationDocumentation",
          "releaseVersion": "0.0.1",
          "rootType": "site",
          "rootCode": "nodicsDocumentationSite",
          "sourceVersion": "0"
        },
        "docs-copilotknowledge": {
          "contentPackCode": "copilotKnowledgeDocumentation",
          "releaseVersion": "0.0.1",
          "rootType": "site",
          "rootCode": "nodicsDocumentationSite",
          "sourceVersion": "0"
        },
        "docs-copilotworkbench": {
          "contentPackCode": "copilotWorkbenchDocumentation",
          "releaseVersion": "0.0.1",
          "rootType": "site",
          "rootCode": "nodicsDocumentationSite",
          "sourceVersion": "0"
        },
        "docs-discoveryruntime": {
          "contentPackCode": "discoveryRuntimeDocumentation",
          "releaseVersion": "0.0.1",
          "rootType": "site",
          "rootCode": "nodicsDocumentationSite",
          "sourceVersion": "0"
        },
        "docs-contactsubmission": {
          "contentPackCode": "contactSubmissionDocumentation",
          "releaseVersion": "0.0.1",
          "rootType": "site",
          "rootCode": "nodicsDocumentationSite",
          "sourceVersion": "0"
        },
        "docs-customerfeedback": {
          "contentPackCode": "customerFeedbackDocumentation",
          "releaseVersion": "0.0.1",
          "rootType": "site",
          "rootCode": "nodicsDocumentationSite",
          "sourceVersion": "0"
        },
        "docs-customerreview": {
          "contentPackCode": "customerReviewDocumentation",
          "releaseVersion": "0.0.1",
          "rootType": "site",
          "rootCode": "nodicsDocumentationSite",
          "sourceVersion": "0"
        },
        "docs-engagementcore": {
          "contentPackCode": "engagementCoreDocumentation",
          "releaseVersion": "0.0.1",
          "rootType": "site",
          "rootCode": "nodicsDocumentationSite",
          "sourceVersion": "0"
        },
        "docs-cache": {
          "contentPackCode": "cacheDocumentation",
          "releaseVersion": "0.0.1",
          "rootType": "site",
          "rootCode": "nodicsDocumentationSite",
          "sourceVersion": "0"
        },
        "docs-ncommon": {
          "contentPackCode": "nCommonDocumentation",
          "releaseVersion": "0.0.1",
          "rootType": "site",
          "rootCode": "nodicsDocumentationSite",
          "sourceVersion": "0"
        },
        "docs-config": {
          "contentPackCode": "configDocumentation",
          "releaseVersion": "0.0.1",
          "rootType": "site",
          "rootCode": "nodicsDocumentationSite",
          "sourceVersion": "0"
        },
        "docs-import": {
          "contentPackCode": "importDocumentation",
          "releaseVersion": "0.0.1",
          "rootType": "site",
          "rootCode": "nodicsDocumentationSite",
          "sourceVersion": "0"
        },
        "docs-database": {
          "contentPackCode": "databaseDocumentation",
          "releaseVersion": "0.0.1",
          "rootType": "site",
          "rootCode": "nodicsDocumentationSite",
          "sourceVersion": "0"
        },
        "docs-emsclient": {
          "contentPackCode": "emsClientDocumentation",
          "releaseVersion": "0.0.1",
          "rootType": "site",
          "rootCode": "nodicsDocumentationSite",
          "sourceVersion": "0"
        },
        "docs-nms": {
          "contentPackCode": "nmsDocumentation",
          "releaseVersion": "0.0.1",
          "rootType": "site",
          "rootCode": "nodicsDocumentationSite",
          "sourceVersion": "0"
        },
        "docs-otp": {
          "contentPackCode": "otpDocumentation",
          "releaseVersion": "0.0.1",
          "rootType": "site",
          "rootCode": "nodicsDocumentationSite",
          "sourceVersion": "0"
        },
        "docs-pipeline": {
          "contentPackCode": "pipelineDocumentation",
          "releaseVersion": "0.0.1",
          "rootType": "site",
          "rootCode": "nodicsDocumentationSite",
          "sourceVersion": "0"
        },
        "docs-router": {
          "contentPackCode": "routerDocumentation",
          "releaseVersion": "0.0.1",
          "rootType": "site",
          "rootCode": "nodicsDocumentationSite",
          "sourceVersion": "0"
        },
        "docs-nservice": {
          "contentPackCode": "nServiceDocumentation",
          "releaseVersion": "0.0.1",
          "rootType": "site",
          "rootCode": "nodicsDocumentationSite",
          "sourceVersion": "0"
        },
        "docs-ntooling": {
          "contentPackCode": "nToolingDocumentation",
          "releaseVersion": "0.0.1",
          "rootType": "site",
          "rootCode": "nodicsDocumentationSite",
          "sourceVersion": "0"
        },
        "docs-bpm": {
          "contentPackCode": "bpmDocumentation",
          "releaseVersion": "0.0.1",
          "rootType": "site",
          "rootCode": "nodicsDocumentationSite",
          "sourceVersion": "0"
        },
        "docs-localizationcore": {
          "contentPackCode": "localizationCoreDocumentation",
          "releaseVersion": "0.0.1",
          "rootType": "site",
          "rootCode": "nodicsDocumentationSite",
          "sourceVersion": "0"
        },
        "docs-loyaltywallet": {
          "contentPackCode": "loyaltyWalletDocumentation",
          "releaseVersion": "0.0.1",
          "rootType": "site",
          "rootCode": "nodicsDocumentationSite",
          "sourceVersion": "0"
        },
        "docs-backoffice": {
          "contentPackCode": "backofficeDocumentation",
          "releaseVersion": "0.0.2",
          "rootType": "site",
          "rootCode": "nodicsDocumentationSite",
          "sourceVersion": "0"
        },
        "docs-installer": {
          "contentPackCode": "installerDocumentation",
          "releaseVersion": "0.0.1",
          "rootType": "site",
          "rootCode": "nodicsDocumentationSite",
          "sourceVersion": "0"
        },
        "docs-profile": {
          "contentPackCode": "profileDocumentation",
          "releaseVersion": "0.0.1",
          "rootType": "site",
          "rootCode": "nodicsDocumentationSite",
          "sourceVersion": "0"
        },
        "docs-cronjob": {
          "contentPackCode": "cronjobDocumentation",
          "releaseVersion": "0.0.1",
          "rootType": "site",
          "rootCode": "nodicsDocumentationSite",
          "sourceVersion": "0"
        },
        "docs-workflow": {
          "contentPackCode": "workflowDocumentation",
          "releaseVersion": "0.0.1",
          "rootType": "site",
          "rootCode": "nodicsDocumentationSite",
          "sourceVersion": "0"
        },
        "docs-wasteimpact": {
          "contentPackCode": "wasteImpactDocumentation",
          "releaseVersion": "0.0.1",
          "rootType": "site",
          "rootCode": "nodicsDocumentationSite",
          "sourceVersion": "0"
        },
        "docs-cms": {
          "contentPackCode": "cmsDocumentation",
          "releaseVersion": "0.0.1",
          "rootType": "site",
          "rootCode": "nodicsDocumentationSite",
          "sourceVersion": "0"
        },
        "docs-media": {
          "contentPackCode": "mediaDocumentation",
          "releaseVersion": "0.0.1",
          "rootType": "site",
          "rootCode": "nodicsDocumentationSite",
          "sourceVersion": "0"
        },
        "docs-wcms": {
          "contentPackCode": "wcmsDocumentation",
          "releaseVersion": "0.0.1",
          "rootType": "site",
          "rootCode": "nodicsDocumentationSite",
          "sourceVersion": "0"
        },
        "docs-copilotprovider": {
          "contentPackCode": "copilotProviderDocumentation",
          "releaseVersion": "0.0.1",
          "rootType": "site",
          "rootCode": "nodicsDocumentationSite",
          "sourceVersion": "0"
        },
        "docs-copilotevaluation": {
          "contentPackCode": "copilotEvaluationDocumentation",
          "releaseVersion": "0.0.1",
          "rootType": "site",
          "rootCode": "nodicsDocumentationSite",
          "sourceVersion": "0"
        },
        "docs-rulesevaluation": {
          "contentPackCode": "rulesEvaluationDocumentation",
          "releaseVersion": "0.0.1",
          "rootType": "site",
          "rootCode": "nodicsDocumentationSite",
          "sourceVersion": "0"
        },
        "docs-wastematerial": {
          "contentPackCode": "wasteMaterialDocumentation",
          "releaseVersion": "0.0.1",
          "rootType": "site",
          "rootCode": "nodicsDocumentationSite",
          "sourceVersion": "0"
        },
        "docs-locationapproval": {
          "contentPackCode": "locationApprovalDocumentation",
          "releaseVersion": "0.0.1",
          "rootType": "site",
          "rootCode": "nodicsDocumentationSite",
          "sourceVersion": "0"
        },
        "docs-locationdraft": {
          "contentPackCode": "locationDraftDocumentation",
          "releaseVersion": "0.0.1",
          "rootType": "site",
          "rootCode": "nodicsDocumentationSite",
          "sourceVersion": "0"
        },
        "docs-locationprojection": {
          "contentPackCode": "locationProjectionDocumentation",
          "releaseVersion": "0.0.1",
          "rootType": "site",
          "rootCode": "nodicsDocumentationSite",
          "sourceVersion": "0"
        },
        "docs-locationsearch": {
          "contentPackCode": "locationSearchDocumentation",
          "releaseVersion": "0.0.1",
          "rootType": "site",
          "rootCode": "nodicsDocumentationSite",
          "sourceVersion": "0"
        },
        "docs-locationtype": {
          "contentPackCode": "locationTypeDocumentation",
          "releaseVersion": "0.0.1",
          "rootType": "site",
          "rootCode": "nodicsDocumentationSite",
          "sourceVersion": "0"
        },
        "docs-locationmap": {
          "contentPackCode": "locationMapDocumentation",
          "releaseVersion": "0.0.1",
          "rootType": "site",
          "rootCode": "nodicsDocumentationSite",
          "sourceVersion": "0"
        },
        "docs-wcmsexperience": {
          "contentPackCode": "wcmsExperienceDocumentation",
          "releaseVersion": "0.0.1",
          "rootType": "site",
          "rootCode": "nodicsDocumentationSite",
          "sourceVersion": "0"
        },
        "docs-rediscache": {
          "contentPackCode": "redisCacheDocumentation",
          "releaseVersion": "0.0.1",
          "rootType": "site",
          "rootCode": "nodicsDocumentationSite",
          "sourceVersion": "0"
        },
        "docs-foundation": {
          "contentPackCode": "nodicsDocumentationFoundation",
          "releaseVersion": "0.0.1",
          "rootType": "site",
          "rootCode": "nodicsDocumentationSite",
          "sourceVersion": "0"
        },
        "circadocs": {
          "contentPackCode": "circaDocumentation",
          "releaseVersion": "0.0.2",
          "rootType": "site",
          "rootCode": "circaDocumentationSite",
          "sourceVersion": "0"
        }
      }
    }
  }
};
