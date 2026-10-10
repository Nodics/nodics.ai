/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');
const fixture = require('./helpers/secureIssuanceFixture');
const secure = require('../src/service/defaultCouponSecureIssuanceService');
const seller = require('../src/service/defaultCouponSellerAuthorizationService');
const publication = require('../src/service/defaultPromotionPublicationService');
const setup = require('../src/service/defaultPromotionSetupContributionService');
const release = require('../../../../../../nodics.foundation/modules/nData/nImport/import/src/service/release/defaultDataReleaseService');
const releaseController = require('../../../../../../nodics.foundation/modules/nData/nImport/import/src/controller/release/defaultDataReleaseController');

/** @module promotion/test/couponDelegatedSecureIssuanceContract @description Proves issuer-authorized encrypted vendor stock through actual seller management, generated transaction and nSystem owners with isolated persistence/Profile ports. No native qualification, secrets or business data. @layer test @owner promotion */

/** Prepares an isolated admitted issuer campaign and issuer-reviewed consent through the existing owner, never imported grants. @param {Object} t Test context. @param {boolean} grant Whether to grant consent. @returns {Promise<Object>} Owner fixture. */
async function delegated(t, grant = true) {
    const f = fixture.create(t);
    f.policy.issuerEnterpriseRef = { ...f.policy.issuerEnterpriseRef, roleCode: 'ISSUER' };
    f.policy.vendorEnterpriseRef = { ...f.policy.vendorEnterpriseRef, code: 'sellerB', roleCode: 'MARKETPLACE_VENDOR' };
    f.policy.enterpriseRef = structuredClone(f.policy.issuerEnterpriseRef);
    f.campaign.policyFingerprint = publication.fingerprint(f.policy);
    f.request.authorization = 'Bearer isolated-test-context';
    f.settings.promotion.sellerAuthorization = { enabled: true, qualified: true, maximumSellers: 10 };
    f.state.permissions = ['commerce.promotion.manage', 'commerce.coupon.seller.manage'];
    SERVICE.DefaultSecuredRequestPipelineService = {
        getGrantedPermissions: () => f.state.permissions,
        isPermissionGranted: (permission, granted) => f.state.allowed && granted.includes(permission),
    };
    const scope = { tenantCode: f.request.tenant, scopeType: 'ENTERPRISE', scopeCode: 'issuerA' };
    SERVICE.DefaultModuleService = { invokeModule: async request => {
        assert.equal(request.tenant, f.request.tenant);
        if (f.state.onProfile) await f.state.onProfile(request);
        if (request.apiName === '/identity/scopes/me') {
            assert.equal(request.header.Authorization, f.request.authorization);
            assert.equal(request.header['X-Enterprise-Code'], 'issuerA');
            return { principalCode: f.state.principal || 'operatorA', scopes: [scope], deniedScopes: f.state.denied ? [scope] : [] };
        }
        assert.equal(request.apiName, '/references/read');
        assert.equal(request.methodName, 'POST');
        const code = request.requestBody?.codes?.[0];
        assert.ok(['issuerA', 'sellerB'].includes(code));
        assert.deepEqual(request.requestBody, { type: 'enterprise', codes: [code] });
        assert.deepEqual(request.request, { tenant: f.request.tenant });
        assert.equal(request.header, undefined);
        return [{ code, active: code !== f.state.inactive }];
    } };
    const update = SERVICE.DefaultPromotionService.update;
    SERVICE.DefaultPromotionService.update = async command => {
        SERVICE.DefaultPromotionBudgetAdmissionService.protect(command);
        await seller.protect(command);
        return update(command);
    };
    await SERVICE.DefaultPromotionBudgetAdmissionService.initialize(setup.campaignRequest(f.request, f.campaign));
    let command = 0;
    f.review = action => seller.manage({ ...f.request, promotionCode: f.policy.code, payload: {
        sellerEnterpriseCode: 'sellerB', expectedRevision: f.rows.promotion[0].revision,
        action, commandReference: 'review-command-' + (++command),
        ...(action === 'GRANT' ? { expiresAt: '2099-01-01T00:00:00.000Z' } : {}),
    } });
    if (grant) await f.review('GRANT');
    return f;
}

test('nImport HTTP contribution preflight and install retain original issuer bearer through real seller/secure owners', async t => {
    const f = await delegated(t), writes = f.state.writes, originalRows = structuredClone(f.rows);
    const previousFacade = global.FACADE;
    t.after(() => { global.FACADE = previousFacade; });
    f.settings.data = { dataReleases: { installers: { PROMOTION_CAMPAIGN_ISSUANCE: 'DefaultPromotionSetupContributionService' } } };
    const body = { releaseCodes: [f.request.contribution.releaseCode] };
    const http = { ...f.request, authorization: undefined, dataReleasePlan: [f.request.contribution],
        httpRequest: { headers: { authorization: f.request.authorization }, body } };
    const signed = structuredClone(http.authData), profileCalls = [];
    f.state.onProfile = command => { if (command.apiName === '/identity/scopes/me') profileCalls.push(command); };
    global.FACADE = { DefaultDataReleaseFacade: {
        preflight: async request => {
            assert.deepEqual(request.releaseRequest, { ...body, dataType: 'sample' });
            return release.preflightContributions(request, { tenant: request.tenant, releases: request.dataReleasePlan });
        },
        execute: request => release.invokeImport(request, 'sample'),
    } };
    const plan = await releaseController.preflightSample(http);
    assert.equal(plan[0].ready, true);
    assert.equal(plan[0].plan.couponBatches[0].action, 'ISSUE');
    assert.equal(f.state.writes, writes);
    assert.deepEqual(f.rows, originalRows);
    assert(profileCalls.length >= 2);
    assert(profileCalls.every(command => command.header.Authorization === f.request.authorization &&
        command.header['X-Enterprise-Code'] === signed.enterpriseCode));
    assert.equal(http.authorization, undefined);
    assert.deepEqual(http.authData, signed);
    const installed = await releaseController.executeSample(http);
    assert.equal(installed.contributions[0].data.couponBatches[0].replayed, false);
    assert.equal(f.rows.coupon.length, f.intent.quantity);
    assert.equal(f.rows.couponBatch[0].secureIssuance.command.actorId, signed.loginId);
    assert.equal(f.rows.couponBatch[0].secureIssuance.command.enterpriseCode, signed.enterpriseCode);
    assert.equal(f.rows.couponBatch[0].enterpriseCode, 'sellerB');
    assert(!JSON.stringify(installed).includes(f.request.authorization));
    const committed = structuredClone(f.rows), count = f.state.writes;
    assert.equal((await releaseController.executeSample(http)).contributions[0].data.couponBatches[0].replayed, true);
    assert.equal(f.state.writes, count);
    assert.deepEqual(f.rows, committed);
});

test('HTTP contribution rejects absent, malformed, body-only and conflicting bearer authority before issuance', async t => {
    const f = await delegated(t), writes = f.state.writes;
    const request = { ...f.request, authorization: undefined,
        httpRequest: { headers: { authorization: f.request.authorization }, body: {} } };
    for (const mutate of [
        r => { delete r.httpRequest.headers.authorization; },
        r => { r.httpRequest.headers.authorization = ['Bearer invalid-array']; },
        r => { r.httpRequest.headers.authorization = 'Bearer invalid whitespace'; },
        r => { r.httpRequest.headers.authorization = 'Bearer invalid\nheader'; },
        r => { r.httpRequest.headers.authorization = 'Bearer ' + 'x'.repeat(16385); },
        r => { r.authorization = 'Bearer conflicting-context'; },
        r => { delete r.httpRequest.headers.authorization; r.httpRequest.body.authorization = f.request.authorization; },
        r => { r.authData.principalType = 'customer'; },
        r => { r.authData.tokenType = 'service'; },
        r => { r.authData.entCode = 'sellerB'; },
        r => { r.enterpriseCode = 'sellerB'; },
        r => { r.tenant = 'foreign'; },
    ]) {
        const next = structuredClone(request); mutate(next);
        await assert.rejects(setup.preflightContribution(next));
        await assert.rejects(setup.installContribution(next));
        assert.equal(f.state.writes, writes);
        assert.equal(f.rows.coupon.length, 0);
        assert.equal(f.rows.couponBatch.length, 0);
    }
    f.state.denied = true;
    await assert.rejects(setup.preflightContribution(request), { code: 'ERR_PROMOTION_SELLER_UNCONFIRMED' });
    f.state.denied = false;
    f.state.permissions = ['commerce.promotion.manage'];
    await assert.rejects(setup.installContribution(request), { code: 'ERR_PROMOTION_SELLER_UNCONFIRMED' });
    assert.equal(f.state.writes, writes);
});

test('HTTP bearer is captured before immutable payload awaits; later caller changes never replace issuance actor', async t => {
    const f = await delegated(t), captured = [];
    const request = { ...f.request, authorization: undefined,
        httpRequest: { headers: { authorization: f.request.authorization } } };
    const read = SERVICE.DefaultDataReleaseService.readContributionPayload;
    SERVICE.DefaultDataReleaseService.readContributionPayload = async (...args) => {
        request.httpRequest.headers.authorization = 'Bearer changed-after-owner-await';
        request.authData.loginId = 'changed-after-owner-await';
        return read(...args);
    };
    f.state.onProfile = command => { if (command.apiName === '/identity/scopes/me') captured.push(command.header.Authorization); };
    assert.equal((await setup.preflightContribution(request)).ready, true);
    assert(captured.length >= 2);
    assert(captured.every(token => token === f.request.authorization));
    assert.equal(f.rows.coupon.length, 0);
});

test('signed issuer creates seller-scoped stock with original grant and purpose-bound encryption; replay is immutable', async t => {
    const f = await delegated(t), signed = structuredClone(f.request);
    const result = await secure.issue(f.request, f.intent, f.campaign);
    assert.equal(result.replayed, false);
    assert.deepEqual(f.request, signed);
    const batch = f.rows.couponBatch[0], command = batch.secureIssuance.command;
    assert.equal(command.enterpriseCode, 'issuerA');
    assert.equal(command.actorId, 'operatorA');
    assert.equal(command.issuanceAuthority.sellerAuthorizationProof.grantRevision, 1);
    assert.deepEqual(command.issuanceAuthority.issuerEnterpriseRef, f.policy.issuerEnterpriseRef);
    assert.deepEqual(command.issuanceAuthority.vendorEnterpriseRef, f.policy.vendorEnterpriseRef);
    for (const row of [batch, ...f.rows.coupon]) {
        assert.equal(row.enterpriseCode, 'sellerB');
        assert.deepEqual(row.enterpriseRef, f.policy.vendorEnterpriseRef);
        assert.deepEqual(row.issuerEnterpriseRef, f.policy.issuerEnterpriseRef);
        assert.deepEqual(row.vendorEnterpriseRef, f.policy.vendorEnterpriseRef);
    }
    const coupon = f.rows.coupon[0], binding = secure.binding(coupon, publication.fingerprint(command),
        command.issuanceAuthority.sellerAuthorizationProof);
    assert.deepEqual(coupon.sellerAuthorizationProof, command.issuanceAuthority.sellerAuthorizationProof);
    assert.equal(secure.isIssuanceWrite(f.state.lastWrite), false);
    assert.throws(() => seller.protectCoupon({ ...f.state.lastWrite, isIssuanceWrite: true }));
    const token = SERVICE.DefaultSecretProtectionService.unprotect({ tenant: f.request.tenant,
        purpose: 'PROMOTION_COUPON_TOKEN', binding, envelope: coupon.protectedToken });
    assert.match(token, /^[A-F0-9]{64}$/);
    assert.ok(!JSON.stringify([f.rows, result]).includes(token));
    assert.throws(() => SERVICE.DefaultSecretProtectionService.unprotect({ tenant: f.request.tenant,
        purpose: 'PROMOTION_COUPON_TOKEN', binding: { ...binding, sellerAuthorizationProof: { ...binding.sellerAuthorizationProof, grantRevision: 3 } },
        envelope: coupon.protectedToken }));
    const original = structuredClone(f.rows), writes = f.state.writes;
    assert.equal((await secure.issue(f.request, f.intent, f.campaign)).replayed, true);
    assert.equal(f.state.writes, writes); assert.deepEqual(f.rows, original);
    f.state.principal = 'operatorB';
    assert.equal((await secure.issue({ ...f.request, authData: { ...f.request.authData, loginId: 'operatorB' } }, f.intent, f.campaign)).replayed, true);
    assert.deepEqual(f.rows, original);
    const stock = await SERVICE.DefaultCouponService.get({ tenant: f.request.tenant,
        query: { tenant: f.request.tenant, enterpriseCode: 'sellerB', batchCode: f.intent.batchCode } });
    assert.equal(stock.result.length, f.intent.quantity);
    assert.ok(!/protectedToken|secureIssuance/.test(JSON.stringify(stock)));
    assert.equal((await SERVICE.DefaultCouponService.get({ tenant: f.request.tenant,
        query: { enterpriseCode: 'issuerA' } })).result.length, 0);
});

test('delegated issuance refuses absent, disabled, unqualified, revoked, expired or ambiguous consent without issuing', async t => {
    const f = await delegated(t, false), writes = f.state.writes;
    await assert.rejects(secure.issue(f.request, f.intent, f.campaign), { code: 'ERR_PROMOTION_SELLER_UNCONFIRMED' });
    assert.equal(f.state.writes, writes);
    await f.review('GRANT');
    const original = structuredClone(f.rows.promotion[0]);
    for (const mutate of [
        () => { f.settings.promotion.sellerAuthorization.enabled = false; },
        () => { f.settings.promotion.sellerAuthorization.qualified = false; },
        () => { f.rows.promotion[0].sellerAuthorizations[0].status = 'REVOKED'; },
        () => { f.rows.promotion[0].sellerAuthorizations[0].expiresAt = '2000-01-01T00:00:00.000Z'; },
        () => { f.rows.promotion[0].sellerAuthorizations.push(structuredClone(f.rows.promotion[0].sellerAuthorizations[0])); },
        () => { f.rows.promotion[0].vendorEnterpriseRef.code = 'anotherSeller'; },
        () => { f.rows.promotion[0].issuerEnterpriseRef.code = 'anotherIssuer'; },
        () => { f.rows.promotion[0].tenant = 'foreign'; },
    ]) {
        f.rows.promotion[0] = structuredClone(original);
        f.settings.promotion.sellerAuthorization.enabled = f.settings.promotion.sellerAuthorization.qualified = true;
        mutate();
        await assert.rejects(secure.issue(f.request, f.intent, f.campaign));
        assert.equal(f.rows.coupon.length, 0); assert.equal(f.rows.couponBatch.length, 0);
    }
});

test('Profile DENY, inactive vendor/issuer, absent token and caller seller impersonation cannot issue', async t => {
    const f = await delegated(t), writes = f.state.writes;
    for (const request of [
        { ...f.request, enterpriseCode: 'sellerB' },
        { ...f.request, enterpriseCode: 'sellerB', authData: { ...f.request.authData, enterpriseCode: 'sellerB' } },
        { ...f.request, authorization: undefined },
        { ...f.request, authData: { ...f.request.authData, entCode: 'sellerB' } },
        { ...f.request, authData: { ...f.request.authData, principalType: 'customer' } },
        { ...f.request, authData: { ...f.request.authData, tokenType: 'service' } },
        { ...f.request, tenant: 'foreign' },
    ]) await assert.rejects(secure.issue({ ...request, sellerEnterpriseCode: 'sellerB', qualified: true }, f.intent, f.campaign));
    f.state.denied = true; await assert.rejects(secure.issue(f.request, f.intent, f.campaign)); f.state.denied = false;
    for (const inactive of ['issuerA', 'sellerB']) {
        f.state.inactive = inactive; await assert.rejects(secure.issue(f.request, f.intent, f.campaign));
    }
    f.state.inactive = undefined;
    f.state.permissions = ['commerce.promotion.manage'];
    await assert.rejects(secure.issue(f.request, f.intent, f.campaign));
    assert.equal(f.state.writes, writes);
});

test('grant changes during Profile resolution or encryption are observed before any transaction stock is committed', async t => {
    const f = await delegated(t);
    const owner = SERVICE.DefaultSecretProtectionService;
    let changed = false;
    SERVICE.DefaultSecretProtectionService = { ...owner, protect: async request => {
        const value = await owner.protect(request);
        if (!changed) { changed = true; await f.review('REVOKE'); await f.review('GRANT'); }
        return value;
    } };
    await assert.rejects(secure.issue(f.request, f.intent, f.campaign));
    assert.equal(f.rows.coupon.length, 0); assert.equal(f.rows.couponBatch.length, 0); assert.equal(f.state.commits, 0);
    SERVICE.DefaultSecretProtectionService = owner;
    changed = false;
    f.state.onProfile = async request => {
        if (!changed && request.apiName === '/references/read' && request.requestBody.codes[0] === 'sellerB') {
            changed = true;
            f.state.onProfile = undefined;
            await f.review('REVOKE');
        }
    };
    await assert.rejects(secure.issue(f.request, f.intent, f.campaign));
    assert.equal(changed, true, 'Revocation must run during the bounded seller reference read');
    assert.equal(f.rows.coupon.length, 0); assert.equal(f.state.commits, 0);
});

test('consent revoked while transaction inserts are in flight aborts the entire stock transaction', async t => {
    const f = await delegated(t);
    const save = SERVICE.DefaultCouponService.save;
    let changed = false;
    SERVICE.DefaultCouponService.save = async command => {
        assert.equal(command.authData.enterpriseCode, 'issuerA');
        assert.equal(command.query.enterpriseCode, 'sellerB');
        const result = await save(command);
        if (!changed) { changed = true; await f.review('REVOKE'); }
        return result;
    };
    await assert.rejects(secure.issue(f.request, f.intent, f.campaign));
    assert.equal(f.state.commits, 0); assert.equal(f.state.aborts, 1);
    assert.equal(f.rows.coupon.length, 0); assert.equal(f.rows.couponBatch.length, 0);
    assert.equal(f.rows.promotion[0].sellerAuthorizations[0].status, 'REVOKED');
});

test('revoke/regrant after issuance never adopts a new grant on receipt replay or generates replacement tokens', async t => {
    const f = await delegated(t);
    await secure.issue(f.request, f.intent, f.campaign);
    const original = structuredClone({ coupon: f.rows.coupon, couponBatch: f.rows.couponBatch }), writes = f.state.writes;
    await f.review('REVOKE');
    await assert.rejects(secure.issue(f.request, f.intent, f.campaign));
    const checkout = { tenant: f.request.tenant, enterpriseCode: 'sellerB' };
    await assert.rejects(seller.authorizeSale(checkout, f.rows.coupon[0]));
    await f.review('GRANT');
    await assert.rejects(secure.issue(f.request, f.intent, f.campaign));
    await assert.rejects(seller.authorizeSale(checkout, f.rows.coupon[0]));
    f.settings.promotion.sellerAuthorization.enabled = false;
    await assert.rejects(seller.authorizeSale(checkout, f.rows.coupon[0]));
    assert.equal(f.state.writes, writes);
    assert.deepEqual({ coupon: f.rows.coupon, couponBatch: f.rows.couponBatch }, original);
});

test('lost acknowledgement and concurrent identical delegated issuance retain one original batch', async t => {
    const f = await delegated(t); f.state.lost = true;
    const results = await Promise.all([secure.issue(f.request, f.intent, f.campaign), secure.issue(f.request, f.intent, f.campaign)]);
    assert.equal(results.every(result => result.replayed), true);
    assert.equal(f.rows.couponBatch.length, 1); assert.equal(f.rows.coupon.length, 3); assert.equal(f.state.writes, 5);
    assert.equal(f.rows.couponBatch[0].secureIssuance.command.issuanceAuthority.sellerAuthorizationProof.grantRevision, 1);
});

test('all original aggregate references, operational scope and receipt grant are exact on delegated replay', async t => {
    const f = await delegated(t); await secure.issue(f.request, f.intent, f.campaign);
    const original = structuredClone(f.rows), writes = f.state.writes;
    for (const mutate of [
        () => { f.rows.coupon[0].issuerEnterpriseRef.moduleName = 'foreign'; },
        () => { f.rows.coupon[0].vendorEnterpriseRef.schemaName = 'foreign'; },
        () => { f.rows.coupon[0].vendorEnterpriseRef.roleCode = 'changed'; },
        () => { f.rows.coupon[0].enterpriseRef.code = 'issuerA'; },
        () => { f.rows.coupon[0].enterpriseCode = 'issuerA'; },
        () => { delete f.rows.coupon[0].sellerAuthorizationProof; },
        () => { f.rows.coupon[0].sellerAuthorizationProof.grantRevision = 3; },
        () => { f.rows.couponBatch[0].enterpriseRef.roleCode = 'changed'; },
        () => { f.rows.couponBatch[0].vendorEnterpriseRef.code = 'anotherSeller'; },
        () => { f.rows.couponBatch[0].secureIssuance.command.issuanceAuthority.sellerAuthorizationProof.grantRevision = 3; },
        () => { f.rows.couponBatch[0].secureIssuance.command.issuanceAuthority.issuerEnterpriseRef.moduleName = 'foreign'; },
    ]) {
        for (const key of Object.keys(f.rows)) f.rows[key].splice(0, f.rows[key].length, ...structuredClone(original[key]));
        mutate(); await assert.rejects(secure.issue(f.request, f.intent, f.campaign));
        assert.equal(f.state.writes, writes);
    }
});

test('legacy self-issued receipt and binding stay unchanged even with distinct canonical association roles', async t => {
    const f = fixture.create(t);
    f.policy.issuerEnterpriseRef = { ...f.policy.issuerEnterpriseRef, roleCode: 'ISSUER' };
    f.policy.vendorEnterpriseRef = { ...f.policy.vendorEnterpriseRef, roleCode: 'MARKETPLACE_VENDOR' };
    f.campaign.policyFingerprint = publication.fingerprint(f.policy);
    await setup.installContribution(f.request);
    const command = f.rows.couponBatch[0].secureIssuance.command;
    assert.equal(Object.hasOwn(command, 'issuanceAuthority'), false);
    for (const coupon of f.rows.coupon) {
        assert.deepEqual(coupon.enterpriseRef, f.policy.issuerEnterpriseRef);
        assert.equal(Object.hasOwn(coupon, 'sellerAuthorizationProof'), false);
        assert.equal(Object.hasOwn(secure.binding(coupon, publication.fingerprint(command)), 'sellerAuthorizationProof'), false);
    }
    const original = structuredClone(f.rows), writes = f.state.writes;
    await setup.installContribution(f.request);
    assert.deepEqual(f.rows, original); assert.equal(f.state.writes, writes);
});

test('changed consent during original encrypted replay readback is refused without new stock', async t => {
    const f = await delegated(t);
    await secure.issue(f.request, f.intent, f.campaign);
    const original = structuredClone({ coupon: f.rows.coupon, couponBatch: f.rows.couponBatch }), writes = f.state.writes;
    const owner = SERVICE.DefaultSecretProtectionService;
    let changed = false;
    SERVICE.DefaultSecretProtectionService = { ...owner, unprotect: async request => {
        const token = await owner.unprotect(request);
        if (!changed) { changed = true; await f.review('REVOKE'); await f.review('GRANT'); }
        return token;
    } };
    await assert.rejects(secure.issue(f.request, f.intent, f.campaign));
    assert.equal(f.state.writes, writes);
    assert.deepEqual({ coupon: f.rows.coupon, couponBatch: f.rows.couponBatch }, original);
});

test('seller-scoped private reveal retains issuer receipt authority and refuses issuer or changed reference reads', async t => {
    const f = await delegated(t); await secure.issue(f.request, f.intent, f.campaign);
    const coupon = f.rows.coupon[0];
    Object.assign(coupon, { soldTo: 'buyerA', status: 'DELIVERED', revision: 2 });
    const request = { tenant: f.request.tenant, enterpriseCode: 'sellerB', ownerId: 'buyerA',
        authData: { tenant: f.request.tenant, enterpriseCode: 'sellerB', principalType: 'customer', tokenType: 'access' } };
    let checks = 0;
    SERVICE.DefaultDigitalCommerceEntitlementService = { authorizeCouponReveal: async (r, observed) => {
        assert.equal(r.enterpriseCode, 'sellerB'); assert.equal(observed.soldTo, 'buyerA'); checks++;
    } };
    const token = await f.privateRun(request, () => secure.revealToken(request, structuredClone(coupon)));
    assert.match(token, /^[A-F0-9]{64}$/); assert.equal(checks, 2);
    const issuerRequest = { ...request, enterpriseCode: 'issuerA' };
    await assert.rejects(f.privateRun(issuerRequest, () => secure.revealToken(issuerRequest, coupon)));
    const original = structuredClone(coupon.vendorEnterpriseRef);
    SERVICE.DefaultDigitalCommerceEntitlementService.authorizeCouponReveal = async () => {
        coupon.vendorEnterpriseRef.moduleName = 'foreign';
    };
    const changedRequest = structuredClone(request);
    await assert.rejects(f.privateRun(changedRequest, () => secure.revealToken(changedRequest, structuredClone(coupon))));
    coupon.vendorEnterpriseRef = original;
});

test('later layer can narrow delegated issuance without copying owner or bypassing original proof', async t => {
    const f = await delegated(t);
    const narrowed = { ...seller, authorizeIssuance: async function (r, policy, expected) {
        const proof = await seller.authorizeIssuance.call(this, r, policy, expected);
        if (proof.sellerEnterpriseCode === 'sellerB') throw new CLASSES.NodicsError('ERR_PROMOTION_SELLER_UNCONFIRMED');
        return proof;
    } };
    SERVICE.DefaultCouponSellerAuthorizationService = narrowed;
    await assert.rejects(secure.issue(f.request, f.intent, f.campaign));
    assert.equal(f.rows.coupon.length, 0);
});
