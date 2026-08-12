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
let captured;
global.SERVICE = {
    DefaultEditorialArticleService: { update: () => Promise.resolve({ modified: 1 }) },
    DefaultPublicationLifecycleService: { publishApproved: request => { captured = request.publication; return Promise.resolve({ code: request.publication.code, state: 'ONLINE' }); } }
};
const service = require('../src/service/defaultEditorialPublicationService');
(async () => {
    let result = await service.publishApproved({ editorial: { article: { code: 'article', revision: 2, status: 'APPROVED', workflowInstanceCode: 'workflow' } } });
    assert.equal(result.state, 'ONLINE');
    assert.equal(result.article.status, 'PUBLISHED');
    assert.equal(captured.domain, 'editorial');
    assert.equal(captured.sourceVersion, '2');
    assert.throws(() => service.publishApproved({ editorial: { article: { code: 'draft', revision: 1, status: 'DRAFT' } } }));
})().catch(error => { console.error(error); process.exitCode = 1; });
