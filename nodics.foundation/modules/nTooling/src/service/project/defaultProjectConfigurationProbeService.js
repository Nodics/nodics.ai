/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/*
 * Copyright (c) 2026 Nodics. Governed by the root LICENSE.
 */
"use strict";

/** @module nTooling/project/defaultProjectConfigurationProbeService @description Reads the actual nConfig projection in an isolated process without starting providers, scripts or listeners. @owner nTooling @layer tooling */
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

module.exports = {
  /** Requires explicit customer coordinates; runtime selection must not escape its environment. */
  coordinates: function (options) {
    if (!options || typeof options.projectRoot !== "string" || !options.projectRoot)
      throw new Error("Configuration probe requires a projectRoot");
    for (const key of ["server", "environment"]) {
      if (!/^[A-Za-z][A-Za-z0-9._-]*$/.test(options[key] || ""))
        throw new Error("Configuration probe requires a valid " + key);
    }
    return {
      ...options,
      projectRoot: path.resolve(options.projectRoot),
      frameworkRoot: path.resolve(options.frameworkRoot || path.join(__dirname, "../../../../../..")),
    };
  },
  /** Runs discovery in a child so test globals and module caches cannot leak between consumers. */
  read: function (options) {
    const { variables = {}, ...coordinates } = this.coordinates(options);
    return JSON.parse(execFileSync(process.execPath, [__filename, JSON.stringify(coordinates)], {
      env: {
        ...(options.inheritEnvironment === true ? process.env : { PATH: process.env.PATH, HOME: process.env.HOME }),
        ...variables,
      },
      encoding: "utf8",
      maxBuffer: 16 * 1024 * 1024,
      timeout: 30000,
    }));
  },
  /** Child-process entry: uses nConfig's existing loader, not a parallel merge implementation. */
  resolve: function (input) {
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
    return { properties: CONFIG.getProperties(), modules: [...NODICS.getIndexedModules().values()].map(module => module.name) };
  },
};

if (require.main === module) {
  const options = JSON.parse(process.argv[2]);
  process.argv = process.argv.slice(0, 2);
  process.stdout.write(JSON.stringify(module.exports.resolve(options)));
}
