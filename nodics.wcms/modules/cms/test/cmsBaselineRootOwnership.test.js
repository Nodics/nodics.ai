/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module cms/test/cmsBaselineRootOwnership @description Exercises exact content-pack root derivation and refusal without imports, approvals or publication writes. @owner cms @layer test */
const test = require('node:test');
const assert = require('node:assert/strict');
const service = require('../src/service/publication/defaultCmsPublicationBaselineService');
test('only one qualified site from the exact selected immutable pack may supply an omitted root', async (t) => {
    const previous = {
        CONFIG: global.CONFIG,
        SERVICE: global.SERVICE,
        CLASSES: global.CLASSES,
    };
    t.after(() => Object.assign(global, previous));
    global.CLASSES = {
        NodicsError: class extends Error {
            constructor(code, message) {
                super(message);
                this.code = code;
            }
        },
    };
    const selected = {
        contentPackCode: 'exampleDocs',
        releaseVersion: '1.2.3',
        sourceVersion: '0',
    };
    const publication = {
        runtimeRole: 'STAGED',
        baselines: { docs: selected },
    };
    const release = {
        available: true,
        version: '1.2.3',
        manifest: {
            destinationRole: 'WCMS_STAGED',
            lifecycle: 'PUBLISHABLE',
            initialPublicationPolicy: 'ADMIN_INITIATED',
            sites: ['exampleSite'],
        },
    };
    global.CONFIG = { get: () => ({ publication }) };
    global.SERVICE = {
        DefaultContentPackService: {
            resolvePackContext: (code) => {
                assert.equal(code, 'exampleDocs');
                return { code };
            },
            inspectRelease: () => structuredClone(release),
        },
    };
    const resolved = service.descriptor('docs');
    assert.equal(resolved.rootType, 'site');
    assert.equal(resolved.rootCode, 'exampleSite');
    assert.equal(resolved.releaseVersion, '1.2.3');
    assert.equal(selected.rootCode, undefined);
    release.manifest.sites.push('secondSite');
    assert.throws(
        () => service.descriptor('docs'),
        (error) => error.code === 'CMS_BASELINE_RELEASE_INVALID',
    );
    release.manifest.sites = ['exampleSite'];
    release.version = '1.2.4';
    assert.throws(
        () => service.descriptor('docs'),
        (error) => error.code === 'CMS_BASELINE_RELEASE_INVALID',
    );
    const status = await service.status('docs', { tenant: 'example' });
    assert.equal(status.releaseStatus, 'INVALID_RELEASE');
    assert.equal(status.readiness, 'BLOCKED');
    delete selected.releaseVersion;
    assert.throws(
        () => service.descriptor('docs'),
        (error) => error.code === 'CMS_BASELINE_UNAVAILABLE',
    );
});
