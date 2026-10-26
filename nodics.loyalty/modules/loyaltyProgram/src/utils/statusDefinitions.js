/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
/** @module loyaltyProgram/statusDefinitions @description Private-safe targeted administration refusals. @owner loyaltyProgram @layer utility */
module.exports = {
  ERR_LOYALTY_PROGRAM_INVALID: { code: "400", message: "Invalid Program eligibility command" },
  ERR_LOYALTY_PROGRAM_FORBIDDEN: { code: "403", message: "Program administration is not authorized" },
  ERR_LOYALTY_PROGRAM_NOT_FOUND: { code: "404", message: "Eligible Program or reward type was not found" },
  ERR_LOYALTY_PROGRAM_CONFLICT: { code: "409", message: "Program eligibility changed; read the current revision" },
  ERR_LOYALTY_PROGRAM_UNAVAILABLE: { code: "503", message: "Qualified Program administration is unavailable" },
};
