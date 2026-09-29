/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";

const locationDistance = require("../../../../../../../nodics.location/modules/locationCore/src/service/defaultLocationDistanceService");

/** @module eWaste/service/defaultEWasteJourneyService @description Orchestrates fresh arrival, evidence preparation and confirmation through Waste owners. @layer service @owner eWaste @override Later customer layers may refine policy and guidance through configured values and exported members. */
module.exports = {
  /** Delegates context help without changing the journey stage. */
  message: function (request) {
    return SERVICE.DefaultEWasteConversationService.message(request);
  },
  /** Resolves the current project policy. */
  settings: function () {
    return this.validateSettings((CONFIG.get("eWaste") || {}).journey || {});
  },
  /** Validates effective configuration before any arrival decision. */
  validateSettings: function (policy) {
    if (
      ![
        "arrivalRadiusMetres",
        "maximumPositionAgeMs",
        "captureTimeoutMs",
      ].every((key) => Number.isFinite(policy[key]) && policy[key] > 0) ||
      !Number.isInteger(policy.nearestCentreCount) ||
      policy.nearestCentreCount < 3
    )
      this.fail(
        "ERR_EWASTE_JOURNEY_UNAVAILABLE",
        "The collection journey is temporarily unavailable.",
      );
    return policy;
  },
  /** Returns the owning domain facade. */
  domain: function () {
    return SERVICE.DefaultEWasteExperienceService;
  },
  /** Returns the domain-owned persistence adapter. */
  store: function () {
    return SERVICE.DefaultWastePersistenceService;
  },
  /** Returns a testable clock for freshness checks. */
  now: function () {
    return Date.now();
  },
  /** Validates a device observation without trusting a caller-provided arrival verdict. */
  position: function (value) {
    const p = value || {},
      policy = this.settings();
    if (
      !Number.isFinite(p.latitude) ||
      Math.abs(p.latitude) > 90 ||
      !Number.isFinite(p.longitude) ||
      Math.abs(p.longitude) > 180 ||
      !Number.isFinite(p.capturedAt)
    ) {
      this.fail(
        "ERR_EWASTE_POSITION_INVALID",
        "The device did not return a usable location. Please check location again.",
      );
    }
    if (
      p.capturedAt > this.now() + 5000 ||
      this.now() - p.capturedAt > policy.maximumPositionAgeMs
    )
      this.fail(
        "ERR_EWASTE_POSITION_STALE",
        "This location reading has expired. Check location again to continue.",
      );
    return {
      latitude: p.latitude,
      longitude: p.longitude,
      // Accuracy is optional observation metadata; arrival uses direct distance.
      accuracy:
        Number.isFinite(p.accuracy) && p.accuracy >= 0 ? p.accuracy : null,
      capturedAt: p.capturedAt,
    };
  },
  /** Uses Location's pure calculation without requiring its runtime on the Waste server. */
  distance: function (a, b) {
    return locationDistance.distance(a, b);
  },
  /** Maps domain errors for a trusted project adapter; request bodies cannot choose codes. */
  errorCode: function (code) {
    return code;
  },
  /** Preserves the owning persistence error contract. */
  fail: function (code, message) {
    return this.store().fail(this.errorCode(code), message);
  },
  /** Supplies channel provenance from trusted authentication context only. */
  origin: function (request) {
    return request.authData?.eWasteOrigin || { channel: "WEB" };
  },
  /** Obtains live public collection points and their owning Location projection. */
  centres: async function (request, position) {
    const result = await this.domain().experience(request);
    return (result.centres || [])
      .map((centre) => {
        const coordinates = centre.location;
        if (
          !coordinates ||
          coordinates.status !== "ACTIVE" ||
          !Number.isFinite(coordinates.latitude) ||
          !Number.isFinite(coordinates.longitude)
        )
          return null;
        return Object.assign({}, centre, {
          distanceMetres: this.distance(position, coordinates),
        });
      })
      .filter(Boolean)
      .sort(
        (a, b) =>
          a.distanceMetres - b.distanceMetres || a.code.localeCompare(b.code),
      );
  },
  /** Checks location before a submission exists; closing this stage leaves no Waste record. */
  previewArrival: async function (request) {
    const position = this.position(request.payload.position);
    const centres = await this.centres(request, position);
    const nearby = centres.filter(
      (centre) => centre.distanceMetres <= this.settings().arrivalRadiusMetres,
    );
    const choice = request.payload.collectionPointCode;
    const selected = choice
      ? nearby.find((centre) => centre.code === choice)
      : nearby.length === 1
        ? nearby[0]
        : null;
    if (choice && !selected)
      this.fail(
        "ERR_EWASTE_ARRIVAL_REQUIRED",
        "Choose a collection centre near your current location",
      );
    return {
      contractVersion: 1,
      draft: null,
      selectedCentre: selected || null,
      nearbyCentres: nearby,
      centres: centres.slice(0, this.settings().nearestCentreCount),
      policy: {
        arrivalRadiusMetres: this.settings().arrivalRadiusMetres,
        maximumPositionAgeMs: this.settings().maximumPositionAgeMs,
        captureTimeoutMs: this.settings().captureTimeoutMs,
      },
      nextAction: selected
        ? "PHOTO"
        : nearby.length > 1
          ? "CHOOSE_CENTRE"
          : "TRAVEL",
    };
  },
  /** Applies fresh arrival policy before transient analysis and stores only a successful preparation. */
  prepareSubmission: async function (request) {
    const arrival = await this.previewArrival(request);
    if (!arrival.selectedCentre)
      this.fail(
        "ERR_EWASTE_ARRIVAL_REQUIRED",
        "Confirm your arrival before preparing the photo",
      );
    const position = this.position(request.payload.position);
    const prepared = await this.domain().prepareSubmission({
      ...request,
      preparationCentreCode: arrival.selectedCentre.code,
      preparationArrival: {
        position,
        collectionPointCode: arrival.selectedCentre.code,
        checkedAt: this.now(),
        distanceMetres: arrival.selectedCentre.distanceMetres,
      },
      preparationOrigin: this.origin(request),
    });
    return prepared;
  },
  /** Persists a fresh observation and the selected nearby centre on the existing owner-authorized draft. */
  arrival: async function (request) {
    const draft = await this.domain().readDraft(request);
    this.store().revision(draft, request.expectedRevision);
    const position = this.position(request.payload.position);
    const centres = await this.centres(request, position);
    const nearby = centres.filter(
      (c) => c.distanceMetres <= this.settings().arrivalRadiusMetres,
    );
    const choice = request.payload.collectionPointCode;
    const selected = choice
      ? nearby.find((c) => c.code === choice)
      : nearby.length === 1
        ? nearby[0]
        : undefined;
    if (choice && !selected)
      this.fail(
        "ERR_EWASTE_ARRIVAL_REQUIRED",
        `Choose a collection centre within ${this.settings().arrivalRadiusMetres} metres of your current location.`,
      );
    const editable = [
      "DRAFT",
      "MEDIA_STAGED",
      "METADATA_SUGGESTED",
      "AWAITING_SUBMITTER_CONFIRMATION",
    ].includes(draft.submissionStatus);
    if (!editable)
      this.fail(
        "ERR_WASTE_SUBMISSION_IMMUTABLE",
        "This submission is already recorded.",
      );
    const changedCentre =
      selected &&
      draft.submittedFacts.preferredCollectionPointCode !== selected.code;
    const next = await this.store().update("wasteSubmission", request, draft, {
      submittedFacts: Object.assign(
        {},
        draft.submittedFacts,
        selected ? { preferredCollectionPointCode: selected.code } : {},
      ),
      metadata: Object.assign({}, draft.metadata, {
        arrival: selected
          ? {
              position,
              collectionPointCode: selected.code,
              checkedAt: this.now(),
              distanceMetres: selected.distanceMetres,
            }
          : null,
        ...(changedCentre
          ? { estimate: null, confirmationRevision: null }
          : {}),
      }),
    });
    return {
      contractVersion: 1,
      draft: next,
      selectedCentre: selected || null,
      nearbyCentres: nearby,
      centres: centres.slice(
        0,
        Math.max(3, this.settings().nearestCentreCount),
      ),
      policy: {
        arrivalRadiusMetres: this.settings().arrivalRadiusMetres,
        maximumPositionAgeMs: this.settings().maximumPositionAgeMs,
        captureTimeoutMs: this.settings().captureTimeoutMs,
      },
      nextAction: selected
        ? "PHOTO"
        : nearby.length > 1
          ? "CHOOSE_CENTRE"
          : "TRAVEL",
    };
  },
  /** Revalidates current stored observation against current Location coordinates before evidence/submission. */
  assertArrival: async function (request, draft) {
    const arrival = draft.metadata && draft.metadata.arrival;
    if (
      !arrival ||
      arrival.collectionPointCode !==
        draft.submittedFacts.preferredCollectionPointCode
    )
      this.fail(
        "ERR_EWASTE_ARRIVAL_REQUIRED",
        "Check your location at the collection centre before continuing.",
      );
    const position = this.position(arrival.position);
    const centre = (await this.centres(request, position)).find(
      (c) => c.code === arrival.collectionPointCode,
    );
    if (!centre || centre.distanceMetres > this.settings().arrivalRadiusMetres)
      this.fail(
        "ERR_EWASTE_ARRIVAL_REQUIRED",
        `You need to be within ${this.settings().arrivalRadiusMetres} metres of an available collection centre.`,
      );
    return centre;
  },
  /** Rejects early creation; the journey saves only after photo analysis succeeds. */
  createDraft: async function (request) {
    return this.fail(
      "ERR_WASTE_EVIDENCE_REQUIRED",
      "Add a photo and complete analysis before saving a submission",
    );
  },
  /** Enforces arrival before the domain attaches private Media evidence. */
  attachPhoto: async function (request) {
    await this.assertArrival(request, await this.domain().readDraft(request));
    return this.domain().attachPhoto(request);
  },
  /** Builds the editable preview automatically after provider analysis without changing final confirmation semantics. */
  analyzePhoto: async function (request) {
    await this.assertArrival(request, await this.domain().readDraft(request));
    const suggested = await this.domain().analyzePhoto(request);
    const facts =
      suggested.metadata &&
      suggested.metadata.suggestion &&
      suggested.metadata.suggestion.facts;
    if (!facts) return suggested;
    const updated = await this.domain().applyAnalysis(
      Object.assign({}, request, {
        expectedRevision: suggested.revision,
      }),
    );
    return this.prepare(
      Object.assign({}, request, { expectedRevision: updated.revision }),
    );
  },
  /** Validates essential facts and requires the domain assessment; provider failures remain retryable errors. */
  prepare: async function (request) {
    const draft = await this.domain().readDraft(request);
    this.store().revision(draft, request.expectedRevision);
    await SERVICE.DefaultWasteSubmissionOperationService.validateFacts(
      request,
      draft,
    );
    return this.domain().estimate(request);
  },
  /** Persists handoff context before confirmation so retry recovers the same receipt. */
  confirm: async function (request) {
    let draft = await this.domain().readDraft(request);
    if (
      draft.metadata.confirmationKey === request.idempotencyKey &&
      ["SUBMITTED", "UNDER_REVIEW", "APPROVED", "REJECTED"].includes(
        draft.submissionStatus,
      )
    )
      return draft;
    this.store().revision(draft, request.expectedRevision);
    const centre = await this.assertArrival(request, draft);
    const queue = this.settings().reviewAssignment;
    const label =
      typeof centre.name === "string"
        ? centre.name
        : (centre.name && centre.name.en) || centre.code;
    draft = await this.store().update("wasteSubmission", request, draft, {
      metadata: Object.assign({}, draft.metadata, {
        reviewAssignment:
          queue && queue.queueCode
            ? {
                queueCode: queue.queueCode,
                label: queue.label,
                status: "ASSIGNED",
                assignedAt: new Date(this.now()).toISOString(),
              }
            : { status: "PENDING" },
        depositInstruction: (
          this.settings().depositInstruction ||
          "Follow the collection centre's deposit instructions."
        ).replace("{centreName}", label),
      }),
    });
    return this.domain().confirm(
      Object.assign({}, request, { expectedRevision: draft.revision }),
    );
  },
};
