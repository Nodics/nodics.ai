/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const assert = require('assert');
const resolver = require('../src/service/defaultRulePolicyResolutionService');

const now = new Date('2026-09-20T00:00:00.000Z');
const versions = [
    { code:'PLAT_v1', ruleSetCode:'PLAT', version:1, scopeType:'PLATFORM', scopeCode:'DEFAULT', status:'ACTIVE',
      definition:{ groups:[{code:'BASE'}] }, minimumScore:0, maximumScore:100,
      overridePolicy:{ allowedFields:['minimumScore'] } },
    { code:'DOMAIN_v2', ruleSetCode:'DOMAIN', version:2, scopeType:'DOMAIN', scopeCode:'ELECTRONICS', status:'ACTIVE',
      inheritsFrom:'PLAT', metadata:{ overrides:{ minimumScore:10 } } },
    { code:'ENT_v3', ruleSetCode:'ENT', version:3, scopeType:'ENTERPRISE', scopeCode:'du', status:'ACTIVE',
      inheritsFrom:'DOMAIN', metadata:{ overrides:{} } }
];

const effective = resolver.materialize(versions, {
    platformCode:'DEFAULT',
    domainCode:'ELECTRONICS',
    enterpriseCode:'du'
}, now);

assert.strictEqual(effective.scopeType, 'ENTERPRISE');
assert.strictEqual(effective.minimumScore, 10);
assert.deepStrictEqual(effective.lineage, ['PLAT_v1','DOMAIN_v2','ENT_v3']);
assert.strictEqual(effective.sourceScopes.length, 3);

assert.throws(() => resolver.materialize([
    versions[0],
    { code:'BAD_v1', ruleSetCode:'BAD', version:1, scopeType:'DOMAIN', scopeCode:'ELECTRONICS', status:'ACTIVE',
      inheritsFrom:'PLAT', metadata:{ overrides:{ maximumScore:999 } } }
], { platformCode:'DEFAULT', domainCode:'ELECTRONICS' }, now), /not permitted/);

console.log('Rules hierarchical policy resolution contracts validated');
