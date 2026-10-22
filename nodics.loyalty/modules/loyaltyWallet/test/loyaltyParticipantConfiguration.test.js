/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/**
 * @module loyaltyWallet/test/loyaltyParticipantConfiguration
 * @description Verifies inherited Profile transport settings, intentional overrides and pre-RPC rejection using isolated configuration/transport doubles. Node assertions report failures; globals are restored after each case. No live calls or exports.
 * @owner loyaltyWallet
 * @layer test
 * @override Extend cases from owning properties, never recreate production defaults in fixtures.
 */
const test = require("node:test"), assert = require("node:assert/strict");
const participant = require("../src/service/defaultLoyaltyParticipantService");
/** Isolates owner configuration and captures RPC arguments; cleanup restores the original globals. */
function fixture(t) {
  const before = { CONFIG: global.CONFIG, SERVICE: global.SERVICE };
  t.after(() => Object.assign(global, before));
  const policy = structuredClone(require("../config/properties").loyalty), calls = [];
  global.CONFIG = { get: () => policy };
  global.SERVICE = { DefaultModuleService: { invokeModule: async input => { calls.push(input); return { data: { confirmed: true } }; } } };
  const subject = { ...participant, fail() { throw Error("Invalid Profile configuration"); } };
  return { policy: policy.transfers, calls, call: () => subject.profile({ tenant: "T", authorization: "Bearer original" }, "/customer/identity", "E") };
}
test("Wallet inherits complete Profile transport from its owner and preserves intentional timeout/topology overrides", async t => {
  const f = fixture(t);
  await f.call();
  assert.equal(f.calls[0].timeoutMs, f.policy.identityTimeoutMs);
  for (const [key, value] of Object.entries(f.policy.identityTarget)) assert.deepEqual(f.calls[0][key], value);
  f.policy.identityTimeoutMs = 20000;
  f.policy.identityTarget.connectionName = "selected-profile";
  f.policy.identityTarget.targetAuthority = { server: "selected-platform" };
  await f.call();
  assert.equal(f.calls[1].connectionName, "selected-profile");
  assert.equal(f.calls[1].timeoutMs, 20000);
  assert.deepEqual(f.calls[1].targetAuthority, { server: "selected-platform" });
  assert.deepEqual(f.calls[1].header, { Authorization: "Bearer original", "X-Enterprise-Code": "E" });
});
test("Wallet rejects incomplete/invalid transport values before invoking Profile", async t => {
  const f = fixture(t), baseline = structuredClone(f.policy);
  for (const mutate of [p => delete p.identityTarget, p => delete p.validation,
    ...[0, -1, 1.5, "1000", NaN, Infinity, Number.MAX_SAFE_INTEGER].map(v => p => { p.identityTimeoutMs = v; }),
    p => { p.identityTarget.maxAttempts = 0; }, p => { p.identityTarget.maxAttempts = 2; },
    p => { p.identityTarget.connectionName = ""; }, p => { p.identityTarget.targetAuthority = {}; },
    p => { p.identityTarget.moduleName = "foreign"; }, p => { p.validation.identityTimeoutMs.maximum = 0; }]) {
    Object.keys(f.policy).forEach(k => delete f.policy[k]); Object.assign(f.policy, structuredClone(baseline));
    mutate(f.policy); await assert.rejects(f.call(), /configuration/);
  }
  assert.equal(f.calls.length, 0);
});
