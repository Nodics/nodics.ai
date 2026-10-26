/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module eWaste/test/eWasteDigitalSaleDiagnostics @description Exercises real layered status registration, NodicsError and private response serialization without native calls. @layer test @owner eWaste */
const test = require("node:test"), assert = require("node:assert/strict"), path = require("node:path");
const merge = require("lodash/merge");
const root = path.resolve(__dirname, "../../../../../..");
const foundation = path.join(root, "nodics.foundation/modules");
const diagnostics = require("../src/utils/digitalSaleDiagnostics");
const controller = require("../src/controller/defaultEWasteDigitalSaleController");
const NodicsError = require(path.join(foundation, "nCommon/src/lib/nodicsError"));
const router = require(path.join(foundation, "nRouter/src/service/router/defaultRouterOperationService"));

function fixture(t, registered = true) {
  const keys = ["CONFIG", "UTILS", "NODICS", "SERVICE", "CLASSES"];
  const previous = Object.fromEntries(keys.map(key => [key, global[key]]));
  t.after(() => { for (const key of keys) {
    if (previous[key] === undefined) delete global[key]; else global[key] = previous[key];
  } });
  global.CONFIG = { get: key => key === "defaultErrorCodes" ? { NodicsError: "ERR_SYS_00000" } : undefined };
  global.UTILS = merge({}, require(path.join(foundation, "nConfig/src/utils/utils")),
    require(path.join(foundation, "nCommon/src/utils/utils")), require(path.join(foundation, "nDatabase/database/src/utils/utils")));
  global.NODICS = {
    getNodicsHome: () => root,
    getIndexedModules: () => [
      { path: path.join(foundation, "nCommon") },
      ...(registered ? [{ path: path.resolve(__dirname, "..") }] : []),
    ],
  };
  global.CLASSES = { NodicsError };
  global.SERVICE = {
    DefaultFilesLoaderService: merge({}, require(path.join(foundation, "nConfig/src/service/defaultFilesLoaderService")), { LOG: { debug() {} } }),
    DefaultStatusService: merge({}, require(path.join(foundation, "nService/src/service/status/defaultStatusService")), { statusMap: {} }),
    DefaultLoggerService: { isSensitiveRequest: () => true },
  };
  SERVICE.DefaultStatusService.loadStatusDefinitions();
  return merge({}, controller);
}

function response(error) {
  let status, body;
  assert.equal(router.sendPrivateError({}, { status(value) { status = value; return this; }, json(value) { body = value; } }, error), true);
  return { status, body };
}

test("every static sale diagnostic survives real registration, constructor, cloned controller and callback", async t => {
  const loaded = fixture(t);
  for (const [message, code] of Object.entries(diagnostics.codes)) {
    assert.deepEqual(SERVICE.DefaultStatusService.get(code), diagnostics.statuses[code]);
    SERVICE.DefaultEWasteDigitalSaleService = { invoke: async () => { throw new Error(message); } };
    const request = { httpRequest: { params: { phase: "evidence" }, body: {} } };
    const error = await new Promise(resolve => { loaded.invoke(request, failure => resolve(failure)); });
    assert.ok(error instanceof NodicsError);
    assert.equal(error.code, code);
    assert.deepEqual(response(error), { status: 503, body: { responseCode: "503", code, message } });
  }
});

test("missing runtime status registration fails closed through the real constructor", async t => {
  const loaded = fixture(t, false);
  SERVICE.DefaultEWasteDigitalSaleService = { invoke: async () => { throw new Error("Retained Product proof changed"); } };
  await assert.rejects(loaded.invoke({ httpRequest: { params: { phase: "evidence" } } }), error => {
    assert.ok(error instanceof NodicsError);
    assert.equal(error.code, "ERR_SYS_00000");
    assert.equal(response(error).status, 500);
    assert.equal(JSON.stringify(response(error)).includes("Retained Product"), false);
    return true;
  });
});

test("unregistered dependency details remain masked with real runtime error handling", async t => {
  const loaded = fixture(t), sentinel = new Error("private remote detail sentinel");
  SERVICE.DefaultEWasteDigitalSaleService = { invoke: async () => { throw sentinel; } };
  await assert.rejects(loaded.invoke({ httpRequest: { params: { phase: "evidence" } } }), error => {
    assert.notEqual(error, sentinel);
    assert.deepEqual(response(error), { status: 503, body: { responseCode: "503", code: "ERR_EWASTE_SALE_DIAGNOSTIC_041",
      message: "Digital ownership controller operation is unavailable" } });
    return true;
  });
});

test("coupon source failures retain fixed registered stages without disclosing remote evidence", async t => {
  const loaded = fixture(t);
  const coupon = require(path.join(root, "nodics.waste/modules/wasteCore/src/service/defaultWasteCertificateCouponService"));
  const properties = require(path.join(root, "nodics.waste/modules/wasteCore/config/properties"));
  const get = CONFIG.get;
  CONFIG.get = key => key === "waste" ? properties.waste : get(key);
  const r = { tenant: "tenant", enterpriseCode: "merchant" };
  const command = { operationKey: "original" };
  const owner = { ...coupon, authorize() {} };
  SERVICE.DefaultEWasteDigitalSaleService = { invoke: () => owner.source(r, command, "reserve") };
  const sentinel = "private-certificate-token-payload-sentinel";
  const cases = [
    [async () => { throw Object.assign(new Error(sentinel), { code: "ERR_DIGITAL_ACQUISITION_UNCONFIRMED", data: sentinel }); }, "043"],
    [async () => ({ data: { code: "ERR_DIGITAL_ACQUISITION_UNCONFIRMED", message: sentinel } }), "044"],
    [async () => ({ contractVersion: 1, tenant: r.tenant, enterpriseCode: r.enterpriseCode, phase: "reserve", allowed: false, command }), "045"],
    [async () => ({ contractVersion: 1, tenant: r.tenant, enterpriseCode: r.enterpriseCode, phase: "reserve", allowed: true, command: { operationKey: sentinel } }), "045"],
  ];
  for (const [invokeModule, suffix] of cases) {
    let calls = 0;
    SERVICE.DefaultModuleService = { invokeModule: async request => {
      calls++; assert.equal(request.maxAttempts, 1);
      assert.equal(request.apiName, "/internal/coupons/acquisition/source");
      return invokeModule();
    } };
    await assert.rejects(loaded.invoke({ httpRequest: { params: { phase: "coupon-reserve" }, body: {} } }), error => {
      const rendered = response(error);
      assert.equal(rendered.status, 503);
      assert.equal(rendered.body.code, "ERR_EWASTE_SALE_DIAGNOSTIC_" + suffix);
      assert.equal(JSON.stringify(rendered).includes(sentinel), false);
      assert.equal(error.cause, undefined);
      return true;
    });
    assert.equal(calls, 1);
  }
  SERVICE.DefaultModuleService = { invokeModule: async () => ({ contractVersion: 1, tenant: r.tenant,
    enterpriseCode: r.enterpriseCode, phase: "reserve", allowed: true, command }) };
  await owner.source(r, command, "reserve");
});

test('registered Digital source stages survive normalized transport and envelopes through the private serializer', async t => {
  const loaded = fixture(t);
  const wasteRoot = path.join(root, 'nodics.waste/modules/wasteCore');
  const coupon = require(path.join(wasteRoot, 'src/service/defaultWasteCertificateCouponService'));
  const source = require(path.join(wasteRoot, 'src/utils/couponSourceDiagnostics'));
  const digitalStatuses = require(path.join(root, 'nodics.commerce/modules/digitalCommerce/modules/digitalCore/src/utils/statusDefinitions'));
  const properties = require(path.join(wasteRoot, 'config/properties'));
  const get = CONFIG.get;
  CONFIG.get = key => key === 'waste' ? properties.waste : get(key);
  let admissions = 0;
  const owner = { ...coupon, authorize() { admissions++; } };
  SERVICE.DefaultEWasteDigitalSaleService = { invoke: () => owner.source({ tenant: 't', enterpriseCode: 'merchant' }, { operationKey: 'original' }, 'release') };
  const sentinel = 'PRIVATE_REMOTE_TOKEN_PAYLOAD';
  let calls = 0;
  const request = { httpRequest: { params: { phase: 'coupon-release' }, body: {} } };
  for (const [code, message] of Object.entries(source.messages)) {
    assert.equal(digitalStatuses[code].code, '409');
    for (const mode of ['normalized', 'direct', 'envelope']) {
      SERVICE.DefaultModuleService = { invokeModule: async r => {
        calls++; assert.equal(r.maxAttempts, 1);
        assert.equal(r.apiName, '/internal/coupons/acquisition/source');
        const foreign = { message: sentinel, data: sentinel, causes: [{ token: sentinel }] };
        if (mode === 'envelope') return { data: { result: { code, ...foreign } } };
        throw Object.assign(Error(sentinel), foreign, mode === 'normalized'
          ? { code: 'ERR_SYS_00000', metadata: { remoteHttpFailure: { code, httpStatus: 409 }, private: sentinel } }
          : { code });
      } };
      const error = await new Promise(resolve => loaded.invoke(request, failure => resolve(failure)));
      assert.deepEqual(response(error), { status: 503, body: { responseCode: '503', code: diagnostics.codes[message], message } });
      assert.equal(JSON.stringify(response(error)).includes(sentinel), false);
      assert.equal(error.causes.length, 0);
    }
  }
  assert.equal(calls, 33); assert.equal(admissions, 33);
  for (const failure of [
    { code: 'ERR_DIGITAL_COUPON_SOURCE_UNKNOWN' },
    { code: 'ERR_DIGITAL_COUPON_SOURCE_AUTH_suffix' },
    { message: source.messages.ERR_DIGITAL_COUPON_SOURCE_AUTH },
    { code: 'ERR_DIGITAL_COUPON_SOURCE_AUTH', metadata: { remoteHttpFailure: { code: 'ERR_OTHER', httpStatus: 409 } } },
    { code: 'ERR_DIGITAL_COUPON_SOURCE_AUTH', metadata: { remoteHttpFailure: { code: 'ERR_DIGITAL_COUPON_SOURCE_AUTH', httpStatus: 500 } } },
    { causes: [{ code: 'ERR_DIGITAL_COUPON_SOURCE_AUTH' }] },
  ]) {
    SERVICE.DefaultModuleService = { invokeModule: async () => { throw failure; } };
    await assert.rejects(loaded.invoke(request), error => {
      assert.equal(response(error).body.code, 'ERR_EWASTE_SALE_DIAGNOSTIC_043'); return true;
    });
  }
});
