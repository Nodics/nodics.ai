/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module cms/test/CmsPublicationMediaRetention */
const assert = require('assert');
const service = require('../src/service/publication/defaultCmsPublicationTargetService');

class NodicsError extends Error { constructor(code, message) { super(message || code); this.code = code; } }

(async function () {
    let collectorRequest;
    global.CLASSES = { NodicsError };
    global.CONFIG = { get: key => key === 'cms' ? { publication: { runtimeRole: 'ONLINE',
        mediaGarbageCollection: { maximumProtectedManifests: 10 } } } : key === 'publishEnabled' ? false : undefined };
    global.SERVICE = {
        DefaultCmsPublicationManifestOrchestrationService: {
            getRetentionPointers: async () => [
                { active: true, manifestCode: 'release-2', previousManifestCode: 'release-1' },
                { active: false, manifestCode: 'withdrawn', previousManifestCode: 'release-0' }
            ],
            getManifest: async code => ({ code: code, mediaAssets: {
                'release-2': [{ code: 'hero-2' }], 'release-1': [{ code: 'hero-1' }],
                withdrawn: [{ code: 'withdrawn-asset' }], 'release-0': [{ code: 'shared' }, { code: 'hero-0' }]
            }[code] })
        },
        DefaultMediaPublicationTransferService: { collectGarbage: async request => {
            collectorRequest = request; return { deleted: 1 };
        } }
    };
    let result = await service.collectMediaGarbage({ tenant: 'default', authData: { code: 'service' },
        cmsPublicationTarget: { dryRun: false, now: '2026-06-01T00:00:00.000Z' } });
    assert.deepStrictEqual(result, { deleted: 1 });
    assert.strictEqual(collectorRequest.dryRun, false);
    assert.strictEqual(collectorRequest.now, '2026-06-01T00:00:00.000Z');
    assert.deepStrictEqual(collectorRequest.protectedMediaCodes.sort(),
        ['hero-0', 'hero-1', 'hero-2', 'shared', 'withdrawn-asset']);

    global.SERVICE.DefaultCmsPublicationManifestOrchestrationService.getManifest = async code => code === 'release-1' ? undefined : { code: code };
    await assert.rejects(service.collectMediaGarbage({ cmsPublicationTarget: {} }),
        error => error.code === 'CMS_PUBLICATION_MEDIA_RETENTION_INCOMPLETE');
    console.log('cms publication media retention validated');
})().catch(error => { console.error(error); process.exit(1); });
