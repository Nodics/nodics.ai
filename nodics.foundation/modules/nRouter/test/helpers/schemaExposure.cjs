/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module nRouter/test/helpers/schemaExposure @description Tests governed schema route projection with caller-owned schemas and no listeners or persistence. @layer test @owner nRouter */
const assert = require('node:assert/strict');
const router = require('../../src/service/router/defaultRouterService');
const definitions = require('../../src/router/routers');
const security = require('../../src/service/request/defaultSecuredRequestPipelineService');
const databaseDefaults = require('../../../nDatabase/database/config/properties');

/** Prove declared exposure, disablement and invalid-group rejection; restore test globals even on failure. */
module.exports = function verifySchemaExposure(entries) {
    assert(Array.isArray(entries) && entries.length > 0, 'Explicit owner schema fixtures are required');
    const globals = ['CONFIG', 'NODICS', 'SERVICE', 'UTILS', 'CLASSES'];
    const priorGlobals = Object.fromEntries(globals.map(key => [key, Object.getOwnPropertyDescriptor(global, key)]));
    const priorStringHelpers = Object.getOwnPropertyDescriptors(String.prototype);
    let active = true;
    let registered;
    let bound;
    try {
        global.CONFIG = { get: key => ({
            servers: { options: { contextRoot: 'nodics' } },
            cache: {},
            schemaApi: databaseDefaults.schemaApi
        })[key] };
        global.NODICS = {
            isModuleActive: () => active,
            getModules: () => ({}),
            addRouter: (name, definition) => registered.push(definition)
        };
        global.UTILS = { isBlank: value => !value || Object.keys(value).length === 0 };
        global.SERVICE = { DefaultRouterOperationService: Object.fromEntries(
            ['get', 'post', 'put', 'patch', 'delete'].map(method => [method, (target, definition) => bound.push(definition)])
        ) };
        global.CLASSES = { NodicsError: class extends Error {
            constructor(code, message) { super(message); this.code = code; }
        } };
        require('../../../nConfig/config/prescripts').addStringCamelCaseFunction();

        for (const { moduleName, schemaName, schema, exposed } of entries) {
            assert.equal(typeof exposed, 'boolean', 'The owner must declare expected exposure explicitly');
            const label = moduleName + '.' + schemaName;
            const prepare = (override = {}) => {
                registered = [];
                bound = [];
                router.activateRouters({}, { metaData: {}, rawSchema: { [schemaName]: { ...schema, ...override } } },
                    moduleName, { default: definitions.default });
                assert.deepEqual(bound, registered, label + ' must bind every registered route');
                return registered;
            };
            const routes = prepare();
            if (!exposed) {
                assert.deepEqual(routes, [], label + ' remains service-only');
                assert.deepEqual(prepare({ router: { ...schema.router, groups: { schemaOperations: true } } }), [],
                    label + ' group selection must not enable a disabled router');
                continue;
            }
            assert.deepEqual(routes.map(route => route.operation).sort(),
                ['bulk', 'capabilities', 'deleteImpact', 'remove', 'safeSearch', 'save', 'update'], label);
            for (const route of routes) {
                assert.equal(route.schemaGoverned, true, label);
                assert.equal(route.secured, true, label);
                assert.equal(route.apiExposure, 'schemaApi', label);
                assert.deepEqual(route.accessGroups, ['userGroup'], label);
                assert.deepEqual(security.getRoutePermissions(route), [
                    ['safeSearch', 'capabilities', 'deleteImpact'].includes(route.operation)
                        ? 'system.schema.view' : 'system.schema.manage'
                ], label);
                assert.equal(route.moduleName, moduleName, label);
                assert(route.url.includes('/' + moduleName + '/v0/'), label);
            }
            for (const override of [
                { router: { ...schema.router, enabled: false } },
                { router: { ...schema.router, groups: { schemaOperations: false } } },
                { router: { ...schema.router, groups: {} } },
                { service: { ...schema.service, enabled: false } }
            ]) assert.deepEqual(prepare(override), [], label + ' must honor disablement');
            for (const groups of [null, [], 'schemaOperations', { schemaOperations: 'true' }, { unknown: true }]) {
                assert.throws(() => prepare({ router: { ...schema.router, groups } }), { code: 'ERR_RTR_00003' }, label);
                assert.deepEqual(registered, [], label + ' invalid selection must register nothing');
            }
            active = false;
            assert.deepEqual(prepare(), [], label + ' inactive modules expose nothing');
            active = true;
        }
    } finally {
        for (const [key, descriptor] of Object.entries(priorGlobals)) {
            if (descriptor) Object.defineProperty(global, key, descriptor);
            else delete global[key];
        }
        for (const key of Object.getOwnPropertyNames(String.prototype)) {
            if (!priorStringHelpers[key]) delete String.prototype[key];
        }
        Object.defineProperties(String.prototype, priorStringHelpers);
    }
};
