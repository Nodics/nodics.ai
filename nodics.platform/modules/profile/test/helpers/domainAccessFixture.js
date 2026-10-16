/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
/** @module profile/test/helpers/domainAccessFixture @description Resolves the canonical domain-owned access contribution for Profile integration tests. @layer test @owner profile */
const path = require("node:path");
const roots = {
  product: "nodics.commerce/modules/baseCommerce/modules/product",
  promotion: "nodics.commerce/modules/baseCommerce/modules/promotion",
  order: "nodics.commerce/modules/checkout/modules/order",
  publish: "nodics.foundation/modules/nPublish",
};
/** Reads source definitions without creating runtime authority or importing data. */
module.exports = function domainAccessFixture(name) {
  if (!Object.hasOwn(roots, name)) throw new Error("Unknown access owner");
  const root = path.resolve(__dirname, "../../../../..", roots[name]);
  const data = path.join(root, "data");
  const manifest = require(path.join(data, "manifest.json"));
  const records = require(path.join(data, `init-v001/records/identity/${name}UserGroupData.js`));
  const header = require(path.join(data, `init-v001/headers/identity/${name}UserGroupHeader.js`));
  return { name, root, data, manifest, section: manifest.sections.accessGroups, header,
    groups: Object.values(records), group: code => Object.values(records).find(row => row.code === code) };
};
