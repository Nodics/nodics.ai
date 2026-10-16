/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module eWaste/utils/reviewDiagnostics @description Static registered review-stage diagnostics; never copies dependency messages, causes, credentials or provider bodies. @layer utility @owner eWaste */
const statuses = {
  ERR_EWASTE_REWARD_RECOVERY_TERMS_REQUIRED: {
    code: "409",
    message: "The saved assessment does not pin its original Loyalty programme and reward scale. Recovery cannot substitute current configuration.",
  },
  ERR_EWASTE_REWARD_RECOVERY_NOT_FOUND: {
    code: "409",
    message: "No original confirmed reward assessment was found. Approval is preserved; settlement cannot continue without original evidence.",
  },
  ERR_EWASTE_REWARD_RECOVERY_CONFLICT: {
    code: "409",
    message: "Saved reward evidence is ambiguous, incomplete or does not match the original approval. No replacement reward was calculated.",
  },
  ERR_EWASTE_REWARD_ASSESSMENT_REQUIRED: {
    code: "409",
    message:
      "Approval is saved. Confirmed reward evidence needs owner recovery before settlement can continue.",
  },
  ERR_EWASTE_REWARD_ASSESSMENT_UNCONFIRMED: {
    code: "503",
    message:
      "Approval is saved. Confirmed reward assessment could not be verified; owner recovery is required.",
  },
  ERR_EWASTE_REWARD_ASSESSMENT_CONFLICT: {
    code: "409",
    message:
      "Confirmed reward evidence does not match this asset. Owner review is required.",
  },
  ERR_EWASTE_REWARD_SETTLEMENT_CONFLICT: {
    code: "409",
    message:
      "Completed settlement is bound to different confirmed evidence. Owner review is required.",
  },
  ERR_EWASTE_REWARD_OUTCOME_INVALID: {
    code: "409",
    message:
      "The confirmed reward outcome needs owner review before settlement.",
  },
  ERR_EWASTE_REWARD_SETTLEMENT_INVALID: {
    code: "503",
    message:
      "Loyalty settlement evidence could not be verified. Preserve the original settlement reference.",
  },
  ERR_EWASTE_REWARD_SETTLEMENT_UNCONFIRMED: {
    code: "503",
    message:
      "Approval and confirmed reward evidence are saved. Original settlement needs explicit recovery.",
  },
  ERR_EWASTE_OUTCOME_ADMISSION_REQUIRED: {
    code: "403",
    message:
      "Decision saved. Notification service admission needs administrator review.",
  },
  ERR_EWASTE_OUTCOME_COMMAND_INVALID: {
    code: "400",
    message:
      "Decision saved. The original notification command needs owner review.",
  },
  ERR_EWASTE_OUTCOME_STORAGE_UNCONFIRMED: {
    code: "503",
    message:
      "Decision saved. Notification owner evidence could not be verified; delivery is not confirmed.",
  },
  ERR_EWASTE_OUTCOME_DISPATCH_UNCONFIRMED: {
    code: "503",
    message:
      "Decision saved. Notification dispatch could not be confirmed. Preserve the original command.",
  },
  ERR_EWASTE_OUTCOME_ACKNOWLEDGEMENT_UNCONFIRMED: {
    code: "503",
    message:
      "Decision saved. Notification acknowledgement could not be verified; delivery is not confirmed.",
  },
  ERR_EWASTE_OUTCOME_LINK_CONFIGURATION: {
    code: "503",
    message:
      "Decision saved. The notification detail link needs administrator configuration.",
  },
};
module.exports = {
  statuses,
  recoveryChecks: {
    SOURCE_TENANT: ["SOURCE_ADMISSION", "Authenticated source tenant evidence does not match."],
    SOURCE_REVISION: ["SOURCE_ADMISSION", "The inspected submission revision changed."],
    SOURCE_HUMAN: ["SOURCE_ADMISSION", "Recovery requires an authenticated human reviewer."],
    SOURCE_APPROVAL: ["SOURCE_ADMISSION", "The source is not the requested active approved submission."],
    SOURCE_ASSET: ["SOURCE_ADMISSION", "The active asset does not match the approved submission."],
    SOURCE_VERIFICATION: ["SOURCE_ADMISSION", "The source and asset verification references do not match."],
    SOURCE_OWNER: ["SOURCE_ADMISSION", "The asset owner does not match the original submitting customer."],
    SOURCE_REFERENCE_PRESENT: ["SOURCE_ADMISSION", "An assessment reference is already present; missing-reference recovery cannot replace it."],
    SOURCE_SETTLEMENT_STATE: ["SOURCE_ADMISSION", "The asset is not in the pending-settlement state."],
    SOURCE_SETTLEMENT_EVIDENCE: ["SOURCE_ADMISSION", "Prior settlement, ledger or recovery evidence already exists."],
    SOURCE_SETTLEMENT_INTENT: ["SOURCE_ADMISSION", "Settlement references are not unchanged canonical asset-creation intents."],
    SOURCE_CREATION_READ: ["SOURCE_ADMISSION", "One original asset-creation event could not be verified."],
    SOURCE_CREATION_BINDING: ["SOURCE_ADMISSION", "The original asset-creation event does not match the pending settlement intent."],
    ASSESSMENT_READ: ["ASSESSMENT_LOOKUP", "The bounded saved-assessment read could not be verified."],
    ASSESSMENT_ABSENT: ["ASSESSMENT_LOOKUP", "No original confirmed assessment matches the submission and asset."],
    ASSESSMENT_MULTIPLE: ["MULTIPLE_ASSESSMENTS", "More than one confirmed assessment matches the submission and asset."],
    ASSESSMENT_TENANT: ["ASSESSMENT_BINDING", "The saved assessment tenant evidence does not match."],
    APPROVAL_READ: ["APPROVAL_BINDING", "The original approved verification could not be uniquely read."],
    APPROVAL_TENANT: ["APPROVAL_BINDING", "The original verification tenant evidence does not match."],
    APPROVAL_COMMAND: ["APPROVAL_BINDING", "The original approved command, revision, key or digest is missing."],
    APPROVAL_DIGEST: ["APPROVAL_BINDING", "The original review command digest does not match."],
    APPROVAL_DECISION: ["APPROVAL_BINDING", "The saved verification is not the active original approval."],
    APPROVAL_ACTOR: ["APPROVAL_BINDING", "The original verification and review actor references do not match."],
    ASSESSMENT_IDENTITY: ["ASSESSMENT_BINDING", "The assessment stage, immutable revision, submission or asset does not match."],
    ASSESSMENT_VERIFICATION: ["ASSESSMENT_BINDING", "The assessment does not bind the original verification."],
    ASSESSMENT_IMPACT: ["ASSESSMENT_BINDING", "The assessment does not bind the original impact reference."],
    ASSESSMENT_REVISION: ["ASSESSMENT_BINDING", "The assessment source revision is outside the original approval bounds."],
    INPUT_SOURCE: ["INPUT_SNAPSHOT", "The saved input identity, stage or revision does not match the assessment."],
    INPUT_VERIFICATION: ["INPUT_SNAPSHOT", "The normalized input does not contain the original approved verification."],
    ASSESSMENT_KEY: ["ASSESSMENT_BINDING", "The assessment idempotency key does not match the original review."],
    POLICY_PINS: ["ASSESSMENT_BINDING", "Original policy, band or catalogue version evidence is incomplete."],
    ASSESSMENT_CODE: ["ASSESSMENT_BINDING", "The assessment identity does not match its saved original policy and revision."],
    ASSESSMENT_TIME: ["ASSESSMENT_BINDING", "Original assessment and review timestamps are missing or out of order."],
    ORIGINAL_FACTS: ["ORIGINAL_FACTS", "Saved reviewed facts do not match the original verification facts."],
    INPUT_FACTS: ["ORIGINAL_FACTS", "Normalized assessment facts do not match the original reviewed facts."],
    SAVED_SUMMARY: ["ASSESSMENT_BINDING", "The asset reward summary points to different assessment evidence."],
    EVALUATION_SHAPE: ["HASH", "Saved evaluation structure, scores or hash format is incomplete or inconsistent."],
    EVALUATION_HASH: ["HASH", "The saved evaluation hash or matched-rule evidence does not match."],
    EVALUATION_OUTCOME: ["HASH", "The saved reward amount or type does not match the exact evaluated outcome."],
    SETTLEMENT_TERMS: ["SETTLEMENT_TERMS", "Original settlement programme and scale evidence is missing or inconsistent."],
  },
  /** Adds only registered fixed qualification checks to an authorized read-only recovery diagnosis. */
  savedRewardRecovery: function (error) {
    const diagnostic = this.reward("REWARD_ASSESSMENT", error);
    const check = error?.rewardRecoveryCheck;
    if (typeof check !== "string" || !Object.hasOwn(this.recoveryChecks, check)) return diagnostic;
    const [qualificationStage, message] = this.recoveryChecks[check];
    return { ...diagnostic, qualificationStage, qualificationCheck: check,
      message: diagnostic.message + " " + message };
  },
  /** Projects only registered static text and a fixed stage, never an error object. */
  project: function (code, stage, retryAllowed = false) {
    return { code, stage, message: statuses[code].message, retryAllowed };
  },
  /** Classifies reward failures without evaluating Rules or changing confirmed evidence. */
  reward: function (stage, error) {
    const code =
      Object.hasOwn(statuses, error?.code) &&
      error.code.startsWith("ERR_EWASTE_REWARD_")
        ? error.code
        : stage === "REWARD_ASSESSMENT"
          ? "ERR_EWASTE_REWARD_ASSESSMENT_UNCONFIRMED"
          : "ERR_EWASTE_REWARD_SETTLEMENT_UNCONFIRMED";
    return this.project(
      code,
      stage,
      stage === "REWARD_SETTLEMENT" &&
        [
          "ERR_EWASTE_REWARD_SETTLEMENT_UNCONFIRMED",
          "ERR_EWASTE_REWARD_SETTLEMENT_INVALID",
        ].includes(code),
    );
  },
  /** Maps only canonical owner codes or the locally known gate; unknown transport causes stay undisclosed. */
  outcome: function (stage, error) {
    const known = {
      ERR_COMMS_INTEGRATION_CONTEXT: "ERR_EWASTE_OUTCOME_ADMISSION_REQUIRED",
      ERR_COMMS_INTEGRATION_INPUT: "ERR_EWASTE_OUTCOME_COMMAND_INVALID",
      ERR_COMMS_INTEGRATION_STORAGE: "ERR_EWASTE_OUTCOME_STORAGE_UNCONFIRMED",
    };
    const code =
      (Object.hasOwn(known, error?.code) ? known[error.code] : undefined) ||
      (stage === "LINK_CONFIGURATION"
        ? "ERR_EWASTE_OUTCOME_LINK_CONFIGURATION"
        : stage === "ACKNOWLEDGEMENT"
          ? "ERR_EWASTE_OUTCOME_ACKNOWLEDGEMENT_UNCONFIRMED"
          : "ERR_EWASTE_OUTCOME_DISPATCH_UNCONFIRMED");
    const ownerStage = {
      ERR_COMMS_INTEGRATION_CONTEXT: "ADMISSION",
      ERR_COMMS_INTEGRATION_INPUT: "COMMAND",
      ERR_COMMS_INTEGRATION_STORAGE: "OWNER_STORAGE",
    };
    return this.project(
      code,
      Object.hasOwn(ownerStage, error?.code) ? ownerStage[error.code] : stage,
    );
  },
};
