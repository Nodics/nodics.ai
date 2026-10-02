/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
/** @module profile/test/historicalIdentityReadPrivacyContract @description Deferred postGet public/nested/cache isolation, transient owner read and mutation-guard evidence fixtures; not installed interceptor/cache qualification. @layer test @owner profile */
const test = require("node:test");
const assert = require("node:assert/strict");
const source = require("../src/service/identity/defaultCanonicalHistoricalIdentityLinkService");

test("Password binding readback uses the original generated owner and retains its exact retirement marker", async () => {
  let observed;
  const marker = { auditCode: "held", fingerprint: "reviewed" };
  const owner = {
    ...source,
    member: () => ({ rows: (response) => response.result }),
  };
  global.SERVICE = {
    DefaultIdentityGovernanceService: {
      getSystemAuthData: () => ({ system: true }),
    },
    DefaultPasswordService: {
      get: async (request) => {
        observed = request;
        assert.equal(owner.ownsRead(request), true);
        const response = {
          success: {
            code: "SUC_READ",
            count: 1,
            result: [
              { _id: "original-password", identityLinkRetirement: marker },
            ],
          },
        };
        owner.redactRetirement(request, response);
        return response.success;
      },
    },
  };
  const record = await owner.readRecord("DefaultPasswordService", "original", {
    _id: "original-password",
  });
  assert.equal(record.identityLinkRetirement, marker);
  assert.equal(observed.tenant, "original");
  assert.deepEqual(observed.query, { _id: "original-password" });
  assert.equal(observed.options.recursive, false);
  assert.equal(observed.options.skipItemCache, true);
  assert.equal(owner.ownsRead(observed), false);
});

test("public copies redact shared aliases and dotted nested paths without altering ordinary keys", () => {
  const shared = {
    identityLinkRetirement: { fingerprint: "private" },
    code: "ordinary",
  };
  const envelope = {
    result: [
      {
        first: shared,
        second: shared,
        "password.identityLinkRetirement.auditCode": "private",
        identityLinkRetirementNote: "ordinary",
      },
    ],
    count: 1,
  };
  const response = { success: envelope };
  source.redactRetirement({}, response);
  const row = response.success.result[0];
  assert.equal(row.first, row.second);
  assert.notEqual(row.first, shared);
  assert.equal(row.first.identityLinkRetirement, undefined);
  assert.equal(row["password.identityLinkRetirement.auditCode"], undefined);
  assert.equal(row.identityLinkRetirementNote, "ordinary");
  assert.equal(shared.identityLinkRetirement.fingerprint, "private");
});

test("ordinary BSON scalars keep their representations and attached private scalar evidence refuses", () => {
  const BSON = require("bson");
  const id = new BSON.ObjectId("000000000000000000000001");
  const values = {
    id,
    long: BSON.Long.fromString("9007199254740993"),
    decimal: BSON.Decimal128.fromString("12.34"),
    int32: new BSON.Int32(42),
    double: new BSON.Double(0.25),
    timestamp: BSON.Timestamp.fromBits(1, 2),
    binary: new BSON.Binary(Buffer.from([1, 2])),
    regexp: new BSON.BSONRegExp("ordinary", "i"),
    min: new BSON.MinKey(),
    max: new BSON.MaxKey(),
    code: new BSON.Code("return value", { value: 1 }),
    ref: new BSON.DBRef("ordinary", id, "original", { code: "visible" }),
    buffer: Buffer.from([3, 4]),
    date: new Date("2026-10-01T00:00:00Z"),
  };
  const { buffer, ...bsonValues } = values;
  const before = BSON.EJSON.stringify(bsonValues);
  const copied = source.redactRetirementValue(values);
  const { buffer: copiedBuffer, ...copiedBson } = copied;
  assert.equal(BSON.EJSON.stringify(copiedBson), before);
  assert.equal(JSON.stringify(copiedBuffer), JSON.stringify(buffer));
  for (const key of Object.keys(values)) assert.equal(copied[key], values[key]);
  const owner = {
    ...source,
    fail: () => {
      throw Error("private scalar");
    },
  };
  assert.throws(
    () =>
      owner.redactRetirementValue(
        new BSON.Code("return value", {
          identityLinkRetirement: { auditCode: "private" },
        }),
      ),
    /private scalar/,
  );
  assert.throws(
    () =>
      owner.redactRetirementValue(
        new BSON.DBRef("ordinary", id, "original", {
          "password.identityLinkRetirement.fingerprint": "private",
        }),
      ),
    /private scalar/,
  );
});

test("all three principal guards and the private audit use the real stamp inventory with exact read admission", async () => {
  const stamp = require("../src/service/identity/defaultPrincipalSecurityStampGovernanceService");
  global.CONFIG = { get: () => ({ pageSize: 1, maximumPages: 2 }) };
  const owner = {
    ...source,
    fail: () => {
      throw Error("protected");
    },
    member: () => ({ mutationLookup: (request) => request.query }),
  };
  for (const [schema, service] of [
    ["employee", "DefaultEmployeeService"],
    ["customer", "DefaultCustomerService"],
    ["password", "DefaultPasswordService"],
    ["identityMigrationAudit", "DefaultIdentityMigrationAuditService"],
  ]) {
    const observed = [];
    global.SERVICE = {
      DefaultIdentityGovernanceService: {
        getSystemAuthData: () => ({ system: true }),
      },
      DefaultPrincipalSecurityStampGovernanceService: stamp,
      [service]: {
        get: async (request) => {
          observed.push(request);
          assert.equal(owner.ownsRead(request), true);
          assert.equal(owner.ownsRead({ ...request }), false);
          assert.equal(request.options.skipItemCache, true);
          assert.deepEqual(request.searchOptions.sort, { _id: 1 });
          const query = request.query;
          if (schema === "identityMigrationAudit") owner.protectRead(request);
          assert.equal(request.query, query);
          const row =
            request.searchOptions.pageNumber === 1
              ? { _id: "ordinary" }
              : {
                  _id: "held",
                  ...(schema === "identityMigrationAudit"
                    ? {
                        snapshot: {
                          canonicalHistoricalLink: { fingerprint: "private" },
                        },
                      }
                    : { identityLinkRetirement: { fingerprint: "private" } }),
                };
          const response = {
            success: { code: "SUC_READ", result: [row], count: 2 },
          };
          if (schema !== "identityMigrationAudit")
            owner.redactRetirement(request, response);
          return response.success;
        },
      },
    };
    await assert.rejects(
      owner.protectMutation({
        tenant: "original",
        schemaModel: { schemaName: schema },
        query: { code: "held" },
        model: { active: true },
      }),
      /protected/,
    );
    assert.equal(observed.length, 2);
    for (const request of observed)
      assert.equal(owner.ownsRead(request), false);
  }
});

test("public nested postGet strips private markers and dotted representations without mutating cached data", () => {
  const marker = Object.freeze({
    auditCode: "private-handle",
    fingerprint: "private-fingerprint",
  });
  const date = new Date("2026-10-01T00:00:00Z");
  const cachedRow = Object.freeze({
    code: "public-person",
    identityLinkRetirement: marker,
    updated: date,
    password: Object.freeze({ identityLinkRetirement: marker }),
    related: [
      Object.freeze({
        "identityLinkRetirement.fingerprint": "private-fingerprint",
        identityLinkRetirement: marker,
        code: "related",
      }),
    ],
  });
  const cachedEnvelope = Object.freeze({
    code: "SUC_READ",
    result: [cachedRow],
    count: 1,
  });
  const response = { success: cachedEnvelope };
  assert.equal(
    source.redactRetirement(
      {
        body: { ownsRead: true, privateRead: true },
        options: { private: true },
      },
      response,
    ),
    true,
  );
  assert.equal(response.success.result[0].identityLinkRetirement, undefined);
  assert.equal(
    response.success.result[0].password.identityLinkRetirement,
    undefined,
  );
  assert.equal(
    response.success.result[0].related[0].identityLinkRetirement,
    undefined,
  );
  assert.equal(
    response.success.result[0].related[0]["identityLinkRetirement.fingerprint"],
    undefined,
  );
  assert.equal(response.success.result[0].code, "public-person");
  assert.equal(response.success.result[0].updated, date);
  assert.notEqual(response.success, cachedEnvelope);
  assert.notEqual(response.success.result[0], cachedRow);
  assert.equal(cachedRow.identityLinkRetirement, marker);
  assert.equal(cachedRow.password.identityLinkRetirement, marker);
  assert.equal(JSON.stringify(response).includes("private-fingerprint"), false);
});

test("private generated reads retain evidence only during the exact awaited request lifetime", async () => {
  let settle, observed;
  const pending = new Promise((resolve) => {
    settle = resolve;
  });
  const envelope = {
    code: "SUC_READ",
    count: 1,
    result: [
      {
        identityLinkRetirement: { auditCode: "owned", fingerprint: "retained" },
      },
    ],
  };
  global.SERVICE = {
    DefaultPasswordService: {
      get: async (request) => {
        observed = request;
        assert.equal(source.ownsRead(request), true);
        assert.equal(source.ownsRead({ ...request }), false);
        assert.equal(source.ownsWrite(request), false);
        const privateResponse = { success: envelope };
        source.redactRetirement(request, privateResponse);
        assert.equal(privateResponse.success, envelope);
        await pending;
        return privateResponse.success;
      },
    },
  };
  const request = {
    tenant: "original",
    query: { _id: "original-password" },
    options: { recursive: false, skipItemCache: true },
  };
  const read = source.generatedRead("DefaultPasswordService", request);
  assert.equal(observed, request);
  assert.equal(source.ownsRead(request), true);
  settle();
  const result = await read;
  assert.equal(result.result[0].identityLinkRetirement.fingerprint, "retained");
  assert.equal(source.ownsRead(request), false);
  const publicResponse = { success: envelope };
  source.redactRetirement(request, publicResponse);
  assert.equal(
    publicResponse.success.result[0].identityLinkRetirement,
    undefined,
  );
  assert.equal(
    envelope.result[0].identityLinkRetirement.fingerprint,
    "retained",
  );
});

test("failed reads clear scope and non-owner or cache-enabled reads never acquire it", async () => {
  const owner = {
    ...source,
    fail: () => {
      throw Error("denied");
    },
  };
  global.SERVICE = {
    DefaultEmployeeService: {
      get: async (request) => {
        assert.equal(owner.ownsRead(request), true);
        throw Error("unavailable");
      },
    },
  };
  const request = { options: { recursive: false, skipItemCache: true } };
  await assert.rejects(
    owner.generatedRead("DefaultEmployeeService", request),
    /unavailable/,
  );
  assert.equal(owner.ownsRead(request), false);
  await assert.rejects(
    owner.generatedRead("DefaultEmployeeService", {
      options: { recursive: false, skipItemCache: false },
    }),
    /denied/,
  );
  await assert.rejects(
    owner.generatedRead("UnownedService", request),
    /denied/,
  );
  assert.equal(owner.ownsRead({ body: { privateRead: true } }), false);
  await assert.rejects(
    owner.write("DefaultEmployeeService", "get", request),
    /denied/,
  );
});

test("private audit get bypass is scoped to reads rather than mutation admission", async () => {
  global.SERVICE = {
    DefaultIdentityMigrationAuditService: {
      get: async (request) => {
        const before = request.query;
        source.protectRead(request);
        assert.equal(request.query, before);
        return { code: "SUC_READ", result: [] };
      },
    },
  };
  const request = {
    query: { code: "owned-audit" },
    options: { recursive: false, skipItemCache: true },
  };
  await source.generatedRead("DefaultIdentityMigrationAuditService", request);
  source.protectRead(request);
  assert.deepEqual(request.query.$and[1], {
    "snapshot.canonicalHistoricalLink": { $exists: false },
  });
});

test("the canonical stamp inventory stays marker-aware through exact transient generated reads", async () => {
  let lastRequest;
  const cached = {
    code: "SUC_READ",
    count: 1,
    result: [
      {
        _id: "original",
        identityLinkRetirement: { auditCode: "held", fingerprint: "reviewed" },
      },
    ],
  };
  global.SERVICE = {
    DefaultEmployeeService: {
      get: async (request) => {
        lastRequest = request;
        const response = { success: cached };
        source.redactRetirement(request, response);
        return response.success;
      },
    },
    DefaultPrincipalSecurityStampGovernanceService: {
      inventory: async (generated, tenant, query) => {
        const response = await generated.get({
          tenant,
          query,
          options: { recursive: false, skipItemCache: true },
          searchOptions: { pageSize: 100, pageNumber: 1 },
        });
        assert.equal(
          response.result[0].identityLinkRetirement.auditCode,
          "held",
        );
        return response.result;
      },
    },
  };
  const owner = {
    ...source,
    fail: () => {
      throw Error("protected");
    },
    member: () => ({ mutationLookup: (request) => request.query }),
  };
  await assert.rejects(
    owner.protectMutation({
      tenant: "original",
      schemaModel: { schemaName: "employee" },
      query: { _id: "original" },
      model: { $set: { active: true } },
    }),
    /protected/,
  );
  assert.equal(owner.ownsRead(lastRequest), false);
  assert.equal(cached.result[0].identityLinkRetirement.auditCode, "held");
});

test("public copying remains cycle-aware and refuses excessive depth rather than leaving unvisited evidence", () => {
  const cyclic = {
    code: "visible",
    identityLinkRetirement: { auditCode: "private" },
  };
  cyclic.self = cyclic;
  const output = source.redactRetirementValue(cyclic);
  assert.equal(output.self, output);
  assert.equal(output.identityLinkRetirement, undefined);
  const owner = {
    ...source,
    fail: () => {
      throw Error("bounded");
    },
  };
  const root = {};
  let cursor = root;
  for (let i = 0; i < 70; i++) {
    cursor.child = {};
    cursor = cursor.child;
  }
  cursor.identityLinkRetirement = { auditCode: "deep-private" };
  assert.throws(() => owner.redactRetirementValue(root), /bounded/);
});

test("existing generated cache lookup is bypassed before postGet when effective schema caching is disabled", async () => {
  const getOwner = require("../../../../nodics.foundation/modules/nDatabase/database/src/service/procs/get/defaultModelsGetInitializerService");
  global.CONFIG = { get: () => ({ enabled: true }) };
  global.SERVICE = {
    DefaultCacheService: {
      get: () => {
        throw Error("warm cache must not be used");
      },
    },
  };
  for (const name of [
    "employee",
    "customer",
    "password",
    "identityMigrationAudit",
  ]) {
    let continued = false;
    const request = {
      schemaModel: {
        schemaName: name,
        rawSchema: {},
        cache: { enabled: false },
      },
      options: {},
    };
    await new Promise((resolve, reject) =>
      getOwner.lookupCache(
        request,
        {},
        {
          nextSuccess: () => {
            continued = true;
            resolve();
          },
          stop: () => {
            throw Error("must not stop before privacy hooks");
          },
          error: (_request, _response, error) => reject(error),
        },
      ),
    );
    assert.equal(continued, true);
    if (name !== "identityMigrationAudit") {
      const response = {
        success: {
          result: [{ identityLinkRetirement: { fingerprint: "private" } }],
        },
      };
      source.redactRetirement(request, response);
      assert.equal(
        response.success.result[0].identityLinkRetirement,
        undefined,
      );
    }
  }
});

test("same active read request cannot be reused concurrently and scope survives the refused second call", async () => {
  let release;
  const pending = new Promise((resolve) => {
    release = resolve;
  });
  const owner = {
    ...source,
    fail: () => {
      throw Error("reused");
    },
  };
  global.SERVICE = {
    DefaultCustomerService: {
      get: async () => {
        await pending;
        return { code: "SUC_READ", result: [] };
      },
    },
  };
  const request = { options: { recursive: false, skipItemCache: true } };
  const first = owner.generatedRead("DefaultCustomerService", request);
  await assert.rejects(
    owner.generatedRead("DefaultCustomerService", request),
    /reused/,
  );
  assert.equal(owner.ownsRead(request), true);
  release();
  await first;
  assert.equal(owner.ownsRead(request), false);
});
