/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";

let runtimePlacements = [];

/**
 * @module config/service/defaultDeploymentModuleOwnershipService
 * @description Derives functional placement from canonical activation graphs; keeps no registry or authored owner catalogue.
 * @layer service
 * @owner config
 */
module.exports = {
  /** Returns detached non-secret placements from the last successful local graph derivation. */
  runtimePlacements: function () { return structuredClone(runtimePlacements); },

  /** Computes one owner per publication context from resolved runtime graphs.
   * @param {Object[]} runtimes Canonical graphs with server, publication, modules, explicitModules and explicitGroups.
   * @param {Function} resolveModule Trusted installed-source resolver.
   * @returns {Object[]} Derived module/publication/server assignments.
   * @throws {Error} When source, context or ownership is ambiguous.
   */
  plan: function (runtimes, resolveModule) {
    const claims = new Map();
    const contains = (source, group) => {
      const seen = new Set();
      while (source) {
        if (source.name === group) return true;
        if (seen.has(source.name)) throw new Error("Cyclic module containment: " + source.name);
        seen.add(source.name);
        source = source.parent ? resolveModule(source.parent) : undefined;
      }
      return false;
    };
    for (const runtime of runtimes) {
      if (!runtime.projectCode || !runtime.environment || !runtime.server || !["STAGED", "ONLINE", "OPERATIONAL"].includes(runtime.publication) || !Array.isArray(runtime.modules))
        throw new Error("Functional ownership requires a resolved runtime and publication context");
      const explicit = new Set(runtime.explicitModules || []);
      const groups = runtime.explicitGroups || [];
      const remote = new Set(runtime.remoteModules || []);
      for (const moduleName of runtime.modules) {
        const source = resolveModule(moduleName, runtime);
        if (!source?.metaData?.nodics) throw new Error("Missing installed ownership source: " + moduleName);
        const metadata = source.metaData.nodics, scope = metadata.runtime?.ownership || "functional";
        if (!["functional", "runtimeLocal", "sourceOnly"].includes(scope)) throw new Error("Invalid ownership scope: " + moduleName);
        if (scope === "sourceOnly" && metadata.runtime?.router === true)
          throw new Error("Source-only helper cannot expose callable authority: " + moduleName);
        if (scope !== "functional" || remote.has(moduleName)) continue;
        // Source-only helpers and runtime mechanics are explicitly classified by
        // their owner; functional HTTP, persistence and service authority remains unique.
        if (metadata.runtime?.router !== true && metadata.runtime?.ownership !== "functional") continue;
        const key = JSON.stringify([runtime.projectCode, runtime.environment, moduleName, runtime.publication]);
        if (!claims.has(key)) claims.set(key, { projectCode: runtime.projectCode, environment: runtime.environment, moduleName, publication: runtime.publication, demanded: new Set(), direct: new Set(), grouped: new Set() });
        const claim = claims.get(key);
        claim.demanded.add(runtime.server);
        if (explicit.has(moduleName)) claim.direct.add(runtime.server);
        else if (groups.some(group => contains(source, group))) claim.grouped.add(runtime.server);
      }
    }
    return [...claims.values()].map(claim => {
      const candidates = claim.direct.size ? claim.direct : claim.grouped.size ? claim.grouped : claim.demanded;
      if (candidates.size !== 1) throw new Error("Ambiguous functional owner for " + claim.moduleName + "/" + claim.publication +
        ": " + [...candidates].sort().join(", ") + "; select the capability in one runtime only");
      return { projectCode: claim.projectCode, environment: claim.environment, moduleName: claim.moduleName, publication: claim.publication, server: [...candidates][0] };
    });
  },
  /** Projects sibling activation selections using the shared loader graph and derives remote dependencies.
   * @param {Object} properties Current effective configuration.
   * @param {Object} context Canonical nConfig deployment binding context.
   * @param {Object} initializer Existing initializer property/source helpers.
   * @returns {Object} Effective configuration with source-derived remote module endpoints.
   * @throws {Error} For ambiguous ownership, missing sources or missing selected owner endpoints.
   */
  derive: function (properties, context, initializer) {
    runtimePlacements = [];
    const fs = require("node:fs"), path = require("node:path");
    if (!context.roots.project || !context.roots.framework || !context.serverCode) return properties;
    const servers = initializer.discoverDeploymentServers(context).filter(server => server.metadata.nodics.runtimeTooling?.enabled !== false);
    if (!servers.length) return properties;
    const utils = require("../utils/utils"), bindings = require("./defaultConfigurationBindingService");
    const graph = require("./defaultActiveModuleGraphService");
    const records = [], modules = Object.create(null);
    const environmentRoot = fs.realpathSync(context.roots.environment), projectRoot = fs.realpathSync(context.roots.project);
    for (const root of [...new Set([context.roots.framework, context.roots.project].map(value => fs.realpathSync(value)))]) {
      utils.collectModuleRecords(root, records, null, { root, visited: new Set(), directories: 0, depth: 0 });
    }
    utils.indexModuleRecords(records, modules);
    const resolve = (name, runtime) => {
      const candidates = Object.values(modules).filter(source => source.name === name);
      if (candidates.length === 1) return candidates[0];
      const selected = runtime && candidates.filter(source => source.path === path.join(environmentRoot, runtime.server) ||
        runtime.nodeName === name && source.parent === runtime.server &&
        source.path.startsWith(path.join(environmentRoot, runtime.server) + path.sep));
      if (selected?.length === 1) return selected[0];
      throw new Error("Missing or ambiguous installed activation source: " + name);
    };
    const defaults = require("../../config/properties");
    const runtimes = servers.flatMap(server => {
      // A nested package selected as a loader root has no enclosing runtime parent.
      const rootPaths = new Set((server.metadata.nodics.runtimeModuleRoots || server.metadata.nodics.extends || [])
        .map(root => path.resolve(context.roots.framework, root)));
      const nodeNames = Object.values(modules).filter(source => source.metaData.nodics?.kind === "node" &&
        source.metaData.nodics.retired !== true && source.metaData.nodics.runtimeTooling?.enabled !== false &&
        source.parent === server.code && source.path.startsWith(path.join(environmentRoot, server.code) + path.sep))
        .map(source => source.name);
      return [undefined, ...nodeNames].map(nodeName => {
        const read = (key, fallback) => {
          try { return initializer.readRuntimeProperty(context, server.code, [key], nodeName); }
          catch (error) {
            if (error.message !== "Configuration reference is unavailable: " + key) throw error;
            return fallback;
          }
        };
        // Both local and peer intent come from the same authored layers. Derived
        // endpoint flags must never feed back into functional owner selection.
        const activeModules = read("activeModules", {}), endpoints = read("servers", {});
        const role = read("runtimeRole", {}), aliases = read("moduleIdentityAliases", defaults.moduleIdentityAliases || {});
        const runtime = { projectCode: context.projectCode, environment: context.environmentCode,
          server: server.code, publication: role.publication, nodeName };
        const selection = graph.resolve({ properties: { ...defaults, activeModules,
          dynamoEnabled: read("dynamoEnabled", defaults.dynamoEnabled),
          publishEnabled: role.publication === "STAGED", runtimeRole: role },
          serverName: server.code, rootName: context.environmentCode, nodeName,
          projectName: context.projectCode, projectPath: projectRoot,
          resolveModule: name => {
            const source = resolve(name, runtime);
            return rootPaths.has(source.path) ? { ...source, parent: null } : source;
          }, normalizeModuleIdentity: name => aliases[name] || name });
        const identity = bindings.merge(server.metadata.nodics.runtimeIdentity || {}, read("runtimeIdentity", {}));
        return { ...runtime, ...selection, identity, remoteModules: Object.entries(endpoints || {})
          .filter(([, options]) => options?.remoteOnly === true).map(([name]) => name) };
      });
    });
    const assignments = this.plan(runtimes, resolve);
    const current = runtimes.find(runtime => runtime.server === context.serverCode && runtime.nodeName === (context.nodeCode || undefined));
    if (!current) throw new Error("Selected runtime is not an enabled deployment owner");
    const derived = { servers: {} };
    for (const assignment of assignments) {
      if (assignment.publication !== current.publication || !current.modules.includes(assignment.moduleName)) continue;
      const remote = assignment.server !== current.server;
      if (!remote) {
        const endpoint = properties.servers?.default?.abstractEndpoint || properties.servers?.default?.endpoint;
        if (!endpoint) throw new Error("Selected local owner has no endpoint: " + current.server);
        derived.servers[assignment.moduleName] = { endpoint, remoteOnly: false };
        continue;
      }
      const destination = initializer.readRuntimeProperty(context, assignment.server, ["servers", "default"]);
      const endpoint = destination?.abstractEndpoint || destination?.endpoint;
      if (!endpoint) throw new Error("Selected functional owner has no endpoint: " + assignment.server);
      derived.servers[assignment.moduleName] = { endpoint, remoteOnly: true };
    }
    // Deployment endpoint/protocol overrides remain effective. Ownership itself
    // is derived from activation intent and cannot be reversed by an endpoint flag.
    const result = bindings.merge(derived, properties);
    for (const [name, owner] of Object.entries(derived.servers)) result.servers[name].remoteOnly = owner.remoteOnly;
    // Publish a projection of the very same installed activation graph. Identity metadata
    // selects a placement; Profile separately authenticates the installation principal.
    runtimePlacements = runtimes.filter(runtime => runtime.identity.instanceCode).map(runtime => ({
      projectCode: runtime.projectCode, environmentCode: runtime.environment, serverCode: runtime.server,
      instanceCode: runtime.identity.instanceCode,
      modules: [...new Set([...runtime.modules, ...(runtime.identity.remoteModules || [])])],
    }));
    return result;
  },
};
