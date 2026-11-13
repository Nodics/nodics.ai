/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @module digitalCore/data/digitalCouponExpiryReminderDefinition @description Process-owned installation of the optional reminder action graph. @owner digitalCore @layer module-data */
module.exports = {
  "definitions": [
    {
      "code": "digitalCouponExpiryReminder",
      "name": "Coupon expiry reminder",
      "description": "Check opted-in fixed-expiry coupon purchases for eligible recipients.",
      "category": "commerce",
      "ownerModule": "digitalCore",
      "policy": {
        "maximumContextBytes": 4096,
        "contextAllowlist": [
          "enterpriseCode",
          "entitlementCode",
          "source",
          "cronJobCode",
          "cronJobTenant",
          "scheduledExpression",
          "firedAt",
          "triggerCode",
          "correlationId"
        ]
      },
      "graph": {
        "nodes": [
          {
            "code": "start",
            "type": "START",
            "name": "Start"
          },
          {
            "code": "remind",
            "type": "ACTION",
            "name": "Check coupon expiry and notify opted-in staff",
            "action": {
              "moduleName": "digitalCore",
              "operation": "couponExpirySweep"
            }
          },
          {
            "code": "end",
            "type": "END",
            "name": "End"
          }
        ],
        "transitions": [
          {
            "code": "start_remind",
            "source": "start",
            "target": "remind"
          },
          {
            "code": "remind_end",
            "source": "remind",
            "target": "end"
          }
        ]
      }
    }
  ]
};
