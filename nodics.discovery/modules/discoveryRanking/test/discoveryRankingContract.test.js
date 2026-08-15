/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const assert = require('node:assert/strict');
const schemas = require('../src/schemas/schemas');
const ranking = require('../src/service/defaultDiscoveryRankingEngineService');

/** @module discoveryRanking/test/discoveryRankingContract @description Verifies generic Discovery ranking actions. @layer test @owner discoveryRanking */

global.CONFIG = { get: key => key === 'discovery' ? { ranking: { boostScore: 10, buryScore: -10 } } : undefined };
assert(schemas.discoveryRanking.discoveryRankingAction);
let ranked = ranking.apply([{ productCode: 'a' }, { productCode: 'b' }, { productCode: 'c' }], [
    { actionType: 'PIN', targetCode: 'c', position: 1 },
    { actionType: 'BOOST', targetCode: 'b' },
    { actionType: 'BURY', targetCode: 'a' }
], { codeProperty: 'productCode' });
assert.deepEqual(ranked.map(item => item.productCode), ['c', 'b', 'a']);

console.log('Discovery ranking contract validated');
