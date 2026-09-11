/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module pricing/utils/statusDefinitions @description Declares stable negotiated-price validation failures. @layer config @owner pricing */
module.exports = { ERR_PRICE_QUOTE_INVALID: { code:"400", message:"The negotiated price is unavailable for this checkout" } };
