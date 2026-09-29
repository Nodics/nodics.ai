/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/**
 * @module product/service/defaultProductPublicationTargetService
 * @description Prepares hidden Product projections and atomically switches an owner pointer with durable operation receipts.
 * @layer service
 * @owner product
 * @override Preserve generated persistence, receipt CAS, immutable manifests and independently secured target transport.
 */
module.exports = {
    /** Resolves the existing Product manifest utility. */
    manifests: function () { return SERVICE.DefaultProductPublicationGraphService; },
    /** Requires the configured Product serving authority without changing Commerce's operational role. */
    assertOnline: function () {
        const runtime = CONFIG.get('runtimeRole') || {};
        const authority = (((CONFIG.get('product') || {}).publication || {}).target || {}).runtimeRole;
        if (typeof authority !== 'string' || !authority.trim() || runtime.code !== authority ||
            !['OPERATIONAL', 'ONLINE'].includes(runtime.publication)) {
            throw new Error('Product target requires configured serving runtime authority');
        }
    },
    /** Validates the tenant-scoped Product/Store activation boundary. */
    scopeCode: function (scope, request) {
        if (!scope || typeof request.tenant !== 'string' || !request.tenant || scope.tenant !== request.tenant ||
            typeof scope.productCode !== 'string' || !scope.productCode || typeof scope.storeCode !== 'string' || !scope.storeCode ||
            Object.keys(scope).sort().join(',') !== 'productCode,storeCode,tenant') {
            throw new Error('Product activation scope is invalid');
        }
        return this.manifests().hash(scope);
    },
    /** Resolves one generated record without empty-response fallbacks. */
    read: async function (name, code, request) {
        const response = await SERVICE[name].get({ tenant: request.tenant, authData: request.authData,
            query: { code: code, tenant: request.tenant }, searchOptions: { limit: 2, pageSize: 2 } });
        if (!response || !Array.isArray(response.result) || response.result.length > 1) throw new Error('Invalid Product target response');
        const record = response.result[0];
        if (record && (record.code !== code || record.tenant !== request.tenant)) throw new Error('Foreign Product target record');
        return record;
    },
    /** Reads authoritative pointer and immutable receipt, retaining evidence even after later activations. */
    getStatus: async function (input, request) {
        this.assertOnline();
        const code = this.scopeCode(input.scope, request);
        const pointer = await this.read('DefaultProductPublicationPointerService', code, request);
        const receipt = pointer && pointer.receipts.find(item => item.operationKey === input.operationKey);
        return { version: pointer && pointer.active !== false ? pointer.version : null, revision: pointer ? pointer.revision : 0,
            receipt: receipt || null, scope: input.scope };
    },
    /** Validates transported graph hashes and rebuilds projections locally before any target writes. */
    verifyInput: function (input, request) {
        const manifest = input.manifest, service = this.manifests();
        this.scopeCode(manifest && manifest.scope, request);
        if (!input.operationKey || !input.publicationCode || !Array.isArray(input.projections) ||
            !manifest.root || manifest.root.code !== manifest.scope.productCode || manifest.root.tenant !== request.tenant ||
            input.sourceVersion !== String(manifest.root.versionId) ||
            !manifest.root.publicationReferences || manifest.root.publicationReferences.storeCode !== manifest.scope.storeCode ||
            !manifest.records || Object.values(manifest.records).some(rows => !Array.isArray(rows)) ||
            Object.values(manifest.records).reduce((sum, rows) => sum + rows.length, 0) > service.policy().maximumDependencies) {
            throw new Error('Product target input is incomplete');
        }
        service.validateGraph(request, manifest.root, manifest.records);
        const references = [];
        for (const [schema, rows] of Object.entries(Object.assign({}, manifest.records, { product: [manifest.root] }))) {
            if (!service.services()[schema] || !Array.isArray(rows)) throw new Error('Unknown Product target dependency');
            for (const row of rows) {
                if (row.tenant !== request.tenant || !Number.isSafeInteger(row.versionId) || row.versionId < 0) throw new Error('Invalid Product target version');
                references.push({ schema: schema, code: row.code, versionId: row.versionId, hash: service.hash(row) });
            }
        }
        references.sort(service.compareReferences);
        const sealed = manifest.root.publicationReferences.records;
        if (!Array.isArray(sealed) || sealed.length > service.policy().maximumDependencies ||
            new Set(references.map(row => JSON.stringify([row.schema, row.code]))).size !== references.length ||
            service.hash(sealed.slice().sort(service.compareReferences)) !==
                service.hash(references.filter(row => row.schema !== 'product'))) throw new Error('Product transported closure is not sealed');
        if (service.hash(references) !== service.hash(manifest.references) ||
            service.hash({ scope: manifest.scope, references: references }) !== manifest.version) throw new Error('Product target manifest checksum mismatch');
        const expected = service.projections(manifest, request);
        if (expected.length !== input.projections.length || expected.some((row, index) =>
            service.hash(this.projectionContent(row)) !== service.hash(this.projectionContent(input.projections[index])))) {
            throw new Error('Product target projection checksum mismatch');
        }
        return expected;
    },
    /** Selects stable projection fields, excluding generated storage timestamps and metadata. */
    projectionContent: function (row) {
        return { code: row.code, tenant: row.tenant, productCode: row.productCode, storeCode: row.storeCode,
            locale: row.locale, publicationVersion: row.publicationVersion, sourceHash: row.sourceHash, payload: row.payload, status: row.status };
    },
    /** Inserts a managed record only at revision zero; concurrent creation is accepted solely by exact content verification. */
    createOnce: async function (name, model, request, matches) {
        let record = await this.read(name, model.code, request);
        if (!record) {
            try {
                await SERVICE[name].save({ tenant: request.tenant, authData: request.authData,
                    model: Object.assign({ active: true, revision: 0 }, model) });
            } catch (error) {
                record = await this.read(name, model.code, request);
                if (!record || !matches(record)) throw error;
            }
            record = record || await this.read(name, model.code, request);
        }
        if (!record || !matches(record)) throw new Error('Immutable Product target identity conflict');
        return record;
    },
    /** Prepares all locale projections without touching any active pointer or existing release. */
    prepare: async function (input, request) {
        this.assertOnline();
        const projections = this.verifyInput(input, request), manifest = input.manifest, service = this.manifests();
        const evidence = { code: manifest.version, tenant: request.tenant, productCode: manifest.scope.productCode,
            storeCode: manifest.scope.storeCode, references: manifest.references,
            projections: projections.map(row => ({ code: row.code, hash: service.hash(this.projectionContent(row)) })) };
        const stored = await this.createOnce('DefaultProductPublicationManifestService', evidence, request,
            row => row.productCode === evidence.productCode && row.storeCode === evidence.storeCode &&
                service.hash(row.references) === service.hash(evidence.references) && service.hash(row.projections) === service.hash(evidence.projections));
        for (const projection of projections) {
            let existing = await this.read('DefaultProductSearchProjectionService', projection.code, request);
            if (!existing) {
                await SERVICE.DefaultProductSearchProjectionService.save({ tenant: request.tenant, authData: request.authData,
                    model: SERVICE.DefaultProductSearchPublicationService.persistenceModel(request, projection) });
                existing = await this.read('DefaultProductSearchProjectionService', projection.code, request);
            }
            if (!existing || service.hash(this.projectionContent(existing)) !== service.hash(this.projectionContent(projection))) {
                throw new Error('Product prepared projection needs reconciliation');
            }
            const publisher = SERVICE.DefaultProductSearchPublicationService;
            publisher.assertSearchSaveSucceeded(await publisher.searchService().doSave({ tenant: request.tenant,
                authData: request.authData, moduleName: 'product', indexName: publisher.policy().searchIndexName,
                model: structuredClone(this.projectionContent(existing)) }), existing);
        }
        await SERVICE.DefaultProductSearchPublicationService.refreshPublishedIndex(request);
        return stored;
    },
    /** Verifies and refreshes retained search documents before activation or rollback, including lost-index recovery. */
    verifyRetained: async function (version, scope, request) {
        const record = await this.read('DefaultProductPublicationManifestService', version, request);
        if (!record || record.productCode !== scope.productCode || record.storeCode !== scope.storeCode || !record.projections.length) {
            throw new Error('Retained Product manifest is unavailable');
        }
        for (const reference of record.projections) {
            const projection = await this.read('DefaultProductSearchProjectionService', reference.code, request);
            if (!projection || projection.publicationVersion !== version ||
                this.manifests().hash(this.projectionContent(projection)) !== reference.hash) throw new Error('Retained Product projection changed');
            const publisher = SERVICE.DefaultProductSearchPublicationService;
            publisher.assertSearchSaveSucceeded(await publisher.searchService().doSave({ tenant: request.tenant,
                authData: request.authData, moduleName: 'product', indexName: publisher.policy().searchIndexName,
                model: structuredClone(this.projectionContent(projection)) }), projection);
        }
        await SERVICE.DefaultProductSearchPublicationService.refreshPublishedIndex(request);
        return record;
    },
    /** Commits version and receipt in one generated managed-revision write, never a read-then-unconditional update. */
    switchVersion: async function (input, request) {
        this.assertOnline();
        const code = this.scopeCode(input.scope, request), service = this.manifests();
        const fingerprint = service.hash({ scope: input.scope, version: input.version, expectedVersion: input.expectedVersion || '',
            operation: input.operation, publicationCode: input.publicationCode, sourceVersion: input.sourceVersion });
        let pointer = await this.read('DefaultProductPublicationPointerService', code, request);
        const replay = pointer && pointer.receipts.find(item => item.operationKey === input.operationKey);
        if (replay) {
            if (replay.fingerprint !== fingerprint) throw new Error('Product operation key conflict');
            return this.result(replay, pointer.active === false ? null : pointer.version, true);
        }
        if (!input.operationKey || !input.publicationCode || typeof input.sourceVersion !== 'string' || !input.sourceVersion ||
            !(input.expectedVersion === null || typeof input.expectedVersion === 'string') ||
            (pointer && pointer.active !== false ? pointer.version : '') !== (input.expectedVersion || '')) {
            throw new Error('Product activation version conflict');
        }
        const receipts = pointer ? pointer.receipts : [];
        const maximum = service.policy().maximumActivationReceipts;
        if (!Number.isSafeInteger(maximum) || maximum < 1 || receipts.length >= maximum) throw new Error('Product activation receipt capacity exceeded');
        if (input.operation !== 'WITHDRAW') await this.verifyRetained(input.version, input.scope, request);
        const receipt = { operationKey: input.operationKey, fingerprint: fingerprint, publicationCode: input.publicationCode,
            operation: input.operation, version: input.version, targetVersion: input.version, sourceVersion: input.sourceVersion,
            previousOnlineVersion: pointer && pointer.active !== false ? pointer.version : null,
            scope: input.scope, committed: true };
        const model = { code: code, tenant: request.tenant, productCode: input.scope.productCode, storeCode: input.scope.storeCode,
            version: input.version || pointer.version, receipts: receipts.concat([receipt]), revision: pointer ? pointer.revision : 0,
            active: input.operation !== 'WITHDRAW' };
        try {
            await SERVICE.DefaultProductPublicationPointerService.save({ tenant: request.tenant, authData: request.authData, model: model });
        } catch (error) {
            pointer = await this.read('DefaultProductPublicationPointerService', code, request);
            const committed = pointer && pointer.receipts.find(item => item.operationKey === input.operationKey && item.fingerprint === fingerprint);
            if (!committed) throw error;
            return this.result(committed, pointer.active === false ? null : pointer.version, true);
        }
        pointer = await this.read('DefaultProductPublicationPointerService', code, request);
        const committed = pointer && pointer.receipts.find(item => item.operationKey === input.operationKey && item.fingerprint === fingerprint);
        if (!committed) throw new Error('Product activation receipt not acknowledged');
        return this.result(committed, pointer.active === false ? null : pointer.version, false);
    },
    /** Returns the qualified nPublish receipt envelope without losing original predecessor lineage. */
    result: function (receipt, activeVersion, replayed) {
        return { version: receipt.targetVersion, receipt: receipt, previousOnlineVersion: receipt.previousOnlineVersion,
            activeVersion: activeVersion, replayed: replayed };
    },
    /** Publishes only after hidden preparation using nPublish's retained expected pointer over retries. */
    deploy: async function (input, request) {
        await this.prepare(input, request);
        return this.switchVersion({ scope: input.manifest.scope, version: input.manifest.version,
            expectedVersion: input.expectedVersion, operation: 'ACTIVATE', operationKey: input.operationKey,
            publicationCode: input.publicationCode, sourceVersion: input.sourceVersion }, request);
    },
    /** Restores retained catalogue content only; operational state is never captured or restored. */
    rollback: function (input, request) { return this.switchVersion(Object.assign({}, input, { operation: 'ROLLBACK' }), request); },
    /** Removes customer visibility with the same single-record CAS, retaining the prior version and all receipts. */
    withdraw: function (input, request) { return this.switchVersion(Object.assign({}, input, { operation: 'WITHDRAW', version: '' }), request); },
    /** Resolves bounded active versions for customer search, with no fallback to prepared/latest rows. */
    activeVersions: async function (request) {
        this.assertOnline();
        const limit = this.manifests().policy().maximumActiveProducts;
        if (!request.tenant || !request.storeCode || !Number.isSafeInteger(limit) || limit < 1) throw new Error('Product active selection is invalid');
        const query = { tenant: request.tenant, storeCode: request.storeCode, active: true };
        if (request.productCode) query.productCode = request.productCode;
        const response = await SERVICE.DefaultProductPublicationPointerService.get({ tenant: request.tenant, authData: request.authData,
            query: query, searchOptions: { limit: limit + 1, pageSize: limit + 1 } });
        if (!response || !Array.isArray(response.result) || response.result.length > limit ||
            (Number.isFinite(response.count) && response.count > limit) || response.result.some(row =>
                row.tenant !== request.tenant || row.storeCode !== request.storeCode || !/^[a-f0-9]{64}$/.test(row.version))) {
            throw new Error('Product active selection is incomplete or invalid');
        }
        return response.result.map(row => row.version);
    }
};
