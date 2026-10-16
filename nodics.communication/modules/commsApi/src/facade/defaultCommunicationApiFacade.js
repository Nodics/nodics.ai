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
  /** Separately admits bounded attempt diagnostics without widening the frozen status-inspection DTO. */
  diagnoseDelivery: async function (request) {
    this.requirePrivateEntry(request);
    const payload = request.payload;
    const fields = ["sourceModule", "sourceType", "sourceCode"];
    if (!payload || typeof payload !== "object" || Array.isArray(payload) ||
      ![Object.prototype, null].includes(Object.getPrototypeOf(payload)) ||
      Reflect.ownKeys(payload).length !== fields.length ||
      fields.some(field => !Object.hasOwn(payload, field) || typeof payload[field] !== "string" ||
        !/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,179}$/.test(payload[field])) ||
      Reflect.ownKeys(request.query || {}).length)
      throw new CLASSES.NodicsError("ERR_COMMS_INTEGRATION_INPUT");
    const source = Object.fromEntries(fields.map(field => [field, payload[field]]));
    this.authorizeSource(request, source.sourceModule);
    const tenant = request.tenant;
    let intent;
    try {
      intent = await this.authorizeIntent(request, source.sourceModule);
    } catch (error) {
      if (error?.code === "ERR_COMMS_INTEGRATION_CONTEXT") throw error;
      throw new CLASSES.NodicsError("ERR_COMMS_INTEGRATION_STORAGE");
    }
    if (fields.some(field => intent[field] !== source[field]))
      throw new CLASSES.NodicsError("ERR_COMMS_INTEGRATION_CONTEXT");
    const operations = SERVICE.DefaultCommunicationOperationsService;
    const inspected = operations.inspect(request, intent);
    const snapshot = { intentCode: inspected.intentCode, status: inspected.status, revision: inspected.revision };
    const result = await operations.diagnose(request, intent);
    let current;
    try { current = await this.authorizeIntent(request, source.sourceModule); }
    catch (error) {
      if (error?.code === "ERR_COMMS_INTEGRATION_CONTEXT") throw error;
      throw new CLASSES.NodicsError("ERR_COMMS_INTEGRATION_STORAGE");
    }
    if (request.tenant !== tenant || current.tenant !== tenant || current.revision !== intent.revision ||
      current.status !== intent.status || current.attempt !== intent.attempt || current.sourceModule !== intent.sourceModule ||
      fields.some(field => current[field] !== source[field] || request.payload[field] !== source[field]) ||
      result?.diagnostic?.attempt !== (intent.attempt ?? 0))
      throw new CLASSES.NodicsError("ERR_COMMS_INTEGRATION_STORAGE");
    return { ...snapshot, diagnostic: require("../service/defaultCommunicationOperationsService").diagnostic(
      result?.diagnostic?.classification, result?.diagnostic?.attempt) };
  },
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
      const payload = request.payload || {};
      const bound = payload.sourceModule !== undefined || payload.sourceCode !== undefined;
      if (bound && (typeof payload.sourceModule !== "string" ||
        !/^[A-Za-z][A-Za-z0-9_.-]{0,127}$/.test(payload.sourceModule) ||
        typeof payload.sourceCode !== "string" ||
        !/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,179}$/.test(payload.sourceCode)))
        throw new CLASSES.NodicsError("ERR_COMMS_INTEGRATION_INPUT");
      const intent = await this.authorizeIntent(request, bound ? payload.sourceModule : undefined);
      if (bound && (intent.sourceModule !== payload.sourceModule || intent.sourceCode !== payload.sourceCode))
        throw new CLASSES.NodicsError("ERR_COMMS_INTEGRATION_CONTEXT");
      return SERVICE.DefaultCommunicationRuntimeService.resolveUncertain(
        request,
        request.intentCode,
        payload,
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
  authorizeIntent: async function (request, expectedSourceModule) {
    this.authorizeSource(request, expectedSourceModule);
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
  /**
   * Lists the canonical customer's messages after a strict Profile owner read.
   * @param {Object} request Router-admitted customer access identity and exact HTTP bearer.
   * @returns {Promise<Array>} Allowlisted inbox DTOs with recipient-matched source selectors.
   * @override Later layers may enrich projections, never replace bearer admission or recipient isolation.
   */ listInbox:
    async function (request) {
      const auth = request.authData;
      const authorization = request.authorization;
      const bearer =
        typeof authorization === "string"
          ? authorization.match(/^Bearer[ \t]+([A-Za-z0-9._~+/-]+=*)$/i)
          : null;
      if (
        auth?.principalType !== "customer" ||
        auth.tokenType !== "access" ||
        typeof auth.loginId !== "string" ||
        !auth.loginId.trim() ||
        typeof request.tenant !== "string" ||
        !request.tenant ||
        auth.tenant !== request.tenant ||
        !bearer ||
        bearer[0] !== authorization ||
        request.auth?.type !== "bearer" ||
        request.auth.credential !== bearer[1]
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
          query: { loginId: auth.loginId },
          options: { recursive: false },
          searchOptions: { pageSize: 2, pageNumber: 1 },
        },
        header: {
          Authorization: authorization,
          "X-Enterprise-Code": auth.entCode || request.tenant,
        },
        maxAttempts: 1,
        timeoutMs: 10000,
      });
      const profile =
        SERVICE.DefaultCommunicationRuntimeService.rows(profileResponse);
      const customer = profile[0];
      if (
        profileResponse.count !== 1 ||
        profile.length !== 1 ||
        typeof customer?.code !== "string" ||
        !customer.code.trim() ||
        customer.loginId !== auth.loginId ||
        (customer.tenant !== undefined && customer.tenant !== request.tenant) ||
        (profileResponse.responseCode !== undefined &&
          (!Number.isInteger(Number(profileResponse.responseCode)) ||
            Number(profileResponse.responseCode) < 200 ||
            Number(profileResponse.responseCode) >= 300))
      )
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
