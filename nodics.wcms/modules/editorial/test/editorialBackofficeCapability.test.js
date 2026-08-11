/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');
global.SERVICE = {
    DefaultBackofficeCapabilityDefinitionService: {
        workbench: value => value,
        capability: value => value
    }
};
const provider = require('../src/service/defaultEditorialBackofficeCapabilityService');
const capability = provider.getCapability();
assert.equal(capability.capabilityId, 'wcms-editorial');
assert.equal(capability.navigation.length, 9);
assert.equal(capability.navigation.find(item => item.id === 'editorial-news').presentation.fixedFilters[0].value, 'NEWS');
assert.equal(capability.navigation.find(item => item.id === 'editorial-content').lifecycleActions.length, 5);
assert.equal(capability.navigation.find(item => item.id === 'editorial-content').lifecycleActions[1].ownerModule, 'editorial');
