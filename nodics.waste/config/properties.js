/** @module nodics.waste/config/properties @description Defines reusable Waste data-release placement for core reference, profile-address and location sample contributions. @layer config @owner waste @override Later layers may add deployment/project waste releases while keeping schemas and lifecycle authority in Waste modules. */
module.exports = {
  "data": {
    "dataReleases": {
      "runtimeRoleProfiles": {
        "PLATFORM": {
          "contributions": [
            {
              "moduleName": "wasteCore",
              "sections": [
                "core-reference"
              ]
            },
            {
              "moduleName": "wasteCollection",
              "sections": [
                "sample-profile-addresses"
              ]
            }
          ]
        },
        "LOCATION": {
          "contributions": [
            {
              "moduleName": "wasteCollection",
              "sections": [
                "sample-locations"
              ]
            }
          ]
        }
      }
    }
  }
};
