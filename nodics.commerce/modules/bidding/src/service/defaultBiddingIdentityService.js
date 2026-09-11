/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module bidding/service/defaultBiddingIdentityService.js @description Resolves Commerce customers and Profile-authorized enterprise sellers. Seller representation comes from server-side identity scopes, never bid payloads. @layer service @owner bidding @override Later modules may override exported methods; retain authenticated scope and typed reference checks. */
module.exports = {
  /** Unwraps remote owner responses while preserving their actual values. */
  unwrap: function (response) {
    let value = response;
    for (let n = 0; n < 7 && value && !Array.isArray(value); n++) {
      if (value.data !== undefined) value = value.data;
      else if (value.result !== undefined) value = value.result;
      else break;
    }
    return value;
  },
  /** Resolves the authenticated identity and its current seller business references. */
  resolve: async function (input) {
    const auth = input.authData || {},
      fail = (message) => SERVICE.DefaultBiddingService.fail(message);
    const ownerId = auth.principalId || auth.code || auth.loginId,
      enterpriseCode = auth.enterpriseCode || auth.entCode;
    if (
      !["customer", "human"].includes(auth.principalType) ||
      !auth.loginId ||
      !input.tenant ||
      !enterpriseCode ||
      !ownerId
    )
      fail("Authenticated Commerce participant context is required");
    const request = { ...input, ownerId, enterpriseCode };
    if (auth.principalType === "customer") {
      const response = await SERVICE.DefaultModuleService.invokeModule({
        local: false,
        moduleName: "profile",
        connectionName: "profile",
        targetAuthority: { runtimeRole: "PLATFORM" },
        apiName: "/customer",
        methodName: "POST",
        tenant: request.tenant,
        request: { tenant: request.tenant },
        requestBody: {
          query: { loginId: auth.loginId },
          options: { recursive: false },
          searchOptions: { pageSize: 1 },
        },
        timeoutMs: 10000,
        maxAttempts: 1,
      });
      const result = this.unwrap(response),
        customer = Array.isArray(result) ? result[0] : result;
      if (!customer?.code || customer.loginId !== auth.loginId)
        fail("Customer identity is unavailable");
      request.customerCode = customer.code;
    }
    request.sellerRefs = await this.sellerRefs(request);
    return request;
  },
  /** Produces exact business references for customer sellers or scoped enterprise representatives. */
  sellerRefs: async function (request) {
    if (request.authData.principalType === "customer")
      return [
        { module: "profile", schema: "customer", code: request.customerCode },
      ];
    const router = SERVICE.DefaultSecuredRequestPipelineService,
      fail = (message) => SERVICE.DefaultBiddingService.fail(message);
    if (
      !request.authorization ||
      !router.isPermissionGranted(
        "commerce.bid.manage",
        router.getGrantedPermissions(request),
        {},
      )
    )
      fail("Enterprise seller representation is not permitted");
    const response = await SERVICE.DefaultModuleService.invokeModule({
      local: false,
      moduleName: "profile",
      connectionName: "profile",
      targetAuthority: { runtimeRole: "PLATFORM" },
      apiName: "/identity/scopes/me",
      methodName: "GET",
      tenant: request.tenant,
      request: { tenant: request.tenant },
      header: {
        Authorization: request.authorization,
        "X-Enterprise-Code": request.enterpriseCode,
      },
      timeoutMs: 10000,
      maxAttempts: 1,
    });
    const scopes = this.unwrap(response);
    if (
      scopes?.principalCode !== request.authData.loginId ||
      !Array.isArray(scopes.scopes) ||
      !Array.isArray(scopes.deniedScopes)
    )
      fail("Enterprise seller scope resolution is unavailable");
    const match = (scope) => {
      if (scope.tenantCode && scope.tenantCode !== request.tenant) return false;
      if (
        scope.capabilityCode &&
        !["commerce", "bidding"].includes(scope.capabilityCode)
      )
        return false;
      if (
        scope.permissionCode &&
        !router.isPermissionGranted(
          "commerce.bid.manage",
          [scope.permissionCode],
          {},
        )
      )
        return false;
      return (
        (scope.scopeType === "GLOBAL" && scope.scopeCode === "*") ||
        (scope.scopeType === "TENANT" && scope.scopeCode === request.tenant) ||
        (scope.scopeType === "ENTERPRISE" &&
          scope.scopeCode === request.enterpriseCode)
      );
    };
    return scopes.scopes.some(match) && !scopes.deniedScopes.some(match)
      ? [
          {
            module: "profile",
            schema: "enterprise",
            code: request.enterpriseCode,
          },
        ]
      : [];
  },
};
