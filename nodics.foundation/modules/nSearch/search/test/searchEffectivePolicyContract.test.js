/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";

/** @module search/test/searchEffectivePolicyContract
 * @description Verifies owner readiness follows effective module/provider overrides, not role presets.
 * @owner nSearch @layer test
 */
const assert = require("node:assert/strict");
const service = require("../src/service/config/defaultSearchConfigurationService");
const search = {
    default: { options: { engine: "elastic", enabled: false, fallback: false }, elastic: { options: {} } },
    catalogue: { options: { enabled: true } },
    disabled: { options: { enabled: true }, elastic: { options: { enabled: false } } },
    remote: { options: { enabled: true } },
    runtimeRoleProfiles: { ARBITRARY: { misleading: { options: { enabled: true } } } },
};
global.CONFIG = { get: key => key === "search" ? search : key === "defaultTenant" ? "default" :
    key === "runtimeRole" ? { code: "ARBITRARY" } : undefined };
global.NODICS = { getModules: () => ({ catalogue: {}, disabled: {} }) };

let result = service.readSourcePolicy();
assert.deepEqual(result.enabledModuleCodes, ["catalogue"]);
assert.equal(result.readSourcePolicy, "SEARCH_ENGINE");
assert.equal(result.runtimeProfileCount, undefined);
search.catalogue.options.enabled = false;
result = service.readSourcePolicy();
assert.equal(result.enabledModuleCount, 0);
assert.equal(result.readSourcePolicy, "DATABASE_OR_OWNER_DEFAULT");
search.default.options.fallback = true;
assert.equal(service.readSourcePolicy().readSourcePolicy, "DATABASE_OR_OWNER_DEFAULT");
assert.equal(service.readSourcePolicy().defaultFallbackEnabled, true);
assert.equal(service.readSourcePolicy().fallbackExecution, "OWNER_DEFINED");

// Actual module contributions carry participation to an arbitrarily named runtime.
const path = require("node:path");
const merge = require("lodash/merge");
const root = path.resolve(__dirname, "../../../../..");
const base = require("../config/properties").search;
assert.equal(base.runtimeRoleProfiles, undefined);
const owners = {
    discoveryProjection: "nodics.discovery/modules/discoveryProjection",
    wcmsExperience: "nodics.wcms/modules/wcmsExperience",
    product: "nodics.commerce/modules/baseCommerce/modules/product",
    commerceSearchCore: "nodics.commerce/modules/baseCommerce/modules/commerceSearch/modules/commerceSearchCore",
};
for (const [name, location] of Object.entries(owners)) {
    assert.equal(base[name], undefined, "generic Search must not select domain participants");
    const contribution = require(path.join(root, location, "config/properties")).search;
    let effective = merge({}, base, { default: { elastic: { options: {} } } }, contribution);
    global.CONFIG.get = key => key === "search" ? effective : key === "defaultTenant" ? "default" :
        key === "runtimeRole" ? { code: "CUSTOM_DEPLOYMENT" } : undefined;
    global.NODICS.getModules = () => ({ [name]: {} });
    assert.deepEqual(service.readSourcePolicy().enabledModuleCodes, [name]);
    effective = merge({}, effective, { [name]: { options: { enabled: false } } });
    assert.deepEqual(service.readSourcePolicy().enabledModuleCodes, []);
}
console.log("Effective search policy follows module/provider overrides without role recomposition");
