/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
const crypto = require("node:crypto");

/** @module wasteImpact/service/defaultWasteImpactAssessmentService @description Owns immutable asset reassessments and explicit accepted-result selection through generated persistence. Serializes recoverable writes with asset revisions; never changes approval facts or reward settlement. @owner wasteImpact @layer service @override Later providers use the existing calculation adapter. Preserve source authorization, append-only history and command recovery. */
module.exports = {
  /** Resolves the generated-repository adapter. */
  store: function () {
    return SERVICE.DefaultWastePersistenceService;
  },
  /** Returns a detached snapshot for durable calculation evidence. */
  copy: function (value) {
    return JSON.parse(JSON.stringify(value));
  },
  /** Hashes deterministic command identities and bounded fingerprints. */
  digest: function (value) {
    return crypto
      .createHash("sha256")
      .update(JSON.stringify(value))
      .digest("hex");
  },
  /** Resolves the asset through its approved submission and enforces current Profile scope before revealing records. */
  context: async function (request, permission) {
    const store = this.store(),
      access = SERVICE.DefaultWasteOperationalAccessService;
    await access.authorize(request, permission);
    const submission = await store.one(
      "wasteSubmission",
      request,
      request.code,
    );
    if (!submission || submission.submissionStatus !== "APPROVED")
      store.fail(
        "ERR_WASTE_RECORD_NOT_FOUND",
        "An approved submission is required",
      );
    await access.assertRecord(request, permission, submission);
    const assets = await store.list(
      "wasteAsset",
      request,
      { sourceSubmissionCode: submission.code },
      2,
    );
    if (assets.length !== 1)
      store.fail(
        "ERR_WASTE_RECORD_NOT_FOUND",
        "The approved asset was not found",
      );
    return { submission, asset: assets[0] };
  },
  /** Validates explicit operator intent. Provider names, arbitrary facts and configuration are never accepted from the body. */
  command: function (request, asset, action) {
    const body = request.payload || {},
      allowed = [
        "reason",
        "assessmentCode",
        "expectedRevision",
        "confirmed",
        "idempotencyKey",
      ];
    if (
      Object.keys(body).some((key) => !allowed.includes(key)) ||
      request.confirmed !== true ||
      typeof body.reason !== "string" ||
      !body.reason.trim() ||
      body.reason.length > 1000 ||
      typeof request.idempotencyKey !== "string" ||
      !/^[A-Za-z0-9._:-]{8,180}$/.test(request.idempotencyKey) ||
      !Number.isSafeInteger(request.expectedRevision) ||
      (action === "SELECT" &&
        (typeof body.assessmentCode !== "string" ||
          body.assessmentCode.length > 180)) ||
      (action === "ASSESS" && body.assessmentCode !== undefined)
    )
      this.store().fail(
        "ERR_WASTE_IMPACT_COMMAND_INVALID",
        "Review the assessment, provide a reason and confirm the displayed revision",
      );
    const actor = request.authData.loginId;
    return {
      code:
        "IMPACT_" +
        action +
        "_" +
        this.digest([asset.code, actor, request.idempotencyKey])
          .slice(0, 32)
          .toUpperCase(),
      fingerprint: this.digest([
        asset.code,
        actor,
        action,
        body.reason.trim(),
        body.assessmentCode || null,
        request.expectedRevision,
      ]),
      actor,
      reason: body.reason.trim(),
      idempotencyKey: request.idempotencyKey,
    };
  },
  /** Rejects reuse of an idempotency key with changed command details. */
  assertCommand: function (record, command) {
    if (record.metadata?.commandFingerprint !== command.fingerprint)
      this.store().fail(
        "ERR_WASTE_COMMAND_CONFLICT",
        "This command reference already belongs to different assessment details",
      );
  },
  /** Returns public assessment data from a frozen record; internal actor and idempotency details stay private. */
  project: function (result, acceptedCode) {
    return {
      code: result.code,
      accepted: result.code === acceptedCode,
      calculatedAt: result.calculatedAt,
      calculationStatus: result.calculationStatus,
      formulaVersion: result.formulaVersion,
      assessment: result.metadata?.environmentalAssessment || null,
      previousAssessmentRef: result.metadata?.previousAssessmentRef || null,
      reason: result.metadata?.assessmentReason || null,
    };
  },
  /** Pages immutable records belonging to an already-authorized asset, including its legacy approval result. */
  historyForAsset: async function (request, asset) {
    const page = Number(request.query?.page || 1),
      limit = 20;
    if (!Number.isSafeInteger(page) || page < 1 || page > 10000)
      this.store().fail(
        "ERR_WASTE_IMPACT_COMMAND_INVALID",
        "Invalid assessment history page",
      );
    const original = asset.metadata?.approvedEstimate;
    const legacyCode = original?.code || asset.impactRef?.code;
    const result = await this.store().page(
      "wasteImpactResult",
      request,
      {
        $or: [
          { "metadata.assetRef.code": asset.code },
          ...(legacyCode ? [{ code: legacyCode }] : []),
        ],
      },
      page,
      limit,
      { calculatedAt: -1, code: 1 },
    );
    const accepted = asset.impactRef?.code
      ? await this.store().one(
          "wasteImpactResult",
          request,
          asset.impactRef.code,
        )
      : null;
    const selections = await this.store().page(
      "wasteImpactSelection",
      request,
      { assetCode: asset.code },
      page,
      limit,
      { selectedAt: -1, code: 1 },
    );
    return {
      contractVersion: 1,
      selectionHistory: {
        page,
        limit,
        total: selections.total,
        items: selections.items.map((event) => ({
          code: event.code,
          assessmentCode: event.assessmentRef?.code,
          previousAssessmentCode: event.previousAssessmentRef?.code || null,
          at: event.selectedAt,
          reason: event.reason,
        })),
      },
      assetCode: asset.code,
      assetRevision: asset.revision,
      acceptedAssessmentCode: asset.impactRef?.code || null,
      acceptedAssessment: accepted
        ? this.project(accepted, accepted.code)
        : null,
      originalAssessmentCode: original?.code || null,
      page,
      limit,
      total: result.total,
      items: result.items.map((item) =>
        this.project(item, asset.impactRef?.code),
      ),
      recoveryRequired: Boolean(asset.metadata?.pendingImpactCommand),
      recoveryAction: asset.metadata?.pendingImpactCommand
        ? asset.metadata.pendingImpactCommand.schema === "wasteImpactSelection"
          ? "SELECT"
          : "ASSESS"
        : null,
    };
  },
  /** Reads staff history under the same source scope as operational review. */
  history: async function (request) {
    const { asset } = await this.context(request, "waste.review.queue.read");
    return this.historyForAsset(request, asset);
  },
  /** Finishes an asset-persisted result or selection event without recalculating after configuration changes. */
  finish: async function (request, asset, command) {
    const pending = asset.metadata?.pendingImpactCommand;
    if (!pending || pending.record.code !== command.code)
      this.store().fail(
        "ERR_WASTE_IMPACT_CONFLICT",
        "Another assessment command needs recovery",
      );
    this.assertCommand(pending.record, command);
    let result = await this.store().one(pending.schema, request, command.code);
    if (result) this.assertCommand(result, command);
    else
      result = await this.store().create(
        pending.schema,
        request,
        this.copy(pending.record),
      );
    // A transfer may have advanced the asset revision. Clear only this command, preserving all newer metadata.
    const current = await this.store().one("wasteAsset", request, asset.code);
    if (current.metadata?.pendingImpactCommand?.record.code === command.code)
      return this.store().update("wasteAsset", request, current, {
        metadata: { ...current.metadata, pendingImpactCommand: null },
      });
    return current;
  },
  /** Recovers the frozen pending command after restart; recorded inputs and actor remain unchanged. */
  recover: async function (request) {
    let { asset } = await this.context(request, "waste.review.queue.read");
    const pending = asset.metadata?.pendingImpactCommand;
    if (!pending) return this.historyForAsset({ ...request, query: {} }, asset);
    const permission =
      pending.schema === "wasteImpactSelection"
        ? "waste.review.approve"
        : "waste.verification.record";
    await SERVICE.DefaultWasteOperationalAccessService.authorize(
      request,
      permission,
    );
    const submission = await this.store().one(
      "wasteSubmission",
      request,
      asset.sourceSubmissionCode,
    );
    await SERVICE.DefaultWasteOperationalAccessService.assertRecord(
      request,
      permission,
      submission,
    );
    if (request.confirmed !== true)
      this.store().fail(
        "ERR_WASTE_IMPACT_COMMAND_INVALID",
        "Confirm recovery of the saved assessment command",
      );
    this.store().revision(asset, request.expectedRevision);
    asset = await this.finish(request, asset, {
      code: pending.record.code,
      fingerprint: pending.record.metadata.commandFingerprint,
    });
    return this.historyForAsset({ ...request, query: {} }, asset);
  },
  /** Reassesses existing reviewed facts with the current configured provider; accepted results and original reward evidence remain unchanged. */
  reassess: async function (request) {
    let { asset } = await this.context(request, "waste.verification.record");
    const command = this.command(request, asset, "ASSESS"),
      store = this.store();
    if (asset.metadata?.pendingImpactCommand?.record.code === command.code) {
      asset = await this.finish(request, asset, command);
      return this.historyForAsset({ ...request, query: {} }, asset);
    }
    const existing = await store.one(
      "wasteImpactResult",
      request,
      command.code,
    );
    if (existing) {
      this.assertCommand(existing, command);
      return this.historyForAsset({ ...request, query: {} }, asset);
    }
    if (asset.metadata?.pendingImpactCommand)
      store.fail(
        "ERR_WASTE_IMPACT_CONFLICT",
        "Finish the pending assessment command first",
      );
    store.revision(asset, request.expectedRevision);
    const facts = this.copy(asset.metadata?.facts || {}),
      item = await store.one("wasteItemType", request, facts.itemTypeCode);
    const profile =
      item &&
      (await store.one("wasteImpactProfile", request, item.impactProfileCode));
    if (!profile || profile.status !== "ACTIVE")
      store.fail(
        "ERR_WASTE_IMPACT_PROFILE_INVALID",
        "An active assessment profile is required",
      );
    const calculated =
      await SERVICE.DefaultWasteImpactCalculationService.calculate(
        {
          resultCode: command.code,
          sourceRef: {
            module: "wasteCore",
            schema: "wasteAsset",
            code: asset.code,
          },
          profile,
          facts,
          evidenceRefs: asset.evidenceRefs || [],
          idempotencyKey: command.idempotencyKey,
        },
        request,
      );
    const record = {
      ...calculated,
      code: command.code,
      metadata: {
        ...calculated.metadata,
        assetRef: {
          module: "wasteCore",
          schema: "wasteAsset",
          code: asset.code,
        },
        previousAssessmentRef: asset.impactRef || null,
        inputFacts: facts,
        sourceAssetRevision: asset.revision,
        assessmentReason: command.reason,
        assessedBy: command.actor,
        commandFingerprint: command.fingerprint,
      },
    };
    asset = await store.update("wasteAsset", request, asset, {
      metadata: {
        ...asset.metadata,
        pendingImpactCommand: {
          schema: "wasteImpactResult",
          record: this.copy(record),
        },
      },
    });
    asset = await this.finish(request, asset, command);
    return this.historyForAsset({ ...request, query: {} }, asset);
  },
  /** Accepts an explicitly reviewed saved assessment using compare-and-set; no recalculation, payment or reward mutations occur. */
  select: async function (request) {
    let { asset } = await this.context(request, "waste.review.approve");
    const command = this.command(request, asset, "SELECT"),
      store = this.store();
    if (asset.metadata?.pendingImpactCommand?.record.code === command.code) {
      asset = await this.finish(request, asset, command);
      return this.historyForAsset({ ...request, query: {} }, asset);
    }
    const existing = await store.one(
      "wasteImpactSelection",
      request,
      command.code,
    );
    if (existing) {
      this.assertCommand(existing, command);
      return this.historyForAsset({ ...request, query: {} }, asset);
    }
    if (asset.metadata?.pendingImpactCommand)
      store.fail(
        "ERR_WASTE_IMPACT_CONFLICT",
        "Finish the pending assessment command first",
      );
    store.revision(asset, request.expectedRevision);
    if (asset.metadata?.settlementStatus !== "COMPLETED")
      store.fail(
        "ERR_WASTE_IMPACT_CONFLICT",
        "Complete the original approval settlement before selecting another assessment",
      );
    const result = await store.one(
      "wasteImpactResult",
      request,
      request.payload.assessmentCode,
    );
    const legacy = asset.metadata?.approvedEstimate?.code;
    if (
      !result ||
      (result.metadata?.assetRef?.code !== asset.code &&
        result.code !== legacy) ||
      !["ESTIMATED", "CONFIRMED", "RECALCULATED"].includes(
        result.calculationStatus,
      ) ||
      !result.metrics?.length
    )
      store.fail(
        "ERR_WASTE_IMPACT_COMMAND_INVALID",
        "Choose a successful assessment belonging to this asset",
      );
    if (
      result.metadata?.inputFacts &&
      this.digest(result.metadata.inputFacts) !==
        this.digest(asset.metadata?.facts || {})
    )
      store.fail(
        "ERR_WASTE_IMPACT_CONFLICT",
        "Item facts have changed since this assessment was calculated",
      );
    const ref = {
      module: "wasteImpact",
      schema: "wasteImpactResult",
      code: result.code,
    };
    const selection = {
      code: command.code,
      assetCode: asset.code,
      assessmentRef: ref,
      previousAssessmentRef: asset.impactRef || null,
      selectedAt: new Date().toISOString(),
      selectedBy: command.actor,
      reason: command.reason,
      sourceAssetRevision: asset.revision,
      idempotencyKey: command.idempotencyKey,
      metadata: { commandFingerprint: command.fingerprint },
      revision: 0,
    };
    asset = await store.update("wasteAsset", request, asset, {
      impactRef: ref,
      metadata: {
        ...asset.metadata,
        acceptedEstimate: this.copy(result),
        pendingImpactCommand: {
          schema: "wasteImpactSelection",
          record: selection,
        },
      },
    });
    asset = await this.finish(request, asset, command);
    return this.historyForAsset({ ...request, query: {} }, asset);
  },
};
