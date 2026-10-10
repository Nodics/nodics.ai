/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/** @module inventory/test/inventoryOpeningReceipt @description Independent transactional generated-service ports prove opening intake admission, rollback and replay, not installed provider qualification. @layer test @owner inventory */
const assert = require('node:assert/strict');
const { test } = require('node:test');
const owner = require('../src/service/defaultInventoryOpeningReceiptService');
const contribution = require('../src/service/defaultInventoryOpeningContributionService');
const schemas = require('../src/schemas/schemas').inventory;

/** Provides isolated generated persistence ports with rollback, uniqueness and response-loss injection. */
function fixture(t) {
    const previous = { CONFIG: global.CONFIG, SERVICE: global.SERVICE, CLASSES: global.CLASSES, NODICS: global.NODICS, UTILS: global.UTILS };
    t.after(() => Object.assign(global, previous));
    const state = { tables: { balance: [], movement: [], receipt: [] }, writes: 0, transactions: 0, capable: true, fail: '', lost: false, role: 'COMMERCE', publicationRole: 'ONLINE',
        transactionPolicy: { enabled: true, failClosed: true, maximumCommitTimeMs: 5000 } };
    global.CLASSES = { NodicsError: class extends Error { constructor(code) { super(code); this.code = code; } } };
    global.CONFIG = { get: key => key === 'runtimeRole' ? { code: state.role } : key === 'inventory' ? { publication: { runtimeRole: state.publicationRole } } : key === 'databaseTransactions' ? state.transactionPolicy : {} };
    global.UTILS = { createModelName: name => name };
    global.NODICS = { getModels: () => Object.fromEntries(['inventoryBalance', 'inventoryMovement', 'inventoryOpeningReceiptRecord'].map(name =>
        [name, { name, versioned: false, rawSchema: schemas[name], compareAndSetItem() {} }])) };
    const request = { tenant: 'partner-tenant', authData: { tenant: 'partner-tenant', enterpriseCode: 'partner-enterprise',
        principalId: 'partner-operator', principalType: 'human', tokenType: 'access', permissions: ['commerce.inventory.operate'] } };
    const input = { code: 'opening-dress-small', storeCode: 'partner-store', locale: 'en', warehouseCode: 'partner-warehouse',
        productCode: 'partner-dress', variantCode: 'partner-dress-small', sku: 'PARTNER-DRESS-S', quantity: '40', referenceCode: 'PARTNER-OPENING-001' };
    const source = { releaseCode: 'partner.apparel:stock', version: '0.0.1', checksum: 'a'.repeat(64) };
    const port = table => ({
        get: async req => {
            assert.deepEqual(req.authData, request.authData);
            assert.equal(req.tenant, request.tenant);
            return { result: structuredClone((req.transactionContext?.tables || state.tables)[table].filter(row => Object.entries(req.query).every(([key, value]) => row[key] === value))) };
        },
        save: async req => {
            assert.equal(req.options.insertOnly, true);
            assert(req.transactionContext, 'No partial nontransactional writes');
            assert.deepEqual(req.authData, request.authData, 'Original authority retained');
            if (state.fail === table) throw new Error('synthetic save rejected');
            const rows = req.transactionContext.tables[table];
            if (rows.some(row => row.code === req.model.code || table === 'balance' && ['tenant', 'enterpriseCode', 'warehouseCode', 'sku'].every(key => row[key] === req.model[key]))) throw new Error('synthetic unique conflict');
            rows.push(structuredClone(req.model)); state.writes++;
            return { result: structuredClone(req.model) };
        }
    });
    let tail = Promise.resolve();
    global.SERVICE = {
        DefaultSecuredRequestPipelineService: {
            getGrantedPermissions: req => req.authData.permissions || [],
            isPermissionGranted: (permission, granted) => granted.includes(permission)
        },
        DefaultInventoryOpeningReceiptService: owner,
        DefaultInventoryOpeningContributionService: contribution,
        DefaultDatabaseModelHandlerService: { inspectIndexes: async model => ({ versioned: false, indexes: [
            { key: { code: 1 }, unique: true }, ...(model.name === 'inventoryBalance' ? [{ key: { tenant: 1, enterpriseCode: 1, warehouseCode: 1, sku: 1 }, unique: true }] : [])
        ] }) },
        DefaultModelConcurrencyService: { getField: () => undefined },
        DefaultInventoryBalanceService: port('balance'), DefaultInventoryMovementService: port('movement'), DefaultInventoryOpeningReceiptRecordService: port('receipt'),
        DefaultProductDiscoveryService: { activeSelection: async () => ['b'.repeat(64)], resolveVariantSku: async () => input.sku },
        DefaultInventoryPublicationService: { readConfigured: async () => [{ schema: 'warehouse', policy: { code: input.warehouseCode, status: 'ACTIVE', tenant: request.tenant, enterpriseCode: request.authData.enterpriseCode } }] },
        DefaultDatabaseTransactionService: {
            capabilities: () => ({ multiRecordAtomic: state.capable }),
            execute: async (scope, work) => {
                assert.deepEqual(scope, { moduleName: 'inventory', tenant: request.tenant });
                assert(state.capable);
                const previous = tail; let release; tail = new Promise(resolve => { release = resolve; }); await previous;
                state.transactions++;
                try {
                    const context = { tables: structuredClone(state.tables) };
                    await work(context); state.tables = context.tables;
                    if (state.lost) { state.lost = false; throw new Error('synthetic commit acknowledgement lost'); }
                } finally { release(); }
            }
        }
    };
    return { state, request, input, source };
}

test('first intake commits balance, movement and original operator evidence once; repeat does not replenish consumed stock', async t => {
    const f = fixture(t);
    assert.equal((await owner.inspect(f.request, f.input, f.source)).action, 'RECEIVE_FIRST');
    assert.equal(f.state.writes, 0);
    const first = await owner.receive(f.request, f.input, f.source);
    assert.equal(first.replayed, false); assert.equal(f.state.writes, 3);
    assert.equal(f.state.tables.balance[0].available, '40');
    assert.equal(f.state.tables.movement[0].movementType, 'RECEIPT');
    assert.equal(f.state.tables.receipt[0].actorId, 'partner-operator');
    f.state.tables.balance[0].available = '37'; f.state.tables.balance[0].onHand = '37'; f.state.tables.balance[0].revision = 4;
    const repeat = await owner.receive(f.request, f.input, f.source);
    assert.equal(repeat.replayed, true); assert.equal(f.state.writes, 3); assert.equal(f.state.transactions, 1);
    assert.equal(f.state.tables.balance[0].available, '37');
});

test('transaction rollback never leaves partial sellable stock; committed acknowledgement loss recovers by original read', async t => {
    const f = fixture(t);
    f.state.fail = 'movement';
    await assert.rejects(owner.receive(f.request, f.input, f.source), /synthetic save/);
    assert.deepEqual(f.state.tables, { balance: [], movement: [], receipt: [] });
    f.state.fail = ''; f.state.lost = true;
    assert.equal((await owner.receive(f.request, f.input, f.source)).replayed, true);
    assert.equal(f.state.tables.balance.length, 1); assert.equal(f.state.tables.movement.length, 1); assert.equal(f.state.tables.receipt.length, 1);
});

test('concurrent same intake commits once; changed intake/source or preexisting stock conflicts rather than replacing it', async t => {
    const f = fixture(t);
    const results = await Promise.all([owner.receive(f.request, f.input, f.source), owner.receive(f.request, f.input, f.source)]);
    assert.equal(results.filter(row => !row.replayed).length, 1); assert.equal(f.state.writes, 3);
    for (const [input, source] of [[{ ...f.input, quantity: '41' }, f.source], [f.input, { ...f.source, checksum: 'b'.repeat(64) }], [{ ...f.input, code: 'other-intake' }, f.source]])
        await assert.rejects(owner.receive(f.request, input, source), { code: 'ERR_INVENTORY_OPENING_CONFLICT' });
    assert.equal(f.state.writes, 3);
});

test('Staged, unknown runtime, missing human permission and tenant/enterprise mismatches never write', async t => {
    const f = fixture(t);
    for (const role of ['COMMERCE_STAGED', 'PLATFORM', '']) {
        f.state.role = role;
        await assert.rejects(owner.receive(f.request, f.input, f.source), { code: 'ERR_INVENTORY_OPENING_UNAVAILABLE' });
    }
    f.state.role = 'COMMERCE';
    for (const auth of [{ ...f.request.authData, permissions: [] }, { ...f.request.authData, tenant: 'other' }, { ...f.request.authData, entCode: 'other' }, { ...f.request.authData, principalType: 'customer' }, { ...f.request.authData, tokenType: 'service' }])
        await assert.rejects(owner.receive({ ...f.request, authData: auth }, f.input, f.source), { code: 'ERR_AUTH_00003' });
    SERVICE.DefaultInventoryPublicationService.readConfigured = async () => [{ schema: 'warehouse', policy: { code: f.input.warehouseCode, status: 'ACTIVE', tenant: f.request.tenant, enterpriseCode: 'other' } }];
    await assert.rejects(owner.receive(f.request, f.input, f.source), { code: 'ERR_INVENTORY_OPENING_POLICY' });
    assert.equal(f.state.writes, 0);
});

test('installed persistence indexes are required and partial or nonunique identities never qualify', async t => {
    const f = fixture(t), inspect = SERVICE.DefaultDatabaseModelHandlerService.inspectIndexes;
    for (const change of [indexes => [], indexes => indexes.map(index => ({ ...index, unique: false })),
        indexes => indexes.map(index => ({ ...index, partialFilterExpression: { active: true } })),
        indexes => indexes.map(index => ({ ...index, sparse: true })),
        indexes => indexes.map(index => ({ ...index, collation: { locale: 'en' } }))]) {
        SERVICE.DefaultDatabaseModelHandlerService.inspectIndexes = async model => ({ ...(await inspect(model)), indexes: change((await inspect(model)).indexes) });
        await assert.rejects(owner.receive(f.request, f.input, f.source), { code: 'ERR_INVENTORY_OPENING_UNAVAILABLE' });
    }
    assert.equal(f.state.writes, 0);
});

test('deployment transaction policy must permit the same execution admitted by read-only preflight', async t => {
    const f = fixture(t);
    for (const policy of [{}, { enabled: false, failClosed: true, maximumCommitTimeMs: 5000 },
        { enabled: true, failClosed: false, maximumCommitTimeMs: 5000 },
        ...[0, -1, 1.5, '5000', NaN].map(maximumCommitTimeMs => ({ enabled: true, failClosed: true, maximumCommitTimeMs }))]) {
        f.state.transactionPolicy = policy;
        await assert.rejects(owner.inspect(f.request, f.input, f.source), { code: 'ERR_INVENTORY_OPENING_UNAVAILABLE' });
    }
    assert.equal(f.state.writes, 0); assert.equal(f.state.transactions, 0);
});

test('caller mutations during awaited policy validation cannot change admitted intake', async t => {
    const f = fixture(t), originalRequest = structuredClone(f.request), originalInput = structuredClone(f.input);
    const active = SERVICE.DefaultProductDiscoveryService.activeSelection;
    SERVICE.DefaultProductDiscoveryService.activeSelection = async req => {
        f.input.quantity = '900'; f.source.checksum = 'c'.repeat(64);
        f.request.authData.permissions = []; f.request.authData.enterpriseCode = 'other';
        return active(req);
    };
    SERVICE.DefaultInventoryPublicationService.readConfigured = async () => [{ schema: 'warehouse', policy: {
        code: originalInput.warehouseCode, status: 'ACTIVE', tenant: originalRequest.tenant, enterpriseCode: originalRequest.authData.enterpriseCode
    } }];
    // The generated-port fixture also verifies the detached original authority.
    for (const [name, table] of [['DefaultInventoryBalanceService', 'balance'], ['DefaultInventoryMovementService', 'movement'], ['DefaultInventoryOpeningReceiptRecordService', 'receipt']])
        SERVICE[name].get = async req => {
            assert.deepEqual(req.authData, originalRequest.authData);
            return { result: f.state.tables[table].filter(row => Object.entries(req.query).every(([key, value]) => row[key] === value)) };
        };
    const plan = await owner.inspect(f.request, f.input, f.source);
    assert.equal(plan.action, 'RECEIVE_FIRST'); assert.equal(f.state.writes, 0);
});

test('absent atomic provider, failed read, mutable Product fallback and corrupt replay evidence fail closed', async t => {
    const f = fixture(t); f.state.capable = false;
    await assert.rejects(owner.receive(f.request, f.input, f.source), { code: 'ERR_INVENTORY_OPENING_UNAVAILABLE' });
    f.state.capable = true;
    const get = SERVICE.DefaultInventoryBalanceService.get;
    SERVICE.DefaultInventoryBalanceService.get = async () => ({ result: [] , success: false });
    await assert.rejects(owner.receive(f.request, f.input, f.source), { code: 'ERR_INVENTORY_OPENING_UNAVAILABLE' });
    SERVICE.DefaultInventoryBalanceService.get = get;
    const active = SERVICE.DefaultProductDiscoveryService.activeSelection;
    SERVICE.DefaultProductDiscoveryService.activeSelection = async () => undefined;
    await assert.rejects(owner.receive(f.request, f.input, f.source), { code: 'ERR_INVENTORY_OPENING_POLICY' });
    SERVICE.DefaultProductDiscoveryService.activeSelection = active;
    await owner.receive(f.request, f.input, f.source);
    f.state.tables.movement[0].quantity = '41';
    await assert.rejects(owner.receive(f.request, f.input, f.source), { code: 'ERR_INVENTORY_OPENING_CONFLICT' });
    assert.equal(f.state.writes, 3);
});

test('strict intake rejects snapshots, zero/fractional/excessive units; later-layer policy override is honored', async t => {
    const f = fixture(t);
    for (const input of [{ ...f.input, available: '40' }, { ...f.input, quantity: '0' }, { ...f.input, quantity: '0.5' }, { ...f.input, quantity: '1000000000' }])
        await assert.rejects(owner.receive(f.request, input, f.source), { code: 'ERR_INVENTORY_OPENING_INVALID' });
    const overridden = { ...owner, policy: async function () { this.fail('ERR_INVENTORY_OPENING_POLICY'); } };
    await assert.rejects(overridden.receive(f.request, f.input, f.source), { code: 'ERR_INVENTORY_OPENING_POLICY' });
    assert.equal(f.state.writes, 0);
    for (const name of ['inventoryBalance', 'inventoryMovement', 'inventoryOpeningReceiptRecord']) {
        assert.deepEqual(schemas[name].transaction, { enabled: true, sideEffects: 'none' });
        assert.equal(schemas[name].cache.enabled, false); assert.equal(schemas[name].event.enabled, false);
    }
    assert.equal(schemas.inventoryOpeningReceiptRecord.router.enabled, false);
    assert.equal(schemas.inventoryOpeningReceiptRecord.backoffice.enabled, false);
});

test('nImport contribution preflight is read-only and complete pack validation precedes receipts', async t => {
    const f = fixture(t);
    const descriptor = { ...f.source, installer: 'INVENTORY_OPENING_RECEIPTS', destinationRole: 'COMMERCE', lifecycle: 'OPERATIONAL_VERSIONED', selectionPolicy: 'EXPLICIT', dataType: 'sample' };
    let payload = { contractVersion: 1, receipts: [f.input] };
    SERVICE.DefaultDataReleaseService = { readContributionPayload: (release, installer, name) => {
        assert.deepEqual(release, descriptor); assert.equal(installer, 'INVENTORY_OPENING_RECEIPTS'); assert.equal(name, 'inventoryOpening.json'); return structuredClone(payload);
    } };
    const request = { ...f.request, contribution: descriptor };
    assert.equal((await contribution.preflightContribution(request)).ready, true); assert.equal(f.state.writes, 0);
    f.state.capable = false;
    assert.equal((await contribution.preflightContribution(request)).blocker.code, 'ERR_INVENTORY_OPENING_UNAVAILABLE'); assert.equal(f.state.writes, 0);
    f.state.capable = true;
    payload.receipts.push({ ...f.input, code: 'second', sku: 'OTHER-SKU', quantity: '0' });
    await assert.rejects(contribution.installContribution(request), { code: 'ERR_INVENTORY_OPENING_INVALID' }); assert.equal(f.state.writes, 0);
    payload.receipts.pop();
    assert.equal((await contribution.installContribution(request)).data.receipts.length, 1);
});
