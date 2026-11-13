/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module editorial/test/editorialDraftCommands @description Composes actual draft commands, schema normalization and source validation with scoped generated-model/atomic-store ports. @layer test @owner editorial @override Preserve rollback, original actor, exact revisions and inspection without replay. */
const assert = require('node:assert/strict');
const { test, beforeEach } = require('node:test');
const commands = require('../src/service/defaultEditorialDraftCommandService');
const authoring = require('../src/service/defaultEditorialArticleAuthoringService');
const validation = require('../src/service/defaultEditorialValidationService');
const readiness = require('../src/service/defaultEditorialReadinessService');
const utility = require('../../../../nodics.foundation/modules/nDatabase/database/src/service/schema/defaultSchemaUtilityService');
const updateOwner = require('../../../../nodics.foundation/modules/nDatabase/database/src/service/procs/update/defaultModelsUpdateInitializerService');
const raw = require('../src/schemas/schemas').editorial;
let store, working, token, writes, failAt, zeroAt, publication, settings, referenceEnterprise, transactionStart;
const auth = { principalType: 'human', tokenType: 'access', type: 'Employee', tenant: 'tenant-a',
    enterpriseCode: 'acme', principalId: 'employee-a', loginId: 'editor@example.test',
    userGroups: ['employeeUserGroup'], permissions: ['editorial.backoffice.manage', 'editorial.backoffice.read'] };
const key = '057-original-command-reference';
const request = body => ({ tenant: 'tenant-a', authData: structuredClone(auth), authorization: 'Bearer original-token',
    httpRequest: { headers: { 'idempotency-key': key } }, editorial: { ...body, commandId: key } });
const saveInput = () => ({ article: { code: 'story', revision: 1 }, changes: { internalName: 'New working title' },
    localization: { localeCode: 'en', changes: { title: 'New saved headline' } } });
const matches = (row, query) => Object.entries(query).every(([name, value]) => value && typeof value === 'object'
    ? Array.isArray(value.$in) ? value.$in.includes(row[name]) : '$exists' in value ? Object.hasOwn(row, name) === value.$exists : false
    : row[name] === value);

beforeEach(() => {
    store = { articles: [{ code: 'story', active: true, revision: 1, status: 'DRAFT', contentTypeCode: 'NEWS',
        internalName: 'Saved working title', slug: 'story', siteCodes: ['website'], authorCodes: ['writer'] }],
    locales: [{ code: 'story-en', articleCode: 'story', localeCode: 'en', active: true, revision: 1, status: 'READY',
        title: 'Saved headline', slug: 'story', body: { blocks: [{ type: 'paragraph', text: 'Saved story copy.' }] } }] };
    writes = []; working = undefined; token = undefined; failAt = 0; zeroAt = 0; publication = undefined; referenceEnterprise = 'acme'; transactionStart = undefined;
    settings = structuredClone(require('../config/properties').editorial);
    settings.publication.runtimeRole = 'STAGED';
    global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message); this.code = code; } } };
    global.CONFIG = { get: name => ({ editorial: settings, runtimeRole: { publication: 'STAGED' },
        schemaApi: require('../../../../nodics.foundation/modules/nDatabase/database/config/properties').schemaApi })[name] };
    global.NODICS = { getModule: () => ({ rawSchema: raw }), isModuleActive: () => true, getActiveModules: () => ['editorial', 'cms'] };
    const state = r => {
        assert.equal(r.tenant, 'tenant-a');
        assert.ok(['employee-a', 'employee-b'].includes(r.authData.principalId));
        if (r.transactionContext) { assert.equal(r.transactionContext, token); return working; }
        return store;
    };
    const read = collection => async r => ({ code: 'SUC_FIND_00000', result: structuredClone(state(r)[collection].filter(row => matches(row, r.query))) });
    const changed = r => {
        writes.push(r);
        if (writes.length === failAt) throw new Error('injected generated write failure');
        return { code: 'SUC_UPD_00000', result: { modifiedCount: writes.length === zeroAt ? 0 : 1 } };
    };
    const update = collection => async r => {
        const rows = state(r)[collection], index = rows.findIndex(row => matches(row, r.query));
        if (index < 0) return { code: 'SUC_UPD_00000', result: { modifiedCount: 0 } };
        const set = r.model.$set || r.model;
        rows[index] = { ...rows[index], ...structuredClone(set) };
        for (const field of Object.keys(r.model.$unset || {})) delete rows[index][field];
        return changed(r);
    };
    const save = collection => async r => {
        const rows = state(r)[collection];
        assert.equal(r.options.insertOnly, true);
        assert.ok(!rows.some(row => row.code === r.model.code));
        rows.push(structuredClone(r.model)); changed(r);
        return { code: 'SUC_SAVE_00000', result: structuredClone(r.model) };
    };
    global.SERVICE = {
        ...require('./helpers/editorialOwnerServices.js'),
        DefaultSecuredRequestPipelineService: { getEffectiveUserGroupCodes: groups => groups,
            getGrantedPermissions: r => r.authData.permissions, isPermissionGranted: (permission, permissions) => permissions.includes(permission) },
        DefaultSchemaUtilityService: utility, DefaultModelsUpdateInitializerService: updateOwner,
        DefaultEditorialDraftCommandService: commands, DefaultEditorialArticleAuthoringService: authoring,
        DefaultEditorialValidationService: validation, DefaultEditorialReadinessService: readiness,
        DefaultEditorialArticleService: { get: read('articles'), update: update('articles'), save: save('articles') },
        DefaultEditorialArticleLocalizationService: { get: read('locales'), update: update('locales'), save: save('locales') },
        DefaultEditorialContentTypeService: { get: async r => {
            assert.equal(r.transactionContext, undefined, 'reference policy is not part of the copy transaction');
            return { code: 'SUC_FIND_00000', result: [{ code: 'NEWS', active: true, requiredLocaleCodes: ['en'], workflowDefinitionCode: 'editorialApproval' }] };
        } },
        DefaultCmsSiteService: { get: async r => {
            assert.equal(r.transactionContext, undefined);
            return { code: 'SUC_FIND_00000', result: [{ code: 'website', active: true, enterpriseCode: referenceEnterprise }] };
        } },
        DefaultEditorialAuthorService: { get: async () => ({ code: 'SUC_FIND_00000', result: [{ code: 'writer', active: true, status: 'ACTIVE' }] }) },
        DefaultPublicationLifecycleService: { get: async () => structuredClone(publication) },
        DefaultEditorialOnlineProjectionService: { getDeployment: async () => ({ status: 'NONE', revision: 0 }) },
        DefaultDatabaseTransactionService: { execute: async (scope, work) => {
            assert.deepEqual(scope, { moduleName: 'editorial', tenant: 'tenant-a' });
            transactionStart?.(); working = structuredClone(store); token = Object.freeze({ opaque: true });
            try { const result = await work(token); store = working; return result; }
            finally { working = undefined; token = undefined; }
        } }
    };
});

test('owner creation supplies governance state and exact original-key retry cannot overwrite another record', async () => {
    const input = { model: { code: 'new-story', contentTypeCode: 'NEWS', internalName: 'New story', slug: 'new-story', siteCodes: ['website'], authorCodes: ['writer'] } };
    const created = await commands.create(request(input));
    assert.equal(created.status, 'DRAFT'); assert.equal(created.revision, 1); assert.equal(created.active, true);
    assert.equal(created.lastAuthoringCommand, undefined); assert.equal(created.workflowInstanceCode, undefined);
    assert.deepEqual(await commands.create(request(input)), created); assert.equal(writes.length, 1);
    const changed = request({ model: { ...input.model, internalName: 'Different copy' } });
    await assert.rejects(commands.create(changed), e => e.code === 'ERR_EDT_00008');
    const other = request(input); other.authData.principalId = 'employee-b';
    await assert.rejects(commands.create(other), e => e.code === 'ERR_EDT_00008');
    assert.equal(writes.length, 1);
});

test('managed fields, foreign scope, inactive policy and absent original employee authority cannot create', async () => {
    const model = { code: 'new-story', contentTypeCode: 'NEWS', internalName: 'Story', slug: 'story', siteCodes: ['website'], authorCodes: ['writer'] };
    for (const field of ['status', 'revision', 'workflowInstanceCode', 'publicationCode', 'publicationIntent', 'decisionEvidence', 'accessGroups']) {
        await assert.rejects(commands.create(request({ model: { ...model, [field]: 'forged' } })));
    }
    referenceEnterprise = 'foreign'; await assert.rejects(commands.create(request({ model })), e => e.code === 'ERR_AUTH_00003');
    referenceEnterprise = 'acme';
    const r = request({ model }); r.authData.principalType = 'service';
    await assert.rejects(commands.create(r), e => e.code === 'ERR_AUTH_00003');
    SERVICE.DefaultEditorialContentTypeService.get = async () => ({ code: 'SUC_FIND_00000', result: [] });
    await assert.rejects(commands.create(request({ model })), e => e.code === 'ERR_EDT_00007');
    assert.equal(writes.length, 0);
});

test('one atomic save advances root and every locale, clears old review correlation and returns actual saved copy', async () => {
    store.articles[0].workflowInstanceCode = 'old-review'; store.articles[0].decisionEvidence = { action: 'REJECT' };
    store.locales.push({ code: 'story-ar', articleCode: 'story', localeCode: 'ar', revision: 1, status: 'DRAFT' });
    const result = await commands.saveDraft(request(saveInput()));
    assert.equal(result.outcome, 'SAVED_DRAFT'); assert.equal(result.fromRevision, 1); assert.equal(result.toRevision, 2);
    assert.equal(result.commandId, key); assert.equal(result.article.status, 'DRAFT');
    assert.equal(result.article.workflowInstanceCode, undefined); assert.equal(result.article.decisionEvidence, undefined);
    assert.equal(result.article.internalName, 'New working title'); assert.equal(result.article.lastAuthoringCommand, undefined);
    assert.ok(result.localizations.every(row => row.revision === 2));
    assert.equal(result.localizations.find(row => row.localeCode === 'ar').status, 'DRAFT');
    assert.equal(store.articles[0].lastAuthoringCommand.fromRevision, 1);
    assert.equal(new Set(writes.map(row => row.transactionContext)).size, 1);
    assert.ok(writes.every(row => row.transactionContext && row.authData.principalId === 'employee-a'));
});

test('any failure or zero acknowledgement rolls back the whole master/localization command', async () => {
    const original = structuredClone(store);
    for (const position of [1, 2]) for (const zero of [false, true]) {
        store = structuredClone(original); writes = []; failAt = zero ? 0 : position; zeroAt = zero ? position : 0;
        await assert.rejects(commands.saveDraft(request(saveInput())));
        assert.deepEqual(store, original, 'no partial master/copy revision escapes an aborted transaction');
    }
});

test('new incomplete locale stays draft and required-locale readiness never treats it as publishable copy', async () => {
    const input = saveInput(); input.localization = { localeCode: 'ar', changes: { title: 'مسودة' } };
    const result = await commands.saveDraft(request(input));
    const arabic = result.localizations.find(row => row.localeCode === 'ar');
    assert.equal(arabic.status, 'DRAFT'); assert.equal(arabic.revision, 2);
    assert.equal(arabic.articleCode, 'story'); assert.match(arabic.code, /^editorial-locale-/);
    const evidence = validation.validate(result.article, result.localizations, { requiredLocaleCodes: ['en'] });
    assert.equal(evidence.valid, true); assert.equal(evidence.warnings[0].code, 'DRAFT_LOCALIZATION_EXCLUDED');
    assert.equal(validation.validate(result.article, result.localizations, { requiredLocaleCodes: ['en', 'ar'] }).valid, false);
});

test('stale, concurrent and in-review sources fail without losing a newer decision or revision', async () => {
    store.articles[0].status = 'IN_REVIEW'; await assert.rejects(commands.saveDraft(request(saveInput())));
    store.articles[0].status = 'DRAFT'; store.articles[0].revision = 2;
    await assert.rejects(commands.saveDraft(request(saveInput())));
    store.articles[0].revision = 1;
    transactionStart = () => { store.articles[0].revision = 2; store.articles[0].internalName = 'Concurrent saved name'; };
    await assert.rejects(commands.saveDraft(request(saveInput())));
    assert.equal(store.articles[0].revision, 2); assert.equal(store.articles[0].internalName, 'Concurrent saved name');
    assert.equal(writes.length, 0);
});

test('editing retains an exact old publication reference without publishing or changing its state', async () => {
    store.articles[0].status = 'PUBLISHED'; store.articles[0].publicationCode = 'publication-1';
    publication = { code: 'publication-1', domain: 'editorial', rootType: 'article', rootCode: 'story', sourceVersion: '1', state: 'ONLINE' };
    const result = await commands.saveDraft(request(saveInput()));
    assert.equal(result.article.revision, 2); assert.equal(result.article.status, 'DRAFT');
    assert.equal(result.article.publicationCode, 'publication-1'); assert.equal(result.article.publicationSourceRevision, 1);
    assert.equal(publication.state, 'ONLINE');
    const next = saveInput(); next.article.revision = 2;
    await commands.saveDraft(request(next));
    assert.equal(store.articles[0].revision, 3); assert.equal(store.articles[0].publicationSourceRevision, 1);
});

test('inspection is original-actor read evidence, never command replay or proof that absence means not committed', async () => {
    await commands.saveDraft(request(saveInput())); const count = writes.length;
    const input = { article: { code: 'story', revision: 1 }, commandId: key };
    const inspected = await commands.inspectCommand(request(input));
    assert.equal(inspected.outcome, 'SAVED_DRAFT'); assert.equal(inspected.toRevision, 2);
    const other = request(input); other.authData.principalId = 'employee-b';
    assert.equal((await commands.inspectCommand(other)).outcome, 'UNKNOWN');
    store.articles[0].status = 'READY';
    assert.equal((await commands.inspectCommand(request(input))).outcome, 'SAVED_BUT_CHANGED');
    assert.equal(writes.length, count);
});

test('archive refuses an Online retained copy and preserves history after actual withdrawal', async () => {
    store.articles[0].publicationCode = 'publication-1';
    publication = { code: 'publication-1', domain: 'editorial', rootType: 'article', rootCode: 'story', sourceVersion: '1', state: 'ONLINE' };
    const input = { article: { code: 'story', revision: 1 } };
    await assert.rejects(commands.archive(request(input)), /Withdraw/);
    assert.equal(writes.length, 0); publication.state = 'WITHDRAWN';
    const result = await commands.archive(request(input));
    assert.equal(result.outcome, 'ARCHIVED'); assert.equal(result.article.status, 'ARCHIVED');
    assert.equal(result.article.publicationCode, 'publication-1'); assert.equal(store.locales.length, 1);
    assert.equal((await commands.inspectCommand(request(input))).outcome, 'ARCHIVED');
});

test('workspace reports current exact locales, configured copy and denied edit operations without writes', async () => {
    const r = request({ articleCode: 'story', locale: 'ar' }); r.authData.permissions = ['editorial.backoffice.read'];
    const result = await commands.workspace(r);
    assert.equal(result.article.revision, 1); assert.equal(result.localizations.length, 1);
    assert.deepEqual(result.operations, []); assert.equal(result.presentation.saveLabel, 'حفظ المسودة');
    assert.equal(result.article.lastAuthoringCommand, undefined); assert.equal(writes.length, 0);
});

test('retained publication intent blocks copy/archive and workspace exposes inspection only while preserving the old Online reference', async () => {
    store.articles[0].status = 'APPROVED';
    store.articles[0].publicationCode = 'older-online'; store.articles[0].publicationSourceRevision = 1;
    store.articles[0].publicationIntent = { contractVersion: 1, code: 'next-publication', sourceRevision: 1 };
    const before = structuredClone(store);
    await assert.rejects(commands.saveDraft(request(saveInput())));
    await assert.rejects(commands.archive(request({ article: { code: 'story', revision: 1 } })));
    const result = await commands.workspace(request({ articleCode: 'story' }));
    assert.deepEqual(result.operations, ['INSPECT']); assert.equal(result.article.publicationIntent.code, 'next-publication');
    assert.equal(result.article.publicationCode, 'older-online');
    assert.deepEqual(store, before); assert.equal(writes.length, 0);
});

test('publication claim that wins after initial copy read fences the atomic revision before any locale write', async () => {
    store.articles[0].status = 'APPROVED';
    transactionStart = () => { store.articles[0].publicationIntent = { contractVersion: 1, code: 'publication', sourceRevision: 1 }; };
    await assert.rejects(commands.saveDraft(request(saveInput())));
    assert.equal(store.articles[0].revision, 1); assert.equal(store.locales[0].revision, 1);
    assert.equal(store.articles[0].publicationIntent.code, 'publication'); assert.equal(writes.length, 0);
});

test('workspace and archive distinguish a restored deployment from the latest rolled-back request', async () => {
    store.articles[0].publicationCode = 'latest-request';
    publication = { code: 'latest-request', domain: 'editorial', rootType: 'article', rootCode: 'story', sourceVersion: '1', state: 'ROLLED_BACK' };
    const deployed = { status: 'DEPLOYED', code: 'earlier-request', sourceRevision: 1, version: 'earlier-en', activationKey: 'earlier-key', revision: 3 };
    SERVICE.DefaultEditorialOnlineProjectionService.getDeployment = async () => deployed;
    const workspace = await commands.workspace(request({ articleCode: 'story' }));
    assert.deepEqual(workspace.deployment, deployed); assert.equal(workspace.article.publicationCode, 'latest-request');
    assert.equal(workspace.operations.includes('ARCHIVE'), false);
    await assert.rejects(commands.archive(request({ article: { code: 'story', revision: 1 } })), /no copy is deployed/);
    assert.equal(writes.length, 0);
    SERVICE.DefaultEditorialOnlineProjectionService.getDeployment = async () => { throw new Error('Target unavailable'); };
    const unknown = await commands.workspace(request({ articleCode: 'story' }));
    assert.deepEqual(unknown.deployment, { status: 'UNKNOWN' }); assert.equal(unknown.operations.includes('SAVE'), true);
    assert.equal(unknown.operations.includes('ARCHIVE'), false); assert.equal(unknown.localizations.length, 1);
    await assert.rejects(commands.archive(request({ article: { code: 'story', revision: 1 } })), /Target unavailable/);
});


test('workspace projects configured Media purpose and localized inert copy without storage authority or edit grants', async () => {
    settings.authoring.mediaIntake.contextCode = 'projectImagePurpose';
    settings.authoring.mediaIntake.presentation.ar.providerSecret = 'never-project';
    settings.authoring.mediaIntake.presentation.ar.title = 'صورة مخصصة';
    const r = request({ articleCode: 'story', locale: 'ar' }); r.authData.permissions = ['editorial.backoffice.read'];
    const result = await commands.workspace(r);
    assert.equal(result.mediaIntake.contractVersion, 1);
    assert.equal(result.mediaIntake.contextCode, 'projectImagePurpose');
    assert.equal(result.mediaIntake.presentation.title, 'صورة مخصصة');
    assert.equal(result.mediaIntake.presentation.providerSecret, undefined);
    assert.equal(result.mediaIntake.folderCode, undefined);
    assert.deepEqual(result.operations, []); assert.equal(writes.length, 0);
    settings.authoring.mediaIntake.contextCode = '../folder';
    assert.equal((await commands.workspace(r)).mediaIntake, undefined);
});
