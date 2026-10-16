/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/** @module copilotWorkbench/test/copilotTargetConfigurationOwnership @description Proves role-scoped logical target defaults without selecting a deployment or activating commands. @layer test @owner copilotWorkbench */
const assert = require('node:assert/strict');
const test = require('node:test');
const binding = require('../../../../nodics.foundation/modules/nConfig/src/service/defaultConfigurationBindingService');
const loader = require('../../../../nodics.foundation/modules/nConfig/src/service/DefaultFrameworkInitializerService');
const properties = require('../config/properties');
const orchestration = require('../../copilotCore/src/service/defaultCopilotOrchestrationService');

test('logical owner module defaults select no connection, authority or write enablement', () => {
    const platform = loader.deriveRuntimeRoleCapabilityProfiles({ ...properties, runtimeRole: { code: 'PLATFORM' } }).copilot;
    assert.deepEqual(orchestration.actionTarget(platform), {
        productModule: 'product', pricingModule: 'pricing', connectionName: null, targetAuthority: null,
    });
    assert.equal(platform.workbench.standalonePricesEnabled, false);
    assert.equal(platform.workbench.standaloneInvitationsEnabled, false);
    assert.equal(platform.workbench.requireValidation, true);
    assert.equal(platform.workbench.requireConfirmation, true);
    for (const role of ['OTHER', 'COMMERCE', 'WASTE']) {
        const unrelated = loader.deriveRuntimeRoleCapabilityProfiles({ ...properties, runtimeRole: { code: role } }).copilot;
        assert.deepEqual(orchestration.actionTarget(unrelated), {
            productModule: null, pricingModule: null, connectionName: null, targetAuthority: null,
        });
    }
    for (const connectionName of ['catalogueSource', 'recoverySource']) {
        const customized = binding.merge(properties, { copilot: { runtimeRoleProfiles: { PLATFORM: {
            workbench: { target: { productModule: 'customProduct', connectionName, targetAuthority: { runtimeRole: 'CUSTOM_STAGED' } } },
        } } } });
        const target = orchestration.actionTarget(loader.deriveRuntimeRoleCapabilityProfiles({
            ...customized, runtimeRole: { code: 'PLATFORM' },
        }).copilot);
        assert.deepEqual(target, { productModule: 'customProduct', pricingModule: 'pricing', connectionName,
            targetAuthority: { runtimeRole: 'CUSTOM_STAGED' } });
    }
});
