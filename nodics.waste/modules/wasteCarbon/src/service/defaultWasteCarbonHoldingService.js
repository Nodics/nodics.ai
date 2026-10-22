/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
const crypto = require('node:crypto');
const DEFAULTS = require('../../config/properties').wasteCarbon;
const exactAmount = require('../../../../../nodics.foundation/modules/nCommon/src/utils/exactAmount');

/**
 * @module wasteCarbon/service/defaultWasteCarbonHoldingService
 * @description Persists evidence-backed lot allocations and atomic beneficial-ownership operations.
 * Inputs are trusted request context plus explicit component/evidence references; outputs are
 * saved owner projections. Fails closed on missing authorization/provider/storage, precision or CAS conflict.
 * @owner wasteCarbon @layer service
 * @override Later registered evidence providers may replace evidence retrieval, not ownership invariants.
 */
module.exports = {
    /**
     * Resolves canonical pure decimal operations without activating another domain.
     * @returns {object} Shared exact arithmetic; no configuration or persistence effects.
     * @override Replace individual arithmetic members through this accessor without rounding evidence.
     */
    amount: function () { return exactAmount; },
    /**
     * Returns the existing generated-repository adapter.
     * @returns {Object} Effective generated-repository adapter; does not itself read or write.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    store: function () { return SERVICE.DefaultWastePersistenceService; },
    /**
     * Raises a stable owner error without exposing evidence.
     * @param {string} code Exact record identity or stable owner error code, as described above.
     * @param {string} message Content-safe owner diagnostic.
     * @returns {never} Always throws a content-safe owner error; no business writes.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    fail: function (code, message) { this.store().fail('ERR_CARBON_' + code, message); },
    /**
     * Clones JSON business evidence without retaining caller aliases.
     * @param {*} value Value to validate, normalize or project as described above.
     * @returns {*} Detached evidence copy; leaves the input unchanged.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    copy: function (value) { return JSON.parse(JSON.stringify(value)); },
    /**
     * Hashes a stable ordered protocol identity.
     * @param {*} value Value to validate, normalize or project as described above.
     * @returns {string} Deterministic digest of ordered identity components; no persistence.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    hash: function (value) { return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex'); },
    /**
     * Applies owner-defined numeric contracts without service-local replacement bounds.
     * @param {*} value Value to validate, normalize or project as described above.
     * @param {Object} range Owner-defined minimum and maximum bounds.
     * @param {boolean} [allowZero] Whether zero is permitted for this numeric setting.
     * @returns {boolean} Whether the numeric value satisfies the supplied owner range; no effects.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    bounded: function (value, range, allowZero = false) {
        return range && Number.isSafeInteger(range.minimum) && range.minimum >= (allowZero ? 0 : 1) &&
            Number.isSafeInteger(range.maximum) && range.maximum >= range.minimum &&
            Number.isSafeInteger(value) && value >= range.minimum && value <= range.maximum;
    },
    /**
     * Merges intentional effective deltas with complete framework defaults and validates bounds.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @returns {*} Merges intentional effective deltas with complete framework defaults and validates bounds.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    settings: function (request) {
        const supplied = typeof CONFIG !== 'undefined' ? CONFIG.get('wasteCarbon', request.tenant) || {} : {};
        for (const key of ['evidence', 'limits', 'validation', 'profile'])
            if (supplied[key] !== undefined && (!supplied[key] || Object.getPrototypeOf(supplied[key]) !== Object.prototype))
                this.fail('CONFIGURATION', 'Invalid carbon configuration object');
        const result = { evidence: { ...DEFAULTS.evidence, ...supplied.evidence }, limits: { ...DEFAULTS.limits, ...supplied.limits },
            validation: Object.fromEntries(Object.entries(DEFAULTS.validation).map(([key, range]) =>
                [key, supplied.validation?.[key] === undefined ? range : supplied.validation[key] && typeof supplied.validation[key] === 'object'
                    ? { ...range, ...supplied.validation[key] } : supplied.validation[key]])) };
        for (const [name, value] of Object.entries(result.limits))
            if (!this.bounded(value, result.validation[name === 'quantityScale' || name === 'quantityDigits' ? name : name === 'providerTimeoutMs' ? 'timeoutMs' : 'operationalLimit'], name === 'quantityScale'))
                this.fail('CONFIGURATION', 'Invalid carbon limit');
        if (typeof result.evidence.allowSynthetic !== 'boolean') this.fail('CONFIGURATION', 'Invalid synthetic policy');
        if (result.evidence.providerService !== null && (typeof result.evidence.providerService !== 'string' ||
            !/^[A-Za-z][A-Za-z0-9]*Service$/.test(result.evidence.providerService)))
            this.fail('CONFIGURATION', 'Evidence provider must be a registered service name');
        return result;
    },
    /**
     * Requires explicit canonical service permission and trusted tenant before any repository access.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @param {string} permission Exact owner capability permission; not inferred from roles.
     * @param {Object} owner Canonical beneficiary identity, distinct from the actor or runtime enterprise.
     * @returns {void} Admission succeeds without return data; effects and evidence checks are described above.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    authorize: function (request, permission, owner) {
        const auth = request.authData || {};
        if (!request.tenant || (auth.tenant && auth.tenant !== request.tenant) || !auth.loginId)
            this.fail('FORBIDDEN', 'Trusted tenant and principal are required');
        const security = SERVICE.DefaultSecuredRequestPipelineService;
        if (!security || !security.isPermissionGranted(permission, security.getGrantedPermissions(request), {}))
            this.fail('FORBIDDEN', 'Carbon permission is required');
        if (auth.principalType === 'service') return;
        this.fail('FORBIDDEN', 'An authorized owner service is required');
    },
    /**
     * Normalizes a Profile owner identity; actor and hierarchy are not ownership.
     * @param {Object} ref Typed canonical reference containing module, schema and code.
     * @returns {Object} Validated canonical beneficiary descriptor; no identity mutation.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    owner: function (ref) {
        if (!ref || ref.module !== 'profile' || !['customer', 'enterprise'].includes(ref.schema) ||
            typeof ref.code !== 'string' || !ref.code.trim() || ref.code.length > 180)
            this.fail('INPUT', 'A canonical customer or Enterprise owner is required');
        return { module: 'profile', schema: ref.schema, code: ref.code };
    },
    /**
     * Compares canonical owner/reference identities.
     * @param {Object} a First canonical identity.
     * @param {Object} b Second canonical identity.
     * @returns {boolean} Whether canonical identities match; no effects.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    same: function (a, b) { return Boolean(a && b && a.module === b.module && a.schema === b.schema && a.code === b.code); },
    /**
     * Requires a complete immutable source reference.
     * @param {Object} ref Typed canonical reference containing module, schema and code.
     * @returns {Object} Validated immutable reference; no evidence lookup or persistence.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    reference: function (ref) {
        if (!ref || ['module', 'schema', 'code'].some(key => typeof ref[key] !== 'string' || !ref[key] || ref[key].length > 180))
            this.fail('INPUT', 'A complete source reference is required');
        return this.copy(ref);
    },
    /**
     * Parses an unsigned exact quantity under its evidenced scale; never rounds issued quantities.
     * @param {*} value Value to validate, normalize or project as described above.
     * @param {number} scale Validated decimal precision from the canonical reward unit or issued lot.
     * @param {Object} settings Validated effective owner settings, including numeric bounds.
     * @returns {bigint} Exact minor units at the evidenced scale; no rounding or persistence.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    minor: function (value, scale, settings) {
        if (!Number.isSafeInteger(scale) || scale < 0 || scale > settings.limits.quantityScale ||
            typeof value !== 'string' || !/^(0|[1-9][0-9]*)(\.[0-9]+)?$/.test(value) ||
            value.replace('.', '').length > settings.limits.quantityDigits || (value.split('.')[1] || '').length > scale)
            this.fail('QUANTITY', 'Quantity or precision is invalid');
        return this.amount().align(this.amount().parse(value), { units: 0n, scale }).left;
    },
    /**
     * Formats exact minor units using the lot scale.
     * @param {*} value Value to validate, normalize or project as described above.
     * @param {number} scale Validated decimal precision from the canonical reward unit or issued lot.
     * @returns {string} Fixed-scale exact decimal representation; no persistence.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    decimal: function (value, scale) {
        const [whole, fraction = ''] = this.amount().format(value, scale).split('.');
        return whole + (scale ? '.' + fraction.padEnd(scale, '0') : '');
    },
    /**
     * Calls only a configured, qualified adapter with bounded execution and trusted context.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @param {string|Function|Object} operation Owner-selected operation, transaction callback or persisted operation as described above.
     * @param {Object} input Operation-specific command or evidence input described above; not authorization.
     * @returns {Promise<*>} Calls only a configured, qualified adapter with bounded execution and trusted context.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    evidence: async function (request, operation, input) {
        const settings = this.settings(request), policy = settings.evidence;
        if (!policy.providerService || !policy.qualificationRef) this.fail('UNAVAILABLE', 'Carbon evidence provider is not qualified');
        this.reference(policy.qualificationRef);
        const provider = SERVICE[policy.providerService];
        if (typeof provider?.[operation] !== 'function') this.fail('UNAVAILABLE', 'Carbon evidence provider is unavailable');
        const abort = new AbortController();
        let timer;
        try {
            return await Promise.race([
                provider[operation](this.copy(input), { tenant: request.tenant, qualificationRef: this.copy(policy.qualificationRef), signal: abort.signal }),
                new Promise((resolve, reject) => { timer = setTimeout(() => { abort.abort(); const error = new Error('Carbon evidence timeout'); error.code = 'ERR_CARBON_UNAVAILABLE'; reject(error); }, settings.limits.providerTimeoutMs); })
            ]);
        } catch (error) {
            this.fail('UNAVAILABLE', 'Qualified carbon evidence could not be confirmed');
        } finally { clearTimeout(timer); }
    },
    /**
     * Resolves immutable original contribution ownership, independent of certificate state.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @param {Object} allocation Original-beneficiary allocation in the persisted batch or lot.
     * @returns {Promise<*>} Resolves immutable original contribution ownership, independent of certificate state.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    originalOwner: async function (request, allocation) {
        if (allocation.kind === ENUMS.WasteCarbonAllocationKind.PARTNER.value) { this.reference(allocation.agreementRef); return; }
        if (allocation.kind !== ENUMS.WasteCarbonAllocationKind.CONTRIBUTOR.value || allocation.contributionRef?.module !== 'wasteSubmission' ||
            allocation.contributionRef?.schema !== 'wasteSubmission') this.fail('EVIDENCE', 'Canonical original contribution is required');
        const contribution = await this.store().one('wasteSubmission', request, allocation.contributionRef.code);
        if (!contribution) this.fail('EVIDENCE', 'Original contribution is unavailable');
        const assets = await this.store().list('wasteAsset', request, { sourceSubmissionCode: contribution.code }, 2);
        if (assets.length > 1) this.fail('EVIDENCE', 'Ambiguous original contribution ownership');
        const original = assets[0]?.originalOwnerRef || contribution.originalOwnerRef || contribution.submitterRef;
        if (assets[0] && contribution.originalOwnerRef && !this.same(assets[0].originalOwnerRef, contribution.originalOwnerRef))
            this.fail('EVIDENCE', 'Original owner evidence disagrees');
        if (!this.same(original, allocation.ownerRef)) this.fail('EVIDENCE', 'Allocation must retain the original contributor');
    },
    /**
     * Persists cumulative qualified evidence; existing allocations and operations cannot be rewritten.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @returns {Promise<*>} Persists cumulative qualified evidence; existing allocations and operations cannot be rewritten.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    synchronize: async function (request) {
        this.authorize(request, 'carbon.evidence.record');
        const settings = this.settings(request);
        const result = await this.evidence(request, 'readLot', { evidenceRef: this.reference(request.payload?.evidenceRef) });
        if (!result || ![ENUMS.WasteCarbonLotState.PROSPECTIVE.value, ENUMS.WasteCarbonLotState.REALIZED.value].includes(result.state) || typeof result.synthetic !== 'boolean' ||
            (result.synthetic && !settings.evidence.allowSynthetic) || typeof result.unitOfMeasure !== 'string' || !result.unitOfMeasure ||
            !Array.isArray(result.allocations) || result.allocations.length > settings.limits.allocationsPerLot)
            this.fail('EVIDENCE', 'Qualified lot evidence is invalid');
        for (const key of ['evidenceRef', 'issuanceRef', 'providerRef', 'programRef']) this.reference(result[key]);
        const issued = this.minor(result.issuedQuantity, result.scale, settings);
        const code = 'CARBON_' + this.hash([result.issuanceRef.module, result.issuanceRef.schema, result.issuanceRef.code]);
        const current = await this.store().one('wasteCarbonLot', request, code);
        const allocations = [], seen = new Set();
        let allocated = 0n;
        for (const item of result.allocations) {
            if (typeof item.code !== 'string' || !item.code || seen.has(item.code)) this.fail('EVIDENCE', 'Duplicate allocation');
            seen.add(item.code);
            const allocation = { code: item.code, ownerRef: this.owner(item.ownerRef), quantity: this.decimal(this.minor(item.quantity, result.scale, settings), result.scale),
                kind: item.kind, allocationRef: this.reference(item.allocationRef), contributionRef: item.contributionRef ? this.reference(item.contributionRef) : null,
                agreementRef: item.agreementRef ? this.reference(item.agreementRef) : null };
            if (this.minor(allocation.quantity, result.scale, settings) <= 0n) this.fail('QUANTITY', 'Allocation must be positive');
            await this.originalOwner(request, allocation);
            allocated += this.minor(allocation.quantity, result.scale, settings);
            allocations.push(allocation);
        }
        if (result.state === ENUMS.WasteCarbonLotState.REALIZED.value && allocated > issued) this.fail('EVIDENCE', 'Allocations exceed issued quantity');
        if (result.state === ENUMS.WasteCarbonLotState.PROSPECTIVE.value && issued !== 0n) this.fail('EVIDENCE', 'Prospective estimates cannot carry issued credits');
        if (current) {
            if (current.unitOfMeasure !== result.unitOfMeasure || current.scale !== result.scale || current.synthetic !== result.synthetic ||
                !this.same(current.programRef, result.programRef) || !this.same(current.providerRef, result.providerRef) ||
                (current.state === ENUMS.WasteCarbonLotState.REALIZED.value && result.state !== ENUMS.WasteCarbonLotState.REALIZED.value) ||
                issued < this.minor(current.issuedQuantity, current.scale, settings)) this.fail('CONFLICT', 'Lot terms cannot be rewritten');
            if (current.state === ENUMS.WasteCarbonLotState.REALIZED.value) for (const old of current.allocations) {
                const next = allocations.find(item => item.code === old.code);
                if (!next || this.hash(next) !== this.hash(old)) this.fail('CONFLICT', 'Original allocations are immutable');
            }
        }
        if (result.state === ENUMS.WasteCarbonLotState.REALIZED.value) for (const allocation of allocations) {
            const ref = allocation.allocationRef;
            const claimCode = 'CARBON_ALLOCATION_' + this.hash([ref.module, ref.schema, ref.code]);
            const fingerprint = this.hash([code, allocation]);
            const existingClaim = await this.store().one('wasteCarbonAllocationClaim', request, claimCode);
            if (existingClaim && existingClaim.fingerprint !== fingerprint) this.fail('CONFLICT', 'Allocation evidence already belongs to another lot or beneficiary');
            if (!existingClaim) await this.store().create('wasteCarbonAllocationClaim', request,
                { code: claimCode, lotCode: code, allocationRef: ref, fingerprint, revision: 0 });
        }
        const patch = { code, evidenceRef: result.evidenceRef, issuanceRef: result.issuanceRef, providerRef: result.providerRef,
            programRef: result.programRef, unitOfMeasure: result.unitOfMeasure, scale: result.scale, issuedQuantity: this.decimal(issued, result.scale),
            state: result.state, synthetic: result.synthetic, allocations, operations: current?.operations || [],
            prospectiveEvidence: current?.prospectiveEvidence || (result.state === ENUMS.WasteCarbonLotState.PROSPECTIVE.value ? this.copy(allocations) : []),
            qualificationRef: settings.evidence.qualificationRef, updatedAt: new Date().toISOString() };
        if (current && this.hash({ ...patch, updatedAt: null }) === this.hash({ ...current, updatedAt: null })) return current;
        const saved = current ? await this.store().update('wasteCarbonLot', request, current, patch)
            : await this.store().create('wasteCarbonLot', request, { ...patch, revision: 0 });
        if (!saved || this.hash(saved.allocations) !== this.hash(allocations)) this.fail('CONFLICT', 'Lot persistence requires reconciliation');
        return saved;
    },
    /**
     * Computes only this owner's balances from immutable allocations and atomic operation facts.
     * @param {Object} lot Issued-credit lot with frozen allocations and operation facts.
     * @param {Object} owner Canonical beneficiary identity, distinct from the actor or runtime enterprise.
     * @param {Object} settings Validated effective owner settings, including numeric bounds.
     * @returns {*} Computes only this owner's balances from immutable allocations and atomic operation facts.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    balance: function (lot, owner, settings) {
        let realized = 0n, reserved = 0n, prospective = 0n;
        for (const allocation of lot.allocations) if (this.same(allocation.ownerRef, owner)) {
            const quantity = this.minor(allocation.quantity, lot.scale, settings);
            if (lot.state === ENUMS.WasteCarbonLotState.REALIZED.value) realized += quantity; else prospective += quantity;
        }
        for (const operation of lot.operations) {
            const quantity = this.minor(operation.quantity, lot.scale, settings);
            if (operation.status === ENUMS.WasteCarbonHoldingState.RESERVED.value && this.same(operation.ownerRef, owner)) reserved += quantity;
            if ([ENUMS.WasteCarbonHoldingState.TRANSFERRED.value, ENUMS.WasteCarbonHoldingState.COMPLETED.value].includes(operation.status)) {
                if (this.same(operation.ownerRef, owner)) realized -= quantity;
                if (this.same(operation.recipientRef, owner)) {
                    realized += quantity;
                    if (operation.status === ENUMS.WasteCarbonHoldingState.TRANSFERRED.value) reserved += quantity;
                }
            }
        }
        return { total: this.decimal(prospective + realized, lot.scale), totalSpendable: false,
            prospective: this.decimal(prospective, lot.scale), realized: this.decimal(realized, lot.scale),
            reserved: this.decimal(reserved, lot.scale), available: this.decimal(realized - reserved, lot.scale) };
    },
    /**
     * Reads bounded owner-only holdings; totals retain separate units and prospective status.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @returns {Promise<*>} Reads bounded owner-only holdings; totals retain separate units and prospective status.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    holdings: async function (request) {
        const owner = await SERVICE.DefaultWasteCarbonReadAccessService.resolve(request);
        const settings = this.settings(request), page = request.payload?.page ?? 1;
        if (!Number.isSafeInteger(page) || page < 1) this.fail('INPUT', 'Invalid page');
        const match = { 'ownerRef.module': owner.module, 'ownerRef.schema': owner.schema, 'ownerRef.code': owner.code };
        const result = await this.store().page('wasteCarbonLot', request, { $or: [
            { allocations: { $elemMatch: match } },
            { operations: { $elemMatch: { 'recipientRef.module': owner.module, 'recipientRef.schema': owner.schema, 'recipientRef.code': owner.code,
                $or: [{ status: ENUMS.WasteCarbonHoldingState.TRANSFERRED.value }, { status: ENUMS.WasteCarbonHoldingState.COMPLETED.value }] } } }
        ] }, page, settings.limits.pageSize);
        return { ...result, ownerRef: owner, items: result.items.map(lot => ({ lotCode: lot.code, revision: lot.revision, unitOfMeasure: lot.unitOfMeasure,
            scale: lot.scale, synthetic: lot.synthetic, issuanceRef: lot.issuanceRef, programRef: lot.programRef, state: lot.state,
            eligibility: ENUMS.WasteCarbonEligibility.NOT_CHECKED.value, transferable: null,
            allocationRefs: lot.allocations.filter(item => this.same(item.ownerRef, owner)).map(item => ({
                allocationRef: item.allocationRef, contributionRef: item.contributionRef, quantity: item.quantity })),
            acquisitionRefs: lot.operations.filter(item => [ENUMS.WasteCarbonHoldingState.TRANSFERRED.value, ENUMS.WasteCarbonHoldingState.COMPLETED.value].includes(item.status) && this.same(item.recipientRef, owner))
                .map(item => ({ operationKey: item.operationKey, manifestRef: item.manifestRef, quantity: item.quantity,
                    status: item.status, destinationHold: item.destinationHold, finalizedAt: item.finalizedAt || null })),
            ...this.balance(lot, owner, settings) })) };
    },
    /**
     * Returns only the selected component's persisted evidence.
     * @param {Object} lot Issued-credit lot with frozen allocations and operation facts.
     * @param {string|Function|Object} operation Owner-selected operation, transaction callback or persisted operation as described above.
     * @returns {Object} Allowlisted evidence projection; no accounting or persistence writes.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    project: function (lot, operation) {
        return { module: 'wasteCarbon', schema: 'wasteCarbonLot', lotCode: lot.code, revision: lot.revision, ...this.copy(operation) };
    },
    /**
     * Inspects an original operation, including uncertain-outcome recovery; foreign owners cannot read it.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @returns {Promise<*>} Inspects an original operation, including uncertain-outcome recovery; foreign owners cannot read it.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    getOperation: async function (request) {
        const body = request.payload || {}, owner = await SERVICE.DefaultWasteCarbonReadAccessService.resolve(request);
        if (typeof body.lotCode !== 'string' || !body.lotCode || typeof body.operationKey !== 'string' || !body.operationKey)
            this.fail('INPUT', 'Lot and operation identity are required');
        const lot = await this.store().one('wasteCarbonLot', request, body.lotCode);
        const operation = lot?.operations.find(item => item.operationKey === body.operationKey);
        if (!operation) return null;
        if (!this.same(operation.ownerRef, owner)) this.fail('FORBIDDEN', 'Operation is not owned by this owner');
        return this.project(lot, operation);
    },
    /**
     * Rechecks current external eligibility without allowing the request to assert it.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @param {Object} lot Issued-credit lot with frozen allocations and operation facts.
     * @returns {Promise<*>} Rechecks current external eligibility without allowing the request to assert it.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    eligible: async function (request, lot) {
        if (lot.state !== ENUMS.WasteCarbonLotState.REALIZED.value) this.fail('INELIGIBLE', 'Prospective holdings cannot be reserved');
        if (lot.synthetic && !this.settings(request).evidence.allowSynthetic) this.fail('INELIGIBLE', 'Synthetic holdings are not enabled');
        const result = await this.evidence(request, 'eligibility', { lotCode: lot.code, issuanceRef: lot.issuanceRef });
        if (result?.lotCode !== lot.code || !this.same(result.issuanceRef, lot.issuanceRef) || result.status !== ENUMS.WasteCarbonEligibility.ELIGIBLE.value)
            this.fail('INELIGIBLE', 'Current issuance eligibility is unavailable or withdrawn');
        this.reference(result.evidenceRef);
        return result.evidenceRef;
    },
    /**
     * Runs one atomic persisted lot transition; conflicts and uncertain writes retain the original key.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @param {string} action Explicit supported lifecycle action.
     * @returns {Promise<*>} Runs one atomic persisted lot transition; conflicts and uncertain writes retain the original key.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    change: async function (request, action) {
        const body = request.payload || {}, owner = this.owner(body.ownerRef), settings = this.settings(request);
        this.authorize(request, 'carbon.holdings.' + action.toLowerCase(), owner);
        if (![ENUMS.WasteCarbonOperation.RESERVE.value, ENUMS.WasteCarbonOperation.TRANSFER.value,
            ENUMS.WasteCarbonOperation.FINALIZE.value, ENUMS.WasteCarbonOperation.RELEASE.value].includes(action))
            this.fail('INPUT', 'Unsupported carbon operation');
        const manifest = this.reference(body.manifestRef);
        if (!Number.isSafeInteger(manifest.revision) || manifest.revision < 0 ||
            typeof body.operationKey !== 'string' || !/^[A-Za-z0-9._:-]{1,180}$/.test(body.operationKey))
            this.fail('INPUT', 'Stable operation and revision-bound manifest are required');
        const lot = await this.store().one('wasteCarbonLot', request, body.lotCode);
        if (!lot) this.fail('NOT_FOUND', 'Lot is unavailable');
        const quantity = this.minor(body.quantity, lot.scale, settings);
        if (quantity <= 0n || body.unitOfMeasure !== lot.unitOfMeasure) this.fail('QUANTITY', 'Select a positive quantity in the exact lot unit');
        const binding = { operationKey: body.operationKey, ownerRef: owner, quantity: this.decimal(quantity, lot.scale),
            unitOfMeasure: lot.unitOfMeasure, manifestRef: manifest };
        const existing = lot.operations.find(item => item.operationKey === body.operationKey);
        if (existing && this.hash(binding) !== existing.fingerprint) this.fail('CONFLICT', 'Operation key belongs to different component terms');
        if (existing && [ENUMS.WasteCarbonHoldingState.TRANSFERRED.value, ENUMS.WasteCarbonHoldingState.COMPLETED.value].includes(existing.status)) {
            if (action === ENUMS.WasteCarbonOperation.RELEASE.value || ([ENUMS.WasteCarbonOperation.TRANSFER.value, ENUMS.WasteCarbonOperation.FINALIZE.value].includes(action) && !this.same(existing.recipientRef, this.owner(body.recipientRef))))
                this.fail('FINAL', 'Completed transfers are final');
            if (action !== ENUMS.WasteCarbonOperation.FINALIZE.value || existing.status === ENUMS.WasteCarbonHoldingState.COMPLETED.value) return this.project(lot, existing);
            if (existing.destinationHold !== ENUMS.WasteCarbonHoldingState.HELD.value) this.fail('CONFLICT', 'Original destination hold is unconfirmed');
            const completed = { ...existing, status: ENUMS.WasteCarbonHoldingState.COMPLETED.value, destinationHold: ENUMS.WasteCarbonHoldingState.RELEASED.value,
                finalizedAt: new Date().toISOString(),
                finalizationActor: { principalType: request.authData.principalType, principalCode: request.authData.loginId } };
            const saved = await this.store().update('wasteCarbonLot', request, lot, {
                operations: lot.operations.map(item => item.operationKey === body.operationKey ? completed : item)
            });
            const persisted = saved?.operations.find(item => item.operationKey === body.operationKey);
            if (!persisted || persisted.status !== ENUMS.WasteCarbonHoldingState.COMPLETED.value || persisted.destinationHold !== ENUMS.WasteCarbonHoldingState.RELEASED.value ||
                persisted.fingerprint !== completed.fingerprint || !this.same(persisted.recipientRef, completed.recipientRef) || !persisted.finalizedAt)
                this.fail('CONFLICT', 'Finalization outcome must be reconciled');
            return this.project(saved, persisted);
        }
        if (action === ENUMS.WasteCarbonOperation.FINALIZE.value) this.fail('CONFLICT', 'Only an original transferred holding can be finalized');
        if (existing?.status === ENUMS.WasteCarbonHoldingState.RELEASED.value) {
            if (action !== ENUMS.WasteCarbonOperation.RELEASE.value) this.fail('FINAL', 'Released operation cannot be reused');
            return this.project(lot, existing);
        }
        if (action === ENUMS.WasteCarbonOperation.RESERVE.value && existing) return this.project(lot, existing);
        if (action !== ENUMS.WasteCarbonOperation.RESERVE.value && !existing) this.fail('NOT_FOUND', 'Reservation does not exist');
        let recipient, eligibilityRef;
        if (action === ENUMS.WasteCarbonOperation.RESERVE.value || action === ENUMS.WasteCarbonOperation.TRANSFER.value) eligibilityRef = await this.eligible(request, lot);
        if (action === ENUMS.WasteCarbonOperation.RESERVE.value) {
            if (lot.operations.length >= settings.limits.operationsPerLot) this.fail('CAPACITY', 'Lot operation capacity requires governed partitioning');
            if (this.minor(this.balance(lot, owner, settings).available, lot.scale, settings) < quantity)
                this.fail('INSUFFICIENT', 'Insufficient available realized holdings');
        }
        if (action === ENUMS.WasteCarbonOperation.TRANSFER.value) {
            recipient = this.owner(body.recipientRef);
            if (this.same(owner, recipient)) this.fail('INPUT', 'Sender and recipient must differ');
        }
        const next = { ...binding, fingerprint: this.hash(binding), status: {
            [ENUMS.WasteCarbonOperation.RESERVE.value]: ENUMS.WasteCarbonHoldingState.RESERVED.value,
            [ENUMS.WasteCarbonOperation.TRANSFER.value]: ENUMS.WasteCarbonHoldingState.TRANSFERRED.value,
            [ENUMS.WasteCarbonOperation.RELEASE.value]: ENUMS.WasteCarbonHoldingState.RELEASED.value
        }[action],
            destinationHold: action === ENUMS.WasteCarbonOperation.TRANSFER.value ? ENUMS.WasteCarbonHoldingState.HELD.value : null,
            recipientRef: recipient || null, eligibilityRef: eligibilityRef || existing?.eligibilityRef,
            actorRef: request.actorRef || null,
            sourceActor: { principalType: request.authData.principalType, principalCode: request.authData.loginId },
            recordedAt: new Date().toISOString() };
        const operations = existing ? lot.operations.map(item => item.operationKey === body.operationKey ? next : item) : [...lot.operations, next];
        const saved = await this.store().update('wasteCarbonLot', request, lot, { operations });
        const persisted = saved?.operations.find(item => item.operationKey === body.operationKey);
        if (!persisted || persisted.status !== next.status || persisted.fingerprint !== next.fingerprint ||
            persisted.destinationHold !== next.destinationHold ||
            (recipient && !this.same(recipient, persisted.recipientRef))) this.fail('CONFLICT', 'Operation outcome must be reconciled');
        return this.project(saved, persisted);
    },
    /**
     * Reserves only explicitly selected realized quantity. @returns {Promise<object>} persisted component
     * @param {Object} request Original owner input; preserve scope and intent.
     * @override Preserve private admission, original context and owner side effects.
     */
    reserve: function (request) { return this.change(request, ENUMS.WasteCarbonOperation.RESERVE.value); },
    /**
     * Atomically transfers exact quantity into a retained recipient hold. @returns {Promise<object>} persisted component
     * @param {Object} request Original owner input; preserve scope and intent.
     * @override Preserve private admission, original context and owner side effects.
     */
    transfer: function (request) { return this.change(request, ENUMS.WasteCarbonOperation.TRANSFER.value); },
    /**
     * Unlocks the original recipient hold after the authorized coordinator confirms all component transfers.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @returns {*} Unlocks the original recipient hold after the authorized coordinator confirms all component transfers.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    finalize: function (request) { return this.change(request, ENUMS.WasteCarbonOperation.FINALIZE.value); },
    /**
     * Releases a reserved component; never reverses a completed transfer. @returns {Promise<object>} persisted component
     * @param {Object} request Original owner input; preserve scope and intent.
     * @override Preserve private admission, original context and owner side effects.
     */
    release: function (request) { return this.change(request, ENUMS.WasteCarbonOperation.RELEASE.value); }
};
