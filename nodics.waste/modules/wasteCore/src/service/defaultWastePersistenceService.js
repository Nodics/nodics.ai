/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";

/** @module wasteCore/service/defaultWastePersistenceService @description Uses generated Waste repositories with trusted runtime context and explicit optimistic revisions. @layer service @owner wasteCore @override Later modules may decorate persistence without replacing generated-service or tenant authority. */
module.exports = {
  /** Throws a stable domain error without returning record contents. */
  fail: function (code, message) {
    const error =
      typeof CLASSES !== "undefined" && CLASSES.NodicsError
        ? new CLASSES.NodicsError(code, message)
        : new Error(message);
    error.code = code;
    throw error;
  },
  /** Resolves an owning generated repository; names are supplied by services, never HTTP payloads. */
  repository: function (schema) {
    const service =
      SERVICE[
        "Default" + schema[0].toUpperCase() + schema.slice(1) + "Service"
      ];
    if (!service || typeof service.get !== "function")
      this.fail(
        "ERR_WASTE_RUNTIME_UNAVAILABLE",
        "Waste storage is unavailable",
      );
    return service;
  },
  /** Detaches generated record envelopes into plain records. */
  records: function (response) {
    let value = response;
    for (let i = 0; i < 5 && value && !Array.isArray(value); i++) {
      if (value.result !== undefined) value = value.result;
      else if (value.data !== undefined) value = value.data;
      else if (value.items !== undefined) value = value.items;
      else if (value.records !== undefined) value = value.records;
      else break;
    }
    return JSON.parse(
      JSON.stringify(!value ? [] : Array.isArray(value) ? value : [value]),
    );
  },
  /** Builds a service-owned persistence envelope after the caller's domain authorization. */
  context: function (request) {
    const tenant =
      (request.authData && request.authData.tenant) || request.tenant;
    if (!tenant || typeof tenant !== "string")
      this.fail(
        "ERR_WASTE_CONTEXT_REQUIRED",
        "Trusted runtime context is required",
      );
    return {
      tenant: tenant,
      transactionContext: request.transactionContext,
      authData: Object.assign({}, request.authData || {}, {
        tenant: tenant,
        principalId: "wasteOperationService",
        principalType: "service",
        loginId: "wasteOperationService",
        code: "wasteOperationService",
        userGroups: ["serviceAccountUserGroup"],
        groups: ["serviceAccountUserGroup"],
      }),
    };
  },
  /** Returns a bounded selection through generated reads. */
  list: async function (schema, request, query, limit) {
    const response = await this.repository(schema).get(
      Object.assign(this.context(request), {
        query: query || {},
        searchOptions: { pageSize: Math.min(500, limit || 100), pageNumber: 1 },
        options: { recursive: false, skipItemCache: true },
      }),
    );
    return this.records(response);
  },
  /** Returns a server-paginated selection and provider count through generated persistence; callers supply an already authorized query. */
  page: async function (
    schema,
    request,
    query,
    page,
    limit,
    sort = { code: 1 },
  ) {
    const response = await this.repository(schema).get(
      Object.assign(this.context(request), {
        query,
        searchOptions: { pageSize: limit, pageNumber: page, sort },
        options: { recursive: false, skipItemCache: true },
      }),
    );
    if (!Number.isSafeInteger(response.count) || response.count < 0)
      this.fail(
        "ERR_WASTE_RUNTIME_UNAVAILABLE",
        "The owning repository did not return a reliable count",
      );
    return {
      items: this.records(response),
      total: response.count,
      page,
      limit,
    };
  },
  /** Reads a single schema record by stable code. */
  one: async function (schema, request, code) {
    return (await this.list(schema, request, { code: code }, 1))[0];
  },
  /** Creates one record; callers must explicitly handle duplicate command replay. */
  create: async function (schema, request, model) {
    await this.repository(schema).save(
      Object.assign(this.context(request), {
        query: { code: model.code },
        model: Object.assign({ active: true }, model),
        options: { recursive: false },
      }),
    );
    return this.one(schema, request, model.code);
  },
  /** Updates an explicitly revisioned record through generated compare-and-set behavior. */
  update: async function (schema, request, current, patch) {
    if (!current || !Number.isSafeInteger(current.revision))
      this.fail(
        "ERR_WASTE_REVISION_CONFLICT",
        "Reload the record before making changes",
      );
    await this.repository(schema).update(
      Object.assign(this.context(request), {
        query: { code: current.code, revision: current.revision },
        model: Object.assign({}, patch, {
          code: current.code,
          revision: current.revision,
        }),
        options: { recursive: false },
      }),
    );
    return this.one(schema, request, current.code);
  },
  /** Resolves the customer from authenticated context, never a submitted owner code. */
  customer: function (request) {
    const auth = request.authData || {};
    if (auth.principalType !== "customer" || !auth.loginId)
      this.fail("ERR_WASTE_CUSTOMER_REQUIRED", "Please sign in as a customer");
    return {
      module: "profile",
      schema: "customer",
      code: auth.code || auth.customerCode || auth.loginId,
    };
  },
  /** Rejects cross-customer access using the same not-found response as absent records. */
  owned: function (record, owner, field) {
    const ref = record && record[field || "submitterRef"];
    if (
      !ref ||
      ref.code !== owner.code ||
      ref.module !== "profile" ||
      ref.schema !== "customer"
    ) {
      this.fail(
        "ERR_WASTE_RECORD_NOT_FOUND",
        "The requested record was not found",
      );
    }
    return record;
  },
  /** Requires the exact revision that the customer reviewed. */
  revision: function (record, expected) {
    if (!Number.isSafeInteger(expected) || record.revision !== expected)
      this.fail(
        "ERR_WASTE_REVISION_CONFLICT",
        "Details changed. Reload and review before confirming",
      );
  },
};
