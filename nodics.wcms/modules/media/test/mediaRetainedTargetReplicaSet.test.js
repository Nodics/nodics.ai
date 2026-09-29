/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module media/test/MediaRetainedTargetReplicaSet @description Opt-in isolated native MongoDB qualification of retained target transactions, CAS and replay. */
const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { MongoClient } = require('mongodb');
const foundation = '../../../../nodics.foundation/modules/nDatabase/';
const transactions = require(foundation + 'database/src/service/transaction/defaultDatabaseTransactionService');
const adapter = require(foundation + 'mongodb/src/service/connection/defaultMongodbDatabaseConnectionHandlerService');
const mongoModel = require(foundation + 'mongodb/src/schemas/model').default;
const validator = require(foundation + 'database/src/service/model/defaultModelValidatorService');
const manifests = require('../src/service/publication/defaultMediaRetainedPublicationService');
const target = require('../src/service/publication/defaultMediaPublicationTargetService');
const provider = require('../src/service/publication/defaultMediaPublicationVersionProviderService');
const facade = require('../src/facade/storage/defaultMediaStorageFacade');
const tokenService = require('../../../../nodics.foundation/modules/nAuth/src/service/identity/defaultServiceTokenService');
const local = require('../src/service/storage/provider/defaultLocalMediaStorageProviderService');
const keys = require('../src/service/storage/defaultMediaStorageKeyService');
const schemas = require('../src/schemas/schemas').media;

test('real local replica set: hidden preparation, atomic receipts, CAS, lost response and retained rollback', {
    skip: process.env.NODICS_MEDIA_REPLICA_SET_TEST !== '1' && 'Set NODICS_MEDIA_REPLICA_SET_TEST=1 for isolated local qualification'
}, async t => {
    // Deliberately no URI/database override: this fixture cannot select an application database.
    const databaseName = 'nodics_media_fixture_' + crypto.randomUUID().replaceAll('-', '');
    const tenant = 'fixture';
    const context = { tenant, authData: { tokenType: 'service', serviceId: 'fixture', entCode: 'fixture', tenant,
        runtimeInstanceId: 'fixture', modules: ['media'], runtimeScope: { instanceCode: 'fixture',
            projectCode: 'fixture', environmentCode: 'local', serverCode: 'online', assignmentCode: 'media' } } };
    const client = new MongoClient('mongodb://127.0.0.1:27017/?directConnection=true', {
        serverSelectionTimeoutMS: 5000, connectTimeoutMS: 5000, socketTimeoutMS: 15000
    });
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'nodics-media-replica-'));
    const previous = Object.fromEntries(['SERVICE', 'CONFIG', 'CLASSES', 'NODICS', 'UTILS'].map(key => [key, global[key]]));
    let database;
    let failReceipt = false;
    let failAfterReceipt = false;
    try {
        await client.connect();
        const hello = await client.db('admin').command({ hello: 1 });
        assert.equal(hello.isWritablePrimary, true, 'local MongoDB must be writable primary');
        assert.equal(typeof hello.setName, 'string', 'local MongoDB must already be a replica set');
        assert(Number.isFinite(hello.logicalSessionTimeoutMinutes));
        database = client.db(databaseName);
        const capabilities = await adapter.discoverCapabilities(database);
        assert.equal(capabilities.transaction.multiRecordAtomic, true);
        const wrapper = { getClient: () => client, getCapabilities: () => capabilities,
            getOptions: () => ({ connectionHandler: 'FixtureMongoAdapter' }) };
        global.CLASSES = { NodicsError: class extends Error {
            constructor(code, message) { super(message || (code instanceof Error ? code.message : code)); this.code = code; }
        } };
        global.CONFIG = { get: key => key === 'databaseTransactions'
            ? { enabled: true, failClosed: true, maximumCommitTimeMs: 10000 }
            : key === 'media' ? { publication: { versionProviderEnabled: true, runtimeRole: 'ONLINE', maximumAssetBytes: 1000 } } : undefined };
        const storage = { ...local, resolveBasePath: () => root, resolveLocation(request) {
            const storageKey = request.storageKey || request.schemaName + '/' + request.mediaCode;
            return { providerCode: 'local', storageKey, internalAbsolutePath: path.join(root, storageKey) };
        } };
        global.SERVICE = {
            DefaultDatabaseTransactionService: transactions, FixtureMongoAdapter: adapter,
            DefaultDatabaseConfigurationService: { getTenantDatabase(moduleName, requestedTenant) {
                assert.equal(moduleName, 'media'); assert.equal(requestedTenant, tenant); return { master: wrapper };
            } },
            DefaultModelValidatorService: { ...validator, LOG: { debug() {} } },
            DefaultMediaRetainedPublicationService: manifests, DefaultMediaPublicationTargetService: target,
            DefaultMediaStorageKeyService: keys, DefaultMediaStorageProviderRegistryService: storage
        };
        SERVICE.DefaultServiceTokenService = tokenService;
        // Only generated service envelopes are adapted. All model operations, sessions,
        // atomicity, retries and CAS execute through the real Nodics MongoDB provider.
        for (const name of ['mediaTransferManifest', 'mediaPlacement', 'mediaPublicationReceipt']) {
            await database.createCollection(name);
            const collection = database.collection(name);
            await collection.createIndex({ code: 1 }, { unique: true });
            const model = { ...mongoModel, rawSchema: schemas[name], dataBase: wrapper };
            for (const method of ['find', 'countDocuments', 'insertOne', 'findOneAndUpdate']) model[method] = collection[method].bind(collection);
            SERVICE['Default' + name[0].toUpperCase() + name.slice(1) + 'Service'] = {
                async get(request) { assert.equal(request.tenant, tenant); return model.getItems(request); },
                async save(request) {
                    assert.equal(request.tenant, tenant); assert(request.transactionContext);
                    if (name === 'mediaPublicationReceipt' && failReceipt) throw new Error('injected receipt failure');
                    const saved = await model.compareAndSetItem({ ...request, operation: 'create' });
                    if (name === 'mediaPublicationReceipt' && failAfterReceipt) throw new Error('injected failure after receipt write');
                    return { result: [saved] };
                },
                async update(request) {
                    assert.equal(request.tenant, tenant); assert(request.transactionContext);
                    const saved = await model.compareAndSetItem({ ...request, operation: 'update' });
                    return { result: { modifiedCount: saved ? 1 : 0 } };
                }
            };
        }
        const packet = versionId => {
            const bytes = Buffer.from('retained-version-' + versionId);
            const asset = { code: 'hero', versionId, name: 'Version ' + versionId, access: 'PUBLIC',
                mimeType: 'image/png', originalFileName: 'hero.png', sizeBytes: bytes.length,
                checksumAlgorithm: 'sha256', checksum: crypto.createHash('sha256').update(bytes).digest('hex') };
            return { code: manifests.digest(asset), asset, contentBase64: bytes.toString('base64') };
        };
        const first = packet(0);
        const deploy = { manifest: first, publicationCode: 'first', operationKey: 'activate-first', expectedVersion: null };
        const pointers = database.collection('mediaPlacement');
        const receipts = database.collection('mediaPublicationReceipt');
        const sourceProvider = { ...provider, manifests: () => ({ ...manifests,
            policy: () => ({ ...manifests.policy(), runtimeRole: 'STAGED' }) }) };
        // The fixture source repository is isolated too; no installed publication is read.
        const intents = database.collection('fixtureSourceIntent');
        await intents.insertOne({ code: 'first', domain: 'media', rootType: 'media', rootCode: 'hero', sourceVersion: first.code,
            state: 'ACTIVATING', activationOperation: { key: deploy.operationKey, previousOnlineVersion: null } });
        SERVICE.DefaultPublicationLifecycleService = { get: request => intents.findOne({ code: request.publicationCode }) };
        SERVICE.DefaultMediaPublicationModuleTransportService = { authorize: (command, request) => sourceProvider.authorizeTarget(command, request) };
        const recovery = { mediaCode: 'hero', manifestCode: first.code, publicationCode: 'first',
            operationKey: deploy.operationKey, expectedVersion: null, operation: 'DEPLOY' };
        await t.test('preparation remains hidden and receipt failures abort all transaction writes', async () => {
            await target.deploy({ ...deploy, prepareOnly: true }, context);
            assert.equal(await target.getStatus({ mediaCode: 'hero' }, context), null);
            await assert.rejects(target.resolveDelivery('hero', context), /not activated/);
            failReceipt = true;
            await assert.rejects(target.deploy(deploy, context), /injected receipt failure/);
            failReceipt = false;
            assert.equal(await pointers.countDocuments(), 0);
            assert.equal(await receipts.countDocuments(), 0);
            failAfterReceipt = true;
            await assert.rejects(target.deploy(deploy, context), /injected failure after receipt write/);
            failAfterReceipt = false;
            assert.equal(await pointers.countDocuments(), 0);
            assert.equal(await receipts.countDocuments(), 0);
        });
        await t.test('valid runtime cannot invent stored publication or operation, including hidden preparation', async () => {
            for (const patch of [{ publicationCode: 'invented' }, { operationKey: 'invented' }, { expectedVersion: 'f'.repeat(64) }]) {
                await assert.rejects(facade.retainedPublication('deploy', { ...deploy, ...patch }, context));
                await assert.rejects(facade.retainedPublication('deploy', { ...deploy, ...patch, prepareOnly: true }, context));
            }
            await intents.updateOne({ code: 'first' }, { $set: { state: 'PENDING_APPROVAL' } });
            await assert.rejects(facade.retainedPublication('deploy', deploy, context), /not currently authorized/);
            await intents.updateOne({ code: 'first' }, { $set: { state: 'ACTIVATING' } });
            assert.equal(await pointers.countDocuments(), 0); assert.equal(await receipts.countDocuments(), 0);
            assert.equal((await target.reconcile(recovery, context)).status, 'NOT_COMMITTED');
        });
        await t.test('committed activation survives lost caller response and replays its durable receipt', async () => {
            await assert.rejects((async () => { await facade.retainedPublication('deploy', deploy, context); throw new Error('lost response'); })(), /lost response/);
            assert.equal(await pointers.countDocuments(), 1);
            assert.equal(await receipts.countDocuments(), 1);
            const replay = await target.deploy(deploy, context);
            assert.equal(replay.replayed, true);
            assert.equal(replay.previousOnlineVersion, null);
            assert.equal((await target.getStatus({ mediaCode: 'hero' }, context)).revision, 1);
            const recovered = await target.reconcile(recovery, context);
            assert.equal(recovered.status, 'ACTIVE'); assert.deepEqual(recovered.receipt, replay.receipt);
            assert.equal(recovered.previousOnlineVersion, null);
            await intents.updateOne({ code: 'first' }, { $set: { state: 'FAILED' } });
            const inFlight = await intents.findOne({ code: 'first' });
            assert.equal(inFlight.targetVersion, undefined);
            const recoveryProvider = { ...sourceProvider, transport: () => ({ reconcile: (input, request) => target.reconcile(input, request) }) };
            assert.equal((await recoveryProvider.reconcile(inFlight, context)).status, 'ACTIVE');
            assert.equal((await target.reconcile({ ...recovery, expectedVersion: 'f'.repeat(64) }, context)).status, 'CONFLICT');
        });
        const contenders = [1, 2].map(id => ({ manifest: packet(id), publicationCode: 'race-' + id,
            operationKey: 'race-' + id, expectedVersion: first.code }));
        let winner;
        await t.test('competing expected-version CAS commits one pointer and one matching receipt', async () => {
            for (const input of contenders) await target.deploy({ ...input, prepareOnly: true }, context);
            const results = await Promise.allSettled(contenders.map(input => target.deploy(input, context)));
            assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
            const index = results.findIndex(result => result.status === 'fulfilled');
            winner = contenders[index];
            assert.match(results[1 - index].reason.message, /version conflict/);
            assert.equal(await receipts.countDocuments(), 2);
            const status = await target.getStatus({ mediaCode: 'hero' }, context);
            assert.equal(status.version, winner.manifest.code); assert.equal(status.revision, 2);
            const replay = await target.deploy(winner, context);
            assert.equal(replay.previousOnlineVersion, first.code); assert.equal(replay.replayed, true);
            await assert.rejects(target.deploy(deploy, context), /replay conflicts/);
            assert.equal((await target.reconcile(recovery, context)).status, 'CONFLICT');
        });
        await t.test('retained rollback is atomic, ownership-scoped and idempotent after lost response', async () => {
            assert(winner, 'CAS qualification must succeed before rollback');
            const rollback = { mediaCode: 'hero', manifestCode: first.code, expectedVersion: winner.manifest.code,
                publicationCode: winner.publicationCode, operationKey: 'rollback-winner' };
            await assert.rejects(target.rollback({ ...rollback, publicationCode: 'foreign' }, context), /does not own/);
            failAfterReceipt = true;
            await assert.rejects(target.rollback(rollback, context), /injected failure after receipt write/);
            failAfterReceipt = false;
            assert.equal((await target.getStatus({ mediaCode: 'hero' }, context)).version, winner.manifest.code);
            assert.equal(await receipts.countDocuments(), 2);
            await assert.rejects((async () => { await target.rollback(rollback, context); throw new Error('lost rollback response'); })(), /lost rollback response/);
            const replay = await target.rollback(rollback, context);
            assert.equal(replay.replayed, true); assert.equal(replay.previousOnlineVersion, winner.manifest.code);
            assert.equal((await target.getStatus({ mediaCode: 'hero' }, context)).revision, 3);
            assert.equal(await receipts.countDocuments(), 3);
            const delivered = await target.resolveDelivery('hero', context);
            assert.deepEqual(delivered.media, first.asset);
            assert.deepEqual(delivered.buffer, Buffer.from(first.contentBase64, 'base64'));
            const recovered = await target.reconcile({ ...rollback, operation: 'ROLLBACK' }, context);
            assert.equal(recovered.status, 'ACTIVE'); assert.deepEqual(recovered.receipt, replay.receipt);
            assert.equal((await target.reconcile(recovery, context)).status, 'CONFLICT', 'same version cannot conceal a superseding rollback operation');
        });
        await t.test('real versioned Media writers preserve history, reject stale updates and block physical cleanup', async () => {
            const lifecycle = require('../src/service/storage/defaultMediaLifecycleCoordinationService');
            const cleanup = require('../src/service/storage/defaultMediaCleanupLifecycleService');
            const upload = require('../src/service/storage/defaultMediaUploadService');
            SERVICE.DefaultMediaStoragePolicyService = require('../src/service/storage/defaultMediaStoragePolicyService');
            const versionedModel = require(foundation + 'mongodb/vMongodb/src/schemas/model').default;
            const versionedReads = require('../../../../nodics.foundation/modules/nService/vService/src/service/procs/get/defaultModelsGetInitializerService');
            const collection = database.collection('fixtureVersionedMedia');
            await collection.createIndex({ code: 1, versionId: 1 }, { unique: true });
            const model = { ...mongoModel, ...versionedModel, primaryKey: 'code', versioned: true, dataBase: wrapper,
                rawSchema: { ...schemas.media, versionedReadMode: 'CURRENT' } };
            for (const method of ['find', 'countDocuments', 'insertOne', 'insertMany', 'aggregate']) model[method] = collection[method].bind(collection);
            global.UTILS = { createModelName: () => 'mediaModel', isBlank: value => !value || Object.keys(value).length === 0 };
            global.NODICS = { getModels: () => ({ mediaModel: model }) };
            SERVICE.DefaultMediaLifecycleCoordinationService = lifecycle;
            SERVICE.DefaultMediaService = {
                get: request => model[versionedReads.resolveReadMethod({ ...request, schemaModel: model })]({ ...request,
                    searchOptions: { limit: 10, ...request.searchOptions } }),
                update: async request => ({ result: await model.updateVersionedItems(request) }),
                save: async request => ({ result: await model.saveVersionedItems(request) })
            };
            const original = { code: 'writer', versionId: 0, version: 0, name: 'Original', status: 'READY',
                checksum: 'original-checksum', storageKey: 'original-file', providerCode: 'local', legalHold: false,
                retentionUntil: new Date(0), businessPurpose: 'test', ownerReference: 'owner' };
            await collection.insertOne({ ...original });
            await lifecycle.setLegalHold({ ...context, mediaCode: 'writer', legalHold: true });
            const held = await lifecycle.load({ ...context, mediaCode: 'writer' });
            assert.equal(held.versionId, 1); assert.equal(held.legalHold, true); assert.equal(held.name, 'Original');
            assert.equal((await collection.find({}).toArray()).some(row => Object.hasOwn(row, '$set')), false);
            await assert.rejects(lifecycle.updateMetadata(context, original, { name: 'stale' }), /Selected version changed/);
            const contenders = await Promise.allSettled(['first', 'second'].map(name => lifecycle.updateMetadata(context, held, { name })));
            assert.equal(contenders.filter(result => result.status === 'fulfilled').length, 1);
            assert.equal(await collection.countDocuments(), 3);
            let candidate = { code: 'candidate', active: true, mediaCode: 'writer', status: 'CANDIDATE', legalHold: false };
            SERVICE.DefaultMediaCleanupCandidateService = { get: async () => ({ result: [candidate] }),
                save: async request => { candidate = request.model; return { result: [candidate] }; } };
            await assert.rejects(cleanup.markPassive({ ...context, candidateCode: 'candidate' }), /legal hold/);
            assert.equal(candidate.status, 'CANDIDATE');
            await lifecycle.setLegalHold({ ...context, mediaCode: 'writer', legalHold: false });
            await cleanup.markPassive({ ...context, candidateCode: 'candidate' });
            assert.equal((await lifecycle.load({ ...context, mediaCode: 'writer' })).status, 'RETIRED');
            const count = await collection.countDocuments();
            await cleanup.markPassive({ ...context, candidateCode: 'candidate' });
            assert.equal(await collection.countDocuments(), count, 'retirement retry does not append duplicates');
            await assert.rejects(cleanup.runRetentionCleanup(context), /Physical cleanup is disabled/);
            await assert.rejects(lifecycle.deleteExpired({ ...context, mediaCode: 'writer' }), /Physical cleanup is disabled/);
            const historical = await collection.findOne({ code: 'writer', versionId: 0 }); delete historical._id;
            assert.deepEqual(historical, original);
            // Storage is real; only location policy points to this fixture's temporary root.
            storage.resolveLocation = request => {
                const storageKey = request.storageKey || request.schemaName + '/' + request.mediaCode;
                return { providerCode: 'local', storageKey, folderCode: 'default', mimeType: 'image/png', access: 'PUBLIC',
                    fileName: request.originalFileName, originalFileName: request.originalFileName, internalAbsolutePath: path.join(root, storageKey) };
            };
            const uploadRequest = { ...context, mediaCode: 'upload-writer', files: [{ buffer: Buffer.from('upload-first'),
                originalFileName: 'asset.png', mimeType: 'image/png', sizeBytes: 12 }] };
            const created = await upload.upload(uploadRequest);
            assert.equal(created.versionId, 0);
            const next = await upload.upload({ ...uploadRequest, versionId: 0, files: [{ ...uploadRequest.files[0], buffer: Buffer.from('upload-next'), sizeBytes: 11 }] });
            assert.equal(next.versionId, 1); assert.notEqual(next.storageKey, created.storageKey);
            assert.equal((await storage.read(created)).toString(), 'upload-first');
            assert.equal((await storage.read(next)).toString(), 'upload-next');
            await assert.rejects(upload.upload({ ...uploadRequest, versionId: 0 }), /current Media versionId/);
            const delivery = require('../src/service/storage/defaultMediaDeliveryService');
            SERVICE.DefaultMediaStorageProviderRegistryService.resolveImportSource = request => ({ absolutePath: path.join(root, request.storageKey) });
            const delivering = { ...delivery, policy: () => ({ enabled: true, publicAccessEnabled: true, maximumResults: 2, allowedStatuses: ['READY'] }) };
            const configGet = CONFIG.get;
            CONFIG.get = key => key === 'media' ? { publication: { versionProviderEnabled: false } } : configGet(key);
            assert.equal((await delivering.deliver({ ...context, mediaCode: 'upload-writer' })).cacheControl, 'no-store');
            CONFIG.get = configGet;
        });
        t.diagnostic('Qualified local replica set ' + hello.setName + '; isolated database ' + databaseName);
    } finally {
        try {
            if (database) {
                assert.match(database.databaseName, /^nodics_media_fixture_[a-f0-9]{32}$/);
                await database.dropDatabase();
            }
        } finally {
            await client.close();
            await fs.rm(root, { recursive: true, force: true });
            for (const [key, value] of Object.entries(previous)) {
                if (value === undefined) delete global[key]; else global[key] = value;
            }
        }
    }
});
