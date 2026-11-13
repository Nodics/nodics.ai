/*
    Nodics - Enterprise Micro-Services Management Framework
    Copyright (c) 2026 Nodics All rights reserved.
    Governed by the root LICENSE or a separate written agreement with Nodics.
 */

/** @module editorial/test/helpers/editorialOnlineTargetFixture @description Independent transactional generated-service ports for Editorial Online target failure/concurrency tests; no runtime or customer database access. @layer test @owner editorial */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const target = require('../../src/service/defaultEditorialPublicationTargetService');
const counts = require('../../../../../nodics.foundation/modules/nDatabase/database/src/service/procs/update/defaultModelsUpdateInitializerService');
const concurrency = require('../../../../../nodics.foundation/modules/nDatabase/database/src/service/schema/defaultModelConcurrencyService');
const saveInitializer = require('../../../../../nodics.foundation/modules/nDatabase/database/src/service/procs/save/defaultModelSaveInitializerService');
const receiptSchema = require('../../src/schemas/schemas').editorial.editorialPublicationReceipt;

/** Creates inert DTOs independently of the target implementation's normalization and digest helpers. */
function projection(articleCode, revision, localeCode, slug = 'shared-story') {
    const payload = { articleCode, contentTypeCode: 'NEWS', siteCode: 'exampleSite', localeCode, slug,
        title: 'Story revision ' + revision, summary: 'Approved copy', body: { blocks: [{ type: 'paragraph', text: 'Saved ' + localeCode + ' copy' }] } };
    return { code: [articleCode, 'exampleSite', localeCode, revision].join('-'), active: true,
        accessGroups: ['serviceAccountUserGroup', 'userGroup'], description: 'Approved immutable projection',
        articleCode, contentTypeCode: 'NEWS', siteCode: 'exampleSite', localeCode, slug, payload,
        sourceRevision: revision, sourceHash: crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex'),
        status: 'CURRENT', publishedAt: new Date('2026-11-04T00:00:00.000Z') };
}

/** Supplies snapshot isolation, per-record optimistic commit fencing and generated owner acknowledgements using Maps only. */
function fixture(t) {
    const original = { CONFIG: global.CONFIG, SERVICE: global.SERVICE, CLASSES: global.CLASSES };
    t.after(() => Object.assign(global, original));
    const configured = structuredClone(require('../../config/properties').editorial);
    configured.publication.runtimeRole = 'ONLINE';
    configured.publication.targetTransportProvider = null;
    const authData = Object.freeze({ principalId: 'scoped-test-runtime', tenant: 'testTenant' });
    const state = { projections: new Map(), receipts: new Map(), versions: new Map(), writes: [], calls: [],
        beforeCommit: undefined, fault: undefined, loseCommitResponse: false, publicationEnabled: false, capabilities: true };
    const contexts = new WeakMap();
    const cloneMap = map => new Map([...map].map(([key, value]) => [key, structuredClone(value)]));
    const match = (row, query) => Object.entries(query).every(([field, expected]) =>
        expected && typeof expected === 'object' && '$in' in expected ? expected.$in.includes(row[field]) : row[field] === expected);
    const context = (request, store, operation) => {
        assert.equal(request.tenant, 'testTenant', 'original target tenant survives');
        assert.equal(request.authData, authData, 'target service does not substitute principal authority');
        const current = contexts.get(request.transactionContext);
        assert(current, 'every generated operation uses the live opaque transaction context');
        state.calls.push({ store, operation, query: structuredClone(request.query), model: structuredClone(request.model) });
        return current;
    };
    const fault = (store, operation, request, row, response) => state.fault ? state.fault({ store, operation, request, row, response }) || response : response;
    // Compose the actual database managed-save/CAS owner, including its different save/update response shapes.
    // Only the final provider primitives below are Maps; the target cannot invent insert-only managed admission.
    const receiptModel = request => ({
        rawSchema: receiptSchema, primaryKey: 'code',
        getItems: async input => {
            const current = context(input, 'receipts', 'managed-read');
            return structuredClone([...current.receipts.values()].filter(row => match(row, input.query)));
        },
        compareAndSetItem: async input => {
            const current = contexts.get(input.transactionContext);
            assert(current, 'managed CAS preserves the opaque local transaction');
            let row;
            if (input.operation === 'create') {
                if (current.receipts.has(input.model.code)) throw new Error('Duplicate generated identity');
                row = structuredClone(input.model);
            } else {
                const previous = [...current.receipts.values()].find(item => match(item, input.query));
                if (!previous) return null;
                row = { ...previous, ...structuredClone(input.model) };
            }
            current.receipts.set(row.code, row); current.changed.add('receipts:' + row.code);
            state.writes.push({ store: 'receipts', operation: input.operation === 'create' ? 'save' : 'update', code: row.code });
            return structuredClone(row);
        }
    });
    const port = store => ({
        get: async request => {
            const current = context(request, store, 'get');
            const rows = [...current[store].values()].filter(row => match(row, request.query));
            return fault(store, 'get', request, undefined, { code: 'SUC_FIND_00000', result: structuredClone(rows.slice(0, request.searchOptions.limit)) });
        },
        save: async request => {
            const current = context(request, store, 'save');
            if (store === 'receipts') {
                const prepared = { ...request, schemaModel: receiptModel(request) };
                concurrency.initializeSave(prepared);
                const row = await saveInitializer.persistModel(prepared);
                return fault(store, 'save', request, row, { code: 'SUC_SAVE_00000', result: row });
            }
            assert.equal(request.options.insertOnly, true, 'new target records never silently overwrite existing identity');
            if (current[store].has(request.model.code)) throw new Error('Duplicate generated identity');
            const row = structuredClone(request.model);
            current[store].set(row.code, row); current.changed.add(store + ':' + row.code);
            state.writes.push({ store, operation: 'save', code: row.code });
            return fault(store, 'save', request, row, { code: 'SUC_SAVE_00000', result: structuredClone(row) });
        },
        update: async request => {
            const current = context(request, store, 'update');
            if (store === 'receipts') {
                const result = await concurrency.execute({ ...request, schemaModel: receiptModel(request) }, 'update');
                const row = current.receipts.get(request.model.code);
                return fault(store, 'update', request, row, { code: 'SUC_UPD_00000', result });
            }
            const previous = [...current[store].values()].find(row => match(row, request.query));
            let row;
            if (previous) {
                row = { ...previous, ...structuredClone(request.model) };
                current[store].set(row.code, row); current.changed.add(store + ':' + row.code);
                state.writes.push({ store, operation: 'update', code: row.code });
            }
            return fault(store, 'update', request, row, { code: 'SUC_UPD_00000', result: { modifiedCount: previous ? 1 : 0 } });
        }
    });
    global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message); this.code = code; } } };
    global.CONFIG = { get: name => name === 'editorial' ? configured : name === 'publishEnabled' ? state.publicationEnabled : undefined };
    global.SERVICE = {
        ...require('./editorialOwnerServices.js'),
        DefaultModelsUpdateInitializerService: counts,
        DefaultModelConcurrencyService: concurrency,
        DefaultEditorialOnlineArticleService: port('projections'),
        DefaultEditorialPublicationReceiptService: port('receipts'),
        DefaultDatabaseTransactionService: {
            capabilities: () => ({ multiRecordAtomic: state.capabilities, contextPropagation: state.capabilities }),
            execute: async (input, work) => {
                assert.deepEqual(input, { moduleName: 'editorial', tenant: 'testTenant' });
                const token = Object.freeze({});
                const snapshot = { projections: cloneMap(state.projections), receipts: cloneMap(state.receipts), versions: new Map(state.versions), changed: new Set() };
                contexts.set(token, snapshot);
                try {
                    const result = await work(token);
                    if (state.beforeCommit) await state.beforeCommit(snapshot);
                    for (const key of snapshot.changed) if ((state.versions.get(key) || 0) !== (snapshot.versions.get(key) || 0)) throw new Error('Transactional pointer/identity commit conflict');
                    for (const key of snapshot.changed) {
                        const colon = key.indexOf(':'), store = key.slice(0, colon), code = key.slice(colon + 1);
                        state[store].set(code, structuredClone(snapshot[store].get(code)));
                        state.versions.set(key, (state.versions.get(key) || 0) + 1);
                    }
                    if (state.loseCommitResponse && snapshot.changed.size) {
                        state.loseCommitResponse = false;
                        throw new Error('Commit response unavailable after atomic commit');
                    }
                    return result;
                } finally { contexts.delete(token); }
            }
        }
    };
    const request = input => ({ tenant: 'testTenant', authData, correlationId: 'test-correlation', editorialPublicationTarget: input });
    const publish = (articleCode, revision, previous = { version: null, revision: 0 }, code = 'publication-' + articleCode + '-r' + revision, slugs) => {
        const publication = { code, domain: 'editorial', rootType: 'article', rootCode: articleCode, sourceVersion: String(revision), state: 'ACTIVATING', revision: 5,
            activationOperation: { key: code + ':activate:5', previousOnlineVersion: previous.version, previousOnlineRevision: previous.revision } };
        return { publication, projections: ['en', 'ar'].map(locale => projection(articleCode, revision, locale, slugs?.[locale] || 'shared-' + locale)), operationKey: publication.activationOperation.key };
    };
    const commandPublication = (input, operation, targetVersion, revision = 6) => {
        const publication = { ...input.publication, revision, state: operation === 'ROLLBACK' ? 'ROLLING_BACK' : 'WITHDRAWING', targetVersion: input.result.version,
            ...(operation === 'ROLLBACK' ? { previousOnlineVersion: targetVersion } : {}) };
        publication.targetCommandOperation = { contractVersion: 1, operation, operationKey: publication.code + (operation === 'ROLLBACK' ? ':rollback:' : ':withdraw:') + String(revision),
            publicationCode: publication.code, domain: publication.domain, rootType: publication.rootType, rootCode: publication.rootCode, sourceVersion: publication.sourceVersion,
            activationKey: publication.activationOperation.key, targetVersionHash: crypto.createHash('sha256').update(JSON.stringify(targetVersion || input.result.version)).digest('hex'), originRevision: revision };
        return publication;
    };
    return { state, configured, request, publish, projection, target, commandPublication,
        snapshot: () => structuredClone({ projections: [...state.projections.values()], receipts: [...state.receipts.values()] }),
        status: articleCode => target.status(request({ articleCode })),
        deploy: input => target.deploy(request(input)),
        withdraw: input => target.withdraw(request({ publication: commandPublication(input, 'WITHDRAWAL'), operationKey: input.publication.code + ':withdraw:6' })),
        rollback: (input, previousVersion) => target.rollback(request({ publication: commandPublication(input, 'ROLLBACK', previousVersion), targetVersion: previousVersion, operationKey: input.publication.code + ':rollback:6' })) };
}

module.exports = { fixture, projection };
