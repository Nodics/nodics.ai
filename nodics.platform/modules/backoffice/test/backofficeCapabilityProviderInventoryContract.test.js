/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const contract = require('../src/service/contract/defaultBackofficeContractService');
const root = path.resolve(__dirname, '../../../..');
global.SERVICE = {
    DefaultBackofficeCapabilityDefinitionService: require('../../../../nodics.foundation/modules/nService/src/service/module/defaultBackofficeCapabilityDefinitionService')
};
const files = [];
const visit = directory => fs.readdirSync(directory, { withFileTypes: true }).forEach(entry => {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'generated') return;
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) visit(target);
    else if (/BackofficeCapabilityService\.js$/.test(entry.name)) files.push(target);
});
visit(root);
assert(files.length >= 25, 'Every current concrete BackOffice owner must publish through an owner service');
const navigationOwners = new Map();
files.sort().forEach(file => {
    const provider = require(file);
    assert.equal(typeof provider.getCapability, 'function', path.relative(root, file) + ' must expose getCapability');
    const capability = provider.getCapability();
    assert(contract.validateBackofficeMetadata(capability), path.relative(root, file) + ' must publish valid metadata');
    (capability.navigation || []).forEach(item => {
        assert(!navigationOwners.has(item.id), 'Duplicate BackOffice navigation id ' + item.id);
        navigationOwners.set(item.id, file);
    });
});
console.log(`BackOffice capability provider inventory validated: ${files.length} providers, ${navigationOwners.size} navigation entries`);
