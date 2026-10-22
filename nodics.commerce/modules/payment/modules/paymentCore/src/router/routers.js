/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module paymentCore/router/routers @description Declares the protected exact Payment evidence API. @layer router @owner paymentCore */
module.exports = { paymentCore: { evidence: {
    query: {
        secured: true,
        authTokenTypes: ["service"],
        accessGroups: ["serviceAccountUserGroup"],
        permission: "commerce.payment.read",
        apiExposure: "moduleInternal",
        key: "/internal/evidence/query",
        method: "POST",
        controller: "DefaultPaymentReadEvidenceController",
        operation: "query",
        requestPrivacy: { sensitive: true },
        cache: { enabled: false },
    },
} } };
