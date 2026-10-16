/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const reviewDiagnostics = require("../utils/reviewDiagnostics");
/**
 * @module eWaste/service/defaultEWasteOutcomeCommunicationService
 * @description Composes persisted Waste decisions with Communication-owned delivery; source metadata stores references and a safe status projection, never a second delivery ledger.
 * @owner eWaste @layer service
 * @override Configure templates and owning endpoint. Recipient and comment always come from authorized immutable source records.
 */
module.exports = {
  /** Composes a human-scoped read with an exact persisted source/intent diagnostic; never retries or updates delivery. */
  inspectDiagnostic: async function (request, detail) {
    if (!detail || !["APPROVED", "REJECTED"].includes(detail.submissionStatus) ||
      detail.metadata?.outcomeDelivery?.status !== "UNCERTAIN") return detail;
    const unavailable = { classification: "DIAGNOSTIC_UNAVAILABLE", message: "The recorded notification diagnostic could not be qualified. Delivery remains unconfirmed." };
    const access = SERVICE.DefaultWasteOperationalAccessService;
    const experience = SERVICE.DefaultEWasteExperienceService;
    try {
      await access.authorize(request, "waste.review.queue.read");
      const record = await experience.store().one("wasteSubmission", request, request.code);
      if (!record || record.code !== detail.code || record.code !== request.code || record.revision !== detail.revision)
        throw Error("Current submission required");
      await access.assertRecord(request, "waste.review.queue.read", record);
      const pointer = record.metadata?.outcomeDelivery;
      if (pointer?.status !== "UNCERTAIN" || !/^COMM_[a-f0-9]{64}$/.test(pointer.intentCode || "") ||
        !Number.isSafeInteger(pointer.revision) || pointer.revision < 0)
        throw Error("Recorded intent required");
      const result = await experience.remote(request, "commsApi", experience.settings().outcomeCommunication?.connectionName,
        "/internal/communications/" + encodeURIComponent(pointer.intentCode) + "/diagnostic", "POST",
        { sourceModule: "eWaste", sourceType: "wasteSubmission", sourceCode: record.code });
      const diagnostic = result?.diagnostic;
      const classes = ["ATTEMPT_NOT_RECORDED", "TRANSPORT_ACK_UNCONFIRMED", "DELIVERY_INTERRUPTED", "INVALID_PROVIDER_OUTCOME",
        "PROVIDER_ACCEPTED", "PROVIDER_CONFIGURATION_REQUIRED", "DESTINATION_UNAVAILABLE", "PROVIDER_UNAVAILABLE",
        "PROVIDER_THROTTLED", "PROVIDER_REJECTED", "ATTEMPT_UNCLASSIFIED", "ATTEMPT_STATUS_DIFFERS"];
      if (result?.intentCode !== pointer.intentCode || !Number.isSafeInteger(result.revision) || result.revision < pointer.revision ||
        !["ACCEPTED", "SUPPRESSED", "QUEUED", "DELIVERING", "DELIVERED", "FAILED", "CANCELLED", "RETRY_PENDING", "UNCERTAIN", "DEAD_LETTER", "UNCONFIGURED"].includes(result.status) ||
        !classes.includes(diagnostic?.classification) || !Number.isSafeInteger(diagnostic?.attempt) || diagnostic.attempt < 0 ||
        typeof diagnostic.message !== "string" || !diagnostic.message.trim() || diagnostic.message.length > 400 || /[\x00-\x1f\x7f]/.test(diagnostic.message))
        throw Error("Diagnostic acknowledgement required");
      const current = await experience.store().one("wasteSubmission", request, record.code);
      await access.assertRecord(request, "waste.review.queue.read", current);
      if (!current || current.code !== record.code || current.revision !== record.revision ||
        current.metadata?.outcomeDelivery?.intentCode !== pointer.intentCode || current.metadata?.outcomeDelivery?.status !== "UNCERTAIN")
        throw Error("Submission changed");
      return { ...detail, notificationDiagnostic: { classification: diagnostic.classification, attempt: diagnostic.attempt,
        message: diagnostic.message, intentStatus: result.status } };
    } catch (_) {
      return { ...detail, notificationDiagnostic: unavailable };
    }
  },
  /** Builds a record-specific link from trusted deployment configuration; the target still requires owner authentication. */
  detailLink: function (config, channel, code) {
    const link = config.detailLinks && config.detailLinks[channel];
    if (!link) return null;
    if (typeof code !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9_-]{0,179}$/.test(code) || typeof link.parameter !== 'string' || !/^[A-Za-z][A-Za-z0-9_]{0,63}$/.test(link.parameter)) throw new Error('Outcome detail link configuration is invalid');
    const url = new URL(link.url);
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.hash) throw new Error('Outcome detail link configuration is invalid');
    url.searchParams.set(link.parameter, code);
    return url.href;
  },
  /** Accepts only a bounded owner acknowledgement for the original intent, without regressing its revision. */
  assertDelivery: function (delivery, existing) {
    if (!delivery || typeof delivery.intentCode !== 'string' ||
      !/^[A-Za-z0-9][A-Za-z0-9._-]{0,179}$/.test(delivery.intentCode) ||
      typeof delivery.status !== 'string' || !/^[A-Z][A-Z_]{0,63}$/.test(delivery.status) ||
      !Number.isSafeInteger(delivery.revision) || delivery.revision < 0 ||
      (existing?.intentCode && delivery.intentCode !== existing.intentCode) ||
      (Number.isSafeInteger(existing?.revision) && delivery.revision < existing.revision))
      throw new Error('Outcome notification acknowledgement is invalid');
    return delivery;
  },
  /** Sends the recorded outcome, isolating optional delivery failure from review and settlement. */
  notify: async function (request, submission) {
    const experience = SERVICE.DefaultEWasteExperienceService,
      config = experience.settings().outcomeCommunication;
    if (
      !config?.enabled ||
      !["APPROVED", "REJECTED"].includes(submission.submissionStatus)
    )
      return submission;
    const origin = submission.metadata?.origin || {},
      comment = submission.metadata?.publicReason || "";
    const sourceKey = submission.metadata.reviewKey;
    if (!sourceKey)
      throw new Error("Recorded decision is required for outcome delivery");
    const channel = origin.channel === "TELEGRAM" ? "TELEGRAM" : "IN_APP";
    const existing = submission.metadata?.outcomeDelivery;
    if (existing?.intentCode && request.retryDelivery !== true) return submission;
    let delivery, acknowledged, diagnostic;
    let stage = "LINK_CONFIGURATION";
    try {
      const detailUrl = existing?.intentCode ? null : this.detailLink(config, channel, submission.code);
      stage = "DISPATCH";
      if (existing?.intentCode) {
        delivery = await experience.remote(request, 'commsApi', config.connectionName, '/internal/communications/' + encodeURIComponent(existing.intentCode) + '/retry', 'POST', {});
      } else delivery = await experience.remote(
        request,
        "commsApi",
        config.connectionName,
        "/internal/communications",
        "POST",
        {
          sourceModule: "eWaste",
          sourceType: "wasteSubmission",
          sourceCode: submission.code,
          templateCode: config.templateCode,
          recipientId: submission.submitterRef.code,
          recipientAddressReference:
            channel === "TELEGRAM"
              ? origin.identityLinkCode
              : submission.submitterRef.code,
          purpose: "WASTE_REVIEW_OUTCOME",
          channel,
          locale: "en",
          idempotencyKey: "waste-outcome:" + submission.code + ":" + sourceKey,
          variables: {
            submissionCode: submission.code,
            status: submission.submissionStatus,
            comment,
            ...(detailUrl ? { detailUrl } : {}),
          },
          correlationId: request.correlationId || sourceKey,
        },
      );
      stage = "ACKNOWLEDGEMENT";
      acknowledged = this.assertDelivery(delivery, existing);
      if (
        !existing?.intentCode && request.retryDelivery === true &&
        ["RETRY_PENDING", "ACCEPTED", "DELIVERING"].includes(delivery.status)
      ) {
        stage = "DISPATCH";
        const retried = await experience.remote(
          request,
          "commsApi",
          config.connectionName,
          "/internal/communications/" +
            encodeURIComponent(delivery.intentCode) +
            "/retry",
          "POST",
          {},
        );
        stage = "ACKNOWLEDGEMENT";
        delivery = this.assertDelivery(retried, delivery);
      }
    } catch (error) {
      diagnostic = reviewDiagnostics.outcome(stage, error);
      delivery = acknowledged || null;
    }
    const current = await experience
      .store()
      .one("wasteSubmission", request, submission.code);
    // A failed retry is not evidence that the durable intent or its status changed.
    const currentDelivery = current.metadata.outcomeDelivery;
    if (currentDelivery?.intentCode && (!delivery ||
      currentDelivery.intentCode !== delivery.intentCode ||
      (Number.isSafeInteger(currentDelivery.revision) && currentDelivery.revision >= delivery.revision)))
      return current;
    if (!delivery) delivery = {
      status: "PENDING",
      message: diagnostic.message,
      diagnostic,
    };
    if (
      JSON.stringify(current.metadata.outcomeDelivery) ===
      JSON.stringify(delivery)
    )
      return current;
    return experience
      .store()
      .update("wasteSubmission", request, current, {
        metadata: { ...current.metadata, outcomeDelivery: delivery },
      });
  },
  /** Reconciles a recorded uncertain message after scope-specific approver confirmation. */
  resolve: async function (request) {
    const access = SERVICE.DefaultWasteOperationalAccessService,
      experience = SERVICE.DefaultEWasteExperienceService;
    await access.authorize(request, "waste.review.approve");
    const submission = await experience
      .store()
      .one("wasteSubmission", request, request.code);
    await access.assertRecord(request, "waste.review.approve", submission);
    const pointer = submission.metadata?.outcomeDelivery,
      payload = request.payload || {};
    if (!pointer?.intentCode || pointer.status !== "UNCERTAIN")
      throw new Error("No uncertain notification is available");
    if (!Number.isSafeInteger(pointer.revision) || payload.expectedDeliveryRevision !== pointer.revision)
      throw new Error("Notification evidence changed; reload before reconciliation");
    const config = experience.settings().outcomeCommunication;
    const delivery = this.assertDelivery(await experience.remote(
      request,
      "commsApi",
      config.connectionName,
      "/internal/communications/" +
        encodeURIComponent(pointer.intentCode) +
        "/resolution",
      "POST",
      {
        action: payload.action,
        confirmed: payload.confirmed === true,
        expectedRevision: payload.expectedDeliveryRevision,
        reason: payload.reason,
        sourceCode: submission.code,
        sourceModule: "eWaste",
        operatorRef: {
          module: "profile",
          schema: "employee",
          code: request.authData.loginId,
        },
      },
    ), pointer);
    const current = await experience
      .store()
      .one("wasteSubmission", request, submission.code);
    await access.assertRecord(request, "waste.review.approve", current);
    const latest = current.metadata?.outcomeDelivery;
    if (latest?.intentCode !== pointer.intentCode)
      throw new Error("Notification reference changed; reload before reconciliation");
    if (Number.isSafeInteger(latest.revision) && latest.revision >= delivery.revision) {
      if (latest.revision === delivery.revision && latest.status !== delivery.status)
        throw new Error("Notification evidence conflicts with its owner");
      return current;
    }
    if (current.revision !== submission.revision || latest.revision !== pointer.revision || latest.status !== pointer.status)
      throw new Error("Notification reference changed; reload before reconciliation");
    return experience
      .store()
      .update("wasteSubmission", request, current, {
        metadata: { ...current.metadata, outcomeDelivery: delivery },
      });
  },
  /** Checks current review scope before recovering notification only. */
  retry: async function (request) {
    const access = SERVICE.DefaultWasteOperationalAccessService;
    await access.authorize(request, "waste.review.queue.read");
    const submission = await SERVICE.DefaultWastePersistenceService.one(
      "wasteSubmission",
      request,
      request.code,
    );
    await access.assertRecord(request, "waste.review.queue.read", submission);
    return this.notify({ ...request, retryDelivery: true }, submission);
  },
};
