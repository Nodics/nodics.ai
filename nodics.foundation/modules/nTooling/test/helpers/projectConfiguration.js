/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module nTooling/test/helpers/projectConfiguration @description Serial test-only configuration consumers, delegated to existing capability owners without runtime startup. @owner nTooling @layer test */
const path = require("node:path");
const { createRequire } = require("node:module");

/** Binds an explicit customer or isolated fixture root; no project identity or environment defaults. */
function createProjectConfigurationTestHarness({ projectRoot, frameworkRoot = path.resolve(__dirname, "../../../../..") } = {}) {
  if (typeof projectRoot !== 'string' || !path.isAbsolute(projectRoot))
    throw new Error('An absolute projectRoot is required');
  const frameworkRequire = createRequire(
    path.join(frameworkRoot, "nodics.foundation/package.json"),
  );
  const merge = frameworkRequire("lodash/merge");

  const runtimeGraphs = new WeakMap();

  /** Evaluate an existing pure configuration consumer with isolated test globals. */
  function consume(properties, modulePath, operation) {
    const previousConfig = global.CONFIG;
    const previousLodash = global._;
    try {
      global.CONFIG = { get: (key) => properties[key] };
      global._ = frameworkRequire("lodash");
      return operation(require(path.join(frameworkRoot, modulePath)));
    } finally {
      global.CONFIG = previousConfig;
      global._ = previousLodash;
    }
  }

  return {
    /** Resolve the selected reset inventories through the existing System owner. */
    resetPolicy: (properties) => consume(properties, 'nodics.foundation/modules/nSystem/src/service/operations/defaultLocalResetProviderService', service => service.policy()),
    /** Resolve effective module endpoints through nService without starting any client. */
    moduleConfiguration: (properties, name) => consume(properties, 'nodics.foundation/modules/nService/src/service/module/defaultModulesConfigurationService', service => {
      const previousUtils = global.UTILS;
      try { global.UTILS = {isBlank: value => !value || !Object.keys(value).length}; return service.normalizeModuleConfiguration(properties.servers[name], properties.servers.options); }
      finally { global.UTILS = previousUtils; }
    }),
    /** Read real layered environment tooling configuration without any descriptor. */
    loadEnvironment: (environment) => require(path.join(frameworkRoot, 'nodics.foundation/modules/nTooling/src/service/project/defaultProjectEnvironmentConfigurationService.mjs')).readProjectEnvironmentConfiguration(projectRoot, environment),
    loadContainer: (environment) => require(path.join(frameworkRoot, 'nodics.foundation/modules/nTooling/src/service/project/defaultProjectContainerConfigurationService.mjs')).readContainerEnvironmentConfiguration(projectRoot, environment),
    corsPolicy: (properties) => consume(properties, 'nodics.foundation/modules/nRouter/src/service/defaultHttpHardeningService', service => service.getPolicy().cors),
    /** Resolve nRouter's actual configured origin construction and denial policy. */
    corsOrigins: (properties) =>
      consume(
        properties,
        "nodics.foundation/modules/nRouter/src/service/defaultHttpHardeningService",
        (service) => service.resolveCorsOrigins(properties.httpHardening.cors),
      ),
    /** Resolve nRouter's actual inherited CORS header policy. */
    corsHeaders: (properties, kind) =>
      consume(
        properties,
        "nodics.foundation/modules/nRouter/src/service/defaultHttpHardeningService",
        (service) =>
          service.resolveCorsHeaderList(
            properties.httpHardening.cors[kind + "Headers"],
            properties.httpHardening.cors[kind + "HeaderOverrides"],
          ),
      ),
    /** Resolve nCache's active-module engine/channel inheritance without opening clients. */
    cacheConfiguration: (properties, name) =>
      consume(
        properties,
        "nodics.foundation/modules/nCache/cache/src/service/config/defaultCacheConfigurationService",
        (service) => {
          const previous = global.NODICS;
          const isolated = { ...service, channels: {}, engines: {} };
          try {
            global.NODICS = { getModules: () => ({ [name]: { name } }) };
            return isolated.loadCacheConfiguration().then(() => ({
              channels: isolated.channels[name],
              engines: isolated.engines[name],
            }));
          } finally {
            global.NODICS = previous;
          }
        },
      ),
    /** Observe nDatabase's actual connection consumer for a module in a prepared project graph. */
    databaseConfiguration: (properties, name) =>
      consume(
        properties,
        "nodics.foundation/modules/nDatabase/database/src/service/config/defaultDatabaseConfigurationService",
        (service) => {
          const previous = global.NODICS;
          const modules = runtimeGraphs.get(properties) || [];
          try {
            global.NODICS = {
              isModuleActive: (module) => modules.includes(module),
              getModule: (module) =>
                modules.includes(module) ? { name: module } : undefined,
              getActiveTenants: () => [],
            };
            return service.getDatabaseConfiguration(name, "default");
          } finally {
            global.NODICS = previous;
          }
        },
      ),
    /** Resolve nSearch's selected engine/provider options without connecting a provider. */
    searchConfiguration: (properties, name) =>
      consume(
        properties,
        "nodics.foundation/modules/nSearch/search/src/service/config/defaultSearchConfigurationService",
        (service) => service.getSearchConfiguration(name, "default"),
      ),
    /** Apply the actual nImport destination validator, including the runtime-role default. */
    validateDestination: (properties, role) =>
      consume(
        properties,
        "nodics.foundation/modules/nData/nImport/import/src/service/release/defaultDataReleaseService",
        (service) =>
          ({
            ...service,
            error: (code, message) => Object.assign(new Error(message), { code }),
          }).validateDestination({
            destinationRole: role,
            environmentScope: [properties.environment.class],
          }),
      ),
    /** Resolve the existing nService authority contract for a selected module. */
    authorityContext: (properties, name) =>
      consume(
        properties,
        "nodics.foundation/modules/nService/src/service/module/defaultModuleRegistrationAgentService",
        (service) => service.getAuthorityContext(name, "testRecord", {}),
      ),
    /** Resolve project/environment/server declarations through the real nConfig loader without starting runtime resources. */
    loadRuntime: function (server, environment, variables = {}) {
      const probe = require(path.join(frameworkRoot,
        "nodics.foundation/modules/nTooling/src/service/project/defaultProjectConfigurationProbeService"));
      const parsed = probe.read({ projectRoot, frameworkRoot, server, environment, variables });
      runtimeGraphs.set(parsed.properties, parsed.modules);
      return parsed.properties;
    },
    /** Return the actual discovered and indexed graph for a loaded acceptance runtime. */
    activeModuleNames: (properties) => runtimeGraphs.get(properties) || [],
    merge,
    frameworkRoot,
  };
}
module.exports = { createProjectConfigurationTestHarness };
