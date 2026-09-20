/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module import/test/releaseGovernanceDefaults @description Proves required lifecycle and destination defaults, explicit legacy compatibility and Online denial. @layer test @owner import */
const assert = require('node:assert/strict');
const test = require('node:test');
const definition = require('../src/service/release/defaultDataReleaseService');
const defaults = require('../config/properties').data.dataReleases;
test('release safeguards inherit from nImport while runtime roles and exceptions remain deployment-owned', () => {
    let policy = { ...defaults },
        role = { code: 'WAREHOUSE' };
    const service = {
        ...definition,
        configuration: () => policy,
        error: (code, message) => Object.assign(new Error(message), { code }),
    };
    global.CONFIG = { get: (key) => (key === 'runtimeRole' ? role : key === 'environment' ? {class:'QA'} : undefined) };
    assert.equal(policy.lifecycleMetadataRequired, true);
    assert.equal(policy.destinationEnforced, true);
    assert.throws(() => service.validateLifecycleMetadata({}, 'warehouse', 'core'), /incomplete/);
    assert.throws(() => service.validateDestination({ environmentScope: ['QA'] }), /metadata/);
    assert.equal(
        service.validateDestination({
            destinationRole: 'WAREHOUSE',
            environmentScope: ['QA'],
        }),
        true,
    );
    assert.throws(
        () =>
            service.validateDestination({
                destinationRole: 'CONTENT',
                environmentScope: ['QA'],
            }),
        /destination/,
    );
    assert.throws(
        () =>
            service.validateDestination({
                destinationRole: 'WAREHOUSE',
                environmentScope: ['PROD'],
            }),
        /environment/,
    );
    role = { code: 'WCMS_ONLINE' };
    policy.allowedDestinationRoles = [];
    assert.throws(
        () =>
            service.validateDestination({
                destinationRole: 'WCMS_ONLINE',
                environmentScope: ['QA'],
            }),
        /destination/,
    );
    policy.lifecycleMetadataRequired = false;
    assert.equal(service.validateLifecycleMetadata({}, 'legacy', 'core'), undefined);
});

test('profile mechanics inherit from an inert owner template and later explicit steps replace it', () => {
    let policy = {
        initializationProfileDefaults: {
            foundation: { steps: [{ dataType: 'init' }, { dataType: 'core' }] },
        },
        initializationProfiles: {
            warehouse: {
                enabled: true,
                template: 'foundation',
                label: 'Warehouse foundation',
                description: 'Prepare the selected warehouse runtime.',
                completionMessage: 'The warehouse foundation is ready.',
            },
        },
    };
    const service = {
        ...definition,
        configuration: () => policy,
        error: (code, message) => Object.assign(new Error(message), { code }),
    };
    assert.deepEqual(
        service.initializationProfiles().warehouse.steps.map((step) => step.dataType),
        ['init', 'core'],
    );
    policy.initializationProfiles.warehouse.steps = [
        { dataType: 'core', releaseCodes: ['warehouse:core-v001'] },
    ];
    assert.equal(service.initializationProfiles().warehouse.steps.length, 1);
    assert.equal(policy.initializationProfileDefaults.foundation.steps.length, 2);
    policy.initializationProfiles.warehouse.template = 'missing';
    assert.throws(() => service.initializationProfiles(), /template is unavailable/);
    policy.initializationProfiles.warehouse.enabled = false;
    assert.deepEqual(service.initializationProfiles(), {});
});
