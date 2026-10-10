/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
const crypto = require('node:crypto');

// Only verified roots can create a dependency-read capability; request fields cannot supply one.
const memberships = new WeakMap();
// Capability minting is private security authority, never a mergeable customization surface.
const membershipAuthority = {
    /** Mints a private read capability for a verified root and its sealed dependency references. */
    rootMembership: function (request, root, references, owner) {
        const token = {};
        memberships.set(token, { request, productCode: root.code,
            references: references && new Set(references.map(reference => owner.referenceKey(reference))),
            variants: new Set((references || []).filter(row => row.schema === 'productVariant').map(row => row.code)),
            categories: new Set((references || []).filter(row => row.schema === 'category').map(row => row.code)) });
        return token;
    }
};

/**
 * @module product/service/defaultProductPublicationGraphService
 * @description Resolves an immutable Product-owned catalogue graph through generated versioned services.
 * @layer service
 * @owner product
 * @override Extend graph validation without weakening exact references, tenant isolation or bounded closure.
 */
module.exports = {
    /** Returns the exact schema/code/version/hash key; overrides must preserve every coordinate. @param {Object} reference Sealed source reference. @returns {string} Stable membership key. */
    referenceKey: function (reference) { return JSON.stringify([reference.schema, reference.code, reference.versionId, reference.hash]); },
    /** Returns Product-owned persistence service identities, not a second provider registry. */
    services: function () {
        return { product: 'DefaultProductService', productLocalization: 'DefaultProductLocalizationService',
            productVariant: 'DefaultProductVariantService', productVariantLocalization: 'DefaultProductVariantLocalizationService',
            category: 'DefaultCategoryService', categoryLocalization: 'DefaultCategoryLocalizationService' };
    },
    /** Returns effective owner limits. */
    policy: function () { return (CONFIG.get('product') || {}).publication || {}; },
    /** Admits only the authenticated publisher's Staged enterprise; never adds schema CRUD groups to that principal. */
    publisherScope: function (request) {
        const auth = request.authData || {}, security = SERVICE.DefaultSecuredRequestPipelineService;
        if (auth.principalType !== 'human' || !security?.getGrantedPermissions || !security.isPermissionGranted ||
            !security.isPermissionGranted('commerce.product.publish', security.getGrantedPermissions(request), {})) return undefined;
        const enterpriseCode = auth.enterpriseCode || auth.entCode;
        if (auth.tokenType !== 'access' || auth.principalType !== 'human' || auth.isSystem ||
            !(auth.principalId || auth.loginId || auth.code) || typeof auth.tenant !== 'string' || !auth.tenant ||
            request.tenant !== auth.tenant || typeof enterpriseCode !== 'string' || !enterpriseCode ||
            [auth.entCode, auth.enterpriseCode, request.enterpriseCode, request.entCode].some(value => value !== undefined && value !== enterpriseCode) ||
            CONFIG.get('runtimeRole')?.publication !== 'STAGED') throw new Error('Authenticated Product publisher scope is required');
        return { tenant: auth.tenant, enterpriseCode };
    },
    /** Uses canonical owner authority only for fixed generated graph reads and the membership-only seal write. */
    persistenceContext: function (request) {
        const scope = this.publisherScope(request);
        if (!scope) return { tenant: request.tenant, authData: request.authData };
        const owner = SERVICE.DefaultIdentityGovernanceService;
        if (!owner?.getSystemAuthData) throw new Error('Product publication persistence owner is unavailable');
        return { tenant: scope.tenant, authData: owner.getSystemAuthData() };
    },
    /** Binds neutral reads to a privately verified root and exact parent/reference membership. */
    publisherQuery: function (request, schema, query, token, reference) {
        const scope = this.publisherScope(request);
        if (!scope) return { ...query, tenant: request.tenant };
        if (schema === 'product') {
            if (typeof query.code !== 'string' || !query.code) throw new Error('Exact publisher Product is required');
            return { ...query, ...scope };
        }
        const membership = token && memberships.get(token);
        if (!membership || membership.request !== request ||
            (reference ? !membership.references?.has(this.referenceKey(reference)) : membership.references))
            throw new Error('Verified Product dependency membership is required');
        if (!reference) {
            const valid = ['productLocalization', 'productVariant'].includes(schema) ? query.productCode === membership.productCode :
                schema === 'productVariantLocalization' ? query.productCode === membership.productCode &&
                    Array.isArray(query.variantCode?.$in) && query.variantCode.$in.length > 0 &&
                    query.variantCode.$in.every(code => membership.variants.has(code)) :
                schema === 'category' ? membership.categories.has(query.code) :
                schema === 'categoryLocalization' && Array.isArray(query.categoryCode?.$in) && query.categoryCode.$in.length > 0 &&
                    query.categoryCode.$in.every(code => membership.categories.has(code));
            if (!valid) throw new Error('Product dependency query escaped verified membership');
        }
        return { ...query, tenant: scope.tenant,
            $or: [{ enterpriseCode: scope.enterpriseCode }, { enterpriseCode: { $exists: false } }] };
    },
    /** Independently rejects foreign scope and provider responses outside the verified root's closure. */
    assertPublisherRecord: function (request, row, schema, token) {
        const scope = this.publisherScope(request);
        if (!scope) return;
        if (row.tenant !== scope.tenant ||
            (row.enterpriseCode !== scope.enterpriseCode && (schema === 'product' || row.enterpriseCode !== undefined)))
            throw new Error('Product source escaped publisher enterprise');
        if (schema === 'product') return;
        const membership = token && memberships.get(token);
        const valid = membership?.request === request && (
            ['productLocalization', 'productVariant'].includes(schema) ? row.productCode === membership.productCode :
                schema === 'productVariantLocalization' ? row.productCode === membership.productCode && membership.variants.has(row.variantCode) :
                schema === 'category' ? membership.categories.has(row.code) :
                schema === 'categoryLocalization' && membership.categories.has(row.categoryCode));
        if (!valid) throw new Error('Product dependency response escaped verified membership');
    },
    /** Seals only captured membership through the existing versioned generated update, never arbitrary publisher fields. */
    sealRoot: function (request, productCode, versionId, references) {
        return SERVICE.DefaultProductService.update({ ...this.persistenceContext(request),
            query: { tenant: request.tenant, ...this.publisherScope(request), code: productCode, versionId },
            model: { publicationReferences: structuredClone(references) } });
    },
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
    read: async function (request, reference, membership) {
        const name = this.services()[reference.schema];
        if (!request.tenant || !name || !reference.code || !Number.isSafeInteger(reference.versionId) || reference.versionId < 0) {
            throw new Error('Exact Product source reference is required');
        }
        this.assertVersioned(request, reference.schema);
        const response = await SERVICE[name].get({ ...this.persistenceContext(request),
            query: this.publisherQuery(request, reference.schema, { code: reference.code, versionId: reference.versionId }, membership, reference),
            options: { recursive: false, skipItemCache: true },
            searchOptions: { limit: 2, pageSize: 2 } });
        const rows = response && response.result;
        if (!Array.isArray(rows) || rows.length !== 1 || (Number.isFinite(response.count) && response.count !== 1) || rows[0].tenant !== request.tenant ||
            rows[0].code !== reference.code || rows[0].versionId !== reference.versionId ||
            (reference.hash && reference.hash !== this.hash(rows[0]))) throw new Error('Product source version is missing or changed');
        this.assertPublisherRecord(request, rows[0], reference.schema, membership);
        return this.canonical(rows[0]);
    },
    /** Reads bounded current membership through the generated service, never raw history or caller-supplied rows. */
    current: async function (request, schema, query, membership) {
        this.assertVersioned(request, schema);
        const limit = this.policy().maximumDependencies;
        if (!Number.isSafeInteger(limit) || limit < 1) throw new Error('Product dependency bound is invalid');
        const response = await SERVICE[this.services()[schema]].get({ ...this.persistenceContext(request),
            query: this.publisherQuery(request, schema, query, membership),
            options: { recursive: false, skipItemCache: true }, searchOptions: { limit: limit + 1, pageSize: limit + 1 } });
        if (!response || !Array.isArray(response.result) || response.result.length > limit ||
            (Number.isFinite(response.count) && response.count > limit)) throw new Error('Product dependency capture is incomplete');
        const seen = new Set();
        return response.result.map(row => {
            if (row.tenant !== request.tenant || !row.code || seen.has(row.code) || !Number.isSafeInteger(row.versionId) || row.versionId < 0) {
                throw new Error('Product current dependency identity is invalid');
            }
            this.assertPublisherRecord(request, row, schema, membership);
            seen.add(row.code);
            return this.canonical(row);
        });
    },
    /** Captures exact membership for the next immutable root save; this read-only method does not activate or write sources. */
    captureReferences: async function (request, productCode, storeCode) {
        if (!productCode || !storeCode) throw new Error('Product and Store are required');
        const roots = await this.current(request, 'product', { code: productCode });
        if (roots.length !== 1 || roots[0].code !== productCode) throw new Error('Current Product is unavailable');
        const membership = membershipAuthority.rootMembership(request, roots[0]);
        const members = memberships.get(membership);
        const records = {};
        records.productLocalization = await this.current(request, 'productLocalization', { productCode: productCode, status: 'READY' }, membership);
        records.productVariant = await this.current(request, 'productVariant', { productCode: productCode, status: 'ACTIVE' }, membership);
        records.productVariant.forEach(row => members.variants.add(row.code));
        records.productVariantLocalization = records.productVariant.length ? await this.current(request, 'productVariantLocalization',
            { productCode: productCode, variantCode: { $in: records.productVariant.map(row => row.code) }, status: 'READY' }, membership) : [];
        records.category = [];
        const pending = new Set(records.productLocalization.flatMap(row => (row.classificationValues || {}).categoryCodes || []));
        pending.forEach(code => members.categories.add(code));
        for (const code of pending) {
            if (pending.size > this.policy().maximumDependencies) throw new Error('Product category dependency bound exceeded');
            const rows = await this.current(request, 'category', { code: code }, membership);
            if (rows.length !== 1 || rows[0].code !== code) throw new Error('Product category dependency is missing');
            records.category.push(rows[0]);
            if (rows[0].parentCode) { pending.add(rows[0].parentCode); members.categories.add(rows[0].parentCode); }
        }
        records.categoryLocalization = records.category.length ? await this.current(request, 'categoryLocalization',
            { categoryCode: { $in: records.category.map(row => row.code) }, status: 'READY' }, membership) : [];
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
        const membership = membershipAuthority.rootMembership(request, root, selection.records, this);
        const records = {}, references = [], seen = new Set();
        for (const reference of selection.records) {
            const key = JSON.stringify([reference.schema, reference.code]);
            if (reference.schema === 'product' || seen.has(key) || !/^[a-f0-9]{64}$/.test(reference.hash || '')) {
                throw new Error('Duplicate or invalid Product dependency reference');
            }
            seen.add(key);
            const record = await this.read(request, reference, membership);
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
