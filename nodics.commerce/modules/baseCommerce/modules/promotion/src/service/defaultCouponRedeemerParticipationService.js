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
/** @module promotion/service/defaultCouponRedeemerParticipationService @description Persists bilateral redeemer decisions separately from distribution consent; purchases retain accepted store scope. @layer service @owner promotion */
module.exports = {
    /** Rejects missing authority, one-sided consent or changed immutable agreements. */
    fail: function () { throw new CLASSES.NodicsError('ERR_PROMOTION_COUPON_PARTICIPATION_UNCONFIRMED'); },
    /** Exact offer aggregate identity. */
    code: function (r, promotionCode) { return SERVICE.DefaultCouponOfferAllocationService.code('participation', [r.tenant, promotionCode]); },
    /** Validates selected versus all eligible stores as an explicit business choice. */
    scope: function (value) {
        const rules = SERVICE.DefaultCouponOfferService;
        rules.object(value, ['mode', 'storeCodes']);
        if (value.mode === 'ALL_ELIGIBLE' && value.storeCodes === undefined) return { mode: 'ALL_ELIGIBLE' };
        if (value.mode !== 'SELECTED') this.fail();
        return { mode: 'SELECTED', storeCodes: rules.codes(value.storeCodes, rules.settings().maximumStores) };
    },
    /** Reuses the signed administration permission and fresh Profile DENY checks for each deciding Enterprise. */
    authorize: async function (r, enterpriseCode) {
        await SERVICE.DefaultCouponSellerAuthorizationService.issuer(r, enterpriseCode);
        await SERVICE.DefaultCouponSellerAuthorizationService.activeEnterprise(r, enterpriseCode);
    },
    /** Persists issuer invitation, exact redeemer acceptance or withdrawal with revision and command replay checks. */
    decide: async function (request) {
        const r = { ...request, authData: structuredClone(request.authData), payload: structuredClone(request.payload) };
        const input = r.payload || {}, rules = SERVICE.DefaultCouponOfferService, seller = SERVICE.DefaultCouponSellerAuthorizationService;
        rules.object(input, ['action', 'redeemerEnterpriseCode', 'scope', 'expectedRevision', 'commandReference']);
        rules.identifier(input.redeemerEnterpriseCode); rules.identifier(input.commandReference);
        if (!['AUTHORIZE', 'ACCEPT', 'WITHDRAW'].includes(input.action) || !Number.isSafeInteger(input.expectedRevision) || input.expectedRevision < 0) this.fail();
        const campaign = await seller.campaign(r, r.promotionCode), issuer = campaign.issuerEnterpriseRef?.code;
        if (!campaign.couponOffer || !issuer) this.fail();
        const actorEnterprise = r.authData?.enterpriseCode || r.authData?.entCode;
        if (input.action === 'AUTHORIZE' ? actorEnterprise !== issuer :
            input.action === 'ACCEPT' ? actorEnterprise !== input.redeemerEnterpriseCode :
                ![issuer, input.redeemerEnterpriseCode].includes(actorEnterprise)) this.fail();
        await this.authorize(r, actorEnterprise);
        const storeScope = input.action === 'AUTHORIZE' ? this.scope(input.scope) : undefined;
        if (input.action !== 'AUTHORIZE' && input.scope !== undefined) this.fail();
        const persistence = SERVICE.DefaultCouponAcquisitionPersistenceService, code = this.code(r, campaign.code);
        return persistence.transaction(r, ['couponRedeemerAgreement'], async scoped => {
            const current = await persistence.read('couponRedeemerAgreement', scoped, code);
            const entries = structuredClone(current?.evidence.entries || []), index = entries.findIndex(item => item.enterpriseCode === input.redeemerEnterpriseCode);
            const previous = index < 0 ? undefined : entries[index];
            if (previous?.commandReference === input.commandReference) {
                if (!isDeepStrictEqual(previous.command, input) || previous.actorEnterprise !== actorEnterprise) this.fail();
                return structuredClone(previous);
            }
            if ((current?.revision || 0) !== input.expectedRevision) this.fail();
            let next;
            if (input.action === 'AUTHORIZE') {
                if (previous) this.fail();
                next = { enterpriseCode: input.redeemerEnterpriseCode, issuerEnterpriseCode: issuer, scope: storeScope,
                    status: 'INVITED', agreementRevision: 1, authorizedBy: r.authData.loginId, authorizedAt: new Date().toISOString() };
            } else {
                if (!previous || input.action === 'ACCEPT' && previous.status !== 'INVITED' ||
                    input.action === 'WITHDRAW' && !['INVITED', 'ACCEPTED'].includes(previous.status)) this.fail();
                next = { ...previous, status: input.action === 'ACCEPT' ? 'ACCEPTED' : 'WITHDRAWN',
                    agreementRevision: previous.agreementRevision + 1,
                    [input.action === 'ACCEPT' ? 'acceptedBy' : 'withdrawnBy']: r.authData.loginId,
                    [input.action === 'ACCEPT' ? 'acceptedAt' : 'withdrawnAt']: new Date().toISOString() };
                if (input.action === 'ACCEPT' && previous.scope.mode === 'SELECTED') {
                    for (const storeCode of previous.scope.storeCodes) {
                        const store = await SERVICE.DefaultStoreMerchantReadService.read(r, storeCode);
                        if (store?.enterpriseRef?.code !== input.redeemerEnterpriseCode) this.fail();
                    }
                }
            }
            next = { ...next, commandReference: input.commandReference, command: input, actorEnterprise };
            if (index < 0) entries.push(next); else entries[index] = next;
            if (entries.length > rules.settings().maximumParticipants) this.fail();
            await this.authorize(r, actorEnterprise);
            await persistence.write('couponRedeemerAgreement', scoped, current,
                SERVICE.DefaultCouponOfferAllocationService.record(scoped, campaign, code, { entries }, current));
            return structuredClone(next);
        });
    },
    /** Captures original issuer stores and only fully accepted additional Enterprises at purchase. */
    capture: async function (r, campaign) {
        const issuer = campaign.issuerEnterpriseRef?.code;
        SERVICE.DefaultCouponOfferService.identifier(issuer);
        const ownScope = campaign.conditions?.storeCodes ? this.scope({ mode: 'SELECTED', storeCodes: campaign.conditions.storeCodes }) :
            this.scope({ mode: 'ALL_ELIGIBLE' });
        const current = await SERVICE.DefaultCouponAcquisitionPersistenceService.read('couponRedeemerAgreement', r, this.code(r, campaign.code));
        if (r.transactionContext) {
            await SERVICE.DefaultCouponAcquisitionPersistenceService.write('couponRedeemerAgreement', r, current,
                SERVICE.DefaultCouponOfferAllocationService.record(r, campaign, this.code(r, campaign.code),
                    current?.evidence || { entries: [] }, current));
        }
        const accepted = [{ enterpriseCode: issuer, issuerEnterpriseCode: issuer, scope: ownScope, agreementRevision: campaign.revision }];
        for (const entry of current?.evidence.entries || []) {
            if (entry.issuerEnterpriseCode !== issuer || entry.enterpriseCode === issuer) this.fail();
            if (entry.status === 'ACCEPTED') accepted.push({ enterpriseCode: entry.enterpriseCode, issuerEnterpriseCode: issuer,
                scope: this.scope(entry.scope), agreementRevision: entry.agreementRevision, acceptedAt: entry.acceptedAt,
                authorizedAt: entry.authorizedAt, participationCode: current.code });
        }
        if (accepted.length > SERVICE.DefaultCouponOfferService.settings().maximumParticipants) this.fail();
        return accepted;
    },
    /** Validates retained purchased scope against current signed staff and canonical live Store ownership. */
    authorizeRedemption: async function (r, coupon) {
        const retained = SERVICE.DefaultCouponOfferService.retained(coupon);
        const merchant = SERVICE.DefaultDigitalCommerceMerchantService, staff = await merchant.staff(r);
        const outlet = await merchant.withStore(staff, { enterpriseCode: r.enterpriseCode });
        if (!merchant.scoped(staff, outlet) || (outlet.store?.enterpriseCode || outlet.store?.enterpriseRef?.code) !== r.enterpriseCode ||
            outlet.store?.enterpriseRef?.code !== undefined && outlet.store.enterpriseRef.code !== r.enterpriseCode) this.fail();
        const accepted = retained.participation.find(entry => entry.enterpriseCode === r.enterpriseCode);
        if (!accepted || accepted.issuerEnterpriseCode !== coupon.issuerEnterpriseRef?.code ||
            this.scope(accepted.scope).mode === 'SELECTED' && !accepted.scope.storeCodes.includes(outlet.store.code)) this.fail();
        return { issuerEnterpriseCode: coupon.issuerEnterpriseRef.code, redeemerEnterpriseCode: r.enterpriseCode,
            storeCode: outlet.store.code, storeRevision: outlet.store.revision, agreementRevision: accepted.agreementRevision };
    },
};
