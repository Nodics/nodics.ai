#!/usr/bin/env node
/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module database/tooling/installedVersionMigration
 * @description Explicit native-local maintenance command; no startup imports, automatic schema reconciliation or listener lifecycle.
 * @layer tooling
 * @owner database
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const frameworkRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../../../..');
const tooling = path.join(frameworkRoot, 'nodics.foundation/modules/nTooling/src/service/project');
const probe = require(path.join(tooling, 'defaultProjectConfigurationProbeService'));

/** Parses explicit scope; arbitrary database endpoints and wildcard schema selection are not accepted. */
export function parseOptions(args) {
    const values = {};
    const allowed = new Set(['environment', 'server', 'owner', 'schemas', 'tenant', 'action', 'plan-file',
        'checksum', 'migration-id', 'execution-id', 'requested-by', 'correlation-id', 'execute', 'previous-worker-pid',
        'source-migration-id', 'source-execution-id']);
    for (const arg of args) {
        const match = arg.match(/^--([a-z-]+)(?:=(.*))?$/);
        if (!match || !allowed.has(match[1]) || Object.hasOwn(values, match[1])) throw new Error('Unknown or repeated migration option');
        values[match[1]] = match[2] === undefined ? true : match[2];
    }
    for (const key of ['environment', 'server', 'owner', 'tenant']) {
        if (!/^[A-Za-z][A-Za-z0-9._-]*$/.test(values[key] || '')) throw new Error('Explicit valid ' + key + ' required');
    }
    if (typeof values.schemas !== 'string') throw new Error('Explicit schema list required');
    values.schemas = values.schemas.split(',');
    if (!values.schemas.length || new Set(values.schemas).size !== values.schemas.length ||
        values.schemas.some(value => !/^[A-Za-z][A-Za-z0-9_]*$/.test(value))) throw new Error('Distinct scalar schemas required');
    values.action = values.action || 'plan';
    if (!['plan', 'apply', 'resume', 'rollback', 'compensate'].includes(values.action)) throw new Error('Invalid maintenance action');
    if (typeof values['plan-file'] !== 'string' || !values['plan-file']) throw new Error('Explicit plan-file required');
    if (values.action !== 'plan') {
        if (values.execute !== true || !/^[a-f0-9]{64}$/.test(values.checksum || '')) throw new Error('Mutation requires --execute and reviewed checksum');
        for (const key of ['migration-id', 'execution-id', 'requested-by', 'correlation-id']) {
            if (typeof values[key] !== 'string' || !values[key].trim()) throw new Error('Explicit ' + key + ' required');
        }
    }
    if (values.action === 'compensate') {
        for (const key of ['source-migration-id', 'source-execution-id']) {
            if (typeof values[key] !== 'string' || !values[key].trim()) throw new Error('Explicit ' + key + ' required');
        }
        if (values['migration-id'] !== values['source-migration-id'] + '.compensation') {
            throw new Error('Compensation requires the reserved linked migration identity');
        }
    }
    return values;
}

/** Restricts this first maintenance entry to native loopback databases; provider URI never appears in evidence. */
export function assertLocalConnection(configuration) {
    let uri;
    try { uri = new URL(configuration.URI); } catch { throw new Error('Invalid local maintenance endpoint'); }
    if (uri.protocol !== 'mongodb:' || !['localhost', '127.0.0.1', '[::1]'].includes(uri.hostname) ||
        !configuration.databaseName) throw new Error('Only explicitly configured native-local MongoDB maintenance is qualified');
}

/** Loads the selected effective graph without module hooks, listeners, scripts, imports or automatic indexes. */
export async function loadContext(options) {
    const projectRoot = process.cwd();
    const credentials = require(path.join(tooling, 'defaultProjectLocalRuntimeCredentialService'));
    const variables = credentials.mergeEnvironment(projectRoot, options.environment);
    probe.resolve({ projectRoot, frameworkRoot, environment: options.environment, server: options.server, variables });
    if (CONFIG.get('environment').class !== 'LOCAL') throw new Error('Installed migration command requires LOCAL environment');
    const initializer = require(path.join(frameworkRoot, 'nodics.foundation/modules/nConfig/src/service/DefaultFrameworkInitializerService'));
    await initializer.loadMaintenanceServices();
    const raw = SERVICE.DefaultFilesLoaderService.loadSchemaFiles('/src/schemas/schemas.js', null);
    await SERVICE.DefaultDatabaseSchemaHandlerService.buildDatabaseSchema(raw);
    NODICS.setActiveChannel('master');
    return { projectRoot, raw };
}

/** Executes owner-scoped maintenance and always closes connections opened by this invocation. */
export async function run(options) {
    process.env.ENV = options.environment;
    const topology = await import(path.join(tooling, 'defaultProjectTopologyService.mjs'));
    const assertOffline = async () => { await topology.verifyMaintenanceOutage(); return true; };
    await assertOffline();
    const { projectRoot, raw } = await loadContext(options);
    const owner = NODICS.getModule(options.owner);
    if (!owner || !owner.rawSchema) throw new Error('Selected schema owner is not active');
    const handles = [];
    try {
        const open = async moduleName => {
            const config = SERVICE.DefaultDatabaseConfigurationService.getDatabaseConfiguration(moduleName, options.tenant);
            assertLocalConnection(config.master);
            const connector = SERVICE[config.options.connectionHandler];
            const provider = SERVICE[config.options.installedVersionMigrationService];
            if (!connector || !provider || typeof provider.bindMaintenanceModel !== 'function') throw new Error('Qualified maintenance provider unavailable');
            const handle = await connector.createConnection(config.master);
            handles.push(handle);
            return { config, provider, handle };
        };
        const selected = await open(options.owner);
        const provider = selected.provider;
        const inputs = [];
        for (const schemaName of options.schemas) {
            const schema = owner.rawSchema[schemaName];
            if (!schema || schema.model !== true || schema.versioned === true) throw new Error('Expected installed ordinary source schema: ' + schemaName);
            const scope = { moduleName: options.owner, schemaName, tenant: options.tenant, channel: 'master',
                database: selected.config.master.databaseName, collection: UTILS.createModelName(schemaName) };
            const model = provider.bindMaintenanceModel({ connection: selected.handle, schema, scope, databaseOptions: selected.config.options });
            let transitions, expectedIndexes;
            if (options.action === 'plan') {
                const versionModule = NODICS.getRawModule('vDatabase');
                if (!versionModule) throw new Error('Versioned schema capability is unavailable');
                const versioned = raw.default?.versioned || require(path.join(versionModule.path, 'src/schemas/schemas.js')).default.versioned;
                const target = SERVICE.DefaultDatabaseSchemaHandlerService.applyVersioningConfiguration({ moduleName: options.owner,
                    schemaName, schema: { ...schema, isVersionedEnabled: true }, versionedSchema: versioned });
                ({ transitions, expectedIndexes } = await provider.desiredTransitions({ model, targetSchema: target,
                    tenant: options.tenant, databaseOptions: selected.config.options }));
            }
            inputs.push({ model, scope, expectedIndexes, expectedSchemaHash: provider.hash(schema), transitions,
                identityFields: Object.keys(schema.definition).filter(key => schema.definition[key].primary === true),
                limits: CONFIG.get('installedVersionMigration').limits });
        }
        const journal = SERVICE.DefaultInstalledMigrationJournalService;
        const service = SERVICE.DefaultInstalledVersionMigrationService;
        if (!journal || !service) throw new Error('Installed migration orchestration unavailable');
        const context = { provider, journal, inputs, assertOffline, scope: { projectRoot, environment: options.environment,
            server: options.server, moduleName: options.owner, tenant: options.tenant, channel: 'master', schemas: options.schemas } };
        const planFile = path.resolve(options['plan-file']);
        if (options.action === 'plan') {
            const plan = await service.plan(context);
            const artifact = { plan, checksum: journal.checksum(plan) };
            fs.writeFileSync(planFile, JSON.stringify(artifact, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
            return { action: 'plan', planFile, checksum: artifact.checksum,
                schemas: plan.schemas.map(item => ({ schema: item.scope.schemaName, records: item.totals.count })), applicationWrites: false };
        }
        const artifact = JSON.parse(fs.readFileSync(planFile, 'utf8'));
        if (artifact.checksum !== options.checksum) throw new Error('Reviewed plan checksum mismatch');
        const history = await open('import');
        if (history.config.master.databaseName !== selected.config.master.databaseName) throw new Error('Cross-database journal qualification required');
        const historySchema = NODICS.getModule('import').rawSchema.importRun;
        const historyModel = history.provider.bindMaintenanceModel({ connection: history.handle, schema: historySchema,
            scope: { tenant: options.tenant, channel: 'master', schemaName: 'importRun', collection: UTILS.createModelName('importRun'),
                database: history.config.master.databaseName }, databaseOptions: history.config.options });
        const importOwner = NODICS.getModule('import');
        importOwner.models = { ...(importOwner.models || {}), [options.tenant]: { master: { [UTILS.createModelName('importRun')]: historyModel } } };
        let recovery;
        if (options.action === 'resume' || options.action === 'rollback') {
            const pid = Number(options['previous-worker-pid']);
            if (!Number.isInteger(pid) || pid <= 0 || pid === process.pid) throw new Error('Explicit stopped previous worker PID required');
            try { process.kill(pid, 0); throw new Error('Previous migration worker is still running'); }
            catch (error) { if (error.code !== 'ESRCH') throw error; }
            recovery = { previousWorkerStopped: true, evidence: { pid, hostname: os.hostname(), ...await topology.verifyMaintenanceOutage() } };
        }
        return await service.execute(context, { plan: artifact.plan, checksum: options.checksum,
            tenant: options.tenant, migrationId: options['migration-id'], executionId: options['execution-id'],
            requestedBy: options['requested-by'], correlationId: options['correlation-id'],
            worker: { pid: process.pid, hostname: os.hostname() },
            original: options.action === 'compensate' ? { migrationId: options['source-migration-id'],
                executionId: options['source-execution-id'], checksum: options.checksum } : undefined,
            resume: Boolean(recovery), recovery,
            direction: ['rollback', 'compensate'].includes(options.action) ? 'rollback' : 'forward' });
    } finally {
        for (const handle of handles.reverse()) await handle.client.close();
    }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    run(parseOptions(process.argv.slice(2))).then(result => console.log(JSON.stringify(result, null, 2)))
        .catch(error => { console.error(error.message); process.exitCode = 1; });
}
