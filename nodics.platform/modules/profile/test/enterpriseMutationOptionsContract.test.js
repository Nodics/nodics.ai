/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('node:assert/strict');
const test = require('node:test');
const owner = require('../src/service/interceptors/defaultEnterpriseUpdateInterceptorService');

for (const operation of [
    'enterprisePreSave',
    'enterprisePreUpdate',
    'enterprisePreRemove',
]) {
    test(operation + ' preserves explicit non-recursive response options', async () => {
        const request = {
            options: { recursive: false, returnModified: false },
        };
        await owner[operation](request, {});
        assert.deepEqual(request.options, {
            recursive: false,
            returnModified: false,
        });
    });

    test(operation + ' supplies existing expanded-response defaults only when omitted', async () => {
        const request = { options: {} };
        await owner[operation](request, {});
        assert.deepEqual(request.options, {
            recursive: true,
            returnModified: true,
        });
    });
}
