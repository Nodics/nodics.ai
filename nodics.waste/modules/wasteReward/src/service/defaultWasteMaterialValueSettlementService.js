/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module wasteReward/service/defaultWasteMaterialValueSettlementService
 * @description Persists payment-covered release intent, invokes existing Loyalty earning,
 * and reconciles the same earning identity after interruption. Never executes recycler payment or updates a balance.
 * @owner wasteReward @layer service
 * @override Replace qualified financial adapters through CONFIG; Loyalty remains authoritative for admission and accounting.
 */
module.exports = {
    /**
     * Resolves the effective assessment/evidence owner.
     * @returns {Object} Effective material assessment owner; does not itself mutate records.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    assessment: function () { return SERVICE.DefaultWasteMaterialValueAssessmentService; },
    /**
     * Unwraps standard owner responses without inferring success from transport alone.
     * @param {Object} response Dependency response envelope to validate.
     * @returns {Object} Validated response payload; transport success alone is insufficient.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    unwrap: function (response) {
        let value = response;
        for (let n = 0; n < 5 && value && !Array.isArray(value); n++) {
            if (value.error || value.success === false || value.acknowledged === false || /^ERR_/.test(value.code || '') ||
                value.errors && (!Array.isArray(value.errors) || value.errors.length))
                this.assessment().fail('LOYALTY', 'Loyalty returned unsuccessful evidence');
            if (value.data !== undefined) value = value.data;
            else if (value.result !== undefined) value = value.result;
            else break;
        }
        return value;
    },
    /**
     * Uses the existing module transport with configured remote authority and canonical internal authentication.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @param {string} apiName Canonical Loyalty capability API name.
     * @param {Object} body Owner-built remote payload; does not replace trusted request scope.
     * @returns {Promise<*>} Uses the existing module transport with configured remote authority and canonical internal authentication.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    loyalty: async function (request, apiName, body) {
        const settings = this.assessment().settings(request).loyalty;
        const response = await SERVICE.DefaultModuleService.invokeModule({
            local: false, moduleName: settings.moduleName, connectionName: settings.connectionName, targetAuthority: settings.targetAuthority,
            apiName, methodName: 'POST', tenant: request.tenant, request: { tenant: request.tenant },
            requireInternalAuth: true,
            requestBody: body, header: {
                'Idempotency-Key': body.idempotencyKey, 'X-Correlation-Id': body.correlationId || request.correlationId || body.idempotencyKey },
            timeoutMs: settings.timeoutMs, maxAttempts: 1
        });
        return this.unwrap(response);
    },
    /**
     * Verifies actual receipt of recycler funds and exact covered allocations before freezing release.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @param {Object} batch Persisted material valuation and frozen allocation evidence.
     * @param {Object} allocation Original-beneficiary allocation in the persisted batch or lot.
     * @returns {Promise<*>} Verifies actual receipt of recycler funds and exact covered allocations before freezing release.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    payment: async function (request, batch, allocation) {
        const owner = this.assessment(), settings = owner.settings(request);
        const payment = await owner.evidence(request, 'payment', {
            evidenceRef: owner.reference(request.payload.paymentEvidenceRef), batchRef: batch.batchRef,
            valuationRef: batch.valuationRef, allocationCode: allocation.code
        });
        if (payment.status !== ENUMS.WasteMaterialEvidenceStatus.CONFIRMED.key || !owner.same(payment.batchRef, batch.batchRef) ||
            !owner.same(payment.valuationRef, batch.valuationRef) || !owner.same(payment.payerRef, batch.payerRef) ||
            !owner.same(payment.payeeRef, batch.payeeRef) || payment.currency !== batch.currency ||
            payment.synthetic !== batch.synthetic || !Array.isArray(payment.coverage))
            owner.fail('PAYMENT', 'Recycler payment does not match confirmed valuation');
        owner.reference(payment.paymentRef); owner.reference(payment.confirmationRef);
        const paid = owner.minor(payment.amount, batch.policy.currencyScale, settings);
        const seen = new Set();
        let covered = 0n;
        for (const row of payment.coverage) {
            const target = batch.allocations.find(item => item.code === row.allocationCode);
            if (!target || seen.has(row.allocationCode)) owner.fail('PAYMENT', 'Payment allocation coverage is invalid');
            seen.add(row.allocationCode);
            const value = owner.minor(row.amount, batch.policy.currencyScale, settings);
            if (value !== owner.minor(target.attributedValue, batch.policy.currencyScale, settings))
                owner.fail('PAYMENT', 'A release requires evidenced coverage of its complete attributed material value');
            covered += value;
        }
        if (!seen.has(allocation.code) || covered > paid || paid <= 0n ||
            paid > owner.minor(batch.confirmedValue, batch.policy.currencyScale, settings))
            owner.fail('PAYMENT', 'Payment does not cover this allocation');
        // Previous pending intents consume coverage too; retries cannot allocate the same receipt twice.
        const sameReceipt = batch.releases.filter(item => owner.same(item.payment.paymentRef, payment.paymentRef));
        const priorCodes = new Set(sameReceipt.map(item => item.allocationCode));
        const union = new Set([...priorCodes, ...seen]);
        let committed = 0n;
        for (const code of union) committed += owner.minor(batch.allocations.find(item => item.code === code).attributedValue, batch.policy.currencyScale, settings);
        if (committed > paid) owner.fail('PAYMENT', 'Receipt coverage was already committed to other allocations');
        return owner.copy(payment);
    },
    /**
     * Reconciles a frozen release through the identical Loyalty source key and verifies returned ledger binding.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @param {Object} batch Persisted material valuation and frozen allocation evidence.
     * @param {Object} release Frozen release intent with its original payment and Loyalty source binding.
     * @returns {Promise<*>} Reconciles a frozen release through the identical Loyalty source key and verifies returned ledger binding.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    finish: async function (request, batch, release) {
        const owner = this.assessment(), store = owner.store();
        if (release.status === ENUMS.WasteMaterialReleaseStatus.COMPLETED.key) return release;
        const allocation = batch.allocations.find(item => item.code === release.allocationCode), policy = batch.policy;
        if (!release.walletCode) {
            const wallet = await this.loyalty(request, '/wallets', {
                ownerType: allocation.ownerRef.schema === 'enterprise' ? 'ENTERPRISE' : 'CUSTOMER', ownerCode: allocation.ownerRef.code
            });
            if (!wallet?.code) owner.fail('LOYALTY', 'Canonical wallet identity is required');
            const current = await store.one('wasteMaterialValueBatch', request, batch.code);
            const active = current?.releases.find(item => item.allocationCode === allocation.code);
            if (!active || active.operationKey !== release.operationKey) owner.fail('CONFLICT', 'Release identity changed');
            if (active.status === ENUMS.WasteMaterialReleaseStatus.COMPLETED.key) return active;
            if (active.walletCode) release = active;
            else {
                const frozen = { ...active, walletCode: wallet.code };
                const saved = await store.update('wasteMaterialValueBatch', request, current,
                    { releases: current.releases.map(item => item.allocationCode === allocation.code ? frozen : item) });
                release = saved?.releases.find(item => item.allocationCode === allocation.code);
                if (release?.walletCode !== wallet.code) owner.fail('CONFLICT', 'Wallet binding must be reconciled before credit');
            }
        }
        const result = await this.loyalty(request, '/reward-earnings', {
            walletCode: release.walletCode, programCode: policy.programCode, rewardTypeCode: policy.rewardTypeCode,
            amount: allocation.rewardAmount, scale: policy.rewardScale,
            sourceType: 'WASTE_MATERIAL_VALUE', sourceCode: allocation.code, targetType: 'WASTE_CONTRIBUTION',
            targetCode: allocation.contributionRef.code, reasonCode: 'RECYCLER_PAID_MATERIAL_VALUE',
            idempotencyKey: release.operationKey, correlationId: request.correlationId || release.operationKey,
            metadata: { sourceLabel: 'Material value', batchCode: batch.code, allocationCode: allocation.code,
                originalOwnerRef: allocation.ownerRef, contributionRef: allocation.contributionRef, receiptRef: allocation.receiptRef,
                paymentRef: release.payment.paymentRef, valuationRef: batch.valuationRef, currency: batch.currency,
                beneficiaryValue: allocation.beneficiaryValue, policyCode: policy.code, policyVersion: policy.version,
                evidenceHash: batch.evidenceHash, synthetic: batch.synthetic }
        });
        const raw = this.unwrap(result?.ledgerEntry), entry = Array.isArray(raw) ? raw[0] : raw;
        if (!entry?.code || entry.entryType !== 'EARN' || entry.walletCode !== release.walletCode || entry.programCode !== policy.programCode ||
            entry.rewardTypeCode !== policy.rewardTypeCode || entry.sourceType !== 'WASTE_MATERIAL_VALUE' ||
            entry.sourceCode !== allocation.code || entry.idempotencyKey !== release.operationKey ||
            entry.targetType !== 'WASTE_CONTRIBUTION' || entry.targetCode !== allocation.contributionRef.code ||
            entry.reasonCode !== 'RECYCLER_PAID_MATERIAL_VALUE' ||
            entry.metadata?.sourceLabel !== 'Material value' || entry.metadata?.evidenceHash !== batch.evidenceHash ||
            !owner.same(entry.metadata?.paymentRef, release.payment.paymentRef) ||
            !owner.same(entry.metadata?.originalOwnerRef, allocation.ownerRef) ||
            owner.minor(String(entry.amount), policy.rewardScale, owner.settings(request)) !==
                owner.minor(allocation.rewardAmount, policy.rewardScale, owner.settings(request)))
            owner.fail('LOYALTY', 'Authoritative earning evidence does not match the frozen release');
        const current = await store.one('wasteMaterialValueBatch', request, batch.code);
        const active = current?.releases.find(item => item.allocationCode === allocation.code);
        if (!active || active.operationKey !== release.operationKey) owner.fail('CONFLICT', 'Release recovery binding changed');
        if (active.status === ENUMS.WasteMaterialReleaseStatus.COMPLETED.key) return active;
        const completed = { ...active, status: ENUMS.WasteMaterialReleaseStatus.COMPLETED.key, ledgerRef: { module: 'loyaltyLedger', schema: 'rewardLedgerEntry', code: entry.code },
            walletCode: release.walletCode, completedAt: new Date().toISOString() };
        const saved = await store.update('wasteMaterialValueBatch', request, current, {
            releases: current.releases.map(item => item.allocationCode === allocation.code ? completed : item)
        });
        const persisted = saved?.releases.find(item => item.allocationCode === allocation.code);
        if (persisted?.status !== ENUMS.WasteMaterialReleaseStatus.COMPLETED.key || persisted.ledgerRef?.code !== entry.code)
            owner.fail('CONFLICT', 'Earning exists; retry the original release to reconcile persistence');
        return persisted;
    },
    /**
     * Freezes qualified payment coverage before any earning; duplicate and interrupted commands reuse the same source.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @returns {Promise<*>} Freezes qualified payment coverage before any earning; duplicate and interrupted commands reuse the same source.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    release: async function (request) {
        const owner = this.assessment(), store = owner.store(), body = request.payload || {};
        owner.authorize(request, 'waste.materialValue.release');
        const batch = await store.one('wasteMaterialValueBatch', request, body.batchCode);
        if (!batch) owner.fail('NOT_FOUND', 'Material-value batch is unavailable');
        const allocation = batch.allocations.find(item => item.code === body.allocationCode);
        if (!allocation) owner.fail('NOT_FOUND', 'Material-value allocation is unavailable');
        const existing = batch.releases.find(item => item.allocationCode === allocation.code);
        if (existing) {
            if (body.paymentEvidenceRef && !owner.same(existing.requestedPaymentRef, body.paymentEvidenceRef))
                owner.fail('CONFLICT', 'Release is already bound to different payment evidence');
            return this.finish(request, batch, existing);
        }
        if (owner.minor(allocation.rewardAmount, batch.policy.rewardScale, owner.settings(request)) <= 0n)
            owner.fail('POLICY', 'This allocation has no contributor reward entitlement');
        const payment = await this.payment(request, batch, allocation);
        const paymentRef = payment.paymentRef;
        const paymentClaimCode = 'MATERIAL_PAYMENT_' + owner.hash([paymentRef.module, paymentRef.schema, paymentRef.code]);
        const priorClaim = await store.one('wasteMaterialValuePaymentClaim', request, paymentClaimCode);
        if (priorClaim && priorClaim.batchCode !== batch.code) owner.fail('PAYMENT', 'Payment receipt is already bound to a different batch');
        if (!priorClaim) await store.create('wasteMaterialValuePaymentClaim', request,
            { code: paymentClaimCode, batchCode: batch.code, paymentRef, revision: 0 });
        const release = { allocationCode: allocation.code, operationKey: allocation.code + ':material-value',
            status: ENUMS.WasteMaterialReleaseStatus.CREDIT_PENDING.key, requestedPaymentRef: owner.reference(body.paymentEvidenceRef), payment,
            originalOwnerRef: allocation.ownerRef, actorRef: request.actorRef || null,
            sourceActor: { principalType: request.authData.principalType, principalCode: request.authData.loginId },
            recordedAt: new Date().toISOString() };
        const saved = await store.update('wasteMaterialValueBatch', request, batch, { releases: [...batch.releases, release] });
        const persisted = saved?.releases.find(item => item.allocationCode === allocation.code);
        if (!persisted || persisted.operationKey !== release.operationKey ||
            !owner.same(persisted.payment.paymentRef, payment.paymentRef)) owner.fail('CONFLICT', 'Payment intent persistence requires reconciliation');
        return this.finish(request, saved, persisted);
    }
};
