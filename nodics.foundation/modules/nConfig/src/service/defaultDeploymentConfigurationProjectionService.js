/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";

/** @module nConfig/service/defaultDeploymentConfigurationProjectionService @description Projects the selected deployment through the canonical configuration loader without lifecycle hooks, providers or listeners. @owner nConfig @layer service @override Later layers may customize configuration while preserving exact selection and isolated read semantics. */
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

module.exports = {
  /** Requires explicit customer coordinates; runtime selection must not escape its environment. @param {Object} options Selected coordinates. @returns {Object} Normalized coordinates. */
  coordinates: function (options) {
    if (!options || typeof options.projectRoot !== "string" || !options.projectRoot)
      throw new Error("Configuration probe requires a projectRoot");
    for (const key of ["server", "environment"]) {
      if (!/^[A-Za-z][A-Za-z0-9._-]*$/.test(options[key] || ""))
        throw new Error("Configuration probe requires a valid " + key);
    }
    return {
      ...options,
      // Projection coordinates are authoritative over ambient server/node selectors.
      variables: { ...options.variables, S: options.server, SERVER: options.server,
        E: options.environment, ENV: options.environment, NODICS_NODE: "", N: "", NODE: "" },
      projectRoot: path.resolve(options.projectRoot),
      frameworkRoot: path.resolve(options.frameworkRoot || path.join(__dirname, "../../../../..")),
    };
  },
  /** Runs discovery in a child so runtime globals and module caches cannot leak between consumers. @param {Object} options Coordinates and private environment inputs. @returns {Object} Effective properties and indexed module graph. */
  read: function (options) {
    const { variables = {}, ...coordinates } = this.coordinates(options);
    let output;
    try {
      output = execFileSync(process.execPath, [__filename, JSON.stringify(coordinates)], {
      env: {
        ...(options.inheritEnvironment === true ? process.env : { PATH: process.env.PATH, HOME: process.env.HOME }),
        ...variables,
      },
      stdio: "pipe",
      encoding: "utf8",
      maxBuffer: 16 * 1024 * 1024,
      timeout: 30000,
      });
    } catch (error) {
      // Child stdout contains private configuration, including resolved secret bindings.
      const code = /^[A-Z0-9_]+$/.test(error?.code || "") ? error.code : "CHILD_FAILED";
      throw new Error(`Configuration projection failed for ${coordinates.environment}/${coordinates.server}: ${code}`);
    }
    return JSON.parse(output);
  },
  /** Flushes one private result and terminates only the owned CLI child despite module-level handles. @param {Object} options Explicit projection selection. @returns {Promise<void>} Ends after output flush; library resolve/read callers retain their lifecycle. */
  runCli: async function (options) {
    try {
      const result = await this.resolve(options);
      process.stdout.write(JSON.stringify(result), () => process.exit(0));
    } catch (_) {
      process.stderr.write("Configuration projection failed.\n", () => process.exit(1));
    }
  },
  /** Projects every enabled backend and validates functional ownership using registration evidence.
   * @param {Object} options Explicit projectRoot, environment and optional frameworkRoot.
   * @returns {Object[]} Complete per-server ownership evidence after uniqueness validation.
   * @throws {Error} When projection or ownership admission fails; starts no services.
   */
  validateEnvironmentOwnership: function (options) {
    const environmentRoot = path.join(path.resolve(options.projectRoot), "envs", options.environment);
    const evidence = fs.readdirSync(environmentRoot, { withFileTypes: true }).filter(entry => entry.isDirectory()).flatMap(entry => {
      const file = path.join(environmentRoot, entry.name, "package.json");
      if (!fs.existsSync(file)) return [];
      const metadata = JSON.parse(fs.readFileSync(file, "utf8")).nodics || {};
      if (metadata.kind !== "server" || metadata.runtimeModule !== true || metadata.retired === true || metadata.runtimeTooling?.enabled === false) return [];
      return [this.read({ ...options, server: entry.name }).ownershipEvidence];
    });
    const utils = require("../utils/utils");
    const records = [], modules = Object.create(null);
    const roots = [options.frameworkRoot || path.resolve(__dirname, "../../../../.."), options.projectRoot];
    for (const root of [...new Set(roots.map(value => fs.realpathSync(value)))]) {
      utils.collectModuleRecords(root, records, null, {root, visited:new Set(), directories:0, depth:0});
    }
    utils.indexModuleRecords(records, modules);
    const resolveSource = (name, runtime) => {
      // Topology package names may repeat across environments; the selected
      // projection already supplies their exact validated coordinates.
      if (runtime && [runtime.server, runtime.environment].includes(name)) {
        const directory = name === runtime.server ? path.join(environmentRoot, runtime.server) : environmentRoot;
        const metadata = JSON.parse(fs.readFileSync(path.join(directory, "package.json"), "utf8"));
        const kind = name === runtime.server ? "server" : "group";
        if (metadata.name !== name || metadata.nodics?.kind !== kind || metadata.nodics?.runtimeModule !== true) throw new Error("Invalid selected topology ownership source: " + name);
        return {name, path:directory, metaData:metadata};
      }
      const matches = Object.values(modules).filter(module => module.name === name);
      if (matches.length !== 1 || records.filter(record => record.name === name).length !== 1) throw new Error("Missing or ambiguous installed ownership source: " + name);
      return matches[0];
    };
    require("./DefaultFrameworkInitializerService").validateRuntimeModuleOwnership(evidence, resolveSource);
    return evidence;
  },
  /** Child-process entry using nConfig's existing loader, never a parallel merge or activation implementation. @param {Object} input Selected coordinates. @returns {Promise<Object>} Effective properties and indexed graph after maintenance metadata preparation. */
  resolve: async function (input) {
    const { projectRoot: project, frameworkRoot: framework, server, environment, variables = {} } = this.coordinates(input);
    Object.assign(process.env, variables);
    const root = path.join(framework, "nodics.foundation/modules/nConfig");
    const Nodics = require(path.join(root, "bin/nodics"));
    const Config = require(path.join(root, "bin/config"));
    const utils = require(path.join(root, "src/utils/utils"));
    const initializer = require(path.join(root, "src/service/DefaultFrameworkInitializerService"));
    const noop = { info() {}, debug() {}, warn() {}, error() {} };
    initializer.LOG = noop;
    utils.LOG = noop;
    const metadata = JSON.parse(fs.readFileSync(path.join(project, "envs", environment, server, "package.json")));
    const roots = [
      path.join(framework, "nodics.foundation"),
      ...(metadata.nodics.runtimeModuleRoots || metadata.nodics.extends || []).map(name => path.join(framework, name)),
      project,
    ];
    const options = { NODICS_HOME: roots[0], CUSTOM_HOME: project, MODULE_ROOTS: roots, defaultEnvironment: environment, defaultServer: server };
    global.NODICS = new Nodics();
    global.CONFIG = new Config();
    NODICS.LOG = noop;
    CONFIG.LOG = noop;
    NODICS.init(options);
    utils.loadRawModuleRoots(roots);
    NODICS.initEnvironment(options);
    initializer.prepareOptions();
    initializer.loadModuleIndex();
    NODICS.setActiveModules([...NODICS.getIndexedModules().values()].map(module => module.name));
    initializer.loadModulesMetaData();
    initializer.loadConfigurations();
    initializer.validateResolvedConfiguration();
    initializer.LOG = noop;
    await initializer.loadMaintenanceServices();
    const agent = SERVICE.DefaultModuleRegistrationAgentService;
    const modules = [...NODICS.getIndexedModules().values()].map(module => module.name);
    const schemas = SERVICE.DefaultFilesLoaderService.loadSchemaFiles("/src/schemas/schemas.js", {});
    await SERVICE.DefaultDatabaseSchemaHandlerService.buildDatabaseSchema(schemas);
    SERVICE.DefaultModulesConfigurationService.prepareModulesConfiguration();
    const localModules = agent.getLocalModules();
    const ownershipEvidence = { projectCode: NODICS.getEnvironmentName(), environment, server,
      runtimeRole: CONFIG.get("runtimeRole"),
      registrations: localModules.map(name => {
        const effective = NODICS.getModule(name);
        if (!effective) throw new Error("Effective module unavailable for ownership: " + name);
        // Successful canonical schema loading proves absence only when no module contribution exists.
        if (name !== "default" && schemas[name] && !Object.prototype.hasOwnProperty.call(effective, "rawSchema")) throw new Error("Effective schema materialization incomplete: " + name);
        return agent.buildOwnershipEvidence(name, { ...NODICS.getRawModule(name), rawSchema: effective.rawSchema || {} });
      }),
      remoteSourceModules: modules.filter(name => !localModules.includes(name)) };
    return { properties: CONFIG.getProperties(), modules, ownershipEvidence };
  },
};

if (require.main === module) {
  const options = JSON.parse(process.argv[2]);
  process.argv = process.argv.slice(0, 2);
  module.exports.runCli(options);
}
