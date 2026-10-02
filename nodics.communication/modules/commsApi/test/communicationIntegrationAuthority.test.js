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
 * @module commsApi/test/communicationIntegrationAuthority
 * @description Covers signed source-module admission, tenant/permission refusal,
 * private intent retry isolation and effective later-layer facade overrides.
 * @layer test
 * @owner commsApi
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const facade = require("../src/facade/defaultCommunicationApiFacade");
const intentCode = "COMM_" + "a".repeat(64);
let effects, reads, intents;

function request(sourceModule = "profile") {
  return {
    tenant: "test",
    intentCode,
    authData: {
      tokenType: "service",
      principalType: "service",
      serviceId: "platform-runtime",
      tenant: "test",
      permissions: ["communication.request"],
      modules: ["commsApi", "profile"],
    },
    payload: { sourceModule },
  };
}

test.beforeEach(() => {
  effects = [];
  reads = 0;
  intents = [{ code: intentCode, sourceModule: "profile" }];
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(code) {
        super(code);
        this.code = code;
      }
    },
  };
  global.CONFIG = {
    get: (key) =>
      key === "communication"
        ? { trustedSourceModules: ["profile", "order"] }
        : { projections: { operation: ["intentCode", "status"] } },
  };
  global.SERVICE = {
    DefaultLoggerService: { hasPrivateCaptureProtection: () => true },
    DefaultCommunicationRuntimeService: {
      request: async (r, command) => {
        effects.push(["request", command.sourceModule, r.tenant]);
        return { intentCode, status: "QUEUED" };
      },
      list: async (schema, r, query, limit) => {
        reads++;
        assert.equal(schema, "CommsIntent");
        assert.equal(r.tenant, "test");
        assert.deepEqual(query, { code: intentCode });
        assert.equal(limit, 2);
        return structuredClone(intents);
      },
      resolveUncertain: async () => {
        effects.push(["resolve"]);
        return { intentCode, status: "DELIVERED" };
      },
    },
    DefaultCommunicationOperationsService: {
      retry: async () => {
        effects.push(["retry"]);
        return { intentCode, status: "RETRY_PENDING", private: "hidden" };
      },
    },
  };
});

test("configured and signed source authority admits one private request", async () => {
  assert.equal((await facade.requestCommunication(request())).status, "QUEUED");
  assert.deepEqual(effects, [["request", "profile", "test"]]);
});

test("configured source names cannot impersonate another signed module", () => {
  assert.throws(
    () => facade.requestCommunication(request("order")),
    /ERR_COMMS_INTEGRATION_CONTEXT/,
  );
  assert.deepEqual(effects, []);
});

test("human, missing module, wildcard-only permission and tenant drift reject before effects", () => {
  for (const change of [
    { principalType: "human" },
    { tokenType: "human" },
    { modules: ["profile"] },
    { permissions: ["*"] },
    { tenant: "other" },
  ]) {
    const r = request();
    Object.assign(r.authData, change);
    assert.throws(
      () => facade.requestCommunication(r),
      /ERR_COMMS_INTEGRATION_CONTEXT/,
    );
  }
  assert.deepEqual(effects, []);
});

test("body authority and absent source never authorize requests", () => {
  const r = request();
  delete r.payload.sourceModule;
  r.payload.authData = request().authData;
  assert.throws(() => facade.requestCommunication(r), /CONTEXT/);
  assert.deepEqual(effects, []);
});

test("retry and resolution authorize the stored source, never a caller-selected source", async () => {
  const r = request();
  r.payload = {};
  assert.deepEqual(await facade.retryDelivery(r), {
    intentCode,
    status: "RETRY_PENDING",
  });
  await facade.resolveDelivery(r);
  assert.equal(reads, 2);
  assert.deepEqual(effects, [["retry"], ["resolve"]]);
});

test("another source's stored intent cannot be retried or resolved", async () => {
  intents[0].sourceModule = "order";
  const r = request();
  r.payload = {};
  await assert.rejects(facade.retryDelivery(r), /CONTEXT/);
  await assert.rejects(facade.resolveDelivery(r), /CONTEXT/);
  assert.deepEqual(effects, []);
});

test("unadmitted service cannot inspect private intents", async () => {
  const r = request();
  r.payload = {};
  r.authData.permissions = [];
  await assert.rejects(facade.retryDelivery(r), /CONTEXT/);
  assert.equal(reads, 0);
});

test("missing, duplicate or malformed intent identity cannot imply authority", async () => {
  const r = request();
  r.payload = {};
  for (const rows of [[], [intents[0], intents[0]], [{ code: intentCode }]]) {
    intents = rows;
    await assert.rejects(facade.retryDelivery(r), /CONTEXT/);
  }
  r.intentCode = "arbitrary";
  await assert.rejects(facade.resolveDelivery(r), /CONTEXT/);
  assert.deepEqual(effects, []);
});

test("failed private read never becomes absence or a retry grant", async () => {
  SERVICE.DefaultCommunicationRuntimeService.list = async () => {
    throw Error("owner unavailable");
  };
  const r = request();
  r.payload = {};
  await assert.rejects(facade.retryDelivery(r), /owner unavailable/);
  assert.deepEqual(effects, []);
});

test("later-layer source override participates in effective facade admission", () => {
  const effective = {
    ...facade,
    authorizeSource() {
      throw Error("deployment source restricted");
    },
  };
  assert.throws(
    () => effective.requestCommunication(request()),
    /deployment source restricted/,
  );
  assert.deepEqual(effects, []);
});
