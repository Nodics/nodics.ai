/** @module nodics.rulesEngine/config/properties @description Defines reusable Rules Engine limits and process-owned policy approval data-release contributions. @layer config @owner rulesEngine @override Later layers may tune rule-set limits and route approval policy releases by runtime role. */
module.exports = {
  "rulesEngine": {
    "limits": {
      "maximumRuleGroupsPerSet": 250,
      "maximumConditionsPerGroup": 50,
      "maximumGroupDepth": 5,
      "maximumSimulationBatchSize": 100
    }
  },
  "data": {
    "dataReleases": {
      "runtimeRoleProfiles": {
        "PROCESS": {
          "contributions": [
            {
              "moduleName": "rulesApi",
              "sections": [
                "rulesPolicyApproval"
              ]
            }
          ]
        }
      }
    }
  }
};
