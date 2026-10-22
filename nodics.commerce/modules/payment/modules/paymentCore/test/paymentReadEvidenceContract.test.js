/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const owner = require("../src/service/defaultPaymentReadEvidenceService");
const routes = require("../src/router/routers").paymentCore.evidence;

test("Payment evidence reads one exact journey and returns only bounded safe fields", async t => {
    const previous = Object.fromEntries(["SERVICE"].map(key => [key, global[key]]));
    t.after(() => { for (const [key, value] of Object.entries(previous)) if (value === undefined) delete global[key]; else global[key] = value; });
    const auth = { tenant: "default", entCode: "default", principalType: "service", isSystem: false,
        permissions: ["commerce.payment.read"] };
    global.SERVICE = {
        DefaultLoggerService: { hasPrivateCaptureProtection: () => true },
        DefaultServiceTokenService: { requireRuntimePrincipal: request => request.authData },
        DefaultPaymentTransactionEntryService: { get: async input => ({ code: "SUC_TEST", count: 2, result: [
            { tenant: "default", enterpriseCode: "merchant", ownerId: "customer", orderCode: "order", cartCode: "cart",
                code: "authorize", status: "AUTHORIZED", totalAmount: "2.00", correlationId: "correlation",
                evidence: { operation: "AUTHORIZE", methodCode: "LOYALTY_REWARD", providerCode: "loyalty-reward-points", providerReference: "reservation", walletCode: "wallet", programCode: "circa", rewardTypeCode: "points" } },
            { tenant: "default", enterpriseCode: "merchant", ownerId: "customer", orderCode: "order", cartCode: "cart",
                code: "capture", status: "CAPTURED", totalAmount: "2.00", correlationId: "correlation",
                evidence: { operation: "CAPTURE", methodCode: "LOYALTY_REWARD", providerCode: "loyalty-reward-points", providerReference: "redemption", walletCode: "wallet", programCode: "circa", rewardTypeCode: "points" } },
        ] }) },
    };
    const request = { tenant: "default", authData: auth, payload: { orderCode: "order", cartCode: "cart", ownerId: "customer" }, query: {} };
    const result = await owner.query(request);
    assert.equal(result.contractVersion, 1);
    assert.deepEqual(result.transactions.map(row => [row.operation, row.status]), [["AUTHORIZE", "AUTHORIZED"], ["CAPTURE", "CAPTURED"]]);
    assert.equal(Object.hasOwn(result.transactions[0], "evidence"), false);
    assert.equal(routes.query.permission, "commerce.payment.read");
    assert.equal(routes.query.apiExposure, "moduleInternal");
});

test("Payment evidence refuses caller queries, human principals, ambiguity and foreign journey rows", async t => {
    const previous = Object.fromEntries(["SERVICE"].map(key => [key, global[key]]));
    t.after(() => { for (const [key, value] of Object.entries(previous)) if (value === undefined) delete global[key]; else global[key] = value; });
    const auth = { tenant: "default", entCode: "default", principalType: "service", isSystem: false,
        permissions: ["commerce.payment.read"] };
    let rows = [];
    global.SERVICE = {
        DefaultLoggerService: { hasPrivateCaptureProtection: () => true },
        DefaultServiceTokenService: { requireRuntimePrincipal: request => request.authData },
        DefaultPaymentTransactionEntryService: { get: async () => ({ code: "SUC_TEST", count: rows.length, result: rows }) },
    };
    const request = () => ({ tenant: "default", authData: structuredClone(auth), payload: { orderCode: "order", cartCode: "cart", ownerId: "customer" }, query: {} });
    await assert.rejects(owner.query(request()), /unavailable/);
    const human = request(); human.authData.principalType = "customer";
    await assert.rejects(owner.query(human), /unavailable/);
    const query = request(); query.query = { orderCode: "other" };
    await assert.rejects(owner.query(query), /unavailable/);
    rows = [{ tenant: "default", enterpriseCode: "merchant", ownerId: "other", orderCode: "order", cartCode: "cart", code: "capture",
        evidence: { operation: "CAPTURE", methodCode: "LOYALTY_REWARD", providerCode: "provider" } }];
    await assert.rejects(owner.query(request()), /unavailable/);
});
