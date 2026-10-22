/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
const historyWrites = new WeakSet();

/**
 * @module commerceSearchCore/service/defaultCommerceSearchPublicationService
 * @description Publishes approved Commerce Search rules into nSearch projections.
 * @layer service
 * @owner commerceSearchCore
 * @remarks Immutable Commerce Search history belongs to this owner. Only the exact in-flight insert
 * request is in the private WeakSet; overrides must not expose that identity or mutate prior history.
 * Inputs and outputs are specified on each exported member below.
 * Effects and failures remain in the existing owner flow; missing evidence is never synthetic success.
 * Exported members: protectHistory, protectHistoryMutation, assertSnapshotSource, snapshot, init,
 * postInit, policy, records, query, loadRules, publish.
 * @override Customize through the existing loader-visible module members, preserving private
 * authority.
 */
module.exports = {
    /**
     * Prevents generic schema/import writes from replacing retained publication evidence.
     * @param {Object} request Original owner request with tenant, authData and operation selectors;
     * payload is not authority.
     * @returns {boolean} True for the owner's exact currently admitted insert request.
     * @remarks Effects: Reads private request identity only; does not create a grant.
     * Failure behavior: Rejects generic, cloned or expired write requests.
     * @override Override through the effective module member; retain the original owner, scope and
     * evidence checks described above.
     */
    protectHistory: function (request) {
        if (!historyWrites.has(request)) throw new Error('Commerce Search history requires its publication owner');
        return true;
    },
    /**
     * Retains immutable historical versions.
     * @returns {never} Never returns: historical mutation is forbidden.
     * @remarks Effects: No persistence is performed.
     * Failure behavior: Always throws the immutable-history error.
     * @override Override through the effective module member; retain the original owner, scope and
     * evidence checks described above.
     */
    protectHistoryMutation: function () { throw new Error('Commerce Search publication history is immutable'); },
    /**
     * Validates retained history against the exact publication source.
     * @param {Object} request Original publication context containing tenant.
     * @param {Object} rule Approved rule containing its canonical code.
     * @param {string} sourceHash Projection identity retained by the version owner.
     * @param {Object[]} rows Complete bounded history read for that identity.
     * @returns {void} No result or effects when the single retained row matches.
     * @throws {Error} Missing, ambiguous, foreign or conflicting source evidence.
     * @override Preserve exact source binding; this predicate grants no history-write authority.
     */
    assertSnapshotSource: function (request, rule, sourceHash, rows) {
        if (rows.length !== 1 || rows[0].tenant !== request.tenant ||
            rows[0].ruleCode !== rule.code || rows[0].sourceHash !== sourceHash)
            throw new Error('Commerce Search history conflicts with its source');
    },
    /**
     * Retains one immutable approved snapshot before online projection/index effects.
     * @param {Object} request Original signed publication context and tenant.
     * @param {Object} rule Approved rule code and revision.
     * @param {Object} projection Canonical projection with deterministic sourceHash.
     * @returns {Promise<void>} Existing matching evidence or a completed insert.
     * @throws {Error} Unavailable owner, conflicting history or unresolved insert failure.
     * @override Replay and lost-acknowledgement checks dispatch through assertSnapshotSource.
     * The private WeakSet authorizes only the exact insert request during this call.
     */
    snapshot: async function (request, rule, projection) {
        const owner = SERVICE.DefaultCommerceSearchRuleVersionService;
        if (!owner?.get || !owner?.save) throw new Error('Commerce Search history owner is unavailable');
        const code = projection.sourceHash;
        const lookup = { tenant: request.tenant, authData: request.authData, query: { tenant: request.tenant, code },
            options: { recursive: false, skipItemCache: true }, searchOptions: { pageSize: 2, limit: 2 } };
        const existing = this.records(await owner.get(lookup));
        if (existing.length) { this.assertSnapshotSource(request, rule, code, existing); return; }
        const command = { tenant: request.tenant, authData: request.authData,
            options: { recursive: false, insertOnly: true },
            model: { code, tenant: request.tenant, ruleCode: rule.code, version: code, status: 'APPROVED',
                sourceHash: code, revision: rule.revision, snapshot: projection } };
        historyWrites.add(command);
        try { await owner.save(command); }
        catch (error) {
            const recovered = this.records(await owner.get(lookup));
            if (!recovered.length) throw error;
            this.assertSnapshotSource(request, rule, code, recovered);
        } finally { historyWrites.delete(command); }
    },
    /**
     * Initializes Commerce Search publication.
     *
     * @returns {Promise<boolean>} Resolves when initialization completes.
     */
    init: function () { return Promise.resolve(true); },
    /**
     * Runs post-initialization for Commerce Search publication.
     *
     * @returns {Promise<boolean>} Resolves when post-initialization completes.
     */
    postInit: function () { return Promise.resolve(true); },

    /**
     * Returns Commerce Search ranking policy from effective configuration.
     *
     * @returns {Object} Ranking policy.
     */
    policy: function () { return SERVICE.DefaultCommerceSearchPolicyService.policy(); },

    /**
     * Normalizes model service responses into Commerce Search rule records.
     *
     * @param {*} response Model service response.
     * @returns {Object[]} Rule records.
     */
    records: function (response) {
        if (Array.isArray(response)) return response;
        if (response && Array.isArray(response.result)) return response.result;
        if (response && response.data && Array.isArray(response.data.result)) return response.data.result;
        if (response && response.data && Array.isArray(response.data)) return response.data;
        return [];
    },

    /**
     * Builds the staged rule publication query.
     *
     * @param {Object} request Publication request.
     * @param {Object} input Operator payload.
     * @returns {Object} Query object.
     */
    query: function (request, input) {
        let query = { tenant: request.tenant, status: { $in: ['APPROVED', 'PUBLISHED'] } };
        if (input.storeCode) query.storeCode = input.storeCode;
        if (input.locale) query.locale = input.locale;
        if (Array.isArray(input.ruleCodes) && input.ruleCodes.length > 0) query.code = { $in: input.ruleCodes };
        return query;
    },

    /**
     * Loads approved staged rules for publication.
     *
     * @param {Object} request Publication request.
     * @param {Object} input Operator payload.
     * @returns {Promise<Object[]>} Approved rule records.
     */
    loadRules: async function (request, input) {
        let maximum = this.policy().maximumRulesPerRequest;
        let response = await SERVICE.DefaultCommerceSearchRuleService.get({
            tenant: request.tenant,
            authData: request.authData,
            query: this.query(request, input || {}),
            searchOptions: { pageSize: maximum + 1, pageNumber: 1 }
        });
        let rules = this.records(response);
        if (rules.length > maximum) throw new Error('Commerce Search publication batch exceeds configured limit');
        return rules;
    },

    /**
     * Publishes approved rules into online projections and the search index.
     *
     * @param {Object} request Publication request.
     * @param {Object} input Operator payload.
     * @returns {Promise<Object>} Publication summary.
     */
    publish: async function (request, input) {
        if (!request || !request.tenant) throw new Error('Tenant is required for Commerce Search publication');
        let rules = await this.loadRules(request, input || {});
        let projections = [];
        for (let rule of rules) {
            if (rule.benefitRef) {
                if (!SERVICE.DefaultCommerceSearchBenefitService) throw new Error('Commercial benefit owner is unavailable');
                await SERVICE.DefaultCommerceSearchBenefitService.validatePublication(request, rule);
            }
            let model = SERVICE.DefaultCommerceSearchProjectionBuilderService.build(request, rule);
            await this.snapshot(request, rule, model);
            await SERVICE.DefaultCommerceSearchRuleProjectionService.save({ tenant: request.tenant, authData: request.authData, model: model });
            await SERVICE.DefaultCommerceSearchRuleProjectionService.doSave({
                tenant: request.tenant,
                moduleName: 'commerceSearchCore',
                indexName: this.policy().searchIndexName,
                model: model,
                searchOptions: {}
            });
            projections.push(model);
        }
        return {
            tenant: request.tenant,
            requested: rules.length,
            published: projections.length,
            projectionCount: projections.length,
            rules: projections.map(projection => ({ ruleCode: projection.code, status: projection.status }))
        };
    }
};
