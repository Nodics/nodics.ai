/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module media/test/MediaRetainedPublicationContract @description Tests exact metadata/bytes, invisible preparation, transactional receipts, retained rollback and provider gates. */
const assert = require('node:assert/strict');
const test = require('node:test');
const crypto = require('node:crypto');
const manifests = require('../src/service/publication/defaultMediaRetainedPublicationService');
const target = require('../src/service/publication/defaultMediaPublicationTargetService');
const provider = require('../src/service/publication/defaultMediaPublicationVersionProviderService');
const delivery = require('../src/service/storage/defaultMediaDeliveryService');
const handler = require('../src/service/storage/defaultMediaContentResponseHandlerService');

/** Installs generated-service and transaction test doubles; no application runtime or database is accessed. */
function fixture() {
    const policy = { versionProviderEnabled: true, runtimeRole: 'STAGED', maximumAssetBytes: 100,
        targetTransportProvider: 'TargetTransport', transactionModuleName: 'media' };
    let tables = {};
    let retained = new Map();
    let failReceipt = false;
    let reads = [];
    const context = { tenant: 'one', authData: { code: 'reviewer' } };
    const service = name => ({
        get: async request => {
            reads.push({ name, request });
            let rows = Object.values(tables[request.tenant + name] || {});
            return { result: structuredClone(rows.filter(row => Object.entries(request.query).every(([key, value]) => row[key] === value))) };
        },
        save: async request => {
            assert(request.transactionContext);
            if (name === 'receipt' && failReceipt) throw new Error('receipt unavailable');
            let table = tables[request.tenant + name] ||= {};
            if (table[request.model.code]) throw new Error('duplicate');
            table[request.model.code] = structuredClone(request.model);
            return { result: [structuredClone(request.model)] };
        },
        update: async request => {
            assert(request.transactionContext);
            let table = tables[request.tenant + name] || {};
            let current = table[request.query.code];
            if (!current || !Object.entries(request.query).every(([key, value]) => current[key] === value)) return { result: { modifiedCount: 0 } };
            table[current.code] = structuredClone(request.model);
            return { result: { modifiedCount: 1 } };
        }
    });
    const bytes = Buffer.from('version-one');
    const record = { code: 'hero', versionId: 0, active: true, status: 'READY', name: 'First name',
        folderCode: 'cmsAssets', formatCode: 'original', originalFileName: 'hero.png', mimeType: 'image/png',
        access: 'PUBLIC', sizeBytes: bytes.length, checksumAlgorithm: 'sha256',
        checksum: crypto.createHash('sha256').update(bytes).digest('hex'), providerCode: 'local', storageKey: 'mutable' };
    tables.onemedia = { hero: structuredClone(record) };
    retained.set('mutable', bytes);
    global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message); this.code = code; } } };
    global.CONFIG = { get: key => key === 'media' ? { publication: policy, delivery: { publicAccessEnabled: true } } : undefined };
    global.UTILS = { createModelName: name => name + 'Model' };
    global.NODICS = { getModels: (moduleName, tenant) => {
        assert.equal(moduleName, 'media'); assert.equal(tenant, 'one');
        return { mediaModel: { versioned: true, rawSchema: { versionedReadMode: 'CURRENT' } } };
    } };
    global.SERVICE = {
        DefaultMediaRetainedPublicationService: manifests, DefaultMediaPublicationTargetService: target,
        DefaultMediaService: service('media'), DefaultMediaTransferManifestService: service('manifest'),
        DefaultMediaPlacementService: service('pointer'), DefaultMediaPublicationReceiptService: service('receipt'),
        DefaultMediaStorageProviderRegistryService: {
            read: async request => { const bytes = retained.get(request.storageKey); if (!bytes) throw new Error('missing bytes'); return Buffer.from(bytes); },
            storeRetained: async request => { const key = 'retained-' + retained.size; retained.set(key, Buffer.from(request.buffer));
                return { providerCode: 'local', storageKey: key }; }
        },
        DefaultDatabaseTransactionService: {
            capabilities: () => ({ multiRecordAtomic: true, contextPropagation: true }),
            execute: async (scope, work) => { assert.equal(scope.moduleName, 'media'); const before = structuredClone(tables);
                try { return await work({ transaction: true }); } catch (error) { tables = before; throw error; } }
        }
    };
    return { policy, context, reads, retained, record, bytes, tables: () => tables,
        failReceipt: value => { failReceipt = value; }, online: () => { policy.runtimeRole = 'ONLINE'; } };
}

test('exact version capture pins bytes and metadata; latest source mutation is irrelevant', async () => {
    const f = fixture();
    const manifest = await manifests.capture({ code: 'hero', versionId: 0 }, f.context);
    assert.deepEqual(f.reads[0].request.query, { code: 'hero', versionId: 0, active: true, status: 'READY' });
    f.retained.set('mutable', Buffer.from('changed'));
    f.tables().onemedia.hero.name = 'Changed';
    const exported = await manifests.exportPackage(manifest, f.context);
    assert.equal(exported.asset.name, 'First name');
    assert.equal(exported.contentBase64, f.bytes.toString('base64'));
    assert.equal(exported.asset.storageKey, undefined);
    await assert.rejects(manifests.capture({ code: 'hero', versionId: '0' }, f.context));
    await assert.rejects(manifests.capture({ code: 'hero', versionId: 1 }, f.context));
    await assert.rejects(manifests.load(manifest.code, 'hero', { tenant: 'other' }));
    const damaged = structuredClone(manifest); damaged.artifacts.asset.name = 'Changed';
    await assert.rejects(manifests.readBytes(damaged, f.context));
    f.retained.set(manifest.evidence.retained.storageKey, Buffer.from('damaged'));
    await assert.rejects(manifests.exportPackage(manifest, f.context));
});

test('metadata versioning is owner opt-in only and capture verifies the installed model before any version lookup', async () => {
    const f = fixture();
    const schemas = require('../src/schemas/schemas').media;
    const properties = require('../config/properties');
    const schemaHandler = require('../../../../nodics.foundation/modules/nDatabase/database/src/service/schema/defaultDatabaseSchemaHandlerService');
    const originalGet = CONFIG.get;
    const policies = structuredClone(properties.schemaPolicies);
    CONFIG.get = key => key === 'schemaPolicies' ? policies : originalGet(key);
    assert.deepEqual(schemas.media.schemaPolicies, ['publicationVersioned']);
    for (const [name, schema] of Object.entries(schemas)) {
        if (name !== 'media') assert(![].concat(schema.schemaPolicies || []).includes('publicationVersioned'));
    }
    assert.equal(schemaHandler.applyNamedSchemaPolicies('media', structuredClone(schemas)).media.isVersionedEnabled, false);
    // Qualified migration opts into both settings through the existing layered policy.
    policies.media.publicationVersioned = { isVersionedEnabled: true, versionedReadMode: 'CURRENT' };
    const effective = schemaHandler.applyNamedSchemaPolicies('media', structuredClone(schemas));
    assert.equal(effective.media.isVersionedEnabled, true); assert.equal(effective.media.versionedReadMode, 'CURRENT');
    for (const name of ['mediaTransferManifest', 'mediaPlacement', 'mediaPublicationReceipt']) assert.equal(effective[name].isVersionedEnabled, false);
    const installed = NODICS.getModels;
    for (const model of [undefined, { versioned: false, rawSchema: { versionedReadMode: 'CURRENT' } },
        { versioned: true, rawSchema: {} }, { versioned: true, rawSchema: { versionedReadMode: 'HISTORY' } }]) {
        NODICS.getModels = () => ({ mediaModel: model });
        await assert.rejects(manifests.capture({ code: 'hero', versionId: 0, versioned: true }, { ...f.context, qualified: true }), /CURRENT versioned/);
        assert.equal(f.reads.length, 0); assert.equal(f.retained.size, 1);
    }
    NODICS.getModels = installed;
    assert.equal((await manifests.capture({ code: 'hero', versionId: 0 }, f.context)).artifacts.asset.versionId, 0);
    assert.equal(properties.media.publication.versionProviderEnabled, false);
});

test('hidden target preparation, receipt replay, replacement and retained rollback preserve exact metadata and bytes', async () => {
    const f = fixture();
    const first = await manifests.capture({ code: 'hero', versionId: 0 }, f.context);
    const firstPackage = await manifests.exportPackage(first, f.context);
    f.online();
    const input = { manifest: firstPackage, operationKey: 'pub:activate:1', publicationCode: 'pub', expectedVersion: null };
    await target.deploy({ ...input, prepareOnly: true }, f.context);
    await assert.rejects(target.resolveDelivery('hero', f.context));
    assert.equal(await target.getStatus({ mediaCode: 'hero' }, f.context), null);
    const activation = await target.deploy(input, f.context);
    assert.equal(activation.receipt.previousOnlineVersion, null);
    assert.equal((await target.deploy(input, f.context)).replayed, true);
    const secondAsset = { ...firstPackage.asset, versionId: 1, name: 'Second name' };
    const secondPackage = { code: manifests.digest(secondAsset), asset: secondAsset, contentBase64: firstPackage.contentBase64 };
    const secondInput = { manifest: secondPackage, operationKey: 'pub2:activate:1', publicationCode: 'pub2', expectedVersion: first.code };
    const second = await target.deploy(secondInput, f.context);
    assert.notEqual(second.version, first.code, 'same bytes do not erase metadata changes');
    assert.equal((await target.resolveDelivery('hero', f.context)).media.name, 'Second name');
    await assert.rejects(target.deploy(input, f.context), /replay conflicts/);
    await assert.rejects(target.deploy({ ...secondInput, operationKey: 'different', expectedVersion: null }, f.context), /version conflict/);
    const rollback = { manifestCode: first.code, mediaCode: 'hero', expectedVersion: second.version, publicationCode: 'pub2', operationKey: 'pub2:rollback:1' };
    await target.rollback(rollback, f.context);
    assert.equal((await target.rollback(rollback, f.context)).replayed, true);
    const delivered = await delivery.deliver({ ...f.context, mediaCode: 'hero' });
    assert.equal(delivered.buffer.toString(), 'version-one');
    assert.equal(delivered.cacheControl, 'no-store');
    let sent;
    handler.handleSuccess({}, { type() {}, set() {}, send(bytes) { sent = bytes; } }, delivered);
    assert.deepEqual(sent, f.bytes);
});

test('failed receipt rolls back activation, malformed bytes fail before storage and unqualified providers reject', async () => {
    const f = fixture();
    const manifest = await manifests.capture({ code: 'hero', versionId: 0 }, f.context);
    const packet = await manifests.exportPackage(manifest, f.context);
    f.online(); f.failReceipt(true);
    const input = { manifest: packet, expectedVersion: null, publicationCode: 'pub', operationKey: 'op' };
    await assert.rejects(target.deploy(input, f.context), /receipt unavailable/);
    assert.equal(await target.getStatus({ mediaCode: 'hero' }, f.context), null);
    await assert.rejects(target.deploy({ ...input, manifest: { ...packet, contentBase64: '***' } }, f.context));
    await assert.rejects(target.deploy({ ...input, expectedVersion: undefined }, f.context));
    f.failReceipt(false);
    f.policy.versionProviderEnabled = false;
    await assert.rejects(target.deploy(input, f.context));
    await assert.rejects(provider.getVersion({ rootCode: 'hero', sourceVersion: manifest.code }, f.context));
    f.policy.versionProviderEnabled = true; f.policy.runtimeRole = 'STAGED';
    assert.throws(() => provider.transport(), /unavailable/);
    let sent;
    SERVICE.TargetTransport = { deploy: async input => { sent = input; return { version: input.manifest.code }; }, getStatus() {}, rollback() {} };
    await provider.activate({ code: 'pub', domain: 'media', rootType: 'media', rootCode: 'hero', sourceVersion: manifest.code,
        activationOperation: { key: 'stable-original-key', previousOnlineVersion: null } }, f.context);
    assert.equal(sent.operationKey, 'stable-original-key');
    assert.equal(sent.expectedVersion, null);
    assert.equal(provider.targetReceiptContract, 'v1');
    const publication = { domain: 'media', rootType: 'media', rootCode: 'hero', sourceVersion: manifest.code };
    assert.deepEqual(provider.resolveDependencies(publication, manifest), [{ schema: 'media', code: 'hero', version: 0 }]);
    assert.equal((await provider.validate(publication, manifest, f.context)).valid, true);
    await assert.rejects(provider.getVersion({ ...publication, domain: 'cms' }, f.context));
});

test('private retained metadata still obeys delivery access policy without mutable fallback', async () => {
    const f = fixture(); f.tables().onemedia.hero.access = 'PRIVATE';
    const manifest = await manifests.capture({ code: 'hero', versionId: 0 }, f.context);
    const packet = await manifests.exportPackage(manifest, f.context); f.online();
    await target.deploy({ manifest: packet, publicationCode: 'private', operationKey: 'op', expectedVersion: null }, f.context);
    await assert.rejects(delivery.deliver({ tenant: 'one', mediaCode: 'hero' }), /authenticated/);
    await assert.rejects(delivery.deliver({ tenant: 'other', mediaCode: 'hero' }), /not activated/);
});

test('unsupported transactions reject before retained file allocation and evidence schemas suppress precommit effects', async () => {
    const f = fixture();
    SERVICE.DefaultDatabaseTransactionService.capabilities = () => ({ multiRecordAtomic: false });
    await assert.rejects(manifests.capture({ code: 'hero', versionId: 0 }, f.context), /transaction/);
    assert.equal(f.retained.size, 1);
    const schemas = require('../src/schemas/schemas').media;
    for (const name of ['mediaTransferManifest', 'mediaPlacement', 'mediaPublicationReceipt']) {
        assert.deepEqual(schemas[name].transaction, { enabled: true, sideEffects: 'none' });
        assert.equal(schemas[name].event.enabled, false);
        assert.equal(schemas[name].cache.enabled, false);
        assert.equal(schemas[name].isVersionedEnabled, false);
        assert.equal(schemas[name].backoffice.mutationMode, 'READ_ONLY');
    }
    assert.equal(require('../config/properties').media.publication.versionProviderEnabled, false);
});
