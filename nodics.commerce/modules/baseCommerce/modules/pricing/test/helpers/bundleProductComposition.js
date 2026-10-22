/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module pricing/test/helpers/bundleProductComposition @description Connects real Digital, Product authoring, immutable graph, nPublish repository/lifecycle and Product target owners through in-memory generated storage and transport, without external services. @layer test @owner pricing */
const assert = require("node:assert/strict");
const path = require("node:path");
const root = path.resolve(__dirname, "../../../../../../..");
const productPath = path.join(root, "nodics.commerce/modules/baseCommerce/modules/product");
const publishPath = path.join(root, "nodics.foundation/modules/nPublish");
const clone = structuredClone;

/** Implements the query subset emitted by the real generated-service callers, including dependency membership. */
function matches(row, query) {
  return Object.entries(query).every(([key, value]) => key === "$or" ? value.some(part => matches(row, part)) :
    value && typeof value === "object" ? "$in" in value ? value.$in.includes(row[key]) :
      "$exists" in value ? (row[key] !== undefined) === value.$exists : false : row[key] === value);
}

/** Installs actual Product/nPublish owners; only generated storage and transport authentication are isolated. */
module.exports = function compose(t) {
  const priorClasses = global.CLASSES;
  t.after(() => { global.CLASSES = priorClasses; });
  global.CLASSES = { ...priorClasses, NodicsError: class extends Error {
    constructor(code, message) { super(message); this.code = code; }
  } };
  const product = clone(require(path.join(productPath, "config/properties")).product);
  const publish = clone(require(path.join(publishPath, "config/properties")).publish);
  Object.assign(product.marketplaceAuthoring, { enabled: true, catalogVersion: "catalog", locales: ["en"] });
  product.marketplaceAuthoring.bundlePublication.enabled = true;
  product.marketplaceAuthoring.storeSource.connectionName = "commerce";
  Object.assign(product.localization, { supportedLocales: ["en"], requiredLocales: ["en"] });
  product.publication.targetTransportProvider = "DefaultProductPublicationTransportService";
  product.publication.target.connectionName = "commerce";
  product.publication.source.connectionName = "staged";
  publish.providers.domainAdapters.product = "DefaultProductPublicationAdapterService";
  publish.providers.versionProviders.product = "DefaultProductPublicationVersionProviderService";
  const oldGet = CONFIG.get, state = { runtime: { code: "COMMERCE", publication: "OPERATIONAL" }, writes: [], calls: [] };
  CONFIG.get = key => key === "product" ? product : key === "publish" ? publish : key === "runtimeRole" ? state.runtime : oldGet(key);
  for (const name of ["ListingAuthoring", "BundlePublication", "PublicationGraph", "GovernedPublication", "PublicationAdapter",
    "PublicationVersionProvider", "PublicationTarget", "PublicationTransport", "LocalizationPolicy", "LocalizedProjectionBuilder"])
    SERVICE["DefaultProduct" + name + "Service"] = require(path.join(productPath, "src/service/defaultProduct" + name + "Service"));
  for (const name of ["Lifecycle", "Repository"])
    SERVICE["DefaultPublication" + name + "Service"] = require(path.join(publishPath, "src/service/defaultPublication" + name + "Service"));
  SERVICE.DefaultModelSaveInitializerService = require(path.join(root,
    "nodics.foundation/modules/nService/vService/src/service/procs/save/defaultModelSaveInitializerService"));
  const graph = SERVICE.DefaultProductPublicationGraphService, sources = {}, wrappers = {};
  const oldModels = NODICS.getModels, oldModelName = UTILS.createModelName;
  UTILS.createModelName = name => Object.hasOwn(graph.services(), name) ? name[0].toUpperCase() + name.slice(1) + "Model" : oldModelName(name);
  NODICS.getModels = (module, tenant) => module === "product" ? wrappers : oldModels(module, tenant);
  for (const [schema, service] of Object.entries(graph.services())) {
    const rows = sources[schema] = [];
    wrappers[UTILS.createModelName(schema)] = { versioned: true, primaryKey: "code", rawSchema: { versionedReadMode: "CURRENT" },
      getCurrentVersionItems() {}, saveVersionedItems() {} };
    SERVICE[service] = {
      get: async request => {
        assert.equal(request.authData.isSystem, true);
        let selected = rows.filter(row => row.tenant === request.tenant);
        if (request.query.versionId === undefined) selected = selected.filter(row => !selected.some(other =>
          other.code === row.code && other.versionId > row.versionId));
        const result = clone(selected.filter(row => matches(row, request.query)));
        return { code: "SUC_READ", result, count: result.length };
      },
      save: async request => {
        assert.equal(request.authData.isSystem, true);
        assert.equal(request.model.versionId, 0);
        assert.equal(rows.some(row => row.code === request.model.code), false);
        rows.push(clone(request.model)); state.writes.push(service + ":save");
        return { code: "SUC_SAVE", result: clone(request.model) };
      },
      update: async request => {
        assert.equal(schema, "product"); assert.equal(request.authData.isSystem, true);
        const current = rows.find(row => matches(row, request.query));
        assert.ok(current); assert.equal(rows.some(row => row.code === current.code && row.versionId > current.versionId), false);
        const next = { ...clone(current), ...clone(request.model), versionId: current.versionId + 1 };
        rows.push(next); state.writes.push(service + ":seal");
        return { code: "SUC_UPDATE", result: clone(next) };
      },
    };
  }
  const records = {};
  for (const service of ["DefaultProductPublicationManifestService", "DefaultProductPublicationPointerService",
    "DefaultProductSearchProjectionService", "DefaultPublicationRequestService", "DefaultPublicationAuditService"]) {
    const rows = records[service] = new Map();
    const managed = ["DefaultProductPublicationManifestService", "DefaultProductPublicationPointerService"].includes(service);
    SERVICE[service] = {
      get: async r => { const result = clone([...rows.values()].filter(row => row.tenant === r.tenant && matches(row, r.query)));
        return { code: "SUC_READ", result, count: result.length }; },
      save: async r => {
        const current = rows.get(r.model.code);
        if (managed) assert.equal(r.model.revision, current?.revision || 0, "managed pointer/manifest CAS");
        else assert.equal(current, undefined, "insert-only immutable record");
        const model = { ...clone(r.model), tenant: r.tenant, ...(managed ? { revision: r.model.revision + 1 } : {}) };
        rows.set(model.code, model); state.writes.push(service + ":save");
        return { code: "SUC_SAVE", result: clone(model) };
      },
      update: async r => {
        assert.equal(service, "DefaultPublicationRequestService");
        const current = rows.get(r.query.code);
        if (!current || current.tenant !== r.tenant || !matches(current, r.query)) return { result: { modifiedCount: 0 } };
        Object.assign(current, clone(r.model.$set || r.model));
        for (const key of Object.keys(r.model.$unset || {})) delete current[key];
        state.writes.push(service + ":transition"); return { code: "SUC_UPDATE", result: { modifiedCount: 1 } };
      },
    };
  }
  // Search I/O is isolated; projections and their immutable hashes are built and verified by actual Product owners.
  SERVICE.DefaultProductSearchPublicationService = {
    persistenceModel: (_, model) => model, policy: () => ({ searchIndexName: "productLocalized" }),
    searchService: () => ({ doSave: async r => ({ code: "SUC_INDEX", result: r.model }) }),
    assertSearchSaveSucceeded: result => assert.equal(result.code, "SUC_INDEX"), refreshPublishedIndex: async () => {},
  };
  /** Runs one in-memory remote hop with that runtime's actual configured role and restores the caller role. */
  async function at(role, work) {
    const before = state.runtime; state.runtime = role;
    try { return await work(); } finally { state.runtime = before; }
  }
  const serving = { code: "COMMERCE", publication: "OPERATIONAL" }, staged = { code: "COMMERCE_STAGED", publication: "STAGED" };
  const facade = require(path.join(productPath, "src/facade/defaultProductPublicationFacade"));
  /** Supplies signed runtime claims at the simulated transport boundary, never alters the original human caller. */
  function runtime(module, input) {
    return { tenant: "tenant", payload: clone(input), authData: { tokenType: "service", principalType: "service",
      serviceId: "commerce-runtime", principalId: "commerce-runtime", tenant: "tenant", entCode: "market", runtimeInstanceId: "instance",
      runtimeScope: { projectCode: "project", environmentCode: "local", serverCode: "commerce", instanceCode: "instance", assignmentCode: "grant" },
      modules: [module], permissions: ["commerce.product.read", "commerce.product.publish", "commerce.digital.bundle.publish"],
      userGroups: [], groups: [] } };
  }
  const previousTransport = SERVICE.DefaultModuleService.invokeModule;
  SERVICE.DefaultModuleService.invokeModule = async call => {
    state.calls.push(call.apiName);
    if (call.apiName === "/reward-unit-evidence") return previousTransport(call);
    assert.equal(call.header.Authorization, "Bearer runtime");
    if (call.apiName === "/internal/stores/placement") return { contractVersion: 1, tenant: "tenant",
      store: { code: "store", enterpriseCode: "market", revision: 1, active: true, status: "ACTIVE" } };
    if (call.apiName === "/internal/bundle-listings/proof") return at(serving, () =>
      SERVICE.DefaultDigitalCommerceAuctionService.proof(runtime("digitalCore", call.requestBody), call.requestBody));
    if (call.apiName.startsWith("/internal/products/publication/")) {
      const phase = call.apiName.split("/").pop(), request = runtime("product", call.requestBody);
      if (phase === "authorize-target") return at(staged, () => facade.authorizeTarget(request));
      const method = phase === "status" ? "getStatus" : phase;
      assert.ok(["getStatus", "deploy", "withdraw", "rollback"].includes(method));
      return at(serving, async () => {
        await state.beforeTarget?.(method, call.requestBody);
        const result = await facade.target(request, method);
        await state.afterTarget?.(method, call.requestBody, result);
        return clone(result);
      });
    }
    return at(staged, async () => {
      const request = runtime("product", call.requestBody), phase = call.apiName.split("/").pop();
      if (phase === "store-context") return SERVICE.DefaultProductListingAuthoringService.storeContext(request);
      assert.ok(["prepare", "publish", "inspect", "withdraw"].includes(phase));
      await state.beforeProduct?.(phase, request);
      return SERVICE.DefaultProductBundlePublicationService.execute(request, phase);
    });
  };
  return { sources, records, state, product, publish };
};
