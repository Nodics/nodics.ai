/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @module loyaltyProgram/test @description Targeted administration, identity, CAS and transaction rollback with isolated persistence. @owner loyaltyProgram @layer test */
const test = require("node:test"), assert = require("node:assert/strict");
const service = require("../src/service/defaultLoyaltyProgramEligibilityAdministrationService");
const controller = require("../../loyaltyApi/src/controller/defaultLoyaltyInternalController");
const facade = require("../../loyaltyApi/src/facade/defaultLoyaltyInternalFacade");
const permission = "loyalty.program.partnerEligibility.manage";
function fixture(t) {
  const saved = ["CONFIG", "SERVICE", "FACADE", "CLASSES"].map(key => [key, global[key]]);
  t.after(() => saved.forEach(([key, value]) => value === undefined ? delete global[key] : global[key] = value));
  const policy = structuredClone(require("../config/properties").loyalty);
  const state = { program: { code: "program", active: true, status: "ACTIVE", revision: 7,
    spendEnabled: true, earningEnabled: true, metadata: { retained: "untouched" } },
    type: { code: "points", active: true, status: "ACTIVE", revision: 1 }, writes: 0, proofs: 0, nonces: [], reads: 0 };
  const auth = { tenant: "default", entCode: "default", loginId: "admin", authVersion: 3,
    principalType: "human", tokenType: "access", authenticationMethod: "PASSWORD", userGroups: ["platformAdministratorUserGroup"], permissions: ["*"] };
  const request = body => ({ tenant: "default", authData: structuredClone(auth), authorization: "Bearer original",
    payload: body, httpRequest: { body: structuredClone(body), headers: { authorization: "Bearer original", "x-enterprise-code": "default" } },
    httpResponse: { setHeader: (key, value) => { assert.equal(key, "Cache-Control"); assert.equal(value, "no-store"); } } });
  const command = () => request({ programCode: "program", expectedRevision: 7, partnerConversionRewardTypeCodes: ["points"], reason: "Reviewed issuer eligibility" });
  global.CONFIG = { get: key => key === "loyalty" ? policy : undefined };
  global.CLASSES = { NodicsError: class extends Error { constructor(code) { super(code); this.code = code; } } };
  const token = {};
  const check = r => { assert.deepEqual(r.authData, auth); assert.equal(r.authorization, "Bearer original"); assert.equal(r.tenant, "default");
    assert.equal(r.options.upsert, false); assert.equal(r.options.skipItemCache, true); };
  global.SERVICE = {
    DefaultLoyaltyProgramEligibilityAdministrationService: service,
    DefaultSecuredRequestPipelineService: { getGrantedPermissions: () => [permission], getRouteActionAuthorizationConfig: () => ({}), isPermissionGranted: () => state.allowed !== false },
    DefaultLoggerService: { assertSensitiveRequest: () => {} },
    DefaultLoyaltyParticipantService: { profile: async (r, path, enterprise, body) => {
      state.proofs++; state.nonces.push(body.nonce);
      assert.equal(r.authorization, "Bearer original"); assert.equal(enterprise, "default");
      assert.equal(path, policy.programEligibilityAdministration.platformAdministratorEvidencePath);
      state.onProof?.(state.proofs);
      return { contractVersion: 1, ...body, tenant: "default", enterpriseCode: "default", actorCode: "admin", authVersion: 3,
        principalType: "human", platformAdministrator: state.revoked !== true, ...state.proofOverride };
    } },
    DefaultDatabaseTransactionService: {
      capabilities: () => ({ multiRecordAtomic: state.qualified !== false, contextPropagation: true }),
      execute: async (scope, work) => {
        assert.deepEqual(scope, { moduleName: "loyaltyProgram", tenant: "default" });
        const before = structuredClone(state.program);
        try { return await work(token); } catch (error) { state.program = before; throw error; }
      },
    },
    DefaultLoyaltyProgramService: {
      get: async r => { check(r); state.reads++; state.onRead?.(r);
        if (r.transactionContext !== undefined) assert.equal(r.transactionContext, token);
        return { code: "SUC_GET", count: state.missing ? 0 : 1, result: state.missing ? [] : [structuredClone(state.program)] };
      },
      update: async r => { check(r); assert.equal(r.transactionContext, token); state.writes++;
        assert.deepEqual(Object.keys(r.model).sort(), ["metadata", "partnerConversionRewardTypeCodes", "revision", "updated", "updatedBy"]);
        await require("../../../../nodics.foundation/modules/nDatabase/database/src/service/interceptors/defaultInterceptorService").setUpdatedTimestamp(r);
        state.onWrite?.(r);
        if (state.zeroMatch) return { code: "SUC_UPDATE", result: { modifiedCount: 0 } };
        assert.deepEqual(r.query, { code: "program", revision: state.program.revision, active: true, status: "ACTIVE" });
        state.program = { ...state.program, ...structuredClone(r.model) };
        return { code: "SUC_UPDATE", result: { modifiedCount: 1 } };
      },
    },
    DefaultLoyaltyRewardTypeService: { get: async r => { check(r); assert.equal(r.transactionContext, token);
      return { code: "SUC_GET", count: state.type ? 1 : 0, result: state.type ? [structuredClone(state.type)] : [] }; } },
  };
  global.FACADE = { DefaultLoyaltyInternalFacade: { ...facade, service: name => SERVICE[name] } };
  return { state, request, command, policy };
}
test("read is targeted and unchanged; update stamps only eligibility and owner audit through original identity", async t => {
  const f = fixture(t), original = structuredClone(f.state.program);
  const read = await controller.programPartnerEligibilityRead(f.request({ programCode: "program" }));
  assert.deepEqual(read.data, { programCode: "program", revision: 7, partnerConversionRewardTypeCodes: [], lastChange: null });
  assert.deepEqual(f.state.program, original); assert.equal(f.state.writes, 0);
  const result = (await controller.programPartnerEligibilityUpdate(f.command())).data;
  assert.equal(result.revision, 8); assert.equal(result.changed, true);
  assert.equal(result.lastChange.actorCode, "admin"); assert.equal(result.lastChange.authVersion, 3);
  assert.deepEqual(result.lastChange.before, []); assert.deepEqual(result.lastChange.after, ["points"]);
  assert.equal(f.state.program.metadata.retained, "untouched"); assert.equal(f.state.program.earningEnabled, true);
  assert.equal(new Set(f.state.nonces).size, f.state.proofs);
  await assert.rejects(service.update(f.command()), { code: "ERR_LOYALTY_PROGRAM_CONFLICT" });
  assert.equal(f.state.writes, 1);
  const noChange = f.command(); noChange.payload.expectedRevision = noChange.httpRequest.body.expectedRevision = 8;
  assert.equal((await service.update(noChange)).changed, false); assert.equal(f.state.writes, 1);
});
test("exact input rejects unrelated business fields, invalid revisions, duplicate or malformed reward types", async t => {
  const f = fixture(t);
  for (const patch of [{ expectedRevision: null }, { expectedRevision: -1 }, { expectedRevision: Number.MAX_SAFE_INTEGER },
    { tenant: "foreign" }, { spendEnabled: true }, { revision: 8 }, { reason: "" },
    { partnerConversionRewardTypeCodes: ["points", "points"] }, { partnerConversionRewardTypeCodes: ["bad value"] }]) {
    const r = f.command(); Object.assign(r.payload, patch); r.httpRequest.body = structuredClone(r.payload);
    await assert.rejects(service.update(r), { code: "ERR_LOYALTY_PROGRAM_INVALID" });
  }
  assert.equal(f.state.reads, 0); assert.equal(f.state.writes, 0);
});
test("native human authority cannot be replaced by service, linked, scoped or conflicting transport", async t => {
  const f = fixture(t);
  for (const patch of [{ principalType: "service" }, { tokenType: "service" }, { authenticationMethod: "TELEGRAM" },
    { authVersion: 0 }, { isSystem: true }, { runtimeScope: {} }, { sessionContext: {} }, { externalIdentityLinkCode: "link" }]) {
    const r = f.command(); Object.assign(r.authData, patch);
    await assert.rejects(service.update(r), { code: "ERR_LOYALTY_PROGRAM_FORBIDDEN" });
  }
  const r = f.command(); r.httpRequest.headers["x-enterprise-code"] = "foreign";
  await assert.rejects(service.update(r), { code: "ERR_LOYALTY_PROGRAM_FORBIDDEN" });
  f.state.allowed = false;
  await assert.rejects(service.update(f.command()), { code: "ERR_LOYALTY_PROGRAM_FORBIDDEN" });
  assert.equal(f.state.writes, 0);
});
test("fresh proof rejects wrong nonce/stamp/tenant/admin and revalidation rolls writes back", async t => {
  const f = fixture(t);
  for (const proofOverride of [{ nonce: "wrong" }, { authVersion: 4 }, { tenant: "foreign" }, { platformAdministrator: false }]) {
    f.state.proofOverride = proofOverride;
    await assert.rejects(service.update(f.command()), { code: "ERR_LOYALTY_PROGRAM_FORBIDDEN" });
  }
  f.state.proofOverride = undefined;
  const before = structuredClone(f.state.program);
  f.state.onWrite = () => { f.state.revoked = true; };
  await assert.rejects(service.update(f.command()), { code: "ERR_LOYALTY_PROGRAM_FORBIDDEN" });
  assert.deepEqual(f.state.program, before);
});
test("missing or inactive targets, unqualified transactions and zero-match CAS refuse", async t => {
  const f = fixture(t), before = structuredClone(f.state.program);
  f.state.qualified = false;
  await assert.rejects(service.update(f.command()), { code: "ERR_LOYALTY_PROGRAM_UNAVAILABLE" });
  f.state.qualified = true; f.state.missing = true;
  await assert.rejects(service.update(f.command()), { code: "ERR_LOYALTY_PROGRAM_NOT_FOUND" });
  f.state.missing = false; f.state.type.active = false;
  await assert.rejects(service.update(f.command()), { code: "ERR_LOYALTY_PROGRAM_NOT_FOUND" });
  f.state.type.active = true; f.state.zeroMatch = true;
  await assert.rejects(service.update(f.command()), { code: "ERR_LOYALTY_PROGRAM_CONFLICT" });
  assert.deepEqual(f.state.program, before);
});
test("readback/authority/config drift abort; clearing eligibility is a valid reviewed change", async t => {
  const f = fixture(t), before = structuredClone(f.state.program), r = f.command();
  f.state.onWrite = () => { r.authData.authVersion++; };
  await assert.rejects(service.update(r), { code: "ERR_LOYALTY_PROGRAM_FORBIDDEN" });
  assert.deepEqual(f.state.program, before);
  f.state.onWrite = () => { f.policy.programEligibilityAdministration.maximumRewardTypes++; };
  await assert.rejects(service.update(f.command()), { code: "ERR_LOYALTY_PROGRAM_FORBIDDEN" });
  assert.deepEqual(f.state.program, before);
  f.state.onWrite = undefined;
  f.state.program.partnerConversionRewardTypeCodes = ["points"];
  const clear = f.command(); clear.payload.partnerConversionRewardTypeCodes = []; clear.httpRequest.body = structuredClone(clear.payload);
  assert.deepEqual((await service.update(clear)).partnerConversionRewardTypeCodes, []);
  assert.throws(() => service.storage({}, undefined, {}), { code: "ERR_LOYALTY_PROGRAM_FORBIDDEN" });
});
test("changed unrelated fields in persistence readback roll back the eligibility update", async t => {
  const f = fixture(t), before = structuredClone(f.state.program);
  f.state.onRead = () => { if (f.state.writes) f.state.program.spendEnabled = false; };
  await assert.rejects(service.update(f.command()), { code: "ERR_LOYALTY_PROGRAM_CONFLICT" });
  assert.deepEqual(f.state.program, before);
});
test("canonical transaction owner propagates opaque contexts, serializes competing CAS and rolls back revoked authority", async t => {
  const f = fixture(t);
  const transaction = require("../../../../nodics.foundation/modules/nDatabase/database/src/service/transaction/defaultDatabaseTransactionService");
  const database = { getOptions: () => ({ connectionHandler: "TestTransactionAdapter" }) };
  const programSchema = require("../src/schemas/schemas").loyaltyProgram.loyaltyProgram;
  const typeSchema = require("../../loyaltyRewardType/src/schemas/schemas").loyaltyRewardType.loyaltyRewardType;
  const getConfig = CONFIG.get;
  CONFIG.get = key => key === "databaseTransactions" ? { enabled: true, failClosed: true, maximumCommitTimeMs: 5000 } : getConfig(key);
  SERVICE.DefaultDatabaseTransactionService = transaction;
  SERVICE.DefaultDatabaseConfigurationService = { getTenantDatabase: () => ({ master: database }) };
  let tail = Promise.resolve(), observedToken;
  SERVICE.TestTransactionAdapter = {
    transactionCapabilities: () => ({ multiRecordAtomic: true, contextPropagation: true }),
    executeTransaction: async (_database, _options, work) => {
      const previous = tail; let release; tail = new Promise(resolve => { release = resolve; });
      await previous;
      const original = structuredClone(f.state.program);
      try { return await work({ session: "isolated-adapter" }); }
      catch (error) { f.state.program = original; throw error; }
      finally { release(); }
    },
    transactionOperationOptions: context => context,
  };
  const qualify = (request, rawSchema) => {
    observedToken = request.transactionContext;
    assert.deepEqual(transaction.operationOptions(observedToken, database, { rawSchema }), { session: "isolated-adapter" });
    assert.equal(request.authData.principalType, "human");
  };
  SERVICE.DefaultLoyaltyProgramService.get = async request => {
    qualify(request, programSchema);
    return { code: "SUC_GET", count: 1, result: [structuredClone(f.state.program)] };
  };
  SERVICE.DefaultLoyaltyRewardTypeService.get = async request => {
    qualify(request, typeSchema);
    return { code: "SUC_GET", count: 1, result: [structuredClone(f.state.type)] };
  };
  SERVICE.DefaultLoyaltyProgramService.update = async request => {
    qualify(request, programSchema);
    if (request.query.revision !== f.state.program.revision) return { code: "SUC_UPDATE", result: { modifiedCount: 0 } };
    await require("../../../../nodics.foundation/modules/nDatabase/database/src/service/interceptors/defaultInterceptorService").setUpdatedTimestamp(request);
    f.state.program = { ...f.state.program, ...structuredClone(request.model) }; f.state.writes++;
    f.state.onWrite?.();
    return { code: "SUC_UPDATE", result: { modifiedCount: 1 } };
  };
  const results = await Promise.allSettled([service.update(f.command()), service.update(f.command())]);
  assert.equal(results.filter(row => row.status === "fulfilled").length, 1);
  assert.equal(results.find(row => row.status === "rejected").reason.code, "ERR_LOYALTY_PROGRAM_CONFLICT");
  assert.equal(f.state.writes, 1); assert.equal(f.state.program.revision, 8);
  assert.throws(() => transaction.operationOptions(observedToken, database, { rawSchema: programSchema }), /expired/);
  const original = structuredClone(f.state.program), r = f.command();
  r.payload.expectedRevision = 8; r.payload.partnerConversionRewardTypeCodes = []; r.httpRequest.body = structuredClone(r.payload);
  f.state.onWrite = () => { f.state.revoked = true; };
  await assert.rejects(service.update(r), { code: "ERR_LOYALTY_PROGRAM_FORBIDDEN" });
  assert.deepEqual(f.state.program, original);
});
test("routes are narrow, permission vocabulary is owner-owned and generic Program router stays disabled", () => {
  const routes = require("../../loyaltyApi/src/router/routers").loyaltyApi.programAdministration;
  for (const route of Object.values(routes)) {
    assert.equal(route.permission, permission); assert.deepEqual(route.authTokenTypes, ["access"]);
    assert.deepEqual(route.accessGroups, ["platformAdministratorUserGroup"]);
    assert.equal(route.requestPrivacy.sensitive, true); assert.equal(route.cache.enabled, false);
    assert.equal(route.apiExposure, "loyaltyAdministration");
  }
  assert.equal(require("../package.json").nodics.runtime.router, false);
  assert.equal(require("../../loyaltyApi/config/properties").apiExposure.categories.loyaltyAdministration.enabled, true);
  assert.equal(require("../data/init-v001/records/identity/loyaltyProgramAdministrationPermissionData").partnerEligibility.ownerModule, "loyaltyProgram");
  const manifest = require("../data/manifest.json").sections.partnerEligibilityAdministrationPermission;
  const fs = require("node:fs"), path = require("node:path"), crypto = require("node:crypto");
  assert.equal(manifest.destinationRole, "PLATFORM"); assert.equal(manifest.selectionPolicy, "DEFAULT");
  for (const [file, hash] of Object.entries(manifest.files)) assert.equal(crypto.createHash("sha256").update(fs.readFileSync(path.join(__dirname, "../data", file))).digest("hex"), hash);
});
