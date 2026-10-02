/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";

/**
 * @module smsCommsProvider/service/defaultSmsCommunicationProviderService
 * @description Adapts frozen Communication text to an injected sandbox transport.
 * No network client or live SMS enablement is supplied. Exceptions and results are
 * content-free; a transport exception is uncertain, never an automatic retry.
 * @owner smsCommsProvider @layer service
 * @override Replace exported ports/policy methods through normal service merging;
 * preserve tenant, lease, expiry, text bounds and no-live-send restrictions.
 */
module.exports = {
  code: "sms-sandbox",

  /**
   * Resolves trusted deployment policy, not caller-supplied message fields.
   * @param {object} selected Dispatcher-selected provider configuration.
   * @returns {object} Detached effective SMS settings.
   */
  runtimePolicy: function (selected) {
    return {
      ...require("../../config/properties").smsCommsProvider,
      ...(typeof CONFIG !== "undefined"
        ? CONFIG.get("smsCommsProvider") || {}
        : {}),
      ...(selected || {}),
    };
  },

  /**
   * Validates a claimed immutable message before credentials or transport access.
   * @param {object} value Durable request/intent envelope.
   * @returns {string|undefined} Suppression status for expiry; throws for invalid scope/lease.
   */
  validateEnvelope: function (value) {
    const { request, intent } = value || {};
    const tenant = request?.authData?.tenant || request?.tenant;
    if (
      !tenant ||
      !intent ||
      tenant !== intent.tenant ||
      (request.tenant && request.tenant !== tenant) ||
      intent.channel !== "SMS" ||
      intent.status !== "DELIVERING" ||
      [
        intent.code,
        intent.idempotencyKey,
        intent.recipientAddressReference,
      ].some(
        (value) =>
          typeof value !== "string" || !value.trim() || value.length > 512,
      ) ||
      !Number.isFinite(new Date(intent.leaseExpiresAt).getTime()) ||
      new Date(intent.leaseExpiresAt).getTime() <= Date.now()
    )
      throw new Error("Invalid SMS delivery context");
    if (
      intent.expiresAt &&
      (!Number.isFinite(new Date(intent.expiresAt).getTime()) ||
        new Date(intent.expiresAt).getTime() <= Date.now())
    )
      return "SUPPRESSED";
  },

  /**
   * Projects only bounded literal text to the transport; private resource identity stays local.
   * @param {object} rendered Frozen message representations.
   * @param {object} policy Effective provider bounds.
   * @returns {object} Plain body only; throws for HTML, paths, binary or oversized content.
   */
  content: function (rendered, policy) {
    const limit = policy.maximumContentBytes;
    if (
      !rendered ||
      typeof rendered.body !== "string" ||
      !rendered.body.trim() ||
      rendered.html !== undefined ||
      !Number.isSafeInteger(limit) ||
      limit < 1 ||
      limit > 65536 ||
      Buffer.byteLength(rendered.body, "utf8") > limit
    )
      throw Object.assign(new Error("Invalid SMS content"), {
        code: "COMMS_PROVIDER_REQUEST",
      });
    return { body: rendered.body };
  },

  /**
   * Supports durable dispatch and the existing trusted injected sandbox interface.
   * @param {object} value Durable envelope or legacy sandbox request.
   * @param {object} ports Optional injected credential/send ports for legacy tests.
   * @param {object} configuration Legacy trusted sandbox settings.
   * @returns {Promise<object>} Redacted delivery evidence; never asserts handset receipt.
   */
  deliver: async function (value, ports, configuration) {
    if (!value || !Object.hasOwn(value, "intent"))
      return this.deliverSandbox(value, ports, configuration);
    const policy = this.runtimePolicy(value.policy);
    if (policy.enabled !== true)
      return {
        status: "UNCONFIGURED",
        responseCode: "COMMS_PROVIDER_DISABLED",
      };
    try {
      const suppressed = this.validateEnvelope(value);
      if (suppressed) return { status: suppressed };
      this.content(value.intent.renderedContent, policy);
    } catch (_) {
      return { status: "FAILED", responseCode: "COMMS_PROVIDER_REQUEST" };
    }
    const transport =
      typeof SERVICE !== "undefined" &&
      typeof policy.sandboxTransportService === "string" &&
      SERVICE[policy.sandboxTransportService];
    if (!transport?.resolveCredential || !transport?.send)
      return {
        status: "UNCONFIGURED",
        responseCode: "COMMS_PROVIDER_UNAVAILABLE",
      };
    const intent = value.intent;
    try {
      return await this.deliverSandbox(
        {
          channel: intent.channel,
          intentCode: intent.code,
          idempotencyKey: intent.idempotencyKey,
          recipientAddressReference: intent.recipientAddressReference,
          rendered: intent.renderedContent,
        },
        {
          resolveCredential: transport.resolveCredential.bind(transport),
          send: transport.send.bind(transport),
        },
        policy,
      );
    } catch (error) {
      return {
        status: [
          "COMMS_PROVIDER_CONFIGURATION",
          "COMMS_PROVIDER_CREDENTIAL",
          "COMMS_PROVIDER_POLICY",
        ].includes(error.code)
          ? "UNCONFIGURED"
          : "UNCERTAIN",
        responseCode: "COMMS_PROVIDER_UNAVAILABLE",
      };
    }
  },

  /**
   * Invokes a trusted sandbox port once; validates before any external side effect.
   * @param {object} request Channel, identity, destination reference and rendered text.
   * @param {object} ports Injected resolveCredential/send functions.
   * @param {object} configuration Trusted sandbox selection.
   * @returns {Promise<object>} Content-free result; throws on invalid configuration or unknown outcome.
   */
  deliverSandbox: async function (request, ports, configuration) {
    const policy = this.runtimePolicy(configuration);
    ports = ports || {};
    if (policy.enabled !== true)
      throw Object.assign(new Error("SMS provider is disabled"), {
        code: "COMMS_PROVIDER_DISABLED",
      });
    if (policy.sandboxOnly !== true || policy.liveQualified === true)
      throw Object.assign(new Error("SMS sandbox policy is invalid"), {
        code: "COMMS_PROVIDER_POLICY",
      });
    if (
      !policy.endpoint ||
      !policy.credentialReference ||
      !policy.senderReference
    )
      throw Object.assign(new Error("SMS references are incomplete"), {
        code: "COMMS_PROVIDER_CONFIGURATION",
      });
    if (
      !request ||
      request.channel !== "SMS" ||
      !request.intentCode ||
      !request.idempotencyKey ||
      !request.recipientAddressReference
    )
      throw Object.assign(new Error("Invalid SMS delivery request"), {
        code: "COMMS_PROVIDER_REQUEST",
      });
    if (
      typeof ports.resolveCredential !== "function" ||
      typeof ports.send !== "function"
    )
      throw Object.assign(new Error("SMS ports unavailable"), {
        code: "COMMS_PROVIDER_UNAVAILABLE",
      });
    const rendered = this.content(request.rendered, policy);
    const credential = await ports.resolveCredential(
      policy.credentialReference,
    );
    if (!credential)
      throw Object.assign(new Error("SMS credential unavailable"), {
        code: "COMMS_PROVIDER_CREDENTIAL",
      });
    const response = await ports.send({
      endpoint: policy.endpoint,
      credential,
      senderReference: policy.senderReference,
      recipientAddressReference: request.recipientAddressReference,
      rendered,
      idempotencyKey: request.idempotencyKey,
      timeoutMilliseconds: policy.timeoutMilliseconds,
    });
    if (
      !response ||
      typeof response.reference !== "string" ||
      !response.reference ||
      response.reference.length > 256 ||
      (response.code !== undefined &&
        (typeof response.code !== "string" || response.code.length > 128))
    )
      throw Object.assign(new Error("SMS response unconfirmed"), {
        code: "COMMS_PROVIDER_RESPONSE",
      });
    return {
      status: response.accepted === false ? "FAILED" : "DELIVERED",
      providerReference: response.reference,
      responseCode: response.code || "SANDBOX_ACCEPTED",
      sandbox: true,
    };
  },

  /**
   * Reports sandbox port availability, never real handset delivery.
   * @param {object} ports Injected optional health function.
   * @param {object} configuration Trusted sandbox settings.
   * @returns {Promise<object>} Content-free, non-live-qualified health.
   */
  health: async function (ports, configuration) {
    const policy = this.runtimePolicy(configuration);
    if (policy.enabled !== true)
      return { code: this.code, status: "DISABLED", liveQualified: false };
    if (!ports || typeof ports.health !== "function")
      return { code: this.code, status: "UNAVAILABLE", liveQualified: false };
    return {
      code: this.code,
      status: (await ports.health(policy.endpoint))
        ? "AVAILABLE"
        : "UNAVAILABLE",
      liveQualified: false,
    };
  },
};
