/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const _ = require("lodash");
const winston = require("winston");
const wElasticsearch = require("winston-elasticsearch");
var elasticsearch = require("@elastic/elasticsearch");
const splt = require("triple-beam").SPLAT;
const utils = require("../utils/utils");
const logform = require("logform");
const flatted = require("flatted");
const path = require("path");
const { AsyncLocalStorage } = require("node:async_hooks");
const requestPrivacy = new AsyncLocalStorage();
const privateRequests = new WeakMap();
const earlyRequests = new WeakSet();
const protectedEntries = new WeakSet();

/**
 * @module config/service/DefaultLoggerService
 * @description Central logger factory for Nodics runtime entities. It creates and
 * registers Winston loggers using layered configuration and supports console, file,
 * and Elasticsearch transports. Sensitive values are redacted before they are
 * serialized to supported transports.
 * @layer service
 * @owner nConfig
 * @override Project modules may override logger configuration through properties or
 * replace this service to integrate an enterprise observability platform.
 *
 * @property {Object} NODICS Logger registry owner.
 * @property {Object} CONFIG Layered configuration registry for log settings.
 * @property {Object|null} elasticClient Cached Elasticsearch logger client.
 */
module.exports = {
  /**
   * Starts private HTTP context before any application middleware or parser.
   * Unresolved requests suppress diagnostics until trusted route binding.
   * @param {Object} request Incoming HTTP request.
   * @param {Function} next Synchronous middleware continuation.
   * @returns {*} Continuation result, including its inherited async context.
   */
  runRequestPrivacy: function (request, next) {
    const existing = privateRequests.get(request);
    if (existing) return requestPrivacy.run(existing, next);
    const context = { sensitive: true, resolved: false };
    privateRequests.set(request, context);
    earlyRequests.add(request);
    return requestPrivacy.run(context, next);
  },

  /**
   * Resolves sensitivity from owner-validated routing metadata only.
   * Once resolved sensitive, a request cannot be downgraded by route refresh.
   * @param {Object} request Privately bound HTTP request.
   * @param {boolean} sensitive Trusted nRouter decision, never caller fields.
   * @returns {boolean} Whether the early middleware context exists.
   */
  resolveRequestPrivacy: function (request, sensitive) {
    const context = privateRequests.get(request);
    if (!context || typeof sensitive !== "boolean") return false;
    context.sensitive = (context.resolved && context.sensitive) || sensitive;
    context.resolved = true;
    if (context.sensitive) this.inheritRequestPrivacy(request, request);
    return true;
  },

  /**
   * Admits the exact early-bound HTTP object from nRouter's pre-parser middleware.
   * Resolving or tagging a request alone cannot grant protected service entry.
   * @param {Object} request Early-bound HTTP request with trusted resolved policy.
   * @returns {boolean} Whether private admission was granted.
   */
  admitPrivateRoute: function (request) {
    const context = privateRequests.get(request);
    if (
      !earlyRequests.has(request) ||
      !context?.resolved ||
      !context.sensitive ||
      !this.isRequestPrivacyQualified()
    )
      return false;
    protectedEntries.add(request);
    return true;
  },

  /**
   * Carries private sensitivity to derived pipeline requests and known payloads.
   * Does not copy authority from enumerable body/header/router flags.
   * @param {Object} target Derived owner request.
   * @param {Object} [source] Previously bound owner request.
   * @returns {void}
   */
  inheritRequestPrivacy: function (target, source) {
    const context =
      (source && privateRequests.get(source)) || requestPrivacy.getStore();
    if (!context || !context.sensitive || !target || typeof target !== "object")
      return;
    privateRequests.set(target, context);
    if (source && protectedEntries.has(source)) protectedEntries.add(target);
    for (const key of [
      "body",
      "headers",
      "rawHeaders",
      "rawBody",
      "httpRequest",
      "httpResponse",
    ]) {
      const value = Object.getOwnPropertyDescriptor(target, key)?.value;
      if (value && typeof value === "object")
        privateRequests.set(value, context);
    }
  },

  /**
   * Reads private context without trusting browser-controlled request properties.
   * @param {*} [request] Optional previously bound object.
   * @returns {boolean} Whether logs and owner API caching must be suppressed.
   */
  isSensitiveRequest: function (request) {
    const context =
      request && typeof request === "object" && privateRequests.get(request);
    return Boolean(
      (context && context.sensitive) || requestPrivacy.getStore()?.sensitive,
    );
  },

  /**
   * Checks exact-object private admission, not enumerable capture flags.
   * Payload/header tags only suppress logs and never become entry authority.
   * @param {Object} request Exact admitted HTTP or derived owner request.
   * @returns {boolean} Private proof plus current deployment qualification.
   */
  hasPrivateCaptureProtection: function (request) {
    return Boolean(
      request &&
      typeof request === "object" &&
      protectedEntries.has(request) &&
      privateRequests.get(request)?.resolved &&
      privateRequests.get(request)?.sensitive &&
      this.isRequestPrivacyQualified(),
    );
  },

  /**
   * Rejects an unprotected entry without reading or reporting submitted proofs.
   * @param {Object} request Exact owner request, never a detached browser flag.
   * @returns {void}
   * @throws {TypeError} With a fixed credential-free qualification diagnostic.
   */
  assertSensitiveRequest: function (request) {
    if (!this.hasPrivateCaptureProtection(request)) {
      throw new TypeError("Sensitive request capture protection is required");
    }
  },

  /**
   * Grants explicit private entry for trusted non-HTTP owner invocations only.
   * Cannot upgrade an HTTP/body/header object already tagged by middleware.
   * @param {Object} request New detached owner-controlled invocation envelope.
   * @param {Function} callback Trusted operation invoked inside private context.
   * @returns {*} Operation result; async work inherits suppression.
   * @throws {TypeError} For unqualified deployment, reuse or invalid entry.
   */
  runSensitiveOperation: function (request, callback) {
    if (
      !request ||
      typeof request !== "object" ||
      privateRequests.has(request) ||
      typeof callback !== "function" ||
      !this.isRequestPrivacyQualified()
    ) {
      throw new TypeError("Sensitive private entry is unavailable");
    }
    const context = { sensitive: true, resolved: true };
    privateRequests.set(request, context);
    protectedEntries.add(request);
    return requestPrivacy.run(context, () => {
      try {
        this.inheritRequestPrivacy(request, request);
        const result = callback();
        if (result && typeof result.then === "function") {
          return Promise.resolve(result).catch((error) => {
            if (error && typeof error === "object")
              privateRequests.set(error, context);
            throw error;
          });
        }
        return result;
      } catch (error) {
        if (error && typeof error === "object")
          privateRequests.set(error, context);
        throw error;
      }
    });
  },

  /**
   * Requires explicit deployment qualification with upstream capture disabled.
   * This attestation is not automatic verification of external/custom sinks.
   * @returns {boolean} Whether the effective operator-owned gate is open.
   */
  isRequestPrivacyQualified: function () {
    const policy =
      typeof CONFIG !== "undefined" && CONFIG.get("log")?.requestPrivacy;
    return policy?.qualified === true && policy.captureMode === "disabled";
  },

  /**
   * Supplies non-capturing startup options; never starts or reconfigures an agent.
   * Environment/central agent configuration must independently be qualified.
   * @returns {Object} Mandatory sensitive-runtime APM startup constraints.
   */
  getPrivateApmOptions: function () {
    return { active: false, captureBody: "off", captureHeaders: false };
  },

  /**
   * Installs an optional Elastic-compatible pre-send event drop boundary.
   * This is process-wide, excludes metadata and does NOT qualify initial capture.
   * @param {Object} agent Existing deployment-owned APM agent.
   * @returns {void}
   * @throws {TypeError} When the adapter cannot install a synchronous filter.
   */
  installApmPrivacyFilter: function (agent) {
    if (!agent || typeof agent.addFilter !== "function") {
      throw new TypeError("APM privacy filter adapter is unavailable");
    }
    agent.addFilter(() => null);
  },

  /**
   * Replaces private request log records before Winston buffers them.
   * Ordinary records retain existing bounded credential redaction.
   * @param {Object} info Winston record.
   * @returns {Object} Safe record containing no private payload or diagnostic.
   */
  sanitizeRequestLogEntry: function (info) {
    const suppliedLevel =
      info &&
      typeof info === "object" &&
      Object.getOwnPropertyDescriptor(info, "level")?.value;
    const level =
      typeof suppliedLevel === "string" &&
      /^(error|warn|info|http|verbose|debug|silly)$/.test(suppliedLevel)
        ? suppliedLevel
        : "error";
    if (!this.isSensitiveRequest(info)) {
      const redacted = this.redactLogValue(info);
      const record =
        redacted && typeof redacted === "object"
          ? redacted
          : { message: redacted };
      record.level = level;
      record[Symbol.for("level")] = level;
      if (Array.isArray(info?.[splt]))
        record[splt] = this.redactLogValue(info[splt]);
      return record;
    }
    return {
      level,
      message: "[SENSITIVE_REQUEST]",
      [Symbol.for("level")]: level,
    };
  },

  /**
   * Wraps synchronous ingress rather than relying on deferred transport context.
   * @param {Object} logger Winston-compatible logger created by this owner.
   * @returns {Object} Guarded logger; child loggers forward to this write boundary.
   */
  protectLoggerIngress: function (logger) {
    const owner = this;
    const write = logger.write;
    logger.write = function (info, ...args) {
      return write.call(this, owner.sanitizeRequestLogEntry(info), ...args);
    };
    return logger;
  },
  /**
   * Cached Elasticsearch client used by elastic logger transport.
   *
   * @type {Object|null}
   */
  elasticClient: null,

  /**
   * Initializes the logger service.
   *
   * @param {Object} options Startup options.
   * @returns {Promise<boolean>} Resolves when initialization is complete.
   */
  init: function (options) {
    return new Promise((resolve, reject) => {
      resolve(true);
    });
  },

  /**
   * Finalizes the logger service.
   *
   * @param {Object} options Startup options.
   * @returns {Promise<boolean>} Resolves when post-initialization is complete.
   */
  postInit: function (options) {
    return new Promise((resolve, reject) => {
      resolve(true);
    });
  },

  /**
   * Changes the level of a registered logger at runtime.
   *
   * @param {Object} input Log level change request.
   * @param {string} input.entityName Registered logger/entity name.
   * @param {string} input.logLevel New log level.
   * @returns {boolean} True when logger exists and level is changed.
   */
  changeLogLevel: function (input) {
    let logger = NODICS.getLogger(input.entityName);
    if (logger) {
      logger.level = input.logLevel;
      return true;
    }
    return false;
  },

  /**
   * Creates and registers a Winston logger for a Nodics runtime entity.
   *
   * @param {string} entityName Service, facade, controller, module, or framework entity name.
   * @param {Object} [logConfig] Optional log configuration; defaults to `CONFIG.log`.
   * @returns {Object} Winston logger instance.
   * @sideEffects Adds logger to `NODICS` logger registry.
   */
  createLogger: function (entityName, logConfig) {
    logConfig = logConfig || CONFIG.get("log");
    let entityLevel = logConfig["logLevel" + entityName];
    let config = this.getLoggerConfiguration(
      entityName,
      entityLevel,
      logConfig,
    );
    let logger = new winston.createLogger(config);
    this.protectLoggerIngress(logger);
    NODICS.addLogger(entityName, logger);
    return logger;
  },

  /**
   * Builds Winston logger configuration for an entity.
   *
   * @param {string} entityName Entity/logger label.
   * @param {string} level Explicit entity log level.
   * @param {Object} logConfig Layered log configuration.
   * @returns {Object} Winston logger configuration.
   */
  getLoggerConfiguration: function (entityName, level, logConfig) {
    return {
      level: level || logConfig.level || "info",
      format: logform.format.combine(
        logform.format.errors({ stack: true }),
        logform.format.metadata(),
        logform.format.json(),
      ),
      transports: this.createTransports(entityName, logConfig),
    };
  },

  /**
   * Returns configured log format.
   *
   * @param {Object} logConfig Transport log configuration.
   * @returns {Object} Winston format.
   */
  getLogFormat: function (logConfig) {
    if (logConfig.format == "json") {
      return winston.format.json();
    } else {
      return winston.format.simple();
    }
  },

  /**
   * Creates all enabled logger transports from layered configuration.
   *
   * @param {string} labelName Logger label.
   * @param {Object} logConfig Layered log transport configuration.
   * @returns {Object[]} Winston transport instances.
   */
  createTransports: function (labelName, logConfig) {
    let transports = [];
    Object.keys(logConfig.transports).forEach((channel) => {
      let channelConfig = logConfig.transports[channel];
      Object.keys(channelConfig).forEach((transportName) => {
        let transportConfig = channelConfig[transportName];
        if (transportConfig.enabled) {
          let transport = null;
          if (channel === "console") {
            transport = this.createConsoleTransport(labelName, transportConfig);
          } else if (channel === "file") {
            transport = this.createFileTransport(
              labelName,
              transportConfig,
              logConfig,
            );
          } else if (channel === "elastic") {
            transport = this.createElasticTransport(labelName, transportConfig);
          }
          if (transport) {
            transports.push(transport);
          }
        }
      });
    });
    return transports;
  },

  /**
   * Serializes objects safely for log output.
   *
   * @param {*} param Value to format.
   * @returns {*} Serialized object string or original scalar value.
   */
  formatObject: function (param) {
    let redacted = this.redactLogValue(param);
    if (_.isObject(redacted)) {
      return flatted.stringify(redacted);
      //return JSON.stringify(redacted);
    }
    return redacted;
  },

  /**
   * Reads the effective log redaction configuration with safe bootstrap defaults.
   *
   * @returns {Object} Redaction configuration.
   */
  getRedactionConfig: function () {
    const logConfig =
      typeof CONFIG !== "undefined" &&
      CONFIG &&
      typeof CONFIG.get === "function"
        ? CONFIG.get("log") || {}
        : {};
    return this.resolveRedactionConfig(logConfig.redaction);
  },

  /**
   * Preserves mandatory bootstrap keys and bounded work under later-layer configuration.
   * @param {Object} [configured] Intentional key additions, mask and stricter limits.
   * @returns {Object} Enabled redaction policy with immutable safety ceilings.
   * @override Add protection; never remove baseline keys, disable or raise ceilings.
   */
  resolveRedactionConfig: function (configured) {
    let defaultConfig = {
      enabled: true,
      mask: "[REDACTED]",
      maximumStringLength: 32768,
      maximumDepth: 16,
      maximumEntries: 1024,
      maximumJsonSnippets: 16,
      sensitiveKeys: [
        "authorization",
        "authToken",
        "accessToken",
        "refreshToken",
        "token",
        "password",
        "secret",
        "credential",
        "credentials",
        "apiKey",
        "x-api-key",
        "cookie",
        "set-cookie",
        "jwtSecretKey",
        "clientSecret",
        "privateKey",
        "encryptionKey",
        "NODICS_RUNTIME_CONFIGURATION_ENCRYPTION_KEY",
        "customerEligibilityDecision",
      ],
    };
    const additions =
      configured && typeof configured === "object" ? configured : {};
    const baseline = new Set(
      defaultConfig.sensitiveKeys.map((key) => key.toLowerCase()),
    );
    const extraKeys = Array.isArray(additions.sensitiveKeys)
      ? additions.sensitiveKeys
          .slice(0, defaultConfig.sensitiveKeys.length + 64)
          .filter(
            (key) =>
              typeof key === "string" &&
              key.length > 0 &&
              key.length <= 128 &&
              !baseline.has(key.toLowerCase()),
          )
          .slice(0, 64)
      : [];
    const result = {
      ...defaultConfig,
      sensitiveKeys: [
        ...new Set([...defaultConfig.sensitiveKeys, ...extraKeys]),
      ],
    };
    if (
      typeof additions.mask === "string" &&
      additions.mask.length > 0 &&
      additions.mask.length <= 128
    )
      result.mask = additions.mask;
    for (const key of [
      "maximumStringLength",
      "maximumDepth",
      "maximumEntries",
      "maximumJsonSnippets",
    ]) {
      if (Number.isSafeInteger(additions[key]) && additions[key] > 0)
        result[key] = Math.min(defaultConfig[key], additions[key]);
    }
    return result;
  },

  /**
   * Checks whether a key name should be redacted from log output.
   *
   * @param {string} key Object key or metadata field name.
   * @param {Object} config Redaction configuration.
   * @returns {boolean} True when the key is sensitive.
   */
  isSensitiveLogKey: function (key, config) {
    if (!key) return false;
    let normalizedKey = String(key).toLowerCase();
    return (config.sensitiveKeys || []).some((sensitiveKey) => {
      let normalizedSensitiveKey = String(sensitiveKey).toLowerCase();
      return (
        normalizedKey === normalizedSensitiveKey ||
        normalizedKey.indexOf(normalizedSensitiveKey) >= 0
      );
    });
  },

  /**
   * Redacts sensitive fields from a value before log serialization.
   *
   * @param {*} value Raw log value.
   * @param {Object} [config] Redaction configuration.
   * @param {WeakSet<Object>} [seen] Circular-reference guard.
   * @param {number} [depth] Shared nested object/serialized-string depth.
   * @param {Object} [budget] Shared remaining entry budget.
   * @returns {*} Redacted value.
   */
  redactLogValue: function (value, config, seen, depth = 0, budget) {
    if (this.isSensitiveRequest(value)) return "[SENSITIVE_REQUEST]";
    config = this.resolveRedactionConfig(config || this.getRedactionConfig());
    budget = budget || { remaining: config.maximumEntries };
    if (depth > config.maximumDepth || budget.remaining-- <= 0)
      return config.mask;
    if (value === null || value === undefined) return value;
    if (_.isString(value)) {
      return this.redactLogString(value, config, depth, budget);
    }
    if (_.isError(value)) {
      seen = seen || new WeakSet();
      if (seen.has(value)) return "[Circular]";
      seen.add(value);
      return {
        name: this.redactLogValue(value.name, config, seen, depth + 1, budget),
        message: this.redactLogValue(
          value.message,
          config,
          seen,
          depth + 1,
          budget,
        ),
        stack: this.redactLogValue(
          value.stack,
          config,
          seen,
          depth + 1,
          budget,
        ),
      };
    }
    if (_.isObject(value)) {
      seen = seen || new WeakSet();
      if (seen.has(value)) {
        return "[Circular]";
      }
      seen.add(value);
      if (_.isArray(value)) {
        if (value.length > budget.remaining) return config.mask;
        return value.map((item) =>
          this.redactLogValue(item, config, seen, depth + 1, budget),
        );
      }
      let output = {};
      const keys = Object.keys(value);
      if (keys.length > budget.remaining) return config.mask;
      for (const key of keys) {
        const redacted = this.isSensitiveLogKey(key, config)
          ? (budget.remaining--, config.mask)
          : this.redactLogValue(value[key], config, seen, depth + 1, budget);
        Object.defineProperty(output, key, {
          value: redacted,
          enumerable: true,
          configurable: true,
          writable: true,
        });
      }
      return output;
    }
    return value;
  },

  /**
   * Redacts sensitive key/value patterns from string log messages.
   *
   * @param {string} value Raw message.
   * @param {Object} config Redaction configuration.
   * @param {number} [depth] Shared nested serialization depth.
   * @param {Object} [budget] Shared entry budget.
   * @returns {string} Redacted message.
   */
  redactLogString: function (value, config, depth = 0, budget) {
    if (!_.isString(value)) return value;
    config = this.resolveRedactionConfig(config || this.getRedactionConfig());
    budget = budget || { remaining: config.maximumEntries };
    if (
      value.length > config.maximumStringLength ||
      depth > config.maximumDepth ||
      budget.remaining <= 0
    )
      return config.mask;
    let parsed,
      valid = false;
    try {
      parsed = JSON.parse(value);
      valid = true;
    } catch (_) {
      /* Non-JSON text uses bounded scanning below. */
    }
    if (valid) {
      const serialized = JSON.stringify(
        this.redactLogValue(parsed, config, undefined, depth + 1, budget),
      );
      return serialized.length <= config.maximumStringLength
        ? serialized
        : config.mask;
    }
    const text = this.redactEmbeddedLogJson(value, config, depth, budget);
    return text.length <= config.maximumStringLength ? text : config.mask;
  },

  /**
   * Sanitizes bounded non-JSON spans without rewriting already parsed JSON snippets.
   * @param {string} text Plain diagnostic span.
   * @param {Object} config Effective redaction policy.
   * @returns {string} Legacy token, assignment and URI protection with bounded output.
   */
  redactLogText: function (text, config) {
    if (text.length > config.maximumStringLength) return config.mask;
    const tokens = text
      .replace(
        /(Bearer\s+)[A-Za-z0-9._~+/=-]+/gi,
        (_, prefix) => prefix + config.mask,
      )
      .replace(
        /(Basic\s+)[A-Za-z0-9._~+/=-]+/gi,
        (_, prefix) => prefix + config.mask,
      )
      .replace(
        /((?:mongodb(?:\+srv)?|redis|https?):\/\/)([^:@/\s]+):([^@/\s]+)@/gi,
        (_, prefix) => prefix + config.mask + ":" + config.mask + "@",
      );
    if (tokens.length > config.maximumStringLength) return config.mask;
    const redacted = this.redactLogAssignments(tokens, config);
    return redacted.length <= config.maximumStringLength
      ? redacted
      : config.mask;
  },

  /**
   * Finds a balanced JSON container using bounded depth and literal quote/escape state.
   * @param {string} text Bounded log string.
   * @param {number} start Opening brace or bracket index.
   * @param {Object} config Effective policy.
   * @returns {number} Exclusive end, or -1 for malformed/depth-limited input.
   */
  logJsonEnd: function (text, start, config) {
    const stack = [];
    let quoted = false,
      escaped = false;
    for (let i = start; i < text.length; i++) {
      const ch = text[i];
      if (quoted) {
        if (escaped) escaped = false;
        else if (ch === "\\") escaped = true;
        else if (ch === '"') quoted = false;
      } else if (ch === '"') quoted = true;
      else if (ch === "{" || ch === "[") {
        stack.push(ch);
        if (stack.length > config.maximumDepth) return -1;
      } else if (ch === "}" || ch === "]") {
        if (stack.pop() !== (ch === "}" ? "{" : "[")) return -1;
        if (!stack.length) return i + 1;
      }
    }
    return -1;
  },

  /**
   * Parses JSON-shaped embedded containers; malformed candidates are masked, never emitted raw.
   * Ordinary stack paths/bracket labels are not JSON candidates. No regex parses containers.
   * @param {string} text Bounded message or Error stack.
   * @param {Object} config Effective policy.
   * @param {number} depth Shared serialization depth.
   * @param {Object} budget Shared entry budget.
   * @returns {string} Redacted text with safe surrounding diagnostic context.
   */
  redactEmbeddedLogJson: function (text, config, depth, budget) {
    let cursor = 0,
      snippets = 0;
    let quotedParsing = true;
    const parts = [];
    for (let i = 0; i < text.length; i++) {
      if (text[i] === '"' && quotedParsing) {
        const end = this.logQuotedEnd(text, i);
        let decoded;
        try {
          decoded = JSON.parse(text.slice(i, end));
        } catch (_) {
          // Do not repeatedly rescan overlapping unterminated quote candidates.
          quotedParsing = false;
        }
        if (typeof decoded === "string" && /[\[{"]/.test(decoded)) {
          if (++snippets > config.maximumJsonSnippets) return config.mask;
          const redacted = this.redactLogString(
            decoded,
            config,
            depth + 1,
            budget,
          );
          if (redacted === decoded) {
            // Keep unchanged quoted values attached to their assignment key.
            // Splitting password= from its value would hide only an empty span.
            i = end - 1;
            continue;
          }
          parts.push(
            this.redactLogText(
              text.slice(cursor, i) + JSON.stringify(redacted),
              config,
            ),
          );
          cursor = end;
          i = end - 1;
          continue;
        }
        if (typeof decoded === "string") {
          i = end - 1;
          continue;
        }
      }
      if (text[i] !== "{" && text[i] !== "[") continue;
      if (text[i] === "[" && i > 0 && /[A-Za-z0-9_.\/\\-]/.test(text[i - 1]))
        continue;
      let next = i + 1;
      while (next < text.length && /\s/.test(text[next])) next++;
      const first = text[next];
      const escapedQuote = first === "\\" && text[next + 1] === '"';
      const shaped =
        text[i] === "{"
          ? first === '"' || first === "}" || escapedQuote
          : first !== undefined &&
            (escapedQuote ||
              '"{[]-0123456789'.includes(first) ||
              /^(?:true|false|null)(?=\s|,|\])/.test(
                text.slice(next, next + 6),
              ));
      if (!shaped) continue;
      if (++snippets > config.maximumJsonSnippets) return config.mask;
      const end = this.logJsonEnd(text, i, config);
      parts.push(this.redactLogText(text.slice(cursor, i), config));
      if (end === -1) {
        parts.push(config.mask);
        return parts.join("");
      }
      let parsed,
        valid = false;
      try {
        parsed = JSON.parse(text.slice(i, end));
        valid = true;
      } catch (_) {
        /* Fail closed for JSON-shaped malformed snippets. */
      }
      parts.push(
        this.isSensitiveLogAssignmentBefore(text, i, config)
          ? ""
          : valid
            ? JSON.stringify(
                this.redactLogValue(
                  parsed,
                  config,
                  undefined,
                  depth + 1,
                  budget,
                ),
              )
            : config.mask,
      );
      cursor = end;
      i = end - 1;
    }
    parts.push(this.redactLogText(text.slice(cursor), config));
    return parts.join("");
  },

  /**
   * Checks the literal assignment key immediately before a structured snippet.
   * @param {string} text Bounded diagnostic text.
   * @param {number} end Opening snippet index.
   * @param {Object} config Effective redaction policy.
   * @returns {boolean} Whether the whole assigned value must be masked.
   */
  isSensitiveLogAssignmentBefore: function (text, end, config) {
    let cursor = end - 1;
    while (cursor >= 0 && /\s/.test(text[cursor])) cursor--;
    if (![":", "="].includes(text[cursor])) return false;
    cursor--;
    while (cursor >= 0 && /\s/.test(text[cursor])) cursor--;
    const keyEnd = cursor + 1;
    const quote =
      text[cursor] === '"' || text[cursor] === "'" ? text[cursor] : null;
    if (quote) {
      cursor--;
      while (cursor >= 0) {
        if (text[cursor] === quote) {
          let before = cursor - 1;
          while (before >= 0 && text[before] === "\\") before--;
          if ((cursor - before - 1) % 2 === 0) break;
        }
        cursor--;
      }
      if (cursor < 0) return false;
    } else {
      while (cursor >= 0 && /[A-Za-z0-9_.-]/.test(text[cursor])) cursor--;
      cursor++;
      if (
        cursor === keyEnd ||
        (cursor > 0 && /[A-Za-z0-9_.\/\\-]/.test(text[cursor - 1]))
      )
        return false;
    }
    let key = text.slice(cursor, keyEnd);
    if (quote === '"') {
      try {
        key = JSON.parse(key);
      } catch {
        return false;
      }
    } else if (quote) key = key.slice(1, -1);
    return this.isSensitiveLogKey(key, config);
  },

  /**
   * Scans literal assignment keys/values, including quoted keys and spaced/escaped values.
   * Preserves legacy credential assignments without configurable regex alternations.
   * @param {string} text Bounded text after structured snippet handling.
   * @param {Object} config Effective policy.
   * @returns {string} Redacted assignments; no filesystem path rewriting.
   */
  redactLogAssignments: function (text, config) {
    let cursor = 0;
    const parts = [];
    for (let i = 0; i < text.length; ) {
      const start = i,
        quote = text[i] === '"' || text[i] === "'" ? text[i] : null;
      if (quote) {
        i = this.logQuotedEnd(text, i);
      } else {
        if (
          !/[A-Za-z0-9_.-]/.test(text[i]) ||
          (i > 0 && /[A-Za-z0-9_.\/\\-]/.test(text[i - 1]))
        ) {
          i++;
          continue;
        }
        while (i < text.length && /[A-Za-z0-9_.-]/.test(text[i])) i++;
      }
      let key = text.slice(start, i);
      if (quote) {
        if (key[key.length - 1] !== quote) continue;
        if (quote === '"') {
          try {
            key = JSON.parse(key);
          } catch (_) {
            key = key.slice(1, -1);
          }
        } else key = key.slice(1, -1);
      }
      let separator = i;
      while (separator < text.length && /\s/.test(text[separator])) separator++;
      if (
        !this.isSensitiveLogKey(key, config) ||
        ![":", "="].includes(text[separator])
      )
        continue;
      let valueStart = separator + 1;
      while (valueStart < text.length && /\s/.test(text[valueStart]))
        valueStart++;
      let end = valueStart;
      if (text[end] === '"' || text[end] === "'")
        end = this.logQuotedEnd(text, end);
      else if (text[end] === "{" || text[end] === "[") {
        end = this.logJsonEnd(text, end, config);
        if (end === -1) end = text.length;
      } else while (end < text.length && !/[\s,;}\]]/.test(text[end])) end++;
      // Escape-ended quoted assignments can hide a malformed continuation after
      // an apparent closing quote. Keep only an unambiguous next field/delimiter.
      if (
        (text[valueStart] === '"' || text[valueStart] === "'") &&
        end < text.length &&
        text[end - 2] === "\\"
      ) {
        let next = end;
        while (next < text.length && /\s/.test(text[next])) next++;
        if (next < text.length && ![",", ";", "}", "]"].includes(text[next])) {
          let keyEnd = next;
          while (keyEnd < text.length && /[A-Za-z0-9_.-]/.test(text[keyEnd]))
            keyEnd++;
          let separatorEnd = keyEnd;
          while (separatorEnd < text.length && /\s/.test(text[separatorEnd]))
            separatorEnd++;
          if (keyEnd === next || ![":", "="].includes(text[separatorEnd]))
            end = text.length;
        }
      }
      parts.push(text.slice(cursor, valueStart), config.mask);
      cursor = end;
      i = Math.max(end, i);
    }
    parts.push(text.slice(cursor));
    return parts.join("");
  },

  /**
   * Scans a single quoted token without interpreting escaped quote characters as delimiters.
   * @param {string} text Bounded log text.
   * @param {number} start Quote index.
   * @returns {number} Exclusive token end, or text length for an unterminated token.
   */
  logQuotedEnd: function (text, start) {
    let escaped = false;
    for (let i = start + 1; i < text.length; i++) {
      if (escaped) escaped = false;
      else if (text[i] === "\\") escaped = true;
      else if (text[i] === text[start]) return i + 1;
    }
    return text.length;
  },

  /**
   * Creates a colorized console transport.
   *
   * @param {string} labelName Logger label.
   * @param {Object} config Console transport configuration.
   * @returns {Object} Winston console transport.
   */
  createConsoleTransport: function (labelName, config) {
    let _self = this;
    let options = {};
    options.label = labelName;
    options.format = logform.format.combine(
      winston.format.label({ label: labelName }),
      winston.format.colorize(),
      winston.format.timestamp({
        format: "YYYY-MM-DD HH:mm:ss",
      }),
      winston.format.prettyPrint(),
      winston.format.printf((info) => {
        const splat = info[splt] || [];
        let message = _self.formatObject(info.message || info.errmsg);
        const rest = splat.map((value) => _self.formatObject(value)).join(" ");
        if (rest && !utils.isBlank(rest) && rest !== "{}" && rest !== "[]") {
          message = message + " " + rest;
        } else if (
          info.metadata &&
          !utils.isBlank(info.metadata) &&
          info.metadata !== "{}" &&
          info.metadata !== "[]"
        ) {
          message = message + " " + _self.formatObject(info.metadata);
        }
        return `${info.timestamp}  ${info.level}: [${info.label}] ${message}`;
      }),
    );
    return new winston.transports.Console(options);
  },

  /**
   * Creates a file transport rooted under the selected server log directory.
   *
   * @param {string} labelName Logger label.
   * @param {Object} config File transport configuration.
   * @param {Object} logConfig Effective layered log configuration.
   * @returns {Object} Winston file transport.
   */
  createFileTransport: function (labelName, config, logConfig) {
    let _self = this;
    let options = _.merge({}, config.options);
    options.label = labelName;
    options.format = winston.format.combine(
      winston.format.label({ label: labelName }),
      winston.format.timestamp({
        format: "YYYY-MM-DD HH:mm:ss",
      }),
      winston.format.prettyPrint(),
      _self.getLogFormat(config),
      winston.format.printf((info) => {
        const splat = info[splt] || [];
        const message = _self.formatObject(info.message || info.errmsg);
        const rest = splat.map((value) => _self.formatObject(value)).join(" ");
        if (rest && !utils.isBlank(rest) && rest !== "{}" && rest !== "[]") {
          info.message = `${message} ${rest}`;
        } else {
          info.message = `${message}`;
        }
        return `${info.timestamp}  ${info.level}: [${info.label}] ${info.message}`;
      }),
    );
    options.filename = this.resolveLogFileName(options.filename, logConfig);
    return new winston.transports.File(options);
  },

  /**
   * Resolves the final file transport target from independent log storage policy.
   *
   * @param {string} fileName Configured transport filename.
   * @param {Object} logConfig Effective layered log configuration.
   * @returns {string} Absolute log file path.
   */
  resolveLogFileName: function (fileName, logConfig) {
    let storage = this.resolveLogStorageConfiguration(logConfig);
    let layout = storage.layout || "{filename}";
    let relativePath = this.applyLogStorageLayout(layout, fileName);
    if (path.isAbsolute(relativePath)) {
      throw new Error(
        "Log filename layout must resolve to a provider-relative path",
      );
    }
    let target = path.resolve(storage.rootPath, relativePath);
    if (
      target !== storage.rootPath &&
      !target.startsWith(storage.rootPath + path.sep)
    ) {
      throw new Error(
        "Log filename layout escapes the configured log storage root",
      );
    }
    return target;
  },

  /**
   * Resolves configured log storage provider without coupling logs to media storage.
   *
   * @param {Object} logConfig Effective layered log configuration.
   * @returns {Object} Resolved log storage provider.
   */
  resolveLogStorageConfiguration: function (logConfig) {
    logConfig =
      logConfig ||
      (typeof CONFIG !== "undefined" && CONFIG && CONFIG.get
        ? CONFIG.get("log")
        : {}) ||
      {};
    let storage = logConfig.storage || {};
    let providers = storage.providers || {};
    let providerCode = storage.defaultProvider || "local";
    let provider =
      providers[providerCode] ||
      (providerCode === "local"
        ? { enabled: true, fallbackRelativeBasePath: "temp/logs" }
        : undefined);
    if (!provider || provider.enabled !== true) {
      throw new Error("Invalid log storage provider: " + providerCode);
    }
    let configuredPath = provider.basePath;
    let fallback = provider.fallbackRelativeBasePath || "temp/logs";
    let rawPath = configuredPath || fallback;
    let rootPath = path.isAbsolute(rawPath)
      ? path.resolve(rawPath)
      : path.resolve(path.join(this.resolveServerRoot(), rawPath));
    return {
      providerCode: providerCode,
      provider: Object.assign({}, provider),
      rootPath: rootPath,
      layout: storage.layout || "{filename}",
    };
  },

  /**
   * Applies safe path variables to the configured log layout.
   *
   * @param {string} layout Provider-relative layout.
   * @param {string} fileName Transport filename.
   * @returns {string} Provider-relative log path.
   */
  applyLogStorageLayout: function (layout, fileName) {
    let now = new Date();
    let values = {
      filename: this.cleanLogPath(fileName || "nodics.log"),
      environment: this.cleanLogPath(this.resolveRuntimeName("environment")),
      server: this.cleanLogPath(this.resolveRuntimeName("server")),
      node: this.cleanLogPath(this.resolveRuntimeName("node")),
      yyyy: String(now.getUTCFullYear()),
      mm: String(now.getUTCMonth() + 1).padStart(2, "0"),
      dd: String(now.getUTCDate()).padStart(2, "0"),
    };
    let resolved = String(layout || "{filename}").replace(
      /\{([a-zA-Z0-9_]+)\}/g,
      (match, token) => {
        return values[token] || "unknown";
      },
    );
    return this.cleanLogPath(resolved);
  },

  /**
   * Resolves environment, server, and node labels for log layouts.
   *
   * @param {string} kind Runtime label kind.
   * @returns {string} Runtime label.
   */
  resolveRuntimeName: function (kind) {
    if (kind === "environment") {
      if (typeof NODICS !== "undefined" && NODICS.getSelectedEnvironmentName)
        return NODICS.getSelectedEnvironmentName();
      if (typeof NODICS !== "undefined" && NODICS.getEnvironmentName)
        return NODICS.getEnvironmentName();
      return "environment";
    }
    if (kind === "server") {
      if (typeof NODICS !== "undefined" && NODICS.getSelectedServerName)
        return NODICS.getSelectedServerName();
      if (typeof NODICS !== "undefined" && NODICS.getServerName)
        return NODICS.getServerName();
      return path.basename(this.resolveServerRoot()) || "server";
    }
    if (kind === "node") {
      if (typeof NODICS !== "undefined" && NODICS.getNodeName)
        return NODICS.getNodeName();
      if (typeof CONFIG !== "undefined" && CONFIG && CONFIG.get)
        return CONFIG.get("nodeId") || "node0";
      return "node0";
    }
    return kind;
  },

  /**
   * Resolves active server root with safe fallback for isolated tests.
   *
   * @returns {string} Absolute server root.
   */
  resolveServerRoot: function () {
    if (typeof NODICS !== "undefined" && NODICS.getServerPath)
      return NODICS.getServerPath();
    return process.cwd();
  },

  /**
   * Sanitizes provider-relative log path segments.
   *
   * @param {string} value Raw path.
   * @returns {string} Safe provider-relative path.
   */
  cleanLogPath: function (value) {
    let segments = String(value || "unknown")
      .replace(/\\/g, "/")
      .split("/")
      .filter((segment) => segment !== "");
    let cleaned = segments.map((segment) => {
      let safe = segment.replace(/[^a-zA-Z0-9._-]/g, "-");
      if (!safe || safe === "." || safe === "..") return "unknown";
      return safe;
    });
    return cleaned.length ? cleaned.join("/") : "unknown";
  },

  /**
   * Creates an Elasticsearch transport.
   *
   * @param {string} labelName Logger label.
   * @param {Object} config Elasticsearch transport configuration.
   * @returns {Object} Winston Elasticsearch transport.
   */
  createElasticTransport: function (labelName, config) {
    let options = _.merge({}, config.options);
    options.label = labelName;
    options.client = this.createElasticLoggerClient(
      config.client || options.client,
    );
    options.useTransformer = true;
    options.transformer = this.createElasticLogTransformer();
    return new wElasticsearch.ElasticsearchTransport(options);
  },

  /**
   * Creates an Elasticsearch transformer that redacts log data before indexing.
   *
   * @returns {Function} Winston Elasticsearch transformer.
   */
  createElasticLogTransformer: function () {
    let _self = this;
    return function (logData) {
      return wElasticsearch.ElasticsearchTransformer(
        _self.redactLogValue(logData),
      );
    };
  },

  /**
   * Creates or reuses the Elasticsearch logger client.
   *
   * @param {Object} options Elasticsearch client options.
   * @returns {Object} Elasticsearch client.
   * @sideEffects Caches client in `elasticClient`.
   */
  createElasticLoggerClient: function (options) {
    if (this.elasticClient === null) {
      this.elasticClient = new elasticsearch.Client(options);
    }
    return this.elasticClient;
  },
};
