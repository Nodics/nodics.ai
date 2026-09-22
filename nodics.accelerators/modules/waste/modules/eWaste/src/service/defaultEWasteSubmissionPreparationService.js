/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
const crypto = require("node:crypto");

/** @module eWaste/service/defaultEWasteSubmissionPreparationService @description Analyzes transient image bytes before invoking Media and Waste persistence. @owner eWaste @layer service @override Projects supply trusted arrival/centre context and retain owner, content, cancellation and idempotency checks. */
module.exports = {
  /** Validates bounded temporary image input without accepting paths, media owners or analysis from the caller. */
  photo: function (request) {
    const photo = request.payload?.photo || {};
    const maximum = (CONFIG.get("eWaste") || {}).preparation.maximumPhotoBytes;
    if (!Number.isSafeInteger(maximum) || maximum <= 0 || typeof photo.contentBase64 !== "string" ||
      photo.contentBase64.length > Math.ceil(maximum / 3) * 4 || photo.contentBase64.length % 4 ||
      !/^[A-Za-z0-9+/]+={0,2}$/.test(photo.contentBase64) || !/^image\/(jpeg|png|webp)$/.test(photo.mimeType || ""))
      SERVICE.DefaultWastePersistenceService.fail("ERR_WASTE_EVIDENCE_INVALID", "Choose a supported photo within the upload limit");
    const buffer = Buffer.from(photo.contentBase64, "base64");
    if (!buffer.length || buffer.length > maximum || buffer.toString("base64") !== photo.contentBase64)
      SERVICE.DefaultWastePersistenceService.fail("ERR_WASTE_EVIDENCE_INVALID", "Photo content is invalid or too large");
    const originalFileName = typeof photo.originalFileName === "string" && photo.originalFileName.length <= 255 ? photo.originalFileName.split(/[\\/]/).pop() : undefined;
    return { mimeType: photo.mimeType, contentBase64: photo.contentBase64, originalFileName,
      checksum: crypto.createHash("sha256").update(buffer).digest("hex") };
  },
  /** Stops disconnected preparation requests before any durable records are created. */
  assertActive: function (request) {
    if (request.isCancelled?.()) SERVICE.DefaultWastePersistenceService.fail("ERR_WASTE_INPUT_INVALID", "Preparation was cancelled");
  },
  /** Reuses a successful preparation, or analyzes before writing Media/evidence/submission records. */
  prepare: async function (request) {
    const store = SERVICE.DefaultWastePersistenceService, operations = SERVICE.DefaultWasteSubmissionOperationService;
    const owner = store.customer(request), photo = this.photo(request);
    const commandCode = operations.commandCode(owner, request.idempotencyKey);
    const code = request.code || commandCode;
    const existing = await store.one("wasteSubmission", request, code);
    if (existing) {
      store.owned(existing, owner);
      if (existing.metadata?.preparationChecksum === photo.checksum && existing.metadata?.preparationKey === request.idempotencyKey) return existing;
      if (!request.code && existing.metadata?.preparationChecksum !== photo.checksum)
        store.fail("ERR_WASTE_INPUT_INVALID", "This preparation reference belongs to a different photo");
      if (!request.code) return existing;
      store.revision(existing, request.expectedRevision);
      if (!operations.editable(existing)) store.fail("ERR_WASTE_SUBMISSION_IMMUTABLE", "Submitted evidence cannot be replaced");
    }
    if (request.code && !existing) store.fail("ERR_WASTE_RECORD_NOT_FOUND", "The requested record was not found");
    this.assertActive(request);
    let analysis;
    try {
      analysis = await SERVICE.DefaultWasteMetadataAnalysisService.inspect({ ...request, photo }, existing);
    } catch (error) {
      if (!SERVICE.DefaultWasteMetadataAnalysisService.isRecognitionUnavailable?.(error)) throw error;
      analysis = await SERVICE.DefaultWasteMetadataAnalysisService.manualReviewAnalysis({ ...request, photo }, existing);
    }
    this.assertActive(request);
    const centreCode = request.preparationCentreCode || request.payload.collectionPointCode;
    await operations.validateFacts(request, { submittedFacts: { ...analysis.proposal, preferredCollectionPointCode: centreCode } });
    this.assertActive(request);
    // Customer credentials are forwarded only to the owning Media capability.
    const response = await SERVICE.DefaultModuleService.invokeModule({
      local: false, moduleName: "media", connectionName: "wcms", apiName: "/internal/customer/photos/encoded", methodName: "POST",
      tenant: request.tenant, request: { tenant: request.tenant }, timeoutMs: 30000, maxAttempts: 1,
      requestBody: { mimeType: photo.mimeType, contentBase64: photo.contentBase64, originalFileName: photo.originalFileName, idempotencyKey: commandCode + ":" + photo.checksum,
        owner: { tenant: request.tenant, code: owner.code, loginId: request.authData.loginId, principalType: "customer" } },
    });
    const media = SERVICE.DefaultEWasteExperienceService.unwrap(response);
    return operations.createPrepared({ ...request, applicationCode: (CONFIG.get("eWaste") || {}).applicationCode,
      mediaDescriptor: media, preparedAnalysis: analysis, preparationChecksum: photo.checksum, preparationCentreCode: centreCode });
  },
};
