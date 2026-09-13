/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const config = require('./modules/nConfig');
const util = require('util');

/**
 * @module nodics.foundation/modules/NodicsFramework
 * @description Coordinates Nodics runtime initialization, layered mandatory bootstrap hooks, server startup, generators, clean, and build lifecycles for the active module hierarchy.
 * @layer module
 * @owner nodics.foundation
 * @override Projects customize behavior through active-module metadata, configuration, scripts, services, and configured bootstrap reconcilers rather than modifying this coordinator.
 */
module.exports = {
    /**
     * Resolves caller-supplied startup options with safe local defaults.
     *
     * @param {object} [options] Startup options supplied by a customer server or tooling command.
     * @returns {object} Effective startup options with Nodics and customer homes populated.
     */
    resolveOptions: function (options) {
        return Object.assign({
            NODICS_HOME: process.cwd(),
            CUSTOM_HOME: process.cwd()
        }, options || {});
    },
    /**
    * This function is used to initiate module loading process. If there is any functionalities, required to be executed on module loading. 
    * defined it that with Promise way
    * @param {*} options 
    */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * This function is used to finalize module loading process. If there is any functionalities, required to be executed after module loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /** Initializes modules, entities, init data, bootstrap reconcilers, internal authentication, and enterprises. */
    initFramework: function (options) {
        return new Promise((resolve, reject) => {
            config.start(options).then(() => {
                return config.initUtilities(options);
            }).then(() => {
                return config.loadModules();
            }).then(() => {
                return config.initEntities();
            }).then(() => {
                return config.finalizeEntities();
            }).then(() => {
                return config.finalizeModules();
            }).then(() => {
                return SERVICE.DefaultScriptsHandlerService.executePostScripts();
            }).then(() => {
                return SERVICE.DefaultDataReleaseService.installStartupReleases({
                    tenant: CONFIG.get('defaultTenant') || 'default',
                    modules: NODICS.getActiveModules()
                });
            }).then(() => {
                return this.executeMandatoryBootstrapServices();
            }).then(() => {
                return new Promise((resolve, reject) => {
                    if (NODICS.isInitRequired()) {
                        if (!SERVICE.DefaultWorkflow2SchemaService ||
                            typeof SERVICE.DefaultWorkflow2SchemaService.buildWorkflow2SchemaAssociations !== 'function') {
                            this.LOG.warn('Workflow-schema association loading skipped; workflow association service is not active in this runtime');
                            resolve(true);
                            return;
                        }
                        this.LOG.debug('Updating schema and workflow association');
                        SERVICE.DefaultWorkflow2SchemaService.buildWorkflow2SchemaAssociations().then(done => {
                            resolve(true);
                        }).catch(error => {
                            reject(error);
                        });
                    } else {
                        resolve(true);
                    }
                });
            }).then(() => {
                const tenant = CONFIG.get('defaultTenant') || 'default';
                return SERVICE.DefaultInternalAuthenticationProviderService.fetchInternalAuthToken(tenant).then(issued => {
                    NODICS.addInternalAuthToken(tenant, issued.authToken);
                });
            }).then(() => {
                return SERVICE.DefaultEnterpriseHandlerService.buildEnterprises();
            }).then(() => {
                SERVICE.DefaultInternalAuthenticationProviderService.scheduleInternalAuthTokenRefresh();
                resolve(true);
            }).catch(error => {
                reject(error);
            });
        });
    },

    /**
     * Executes configured, layered, idempotent bootstrap reconcilers after init data is available.
     *
     * @returns {Promise<Array>} Reconciler results in configured order.
     * @sideEffects May create missing mandatory platform records through project-overridable services.
     */
    executeMandatoryBootstrapServices: function () {
        const serviceNames = this.getMandatoryBootstrapServiceNames();
        return serviceNames.reduce((promise, serviceName) => promise.then(results => {
            const service = SERVICE[serviceName];
            if (!service || typeof service.reconcile !== 'function') {
                throw new Error('Mandatory bootstrap service is not available: ' + serviceName);
            }
            return service.reconcile({
                tenant: CONFIG.get('defaultTenant') || 'default',
                modules: NODICS.getActiveModules(),
                source: 'startup'
            }).then(result => results.concat([result]));
        }), Promise.resolve([]));
    },

    /** Resolves enabled reconcilers from a merge-friendly ordered map with legacy array compatibility. */
    getMandatoryBootstrapServiceNames: function () {
        const configured = CONFIG.get('mandatoryBootstrapServices') || {};
        if (Array.isArray(configured)) return configured.filter(Boolean);
        return Object.keys(configured).map(key => Object.assign({ key: key }, configured[key] || {}))
            .filter(item => item.enabled !== false && item.service)
            .sort((left, right) => Number(left.order || 0) - Number(right.order || 0) || left.key.localeCompare(right.key))
            .map(item => item.service);
    },

    /**
     * Starts the selected runtime and resolves only after initialization and listeners complete.
     * On failure, close acquired resources through their existing lifecycle owners
     * before rejecting with the original startup error.
     * @param {Object} options Selected runtime options.
     * @returns {Promise<boolean>} Completed startup.
     */
    start: async function (options) {
        options = this.resolveOptions(options);
        try {
            await this.initFramework(options);
            await SERVICE.DefaultRouterService.startServers();
            NODICS.setEndTime(new Date());
            await SERVICE.DefaultRuntimeLifecycleService.markStarted({ reason: 'startup' });
            if (CONFIG.get('activateNodePing')) {
                SERVICE.DefaultNodeManagerService.notifyNodeStarted().then(() => {
                    SERVICE.DefaultNodeManagerService.checkActiveNodes();
                }).catch(error => NODICS.LOG.error('Failed to notify nodes about runtime startup', error));
            }
            NODICS.LOG.info('Nodics started successfully in (', NODICS.getStartDuration(), ') ms \n');
            return true;
        } catch (error) {
            const lifecycle = typeof SERVICE !== 'undefined' && SERVICE.DefaultRuntimeLifecycleService;
            if (lifecycle && typeof lifecycle.requestShutdown === 'function') {
                try {
                    if (NODICS.getServerState() !== 'failed' && NODICS.getServerState() !== 'stopped') lifecycle.transition('failed');
                    await lifecycle.requestShutdown({ reason: 'startup-failure' });
                } catch (cleanupError) {
                    lifecycle.logError(cleanupError);
                }
            }
            throw error;
        }
    },

    /** Runs the legacy application generator through the layered infrastructure service. */
    genApp: function (options) {
        options = this.resolveOptions(options);
        config.start(options).then(() => {
            return config.initUtilities(options);
        }).then(() => {
            return config.loadModules();
        }).then(() => {
            return SERVICE.DefaultInfraService.generateApp(options);
        }).catch(error => {
            console.error(error);
        });
    },

    /** Runs the module-group generator using active default options. */
    genGroup: function (options) {
        options = this.resolveOptions(options);
        config.start(options).then(() => {
            return config.initUtilities(options);
        }).then(() => {
            return config.loadModules();
        }).then(() => {
            return SERVICE.DefaultInfraService.generateModuleGroup(options);
        }).catch(error => {
            console.error(error);
        });
    },

    /** Runs the backend module generator using active default options. */
    genModule: function (options) {
        options = this.resolveOptions(options);
        config.start(options).then(() => {
            return config.initUtilities(options);
        }).then(() => {
            return config.loadModules();
        }).then(() => {
            return SERVICE.DefaultInfraService.generateModule(options);
        }).catch(error => {
            console.error(error);
        });
    },
    /** Runs the optional React-client module generator through the infrastructure extension point. */
    genReactModule: function (options) {
        options = this.resolveOptions(options);
        config.start(options).then(() => {
            return config.initUtilities(options);
        }).then(() => {
            return config.loadModules();
        }).then(() => {
            return SERVICE.DefaultInfraService.generateReactModule(options);
        }).catch(error => {
            console.error(error);
        });
    },

    /** Runs the optional Vue-client module generator through the infrastructure extension point. */
    genVueModule: function (options) {
        options = this.resolveOptions(options);
        config.start(options).then(() => {
            return config.initUtilities(options);
        }).then(() => {
            return config.loadModules();
        }).then(() => {
            return SERVICE.DefaultInfraService.generateVueModule(options);
        }).catch(error => {
            console.error(error);
        });
    },

    /** Cleans generated artifacts for every active module through the standard clean lifecycle. */
    cleanAll: function (options) {
        options = this.resolveOptions(options);
        return config.prepareClean(options).then(() => {
            return config.initUtilities(options);
        }).then(() => {
            return config.cleanModules();
        }).catch(error => {
            console.error(error);
            throw error;
        });
    },

    /** Recreates generated framework artifacts from active layered source definitions. */
    buildAll: function (options) {
        options = this.resolveOptions(options);
        return config.prepareBuild(options).then(() => {
            return config.initUtilities(options);
        }).then(() => {
            return config.loadModules();
        }).then(() => {
            return new Promise((resolve, reject) => {
                SERVICE.DefaultStatusService.loadStatusDefinitions();
                resolve(true);
            });
        }).then(() => {
            return new Promise((resolve, reject) => {
                SERVICE.DefaultDatabaseConfigurationService.setRawSchema(SERVICE.DefaultFilesLoaderService.loadSchemaFiles('/src/schemas/schemas.js', null));
                resolve(true);
            });
        }).then(() => {
            return (async () => {
                const defaultTenant = CONFIG.get('defaultTenant') || 'default';
                let originalError;
                try {
                    await SERVICE.DefaultDatabaseConnectionHandlerService.createDatabaseConnection(defaultTenant, true);
                    const runtimeSchema = await SERVICE.DefaultDatabaseConnectionHandlerService.getRuntimeSchema();
                    SERVICE.DefaultDatabaseConfigurationService.setRawSchema(SERVICE.DefaultFilesLoaderService.mergeRuntimeSchemaFiles(
                        SERVICE.DefaultDatabaseConfigurationService.getRawSchema(), runtimeSchema));
                } catch (error) {
                    originalError = error;
                    throw error;
                } finally {
                    try { await SERVICE.DefaultDatabaseConnectionHandlerService.closeConnection('default', defaultTenant); }
                    catch (cleanupError) { if (!originalError) throw cleanupError; else console.error('Build connection cleanup failed', cleanupError); }
                }
                return true;
            })();
        }).then(() => {
            return SERVICE.DefaultDatabaseSchemaHandlerService.buildDatabaseSchema(SERVICE.DefaultDatabaseConfigurationService.getRawSchema());
        }).then(() => {
            return config.buildModules();
        }).catch(error => {
            console.error(error);
            throw error;
        });
    }
};
