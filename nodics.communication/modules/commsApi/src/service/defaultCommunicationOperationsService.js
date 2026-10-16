/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module commsApi/src/service/defaultCommunicationOperationsService @description Applies bounded retry and idempotent callback reconciliation over Communication-owned evidence. @layer service @owner commsApi @override Provider adapters may enrich mapping while preserving authentication and replay controls. */
module.exports = {
  /** Reads one exact latest attempt and maps only registered static diagnostics; never polls a provider or retries. */
  diagnose: async function (request, intent) {
    const projection = this.inspect(request, intent);
    const attempt = intent.attempt ?? 0;
    if (!Number.isSafeInteger(attempt) || attempt < 0)
      throw new CLASSES.NodicsError("ERR_COMMS_INTEGRATION_STORAGE");
    let classification = "ATTEMPT_NOT_RECORDED";
    if (attempt > 0) {
      const code = intent.code + "_" + attempt;
      let rows;
      try {
        rows = await SERVICE.DefaultCommunicationRuntimeService.list("CommsDeliveryAttempt", request,
          { code, intentCode: intent.code, attempt }, 2);
      } catch (_) {
        throw new CLASSES.NodicsError("ERR_COMMS_INTEGRATION_STORAGE");
      }
      if (!Array.isArray(rows) || rows.length > 1)
        throw new CLASSES.NodicsError("ERR_COMMS_INTEGRATION_STORAGE");
      if (rows.length) {
        const row = rows[0];
        if (!row || row.code !== code || row.intentCode !== intent.code || row.tenant !== request.tenant ||
          row.attempt !== attempt || row.active === false || row.channel !== intent.channel ||
          !["PENDING", "ACCEPTED", "DELIVERED", "FAILED", "RETRY_PENDING", "DEAD_LETTER", "UNCERTAIN", "SUPPRESSED", "UNCONFIGURED"].includes(row.status))
          throw new CLASSES.NodicsError("ERR_COMMS_INTEGRATION_STORAGE");
        const fixed = {
          TELEGRAM_UNCERTAIN: "TRANSPORT_ACK_UNCONFIRMED",
          DELIVERY_INTERRUPTED: "DELIVERY_INTERRUPTED",
          INVALID_PROVIDER_OUTCOME: "INVALID_PROVIDER_OUTCOME",
          TELEGRAM_ACCEPTED: "PROVIDER_ACCEPTED",
          TELEGRAM_CONFIGURATION_REQUIRED: "PROVIDER_CONFIGURATION_REQUIRED",
          DESTINATION_UNAVAILABLE: "DESTINATION_UNAVAILABLE",
          DESTINATION_RESOLUTION_FAILED: "DESTINATION_UNAVAILABLE",
          PROVIDER_UNAVAILABLE: "PROVIDER_UNAVAILABLE",
          TELEGRAM_429: "PROVIDER_THROTTLED",
        };
        const responseCode = typeof row.responseCode === "string" ? row.responseCode : "";
        classification = Object.hasOwn(fixed, responseCode) ? fixed[responseCode] :
          /^TELEGRAM_5\d{2}$/.test(responseCode) ? "PROVIDER_UNAVAILABLE" :
            /^TELEGRAM_4\d{2}$/.test(responseCode) ? "PROVIDER_REJECTED" : "ATTEMPT_UNCLASSIFIED";
        if (classification === "PROVIDER_ACCEPTED" && row.status !== "DELIVERED") classification = "ATTEMPT_UNCLASSIFIED";
        if (responseCode.startsWith("TELEGRAM_") && intent.channel !== "TELEGRAM") classification = "ATTEMPT_UNCLASSIFIED";
        if (row.status !== intent.status) classification = "ATTEMPT_STATUS_DIFFERS";
      }
    }
    return { ...projection, diagnostic: this.diagnostic(classification, attempt) };
  },
  /** Builds safe fixed copy, not provider-controlled text; facade also applies this projection to effective overrides. */
  diagnostic: function (classification, attempt) {
    const messages = {
      ATTEMPT_NOT_RECORDED: "No completed latest-attempt evidence is recorded. Delivery is not established by this diagnostic.",
      TRANSPORT_ACK_UNCONFIRMED: "The Telegram transport did not produce a recognized acknowledgement. Network failure, response decoding and an unrecognized response cannot be distinguished from retained evidence. Do not resend without reconciliation.",
      DELIVERY_INTERRUPTED: "The delivery adapter or destination lookup was interrupted. Retained evidence does not establish whether a provider send occurred.",
      INVALID_PROVIDER_OUTCOME: "The adapter returned an unsupported outcome; delivery remains unconfirmed.",
      PROVIDER_ACCEPTED: "The provider acknowledged this recorded attempt.",
      PROVIDER_CONFIGURATION_REQUIRED: "The provider credential selection could not be qualified before send.",
      DESTINATION_UNAVAILABLE: "The owner could not qualify an allowed destination before send.",
      PROVIDER_UNAVAILABLE: "The provider was unavailable or returned a server failure.",
      PROVIDER_THROTTLED: "The provider rejected the attempt due to rate limiting.",
      PROVIDER_REJECTED: "The provider explicitly rejected the attempt.",
      ATTEMPT_UNCLASSIFIED: "The retained attempt has no supported static diagnostic classification.",
      ATTEMPT_STATUS_DIFFERS: "The latest attempt and current intent statuses differ. This attempt alone does not establish the current delivery outcome.",
    };
    if (typeof classification !== "string" || !Object.hasOwn(messages, classification) ||
      !Number.isSafeInteger(attempt) || attempt < 0)
      throw new CLASSES.NodicsError("ERR_COMMS_INTEGRATION_STORAGE");
    return { classification, attempt, message: messages[classification] };
  },
  /**
   * Projects the exact stored intent already admitted by the source-scoped facade.
   * Does not read again, infer delivery, poll a provider or mutate owner evidence.
   * @param {Object} request Authenticated tenant and exact intent code.
   * @param {Object} intent Private record from the bounded uncached owner read.
   * @returns {Object} Redacted persisted intentCode, status and revision.
   * @override Preserve real persisted states and fail closed on malformed evidence.
   */
  inspect: function (request, intent) {
    const statuses = [
      "ACCEPTED",
      "SUPPRESSED",
      "QUEUED",
      "DELIVERING",
      "DELIVERED",
      "FAILED",
      "CANCELLED",
      "RETRY_PENDING",
      "UNCERTAIN",
      "DEAD_LETTER",
      "UNCONFIGURED",
    ];
    if (
      !intent ||
      intent.code !== request.intentCode ||
      intent.tenant !== request.tenant ||
      !statuses.includes(intent.status) ||
      !Number.isSafeInteger(intent.revision) ||
      intent.revision < 0
    ) {
      throw new CLASSES.NodicsError("ERR_COMMS_INTEGRATION_STORAGE");
    }
    return {
      intentCode: intent.code,
      status: intent.status,
      revision: intent.revision,
    };
  },
  /** Prepares a retry from the latest tenant-scoped delivery evidence. */ retry:
    async function (request) {
      return SERVICE.DefaultCommunicationRuntimeService.retry(
        request,
        request.intentCode,
      );
    },
  /** Accepts one service-authenticated, provider-referenced callback without trusting domain identifiers from the body. */ callback:
    async function (request) {
      let payload = request.payload || {};
      if (!payload.providerReference || !payload.status || !payload.occurredAt)
        throw new Error("communication callback evidence is incomplete");
      return {
        providerCode: request.providerCode,
        providerReference: payload.providerReference,
        status: payload.status,
        receivedAt: new Date(),
        correlationId: request.correlationId || request.requestId,
      };
    },
};
