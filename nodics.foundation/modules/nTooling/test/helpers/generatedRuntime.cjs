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
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const frameworkRoot = path.resolve(__dirname, '../../../../..');

/** Exercises real owner generation in a disposable deployment and isolated process.
 * Selections and schema contracts are supplied by the owning suite. No providers,
 * post-init hooks, listeners, imports or persistence operations are started.
 */
module.exports = function verifyGeneratedRuntime(selection) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-generation-'));
    try {
        const write = (file, content) => {
            fs.mkdirSync(path.dirname(file), { recursive: true });
            fs.writeFileSync(file, content);
        };
        const boundary = (directory, name, kind, index, properties, metadata = {}) => {
            write(path.join(directory, 'package.json'), JSON.stringify({ name, index, version: '1.0.0', main: 'nodics.js',
                nodics: { kind, runtimeModule: true, displayName: name, owns: ['configuration'],
                    runtime: { router: false, publish: false, web: false }, ...metadata } }));
            write(path.join(directory, 'nodics.js'), 'module.exports = { init: async () => true };');
            write(path.join(directory, 'config/properties.js'), 'module.exports = ' + JSON.stringify(properties));
        };
        boundary(root, 'independent.generation', 'application', '1000.00', {});
        boundary(path.join(root, 'envs', 'quality'), 'quality', 'group', '1001.00', {});
        boundary(path.join(root, 'envs', 'quality', 'worker'), 'worker', 'server', '1002.00', {
            activeModules: { modules: ['nodics.foundation', ...selection.activeModules, 'independent.generation', 'quality', 'worker'] },
            runtimeRole: { code: selection.role, publication: 'OPERATIONAL' },
            cache: { default: { engines: { redis: { enabled: true } } } },
            servers: { default: { endpoint: { httpHost: '127.0.0.1', httpPort: 5891 } },
                profile: { remoteOnly: true, endpoint: { httpHost: 'identity.example.test', httpPort: 5892 } } },
            ...selection.properties,
        }, { extends: ['nodics.foundation'], runtimeModuleRoots: selection.moduleRoots });
        if (selection.overlaySchema) write(path.join(root, 'envs/quality/worker/src/schemas/schemas.js'),
            'module.exports = ' + JSON.stringify(selection.overlaySchema));
        const result = spawnSync(process.execPath, [__filename, root, JSON.stringify(selection)], {
            cwd: root, encoding: 'utf8', timeout: 60000, maxBuffer: 16 * 1024 * 1024,
            env: { PATH: process.env.PATH, HOME: process.env.HOME,
                NODICS_JWT_SECRET: require('node:crypto').randomBytes(48).toString('hex'),
                NODICS_API_KEY_PEPPER: require('node:crypto').randomBytes(48).toString('hex') },
        });
        assert.equal(result.status, 0, result.error?.message || result.stderr || result.stdout);
        assert(!fs.existsSync(path.join(root, 'src/service/gen')), 'generation must be selected-server owned');
        return result.stdout;
    } finally { fs.rmSync(root, { recursive: true, force: true }); }
};

async function generate(root, selection) {
    // Generation must fail if a future init hook attempts network access or starts a listener.
    const network = require('node:net');
    network.Socket.prototype.connect = () => { throw new Error('Generation contracts cannot connect to a runtime/provider'); };
    network.Server.prototype.listen = () => { throw new Error('Generation contracts cannot start a listener'); };
    const coreRoot = path.join(frameworkRoot, 'nodics.foundation');
    const config = require(path.join(coreRoot, 'modules/nConfig'));
    const options = { NODICS_HOME: coreRoot, CUSTOM_HOME: root,
        MODULE_ROOTS: [coreRoot, ...selection.moduleRoots.map(name => path.join(frameworkRoot, name)), root],
        defaultEnvironment: 'quality', defaultServer: 'worker', lifecycleOperation: 'build' };
    await config.start(options);
    await config.initUtilities(options);
    await config.loadModules(Array.from(NODICS.getIndexedModules().keys()));
    await config.initEntities();
    for (const [registry, names] of Object.entries(selection.entities || {})) {
        for (const name of names) assert(global[registry][name], name + ' must load');
    }
    const schema = SERVICE.DefaultFilesLoaderService.loadSchemaFiles('/src/schemas/schemas.js', null);
    SERVICE.DefaultDatabaseConfigurationService.setRawSchema(schema);
    await SERVICE.DefaultDatabaseSchemaHandlerService.buildDatabaseSchema(schema);
    await SERVICE.DefaultInfraService.buildServices();
    const generatedRoot = NODICS.getGeneratedArtifactPath('service');
    assert.equal(generatedRoot, path.join(root, 'envs/quality/worker/src/service/gen'));
    const scopedJournalSchemas = new Set(selection.scopedJournalSchemas || []);
    for (const [moduleName, schemas] of Object.entries(selection.schemas)) {
        for (const [schemaName, exposed] of Object.entries(schemas)) {
            const effective = NODICS.getModule(moduleName).rawSchema[schemaName];
            assert(effective, moduleName + '.' + schemaName + ' must materialize');
            assert.equal(effective.model, true, schemaName + ' must retain its model definition');
            assert.equal(effective.service.enabled, true);
            assert.equal(
                effective.router.enabled,
                exposed,
                moduleName + '.' + schemaName + ' router exposure must match the owner contract',
            );
            if (exposed) assert.equal(effective.router.groups.schemaOperations, true);
            if (scopedJournalSchemas.has(moduleName + '.' + schemaName)) {
                assert(effective.definition.tenantCode, schemaName + ' must retain its private tenant partition');
                assert(effective.definition.enterpriseCode, schemaName + ' must retain its private enterprise partition');
            } else {
                assert.equal(effective.definition.tenant, undefined);
                assert.equal(effective.definition.enterpriseCode, undefined);
            }
            const name = 'Default' + schemaName[0].toUpperCase() + schemaName.slice(1) + 'Service';
            const generated = require(path.join(generatedRoot, name + '.js'));
            assert.equal(typeof generated.get, 'function', name + '.get');
            assert.equal(typeof generated.save, 'function', name + '.save');
            for (const [field, definition] of Object.entries(selection.expectedDefinitions?.[moduleName]?.[schemaName] || {}))
                assert.deepEqual(effective.definition[field], definition, schemaName + '.' + field);
        }
    }
}

if (require.main === module) generate(process.argv[2], JSON.parse(process.argv[3])).catch(error => {
    console.error(error);
    process.exitCode = 1;
});
