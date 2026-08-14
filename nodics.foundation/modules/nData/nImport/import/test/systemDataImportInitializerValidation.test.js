/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');

global.UTILS = {
    isArray: Array.isArray
};
global.CLASSES = {
    DataImportError: function DataImportError(code, message) {
        this.code = code;
        this.message = message;
    }
};

const initializer = require('../src/service/system/defaultSystemDataImportInitializerService');

function createService() {
    return Object.assign({}, initializer, {
        LOG: {
            debug: function () {}
        }
    });
}

function validate(request) {
    let state = {};
    createService().validateRequest(request, {}, {
        error: function (_request, _response, error) {
            state.error = error;
        },
        nextSuccess: function () {
            state.success = true;
        }
    });
    return {
        request: request,
        state: state
    };
}

let missingModules = validate({});
assert.strictEqual(missingModules.state.error.code, 'ERR_IMP_00003');

let nonArrayModules = validate({
    modules: 'profile'
});
assert.strictEqual(nonArrayModules.state.error.code, 'ERR_IMP_00003');

let emptyModules = validate({
    modules: []
});
assert.strictEqual(emptyModules.state.error.code, 'ERR_IMP_00003');

let validModules = validate({
    modules: ['profile']
});
assert.strictEqual(validModules.state.success, true);
assert.deepStrictEqual(validModules.request.data, {});

global.NODICS = {
    isModuleActive: function (moduleName) {
        return moduleName === 'activeTarget';
    }
};

let buildHeaderState = {};
let headerRequest = {
    data: {
        headerFiles: {
            mixedHeaders: [
                require.resolve('./fixtures/system-import/mixedTargetHeader.js')
            ]
        }
    },
    importRun: {
        summary: {
            enabledHeaders: 0,
            disabledHeaders: 0
        },
        headers: []
    }
};

createService().buildHeaderInstances(headerRequest, {}, {
    nextSuccess: function () {
        buildHeaderState.success = true;
    },
    error: function (_request, _response, error) {
        buildHeaderState.error = error;
    }
});

assert.strictEqual(buildHeaderState.success, true);
assert.deepStrictEqual(Object.keys(headerRequest.data.headers), ['activeData']);
assert.strictEqual(headerRequest.importRun.summary.enabledHeaders, 1);
assert.strictEqual(headerRequest.importRun.summary.disabledHeaders, 1);
assert.strictEqual(headerRequest.importRun.headers[0].targetModule, 'activeTarget');
