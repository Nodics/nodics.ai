/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module profile/test/helpers/identityCatalogueFixture
 * @description Supplies isolated persisted-role doubles to existing owner journey tests; production never consults test definitions.
 * @layer test @owner profile
 */
const clone = require("lodash/cloneDeep");
const fs = require("node:fs"), path = require("node:path");
const metadata = require("../../../../../nodics.foundation/modules/nTooling/src/service/context/defaultModuleLlmContextUtilsService");
const modules = metadata.scanModules(path.resolve(__dirname, "../../../../.."));
/** Test-only discovery reads explicit owner source records; it is not a runtime importer. */
function records(suffix) {
  return modules.flatMap(module => {
    const file = path.join(module.path, "data/init-v001/records/identity", module.name + suffix + "Data.js");
    return fs.existsSync(file) ? Object.values(require(file)) : [];
  });
}
const roleRecords = records("EnterpriseRole").concat(records("BusinessAccessRole"), records("SpecialAccessRole"));

/** Each fixture owns a separate editable role-record collection. */
function roles() { return Object.fromEntries(roleRecords.map(row => [row.code, clone(row)])); }

/** Retains legacy fixture layout only as test input; consumers receive the explicit catalogue double below. */
function properties() {
  const result = clone(require("../../config/properties"));
  result.enterpriseManagement.accessAssignments.roles = roles();
  return result;
}

/** Supplies async owner lookups backed by explicit fixture rows, not runtime configuration fallback. */
function catalogue(records, permissions) {
  const defaults = roles();
  const current = () => typeof records === "function" ? records() || defaults : records || defaults;
  return {
    businessMetadata: require("../../src/service/identity/defaultIdentityCatalogueService").businessMetadata,
    businessAreas: require("../../src/service/identity/defaultIdentityCatalogueService").businessAreas,
    fail() { throw new Error("Invalid business access metadata"); },
    codes(values) { if (!Array.isArray(values) || values.some(value => typeof value !== "string")) throw new Error("Invalid permission codes"); return values; },
    async requirePermissions(values) {
      this.codes(values);
      if (permissions && values.some(code => !permissions.includes(code))) throw new CLASSES.NodicsError("ERR_AUTH_00003", "Unknown permission in identity permission catalog");
      return values.map(code => ({ code, active: true }));
    },
    async role(code) {
      const value = current()[code];
      if (!value || value.active === false) throw new CLASSES.NodicsError("ERR_AUTH_00003", "Enterprise role is unavailable");
      return clone({ active: true, scopeType: "ENTERPRISE", delegable: true, assignmentPermissions: [], ...value });
    },
    async roles() { const result = {}; for (const code of Object.keys(current())) result[code] = await this.role(code); return result; },
  };
}
module.exports = { roles, properties, catalogue, records };
