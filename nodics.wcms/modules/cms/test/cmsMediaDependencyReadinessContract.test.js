/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */

/**
 * @module cms/test/cmsMediaDependencyReadinessContract
 * @description Protects exact-release dependency qualification, separate Media approval and fail-closed readiness.
 */
const assert = require('node:assert/strict');
const { describe, it, beforeEach } = require('node:test');
const consumer = require('../src/service/publication/defaultCmsMediaDependencyReadinessService');
const baseline = require('../src/service/publication/defaultCmsPublicationBaselineService');

describe('CMS retained Media dependency readiness', () => {
    let asset;
    let root;
    let active;
    let actual;
    let policy;
    let calls;
    let request;
    let publication;
    beforeEach(() => {
        asset = {
            code: 'hero',
            versionId: 4,
            name: 'Hero',
            folderCode: 'cmsAssets',
            formatCode: 'original',
            originalFileName: 'hero.png',
            mimeType: 'image/png',
            sizeBytes: 5,
            checksum: 'a'.repeat(64),
            checksumAlgorithm: 'sha256',
            access: 'PUBLIC',
            reusable: true
        };
        actual = { ...asset };
        publication = {
            code: 'site-publication',
            state: 'ONLINE',
            targetVersion: 'site-manifest',
            mediaCodes: ['hero']
        };
        root = {
            code: 'site-manifest',
            publicationCode: publication.code,
            mediaAssets: [asset]
        };
        active = { version: 'b'.repeat(64), revision: 2 };
        policy = { versionProviderEnabled: true, maximumAssets: 2 };
        calls = [];
        request = {
            tenant: 'tenant-a',
            authData: { principalId: 'scoped-owner' }
        };
        global.CONFIG = {
            get: (key) =>
                key === 'media'
                    ? { publication: policy }
                    : { publication: { maxBundleRoutes: 2 } }
        };
        global.SERVICE = {
            DefaultCmsMediaDependencyReadinessService: consumer,
            DefaultCmsPublicationVersionProviderService: {
                manifests: () => ({
                    getManifest: async (code, context) => {
                        calls.push(['cms', code, context]);
                        return root;
                    }
                })
            },
            DefaultMediaPublicationVersionProviderService: {
                transport: () => ({
                    reconcile: async (input, context) => {
                        calls.push(['physical', input, context]);
                        return {
                            ...input,
                            intact: true,
                            active: true,
                            repaired: false,
                            deleted: false
                        };
                    }
                }),
                getOnlineVersion: async (input, context) => {
                    calls.push(['status', input, context]);
                    return active;
                },
                getVersion: async (input, context) => {
                    calls.push(['version', input, context]);
                    return {
                        code: active.version,
                        artifacts: { asset: actual }
                    };
                }
            }
        };
    });
    it('qualifies only the exact pinned CMS asset using owner APIs and unchanged context', async () => {
        const result = await consumer.inspect(publication, request);
        assert.equal(result.qualified, true);
        assert.equal(result.dependencies[0].status, 'ACTIVE');
        assert.equal(calls.length, 5);
        assert.deepEqual(calls[1][1], { rootCode: 'hero' });
        assert.equal(calls[2][1].sourceVersion, active.version);
        for (const call of calls) assert.equal(call[2], request);
        assert.equal(JSON.stringify(result).includes('contentBase64'), false);
    });
    it('reports separate normal approval when CMS is Online but Media is not activated', async () => {
        active = null;
        const result = await consumer.inspect(publication, request);
        assert.equal(result.qualified, false);
        assert.equal(result.dependencies[0].status, 'NOT_ACTIVATED');
        assert.equal(calls.length, 2);
        assert.deepEqual(result.dependencies[0].publicationRequest.input, {
            mediaCode: 'hero',
            versionId: 4
        });
        assert.equal(
            result.dependencies[0].publicationRequest.automaticExecution,
            false
        );
        assert.equal(
            result.dependencies[0].publicationRequest.approvalRequired,
            true
        );
    });
    it('does not accept matching bytes at another metadata version', async () => {
        actual.versionId = 5;
        const result = await consumer.inspect(publication, request);
        assert.equal(result.qualified, false);
        assert.equal(result.dependencies[0].status, 'VERSION_MISMATCH');
    });
    it('requires target-owned physical byte verification without any repair command', async () => {
        SERVICE.DefaultMediaPublicationVersionProviderService.transport =
            () => ({
                reconcile: async (input) => ({
                    ...input,
                    intact: false,
                    active: true,
                    repaired: false,
                    deleted: false
                })
            });
        const result = await consumer.inspect(publication, request);
        assert.equal(result.qualified, false);
        assert.equal(result.dependencies[0].status, 'BYTES_UNAVAILABLE');
    });
    it('does not silently refresh or rebase when activation changes during inspection', async () => {
        let count = 0;
        SERVICE.DefaultMediaPublicationVersionProviderService.getOnlineVersion =
            async () => ({ ...active, revision: ++count });
        const result = await consumer.inspect(publication, request);
        assert.equal(result.qualified, false);
        assert.equal(result.dependencies[0].status, 'ACTIVATION_CHANGED');
        assert.equal(count, 2);
    });
    it('never guesses a latest version for an old unpinned CMS manifest', async () => {
        delete asset.versionId;
        const result = await consumer.inspect(publication, request);
        assert.equal(result.qualified, false);
        assert.equal(result.dependencies[0].status, 'VERSION_UNPINNED');
        assert.equal(result.dependencies[0].publicationRequest, undefined);
        assert.equal(calls.length, 1);
    });
    it('fails closed on missing manifest, omitted declared assets, or malformed target evidence', async () => {
        root = undefined;
        assert.equal(
            (await consumer.inspect(publication, request)).status,
            'UNAVAILABLE'
        );
        root = {
            code: 'site-manifest',
            publicationCode: publication.code,
            mediaAssets: []
        };
        assert.equal(
            (await consumer.inspect(publication, request)).status,
            'UNAVAILABLE'
        );
        root.mediaAssets = [asset];
        active = {};
        assert.equal(
            (await consumer.inspect(publication, request)).status,
            'UNAVAILABLE'
        );
    });
    it('sanitizes denial without fabricating readiness or triggering mutation', async () => {
        SERVICE.DefaultMediaPublicationVersionProviderService.getOnlineVersion =
            async () => {
                throw new Error('secret path');
            };
        const result = await consumer.inspect(publication, request);
        assert.equal(result.qualified, false);
        assert.equal(result.status, 'UNAVAILABLE');
        assert.equal(JSON.stringify(result).includes('secret path'), false);
    });
    it('preserves explicitly non-retained deployment behavior without guessing another runtime', async () => {
        policy.versionProviderEnabled = false;
        assert.equal(
            (await consumer.inspect(publication, request)).status,
            'NOT_REQUIRED'
        );
        assert.equal(calls.length, 0);
    });
    it('reports NOT_REQUIRED for an exact CMS release with no required Media assets', async () => {
        publication.mediaCodes = [];
        root.mediaAssets = [];
        const result = await consumer.inspect(publication, request);
        assert.equal(result.status, 'NOT_REQUIRED');
        assert.equal(result.qualified, true);
        assert.deepEqual(result.dependencies, []);
        assert.equal(calls.length, 1);
    });
    it('takes the review handoff from the Media owner without manufacturing command authority', async () => {
        SERVICE.DefaultMediaBackofficeCapabilityService = {
            getCapability: () => ({
                navigation: [
                    {
                        id: 'media-publication-requests',
                        route: '/custom/media/review',
                        label: 'Custom review',
                        featureState: 'ACTIVE',
                        requiredPermissions: ['publish.lifecycle.create'],
                        backendWorkspace: { workspaceCode: 'media.publication' }
                    }
                ]
            })
        };
        active = null;
        const result = await consumer.inspect(publication, request);
        const handoff = result.dependencies[0].handoff;
        assert.equal(handoff.route, '/custom/media/review');
        assert.equal(handoff.label, 'Custom review');
        assert.equal(handoff.requiresOwnerInspection, true);
        assert.equal(handoff.automaticExecution, false);
        assert.deepEqual(handoff.query, { mediaCode: 'hero' });
        assert.equal(result.qualified, false);
    });
    it('rejects oversized or mismatched chunked child manifests rather than omitting their dependencies', async () => {
        root.snapshot = { bundleType: 'SITE_INDEX', routes: [{}, {}, {}] };
        assert.equal(
            (await consumer.inspect(publication, request)).status,
            'UNAVAILABLE'
        );
        root.snapshot.routes = [
            { manifestCode: 'child', contentHash: 'expected' }
        ];
        assert.equal(
            (await consumer.inspect(publication, request)).status,
            'UNAVAILABLE'
        );
    });
    it('keeps CMS ONLINE separate from application READY in the baseline status API', async () => {
        active = null;
        const owner = Object.create(baseline);
        owner.assertStaged = () => {};
        owner.descriptor = () => ({ code: 'site' });
        owner.release = async () => ({
            releaseCode: 'site-release',
            version: '1',
            status: 'CURRENT'
        });
        owner.publication = async () => publication;
        owner.approvalDiagnostic = async () => undefined;
        owner.review = () => ({});
        owner.publicationDiagnostic = () => ({});
        owner.publicationDependencyGraph = () => ({});
        const result = await owner.status('site', request);
        assert.equal(result.publication.state, 'ONLINE');
        assert.equal(result.readiness, 'MEDIA_DEPENDENCIES_PENDING');
        assert.equal(result.mediaDependencies.qualified, false);
    });
    it('explicit Initialize submits new approval for an unpinned Online baseline without reinstall or activation', async () => {
        delete asset.versionId;
        let lifecycle = { ...publication, revision: 7 };
        const operations = [];
        const owner = Object.create(baseline);
        owner.assertStaged = () => {};
        owner.descriptor = () => ({
            code: 'site',
            rootCode: 'site',
            rootType: 'site',
            sourceVersion: '0',
            releaseVersion: '1'
        });
        owner.release = async () => ({
            status: 'CURRENT',
            releaseCode: 'site-release',
            version: '1'
        });
        owner.publication = async () => lifecycle;
        owner.actorRequest = (context) => context;
        owner.review = () => ({});
        SERVICE.DefaultDataReleaseService = {
            execute: async () => {
                throw new Error('Current data must not be reinstalled');
            }
        };
        SERVICE.DefaultPublicationLifecycleService = {
            validate: async (input) => {
                operations.push(['validate', input.expectedRevision]);
                lifecycle = {
                    ...lifecycle,
                    state: 'VALIDATED',
                    revision: lifecycle.revision + 1
                };
                return lifecycle;
            },
            requestApproval: async (input) => {
                operations.push(['requestApproval', input.expectedRevision]);
                lifecycle = {
                    ...lifecycle,
                    state: 'PENDING_APPROVAL',
                    revision: lifecycle.revision + 1,
                    workflowRef: 'fresh-review'
                };
                return lifecycle;
            }
        };
        const result = await owner.initiate('site', request);
        assert.equal(result.readiness, 'PUBLICATION_PENDING');
        assert.equal(result.publication.state, 'PENDING_APPROVAL');
        assert.equal(result.publication.workflowRef, 'fresh-review');
        assert.deepEqual(operations, [
            ['validate', 7],
            ['requestApproval', 8]
        ]);
        assert.equal(root.mediaAssets[0].versionId, undefined);
        assert.equal(root.code, 'site-manifest');
    });
});
