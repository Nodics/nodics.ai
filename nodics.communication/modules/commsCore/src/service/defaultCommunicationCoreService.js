/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
const crypto = require("crypto");
/** @module commsCore/src/service/defaultCommunicationCoreService @description Validates and renders declared templates, creates idempotent communication intents, applies suppression, and records immutable provider-neutral outcomes. @layer service @owner commsCore @override Projects may replace repositories and transports while preserving policy and evidence. */
module.exports = {
  /**
   * Produces a stable content hash without storing variables in events.
   * @param {*} value JSON-serializable input.
   * @returns {string} SHA-256 digest.
   */
  hash: function (value) {
    return crypto
      .createHash("sha256")
      .update(JSON.stringify(value))
      .digest("hex");
  },
  /**
   * Delegates legacy text rendering to the canonical customizable template service.
   * @param {object} template Existing text contract.
   * @param {object} variables Declared scalar values.
   * @param {object} policy Effective rendering bounds.
   * @returns {object} Rendered plain subject/body; invalid input fails before persistence.
   * @override Runtime calls use SERVICE; the local fallback supports standalone pure consumers.
   */
  render: function (template, variables, policy) {
    const renderer =
      (typeof SERVICE !== "undefined" &&
        SERVICE.DefaultCommunicationTemplateService) ||
      require("./defaultCommunicationTemplateService");
    return renderer.renderLegacy(template, variables, policy);
  },
  /**
   * Creates one provider-neutral intent and returns existing evidence for replay.
   * @param {object} command Validated domain request.
   * @param {object} template Selected version metadata.
   * @param {object[]} suppressions Current suppression records.
   * @param {object} existing Previously persisted intent, if any.
   * @param {object} policy Allowed channels and intent policy.
   * @returns {object} Intent and duplicate/suppression disposition.
   */
  intent: function (command, template, suppressions, existing, policy) {
    if (existing) return { duplicate: true, intent: existing };
    if (!(policy.allowedChannels || []).includes(command.channel))
      throw new Error("communication channel is not allowed");
    let suppressed = (suppressions || []).some(
      (item) =>
        item.recipientId === command.recipientId &&
        item.purpose === command.purpose &&
        item.channel === command.channel &&
        (!item.activeFrom ||
          new Date(item.activeFrom) <= (command.now || new Date())) &&
        (!item.activeUntil ||
          new Date(item.activeUntil) > (command.now || new Date())),
    );
    return {
      duplicate: false,
      intent: {
        tenant: command.tenant,
        sourceModule: command.sourceModule,
        sourceType: command.sourceType,
        sourceCode: command.sourceCode,
        templateCode: template.templateCode || template.code,
        templateVersion: template.version,
        recipientId: command.recipientId,
        recipientAddressReference: command.recipientAddressReference,
        purpose: command.purpose,
        channel: command.channel,
        locale: command.locale,
        variablesHash: this.hash(command.variables || {}),
        idempotencyKey: command.idempotencyKey,
        status: suppressed ? "SUPPRESSED" : "ACCEPTED",
        createdAt: command.now || new Date(),
        expiresAt: command.expiresAt,
        correlationId: command.correlationId,
      },
      suppressed: suppressed,
    };
  },
  /**
   * Converts transport response into content-free immutable evidence.
   * @param {string} intentCode Intent identity.
   * @param {string} providerCode Selected provider identity.
   * @param {string} channel Delivery channel.
   * @param {number} attempt Managed attempt number.
   * @param {object} response Redacted provider result.
   * @param {object} context Trusted tenant, clock and correlation.
   * @returns {object} Outcome record without message content.
   */
  outcome: function (
    intentCode,
    providerCode,
    channel,
    attempt,
    response,
    context,
  ) {
    return {
      tenant: context.tenant,
      intentCode: intentCode,
      providerCode: providerCode,
      channel: channel,
      attempt: attempt,
      status: response.status,
      providerReference: response.providerReference,
      responseCode: response.responseCode,
      attemptedAt: context.now || new Date(),
      deliveredAt:
        response.status === "DELIVERED" ? context.now || new Date() : undefined,
      correlationId: context.correlationId,
    };
  },
  /**
   * Schedules bounded retry or dead letter.
   * @param {number} attempt Previous attempt count.
   * @param {number} now Current epoch milliseconds.
   * @param {object} policy Retry bounds.
   * @returns {object} Next attempt state and optional earliest time.
   */
  retry: function (attempt, now, policy) {
    let next = Number(attempt || 0) + 1;
    if (next >= Number(policy.maximumAttempts || 5))
      return { attempt: next, status: "DEAD_LETTER" };
    let delay = Math.min(
      Number(policy.maximumRetryMilliseconds || 300000),
      Number(policy.baseRetryMilliseconds || 1000) * Math.pow(2, next - 1),
    );
    return {
      attempt: next,
      status: "RETRY_PENDING",
      nextAttemptAt: new Date(Number(now || Date.now()) + delay),
    };
  },
  /**
   * Produces content-free event data.
   * @param {object} intent Canonical intent.
   * @param {object} outcome Redacted outcome.
   * @returns {object} Safe event metadata.
   */
  event: function (intent, outcome) {
    return {
      tenant: intent.tenant,
      intentCode: intent.code,
      sourceModule: intent.sourceModule,
      sourceType: intent.sourceType,
      sourceCode: intent.sourceCode,
      purpose: intent.purpose,
      channel: intent.channel,
      status: outcome.status,
      attempt: outcome.attempt,
      correlationId: intent.correlationId,
    };
  },
};
