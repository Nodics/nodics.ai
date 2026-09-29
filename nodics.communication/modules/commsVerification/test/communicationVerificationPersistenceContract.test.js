/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module commsVerification/test/communicationVerificationPersistenceContract @description Tests actual verification members against an injected generated-service contract, including persistence failure and revision races. Not a live database/provider qualification. @layer test @owner commsVerification */
const test = require("node:test");
const assert = require("node:assert/strict");
const service = require("../src/service/defaultCommunicationVerificationService");
const configuration = require("../config/properties").communicationVerification;
const schema = require("../../commsSchema/src/schemas/schemas").commsSchema.commsVerificationChallenge;
const clone = value => JSON.parse(JSON.stringify(value));
let records, calls, clock, policy, owner, request, command, repository;
const codeIs = expected => error => error.code === expected;
const record = issue => records.get(request.tenant + ":" + issue.challengeCode);
function mutationQueryMatches(row, query) {
  return Object.entries(query).every(([key, value]) => {
    if (value && typeof value === "object" && "$gt" in value) return Date.parse(row[key]) > new Date(value.$gt).getTime();
    return row[key] === value;
  });
}
test.beforeEach(() => {
  records = new Map(); calls = []; clock = new Date("2026-09-29T08:00:00Z");
  policy = { ...configuration, ttlSeconds: 120, maximumAttempts: 2, secretBytes: 6,
    stored: { enabled: true, trustedSourceModules: ["testOwner"], proofTtlSeconds: 30, resendCooldownSeconds: 10, maximumIssues: 3 } };
  request = { tenant: "testTenant", authData: { tenant: "testTenant", principalType: "service", principalId: "testCaller", permissions: ["existing.owner.operation"] }, correlationId: "test-correlation" };
  command = { sourceModule: "testOwner", purpose: "EMPLOYEE_EMAIL", subjectReference: "pending-assignment-1", channel: "EMAIL", destination: "alex@example.test", bindingReference: "owner-authenticated-continuation-1" };
  const capture = (method, input) => {
    assert.equal(input.authData, request.authData, "Pass caller authorization through unchanged");
    assert.equal(input.tenant, request.tenant); calls.push({ method, input: clone(input) });
  };
  repository = {
    get: async input => {
      capture("get", input);
      assert.equal(input.options.skipItemCache, true);
      assert.equal(input.query.tenant, request.tenant);
      return { code: "SUC_TEST_READ", result: [...records.values()].filter(row => mutationQueryMatches(row, input.query)).map(clone) };
    },
    save: async input => {
      capture("save", input);
      assert.equal(input.options.upsert, false);
      const key = input.tenant + ":" + input.model.code;
      if (records.has(key)) throw Error("duplicate code");
      assert.equal(input.model.revision, 0, "Create uses the zero token; generated concurrency initializes revision one");
      const saved = { ...clone(input.model), revision: 1 };
      records.set(key, saved);
      return { code: "SUC_TEST_SAVE", result: [clone(saved)] };
    },
    update: async input => {
      capture("update", input);
      assert.equal(input.options.upsert, false);
      const key = input.tenant + ":" + input.query.code, row = records.get(key);
      if (!row || !mutationQueryMatches(row, input.query)) return { code: "SUC_TEST_UPDATE", result: { matchedCount: 0 } };
      assert.equal(input.model.revision, row.revision, "Generated concurrency owner allocates the next revision");
      records.set(key, { ...row, ...clone(input.model), revision: row.revision + 1 });
      return { code: "SUC_TEST_UPDATE", result: { matchedCount: 1 } };
    },
  };
  global.CONFIG = { get: key => key === "communicationVerification" ? policy : undefined };
  global.SERVICE = { DefaultCommsVerificationChallengeService: repository };
  delete global.CLASSES;
  owner = { ...service, now: () => new Date(clock) };
});
function advance(seconds) { clock = new Date(clock.getTime() + seconds * 1000); }
async function issue() { return owner.issueStored(request, command); }
async function verify(issued, secret = issued.secret, extra = {}) {
  return owner.verifyStored(request, { ...command, challengeCode: issued.challengeCode, generation: issued.generation, secret, ...extra });
}
async function consume(verified, extra = {}) {
  return owner.consumeStored(request, { ...command, challengeCode: verified.challengeCode, generation: verified.generation, proof: verified.proof, operationReference: "registration-command-1", ...extra });
}
async function replace(issued, extra = {}) {
  return owner.replaceStored(request, { ...command, challengeCode: issued.challengeCode, expectedRevision: record(issued).revision, ...extra });
}
function pureChallenge() { return owner.create({ ...command, tenant: request.tenant, secret: "test-secret", now: clock }, policy).challenge; }

test("legacy helper preserves valid digest, verification and immutable input", () => {
  const challenge = pureChallenge(), original = clone(challenge);
  assert.equal(owner.verify(challenge, "test-secret").status, "VERIFIED");
  assert.deepEqual(clone(challenge), original);
  assert.equal(owner.verify(challenge, "wrong").attempt, 1);
});
for (const expiry of [undefined, null, "invalid", "", Infinity]) {
  test("invalid expiry cannot verify: " + String(expiry), () => {
    assert.throws(() => owner.verify({ ...pureChallenge(), expiresAt: expiry }, "test-secret"), codeIs("ERR_COMMS_VERIFY_INPUT"));
  });
}
test("exact expiry boundary is expired", () => {
  const c = pureChallenge(); assert.equal(owner.verify(c, "test-secret", c.expiresAt).status, "EXPIRED");
});
test("exhausted attempts cannot be bypassed by a correct secret", () => {
  assert.equal(owner.verify({ ...pureChallenge(), attempt: 2 }, "test-secret").status, "LOCKED");
});
for (const malformed of ["broken", "abc:def", "a".repeat(32) + ":" + "f".repeat(63), "x".repeat(32) + ":" + "f".repeat(64)]) {
  test("malformed digest fails safely: " + malformed.slice(0, 12), () => {
    assert.throws(() => owner.verify({ ...pureChallenge(), secretHash: malformed }, "test-secret"), codeIs("ERR_COMMS_VERIFY_INPUT"));
  });
}
for (const patch of [{ ttlSeconds: 0 }, { ttlSeconds: Infinity }, { maximumAttempts: 1.5 }, { maximumAttempts: "5" }, { secretBytes: 1 }, { enabled: false }]) {
  test("unsafe policy rejected: " + JSON.stringify(patch), () => {
    assert.throws(() => owner.create({ ...command, tenant: request.tenant }, { ...policy, ...patch }), codeIs("ERR_COMMS_VERIFY_POLICY"));
  });
}
test("stored operations require explicit enablement and source policy", async () => {
  policy.stored = configuration.stored;
  await assert.rejects(issue(), codeIs("ERR_COMMS_VERIFY_POLICY")); assert.equal(calls.length, 0);
});
test("unknown source has no persistence or privilege fallback", async () => {
  command.sourceModule = "anotherOwner";
  await assert.rejects(issue(), codeIs("ERR_COMMS_VERIFY_POLICY")); assert.equal(calls.length, 0);
});
test("human or mismatched tenant context cannot call stored internals", async () => {
  request.authData.principalType = "human";
  await assert.rejects(issue(), codeIs("ERR_COMMS_VERIFY_CONTEXT"));
  request.authData.principalType = "service"; request.authData.tenant = "otherTenant";
  await assert.rejects(issue(), codeIs("ERR_COMMS_VERIFY_CONTEXT")); assert.equal(calls.length, 0);
});
test("missing generated store fails closed", async () => {
  delete global.SERVICE.DefaultCommsVerificationChallengeService;
  await assert.rejects(issue(), codeIs("ERR_COMMS_VERIFY_STORAGE"));
});
test("issue persists digest-only state once and never resends on retry", async () => {
  const a = await issue(), b = await issue(), stored = record(a);
  assert.match(a.challengeCode, /^CV_[a-f0-9]{64}$/); assert.equal(a.status, "PENDING");
  assert.equal(b.challengeCode, a.challengeCode); assert.equal(b.replayed, true); assert.equal(b.secret, undefined);
  assert.equal(records.size, 1); assert.equal(calls.filter(c => c.method === "save").length, 1);
  assert(!JSON.stringify(stored).includes(a.secret)); assert(!JSON.stringify(stored).includes(command.bindingReference));
  assert.equal(stored.destination, undefined); assert.equal(stored.proof, undefined);
});
test("stored issuance rejects caller-controlled secret and time", async () => {
  await assert.rejects(owner.issueStored(request, { ...command, secret: "chosen" }), codeIs("ERR_COMMS_VERIFY_INPUT"));
  await assert.rejects(owner.issueStored(request, { ...command, now: clock }), codeIs("ERR_COMMS_VERIFY_INPUT"));
  assert.equal(records.size, 0);
});
test("malformed or failure read envelope is not absence", async () => {
  for (const value of [undefined, {}, { result: {} }, { success: false, result: [] }, { code: "ERR_TEST", result: [] }]) {
    repository.get = async () => value; await assert.rejects(issue(), codeIs("ERR_COMMS_VERIFY_STORAGE"));
  }
  assert.equal(records.size, 0);
});
test("issue requires actual persisted readback, not a save acknowledgement", async () => {
  repository.save = async () => ({ code: "SUC_TEST_SAVE", result: { acknowledged: true } });
  await assert.rejects(issue(), codeIs("ERR_COMMS_VERIFY_STORAGE"));
});
test("concurrent issuance creates only one challenge and reveals only its committed code", async () => {
  const results = await Promise.allSettled([issue(), issue()]);
  assert.equal(results.filter(r => r.status === "fulfilled").length, 1);
  assert.equal(records.size, 1);
  const winner = results.find(r => r.status === "fulfilled").value;
  assert.equal((await verify(winner)).status, "VERIFIED");
});
test("bound verification persists failed attempts and locks across independent service objects", async () => {
  const a = await issue(); const result = await verify(a, "wrong");
  assert.equal(result.status, "PENDING"); assert.equal(record(a).attempt, 1);
  owner = { ...service, now: () => new Date(clock) };
  assert.equal((await verify(a, "wrong")).status, "LOCKED"); assert.equal(record(a).attempt, 2);
  await assert.rejects(verify(a), codeIs("ERR_COMMS_VERIFY_STATE"));
});
test("verification returns proof only after one committed VERIFIED transition", async () => {
  const a = await issue(), v = await verify(a), stored = record(a);
  assert.equal(v.status, "VERIFIED"); assert.match(v.proof, /^[a-f0-9]{64}$/); assert.equal(stored.status, "VERIFIED");
  assert.notEqual(v.proof, stored.proofHash); assert(!JSON.stringify(stored).includes(v.proof));
  assert.equal(v.secretHash, undefined); assert.equal(v.bindingHash, undefined); assert.equal(v.lastMutationId, undefined);
  await assert.rejects(verify(a), codeIs("ERR_COMMS_VERIFY_STATE"));
});
test("proof consumption is one-use and bound to a business command without executing that command", async () => {
  const a = await issue(), v = await verify(a), c = await consume(v);
  assert.equal(c.status, "CONSUMED"); assert.equal(record(a).proofHash, "");
  assert.match(record(a).consumedOperationHash, /^[a-f0-9]{64}$/);
  assert.equal(c.consumedOperationHash, undefined); assert.equal(c.proof, undefined);
  await assert.rejects(consume(v), codeIs("ERR_COMMS_VERIFY_STATE"));
  await assert.rejects(consume(v, { operationReference: "different-command" }), codeIs("ERR_COMMS_VERIFY_STATE"));
});
test("two simultaneous consumers cannot both receive consumption success", async () => {
  const v = await verify(await issue()); const results = await Promise.allSettled([consume(v), consume(v)]);
  assert.equal(results.filter(r => r.status === "fulfilled").length, 1);
  assert.equal(results.filter(r => r.status === "rejected").length, 1);
});
test("simultaneous verifications cannot return two proof tokens", async () => {
  const a = await issue(); const results = await Promise.allSettled([verify(a), verify(a)]);
  assert.equal(results.filter(r => r.status === "fulfilled" && r.value.proof).length, 1);
});
for (const field of ["purpose", "subjectReference", "destination", "bindingReference", "channel"]) {
  test("verification cannot move to another " + field, async () => {
    const a = await issue(); const revision = record(a).revision;
    await assert.rejects(verify(a, a.secret, { [field]: "other" }), codeIs("ERR_COMMS_VERIFY_CONTEXT"));
    assert.equal(record(a).revision, revision);
  });
}
test("a storage result from another tenant is rejected", async () => {
  const a = await issue(), get = repository.get;
  repository.get = async input => { const result = await get(input); if (result.result[0]) result.result[0].tenant = "wrong"; return result; };
  await assert.rejects(verify(a), codeIs("ERR_COMMS_VERIFY_STORAGE"));
});
test("legacy or malformed managed revision is never silently upgraded into verified proof", async () => {
  const a = await issue(); delete record(a).revision;
  await assert.rejects(verify(a), codeIs("ERR_COMMS_VERIFY_STORAGE"));
});
test("failed update cannot return verification success", async () => {
  const a = await issue(); repository.update = async () => { throw Error("store unavailable"); };
  await assert.rejects(verify(a), /store unavailable/); assert.equal(record(a).status, "PENDING");
});
test("zero-match update acknowledgement is not verification success", async () => {
  const a = await issue(); repository.update = async () => ({ code: "SUC_TEST", result: { matchedCount: 0 } });
  await assert.rejects(verify(a), codeIs("ERR_COMMS_VERIFY_CONFLICT"));
});
test("an explicit failed write after persistence is still not success", async () => {
  const a = await issue(), update = repository.update;
  repository.update = async value => { await update(value); return { success: false, result: [] }; };
  await assert.rejects(verify(a), codeIs("ERR_COMMS_VERIFY_STORAGE")); assert.equal(record(a).status, "VERIFIED");
});
test("wrong revision increment is not accepted", async () => {
  const a = await issue(), update = repository.update;
  repository.update = async value => { const result = await update(value); record(a).revision--; return result; };
  await assert.rejects(verify(a), codeIs("ERR_COMMS_VERIFY_CONFLICT"));
});
test("a provider that drops the intended state patch cannot return proof", async () => {
  const a = await issue(), update = repository.update;
  repository.update = async value => { const result = await update(value); record(a).status = "PENDING"; return result; };
  await assert.rejects(verify(a), codeIs("ERR_COMMS_VERIFY_STORAGE"));
});
test("proof expiry is separately bounded and enforced", async () => {
  const a = await issue(); advance(110); const v = await verify(a);
  assert.equal(Date.parse(v.proofExpiresAt), Date.parse(a.expiresAt));
  advance(10); await assert.rejects(consume(v), codeIs("ERR_COMMS_VERIFY_STATE"));
});
test("delayed verification write cannot release expired proof", async () => {
  const a = await issue(), update = repository.update;
  repository.update = async value => { const result = await update(value); advance(121); return result; };
  await assert.rejects(verify(a), codeIs("ERR_COMMS_VERIFY_STATE"));
});
test("delayed consumption does not grant an expired proof", async () => {
  const a = await issue(), v = await verify(a), update = repository.update;
  repository.update = async value => { const result = await update(value); advance(31); return result; };
  await assert.rejects(consume(v), codeIs("ERR_COMMS_VERIFY_STATE"));
});
test("resend obeys cooldown and invalidates old generation and proof atomically", async () => {
  const a = await issue(), v = await verify(a);
  await assert.rejects(replace(a), codeIs("ERR_COMMS_VERIFY_RATE"));
  advance(10); const b = await replace(a);
  assert.equal(b.challengeCode, a.challengeCode); assert.equal(b.generation, 2); assert.notEqual(b.secret, a.secret);
  await assert.rejects(verify(a), codeIs("ERR_COMMS_VERIFY_CONFLICT"));
  await assert.rejects(consume(v), codeIs("ERR_COMMS_VERIFY_STATE"));
  const next = await verify(b); await assert.rejects(consume(next, { proof: v.proof }), codeIs("ERR_COMMS_VERIFY_STATE"));
  assert.equal((await consume(next)).status, "CONSUMED");
});
test("resends are bounded across the continuation lifetime", async () => {
  let a = await issue(); advance(10); a = await replace(a); advance(10); a = await replace(a);
  advance(10); await assert.rejects(replace(a), codeIs("ERR_COMMS_VERIFY_RATE")); assert.equal(record(a).generation, 3);
});
test("resend stale revision or caller secret never overwrites current proof", async () => {
  const a = await issue(); advance(10);
  await assert.rejects(replace(a, { expectedRevision: 99 }), codeIs("ERR_COMMS_VERIFY_STATE"));
  await assert.rejects(replace(a, { secret: "chosen" }), codeIs("ERR_COMMS_VERIFY_INPUT")); assert.equal(record(a).generation, 1);
});
test("cancellation revokes unused proof but cannot erase consumption", async () => {
  const a = await issue(), v = await verify(a);
  const cancel = () => owner.cancelStored(request, { ...command, challengeCode: a.challengeCode, expectedRevision: record(a).revision });
  assert.equal((await cancel()).status, "CANCELLED"); await assert.rejects(consume(v), codeIs("ERR_COMMS_VERIFY_STATE"));
  assert.equal((await cancel()).status, "CANCELLED");
  command.bindingReference = "second-continuation"; const b = await issue(); await consume(await verify(b));
  await assert.rejects(owner.cancelStored(request, { ...command, challengeCode: b.challengeCode, expectedRevision: record(b).revision }), codeIs("ERR_COMMS_VERIFY_STATE"));
});
test("lost issue acknowledgement recovers status without revealing or sending the secret twice", async () => {
  const save = repository.save; repository.save = async input => { await save(input); throw Error("lost response"); };
  await assert.rejects(issue(), /lost response/); repository.save = save;
  const retried = await issue(); assert.equal(retried.replayed, true); assert.equal(retried.secret, undefined); assert.equal(records.size, 1);
});
test("owner clock and exported helper overrides are used without copying implementations", async () => {
  let creates = 0, hashes = 0;
  owner.create = function (...args) { creates++; return service.create.apply(this, args); };
  owner.hash = function (...args) { hashes++; return service.hash.apply(this, args); };
  const a = await issue(); await verify(a);
  assert.equal(creates, 1); assert.equal(hashes, 2);
  assert.equal(Date.parse(a.expiresAt), clock.getTime() + 120000);
});
test("challenge source declares managed revisions, private generic exposure and consumption fields", () => {
  assert.equal(schema.router.enabled, false); assert.equal(schema.router.groups.schemaOperations, false);
  assert.equal(schema.backoffice.enabled, false); assert.equal(schema.backoffice.concurrency.managed, true);
  assert.equal(schema.backoffice.concurrency.field, "revision"); assert(schema.definition.status.enum.includes("CONSUMED"));
  for (const field of ["revision", "bindingHash", "sourceModule", "generation", "proofHash", "proofExpiresAt", "consumedAt", "consumedOperationHash", "lastMutationId"])
    assert(schema.definition[field], field);
});

// The inspected MongoDB schema mapper treats optional string/date fields as non-nullable when present.
test("proof invalidation uses schema-valid values instead of nulls", async () => {
  const a = await issue(); await verify(a); advance(10); const b = await replace(a);
  await consume(await verify(b));
  command.bindingReference = "cancel-this-continuation"; const c = await issue();
  await owner.cancelStored(request, { ...command, challengeCode: c.challengeCode, expectedRevision: record(c).revision });
  for (const call of calls.filter(value => value.method === "update" || value.method === "save")) {
    for (const [field, value] of Object.entries(call.input.model)) assert.notEqual(value, null, field);
  }
});
test("invalid command shapes fail before stored reads", async () => {
  for (const value of [null, undefined, [], "input"]) {
    await assert.rejects(owner.issueStored(request, value), codeIs("ERR_COMMS_VERIFY_INPUT"));
  }
  assert.equal(calls.length, 0);
});

/**
 * Executes the unchanged Foundation concurrency owner, not a duplicate revision
 * implementation. Only its three lodash data helpers and lowest-level atomic
 * provider are injected for these plain-record unit fixtures. This is not full
 * pipeline, installed lodash, MongoDB durability or authorization qualification.
 */
function useManagedConcurrency() {
  const fs = require("node:fs");
  const path = require("node:path");
  const vm = require("node:vm");
  const { isDeepStrictEqual } = require("node:util");
  const filename = path.resolve(__dirname, "../../../../nodics.foundation/modules/nDatabase/database/src/service/schema/defaultModelConcurrencyService.js");
  const sandbox = {
    module: { exports: {} },
    require: name => {
      assert.equal(name, "lodash");
      return {
        cloneDeep: structuredClone,
        omit: (value, keys) => Object.fromEntries(Object.entries(value).filter(([key]) => !keys.includes(key))),
        isEqual: isDeepStrictEqual,
      };
    },
    CLASSES: { NodicsError: class extends Error { constructor(code) { super(code); this.code = code; } } },
    SERVICE: global.SERVICE,
  };
  vm.runInNewContext(fs.readFileSync(filename, "utf8"), sandbox, { filename });
  const concurrency = sandbox.module.exports;
  const providerCalls = [];
  const model = {
    rawSchema: schema,
    primaryKey: "code",
    getItems: async input => [...records.values()].filter(row => mutationQueryMatches(row, input.query)).map(clone),
    compareAndSetItem: async input => {
      providerCalls.push(clone(input));
      const code = input.operation === "create" ? input.model.code : input.query.code;
      const key = request.tenant + ":" + code;
      if (input.operation === "create") {
        if (records.has(key)) return null;
        records.set(key, clone(input.model));
      } else {
        const row = records.get(key);
        if (!row || !mutationQueryMatches(row, input.query)) return null;
        records.set(key, { ...row, ...clone(input.model) });
      }
      return clone(records.get(key));
    },
  };
  for (const operation of ["save", "update"]) {
    repository[operation] = async input => {
      assert.equal(input.authData, request.authData);
      assert.equal(input.tenant, request.tenant);
      calls.push({ method: operation, input: clone(input) });
      const generatedRequest = { ...input, model: { ...input.model }, schemaModel: model };
      if (operation === "save") concurrency.initializeSave(generatedRequest);
      const result = await concurrency.execute(generatedRequest, operation);
      return { code: "SUC_TEST_" + operation.toUpperCase(), result: operation === "save" ? [result] : result };
    };
  }
  return { concurrency, model, providerCalls };
}

test("actual managed concurrency initializes one then advances verification and consumption", async () => {
  const { concurrency } = useManagedConcurrency();
  assert.equal(concurrency.getField(schema), "revision", "Private BackOffice visibility does not disable managed revisions");
  const a = await issue(); assert.equal(a.revision, 1);
  const b = await verify(a); assert.equal(b.revision, 2);
  const c = await consume(b); assert.equal(c.revision, 3); assert.equal(c.status, "CONSUMED");
});
test("actual managed save rejects zero-token stale create rather than overwriting the first code", async () => {
  useManagedConcurrency(); const a = await issue(), original = clone(record(a)), get = repository.get;
  let reads = 0;
  repository.get = async input => ++reads === 1 ? { result: [] } : get(input);
  await assert.rejects(issue(), codeIs("ERR_CONCURRENCY_00001"));
  assert.deepEqual(record(a), original);
});
test("actual managed concurrency retains tenant, binding, status and expiry guards", async () => {
  const { providerCalls } = useManagedConcurrency();
  const a = await issue(); await verify(a);
  const query = providerCalls.find(call => call.operation === "update").query;
  assert.equal(query.tenant, request.tenant); assert.equal(query.status, "PENDING");
  assert.equal(query.bindingHash, record(a).bindingHash); assert.equal(query.revision, 1);
  assert.equal(query.expiresAt.$gt, clock.toISOString());
});
test("actual managed provider CAS miss cannot release a verification proof", async () => {
  const { model } = useManagedConcurrency(); const a = await issue();
  model.compareAndSetItem = async () => null;
  await assert.rejects(verify(a), codeIs("ERR_CONCURRENCY_00001"));
  assert.equal(record(a).status, "PENDING"); assert.equal(record(a).proofHash, undefined);
});
test("actual managed concurrency admits one winner in concurrent verification and consumption", async () => {
  useManagedConcurrency(); const a = await issue();
  const verification = await Promise.allSettled([verify(a), verify(a)]);
  assert.equal(verification.filter(value => value.status === "fulfilled").length, 1);
  const b = verification.find(value => value.status === "fulfilled").value;
  const consumption = await Promise.allSettled([consume(b), consume(b)]);
  assert.equal(consumption.filter(value => value.status === "fulfilled").length, 1);
  assert.equal(record(a).status, "CONSUMED");
});
