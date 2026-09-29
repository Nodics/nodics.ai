/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/*
 * @module nSearch/search/test/searchRuntimeLifecycleContract
 * @description Validates search readiness and central shutdown contribution without requiring a live provider.
 * @layer test
 * @owner nSearch/search
 */
const assert = require('assert');

let lifecycleContributors = {};
let readinessContributors = {};
global.SERVICE = {
    DefaultRuntimeLifecycleService: { registerContributor: (name, value) => { lifecycleContributors[name] = value; } },
    DefaultHealthService: { registerReadinessContributor: (name, value) => { readinessContributors[name] = value; } }
};
global.CONFIG = { get: key => key === 'search' ? {
    default: { options: { enabled: false, fallback: true, engine: 'elastic' } },
    runtimeRoleProfiles: { PLATFORM: { productProjection: { options: { enabled: true } } } },
    cms: { options: { enabled: true } },
} : key === 'runtimeRole' ? { code: 'PLATFORM' } : undefined };
global.NODICS = { getModules: () => ({ cms: {}, profile: {} }) };
const definition = require('../src/service/config/defaultSearchConfigurationService');
let active = true;
let closed = 0;
let connection = { close: () => { closed++; return Promise.resolve(); } };
let service = Object.assign({}, definition, { searchEngines: {
    cms: { default: { isActive: () => active, getConnection: () => connection } }
} });

service.init();
assert(lifecycleContributors.searchEngines, 'search lifecycle contributor must be registered');
assert(readinessContributors.searchEngines, 'search readiness contributor must be registered');
assert.strictEqual(service.getSearchReadiness(), true);
let readiness = service.readiness();
assert.strictEqual(readiness.contractVersion, 1);
assert.strictEqual(readiness.businessStatus, 'READY');
assert.strictEqual(readiness.summary.readSourcePolicy, 'SEARCH_WITH_DATABASE_FALLBACK');
assert.strictEqual(readiness.summary.runtimeRole, 'PLATFORM');
assert.strictEqual(readiness.summary.configuredModuleCount, 1);
assert.strictEqual(readiness.summary.initializedEngineCount, 1);
assert(readiness.summary.repairActions.some(action => action.operation === 'search.index.rebuild'));
active = false;
assert.strictEqual(service.getSearchReadiness(), false);
let blocked = service.readiness();
assert.strictEqual(blocked.businessStatus, 'NEEDS_ATTENTION');
assert(blocked.blockers.some(blocker => blocker.code === 'SEARCH_ENGINE_UNAVAILABLE'
    && blocker.repair.operation === 'search.refreshEngines'));
active = true;
lifecycleContributors.searchEngines.shutdown().then(() => {
    assert.strictEqual(closed, 1);
    assert.deepStrictEqual(service.searchEngines, {});
    console.log('Search runtime lifecycle contract validated');
}).catch(error => { console.error(error); process.exit(1); });

require('node:test')('provider connection defaults reach consumers and later overrides stay isolated', () => {
    const bindings = require('../../../nConfig/src/service/defaultConfigurationBindingService');
    const defaults = bindings.merge(require('../config/properties').search, require('../../elastic/config/properties').search);
    const originalConfig = global.CONFIG;
    let selected = bindings.merge(defaults, { independentIndex: { options: { enabled: true } } });
    try {
        global.CONFIG = { get: key => key === 'search' ? selected : undefined };
        const inherited = definition.getSearchConfiguration('independentIndex', 'default');
        assert.deepStrictEqual(inherited.connection.hosts, ['http://localhost:9200']);
        assert.strictEqual(inherited.options.enabled, true);
        selected = bindings.merge(selected, {
            default: { elastic: { connection: { hosts: ['https://search.example.test:9243'] } } }
        });
        assert.deepStrictEqual(definition.getSearchConfiguration('independentIndex', 'default').connection.hosts,
            ['https://search.example.test:9243']);
        selected = bindings.merge(selected, {
            independentIndex: { elastic: { connection: { hosts: ['https://isolated.example.test:9243'] } } }
        });
        assert.deepStrictEqual(definition.getSearchConfiguration('independentIndex', 'default').connection.hosts,
            ['https://isolated.example.test:9243']);
        assert.deepStrictEqual(definition.getSearchConfiguration('otherIndex', 'default').connection.hosts,
            ['https://search.example.test:9243']);
        assert.strictEqual(definition.getSearchConfiguration('otherIndex', 'default').options.enabled, false);
        assert.deepStrictEqual(inherited.connection.hosts, ['http://localhost:9200']);
        assert.deepStrictEqual(defaults.default.elastic.connection.hosts, ['http://localhost:9200']);
    } finally {
        global.CONFIG = originalConfig;
    }
});
