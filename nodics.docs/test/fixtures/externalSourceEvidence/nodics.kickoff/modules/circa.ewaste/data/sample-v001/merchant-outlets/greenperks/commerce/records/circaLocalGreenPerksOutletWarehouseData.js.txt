/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/**
 * @module circa.ewaste/data/sample-v001/merchant-outlets/greenperks/commerce/records/circaLocalGreenPerksOutletWarehouseData.js
 * @description Supplies approved fictional Local outlet records through the canonical schema owner.
 * @layer data
 * @owner circa.ewaste
 */
module.exports = {
  "record0": {
    "tenant": "default",
    "enterpriseCode": "GREENPERKS_RETAIL",
    "revision": 1,
    "active": true,
    "code": "circaLocalCafeWarehouse",
    "name": "Local demo take-home coffee goods warehouse",
    "status": "ACTIVE",
    "storeCode": "greenperks-cafe",
    "fulfillmentTypes": [
      "SHIP_TO_HOME"
    ],
    "pickupEnabled": false,
    "priority": 1
  },
  "record1": {
    "tenant": "default",
    "enterpriseCode": "GREENPERKS_RETAIL",
    "revision": 1,
    "active": true,
    "code": "circaLocalBistroWarehouse",
    "name": "Local demo pantry goods warehouse",
    "status": "ACTIVE",
    "storeCode": "greenperks-bistro",
    "fulfillmentTypes": [
      "SHIP_TO_HOME"
    ],
    "pickupEnabled": false,
    "priority": 1
  }
};
