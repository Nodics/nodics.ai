/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module nService/test/generatedServiceLocalResetContract */
const assert = require('assert');
const generatedService = require('../src/service/common');

(async function () {
    let pipelineStarted = false;
    const authority = Object.freeze({ capability: 'LOCAL_RESET_PROVIDER' });
    global.NODICS = {
        getModels: function () {
            return {};
        }
    };
    global.SERVICE = {
        DefaultLocalResetProviderService: {
            authorizes: request => request.localResetAuthority === authority
        },
        DefaultPipelineService: {
            start: function () {
                pipelineStarted = true;
                return Promise.resolve(true);
            }
        }
    };

    await assert.rejects(
        generatedService.remove({ tenant: 'default', localResetAuthority: authority }),
        error => error.localResetMissingModel === true && error.code === 'LOCAL_RESET_MODEL_REGISTRY_MISSING'
    );
    assert.strictEqual(pipelineStarted, false);

    await generatedService.remove({ tenant: 'default' });
    assert.strictEqual(pipelineStarted, true);

    console.log('Generated service Local reset missing-model contract validated');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
