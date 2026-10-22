/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
const crypto = require('node:crypto');
const exactAmount = require('../../../../../nodics.foundation/modules/nCommon/src/utils/exactAmount');
const DEFAULTS = require('../../config/properties').wasteMaterialValue;

/**
 * @module wasteReward/service/defaultWasteMaterialValueAssessmentService
 * @description Resolves qualified valuation and physical contribution evidence into immutable,
 * exact material-value allocations persisted in a batch aggregate. No wallet mutation or payment execution.
 * @owner wasteReward @layer service
 * @override Select qualified valuation/payment adapters through trusted CONFIG; preserve original beneficiaries.
 */
module.exports = {
    /**
     * Resolves pure shared decimal arithmetic without activating a Loyalty runtime.
     * @returns {Object} nCommon exact arithmetic; no persistence or configuration effects.
     * @override Replace through this member while preserving exact parsing and rejection.
     */
    amount: function () { return exactAmount; },
    /**
     * Uses existing generated persistence, not an in-memory owner.
     * @returns {Object} Effective generated-repository adapter; does not itself read or write.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    store: function () { return SERVICE.DefaultWastePersistenceService; },
    /**
     * Raises owner errors without leaking source data.
     * @param {string} code Exact record identity or stable owner error code, as described above.
     * @param {string} message Content-safe owner diagnostic.
     * @returns {never} Always throws a content-safe owner error; no business writes.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    fail: function (code, message) { this.store().fail('ERR_MATERIAL_VALUE_' + code, message); },
    /**
     * Deep copies durable JSON evidence.
     * @param {*} value Value to validate, normalize or project as described above.
     * @returns {*} Detached evidence copy; leaves the input unchanged.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    copy: function (value) { return JSON.parse(JSON.stringify(value)); },
    /**
     * Hashes ordered stable identities.
     * @param {*} value Value to validate, normalize or project as described above.
     * @returns {string} Deterministic digest of ordered identity components; no persistence.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    hash: function (value) { return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex'); },
    /**
     * Applies complete owner ranges without introducing another defaults catalogue.
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
     * Resolves complete framework defaults plus explicit overrides and validates reusable controls.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @returns {*} Resolves complete framework defaults plus explicit overrides and validates reusable controls.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    settings: function (request) {
        const supplied = typeof CONFIG !== 'undefined' ? CONFIG.get('wasteMaterialValue', request.tenant) || {} : {};
        for (const key of ['evidence', 'limits', 'validation', 'profile', 'loyalty'])
            if (supplied[key] !== undefined && (!supplied[key] || Object.getPrototypeOf(supplied[key]) !== Object.prototype))
                this.fail('CONFIGURATION', 'Invalid material-value configuration object');
        const settings = { evidence: { ...DEFAULTS.evidence, ...supplied.evidence },
            limits: { ...DEFAULTS.limits, ...supplied.limits }, loyalty: { ...DEFAULTS.loyalty, ...supplied.loyalty },
            validation: Object.fromEntries(Object.entries(DEFAULTS.validation).map(([key, range]) =>
                [key, supplied.validation?.[key] === undefined ? range : supplied.validation[key] && typeof supplied.validation[key] === 'object'
                    ? { ...range, ...supplied.validation[key] } : supplied.validation[key]])) };
        for (const [key, range] of Object.entries(settings.validation))
            if (!this.bounded(range?.minimum, range, key === 'amountScale')) this.fail('CONFIGURATION', 'Invalid material-value range');
        for (const [key, value] of Object.entries(settings.limits))
            if (!this.bounded(value, settings.validation[key === 'decimalDigits' ? key : key === 'providerTimeoutMs' ? 'timeoutMs' : 'operationalLimit']))
                this.fail('CONFIGURATION', 'Invalid material-value limit');
        if (typeof settings.evidence.allowSynthetic !== 'boolean' || !this.bounded(settings.loyalty.timeoutMs, settings.validation.timeoutMs))
            this.fail('CONFIGURATION', 'Invalid material-value policy');
        for (const name of ['valuationProviderService', 'paymentProviderService'])
            if (settings.evidence[name] !== null && (typeof settings.evidence[name] !== 'string' ||
                !/^[A-Za-z][A-Za-z0-9]*Service$/.test(settings.evidence[name])))
                this.fail('CONFIGURATION', 'Evidence provider must be a registered service name');
        if (!settings.loyalty.moduleName || !settings.loyalty.connectionName || !settings.loyalty.targetAuthority?.runtimeRole)
            this.fail('CONFIGURATION', 'Canonical Loyalty transport authority is required');
        return settings;
    },
    /**
     * Requires trusted internal service authority and the exact capability permission.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @param {string} permission Exact owner capability permission; not inferred from roles.
     * @returns {void} Admission succeeds without return data; effects and evidence checks are described above.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    authorize: function (request, permission) {
        const auth = request.authData || {}, security = SERVICE.DefaultSecuredRequestPipelineService;
        if (!request.tenant || (auth.tenant && auth.tenant !== request.tenant) || auth.principalType !== 'service' || !auth.loginId ||
            !security || !security.isPermissionGranted(permission, security.getGrantedPermissions(request), {}))
            this.fail('FORBIDDEN', 'Authorized owner service and tenant are required');
    },
    /**
     * Validates references without accepting unqualified evidence booleans.
     * @param {Object} ref Typed canonical reference containing module, schema and code.
     * @returns {Object} Validated immutable reference; no evidence lookup or persistence.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    reference: function (ref) {
        if (!ref || ['module', 'schema', 'code'].some(key => typeof ref[key] !== 'string' || !ref[key] || ref[key].length > 180))
            this.fail('EVIDENCE', 'A complete evidence reference is required');
        return this.copy(ref);
    },
    /**
     * Compares canonical identities independently of unrelated metadata.
     * @param {Object} a First canonical identity.
     * @param {Object} b Second canonical identity.
     * @returns {boolean} Whether canonical identities match; no effects.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    same: function (a, b) { return Boolean(a && b && a.module === b.module && a.schema === b.schema && a.code === b.code); },
    /**
     * Validates a canonical contributing owner; employees and holding parents are not beneficiaries.
     * @param {Object} ref Typed canonical reference containing module, schema and code.
     * @returns {Object} Validated canonical beneficiary descriptor; no identity mutation.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    owner: function (ref) {
        this.reference(ref);
        if (ref.module !== 'profile' || !['customer', 'enterprise'].includes(ref.schema)) this.fail('EVIDENCE', 'Original customer or Enterprise owner is required');
        return { module: 'profile', schema: ref.schema, code: ref.code };
    },
    /**
     * Uses existing exact decimal primitives with an explicit evidence-selected scale.
     * @param {*} value Value to validate, normalize or project as described above.
     * @param {number} scale Validated decimal precision from the canonical reward unit or issued lot.
     * @param {Object} settings Validated effective owner settings, including numeric bounds.
     * @returns {bigint} Exact minor units at the evidenced scale; no rounding or persistence.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    minor: function (value, scale, settings) {
        if (typeof value !== 'string' || value.replace('.', '').length > settings.limits.decimalDigits || !/^[0-9]+(\.[0-9]+)?$/.test(value) ||
            !this.bounded(scale, settings.validation.amountScale, true)) this.fail('AMOUNT', 'Invalid exact decimal amount or scale');
        const parsed = this.amount().parse(value.replace(/^0+(?=\d)/, ''));
        // Retain the established wire error while removing the foreign arithmetic dependency.
        if (parsed.scale > scale) this.store().fail('ERR_LOYALTY_AMOUNT_PRECISION', 'reward amount exceeds configured precision');
        return this.amount().align(parsed, { units: 0n, scale }).left;
    },
    /**
     * Preserves the recorded fixed-scale wire representation using shared formatting.
     * @param {bigint} value Exact minor units already validated by the owner.
     * @param {number} scale Recorded, validated scale.
     * @returns {string} Fixed-scale amount; no rounding, persistence or external calls.
     * @override Preserve scale and exact value when customizing presentation.
     */
    decimal: function (value, scale) {
        const [whole, fraction = ''] = this.amount().format(value, scale).split('.');
        return whole + (scale ? '.' + fraction.padEnd(scale, '0') : '');
    },
    /**
     * Validates nonnegative integer rational terms; no numeric defaults are selected.
     * @param {Object} ratio Recorded numerator and denominator terms.
     * @param {boolean} bounded Whether the ratio must not exceed one.
     * @param {Object} settings Validated effective owner settings, including numeric bounds.
     * @returns {*} Validates nonnegative integer rational terms; no numeric defaults are selected.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    ratio: function (ratio, bounded, settings) {
        if (!ratio || typeof ratio.numerator !== 'string' || typeof ratio.denominator !== 'string' ||
            !/^[0-9]+$/.test(ratio.numerator) || !/^[1-9][0-9]*$/.test(ratio.denominator) ||
            !this.bounded(ratio.numerator.length, settings.validation.ratioDigits) ||
            !this.bounded(ratio.denominator.length, settings.validation.ratioDigits))
            this.fail('POLICY', 'Explicit rational policy terms are required');
        const result = { numerator: BigInt(ratio.numerator), denominator: BigInt(ratio.denominator) };
        if (bounded && result.numerator > result.denominator) this.fail('POLICY', 'Contributor share exceeds confirmed value');
        return result;
    },
    /**
     * Applies the recorded rounding contract to a nonnegative rational.
     * @param {bigint} numerator Exact nonnegative rational numerator.
     * @param {bigint} denominator Positive rational denominator.
     * @param {string} mode Recorded rounding policy.
     * @returns {bigint} Rounded exact minor units under the recorded policy; no persistence.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    round: function (numerator, denominator, mode) {
        if (![ENUMS.WasteMaterialRoundingMode.DOWN.key, ENUMS.WasteMaterialRoundingMode.HALF_UP.key].includes(mode)) this.fail('POLICY', 'Recorded rounding mode is required');
        return numerator / denominator + (mode === ENUMS.WasteMaterialRoundingMode.HALF_UP.key && numerator % denominator * 2n >= denominator ? 1n : 0n);
    },
    /**
     * Retrieves qualified authoritative valuation/payment evidence through loader-selected providers.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @param {string} kind Fixed operation or evidence discriminator.
     * @param {Object} input Operation-specific command or evidence input described above; not authorization.
     * @returns {Promise<*>} Retrieves qualified authoritative valuation/payment evidence through loader-selected providers.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    evidence: async function (request, kind, input) {
        const settings = this.settings(request), policy = settings.evidence;
        const serviceName = policy[kind === 'valuation' ? 'valuationProviderService' : 'paymentProviderService'];
        if (!serviceName || !policy.qualificationRef) this.fail('UNAVAILABLE', 'Financial evidence source is not qualified');
        this.reference(policy.qualificationRef);
        const provider = SERVICE[serviceName], operation = kind === 'valuation' ? 'readValuation' : 'readPayment';
        if (typeof provider?.[operation] !== 'function') this.fail('UNAVAILABLE', 'Financial evidence provider is unavailable');
        const abort = new AbortController();
        let timer;
        try {
            const result = await Promise.race([
                provider[operation](this.copy(input), { tenant: request.tenant, qualificationRef: this.copy(policy.qualificationRef), signal: abort.signal }),
                new Promise((resolve, reject) => { timer = setTimeout(() => { abort.abort(); const error = new Error('Financial evidence timeout'); error.code = 'ERR_MATERIAL_VALUE_UNAVAILABLE'; reject(error); }, settings.limits.providerTimeoutMs); })
            ]);
            if (!result || typeof result.synthetic !== 'boolean' || (result.synthetic && !policy.allowSynthetic))
                this.fail('EVIDENCE', 'Financial evidence synthetic status is invalid');
            return result;
        } catch (error) {
            if (error?.code === 'ERR_MATERIAL_VALUE_EVIDENCE') throw error;
            this.fail('UNAVAILABLE', 'Qualified financial evidence could not be confirmed');
        } finally { clearTimeout(timer); }
    },
    /**
     * Resolves original owners and accepted physical facts from their repositories, never valuation caller fields.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @param {Object} item Original contribution reference and accepted physical facts.
     * @param {Object} policy Effective owner configuration or retained governed policy.
     * @param {Object} settings Validated effective owner settings, including numeric bounds.
     * @returns {Promise<*>} Resolves original owners and accepted physical facts from their repositories, never valuation caller fields.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    contribution: async function (request, item, policy, settings) {
        this.reference(item.contributionRef); this.reference(item.receiptRef);
        if (item.contributionRef.module !== 'wasteSubmission' || item.contributionRef.schema !== 'wasteSubmission' ||
            item.receiptRef.module !== 'wasteReceipt' || item.receiptRef.schema !== 'wasteReceipt')
            this.fail('EVIDENCE', 'Canonical contribution and physical receipt are required');
        const submission = await this.store().one('wasteSubmission', request, item.contributionRef.code);
        const receipt = await this.store().one('wasteReceipt', request, item.receiptRef.code);
        if (!submission || !receipt || receipt.submissionCode !== submission.code ||
            ![ENUMS.WasteReceiptStatus.RECEIVED.key, ENUMS.WasteReceiptStatus.PARTIALLY_RECEIVED.key].includes(receipt.receiptStatus)) this.fail('EVIDENCE', 'Accepted physical receipt is required');
        const assets = await this.store().list('wasteAsset', request, { sourceSubmissionCode: submission.code }, 2);
        if (assets.length > 1) this.fail('EVIDENCE', 'Ambiguous original contribution ownership');
        const ownerRef = this.owner(assets[0]?.originalOwnerRef || submission.originalOwnerRef || submission.submitterRef);
        if (assets[0] && submission.originalOwnerRef && !this.same(assets[0].originalOwnerRef, submission.originalOwnerRef))
            this.fail('EVIDENCE', 'Original owner evidence disagrees');
        const facts = receipt.receivedFacts || {}, categoryCode = facts.materialCategoryCode;
        const rule = policy.categories?.[categoryCode];
        if (!rule || ![ENUMS.WasteMaterialAttributionBasis.QUANTITY.key, ENUMS.WasteMaterialAttributionBasis.WEIGHT.key].includes(rule.basis) ||
            typeof rule.weight !== 'string' || !/^[1-9][0-9]*$/.test(rule.weight) ||
            !this.bounded(rule.weight.length, settings.validation.categoryWeightDigits))
            this.fail('POLICY', 'Recorded category attribution basis is required');
        const unit = rule.basis === ENUMS.WasteMaterialAttributionBasis.WEIGHT.key ? facts.weightUnitOfMeasure : facts.quantityUnitOfMeasure;
        const quantity = rule.basis === ENUMS.WasteMaterialAttributionBasis.WEIGHT.key ? receipt.receivedWeight : receipt.receivedQuantity;
        if (!unit || unit !== rule.unitOfMeasure || quantity === undefined || quantity === null) this.fail('EVIDENCE', 'Accepted quantity unit does not match policy');
        const basis = this.minor(String(quantity), policy.basisScale, settings);
        if (basis <= 0n) this.fail('EVIDENCE', 'Positive accepted contribution is required');
        return { contributionRef: this.reference(item.contributionRef), receiptRef: this.reference(item.receiptRef), ownerRef,
            categoryCode, acceptedQuantity: String(quantity), unitOfMeasure: unit, weight: (basis * BigInt(rule.weight)).toString(),
            individualValue: item.individualValue === undefined ? null : this.decimal(this.minor(item.individualValue, policy.currencyScale, settings), policy.currencyScale) };
    },
    /**
     * Builds and persists one immutable valuation/allocation snapshot from authoritative references.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @returns {Promise<*>} Builds and persists one immutable valuation/allocation snapshot from authoritative references.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    assess: async function (request) {
        this.authorize(request, 'waste.materialValue.assess');
        const settings = this.settings(request);
        const evidence = await this.evidence(request, 'valuation', { evidenceRef: this.reference(request.payload?.evidenceRef) });
        if (evidence.status !== ENUMS.WasteMaterialEvidenceStatus.CONFIRMED.key || !Array.isArray(evidence.contributions) || !evidence.contributions.length ||
            evidence.contributions.length > settings.limits.contributionsPerBatch) this.fail('EVIDENCE', 'Partner-confirmed valuation is required');
        for (const key of ['valuationRef', 'batchRef', 'payerRef', 'payeeRef', 'confirmationRef']) this.reference(evidence[key]);
        const policyRef = this.reference(evidence.policyRef);
        if (policyRef.module !== 'wasteReward' || policyRef.schema !== 'wasteMaterialValuePolicy' || evidence.policy !== undefined)
            this.fail('POLICY', 'Valuation must reference governed Waste Reward policy, not inline terms');
        const policy = await this.store().one('wasteMaterialValuePolicy', request, policyRef.code);
        if (!policy || policy.status !== ENUMS.WasteRecordStatus.ACTIVE.key || !policy.code || !policy.version || !policy.programCode || !policy.rewardTypeCode ||
            ![ENUMS.WasteMaterialCommercialModel.PROGRAM_FUNDED.key, ENUMS.WasteMaterialCommercialModel.CUSTOMER_SHARING.key].includes(policy.commercialModel) ||
            ![ENUMS.WasteMaterialRoundingMode.DOWN.key, ENUMS.WasteMaterialRoundingMode.HALF_UP.key].includes(policy.roundingMode) || typeof evidence.currency !== 'string' ||
            !/^[A-Z]{3}$/.test(evidence.currency) || policy.currency !== evidence.currency)
            this.fail('POLICY', 'Versioned allocation, reward program and conversion terms are required');
        const share = this.ratio(policy.contributorShare, true, settings), rate = this.ratio(policy.conversionRate, false, settings);
        if (policy.commercialModel === ENUMS.WasteMaterialCommercialModel.PROGRAM_FUNDED.key && share.numerator !== 0n) this.fail('POLICY', 'Program-funded model cannot create contributor payout');
        this.minor('0', policy.rewardScale, settings);
        const total = this.minor(evidence.confirmedValue, policy.currencyScale, settings);
        const code = 'MATERIAL_' + this.hash([evidence.batchRef.module, evidence.batchRef.schema, evidence.batchRef.code]);
        const existing = await this.store().one('wasteMaterialValueBatch', request, code);
        const evidenceHash = this.hash({ evidence, policy });
        if (existing) {
            if (existing.evidenceHash !== evidenceHash) this.fail('CONFLICT', 'Batch assessment terms are immutable; reconcile changed valuations');
            return existing;
        }
        const contributions = [], seen = new Set();
        for (const item of evidence.contributions) {
            const contribution = await this.contribution(request, item, policy, settings);
            const identity = this.hash([contribution.contributionRef, contribution.receiptRef]);
            if (seen.has(identity) || contributions.some(row => this.same(row.contributionRef, contribution.contributionRef)))
                this.fail('EVIDENCE', 'Contribution cannot be counted twice');
            seen.add(identity); contributions.push(contribution);
        }
        let individual = 0n;
        for (const row of contributions) if (row.individualValue !== null) individual += this.minor(row.individualValue, policy.currencyScale, settings);
        if (individual > total) this.fail('EVIDENCE', 'Individual values exceed confirmed batch value');
        const pooled = contributions.filter(row => row.individualValue === null), remainder = total - individual;
        const weight = pooled.reduce((sum, row) => sum + BigInt(row.weight), 0n);
        if ((!pooled.length && remainder !== 0n) || (pooled.length && weight <= 0n)) this.fail('EVIDENCE', 'Batch value does not reconcile');
        const portions = pooled.map(row => ({ row, amount: remainder * BigInt(row.weight) / weight, remainder: remainder * BigInt(row.weight) % weight }));
        let residue = remainder - portions.reduce((sum, row) => sum + row.amount, 0n);
        portions.sort((a, b) => a.remainder === b.remainder ? a.row.contributionRef.code.localeCompare(b.row.contributionRef.code) : a.remainder > b.remainder ? -1 : 1);
        for (const portion of portions) { if (residue > 0n) { portion.amount++; residue--; } portion.row.attributedValue = this.decimal(portion.amount, policy.currencyScale); }
        const allocations = contributions.map(row => {
            const attributedValue = row.individualValue === null ? row.attributedValue : row.individualValue;
            const amount = this.minor(attributedValue, policy.currencyScale, settings);
            const beneficiaryMinor = this.round(amount * share.numerator, share.denominator, policy.roundingMode);
            const rewardMinor = this.round(beneficiaryMinor * rate.numerator * 10n ** BigInt(policy.rewardScale),
                rate.denominator * 10n ** BigInt(policy.currencyScale), policy.roundingMode);
            return { ...row, code: 'ALLOCATION_' + this.hash([code, row.contributionRef]),
                attributedValue, beneficiaryValue: this.decimal(beneficiaryMinor, policy.currencyScale),
                rewardAmount: this.decimal(rewardMinor, policy.rewardScale) };
        });
        const record = { code, revision: 0, valuationRef: evidence.valuationRef, batchRef: evidence.batchRef,
            payerRef: evidence.payerRef, payeeRef: evidence.payeeRef, confirmationRef: evidence.confirmationRef,
            currency: evidence.currency, confirmedValue: this.decimal(total, policy.currencyScale), policy: this.copy(policy),
            synthetic: evidence.synthetic, evidenceHash, allocations, releases: [], recordedAt: new Date().toISOString(),
            assessedBy: { principalType: request.authData.principalType, principalCode: request.authData.loginId },
            qualificationRef: settings.evidence.qualificationRef };
        // Claim original contributions before creating the immutable batch; a crash resumes these same claims.
        for (const allocation of allocations) {
            const ref = allocation.contributionRef;
            const claimCode = 'MATERIAL_CONTRIBUTION_' + this.hash([ref.module, ref.schema, ref.code]);
            const prior = await this.store().one('wasteMaterialValueContributionClaim', request, claimCode);
            if (prior && (prior.batchCode !== code || prior.evidenceHash !== evidenceHash))
                this.fail('CONFLICT', 'Contribution already belongs to another material-value batch');
            if (!prior) await this.store().create('wasteMaterialValueContributionClaim', request,
                { code: claimCode, batchCode: code, evidenceHash, contributionRef: ref, revision: 0 });
        }
        const saved = await this.store().create('wasteMaterialValueBatch', request, record);
        if (!saved || saved.evidenceHash !== evidenceHash) this.fail('CONFLICT', 'Assessment persistence requires reconciliation');
        return saved;
    },
    /**
     * Reads original-owner allocations after service or current Profile participant admission.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @returns {Promise<*>} Reads original-owner allocations after service or current Profile participant admission.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    allocations: async function (request) {
        const owner = await SERVICE.DefaultWasteMaterialValueReadAccessService.resolve(request), settings = this.settings(request);
        const page = request.payload?.page ?? 1;
        if (!Number.isSafeInteger(page) || page < 1) this.fail('EVIDENCE', 'Invalid allocation page');
        const result = await this.store().page('wasteMaterialValueBatch', request, { allocations: { $elemMatch: {
            'ownerRef.module': owner.module, 'ownerRef.schema': owner.schema, 'ownerRef.code': owner.code
        } } }, page, settings.limits.pageSize);
        return { ...result, ownerRef: owner, source: 'PERSISTED_ASSESSMENTS', items: result.items.map(batch => ({
            batchCode: batch.code, sourceLabel: 'Material value', currency: batch.currency, synthetic: batch.synthetic,
            valuationRef: batch.valuationRef, currencyScale: batch.policy.currencyScale, rewardScale: batch.policy.rewardScale,
            policyRef: { code: batch.policy.code, version: batch.policy.version },
            programCode: batch.policy.programCode, rewardTypeCode: batch.policy.rewardTypeCode,
            allocations: batch.allocations.filter(item => this.same(item.ownerRef, owner)).map(item => {
                const release = batch.releases.find(row => row.allocationCode === item.code);
                return { code: item.code, contributionRef: item.contributionRef, receiptRef: item.receiptRef, attributedValue: item.attributedValue,
                    beneficiaryValue: item.beneficiaryValue, rewardAmount: item.rewardAmount,
                    status: release?.status || ENUMS.WasteMaterialReleaseStatus.AWAITING_PAYMENT.key, spendableHere: false,
                    paymentStatus: release ? ENUMS.WasteMaterialEvidenceStatus.CONFIRMED.key : ENUMS.WasteMaterialEvidenceStatus.NOT_CONFIRMED.key,
                    paymentRef: release?.payment?.paymentRef || null,
                    completedAt: release?.completedAt || null, ledgerRef: release?.ledgerRef || null };
            })
        })) };
    },
    /**
     * Reads complete evidence only for an authorized operational service.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @returns {Promise<*>} Reads complete evidence only for an authorized operational service.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    read: async function (request) {
        this.authorize(request, 'waste.materialValue.read');
        const batch = await this.store().one('wasteMaterialValueBatch', request, request.payload?.batchCode);
        if (!batch) this.fail('NOT_FOUND', 'Material-value batch is unavailable');
        return batch;
    }
};
