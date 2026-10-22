/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @module loyaltyWallet/utils/statusDefinitions @description Stable participant and transfer refusals. @layer utils @owner loyaltyWallet */
module.exports = {
  ERR_LOYALTY_AUCTION_CONFIGURATION: { code: "503", message: "Auction funds configuration is unavailable" },
  ERR_LOYALTY_AUCTION_FORBIDDEN: { code: "403", message: "Auction funds operation is not authorized" },
  ERR_LOYALTY_AUCTION_PERSISTENCE: { code: "503", message: "Auction funds evidence could not be confirmed" },
  ERR_LOYALTY_AUCTION_FUNDING: { code: "409", message: "Auction funding is not eligible" },
  ERR_LOYALTY_AUCTION_TRANSACTION: { code: "503", message: "Atomic auction accounting is unavailable" },
  ERR_LOYALTY_AUCTION_IDEMPOTENCY: { code: "409", message: "Auction funds command conflicts with its original intent" },
  ERR_LOYALTY_AUCTION_RESERVATION: { code: "409", message: "Auction funds reservation is not eligible" },
  ERR_LOYALTY_TEST_CREDIT_UNAVAILABLE: { code: "503", message: "Enterprise test credit is unavailable" },
  ERR_LOYALTY_TEST_CREDIT_INVALID: { code: "400", message: "Invalid Enterprise test-credit command" },
  ERR_LOYALTY_TEST_CREDIT_FORBIDDEN: { code: "403", message: "Enterprise test credit is not authorized" },
  ERR_LOYALTY_TEST_CREDIT_INELIGIBLE: { code: "409", message: "Enterprise test-credit target is not eligible" },
  ERR_LOYALTY_TEST_CREDIT_CONFLICT: { code: "409", message: "Enterprise test-credit evidence conflicts" },
  ERR_LOYALTY_PARTICIPANT: { code: "403", message: "Loyalty participant is not authorized" },
  ERR_LOYALTY_TRANSFER: { code: "409", message: "Reward transfer could not be confirmed" },
  ERR_LOYALTY_CONVERSION_UNAVAILABLE: { code: "503", message: "Reward conversion is unavailable" },
  ERR_LOYALTY_CONVERSION_INVALID: { code: "400", message: "Invalid reward conversion command" },
  ERR_LOYALTY_CONVERSION_FORBIDDEN: { code: "403", message: "Reward conversion is not authorized" },
  ERR_LOYALTY_CONVERSION_NOT_FOUND: { code: "404", message: "Reward conversion evidence was not found" },
  ERR_LOYALTY_CONVERSION_CONFLICT: { code: "409", message: "Reward conversion state changed" },
  ERR_LOYALTY_CONVERSION_INELIGIBLE: { code: "409", message: "Reward conversion is not eligible" },
  ERR_LOYALTY_CONVERSION_PROVIDER: { code: "503", message: "Partner outcome could not be confirmed" },
  ERR_LOYALTY_CONVERSION_PERSISTENCE: { code: "503", message: "Reward conversion evidence could not be confirmed" },
};
