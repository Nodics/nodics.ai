/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
'use strict';
/** @module nPublish/test/publicationSetupObservationProject @description Source-only deployment graph qualification against an explicitly supplied project, without runtime calls or configuration writes. @layer test @owner nPublish */
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const observer = require('../src/service/defaultPublicationSetupObservationService');
const backoffice = require('../../../../nodics.platform/modules/backoffice/src/service/defaultBackofficeApplicationInitializationService');
const { createProjectConfigurationTestHarness } = require('../../nTooling/test/helpers/projectConfiguration');
const projectRoot = process.env.NODICS_OBSERVATION_PROJECT_ROOT;

test('actual native graphs keep full profile validation on Platform and target-only registration independent of source authority',
    { skip: !projectRoot }, t => {
        assert(path.isAbsolute(projectRoot), 'explicit absolute fixture project root required');
        const previous = Object.fromEntries(['CONFIG', 'NODICS', 'SERVICE', 'CLASSES'].map(key => [key, global[key]]));
        t.after(() => { for (const [key, value] of Object.entries(previous))
            value === undefined ? delete global[key] : global[key] = value; });
        const harness = createProjectConfigurationTestHarness({ projectRoot, frameworkRoot: path.resolve(__dirname, '../../../..') });
        const servers = ['platformServer', 'wcmsStagedServer', 'wcmsOnlineServer', 'processServer', 'commerceServer',
            'commerceStagedServer', 'engagementServer', 'loyaltyServer', 'locationServer', 'wasteServer'];
        const graphs = Object.fromEntries(servers.map(server => [server, harness.loadRuntime(server, 'kickoffLocal')]));
        const platform = graphs.platformServer;
        global.CONFIG = { get: key => platform[key] };
        global.CLASSES = { NodicsError: Error };
        const full = backoffice.profile('circa'), configured = observer.configuredSteps(observer.profile('circa'));
        const normalized = backoffice.preparationSteps(full).filter(step => step.required !== false);
        assert.equal(observer.digest(full), observer.digest(observer.profile('circa')));
        assert.equal(configured.length, normalized.length);
        assert(normalized.every(step => configured.some(raw => raw.code === step.code &&
            observer.digest(observer.stepIdentity(raw)) === observer.digest(observer.stepIdentity(step)))));
        for (const server of servers) {
            const properties = graphs[server], modules = harness.activeModuleNames(properties);
            const raw = properties.backofficeApplicationInitialization?.profiles?.circa;
            const profile = raw && { ...raw, target: { ...properties.backofficeApplicationInitialization.target, ...raw.target } };
            if (server !== 'platformServer' && profile) assert.notEqual(observer.digest(profile), observer.digest(full));
            const observation = properties.publish?.setup?.observation;
            if (observation?.enabled === true) {
                assert(modules.includes('publish'), 'selected observer requires active publish on ' + server);
                assert(Object.keys(observation.plans || {}).length > 0, 'enabled observer requires reviewed plans');
                assert(Object.keys(observation.callers || {}).length > 0, 'enabled observer requires exact callers');
            }
            t.diagnostic(JSON.stringify({ server, publish: modules.includes('publish'), profile: Boolean(profile),
                required: profile && observer.configuredSteps(profile).length,
                profileDigest: profile && observer.digest(profile) }));
        }
        const online = structuredClone(graphs.commerceServer), active = harness.activeModuleNames(graphs.commerceServer);
        const domains = ['product', 'pricing', 'inventory', 'tax', 'promotion'];
        const commerce = path.resolve(__dirname, '../../../../nodics.commerce/modules/baseCommerce/modules');
        const selected = {}, services = {};
        for (const domain of domains) {
            assert(active.includes(domain));
            const prefix = domain[0].toUpperCase() + domain.slice(1);
            const name = 'Default' + prefix + 'Publication' + (domain === 'product' ? 'VersionProvider' : '') + 'Service';
            selected[domain] = name;
            services[name] = require(path.join(commerce, domain, 'src/service/default' + name.slice(7)));
            assert.equal(typeof services[name].observeSetupTarget, 'function');
        }
        // Explicit review is modeled in memory only, not adopted in project configuration.
        online.publish = { setup: { observation: { ...require('../config/properties').publish.setup.observation,
            enabled: true, targetObservers: selected } },
            providers: { versionProviders: {}, domainAdapters: {}, workflowProviders: {} } };
        global.CONFIG = { get: key => online[key] };
        global.NODICS = { isModuleActive: code => active.includes(code) };
        global.SERVICE = services;
        for (const domain of domains) {
            assert.equal(observer.targetObserver(domain), services[selected[domain]]);
            assert.throws(() => observer.provider(domain), 'Online must not inherit source/workflow registration');
        }
        const script = `
            const path = require('node:path'), crypto = require('node:crypto');
            const input = JSON.parse(process.argv[1]);
            require(path.join(input.frameworkRoot, 'nodics.foundation/modules/nConfig/src/service/defaultDeploymentConfigurationProjectionService'))
                .resolve(input);
            global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message || code); this.code = code; } } };
            const releases = require(path.join(input.frameworkRoot, 'nodics.foundation/modules/nData/nImport/import/src/service/release/defaultDataReleaseService'));
            global.SERVICE = { DefaultDataReleaseService: releases };
            const owner = require(path.join(input.frameworkRoot, 'nodics.foundation/modules/nPublish/src/service/defaultPublicationSetupObservationService'));
            const original = CONFIG.get.bind(CONFIG), defaults = require(path.join(input.frameworkRoot, 'nodics.foundation/modules/nPublish/config/properties')).publish.setup.observation;
            CONFIG.get = key => key === 'publish' ? { setup: { observation: { ...defaults,
                ...original(key)?.setup?.observation, enabled: true } } } : original(key);
            const policy = original('publish')?.setup?.observation;
            if (policy?.enabled === true) {
                for (const code of Object.keys(policy.plans || {})) {
                    const approved = owner.resolvePlan(code);
                    if (approved.plan.stages.some(stage => stage.server === input.server &&
                        stage.descriptor.targetRuntimeRole !== original('runtimeRole').code))
                        throw Error('Reviewed stage runtime-role mismatch');
                }
            }
            const pins = input.steps.map(step => {
                const release = owner.describeRelease(step.code, step.dataType);
                releases.validateDestination(release);
                const snapshot = owner.sourceSnapshot(release);
                const checksum = crypto.createHash('sha256').update(release.declaredFiles.slice().sort().map(name =>
                    name + ':' + crypto.createHash('sha256').update(snapshot.files.get(name)).digest('hex')).join('|')).digest('hex');
                if (checksum !== release.checksum) throw Error('Source checksum mismatch: ' + step.code);
                return { code: step.code, checksum, files: release.declaredFiles.length };
            });
            process.stdout.write(JSON.stringify({ planOwnerAvailable: Boolean(NODICS.getRawModule(input.planOwner)), pins }));
        `;
        let releaseCount = 0;
        for (const server of servers) {
            const steps = normalized.filter(step => step.type === 'DATA_RELEASE' && step.targetRuntimeRole === graphs[server].runtimeRole.code);
            if (!steps.length) continue;
            const evidence = JSON.parse(execFileSync(process.execPath, ['-e', script, JSON.stringify({ projectRoot,
                frameworkRoot: path.resolve(__dirname, '../../../..'), server, environment: 'kickoffLocal', steps, planOwner: full.owner })],
            { encoding: 'utf8', env: { PATH: process.env.PATH, HOME: process.env.HOME }, timeout: 30000, maxBuffer: 1048576 }));
            assert.equal(evidence.planOwnerAvailable, true, 'reviewed plan owner must be locally discovered on ' + server);
            assert.equal(evidence.pins.length, steps.length); releaseCount += evidence.pins.length;
            t.diagnostic(JSON.stringify({ server, sourceBytePins: evidence.pins.length }));
        }
        assert.equal(releaseCount, normalized.filter(step => step.type === 'DATA_RELEASE').length);
    });
