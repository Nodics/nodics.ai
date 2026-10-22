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
const reads = new WeakSet(), writes = new WeakMap();
/** @module promotion/service/defaultCouponAcquisitionPersistenceService @description Generated persistence boundary for private coupon allocation, participation and attribution records. @layer service @owner promotion */
module.exports = {
    /** Refuses incomplete persistence evidence. */
    fail: function () { throw new CLASSES.NodicsError('ERR_PROMOTION_COUPON_PERSISTENCE_UNCONFIRMED'); },
    /** Fixed generated owners, never selected by request payload. */
    schemas: function () { return ['couponOfferSupply', 'couponOwnerAllowance', 'couponAcquisitionReservation',
        'couponRedeemerAgreement', 'couponAcquisitionProjection']; },
    /** Resolves an installed generated owner. */
    service: function (schema) {
        if (!this.schemas().includes(schema)) this.fail();
        const owner = SERVICE['Default' + schema[0].toUpperCase() + schema.slice(1) + 'Service'];
        if (!owner?.get || !owner.save || !owner.update) this.fail();
        return owner;
    },
    /** Requires transaction topology, private hooks, no side effects and unique identities. */
    installed: async function (r, names) {
        const transaction = SERVICE.DefaultDatabaseTransactionService, config = CONFIG.get('databaseTransactions');
        if (config?.enabled !== true || config.failClosed !== true || !transaction?.execute ||
            transaction.capabilities({ moduleName: 'promotion', tenant: r.tenant }).multiRecordAtomic !== true) this.fail();
        for (const name of names) {
            this.service(name);
            const model = NODICS.getModels('promotion', r.tenant)?.[UTILS.createModelName(name)], schema = model?.rawSchema;
            if (!model || model.versioned === true || model.primaryKey !== 'code' || typeof model.compareAndSetItem !== 'function' ||
                schema?.transaction?.enabled !== true || schema.transaction.sideEffects !== 'none' || schema.cache?.enabled !== false ||
                schema.event?.enabled !== false || schema.search?.enabled !== false ||
                schema.readProtection?.owner !== 'DefaultCouponAcquisitionPersistenceService' ||
                !model.guardProtectedRead || !model.projectReadResult || SERVICE.DefaultModelConcurrencyService?.getField(schema)) this.fail();
            const hooks = SERVICE.DefaultDatabaseConfigurationService.getSchemaInterceptors(name);
            for (const trigger of ['preSave', 'preUpdate', 'preRemove']) if (!hooks?.[trigger]?.some(item =>
                [true, 'true'].includes(item.active) && item.handler === 'DefaultCouponAcquisitionPersistenceService.protect')) this.fail();
            const evidence = await SERVICE.DefaultDatabaseModelHandlerService.inspectIndexes(model);
            if (evidence?.versioned !== false || !evidence.indexes?.some(index => index.unique === true && !index.sparse &&
                !index.partialFilterExpression && (!index.collation || index.collation.locale === 'simple') &&
                Object.keys(index.key || {}).length === 1 && index.key.code === 1)) this.fail();
        }
    },
    /** Denies generic access, including service-account exports and counts. */
    providerRead: function (r, model) {
        if (!reads.has(r) || model.moduleName !== 'promotion' || !this.schemas().includes(model.schemaName)) this.fail();
        return true;
    },
    /** Retains provider read admission through projection. */
    providerResult: function (r, response, model) { return this.providerRead(r, model); },
    /** Denies every write except the exact unchanged owner transaction command. */
    protect: function (r) {
        const expected = writes.get(r);
        if (!expected || !r.transactionContext || expected.transactionContext !== r.transactionContext ||
            !isDeepStrictEqual(expected.query, r.query) || !isDeepStrictEqual(expected.model, r.model) ||
            !isDeepStrictEqual(expected.authData, r.authData) || expected.tenant !== r.tenant) this.fail();
        return true;
    },
    /** Requires explicit success and rejects negative acknowledgements. */
    envelope: function (response) {
        SERVICE.DefaultPromotionOperationService.assertLifecycleEnvelope(response);
        if (response.acknowledged === false || response.result?.acknowledged === false) this.fail();
    },
    /** Reads exact records only, through the generated owner and original transaction. */
    read: async function (schema, r, code) {
        SERVICE.DefaultCouponOfferService.identifier(code);
        const command = { tenant: r.tenant, authData: SERVICE.DefaultPromotionOperationService.serviceAuthData(r),
            query: { tenant: r.tenant, code }, options: { recursive: false, skipItemCache: true },
            searchOptions: { pageSize: 2, pageNumber: 1 }, ...(r.transactionContext ? { transactionContext: r.transactionContext } : {}) };
        reads.add(command);
        try {
            const response = await this.service(schema).get(command);
            this.envelope(response);
            if (!Array.isArray(response.result) || response.result.length > 1 || response.count !== response.result.length ||
                response.result.some(row => row.tenant !== r.tenant || row.code !== code)) this.fail();
            return structuredClone(response.result[0]);
        } finally { reads.delete(command); }
    },
    /** Finds one private acquisition by its original immutable command; never exposes arbitrary predicates or generic enumeration. */
    acquisitionByCommand: async function (r, operationKey, orderCode) {
        for (const value of [operationKey, orderCode])
            if (typeof value !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9_.:@|\-]{0,255}$/.test(value)) this.fail();
        const command = { tenant: r.tenant, authData: SERVICE.DefaultPromotionOperationService.serviceAuthData(r),
            query: { tenant: r.tenant, 'evidence.identity.idempotencyKey': operationKey, 'evidence.identity.orderCode': orderCode },
            options: { recursive: false, skipItemCache: true }, searchOptions: { pageSize: 2, pageNumber: 1 } };
        reads.add(command);
        try {
            const response = await this.service('couponAcquisitionReservation').get(command);
            this.envelope(response);
            if (!Array.isArray(response.result) || response.result.length !== 1 || response.count !== 1 ||
                response.result[0].tenant !== r.tenant || response.result[0].evidence?.identity?.idempotencyKey !== operationKey ||
                response.result[0].evidence.identity.orderCode !== orderCode) this.fail();
            return structuredClone(response.result[0]);
        } finally { reads.delete(command); }
    },
    /** Creates once or commits a revision-fenced successor; exact readback is mandatory. */
    write: async function (schema, r, current, model) {
        if (!r.transactionContext || model.tenant !== r.tenant || !Number.isSafeInteger(model.revision) ||
            model.revision !== (current ? current.revision + 1 : 0)) this.fail();
        const command = { tenant: r.tenant, authData: SERVICE.DefaultPromotionOperationService.serviceAuthData(r),
            transactionContext: r.transactionContext, query: { tenant: r.tenant, code: model.code,
                ...(current ? { revision: current.revision } : {}) }, model: structuredClone(model),
            options: { recursive: false, ...(current ? {} : { insertOnly: true }) } };
        if (!current) {
            command.schemaModel = NODICS.getModels('promotion', r.tenant)?.[UTILS.createModelName(schema)];
            const initializer = SERVICE.DefaultModelSaveInitializerService;
            if (!command.schemaModel || typeof initializer?.applyDefaultValues !== 'function') this.fail();
            await new Promise((resolve, reject) => initializer.applyDefaultValues(command, {}, {
                nextSuccess: resolve, error: (_request, _response, error) => reject(error),
            }));
        }
        writes.set(command, { tenant: command.tenant, authData: structuredClone(command.authData), query: structuredClone(command.query),
            model: structuredClone(command.model), transactionContext: command.transactionContext });
        try {
            const response = await this.service(schema)[current ? 'update' : 'save'](command);
            this.envelope(response);
            if (current && (response.result?.acknowledged !== true || response.result.matchedCount !== 1)) this.fail();
        } finally { writes.delete(command); }
        const saved = await this.read(schema, r, model.code);
        if (!saved || Object.keys(model).some(key => !isDeepStrictEqual(saved[key], model[key]))) this.fail();
        return saved;
    },
    /** Executes one owner transaction, with installed checks before every attempt and no partial success. */
    transaction: async function (r, names, action) {
        await this.installed(r, names);
        return SERVICE.DefaultDatabaseTransactionService.execute({ moduleName: 'promotion', tenant: r.tenant },
            transactionContext => action({ ...r, transactionContext }));
    },
};
