/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module loyaltyWallet/data/workspace/Component @description Governed presentation only, never wallet, policy or authority data. @layer data @owner loyaltyWallet */
module.exports = {
  "record0": {
    "functionalModule": "nodics.loyalty",
    "active": true,
    "code": "loyaltyParticipationWorkspaceCopy",
    "typeCode": "loyaltyParticipationCopyType",
    "accessMode": "AUTHENTICATED",
    "authoringScope": {
      "enterpriseCode": "default",
      "catalogCode": "axisContentCatalog",
      "siteCode": "axisCmsSite"
    },
    "properties": {
      "title": "Loyalty",
      "message": "",
      "walletTitle": "Wallet",
      "settingsTitle": "Transfer settings",
      "creditTitle": "Enterprise test credit",
      "load": "Load",
      "refresh": "Refresh",
      "unavailable": "Owner evidence is unavailable.",
      "emptyWallet": "No wallet exists for this participant.",
      "emptyBalances": "No reward balances.",
      "emptyEntries": "No recent ledger entries.",
      "owner": "Owner",
      "actor": "Actor",
      "walletCode": "Wallet code",
      "status": "Status",
      "programCode": "Program code",
      "rewardTypeCode": "Reward type code",
      "name": "Reward",
      "precision": "Precision",
      "available": "Available",
      "reserved": "Reserved",
      "earned": "Earned",
      "spent": "Spent",
      "expired": "Expired",
      "reversed": "Reversed",
      "transferEligible": "Transfer eligible",
      "transferFeeAmount": "Transfer fee",
      "ledger": "Recent ledger entries",
      "code": "Code",
      "entryType": "Entry type",
      "amount": "Amount",
      "sourceType": "Source type",
      "sourceCode": "Source code",
      "postedAt": "Posted at",
      "outgoingEnabled": "Outgoing transfers",
      "incomingEnabled": "Incoming transfers",
      "maximumAmount": "Maximum transfer amount",
      "maximumDailyAmount": "Maximum daily amount",
      "maximumDailyCount": "Maximum daily count",
      "inherited": "Inherited",
      "selected": "Selected",
      "inherit": "Use framework value",
      "enabled": "Enabled",
      "disabled": "Disabled",
      "noLimit": "No selected limit",
      "effective": "Effective policy",
      "selections": "Enterprise selections",
      "feeAmount": "Fee amount",
      "timeZone": "Time zone",
      "revision": "Revision",
      "review": "Review",
      "confirm": "Confirm",
      "cancel": "Cancel",
      "saved": "Selections confirmed.",
      "uncertain": "Outcome is unconfirmed. Retain this command and inspect or retry the same intent.",
      "inspect": "Inspect current selections",
      "retry": "Retry same command",
      "reason": "Reason",
      "idempotencyKey": "Command key",
      "recoverOriginal": "Recover original command",
      "testOnly": "Isolated test rewards only",
      "creditConfirmed": "Test credit receipt confirmed.",
      "newCredit": "New test credit",
      "operationCode": "Operation code",
      "ledgerEntryCode": "Ledger entry code",
      "creditedAt": "Credited at",
      "invalid": "Complete the selected values before review.",
      "conflict": "Selections changed. Review the current revision before saving.",
      "working": "Working",
      "policyWarning": "Framework limits and transaction qualification remain owner-enforced."
    }
  }
};
