/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module nSystem/test/LocalResetProviderService */
const assert = require('assert');
const service = Object.assign({}, require('../src/service/operations/defaultLocalResetProviderService'));
class NodicsError extends Error { constructor(code, message) { super(message || code); this.code = code; } }

(async function () {
    let policy = { enabled: true, environmentAllowlist: ['kickoffLocal'], confirmation: 'RESET_LOCAL_NODICS_DATA',
        allowMissingModelServices: true,
        serviceNames: ['DefaultCatalogService'] };
    global.CLASSES = { NodicsError };
    global.CONFIG = { get: key => key === 'localResetProvider' ? policy : undefined };
    global.NODICS = { getSelectedEnvironmentName: () => 'kickoffLocal' };
    global.SERVICE = {
        DefaultCatalogService: {
            remove: async () => {
                let error = new TypeError("Cannot read properties of undefined (reading 'models')");
                error.stack = 'TypeError: Cannot read properties of undefined (reading \'models\')\n    at module.exports.getModels';
                throw error;
            }
        }
    };
    await service.init();
    let result = await service.reset({ tenant: 'default', authData: { tokenType: 'service' },
        confirmation: policy.confirmation, resetScope: 'LOCAL_ACCEPTANCE' });
    assert.strictEqual(result.acknowledged, true);
    assert.strictEqual(result.serviceCount, 0);
    assert.strictEqual(result.skippedServiceCount, 1);
    assert.deepStrictEqual(result.skippedServices, ['DefaultCatalogService']);

    SERVICE.DefaultCatalogService.remove = async () => {
        let error = new TypeError("Cannot read properties of undefined (reading 'schemaName')");
        error.stack = 'TypeError: Cannot read properties of undefined (reading \'schemaName\')\n' +
            '    at Object.applyPreInterceptors (defaultModelsRemoveInitializerService.js:219:46)';
        throw error;
    };
    result = await service.reset({ tenant: 'default', authData: { tokenType: 'service' },
        confirmation: policy.confirmation, resetScope: 'LOCAL_ACCEPTANCE' });
    assert.strictEqual(result.acknowledged, true);
    assert.strictEqual(result.serviceCount, 0);
    assert.strictEqual(result.skippedServiceCount, 1);

    delete SERVICE.DefaultCatalogService;
    result = await service.reset({ tenant: 'default', authData: { tokenType: 'service' },
        confirmation: policy.confirmation, resetScope: 'LOCAL_ACCEPTANCE' });
    assert.strictEqual(result.acknowledged, true);
    assert.strictEqual(result.serviceCount, 0);
    assert.strictEqual(result.skippedServiceCount, 1);
    assert.deepStrictEqual(result.skippedServices, ['DefaultCatalogService']);

    SERVICE.DefaultCatalogService = { remove: async () => {
        let error = new TypeError("Cannot read properties of undefined (reading 'schemaName')");
        error.stack = 'TypeError: Cannot read properties of undefined (reading \'schemaName\')\n' +
            '    at Object.applyPreInterceptors (defaultModelsRemoveInitializerService.js:219:46)';
        throw error;
    } };
    policy.requiredServiceNames = ['DefaultCatalogService'];
    await assert.rejects(service.reset({ tenant: 'default', authData: { tokenType: 'service' },
        confirmation: policy.confirmation, resetScope: 'LOCAL_ACCEPTANCE' }), /Local reset did not clear every configured service/);

    delete SERVICE.DefaultCatalogService;
    await assert.rejects(service.reset({ tenant: 'default', authData: { tokenType: 'service' },
        confirmation: policy.confirmation, resetScope: 'LOCAL_ACCEPTANCE' }), /Configured Local reset service is unavailable/);

    SERVICE.DefaultCatalogService = { remove: async () => {
        let error = new TypeError("Cannot read properties of undefined (reading 'schemaName')");
        error.stack = 'TypeError: Cannot read properties of undefined (reading \'schemaName\')\n' +
            '    at Object.applyPreInterceptors (defaultModelsRemoveInitializerService.js:219:46)';
        throw error;
    } };
    policy.requiredServiceNames = [];
    policy.allowMissingModelServices = false;
    await assert.rejects(service.reset({ tenant: 'default', authData: { tokenType: 'service' },
        confirmation: policy.confirmation, resetScope: 'LOCAL_ACCEPTANCE' }), /Local reset did not clear every configured service/);

    SERVICE.DefaultCatalogService.remove = async () => {
        throw new Error('database write denied');
    };
    await assert.rejects(service.reset({ tenant: 'default', authData: { tokenType: 'service' },
        confirmation: policy.confirmation, resetScope: 'LOCAL_ACCEPTANCE' }), /database write denied/);

    console.log('Local reset provider service contract validated');
})().catch(error => { console.error(error); process.exit(1); });
