/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const _ = require('lodash');

/**
 * @module service/module/DefaultModulesConfigurationService
 * @description Owns the process-level registry of effective module, server, and
 * node topology configuration used for internal routing. Registry preparation is
 * atomic so invalid replacement configuration cannot expose partial state.
 * @layer service
 * @owner nService
 * @override Later modules may override normalization, descriptor creation, or
 * registry operations while preserving module lookup and availability semantics.
 */
module.exports = {

    /** Active module topology descriptors keyed by module name. */
    modules: {},

    /**
     * Normalizes one layered server configuration without mutating CONFIG state.
     *
     * @param {Object} moduleConfig Module-specific server configuration.
     * @param {Object} defaultOptions Shared server options.
     * @returns {Object} Normalized independent configuration.
     */
    normalizeModuleConfiguration: function (moduleConfig, defaultOptions) {
        let normalized = _.merge({}, moduleConfig);
        normalized.options = normalized.options || defaultOptions || {};
        normalized.abstractEndpoint = normalized.abstractEndpoint || normalized.endpoint;
        if (UTILS.isBlank(normalized.nodes)) {
            normalized.nodes = {
                node0: normalized.endpoint
            };
        }
        return normalized;
    },

    /**
     * Creates one module topology descriptor from normalized configuration.
     *
     * @param {string} moduleName Logical module name.
     * @param {Object} moduleConfig Module-specific server configuration.
     * @param {Object} defaultOptions Shared server options.
     * @returns {Object} Prepared `ModuleConfiguration` descriptor.
     */
    createModuleConfiguration: function (moduleName, moduleConfig, defaultOptions) {
        if (!moduleConfig || !moduleConfig.endpoint) {
            throw new Error('Invalid endpoint configuration for module : ' + moduleName);
        }
        let normalized = this.normalizeModuleConfiguration(moduleConfig, defaultOptions);
        let moduleObject = new CLASSES.ModuleConfiguration(moduleName);
        moduleObject.addEndpoint(normalized.endpoint);
        moduleObject.addOptions(normalized.options);
        moduleObject.addAbstractEndpoint(normalized.abstractEndpoint);
        _.each(normalized.nodes, (nodeConfig, nodeName) => {
            moduleObject.addNode(nodeName, nodeConfig);
        });
        return moduleObject;
    },

    /**
     * Atomically rebuilds the effective module topology registry from CONFIG.
     *
     * @returns {Object} Newly activated module registry.
     * @throws {Error} When any contributed module configuration is invalid.
     */
    prepareModulesConfiguration: function () {
        let servers = CONFIG.get('servers') || {};
        let preparedModules = {};
        _.each(servers, (moduleConfig, moduleName) => {
            if (moduleName !== 'options') {
                this.LOG.debug('Adding module configuration for : ' + moduleName);
                preparedModules[moduleName] = this.createModuleConfiguration(
                    moduleName,
                    moduleConfig,
                    servers.options
                );
            }
        });
        this.modules = preparedModules;
        return this.modules;
    },

    /**
     * Adds or replaces one module descriptor in the active registry.
     *
     * @param {string} moduleName Logical module name.
     * @param {Object} moduleConfig Module-specific server configuration.
     * @returns {Object} Added module descriptor.
     */
    addModule: function (moduleName, moduleConfig) {
        let descriptor = this.createModuleConfiguration(
            moduleName,
            moduleConfig,
            (CONFIG.get('servers') || {}).options
        );
        this.modules[moduleName] = descriptor;
        return descriptor;
    },

    /**
     * Returns all active module descriptors.
     *
     * @returns {Object} Module registry.
     */
    getModules: function () {
        return this.modules;
    },

    /**
     * Returns one active module descriptor.
     *
     * @param {string} moduleName Logical module name.
     * @returns {Object} Module descriptor.
     * @throws {Error} When the requested module is unavailable.
     */
    getModule: function (moduleName) {
        if (!this.modules[moduleName]) {
            throw new Error('Invalid module name : ' + moduleName + ' Please validate your entry');
        }
        return this.modules[moduleName];
    },

    /**
     * Determines whether a module descriptor is active.
     *
     * @param {string} moduleName Logical module name.
     * @returns {boolean} True when configuration is available.
     */
    isAvailableModuleConfig: function (moduleName) {
        return Boolean(this.modules[moduleName]);
    },

    /**
     * Removes one module descriptor from the active registry.
     *
     * @param {string} moduleName Logical module name.
     * @returns {boolean} True when a descriptor was removed.
     */
    removeModule: function (moduleName) {
        if (!this.modules[moduleName]) return false;
        delete this.modules[moduleName];
        return true;
    }
};
