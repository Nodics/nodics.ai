/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module circa.ewaste/data/sample-v001/staff-access/records/circaCommerceStaffAssignmentData @description Reviewed additive roles for existing demo employees; never employee snapshots, passwords or runtime grants. @layer data @owner circa.ewaste */
module.exports = {
  "record0": {
    "code": "circa-online-administrator",
    "loginId": "online.administrator@circa.local",
    "enterpriseCode": "GREENPERKS_ONLINE",
    "roleCodes": [
      "COMMERCE_SETUP_PUBLISHER",
      "COMMERCE_AXIS_REFUND_REVIEWER",
      "COMMERCE_OWN_CART_PARTICIPANT",
      "COMMERCE_OWN_CHECKOUT_PARTICIPANT",
      "COMMERCE_OWN_LIFECYCLE_PARTICIPANT",
      "COMMERCE_OWN_ORDER_READER",
      "COMMERCE_BID_PARTICIPANT"
    ],
    "groupCodes": [
      "commerceSetupPublisherUserGroup",
      "commercePublicationStarterUserGroup",
      "commerceAxisRefundReviewerUserGroup",
      "commerceOwnCartParticipantUserGroup",
      "commerceOwnCheckoutParticipantUserGroup",
      "commerceOwnLifecycleParticipantUserGroup",
      "commerceOwnOrderReaderUserGroup",
      "commerceBidParticipantUserGroup"
    ]
  },
  "record1": {
    "code": "circa-retail-administrator",
    "loginId": "retail.administrator@circa.local",
    "enterpriseCode": "GREENPERKS_RETAIL",
    "roleCodes": [
      "COMMERCE_SETUP_PUBLISHER",
      "COMMERCE_COUPON_ISSUER",
      "PROMOTION_EDIT",
      "COMMERCE_OWN_CART_PARTICIPANT",
      "COMMERCE_OWN_CHECKOUT_PARTICIPANT",
      "COMMERCE_OWN_LIFECYCLE_PARTICIPANT",
      "COMMERCE_OWN_ORDER_READER",
      "COMMERCE_BID_PARTICIPANT"
    ],
    "groupCodes": [
      "commerceSetupPublisherUserGroup",
      "commercePublicationStarterUserGroup",
      "commerceCouponIssuerUserGroup",
      "promotionBusinessEditUserGroup",
      "commerceOwnCartParticipantUserGroup",
      "commerceOwnCheckoutParticipantUserGroup",
      "commerceOwnLifecycleParticipantUserGroup",
      "commerceOwnOrderReaderUserGroup",
      "commerceBidParticipantUserGroup"
    ]
  },
  "record2": {
    "code": "circa-repair-administrator",
    "loginId": "repair.administrator@circa.local",
    "enterpriseCode": "RENEWWORKS_REPAIR_REUSE",
    "roleCodes": [
      "COMMERCE_SETUP_PUBLISHER",
      "COMMERCE_COUPON_ISSUER",
      "PROMOTION_EDIT",
      "COMMERCE_OWN_CART_PARTICIPANT",
      "COMMERCE_OWN_CHECKOUT_PARTICIPANT",
      "COMMERCE_OWN_LIFECYCLE_PARTICIPANT",
      "COMMERCE_OWN_ORDER_READER",
      "COMMERCE_BID_PARTICIPANT"
    ],
    "groupCodes": [
      "commerceSetupPublisherUserGroup",
      "commercePublicationStarterUserGroup",
      "commerceCouponIssuerUserGroup",
      "promotionBusinessEditUserGroup",
      "commerceOwnCartParticipantUserGroup",
      "commerceOwnCheckoutParticipantUserGroup",
      "commerceOwnLifecycleParticipantUserGroup",
      "commerceOwnOrderReaderUserGroup",
      "commerceBidParticipantUserGroup"
    ]
  },
  "record3": {
    "code": "circa-recycling-administrator",
    "loginId": "recycling.administrator@circa.local",
    "enterpriseCode": "LOOPCYCLE_RECYCLING",
    "roleCodes": [
      "COMMERCE_SETUP_PUBLISHER",
      "COMMERCE_COUPON_ISSUER",
      "PROMOTION_EDIT",
      "COMMERCE_OWN_CART_PARTICIPANT",
      "COMMERCE_OWN_CHECKOUT_PARTICIPANT",
      "COMMERCE_OWN_LIFECYCLE_PARTICIPANT",
      "COMMERCE_OWN_ORDER_READER",
      "COMMERCE_BID_PARTICIPANT"
    ],
    "groupCodes": [
      "commerceSetupPublisherUserGroup",
      "commercePublicationStarterUserGroup",
      "commerceCouponIssuerUserGroup",
      "promotionBusinessEditUserGroup",
      "commerceOwnCartParticipantUserGroup",
      "commerceOwnCheckoutParticipantUserGroup",
      "commerceOwnLifecycleParticipantUserGroup",
      "commerceOwnOrderReaderUserGroup",
      "commerceBidParticipantUserGroup"
    ]
  },
  "record4": {
    "code": "circa-retail-operator",
    "loginId": "retail.operator@circa.local",
    "enterpriseCode": "GREENPERKS_RETAIL",
    "roleCodes": [
      "MERCHANT_OPERATOR"
    ],
    "groupCodes": [
      "commerceMerchantUserGroup"
    ]
  },
  "record5": {
    "code": "circa-repair-operator",
    "loginId": "repair.operator@circa.local",
    "enterpriseCode": "RENEWWORKS_REPAIR_REUSE",
    "roleCodes": [
      "MERCHANT_OPERATOR"
    ],
    "groupCodes": [
      "commerceMerchantUserGroup"
    ]
  },
  "record6": {
    "code": "circa-recycling-operator",
    "loginId": "recycling.operator@circa.local",
    "enterpriseCode": "LOOPCYCLE_RECYCLING",
    "roleCodes": [
      "MERCHANT_OPERATOR"
    ],
    "groupCodes": [
      "commerceMerchantUserGroup"
    ]
  },
  "record7": {
    "code": "circa-integrated-administrator",
    "loginId": "integrated.administrator@circa.local",
    "enterpriseCode": "CIRCA_INTEGRATED_SERVICES",
    "roleCodes": [
      "COMMERCE_OWN_CART_PARTICIPANT",
      "COMMERCE_OWN_CHECKOUT_PARTICIPANT",
      "COMMERCE_OWN_LIFECYCLE_PARTICIPANT",
      "COMMERCE_OWN_ORDER_READER",
      "COMMERCE_BID_PARTICIPANT"
    ],
    "groupCodes": [
      "commerceOwnCartParticipantUserGroup",
      "commerceOwnCheckoutParticipantUserGroup",
      "commerceOwnLifecycleParticipantUserGroup",
      "commerceOwnOrderReaderUserGroup",
      "commerceBidParticipantUserGroup"
    ]
  },
  "record8": {
    "code": "circa-logistics-administrator",
    "loginId": "logistics.administrator@circa.local",
    "enterpriseCode": "LOOPLINK_LOGISTICS",
    "roleCodes": [
      "COMMERCE_OWN_CART_PARTICIPANT",
      "COMMERCE_OWN_CHECKOUT_PARTICIPANT",
      "COMMERCE_OWN_LIFECYCLE_PARTICIPANT",
      "COMMERCE_OWN_ORDER_READER",
      "COMMERCE_BID_PARTICIPANT"
    ],
    "groupCodes": [
      "commerceOwnCartParticipantUserGroup",
      "commerceOwnCheckoutParticipantUserGroup",
      "commerceOwnLifecycleParticipantUserGroup",
      "commerceOwnOrderReaderUserGroup",
      "commerceBidParticipantUserGroup"
    ]
  },
  "record9": {
    "code": "circa-group-administrator",
    "loginId": "group.administrator@circa.local",
    "enterpriseCode": "GREENPERKS_GROUP",
    "roleCodes": [
      "COMMERCE_OWN_CART_PARTICIPANT",
      "COMMERCE_OWN_CHECKOUT_PARTICIPANT",
      "COMMERCE_OWN_LIFECYCLE_PARTICIPANT",
      "COMMERCE_OWN_ORDER_READER",
      "COMMERCE_BID_PARTICIPANT"
    ],
    "groupCodes": [
      "commerceOwnCartParticipantUserGroup",
      "commerceOwnCheckoutParticipantUserGroup",
      "commerceOwnLifecycleParticipantUserGroup",
      "commerceOwnOrderReaderUserGroup",
      "commerceBidParticipantUserGroup"
    ]
  }
};
