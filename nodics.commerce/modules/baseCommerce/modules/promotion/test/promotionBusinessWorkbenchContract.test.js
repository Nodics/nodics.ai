/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @module promotion/test/promotionBusinessWorkbenchContract @description Verifies real business groups, descriptor and safe-query owners plus generated read guards over isolated storage. No installed/runtime or browser qualification. @layer test @owner promotion */
const test = require("node:test"), assert = require("node:assert/strict");
const path = require("node:path"), root = path.resolve(__dirname, "../../../../../..");
const foundation = file => require(path.join(root, "nodics.foundation/modules", file));
const workbench = require("../src/service/defaultPromotionBusinessWorkbenchService");
const controller = require("../src/controller/defaultPromotionBusinessWorkbenchController");
const contribution = require("../src/service/defaultPromotionBackofficeCapabilityService");
const routes = require("../src/router/routers").promotion.business;
const generatedReads = require("./helpers/generatedCouponReadFixture");
const groups = Object.values(require("../data/init-v001/records/identity/promotionBusinessAccessGroupData"));
const catalogue = Object.fromEntries([...groups,
    ...Object.values(require(path.join(root, "nodics.platform/modules/axis/data/init-v001/records/identity/axisUserGroupData"))),
    ...Object.values(require(path.join(root, "nodics.platform/modules/profile/data/init-v001/records/identity/profileUserGroupData"))),
].map(group => [group.code, group]));
const statuses = Object.assign({}, require("../src/utils/statusDefinitions"), foundation("nCommon/src/utils/statusDefinitions"),
    foundation("nDatabase/database/src/utils/statusDefinitions"), foundation("nAuth/src/utils/statusDefinitions"));
const unconfirmed = { code: "ERR_PROMOTION_WORKBENCH_UNCONFIRMED" };

/** Hydrates real persisted group ancestry without inventing business grants. */
function hydrate(code) {
    const group = catalogue[code]; assert(group);
    return { ...group, parentGroups: (group.parentGroups || []).map(hydrate) };
}
/** Limited isolated cursor matching for the real parser's conjunction, disjunction, equality and escaped text output. */
function matches(row, query) {
    return Object.entries(query).every(([key, value]) => {
        if (key === "$and") return value.every(item => matches(row, item));
        if (key === "$or") return value.some(item => matches(row, item));
        if (value && typeof value === "object") {
            assert.deepEqual(Object.keys(value).sort(), ["$options", "$regex"]);
            return new RegExp(value.$regex, value.$options).test(row[key]);
        }
        return row[key] === value;
    });
}
/** Installs real shared metadata/parser and generated read pipeline with isolated cursor/count storage. */
function fixture(t, group = groups[0]) {
    const keys = ["CONFIG", "SERVICE", "CLASSES"];
    const previous = Object.fromEntries(keys.map(key => [key, Object.getOwnPropertyDescriptor(global, key)]));
    t.after(() => {
        for (const key of keys) {
            if (previous[key]) Object.defineProperty(global, key, previous[key]); else delete global[key];
        }
    });
    const settings = { defaultPageSize: 25, routeActionAuthorization: { enabled: true, strict: true },
        defaultErrorCodes: { NodicsError: "ERR_SYS_00000" }, identityGovernance: { systemAccessGroups: ["serviceAccountUserGroup"] },
        schemaApi: { defaultModelOperations: ["create", "read", "update", "delete", "search"], defaultMutationMode: "GENERATED_CRUD",
            defaultPageSize: 25, allowedPageSizes: [10, 25, 50, 100], maximumPageSize: 100 } };
    global.CONFIG = { get: key => settings[key] };
    global.CLASSES = { NodicsError: foundation("nCommon/src/lib/nodicsError") };
    global.SERVICE = {
        DefaultStatusService: { get: code => { assert(statuses[code], "Registered status: " + code); return statuses[code]; } },
        DefaultPromotionBusinessWorkbenchService: workbench,
        DefaultSchemaUtilityService: foundation("nDatabase/database/src/service/schema/defaultSchemaUtilityService"),
        DefaultSchemaSafeQueryService: foundation("nDatabase/database/src/service/schema/defaultSchemaSafeQueryService"),
        DefaultSecuredRequestPipelineService: foundation("nRouter/src/service/request/defaultSecuredRequestPipelineService"),
        DefaultIdentityGovernanceService: foundation("nAuth/src/service/identity/defaultIdentityGovernanceService"),
        DefaultBackofficeCapabilityDefinitionService: foundation("nService/src/service/module/defaultBackofficeCapabilityDefinitionService"),
    };
    const row = { code: "campaign", tenant: "runtime", enterpriseCode: "issuer", name: "Campaign", status: "ACTIVE", priority: 1,
        revision: 1, validFrom: new Date("2026-01-01"), budget: { spent: "SECRET" }, budgetAdmission: { receipt: "SECRET" },
        actions: { credential: "SECRET" }, sellerAuthorization: { evidence: "SECRET" }, protectedToken: "SECRET", tokenHash: "SECRET" };
    const rows = [row, { ...row, enterpriseCode: "other" }, { ...row, tenant: "other" },
        { ...row, code: "unscoped", enterpriseCode: undefined }];
    const state = generatedReads(t, () => rows, ["promotion"]);
    state.matchesQuery = matches;
    global.UTILS = { ...foundation("nCommon/src/utils/utils"), ...foundation("nRouter/src/utils/utils"), ...UTILS };
    const schemas = { promotion: NODICS.getModels().promotionModel.rawSchema };
    Object.assign(NODICS, { getModule: name => name === "promotion" ? { rawSchema: schemas } : undefined,
        getRouters: () => routes, getServerState: () => "started" });
    const userGroups = [hydrate(group.code)];
    const request = { tenant: "runtime", entCode: "issuer", moduleName: "promotion",
        authData: { tenant: "runtime", entCode: "issuer", principalType: "human", tokenType: "access", loginId: "employee",
            authVersion: 1, userGroups, permissions: UTILS.getUserGroupPermissions(userGroups) },
        httpRequest: { headers: { "x-enterprise-code": "issuer", "x-tenant-code": "runtime" }, body: {} } };
    return { request, state, rows, settings, schemas };
}
/** Runs actual post-authentication route admission. */
function admit(request, route) {
    return new Promise((resolve, reject) => SERVICE.DefaultSecuredRequestPipelineService.checkAccess({ ...request, router: route }, {},
        { nextSuccess: resolve, error: (_request, _response, error) => reject(error) }));
}

for (const group of groups) test(group.code + " discovers and searches own campaigns without schema grants", async t => {
    const f = fixture(t, group), original = structuredClone(f.request);
    for (const route of Object.values(routes).filter(route => route.permission === "commerce.promotion.read")) await admit(f.request, route);
    const result = await controller.schemas(f.request), descriptor = result.data.schemas[0];
    assert.equal(result.data.schemas.length, 1);
    assert.equal(descriptor.moduleName, "promotion");
    assert.equal(descriptor.schemaName, "promotion");
    assert.deepEqual(descriptor.operations, ["search", "read"]);
    assert.equal(descriptor.mutationMode, "READ_ONLY");
    assert.equal(descriptor.authoring.authoringAllowed, false);
    assert(descriptor.fields.every(field => field.readOnly && workbench.fields().includes(field.name)));
    assert.deepEqual(Object.keys(descriptor.apiOperations).sort(), ["capabilities", "search"]);
    assert.equal(descriptor.apiOperations.search.path, "/business/promotions/search");
    assert.equal(descriptor.form, undefined);
    assert.deepEqual(descriptor.relationships, []);
    assert.deepEqual(descriptor.aggregateOperations, []);
    assert.deepEqual(descriptor.bulkCapabilities.operations, []);
    assert(descriptor.bulkCapabilities.maximumItems > 0);
    assert.deepEqual((await controller.capabilities(f.request)).data, descriptor);
    const response = await controller.search(f.request);
    assert.equal(response.data.records.length, 1);
    assert.equal(response.data.totalCount, 1);
    assert.equal(response.data.records[0].code, "campaign");
    assert(!JSON.stringify(response).includes("SECRET"));
    assert(!Object.hasOwn(response.data.records[0], "enterpriseCode"));
    assert.deepEqual(f.state.reads[0].query.$and[0], { tenant: "runtime", enterpriseCode: "issuer" });
    assert.equal(f.state.current.authData.isSystem, true);
    assert.equal(f.state.current.searchOptions.projection.enterpriseCode, 1);
    assert.equal(f.state.current.searchOptions.projection.budget, undefined);
    assert.equal(f.state.current.options.recursive, false);
    assert.equal(f.state.current.options.skipItemCache, true);
    assert.deepEqual(f.request, original);
    assert.equal(SERVICE.DefaultSchemaAccessHandlerService.getAccessPoint(f.request.authData, f.schemas.promotion.accessGroups), 0);
    await assert.rejects(SERVICE.DefaultPromotionService.get({ tenant: "runtime", authData: f.request.authData, query: { code: "campaign" } }));
});

test("both implemented contributions use owner discovery; specialist pages remain disabled", t => {
    fixture(t);
    const navigation = contribution.getCapability().navigation;
    const active = navigation.filter(item => item.featureState !== "DISABLED");
    assert.equal(active.length, 2);
    for (const item of active) {
        assert.deepEqual(item.workbenchTarget, { moduleName: "promotion", schemaName: "promotion" });
        assert.deepEqual(item.workbenchPresentation.schemaDiscovery, { path: "/business/promotions/schemas", apiVersion: "v0" });
        assert.equal(require(path.join(root, "nodics.platform/modules/backoffice/src/service/contract/defaultBackofficeContractService"))
            .validateNavigationWorkbenchPresentation(item.workbenchPresentation), true);
    }
    assert.equal(navigation.filter(item => item.featureState === "DISABLED").length, 8);
    assert(Object.values(routes).every(route => ["commerce.promotion.read", "commerce.promotion.draft.write"].includes(route.permission) && route.secured &&
        route.apiExposure === "commerceManagement" && route.cache.enabled === false));
});

test("missing, foreign, service or ambiguous authority refuses before generated reads", async t => {
    const f = fixture(t);
    const cases = [r => { delete r.authData; }, r => { delete r.authData.entCode; }, r => { delete r.authData.tenant; },
        r => { delete r.authData.loginId; }, r => { r.authData.principalType = "service"; },
        r => { r.authData.tokenType = "service"; }, r => { r.authData.isSystem = true; }, r => { r.authData.runtimeScope = true; },
        r => { r.authData.userGroups = []; }, r => { r.authData.userGroups = ["employeeUserGroup"]; r.authData.permissions = []; },
        r => { r.transactionContext = {}; }, r => { r.internalPersistence = true; }];
    for (const holder of ["authData", "root", "body", "query"])
        for (const key of ["tenant", "tenantCode", "entCode", "enterpriseCode"])
            for (const value of ["other", null, "", ["issuer"]]) cases.push(r => {
                const target = holder === "root" ? r : ["body", "query"].includes(holder) ? (r.httpRequest[holder] ||= {}) : r[holder];
                target[key] = value;
            });
    for (const key of ["X-Enterprise-Code", "entCode", "enterpriseCode", "X-Tenant-Code", "tenant", "tenantCode"])
        cases.push(r => { r.httpRequest.headers[key] = "other"; });
    cases.push(r => { r.httpRequest.body = { query: { enterpriseCode: "other" } }; });
    for (const mutate of cases) {
        const request = structuredClone(f.request); mutate(request);
        await assert.rejects(controller.schemas(request), unconfirmed);
        await assert.rejects(controller.search(request), unconfirmed);
    }
    assert.equal(f.state.findCalls, 0);
});

test("same-campaign scope is not widened by nested disjunction, text or pagination", async t => {
    const f = fixture(t);
    f.request.httpRequest.body = { query: { pageSize: 10, search: "Campaign", filters: { operator: "OR", items: [
        { field: "status", operator: "EQUALS", value: "ACTIVE" }, { field: "name", operator: "EQUALS", value: "Campaign" },
    ] } } };
    assert.equal((await controller.search(f.request)).data.records.length, 1);
    assert.equal(f.state.reads[0].query.$and.length, 2);
    f.request.httpRequest.body.query.pageNumber = 2;
    const page = (await controller.search(f.request)).data;
    assert.equal(page.records.length, 0);
    assert.equal(page.totalCount, 1);
    assert.equal(page.pageNumber, 2);
});

test("exact empty evidence and maximum bounded pages work with independent signed aliases", async t => {
    const f = fixture(t), own = structuredClone(f.rows[0]);
    f.request.authData.enterpriseCode = f.request.authData.entCode;
    f.request.authData.tenantCode = f.request.authData.tenant;
    delete f.request.authData.entCode;
    delete f.request.authData.tenant;
    f.rows.shift();
    const empty = await controller.search(f.request);
    assert.equal(empty.data.totalCount, 0);
    assert.deepEqual(empty.data.records, []);
    f.rows.push(...Array.from({ length: 101 }, (_, index) => ({ ...own, code: "own-" + String(index).padStart(3, "0") })));
    f.request.httpRequest.body = { pageSize: 100 };
    const first = (await controller.search(f.request)).data;
    assert.equal(first.records.length, 100);
    assert.equal(first.totalCount, 101);
    f.request.httpRequest.body.pageNumber = 2;
    const second = (await controller.search(f.request)).data;
    assert.equal(second.records.length, 1);
    assert.equal(second.records[0].code, "own-100");
    assert.equal(second.totalCount, 101);
});

test("scope and private-field selectors, oversized queries and unsupported schemas never dispatch", async t => {
    const f = fixture(t);
    for (const body of [{ pageSize: 1000 }, { pageNumber: Number.MAX_SAFE_INTEGER },
        { sort: { field: "budget", direction: "ASC" } }, { schemaName: "coupon" }, { moduleName: "profile" },
        ...["enterpriseCode", "tenant", "budget.spent", "tokenHash", "sellerAuthorization"].map(field => ({
            filters: { operator: "AND", items: [{ field, operator: "EQUALS", value: "other" }] },
        }))]) {
        f.request.httpRequest.body = body;
        await assert.rejects(controller.search(f.request));
    }
    assert.equal(f.state.findCalls, 0);
});

test("failed, foreign, unscoped, duplicate and malformed provider evidence cannot be returned", async t => {
    const f = fixture(t);
    for (const mutate of [r => { r.code = "ERR_READ"; }, r => { delete r.count; }, r => { r.count = -1; },
        r => { r.success = false; }, r => { r.acknowledged = false; }, r => { r.error = "failed"; }, r => { r.errors = ["failed"]; },
        r => { r.result[0].tenant = "other"; }, r => { r.result[0].enterpriseCode = "other"; },
        r => { delete r.result[0].enterpriseCode; }, r => { r.result[0].enterpriseCode = null; },
        r => { r.result[0].name = { secret: "SECRET" }; }, r => { r.result[0].code = ""; },
        r => { r.result.push(r.result[0]); r.count = 2; }, r => { r.result = Array(26).fill(r.result[0]); r.count = 26; }]) {
        f.state.afterGet = mutate;
        await assert.rejects(controller.search(f.request), unconfirmed);
    }
});

test("authority drift after provider await refuses without rewriting original auth", async t => {
    const f = fixture(t);
    for (const mutate of [r => { r.authData.entCode = "other"; }, r => { r.authData.authVersion++; },
        r => { r.authData.permissions = []; r.authData.userGroups = ["employeeUserGroup"]; }]) {
        const request = structuredClone(f.request);
        f.state.afterGet = () => mutate(request);
        await assert.rejects(controller.search(request), unconfirmed);
    }
});

test("search rejects nonboolean acknowledgements and nested values in every projected field", async t => {
    const f = fixture(t);
    for (const acknowledged of [false, "true", "false", 0, 1, null, undefined, {}, []]) {
        f.state.afterGet = response => { response.acknowledged = acknowledged; };
        await assert.rejects(controller.search(f.request), unconfirmed);
    }
    f.state.afterGet = response => { response.acknowledged = true; };
    assert.equal((await controller.search(f.request)).data.records.length, 1);
    for (const field of ["name", "status", "priority", "validFrom", "validTo", "revision"])
        for (const value of [{ privateEvidence: "SECRET" }, ["SECRET"]]) {
            f.state.afterGet = response => { response.result[0][field] = value; };
            await assert.rejects(controller.search(f.request), unconfirmed);
        }
    for (const [field, value] of [["priority", NaN], ["priority", Infinity], ["validFrom", new Date(NaN)]]) {
        f.state.afterGet = response => { response.result[0][field] = value; };
        await assert.rejects(controller.search(f.request), unconfirmed);
    }
});

test("unavailable descriptors/routes/persistence fail closed and later layers can narrow fields", async t => {
    const f = fixture(t), original = SERVICE.DefaultSchemaUtilityService;
    for (const resolveDescriptor of [() => undefined, () => ({ moduleName: "profile", schemaName: "promotion" })]) {
        SERVICE.DefaultSchemaUtilityService = { ...original, resolveDescriptor };
        await assert.rejects(controller.schemas(f.request), unconfirmed);
    }
    SERVICE.DefaultSchemaUtilityService = { ...original, findOperationRoute: () => undefined };
    await assert.rejects(controller.schemas(f.request), unconfirmed);
    SERVICE.DefaultSchemaUtilityService = original;
    SERVICE.DefaultPromotionBusinessWorkbenchService = { ...workbench, fields: () => ["code", "status"] };
    const response = await controller.search(f.request);
    assert.deepEqual(response.data.records, [{ code: "campaign", status: "ACTIVE" }]);
    delete SERVICE.DefaultPromotionService;
    await assert.rejects(controller.search(f.request), unconfirmed);
});
