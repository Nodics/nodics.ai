/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
const crypto = require("node:crypto");

/** @module database/service/schema/DefaultModelCommandReceiptService
 * @description Retains original native command acknowledgements in the owning module's private generated journal without replaying mutations.
 * @layer service @owner nDatabase
 * @override Preserve native authorization callbacks, exact actor/intent binding, durable insert-only claims and uncertain crash windows. This is not a transaction or workflow engine.
 */
module.exports = {
  /** Rejects unavailable or contradictory original-command evidence. @returns {never} Throws. */
  fail: function () {
    throw new CLASSES.NodicsError(
      "ERR_DBS_00003",
      "Original command evidence is unavailable",
    );
  },
  /** Canonicalizes bounded JSON command input without retaining its contents. @param {*} value Input. @param {number} depth Depth. @returns {*} Canonical value. */
  canonical: function (value, depth = 0) {
    if (depth > 24) this.fail();
    if (
      value === null ||
      typeof value === "string" ||
      typeof value === "boolean"
    )
      return value;
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (Array.isArray(value))
      return value.map((item) => this.canonical(item, depth + 1));
    if (value && Object.getPrototypeOf(value) === Object.prototype)
      return Object.fromEntries(
        Object.keys(value)
          .sort()
          .map((key) => [key, this.canonical(value[key], depth + 1)]),
      );
    this.fail();
  },
  /** Hashes a bounded command or retained identity. @param {*} value JSON value. @returns {string} Fingerprint. */
  digest: function (value) {
    const input = JSON.stringify(this.canonical(value));
    if (Buffer.byteLength(input, "utf8") > 65536) this.fail();
    return crypto.createHash("sha256").update(input).digest("hex");
  },
  /** Checks deployment admission without enabling journals implicitly. @param {string} moduleName Owning module. @returns {boolean} New commands admitted. */
  enabled: function (moduleName) {
    const policy = CONFIG.get("commandReceipts");
    return policy?.enabled === true && policy.owners?.[moduleName] === true;
  },
  /** Rejects failed envelopes at both boundaries. @param {Object} response Generated response. @returns {*} Exact result. */
  result: function (response) {
    const valid = (value) =>
      value &&
      !value.error &&
      value.success !== false &&
      value.acknowledged !== false &&
      (value.errors === undefined ||
        (Array.isArray(value.errors) && !value.errors.length));
    if (
      !valid(response) ||
      !/^SUC_/.test(response.code || "") ||
      !valid(response.result)
    )
      this.fail();
    return response.result;
  },
  /** Binds a native owner declaration to a registered private journal and original human command. @param {Object} request Trusted context. @param {Object} command Owner-built declaration. @returns {Object} Private selection. */
  selection: function (request, command) {
    const auth = request.authData || {};
    const scope = {
      tenantCode: request.tenant,
      enterpriseCode: auth.enterpriseCode || auth.entCode,
      principalCode: auth.loginId,
      moduleName: command.moduleName,
      operation: command.operation,
    };
    if (
      Object.values(scope).some(
        (value) =>
          typeof value !== "string" ||
          !/^[A-Za-z0-9][A-Za-z0-9._:@+-]{0,191}$/.test(value),
      ) ||
      auth.principalType !== "human" ||
      auth.tokenType !== "access" ||
      auth.isSystem ||
      auth.tenant !== request.tenant ||
      typeof command.authorize !== "function" ||
      typeof command.key !== "string" ||
      !command.key.trim() ||
      command.key.length > 512 ||
      /[\u0000-\u001f]/.test(command.key)
    )
      this.fail();
    const module = NODICS.getModule(command.moduleName);
    const schema = module?.rawSchema?.[command.journalSchema];
    if (
      !schema ||
      schema.commandReceiptJournal !== true ||
      schema.model !== true ||
      schema.cache?.enabled !== false ||
      schema.router?.enabled !== false ||
      schema.event?.enabled !== false ||
      schema.service?.enabled !== true ||
      schema.backoffice?.enabled !== false
    )
      this.fail();
    const serviceName =
      "Default" +
      command.journalSchema[0].toUpperCase() +
      command.journalSchema.slice(1) +
      "Service";
    const store = SERVICE[serviceName];
    if (
      !store ||
      !["get", "save", "update"].every(
        (key) => typeof store[key] === "function",
      )
    )
      this.fail();
    return {
      scope,
      store,
      code: "command-" + this.digest({ scope, key: command.key }),
      argumentsDigest: this.digest(command.input),
    };
  },
  /** Rechecks current native authorization and trusted identity after awaited work. @param {Object} request Trusted request. @param {Object} command Native declaration. @param {Object} selected Original selection. @returns {Promise<void>} Still authorized. */
  current: async function (request, command, selected) {
    await command.authorize();
    const fresh = this.selection(request, command);
    if (
      fresh.code !== selected.code ||
      fresh.argumentsDigest !== selected.argumentsDigest ||
      fresh.store !== selected.store
    )
      this.fail();
  },
  /** Reads one original durable command; absence and STARTED remain uncertain. @param {Object} request Trusted context. @param {Object} command Native declaration. @returns {Promise<Object>} Private original selection. */
  read: async function (request, command) {
    await command.authorize();
    const selected = this.selection(request, command);
    const rows = this.result(
      await selected.store.get({
        tenant: request.tenant,
        authData: request.authData,
        internalPersistence: "DURABLE_JOURNAL",
        query: { code: selected.code, ...selected.scope },
        options: { skipItemCache: true },
        searchOptions: { pageNumber: 1, pageSize: 2 },
      }),
    );
    if (!Array.isArray(rows) || rows.length > 1) this.fail();
    const row = rows[0];
    if (row) {
      this.result({ code: "SUC_DBS_00000", result: row });
      if (
        row.code !== selected.code ||
        Object.entries(selected.scope).some(
          ([key, value]) => row[key] !== value,
        ) ||
        row.argumentsDigest !== selected.argumentsDigest ||
        !["STARTED", "COMPLETED"].includes(row.state) ||
        !Number.isFinite(Date.parse(row.startedAt)) ||
        (row.state === "COMPLETED" &&
          (typeof row.resultIdentity !== "string" ||
            !row.resultIdentity ||
            row.resultIdentity.length > 512 ||
            row.resultDigest !==
              this.digest({
                argumentsDigest: selected.argumentsDigest,
                resultIdentity: row.resultIdentity,
              }) ||
            !Number.isFinite(Date.parse(row.completedAt))))
      )
        this.fail();
    }
    await this.current(request, command, selected);
    return { ...selected, row: row || null };
  },
  /** Projects only original command evidence, never domain record contents or a retry token. @param {Object} selected Private selection. @returns {Object} Bounded receipt. */
  project: function (selected) {
    return {
      contractVersion: 1,
      ...selected.scope,
      commandCode: selected.code,
      argumentsDigest: selected.argumentsDigest,
      state:
        selected.row?.state === "COMPLETED" ? "COMPLETED" : "OUTCOME_UNKNOWN",
      ...(selected.row?.state === "COMPLETED"
        ? {
            resultIdentity: selected.row.resultIdentity,
            resultDigest: selected.row.resultDigest,
          }
        : {}),
    };
  },
  /** Inspects original owner evidence even when new command recording is disabled. @param {Object} request Trusted request. @param {Object} command Native declaration. @returns {Promise<Object>} Receipt. */
  inspect: async function (request, command) {
    return this.project(await this.read(request, command));
  },
  /** Claims once before native dispatch and records only a validated original acknowledgement. @param {Object} request Trusted request. @param {Object} command Native declaration including result projector. @param {Function} execute Existing native operation. @returns {Promise<Object>} Original native response. */
  execute: async function (request, command, execute) {
    if (
      !this.enabled(command.moduleName) ||
      typeof execute !== "function" ||
      typeof command.resultIdentity !== "function"
    )
      this.fail();
    const selected = await this.read(request, command);
    if (selected.row) this.fail();
    const model = {
      code: selected.code,
      ...selected.scope,
      argumentsDigest: selected.argumentsDigest,
      state: "STARTED",
      startedAt: new Date().toISOString(),
    };
    const saved = this.result(
      await selected.store.save({
        tenant: request.tenant,
        authData: request.authData,
        internalPersistence: "DURABLE_JOURNAL",
        options: { insertOnly: true },
        // Generated saves may add defaults; retain the original exact claim predicate.
        model: structuredClone(model),
      }),
    );
    if (Object.entries(model).some(([key, value]) => saved[key] !== value))
      this.fail();
    await this.current(request, command, selected);
    if (!this.enabled(command.moduleName)) this.fail();
    const response = await execute();
    const resultIdentity = command.resultIdentity(response);
    if (
      typeof resultIdentity !== "string" ||
      !resultIdentity ||
      resultIdentity.length > 512
    )
      this.fail();
    await this.current(request, command, selected);
    const completion = {
      state: "COMPLETED",
      resultIdentity,
      resultDigest: this.digest({
        argumentsDigest: selected.argumentsDigest,
        resultIdentity,
      }),
      completedAt: new Date().toISOString(),
    };
    const updated = this.result(
      await selected.store.update({
        tenant: request.tenant,
        authData: request.authData,
        internalPersistence: "DURABLE_JOURNAL",
        query: model,
        model: completion,
      }),
    );
    if (updated.matchedCount !== 1) this.fail();
    const original = await this.read(request, command);
    if (
      original.row?.state !== "COMPLETED" ||
      original.row.resultIdentity !== resultIdentity ||
      original.row.resultDigest !== completion.resultDigest
    )
      this.fail();
    return response;
  },
};
