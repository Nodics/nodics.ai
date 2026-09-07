/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module import/test/dataReleaseControllerRouteTypeContract
 * @description Verifies that route-owned Init, Core, and Sample catalogue endpoints preserve their data type before delegating to the release facade.
 * @layer test
 * @owner import
 * @override Project modules may add route-specific release catalogue tests, but must not allow fixed routes to return mixed release types.
 */

const assert = require('assert');
const controller = require('../src/controller/release/defaultDataReleaseController');

const observed = [];
const preflight = [];
global.FACADE = {
    DefaultDataReleaseFacade: {
        getCatalogue: request => {
            observed.push(request.dataType);
            return Promise.resolve({ code: 'SUC_IMP_00000', data: [] });
        },
        preflight: request => {
            preflight.push(request.releaseRequest);
            return Promise.resolve({ code: 'SUC_IMP_00000', data: [] });
        }
    }
};

(async function () {
    await controller.getInitCatalogue({ httpRequest: { query: {} } });
    await controller.getCoreCatalogue({ httpRequest: { query: {} } });
    await controller.getSampleCatalogue({ httpRequest: { query: {} } });
    await controller.getCatalogue({ httpRequest: { query: { dataType: 'core' } } });
    await controller.preflightInit({ httpRequest: { body: { releaseCodes: ['module:init'] } } });
    await controller.preflightCore({ httpRequest: { body: { releaseCodes: ['module:core'] } } });
    await controller.preflightSample({ httpRequest: { body: { releaseCodes: ['module:sample'] } } });

    assert.deepStrictEqual(observed, ['init', 'core', 'sample', 'core']);
    assert.deepStrictEqual(preflight.map(request => request.dataType), ['init', 'core', 'sample']);
    assert.deepStrictEqual(preflight.map(request => request.releaseCodes[0]), ['module:init', 'module:core', 'module:sample']);
    console.log('Data release controller route type contract validated');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
