/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module circa.ewaste/data/customerDigitalParticipation @description Assigns Digital-owned bundle participation to existing Circa sample customers without credentials. @layer data @owner circa.ewaste */
module.exports = {
  record0: {
    code: "circa-customer",
    loginId: "customer@circa.local",
    expectedGroupCodes: [
      "customerUserGroup",
      "loyaltyParticipantCustomerUserGroup",
      "wasteCarbonCustomerUserGroup",
      "wasteMaterialValueCustomerUserGroup",
    ],
    groupCodes: ["digitalBundleCustomerUserGroup"],
  },
  record1: {
    code: "circa-seller",
    loginId: "seller@circa.local",
    expectedGroupCodes: [
      "customerUserGroup",
      "loyaltyParticipantCustomerUserGroup",
      "wasteCarbonCustomerUserGroup",
      "wasteMaterialValueCustomerUserGroup",
    ],
    groupCodes: ["digitalBundleCustomerUserGroup"],
  },
  record2: {
    code: "circa-recipient",
    loginId: "recipient@circa.local",
    expectedGroupCodes: [
      "customerUserGroup",
      "loyaltyParticipantCustomerUserGroup",
      "wasteCarbonCustomerUserGroup",
      "wasteMaterialValueCustomerUserGroup",
    ],
    groupCodes: ["digitalBundleCustomerUserGroup"],
  },
};
