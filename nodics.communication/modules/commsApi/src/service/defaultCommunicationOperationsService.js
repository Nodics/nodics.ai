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
