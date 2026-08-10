/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const compositionGroups = new Set(['nodics.commerce', 'baseCommerce', 'checkout', 'payment', 'paymentMethods', 'paymentProviders', 'fulfillment']);
function visit(folder) {
    const packagePath = path.join(folder, 'package.json');
    const identity = fs.existsSync(packagePath) ? JSON.parse(fs.readFileSync(packagePath, 'utf8')).name : path.basename(folder);
    if (compositionGroups.has(identity)) ['src', 'data'].forEach(name => assert(!fs.existsSync(path.join(folder, name)), identity + ' composition group must not own ' + name));
    const modules = path.join(folder, 'modules');
    if (fs.existsSync(modules)) fs.readdirSync(modules).forEach(name => visit(path.join(modules, name)));
}
visit(root);
console.log('Commerce composition-group source-free contract validated');
