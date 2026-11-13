/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module discoveryPublication/service/defaultDiscoveryGenerationOwnerService @description Owns exact manifest reads, canonical initialization and validated revision CAS through generated persistence. @layer service @owner discoveryPublication */
module.exports = {
    /** Admits trusted tenant/context and reconstructs the immutable scope; never accepts caller code or persistence options.
     * @param {Object} request Authenticated capability request.
     * @returns {Object} Canonical persistence request and domain scope.
     * @throws {Error} Nonowner execution, invalid identity or scope.
     */
    context: function (request) {
        const dms = SERVICE.DefaultModuleService;
        if (!dms.isLocalModuleActive('discoveryPublication') || !dms.isCurrentRuntimeAuthority(SERVICE.DefaultDiscoveryGenerationTransportService.targetAuthority())) throw new Error('Discovery generation owner unavailable');
        if (!request.authData || !request.scope || Object.keys(request.scope).some(key => !['indexName', 'indexConfigurationCode', 'ownerType', 'ownerCode'].includes(key))) throw new Error('Invalid Discovery generation context');
        const domain = {...request.scope, tenant: request.tenant, guardedWrites: request.guardedWrites === true};
        const scope = SERVICE.DefaultDiscoveryGenerationPublicationService.scope(domain);
        return {domain, scope, persistence: {tenant: request.tenant, authData: request.authData,
            ...(domain.guardedWrites ? {internalPersistence: 'DURABLE_JOURNAL'} : {})}};
    },
    /** Reads one exact scope with bounded result count and no cache fallback.
     * @param {Object} request Owner request.
     * @returns {Promise<Object>} Generated read envelope.
     * @throws {Error} Admission or persistence failure.
     */
    read: function (request) {
        const {scope, persistence} = this.context(request);
        return SERVICE.DefaultDiscoveryGenerationService.get({...persistence, query: scope, options: {skipItemCache: true}, searchOptions: {pageSize: 2, pageNumber: 1}});
    },
    /** Initializes only a canonical empty manifest; the unique index arbitrates concurrent initialization.
     * @param {Object} request Owner request.
     * @returns {Promise<Object>} Insert acknowledgement.
     * @throws {Error} Admission, duplicate or persistence failure.
     */
    initialize: function (request) {
        const {scope, persistence} = this.context(request);
        return SERVICE.DefaultDiscoveryGenerationService.save({...persistence, options: {insertOnly: true}, model: {
            ...scope, active: true, revision: 0, currentGeneration: null, pendingGeneration: null,
            obsoleteGenerations: [], publishedObsoleteGenerations: [], updatedAt: new Date()
        }});
    },
    /** Rereads current evidence and applies a bounded, validated patch under exact revision CAS.
     * @param {Object} request Expected revision and domain-produced transition.
     * @returns {Promise<Object>} Original CAS acknowledgement.
     * @throws {Error} Stale revision, invalid evidence, protocol downgrade or persistence failure.
     */
    advance: async function (request) {
        const {scope, persistence, domain} = this.context(request);
        const validator = SERVICE.DefaultDiscoveryGenerationPublicationService;
        const patch = request.patch;
        const keys = ['currentGeneration', 'pendingGeneration', 'obsoleteGenerations', 'publishedObsoleteGenerations', 'retiredWriters', 'revision', 'updatedAt'];
        if (!Number.isSafeInteger(request.expectedRevision) || request.expectedRevision < 0 || !patch ||
            Object.keys(patch).some(key => !keys.includes(key)) || patch.revision !== request.expectedRevision + 1) throw new Error('Invalid Discovery generation transition');
        const response = await this.read(request);
        if (!validator.acknowledged(response) || !Array.isArray(response.result) || response.result.length !== 1) throw new Error('DISCOVERY_GENERATION_READ_UNCONFIRMED');
        const current = validator.validate(response.result[0], scope);
        if (current.revision !== request.expectedRevision) throw new Error('DISCOVERY_GENERATION_REVIEW_STALE');
        validator.assertGuarded(domain, current);
        const model = {...patch, updatedAt: new Date()};
        const next = validator.validate({...current, ...model}, scope);
        validator.assertGuarded(domain, next);
        return SERVICE.DefaultDiscoveryGenerationService.update({...persistence, query: {...scope, revision: request.expectedRevision}, model});
    }
};
