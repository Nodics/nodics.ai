/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
/** @module backoffice/test/workbenchOwnerDiscoveryContract @description Tests inert same-owner Workbench discovery metadata, not permission or transport execution. @layer test @owner backoffice */
const test = require("node:test");
const assert = require("node:assert/strict");
const service = require("../src/service/contract/defaultBackofficeContractService");
const contracts = require("../src/schemas/apiContracts");
const definitions = require("../../../../nodics.foundation/modules/nService/src/service/module/defaultBackofficeCapabilityDefinitionService");

test("owner discovery uses existing navigation presentation without granting operations", () => {
  const schemaDiscovery = { path: "/business/products/schemas", apiVersion: "v0" };
  const entry = definitions.workbench({ id: "products", label: "Products", moduleName: "product",
    schemaName: "product", route: "/products", permission: "commerce.product.read",
    presentation: { schemaDiscovery } });
  assert.deepEqual(entry.workbenchPresentation.schemaDiscovery, schemaDiscovery);
  assert.equal(service.validateNavigationWorkbenchPresentation(entry.workbenchPresentation), true);
  assert.deepEqual(entry.requiredPermissions, ["commerce.product.read"]);
  assert.equal(entry.workbenchPresentation.permissions, undefined);
  assert.equal(service.validateNavigationWorkbenchPresentation({ summary: "Ordinary schema tools" }), true);
});

test("discovery rejects foreign authority, dynamic paths and executable or unknown fields", () => {
  for (const path of ["https://foreign.test/schema", "//foreign.test/schema", "/../schema", "/%2e%2e/schema",
    "/schema?tenant=foreign", "/schema#fragment", "/schema/{code}", "/schema/:code", "/", "/schema/", "/" + "a".repeat(256)]) {
    assert.equal(service.validateNavigationWorkbenchPresentation({ schemaDiscovery: { path, apiVersion: "v0" } }), false, path);
  }
  for (const discovery of [null, [], {}, { path: "/schemas" }, { path: "/schemas", apiVersion: "latest" },
    { path: "/schemas", apiVersion: "v1000" }, { path: "/schemas", apiVersion: "v0", moduleName: "other" },
    { path: "/schemas", apiVersion: "v0", method: "POST" }, { path: "/schemas", apiVersion: "v0", headers: {} }]) {
    assert.equal(service.validateNavigationWorkbenchPresentation({ schemaDiscovery: discovery }), false);
  }
});

test("published contract and runtime validator retain the same bounded discovery shape", () => {
  const schema = contracts.backofficeMetadata.properties.navigation.items.properties.workbenchPresentation.properties.schemaDiscovery;
  assert.equal(schema.additionalProperties, false);
  assert.deepEqual(schema.required, ["path", "apiVersion"]);
  assert.deepEqual(Object.keys(schema.properties).sort(), ["apiVersion", "path"]);
  for (const [path, apiVersion] of [["/business/custom/schemas", "v3"], ["/a", "v999"], ["/" + "x".repeat(255), "v0"]]) {
    assert.equal(new RegExp(schema.properties.path.pattern).test(path), true);
    assert.equal(new RegExp(schema.properties.apiVersion.pattern).test(apiVersion), true);
    assert.equal(service.validateNavigationWorkbenchPresentation({ schemaDiscovery: { path, apiVersion } }), true);
  }
});
