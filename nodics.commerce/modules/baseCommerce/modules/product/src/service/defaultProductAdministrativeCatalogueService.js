/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
const { isDeepStrictEqual } = require('node:util');
/** @module product/service/defaultProductAdministrativeCatalogueService
 * @description Bounded new coupon catalogue source authoring and exact readback, separate from ordinary roots and intent-bound asset listings.
 * @layer service @owner product @override Preserve native admission, schema qualification, binding checks and no-retry partial outcomes.
 */
module.exports = {
    /** Uses the existing stable owner input/storage errors. */
    fail: function (code = 'INPUT') {
        SERVICE.DefaultProductBusinessAuthoringService.fail(code);
    },
    /** Resolves only the four fixed Product source owners with CURRENT versioned ports. */
    storage: function (context) {
        const scope = context.scope(),
            names = ['product', 'productVariant', 'productLocalization', 'productVariantLocalization'];
        const result = {};
        for (const name of names) {
            const title = name[0].toUpperCase() + name.slice(1),
                schema = NODICS.getModule('product')?.rawSchema?.[name];
            const model = NODICS.getModels('product', scope.tenant)?.[title + 'Model'],
                service = SERVICE['Default' + title + 'Service'];
            if (
                !schema ||
                !model ||
                model.versioned !== true ||
                model.primaryKey !== 'code' ||
                model.rawSchema?.versionedReadMode !== 'CURRENT' ||
                typeof model.getCurrentVersionItems !== 'function' ||
                typeof model.saveVersionedItems !== 'function' ||
                SERVICE.DefaultModelsGetInitializerService.resolveReadMethod({ schemaModel: model, query: {} }) !==
                    'getCurrentVersionItems' ||
                SERVICE.DefaultModelSaveInitializerService.resolveSaveMethod({ schemaModel: model }) !==
                    'saveVersionedItems' ||
                typeof service?.get !== 'function' ||
                typeof service?.save !== 'function' ||
                !SERVICE.DefaultSchemaAuthoringPolicyService.describe(schema).authoringAllowed ||
                CONFIG.get('runtimeRole')?.publication !== 'STAGED'
            )
                this.fail('STORAGE');
            result[name] = {
                schema,
                model,
                service,
                get: service.get,
                save: service.save,
                read: model.getCurrentVersionItems,
                insert: model.saveVersionedItems,
            };
        }
        return result;
    },
    /** Checks configured bounds and JSON shape before cloning or any persistence. */
    bounded: function (value, policy) {
        if (
            !policy ||
            !Number.isSafeInteger(policy.maximumGraphRecords) ||
            policy.maximumGraphRecords < 1 ||
            policy.maximumGraphRecords > 1000 ||
            !Number.isSafeInteger(policy.maximumGraphBytes) ||
            policy.maximumGraphBytes < 1 ||
            policy.maximumGraphBytes > 1048576 ||
            !Number.isSafeInteger(policy.maximumDepth) ||
            policy.maximumDepth < 1 ||
            policy.maximumDepth > 32
        )
            this.fail('STORAGE');
        let nodes = 0;
        const visit = (x, depth) => {
            if (depth > policy.maximumDepth || ++nodes > policy.maximumGraphBytes) this.fail();
            if (
                x === null ||
                typeof x === 'boolean' ||
                typeof x === 'string' ||
                (typeof x === 'number' && Number.isFinite(x))
            )
                return;
            if (!x || typeof x !== 'object' || (!Array.isArray(x) && Object.getPrototypeOf(x) !== Object.prototype))
                this.fail();
            for (const key of Reflect.ownKeys(x)) {
                if (Array.isArray(x) && key === 'length') continue;
                const d = Object.getOwnPropertyDescriptor(x, key);
                if (
                    typeof key !== 'string' ||
                    key.startsWith('$') ||
                    key.includes('.') ||
                    ['__proto__', 'constructor', 'prototype'].includes(key) ||
                    !d?.enumerable ||
                    !Object.hasOwn(d, 'value')
                )
                    this.fail();
                visit(d.value, depth + 1);
            }
        };
        visit(value, 0);
        if (Buffer.byteLength(JSON.stringify(value)) > policy.maximumGraphBytes) this.fail();
    },
    /** Catalogue metadata cannot carry evidence owned by listing, publication or asset workflows, at any nesting level. */
    content: function (value) {
        if (!value || typeof value !== 'object') return;
        for (const [key, child] of Object.entries(value)) {
            if (
                [
                    'sourceRef',
                    'ownerRef',
                    'bundleRef',
                    'listingAuthoring',
                    'publicationReferences',
                    'digitalBinding',
                    'commerceBidding',
                    'validityDays',
                ].includes(key)
            )
                this.fail();
            this.content(child);
        }
    },
    /** Creates a fully validated, detached, fixed-owner graph; caller scope, seals and listing proofs are forbidden. */
    graph: function (context, storage, partial = false) {
        const owner = SERVICE.DefaultProductBusinessAuthoringService,
            command = context.input.command,
            p = context.policy;
        this.bounded(command, p);
        owner.object(command, ['product', 'variants', 'localizations', 'variantLocalizations']);
        const groups = {
            product: [command.product],
            productVariant: command.variants,
            productLocalization: command.localizations,
            productVariantLocalization: command.variantLocalizations,
        };
        if (
            Object.values(groups).some((a) => !Array.isArray(a)) ||
            (!partial && (!groups.productVariant.length || !groups.productLocalization.length)) ||
            Object.values(groups).reduce((n, a) => n + a.length, 0) > p.maximumGraphRecords
        )
            this.fail();
        const entries = [];
        for (const [schemaName, records] of Object.entries(groups)) {
            const allowed = p.graphFields?.[schemaName],
                definition = storage[schemaName].schema.definition;
            if (
                !Array.isArray(allowed) ||
                !allowed.length ||
                allowed.some((k) =>
                    [
                        'tenant',
                        'enterpriseCode',
                        'active',
                        'revision',
                        'versionId',
                        'createdBy',
                        'updatedBy',
                        'accessGroups',
                        'publicationReferences',
                        'listingAuthoring',
                        'digitalBinding',
                        '_id',
                    ].includes(k),
                )
            )
                this.fail('STORAGE');
            const codes = new Set();
            for (const row of records) {
                owner.object(row, allowed);
                owner.code(row.code);
                if (codes.has(row.code)) this.fail();
                codes.add(row.code);
                this.content(row);
                for (const key of allowed) {
                    const field = definition[key],
                        value = row[key];
                    if (!field) this.fail('STORAGE');
                    if (field.required && value === undefined) this.fail();
                    if (value === undefined) continue;
                    if (
                        (field.type === 'string' &&
                            (typeof value !== 'string' || !value.trim() || value.length > p.maximumGraphBytes)) ||
                        (field.type === 'object' && (!value || Object.getPrototypeOf(value) !== Object.prototype)) ||
                        (field.enum && !field.enum.includes(value))
                    )
                        this.fail();
                }
                // These are new coupon catalogue records, never an asset/bundle intent-proof writer.
                const attrs = row.attributes || {};
                if (
                    schemaName === 'productVariant' &&
                    (!row.attributes || Object.getPrototypeOf(row.attributes) !== Object.prototype)
                )
                    this.fail();
                if (
                    [
                        'sourceRef',
                        'ownerRef',
                        'bundleRef',
                        'listingAuthoring',
                        'publicationReferences',
                        'digitalBinding',
                        'commerceBidding',
                        'validityDays',
                    ].some((k) => Object.hasOwn(attrs, k)) ||
                    attrs.assetCode != null ||
                    (attrs.kind !== undefined && attrs.kind !== 'COUPON')
                )
                    this.fail();
                if (schemaName === 'product' || schemaName === 'productVariant') {
                    if (
                        row.productType !== 'DIGITAL' ||
                        row.fulfillmentStrategy !== 'DIGITAL_COMMERCE' ||
                        row.digitalDeliveryType !== 'COUPON_CODE' ||
                        row.status !== 'ACTIVE'
                    )
                        this.fail();
                } else if (row.status !== 'READY') this.fail();
                entries.push({ schemaName, model: structuredClone(row) });
            }
        }
        const root = command.product,
            variants = command.variants,
            locals = command.localizations;
        owner.code(root.catalogVersion);
        if (
            entries.some((e) => e.schemaName !== 'product' && e.model.productCode !== root.code) ||
            new Set(variants.map((v) => v.sku)).size !== variants.length ||
            new Set(locals.map((l) => l.locale)).size !== locals.length ||
            new Set(command.variantLocalizations.map((l) => l.variantCode + ':' + l.locale)).size !==
                command.variantLocalizations.length
        )
            this.fail();
        for (const v of variants) {
            owner.code(v.sku);
            owner.code(v.attributes.promotionCode);
            owner.code(v.attributes.couponBatchCode);
            if (
                v.attributes.kind !== 'COUPON' ||
                v.attributes.productType !== 'DIGITAL' ||
                v.attributes.fulfillmentStrategy !== 'DIGITAL_COMMERCE' ||
                v.attributes.digitalDeliveryType !== 'COUPON_CODE' ||
                v.attributes.inventoryStrategy !== 'COUPON_CODE_POOL'
            )
                this.fail();
        }
        for (const l of [...locals, ...command.variantLocalizations]) {
            if (
                typeof l.locale !== 'string' ||
                !/^[A-Za-z][A-Za-z0-9_-]{0,31}$/.test(l.locale) ||
                (l.variantCode !== undefined &&
                    (!variants.some((v) => v.code === l.variantCode) || !locals.some((x) => x.locale === l.locale)))
            )
                this.fail();
        }
        if (!partial)
            for (const v of variants)
                for (const l of locals)
                    if (!command.variantLocalizations.some((x) => x.variantCode === v.code && x.locale === l.locale))
                        this.fail();
        return entries;
    },
    /** Reads and creates only inside the fresh native-owner call; failures leave explicit partial source, never retry/adopt/delete. */
    execute: async function (request, operation) {
        if (!['graphCreate', 'graphRead', 'graphContinue'].includes(operation)) this.fail();
        const context = await SERVICE.DefaultProductAdministrativeAuthoringService.context(request, operation);
        const owner = SERVICE.DefaultProductBusinessAuthoringService,
            scope = context.scope(),
            storage = this.storage(context),
            snapshot = Object.fromEntries(Object.entries(storage).map(([k, v]) => [k, structuredClone(v.schema)])),
            role = structuredClone(CONFIG.get('runtimeRole'));
        const check = () => {
            context.bound();
            if (!isDeepStrictEqual(CONFIG.get('runtimeRole'), role)) this.fail('STORAGE');
            const fresh = this.storage(context);
            for (const name of Object.keys(storage))
                if (
                    !isDeepStrictEqual(storage[name].schema, snapshot[name]) ||
                    Object.keys(storage[name]).some((k) => storage[name][k] !== fresh[name][k])
                )
                    this.fail('STORAGE');
        };
        const local = () => {
            check();
            return {
                tenant: scope.tenant,
                authData: SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
                options: { recursive: false, skipItemCache: true },
            };
        };
        const read = async (name, query, maximum) => {
            const result = await storage[name].service.get({
                ...local(),
                query: { tenant: scope.tenant, ...query },
                searchOptions: { pageSize: maximum + 1, pageNumber: 1 },
            });
            check();
            const rows = owner.envelope(result, 'SUC_FIND_00000');
            if (
                !Array.isArray(rows) ||
                rows.length > maximum ||
                result.count !== rows.length ||
                new Set(rows.map((r) => r.code)).size !== rows.length ||
                rows.some(
                    (r) =>
                        r.tenant !== scope.tenant ||
                        r.enterpriseCode !== scope.enterpriseCode ||
                        Object.entries(query).some(([k, v]) => !isDeepStrictEqual(r[k], v)) ||
                        !Number.isSafeInteger(r.versionId) ||
                        r.versionId < 0 ||
                        !Number.isSafeInteger(r.revision) ||
                        r.revision < 0,
                )
            )
                this.fail('CONFLICT');
            return structuredClone(rows);
        };
        if (context.operation === 'graphRead') {
            owner.object(context.input.command, ['productCode']);
            const code = owner.code(context.input.command.productCode),
                p = context.policy;
            this.bounded(context.input.command, p);
            const roots = await read('product', { code }, 1);
            if (!roots.length) this.fail('MISSING');
            const result = {
                product: roots[0],
                variants: await read('productVariant', { productCode: code }, p.maximumGraphRecords),
                localizations: await read('productLocalization', { productCode: code }, p.maximumGraphRecords),
                variantLocalizations: await read(
                    'productVariantLocalization',
                    { productCode: code },
                    p.maximumGraphRecords,
                ),
            };
            if (
                1 + result.variants.length + result.localizations.length + result.variantLocalizations.length >
                p.maximumGraphRecords
            )
                this.fail('CONFLICT');
            if (
                [result.product, ...result.variants, ...result.localizations, ...result.variantLocalizations].some(
                    (row) => row.listingAuthoring !== undefined || row.digitalBinding !== undefined,
                )
            )
                this.fail('CONFLICT');
            // Readback is safe source content, not publication/listing proofs or private database metadata.
            const project = (name, row) =>
                Object.fromEntries(
                    [...p.graphFields[name], 'versionId', 'revision', 'createdBy', 'updatedBy']
                        .filter((k) => row[k] !== undefined)
                        .map((k) => [k, row[k]]),
                );
            const projected = {
                product: project('product', result.product),
                variants: result.variants.map((r) => project('productVariant', r)),
                localizations: result.localizations.map((r) => project('productLocalization', r)),
                variantLocalizations: result.variantLocalizations.map((r) => project('productVariantLocalization', r)),
            };
            const content = Object.fromEntries(
                Object.entries(projected).map(([key, value]) => [
                    key,
                    Array.isArray(value) ? value.map(stripAudit) : stripAudit(value),
                ]),
            );
            function stripAudit(row) {
                const { versionId, revision, createdBy, updatedBy, ...fields } = row;
                return fields;
            }
            this.graph({ ...context, input: { command: content } }, storage, true);
            this.bounded(projected, p);
            await context.revalidate();
            check();
            return projected;
        }
        const continuing = operation === 'graphContinue';
        let graphContext = context,
            confirmed = [],
            reason;
        if (continuing) {
            owner.object(context.input.command, ['graph', 'confirmedRecords', 'reason']);
            const command = context.input.command;
            if (
                typeof command.reason !== 'string' ||
                !command.reason.trim() ||
                command.reason.length > 500 ||
                /[\u0000-\u001f\u007f]/.test(command.reason) ||
                !Array.isArray(command.confirmedRecords) ||
                !command.confirmedRecords.length ||
                command.confirmedRecords.length > context.policy.maximumGraphRecords
            )
                this.fail();
            confirmed = structuredClone(command.confirmedRecords);
            reason = command.reason;
            graphContext = { ...context, input: { command: command.graph } };
        }
        const entries = this.graph(graphContext, storage);
        const identity = (e) => ({ schemaName: e.schemaName, code: e.model.code, versionId: 0, revision: 0 });
        const key = (e) => e.schemaName + ':' + (e.model?.code ?? e.code);
        const expected = (e) => ({
            ...structuredClone(e.model),
            tenant: scope.tenant,
            enterpriseCode: scope.enterpriseCode,
            active: true,
            versionId: 0,
            revision: 0,
            createdBy: scope.principal,
            updatedBy: scope.principal,
        });
        const retained = new Map();
        for (const pin of confirmed) {
            owner.object(pin, ['schemaName', 'code', 'versionId', 'revision']);
            const entry = entries.find((e) => key(e) === key(pin));
            if (!entry || !isDeepStrictEqual(pin, identity(entry)) || retained.has(key(pin))) this.fail('CONFLICT');
            retained.set(key(pin), pin);
        }
        if (continuing && !retained.has(key(entries[0]))) this.fail('CONFLICT');
        const matches = (entry, row) => {
            if (
                row.listingAuthoring !== undefined ||
                row.publicationReferences !== undefined ||
                row.digitalBinding !== undefined ||
                Object.entries(expected(entry)).some(([k, v]) => !isDeepStrictEqual(row[k], v)) ||
                context.policy.graphFields[entry.schemaName].some((k) => !isDeepStrictEqual(row[k], entry.model[k]))
            )
                this.fail('CONFLICT');
        };
        const alternatives = (e) => {
            const queries = [{ code: e.model.code }];
            if (e.schemaName === 'productVariant') queries.push({ sku: e.model.sku });
            if (e.schemaName.includes('Localization'))
                queries.push({
                    productCode: e.model.productCode,
                    locale: e.model.locale,
                    ...(e.model.variantCode ? { variantCode: e.model.variantCode } : {}),
                });
            return queries;
        };
        // Re-read the entire planned graph and semantic collisions, including unexpected children, before every dispatch.
        const inspect = async () => {
            for (const entry of entries) {
                for (const query of alternatives(entry)) {
                    const found = await read(entry.schemaName, query, 1);
                    if (retained.has(key(entry))) {
                        if (found.length !== 1 || found[0].code !== entry.model.code) this.fail('CONFLICT');
                        matches(entry, found[0]);
                    } else if (found.length) this.fail('CONFLICT');
                }
            }
            for (const name of ['productVariant', 'productLocalization', 'productVariantLocalization']) {
                const found = await read(
                    name,
                    { productCode: entries[0].model.code },
                    context.policy.maximumGraphRecords,
                );
                for (const row of found) {
                    const entry = entries.find((e) => e.schemaName === name && e.model.code === row.code);
                    if (!entry || !retained.has(key(entry))) this.fail('CONFLICT');
                    matches(entry, row);
                }
            }
        };
        await inspect();
        const saved = [];
        const pending = entries.filter((e) => !retained.has(key(e)));
        if (continuing && !pending.length) this.fail('CONFLICT');
        let uncertainAttempt = null;
        try {
            for (const e of pending) {
                await inspect();
                await context.revalidate();
                // Profile proof is asynchronous: re-read graph pins/collisions after it, then check context synchronously.
                await inspect();
                check();
                const model = expected(e);
                const write = {
                    ...local(),
                    query: { tenant: scope.tenant, enterpriseCode: scope.enterpriseCode, code: model.code },
                    // Provider defaults and MongoDB ObjectId assignment must never mutate the expected business snapshot.
                    model: structuredClone(model),
                };
                uncertainAttempt = identity(e);
                const response = await storage[e.schemaName].service.save(write);
                check();
                const acknowledged = owner.envelope(response, 'SUC_SAVE_00000');
                owner.assertOutcome(acknowledged);
                if (Object.entries(model).some(([k, v]) => !isDeepStrictEqual(acknowledged[k], v)))
                    this.fail('CONFLICT');
                const rows = await read(e.schemaName, { code: model.code }, 1);
                if (rows.length !== 1 || Object.entries(model).some(([k, v]) => !isDeepStrictEqual(rows[0][k], v)))
                    this.fail('CONFLICT');
                saved.push(identity(e));
                retained.set(key(e), identity(e));
                uncertainAttempt = null;
            }
            await context.revalidate();
            await inspect();
            await context.revalidate();
            check();
        } catch (error) {
            if (!saved.length && !uncertainAttempt) throw error;
            // Never relay raw provider diagnostics, credentials, model bodies or a claim that an attempted save did not commit.
            return {
                outcome: 'PARTIAL',
                code: 'ERR_PRODUCT_AUTHORING_PARTIAL',
                productCode: entries[0].model.code,
                targetEnterpriseCode: scope.enterpriseCode,
                confirmedRecords: [...retained.values()].map((pin) => structuredClone(pin)),
                uncertainAttempt,
                unattemptedRecords: pending.slice(saved.length + (uncertainAttempt ? 1 : 0)).map(identity),
                automaticRetryAllowed: false,
                readback: {
                    method: 'POST',
                    path: '/business/products/administrative/graph-read',
                    body: {
                        targetEnterpriseCode: scope.enterpriseCode,
                        command: { productCode: entries[0].model.code },
                    },
                },
            };
        }
        return {
            outcome: 'COMPLETE',
            productCode: entries[0].model.code,
            records: [...retained.values()],
            createdRecords: saved,
            retainedRecords: confirmed,
            ...(continuing ? { continuation: { reason, actorCode: scope.principal } } : {}),
            publicationRequired: true,
        };
    },
};
