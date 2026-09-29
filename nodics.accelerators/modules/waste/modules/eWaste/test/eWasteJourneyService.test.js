/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const journey = require("../src/service/defaultEWasteJourneyService");

const policy = {
  arrivalRadiusMetres: 75,
  maximumPositionAgeMs: 60000,
  captureTimeoutMs: 12000,
  nearestCentreCount: 3,
};
const observation = { latitude: 25, longitude: 55, capturedAt: 100000 };
let service, draft, centres, calls;
test.beforeEach(() => {
  calls = [];
  draft = {
    code: "saved",
    revision: 4,
    submissionStatus: "DRAFT",
    submittedFacts: { preferredCollectionPointCode: "old" },
    evidenceRefs: [{ code: "saved-photo" }],
    metadata: { estimate: { code: "old-estimate" }, confirmationRevision: 3 },
  };
  centres = [
    {
      code: "centre",
      name: { en: "Centre" },
      location: { ...observation, status: "ACTIVE" },
    },
  ];
  global.CONFIG = {
    get: (key) => {
      assert.equal(key, "eWaste");
      return { journey: policy };
    },
  };
  global.SERVICE = {
    DefaultWastePersistenceService: {
      fail: (code, message) => {
        throw Object.assign(new Error(message), { code });
      },
      revision: (record, revision) => assert.equal(record.revision, revision),
      update: async (schema, request, old, patch) => {
        assert.equal(schema, "wasteSubmission");
        assert.equal(old.revision, draft.revision);
        calls.push("update");
        return (draft = { ...old, ...patch, revision: old.revision + 1 });
      },
    },
    DefaultEWasteExperienceService: {
      experience: async () => ({ centres }),
      readDraft: async () => draft,
      prepareSubmission: async (request) => {
        calls.push(request);
        return draft;
      },
      confirm: async (request) => {
        assert.equal(request.expectedRevision, draft.revision);
        calls.push("confirm");
        return (draft = {
          ...draft,
          submissionStatus: "SUBMITTED",
          metadata: {
            ...draft.metadata,
            confirmationKey: request.idempotencyKey,
          },
        });
      },
    },
  };
  service = { ...journey, now: () => 100000 };
});
test.afterEach(() => {
  delete global.CONFIG;
  delete global.SERVICE;
});

test("independent domain preview uses eWaste policy without a Location runtime or persistence", async () => {
  const result = await service.previewArrival({
    payload: { position: observation },
  });
  assert.equal(result.nextAction, "PHOTO");
  assert.equal(result.selectedCentre.distanceMetres, 0);
  assert.equal(result.policy.arrivalRadiusMetres, 75);
  assert.equal(result.draft, null);
  assert.deepEqual(calls, []);
  assert.equal(SERVICE.DefaultLocationDistanceService, undefined);
  assert.throws(() => service.position({ ...observation, latitude: 91 }), {
    code: "ERR_EWASTE_POSITION_INVALID",
  });
});

test("missing domain policy fails closed and a later-layer settings hook is honored", async () => {
  CONFIG.get = () => ({});
  assert.throws(() => service.position(observation), {
    code: "ERR_EWASTE_JOURNEY_UNAVAILABLE",
  });
  const custom = {
    ...service,
    settings: () => ({ ...policy, arrivalRadiusMetres: 100 }),
    distance: () => 100,
  };
  assert.equal(
    (await custom.previewArrival({ payload: { position: observation } }))
      .nextAction,
    "PHOTO",
  );
  custom.distance = () => 100.00001;
  assert.equal(
    (await custom.previewArrival({ payload: { position: observation } }))
      .nextAction,
    "TRAVEL",
  );
});

test("neutral journey defaults require a positive explicit arrival policy", () => {
  const defaults = require("../config/properties").eWaste.journey;
  assert.equal(defaults.arrivalRadiusMetres, undefined);
  assert.equal(defaults.maximumPositionAgeMs, 60000);
  assert.equal(defaults.captureTimeoutMs, 12000);
  assert.equal(defaults.nearestCentreCount, 3);
  assert.throws(() => service.validateSettings(defaults), { code: "ERR_EWASTE_JOURNEY_UNAVAILABLE" });
  const selected = { ...defaults, arrivalRadiusMetres: 150, captureTimeoutMs: 18000 };
  assert.deepEqual(service.validateSettings(selected), selected);
  for (const arrivalRadiusMetres of [0, -1, NaN, Infinity, "150"]) {
    assert.throws(() => service.validateSettings({ ...selected, arrivalRadiusMetres }), {
      code: "ERR_EWASTE_JOURNEY_UNAVAILABLE",
    });
  }
  assert.equal(defaults.arrivalRadiusMetres, undefined);
});

test("freshness boundaries are inclusive and rejected checks preserve saved evidence", async () => {
  const before = structuredClone(draft);
  for (const capturedAt of [40000, 105000])
    assert.equal(
      service.position({ ...observation, capturedAt }).capturedAt,
      capturedAt,
    );
  for (const capturedAt of [39999, 105001]) {
    await assert.rejects(
      service.arrival({
        expectedRevision: 4,
        payload: { position: { ...observation, capturedAt } },
      }),
      { code: "ERR_EWASTE_POSITION_STALE" },
    );
  }
  assert.deepEqual(draft, before);
  assert.deepEqual(calls, []);
});

test("centre changes clear derived confirmation data while keeping the saved photo", async () => {
  const result = await service.arrival({
    expectedRevision: 4,
    payload: { position: { ...observation, accuracy: 3000 } },
  });
  assert.equal(result.draft.metadata.arrival.position.accuracy, 3000);
  assert.equal(result.draft.metadata.estimate, null);
  assert.equal(result.draft.metadata.confirmationRevision, null);
  assert.deepEqual(result.draft.evidenceRefs, [{ code: "saved-photo" }]);
});

test("preparation forwards trusted context and origin with checked arrival", async () => {
  const request = {
    authData: { eWasteOrigin: { channel: "TELEGRAM" } },
    tenant: "isolated",
    correlationId: "trace",
    idempotencyKey: "photo-command",
    payload: {
      position: observation,
      origin: { channel: "FORGED" },
      collectionPointCode: "centre",
    },
  };
  await service.prepareSubmission(request);
  const forwarded = calls[0];
  assert.equal(forwarded.authData, request.authData);
  assert.equal(forwarded.tenant, request.tenant);
  assert.equal(forwarded.correlationId, request.correlationId);
  assert.equal(forwarded.idempotencyKey, request.idempotencyKey);
  assert.deepEqual(forwarded.preparationOrigin, { channel: "TELEGRAM" });
  assert.equal(forwarded.preparationArrival.collectionPointCode, "centre");
  assert.equal(forwarded.preparationArrival.distanceMetres, 0);
  assert.deepEqual(service.origin({ payload: request.payload }), {
    channel: "WEB",
  });
});

test("confirmation rechecks coordinates, preserves revisions, and replays without another write", async () => {
  await service.arrival({
    expectedRevision: 4,
    payload: { position: observation },
  });
  const saved = structuredClone(draft);
  centres[0].location.latitude = 26;
  await assert.rejects(
    service.confirm({ expectedRevision: 5, idempotencyKey: "confirm" }),
    { code: "ERR_EWASTE_ARRIVAL_REQUIRED" },
  );
  assert.deepEqual(draft, saved);
  centres[0].location.latitude = 25;
  const result = await service.confirm({
    expectedRevision: 5,
    idempotencyKey: "confirm",
  });
  assert.equal(result.metadata.reviewAssignment.status, "PENDING");
  const count = calls.length;
  centres = [];
  service.now = () => 999999;
  assert.equal(
    await service.confirm({ expectedRevision: 5, idempotencyKey: "confirm" }),
    result,
  );
  assert.equal(calls.length, count);
});

test("analysis advances with returned revisions and propagates assessment failure", async () => {
  await service.arrival({
    expectedRevision: 4,
    payload: { position: observation },
  });
  SERVICE.DefaultEWasteExperienceService.analyzePhoto = async () => ({
    revision: 6,
    metadata: { suggestion: { facts: { quantity: 1 } } },
  });
  SERVICE.DefaultEWasteExperienceService.applyAnalysis = async (request) => {
    assert.equal(request.expectedRevision, 6);
    return { revision: 7 };
  };
  const custom = {
    ...service,
    prepare: async (request) => {
      assert.equal(request.expectedRevision, 7);
      throw Object.assign(new Error("Retry assessment"), {
        code: "ERR_WASTE_IMPACT_PROVIDER_UNAVAILABLE",
      });
    },
  };
  await assert.rejects(custom.analyzePhoto({ expectedRevision: 5 }), {
    code: "ERR_WASTE_IMPACT_PROVIDER_UNAVAILABLE",
  });
});
