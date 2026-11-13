/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @module circa.ewaste/data/sample-v001/opening-staff/records/circaLocalOpeningStaffData @description Exact approved retail, repair and recycling administrator group additions; no employee snapshots or credentials. @layer data @owner circa.ewaste */
module.exports = {
  record0: {
    code: "circa-retail-administrator",
    loginId: "retail.administrator@circa.local",
    enterpriseCode: "GREENPERKS_RETAIL",
    roleCodes: ["COMMERCE_INVENTORY_OPENING"],
    groupCodes: ["commerceInventoryOpeningUserGroup"],
  },
  record1: {
    code: "circa-repair-administrator",
    loginId: "repair.administrator@circa.local",
    enterpriseCode: "RENEWWORKS_REPAIR_REUSE",
    roleCodes: ["COMMERCE_INVENTORY_OPENING"],
    groupCodes: ["commerceInventoryOpeningUserGroup"],
  },
  record2: {
    code: "circa-recycling-administrator",
    loginId: "recycling.administrator@circa.local",
    enterpriseCode: "LOOPCYCLE_RECYCLING",
    roleCodes: ["COMMERCE_INVENTORY_OPENING"],
    groupCodes: ["commerceInventoryOpeningUserGroup"],
  },
};
