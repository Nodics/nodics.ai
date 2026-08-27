/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
const assert = require('node:assert/strict'); const fs = require('node:fs'); const path = require('node:path');
const root = path.resolve(__dirname, '..'); const offenders = [];
function scan(folder) {
    fs.readdirSync(folder, { withFileTypes: true }).forEach(entry => {
        if (['node_modules', 'llm', 'test'].includes(entry.name)) return;
        const target = path.join(folder, entry.name);
        if (entry.isDirectory()) return scan(target);
        if (!['package.json', 'nodics.js', 'properties.js', 'prescripts.js', 'postscripts.js'].includes(entry.name) && !target.includes(path.sep + 'src' + path.sep)) return;
        const body = fs.readFileSync(target, 'utf8');
        if (/local-archive|legacy-repositories|require\(['"][^'"]*gComm|extends[^\n]*gComm/u.test(body)) offenders.push(path.relative(root, target));
    });
}
scan(root); assert.deepEqual(offenders, [], 'Active Commerce runtime must not reference archived gComm');
const packageJson = require('../package.json'); assert.equal(packageJson.name, 'nodics.commerce');
console.log('Commerce active-runtime retirement contract validated');
