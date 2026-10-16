/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @module order/test/orderBusinessWorkbenchContract @description Exercises actual business grants, schema metadata, safe-query parsing and owner read boundaries. @layer test @owner order */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const root = path.resolve(__dirname, "../../../../../..");
const foundation = file => require(path.join(root, "nodics.foundation/modules", file));
const workbench = require("../src/service/defaultOrderBusinessWorkbenchService");
const business = require("../src/service/defaultOrderBusinessAccessService");
const repository = require("../src/service/defaultOrderLifecycleRepositoryService");
const controller = require("../src/controller/defaultOrderBusinessWorkbenchController");
const routes = require("../src/router/routers").order.business;
const groups = Object.values(require("../data/init-v001/records/identity/orderBusinessAccessGroupData"));

function fixture(t, level = 0) {
  const keys = ["SERVICE", "CONFIG", "NODICS", "CLASSES", "UTILS"];
  const old = Object.fromEntries(keys.map(key => [key, global[key]]));
  t.after(() => Object.assign(global, old));
  const settings = {
    schemaApi: { defaultModelOperations: ["search", "read"], defaultMutationMode: "READ_ONLY", allowedPageSizes: [10, 25, 50], defaultPageSize: 25 },
    accessPoints: { fullAccessPoint: 10, readAccessPoint: 1, writeAccessPoint: 5, removeAccessPoint: 8 },
    identityGovernance: { systemAccessGroups: ["serviceAccountUserGroup"] },
    authSecurity: { jwt: {}, compatibility: {}, bootstrapIdentity: { required: false } },
    routeActionAuthorization: { enabled: true, strict: true },
  };
  global.CONFIG = { get: key => settings[key] };
  global.UTILS = { isBlank: value => !value || !Object.keys(value).length, isObject: value => value && typeof value === "object" };
  global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message || code); this.code = code; } } };
  const schemas = structuredClone(require("../src/schemas/schemas").order);
  for (const schema of Object.values(schemas)) schema.accessGroups = { serviceAccountUserGroup: 10, commerceOperatorUserGroup: 10 };
  global.NODICS = { getModule: name => name === "order" ? { rawSchema: schemas } : undefined,
    getRouters: () => routes, getServerState: () => "started" };
  const reads = [], state = { rows: [{ code: "case", tenant: "t", enterpriseCode: "A", status: "SUBMITTED", revision: 0,
    evidence: { private: true }, correlationId: "private" }], count: 1, code: "SUC_GET", after: () => {} };
  const generated = { get: async request => {
    reads.push(request);
    assert.equal(SERVICE.DefaultSchemaAccessHandlerService.getAccessPoint(request.authData, schemas.commerceOrder.accessGroups), 10);
    state.after();
    return { code: state.code, result: structuredClone(state.rows), count: state.count };
  } };
  global.SERVICE = {
    DefaultSecuredRequestPipelineService: foundation("nRouter/src/service/request/defaultSecuredRequestPipelineService"),
    DefaultSchemaAccessHandlerService: foundation("nDatabase/database/src/service/schema/defaultSchemaAccessHandlerService"),
    DefaultSchemaUtilityService: foundation("nDatabase/database/src/service/schema/defaultSchemaUtilityService"),
    DefaultSchemaSafeQueryService: foundation("nDatabase/database/src/service/schema/defaultSchemaSafeQueryService"),
    DefaultIdentityGovernanceService: foundation("nAuth/src/service/identity/defaultIdentityGovernanceService"),
    DefaultOrderBusinessAccessService: business, DefaultOrderLifecycleRepositoryService: repository,
    DefaultOrderBusinessWorkbenchService: workbench, DefaultCommerceOrderService: generated, DefaultOrderLifecycleRequestService: generated,
  };
  const request = { tenant: "t", authData: { tenant: "t", entCode: "A", principalId: "staff", loginId: "staff",
    principalType: "human", tokenType: "access", authVersion: 1, userGroups: ["employeeUserGroup", "axisOperationalUserGroup", groups[level].code],
    permissions: [...groups[level].permissions] }, payload: {} };
  return { request, reads, state, schemas };
}

for (let level = 0; level < 3; level++) test(groups[level].code + " reads actual owner descriptors without schema grants", async t => {
  const f = fixture(t, level);
  assert.equal(SERVICE.DefaultSchemaAccessHandlerService.getAccessPoint(f.request.authData, f.schemas.commerceOrder.accessGroups), 0);
  const result = await controller.schemas(f.request);
  assert.deepEqual(result.data.schemas.map(schema => schema.schemaName), ["commerceOrder", "orderLifecycleRequest"]);
  for (const schema of result.data.schemas) {
    assert.deepEqual(schema.operations, ["search", "read"]);
    assert.equal(schema.mutationMode, "READ_ONLY");
    assert.equal(schema.fields.some(field => ["evidence", "tenant", "enterpriseCode", "correlationId"].includes(field.name)), false);
    assert(schema.apiOperations.search.path.startsWith("/business/"));
    const response = await workbench.search(f.request, schema.schemaName);
    assert.deepEqual(response.records, [{ code: "case", status: "SUBMITTED", revision: 0 }]);
    assert.deepEqual(f.reads.at(-1).query.$and[0], { tenant: "t", enterpriseCode: "A" });
    assert.equal(f.reads.at(-1).authData.isSystem, true);
    assert.equal(f.reads.at(-1).options.skipItemCache, true);
    assert.equal(f.reads.at(-1).searchOptions.projection.enterpriseCode, 1);
  }
  assert.equal(f.request.authData.isSystem, undefined);
  assert.equal(f.request.authData.permissions.includes("system.schema.view"), false);
});

test("Order owner reads refuse foreign, neutral, unconfirmed, oversized and drifted results", async t => {
  const f = fixture(t);
  for (const enterpriseCode of ["B", undefined, ""]) {
    f.state.rows[0].enterpriseCode = enterpriseCode;
    await assert.rejects(workbench.search(f.request, "commerceOrder"), /scope/);
  }
  f.state.rows[0].enterpriseCode = "A";
  const original = structuredClone(f.state.rows[0]);
  f.state.rows.push(structuredClone(original));
  f.state.count = 2;
  await assert.rejects(workbench.search(f.request, "commerceOrder"), /scope/);
  f.state.rows = [original];
  f.state.count = 1;
  f.state.rows[0].status = { privateProviderReceipt: true };
  await assert.rejects(workbench.search(f.request, "commerceOrder"), /projection/);
  assert.throws(() => business.publicLifecycle(f.state.rows[0]), /projection/);
  f.state.rows[0].status = "SUBMITTED";
  f.state.rows = Array.from({ length: 26 }, (_, index) => ({ ...original, code: "case-" + index, status: "SUBMITTED" }));
  f.state.count = 26;
  await assert.rejects(workbench.search(f.request, "commerceOrder"), /scope/);
  f.state.rows = [{ ...original, status: "SUBMITTED" }];
  f.state.count = 1;
  f.state.code = "ERR_GET";
  await assert.rejects(workbench.search(f.request, "commerceOrder"), /unconfirmed/i);
  f.state.code = "SUC_GET";
  f.state.count = undefined;
  await assert.rejects(workbench.search(f.request, "commerceOrder"), /count/);
  f.state.count = 1;
  f.state.after = () => { f.request.authData.authVersion++; };
  await assert.rejects(workbench.search(f.request, "commerceOrder"), /authority changed/);
});

test("Order owner queries use shared bounded parsing and reject scope filters or arbitrary schema selection", async t => {
  const f = fixture(t);
  for (const payload of [{ pageSize: 10000 }, { sort: { field: "evidence", direction: "ASC" } },
    { filters: { operator: "AND", items: [{ field: "enterpriseCode", operator: "EQUALS", value: "B" }] } }]) {
    await assert.rejects(workbench.search({ ...f.request, payload }, "commerceOrder"));
  }
  await assert.rejects(workbench.search(f.request, "commerceOrderEntry"), /unavailable/);
  assert.equal(f.reads.length, 0);
  f.request.payload = { filters: { operator: "OR", items: [{ field: "status", operator: "EQUALS", value: "SUBMITTED" }] } };
  await workbench.search(f.request, "commerceOrder");
  assert.equal(f.reads[0].query.$and.length, 2);
  assert.deepEqual(f.reads[0].query.$and[0], { tenant: "t", enterpriseCode: "A" });
});

test("Order business data grants distinguish manual review from editing and never grant refund execution", () => {
  assert.equal(groups[1].permissions.includes("commerce.dispute.review"), false);
  assert.equal(groups[2].permissions.includes("commerce.dispute.review"), true);
  for (const group of groups) assert.equal(group.permissions.includes("commerce.refund.execute"), false);
});
