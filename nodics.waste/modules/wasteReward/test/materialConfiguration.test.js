/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
require("./runtimeEnums.js")();
/**
 * @module wasteReward/test/materialConfiguration
 * @description Verifies inherited numeric/transport contracts and exact amount/rational limits with the real material-value consumer. Node assertions report invalid admissions; isolated CONFIG is restored. No financial effects, provider calls or exports.
 * @owner wasteReward
 * @layer test
 * @override Extend owner-property override and rejection cases without copying production defaults.
 */
const test = require("node:test"), assert = require("node:assert/strict");
const owner = require("../src/service/defaultWasteMaterialValueAssessmentService");
test("Material value inherits owner defaults and validates range, amount and transport overrides", t => {
  const before = global.CONFIG; t.after(() => { global.CONFIG = before; });
  let values = {}; global.CONFIG = { get: () => values };
  const subject = { ...owner, fail() { throw Error("Invalid material configuration"); } }, r = { tenant: "T" };
  const defaults = require("../config/properties").wasteMaterialValue;
  assert.deepEqual(subject.settings(r).limits, defaults.limits);
  values = { limits: { decimalDigits: 110 }, validation: { decimalDigits: { maximum: 120 } } };
  assert.equal(subject.settings(r).limits.decimalDigits, 110);
  assert.deepEqual(subject.settings(r).loyalty, defaults.loyalty);
  for (const key of Object.keys(defaults.limits)) for (const invalid of [0, -1, 1.5, "1", NaN, Infinity, Number.MAX_SAFE_INTEGER, null, undefined]) {
    values = { limits: { [key]: invalid } }; assert.throws(() => subject.settings(r), /configuration/);
  }
  for (const invalid of [0, NaN, Number.MAX_SAFE_INTEGER]) {
    values = { loyalty: { timeoutMs: invalid } }; assert.throws(() => subject.settings(r), /configuration/);
  }
  values = { validation: { ratioDigits: { maximum: 2 }, amountScale: { maximum: 2 } } };
  const settings = subject.settings(r);
  assert.equal(subject.minor("1.25", 2, settings), 125n);
  assert.throws(() => subject.minor("1.250", 3, settings), /configuration/);
  assert.deepEqual(subject.ratio({ numerator: "1", denominator: "2" }, true, settings), { numerator: 1n, denominator: 2n });
  assert.throws(() => subject.ratio({ numerator: "100", denominator: "200" }, true, settings), /configuration/);
  values = { validation: { ratioDigits: null } }; assert.throws(() => subject.settings(r), /configuration/);
  for (const key of ['limits', 'validation', 'profile', 'loyalty']) {
    values = { [key]: null }; assert.throws(() => subject.settings(r), /configuration/);
  }
});
test("Material value reuses shared exact arithmetic through its effective accessor and preserves fixed-scale evidence", t => {
  const before = global.CONFIG;
  t.after(() => { global.CONFIG = before; });
  global.CONFIG = { get: () => ({}) };
  const base = require("../../../../nodics.foundation/modules/nCommon/src/utils/exactAmount");
  let parses = 0, formats = 0;
  const subject = { ...owner, store() { return require("../../wasteCore/src/service/defaultWastePersistenceService"); }, amount() { return { ...base,
    parse(value) { parses++; return base.parse.call(this, value); },
    format(value, scale) { formats++; return base.format.call(this, value, scale); }
  }; }, fail() { throw Error("Invalid material amount"); } };
  const settings = subject.settings({ tenant: "T" });
  for (const [value, scale, minor, wire] of [
    ["0001.20", 2, 120n, "1.20"], ["0", 2, 0n, "0.00"],
    ["12345678901234567890.12345678", 8, 1234567890123456789012345678n, "12345678901234567890.12345678"],
    ["12", 0, 12n, "12"]
  ]) {
    assert.equal(subject.minor(value, scale, settings), minor);
    assert.equal(subject.decimal(minor, scale), wire);
  }
  assert.equal(parses, 4); assert.equal(formats, 4);
  assert.throws(() => subject.minor("1.001", 2, settings), { code: "ERR_LOYALTY_AMOUNT_PRECISION" });
  for (const value of ["-1", "1e2", " 1", "1.", "NaN"])
    assert.throws(() => subject.minor(value, 2, settings), /material amount/);
  const customized = { ...subject, amount() { return { ...base, parse() { throw Error("custom arithmetic refusal"); } }; } };
  assert.throws(() => customized.minor("1", 2, settings), /custom arithmetic refusal/);
});
test("material rounding consumes effective owner vocabulary and refuses undeclared behavior", t => {
  const original = ENUMS.WasteMaterialRoundingMode;
  let reads = 0;
  global.ENUMS.WasteMaterialRoundingMode = { ...original,
    HALF_UP: { get key() { reads++; return original.HALF_UP.key; } },
    UP: { key: "UP" }
  };
  t.after(() => { global.ENUMS.WasteMaterialRoundingMode = original; });
  const subject = { ...owner, fail() { throw Error("Unsupported rounding"); } };
  assert.equal(subject.round(3n, 2n, "HALF_UP"), 2n);
  assert.equal(subject.round(3n, 2n, "DOWN"), 1n);
  assert.ok(reads > 0);
  assert.throws(() => subject.round(3n, 2n, "UP"), /Unsupported rounding/);
});
