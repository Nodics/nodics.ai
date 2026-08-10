/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module backoffice/service/registry/DefaultBackofficeCapabilityRegistryService
 * @description Builds the effective, authorized BackOffice capability catalogue from active module leases without becoming capability or runtime authority.
 * @layer service
 * @owner backoffice
 * @override Projects may extend projection policy while preserving concrete-module ownership, validation, deduplication, authorization, and runtime gating.
 */
module.exports = {
    /** Initializes the capability registry. */
    init: function () { return Promise.resolve(true); },
    /** Completes capability-registry initialization. */
    postInit: function () { return Promise.resolve(true); },

    /** Selects one deterministic contribution and rejects inconsistent providers for the same module. */
    selectMetadata: function (moduleName, instances) {
        let contributions = (instances || []).map(instance => instance.backoffice)
            .filter(metadata => metadata && metadata.enabled !== false);
        if (contributions.length === 0) return undefined;
        let canonical = JSON.stringify(contributions[0]);
        if (contributions.some(metadata => JSON.stringify(metadata) !== canonical)) {
            throw new CLASSES.NodicsError('ERR_BOF_00000',
                'Inconsistent BackOffice capability providers for module ' + moduleName);
        }
        // Registration is the fail-closed contract-validation boundary. Re-validating
        // projected leases here would create a second, potentially divergent authority.
        return contributions[0];
    },

    /** Permission-filters one navigation tree and removes newly orphaned descendants. */
    authorizeNavigation: function (navigation, permissions) {
        let authorizedItems = (navigation || []).filter(item => {
            let required = [].concat(item.requiredPermissions || []);
            return item.featureState !== 'HIDDEN' &&
                (permissions.includes('*') || required.every(permission => permissions.includes(permission)));
        }).map(item => {
            if (!Array.isArray(item.lifecycleActions)) return item;
            return Object.assign({}, item, { lifecycleActions: item.lifecycleActions.filter(action =>
                action.featureState !== 'HIDDEN' && (permissions.includes('*') ||
                Boolean(action.permission && permissions.includes(action.permission)))) });
        });
        let ids = new Set(authorizedItems.map(item => item.id));
        let changed = true;
        while (changed) {
            changed = false;
            authorizedItems = authorizedItems.filter(item => {
                if (!item.parentId || item.parentModuleName || ids.has(item.parentId)) return true;
                ids.delete(item.id);
                changed = true;
                return false;
            });
        }
        return authorizedItems;
    },

    /** Aggregates active module-owned capability leases into one authorized deterministic catalogue. */
    buildCatalogue: function (modules, clientContractVersion, authData) {
        let catalogue = {};
        let permissions = (authData && authData.permissions) || [];
        Object.keys(modules || {}).sort().forEach(moduleName => {
            let instances = modules[moduleName];
            let metadata = this.selectMetadata(moduleName, instances);
            if (!metadata) return;
            let snapshot = SERVICE.DefaultBackofficeDiscoveryService &&
                SERVICE.DefaultBackofficeDiscoveryService.getSnapshot(moduleName);
            let authorizedMetadata = Object.assign({}, metadata);
            if (Array.isArray(metadata.navigation)) {
                authorizedMetadata.navigation = this.authorizeNavigation(metadata.navigation, permissions);
            }
            catalogue[moduleName] = Object.assign(authorizedMetadata, {
                moduleName: moduleName,
                activeModuleLeases: instances.length,
                compatibility: SERVICE.DefaultBackofficeRegistryService.evaluateCompatibility(
                    metadata, clientContractVersion),
                contract: snapshot
            });
        });
        this.removeCrossModuleOrphans(catalogue);
        this.validateUniqueNavigation(catalogue);
        return catalogue;
    },

    /** Removes governed technical modules whose functional module is not registered and active. */
    applyFunctionalModuleEligibility: function (modules, eligibility) {
        if (!eligibility) return modules;
        let governed = new Set(eligibility.governedModules || []);
        let eligible = new Set(eligibility.eligibleModules || []);
        return Object.keys(modules || {}).reduce((result, moduleName) => {
            if (!governed.has(moduleName) || eligible.has(moduleName)) result[moduleName] = modules[moduleName];
            return result;
        }, {});
    },

    /** Removes descendants whose explicitly external parent is not in the effective catalogue. */
    removeCrossModuleOrphans: function (catalogue) {
        let changed = true;
        while (changed) {
            changed = false;
            let keys = new Set();
            Object.entries(catalogue).forEach(([moduleName, metadata]) =>
                (metadata.navigation || []).forEach(item => keys.add(moduleName + ':' + item.id)));
            Object.entries(catalogue).forEach(([moduleName, metadata]) => {
                if (!Array.isArray(metadata.navigation)) return;
                let filtered = metadata.navigation.filter(item => !item.parentId || !item.parentModuleName ||
                    keys.has(item.parentModuleName + ':' + item.parentId));
                if (filtered.length !== metadata.navigation.length) {
                    catalogue[moduleName] = Object.assign({}, metadata, { navigation: filtered });
                    changed = true;
                }
            });
        }
    },

    /** Rejects ambiguous effective navigation identities across concrete module providers. */
    validateUniqueNavigation: function (catalogue) {
        let owners = new Map();
        Object.entries(catalogue).forEach(([moduleName, metadata]) =>
            (metadata.navigation || []).forEach(item => {
                if (owners.has(item.id)) {
                    throw new CLASSES.NodicsError('ERR_BOF_00000',
                        'Duplicate BackOffice navigation id ' + item.id + ' from ' +
                        owners.get(item.id) + ' and ' + moduleName);
                }
                owners.set(item.id, moduleName);
            }));
        return true;
    }
};
