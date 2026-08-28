/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');
const routers = require('../src/router/routers').editorial;

const authoringWithdraw = routers.editorialAuthoring.withdraw;
const targetWithdraw = routers.editorialPublicationTarget.targetWithdraw;

assert.deepStrictEqual(authoringWithdraw.authTokenTypes, ['access']);
assert.equal(authoringWithdraw.key, '/authoring/articles/:articleCode/withdraw');
assert.deepStrictEqual(targetWithdraw.authTokenTypes, ['service']);
assert.equal(targetWithdraw.key, '/publication/target/withdraw');
assert.equal(targetWithdraw.operation, 'withdraw');

const routeNames = Object.values(routers).flatMap(group => Object.keys(group || {}));
assert.equal(new Set(routeNames).size, routeNames.length, 'Editorial route names must remain unique after runtime flattening');
