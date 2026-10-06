/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
/** @module database/test/modelCommandReceipt @description Native receipt claims, actor/intent binding and original-result inspection without mutation replay. @layer test @owner nDatabase */
"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { isDeepStrictEqual } = require("node:util");
const receipts = require("../src/service/schema/defaultModelCommandReceiptService");
const schemaOwner = require("../src/service/schema/defaultSchemaCommandReceiptService");
/** Builds a synthetic private generated journal with real protocol and schema-authority owners. */
function fixture(t) {
  const globals = {
    SERVICE: global.SERVICE,
    NODICS: global.NODICS,
    CONFIG: global.CONFIG,
    CLASSES: global.CLASSES,
  };
  t.after(() => Object.assign(global, globals));
  const state = {
    row: null,
    dispatches: 0,
    enabled: true,
    denied: false,
    lose: false,
    ambiguous: false,
    enrichClaim: false,
  };
  const schema = {
    commandReceiptJournal: true,
    model: true,
    cache: { enabled: false },
    router: { enabled: false },
    event: { enabled: false },
    service: { enabled: true },
    backoffice: { enabled: false },
  };
  const rawSchema = {
    productCommandReceipt: schema,
    product: { commandReceipt: { journalSchema: "productCommandReceipt" } },
  };
  const request = {
    tenant: "tenant",
    moduleName: "product",
    idempotencyKey: "original-key",
    authData: {
      tenant: "tenant",
      entCode: "enterprise",
      loginId: "employee",
      principalType: "human",
      tokenType: "access",
    },
    httpRequest: { body: { code: "one", name: "Reviewed product" } },
    model: { code: "one" },
  };
  const envelope = (result) => ({
    code: "SUC_TEST_00000",
    result: structuredClone(result),
  });
  const matches = (query) =>
    state.row &&
    Object.entries(query).every(([key, value]) =>
      isDeepStrictEqual(state.row[key], value),
    );
  global.CLASSES = { NodicsError: class extends Error {} };
  global.CONFIG = {
    get: (key) =>
      key === "commandReceipts"
        ? { enabled: state.enabled, owners: { product: true } }
        : { writePermission: "system.schema.manage" },
  };
  global.NODICS = {
    getModule: (moduleName) =>
      moduleName === "product" ? { rawSchema } : null,
  };
  global.SERVICE = {
    DefaultModelCommandReceiptService: receipts,
    DefaultSchemaUtilityService: {
      resolveSchemaModule: (name) => ({ moduleName: name }),
      resolveDescriptor: () => ({
        operations: state.denied ? [] : ["create", "update", "delete"],
      }),
    },
    DefaultSchemaAuthoringPolicyService: {
      assertMutationAllowed: () => {
        if (state.denied) throw new Error("denied");
      },
    },
    DefaultSecuredRequestPipelineService: {
      getGrantedPermissions: () => [],
      getRouteActionAuthorizationConfig: () => ({}),
      isPermissionGranted: () => !state.denied,
    },
    DefaultProductCommandReceiptService: {
      get: async (r) => {
        assert.equal(r.internalPersistence, "DURABLE_JOURNAL");
        assert.equal(r.options.skipItemCache, true);
        return envelope(matches(r.query) ? [state.row] : []);
      },
      save: async (r) => {
        assert.equal(r.options.insertOnly, true);
        if (state.row) throw new Error("duplicate");
        if (state.enrichClaim) r.model.persistenceMetadata = { inserted: true };
        state.row = structuredClone(r.model);
        return envelope(state.row);
      },
      update: async (r) => {
        assert.equal(Object.hasOwn(r.query, "persistenceMetadata"), false);
        const matched = matches(r.query);
        if (matched) Object.assign(state.row, structuredClone(r.model));
        if (state.lose) throw new Error("lost acknowledgement");
        return envelope({ matchedCount: matched ? 1 : 0 });
      },
    },
  };
  const execute = async () => {
    state.dispatches++;
    return envelope(
      state.ambiguous ? { code: "one", acknowledged: false } : { code: "one" },
    );
  };
  const inspect = () =>
    schemaOwner.inspect(
      {
        ...request,
        httpRequest: {
          body: {
            model: request.httpRequest.body,
            idempotencyKey: request.idempotencyKey,
          },
        },
      },
      "product",
    );
  return { request, state, rawSchema, execute, inspect };
}
test("native command completion is inspectable after response loss, but cannot be submitted twice", async (t) => {
  const f = fixture(t);
  f.state.lose = true;
  await assert.rejects(schemaOwner.execute(f.request, "product", f.execute));
  assert.equal(f.state.dispatches, 1);
  f.state.enabled = false;
  const result = await f.inspect();
  assert.equal(result.data.state, "COMPLETED");
  assert.equal(result.data.resultIdentity, "one");
  assert(!JSON.stringify(result).includes("Reviewed product"));
  f.state.enabled = true;
  f.state.lose = false;
  await assert.rejects(schemaOwner.execute(f.request, "product", f.execute));
  assert.equal(f.state.dispatches, 1);
});
test("generated claim enrichment cannot broaden the exact completion predicate", async (t) => {
  const f = fixture(t);
  f.state.enrichClaim = true;
  await schemaOwner.execute(f.request, "product", f.execute);
  assert.equal(f.state.dispatches, 1);
  assert.equal((await f.inspect()).data.state, "COMPLETED");
});
test("concurrent native creates have one claim and one dispatch", async (t) => {
  const f = fixture(t);
  const result = await Promise.allSettled([
    schemaOwner.execute(f.request, "product", f.execute),
    schemaOwner.execute(f.request, "product", f.execute),
  ]);
  assert.equal(result.filter((item) => item.status === "fulfilled").length, 1);
  assert.equal(f.state.dispatches, 1);
});
test("negative native results and missing historical receipts stay unknown without a retry", async (t) => {
  const f = fixture(t);
  assert.equal((await f.inspect()).data.state, "OUTCOME_UNKNOWN");
  f.state.ambiguous = true;
  await assert.rejects(schemaOwner.execute(f.request, "product", f.execute));
  assert.equal((await f.inspect()).data.state, "OUTCOME_UNKNOWN");
  await assert.rejects(schemaOwner.execute(f.request, "product", f.execute));
  assert.equal(f.state.dispatches, 1);
});
test("changed arguments, foreign actor, current denial and exposed journals never authorize recovery", async (t) => {
  const f = fixture(t);
  await schemaOwner.execute(f.request, "product", f.execute);
  f.request.httpRequest.body.name = "Changed";
  await assert.rejects(f.inspect());
  f.request.httpRequest.body.name = "Reviewed product";
  f.request.authData.loginId = "other";
  assert.equal((await f.inspect()).data.state, "OUTCOME_UNKNOWN");
  f.state.denied = true;
  await assert.rejects(f.inspect());
  f.state.denied = false;
  f.rawSchema.productCommandReceipt.router.enabled = true;
  await assert.rejects(f.inspect());
  assert.equal(f.state.dispatches, 1);
});
test("receipt deployment disabled preserves existing generated create behavior", async (t) => {
  const f = fixture(t);
  f.state.enabled = false;
  assert.equal(
    (await schemaOwner.execute(f.request, "product", f.execute)).result.code,
    "one",
  );
  assert.equal(f.state.row, null);
});

for (const [operation, result] of [
  ["update", { matchedCount: 1 }],
  ["delete", { deletedCount: 1 }],
])
  test(
    "native " +
      operation +
      " receipt binds normalized input and exact one write",
    async (t) => {
      const f = fixture(t);
      const input =
        operation === "update"
          ? { query: { code: "one", revision: 1 }, model: { name: "Next" } }
          : { query: { code: "one", revision: 1 } };
      f.execute = async () => {
        f.state.dispatches++;
        return { code: "SUC_TEST_00000", result };
      };
      await schemaOwner.execute(
        f.request,
        "product",
        f.execute,
        operation,
        input,
      );
      const receipt = await schemaOwner.inspect(
        {
          ...f.request,
          httpRequest: {
            body: {
              operation,
              input,
              idempotencyKey: f.request.idempotencyKey,
            },
          },
        },
        "product",
      );
      assert.equal(receipt.data.state, "COMPLETED");
      assert.match(
        receipt.data.resultIdentity,
        new RegExp("^" + operation + ":"),
      );
      assert.equal(f.state.dispatches, 1);
    },
  );

test("zero- or multi-record generated mutations never complete a receipt", async (t) => {
  const f = fixture(t);
  for (const matchedCount of [0, 2]) {
    f.request.idempotencyKey = "key-" + matchedCount;
    await assert.rejects(
      schemaOwner.execute(
        f.request,
        "product",
        async () => ({ code: "SUC_TEST_00000", result: { matchedCount } }),
        "update",
        { query: { code: "one" }, model: { name: "Next" } },
      ),
    );
  }
});

for (const recording of [false, true])
  test(
    "owner-declared create-only semantics survive receipt recording " +
      recording,
    async (t) => {
      const f = fixture(t);
      f.state.enabled = recording;
      f.rawSchema.product.commandReceipt.insertOnly = true;
      const originalOptions = { recursive: false, insertOnly: false };
      f.request.options = originalOptions;
      await schemaOwner.execute(f.request, "product", async () => {
        assert.deepEqual(f.request.options, {
          recursive: false,
          insertOnly: true,
        });
        return f.execute();
      });
      assert.equal(originalOptions.insertOnly, false);
      assert.equal(f.state.dispatches, 1);
      assert.equal(Boolean(f.state.row), recording);
    },
  );

test("actual domain journal inheritance preserves private generated storage and unique identity", (t) => {
  const previous = { _: global._, ENUMS: global.ENUMS };
  global._ = require("lodash");
  global.ENUMS = {
    ContactType: Object.fromEntries(
      ["EMAIL", "PHONE", "FAX", "PAGER"].map((key) => [key, { key }]),
    ),
  };
  t.after(() => Object.assign(global, previous));
  const handler = require("../src/service/schema/defaultDatabaseSchemaHandlerService");
  const defaults = require("../src/schemas/schemas").default;
  const root = "../../../../../";
  for (const [file, moduleName, journal] of [
    [
      "nodics.commerce/modules/baseCommerce/modules/product/src/schemas/schemas",
      "product",
      "productCommandReceipt",
    ],
    [
      "nodics.commerce/modules/baseCommerce/modules/pricing/src/schemas/schemas",
      "pricing",
      "pricingCommandReceipt",
    ],
    [
      "nodics.platform/modules/profile/src/schemas/schemas",
      "profile",
      "profileCommandReceipt",
    ],
    [
      "nodics.waste/modules/wasteCollection/src/schemas/schemas",
      "wasteCollection",
      "wasteCollectionCommandReceipt",
    ],
  ]) {
    const declarations = require(root + file);
    const rawSchema = _.merge(
      {},
      defaults,
      declarations.default || {},
      declarations[moduleName],
    );
    const schema = handler.resolveSchemaDependancy({
      mergedSchema: {},
      rawSchema,
      schemaName: journal,
      schema: rawSchema[journal],
    });
    assert.equal(schema.commandReceiptJournal, true);
    assert.equal(schema.model, true);
    assert.equal(schema.service.enabled, true);
    assert.equal(schema.router.enabled, false);
    assert.equal(schema.cache.enabled, false);
    assert.equal(schema.event.enabled, false);
    assert.equal(schema.backoffice.enabled, false);
    assert.equal(
      schema.indexes.individual.commandReceiptIdentity.options.unique,
      true,
    );
    assert.equal(schema.definition.argumentsDigest.required, true);
  }
});
