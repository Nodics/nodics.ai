/*
    Nodics - Enterprice Micro-Services Management Framework
    Copyright (c) 2026 Nodics All rights reserved.
    Governed by the root LICENSE file or a separate written agreement with Nodics.
 */
'use strict';

const utils = require('../utils/utils');

/**
 * @module config/service/defaultActiveModuleGraphService
 * @description Resolves canonical activation and direct selection provenance from supplied properties and module descriptors without loading or registering modules.
 * @layer service
 * @owner nConfig
 * @override Supply the canonical source resolver and identity normalizer; preserve activation gates, parent boundaries and dependency encounter order. Index sorting remains the initializer's existing phase.
 */
module.exports = {
    /** Resolves one immutable graph snapshot. No globals, discovery, configuration loading or descriptor mutation.
     * @param {Object} input Effective properties; serverName/rootName/nodeName and projectName/projectPath boundaries; resolveModule(name) and optional normalizeModuleIdentity(name).
     * @returns {{modules:string[], explicitModules:string[], explicitGroups:string[]}} Deduplicated canonical names without selectors. Explicit lists record only direct intent, never transitive group/dependency membership.
     * @throws {Error} Missing descriptors, invalid selections and extends/requiredModules/parent cycles propagate to the caller.
     */
    resolve: function (input) {
        if (!input || typeof input.resolveModule !== 'function') throw new Error('Active module graph requires a module resolver');
        const properties = input.properties || {}, normalize = input.normalizeModuleIdentity || (name => name);
        const fail = message => { throw new Error('Invalid Nodics configuration: ' + message); };
        const identity = name => {
            const value = normalize(name);
            if (typeof value !== 'string' || !value || value.trim() !== value || value.includes(':')) fail('invalid module identity: ' + value);
            return value;
        };
        const descriptors = new Map();
        const source = name => {
            name = identity(name);
            if (!descriptors.has(name)) {
                const descriptor = input.resolveModule(name);
                if (!descriptor || !descriptor.metaData) fail('references unknown module: ' + name);
                descriptors.set(name, descriptor);
            }
            return descriptors.get(name);
        };
        const append = (list, name) => { if (!list.includes(name)) list.push(name); };
        const selection = value => {
            if (typeof value !== 'string') fail('activeModules.groups requires module names');
            const parts = value.split(':');
            if (parts.length > 2 || (parts.length === 2 && !parts[1])) fail('invalid group selector: ' + value);
            return { name: identity(parts[0]), selector: parts[1] };
        };
        const configured = properties.activeModules || {};
        for (const key of ['groups', 'modules']) if (configured[key] !== undefined && !Array.isArray(configured[key])) fail('activeModules.' + key + ' must be an array');
        const modules = [], explicitModules = [], explicitGroups = [], groups = [], selectedGroups = [];
        const metadata = name => utils.getNodicsMetadata(source(name).metaData);
        const parents = name => {
            const declared = metadata(name).extends || [];
            return (Array.isArray(declared) ? declared : [declared]).filter(Boolean).map(identity);
        };
        const visitGroups = (name, visiting = []) => {
            name = identity(name);
            if (visiting.includes(name)) fail('circular module extends hierarchy: ' + visiting.concat(name).join(' -> '));
            parents(name).forEach(parent => visitGroups(parent, visiting.concat(name)));
            if (metadata(name).kind === 'group') append(groups, name);
        };
        const server = identity(input.serverName);
        visitGroups(server);
        parents(server).forEach(name => { if (metadata(name).kind === 'group') append(explicitGroups, name); });
        (configured.groups || []).forEach(value => {
            const selected = selection(value);
            visitGroups(selected.name);
            append(explicitGroups, selected.name);
            selectedGroups.push(selected);
        });
        const publishEnabled = properties.runtimeRole?.publication
            ? properties.runtimeRole.publication === 'STAGED' : properties.publishEnabled;
        const admit = (name, explicit = false) => {
            name = identity(name);
            if (modules.includes(name)) return;
            const descriptor = source(name), meta = metadata(name);
            if (name === (properties.dynamoModuleName || 'dynamo') && !properties.dynamoEnabled) return;
            if ((explicit && meta.runtimeModule !== false && meta.loadableByNodicsModuleLoader !== false) ||
                (utils.isPublishModule(descriptor.metaData) && publishEnabled) || utils.isAlwaysLoadableModule(descriptor.metaData)) modules.push(name);
        };
        groups.forEach(name => {
            admit(name);
            selectedGroups.filter(item => item.name === name && item.selector).forEach(item => {
                const children = source(name).metaData[item.selector];
                if (children === undefined) return;
                if (!Array.isArray(children)) fail('group selector must be an array: ' + name + ':' + item.selector);
                children.forEach(child => admit(child, true));
            });
        });
        [input.rootName, server, input.nodeName].filter(Boolean).forEach(name => admit(name, true));
        (configured.modules || []).forEach(name => admit(name, true));
        [server, input.nodeName, ...(configured.modules || [])].filter(Boolean).forEach(name => append(explicitModules, identity(name)));

        // Preserve startup's parent boundary and required-before-parent encounter order.
        // Hierarchies are invocation-local, replacing the old mutation of raw parentModules caches.
        const hierarchies = new Map();
        const hierarchy = (name, visiting = []) => {
            name = identity(name);
            if (visiting.includes(name)) fail('circular module parent hierarchy: ' + visiting.concat(name).join(' -> '));
            if (hierarchies.has(name)) return hierarchies.get(name);
            const descriptor = source(name);
            let result;
            if (!descriptor.parent) result = [name];
            else if (name === input.projectName || (input.projectPath && descriptor.path && input.projectPath.includes(descriptor.path))) result = [];
            else result = [name, ...hierarchy(descriptor.parent, visiting.concat(name))];
            hierarchies.set(name, result);
            return result;
        };
        modules.forEach(name => hierarchy(name));
        const dependencies = [];
        const required = (name, visiting = []) => {
            name = identity(name);
            if (visiting.includes(name)) fail('Circular requiredModules dependency: ' + visiting.concat(name).join(' -> '));
            const declared = source(name).metaData.requiredModules || [];
            if (!Array.isArray(declared)) fail('requiredModules must be an array: ' + name);
            declared.forEach(value => {
                const dependency = identity(value);
                append(dependencies, dependency);
                required(dependency, visiting.concat(name));
            });
        };
        modules.forEach(name => {
            required(name);
            const lineage = hierarchy(name);
            lineage.filter(parent => parent !== name).forEach(parent => append(dependencies, parent));
        });
        // Dependencies discovered outside selected roots need their owning parent
        // chain too. Traverse the growing closure without implicitly selecting siblings.
        for (let i = 0; i < dependencies.length; i++) {
            const name = dependencies[i];
            hierarchy(name).filter(parent => parent !== name).forEach(parent => {
                const descriptor = source(parent);
                if (parent === (properties.dynamoModuleName || 'dynamo') && !properties.dynamoEnabled) return;
                if (utils.isAlwaysLoadableModule(descriptor.metaData) ||
                    (utils.isPublishModule(descriptor.metaData) && publishEnabled)) append(dependencies, parent);
            });
        }
        dependencies.forEach(name => append(modules, name));
        return { modules, explicitModules, explicitGroups };
    }
};
