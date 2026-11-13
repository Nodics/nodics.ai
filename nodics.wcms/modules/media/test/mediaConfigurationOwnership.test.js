/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module media/test/mediaConfigurationOwnership @description Verifies owner workspace data, isolated overrides and publication-context registration without enabling retained publication. @owner media @layer test */
const test = require('node:test');
const assert = require('node:assert/strict');
const defaults = require('../config/properties');
const data = require('../data/backoffice/mediaLibraryWorkspaceData');
const capability = require('../src/service/defaultMediaBackofficeCapabilityService');
const bindings = require('../../../../nodics.foundation/modules/nConfig/src/service/defaultConfigurationBindingService');
test('workspace defaults are data and tuning cannot mutate subsequent projections', (t) => {
    const previous = global.CONFIG;
    t.after(() => {
        global.CONFIG = previous;
    });
    let properties = {
        media: { library: { workspace: { title: 'Partner Library' } } },
    };
    global.CONFIG = { get: (key) => properties[key] };
    const selected = capability
        .getCapability()
        .navigation.find((entry) => entry.id === 'media-library');
    assert.equal(selected.backendWorkspace.title, 'Partner Library');
    assert.equal(
        selected.backendWorkspace.tabs.length,
        data.workspace.tabs.length,
    );
    selected.backendWorkspace.tabs.length = 0;
    properties = defaults;
    assert.equal(
        capability
            .getCapability()
            .navigation.find((entry) => entry.id === 'media-library')
            .backendWorkspace.title,
        'Media Library',
    );
    assert(data.workspace.tabs.length > 0);
    assert.deepEqual(defaults.media.library.workspace, {});
    assert.deepEqual(defaults.media.library.publicationWorkspace, {});
    assert(defaults.media.library.review.maximumPreviewBytes > 0);
    assert(defaults.media.library.review.previewMimeTypes.includes('image/png'));
});
test('Media publication-context registration leaves installed qualification and endpoints unselected', () => {
    const resolve = publication => bindings.resolve(defaults, {}, {
        serverCode: 'arbitraryHost', readRuntimeProperty: () => publication,
    });
    const staged = resolve('STAGED');
    assert.equal(
        staged.publish.providers.versionProviders.media,
        'DefaultMediaPublicationVersionProviderService',
    );
    assert.equal(staged.media.publication.versionProviderEnabled, false);
    assert.equal(staged.media.publication.target.connectionName, '');
    assert.equal(
        staged.schemaPolicies.media.publicationVersioned.isVersionedEnabled,
        true,
    );
    assert(!staged.schemaPolicies.media.publicationVersioned.backoffice.operations.includes('delete'));
    const online = resolve('ONLINE');
    assert.equal(online.media.publication.runtimeRole, 'ONLINE');
    assert.equal(online.media.publication.versionProviderEnabled, false);
    assert.equal(online.publish.providers.versionProviders.media, null);
    assert.equal(online.schemaPolicies.media.publicationVersioned.isVersionedEnabled, false);
    const operational = resolve('OPERATIONAL');
    assert.equal(operational.media.publication.targetTransportProvider, null);
    assert.equal(operational.publish.providers.versionProviders.media, null);
    assert.throws(() => resolve(undefined), /publication context/i);
});
