/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** Proves a qualified content pack imports only through Staged and enters the normal publication workflow once. */
const assert = require('assert');
class NodicsError extends Error { constructor(code, message) { super(message || code); this.code = code; } }
global.CLASSES = { NodicsError: NodicsError };
const publication = { runtimeRole: 'STAGED', baselines: { documentation: {
    contentPackCode: 'nodicsDocumentation', releaseVersion: '0.0.0', rootType: 'site',
    rootCode: 'nodicsDocumentationSite', sourceVersion: '0'
} } };
global.CONFIG = { get: key => key === 'cms' ? { publication: publication } : undefined };

let installed = false;
let lifecycle;
let imported = 0;
global.SERVICE = {
    DefaultContentPackService: {
        resolvePackContext: code => ({ code: code }),
        inspectRelease: () => ({ available: true, version: '0.0.0', manifest: {
            destinationRole: 'WCMS_STAGED', lifecycle: 'PUBLISHABLE',
            initialPublicationPolicy: 'ADMIN_INITIATED', sites: ['nodicsDocumentationSite']
        } }),
        getStatus: async () => ({ data: { state: installed ? 'CURRENT' : 'NOT_INSTALLED' } }),
        importPack: async () => { imported += 1; installed = true; return {}; }
    },
    DefaultPublicationLifecycleService: {
        get: async () => { if (!lifecycle) throw new NodicsError('ERR_PUB_00000', 'not found'); return lifecycle; },
        create: async request => (lifecycle = Object.assign({}, request.publication,
            { state: 'STAGED', revision: 0, correlationId: request.correlationId })),
        validate: async () => (lifecycle = Object.assign({}, lifecycle, { state: 'VALIDATED', revision: 1 })),
        requestApproval: async () => (lifecycle = Object.assign({}, lifecycle,
            { state: 'PENDING_APPROVAL', revision: 2 }))
    }
};

const service = require('../src/service/publication/defaultCmsPublicationBaselineService');
const request = { tenant: 'default', authData: { principalId: 'platform-service', tokenType: 'service' },
    baseline: { requestedBy: 'admin', correlationId: 'documentation-1' } };

(async () => {
    const initiated = await service.initiate('documentation', request);
    assert.strictEqual(initiated.releaseCode, 'contentPack:nodicsDocumentation');
    assert.strictEqual(initiated.publication.state, 'PENDING_APPROVAL');
    assert.strictEqual(imported, 1);
    await service.initiate('documentation', request);
    assert.strictEqual(imported, 1, 'replay must not re-import a current immutable content pack');
    publication.baselines.documentation.releaseVersion = '0.0.0';
    await assert.rejects(service.status('documentation', request),
        error => error.code === 'CMS_BASELINE_RELEASE_INVALID');
    publication.runtimeRole = 'ONLINE';
    await assert.rejects(service.status('documentation', request),
        error => error.code === 'CMS_BASELINE_SOURCE_ROLE_INVALID');
    console.log('CMS content-pack publication baseline service validated');
})().catch(error => { console.error(error); process.exit(1); });
