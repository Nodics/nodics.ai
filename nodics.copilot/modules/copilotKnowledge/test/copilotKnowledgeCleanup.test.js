/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @file Checks employee/source authorization, exact reviewed cleanup and uncertain outcomes without a real index. */
'use strict';
const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const cleanup = require('../src/service/defaultCopilotKnowledgeCleanupService');
const runtime = require('../src/service/defaultCopilotKnowledgeRuntimeService');
let request, configuration, manifest, writes;
beforeEach(() => {
    configuration = structuredClone(require('../config/properties').copilot);
    configuration.policy =
        require('../../copilotPolicy/config/properties').copilot.policy;
    configuration.knowledge.generationPublication.enabled = true;
    configuration.knowledge.sourceRegistry.definitions = [
        {
            code: 'source',
            repository: 'repo',
            project: 'project',
            module: 'module',
            owner: 'module',
            version: 'v1',
            sourceType: 'README',
            classification: 'INTERNAL',
            paths: ['README.md'],
            allowedChannels: ['EMPLOYEE'],
            requiredPermissions: ['copilot.knowledge.internal.read'],
            enterpriseScopes: ['enterprise'],
            secretScanPolicy: 'REQUIRED',
            enabled: true,
        },
    ];
    request = {
        tenant: 'tenant',
        sourceCode: 'source',
        body: {},
        securityContext: {
            channel: 'EMPLOYEE',
            actor: 'employee',
            tenant: 'tenant',
            enterprise: 'enterprise',
            permissions: [
                'copilot.knowledge.internal.read',
                'copilot.knowledge.source.manage',
                'copilot.knowledge.cleanup.execute',
            ],
        },
        authData: { loginId: 'employee' },
    };
    manifest = {
        revision: 7,
        pendingGeneration: null,
        obsoleteGenerations: ['published', 'abandoned'],
        publishedObsoleteGenerations: ['published'],
    };
    writes = 0;
    global.CLASSES = { NodicsError: class extends Error {} };
    global.SERVICE = {
        DefaultCopilotKnowledgeMaintenanceService: {
            save: async (r) => ({ code: 'SUC_DB', result: r.model }),
        },
        DefaultCopilotPolicyService: require('../../copilotPolicy/src/service/defaultCopilotPolicyService'),
        DefaultCopilotKnowledgeSourceRegistryService: require('../src/service/defaultCopilotKnowledgeSourceRegistryService'),
        DefaultCopilotKnowledgeRuntimeService: {
            ...runtime,
            configuration: () => configuration,
        },
        DefaultCopilotKnowledgePublicationService: require('../src/service/defaultCopilotKnowledgePublicationService'),
        DefaultDiscoveryGenerationPublicationService: {
            cleanupTokens: require('../../../../nodics.discovery/modules/discoveryPublication/src/service/defaultDiscoveryGenerationPublicationService').cleanupTokens,
            acknowledged:
                require('../../../../nodics.discovery/modules/discoveryPublication/src/service/defaultDiscoveryGenerationPublicationService')
                    .acknowledged,
            read: async () => structuredClone(manifest),
            cleanup: async (scope, options) => {
                assert.equal(scope.tenant, 'tenant');
                assert.equal(scope.ownerCode, 'source');
                assert.equal(options.expectedRevision, manifest.revision);
                assert.equal(options.publishedOnly, false);
                options.assertCurrent();
                writes++;
                return {
                    ...manifest,
                    revision: 8,
                    publishedObsoleteGenerations: [],
                    obsoleteGenerations: ['abandoned'],
                };
            },
        },
    };
});
/** Uses only inert review fields in a confirmation, never index predicates or generation IDs. */
function command(review) {
    return {
        ...request,
        body: {
            confirmed: true,
            expectedRevision: review.revision,
            expectedPolicyDigest: review.sourcePolicyDigest,
            reviewDigest: review.reviewDigest,
        },
    };
}
test('review is non-mutating, hides tokens and execution delegates only published debt', async () => {
    const review = await cleanup.preview(request);
    assert.equal(writes, 0);
    assert.equal(review.eligibleGenerations, 1);
    assert.equal(review.operatorOnlyGenerations, 1);
    assert.doesNotMatch(
        JSON.stringify(review),
        /abandoned|projection|ownerType/,
    );
    const result = await cleanup.execute(command(review));
    assert.equal(result.state, 'CLEANED');
    assert.equal(result.cleanupPending, true);
    assert.equal(writes, 1);
});
test('foreign enterprise, absent independent grant and disabled generation mode deny before reads', async () => {
    SERVICE.DefaultDiscoveryGenerationPublicationService.read = async () =>
        assert.fail('Denied request read persistence');
    const original = structuredClone(request.securityContext);
    for (const patch of [
        { enterprise: 'foreign' },
        { permissions: ['copilot.knowledge.source.manage'] },
        { channel: 'SYSTEM' },
    ]) {
        request.securityContext = { ...original, ...patch };
        await assert.rejects(cleanup.preview(request));
    }
    request.securityContext = original;
    configuration.knowledge.generationPublication.enabled = false;
    await assert.rejects(cleanup.preview(request));
});
test('stale revision, caller predicates, routing changes, actor substitution and pending writer never delete', async () => {
    const review = await cleanup.preview(request);
    await assert.rejects(
        cleanup.execute({
            ...command(review),
            body: { ...command(review).body, query: {} },
        }),
    );
    manifest.revision++;
    await assert.rejects(cleanup.execute(command(review)));
    manifest.revision--;
    request.securityContext.actor = 'other';
    await assert.rejects(cleanup.execute(command(review)));
    request.securityContext.actor = 'employee';
    configuration.knowledge.ingestion.indexName = 'other-index';
    await assert.rejects(cleanup.execute(command(review)));
    configuration.knowledge.ingestion.indexName = 'discoveryDocumentProjection';
    manifest.pendingGeneration = {};
    await assert.rejects(cleanup.preview(request));
    await assert.rejects(cleanup.execute(command(review)));
    assert.equal(writes, 0);
});
test('policy revocation during review or deletion withholds result and never retries', async () => {
    const review = await cleanup.preview(request);
    SERVICE.DefaultDiscoveryGenerationPublicationService.cleanup = async (
        _scope,
        options,
    ) => {
        configuration.knowledge.sourceRegistry.definitions[0].enabled = false;
        options.assertCurrent();
        assert.fail('Revoked cleanup continued');
    };
    await assert.rejects(cleanup.execute(command(review)));
    configuration.knowledge.sourceRegistry.definitions[0].enabled = true;
    SERVICE.DefaultDiscoveryGenerationPublicationService.cleanup = async () => {
        writes++;
        throw new Error('private engine diagnostic');
    };
    await assert.rejects(
        cleanup.execute(command(review)),
        (error) => !error.message.includes('private'),
    );
    assert.equal(writes, 1);
});
test('legacy or abandoned-only debt is inspectable but cannot execute through the UI command', async () => {
    delete manifest.publishedObsoleteGenerations;
    const review = await cleanup.preview(request);
    assert.equal(review.eligibleGenerations, 0);
    assert.equal(review.operatorOnlyGenerations, 2);
    await assert.rejects(cleanup.execute(command(review)));
    assert.equal(writes, 0);
});

test('audit acknowledgement precedes deletion and failed completion audit never fabricates success', async () => {
    const review = await cleanup.preview(request);
    const stages = [];
    SERVICE.DefaultCopilotKnowledgeMaintenanceService.save = async (r) => {
        stages.push(r.model.stage);
        assert.equal(r.model.principalCode, 'employee');
        assert.equal(r.model.enterpriseCode, 'enterprise');
        if (r.model.stage === 'CLEANUP_AUTHORIZED') assert.equal(writes, 0);
        return {
            code: 'SUC_DB',
            result: { ...r.model, principalCode: 'foreign' },
        };
    };
    await assert.rejects(cleanup.execute(command(review)));
    assert.equal(writes, 0);
    SERVICE.DefaultCopilotKnowledgeMaintenanceService.save = async (r) => {
        stages.push(r.model.stage);
        return r.model.stage === 'CLEANUP_AUTHORIZED'
            ? { code: 'SUC_DB', result: r.model }
            : undefined;
    };
    await assert.rejects(cleanup.execute(command(review)));
    assert.equal(writes, 1);
    assert.deepEqual(stages, [
        'CLEANUP_AUTHORIZED',
        'CLEANUP_AUTHORIZED',
        'CLEANUP_COMPLETED',
    ]);
});
