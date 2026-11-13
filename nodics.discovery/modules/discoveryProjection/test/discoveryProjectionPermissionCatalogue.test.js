/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
const test=require('node:test'),assert=require('node:assert/strict');
const routes=require('../src/router/routers').discoveryProjection;
const records=Object.values(require('../data/init-v001/records/identity/discoveryProjectionPermissionData'));
test('every fixed internal operation has an exact Projection-owned permission definition',()=>{const required=[...new Set(Object.values(routes).flatMap(group=>Object.values(group).map(route=>route.permission)))].sort();assert.deepEqual(records.map(r=>r.code).sort(),required);assert.ok(records.every(r=>r.active===true&&r.ownerModule==='discoveryProjection'));});
test('permission import preserves governed records and does not grant runtime access',()=>{const header=require('../data/init-v001/headers/identity/discoveryProjectionPermissionHeader').profile.discoveryProjectionPermission;assert.equal(header.options.operation,'ensureReferenceAll');assert.equal(header.options.schemaName,'permission');assert.deepEqual(header.options.tenants,['default']);assert.ok(records.every(r=>Object.keys(r).sort().join(',')==='active,code,name,ownerModule'));});
