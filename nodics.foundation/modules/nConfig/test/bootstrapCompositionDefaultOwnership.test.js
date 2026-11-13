/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module config/test/bootstrapCompositionDefaultOwnership @description Verifies actual early composition loading preserves Framework defaults below project/runtime choices without requiring copied definitions. @layer test @owner config */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const owner = require('../src/service/DefaultFrameworkInitializerService');
test('Framework and discovered defaults precede project/server/node composition overrides', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-composition-order-'));
    const framework = path.join(root, 'framework'), project = path.join(root, 'project'), server = path.join(root, 'server'), node = path.join(root, 'node');
    const write = (dir, value) => { fs.mkdirSync(path.join(dir, 'config'), { recursive: true }); fs.writeFileSync(path.join(dir, 'config/properties.js'), 'module.exports=' + JSON.stringify(value)); };
    write(path.join(framework, 'messages'), { activeModules: { compositions: { mail: { selection: 'none', domains: [{ code: 'employee' }] } } } });
    write(project, { activeModules: { compositions: { mail: { selection: 'none' } } } });
    write(server, { activeModules: { compositions: { mail: { selection: 'employee' } } } });
    write(node, { activeModules: { compositions: { mail: { selection: 'none' } } } });
    fs.writeFileSync(path.join(server, 'package.json'), JSON.stringify({ nodics: { runtimeModuleRoots: ['messages'] } }));
    const previous = global.NODICS;
    try {
        delete global.NODICS;
        const roots = { framework, project, server };
        assert.equal(owner.readBootstrapCompositionDefinitions({ roots }).mail.selection, 'employee');
        global.NODICS = { getRawModules: () => ({ messages: { path: path.join(framework, 'messages') } }) };
        assert.equal(owner.readBootstrapCompositionDefinitions({ roots }).mail.selection, 'employee');
        assert.equal(owner.readBootstrapCompositionDefinitions({ roots: { ...roots, node } }).mail.selection, 'none');
        assert.deepEqual(owner.readBootstrapCompositionDefinitions({ roots }).mail.domains, [{ code: 'employee' }]);
        const bindings = require('../src/service/defaultConfigurationBindingService');
        const contribution = { activeModules: { compositions: { mail: { selection: 'none', domains: [{ code: 'employee' }] } } }, selected: { $config: 'selected', name: 'mail', field: 'domains', includes: 'employee', value: true, otherwise: false } };
        const context = { roots, readBootstrapCompositionDefinitions: () => owner.readBootstrapCompositionDefinitions({ roots }) };
        assert.equal(bindings.resolve(contribution, {}, context).selected, true);
        assert.equal(bindings.resolve(contribution, {}, { ...context, readLayeredProperty: () => contribution.activeModules.compositions }).selected, false);
        const emptyProject = path.join(root, 'empty-project'), emptyServer = path.join(root, 'empty-server'), foreignServer = path.join(root, 'foreign-server');
        write(emptyProject, {}); write(emptyServer, {});
        fs.writeFileSync(path.join(emptyServer, 'package.json'), JSON.stringify({ nodics: { runtimeModuleRoots: ['messages'] } }));
        write(foreignServer, { activeModules: { compositions: { mail: { selection: 'employee' } } } });
        global.NODICS = { getRawModules: () => ({ foreign: { path: foreignServer, metaData: { nodics: { kind: 'server' } } } }) };
        assert.equal(owner.readBootstrapCompositionDefinitions({ roots: { framework, project: emptyProject, server: emptyServer } }).mail.selection, 'none');


    } finally { global.NODICS = previous; fs.rmSync(root, { recursive: true, force: true }); }
});
