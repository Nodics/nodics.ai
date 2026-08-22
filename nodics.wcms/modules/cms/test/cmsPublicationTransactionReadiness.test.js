/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module cms/test/CmsPublicationTransactionReadiness */
const assert = require('assert');
const target = require('../src/service/publication/defaultCmsPublicationTargetService');

class NodicsError extends Error { constructor(code, message) { super(message || code); this.code = code; } }
global.CLASSES = { NodicsError };
global.CONFIG = { get: key => key === 'cms' ? { publication: { transactionModuleName: 'cms' } } : undefined };

(async function () {
    global.SERVICE = {};
    assert.throws(() => target.assertTransactionalReadiness({ tenant: 'tenant-a' }),
        error => error.code === 'CMS_PUBLICATION_TRANSACTION_UNAVAILABLE');

    let executed = false;
    global.SERVICE.DefaultDatabaseTransactionService = {
        capabilities: () => ({ multiRecordAtomic: false, contextPropagation: false }),
        execute: async () => { executed = true; }
    };
    assert.throws(() => target.assertTransactionalReadiness({ tenant: 'tenant-a' }),
        error => error.code === 'CMS_PUBLICATION_TRANSACTION_UNSUPPORTED');
    assert.strictEqual(executed, false, 'unsupported providers must fail before publication work starts');

    global.SERVICE.DefaultDatabaseTransactionService.capabilities = () =>
        ({ multiRecordAtomic: true, contextPropagation: false });
    assert.throws(() => target.assertTransactionalReadiness({ tenant: 'tenant-a' }),
        error => error.code === 'CMS_PUBLICATION_TRANSACTION_UNSUPPORTED');

    let scope;
    global.SERVICE.DefaultDatabaseTransactionService.capabilities = input => {
        scope = input; return { multiRecordAtomic: true, contextPropagation: true, contractVersion: 0 };
    };
    global.SERVICE.DefaultDatabaseTransactionService.execute = async (input, work) => {
        assert.deepStrictEqual(input, { tenant: 'tenant-a', moduleName: 'cms' });
        return work(Object.freeze({ transactionId: 'opaque' }));
    };
    let context;
    let result = await target.transaction({ tenant: 'tenant-a' }, async request => {
        context = request.transactionContext; return 'committed';
    });
    assert.deepStrictEqual(scope, { tenant: 'tenant-a', moduleName: 'cms' });
    assert.strictEqual(context.transactionId, 'opaque');
    assert.strictEqual(result, 'committed');

    global.SERVICE.DefaultDatabaseTransactionService.execute = async (input, work) => work(Object.freeze({ transactionId: 'abort' }));
    await assert.rejects(target.transaction({ tenant: 'tenant-a' }, async () => { throw new Error('forced abort'); }), /forced abort/);
    console.log('CMS publication transaction readiness validated');
})().catch(error => { console.error(error); process.exit(1); });
