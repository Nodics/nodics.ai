/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module wasteImpact/test/wasteImpactAssessment @description Exercises immutable history, explicit selection, CAS, permission, retries and partial persistence recovery with a generated-repository boundary fixture. @owner wasteImpact @layer test */
const { test, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const assessment = require("../src/service/defaultWasteImpactAssessmentService");
let db, calls, failure, providerValue;
const clone = (value) =>
  value === undefined ? undefined : structuredClone(value);
const key = (schema, code) => schema + ":" + code;
const request = (changes = {}) => ({
  code: "S",
  tenant: "t",
  authData: { loginId: "reviewer", principalType: "human" },
  expectedRevision: 1,
  confirmed: true,
  payload: { reason: "New method comparison" },
  idempotencyKey: "command-1234",
  ...changes,
});
function matches(row, query) {
  return Object.entries(query).every(([path, wanted]) =>
    path === "$or"
      ? wanted.some((q) => matches(row, q))
      : path.split(".").reduce((v, k) => v?.[k], row) === wanted,
  );
}
beforeEach(() => {
  db = new Map();
  calls = [];
  failure = null;
  providerValue = "2";
  const asset = {
    code: "A",
    sourceSubmissionCode: "S",
    revision: 1,
    assetStatus: "OWNED",
    impactRef: { code: "ORIGINAL" },
    rewardSettlementRefs: [{ code: "LEDGER" }],
    metadata: {
      facts: { itemTypeCode: "PHONE", weight: 1 },
      settlementStatus: "COMPLETED",
      approvedEstimate: { code: "ORIGINAL" },
      valuation: { rewards: ["KEEP"] },
    },
  };
  for (const [schema, row] of [
    ["wasteAsset", asset],
    ["wasteSubmission", { code: "S", submissionStatus: "APPROVED" }],
    ["wasteItemType", { code: "PHONE", impactProfileCode: "P" }],
    [
      "wasteImpactProfile",
      { code: "P", formulaType: "EXTERNAL_PROVIDER", status: "ACTIVE" },
    ],
    [
      "wasteImpactResult",
      {
        code: "ORIGINAL",
        metrics: [{ value: "1" }],
        calculationStatus: "ESTIMATED",
        metadata: { environmentalAssessment: { status: "ESTIMATED" } },
      },
    ],
  ])
    db.set(key(schema, row.code), clone(row));
  global.SERVICE = {
    DefaultWasteOperationalAccessService: {
      authorize: async (req, permission) => {
        if (req.denied)
          throw Object.assign(Error("denied"), { code: "DENIED" });
        calls.push(permission);
      },
      assertRecord: async (req) => {
        if (req.outsideScope)
          throw Object.assign(Error("scope"), { code: "DENIED" });
      },
    },
    DefaultWastePersistenceService: {
      fail: (code, message) => {
        throw Object.assign(Error(message), { code });
      },
      one: async (schema, req, code) => clone(db.get(key(schema, code))),
      list: async (schema, req, query) =>
        [...db.entries()]
          .filter(
            ([k, row]) => k.startsWith(schema + ":") && matches(row, query),
          )
          .map(([, row]) => clone(row)),
      page: async (schema, req, query, page, limit) => {
        const items = await SERVICE.DefaultWastePersistenceService.list(
          schema,
          req,
          query,
        );
        return {
          items: items.slice((page - 1) * limit, page * limit),
          total: items.length,
        };
      },
      revision: (row, expected) => {
        if (row.revision !== expected)
          throw Object.assign(Error("stale"), {
            code: "ERR_WASTE_REVISION_CONFLICT",
          });
      },
      update: async (schema, req, row, patch) => {
        const current = db.get(key(schema, row.code));
        SERVICE.DefaultWastePersistenceService.revision(current, row.revision);
        const next = {
          ...current,
          ...clone(patch),
          revision: row.revision + 1,
        };
        db.set(key(schema, row.code), next);
        return clone(next);
      },
      create: async (schema, req, row) => {
        if (failure === schema) throw Error("persistence unavailable");
        if (db.has(key(schema, row.code))) throw Error("must never overwrite");
        db.set(key(schema, row.code), clone(row));
        return clone(row);
      },
    },
    DefaultWasteImpactCalculationService: {
      calculate: async (req) => {
        calls.push("calculate");
        return {
          code: req.resultCode,
          calculatedAt: new Date().toISOString(),
          calculationStatus: "ESTIMATED",
          metrics: [
            { metricCode: "ESTIMATED_CO2E_SAVED_KG", value: providerValue },
          ],
          metadata: {
            impactProvider: { code: "PROVIDER_" + providerValue },
            environmentalAssessment: {
              status: "ESTIMATED",
              methodology: { providerCode: "PROVIDER_" + providerValue },
            },
          },
        };
      },
    },
  };
});
test("reassessment appends evidence and explicit acceptance alone changes the accepted pointer", async () => {
  const old = clone(db.get(key("wasteImpactResult", "ORIGINAL"))),
    asset = clone(db.get(key("wasteAsset", "A")));
  let history = await assessment.reassess(request());
  const candidate = history.items.find((x) => x.code !== "ORIGINAL");
  assert.equal(history.total, 2);
  assert.equal(history.acceptedAssessmentCode, "ORIGINAL");
  providerValue = "99"; // Configuration changed after calculation: acceptance must use the saved value.
  history = await assessment.select(
    request({
      expectedRevision: history.assetRevision,
      idempotencyKey: "select-1234",
      payload: {
        reason: "Reviewed the method",
        assessmentCode: candidate.code,
      },
    }),
  );
  assert.equal(history.acceptedAssessmentCode, candidate.code);
  assert.equal(history.selectionHistory.total, 1);
  assert.deepEqual(db.get(key("wasteImpactResult", "ORIGINAL")), old);
  const current = db.get(key("wasteAsset", "A"));
  assert.equal(current.metadata.acceptedEstimate.metrics[0].value, "2");
  assert.deepEqual(
    current.metadata.approvedEstimate,
    asset.metadata.approvedEstimate,
  );
  assert.deepEqual(current.metadata.valuation, asset.metadata.valuation);
  assert.deepEqual(current.rewardSettlementRefs, asset.rewardSettlementRefs);
});
test("same command retries do not recalculate; altered payload with same key conflicts", async () => {
  const first = await assessment.reassess(request());
  providerValue = "99";
  const second = await assessment.reassess(request());
  assert.equal(first.total, second.total);
  assert.equal(calls.filter((x) => x === "calculate").length, 1);
  await assert.rejects(
    assessment.reassess(request({ payload: { reason: "Changed" } })),
    { code: "ERR_WASTE_COMMAND_CONFLICT" },
  );
});
test("failed result persistence recovers the frozen result after a provider change", async () => {
  failure = "wasteImpactResult";
  await assert.rejects(
    assessment.reassess(request()),
    /persistence unavailable/,
  );
  const pending = await assessment.history(request());
  assert.equal(pending.recoveryRequired, true);
  providerValue = "99";
  failure = null;
  const recovered = await assessment.recover(
    request({ expectedRevision: pending.assetRevision }),
  );
  assert.equal(recovered.recoveryRequired, false);
  assert.equal(calls.filter((x) => x === "calculate").length, 1);
  assert.equal(
    db.get(
      key(
        "wasteImpactResult",
        recovered.items.find((x) => x.code !== "ORIGINAL").code,
      ),
    ).metrics[0].value,
    "2",
  );
});
test("selection persistence failure recovers its acceptance event without changing rewards", async () => {
  let history = await assessment.reassess(request());
  const candidate = history.items.find((x) => x.code !== "ORIGINAL");
  failure = "wasteImpactSelection";
  await assert.rejects(
    assessment.select(
      request({
        expectedRevision: history.assetRevision,
        payload: { assessmentCode: candidate.code, reason: "Accept" },
      }),
    ),
    /persistence unavailable/,
  );
  history = await assessment.history(request());
  assert.equal(history.acceptedAssessmentCode, candidate.code);
  failure = null;
  history = await assessment.recover(
    request({ expectedRevision: history.assetRevision }),
  );
  assert.equal(history.selectionHistory.total, 1);
  assert.equal(history.recoveryRequired, false);
});
test("stale, unconfirmed, outside-scope, foreign result and request-provider overrides cannot mutate history", async () => {
  for (const delta of [
    { expectedRevision: 0 },
    { confirmed: false },
    { denied: true },
    { outsideScope: true },
    { payload: { reason: "x", providerService: "Evil" } },
  ])
    await assert.rejects(assessment.reassess(request(delta)));
  await assert.rejects(
    assessment.select(
      request({ payload: { reason: "x", assessmentCode: "FOREIGN" } }),
    ),
  );
  assert.equal(db.get(key("wasteAsset", "A")).revision, 1);
  assert.equal(calls.filter((x) => x === "calculate").length, 0);
});
test("parallel candidates use asset CAS so only one result can be attached at the displayed revision", async () => {
  const results = await Promise.allSettled([
    assessment.reassess(request()),
    assessment.reassess(request({ idempotencyKey: "command-other" })),
  ]);
  assert.equal(results.filter((x) => x.status === "fulfilled").length, 1);
  assert.equal((await assessment.history(request())).total, 2);
});
test("replaying an old acceptance never reverts a subsequently accepted assessment", async () => {
  let history = await assessment.reassess(request());
  const first = history.items.find((x) => x.code !== "ORIGINAL");
  const accept = request({
    expectedRevision: history.assetRevision,
    payload: { reason: "Accept", assessmentCode: first.code },
    idempotencyKey: "accept-first",
  });
  history = await assessment.select(accept);
  history = await assessment.reassess(
    request({
      expectedRevision: history.assetRevision,
      idempotencyKey: "second-assessment",
    }),
  );
  const second = history.items.find(
    (x) => !["ORIGINAL", first.code].includes(x.code),
  );
  history = await assessment.select(
    request({
      expectedRevision: history.assetRevision,
      payload: { reason: "Next", assessmentCode: second.code },
      idempotencyKey: "accept-second",
    }),
  );
  assert.equal(
    (await assessment.select(accept)).acceptedAssessmentCode,
    second.code,
  );
});

test("failed provider candidates remain auditable and cannot replace accepted evidence", async () => {
  SERVICE.DefaultWasteImpactCalculationService.calculate = async (req) => ({
    code: req.resultCode,
    calculatedAt: new Date().toISOString(),
    calculationStatus: "FAILED",
    metrics: [],
    metadata: { environmentalAssessment: { status: "FAILED" } },
  });
  const history = await assessment.reassess(request());
  const candidate = history.items.find((item) => item.code !== "ORIGINAL");
  assert.equal(candidate.calculationStatus, "FAILED");
  assert.equal(history.acceptedAssessmentCode, "ORIGINAL");
  await assert.rejects(
    assessment.select(
      request({
        expectedRevision: history.assetRevision,
        payload: {
          reason: "Attempt failed result",
          assessmentCode: candidate.code,
        },
      }),
    ),
    { code: "ERR_WASTE_IMPACT_COMMAND_INVALID" },
  );
  assert.equal((await assessment.history(request())).selectionHistory.total, 0);
});
test("changed item facts and incomplete original settlement reject candidate acceptance", async () => {
  const history = await assessment.reassess(request()),
    candidate = history.items.find((item) => item.code !== "ORIGINAL");
  const req = request({
    expectedRevision: history.assetRevision,
    payload: { reason: "Accept result", assessmentCode: candidate.code },
  });
  const asset = db.get(key("wasteAsset", "A"));
  asset.metadata.facts.weight = 5;
  await assert.rejects(assessment.select(req), {
    code: "ERR_WASTE_IMPACT_CONFLICT",
  });
  asset.metadata.facts.weight = 1;
  asset.metadata.settlementStatus = "PENDING";
  await assert.rejects(assessment.select(req), {
    code: "ERR_WASTE_IMPACT_CONFLICT",
  });
  assert.equal(
    (await assessment.history(request())).acceptedAssessmentCode,
    "ORIGINAL",
  );
});
