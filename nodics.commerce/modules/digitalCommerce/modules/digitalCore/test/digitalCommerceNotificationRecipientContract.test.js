/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module digitalCore/test/digitalCommerceNotificationRecipientContract @description Deferred source-bound Profile recipient and private committed-source fixtures. @layer test @owner digitalCore */
const test = require("node:test");
const assert = require("node:assert/strict");
const adapter = require("../src/service/defaultDigitalCommerceNotificationRecipientService");
const owner = require("../src/service/defaultDigitalCommerceNotificationService");
const source = {
  kind: "PURCHASED",
  orderCode: "order",
  sourceCode: "unit",
  orderRevision: 3,
};
const request = {
  tenant: "tenant",
  enterpriseCode: "seller",
  ownerId: "buyer",
  channel: "EMAIL",
  source,
};
/** Installs isolated contract doubles only when a future authorized suite runs. @param {Object} t Test context. @returns {void} */
function fixture(t) {
  const previous = {
    SERVICE: global.SERVICE,
    CONFIG: global.CONFIG,
    CLASSES: global.CLASSES,
  };
  t.after(() => Object.assign(global, previous));
  global.CLASSES = { NodicsError: class extends Error {} };
  global.CONFIG = {
    get: () => ({
      notifications: {
        recipientResolution: {
          qualified: true,
          connectionName: "profile",
          timeoutMilliseconds: 10000,
        },
      },
    }),
  };
  const protectedRequests = new WeakSet();
  global.SERVICE = {
    DefaultLoggerService: {
      runSensitiveOperation: (r, execute) => {
        protectedRequests.add(r);
        return execute();
      },
      hasPrivateCaptureProtection: (r) => protectedRequests.has(r),
    },
  };
}
test("recipient request sends only fixed source coordinates, never supplied buyer or address", async (t) => {
  fixture(t);
  global.SERVICE.DefaultModuleService = {
    invokeModule: async (command) => {
      assert.equal(command.local, false);
      assert.equal(command.moduleName, "profile");
      assert.equal(
        command.apiName,
        "/internal/commerce/notification-recipient",
      );
      assert.equal(command.requireInternalAuth, true);
      assert.deepEqual(command.secureTransport, {
        required: true,
        allowInsecureLoopback: false,
      });
      assert.deepEqual(command.requestBody, { channel: "EMAIL", source });
      return {
        data: {
          contractVersion: 1,
          ...request,
          verified: true,
          recipientId: "contact",
          recipientAddressReference: "canonical-contact",
        },
      };
    },
  };
  assert.equal(
    (await adapter.resolve({ ...request, recipient: "browser@invalid.test" }))
      .recipientId,
    "contact",
  );
});
test("recipient proof rejects wrong buyer, revision, channel and failed private envelopes", async (t) => {
  fixture(t);
  for (const drift of [
    { ownerId: "other" },
    { source: { ...source, orderRevision: 4 } },
    { channel: "SMS" },
    { error: { private: "provider-secret" } },
  ]) {
    global.SERVICE.DefaultModuleService = {
      invokeModule: async () => ({
        contractVersion: 1,
        ...request,
        verified: true,
        recipientId: "contact",
        recipientAddressReference: "canonical-contact",
        ...drift,
      }),
    };
    await assert.rejects(
      adapter.resolve(request),
      (error) => error.message === "ERR_DIGITAL_NOTIFICATION_UNCONFIRMED",
    );
  }
});
test("unqualified recipient resolution cannot invoke transport", async (t) => {
  fixture(t);
  global.CONFIG.get = () => ({
    notifications: { recipientResolution: { qualified: false } },
  });
  global.SERVICE.DefaultModuleService = {
    invokeModule: () => assert.fail("unexpected transport"),
  };
  await assert.rejects(
    adapter.resolve(request),
    /ERR_DIGITAL_NOTIFICATION_UNCONFIRMED/,
  );
});
test("source proof derives buyer from order and returns only exact committed coordinates", async (t) => {
  fixture(t);
  const auth = {
    principalType: "service",
    entCode: "seller",
    modules: ["profile", "digitalCore"],
    permissions: ["commerce.digital.notification.source.read"],
  };
  global.SERVICE.DefaultServiceTokenService = {
    requireRuntimePrincipal: () => auth,
  };
  global.SERVICE.DefaultLoggerService.hasPrivateCaptureProtection = () => true;
  global.SERVICE.DefaultModuleService = { isLocalModuleActive: () => true };
  global.SERVICE.DefaultModuleRegistrationAgentService = {
    assertModuleOperational: async () => {},
  };
  global.CONFIG.get = (name) =>
    name === "apiExposure"
      ? { categories: { commerceNotificationSources: { enabled: true } } }
      : { notifications: { recipientResolution: { qualified: true } } };
  const service = {
    ...owner,
    policy: () => ({}),
    one: async () => ({ ownerId: "buyer", revision: 3 }),
    evidence: async (r) => {
      assert.equal(r.ownerId, "buyer");
      return { order: { revision: 3 }, items: [{ code: "unit" }] };
    },
  };
  const input = {
    tenant: "tenant",
    payload: { ...source, channel: "EMAIL" },
    authData: auth,
  };
  assert.deepEqual(await service.recipientSource(input), {
    contractVersion: 1,
    sourceModule: "digitalCore",
    sourceType: "DIGITAL_COUPON_PURCHASED",
    committed: true,
    tenant: "tenant",
    enterpriseCode: "seller",
    ownerId: "buyer",
    channel: "EMAIL",
    source,
  });
  await assert.rejects(
    service.recipientSource({
      ...input,
      payload: { ...input.payload, ownerId: "other" },
    }),
    /ERR_DIGITAL_NOTIFICATION_UNCONFIRMED/,
  );
  service.one = async () => ({ ownerId: "buyer", revision: 4 });
  await assert.rejects(
    service.recipientSource(input),
    /ERR_DIGITAL_NOTIFICATION_UNCONFIRMED/,
  );
  service.one = async () => ({ ownerId: "buyer", revision: 3 });
  global.SERVICE.DefaultModuleService.isLocalModuleActive = () => false;
  await assert.rejects(
    service.recipientSource(input),
    /ERR_DIGITAL_NOTIFICATION_UNCONFIRMED/,
  );
});
test("source proof normalizes owner private errors", async (t) => {
  fixture(t);
  const service = { ...owner };
  global.SERVICE.DefaultServiceTokenService = {
    requireRuntimePrincipal: () => {
      throw new Error("private-runtime-secret");
    },
  };
  await assert.rejects(
    service.recipientSource({}),
    (error) => error.message === "ERR_DIGITAL_NOTIFICATION_UNCONFIRMED",
  );
});
test("recipient private entry cannot be forged and loopback remains explicit", async (t) => {
  fixture(t);
  let calls = 0;
  global.SERVICE.DefaultModuleService = {
    invokeModule: async (command) => {
      calls++;
      assert.deepEqual(command.secureTransport, {
        required: true,
        allowInsecureLoopback: true,
      });
      return {
        contractVersion: 1,
        ...request,
        verified: true,
        recipientId: "contact",
        recipientAddressReference: "canonical-contact",
      };
    },
  };
  await assert.rejects(
    adapter.resolvePrivate(request, { requestPrivacy: { sensitive: true } }),
    /ERR_DIGITAL_NOTIFICATION_UNCONFIRMED/,
  );
  assert.equal(calls, 0);
  global.CONFIG.get = () => ({
    notifications: {
      recipientResolution: {
        qualified: true,
        connectionName: "profile",
        timeoutMilliseconds: 10000,
        allowInsecureLoopback: true,
      },
    },
  });
  assert.equal((await adapter.resolve(request)).recipientId, "contact");
  global.SERVICE.DefaultLoggerService.runSensitiveOperation = () => {
    throw new Error("unqualified-capture");
  };
  await assert.rejects(
    adapter.resolve(request),
    /ERR_DIGITAL_NOTIFICATION_UNCONFIRMED/,
  );
  assert.equal(calls, 1);
});
