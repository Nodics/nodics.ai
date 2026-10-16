/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module profile/test/customerCurrentIdentity @description Tests self-only identity projection and the actual Commerce consumer without granting generic Profile schema access. @layer test @owner profile */
"use strict";
const test = require("node:test"),
  assert = require("node:assert/strict");
const service = require("../src/service/customer/defaultCustomerService");
const facade = require("../src/facade/customer/DefaultCustomerFacade");
const controller = require("../src/controller/customer/DefaultCustomerController");
const routes = require("../src/router/routers");
const bidding = require("../../../../nodics.commerce/modules/bidding/src/service/defaultBiddingIdentityService");
let customer, reads, verified, request;
test.beforeEach(() => {
  customer = {
    _id: "id",
    code: "customer-code",
    loginId: "login",
    active: true,
    authVersion: 1,
    password: "never-return",
    userGroups: [],
  };
  reads = [];
  verified = 0;
  request = {
    tenant: "tenant",
    authData: {
      tokenType: "access",
      principalType: "customer",
      tenant: "tenant",
      entCode: "enterprise",
      loginId: "login",
      authVersion: 1,
    },
  };
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(code) {
        super(code);
        this.code = code;
      }
    },
  };
  global.UTILS = {
    getUserGroupCodes: () => [],
    getUserGroupPermissions: () => [],
  };
  global.SERVICE = {
    DefaultLoggerService: { assertSensitiveRequest: () => {} },
    DefaultEnterpriseMembershipService: {
      verifyAuthenticatedActor: async () => {
        verified++;
      },
      groups: async () => [],
    },
    DefaultIdentityGovernanceService: {
      getSystemAuthData: () => ({ isSystem: true }),
    },
    DefaultCustomerService: {
      ...service,
      get: async (r) => {
        reads.push(r);
        return { code: "SUC_READ", count: 1, result: [customer] };
      },
    },
    DefaultBiddingService: {
      fail: (message) => {
        throw Error(message);
      },
    },
  };
  global.FACADE = { DefaultCustomerFacade: facade };
});
test("controller and facade return only the current customer identity from a fresh bounded Profile read", async () => {
  let cache;
  request.httpResponse = {
    setHeader: (key, value) => {
      assert.equal(key, "Cache-Control");
      cache = value;
    },
  };
  const result = await controller.currentIdentity(request);
  assert.deepEqual(result, {
    code: "SUC_PRFL_00000",
    data: {
      contractVersion: 1,
      tenant: "tenant",
      enterpriseCode: "enterprise",
      customer: { code: "customer-code", loginId: "login" },
    },
  });
  assert.equal(cache, "no-store");
  assert.equal(verified, 1);
  assert.equal(reads.length, 1);
  assert.deepEqual(reads[0].query, { loginId: "login" });
  assert.deepEqual(reads[0].searchOptions, { pageSize: 2, pageNumber: 1 });
  assert.equal(reads[0].options.skipItemCache, true);
  assert.equal(reads[0].options.recursive, false);
});
test("router is customer access-only, sensitive and uncached", () => {
  const route = routes.profile.customerIdentity.current;
  assert.equal(route.secured, true);
  assert.deepEqual(route.authTokenTypes, ["access"]);
  assert.deepEqual(route.accessGroups, ["customerUserGroup"]);
  assert.equal(route.requestPrivacy.sensitive, true);
  assert.equal(route.cache.enabled, false);
});
test("service and human actors, tenant mismatches and caller-selected identities refuse before reads", async () => {
  const original = structuredClone(request);
  for (const mutate of [
    (r) => (r.authData.principalType = "human"),
    (r) => (r.authData.principalType = "service"),
    (r) => (r.authData.tokenType = "service"),
    (r) => (r.authData.isSystem = true),
    (r) => (r.tenant = "other"),
    (r) => (r.authData.loginId = ""),
    (r) => (r.authData.entCode = ""),
    ...["query", "body", "payload"].map(
      (key) => (r) => (r[key] = { loginId: "other" }),
    ),
    (r) => (r.httpRequest = { query: { tenant: "other" } }),
    (r) => (r.httpRequest = { body: { code: "other" } }),
    (r) => (r.tenantCode = "other"),
    (r) => (r.enterpriseCode = "other"),
    (r) => (r.authData.enterpriseCode = "other"),
    (r) => (r.httpRequest = { headers: { "x-enterprise-code": "other" } }),
    (r) => (r.body = []),
  ]) {
    const r = structuredClone(original);
    mutate(r);
    await assert.rejects(
      service.currentIdentity.call(SERVICE.DefaultCustomerService, r),
    );
  }
  assert.equal(reads.length, 0);
  assert.equal(verified, 0);
});
test("retargeting during actor verification refuses before target reads", async () => {
  SERVICE.DefaultEnterpriseMembershipService.verifyAuthenticatedActor =
    async () => {
      request.tenant = "other";
    };
  await assert.rejects(SERVICE.DefaultCustomerService.currentIdentity(request));
  assert.equal(reads.length, 0);
});
test("current actor revocation, failed storage, duplicate rows and inactive or mismatched customer fail closed", async () => {
  SERVICE.DefaultEnterpriseMembershipService.verifyAuthenticatedActor =
    async () => {
      throw Error("revoked");
    };
  await assert.rejects(SERVICE.DefaultCustomerService.currentIdentity(request));
  assert.equal(reads.length, 0);
  SERVICE.DefaultEnterpriseMembershipService.verifyAuthenticatedActor =
    async () => {};
  const original = { ...customer };
  for (const patch of [
    { active: false },
    { code: "" },
    { loginId: "other" },
    { tenant: "other" },
  ]) {
    customer = { ...original, ...patch };
    await assert.rejects(
      SERVICE.DefaultCustomerService.currentIdentity(request),
    );
  }
  for (const response of [
    { code: "ERR_READ", count: 1, result: [original] },
    { code: "SUC_READ", count: 2, result: [original, original] },
  ]) {
    SERVICE.DefaultCustomerService.get = async () => response;
    await assert.rejects(
      SERVICE.DefaultCustomerService.currentIdentity(request),
    );
  }
});
test("Commerce forwards the original customer proof and validates Profile placement without generic queries", async () => {
  SERVICE.DefaultModuleService = {
    invokeModule: async (r) => {
      assert.equal(r.apiName, "/customer/identity");
      assert.equal(r.methodName, "GET");
      assert.equal(r.header.Authorization, "Bearer artificial");
      assert.equal(r.requestBody, undefined);
      return controller.currentIdentity(request);
    },
  };
  const input = { ...request, authorization: "Bearer artificial" };
  const result = await bidding.resolve(input);
  assert.equal(result.customerCode, "customer-code");
  assert.deepEqual(result.sellerRefs, [
    { module: "profile", schema: "customer", code: "customer-code" },
  ]);
  await assert.rejects(bidding.resolve({ ...request }));
  for (const patch of [
    { contractVersion: 2 },
    { tenant: "other" },
    { enterpriseCode: "other" },
    { customer: { code: "other", loginId: "other" } },
    { customer: { code: {}, loginId: "login" } },
    { customer: { code: " ", loginId: "login" } },
    { customer: { code: "x".repeat(192), loginId: "login" } },
  ]) {
    SERVICE.DefaultModuleService.invokeModule = async () => ({
      data: {
        contractVersion: 1,
        tenant: "tenant",
        enterpriseCode: "enterprise",
        customer: { code: "customer-code", loginId: "login" },
        ...patch,
      },
    });
    await assert.rejects(bidding.resolve(input));
  }
  SERVICE.DefaultModuleService.invokeModule = async () => ({
    code: "ERR_REFUSED",
    data: {
      contractVersion: 1,
      tenant: "tenant",
      enterpriseCode: "enterprise",
      customer: { code: "customer-code", loginId: "login" },
    },
  });
  await assert.rejects(bidding.resolve(input));
});
