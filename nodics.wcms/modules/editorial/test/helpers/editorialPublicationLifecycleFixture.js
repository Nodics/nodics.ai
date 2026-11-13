/*
    Nodics - Enterprise Micro-Services Management Framework
    Copyright (c) 2026 Nodics All rights reserved.
    Governed by the root LICENSE or a separate written agreement with Nodics.
 */
/** @module editorial/test/helpers/editorialPublicationLifecycleFixture @description Composes actual nPublish lifecycle, Editorial provider/adapter and transactional target/managed database owners with isolated repository/source/provider ports. No runtime, credentials or customer database is used. @layer test @owner editorial */
const assert = require('node:assert/strict');
const { fixture } = require('./editorialOnlineTargetFixture');
const lifecycle = require('../../../../../nodics.foundation/modules/nPublish/src/service/defaultPublicationLifecycleService');
const operations = require('../../../../../nodics.foundation/modules/nPublish/src/service/defaultPublicationOperationsService');
const versionProvider = require('../../src/service/defaultEditorialPublicationVersionProviderService');
const projection = require('../../src/service/defaultEditorialOnlineProjectionService');
const adapter = require('../../src/service/defaultEditorialPublicationAdapterService');

/** Uses real orchestration and target services; only storage/provider I/O and already-approved source fixtures are isolated. */
function lifecycleFixture(t) {
    const target = fixture(t), baseConfig = global.CONFIG;
    const config = structuredClone(require('../../../../../nodics.foundation/modules/nPublish/config/properties').publish);
    const state = { records: new Map(), sourceReads: 0, activations: 0, commands: [], hooks: [],
        loseResponses: { ROLLBACK: 0, WITHDRAWAL: 0 }, failHooks: { ROLLBACK: 0, WITHDRAWAL: 0 },
        corruptReceipt: undefined, loseTransition: undefined, siteCodes: ['exampleSite'] };
    const scoped = request => {
        assert.equal(request.tenant, 'testTenant');
        assert.equal(request.authData, target.request({}).authData, 'orchestration retains original tenant/principal');
    };
    const repository = {
        get: async (code, request) => { scoped(request); return structuredClone(state.records.get(code)); },
        create: async (model, request) => {
            scoped(request);
            if (!state.records.has(model.code)) state.records.set(model.code, structuredClone(model));
            const stored = state.records.get(model.code);
            for (const field of ['domain', 'rootType', 'rootCode', 'sourceVersion']) assert.equal(stored[field], model[field]);
            return structuredClone(stored);
        },
        appendAudit: async () => true,
        transitionWithAudit: async (publication, expected, patch, audit, request) => {
            scoped(request);
            const stored = state.records.get(publication.code);
            if (!stored || stored.revision !== expected || stored.state !== publication.state) throw new global.CLASSES.NodicsError('ERR_PUB_00004', 'Publication revision conflict');
            const revision = expected + 1;
            const updated = { ...stored, ...structuredClone(patch), revision,
                auditTrail: [...stored.auditTrail, { ...structuredClone(audit), revision }] };
            state.records.set(updated.code, updated);
            if (state.loseTransition === updated.state) { state.loseTransition = undefined; throw new Error('Transition acknowledgement lost'); }
            return structuredClone(updated);
        }
    };
    config.providers.repositoryProvider = 'FixturePublicationRepository';
    config.providers.domainAdapters.editorial = 'FixtureEditorialAdapter';
    config.providers.versionProviders.editorial = 'FixtureEditorialVersionProvider';
    global.CONFIG = { get: name => name === 'publish' ? config : baseConfig.get(name) };
    const wrappedProvider = { ...versionProvider,
        activate: async (publication, request) => { state.activations++; return versionProvider.activate(publication, request); }
    };
    for (const [method, kind] of [['rollback', 'ROLLBACK'], ['withdraw', 'WITHDRAWAL']]) {
        wrappedProvider[method] = async (publication, ...args) => {
            state.commands.push({ kind, revision: publication.revision, proof: structuredClone(publication.targetCommandOperation) });
            const result = await versionProvider[method](publication, ...args);
            if (state.loseResponses[kind] > 0) { state.loseResponses[kind]--; throw new Error('Target response lost after commit'); }
            if (typeof state.corruptReceipt === 'function') return state.corruptReceipt(result, kind);
            if (state.corruptReceipt === kind) return { ...result, receipt: { ...result.receipt, rootCode: 'foreign-root' } };
            return result;
        };
    }
    const wrappedAdapter = { ...adapter };
    for (const [method, kind] of [['afterRollback', 'ROLLBACK'], ['afterWithdraw', 'WITHDRAWAL']]) {
        wrappedAdapter[method] = async function (publication, result, request) {
            state.hooks.push({ kind, projectionCodes: result.projectionCodes });
            if (state.failHooks[kind] > 0) { state.failHooks[kind]--; throw new Error('Completion hook failed after commit'); }
            return adapter[method].call(this, publication, result, request);
        };
    }
    Object.assign(global.SERVICE, {
        FixturePublicationRepository: repository, FixtureEditorialVersionProvider: wrappedProvider, FixtureEditorialAdapter: wrappedAdapter,
        DefaultPublicationLifecycleService: lifecycle,
        DefaultEditorialPublicationVersionProviderService: wrappedProvider,
        DefaultEditorialOnlineProjectionService: projection,
        DefaultEditorialPublicationTargetService: target.target,
        DefaultEditorialArticleService: { get: async request => {
            scoped(request); state.sourceReads++;
            return { code: 'SUC_FIND_00000', result: [{ code: request.query.code, revision: request.query.revision,
                status: 'APPROVED', contentTypeCode: 'NEWS', slug: 'shared-story', siteCodes: [...state.siteCodes], authorCodes: [] }] };
        } },
        DefaultEditorialArticleLocalizationService: { get: async request => {
            scoped(request);
            return { code: 'SUC_FIND_00000', result: ['en', 'ar'].map(localeCode => ({
                code: request.query.articleCode + '-' + localeCode, articleCode: request.query.articleCode, localeCode,
                revision: request.query.revision, status: 'READY', slug: 'shared-story', title: 'Approved ' + localeCode + ' revision ' + request.query.revision,
                summary: 'Saved approved copy', body: { blocks: [{ type: 'paragraph', text: 'Immutable saved copy' }] }
            })) };
        } }
    });
    const request = (code, revision, extra = {}) => Object.assign(target.request({}), { publicationCode: code, expectedRevision: revision }, extra);
    const publish = revision => lifecycle.publishApproved(request(undefined, undefined, { publication: {
        code: 'publication-story-r' + revision, domain: 'editorial', rootType: 'article', rootCode: 'story', sourceVersion: String(revision), workflowRef: 'approved-fixture-r' + revision
    } }));
    const invoke = (kind, publication, expected = publication.revision) => lifecycle[kind === 'ROLLBACK' ? 'rollback' : 'withdraw'](request(publication.code, expected));
    return { target, config, state, provider: wrappedProvider, lifecycle, operations, request, publish, invoke,
        current: code => structuredClone(state.records.get(code)),
        recover: publication => operations.recover(request(publication.code, publication.revision)) };
}

module.exports = { lifecycleFixture };
