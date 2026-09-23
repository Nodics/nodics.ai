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

test('catalogue items expose backend-owned preparation readiness guidance', () => {
    const service = {
        ...definition,
        error: (code, message) => Object.assign(new Error(message), { code }),
    };
    const release = {
        releaseCode: 'profile:core-v001',
        sectionCode: 'core-v001',
        moduleName: 'profile',
        displayName: 'Profile core data',
        canonicalIdentity: 'nodics.platform/modules/profile',
        dataType: 'core',
        version: '1.0.0',
        description: 'Profile baseline records',
        checksum: 'a'.repeat(64),
    };
    const item = service.toCatalogueItem(release, { version: '0.9.0', checksum: 'b'.repeat(64) }, false);
    assert.equal(item.status, 'UPDATE_AVAILABLE');
    assert.equal(item.readiness.businessStatus, 'NEEDS_ATTENTION');
    assert.equal(item.readiness.blockers[0].code, 'VERSION_MISMATCH');
    assert.equal(item.readiness.blockers[0].action, 'Update release');
    assert.equal(item.readiness.blockers[0].repair.operation, 'dataRelease.install');
    assert.equal(item.readiness.blockers[0].repair.action, 'UPDATE_RELEASE');
    assert.equal(item.readiness.blockers[0].repair.available, true);
    const current = service.toCatalogueItem(release, { version: '1.0.0', checksum: release.checksum }, false);
    assert.equal(current.readiness.businessStatus, 'PREPARED_STAGED');
    assert.deepEqual(current.readiness.blockers, []);
});

test('public catalogue response includes release readiness projection', async () => {
    const previousNodics = global.NODICS;
    global.NODICS = { getSelectedEnvironmentName: () => 'kickoffLocal' };
    const release = {
        releaseCode: 'circa.ewaste:content',
        sectionCode: 'content',
        moduleName: 'circa.ewaste',
        displayName: 'Circa published website',
        canonicalIdentity: 'circa.ewaste',
        dataType: 'sample',
        version: '0.0.1',
        description: 'Circa content records',
        checksum: 'c'.repeat(64),
        lifecycle: 'PUBLISHABLE',
        capability: {
            code: 'circa.ewaste',
            displayName: 'Circa eWaste',
            type: 'ACCELERATOR',
            group: 'PROJECT_ACCELERATOR',
            extendsCapability: 'ewaste',
            businessOutcome: 'Prepare the Circa customer eWaste experience.',
        },
    };
    const service = {
        ...definition,
        resolveTenant: () => 'default',
        discoverReleases: () => [release],
        isDestinationCompatible: () => true,
        getInstallations: async () => [],
        error: (code, message) => Object.assign(new Error(message), { code }),
    };
    try {
        const response = await service.getCatalogue({ dataType: 'sample' });
        assert.equal(response.code, 'SUC_IMP_00000');
        assert.equal(response.data.length, 1);
        assert.equal(response.data[0].readiness.capabilityCode, 'circa.ewaste');
        assert.equal(response.data[0].readiness.displayName, 'Circa eWaste');
        assert.equal(response.data[0].readiness.group, 'PROJECT_ACCELERATOR');
        assert.equal(response.data[0].readiness.businessStatus, 'NOT_PREPARED');
        assert.equal(response.data[0].readiness.blockers[0].action, 'Prepare capability');
        assert.equal(response.data[0].readiness.blockers[0].repair.action, 'PREPARE_CAPABILITY');
    } finally {
        global.NODICS = previousNodics;
    }
});

test('release capability metadata overrides derived readiness identity without exposing unsafe fields', () => {
    const service = {
        ...definition,
        error: (code, message) => Object.assign(new Error(message), { code }),
    };
    const capability = service.validateCapabilityMetadata({
        code: 'circa.ewaste',
        displayName: 'Circa eWaste',
        type: 'ACCELERATOR',
        group: 'PROJECT_ACCELERATOR',
        extendsCapability: 'ewaste',
        businessOutcome: 'Prepare the Circa customer eWaste experience.',
        ignoredUnsafeValue: '<script>',
    }, 'circa.ewaste', 'content');
    const release = {
        releaseCode: 'circa.ewaste:content',
        sectionCode: 'content',
        moduleName: 'circa.ewaste',
        displayName: 'Circa published website',
        canonicalIdentity: 'circa.ewaste',
        dataType: 'sample',
        version: '0.0.1',
        description: 'Circa content records',
        checksum: 'c'.repeat(64),
        lifecycle: 'PUBLISHABLE',
        capability,
    };
    const item = service.toCatalogueItem(release, undefined, false);
    assert.equal(item.readiness.capabilityCode, 'circa.ewaste');
    assert.equal(item.readiness.displayName, 'Circa eWaste');
    assert.equal(item.readiness.group, 'PROJECT_ACCELERATOR');
    assert.equal(item.readiness.capabilityType, 'ACCELERATOR');
    assert.equal(item.readiness.extendsCapability, 'ewaste');
    assert.equal(item.readiness.businessOutcome, 'Prepare the Circa customer eWaste experience.');
    assert.equal(Object.hasOwn(item.readiness, 'ignoredUnsafeValue'), false);
    assert.throws(() => service.validateCapabilityMetadata({ code: 'bad code' }, 'm', 's'), /Capability code is invalid/);
});
