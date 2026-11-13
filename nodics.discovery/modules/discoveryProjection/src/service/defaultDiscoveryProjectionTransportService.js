/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/**
 * @module discoveryProjection/service/defaultDiscoveryProjectionTransportService
 * @description Fixed projection payload boundary, shared by local DMS and authenticated remote admission.
 * @layer service
 * @owner discoveryProjection
 */
module.exports = {
    /** Copies JSON data, rejecting executable objects and circular graphs instead of silently losing guards.
     * @param {*} value Transport value.
     * @returns {*} Independent JSON value.
     * @throws {Error} For executable, circular, non-finite or non-plain values.
     */
    data: function (value) {
        const visit = (item, ancestors) => {
            if (item instanceof Date && Number.isFinite(item.getTime())) return item.toISOString();
            if (item === null || ['string', 'boolean'].includes(typeof item)) return item;
            if (typeof item === 'number' && Number.isFinite(item)) return item;
            if (!item || typeof item !== 'object' || ancestors.has(item) ||
                (!Array.isArray(item) && Object.getPrototypeOf(item) !== Object.prototype)) {
                throw new Error('Discovery projection requires JSON data');
            }
            const next = new Set(ancestors); next.add(item);
            if (Array.isArray(item)) return item.map(child => visit(child, next));
            return Object.fromEntries(Object.entries(item).filter(([, child]) => child !== undefined).map(([key, child]) => [key, visit(child, next)]));
        };
        return visit(value, new Set());
    },
    /** Validates the exact obsolete-generation predicate produced by the publication owner.
     * @param {Object} query Removal predicate.
     * @param {string} tenant Trusted tenant.
     * @returns {void} Nothing on success.
     * @throws {Error} For broad, extra, missing or cross-tenant predicates.
     */
    generationQuery: function (query, tenant) {
        const keys = ['tenant.keyword', 'ownerType', 'indexConfigurationCode', 'payload.publicationOwner.keyword', 'payload.publicationGeneration.keyword'];
        const filters = query?.bool?.filter;
        if (!query || Object.keys(query).join() !== 'bool' || Object.keys(query.bool).join() !== 'filter' ||
            !Array.isArray(filters) || filters.length !== keys.length) throw new Error('Exact Discovery generation predicate required');
        const terms = {};
        for (const filter of filters) {
            if (!filter || Object.keys(filter).join() !== 'term' || !filter.term || Object.keys(filter.term).length !== 1) throw new Error('Exact Discovery generation predicate required');
            const [key, value] = Object.entries(filter.term)[0];
            if (!keys.includes(key) || Object.hasOwn(terms, key) || typeof value !== 'string' || !value) throw new Error('Exact Discovery generation predicate required');
            terms[key] = value;
        }
        if (terms['tenant.keyword'] !== tenant || !/^[a-f0-9-]{36}$/.test(terms['payload.publicationGeneration.keyword'])) throw new Error('Invalid Discovery generation scope');
    },
    /** Builds one bounded operation payload without caller identity, model handles or execution targets.
     * @param {string} operation Fixed operation.
     * @param {Object} request Domain request.
     * @returns {Object} Transport body.
     * @throws {Error} Invalid tenant, payload or operation.
     */
    body: function (operation, request) {
        const fields = {doDescribeIndex: [], doSave: ['model', 'models', 'options'], doSearch: ['query', 'searchRequest', 'searchOptions', 'options'], doRefresh: ['options'], doRemoveByQuery: ['query', 'options']};
        if (!Object.hasOwn(fields, operation) || !request || typeof request.tenant !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(request.tenant)) throw new Error('Invalid Discovery projection request');
        if (request.moduleName && request.moduleName !== 'discoveryProjection') throw new Error('Invalid Discovery projection module');
        const body = {tenant: request.tenant};
        if (request.indexName !== undefined) {
            if (typeof request.indexName !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(request.indexName)) throw new Error('Invalid Discovery logical index');
            body.indexName = request.indexName;
        }
        for (const key of fields[operation]) if (request[key] !== undefined) body[key] = this.data(request[key]);
        if (operation === 'doSave') {
            const models = body.models === undefined ? [body.model] : [].concat(body.models);
            if (!models.length || models.some(model => !model || model.tenant !== request.tenant)) throw new Error('Discovery projection document tenant mismatch');
        }
        if (operation === 'doRemoveByQuery') this.generationQuery(body.query, request.tenant);
        return body;
    },
    /** Executes only on the admitted owner and delegates provider mechanics unchanged.
     * @param {string} operation Fixed operation.
     * @param {Object} request Middleware or local domain request.
     * @returns {Promise<Object>} Owner acknowledgement.
     * @throws {Error} For invalid data, missing identity or owner denial.
     */
    execute: async function (operation, request) {
        const body = this.body(operation, request);
        if (!request.authData) throw new Error('Discovery projection actor required');
        return SERVICE.DefaultDiscoveryProjectionOwnerService[operation]({...body, authData: request.authData});
    },
    /** Describes an existing model binding. @param {Object} request Qualified request. @returns {Promise<Object>} Opaque binding. @throws {Error} Owner denial. */
    doDescribeIndex: function(request) {return this.execute('doDescribeIndex', request);},
    /** Saves scoped documents. @param {Object} request Owner request. @returns {Promise<Object>} Acknowledgement. @throws {Error} Invalid scope or denied owner. */
    doSave: function (request) { return this.execute('doSave', request); },
    /** Searches scoped data. @param {Object} request Owner request. @returns {Promise<Object>} Result. @throws {Error} Invalid scope or denied owner. */
    doSearch: function (request) { return this.execute('doSearch', request); },
    /** Refreshes index visibility. @param {Object} request Owner request. @returns {Promise<Object>} Acknowledgement. @throws {Error} Invalid scope or denied owner. */
    doRefresh: function (request) { return this.execute('doRefresh', request); },
    /** Removes one exact generation. @param {Object} request Owner request. @returns {Promise<Object>} Acknowledgement. @throws {Error} Invalid scope or denied owner. */
    doRemoveByQuery: function (request) { return this.execute('doRemoveByQuery', request); }
};
