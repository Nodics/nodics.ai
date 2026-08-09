/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module backoffice/test/FunctionalModuleCatalogueService
 * @description Validates explicit functional-root aggregation, project-module exclusion, durable first registration, and restart-safe reconciliation.
 * @layer test
 * @owner backoffice
 * @override Functional-module catalogue replacements must preserve the same project and runtime-state boundaries.
 */
const assert = require('assert');

global.CONFIG = { get: key => key === 'defaultTenant' ? 'default' : undefined };
global.SERVICE = {};
global.NODICS = {};
global.CLASSES = { NodicsError: class NodicsError extends Error {
    constructor(code, message) { super(message || code); this.code = code; }
} };

const definition = require('../src/service/registry/defaultFunctionalModuleCatalogueService');
const service = Object.assign({}, definition);

const batch = {
    project: 'example.project', environment: 'localEnvironment', server: 'platformServer', node: null,
    registrations: [
        { moduleName: 'nodics.core', version: '0.0.1', functionalModule: {
            identity: 'nodics.core', displayName: 'Core', type: 'STANDARD', protected: true } },
        { moduleName: 'nConfig', parentModule: 'nodics.core' },
        { moduleName: 'nodics.platform', parentModule: 'nodics.core', version: '0.0.1', functionalModule: {
            identity: 'nodics.platform', displayName: 'Platform', type: 'STANDARD', protected: true } },
        { moduleName: 'profile', parentModule: 'nodics.platform' },
        { moduleName: 'backoffice', parentModule: 'nodics.platform' },
        { moduleName: 'nodics.wcms', parentModule: 'nodics.core', version: '0.0.1', functionalModule: {
            identity: 'nodics.wcms', displayName: 'WCMS', type: 'STANDARD', protected: true } },
        { moduleName: 'cms', parentModule: 'nodics.wcms' },
        { moduleName: 'media', parentModule: 'nodics.wcms' },
        { moduleName: 'wcms', parentModule: 'nodics.wcms' },
        { moduleName: 'example.project', parentModule: undefined },
        { moduleName: 'projectCore', parentModule: 'example.project' }
    ]
};

async function run() {
    assert.deepStrictEqual(service.getQuery({ httpRequest: { query: { project: 'example.project' } } }), { project: 'example.project' });
    assert.deepStrictEqual(service.getBody({ httpRequest: { body: { reason: 'approved' } } }), { reason: 'approved' });
    let observations = service.buildObservations(batch);
    assert.deepStrictEqual(observations.map(item => item.functionalModule), ['nodics.core', 'nodics.platform', 'nodics.wcms']);
    assert.deepStrictEqual(observations[0].technicalModules, ['nConfig']);
    assert.deepStrictEqual(observations[1].technicalModules, ['backoffice', 'profile']);
    assert.deepStrictEqual(observations[2].technicalModules, ['cms', 'media', 'wcms']);
    assert.strictEqual(observations[2].required, true, 'WCMS is an Axis prerequisite and must be default-registered');
    assert(!observations.some(item => item.functionalModule === 'example.project'));

    let saved;
    let updated;
    let existing;
    service.getRecord = async () => existing;
    service.saveRecord = async request => { saved = request.model; return { result: [request.model] }; };
    service.updateRecord = async request => { updated = request.model; return { result: { modifiedCount: 1 } }; };
    service.getPersistenceAuthData = authData => authData;

    let first = await service.reconcileObservation(observations[0], { tenant: 'default', authData: {} });
    assert(saved);
    assert.strictEqual(first.registrationState, 'REGISTERED');
    assert.strictEqual(first.catalogueRevision, 1);
    assert.strictEqual(first.required, true);
    assert.strictEqual(first.code, 'example.project::nodics.core');

    existing = Object.assign({}, first, { registeredAt: new Date('2026-01-01T00:00:00Z') });
    saved = undefined;
    let renewed = await service.reconcileObservation(observations[0], { tenant: 'default', authData: {} });
    assert.strictEqual(saved, undefined, 'restart reconciliation must not recreate registration');
    assert(updated, 'restart reconciliation should refresh observed time');
    assert.strictEqual(renewed.catalogueRevision, 1, 'unchanged restart must not advance catalogue revision');
    assert.strictEqual(renewed.registeredAt.toISOString(), '2026-01-01T00:00:00.000Z');

    let requiredRequest = { body: { project: 'example.project', expectedRevision: 1, reason: 'not allowed' },
        params: { functionalModule: 'nodics.core' }, authData: { tokenType: 'access', principalId: 'admin' } };
    await assert.rejects(() => service.deactivate(requiredRequest), /Required functional module/);

    existing = Object.assign({}, first, { code: 'example.project::nodics.process', functionalModule: 'nodics.process',
        displayName: 'Process', required: false, registrationState: 'AVAILABLE', enabled: false,
        runtimeState: 'ACTIVE', catalogueRevision: 1 });
    updated = undefined;
    let optionalRequest = { body: { project: 'example.project', expectedRevision: 1, reason: 'approved for project' },
        params: { functionalModule: 'nodics.process' }, authData: { tokenType: 'access', principalId: 'admin' } };
    let registered = await service.register(optionalRequest);
    assert.strictEqual(registered.data.registrationState, 'REGISTERED');
    assert.strictEqual(registered.data.enabled, false);
    assert.strictEqual(registered.data.catalogueRevision, 2);

    existing = Object.assign({}, existing, updated);
    optionalRequest.body.expectedRevision = 2;
    let activated = await service.activate(optionalRequest);
    assert.strictEqual(activated.data.enabled, true);
    assert.strictEqual(activated.data.catalogueRevision, 3);

    existing = Object.assign({}, existing, updated);
    optionalRequest.body.expectedRevision = 3;
    let deregistered = await service.deregister(optionalRequest);
    assert.strictEqual(deregistered.data.registrationState, 'AVAILABLE',
        'live optional modules must return to available after deregistration');
    assert.strictEqual(deregistered.data.enabled, false);
    assert.strictEqual(deregistered.data.catalogueRevision, 4);

    existing = Object.assign({}, existing, updated, { registrationState: 'DEREGISTERED', runtimeState: 'ACTIVE' });
    let rediscovered = await service.reconcileObservation(Object.assign({}, observations[0], {
        functionalModule: 'nodics.process', displayName: 'Process', required: false
    }), { tenant: 'default', authData: {} });
    assert.strictEqual(rediscovered.registrationState, 'AVAILABLE',
        'live reconciliation must make previously deregistered optional modules available again');

    await assert.rejects(() => service.deregister(Object.assign({}, optionalRequest, {
        authData: { tokenType: 'service', principalId: 'runtime' }
    })), /human employee/);

    console.log('Functional-module catalogue service validated');
}

run().catch(error => { console.error(error); process.exit(1); });
