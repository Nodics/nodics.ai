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
global.CONFIG = { get: () => ({ publication: { maximumDependencies: 10 } }) };
global.SERVICE = {};
const adapter = require('../src/service/defaultEditorialPublicationAdapterService');
(async () => {
    let article = { code: 'article', revision: 2, status: 'APPROVED', slug: 'article', authorCodes: ['author'], taxonomyTermCodes: ['news'], siteCodes: ['main'] };
    let dependencies = await adapter.resolveDependencies({ rootCode: 'article' }, article, { tenant: 'default' });
    assert.equal(dependencies[0].version, '2');
    assert.equal((await adapter.validate({ sourceVersion: 2 }, article, {}, dependencies)).valid, true);
    assert.equal((await adapter.validate({ sourceVersion: 1 }, article, {}, dependencies)).valid, false);
})();
