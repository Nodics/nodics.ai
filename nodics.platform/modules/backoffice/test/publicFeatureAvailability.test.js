/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const test = require('node:test');
const assert = require('node:assert/strict');
const contract = require('../src/service/contract/defaultBackofficeContractService');
const registry = require('../src/service/registry/defaultBackofficeRegistryService');

test('existing public bootstrap projects selected owner metadata and omits unobserved/conflicting sources', async () => {
  const original = global.SERVICE;
  global.SERVICE = { DefaultBackofficeContractService: contract };
  try {
    const features = { contractVersion: 1, features: { enterpriseMembershipDiscovery: false } };
    let leases = [{ moduleName: 'profile', server: 'selected', state: 'UP', clientCallable: true,
      endpoint: 'http://profile', backoffice: { publicFeatureAvailability: features, navigation: [{ secret: true }] } }];
    const owner = { ...registry,
      getConfiguration: () => ({ publicBootstrap: { enabled: true, requiredModules: {
        profile: { moduleName: 'profile', server: 'selected' } } } }),
      getClientContractVersion: () => 1, expireStale: async () => {},
      getStore: () => ({ values: async () => leases.map(value => ({ value })) }),
      clientEndpoint: item => item.endpoint,
      publicBootstrapFallbackEndpoint: () => 'http://fallback',
    };
    let result = await owner.publicBootstrap({});
    assert.deepEqual(result.data.featureAvailability, { profile: features });
    assert.equal(JSON.stringify(result).includes('secret'), false);
    leases.push({ ...leases[0], backoffice: {} });
    assert.deepEqual((await owner.publicBootstrap({})).data.featureAvailability, {});
    leases = [{ ...leases[0], state: 'DOWN' }];
    assert.deepEqual((await owner.publicBootstrap({})).data.featureAvailability, {});
    leases = [{ ...leases[0], state: 'UP', server: 'other' }];
    assert.deepEqual((await owner.publicBootstrap({})).data.featureAvailability, {});
  } finally { global.SERVICE = original; }
});

test('public owner observations are bounded, strictly typed and require unanimous lease evidence', () => {
  const original = global.SERVICE;
  global.SERVICE = { DefaultBackofficeContractService: contract };
  try {
    const value = { contractVersion: 1, features: { enterpriseMembershipDiscovery: false } };
    const lease = { backoffice: { publicFeatureAvailability: value } };
    assert.equal(contract.validateBackofficeMetadata(lease.backoffice), true);
    assert.deepEqual(registry.publicFeatureAvailability([lease, structuredClone(lease)]), value);
    assert.equal(registry.publicFeatureAvailability([]), undefined);
    assert.equal(registry.publicFeatureAvailability([lease, {}]), undefined);
    const other = structuredClone(lease);
    other.backoffice.publicFeatureAvailability.features.enterpriseMembershipDiscovery = true;
    assert.equal(registry.publicFeatureAvailability([lease, other]), undefined);
    for (const invalid of [null, { ...value, secret: 'no' }, { ...value, contractVersion: 2 },
      { ...value, features: [] }, { ...value, features: { enabled: 'false' } }]) {
      assert.equal(contract.validatePublicFeatureAvailability(invalid), false);
      assert.equal(contract.validateBackofficeMetadata({ publicFeatureAvailability: invalid }), false);
    }
  } finally { global.SERVICE = original; }
});
