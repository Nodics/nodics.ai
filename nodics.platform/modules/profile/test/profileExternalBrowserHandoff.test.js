/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module profile/test/profileExternalBrowserHandoff @description Proves one-use browser handoff isolation, expiry, current proof/link/account revalidation and Profile cookie ownership. @owner profile @layer test */
const { test, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const handoff = require("../src/service/identity/defaultExternalBrowserHandoffService");
const identity = require("../src/service/identity/defaultExternalIdentityService");
const browser = require("../src/service/authentication/defaultBrowserSessionService");
const controller = require("../src/controller/authentication/defaultCustomerBrowserSessionController");
const routes = require("../src/router/routers");
let config, cache, records, customer, locked, issued, subject;
class OwnerError extends Error {
  constructor(code, message) {
    super(message || code);
    this.code = code;
  }
}
const origin = "http://localhost:5176";
const req = (extra = {}) => ({
  entCode: "enterprise-a",
  tenant: "tenant-a",
  browserSessionPrincipalType: "Customer",
  authData: {
    principalType: "service",
    entCode: "enterprise-a",
    tenant: "tenant-a",
  },
  applicationCode: "application-a",
  proof: "valid-proof",
  httpRequest: { headers: { origin }, body: {} },
  ...extra,
});
async function link() {
  await identity.link(
    req({
      authData: {
        principalType: "customer",
        entCode: "enterprise-a",
        tenant: "tenant-a",
        loginId: "customer-a",
        authVersion: 1,
        tokenType: "access",
      },
    }),
  );
}
beforeEach(() => {
  cache = new Map();
  records = new Map();
  locked = false;
  issued = 0;
  subject = "subject-a";
  customer = {
    code: "customer-a",
    loginId: "customer-a",
    active: true,
    principalType: "customer",
    password: { active: true },
    authVersion: 1,
  };
  config = {
    profileExternalIdentity: {
      enabled: true,
      maximumAssertionAgeSeconds: 300,
      maximumAssertionCharacters: 16384,
      clockSkewSeconds: 30,
      browserHandoffLifetimeSeconds: 60,
      providers: { TEST: { service: "TestProofProvider" } },
      applications: {
        "application-a": {
          enabled: true,
          provider: "TEST",
          enterpriseCode: "enterprise-a",
        },
      },
    },
    profileCustomerBrowserSession: {
      enabled: true,
      refreshCookieName: "customer_refresh",
      csrfCookieName: "customer_csrf",
      cookiePath: "/nodics/profile/v0/customer/browser",
      csrfCookiePath: "/",
      sameSite: "Lax",
      secure: false,
      maximumAgeSeconds: 3600,
    },
    httpHardening: {
      cors: {
        enabled: true,
        allowCredentials: true,
        allowedOrigins: [origin, "http://localhost:3600"],
      },
    },
  };
  global.CONFIG = { get: (key) => config[key] };
  global.CLASSES = { NodicsError: OwnerError };
  global.SERVICE = {
    DefaultExternalIdentityService: identity,
    DefaultExternalBrowserHandoffService: handoff,
    DefaultBrowserSessionService: browser,
    TestProofProvider: {
      verify: async ({ proof }) => {
        if (proof !== "valid-proof")
          throw new OwnerError("ERR_PROFILE_EXTERNAL_ASSERTION");
        return { subject, applicationSubject: "bot-a" };
      },
    },
    DefaultEnterpriseService: {
      retrieveEnterprise: async (code) => ({
        code,
        active: true,
        tenant: { code: "tenant-a", active: true },
      }),
    },
    DefaultIdentityGovernanceService: {
      getSystemAuthData: () => ({ principalType: "service" }),
    },
    DefaultCustomerService: { findByLoginId: async () => ({ ...customer }) },
    DefaultUserStateService: { findUserState: async () => ({ locked }) },
    DefaultExternalIdentityLinkService: {
      get: async (r) => ({
        result: records.has(r.query.code)
          ? [{ ...records.get(r.query.code) }]
          : [],
      }),
      save: async (r) => {
        records.set(r.model.code, { ...r.model });
        return { result: { ...r.model } };
      },
    },
    DefaultAuthenticationProviderService: {
      addToken: async (module, expirable, key, value, ttl) => {
        assert.equal(module, "profile");
        assert.equal(expirable, true);
        cache.set(key, { ...value });
        assert.equal(
          ttl,
          config.profileExternalIdentity.browserHandoffLifetimeSeconds,
        );
      },
      consumeToken: async (module, key) => {
        const value = cache.get(key);
        if (!value) throw new OwnerError("ERR_CACHE_00001");
        cache.delete(key);
        return value;
      },
      issueSession: async () => {
        issued++;
        return { authToken: "access", refreshToken: "refresh" };
      },
      recordAuthEvent: async () => {},
      removeToken: async () => {},
    },
  };
});
test("unlinked identity selects shared account form without caching or issuing credentials", async () => {
  assert.deepEqual(await handoff.prepare(req()), {
    requiresProfileSession: true,
  });
  assert.equal(cache.size, 0);
  assert.equal(issued, 0);
});
test("linked identity completes once on Profile browser path with HttpOnly refresh and access-only response", async () => {
  await link();
  const prepared = await handoff.prepare(req());
  assert.equal(issued, 0);
  assert.equal(prepared.requiresProfileSession, false);
  const value = [...cache.values()][0];
  assert.equal(value.proof, undefined);
  assert.equal(value.refreshToken, undefined);
  const headers = {};
  const request = req({
    authData: undefined,
    httpResponse: { setHeader: (key, value) => (headers[key] = value) },
    httpRequest: {
      headers: { origin },
      body: {
        handoffToken: prepared.handoffToken,
        proof: "valid-proof",
        applicationCode: "caller-cannot-select-app",
      },
    },
  });
  const response = await controller.completeExternalSession(request);
  assert.deepEqual(response.result, {
    authToken: "access",
    loginId: "customer-a",
  });
  assert.match(
    headers["Set-Cookie"][0],
    /Path=\/nodics\/profile\/v0\/customer\/browser/,
  );
  assert.match(headers["Set-Cookie"][0], /HttpOnly/);
  assert.equal(headers["Cache-Control"], "no-store");
  await assert.rejects(controller.completeExternalSession(request), {
    code: "ERR_PROFILE_EXTERNAL_ASSERTION",
  });
  assert.equal(issued, 1);
});
test("service principal and exact enterprise/tenant scope are required to prepare", async () => {
  for (const authData of [
    { principalType: "customer" },
    { principalType: "service", entCode: "enterprise-a", tenant: "tenant-b" },
    { principalType: "service", entCode: "enterprise-b", tenant: "tenant-a" },
  ])
    await assert.rejects(handoff.prepare(req({ authData })), {
      code: "ERR_PROFILE_EXTERNAL_ASSERTION",
    });
  assert.equal(cache.size, 0);
});
test("invalid proof and disallowed origin fail before handoff creation", async () => {
  await assert.rejects(handoff.prepare(req({ proof: "forged" })), {
    code: "ERR_PROFILE_EXTERNAL_ASSERTION",
  });
  await assert.rejects(
    handoff.prepare(
      req({
        httpRequest: { headers: { origin: "https://untrusted.example" } },
      }),
    ),
    { code: "ERR_AUTH_00001" },
  );
  assert.equal(cache.size, 0);
});
test("expiry, enterprise and allowed-but-different origin cannot redeem a handoff", async () => {
  await link();
  for (const variation of ["expired", "enterprise", "origin"]) {
    const prepared = await handoff.prepare(req());
    const request = req({ handoffToken: prepared.handoffToken });
    if (variation === "expired")
      [...cache.values()][0].expiresAt = Date.now() - 1;
    if (variation === "enterprise") request.entCode = "enterprise-b";
    if (variation === "origin")
      request.httpRequest.headers.origin = "http://localhost:3600";
    await assert.rejects(handoff.complete(request), {
      code: "ERR_PROFILE_EXTERNAL_ASSERTION",
    });
  }
  assert.equal(issued, 0);
});
test("changed proof subject, link revision and account lock are rechecked at completion", async () => {
  await link();
  for (const variation of [
    "subject",
    "revision",
    "locked",
    "disabled",
    "stamp",
    "revoked",
  ]) {
    const prepared = await handoff.prepare(req()),
      record = [...records.values()][0];
    if (variation === "subject") subject = "subject-b";
    if (variation === "revision") record.revision++;
    if (variation === "locked") locked = true;
    if (variation === "disabled") customer.active = false;
    if (variation === "stamp") customer.authVersion++;
    if (variation === "revoked") record.status = "REVOKED";
    await assert.rejects(
      handoff.complete(req({ handoffToken: prepared.handoffToken })),
      { code: "ERR_PROFILE_EXTERNAL_ASSERTION" },
    );
    subject = "subject-a";
    locked = false;
    customer.active = true;
    customer.authVersion = 1;
    record.status = "ACTIVE";
  }
  assert.equal(issued, 0);
});
test("concurrent completion consumes the same handoff only once", async () => {
  await link();
  const prepared = await handoff.prepare(req());
  const results = await Promise.allSettled([
    handoff.complete(req({ handoffToken: prepared.handoffToken })),
    handoff.complete(req({ handoffToken: prepared.handoffToken })),
  ]);
  assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
  assert.equal(issued, 1);
});
test("application may require orchestration while other applications retain generic direct exchange", async () => {
  await link();
  config.profileExternalIdentity.applications[
    "application-a"
  ].requireBrowserHandoff = true;
  const request = req({
    httpRequest: {
      headers: { origin },
      body: { applicationCode: "application-a", proof: "valid-proof" },
    },
  });
  await assert.rejects(controller.externalSession(request), {
    code: "ERR_PROFILE_EXTERNAL_ASSERTION",
  });
  assert.equal(issued, 0);
  const prepared = await handoff.prepare(req());
  await handoff.complete(req({ handoffToken: prepared.handoffToken }));
  assert.equal(issued, 1);
});
test("later-layer TTL override is honored within the security bound", async () => {
  await link();
  config.profileExternalIdentity.browserHandoffLifetimeSeconds = 30;
  await handoff.prepare(req());
  assert.ok([...cache.values()][0].expiresAt <= Date.now() + 30000);
  config.profileExternalIdentity.browserHandoffLifetimeSeconds = 301;
  await assert.rejects(handoff.prepare(req()), {
    code: "ERR_PROFILE_EXTERNAL_UNAVAILABLE",
  });
});
test("handoff prepare and registration are authenticated service controllers, completion remains Profile browser endpoint", () => {
  const all = Object.values(routes)
    .flatMap((group) => Object.values(group))
    .flatMap((group) => Object.values(group));
  const prepare = all.find(
    (r) => r.key === "/internal/external-identity/browser-handoff",
  );
  assert.equal(prepare.secured, true);
  assert.equal(prepare.handler, undefined);
  assert.deepEqual(prepare.authTokenTypes, ["service"]);
  assert.equal(prepare.permission, "profile.externalIdentity.prepare");
  const registration = all.find((r) => r.key === "/customer/registrations");
  assert.equal(registration.permission, "profile.customer.register");
  assert.equal(registration.handler, undefined);
});
test("a binding change between handoff validation and final identity read cannot issue another principal session", async () => {
  await link();
  const prepared = await handoff.prepare(req());
  const originalRead = identity.read;
  let reads = 0;
  identity.read = async function (context) {
    const result = await originalRead.call(this, context);
    if (++reads === 1) [...records.values()][0].revision++;
    return result;
  };
  try {
    await assert.rejects(
      handoff.complete(req({ handoffToken: prepared.handoffToken })),
      { code: "ERR_PROFILE_EXTERNAL_ASSERTION" },
    );
    assert.equal(issued, 0);
  } finally {
    identity.read = originalRead;
  }
});
test("handoff credentials match the existing framework logger redaction contract", () => {
  const logger = require("../../../../nodics.foundation/modules/nConfig/src/service/DefaultLoggerService");
  assert.equal(
    logger.isSensitiveLogKey("handoffToken", logger.getRedactionConfig()),
    true,
  );
});
