/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module eWaste/utils/statusDefinitions @description Declares owned operation error codes. @layer utility @owner eWaste */
module.exports = {
  ERR_EWASTE_CUSTOMER_QUERY: { code: "400", message: "Choose valid item filters and pagination" },
  ERR_EWASTE_CHANNEL_LINK_CONFLICT: {
    code: "409",
    message:
      "This channel is already linked to another account. Sign in with the linked account or manage the existing link before switching.",
  },
  ERR_EWASTE_CHANNEL_UNAVAILABLE: {
    code: "503",
    message:
      "This sign-in channel is unavailable. Use the website or try again later.",
  },
  ERR_EWASTE_CHANNEL_IDENTITY: {
    code: "401",
    message:
      "Channel sign-in could not be completed. Reopen the application and try again.",
  },
  ERR_EWASTE_PUBLICATION_PENDING: {
    code: "503",
    message: "Listing publication needs confirmation",
  },
  ERR_EWASTE_BALANCE_INSUFFICIENT: {
    code: "422",
    message: "Balance insufficient",
  },
  ERR_EWASTE_COMMAND_CONFLICT: {
    code: "409",
    message: "Command conflict",
  },
  ERR_EWASTE_COMMAND_REQUIRED: {
    code: "400",
    message: "Command required",
  },
  ERR_EWASTE_CONFIRMATION_REQUIRED: {
    code: "400",
    message: "Confirmation required",
  },
  ERR_EWASTE_CONVERSATION_UNAVAILABLE: {
    code: "503",
    message: "Conversation unavailable",
  },
  ERR_EWASTE_COMPOSITION_FIELD_FORBIDDEN: {
    code: "403",
    message: "Ewaste composition field forbidden",
  },
  ERR_EWASTE_WASTE_ROUTE_MISSING: {
    code: "503",
    message: "Ewaste waste route missing",
  },
  ERR_EWASTE_MESSAGE_INVALID: {
    code: "400",
    message: "Message invalid",
  },
  ERR_EWASTE_OFFER_CHANGED: {
    code: "409",
    message: "Offer changed",
  },
  ERR_EWASTE_OFFER_UNAVAILABLE: {
    code: "404",
    message: "Offer unavailable",
  },
  ERR_EWASTE_PURCHASE_PENDING: {
    code: "409",
    message: "Purchase pending",
  },
  ERR_EWASTE_SELF_PURCHASE: {
    code: "400",
    message: "Self purchase",
  },
  ERR_EWASTE_VALUATION_UNAVAILABLE: {
    code: "503",
    message: "Valuation unavailable",
  },
};
