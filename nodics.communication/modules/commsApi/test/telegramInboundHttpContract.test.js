/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module commsApi/test/telegramInboundHttpContract @description Exercises native JSON streams through real nRouter binding, parser, private HTTP-to-owner mapping and raw response without a listener or network. @owner commsApi @layer test @override Retain unqualified capture and pre-body refusal evidence. */
const test = require("node:test");
const assert = require("node:assert/strict");
const { Readable } = require("node:stream");
const fixture = require("../../commsCore/test/helpers/telegramInboundFixture");
const binding = require("../../../../nodics.foundation/modules/nRouter/src/service/router/defaultRouterOperationService");
const requestHandler = require("../../../../nodics.foundation/modules/nRouter/src/service/defaultRequestHandlerService");
const pipeline = require("../../../../nodics.foundation/modules/nRouter/src/service/request/defaultRequestHandlerPipelineService");
const generator = require("../../../../nodics.foundation/modules/nRouter/src/service/tooling/defaultOpenapiContractGeneratorService");

/** Drives real request pipeline operations through an isolated completion harness. @param {Object} f Synthetic runtime. @returns {Function} Native JSON stream executor. */
function httpHarness(f) {
  const definition = generator.prepareConfiguredRoute({ routerDef: f.route, contextRoot: "nodics", urlPrefix: "commsApi", moduleName: "commsApi", groupName: "integration", routerName: "receiveTelegramStart", source: "module-router" });
  NODICS.getRouter = () => definition;
  SERVICE.DefaultRequestHandlerService = requestHandler;
  const owner = { ...pipeline, LOG: { debug() {}, warn() {} } };
  SERVICE.DefaultPipelineService = {
    start: async (name, input) => {
      assert.equal(name, "requestHandlerPipeline");
      f.logger.assertSensitiveRequest(input);
      const response = {};
      for (const operation of ["validateApiExposure", "helpRequest", "parseHeader", "parseBody", "handleSpecialRequest", "redirectRequest", "lookupCache", "handleRequest"]) {
        await new Promise((resolve, reject) => owner[operation](input, response, { nextSuccess: resolve, error: (req, res, error) => reject(error), stop: () => assert.fail("native route must use ordinary dispatch") }));
        if (operation === "redirectRequest") assert.equal(response.targetNode, "publicRequest");
      }
      return response.success;
    },
  };
  SERVICE.DefaultRouterService = { LOG: { error() {} } };
  return async (raw, change = () => {}) => {
    const request = Readable.from([Buffer.from(raw)]);
    Object.assign(request, {
      method: "POST", params: { receiverCode: "first" }, originalUrl: definition.url.replace(":receiverCode", "first"),
      headers: { "content-type": "application/json", "content-length": String(Buffer.byteLength(raw)), "x-telegram-bot-api-secret-token": f.secret },
      query: {}, get(name) { return this.headers[name.toLowerCase()]; },
    });
    change(request);
    const res = f.response();
    const done = new Promise((resolve) => { const json = res.json; res.json = function (data) { json.call(this, data); resolve(this); return this; }; });
    let registration;
    binding.post({ post: (...args) => { registration = args; } }, definition);
    const handlers = registration.slice(1).flat();
    let index = 0;
    const advance = (error) => {
      const handler = handlers[index++];
      if (!handler) { if (error) binding.sendPrivateError(request, res, error); else assert.fail("missing HTTP response"); return; }
      if (error) {
        if (handler.length === 4) handler(error, request, res, advance);
        else advance(error);
      } else if (handler.length !== 4) handler(request, res, advance);
      else advance();
    };
    f.logger.runRequestPrivacy(request, advance);
    return done;
  };
}

test("actual route owner validator and full OpenAPI document include valid public provider metadata", (t) => {
  const f = fixture(t);
  assert.equal(generator.isValidRoute("receiveTelegramStart", f.route), true);
  assert.throws(() => generator.isValidRoute("receiveTelegramStart", { ...f.route, accessGroups: [] }));
  const baseConfig = CONFIG.get;
  CONFIG.get = (key) => key === "servers" ? { options: { contextRoot: "nodics" } } : key === "cache" ? { routerLevelCache: {} } : baseConfig(key);
  NODICS.getModules = () => ({ commsApi: { metaData: { prefix: "commsApi" }, rawSchema: {} }, commsSchema: { metaData: {}, rawSchema: require("../../commsSchema/src/schemas/schemas").commsSchema } });
  NODICS.getServerName = NODICS.getServerRootName = () => "isolatedCommunicationServer";
  NODICS.getEnvironmentName = () => "isolated";
  NODICS.getNodeName = () => undefined;
  NODICS.getActiveModules = () => ["commsApi", "commsSchema"];
  UTILS.isRouterEnabled = (name) => name === "commsApi";
  const document = generator.createDocument({ rawRouters: require("../src/router/routers"), rawSchema: {}, options: { includeRuntimeSchemas: false }, warnings: [] });
  assert.equal(generator.validateDocument(document), true);
  const operation = document.paths["/nodics/commsApi/v0/integrations/telegram/{receiverCode}/start"].post;
  assert.equal(operation["x-nodics"].apiExposure, "communicationTelegramInbound");
  assert.deepEqual(operation["x-nodics"].requestPrivacy, { sensitive: true });
  assert.equal(Object.keys(document.paths).some((path) => path.includes("commsTelegramUpdate")), false);
  assert.equal(f.route.secured, false);
  assert.equal(f.route.publicAccess, true);
  assert.equal(require("../config/properties").apiExposure.categories.communicationTelegramInbound.enabled, false);
  assert.equal(require("../../commsCore/config/properties").communication.telegramInbound.enabled, false);
});

test("native HTTP stream yields Telegram method directly with no Nodics envelope; retry acknowledges empty", async (t) => {
  const f = fixture(t), execute = httpHarness(f);
  const first = await execute(JSON.stringify(f.update()));
  assert.equal(first.httpStatus, 200);
  assert.equal(first.contentType, "application/json");
  assert.equal(first.headers["Cache-Control"], "no-store");
  assert.equal(first.data.method, "sendMessage");
  assert.equal(first.data.reply_markup.inline_keyboard[0][0].web_app.url, "https://mini.example.test/app");
  assert.equal(Object.hasOwn(first.data, "data"), false);
  assert.equal(Object.hasOwn(first.data, "code"), false);
  const duplicate = await execute(JSON.stringify(f.update()));
  assert.equal(duplicate.httpStatus, 200);
  assert.deepEqual(duplicate.data, {});
});

test("invalid secret stops parser before reading stream/body; caller privacy flags cannot admit HTTP", async (t) => {
  const f = fixture(t), execute = httpHarness(f);
  const rejected = await execute("{not-json", (req) => {
    req.headers["x-telegram-bot-api-secret-token"] = "wrong";
    Object.defineProperty(req, "body", { get: () => assert.fail("body getter before authentication") });
    req._read = () => assert.fail("stream read before authentication");
  });
  assert.equal(rejected.httpStatus, 403);
  assert.equal(f.calls.length, 0);
  f.privacy.qualified = false;
  const unqualified = await execute(JSON.stringify(f.update()), (req) => { req.requestPrivacy = { sensitive: true }; req.captureProtectionQualified = true; });
  assert.equal(unqualified.httpStatus, 503);
  assert.equal(f.calls.length, 0);
});

test("malformed, excessive and pre-parsed native JSON refuse without private error data", async (t) => {
  const f = fixture(t), execute = httpHarness(f);
  for (const [raw, change, expectedStatus] of [
    ["{not-json", () => {}, 400],
    [JSON.stringify({ ...f.update(), extra: "x".repeat(70000) }), () => {}, 400],
    [JSON.stringify(f.update()), (req) => { req._body = true; }, 403],
  ]) {
    const result = await execute(raw, change);
    assert.equal(result.httpStatus, expectedStatus);
    assert.equal(JSON.stringify(result.data).includes(f.secret), false);
    assert.equal(JSON.stringify(result.data).includes("not-json"), false);
  }
  assert.equal(f.calls.length, 0);
});

test("controller rejects unadmitted requests before HTTP getters and preserves safe override dispatch", async (t) => {
  const f = fixture(t);
  const controller = CONTROLLER.DefaultCommunicationApiController;
  const input = { router: f.route };
  Object.defineProperty(input, "httpRequest", { get: () => assert.fail("unadmitted mapping") });
  await assert.rejects(controller.receiveTelegramStart(input), { code: "ERR_COMMS_TELEGRAM_CONTEXT" });
  const original = SERVICE.DefaultTelegramInboundService;
  SERVICE.DefaultTelegramInboundService = { ...original, launchReply(update, policy) { const reply = original.launchReply.call(this, update, policy); if (reply) reply.text = "Layered launch"; return reply; } };
  const result = await httpHarness(f)(JSON.stringify(f.update()));
  assert.equal(result.data.text, "Layered launch");
});
