/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";

/**
 * @module redisCache/service/maintenance/defaultRedisLocalResetMaintenanceService
 * @description Bounded offline auth namespace inventory and exact reviewed-key deletion. Scope/count receipts only; no global flush or startup erasure.
 * @owner nCache @layer service
 * @override Preserve operator attestations, bounded scans, unchanged-key checks, native-only configuration and closed owned clients.
 */
module.exports = {
  /** Validates the actual nCache-derived namespace and native standalone engine. */
  validate: function (options) {
    const engine = options.engine || {}, source = engine.options || {};
    const configuration = require("../../../../cache/src/service/config/defaultCacheConfigurationService");
    const namespace = configuration.createStoragePrefix({ channel: { channelName: "auth", engineOptions: engine } });
    let url;
    try { url = new URL(source.url || `redis://${source.host || source.socket?.host || ""}:${source.port || source.socket?.port || ""}`); }
    catch { throw new Error("RESET_REDIS_SCOPE_INVALID"); }
    if (!/^[A-Za-z][A-Za-z0-9_]{0,127}$/.test(options.environment || "") ||
        options.exclusiveDeployment !== true || options.writersExcluded !== true || engine.enabled !== true ||
        namespace !== options.namespace || !/^auth_[A-Za-z][A-Za-z0-9_]{1,127}_$/.test(namespace) ||
        !namespace.startsWith("auth_" + options.environment) || source.sentinel?.enabled ||
        source.socket?.path || source.socket?.tls || source.tls ||
        url.protocol !== "redis:" || !["127.0.0.1", "localhost", "[::1]"].includes(url.hostname) ||
        url.search || url.hash || (url.pathname && url.pathname !== "/") ||
        !Number.isSafeInteger(source.database ?? source.db ?? 0) || (source.database ?? source.db ?? 0) < 0 ||
        (source.url && ((source.host && source.host !== url.hostname) ||
          (source.socket?.host && source.socket.host !== url.hostname) ||
          (source.port && Number(source.port) !== Number(url.port || 6379)) ||
          (source.socket?.port && Number(source.socket.port) !== Number(url.port || 6379)))))
      throw new Error("RESET_REDIS_SCOPE_INVALID");
    return namespace;
  },
  /** Uses the existing engine's connection lifecycle with disabled reconnect and suppressed provider diagnostics. */
  open: async function (options) {
    this.validate(options);
    const engineOwner = { ...(global.SERVICE?.DefaultRedisCacheEngineService ||
      require("../engine/defaultRedisCacheEngineService")), LOG: { info() {}, debug() {}, error() {} } };
    const engine = { ...options.engine, options: { ...options.engine.options,
      socket: { ...options.engine.options?.socket, connectTimeout: 3000, reconnectStrategy: false } } };
    let client;
    try {
      const result = await engineOwner.initCache(engine, options.moduleName);
      client = result.result;
      return this.bind(options, client);
    }
    catch {
      const error = new Error("RESET_REDIS_OPEN_FAILED");
      try { if (typeof client?.disconnect === "function") await client.disconnect(); } catch { error.cleanupFailedCount = 1; }
      throw error;
    }
  },
  /** Holds bounded exact keys privately and refuses namespace drift; no key name/value leaves a receipt. */
  bind: function (options, client) {
    const namespace = this.validate(options);
    if (!client || typeof client.scan !== "function" || typeof client.del !== "function" || typeof client.disconnect !== "function")
      throw new Error("RESET_REDIS_CAPABILITY_UNAVAILABLE");
    let reviewed = null, closed = false, closeOutcome;
    const close = () => {
      if (!closeOutcome) closeOutcome = Promise.resolve().then(() => client.disconnect()).then(() => {
        closed = true;
      }, () => { throw new Error("RESET_REDIS_CLOSE_UNCONFIRMED"); });
      return closeOutcome;
    };
    const call = async work => {
      if (closed || closeOutcome) throw new Error("RESET_REDIS_CLIENT_CLOSED");
      let timer, timedOut = false;
      try {
        return await Promise.race([Promise.resolve().then(work), new Promise((resolve, reject) => {
          timer = setTimeout(() => { timedOut = true; reject(new Error("RESET_REDIS_OPERATION_UNCERTAIN")); }, 5000);
        })]);
      } catch {
        const error = new Error("RESET_REDIS_OPERATION_UNCONFIRMED");
        if (timedOut) { try { await close(); } catch { error.cleanupFailedCount = 1; } }
        throw error;
      }
      finally { clearTimeout(timer); }
    };
    const inventory = async () => {
      let cursor = 0, pages = 0, bytes = 0;
      const deadline = Date.now() + 10000;
      const keys = new Set();
      do {
        if (++pages > 256 || Date.now() > deadline) throw new Error("RESET_REDIS_SCAN_BOUND_EXCEEDED");
        const result = await call(() => client.scan(cursor, { MATCH: namespace + "*", COUNT: 100 }));
        if (!result || !Number.isSafeInteger(result.cursor) || result.cursor < 0 || !Array.isArray(result.keys))
          throw new Error("RESET_REDIS_SCAN_UNCONFIRMED");
        cursor = result.cursor;
        for (const key of result.keys) {
          if (typeof key !== "string" || !key.startsWith(namespace) || key.length > 2048)
            throw new Error("RESET_REDIS_FOREIGN_KEY_REFUSED");
          if (!keys.has(key)) bytes += Buffer.byteLength(key);
          keys.add(key);
          if (keys.size > 1000 || bytes > 1048576) throw new Error("RESET_REDIS_KEY_BOUND_EXCEEDED");
        }
      } while (cursor !== 0);
      return [...keys].sort();
    };
    return {
      contractVersion: 1,
      inspect: async () => { reviewed = await inventory(); return { keyCount: reviewed.length }; },
      clear: async () => {
        if (!reviewed) throw new Error("RESET_REDIS_INSPECTION_REQUIRED");
        const current = await inventory();
        if (JSON.stringify(current) !== JSON.stringify(reviewed)) throw new Error("RESET_REDIS_NAMESPACE_CHANGED");
        let removedCount = 0;
        try {
          for (let offset = 0; offset < reviewed.length; offset += 100) {
            const batch = reviewed.slice(offset, offset + 100);
            const result = await call(() => client.del(batch));
            if (!Number.isSafeInteger(result) || result < 0 || result > batch.length) throw new Error("RESET_REDIS_DELETE_UNCONFIRMED");
            removedCount += result;
            if (result !== batch.length) throw new Error("RESET_REDIS_DELETE_UNCONFIRMED");
          }
        } catch {
          const error = new Error("RESET_REDIS_CLEANUP_PARTIAL_OR_UNCERTAIN");
          error.removedCount = removedCount;
          throw error;
        }
        reviewed = null;
        return { removedCount };
      },
      verifyEmpty: async () => {
        const keys = await inventory();
        if (keys.length) throw new Error("RESET_REDIS_NOT_EMPTY");
        return { keyCount: 0 };
      },
      close,
    };
  },
};
