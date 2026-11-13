/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const assert = require('node:assert/strict');

/**
 * @module nodics.discovery/test/discoveryModuleStructureContract
 * @description Verifies Discovery is a generic multi-module group and not a Commerce-specific implementation bucket.
 * @layer test
 * @owner nodics.discovery
 */

const discovery = require('../package.json');

assert.equal(discovery.name, 'nodics.discovery');
assert.equal(discovery.index, '75.99');
assert.equal(discovery.nodics.functionalModule.identity, 'nodics.discovery');
assert.deepEqual(discovery.requiredModules, [
    'discoveryConfig',
    'discoverySource',
    'discoveryMapping',
    'discoveryProjection',
    'discoveryPublication',
    'discoveryQuery',
    'discoveryRanking',
    'discoveryRuntime'
]);
assert(!discovery.requiredModules.includes('productSearch'));
assert(!discovery.requiredModules.includes('wcmsSearch'));

console.log('Discovery module structure contract validated');

// Source dependencies must precede consumers; required-module admission must not
// rely on the group's list order or a runtime bypass.
for (const name of ['discoveryProjection', 'discoveryRuntime', 'discoveryPublication']) {
    const consumer = require('../modules/' + name + '/package.json');
    for (const dependency of consumer.requiredModules || []) {
        if (!dependency.startsWith('discovery')) continue;
        const source = require('../modules/' + dependency + '/package.json');
        assert(Number(source.index) < Number(consumer.index), dependency + ' must precede ' + name);
    }
}

// Actual persisted schema owners declare authority even with HTTP disabled.
for (const name of ['discoveryMapping', 'discoveryProjection', 'discoveryPublication', 'discoveryRanking', 'discoverySource']) {
    const metadata = require('../modules/' + name + '/package.json');
    const schemas = require('../modules/' + name + '/src/schemas/schemas')[name];
    assert.equal(metadata.nodics.runtime.ownership, 'functional');
    assert(Object.values(schemas).some(schema => schema.model === true));
}
for (const name of ['discoveryQuery', 'discoveryRuntime']) {
    assert.equal(require('../modules/' + name + '/package.json').nodics.runtime.ownership, 'sourceOnly');
}
