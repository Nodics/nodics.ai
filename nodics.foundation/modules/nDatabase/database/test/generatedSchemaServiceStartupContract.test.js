/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module database/test/GeneratedSchemaServiceStartupContractTest @description Requires built server service baselines and preserves custom services without runtime-generated substitutes. @layer test @owner nDatabase */
const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const handler = require('../src/service/model/defaultDatabaseModelHandlerService');

test('missing generated baseline fails and a built custom composition is preserved', async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-required-service-'));
    const old = { NODICS: global.NODICS, SERVICE: global.SERVICE, CLASSES: global.CLASSES };
    const prior = String.prototype.toUpperCaseFirstChar;
    String.prototype.toUpperCaseFirstChar = function () { return this[0].toUpperCase() + this.slice(1); };
    const schema = { model: true, service: { enabled: true } };
    global.NODICS = {
        getGeneratedArtifactPath: () => root,
        getActiveModules: () => ['profile'], isModuleActive: () => true,
        getModule: () => ({ rawSchema: { employee: schema, internalAudit: { service: { enabled: false } } } })
    };
    global.CLASSES = { NodicsError: class extends Error { constructor(error, message) { super(message, { cause: error }); } } };
    const existing = { get: () => 'generated', findByAPIKey: () => 'custom' };
    global.SERVICE = { DefaultEmployeeService: existing };
    try {
        await assert.rejects(handler.ensureGeneratedSchemaServices(), error => /selected project server build/.test(error.cause.message));
        assert.equal(SERVICE.DefaultEmployeeService, existing);
        fs.writeFileSync(path.join(root, 'DefaultEmployeeService.js'), 'module.exports = {};');
        assert.equal(await handler.ensureGeneratedSchemaServices(), true);
        assert.equal(SERVICE.DefaultEmployeeService, existing);
        assert.equal(SERVICE.DefaultEmployeeService.findByAPIKey(), 'custom');
        assert.equal(SERVICE.DefaultInternalAuditService, undefined);
        delete SERVICE.DefaultEmployeeService;
        await assert.rejects(handler.ensureGeneratedSchemaServices());
        assert.equal(SERVICE.DefaultEmployeeService, undefined, 'no runtime substitute');
    } finally {
        Object.assign(global, old);
        if (prior) String.prototype.toUpperCaseFirstChar = prior; else delete String.prototype.toUpperCaseFirstChar;
        fs.rmSync(root, { recursive: true, force: true });
    }
});
