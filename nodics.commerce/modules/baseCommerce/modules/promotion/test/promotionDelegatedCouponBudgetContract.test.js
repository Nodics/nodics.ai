/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = path.resolve(__dirname, '../../../../../..');
const fixtureOwner = require('./helpers/secureIssuanceFixture');
const budget = require('../src/service/defaultPromotionBudgetMutationService');
const bridge = require('../src/service/defaultPromotionCouponBudgetService');
const sellerPolicy = require('../src/service/defaultPromotionSellerPolicyService');
const seller = require('../src/service/defaultCouponSellerAuthorizationService');
const publication = require('../src/service/defaultPromotionPublicationService');
const setup = require('../src/service/defaultPromotionSetupContributionService');
const secure = require('../src/service/defaultCouponSecureIssuanceService');
const schemas = require('../src/schemas/schemas').promotion;
const save = require(path.join(root, 'nodics.foundation/modules/nDatabase/database/src/service/procs/save/defaultModelSaveInitializerService'));
const baseSchema = require(path.join(root, 'nodics.foundation/modules/nDatabase/database/src/schemas/schemas')).default.super;
const update = require(path.join(root, 'nodics.foundation/modules/nDatabase/database/src/service/procs/update/defaultModelsUpdateInitializerService'));

/** @module promotion/test/promotionDelegatedCouponBudgetContract @description Exercises actual secure issuance, retained publication readers, private coupon budget owners, generated schema hooks and opaque atomic accounting with isolated Profile/merchant/provider ports. Does not establish installed consent, merchant integration or native transaction qualification. @layer test @owner promotion */

/** Builds real owner-reviewed consent, issued stock and publication receipts; installed readiness, merchant and provider ports remain isolated doubles. @param {Object} t Test context. @returns {Promise<Object>} Source fixture. */
async function fixture(t, options = {}) {
    const f = fixtureOwner.create(t);
    SERVICE.DefaultModelSaveInitializerService = { ...save, LOG: { debug() {} } };
    global.UTILS.isBlank = require('lodash').isEmpty;
    if (options.limit) f.policy.budget.limit = options.limit;
    f.policy.vendorEnterpriseRef = { moduleName: 'profile', schemaName: 'enterprise', code: 'vendorB' };
    f.campaign.policyFingerprint = publication.fingerprint(f.policy);
    f.request.authorization = 'Bearer isolated-source-test';
    f.request.storeCode = 'storeA';
    f.settings.promotion.sellerAuthorization = { enabled: true, qualified: true, maximumSellers: 10 };
    SERVICE.DefaultSecuredRequestPipelineService = { getGrantedPermissions: () => ['commerce.promotion.manage', 'commerce.coupon.seller.manage'],
        isPermissionGranted: (permission, permissions) => permissions.includes(permission) };
    SERVICE.DefaultModuleService = { invokeModule: async request => {
        if (request.apiName === '/identity/scopes/me') return { principalCode: 'operatorA',
            scopes: [{ scopeType: 'ENTERPRISE', scopeCode: 'issuerA', tenantCode: 'tenantA' }], deniedScopes: [] };
        assert.equal(request.apiName, '/references/read');
        assert.equal(request.methodName, 'POST');
        const code = request.requestBody?.codes?.[0];
        assert.ok(['issuerA', 'vendorB'].includes(code));
        assert.deepEqual(request.requestBody, { type: 'enterprise', codes: [code] });
        assert.equal(request.tenant, 'tenantA');
        assert.deepEqual(request.request, { tenant: 'tenantA' });
        assert.equal(request.header, undefined);
        return [{ code, active: true }];
    } };
    await SERVICE.DefaultPromotionBudgetAdmissionService.initialize(setup.campaignRequest(f.request, f.campaign));
    await seller.manage({ ...f.request, promotionCode: 'campaign', payload: { action: 'GRANT', sellerEnterpriseCode: 'vendorB',
        expectedRevision: 0, commandReference: 'distributionReview001', expiresAt: '2099-01-01T00:00:00.000Z',
        benefitConsumption: 'ISSUED_COUPON_BENEFIT_V1' } });
    await secure.issue(f.request, f.intent, f.campaign);
    const coupon = f.rows.coupon[0];
    Object.assign(coupon, { status: 'CLAIMED', benefitStatus: 'CLAIMED', soldTo: 'buyerA', orderCode: 'orderA', productCode: 'offerA',
        idempotencyKey: 'originalPurchase001', soldAt: new Date(),
        claimTargetCode: 'posTargetA', claimTargetType: 'POS' });
    SERVICE.DefaultPromotionBudgetMutationService = { ...budget };
    SERVICE.DefaultPromotionCouponBudgetService = { ...bridge };
    SERVICE.DefaultPromotionSellerPolicyService = sellerPolicy;
    SERVICE.DefaultIdentityGovernanceService = { getSystemAuthData: () => ({ isSystem: true }) };
    const scope = { tenant: 'tenantA', enterpriseCode: 'issuerA' }, rootIdentity = { rootType: 'promotion', rootCode: 'rootA' };
    const payload = { ...scope, ...rootIdentity, records: [{ schema: 'promotion', policy: structuredClone(f.policy) }] };
    const version = publication.fingerprint(payload), pointerCode = publication.pointerCode(rootIdentity, scope), operationKey = 'activation001';
    const receiptCode = publication.fingerprint({ ...scope, pointerCode, operationKey });
    f.retained = {
        release: { ...scope, code: version, ...rootIdentity, fingerprint: version, payload },
        pointer: { ...scope, code: pointerCode, version, receiptCode, revision: 1 },
        receipt: { ...scope, code: receiptCode, pointerCode, targetVersion: version, expectedRevision: 0, fingerprint: version, applied: true, operationKey },
    };
    for (const [kind, name] of [['release', 'DefaultPromotionPolicyReleaseService'], ['pointer', 'DefaultPromotionPolicyPointerService'],
        ['receipt', 'DefaultPromotionPolicyReceiptService']]) SERVICE[name] = { save() { throw new Error('publication is read-only'); },
        update() { throw new Error('publication is read-only'); }, get: async command => {
            if (options.issuerPublicationReads && command.authData.isSystem !== true) {
                assert.deepEqual(command.authData, f.request.authData);
                assert.equal(command.query.enterpriseCode, f.request.authData.enterpriseCode);
            } else {
                assert.equal(command.authData.isSystem, true);
                assert.equal(command.options?.skipItemCache, true);
            }
            const row = f.retained[kind];
            return { code: 'SUC_TEST', result: row && f.matches(row, command.query) ? [structuredClone(row)] : [] };
        } };
    SERVICE.DefaultPromotionPublicationService = publication;
    const transaction = SERVICE.DefaultDatabaseTransactionService;
    f.rows.promotionBudgetLedger = [];
    const rows = (command, model) => command.transactionContext
        ? transaction.operationOptions(command.transactionContext, f.database, model).rows : f.rows;
    const ledger = { schemaName: 'promotionBudgetLedger', moduleName: 'promotion', primaryKey: 'code', versioned: false,
        rawSchema: structuredClone(schemas.promotionBudgetLedger) };
    if (options.generatedDefaults) ledger.rawSchema.definition = { ...structuredClone(baseSchema.definition), ...ledger.rawSchema.definition };
    ledger.guardProtectedRead = command => SERVICE.DefaultSchemaReadAccessPolicyService.providerRead(command, ledger);
    ledger.projectReadResult = (command, response) => SERVICE.DefaultSchemaReadAccessPolicyService.providerResult(command, response, ledger);
    ledger.compareAndSetItem = async command => {
        assert.equal(command.insertOnly, true); assert.ok(command.transactionContext);
        const target = rows(command, ledger).promotionBudgetLedger;
        if (target.some(row => row.code === command.model.code)) throw new Error('duplicate receipt');
        target.push(structuredClone(command.model));
        if (f.state.afterInsert) throw new Error('interrupted insert');
        return structuredClone(command.model);
    };
    f.models.promotionBudgetLedger = ledger;
    const pre = async (initializer, command, model) => {
        command.schemaModel = model;
        if (options.generatedDefaults && initializer === save && model.schemaName === 'promotionBudgetLedger') {
            command.schemaModel.rawSchema.definition = { ...structuredClone(baseSchema.definition), ...command.schemaModel.rawSchema.definition };
            await new Promise((resolve, reject) => ({ ...save, LOG: { debug() {} } }).applyDefaultValues(command, {}, {
                nextSuccess: resolve, error: (request, response, error) => reject(error),
            }));
            if (options.tamperDefault) command.model.accessGroups = ['foreignGroup'];
        }
        if (initializer === update) await new Promise((resolve, reject) => ({ ...update, LOG: { debug() {} } }).buildQuery(command, {}, {
            nextSuccess: resolve, error: (request, response, error) => reject(error),
        }));
        await new Promise((resolve, reject) => ({ ...initializer, LOG: { debug() {} } }).applyPreInterceptors(command, {}, {
            nextSuccess: resolve, error: (request, response, error) => reject(error),
        }));
    };
    for (const [name, service] of [['promotion', 'DefaultPromotionService'], ['promotionBudgetLedger', 'DefaultPromotionBudgetLedgerService'], ['coupon', 'DefaultCouponService']]) {
        const model = f.models[name];
        SERVICE[service] = { get: async command => {
            model.guardProtectedRead(command);
            const response = { success: { code: 'SUC_TEST', result: structuredClone(rows(command, model)[name].filter(row => f.matches(row, command.query))) } };
            model.projectReadResult(command, response);
            return response.success;
        }, save: async command => {
            f.state.receiptCommand = command;
            await pre(save, command, model);
            return { code: 'SUC_TEST', result: await save.persistModel(command) };
        }, update: async command => {
            if (name === 'promotion' && f.state.onCounter) f.state.onCounter(command);
            if (name === 'coupon' && f.state.onCouponCAS) await f.state.onCouponCAS(command);
            await pre(update, command, model);
            return { code: 'SUC_TEST', result: await update.persistUpdates(command) };
        } };
        model.updateItems = async command => {
            const selected = rows(command, model)[name].filter(row => f.matches(row, command.query));
            if (f.state.zeroMatch) return { acknowledged: true, matchedCount: 0, modifiedCount: 0 };
            for (const row of selected) Object.assign(row, structuredClone(command.model));
            if (f.state.afterCounter) throw new Error('interrupted counter');
            return { acknowledged: true, matchedCount: selected.length, modifiedCount: selected.length };
        };
    }
    const handoffs = new WeakMap();
    SERVICE.DefaultPromotionMerchantScopeService = { resolveBudgetRequest: async (command, type) => {
        const entry = handoffs.get(command);
        if (!entry || entry.type !== type || command.privateCommand !== true || f.state.revokedHandoff) throw new Error('private merchant admission required');
        if (f.state.onHandoff) await f.state.onHandoff(entry, command);
        return structuredClone(entry.value);
    } };
    f.handoff = (type = 'COMMIT', changes = {}) => {
        const command = { privateCommand: true };
        handoffs.set(command, { type, value: { request: structuredClone(f.request), couponCode: coupon.code, vendorEnterpriseCode: 'vendorB',
            storeCode: 'outletA', distributionStoreCode: 'storeA', ownerId: 'buyerA', targetCode: 'posTargetA', targetType: 'POS', operationCode: 'originalBenefit001',
            benefit: { amount: '10', currency: 'AED', sourceReference: 'pricedReceipt001' },
            ...(type === 'RELEASE' ? { originalOperationCode: 'originalBenefit001', reversalCode: 'originalReversal001' } : {}), ...changes } });
        return command;
    };
    f.commit = command => SERVICE.DefaultPromotionCouponBudgetService.consume(command || f.handoff());
    f.release = command => SERVICE.DefaultPromotionCouponBudgetService.release(command || f.handoff('RELEASE'));
    f.current = () => f.rows.promotion[0];
    return f;
}

test('private receipt admission survives real generated inherited defaults without widening its exact write guard', async t => {
    const f = await fixture(t, { generatedDefaults: true });
    global.UTILS.isBlank = require('lodash').isEmpty;
    const result = await f.commit();
    assert.equal(result.budget.spent, '10');
    assert.deepEqual(f.rows.promotionBudgetLedger[0].accessGroups, ['userGroup']);
    assert.equal(f.rows.promotionBudgetLedger.length, 1);
});

test('changed generated receipt defaults remain refused rather than allowlisted', async t => {
    const f = await fixture(t, { generatedDefaults: true, tamperDefault: true }), original = structuredClone(f.rows);
    await assert.rejects(f.commit());
    assert.deepEqual(f.rows, original);
});

test('effective tenant receipt defaults are pinned through the existing generated initializer', async t => {
    const f = await fixture(t, { generatedDefaults: true });
    f.models.promotionBudgetLedger.rawSchema.schemaOptions = { tenantA: { defaultValues: { accessGroups: ['reviewedGroup'] } } };
    await f.commit();
    assert.deepEqual(f.rows.promotionBudgetLedger[0].accessGroups, ['reviewedGroup']);
    assert.equal(f.rows.promotionBudgetLedger.length, 1);
});

test('private budget diagnostics retain fixed original stages without disclosing transaction failures', async t => {
    const f = await fixture(t), original = structuredClone(f.rows);
    f.state.onCouponCAS = () => { throw new Error('private-coupon private-transaction'); };
    await assert.rejects(f.commit(), error => {
        assert.equal(budget.failureStage(error), 'BUDGET_TX_COUPON_FENCE');
        assert.equal(bridge.failureStage(error), 'BUDGET_MUTATE');
        assert.equal(budget.failureStage({ ...error, stage: 'BUDGET_TX_COUPON_FENCE' }), undefined);
        assert.equal(bridge.failureStage({ ...error, stage: 'BUDGET_MUTATE' }), undefined);
        assert.equal(error.message.includes('private-coupon'), false);
        return true;
    });
    assert.deepEqual(f.rows, original);
});

test('private coupon-bound COMMIT preserves signed issuer identity and mutates only original issuer budget', async t => {
    const f = await fixture(t), originalAuth = structuredClone(f.request.authData);
    const result = await f.commit();
    assert.equal(result.budget.spent, '10'); assert.equal(f.rows.promotionBudgetLedger.length, 1);
    const command = f.rows.promotionBudgetLedger[0].budgetMutation.command;
    assert.equal(command.contractVersion, 2); assert.equal(command.vendorEnterpriseCode, 'vendorB');
    assert.equal(command.enterpriseCode, 'issuerA'); assert.equal(command.couponCode, f.rows.coupon[0].code);
    assert.equal(command.operationCode, 'originalBenefit001'); assert.equal(command.benefitAuthority, 'ISSUED_COUPON_BENEFIT_V1');
    assert.equal(command.storeCode, 'storeA'); assert.equal(command.outletStoreCode, 'outletA');
    assert.equal(f.rows.promotionBudgetLedger[0].actorId, 'operatorA'); assert.deepEqual(f.request.authData, originalAuth);
    assert.equal(f.rows.promotion.length, 1);
});

test('one coupon has exactly one COMMIT despite different retry keys, simultaneous calls or later RELEASE', async t => {
    const f = await fixture(t);
    const revision = f.rows.coupon[0].revision;
    await Promise.all(Array.from({ length: 6 }, () => f.commit()));
    assert.equal(f.current().budget.spent, '10'); assert.equal(f.rows.promotionBudgetLedger.length, 1);
    assert.equal(f.rows.coupon[0].revision, revision + 1);
    await assert.rejects(f.commit(f.handoff('COMMIT', { operationCode: 'anotherOperation001' })));
    assert.equal(f.current().budget.spent, '10');
    await f.release(); await f.commit();
    assert.equal(f.current().budget.spent, '0'); assert.equal(f.rows.promotionBudgetLedger.length, 2);
});

test('first COMMIT requires unused CLAIMED stock; REDEEMED never creates retroactive accounting', async t => {
    for (const patch of [{ status: 'REDEEMED' }, { benefitStatus: 'REDEEMED' }, { usedCount: 1 },
        { redeemedTargetCode: 'posTargetA' }, { redeemedTargetType: 'POS' }]) await t.test(JSON.stringify(patch), async t => {
        const f = await fixture(t); Object.assign(f.rows.coupon[0], patch);
        const original = structuredClone(f.rows);
        await assert.rejects(f.commit());
        assert.deepEqual(f.rows, original);
    });
});

test('REDEEMED recovery replays the exact original COMMIT without new pricing, coupon fence or charge', async t => {
    const f = await fixture(t), first = await f.commit();
    Object.assign(f.rows.coupon[0], { status: 'REDEEMED', benefitStatus: 'REDEEMED', usedCount: 1,
        redeemedTargetCode: 'posTargetA', redeemedTargetType: 'POS' });
    const original = structuredClone(f.rows);
    f.state.onCouponCAS = () => { throw new Error('replay must not write coupon'); };
    const replay = await f.commit();
    assert.equal(replay.receiptCode, first.receiptCode); assert.deepEqual(f.rows, original);
    for (const changes of [{ operationCode: 'differentBenefit001' }, { targetCode: 'differentTarget' },
        { benefit: { amount: '11', currency: 'AED', sourceReference: 'pricedReceipt001' } },
        { benefit: { amount: '10', currency: 'AED', sourceReference: 'differentReceipt001' } }]) {
        await assert.rejects(f.commit(f.handoff('COMMIT', changes))); assert.deepEqual(f.rows, original);
    }
    f.rows.promotionBudgetLedger.splice(0);
    const missing = structuredClone(f.rows);
    await assert.rejects(f.commit()); assert.deepEqual(f.rows, missing);
});

test('new coupon revision fence pins exact identity, generated write inputs and original opaque transaction', async t => {
    for (const failure of ['query', 'model', 'auth', 'tenant', 'transaction', 'options', 'explain', 'snapshot', 'extraOption', 'internalPersistence', 'models', 'missingOwner'])
        await t.test(failure, async t => {
            const f = await fixture(t), original = structuredClone(f.rows); let retained;
            f.state.onCouponCAS = command => {
                retained = command;
                assert.equal(bridge.isFenceWrite(command), true);
                assert.equal(bridge.isFenceWrite({ ...command }), false);
                if (failure === 'query') command.query.code = f.rows.coupon[1].code;
                if (failure === 'model') command.model.status = 'REDEEMED';
                if (failure === 'auth') command.authData = {};
                if (failure === 'tenant') command.tenant = 'foreign';
                if (failure === 'transaction') command.transactionContext = {};
                if (failure === 'options') command.options.recursive = true;
                if (failure === 'explain') command.options.explain = true;
                if (failure === 'snapshot') command.options.snapshot = true;
                if (failure === 'extraOption') command.options.replaceAllMatchesByQuery = true;
                if (failure === 'internalPersistence') command.internalPersistence = true;
                if (failure === 'models') command.models = [command.model];
            };
            if (failure === 'missingOwner') SERVICE.DefaultPromotionCouponBudgetService.fenceNewCommit = undefined;
            await assert.rejects(f.commit()); assert.deepEqual(f.rows, original);
            if (retained) assert.equal(bridge.isFenceWrite(retained), false);
        });
});

test('coupon lifecycle CAS and first budget COMMIT conflict on the same coupon revision under an isolated snapshot race', async t => {
    const f = await fixture(t), adapter = SERVICE.IsolatedTransactionalAdapter, execute = adapter.executeTransaction;
    const operation = SERVICE.DefaultPromotionOperationService, old = structuredClone(f.rows.coupon[0]);
    const owner = { tenant: 'tenantA', enterpriseCode: 'vendorB', authData: { isSystem: true } };
    const redeemed = { status: 'REDEEMED', benefitStatus: 'REDEEMED', usedCount: 1, revision: old.revision + 1,
        redeemedTargetCode: 'posTargetA', redeemedTargetType: 'POS' };
    // The isolated provider models a snapshot write conflict; it is not native topology qualification.
    adapter.executeTransaction = (database, options, work) => execute(database, options, async context => {
        const observed = structuredClone(f.rows.coupon);
        const result = await work(context);
        if (!require('node:util').isDeepStrictEqual(f.rows.coupon, observed)) throw new Error('coupon snapshot write conflict');
        return result;
    });
    let raced = false;
    f.state.onCouponCAS = async command => {
        if (!command.transactionContext || raced) return;
        raced = true;
        await operation.commitLifecycleCoupon(owner, old, redeemed);
    };
    await assert.rejects(f.commit());
    assert.equal(raced, true); assert.equal(f.rows.coupon[0].status, 'REDEEMED');
    assert.equal(f.rows.coupon[0].revision, old.revision + 1);
    assert.equal(f.current().budget.spent, '0'); assert.equal(f.rows.promotionBudgetLedger.length, 0);
    await assert.rejects(f.commit()); assert.equal(f.current().budget.spent, '0');
});

test('COMMIT-winning coupon fence rejects stale redemption CAS; fresh lifecycle recovery keeps one original charge', async t => {
    const f = await fixture(t), operation = SERVICE.DefaultPromotionOperationService, old = structuredClone(f.rows.coupon[0]);
    const owner = { tenant: 'tenantA', enterpriseCode: 'vendorB', authData: { isSystem: true } };
    await f.commit();
    const redeemed = coupon => ({ status: 'REDEEMED', benefitStatus: 'REDEEMED', usedCount: 1,
        revision: coupon.revision + 1, redeemedTargetCode: 'posTargetA', redeemedTargetType: 'POS' });
    await assert.rejects(operation.commitLifecycleCoupon(owner, old, redeemed(old)), /lost its revision/);
    const fresh = await operation.readLifecycleCoupon(owner, old.code);
    await operation.commitLifecycleCoupon(owner, fresh, redeemed(fresh));
    await f.commit();
    assert.equal(f.rows.coupon[0].revision, old.revision + 2);
    assert.equal(f.rows.promotionBudgetLedger.length, 1); assert.equal(f.current().budget.spent, '10');
    assert.equal(f.rows.promotionBudgetLedger[0].budgetMutation.couponRevisionBefore, old.revision);
    assert.equal(f.rows.promotionBudgetLedger[0].budgetMutation.couponRevisionAfter, old.revision + 1);
});

test('first-COMMIT coupon CAS requires a positive single-row acknowledgement and exact transactional readback', async t => {
    for (const failure of ['zero', 'unacknowledged', 'missingModified', 'multiple', 'readback']) await t.test(failure, async t => {
        const f = await fixture(t), original = structuredClone(f.rows), persist = f.models.coupon.updateItems;
        f.models.coupon.updateItems = async command => {
            if (failure === 'zero') return { acknowledged: true, matchedCount: 0, modifiedCount: 0 };
            const result = await persist(command);
            if (failure === 'unacknowledged') result.acknowledged = false;
            if (failure === 'missingModified') delete result.modifiedCount;
            if (failure === 'multiple') result.modifiedCount = result.matchedCount = 2;
            if (failure === 'readback') SERVICE.DefaultDatabaseTransactionService
                .operationOptions(command.transactionContext, f.database, f.models.coupon).rows.coupon[0].revision++;
            return result;
        };
        await assert.rejects(f.commit()); assert.deepEqual(f.rows, original);
    });
});

test('fresh explicit consent revisions do not upgrade old stock; only newly owner-issued stock binds the new grant', async t => {
    const f = await fixture(t, { issuerPublicationReads: true }), old = structuredClone(f.rows.coupon[0]);
    const review = (purpose, commandReference) => seller.manage({ ...f.request, promotionCode: 'campaign', payload: {
        action: 'GRANT', sellerEnterpriseCode: 'vendorB', expectedRevision: f.current().revision,
        expiresAt: '2099-01-01T00:00:00.000Z', commandReference,
        ...(purpose ? { benefitConsumption: purpose } : {}),
    } });
    const distribution = await review(undefined, 'distributionOnlyRevision002');
    assert.equal(distribution.seller.revision, 2); assert.equal(distribution.seller.benefitConsumption, undefined);
    await assert.rejects(f.commit());
    const explicit = await review('ISSUED_COUPON_BENEFIT_V1', 'explicitBenefitRevision003');
    assert.equal(explicit.seller.revision, 3); await assert.rejects(f.commit());
    assert.deepEqual(f.rows.coupon[0], old); assert.equal(f.rows.promotionBudgetLedger.length, 0);
    await secure.issue(f.request, { ...f.intent, batchCode: 'freshBenefitBatch003', commandReference: 'freshBenefitIssuance003' }, f.campaign);
    const fresh = f.rows.coupon.find(coupon => coupon.batchCode === 'freshBenefitBatch003');
    assert.equal(fresh.sellerAuthorizationProof.grantRevision, 3);
    Object.assign(fresh, Object.fromEntries(['status', 'benefitStatus', 'soldTo', 'soldAt', 'orderCode', 'productCode', 'idempotencyKey',
        'claimTargetCode', 'claimTargetType'].map(key => [key, structuredClone(old[key])])));
    await f.commit(f.handoff('COMMIT', { couponCode: fresh.code, operationCode: 'freshBenefitOperation003' }));
    await assert.rejects(f.commit()); assert.equal(f.current().budget.spent, '10'); assert.equal(f.rows.promotionBudgetLedger.length, 1);
});

test('RELEASE links the exact original COMMIT once independently of new reversal references', async t => {
    const f = await fixture(t); const result = await f.commit();
    const release = await f.release(); await f.release(f.handoff('RELEASE', { operationCode: 'retryInverse001', reversalCode: 'retryInverse001' }));
    assert.equal(release.originalCommitCode, result.receiptCode); assert.equal(f.current().budget.spent, '0');
    assert.equal(f.rows.promotionBudgetLedger.length, 2);
    assert.equal(f.rows.promotionBudgetLedger[1].budgetMutation.command.originalCommitCode, result.receiptCode);
});

test('distribution-only grant never permits spend; exact inverse survives consent revocation and publication replacement', async t => {
    const f = await fixture(t); delete f.current().sellerAuthorizations[0].benefitConsumption;
    await assert.rejects(f.commit()); assert.equal(f.rows.promotionBudgetLedger.length, 0);
    f.current().sellerAuthorizations[0].benefitConsumption = 'ISSUED_COUPON_BENEFIT_V1'; await f.commit();
    f.current().sellerAuthorizations[0].status = 'REVOKED'; f.current().sellerAuthorizations[0].revision++;
    f.current().revision++; f.retained.pointer = undefined;
    await assert.rejects(f.commit()); await f.release();
    assert.equal(f.current().budget.spent, '0');
});

test('raw or copied handoffs, ordinary policy reads and forged direct budget envelopes grant no mutation', async t => {
    const f = await fixture(t), command = f.handoff();
    await assert.rejects(f.commit(structuredClone(command)));
    await assert.rejects(f.commit({ ...command, qualified: true }));
    await assert.rejects(bridge.resolveMutation({ mutationType: 'COMMIT', request: f.request }));
    await assert.rejects(budget.mutateCoupon({ mutationType: 'COMMIT', binding: {} }));
    assert.throws(() => bridge.owner({ request: f.request, vendorEnterpriseCode: 'vendorB' }, 'issuerA'));
    assert.throws(() => bridge.persistenceOwner({ binding: { issuerEnterpriseCode: 'issuerA' } }));
    await assert.rejects(budget.consume({ ...f.request, enterpriseCode: 'vendorB', authData: { ...f.request.authData, enterpriseCode: 'vendorB' } }, f.policy, '10'));
    assert.equal(f.current().budget.spent, '0'); assert.equal(f.rows.promotionBudgetLedger.length, 0);
});

test('changed amount, source, currency, target, buyer, vendor or original operation cannot adopt a receipt', async t => {
    const f = await fixture(t); await f.commit();
    for (const changes of [{ benefit: { amount: '11', currency: 'AED', sourceReference: 'pricedReceipt001' } },
        { benefit: { amount: '10', currency: 'USD', sourceReference: 'pricedReceipt001' } },
        { benefit: { amount: '10', currency: 'AED', sourceReference: 'differentReceipt001' } },
        { targetCode: 'differentTarget' }, { ownerId: 'otherBuyer' }, { vendorEnterpriseCode: 'otherVendor' }, { operationCode: 'differentOperation' }]) {
        await assert.rejects(f.commit(f.handoff('COMMIT', changes)));
        await assert.rejects(f.release(f.handoff('RELEASE', { ...changes,
            ...(changes.operationCode ? { originalOperationCode: changes.operationCode } : {}) })));
    }
    assert.equal(f.current().budget.spent, '10'); assert.equal(f.rows.promotionBudgetLedger.length, 1);
});

test('original issuance membership, policy and admission cannot drift into another budget command', async t => {
    const f = await fixture(t), original = structuredClone(f.rows);
    for (const change of [() => { f.rows.coupon[0].tokenHash = 'f'.repeat(64); },
        () => { f.rows.couponBatch[0].secureIssuance.units[0].protectedFingerprint = 'f'.repeat(64); },
        () => { f.current().budgetAdmission.command.contribution.checksum = 'f'.repeat(64); },
        () => { f.current().sellerAuthorizations[0].revision++; },
        () => { f.current().sellerAuthorizations[0].expiresAt = '2000-01-01T00:00:00.000Z'; },
        () => { f.current().issuerEnterpriseRef.code = 'foreignIssuer'; }]) {
        for (const key of Object.keys(original)) f.rows[key].splice(0, f.rows[key].length, ...structuredClone(original[key]));
        change(); await assert.rejects(f.commit()); assert.equal(f.rows.promotionBudgetLedger.length, 0);
    }
});

test('counter/receipt transaction rollback, callback retries and lost acknowledgement never duplicate spend', async t => {
    for (const failure of ['afterInsert', 'afterCounter', 'zeroMatch']) await t.test(failure, async t => {
        const f = await fixture(t); f.state[failure] = true;
        await assert.rejects(f.commit()); assert.equal(f.current().budget.spent, '0'); assert.equal(f.rows.promotionBudgetLedger.length, 0);
        f.state[failure] = false; f.state.lost = true; await f.commit();
        assert.equal(f.current().budget.spent, '10'); assert.equal(f.rows.promotionBudgetLedger.length, 1);
    });
});

test('same-transaction campaign revision fence refuses consent change between observation and counter CAS', async t => {
    const f = await fixture(t);
    f.state.onCounter = command => {
        const scoped = SERVICE.DefaultDatabaseTransactionService.operationOptions(command.transactionContext, f.database, f.models.promotion).rows;
        scoped.promotion[0].revision++; scoped.promotion[0].sellerAuthorizations[0].status = 'REVOKED';
    };
    await assert.rejects(f.commit()); assert.equal(f.current().budget.spent, '0'); assert.equal(f.rows.promotionBudgetLedger.length, 0);
});

test('exact private envelope expires after owner dispatch and copied envelopes cannot invoke the counter owner', async t => {
    const f = await fixture(t), original = SERVICE.DefaultPromotionBudgetMutationService.mutateCoupon;
    let observed;
    SERVICE.DefaultPromotionBudgetMutationService.mutateCoupon = async function (envelope) {
        observed = envelope;
        await assert.rejects(budget.mutateCoupon(structuredClone(envelope)));
        await assert.rejects(publication.readCouponBudgetPolicy(structuredClone(envelope)));
        return original.call(this, envelope);
    };
    await f.commit();
    await assert.rejects(budget.mutateCoupon(observed));
    await assert.rejects(publication.readCouponBudgetPolicy(observed));
    assert.equal(f.current().budget.spent, '10');
});

test('original issuer outlet is never replaced with the separate distribution Store to pass selection', async t => {
    const f = await fixture(t); f.request.storeCode = 'outletA';
    const result = await f.commit(); assert.equal(result.budget.spent, '10'); assert.equal(f.request.storeCode, 'outletA');
    const receipt = f.rows.promotionBudgetLedger[0].budgetMutation.command;
    assert.equal(receipt.storeCode, 'storeA'); assert.equal(receipt.outletStoreCode, 'outletA');
    await assert.rejects(f.commit(f.handoff('COMMIT', { distributionStoreCode: 'unselected' })));
    assert.equal(f.rows.promotionBudgetLedger.length, 1);
});

test('retained decimal limit spelling remains immutable while arithmetic and benefit amounts are canonical', async t => {
    const f = await fixture(t, { limit: '100.00' }); await f.commit();
    assert.equal(f.current().budget.limit, '100.00'); assert.equal(f.current().budget.spent, '10');
    assert.equal(f.rows.promotionBudgetLedger[0].budgetMutation.command.limit, '100.00');
    await f.release(); assert.equal(f.current().budget.limit, '100.00'); assert.equal(f.current().budget.spent, '0');
});

test('opaque or Express transport fields are never cloned into the private accounting command', async t => {
    const f = await fixture(t), resolve = SERVICE.DefaultPromotionMerchantScopeService.resolveBudgetRequest;
    SERVICE.DefaultPromotionMerchantScopeService.resolveBudgetRequest = async (...args) => {
        const value = await resolve(...args);
        value.request.get = () => 'not an authority'; value.request.self = value.request;
        value.opaqueTransport = { callback() {} };
        return value;
    };
    await f.commit(); assert.equal(f.current().budget.spent, '10');
});

test('activation replacement observed after COMMIT refuses confirmation without rewriting committed original accounting', async t => {
    const f = await fixture(t);
    f.state.onCounter = () => { f.retained.receipt.applied = false; };
    await assert.rejects(f.commit());
    assert.equal(f.current().budget.spent, '10'); assert.equal(f.rows.promotionBudgetLedger.length, 1);
    await assert.rejects(f.commit());
    assert.equal(f.current().budget.spent, '10'); assert.equal(f.rows.promotionBudgetLedger.length, 1);
    await f.release(); assert.equal(f.current().budget.spent, '0');
});

test('release without an original COMMIT, exhausted budgets and forged original receipts never produce accounting', async t => {
    const f = await fixture(t);
    await assert.rejects(f.release());
    await assert.rejects(f.commit(f.handoff('COMMIT', { benefit: { amount: '101', currency: 'AED', sourceReference: 'pricedReceipt001' } })));
    assert.equal(f.current().budget.spent, '0'); assert.equal(f.rows.promotionBudgetLedger.length, 0);
    await f.commit();
    const row = f.rows.promotionBudgetLedger[0];
    row.budgetMutation.command.operationCode = 'forgedOperation';
    await assert.rejects(f.release()); assert.equal(f.current().budget.spent, '10');
});

test('retried transaction diagnostics reset before the new initial campaign read', async t => {
    const f = await fixture(t), adapter = SERVICE.IsolatedTransactionalAdapter, execute = adapter.executeTransaction;
    const get = SERVICE.DefaultPromotionService.get, original = structuredClone(f.rows);
    let retrying = false;
    SERVICE.DefaultPromotionService.get = async command => {
        if (retrying && command.transactionContext) throw new Error('private-second-attempt-read');
        return get(command);
    };
    adapter.executeTransaction = async (database, options, work) => {
        await work({ rows: structuredClone(f.rows) });
        retrying = true;
        return execute(database, options, work);
    };
    await assert.rejects(f.commit(), error => {
        assert.equal(budget.failureStage(error), 'BUDGET_TX_CURRENT');
        return true;
    });
    assert.deepEqual(f.rows, original);
});

test('transaction callback re-execution discards aborted coupon receipts and commits exactly once', async t => {
    const f = await fixture(t), adapter = SERVICE.IsolatedTransactionalAdapter, execute = adapter.executeTransaction;
    let repeated = false;
    adapter.executeTransaction = async (database, options, work) => {
        if (!repeated) { repeated = true; await work({ rows: structuredClone(f.rows) }); }
        return execute(database, options, work);
    };
    await f.commit(); assert.equal(f.current().budget.spent, '10'); assert.equal(f.rows.promotionBudgetLedger.length, 1);
});

test('multiple genuine issued coupons cannot overspend the shared issuer budget under a race', async t => {
    const f = await fixture(t);
    Object.assign(f.rows.coupon[1], Object.fromEntries(['status', 'benefitStatus', 'soldTo', 'soldAt', 'orderCode', 'productCode', 'idempotencyKey',
        'purchasePolicy', 'claimTargetCode', 'claimTargetType'].map(key => [key, structuredClone(f.rows.coupon[0][key])])));
    const operations = f.rows.coupon.slice(0, 2).map((coupon, index) => f.commit(f.handoff('COMMIT', { couponCode: coupon.code,
        operationCode: 'couponBenefit' + index, benefit: { amount: '60', currency: 'AED', sourceReference: 'pricedReceipt' + index } })));
    const results = await Promise.allSettled(operations);
    assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
    assert.equal(f.current().budget.spent, '60'); assert.equal(f.rows.promotionBudgetLedger.length, 1);
});

test('private accounting receipts retain generic read suppression and immutable generated write fences', async t => {
    const f = await fixture(t); await f.commit();
    const row = f.rows.promotionBudgetLedger[0];
    const response = await SERVICE.DefaultPromotionBudgetLedgerService.get({ tenant: 'tenantA', query: { code: row.code } });
    assert.equal(response.result[0].budgetMutation, undefined);
    assert.throws(() => budget.protectSave(f.state.receiptCommand));
    const forged = { tenant: 'tenantA', model: structuredClone(row), query: { code: row.code } };
    assert.throws(() => budget.protectSave(forged));
    assert.throws(() => budget.protect({ model: { $set: { 'budgetMutation.command.amount': '0' } } }));
});

test('handoff changes during owner awaits, missing installation and later-layer narrowing remain closed', async t => {
    for (const failure of ['handoff', 'atomic', 'indexes', 'privateOwner', 'narrowing']) await t.test(failure, async t => {
        const f = await fixture(t);
        if (failure === 'handoff') { let calls = 0; f.state.onHandoff = entry => { if (++calls > 1) entry.value.benefit.amount = '99'; }; }
        if (failure === 'atomic') f.state.atomic = false;
        if (failure === 'indexes') f.state.indexes = [];
        if (failure === 'privateOwner') delete SERVICE.DefaultPromotionMerchantScopeService.resolveBudgetRequest;
        if (failure === 'narrowing') SERVICE.DefaultPromotionCouponBudgetService = { ...bridge, assertCurrent() { this.fail(); } };
        await assert.rejects(f.commit()); assert.equal(f.current().budget.spent, '0'); assert.equal(f.rows.promotionBudgetLedger.length, 0);
    });
});
