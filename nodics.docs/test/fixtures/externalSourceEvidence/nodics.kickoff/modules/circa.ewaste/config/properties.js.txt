/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";

/** @module circa.ewaste/config/properties @description Declares Circa demo identity, presentation, fixtures and inert data-pack composition over framework owners. @layer config @owner circa.ewaste @override Customer projects replace sample data selections and branding. */
module.exports = {
  locationMapConfiguration: {
    applicationOverrides: {
      CIRCA: {
        COLLECTION_CENTRE_MAP: {
          defaultCenterLatitude: 25.2048,
          defaultCenterLongitude: 55.2708,
          defaultZoom: 9,
        },
      },
    },
  },
  tooling: {
    acceptance: {
      circaLoyaltyRewardCheckout: {
        customerCode: "circa-customer",
        walletCode: "WALLET_ED16C8FCF19E1FE586E3DA5D",
        productCode: "CIRCA_COUPON_CPN-GRN-30",
        variantCode: "CIRCA_COUPON_CPN-GRN-30_VARIANT",
        programCode: "circa",
        rewardTypeCode: "points",
        rewardCurrency: "POINTS",
        providerCode: "loyalty-reward-points",
        rewardScale: 2,
        maximumRewardAmount: "14.00",
        cart: {
          storeCode: "circaMainStore",
          channelCode: "web",
          locale: "en",
          jurisdiction: "CIRCA_SAMPLE",
          currency: "POINTS",
        },
      },
      circaCommercePublication: {
        catalogs: [
          {
            catalogVersion: "circaStaged",
            storeCode: "circaMainStore",
            locale: "en",
            productCodes: [
              "CIRCA_ASSET_EWA-1047",
              "CIRCA_ASSET_EWA-1051",
              "CIRCA_ASSET_EWA-1052",
              "CIRCA_ASSET_EWA-1055",
              "CIRCA_ASSET_EWA-1092",
              "CIRCA_COUPON_CPN-GRN-30",
              "CIRCA_COUPON_CPN-ECO-15",
              "CIRCA_COUPON_CPN-SVC-50",
              "CIRCA_COUPON_GP-C01",
              "CIRCA_COUPON_GP-C02",
              "CIRCA_COUPON_GP-C03",
              "CIRCA_COUPON_GP-C04",
              "CIRCA_COUPON_GP-C05",
              "CIRCA_COUPON_GP-C06",
              "CIRCA_COUPON_GP-C07",
              "CIRCA_COUPON_GP-C08",
              "CIRCA_COUPON_GP-C09",
              "CIRCA_COUPON_GP-C10",
              "CIRCA_COUPON_GP-C11",
              "CIRCA_COUPON_GP-C12",
              "CIRCA_COUPON_GP-B01",
              "CIRCA_COUPON_GP-B02",
              "CIRCA_COUPON_GP-B03",
              "CIRCA_COUPON_GP-B04",
              "CIRCA_COUPON_GP-B05",
              "CIRCA_COUPON_GP-B06",
              "CIRCA_COUPON_GP-B07",
              "CIRCA_COUPON_GP-B08",
              "CIRCA_COUPON_GP-B09",
              "CIRCA_COUPON_GP-B10",
              "CIRCA_COUPON_GP-B11",
              "CIRCA_COUPON_GP-B12",
              "CIRCA_COUPON_GP-A01",
              "CIRCA_COUPON_GP-A02",
              "CIRCA_COUPON_GP-A03",
              "CIRCA_COUPON_GP-A04",
              "CIRCA_COUPON_GP-A05",
              "CIRCA_COUPON_GP-A06",
              "CIRCA_COUPON_GP-A07",
              "CIRCA_COUPON_GP-A08",
              "CIRCA_COUPON_GP-A09",
              "CIRCA_COUPON_GP-A10",
              "CIRCA_COUPON_GP-A11",
            ],
            mediaModules: ["circa.ewaste"],
          },
        ],
      },
      wasteManagement: {
        fixture: {
          dataModule: "circa.ewaste",
          ruleRecordsPath:
            "data/sample-v001/waste-policy/records/eWasteAcceptanceRuleData.js",
          impactProfileRecordsPath:
            "data/sample-v001/waste-policy/records/eWasteImpactProfileData.js",
          impactProfileCode: "CIRCA_VERIFIED_DEVICE_RECOVERY",
          runId: "circa-waste-acceptance-001",
          submissionCode: "CIRCA_ACCEPTANCE_SUB_001",
          resultCode: "CIRCA_ACCEPTANCE_IMPACT_001",
          requiresReceipt: true,
          collectionPoint: {
            code: "CIRCA_ACCEPTANCE_CP_001",
            collectionPointType: "E_WASTE_DROP_OFF",
          },
          facts: {
            familyCode: "ELECTRONICS",
            categoryCode: "SMART_HOME_DEVICE",
            itemTypeCode: "UNKNOWN_ELECTRONIC_ITEM",
            materialTypeCodes: ["CIRCUIT_BOARD", "COPPER", "PLASTIC_CASING"],
            conditionGrade: "RECYCLABLE",
            quantity: 2,
            weight: "3.5",
          },
          expectedMetrics: [
            {
              metricCode: "EWASTE_WEIGHT_KG",
              value: "3.5",
            },
            {
              metricCode: "RECOVERABLE_MATERIAL_ESTIMATE_KG",
              value: "2.52",
            },
          ],
        },
      },
    },
  },
  data: {
    dataReleases: {
      initializationProfileDefaults: {
        circaIdentityAuthority: {
          enabled: true,
          label: "Circa identity authority",
          description:
            "Fresh Circa installations require this explicit role-definition prerequisite before demo setup. Existing demo installations are not replayed.",
          completionMessage:
            "Circa role definitions are installed. Staff assignments remain separate governed actions.",
          steps: {
            $config: "replace",
            value: [
              {
                dataType: "init",
                releaseCodes: [
                  "profile:enterpriseRoles",
                  "cms:accessGroups",
                  "cms:enterpriseRoles",
                  "cms:businessAccessRoles",
                  "store:accessGroups",
                  "product:enterpriseRoles",
                  "product:businessAccessRoles",
                  "promotion:enterpriseRoles",
                  "promotion:businessAccessRoles",
                  "order:enterpriseRoles",
                  "order:businessAccessRoles",
                  "digitalCore:enterpriseRoles",
                  "wasteCore:enterpriseRoles",
                  "wasteCore:businessAccessRoles",
                  "digitalCore:bundleParticipantPermissions",
                  "digitalCore:participantAccessGroups",
                  "loyaltyWallet:participantAccessGroups",
                  "loyaltyWallet:specialAccessGroups",
                  "loyaltyWallet:specialAccessRoles",
                  "wasteCarbon:participantAccessGroups",
                  "wasteReward:participantAccessGroups",
                  "import:specialAccessGroups",
                  "import:specialAccessRoles",
                  "inventory:specialAccessGroups",
                  "inventory:specialAccessRoles",
                  "order:specialAccessGroups",
                  "order:specialAccessRoles",
                ],
              },
            ],
          },
        },
        localWasteFoundation: {
          enabled: true,
          label: "Waste foundation",
          description:
            "Install Waste Management reference releases for schema-driven family, category, material, collection, evidence, receipt, and impact presets.",
          completionMessage:
            "The Waste foundation is ready. Operators can validate collection eligibility, submissions, evidence, receipts, and impact calculations.",
          steps: {
            $config: "replace",
            value: [
              {
                dataType: "core",
                releaseCodes: [
                  "wasteMaterial:core-v001",
                  "eWaste:core-reference",
                ],
              },
              {
                dataType: "sample",
                releaseCodes: ["circa.ewaste:waste-policy"],
              },
            ],
          },
        },
      },
    },
  },
  cms: {
    publication: {
      baselines: {
        circa: {
          releaseCode: "circa.ewaste:content",
          releaseVersion: "0.0.2",
          dataType: "sample",
          rootType: "site",
          rootCode: "circaSite",
          sourceVersion: "0",
        },
      },
    },
  },
  backofficeApplicationInitialization: {
    profiles: {
      circa: {
        code: "circa",
        type: "STOREFRONT_DOMAIN_BUNDLE",
        owner: "circa.ewaste",
        applicationCode: "CIRCA_EWASTE",
        siteCode: "circaSite",
        baselineCode: "circa",
        presentation: {
          title: "Circa eWaste",
          visual: {
            mediaCode: "circa-hero-circular-value",
            alt: "Circa circular value",
          },
          kind: "PROJECT",
          category: "application",
          order: 240,
          summary:
            "Circa customer demo with enterprises, collection centres, assets, rewards and partner offers.",
          requiredFunctionalModules: [
            {
              code: "nodics.location",
              label: "Location capability",
            },
            {
              code: "nodics.waste",
              label: "Waste Management capability",
            },
            {
              code: "nodics.loyalty",
              label: "Loyalty capability",
            },
            {
              code: "nodics.commerce",
              label: "Commerce capability",
            },
          ],
          activationPolicy: {
            approvalRequiredForOnline: true,
            requiredDataTrigger: "USER",
            sampleDataTrigger: "USER",
          },
        },
      },
    },
  },
  eWaste: {
    application: {
      code: "CIRCA_EWASTE",
      displayName: "Nodics Circa eWaste",
      frontendModuleName: "nodics.circa.eWaste",
      projectModuleName: "circa.ewaste",
      visual: {
        mediaCode: "circa-hero-circular-value",
        alt: "Circa circular value",
      },
      requiredScenarioModules: ["eWaste", "wasteRecycling"],
    },
    applicationCode: "CIRCA_EWASTE",
    presentation: {
      brandName: "Circa",
      brandByline: "by Nodics",
      sampleMode: true,
      walletLabels: {
        points: "Reward points",
        circaCarbon: "Carbon units",
      },
    },
  },
};
