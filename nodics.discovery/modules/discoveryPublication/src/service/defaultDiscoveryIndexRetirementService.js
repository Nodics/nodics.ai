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
/** @module discoveryPublication/service/DefaultDiscoveryIndexRetirementService
 * @description Journals provider-backed legacy retirement and independently reviewed erasure; retains original uncertain outcomes without replay.
 * @layer service @owner discoveryPublication
 * @override Require domain authorization and replacement evidence before every effect. Private generated persistence and exact immutable physical identity are mandatory.
 */
module.exports = {
  /** Rejects unavailable evidence. @returns {never} Throws. */
  fail: function () {
    throw new Error("DISCOVERY_INDEX_RETIREMENT_UNCONFIRMED");
  },
  /** Fingerprints bounded canonical owner evidence. @param {*} value Evidence. @returns {string} Digest. */
  digest: function (value) {
    return SERVICE.DefaultModelCommandReceiptService.digest(value);
  },
  /** Resolves the current registered model, never a caller-selected physical index. @param {Object} request Owner declaration. @returns {Object} nSearch model. */
  model: function (request) {
    const model =
      SERVICE.DefaultDiscoveryDocumentProjectionService.getSearchModel({
        tenant: request.tenant,
        indexName: request.legacyIndexName,
      });
    const qualification = model?.indexDef?.retirement;
    if (
      qualification?.ownerType !== request.ownerType ||
      qualification?.tenantCode !== request.tenant ||
      qualification?.enterpriseCode !== request.enterpriseCode ||
      typeof model.inspectRetirement !== "function" ||
      typeof model.retireIndex !== "function"
    )
      this.fail();
    return model;
  },
  /** Reads exact physical identity and global original command under fresh source authority. @param {Object} request Owner declaration. @returns {Promise<Object>} Private evidence. */
  inspect: async function (request) {
    if (
      typeof request.assertCurrent !== "function" ||
      typeof request.replacementEvidence !== "function" ||
      [
        request.tenant,
        request.enterpriseCode,
        request.principalCode,
        request.legacyIndexName,
        request.planCode,
        request.ownerType,
      ].some(
        (value) =>
          typeof value !== "string" ||
          !/^[A-Za-z0-9][A-Za-z0-9._:@+-]{0,191}$/.test(value),
      )
    )
      this.fail();
    await request.assertCurrent();
    const model = this.model(request);
    const physical = await model.inspectRetirement();
    if (
      !physical ||
      !/^[A-Za-z0-9_-]{10,128}$/.test(physical.uuid || "") ||
      typeof physical.blocked !== "boolean"
    )
      this.fail();
    const scope = {
      tenantCode: request.tenant,
      enterpriseCode: request.enterpriseCode,
      indexName: request.legacyIndexName,
      indexUUID: physical.uuid,
      ownerType: request.ownerType,
    };
    const code = "index-retirement-" + this.digest(scope);
    const store = SERVICE.DefaultDiscoveryIndexRetirementReceiptService;
    if (
      !store ||
      !["get", "save", "update"].every(
        (key) => typeof store[key] === "function",
      )
    )
      this.fail();
    const rows = SERVICE.DefaultModelCommandReceiptService.result(
      await store.get({
        tenant: request.tenant,
        authData: request.authData,
        internalPersistence: "DURABLE_JOURNAL",
        query: { code, ...scope },
        options: { skipItemCache: true },
        searchOptions: { pageNumber: 1, pageSize: 2 },
      }),
    );
    if (!Array.isArray(rows) || rows.length > 1) this.fail();
    const row = rows[0];
    if (
      row &&
      (row.code !== code ||
        Object.entries(scope).some(([key, value]) => row[key] !== value) ||
        !["STARTED", "RETIRED"].includes(row.state) ||
        row.principalCode !== request.principalCode ||
        row.planCode !== request.planCode ||
        !/^[a-f0-9]{64}$/.test(row.reviewDigest || "") ||
        !Number.isFinite(Date.parse(row.startedAt)) ||
        (row.state === "RETIRED" &&
          !Number.isFinite(Date.parse(row.completedAt))))
    )
      this.fail();
    await request.assertCurrent();
    if (this.model(request) !== model) this.fail();
    return { scope, code, store, model, physical, row };
  },
  /** Projects truthful retained/uncertain status without private index names or UUIDs. @param {Object} request Owner declaration. @param {Object} evidence Original evidence. @returns {Object} Public status. */
  project: function (request, evidence) {
    return {
      contractVersion: 1,
      planCode: request.planCode,
      state:
        evidence.row?.state === "RETIRED" && evidence.physical.blocked
          ? "RETIRED"
          : evidence.row || evidence.physical.blocked
            ? "OUTCOME_UNKNOWN"
            : "NOT_STARTED",
      retainedLegacyData: true,
      physicalCleanupComplete: false,
    };
  },
  /** Reviews a verified replacement before the one-way barrier, with no mutation. @param {Object} request Owner declaration. @returns {Promise<Object>} Bound review. */
  preview: async function (request) {
    const evidence = await this.inspect(request);
    if (evidence.row || evidence.physical.blocked)
      return this.project(request, evidence);
    const replacement = await request.replacementEvidence(evidence.physical);
    await request.assertCurrent();
    return {
      ...this.project(request, evidence),
      state: "REVIEWED",
      reviewDigest: this.digest([
        request.planCode,
        request.principalCode,
        evidence.scope,
        replacement,
      ]),
      sourceCount: replacement.length,
    };
  },
  /** Claims once before a provider write barrier; every lost acknowledgement remains inspect-only. @param {Object} request Reviewed owner declaration. @param {string} reviewDigest Exact review. @returns {Promise<Object>} Original retirement result. */
  execute: async function (request, reviewDigest) {
    const review = await this.preview(request);
    if (review.state !== "REVIEWED" || review.reviewDigest !== reviewDigest)
      this.fail();
    const evidence = await this.inspect(request);
    if (evidence.row || evidence.physical.blocked) this.fail();
    const record = {
      ...evidence.scope,
      code: evidence.code,
      principalCode: request.principalCode,
      planCode: request.planCode,
      reviewDigest,
      state: "STARTED",
      startedAt: new Date().toISOString(),
      operationCode: crypto.randomUUID(),
    };
    const protocol = SERVICE.DefaultModelCommandReceiptService;
    const saved = protocol.result(
      await evidence.store.save({
        tenant: request.tenant,
        authData: request.authData,
        internalPersistence: "DURABLE_JOURNAL",
        options: { insertOnly: true },
        model: { ...record },
      }),
    );
    if (Object.entries(record).some(([key, value]) => saved[key] !== value))
      this.fail();
    const assertCurrent = async () => {
      await request.assertCurrent();
      const replacement = await request.replacementEvidence(evidence.physical);
      if (
        this.digest([
          request.planCode,
          request.principalCode,
          evidence.scope,
          replacement,
        ]) !== reviewDigest ||
        this.model(request) !== evidence.model
      )
        this.fail();
    };
    const result = await evidence.model.retireIndex({
      expectedUUID: evidence.physical.uuid,
      assertCurrent,
    });
    if (
      result?.uuid !== evidence.physical.uuid ||
      result.index !== evidence.physical.index ||
      result.acknowledged !== true ||
      result.quiescent !== true ||
      result.blocked !== true ||
      result.retained !== true
    )
      this.fail();
    await assertCurrent();
    const updated = protocol.result(
      await evidence.store.update({
        tenant: request.tenant,
        authData: request.authData,
        internalPersistence: "DURABLE_JOURNAL",
        query: record,
        model: { state: "RETIRED", completedAt: new Date().toISOString() },
      }),
    );
    if (updated.matchedCount !== 1) this.fail();
    const original = await this.inspect(request);
    if (
      original.row?.reviewDigest !== reviewDigest ||
      original.row?.state !== "RETIRED" ||
      !original.physical.blocked
    )
      this.fail();
    return this.project(request, original);
  },
  /** Reads the original private receipt even after the physical UUID is absent. Never infers an acknowledged deletion from absence alone. @param {Object} request Trusted source declaration. @returns {Promise<Object>} Private original evidence. */
  erasureEvidence: async function (request) {
    await request.assertCurrent();
    const model = this.model(request);
    if (
      !["inspectErasure", "inspectDecommissioning", "eraseRetiredIndex"].every(
        (key) => typeof model[key] === "function",
      )
    )
      this.fail();
    const scope = {
      tenantCode: request.tenant,
      enterpriseCode: request.enterpriseCode,
      indexName: request.legacyIndexName,
      ownerType: request.ownerType,
    };
    if (
      Object.values(scope).some((value) => typeof value !== "string" || !value)
    )
      this.fail();
    const store = SERVICE.DefaultDiscoveryIndexRetirementReceiptService;
    const rows = SERVICE.DefaultModelCommandReceiptService.result(
      await store.get({
        tenant: request.tenant,
        authData: request.authData,
        internalPersistence: "DURABLE_JOURNAL",
        query: scope,
        options: { skipItemCache: true },
        searchOptions: { pageNumber: 1, pageSize: 2 },
      }),
    );
    if (!Array.isArray(rows) || rows.length !== 1) this.fail();
    const row = rows[0];
    if (
      Object.entries(scope).some(([key, value]) => row[key] !== value) ||
      row.state !== "RETIRED" ||
      row.principalCode !== request.principalCode ||
      row.planCode !== request.planCode ||
      !/^[A-Za-z0-9_-]{10,128}$/.test(row.indexUUID || "") ||
      row.code !==
        "index-retirement-" +
          this.digest({ ...scope, indexUUID: row.indexUUID }) ||
      !/^[a-f0-9]{64}$/.test(row.reviewDigest || "") ||
      !Number.isFinite(Date.parse(row.completedAt))
    )
      this.fail();
    const erasure = row.erasure;
    if (
      erasure &&
      (!["STARTED", "ERASED"].includes(erasure.state) ||
        !/^[a-f0-9]{64}$/.test(erasure.reviewDigest || "") ||
        !Number.isFinite(Date.parse(erasure.startedAt)) ||
        (erasure.state === "ERASED" &&
          !Number.isFinite(Date.parse(erasure.completedAt))))
    )
      this.fail();
    const physical = await model.inspectErasure();
    if (
      erasure &&
      (typeof erasure.indexName !== "string" ||
        physical?.index !== erasure.indexName)
    )
      this.fail();
    if (
      physical?.absent !== true &&
      (physical?.uuid !== row.indexUUID || physical.blocked !== true)
    )
      this.fail();
    await request.assertCurrent();
    if (this.model(request) !== model) this.fail();
    return { scope, store, model, row, physical };
  },
  /** Projects source-bound erasure evidence; unknown means neither retained nor erased is asserted. @param {Object} request Trusted owner. @param {Object} evidence Private evidence. @returns {Object} Minimized original result. */
  projectErasure: function (request, evidence) {
    const erased =
      evidence.row.erasure?.state === "ERASED" &&
      evidence.physical.absent === true;
    const state = erased
      ? "ERASED"
      : evidence.row.erasure || evidence.physical.absent
        ? "OUTCOME_UNKNOWN"
        : "NOT_STARTED";
    return {
      contractVersion: 1,
      planCode: request.planCode,
      state,
      physicalCleanupComplete: erased,
      retainedLegacyData: erased
        ? false
        : state === "OUTCOME_UNKNOWN"
          ? null
          : true,
    };
  },
  /** Revalidates replacement, writer revocation and original UUID for a separate irreversible review. @param {Object} request Trusted owner. @returns {Promise<Object>} Bound erasure review. */
  previewErasure: async function (request) {
    const evidence = await this.erasureEvidence(request);
    if (evidence.row.erasure || evidence.physical.absent)
      return this.projectErasure(request, evidence);
    const replacement = await request.replacementEvidence(evidence.physical);
    const writers = await evidence.model.inspectDecommissioning();
    await request.assertCurrent();
    return {
      ...this.projectErasure(request, evidence),
      state: "REVIEWED",
      sourceCount: replacement.length,
      reviewDigest: this.digest([
        "ERASE",
        evidence.row.code,
        evidence.row.reviewDigest,
        request.principalCode,
        request.planCode,
        replacement,
        writers,
      ]),
    };
  },
  /** Claims a separate irreversible attempt before one physical removal. Missing acknowledgements are inspection-only forever. @param {Object} request Trusted owner. @param {string} reviewDigest Reviewed erasure. @returns {Promise<Object>} Original completion. */
  erase: async function (request, reviewDigest) {
    const review = await this.previewErasure(request);
    if (review.state !== "REVIEWED" || review.reviewDigest !== reviewDigest)
      this.fail();
    const evidence = await this.erasureEvidence(request);
    if (evidence.row.erasure || evidence.physical.absent) this.fail();
    const protocol = SERVICE.DefaultModelCommandReceiptService;
    const erasure = {
      state: "STARTED",
      reviewDigest,
      indexName: evidence.physical.index,
      startedAt: new Date().toISOString(),
    };
    const binding = {
      code: evidence.row.code,
      ...evidence.scope,
      indexUUID: evidence.row.indexUUID,
      principalCode: request.principalCode,
      planCode: request.planCode,
      state: "RETIRED",
      reviewDigest: evidence.row.reviewDigest,
    };
    const claimed = protocol.result(
      await evidence.store.update({
        tenant: request.tenant,
        authData: request.authData,
        internalPersistence: "DURABLE_JOURNAL",
        query: { ...binding, erasure: null },
        model: { erasure },
      }),
    );
    if (claimed.matchedCount !== 1) this.fail();
    const assertCurrent = async () => {
      await request.assertCurrent();
      const replacement = await request.replacementEvidence(evidence.physical);
      const writers = await evidence.model.inspectDecommissioning();
      if (
        this.model(request) !== evidence.model ||
        this.digest([
          "ERASE",
          evidence.row.code,
          evidence.row.reviewDigest,
          request.principalCode,
          request.planCode,
          replacement,
          writers,
        ]) !== reviewDigest
      )
        this.fail();
    };
    const result = await evidence.model.eraseRetiredIndex({
      expectedUUID: evidence.row.indexUUID,
      assertCurrent,
    });
    if (
      result?.uuid !== evidence.row.indexUUID ||
      result.index !== evidence.physical.index ||
      result.acknowledged !== true ||
      result.absent !== true
    )
      this.fail();
    await request.assertCurrent();
    const completed = protocol.result(
      await evidence.store.update({
        tenant: request.tenant,
        authData: request.authData,
        internalPersistence: "DURABLE_JOURNAL",
        query: {
          ...binding,
          "erasure.state": erasure.state,
          "erasure.reviewDigest": erasure.reviewDigest,
          "erasure.indexName": erasure.indexName,
          "erasure.startedAt": erasure.startedAt,
        },
        model: {
          erasure: {
            ...erasure,
            state: "ERASED",
            completedAt: new Date().toISOString(),
          },
        },
      }),
    );
    if (completed.matchedCount !== 1) this.fail();
    return this.projectErasure(request, await this.erasureEvidence(request));
  },
};
