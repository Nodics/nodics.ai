/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module eWaste/service/defaultEWasteOutcomeCommunicationService
 * @description Composes persisted Waste decisions with Communication-owned delivery; source metadata stores references and a safe status projection, never a second delivery ledger.
 * @owner eWaste @layer service
 * @override Configure templates and owning endpoint. Recipient and comment always come from authorized immutable source records.
 */
module.exports = {
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
    let delivery;
    try {
      const detailUrl = existing?.intentCode ? null : this.detailLink(config, channel, submission.code);
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
      if (
        !existing?.intentCode && request.retryDelivery === true &&
        ["RETRY_PENDING", "ACCEPTED", "DELIVERING"].includes(delivery.status)
      )
        delivery = await experience.remote(
          request,
          "commsApi",
          config.connectionName,
          "/internal/communications/" +
            encodeURIComponent(delivery.intentCode) +
            "/retry",
          "POST",
          {},
        );
    } catch (error) {
      delivery = {
        status: "PENDING",
        message: "Decision saved. Outcome notification needs retry.",
      };
    }
    const current = await experience
      .store()
      .one("wasteSubmission", request, submission.code);
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
    const config = experience.settings().outcomeCommunication;
    const delivery = await experience.remote(
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
    );
    const current = await experience
      .store()
      .one("wasteSubmission", request, submission.code);
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
