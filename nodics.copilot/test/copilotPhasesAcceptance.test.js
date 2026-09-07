/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const path = require('node:path');

const moduleRoot = path.join(__dirname, '..', 'modules');
const load = relative => require(path.join(moduleRoot, relative));

test('Phase 0-2: module identity, request context, and provider safety are explicit', async () => {
    const metadata = require('../package.json');
    assert.deepEqual(metadata.nodics.extends, ['nodics.foundation']);
    const requestService = load('copilotCore/src/service/defaultCopilotRequestService');
    assert.throws(() => requestService.normalize({ prompt: 'help' }), /COPILOT_REQUEST_CONTEXT_REQUIRED/);
    assert.equal(requestService.normalize({ tenant: 't1', actor: 'a1', prompt: ' help ' }).prompt, 'help');
    const providerService = load('copilotProviders/modules/copilotProvider/src/service/defaultCopilotProviderService');
    const providerConfiguration = load('copilotProviders/modules/copilotProvider/config/properties').copilot.providers;
    assert.throws(() => providerService.invoke({ messages: [{ role: 'user', content: 'hello' }] }, { configuration: providerConfiguration }), /COPILOT_PROVIDERS_DISABLED/);
    const mock = load('copilotProviders/modules/mockProvider/config/properties').copilot.providers.adapters.mock;
    const enabledConfiguration = Object.assign({}, providerConfiguration, { enabled: true, adapters: Object.assign({}, providerConfiguration.adapters, { mock: mock }) });
    const response = await providerService.invoke({ messages: [{ role: 'user', content: 'hello' }], mockResponse: 'ok' }, {
        configuration: enabledConfiguration,
        services: { DefaultCopilotMockProviderAdapterService: load('copilotProviders/modules/mockProvider/src/service/defaultCopilotMockProviderAdapterService') }
    });
    assert.equal(response.content, 'ok');
    const ollama = load('copilotProviders/modules/ollamaProvider/config/properties').copilot.providers.adapters.ollama;
    const switched = Object.assign({}, enabledConfiguration, { default: Object.assign({}, enabledConfiguration.default, { adapter: 'ollama' }), adapters: Object.assign({}, enabledConfiguration.adapters, { ollama: Object.assign({}, ollama, { enabled: true }) }) });
    const local = await providerService.invoke({ messages: [{ role: 'user', content: 'hello' }] }, { configuration: switched, services: { DefaultOllamaCopilotProviderAdapterService: { invoke: () => ({ model: 'qwen2.5-coder:7b', content: 'local' }) } } });
    assert.equal(local.provider, 'ollama');
    assert.equal(local.content, 'local');
});

test('mutation intent is intercepted for clarification before provider generation', () => {
    const requestService = load('copilotCore/src/service/defaultCopilotRequestService');
    const decision = requestService.assessMutationIntent('Create 10 iPhone Pro Max products.');
    assert.equal(decision.mutation, true);
    assert.equal(decision.ambiguous, true);
    assert.deepEqual(decision.missing, ['code prefix', 'catalog version', 'price book', 'currency', 'price']);
    const natural = 'Create 10 iPhone Pro Max products, code prefix IPM, catalog version electronics-staged, price book uae-retail, currency AED, price 4999';
    assert.equal(requestService.assessMutationIntent(natural).ambiguous, false);
    assert.deepEqual(requestService.parseProductCreateIntent(natural), { count: 10, name: 'iPhone Pro Max', codePrefix: 'IPM',
        catalogVersion: 'electronics-staged', priceBookCode: 'uae-retail', currency: 'AED', price: '4999' });
    assert.equal(requestService.assessMutationIntent('Explain how products work').mutation, false);
});

test('read intent routes live module questions and exports without confusing documentation help', () => {
    const requestService = load('copilotCore/src/service/defaultCopilotRequestService');
    assert.deepEqual(requestService.assessReadIntent('How many modules are available in Nodics?'), {
        type: 'LIVE_READ', operation: 'framework.modules.count', format: undefined
    });
    assert.deepEqual(requestService.assessReadIntent('Export the available Nodics modules to CSV'), {
        type: 'EXPORT', operation: 'framework.modules.list', format: 'csv'
    });
    assert.deepEqual(requestService.assessReadIntent('Why does Nodics use modules?'), { type: 'KNOWLEDGE' });
});

test('Phase 3-4: conversation records are tenant bound and API routes are secured', () => {
    const conversations = load('copilotConversation/src/service/defaultCopilotConversationService');
    const record = conversations.createRecord({ tenant: 't1', actor: 'a1', channel: 'axis' }, 'c1');
    assert.equal(conversations.createMessage(record, 'user', 'hello', 1).tenant, 't1');
    const routes = load('copilotApi/src/router/routers');
    assert.equal(routes.copilotApi.conversations.create.secured, true);
    assert.equal(routes.copilotApi.turns.submit.permission, 'copilot.assistant.use');
    assert.equal(routes.copilotApi.turns.stream.responseHandler, 'copilotSseResponseHandler');
});

test('conversation titles describe the first request without exposing internal identifiers', async () => {
    const conversations = load('copilotConversation/src/service/defaultCopilotConversationService');
    conversations.state = { conversations: new Map(), turns: new Map(), messages: new Map(), events: new Map(), idempotency: new Map() };
    const configuration = { storage: 'VOLATILE_LOCAL', allowVolatileLocalStorage: true };
    const request = { tenant: 'default', authData: { loginId: 'admin' } };
    const conversation = await conversations.create(request, configuration);
    await conversations.acceptTurn(conversation, Object.assign({}, request, {
        idempotencyKey: 'descriptive-title-1',
        message: '  Explain   how Nodics framework modules work for a new developer  '
    }), configuration);
    assert.equal(conversation.title, 'Explain how Nodics framework modules work for a new developer');
    assert.equal((await conversations.listOwned(request, configuration)).items[0].title, conversation.title);
    assert.equal(conversations.titleFromMessage('x'.repeat(80)).length, 64);
});

test('Axis capability is module owned and API responses use the standard data envelope', async () => {
    const capability = load('copilotApi/src/service/defaultCopilotBackofficeCapabilityService');
    const metadata = capability.getCapability();
    assert.equal(metadata.navigation[0].id, 'assistant');
    assert.deepEqual(metadata.requiredPermissions, ['copilot.assistant.use']);
    global.SERVICE = { DefaultCopilotOrchestrationService: { createConversation: () => ({ conversation: { conversationCode: 'c1' } }) } };
    try {
        const facade = load('copilotApi/src/facade/defaultCopilotFacade');
        assert.deepEqual(await facade.createConversation({}), { code: 'SUC_SYS_00000', data: { conversation: { conversationCode: 'c1' } } });
    } finally {
        delete global.SERVICE;
    }
});

test('Axis turns retrieve authorized evidence before invoking the provider and preserve citations', async () => {
    const orchestration = load('copilotCore/src/service/defaultCopilotOrchestrationService');
    const conversations = load('copilotConversation/src/service/defaultCopilotConversationService');
    const originalService = global.SERVICE;
    const originalConfig = global.CONFIG;
    let providerRequest;
    const citation = { id: 'source-1', title: 'Nodics Framework', source: 'nodics.ai:README.md', sourceType: 'README' };
    conversations.state = { conversations: new Map(), turns: new Map(), messages: new Map(), events: new Map(), idempotency: new Map() };
    global.CONFIG = { get: () => ({
        core: { enabled: true, maximumMessageCharacters: 32000, systemPrompt: 'Nodics system prompt' },
        api: { enabled: true }, conversation: { storage: 'VOLATILE_LOCAL', allowVolatileLocalStorage: true },
        knowledge: { retrieval: { enabled: true, defaultSize: 5 } }, providers: { enabled: true }
    }) };
    global.SERVICE = {
        DefaultCopilotConversationService: conversations,
        DefaultCopilotRequestService: load('copilotCore/src/service/defaultCopilotRequestService'),
        DefaultCopilotKnowledgeRuntimeService: { search: async () => ({
            evidence: [{ id: 'source-1', title: 'Nodics Framework', excerpt: 'Nodics is a modular enterprise application framework.' }],
            citations: [citation], insufficientEvidence: false
        }) },
        DefaultCopilotProviderService: { invoke: async request => {
            providerRequest = request;
            return { content: 'Nodics is a modular framework [source-1].', usage: {}, finishReason: 'complete' };
        } }
    };
    try {
        const identity = { tenant: 'default', authData: { loginId: 'admin', permissions: ['copilot.knowledge.internal.read'] } };
        const created = await orchestration.createConversation(identity);
        const result = await orchestration.submitTurn(Object.assign({}, identity, {
            conversationCode: created.conversation.conversationCode,
            idempotencyKey: 'grounded-turn-1', message: 'What is Nodics?'
        }));
        assert.match(providerRequest.messages[1].content, /Nodics is a modular enterprise application framework/);
        assert.deepEqual(result.citations, [citation]);
        const events = conversations.state.events.get(result.turn.turnCode);
        assert.deepEqual(events.find(event => event.eventType === 'CITATIONS').data.citations, [citation]);
    } finally {
        global.SERVICE = originalService;
        global.CONFIG = originalConfig;
    }
});

test('Phase 5-7: evidence stays cited and export is bounded', () => {
    const knowledge = load('copilotKnowledge/src/service/defaultCopilotKnowledgeService');
    const context = knowledge.buildContext([{ id: 'd1', title: 'Guide', content: 'Text', sourceType: 'documentation', source: '/docs/guide' }], {});
    assert.deepEqual(context.citations[0], {
        citationId: 'd1', id: 'd1', title: 'Guide', locator: '/docs/guide', source: '/docs/guide',
        sourceType: 'documentation', navigationType: 'NONE'
    });
    const capability = load('copilotCapability/src/service/defaultCopilotCapabilityService');
    assert.match(capability.renderExport([{ code: 'p1', name: 'Phone' }], 'csv', {}).content, /"p1","Phone"/);
    assert.throws(() => capability.renderExport([{}, {}], 'csv', { maximumRows: 1 }), /COPILOT_EXPORT_LIMIT_EXCEEDED/);
    assert.equal(capability.renderExport([], 'xlsx', {}).delegate, 'nExport/excelExport');
});

test('Phase 8-9: workbench clarifies, validates, confirms, then calls an API', async () => {
    const workbench = load('copilotWorkbench/src/service/defaultCopilotWorkbenchService');
    assert.deepEqual(workbench.prepareProducts({ count: 10 }).state, 'CLARIFICATION_REQUIRED');
    const prepared = workbench.prepareProducts({ planId: 'plan-1', count: 10, name: 'iPhone Pro Max', codePrefix: 'IPM', catalogVersion: 'electronics-online', priceBookCode: 'uae-retail', currency: 'AED', price: 4999 });
    assert.equal(prepared.records.length, 10);
    const validated = workbench.validate(prepared, record => record.catalogVersion ? [] : ['catalogVersion']);
    const policy = load('copilotPolicy/src/service/defaultCopilotPolicyService');
    const context = { tenant: 'default', actor: 'admin', permissions: ['copilot.mutation.prepare', 'copilot.mutation.execute'] };
    const challenge = workbench.createConfirmation(validated, context, policy);
    await assert.rejects(workbench.execute(validated, Object.assign({}, challenge, { confirmed: false }), context, () => true, policy), /COPILOT_MUTATION_CONFIRMATION_REQUIRED/);
    await assert.rejects(workbench.execute(validated, Object.assign({}, challenge, { confirmed: true }), { tenant: 'default', actor: 'other', permissions: ['copilot.mutation.execute'] }, () => true, policy), /COPILOT_MUTATION_CONTEXT_MISMATCH/);
    const executed = await workbench.execute(validated, Object.assign({}, challenge, { confirmed: true }), context, payload => ({ accepted: payload.records.length }), policy);
    assert.equal(executed.result.accepted, 10);
});

test('workbench mutations cross the runtime boundary through the owning secured API', async () => {
    const orchestration = load('copilotCore/src/service/defaultCopilotOrchestrationService');
    const originalService = global.SERVICE;
    let invocation;
    global.SERVICE = {
        DefaultModuleService: { invokeModule: options => { invocation = options; return Promise.resolve({ code: 'SUC_DBS_00000' }); } }
    };
    try {
        const result = await orchestration.createOwnedWorkbenchRecord(
            { tenant: 'default' },
            { connectionName: 'commerceStaged', targetAuthority: { runtimeRole: 'COMMERCE_STAGED' } },
            'product', 'product', { code: 'IPM-001' }, 'plan-1:IPM-001'
        );
        assert.equal(result.code, 'SUC_DBS_00000');
        assert.equal(invocation.local, false);
        assert.equal(invocation.moduleName, 'product');
        assert.equal(invocation.connectionName, 'commerceStaged');
        assert.equal(invocation.apiName, '/schema/workbench/product/record');
        assert.equal(invocation.methodName, 'POST');
        assert.equal(invocation.tenant, 'default');
        assert.equal(invocation.header['Idempotency-Key'], 'plan-1:IPM-001');
        assert.deepEqual(invocation.request, { model: { code: 'IPM-001' } });
    } finally {
        global.SERVICE = originalService;
    }
});

test('SSE waits for durable replay before writing versioned events', async () => {
    const sse = load('copilotApi/src/service/defaultCopilotSseService');
    const originalService = global.SERVICE;
    const writes = [];
    global.SERVICE = { DefaultCopilotOrchestrationService: { replayEvents: async () => ({ items: [{
        eventCode: 'turn-1-1', contractVersion: 1, conversationCode: 'conversation-1', turnCode: 'turn-1',
        eventType: 'COMPLETED', sequence: 1, createdAt: new Date().toISOString(), data: {}
    }] }) } };
    try {
        const result = await sse.open({ conversationCode: 'conversation-1', turnCode: 'turn-1', query: {},
            httpRequest: {}, httpResponse: { setHeader: () => {}, write: value => writes.push(value), end: () => {} } });
        assert.equal(result.metadata.responseCommitted, true);
        assert.match(writes[0], /"contractVersion":1/);
    } finally {
        global.SERVICE = originalService;
    }
});

test('Phase 10-12: policy is fail closed and evaluation exposes review state', () => {
    const policy = load('copilotPolicy/src/service/defaultCopilotPolicyService');
    assert.equal(policy.assessAmbiguity({ required: ['catalog'], values: {} }).ambiguous, true);
    assert.throws(() => policy.authorizeExecution({ confirmed: false }, {}), /COPILOT_MUTATION_CONFIRMATION_REQUIRED/);
    const evaluation = load('copilotEvaluation/src/service/defaultCopilotEvaluationService');
    assert.equal(evaluation.evaluate({ code: 'e1', tenant: 't1', conversation: 'c1', scores: { safety: 1 } }).outcome, 'REVIEW');
    const experience = load('copilotCapability/src/service/defaultCopilotExperienceCapabilityService');
    const descriptors = experience.descriptors();
    assert.equal(descriptors.find(item => item.code === 'experience.issue.assist').maturity, 'ADAPTER_REQUIRED');
    assert.equal(descriptors.find(item => item.code === 'commerce.checkout.execute').mutates, true);
});

test('later modules can override focused methods without copying services', () => {
    const base = load('copilotCore/src/service/defaultCopilotRequestService');
    const customized = Object.assign({}, base, { normalize: request => Object.assign({}, base.normalize(request), { channel: 'partner' }) });
    assert.equal(customized.normalize({ tenant: 't1', actor: 'a1', prompt: 'help' }).channel, 'partner');
});
