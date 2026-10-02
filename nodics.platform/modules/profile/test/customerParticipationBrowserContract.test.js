/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
/** @module profile/test/customerParticipationBrowserContract @description Injected cookie-boundary fixture, not real issuance or cross-application browser acceptance. @layer test @owner profile */
const test = require("node:test");
const assert = require("node:assert/strict");
const source = require("../src/service/authentication/defaultBrowserSessionService");
test("explicit customer switch exposes no refresh and clears the consumed Employee cookie namespace", async () => {
  global.CLASSES = { NodicsError: class extends Error {} };
  global.CONFIG = {
    get: (key) =>
      key === "httpHardening"
        ? { cors: { enabled: true, allowCredentials: true } }
        : "profile",
  };
  global.SERVICE = {
    DefaultHttpHardeningService: {
      resolveCorsOrigins: () => ({
        allowedOrigins: ["https://browser.example"],
        deniedOrigins: [],
      }),
    },
    DefaultAuthenticationProviderService: {
      switchCustomerParticipationContext: async (request) => {
        assert.equal(request.refreshToken, "employee-proof");
        return {
          authToken: "access",
          refreshToken: "private-refresh",
          loginId: "person",
          enterpriseCode: "business",
        };
      },
    },
  };
  const owner = {
    ...source,
    config: (request) => {
      const prefix =
        request.browserSessionPrincipalType === "Customer"
          ? "customer"
          : "employee";
      return {
        refreshCookieName: prefix + "_refresh",
        csrfCookieName: prefix + "_csrf",
        cookiePath: "/",
        csrfCookiePath: "/",
        sameSite: "Strict",
        maximumAgeSeconds: 1000,
        secure: true,
      };
    },
  };
  const headers = new Map();
  const request = {
    body: { revision: 2 },
    httpRequest: {
      headers: {
        origin: "https://browser.example",
        cookie: "employee_refresh=employee-proof; employee_csrf=csrf",
        "x-csrf-token": "csrf",
      },
    },
    httpResponse: {
      setHeader: (key, value) => headers.set(key, value),
      getHeader: (key) => headers.get(key),
    },
  };
  const result = await owner.switchParticipation(request);
  assert.equal(result.refreshToken, undefined);
  const cookies = headers.get("Set-Cookie");
  assert.equal(cookies.length, 4);
  assert(
    cookies.some(
      (value) =>
        value.startsWith("employee_refresh=;") && value.includes("Max-Age=0"),
    ),
  );
  assert(
    cookies.some(
      (value) =>
        value.startsWith("customer_refresh=private-refresh;") &&
        value.includes("HttpOnly") &&
        value.includes("Secure"),
    ),
  );
});
