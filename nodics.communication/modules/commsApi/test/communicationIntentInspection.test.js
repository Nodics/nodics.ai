/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/**
 * @module commsApi/test/communicationIntentInspection
 * @description Deferred source-scoped inspection contracts using actual controller,
 * facade, operations and uncached runtime reads with injected generated persistence.
 * No listener, provider send or database is opened; installed qualification is separate.
 * @layer test @owner commsApi
 * @override Add independent fixtures while preserving source isolation and no-effects checks.
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const facade = require("../src/facade/defaultCommunicationApiFacade");
const controller = require("../src/controller/defaultCommunicationApiController");
const operations = require("../src/service/defaultCommunicationOperationsService");
const runtime = require("../../commsCore/src/service/defaultCommunicationRuntimeService");
const route = require("../src/router/routers").commsApi.internal
  .inspectCommunication;
const code = "COMM_" + "a".repeat(64);
let rows, reads, previous, attempts, attemptReads;

/** Supplies a signed service fixture, not deployment authority. */
function request() {
  return {
    tenant: "inspection-test",
    intentCode: code,
    payload: {},
    authData: {
      tokenType: "service",
      principalType: "service",
      serviceId: "test-runtime",
      tenant: "inspection-test",
      modules: ["commsApi", "digitalCore"],
      permissions: ["communication.request"],
    },
  };
}

test.beforeEach(() => {
  previous = Object.fromEntries(
    ["CLASSES", "CONFIG", "SERVICE", "FACADE"].map((key) => [
      key,
      {
        present: Object.hasOwn(global, key),
        value: global[key],
      },
    ]),
  );
  reads = 0;
  attemptReads = 0;
  attempts = [];
  rows = [
    {
      code,
      tenant: "inspection-test",
      sourceModule: "digitalCore",
      status: "QUEUED",
      revision: 1,
      recipientId: "PRIVATE",
      recipientAddressReference: "PRIVATE",
      rendered: { body: "PRIVATE" },
      variables: { proof: "PRIVATE" },
      lastMutationId: "PRIVATE",
      providerReference: "PRIVATE",
    },
  ];
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(code) {
        super(code);
        this.code = code;
      }
    },
  };
  global.CONFIG = {
    get: () => ({ trustedSourceModules: ["digitalCore", "profile"] }),
  };
  global.SERVICE = {
    DefaultLoggerService: {
      hasPrivateCaptureProtection: () => true,
      assertSensitiveRequest: () => {},
    },
    DefaultCommunicationRuntimeService: { ...runtime },
    DefaultCommunicationOperationsService: { ...operations },
    DefaultCommsIntentService: {
      get: async (input) => {
        reads++;
        assert.equal(input.tenant, "inspection-test");
        assert.deepEqual(input.query, { code, tenant: "inspection-test" });
        assert.deepEqual(input.searchOptions, { pageSize: 2, pageNumber: 1 });
        assert.deepEqual(input.options, {
          recursive: false,
          skipItemCache: true,
        });
        return { code: "SUC_TEST", result: structuredClone(rows) };
      },
    },
    DefaultCommsDeliveryAttemptService: {
      get: async input => {
        attemptReads++;
        assert.equal(input.tenant, "inspection-test");
        assert.deepEqual(input.query, { code: code + "_1", intentCode: code, attempt: 1, tenant: "inspection-test" });
        assert.deepEqual(input.searchOptions, { pageSize: 2, pageNumber: 1 });
        assert.deepEqual(input.options, { recursive: false, skipItemCache: true });
        return { code: "SUC_TEST", result: structuredClone(attempts) };
      },
    },
  };
  global.FACADE = { DefaultCommunicationApiFacade: { ...facade } };
});

test.afterEach(() => {
  for (const [key, state] of Object.entries(previous)) {
    if (state.present) global[key] = state.value;
    else delete global[key];
  }
});

test("all schema-defined durable states project exactly three fields from one fresh read", async () => {
  const states = require("../../commsSchema/src/schemas/schemas").commsSchema
    .commsIntent.definition.status.enum;
  const snapshot = structuredClone(rows);
  for (const status of states) {
    rows[0].status = status;
    assert.deepEqual(await facade.inspectDelivery(request()), {
      intentCode: code,
      status,
      revision: 1,
    });
  }
  assert.equal(reads, states.length);
  rows[0].status = snapshot[0].status;
  assert.deepEqual(rows, snapshot);
});

test("controller preserves the exact empty body and normal data envelope", async () => {
  const r = request();
  r.httpRequest = { params: { intentCode: code }, body: {} };
  assert.deepEqual(await controller.inspectDelivery(r), {
    data: { intentCode: code, status: "QUEUED", revision: 1 },
  });
  for (const body of [null, undefined, false, [], ""]) {
    const invalid = request();
    invalid.httpRequest = { params: { intentCode: code }, body };
    await assert.rejects(
      controller.inspectDelivery(invalid),
      /INTEGRATION_INPUT/,
    );
  }
  assert.equal(reads, 1);
});

test("unadmitted human, wildcard-only, module and tenant contexts reject before reads", async () => {
  for (const change of [
    { tokenType: "access" },
    { principalType: "customer" },
    { serviceId: "" },
    { permissions: ["*"] },
    { modules: ["digitalCore"] },
    { tenant: "other" },
  ]) {
    const r = request();
    Object.assign(r.authData, change);
    await assert.rejects(facade.inspectDelivery(r), /INTEGRATION_CONTEXT/);
  }
  assert.equal(reads, 0);
});

test("extra and non-object bodies cannot select source, credentials or authority", async () => {
  for (const payload of [
    { sourceModule: "profile" },
    { tenant: "other" },
    { authData: request().authData },
    { retry: true },
    null,
    undefined,
    [],
    "",
    Object.create({ delegated: true }),
    { [Symbol("private")]: true },
  ]) {
    const r = request();
    r.payload = payload;
    await assert.rejects(facade.inspectDelivery(r), /INTEGRATION_INPUT/);
  }
  assert.equal(reads, 0);
});

test("configured but unsigned stored source and missing or duplicate records disclose nothing", async () => {
  const saved = structuredClone(rows[0]);
  for (const records of [
    [{ ...saved, sourceModule: "profile" }],
    [],
    [saved, saved],
    [{ ...saved, sourceModule: undefined }],
  ]) {
    rows = records;
    await assert.rejects(
      facade.inspectDelivery(request()),
      /INTEGRATION_CONTEXT/,
    );
  }
});

test("malformed persisted state or revision never becomes NOT_OBSERVED", async () => {
  for (const patch of [
    { status: "NOT_OBSERVED" },
    { status: "UNKNOWN" },
    { revision: undefined },
    { revision: -1 },
    { revision: "1" },
    { revision: 1.5 },
    { tenant: "other" },
  ]) {
    const saved = structuredClone(rows[0]);
    Object.assign(rows[0], patch);
    await assert.rejects(
      facade.inspectDelivery(request()),
      /INTEGRATION_STORAGE/,
    );
    rows[0] = saved;
  }
  rows[0].revision = 0;
  assert.equal((await facade.inspectDelivery(request())).revision, 0);
});

test("failed generated reads expose only stable storage refusal, not provider details", async () => {
  SERVICE.DefaultCommsIntentService.get = async () => {
    throw Error("PRIVATE provider failure");
  };
  await assert.rejects(
    facade.inspectDelivery(request()),
    (error) =>
      error.code === "ERR_COMMS_INTEGRATION_STORAGE" &&
      !error.message.includes("PRIVATE"),
  );
  SERVICE.DefaultCommsIntentService.get = async () => ({
    code: "ERR_PRIVATE",
    result: rows,
  });
  await assert.rejects(
    facade.inspectDelivery(request()),
    /INTEGRATION_STORAGE/,
  );
});

test("effective facade admission can narrow and operation fields cannot widen the DTO", async () => {
  const effective = {
    ...facade,
    authorizeSource() {
      throw Error("deployment restriction");
    },
  };
  await assert.rejects(
    effective.inspectDelivery(request()),
    /deployment restriction/,
  );
  assert.equal(reads, 0);
  SERVICE.DefaultCommunicationOperationsService.inspect = function (r, record) {
    return {
      ...operations.inspect.call(this, r, record),
      recipient: "PRIVATE",
      proof: "PRIVATE",
    };
  };
  assert.deepEqual(await facade.inspectDelivery(request()), {
    intentCode: code,
    status: "QUEUED",
    revision: 1,
  });
});

test("route remains service-only, exact empty body, uncached and fixed DTO", () => {
  assert.equal(route.key, "/internal/communications/:intentCode/inspect");
  assert.equal(route.method, "POST");
  assert.equal(route.secured, true);
  assert.deepEqual(route.authTokenTypes, ["service"]);
  assert.equal(route.permission, "communication.request");
  assert.equal(route.apiExposure, "communicationIntegration");
  assert.equal(route.cache.enabled, false);
  assert.deepEqual(route.requestBody.content["application/json"].schema, {
    type: "object",
    additionalProperties: false,
    maxProperties: 0,
    properties: {},
  });
  assert.deepEqual(
    Object.keys(
      route.responses["200"].content["application/json"].schema.properties.data
        .properties,
    ),
    ["intentCode", "status", "revision"],
  );
});

function uncertainAttempt() {
  Object.assign(rows[0], { sourceType: "wasteSubmission", sourceCode: "WST_TEST", attempt: 1, channel: "TELEGRAM", status: "UNCERTAIN" });
  attempts = [{ code: code + "_1", intentCode: code, tenant: "inspection-test", channel: "TELEGRAM", attempt: 1,
    status: "UNCERTAIN", responseCode: "TELEGRAM_UNCERTAIN", providerReference: "PRIVATE", body: "PRIVATE", error: "PRIVATE" }];
}
function diagnosticRequest() {
  return { ...request(), payload: { sourceModule: "digitalCore", sourceType: "wasteSubmission", sourceCode: "WST_TEST" } };
}

test("separate HTTP diagnostic reads only the exact attempt and returns static copy without exposing private fields or changing inspection", async () => {
  uncertainAttempt();
  const r = diagnosticRequest(); r.httpRequest = { params: { intentCode: code }, body: r.payload };
  const result = await controller.diagnoseDelivery(r);
  assert.deepEqual(Object.keys(result.data), ["intentCode", "status", "revision", "diagnostic"]);
  assert.equal(result.data.diagnostic.classification, "TRANSPORT_ACK_UNCONFIRMED");
  assert.equal(result.data.diagnostic.attempt, 1);
  assert.equal(JSON.stringify(result).includes("PRIVATE"), false);
  assert.equal(reads, 2); assert.equal(attemptReads, 1);
  assert.deepEqual(await facade.inspectDelivery(request()), { intentCode: code, status: "UNCERTAIN", revision: 1 });
});

for (const [responseCode, classification] of [
  ["DELIVERY_INTERRUPTED", "DELIVERY_INTERRUPTED"], ["INVALID_PROVIDER_OUTCOME", "INVALID_PROVIDER_OUTCOME"],
  ["PRIVATE raw provider error", "ATTEMPT_UNCLASSIFIED"], ["TELEGRAM_ACCEPTED", "ATTEMPT_UNCLASSIFIED"],
]) test("bounded uncertainty classifies " + classification + " without raw provider text", async () => {
  uncertainAttempt(); attempts[0].responseCode = responseCode;
  const result = await facade.diagnoseDelivery(diagnosticRequest());
  assert.equal(result.diagnostic.classification, classification);
  assert.equal(JSON.stringify(result).includes("PRIVATE"), false);
});

test("pre-send destination failure has fixed owner diagnosis without rewriting historical uncertainty", async () => {
  uncertainAttempt();
  rows[0].status = "RETRY_PENDING";
  attempts[0].status = "RETRY_PENDING";
  attempts[0].responseCode = "DESTINATION_RESOLUTION_FAILED";
  const result = await facade.diagnoseDelivery(diagnosticRequest());
  assert.equal(result.diagnostic.classification, "DESTINATION_UNAVAILABLE");
  assert.equal(JSON.stringify(result).includes("PRIVATE"), false);
  uncertainAttempt();
  attempts[0].responseCode = "DELIVERY_INTERRUPTED";
  const original = await facade.diagnoseDelivery(diagnosticRequest());
  assert.equal(original.status, "UNCERTAIN");
  assert.equal(original.diagnostic.classification, "DELIVERY_INTERRUPTED");
});

test("missing attempt and differing current intent state remain explicit unknowns, never delivery proof", async () => {
  uncertainAttempt(); attempts = [];
  assert.equal((await facade.diagnoseDelivery(diagnosticRequest())).diagnostic.classification, "ATTEMPT_NOT_RECORDED");
  uncertainAttempt(); rows[0].status = "DELIVERED";
  assert.equal((await facade.diagnoseDelivery(diagnosticRequest())).diagnostic.classification, "ATTEMPT_STATUS_DIFFERS");
});

test("diagnostic rejects private-entry, human, extra-body and foreign-source access without attempt reads", async () => {
  uncertainAttempt();
  const r = diagnosticRequest(); r.authData.tokenType = "access";
  await assert.rejects(controller.diagnoseDelivery(r), /INTEGRATION_CONTEXT/);
  for (const body of [undefined, null, [], { raw: true }, { retry: true }, { sourceModule: "profile" }]) {
    const r = request(); r.httpRequest = { params: { intentCode: code }, body };
    await assert.rejects(controller.diagnoseDelivery(r), /INTEGRATION_INPUT/);
  }
  SERVICE.DefaultLoggerService.hasPrivateCaptureProtection = () => false;
  await assert.rejects(controller.diagnoseDelivery(diagnosticRequest()), /INTEGRATION_CONTEXT/);
  SERVICE.DefaultLoggerService.hasPrivateCaptureProtection = () => true;
  rows[0].sourceModule = "profile";
  await assert.rejects(controller.diagnoseDelivery(diagnosticRequest()), /INTEGRATION_CONTEXT/);
  assert.equal(attemptReads, 0);
});

for (const patch of [{ tenant: "other" }, { intentCode: "other" }, { attempt: 2 }, { channel: "EMAIL" }, { active: false }, { status: "PRIVATE" }])
  test("diagnostic rejects mismatched attempt " + Object.keys(patch)[0], async () => {
    uncertainAttempt(); Object.assign(attempts[0], patch);
    await assert.rejects(controller.diagnoseDelivery(diagnosticRequest()), /INTEGRATION_STORAGE/);
  });

test("duplicate, failed, and concurrently changed attempt reads are safe refusals", async () => {
  uncertainAttempt(); attempts.push({ ...attempts[0] });
  await assert.rejects(controller.diagnoseDelivery(diagnosticRequest()), /INTEGRATION_STORAGE/);
  SERVICE.DefaultCommsDeliveryAttemptService.get = async () => { throw Error("PRIVATE raw failure"); };
  await assert.rejects(controller.diagnoseDelivery(diagnosticRequest()), error => error.code === "ERR_COMMS_INTEGRATION_STORAGE" && !error.message.includes("PRIVATE"));
  uncertainAttempt();
  SERVICE.DefaultCommsDeliveryAttemptService.get = async () => { rows[0].revision++; return { code: "SUC_TEST", result: attempts }; };
  await assert.rejects(controller.diagnoseDelivery(diagnosticRequest()), /INTEGRATION_STORAGE/);
});

test("effective operation diagnostics cannot inject copy or expand the DTO", async () => {
  uncertainAttempt();
  SERVICE.DefaultCommunicationOperationsService.diagnose = async () => ({ diagnostic: {
    classification: "TRANSPORT_ACK_UNCONFIRMED", attempt: 1, message: "PRIVATE", body: "PRIVATE" }, recipient: "PRIVATE" });
  const result = await controller.diagnoseDelivery(diagnosticRequest());
  assert.equal(JSON.stringify(result).includes("PRIVATE"), false);
  SERVICE.DefaultCommunicationOperationsService.diagnose = async () => ({ diagnostic: { classification: "PRIVATE", attempt: 1 } });
  await assert.rejects(controller.diagnoseDelivery(diagnosticRequest()), /INTEGRATION_STORAGE/);
});

test("diagnostic route is separately secured, private, uncached and exact-source bound", () => {
  const diagnostic = require("../src/router/routers").commsApi.internal.diagnoseCommunication;
  assert.equal(diagnostic.key, "/internal/communications/:intentCode/diagnostic");
  assert.equal(diagnostic.method, "POST"); assert.equal(diagnostic.secured, true);
  assert.deepEqual(diagnostic.authTokenTypes, ["service"]);
  assert.equal(diagnostic.permission, "communication.request");
  assert.equal(diagnostic.cache.enabled, false); assert.equal(diagnostic.requestPrivacy.sensitive, true);
  assert.deepEqual(diagnostic.requestBody.content["application/json"].schema.required, ["sourceModule", "sourceType", "sourceCode"]);
});

test("same-module wrong submission, source type and empty binding refuse before attempt reads", async () => {
  uncertainAttempt();
  for (const payload of [{}, { ...diagnosticRequest().payload, sourceCode: "WST_OTHER" }, { ...diagnosticRequest().payload, sourceType: "other" }]) {
    const r = diagnosticRequest(); r.payload = payload;
    await assert.rejects(controller.diagnoseDelivery(r), /INTEGRATION_(INPUT|CONTEXT)/);
  }
  assert.equal(attemptReads, 0);
});
