/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module nService/test/authorizationContextAdmissionContract @description Deferred isolated authorization-provider fixtures proving stamps cannot bypass live context admission. @layer test @owner nService */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

/** Loads the actual provider with a non-cryptographic JWT double; no token/runtime is issued or qualified. @param {Object} payload Decoded test payload. @returns {Object} Provider and injected owners. */
function fixture(payload) {
    const calls = [],
        sandbox = {
            module: { exports: {} },
            CONFIG: {},
            CLASSES: {
                NodicsError: class extends Error {
                    constructor(code) {
                        super(code);
                        this.code = code;
                    }
                },
            },
            SERVICE: {
                DefaultAuthSecurityService: {
                    getVerifyOptions: () => ({}),
                    getJwtSecret: () => "inert-test-only",
                    getSecurityConfiguration: () => ({
                        jwt: { requireJti: true },
                    }),
                    validateAuthorizationContext: async (input) => {
                        assert.equal(input, payload);
                        calls.push("context");
                        return true;
                    },
                },
                DefaultAuthenticationProviderService: {
                    isTokenRevoked: async () => {
                        calls.push("revocation");
                        return false;
                    },
                },
                DefaultPrincipalSecurityStampService: {
                    validate: async () => {
                        calls.push("stamp");
                        return true;
                    },
                },
            },
            require: (name) => {
                assert.equal(name, "jsonwebtoken");
                return {
                    verify: (_token, _secret, _options, callback) => {
                        calls.push("jwt");
                        callback(null, payload);
                    },
                };
            },
        };
    vm.runInNewContext(
        fs.readFileSync(
            path.join(
                __dirname,
                "../src/service/authorization/defaultAuthorizationProviderService.js",
            ),
            "utf8",
        ),
        sandbox,
    );
    return {
        provider: sandbox.module.exports,
        service: sandbox.SERVICE,
        calls,
    };
}
test("every accepted token passes context admission after revocation and stamps, including contextless tokens", async () => {
    for (const sessionContext of [
        undefined,
        { owner: "profile", code: "assignment", version: 7 },
    ]) {
        const payload = {
                jti: "fixture",
                ...(sessionContext ? { sessionContext } : {}),
            },
            f = fixture(payload);
        const result = await f.provider.authorizeToken({
            authToken: "inert-fixture",
        });
        assert.equal(result.result, payload);
        assert.deepEqual(f.calls, ["jwt", "revocation", "stamp", "context"]);
    }
});
test("successful stamps never admit false, failed or unavailable context validators", async () => {
    const payload = {
        jti: "fixture",
        sessionContext: { owner: "profile", code: "assignment", version: 7 },
    };
    for (const validate of [
        undefined,
        async () => false,
        async () => undefined,
        async () => {
            throw Object.assign(new Error("private-owner-query"), {
                errInfo: "private",
            });
        },
    ]) {
        const f = fixture(payload);
        f.service.DefaultAuthSecurityService.validateAuthorizationContext =
            validate;
        await assert.rejects(
            f.provider.authorizeToken({ authToken: "inert-fixture" }),
            (error) => {
                assert.equal(error.code, "ERR_AUTH_00001");
                assert.equal(error.errInfo, undefined);
                assert.equal(error.cause, undefined);
                assert.equal(error.message, "ERR_AUTH_00001");
                return true;
            },
        );
        assert.ok(f.calls.includes("stamp"));
    }
});
test("stamp or revocation rejection cannot be repaired by a valid context proof", async () => {
    const f = fixture({ jti: "fixture" });
    f.service.DefaultPrincipalSecurityStampService.validate = async () => {
        throw new Error("stale stamp");
    };
    await assert.rejects(
        f.provider.authorizeToken({ authToken: "inert-fixture" }),
    );
    assert.equal(f.calls.includes("context"), false);
    f.service.DefaultAuthenticationProviderService.isTokenRevoked = async () =>
        true;
    await assert.rejects(
        f.provider.authorizeToken({ authToken: "inert-fixture" }),
    );
    assert.equal(f.calls.includes("context"), false);
});
