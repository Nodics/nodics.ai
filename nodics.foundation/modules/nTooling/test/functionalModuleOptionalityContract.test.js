/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module nTooling/test/functionalModuleOptionalityContract @description Enforces the standard mandatory boundary without a runtime dependency registry. @layer test @owner nTooling */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../../../..');
const protectedRoots = ['nodics.foundation', 'nodics.platform', 'nodics.wcms'];
let count = 0;
for (const name of fs.readdirSync(root).filter(name => name.startsWith('nodics.'))) {
    const file = path.join(root, name, 'package.json');
    if (!fs.existsSync(file)) continue;
    const pkg = JSON.parse(fs.readFileSync(file));
    const identity = pkg.nodics && pkg.nodics.functionalModule;
    if (!identity) continue;
    count++;
    assert.equal(identity.protected, protectedRoots.includes(identity.identity), `${name} mandatory boundary differs from principles`);
    if (name !== 'nodics.accelerators') {
        assert(!(pkg.nodics.extends || []).includes('nodics.accelerators'), 'standard groups must not load accelerators');
    }
}
const accelerator = require(path.join(root, 'nodics.accelerators/package.json'));
assert.deepEqual(accelerator.nodics.extends, ['nodics.foundation'], 'the umbrella must not load unrelated Commerce/Discovery authorities');
const wcms = require(path.join(root, 'nodics.wcms/package.json'));
assert(!wcms.requiredModules.includes('wcmsExperience'), 'indexed experience remains an explicitly selected local integration');
assert(count >= 14);
console.log(`Functional optionality and mandatory exceptions validated for ${count} framework groups`);
