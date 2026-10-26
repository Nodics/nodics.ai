/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const test = require('node:test');
const assert = require('node:assert/strict');
const provider = require('../src/service/defaultProfileBackofficeCapabilityService');
const properties = require('./helpers/identityCatalogueFixture').properties();

test('Profile projects existing defaults and independent qualified opt-ins without grants', () => {
  const original = global.CONFIG;
  try {
    let exposure = false;
    global.CONFIG = { get: () => ({ categories: { profileMembership: { enabled: exposure } } }) };
    const memberships = { ...properties.enterpriseManagement.memberships };
    const owner = { ...provider, getEnterpriseManagementConfig: () => ({ memberships }) };
    const read = () => owner.getCapability().publicFeatureAvailability.features;
    assert.deepEqual(read(), { enterpriseMembershipDiscovery: false, enterpriseMembershipSwitch: false });
    Object.assign(memberships, { enabled: true, inventoryQualified: true, sessionBindingQualified: true,
      assignmentClaimIndexQualified: true, browserContextSwitchQualified: true });
    assert.equal(read().enterpriseMembershipDiscovery, false);
    exposure = true;
    assert.deepEqual(read(), { enterpriseMembershipDiscovery: true, enterpriseMembershipSwitch: true });
    for (const key of ['enabled', 'inventoryQualified', 'sessionBindingQualified', 'assignmentClaimIndexQualified']) {
      memberships[key] = false;
      assert.equal(read().enterpriseMembershipSwitch, false);
      memberships[key] = true;
    }
    memberships.browserContextSwitchQualified = false;
    assert.deepEqual(read(), { enterpriseMembershipDiscovery: true, enterpriseMembershipSwitch: false });
    assert.deepEqual(owner.getCapability().requiredPermissions, ['profile.backoffice.view']);
  } finally { global.CONFIG = original; }
});
