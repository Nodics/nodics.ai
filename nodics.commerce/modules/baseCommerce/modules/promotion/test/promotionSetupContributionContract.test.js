/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const path = require('node:path');
const root = path.resolve(__dirname, '../../../../../..');
const admission = require('../src/service/defaultPromotionBudgetAdmissionService');
const setup = require('../src/service/defaultPromotionSetupContributionService');
const operation = require('../src/service/defaultPromotionOperationService');
const publication = require('../src/service/defaultPromotionPublicationService');
const exact = require('../../pricing/src/service/defaultExactAmountService');
const save = require(path.join(root, 'nodics.foundation/modules/nDatabase/database/src/service/procs/save/defaultModelSaveInitializerService'));
const concurrency = require(path.join(root, 'nodics.foundation/modules/nDatabase/database/src/service/schema/defaultModelConcurrencyService'));

/** @module promotion/test/promotionSetupContributionContract @description Tests owner setup admission through real generated insert-only dispatch with atomic provider doubles; not installed database or nImport byte-reader qualification. @layer test @owner promotion @override Fixtures exercise later-layer admission narrowing without weakening immutable authority. */

function fixture(t) {
    const previous = [global.CONFIG, global.SERVICE, global.CLASSES, global.NODICS, global.UTILS];
    t.after(() => { [global.CONFIG, global.SERVICE, global.CLASSES, global.NODICS, global.UTILS] = previous; });
    global.CLASSES = { NodicsError: class extends Error { constructor(code) { super(code); this.code = code; } } };
    const policy = { code: 'campaign', tenant: 'tenantA', enterpriseCode: 'issuerA', name: 'Reference campaign',
        status: 'ACTIVE', priority: 10, conditions: {}, actions: { discountAmount: '1' },
        budget: { limit: '100' }, revision: 7, versionId: 2 };
    const contribution = { installer: 'PROMOTION_CAMPAIGN_ISSUANCE', moduleName: 'referencePack',
        releaseCode: 'referencePack:operations', version: '0.0.1', checksum: 'a'.repeat(64), dataType: 'sample',
        selectionPolicy: 'EXPLICIT', destinationRole: 'COMMERCE', lifecycle: 'OPERATIONAL_VERSIONED' };
    const payload = { campaigns: [{ promotionCode: 'campaign', storeCode: 'storeA', rootCode: 'rootA',
        commandReference: 'packCommand001', policyFingerprint: publication.fingerprint(policy) }], couponBatches: [] };
    const request = { contribution, tenant: 'tenantA', enterpriseCode: 'issuerA', authData: {
        tenant: 'tenantA', enterpriseCode: 'issuerA', tokenType: 'access', principalType: 'human', loginId: 'operatorA' } };
    const settings = { budgetAdmission: { maximumCampaignsPerContribution: 50 },
        publication: { runtimeRole: 'ONLINE', delivery: { enabled: true, storeCodes: ['storeA'], rootCodesByStore: { storeA: ['rootA'] } } } };
    const rows = [], histories = {}, state = { writes: 0, reads: 0, lost: false, malformed: false, allowed: true,
        indexes: [{ unique: true, key: { code: 1 } }] };
    const model = { primaryKey: 'code', versioned: false, rawSchema: { definition: { budgetAdmission: { type: 'object' } } },
        compareAndSetItem: async input => {
            assert.equal(input.operation, 'create');
            assert.equal(input.insertOnly, true);
            if (rows.some(row => row.code === input.model.code)) throw new Error('duplicate identity');
            state.writes++;
            rows.push(structuredClone(input.model));
            if (state.lost) throw new Error('lost acknowledgement');
            return structuredClone(input.model);
        } };
    const rowsFor = (values, query) => values.filter(row => Object.entries(query).every(([key, value]) => row[key] === value));
    const envelope = values => ({ code: 'SUC_TEST', result: structuredClone(values) });
    global.CONFIG = { get: () => settings };
    global.UTILS = { createModelName: name => name };
    global.NODICS = { getModels: (module, tenant) => {
        assert.equal(module, 'promotion'); assert.equal(tenant, 'tenantA'); return { promotion: model };
    } };
    global.SERVICE = {
        DefaultPromotionBudgetAdmissionService: { ...admission },
        DefaultPromotionOperationService: operation,
        DefaultExactAmountService: exact,
        DefaultModelConcurrencyService: concurrency,
        DefaultDatabaseConfigurationService: { getSchemaInterceptors: () => Object.fromEntries(
            Object.entries({ preSave: 'protectSave', preUpdate: 'protect', preRemove: 'protectRemoval' }).map(
                ([trigger, method]) => [trigger, [{ handler: 'DefaultPromotionBudgetAdmissionService.' + method, active: true }]])) },
        DefaultDatabaseModelHandlerService: { inspectIndexes: async candidate => {
            assert.equal(candidate, model); return { versioned: false, indexes: state.indexes };
        } },
        DefaultSecuredRequestPipelineService: { getGrantedPermissions: () => ['commerce.promotion.manage'],
            isPermissionGranted: () => state.allowed },
        DefaultPromotionPublicationService: { ...publication, readActivated: async (selection, context) => {
            assert.deepEqual(selection, { rootType: 'promotion', rootCode: 'rootA' });
            assert.equal(context.storeCode, 'storeA');
            return [{ schema: 'promotion', policy: structuredClone(policy) }];
        } },
        DefaultDataReleaseService: { readContributionPayload: async (selected, installer, file) => {
            state.reads++;
            assert.deepEqual(selected, contribution);
            assert.equal(installer, 'PROMOTION_CAMPAIGN_ISSUANCE'); assert.equal(file, 'promotionSetup.json');
            if (state.invalidBytes) throw new Error('immutable contribution bytes changed');
            return structuredClone(payload);
        } },
        DefaultPromotionService: {
            get: async command => state.malformed ? { code: 'ERR_TEST', result: [] } : envelope(rowsFor(rows, command.query)),
            save: async command => {
                SERVICE.DefaultPromotionBudgetAdmissionService.protectSave(command);
                return { code: 'SUC_TEST', result: await save.persistModel({ ...command, schemaModel: model }) };
            },
        },
    };
    for (const name of ['DefaultPromotionBudgetLedgerService', 'DefaultPromotionRedemptionService',
        'DefaultCouponBatchService', 'DefaultCouponService']) {
        histories[name] = [];
        SERVICE[name] = { get: async command => envelope(rowsFor(histories[name], command.query)) };
    }
    return { policy, payload, request, settings, rows, state, model, histories };
}

test('trusted pacing precedes fresh preflight and issuance outside transactions without changing scope', async t => {
    const f = fixture(t), events = [];
    f.settings.setupPacing = { preflightDelayMs: 1200, issuanceDelayMs: 3600 };
    f.payload.couponBatches = [{ promotionCode: 'campaign', batchCode: 'requestedBatch', quantity: 100, commandReference: 'originalBatch001' }];
    t.mock.method(global, 'setTimeout', (callback, milliseconds) => {
        events.push(['wait', milliseconds]); queueMicrotask(callback);
    });
    SERVICE.DefaultCouponSecureIssuanceService = {
        prepare: async (request, intent) => {
            events.push(['prepare', intent.batchCode]);
            assert.deepEqual(request.authData, f.request.authData);
            assert.deepEqual(request.contribution, f.request.contribution);
            assert.equal(request.transactionContext, undefined);
            return {};
        },
        issue: async (request, intent) => {
            events.push(['issue', intent.batchCode]);
            assert.deepEqual(request.authData, f.request.authData);
            assert.equal(request.transactionContext, undefined);
            return { batchCode: intent.batchCode, quantity: intent.quantity, replayed: false };
        },
    };
    await setup.preflightContribution(f.request);
    assert.equal(f.state.writes, 0);
    const result = await setup.installContribution(f.request);
    assert.deepEqual(events, [['wait', 1200], ['prepare', 'requestedBatch'],
        ['wait', 1200], ['prepare', 'requestedBatch'], ['wait', 3600], ['issue', 'requestedBatch']]);
    assert.deepEqual(result.data.couponBatches, [{ batchCode: 'requestedBatch', quantity: 100, replayed: false }]);
});

test('invalid deployment pacing refuses before reads or writes and request delays cannot select policy', async t => {
    const f = fixture(t);
    for (const setting of [null, [], 'fast', { preflightDelayMs: -1 }, { issuanceDelayMs: 10001 },
        { issuanceDelayMs: 1.5 }, { preflightDelayMs: '1200' }, { preflightDelayMs: Infinity }]) {
        f.settings.setupPacing = setting;
        await assert.rejects(setup.installContribution(f.request), { code: 'ERR_PROMOTION_SETUP_INVALID' });
        assert.equal(f.state.reads, 0); assert.equal(f.state.writes, 0);
    }
    delete f.settings.setupPacing;
    f.request.setupPacing = { preflightDelayMs: 10000, issuanceDelayMs: 10000 };
    assert.deepEqual(setup.batchPacing(), { preflightDelayMs: 0, issuanceDelayMs: 0 });
    await setup.installContribution(f.request);
    assert.equal(f.state.writes, 1);
});

test('pacing cannot turn a fresh secure-owner refusal into issued stock', async t => {
    const f = fixture(t);
    f.settings.setupPacing = { preflightDelayMs: 1, issuanceDelayMs: 1 };
    f.payload.couponBatches = [{ promotionCode: 'campaign', batchCode: 'requestedBatch', quantity: 100, commandReference: 'originalBatch001' }];
    t.mock.method(global, 'setTimeout', callback => queueMicrotask(callback));
    SERVICE.DefaultCouponSecureIssuanceService = {
        prepare: async () => { throw Object.assign(new Error('Current issuer scope revoked'), { code: 'ERR_PROMOTION_SELLER_UNCONFIRMED' }); },
        issue: async () => assert.fail('Fresh refusal must prevent issuance'),
    };
    await assert.rejects(setup.installContribution(f.request), { code: 'ERR_PROMOTION_SELLER_UNCONFIRMED' });
    assert.equal(f.state.writes, 0);
});

test('budget-only preflight checks installed owners without seller, pricing or completed journey qualification', async t => {
    const f = fixture(t);
    f.settings.sellerAuthorization = { enabled: false, qualified: false };
    f.settings.merchantBenefits = { enabled: false, qualified: false };
    const unavailable = new Proxy({}, { get() { assert.fail('Budget-only preflight must not invoke downstream consent or journey owners'); } });
    for (const name of ['DefaultCouponSellerAuthorizationService', 'DefaultPromotionDistributionAdmissionService',
        'DefaultCouponSecureIssuanceService', 'DefaultPricingMerchantEvidenceService']) SERVICE[name] = unavailable;
    assert.equal((await setup.preflightContribution(f.request)).ready, true);
    assert.equal(f.state.writes, 0);
    f.state.indexes = [];
    await assert.rejects(setup.preflightContribution(f.request), { code: 'ERR_PROMOTION_BUDGET_ADMISSION_UNCONFIRMED' });
    assert.equal(f.state.writes, 0);
});

test('preflight is read-only; first insert binds immutable provenance and retry preserves later spend', async t => {
    const f = fixture(t);
    const preflight = await setup.preflightContribution(f.request);
    assert.equal(preflight.ready, true); assert.equal(preflight.plan.campaigns[0].action, 'INITIALIZE');
    assert.equal(f.state.writes, 0);
    const result = await setup.installContribution(f.request);
    assert.equal(result.code, 'SUC_PROMOTION_SETUP_00001'); assert.equal(f.state.writes, 1);
    assert.deepEqual(f.rows[0].budget, { limit: '100', spent: '0' });
    assert.equal(f.rows[0].revision, 0); assert.equal(Object.hasOwn(f.rows[0], 'versionId'), false);
    assert.deepEqual(f.rows[0].budgetAdmission.command.contribution, {
        moduleName: 'referencePack', releaseCode: 'referencePack:operations', version: '0.0.1', checksum: 'a'.repeat(64) });
    f.rows[0].budget.spent = '37'; f.rows[0].revision = 4;
    const retry = await setup.installContribution(f.request);
    assert.equal(retry.data.campaigns[0].replayed, true);
    assert.equal(retry.data.campaigns[0].currentSpent, '37'); assert.equal(f.rows[0].revision, 4);
    assert.equal(f.state.writes, 1); assert.ok(f.state.reads >= 5);
});

test('another authorized operator inspects and replays the same pinned intent without replacing original evidence', async t => {
    const f = fixture(t);
    await setup.installContribution(f.request);
    f.rows[0].budget.spent = '19'; f.rows[0].revision = 2;
    const original = structuredClone(f.rows[0]);
    const other = { ...f.request, authData: { ...f.request.authData, loginId: 'operatorB' } };
    const plan = await setup.preflightContribution(other);
    assert.equal(plan.ready, true); assert.equal(plan.plan.campaigns[0].action, 'CURRENT');
    const retry = await setup.installContribution(other);
    assert.equal(retry.data.campaigns[0].replayed, true);
    assert.equal(retry.data.campaigns[0].currentSpent, '19');
    assert.equal(f.state.writes, 1); assert.deepEqual(f.rows[0], original);
    assert.equal(f.rows[0].budgetAdmission.command.actorId, 'operatorA');
    f.state.allowed = false;
    await assert.rejects(setup.preflightContribution(other), { code: 'ERR_PROMOTION_BUDGET_ADMISSION_FORBIDDEN' });
    await assert.rejects(setup.installContribution(other), { code: 'ERR_PROMOTION_BUDGET_ADMISSION_FORBIDDEN' });
    assert.equal(f.state.writes, 1); assert.deepEqual(f.rows[0], original);
});

test('replay rejects absent, empty, unbounded or malformed retained actor evidence', async t => {
    const f = fixture(t);
    await setup.installContribution(f.request);
    for (const actorId of [undefined, '', ' '.repeat(3), 'operatorA ', 'x'.repeat(193), 'operator\nA', 42]) {
        f.rows[0].budgetAdmission.command.actorId = actorId;
        await assert.rejects(setup.preflightContribution(f.request), { code: 'ERR_PROMOTION_BUDGET_ADMISSION_UNCONFIRMED' });
    }
    assert.equal(f.state.writes, 1);
});

test('lost response and concurrent same-command install resolve only an identical durable receipt', async t => {
    const f = fixture(t); f.state.lost = true;
    const results = await Promise.all([setup.installContribution(f.request), setup.installContribution(f.request)]);
    assert.equal(results.length, 2); assert.equal(f.state.writes, 1); assert.equal(f.rows.length, 1);
    f.payload.campaigns[0].commandReference = 'differentCommand';
    await assert.rejects(setup.installContribution(f.request), { code: 'ERR_PROMOTION_BUDGET_ADMISSION_UNCONFIRMED' });
    assert.equal(f.state.writes, 1);
});

test('existing rows without admission never imply a safe zero, even when their spent counter is absent', async t => {
    const f = fixture(t); f.rows.push({ code: 'campaign', tenant: 'tenantA', enterpriseCode: 'issuerA', revision: 0 });
    await assert.rejects(setup.installContribution(f.request), { code: 'ERR_PROMOTION_BUDGET_ADMISSION_UNCONFIRMED' });
    assert.equal(f.state.writes, 0);
});

test('each operational history owner independently prevents first-use initialization', async t => {
    const f = fixture(t);
    for (const rows of Object.values(f.histories)) {
        rows.push({ tenant: 'tenantA', promotionCode: 'campaign' });
        await assert.rejects(setup.preflightContribution(f.request), { code: 'ERR_PROMOTION_BUDGET_ADMISSION_UNCONFIRMED' });
        rows.pop();
    }
    assert.equal(f.state.writes, 0);
});

test('failed reads, unsupported insert providers, and unqualified installed uniqueness refuse writes', async t => {
    const f = fixture(t); f.state.malformed = true;
    await assert.rejects(setup.preflightContribution(f.request), /persistence was not confirmed/);
    f.state.malformed = false;
    for (const indexes of [[], [{ unique: true, sparse: true, key: { code: 1 } }],
        [{ unique: true, partialFilterExpression: { active: true }, key: { code: 1 } }],
        [{ unique: true, key: { code: 1, enterpriseCode: 1 } }]]) {
        f.state.indexes = indexes;
        await assert.rejects(setup.preflightContribution(f.request), { code: 'ERR_PROMOTION_BUDGET_ADMISSION_UNCONFIRMED' });
    }
    f.state.indexes = [{ unique: true, key: { code: 1 } }]; f.model.versioned = true;
    await assert.rejects(setup.installContribution(f.request), { code: 'ERR_PROMOTION_BUDGET_ADMISSION_UNCONFIRMED' });
    assert.equal(f.state.writes, 0);
});

test('signed scope, permission, Store root, exact policy and existing Online publication gates remain fail-closed', async t => {
    const f = fixture(t);
    f.request.enterpriseCode = 'foreign';
    await assert.rejects(setup.preflightContribution(f.request), { code: 'ERR_PROMOTION_BUDGET_ADMISSION_FORBIDDEN' });
    f.request.enterpriseCode = 'issuerA'; f.state.allowed = false;
    await assert.rejects(setup.preflightContribution(f.request), { code: 'ERR_PROMOTION_BUDGET_ADMISSION_FORBIDDEN' });
    f.state.allowed = true; f.settings.publication.runtimeRole = 'STAGED';
    await assert.rejects(setup.preflightContribution(f.request), { code: 'ERR_PROMOTION_BUDGET_ADMISSION_UNCONFIRMED' });
    f.settings.publication.runtimeRole = 'ONLINE'; f.payload.campaigns[0].rootCode = 'foreign';
    await assert.rejects(setup.preflightContribution(f.request), { code: 'ERR_PROMOTION_BUDGET_ADMISSION_UNCONFIRMED' });
    f.payload.campaigns[0].rootCode = 'rootA'; f.policy.budget.limit = '999';
    await assert.rejects(setup.preflightContribution(f.request), { code: 'ERR_PROMOTION_BUDGET_ADMISSION_UNCONFIRMED' });
    assert.equal(f.state.writes, 0);
});

test('installed receipt schema and active private write guards are required, not a new qualification flag', async t => {
    const f = fixture(t);
    assert.equal(Object.hasOwn(f.settings.budgetAdmission, 'qualified'), false);
    delete f.model.rawSchema.definition.budgetAdmission;
    await assert.rejects(setup.installContribution(f.request), { code: 'ERR_PROMOTION_BUDGET_ADMISSION_UNCONFIRMED' });
    f.model.rawSchema.definition.budgetAdmission = { type: 'object' };
    SERVICE.DefaultDatabaseConfigurationService.getSchemaInterceptors = () => ({});
    await assert.rejects(setup.installContribution(f.request), { code: 'ERR_PROMOTION_BUDGET_ADMISSION_UNCONFIRMED' });
    assert.equal(f.state.writes, 0);
});

test('immutable bytes are requalified and all instructions preflight before any campaign writes', async t => {
    const f = fixture(t);
    f.state.invalidBytes = true;
    await assert.rejects(setup.installContribution(f.request), /immutable contribution bytes changed/);
    f.state.invalidBytes = false;
    f.payload.campaigns.push({ ...f.payload.campaigns[0], promotionCode: 'missing' });
    await assert.rejects(setup.installContribution(f.request), { code: 'ERR_PROMOTION_BUDGET_ADMISSION_UNCONFIRMED' });
    assert.equal(f.state.writes, 0);
});

test('coupon issuance instructions block the complete contribution rather than pretending hash-only stock is deliverable', async t => {
    const f = fixture(t); f.payload.couponBatches.push({ promotionCode: 'campaign', batchCode: 'requestedBatch',
        quantity: 100, commandReference: 'issuanceIntent001' });
    const result = await setup.preflightContribution(f.request);
    assert.equal(result.ready, false); assert.equal(result.blocker.code, 'ERR_PROMOTION_SETUP_TOKEN_OWNER_REQUIRED');
    await assert.rejects(setup.installContribution(f.request), { code: 'ERR_PROMOTION_SETUP_TOKEN_OWNER_REQUIRED' });
    assert.equal(f.state.writes, 0);
});

test('reserved coupon intents are bounded references, never token or provider authority', async t => {
    const f = fixture(t), valid = { promotionCode: 'campaign', batchCode: 'requestedBatch', quantity: 100,
        commandReference: 'issuanceIntent001' };
    for (const invalid of [{ ...valid, quantity: 0 }, { ...valid, quantity: 1001 }, { ...valid, quantity: 1.5 },
        { ...valid, promotionCode: 'foreign' }, { ...valid, protectedToken: 'forbidden' },
        { ...valid, batchCode: 'invalid/path' }, { ...valid, provider: 'inventedVault' }]) {
        f.payload.couponBatches = [invalid];
        await assert.rejects(setup.installContribution(f.request), { code: 'ERR_PROMOTION_SETUP_INVALID' });
    }
    f.payload.couponBatches = [valid, { ...valid }];
    await assert.rejects(setup.preflightContribution(f.request), { code: 'ERR_PROMOTION_SETUP_INVALID' });
    assert.equal(f.state.writes, 0);
});

test('instruction body cannot inject operational fields, credentials or selection authority', async t => {
    const f = fixture(t); f.payload.campaigns[0].spent = '0';
    await assert.rejects(setup.installContribution(f.request), { code: 'ERR_PROMOTION_SETUP_INVALID' });
    delete f.payload.campaigns[0].spent; f.request.contribution.selectionPolicy = 'DEFAULT';
    await assert.rejects(setup.installContribution(f.request), { code: 'ERR_PROMOTION_SETUP_INVALID' });
    assert.equal(f.state.writes, 0);
});

test('generic save/update/remove cannot forge, erase or overwrite admission evidence', t => {
    fixture(t);
    for (const model of [{ budgetAdmission: {} }, { $unset: { budgetAdmission: '' } },
        { $rename: { budgetAdmission: 'discard' } }, { 'budgetAdmission.command': {} }]) {
        assert.throws(() => admission.protect({ model }), { code: 'ERR_PROMOTION_BUDGET_ADMISSION_UNCONFIRMED' });
    }
    const command = { model: { code: 'campaign', budget: { spent: '0' } } };
    admission.protectSave(command);
    assert.deepEqual(command.query, { code: 'campaign', budgetAdmission: { $exists: false } });
    const removal = { query: { code: 'campaign' } }; admission.protectRemoval(removal);
    assert.deepEqual(removal.query, { code: 'campaign', budgetAdmission: { $exists: false } });
    for (const model of [{ budget: { spent: '0' }, revision: 2 }, { $set: { 'budget.spent': '0' } },
        { $unset: { budget: '' } }]) {
        const update = { query: { code: 'campaign' }, model, budgetConsumptionWrite: true };
        admission.protect(update);
        assert.deepEqual(update.query, { code: 'campaign', budgetAdmission: { $exists: false } });
        assert.equal(operation.isBudgetConsumptionWrite(update), false);
    }
});

test('later-layer admission narrowing is used by both preflight and installation', async t => {
    const f = fixture(t);
    SERVICE.DefaultPromotionBudgetAdmissionService.requireInsertOwner = async function () {
        throw new Error('partner narrowed installed owner admission');
    };
    await assert.rejects(setup.preflightContribution(f.request), /partner narrowed/);
    await assert.rejects(setup.installContribution(f.request), /partner narrowed/);
    assert.equal(f.state.writes, 0);
});

test('Staged policy saves preserve their versioned selector while still rejecting admission evidence', t => {
    const f = fixture(t); f.settings.publication.runtimeRole = 'STAGED';
    const command = { model: { code: 'campaign', budget: { limit: '100' } }, query: { code: 'campaign', versionId: 2 } };
    admission.protectSave(command);
    assert.deepEqual(command.query, { code: 'campaign', versionId: 2 });
    assert.throws(() => admission.protectSave({ model: { code: 'campaign', budgetAdmission: {} } }),
        { code: 'ERR_PROMOTION_BUDGET_ADMISSION_UNCONFIRMED' });
});

test('caller mutation across qualification cannot replace original signed scope or immutable provenance', async t => {
    const f = fixture(t);
    const original = structuredClone(f.request.contribution);
    let calls = 0;
    SERVICE.DefaultDataReleaseService.readContributionPayload = async function (descriptor) {
        assert.deepEqual(descriptor, original); calls++;
        f.request.authData.enterpriseCode = 'foreign'; f.request.contribution.checksum = 'b'.repeat(64);
        return structuredClone(f.payload);
    };
    await setup.installContribution(f.request);
    assert.equal(calls, 2); assert.equal(f.state.writes, 1);
    assert.equal(f.rows[0].enterpriseCode, 'issuerA');
    assert.equal(f.rows[0].budgetAdmission.command.contribution.checksum, 'a'.repeat(64));
});

test('unchanged opening revision cannot falsely attest nonzero initial consumption', async t => {
    const f = fixture(t);
    await setup.installContribution(f.request);
    f.rows[0].budget.spent = '10';
    await assert.rejects(setup.preflightContribution(f.request), { code: 'ERR_PROMOTION_BUDGET_ADMISSION_UNCONFIRMED' });
    assert.equal(f.state.writes, 1);
});

test('admitted consumption rows are not mutable policy fallback for another Store or merchant coupon', async t => {
    const f = fixture(t);
    await setup.installContribution(f.request);
    assert.deepEqual(await operation.promotions({ ...f.request, storeCode: 'storeB' }), []);
    assert.equal((await operation.promotions({ ...f.request, storeCode: 'storeA' }))[0].budget.spent, '0');
    await assert.rejects(operation.capturePurchasedRights({ ...f.request, storeCode: 'storeB' },
        { promotionCode: 'campaign' }, new Date()), /campaign is not available for purchase/);
    assert.throws(() => operation.purchasedCampaign({}, f.rows[0]),
        { code: 'ERR_PROMOTION_BUDGET_ADMISSION_UNCONFIRMED' });
});

test('admitted budget reversal refuses legacy fallback without an activated delivery owner', async t => {
    const f = fixture(t);
    await setup.installContribution(f.request);
    f.rows[0].budget.spent = '10'; f.rows[0].revision = 1;
    const original = structuredClone(f.rows[0]), ledger = [];
    SERVICE.DefaultPromotionBudgetLedgerService.save = async command => {
        ledger.push(command.model); return { code: 'SUC_TEST', result: command.model };
    };
    SERVICE.DefaultPromotionService.update = async command => {
        assert.fail('admitted counters must not reach the legacy update owner');
    };
    const redemption = { promotionCode: 'campaign', code: 'redemption1', targetCode: 'cart1', discountAmount: '4' };
    await assert.rejects(operation.releaseBudget(f.request, redemption), { code: 'ERR_PROMOTION_BUDGET_ADMISSION_UNCONFIRMED' });
    assert.equal(ledger.length, 0);
    assert.deepEqual(f.rows[0], original);
});

test('budget mutation helper has private request identity and generic retry cannot reuse it', async t => {
    const f = fixture(t);
    await setup.installContribution(f.request);
    let captured;
    SERVICE.DefaultPromotionBudgetLedgerService.save = async command => ({ code: 'SUC_TEST', result: command.model });
    SERVICE.DefaultPromotionService.update = async command => {
        captured = command;
        admission.protect(command);
        assert.equal(operation.isBudgetConsumptionWrite(command), true);
        assert.equal(Object.hasOwn(command.query, 'budgetAdmission'), false);
        assert.equal(command.query.revision, 0);
        assert.equal(command.query['budget.spent'], '0');
        Object.assign(f.rows[0], structuredClone(command.model));
        return { code: 'SUC_TEST', result: { modifiedCount: 1 } };
    };
    await operation.persistBudgetCommand({ tenant: f.request.tenant, authData: operation.serviceAuthData(f.request),
        query: { tenant: f.request.tenant, enterpriseCode: f.request.enterpriseCode, code: 'campaign', revision: 0, 'budget.spent': '0' },
        model: { budget: { limit: '100', spent: '3' }, revision: 1 },
    }, command => SERVICE.DefaultPromotionService.update(command));
    assert.equal(f.rows[0].budget.spent, '3');
    assert.equal(operation.isBudgetConsumptionWrite(captured), false);
    admission.protect(captured);
    assert.deepEqual(captured.query.budgetAdmission, { $exists: false });
});
