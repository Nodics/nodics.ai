/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module commsApi/src/facade/defaultCommunicationApiFacade @description Applies owner, tenant, and DTO projection boundaries to Communication API operations. @layer facade @owner commsApi @override Later facades may enrich safe DTOs without bypassing policy. */
module.exports = {
  /** Requires admitted exact-object capture protection; caller flags never establish private entry. @param {Object} request Verified route/owner entry. @param {string} code Fixed safe refusal. @returns {void} */
  requirePrivateEntry: function (
    request,
    code = "ERR_COMMS_INTEGRATION_CONTEXT",
  ) {
    if (
      SERVICE.DefaultLoggerService?.hasPrivateCaptureProtection?.(request) !==
      true
    )
      throw new CLASSES.NodicsError(code);
  },
  /**
   * Inspects one source-authorized persisted intent without retry or delivery effects.
   * @param {Object} request Signed service context, exact intent code and empty body.
   * @returns {Promise<Object>} Only intentCode, persisted status and managed revision.
   * @override Narrow source admission; never widen the three-field private DTO.
   */
  inspectDelivery: async function (request) {
    this.requirePrivateEntry(request);
    const payload = request.payload;
    if (
      !payload ||
      typeof payload !== "object" ||
      Array.isArray(payload) ||
      ![Object.prototype, null].includes(Object.getPrototypeOf(payload)) ||
      Reflect.ownKeys(payload).length !== 0
    )
      throw new CLASSES.NodicsError("ERR_COMMS_INTEGRATION_INPUT");
    this.authorizeSource(request);
    let intent;
    try {
      intent = await this.authorizeIntent(request);
    } catch (error) {
      if (error?.code === "ERR_COMMS_INTEGRATION_CONTEXT") throw error;
      throw new CLASSES.NodicsError("ERR_COMMS_INTEGRATION_STORAGE");
    }
    const result = await SERVICE.DefaultCommunicationOperationsService.inspect(
      request,
      intent,
    );
    return {
      intentCode: result.intentCode,
      status: result.status,
      revision: result.revision,
    };
  },
  /** Delegates sensitive service verification commands to the existing Communication owner boundary. */
  executeVerification: function (request) {
    this.requirePrivateEntry(request, "ERR_COMMS_VERIFY_CONTEXT");
    return SERVICE.DefaultCommunicationVerificationApiService.execute(request);
  },
  /** Resolves only an explicitly confirmed recorded uncertainty. */ resolveDelivery:
    async function (request) {
      this.requirePrivateEntry(request);
      await this.authorizeIntent(request);
      return SERVICE.DefaultCommunicationRuntimeService.resolveUncertain(
        request,
        request.intentCode,
        request.payload || {},
      );
    },
  /** Requests a private durable intent for a trusted integration. */ requestCommunication:
    function (request) {
      this.requirePrivateEntry(request);
      if (typeof request.payload?.sourceModule !== "string")
        throw new CLASSES.NodicsError("ERR_COMMS_INTEGRATION_CONTEXT");
      this.authorizeSource(request, request.payload?.sourceModule);
      return SERVICE.DefaultCommunicationRuntimeService.request(
        request,
        request.payload || {},
      );
    },
  /**
   * Requires signed runtime delegation for Communication and the selected domain.
   * Payload names and ordinary service groups never supply source authority.
   * @param {Object} request Router-validated service context.
   * @param {string} [sourceModule] Domain owner from the command or stored intent.
   * @returns {void} Exact tenant, permission and module-scoped authority.
   * @override Later layers may narrow admission, never infer it from caller data.
   */
  authorizeSource: function (request, sourceModule) {
    this.requirePrivateEntry(request);
    const auth = request.authData;
    if (
      !auth ||
      auth.tokenType !== "service" ||
      auth.principalType !== "service" ||
      !(auth.principalId || auth.serviceId || auth.loginId) ||
      typeof auth.tenant !== "string" ||
      !auth.tenant ||
      request.tenant !== auth.tenant ||
      !Array.isArray(auth.permissions) ||
      !auth.permissions.includes("communication.request") ||
      !Array.isArray(auth.modules) ||
      auth.modules.length > 512 ||
      auth.modules.some((value) => typeof value !== "string") ||
      !auth.modules.includes("commsApi") ||
      (sourceModule !== undefined &&
        (typeof sourceModule !== "string" ||
          !/^[A-Za-z][A-Za-z0-9_.-]{0,127}$/.test(sourceModule) ||
          !auth.modules.includes(sourceModule) ||
          !(CONFIG.get("communication")?.trustedSourceModules || []).includes(
            sourceModule,
          )))
    )
      throw new CLASSES.NodicsError("ERR_COMMS_INTEGRATION_CONTEXT");
    if (
      sourceModule === undefined &&
      request.payload?.sourceModule !== undefined
    )
      throw new CLASSES.NodicsError("ERR_COMMS_INTEGRATION_CONTEXT");
  },
  /**
   * Admits one stored intent's source without exposing its recipient or content.
   * The signed tenant/permission check runs before any owner read.
   * @param {Object} request Exact intent code and fresh service context.
   * @returns {Promise<Object>} Private owner record for exactly one source-authorized stored intent.
   */
  authorizeIntent: async function (request) {
    this.authorizeSource(request);
    if (!/^COMM_[a-f0-9]{64}$/.test(request.intentCode || ""))
      throw new CLASSES.NodicsError("ERR_COMMS_INTEGRATION_CONTEXT");
    const rows = await SERVICE.DefaultCommunicationRuntimeService.list(
      "CommsIntent",
      request,
      { code: request.intentCode },
      2,
    );
    if (rows.length !== 1 || rows[0].code !== request.intentCode)
      throw new CLASSES.NodicsError("ERR_COMMS_INTEGRATION_CONTEXT");
    this.authorizeSource(request, rows[0].sourceModule);
    if (typeof rows[0].sourceModule !== "string")
      throw new CLASSES.NodicsError("ERR_COMMS_INTEGRATION_CONTEXT");
    return rows[0];
  },
  /** Projects allow-listed fields. */ project: function (value, name) {
    let fields = (CONFIG.get("communicationApi") || {}).projections[name] || [];
    let one = (item) =>
      Object.fromEntries(
        fields
          .filter((field) => item && item[field] !== undefined)
          .map((field) => [field, item[field]]),
      );
    return Array.isArray(value) ? value.map(one) : one(value);
  },
  /** Lists only messages owned by the authenticated customer. */ listInbox:
    async function (request) {
      if (
        request.authData?.principalType !== "customer" ||
        !request.authData.loginId
      )
        throw new Error("Customer context required");
      const profileResponse = await SERVICE.DefaultModuleService.invokeModule({
        local: false,
        moduleName: "profile",
        connectionName: "profile",
        apiName: "/customer",
        methodName: "POST",
        tenant: request.tenant,
        request: { tenant: request.tenant },
        requestBody: {
          query: { loginId: request.authData.loginId },
          options: { recursive: false },
          searchOptions: { pageSize: 1 },
        },
        header: {
          "X-Enterprise-Code": request.authData.entCode || request.tenant,
        },
        maxAttempts: 1,
        timeoutMs: 10000,
      });
      let profile = profileResponse;
      for (let i = 0; i < 5 && profile && !Array.isArray(profile); i++)
        profile = profile.result || profile.data || profile;
      const customer = Array.isArray(profile) ? profile[0] : profile;
      if (!customer?.code || customer.loginId !== request.authData.loginId)
        throw new Error("Customer identity unavailable");
      const result = await SERVICE.DefaultCommunicationRuntimeService.list(
        "CommsInboxMessage",
        request,
        { recipientId: customer.code },
        Math.min(
          Math.max(Number((request.query && request.query.limit) || 25), 1),
          100,
        ),
      );
      // Resolve source selectors only from intents belonging to this same recipient.
      // The domain endpoint must independently authorize any linked record.
      const codes = [
        ...new Set(result.map((message) => message.intentCode).filter(Boolean)),
      ];
      const intents = codes.length
        ? await SERVICE.DefaultCommunicationRuntimeService.list(
            "CommsIntent",
            request,
            {
              code: { $in: codes },
              recipientId: customer.code,
              channel: "IN_APP",
            },
            codes.length,
          )
        : [];
      const sources = new Map(
        intents.map((intent) => [
          intent.code,
          {
            module: intent.sourceModule,
            type: intent.sourceType,
            code: intent.sourceCode,
          },
        ]),
      );
      return this.project(
        result.map((message) => ({
          ...message,
          source: sources.get(message.intentCode),
        })),
        "inbox",
      );
    },
  /** Delegates retry to the governed API service. */ retryDelivery:
    async function (request) {
      await this.authorizeIntent(request);
      return this.project(
        await SERVICE.DefaultCommunicationOperationsService.retry(request),
        "operation",
      );
    },
  /** Delegates callback verification and reconciliation. */ receiveCallback:
    async function (request) {
      return this.project(
        await SERVICE.DefaultCommunicationOperationsService.callback(request),
        "callback",
      );
    },
};
