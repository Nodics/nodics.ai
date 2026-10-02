/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module router/test/RequestCapturePrivacyContract
 * @description Deferred trusted route, pre-parser binding, HTTP-to-pipeline
 * proof, cache exclusion and private error-envelope fixtures. NOT RUN in batch.
 * @layer test
 * @owner nRouter
 * @override Customize trusted route metadata; never accept HTTP privacy flags.
 */
const assert = require("node:assert/strict");
const logger = require("../../nConfig/src/service/DefaultLoggerService");
const owner = require("../src/service/router/defaultRouterOperationService");
const configuration = require("../src/service/config/defaultRouterConfigurationService");
const requestHandler = require("../src/service/defaultRequestHandlerService");
const pipeline = require("../src/service/request/defaultRequestHandlerPipelineService");

/** Provides an in-memory response recorder, never a listener. */
function response() {
  return {
    status(code) {
      this.httpStatus = code;
      return this;
    },
    json(data) {
      this.data = data;
      return this;
    },
    setHeader() {},
  };
}

/** Executes deferred source fixtures with restored runtime globals. */
async function main() {
  const priorLog = Object.getOwnPropertyDescriptor(pipeline, "LOG");
  const keys = ["CONFIG", "SERVICE", "NODICS", "UTILS", "CONTROLLER"];
  const prior = new Map(
    keys.map((key) => [key, Object.getOwnPropertyDescriptor(global, key)]),
  );
  const policy = { qualified: true, captureMode: "disabled" };
  const route = {
    url: "/internal/session-context/validate",
    routerName: "validate",
    moduleName: "profile",
    active: true,
    controller: "Profile",
    operation: "validate",
    requestPrivacy: { sensitive: true },
  };
  let current = route;
  let captured;
  global.CONFIG = {
    get: (key) =>
      ({
        log: { requestPrivacy: policy },
        bodyParserHandler: { jsonBodyParserHandler: "Parser" },
        responseHandler: { jsonResponseHandler: "Response" },
        cache: { cacheability: { logSkippedReason: false } },
      })[key],
  };
  global.NODICS = { getRouter: () => current };
  global.UTILS = {
    generateUniqueCode: () => "owner-generated-id",
    generateHash: () => assert.fail("private cache key must not be generated"),
  };
  global.SERVICE = {
    DefaultLoggerService: logger,
    DefaultRouterOperationService: owner,
    DefaultRequestHandlerService: {
      startRequestHandler: (req, res, def) =>
        requestHandler.startRequestHandler(req, res, def),
    },
    DefaultPipelineService: {
      start: (name, input) => {
        logger.assertSensitiveRequest(input);
        captured = input;
        return Promise.resolve({});
      },
    },
    DefaultCacheConfigurationService: {
      createApiKey: () => assert.fail("raw proof must not enter cache owner"),
    },
    DefaultCacheService: {
      put: () => assert.fail("private result must not be cached"),
    },
    DefaultStatusService: {
      get: (code) => {
        if (code !== "ERR_TEST_400") throw new Error("unknown");
        return { code: "400", message: "Owner-defined rejection" };
      },
    },
    DefaultRouterService: {
      LOG: {
        error: () =>
          assert.fail("private diagnostic must not reach custom error sink"),
      },
    },
    Parser: { getBodyParser: () => [function parser() {}] },
    Response: { handleSuccess() {}, handleError() {} },
  };
  global.CONTROLLER = {
    Profile: {
      validate: (input, done) => done(null, { result: "private-proof-result" }),
    },
  };
  pipeline.LOG = { debug() {}, warn() {} };
  try {
    const registrations = [];
    owner.post({ post: (...args) => registrations.push(args) }, route);
    assert.equal(registrations[0][0], route.url);
    assert.equal(typeof registrations[0][1], "function");
    assert.equal(Array.isArray(registrations[0][2]), true);
    assert.equal(registrations[0][3], owner.privacyParserError);
    const req = {
      body: { authToken: "original.signed.jwt" },
      headers: { authorization: "Bearer separate-service.jwt" },
      get: () => undefined,
      method: "POST",
    };
    const res = response();
    logger.runRequestPrivacy(req, () =>
      registrations[0][1](req, res, () => owner.bindOperation(req, res, route)),
    );
    await Promise.resolve();
    assert.equal(captured.httpRequest, req);
    logger.assertSensitiveRequest(captured);
    assert.equal(logger.hasPrivateCaptureProtection(captured.body), false);
    let continued = false;
    pipeline.lookupCache(
      captured,
      {},
      {
        nextSuccess: () => {
          continued = true;
        },
      },
    );
    assert.equal(continued, true);
    pipeline.handleRequest(
      captured,
      {},
      { nextSuccess() {}, error: () => assert.fail() },
    );
    const invalid = response();
    owner.privacyParserError(
      new Error("original.signed.jwt"),
      req,
      invalid,
      () => assert.fail(),
    );
    assert.equal(invalid.httpStatus, 400);
    assert.equal(
      JSON.stringify(invalid.data).includes("original.signed.jwt"),
      false,
    );
    const privateFailure = {
      code: "ERR_TEST_400",
      message: "original.signed.jwt",
      errors: [{ message: "password" }],
      metadata: req.body,
    };
    const rejected = response();
    assert.equal(owner.sendPrivateError(req, rejected, privateFailure), true);
    assert.deepEqual(rejected.data, {
      responseCode: "400",
      code: "ERR_TEST_400",
      message: "Owner-defined rejection",
    });
    policy.qualified = false;
    const gated = response();
    const gatedReq = {};
    logger.runRequestPrivacy(gatedReq, () =>
      owner.privacyMiddleware(route)(gatedReq, gated, () => assert.fail()),
    );
    assert.equal(gated.httpStatus, 503);
    policy.qualified = true;
    const missingEarly = response();
    owner.privacyMiddleware(route)({}, missingEarly, () => assert.fail());
    assert.equal(missingEarly.httpStatus, 503);
    assert.throws(
      () => owner.privacyMiddleware({ requestPrivacy: { sensitive: false } }),
      /privacy metadata/,
    );
    const ordinary = { ...route };
    delete ordinary.requestPrivacy;
    const ordinaryReq = {
      body: {
        requestPrivacy: { sensitive: true },
        captureProtectionQualified: true,
      },
    };
    current = ordinary;
    logger.runRequestPrivacy(ordinaryReq, () =>
      owner.privacyMiddleware(ordinary)(ordinaryReq, response(), () => {
        assert.equal(logger.isSensitiveRequest(ordinaryReq), false);
        assert.equal(logger.hasPrivateCaptureProtection(ordinaryReq), false);
        current = route;
        const changed = response();
        owner.bindOperation(ordinaryReq, changed, ordinary);
        assert.equal(changed.httpStatus, 503);
      }),
    );
    const pin = owner.privacyMiddleware(route);
    current = ordinary;
    const pinnedReq = {};
    logger.runRequestPrivacy(pinnedReq, () =>
      pin(pinnedReq, response(), () =>
        logger.assertSensitiveRequest(pinnedReq),
      ),
    );
    const hooks = [];
    const app = { use: (middleware) => hooks.push(middleware) };
    configuration.executeRouterConfig(app, {
      initProperties: () => assert.equal(hooks.length, 1),
      initLogger: () => assert.equal(hooks.length, 1),
    });
    configuration.executeRouterConfig(app, {});
    assert.equal(hooks.length, 1);
  } finally {
    for (const [key, descriptor] of prior) {
      if (descriptor) Object.defineProperty(global, key, descriptor);
      else delete global[key];
    }
    if (priorLog) Object.defineProperty(pipeline, "LOG", priorLog);
    else delete pipeline.LOG;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
