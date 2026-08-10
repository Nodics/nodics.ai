/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
const assert = require('assert'); const pkg = require('../package.json');
assert.strictEqual(pkg.name, 'nodics.communication'); assert.strictEqual(pkg.index, '89.99'); assert.deepStrictEqual(pkg.requiredModules, ['commsSchema', 'commsCore', 'commsVerification', 'localCommsProvider', 'smtpCommsProvider', 'smsCommsProvider', 'commsApi']); assert(!pkg.requiredModules.includes('engagementComms'));
console.log('Communication module composition contract validated');
