/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/** @module copilotCore/test/copilotEnvironmentConfigurationOwnership @description Proves trusted context projection remains Platform-scoped and customer-overridable without provider or API activation. @layer test @owner copilotCore */
const assert = require('node:assert/strict');
const test = require('node:test');
const binding = require('../../../../nodics.foundation/modules/nConfig/src/service/defaultConfigurationBindingService');
const loader = require('../../../../nodics.foundation/modules/nConfig/src/service/DefaultFrameworkInitializerService');
const properties = require('../config/properties');

test('environment metadata comes from nConfig context without embedding deployment identities', () => {
    for (const environmentCode of ['catalogueDeployment', 'recoveryDeployment']) {
        const resolved = binding.resolve(properties, {}, { environmentCode, environmentVariables: {} });
        const platform = loader.deriveRuntimeRoleCapabilityProfiles({ ...resolved, runtimeRole: { code: 'PLATFORM' } }).copilot;
        assert.equal(platform.core.environment, environmentCode);
        assert.equal(platform.core.customerProject, undefined);
        assert.equal(platform.api?.enabled, undefined);
        assert.equal(platform.providers?.enabled, undefined);
        const unrelated = loader.deriveRuntimeRoleCapabilityProfiles({ ...resolved, runtimeRole: { code: 'OTHER' } }).copilot;
        assert.equal(unrelated.core.environment, undefined);
        const later = binding.merge(resolved, { copilot: { runtimeRoleProfiles: { PLATFORM: { core: { environment: 'customer-selected' } } } } });
        assert.equal(loader.deriveRuntimeRoleCapabilityProfiles({ ...later, runtimeRole: { code: 'PLATFORM' } }).copilot.core.environment,
            'customer-selected');
    }
    const missing = binding.resolve(properties, {}, { environmentVariables: {} });
    assert.equal(loader.deriveRuntimeRoleCapabilityProfiles({ ...missing, runtimeRole: { code: 'PLATFORM' } }).copilot.core.environment, undefined);
});
