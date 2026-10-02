/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
const { cloneDeep } = require("lodash");
const { isDeepStrictEqual } = require("node:util");
const reads = new WeakMap(), writes = new WeakMap();
const protectedPaths = ["properties.enterpriseProvisioning", "properties.database.tenantNamespace", "properties.database.tenantNamespaceBindings"];

/**
 * @module profile/service/enterprise/DefaultTenantProvisioningGuardService
 * @description Protects lifecycle provenance and durable storage bindings on the existing Tenant owner. Admission is private request identity, never a DTO/system flag.
 * @layer service
 * @owner profile
 * @override Preserve protected-path mutation/search denial and private unchanged-request admission through later layers.
 */
module.exports = {
  /** Fixed owner rejection without provenance or database diagnostics. */
  fail: function () { throw new CLASSES.NodicsError("ERR_PROFILE_TENANT_PROVISIONING_HELD"); },
  /** Snapshots authoritative request inputs independently of generated pipeline decoration. */
  snapshot: function (request) { return cloneDeep([request.tenant, request.authData, request.query, request.model, request.options?.upsert]); },
  /** Recognizes only the exact unchanged request during the bounded owning operation. */
  owns: function (map, request) { return map.has(request) && isDeepStrictEqual(map.get(request), this.snapshot(request)); },
  /** Runs one fixed generated Tenant operation with non-serializable, temporary owner admission. */
  invoke: async function (operation, request) {
    if (!["get", "save", "update"].includes(operation) || request.tenant !== (CONFIG.get("defaultTenant") || "default") ||
        typeof SERVICE.DefaultTenantService?.[operation] !== "function") this.fail();
    const logger = SERVICE.DefaultLoggerService;
    if (typeof logger?.runSensitiveOperation !== "function") this.fail();
    return logger.runSensitiveOperation(request, () => this.invokePrivate(operation, request));
  },
  /** Owns detached private preparation and generated dispatch; never serializable admission. */
  invokePrivate: async function (operation, request) {
    if (!["get", "save", "update"].includes(operation) || request.tenant !== (CONFIG.get("defaultTenant") || "default")) this.fail();
    if (operation === "save") {
      // Prepare canonical defaults/query before capturing the unchanged private
      // request; the generated pipeline must not invalidate its own admission.
      request.schemaModel = NODICS.getModels(CONFIG.get("profileModuleName") || "profile", request.tenant)?.TenantModel;
      if (!request.schemaModel || typeof SERVICE.DefaultModelSaveInitializerService?.applyDefaultValues !== "function" ||
          typeof request.model?.code !== "string") this.fail();
      // A concurrent creation must not overwrite a namespace already committed
      // by another request. Tenant's unique code index makes a conflicting
      // upsert reject rather than creating a second logical authority.
      request.query = { code: request.model.code, properties: { $exists: false } };
      await new Promise((resolve, reject) => SERVICE.DefaultModelSaveInitializerService.applyDefaultValues(request, {}, {
        nextSuccess: resolve, error: (_request, _response, error) => reject(error)
      }));
    }
    const map = operation === "get" ? reads : writes;
    if (map.has(request)) this.fail();
    map.set(request, this.snapshot(request));
    try { return await SERVICE.DefaultTenantService[operation](request); }
    finally { map.delete(request); }
  },
  /** Detects ancestors, descendants and nested/operator references to protected paths. */
  touches: function (value, prefix = "") {
    if (!value || typeof value !== "object") return false;
    if (Array.isArray(value)) return value.some(item => this.touches(item, prefix));
    for (const [key, child] of Object.entries(value)) {
      const path = key.startsWith("$") ? prefix : (prefix ? prefix + "." : "") + key;
      if (path && protectedPaths.some(item => item === path || item.startsWith(path + ".") || path.startsWith(item + "."))) return true;
      if (typeof child === "string" && child.startsWith("$") && protectedPaths.some(item => child.slice(1) === item || child.slice(1).startsWith(item + "."))) return true;
      if (this.touches(child, path)) return true;
    }
    return false;
  },
  /** Generic queries cannot filter/sort/project private lifecycle authority. */
  protectRead: function (request) {
    if (this.owns(reads, request)) return true;
    if (this.touches(request.query) || this.touches(request.searchOptions) || this.touches(request.options)) this.fail();
    return true;
  },
  /** Initial generic configuration is allowed only without lifecycle authority or replacement/upsert semantics. */
  protectSave: async function (request) {
    if (this.owns(writes, request)) return true;
    if (request.options?.upsert || request.model?._id || this.touches(request.query) || this.touches(request.model)) this.fail();
    if (typeof request.model?.code !== "string" || !request.model.code) this.fail();
    // Existence needs no protected metadata. Default Init runs before private
    // capture qualification; keep this ordinary generated read redacted.
    if (typeof SERVICE.DefaultTenantService?.get !== "function") this.fail();
    const envelope = await SERVICE.DefaultTenantService.get({
      tenant: CONFIG.get("defaultTenant") || "default", authData: SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
      query: { code: request.model.code }, options: { recursive: false, skipItemCache: true },
      searchOptions: { pageSize: 2, pageNumber: 1 },
    });
    if (!/^SUC_/.test(envelope?.code || "") || envelope.success === false || envelope.error ||
        envelope.errors?.length || !Array.isArray(envelope.result)) this.fail();
    if (envelope.result.length) {
      const original = envelope.result[0];
      const authority = CONFIG.get("defaultTenant") || "default";
      if (envelope.result.length !== 1 || !original._id || original.code !== authority ||
          request.tenant !== authority || request.model.code !== authority ||
          SERVICE.DefaultDataReleaseService?.isStartupReleaseExecution(request.tenant) !== true)
        this.fail();
      // Only reapply unprotected seed fields. Never replace properties or upsert
      // a removed authority record while an upgrade is in progress.
      request.query = { code: authority, _id: original._id };
      request.options = { ...request.options, upsert: false };
    }
    return true;
  },
  /** Only bounded dotted $set/$unset updates outside protected paths are ordinary customization. */
  protectUpdate: function (request) {
    if (this.owns(writes, request)) return true;
    const model = request.model;
    if (!model || Array.isArray(model) || request.options?.upsert || this.touches(request.query)) this.fail();
    for (const [key, value] of Object.entries(model)) {
      if (key.startsWith("$") && !["$set", "$unset"].includes(key)) this.fail();
      if (this.touches({ [key]: value })) this.fail();
    }
    return true;
  },
  /** Tenant removal cannot discard lifecycle authority; retirement needs its existing owning lifecycle. */
  protectRemove: function () { this.fail(); },
  /** Redacts independent copies, including Tenant references in recursive Enterprise envelopes. */
  redact: function (request, response) {
    if (this.owns(reads, request)) return true;
    const seen = new WeakSet();
    const visit = value => {
      if (!value || typeof value !== "object" || seen.has(value)) return;
      seen.add(value);
      if (value.properties && typeof value.properties === "object") {
        delete value.properties.enterpriseProvisioning;
        if (value.properties.database && typeof value.properties.database === "object") {
          delete value.properties.database.tenantNamespace;
          delete value.properties.database.tenantNamespaceBindings;
        }
      }
      for (const child of Object.values(value)) visit(child);
    };
    for (const envelope of [response, response?.success]) {
      if (envelope && Object.hasOwn(envelope, "result")) {
        envelope.result = cloneDeep(envelope.result); visit(envelope.result);
      }
    }
    return true;
  }
};
