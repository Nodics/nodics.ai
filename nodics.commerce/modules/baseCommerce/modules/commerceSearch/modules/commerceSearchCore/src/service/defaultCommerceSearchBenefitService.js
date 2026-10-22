/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/**
 * @module commerceSearchCore/service/benefit
 * @description Resolves agreement coverage and Promotion-owned coupon membership over the complete
 * Product-eligible set.
 * @layer service
 * @owner commerceSearchCore
 * @override Preserve canonical owner reads, exact Enterprise identity, bounded completeness and no
 * public rule/financial disclosure.
 * @remarks Search consumes Agreement benefit coverage and Promotion membership through effective
 * owners. Coverage is dynamic within complete eligible Products; no duplicate commercial assignment,
 * issuer or policy authority is created.
 * Inputs and outputs are specified on each exported member below.
 * Effects and failures remain in the existing owner flow; missing evidence is never synthetic success.
 * Exported members: policy, benefit, validatePublication, memberships, expand.
 * @override Customize through the existing loader-visible module members, preserving private
 * authority.
 */
module.exports = {
    /**
     * Uses the effective Search policy owner.
     * @returns {Object} Validated policy from the effective Search policy owner.
     * @remarks Effects: Registry/configuration read only.
     * Failure behavior: Propagates missing or invalid owner policy.
     * @override Override through the effective module member; retain the original owner, scope and
     * evidence checks described above.
     */
    policy: function () { return SERVICE.DefaultCommerceSearchPolicyService.policy(); },
    /**
     * Resolves an agreed benefit without treating a projection as a commercial receipt.
     * @param {Object} request Original owner request with tenant, authData and operation selectors;
     * payload is not authority.
     * @param {Object} reference Exact canonical owner reference to resolve.
     * @returns {Promise<Object|undefined>} Current Agreement-owned benefit or unavailable coverage.
     * @remarks Effects: Read-only canonical Agreement resolution; no paid receipt is manufactured.
     * Failure behavior: Rejects absent owner and propagates failed benefit resolution.
     * @override Override through the effective module member; retain the original owner, scope and
     * evidence checks described above.
     */
    benefit: async function (request, reference) {
        const owner = SERVICE.DefaultCommercialAgreementOperationService;
        if (!owner?.resolveBenefit) throw new Error('Commercial agreement owner is unavailable');
        return owner.resolveBenefit(request, reference);
    },
    /**
     * Checks staged scope and independent timing against the agreed coverage before publishing.
     * @param {Object} request Original owner request with tenant, authData and operation selectors;
     * payload is not authority.
     * @param {Object} rule Validated Search rule including scope, timing and benefit identity.
     * @returns {Promise<Object>} Agreement benefit covering the full rule Store and date window.
     * @remarks Effects: Reads publication admission; does not publish or modify benefit assignments.
     * Failure behavior: Rejects invalid rule dates, absent owner or coverage outside agreement scope.
     * @override Override through the effective module member; retain the original owner, scope and
     * evidence checks described above.
     */
    validatePublication: async function (request, rule) {
        SERVICE.DefaultCommerceSearchPolicyService.validate(rule);
        if (!rule.validFrom || !rule.validTo) throw new Error('Commercial boosts require explicit dates');
        const owner = SERVICE.DefaultCommercialAgreementOperationService;
        if (!owner?.authorizeBenefitPublication) throw new Error('Commercial agreement publication authority is unavailable');
        const benefit = await owner.authorizeBenefitPublication({ ...request, now: rule.validFrom }, rule.benefitRef);
        if (!benefit || benefit.storeCode !== rule.storeCode || Date.parse(rule.validFrom) < Date.parse(benefit.validFrom) ||
            Date.parse(rule.validTo) > Date.parse(benefit.validTo)) throw new Error('Search rule exceeds agreed benefit coverage');
        return benefit;
    },
    /**
     * Reads complete coupon membership in batches bounded by Promotion's effective owner property.
     * @param {Object} request Original caller context, passed unchanged to every owner read.
     * @param {Object[]} products Complete eligible Product candidates; only coupon Products are selected.
     * @returns {Promise<Map<string,string>>} Exact Product-to-issuer membership after every batch validates.
     * @throws {Error} Invalid owner bounds, incomplete/duplicate/foreign results or owner failures abort the whole read.
     * @override Preserve original authority and complete coverage; never copy owner defaults or return partial ranking.
     */
    memberships: async function (request, products) {
        const owner = SERVICE.DefaultPromotionOperationService;
        const candidates = new Set(products.filter(product => product.localizedAttributes?.digitalDeliveryType === 'COUPON_CODE')
            .map(product => product.productCode));
        if (!candidates.size) return new Map();
        if (typeof owner?.couponIssuerMemberships !== 'function')
            throw new Error('Canonical complete coupon membership owner is unavailable');
        const maximum = CONFIG.get('promotion')?.couponIssuerMembership?.maximumProducts;
        if (!Number.isSafeInteger(maximum) || maximum < 1)
            throw new Error('Canonical coupon membership owner bound is invalid');
        const codes = [...candidates], result = new Map();
        for (let offset = 0; offset < codes.length; offset += maximum) {
            const batch = codes.slice(offset, offset + maximum), expected = new Set(batch);
            const rows = await owner.couponIssuerMemberships(request, batch);
            if (!Array.isArray(rows) || rows.length !== batch.length) throw new Error('Canonical coupon membership is incomplete');
            for (const row of rows) {
                if (!expected.has(row?.productCode) || result.has(row.productCode) ||
                    typeof row.issuerEnterpriseCode !== 'string' || !row.issuerEnterpriseCode)
                    throw new Error('Canonical coupon membership is invalid');
                result.set(row.productCode, row.issuerEnterpriseCode);
            }
        }
        return result;
    },
    /**
     * Expands dynamic selected/all coverage only within supplied candidates and deduplicates the same
     * entitlement across rules.
     * @param {Object} request Original owner request with tenant, authData and operation selectors;
     * payload is not authority.
     * @param {Object[]} products Complete eligible Product candidate set.
     * @param {Object[]} rules Applicable validated rules over the complete candidate set.
     * @returns {Promise<Object[]>} Expanded bounded BOOST rules with stable entitlement deduplication.
     * @remarks Effects: Reads complete Promotion memberships and current Agreement coverage; no public
     * financial details or writes.
     * Failure behavior: Any malformed/incomplete owner read aborts expansion; missing current coverage
     * does not apply.
     * @override Override through the effective module member; retain the original owner, scope and
     * evidence checks described above.
     */
    expand: async function (request, products, rules) {
        const memberships = await this.memberships(request, products), result = [], used = new Set();
        const ordered = [...rules].sort((a, b) =>
            SERVICE.DefaultCommerceSearchPolicyService.priority(b) - SERVICE.DefaultCommerceSearchPolicyService.priority(a) ||
            String(a.code).localeCompare(String(b.code)));
        for (const rule of ordered) {
            if (!rule.benefitRef) { result.push(rule); continue; }
            const benefit = await this.benefit(request, rule.benefitRef);
            if (!benefit || benefit.storeCode !== request.storeCode) continue;
            const key = JSON.stringify([request.tenant, benefit.agreementCode, benefit.benefitCode]);
            if (used.has(key)) continue;
            used.add(key);
            const selected = new Set(benefit.productCodes);
            const actions = products.filter(product => memberships.get(product.productCode) === benefit.enterpriseCode &&
                (benefit.targetType === 'ALL_ENTERPRISE_COUPONS' || selected.has(product.productCode)))
                .map(product => ({ actionType: 'BOOST', productCode: product.productCode }));
            for (let offset = 0; offset < actions.length; offset += this.policy().maximumActionsPerRule) {
                const expanded = { ...rule, code: rule.code + ':' + offset, actions: actions.slice(offset, offset + this.policy().maximumActionsPerRule) };
                delete expanded.benefitRef;
                result.push(expanded);
            }
        }
        return result;
    }
};
