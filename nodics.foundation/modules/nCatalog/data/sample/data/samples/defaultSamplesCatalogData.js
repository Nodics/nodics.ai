/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nodics.foundation/modules/nCatalog/data/sample/data/samples/defaultSamplesCatalogData
 * @description Provides nCatalog initializer or sample data consumed by the import layer.
 * @layer data
 * @owner nCatalog
 * @override Projects may override or extend this initializer data through layered import data rather than editing out-of-the-box framework records.
 */
module.exports = {

    record0: {
        code: "defaultProductCatalog",
        catalogType: "PRODUCT",
        subCatalogs: ['inProductCatalog', 'uaeProductCatalog', 'deProductCatalog']
    },
    record1: {
        code: "defaultContentCatalog",
        catalogType: "CONTENT",
        subCatalogs: ['inContentCatalog', 'uaeContentCatalog', 'deContentCatalog']
    },
    record2: {
        code: "inProductCatalog",
        name: "inProductCatalog",
        catalogType: "PRODUCT",
        active: true
    },
    record3: {
        code: "uaeProductCatalog",
        name: "uaeProductCatalog",
        catalogType: "PRODUCT",
        active: true
    },
    record4: {
        code: "deProductCatalog",
        name: "deProductCatalog",
        catalogType: "PRODUCT",
        active: true
    },
    record5: {
        code: "inContentCatalog",
        name: "inContentCatalog",
        catalogType: "CONTENT",
        active: true
    },
    record6: {
        code: "uaeContentCatalog",
        name: "uaeContentCatalog",
        catalogType: "CONTENT",
        active: true
    },
    record7: {
        code: "deContentCatalog",
        name: "deContentCatalog",
        catalogType: "CONTENT",
        active: true
    }
};
