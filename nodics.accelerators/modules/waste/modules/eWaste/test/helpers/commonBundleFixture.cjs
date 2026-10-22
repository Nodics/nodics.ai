/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** Isolated generated stores around actual Digital, eWaste, Waste and Loyalty owners. */
const assert = require("node:assert/strict");
const root = "../../../../../../../";
const fixture = require(root + "nodics.commerce/modules/digitalCommerce/modules/digitalCore/test/bundleSettlementFixture.cjs");
const component = require(root + "nodics.waste/modules/wasteCore/src/service/defaultWasteCertificateBundleComponentService");
const operations = require(root + "nodics.waste/modules/wasteCore/src/service/defaultWasteAssetTransferOperationService");
const schemas = require(root + "nodics.waste/modules/wasteCore/src/schemas/schemas").wasteCore;
const model = require(root + "nodics.foundation/modules/nDatabase/database/src/service/model/defaultModelService");
const domain = require("../../src/service/defaultEWasteDigitalSaleService");
const installWasteEnums = require(root + "nodics.waste/modules/wasteCore/test/helpers/runtimeEnums");

module.exports = async function (t, options = {}) {
  const originalEnums = global.ENUMS;
  t.after(() => { global.ENUMS = originalEnums; });
  const rows = { wasteAsset: [], wasteAssetOwnershipEvent: [] };
  const failures = {};
  let admitted = true;
  const owner = (code, schema = "customer") => ({ module: "profile", schema, code });
  const original = { code: "a", active: true, revision: 1, assetStatus: "OWNED", metadata: {},
    ownerRef: owner("seller", options.enterpriseSeller ? "enterprise" : "customer"),
    digitalOwnerRef: owner("seller", options.enterpriseSeller ? "enterprise" : "customer"),
    originalOwnerRef: owner("contributor"), physicalOwnerRef: owner("custodian", "enterprise"),
    custodyStatus: "TRANSFERRED_TO_RECYCLER", rewardSettlementRefs: [{ code: "original-reward" }],
    carbonSettlementRefs: [{ code: "original-carbon" }] };
  rows.wasteAsset.push(structuredClone(original));
  const f = await fixture(t, !!options.enterpriseSeller, { enterpriseBuyer: options.enterpriseBuyer,
    installComponents: () => {
      global.ENUMS = { ...global.ENUMS };
      installWasteEnums();
      const digitalModels = NODICS.getModels, config = CONFIG.get, carbon = SERVICE.Component;
      NODICS.getModels = () => ({ ...digitalModels(), ...Object.fromEntries(Object.keys(rows).map(name =>
        [name, { primaryKey: "code", rawSchema: schemas[name], compareAndSetItem() {} }])) });
      Object.assign(UTILS, { isBlank: v => !v || Object.keys(v).length === 0, isObject: v => !!v && typeof v === "object" && !Array.isArray(v),
        isObjectId: () => false, isArrayOfObject: v => Array.isArray(v) && v.every(x => typeof x === "object") });
      SERVICE.DefaultModelService = model;
      const nested = async (schema, data) => {
        const before = structuredClone(data);
        await model.saveNestedModels({ request: { tenant: "T", options: { recursive: false },
          schemaModel: { moduleName: "wasteCore", rawSchema: schemas[schema] } }, model: data,
          propertiesList: Object.keys(schemas[schema].refSchema), response: {} });
        assert.deepEqual(data, before, "typed owners must survive actual nested-save traversal");
      };
      SERVICE.DefaultCustomerService = SERVICE.DefaultEnterpriseService = {
        saveAll: () => assert.fail("A component must never persist a nested Profile identity") };
      const repositories = Object.fromEntries(Object.keys(rows).map(schema => [schema, {
        get: async r => ({ code: "SUC_TEST", result: structuredClone(rows[schema].filter(row => row.code === r.query.code)) }),
        save: async r => {
          await nested(schema, r.model);
          if (failures.eventBefore) { delete failures.eventBefore; throw Error("event unavailable"); }
          if (rows[schema].some(row => row.code === r.model.code)) throw Error("duplicate");
          rows[schema].push(structuredClone(r.model));
          if (failures.eventAfter) { delete failures.eventAfter; throw Error("event acknowledgement lost"); }
          return { code: "SUC_TEST", result: r.model };
        },
        update: async r => {
          await nested(schema, r.model);
          const row = rows[schema].find(row => row.code === r.query.code && row.revision === r.query.revision);
          if (row) Object.assign(row, structuredClone(r.model), { revision: r.query.revision + 1 });
          if (failures.updateAfter) { delete failures.updateAfter; throw Error("update acknowledgement lost"); }
          return { code: "SUC_TEST", result: { matchedCount: row ? 1 : 0 } };
        },
      }]));
      SERVICE.DefaultWastePersistenceService = { repository: name => repositories[name], context: r => ({ tenant: r.tenant }), records: r => r.result };
      SERVICE.DefaultWasteAssetTransferOperationService = operations;
      SERVICE.DefaultWasteCertificateBundleComponentService = component;
      SERVICE.DefaultSecuredRequestPipelineService = { getGrantedPermissions: () => [], isPermissionGranted: () => admitted };
      CONFIG.get = key => key === "eWaste" ? { marketplace: { digitalOwnership: {
        enabled: true, qualified: true, allowedServicePrincipals: ["unit-commerce"] } } } : config(key);
      const authData = { tokenType: "service", principalType: "service", principalId: "unit-commerce", tenant: "T", enterpriseCode: "market" };
      SERVICE.Component = { retainsTransferLock: true, ...Object.fromEntries(["inspect", "reserve", "transfer", "finalize", "release"].map(phase =>
        [phase, async (r, input) => {
          if (input.component.kind !== "CERTIFICATE") return carbon[phase](r, input);
          const result = await domain.invoke({ tenant: r.tenant, authData, payload: input }, "bundle-" + phase);
          if (phase === "transfer" && failures.certificateAfter) {
            delete failures.certificateAfter; throw Error("certificate acknowledgement uncertain");
          }
          return result;
        }])) };
    } });
  return { ...f, wasteRows: rows, original, failures, denyComponents: () => { admitted = false; } };
};
