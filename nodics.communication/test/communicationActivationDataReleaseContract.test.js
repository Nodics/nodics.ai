/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const releaseRoot = path.resolve(__dirname, '../modules/commsCore/data');
const manifest = require(path.join(releaseRoot, 'manifest.json'));
const sections = manifest.sections;

assert.strictEqual(manifest.module, 'commsCore');
assert.deepStrictEqual(Object.keys(sections).sort(), ['runtime-defaults', 'sample-templates']);
assert.strictEqual(sections['runtime-defaults'].displayName, 'Communication Runtime Defaults');
assert.strictEqual(sections['runtime-defaults'].dataType, 'core');
assert.strictEqual(sections['sample-templates'].displayName, 'Communication Sample Templates');
assert.strictEqual(sections['sample-templates'].dataType, 'sample');

// Exercise registration and BackOffice projection using this owner's manifest.
const registration = require('../../nodics.foundation/modules/nService/src/service/module/defaultModuleRegistrationAgentService');
const catalogue = require('../../nodics.platform/modules/backoffice/src/service/registry/defaultFunctionalModuleCatalogueService');
const previousGlobals = Object.fromEntries(['CONFIG', 'NODICS'].map(key => [key, Object.getOwnPropertyDescriptor(global, key)]));
try {
    global.CONFIG = { get: () => undefined };
    global.NODICS = { getServerName: () => 'messageWorker' };
    const packages = catalogue.getActivationDataPackages('nodics.communication', {
        activationDataPackages: registration.buildActivationDataPackages('commsCore', { path: path.dirname(releaseRoot) }),
    });
    assert.deepStrictEqual(packages.map(item => item.code).sort(), ['commsCore:runtime-defaults', 'commsCore:sample-templates']);
    assert(packages.every(item => item.targetModule === 'commsCore'));
    assert.strictEqual(packages.find(item => item.dataType === 'core').required, true);
    assert.strictEqual(packages.find(item => item.dataType === 'core').trigger, 'ACTIVATION');
    assert.strictEqual(packages.find(item => item.dataType === 'sample').trigger, 'USER');
} finally {
    for (const [key, descriptor] of Object.entries(previousGlobals)) {
        if (descriptor) Object.defineProperty(global, key, descriptor);
        else delete global[key];
    }
}

Object.values(sections).forEach(section => {
    Object.entries(section.files).forEach(([relativeFile, expectedChecksum]) => {
        const filePath = path.join(releaseRoot, relativeFile);
        assert(fs.existsSync(filePath), `${relativeFile} must exist`);
        const actualChecksum = crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
        assert.strictEqual(actualChecksum, expectedChecksum, `${relativeFile} checksum must match manifest`);
    });
});

const runtimeTemplates = require(path.join(
    releaseRoot,
    'core-v002/records/communication/commsRuntimeDefaultTemplateData.js'
));
const runtimeHeader = require(path.join(
    releaseRoot,
    'core-v002/headers/communication/commsRuntimeDefaultHeader.js'
));
const sampleTemplates = require(path.join(
    releaseRoot,
    'sample-v002/records/communication/commsSampleTemplateData.js'
));

assert.strictEqual(runtimeTemplates.record0.code, 'COMMUNICATION_RUNTIME_NOTICE');
assert.deepStrictEqual(
    runtimeHeader.commsSchema.commsRuntimeDefaultTemplateData.options.userGroups,
    ['adminGroup']
);
assert.deepStrictEqual(
    runtimeHeader.commsSchema.commsRuntimeDefaultTemplateVersionData.options.userGroups,
    ['adminGroup']
);
assert.deepStrictEqual(
    Object.values(sampleTemplates).map(template => template.code).sort(),
    ['CONTACT_ACKNOWLEDGEMENT', 'FEEDBACK_ACKNOWLEDGEMENT', 'REVIEW_ACKNOWLEDGEMENT', 'TESTIMONIAL_CONSENT_REQUEST']
);

console.log('Communication activation data-release contract validated');
