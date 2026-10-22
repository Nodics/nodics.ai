/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module digitalCore/controller/defaultDigitalCommerceCustomerController
 * @description Maps participant HTTP requests to Digital facade members without inventing ownership.
 * Inputs: Signed routed requests, body/query/route selectors and optional error-first callbacks.
 * Outputs: {data} envelopes via Promise or callback; callback mode here returns undefined.
 * Effects: Normalizes request payload/query; selected members set no-store and invoke owner reads or
 * commands.
 * Failure behavior: Dispatch errors may throw; owner failures reject or reach callback. No local success
 * fallback.
 * Exported members: certificateHoldings, bundlePurchaseStatus, applyHttp, invoke,
 * listEntitlements, createBundle, sendGift, listGifts, decideGift, configureGifts, readParticipation,
 * participationStatus, listEntitlements, deliveryEvidence, revealEntitlement.
 * @owner digitalCore
 * @layer controller
 * @override Extend effective controller/facade members through module layering; retain original auth,
 * private reveal provenance and owner dispatch.
 * @see ../../llm/contracts/bundle-holdings-and-gifts.md
 */
module.exports = {
    /**
     * Returns a bounded owner-only certificate selection for purchases and bundle creation.
     * @param {Object} request Optional ownerRef and page; original bearer resolves the current participant.
     * Contains authData, tenant and retained business scope.
     * @param {function(Error|null, Object=):*} [callback] Optional Node-style callback receiving {data};
     * absent means return the Promise.
     * @returns {Promise<Object>|undefined} Bounded safe certificate holdings page. Wrapped as {data};
     * callback mode returns undefined.
     * @remarks Effects: Reads Profile and qualified certificate holdings; sets no-store at the controller.
     * Failure behavior: Foreign owner, invalid pagination or malformed remote evidence rejects. Owner
     * rejection reaches callback or returned Promise; synchronous dispatch errors can still throw.
     * @override Keep Profile admission and post-read reauthorization in the holdings owner.
     */
    certificateHoldings: function (request, callback) {
        request.httpResponse?.setHeader?.('Cache-Control', 'no-store');
        return this.invoke('certificateHoldings', request, callback);
    },
    /**
     * Reads authorized original bundle purchase status without exposing internal receipts.
     * @param {Object} request Original purchase selectors in payload and current buyer/seller authority.
     * Contains authData, tenant and retained business scope.
     * @param {function(Error|null, Object=):*} [callback] Optional Node-style callback receiving {data};
     * absent means return the Promise.
     * @returns {Promise<Object>|undefined} Allowlisted retained bundle purchase status. Wrapped as {data};
     * callback mode returns undefined.
     * @remarks Effects: Reads the settlement owner; sets no-store at the controller.
     * Failure behavior: Foreign participant or incomplete original purchase evidence rejects. Owner
     * rejection reaches callback or returned Promise; synchronous dispatch errors can still throw.
     * @override Keep buyer/seller admission and receipt redaction in settlement.
     */
    bundlePurchaseStatus: function (request, callback) {
        request.httpResponse?.setHeader?.('Cache-Control', 'no-store');
        return this.invoke('bundlePurchaseStatus', request, callback);
    },
    /**
     * Applies route params, query, and body values to a customer Digital Commerce request.
     * @param {Object} request Mutable routed request with optional httpRequest.params/body/query and
     * entitlementCode.
     * @returns {Object} The same request after route entitlement, copied payload and merged query
     * assignment.
     * @remarks Effects: Pins tenant/Enterprise/bearer scope to signed route authority, then mutates
     * request.entitlementCode, payload and query only; performs no authorization or I/O.
     * Failure behavior: Assumes an object request; malformed input can throw during property access.
     * @override Route entitlement takes precedence; preserve signed auth fields and defer ownership checks.
     */
    applyHttp: function (request) {
        const http = request.httpRequest || {};
        const params = http.params || {};
        const auth = request.authData || {};
        request.tenant = auth.tenant;
        request.enterpriseCode = auth.enterpriseCode || auth.entCode;
        request.authorization = request.authorization || http.headers?.authorization || http.headers?.Authorization;
        request.entitlementCode = params.entitlementCode || request.entitlementCode;
        request.payload = Object.assign({}, http.body || request.payload || {}, request.entitlementCode ? { entitlementCode: request.entitlementCode } : {});
        request.query = Object.assign({}, request.query || {}, http.query || {});
        return request;
    },
    /**
     * Invokes a customer Digital Commerce facade operation.
     * @param {string} operation Fixed controller-selected facade member, never an HTTP-supplied method name.
     * @param {Object} request Original routed request normalized in place by applyHttp.
     * @param {function(Error|null, Object=):*} [callback] Receives facade failure or (null, {data}); omitted
     * returns the work Promise.
     * @returns {Promise<Object>|undefined} Facade result in {data}, or undefined after callback handlers are
     * attached.
     * @remarks Effects: Normalizes request and invokes the selected facade; owner-specific reads/writes
     * occur there.
     * Failure behavior: Synchronous normalization/dispatch failures throw; facade rejections reach callback
     * or returned Promise.
     * @override Keep fixed facade dispatch and propagate errors; do not grant authority while normalizing
     * HTTP fields.
     */
    invoke: function (operation, request, callback) {
        const promise = FACADE.DefaultDigitalCommerceCustomerFacade[operation](this.applyHttp(request)).then(data => ({ data }));
        if (!callback) return promise;
        promise.then(value => callback(null, value)).catch(callback);
    },
    /**
     * Lists customer-owned digital entitlements.
     * @param {Object} request Original signed buyer context and bounded entitlement query. Contains
     * authData, tenant and retained business scope.
     * @param {function(Error|null, Object=):*} [callback] Optional Node-style callback receiving {data};
     * absent means return the Promise.
     * @returns {Promise<Object>|undefined} Current buyer-owned entitlement projection. Wrapped as {data};
     * callback mode returns undefined.
     * @remarks Effects: Resolves fresh listContext and reads owner-filtered entitlements.
     * Failure behavior: Denied buyer, ambiguous cross-merchant discovery or invalid evidence rejects. Owner
     * rejection reaches callback or returned Promise; synchronous dispatch errors can still throw.
     * @override Retain typed buyer authority separately from merchant storage placement.
     */
    listEntitlements: function (request, callback) { return this.invoke('listEntitlements', request, callback); },
    /**
     * Reads the exact retained delivery evidence for one currently owned entitlement.
     * @param {Object} request entitlementCode in the private body under the original participant request.
     * Contains authData, tenant and retained business scope.
     * @param {function(Error|null, Object=):*} [callback] Optional Node-style callback receiving {data};
     * absent means return the Promise.
     * @returns {Promise<Object>|undefined} Safe owner-bound entitlement and delivery evidence. Wrapped as
     * {data}; callback mode returns undefined.
     * @remarks Effects: Reads fresh Profile, entitlement and generated delivery evidence; sets no-store.
     * Failure behavior: Missing, duplicate, foreign or changed evidence rejects without broad discovery.
     * @override Keep merchant storage placement separate from participant ownership and preserve privacy.
     */
    deliveryEvidence: function (request, callback) {
        request.httpResponse?.setHeader?.('Cache-Control', 'no-store');
        return this.invoke('deliveryEvidence', request, callback);
    },
    /**
     * Creates an owner-authorized immutable holdings manifest.
     * @param {Object} request ownerRef, components, idempotencyKey and optional reviewed composition in
     * payload. Contains authData, tenant and retained business scope.
     * @param {function(Error|null, Object=):*} [callback] Optional Node-style callback receiving {data};
     * absent means return the Promise.
     * @returns {Promise<Object>|undefined} Persisted immutable bundle manifest. Wrapped as {data}; callback
     * mode returns undefined.
     * @remarks Effects: Creates or replays an owner-authorized manifest; does not publish or transfer it.
     * Failure behavior: Invalid components, denied owner or conflicting original command rejects. Owner
     * rejection reaches callback or returned Promise; synchronous dispatch errors can still throw.
     * @override Preserve immutable manifest identity and delegate persistence to the bundle owner.
     */
    createBundle: function (request, callback) { return this.invoke('createBundle', request, callback); },
    /**
     * Reserves and sends a pending-acceptance gift.
     * @param {Object} request Confirmed manifest reference, recipientRef and original idempotencyKey in
     * payload. Contains authData, tenant and retained business scope.
     * @param {function(Error|null, Object=):*} [callback] Optional Node-style callback receiving {data};
     * absent means return the Promise.
     * @returns {Promise<Object>|undefined} Pending gift operation with private notification plans removed.
     * Wrapped as {data}; callback mode returns undefined.
     * @remarks Effects: Reserves the complete gift and may submit postcommit notifications.
     * Failure behavior: Recipient denial, conflicting command or uncertain component holds rejects. Owner
     * rejection reaches callback or returned Promise; synchronous dispatch errors can still throw.
     * @override Require whole-package holds; notification delivery is not gift acceptance.
     */
    sendGift: function (request, callback) { return this.invoke('sendGift', request, callback); },
    /**
     * Lists bounded owner-scoped gift state and available decisions.
     * @param {Object} request ownerRef, SENT/RECEIVED direction and bounded pagination in payload. Contains
     * authData, tenant and retained business scope.
     * @param {function(Error|null, Object=):*} [callback] Optional Node-style callback receiving {data};
     * absent means return the Promise.
     * @returns {Promise<Object>|undefined} Versioned gift page with current actions and recovery flags.
     * Wrapped as {data}; callback mode returns undefined.
     * @remarks Effects: Reads current participant and retained gift/manifest records; no holdings mutation.
     * Failure behavior: Denied owner, invalid page or inconsistent manifest evidence rejects. Owner
     * rejection reaches callback or returned Promise; synchronous dispatch errors can still throw.
     * @override Keep list authority and allowed actions with the gift owner.
     */
    listGifts: function (request, callback) { return this.invoke('listGifts', request, callback); },
    /**
     * Applies one recipient or sender gift decision.
     * @param {Object} request operationCode, expectedRevision, ACCEPT/DECLINE/CANCEL and confirmed:true in
     * payload. Contains authData, tenant and retained business scope.
     * @param {function(Error|null, Object=):*} [callback] Optional Node-style callback receiving {data};
     * absent means return the Promise.
     * @returns {Promise<Object>|undefined} Original gift operation after the selected phase and postcommit
     * handoff. Wrapped as {data}; callback mode returns undefined.
     * @remarks Effects: CAS-fences the decision then transfers/finalizes or releases original components.
     * Failure behavior: Changed revision, competing decision, expiry or uncertain owner effects rejects.
     * Owner rejection reaches callback or returned Promise; synchronous dispatch errors can still throw.
     * @override Resume only the retained decision; never replace it after a partial effect.
     */
    decideGift: function (request, callback) { return this.invoke('decideGift', request, callback); },
    /**
     * Changes independent Enterprise gift policies for new gifts only.
     * @param {Object} request Reviewed Enterprise participation changes and original command/revision in
     * payload. Contains authData, tenant and retained business scope.
     * @param {function(Error|null, Object=):*} [callback] Optional Node-style callback receiving {data};
     * absent means return the Promise.
     * @returns {Promise<Object>|undefined} Audited effective participation result. Wrapped as {data};
     * callback mode returns undefined.
     * @remarks Effects: Delegates governed policy persistence; existing gift decisions retain their terms.
     * Failure behavior: Current Enterprise authority, revision or command conflict rejects. Owner rejection
     * reaches callback or returned Promise; synchronous dispatch errors can still throw.
     * @override Do not move preferences into config or retroactively change pending gifts.
     */
    configureGifts: function (request, callback) {
        request.httpResponse?.setHeader?.('Cache-Control', 'no-store');
        return this.invoke('configureGifts', request, callback);
    },
    /**
     * Reads the selected Enterprise's effective participation controls without generic policy access.
     * @param {Object} request Original signed Enterprise actor; no caller-selected owner is admitted.
     * Contains authData, tenant and retained business scope.
     * @param {function(Error|null, Object=):*} [callback] Optional Node-style callback receiving {data};
     * absent means return the Promise.
     * @returns {Promise<Object>|undefined} Current effective Enterprise participation controls. Wrapped as
     * {data}; callback mode returns undefined.
     * @remarks Effects: Reads fresh Profile scope and governed policy; no policy write.
     * Failure behavior: Missing/denied Enterprise context or unavailable policy evidence rejects. Owner
     * rejection reaches callback or returned Promise; synchronous dispatch errors can still throw.
     * @override Keep represented Enterprise derivation with the participation owner.
     */
    readParticipation: function (request, callback) {
        request.httpResponse?.setHeader?.('Cache-Control', 'no-store');
        return this.invoke('readParticipation', request, callback);
    },
    /**
     * Inspects only the current actor's original settings command.
     * @param {Object} request Original participation command selector in payload and current actor. Contains
     * authData, tenant and retained business scope.
     * @param {function(Error|null, Object=):*} [callback] Optional Node-style callback receiving {data};
     * absent means return the Promise.
     * @returns {Promise<Object>|undefined} Original actor-scoped audited settings status. Wrapped as {data};
     * callback mode returns undefined.
     * @remarks Effects: Reads existing command evidence without replaying a policy mutation.
     * Failure behavior: Foreign actor or unavailable original command evidence rejects. Owner rejection
     * reaches callback or returned Promise; synchronous dispatch errors can still throw.
     * @override Inspect only original command history; never infer a successful settings write.
     */
    participationStatus: function (request, callback) {
        request.httpResponse?.setHeader?.('Cache-Control', 'no-store');
        return this.invoke('participationStatus', request, callback);
    },
    /**
     * Reveals one customer-owned digital entitlement through its provider.
     * @param {Object} request entitlementCode in route/body under the original private admitted buyer
     * request. Contains authData, tenant and retained business scope.
     * @param {function(Error|null, Object=):*} [callback] Optional Node-style callback receiving {data};
     * absent means return the Promise.
     * @returns {Promise<Object>|undefined} Private provider reveal result, potentially containing the usable
     * token. Wrapped as {data}; callback mode returns undefined.
     * @remarks Effects: Reads retained rights and decrypts through the reveal owner; controller sets
     * no-store/no-cache.
     * Failure behavior: Missing private provenance, current denial or incomplete committed rights rejects.
     * Owner rejection reaches callback or returned Promise; synchronous dispatch errors can still throw.
     * @override Preserve exact private request and original bearer around token access.
     */
    revealEntitlement: function (request, callback) {
        request.httpResponse?.setHeader('Cache-Control', 'no-store');
        request.httpResponse?.setHeader('Pragma', 'no-cache');
        return this.invoke('revealEntitlement', request, callback);
    }
};
