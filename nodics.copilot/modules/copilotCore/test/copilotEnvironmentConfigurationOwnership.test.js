/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/** @module copilotCore/test/copilotEnvironmentConfigurationOwnership @description Proves trusted context projection follows active capability ownership and customer-overridable without provider or API activation. @layer test @owner copilotCore */
const assert = require('node:assert/strict');
const test = require('node:test');
const binding = require('../../../../nodics.foundation/modules/nConfig/src/service/defaultConfigurationBindingService');
const properties = require('../config/properties');

test('environment metadata follows the active owner and remains deployment-overridable', () => {
    assert.equal(properties.copilot.runtimeRoleProfiles, undefined);
    for (const environmentCode of ['catalogueDeployment', 'recoveryDeployment']) {
        const resolved = binding.resolve(properties, {}, { environmentCode, environmentVariables: {} });
        for (const code of ['PLATFORM', 'CUSTOM_HOST']) {
            const configuration = binding.merge(resolved, { runtimeRole: { code } });
            assert.equal(configuration.copilot.core.environment, environmentCode);
            assert.equal(configuration.copilot.core.customerProject, undefined);
            assert.equal(configuration.copilot.api?.enabled, undefined);
            assert.equal(configuration.copilot.providers?.enabled, undefined);
        }
        const later = binding.merge(resolved, { copilot: { core: { environment: 'customer-selected' } } });
        assert.equal(later.copilot.core.environment, 'customer-selected');
    }
    const missing = binding.resolve(properties, {}, { environmentVariables: {} });
    assert.equal(missing.copilot.core.environment, undefined);
});
