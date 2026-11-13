/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module backoffice/service/registry/DefaultBackofficeRegistryStoreService
 * @description Provides the single asynchronous memory or nCache-owned distributed lease-store boundary used by BackOffice.
 * @layer service
 * @owner backoffice
 * @override Projects may replace store behavior while preserving asynchronous TTL, enumeration, diagnostics, and failure contracts.
 */
const { randomUUID } = require("node:crypto");
const { isDeepStrictEqual } = require("node:util");
// Derived decoding only: never an authority cache, and never shared by store instances.
const decodedStores = new WeakMap();


module.exports = {
    /** Recursively freezes decoded lease data without changing provider authority. */
    freezeLease: function (value) {
    if (value && typeof value === "object" && !Object.isFrozen(value)) {
        Object.values(value).forEach(value => this.freezeLease(value)); Object.freeze(value);
    }
    return value;
},

    _instances: new Map(),
    _metrics: { reads: 0, writes: 0, renewals: 0, deletes: 0, conditionalDeletes: 0, conditionalDeleteConflicts: 0,
        scans: 0, errors: 0, lastSuccessAt: null, lastErrorAt: null },

    /** Initializes the configured store without creating provider connections outside nCache. */
    init: function () { return Promise.resolve(true); },
    /** Completes the standard service post-initialization contract. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns effective store policy from the BackOffice registry configuration. */
    getConfiguration: function () {
        let config = (CONFIG.get('backofficeRegistry') || {}).store;
        if (!config || !config.mode || !config.moduleName || !config.engineName || !config.keyPrefix) {
            throw new Error('BackOffice registry store configuration is incomplete');
        }
        return config;
    },
    /** Returns whether the effective store uses an nCache-owned distributed engine. */
    isDistributed: function () { return this.getConfiguration().mode === 'distributed'; },
    /** Builds one non-sensitive namespaced provider key. */
    getStorageKey: function (key) { return String(this.getConfiguration().keyPrefix) + key; },
    /** Returns the configured distributed engine client already owned by nCache. */
    getDistributedClient: function () {
        let config = this.getConfiguration();
        let engineService = SERVICE.DefaultCacheEngineService;
        let client = engineService && engineService.getEngineClient(config.moduleName, config.engineName);
        if (!client) throw new Error('Configured BackOffice distributed registry store is unavailable');
        return client;
    },
    /** Records a sanitized store operation outcome. */
    observe: function (operation, executor) {
        return Promise.resolve().then(executor).then(result => {
            this._metrics[operation]++;
            this._metrics.lastSuccessAt = new Date().toISOString();
            return result;
        }).catch(error => {
            this._metrics.errors++;
            this._metrics.lastErrorAt = new Date().toISOString();
            let audit = SERVICE.DefaultBackofficeAuditService;
            let event = { eventType: 'backoffice.registry.store', outcome: 'failure', reasonCode: 'STORE_OPERATION_FAILED',
                operation: operation, storeMode: this.getConfiguration().mode || 'memory' };
            return Promise.resolve(audit && audit.record ? audit.record(event) : false).catch(() => false).then(() => { throw error; });
        });
    },
    /** Returns one observed lease by its stable module-instance key. */
    get: function (key) {
        return this.observe('reads', () => {
            if (!this.isDistributed()) return this._instances.get(key);
            return this.getDistributedClient().get(this.getStorageKey(key)).then(value => this.decodeLease(this.getStorageKey(key), value));
        });
    },
    /** Reuses immutable decoding only when fresh provider bytes match; errors never reach this path. */
    decodeLease: function (key, serialized) {
        const maximum = this.getConfiguration().maximumDecodedBytes ?? 0;
        if (!Number.isSafeInteger(maximum) || maximum < 0 || maximum > 67108864) throw new Error("Registry decoded byte budget is invalid");
        let cache = decodedStores.get(this);
        if (!cache || cache.maximum !== maximum) { cache = { values: new Map(), bytes: 0, maximum }; decodedStores.set(this, cache); }
        const previous = cache.values.get(key);
        if (serialized && previous?.serialized === serialized) return previous.value;
        if (previous) { cache.values.delete(key); cache.bytes -= previous.bytes; }
        if (!serialized) return undefined;
        const value = this.freezeLease(JSON.parse(serialized));
        const bytes = Buffer.byteLength(serialized, "utf8");
        if (bytes <= maximum && maximum > 0) {
            while (cache.bytes + bytes > maximum && cache.values.size) {
                const oldest = cache.values.keys().next().value;
                cache.bytes -= cache.values.get(oldest).bytes; cache.values.delete(oldest);
            }
            cache.values.set(key, { serialized, value, bytes }); cache.bytes += bytes;
        }
        return value;
    },
    /** Renews an already admitted live lease only when every non-heartbeat field
     * is unchanged. The caller must retain signed identity/source checks and use
     * full admission for customized ownership policy. Provider comparison and
     * expiry checks are atomic; a missing, changed or expired lease falls back
     * to normal admission. Advancing the shared revision fences competing new
     * ownership decisions without rescanning all leases for every heartbeat.
     */
    renewUnchanged: function (key, value, ttlMs) {
        return this.observe('renewals', async () => {
            const deadline = Math.min(value.expiresAt, Date.now() + Number(ttlMs));
            if (!Number.isFinite(deadline) || deadline <= Date.now()) return false;
            const storageKey = this.getStorageKey(key);
            const client = this.isDistributed() ? this.getDistributedClient() : undefined;
            const serialized = client ? await client.get(storageKey) : undefined;
            const current = client ? (serialized ? JSON.parse(serialized) : undefined) : this._instances.get(key);
            if (!current || !(current.expiresAt > Date.now())) return false;
            const stable = input => {
                const result = JSON.parse(JSON.stringify(input));
                delete result.lastSeenAt;
                delete result.expiresAt;
                return result;
            };
            if (!isDeepStrictEqual(stable(current), stable(value))) return false;
            if (!client) {
                this._instances.set(key, value);
                return true;
            }
            if (typeof client.eval !== 'function') throw new Error('Distributed registry store requires atomic admission support');
            const script = [
                '-- backoffice-registry-unchanged-renewal',
                'if redis.call("GET", KEYS[1]) ~= ARGV[1] then return 0 end',
                'local clock=redis.call("TIME")',
                'local now=tonumber(clock[1])*1000+math.floor(tonumber(clock[2])/1000)',
                'if tonumber(ARGV[2]) <= now or tonumber(ARGV[4]) <= now then return 0 end',
                'redis.call("SET", KEYS[1], ARGV[3], "PX", math.ceil(tonumber(ARGV[4])-now))',
                'redis.call("SET", KEYS[2], ARGV[5])',
                'return 1'
            ].join('\n');
            return Number(await client.eval(script, {
                keys: [storageKey, this.getStorageKey('$revision')],
                arguments: [serialized, String(current.expiresAt), JSON.stringify(value), String(deadline), randomUUID()]
            })) === 1;
        });
    },
    /** Atomically validates a current lease snapshot and writes its replacement.
     * The synchronous validator must be pure and rerunnable. Memory has no yield between
     * validation and mutation; distributed admission retries a revision-guarded nCache write.
     * All writes advance the same revision, including source-only observations. Provider
     * expiry/removal only reduces ownership and therefore need not advance the revision.
     */
    set: function (key, value, ttlMs, validate) {
        return this.serializeDistributedAdmission(() => this.observe('writes', async () => {
            if (!this.isDistributed()) {
                if (validate) validate(Array.from(this._instances.entries()).map(([key, value]) => ({ key, value })));
                this._instances.set(key, value);
                return value;
            }
            const client = this.getDistributedClient();
            if (typeof client.eval !== 'function') throw new Error('Distributed registry store requires atomic admission support');
            const revisionKey = this.getStorageKey('$revision');
            const script = [
                '-- backoffice-registry-admission',
                'if ARGV[1] ~= "*" and (redis.call("GET", KEYS[2]) or "") ~= ARGV[1] then return 0 end',
                'redis.call("SET", KEYS[1], ARGV[2], "PX", ARGV[3])',
                'redis.call("SET", KEYS[2], ARGV[4])',
                'return 1'
            ].join('\n');
            // A lease cannot be admitted after its original bounded expiry, including under contention.
            const deadline = Math.min(value.expiresAt, Date.now() + Number(ttlMs || value.expiresAt - Date.now()));
            while (Date.now() < deadline) {
                const revision = validate ? (await client.get(revisionKey) || '') : '*';
                if (validate) {
                    const entries = await this.values();
                    // Do not report a conflict from a snapshot already superseded by another admission.
                    if ((await client.get(revisionKey) || '') !== revision) continue;
                    validate(entries);
                }
                const duration = Math.ceil(deadline - Date.now());
                if (duration <= 0) break;
                const written = await client.eval(script, {
                    keys: [this.getStorageKey(key), revisionKey],
                    arguments: [revision, JSON.stringify(value), String(duration), randomUUID()]
                });
                if (Number(written) === 1) return value;
            }
            throw new Error('Registry admission lease expired during contention');
        }));
    },
    /** Prevents same-member lease batches from repeatedly invalidating each other; provider CAS still arbitrates independent members. */
    serializeDistributedAdmission: function (operation) {
        if (!this.isDistributed()) return operation();
        const admitted = (this._admissionTail || Promise.resolve()).then(operation);
        this._admissionTail = admitted.catch(() => undefined);
        return admitted;
    },
    /** Removes one observed lease. */
    delete: function (key) {
        return this.observe('deletes', () => {
            if (!this.isDistributed()) return this._instances.delete(key);
            return this.getDistributedClient().del(this.getStorageKey(key)).then(count => count > 0);
        });
    },
    /** Removes a lease only when its observed expiry still matches, preventing stale-scan deletion of a renewed lease. */
    deleteIfExpiresAt: function (key, expectedExpiresAt) {
        return this.observe('conditionalDeletes', async () => {
            if (!this.isDistributed()) {
                let current = this._instances.get(key);
                if (!current || Number(current.expiresAt) !== Number(expectedExpiresAt)) {
                    this._metrics.conditionalDeleteConflicts++;
                    return false;
                }
                return this._instances.delete(key);
            }
            let client = this.getDistributedClient();
            if (typeof client.eval !== 'function') throw new Error('Distributed registry store requires atomic conditional delete support');
            let script = "local value=redis.call('GET',KEYS[1]); if not value then return 0 end; local lease=cjson.decode(value); if tostring(lease.expiresAt)~=ARGV[1] then return -1 end; return redis.call('DEL',KEYS[1])";
            let result = await client.eval(script, { keys: [this.getStorageKey(key)], arguments: [String(expectedExpiresAt)] });
            if (Number(result) === -1) this._metrics.conditionalDeleteConflicts++;
            return Number(result) === 1;
        });
    },
    /** Returns a snapshot of every currently present observed lease. */
    values: function () {
        return this.observe('scans', async () => {
            if (!this.isDistributed()) return Array.from(this._instances.entries()).map(entry => ({ key: entry[0], value: entry[1] }));
            let client = this.getDistributedClient();
            let prefix = String(this.getConfiguration().keyPrefix || 'registry:lease:');
            let keys = [];
            for await (let key of client.scanIterator({ MATCH: prefix + '*', COUNT: 100 })) {
                if (key !== this.getStorageKey('$revision')) keys.push(key);
            }
            if (keys.length === 0) return [];
            let values = typeof client.mGet === 'function' ? await client.mGet(keys) : await Promise.all(keys.map(key => client.get(key)));
            return keys.map((key, index) => values[index] ? {
                key: key.substring(prefix.length), value: this.decodeLease(key, values[index])
            } : null).filter(Boolean);
        });
    },
    /** Returns the current observed lease count. */
    size: function () { return this.values().then(entries => entries.length); },
    /** Returns sanitized store mode, health, and operation counters. */
    diagnostics: function () {
        let config = this.getConfiguration();
        let available = true;
        if (this.isDistributed()) {
            try {
                let client = this.getDistributedClient();
                available = client.isReady === undefined || client.isReady === true;
            } catch (error) { available = false; }
        }
        return { mode: config.mode || 'memory', distributed: this.isDistributed(), available: available, metrics: Object.assign({}, this._metrics) };
    },
    /** Clears all process-local observed leases; intended for controlled shutdown and tests. */
    clear: function () { this._instances.clear(); decodedStores.delete(this); }
};
