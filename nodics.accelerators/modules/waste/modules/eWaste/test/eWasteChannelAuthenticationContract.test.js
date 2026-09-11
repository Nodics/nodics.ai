/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module eWaste/test/eWasteChannelAuthenticationContract @description Proves domain-owned channel entry, authenticated linking, trusted configuration and replaceable policy over Profile. @owner eWaste @layer test */
const { test, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const service = require("../src/service/defaultEWasteChannelAuthenticationService");
const controller = require("../src/controller/defaultEWasteChannelAuthenticationController");
let config, calls, reply;
class OwnerError extends Error {
  constructor(input, message, code) {
    super(message || (typeof input === "string" ? input : input.message));
    this.code = code || input.code || input;
  }
}
const req = () => ({
  channel: "TELEGRAM",
  proof: "proof",
  entCode: "enterprise-a",
  tenant: "tenant-a",
  httpRequest: { headers: { origin: "http://localhost:5176" } },
});
beforeEach(() => {
  config = {
    channelAuthentication: {
      enabled: true,
      timeoutMs: 9000,
      channels: {
        TELEGRAM: {
          enabled: true,
          applicationCode: "configured-app",
          seamlessSignIn: true,
        },
      },
    },
  };
  calls = [];
  reply = { requiresProfileSession: false, handoffToken: "opaque-handoff" };
  global.CONFIG = { get: (key) => (key === "eWaste" ? config : undefined) };
  global.CLASSES = { NodicsError: OwnerError };
  global.SERVICE = {
    DefaultEWasteChannelAuthenticationService: service,
    DefaultEWasteExperienceService: { unwrap: (x) => x.result },
    DefaultModuleService: {
      invokeModule: async (args) => {
        calls.push(args);
        return { result: reply };
      },
    },
  };
});
test("entry requests Profile handoff using trusted application configuration and internal service identity", async () => {
  const result = await service.enter({
    ...req(),
    applicationCode: "attacker",
    authData: { principalType: "customer" },
    authorization: "Bearer caller",
  });
  assert.deepEqual(result, {
    contractVersion: 1,
    channel: "TELEGRAM",
    requiresAuthentication: false,
    handoffToken: "opaque-handoff",
  });
  assert.equal(calls[0].apiName, "/internal/external-identity/browser-handoff");
  assert.deepEqual(calls[0].requestBody, {
    applicationCode: "configured-app",
    proof: "proof",
  });
  assert.equal(calls[0].header.Authorization, undefined);
  assert.equal(calls[0].header.Origin, "http://localhost:5176");
  assert.equal(calls[0].maxAttempts, 1);
});
test("unlinked customer selects the shared account form without identity disclosure", async () => {
  reply = { requiresProfileSession: true, loginId: "must-not-project" };
  assert.deepEqual(await service.enter(req()), {
    contractVersion: 1,
    channel: "TELEGRAM",
    requiresAuthentication: true,
  });
});
test("later-layer policy disables seamless sign-in but still validates channel launch", async () => {
  config.channelAuthentication.channels.TELEGRAM.seamlessSignIn = false;
  reply = { provider: "TELEGRAM" };
  assert.equal((await service.enter(req())).requiresAuthentication, true);
  assert.equal(calls[0].apiName, "/customer/external/launch");
});
test("unknown, disabled and unconfigured channels cannot invoke Profile", async () => {
  await assert.rejects(service.enter({ ...req(), channel: "WHATSAPP" }), {
    code: "ERR_EWASTE_CHANNEL_UNAVAILABLE",
  });
  config.channelAuthentication.enabled = false;
  await assert.rejects(service.enter(req()), {
    code: "ERR_EWASTE_CHANNEL_UNAVAILABLE",
  });
  assert.equal(calls.length, 0);
});
test("link requires the authenticated customer bearer and forwards no body principal", async () => {
  await assert.rejects(service.link(req()), {
    code: "ERR_EWASTE_CHANNEL_IDENTITY",
  });
  reply = { linked: true };
  const request = req();
  request.authData = {
    principalType: "customer",
    entCode: "enterprise-a",
    tenant: "tenant-a",
  };
  request.httpRequest.headers.authorization = "Bearer customer";
  assert.equal((await service.link(request)).linked, true);
  assert.equal(calls[0].header.Authorization, "Bearer customer");
  assert.equal(calls[0].requestBody.loginId, undefined);
});
test("Profile conflicts and proof failures propagate without a fallback session", async () => {
  SERVICE.DefaultModuleService.invokeModule = async () => {
    throw new OwnerError("ERR_PROFILE_EXTERNAL_CONFLICT");
  };
  await assert.rejects(service.enter(req()), {
    code: "ERR_EWASTE_CHANNEL_LINK_CONFLICT",
  });
});
test("controller allowlists route channel/proof and prevents response caching", async () => {
  let mapped, cache;
  SERVICE.DefaultEWasteChannelAuthenticationService = {
    enter: async (request) => {
      mapped = request;
      return { requiresAuthentication: true };
    },
  };
  const response = await controller.enter({
    entCode: "trusted",
    httpRequest: {
      params: { channel: "TELEGRAM" },
      body: {
        proof: "proof",
        channel: "EVIL",
        tenant: "evil",
        applicationCode: "evil",
      },
    },
    httpResponse: { setHeader: (key, value) => (cache = [key, value]) },
  });
  assert.equal(mapped.channel, "TELEGRAM");
  assert.equal(mapped.entCode, "trusted");
  assert.equal(mapped.applicationCode, undefined);
  assert.deepEqual(cache, ["Cache-Control", "no-store"]);
  assert.equal(response.data.requiresAuthentication, true);
});

test("remote proof and transport failures retain domain-owned HTTP error categories", async () => {
  for (const [remote, expected] of [
    ["ERR_PROFILE_EXTERNAL_ASSERTION", "ERR_EWASTE_CHANNEL_IDENTITY"],
    ["ETIMEDOUT", "ERR_EWASTE_CHANNEL_UNAVAILABLE"],
  ]) {
    SERVICE.DefaultModuleService.invokeModule = async () => {
      throw new OwnerError(remote);
    };
    await assert.rejects(service.enter(req()), { code: expected });
  }
});

test("real Nodics error normalization preserves the local HTTP 409 status", async () => {
  const NodicsError = require("../../../../../../nodics.foundation/modules/nCommon/src/lib/nodicsError");
  const definitions = require("../src/utils/statusDefinitions");
  const previousGet = CONFIG.get;
  CONFIG.get = (key) =>
    key === "defaultErrorCodes"
      ? { NodicsError: "ERR_SYS_00000" }
      : previousGet(key);
  SERVICE.DefaultStatusService = {
    get: (code) => definitions[code] || { code: "500", message: "Error" },
  };
  CLASSES.NodicsError = NodicsError;
  SERVICE.DefaultModuleService.invokeModule = async () => {
    throw new OwnerError("ERR_PROFILE_EXTERNAL_CONFLICT");
  };
  await assert.rejects(
    service.enter(req()),
    (error) =>
      error.code === "ERR_EWASTE_CHANNEL_LINK_CONFLICT" &&
      error.responseCode === "409",
  );
});
