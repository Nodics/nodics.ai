/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
/**
 * @module backoffice/test/axisInitializationAdmission
 * @description Verifies minimal owner-derived bootstrap admission without setup authority or history.
 * @layer test
 * @owner backoffice
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const service = require("../src/service/registry/defaultBackofficeRegistryService");
test("ordinary bootstrap admission reads only readiness with the original human scope", async () => {
  const request = {
    tenant: "tenant1",
    authData: { principalId: "reviewer", permissions: ["backoffice.bootstrap.view"] },
  };
  let reads = 0;
  global.SERVICE = {
    DefaultAxisInitializationService: {
      status: async (original) => {
        reads++;
        assert.equal(original, request);
        return { readiness: "READY", publication: { requestedBy: "private-actor" } };
      },
    },
  };
  assert.equal(await service.axisInitializationAdmission(request), "READY");
  assert.equal(reads, 1);
});
test("missing, failed, malformed and non-ready owner results never admit a workspace", async () => {
  for (const status of [undefined, {}, { readiness: true }, { readiness: "PUBLICATION_PENDING" }]) {
    global.SERVICE = { DefaultAxisInitializationService: { status: () => Promise.resolve(status) } };
    assert.notEqual(await service.axisInitializationAdmission({}), "READY");
  }
  global.SERVICE = {};
  assert.equal(await service.axisInitializationAdmission({}), "UNAVAILABLE");
  global.SERVICE = {
    DefaultAxisInitializationService: {
      status: () => Promise.reject(new Error("private detail")),
    },
  };
  assert.equal(await service.axisInitializationAdmission({}), "UNAVAILABLE");
});
test("setup inspectors retain their existing detailed status path without another read", async () => {
  global.SERVICE = {
    DefaultAxisInitializationService: {
      status: () => { throw new Error("Unexpected read"); },
    },
  };
  for (const permission of ["*", "backoffice.axis.initialization.view"])
    assert.equal(await service.axisInitializationAdmission({ authData: { permissions: [permission] } }), undefined);
});
