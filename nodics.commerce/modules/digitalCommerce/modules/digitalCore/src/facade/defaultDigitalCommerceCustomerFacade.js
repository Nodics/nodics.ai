/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module digitalCore/facade/defaultDigitalCommerceCustomerFacade
 * @description Delegates participant Digital APIs to their capability owners.
 * Inputs: Original normalized signed request with payload/query and retained buyer context.
 * Outputs: Owner entitlement, holdings, bundle, gift and participation projections; private reveal may
 * contain a token.
 * Effects: Owners perform their own reads/commands; facade never creates a substitute owner context.
 * Failure behavior: Current authority, identity and owner evidence failures propagate; notification
 * uncertainty remains an owner outcome.
 * Exported members: certificateHoldings, bundlePurchaseStatus, createBundle, sendGift,
 * retryGiftNotifications, listGifts, decideGift, configureGifts, readParticipation, participationStatus,
 * listEntitlements, deliveryEvidence, revealEntitlement.
 * @owner digitalCore
 * @layer facade
 * @override Override facade members through the loader while preserving owner-specific admission and
 * original private request identity.
 * @see ../../llm/contracts/bundle-holdings-and-gifts.md
 */
module.exports = {
    /**
     * Reads canonical certificate holdings through fresh participant admission.
     * @param {Object} request Optional ownerRef and page; original bearer resolves the current participant.
     * Contains authData, tenant and retained business scope.
     * @returns {Promise<Object>} Bounded safe certificate holdings page.
     * @remarks Effects: Reads Profile and qualified certificate holdings; sets no-store at the controller.
     * Failure behavior: Foreign owner, invalid pagination or malformed remote evidence rejects.
     * @override Keep Profile admission and post-read reauthorization in the holdings owner.
     */
    certificateHoldings: function (request) { return SERVICE.DefaultDigitalCertificateHoldingsService.list(request, request.payload); },
    /**
     * Delegates buyer/seller admission to the persisted settlement owner.
     * @param {Object} request Original purchase selectors in payload and current buyer/seller authority.
     * Contains authData, tenant and retained business scope.
     * @returns {Promise<Object>} Allowlisted retained bundle purchase status.
     * @remarks Effects: Reads the settlement owner; sets no-store at the controller.
     * Failure behavior: Foreign participant or incomplete original purchase evidence rejects.
     * @override Keep buyer/seller admission and receipt redaction in settlement.
     */
    bundlePurchaseStatus: function (request) { return SERVICE.DefaultDigitalBundleSettlementService.status(request, request.payload); },
    /**
     * Dispatches an original request without manufacturing customer or Enterprise authority.
     * @param {Object} request ownerRef, components, idempotencyKey and optional reviewed composition in
     * payload. Contains authData, tenant and retained business scope.
     * @returns {Promise<Object>} Persisted immutable bundle manifest.
     * @remarks Effects: Creates or replays an owner-authorized manifest; does not publish or transfer it.
     * Failure behavior: Invalid components, denied owner or conflicting original command rejects.
     * @override Preserve immutable manifest identity and delegate persistence to the bundle owner.
     */
    createBundle: function (request) { return SERVICE.DefaultDigitalBundleService.create(request, request.payload); },
    /**
     * Reserves the confirmed package through the whole-gift owner.
     * @param {Object} request Confirmed manifest reference, recipientRef and original idempotencyKey in
     * payload. Contains authData, tenant and retained business scope.
     * @returns {Promise<Object>} Pending gift operation with private notification plans removed.
     * @remarks Effects: Reserves the complete gift and may submit postcommit notifications.
     * Failure behavior: Recipient denial, conflicting command or uncertain component holds rejects.
     * @override Require whole-package holds; notification delivery is not gift acceptance.
     */
    sendGift: function (request) { return SERVICE.DefaultDigitalBundleGiftService.send(request, request.payload); },
    /**
     * Retries only original gift notification handoff after fresh participant admission.
     * @param {Object} request operationCode, event and SENDER/RECIPIENT side in payload. Contains authData,
     * tenant and retained business scope.
     * @returns {Promise<Object>} Recorded, suppressed or unconfirmed original notification outcomes.
     * @remarks Effects: Reuses frozen Communication intent references; no gift/component mutation.
     * Failure behavior: Participant admission rejects; notification uncertainty is returned, not financial
     * failure.
     * @override Retry messaging only; never readdress frozen content or repeat a gift decision.
     */
    retryGiftNotifications: function (request) { return SERVICE.DefaultDigitalBundleGiftNotificationService.retry(request, request.payload); },
    /**
     * Reads sent or received gifts through current participant authority.
     * @param {Object} request ownerRef, SENT/RECEIVED direction and bounded pagination in payload. Contains
     * authData, tenant and retained business scope.
     * @returns {Promise<Object>} Versioned gift page with current actions and recovery flags.
     * @remarks Effects: Reads current participant and retained gift/manifest records; no holdings mutation.
     * Failure behavior: Denied owner, invalid page or inconsistent manifest evidence rejects.
     * @override Keep list authority and allowed actions with the gift owner.
     */
    listGifts: function (request) { return SERVICE.DefaultDigitalBundleGiftService.list(request, request.payload); },
    /**
     * Requires recipient/sender authority and the retained revision at the gift owner.
     * @param {Object} request operationCode, expectedRevision, ACCEPT/DECLINE/CANCEL and confirmed:true in
     * payload. Contains authData, tenant and retained business scope.
     * @returns {Promise<Object>} Original gift operation after the selected phase and postcommit handoff.
     * @remarks Effects: CAS-fences the decision then transfers/finalizes or releases original components.
     * Failure behavior: Changed revision, competing decision, expiry or uncertain owner effects rejects.
     * @override Resume only the retained decision; never replace it after a partial effect.
     */
    decideGift: function (request) { return SERVICE.DefaultDigitalBundleGiftService.decide(request, request.payload); },
    /**
     * Keeps business preferences as governed Digital records.
     * @param {Object} request Reviewed Enterprise participation changes and original command/revision in
     * payload. Contains authData, tenant and retained business scope.
     * @returns {Promise<Object>} Audited effective participation result.
     * @remarks Effects: Delegates governed policy persistence; existing gift decisions retain their terms.
     * Failure behavior: Current Enterprise authority, revision or command conflict rejects.
     * @override Do not move preferences into config or retroactively change pending gifts.
     */
    configureGifts: function (request) { return SERVICE.DefaultDigitalBundleGiftService.configure(request, request.payload); },
    /**
     * Derives the represented Enterprise from fresh original Profile evidence.
     * @param {Object} request Original signed Enterprise actor; no caller-selected owner is admitted.
     * Contains authData, tenant and retained business scope.
     * @returns {Promise<Object>} Current effective Enterprise participation controls.
     * @remarks Effects: Reads fresh Profile scope and governed policy; no policy write.
     * Failure behavior: Missing/denied Enterprise context or unavailable policy evidence rejects.
     * @override Keep represented Enterprise derivation with the participation owner.
     */
    readParticipation: function (request) { return SERVICE.DefaultDigitalParticipationService.current(request); },
    /**
     * Resolves one original audited settings result without exposing private storage.
     * @param {Object} request Original participation command selector in payload and current actor. Contains
     * authData, tenant and retained business scope.
     * @returns {Promise<Object>} Original actor-scoped audited settings status.
     * @remarks Effects: Reads existing command evidence without replaying a policy mutation.
     * Failure behavior: Foreign actor or unavailable original command evidence rejects.
     * @override Inspect only original command history; never infer a successful settings write.
     */
    participationStatus: function (request) { return SERVICE.DefaultDigitalParticipationService.status(request, request.payload); },
    /**
     * Lists customer-owned digital entitlements.
     * @param {Object} request Original signed buyer context and bounded entitlement query. Contains
     * authData, tenant and retained business scope.
     * @returns {Promise<Object>} Current buyer-owned entitlement projection.
     * @remarks Effects: Resolves fresh listContext and reads owner-filtered entitlements.
     * Failure behavior: Denied buyer, ambiguous cross-merchant discovery or invalid evidence rejects.
     * @override Retain typed buyer authority separately from merchant storage placement.
     */
    listEntitlements: async function (request) {
        const owner = SERVICE.DefaultDigitalCommerceEntitlementService;
        return owner.listOwn(await owner.listContext(request));
    },
    /**
     * Delegates an exact participant-owned delivery read to the entitlement owner.
     * @param {Object} request Original private participant request with entitlementCode in payload.
     * @returns {Promise<Object>} Safe owner-bound delivery evidence.
     * @remarks Effects: Reads fresh participant, entitlement and generated delivery evidence.
     * Failure behavior: Missing, duplicate, foreign or changed evidence rejects.
     * @override Retain canonical owner admission and merchant partition validation in Digital Core.
     */
    deliveryEvidence: function (request) {
        return SERVICE.DefaultDigitalCommerceEntitlementService.deliveryEvidence(request);
    },
    /**
     * Reveals a customer-owned digital entitlement.
     * @param {Object} request entitlementCode in route/body under the original private admitted buyer
     * request. Contains authData, tenant and retained business scope.
     * @returns {Promise<Object>} Private provider reveal result, potentially containing the usable token.
     * @remarks Effects: Reads retained rights and decrypts through the reveal owner; controller sets
     * no-store/no-cache.
     * Failure behavior: Missing private provenance, current denial or incomplete committed rights rejects.
     * @override Preserve exact private request and original bearer around token access.
     */
    revealEntitlement: function (request) { return Promise.resolve().then(() => SERVICE.DefaultDigitalCommerceEntitlementService.reveal(request)); }
};
