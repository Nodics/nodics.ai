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
const crypto = require('node:crypto');
const fixture = require('./helpers/secureIssuanceFixture');
const setup = require('../src/service/defaultPromotionSetupContributionService');
const secure = require('../src/service/defaultCouponSecureIssuanceService');
const publication = require('../src/service/defaultPromotionPublicationService');

/** @module promotion/test/couponSecureIssuanceContract @description Exercises real purpose AEAD and generated transaction/read-protection owners with isolated atomic provider doubles; never native acceptance or live mutation. @layer test @owner promotion */
test('immutable coupon intent preflight is read-only and commits encrypted stock with one batch transaction', async t => {
    const f = fixture.create(t);
    const plan = await setup.preflightContribution(f.request);
    assert.equal(plan.ready, true); assert.equal(plan.plan.couponBatches[0].action, 'ISSUE'); assert.equal(f.state.writes, 0);
    const result = await setup.installContribution(f.request);
    assert.equal(result.data.couponBatches[0].replayed, false);
    assert.equal(f.rows.coupon.length, 3); assert.equal(f.rows.couponBatch.length, 1); assert.equal(f.state.commits, 1);
    for (const key of ['enterpriseRef', 'issuerEnterpriseRef', 'vendorEnterpriseRef'])
        assert.deepEqual(f.rows.promotion[0][key], f.rows.coupon[0][key]);
    const command = f.rows.couponBatch[0].secureIssuance.command;
    assert.equal(command.actorId, 'operatorA'); assert.deepEqual(command.contribution, {
        moduleName: f.request.contribution.moduleName, releaseCode: f.request.contribution.releaseCode,
        version: f.request.contribution.version, checksum: f.request.contribution.checksum });
    const tokens = f.rows.coupon.map(row => SERVICE.DefaultSecretProtectionService.unprotect({ tenant: row.tenant,
        purpose: 'PROMOTION_COUPON_TOKEN', binding: secure.binding(row, publication.fingerprint(command)), envelope: row.protectedToken }));
    assert.equal(new Set(tokens).size, 3);
    for (const token of tokens) { assert.match(token, /^[A-F0-9]{64}$/); assert.ok(!JSON.stringify([f.rows, result, plan]).includes(token)); }
    assert.throws(() => SERVICE.DefaultDatabaseTransactionService.operationOptions(f.state.lastWrite.transactionContext, f.database, f.models.coupon), /expired/);
});

test('ordered generated campaign hooks preserve only the exact private admission insert identity', async t => {
    const f = fixture.create(t), admission = SERVICE.DefaultPromotionBudgetAdmissionService;
    const seller = SERVICE.DefaultCouponSellerAuthorizationService, observed = [];
    SERVICE.DefaultCouponSellerAuthorizationService = { ...seller, protect: async function (command) {
        observed.push(command);
        assert.equal(admission.isAdmissionWrite(command), true);
        assert.equal(admission.isAdmissionWrite({ ...command }), false);
        assert.throws(() => admission.protectSave({ ...command }),
            { code: 'ERR_PROMOTION_BUDGET_ADMISSION_UNCONFIRMED' });
        await seller.protect(command);
        assert.deepEqual(command.query, { tenant: 'tenantA', code: 'campaign' });
    } };
    const handlers = SERVICE.DefaultDatabaseConfigurationService.getSchemaInterceptors('promotion').preSave.map(item => item.handler);
    assert.deepEqual(handlers, ['DefaultPromotionBudgetAdmissionService.protectSave',
        'DefaultCouponSellerAuthorizationService.protect', 'DefaultPromotionPublicationService.validateSourceAuthoring',
        'DefaultPromotionOperationService.validatePolicyAuthoring']);
    await setup.installContribution(f.request);
    assert.equal(observed.length, 1);
    const retained = observed[0];
    assert.equal(admission.isAdmissionWrite(retained), false);
    await assert.rejects(SERVICE.DefaultPromotionService.save(retained), { code: 'ERR_PROMOTION_BUDGET_ADMISSION_UNCONFIRMED' });
    SERVICE.DefaultCouponSellerAuthorizationService = seller;
    const generic = { tenant: 'tenantA', query: { code: 'campaign' },
        model: { code: 'campaign', issuerEnterpriseRef: structuredClone(f.policy.issuerEnterpriseRef) },
        options: { insertOnly: true, isAdmissionWrite: true }, qualified: true };
    assert.equal(admission.isAdmissionWrite(generic), false);
    await seller.protect(generic);
    assert.deepEqual(generic.query['sellerAuthorizations.0'], { $exists: false });
    await assert.rejects(SERVICE.DefaultPromotionService.save(generic), { code: 'ERR_SAVE_00003' });
    assert.equal(f.rows.promotion.length, 1);
});

test('private campaign insert identity expires when generated hooks fail', async t => {
    const f = fixture.create(t), admission = SERVICE.DefaultPromotionBudgetAdmissionService;
    let observed;
    SERVICE.DefaultCouponSellerAuthorizationService = { ...SERVICE.DefaultCouponSellerAuthorizationService,
        protect: async command => { observed = command; throw new Error('later-layer refusal'); } };
    await assert.rejects(setup.installContribution(f.request), /later-layer refusal/);
    assert.equal(admission.isAdmissionWrite(observed), false);
    assert.equal(f.state.writes, 0);
});

test('second authorized operator replay preserves original token, actor and sold lifecycle without new writes', async t => {
    const f = fixture.create(t);
    await setup.installContribution(f.request);
    f.rows.coupon[0].status = 'DELIVERED'; f.rows.coupon[0].soldTo = 'buyerA'; f.rows.coupon[0].revision = 4;
    f.rows.promotion[0].budget.spent = '17'; f.rows.promotion[0].revision = 2;
    const original = structuredClone(f.rows), writes = f.state.writes;
    const other = { ...f.request, authData: { ...f.request.authData, loginId: 'operatorB' } };
    const plan = await setup.preflightContribution(other);
    const result = await setup.installContribution(other);
    assert.equal(plan.plan.couponBatches[0].action, 'CURRENT'); assert.equal(result.data.couponBatches[0].replayed, true);
    assert.equal(f.state.writes, writes); assert.deepEqual(f.rows, original);
});

test('failure halfway through generated inserts aborts all stock and retry never imports a partial snapshot', async t => {
    const f = fixture.create(t); f.state.failCoupon = true;
    await assert.rejects(setup.installContribution(f.request), { code: 'ERR_PROMOTION_SECURE_ISSUANCE_UNCONFIRMED' });
    assert.equal(f.rows.coupon.length, 0); assert.equal(f.rows.couponBatch.length, 0);
    assert.equal(f.rows.promotion.length, 1); assert.equal(f.state.aborts, 1);
    f.state.failCoupon = false;
    await setup.installContribution(f.request); assert.equal(f.rows.coupon.length, 3);
});

test('lost commit acknowledgment resolves durable exact receipt instead of issuing replacement tokens', async t => {
    const f = fixture.create(t); f.state.lost = true;
    const result = await setup.installContribution(f.request);
    assert.equal(result.data.couponBatches[0].replayed, true); assert.equal(f.rows.coupon.length, 3);
    const original = structuredClone(f.rows), writes = f.state.writes;
    await setup.installContribution(f.request); assert.equal(f.state.writes, writes); assert.deepEqual(f.rows, original);
});

test('concurrent identical issuance keeps one atomic batch while conflicting immutable intent rejects', async t => {
    const f = fixture.create(t);
    // Admit the campaign first; the race below targets the multi-record issuance owner.
    await SERVICE.DefaultPromotionBudgetAdmissionService.initialize(setup.campaignRequest(f.request, f.campaign));
    const results = await Promise.all([secure.issue(f.request, f.intent, f.campaign), secure.issue({ ...f.request,
        authData: { ...f.request.authData, loginId: 'operatorB' } }, f.intent, f.campaign)]);
    assert.equal(results.filter(result => !result.replayed).length, 1);
    assert.equal(f.rows.couponBatch.length, 1); assert.equal(f.rows.coupon.length, 3);
    const writes = f.state.writes;
    await assert.rejects(secure.issue(f.request, { ...f.intent, quantity: 4 }, f.campaign), { code: 'ERR_PROMOTION_SECURE_ISSUANCE_UNCONFIRMED' });
    assert.equal(f.state.writes, writes);
});

test('key loss or private-capture loss blocks the whole contribution before campaign mutation', async t => {
    const f = fixture.create(t);
    const key = f.settings.secretProtection.purposes.PROMOTION_COUPON_TOKEN.keys.primary.encryptionKey;
    for (const bad of [null, '', 'guessable', '0'.repeat(64)]) {
        f.settings.secretProtection.purposes.PROMOTION_COUPON_TOKEN.keys.primary.encryptionKey = bad;
        assert.equal((await setup.preflightContribution(f.request)).ready, false);
        await assert.rejects(setup.installContribution(f.request), { code: 'ERR_PROMOTION_SETUP_TOKEN_OWNER_REQUIRED' });
    }
    f.settings.secretProtection.purposes.PROMOTION_COUPON_TOKEN.keys.primary.encryptionKey = key;
    f.settings.log.requestPrivacy.qualified = false;
    assert.equal((await setup.preflightContribution(f.request)).ready, false); assert.equal(f.state.writes, 0);
});

test('retained key rotation preserves old tokens; loss of historical key never claims CURRENT or regenerates', async t => {
    const f = fixture.create(t); await setup.installContribution(f.request);
    const ring = f.settings.secretProtection.purposes.PROMOTION_COUPON_TOKEN;
    ring.keys.next = { encryptionKey: crypto.randomBytes(32).toString('hex') }; ring.activeKeyId = 'next';
    assert.equal((await setup.preflightContribution(f.request)).plan.couponBatches[0].action, 'CURRENT');
    const writes = f.state.writes; delete ring.keys.primary;
    await assert.rejects(setup.preflightContribution(f.request), { code: 'ERR_PROMOTION_SECURE_ISSUANCE_UNCONFIRMED' });
    await assert.rejects(setup.installContribution(f.request), { code: 'ERR_PROMOTION_SECURE_ISSUANCE_UNCONFIRMED' });
    assert.equal(f.state.writes, writes); assert.equal(f.rows.coupon.length, 3);
});

test('ciphertext/proof tampering, missing unit and foreign binding are rejected on replay without replenishment', async t => {
    const f = fixture.create(t); await setup.installContribution(f.request);
    const original = structuredClone(f.rows), writes = f.state.writes;
    for (const mutate of [
        () => { f.rows.coupon[0].protectedToken.tag = '0'.repeat(32); },
        () => { f.rows.coupon.splice(0, 1); },
        () => { f.rows.coupon.push({ ...structuredClone(f.rows.coupon[0]), code: 'unexpectedExtra' }); },
        () => { f.rows.coupon[0].tenant = 'foreign'; },
        () => { f.rows.coupon[0].issuerEnterpriseRef.code = 'foreign'; },
        () => { f.rows.couponBatch[0].secureIssuance.command.actorId = ''; },
        () => { f.rows.couponBatch[0].secureIssuance.units[0].tokenHash = 'bad'; },
    ]) {
        for (const key of Object.keys(f.rows)) f.rows[key].splice(0, f.rows[key].length, ...structuredClone(original[key]));
        mutate(); await assert.rejects(setup.installContribution(f.request)); assert.equal(f.state.writes, writes);
    }
});

test('wrong role, tenant, enterprise, customer and permission cannot issue even with copied body authority flags', async t => {
    const f = fixture.create(t);
    for (const request of [
        { ...f.request, tenant: 'foreign' }, { ...f.request, enterpriseCode: 'foreign' },
        { ...f.request, authData: { ...f.request.authData, principalType: 'customer' } },
        { ...f.request, authData: { ...f.request.authData, tokenType: 'service' } },
    ]) await assert.rejects(setup.installContribution({ ...request, qualified: true, privateOperation: true }));
    f.state.allowed = false; await assert.rejects(setup.installContribution(f.request)); f.state.allowed = true;
    f.settings.runtimeRole = 'COMMERCE_STAGED'; await assert.rejects(setup.installContribution(f.request));
    assert.equal(f.state.writes, 0);
});

test('declared unique indexes and transaction flags do not replace actual installed safe persistence', async t => {
    const f = fixture.create(t);
    for (const indexes of [[], [{ unique: true, sparse: true, key: { code: 1 } }],
        [{ unique: true, key: { code: 1 } }], [{ unique: true, key: { code: 1 }, partialFilterExpression: { active: true } }]]) {
        f.state.indexes = indexes; await assert.rejects(secure.persistence(f.request), { code: 'ERR_PROMOTION_ISSUANCE_INDEX_REQUIRED' });
    }
    delete f.state.indexes;
    f.settings.databaseTransactions.enabled = false; await assert.rejects(secure.persistence(f.request), { code: 'ERR_PROMOTION_ISSUANCE_TRANSACTION_REQUIRED' });
    f.settings.databaseTransactions.enabled = true; f.state.atomic = false; await assert.rejects(secure.persistence(f.request), { code: 'ERR_PROMOTION_ISSUANCE_TRANSACTION_REQUIRED' });
    assert.equal(f.state.writes, 0);
});

test('missing schema protection and lifecycle hooks report only their prerequisite without writes', async t => {
    const f = fixture.create(t);
    delete f.models.coupon.rawSchema.readProtection;
    await assert.rejects(setup.installContribution(f.request), { code: 'ERR_PROMOTION_ISSUANCE_SCHEMA_REQUIRED' });
    f.models.coupon.rawSchema.readProtection = { owner: 'DefaultCouponSecureIssuanceService' };
    const hooks = SERVICE.DefaultDatabaseConfigurationService.getSchemaInterceptors;
    SERVICE.DefaultDatabaseConfigurationService.getSchemaInterceptors = name => name === 'coupon' ? {} : hooks(name);
    await assert.rejects(setup.installContribution(f.request), { code: 'ERR_PROMOTION_ISSUANCE_HOOKS_REQUIRED' });
    assert.equal(f.state.writes, 0);
});

test('missing or foreign reviewed enterprise references never become implicit self-issuance', async t => {
    const f = fixture.create(t);
    const policy = (await SERVICE.DefaultPromotionPublicationService.readActivated())[0].policy;
    for (const key of ['issuerEnterpriseRef', 'vendorEnterpriseRef']) {
        for (const value of [undefined, { moduleName: 'profile', schemaName: 'enterprise', code: 'foreign' }]) {
            SERVICE.DefaultPromotionPublicationService.readActivated = async () => [{ schema: 'promotion', policy: { ...policy, [key]: value } }];
            const campaign = { ...f.campaign, policyFingerprint: publication.fingerprint({ ...policy, [key]: value }) };
            await assert.rejects(secure.prepare(f.request, f.intent, campaign), {
                code: key === 'vendorEnterpriseRef' && value ? 'ERR_PROMOTION_SELLER_UNCONFIRMED' : 'ERR_PROMOTION_ISSUANCE_ENTERPRISE_REQUIRED',
            });
        }
    }
    assert.equal(f.state.writes, 0);
});

test('generic generated reads and exports project private fields, deny secret filters and expression projections', async t => {
    const f = fixture.create(t); await setup.installContribution(f.request);
    for (const [name, model] of [['DefaultCouponService', f.models.coupon], ['DefaultCouponBatchService', f.models.couponBatch]]) {
        const request = { tenant: 'tenantA', query: {} };
        const response = await SERVICE[name].get(request);
        assert.ok(!/protectedToken|secureIssuance/.test(JSON.stringify(response)));
        const exported = { success: { result: structuredClone(f.rows[model.schemaName]) } };
        await SERVICE.DefaultSchemaReadAccessPolicyService.applyExportPolicies({ ...request, schemaModel: model }, exported);
        assert.ok(!/protectedToken|secureIssuance/.test(JSON.stringify(exported)));
        for (const r of [{ query: { 'protectedToken.keyId': 'primary' } },
            { searchOptions: { projection: { alias: '$$ROOT' } } }, { query: { $where: 'return true' } }])
            await assert.rejects(SERVICE[name].get({ tenant: 'tenantA', ...r }));
    }
});

test('generic writes cannot manufacture/remove retained tokens or mutate issued rows; copied private flags grant nothing', async t => {
    const f = fixture.create(t); await setup.installContribution(f.request);
    const before = structuredClone(f.rows.coupon[0]);
    for (const model of [{ protectedToken: {} }, { $unset: { protectedToken: '' } }, { $rename: { protectedToken: 'other' } },
        { secureIssuanceCode: 'forged' }]) assert.throws(() => secure.protect({ model, privateWrite: true }));
    const response = await SERVICE.DefaultCouponService.update({ tenant: 'tenantA', query: { code: before.code },
        model: { $set: { status: 'ACTIVE', soldTo: 'intruder' } }, secureIssuance: true });
    assert.equal(response.result.matchedCount, 0); assert.deepEqual(f.rows.coupon[0], before);
    const remove = { query: { code: before.code } }; secure.protectRemove(remove);
    assert.equal(f.matches(before, remove.query), false);
    await assert.rejects(secure.retainedToken({}, before, f.rows.couponBatch[0].secureIssuance.command));
});

test('changed immutable release bytes stop coupon and campaign writes', async t => {
    const f = fixture.create(t); f.state.changedBytes = true;
    await assert.rejects(setup.installContribution(f.request), /bytes changed/); assert.equal(f.state.writes, 0);
});

test('private capture context encloses all generated encryption and replay decryption, including sanitized failures', async t => {
    const f = fixture.create(t), owner = SERVICE.DefaultSecretProtectionService;
    let protectedCount = 0, unprotectedCount = 0;
    SERVICE.DefaultSecretProtectionService = { ...owner,
        protect: function (request) {
            assert.equal(SERVICE.DefaultLoggerService.isSensitiveRequest(), true); protectedCount++;
            return owner.protect(request);
        },
        unprotect: function (request) {
            assert.equal(SERVICE.DefaultLoggerService.isSensitiveRequest(), true); unprotectedCount++;
            return owner.unprotect(request);
        },
    };
    await setup.installContribution(f.request); await setup.preflightContribution(f.request);
    assert.equal(protectedCount, 3); assert.ok(unprotectedCount >= 6);
    const writes = f.state.writes;
    SERVICE.DefaultSecretProtectionService.unprotect = () => { throw new Error('PRIVATE_PROVIDER_DIAGNOSTIC'); };
    await assert.rejects(setup.preflightContribution(f.request), error =>
        error.code === 'ERR_PROMOTION_SECURE_ISSUANCE_UNCONFIRMED' && !String(error).includes('PRIVATE_PROVIDER_DIAGNOSTIC'));
    assert.equal(f.state.writes, writes);
});

test('a later layer may narrow issuance bounds without bypassing immutable admission', async t => {
    const f = fixture.create(t), original = SERVICE.DefaultCouponSecureIssuanceService;
    SERVICE.DefaultCouponSecureIssuanceService = { ...original, prepare: async function (request, intent, campaign) {
        const plan = await original.prepare.call(this, request, intent, campaign);
        if (intent.quantity > 2) this.fail();
        return plan;
    } };
    await assert.rejects(setup.installContribution(f.request)); assert.equal(f.state.writes, 0);
    f.intent.quantity = 2; await setup.installContribution(f.request); assert.equal(f.rows.coupon.length, 2);
});
