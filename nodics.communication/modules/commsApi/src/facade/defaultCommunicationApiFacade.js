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
  /** Resolves only an explicitly confirmed recorded uncertainty. */ resolveDelivery:
    function (request) {
      return SERVICE.DefaultCommunicationRuntimeService.resolveUncertain(
        request,
        request.intentCode,
        request.payload || {},
      );
    },
  /** Requests a private durable intent for a trusted integration. */ requestCommunication:
    function (request) {
      return SERVICE.DefaultCommunicationRuntimeService.request(
        request,
        request.payload || {},
      );
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
      const codes = [...new Set(result.map(message => message.intentCode).filter(Boolean))];
      const intents = codes.length ? await SERVICE.DefaultCommunicationRuntimeService.list(
        "CommsIntent", request,
        { code: { $in: codes }, recipientId: customer.code, channel: "IN_APP" },
        codes.length,
      ) : [];
      const sources = new Map(intents.map(intent => [intent.code, {
        module: intent.sourceModule, type: intent.sourceType, code: intent.sourceCode,
      }]));
      return this.project(result.map(message => ({ ...message, source: sources.get(message.intentCode) })), "inbox");
    },
  /** Delegates retry to the governed API service. */ retryDelivery:
    async function (request) {
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
