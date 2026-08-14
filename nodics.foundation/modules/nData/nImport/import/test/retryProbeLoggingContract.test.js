/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');

/**
 * @module import/test/retryProbeLoggingContract
 * @description Verifies that non-final init import phases mark file-level
 * pipeline errors as retry probes so clean first-start imports do not emit
 * error-level logs while final or fail-fast failures remain visible.
 * @layer test
 * @owner import
 */

let stopImportOnFailure = false;

global.CONFIG = {
    get: function (key) {
        if (key === 'data') {
            return {
                stopImportOnFailure: stopImportOnFailure
            };
        }
        return undefined;
    }
};
global.CLASSES = {
    DataImportError: class DataImportError extends Error {
        constructor(error, message, code) {
            super(message || (error && error.message) || String(error));
            this.code = code || (error && error.code);
        }
    }
};
global.SERVICE = {};

String.prototype.toUpperCaseFirstChar = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

const processDefinition = require('../src/service/process/init/defaultDataImportProcessService');
const modelProcessDefinition = require('../src/service/process/model/defaultModelImportProcessService');

assert.strictEqual(processDefinition.shouldSuppressRetryErrorLog({}, {
    phase: 0,
    phaseLimit: 5
}), true, 'non-final retry phase must be low-noise');

assert.strictEqual(processDefinition.shouldSuppressRetryErrorLog({}, {
    phase: 4,
    phaseLimit: 5
}), false, 'final retry phase must remain error-visible');

stopImportOnFailure = true;
assert.strictEqual(processDefinition.shouldSuppressRetryErrorLog({}, {
    phase: 0,
    phaseLimit: 5
}), false, 'fail-fast imports must not suppress error-level logging');

stopImportOnFailure = false;
assert.strictEqual(processDefinition.shouldSuppressRetryErrorLog({
    fileData: {
        header: {
            options: {
                stopImportOnFailure: true
            }
        }
    }
}, {
    phase: 0,
    phaseLimit: 5
}), false, 'header-level fail-fast imports must not suppress error-level logging');

let forwardedRequest;
global.SERVICE.DefaultCmsSiteService = {
    save: function (request) {
        forwardedRequest = request;
        return Promise.resolve({
            result: [{ code: 'axisCmsSite' }]
        });
    }
};

modelProcessDefinition.insertLocalSchemaModel({
    tenant: 'default',
    header: {
        options: {
            operation: 'save',
            schemaName: 'cmsSite',
            userGroups: ['adminGroup']
        }
    },
    suppressRetryErrorLog: true
}, [{ code: 'axisCmsSite' }]).then(() => {
    assert.strictEqual(
        forwardedRequest.suppressRetryErrorLog,
        true,
        'model import must forward retryable logging suppression into generated schema service operations'
    );
    console.log('Import retry probe logging contract validated');
}).catch(error => {
    console.error(error);
    process.exit(1);
});
