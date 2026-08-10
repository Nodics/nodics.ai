/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module product/data/sample/sampleProductLocalizationDataHeader @description Imports shared Product identities before their English and Arabic variants. @layer data @owner product @override Projects provide separate versioned data releases rather than modifying framework samples. */
const entry = (schemaName, dataFilePrefix) => ({
    options: { enabled: true, schemaName: schemaName, operation: 'saveAll', dataFilePrefix: dataFilePrefix },
    query: { code: '$code', tenant: '$tenant' }
});

module.exports = { product: {
    sampleProductData: entry('product', 'sampleProductData'),
    sampleCategoryData: entry('category', 'sampleCategoryData'),
    sampleProductVariantData: entry('productVariant', 'sampleProductVariantData'),
    sampleProductLocalizationData: entry('productLocalization', 'sampleProductLocalizationData'),
    sampleCategoryLocalizationData: entry('categoryLocalization', 'sampleCategoryLocalizationData'),
    sampleProductVariantLocalizationData: entry('productVariantLocalization', 'sampleProductVariantLocalizationData')
} };
