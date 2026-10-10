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
