/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/**
 * @module nodics.waste/test/helpers/nativeOwnerPersistenceFixture
 * @description Installs selected Waste owner schemas, validators, indexes and generated persistence on one fresh loopback MongoDB database.
 * @layer test
 * @owner nodics.waste
 * @sideEffects Creates and drops only this invocation's random database. It never selects customer configuration, credentials or a business database.
 */
const path = require('node:path');
const crypto = require('node:crypto');
const _ = require('lodash');
const { MongoClient } = require('mongodb');
const root = path.resolve(__dirname, '../../..');
const foundation = relative => require(path.join(root, 'nodics.foundation/modules', relative));
const connectionOwner = foundation('nDatabase/mongodb/src/service/connection/defaultMongodbDatabaseConnectionHandlerService');
const modelOwner = foundation('nDatabase/mongodb/src/schemas/model').default;
const provider = foundation('nDatabase/mongodb/src/service/model/defaultMongodbDatabaseModelHandlerService');
const save = foundation('nDatabase/database/src/service/procs/save/defaultModelSaveInitializerService');
const update = foundation('nDatabase/database/src/service/procs/update/defaultModelsUpdateInitializerService');
const base = foundation('nDatabase/database/src/schemas/schemas').default;
const persistence = require('../../modules/wasteCore/src/service/defaultWastePersistenceService');
const quiet = { debug() {}, error() {} };

/** Rejects remote hosts, credentials, selected databases and unsupported URI options. */
function validateUri(uri) {
    if (typeof uri !== 'string' || !/^mongodb:\/\/127\.0\.0\.1:\d+\/?(?:\?replicaSet=[A-Za-z0-9._-]+)?$/.test(uri))
        throw new Error('Explicit credential-free loopback MongoDB URI without a database required');
    const port = Number(uri.match(/:(\d+)/)[1]);
    if (port < 1 || port > 65535) throw new Error('Valid loopback MongoDB port required');
    return uri;
}

/** Runs one real generated pipeline step while preserving its request identity. */
async function step(owner, member, request) {
    return new Promise((resolve, reject) => ({ ...owner, LOG: quiet })[member](request, {}, {
        nextSuccess: resolve,
        error: (_request, _response, error) => reject(error),
    }));
}

/** Redacts native validation diagnostics to field and rule names. */
function validationError(error) {
    if (error?.code !== 121) return error;
    const fields = new Set(), rules = new Set();
    function visit(value) {
        if (!value || typeof value !== 'object') return;
        if (typeof value.propertyName === 'string') fields.add(value.propertyName);
        if (typeof value.operatorName === 'string') rules.add(value.operatorName);
        if (Array.isArray(value.missingProperties)) value.missingProperties.forEach(field => fields.add(field));
        for (const key of ['details', 'schemaRulesNotSatisfied', 'propertiesNotSatisfied', 'itemsNotSatisfied', 'schemasNotSatisfied'])
            if (Array.isArray(value[key])) value[key].forEach(visit); else visit(value[key]);
    }
    visit(error.errInfo?.details);
    const sanitized = new Error('Native schema validation refused fields=' + [...fields].sort().join(',') +
        '; rules=' + [...rules].sort().join(','));
    sanitized.code = 121;
    return sanitized;
}

/**
 * Creates a Waste-only native persistence slice from explicit owner schema descriptors.
 * @param {import('node:test').TestContext} t Active Node test context.
 * @param {{schemas:Array<{moduleName:string,schemaName:string,schema:Object}>,settings?:Object,enums?:Object}} options Explicit test composition.
 * @returns {Promise<Object>} Native generated repositories and reconnect evidence.
 */
async function create(t, options) {
    const uri = validateUri(process.env.NODICS_WASTE_NATIVE_MONGO_URI);
    if (!Array.isArray(options?.schemas) || options.schemas.length === 0)
        throw new Error('Explicit Waste owner schemas are required');
    const identities = new Set();
    for (const item of options.schemas) {
        if (!item || typeof item.moduleName !== 'string' || !/^waste[A-Za-z0-9]+$/.test(item.moduleName) ||
            typeof item.schemaName !== 'string' || !item.schemaName || !item.schema || typeof item.schema !== 'object')
            throw new Error('Invalid Waste owner schema descriptor');
        const identity = item.moduleName + ':' + item.schemaName;
        if (identities.has(identity)) throw new Error('Duplicate Waste owner schema descriptor');
        identities.add(identity);
    }
    const previous = Object.fromEntries(['CONFIG', 'nConfig', 'SERVICE', 'CLASSES', 'NODICS', 'UTILS', 'ENUMS']
        .map(key => [key, global[key]]));
    const upper = Object.getOwnPropertyDescriptor(String.prototype, 'toUpperCaseFirstChar');
    Object.defineProperty(String.prototype, 'toUpperCaseFirstChar', { configurable: true,
        /**
         * Supplies the fixture's string capitalization helper without changing the receiver.
         * @this {String} Nonempty string to capitalize.
         * @returns {string} Uppercased first character followed by the original remainder.
         */
        value: function () { return this[0].toUpperCase() + this.slice(1); } });
    const databaseName = 'nodics_waste_owner_test_' + crypto.randomUUID().replaceAll('-', '');
    const tenant = 'waste_native_acceptance', settings = options.settings || {};
    settings.databaseTransactions ||= { enabled: true, failClosed: true, maximumCommitTimeMs: 5000 };
    const models = {}, ownerModels = {}, commands = [];
    const database = new (foundation('nDatabase/database/src/lib/database'))();
    database.setURI(uri);
    database.setOptions(_.cloneDeep(foundation('nDatabase/mongodb/config/properties').database.default.mongodb.options));
    let client, db, created = false;
    global.CONFIG = global.nConfig = { get: key => settings[key] };
    if (options.enums) global.ENUMS = options.enums;
    global.CLASSES = { NodicsError: class extends Error {
        constructor(error, message, fallback) {
            super(message || (error instanceof Error ? error.message : error));
            this.code = error instanceof Error ? error.code || fallback : error;
        }
        static enrich(error) { return error; }
    } };
    global.UTILS = { isBlank: value => value == null || Object.keys(value).length === 0,
        createModelName: value => value, isObject: _.isPlainObject };
    global.SERVICE = {
        DefaultIdentityGovernanceService: foundation('nAuth/src/service/identity/defaultIdentityGovernanceService'),
        DefaultDatabaseTransactionService: foundation('nDatabase/database/src/service/transaction/defaultDatabaseTransactionService'),
        DefaultMongodbDatabaseConnectionHandlerService: connectionOwner,
        DefaultMongodbDatabaseModelHandlerService: { ...provider, LOG: quiet },
        DefaultDatabaseModelHandlerService: foundation('nDatabase/database/src/service/model/defaultDatabaseModelHandlerService'),
        DefaultModelConcurrencyService: foundation('nDatabase/database/src/service/schema/defaultModelConcurrencyService'),
        DefaultModelValidatorService: { ...foundation('nDatabase/database/src/service/model/defaultModelValidatorService'), LOG: quiet },
        DefaultPropertyInitialValueProviderService: foundation('nDatabase/database/src/service/init/defaultPropertyInitialValueProviderService'),
        DefaultSchemaReadAccessPolicyService: foundation('nDatabase/database/src/service/schema/defaultSchemaReadAccessPolicyService'),
        DefaultInterceptorService: foundation('nCommon/src/service/interceptor/defaultInterceptorService'),
        DefaultWastePersistenceService: persistence,
        DefaultDatabaseConfigurationService: {
            getTenantDatabase: (owner, partition) => ownerModels[owner] && partition === tenant ? { master: database } : undefined,
            getSchemaInterceptors: () => ({}),
        },
    };
    global.NODICS = { getModels: (owner, partition) => partition === tenant ? ownerModels[owner] || {} : {} };

    async function connect() {
        client = await MongoClient.connect(uri, { ignoreUndefined: true, retryWrites: false,
            serverSelectionTimeoutMS: 5000, monitorCommands: true });
        client.on('commandStarted', event => {
            if (['insert', 'update', 'findAndModify', 'find', 'commitTransaction', 'abortTransaction'].includes(event.commandName))
                commands.push({ name: event.commandName, transaction: event.command.autocommit === false,
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
    function bind(item, rawSchema) {
        const collection = db.collection(item.schemaName);
        const model = { ...modelOwner, rawSchema, moduleName: item.moduleName, schemaName: item.schemaName,
            modelName: item.schemaName, tenant, versioned: false, primaryKey: 'code', dataBase: database };
        for (const member of ['insertOne', 'findOneAndUpdate', 'findOneAndDelete', 'updateMany', 'deleteMany',
            'find', 'countDocuments', 'listIndexes', 'indexes']) model[member] = collection[member].bind(collection);
        models[item.schemaName] = model;
        (ownerModels[item.moduleName] ||= {})[item.schemaName] = model;
    }
    t.after(async () => {
        try { if (created) await db.dropDatabase({ writeConcern: { w: 'majority', j: true } }); }
        finally {
            await client?.close();
            for (const [key, value] of Object.entries(previous))
                if (value === undefined) delete global[key]; else global[key] = value;
            if (upper) Object.defineProperty(String.prototype, 'toUpperCaseFirstChar', upper);
            else delete String.prototype.toUpperCaseFirstChar;
        }
    });
    await connect();
    for (const item of options.schemas) {
        const rawSchema = _.merge({}, base.super, base.base, item.schema);
        await provider.prepareDatabaseOptions({ moduleObject: { rawSchema: { [item.schemaName]: rawSchema } },
            schemaName: item.schemaName, tntCode: tenant, dataBase: { master: database } });
        const schemaOptions = rawSchema.schemaOptions[tenant];
        await db.createCollection(item.schemaName, schemaOptions.options); created = true;
        for (const index of schemaOptions.indexedFields)
            await db.collection(item.schemaName).createIndex(index.fields,
                { ...index.options, writeConcern: { w: 'majority', j: true } });
        bind(item, rawSchema);
        const serviceName = 'Default' + item.schemaName[0].toUpperCase() + item.schemaName.slice(1) + 'Service';
        SERVICE[serviceName] = {
            get: async input => {
                const result = await models[item.schemaName].getItems({ ...input,
                    searchOptions: { limit: input.searchOptions?.pageSize || input.searchOptions?.limit || 1001 } });
                return { code: 'SUC_FIND_00000', result: result.result, count: result.count };
            },
            save: async input => {
                const request = { ...input, schemaModel: models[item.schemaName], query: input.query || { code: input.model.code } };
                await step(save, 'validateModel', request);
                await step(save, 'applyDefaultValues', request);
                await step(save, 'applyPreInterceptors', request);
                try { return { code: 'SUC_SAVE_00000', result: await save.persistModel(request) }; }
                catch (error) { throw validationError(error); }
            },
            update: async input => {
                const request = { ...input, schemaModel: models[item.schemaName] };
                await step(update, 'validateRequest', request);
                await step(update, 'applyPreInterceptors', request);
                try { return { code: 'SUC_UPDATE_00000', result: await update.persistUpdates(request) }; }
                catch (error) { throw validationError(error); }
            },
        };
    }
    return { tenant, settings, models, ownerModels, commands,
        request: { tenant, authData: { tenant, principalType: 'service', loginId: 'waste-native-owner' } },
        reconnect: async () => {
            const definitions = options.schemas.map(item => ({ item, rawSchema: models[item.schemaName].rawSchema }));
            await client.close(); await connect();
            for (const definition of definitions) bind(definition.item, definition.rawSchema);
        },
    };
}

module.exports = { create, validateUri, validationError };
