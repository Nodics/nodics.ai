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
