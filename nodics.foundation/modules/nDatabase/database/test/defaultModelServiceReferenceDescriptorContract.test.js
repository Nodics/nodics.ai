/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');

/**
 * @module database/test/defaultModelServiceReferenceDescriptorContract
 * @description Verifies nested-save traversal preserves portable reference
 * descriptors instead of treating them as child records to persist.
 * @layer test
 * @owner database
 */

global.UTILS = {
    isBlank: function (value) {
        return !value || Object.keys(value).length === 0;
    },
    isObject: function (value) {
        return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
    },
    isObjectId: function () {
        return false;
    },
    isArrayOfObject: function (value) {
        return Array.isArray(value) && value.length > 0 && value.every(item => item && typeof item === 'object' && !Array.isArray(item));
    }
};

const service = require('../src/service/model/defaultModelService');

global.SERVICE = {
    DefaultModelService: service,
    DefaultAddressService: {
        saveAll: function () {
            throw new Error('Reference descriptors must not be persisted as nested records');
        }
    }
};

let addressRef = {
    moduleName: 'profile',
    schemaName: 'address',
    code: 'ADDR_SAMPLE_COLLECTION_CENTRE_YOU_AND_CO'
};
let request = {
    schemaModel: {
        rawSchema: {
            refSchema: {
                addressRef: {
                    enabled: true,
                    moduleName: 'profile',
                    schemaName: 'address',
                    type: 'one',
                    propertyName: 'code'
                }
            }
        }
    },
    model: {
        code: 'LOC_SAMPLE_COLLECTION_CENTRE_YOU_AND_CO',
        addressRef: addressRef
    }
};

service.saveNestedModels({
    request: request,
    response: {},
    model: request.model,
    propertiesList: ['addressRef'],
    callback: service.saveNestedModels
}).then(async () => {
    assert.deepStrictEqual(request.model.addressRef, addressRef);
    const definition = request.schemaModel.rawSchema.refSchema.addressRef;
    const canonical = { module: 'profile', schema: 'address', code: 'ADDR_CANONICAL' };
    assert.strictEqual(service.isReferenceDescriptor(canonical, definition), true);
    request.model.addressRef = canonical;
    await service.saveNestedModels({ request, response: {}, model: request.model, propertiesList: ['addressRef'] });
    assert.deepStrictEqual(request.model.addressRef, canonical);
    assert.strictEqual(service.isReferenceDescriptor({ ...canonical, module: 'other' }, definition), false);
    assert.strictEqual(service.isReferenceDescriptor({ ...canonical, moduleName: 'other' }, definition), false);
    assert.strictEqual(service.isReferenceDescriptor({ ...canonical, schema: 'customer' }, definition), false);
    assert.strictEqual(service.isReferenceDescriptor({ ...canonical, city: 'Dubai' }, definition), false);
    assert.strictEqual(service.isReferenceDescriptor({ module: 'profile', schema: 'address' }, definition), false);
    console.log('Reference descriptor nested-save contract validated');
}).catch(error => {
    console.error(error);
    process.exitCode = 1;
});
