/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('node:assert/strict');
const test = require('node:test');
const routerService = require('../src/service/router/defaultRouterService');

/**
 * @module nRouter/test/routeRegistrationPrecedence
 * @description Proves explicit owner routes bind before generated and generic fallback routes.
 * @layer test
 * @owner nRouter
 * @override Later modules may contribute routes, but their explicit routes retain precedence over shared fallbacks.
 */

test('explicit module routes bind before schema and common parameter fallbacks', () => {
    const previous = {
        NODICS: global.NODICS,
        UTILS: global.UTILS,
        prepareDefaultRouter: routerService.prepareDefaultRouter,
        prepareRouter: routerService.prepareRouter
    };
    const calls = [];
    const moduleObject = {
        metaData: { prefix: 'profile' },
        rawSchema: {
            participant: {
                service: { enabled: true },
                router: { enabled: true }
            }
        }
    };

    global.NODICS = {
        isModuleActive: () => true,
        getModules: () => ({ profile: moduleObject })
    };
    global.UTILS = {
        isBlank: value => !value || Object.keys(value).length === 0
    };
    routerService.prepareDefaultRouter = options => calls.push(`schema:${options.alias}`);
    routerService.prepareRouter = options => calls.push(options.routerDef.key);

    try {
        routerService.activateRouters({}, moduleObject, 'profile', {
            default: {
                schemaOperations: {
                    inspect: { accessGroups: ['userGroup'] }
                }
            },
            common: {
                searchFallback: {
                    search: {
                        accessGroups: ['userGroup'],
                        key: '/:indexName/search'
                    }
                }
            },
            profile: {
                participantDirectory: {
                    search: {
                        accessGroups: ['customerUserGroup'],
                        key: '/participants/search'
                    }
                }
            }
        });

        assert.deepEqual(calls, [
            '/participants/search',
            'schema:participant',
            '/:indexName/search'
        ]);
    } finally {
        routerService.prepareDefaultRouter = previous.prepareDefaultRouter;
        routerService.prepareRouter = previous.prepareRouter;
        global.NODICS = previous.NODICS;
        global.UTILS = previous.UTILS;
    }
});

test('configured routes with the same leaf name keep group-qualified runtime identities', () => {
    const previous = {
        NODICS: global.NODICS,
        CONFIG: global.CONFIG,
        SERVICE: global.SERVICE,
        _: global._
    };
    const registered = new Map();
    const bound = [];

    global._ = require('lodash');
    global.CONFIG = {
        get: key => key === 'servers' ? { options: { contextRoot: 'nodics' } } : {}
    };
    global.NODICS = {
        addRouter: (name, definition) => registered.set(name, definition)
    };
    global.SERVICE = {
        DefaultRouterOperationService: {
            get: (moduleRouter, definition) => bound.push(definition)
        }
    };

    try {
        routerService.prepareRouter({
            groupName: 'participation',
            routerName: 'wallet',
            routerDef: {
                key: '/participant/wallet', method: 'GET',
                accessGroups: ['customerUserGroup'], controller: 'ParticipantController'
            },
            urlPrefix: 'loyaltyApi', moduleName: 'loyaltyApi', moduleRouter: {}
        });
        routerService.prepareRouter({
            groupName: 'internal',
            routerName: 'wallet',
            routerDef: {
                key: '/wallets/:walletCode', method: 'GET',
                accessGroups: ['serviceAccountUserGroup'], controller: 'InternalController'
            },
            urlPrefix: 'loyaltyApi', moduleName: 'loyaltyApi', moduleRouter: {}
        });

        assert.deepEqual([...registered.keys()], [
            'loyaltyapi_participation_wallet',
            'loyaltyapi_internal_wallet'
        ]);
        assert.equal(bound[0].controller, 'ParticipantController');
        assert.equal(bound[1].controller, 'InternalController');
        assert.notEqual(bound[0].routerName, bound[1].routerName);
    } finally {
        global.NODICS = previous.NODICS;
        global.CONFIG = previous.CONFIG;
        global.SERVICE = previous.SERVICE;
        global._ = previous._;
    }
});
