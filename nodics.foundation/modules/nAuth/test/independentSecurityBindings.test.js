/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @module nAuth/test/independentSecurityBindings
 * @description Injected owner fixtures for independent stamp enforcement and inert claim projection; not distributed runtime qualification.
 * @layer test
 * @owner nAuth
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const stamps = require("../src/service/identity/defaultPrincipalSecurityStampService");
const security = require("../src/service/security/defaultAuthSecurityService");

/** Creates isolated cache-owner fixtures without authenticating or connecting to a runtime. @returns {Object} Actual implementation and cache map. */
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
        get: (key) =>
            key === "authSecurity"
                ? {
                      securityStamp: {
                          enabled: false,
                          failClosed: false,
                          allowMissingStamp: true,
                      },
                  }
                : undefined,
    };
    const current = new Map(),
        owner = { ...stamps };
    global.SERVICE = {
        DefaultAuthSecurityService: { ...security },
        DefaultPrincipalSecurityStampService: owner,
        DefaultAuthenticationProviderService: {
            findToken: async (_module, key) => current.get(key),
        },
    };
    const bindings = [
        {
            tenant: "original",
            principalId: "identity:CUSTOMER:account-1",
            authVersion: 4,
        },
        {
            tenant: "authority",
            principalId: "membership:invitation-1",
            authVersion: 7,
        },
    ];
    for (const item of bindings)
        current.set(owner.getKey(item.tenant, item.principalId), {
            authVersion: item.authVersion,
        });
    return { owner, current, bindings };
}
test("independent bindings remain strict even when the legacy stamp policy is disabled", async () => {
    const f = fixture();
    await f.owner.validate({ securityBindings: f.bindings });
    f.current.delete(f.owner.getKey("authority", "membership:invitation-1"));
    await assert.rejects(f.owner.validate({ securityBindings: f.bindings }), {
        code: "ERR_AUTH_00001",
    });
});
test("canonical password changes invalidate bound sessions without changing membership revision", async () => {
    const f = fixture();
    f.current.set(f.owner.getKey("original", "identity:CUSTOMER:account-1"), {
        authVersion: 5,
    });
    await assert.rejects(f.owner.validateBindings(f.bindings), {
        code: "ERR_AUTH_00001",
    });
});
test("typed person context does not depend on the colliding legacy tenant/login stamp", async () => {
    const f = fixture();
    CONFIG.get = () => ({ securityStamp: { enabled: true, failClosed: true } });
    const payload = {
        tokenType: "access",
        principalType: "human",
        tenant: "original",
        loginId: "same-login",
        authVersion: 1,
        securityBindings: f.bindings,
        sessionContext: { owner: "profile", code: "assignment-1", version: 7 },
    };
    f.current.set(f.owner.getKey("original", "same-login"), {
        authVersion: 99,
    });
    assert.equal(await f.owner.validate(payload), true);
    await assert.rejects(
        f.owner.validate({ ...payload, tokenType: "service" }),
    );
    await assert.rejects(
        f.owner.validate({
            ...payload,
            sessionContext: { ...payload.sessionContext, secret: "x" },
        }),
    );
});
test("qualified policy epochs reject stale access proofs even under permissive legacy policy", async () => {
    const f = fixture();
    CONFIG.get = () => ({
        authorizationPolicy: { enabled: true, qualified: true, version: 3 },
        securityStamp: { enabled: false, allowMissingStamp: true },
    });
    assert.equal(
        await f.owner.validate({ authorizationPolicyVersion: 3 }),
        true,
    );
    for (const version of [undefined, 2, "3"])
        await assert.rejects(
            f.owner.validate({ authorizationPolicyVersion: version }),
            { code: "ERR_AUTH_00001" },
        );
    assert.equal(
        security.buildPayload({ principalType: "customer" })
            .authorizationPolicyVersion,
        3,
    );
    CONFIG.get = () => ({
        authorizationPolicy: { enabled: true, qualified: false, version: 3 },
    });
    assert.throws(() => security.getAuthorizationPolicyVersion(), {
        code: "ERR_AUTH_00001",
    });
});
test("one membership revision does not change another enterprise binding", async () => {
    const f = fixture(),
        other = [
            ...f.bindings.slice(0, 1),
            {
                tenant: "authority",
                principalId: "membership:invitation-2",
                authVersion: 9,
            },
        ];
    f.current.set(f.owner.getKey("authority", "membership:invitation-2"), {
        authVersion: 9,
    });
    f.current.set(f.owner.getKey("authority", "membership:invitation-1"), {
        authVersion: 8,
    });
    await assert.rejects(f.owner.validateBindings(f.bindings));
    assert.equal(await f.owner.validateBindings(other), true);
});
test("malformed, duplicate, secret-bearing and unbounded binding claims reject", () => {
    const f = fixture();
    for (const bindings of [
        [],
        Array(9).fill(f.bindings[0]),
        [f.bindings[0], f.bindings[0]],
        [{ ...f.bindings[0], password: "not-allowed" }],
        [{ ...f.bindings[0], authVersion: "4" }],
    ]) {
        assert.throws(() => f.owner.normalizeBindings(bindings), {
            code: "ERR_AUTH_00001",
        });
    }
});
test("JWT projection retains only bounded context coordinates and verified method", () => {
    const f = fixture(),
        sessionContext = { owner: "profile", code: "assignment-1", version: 7 };
    const payload = security.buildPayload({
        principalType: "human",
        securityBindings: f.bindings,
        sessionContext,
        authenticationMethod: "PASSWORD",
        password: "never-project",
    });
    assert.deepEqual(payload.sessionContext, sessionContext);
    assert.deepEqual(payload.securityBindings, f.bindings);
    assert.equal(payload.authenticationMethod, "PASSWORD");
    assert.equal(payload.password, undefined);
    assert.throws(() =>
        security.buildPayload({ principalType: "human", sessionContext }),
    );
    assert.throws(() =>
        security.buildPayload({
            principalType: "service",
            securityBindings: f.bindings,
        }),
    );
});
test("a later-layer stamp override can tighten validation without replacing the payload owner", () => {
    const f = fixture();
    let invoked = false;
    SERVICE.DefaultPrincipalSecurityStampService = {
        ...f.owner,
        normalizeBindings: (value) => {
            invoked = true;
            return f.owner.normalizeBindings(value);
        },
    };
    security.buildPayload({
        principalType: "customer",
        securityBindings: f.bindings,
    });
    assert.equal(invoked, true);
});
