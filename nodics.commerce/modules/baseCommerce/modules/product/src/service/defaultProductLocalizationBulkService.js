/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module product/service/defaultProductLocalizationBulkService
 * @description Preflights Product-owned localization batches consumed by governed nImport and nExport workflows.
 * @layer service
 * @owner product
 * @override Projects may extend validation while preserving nImport and nExport transport ownership.
 */
module.exports = {
    /** Validates batch bounds, identity uniqueness, tenant isolation, and optional publication completeness. */
    preflight: function (request, input) {
        let rows = input && Array.isArray(input.rows) ? input.rows : [];
        let kind = input && input.kind || 'product';
        let maximum = Number(SERVICE.DefaultProductLocalizationPolicyService.policy().maximumBatchSize || 100);
        if (!request || !request.tenant || rows.length === 0 || rows.length > maximum) {
            throw new Error('Product localization batch is empty or exceeds its configured bound');
        }
        let ownerProperty = kind === 'category' ? 'categoryCode' : kind === 'variant' ? 'variantCode' : 'productCode';
        let identities = new Set();
        rows.forEach(row => {
            SERVICE.DefaultProductLocalizationPolicyService.validate(request, row, kind);
            let identity = [row.tenant, row[ownerProperty], SERVICE.DefaultProductLocalizationPolicyService.canonicalize(row.locale)].join('|');
            if (identities.has(identity)) throw new Error('Product localization batch contains a duplicate tenant owner and locale');
            identities.add(identity);
        });
        let owners = Array.from(new Set(rows.map(row => row[ownerProperty])));
        let completeness = [];
        if (input.requireComplete) {
            owners.forEach(ownerCode => completeness.push(Object.assign({ ownerCode: ownerCode },
                SERVICE.DefaultProductLocalizationPolicyService.completeness(request,
                    rows.filter(row => row[ownerProperty] === ownerCode), kind))));
        }
        return Object.freeze({ valid: true, kind: kind, rowCount: rows.length, ownerCount: owners.length,
            maximumBatchSize: maximum, completeness: Object.freeze(completeness) });
    },

    /** Produces tenant-scoped export rows; nExport remains responsible for file generation and Media evidence. */
    prepareExport: function (request, input) {
        let rows = input && Array.isArray(input.rows) ? input.rows : [];
        let locales = new Set(((input && input.locales) || []).map(SERVICE.DefaultProductLocalizationPolicyService.canonicalize.bind(
            SERVICE.DefaultProductLocalizationPolicyService)));
        return Object.freeze(rows.filter(row => row.tenant === request.tenant &&
            (locales.size === 0 || locales.has(SERVICE.DefaultProductLocalizationPolicyService.canonicalize(row.locale))))
            .map(row => Object.freeze(Object.assign({}, row, { locale: SERVICE.DefaultProductLocalizationPolicyService.canonicalize(row.locale) }))));
    }
};
