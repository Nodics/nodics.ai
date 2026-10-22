/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module commerceSearchCore/config/properties @description Defines Commerce Search runtime policy and schema access. @layer config @owner commerceSearchCore */
module.exports = {
  tooling: {
    commands: {
      "acceptance:commerce-search-ranking": {
        acceptanceContract: true,
        projectHome: true,
        handler: "@nTooling/node-script",
        script: "src/service/acceptance/defaultCommerceSearchRankingAcceptanceService.mjs",
      },
    },
  },
  // Inert inventory; an allowed local server must explicitly select this capability.
  localResetProvider: {
    contributions: {
      commerceSearchCore: {
        serviceNames: {
          DefaultCommerceSearchRuleProjectionService: true,
          DefaultCommerceSearchRuleService: true,
          DefaultCommerceSearchRuleVersionService: true,
        },
      },
    },
  },

  commerceSearch: {
    enabled: true,
    ranking: {
      // Completeness bounds are positive safe integers; page/rule limits cannot
      // exceed maximumRuleScan. Missing values fail owner validation.
      enabled: true,
      searchIndexName: "commerceSearchRuleProjection",
      maximumRulesPerRequest: 50,
      maximumActionsPerRule: 200,
      maximumRuleScan: 5000,
      rulePageSize: 100,
      maximumCandidateProducts: 10000,
      // Safe integer used only when a governed rule omits priority; zero is explicit.
      defaultRulePriority: 0,
      actionWeights: { BOOST: 1000, BURY: -1000 },
      supportedActionTypes: ["PIN", "BOOST", "BURY"],
      supportedScopeTypes: ["GLOBAL", "CATEGORY", "SEARCH_TERM"],
      acceptance: { requestTimeoutMs: 30000, maximumExpectedProducts: 1000 },
    },
  },
  schemaPolicies: {
    commerceSearchCore: {
      operational: {
        accessGroups: {
          adminGroup: 10,
          commerceOperatorUserGroup: 10,
          serviceAccountUserGroup: 10,
        },
      },
      tenantOwned: {
        accessGroups: {
          adminGroup: 10,
          commerceOperatorUserGroup: 10,
          serviceAccountUserGroup: 10,
        },
      },
    },
  },
  apiExposure: {
    categories: {
      commerceManagement: {
        enabled: true,
      },
    },
  },
};
