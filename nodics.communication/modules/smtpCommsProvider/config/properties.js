/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module smtpCommsProvider/config/properties @description Defines secret-reference-only email sandbox defaults. @layer config @owner smtpCommsProvider */
module.exports = { smtpCommsProvider: { enabled: false, maturity: 'SANDBOX_CAPABLE', sandboxOnly: true, liveQualified: false, endpoint: '', credentialReference: '', senderReference: '', timeoutMilliseconds: 5000 } };
