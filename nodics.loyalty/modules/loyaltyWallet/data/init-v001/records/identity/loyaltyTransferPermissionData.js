/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module loyaltyWallet/data/transferPermissions @description Explicit transfer permission definitions, not role grants. @layer data @owner loyaltyWallet */
module.exports = {
  conversion: { code: "loyalty.partnerConversion.execute", name: "Convert eligible rewards through a qualified partner", active: true, ownerModule: "loyaltyWallet" },
  conversionRead: { code: "loyalty.partnerConversion.read", name: "Read and reconcile owned reward conversions", active: true, ownerModule: "loyaltyWallet" },
  transfer: { code: "loyalty.rewards.transfer", name: "Transfer eligible rewards", active: true, ownerModule: "loyaltyWallet" },
  manage: { code: "loyalty.transfers.manage", name: "Manage owner transfer selections", active: true, ownerModule: "loyaltyWallet" },
  testCredit: { code: "loyalty.wallet.testCredit", name: "Allocate isolated test rewards", active: true, ownerModule: "loyaltyWallet" },
};
