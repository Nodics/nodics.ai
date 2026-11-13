/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
const crypto = require("node:crypto");
const { isDeepStrictEqual } = require("node:util");
const admissions = new WeakMap();
/** @module pricing/service/defaultPricingAdministrativeAuthoringService
 * @description Bounded same-tenant native price row creation through existing managed versioned services.
 * @layer service @owner pricing
 * @override Preserve fresh Profile proof, private continuations, original actor and immutable initial rows. */
module.exports = {
  /** Raises a stable sanitized owner failure. */
  fail: function (kind) { throw new CLASSES.NodicsError("ERR_PRICING_AUTHORING_" + kind); },
  /** Rejects query operators, selectors, hidden fields and accessor payloads. */
  object: function (value, allowed) {
    if (!value || Object.getPrototypeOf(value) !== Object.prototype || Reflect.ownKeys(value).some(key =>
      typeof key !== "string" || !allowed.includes(key) || !Object.getOwnPropertyDescriptor(value, key)?.enumerable ||
      !Object.hasOwn(Object.getOwnPropertyDescriptor(value, key), "value"))) this.fail("INPUT");
    return value;
  },
  /** Validates an exact identity, never a query expression. */
  code: function (value) {
    if (typeof value !== "string" || !/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(value)) this.fail("INPUT");
    return value;
  },
  /** Reads owner defaults; missing configuration never invents authority. */
  policy: function () { return CONFIG.get("pricing")?.administrativeAuthoring; },
  /** Qualifies the existing CURRENT version-aware generated services, without enabling storage. */
  storage: function (tenant) {
    const publication = CONFIG.get("pricing")?.publication;
    if (CONFIG.get("pricing")?.enabled !== true || publication?.runtimeRole !== "STAGED" || publication.sourceVersioningQualified !== true) this.fail("STORAGE");
    const models = NODICS.getModels("pricing", tenant), ports = {};
    for (const [schema, name] of [["priceBook", "PriceBook"], ["priceRow", "PriceRow"]]) {
      const model = models?.[name + "Model"], service = SERVICE["Default" + name + "Service"];
      if (!model || model.versioned !== true || model.primaryKey !== "code" || model.rawSchema?.versionedReadMode !== "CURRENT" ||
        typeof model.getCurrentVersionItems !== "function" || typeof service?.get !== "function" ||
        SERVICE.DefaultModelsGetInitializerService?.resolveReadMethod?.({ schemaModel: model, query: {} }) !== "getCurrentVersionItems" ||
        schema === "priceRow" && (typeof model.saveVersionedItems !== "function" || typeof service.save !== "function" ||
          SERVICE.DefaultModelSaveInitializerService?.resolveSaveMethod?.({ schemaModel: model }) !== "saveVersionedItems")) this.fail("STORAGE");
      ports[schema] = { model, service, get: service.get, save: service.save,
        current: model.getCurrentVersionItems, insert: model.saveVersionedItems };
    }
    return ports;
  },
  /** Checks original credentials, command, policy and storage identities across every asynchronous boundary. */
  admitted: function (token) {
    const c = admissions.get(token);
    if (!c) this.fail("SCOPE");
    const { request: r, auth, policy, input } = c;
    const headers = [r.headers, r.header, r.httpRequest?.headers].map(h => h || {});
    if (!isDeepStrictEqual(r.authData, auth) || r.tenant !== auth.tenant || !auth.tenant || !auth.entCode || !auth.loginId ||
      auth.principalType !== "human" || auth.tokenType !== "access" || auth.authenticationMethod !== "PASSWORD" || auth.isSystem ||
      auth.runtimeScope !== undefined || auth.sessionContext !== undefined || auth.externalIdentityLinkCode !== undefined ||
      !Number.isSafeInteger(auth.authVersion) || auth.authVersion < 1 ||
      [auth.principalId, auth.userId, r.actorId].some(x => x !== undefined && x !== auth.loginId) ||
      [auth.tenantCode, r.tenantCode].some(x => x !== undefined && x !== auth.tenant) ||
      [auth.enterpriseCode, r.enterpriseCode, r.entCode].some(x => x !== undefined && x !== auth.entCode) ||
      typeof c.authorization !== "string" || !/^Bearer \S+$/i.test(c.authorization) || r.authorization !== c.authorization ||
      !isDeepStrictEqual(headers, c.headers) || headers.some(h => Object.entries(h).some(([k, v]) =>
        k.toLowerCase() === "authorization" && v !== c.authorization ||
        k.toLowerCase() === "x-enterprise-code" && v !== auth.entCode || k.toLowerCase() === "x-tenant-code" && v !== auth.tenant)) ||
      [r.payload, r.body, r.httpRequest?.body].some(x => x !== undefined && !isDeepStrictEqual(x, input)) ||
      [r.query, r.httpRequest?.query].some(x => x && Object.keys(x).length) ||
      !isDeepStrictEqual(this.policy(), policy) || !isDeepStrictEqual(CONFIG.get("runtimeRole"), c.role) ||
      !isDeepStrictEqual(CONFIG.get("pricing")?.publication, c.publication)) this.fail("SCOPE");
    const ports = this.storage(auth.tenant);
    for (const schema of Object.keys(ports)) {
      if (Object.entries(ports[schema]).some(([key, value]) => c.ports[schema][key] !== value) ||
        !isDeepStrictEqual(ports[schema].model.rawSchema, c.schemas[schema])) this.fail("STORAGE");
    }
    return c;
  },
  /** Unwraps affirmative Profile envelopes only. */
  unwrap: function (value) {
    for (let i = 0; i < 8; i++) {
      if (!value || typeof value !== "object" || value.error || value.success === false || value.acknowledged === false ||
        value.code !== undefined && !/^SUC_/.test(value.code) ||
        value.errors !== undefined && (!Array.isArray(value.errors) || value.errors.length)) this.fail("SCOPE");
      if (value.data === undefined && value.result === undefined) return value;
      if (value.data !== undefined && value.result !== undefined) this.fail("SCOPE");
      value = value.data ?? value.result;
    }
    this.fail("SCOPE");
  },
  /** Uses the original bearer and signed enterprise for fresh Profile evidence and participant resolution. */
  profile: async function (token, path, body) {
    const c = this.admitted(token);
    const result = await SERVICE.DefaultModuleService.invokeModule({ local: false, ...c.policy.identityTarget,
      apiName: path, methodName: "POST", requestBody: body, tenant: c.auth.tenant, request: { tenant: c.auth.tenant },
      header: { Authorization: c.authorization, "X-Enterprise-Code": c.auth.entCode }, timeoutMs: c.policy.timeoutMs, maxAttempts: 1 });
    this.admitted(token);
    return this.unwrap(result);
  },
  /** Rechecks live native administrator status, permission, auth version and same-tenant target. */
  revalidate: async function (token) {
    const c = this.admitted(token), nonce = crypto.randomUUID();
    const p = await this.profile(token, c.policy.evidencePath, { nonce, permission: c.permission });
    if (p.contractVersion !== 1 || p.nonce !== nonce || p.permission !== c.permission || p.tenant !== c.auth.tenant ||
      p.enterpriseCode !== c.auth.entCode || p.actorCode !== c.auth.loginId || p.authVersion !== c.auth.authVersion ||
      p.principalType !== "human" || p.platformAdministrator !== true) this.fail("SCOPE");
    const target = await this.profile(token, c.policy.recipientPath, { ownerType: "ENTERPRISE", ownerCode: c.input.targetEnterpriseCode });
    if (target.contractVersion !== 1 || target.tenant !== c.auth.tenant || target.recipient?.ownerType !== "ENTERPRISE" ||
      target.recipient.ownerCode !== c.input.targetEnterpriseCode) this.fail("SCOPE");
    this.admitted(token);
  },
  /** Supplies canonical persistence only to a private, currently admitted fixed command. */
  local: function (token) {
    const c = this.admitted(token);
    if (typeof SERVICE.DefaultIdentityGovernanceService?.getSystemAuthData !== "function") this.fail("STORAGE");
    const authData = SERVICE.DefaultIdentityGovernanceService.getSystemAuthData();
    this.admitted(token);
    return { tenant: c.auth.tenant, authData,
      options: { recursive: false, skipItemCache: true } };
  },
  /** Rejects ambiguous or failed generated outcomes. */
  outcome: function (response, code) {
    if (!response || response.code !== code || response.error || response.success === false || response.acknowledged === false ||
      response.errors != null && (!Array.isArray(response.errors) || response.errors.length) || !Object.hasOwn(response, "result")) this.fail("CONFLICT");
    return response.result;
  },
  /** Reads a single exact enterprise identity through the existing managed CURRENT service. */
  load: async function (token, schema, code) {
    const c = this.admitted(token);
    if (!["priceBook", "priceRow"].includes(schema)) this.fail("SCOPE");
    this.code(code);
    const result = await c.ports[schema].service.get({ ...this.local(token),
      query: { tenant: c.auth.tenant, enterpriseCode: c.input.targetEnterpriseCode, code }, searchOptions: { limit: 2, pageSize: 2 } });
    this.admitted(token);
    const rows = this.outcome(result, "SUC_FIND_00000");
    if (!Array.isArray(rows) || rows.length > 1 || result.count !== rows.length) this.fail("CONFLICT");
    if (rows.length) this.assertRow(token, rows[0], code);
    return rows[0];
  },
  /** Independently checks the returned persistence scope and managed versions. */
  assertRow: function (token, row, code) {
    const c = this.admitted(token);
    if (!row || row.error || row.success === false || row.acknowledged === false ||
      row.errors != null && (!Array.isArray(row.errors) || row.errors.length) ||
      row.code !== code || row.tenant !== c.auth.tenant || row.enterpriseCode !== c.input.targetEnterpriseCode ||
      !Number.isSafeInteger(row.versionId) || row.versionId < 0 || !Number.isSafeInteger(row.revision) || row.revision < 0) this.fail("CONFLICT");
  },
  /** Restricts create input to exact price fields; publication pins and audit fields are never caller writable. */
  model: function (command, policy) {
    this.object(command, ["code", "priceBookCode", "bookVersionId", "productCode", "unitAmount", "currency", "minQuantity"]);
    for (const key of ["code", "priceBookCode", "productCode", "currency"]) this.code(command[key]);
    if (!Number.isSafeInteger(command.bookVersionId) || command.bookVersionId < 0) this.fail("INPUT");
    for (const key of ["unitAmount", "minQuantity"]) {
      if (typeof command[key] !== "string" || command[key].length > policy.maximumDecimalLength) this.fail("INPUT");
      try {
        if (SERVICE.DefaultExactAmountService.compare(command[key], "0") < (key === "minQuantity" ? 1 : 0)) this.fail("INPUT");
      } catch { this.fail("INPUT"); }
    }
    const { bookVersionId, ...model } = command;
    return structuredClone(model);
  },
  /** Returns only public price and audit fields, excluding persistence and publication metadata. */
  project: function (row) {
    if (!row) return null;
    return Object.fromEntries(["code", "priceBookCode", "productCode", "unitAmount", "currency", "minQuantity", "versionId", "revision",
      "createdBy", "updatedBy"].filter(key => row[key] !== undefined).map(key => [key, structuredClone(row[key])]));
  },
  /** Creates a row once through saveVersionedItems; retries must reconcile and never update an existing identity. */
  createAdmitted: async function (token) {
    const c = this.admitted(token), command = c.input.command, model = this.model(command, c.policy);
    const book = await this.load(token, "priceBook", model.priceBookCode);
    if (!book || book.versionId !== command.bookVersionId || book.currency !== model.currency ||
      !["DRAFT", "ACTIVE"].includes(book.status)) this.fail("CONFLICT");
    if (await this.load(token, "priceRow", model.code)) this.fail("CONFLICT");
    await this.revalidate(token);
    if (!isDeepStrictEqual(await this.load(token, "priceBook", model.priceBookCode), book)) this.fail("CONFLICT");
    const expected = { ...model, tenant: c.auth.tenant, enterpriseCode: c.input.targetEnterpriseCode,
      versionId: 0, revision: 0, createdBy: c.auth.loginId, updatedBy: c.auth.loginId };
    const response = await c.ports.priceRow.service.save({ ...this.local(token),
      query: { tenant: c.auth.tenant, enterpriseCode: c.input.targetEnterpriseCode, code: model.code }, model: structuredClone(expected) });
    this.admitted(token);
    const acknowledged = this.outcome(response, "SUC_SAVE_00000");
    this.assertRow(token, acknowledged, model.code);
    if (Object.entries(expected).some(([key, value]) => acknowledged[key] !== value)) this.fail("CONFLICT");
    const saved = await this.load(token, "priceRow", model.code);
    if (!saved || Object.entries(expected).some(([key, value]) => saved[key] !== value)) this.fail("CONFLICT");
    return this.project(saved);
  },
  /** Owns the short-lived admission; copied contexts cannot obtain canonical persistence. */
  execute: async function (request, operation) {
    if (!["create", "read", "publication"].includes(operation)) this.fail("INPUT");
    const policy = structuredClone(this.policy());
    if (!policy || ![policy.readPermission, policy.writePermission].every(p => typeof p === "string" && p) ||
      policy.identityTarget?.moduleName !== "profile" || !policy.identityTarget.connectionName ||
      (policy.identityTarget.targetAuthority?.publication !== "OPERATIONAL" || Object.entries(policy.identityTarget.targetAuthority).some(([key, value]) => !["publication", "server", "environment"].includes(key) || typeof value !== "string" || !/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,127}$/.test(value))) || !/^v\d+$/.test(policy.identityTarget.apiVersion) ||
      !Number.isSafeInteger(policy.timeoutMs) || policy.timeoutMs < 1 || policy.timeoutMs > 60000 ||
      !Number.isSafeInteger(policy.maximumDecimalLength) || policy.maximumDecimalLength < 1 || policy.maximumDecimalLength > 1024 ||
      [policy.evidencePath, policy.recipientPath].some(path => typeof path !== "string" || !/^\/[A-Za-z0-9/_-]+$/.test(path))) this.fail("STORAGE");
    const raw = this.object(request.httpRequest?.body ?? request.payload, ["targetEnterpriseCode", "command"]);
    this.code(raw.targetEnterpriseCode);
    if (operation === "create") this.model(raw.command, policy);
    else if (operation === "publication") {
      if (typeof policy.publishPermission !== "string" || !policy.publishPermission) this.fail("STORAGE");
      if (raw.command?.operation === "create") {
        this.object(raw.command, ["operation", "publicationCode", "rootType", "rootCode", "references", "productReference"]);
        this.code(raw.command.rootCode);
        if (!["priceBook", "priceRow"].includes(raw.command.rootType)) this.fail("INPUT");
      } else {
        this.object(raw.command, ["operation", "publicationCode", "sourceVersion", "expectedRevision"]);
        if (!["read", "validate", "requestApproval", "activate"].includes(raw.command.operation) ||
          !/^[a-f0-9]{64}$/.test(raw.command.sourceVersion || "") ||
          !Number.isSafeInteger(raw.command.expectedRevision) || raw.command.expectedRevision < 0) this.fail("INPUT");
      }
      this.code(raw.command.publicationCode);
    }
    else { this.object(raw.command, ["code"]); this.code(raw.command.code); }
    const input = structuredClone(raw), auth = structuredClone(request.authData || {}), token = {};
    const ports = this.storage(auth.tenant);
    admissions.set(token, { request, operation, input, auth, policy, ports,
      permission: policy[operation === "publication" ? "publishPermission" : operation === "create" ? "writePermission" : "readPermission"],
      authorization: request.authorization, headers: structuredClone([request.headers, request.header, request.httpRequest?.headers].map(h => h || {})),
      role: structuredClone(CONFIG.get("runtimeRole")), publication: structuredClone(CONFIG.get("pricing")?.publication),
      schemas: Object.fromEntries(Object.entries(ports).map(([key, port]) => [key, structuredClone(port.model.rawSchema)])) });
    try {
      await this.revalidate(token);
      const result = operation === "publication" ? await SERVICE.DefaultPricingPublicationService.executeAdministrativePublication(token) :
        operation === "create" ? await this.createAdmitted(token) : this.project(await this.load(token, "priceRow", input.command.code));
      await this.revalidate(token);
      return { targetEnterpriseCode: input.targetEnterpriseCode, result, audit: { tenant: auth.tenant,
        actorCode: auth.loginId, actorEnterpriseCode: auth.entCode, targetEnterpriseCode: input.targetEnterpriseCode,
        permission: this.admitted(token).permission, authVersion: auth.authVersion } };
    } finally { admissions.delete(token); }
  },
};
