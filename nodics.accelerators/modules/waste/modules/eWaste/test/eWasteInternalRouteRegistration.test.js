/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module eWaste/test/eWasteInternalRouteRegistration @description Real nRouter preparation, registry refresh and controller dispatch regressions; no HTTP listener, native authorization or domain mutations. @layer test @owner eWaste */
const test = require("node:test"), assert = require("node:assert/strict");
const routes = require("../src/router/routers").eWaste;
const routerRoot = "../../../../../../nodics.foundation/modules/nRouter/src/service/";
const preparation = require(routerRoot + "router/defaultRouterService");
const operation = require(routerRoot + "router/defaultRouterOperationService");
const dispatch = require(routerRoot + "request/defaultRequestHandlerPipelineService");

function fixture(t, definitions = routes) {
  const keys = ["CONFIG", "NODICS", "SERVICE", "CONTROLLER"];
  const previous = Object.fromEntries(keys.map(key => [key, global[key]]));
  t.after(() => { for (const key of keys) {
    if (previous[key] === undefined) delete global[key]; else global[key] = previous[key];
  } });
  const registry = new Map(), bound = [], calls = [];
  global.CONFIG = { get: key => key === "servers" ? { options: { contextRoot: "nodics" } }
    : key === "cache" ? { cacheability: { logSkippedReason: false } } : undefined };
  global.NODICS = { addRouter: (name, value) => registry.set(name, value), getRouter: name => registry.get(name) };
  global.CONTROLLER = {
    DefaultEWasteDigitalSaleController: require("../src/controller/defaultEWasteDigitalSaleController"),
    DefaultEWasteDigitalListingController: require("../src/controller/defaultEWasteDigitalListingController"),
    DefaultEWasteOrderReversalController: require("../src/controller/defaultEWasteOrderReversalController"),
  };
  const observe = (owner, phase) => async input => { calls.push({ owner, phase, input }); return { owner, phase }; };
  global.SERVICE = {
    DefaultRouterOperationService: {},
    DefaultLoggerService: { isSensitiveRequest: () => true, hasPrivateCaptureProtection: () => true },
    DefaultEWasteDigitalSaleService: { invoke: (input, phase) => observe("sale", phase)(input) },
    DefaultEWasteDigitalListingService: { plan: observe("listing", "plan") },
    DefaultEWasteOrderReversalService: { preview: observe("reversal", "preview") },
  };
  // Capture real prepared routes without binding sockets or replacing registry behavior.
  for (const verb of ["get", "post", "put", "delete", "patch", "head", "options"])
    SERVICE.DefaultRouterOperationService[verb] = (_router, definition) => bound.push(definition);
  for (const group of Object.values(definitions)) for (const [routerName, routerDef] of Object.entries(group))
    if (routerDef?.method) preparation.prepareRouter({ routerName, routerDef, moduleName: "eWaste", urlPrefix: "eWaste", moduleRouter: {} });
  return { registry, bound, calls };
}

test("all internal owner routes retain unique identities, controllers and authority through real registry refresh", async t => {
  const f = fixture(t), authData = { tenant: "test", tokenType: "service" };
  const scenarios = [
    ["/internal/order-reversals/:phase", "ewaste_internalorderreversalinvoke", "DefaultEWasteOrderReversalController", "waste.asset.sale.transfer", "preview", "reversal"],
    ["/internal/digital-sales/:phase", "ewaste_internaldigitalsaleinvoke", "DefaultEWasteDigitalSaleController", "waste.asset.sale.transfer", "evidence", "sale"],
    ["/internal/digital-listings/:phase", "ewaste_internaldigitallistinginvoke", "DefaultEWasteDigitalListingController", "waste.asset.marketplace.project", "plan", "listing"],
  ];
  for (const [key, identity, controller, permission, phase, owner] of scenarios) {
    const captured = f.bound.find(value => value.key === key);
    assert.equal(captured.routerName, identity);
    const result = await new Promise((resolve, reject) => {
      SERVICE.DefaultRequestHandlerService = { startRequestHandler(request, response, refreshed) {
        assert.equal(refreshed, captured);
        assert.equal(refreshed.controller, controller); assert.equal(refreshed.operation, "invoke");
        assert.equal(refreshed.permission, permission); assert.equal(refreshed.secured, true);
        assert.deepEqual(refreshed.authTokenTypes, ["service"]);
        assert.deepEqual(refreshed.accessGroups, ["serviceAccountUserGroup"]);
        assert.equal(refreshed.apiExposure, "wasteInternal");
        if (owner !== "reversal") {
          assert.deepEqual(refreshed.requestPrivacy, { sensitive: true });
          assert.deepEqual(refreshed.cache, { enabled: false });
        }
        dispatch.handleRequest.call({ LOG: { debug() {} } }, { ...request, router: refreshed }, response,
          { error: (_r, _s, error) => reject(error), nextSuccess: (_r, value) => resolve(value.success) });
      } };
      operation.bindOperation({ tenant: "test", authData, httpRequest: { params: { phase }, body: {} } }, {}, captured);
    });
    assert.deepEqual(result, { data: { owner, phase } });
    assert.equal(f.calls.at(-1).input.authData, authData);
  }
  assert.equal(f.calls.length, 3);
});

test("reusing invoke across groups reproduces the overwritten sale controller and permission", t => {
  const definitions = structuredClone(routes);
  for (const [group, name] of [["internalOrderReversal", "internalOrderReversalInvoke"],
    ["internalDigitalSale", "internalDigitalSaleInvoke"], ["internalDigitalListing", "internalDigitalListingInvoke"]]) {
    definitions[group].invoke = definitions[group][name]; delete definitions[group][name];
  }
  const f = fixture(t, definitions);
  const sale = f.bound.find(value => value.key === "/internal/digital-sales/:phase");
  assert.equal(sale.routerName, "ewaste_invoke");
  assert.equal(sale.controller, "DefaultEWasteDigitalSaleController");
  assert.equal(f.registry.get(sale.routerName).controller, "DefaultEWasteDigitalListingController");
  assert.equal(f.registry.get(sale.routerName).permission, "waste.asset.marketplace.project");
});
