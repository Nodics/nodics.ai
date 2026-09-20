/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const _ = require("lodash");
const path = require("node:path");

/**
 * @module config/service/DefaultConfigurationBindingService
 * @description Resolves explicit declarative property bindings during the existing nConfig loading sequence, without code evaluation or a separate configuration authority.
 * @layer service
 * @owner config
 * @override Later layers customize source values and bindings. New binding operators require the same bounded bootstrap contract; no arbitrary provider, script or expression execution is supported.
 */
module.exports = {
  /** Applies a resolved contribution atomically with explicit collection semantics; ordinary arrays retain positional compatibility. @param {Object|Array} inherited Earlier configuration. @param {Object|Array} contribution Resolved contribution. @returns {Object|Array} Independent effective configuration. */
  merge: function (inherited, contribution) {
    return _.mergeWith(
      _.cloneDeep(inherited),
      contribution,
      (previous, next) => {
        if (
          !_.isPlainObject(next) ||
          !["replace", "keyed"].includes(next.$config)
        )
          return undefined;
        if (next.$config === "replace")
          return this.merge(Array.isArray(next.value) ? [] : {}, next.value);
        return this.mergeKeyedCollection(previous, next);
      },
    );
  },

  /** Projects one property through the normal contribution boundaries, resolving only its dependencies. @param {Object[]} layers Authored contributions with their file directories. @param {string|string[]} property Bounded path. @param {Object} context Selected runtime binding context. @returns {*} Independent effective property. */
  resolveLayeredProperty: function (layers, property, context) {
    const cache = new Map(), active = new Set();
    const read = (input, index) => {
      const parts = this.propertyPath(input);
      if (index < 0) return undefined;
      const key = JSON.stringify([index, parts]);
      if (cache.has(key)) return _.cloneDeep(cache.get(key));
      if (active.has(key) || active.size >= 64 || cache.size >= 250000) throw new Error("Configuration projection cycle or bounded limit");
      active.add(key);
      try {
        const layer = layers[index];
        for (let length = 1; length < parts.length; length++) {
          const prefix = _.get(layer.properties, parts.slice(0, length));
          if (_.isPlainObject(prefix) && prefix.$config) {
            const value = _.get(read(parts.slice(0, length), index), parts.slice(length));
            cache.set(key, _.cloneDeep(value));
            return value;
          }
        }
        const earlier = read(parts, index - 1);
        const declaration = _.get(layer.properties, parts);
        if (declaration === undefined) { cache.set(key, _.cloneDeep(earlier)); return earlier; }
        const current = this.resolve({value:declaration}, {}, {
          ...context, roots:{...context.roots,file:layer.directory},
          readLayeredProperty: dependency => read(dependency, index),
        });
        const value = this.merge({value:earlier}, current).value;
        cache.set(key, _.cloneDeep(value));
        return value;
      } finally { active.delete(key); }
    };
    const result = read(property, layers.length - 1);
    if (result === undefined) throw new Error("Configuration reference is unavailable: " + this.propertyPath(property).join('.'));
    return _.cloneDeep(result);
  },

  /** Merges explicitly identified entries, rejecting ambiguous identities and retaining order for existing entries. Removal is explicit and absent removals are idempotent. @param {Array|undefined} inherited Earlier list. @param {Object} declaration Resolved keyed operation. @returns {Array} Effective entries. */
  mergeKeyedCollection: function (inherited, declaration) {
    if (inherited !== undefined && !Array.isArray(inherited))
      throw new Error(
        "Configuration keyed collection requires an inherited array",
      );
    const entries = inherited || [],
      key = declaration.key;
    const identity = (item) => {
      if (!_.isPlainObject(item) || typeof item[key] !== "string" || !item[key])
        throw new Error(
          "Configuration collection entry requires a string identity",
        );
      return item[key];
    };
    const codes = entries.map(identity),
      updates = declaration.entries.map(identity);
    if (
      new Set(codes).size !== codes.length ||
      new Set(updates).size !== updates.length ||
      updates.some((code) => declaration.remove.includes(code))
    )
      throw new Error("Configuration collection identities conflict");
    const result = entries
      .filter((item) => !declaration.remove.includes(identity(item)))
      .map((item) => _.cloneDeep(item));
    for (const entry of declaration.entries) {
      const position = result.findIndex(
        (item) => identity(item) === identity(entry),
      );
      const value = this.merge(position < 0 ? {} : result[position], entry);
      if (position < 0) result.push(value);
      else result[position] = value;
    }
    return result;
  },

  /** Resolves one authored contribution against already loaded properties and runtime coordinates. @param {Object} contribution Source properties. @param {Object} inherited Earlier effective properties. @param {Object} context Trusted bootstrap coordinates. @returns {Object} Resolved contribution. */
  resolve: function (contribution, inherited = {}, context = {}) {
    const state = {
      contribution,
      inherited,
      context,
      nodes: 0,
      references: [],
      compositions: new Map(),
    };
    return this.resolveValue(contribution, state, 0, false);
  },

  /** Walks authored values once, retaining normal object/array semantics and expanding only explicit bindings. @param {*} value Source value. @param {Object} state Resolution state. @param {number} depth Current depth. @param {boolean} arrayItem Whether spread is permitted. @returns {*} Resolved value. */
  resolveValue: function (value, state, depth, arrayItem) {
    if (++state.nodes > 250000 || depth > 64)
      throw new Error(
        "Configuration binding exceeds bounded resolution limits",
      );
    if (!value || typeof value !== "object") return value;
    if (Array.isArray(value)) {
      const result = [];
      for (const item of value) {
        const resolved = this.resolveValue(item, state, depth + 1, true);
        if (item && Object.prototype.hasOwnProperty.call(item, "$config")) {
          if (resolved === undefined) continue;
          if (item.spread === true) {
            if (!Array.isArray(resolved))
              throw new Error("Configuration spread requires an array");
            result.push(...resolved);
            continue;
          }
        }
        result.push(resolved);
      }
      return result;
    }
    if (!_.isPlainObject(value)) return _.cloneDeep(value);
    if (Object.prototype.hasOwnProperty.call(value, "$config")) {
      if (value.spread === true && !arrayItem)
        throw new Error(
          "Configuration spread is only permitted inside an array",
        );
      return this.resolveBinding(value, state, depth + 1);
    }
    const result = {};
    for (const [key, item] of Object.entries(value)) {
      if (["__proto__", "prototype", "constructor"].includes(key))
        throw new Error("Unsafe configuration property key");
      const resolved = this.resolveValue(item, state, depth + 1, false);
      if (resolved !== undefined || !(item && item.$config))
        result[key] = resolved;
    }
    return result;
  },

  /** Validates a bounded property reference without prototype traversal. @param {string|string[]} value Reference path. @returns {string[]} Safe path segments. */
  propertyPath: function (value) {
    const parts = Array.isArray(value)
      ? value.slice()
      : typeof value === "string"
        ? value.split(".")
        : [];
    if (
      !parts.length ||
      parts.length > 32 ||
      parts.some(
        (part) =>
          typeof part !== "string" ||
          !part ||
          ["__proto__", "prototype", "constructor"].includes(part),
      )
    )
      throw new Error("Invalid configuration reference path");
    return parts;
  },

  /** Resolves the finite binding vocabulary; source values never become executable code. @param {Object} binding Declarative binding. @param {Object} state Resolution state. @param {number} depth Current depth. @returns {*} Resolved value. */
  resolveBinding: function (binding, state, depth) {
    const allowed = {
      env: ["name", "fallback", "type"],
      ref: ["path", "fields"],
      runtime: ["name", "path", "node", "fields"],
      context: ["name"],
      path: ["base", "relative"],
      composition: ["name", "field"],
      selected: ["name", "field", "includes", "value", "otherwise"],
      all: ["values"],
      replace: ["value"],
      keyed: ["key", "entries", "remove"],
    };
    if (
      !Object.prototype.hasOwnProperty.call(allowed, binding.$config) ||
      Object.keys(binding).some(
        (key) =>
          !["$config", "spread", ...allowed[binding.$config]].includes(key),
      ) ||
      (binding.spread !== undefined && typeof binding.spread !== "boolean")
    )
      throw new Error("Invalid configuration binding declaration");
    const resolve = (value) =>
      this.resolveValue(value, state, depth + 1, false);
    if (binding.$config === "replace") {
      const value = resolve(binding.value);
      if (
        binding.spread !== undefined ||
        (!Array.isArray(value) && !_.isPlainObject(value))
      )
        throw new Error(
          "Configuration replacement requires an object or array",
        );
      return { $config: "replace", value };
    }
    if (binding.$config === "keyed") {
      const entries = resolve(binding.entries || []),
        remove = resolve(binding.remove || []);
      if (
        binding.spread !== undefined ||
        typeof binding.key !== "string" ||
        !/^[A-Za-z][A-Za-z0-9_]*$/.test(binding.key) ||
        ["constructor", "prototype"].includes(binding.key) ||
        !Array.isArray(entries) ||
        !Array.isArray(remove) ||
        entries.length + remove.length > 10000 ||
        remove.some((code) => typeof code !== "string" || !code) ||
        new Set(remove).size !== remove.length
      )
        throw new Error("Invalid configuration keyed collection");
      return { $config: "keyed", key: binding.key, entries, remove };
    }
    if (binding.$config === "env") {
      if (
        typeof binding.name !== "string" ||
        !/^[A-Z][A-Z0-9_]*$/.test(binding.name) ||
        (binding.type !== undefined &&
          !["string", "boolean", "number"].includes(binding.type))
      )
        throw new Error("Invalid configuration environment binding");
      const environment = state.context.environmentVariables || process.env;
      let value = Object.prototype.hasOwnProperty.call(
        environment,
        binding.name,
      )
        ? environment[binding.name]
        : undefined;
      if (value === undefined || value === "") return resolve(binding.fallback);
      if (binding.type === "boolean") {
        if (!["true", "false"].includes(value))
          throw new Error(
            "Configuration environment boolean must be true or false: " +
              binding.name,
          );
        return value === "true";
      }
      if (binding.type === "number") {
        const number = Number(value);
        if (!Number.isFinite(number))
          throw new Error(
            "Configuration environment number must be finite: " + binding.name,
          );
        return number;
      }
      return value;
    }
    if (binding.$config === "runtime") {
      if (typeof state.context.readRuntimeProperty !== "function")
        throw new Error("Runtime binding requires a selected deployment");
      this.propertyPath(binding.path);
      return this.projectFields(state.context.readRuntimeProperty(binding.name, binding.path, binding.node), binding.fields);
    }
    if (binding.$config === "context") {
      if (
        !["projectCode", "environmentCode", "serverCode", "nodeCode", "projectVersion", "frameworkVersion"].includes(
          binding.name,
        )
      )
        throw new Error("Unknown configuration context field");
      if (["projectVersion", "frameworkVersion"].includes(binding.name)) {
        if (typeof state.context.readPackageVersion !== "function") throw new Error("Package version requires a selected runtime context");
        return state.context.readPackageVersion(binding.name === "projectVersion" ? "project" : "framework");
      }
      return state.context[binding.name];
    }
    if (binding.$config === "path") {
      const base =
        typeof binding.base === "string" &&
        ["project", "framework", "environment", "server", "file"].includes(
          binding.base,
        )
          ? state.context.roots && state.context.roots[binding.base]
          : resolve(binding.base);
      if (
        typeof base !== "string" ||
        !base ||
        !path.isAbsolute(base) ||
        typeof binding.relative !== "string"
      )
        throw new Error(
          "Configuration path requires a trusted absolute base and relative string",
        );
      return path.resolve(base, binding.relative);
    }
    if (binding.$config === "all") {
      if (
        !Array.isArray(binding.values) ||
        binding.values.length === 0 ||
        binding.values.length > 32
      )
        throw new Error(
          "Configuration all binding requires bounded boolean inputs",
        );
      const values = binding.values.map(resolve);
      if (values.some((value) => typeof value !== "boolean"))
        throw new Error("Configuration all binding requires boolean values");
      return values.every(Boolean);
    }
    if (binding.$config === "ref") {
      if (typeof state.context.readLayeredProperty === "function") {
        const value = state.context.readLayeredProperty(this.propertyPath(binding.path));
        if (value === undefined) throw new Error("Configuration reference is unavailable");
        return this.projectFields(value, binding.fields);
      }
      const parts = this.propertyPath(binding.path);
      const key = JSON.stringify(parts);
      if (state.references.includes(key))
        throw new Error("Configuration reference cycle");
      state.references.push(key);
      try {
        const earlier = _.get(state.inherited, parts);
        const current = _.get(state.contribution, parts);
        if (current === undefined && earlier === undefined)
          throw new Error(
            "Configuration reference is unavailable: " + parts.join("."),
          );
        const resolved = resolve(current === undefined ? earlier : current);
        if (
          current !== undefined &&
          _.isPlainObject(current) &&
          !current.$config &&
          _.isPlainObject(earlier)
        )
          return this.projectFields(this.merge(earlier, resolved), binding.fields);
        return this.projectFields(this.merge({ value: earlier }, { value: resolved }).value, binding.fields);
      } finally {
        state.references.pop();
      }
    }
    if (
      typeof binding.name !== "string" ||
      !/^[A-Za-z][A-Za-z0-9_.-]{0,127}$/.test(binding.name)
    )
      throw new Error("Invalid configuration composition name");
    if (!state.compositions.has(binding.name)) {
      const definitions = typeof state.context.readLayeredProperty === "function"
        ? state.context.readLayeredProperty(["activeModules", "compositions"]) || {}
        : this.merge(_.get(state.inherited, "activeModules.compositions", {}), _.get(state.contribution, "activeModules.compositions", {}));
      if (!Object.prototype.hasOwnProperty.call(definitions, binding.name))
        throw new Error(
          "Configuration composition is unavailable: " + binding.name,
        );
      state.compositions.set(
        binding.name,
        this.resolveDomainComposition(
          definitions[binding.name],
          "",
          state.context.environmentVariables || process.env,
        ),
      );
    }
    const composition = state.compositions.get(binding.name);
    const value = binding.field
      ? _.get(composition, this.propertyPath(binding.field))
      : composition;
    if (binding.field && value === undefined)
      throw new Error("Configuration composition field is unavailable");
    if (binding.$config === "selected") {
      if (!Array.isArray(value) || typeof binding.includes !== "string")
        throw new Error(
          "Configuration selected binding requires an array and item name",
        );
      return resolve(
        value.includes(binding.includes) ? binding.value : binding.otherwise,
      );
    }
    return resolve(value);
  },

  /** Projects bounded direct fields from a resolved property without creating another configuration source. @param {*} value Resolved input. @param {string[]} fields Optional selected fields. @returns {*} Independent projection. */
  projectFields: function (value, fields) {
    if (fields === undefined) return value;
    if (!Array.isArray(fields) || !fields.length || fields.length > 64 ||
        new Set(fields).size !== fields.length || fields.some(field =>
          typeof field !== "string" || this.propertyPath(field).length !== 1))
      throw new Error("Configuration projection fields must be distinct property names");
    const pick = item => {
      if (!_.isPlainObject(item) || fields.some(field => !Object.prototype.hasOwnProperty.call(item, field)))
        throw new Error("Configuration projection field is unavailable");
      return Object.fromEntries(fields.map(field => [field, _.cloneDeep(item[field])]));
    };
    if (Array.isArray(value)) {
      if (value.length > 10000) throw new Error("Configuration projection exceeds bounded limits");
      return value.map(pick);
    }
    return pick(value);
  },

  /** Resolves the existing environment-owned domain composition contract for runtime and tooling consumers. @param {Object} config Declared composition. @param {string} value Explicit selection. @param {Object} environment Environment values. @returns {Object} Selected module/contribution facts. */
  resolveDomainComposition: function (
    config = {},
    value = "",
    environment = process.env,
  ) {
    const entries = config.domains || [];
    if (
      !Array.isArray(entries) ||
      entries.length > 256 ||
      entries.some(
        (entry) =>
          !entry ||
          typeof entry.code !== "string" ||
          !/^[A-Za-z][A-Za-z0-9_.-]{0,127}$/.test(entry.code),
      ) ||
      new Set(entries.map((entry) => entry.code)).size !== entries.length
    )
      throw new Error("Invalid environment composition domains");
    const supported = Object.fromEntries(
      entries.map((entry) => [entry.code, entry]),
    );
    const variable = config.environmentVariable;
    if (
      variable !== undefined &&
      (typeof variable !== "string" || !/^[A-Z][A-Z0-9_]*$/.test(variable))
    )
      throw new Error(
        "Composition environmentVariable must be an explicit environment variable name",
      );
    const selection =
      value ||
      (variable ? environment[variable] : "") ||
      config.selection ||
      "all";
    if (typeof selection !== "string")
      throw new Error("Composition selection must be a string");
    const emptySelections = config.emptySelections || ["none"];
    if (
      !Array.isArray(emptySelections) ||
      emptySelections.some((item) => typeof item !== "string")
    )
      throw new Error("Invalid composition emptySelections");
    const requested =
      selection === "all"
        ? entries.map((entry) => entry.code)
        : emptySelections.includes(selection)
          ? []
          : selection
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean);
    const domains = [...new Set(requested)];
    if (
      domains.some(
        (domain) => !Object.prototype.hasOwnProperty.call(supported, domain),
      )
    )
      throw new Error("Unsupported domain composition selection");
    const contributors = new Set(domains);
    for (const domain of domains)
      for (const implied of supported[domain]
        .impliedProductSearchContributorDomains || []) {
        if (!Object.prototype.hasOwnProperty.call(supported, implied))
          throw new Error("Unknown implied composition contributor");
        contributors.add(implied);
      }
    return {
      domains,
      frameworkGroups: domains
        .map((domain) => supported[domain].frameworkGroup)
        .filter(Boolean),
      sharedModules: (config.sharedModules || [])
        .filter(
          (rule) => domains.length >= Number(rule.minSelectedDomains || 0),
        )
        .map((rule) => rule.module)
        .filter(Boolean),
      projectPacks: domains
        .map((domain) => supported[domain].projectPack)
        .filter(Boolean),
      productSearchContributors: Object.fromEntries(
        [...contributors]
          .sort()
          .map((domain) => [domain, supported[domain].productSearchContributor])
          .filter(([, contributor]) => contributor),
      ),
    };
  },
};
