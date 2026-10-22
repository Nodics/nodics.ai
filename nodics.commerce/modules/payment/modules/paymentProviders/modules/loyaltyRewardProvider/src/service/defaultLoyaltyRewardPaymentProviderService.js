/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
const { isDeepStrictEqual } = require('node:util');

/**
 * @module loyaltyRewardProvider/src/service/defaultLoyaltyRewardPaymentProviderService
 * @description Adapts Payment AUTHORIZE/CAPTURE/VOID/REFUND to owner-validated Loyalty reserve/capture/release/reverse evidence; selected auctions delegate to their dedicated adapter.
 * @layer service
 * @owner loyaltyRewardProvider
 * Inputs are Payment requests with original context, stable keys and wallet/hold/entry references. Helpers return mappings; execute returns a frozen provider result backed by actual owner evidence.
 * Profile/wallet admission performs reads; invokeLoyalty/execute can cause financial effects in Loyalty. Later evidence failure does not undo an already committed operation.
 * Invalid settings, authority, missing references and mismatched receipts throw/reject. No direct ledger writes, success synthesis or callback interface is provided.
 * @override Later modules may replace effective mapping/normalization members while retaining original authority, exact receipt validation, stable keys and dedicated auction routing.
 */
module.exports = {
    code: 'loyalty-reward-points',
    supportedOperations: ['AUTHORIZE', 'CAPTURE', 'VOID', 'REFUND'],
    /**
     * Validates the effective enabled provider and transport settings.
     * @returns {Object} The existing configured object, not a clone or synthesized fallback.
     * @throws {Error} Rejects disabled/missing provider identifiers, target coordinates/bounds or Loyalty connection type.
     * @sideEffects Reads CONFIG only; does not enable or qualify providers.
     * @override Keep required owner fields and complete target validation; actual deployment choices remain configuration.
     */
    providerConfig: function () {
        const configured = typeof CONFIG !== 'undefined' && CONFIG.get('loyaltyRewardProvider');
        if (configured?.enabled !== true || ['providerCode', 'programCode', 'rewardTypeCode'].some(key => typeof configured[key] !== 'string' || !configured[key])) this.fail('Reward provider configuration is unavailable');
        for (const target of [configured.loyaltyTarget, configured.profileTarget])
            if (!target || ['moduleName', 'connectionName', 'apiVersion'].some(key => typeof target[key] !== 'string' || !target[key]) ||
                !target.targetAuthority || !Number.isSafeInteger(target.timeoutMs) || target.timeoutMs < 1 ||
                !Number.isSafeInteger(target.maxAttempts) || target.maxAttempts < 1) this.fail('Reward provider target is unavailable');
        if (typeof configured.loyaltyTarget.connectionType !== 'string' || !configured.loyaltyTarget.connectionType) this.fail('Reward provider connection is unavailable');
        return configured;
    },
    /**
     * Stops the provider operation with an error.
     * @param {string} message Failure description.
     * @returns {never} Always throws.
     * @throws {Error} Error containing the supplied message.
     * @sideEffects None; does not compensate earlier owner effects.
     * @override Preserve throwing behavior and caller-owned recovery.
     */
    fail: function (message) {
        throw new Error(message);
    },
    /**
     * Rejects an absent or blank required value.
     * @param {*} value Candidate value; nonblank non-string values are not coerced on return.
     * @param {string} name Field name used in the error.
     * @returns {*} Original value when present.
     * @throws {Error} Rejects undefined, null or a blank string representation.
     * @sideEffects None.
     * @override Preserve missing-value rejection; domain type validation remains with consuming owners.
     */
    required: function (value, name) {
        if (value === undefined || value === null || String(value).trim() === '') this.fail(name + ' is required');
        return value;
    },
    /**
     * Selects the existing payment operation key.
     * @param {Object} request Request with optional payload.idempotencyKey.
     * @returns {string|undefined} Top-level truthy key, otherwise payload key; not validated here.
     * @sideEffects None.
     * @throws {Error} Invalid request access errors propagate; missing keys return undefined.
     * @override Preserve existing precedence and original-key replay; never generate a replacement key.
     */
    idempotencyKey: function (request) {
        return request.idempotencyKey || request.payload && request.payload.idempotencyKey;
    },
    /**
     * Selects tracing identity without creating a new payment command.
     * @param {Object} request Request and optional payload correlation identifiers.
     * @returns {string|undefined} Top-level correlationId, payload correlationId, or selected operation key.
     * @throws {Error} Propagates invalid request/helper failures.
     * @sideEffects None.
     * @override Retain this.idempotencyKey fallback and do not treat correlation as authorization.
     */
    correlationId: function (request) {
        return request.correlationId || request.payload && request.payload.correlationId || this.idempotencyKey(request);
    },
    /**
     * Selects the existing Loyalty target reference.
     * @param {Object} request Request/payload Order or Cart selectors and original key.
     * @returns {string|undefined} Top-level Order, Cart, payload Order/Cart, then operation key in that order.
     * @throws {Error} Propagates invalid request/helper failures.
     * @sideEffects None; does not resolve or authorize target ownership.
     * @override Preserve retained reference precedence; owner checks remain separate.
     */
    targetCode: function (request) {
        return request.orderCode || request.cartCode || request.payload && (request.payload.orderCode || request.payload.cartCode) || this.idempotencyKey(request);
    },
    /**
     * Selects movement provenance from the payment context.
     * @param {Object} request Top-level paymentTransactionCode, Order/Cart codes and original key.
     * @returns {string|undefined} First truthy payment, Order, Cart or operation reference.
     * @throws {Error} Propagates invalid request/helper failures.
     * @sideEffects None; does not write movement evidence.
     * @override Keep provenance stable on replay; do not replace the original payment identity.
     */
    paymentSourceCode: function (request) {
        return request.paymentTransactionCode || request.orderCode || request.cartCode || this.idempotencyKey(request);
    },
    /**
     * Unwraps at most eight Loyalty data/result envelopes.
     * @param {*} response Raw owner response; arrays stop unwrapping.
     * @returns {*} Value reached without synthesizing accounting evidence.
     * @throws {Error} Rejects detected error, false success, ERR code or malformed/nonempty errors.
     * @sideEffects None; response is not mutated.
     * @override Preserve bounded error-aware unwrapping; validateEvidence owns receipt checks.
     */
    normalizeLoyaltyResponse: function (response) {
        for (let i = 0; i < 8 && response && !Array.isArray(response); i++) {
            if (response.error || response.success === false || /^ERR_/.test(response.code || '') || response.errors && (!Array.isArray(response.errors) || response.errors.length)) this.fail('Reward owner evidence could not be confirmed');
            if (response.data !== undefined) response = response.data;
            else if (response.result !== undefined) response = response.result;
            else return response;
        }
        return response;
    },
    /**
     * Selects the actual owner reference for a payment result.
     * @param {string} operation AUTHORIZE, CAPTURE, VOID or REFUND.
     * @param {*} response Loyalty response to normalize.
     * @returns {string|undefined} Reservation/capture/release/reversal reference using operation-specific owner fields; absent/unknown mappings return undefined.
     * @throws {Error} Propagates normalization refusal.
     * @sideEffects None; does not confirm settlement by itself.
     * @override Preserve actual receipt provenance and do not manufacture missing references.
     */
    referenceFor: function (operation, response) {
        let result = this.normalizeLoyaltyResponse(response) || {};
        if (operation === 'AUTHORIZE') return result.reservation && result.reservation.code || result.ledgerEntry && result.ledgerEntry.reservationCode;
        if (operation === 'CAPTURE') return result.ledgerEntry && result.ledgerEntry.code || result.redemption && result.redemption.captureLedgerEntryCode;
        if (operation === 'VOID') return result.ledgerEntry && result.ledgerEntry.code || result.reservation && result.reservation.code;
        if (operation === 'REFUND') return result.ledgerEntry && result.ledgerEntry.code;
        return undefined;
    },
    /**
     * Validates exact ledger and reservation joins for the dispatched payment.
     * @param {string} operation Supported Payment operation.
     * @param {Object} payload Original wallet/program/type, amount, provenance, key and hold/reversal reference.
     * @param {*} response Owner response containing ledgerEntry and applicable reservation.
     * @returns {Object} Normalized evidence only after matching original selectors, amount and operation-specific receipt fields.
     * @throws {Error} Rejects incorrect entry type/amount/provenance/key, reservation status/reference or reversal target; dependency errors propagate.
     * @sideEffects None; validation does not undo owner effects already dispatched.
     * @override Preserve exact comparison and original accounting joins; never replace uncertainty with a successful status.
     */
    validateEvidence: function (operation, payload, response) {
        const result = this.normalizeLoyaltyResponse(response), entry = result?.ledgerEntry;
        const expected = { AUTHORIZE: 'RESERVE', CAPTURE: 'CAPTURE', VOID: 'RELEASE', REFUND: 'REVERSE' }[operation];
        const exact = SERVICE.DefaultExactAmountService;
        if (!entry || typeof entry.code !== 'string' || !entry.code || entry.entryType !== expected ||
            ['walletCode', 'programCode', 'rewardTypeCode', 'sourceType', 'sourceCode', 'targetType', 'targetCode', 'idempotencyKey']
                .some(key => entry[key] !== payload[key]) || !exact?.compare || exact.compare(entry.amount, payload.amount) !== 0)
            this.fail('Reward accounting evidence does not match the original payment');
        if (operation === 'AUTHORIZE') {
            const reservation = result.reservation;
            if (!reservation || reservation.code !== entry.reservationCode || reservation.status !== 'RESERVED' ||
                ['walletCode', 'programCode', 'rewardTypeCode', 'sourceType', 'sourceCode', 'targetType', 'targetCode']
                    .some(key => reservation[key] !== payload[key]) || exact.compare(reservation.amount, payload.amount) !== 0)
                this.fail('Reward reservation evidence could not be confirmed');
        } else if (operation === 'CAPTURE' || operation === 'VOID') {
            if (entry.reservationCode !== payload.reservationCode || result.reservation &&
                (result.reservation.code !== payload.reservationCode || result.reservation.status !== (operation === 'CAPTURE' ? 'CAPTURED' : 'RELEASED')))
                this.fail('Reward reservation outcome does not match the original hold');
        } else if (entry.reversalOfEntryCode !== payload.reversalOfEntryCode)
            this.fail('Reward reversal does not match the original entry');
        return result;
    },
    /**
     * Maps an operation to its successful Payment status vocabulary.
     * @param {string} operation Payment operation name.
     * @returns {string|undefined} AUTHORIZED, CAPTURED, VOIDED or REFUNDED; undefined for an unknown operation.
     * @throws {never} No explicit rejection for supported operation strings; execute owns admission.
     * @sideEffects None; mapping alone proves no settlement.
     * @override Preserve Payment status semantics and require validated owner evidence before use.
     */
    statusFor: function (operation) {
        return { AUTHORIZE: 'AUTHORIZED', CAPTURE: 'CAPTURED', VOID: 'VOIDED', REFUND: 'REFUNDED' }[operation];
    },
    /**
     * Builds Loyalty operation input from Payment context and effective defaults.
     * @param {Object} request Original tenant/auth, payment references and optional payload overrides.
     * @param {string} operation Supported Payment operation controlling hold/reversal fields.
     * @returns {Object} New payload with wallet/reward terms, PAYMENT provenance, target, original keys and authData reference.
     * @throws {Error} Propagates invalid provider configuration and helper/input failures; required-field checks occur in execute.
     * @sideEffects Reads configuration only; does not mutate the request or validate wallet ownership.
     * @override Preserve selector precedence and stable provenance; do not introduce a second funds authority.
     */
    loyaltyPayload: function (request, operation) {
        let config = this.providerConfig();
        let payload = request.payload || {};
        let model = {
            tenant: request.tenant || request.authData && request.authData.tenant,
            walletCode: payload.walletCode || request.walletCode,
            programCode: payload.programCode || request.programCode || config.programCode,
            rewardTypeCode: payload.rewardTypeCode || request.rewardTypeCode || config.rewardTypeCode,
            amount: payload.amount || request.amount,
            sourceType: 'PAYMENT',
            sourceCode: payload.sourceCode || request.sourceCode || this.paymentSourceCode(request),
            targetType: payload.targetType || request.targetType || (request.orderCode ? 'ORDER' : 'CART'),
            targetCode: payload.targetCode || request.targetCode || this.targetCode(request),
            idempotencyKey: this.idempotencyKey(request),
            correlationId: this.correlationId(request),
            authData: request.authData
        };
        if (operation !== 'AUTHORIZE') {
            model.reservationCode = payload.reservationCode || request.reservationCode || request.providerReference;
        }
        if (operation === 'REFUND') {
            model.reversalOfEntryCode = payload.reversalOfEntryCode || request.reversalOfEntryCode || request.providerReference;
        }
        return model;
    },
    /**
     * Maps an operation and original reference to a Loyalty route.
     * @param {string} operation AUTHORIZE, CAPTURE, VOID or REFUND.
     * @param {Object} payload Original reservationCode or reversalOfEntryCode as required.
     * @returns {string} Owner reservation, capture, release or reverse path with encoded reference.
     * @throws {Error} Rejects unsupported operation; malformed URI encoding may propagate.
     * @sideEffects None; does not call the route.
     * @override Preserve protected owner paths and original reference encoding.
     */
    apiName: function (operation, payload) {
        if (operation === 'AUTHORIZE') return '/reward-reservations';
        if (operation === 'CAPTURE') return '/reward-reservations/' + encodeURIComponent(payload.reservationCode) + '/capture';
        if (operation === 'VOID') return '/reward-reservations/' + encodeURIComponent(payload.reservationCode) + '/release';
        if (operation === 'REFUND') return '/reward-ledger-entries/' + encodeURIComponent(payload.reversalOfEntryCode) + '/reverse';
        this.fail('Unsupported loyalty reward payment operation');
    },
    /**
     * Maps Payment operations to Loyalty owner method names.
     * @param {string} operation Payment operation name.
     * @returns {string|undefined} reserve, capture, release or reverse; undefined when unmapped.
     * @throws {never} No explicit rejection for supported operation strings; execute owns admission.
     * @sideEffects None.
     * @override Preserve the corresponding owner operation semantics.
     */
    operationName: function (operation) {
        return { AUTHORIZE: 'reserve', CAPTURE: 'capture', VOID: 'release', REFUND: 'reverse' }[operation];
    },
    /**
     * Dispatches a configured Loyalty operation with stable original keys.
     * @param {Object} request Original Payment auth context.
     * @param {string} operation Supported Payment operation.
     * @param {Object} payload Built original Loyalty terms and provenance.
     * @returns {Promise<*>} Raw DefaultModuleService owner response, not yet validated settlement.
     * @throws {Error} Configuration/route failures throw; transport or owner failures may reject.
     * @sideEffects Sends a Loyalty POST that may reserve, capture, release or reverse funds; no local ledger writes or compensation.
     * @override Retain effective target policy, original key/context and downstream evidence validation.
     */
    invokeLoyalty: function (request, operation, payload) {
        let config = this.providerConfig();
        let target = config.loyaltyTarget || {};
        return SERVICE.DefaultModuleService.invokeModule({
            local: false,
            tenant: payload.tenant,
            moduleName: target.moduleName,
            connectionName: target.connectionName,
            connectionType: target.connectionType,
            targetAuthority: target.targetAuthority,
            apiVersion: target.apiVersion,
            apiName: this.apiName(operation, payload),
            methodName: 'POST',
            serviceName: 'DefaultLoyaltyRewardOperationService',
            operationName: this.operationName(operation),
            request: Object.assign({}, payload, { payload: payload, authData: request.authData }),
            requestBody: payload,
            idempotencyKey: payload.idempotencyKey,
            timeoutMs: target.timeoutMs,
            maxAttempts: target.maxAttempts
        });
    },
    /**
     * Checks original participant pins after asynchronous owner reads.
     * @param {Object} request Current Payment request; never modified.
     * @param {Object} original Detached auth, tenant, enterprise and authorization pins.
     * @returns {void} Returns when signed context and aliases remain unchanged.
     * @throws {Error} Rejects changed auth, tenant, Enterprise alias or credential.
     * @sideEffects None; does not mint private admission or refresh authorization.
     * @override Preserve every original pin and call after owner reads.
     */
    assertParticipantBinding: function (request, original) {
        const { auth, tenant, enterprise, authorization } = original;
        if (!isDeepStrictEqual(auth, request.authData) || request.tenant !== tenant ||
            request.authorization !== authorization || auth.tenant !== tenant ||
            [auth.enterpriseCode, auth.entCode, request.enterpriseCode, request.entCode]
                .some(value => value !== undefined && value !== enterprise))
            this.fail('Reward payment identity changed');
    },
    /**
     * Matches an admitted Profile scope for Enterprise reward payment.
     * @param {Object} scope Profile allow or deny scope.
     * @param {string} tenant Original signed tenant.
     * @param {string} enterprise Original represented Enterprise.
     * @param {string} permission Independently required checkout permission.
     * @returns {boolean} Qualified global, tenant or Enterprise match; false for absent or mismatched scope.
     * @throws {Error} Propagates permission matcher failures on admitted context.
     * @sideEffects None; no reads, grants or persistence changes.
     * @override Preserve wildcard qualifiers for both allow and deny; assertWalletOwner makes denial win.
     */
    matchesParticipantScope: function (scope, tenant, enterprise, permission) {
        const security = SERVICE.DefaultSecuredRequestPipelineService;
        if (!scope || scope.tenantCode && scope.tenantCode !== tenant ||
            scope.enterpriseCode && scope.enterpriseCode !== enterprise ||
            scope.capabilityCode && scope.capabilityCode !== '*' &&
                !['commerce', 'checkoutCore', 'loyaltyRewardProvider'].includes(scope.capabilityCode) ||
            scope.permissionCode && !security.isPermissionGranted(permission, [scope.permissionCode], {})) return false;
        return scope.scopeType === 'GLOBAL' && scope.scopeCode === '*' ||
            scope.scopeType === 'TENANT' && scope.scopeCode === tenant ||
            scope.scopeType === 'ENTERPRISE' && scope.scopeCode === enterprise;
    },
    /**
     * Checks participant wallet ownership before generic authorization.
     * @param {Object} request Original authData, tenant/Enterprise aliases and bearer authorization.
     * @param {string} walletCode Exact requested wallet identity.
     * @returns {Promise<void>} Resolves for a matching OPEN customer/Enterprise wallet not explicitly inactive, or returns early for an existing service principal with serviceAccountUserGroup.
     * @throws {Error} Rejects invalid participant bearer, Profile evidence, permission/scope denial, identity drift or foreign/inactive wallet; read failures propagate.
     * @sideEffects For customer/human callers, reads Profile then Loyalty and rechecks original pins; no funds or assignments are changed. The service-account branch skips those reads.
     * @override Preserve current service-account admission semantics and original-context checks; do not describe the shortcut as fresh wallet-owner proof.
     */
    assertWalletOwner: async function (request, walletCode) {
        const auth = structuredClone(request.authData || {}), tenant = request.tenant, authorization = request.authorization;
        const groups=(auth.userGroups||auth.groups||[]).map(g=>typeof g==='string'?g:g.code);
        if(auth.principalType==='service'&&groups.includes('serviceAccountUserGroup'))return;
        const enterprise = auth.entCode || auth.enterpriseCode;
        const original = { auth, tenant, enterprise, authorization };
        if (!['customer', 'human'].includes(auth.principalType) || auth.tokenType !== 'access' || auth.isSystem || !auth.loginId || !enterprise) this.fail('Authenticated participant is required for reward payment');
        if (typeof authorization !== 'string' || !/^Bearer\s+\S+$/i.test(authorization)) this.fail('Participant bearer authorization is required for reward payment');
        this.assertParticipantBinding(request, original);
        const config = this.providerConfig(), profileTarget = config.profileTarget;
        const profile = this.normalizeLoyaltyResponse(await SERVICE.DefaultModuleService.invokeModule({ ...profileTarget, local: false,
            tenant, header: { Authorization: authorization, 'X-Enterprise-Code': enterprise }, request: { tenant },
            apiName: auth.principalType === 'customer' ? '/customer/identity' : '/identity/scopes/me', methodName: 'GET' }));
        this.assertParticipantBinding(request, original);
        let ownerType, ownerCode;
        if (auth.principalType === 'customer') {
            if (profile?.contractVersion !== 1 || profile.tenant !== tenant || profile.enterpriseCode !== enterprise || profile.customer?.loginId !== auth.loginId || !profile.customer?.code) this.fail('Reward customer identity is unavailable');
            ownerType = 'CUSTOMER'; ownerCode = profile.customer.code;
        } else {
            const security = SERVICE.DefaultSecuredRequestPipelineService, permission = 'commerce.checkout.place';
            if (!security?.isPermissionGranted(permission, security.getGrantedPermissions(request), {}) || profile?.principalCode !== auth.loginId || !Array.isArray(profile.scopes) || !Array.isArray(profile.deniedScopes)) this.fail('Enterprise reward payment is not authorized');
            if (!profile.scopes.some(scope => this.matchesParticipantScope(scope, tenant, enterprise, permission)) ||
                profile.deniedScopes.some(scope => this.matchesParticipantScope(scope, tenant, enterprise, permission)))
                this.fail('Enterprise reward payment is not authorized');
            ownerType = 'ENTERPRISE'; ownerCode = enterprise;
        }
        const target = config.loyaltyTarget;
        const projection = this.normalizeLoyaltyResponse(await SERVICE.DefaultModuleService.invokeModule({ ...target, local: false, tenant, request: { tenant }, apiName:'/wallets/'+encodeURIComponent(walletCode),methodName:'GET',requestBody:{} }));
        this.assertParticipantBinding(request, original);
        const wallet = projection && projection.wallet || projection;
        if (!wallet || wallet.code !== walletCode || wallet.status !== 'OPEN' || wallet.active === false || wallet.ownerType !== ownerType || wallet.ownerCode !== ownerCode) this.fail('Reward wallet is not available to this participant');
    },
    /**
     * Dispatches a supported payment and requires actual owner accounting evidence.
     * @param {Object} request Payment operation, original tenant/auth/key, wallet and hold/reversal references; optional auctionFunds binding.
     * @returns {Promise<Object>} Frozen generic {reference,status,providerCode,loyalty} result, or the dedicated auction adapter's result.
     * @throws {Error} Rejects unsupported/missing input, unbound auction identity or mismatched owner receipts; dispatched effects may still have committed.
     * @sideEffects Generic AUTHORIZE checks wallet ownership; generic operations POST financial commands to Loyalty. auctionFunds delegates before generic checks; no local ledger mutation or automatic rollback.
     * @override Preserve dedicated auction routing, original keys, required references and validateEvidence before reporting generic success.
     */
    execute: async function (request) {
        if (!request || !this.supportedOperations.includes(request.operation)) this.fail('Unsupported loyalty reward payment operation');
        if (request.auctionFunds) return SERVICE.DefaultLoyaltyAuctionPaymentProviderService.execute(request);
        if (typeof request.orderCode === 'string' && request.orderCode.startsWith('AUCTION_CHECKOUT_')) this.fail('Auction payment binding is required');
        this.required(request.tenant || request.authData && request.authData.tenant, 'tenant');
        this.required(this.idempotencyKey(request), 'idempotencyKey');
        let payload = this.loyaltyPayload(request, request.operation);
        this.required(payload.walletCode, 'walletCode');
        if (request.operation === 'AUTHORIZE') { this.required(payload.amount, 'amount'); await this.assertWalletOwner(request, payload.walletCode); }
        if (request.operation === 'CAPTURE' || request.operation === 'VOID') this.required(payload.reservationCode, 'reservationCode');
        if (request.operation === 'REFUND') this.required(payload.reversalOfEntryCode, 'reversalOfEntryCode');
        let response = await this.invokeLoyalty(request, request.operation, payload);
        this.validateEvidence(request.operation, payload, response);
        this.required(this.referenceFor(request.operation, response), 'Confirmed Loyalty operation reference');
        return Object.freeze({
            reference: this.referenceFor(request.operation, response),
            status: this.statusFor(request.operation),
            providerCode: this.providerConfig().providerCode,
            loyalty: this.normalizeLoyaltyResponse(response)
        });
    }
};
