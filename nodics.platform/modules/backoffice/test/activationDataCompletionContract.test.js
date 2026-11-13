/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module backoffice/test/ActivationDataCompletionContract @description Requires confirmed release completion before functional activation and preserves pending receipts. @layer test @owner backoffice */
const assert = require("node:assert/strict");
const { test } = require("node:test");
const definition = require("../src/service/registry/defaultFunctionalModuleCatalogueService");
global.CLASSES = {
  NodicsError: class extends Error {
    constructor(code, message) {
      super(message);
      this.code = code;
    }
  },
};

function fixture(states, executed = []) {
  const receipts = [];
  const calls = [];
  const packs = states.map((state, index) => ({
    code: "release" + index,
    required: true,
    trigger: "ACTIVATION",
    dataType: "core",
  }));
  const service = Object.assign({}, definition, {
    getActivationDataPackages: () => packs,
    upsertActivationReceipt: async (record, pack, status, context, detail) => {
      receipts.push({ code: pack.code, status, detail });
    },
    runActivationDataReleaseOperation: async (mode, request) => {
      calls.push({ mode, request });
      return {
        data: {
          releases:
            mode === "preflight"
              ? states.flatMap((status, index) =>
                  status === null
                    ? []
                    : [{ releaseCode: "release" + index, status }],
                )
              : executed,
        },
      };
    },
  });
  return {
    service,
    receipts,
    calls,
    run: () =>
      service.executeRequiredActivationData(
        { functionalModule: "capability" },
        {},
        { tenant: "tenant-one" },
      ),
  };
}

for (const status of [
  "RUNNING",
  "QUEUED",
  "PENDING_IMPORT",
  "INVALID_RELEASE",
  null,
]) {
  test(
    "required " + status + " release cannot be called imported or activate",
    async () => {
      const { run, calls, receipts } = fixture([status]);
      await assert.rejects(run(), /Required activation data is incomplete/);
      assert.deepEqual(
        calls.map((call) => call.mode),
        ["preflight"],
      );
      assert.equal(
        receipts.some((receipt) => receipt.status === "IMPORTED"),
        false,
      );
      assert.equal(
        receipts.at(-1).status,
        ["RUNNING", "QUEUED", "PENDING_IMPORT"].includes(status)
          ? "RUNNING"
          : "FAILED",
      );
    },
  );
}

test("mixed current and new releases execute only the new release and require its completion", async () => {
  const { run, calls, receipts } = fixture(
    ["CURRENT", "NOT_INSTALLED"],
    [{ releaseCode: "release1", status: "CURRENT" }],
  );
  assert.equal(await run(), true);
  assert.deepEqual(calls[1].request.releaseCodes, ["release1"]);
  assert.deepEqual(
    receipts.slice(-2).map((receipt) => receipt.status),
    ["IMPORTED", "IMPORTED"],
  );
});

for (const results of [
  [],
  [{ releaseCode: "release0", status: "RUNNING" }],
  [{ releaseCode: "release0", status: "FAILED" }],
]) {
  test(
    "execution without confirmed CURRENT completion rejects activation: " +
      JSON.stringify(results),
    async () => {
      const { run, receipts } = fixture(["NOT_INSTALLED"], results);
      await assert.rejects(run(), /Required activation data is incomplete/);
      assert.equal(
        receipts.some((receipt) => receipt.status === "IMPORTED"),
        false,
      );
    },
  );
}

test("already current required data does not execute again", async () => {
  const { run, calls, receipts } = fixture(["CURRENT"]);
  assert.equal(await run(), true);
  assert.equal(calls.length, 1);
  assert.equal(receipts.at(-1).status, "IMPORTED");
});

test("routing deltas reuse observed owner facts and cannot invent packages before registration", () => {
  let settings = {
    modules: {
      "nodics.example": {
        dataPackages: [
          {
            code: "example:sample",
            targetModule: "profile",
            targetServer: "identityServer",
          },
        ],
      },
    },
  };
  global.CONFIG = { get: () => settings };
  const source = {
    code: "example:sample",
    owner: "example",
    classification: "sample",
    dataType: "sample",
    required: false,
    trigger: "USER",
    operation: "IMPORT",
    targetServer: "exampleServer",
    targetModule: "example",
  };
  const result = definition.getActivationDataPackages("nodics.example", {
    activationDataPackages: [source],
  });
  assert.equal(result.length, 1);
  assert.equal(result[0].required, false);
  assert.equal(result[0].trigger, "USER");
  assert.equal(result[0].owner, "example");
  assert.equal(result[0].targetModule, "profile");
  assert.equal(result[0].targetServer, "identityServer");
  assert.equal(source.targetServer, "exampleServer");
  assert.deepEqual(
    definition.getActivationDataPackages("nodics.example", {}),
    [],
  );
  settings.modules["nodics.example"].dataPackages = [
    { ...source, code: "custom:selection" },
  ];
  assert.equal(
    definition.getActivationDataPackages("nodics.example", {}).length,
    1,
    "Explicit custom descriptors retain their existing contract",
  );
});

test("remote activation resolves the declared import publication and refuses Online", async context => {
  const initializer = require("../../../../nodics.foundation/modules/nConfig/src/service/DefaultFrameworkInitializerService");
  let publication = "OPERATIONAL";
  context.mock.method(initializer, "getPropertyBindingContext", () => ({
    readRuntimeProperty: (server, property) => {
      assert.equal(server, "wasteServer");
      assert.deepEqual(property, ["runtimeRole", "publication"]);
      return publication;
    },
  }));
  const original = global.SERVICE;
  const calls = [];
  const owner = { endpoint: "http://localhost:4370/nodics/system/v0" };
  global.SERVICE = { DefaultBackofficeRegistryService: {
    resolveRuntimeOwner: async options => {
      calls.push(options);
      return owner;
    },
  } };
  try {
    assert.equal(await definition.resolveActivationDataRuntimeOwner({ targetServer: "wasteServer" }), owner);
    assert.deepEqual(calls, [{
      moduleName: "system",
      connectionName: "wasteServer",
      targetAuthority: { server: "wasteServer", publication: "OPERATIONAL" },
    }]);
    publication = "ONLINE";
    await assert.rejects(() => definition.resolveActivationDataRuntimeOwner({ targetServer: "wasteServer" }),
      /requires an Operational or Staged import runtime/);
    assert.equal(calls.length, 1);
  } finally {
    global.SERVICE = original;
  }
});
