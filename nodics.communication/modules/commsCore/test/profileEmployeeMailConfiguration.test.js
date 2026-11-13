/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module commsCore/test/profileEmployeeMailConfiguration @description Exercises Framework-owned employee resource selection through the actual nConfig binding owner; selection grants no delivery or source authority. @layer test @owner commsCore */
const test = require('node:test');
const assert = require('node:assert/strict');
const defaults = require('../config/properties');
const bindings = require('../../../../nodics.foundation/modules/nConfig/src/service/defaultConfigurationBindingService');
function resources(selection) {
    const definitions = defaults.activeModules?.compositions || {};
    return bindings.resolve({ communication: { templateResources: { modules: defaults.communication.templateResources.modules } } }, {}, {
        readBootstrapCompositionDefinitions: () => definitions,
        readLayeredProperty: () => selection === undefined ? definitions : bindings.merge(definitions, { employeeMail: { selection } }),
    }).communication.templateResources.modules;
}
test('Framework owns complete unselected employee resource defaults', () => {
    assert.equal(defaults.activeModules?.compositions?.employeeMail?.selection, 'none');
    assert.equal(resources().profile, false);
});
test('explicit employee resource selection uses nConfig without enabling delivery or trust', () => {
    assert.equal(resources('employee').profile, true);
    assert.equal(resources('none').profile, false);
    assert.deepEqual(defaults.communication.trustedSourceModules, []);
    assert.equal(require('../../smtpCommsProvider/config/properties').smtpCommsProvider.enabled, false);
    assert.deepEqual(bindings.merge({ modules: resources('employee') }, { modules: { profile: false } }).modules, { profile: false });
});
