/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nService/service/module/DefaultRuntimeRegistryResolverService
 * @description Resolves runtime-owned module endpoints from observed leases before static server configuration is used.
 * @layer service
 * @owner nService
 * @override Projects may replace runtime owner scoring or discovery providers while preserving module-level target authority matching.
 */
module.exports = {
    _owners: [],
    _snapshot: { generatedAt: undefined, owners: [] },

    /** Completes the standard service initialization contract. */
    init: function () { return Promise.resolve(true); },
    /** Completes the standard service post-initialization contract. */
    postInit: function () { return Promise.resolve(true); },

    /** Validates authority using the existing DMS contract, without role aliases. */
    normalizeTargetAuthority: function (targetAuthority) {
        return require('./defaultModuleService').normalizeTargetAuthority(targetAuthority);
    },

    /** Stores a complete local owner snapshot, used by tests or embedded runtimes without BackOffice. */
    setOwners: function (owners) {
        this._owners = [].concat(owners || []).map(owner => this.normalizeOwner(owner)).filter(Boolean);
        this.refreshSnapshot(this._owners);
        return this.getOwners();
    },

    /** Registers or replaces one runtime owner in the local snapshot. */
    registerOwner: function (owner) {
        let normalized = this.normalizeOwner(owner);
        if (!normalized) return undefined;
        let key = this.getOwnerKey(normalized);
        this._owners = this._owners.filter(item => this.getOwnerKey(item) !== key);
        this._owners.push(normalized);
        this.refreshSnapshot(this._owners);
        return normalized;
    },

    /** Replaces the resolver snapshot used by already-running runtimes between heartbeats. */
    refreshSnapshot: function (owners) {
        this._snapshot = {
            generatedAt: new Date().toISOString(),
            owners: [].concat(owners || []).map(owner => this.normalizeOwner(owner)).filter(Boolean)
        };
        return this.getSnapshot();
    },

    /** Returns a defensive runtime-owner snapshot. */
    getSnapshot: function () {
        return {
            generatedAt: this._snapshot.generatedAt,
            owners: (this._snapshot.owners || []).map(owner => Object.assign({}, owner))
        };
    },

    /** Returns a defensive local owner snapshot. */
    getOwners: function () {
        return this._owners.map(owner => Object.assign({}, owner));
    },

    /** Builds one stable owner key from module and runtime-instance coordinates. */
    getOwnerKey: function (owner) {
        return [
            owner.moduleName,
            owner.instanceId || '',
            owner.environment || '',
            owner.server || '',
            owner.node || '',
            owner.endpoint || ''
        ].join(':');
    },

    /** Converts one observed lease or static owner into the resolver's common shape. */
    normalizeOwner: function (owner) {
        if (!owner || !owner.moduleName || !owner.endpoint) return undefined;
        return {
            moduleName: String(owner.moduleName),
            projectCode: owner.projectCode ? String(owner.projectCode) : undefined,
            connectionName: owner.connectionName ? String(owner.connectionName) : undefined,
            instanceId: owner.instanceId ? String(owner.instanceId) : undefined,
            environment: owner.environment ? String(owner.environment) : undefined,
            server: owner.server ? String(owner.server) : undefined,
            node: owner.node ? String(owner.node) : undefined,
            runtimeRole: owner.runtimeRole,
            endpoint: String(owner.endpoint),
            state: owner.state ? String(owner.state) : 'UP',
            lastSeenAt: owner.lastSeenAt,
            expiresAt: owner.expiresAt !== undefined ? Number(owner.expiresAt) : undefined,
            clientCallable: owner.clientCallable !== false,
            authorityClaims: Array.isArray(owner.authorityClaims) ? owner.authorityClaims.slice() : []
        };
    },

    /** Returns true when a runtime owner can satisfy the requested module and authority. */
    ownerMatches: function (options, owner) {
        if (!owner || owner.moduleName !== options.moduleName || !owner.endpoint) return false;
        if (owner.clientCallable === false) return false;
        if (['DOWN', 'UNAVAILABLE', 'DRAINED'].includes(String(owner.state || '').toUpperCase())) return false;
        if (owner.expiresAt !== undefined && Number(owner.expiresAt) <= Date.now()) return false;
        let authority = this.normalizeTargetAuthority(options.targetAuthority);
        if (authority.environment && String(authority.environment) !== String(owner.environment || '')) return false;
        if (authority.server && String(authority.server) !== String(owner.server || '')) return false;
        if (authority.node && String(authority.node) !== String(owner.node || '')) return false;
        if (authority.publication && authority.publication !== owner.runtimeRole?.publication) return false;
        if (options.connectionName && options.connectionName !== options.moduleName &&
            owner.connectionName && owner.connectionName !== options.connectionName &&
            owner.server !== options.connectionName) {
            return false;
        }
        return true;
    },

    /** Scores runtime owners so exact aliases and the freshest lease win consistently. */
    scoreOwner: function (options, owner) {
        let score = 0;
        if (options.connectionName && owner.connectionName === options.connectionName) score += 40;
        if (options.connectionName && owner.server === options.connectionName) score += 30;
        if (String(owner.state || '').toUpperCase() === 'UP') score += 20;
        if (owner.node) score += 2;
        return score;
    },

    /** Resolves a module owner from a supplied lease snapshot. */
    resolveFromOwners: function (options, owners) {
        this.normalizeTargetAuthority(options.targetAuthority);
        let candidates = [].concat(owners || [])
            .map(owner => this.normalizeOwner(owner))
            .filter(owner => this.ownerMatches(options, owner))
            .sort((left, right) =>
                this.scoreOwner(options, right) - this.scoreOwner(options, left) ||
                String(right.lastSeenAt || '').localeCompare(String(left.lastSeenAt || '')));
        const registration = require("./defaultModuleRegistrationAgentService");
        const runtimeLocal = registration.getModuleOwnershipScope(options.moduleName) === "runtimeLocal";
        if (runtimeLocal && candidates.length && !this.normalizeTargetAuthority(options.targetAuthority).server) {
            throw new Error('Runtime-local module resolution requires an explicit logical server: ' + options.moduleName);
        }
        const ownership = new Map();
        for (const candidate of candidates) {
            const key = JSON.stringify([candidate.projectCode || '', candidate.environment || '', candidate.moduleName,
                candidate.runtimeRole?.publication || '', ...(runtimeLocal ? [candidate.server] : [])]);
            const server = candidate.server || candidate.instanceId || candidate.endpoint;
            const previous = ownership.get(key);
            if (previous && previous !== server) throw new Error('Ambiguous runtime module owner: ' + candidate.moduleName);
            ownership.set(key, server);
        }
        const contexts = new Set(candidates.map(candidate => candidate.runtimeRole?.publication || ''));
        if (contexts.size > 1) throw new Error('Module resolution requires an explicit publication context: ' + options.moduleName);
        return candidates[0];
    },

    /** Resolves a runtime owner, delegating to BackOffice when it is available. */
    resolveOwner: function (options) {
        this.normalizeTargetAuthority(options.targetAuthority);
        let registry = SERVICE.DefaultBackofficeRegistryService;
        if (registry && registry !== this && typeof registry.resolveRuntimeOwner === 'function') {
            return registry.resolveRuntimeOwner(options);
        }
        let snapshot = this.getSnapshot();
        return Promise.resolve(this.resolveFromOwners(options, snapshot.owners.length ? snapshot.owners : this._owners));
    }
};
