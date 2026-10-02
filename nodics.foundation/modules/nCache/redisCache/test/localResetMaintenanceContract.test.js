/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @module redisCache/test/localResetMaintenanceContract @description Bounded exact-key reset fixtures using injected clients only, never real Redis. @owner nCache @layer test */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const owner = require("../src/service/maintenance/defaultRedisLocalResetMaintenanceService");
const namespace = "auth_acmeLocalRuntimeAuth_";
const options = () => ({ environment: "acmeLocal", namespace, exclusiveDeployment: true, writersExcluded: true,
  engine: { enabled: true, options: { prefix: "acmeLocalRuntimeAuth", host: "127.0.0.1", port: 6379 } } });
const fixture = (count = 2) => {
  const state = { keys: Array.from({ length: count }, (_, i) => namespace + "private" + i), deletes: [], closes: 0 };
  const client = { scan: async (cursor, input) => { assert.equal(input.MATCH, namespace + "*"); return { cursor: 0, keys: [...state.keys] }; },
    del: async keys => { state.deletes.push([...keys]); state.keys = state.keys.filter(key => !keys.includes(key)); return keys.length; },
    disconnect: async () => { state.closes++; } };
  return { state, client };
};
test("namespace, native endpoint, attestations, enabled engine and conflicting endpoint options refuse", () => {
  for (const change of [o => { o.exclusiveDeployment = false; }, o => { o.writersExcluded = false; }, o => { o.namespace = "auth_nodics_"; },
    o => { o.engine.enabled = false; }, o => { o.engine.options.host = "remote.example"; },
    o => { o.engine.options.sentinel = { enabled: true }; },
    o => { o.engine.options.url = "redis://localhost:6379"; }]) {
    const o = options(); change(o); assert.throws(() => owner.validate(o), /SCOPE_INVALID/);
  }
});
test("count-only inventory, unchanged reviewed key deletion and zero verification use exact batches", async () => {
  const f = fixture(202), held = owner.bind(options(), f.client);
  await assert.rejects(held.clear(), /INSPECTION_REQUIRED/);
  assert.deepEqual(await held.inspect(), { keyCount: 202 });
  assert.deepEqual(await held.clear(), { removedCount: 202 });
  assert.deepEqual(f.state.deletes.map(batch => batch.length), [100, 100, 2]);
  assert.deepEqual(await held.verifyEmpty(), { keyCount: 0 });
  await held.close(); await held.close(); assert.equal(f.state.closes, 1);
});
test("foreign key or bounded inventory overflow refuses without deletion", async () => {
  for (const count of [1, 1001]) {
    const f = fixture(count); if (count === 1) f.state.keys = ["auth_shared_private"];
    const held = owner.bind(options(), f.client);
    await assert.rejects(held.inspect()); assert.equal(f.state.deletes.length, 0);
  }
});
test("malformed cursor and cursor-cycle budget refuse without effects", async () => {
  for (const response of [{ cursor: "unknown", keys: [] }, { cursor: 1, keys: [] }]) {
    const f = fixture(); f.client.scan = async () => response;
    await assert.rejects(owner.bind(options(), f.client).inspect()); assert.equal(f.state.deletes.length, 0);
  }
});
test("keys added after review refuse rather than expanding deletion scope", async () => {
  const f = fixture(), held = owner.bind(options(), f.client);
  await held.inspect(); f.state.keys.push(namespace + "later");
  await assert.rejects(held.clear(), /NAMESPACE_CHANGED/); assert.equal(f.state.deletes.length, 0);
});
test("partial batch failure preserves acknowledged count and never returns keys or provider secrets", async () => {
  const f = fixture(150), held = owner.bind(options(), f.client);
  await held.inspect(); const original = f.client.del;
  f.client.del = async keys => { if (f.state.deletes.length) throw new Error("private key and credential"); return original(keys); };
  await assert.rejects(held.clear(), error => {
    assert.equal(error.removedCount, 100); assert.doesNotMatch(error.message, /private key|credential/); return true;
  });
  await assert.rejects(held.verifyEmpty(), /NOT_EMPTY/);
});

test("failed disconnect remains a failed cleanup outcome on every caller", async () => {
  const f = fixture();
  f.client.disconnect = async () => { f.state.closes++; throw new Error("private provider detail"); };
  const held = owner.bind(options(), f.client);
  await assert.rejects(held.close(), /RESET_REDIS_CLOSE_UNCONFIRMED/);
  await assert.rejects(held.close(), /RESET_REDIS_CLOSE_UNCONFIRMED/);
  assert.equal(f.state.closes, 1);
  await assert.rejects(held.inspect(), /RESET_REDIS_CLIENT_CLOSED/);
});

test("operation timeout awaits failed cleanup and retains its failure for final close", async () => {
  const f = fixture();
  f.client.scan = () => new Promise(() => {});
  f.client.disconnect = async () => { f.state.closes++; throw new Error("private provider detail"); };
  const held = owner.bind(options(), f.client);
  await assert.rejects(held.inspect(), error => {
    assert.equal(error.cleanupFailedCount, 1);
    assert.equal(error.message, "RESET_REDIS_OPERATION_UNCONFIRMED");
    return true;
  });
  await assert.rejects(held.close(), /RESET_REDIS_CLOSE_UNCONFIRMED/);
  assert.equal(f.state.closes, 1);
});
