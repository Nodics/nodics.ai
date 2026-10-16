/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module eWaste/utils/statusDefinitions @description Declares owned operation error codes. @layer utility @owner eWaste */
module.exports = {
  ERR_EWASTE_JOURNEY_UNAVAILABLE: { code: "503", message: "The collection journey is not configured." },
  ERR_EWASTE_POSITION_INVALID: { code: "400", message: "A valid current position is required." },
  ERR_EWASTE_POSITION_STALE: { code: "400", message: "Refresh your position before confirming arrival." },
  ERR_EWASTE_ARRIVAL_REQUIRED: { code: "409", message: "Confirm arrival at the selected collection centre." },
  ERR_EWASTE_LISTING_FORBIDDEN: { code: "403", message: "Listing handoff is outside the authenticated operator or runtime scope." },
  ERR_EWASTE_LISTING_PROOF_REQUIRED: { code: "409", message: "The retained listing or its owner evidence changed. Reload the original request; no authoring or completion was retried." },
  ERR_EWASTE_LISTING_OWNER_UNAVAILABLE: { code: "503", message: "The canonical listing owner could not be inspected. No authoring or completion is confirmed." },
  ERR_EWASTE_LISTING_STORE_ENTERPRISE_REQUIRED: { code: "403", message: "Inspect only. Authoring requires an authorized publisher signed in to the listing Store enterprise." },
  ...require("./reviewDiagnostics").statuses,
  ...require("./digitalSaleDiagnostics").statuses,
  ERR_EWASTE_MEDIA_CLEANUP_FORBIDDEN: { code: "403", message: "Scoped eWaste media inspection authority is required" },
  ERR_EWASTE_MEDIA_CLEANUP_INPUT: { code: "400", message: "Choose valid dry-run media inspection selectors" },
  ERR_EWASTE_MEDIA_CLEANUP_UNAVAILABLE: { code: "503", message: "Authoritative Waste media inspection is unavailable" },
  ERR_EWASTE_MEDIA_CLEANUP_EXECUTION_BLOCKED: { code: "409", message: "Protected eWaste media cleanup execution is not qualified" },
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
  ERR_EWASTE_CHANNEL_CONFIGURATION_REQUIRED: {
    code: "503",
    message: "This sign-in channel needs administrator configuration. Reopen it after configuration is complete.",
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
  ERR_EWASTE_LISTING_PUBLICATION_REQUIRED: {
    code: "409",
    message: "Your listing is saved for owner publication review. It is not yet available to trade.",
  },
  ERR_EWASTE_LISTING_RECONCILIATION_REQUIRED: {
    code: "409",
    message: "The original listing needs owner reconciliation. No publication was retried.",
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
