/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
'use strict';
/** @module promotion/test/helpers/nativePersistenceFixture
 * @description Installs real owner schemas, validators, indexes and generated persistence steps on a fresh loopback MongoDB database. No business database, credential, Profile double or qualification flag is selectable.
 * @layer test @owner promotion
 * @sideEffects Creates and drops only this invocation's random database. This is persistence-slice acceptance, not signed admission or a complete booted server.
 */
const path = require('node:path');
const crypto = require('node:crypto');
const _ = require('lodash');
const { MongoClient } = require('mongodb');
const root = path.resolve(__dirname, '../../../../../../..');
const foundation = relative => require(path.join(root, 'nodics.foundation/modules', relative));
const transactions = foundation('nDatabase/database/src/service/transaction/defaultDatabaseTransactionService');
const connectionOwner = foundation('nDatabase/mongodb/src/service/connection/defaultMongodbDatabaseConnectionHandlerService');
const modelOwner = foundation('nDatabase/mongodb/src/schemas/model').default;
const provider = foundation('nDatabase/mongodb/src/service/model/defaultMongodbDatabaseModelHandlerService');
const save = foundation('nDatabase/database/src/service/procs/save/defaultModelSaveInitializerService');
const update = foundation('nDatabase/database/src/service/procs/update/defaultModelsUpdateInitializerService');
const remove = foundation('nDatabase/database/src/service/procs/remove/defaultModelsRemoveInitializerService');
const base = foundation('nDatabase/database/src/schemas/schemas').default;
const quiet = { debug() {}, error() {} };

/** Runs one real generated pipeline step, preserving its original request identity. */
async function step(owner, member, request) {
    return new Promise((resolve, reject) => ({ ...owner, LOG: quiet })[member](request, {}, {
        nextSuccess: resolve, error: (_request, _response, error) => reject(error),
    }));
}

/** Creates a persistence-only test runtime; authority and secret owners are deliberately absent. */
async function create(t, moduleName = 'promotion') {
    const uri = process.env.NODICS_COMMERCE_NATIVE_MONGO_URI;
    if (typeof uri !== 'string' || !/^mongodb:\/\/127\.0\.0\.1:\d+\/?(?:\?replicaSet=[A-Za-z0-9._-]+)?$/.test(uri))
        throw new Error('Explicit credential-free loopback MongoDB URI without a database required');
    if (!['promotion', 'digitalCore'].includes(moduleName)) throw new Error('Unsupported acceptance owner');
    const previous = Object.fromEntries(['CONFIG', 'nConfig', 'SERVICE', 'CLASSES', 'NODICS', 'UTILS'].map(key => [key, global[key]]));
    const previousUpper = Object.getOwnPropertyDescriptor(String.prototype, 'toUpperCaseFirstChar');
    Object.defineProperty(String.prototype, 'toUpperCaseFirstChar', { configurable: true,
        /**
         * Supplies the fixture's string capitalization helper without changing the receiver.
         * @this {String} Nonempty string to capitalize.
         * @returns {string} Uppercased first character followed by the original remainder.
         * @throws {TypeError} If the receiver is empty.
         */
        value: function () { return this[0].toUpperCase() + this.slice(1); } });
    const databaseName = 'nodics_owner_test_' + crypto.randomUUID().replaceAll('-', '');
    const tenant = 'acceptance', commands = [], models = {};
    let client, db, created = false;
    const database = new (foundation('nDatabase/database/src/lib/database'))();
    database.setURI(uri);
    database.setOptions({ ...foundation('nDatabase/mongodb/config/properties').database.default.mongodb.options });
    const settings = { databaseTransactions: { enabled: true, failClosed: true, maximumCommitTimeMs: 5000 },
        promotion: require('../../config/properties').promotion,
        digitalCore: require('../../../../../digitalCommerce/modules/digitalCore/config/properties').digitalCore };
    global.CONFIG = global.nConfig = { get: key => settings[key] };
    // Only error rendering and runtime string/blank helpers are local scaffolding; persistence is never doubled.
    global.CLASSES = { NodicsError: class extends Error {
        constructor(error, message, fallback) { super(message || (error instanceof Error ? error.message : error));
            this.code = error instanceof Error ? error.code || fallback : error; }
        static enrich(error) { return error; }
    } };
    global.UTILS = { isBlank: value => value == null || Object.keys(value).length === 0,
        createModelName: value => value, isObject: _.isPlainObject };
    const hooks = moduleName === 'promotion' ? require('../../src/interceptors/interceptors') : {};
    global.SERVICE = {
        DefaultDatabaseTransactionService: transactions,
        DefaultMongodbDatabaseConnectionHandlerService: connectionOwner,
        DefaultMongodbDatabaseModelHandlerService: { ...provider, LOG: quiet },
        DefaultDatabaseModelHandlerService: foundation('nDatabase/database/src/service/model/defaultDatabaseModelHandlerService'),
        DefaultModelConcurrencyService: foundation('nDatabase/database/src/service/schema/defaultModelConcurrencyService'),
        DefaultModelValidatorService: { ...foundation('nDatabase/database/src/service/model/defaultModelValidatorService'), LOG: quiet },
        DefaultSchemaReadAccessPolicyService: foundation('nDatabase/database/src/service/schema/defaultSchemaReadAccessPolicyService'),
        DefaultInterceptorService: foundation('nCommon/src/service/interceptor/defaultInterceptorService'),
        DefaultCouponSecureIssuanceService: require('../../src/service/defaultCouponSecureIssuanceService'),
        DefaultCouponSellerAuthorizationService: require('../../src/service/defaultCouponSellerAuthorizationService'),
        DefaultPromotionOperationService: require('../../src/service/defaultPromotionOperationService'),
        DefaultPromotionBudgetAdmissionService: require('../../src/service/defaultPromotionBudgetAdmissionService'),
        DefaultPromotionBudgetMutationService: require('../../src/service/defaultPromotionBudgetMutationService'),
        DefaultPromotionPublicationService: require('../../src/service/defaultPromotionPublicationService'),
        DefaultDigitalCommerceEntitlementService: require('../../../../../digitalCommerce/modules/digitalCore/src/service/defaultDigitalCommerceEntitlementService'),
        DefaultDatabaseConfigurationService: {
            getTenantDatabase: (owner, partition) => owner === moduleName && partition === tenant ? { master: database } : undefined,
            getSchemaInterceptors: name => Object.fromEntries(['preSave', 'preUpdate', 'preRemove'].map(trigger => [trigger,
                Object.values(hooks).filter(item => item.item === name && item.trigger === trigger && [true, 'true'].includes(item.active))
                    .sort((left, right) => left.index - right.index)])),
        },
    };
    global.NODICS = { getModels: (owner, partition) => owner === moduleName && partition === tenant ? models : {} };
    const schemas = moduleName === 'promotion' ? require('../../src/schemas/schemas').promotion
        : require('../../../../../digitalCommerce/modules/digitalCore/src/schemas/schemas').digitalCore;
    /** Opens a new real client, retaining only secret-free command option evidence. */
    async function connect() {
        client = await MongoClient.connect(uri, { ignoreUndefined: true, directConnection: true,
            retryWrites: false, serverSelectionTimeoutMS: 5000, monitorCommands: true });
        client.on('commandStarted', event => {
            if (!['insert', 'update', 'findAndModify', 'find', 'commitTransaction', 'abortTransaction'].includes(event.commandName)) return;
            commands.push({ name: event.commandName, session: !!event.command.lsid,
                transaction: event.command.autocommit === false,
                readConcern: event.command.readConcern, writeConcern: event.command.writeConcern });
        });
        db = client.db(databaseName);
        const hello = await db.command({ hello: 1 });
        if (!hello.setName || !hello.isWritablePrimary || !Array.isArray(hello.hosts) ||
            hello.hosts.some(host => !/^127\.0\.0\.1:\d+$/.test(host)) || hello.passives?.length || hello.arbiters?.length)
            throw new Error('Writable exclusively loopback replica set required');
        database.setClient(client); database.setConnection(db);
        database.setCapabilities(await connectionOwner.discoverCapabilities(db));
    }
    /** Rebinds provider methods to actual collections, with the canonical model implementation. */
    function bind(name, rawSchema) {
        const collection = db.collection(name);
        const model = { ...modelOwner, rawSchema, moduleName, schemaName: name, modelName: name,
            tenant, versioned: false, primaryKey: 'code', dataBase: database };
        for (const member of ['insertOne', 'findOneAndUpdate', 'findOneAndDelete', 'updateMany', 'deleteMany', 'find', 'countDocuments', 'listIndexes', 'indexes'])
            model[member] = collection[member].bind(collection);
        models[name] = model;
    }
    async function cleanup() {
        try { if (created) await db.dropDatabase({ writeConcern: { w: 'majority', j: true } }); }
        finally {
            await client?.close();
            for (const [key, value] of Object.entries(previous)) if (value === undefined) delete global[key]; else global[key] = value;
            if (previousUpper) Object.defineProperty(String.prototype, 'toUpperCaseFirstChar', previousUpper);
            else delete String.prototype.toUpperCaseFirstChar;
        }
    }
    t.after(cleanup);
    await connect();
    const names = moduleName === 'promotion' ? ['coupon', 'couponBatch'] : ['digitalEntitlement', 'digitalDelivery'];
    for (const name of names) {
        const rawSchema = _.merge({}, base.super, base.base, schemas[name]);
        await provider.prepareDatabaseOptions({ moduleObject: { rawSchema: { [name]: rawSchema } }, schemaName: name,
            tntCode: tenant, dataBase: { master: database } });
        const schemaOptions = rawSchema.schemaOptions[tenant];
        await db.createCollection(name, schemaOptions.options); created = true;
        for (const index of schemaOptions.indexedFields)
            await db.collection(name).createIndex(index.fields, { ...index.options, writeConcern: { w: 'majority', j: true } });
        bind(name, rawSchema);
        const serviceName = 'Default' + name[0].toUpperCase() + name.slice(1) + 'Service';
        SERVICE[serviceName] = {
            get: async input => ({ code: 'SUC_FIND_00000', result: (await models[name].getItems({ ...input,
                searchOptions: { limit: input.searchOptions?.limit || input.searchOptions?.pageSize || 101 } })).result }),
            save: async input => {
                const request = { ...input, schemaModel: models[name], query: input.query || { code: input.model.code } };
                await step(save, 'applyPreInterceptors', request);
                return { code: 'SUC_SAVE_00000', result: await save.persistModel(request) };
            },
            update: async input => {
                const request = { ...input, schemaModel: models[name] };
                await step(update, 'applyPreInterceptors', request);
                return { code: 'SUC_UPDATE_00000', result: await update.persistUpdates(request) };
            },
            remove: async input => {
                const request = { ...input, schemaModel: models[name] };
                await step(remove, 'applyPreInterceptors', request);
                return { code: 'SUC_REMOVE_00000', result: await models[name].deleteMany(request.query) };
            },
        };
    }
    return { tenant, models, database, databaseName, commands,
        request: { tenant, enterpriseCode: 'synthetic_enterprise', ownerId: 'synthetic_buyer', correlationId: 'native_persistence' },
        /** Reloads native state with a new client, rather than retaining an in-memory database. */
        reconnect: async function () {
            const definitions = Object.fromEntries(Object.entries(models).map(([name, model]) => [name, model.rawSchema]));
            await client.close(); await connect();
            for (const [name, schema] of Object.entries(definitions)) bind(name, schema);
        },
    };
}
module.exports = { create };
