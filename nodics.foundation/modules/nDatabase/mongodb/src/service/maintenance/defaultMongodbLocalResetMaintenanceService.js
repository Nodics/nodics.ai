/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
const { AsyncLocalStorage } = require("node:async_hooks");
const { isDeepStrictEqual } = require("node:util");
const observations = new WeakMap();
const requests = new WeakMap();
const invocation = new AsyncLocalStorage();
// Deny-only invocation history: removing request markers never turns a known tenant destination into a base target.
const protectedDestinations = new Set();

const scope = {
  /** Freezes private plain metadata without publishing it as reset authority. @param {*} value Private metadata. @returns {*} Frozen value. */
  freeze: function (value) {
    if (value && typeof value === "object") {
      Object.values(value).forEach(item => scope.freeze(item));
      Object.freeze(value);
    }
    return value;
  },

  /** Checks invocation-bound derived target authority, never a caller flag or serialized proof. @param {Object} options Exact owner request. @returns {boolean} Whether the exact configuration remains privately admitted. */
  registered: function (options) {
    const proof = requests.get(options);
    return !!proof && proof.context.active === true && invocation.getStore() === proof.context &&
      options.project === proof.context.project && options.environment === proof.context.environment &&
      isDeepStrictEqual(options.configuration, proof.configuration);
  },

  /** Validates a native read/reset endpoint; only privately admitted derived targets escape the original name/prefix restriction. @param {Object} options Owner request. @param {boolean} derived Private admission result. @returns {Object} Exact configuration. */
  nativeTarget: function (options, derived) {
    const target = options.configuration || {};
    if (!/^[A-Za-z][A-Za-z0-9_]{0,127}$/.test(options.environment || "") ||
        (!derived && (!/^[A-Za-z][A-Za-z0-9_]{0,127}$/.test(target.databaseName || "") ||
          !target.databaseName.startsWith(options.environment) || protectedDestinations.has(target.databaseName))) ||
        ["admin", "local", "config"].includes(target.databaseName))
      throw new Error("RESET_MONGO_SCOPE_INVALID");
    return target;
  },
};

/**
 * @module mongodb/service/maintenance/defaultMongodbLocalResetMaintenanceService
 * @description Explicit offline disposable native database inspection/drop with exact scope, bounded count-only readback and owned connection cleanup. Never called by startup or generic reset.
 * @owner nDatabase @layer service
 * @override Preserve explicit operator attestations, native standalone scope and count-only receipts when replacing this provider.
 */
module.exports = {
  /** Parses one explicitly configured loopback seed using the canonical Mongo URI parser. Replica-set intent requires exact fresh hello proof before provider operations. @param {Object} configuration Selected channel configuration. @returns {Object} Non-secret seed/replica intent, not exclusivity evidence. */
  validateLocalEndpointConfiguration: function (configuration) {
    try {
      const ConnectionString = require("mongodb-connection-string-url").default;
      if (typeof configuration?.URI !== "string" || configuration.URI.length > 16384 ||
          configuration.options?.proxyHost || configuration.options?.proxyPort || configuration.options?.loadBalanced)
        throw new Error();
      const parsed = new ConnectionString(configuration.URI);
      if (parsed.isSRV || parsed.hosts.length !== 1 || parsed.hash || parsed.pathname && parsed.pathname !== "/") throw new Error();
      const endpoint = this.validateLocalMember(parsed.hosts[0]);
      let replicaSet = configuration.options?.replicaSet;
      let seen = false;
      for (const [key, value] of parsed.searchParams) {
        if (key.toLowerCase() !== "replicaset" || seen || replicaSet !== undefined && replicaSet !== value) throw new Error();
        seen = true;
        replicaSet = value;
      }
      if (replicaSet !== undefined && (typeof replicaSet !== "string" || !/^[A-Za-z0-9._-]{1,128}$/.test(replicaSet))) throw new Error();
      return { endpoint, replicaSet: replicaSet || null };
    } catch { throw new Error("RESET_MONGO_SCOPE_INVALID"); }
  },
  /** Validates a bounded explicitly reported native Mongo member without DNS or credential interpretation. @param {string} member Seed or hello member. @returns {string} Exact normalized loopback endpoint. */
  validateLocalMember: function (member) {
    let url;
    try { url = new URL("mongodb://" + member); } catch { throw new Error("RESET_MONGO_MEMBER_INVALID"); }
    if (typeof member !== "string" || member.length > 256 || !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) ||
        url.username || url.password || url.search || url.hash || url.pathname && url.pathname !== "/" ||
        url.port && (!Number.isInteger(Number(url.port)) || Number(url.port) < 1 || Number(url.port) > 65535))
      throw new Error("RESET_MONGO_MEMBER_INVALID");
    return url.hostname + ":" + (url.port || "27017");
  },
  /** Requires writable native hello with all announced members loopback and an exact configured replica-set identity. @param {Object} configuration Selected channel. @param {Object} topology Fresh hello response. @returns {Object} Private normalized topology identity; not ownership/exclusivity proof. */
  validateLocalTopology: function (configuration, topology) {
    const intent = this.validateLocalEndpointConfiguration(configuration);
    if (!topology || topology.msg === "isdbgrid" || topology.readOnly === true ||
        !(topology.isWritablePrimary === true || topology.ismaster === true))
      throw new Error("RESET_MONGO_NATIVE_TOPOLOGY_REQUIRED");
    if (!intent.replicaSet && !topology.setName) {
      if (topology.setName || topology.hosts || topology.passives || topology.arbiters)
        throw new Error("RESET_MONGO_NATIVE_TOPOLOGY_REQUIRED");
      return { replicaSet: null, members: [intent.endpoint], primary: intent.endpoint, me: intent.endpoint };
    }
    if (typeof topology.setName !== "string" || !/^[A-Za-z0-9._-]{1,128}$/.test(topology.setName) ||
        intent.replicaSet && topology.setName !== intent.replicaSet || !Array.isArray(topology.hosts) || !topology.hosts.length ||
        [topology.passives, topology.arbiters].some(value => value !== undefined && !Array.isArray(value)))
      throw new Error("RESET_MONGO_NATIVE_TOPOLOGY_REQUIRED");
    const reported = [...topology.hosts, ...(topology.passives || []), ...(topology.arbiters || [])];
    if (reported.length > 16) throw new Error("RESET_MONGO_NATIVE_TOPOLOGY_REQUIRED");
    const members = reported.map(member => this.validateLocalMember(member)).sort();
    const primary = this.validateLocalMember(topology.primary);
    const me = this.validateLocalMember(topology.me);
    if (new Set(members).size !== members.length || !members.includes(primary) || primary !== me ||
        me !== intent.endpoint) throw new Error("RESET_MONGO_NATIVE_TOPOLOGY_REQUIRED");
    return { replicaSet: topology.setName, members, primary, me };
  },
  /** Reads actual installed hello through one direct owner connection, with no indexes, data writes or reset admission. @param {Object} configuration Explicit source-selected channel. @returns {Promise<Object>} Count-only read receipt, never exclusivity evidence. */
  inspectLocalTopology: async function (configuration) {
    this.validateLocalEndpointConfiguration(configuration);
    const client = this.createClient(configuration);
    try {
      await client.connect();
      const hello = await client.db(configuration.databaseName).command({ hello: 1 }, { maxTimeMS: 5000 });
      const identity = this.validateLocalTopology(configuration, hello);
      return { topology: identity.replicaSet ? "LOCAL_REPLICA_SET" : "LOCAL_STANDALONE",
        memberCount: identity.members.length, writablePrimary: true, loopbackMembersOnly: true,
        independentExclusivityProof: false, effects: 0 };
    } finally { await client.close(); }
  },
  /** Validates the exact provider target independently of tooling's selection. */
  validate: function (options) {
    if (((requests.has(options) || options.registeredTenants !== undefined) && !scope.registered(options)) ||
        options.exclusiveDeployment !== true || options.writersExcluded !== true)
      throw new Error("RESET_MONGO_SCOPE_INVALID");
    const target = scope.nativeTarget(options, scope.registered(options));
    this.validateLocalEndpointConfiguration(target);
    return target;
  },
  /** Reads exact registered tenant and enterprise provenance through one native maintenance connection; no schema initialization or writes. @param {Object} options Explicit project/environment/configuration/registeredTenants. @returns {Promise<Object>} Private frozen observation, not a public receipt. */
  readRegisteredTenantBindings: async function (options) {
    const target = scope.nativeTarget(options, false);
    this.validateLocalEndpointConfiguration(target);
    if (!/^[A-Za-z][A-Za-z0-9._-]{0,127}$/.test(options.project || "") ||
        !Array.isArray(options.registeredTenants) || !options.registeredTenants.length || options.registeredTenants.length > 32 ||
        new Set(options.registeredTenants).size !== options.registeredTenants.length ||
        options.registeredTenants.some(code => !/^[A-Za-z0-9._-]{1,128}$/.test(code) || ["__proto__", "constructor", "prototype"].includes(code)))
      throw new Error("RESET_TENANT_SELECTION_INVALID");
    const client = this.createClient(target);
    try {
      await client.connect();
      const db = client.db(target.databaseName);
      this.validateLocalTopology(target, await db.command({ hello: 1 }, { maxTimeMS: 5000 }));
      const tenants = [];
      for (const code of options.registeredTenants.slice().sort()) {
        const read = async (collection, query, projection, maximum) => {
          const cursor = db.collection(collection).find(query, { projection, readPreference: "primary", maxTimeMS: 5000 }).limit(maximum + 1);
          try {
            const rows = await cursor.toArray();
            if (!Array.isArray(rows) || rows.length > maximum) throw new Error("RESET_TENANT_READ_INVALID");
            return rows;
          } finally { await cursor.close(); }
        };
        const rows = await read("TenantModel", { code }, {
          _id: 1, code: 1, active: 1, revision: 1, versionId: 1, updated: 1, "properties.database": 1,
        }, 1);
        const enterprises = await read("EnterpriseModel", { tenant: code, active: true }, {
          _id: 1, code: 1, tenant: 1, active: 1, revision: 1, versionId: 1, updated: 1,
        }, 32);
        if (rows.length !== 1 || rows[0].code !== code || rows[0].active !== true || !rows[0]._id ||
            !rows[0].properties?.database?.tenantNamespaceBindings || !enterprises.length ||
            enterprises.some(row => !row._id || !row.code || row.tenant !== code || row.active !== true))
          throw new Error("RESET_REGISTERED_TENANT_REQUIRED");
        if (Object.keys(rows[0].properties.database.tenantNamespaceBindings).length > 32 ||
            Buffer.byteLength(JSON.stringify(rows[0]), "utf8") > 1048576)
          throw new Error("RESET_TENANT_READ_BOUND_EXCEEDED");
        tenants.push({ ...rows[0], _id: String(rows[0]._id), enterprises: enterprises.map(row => ({ ...row, _id: String(row._id) })) });
      }
      const receipt = scope.freeze(JSON.parse(JSON.stringify({ project: options.project, environment: options.environment, tenants })));
      observations.set(receipt, { used: false });
      return receipt;
    } finally { await client.close(); }
  },
  /** Recognizes only an actual owner-read observation under the exact selected project/environment/tenant set. @param {Object} receipt Private observation. @param {Object} options Selected scope. @returns {boolean} Genuine scoped evidence. */
  isRegisteredTenantObservation: function (receipt, options) {
    return observations.has(receipt) && receipt.project === options.project && receipt.environment === options.environment &&
      isDeepStrictEqual(receipt.tenants.map(row => row.code).sort(), [...(options.registeredTenants || [])].sort());
  },
  /** Holds one-use private authority for exactly pinned, fresh source-resolved derived targets during the awaited maintenance invocation. @param {Object} receipt Genuine observation. @param {Object} options Explicit operator scope. @param {Object[]} targets Resolved derived destinations. @param {Function} operation Awaited owner callback receiving a scoped request wrapper. @returns {Promise<*>} Callback result; no authority survives completion. */
  withRegisteredTenantTargets: async function (receipt, options, targets, operation) {
    if (!this.isRegisteredTenantObservation(receipt, options) || observations.get(receipt).used ||
        options.exclusiveDeployment !== true || options.writersExcluded !== true || typeof operation !== "function" ||
        !Array.isArray(targets) || !targets.length || targets.length > 8192)
      throw new Error("RESET_REGISTERED_PROOF_REQUIRED");
    const handler = global.SERVICE?.DefaultMongodbDatabaseConnectionHandlerService || require("../connection/defaultMongodbDatabaseConnectionHandlerService");
    const configOwner = global.SERVICE?.DefaultDatabaseConfigurationService || require("../../../../database/src/service/config/defaultDatabaseConfigurationService");
    const destinations = new Map(), seen = new Set();
    for (const target of targets) {
      const tenant = receipt.tenants.find(row => row.code === target.tenantCode);
      const stored = tenant?.properties.database.tenantNamespaceBindings[target.candidate?.scopeKey];
      configOwner.validateTenantNamespaceBindingCandidate(target.candidate, {
        tenantCode: target.tenantCode, projectCode: options.project, environmentCode: options.environment, serverCode: target.serverCode,
      });
      if (!stored || !isDeepStrictEqual(stored, target.candidate.binding)) throw new Error("RESET_TENANT_PIN_CHANGED");
      if (stored.modules[target.moduleName]?.databaseType !== "mongodb" ||
          stored.modules[target.moduleName]?.connectionHandler !== "DefaultMongodbDatabaseConnectionHandlerService")
        throw new Error("RESET_TENANT_PROVIDER_UNSUPPORTED");
      const pin = stored.modules[target.moduleName]?.channels[target.channel];
      const key = JSON.stringify([target.tenantCode, target.candidate.scopeKey, target.moduleName, target.channel]);
      if (!pin || pin.base.databaseType !== "mongodb" || pin.base.connectionHandler !== "DefaultMongodbDatabaseConnectionHandlerService" ||
          seen.has(key) || target.configuration.databaseName !== pin.destination.databaseName ||
          target.baseConfiguration.databaseName !== pin.base.databaseName || target.configuration.databaseName === target.baseConfiguration.databaseName ||
          handler.getTenantEndpointFingerprint(target.configuration) !== pin.destination.endpointFingerprint ||
          handler.getTenantEndpointFingerprint(target.baseConfiguration) !== pin.base.endpointFingerprint)
        throw new Error("RESET_TENANT_DESTINATION_CHANGED");
      seen.add(key);
      handler.validateTenantDatabaseName(target.configuration.databaseName);
      scope.nativeTarget({ ...options, configuration: target.configuration }, true);
      this.validateLocalEndpointConfiguration(target.configuration);
      const configuration = scope.freeze(structuredClone(target.configuration));
      const existing = destinations.get(configuration.databaseName);
      if (existing && !isDeepStrictEqual(existing, configuration)) throw new Error("RESET_TENANT_ENDPOINT_AMBIGUOUS");
      destinations.set(configuration.databaseName, configuration);
    }
    for (const tenant of receipt.tenants) {
      for (const [scopeKey, binding] of Object.entries(tenant.properties.database.tenantNamespaceBindings)) {
        for (const [moduleName, module] of Object.entries(binding.modules)) {
          if (module.databaseType !== "mongodb" || module.connectionHandler !== "DefaultMongodbDatabaseConnectionHandlerService")
            throw new Error("RESET_TENANT_PROVIDER_UNSUPPORTED");
          for (const channel of Object.keys(module.channels)) {
            if (!seen.has(JSON.stringify([tenant.code, scopeKey, moduleName, channel]))) throw new Error("RESET_TENANT_SCOPE_INCOMPLETE");
          }
        }
      }
    }
    const context = { project: options.project, environment: options.environment, active: true };
    if (new Set([...protectedDestinations, ...destinations.keys()]).size > 8192)
      throw new Error("RESET_REGISTERED_PROOF_BOUND_EXCEEDED");
    for (const name of destinations.keys()) protectedDestinations.add(name);
    observations.get(receipt).used = true;
    return invocation.run(context, async () => {
      try {
        return await operation(async (configuration, callback) => {
          if (!context.active || invocation.getStore() !== context || typeof callback !== "function" ||
              !isDeepStrictEqual(destinations.get(configuration.databaseName), configuration))
            throw new Error("RESET_REGISTERED_PROOF_REQUIRED");
          const request = { ...options, configuration: destinations.get(configuration.databaseName) };
          requests.set(request, { context, configuration: request.configuration });
          return callback(request);
        });
      } finally { context.active = false; }
    });
  },
  /** Opens only one native owner-configured database, without creating collections or indexes. */
  open: async function (options) {
    const target = this.validate(options);
    const client = this.createClient(target);
    try {
      await client.connect();
      return await this.bind(options, client, client.db(target.databaseName));
    } catch {
      let cleanupFailedCount = 0;
      try { await client.close(); } catch { cleanupFailedCount++; }
      const error = new Error("RESET_MONGO_OPEN_FAILED");
      error.cleanupFailedCount = cleanupFailedCount;
      throw error;
    }
  },
  /** Keeps SDK construction within the provider owner; isolated fixtures replace this exported member only. */
  createClient: function (target) {
    const { MongoClient } = require("mongodb");
    return new MongoClient(target.URI, { ...(target.options || {}),
      directConnection: true, serverSelectionTimeoutMS: 3000, connectTimeoutMS: 3000,
      socketTimeoutMS: 10000, retryWrites: false });
  },
  /** Creates a private held target from a provider client; injected clients are used only by isolated provider fixtures. */
  bind: async function (options, client, db) {
    const target = this.validate(options);
    if (db.databaseName !== target.databaseName || typeof db.dropDatabase !== "function" ||
        typeof db.command !== "function" || typeof db.listCollections !== "function" || typeof client.close !== "function")
      throw new Error("RESET_MONGO_BINDING_INVALID");
    let topology;
    try { topology = await db.command({ hello: 1 }, { maxTimeMS: 5000 }); }
    catch { throw new Error("RESET_MONGO_TOPOLOGY_UNCONFIRMED"); }
    const topologyIdentity = this.validateLocalTopology(target, topology);
    let inspected = false, closed = false;
    const count = async () => {
      if (closed) throw new Error("RESET_MONGO_CLIENT_CLOSED");
      let cursor;
      try { cursor = db.listCollections({}, { nameOnly: true, maxTimeMS: 5000 }); }
      catch { throw new Error("RESET_MONGO_INSPECTION_UNCONFIRMED"); }
      let total = 0;
      try {
        for await (const ignored of cursor) {
          if (++total > 1000) throw new Error("RESET_MONGO_COLLECTION_BOUND_EXCEEDED");
        }
      } catch { throw new Error("RESET_MONGO_INSPECTION_UNCONFIRMED"); }
      finally { try { await cursor.close(); } catch { throw new Error("RESET_MONGO_CURSOR_CLOSE_FAILED"); } }
      return { collectionCount: total };
    };
    return {
      contractVersion: 1,
      inspect: async () => { const result = await count(); inspected = true; return result; },
      drop: async () => {
        this.validate(options);
        if (closed || !inspected) throw new Error("RESET_MONGO_INSPECTION_REQUIRED");
        const fresh = this.validateLocalTopology(target, await db.command({ hello: 1 }, { maxTimeMS: 5000 }));
        if (!isDeepStrictEqual(fresh, topologyIdentity)) throw new Error("RESET_MONGO_TOPOLOGY_CHANGED");
        inspected = false;
        let acknowledged;
        try { acknowledged = await db.dropDatabase({ writeConcern: { w: 1, j: true }, maxTimeMS: 5000 }); }
        catch { throw new Error("RESET_MONGO_DROP_UNCERTAIN"); }
        if (acknowledged !== true) throw new Error("RESET_MONGO_DROP_UNACKNOWLEDGED");
        return { acknowledged: true };
      },
      verifyEmpty: async () => {
        const result = await count();
        if (result.collectionCount !== 0) throw new Error("RESET_MONGO_NOT_EMPTY");
        return result;
      },
      close: async () => { if (!closed) { closed = true; await client.close(); } },
    };
  },
};
