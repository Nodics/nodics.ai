/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module profile/test/employeeReferenceImport @description Verifies insert-only reference employee import and zero-write identity preservation. @layer test @owner profile */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const employee = require("../src/service/employee/defaultEmployeeService");
global.CLASSES = { NodicsError: class extends Error {} };

/** Creates an isolated generated-service fixture with tracked owner reads and writes. */
function fixture(rows = []) {
  const reads = [],
    writes = [];
  const owner = {
    ...employee,
    async get(request) {
      reads.push(request);
      const matches = rows.filter((row) =>
        request.query.$or.some((query) =>
          Object.entries(query).every(([key, value]) => row[key] === value),
        ),
      );
      return { code: "SUC_TEST", count: matches.length, result: matches };
    },
    async save(request) {
      writes.push(request);
      const row = { ...request.model, _id: "employee-1" };
      rows.push(row);
      return { code: "SUC_TEST", result: row };
    },
  };
  return { owner, reads, writes, rows };
}
const model = {
  code: "operator-1",
  loginId: "operator@example.test",
  active: true,
  password: { password: "fixture-only" },
};
const request = () => ({
  tenant: "tenant-1",
  authData: { userGroups: ["importers"] },
  models: [structuredClone(model)],
});

test("fresh import preserves generated authority and uses insert-only save; retry never rewrites credentials", async () => {
  const f = fixture(),
    input = request();
  assert.deepEqual(await f.owner.ensureReferenceAll(input), {
    result: [{ code: model.code }],
  });
  assert.equal(f.writes.length, 1);
  assert.deepEqual(f.writes[0].options, { insertOnly: true });
  assert.equal(f.writes[0].authData, input.authData);
  assert.equal(f.writes[0].query, undefined);
  f.rows[0].password = "a-new-owner-credential";
  f.rows[0].userGroups = ["owner-edited-group"];
  assert.deepEqual(await f.owner.ensureReferenceAll(request()), {
    result: [{ code: model.code }],
  });
  assert.equal(f.writes.length, 1);
  assert.equal(f.rows[0].password, "a-new-owner-credential");
  assert.deepEqual(f.rows[0].userGroups, ["owner-edited-group"]);
  assert(
    f.reads.every(
      (read) => read.options.skipItemCache && read.options.recursive === false,
    ),
  );
});

test("existing identity conflicts, inactive, linked and service employees fail without writes", async () => {
  for (const delta of [
    { loginId: "different@example.test" },
    { code: "different" },
    { active: false },
    { authenticationIdentity: "anchor" },
    { principalType: "service" },
  ]) {
    const f = fixture([{ ...model, _id: "original", ...delta }]);
    await assert.rejects(
      f.owner.ensureReferenceAll(request()),
      /ERR_PROFILE_CREDENTIAL_OWNERSHIP/,
    );
    assert.equal(f.writes.length, 0);
  }
});

test("ambiguous, failed and incomplete owner reads cannot become inserts", async () => {
  for (const response of [
    { code: "ERR_TEST", count: 0, result: [] },
    { code: "SUC_TEST", result: [] },
    { code: "SUC_TEST", count: 1, result: [] },
    { code: "SUC_TEST", count: 0, result: [], errors: [{}] },
    {
      code: "SUC_TEST",
      count: 2,
      result: [
        { ...model, _id: "a" },
        { ...model, _id: "b" },
      ],
    },
  ]) {
    const f = fixture();
    f.owner.get = async () => response;
    await assert.rejects(
      f.owner.ensureReferenceAll(request()),
      /ERR_PROFILE_CREDENTIAL_OWNERSHIP/,
    );
    assert.equal(f.writes.length, 0);
  }
});

test("invalid and repeated source keys reject before reads", async () => {
  for (const models of [
    [model, model],
    [{ ...model, code: { $ne: null } }],
    [{ ...model, _id: "injected" }],
    Array(101).fill(model),
  ]) {
    const f = fixture();
    await assert.rejects(
      f.owner.ensureReferenceAll({ ...request(), models }),
      /ERR_PROFILE_CREDENTIAL_OWNERSHIP/,
    );
    assert.equal(f.reads.length, 0);
  }
});

test("uncertain save acknowledgement fails without a blind second write", async () => {
  const f = fixture();
  f.owner.save = async (input) => {
    f.writes.push(input);
    return { code: "SUC_TEST", result: [] };
  };
  await assert.rejects(
    f.owner.ensureReferenceAll(request()),
    /ERR_PROFILE_CREDENTIAL_OWNERSHIP/,
  );
  assert.equal(f.writes.length, 1);
});
