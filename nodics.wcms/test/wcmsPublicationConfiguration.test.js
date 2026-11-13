/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module wcms/test/wcmsPublicationConfiguration @description Proves canonical publication context selects owner defaults independently of deployment labels and never qualifies targets. @owner wcms @layer test */
const test = require('node:test');
const assert = require('node:assert/strict');
const bindings = require('../../nodics.foundation/modules/nConfig/src/service/defaultConfigurationBindingService');
for (const owner of ['cms', 'editorial', 'media']) {
    test(owner + ' defaults follow publication context and retain explicit target selection', () => {
        const defaults = require('../modules/' + owner + '/config/properties');
        assert.equal(defaults[owner].runtimeRoleProfiles, undefined);
        const resolve = (publication, label) => bindings.resolve(defaults, {}, {
            serverCode: label, readRuntimeProperty: () => publication,
        });
        for (const label of ['contentHost', 'arbitraryCustomerRuntime']) {
            const staged = resolve('STAGED', label);
            const online = resolve('ONLINE', label);
            assert.equal(staged[owner].publication.runtimeRole, 'STAGED');
            assert.equal(typeof staged[owner].publication.targetTransportProvider, 'string');
            assert.equal(online[owner].publication.runtimeRole, 'ONLINE');
            assert.equal(online[owner].publication.targetTransportProvider, null);
            assert(!staged[owner].publication.target.connectionName);
            const custom = bindings.merge(staged, { [owner]: { publication: { target: { connectionName: 'selectedDelivery' } } } });
            assert.equal(custom[owner].publication.target.connectionName, 'selectedDelivery');
            assert(!resolve('STAGED', label)[owner].publication.target.connectionName);
        }
        assert.throws(() => resolve('UNKNOWN', 'host'), /publication context/i);
    });
}
