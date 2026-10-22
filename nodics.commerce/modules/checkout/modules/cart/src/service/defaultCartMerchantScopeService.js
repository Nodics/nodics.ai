/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
const { isDeepStrictEqual: same } = require('node:util');
/**
 * @module cart/service/defaultCartMerchantScopeService
 * @description Resolves canonical selling scope separately from the freshly admitted purchasing
 * participant.
 * @owner cart
 * @layer service
 * @remarks Cart merchant scope is owner-derived after fresh Profile admission. Store placement selects
 * merchant partition; original purchaser auth/typed owner is preserved. Private generated Cart reads
 * are exact and bounded, not caller-controlled generic queries.
 * Inputs and outputs are specified on each exported member below.
 * Effects and failures remain in the existing owner flow; missing evidence is never synthetic success.
 * Exported members: state, identifier, participant, binding, records, cart, apply, create, retained.
 * @override Customize through the existing loader-visible module members, preserving private
 * authority.
 */
module.exports = {
    /**
     * Snapshots only serializable authority/selectors, never the HTTP socket or response object.
     * @param {Object} r Original admitted tenant/Enterprise request, preserving authData and private owner
     * context.
     * @returns {Object} Detached serializable authority/selector snapshot.
     * @remarks Effects: Copies only approved request fields; excludes sockets/responses.
     * Failure behavior: Rejects non-serializable admitted state rather than weakening drift checks.
     * @override Override through the effective module member; retain the original owner, scope and
     * evidence checks described above.
     */
    state: function (r) {
        return structuredClone({ authData: r.authData, tenant: r.tenant, enterpriseCode: r.enterpriseCode, entCode: r.entCode,
            participantEnterpriseCode: r.participantEnterpriseCode, ownerId: r.ownerId, ownerRef: r.ownerRef, actorRef: r.actorRef,
            authorization: r.authorization, cartCode: r.cartCode, orderCode: r.orderCode, commandCode: r.commandCode,
            storeCode: r.storeCode, payload: r.payload, query: r.query,
            headers: Object.fromEntries(['authorization', 'Authorization', 'x-enterprise-code', 'X-Enterprise-Code', 'tenant']
                .map(key => [key, r.httpRequest?.headers?.[key]])) });
    },
    /**
     * Rejects unsafe selectors before any owner lookup.
     * @param {Object} value Owner input value; exact shape is constrained by this operation's retained
     * source contract.
     * @returns {boolean} Whether the exact code uses the accepted bounded character format.
     * @remarks Effects: Pure selector check.
     * Failure behavior: Invalid types/unsafe codes return false.
     * @override Override through the effective module member; retain the original owner, scope and
     * evidence checks described above.
     */
    identifier: function (value) { return typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9_.:@|\-]{0,255}$/.test(value); },
    /**
     * Checks the original participant context, never accepting body identity or merchant aliases.
     * @param {Object} r Original admitted tenant/Enterprise request, preserving authData and private owner
     * context.
     * @returns {void} Completes when original participant/owner binding is valid.
     * @remarks Effects: Read-only signed-context validation.
     * Failure behavior: Rejects body identity, tenant/Enterprise drift or malformed typed participant.
     * @override Override through the effective module member; retain the original owner, scope and
     * evidence checks described above.
     */
    participant: function (r) {
        const a = r.authData || {}, enterprise = a.enterpriseCode || a.entCode;
        if (!this.identifier(r.tenant) || a.tenant !== r.tenant || !this.identifier(enterprise) || a.isSystem ||
            a.tokenType !== 'access' || !['customer', 'human'].includes(a.principalType) ||
            r.participantEnterpriseCode !== enterprise || !this.identifier(r.ownerId) ||
            r.ownerRef?.module !== 'profile' || !this.identifier(r.ownerRef.code) ||
            r.ownerRef.schema !== (a.principalType === 'human' ? 'enterprise' : 'customer') ||
            a.principalType === 'human' && (r.ownerId !== enterprise || r.ownerRef.code !== enterprise) ||
            a.principalType === 'customer' && r.ownerId !== (a.principalId || a.code || a.loginId) ||
            r.actorRef?.enterpriseCode !== enterprise || r.actorRef?.loginId !== a.loginId ||
            r.actorRef?.principalType !== a.principalType ||
            r.actorRef?.code !== (a.principalId || a.code || a.loginId)) throw new Error('Original purchase participant is required');
    },
    /**
     * Validates persisted Store evidence without consulting mutable current Store placement.
     * @param {Object} scope Owner input scope; exact shape is constrained by this operation's retained
     * source contract.
     * @returns {Object} Detached validated retained Store/merchant/revision binding.
     * @remarks Effects: Reads supplied persisted evidence only; no mutable Store fallback.
     * Failure behavior: Rejects missing/invalid Store identity, revision or merchant partition.
     * @override Override through the effective module member; retain the original owner, scope and
     * evidence checks described above.
     */
    binding: function (scope) {
        if (!scope || scope.contractVersion !== 1 || !this.identifier(scope.storeCode) || !this.identifier(scope.enterpriseCode) ||
            !Number.isSafeInteger(scope.revision) || scope.revision < 1) throw new Error('Retained merchant scope is unavailable');
        return structuredClone(scope);
    },
    /**
     * Validates a bounded generated read acknowledgement; absence is distinct from an uncertain read.
     * @param {Object} result Owner input result; exact shape is constrained by this operation's retained
     * source contract.
     * @returns {Object[]} Complete bounded acknowledged generated records.
     * @remarks Effects: Normalizes only successful exact reads.
     * Failure behavior: Rejects failed, partial, malformed or over-bound acknowledgements.
     * @override Override through the effective module member; retain the original owner, scope and
     * evidence checks described above.
     */
    records: function (result) {
        if (!result || typeof result.code !== 'string' || !/^SUC_/.test(result.code) || result.success === false || result.acknowledged === false || result.error ||
            result.errors && (!Array.isArray(result.errors) || result.errors.length) || !Array.isArray(result.result) ||
            result.count !== result.result.length || result.result.length > 1 || result.result.some(row => !row || typeof row !== 'object' || Array.isArray(row)) ||
            [result.total, result.totalCount].some(n => n !== undefined && n !== result.result.length))
            throw new Error('Purchase scope read is unconfirmed or ambiguous');
        return result.result;
    },
    /**
     * Fixed owner-bounded Cart lookup across merchant namespaces after Profile admission. No arbitrary
     * selectors escape this operation.
     * @param {Object} r Original admitted tenant/Enterprise request, preserving authData and private owner
     * context.
     * @param {string} code Exact original owner record code.
     * @returns {Promise<Object|undefined>} Exact owner-bound Cart across merchant namespaces, or confirmed
     * absence.
     * @remarks Effects: Private uncached bounded lookup after participant admission.
     * Failure behavior: Rejects duplicate, foreign, wrong-kind or changed participant evidence.
     * @override Override through the effective module member; retain the original owner, scope and
     * evidence checks described above.
     */
    cart: async function (r, code) {
        this.participant(r);
        if (!this.identifier(code)) throw new Error('Original Cart code is required');
        const snapshot = this.state(r);
        const rows = this.records(await SERVICE.DefaultCartService.get({ tenant: r.tenant,
            authData: SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
            query: { tenant: r.tenant, code, ownerId: r.ownerId },
            searchOptions: { pageSize: 2, limit: 2, pageNumber: 1 }, options: { recursive: false, skipItemCache: true } }));
        if (!same(this.state(r), snapshot)) throw new Error('Purchase participant changed during scope read');
        const row = rows[0];
        if (!row) return undefined;
        const scope = this.binding(row.merchantScope);
        if (row.code !== code || row.tenant !== r.tenant || row.ownerId !== r.ownerId || !same(row.ownerRef, r.ownerRef) ||
            row.participantEnterpriseCode !== r.participantEnterpriseCode || row.enterpriseCode !== scope.enterpriseCode ||
            row.storeCode !== scope.storeCode) throw new Error('Cart is unavailable to this participant');
        return row;
    },
    /**
     * Applies only owner evidence; any supplied Store selector must agree and cannot select a namespace.
     * @param {Object} r Original admitted tenant/Enterprise request, preserving authData and private owner
     * context.
     * @param {Object} evidence Owner input evidence; exact shape is constrained by this operation's
     * retained source contract.
     * @returns {Object} Original participant context augmented by validated merchant scope.
     * @remarks Effects: Copies context; does not change signed purchaser claims.
     * Failure behavior: Rejects conflicting caller Store selectors or invalid retained scope.
     * @override Override through the effective module member; retain the original owner, scope and
     * evidence checks described above.
     */
    apply: function (r, evidence) {
        const scope = this.binding(evidence);
        SERVICE.DefaultStoreContextService.resolveStoreCode(r, scope.storeCode);
        return { ...r, enterpriseCode: scope.enterpriseCode, storeCode: scope.storeCode, merchantScope: scope };
    },
    /**
     * Reads canonical operational Store placement with the runtime's own scoped credential, not the
     * shopper bearer.
     * @param {Object} r Original admitted tenant/Enterprise request, preserving authData and private owner
     * context.
     * @returns {Promise<Object>} Canonical merchant-bound creation context.
     * @remarks Effects: Reads operational Store with runtime credential and rechecks original participant
     * state.
     * Failure behavior: Rejects Store outage/foreign placement or authority mutation during read.
     * @override Override through the effective module member; retain the original owner, scope and
     * evidence checks described above.
     */
    create: async function (r) {
        this.participant(r);
        const storeCode = SERVICE.DefaultStoreContextService.resolveStoreCode(r);
        if (!this.identifier(storeCode)) throw new Error('Explicit Store code is invalid');
        const policy = structuredClone(CONFIG.get('cart')?.merchantScope?.storeTarget), snapshot = this.state(r);
        if (!this.identifier(policy?.connectionName) || !policy.targetAuthority || typeof policy.targetAuthority !== 'object' ||
            Array.isArray(policy.targetAuthority) || !this.identifier(policy.targetAuthority.runtimeRole) ||
            !Number.isSafeInteger(policy.timeoutMs) || policy.timeoutMs < 1)
            throw new Error('Store placement transport is unavailable');
        const token = NODICS.getInternalAuthToken(r.tenant);
        if (typeof token !== 'string' || !token) throw new Error('Store placement runtime credential is unavailable');
        let result = await SERVICE.DefaultModuleService.invokeModule({ ...policy, local: false, tenant: r.tenant,
            moduleName: 'store', apiName: '/internal/stores/placement', methodName: 'POST',
            requestBody: { contractVersion: 1, storeCode }, header: { Authorization: 'Bearer ' + token, tenant: r.tenant },
            maxAttempts: 1, followRedirects: false, rejectUnauthorized: true });
        for (let n = 0; n < 8 && result; n++) {
            if (result.error || result.success === false || result.acknowledged === false || /^ERR_/.test(result.code || '') ||
                result.errors && (!Array.isArray(result.errors) || result.errors.length)) throw new Error('Store placement failed');
            if (result.data !== undefined) result = result.data;
            else if (result.result !== undefined) result = result.result;
            else break;
        }
        if (!same(this.state(r), snapshot) || !same(policy, CONFIG.get('cart')?.merchantScope?.storeTarget) ||
            result?.contractVersion !== 1 || result.tenant !== r.tenant || result.store?.code !== storeCode ||
            result.store.active !== true || result.store.status !== 'ACTIVE') throw new Error('Canonical Store placement is unavailable');
        const scoped = this.apply(r, { contractVersion: 1, storeCode, enterpriseCode: result.store.enterpriseCode, revision: result.store.revision });
        const code = SERVICE.DefaultCartOperationService.cartCode(scoped), existing = await this.cart(r, code);
        if (existing && !same(existing.merchantScope, scoped.merchantScope)) throw new Error('Existing Cart merchant scope cannot change');
        return scoped;
    },
    /**
     * Resolves subsequent Cart and placement requests without a frontend Store selector.
     * @param {Object} r Original admitted tenant/Enterprise request, preserving authData and private owner
     * context.
     * @returns {Promise<Object>} Context bound to the original owned Cart's persisted merchant scope.
     * @remarks Effects: Reads existing Cart only; does not relocate under current Store configuration.
     * Failure behavior: Rejects absent or foreign Cart and malformed retained binding.
     * @override Override through the effective module member; retain the original owner, scope and
     * evidence checks described above.
     */
    retained: async function (r) {
        const row = await this.cart(r, r.cartCode || r.payload?.cartCode);
        if (!row) {
            const operation = SERVICE.DefaultCartOperationService;
            if (typeof operation?.accessDeniedError !== 'function') throw new Error('Cart access-denial owner is unavailable');
            throw operation.accessDeniedError();
        }
        return this.apply(r, row.merchantScope);
    }
};
