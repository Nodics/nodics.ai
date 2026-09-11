/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module nService/service/module/DefaultBackofficeCapabilityDataService
 * @description Builds BackOffice capability metadata from module-owned data records while preserving registration as the activation gate.
 * @layer service
 * @owner nService
 * @override Projects may override this builder to add safe metadata fields while keeping Axis renderer-only and provider registration authoritative.
 */
module.exports = {
    /** Initializes the shared data-backed capability builder. */
    init: function () { return Promise.resolve(true); },
    /** Completes shared capability data builder initialization. */
    postInit: function () { return Promise.resolve(true); },

    /** Returns a deep-cloned plain value so capability data cannot leak mutable module state. */
    clone: function (value) {
        return JSON.parse(JSON.stringify(value));
    },

    /** Returns the effective BackOffice capability definition service. */
    definitions: function () {
        if (typeof SERVICE === 'undefined' || !SERVICE.DefaultBackofficeCapabilityDefinitionService) {
            throw new Error('BackOffice capability definition service is not available');
        }
        return SERVICE.DefaultBackofficeCapabilityDefinitionService;
    },

    /** Merges default and entry-specific workbench presentation hints. */
    presentation: function (defaults, entry) {
        return Object.assign({}, defaults || {}, entry.presentation || {});
    },

    /** Returns true when a navigation entry already uses the public BackOffice navigation contract. */
    isNormalizedNavigationItem: function (entry) {
        return Boolean(entry && entry.workbenchTarget && Array.isArray(entry.requiredPermissions));
    },

    /** Builds one Axis navigation item from declarative module-owned capability data. */
    navigationItem: function (data, entry) {
        let defaults = data.defaults || {};
        let base = Object.assign({}, entry, {
            icon: defaults.icon,
            permission: entry.permission || defaults.permission,
            group: entry.group || defaults.group,
            perspectives: entry.perspectives || defaults.perspectives,
            contexts: entry.contexts || defaults.contexts,
            featureState: entry.featureState || defaults.featureState,
            presentation: this.presentation(defaults.presentation, entry)
        });
        if (entry.backendWorkspace && entry.backendWorkspace.renderer === 'axis.workspace.native') {
            return this.definitions().nativeWorkspace(base);
        }
        if (this.isNormalizedNavigationItem(entry)) {
            delete base.presentation;
            return this.clone(base);
        }
        delete base.presentationDefaults;
        if (!base.workbenchTarget && base.moduleName && base.schemaName) {
            return this.definitions().workbench(base);
        }
        if (base.workbenchTarget && !base.moduleName) {
            base.moduleName = base.workbenchTarget.moduleName;
        }
        if (base.workbenchTarget && !base.schemaName) {
            base.schemaName = base.workbenchTarget.schemaName;
        }
        if (base.workbenchTarget && base.moduleName && base.schemaName) {
            return this.definitions().workbench(base);
        }
        return this.clone(base);
    },

    /** Builds every navigation item declared by module-owned BackOffice capability data. */
    navigation: function (data) {
        return (data.navigation || []).map(entry => this.navigationItem(data, entry));
    },

    /** Builds a BackOffice capability envelope from declarative module-owned data. */
    capability: function (data) {
        if (!data || typeof data !== 'object' || Array.isArray(data) || !data.capability) {
            throw new Error('BackOffice capability data contract is invalid');
        }
        let capabilityData = this.clone(data.capability);
        let capability = this.definitions().capability(Object.assign({}, capabilityData, {
            navigation: this.navigation(data)
        }));
        ['requiredPermissions', 'discovery', 'uiComposition', 'documentationSources'].forEach(key => {
            if (capabilityData[key] !== undefined) capability[key] = this.clone(capabilityData[key]);
        });
        return capability;
    }
};
