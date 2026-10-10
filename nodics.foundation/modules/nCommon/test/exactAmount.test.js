/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @module nCommon/test/exactAmount @description Exercises shared decimal arithmetic without active Commerce or framework globals. @layer test @owner nCommon */
const test = require("node:test"), assert = require("node:assert/strict");
const exact = require("../src/utils/exactAmount");
const pricing = require("../../../../nodics.commerce/modules/baseCommerce/modules/pricing/src/service/defaultExactAmountService");

test("shared decimal arithmetic is exact, policy-free and available without runtime services", () => {
    assert.equal(exact.add("0.1", "0.2"), "0.3");
    assert.equal(exact.add("9007199254740993.01", "0.09"), "9007199254740993.1");
    assert.equal(exact.multiply("300.00", "0.15"), "45");
    assert.equal(exact.compare("16", "16.00"), 0);
    assert.equal(exact.compare("-0.1", "0"), -1);
    assert.equal(exact.compare("100.01", "100"), 1);
    assert.equal(exact.normalize("-12.3400"), "-12.34");
    for (const value of [16, undefined, null, "", "1e3", "01", " 1", "+1", "1.", ".1", "NaN", "Infinity"])
        assert.throws(() => exact.parse(value), /canonical decimal string/);
});
test("Pricing preserves its operations without sharing a mutable service object", () => {
    assert.notEqual(pricing, exact);
    assert.deepEqual(Object.keys(pricing), Object.keys(exact));
    for (const name of Object.keys(exact)) assert.equal(pricing[name], exact[name]);
    let calls = 0;
    const custom = { ...pricing, parse(value) { calls++; return exact.parse(value); } };
    assert.equal(custom.add("1.5", "2.5"), "4");
    assert.equal(calls, 2);
    assert.equal(exact.add("1", "2"), "3");
});
