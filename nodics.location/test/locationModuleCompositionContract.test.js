'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const locationRoot = path.resolve(__dirname, '..');
const packageJson = require(path.join(locationRoot, 'package.json'));

const expectedModules = [
    ['locationCore', '65.10'],
    ['locationType', '65.20'],
    ['locationMap', '65.30'],
    ['locationSearch', '65.40'],
    ['locationDraft', '65.50'],
    ['locationApproval', '65.60'],
    ['locationProjection', '65.70']
];

assert.strictEqual(packageJson.name, 'nodics.location');
assert.strictEqual(packageJson.index, '65.99');
assert.strictEqual(packageJson.nodics.kind, 'group');
assert.strictEqual(packageJson.nodics.displayName, 'Nodics Location');
assert.deepStrictEqual(packageJson.nodics.extends, ['nodics.foundation']);
assert.strictEqual(packageJson.nodics.functionalModule.identity, 'nodics.location');
assert.strictEqual(packageJson.nodics.functionalModule.displayName, 'Location');
assert.deepStrictEqual(packageJson.requiredModules, expectedModules.map(item => item[0]));

for (const [moduleName, index] of expectedModules) {
    const modulePackage = require(path.join(locationRoot, 'modules', moduleName, 'package.json'));
    assert.strictEqual(modulePackage.name, moduleName);
    assert.strictEqual(modulePackage.index, index);
    assert.strictEqual(modulePackage.nodics.kind, 'capability');
    assert.strictEqual(modulePackage.nodics.runtimeModule, true);
    assert.strictEqual(modulePackage.nodics.loadableByNodicsModuleLoader, true);
    if (['locationCore', 'locationMap'].includes(moduleName)) {
        assert.strictEqual(modulePackage.nodics.runtime.router, true, moduleName + ' must expose Location-owned routes when composed into locationServer');
    }
    assert(fs.existsSync(path.join(locationRoot, 'modules', moduleName, 'src', 'schemas', 'schemas.js')));
}

console.log('nodics.location module composition contract passed');
