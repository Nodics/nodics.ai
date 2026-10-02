/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nAuth/service/identity/DefaultPrincipalSecurityStampService
 * @description Maintains tenant-scoped principal security stamps in the auth
 * cache. Production deployments should use a shared auth-cache engine.
 * @layer service
 * @owner nAuth
 * @override Project modules may integrate distributed IAM session-version storage while preserving fail-closed validation.
 */
module.exports = {
    /** Validates security-stamp cache safety during service startup. */
    init: function () {
        return this.validateConfiguration();
    },
    /** Completes service startup without additional state mutation. */
    postInit: function () {
        return Promise.resolve(true);
    },
    /** Returns the effective layered security-stamp policy. */
    getPolicy: function () {
        return (
            (CONFIG.get("authSecurity") &&
                CONFIG.get("authSecurity").securityStamp) ||
            {}
        );
    },
    /** Resolves the configured shared auth-state cache namespace without changing Profile service ownership. */
    getCacheModuleName: function () {
        return (
            this.getPolicy().cacheModuleName ||
            CONFIG.get("profileModuleName") ||
            "profile"
        );
    },
    /** Builds a tenant-scoped principal stamp cache key. */
    getKey: function (tenant, principalId) {
        return "securityStamp:" + tenant + ":" + principalId;
    },
    /** Rejects strict deployments whose auth channel is disabled, local-only, or non-atomic. */
    validateConfiguration: function () {
        let policy = this.getPolicy();
        let security = CONFIG.get("authSecurity") || {};
        let refreshPolicy = security.refreshToken || {};
        let strictStamp =
            policy.enabled !== false &&
            policy.failClosed !== false &&
            policy.allowMissingStamp !== true;
        if (!strictStamp && refreshPolicy.requireDistributedCache !== true)
            return Promise.resolve(true);
        let cache = CONFIG.get("cache") || {};
        let cacheModuleName = this.getCacheModuleName();
        let moduleCache = cache[cacheModuleName] || {};
        let channel = (moduleCache.channels && moduleCache.channels.auth) || {};
        let profileEngines = moduleCache.engines || {};
        let defaultEngines = (cache.default && cache.default.engines) || {};
        let engine =
            profileEngines[channel.engine] ||
            defaultEngines[channel.engine] ||
            {};
        if (
            cache.enabled === false ||
            channel.enabled === false ||
            engine.enabled === false ||
            !channel.engine ||
            engine.distributed !== true ||
            engine.atomicConsume !== true ||
            engine.atomicVersionWrite !== true ||
            channel.fallback === true
        ) {
            return Promise.reject(
                new CLASSES.NodicsError(
                    "ERR_AUTH_00001",
                    "Strict authentication state requires an enabled distributed auth cache with atomic consume, atomic version writes and local fallback disabled",
                ),
            );
        }
        return Promise.resolve(true);
    },
    /** Registers the current principal stamp in the auth cache. */
    register: function (tenant, principalId, authVersion) {
        if (!principalId || authVersion === undefined)
            return Promise.resolve(false);
        const version = Number(authVersion);
        if (!Number.isSafeInteger(version) || version < 0)
            return Promise.reject(
                new CLASSES.NodicsError(
                    "ERR_AUTH_00003",
                    "Principal security stamp requires a safe version",
                ),
            );
        return SERVICE.DefaultCacheService.putVersioned({
            moduleName: this.getCacheModuleName(),
            channelName: "auth",
            key: this.getKey(tenant, principalId),
            ttl: 0,
            versionProperty: "authVersion",
            value: { tenant, principalId, authVersion: version },
        });
    },
    /** Reserves a unique tenant-wide version without invalidating a principal before persistence. */
    reserveVersion: function (tenant, minimum = 1) {
        return SERVICE.DefaultCacheService.putVersioned({
            moduleName: this.getCacheModuleName(),
            channelName: "auth",
            key: "securityStampSequence:" + tenant,
            ttl: 0,
            versionProperty: "authVersion",
            advance: true,
            value: { authVersion: minimum },
        }).then((result) => result.result.authVersion);
    },
    /** Advances the validation stamp atomically, so concurrent revocations remain distinct. */
    revoke: function (tenant, principalId) {
        return SERVICE.DefaultCacheService.putVersioned({
            moduleName: this.getCacheModuleName(),
            channelName: "auth",
            key: this.getKey(tenant, principalId),
            ttl: 0,
            versionProperty: "authVersion",
            advance: true,
            value: { tenant, principalId, authVersion: 1 },
        }).then((result) => result.result.authVersion);
    },
    /** Validates a bounded capability-supplied set of independent stamp coordinates. @param {Object[]} bindings Signed bindings. @returns {Object[]} Normalized coordinates. */
    normalizeBindings: function (bindings) {
        if (
            !Array.isArray(bindings) ||
            bindings.length < 1 ||
            bindings.length > 8
        )
            throw new CLASSES.NodicsError("ERR_AUTH_00001");
        const seen = new Set();
        return bindings.map((binding) => {
            if (
                !binding ||
                Object.keys(binding).sort().join(",") !==
                    "authVersion,principalId,tenant" ||
                typeof binding.tenant !== "string" ||
                !/^[A-Za-z0-9_.-]{1,128}$/.test(binding.tenant) ||
                typeof binding.principalId !== "string" ||
                !/^[A-Za-z0-9_.:-]{1,256}$/.test(binding.principalId) ||
                !Number.isSafeInteger(binding.authVersion) ||
                binding.authVersion < 1
            )
                throw new CLASSES.NodicsError("ERR_AUTH_00001");
            const key = this.getKey(binding.tenant, binding.principalId);
            if (seen.has(key)) throw new CLASSES.NodicsError("ERR_AUTH_00001");
            seen.add(key);
            return {
                tenant: binding.tenant,
                principalId: binding.principalId,
                authVersion: binding.authVersion,
            };
        });
    },
    /** Enforces every independent binding without legacy fail-open policy. @param {Object[]} bindings Signed coordinates. @returns {Promise<boolean>} All stamps current. */
    validateBindings: async function (bindings) {
        for (const binding of this.normalizeBindings(bindings)) {
            const stamp =
                await SERVICE.DefaultAuthenticationProviderService.findToken(
                    this.getCacheModuleName(),
                    this.getKey(binding.tenant, binding.principalId),
                );
            if (!stamp || Number(stamp.authVersion) !== binding.authVersion)
                throw new CLASSES.NodicsError(
                    "ERR_AUTH_00001",
                    "Authentication binding is stale",
                );
        }
        return true;
    },
    /** Compares decoded token stamps, including capability-supplied bindings, with shared state. @param {Object} payload Verified token. @returns {Promise<boolean>} Current stamps. */
    validate: async function (payload) {
        SERVICE.DefaultAuthSecurityService.validateAuthorizationPolicy(payload);
        if (payload.securityBindings !== undefined)
            await this.validateBindings(payload.securityBindings);
        if (payload.sessionContext !== undefined) {
            const context = payload.sessionContext;
            if (
                payload.securityBindings === undefined ||
                payload.tokenType !== "access" ||
                !["human", "customer"].includes(payload.principalType) ||
                !context ||
                Object.keys(context).sort().join(",") !==
                    "code,owner,version" ||
                typeof context.owner !== "string" ||
                !/^[A-Za-z][A-Za-z0-9_.-]{0,127}$/.test(context.owner) ||
                typeof context.code !== "string" ||
                !/^[A-Za-z0-9_.:-]{1,192}$/.test(context.code) ||
                !Number.isSafeInteger(context.version) ||
                context.version < 1
            )
                throw new CLASSES.NodicsError("ERR_AUTH_00001");
        }
        // Typed independent proofs replace the ambiguous legacy tenant/login alias.
        if (payload.sessionContext !== undefined) return true;
        let policy = this.getPolicy();
        const runtimeBound = Boolean(payload.runtimeScope);
        if (policy.enabled === false && !runtimeBound)
            return Promise.resolve(true);
        let principalId = payload.loginId || payload.serviceId || payload.sub;
        if (!principalId || payload.authVersion === undefined) {
            return policy.allowMissingStamp === true && !runtimeBound
                ? Promise.resolve(true)
                : Promise.reject(
                      new CLASSES.NodicsError(
                          "ERR_AUTH_00001",
                          "Token security stamp is required",
                      ),
                  );
        }
        return SERVICE.DefaultAuthenticationProviderService.findToken(
            this.getCacheModuleName(),
            this.getKey(payload.tenant, principalId),
        )
            .then((stamp) => {
                if (
                    !stamp ||
                    String(stamp.authVersion) !== String(payload.authVersion)
                )
                    throw new CLASSES.NodicsError(
                        "ERR_AUTH_00001",
                        "Authentication token security stamp is stale",
                    );
                return true;
            })
            .catch((error) => {
                if (
                    !runtimeBound &&
                    (policy.failClosed === false ||
                        policy.allowMissingStamp === true)
                )
                    return true;
                throw error;
            });
    },
};
