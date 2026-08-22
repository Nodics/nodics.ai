/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nImport/test/fixtures/multi-format/records-array-update
 * @description Updated JavaScript import fixture proving arrays replace stale values.
 * @layer test-fixture
 * @owner import
 * @override Test fixtures may change sample values while preserving import-parser coverage.
 */
module.exports = {
    record0: {
        code: 'jsArrayRefresh',
        productCodes: ['newOne', 'newTwo']
    }
};
