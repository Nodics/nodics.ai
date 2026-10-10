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
const path = require('node:path');
const root = path.resolve(__dirname, '../../../../../..');
const owner = require('../src/service/defaultPromotionBudgetMutationService');
const operation = require('../src/service/defaultPromotionOperationService');
const schemas = require('../src/schemas/schemas').promotion;
const fixtureOwner = require('./helpers/secureIssuanceFixture');
const save = require(path.join(root, 'nodics.foundation/modules/nDatabase/database/src/service/procs/save/defaultModelSaveInitializerService'));
const update = require(path.join(root, 'nodics.foundation/modules/nDatabase/database/src/service/procs/update/defaultModelsUpdateInitializerService'));
const get = require(path.join(root, 'nodics.foundation/modules/nDatabase/database/src/service/procs/get/defaultModelsGetInitializerService'));
const remove = require(path.join(root, 'nodics.foundation/modules/nDatabase/database/src/service/procs/remove/defaultModelsRemoveInitializerService'));

/** @module promotion/test/promotionActivatedBudgetMutationContract @description Exercises actual budget owners, schema hooks, read suppression, generated insert/update dispatch and opaque transactions with an isolated atomic adapter. Not native database or full Checkout acceptance. @layer test @owner promotion */

function fixture(t) {
    const f = fixtureOwner.create(t), transaction = SERVICE.DefaultDatabaseTransactionService;
    SERVICE.DefaultModelSaveInitializerService = { ...save, LOG: { debug() {} } };
    global.UTILS.isBlank = require('lodash').isEmpty;
    SERVICE.DefaultPromotionBudgetMutationService = { ...owner };
    f.request = { ...f.request, storeCode: 'storeA', ownerId: 'buyerA', idempotencyKey: 'purchaseA',
        payload: { cartCode: 'cartA', currency: 'AED' } };
    f.rows.promotion.push({ ...structuredClone(f.policy), budget: { limit: '100', spent: '0' }, revision: 0,
        budgetAdmission: { command: { tenant: 'tenantA', enterpriseCode: 'issuerA', promotionCode: 'campaign',
            actorId: 'originalOperator', commandReference: 'openingA', storeCode: 'storeA', rootCode: 'rootA',
            contribution: { moduleName: 'referencePack', releaseCode: 'referencePack:operations', version: '0.0.1', checksum: 'a'.repeat(64) },
            policyFingerprint: SERVICE.DefaultPromotionPublicationService.fingerprint(f.policy) }, admittedAt: new Date() } });
    f.rows.promotionBudgetLedger = [];
    const ledger = { schemaName: 'promotionBudgetLedger', moduleName: 'promotion', primaryKey: 'code', versioned: false,
        rawSchema: structuredClone(schemas.promotionBudgetLedger) };
    const scope = (command, model) => command.transactionContext
        ? transaction.operationOptions(command.transactionContext, f.database, model).rows : f.rows;
    ledger.guardProtectedRead = command => SERVICE.DefaultSchemaReadAccessPolicyService.providerRead(command, ledger);
    ledger.projectReadResult = (command, response) => SERVICE.DefaultSchemaReadAccessPolicyService.providerResult(command, response, ledger);
    ledger.compareAndSetItem = async command => {
        assert.equal(command.operation, 'create'); assert.equal(command.insertOnly, true); assert.ok(command.transactionContext);
        const target = scope(command, ledger).promotionBudgetLedger;
        if (target.some(row => row.code === command.model.code)) throw new Error('duplicate identity');
        target.push(structuredClone(command.model)); f.state.inserts = (f.state.inserts || 0) + 1;
        if (f.state.failAfterInsert) throw new Error('interrupted after ledger insert');
        return structuredClone(command.model);
    };
    ledger.saveItems = async command => {
        const target = scope(command, ledger).promotionBudgetLedger;
        const existing = target.find(row => row.code === command.model.code);
        if (existing) Object.assign(existing, structuredClone(command.model));
        else target.push(structuredClone(command.model));
        return structuredClone(command.model);
    };
    f.models.promotionBudgetLedger = ledger;
    const pre = async (initializer, command, model) => {
        command.schemaModel = model;
        await new Promise((resolve, reject) => ({ ...initializer, LOG: { debug() {} } }).applyPreInterceptors(command, {}, {
            nextSuccess: resolve, error: (r, response, error) => reject(error),
        }));
    };
    for (const [name, serviceName] of [['promotion', 'DefaultPromotionService'], ['promotionBudgetLedger', 'DefaultPromotionBudgetLedgerService']]) {
        const model = f.models[name];
        SERVICE[serviceName] = {
            get: async command => {
                if (f.state.failedRead) return { code: 'ERR_TEST', result: [] };
                await model.guardProtectedRead(command);
                const rows = scope(command, model)[name].filter(row => f.matches(row, command.query || {}));
                const response = { success: { code: 'SUC_TEST', result: structuredClone(rows) } };
                await model.projectReadResult(command, response);
                return response.success;
            },
            save: async command => {
                f.state.lastReceiptCommand = command;
                if (f.state.tamperInsert) command.model.amount = '99';
                await pre(save, command, model);
                return { code: 'SUC_TEST', result: await save.persistModel(command) };
            },
            update: async command => {
                f.state.lastCounterCommand = command;
                if (f.state.tamperCounter) command.query = { tenant: command.tenant };
                await pre(update, command, model);
                return { code: 'SUC_TEST', result: await update.persistUpdates(command) };
            },
            remove: async command => {
                await pre(remove, command, model);
                const rows = scope(command, model)[name];
                const retained = rows.filter(row => !f.matches(row, command.query));
                const deletedCount = rows.length - retained.length;
                rows.splice(0, rows.length, ...retained);
                return { code: 'SUC_TEST', result: { acknowledged: true, deletedCount } };
            },
        };
        model.updateItems = async command => {
            const rows = scope(command, model)[name].filter(row => f.matches(row, command.query || {}));
            if (f.state.zeroMatch) return { acknowledged: true, matchedCount: 0, modifiedCount: 0 };
            for (const row of rows) Object.assign(row, structuredClone(command.model));
            f.state.counterWrites = (f.state.counterWrites || 0) + rows.length;
            if (f.state.failAfterCounter) throw new Error('interrupted after counter CAS');
            return { acknowledged: true, matchedCount: rows.length, modifiedCount: rows.length };
        };
    }
    f.consume = (amount = '10', request = f.request, policy = f.policy) => operation.consumeBudget(request, policy, amount);
    f.redemption = () => ({ code: operation.redemptionCode(f.request, f.policy, 'cartA'), tenant: 'tenantA', enterpriseCode: 'issuerA',
        promotionCode: 'campaign', targetCode: 'cartA', ownerId: 'buyerA', idempotencyKey: 'purchaseA', discountAmount: '10', currency: 'AED' });
    f.release = (redemption = f.redemption(), request = f.request) => operation.releaseBudget(request, redemption);
    f.current = () => f.rows.promotion[0];
    return f;
}

test('activated own-enterprise consumes once; exact replay preserves later spend, original receipt and admission', async t => {
    const f = fixture(t), original = structuredClone(f.current()), auth = structuredClone(f.request.authData);
    assert.equal((await f.consume()).budget.spent, '10');
    const first = structuredClone(f.rows.promotionBudgetLedger[0]);
    const other = { ...f.request, idempotencyKey: 'purchaseB', payload: { ...f.request.payload, cartCode: 'cartB' } };
    await f.consume('7', other);
    assert.equal((await f.consume()).budget.spent, '17');
    assert.equal(f.current().revision, 2); assert.equal(f.rows.promotionBudgetLedger.length, 2);
    assert.deepEqual(f.rows.promotionBudgetLedger[0], first);
    assert.deepEqual(f.current().budgetAdmission, original.budgetAdmission);
    assert.deepEqual(f.current().actions, original.actions); assert.deepEqual(f.request.authData, auth);
    assert.equal(first.budgetMutation.command.amount, '10');
    assert.equal(first.budgetMutation.command.policyFingerprint, SERVICE.DefaultPromotionPublicationService.fingerprint(f.policy));
    assert.equal(operation.isBudgetConsumptionWrite(f.state.lastCounterCommand), false);
    assert.throws(() => owner.protectSave(f.state.lastReceiptCommand));
});

test('release has one identity per exact original COMMIT and ignores new reversal keys', async t => {
    const f = fixture(t); await f.consume();
    const original = structuredClone(f.rows.promotionBudgetLedger[0]);
    assert.equal((await f.release()).budget.spent, '0');
    assert.equal((await f.release(f.redemption(), { ...f.request, idempotencyKey: 'differentReversalKey' })).budget.spent, '0');
    assert.equal(f.current().revision, 2); assert.equal(f.rows.promotionBudgetLedger.length, 2);
    assert.deepEqual(f.rows.promotionBudgetLedger[0], original);
    assert.equal(f.rows.promotionBudgetLedger[1].budgetMutation.command.originalCommitCode, original.code);
});

test('concurrent identical consumes and releases each change the counter only once', async t => {
    const f = fixture(t);
    await Promise.all(Array.from({ length: 8 }, () => f.consume()));
    assert.equal(f.current().budget.spent, '10'); assert.equal(f.current().revision, 1);
    await Promise.all(Array.from({ length: 8 }, () => f.release()));
    assert.equal(f.current().budget.spent, '0'); assert.equal(f.current().revision, 2);
    assert.equal(f.rows.promotionBudgetLedger.length, 2);
});

test('competing distinct commands cannot overspend the approved budget', async t => {
    const f = fixture(t);
    const results = await Promise.allSettled(['A', 'B'].map(suffix => f.consume('60', {
        ...f.request, idempotencyKey: 'purchase' + suffix, payload: { ...f.request.payload, cartCode: 'cart' + suffix },
    })));
    assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
    assert.equal(f.current().budget.spent, '60'); assert.equal(f.rows.promotionBudgetLedger.length, 1);
});

test('crashes after receipt insertion or counter CAS roll both records back and retry safely', async t => {
    for (const stage of ['failAfterInsert', 'failAfterCounter', 'zeroMatch']) {
        await t.test(stage, async t => {
            const f = fixture(t); f.state[stage] = true;
            await assert.rejects(f.consume());
            assert.equal(f.current().budget.spent, '0'); assert.equal(f.current().revision, 0);
            assert.equal(f.rows.promotionBudgetLedger.length, 0);
            f.state[stage] = false; await f.consume();
            assert.equal(f.current().budget.spent, '10'); assert.equal(f.rows.promotionBudgetLedger.length, 1);
        });
    }
});

test('lost commit acknowledgements reconcile only exact original COMMIT and RELEASE receipts', async t => {
    const f = fixture(t); f.state.lost = true;
    await f.consume(); assert.equal(f.current().budget.spent, '10');
    f.state.lost = true; await f.release();
    assert.equal(f.current().budget.spent, '0'); assert.equal(f.rows.promotionBudgetLedger.length, 2);
});

test('transaction callback replay performs only generated local writes, never duplicate committed effects', async t => {
    const f = fixture(t), adapter = SERVICE.IsolatedTransactionalAdapter, execute = adapter.executeTransaction;
    let retried = false;
    adapter.executeTransaction = async (database, options, work) => {
        if (!retried) {
            retried = true;
            await work({ rows: structuredClone(f.rows) }); // Simulated transient transaction abort; discard the snapshot.
        }
        return execute(database, options, work);
    };
    await f.consume();
    assert.equal(f.current().revision, 1); assert.equal(f.current().budget.spent, '10');
    assert.equal(f.rows.promotionBudgetLedger.length, 1);
});

test('same-key amount, policy, owner or currency tampering cannot adopt an original receipt', async t => {
    const f = fixture(t); await f.consume();
    for (const [amount, request, policy] of [
        ['11', f.request, f.policy],
        ['10', { ...f.request, ownerId: 'anotherBuyer' }, f.policy],
        ['10', { ...f.request, payload: { ...f.request.payload, currency: 'USD' } }, f.policy],
        ['10', f.request, { ...f.policy, actions: { discountAmount: '999' } }],
    ]) await assert.rejects(f.consume(amount, request, policy));
    assert.equal(f.current().budget.spent, '10'); assert.equal(f.rows.promotionBudgetLedger.length, 1);
});

test('same explicit command key cannot charge a changed target or another campaign', async t => {
    const f = fixture(t); await f.consume();
    await assert.rejects(f.consume('10', { ...f.request, payload: { ...f.request.payload, cartCode: 'cartB' } }));
    const secondPolicy = { ...structuredClone(f.policy), code: 'anotherCampaign' };
    const second = { ...structuredClone(f.current()), code: secondPolicy.code, budget: { limit: '100', spent: '0' }, revision: 0 };
    second.budgetAdmission.command.promotionCode = second.code;
    second.budgetAdmission.command.policyFingerprint = owner.fingerprint(secondPolicy);
    f.rows.promotion.push(second);
    SERVICE.DefaultPromotionPublicationService.readActivated = async () => [f.policy, secondPolicy].map(policy => ({ schema: 'promotion', policy }));
    await assert.rejects(f.consume('10', f.request, secondPolicy));
    assert.equal(f.current().budget.spent, '10'); assert.equal(second.budget.spent, '0');
    assert.equal(f.rows.promotionBudgetLedger.length, 1);
});

test('email-shaped buyer and principal IDs work for explicit and long natural keys without changing redemption identity', async t => {
    const f = fixture(t), email = 'buyer@example.test';
    f.request.ownerId = email; f.request.authData.loginId = 'operator@example.test';
    await f.consume();
    let command = f.rows.promotionBudgetLedger[0].budgetMutation.command;
    assert.equal(command.ownerId, email);
    await f.release({ ...command, code: command.redemptionCode, discountAmount: command.amount });
    const longEmail = 'b'.repeat(170) + '@example.test';
    const natural = { ...f.request, ownerId: longEmail, idempotencyKey: undefined, payload: { currency: 'AED' } };
    await f.consume('4', natural);
    command = f.rows.promotionBudgetLedger[2].budgetMutation.command;
    const key = operation.idempotencyKey(natural, f.policy, longEmail);
    assert.ok(key.length > 256); assert.equal(command.idempotencyKey, key); assert.equal(command.targetCode, longEmail);
    assert.equal(command.redemptionCode, operation.redemptionCode(natural, f.policy, longEmail));
    await f.release({ ...command, code: command.redemptionCode, discountAmount: command.amount }, natural);
    assert.equal(f.current().budget.spent, '0');
});

test('Express methods/cycles are not cloned and original auth/payload mutation across awaits cannot change authority', async t => {
    const f = fixture(t), httpRequest = { on() {}, socket: {} };
    httpRequest.self = httpRequest; f.request.httpRequest = httpRequest;
    const originalKey = f.request.idempotencyKey, inspect = SERVICE.DefaultDatabaseModelHandlerService.inspectIndexes;
    SERVICE.DefaultDatabaseModelHandlerService.inspectIndexes = async model => {
        f.request.authData.enterpriseCode = 'foreign'; f.request.payload.cartCode = 'foreignCart';
        f.request.payload.idempotencyKey = 'foreignKey'; f.request.idempotencyKey = 'foreignKey';
        return inspect(model);
    };
    await f.consume();
    const command = f.rows.promotionBudgetLedger[0].budgetMutation.command;
    assert.equal(command.enterpriseCode, 'issuerA'); assert.equal(command.targetCode, 'cartA');
    assert.equal(command.idempotencyKey, originalKey); assert.equal(f.current().budget.spent, '10');
});

test('release requires the exact original amount, redemption, buyer, currency, target and scope', async t => {
    const f = fixture(t); await f.consume();
    for (const patch of [{ discountAmount: '9' }, { code: 'anotherRedemption' }, { ownerId: 'anotherBuyer' },
        { currency: 'USD' }, { targetCode: 'anotherCart' }, { idempotencyKey: 'missing' }, { enterpriseCode: 'foreign' }, { tenant: 'foreign' }])
        await assert.rejects(f.release({ ...f.redemption(), ...patch }));
    assert.equal(f.current().budget.spent, '10'); assert.equal(f.rows.promotionBudgetLedger.length, 1);
});

test('corrupt retained receipt or changed original admission never authorizes replay or release', async t => {
    const f = fixture(t); await f.consume();
    const receipt = f.rows.promotionBudgetLedger[0], original = structuredClone(receipt);
    receipt.budgetMutation.command.amount = '9';
    await assert.rejects(f.consume()); await assert.rejects(f.release());
    Object.assign(receipt, original);
    f.current().budgetAdmission.command.commandReference = 'replacedOpening';
    await assert.rejects(f.consume()); await assert.rejects(f.release());
    assert.equal(f.current().budget.spent, '10'); assert.equal(f.current().revision, 1);
});

test('activated counters require exact original admission provenance, Store/root and pure policy pin before any write', async t => {
    const modifiers = {
        missing: f => { delete f.current().budgetAdmission; },
        actor: f => { f.current().budgetAdmission.command.actorId = ''; },
        contribution: f => { delete f.current().budgetAdmission.command.contribution; },
        checksum: f => { f.current().budgetAdmission.command.contribution.checksum = 'bad'; },
        extraProvenance: f => { f.current().budgetAdmission.command.contribution.extra = 'untrusted'; },
        command: f => { f.current().budgetAdmission.command.commandReference = ''; },
        root: f => { f.current().budgetAdmission.command.rootCode = 'otherRoot'; },
        store: f => { f.current().budgetAdmission.command.storeCode = 'otherStore'; },
        policy: f => { f.current().budgetAdmission.command.policyFingerprint = 'b'.repeat(64); },
        issuer: f => { f.current().budgetAdmission.command.enterpriseCode = 'foreign'; },
        promotion: f => { f.current().budgetAdmission.command.promotionCode = 'foreign'; },
        time: f => { f.current().budgetAdmission.admittedAt = 'invalid'; },
    };
    for (const [name, modify] of Object.entries(modifiers)) await t.test(name, async t => {
        const f = fixture(t); modify(f); await assert.rejects(f.consume());
        assert.equal(f.state.inserts || 0, 0); assert.equal(f.state.counterWrites || 0, 0);
        assert.equal(f.current().budget.spent, '0');
    });
});

test('foreign, conflicting and unsigned enterprise contexts refuse before any persistence', async t => {
    const f = fixture(t);
    for (const request of [{ ...f.request, enterpriseCode: 'foreign' },
        { ...f.request, authData: { ...f.request.authData, entCode: 'foreign' } },
        { ...f.request, authData: { ...f.request.authData, tenant: 'foreign' } },
        { ...f.request, authData: {} }]) await assert.rejects(f.consume('10', request));
    await assert.rejects(f.consume('10', f.request, { ...f.policy, enterpriseCode: 'foreign' }),
        error => error.code === 'ERR_PROMOTION_SELLER_UNCONFIRMED');
    assert.equal(f.state.inserts || 0, 0); assert.equal(f.state.counterWrites || 0, 0);
});

test('selected atomic budget owner requires explicit COMMERCE role before persistence', async t => {
    const f = fixture(t); let inspections = 0;
    const inspect = SERVICE.DefaultDatabaseModelHandlerService.inspectIndexes;
    SERVICE.DefaultDatabaseModelHandlerService.inspectIndexes = async model => { inspections++; return inspect(model); };
    for (const role of [undefined, 'STAGED', 'PROFILE', {}, { code: 'ONLINE' }]) {
        f.settings.runtimeRole = role;
        await assert.rejects(f.consume()); await assert.rejects(f.release());
    }
    assert.equal(inspections, 0); assert.equal(f.rows.promotionBudgetLedger.length, 0);
    f.settings.runtimeRole = { code: 'COMMERCE' };
    await f.consume(); assert.equal(f.current().budget.spent, '10');
});

test('missing topology, transaction owner, services, indexes, hooks or schema participation fail closed', async t => {
    const cases = {
        topology: f => { f.state.atomic = false; },
        transactionOwner: () => { delete SERVICE.DefaultDatabaseTransactionService; },
        budgetOwner: () => { delete SERVICE.DefaultPromotionBudgetMutationService; },
        ledgerService: () => { delete SERVICE.DefaultPromotionBudgetLedgerService; },
        counterService: () => { delete SERVICE.DefaultPromotionService.update; },
        indexes: f => { f.state.indexes = [{ unique: true, key: { code: 1 }, sparse: true }]; },
        hooks: () => { SERVICE.DefaultDatabaseConfigurationService.getSchemaInterceptors = () => ({}); },
        ledgerTransaction: f => { f.models.promotionBudgetLedger.rawSchema.transaction.enabled = false; },
        promotionTransaction: f => { f.models.promotion.rawSchema.transaction.enabled = false; },
        versioned: f => { f.models.promotion.versioned = true; },
        privacy: f => { f.settings.log.requestPrivacy.qualified = false; },
        failedRead: f => { f.state.failedRead = true; },
    };
    for (const [name, modify] of Object.entries(cases)) await t.test(name, async t => {
        const f = fixture(t); modify(f); await assert.rejects(f.consume());
        assert.equal(f.current().budget.spent, '0'); assert.equal(f.rows.promotionBudgetLedger.length, 0);
    });
});

test('generated save hooks reject forged, copied and expired receipt admissions; partial updates and deletes stay fenced', async t => {
    const f = fixture(t); await f.consume();
    const original = structuredClone(f.rows.promotionBudgetLedger[0]);
    await assert.rejects(SERVICE.DefaultPromotionBudgetLedgerService.save({ tenant: 'tenantA', authData: f.request.authData,
        model: original, options: { insertOnly: true } }));
    const copied = { ...f.state.lastReceiptCommand, model: structuredClone(original) };
    assert.throws(() => owner.protectSave(copied));
    for (const model of [{ budgetMutation: {} }, { $set: { 'budgetMutation.command': {} } },
        { $unset: { budgetMutation: 1 } }, { $rename: { amount: 'budgetMutation' } }, { code: original.code }])
        assert.throws(() => owner.protect({ query: { code: original.code }, model }));
    const updateCommand = { tenant: 'tenantA', authData: f.request.authData, query: { code: original.code }, model: { amount: '99' } };
    const response = await SERVICE.DefaultPromotionBudgetLedgerService.update(updateCommand);
    assert.equal(response.result.modifiedCount, 0);
    const remove = { query: { code: original.code } }; owner.protectRemove(remove);
    assert.equal(f.matches(original, remove.query), false);
    const removed = await SERVICE.DefaultPromotionBudgetLedgerService.remove({ tenant: 'tenantA', authData: f.request.authData,
        query: { code: original.code } });
    assert.equal(removed.result.deletedCount, 0);
    const upsert = { model: { code: original.code, amount: '99' } };
    assert.throws(() => owner.protectSave(upsert));
    assert.deepEqual(f.rows.promotionBudgetLedger[0], original);
});

test('in-flight ledger/counter envelope mutation refuses and rolls back, rather than broadening private identity', async t => {
    for (const name of ['tamperInsert', 'tamperCounter']) await t.test(name, async t => {
        const f = fixture(t); f.state[name] = true; await assert.rejects(f.consume());
        assert.equal(f.current().budget.spent, '0'); assert.equal(f.rows.promotionBudgetLedger.length, 0);
    });
});

test('generic reads suppress original command details and reject private filtering', async t => {
    const f = fixture(t); await f.consume();
    const result = await SERVICE.DefaultPromotionBudgetLedgerService.get({ tenant: 'tenantA', authData: f.request.authData,
        query: { code: f.rows.promotionBudgetLedger[0].code } });
    assert.equal(result.result[0].budgetMutation, undefined);
    await assert.rejects(SERVICE.DefaultPromotionBudgetLedgerService.get({ tenant: 'tenantA',
        query: { 'budgetMutation.command.ownerId': 'buyerA' } }));
});

test('private read envelopes reject copied requests, selector/auth/options mutation and contradictory count', async t => {
    const modifiers = {
        selector: command => { command.query.code = 'anotherCode'; },
        auth: command => { command.authData.enterpriseCode = 'foreign'; },
        options: command => { command.options.skipItemCache = false; },
        page: command => { command.searchOptions.limit = 1; },
        context: command => { command.transactionContext = {}; },
    };
    for (const [name, modify] of Object.entries(modifiers)) await t.test(name, async t => {
        const f = fixture(t), service = SERVICE.DefaultPromotionBudgetLedgerService, original = service.get;
        service.get = async command => { modify(command); return original(command); };
        await assert.rejects(f.consume()); assert.equal(f.current().budget.spent, '0');
    });
    await t.test('copied envelope', async t => {
        const f = fixture(t), service = SERVICE.DefaultPromotionBudgetLedgerService, original = service.get;
        service.get = command => original({ ...command });
        await assert.rejects(f.consume()); assert.equal(f.rows.promotionBudgetLedger.length, 0);
    });
    await t.test('post-provider selector mutation', async t => {
        const f = fixture(t), service = SERVICE.DefaultPromotionBudgetLedgerService, original = service.get;
        service.get = async command => { const response = await original(command); command.query.code = 'changedAfterRead'; return response; };
        await assert.rejects(f.consume()); assert.equal(f.rows.promotionBudgetLedger.length, 0);
    });
    await t.test('count mismatch', async t => {
        const f = fixture(t), service = SERVICE.DefaultPromotionBudgetLedgerService, original = service.get;
        service.get = async command => { const response = await original(command); return { ...response, count: response.result.length + 1 }; };
        await assert.rejects(f.consume()); assert.equal(f.rows.promotionBudgetLedger.length, 0);
    });
});

test('canonical generated read option normalization and attached metadata preserve exact private admission', async t => {
    const f = fixture(t), service = SERVICE.DefaultPromotionBudgetLedgerService, original = service.get;
    service.get = async command => {
        command.schemaModel = f.models.promotionBudgetLedger; command.moduleName = 'promotion'; command.schemaName = 'promotionBudgetLedger';
        await new Promise((resolve, reject) => ({ ...get, LOG: { debug() {} } }).buildOptions(command, {}, {
            nextSuccess: resolve, error: (r, response, error) => reject(error),
        }));
        return original(command);
    };
    await f.consume(); await f.release();
    assert.equal(f.current().budget.spent, '0'); assert.equal(f.rows.promotionBudgetLedger.length, 2);
});

test('read, append and counter negative acknowledgements cannot commit or imply success', async t => {
    for (const port of ['read', 'append', 'counter']) await t.test(port, async t => {
        const f = fixture(t);
        const service = port === 'counter' ? SERVICE.DefaultPromotionService : SERVICE.DefaultPromotionBudgetLedgerService;
        const member = port === 'read' ? 'get' : port === 'append' ? 'save' : 'update', original = service[member];
        service[member] = async command => {
            const response = await original(command);
            return port === 'counter' ? { ...response, result: { ...response.result, acknowledged: false } }
                : { ...response, acknowledged: false };
        };
        await assert.rejects(f.consume());
        assert.equal(f.current().budget.spent, '0'); assert.equal(f.rows.promotionBudgetLedger.length, 0);
    });
});

test('a retained no-budget policy has no budget compensation; missing original budget COMMIT never does', async t => {
    const f = fixture(t);
    await assert.rejects(f.release());
    delete f.policy.budget; delete f.current().budget; delete f.current().budgetAdmission;
    assert.equal(await f.release(), undefined);
    assert.equal(f.rows.promotionBudgetLedger.length, 0);
});

test('negative/malformed amounts and revision overflow never create receipts', async t => {
    const f = fixture(t);
    for (const amount of ['-1', 'NaN', 'Infinity', '1e3', 10, '']) await assert.rejects(f.consume(amount));
    f.current().revision = Number.MAX_SAFE_INTEGER;
    await assert.rejects(f.consume()); assert.equal(f.rows.promotionBudgetLedger.length, 0);
});

test('unselected legacy mutation keeps its existing path and cannot touch retained receipt identities', async t => {
    const f = fixture(t); f.settings.promotion.publication.delivery.enabled = false;
    SERVICE.DefaultPromotionBudgetMutationService.consume = async () => { throw new Error('unselected owner must not consume'); };
    const current = f.current(); delete current.budgetAdmission;
    await operation.consumeBudget(f.request, current, '3');
    assert.equal(f.current().budget.spent, '3');
    assert.equal(f.rows.promotionBudgetLedger[0].budgetMutation, undefined);
    await operation.releaseBudget(f.request, { ...f.redemption(), discountAmount: '3' });
    assert.equal(f.current().budget.spent, '0');
});

test('disabled or unselected delivery cannot downgrade an admitted counter into legacy consumption or reversal', async t => {
    for (const selection of ['disabled', 'otherStore']) await t.test(selection, async t => {
        const f = fixture(t); await f.consume();
        const original = structuredClone(f.rows);
        if (selection === 'disabled') f.settings.promotion.publication.delivery.enabled = false;
        else f.request.storeCode = 'unselectedStore';
        await assert.rejects(operation.consumeBudget(f.request, f.current(), '10'),
            error => error.code === 'ERR_PROMOTION_BUDGET_ADMISSION_UNCONFIRMED');
        await assert.rejects(f.release(), error => error.code === 'ERR_PROMOTION_BUDGET_ADMISSION_UNCONFIRMED');
        assert.deepEqual(f.rows, original);
    });
});

test('legacy consumption and reversal cannot race a new admitted counter or append false ledger evidence', async t => {
    for (const selection of ['disabled', 'otherStore']) for (const action of ['consume', 'release'])
        await t.test(selection + ':' + action, async t => {
            const f = fixture(t), original = structuredClone(f.current());
            delete f.current().budgetAdmission;
            f.current().budget.spent = '10';
            if (selection === 'disabled') f.settings.promotion.publication.delivery.enabled = false;
            else f.request.storeCode = 'unselectedStore';
            const legacy = structuredClone(f.current()), update = SERVICE.DefaultPromotionService.update;
            SERVICE.DefaultPromotionService.update = async command => {
                assert.equal(operation.isBudgetConsumptionWrite(command), false);
                assert.deepEqual(command.query.budgetAdmission, { $exists: false });
                Object.assign(f.current(), original, { budget: { limit: '100', spent: '20' }, revision: 3 });
                return update(command);
            };
            await assert.rejects(action === 'consume' ? operation.consumeBudget(f.request, legacy, '3') : f.release(),
                error => error.code === 'ERR_PROMOTION_BUDGET_ADMISSION_UNCONFIRMED');
            assert.equal(f.current().budget.spent, '20');
            assert.equal(f.current().revision, 3);
            assert.deepEqual(f.current().budgetAdmission, original.budgetAdmission);
            assert.equal(f.rows.promotionBudgetLedger.length, 0);
            assert.equal(f.state.counterWrites || 0, 0);
        });
});

test('legacy accounting requires a positive single-row update and never substitutes save or appends on refusal', async t => {
    for (const action of ['consume', 'release']) for (const result of [
        undefined, { acknowledged: false, matchedCount: 1, modifiedCount: 1 },
        { acknowledged: true, matchedCount: 0, modifiedCount: 0 },
        { acknowledged: true, matchedCount: 2, modifiedCount: 2 },
        { acknowledged: true, matchedCount: 1, modifiedCount: 0 },
    ]) await t.test(action + ':' + JSON.stringify(result), async t => {
        const f = fixture(t); delete f.current().budgetAdmission;
        f.current().budget.spent = '10'; f.settings.promotion.publication.delivery.enabled = false;
        const original = structuredClone(f.rows);
        SERVICE.DefaultPromotionService.update = async () => ({ code: 'SUC_TEST', result });
        SERVICE.DefaultPromotionService.save = async () => assert.fail('legacy accounting must never upsert');
        await assert.rejects(action === 'consume' ? operation.consumeBudget(f.request, f.current(), '3') : f.release());
        assert.deepEqual(f.rows, original);
        delete SERVICE.DefaultPromotionService.update;
        await assert.rejects(action === 'consume' ? operation.consumeBudget(f.request, f.current(), '3') : f.release());
        assert.deepEqual(f.rows, original);
    });
});

test('later-layer owner narrowing is used by both Operation entry points without fallback', async t => {
    const f = fixture(t); let consumption = 0, release = 0;
    SERVICE.DefaultPromotionBudgetMutationService = { ...owner,
        consume: async () => { consumption++; throw new Error('narrowed consume'); },
        release: async () => { release++; throw new Error('narrowed release'); } };
    await assert.rejects(f.consume(), /narrowed consume/); await assert.rejects(f.release(), /narrowed release/);
    assert.equal(consumption, 1); assert.equal(release, 1); assert.equal(f.current().budget.spent, '0');
});
