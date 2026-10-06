/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const MongoClient = require('mongodb').MongoClient;

/**
 * @module mongodb/service/connection/DefaultMongodbDatabaseConnectionHandlerService
 * @description MongoDB implementation of the Nodics database connection handler
 * contract. It creates Mongo clients, discovers collections, detects initial
 * data requirements, reads runtime schema configuration, and closes clients.
 * @layer service
 * @owner nDatabase
 * @override Project modules may override this adapter to customize MongoDB
 * connection options, readiness checks, runtime schema storage, or client
 * lifecycle while preserving the generic database connection handler contract.
 *
 * @property {Object} config.URI MongoDB server URI.
 * @property {string} config.databaseName MongoDB database name.
 * @property {Object} config.options MongoClient options.
 */
module.exports = {
    /** Opens an explicitly attested offline disposable Local reset target, never an ordinary CRUD/startup path. */
    openLocalResetMaintenance: function (options) {
        const owner = global.SERVICE?.DefaultMongodbLocalResetMaintenanceService ||
            require('../maintenance/defaultMongodbLocalResetMaintenanceService');
        return owner.open(options);
    },
    /**
     * Returns transaction capability discovered from the live MongoDB topology.
     *
     * @param {Object} database Nodics database wrapper.
     * @returns {Object} Provider-neutral transaction capability.
     */
    transactionCapabilities: function (database) {
        let capabilities = database && typeof database.getCapabilities === 'function' ?
            database.getCapabilities() : {};
        let transaction = capabilities.transaction || {};
        return {
            multiRecordAtomic: transaction.multiRecordAtomic === true,
            journaledCommit: transaction.multiRecordAtomic === true,
            contextPropagation: true,
            contractVersion: 0,
            reason: transaction.reason
        };
    },

    /**
     * Discovers whether the connected MongoDB topology can support transactions.
     *
     * @param {Object} db Connected MongoDB database.
     * @returns {Promise<Object>} Provider-neutral connection capabilities.
     */
    discoverCapabilities: async function (db) {
        let topology;
        try {
            topology = await db.command({ hello: 1 });
        } catch (error) {
            try {
                topology = await db.command({ isMaster: 1 });
            } catch (fallbackError) {
                return {
                    persistence: { durableJournal: false, primaryMajorityReadback: false, contractVersion: 1 },
                    transaction: {
                        multiRecordAtomic: false,
                        reason: 'MongoDB topology discovery failed'
                    }
                };
            }
        }
        let sessionCapable = Number.isFinite(topology.logicalSessionTimeoutMinutes);
        let qualifiedTopology = typeof topology.setName === 'string' ||
            topology.msg === 'isdbgrid';
        const durableProtocol = Number.isSafeInteger(topology.maxWireVersion) && topology.maxWireVersion >= 4 &&
            topology.readOnly !== true && (topology.isWritablePrimary === true || topology.ismaster === true || topology.msg === 'isdbgrid');
        return {
            persistence: { durableJournal: durableProtocol, primaryMajorityReadback: durableProtocol, contractVersion: 1 },
            transaction: {
                multiRecordAtomic: sessionCapable && qualifiedTopology,
                reason: sessionCapable && qualifiedTopology ? undefined :
                    'MongoDB transactions require logical sessions and a replica set or sharded cluster'
            }
        };
    },

    /** Returns MongoDB operation options without exposing the session to business callers. */
    transactionOperationOptions: function (adapterContext) {
        if (!adapterContext || !adapterContext.session) throw new Error('MongoDB transaction session is unavailable');
        return { session: adapterContext.session };
    },

    /** Executes one callback in a MongoDB client session transaction. */
    executeTransaction: async function (database, options, work) {
        let capability = this.transactionCapabilities(database);
        if (capability.multiRecordAtomic !== true) {
            throw new Error(capability.reason || 'MongoDB topology is not qualified for transactions');
        }
        const client = database && database.getClient();
        if (!client || typeof client.startSession !== 'function') {
            throw new Error('MongoDB client does not support sessions');
        }
        const session = client.startSession();
        let result;
        try {
            await session.withTransaction(async () => {
                result = await work({ session: session });
            }, {
                readConcern: { level: 'snapshot' },
                writeConcern: { w: 'majority', j: true },
                maxCommitTimeMS: Number(options.maximumCommitTimeMs)
            });
            return result;
        } finally {
            await session.endSession();
        }
    },
    /**
     * Initializes the MongoDB connection handler.
     *
     * @param {Object} options Startup options supplied by the module initializer.
     * @returns {Promise<boolean>} Resolves when initialization is complete.
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Finalizes the MongoDB connection handler.
     *
     * @param {Object} options Startup options supplied by the module initializer.
     * @returns {Promise<boolean>} Resolves when post-initialization is complete.
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Validates a portable physical database name without contacting MongoDB.
     * @param {string} name Physical name.
     * @returns {boolean} True for an admitted name.
     */
    validateTenantDatabaseName: function (name) {
        if (typeof name !== 'string' || !name || Buffer.byteLength(name, 'utf8') > 63 ||
            /[\s/\\."$*<>:|?\u0000]/u.test(name) || ['admin', 'config', 'local'].includes(name.toLowerCase())) {
            throw new CLASSES.NodicsError('ERR_DATABASE_TENANT_NAMESPACE', 'Invalid tenant database namespace');
        }
        return true;
    },

    /**
     * Derives a namespace from exact base/tenant identity, not normalized labels.
     * @param {string} baseName Runtime/module base name.
     * @param {string} tenant Tenant code.
     * @returns {string} Physical name, at most 62 ASCII bytes.
     */
    deriveTenantDatabaseName: function (baseName, tenant) {
        this.validateTenantDatabaseName(baseName);
        if (typeof tenant !== 'string' || !tenant || tenant.trim() !== tenant ||
            Buffer.byteLength(tenant, 'utf8') > 256 || /[\u0000-\u001f\u007f]/u.test(tenant)) {
            throw new CLASSES.NodicsError('ERR_DATABASE_TENANT_NAMESPACE', 'Invalid tenant namespace intent');
        }
        const digest = require('crypto').createHash('sha256').update(JSON.stringify([1, baseName, tenant])).digest('base64url');
        const prefix = baseName.replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 16);
        const name = prefix + '_t_' + digest;
        this.validateTenantDatabaseName(name);
        return name;
    },

    /**
     * Fingerprints non-secret endpoint configuration without DNS, connection or credential material.
     * Pins detect configured endpoint drift, not installed DNS/SRV/cluster or certificate identity.
     * @param {Object} config Effective channel URI/options, never returned or persisted.
     * @returns {string} SHA-256 of canonical protocol, seed endpoints and topology/trust options.
     */
    getTenantEndpointFingerprint: function (config) {
        try {
            const ConnectionString = require('mongodb-connection-string-url').default;
            if (typeof config?.URI !== 'string' || config.URI.length > 16384) throw new Error();
            this.validateTenantDatabaseName(config.databaseName);
            const parsed = new ConnectionString(config.URI);
            const keys = ['replicaset', 'directconnection', 'loadbalanced', 'srvservicename', 'srvmaxhosts',
                'tls', 'tlsinsecure', 'tlsallowinvalidcertificates', 'tlsallowinvalidhostnames',
                'tlscafile', 'tlscertificatekeyfile', 'tlsdisableocspendpointcheck', 'tlsdisablecertificaterevocationcheck',
                'proxyhost', 'proxyport', 'family'];
            const booleans = new Set(['directconnection', 'loadbalanced', 'tls', 'tlsinsecure',
                'tlsallowinvalidcertificates', 'tlsallowinvalidhostnames', 'tlsdisableocspendpointcheck',
                'tlsdisablecertificaterevocationcheck']);
            const integers = new Set(['srvmaxhosts', 'proxyport', 'family']);
            const values = {};
            const assign = (key, value) => {
                key = key.toLowerCase() === 'ssl' ? 'tls' : key.toLowerCase();
                if (!keys.includes(key)) return;
                if (booleans.has(key)) {
                    if (![true, false, 'true', 'false'].includes(value)) throw new Error();
                    value = value === true || value === 'true';
                } else if (integers.has(key)) {
                    if (!/^\d{1,10}$/.test(String(value)) || !Number.isSafeInteger(Number(value))) throw new Error();
                    value = Number(value);
                } else if (typeof value !== 'string' || !value || value.length > 1024) throw new Error();
                values[key] = value;
            };
            const seen = new Set();
            for (const [key, value] of parsed.searchParams) {
                const canonical = key.toLowerCase() === 'ssl' ? 'tls' : key.toLowerCase();
                if (!keys.includes(canonical)) continue;
                if (seen.has(canonical)) throw new Error();
                seen.add(canonical);
                assign(key, value);
            }
            const optionKeys = new Set();
            for (const [key, value] of Object.entries(config.options || {})) {
                const canonical = key.toLowerCase() === 'ssl' ? 'tls' : key.toLowerCase();
                if (keys.includes(canonical) && optionKeys.has(canonical)) throw new Error();
                optionKeys.add(canonical);
                assign(key, value);
            }
            const hosts = parsed.hosts.map(host => {
                // Domain sockets are case-sensitive paths, not TCP seed endpoints.
                if (/[\/\\]/u.test(decodeURIComponent(host))) throw new Error();
                host = host.toLowerCase();
                return parsed.protocol === 'mongodb:' && !/:(\d+)$/.test(host) ? host + ':27017' : host;
            }).sort();
            const options = keys.filter(key => Object.hasOwn(values, key)).map(key => [key, values[key]]);
            return require('crypto').createHash('sha256').update(JSON.stringify([1, parsed.protocol, hosts, config.databaseName, options])).digest('hex');
        } catch (_) {
            throw new CLASSES.NodicsError('ERR_DATABASE_TENANT_BINDING', 'Invalid endpoint configuration identity');
        }
    },

    /**
     * Creates a MongoDB client/database connection and lists existing collections.
     *
     * @param {Object} config MongoDB connection configuration.
     * @param {string} config.URI MongoDB server URI.
     * @param {string} config.databaseName Database name.
     * @param {Object} [config.options] MongoClient options.
     * @returns {Promise<Object>} Connection response containing client, db connection, and collection list.
     * @throws {CLASSES.NodicsError} When MongoDB connection or collection discovery fails.
     */
    createConnection: function (config) {
        let _self = this;
        return new Promise((resolve, reject) => {
            _self.LOG.debug('Creating MongoDB database connection for URI: ' + config.URI + '/' + config.databaseName);
            let mongoClient = new MongoClient(config.URI, config.options || {});
            mongoClient.connect().then(client => {
                _self.LOG.debug('  connected to: ' + config.URI + '/' + config.databaseName);
                let db = client.db(config.databaseName);
                Promise.all([
                    db.listCollections({}, { nameOnly: true }).toArray(),
                    _self.discoverCapabilities(db)
                ]).then(results => {
                    let collections = results[0];
                    let capabilities = results[1];
                    resolve({
                        client: mongoClient,
                        connection: db,
                        collections: collections,
                        capabilities: capabilities
                    });
                }).catch(error => {
                    if (error) {
                        reject(new CLASSES.NodicsError(error, 'While fetching list of collections', 'ERR_DBS_00000'));
                    }
                });
            }).catch(error => {
                reject(new CLASSES.NodicsError(error, 'MongoDB default connection error', 'ERR_DBS_00000'));
            });
        });
    },

    /**
     * Checks whether initial data import is required for the profile database.
     *
     * @returns {Promise<boolean>} Resolves true when the profile database appears uninitialized.
     * @throws {CLASSES.NodicsError} When the readiness check fails unexpectedly.
     */
    isInitRequired: function () {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                let defaultTenant = CONFIG.get('defaultTenant') || 'default';
                let db = SERVICE.DefaultDatabaseConfigurationService.getTenantDatabase(CONFIG.get('profileModuleName'), defaultTenant);
                if (db && db.master) {
                    if (!db.master.getCollectionList() || db.master.getCollectionList().length <= 0) {
                        _self.LOG.info('System requires initial data to be imported');
                        resolve(true);
                    } else {
                        db.master.getConnection().collection('EnterpriseModel').findOne({}, function (err, result) {
                            if (err) {
                                _self.LOG.error('Not able to fetch if initial data required or not');
                                _self.LOG.error(err);
                                resolve(false);
                            } else if (!result) {
                                resolve(true);
                            } else {
                                resolve(false);
                            }
                        });
                    }
                } else {
                    resolve(false);
                }
            } catch (error) {
                reject(new CLASSES.NodicsError(error, 'MongoDB default connection error', 'ERR_DBS_00000'));
            }
        });
    },

    /**
     * Reads runtime schema configuration from MongoDB.
     *
     * @returns {Promise<Object[]>} Runtime schema configuration rows.
     * @throws {CLASSES.NodicsError} When the default database is unavailable or query fails.
     */
    getRuntimeSchema: function () {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                let defaultTenant = CONFIG.get('defaultTenant') || 'default';
                let db = SERVICE.DefaultDatabaseConfigurationService.getTenantDatabase('default', defaultTenant);
                if (db && db.master) {
                    db.master.getConnection().collection('SchemaConfigurationModel').find({}, {}).toArray((err, result) => {
                        if (err) {
                            _self.LOG.error('Not able to fetch runtime schema update data');
                            reject(new CLASSES.NodicsError('ERR_DBS_00000', 'Not able to fetch runtime schema update data'));
                        } else {
                            resolve(result);
                        }
                    });
                } else {
                    reject(new CLASSES.NodicsError('ERR_DBS_00000', 'Invalid database connection'));
                }
            } catch (error) {
                reject(new CLASSES.NodicsError(error, 'MongoDB default connection error', 'ERR_DBS_00000'));
            }
        });
    },

    /**
     * Closes a MongoDB client connection.
     *
     * @param {Object} connection Nodics database wrapper with a Mongo client.
     * @returns {undefined}
     * @sideEffects Closes the underlying Mongo client.
     */
    closeConnection: function (connection) {
        return connection.getClient().close();
    }
};
