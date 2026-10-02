/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @module profile/test/enterpriseContextSwitch
 * @description Independent switch-proof, cookie privacy, issuer cleanup and qualification fixtures; not installed auth-cache or browser acceptance.
 * @layer test
 * @owner profile
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const provider = require("../src/service/authentication/defaultAuthenticationProviderService");
const browser = require("../src/service/authentication/defaultBrowserSessionService");
const membership = require("../src/service/enterprise/defaultEnterpriseMembershipService");
const properties = require("../config/properties");
const routes = require("../src/router/routers").profile.loadDefaults;
const capability = require("../src/service/defaultProfileBackofficeCapabilityService");

function fixture() {
    global.CLASSES = {
        NodicsError: class extends Error {
            constructor(code) {
                super(code);
                this.code = code;
            }
        },
    };
    global.CONFIG = {
        get: (key) => (key === "profileModuleName" ? "profile" : undefined),
    };
    global.UTILS = {
        getUserGroupPermissions: () => ["profile.backoffice.view"],
    };
    const anchor = {
        identity: {
            tenantCode: "original",
            recordKind: "EMPLOYEE",
            recordId: "identity",
        },
        person: { loginId: "person@example.test" },
    };
    const authData = {
        entCode: "first",
        tenant: "firstTenant",
        loginId: "person@example.test",
        authVersion: 1,
        authenticationMethod: "PASSWORD",
        principalType: "human",
        tokenType: "access",
    };
    const previous = {
        ...authData,
        type: "Employee",
        userGroups: ["adminGroup"],
        permissions: ["platform.global"],
    };
    const issued = [],
        removed = [],
        consumed = [];
    global.SERVICE = {
        DefaultAuthSecurityService: {
            ...require("../../../../nodics.foundation/modules/nAuth/src/service/security/defaultAuthSecurityService"),
        },
        DefaultEnterpriseMembershipService: {
            prepareContextSwitch: async () => ({
                context: {
                    anchor,
                    person: {
                        loginId: "person@example.test",
                        authVersion: 2,
                        userGroups: ["targetGroup"],
                    },
                    sessionContext: {
                        owner: "profile",
                        code: "membership",
                        version: 3,
                    },
                    securityBindings: [
                        {
                            tenant: "original",
                            principalId: "identity",
                            authVersion: 1,
                        },
                    ],
                },
                item: { enterpriseCode: "second", tenantCode: "secondTenant" },
            }),
            digest: (value) => JSON.stringify(value),
            actor: async () => anchor,
            credential: async () => ({ active: true }),
            validateContext: async () => anchor,
        },
        DefaultEnterpriseService: {
            retrieveEnterprise: async () => ({
                active: true,
                tenant: { code: "firstTenant", active: true },
            }),
        },
        DefaultPrincipalSecurityStampService: { register: async () => {} },
    };
    const owner = {
        ...provider,
        consumeToken: async (_module, token) => {
            consumed.push(token);
            return previous;
        },
        assertEmployeeRegistrationSession: async () => {},
        resolveSessionUserGroups: (person) => person.userGroups,
        createRefreshToken: async (value) => {
            issued.push(value);
            return "next-private-refresh";
        },
        generateAuthToken: () => "target-access",
        recordAuthEvent: async () => {},
        removeToken: async (_module, token) => {
            removed.push(token);
        },
    };
    return {
        owner,
        previous,
        issued,
        removed,
        consumed,
        request: {
            authData,
            tenant: "firstTenant",
            refreshToken: "old-private-refresh",
            body: { assignmentCode: "membership", revision: 3 },
        },
    };
}
test("issuer consumes same-context PASSWORD proof and does not union source permissions", async () => {
    const f = fixture();
    const value = await f.owner.switchEnterpriseContext(f.request);
    assert.deepEqual(f.consumed, ["old-private-refresh"]);
    assert.equal(value.enterpriseCode, "second");
    assert.deepEqual(f.issued[0].userGroups, ["targetGroup"]);
    assert.deepEqual(f.issued[0].permissions, ["profile.backoffice.view"]);
    assert.equal(f.issued[0].tenant, "secondTenant");
    assert.equal(f.issued[0].password, undefined);
});
test("wrong cookie person, enterprise, method, type or bindings cannot issue target tokens", async () => {
    for (const change of [
        { loginId: "another@example.test" },
        { entCode: "other" },
        { authVersion: 2 },
        { authenticationMethod: "EXTERNAL" },
        { type: "Customer" },
        { sessionContext: { owner: "profile", code: "different", version: 1 } },
        {
            securityBindings: [
                {
                    tenant: "different",
                    principalId: "different",
                    authVersion: 1,
                },
            ],
        },
    ]) {
        const f = fixture();
        Object.assign(f.previous, change);
        await assert.rejects(f.owner.switchEnterpriseContext(f.request), {
            code: "ERR_PROFILE_MEMBERSHIP_IDENTITY",
        });
        assert.equal(f.issued.length, 0);
    }
});
test("post-issuance audit failure revokes the newly created refresh credential", async () => {
    const f = fixture();
    f.owner.recordAuthEvent = async () => {
        throw new Error("private audit failure");
    };
    await assert.rejects(f.owner.switchEnterpriseContext(f.request));
    assert.deepEqual(f.removed, ["next-private-refresh"]);
});
test("target preparation requires the exact accepted revision and immutable canonical owner", async () => {
    const f = fixture();
    const identity = {
        tenantCode: "original",
        recordKind: "EMPLOYEE",
        recordId: "identity",
    };
    const item = {
        code: "membership",
        revision: 3,
        enterpriseCode: "second",
        tenantCode: "secondTenant",
        status: "REGISTERED",
        membership: { phase: "COMPLETE", identity, projectionId: "projection" },
    };
    const owner = {
        ...membership,
        policy: () => ({ browserContextSwitchQualified: true }),
        base: () => ({
            input: (value, keys) => {
                assert.deepEqual(Object.keys(value).sort(), [...keys].sort());
                return value;
            },
        }),
        digest: (value) => JSON.stringify(value),
        actor: async () => ({ identity }),
        credential: async () => ({}),
        assignment: async () => ({
            item,
            enterprise: {
                active: true,
                tenant: { code: "secondTenant", active: true },
            },
        }),
        read: async () => ({ active: true }),
        sessionContext: async () => ({
            anchor: { identity },
            person: { active: true },
        }),
    };
    assert.equal(
        (await owner.prepareContextSwitch(f.request)).item.code,
        "membership",
    );
    await assert.rejects(
        owner.prepareContextSwitch({
            ...f.request,
            body: { assignmentCode: "membership", revision: 2 },
        }),
        { code: "ERR_PROFILE_MEMBERSHIP_CONFLICT" },
    );
    item.membership.identity = { ...identity, recordId: "another" };
    await assert.rejects(owner.prepareContextSwitch(f.request), {
        code: "ERR_PROFILE_MEMBERSHIP_CONFLICT",
    });
    await assert.rejects(
        owner.prepareContextSwitch({
            ...f.request,
            authData: { ...f.request.authData, principalType: "customer" },
        }),
        { code: "ERR_PROFILE_MEMBERSHIP_FORBIDDEN" },
    );
});
test("switch qualification defaults off, including later-layer presentation-only overrides", async () => {
    fixture();
    assert.equal(
        properties.enterpriseManagement.memberships
            .browserContextSwitchQualified,
        false,
    );
    const policy = {
        ...properties.enterpriseManagement.memberships,
        enabled: true,
        inventoryQualified: true,
        sessionBindingQualified: true,
        assignmentClaimIndexQualified: true,
    };
    CONFIG.get = () => ({ memberships: policy });
    await assert.rejects(
        {
            ...membership,
            project: () => ({ custom: true }),
        }.prepareContextSwitch({}),
        { code: "ERR_PROFILE_MEMBERSHIP_UNAVAILABLE" },
    );
    assert.equal(routes.switchEmployeeBrowser.secured, true);
    assert.deepEqual(routes.switchEmployeeBrowser.authTokenTypes, ["access"]);
    assert.equal(routes.switchEmployeeBrowser.apiExposure, "profileMembership");
    const schema =
        routes.switchEmployeeBrowser.requestBody.content["application/json"]
            .schema;
    assert.deepEqual(Object.keys(schema.properties).sort(), [
        "assignmentCode",
        "revision",
    ]);
    assert.equal(schema.additionalProperties, false);
});
test("assignment selectors cannot become generated queries", async () => {
    fixture();
    let reads = 0;
    const owner = {
        ...membership,
        read: async () => {
            reads++;
        },
    };
    await assert.rejects(owner.assignment({ $ne: null }), {
        code: "ERR_PROFILE_MEMBERSHIP_ASSIGNMENT",
    });
    assert.equal(reads, 0);
});
test("schema source loads with private binding exclusions on both principal types", () => {
    const metadata = require("../../../../nodics.foundation/modules/nTooling/src/service/context/defaultModuleLlmContextUtilsService");
    metadata.bootstrapSchemaGlobals();
    const schemas = metadata.loadLocalSchemas(
        require("node:path").resolve(__dirname, ".."),
    );
    assert.equal(schemas.error, null);
    for (const kind of ["employee", "customer"]) {
        assert(
            schemas.schemas.profile[kind].backoffice.excludedFields.includes(
                "authenticationIdentity",
            ),
        );
    }
});
test("personal workspace admission does not require enterprise assignment permission", () => {
    fixture();
    const config = {
        ...properties.enterpriseManagement,
        memberships: {
            ...properties.enterpriseManagement.memberships,
            enabled: true,
            inventoryQualified: true,
            sessionBindingQualified: true,
            assignmentClaimIndexQualified: true,
        },
    };
    CONFIG.get = (key) =>
        key === "apiExposure"
            ? { categories: { profileMembership: { enabled: true } } }
            : key === "enterpriseManagement" ? config : undefined;
    SERVICE.DefaultEnterpriseManagementService = require("../src/service/enterprise/defaultEnterpriseManagementService");
    const value = {
        ...capability,
        getEnterpriseManagementConfig: () => config,
    }.getCapability();
    assert.deepEqual(value.requiredPermissions, ["profile.backoffice.view"]);
    const personal = value.navigation.find(
        (item) => item.id === "my-enterprise-memberships",
    );
    assert.deepEqual(personal.requiredPermissions, ["profile.backoffice.view"]);
    const management = value.navigation.find(
        (item) => item.id === "enterprises",
    );
    assert(
        management.requiredPermissions.includes(
            "profile.enterpriseAccess.assign",
        ),
    );
});
test("browser boundary validates origin and CSRF before issuer and never returns refresh material", async () => {
    fixture();
    const config = {
        enabled: true,
        refreshCookieName: "refresh",
        csrfCookieName: "csrf",
        cookiePath: "/nodics/profile/v0/employee/browser",
        csrfCookiePath: "/",
        sameSite: "Strict",
        secure: true,
        maximumAgeSeconds: 3600,
    };
    CONFIG.get = (key) =>
        key === "profileBrowserSession"
            ? config
            : key === "httpHardening"
              ? { cors: { enabled: true, allowCredentials: true } }
              : undefined;
    let called = 0;
    SERVICE.DefaultHttpHardeningService = {
        resolveCorsOrigins: () => ({
            allowedOrigins: ["https://axis.example.test"],
            deniedOrigins: [],
        }),
    };
    SERVICE.DefaultAuthenticationProviderService = {
        switchEnterpriseContext: async (request) => {
            called++;
            assert.equal(request.refreshToken, "private-refresh");
            return {
                authToken: "access",
                refreshToken: "rotated-private",
                loginId: "person",
                enterpriseCode: "second",
            };
        },
    };
    const headers = {};
    const request = {
        httpRequest: {
            headers: {
                origin: "https://axis.example.test",
                cookie: "refresh=private-refresh;csrf=proof",
                "x-csrf-token": "proof",
            },
        },
        httpResponse: {
            setHeader: (key, value) => {
                headers[key] = value;
            },
        },
    };
    const result = await browser.switchEnterprise(request);
    assert.equal(result.refreshToken, undefined);
    assert.equal(result.enterpriseCode, "second");
    assert(headers["Set-Cookie"][0].includes("HttpOnly"));
    assert(headers["Set-Cookie"][0].includes("Secure"));
    request.httpRequest.headers["x-csrf-token"] = "wrong";
    await assert.rejects(browser.switchEnterprise(request));
    assert.equal(called, 1);
    request.httpRequest.headers.origin = "https://not-approved.example.test";
    await assert.rejects(browser.switchEnterprise(request));
    assert.equal(called, 1);
});
