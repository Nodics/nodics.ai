/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module nAuth/test/sessionContextValidationContract @description Deferred owner-injected fixtures for qualified live session admission; no runtime/remote acceptance is claimed. @layer test @owner nAuth */
const test = require("node:test");
const assert = require("node:assert/strict");
const security = require("../src/service/security/defaultAuthSecurityService");

/** Installs isolated policy/owner doubles without registries or transport. @param {Object} t Test context. @returns {Object} Payload and selected service. */
function fixture(t) {
    const previous = {
        CONFIG: global.CONFIG,
        SERVICE: global.SERVICE,
        CLASSES: global.CLASSES,
    };
    t.after(() => Object.assign(global, previous));
    global.CLASSES = {
        NodicsError: class extends Error {
            constructor(code) {
                super(code);
                this.code = code;
            }
        },
    };
    const payload = {
        tokenType: "access",
        principalType: "human",
        tenant: "authority",
        securityBindings: [
            {
                tenant: "authority",
                principalId: "membership:assignment",
                authVersion: 7,
            },
        ],
        sessionContext: { owner: "profile", code: "assignment", version: 7 },
    };
    const policy = {
        qualified: true,
        validatorService: "SelectedContextOwner",
    };
    global.CONFIG = { get: () => ({ sessionContextValidation: policy }) };
    global.SERVICE = {
        SelectedContextOwner: {
            validate: async (input) => ({
                valid: true,
                ...input.sessionContext,
            }),
        },
    };
    return { payload, policy, service: { ...security } };
}
test("contextless tokens require no context selector, owner or remote call", async (t) => {
    const { service } = fixture(t);
    global.CONFIG.get = () => {
        assert.fail("contextless claims do not select an owner");
    };
    global.SERVICE = {};
    assert.equal(
        await service.validateAuthorizationContext({ tokenType: "service" }),
        true,
    );
});
test("qualified required-person policy rejects legacy customer contexts rather than silently upgrading them",async t=>{
  const {service,policy}=fixture(t);policy.requiredPrincipalTypes=["customer"];
  await assert.rejects(service.validateAuthorizationContext({tokenType:"access",principalType:"customer"}),{code:"ERR_AUTH_00001"});
  assert.equal(await service.validateAuthorizationContext({tokenType:"access",principalType:"human"}),true);
  policy.requiredPrincipalTypes=["service"];
  await assert.rejects(service.validateAuthorizationContext({tokenType:"access",principalType:"customer"}),{code:"ERR_AUTH_00001"});
});
test("qualified local fixed-method validation requires an exact matching public owner proof", async (t) => {
    const { service, payload } = fixture(t);
    let observed;
    global.SERVICE.SelectedContextOwner.validate = async (input) => {
        observed = input;
        return {
            valid: true,
            owner: "profile",
            code: "assignment",
            version: 7,
        };
    };
    assert.equal(await service.validateAuthorizationContext(payload), true);
    assert.notEqual(observed, payload);
    assert.deepEqual(observed, payload);
    assert.equal(Object.isFrozen(observed), true);
    assert.equal(Object.isFrozen(observed.sessionContext), true);
    assert.equal(Object.isFrozen(observed.securityBindings[0]), true);
    assert.equal(
        await service.validateAuthorizationContext({
            ...payload,
            principalType: "customer",
        }),
        true,
    );
});
test("wrong owner/code/version, false and malformed or secret-bearing proofs reject", async (t) => {
    const { service, payload } = fixture(t),
        exact = { valid: true, ...payload.sessionContext };
    for (const proof of [
        false,
        true,
        null,
        {},
        { ...exact, valid: false },
        { ...exact, owner: "unknown" },
        { ...exact, code: "different" },
        { ...exact, version: "7" },
        { ...exact, version: 8 },
        { ...exact, errInfo: "private" },
        { result: exact },
        [exact],
    ]) {
        global.SERVICE.SelectedContextOwner.validate = async () => proof;
        await assert.rejects(service.validateAuthorizationContext(payload), {
            code: "ERR_AUTH_00001",
        });
    }
    global.SERVICE.SelectedContextOwner.validate = async () => exact;
    await assert.rejects(
        service.validateAuthorizationContext({
            ...payload,
            sessionContext: { ...payload.sessionContext, owner: "unknown" },
        }),
        { code: "ERR_AUTH_00001" },
    );
});
test("malformed signed contexts and non-person credentials cannot reach the selected owner", async (t) => {
    const { service, payload } = fixture(t);
    global.SERVICE.SelectedContextOwner.validate = async () => {
        assert.fail("malformed context cannot reach owner");
    };
    for (const context of [
        null,
        false,
        [],
        {},
        { ...payload.sessionContext, version: 0 },
        { ...payload.sessionContext, code: "a/b" },
        { ...payload.sessionContext, owner: "../profile" },
        { ...payload.sessionContext, extra: "private" },
    ])
        await assert.rejects(
            service.validateAuthorizationContext({
                ...payload,
                sessionContext: context,
            }),
            { code: "ERR_AUTH_00001" },
        );
    for (const token of [
        { ...payload, tokenType: "service" },
        { ...payload, principalType: "service" },
        { ...payload, securityBindings: undefined },
    ])
        await assert.rejects(service.validateAuthorizationContext(token), {
            code: "ERR_AUTH_00001",
        });
});
test("unqualified, missing and unsupported remote owners reject with no stamp or transport fallback", async (t) => {
    const { service, payload, policy } = fixture(t);
    policy.qualified = false;
    await assert.rejects(service.validateAuthorizationContext(payload), {
        code: "ERR_AUTH_00001",
    });
    policy.qualified = true;
    for (const name of [
        null,
        "SelectedContextOwner.validate",
        "UnknownRemoteOwner",
    ]) {
        policy.validatorService = name;
        await assert.rejects(service.validateAuthorizationContext(payload), {
            code: "ERR_AUTH_00001",
        });
    }
    policy.validatorService = "SelectedContextOwner";
    global.SERVICE.SelectedContextOwner = {
        inspect: async () => ({ valid: true, ...payload.sessionContext }),
    };
    await assert.rejects(service.validateAuthorizationContext(payload), {
        code: "ERR_AUTH_00001",
    });
    global.SERVICE = {
        DefaultModuleService: {
            invokeModule: async () => {
                assert.fail("no guessed remote bridge");
            },
        },
    };
    await assert.rejects(service.validateAuthorizationContext(payload), {
        code: "ERR_AUTH_00001",
    });
});
test("owner outages and private errors produce only the stable public authentication refusal", async (t) => {
    const { service, payload } = fixture(t);
    const privateError = Object.assign(new Error("private-owner-record"), {
        errInfo: { secret: "private" },
    });
    for (const validate of [
        () => {
            throw privateError;
        },
        async () => {
            throw privateError;
        },
    ]) {
        global.SERVICE.SelectedContextOwner.validate = validate;
        await assert.rejects(
            service.validateAuthorizationContext(payload),
            (error) => {
                assert.notEqual(error, privateError);
                assert.equal(error.code, "ERR_AUTH_00001");
                assert.equal(error.errInfo, undefined);
                assert.equal(error.cause, undefined);
                assert.equal(error.message, "ERR_AUTH_00001");
                return true;
            },
        );
    }
});
test("a validator cannot change signed coordinates and validate its replacement", async (t) => {
    const { service, payload } = fixture(t),
        original = { ...payload.sessionContext };
    global.SERVICE.SelectedContextOwner.validate = async (input) => {
        input.sessionContext.code = "replacement";
        return { valid: true, ...original };
    };
    await assert.rejects(service.validateAuthorizationContext(payload), {
        code: "ERR_AUTH_00001",
    });
    assert.deepEqual(payload.sessionContext, original);
});
test("validator attempts to replace permissions/tenant/context cannot change accepted JWT claims", async (t) => {
    const { service, payload } = fixture(t);
    payload.permissions = ["read-only"];
    payload.groups = [{ code: "operator", permissions: ["read-only"] }];
    const original = JSON.parse(JSON.stringify(payload));
    for (const mutate of [
        (input) => {
            input.permissions = ["super-admin"];
        },
        (input) => {
            input.groups[0].permissions.push("super-admin");
        },
        (input) => {
            input.tenant = "other";
        },
        (input) => {
            input.sessionContext = {
                owner: "profile",
                code: "other",
                version: 9,
            };
        },
    ]) {
        global.SERVICE.SelectedContextOwner.validate = async (input) => {
            mutate(input);
            return { valid: true, ...input.sessionContext };
        };
        await assert.rejects(service.validateAuthorizationContext(payload), {
            code: "ERR_AUTH_00001",
        });
        assert.deepEqual(payload, original);
    }
    global.SERVICE.SelectedContextOwner.validate = async (input) => ({
        valid: true,
        ...input.sessionContext,
    });
    assert.equal(await service.validateAuthorizationContext(payload), true);
    assert.deepEqual(payload, original);
});
test("non-JSON and excessive claims reject before entering the owner", async (t) => {
    const { service, payload } = fixture(t);
    global.SERVICE.SelectedContextOwner.validate = async () => {
        assert.fail("unbounded claims cannot reach owner");
    };
    for (const extension of [
        { private: "x".repeat(65537) },
        { private: () => true },
        { private: Infinity },
        { private: new Date() },
        { groups: Array(257).fill("operator") },
    ])
        await assert.rejects(
            service.validateAuthorizationContext({ ...payload, ...extension }),
            { code: "ERR_AUTH_00001" },
        );
    const nested = {};
    let cursor = nested;
    for (let i = 0; i < 17; i++) cursor = cursor.child = {};
    await assert.rejects(
        service.validateAuthorizationContext({ ...payload, nested }),
        { code: "ERR_AUTH_00001" },
    );
});
