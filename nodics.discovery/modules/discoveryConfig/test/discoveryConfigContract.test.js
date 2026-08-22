/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const assert = require('node:assert/strict');
const schemas = require('../src/schemas/schemas');
const resolver = require('../src/service/defaultDiscoveryConfigurationResolverService');
const backoffice = require('../src/service/defaultDiscoveryBackofficeCapabilityService');

/** @module discoveryConfig/test/discoveryConfigContract @description Verifies generic Discovery configuration contracts. @layer test @owner discoveryConfig */

assert(schemas.discoveryConfig.discoveryIndexConfiguration);
assert(schemas.discoveryConfig.discoverySourceMixConfiguration);
assert(schemas.discoveryConfig.discoveryQueryProfile);
assert(schemas.discoveryConfig.discoveryFacetProfile);
assert(schemas.discoveryConfig.discoveryRankingProfile);
assert(schemas.discoveryConfig.discoveryPublicationPolicy);
assert.deepEqual(schemas.discoveryConfig.discoveryIndexConfiguration.definition.ownerType.enum, ['PRODUCT', 'CONTENT', 'PAGE', 'MEDIA', 'DOCUMENTATION']);

global.CONFIG = { get: key => key === 'discovery' ? { runtime: { profiles: { PRODUCT: { indexConfiguration: { code: 'productIndex', indexName: 'productlocalized' } } } } } : undefined };
global.SERVICE = {};

resolver.resolveIndexConfiguration({ tenant: 'default', ownerType: 'PRODUCT' }).then(result => {
    assert.equal(result.code, 'productIndex');
    let registered;
    global.SERVICE = {
        DefaultModuleRegistrationAgentService: { registerBackofficeCapabilityProvider: (name, provider) => { registered = { name, provider }; } },
        DefaultBackofficeCapabilityDefinitionService: { capability: value => value, workbench: value => value }
    };
    return backoffice.init().then(() => {
        let capability = registered.provider.getCapability();
        assert.equal(registered.name, 'discoveryConfig');
        assert.equal(capability.capabilityId, 'discovery-management');
        assert.equal(capability.navigation[0].route, '/discovery/config');
        assert.equal(capability.navigation[0].permission, 'discovery.config.read');
        assert.deepEqual(capability.navigation[0].group, {
            id: 'search-discovery',
            label: 'Search and Discovery',
            order: 600
        });
        console.log('Discovery configuration contract validated');
    });
});
