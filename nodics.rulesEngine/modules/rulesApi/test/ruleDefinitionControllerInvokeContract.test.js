/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const assert = require('assert');
const controller = require('../src/controller/defaultRuleDefinitionController');
const statusDefinitions = require('../src/utils/statusDefinitions');

global.FACADE = {
    DefaultRuleDefinitionFacade: {
        propertyCatalogue: function () {
            return { code: 'eWaste.reward', properties: [] };
        },
        listDefinitions: function () {
            return Promise.resolve({ items: [] });
        }
    }
};

function invoke(operation, request) {
    return new Promise((resolve, reject) => {
        controller[operation](request, (error, result) => {
            if (error) return reject(error);
            resolve(result);
        });
    });
}

(async function run() {
    [
        'RULE_PROPERTY_CATALOGUE',
        'RULE_SIMULATION',
        'RULE_APPROVAL_PENDING',
        'SCORE_BAND_SET_PUBLISHED'
    ].forEach(code => {
        assert(
            statusDefinitions[code] && statusDefinitions[code].code,
            'Rules API must register response status code ' + code
        );
    });

    const syncResult = await invoke('propertyCatalogue', {
        httpRequest: {
            params: { propertyProviderCode: 'eWaste.reward' },
            query: { consumerModule: 'eWaste' }
        }
    });
    assert.strictEqual(syncResult.code, 'eWaste.reward');

    const asyncResult = await invoke('listDefinitions', {
        httpRequest: { params: {}, query: {} }
    });
    assert.deepStrictEqual(asyncResult.items, []);

    const directResult = await controller.propertyCatalogue({
        httpRequest: { params: {}, query: {} }
    });
    assert.strictEqual(directResult.code, 'eWaste.reward');

    console.log('Rules definition controller invoke contract validated');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
