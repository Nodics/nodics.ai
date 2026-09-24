/** @module nodics.loyalty/config/properties @description Defines reusable Loyalty defaults and baseline data-release contributions. @layer config @owner loyalty @override Later layers may override scale, reservation TTL, idempotency policy and release placement for deployment-specific programmes. */
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
