/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module nTooling/test/concreteDefaultOwnership @description Protects configuration placement in implementing consumers rather than loader or composition groups. @owner nTooling @layer test */
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = path.resolve(__dirname, '../../../..');
const read = (file) => require(path.join(root, file, 'config/properties'));

test('composition groups retain composition, not unused or child implementation policy', () => {
    assert.equal(read('nodics.commerce').commerce, undefined);
    assert.equal(read('nodics.process').process, undefined);
    assert.equal(read('nodics.loyalty').loyalty, undefined);
    assert.equal(read('nodics.rulesEngine').rulesEngine, undefined);
    assert.equal(
        read('nodics.rulesEngine/modules/rulesDefinition').rulesEngine.limits
            .maximumGroupDepth,
        5,
    );
    assert.equal(
        read('nodics.process/modules/workflow').process.designer.enabled,
        false,
    );
    assert.equal(
        read('nodics.process/modules/workflow').data.dataReleases
            .runtimeRoleProfiles.PROCESS.installers.PROCESS_DEFINITION,
        'DefaultProcessDefinitionContributionService',
    );
    assert.equal(
        read('nodics.commerce/modules/checkout/modules/cart').cart.limits
            .maximumCartEntries,
        500,
    );
});
test('loader does not own HTTP, consumer retry, or dead username policy', () => {
    const config = read('nodics.foundation/modules/nConfig');
    for (const key of [
        'defaultContentType',
        'processRetrySleepTime',
        'illegalUsernames',
    ])
        assert.equal(config[key], undefined);
    assert.equal(
        read('nodics.foundation/modules/nService').defaultContentType,
        'application/json',
    );
    assert.equal(
        read('nodics.process/modules/cronjob').cronjob.processRetrySleepTime,
        2000,
    );
    assert.equal(
        read('nodics.foundation/modules/nEms/emsClient').emsClient
            .processRetrySleepTime,
        2000,
    );
});
