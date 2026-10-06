/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module profile/test/enterpriseParentReference @description Keeps hierarchy persistence aligned with the code-owned enterprise reference and service contract. @layer test @owner profile */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const previousEnums = global.ENUMS;
global.ENUMS = { ContactType: Object.fromEntries(["EMAIL", "PHONE", "FAX", "PAGER"].map(key => [key, { key }])) };
const schemas = require("../src/schemas/schemas");
if (previousEnums === undefined) delete global.ENUMS;
else global.ENUMS = previousEnums;
const enterprise = require("../src/service/enterprise/defaultEnterpriseService");

test("parent-enterprise storage uses the declared reference code, not an ObjectId", () => {
  const schema = schemas.profile?.enterprise || schemas.enterprise;
  assert.equal(schema.definition.superEnterprise.type, "string");
  assert.equal(schema.refSchema.superEnterprise.propertyName, "code");
  assert.equal(schema.refSchema.superEnterprise.schemaName, "enterprise");
  assert.equal(enterprise.hierarchyReferenceCode("DEMO_PARENT"), "DEMO_PARENT");
  assert.equal(enterprise.hierarchyReferenceCode({ code: "DEMO_PARENT" }), "DEMO_PARENT");
  assert.equal(enterprise.hierarchyReferenceCode(undefined, true), undefined);
});
