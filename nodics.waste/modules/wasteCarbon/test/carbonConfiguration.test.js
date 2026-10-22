/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/**
 * @module wasteCarbon/test/carbonConfiguration
 * @description Exercises owner-source numeric ranges and partial intentional overrides against the real settings consumer. Restores isolated CONFIG after assertion-based tests; no persistence, provider calls or exports.
 * @owner wasteCarbon
 * @layer test
 * @override Add boundary cases using the owning properties; do not define fallback capability settings in customer fixtures.
 */
const test = require("node:test"), assert = require("node:assert/strict");
const owner = require("../src/service/defaultWasteCarbonHoldingService");
test("Carbon inherits complete owner defaults and range overrides without customer definitions", t => {
  const before = global.CONFIG; t.after(() => { global.CONFIG = before; });
  let values = {};
  global.CONFIG = { get: () => values };
  const subject = { ...owner, fail() { throw Error("Invalid carbon configuration"); } }, request = { tenant: "T" };
  const defaults = require("../config/properties").wasteCarbon;
  assert.deepEqual(subject.settings(request).limits, defaults.limits);
  values = { limits: { pageSize: 12, quantityDigits: 120 }, validation: { quantityDigits: { maximum: 150 } } };
  assert.equal(subject.settings(request).limits.pageSize, 12);
  assert.equal(subject.settings(request).limits.quantityDigits, 120);
  assert.equal(subject.settings(request).limits.operationsPerLot, defaults.limits.operationsPerLot);
  for (const [key, value] of Object.entries(defaults.limits)) {
    for (const invalid of [-1, 1.5, "1", NaN, Infinity, Number.MAX_SAFE_INTEGER, null, undefined]) {
      values = { limits: { [key]: invalid } }; assert.throws(() => subject.settings(request), /configuration/);
    }
    values = { limits: { [key]: value } }; subject.settings(request);
  }
  for (const range of [null, { maximum: 0 }, { minimum: 0 }, { maximum: NaN }]) {
    values = { validation: { operationalLimit: range } }; assert.throws(() => subject.settings(request), /configuration/);
  }
  for (const key of ['limits', 'validation', 'profile']) {
    values = { [key]: null }; assert.throws(() => subject.settings(request), /configuration/);
  }
});
test("Carbon delegates decimal mechanics and retains exact fixed-scale quantities", t => {
  const before = global.CONFIG; t.after(() => { global.CONFIG = before; });
  global.CONFIG = { get: () => ({}) };
  const base = require("../../../../nodics.foundation/modules/nCommon/src/utils/exactAmount");
  let parses = 0, formats = 0;
  const subject = { ...owner, fail() { throw Error("Invalid carbon quantity"); },
    amount() { return { ...base,
      parse(value) { parses++; return base.parse(value); },
      format(value, scale) { formats++; return base.format(value, scale); }
    }; }
  };
  const settings = subject.settings({ tenant: "T" });
  for (const [input, scale, units, wire] of [
    ["0", 3, 0n, "0.000"], ["1.25", 3, 1250n, "1.250"],
    ["12345678901234567890.12345678", 8, 1234567890123456789012345678n, "12345678901234567890.12345678"],
    ["12", 0, 12n, "12"]
  ]) {
    assert.equal(subject.minor(input, scale, settings), units);
    assert.equal(subject.decimal(units, scale), wire);
  }
  assert.equal(parses, 4); assert.equal(formats, 4);
  for (const value of ["01", "-1", "1e2", " 1", "1.", "0.0001"])
    assert.throws(() => subject.minor(value, 3, settings), /Invalid carbon quantity/);
});
