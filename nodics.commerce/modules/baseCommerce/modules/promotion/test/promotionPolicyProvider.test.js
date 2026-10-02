/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module promotion/test/promotionPolicyProvider @description Exercises real owner provider orchestration against managed-CAS persistence doubles, not installed database qualification. @layer test @owner promotion */
'use strict';
const test = require('node:test');

test('delivery Store opt-in preserves unrelated consumers and rejects direct unselected root reads', async () => {
    const f = setup();
    f.target.publicationSettings = () => ({ runtimeRole: 'ONLINE',
        delivery: { enabled: true, storeCodes: ['qualification-store'], rootCodes: ['qualified-root'] } });
    assert.equal(f.target.deliveryEnabled({ ...request, storeCode: 'qualification-store' }), true);
    assert.equal(f.target.deliveryEnabled({ ...request, storeCode: 'real-store' }), false);
    assert.equal(f.target.deliveryEnabled(request), false);
    assert.deepEqual(f.target.deliveryRoots({ ...request, storeCode: 'qualification-store' }), ['qualified-root']);
    await assert.rejects(f.target.readConfigured({ ...request, storeCode: 'real-store' }), /delivery roots/);
    for (const storeCodes of [[], ['duplicate', 'duplicate'], '*', [null]]) {
        f.target.publicationSettings = () => ({ delivery: { enabled: true, storeCodes } });
        assert.throws(() => f.target.deliveryEnabled(request), /Store selection/);
    }
});

test('source grants legacy recovery only for the selected pinned first activation', async () => {
    const f = setup(), publication = await f.publication();
    publication.tenantCode = request.tenant; publication.enterpriseCode = request.enterpriseCode;
    const command = { operation: 'activate', publicationCode: publication.code, sourceVersion: publication.sourceVersion,
        rootType: publication.rootType, rootCode: publication.rootCode, operationKey: publication.activationOperation.key,
        targetVersion: publication.sourceVersion, expectedVersion: null, expectedRevision: 0 };
    const selection = { tenant: request.tenant, enterpriseCode: request.enterpriseCode,
        publicationCode: publication.code, sourceVersion: publication.sourceVersion, rootType: publication.rootType,
        rootCode: publication.rootCode, operationKey: command.operationKey,
        reason: 'Reviewed defect', approvedBy: 'operator', approvalReference: 'review-001' };
    global.SERVICE.DefaultServiceTokenService = { requireRuntimePrincipal: () => ({ entCode: request.enterpriseCode, tenant: request.tenant }) };
    global.SERVICE.DefaultIdentityGovernanceService = { getSystemAuthData: () => ({ isSystem: true }) };
    global.SERVICE.DefaultPublicationLifecycleService = { getRepository: () => ({ get: async () => publication }) };
    assert.equal((await f.source.authorizeTarget(command, request)).legacyCasRecovery, undefined);
    f.source.publicationSettings = () => ({ runtimeRole: 'STAGED', sourceVersioningQualified: true,
        legacyCasRecovery: { enabled: true, operations: [selection] } });
    assert.deepEqual((await f.source.authorizeTarget(command, request)).legacyCasRecovery, selection);
    for (const state of ['FAILED', 'ONLINE']) {
        publication.state = state;
        assert.equal((await f.source.authorizeTarget(command, request)).legacyCasRecovery, undefined);
    }
    publication.state = 'ACTIVATING';
    selection.enterpriseCode = 'foreign';
    assert.equal((await f.source.authorizeTarget(command, request)).legacyCasRecovery, undefined);
    selection.enterpriseCode = request.enterpriseCode;
    await assert.rejects(f.source.authorizeTarget({ ...command, expectedRevision: 1 }, request), /precondition/);
    delete selection.approvalReference;
    await assert.rejects(f.source.authorizeTarget(command, request), /Reviewed/);
});

test('reviewed pre-fix recovery uses actual vService managed CAS and retains receipt checks', async () => {
    const concurrency = require('../../../../../../nodics.foundation/modules/nDatabase/database/src/service/schema/defaultModelConcurrencyService');
    const updater = require('../../../../../../nodics.foundation/modules/nService/vService/src/service/procs/update/defaultModelsUpdateInitializerService');
    for (const scenario of ['success', 'lost-response', 'receipt-loss', 'disabled', 'foreign-proof', 'wrong-pointer', 'competing-history']) {
        const f = setup(), pub = await f.publication();
        await f.source.activate(pub, request);
        const pointer = [...f.targetStore.pointer.rows.values()][0], receipt = [...f.targetStore.receipt.rows.values()][0];
        pointer.revision = 0; receipt.revision = 0; receipt.expectedRevision = 0; receipt.applied = false;
        const selection = { tenant: request.tenant, enterpriseCode: request.enterpriseCode,
            publicationCode: pub.code, operationKey: pub.activationOperation.key, sourceVersion: pub.sourceVersion,
            rootType: pub.rootType, rootCode: pub.rootCode, reason: 'Reviewed pre-fix state',
            approvedBy: 'operator', approvalReference: 'review-001' };
        f.target.publicationSettings = () => ({ runtimeRole: 'ONLINE',
            legacyCasRecovery: { enabled: scenario !== 'disabled', operations: [selection] } });
        global.SERVICE.DefaultModelConcurrencyService = concurrency;
        global.CLASSES = { NodicsError: class extends Error {} };
        const models = {};
        for (const kind of ['pointer', 'receipt']) {
            const target = f.targetStore[kind], name = 'promotionPolicy' + kind[0].toUpperCase() + kind.slice(1);
            const schemaModel = { rawSchema: schemas[name], versioned: false, primaryKey: 'code',
                getItems: input => target.get(input),
                updateItems: () => { throw new Error('unmanaged writer used'); },
                compareAndSetItem: async input => {
                    const current = target.rows.get(input.query.code);
                    if (!current || Object.entries(input.query).some(([key,value]) => current[key] !== value)) return null;
                    const saved = { ...current, ...structuredClone(input.model) };
                    target.rows.set(saved.code, saved);
                    if (kind === 'pointer' && scenario === 'lost-response') throw new Error('response lost');
                    return saved;
                } };
            models[name] = schemaModel;
            target.update = input => {
                assert.equal(Object.hasOwn(input.model, 'revision'), false, 'owner must not write counters');
                return new Promise((resolve,reject) => {
                    const response = {};
                    updater.executeQuery.call({ LOG: { debug() {}, error() {} } }, { ...input, schemaModel }, response,
                        { nextSuccess: () => resolve(response.success), error: (_q,_r,error) => reject(error.error || error) });
                });
            };
        }
        global.NODICS.getModels = () => models;
        const context = { ...request, legacyCasRecoveryAuthorization: structuredClone(selection) };
        if (scenario === 'foreign-proof') context.legacyCasRecoveryAuthorization.enterpriseCode = 'foreign';
        if (scenario === 'wrong-pointer') pointer.version = 'foreign';
        if (scenario === 'competing-history') f.targetStore.receipt.rows.set('other', { ...receipt, code: 'other' });
        const command = { publication: pub, operationKey: pub.activationOperation.key, targetVersion: pub.sourceVersion,
            expectedVersion: null, expectedRevision: 0 };
        const before = structuredClone([...f.targetStore.pointer.rows.values()]);
        if (!['success', 'lost-response', 'receipt-loss'].includes(scenario)) {
            await assert.rejects(f.target.switchTarget(command, context), /committed|evidence mismatch|competing history/);
            assert.deepEqual([...f.targetStore.pointer.rows.values()], before);
            continue;
        }
        if (scenario === 'receipt-loss') {
            const update = f.targetStore.receipt.update;
            f.targetStore.receipt.update = async () => { throw new Error('receipt response unavailable'); };
            await assert.rejects(f.target.switchTarget(command, context), /receipt response unavailable/);
            assert.equal([...f.targetStore.pointer.rows.values()][0].revision, 1);
            f.targetStore.receipt.update = update;
        }
        const result = await f.target.switchTarget(command, context);
        assert.equal(result.receipt.code, receipt.code);
        assert.equal(result.receipt.applied, true);
        assert.equal(result.receipt.previousOnlineVersion, null);
        assert.equal(result.receipt.revision, 1);
        const repaired = [...f.targetStore.pointer.rows.values()][0];
        assert.equal(repaired.revision, 1);
        assert.equal(repaired.version, pub.sourceVersion);
        assert.equal(repaired.legacyCasRecovery.priorPointerRevision, 0);
        assert.equal(repaired.legacyCasRecovery.approvalReference, 'review-001');
        assert.equal((await f.target.switchTarget(command, context)).receipt.code, receipt.code);
        assert.equal((await f.target.reconcileTarget(pub, command.operationKey, request)).receipt.applied, true);
        repaired.revision = 3;
        await assert.rejects(f.target.switchTarget(command, context), /superseded conflict/);
    }
});

test('owner compiled Mongo validators require absent strings while receipts expose null lineage', async () => {
    const f = setup(), publication = await f.publication();
    const handler = require('../../../../../../nodics.foundation/modules/nDatabase/mongodb/src/service/model/defaultMongodbDatabaseModelHandlerService');
    global.UTILS.isBlank = value => value == null || typeof value === 'object' && !Object.keys(value).length;
    const checks = {};
    for (const kind of ['pointer', 'receipt']) {
        const name = 'promotionPolicy' + kind[0].toUpperCase() + kind.slice(1);
        const schema = structuredClone(schemas[name]);
        await handler.prepareDatabaseOptions({ schemaName: name, tntCode: request.tenant,
            moduleObject: { rawSchema: { [name]: schema } },
            dataBase: { master: { getOptions: () => ({ schemaProperties: {} }) } } });
        const compiled = schema.schemaOptions[request.tenant].options.validator.$jsonSchema;
        // Exercise the actual owner/compiler required and string constraints at the store boundary.
        const check = model => {
            for (const key of compiled.required) assert.notEqual(model[key], undefined, key + ' required');
            for (const [key, field] of Object.entries(compiled.properties)) {
                if (field.bsonType === 'string' && Object.hasOwn(model, key)) {
                    assert.equal(typeof model[key], 'string', key + ' must be a string when present');
                }
            }
        };
        checks[kind] = check;
        const target = f.targetStore[kind], save = target.save, update = target.update;
        target.save = async input => { check(input.model); return save.call(target, input); };
        target.update = async input => {
            check({ ...target.rows.get(input.query.code), ...input.model });
            return update.call(target, input);
        };
        for (const field of kind === 'pointer' ? ['version', 'receiptCode'] : ['previousOnlineVersion']) {
            assert.equal(compiled.properties[field].bsonType, 'string');
            assert.equal(compiled.required.includes(field), false);
        }
    }
    const saveReceipt = f.targetStore.receipt.save;
    f.targetStore.receipt.save = async () => { throw new Error('interrupted before receipt'); };
    await assert.rejects(f.source.activate(publication, request), /interrupted before receipt/);
    const emptyPointer = [...f.targetStore.pointer.rows.values()][0];
    assert.equal(Object.hasOwn(emptyPointer, 'version'), false);
    assert.equal(Object.hasOwn(emptyPointer, 'receiptCode'), false);
    assert.deepEqual(await f.source.getOnlineVersion(publication, request), { version: null, revision: 1 });
    assert.throws(() => checks.pointer({ ...emptyPointer, version: null }), /must be a string/);
    assert.throws(() => checks.pointer({ ...emptyPointer, receiptCode: null }), /must be a string/);
    f.targetStore.receipt.save = saveReceipt;
    const first = await f.source.activate(publication, request);
    assert.equal(first.receipt.previousOnlineVersion, null);
    const stored = [...f.targetStore.receipt.rows.values()][0];
    assert.equal(Object.hasOwn(stored, 'previousOnlineVersion'), false);
    assert.throws(() => checks.receipt({ ...stored, previousOnlineVersion: null }), /must be a string/);
    assert.equal((await f.source.activate(publication, request)).receipt.previousOnlineVersion, null);
    assert.equal((await f.source.reconcile(publication, request)).receipt.previousOnlineVersion, null);
    for (const service of Object.values(global.SERVICE)) for (const value of service.rows.values()) {
        value.versionId = 1; value.revision = 2; value.status = 'ARCHIVED';
    }
    f.input.references.forEach(ref => { ref.versionId = 1; });
    const second = await f.publication('second-schema-checked');
    assert.equal((await f.source.activate(second, request)).receipt.previousOnlineVersion, first.version);
    const rollback = { ...second, state: 'ROLLING_BACK', revision: 9, targetVersion: second.sourceVersion };
    assert.equal((await f.source.rollback(rollback, first.version, request)).receipt.previousOnlineVersion, second.sourceVersion);
    assert.equal((await f.source.rollback(rollback, first.version, request)).receipt.previousOnlineVersion, second.sourceVersion);
});

test('await-boundary caller mutations cannot replace the authorized execution snapshot', async () => {
    for (const operation of ['prepare', 'activate', 'reconcile']) {
        const f = setup(), publication = await f.publication();
        const release = await f.source.getVersion(publication, request);
        const controller = require('../src/controller/defaultPromotionPublicationTargetController');
        const authData = { tenant: request.tenant, entCode: request.enterpriseCode, userGroups: [], permissions: [], principalId: 'verified' };
        const body = { publication, release, targetVersion: release.code,
            operationKey: publication.activationOperation.key, expectedVersion: null, expectedRevision: 0 };
        const expected = structuredClone(body);
        let enter, resume, executed;
        const entered = new Promise(resolve => { enter = resolve; });
        const pending = new Promise(resolve => { resume = resolve; });
        global.SERVICE.DefaultPromotionPublicationService = f.target;
        global.SERVICE.DefaultServiceTokenService = { requireRuntimePrincipal: () => authData };
        global.SERVICE.DefaultIdentityGovernanceService = { getSystemAuthData: () => ({ isSystem: true, userGroups: ['configured-system'], permissions: [] }) };
        global.SERVICE.DefaultPromotionPublicationTransportService = { authorizeTarget: async (command, context) => {
            assert.equal(context.authData, authData);
            const fingerprint = f.target.fingerprint(command);
            enter();
            await pending;
            return { authorized: true, fingerprint };
        } };
        const record = (value, local) => {
            executed = value;
            assert.equal(local.authData.principalId, 'verified');
            assert.equal(local.authData.tenant, request.tenant);
            assert.equal(local.authData.entCode, request.enterpriseCode);
            return { accepted: true };
        };
        f.target.prepareTarget = (value, local) => record(value, local);
        f.target.switchTarget = (value, local) => record(value, local);
        f.target.reconcileTarget = (value, key, local) => record({ publication: value, operationKey: key }, local);
        const running = controller[operation]({ ...request, authData, httpRequest: { body } });
        await entered;
        body.release.payload.records[0].policy.code = 'nested-substitution';
        body.release = { ...body.release, code: 'replacement-digest' };
        body.publication.code = 'replacement-publication';
        body.publication.rootCode = 'replacement-root';
        body.publication.sourceVersion = 'replacement-source';
        body.publication.activationOperation.key = 'replacement-nested-operation';
        body.targetVersion = 'replacement-target';
        body.operationKey = 'replacement-operation';
        body.expectedVersion = 'replacement-predecessor';
        body.expectedRevision = 900;
        authData.principalId = 'unverified-after-await';
        authData.tenant = 'foreign-after-await';
        authData.entCode = 'foreign-after-await';
        resume();
        await running;
        assert.deepEqual(executed, operation === 'prepare' ? expected.release : operation === 'activate' ? expected :
            { publication: expected.publication, operationKey: expected.operationKey });
        assert.equal(authData.principalId, 'unverified-after-await');
    }
});

test('prepare binds authorized digest root and scope before requesting local authority', async () => {
    const f = setup(), publication = await f.publication();
    const release = await f.source.getVersion(publication, request);
    const controller = require('../src/controller/defaultPromotionPublicationTargetController');
    const authData = { tenant: request.tenant, entCode: request.enterpriseCode };
    let elevated = 0, authorized = 0;
    global.SERVICE.DefaultPromotionPublicationService = f.target;
    global.SERVICE.DefaultServiceTokenService = { requireRuntimePrincipal: () => authData };
    global.SERVICE.DefaultIdentityGovernanceService = { getSystemAuthData: () => {
        elevated++; return { isSystem: true, userGroups: ['configured-system'], permissions: [] };
    } };
    global.SERVICE.DefaultPromotionPublicationTransportService = { authorizeTarget: async command => {
        authorized++;
        assert.equal(command.targetVersion, release.code);
        assert.equal(command.sourceVersion, release.code);
        return { authorized: true, fingerprint: f.target.fingerprint(command) };
    } };
    const body = { publication, release, targetVersion: release.code };
    const variants = [];
    for (const key of ['code', 'fingerprint', 'rootType', 'rootCode', 'tenant', 'enterpriseCode']) {
        const forged = structuredClone(body);
        forged.release[key] = 'different';
        variants.push(forged);
    }
    for (const key of ['rootType', 'rootCode', 'tenant', 'enterpriseCode']) {
        const forged = structuredClone(body);
        forged.release.payload[key] = 'different';
        variants.push(forged);
        const rehashed = structuredClone(forged);
        rehashed.release.code = f.target.fingerprint(rehashed.release.payload);
        rehashed.release.fingerprint = rehashed.release.code;
        variants.push(rehashed);
        const conflictingScope = structuredClone(rehashed);
        conflictingScope.publication.sourceVersion = conflictingScope.release.code;
        conflictingScope.targetVersion = conflictingScope.release.code;
        conflictingScope.release[key] = 'different';
        variants.push(conflictingScope);
    }
    variants.push({ ...body, targetVersion: 'different' });
    variants.push({ ...body, publication: { ...publication, sourceVersion: 'different' } });
    for (const forged of variants) {
        await assert.rejects(controller.prepare({ ...request, authData, httpRequest: { body: forged } }), /publication authority/);
    }
    assert.equal(elevated, 0);
    assert.equal(authorized, 0);
    assert.equal(f.targetStore.release.rows.size, 0);
    const incoming = { ...request, authData, httpRequest: { body } };
    const original = structuredClone(incoming);
    await controller.prepare(incoming);
    assert.equal(authorized, 1);
    assert.equal(elevated, 1);
    assert.equal(f.targetStore.release.rows.size, 1);
    assert.deepEqual(incoming, original);
});

test('private authority is bounded in both directions and transport retains caller auth', async () => {
    const f = setup(), publication = await f.publication();
    const controller = require('../src/controller/defaultPromotionPublicationTargetController');
    const authData = { tenant: request.tenant, entCode: request.enterpriseCode, userGroups: [], permissions: ['route-permission'] };
    const incoming = { ...request, authData, httpRequest: { body: { publication } } };
    const original = structuredClone(incoming);
    let elevated = 0, denied = false, principal = authData;
    global.SERVICE.DefaultPromotionPublicationService = f.target;
    global.SERVICE.DefaultIdentityGovernanceService = { getSystemAuthData: () => {
        elevated++; return { isSystem: true, userGroups: ['configured-system'], permissions: [] };
    } };
    global.SERVICE.DefaultServiceTokenService = { requireRuntimePrincipal: () => {
        if (denied) throw new Error('permission denied');
        return principal;
    } };
    global.SERVICE.DefaultPromotionPublicationTransportService = { authorizeTarget: async (command, context) => {
        assert.equal(context.authData, authData);
        assert.equal(context.authData.isSystem, undefined);
        return { authorized: false };
    } };
    denied = true;
    await assert.rejects(controller.status(incoming), /permission denied/);
    denied = false;
    for (const key of ['tenant', 'entCode']) {
        principal = { ...authData, [key]: 'foreign' };
        await assert.rejects(controller.status(incoming), /scope mismatch/);
    }
    principal = authData;
    for (const key of ['tenantCode', 'enterpriseCode', 'domain', 'rootType']) {
        await assert.rejects(controller.status({ ...incoming, httpRequest: { body: {
            publication: { ...publication, [key]: 'foreign' }
        } } }), /scope mismatch|root required/);
    }
    await assert.rejects(controller.invoke('unknown', incoming), /Unknown/);
    await assert.rejects(controller.activate(incoming), /source authority/);
    assert.equal(elevated, 0);
    global.SERVICE.DefaultPromotionPublicationTransportService.authorizeTarget = async (command, context) => {
        assert.equal(context.authData, authData);
        return { authorized: true, fingerprint: f.target.fingerprint(command) };
    };
    f.target.switchTarget = async (input, local) => {
        assert.equal(local.authData.isSystem, true);
        assert.notEqual(local.authData, authData);
        return { accepted: true };
    };
    await controller.activate(incoming);
    assert.equal(elevated, 1);
    const command = { operation: 'activate', publicationCode: publication.code, rootType: publication.rootType,
        rootCode: publication.rootCode, operationKey: publication.activationOperation.key, sourceVersion: publication.sourceVersion,
        targetVersion: publication.sourceVersion, expectedVersion: null, expectedRevision: 0 };
    let reads = 0;
    global.SERVICE.DefaultPublicationLifecycleService = { getRepository: () => ({ get: async (code, local) => {
        reads++;
        assert.equal(local.authData.isSystem, true);
        return { ...publication, tenantCode: 'foreign', enterpriseCode: request.enterpriseCode };
    } }) };
    denied = true;
    await assert.rejects(f.source.authorizeTarget(command, incoming), /permission denied/);
    denied = false;
    principal = { ...authData, tenant: 'foreign' };
    await assert.rejects(f.source.authorizeTarget(command, incoming), /enterprise mismatch/);
    principal = authData;
    await assert.rejects(f.source.authorizeTarget({ ...command, operation: 'unknown' }, incoming), /Unsupported/);
    assert.equal(reads, 0);
    assert.equal(elevated, 1);
    await assert.rejects(f.source.authorizeTarget(command, incoming), /authority mismatch/);
    assert.equal(reads, 1);
    assert.deepEqual(incoming, original);
});

test('target private reads use canonical local authority without changing caller context', async () => {
    const f = setup(), publication = await f.publication();
    const controller = require('../src/controller/defaultPromotionPublicationTargetController');
    const authData = { tokenType: 'service', serviceId: 'runtime-service', tenant: request.tenant,
        entCode: request.enterpriseCode, runtimeInstanceId: 'staged-instance',
        runtimeScope: { instanceCode: 'staged-instance', assignmentCode: 'approved-grant' },
        modules: ['promotion'], permissions: ['auth.internal.token.read'], userGroups: [] };
    const original = structuredClone(authData);
    global.SERVICE.DefaultIdentityGovernanceService = { getSystemAuthData: () => ({ isSystem: true, userGroups: ['configured-system'], permissions: [] }) };
    global.SERVICE.DefaultPromotionPublicationService = f.target;
    global.SERVICE.DefaultServiceTokenService = { requireRuntimePrincipal: (context, moduleName) => {
        assert.equal(context.authData, authData);
        assert.equal(moduleName, 'promotion');
        return authData;
    } };
    let read;
    f.targetStore.pointer.get = async input => { read = input; return { result: [] }; };
    const result = await controller.status({ ...request, authData, httpRequest: { body: { publication } } });
    assert.equal(result.result.version, null);
    assert.notEqual(read.authData, authData);
    assert.equal(read.authData.isSystem, true);
    assert.deepEqual(read.authData.userGroups, ['configured-system']);
    assert.equal(read.tenant, request.tenant);
    assert.deepEqual(authData, original);
    f.targetStore.pointer.get = async () => { throw new Error('schema ACL denies runtime principal'); };
    await assert.rejects(controller.status({ ...request, authData, httpRequest: { body: { publication } } }), /schema ACL denies/);
    assert.deepEqual(authData, original);
});

test('ordinary Staged source writes require effective CURRENT storage through owner pre-interceptors', () => {
    const f = setup(), registry = require('../src/interceptors/interceptors');
    for (const schema of Object.keys(f.sources)) {
        for (const trigger of ['preSave', 'preUpdate']) {
            const entry = Object.values(registry).find(item => item.item === schema && item.trigger === trigger &&
                item.handler === 'DefaultPromotionPublicationService.validateSourceAuthoring');
            assert(entry);
        }
        const input = { ...request, schemaModel: { schemaName: schema } };
        assert.equal(f.source.validateSourceAuthoring(input), true);
        const getModels = global.NODICS.getModels;
        global.NODICS.getModels = () => ({});
        assert.throws(() => f.source.validateSourceAuthoring(input), /qualified CURRENT/);
        global.NODICS.getModels = getModels;
        assert.equal(f.target.validateSourceAuthoring(input), true);
    }
});

test('disabled capture API delegates through owner facade with authenticated scope and fixed domain', async () => {
    const route = require('../src/router/routers').promotion.policyPublicationAuthoring.createGoverned;
    assert.equal(route.active, true);
    assert.equal(route.apiExposure, 'promotionPublicationAuthoring');
    assert.equal(require('../config/properties').apiExposure.categories[route.apiExposure].enabled, false);
    const exposure = require('../../../../../../nodics.foundation/modules/nRouter/src/service/request/defaultRequestHandlerPipelineService');
    const previousConfig = global.CONFIG;
    for (const enabled of [false, true, 'true', undefined]) {
        global.CONFIG = { get: () => ({ default: { enabled: false }, categories: { [route.apiExposure]: { enabled } } }) };
        assert.equal(exposure.isApiExposureEnabled(route.apiExposure), enabled === true);
    }
    global.CONFIG = previousConfig;
    assert.equal(route.secured, true);
    assert.deepEqual(route.authTokenTypes, ['access']);
    assert.equal(route.permission, 'publish.lifecycle.create');
    const facade = require('../src/facade/defaultPromotionFacade');
    const controller = require('../src/controller/defaultPromotionPublicationTargetController');
    const f = setup();
    global.SERVICE.DefaultPromotionPublicationService = f.source;
    let captured;
    global.SERVICE.DefaultPublicationLifecycleService = { create: async input => { captured = input; return input.publication; } };
    global.FACADE = { DefaultPromotionFacade: facade };
    const authData = { tokenType: 'access', tenant: request.tenant, entCode: request.enterpriseCode, principalId: 'reviewer' };
    const input = { ...request, authData, httpRequest: { body: {
        ...f.input, publicationCode: 'operator-publication', domain: 'forged', tenant: 'forged', enterpriseCode: 'forged'
    } } };
    const result = await controller.createGoverned(input);
    assert.equal(result.result.domain, 'promotion');
    assert.equal(result.result.tenantCode, request.tenant);
    assert.equal(result.result.enterpriseCode, request.enterpriseCode);
    assert.equal(captured.authData.principalId, 'reviewer');
    await assert.rejects(controller.createGoverned({ ...input, tenant: 'foreign' }), /operator scope/);
    await assert.rejects(controller.createGoverned({ ...input, authData: { ...authData, tokenType: 'service' } }), /operator scope/);
});

test('Staged policy guards reject operational mutations and nested consumption without persistence', async () => {
    const service = require('../src/service/defaultPromotionOperationService');
    global.CONFIG = { get: () => ({ publication: { runtimeRole: 'STAGED' } }) };
    for (const model of [{ budget: { spent: '1' } }, { 'budget.spent': '1' },
        { $set: { 'budget.spent': '1' } }, { analytics: {} },
        { $rename: { 'budget.limit': 'budget.spent' } }]) {
        assert.throws(() => service.validatePolicyAuthoring({ model }), /Staged promotion/);
    }
    assert.equal(service.validatePolicyAuthoring({ model: { budget: { limit: '10' } } }), true);
    const registry = require('../src/interceptors/interceptors');
    const operational = Object.values(registry).filter(definition =>
        definition.handler === 'DefaultPromotionOperationService.requireOperationalRuntime');
    assert.equal(operational.length, 15);
    for (const item of ['coupon', 'couponBatch', 'promotionBudgetLedger', 'promotionRedemption', 'discountDecision']) {
        assert.deepEqual(operational.filter(definition => definition.item === item)
            .map(definition => definition.trigger).sort(), ['preRemove', 'preSave', 'preUpdate']);
    }
    for (const definition of operational) {
        assert.equal(definition.type, 'schema');
        assert.throws(() => service[definition.handler.split('.')[1]]({}), /forbidden on Staged/);
    }
    for (const method of ['apply', 'reverse', 'consumeBudget', 'releaseBudget', 'consumeActivatedBudget',
        'createCouponBatch', 'reserveCouponCodeForCheckout', 'consumeCoupon', 'releaseCoupon',
        'persistBudgetLedger', 'persistRedemption', 'persistDecision']) {
        await assert.rejects(service[method]({}), /forbidden on Staged/);
    }
    global.CONFIG = { get: () => ({}) };
    assert.equal(service.requireOperationalRuntime(), true);
    assert.equal(service.validatePolicyAuthoring({ model: { budget: { spent: '1' } } }), true);
});

test('fixed callback delegates Process authority and null registrations stay disabled', async () => {
    const config = require('../config/properties');
    assert.equal(config.publish.providers.versionProviders.promotion, null);
    assert.equal(config.publish.providers.domainAdapters.promotion, null);
    assert.equal(config.publish.providers.workflowProviders.promotion, null);
    assert.equal(config.promotion.publication.delivery.enabled, false);
    let selected;
    global.SERVICE = { DefaultPublicationApprovalCallbackService: { applyDecision: async (request, scope) => { selected = scope; return { accepted: true }; } } };
    const controller = require('../src/controller/defaultPromotionPublicationTargetController');
    await controller.applyPublicationDecision({ httpRequest: { body: { domain: 'forged', decision: 'APPROVE' } } });
    assert.deepEqual(selected, { domain: 'promotion', actionKey: 'promotion.applyPublicationDecision' });
    const manifest = require('../data/manifest.json');
    const release = manifest.sections.promotionPublicationWorkflow;
    assert.equal(release.sourceRoot, 'init-v002');
    const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
    for (const [file, expected] of Object.entries(release.files)) {
        assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(__dirname, '../data', file))).digest('hex'), expected);
    }
});

test('target route rejects token-only authority before mutation', async () => {
    const f = setup(), controller = require('../src/controller/defaultPromotionPublicationTargetController');
    global.SERVICE.DefaultPromotionPublicationService = f.target;
    global.SERVICE.DefaultServiceTokenService = { requireRuntimePrincipal: () => ({ entCode: request.enterpriseCode, tenant: request.tenant }) };
    global.SERVICE.DefaultPromotionPublicationTransportService = { authorizeTarget: async () => ({ authorized: false }) };
    const publication = await f.publication();
    await assert.rejects(controller.activate({ ...request, httpRequest: { body: { publication } } }), /source authority/);
    assert.equal(f.targetStore.pointer.rows.size, 0);
});

test('source authorization rejects forged decision and accepts only stored pinned operation', async () => {
    const f = setup(), publication = await f.publication();
    publication.tenantCode = request.tenant; publication.enterpriseCode = request.enterpriseCode;
    global.SERVICE.DefaultServiceTokenService = { requireRuntimePrincipal: () => ({ entCode: request.enterpriseCode, tenant: request.tenant }) };
    global.SERVICE.DefaultIdentityGovernanceService = { getSystemAuthData: () => ({ isSystem: true, userGroups: ['configured-system'], permissions: [] }) };
    global.SERVICE.DefaultPublicationLifecycleService = { getRepository: () => ({ get: async (code, local) => {
        assert.notEqual(local.authData, request.authData);
        assert.equal(local.authData.isSystem, true);
        assert.equal(request.authData.isSystem, undefined);
        return publication;
    } }) };
    const command = { operation: 'activate', publicationCode: publication.code, sourceVersion: publication.sourceVersion,
        rootType: publication.rootType, rootCode: publication.rootCode, operationKey: publication.activationOperation.key,
        targetVersion: publication.sourceVersion, expectedVersion: null, expectedRevision: 0 };
    assert.equal((await f.source.authorizeTarget(command, request)).authorized, true);
    await assert.rejects(f.source.authorizeTarget({ ...command, operationKey: 'forged' }, request), /authority/);
    publication.state = 'PENDING_APPROVAL';
    await assert.rejects(f.source.authorizeTarget(command, request), /authority/);
});

test('ordinary preview uses approved policy plus current consumption, never mutable eligibility policy', async () => {
    const f = setup();
    const current = global.SERVICE.DefaultPromotionService.rows.get('promotion');
    current.actions = { discountAmount: '10.00' };
    const pub = await f.publication();
    await f.source.activate(pub, request);
    current.actions.discountAmount = '999.00';
    current.status = 'ARCHIVED';
    current.budget.spent = '95.00';
    f.target.publicationSettings = () => ({ runtimeRole: 'ONLINE', delivery: { enabled: true, rootCodes: ['promotion'] } });
    global.CONFIG = { get: () => ({ publication: f.target.publicationSettings() }) };
    global.SERVICE.DefaultPromotionPublicationService = f.target;
    global.SERVICE.DefaultPromotionSimulationService = require('../src/service/defaultPromotionSimulationService');
    const operations = require('../src/service/defaultPromotionOperationService');
    const input = { ...request, authData: { ...request.authData, tenant: request.tenant,
        enterpriseCode: request.enterpriseCode, userGroups: ['customerUserGroup'] },
        ownerId: 'customer-a', payload: { subtotal: '100.00' } };
    const result = await operations.preview(input);
    assert.equal(result.selected[0].actions.discountAmount, '10.00');
    assert.equal(result.selected[0].budget.spent, '95.00');
    assert.equal(current.actions.discountAmount, '999.00');
    current.budget.spent = '100.00';
    assert.equal((await operations.preview(input)).selected.length, 0);
    f.targetStore.receipt.rows.clear();
    await assert.rejects(operations.preview(input), /receipt mismatch/);
});

test('enabled consumption changes only live budget state and never overwrites source policy', async () => {
    const f = setup(), pub = await f.publication();
    await f.source.activate(pub, request);
    const current = global.SERVICE.DefaultPromotionService.rows.get('promotion');
    current.status = 'ARCHIVED'; current.budget.limit = '999.00';
    f.target.publicationSettings = () => ({ runtimeRole: 'ONLINE', delivery: { enabled: true } });
    global.CONFIG = { get: () => ({ publication: { delivery: { enabled: true } } }) };
    global.SERVICE.DefaultPromotionPublicationService = f.target;
    global.SERVICE.DefaultExactAmountService = require('../../pricing/src/service/defaultExactAmountService');
    const operations = { ...require('../src/service/defaultPromotionOperationService'), persistBudgetLedger: async () => true };
    let mutation;
    global.SERVICE.DefaultPromotionService.update = async input => { mutation = input; return { result: { modifiedCount: 1 } }; };
    const policies = await f.target.readActivatedWithConsumption(request, 'promotion');
    await operations.consumeBudget({ ...request, ownerId: 'customer-a' }, policies[0], '1.00');
    assert.equal(mutation.model.status, undefined);
    assert.equal(mutation.model.budget.limit, '999.00');
    assert.equal(mutation.model.budget.spent, '91');
    assert.equal(mutation.query['budget.spent'], '90.00');
    global.SERVICE.DefaultPromotionService.update = async () => ({ result: { modifiedCount: 0 } });
    await assert.rejects(operations.consumeBudget(request, policies[0], '1.00'), /consumption conflict/);
});

test('activated promotion reads only live spent, preserving approved limit and rules', async () => {
    const f = setup(), pub = await f.publication();
    await f.source.activate(pub, request);
    const current = global.SERVICE.DefaultPromotionService.rows.get('promotion');
    current.budget = { limit: '999.00', spent: '99.00' };
    current.status = 'ARCHIVED';
    const result = await f.target.readActivatedWithConsumption(request, 'promotion');
    assert.deepEqual(result[0].budget, { limit: '100.00', spent: '99.00' });
    assert.equal(result[0].status, 'ACTIVE');
    assert.equal(current.status, 'ARCHIVED');
    delete current.budget.spent;
    await assert.rejects(f.target.readActivatedWithConsumption(request, 'promotion'), /consumption unavailable/);
});

test('unfinished receipt completion is recovered before a subsequent pointer mutation', async () => {
    const f = setup(), pub = await f.publication();
    const update = f.targetStore.receipt.update;
    f.targetStore.receipt.update = async () => { throw new Error('receipt persistence unavailable'); };
    await assert.rejects(f.source.activate(pub, request), /receipt persistence unavailable/);
    assert.equal((await f.source.getOnlineVersion(pub, request)).version, pub.sourceVersion);
    f.targetStore.receipt.update = update;
    const recovered = await f.source.reconcile(pub, request);
    assert.equal(recovered.receipt.applied, true);
    assert.equal(recovered.receipt.previousOnlineVersion, null);
    assert.equal((await f.source.activate(pub, request)).receipt.code, recovered.receipt.code);
});

test('target transport routes require runtime internal identity and distinct Online routing', async () => {
    const transport = require('../src/service/defaultPromotionPublicationTransportService');
    const routes = require('../src/router/routers').promotion.policyPublicationTarget;
    for (const route of Object.values(routes)) {
        assert.equal(route.apiExposure, 'commercePublicationIngestion');
        assert.equal(route.secured, true);
        assert.deepEqual(route.authTokenTypes, ['service']);
        assert.equal(route.permissionConfig, 'authSecurity.internalToken.routePermission');
    }
    const calls = [];
    global.CONFIG = { get: () => ({ publication: { runtimeRole: 'STAGED', target: {
        moduleName: 'promotion', connectionName: 'policyOnline', runtimeRole: 'COMMERCE_ONLINE' } } }) };
    global.NODICS = { getInternalAuthToken: () => 'runtime-token' };
    global.SERVICE = { DefaultModuleService: { invokeModule: async input => { calls.push(input); return {}; } } };
    await transport.getTargetStatus({ rootType: 'root', rootCode: 'code' }, request);
    assert.equal(calls[0].apiName, '/publication/policy/status');
    assert.equal(calls[0].local, false);
    assert.equal(calls[0].tenant, request.tenant);
    assert.equal(calls[0].header.Authorization, 'Bearer runtime-token');
    assert.equal(calls[0].targetAuthority.runtimeRole, 'COMMERCE_ONLINE');
    global.CONFIG = { get: () => ({ publication: { runtimeRole: 'STAGED', target: { connectionName: 'default' } } }) };
    assert.throws(() => transport.getTargetStatus({}, request), /Distinct Online/);
});
const assert = require('node:assert/strict');
const provider = require('../src/service/defaultPromotionPublicationService');
const schemas = require('../src/schemas/schemas').promotion;
const request = { tenant: 'tenant-a', enterpriseCode: 'enterprise-a', authData: { principalId: 'publisher' } };

/** Models insert-only managed saves and revision-checked atomic updates, with response-loss injection. */
function store() {
    const rows = new Map();
    return {
        rows, loseResponse: false,
        async get({ query }) { return { result: [...rows.values()].filter(row => Object.entries(query).every(([key,value]) => row[key] === value)).map(row => structuredClone(row)) }; },
        async save({ model }) {
            if (rows.has(model.code)) throw new Error('CAS conflict');
            rows.set(model.code, structuredClone({ ...model, revision: 1 }));
        },
        async update({ query, model }) {
            const row = rows.get(query.code);
            if (!row || !Object.entries(query).every(([key,value]) => row[key] === value)) throw new Error('CAS conflict');
            rows.set(row.code, structuredClone({ ...row, ...model, revision: row.revision + 1 }));
            if (this.loseResponse) { this.loseResponse = false; throw new Error('response lost'); }
            return { result: { modifiedCount: 1 } };
        }
    };
}

/** Installs independent source and target stores without changing any runtime database. */
function setup() {
    global.UTILS = { createModelName: schema => schema };
    global.NODICS = { getModels: () => Object.fromEntries(Object.keys(provider.policyFields()).map(schema =>
        [schema, { versioned: true, rawSchema: { versionedReadMode: 'CURRENT' } }])) };
    const sources = {"promotion":"DefaultPromotionService"};
    const sourceStore = { release: store(), pointer: store(), receipt: store() };
    const targetStore = { release: store(), pointer: store(), receipt: store() };
    const target = { ...provider, publicationSettings: () => ({ runtimeRole: 'ONLINE' }), targetServices: () => targetStore };
    const source = { ...provider, publicationSettings: () => ({ runtimeRole: 'STAGED', sourceVersioningQualified: true }),
        targetServices: () => sourceStore, transport: () => target };
    global.SERVICE = {};
    for (const [schema, name] of Object.entries(sources)) {
        const data = store();
        data.rows.set(schema, { ...request, authData: undefined, code: schema, versionId: 0, revision: 1,
            priceBookCode: 'priceBook', unitAmount: '10.00', currency: 'USD', rate: '0.05', status: 'ACTIVE',
            budget: { limit: '100.00', spent: '90.00' }, conditions: {}, actions: {} });
        global.SERVICE[name] = data;
    }
    const input = { rootType: 'promotion', rootCode: 'promotion',
        references: Object.keys(sources).map(schema => ({ schema, code: schema, versionId: 0 })) };
    async function release() { return source.capture(request, input); }
    async function publication(code = 'publication-a') {
        const retained = await release();
        const status = await target.getTargetStatus(input, request);
        return { ...input, code, domain: 'promotion', sourceVersion: retained.code, state: 'ACTIVATING', revision: 5,
            activationOperation: { key: code + ':activate:5', previousOnlineVersion: status.version, previousOnlineRevision: status.revision } };
    }
    return { source, target, sourceStore, targetStore, sources, input, release, publication };
}

test('retention reads exact zero and remains unchanged after source edits; preparation stays hidden', async () => {
    const f = setup(), release = await f.release();
    for (const service of Object.values(global.SERVICE)) service.rows.clear();
    assert.equal((await f.source.getVersion({ ...f.input, code: 'a', domain: 'promotion', sourceVersion: release.code }, request)).code, release.code);
    await f.target.prepareTarget(release, request);
    await assert.rejects(f.target.readActivated(f.input, request), /No activated policy/);
    assert.equal(f.targetStore.pointer.rows.size, 0);
    await assert.rejects(f.source.capture(request, f.input), /Exact policy version unavailable/);
});

test('activation receipt survives response loss and replay without another pointer mutation', async () => {
    const f = setup(), pub = await f.publication();
    f.targetStore.pointer.loseResponse = true;
    const result = await f.source.activate(pub, request);
    assert.equal(result.receipt.previousOnlineVersion, null);
    assert.equal(result.receipt.operationKey, pub.activationOperation.key);
    assert.equal(result.receipt.sourceVersion, pub.sourceVersion);
    const revision = (await f.source.getOnlineVersion(pub, request)).revision;
    assert.equal((await f.source.activate(pub, request)).receipt.code, result.receipt.code);
    assert.equal((await f.source.getOnlineVersion(pub, request)).revision, revision);
    assert.equal((await f.source.reconcile(pub, request)).receipt.applied, true);
    const records = await f.target.readActivated(pub, request);
    assert(records.length);
    assert(records.every(item => !item.policy.budget || item.policy.budget.spent === undefined));
});

test('rollback selects retained policy and does not write any operational source store', async () => {
    const f = setup(), first = await f.publication();
    await f.source.activate(first, request);
    for (const service of Object.values(global.SERVICE)) for (const value of service.rows.values()) {
        value.versionId = 1; value.revision = 2;
        value.status = 'ARCHIVED';
    }
    f.input.references.forEach(ref => ref.versionId = 1);
    const second = await f.publication('publication-b');
    const before = Object.values(global.SERVICE).map(service => structuredClone([...service.rows.values()]));
    await f.source.activate(second, request);
    const rollback = { ...second, state: 'ROLLING_BACK', revision: 9, targetVersion: second.sourceVersion };
    await f.source.rollback(rollback, first.sourceVersion, request);
    await f.source.rollback(rollback, first.sourceVersion, request);
    assert.equal((await f.source.getOnlineVersion(first, request)).version, first.sourceVersion);
    assert.deepEqual(Object.values(global.SERVICE).map(service => [...service.rows.values()]), before);
    await assert.rejects(f.source.reconcile(second, request), /superseded conflict/);
    await assert.rejects(f.source.activate(first, request), /superseded conflict/);
    await assert.rejects(f.source.reconcile(first, request), /superseded conflict/);
    const third = await f.publication('publication-c');
    await f.source.activate(third, request);
    const pointerBeforeReplay = structuredClone([...f.targetStore.pointer.rows.values()]);
    await assert.rejects(f.source.rollback(rollback, first.sourceVersion, request), /superseded conflict/);
    assert.deepEqual([...f.targetStore.pointer.rows.values()], pointerBeforeReplay);
});

test('applied activation replay rejects a later release without moving its pointer', async () => {
    const f = setup(), first = await f.publication();
    await f.source.activate(first, request);
    for (const service of Object.values(global.SERVICE)) for (const value of service.rows.values()) {
        value.versionId = 1; value.revision = 2; value.status = 'ARCHIVED';
    }
    f.input.references.forEach(ref => ref.versionId = 1);
    const second = await f.publication('publication-b');
    await f.source.activate(second, request);
    assert.notEqual(first.sourceVersion, second.sourceVersion);
    const pointerBeforeReplay = structuredClone([...f.targetStore.pointer.rows.values()]);
    await assert.rejects(f.source.activate(first, request), /superseded conflict/);
    await assert.rejects(f.source.reconcile(first, request), /superseded conflict/);
    assert.deepEqual([...f.targetStore.pointer.rows.values()], pointerBeforeReplay);
    assert.equal((await f.source.activate(second, request)).version, second.sourceVersion);
});

test('stale activation rejects even when a pointer returns to the same version (ABA)', async () => {
    const f = setup(), first = await f.publication();
    await f.source.activate(first, request);
    const stale = await f.publication('stale');
    const pointer = [...f.targetStore.pointer.rows.values()][0];
    pointer.revision += 2;
    await assert.rejects(f.source.activate(stale, request), /superseded conflict/);
});

test('target rejects operational payload injection and cross-enterprise reads', async () => {
    const f = setup(), release = await f.release();
    const corrupt = structuredClone(release);
    corrupt.payload.records[0].policy.reserved = '10';
    corrupt.code = f.target.fingerprint(corrupt.payload);
    corrupt.fingerprint = corrupt.code;
    await assert.rejects(f.target.prepareTarget(corrupt, request), /non-policy fields/);
    await f.target.prepareTarget(release, request);
    await assert.rejects(f.target.retainedVersion(release.code, { ...request, enterpriseCode: 'other' }), /unavailable/);
});

test('schemas opt out of versioning, use managed CAS and expose no generic mutation router', () => {
    for (const name of ['promotionPolicyRelease', 'promotionPolicyPointer', 'promotionPolicyReceipt']) {
        assert.equal(schemas[name].isVersionedEnabled, false);
        assert.equal(schemas[name].router.enabled, false);
        assert.equal(schemas[name].backoffice.concurrency.managed, true);
        assert.equal(schemas[name].indexes.individual.policyIdentity.options.unique, true);
    }
});

test('capture and activation remain deployment-qualified with no registration fallback', async () => {
    const f = setup();
    const unqualified = { ...f.source, publicationSettings: () => ({ runtimeRole: 'STAGED' }) };
    await assert.rejects(unqualified.capture(request, f.input), /not qualified/);
    await assert.rejects(f.source.activate({ ...await f.publication(), state: 'APPROVED' }, request), /activation operation/);
    await assert.rejects(f.target.prepareTarget({}, request), /scope or fingerprint/);
});

test('capture requires the effective tenant CURRENT versioned model, not qualification flag alone', async () => {
    const f = setup();
    assert.equal(require('../config/properties').schemaPolicies.promotion.publicationVersioned.isVersionedEnabled, false);
    const expected = Object.keys(f.sources).sort();
    assert.deepEqual(Object.entries(schemas).filter(([, schema]) =>
        schema.schemaPolicies?.includes('publicationVersioned')).map(([name]) => name).sort(), expected);
    for (const model of [undefined, { versioned: false }, { versioned: true, rawSchema: { versionedReadMode: 'ALL' } }]) {
        global.NODICS.getModels = (owner, tenant) => {
            assert.equal(owner, 'promotion'); assert.equal(tenant, request.tenant);
            return Object.fromEntries(expected.map(name => [name, model]));
        };
        await assert.rejects(f.release(), /qualified CURRENT versioned storage/);
        assert.equal(f.sourceStore.release.rows.size, 0);
    }
});
