/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
/** @module profile/test/profileCouponRecipientHttpAdmission @description Composes private HTTP middleware, request envelope, secured pipeline admission and real coupon controller with bounded fixed diagnostics. @owner profile @layer test */
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const foundation = "../../../../nodics.foundation/modules/";
const privacy = require(foundation + "nConfig/src/service/DefaultLoggerService");
const routing = require(foundation + "nRouter/src/service/router/defaultRouterOperationService");
const handler = require(foundation + "nRouter/src/service/defaultRequestHandlerService");
const secured = require(foundation + "nRouter/src/service/request/defaultSecuredRequestPipelineService");
const dispatch = require(foundation + "nRouter/src/service/request/defaultRequestHandlerPipelineService");
const coupon = require("../src/service/identity/defaultProfileCouponNotificationRecipientService");

test("private HTTP coupon admission distinguishes policy/input and preserves generic unauthorized refusals", async t => {
  const keys = ["CONFIG", "SERVICE", "CLASSES", "UTILS", "NODICS", "FACADE", "CONTROLLER"];
  const saved = keys.map(key => [key, Object.getOwnPropertyDescriptor(global, key)]);
  t.after(() => saved.forEach(([key, descriptor]) => descriptor ? Object.defineProperty(global, key, descriptor) : delete global[key]));
  for (const mode of ["VALID", "POLICY", "INPUT", "RUNTIME", "PRIVACY", "PERMISSION"]) {
    const config = { ...structuredClone(require("../config/properties")),
      authSecurity: structuredClone(require(foundation + "nAuth/config/properties").authSecurity),
      log: { requestPrivacy: { qualified: true, captureMode: "disabled" } },
      responseHandler: { jsonResponseHandler: "TestResponse" },
      defaultErrorCodes: { NodicsError: "ERR_SYS_00000" } };
    config.profileCouponNotifications.enabled = true;
    if (mode === "POLICY") config.profileNotificationRecipients.maximumGroups = 0;
    const definitions = { ...require("../src/utils/statusDefinitions"), ERR_AUTH_00003: { code: "403", message: "Access Denied" }, ERR_SYS_00000: { code: "500", message: "Unknown error" } };
    global.CONFIG = { get: key => key.split(".").reduce((value, part) => value?.[part], config) };
    global.UTILS = { generateUniqueCode: () => "isolated-request", isObject: value => value !== null && typeof value === "object" };
    global.CLASSES = { NodicsError: require(foundation + "nCommon/src/lib/nodicsError") };
    const route = { ...require("../src/router/routers").profile.couponNotificationRecipients.resolve,
      moduleName: "profile", routerName: "couponNotificationRecipients.resolve", active: true };
    global.NODICS = { getRouter: () => route };
    const auth = { principalType: "service", tokenType: "service", serviceId: "runtime", tenant: "default", entCode: "default",
      modules: ["digitalCore", "workflow", "commsApi", "profile"], permissions: [config.profileCouponNotifications.permission],
      runtimeInstanceId: "instance", runtimeScope: { projectCode: "project", environmentCode: "unit", serverCode: "commerceServer", instanceCode: "instance", assignmentCode: "grant" } };
    if (mode === "RUNTIME") delete auth.runtimeInstanceId;
    if (mode === "PERMISSION") auth.permissions = [];
    const body = { channel: "IN_APP", source: { enterpriseCode: "store", entitlementCode: "digitalEntitlement:" + "a".repeat(40), occurrenceKey: "COUPON_EXPIRY_" + "b".repeat(64) } };
    if (mode === "INPUT") body.source.occurrenceKey += "\n";
    const http = { method: "POST", protocol: "http", hostname: "localhost", originalUrl: route.key,
      get: () => undefined, body, headers: { "x-enterprise-code": "default", "x-tenant-code": "default" } };
    let done, rpc = 0, entered = 0;
    const result = new Promise(resolve => { done = resolve; });
    const response = { setHeader() {}, status(code) { this.statusCode = code; return this; }, json(value) { done({ status: this.statusCode, body: value }); } };
    global.SERVICE = {
      DefaultLoggerService: privacy, DefaultStatusService: { get: code => definitions[code] },
      DefaultServiceTokenService: require(foundation + "nAuth/src/service/identity/defaultServiceTokenService"),
      DefaultProfileCouponNotificationRecipientService: coupon,
      DefaultProfileNotificationRecipientService: require("../src/service/identity/defaultProfileNotificationRecipientService"),
      DefaultProfileCommerceNotificationRecipientService: require("../src/service/customer/defaultProfileCommerceNotificationRecipientService"),
      DefaultRequestHandlerService: handler,
      DefaultModuleService: { invokeModule: async call => { rpc++; return { data: {
        contractVersion: 1, tenant: "default", sourceModule: "digitalCore", sourceType: "DIGITAL_COUPON_EXPIRING",
        source: structuredClone(call.requestBody), eligible: false,
      } }; } },
      TestResponse: {
        handleSuccess: (_req, res, value) => res.status(200).json(value.success),
        handleError: (req, res, error) => routing.sendPrivateError(req, res, error),
      },
      // Substitute token verification/storage only; execute real authorization and dispatch steps.
      DefaultPipelineService: { start: async (_name, input, output) => {
        input.authData = structuredClone(auth); input.tenant = "default";
        await new Promise((resolve, reject) => secured.checkAccess(input, output, { nextSuccess: resolve, error: (_r, _s, e) => reject(e) }));
        if (mode === "PRIVACY") input = { ...input };
        entered++;
        return new Promise((resolve, reject) => dispatch.handleRequest.call({ ...dispatch, LOG: { debug() {} } }, input, output,
          { nextSuccess: (_r, value) => resolve(value), error: (_r, _s, e) => reject(e) }));
      } },
    };
    global.FACADE = { DefaultProfileCouponNotificationRecipientFacade: require("../src/facade/identity/defaultProfileCouponNotificationRecipientFacade") };
    global.CONTROLLER = { DefaultProfileCouponNotificationRecipientController: require("../src/controller/identity/defaultProfileCouponNotificationRecipientController") };
    privacy.runRequestPrivacy(http, () => routing.privacyMiddleware(route)(http, response, () => routing.bindOperation(http, response, route)));
    const out = await result;
    if (mode === "VALID") { assert.equal(out.status, 200); assert.equal(rpc, 2); }
    else {
      assert.equal(out.status, 403, mode);
      assert.equal(out.body.code, ["POLICY", "INPUT"].includes(mode) ? "ERR_PROFILE_COUPON_RECIPIENT_" + mode : "ERR_AUTH_00003", mode);
      assert.deepEqual(Object.keys(out.body).sort(), ["code", "message", "responseCode"]);
      assert.equal(rpc, 0);
    }
    assert.equal(entered, mode === "PERMISSION" ? 0 : 1);
  }
});
