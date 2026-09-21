/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
function valueFromStore(store, reference) {
  const entry = store && reference ? store[reference] : undefined;
  if (typeof entry === "string") return entry;
  if (entry && typeof entry.value === "string") return entry.value;
  if (entry && typeof entry.token === "string") return entry.token;
  return undefined;
}

function configuredCredential(reference, policy) {
  const config =
      typeof CONFIG !== "undefined" && typeof CONFIG.get === "function"
        ? CONFIG
        : undefined,
    runtime = config ? config.get("runtimeConfiguration") : undefined,
    secure = config ? config.get("secureConfiguration") : undefined,
    generic = config ? config.get("credentials") : undefined;
  return (
    valueFromStore((policy || {}).credentials, reference) ||
    valueFromStore(runtime?.credentials, reference) ||
    valueFromStore(secure?.credentials, reference) ||
    valueFromStore(generic, reference)
  );
}
/**
 * @module commsCore/service/defaultTelegramCommunicationProviderService
 * @description Sends plain Telegram messages only to Profile-resolved active links. Never logs credentials, proof, recipient or response content.
 * @owner commsCore @layer service
 * @override Certified transports may replace delivery while preserving uncertain-send outcomes and trusted destination resolution.
 */
module.exports = {
  /** Resolves the linked recipient before sending; any network ambiguity is recorded for operator review. */
  deliver: async function ({ request, intent, policy }, transport = fetch) {
    const response = await SERVICE.DefaultModuleService.invokeModule({
      local: false,
      moduleName: "profile",
      connectionName: "profile",
      apiName: "/internal/external-identity/destination",
      methodName: "POST",
      requestBody: {
        linkCode: intent.recipientAddressReference,
        recipientId: intent.recipientId,
      },
      tenant: request.tenant,
      request: { tenant: request.tenant },
      header: {
        "X-Enterprise-Code":
          request.authData?.entCode || request.entCode || request.tenant,
      },
      timeoutMs: 10000,
      maxAttempts: 1,
    });
    let target = response;
    for (let i = 0; i < 5 && target; i++) {
      if (target.result !== undefined) target = target.result;
      else if (target.data !== undefined) target = target.data;
      else break;
    }
    if (!target || target.provider !== "TELEGRAM" || target.allowed !== true)
      return { status: "SUPPRESSED", responseCode: "DESTINATION_UNAVAILABLE" };
    if (
      !(policy.credentialReferences || []).includes(target.credentialReference)
    )
      return { status: "UNCONFIGURED", responseCode: "TELEGRAM_CONFIGURATION_REQUIRED" };
    const token = configuredCredential(target.credentialReference, policy);
    if (!token || token.split(":")[0] !== target.applicationSubject)
      return { status: "UNCONFIGURED", responseCode: "TELEGRAM_CONFIGURATION_REQUIRED" };
    let result;
    try {
      const raw = await transport(
        "https://api.telegram.org/bot" + token + "/sendMessage",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: target.subject,
            text: intent.renderedContent.body,
          }),
          signal: AbortSignal.timeout(policy.timeoutMilliseconds || 10000),
        },
      );
      result = await raw.json();
    } catch (error) {
      return { status: "UNCERTAIN", responseCode: "TELEGRAM_UNCERTAIN" };
    }
    if (result.ok === true && result.result?.message_id)
      return {
        status: "DELIVERED",
        providerReference: String(result.result.message_id),
        responseCode: "TELEGRAM_ACCEPTED",
      };
    if (result.ok === false && Number.isInteger(result.error_code))
      return {
        status:
          result.error_code === 429 || result.error_code >= 500
            ? "RETRY_PENDING"
            : "FAILED",
        responseCode: "TELEGRAM_" + result.error_code,
      };
    return { status: "UNCERTAIN", responseCode: "TELEGRAM_UNCERTAIN" };
  },
};
