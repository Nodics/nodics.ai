/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
const crypto = require('node:crypto');

/**
 * @module product/service/defaultProductPublicationGraphService
 * @description Resolves an immutable Product-owned catalogue graph through generated versioned services.
 * @layer service
 * @owner product
 * @override Extend graph validation without weakening exact references, tenant isolation or bounded closure.
 */
module.exports = {
    /** Returns Product-owned persistence service identities, not a second provider registry. */
    services: function () {
        return { product: 'DefaultProductService', productLocalization: 'DefaultProductLocalizationService',
            productVariant: 'DefaultProductVariantService', productVariantLocalization: 'DefaultProductVariantLocalizationService',
            category: 'DefaultCategoryService', categoryLocalization: 'DefaultCategoryLocalizationService' };
    },
    /** Returns effective owner limits. */
    policy: function () { return (CONFIG.get('product') || {}).publication || {}; },
    /** Produces deterministic JSON without storage identities; retained source records remain authoritative. */
    canonical: function (value, storageRecord) {
        if (value instanceof Date) return value.toISOString();
        if (Array.isArray(value)) return value.map(item => this.canonical(item, false));
        if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort()
            .filter(key => (key !== '_id' || storageRecord === false) && value[key] !== undefined)
            .map(key => [key, this.canonical(value[key], false)]));
        return value;
    },
    /** Hashes exact content using a stable object-key order. */
    hash: function (value) { return crypto.createHash('sha256').update(JSON.stringify(this.canonical(value))).digest('hex'); },
    /** Orders references by code units so graph identities do not depend on host ICU locale. */
    compareReferences: function (left, right) {
        const a = JSON.stringify([left.schema, left.code]), b = JSON.stringify([right.schema, right.code]);
        return a < b ? -1 : a > b ? 1 : 0;
    },
    /** Requires generated immutable storage, not a request flag or a revision masquerading as a version. */
    assertVersioned: function (request, schema) {
        const model = (NODICS.getModels('product', request.tenant) || {})[UTILS.createModelName(schema)];
        if (!model || model.versioned !== true || !model.rawSchema || model.rawSchema.versionedReadMode !== 'CURRENT') {
            throw new Error('Product publication requires qualified CURRENT versioned storage: ' + schema);
        }
    },
    /** Reads one exact immutable record and rejects missing, duplicate or foreign responses. */
    read: async function (request, reference) {
        const name = this.services()[reference.schema];
        if (!request.tenant || !name || !reference.code || !Number.isSafeInteger(reference.versionId) || reference.versionId < 0) {
            throw new Error('Exact Product source reference is required');
        }
        this.assertVersioned(request, reference.schema);
        const response = await SERVICE[name].get({ tenant: request.tenant, authData: request.authData,
            query: { tenant: request.tenant, code: reference.code, versionId: reference.versionId },
            searchOptions: { limit: 2, pageSize: 2 } });
        const rows = response && response.result;
        if (!Array.isArray(rows) || rows.length !== 1 || (Number.isFinite(response.count) && response.count !== 1) || rows[0].tenant !== request.tenant ||
            rows[0].code !== reference.code || rows[0].versionId !== reference.versionId ||
            (reference.hash && reference.hash !== this.hash(rows[0]))) throw new Error('Product source version is missing or changed');
        return this.canonical(rows[0]);
    },
    /** Reads bounded current membership through the generated service, never raw history or caller-supplied rows. */
    current: async function (request, schema, query) {
        this.assertVersioned(request, schema);
        const limit = this.policy().maximumDependencies;
        if (!Number.isSafeInteger(limit) || limit < 1) throw new Error('Product dependency bound is invalid');
        const response = await SERVICE[this.services()[schema]].get({ tenant: request.tenant, authData: request.authData,
            query: Object.assign({}, query, { tenant: request.tenant }), searchOptions: { limit: limit + 1, pageSize: limit + 1 } });
        if (!response || !Array.isArray(response.result) || response.result.length > limit ||
            (Number.isFinite(response.count) && response.count > limit)) throw new Error('Product dependency capture is incomplete');
        const seen = new Set();
        return response.result.map(row => {
            if (row.tenant !== request.tenant || !row.code || seen.has(row.code) || !Number.isSafeInteger(row.versionId) || row.versionId < 0) {
                throw new Error('Product current dependency identity is invalid');
            }
            seen.add(row.code);
            return this.canonical(row);
        });
    },
    /** Captures exact membership for the next immutable root save; this read-only method does not activate or write sources. */
    captureReferences: async function (request, productCode, storeCode) {
        if (!productCode || !storeCode) throw new Error('Product and Store are required');
        const roots = await this.current(request, 'product', { code: productCode });
        if (roots.length !== 1 || roots[0].code !== productCode) throw new Error('Current Product is unavailable');
        const records = {};
        records.productLocalization = await this.current(request, 'productLocalization', { productCode: productCode, status: 'READY' });
        records.productVariant = await this.current(request, 'productVariant', { productCode: productCode, status: 'ACTIVE' });
        records.productVariantLocalization = records.productVariant.length ? await this.current(request, 'productVariantLocalization',
            { productCode: productCode, variantCode: { $in: records.productVariant.map(row => row.code) }, status: 'READY' }) : [];
        records.category = [];
        const pending = new Set(records.productLocalization.flatMap(row => (row.classificationValues || {}).categoryCodes || []));
        for (const code of pending) {
            if (pending.size > this.policy().maximumDependencies) throw new Error('Product category dependency bound exceeded');
            const rows = await this.current(request, 'category', { code: code });
            if (rows.length !== 1 || rows[0].code !== code) throw new Error('Product category dependency is missing');
            records.category.push(rows[0]);
            if (rows[0].parentCode) pending.add(rows[0].parentCode);
        }
        records.categoryLocalization = records.category.length ? await this.current(request, 'categoryLocalization',
            { categoryCode: { $in: records.category.map(row => row.code) }, status: 'READY' }) : [];
        this.validateGraph(request, roots[0], records);
        const references = Object.entries(records).flatMap(([schema, rows]) => rows.map(row =>
            ({ schema: schema, code: row.code, versionId: row.versionId, hash: this.hash(row) })));
        if (references.length > this.policy().maximumDependencies) throw new Error('Product dependency bound exceeded');
        return { storeCode: storeCode, records: references };
    },
    /** Validates the declared membership, category ancestry and localization ownership of the immutable graph. */
    validateGraph: function (request, root, records) {
        if (root.status !== 'ACTIVE') throw new Error('Product source is not active');
        const localizations = records.productLocalization || [], variants = records.productVariant || [],
            categories = records.category || [], categoryLocalizations = records.categoryLocalization || [],
            variantLocalizations = records.productVariantLocalization || [];
        const localePolicy = SERVICE.DefaultProductLocalizationPolicyService;
        for (const [rows, ownerKey, owners, kind] of [
            [localizations, 'productCode', [root], 'product'],
            [variantLocalizations, 'variantCode', variants, 'variant'],
            [categoryLocalizations, 'categoryCode', categories, 'category']
        ]) {
            const seen = new Set();
            for (const row of rows) {
                const key = JSON.stringify([row[ownerKey], localePolicy.canonicalize(row.locale)]);
                if (seen.has(key) || !owners.some(owner => owner.code === row[ownerKey]) || row.status !== 'READY' ||
                    (kind === 'variant' && row.productCode !== root.code)) throw new Error('Invalid Product localization closure');
                seen.add(key);
            }
            for (const owner of owners) localePolicy.completeness(request, rows.filter(row => row[ownerKey] === owner.code), kind);
        }
        if (variants.some(row => row.productCode !== root.code || row.status !== 'ACTIVE')) throw new Error('Invalid Product variant closure');
        const reached = new Set();
        for (const code of new Set(localizations.flatMap(row => (row.classificationValues || {}).categoryCodes || []))) {
            const chain = new Set();
            let next = code;
            while (next) {
                if (chain.has(next)) throw new Error('Product category ancestry cycle');
                chain.add(next); reached.add(next);
                const category = categories.find(row => row.code === next);
                if (!category || category.status !== 'ACTIVE') throw new Error('Product category closure is incomplete');
                next = category.parentCode;
            }
        }
        if (categories.some(row => !reached.has(row.code))) throw new Error('Product graph contains unrelated categories');
    },
    /** Loads only references sealed in the selected immutable Product root version. */
    resolve: async function (publication, request) {
        if (!request || !request.tenant || publication.domain !== 'product' || publication.rootType !== 'product' ||
            !/^(0|[1-9][0-9]*)$/.test(String(publication.sourceVersion))) throw new Error('Exact Product publication identity is required');
        const root = await this.read(request, { schema: 'product', code: publication.rootCode, versionId: Number(publication.sourceVersion) });
        const selection = root.publicationReferences;
        const limit = this.policy().maximumDependencies;
        if (!Number.isSafeInteger(limit) || limit < 1 || !selection || typeof selection.storeCode !== 'string' || !selection.storeCode ||
            !Array.isArray(selection.records) || selection.records.length > limit) throw new Error('Sealed Product dependency selection is required');
        const records = {}, references = [], seen = new Set();
        for (const reference of selection.records) {
            const key = JSON.stringify([reference.schema, reference.code]);
            if (reference.schema === 'product' || seen.has(key) || !/^[a-f0-9]{64}$/.test(reference.hash || '')) {
                throw new Error('Duplicate or invalid Product dependency reference');
            }
            seen.add(key);
            const record = await this.read(request, reference);
            (records[reference.schema] ||= []).push(record);
            references.push({ schema: reference.schema, code: record.code, versionId: record.versionId, hash: this.hash(record) });
        }
        this.validateGraph(request, root, records);
        references.push({ schema: 'product', code: root.code, versionId: root.versionId, hash: this.hash(root) });
        references.sort(this.compareReferences);
        const scope = { tenant: request.tenant, productCode: root.code, storeCode: selection.storeCode };
        const version = this.hash({ scope: scope, references: references });
        return { version: version, scope: scope, root: root, records: records, references: references };
    },
    /** Builds immutable catalogue-only projections; operational summaries are resolved by their owners at use time. */
    projections: function (manifest, request) {
        const records = manifest.records;
        return records.productLocalization.map(localization => {
            const model = SERVICE.DefaultProductLocalizedProjectionBuilderService.build(request, {
                product: manifest.root, localizations: records.productLocalization, locale: localization.locale,
                storeCode: manifest.scope.storeCode, variants: records.productVariant || [],
                variantCodes: (records.productVariant || []).map(row => row.code),
                categoryCodes: (localization.classificationValues || {}).categoryCodes || []
            });
            model.publicationVersion = manifest.version;
            model.code = this.hash([manifest.scope, model.locale, manifest.version]);
            model.status = 'STALE';
            model.sourceHash = this.hash({ version: manifest.version, locale: model.locale, payload: model.payload });
            return model;
        });
    }
};
