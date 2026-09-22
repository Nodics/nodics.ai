module.exports = {
  "loyalty": {
    "defaults": {
      "amountScale": 2,
      "reservationTtlSeconds": 900,
      "idempotencyRequired": true
    }
  },
  "data": {
    "dataReleases": {
      "runtimeRoleProfiles": {
        "PLATFORM": {
          "contributions": [
            {
              "moduleName": "loyaltyCore",
              "sections": [
                "core-enterprise-reference"
              ]
            }
          ]
        }
      }
    }
  }
};
