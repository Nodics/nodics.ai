/**
 * @module kickoffLocal/platformServer/config/properties
 * @description Declares Local Platform composition and prerequisites for explicitly selected publication providers.
 * @layer config
 * @owner nodics.kickoff
 * @override Later deployment layers may narrow application selections without replacing framework preparation or owner authorization.
 */
const circaDataPackages = require("../../../../config/circa-setup-data-packages.json");
const renewedPromotionPackages = new Map([
  ["circa.ewaste:circaGreenPerksBudget", "circa.ewaste:circaGreenPerksL08Budget"],
  ["circa.ewaste:circaGreenPerksIssuance", "circa.ewaste:circaGreenPerksL08Issuance"],
  ["circa.ewaste:circaRenewWorksBudget", "circa.ewaste:circaRenewWorksL08Budget"],
  ["circa.ewaste:circaRenewWorksIssuance", "circa.ewaste:circaRenewWorksL08Issuance"],
  ["circa.ewaste:circaLoopCycleBudget", "circa.ewaste:circaLoopCycleL08Budget"],
  ["circa.ewaste:circaLoopCycleIssuance", "circa.ewaste:circaLoopCycleL08Issuance"],
]);

const circaNative = require("../../config/circaRuntimeOverrides.json");

module.exports = {
  // Native Platform members share leases; the standalone Framework default remains memory.
  backofficeRegistry: { store: { mode: "distributed", keyPrefix: "kickoffLocal:registry:lease:" } },
  // Explicit Local recording selection only; journal mechanics and false defaults belong to nDatabase/Profile.
  commandReceipts: {
    enabled: { $config: "env", name: "NODICS_LOCAL_PROFILE_COMMAND_RECEIPTS_ENABLED", type: "boolean" },
    owners: {
      profile: { $config: "env", name: "NODICS_LOCAL_PROFILE_COMMAND_RECEIPTS_ENABLED", type: "boolean" },
    },
  },
  installer: {
    applicationBuilder: {
      buildExecution: {
        enabled: true,
        experienceRoot: { $config: "env", name: "NODICS_LOCAL_BUILDER_EXPERIENCE_ROOT", type: "string" },
        frontendCode: "agoraApparel",
        allowedPresets: ["apparel"],
      },
      workspace: {
        allowedRoots: [{ $config: "path", base: "project", relative: "." }],
      },
    },
  },
  backofficeFunctionalModuleActivationData: {
    modules: {
      "nodics.loyalty": {
        dataPackages: {
          $config: "keyed",
          key: "code",
          entries: [
            {
              code: "loyaltyProgram:partnerEligibilityAdministrationPermission",
              targetServer: "platformServer",
            },
          ],
        },
      },
      "nodics.commerce": {
        dataPackages: {
          $config: "keyed",
          key: "code",
          entries: [
            { code: "digitalCore:couponReminderWorkflow", targetModule: "workflow", targetServer: "processServer" },
            { code: "digitalCore:couponReminderTrigger", targetModule: "workflow", targetServer: "processServer" },
            { code: "digitalCore:couponReminderSchedule", targetModule: "cronjob", targetServer: "processServer" },
          ],
        },
      },
    },
  },
  profileCouponNotifications: { enabled: true, allowInsecureLoopback: true },
  tooling: {
    acceptance: {
      circaLoyaltyRewardCheckout: {
        customer: {
          email: "customer@circa.local",
          firstName: "Circa",
          lastName: "Customer",
        },
        shippingAddress: {
          line1: "Local acceptance fixture",
          city: "Dubai",
          region: "Dubai",
          postalCode: "00000",
          country: "AE",
        },
      },
    },
  },
  profileRuntimeEnterpriseResolution: {
    enabled: true,
    callers: {
      $config: "replace",
      value: [
        {
          tenant: "default",
          principalEnterpriseCode: "default",
          serviceId: "apiAdmin",
          projectCode: "nodics.kickoff",
          environmentCode: "kickoffLocal",
          serverCode: "commerceServer",
          instanceCode: "kickoff-local-commerce-1",
          assignmentCode: "kickoff-local-commerce-runtime-deployment",
          enterpriseCodes: [
            "GREENPERKS_ONLINE",
            "GREENPERKS_RETAIL",
            "RENEWWORKS_REPAIR_REUSE",
            "LOOPCYCLE_RECYCLING",
          ],
        },
      ],
    },
  },
  profileCustomerEvidence: {
    enabled: true,
    callers: {
      $config: "replace",
      value: [
        {
          tenant: "default",
          principalEnterpriseCode: "default",
          enterpriseCode: "GREENPERKS_ONLINE",
          serviceId: "apiAdmin",
          projectCode: "nodics.kickoff",
          environmentCode: "kickoffLocal",
          serverCode: "wasteServer",
          instanceCode: "kickoff-local-waste-1",
          assignmentCode: "kickoff-local-waste-runtime-deployment",
        },
      ],
    },
  },
  publish: {
    setup: {
      observation: {
        enabled: true,
        profilePlans: { circa: "circa-native-reviewed" },
      },
    },
  },
  dynamoEnabled: true,
  runtimePropertyGovernance: {
    persistence: { enabled: true },
  },
  profileTenantProvisioning: {
    runtimeRemoteModuleExtensions: ["commsApi"],
  },
  identityGovernance: {
    migration: {
      // Review opt-in only; persisted Platform grants remain Profile-owned data.
      assessment: {
        bootstrapReview: {
          enabled: {
            $config: "env",
            name: "NODICS_LOCAL_BOOTSTRAP_IDENTITY_REVIEW_ENABLED",
            type: "boolean",
            fallback: false,
          },
        },
      },
    },
  },
  // Local capture-only selection; installed owner qualification remains separate.
  enterpriseManagement: {
    teamAdministration: {
      enabled: { $config: "env", name: "NODICS_LOCAL_INVITATION_WITHDRAWAL_ENABLED", type: "boolean" },
      serializedWritesQualified: { $config: "env", name: "NODICS_LOCAL_TEAM_SERIALIZATION_QUALIFIED", type: "boolean" },
      invitationWithdrawalQualified: { $config: "env", name: "NODICS_LOCAL_INVITATION_WITHDRAWAL_QUALIFIED", type: "boolean" },
    },
    setupContinuation: {
      inspectionQualified: {
        $config: "env",
        name: "NODICS_LOCAL_ENTERPRISE_SETUP_INSPECTION_QUALIFIED",
        type: "boolean",
        fallback: false,
      },
      privateGuardsQualified: {
        $config: "env",
        name: "NODICS_LOCAL_ENTERPRISE_SETUP_PRIVACY_QUALIFIED",
        type: "boolean",
        fallback: false,
      },
      resumeQualified: {
        $config: "env",
        name: "NODICS_LOCAL_ENTERPRISE_SETUP_RESUME_QUALIFIED",
        type: "boolean",
        fallback: false,
      },
    },
    registration: {
      inventoryQualified: {
        $config: "env",
        name: "NODICS_LOCAL_REGISTRATION_INVENTORY_QUALIFIED",
        type: "boolean",
        fallback: false,
      },
      assignmentClaimIndexQualified: {
        $config: "env",
        name: "NODICS_LOCAL_REGISTRATION_CLAIM_INDEX_QUALIFIED",
        type: "boolean",
        fallback: false,
      },
      enabled: {
        $config: "env",
        name: "NODICS_LOCAL_ENTERPRISE_ONBOARDING_ENABLED",
        type: "boolean",
        fallback: false,
      },
      mail: { allowInsecureLoopback: true },
    },
    accessAssignments: {
      registrationVerification: {
        enabled: {
          $config: "env",
          name: "NODICS_LOCAL_ENTERPRISE_ONBOARDING_ENABLED",
          type: "boolean",
          fallback: false,
        },
        allowInsecureLoopback: true,
      },
    },
  },
  profileEmployeeRecovery: {
    enabled: {
      $config: "env",
      name: "NODICS_LOCAL_EMPLOYEE_RECOVERY_ENABLED",
      type: "boolean",
      fallback: false,
    },
    inventoryQualified: {
      $config: "env",
      name: "NODICS_LOCAL_RECOVERY_INVENTORY_QUALIFIED",
      type: "boolean",
      fallback: false,
    },
    credentialWriteQualified: {
      $config: "env",
      name: "NODICS_LOCAL_RECOVERY_CREDENTIAL_WRITE_QUALIFIED",
      type: "boolean",
      fallback: false,
    },
    mail: { allowInsecureLoopback: true },
  },
  backofficeRegistration: {
    connectionName: "default",
  },
  backofficeApplicationInitialization: {
    dataReleaseTimeoutMs: 360000,
    operatorOrigin: "http://localhost:3100",
    profiles: {
      nexus: {
        dataPackages: {
          $config: "keyed",
          key: "code",
          entries: [{
            code: "nexus.web:nexusEngagementOperational",
            targetServer: "processServer",
            targetRuntimeRole: "PROCESS",
          }],
        },
      },
      circa: {
        // Only Native Local adopts the six reviewed operational selections.
        dataPackages: {
          $config: "replace",
          value: circaDataPackages.map((item) => renewedPromotionPackages.has(item.code)
            ? { ...item, code: renewedPromotionPackages.get(item.code) }
            : item),
        },
        preparation: {
          prerequisites: {
            $config: "replace",
            value: [
              {
                code: "circa.ewaste:waste-opening-impact",
                batchBoundaryBefore: true,
                order: 86,
                kind: "Install illustrative opening impact estimates",
                required: true,
                trigger: "USER",
                dataType: "sample",
                targetServer: "wasteServer",
                targetRuntimeRole: "WASTE",
              },
              {
                code: "circa.ewaste:waste-opening-assets",
                batchBoundaryBefore: true,
                order: 87,
                kind: "Install opening assets and their creation events",
                required: true,
                trigger: "USER",
                dataType: "sample",
                targetServer: "wasteServer",
                targetRuntimeRole: "WASTE",
              },
              {
                code: "product:productPublicationWorkflow",
                kind: "Product publication approval workflow",
                required: true,
                trigger: "USER",
                dataType: "init",
                targetServer: "process",
                targetRuntimeRole: "PROCESS",
              },
              {
                code: "pricing:pricingPublicationWorkflow",
                kind: "Pricing publication approval workflow",
                required: true,
                trigger: "USER",
                dataType: "init",
                targetServer: "process",
                targetRuntimeRole: "PROCESS",
              },
              {
                code: "tax:taxPublicationWorkflow",
                kind: "Tax publication approval workflow",
                required: true,
                trigger: "USER",
                dataType: "init",
                targetServer: "process",
                targetRuntimeRole: "PROCESS",
              },
              {
                code: "promotion:promotionPublicationWorkflow",
                kind: "Promotion publication approval workflow",
                required: true,
                trigger: "USER",
                dataType: "init",
                targetServer: "process",
                targetRuntimeRole: "PROCESS",
              },
              {
                code: "inventory:inventoryPublicationWorkflow",
                kind: "Inventory publication approval workflow",
                required: true,
                trigger: "USER",
                dataType: "init",
                targetServer: "process",
                targetRuntimeRole: "PROCESS",
              },
              {
                code: "product:accessGroups",
                kind: "Enterprise-scoped Commerce setup publisher role",
                required: true,
                trigger: "USER",
                dataType: "init",
                targetServer: "platformServer",
                targetRuntimeRole: "PLATFORM",
              },
              {
                code: "promotion:accessGroups",
                kind: "Enterprise-scoped coupon issuer role",
                required: true,
                trigger: "USER",
                dataType: "init",
                targetServer: "platformServer",
                targetRuntimeRole: "PLATFORM",
              },
              {
                code: "order:accessGroups",
                kind: "Axis access and refund review for predefined demo staff",
                required: true,
                trigger: "USER",
                dataType: "init",
                targetServer: "platformServer",
                targetRuntimeRole: "PLATFORM",
              },
              {
                code: "circa.ewaste:circaMerchantOutletAccess",
                kind: "Existing demo merchant operators exact outlet scopes",
                required: true,
                trigger: "USER",
                dataType: "sample",
                targetServer: "platformServer",
                targetRuntimeRole: "PLATFORM",
              },
              {
                code: "circa.ewaste:circaDigitalOwnershipPolicies",
                kind: "Original digital asset sale and refund policies",
                required: true,
                trigger: "USER",
                dataType: "sample",
                targetServer: "wasteServer",
                targetRuntimeRole: "WASTE",
              },
              {
                code: "circa.ewaste:circaCataloguePublicationPlan",
                type: "GOVERNED_PUBLICATIONS",
                kind: "Marketplace catalogue publication",
                operatorEnterpriseCode: "GREENPERKS_ONLINE",
                required: true,
                trigger: "USER",
                phase: "AFTER_PUBLICATION",
                dataType: "sample",
                targetServer: "commerceStaged",
                targetRuntimeRole: "COMMERCE_STAGED",
                publicationPlan: require("../../../../modules/circa.ewaste/data/sample-v001/publication/catalogue/records/publicationPlan.json"),
              },
              {
                code: "circa.ewaste:circaGreenPerksL08PublicationPlan",
                type: "GOVERNED_PUBLICATIONS",
                kind: "GreenPerks issuer policy publication",
                operatorEnterpriseCode: "GREENPERKS_RETAIL",
                required: true,
                trigger: "USER",
                phase: "AFTER_PUBLICATION",
                dataType: "sample",
                targetServer: "commerceStaged",
                targetRuntimeRole: "COMMERCE_STAGED",
                publicationPlan: require("../../../../modules/circa.ewaste/data/sample-v001/publication/l08-20261110/greenperks/records/publicationPlan.json"),
              },
              {
                code: "circa.ewaste:circaRenewWorksL08PublicationPlan",
                type: "GOVERNED_PUBLICATIONS",
                kind: "RenewWorks issuer policy publication",
                operatorEnterpriseCode: "RENEWWORKS_REPAIR_REUSE",
                required: true,
                trigger: "USER",
                phase: "AFTER_PUBLICATION",
                dataType: "sample",
                targetServer: "commerceStaged",
                targetRuntimeRole: "COMMERCE_STAGED",
                publicationPlan: require("../../../../modules/circa.ewaste/data/sample-v001/publication/l08-20261110/renewworks/records/publicationPlan.json"),
              },
              {
                code: "circa.ewaste:circaLoopCycleL08PublicationPlan",
                type: "GOVERNED_PUBLICATIONS",
                kind: "LoopCycle issuer policy publication",
                operatorEnterpriseCode: "LOOPCYCLE_RECYCLING",
                required: true,
                trigger: "USER",
                phase: "AFTER_PUBLICATION",
                dataType: "sample",
                targetServer: "commerceStaged",
                targetRuntimeRole: "COMMERCE_STAGED",
                publicationPlan: require("../../../../modules/circa.ewaste/data/sample-v001/publication/l08-20261110/loopcycle/records/publicationPlan.json"),
              },
              {
                code: "import:specialAccessRoles",
                kind: "Sample import responsibility",
                order: 119,
                required: true,
                trigger: "USER",
                phase: "BEFORE_PUBLICATION",
                dataType: "init",
                targetServer: "platformServer",
                targetRuntimeRole: "PLATFORM",
              },
              {
                code: "loyaltyWallet:specialAccessRoles",
                kind: "Circa Local demo credit role",
                order: 120,
                required: true,
                trigger: "USER",
                phase: "BEFORE_PUBLICATION",
                dataType: "init",
                targetServer: "platformServer",
                targetRuntimeRole: "PLATFORM",
              },
              {
                code: "circa.ewaste:circaLocalDemoCreditStaffAssignment",
                kind: "Circa Local demo credit staff assignment",
                order: 121,
                required: true,
                trigger: "USER",
                phase: "BEFORE_PUBLICATION",
                dataType: "sample",
                targetServer: "platformServer",
                targetRuntimeRole: "PLATFORM",
              },
              {
                code: "inventory:specialAccessRoles",
                kind: "Circa Local opening Inventory role",
                order: 122,
                required: true,
                trigger: "USER",
                phase: "BEFORE_PUBLICATION",
                dataType: "init",
                targetServer: "platformServer",
                targetRuntimeRole: "PLATFORM",
              },
              {
                code: "circa.ewaste:circaLocalOpeningStaffAssignments",
                kind: "Circa Local opening Inventory staff assignments",
                order: 123,
                required: true,
                trigger: "USER",
                phase: "BEFORE_PUBLICATION",
                dataType: "sample",
                targetServer: "platformServer",
                targetRuntimeRole: "PLATFORM",
              },
              {
                code: "circa.ewaste:circaGreenPerksOutletCommerce",
                kind: "Fictional greenperks outlet goods catalogue",
                order: 130,
                required: true,
                trigger: "USER",
                phase: "BEFORE_PUBLICATION",
                dataType: "sample",
                targetServer: "commerceStaged",
                targetRuntimeRole: "COMMERCE_STAGED",
              },
              {
                code: "circa.ewaste:circaRenewWorksOutletCommerce",
                kind: "Fictional renewworks outlet goods catalogue",
                order: 131,
                required: true,
                trigger: "USER",
                phase: "BEFORE_PUBLICATION",
                dataType: "sample",
                targetServer: "commerceStaged",
                targetRuntimeRole: "COMMERCE_STAGED",
              },
              {
                code: "circa.ewaste:circaLoopCycleOutletCommerce",
                kind: "Fictional loopcycle outlet goods catalogue",
                order: 132,
                required: true,
                trigger: "USER",
                phase: "BEFORE_PUBLICATION",
                dataType: "sample",
                targetServer: "commerceStaged",
                targetRuntimeRole: "COMMERCE_STAGED",
              },
              {
                code: "circa.ewaste:circaLocalDemoCredit",
                kind: "Approved guarded kickoffLocal fresh-demo customer POINTS credit",
                order: 190,
                required: true,
                trigger: "USER",
                phase: "AFTER_PUBLICATION",
                operatorEnterpriseCode: "GREENPERKS_ONLINE",
                dataType: "sample",
                targetServer: { $config: "runtime", name: "loyalty", path: "runtimeIdentity.serverCode" },
                targetRuntimeRole: { $config: "runtime", name: "loyalty", path: "runtimeRole.code" },
              },
              {
                code: "circa.ewaste:circaGreenPerksOutletPublicationPlan",
                type: "GOVERNED_PUBLICATIONS",
                kind: "Fictional greenperks outlet governed publication",
                operatorEnterpriseCode: "GREENPERKS_RETAIL",
                order: 200,
                required: true,
                trigger: "USER",
                phase: "AFTER_PUBLICATION",
                dataType: "sample",
                targetServer: "commerceStaged",
                targetRuntimeRole: "COMMERCE_STAGED",
                publicationPlan: require("../../../../modules/circa.ewaste/data/sample-v001/merchant-outlets/greenperks/publication/records/publicationPlan.json"),
              },
              {
                code: "circa.ewaste:circaGreenPerksOutletOpening",
                kind: "Fictional greenperks Inventory first intake after outlet publication",
                operatorEnterpriseCode: "GREENPERKS_RETAIL",
                order: 201,
                required: true,
                trigger: "USER",
                phase: "AFTER_PUBLICATION",
                dataType: "sample",
                targetServer: "commerce",
                targetRuntimeRole: "COMMERCE",
              },
              {
                code: "circa.ewaste:circaRenewWorksOutletPublicationPlan",
                type: "GOVERNED_PUBLICATIONS",
                kind: "Fictional renewworks outlet governed publication",
                operatorEnterpriseCode: "RENEWWORKS_REPAIR_REUSE",
                order: 202,
                required: true,
                trigger: "USER",
                phase: "AFTER_PUBLICATION",
                dataType: "sample",
                targetServer: "commerceStaged",
                targetRuntimeRole: "COMMERCE_STAGED",
                publicationPlan: require("../../../../modules/circa.ewaste/data/sample-v001/merchant-outlets/renewworks/publication/records/publicationPlan.json"),
              },
              {
                code: "circa.ewaste:circaRenewWorksOutletOpening",
                kind: "Fictional renewworks Inventory first intake after outlet publication",
                operatorEnterpriseCode: "RENEWWORKS_REPAIR_REUSE",
                order: 203,
                required: true,
                trigger: "USER",
                phase: "AFTER_PUBLICATION",
                dataType: "sample",
                targetServer: "commerce",
                targetRuntimeRole: "COMMERCE",
              },
              {
                code: "circa.ewaste:circaLoopCycleOutletPublicationPlan",
                type: "GOVERNED_PUBLICATIONS",
                kind: "Fictional loopcycle outlet governed publication",
                operatorEnterpriseCode: "LOOPCYCLE_RECYCLING",
                order: 204,
                required: true,
                trigger: "USER",
                phase: "AFTER_PUBLICATION",
                dataType: "sample",
                targetServer: "commerceStaged",
                targetRuntimeRole: "COMMERCE_STAGED",
                publicationPlan: require("../../../../modules/circa.ewaste/data/sample-v001/merchant-outlets/loopcycle/publication/records/publicationPlan.json"),
              },
              {
                code: "circa.ewaste:circaLoopCycleOutletOpening",
                kind: "Fictional loopcycle Inventory first intake after outlet publication",
                operatorEnterpriseCode: "LOOPCYCLE_RECYCLING",
                order: 205,
                required: true,
                trigger: "USER",
                phase: "AFTER_PUBLICATION",
                dataType: "sample",
                targetServer: "commerce",
                targetRuntimeRole: "COMMERCE",
              },
            ],
          },
        },
      },
    },
  },
  activeModules: {
    groups: ["nodics.discovery", "nodics.copilot"],
    modules: [
      "publish",
      "redisCache",
      "circa.ewaste",
      "agora.apparel",
      "agora.electronics",
      "agora.telco",
      "nexusCore",
      "search",
      "elastic",
      "nodics.kickoff",
      "kickoffCore",
      "kickoffApi",
      "kickoffInt",
      "axis",
      "ollamaProvider",
    ],
  },
  runtimeRole: {
    code: "PLATFORM",
    publication: "OPERATIONAL",
  },
  database: {
    default: {
      mongodb: {
        master: {
          databaseName: "kickoffLocalPlatform",
        },
      },
    },
  },
  servers: {
    default: {
      endpoint: {
        httpPort: 4300,
        httpsPort: 4301,
      },
    },
  },
  apiExposure: {
    categories: {
      profileTeam: {
        enabled: { $config: "env", name: "NODICS_LOCAL_INVITATION_WITHDRAWAL_ENABLED", type: "boolean" },
      },
      moduleInternal: {
        enabled: true,
      },
      profileTenantProvisioning: {
        enabled: {
          $config: "env",
          name: "NODICS_LOCAL_TENANT_PROVISIONING_ENABLED",
          type: "boolean",
          fallback: false,
        },
      },
      profileEmployeeRecovery: {
        enabled: {
          $config: "env",
          name: "NODICS_LOCAL_EMPLOYEE_RECOVERY_ENABLED",
          type: "boolean",
          fallback: false,
        },
      },
    },
  },
  order: {
    disputes: {
      enabled: true,
      orderCodePrefixes: ["CIRCA_ORDER_"],
    },
    refunds: {
      enabled: true,
      orderCodePrefixes: ["CIRCA_ORDER_"],
    },
  },
  profileExternalIdentity: circaNative.profileExternalIdentity,
  bidding: {
    enabled: true,
    policyVersion: "circa-digital-bids-v1",
    amountScale: 0,
    maximumAmount: "100000",
    stores: {
      circaMainStore: {
        enterpriseCode: "GREENPERKS_ONLINE",
        currency: "POINTS",
        locale: "en",
        orderCodePrefix: "CIRCA_ORDER_BID_",
        allowOwnerReference: true,
      },
    },
  },
  media: {
    customerUploads: {
      enabled: true,
    },
  },
  waste: {
    operations: {
      requireScopes: true,
      requireVerification: true,
    },
  },
  eWaste: circaNative.eWaste,
  promotion: {
    legacyTokenHashPolicies: ["TENANT_COLON_UPPERCASE_SHA256"],
  },
  digitalCore: {
    merchantRedemption: {
      enabled: true,
    },
  },
  credentials: {
    "telegram.bot.circa": {
      value: { $config: "env", name: "NODICS_TELEGRAM_BOT_TOKEN", type: "string", fallback: null },
      label: "Circa Telegram bot token",
      status: "CONFIGURED",
      secret: true,
      credentialKind: "BOT_TOKEN",
    },
  },
  backofficeLocalReset: {
    providers: {
      $config: "keyed",
      key: "code",
      entries: [],
      remove: ["loyalty", "location", "engagement"],
    },
  },
  runtimeConfigurationSchemas: {
    telegramExternalIdentity: {
      fields: [
        {
          credentialReference: "telegram.bot.circa",
        },
      ],
    },
  },
  copilot: {
    core: {
      customerProject: "kickoff",
    },
    api: {
      enabled: true,
    },
    workbench: {
      target: {
        connectionName: "commerceStaged",
        targetAuthority: {
          publication: "STAGED",
        },
      },
    },
    knowledge: {
      ingestion: {
        enabled: {
          $config: "env",
          name: "NODICS_COPILOT_KNOWLEDGE_ENABLED",
          fallback: true,
          type: "boolean",
        },
        ingestOnStart: {
          $config: "env",
          name: "NODICS_COPILOT_KNOWLEDGE_INGEST_ON_START",
          fallback: true,
          type: "boolean",
        },
        startup: {
          serviceId: "kickoff-local-knowledge-indexer",
          logSummary: true,
        },
      },
      retrieval: {
        enabled: {
          $config: "env",
          name: "NODICS_COPILOT_KNOWLEDGE_ENABLED",
          fallback: true,
          type: "boolean",
        },
      },
    },
    providers: {
      enabled: true,
      default: {
        adapter: "ollama",
      },
      adapters: {
        ollama: {
          enabled: true,
        },
      },
      accounting: {
        enabled: true,
        tenantLimit: 100000,
        enterprises: [
          {
            tenantCode: "default",
            enterpriseCode: "default",
            limit: 100000,
            adapters: ["ollama"],
            profiles: ["conversation", "structuredTool", "evaluation"],
            users: [
              {
                principalCode: "admin",
                limit: 100000,
              },
            ],
          },
        ],
      },
    },
  },
  data: {
    dataReleases: {
      types: {
        init: {
          startupProfileSelections: [{
            environmentCode: "kickoffLocal",
            serverCode: "platformServer",
            profileCodes: ["localAxisIdentityDefinitions", "localContentAccessDefinitions"],
          }],
        },
      },
      initializationProfiles: {
        localAxisIdentityDefinitions: {
          template: "axisAccessDefinitions",
        },
        localContentAccessDefinitions: {
          template: "axisContentAccessDefinitions",
        },
        localPlatformFoundation: {
          template: "foundation",
          label: "Platform foundation",
          description: "Review the eligible identity and platform reference releases for this installation.",
          completionMessage: "Platform setup is current. Review optional application and demonstration releases separately.",
        },
        circaIdentityAuthority: { template: "circaIdentityAuthority" },
      },
      contributions: {
        $config: "keyed",
        key: "moduleName",
        entries: [
          // Explicit capability setup, Circa releases and their pinned permission prerequisites.
          { moduleName: "bidding", sections: ["permissionCatalogue", "participantTransactionAccess"] },
          { moduleName: "cart", sections: ["permissionCatalogue", "participantTransactionAccess"] },
          { moduleName: "catalog", sections: ["permissionCatalogue"] },
          { moduleName: "checkoutCore", sections: ["permissionCatalogue", "participantTransactionAccess"] },
          { moduleName: "cms", sections: ["permissionCatalogue", "accessGroups", "enterpriseRoles", "businessAccessRoles", "businessAccessGroups", "publicationReviewPermissions", "publicationReviewGroups", "publicationReviewRoles"] },
          { moduleName: "commerceSearchCore", sections: ["permissionCatalogue"] },
          { moduleName: "commsCore", sections: ["permissionCatalogue"] },
          { moduleName: "cronjob", sections: ["permissionCatalogue"] },
          { moduleName: "customerFeedback", sections: ["permissionCatalogue"] },
          { moduleName: "customerReview", sections: ["permissionCatalogue"] },
          { moduleName: "digitalCore", sections: ["bundleParticipantPermissions", "participantAccessGroups", "enterpriseParticipationAccess", "enterpriseRoles", "permissionCatalogue", "participantReadAccess", "participantTransactionAccess", "enterpriseParticipationPermissions", "accessGroups"] },
          { moduleName: "editorial", sections: ["permissionCatalogue"] },
          { moduleName: "engagementCore", sections: ["permissionCatalogue", "accessGroups"] },
          { moduleName: "fulfillmentCore", sections: ["permissionCatalogue"] },
          { moduleName: "inventory", sections: ["specialAccessRoles", "specialAccessGroups", "permissionCatalogue"] },
          { moduleName: "locationCore", sections: ["permissionCatalogue"] },
          { moduleName: "loyaltyLedger", sections: ["permissionCatalogue"] },
          { moduleName: "loyaltyReservation", sections: ["permissionCatalogue"] },
          { moduleName: "loyaltyWallet", sections: ["specialAccessRoles", "participantAccessGroups", "enterpriseParticipationAccess", "specialAccessGroups", "permissionCatalogue", "transferPermissions", "participantReadAccess", "participantTransactionAccess"] },
          { moduleName: "media", sections: ["permissionCatalogue"] },
          { moduleName: "order", sections: ["accessGroups", "permissionCatalogue", "participantTransactionAccess", "participantReadAccess", "enterpriseRoles", "specialAccessGroups", "specialAccessRoles", "businessAccessRoles", "businessAccessGroups"] },
          { moduleName: "paymentCore", sections: ["permissionCatalogue"] },
          { moduleName: "pricing", sections: ["permissionCatalogue", "administrativeAuthoringPermission", "administrativePublicationPermission"] },
          { moduleName: "product", sections: ["accessGroups", "enterpriseRoles", "permissionCatalogue", "businessAccessRoles", "businessAccessGroups"] },
          { moduleName: "promotion", sections: ["accessGroups", "enterpriseRoles", "businessAccessRoles", "permissionCatalogue", "businessAccessGroups"] },
          { moduleName: "shoppingList", sections: ["permissionCatalogue"] },
          { moduleName: "store", sections: ["permissionCatalogue", "accessGroups"] },
          { moduleName: "tax", sections: ["permissionCatalogue"] },
          { moduleName: "testimonial", sections: ["permissionCatalogue"] },
          { moduleName: "wasteCarbon", sections: ["participantAccessGroups", "permissionCatalogue"] },
          { moduleName: "wasteCollection", sections: ["permissionCatalogue"] },
          { moduleName: "wasteCore", sections: ["permissionCatalogue", "enterpriseRoles", "businessAccessRoles", "accessGroups", "businessAccessGroups"] },
          { moduleName: "wasteImpact", sections: ["permissionCatalogue"] },
          { moduleName: "wasteReward", sections: ["participantAccessGroups", "permissionCatalogue"] },
          { moduleName: "wasteSubmission", sections: ["permissionCatalogue"] },
          { moduleName: "wasteVerification", sections: ["permissionCatalogue"] },
          { moduleName: "wcmsExperience", sections: ["permissionCatalogue", "authoringPermissions", "previewAccessGroups", "previewAccessRoles"] },
          { moduleName: "workflow", sections: ["permissionCatalogue"] },
          { moduleName: "loyaltyCore", sections: ["sample-enterprises"] },
        ],
      },
    },
  },
};
