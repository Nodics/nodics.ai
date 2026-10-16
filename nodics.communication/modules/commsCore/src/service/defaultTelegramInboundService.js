/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
const crypto = require("node:crypto");
/**
 * @module commsCore/service/defaultTelegramInboundService
 * @description Authenticates native Telegram JSON updates before body access and reserves
 * one private /start launch reply through the generated durable receipt repository.
 * @owner commsCore @layer service
 * @override Later members may narrow policy or change launch presentation while preserving
 * private admission, trusted receiver isolation, payload binding and insert-only claims.
 * No network, identity, domain command, delivery intent or session is created.
 */
module.exports = {
  /** Creates a fixed refusal without attaching private errors. @param {string} suffix Owner status suffix. @returns {Error} Safe error. */
  failure: function (suffix) {
    return new CLASSES.NodicsError("ERR_COMMS_TELEGRAM_" + suffix);
  },

  /** Validates positive native identifiers without numeric coercion. @param {*} value Native id. @returns {boolean} Valid bounded integer. */
  isIdentity: function (value) {
    return Number.isSafeInteger(value) && value > 0 && value < 2 ** 52;
  },

  /**
   * Authenticates only the exact private HTTP request; never reads its body.
   * @param {Object} http Native HTTP request with trusted route params.
   * @returns {Object} Detached deployment-authored tenant/bot/URL policy and bounds.
   * @throws {Error} Fixed context refusal for absent/disabled/malformed policy or credential.
   */
  authenticate: function (http) {
    if (SERVICE.DefaultLoggerService?.hasPrivateCaptureProtection?.(http) !== true)
      throw this.failure("CONTEXT");
    const policy = CONFIG.get("communication")?.telegramInbound;
    const exposure = CONFIG.get("apiExposure")?.categories?.communicationTelegramInbound;
    const receiverCode = http.params?.receiverCode;
    const headers = http.headers || {};
    if (policy?.enabled !== true || exposure?.enabled !== true ||
        http.method !== "POST" || typeof receiverCode !== "string" ||
        !/^[A-Za-z][A-Za-z0-9_.-]{0,127}$/.test(receiverCode) ||
        !Object.hasOwn(policy.receivers || {}, receiverCode) ||
        (http.originalUrl || "").includes("?") ||
        Object.keys(headers).some((key) => ["authorization", "authtoken", "apikey", "x-api-key", "entcode", "x-enterprise-code", "tenant", "x-tenant-code", "x-nodics-tenant"].includes(key.toLowerCase())) ||
        typeof headers["content-type"] !== "string" ||
        !/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(headers["content-type"]))
      throw this.failure("CONTEXT");
    const receiver = policy.receivers[receiverCode];
    if (!receiver || receiver.enabled !== true ||
        typeof receiver.tenant !== "string" || !/^[A-Za-z0-9][A-Za-z0-9_.-]{0,127}$/.test(receiver.tenant) ||
        !NODICS.getActiveTenants().includes(receiver.tenant) ||
        typeof receiver.applicationSubject !== "string" || !/^[1-9][0-9]{0,15}$/.test(receiver.applicationSubject) ||
        !this.isIdentity(Number(receiver.applicationSubject)) ||
        typeof receiver.botUsername !== "string" || !/^[A-Za-z][A-Za-z0-9_]{4,31}$/.test(receiver.botUsername) ||
        !Array.isArray(receiver.webhookSecretReferences) ||
        receiver.webhookSecretReferences.length < 1 || receiver.webhookSecretReferences.length > 2 ||
        new Set(receiver.webhookSecretReferences).size !== receiver.webhookSecretReferences.length ||
        receiver.webhookSecretReferences.some((ref) => typeof ref !== "string" || !/^[A-Za-z][A-Za-z0-9_.-]{0,127}$/.test(ref)))
      throw this.failure("CONTEXT");
    const supplied = headers["x-telegram-bot-api-secret-token"];
    if (typeof supplied !== "string" || !/^[A-Za-z0-9_-]{1,256}$/.test(supplied))
      throw this.failure("CONTEXT");
    if (Array.isArray(http.rawHeaders) && http.rawHeaders.filter((value, index) =>
      index % 2 === 0 && String(value).toLowerCase() === "x-telegram-bot-api-secret-token").length !== 1)
      throw this.failure("CONTEXT");
    // Fixed-length digests avoid both unequal-buffer exceptions and early rotation-slot exits.
    const suppliedHash = crypto.createHash("sha256").update(supplied).digest();
    let matches = 0;
    for (const reference of receiver.webhookSecretReferences) {
      const secret = SERVICE.DefaultTelegramCommunicationProviderService.configuredCredential(reference, {});
      if (typeof secret !== "string" || !/^[A-Za-z0-9_-]{1,256}$/.test(secret))
        throw this.failure("CONTEXT");
      matches |= Number(crypto.timingSafeEqual(suppliedHash, crypto.createHash("sha256").update(secret).digest()));
    }
    if (!matches) throw this.failure("CONTEXT");
    let url;
    try {
      if (typeof receiver.miniAppUrl !== "string" || receiver.miniAppUrl.length > 2048) throw 0;
      url = new URL(receiver.miniAppUrl);
      if (url.protocol !== "https:" || !url.hostname || url.username || url.password || url.hash) throw 0;
    } catch (_) { throw this.failure("CONTEXT"); }
    for (const [key, maximum] of [["maximumPayloadBytes", 1048576], ["maximumPayloadDepth", 32], ["maximumPayloadNodes", 16384]]) {
      if (!Number.isSafeInteger(policy[key]) || policy[key] < 1 || policy[key] > maximum)
        throw this.failure("CONTEXT");
    }
    return {
      tenant: receiver.tenant, applicationSubject: receiver.applicationSubject,
      botUsername: receiver.botUsername, miniAppUrl: url.href,
      maximumPayloadBytes: policy.maximumPayloadBytes,
      maximumPayloadDepth: policy.maximumPayloadDepth,
      maximumPayloadNodes: policy.maximumPayloadNodes,
    };
  },

  /**
   * Canonicalizes a bounded JSON tree; key order does not change replay identity.
   * @param {*} value Parsed JSON update. @param {Object} policy Authenticated bounds.
   * @param {Object} [budget] Traversal counter. @param {number} [depth] Current depth.
   * @returns {string} Stable JSON representation. @throws {Error} Invalid tree or bound.
   */
  canonicalPayload: function (value, policy, budget = { nodes: 0 }, depth = 0) {
    if (++budget.nodes > policy.maximumPayloadNodes || depth > policy.maximumPayloadDepth)
      throw this.failure("INPUT");
    if (value === null || typeof value === "string" || typeof value === "boolean") return JSON.stringify(value);
    if (typeof value === "number" && Number.isFinite(value)) return JSON.stringify(value);
    if (Array.isArray(value)) return "[" + value.map((item) => this.canonicalPayload(item, policy, budget, depth + 1)).join(",") + "]";
    if (!value || typeof value !== "object" || ![Object.prototype, null].includes(Object.getPrototypeOf(value)))
      throw this.failure("INPUT");
    return "{" + Object.keys(value).sort().map((key) => {
      if (["__proto__", "prototype", "constructor"].includes(key)) throw this.failure("INPUT");
      return JSON.stringify(key) + ":" + this.canonicalPayload(value[key], policy, budget, depth + 1);
    }).join(",") + "}";
  },

  /**
   * Selects only native private user-to-chat /start commands; all other updates are ignored.
   * @param {Object} update Bounded Telegram update. @param {Object} policy Trusted bot policy.
   * @returns {Object|null} Raw webhook method; no outbound call is made.
   * @override Change presentation only; keep exact command, private identity and trusted URL checks.
   */
  launchReply: function (update, policy) {
    if (Object.keys(update).length !== 2 || !Object.hasOwn(update, "message")) return null;
    const message = update.message;
    if (!message || message.chat?.type !== "private" ||
        !this.isIdentity(message.chat.id) || !this.isIdentity(message.from?.id) ||
        message.chat.id !== message.from.id || message.from.is_bot !== false ||
        !this.isIdentity(message.message_id) || !Number.isSafeInteger(message.date) || message.date < 0 ||
        message.business_connection_id !== undefined || message.sender_chat !== undefined ||
        message.forward_origin !== undefined || message.via_bot !== undefined ||
        message.guest_query_id !== undefined || message.is_automatic_forward === true ||
        typeof message.text !== "string" || message.text.length > 128)
      return null;
    const match = /^\/start(?:@([A-Za-z][A-Za-z0-9_]{4,31}))?(?: ([A-Za-z0-9_-]{1,64}))?$/.exec(message.text);
    if (!match || (match[1] && match[1].toLowerCase() !== policy.botUsername.toLowerCase())) return null;
    const commandLength = "/start".length + (match[1] ? match[1].length + 1 : 0);
    if (!Array.isArray(message.entities) || message.entities.length !== 1 ||
        message.entities[0]?.type !== "bot_command" || message.entities[0].offset !== 0 ||
        message.entities[0].length !== commandLength) return null;
    return {
      method: "sendMessage", chat_id: message.chat.id, text: "Open Mini App",
      reply_markup: { inline_keyboard: [[{ text: "Open Mini App", web_app: { url: policy.miniAppUrl } }]] },
    };
  },

  /** Builds private owner storage authority from the authenticated deployment tenant. @param {Object} http Original private request. @param {Object} policy Authenticated policy. @returns {Object} Inherited generated-service context. */
  storageContext: function (http, policy) {
    const context = SERVICE.DefaultCommunicationRuntimeService.context({ tenant: policy.tenant });
    if (context.tenant !== policy.tenant || context.authData?.tenant !== policy.tenant)
      throw this.failure("CONTEXT");
    SERVICE.DefaultLoggerService.inheritRequestPrivacy(context, http);
    SERVICE.DefaultLoggerService.assertSensitiveRequest(context);
    return context;
  },

  /** Reads one exact majority-confirmed private receipt without cache. @param {Object} context Owner storage context. @param {string} code Stable receipt key. @returns {Promise<Object|null>} Validated row or absence. */
  readReceipt: async function (context, code) {
    const response = await SERVICE.DefaultCommsTelegramUpdateService.get(this.repositoryRequest(context, {
      query: { tenant: context.tenant, code },
      internalPersistence: "DURABLE_JOURNAL",
      options: { recursive: false, skipItemCache: true },
      searchOptions: { pageSize: 2, pageNumber: 1 },
    }));
    const rows = SERVICE.DefaultCommunicationRuntimeService.rows(response);
    if (rows.length > 1 || (rows.length && (rows[0].tenant !== context.tenant || rows[0].code !== code)))
      throw this.failure("STORAGE");
    return rows[0] || null;
  },

  /** Inherits exact capture protection into each generated-service request. @param {Object} context Admitted owner context. @param {Object} values Repository command. @returns {Object} Private derived command. */
  repositoryRequest: function (context, values) {
    const request = { ...context, ...values };
    SERVICE.DefaultLoggerService.inheritRequestPrivacy(request, context);
    SERVICE.DefaultLoggerService.assertSensitiveRequest(request);
    return request;
  },

  /** Requires exact immutable binding before acknowledging a replay. @param {Object} row Stored receipt. @param {Object} model Expected binding. @returns {void} @throws {Error} Conflict or unqualified receipt. */
  assertReceipt: function (row, model) {
    if (!row || !/^[a-f0-9]{64}$/.test(row.claimId || "") ||
        !["IGNORED", "LAUNCH_REPLY_RESERVED"].includes(row.disposition)) throw this.failure("STORAGE");
    for (const key of ["tenant", "code", "applicationSubject", "updateId", "payloadHash"]) {
      if (row[key] !== model[key]) throw this.failure("CONFLICT");
    }
  },

  /**
   * Reauthenticates before body access, then reserves at most one launch response.
   * @param {Object} http Exact privately admitted parsed native request.
   * @returns {Promise<Object>} Raw launch method for the acknowledged writer, otherwise {}.
   * @throws {Error} Fixed errors for invalid binding, failed persistence or ambiguous readback.
   */
  receive: async function (http) {
    const policy = this.authenticate(http);
    const update = http.body;
    const canonical = this.canonicalPayload(update, policy);
    if (Buffer.byteLength(canonical) > policy.maximumPayloadBytes || !update || Array.isArray(update) ||
        !Number.isSafeInteger(update.update_id) || update.update_id < 0 || update.update_id > 2147483647)
      throw this.failure("INPUT");
    const reply = this.launchReply(update, policy);
    const model = {
      tenant: policy.tenant, applicationSubject: policy.applicationSubject, updateId: update.update_id,
      code: "TGUP_" + SERVICE.DefaultCommunicationCoreService.hash([policy.tenant, policy.applicationSubject, update.update_id]),
      payloadHash: crypto.createHash("sha256").update(canonical).digest("hex"),
      claimId: crypto.randomBytes(32).toString("hex"),
      disposition: reply ? "LAUNCH_REPLY_RESERVED" : "IGNORED", receivedAt: new Date(),
    };
    const context = this.storageContext(http, policy);
    try {
      const existing = await this.readReceipt(context, model.code);
      if (existing) { this.assertReceipt(existing, model); return {}; }
      let acknowledged = false;
      try {
        const result = await SERVICE.DefaultCommsTelegramUpdateService.save(this.repositoryRequest(context, {
          model, internalPersistence: "DURABLE_JOURNAL",
          options: { recursive: false, insertOnly: true },
        }));
        SERVICE.DefaultCommunicationRuntimeService.assertWrite(result);
        acknowledged = true;
      } catch (_) { /* A duplicate or lost acknowledgment requires a bounded owner read. */ }
      const stored = await this.readReceipt(context, model.code);
      this.assertReceipt(stored, model);
      if (stored.claimId !== model.claimId) return {};
      if (!acknowledged || stored.disposition !== model.disposition) throw this.failure("STORAGE");
      return reply || {};
    } catch (error) {
      if (error?.code === "ERR_COMMS_TELEGRAM_CONFLICT") throw this.failure("CONFLICT");
      throw this.failure("STORAGE");
    }
  },
};
