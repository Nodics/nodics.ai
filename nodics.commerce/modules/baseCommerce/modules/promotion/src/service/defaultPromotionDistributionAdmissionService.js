/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
const { isDeepStrictEqual } = require('node:util');
const admissions = new WeakMap(), intents = new WeakMap();

/** @module promotion/service/defaultPromotionDistributionAdmissionService @description Admits only exact in-flight Product supply reads from governed public catalogue visibility or preserved signed customer authority; verifies installed consent/private persistence without manufacturing qualification. @layer service @owner promotion @override Narrow exported admission and readiness members in later layers; preserve original identities, exact Product scope, private identity, fresh owner checks and non-mutating dispatch. */
module.exports = {
    /** Refuses without disclosing credentials, private receipt evidence or provider diagnostics. @returns {never} Typed refusal. */
    fail: function () { throw new CLASSES.NodicsError('ERR_PROMOTION_SELLER_UNCONFIRMED'); },
    /** Checks canonical bounded identifiers used by existing persistence selectors. @param {*} value Candidate. @returns {boolean} Valid identifier. */
    identifier: function (value) { return typeof value === 'string' && /^[A-Za-z0-9_.:-]{1,128}$/.test(value); },
    /** Keeps unselected defaults inert; selection still requires the existing independent qualification policy. @param {Object} request Store scope. @returns {boolean} Selected consent-backed delivery. */
    selected: function (request) {
        const publication = SERVICE.DefaultPromotionPublicationService;
        if (CONFIG.get('promotion')?.publication?.delivery?.enabled === true && !publication?.deliveryEnabled) this.fail();
        if (!publication?.deliveryEnabled?.(request)) return false;
        const seller = SERVICE.DefaultCouponSellerAuthorizationService;
        if (!seller?.policy) this.fail();
        return seller.policy() !== undefined;
    },
    /** Detaches only authority and bounded read inputs, never cloning routed transports or admitting payload flags. @param {Object} request Original request. @returns {Object} Stable inputs. */
    detached: function (request) {
        if (!request || !this.identifier(request.tenant) || !this.identifier(request.storeCode) ||
            !this.identifier(request.productCode)) this.fail();
        const result = { tenant: request.tenant, storeCode: request.storeCode, productCode: request.productCode,
            authData: structuredClone(request.authData || {}) };
        for (const key of ['enterpriseCode', 'entCode', 'locale', 'quantity', 'ownerId'])
            if (request[key] !== undefined) result[key] = structuredClone(request[key]);
        if (result.authData.tenant !== undefined && result.authData.tenant !== result.tenant ||
            [request.tenantCode, result.authData.tenantCode].some(value => value !== undefined && value !== result.tenant)) this.fail();
        return result;
    },
    /** Requires real installed consent CAS, private coupon hooks/indexes, privacy capture and transaction topology; no caller or source flag substitutes for these owners. @param {Object} request Tenant scope. @returns {Promise<boolean>} Checked installed source prerequisites only. */
    assertInstalled: async function (request) {
        try {
            const r = { tenant: request.tenant }, seller = SERVICE.DefaultCouponSellerAuthorizationService;
            if (!this.identifier(r.tenant) || !seller?.policy?.() ||
                !SERVICE.DefaultPromotionOperationService?.requireOperationalRuntime ||
                !SERVICE.DefaultCouponSecureIssuanceService?.persistence ||
                !SERVICE.DefaultCouponSecureIssuanceService.privateOperation ||
                SERVICE.DefaultLoggerService?.isRequestPrivacyQualified?.() !== true ||
                typeof SERVICE.DefaultLoggerService.runSensitiveOperation !== 'function' ||
                typeof SERVICE.DefaultLoggerService.hasPrivateCaptureProtection !== 'function' ||
                typeof SERVICE.DefaultDatabaseConfigurationService?.getSchemaInterceptors !== 'function' ||
                typeof SERVICE.DefaultDatabaseModelHandlerService?.inspectIndexes !== 'function' ||
                typeof SERVICE.DefaultModelConcurrencyService?.getField !== 'function' ||
                !SERVICE.DefaultPromotionService?.get || !SERVICE.DefaultPromotionService.update) this.fail();
            SERVICE.DefaultPromotionOperationService.requireOperationalRuntime();
            for (const member of ['protect', 'protectRemove', 'protectCoupon', 'isSellerConsentWrite', 'authorizePolicyRead'])
                if (typeof seller[member] !== 'function') this.fail();
            const model = (NODICS.getModels('promotion', r.tenant) || {})[UTILS.createModelName('promotion')];
            const schema = model?.rawSchema;
            if (!model || model.versioned === true || model.primaryKey !== 'code' ||
                typeof model.compareAndSetItem !== 'function' || schema?.definition?.sellerAuthorizations?.type !== 'array' ||
                schema.definition.revision?.type !== 'int' || schema.transaction?.enabled !== true ||
                schema.transaction.sideEffects !== 'none' || schema.cache?.enabled !== false ||
                schema.event?.enabled !== false || schema.search?.enabled !== false ||
                SERVICE.DefaultModelConcurrencyService.getField(schema)) this.fail();
            const hooks = SERVICE.DefaultDatabaseConfigurationService.getSchemaInterceptors('promotion');
            for (const [trigger, member] of Object.entries({ preSave: 'protect', preUpdate: 'protect', preRemove: 'protectRemove' }))
                if (!hooks?.[trigger]?.some(item => [true, 'true'].includes(item.active) &&
                    item.handler === 'DefaultCouponSellerAuthorizationService.' + member)) this.fail();
            const couponHooks = SERVICE.DefaultDatabaseConfigurationService.getSchemaInterceptors('coupon');
            for (const trigger of ['preSave', 'preUpdate', 'preRemove'])
                if (!couponHooks?.[trigger]?.some(item => [true, 'true'].includes(item.active) &&
                    item.handler === 'DefaultCouponSellerAuthorizationService.protectCoupon')) this.fail();
            const evidence = await SERVICE.DefaultDatabaseModelHandlerService.inspectIndexes(model);
            if (evidence?.versioned !== false || !Array.isArray(evidence.indexes) || !evidence.indexes.some(index =>
                index.unique === true && !index.sparse && !index.partialFilterExpression &&
                (!index.collation || index.collation.locale === 'simple') && index.key?.code === 1 &&
                Object.keys(index.key).length >= 1 && Object.keys(index.key).every(key => ['code', 'tenant'].includes(key)) &&
                Object.values(index.key).every(value => value === 1))) this.fail();
            await SERVICE.DefaultCouponSecureIssuanceService.persistence(r);
            return true;
        } catch (_) { this.fail(); }
    },
    /** Resolves only an unchanged live owner envelope. Copies, flags and retained envelopes grant nothing. The returned context remains privately registered for nested owner calls. @param {Object} request Exact owner request. @returns {Object|undefined} Original signed or catalogue-only context. */
    resolveReadContext: function (request) {
        const expected = admissions.get(request);
        if (!expected) return undefined;
        if (!isDeepStrictEqual(request, expected.snapshots.get(request))) this.fail();
        if (!isDeepStrictEqual(expected.context, expected.snapshots.get(expected.context))) this.fail();
        expected.resolved = true;
        return expected.context;
    },
    /** Recognizes only exact live Product batch identities after fresh Profile preflight. Copies, standalone reads, changed scope and caller flags never consolidate reference checks. @param {Object} request Exact nested Product context. @param {Array<string>} codes Receipt-derived issuer and seller. @returns {boolean} Private reference phase only, never policy or mutation authority. */
    referenceReadAdmitted: function (request, codes) {
        const expected = admissions.get(request);
        if (!expected?.batch) return false;
        this.resolveReadContext(request);
        const batch = expected.batch;
        if (batch.phase !== 'READ' || !isDeepStrictEqual(batch.original, batch.snapshot) ||
            !Array.isArray(codes) || codes.length !== 2 ||
            codes.some(code => !expected.references.has(code) || !batch.references.has(code))) this.fail();
        return true;
    },
    /** Restricts private admission to the original Product read, never root enumeration, coupon inspection, budget reads or mutation. Unadmitted callers retain their existing signed authority checks. @param {Object} request Exact owner request. @param {string} purpose Owner operation. @param {string} productCode Original Product for PRODUCT reads. @returns {boolean} Admission or unchanged legacy path. */
    assertReadPurpose: function (request, purpose, productCode) {
        const expected = admissions.get(request);
        if (!expected) return true;
        this.resolveReadContext(request);
        if (purpose !== 'PRODUCT' || productCode !== expected.productCode) this.fail();
        return true;
    },
    /** Fences retained policy results to the original Product even after metadata candidate narrowing. @param {Object} request Exact nested context. @param {Object} policy Owner-loaded immutable policy. @returns {boolean} Exact Product policy. */
    assertProductPolicy: function (request, policy) {
        const expected = admissions.get(request);
        if (!expected) return true;
        this.resolveReadContext(request);
        if (policy?.conditions?.sourceProductCode !== expected.productCode) this.fail();
        return true;
    },
    /** Reads public Product identity through the existing pinned activation and retained projection owners, not caller-provided projection/policy/index configuration. @param {Object} request Detached public selector. @returns {Promise<Object>} Current exact retained projection. */
    visibleProduct: async function (request) {
        const discovery = SERVICE.DefaultProductDiscoveryService, enrichment = SERVICE.DefaultProductSearchEnrichmentService;
        if (!discovery?.activeSelection || !discovery.searchPinned || !discovery.query || !enrichment?.retainedProjections ||
            typeof request.locale !== 'string' || !/^[A-Za-z0-9_-]{1,35}$/.test(request.locale)) this.fail();
        const r = { tenant: request.tenant, storeCode: request.storeCode, locale: request.locale,
            productCode: request.productCode, authData: structuredClone(request.authData) };
        const versions = await discovery.activeSelection(r);
        if (!Array.isArray(versions) || !versions.length || versions.length > 1000 ||
            new Set(versions).size !== versions.length || versions.some(version => !/^[a-f0-9]{64}$/.test(version))) this.fail();
        const indexed = await discovery.searchPinned(r, discovery.query(r), { pageSize: 2, limit: 2, pageNumber: 1 });
        if (!Array.isArray(indexed) || indexed.length !== 1) this.fail();
        const rows = await enrichment.retainedProjections(r, indexed);
        const row = Array.isArray(rows) && rows.length === 1 ? rows[0] : undefined;
        const attributes = row?.payload?.localizedAttributes, variants = row?.payload?.variantCodes, map = row?.payload?.variantSkuMap;
        if (!row || !this.identifier(row.code) || !this.identifier(row.enterpriseCode) || row.status !== 'STALE' ||
            !versions.includes(row.publicationVersion) || !/^[a-f0-9]{64}$/.test(row.sourceHash || '') ||
            ['tenant', 'storeCode', 'locale', 'productCode'].some(key => row[key] !== r[key]) ||
            attributes?.productType !== 'DIGITAL' || attributes.digitalDeliveryType !== 'COUPON_CODE' ||
            attributes.inventoryStrategy !== 'COUPON_CODE_POOL' || !Array.isArray(variants) || !variants.length ||
            variants.length > 1000 || !variants.some(code => this.identifier(code) && this.identifier(map?.[code]))) this.fail();
        for (const value of [request.enterpriseCode, request.entCode, request.authData.enterpriseCode, request.authData.entCode])
            if (value !== undefined && value !== row.enterpriseCode) this.fail();
        return structuredClone(row);
    },
    /** Dispatches only fixed non-reserving supply work under a short-lived private identity; owner integration must actually resolve the admission. @param {Object} request Detached exact supply request. @param {Object} context Detached original-authority context. @returns {Promise<Object>} Existing internal pool summary. */
    dispatchAvailability: async function (request, context) {
        const owner = SERVICE.DefaultPromotionOperationService;
        if (!owner?.couponPoolAvailability || !SERVICE.DefaultPromotionSellerPolicyService?.readProduct) this.fail();
        const intent = intents.get(request);
        if (!intent || intent.context !== context || !isDeepStrictEqual(request, intent.request) ||
            !isDeepStrictEqual(context, intent.snapshot)) this.fail();
        if (intent.batch && !isDeepStrictEqual(intent.batch.original, intent.batch.snapshot)) this.fail();
        const expected = { context, productCode: request.productCode, resolved: false, batch: intent.batch,
            references: intent.references,
            snapshots: new WeakMap([[request, structuredClone(request)], [context, structuredClone(context)]]) };
        admissions.set(request, expected); admissions.set(context, expected);
        try {
            const result = await owner.couponPoolAvailability(request);
            if (!expected.resolved) this.fail();
            this.resolveReadContext(request);
            if (!result || typeof result.available !== 'boolean' || result.error ||
                result.success === false || result.acknowledged === false ||
                result.code !== undefined && !/^SUC_/.test(result.code) ||
                result.errors !== undefined && (!Array.isArray(result.errors) || result.errors.length)) this.fail();
            const safe = {};
            for (const key of ['available', 'availableQuantity', 'issuedQuantity', 'inventoryStrategy', 'strategy',
                'reservableAt', 'guaranteed', 'batchCode', 'couponBatchCode', 'promotionCode'])
                if (Object.hasOwn(result, key)) safe[key] = structuredClone(result[key]);
            this.resolveReadContext(request);
            if (intent.batch && !isDeepStrictEqual(intent.batch.original, intent.batch.snapshot)) this.fail();
            return safe;
        } finally { admissions.delete(request); admissions.delete(context); }
    },
    /** Validates original public authority independently of catalogue enterprise scope; this helper mints no admission. @param {Object} request Public Product selector. @returns {Object|undefined} Detached selected quantity-one read. */
    publicRequest: function (request) {
        const r = this.detached(request);
        if (!this.selected(r)) return undefined;
        const auth = r.authData;
        if (auth.isSystem === true || auth.principalType !== undefined && !['human', 'customer', 'anonymous'].includes(auth.principalType) ||
            auth.tokenType !== undefined && auth.tokenType !== 'access' || r.quantity !== undefined && r.quantity !== '1' && r.quantity !== 1) this.fail();
        return r;
    },
    /** Consolidates only fresh enterprise reference checks inside one bounded browsing call. Product visibility, installed guards and every receipt/policy/consent/benefit/unit check remain canonical; no caller rows or approval cache are accepted. @param {Object} request Original tenant/Store/locale and access context. @param {Array<string>} productCodes Distinct Product selectors. @returns {Promise<Map>} Customer-safe summaries, with undefined entries only for unselected delivery. */
    publicAvailabilityBatch: async function (request, productCodes) {
        if (!Array.isArray(productCodes) || !productCodes.length || productCodes.length > 1000 ||
            productCodes.some(code => !this.identifier(code)) || new Set(productCodes).size !== productCodes.length) this.fail();
        productCodes = [...productCodes];
        const batch = { original: request, snapshot: structuredClone(request), phase: 'PREPARE', references: new Set() };
        const entries = [], result = new Map();
        try {
            for (const productCode of productCodes) {
                const r = this.publicRequest({ ...request, productCode });
                if (!r) { result.set(productCode, undefined); continue; }
                await this.assertInstalled(r);
                const projection = await this.visibleProduct(r);
                const context = { tenant: r.tenant, enterpriseCode: projection.enterpriseCode, storeCode: r.storeCode,
                    authData: structuredClone(r.authData) };
                const command = { ...context, productCode, quantity: '1', authData: structuredClone(r.authData) };
                const references = new Set();
                intents.set(command, { context, request: structuredClone(command), snapshot: structuredClone(context), batch, references });
                const entry = { r, projection, context, command, references };
                entries.push(entry);
                const policy = SERVICE.DefaultPromotionSellerPolicyService;
                if (typeof policy?.productBindings !== 'function') this.fail();
                const intent = intents.get(command);
                if (!intent || intent.context !== context || !isDeepStrictEqual(command, intent.request) ||
                    !isDeepStrictEqual(context, intent.snapshot) || !isDeepStrictEqual(batch.original, batch.snapshot)) this.fail();
                const expected = { context, productCode, resolved: false, batch, references,
                    snapshots: new WeakMap([[command, structuredClone(command)], [context, structuredClone(context)]]) };
                admissions.set(command, expected); admissions.set(context, expected);
                let resolved;
                try {
                    resolved = await policy.productBindings(command, productCode);
                    this.resolveReadContext(command);
                    if (!isDeepStrictEqual(batch.original, batch.snapshot)) this.fail();
                } finally { admissions.delete(command); admissions.delete(context); }
                if (!resolved || resolved.context !== context || !Array.isArray(resolved.bindings) || resolved.bindings.length > 1000) this.fail();
                for (const binding of resolved.bindings) {
                    if (binding.tenant !== r.tenant || binding.storeCode !== r.storeCode ||
                        binding.sellerEnterpriseCode !== context.enterpriseCode || !this.identifier(binding.issuerEnterpriseCode)) this.fail();
                    references.add(binding.issuerEnterpriseCode); references.add(context.enterpriseCode);
                }
                for (const code of references) batch.references.add(code);
            }
            const seller = SERVICE.DefaultCouponSellerAuthorizationService;
            if (batch.references.size) await seller.activeEnterprises(request, [...batch.references]);
            if (!isDeepStrictEqual(request, batch.snapshot)) this.fail();
            batch.phase = 'READ';
            for (const entry of entries) {
                const supply = await this.dispatchAvailability(entry.command, entry.context);
                result.set(entry.r.productCode, { available: supply.available, status: supply.available ? 'IN_STOCK' : 'OUT_OF_STOCK' });
            }
            batch.phase = 'VERIFY';
            for (const entry of entries) {
                if (!isDeepStrictEqual(await this.visibleProduct(entry.r), entry.projection)) this.fail();
                await this.assertInstalled(entry.r);
            }
            if (batch.references.size) await seller.activeEnterprises(request, [...batch.references]);
            if (!isDeepStrictEqual(request, batch.snapshot)) this.fail();
            return result;
        } finally {
            batch.phase = 'CLOSED';
            for (const entry of entries) intents.delete(entry.command);
        }
    },
    /** Admits anonymous catalogue visibility only for one Product and returns only a boolean/status summary. Never grants campaign, coupon, budget or purchase authority. @param {Object} request Public Product selector with untouched original auth. @returns {Promise<Object|undefined>} Customer-safe supply or inert unselected result. */
    publicAvailability: async function (request) {
        const r = this.publicRequest(request);
        if (!r) return undefined;
        const auth = r.authData;
        await this.assertInstalled(r);
        const projection = await this.visibleProduct(r);
        const context = { tenant: r.tenant, enterpriseCode: projection.enterpriseCode, storeCode: r.storeCode,
            authData: structuredClone(auth) };
        const command = { ...context, productCode: r.productCode, quantity: '1', authData: structuredClone(auth) };
        intents.set(command, { context, request: structuredClone(command), snapshot: structuredClone(context) });
        let result;
        try { result = await this.dispatchAvailability(command, context); }
        finally { intents.delete(command); }
        if (!isDeepStrictEqual(await this.visibleProduct(r), projection)) this.fail();
        await this.assertInstalled(r);
        return { available: result.available, status: result.available ? 'IN_STOCK' : 'OUT_OF_STOCK' };
    },
    /** Preserves original signed human/customer authority across a derived service handoff. A service identity, body flag or self-supplied origin field alone cannot invoke this path. @param {Object} original Original signed owner request, not downstream payload data. @param {Object} downstream Derived service request for one Product. @returns {Promise<Object|undefined>} Existing internal pool summary or inert unselected result. */
    trustedAvailability: async function (original, downstream) {
        const r = this.detached(downstream);
        if (!this.selected(r)) return undefined;
        const source = SERVICE.DefaultCouponSellerAuthorizationService.sellerReadContext(original);
        if (source.tenant !== r.tenant || source.storeCode !== r.storeCode ||
            r.authData.principalType !== 'service' || r.authData.tenant !== source.tenant ||
            [r.enterpriseCode, r.entCode, r.authData.enterpriseCode, r.authData.entCode].some(value =>
                value !== undefined && value !== source.enterpriseCode) ||
            ![r.authData.enterpriseCode, r.authData.entCode].includes(source.enterpriseCode) ||
            !Number.isSafeInteger(Number(r.quantity)) || Number(r.quantity) < 1 || Number(r.quantity) > 1000) this.fail();
        await this.assertInstalled(source);
        const context = structuredClone(source);
        const command = { tenant: r.tenant, enterpriseCode: source.enterpriseCode, storeCode: source.storeCode,
            productCode: r.productCode, quantity: r.quantity, authData: structuredClone(r.authData) };
        intents.set(command, { context, request: structuredClone(command), snapshot: structuredClone(context) });
        let result;
        try { result = await this.dispatchAvailability(command, context); }
        finally { intents.delete(command); }
        await this.assertInstalled(source);
        return result;
    },
};
