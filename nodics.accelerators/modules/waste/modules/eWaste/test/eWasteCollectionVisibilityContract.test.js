/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";

/** @module eWaste/test/eWasteCollectionVisibilityContract @description Verifies public collection-centre discovery excludes disabled records even when their business status remains active. @layer test @owner eWaste */
const assert = require('node:assert/strict');
const experience = require('../src/service/defaultEWasteExperienceService');
const collection = require('../../../../../../nodics.waste/modules/wasteCollection/src/service/defaultWasteCollectionCentreService');

async function main() {
    const records = [
        { code: 'VISIBLE', active: true, operatingStatus: 'ACTIVE', publicVisibility: 'PUBLIC' },
        { code: 'DISABLED', active: false, operatingStatus: 'ACTIVE', publicVisibility: 'PUBLIC' },
        { code: 'PRIVATE', active: true, operatingStatus: 'ACTIVE', publicVisibility: 'PRIVATE' }
    ];
    const queries = [];
    global.SERVICE = {
        DefaultWasteCollectionCentreService: collection,
        DefaultWasteCollectionPointService: {
            get: async request => {
                queries.push(request.query);
                return { result: records.filter(record => Object.entries(request.query).every(([key, value]) => record[key] === value)) };
            }
        }
    };
    const service = Object.assign({}, experience, { store: () => ({ context: () => ({ tenant: 'visibility-test' }), list: async () => [] }) });
    const result = await service.experience({ tenant: 'visibility-test' });
    assert.deepStrictEqual(queries[0], { operatingStatus: 'ACTIVE', publicVisibility: 'PUBLIC', active: true });
    assert.deepStrictEqual(result.centres.map(centre => centre.code), ['VISIBLE']);
    const staff = await collection.search({ tenant: 'visibility-test', payload: { filters: { active: false } } });
    assert.deepStrictEqual(staff.records.map(centre => centre.code), ['DISABLED']);
    delete global.SERVICE;
    console.log('E-Waste public collection visibility contract validated');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
