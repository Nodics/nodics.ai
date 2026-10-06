/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module copilotKnowledge/src/utils/statusDefinitions
 * @description Status and error definition registry for this boundary.
 * @layer definition
 * @owner generated
 * @override Later active modules may extend or replace this registry through Nodics layering.
 */
module.exports = {
  ERR_CPK_00025: {
    code: "503",
    message:
      "Legacy knowledge migration or removal could not be confirmed. Inspect the original operation before any further action.",
  },
  ERR_CPK_00023: {
    code: "503",
    message: "Recorded source refresh review or inspection is unavailable",
  },
  ERR_CPK_00024: {
    code: "503",
    message: "Source refresh outcome requires original Process inspection",
  },
  ERR_CPK_00022: {
    code: "503",
    message: "Scoped knowledge maintenance receipts are unavailable.",
  },
  ERR_CPK_00021: {
    code: "503",
    message:
      "Source event refresh is unavailable or its Process outcome is unconfirmed.",
  },
  ERR_CPK_00020: {
    code: "503",
    message:
      "Pending refresh recovery could not be confirmed. Reload and inspect the original source before continuing.",
  },
  ERR_CPK_00019: {
    code: "503",
    message: "Current scoped knowledge readiness could not be verified.",
  },
  ERR_CPK_00018: {
    code: "503",
    message:
      "Knowledge cleanup could not be confirmed. Reload the inventory and review before another attempt.",
  },
  ERR_CPK_00017: {
    code: "503",
    message:
      "The governed knowledge refresh could not be confirmed. Inspect the Process instance before another attempt.",
  },
  ERR_CPK_00016: {
    code: "503",
    message: "Live collection data is unavailable.",
  },
  ERR_CPK_00015: {
    code: "503",
    message: "Scoped incident evidence is unavailable.",
  },
  ERR_CPK_00013: {
    code: "503",
    message: "Knowledge group configuration is unavailable.",
  },
  ERR_CPK_00014: {
    code: "403",
    message: "The selected knowledge context is unavailable.",
  },
  ERR_CPK_00000: {
    code: "400",
    message: "The Copilot knowledge source definition is invalid.",
  },
  ERR_CPK_00001: {
    code: "409",
    message: "The Copilot knowledge source code is duplicated.",
  },
  ERR_CPK_00002: {
    code: "403",
    message:
      "The Copilot knowledge source is not available to this security context.",
  },
  ERR_CPK_00003: {
    code: "503",
    message: "The Copilot knowledge source registry is disabled.",
  },
  ERR_CPK_00004: {
    code: "403",
    message: "The Copilot knowledge ingestion operation is forbidden.",
  },
  ERR_CPK_00005: {
    code: "422",
    message: "The Copilot knowledge file was rejected by secret inspection.",
  },
  ERR_CPK_00006: {
    code: "413",
    message: "The Copilot knowledge source exceeded an ingestion bound.",
  },
  ERR_CPK_00007: {
    code: "400",
    message: "The Copilot knowledge query is invalid.",
  },
  ERR_CPK_00008: {
    code: "503",
    message: "The Copilot knowledge retrieval capability is disabled.",
  },
  ERR_CPK_00009: {
    code: "422",
    message: "The Copilot knowledge startup ingestion rejected files.",
  },
  ERR_CPK_00010: {
    code: "400",
    message: "The Copilot knowledge startup ingestion policy is invalid.",
  },
  ERR_CPK_00011: {
    code: "400",
    message: "The Copilot Knowledge Studio window is invalid.",
  },
  ERR_CPK_00012: {
    code: "503",
    message: "The Copilot knowledge source operation could not be completed.",
  },
};
