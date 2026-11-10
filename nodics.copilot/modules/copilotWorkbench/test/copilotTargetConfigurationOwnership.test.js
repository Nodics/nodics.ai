/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/** @module copilotWorkbench/test/copilotTargetConfigurationOwnership @description Proves capability-owned logical target defaults without selecting a deployment or activating commands. @layer test @owner copilotWorkbench */
const assert = require('node:assert/strict');
const test = require('node:test');
const binding = require('../../../../nodics.foundation/modules/nConfig/src/service/defaultConfigurationBindingService');
const properties = require('../config/properties');
const orchestration = require('../../copilotCore/src/service/defaultCopilotOrchestrationService');

test('logical owner module defaults select no connection, authority or write enablement', () => {
    assert.equal(properties.copilot.runtimeRoleProfiles, undefined);
    for (const code of ['PLATFORM', 'CUSTOM_HOST']) {
        const configuration = binding.merge(properties, { runtimeRole: { code } }).copilot;
        assert.deepEqual(orchestration.actionTarget(configuration), {
            productModule: 'product', pricingModule: 'pricing', connectionName: null, targetAuthority: null,
        });
        assert.equal(configuration.workbench.standalonePricesEnabled, false);
        assert.equal(configuration.workbench.standaloneInvitationsEnabled, false);
        assert.equal(configuration.workbench.requireValidation, true);
        assert.equal(configuration.workbench.requireConfirmation, true);
    }
    for (const connectionName of ['catalogueSource', 'recoverySource']) {
        const customized = binding.merge(properties, { copilot: {
            workbench: { target: { productModule: 'customProduct', connectionName, targetAuthority: { publication: 'STAGED' } } },
        } });
        assert.deepEqual(orchestration.actionTarget(customized.copilot), {
            productModule: 'customProduct', pricingModule: 'pricing', connectionName,
            targetAuthority: { publication: 'STAGED' },
        });
    }
});
