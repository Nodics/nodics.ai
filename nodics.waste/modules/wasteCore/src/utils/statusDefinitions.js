/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module wasteCore/src/utils/statusDefinitions @description Defines stable Waste response and error codes. @layer utility @owner wasteCore @override Later modules may add codes while preserving existing meanings. */
module.exports = {
  ERR_WASTE_CUSTOMER_FIELD_READ_ONLY: { code: '400', message: 'Only the item name and description can be edited by the customer' },
  ERR_WASTE_DESCRIPTOR_INVALID: { code: '422', message: 'An item property or material reference is invalid' },
  ERR_WASTE_CATALOGUE_UNAVAILABLE: { code: '503', message: 'The active waste catalogue cannot be loaded completely' },
  ERR_WASTE_AREA_UNAVAILABLE: { code: '503', message: 'Collection area information is unavailable. Try again or filter by collection centre.' },
  ERR_WASTE_REVIEW_QUERY: {
    code: "400",
    message: "Review filters or pagination are invalid",
  },
  ERR_WASTE_ASSIGNMENT_CONFLICT: {
    code: "409",
    message:
      "This review is assigned to another employee. Refresh the workspace.",
  },
  ERR_WASTE_ASSIGNMENT_REQUIRED: {
    code: "409",
    message: "Assign this submission to yourself before editing or recording a review.",
  },
  ERR_WASTE_VERIFICATION_REQUIRED: {
    code: "409",
    message: "Independent verification is required",
  },
  ERR_WASTE_SEPARATE_APPROVER_REQUIRED: {
    code: "403",
    message: "A different employee must approve",
  },
  ERR_WASTE_VERIFIED_FACTS_IMMUTABLE: {
    code: "409",
    message: "Approval cannot change independently verified facts",
  },
  SUC_WASTE_00000: {
    code: "200",
    message: "Waste operation successfully processed",
  },
  SUC_WASTE_00001: { code: "201", message: "Waste submission created" },
  SUC_WASTE_00002: {
    code: "200",
    message: "Waste submission lifecycle updated",
  },
  ERR_WASTE_00000: { code: "400", message: "Invalid Waste request" },
  ERR_WASTE_00001: { code: "422", message: "Invalid Waste source reference" },
  ERR_WASTE_00002: {
    code: "422",
    message: "Waste acceptance rule rejected the submitted material",
  },
  ERR_WASTE_00003: {
    code: "409",
    message: "Invalid Waste submission lifecycle transition",
  },
  ERR_WASTE_00004: {
    code: "422",
    message: "Waste evidence is required by policy",
  },
  ERR_WASTE_00005: { code: "422", message: "Invalid Waste impact profile" },
  ERR_WASTE_00006: {
    code: "503",
    message: "Required Waste service is not available",
  },
  ERR_WASTE_ASSET_BUSY: { code: "409", message: "Asset busy" },
  ERR_WASTE_ASSET_CODE_REQUIRED: {
    code: "400",
    message: "Asset code required",
  },
  ERR_WASTE_ASSET_COUPON_REDEMPTION_STATE_INVALID: {
    code: "400",
    message: "Asset coupon redemption state invalid",
  },
  ERR_WASTE_ASSET_CREATION_NOT_ALLOWED: {
    code: "400",
    message: "Asset creation not allowed",
  },
  ERR_WASTE_ASSET_DONATION_NOT_PENDING: {
    code: "409",
    message: "Asset donation not pending",
  },
  ERR_WASTE_ASSET_DONATION_STATE_INVALID: {
    code: "400",
    message: "Asset donation state invalid",
  },
  ERR_WASTE_ASSET_GIFT_NOT_PENDING: {
    code: "409",
    message: "Asset gift not pending",
  },
  ERR_WASTE_ASSET_GIFT_STATE_INVALID: {
    code: "400",
    message: "Asset gift state invalid",
  },
  ERR_WASTE_ASSET_NOT_LISTED: { code: "400", message: "Asset not listed" },
  ERR_WASTE_ASSET_NOT_SOLD: { code: "400", message: "Asset not sold" },
  ERR_WASTE_ASSET_OWNER_MISMATCH: {
    code: "400",
    message: "Asset owner mismatch",
  },
  ERR_WASTE_ASSET_OWNER_REQUIRED: {
    code: "400",
    message: "Asset owner required",
  },
  ERR_WASTE_ASSET_POLICY_REQUIRED: {
    code: "400",
    message: "Asset policy required",
  },
  ERR_WASTE_ASSET_REDEMPTION_NOT_PENDING: {
    code: "409",
    message: "Asset redemption not pending",
  },
  ERR_WASTE_ASSET_REQUIRED: { code: "400", message: "Asset required" },
  ERR_WASTE_ASSET_SALE_NOT_PENDING: {
    code: "409",
    message: "Asset sale not pending",
  },
  ERR_WASTE_ASSET_SALE_STATE_INVALID: {
    code: "400",
    message: "Asset sale state invalid",
  },
  ERR_WASTE_ASSET_SELF_DONATION_FORBIDDEN: {
    code: "403",
    message: "Asset self donation forbidden",
  },
  ERR_WASTE_ASSET_SELF_GIFT_FORBIDDEN: {
    code: "403",
    message: "Asset self gift forbidden",
  },
  ERR_WASTE_ASSET_SELF_TRANSFER_FORBIDDEN: {
    code: "403",
    message: "Asset self transfer forbidden",
  },
  ERR_WASTE_ASSET_SETTLEMENT_REFERENCE_FAILED: {
    code: "400",
    message: "Asset settlement reference failed",
  },
  ERR_WASTE_ASSET_TYPE_REQUIRED: {
    code: "400",
    message: "Asset type required",
  },
  ERR_WASTE_COLLECTION_CENTRE_RUNTIME_TENANT_REQUIRED: {
    code: "400",
    message: "Collection centre runtime tenant required",
  },
  ERR_WASTE_COLLECTION_CENTRE_TENANT_FILTER_INVALID: {
    code: "400",
    message: "Collection centre tenant filter invalid",
  },
  ERR_WASTE_COLLECTION_NOT_ACCEPTED: {
    code: "400",
    message: "Collection not accepted",
  },
  ERR_WASTE_COLLECTION_POINT_REPOSITORY_REQUIRED: {
    code: "400",
    message: "Collection point repository required",
  },
  ERR_WASTE_COLLECTION_UNAVAILABLE: {
    code: "503",
    message: "Collection unavailable",
  },
  ERR_WASTE_COMMAND_CONFLICT: { code: "409", message: "Command conflict" },
  ERR_WASTE_COMMERCE_ORDER_REF_REQUIRED: {
    code: "400",
    message: "Commerce order ref required",
  },
  ERR_WASTE_COMMERCE_PROJECTION_REF_REQUIRED: {
    code: "400",
    message: "Commerce projection ref required",
  },
  ERR_WASTE_CONFIRMATION_REQUIRED: {
    code: "400",
    message: "Confirmation required",
  },
  ERR_WASTE_CONTEXT_REQUIRED: { code: "403", message: "Context required" },
  ERR_WASTE_COUPON_CUSTOMER_ENTITLEMENT_REQUIRED: {
    code: "400",
    message: "Coupon customer entitlement required",
  },
  ERR_WASTE_CUSTOMER_REQUIRED: { code: "403", message: "Customer required" },
  ERR_WASTE_DATA_CONTRIBUTION_DISABLED: {
    code: "400",
    message: "Data contribution disabled",
  },
  ERR_WASTE_DATA_CONTRIBUTION_EMPTY: {
    code: "400",
    message: "Data contribution empty",
  },
  ERR_WASTE_DATA_CONTRIBUTION_OPERATION: {
    code: "400",
    message: "Data contribution operation",
  },
  ERR_WASTE_DATA_CONTRIBUTION_QUERY: {
    code: "400",
    message: "Data contribution query",
  },
  ERR_WASTE_DATA_CONTRIBUTION_SCHEMA: {
    code: "400",
    message: "Data contribution schema",
  },
  ERR_WASTE_DATA_CONTRIBUTION_SCOPE: {
    code: "400",
    message: "Data contribution scope",
  },
  ERR_WASTE_DATA_LAYER_KIND: { code: "400", message: "Data layer kind" },
  ERR_WASTE_DATA_MANIFEST_DESTINATION: {
    code: "400",
    message: "Data manifest destination",
  },
  ERR_WASTE_DATA_MANIFEST_KIND: { code: "400", message: "Data manifest kind" },
  ERR_WASTE_DATA_MANIFEST_TYPE: { code: "400", message: "Data manifest type" },
  ERR_WASTE_DATA_RECORD_CODE: { code: "400", message: "Data record code" },
  ERR_WASTE_DATA_RECORD_FIELD: { code: "400", message: "Data record field" },
  ERR_WASTE_DONATION_COMPLIANCE_EVIDENCE_REF_REQUIRED: {
    code: "400",
    message: "Donation compliance evidence ref required",
  },
  ERR_WASTE_DONATION_MOVEMENT_REF_REQUIRED: {
    code: "400",
    message: "Donation movement ref required",
  },
  ERR_WASTE_DONATION_RECEIVER_MISMATCH: {
    code: "400",
    message: "Donation receiver mismatch",
  },
  ERR_WASTE_DONATION_TRANSFER_POLICY_REQUIRED: {
    code: "400",
    message: "Donation transfer policy required",
  },
  ERR_WASTE_EVIDENCE_INVALID: { code: "400", message: "Evidence invalid" },
  ERR_WASTE_EVIDENCE_REQUIRED: { code: "400", message: "Evidence required" },
  ERR_WASTE_GIFT_RECEIVER_MISMATCH: {
    code: "400",
    message: "Gift receiver mismatch",
  },
  ERR_WASTE_GIFT_TRANSFER_POLICY_REQUIRED: {
    code: "400",
    message: "Gift transfer policy required",
  },
  ERR_WASTE_IDEMPOTENCY_REQUIRED: {
    code: "400",
    message: "Idempotency required",
  },
  ERR_WASTE_IMPACT_CONFIGURATION_INVALID: {
    code: "400",
    message: "Impact configuration invalid",
  },
  ERR_WASTE_IMPACT_FORMULA_UNSUPPORTED: {
    code: "400",
    message: "Impact formula unsupported",
  },
  ERR_WASTE_IMPACT_INPUT_INVALID: {
    code: "400",
    message: "Impact input invalid",
  },
  ERR_WASTE_IMPACT_PROFILE_INVALID: {
    code: "400",
    message: "Impact profile invalid",
  },
  ERR_WASTE_IMPACT_PROVIDER_FAILED: {
    code: "400",
    message: "Impact provider failed",
  },
  ERR_WASTE_IMPACT_PROVIDER_RESULT_INVALID: {
    code: "400",
    message: "Impact provider result invalid",
  },
  ERR_WASTE_IMPACT_PROVIDER_TIMEOUT: {
    code: "400",
    message: "Impact provider timeout",
  },
  ERR_WASTE_IMPACT_PROVIDER_UNAVAILABLE: {
    code: "503",
    message: "Impact provider unavailable",
  },
  ERR_WASTE_INPUT_INVALID: { code: "400", message: "Input invalid" },
  ERR_WASTE_LOCATION_REQUIRED: { code: "400", message: "Location required" },
  ERR_WASTE_MARKETPLACE_CLOSE_STATUS_INVALID: {
    code: "400",
    message: "Marketplace close status invalid",
  },
  ERR_WASTE_MARKETPLACE_PROJECTION_MISMATCH: {
    code: "400",
    message: "Marketplace projection mismatch",
  },
  ERR_WASTE_MARKETPLACE_PROJECTION_NOT_ALLOWED: {
    code: "400",
    message: "Marketplace projection not allowed",
  },
  ERR_WASTE_MARKETPLACE_PROJECTION_NOT_LISTED: {
    code: "400",
    message: "Marketplace projection not listed",
  },
  ERR_WASTE_MARKETPLACE_PROJECTION_REQUIRED: {
    code: "400",
    message: "Marketplace projection required",
  },
  ERR_WASTE_MARKETPLACE_PROJECTION_SALE_NOT_PENDING: {
    code: "409",
    message: "Marketplace projection sale not pending",
  },
  ERR_WASTE_MARKETPLACE_PROJECTION_SALE_STATE_INVALID: {
    code: "400",
    message: "Marketplace projection sale state invalid",
  },
  ERR_WASTE_ITEM_UNSUPPORTED: {
    code: "400",
    message: "About your item",
  },
  ERR_WASTE_RECOGNITION_INVALID: {
    code: "400",
    message: "Recognition invalid",
  },
  ERR_WASTE_RECOGNITION_UNAVAILABLE: {
    code: "503",
    message: "Recognition unavailable",
  },
  ERR_WASTE_RECORD_NOT_FOUND: { code: "404", message: "Record not found" },
  ERR_WASTE_REDEMPTION_TRANSFER_POLICY_REQUIRED: {
    code: "400",
    message: "Redemption transfer policy required",
  },
  ERR_WASTE_MANUAL_APPROVAL_REQUIRED: { code: "403", message: "Manual approval required" },
  ERR_WASTE_EVIDENCE_ACKNOWLEDGEMENT_REQUIRED: { code: "400", message: "Evidence acknowledgement required" },
  ERR_WASTE_REVIEW_CONFIRMATION_REQUIRED: {
    code: "400",
    message: "Review confirmation required",
  },
  ERR_WASTE_REVIEW_CONFLICT: { code: "409", message: "Review conflict" },
  ERR_WASTE_REVIEW_FORBIDDEN: { code: "403", message: "Review forbidden" },
  ERR_WASTE_REVIEW_REASON_REQUIRED: {
    code: "400",
    message: "Review reason required",
  },
  ERR_WASTE_REVISION_CONFLICT: { code: "409", message: "Revision conflict" },
  ERR_WASTE_RUNTIME_UNAVAILABLE: {
    code: "503",
    message: "Runtime unavailable",
  },
  ERR_WASTE_SALE_REVERSAL_NOT_ALLOWED: {
    code: "400",
    message: "Sale reversal not allowed",
  },
  ERR_WASTE_SALE_TRANSFER_POLICY_REQUIRED: {
    code: "400",
    message: "Sale transfer policy required",
  },
  ERR_WASTE_SELF_TRANSFER: { code: "400", message: "Self transfer" },
  ERR_WASTE_SOURCE_REFERENCE_INVALID: {
    code: "400",
    message: "Source reference invalid",
  },
  ERR_WASTE_SUBMISSION_CODE_REQUIRED: {
    code: "400",
    message: "Submission code required",
  },
  ERR_WASTE_SUBMISSION_IMMUTABLE: {
    code: "409",
    message: "Submission immutable",
  },
  ERR_WASTE_SUBMISSION_STATUS_INVALID: {
    code: "400",
    message: "Submission status invalid",
  },
  ERR_WASTE_SUBMISSION_TRANSITION_INVALID: {
    code: "400",
    message: "Submission transition invalid",
  },
  ERR_WASTE_TAXONOMY_INVALID: { code: "400", message: "Taxonomy invalid" },
  ERR_WASTE_TRANSFER_CONFLICT: { code: "409", message: "Transfer conflict" },
  ERR_WASTE_TRANSFER_NOT_FOUND: { code: "404", message: "Transfer not found" },
};

/** Assessment commands preserve explicit intent and immutable prior results. */
Object.assign(module.exports, {
  ERR_WASTE_IMPACT_COMMAND_INVALID: { code: '400', message: 'Review the assessment details and confirm a valid command' },
  ERR_WASTE_IMPACT_CONFLICT: { code: '409', message: 'Assessment state changed or a pending command needs recovery' }
});
