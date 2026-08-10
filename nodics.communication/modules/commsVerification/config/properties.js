/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module commsVerification/config/properties @description Defines bounded verification challenge policy. @layer config @owner commsVerification @override Security and customer projects may impose stricter purpose policy. */
module.exports = { communicationVerification: { enabled: true, ttlSeconds: 600, maximumAttempts: 5, secretBytes: 6 } };
