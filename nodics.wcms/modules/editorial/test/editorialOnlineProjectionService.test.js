/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');
class NodicsError extends Error {}
global.CLASSES = { NodicsError };

let editorialConfig = { publication: { targetTransportProvider: 'Transport' } };
let transportPayload;
let updated = [];
global.CONFIG = { get: key => key === 'editorial' ? editorialConfig : undefined };
global.SERVICE = {
    Transport: {
        withdraw: (payload, request) => {
            transportPayload = { payload, request };
            return Promise.resolve({ articleCode: payload.articleCode, withdrawn: 1 });
        }
    },
    DefaultEditorialOnlineArticleService: {
        get: request => Promise.resolve({ result: [
            { code: 'projection-1', articleCode: request.query.articleCode, status: 'CURRENT' },
            { code: 'projection-2', articleCode: request.query.articleCode, status: 'CURRENT' }
        ] }),
        update: request => {
            updated.push(request);
            return Promise.resolve({ modified: 1 });
        }
    }
};

const service = require('../src/service/defaultEditorialOnlineProjectionService');

(async () => {
    let publication = { code: 'publication', rootCode: 'article', revision: 3 };
    let request = { tenant: 'default', authData: { tokenType: 'access' } };
    let transported = await service.withdraw(publication, request);
    assert.equal(transported.withdrawn, 1);
    assert.equal(transportPayload.payload.articleCode, 'article');
    assert.equal(transportPayload.payload.operationKey, 'publication:withdraw:3');
    assert.equal(transportPayload.request, request);

    editorialConfig = { publication: {} };
    updated = [];
    let local = await service.withdraw(publication, request);
    assert.equal(local.articleCode, 'article');
    assert.equal(local.withdrawn, 2);
    assert.deepStrictEqual(updated.map(item => item.query.code), ['projection-1', 'projection-2']);
    assert.deepStrictEqual(updated.map(item => item.model.status), ['WITHDRAWN', 'WITHDRAWN']);
})().catch(error => { console.error(error); process.exitCode = 1; });
