/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const _ = require("lodash");
const fs = require("fs");
const util = require("util");
const props = require("../../config/properties");
const logger = require("./DefaultLoggerService");
const enumService = require("./defaultEnumService");
const fileLoader = require("./defaultFilesLoaderService");
const classesLoader = require("./defaultClassesHandlerService");
const utils = require("../utils/utils");
const infra = require("./defaultInfraService");
const configurationBindings = require("./defaultConfigurationBindingService");

/**
 * @module config/service/DefaultFrameworkInitializerService
 * @description Core Nodics startup coordinator. It resolves the active module hierarchy,
 * validates environment/server/node topology, loads layered configuration, initializes
 * global registries, loads services/pipelines/facades/controllers, and executes entity
 * lifecycle hooks in module index order.
 * @layer service
 * @owner nConfig
 * @override Project modules should not normally replace this service wholesale; instead
 * they should contribute module metadata, properties, pre/post scripts, services, pipelines,
 * facades, and controllers through the active module hierarchy. If replacement is required,
 * preserve ordering, validation, and registry contracts documented here.
 *
 * @property {Object} CONFIG Global layered configuration registry.
 * @property {Object} NODICS Global runtime registry for module metadata, active modules, paths, and indexed modules.
 * @property {Object} SERVICE Dynamic service registry loaded from active modules.
 * @property {Object} PIPELINE Dynamic pipeline definition registry loaded from active modules.
 * @property {Object} FACADE Dynamic facade registry loaded from active modules.
 * @property {Object} CONTROLLER Dynamic controller registry loaded from active modules.
 * @property {Object} CLASSES Dynamic class registry loaded from active modules.
 * @property {Object} ENUMS Dynamic enum registry loaded from active modules.
 * @property {Object} TEST Dynamic test registry separated into environment and universal test pools.
 */
module.exports = {
  /**
   * Initializes the framework initializer service.
   *
   * @param {Object} options Startup options supplied by the Nodics launcher.
   * @returns {Promise<boolean>} Resolves when initialization is complete.
   */
  init: function (options) {
    return new Promise((resolve, reject) => {
      resolve(true);
    });
  },

  /**
   * Finalizes the framework initializer service after entity loading.
   *
   * @param {Object} options Startup options supplied by the Nodics launcher.
   * @returns {Promise<boolean>} Resolves when post-initialization is complete.
   */
  postInit: function (options) {
    return new Promise((resolve, reject) => {
      resolve(true);
    });
  },

  /**
   * Sorts dotted module indexes numerically while preserving hierarchy semantics.
   *
   * @param {string[]} rawData Module index values such as `1.11` or `1000.10.1`.
   * @returns {string[]} Sorted module indexes.
   */
  sortModules: function (rawData) {
    return rawData.slice().sort((left, right) => {
      let leftParts = String(left).split(".").map(Number);
      let rightParts = String(right).split(".").map(Number);
      let length = Math.max(leftParts.length, rightParts.length);
      for (let index = 0; index < length; index++) {
        let difference = (leftParts[index] || 0) - (rightParts[index] || 0);
        if (difference !== 0) return difference;
      }
      return String(left).localeCompare(String(right));
    });
  },

  /**
   * Logs resolved Nodics paths and active module load sequence.
   *
   * @returns {void}
   * @sideEffects Logs runtime paths, sets `NODICS.activeModules`, and exits on missing runtime registry.
   */
  printInfo: function () {
    if (!NODICS) {
      this.LOG.error(
        "System initialization error: options cannot be null or empty",
      );
      process.exit(1);
    }
    this.LOG.info(
      "###   Initializing Nodics, Node based enterprise application solution   ###",
    );
    this.LOG.info(
      "---------------------------------------------------------------------------",
    );
    this.LOG.info("NODICS_HOME   : " + NODICS.getNodicsHome());
    this.LOG.info("NODICS_ENV    : " + NODICS.getEnvironmentPath());
    this.LOG.info("SERVER_ROOT   : " + NODICS.getServerRootPath());
    this.LOG.info("SERVER        : " + NODICS.getServerPath());
    if (NODICS.getNodePath()) {
      this.LOG.info("NODE     : " + NODICS.getNodePath());
    }
    this.LOG.info("LOG_PATH      : " + NODICS.getServerPath() + "/temp/logs");
    this.LOG.info(
      "---------------------------------------------------------------------------\n",
    );
    this.LOG.info(
      "###   Sequence in which modules have been loaded (Top to Bottom)   ###\n",
    );
    let counter = 1;
    let activeModules = [];
    let maxLength = 30;
    let space = " ";
    NODICS.getIndexedModules().forEach((obj, key) => {
      let spaces = maxLength - obj.name.length;
      this.LOG.info(
        "  " +
          (counter < 10 ? "0" + counter : counter) +
          "  module=" +
          obj.name +
          space.repeat(spaces) +
          " index=" +
          key,
      );
      activeModules.push(obj.name);
      counter++;
    });
    console.log();
    NODICS.setActiveModules(activeModules);
  },

  /**
   * Resets global runtime registries and validates the initial activation configuration.
   *
   * @returns {void}
   * @sideEffects Reinitializes global `CLASSES`, `ENUMS`, `UTILS`, `SERVICE`, `PIPELINE`, `FACADE`, `CONTROLLER`, and `TEST`.
   * @throws Propagates invalid activation configuration errors.
   */
  prepareOptions: function () {
    NODICS.setActiveModules(this.getActiveModules());
    this.validateModuleActivationConfiguration();
    CONFIG.setProperties({});
    global.CLASSES = {};
    global.ENUMS = {};
    global.UTILS = {};
    global.SERVICE = {};
    global.PIPELINE = {};
    global.FACADE = {};
    global.CONTROLLER = {};
    global.TEST = {
      nTestPool: {
        data: {
          // Test cases that must execute in a specific environment.
        },
        suites: {
          // Best use case could be testing all created pages.
        },
      },
      uTestPool: {
        data: {
          // This pool for all test cases
        },
        suites: {
          // This pool for all test cases
        },
      },
    };
  },

  /**
   * Returns the documented precedence for configuration loading.
   *
   * @returns {string[]} Human-readable configuration load order.
   */
  getConfigurationLoadOrder: function () {
    return [
      "nodics.foundation/modules/nConfig/config/properties.js",
      "active module /config/properties.js files in module index order",
      "externalPropertyFile entries",
      "tenant properties loaded from active enterprise tenant records",
      "runtime persisted configuration records",
    ];
  },

  /**
   * Logs configuration and environment/server/node load precedence.
   *
   * @returns {void}
   * @sideEffects Writes startup contract information to the logger.
   */
  printConfigurationLoadOrder: function () {
    this.LOG.info("###   Configuration loading contract   ###");
    this.getConfigurationLoadOrder().forEach((entry, index) => {
      this.LOG.info("  " + (index + 1) + ". " + entry);
    });
    this.LOG.info(
      "###   Environment/server/node configuration precedence   ###",
    );
    this.getServerConfigurationLoadOrder().forEach((entry, index) => {
      this.LOG.info("  " + (index + 1) + ". " + entry);
    });
  },

  /**
   * Returns the environment/server/node properties file precedence for the selected runtime.
   *
   * @returns {string[]} Human-readable file descriptions containing resolved file paths.
   */
  getServerConfigurationLoadOrder: function () {
    return [
      "project config: " +
        NODICS.getEnvironmentPath() +
        "/config/properties.js",
      "environment config: " +
        NODICS.getServerRootPath() +
        "/config/properties.js",
      "server config: " + NODICS.getServerPath() + "/config/properties.js",
      NODICS.getNodePath()
        ? "node config: " + NODICS.getNodePath() + "/config/properties.js"
        : null,
    ].filter(Boolean);
  },

  /**
   * Loads and merges environment, server-root, server, and optional node properties.
   *
   * @returns {Object} Merged server properties for startup resolution.
   * @sideEffects Requires discovered property files into Node module cache.
   */
  loadServerProperties: function () {
    let serverProperties = {};
    this.getServerConfigurationLoadOrder().forEach((fileDescription) => {
      let filePath = fileDescription.substring(
        fileDescription.indexOf(": ") + 2,
      );
      if (fs.existsSync(filePath)) {
        serverProperties = configurationBindings.merge(
          serverProperties,
          this.readPropertyContribution(filePath, serverProperties),
        );
      }
    });
    return serverProperties;
  },

  /**
   * Returns active module groups with the framework group always first.
   *
   * @param {Object} serverProperties Merged selected-runtime properties.
   * @returns {string[]} Configured active module groups.
   */
  getConfiguredActiveModuleGroups: function (serverProperties) {
    let groups = [];
    this.resolveExtendedModuleGroups(NODICS.getServerName(), groups, []);
    (serverProperties.activeModules
      ? serverProperties.activeModules.groups || []
      : []
    ).forEach((groupName) => {
      this.resolveExtendedModuleGroups(groupName, groups, []);
    });
    return groups;
  },

  /**
   * Normalizes a deprecated functional-module identity to its single canonical runtime identity.
   *
   * Later configuration layers may add aliases during a governed migration, but they must never
   * map a canonical identity back to a deprecated name or make both identities loadable.
   *
   * @param {string} moduleName Configured module identity.
   * @returns {string} Canonical module identity used for discovery and activation.
   */
  normalizeModuleIdentity: function (moduleName) {
    let configurationReady =
      typeof CONFIG !== "undefined" &&
      CONFIG &&
      typeof CONFIG.get === "function" &&
      typeof CONFIG.getProperties === "function" &&
      CONFIG.getProperties();
    let aliases = configurationReady
      ? CONFIG.get("moduleIdentityAliases") || {}
      : require("../../config/properties").moduleIdentityAliases || {};
    return aliases[moduleName] || moduleName;
  },

  /** Resolves functional availability independently from index-based loading. */
  resolveExtendedModuleGroups: function (moduleName, groups, visiting) {
    moduleName = this.normalizeModuleIdentity(moduleName);
    let moduleObject = NODICS.getRawModule(moduleName);
    if (!moduleObject)
      this.failConfiguration(
        "extends references unknown module: " + moduleName,
      );
    if (visiting.includes(moduleName)) {
      this.failConfiguration(
        "circular module extends hierarchy: " +
          visiting.concat([moduleName]).join(" -> "),
      );
    }
    let metadata = this.getModuleNodicsMetadata(moduleObject);
    let parents = metadata.extends || [];
    if (!Array.isArray(parents)) parents = [parents];
    parents.filter(Boolean).forEach((parentName) => {
      this.resolveExtendedModuleGroups(
        parentName,
        groups,
        visiting.concat([moduleName]),
      );
    });
    if (metadata.kind === "group" && !groups.includes(moduleName))
      groups.push(moduleName);
  },

  /**
   * Returns configured active modules plus the selected node without mutating configuration.
   *
   * @param {Object} serverProperties Merged selected-runtime properties.
   * @returns {string[]} Configured active module names.
   */
  getConfiguredActiveModuleNames: function (serverProperties) {
    let configuredModules = [].concat(
      serverProperties.activeModules
        ? serverProperties.activeModules.modules || []
        : [],
    );
    if (
      NODICS.getNodePath() &&
      !configuredModules.includes(NODICS.getNodeName())
    ) {
      configuredModules.push(NODICS.getNodeName());
    }
    return configuredModules;
  },

  /**
   * Returns module endpoint names declared under `servers.*` configuration.
   *
   * Endpoint coordinates describe where a module can be reached. They do not
   * activate that module locally; local activation remains owned by `activeModules`.
   *
   * @param {Object} serverProperties Merged selected-runtime properties.
   * @returns {string[]} Configured module endpoint names, excluding framework control keys.
   */
  getConfiguredServerEndpointNames: function (serverProperties) {
    return Object.keys(serverProperties.servers || {}).filter((moduleName) => {
      return moduleName !== "default" && moduleName !== "options";
    });
  },

  /**
   * Returns configured endpoint names for modules that are not active in this process.
   *
   * @param {Object} serverProperties Merged selected-runtime properties.
   * @returns {string[]} Remote module endpoint names.
   */
  getConfiguredRemoteModuleNames: function (serverProperties) {
    return this.getConfiguredServerEndpointNames(serverProperties).filter(
      (moduleName) => {
        return !NODICS.isModuleActive(moduleName);
      },
    );
  },

  /**
   * Returns the selected runtime topology sequence in parent-to-child order.
   *
   * The sequence is derived from startup selection and parent relationships:
   * environment group -> environment/server-root -> server -> optional node.
   *
   * @returns {string[]} Selected runtime module names.
   */
  getSelectedRuntimeModuleNames: function () {
    return [
      NODICS.getEnvironmentName(),
      NODICS.getServerRootName(),
      NODICS.getServerName(),
      NODICS.getNodeName(),
    ].filter(Boolean);
  },

  /**
   * Adds one module to the active list when metadata marks it loadable in the current runtime.
   *
   * Explicit server activation accepts every runtime-loadable package kind so
   * customer data/content packs can be selected without becoming group
   * children. Plain group activation remains limited to standard always-
   * loadable kinds or publish-enabled modules.
   *
   * @param {Object} prop Effective startup properties controlling optional runtime kinds.
   * @param {string} moduleName Module name to add.
   * @param {string[]} modules Mutable active module list.
   * @param {Object} [options] Activation options.
   * @param {boolean} [options.explicit=false] True when the module was named directly by runtime configuration.
   * @returns {boolean} True when the module was added.
   */
  addRuntimeActiveModule: function (prop, moduleName, modules, options) {
    options = options || {};
    moduleName = this.normalizeModuleIdentity(moduleName);
    if (!moduleName || modules.includes(moduleName)) return false;
    let moduleObject = NODICS.getRawModule(moduleName);
    if (!moduleObject)
      this.failConfiguration(
        "active module references unknown module: " + moduleName,
      );
    if (
      moduleName === (prop.dynamoModuleName || "dynamo") &&
      !prop.dynamoEnabled
    )
      return false;
    let metadata = this.getModuleNodicsMetadata(moduleObject);
    if (
      (options.explicit &&
        metadata.runtimeModule !== false &&
        metadata.loadableByNodicsModuleLoader !== false) ||
      (utils.isPublishModule(moduleObject.metaData) && prop.publishEnabled) ||
      utils.isAlwaysLoadableModule(moduleObject.metaData)
    ) {
      modules.push(moduleName);
      return true;
    }
    return false;
  },

  /**
   * Adds a group package without recursively activating every child capability.
   *
   * Selector syntax such as `group:selector` remains an explicit local module
   * selection mechanism. Plain group activation only
   * loads the group package itself so it can contribute configuration/defaults.
   *
   * @param {Object} prop Effective startup properties.
   * @param {string} groupName Group module name, optionally followed by a selector.
   * @param {string[]} modules Mutable active module list.
   * @returns {void}
   */
  prepareModuleLevelActiveGroup: function (prop, groupName, modules) {
    if (!groupName) return;
    let moduleName = groupName;
    let selector = null;
    if (moduleName.indexOf(":") > 0) {
      selector = moduleName.substring(moduleName.indexOf(":") + 1);
      moduleName = moduleName.substring(0, moduleName.indexOf(":"));
    }
    moduleName = this.normalizeModuleIdentity(moduleName);
    let moduleObject = NODICS.getRawModule(moduleName);
    if (!moduleObject)
      this.failConfiguration(
        "activeModules.groups references unknown module: " + moduleName,
      );
    this.addRuntimeActiveModule(prop, moduleName, modules);
    if (
      selector &&
      moduleObject.metaData[selector] &&
      moduleObject.metaData[selector].length > 0
    ) {
      moduleObject.metaData[selector].forEach((childName) => {
        this.addRuntimeActiveModule(prop, childName, modules, {
          explicit: true,
        });
      });
    }
  },

  /**
   * Resolves active modules from nodics.foundation, configured groups/modules, selected node, parents, and dependencies.
   *
   * @returns {string[]} Active module names that should participate in startup.
   * @sideEffects Creates an early logger using merged base/server log configuration.
   */
  getActiveModules: function () {
    try {
      let modules = [];
      let serverProperties = this.loadServerProperties();
      serverProperties = this.deriveRuntimePublicationFlag(serverProperties);
      let prop = this.deriveRuntimePublicationFlag(_.merge({}, props, serverProperties));
      this.LOG = logger.createLogger(
        "DefaultModuleInitializerService",
        prop.log,
      );
      let moduleGroups = this.getConfiguredActiveModuleGroups(serverProperties);
      moduleGroups.forEach((groupName) =>
        this.prepareModuleLevelActiveGroup(prop, groupName, modules),
      );
      [NODICS.getServerRootName(), NODICS.getServerName(), NODICS.getNodeName()]
        .filter(Boolean)
        .forEach((moduleName) => {
          this.addRuntimeActiveModule(prop, moduleName, modules, {
            explicit: true,
          });
        });
      this.getConfiguredActiveModuleNames(serverProperties).forEach(
        (moduleName) => {
          this.addRuntimeActiveModule(prop, moduleName, modules, {
            explicit: true,
          });
        },
      );
      modules.forEach((moduleName) => {
        this.resolveModuleHierarchy(moduleName);
      });
      let dependantModules = [];
      modules.forEach((moduleName) => {
        this.resolveSubDependency(moduleName, dependantModules);
        this.resolveParentDependency(moduleName, dependantModules);
      });
      dependantModules.forEach((moduleName) => {
        if (!modules.includes(moduleName)) modules.push(moduleName);
      });
      return modules;
    } catch (error) {
      console.error("While preparing active module list : ", error);
    }
  },

  /**
   * Raises a standardized configuration validation failure.
   *
   * @param {string} message Validation failure detail.
   * @returns {never}
   * @throws {Error} Always throws invalid Nodics configuration error.
   */
  failConfiguration: function (message) {
    throw new Error("Invalid Nodics configuration: " + message);
  },

  /**
   * Validates that a configuration property is an array.
   *
   * @param {*} value Configuration value.
   * @param {string} propertyPath Human-readable property path.
   * @returns {void}
   * @throws Invalid configuration error when the value is not an array.
   */
  validateArrayProperty: function (value, propertyPath) {
    if (!Array.isArray(value)) {
      this.failConfiguration(propertyPath + " must be an array");
    }
  },

  /**
   * Validates that a module reference exists in raw module metadata.
   *
   * @param {string} moduleName Referenced module name.
   * @param {string} source Configuration source for diagnostics.
   * @returns {void}
   * @throws Invalid configuration error when the module cannot be resolved.
   */
  validateModuleReference: function (moduleName, source) {
    moduleName = this.normalizeModuleIdentity(moduleName);
    if (!moduleName || !NODICS.getRawModule(moduleName)) {
      this.failConfiguration(
        source + " references unknown module: " + moduleName,
      );
    }
  },

  /**
   * Returns the standardized Nodics module metadata block for a runtime module.
   *
   * @param {Object} moduleObject Raw module object from the Nodics registry.
   * @returns {Object} Nodics metadata from package.json.
   */
  getModuleNodicsMetadata: function (moduleObject) {
    return utils.getNodicsMetadata(moduleObject && moduleObject.metaData);
  },

  /**
   * Validates the finalized module metadata contract.
   *
   * @param {Object} moduleObject Raw module object from the Nodics registry.
   * @returns {void}
   * @throws Invalid configuration error when legacy or incomplete metadata is found.
   */
  validateModuleMetadataContract: function (moduleObject) {
    if (!moduleObject || !moduleObject.metaData) {
      this.failConfiguration("runtime module metadata is missing");
    }
    let moduleName = moduleObject.name || moduleObject.metaData.name;
    let nodics = this.getModuleNodicsMetadata(moduleObject);
    if (moduleObject.metaData.type) {
      this.failConfiguration(
        moduleName +
          " must not use package.json.type for Nodics module classification; use package.json.nodics.kind",
      );
    }
    if (nodics.moduleType) {
      this.failConfiguration(
        moduleName +
          " must not use package.json.nodics.moduleType; use package.json.nodics.kind",
      );
    }
    if (!nodics.kind) {
      this.failConfiguration(
        moduleName + " must define package.json.nodics.kind",
      );
    }
    if (
      typeof nodics.displayName !== "string" ||
      !nodics.displayName.trim() ||
      nodics.displayName.length > 160
    ) {
      this.failConfiguration(
        moduleName + " must define a bounded package.json.nodics.displayName",
      );
    }
    if (!nodics.runtime || typeof nodics.runtime !== "object") {
      this.failConfiguration(
        moduleName + " must define package.json.nodics.runtime",
      );
    }
    ["router", "publish", "web"].forEach((flag) => {
      if (typeof nodics.runtime[flag] !== "boolean") {
        this.failConfiguration(
          moduleName + " nodics.runtime." + flag + " must be a boolean",
        );
      }
    });
    if (!Array.isArray(nodics.owns)) {
      this.failConfiguration(
        moduleName + " must define package.json.nodics.owns as an array",
      );
    }
  },

  /**
   * Validates metadata for all raw runtime modules.
   *
   * @returns {void}
   * @throws Invalid configuration error for stale or incomplete metadata.
   */
  validateRuntimeModuleMetadata: function () {
    _.each(NODICS.getRawModules(), (moduleObject) => {
      this.validateModuleMetadataContract(moduleObject);
    });
  },

  /**
   * Validates that a runtime module has the expected Nodics kind.
   *
   * @param {string} moduleName Module name to validate.
   * @param {string|string[]} expectedKind Allowed kind or kinds.
   * @param {string} source Diagnostic source.
   * @returns {void}
   * @throws Invalid configuration error when the module has a different kind.
   */
  validateModuleKind: function (moduleName, expectedKind, source) {
    moduleName = this.normalizeModuleIdentity(moduleName);
    this.validateModuleReference(moduleName, source);
    let moduleObject = NODICS.getRawModule(moduleName);
    let kind = this.getModuleNodicsMetadata(moduleObject).kind;
    let allowedKinds = Array.isArray(expectedKind)
      ? expectedKind
      : [expectedKind];
    if (!allowedKinds.includes(kind)) {
      this.failConfiguration(
        source +
          " module " +
          moduleName +
          " must have nodics.kind " +
          allowedKinds.join(" or ") +
          ", found: " +
          kind,
      );
    }
  },

  /**
   * Validates selected environment group, environment, server, and optional node kinds.
   *
   * @returns {void}
   * @throws Invalid configuration error when selected runtime modules do not match the topology contract.
   */
  validateSelectedRuntimeKinds: function () {
    this.validateModuleKind(
      NODICS.getEnvironmentName(),
      "application",
      "selected project",
    );
    this.validateModuleKind(
      NODICS.getServerRootName(),
      ["group", "environment"],
      "selected environment",
    );
    this.validateModuleKind(
      NODICS.getServerName(),
      "server",
      "selected server",
    );
    if (NODICS.getNodeName()) {
      this.validateModuleKind(NODICS.getNodeName(), "node", "selected node");
    }
  },

  /**
   * Validates that selected runtime hierarchy modules provide their configuration files.
   *
   * @returns {void}
   * @throws Invalid configuration error when a selected runtime config file is missing.
   */
  validateSelectedRuntimeConfigurationFiles: function () {
    [
      { label: "project", path: NODICS.getEnvironmentPath() },
      { label: "environment", path: NODICS.getServerRootPath() },
      { label: "server", path: NODICS.getServerPath() },
      NODICS.getNodePath()
        ? { label: "node", path: NODICS.getNodePath() }
        : null,
    ]
      .filter(Boolean)
      .forEach((entry) => {
        let propertiesFile = entry.path + "/config/properties.js";
        if (!fs.existsSync(propertiesFile)) {
          this.failConfiguration(
            "selected " +
              entry.label +
              " must provide config/properties.js: " +
              propertiesFile,
          );
        }
      });
  },

  /**
   * Validates required module dependencies for active modules.
   *
   * @returns {void}
   * @throws Invalid configuration error when dependencies are missing, inactive, or load after the dependent module.
   */
  validateRequiredModuleDependencies: function () {
    NODICS.getActiveModules().forEach((moduleName) => {
      let moduleObject = NODICS.getRawModule(moduleName);
      let moduleKind = this.getModuleNodicsMetadata(moduleObject).kind;
      let requiredModules = moduleObject.metaData.requiredModules || [];
      this.validateArrayProperty(
        requiredModules,
        moduleName + ".requiredModules",
      );
      requiredModules.forEach((requiredModuleName) => {
        this.validateModuleReference(
          requiredModuleName,
          moduleName + ".requiredModules",
        );
        if (
          moduleKind !== "group" &&
          !NODICS.isModuleActive(requiredModuleName)
        ) {
          this.failConfiguration(
            moduleName + " requires inactive module: " + requiredModuleName,
          );
        }
        this.validateModuleIndexOrder(
          NODICS.getRawModule(requiredModuleName),
          moduleObject,
          moduleName + " requiredModules",
        );
      });
    });
  },

  /**
   * Validates server topology smoke-test configuration when a project defines it.
   *
   * @param {Object} serverProperties Merged server properties.
   * @returns {void}
   * @throws Invalid configuration error for missing servers, invalid kinds, duplicate entries, or bad communication checks.
   */
  validateRuntimeTopologyConfiguration: function (serverProperties) {
    let runtimeTopology = _.get(serverProperties, "test.runtimeTopology");
    if (!runtimeTopology) {
      return;
    }
    if (!runtimeTopology.monoServer) {
      this.failConfiguration("test.runtimeTopology.monoServer must be defined");
    }
    this.validateModuleKind(
      runtimeTopology.monoServer,
      "server",
      "test.runtimeTopology.monoServer",
    );
    this.validateArrayProperty(
      runtimeTopology.modularServers,
      "test.runtimeTopology.modularServers",
    );
    if (runtimeTopology.modularServers.length === 0) {
      this.failConfiguration(
        "test.runtimeTopology.modularServers must define at least one server",
      );
    }
    let seenServers = {};
    runtimeTopology.modularServers.forEach((serverName) => {
      if (seenServers[serverName]) {
        this.failConfiguration(
          "test.runtimeTopology.modularServers contains duplicate server: " +
            serverName,
        );
      }
      seenServers[serverName] = true;
      this.validateModuleKind(
        serverName,
        "server",
        "test.runtimeTopology.modularServers",
      );
      let serverModule = NODICS.getRawModule(serverName);
      this.validateModuleKind(
        serverModule.parent,
        ["group", "environment"],
        "test.runtimeTopology.modularServers parent",
      );
      let propertiesFile = serverModule.path + "/config/properties.js";
      if (!fs.existsSync(propertiesFile)) {
        this.failConfiguration(
          "test.runtimeTopology server must provide config/properties.js: " +
            serverName,
        );
      }
    });
    let communicationChecks = runtimeTopology.communicationChecks || [];
    this.validateArrayProperty(
      communicationChecks,
      "test.runtimeTopology.communicationChecks",
    );
    communicationChecks.forEach((check, index) => {
      if (!check.server || !seenServers[check.server]) {
        this.failConfiguration(
          "test.runtimeTopology.communicationChecks[" +
            index +
            "].server must reference a modular server",
        );
      }
      this.validateModuleReference(
        check.moduleName,
        "test.runtimeTopology.communicationChecks[" + index + "].moduleName",
      );
      if (!check.path || typeof check.path !== "string") {
        this.failConfiguration(
          "test.runtimeTopology.communicationChecks[" +
            index +
            "].path must be defined",
        );
      }
    });
  },

  /**
   * Validates configured module groups, modules, and resolved active module references.
   *
   * @param {Object} serverProperties Merged server properties.
   * @returns {void}
   * @sideEffects Normalizes missing `activeModules.groups` and `activeModules.modules` to arrays.
   * @throws Invalid configuration error for missing or unknown module references.
   */
  validateConfiguredModules: function (serverProperties) {
    if (!serverProperties.activeModules) {
      this.failConfiguration(
        "activeModules must be defined for server: " + NODICS.getServerName(),
      );
    }
    serverProperties.activeModules.groups =
      serverProperties.activeModules.groups || [];
    serverProperties.activeModules.modules =
      serverProperties.activeModules.modules || [];
    this.validateArrayProperty(
      serverProperties.activeModules.groups,
      "activeModules.groups",
    );
    this.validateArrayProperty(
      serverProperties.activeModules.modules,
      "activeModules.modules",
    );
    this.getConfiguredActiveModuleGroups(serverProperties).forEach(
      (groupName) => {
        let moduleName = groupName;
        if (moduleName && moduleName.indexOf(":") > 0) {
          moduleName = moduleName.substring(0, moduleName.indexOf(":"));
        }
        this.validateModuleReference(moduleName, "activeModules.groups");
      },
    );
    serverProperties.activeModules.modules.forEach((moduleName) => {
      this.validateModuleReference(moduleName, "activeModules.modules");
    });
    NODICS.getActiveModules().forEach((moduleName) => {
      this.validateModuleReference(moduleName, "resolved activeModules");
    });
  },

  /**
   * Validates that raw module indexes are unique.
   *
   * @returns {void}
   * @throws Invalid configuration error when two modules share the same index.
   */
  validateRawModuleIndexes: function () {
    let indexes = {};
    _.each(NODICS.getRawModules(), (moduleObject) => {
      if (indexes[moduleObject.index]) {
        this.failConfiguration(
          "duplicate module index " +
            moduleObject.index +
            " for modules " +
            indexes[moduleObject.index] +
            " and " +
            moduleObject.name,
        );
      }
      indexes[moduleObject.index] = moduleObject.name;
    });
  },

  /**
   * Checks whether one module index sorts before another.
   *
   * @param {Object} parentModule Parent or earlier module metadata.
   * @param {Object} childModule Child or later module metadata.
   * @returns {boolean} True when parent index loads before child index.
   */
  isModuleIndexBefore: function (parentModule, childModule) {
    return (
      this.sortModules([parentModule.index, childModule.index])[0] ===
      parentModule.index
    );
  },

  /**
   * Validates index ordering for a parent/child or dependency relation.
   *
   * @param {Object} parentModule Expected earlier module metadata.
   * @param {Object} childModule Expected later module metadata.
   * @param {string} relation Human-readable relation name.
   * @returns {void}
   * @throws Invalid configuration error when module indexes violate load order.
   */
  validateModuleIndexOrder: function (parentModule, childModule, relation) {
    if (!this.isModuleIndexBefore(parentModule, childModule)) {
      this.failConfiguration(
        relation +
          " index order is invalid: " +
          parentModule.name +
          " (" +
          parentModule.index +
          ") must load before " +
          childModule.name +
          " (" +
          childModule.index +
          ")",
      );
    }
  },

  /**
   * Validates selected server-root, server, and optional node hierarchy.
   *
   * @returns {void}
   * @throws Invalid configuration error when selected runtime modules are unknown, inactive, incorrectly parented, or mis-indexed.
   */
  validateSelectedRuntimeHierarchy: function () {
    let environmentName = NODICS.getEnvironmentName();
    let serverName = NODICS.getServerName();
    let serverRootName = NODICS.getServerRootName();
    let environmentModule = NODICS.getRawModule(environmentName);
    let serverModule = NODICS.getRawModule(serverName);
    let serverRootModule = NODICS.getRawModule(serverRootName);
    if (!environmentModule) {
      this.failConfiguration(
        "selected project module is not valid: " + environmentName,
      );
    }
    if (!serverModule) {
      this.failConfiguration(
        "selected server module is not valid: " + serverName,
      );
    }
    if (!serverRootModule) {
      this.failConfiguration(
        "selected server root module is not valid for server " +
          serverName +
          ": " +
          serverRootName,
      );
    }
    if (serverRootModule.parent !== environmentName) {
      this.failConfiguration(
        "selected environment " +
          serverRootName +
          " must be a child of project " +
          environmentName,
      );
    }
    if (serverModule.parent !== serverRootName) {
      this.failConfiguration(
        "selected server " +
          serverName +
          " must be a child of server root " +
          serverRootName,
      );
    }
    if (!NODICS.isModuleActive(serverRootName)) {
      this.failConfiguration(
        "selected server root module must be active before server startup: " +
          serverRootName,
      );
    }
    if (!NODICS.isModuleActive(serverName)) {
      this.failConfiguration(
        "selected server module must be active for startup: " + serverName,
      );
    }
    this.validateModuleIndexOrder(
      environmentModule,
      serverRootModule,
      "project to environment",
    );
    this.validateModuleIndexOrder(
      serverRootModule,
      serverModule,
      "environment to server",
    );
    if (NODICS.getNodeName()) {
      let nodeModule = NODICS.getRawModule(NODICS.getNodeName());
      if (!nodeModule) {
        this.failConfiguration(
          "selected node module is not valid: " + NODICS.getNodeName(),
        );
      }
      if (nodeModule.parent !== serverName) {
        this.failConfiguration(
          "selected node " +
            NODICS.getNodeName() +
            " must be a child of selected server " +
            serverName,
        );
      }
      if (!NODICS.isModuleActive(NODICS.getNodeName())) {
        this.failConfiguration(
          "selected node module must be active for startup: " +
            NODICS.getNodeName(),
        );
      }
      this.validateModuleIndexOrder(serverModule, nodeModule, "server to node");
    }
  },

  /**
   * Validates a server or module server configuration block.
   *
   * @param {string} moduleName Module name under `servers` configuration.
   * @param {Object} moduleConfig Server configuration for the module.
   * @returns {void}
   * @throws Invalid configuration error when host, port, or node endpoint details are missing.
   */
  validateServerDefinition: function (moduleName, moduleConfig, endpointDefaults = {}) {
    if (!moduleConfig || !moduleConfig.endpoint) {
      this.failConfiguration(
        "servers." + moduleName + ".endpoint must be defined",
      );
    }
    const endpoint = _.merge({}, endpointDefaults, moduleConfig.endpoint);
    if (!endpoint.httpHost || !endpoint.httpPort) {
      this.failConfiguration(
        "servers." + moduleName + ".endpoint requires httpHost and httpPort",
      );
    }
    if (moduleConfig.nodes && !utils.isBlank(moduleConfig.nodes)) {
      _.each(moduleConfig.nodes, (nodeConfig, nodeName) => {
        const nodeEndpoint = _.merge({}, endpoint, nodeConfig);
        if (!nodeEndpoint.httpHost || !nodeEndpoint.httpPort) {
          this.failConfiguration(
            "servers." +
              moduleName +
              ".nodes." +
              nodeName +
              " requires httpHost and httpPort",
          );
        }
      });
    }
  },

  /**
   * Validates the complete `servers` configuration object.
   *
   * @param {Object} serverProperties Merged server properties.
   * @returns {void}
   * @throws Invalid configuration error when default or module server definitions are invalid.
   */
  validateServerConfiguration: function (serverProperties) {
    if (!serverProperties.servers || !serverProperties.servers.default) {
      this.failConfiguration(
        "servers.default must be defined for server: " + NODICS.getServerName(),
      );
    }
    _.each(serverProperties.servers, (moduleConfig, moduleName) => {
      if (moduleName !== "options") {
        this.validateServerDefinition(moduleName, moduleConfig, serverProperties.servers.options?.endpointDefaults);
      }
    });
  },

  /**
   * Validates selected node configuration when Nodics starts a node-specific runtime.
   *
   * @param {Object} serverProperties Merged server properties.
   * @returns {void}
   * @throws Invalid configuration error when selected node does not belong to the selected server or lacks node config.
   */
  validateNodeConfiguration: function (serverProperties) {
    if (!NODICS.getNodeName()) {
      return;
    }
    let nodeModule = NODICS.getRawModule(NODICS.getNodeName());
    if (!nodeModule) {
      this.failConfiguration("unknown node module: " + NODICS.getNodeName());
    }
    if (nodeModule.parent !== NODICS.getServerName()) {
      this.failConfiguration(
        "node " +
          NODICS.getNodeName() +
          " does not belong to server " +
          NODICS.getServerName(),
      );
    }
    let nodeId = serverProperties.nodeId || props.nodeId;
    if (
      !serverProperties.servers.default.nodes ||
      !serverProperties.servers.default.nodes[nodeId]
    ) {
      this.failConfiguration(
        "servers.default.nodes must define nodeId: " + nodeId,
      );
    }
  },

  /**
   * Validates profile module access for modular deployments.
   *
   * Profile may be local or remote. When not active locally, its server endpoint must
   * be configured because other modules may require profile services for auth/tenant data.
   *
   * @param {Object} serverProperties Merged server properties.
   * @returns {void}
   * @throws Invalid configuration error when remote profile server details are missing.
   */
  validateModularProfileConfiguration: function (serverProperties) {
    let profileModuleName = props.profileModuleName || "profile";
    if (!NODICS.isModuleActive(profileModuleName)) {
      if (
        !this.getConfiguredRemoteModuleNames(serverProperties).includes(
          profileModuleName,
        )
      ) {
        this.failConfiguration(
          "servers." +
            profileModuleName +
            " must be defined when profile module is not active locally",
        );
      }
      this.validateServerDefinition(
        profileModuleName,
        serverProperties.servers[profileModuleName],
        serverProperties.servers.options?.endpointDefaults,
      );
    }
  },

  /**
   * Runs full resolved configuration validation after CONFIG has been loaded.
   *
   * @returns {void}
   * @throws Invalid configuration error for module, hierarchy, server, node, or modular profile problems.
   */
  validateResolvedConfiguration: function () {
    let serverProperties =
      CONFIG.getProperties() || this.loadServerProperties();
    serverProperties = this.deriveCurrentRuntimeConfiguration(serverProperties);
    if (CONFIG && typeof CONFIG.setProperties === "function") {
      CONFIG.setProperties(serverProperties);
    }
    this.validateRawModuleIndexes();
    this.validateRuntimeModuleMetadata();
    this.validateConfiguredModules(serverProperties);
    this.validateSelectedRuntimeHierarchy();
    this.validateSelectedRuntimeKinds();
    this.validateSelectedRuntimeConfigurationFiles();
    this.validateRequiredModuleDependencies();
    this.validateServerConfiguration(serverProperties);
    this.validateNodeConfiguration(serverProperties);
    this.validateModularProfileConfiguration(serverProperties);
    this.validateRuntimeTopologyConfiguration(serverProperties);
  },

  /** Adds source-derived deployment metadata for the selected live runtime before validation and service registry preparation. @param {Object} properties Loaded runtime properties. @returns {Object} Properties with derived runtime metadata. */
  deriveCurrentRuntimeConfiguration: function (properties) {
    if (
      typeof NODICS === "undefined" ||
      !NODICS ||
      typeof NODICS.getServerPath !== "function"
    ) {
      return properties;
    }
    const serverPath = NODICS.getServerPath && NODICS.getServerPath();
    if (!serverPath) return properties;
    const context = this.getPropertyBindingContext(require("node:path").join(serverPath, "config", "properties.js"));
    let resolved = this.deriveDeploymentEnvironmentMetadata(properties, context);
    resolved = this.deriveRuntimeModuleRootDataReleaseProfiles(resolved, context);
    resolved = this.deriveDatabaseModuleDefaults(resolved);
    resolved = this.deriveRuntimePublicationFlag(resolved);
    resolved = this.deriveDeploymentRuntimeIdentity(resolved, context);
    resolved = this.deriveDeploymentServerReferences(resolved, context);
    resolved = this.deriveRuntimeRoleDataReleases(resolved);
    resolved = this.deriveRuntimeRoleInitializationProfiles(resolved, context);
    resolved = this.deriveRuntimeRoleApiExposure(resolved);
    resolved = this.deriveRuntimeRoleCopilot(resolved);
    resolved = this.deriveRuntimeRoleSearch(resolved);
    resolved = this.deriveRuntimeRoleStripeProvider(resolved);
    resolved = this.deriveRuntimeRoleHttpHardening(resolved);
    resolved = this.deriveRuntimeRoleBackofficeProfiles(resolved);
    return this.deriveRuntimeRoleCommerceProfiles(resolved);
  },

  /**
   * Runs early activation validation before global runtime registries are reset.
   *
   * @returns {void}
   * @throws Invalid configuration error for raw indexes, active modules, or selected runtime hierarchy.
   */
  validateModuleActivationConfiguration: function () {
    let serverProperties = this.loadServerProperties();
    this.validateRawModuleIndexes();
    this.validateRuntimeModuleMetadata();
    this.validateConfiguredModules(serverProperties);
    this.validateSelectedRuntimeHierarchy();
    this.validateSelectedRuntimeKinds();
    this.validateSelectedRuntimeConfigurationFiles();
    this.validateRequiredModuleDependencies();
  },

  /**
   * Resolves active-runtime parent hierarchy for a module while respecting
   * selected environment boundary modules.
   *
   * This differs from the discovery utility resolver: active runtime expansion
   * stops before the selected environment group/application boundary so startup
   * does not accidentally activate project containers as capability modules.
   *
   * @param {string} moduleName Module to resolve.
   * @returns {string[]} Module and parent hierarchy names inside the selected runtime boundary.
   * @sideEffects Caches `parentModules` on raw module metadata.
   */
  resolveModuleHierarchy: function (moduleName) {
    let moduleObject = NODICS.getRawModule(moduleName);
    let modules = [moduleName];
    if (!moduleObject.parent) {
      return modules;
    } else if (
      moduleName === NODICS.getEnvironmentName() ||
      NODICS.getEnvironmentPath().includes(moduleObject.path)
    ) {
      return [];
    } else {
      if (!moduleObject.parentModules) {
        moduleObject.parentModules = this.resolveModuleHierarchy(
          moduleObject.parent,
        );
      }
      modules = modules.concat(moduleObject.parentModules);
      return modules;
    }
  },

  /** Backward-compatible alias for legacy callers. */
  resolveModuleHiererchy: function (moduleName) {
    return this.resolveModuleHierarchy(moduleName);
  },

  /**
   * Recursively resolves required modules declared by module metadata.
   *
   * @param {string} moduleName Module whose required modules should be resolved.
   * @param {string[]} dependantModules Accumulator for dependency module names.
   * @returns {void}
   * @sideEffects Adds dependency names to `dependantModules` and exits process for invalid module metadata.
   */
  resolveSubDependency: function (moduleName, dependantModules) {
    let _self = this;
    let rawModule = NODICS.getRawModule(moduleName);
    if (!rawModule || !rawModule.metaData) {
      console.error("Invalid module name: ", moduleName);
      process.exit(1);
    } else {
      if (
        rawModule.metaData.requiredModules &&
        rawModule.metaData.requiredModules.length > 0
      ) {
        rawModule.metaData.requiredModules.forEach((nxtModuleName) => {
          if (!dependantModules.includes(nxtModuleName))
            dependantModules.push(nxtModuleName);
          _self.resolveSubDependency(nxtModuleName, dependantModules);
        });
      }
    }
  },

  /** Backward-compatible alias for legacy callers. */
  resolveSubDependancy: function (moduleName, dependantModules) {
    return this.resolveSubDependency(moduleName, dependantModules);
  },

  /**
   * Recursively resolves parent modules for an active module.
   *
   * @param {string} moduleName Module whose parent modules should be resolved.
   * @param {string[]} dependantModules Accumulator for parent module names.
   * @returns {void}
   * @sideEffects Adds parent module names to `dependantModules` and exits process for invalid module metadata.
   */
  resolveParentDependency: function (moduleName, dependantModules) {
    let _self = this;
    let rawModule = NODICS.getRawModule(moduleName);
    if (!rawModule || !rawModule.metaData) {
      console.error("Invalid module name : ", moduleName);
      process.exit(1);
    } else {
      if (rawModule.parentModules && rawModule.parentModules.length > 0) {
        rawModule.parentModules.forEach((pModuleName) => {
          if (!dependantModules.includes(pModuleName))
            dependantModules.push(pModuleName);
          _self.resolveParentDependency(pModuleName, dependantModules);
        });
      }
    }
  },

  /** Backward-compatible alias for legacy callers. */
  resolveParentDependancy: function (moduleName, dependantModules) {
    return this.resolveParentDependency(moduleName, dependantModules);
  },

  /**
   * Builds the sorted active module index map used for deterministic loading.
   *
   * @returns {void}
   * @sideEffects Writes `NODICS.indexedModules`.
   * @throws Error when two active modules share the same index.
   */
  loadModuleIndex: function () {
    let _self = this;
    let moduleIndex = {};
    let indexValue = [];
    _.each(NODICS.getRawModules(), (moduleObject, moduleName) => {
      if (
        NODICS.isModuleActive(moduleObject.metaData.name) &&
        NODICS.getRawModule(moduleObject.metaData.name) === moduleObject
      ) {
        indexValue.push(moduleObject.index);
        if (!moduleIndex[moduleObject.index]) {
          moduleIndex[moduleObject.index] = {
            index: moduleObject.index,
            name: moduleObject.name,
            path: moduleObject.path,
          };
        } else {
          throw new Error(
            "Module with index: " +
              moduleObject.index +
              " already exists: " +
              moduleIndex[moduleObject.index].name,
          );
        }
      }
    });

    let indexedValue = _self.sortModules(indexValue);
    let moduleList = new Map();
    indexedValue.forEach((key) => {
      moduleList.set(key, moduleIndex[key]);
    });
    NODICS.setIndexedModules(moduleList);
  },

  /**
   * Loads metadata for every indexed active module into the runtime module registry.
   *
   * @returns {void}
   * @sideEffects Populates `NODICS.modules` metadata entries.
   */
  loadModulesMetaData: function () {
    let _self = this;
    NODICS.getIndexedModules().forEach(function (moduleObject, index) {
      _self.loadModuleMetaData(moduleObject.name);
    });
  },

  /**
   * Loads metadata for one active module into the runtime module registry.
   *
   * @param {string} moduleName Active module name.
   * @returns {void}
   * @sideEffects Adds module metadata and path to `NODICS.modules`.
   */
  loadModuleMetaData: function (moduleName) {
    let module = NODICS.getRawModule(moduleName);
    if (module) {
      NODICS.addModule({
        metaData: module.metaData,
        modulePath: module.path,
      });
    }
  },

  /**
   * Loads configuration files from all indexed active modules.
   *
   * @param {string} [fileName=/config/properties.js] Module-relative configuration file path.
   * @returns {void}
   * @sideEffects Merges discovered configuration into `CONFIG`.
   */
  loadConfigurations: function (fileName) {
    let _self = this;
    fileName = fileName || "/config/properties.js";
    NODICS.getIndexedModules().forEach(function (moduleObject, index) {
      _self.loadModuleConfiguration(moduleObject.name, fileName);
    });
  },

  /**
   * Loads one module's configuration file.
   *
   * @param {string} moduleName Active module name.
   * @param {string} fileName Module-relative configuration file path.
   * @returns {void}
   * @sideEffects Merges module configuration into `CONFIG`.
   */
  loadModuleConfiguration: function (moduleName, fileName) {
    let module = NODICS.getRawModule(moduleName);
    if (module) {
      this.loadConfiguration(module.path + fileName);
    }
  },

  /** Builds a transient binding context from the same selected runtime, without alternate topology discovery. @param {string} filePath Authored file. @returns {Object} Trusted coordinates and lazy selected-environment metadata. */
  getPropertyBindingContext: function (filePath) {
    const runtime = (typeof NODICS !== "undefined" && NODICS) || {};
    const read = (name) =>
      typeof runtime[name] === "function" ? runtime[name]() : undefined;
    const foundationRoot = read("getNodicsHome");
    const context = {
      roots: {
        project: read("getEnvironmentPath"),
        environment: read("getServerRootPath"),
        server: read("getServerPath"),
        framework: foundationRoot && require("path").dirname(foundationRoot),
        file: require("path").dirname(filePath),
      },
      projectCode: read("getEnvironmentName"),
      environmentCode: read("getSelectedEnvironmentName"),
      serverCode: read("getServerName"),
      nodeCode: read("getNodeName"),
      environmentVariables: process.env,
    };
    context.roots.node = read("getNodePath");
    context.readPackageVersion = base => this.readConfigurationPackageVersion(context, base);
    context.readRuntimeProperty = (name, property, node) =>
      this.readRuntimeProperty(context, name, property, node);
    context.readBootstrapCompositionDefinitions = () =>
      this.readBootstrapCompositionDefinitions(context);
    return context;
  },

  /** Reads composition definitions from one module tree without resolving selected bindings. @param {string} root Module or project root. @returns {Object} Composition definitions keyed by code. */
  readBootstrapCompositionDefinitionsFromRoot: function (root) {
    const path = require("path");
    let definitions = {};
    const visit = (directory) => {
      const file = path.join(directory, "config", "properties.js");
      if (fs.existsSync(file)) {
        const properties = require(file);
        if (properties?.activeModules?.compositions) {
          definitions = configurationBindings.merge(definitions, properties.activeModules.compositions);
        }
      }
      const modulesDirectory = path.join(directory, "modules");
      if (!fs.existsSync(modulesDirectory)) return;
      fs.readdirSync(modulesDirectory, { withFileTypes: true }).filter(entry => entry.isDirectory()).forEach(entry => {
        visit(path.join(modulesDirectory, entry.name));
      });
    };
    if (root && fs.existsSync(root)) visit(root);
    return definitions;
  },

  /** Reads early composition definitions from module-owned configuration before active module resolution. @param {Object} context Optional deployment binding context. @returns {Object} Composition definitions keyed by code. */
  readBootstrapCompositionDefinitions: function (context) {
    const path = require("path");
    let definitions = {};
    if (context?.roots) {
      const roots = new Set([context.roots.project, context.roots.environment, context.roots.server, context.roots.node].filter(Boolean));
      if (context.roots.framework && context.roots.server) {
        try {
          const metadata = JSON.parse(fs.readFileSync(path.join(context.roots.server, "package.json"), "utf8"));
          [].concat(metadata.nodics?.runtimeModuleRoots || metadata.nodics?.extends || []).filter(Boolean)
            .forEach(name => roots.add(path.join(context.roots.framework, name)));
        } catch (error) {
          // Deployment context validation owns package failures.
        }
      }
      roots.forEach(root => {
        definitions = configurationBindings.merge(definitions, this.readBootstrapCompositionDefinitionsFromRoot(root));
      });
    }
    if (typeof NODICS === "undefined" || !NODICS || typeof NODICS.getRawModules !== "function") return definitions;
    _.each(NODICS.getRawModules(), (moduleObject) => {
      if (!moduleObject || !moduleObject.path) return;
      const file = path.join(moduleObject.path, "config", "properties.js");
      if (!fs.existsSync(file)) return;
      const properties = require(file);
      if (properties?.activeModules?.compositions) {
        definitions = configurationBindings.merge(definitions, properties.activeModules.compositions);
      }
    });
    return definitions;
  },

  /** Resolves explicit property bindings at the existing contribution boundary, before its normal layered merge. @param {string} filePath Existing source file. @param {Object} inherited Earlier properties. @returns {Object} Effective contribution. */
  readPropertyContribution: function (filePath, inherited, context) {
    return configurationBindings.resolve(
      require(filePath),
      inherited,
      context ? { ...context, roots: { ...context.roots, file: require("path").dirname(filePath) } } : this.getPropertyBindingContext(filePath),
    );
  },

  /** Reads the existing project/environment/server/node contributions for pre-start tooling without loading services or another descriptor. @param {Object} options Explicit deployment coordinates. @returns {Object} Resolved properties. */
  readDeploymentConfiguration: function (options) {
    const context = this.deploymentPropertyContext(options);
    const properties = this.deploymentPropertyFiles(context).reduce((properties, file) => {
      if (!fs.existsSync(file)) return properties;
      return configurationBindings.merge(properties, this.readPropertyContribution(file, properties, context));
    }, configurationBindings.merge({}, options.inheritedProperties || {}));
    let resolved = this.deriveDeploymentEnvironmentMetadata(properties, context);
    resolved = this.deriveRuntimeModuleRootDataReleaseProfiles(resolved, context);
    resolved = this.deriveDatabaseModuleDefaults(resolved);
    resolved = this.deriveRuntimePublicationFlag(resolved);
    resolved = this.deriveDeploymentRuntimeIdentity(resolved, context);
    resolved = this.deriveDeploymentServerReferences(resolved, context);
    resolved = this.deriveRuntimeRoleDataReleases(resolved);
    resolved = this.deriveRuntimeRoleInitializationProfiles(resolved, context);
    resolved = this.deriveRuntimeRoleApiExposure(resolved);
    resolved = this.deriveRuntimeRoleCopilot(resolved);
    resolved = this.deriveRuntimeRoleSearch(resolved);
    resolved = this.deriveRuntimeRoleStripeProvider(resolved);
    resolved = this.deriveRuntimeRoleHttpHardening(resolved);
    resolved = this.deriveRuntimeRoleBackofficeProfiles(resolved);
    return this.deriveRuntimeRoleCommerceProfiles(resolved);
  },

  /** Projects selected environment metadata into effective configuration without requiring authored environment properties. @param {Object} properties Resolved deployment configuration. @param {Object} context Trusted binding context. @returns {Object} Resolved configuration with derived environment identity. */
  deriveDeploymentEnvironmentMetadata: function (properties, context) {
    const path = require("node:path");
    if (!context.roots.environment || !fs.existsSync(context.roots.environment)) return properties;
    const metadata = JSON.parse(fs.readFileSync(path.join(context.roots.environment, "package.json"), "utf8"));
    const deploymentClass = metadata.nodics?.deploymentClass || metadata.nodics?.environmentClass;
    const derived = { environment: { code: context.environmentCode, module: metadata.name || context.environmentCode } };
    if (deploymentClass) derived.environment.class = String(deploymentClass).toUpperCase();
    return configurationBindings.merge(derived, properties);
  },

  /** Projects runtime identity from the selected server package metadata, keeping identity out of authored properties. @param {Object} properties Resolved deployment configuration. @param {Object} context Trusted binding context. @returns {Object} Resolved configuration with package-owned runtime identity. */
  deriveDeploymentRuntimeIdentity: function (properties, context) {
    const path = require("node:path");
    if (!context.roots.server || !fs.existsSync(context.roots.server)) return properties;
    const packageFile = path.join(context.roots.server, "package.json");
    if (!fs.existsSync(packageFile)) return properties;
    const metadata = JSON.parse(fs.readFileSync(packageFile, "utf8"));
    const identity = metadata.nodics?.runtimeIdentity;
    if (!identity) return properties;
    return configurationBindings.merge({ runtimeIdentity: _.cloneDeep(identity) }, properties);
  },

  /** Derives the legacy publish activation flag from the semantic publication runtime role. @param {Object} properties Resolved deployment configuration. @returns {Object} Configuration with effective publish activation. */
  deriveRuntimePublicationFlag: function (properties) {
    const publicationRole = properties && properties.runtimeRole && properties.runtimeRole.publication;
    if (!publicationRole) return properties;
    const resolved = _.cloneDeep(properties);
    resolved.publishEnabled = publicationRole === "STAGED";
    return resolved;
  },

  /** Applies module-owned API exposure profiles for the selected runtime role. @param {Object} properties Resolved deployment configuration. @returns {Object} Configuration with role profile folded into `apiExposure.categories`. */
  deriveRuntimeRoleApiExposure: function (properties) {
    return this.deriveRuntimeRoleProfile(properties, "apiExposure");
  },

  /** Applies module-owned Copilot profiles for the selected runtime role. @param {Object} properties Resolved deployment configuration. @returns {Object} Configuration with role profile folded into `copilot`. */
  deriveRuntimeRoleCopilot: function (properties) {
    return this.deriveRuntimeRoleProfile(properties, "copilot");
  },

  /** Applies module/customer-owned Search profiles for the selected runtime role. @param {Object} properties Resolved deployment configuration. @returns {Object} Configuration with role profile folded into `search`. */
  deriveRuntimeRoleSearch: function (properties) {
    return this.deriveRuntimeRoleProfile(properties, "search");
  },

  /** Applies customer-owned Stripe provider profiles for the selected runtime role. @param {Object} properties Resolved deployment configuration. @returns {Object} Configuration with role profile folded into `stripeProvider`. */
  deriveRuntimeRoleStripeProvider: function (properties) {
    return this.deriveRuntimeRoleProfile(properties, "stripeProvider");
  },

  /** Applies customer-owned HTTP hardening profiles for the selected runtime role. @param {Object} properties Resolved deployment configuration. @returns {Object} Configuration with role profile folded into `httpHardening`. */
  deriveRuntimeRoleHttpHardening: function (properties) {
    return this.deriveRuntimeRoleProfile(properties, "httpHardening");
  },

  /** Applies project/module-owned BackOffice profiles for the selected runtime role. @param {Object} properties Resolved deployment configuration. @returns {Object} Configuration with BackOffice profile namespaces folded into effective values. */
  deriveRuntimeRoleBackofficeProfiles: function (properties) {
    return ["backofficeApplicationInitialization", "backofficeFunctionalModuleActivationData"].reduce(
      (resolved, namespace) => this.deriveRuntimeRoleProfile(resolved, namespace),
      properties,
    );
  },

  /** Applies Commerce application/business profiles for the selected runtime role. @param {Object} properties Resolved deployment configuration. @returns {Object} Configuration with Commerce role profiles folded into capability namespaces. */
  deriveRuntimeRoleCommerceProfiles: function (properties) {
    return ["product", "cart", "fulfillmentCore"].reduce(
      (resolved, namespace) => this.deriveRuntimeRoleProfile(resolved, namespace),
      properties,
    );
  },

  /** Adds default database participation for active modules that own schemas, while preserving explicit module database overrides. @param {Object} properties Resolved deployment configuration. @returns {Object} Configuration with derived database module entries. */
  deriveDatabaseModuleDefaults: function (properties) {
    const activeModules = typeof NODICS !== "undefined" && NODICS && typeof NODICS.getActiveModules === "function"
      ? NODICS.getActiveModules() || []
      : properties?.activeModules?.modules || [];
    const derived = { database: {} };
    activeModules.forEach(moduleName => {
      if (this.moduleOwnsSchema(moduleName) && !properties?.database?.[moduleName]) {
        derived.database[moduleName] = {};
      }
    });
    return Object.keys(derived.database).length > 0
      ? configurationBindings.merge(derived, properties)
      : properties;
  },

  /** Checks package metadata for schema ownership without requiring authored database placeholders. @param {string} moduleName Active module name. @returns {boolean} True when the module owns schemas. */
  moduleOwnsSchema: function (moduleName) {
    if (typeof NODICS === "undefined" || !NODICS || typeof NODICS.getRawModule !== "function") return false;
    const rawModule = NODICS.getRawModule(moduleName);
    if (!rawModule || !rawModule.path) return false;
    const file = require("path").join(rawModule.path, "package.json");
    if (!fs.existsSync(file)) return false;
    const owns = JSON.parse(fs.readFileSync(file, "utf8")).nodics?.owns || [];
    return Array.isArray(owns) && owns.includes("schema");
  },

  /** Adds role-scoped data-release profiles from declared runtime module roots without activating their runtime behavior. @param {Object} properties Resolved deployment configuration. @param {Object} context Trusted binding context. @returns {Object} Configuration with runtime-root data-release profiles available for role projection. */
  deriveRuntimeModuleRootDataReleaseProfiles: function (properties, context) {
    const path = require("node:path");
    if (!context.roots.server) return properties;
    const packageFile = path.join(context.roots.server, "package.json");
    if (!fs.existsSync(packageFile)) return properties;
    const metadata = JSON.parse(fs.readFileSync(packageFile, "utf8"));
    const roots = [].concat(metadata.nodics?.runtimeModuleRoots || metadata.nodics?.extends || []);
    const derived = { data: { dataReleases: { runtimeRoleProfiles: {} } } };
    roots.filter(root => typeof root === "string" && root).forEach(root => {
      const candidates = [
        context.roots.framework && path.join(context.roots.framework, root, "config", "properties.js"),
        context.roots.project && path.join(context.roots.project, root, "config", "properties.js"),
      ].filter(Boolean);
      const file = candidates.find(candidate => fs.existsSync(candidate));
      if (!file) return;
      const contribution = require(file);
      const profiles = contribution?.data?.dataReleases?.runtimeRoleProfiles;
      if (profiles) this.mergeDataReleaseProfileBlock(derived.data.dataReleases.runtimeRoleProfiles, profiles);
    });
    return configurationBindings.merge(derived, properties);
  },

  /** Applies module/environment-owned data-release profiles for the selected runtime role. @param {Object} properties Resolved deployment configuration. @returns {Object} Configuration with role profile folded into `data.dataReleases`. */
  deriveRuntimeRoleDataReleases: function (properties) {
    const data = properties.data || {};
    const releases = data.dataReleases || {};
    const roleCode = properties.runtimeRole && properties.runtimeRole.code;
    const profile = roleCode && releases.runtimeRoleProfiles && releases.runtimeRoleProfiles[roleCode];
    const resolved = _.cloneDeep(properties);
    if (!profile) {
      if (resolved.data?.dataReleases) delete resolved.data.dataReleases.runtimeRoleProfiles;
      return resolved;
    }
    resolved.data = resolved.data || {};
    resolved.data.dataReleases = this.mergeDataReleaseProfileBlock(
      _.cloneDeep(releases),
      profile,
    );
    delete resolved.data.dataReleases.runtimeRoleProfiles;
    return resolved;
  },

  /** Merges data-release role profiles while accumulating contribution selectors and replacing ordered step arrays. */
  mergeDataReleaseProfileBlock: function (target, source) {
    return _.mergeWith(target, source, (targetValue, sourceValue, key) => {
      if (!Array.isArray(sourceValue)) return undefined;
      if (key === "contributions" && Array.isArray(targetValue)) {
        return targetValue.concat(sourceValue);
      }
      return sourceValue;
    });
  },

  /** Derives generic guided initialization profiles from active module data-release manifests while preserving authored project overrides. @param {Object} properties Resolved deployment configuration. @param {Object} context Trusted binding context. @returns {Object} Configuration with inferred initialization profiles. */
  deriveRuntimeRoleInitializationProfiles: function (properties, context) {
    const releases = properties.data && properties.data.dataReleases;
    const roleCode = properties.runtimeRole && properties.runtimeRole.code;
    if (!releases || !roleCode) return properties;
    const generated = this.defaultInitializationProfileForRole(roleCode, this.discoverCompatibleDataReleaseTypes(properties, context));
    if (!generated) return properties;
    const resolved = _.cloneDeep(properties);
    resolved.data = resolved.data || {};
    resolved.data.dataReleases = resolved.data.dataReleases || {};
    resolved.data.dataReleases.initializationProfiles = configurationBindings.merge(
      generated,
      resolved.data.dataReleases.initializationProfiles || {},
    );
    return resolved;
  },

  /** Returns compatible release data types for the selected runtime from module-loader state and explicit release contributions. */
  discoverCompatibleDataReleaseTypes: function (properties, context) {
    const path = require("node:path");
    const roleCode = properties.runtimeRole && properties.runtimeRole.code;
    const environmentClass = String((properties.environment && properties.environment.class) || "").toUpperCase();
    if (!roleCode) return new Set();
    const selectors = new Map();
    const activeModules = typeof NODICS !== "undefined" && NODICS && typeof NODICS.getActiveModules === "function"
      ? NODICS.getActiveModules() || []
      : [];
    activeModules.forEach(moduleName => selectors.set(moduleName, { moduleName, active: true }));
    ((properties.data && properties.data.dataReleases && properties.data.dataReleases.contributions) || []).forEach(selector => {
      if (selector && typeof selector.moduleName === "string") {
        selectors.set(selector.moduleName, Object.assign({}, selector, { active: selectors.get(selector.moduleName)?.active === true }));
      }
    });
    const dataTypes = new Set();
    selectors.forEach(selector => {
      const rawModule = typeof NODICS !== "undefined" && NODICS && typeof NODICS.getRawModule === "function"
        ? NODICS.getRawModule(selector.moduleName)
        : undefined;
      const modulePath = rawModule && rawModule.path;
      if (!modulePath) return;
      const manifestFile = path.join(modulePath, "data", "manifest.json");
      if (!fs.existsSync(manifestFile)) return;
      let manifest;
      try { manifest = JSON.parse(fs.readFileSync(manifestFile, "utf8")); } catch (error) { return; }
      Object.entries(manifest.sections || {}).forEach(([sectionCode, section]) => {
        if (!section || section.kind !== "DATA_RELEASE") return;
        if (!selector.active && !(selector.sections || []).includes(sectionCode)) return;
        if (!["init", "core", "sample"].includes(section.dataType)) return;
        if (![roleCode, "ALL"].includes(section.destinationRole)) return;
        const scope = Array.isArray(section.environmentScope) ? section.environmentScope.map(value => String(value).toUpperCase()) : [];
        if (!scope.includes("ALL") && (!environmentClass || !scope.includes(environmentClass))) return;
        dataTypes.add(section.dataType);
      });
    });
    return dataTypes;
  },

  /** Builds the conventional local foundation profile for a runtime role when manifests prove its step data types exist. */
  defaultInitializationProfileForRole: function (roleCode, availableTypes) {
    const definitions = {
      PLATFORM: ["localPlatformFoundation", "Local Platform foundation", "Platform", ["init", "core"]],
      WCMS_STAGED: ["localWcmsFoundation", "Local WCMS foundation", "Staged content", ["init", "core"]],
      PROCESS: ["localProcessWorkflowFoundation", "Local Process and Workflow foundation", "Process and Workflow", ["init"]],
      COMMERCE: ["localCommerceFoundation", "Local Commerce foundation", "Commerce", ["core"]],
      COMMERCE_STAGED: ["localCommerceStagedCatalogFoundation", "Local Commerce Staged catalog foundation", "Staged Commerce catalog", ["sample"]],
      ENGAGEMENT: ["localEngagementFoundation", "Local Engagement foundation", "Engagement", ["core", "sample"]],
      LOYALTY: ["localLoyaltyFoundation", "Local Loyalty foundation", "Loyalty", ["core"]],
      WASTE: ["localWasteFoundation", "Local Waste foundation", "Waste Management", ["core"]],
      LOCATION: ["localLocationFoundation", "Local Location foundation", "Location", ["init", "core"]],
    };
    const definition = definitions[roleCode];
    if (!definition) return undefined;
    const [code, label, subject, desiredTypes] = definition;
    const steps = desiredTypes.filter(type => availableTypes.has(type)).map(dataType => ({ dataType }));
    if (!steps.length) return undefined;
    return {
      [code]: {
        enabled: true,
        label,
        description: `Install the ${subject} releases discovered from the selected runtime module graph and compatible data manifests.`,
        completionMessage: `The ${subject} foundation is ready for this runtime. Operators can continue with governed validation and business workflows.`,
        steps,
      },
    };
  },

  /** Applies a namespace's selected runtime role profile, then removes the profile map from effective CONFIG. @param {Object} properties Resolved deployment configuration. @param {string} namespace Configuration namespace. @returns {Object} Effective configuration. */
  deriveRuntimeRoleProfile: function (properties, namespace) {
    const block = properties[namespace] || {};
    const roleCode = properties.runtimeRole && properties.runtimeRole.code;
    const profile = roleCode && block.runtimeRoleProfiles && block.runtimeRoleProfiles[roleCode];
    if (!profile) {
      if (!block.runtimeRoleProfiles) return properties;
      const resolved = _.cloneDeep(properties);
      delete resolved[namespace].runtimeRoleProfiles;
      return resolved;
    }
    const resolved = _.cloneDeep(properties);
    resolved[namespace] = _.mergeWith(
      {},
      block,
      profile,
      (target, source) => (Array.isArray(source) ? source : undefined),
    );
    delete resolved[namespace].runtimeRoleProfiles;
    return resolved;
  },

  /** Discovers sibling runtime server packages for a selected deployment environment. @param {Object} context Trusted binding context. @returns {Object[]} Server descriptors. */
  discoverDeploymentServers: function (context) {
    const path = require("node:path");
    if (!context.roots.environment || !fs.existsSync(context.roots.environment)) return [];
    return fs.readdirSync(context.roots.environment, { withFileTypes: true }).filter(entry => entry.isDirectory()).flatMap(entry => {
      const packageFile = path.join(context.roots.environment, entry.name, "package.json");
      if (!fs.existsSync(packageFile)) return [];
      const metadata = JSON.parse(fs.readFileSync(packageFile, "utf8"));
      return metadata.nodics?.kind === "server" && metadata.nodics.runtimeModule === true && metadata.nodics.retired !== true
        ? [{ code: entry.name, metadata }] : [];
    });
  },

  /** Reads a sibling server property without requiring an authored environment-level endpoint map. @param {Object} context Trusted binding context. @param {string} serverCode Target server code. @param {string} property Property path. @returns {*} Resolved value or undefined. */
  tryReadRuntimeProperty: function (context, serverCode, property) {
    try {
      return this.readRuntimeProperty(context, serverCode, property);
    } catch (error) {
      return undefined;
    }
  },

  /** Reads a sibling server's authored properties without resolving bindings or runtime compositions. @param {Object} context Trusted binding context. @param {string} serverCode Target server code. @returns {Object} Authored properties. */
  readRawDeploymentServerProperties: function (context, serverCode) {
    const path = require("node:path");
    const file = path.join(context.roots.environment, serverCode, "config", "properties.js");
    if (!fs.existsSync(file)) return {};
    return require(file);
  },

  /** Builds stable peer aliases from discovered server names, metadata aliases, and uniquely owned active modules. @param {Object} context Trusted binding context. @param {Object[]} servers Discovered servers. @returns {Object} Alias map keyed by connection/module name. */
  deriveDeploymentServerAliases: function (context, servers) {
    const aliases = {};
    const moduleOwners = new Map();
    servers.forEach(server => {
      const active = this.readRawDeploymentServerProperties(context, server.code).activeModules?.modules || [];
      [].concat(active || []).filter(moduleName => typeof moduleName === "string" && moduleName).forEach(moduleName => {
        if (!moduleOwners.has(moduleName)) moduleOwners.set(moduleName, new Set());
        moduleOwners.get(moduleName).add(server.code);
      });
    });
    servers.forEach(server => {
      const names = new Set([server.code]);
      if (/Server$/u.test(server.code)) names.add(server.code.replace(/Server$/u, ""));
      [].concat(server.metadata.nodics?.runtimeAliases || []).filter(alias => typeof alias === "string" && alias).forEach(alias => names.add(alias));
      for (const [moduleName, owners] of moduleOwners.entries()) {
        if (owners.size === 1 && owners.has(server.code)) names.add(moduleName);
      }
      aliases[server.code] = Array.from(names).sort();
    });
    return aliases;
  },

  /** Adds derived sibling runtime endpoints while preserving explicit deployment/server/node overrides. @param {Object} properties Resolved deployment configuration. @param {Object} context Trusted binding context. @returns {Object} Resolved configuration with derived peer server endpoints. */
  deriveDeploymentServerReferences: function (properties, context) {
    const servers = this.discoverDeploymentServers(context);
    if (!servers.length) return properties;
    const aliases = this.deriveDeploymentServerAliases(context, servers);
    let derived = { servers: {} };
    servers.forEach(server => {
      const endpoint = this.tryReadRuntimeProperty(context, server.code, "servers.default.abstractEndpoint") ||
        this.tryReadRuntimeProperty(context, server.code, "servers.default.endpoint");
      if (!endpoint) return;
      const browserEndpoint = this.tryReadRuntimeProperty(context, server.code, "servers.default.browserEndpoint");
      (aliases[server.code] || [server.code]).forEach(alias => {
        derived.servers[alias] = { endpoint: _.cloneDeep(endpoint) };
        if (server.code !== context.serverCode) derived.servers[alias].remoteOnly = true;
        if (browserEndpoint) derived.servers[alias].browserEndpoint = _.cloneDeep(browserEndpoint);
      });
    });
    return configurationBindings.merge(derived, properties);
  },

  /** Validates concrete deployment boundaries and creates the same binding coordinates used at startup. @param {Object} options Explicit project/environment and optional server/node. @returns {Object} Trusted binding context. */
  deploymentPropertyContext: function (options) {
    const path = require("node:path");
    const project = path.resolve(options.projectRoot);
    const validName = value => typeof value === "string" && /^[A-Za-z][A-Za-z0-9_.-]{0,127}$/.test(value) && ![".", ".."].includes(value);
    if (!validName(options.environmentCode) || (options.serverCode && !validName(options.serverCode)) ||
        (options.nodeCode && (!options.serverCode || !validName(options.nodeCode))))
      throw new Error("Configuration requires valid selected deployment coordinates");
    const environment = path.join(project, "envs", options.environmentCode);
    const server = options.serverCode ? path.join(environment, options.serverCode) : undefined;
    const node = options.nodeCode ? path.join(server, options.nodeCode) : undefined;
    for (const [root, kind] of [[environment, "group"], [server, "server"], [node, "node"]]) {
      if (!root) continue;
      const relative = path.relative(fs.realpathSync(project), fs.realpathSync(root));
      if (relative.startsWith("..") || path.isAbsolute(relative)) throw new Error("Runtime configuration escapes project boundary");
      const metadata = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
      if (metadata.nodics?.kind !== kind || metadata.nodics.runtimeModule !== true || metadata.nodics.retired === true)
        throw new Error("Configuration target is not a declared runtime " + kind);
    }
    const metadata = JSON.parse(fs.readFileSync(path.join(project, "package.json"), "utf8"));
    const context = {
      roots: { project, environment, server, node, framework: options.frameworkRoot || require("node:path").resolve(__dirname, "../../../../..") },
      projectCode: metadata.name,
      environmentCode: options.environmentCode,
      serverCode: options.serverCode,
      nodeCode: options.nodeCode,
      environmentVariables: options.environmentVariables || process.env,
      runtimeReferences: options.runtimeReferences || [],
    };
    context.readPackageVersion = base => this.readConfigurationPackageVersion(context, base);
    context.readRuntimeProperty = (name, property, selectedNode) => this.readRuntimeProperty(context, name, property, selectedNode);
    context.readBootstrapCompositionDefinitions = () => this.readBootstrapCompositionDefinitions(context);
    return context;
  },

  /** Reads a selected package version from its existing manifest, without a second metadata registry. @param {Object} context Trusted binding roots. @param {string} base Project or framework. @returns {string} Declared package version. */
  readConfigurationPackageVersion: function (context, base) {
    if (!["project", "framework"].includes(base) || !context.roots[base]) throw new Error("Package version requires a selected package root");
    const metadata = JSON.parse(fs.readFileSync(require("node:path").join(context.roots[base], "package.json"), "utf8"));
    if (typeof metadata.version !== "string" || !metadata.version || metadata.version.length > 128) throw new Error("Selected package requires a declared version");
    return metadata.version;
  },

  /** Returns existing configuration paths in the selected-runtime order; structural envs containers contribute no runtime properties. @param {Object} context Deployment binding context. @returns {string[]} Files. */
  deploymentPropertyFiles: function (context) {
    const path = require("node:path");
    return [context.roots.project, context.roots.environment, context.roots.server, context.roots.node]
      .filter(Boolean).map(root => path.join(root, "config", "properties.js"));
  },

  /** Projects a sibling runtime's declared configuration without booting it or creating an endpoint registry. @param {Object} parent Existing deployment context. @param {string} name Target server. @param {string|string[]} property Bounded property path. @param {string} node Optional explicit target node. @returns {*} Resolved field. */
  readRuntimeProperty: function (parent, name, property, node) {
    const parts = configurationBindings.propertyPath(property);
    const references = parent.runtimeReferences || (parent.runtimeReferences = []);
    const key = JSON.stringify([parent.environmentCode, name, node || "", parts]);
    if (references.length >= 32 || references.includes(key)) throw new Error("Runtime configuration reference cycle or depth limit");
    references.push(key);
    try {
      const context = this.deploymentPropertyContext({ projectRoot: parent.roots.project,
        environmentCode: parent.environmentCode, serverCode: name, nodeCode: node,
        frameworkRoot: parent.roots.framework, environmentVariables: parent.environmentVariables, runtimeReferences: references });
      // Resolve only the requested property and its references. Resolving all peers would
      // turn valid bidirectional service connections into recursive full server loads.
      const layers = this.deploymentPropertyFiles(context).filter(file => fs.existsSync(file))
        .map(file => ({properties:require(file),directory:require("node:path").dirname(file)}));
      return configurationBindings.resolveLayeredProperty(layers, parts, context);
    } finally { references.pop(); }
  },

  /** Discovers selectable environment modules by explicit package kind, without deriving identity from a naming convention. @param {string} projectRoot Project directory. @returns {Object[]} Environment coordinates and metadata. */
  discoverDeploymentEnvironments: function (projectRoot) {
    const path = require("node:path");
    const root = path.join(projectRoot, "envs");
    if (!fs.existsSync(root)) return [];
    return fs.readdirSync(root, { withFileTypes: true }).filter(entry => entry.isDirectory()).flatMap(entry => {
      const packageFile = path.join(root, entry.name, "package.json");
      if (!fs.existsSync(packageFile)) return [];
      const metadata = JSON.parse(fs.readFileSync(packageFile, "utf8"));
      return metadata.nodics?.kind === "group" && metadata.nodics.runtimeModule === true
        ? [{ code: entry.name, metadata }] : [];
    });
  },

  /**
   * Loads a concrete configuration file if it exists.
   *
   * @param {string} filePath Absolute configuration file path.
   * @returns {void}
   * @sideEffects Requires file and merges exports into `CONFIG.properties`.
   */
  loadConfiguration: function (filePath) {
    let config = CONFIG.getProperties() || {};
    if (fs.existsSync(filePath)) {
      this.LOG.debug(
        "Loading configuration file from : " +
          filePath.replace(NODICS.getNodicsHome(), "."),
      );
      var propertyFile = this.readPropertyContribution(filePath, config);
      CONFIG.setProperties(configurationBindings.merge(config, propertyFile));
    }
  },

  /**
   * Loads external property files into default or tenant-specific configuration.
   *
   * @param {string[]} [externalFiles] Explicit property file list; defaults to `CONFIG.externalPropertyFile`.
   * @param {string} [tntCode] Tenant code for tenant-specific config merge.
   * @returns {void}
   * @sideEffects Merges external files into `CONFIG`, logs missing files.
   */
  loadExternalProperties: function (externalFiles, tntCode) {
    let _self = this;
    let files = externalFiles || CONFIG.get("externalPropertyFile");
    if (files && files.length > 0) {
      files.forEach(function (filePath) {
        if (fs.existsSync(filePath)) {
          _self.LOG.debug(
            "Loading configuration file from : " +
              filePath.replace(NODICS.getNodicsHome(), "."),
          );
          let props = tntCode
            ? CONFIG.getProperties(tntCode) || {}
            : CONFIG.getProperties() || {};
          CONFIG.setProperties(
            configurationBindings.merge(
              props,
              _self.readPropertyContribution(filePath, props),
            ),
            tntCode,
          );
        } else {
          _self.LOG.warn(
            "System cannot find configuration at : " +
              filePath.replace(NODICS.getNodicsHome(), "."),
          );
        }
      });
    }
  },

  /**
   * Initializes shared enums and classes before module entities are loaded.
   *
   * @param {Object} options Startup options.
   * @returns {Promise<boolean>} Resolves after enum and class registries are loaded.
   * @sideEffects Populates `ENUMS` and `CLASSES`; exits process if core registries are missing.
   */
  initUtilities: function (options) {
    return new Promise((resolve, reject) => {
      try {
        if (!CONFIG || !NODICS) {
          this.LOG.error(
            "System initialization error: configuration initializer failure.",
          );
          process.exit(1);
        }
        enumService.LOG.info("Starting Enums loader process");
        enumService.loadEnums();
        classesLoader.LOG.info("Starting Classes loader process");
        classesLoader.loadClasses();
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  },

  /**
   * Loads all indexed active modules recursively in sorted module index order.
   *
   * @param {string[]} [modules] Module index values to load; defaults to all indexed modules.
   * @returns {Promise<boolean>} Resolves after all modules are loaded.
   * @throws Rejects when any module load fails.
   */
  loadModules: async function (modules) {
    if (modules === undefined) {
      if (NODICS.getLifecycleOperation() === "start")
        infra.validateBuildManifest();
      const generated = {
        name: NODICS.getServerName(),
        path: NODICS.getServerPath(),
        generatedBaseline: true,
      };
      for (const layer of ["Services", "Facades", "Controllers"]) {
        await this["load" + layer](generated);
      }
      modules = Array.from(NODICS.getIndexedModules().keys());
    }
    for (const moduleIndex of modules) {
      await this.loadModule(NODICS.getIndexedModules().get(moduleIndex).name);
    }
    return true;
  },

  /**
   * Loads one module's nodics.js lifecycle, services, pipelines, facades, and controllers.
   *
   * @param {string} moduleName Active module name.
   * @returns {Promise<boolean>} Resolves after module runtime artifacts are loaded.
   * @sideEffects Requires module `nodics.js`, populates dynamic registries, and creates module logger.
   * @throws Rejects when module init or artifact loading fails.
   */
  loadModule: function (moduleName) {
    let _self = this;
    return new Promise((resolve, reject) => {
      _self.LOG.debug("Starting process for module : " + moduleName);
      let moduleObject = NODICS.getRawModule(moduleName);
      let moduleFile = require(moduleObject.path + "/nodics.js");
      if (moduleFile.init) {
        moduleFile.LOG = logger.createLogger("Module-" + moduleName);
        Promise.resolve(moduleFile.init(moduleObject))
          .then((success) => {
            _self
              .loadServices(moduleObject)
              .then(() => {
                return _self.loadPipelinesDefinition(moduleObject);
              })
              .then(() => {
                return _self.loadFacades(moduleObject);
              })
              .then(() => {
                return _self.loadControllers(moduleObject);
              })
              .then(() => {
                resolve(true);
              })
              .catch((error) => {
                reject(error);
              });
          })
          .catch((error) => {
            reject(error);
          });
      } else {
        _self
          .loadServices(moduleObject)
          .then(() => {
            return _self.loadPipelinesDefinition(moduleObject);
          })
          .then(() => {
            return _self.loadFacades(moduleObject);
          })
          .then(() => {
            return _self.loadControllers(moduleObject);
          })
          .then(() => {
            resolve(true);
          })
          .catch((error) => {
            reject(error);
          });
      }
    });
  },

  /**
   * Loads service artifacts from a module and merges with existing services by name.
   *
   * Later-loaded modules may override or extend earlier services by exporting the same
   * service name, preserving Nodics layered override behavior.
   *
   * @param {Object} module Raw module metadata containing path and name.
   * @returns {Promise<boolean>} Resolves after services are loaded.
   * @sideEffects Populates or merges entries in global `SERVICE` and assigns service loggers.
   */
  loadServices: function (module) {
    let _self = this;
    return new Promise((resolve, reject) => {
      _self.LOG.debug("  Loading all module services");
      let path = module.generatedBaseline
        ? NODICS.getGeneratedArtifactPath("service")
        : module.path + "/src/service";
      try {
        if (
          module.generatedBaseline &&
          !fs.existsSync(path) &&
          NODICS.getLifecycleOperation() === "start"
        ) {
          throw new Error(
            "Generated service artifacts are missing for server " +
              module.name +
              ". Run the selected project server build before startup: " +
              path,
          );
        }
        fileLoader.processFiles(
          path,
          "Service.js",
          (file) => {
            let serviceName = UTILS.getFileNameWithoutExtension(file);
            if (module.generatedBaseline)
              delete require.cache[require.resolve(file)];
            let artifact = _.merge({}, require(file));
            if (SERVICE[serviceName]) {
              SERVICE[serviceName] = _.merge(SERVICE[serviceName], artifact);
              fileLoader.recordArtifactContribution(SERVICE[serviceName], {
                name: serviceName,
                layer: "service",
                sourceModule: module.name,
                action: "override",
                filePath: file,
                contribution: artifact,
                generatedBaseline: module.generatedBaseline === true,
              });
            } else {
              SERVICE[serviceName] = artifact;
              SERVICE[serviceName].LOG = logger.createLogger(serviceName);
              fileLoader.recordArtifactContribution(SERVICE[serviceName], {
                name: serviceName,
                layer: "service",
                sourceModule: module.name,
                action: "create",
                filePath: file,
                contribution: artifact,
                generatedBaseline: module.generatedBaseline === true,
              });
            }
          },
          { excludeGenerated: !module.generatedBaseline },
        );
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  },

  /**
   * Loads pipeline definition artifacts from a module and merges with existing definitions.
   *
   * @param {Object} module Raw module metadata containing path and name.
   * @returns {Promise<boolean>} Resolves after pipeline definitions are loaded.
   * @sideEffects Populates or merges entries in global `PIPELINE`.
   */
  loadPipelinesDefinition: function (module) {
    let _self = this;
    return new Promise((resolve, reject) => {
      _self.LOG.debug("  Loading all module process definitions");
      let pipelinePath = module.path + "/src/pipelines";
      try {
        fileLoader.processFiles(pipelinePath, "Definition.js", (file) => {
          let processName = UTILS.getFileNameWithoutExtension(file);
          let artifact = require(file);
          if (PIPELINE[processName]) {
            PIPELINE[processName] = _.merge(PIPELINE[processName], artifact);
            fileLoader.recordArtifactContribution(PIPELINE[processName], {
              name: processName,
              layer: "pipeline",
              sourceModule: module.name,
              action: "override",
              filePath: file,
              contribution: artifact,
              generatedBaseline: module.generatedBaseline === true,
            });
          } else {
            PIPELINE[processName] = artifact;
            fileLoader.recordArtifactContribution(PIPELINE[processName], {
              name: processName,
              layer: "pipeline",
              sourceModule: module.name,
              action: "create",
              filePath: file,
              contribution: artifact,
              generatedBaseline: module.generatedBaseline === true,
            });
          }
        });
        let registryPath = pipelinePath + "/pipelines.js";
        if (fs.existsSync(registryPath)) {
          let pipelineRegistry = require(registryPath);
          Object.keys(pipelineRegistry).forEach((processName) => {
            let artifact = pipelineRegistry[processName];
            if (PIPELINE[processName]) {
              PIPELINE[processName] = _.merge(PIPELINE[processName], artifact);
              fileLoader.recordArtifactContribution(PIPELINE[processName], {
                name: processName,
                layer: "pipeline",
                sourceModule: module.name,
                action: "override",
                filePath: registryPath,
                contribution: artifact,
              });
            } else {
              PIPELINE[processName] = artifact;
              fileLoader.recordArtifactContribution(PIPELINE[processName], {
                name: processName,
                layer: "pipeline",
                sourceModule: module.name,
                action: "create",
                filePath: registryPath,
                contribution: artifact,
              });
            }
          });
        }
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  },

  /**
   * Loads facade artifacts from a module and merges with existing facades by name.
   *
   * @param {Object} module Raw module metadata containing path and name.
   * @returns {Promise<boolean>} Resolves after facades are loaded.
   * @sideEffects Populates or merges entries in global `FACADE` and assigns facade loggers.
   */
  loadFacades: function (module) {
    let _self = this;
    return new Promise((resolve, reject) => {
      _self.LOG.debug("  Loading all module facades");
      let path = module.generatedBaseline
        ? NODICS.getGeneratedArtifactPath("facade")
        : module.path + "/src/facade";
      try {
        if (
          module.generatedBaseline &&
          !fs.existsSync(path) &&
          NODICS.getLifecycleOperation() === "start"
        ) {
          throw new Error(
            "Generated facade artifacts are missing for server " +
              module.name +
              ". Run the selected project server build before startup: " +
              path,
          );
        }
        fileLoader.processFiles(
          path,
          "Facade.js",
          (file) => {
            let facadeName = UTILS.getFileNameWithoutExtension(file);
            if (module.generatedBaseline)
              delete require.cache[require.resolve(file)];
            let artifact = _.merge({}, require(file));
            if (FACADE[facadeName]) {
              FACADE[facadeName] = _.merge(FACADE[facadeName], artifact);
              fileLoader.recordArtifactContribution(FACADE[facadeName], {
                name: facadeName,
                layer: "facade",
                sourceModule: module.name,
                action: "override",
                filePath: file,
                contribution: artifact,
                generatedBaseline: module.generatedBaseline === true,
              });
            } else {
              FACADE[facadeName] = artifact;
              FACADE[facadeName].LOG = logger.createLogger(facadeName);
              fileLoader.recordArtifactContribution(FACADE[facadeName], {
                name: facadeName,
                layer: "facade",
                sourceModule: module.name,
                action: "create",
                filePath: file,
                contribution: artifact,
                generatedBaseline: module.generatedBaseline === true,
              });
            }
          },
          { excludeGenerated: !module.generatedBaseline },
        );
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  },

  /**
   * Loads controller artifacts from a module and merges with existing controllers by name.
   *
   * @param {Object} module Raw module metadata containing path and name.
   * @returns {Promise<boolean>} Resolves after controllers are loaded.
   * @sideEffects Populates or merges entries in global `CONTROLLER` and assigns controller loggers.
   */
  loadControllers: function (module) {
    let _self = this;
    return new Promise((resolve, reject) => {
      _self.LOG.debug("  Loading all module controllers");
      let path = module.generatedBaseline
        ? NODICS.getGeneratedArtifactPath("controller")
        : module.path + "/src/controller";
      try {
        if (
          module.generatedBaseline &&
          !fs.existsSync(path) &&
          NODICS.getLifecycleOperation() === "start"
        ) {
          throw new Error(
            "Generated controller artifacts are missing for server " +
              module.name +
              ". Run the selected project server build before startup: " +
              path,
          );
        }
        fileLoader.processFiles(
          path,
          "Controller.js",
          (file) => {
            let controllerName = UTILS.getFileNameWithoutExtension(file);
            if (module.generatedBaseline)
              delete require.cache[require.resolve(file)];
            let artifact = _.merge({}, require(file));
            if (CONTROLLER[controllerName]) {
              CONTROLLER[controllerName] = _.merge(
                CONTROLLER[controllerName],
                artifact,
              );
              fileLoader.recordArtifactContribution(
                CONTROLLER[controllerName],
                {
                  name: controllerName,
                  layer: "controller",
                  sourceModule: module.name,
                  action: "override",
                  filePath: file,
                  contribution: artifact,
                  generatedBaseline: module.generatedBaseline === true,
                },
              );
            } else {
              CONTROLLER[controllerName] = artifact;
              CONTROLLER[controllerName].LOG =
                logger.createLogger(controllerName);
              fileLoader.recordArtifactContribution(
                CONTROLLER[controllerName],
                {
                  name: controllerName,
                  layer: "controller",
                  sourceModule: module.name,
                  action: "create",
                  filePath: file,
                  contribution: artifact,
                  generatedBaseline: module.generatedBaseline === true,
                },
              );
            }
          },
          { excludeGenerated: !module.generatedBaseline },
        );
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  },

  /**
   * Executes entity initialization in service, facade, then controller order.
   *
   * @returns {Promise<boolean>} Resolves after all entity init hooks complete.
   * @throws Rejects when any entity init hook fails.
   */
  initEntities: function () {
    let _self = this;
    return new Promise((resolve, reject) => {
      _self.LOG.debug("Initializing all entities");
      _self
        .initServices()
        .then(() => {
          return _self.initFacades();
        })
        .then(() => {
          return _self.initControllers();
        })
        .then(() => {
          resolve(true);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  /**
   * Executes `init` hooks for all loaded services.
   *
   * @returns {Promise<boolean>} Resolves after service init hooks complete.
   * @throws Rejects when any service init hook fails.
   */
  initServices: function () {
    let _self = this;
    return new Promise((resolve, reject) => {
      let allPromise = [];
      _.each(SERVICE, (serviceClass, serviceName) => {
        if (serviceClass.init && typeof serviceClass.init === "function") {
          allPromise.push(serviceClass.init());
        }
      });
      if (allPromise.length > 0) {
        _self.LOG.debug("  Initializing all Services");
        Promise.all(allPromise)
          .then((success) => {
            resolve(true);
          })
          .catch((error) => {
            reject(error);
          });
      } else {
        resolve(true);
      }
    });
  },

  /**
   * Executes `init` hooks for all loaded facades.
   *
   * @returns {Promise<boolean>} Resolves after facade init hooks complete.
   * @throws Rejects when any facade init hook fails.
   */
  initFacades: function () {
    let _self = this;
    return new Promise((resolve, reject) => {
      let allPromise = [];
      _.each(FACADE, (facadeClass, facadeName) => {
        if (facadeClass.init && typeof facadeClass.init === "function") {
          allPromise.push(facadeClass.init());
        }
      });
      if (allPromise.length > 0) {
        _self.LOG.debug("  Initializing all Facades");
        Promise.all(allPromise)
          .then((success) => {
            resolve(true);
          })
          .catch((error) => {
            reject(error);
          });
      } else {
        resolve(true);
      }
    });
  },

  /**
   * Executes `init` hooks for all loaded controllers.
   *
   * @returns {Promise<boolean>} Resolves after controller init hooks complete.
   * @throws Rejects when any controller init hook fails.
   */
  initControllers: function () {
    let _self = this;
    return new Promise((resolve, reject) => {
      let allPromise = [];
      _.each(CONTROLLER, (controllerClass, controllerName) => {
        if (
          controllerClass.init &&
          typeof controllerClass.init === "function"
        ) {
          allPromise.push(controllerClass.init());
        }
      });
      if (allPromise.length > 0) {
        _self.LOG.debug("  Initializing all Controllers");
        Promise.all(allPromise)
          .then((success) => {
            resolve(true);
          })
          .catch((error) => {
            reject(error);
          });
      } else {
        resolve(true);
      }
    });
  },

  /**
   * Executes post-initialization in service, facade, then controller order.
   *
   * @returns {Promise<boolean>} Resolves after all entity post-init hooks complete.
   * @throws Rejects when any entity post-init hook fails.
   */
  finalizeEntities: function () {
    let _self = this;
    return new Promise((resolve, reject) => {
      _self.LOG.debug("Finalizing all entities");
      _self
        .finalizeServices()
        .then(() => {
          return _self.finalizeFacades();
        })
        .then(() => {
          return _self.finalizeControllers();
        })
        .then(() => {
          resolve(true);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  /**
   * Executes `postInit` hooks for all loaded services.
   *
   * @returns {Promise<boolean>} Resolves after service post-init hooks complete.
   * @throws Rejects when any service post-init hook fails.
   */
  finalizeServices: function () {
    let _self = this;
    return new Promise((resolve, reject) => {
      let allPromise = [];
      _.each(SERVICE, (serviceClass, serviceName) => {
        if (
          serviceClass.postInit &&
          typeof serviceClass.postInit === "function"
        ) {
          allPromise.push(serviceClass.postInit());
        }
      });
      if (allPromise.length > 0) {
        _self.LOG.debug("  Finalizing all Services");
        Promise.all(allPromise)
          .then((success) => {
            resolve(true);
          })
          .catch((error) => {
            reject(error);
          });
      } else {
        resolve(true);
      }
    });
  },

  /**
   * Executes `postInit` hooks for all loaded facades.
   *
   * @returns {Promise<boolean>} Resolves after facade post-init hooks complete.
   * @throws Rejects when any facade post-init hook fails.
   */
  finalizeFacades: function () {
    let _self = this;
    return new Promise((resolve, reject) => {
      let allPromise = [];
      _.each(FACADE, (facadeClass, facadeName) => {
        if (
          facadeClass.postInit &&
          typeof facadeClass.postInit === "function"
        ) {
          allPromise.push(facadeClass.postInit());
        }
      });
      if (allPromise.length > 0) {
        _self.LOG.debug("  Finalizing all Facades");
        Promise.all(allPromise)
          .then((success) => {
            resolve(true);
          })
          .catch((error) => {
            reject(error);
          });
      } else {
        resolve(true);
      }
    });
  },

  /**
   * Executes `postInit` hooks for all loaded controllers.
   *
   * @returns {Promise<boolean>} Resolves after controller post-init hooks complete.
   * @throws Rejects when any controller post-init hook fails.
   */
  finalizeControllers: function () {
    let _self = this;
    return new Promise((resolve, reject) => {
      let allPromise = [];
      _.each(CONTROLLER, (controllerClass, controllerName) => {
        if (
          controllerClass.postInit &&
          typeof controllerClass.postInit === "function"
        ) {
          allPromise.push(controllerClass.postInit());
        }
      });
      if (allPromise.length > 0) {
        _self.LOG.debug("  Finalizing all controllers");
        Promise.all(allPromise)
          .then((success) => {
            resolve(true);
          })
          .catch((error) => {
            reject(error);
          });
      } else {
        resolve(true);
      }
    });
  },

  /**
   * Finalizes all indexed active modules recursively in module index order.
   *
   * @param {string[]} [modules] Module index values to finalize; defaults to all indexed modules.
   * @returns {Promise<boolean>} Resolves after all module post-init hooks complete.
   * @throws Rejects when any module finalize hook fails.
   */
  finalizeModules: function (
    modules = Array.from(NODICS.getIndexedModules().keys()),
  ) {
    let _self = this;
    return new Promise((resolve, reject) => {
      if (modules && modules.length > 0) {
        let moduleIndex = modules.shift();
        let moduleName = NODICS.getIndexedModules().get(moduleIndex).name;
        _self
          .finalizeModule(moduleName)
          .then((success) => {
            _self
              .finalizeModules(modules)
              .then((success) => {
                resolve(true);
              })
              .catch((error) => {
                reject(error);
              });
          })
          .catch((error) => {
            reject(error);
          });
      } else {
        resolve(true);
      }
    });
  },

  /**
   * Executes one module's `nodics.js` postInit hook when present.
   *
   * @param {string} moduleName Active module name.
   * @returns {Promise<boolean>} Resolves after module post-init completes or when no hook exists.
   * @throws Rejects when module post-init fails.
   */
  finalizeModule: function (moduleName) {
    let _self = this;
    return new Promise((resolve, reject) => {
      _self.LOG.debug("Starting process to finalize module : " + moduleName);
      let moduleObject = NODICS.getRawModule(moduleName);
      let moduleFile = require(moduleObject.path + "/nodics.js");
      if (moduleFile.postInit && typeof moduleFile.postInit === "function") {
        Promise.resolve(moduleFile.postInit(moduleObject))
          .then((success) => {
            resolve(true);
          })
          .catch((error) => {
            reject(error);
          });
      } else {
        resolve(true);
      }
    });
  },
};
