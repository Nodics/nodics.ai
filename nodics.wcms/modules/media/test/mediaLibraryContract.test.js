/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
/**
 * @module media/test/MediaLibraryContract
 * @description Verifies scoped library projection, real registration contracts and exact-version owner delegation without runtime providers.
 * @layer test
 * @owner media
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const library = require('../src/service/defaultMediaLibraryService');
const facade = require('../src/facade/defaultMediaLibraryFacade');
const controller = require('../src/controller/defaultMediaLibraryController');
const storageFacade = require('../src/facade/storage/defaultMediaStorageFacade');
const versionProvider = require('../src/service/publication/defaultMediaPublicationVersionProviderService');
const retained = require('../src/service/publication/defaultMediaRetainedPublicationService');
const security = require('../../../../nodics.foundation/modules/nRouter/src/service/request/defaultSecuredRequestPipelineService');
const contract = require('../../../../nodics.platform/modules/backoffice/src/service/contract/defaultBackofficeContractService');
const capability = require('../src/service/defaultMediaBackofficeCapabilityService');
const defaults = require('../config/properties');
const agentSource = require('../../../../nodics.foundation/modules/nService/src/service/module/defaultModuleRegistrationAgentService');
const clone = (value) => JSON.parse(JSON.stringify(value));

test('library HTTP envelopes resolve through real Media status definitions and JSON success handler', async (t) => {
    const f = fixture(t);
    const status = require('../../../../nodics.foundation/modules/nService/src/service/status/defaultStatusService');
    const json = require('../../../../nodics.foundation/modules/nRouter/src/service/handlers/response/defaultJsonResponseHandlerService');
    SERVICE.DefaultStatusService = {
        ...status,
        statusMap: { ...require('../src/utils/statusDefinitions') }
    };
    UTILS.isBlank = (value) => value === undefined || value === null;
    for (const operation of ['list', 'inspect', 'requestPublication']) {
        FACADE.DefaultMediaLibraryFacade = {
            [operation]: async () => ({ operation })
        };
        const http = {
            query: {},
            body: {},
            params: { mediaCode: 'hero' },
            headers: { authorization: 'Bearer fixture-starter' }
        };
        const success = await controller[operation]({
            ...f.request,
            httpRequest: http
        });
        let code;
        let payload;
        const response = {
            status: (value) => {
                code = value;
            },
            json: (value) => {
                payload = value;
            }
        };
        json.handleSuccess.call(
            {
                ...json,
                handleError: (_request, _response, error) => {
                    throw error;
                }
            },
            {},
            response,
            success
        );
        assert.equal(code, 200);
        assert.equal(payload.code, 'SUC_MED_00032');
        assert.equal(
            payload.message,
            SERVICE.DefaultStatusService.get(payload.code).message
        );
        assert.deepEqual(payload.data, { operation });
    }
    assert.throws(() => SERVICE.DefaultStatusService.get('SUC_MED_00000'));
});

test('safe readiness names exact failed source and caller gates without inventing missing workflows or exposing errors', async (t) => {
    const f = fixture(t);
    qualify(f);
    f.request.authData.permissions = f.request.authData.permissions.filter(
        (permission) => permission !== 'process.definition.read'
    );
    const denied = await library.inspect({ mediaCode: 'hero' }, f.request);
    assert.equal(denied.publicationRequestAvailable, false);
    assert.equal(
        denied.publicationReadiness.workflowDefinition.availability,
        'NOT_INSPECTED'
    );
    assert.deepEqual(
        denied.publicationReadiness.blockers[0].requiredPermissions,
        ['process.definition.read']
    );
    assert.match(
        denied.publicationReadiness.message,
        /process.definition.read/
    );
    f.request.authData.permissions.push('process.definition.read');
    SERVICE.DefaultDatabaseTransactionService.capabilities = () => {
        throw new Error('secret-database-password');
    };
    const atomic = await library.inspect({ mediaCode: 'hero' }, f.request);
    assert.equal(
        atomic.publicationReadiness.blockers[0].code,
        'MEDIA_ATOMIC_STORAGE_REQUIRED'
    );
    assert.equal(atomic.publicationReadiness.blockers[0].owner, 'database');
    assert.equal(
        JSON.stringify(atomic).includes('secret-database-password'),
        false
    );
    qualify(f);
    SERVICE.DefaultModuleService.invokeModule = async () => {
        throw new Error('private-transport-secret');
    };
    const uncertain = await library.inspect({ mediaCode: 'hero' }, f.request);
    assert.equal(
        uncertain.publicationReadiness.blockers[0].code,
        'PROCESS_INSPECTION_UNCONFIRMED'
    );
    assert.equal(
        JSON.stringify(uncertain).includes('private-transport-secret'),
        false
    );
    assert.ok(uncertain.publicationReadiness.message.length <= 512);
    qualify(f);
    const ready = await library.inspect({ mediaCode: 'hero' }, f.request);
    assert.deepEqual(ready.publicationReadiness.blockers, []);
    assert.equal(ready.publicationRequestAvailable, true);
});

test('only recognized Process definition 404 reports the missing workflow release; denial and uncertain errors stay blocked', async (t) => {
    const f = fixture(t);
    const writes = qualify(f);
    for (const error of [
        Object.assign(new Error('private-process-detail'), {
            code: 'ERR_PROCESS_00002',
            status: 404
        }),
        { code: 'ERR_PROCESS_00002', responseCode: '404' }
    ]) {
        SERVICE.DefaultModuleService.invokeModule = async () => {
            throw error;
        };
        const dto = await library.inspect({ mediaCode: 'hero' }, f.request);
        assert.equal(
            dto.publicationReadiness.blockers[0].code,
            'PROCESS_MEDIA_DEFINITION_MISSING'
        );
        assert.match(
            dto.publicationReadiness.message,
            /media:mediaPublicationWorkflow/
        );
        assert.equal(dto.publicationRequestAvailable, false);
        assert.equal(
            JSON.stringify(dto).includes('private-process-detail'),
            false
        );
    }
    for (const error of [
        { code: 'ERR_PROCESS_00002', status: 403 },
        { code: 'ERR_AUTH_00003', status: 401 },
        { code: 'UNKNOWN', status: 404 },
        new Error('Invalid error code: ERR_PROCESS_00002')
    ]) {
        SERVICE.DefaultModuleService.invokeModule = async () => {
            throw error;
        };
        const dto = await library.inspect({ mediaCode: 'hero' }, f.request);
        assert.equal(
            dto.publicationReadiness.blockers[0].code,
            'PROCESS_INSPECTION_UNCONFIRMED'
        );
        assert.equal(dto.publicationRequestAvailable, false);
    }
    assert.deepEqual(writes, []);
});

/** Creates exact in-memory owner boundaries, never connections or provider writes. */
function fixture(t) {
    const previous = Object.fromEntries(
        ['CONFIG', 'SERVICE', 'FACADE', 'NODICS', 'UTILS', 'CLASSES'].map(
            (name) => [name, global[name]]
        )
    );
    t.after(() => {
        for (const [name, value] of Object.entries(previous)) {
            if (value === undefined) delete global[name];
            else global[name] = value;
        }
    });
    const config = clone(defaults);
    const request = {
        tenant: 'one',
        authData: {
            tokenType: 'access',
            tenant: 'one',
            entCode: 'owner',
            permissions: [
                'media.storage.policy.view',
                'publish.lifecycle.create',
                'publish.lifecycle.validate',
                'publish.lifecycle.requestApproval',
                'process.instance.start',
                'process.definition.read'
            ]
        },
        httpRequest: { headers: { authorization: 'Bearer fixture-starter' } }
    };
    const rows = [
        {
            code: 'hero',
            name: 'Hero',
            enterpriseCode: 'owner',
            versionId: 7,
            active: true,
            status: 'READY',
            access: 'PUBLIC',
            storageKey: 'private-key',
            fullPath: '/private/file',
            providerCode: 'secret-provider',
            contentBase64: 'private-bytes',
            url: 'https://private',
            credentials: { password: 'hidden' },
            evidence: { secret: true }
        }
    ];
    const reads = [];
    global.CONFIG = { get: (key) => config[key] };
    global.UTILS = { createModelName: () => 'MediaModel' };
    global.NODICS = {
        getModels: () => ({
            MediaModel: {
                versioned: true,
                rawSchema: { versionedReadMode: 'CURRENT' }
            }
        })
    };
    global.CLASSES = {
        NodicsError: class extends Error {
            constructor(code, message) {
                super(message);
                this.code = code;
            }
        }
    };
    global.SERVICE = {
        DefaultMediaLibraryService: library,
        DefaultSecuredRequestPipelineService: security,
        DefaultMediaRetainedPublicationService: retained,
        DefaultMediaPublicationVersionProviderService: versionProvider,
        DefaultMediaService: {
            get: async (request) => {
                reads.push(request);
                return { result: rows };
            }
        }
    };
    global.FACADE = {
        DefaultMediaLibraryFacade: facade,
        DefaultMediaStorageFacade: storageFacade
    };
    return { config, request, rows, reads };
}

/** Selects only in-memory qualified provider boundaries and real createGoverned orchestration. */
function qualify(f) {
    Object.assign(f.config.media.publication, {
        versionProviderEnabled: true,
        runtimeRole: 'STAGED'
    });
    f.config.publishEnabled = true;
    SERVICE.DefaultDatabaseTransactionService = {
        capabilities: () => ({
            multiRecordAtomic: true,
            contextPropagation: true
        })
    };
    const calls = [];
    let publication;
    SERVICE.DefaultMediaRetainedPublicationService = {
        ...retained,
        capture: async (identity, request) => {
            retained.assertScope(request, 'STAGED');
            retained.assertVersionedSource(request);
            calls.push(['capture', identity]);
            return {
                code: 'retained-version',
                artifacts: {
                    asset: {
                        code: identity.code,
                        versionId: identity.versionId
                    }
                }
            };
        },
        load: async () => ({
            code: 'retained-version',
            artifacts: { asset: { code: 'hero', versionId: 7 } }
        })
    };
    SERVICE.DefaultPublicationLifecycleService = {
        getWorkflowProvider: () => ({
            policy: () => ({
                definitionCode: 'mediaPublicationApproval',
                ownerModule: 'media',
                requesterBinding: 'NATIVE_ACTOR',
                reviewNodeCode: 'mediaReview',
                reviewPermission: 'publish.lifecycle.approve'
            }),
            assertSource: () => true,
            target: () => ({
                runtimeRole: 'PROCESS',
                connectionName: 'processServer',
                connectionType: 'abstract'
            })
        }),
        getDomainAdapter: () => ({}),
        getVersionProvider: () => versionProvider,
        getRepository: () => ({ get: async () => publication }),
        create: async (request) => {
            calls.push(['create', request.publication]);
            publication = {
                ...request.publication,
                revision: 0,
                state: 'STAGED'
            };
            return publication;
        },
        validate: async () => {
            calls.push(['validate']);
            publication = { ...publication, revision: 1, state: 'VALIDATED' };
            return publication;
        },
        requestApproval: async (request) => {
            assert.equal(
                request.httpRequest.headers.authorization,
                'Bearer fixture-starter'
            );
            calls.push(['requestApproval']);
            publication = {
                ...publication,
                revision: 2,
                state: 'APPROVAL_PENDING'
            };
            return publication;
        },
        approve: () => assert.fail('No operator approval bypass'),
        activate: () => assert.fail('No automatic Online activation')
    };
    SERVICE.DefaultModuleService = {
        invokeModule: async (request) => {
            assert.equal(request.moduleName, 'workflow');
            assert.equal(request.local, false);
            assert.equal(request.methodName, 'GET');
            assert.equal(
                request.header.Authorization,
                'Bearer fixture-starter'
            );
            assert.equal(request.header['x-enterprise-code'], 'owner');
            const definition = {
                code: 'mediaPublicationApproval',
                active: true,
                status: 'PUBLISHED',
                ownerModule: 'media',
                currentVersion: 1
            };
            const result = request.apiName.endsWith('/versions')
                ? [
                      {
                          definitionCode: definition.code,
                          active: true,
                          status: 'PUBLISHED',
                          version: 1,
                          ...clone(require('../data/init-v003/records/process/mediaPublicationWorkflowDefinitionData').definitions[0])
                      }
                  ]
                : definition;
            return request.responseSelector({ data: result });
        }
    };
    return calls;
}

test('workflow availability must prove published current version before enabling any command or capture', async (t) => {
    const f = fixture(t);
    const calls = qualify(f);
    SERVICE.DefaultModuleService.invokeModule = async () => null;
    const uncertain = await library.inspect({ mediaCode: 'hero' }, f.request);
    assert.equal(uncertain.publicationRequestAvailable, false);
    assert.equal(uncertain.commands.length, 0);
    await assert.rejects(
        library.requestPublication(
            { mediaCode: 'hero', versionId: 7, publicationCode: 'proof' },
            f.request
        )
    );
    assert.equal(calls.length, 0);
    qualify(f);
    const read = SERVICE.DefaultModuleService.invokeModule;
    SERVICE.DefaultModuleService.invokeModule = async (request) =>
        request.apiName.endsWith('/versions') ? [] : read(request);
    assert.equal(
        (await library.inspect({ mediaCode: 'hero' }, f.request))
            .publicationReadiness.workflowDefinition.availability,
        'BLOCKED'
    );
    qualify(f);
    let reads = 0;
    const original = SERVICE.DefaultModuleService.invokeModule;
    SERVICE.DefaultModuleService.invokeModule = async (request) => {
        const result = await original(request);
        if (!request.apiName.endsWith('/versions') && ++reads === 2)
            result.currentVersion = 2;
        return result;
    };
    assert.equal(
        (await library.inspect({ mediaCode: 'hero' }, f.request))
            .publicationRequestAvailable,
        false
    );
});

test('legacy or overridden review policy cannot enable new Media requests', async (t) => {
    const f = fixture(t);
    const calls = qualify(f);
    const original = SERVICE.DefaultModuleService.invokeModule;
    for (const mutate of [
        candidate => { delete candidate.policy; },
        candidate => { delete candidate.graph.nodes[1].policy; },
        candidate => { candidate.policy.actorPolicy.requesterContextField = 'foreign'; },
        candidate => { candidate.graph.nodes[1].policy.actorPolicy = {}; },
        candidate => { candidate.graph.nodes[1].policy.decisionContract.maximumReasonLength = 1001; }
    ]) {
        SERVICE.DefaultModuleService.invokeModule = async request => {
            const result = await original(request);
            if (Array.isArray(result)) mutate(result[0]);
            return result;
        };
        const result = await library.inspect({ mediaCode: 'hero' }, f.request);
        assert.equal(result.publicationRequestAvailable, false);
        assert.equal(result.publicationReadiness.blockers.some(item => item.code === 'PROCESS_MEDIA_DECISION_POLICY_REQUIRED'), true);
        assert.equal(calls.length, 0);
    }
});

test('real workflow owner enforces selected Staged authority and caller read/start permissions', async (t) => {
    const f = fixture(t);
    qualify(f);
    const owner = require('../../../../nodics.foundation/modules/nPublish/src/service/defaultPublicationApprovalWorkflowService');
    f.config.runtimeRole = { code: 'WCMS_STAGED', publication: 'STAGED' };
    f.config.publish = {
        approvalWorkflow: {
            domains: {
                media: {
                    definitionCode: 'mediaPublicationApproval',
                    ownerModule: 'media',
                    actionKey: 'media.applyPublicationDecision',
                    sourceRuntimeRole: 'WCMS_STAGED',
                    requesterBinding: 'NATIVE_ACTOR',
                    reviewNodeCode: 'mediaReview',
                    reviewPermission: 'publish.lifecycle.approve'
                }
            },
            target: {
                connectionName: 'process',
                connectionType: 'abstract',
                runtimeRole: 'PROCESS'
            }
        }
    };
    SERVICE.DefaultPublicationLifecycleService.getWorkflowProvider = () =>
        owner;
    assert.equal(
        (await library.inspect({ mediaCode: 'hero' }, f.request))
            .publicationRequestAvailable,
        true
    );
    f.config.runtimeRole.publication = 'ONLINE';
    assert.equal(
        (await library.inspect({ mediaCode: 'hero' }, f.request))
            .publicationRequestAvailable,
        false
    );
    f.config.runtimeRole.publication = 'STAGED';
    for (const permission of [
        'process.definition.read',
        'process.instance.start'
    ]) {
        const previous = f.request.authData.permissions;
        f.request.authData.permissions = previous.filter(
            (value) => value !== permission
        );
        assert.equal(
            (await library.inspect({ mediaCode: 'hero' }, f.request))
                .publicationRequestAvailable,
            false
        );
        f.request.authData.permissions = previous;
    }
    delete f.request.httpRequest.headers.authorization;
    assert.equal(
        (await library.inspect({ mediaCode: 'hero' }, f.request))
            .publicationRequestAvailable,
        false
    );
});

test('bounded library exposes current versions but never private storage or commands when publication is off', async (t) => {
    const f = fixture(t);
    const result = await library.list(
        { pageNumber: '2', pageSize: '10', code: 'hero' },
        f.request
    );
    assert.equal(result.items[0].versionId, 7);
    assert.equal(result.items[0].publicationRequestAvailable, false);
    assert.deepEqual(result.items[0].commands, []);
    for (const field of [
        'storageKey',
        'providerCode',
        'fullPath',
        'url',
        'contentBase64',
        'evidence',
        'credentials'
    ])
        assert.equal(Object.hasOwn(result.items[0], field), false);
    assert.equal(f.rows[0].storageKey, 'private-key');
    assert.equal(f.reads[0].tenant, 'one');
    assert.equal(f.reads[0].authData, f.request.authData);
    assert.equal(f.reads[0].skipcache, true);
    assert.deepEqual(f.reads[0].query.$or[0], { enterpriseCode: 'owner' });
    assert.equal(f.reads[0].searchOptions.pageSize, 10);
    assert.equal(f.reads[0].searchOptions.pageNumber, 2);
});

test('denied authority and arbitrary queries never reach generated Media reads', async (t) => {
    const f = fixture(t);
    for (const auth of [
        { ...f.request.authData, tokenType: 'service' },
        { ...f.request.authData, tenant: 'other' },
        { ...f.request.authData, entCode: undefined },
        { ...f.request.authData, permissions: [] }
    ]) {
        await assert.rejects(
            library.list({}, { ...f.request, authData: auth })
        );
    }
    for (const input of [
        { tenant: 'other' },
        { query: { $where: 'execute' } },
        { code: { $ne: '' } },
        { pageSize: '101' },
        { pageNumber: '-1' },
        { pageSize: '1e2' },
        { pageSize: 0 }
    ])
        await assert.rejects(library.list(input, f.request));
    assert.equal(f.reads.length, 0);
});

test('out-of-scope, ambiguous and oversized owner reads fail closed; unowned PUBLIC metadata remains visible', async (t) => {
    const f = fixture(t);
    f.rows[0].enterpriseCode = 'other';
    await assert.rejects(library.list({}, f.request));
    f.rows[0].enterpriseCode = undefined;
    f.rows[0].access = 'PRIVATE';
    await assert.rejects(library.inspect({ mediaCode: 'hero' }, f.request));
    f.rows[0].access = 'PUBLIC';
    assert.equal(
        (await library.inspect({ mediaCode: 'hero' }, f.request)).code,
        'hero'
    );
    f.rows.push({ ...f.rows[0] });
    await assert.rejects(library.inspect({ mediaCode: 'hero' }, f.request));
    await assert.rejects(library.list({ pageSize: 1 }, f.request));
});

test('publication commands require actual CURRENT installation and all operation permissions', async (t) => {
    const f = fixture(t);
    qualify(f);
    assert.equal(
        (await library.inspect({ mediaCode: 'hero' }, f.request)).commands[0]
            .versionId,
        7
    );
    for (const permission of [
        'publish.lifecycle.create',
        'publish.lifecycle.validate',
        'publish.lifecycle.requestApproval',
        'process.instance.start'
    ]) {
        const request = {
            ...f.request,
            authData: {
                ...f.request.authData,
                permissions: f.request.authData.permissions.filter(
                    (p) => p !== permission
                )
            }
        };
        assert.deepEqual(
            (await library.inspect({ mediaCode: 'hero' }, request)).commands,
            []
        );
        await assert.rejects(
            library.requestPublication(
                {
                    mediaCode: 'hero',
                    versionId: 7,
                    publicationCode: 'publication'
                },
                request
            )
        );
    }
    NODICS.getModels = () => ({ MediaModel: { versioned: false } });
    const legacy = await library.inspect({ mediaCode: 'hero' }, f.request);
    assert.deepEqual(legacy.commands, []);
    assert.equal(legacy.versionId, null);
    await assert.rejects(
        library.requestPublication(
            { mediaCode: 'hero', versionId: 7, publicationCode: 'publication' },
            f.request
        )
    );
    const count = f.reads.length;
    NODICS.getModels = () => ({
        MediaModel: {
            versioned: true,
            rawSchema: { versionedReadMode: 'HISTORY' }
        }
    });
    await assert.rejects(library.list({}, f.request));
    assert.equal(f.reads.length, count);
});

test('exact fresh version invokes real Media/nPublish request chain; stable retry never approves or activates', async (t) => {
    const f = fixture(t);
    const calls = qualify(f);
    for (const input of [
        { mediaCode: 'hero', versionId: 6, publicationCode: 'publication' },
        { mediaCode: 'hero', publicationCode: 'publication' },
        { mediaCode: 'hero', versionId: '7.0', publicationCode: 'publication' },
        {
            mediaCode: 'hero',
            versionId: 7,
            publicationCode: 'publication',
            approved: true
        }
    ])
        await assert.rejects(library.requestPublication(input, f.request));
    assert.equal(calls.length, 0);
    const input = {
        mediaCode: 'hero',
        versionId: '7',
        publicationCode: 'publication'
    };
    const result = await library.requestPublication(input, f.request);
    assert.deepEqual(
        calls.map((call) => call[0]),
        ['capture', 'create', 'validate', 'requestApproval']
    );
    assert.deepEqual(calls[0][1], { code: 'hero', versionId: 7 });
    assert.deepEqual(result, {
        publicationCode: 'publication',
        mediaCode: 'hero',
        versionId: 7,
        state: 'APPROVAL_PENDING',
        revision: 2,
        approvalRequired: true
    });
    await library.requestPublication(input, f.request);
    assert.equal(calls.length, 4);
});

test('HTTP mapping preserves signed context, callbacks and no-store while suppressing private provider failures', async (t) => {
    const f = fixture(t);
    const headers = {};
    const request = {
        ...f.request,
        httpRequest: { query: {}, body: {}, params: { mediaCode: 'hero' } },
        httpResponse: {
            setHeader: (key, value) => {
                headers[key] = value;
            }
        }
    };
    const result = await controller.inspect(request);
    assert.equal(result.data.code, 'hero');
    assert.equal(headers['Cache-Control'], 'no-store');
    await assert.rejects(
        controller.list({
            ...request,
            httpRequest: { query: { tenant: 'other' } }
        })
    );
    SERVICE.DefaultMediaService.get = async () => {
        throw new Error('private-provider-password');
    };
    await new Promise((resolve) =>
        controller.inspect(request, (error, result) => {
            assert.equal(result, undefined);
            assert.equal(error.code, 'ERR_MED_00023');
            assert.equal(error.message.includes('password'), false);
            assert.equal(error.cause, undefined);
            resolve();
        })
    );
});

test('missing atomic capability, Online role and global publishing denial suppress request commands', async (t) => {
    const f = fixture(t);
    const calls = qualify(f);
    const input = {
        mediaCode: 'hero',
        versionId: 7,
        publicationCode: 'publication'
    };
    SERVICE.DefaultDatabaseTransactionService.capabilities = () => ({
        multiRecordAtomic: false,
        contextPropagation: true
    });
    assert.deepEqual(
        (await library.inspect({ mediaCode: 'hero' }, f.request)).commands,
        []
    );
    await assert.rejects(library.requestPublication(input, f.request));
    SERVICE.DefaultDatabaseTransactionService.capabilities = () => ({
        multiRecordAtomic: true,
        contextPropagation: true
    });
    f.config.media.publication.runtimeRole = 'ONLINE';
    await assert.rejects(library.requestPublication(input, f.request));
    f.config.media.publication.runtimeRole = 'STAGED';
    f.config.publishEnabled = false;
    await assert.rejects(library.requestPublication(input, f.request));
    assert.equal(calls.length, 0);
});

test('actual Media capability and generic workspaces satisfy strict BackOffice contracts without schema API enablement', (t) => {
    const f = fixture(t);
    for (const enabled of [false, true]) {
        Object.assign(f.config.media.publication, {
            versionProviderEnabled: enabled,
            runtimeRole: 'STAGED'
        });
        f.config.publishEnabled = true;
        const metadata = capability.getCapability();
        for (const workspace of [
            f.config.media.library.workspace,
            f.config.media.library.publicationWorkspace
        ]) {
            assert.deepEqual(workspace.ownerSelector, {
                runtimeRoleCode: 'WCMS_STAGED',
                publicationRole: 'STAGED'
            });
            const endpoint = workspace.tabs[0].sections[0].endpoint;
            assert.equal(
                endpoint.path,
                endpoint.method === 'GET'
                    ? '/nodics/media/v0/library'
                    : '/nodics/media/v0/library/publications'
            );
            assert.equal(
                new URL(endpoint.path, 'http://staged.example/nodics/media/v0')
                    .pathname,
                endpoint.path
            );
        }
        assert.equal(contract.validateBackofficeMetadata(metadata), true);
        NODICS.getRawModule = () => ({
            metaData: require('../package.json'),
            rawSchema: require('../src/schemas/schemas').media,
            path: require('node:path').resolve(__dirname, '..'),
            parent: 'nodics.wcms',
            canonicalIdentity: 'nodics.wcms/modules/media'
        });
        NODICS.getServerName = () => 'wcmsStagedServer';
        SERVICE.DefaultRouterService = {
            prepareUrl: () => 'http://localhost:4320/nodics/media/v0'
        };
        const agent = {
            ...agentSource,
            getConfiguration: () => ({
                healthPath: '/health',
                leaseTtlMs: 30000
            }),
            getInstanceId: () => 'media-library-fixture',
            _backofficeCapabilityProviders: new Map([['media', capability]])
        };
        const registration = agent.buildRegistration('media');
        assert.equal(contract.validateRegistration(registration), true);
        assert.equal(
            contract.validateRegistrationBatch(
                {
                    instanceId: registration.instanceId,
                    registrations: [registration]
                },
                512
            ),
            true
        );
        for (const id of ['media-library', 'media']) {
            const nav = metadata.navigation.find((entry) => entry.id === id);
            assert.equal(nav.featureState, 'ACTIVE');
            assert.equal(Object.hasOwn(nav, 'workbenchTarget'), false);
            assert.equal(
                nav.backendWorkspace.renderer,
                'axis.workspace.backend-operations'
            );
        }
        assert.equal(
            metadata.navigation.find(
                (entry) => entry.id === 'media-publication-requests'
            ).featureState,
            'ACTIVE'
        );
    }
    const routes = require('../src/router/routers').media.library;
    assert.ok(
        Object.values(routes).every(
            (route) =>
                route.apiExposure === 'mediaManagement' &&
                route.secured &&
                route.authTokenTypes[0] === 'access'
        )
    );
    assert.equal(
        defaults.schemaPolicies.media.publicationVersioned.isVersionedEnabled,
        false
    );
    assert.equal(defaults.media.publication.versionProviderEnabled, false);
});

test('real native Local runtime configurations produce identical Media capability hashes despite qualification differences', (t) => {
    const f = fixture(t);
    const path = require('node:path');
    const { loadRuntime } = require(
        path.resolve(
            __dirname,
            '../../../../../nodics.kickoff/test/helpers/configuration'
        )
    );
    const crypto = require('node:crypto');
    const hashes = new Set();
    for (const server of [
        'platformServer',
        'wcmsStagedServer',
        'wcmsOnlineServer',
        'processServer',
        'commerceServer',
        'commerceStagedServer',
        'engagementServer',
        'loyaltyServer',
        'locationServer',
        'wasteServer'
    ]) {
        const effective = require('lodash/merge')(
            {},
            f.config,
            loadRuntime(server)
        );
        CONFIG.get = (key) =>
            effective[key] === undefined ? f.config[key] : effective[key];
        const metadata = capability.getCapability();
        assert.equal(
            contract.validateBackofficeMetadata(metadata),
            true,
            server
        );
        hashes.add(
            crypto
                .createHash('sha256')
                .update(JSON.stringify(metadata))
                .digest('hex')
        );
    }
    assert.equal(hashes.size, 1);
});

test('real owner descriptors bind row navigation to fresh exact-version inspection and explicit publication POST', async (t) => {
    const f = fixture(t);
    qualify(f);
    const metadata = capability.getCapability();
    assert.equal(contract.validateBackofficeMetadata(metadata), true);
    const listing = f.config.media.library.workspace.tabs[0].sections[0];
    const form =
        f.config.media.library.publicationWorkspace.tabs[0].sections[0];
    assert.deepEqual(listing.rowNavigation, {
        label: 'Inspect publication',
        route: '/media/publication',
        parameters: { mediaCode: 'code' }
    });
    assert.deepEqual(form.readSource.fields, {
        mediaCode: 'code',
        versionId: 'versionId'
    });
    assert.equal(form.readSource.endpoint.method, 'GET');
    assert.equal(
        form.readSource.unavailableMessagePath,
        'publicationReadiness.message'
    );
    assert.equal(
        form.readSource.endpoint.path,
        '/nodics/media/v0/library/{mediaCode}'
    );
    assert.equal(form.endpoint.method, 'POST');
    const calls = [];
    FACADE.DefaultMediaLibraryFacade = {
        ...facade,
        inspect: async (input, request) => {
            calls.push(input);
            return library.inspect(input, request);
        }
    };
    const response = await controller.inspect({
        ...f.request,
        httpRequest: {
            params: { mediaCode: 'hero' },
            headers: f.request.httpRequest.headers,
            body: {},
            query: {}
        }
    });
    assert.deepEqual(calls, [{ mediaCode: 'hero' }]);
    const matches = response.data.commands.filter(
        (command) =>
            command.id === form.readSource.commandId &&
            command.method === form.endpoint.method &&
            Object.entries(form.readSource.fields).every(
                ([field, property]) =>
                    command[field] === response.data[property]
            )
    );
    assert.equal(matches.length, 1);
    assert.equal(response.data.versionId, 7);
    f.rows[0].versionId = 8;
    const fresh = await library.inspect({ mediaCode: 'hero' }, f.request);
    assert.equal(fresh.commands[0].versionId, 8);
    await assert.rejects(
        library.requestPublication(
            { mediaCode: 'hero', versionId: 7, publicationCode: 'stale' },
            f.request
        )
    );
    const invalid = clone(form);
    invalid.readSource.endpoint.path = '/nodics/profile/v0/library/{mediaCode}';
    assert.equal(contract.validateBackendWorkspaceSection(invalid), false);
});
