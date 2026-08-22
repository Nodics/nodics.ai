/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** Validates exact Axis release installation and one site-level normal approval submission without automatic approval. */
const assert = require('assert');
class NodicsError extends Error { constructor(code, message) { super(message || code); this.code = code; } }
global.CLASSES = { NodicsError: NodicsError };
const publication = { runtimeRole: 'STAGED', baselines: { axis: { releaseCode: 'axis:axisBaseline',
    releaseVersion: '0.0.0', rootType: 'site', rootCode: 'axisCmsSite', sourceVersion: '0' } } };
global.CONFIG = { get: key => key === 'cms' ? { publication: publication } : undefined };

let releaseStatus = 'NOT_INSTALLED';
let lifecycle;
let operations = [];
global.SERVICE = {
    DefaultCmsPublicationWorkflowService: {
        reference: value => 'workflow-' + value.code + '-' + value.revision
    },
    DefaultDataReleaseService: {
        getCatalogue: async () => ({ data: [{ releaseCode: 'axis:axisBaseline', version: '0.0.0',
            destinationRole: 'WCMS_STAGED', lifecycle: 'PUBLISHABLE', initialPublicationPolicy: 'ADMIN_INITIATED',
            checksum: 'release-checksum', publicationReview: {
                title: 'Publish Axis', summary: 'Review Axis', sourceRole: 'WCMS_STAGED', targetRole: 'WCMS_ONLINE',
                siteCode: 'axisCmsSite', catalogCode: 'axisContentCatalog', impactMessage: 'Axis becomes available.',
                rollbackMessage: 'Restore the prior release when available.', entities: [{ type: 'page', label: 'Pages',
                    total: 1, added: 1, updated: 0, unchanged: 0, removed: 0 }],
                postPublicationCapabilities: [{ title: 'Open Axis', description: 'Use Axis.' }]
            },
            status: releaseStatus }] }),
        execute: async request => { operations.push(['install', request.releaseRequest]); releaseStatus = 'CURRENT'; return {}; }
    },
    DefaultPublicationLifecycleService: {
        get: async () => { if (!lifecycle) throw new NodicsError('ERR_PUB_00000', 'not found'); return lifecycle; },
        create: async request => {
            operations.push(['create', request.publication, request.authData]);
            lifecycle = lifecycle || Object.assign({}, request.publication, { state: 'STAGED', revision: 0,
                correlationId: request.correlationId });
            return lifecycle;
        },
        validate: async request => { operations.push(['validate', request.expectedRevision]);
            lifecycle = Object.assign({}, lifecycle, { state: 'VALIDATED', revision: 1 }); return lifecycle; },
        retry: async request => { operations.push(['retry', request.expectedRevision]);
            lifecycle = Object.assign({}, lifecycle, { state: 'VALIDATED', revision: request.expectedRevision + 1 }); return lifecycle; },
        requestApproval: async request => { operations.push(['requestApproval', request.expectedRevision]);
            lifecycle = Object.assign({}, lifecycle, { state: 'PENDING_APPROVAL', revision: 2 }); return lifecycle; }
    }
};

const service = require('../src/service/publication/defaultCmsPublicationBaselineService');
const request = { tenant: 'default', authData: { principalId: 'platform-service', tokenType: 'service' },
    baseline: { requestedBy: 'admin', correlationId: 'axis-baseline-1' } };

(async () => {
    const initiated = await service.initiate('axis', request);
    assert.strictEqual(initiated.releaseCode, 'axis:axisBaseline');
    assert.strictEqual(initiated.publication.state, 'PENDING_APPROVAL');
    assert.strictEqual(initiated.review.releaseChecksum, 'release-checksum');
    assert.strictEqual(initiated.review.publicationCode, 'cmsBaseline_axis_1_0_0');
    assert.strictEqual(initiated.review.validation.status, 'PASSED');
    assert.deepStrictEqual(operations.map(item => item[0]), ['install', 'create', 'validate', 'requestApproval']);
    assert.strictEqual(operations[1][1].rootType, 'site');
    assert.strictEqual(operations[1][1].rootCode, 'axisCmsSite');
    assert.strictEqual(operations[1][2].principalId, 'admin');
    assert(!operations.some(item => item[0] === 'approve' || item[0] === 'activate'),
        'baseline initiation must never approve or deploy Online');
    const replay = await service.initiate('axis', request);
    assert.strictEqual(replay.publication.state, 'PENDING_APPROVAL');
    assert.strictEqual(replay.publication.workflowRef, 'workflow-cmsBaseline_axis_1_0_0-2');
    assert.strictEqual(operations.filter(item => item[0] === 'install').length, 1);
    assert.strictEqual(operations.filter(item => item[0] === 'requestApproval').length, 2);
    lifecycle = Object.assign({}, lifecycle, { state: 'FAILED', revision: 3 });
    const retried = await service.initiate('axis', request);
    assert.strictEqual(retried.publication.state, 'PENDING_APPROVAL');
    assert.strictEqual(operations.filter(item => item[0] === 'retry').length, 1);
    assert.strictEqual(operations.filter(item => item[0] === 'requestApproval').length, 3);
    const status = await service.status('axis', request);
    assert.strictEqual(status.readiness, 'PUBLICATION_PENDING');
    publication.runtimeRole = 'ONLINE';
    await assert.rejects(service.status('axis', request), error => error.code === 'CMS_BASELINE_SOURCE_ROLE_INVALID');
    console.log('CMS publication baseline service validated');
})().catch(error => { console.error(error); process.exit(1); });
