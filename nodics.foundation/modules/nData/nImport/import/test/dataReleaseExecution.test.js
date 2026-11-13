/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
const test = require("node:test");
const assert = require("node:assert/strict");
const implementation = require("../src/service/release/defaultDataReleaseExecutionService");
const clone = (value) => JSON.parse(JSON.stringify(value));
function fixture(t) {
  const previous = { SERVICE: global.SERVICE, NODICS: global.NODICS };
  t.after(() => Object.assign(global, previous));
  const records = new Map(),
    installations = new Map(),
    writes = [];
  let permitted = true,
    loseAck = false,
    skipReceipt = false,
    failCheckpoint = false;
  const instance = () => ({ ...implementation });
  const service = instance();
  global.NODICS = {
    getEnvironmentName: () => "project",
    getSelectedEnvironmentName: () => "local",
    getServerName: () => "runtime",
  };
  const request = {
    tenant: "tenant-a",
    authData: {
      principalId: "operator",
      principalType: "human",
      tokenType: "access",
      enterpriseCode: "enterprise-a",
    },
    releaseRequest: { dataType: "sample", continuation: true },
  };
  const plan = {
    tenant: "tenant-a",
    dataType: "sample",
    releases: ["first", "second"].map((name) => ({
      releaseCode: "example:" + name,
      version: "0.0.1",
      checksum: name,
    })),
  };
  const owner = {
    error: (code, message) => Object.assign(new Error(message), { code }),
    clientActions: () => (permitted ? ["install"] : []),
    publicReferenceReleases: () => [],
    preflight: async () => ({
      data: {
        validation: { ready: true },
        releases: plan.releases.map((item) => ({
          ...item,
          status: installations.has(item.releaseCode)
            ? "CURRENT"
            : "NOT_INSTALLED",
        })),
      },
    }),
    installationCode: (_, release) => release.releaseCode,
    getInstallations: async () => clone([...installations.values()]),
    operationReleases: async (active) =>
      active.releases.map((item) => ({
        ...item,
        status: installations.has(item.releaseCode)
          ? "CURRENT"
          : "NOT_INSTALLED",
      })),
    executePreparedPlan: async (_, active) => {
      const executionId = service.executionIdentity(active);
      assert.ok(
        executionId,
        "only privately bound execution may reuse the durable identity",
      );
      assert.equal(active.releases.length, 1);
      const release = active.releases[0];
      writes.push(release.releaseCode);
      if (!skipReceipt)
        installations.set(release.releaseCode, {
          ...release,
          code: release.releaseCode,
          status: "CURRENT",
          executionId,
          runId: "run-" + writes.length,
        });
      if (loseAck) throw new Error("response lost after owner commit");
    },
  };
  global.SERVICE = {
    DefaultDataReleaseService: owner,
    DefaultDataReleaseExecutionService: service,
    DefaultIdentityGovernanceService: {
      getSystemAuthData: () => ({ isSystem: true }),
    },
    DefaultDataReleaseExecutionRecordService: {
      get: async (input) => ({
        result: [...records.values()]
          .filter((row) =>
            Object.entries(input.query).every(
              ([key, value]) => row[key] === value,
            ),
          )
          .map(clone),
      }),
      save: async (input) => {
        assert.equal(input.options.insertOnly, undefined);
        assert.deepEqual(input.query, {
          code: input.model.code,
          scopeKey: input.model.scopeKey,
          revision: 0,
        });
        if (records.has(input.model.code)) throw new Error("duplicate");
        const row = { ...clone(input.model), revision: 1 };
        records.set(row.code, row);
        return { result: clone(row) };
      },
      update: async (input) => {
        if (failCheckpoint) throw new Error("persistence unavailable");
        const row = records.get(input.query.code);
        if (
          !row ||
          row.revision !== input.query.revision ||
          row.scopeKey !== input.query.scopeKey
        )
          return { result: { matchedCount: 0 } };
        records.set(row.code, {
          ...row,
          ...clone(input.model),
          revision: row.revision + 1,
        });
        return { result: { matchedCount: 1 } };
      },
    },
  };
  return {
    service,
    instance,
    request,
    plan,
    records,
    installations,
    writes,
    owner,
    permission: (value) => {
      permitted = value;
    },
    loseAck: (value) => {
      loseAck = value;
    },
    skipReceipt: (value) => {
      skipReceipt = value;
    },
    failCheckpoint: (value) => {
      failCheckpoint = value;
    },
  };
}
test("reload and new service instance continue the recorded exact plan without repeating a completed release", async (t) => {
  const f = fixture(t),
    first = (await f.service.continue(f.request, f.plan)).data.execution;
  assert.equal(first.status, "READY");
  assert.equal(first.completed, 1);
  const reloaded = f.instance();
  const inspected = (
    await reloaded.inspect({ ...f.request, executionCode: first.code })
  ).data;
  assert.deepEqual(inspected, first);
  const second = (
    await reloaded.continue(
      {
        ...f.request,
        releaseRequest: {
          ...f.request.releaseRequest,
          executionCode: first.code,
        },
      },
      f.plan,
    )
  ).data.execution;
  assert.equal(second.code, first.code);
  assert.equal(second.status, "COMPLETED");
  await reloaded.continue(f.request, f.plan);
  assert.deepEqual(f.writes, ["example:first", "example:second"]);
});
test("lost owner acknowledgement is reconciled from its exact installation receipt without replay", async (t) => {
  const f = fixture(t);
  f.loseAck(true);
  const result = (await f.service.continue(f.request, f.plan)).data.execution;
  assert.equal(result.status, "READY");
  assert.equal(result.completed, 1);
  assert.deepEqual(f.writes, ["example:first"]);
});
test("uncertain writes remain blocked across a new service instance, with no timeout takeover", async (t) => {
  const f = fixture(t);
  f.skipReceipt(true);
  f.loseAck(true);
  const first = (await f.service.continue(f.request, f.plan)).data.execution;
  assert.equal(first.status, "UNCERTAIN");
  const second = (await f.instance().continue(f.request, f.plan)).data
    .execution;
  assert.equal(second.code, first.code);
  assert.equal(second.status, "UNCERTAIN");
  assert.deepEqual(f.writes, ["example:first"]);
});
test("wrong receipt execution identity or checksum cannot acknowledge a completed release", async (t) => {
  const f = fixture(t);
  f.skipReceipt(true);
  f.loseAck(true);
  const first = (await f.service.continue(f.request, f.plan)).data.execution;
  f.installations.set("example:first", {
    code: "example:first",
    status: "CURRENT",
    version: "0.0.1",
    checksum: "first",
    executionId: "other",
    runId: "other-run",
  });
  assert.equal(
    (await f.service.continue(f.request, f.plan)).data.execution.status,
    "UNCERTAIN",
  );
  f.installations.get("example:first").executionId = first.code;
  f.installations.get("example:first").checksum = "changed";
  assert.equal(
    (await f.service.continue(f.request, f.plan)).data.execution.status,
    "UNCERTAIN",
  );
  assert.equal(f.writes.length, 1);
});
test("competing continuation commands cannot both dispatch the same release", async (t) => {
  const f = fixture(t);
  const results = await Promise.allSettled([
    f.service.continue(f.request, f.plan),
    f.service.continue(f.request, f.plan),
  ]);
  assert.ok(results.some((result) => result.status === "fulfilled"));
  assert.deepEqual(f.writes, ["example:first"]);
});
test("intent persistence failure dispatches nothing", async (t) => {
  const f = fixture(t);
  f.failCheckpoint(true);
  await assert.rejects(
    f.service.continue(f.request, f.plan),
    /persistence unavailable/,
  );
  assert.equal(f.writes.length, 0);
});
test("revoked permission, service identity, another tenant and another operator cannot continue the recorded plan", async (t) => {
  const f = fixture(t),
    first = (await f.service.continue(f.request, f.plan)).data.execution;
  const request = {
    ...f.request,
    releaseRequest: { ...f.request.releaseRequest, executionCode: first.code },
  };
  f.permission(false);
  await assert.rejects(f.service.continue(request, f.plan), /cannot continue/);
  f.permission(true);
  await assert.rejects(
    f.service.continue({ ...request, tenant: "tenant-b" }, f.plan),
    /scope differs/,
  );
  await assert.rejects(
    f.service.continue(
      { ...request, authData: { ...request.authData, principalId: "other" } },
      f.plan,
    ),
    /does not match/,
  );
  await assert.rejects(
    f.service.continue(
      {
        ...request,
        authData: { ...request.authData, principalType: "service" },
      },
      f.plan,
    ),
    /Native employee/,
  );
  await assert.rejects(
    f.service.inspect({
      ...request,
      tenant: "tenant-b",
      executionCode: first.code,
    }),
    /unavailable/,
  );
  assert.equal(f.writes.length, 1);
});
test("source changes cannot continue a pinned execution and caller execution flags cannot mint private admission", async (t) => {
  const f = fixture(t),
    first = (await f.service.continue(f.request, f.plan)).data.execution;
  const changed = clone(f.plan);
  changed.releases[1].checksum = "changed";
  await assert.rejects(
    f.service.continue(
      {
        ...f.request,
        releaseRequest: {
          ...f.request.releaseRequest,
          executionCode: first.code,
        },
      },
      changed,
    ),
    /does not match/,
  );
  assert.equal(
    f.service.executionIdentity({ ...f.plan, executionId: first.code }),
    undefined,
  );
  assert.equal(f.writes.length, 1);
});

test("creation and subsequent claims use the real generated managed-revision contract", async (t) => {
  const f = fixture(t);
  const concurrency = require("../../../../nDatabase/database/src/service/schema/defaultModelConcurrencyService");
  const previousClasses = global.CLASSES;
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(code) {
        super(code);
        this.code = code;
      }
    },
  };
  t.after(() => {
    global.CLASSES = previousClasses;
  });
  const schemaModel = {
    primaryKey: "code",
    rawSchema: require("../src/schemas/schemas").import
      .dataReleaseExecutionRecord,
    getItems: async ({ query }) =>
      [...f.records.values()]
        .filter((row) =>
          Object.entries(query).every(([key, value]) => row[key] === value),
        )
        .map(clone),
    compareAndSetItem: async ({ operation, model, query }) => {
      if (operation === "create") {
        if (f.records.has(model.code)) throw new Error("duplicate");
        f.records.set(model.code, clone(model));
        return clone(model);
      }
      const row = f.records.get(query.code);
      if (
        !row ||
        Object.entries(query).some(([key, value]) => row[key] !== value)
      )
        return null;
      const next = { ...row, ...clone(model) };
      f.records.set(row.code, next);
      return clone(next);
    },
  };
  SERVICE.DefaultDataReleaseExecutionRecordService.save = async (input) => {
    assert.notEqual(input.options?.insertOnly, true);
    const command = { ...input, model: clone(input.model), schemaModel };
    concurrency.initializeSave(command);
    return { result: await concurrency.execute(command, "save") };
  };
  SERVICE.DefaultDataReleaseExecutionRecordService.update = async (input) => ({
    result: await concurrency.execute({ ...input, schemaModel }, "update"),
  });
  const attempts = await Promise.allSettled([
    f.service.continue(f.request, f.plan),
    f.service.continue(f.request, f.plan),
  ]);
  assert.ok(attempts.some((result) => result.status === "fulfilled"));
  assert.deepEqual(f.writes, ["example:first"]);
  const original = clone([...f.records.values()][0]);
  assert.equal(original.revision, 3);
  await assert.rejects(
    SERVICE.DefaultDataReleaseExecutionRecordService.save({
      tenant: f.request.tenant,
      query: { code: original.code, scopeKey: original.scopeKey, revision: 0 },
      model: { ...original, status: "READY", steps: [] },
    }),
    /ERR_CONCURRENCY_00001/,
  );
  assert.deepEqual([...f.records.values()][0], original);
});
