/* Nodics — Copyright (c) 2026. Governed by the root LICENSE. */
/** @module profile/test/invitedRegistrationAvailability
 * @description Publishes invitation entry availability only through the actual registration policy.
 * @layer test @owner profile
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const provider = require('../src/service/defaultProfileBackofficeCapabilityService');
const registration = require('../src/service/enterprise/defaultEnterpriseRegistrationService');
const properties = require('./helpers/identityCatalogueFixture').properties();
function observe(change = () => {}, exposure = true, present = true) {
    const previous = { CONFIG: global.CONFIG, SERVICE: global.SERVICE };
    const config = structuredClone(properties.enterpriseManagement);
    Object.assign(config.registration, { enabled: true, inventoryQualified: true, assignmentClaimIndexQualified: true, maximumPasswordLength: 1024 });
    // The authenticated management workspace is independent of this public observation.
    delete config.workspace;
    change(config.registration);
    let policyCalls = 0;
    try {
        global.CONFIG = { get: key => key === 'enterpriseManagement' ? config :
            key === 'apiExposure' ? { categories: { profileRegistration: { enabled: exposure } } } : undefined };
        global.SERVICE = present ? { DefaultEnterpriseRegistrationService: {
            ...registration,
            policy() { policyCalls++; return registration.policy.call(this); },
        } } : {};
        const contribution = { ...provider, getEnterpriseManagementConfig: () => config }.getCapability();
        return { contribution, policyCalls };
    } finally { Object.assign(global, previous); }
}
test('qualified registration contributes a public observation without granting employee authority', () => {
    const { contribution, policyCalls } = observe();
    assert.equal(contribution.publicFeatureAvailability.features.invitedEmployeeRegistration, true);
    assert.equal(policyCalls, 1);
    assert.deepEqual(contribution.requiredPermissions, ['profile.backoffice.view']);
    assert.equal(contribution.publicFeatureAvailability.features.enterpriseMembershipDiscovery, false);
});
for (const [name, change] of [
    ['disabled', p => { p.enabled = false; }],
    ['inventory not qualified', p => { p.inventoryQualified = false; }],
    ['claim index not qualified', p => { p.assignmentClaimIndexQualified = false; }],
    ['unsupported method', p => { p.method = 'EXTERNAL'; }],
    ['missing distributed rate requirement', p => { p.requireDistributedRateLimit = false; }],
    ['invalid lookup bound', p => { p.maximumInventoryPages = 0; }],
    ['invalid password bounds', p => { p.minimumPasswordLength = 1; }],
    ['missing presentation', p => { delete p.presentation; }],
    ['missing rates', p => { delete p.rates; }],
]) {
    test(`original registration policy suppresses the public entry: ${name}`, () => {
        const { contribution, policyCalls } = observe(change);
        assert.equal(contribution.publicFeatureAvailability.features.invitedEmployeeRegistration, false);
        assert.equal(policyCalls, 1);
    });
}
test('unexposed registration never inspects policy or advertises entry', () => {
    const { contribution, policyCalls } = observe(undefined, false);
    assert.equal(contribution.publicFeatureAvailability.features.invitedEmployeeRegistration, false);
    assert.equal(policyCalls, 0);
});
test('absent owner service cannot advertise registration from configuration alone', () => {
    assert.equal(observe(undefined, true, false).contribution.publicFeatureAvailability.features.invitedEmployeeRegistration, false);
});
