/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module circa.ewaste/data/sample-v001/operations/asset-policy/headers/circaDigitalOwnershipPolicyHeader @description Selects reviewed local sale policy intent only; never ownership, payment, bindings or grants. @layer data-header @owner circa.ewaste */
module.exports = {
  wasteCore: {
    circaDigitalTransferPolicyData: {
      options: { enabled: true, schemaName: "wasteAssetTransferPolicy", operation: "saveAll", dataFilePrefix: "circaDigitalTransferPolicyData" },
      query: { code: "$code" }
    },
    circaDigitalRewardPolicyData: {
      options: { enabled: true, schemaName: "wasteRewardSettlementPolicy", operation: "saveAll", dataFilePrefix: "circaDigitalRewardPolicyData" },
      query: { code: "$code" }
    },
    circaDigitalCarbonPolicyData: {
      options: { enabled: true, schemaName: "wasteCarbonSettlementPolicy", operation: "saveAll", dataFilePrefix: "circaDigitalCarbonPolicyData" },
      query: { code: "$code" }
    }
  }
};
