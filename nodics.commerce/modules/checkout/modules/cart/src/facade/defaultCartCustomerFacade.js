/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
const { isDeepStrictEqual } = require('node:util');
/**
 * @module cart/src/facade/defaultCartCustomerFacade
 * @description Admits signed purchasing participants and delegates Cart operations in the retained merchant or selected-auction partition.
 * @layer facade
 * @owner cart
 * Inputs are original access-token requests with Cart/entry selectors and operation payloads; members return admitted contexts or Cart owner responses.
 * Profile and merchant/auction lookups are reads. Command members delegate Cart writes/calculation; failed downstream validation may follow a write.
 * Admission, drift, scope and owner-operation failures reject promises; no callback API or credential conversion is provided.
 * @override Override effective members through the layered facade; preserve fresh Profile admission, deny precedence, typed owner/actor separation and retained merchant binding.
 */
module.exports = {
    /**
     * Matches original Profile qualifiers for a purchasing participant.
     * @param {Object} scope Profile allow or deny scope, never caller payload.
     * @param {string} tenant Signed tenant.
     * @param {string} enterpriseCode Signed represented Enterprise.
     * @param {string} permission Independently required Commerce permission.
     * @returns {boolean} Whether all tenant/Enterprise/capability/permission qualifiers and scope coordinates match.
     * @throws {Error} Rejects malformed scope; permission matcher failures propagate.
     * @sideEffects None; matching neither grants access nor creates persistence authority.
     * @override Preserve wildcard capability semantics and deny precedence in resolveContext.
     */
    matchesParticipantScope: function (scope, tenant, enterpriseCode, permission) {
        if (!scope || typeof scope !== 'object') throw new Error('Enterprise scope is invalid');
        const security = SERVICE.DefaultSecuredRequestPipelineService;
        if (scope.tenantCode && scope.tenantCode !== tenant ||
            scope.enterpriseCode && scope.enterpriseCode !== enterpriseCode ||
            scope.capabilityCode && scope.capabilityCode !== '*' &&
                !['cart', 'checkoutCore', 'checkout', 'order'].includes(scope.capabilityCode) ||
            scope.permissionCode && !security.isPermissionGranted(permission, [scope.permissionCode], {})) return false;
        return scope.scopeType === 'GLOBAL' && scope.scopeCode === '*' ||
            scope.scopeType === 'TENANT' && scope.scopeCode === tenant ||
            scope.scopeType === 'ENTERPRISE' && scope.scopeCode === enterpriseCode;
    },
    /**
     * Resolves a canonical purchaser without converting an employee into a customer.
     * @param {Object} input Original authData, tenant/Enterprise aliases, bearer or HTTP request, and correlation identifiers.
     * @param {string} [permission='commerce.cart.own'] One supported Cart, Checkout, Order-read or lifecycle permission.
     * @returns {Promise<Object>} Shallow request copy with canonical ownerRef, actorRef, ownerId, participantEnterpriseCode and original authorization.
     * @throws {Error} Rejects missing/conflicting authority, permission denial, invalid transport, in-flight drift or invalid Profile evidence; transport errors propagate.
     * @sideEffects Performs one Profile identity/scope GET; does not persist records or mutate the input.
     * @override Preserve original signed context and current permission checks; human scopes resolve through this.matchesParticipantScope with deny precedence.
     */
    resolveContext: async function (input, permission = 'commerce.cart.own') {
        const auth = structuredClone(input.authData || {}), enterpriseCode = auth.enterpriseCode || auth.entCode;
        const authorization = input.authorization || input.httpRequest?.headers?.authorization || input.httpRequest?.headers?.Authorization;
        const tenant = auth.tenant, security = SERVICE.DefaultSecuredRequestPipelineService;
        const principalId = auth.principalId || auth.code || auth.loginId;
        if (!['commerce.cart.own', 'commerce.checkout.place', 'commerce.order.own.read', 'commerce.lifecycle.own.create'].includes(permission) ||
            !tenant || !enterpriseCode || !principalId || !auth.loginId || !authorization || auth.isSystem ||
            auth.tokenType !== 'access' || !['customer', 'human'].includes(auth.principalType) ||
            [input.tenant, input.tenantCode, auth.tenantCode].some(v => v !== undefined && v !== tenant) ||
            [auth.enterpriseCode, auth.entCode, input.enterpriseCode, input.entCode, input.httpRequest?.headers?.['x-enterprise-code'],
                input.httpRequest?.headers?.['X-Enterprise-Code'], input.httpRequest?.headers?.entCode]
                .some(v => v !== undefined && v !== enterpriseCode) ||
            !security?.isPermissionGranted(permission, security.getGrantedPermissions(input), {}))
            throw new Error('Original Commerce participant authority is required');
        const policy = structuredClone(CONFIG.get('cart')?.participation?.profile);
        if (!policy?.connectionName || !policy.targetAuthority || !Number.isSafeInteger(policy.timeoutMilliseconds) || policy.timeoutMilliseconds <= 0)
            throw new Error('Profile participant transport is unavailable');
        let result = await SERVICE.DefaultModuleService.invokeModule({ local: false, moduleName: 'profile',
            connectionName: policy.connectionName, targetAuthority: policy.targetAuthority,
            apiName: auth.principalType === 'customer' ? '/customer/identity' : '/identity/scopes/me',
            methodName: 'GET', tenant, request: { tenant },
            header: { Authorization: authorization, 'X-Enterprise-Code': enterpriseCode }, timeoutMs: policy.timeoutMilliseconds, maxAttempts: 1 });
        if (!isDeepStrictEqual(input.authData, auth) || !isDeepStrictEqual(policy, CONFIG.get('cart')?.participation?.profile) ||
            authorization !== (input.authorization || input.httpRequest?.headers?.authorization || input.httpRequest?.headers?.Authorization) ||
            [input.tenant, input.tenantCode].some(v => v !== undefined && v !== tenant) ||
            [input.enterpriseCode, input.entCode].some(v => v !== undefined && v !== enterpriseCode) ||
            !security.isPermissionGranted(permission, security.getGrantedPermissions(input), {}))
            throw new Error('Commerce participant authority changed');
        for (let n = 0; n < 8 && result; n++) {
            if (result.error || result.success === false || result.acknowledged === false || /^ERR_/.test(result.code || '') ||
                result.errors && (!Array.isArray(result.errors) || result.errors.length)) throw new Error('Profile participant evidence failed');
            if (result.data !== undefined) result = result.data;
            else if (result.result !== undefined) result = result.result;
            else break;
        }
        let ownerRef;
        if (auth.principalType === 'customer') {
            if (result?.contractVersion !== 1 || result.tenant !== tenant || result.enterpriseCode !== enterpriseCode ||
                result.customer?.loginId !== auth.loginId || typeof result.customer.code !== 'string' || !result.customer.code)
                throw new Error('Canonical customer owner is unavailable');
            ownerRef = { module: 'profile', schema: 'customer', code: result.customer.code };
        } else {
            if (result?.principalCode !== auth.loginId || !Array.isArray(result.scopes) || !Array.isArray(result.deniedScopes))
                throw new Error('Enterprise actor evidence is unavailable');
            if (!result.scopes.some(scope => this.matchesParticipantScope(scope, tenant, enterpriseCode, permission)) ||
                result.deniedScopes.some(scope => this.matchesParticipantScope(scope, tenant, enterpriseCode, permission)))
                throw new Error('Enterprise participant scope denied');
            ownerRef = { module: 'profile', schema: 'enterprise', code: enterpriseCode };
        }
        return { ...input, tenant, enterpriseCode, participantEnterpriseCode: enterpriseCode, authorization,
            ownerId: ownerRef.schema === 'enterprise' ? ownerRef.code : principalId, ownerRef,
            actorRef: { principalType: auth.principalType, code: principalId, loginId: auth.loginId, enterpriseCode },
            correlationId: input.correlationId || input.requestId };
    },
    /**
     * Selects merchant scope only after fresh signed participant admission.
     * @param {Object} request Original participant request and optional Cart/Order/command selectors.
     * @param {boolean} [create=false] Use Store-backed creation scope instead of retained Cart scope.
     * @returns {Promise<Object>} Admitted auction context when bound, otherwise merchant-scoped Cart context.
     * @throws {Error} Propagates identity, selected-auction and Store/retained-owner lookup failures.
     * @sideEffects Reads Profile and auction/merchant owners; no Cart write is dispatched here.
     * @override Retain this.resolveContext admission and use existing owner services; never accept a caller merchant partition.
     */
    context: async function (request, create = false) {
        const participant = await this.resolveContext(request);
        const selected = SERVICE.DefaultCheckoutAuctionService ? await SERVICE.DefaultCheckoutAuctionService.partition(participant) : participant;
        if (selected.auctionFunds) return selected;
        return SERVICE.DefaultCartMerchantScopeService[create ? 'create' : 'retained'](participant);
    },
    /**
     * Creates a Cart through its owning operation after participant and Store admission.
     * @param {Object} request Signed request with explicit Store and Cart creation payload.
     * @returns {Promise<Object>} Cart creation result from DefaultCartOperationService.
     * @throws {Error} Propagates context, validation and persistence failures.
     * @sideEffects May persist a Cart through the owner; no reservation or payment is performed here.
     * @override Keep this.context(request, true) before owner dispatch.
     */
    create: async function (request) { return SERVICE.DefaultCartOperationService.create(await this.context(request, true)); },
    /**
     * Reads an owned Cart through its retained merchant or auction context.
     * @param {Object} request Signed request selecting the saved Cart.
     * @returns {Promise<Object>} Cart owner read response.
     * @throws {Error} Propagates admission, ownership and Cart read failures.
     * @sideEffects Performs identity/scope and Cart reads; does not dispatch a Cart mutation.
     * @override Preserve this.context and the owner read boundary.
     */
    read: async function (request) { return SERVICE.DefaultCartOperationService.read(await this.context(request)); },
    /**
     * Adds an entry through the admitted Cart owner.
     * @param {Object} request Signed Cart selector and entry payload.
     * @returns {Promise<Object>} Owner entry-add response.
     * @throws {Error} Propagates admission, immutable-auction, validation and persistence failures.
     * @sideEffects May persist an entry before downstream response validation rejects; no local rollback is supplied.
     * @override Preserve this.context and Cart-owned entry validation; do not bypass selected-cart restrictions.
     */
    addEntry: async function (request) { return SERVICE.DefaultCartOperationService.addEntry(await this.context(request)); },
    /**
     * Updates an entry through the admitted Cart owner.
     * @param {Object} request Signed Cart/entry selectors and update payload.
     * @returns {Promise<Object>} Owner entry-update response.
     * @throws {Error} Propagates context, immutable-auction, validation and persistence failures.
     * @sideEffects May persist an entry update; later response rejection does not imply rollback.
     * @override Keep retained context and the owner's entry/revision checks.
     */
    updateEntry: async function (request) { return SERVICE.DefaultCartOperationService.updateEntry(await this.context(request)); },
    /**
     * Removes an entry through the admitted Cart owner.
     * @param {Object} request Signed Cart and entry selectors.
     * @returns {Promise<Object>} Owner entry-removal response.
     * @throws {Error} Propagates context, immutable-auction, validation and persistence failures.
     * @sideEffects Delegates entry removal to Cart; this facade does not compensate it.
     * @override Preserve this.context and owner mutation guards.
     */
    removeEntry: async function (request) { return SERVICE.DefaultCartOperationService.removeEntry(await this.context(request)); },
    /**
     * Delegates direct calculation for an admitted saved Cart.
     * @param {Object} request Signed Cart selector and calculation inputs accepted by the owner.
     * @returns {Promise<Object>} Cart calculation response.
     * @throws {Error} Propagates context, pricing/availability and calculation-owner failures.
     * @sideEffects Runs owner calculation and its configured reads/persistence; does not reserve stock or funds here.
     * @override Preserve this.context and calculateDirect ownership rather than introducing another calculator.
     */
    calculate: async function (request) { return SERVICE.DefaultCartOperationService.calculateDirect(await this.context(request)); }
};
