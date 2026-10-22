/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
const { isDeepStrictEqual } = require("node:util");

/** @module profile/service/customer/defaultProfileParticipantDirectoryService @description Bounded existing-recipient search and exact revalidation, without exposing contacts or account data. @layer service @owner profile @override Preserve tenant isolation and fresh actor checks. */
module.exports = {
  /** Refuses without disclosing hidden identity data. */
  fail: function () {
    throw new CLASSES.NodicsError("ERR_AUTH_00003");
  },
  /** Validates framework-owned search bounds. */
  policy: function () {
    const p = CONFIG.get("profileParticipantDirectory");
    if (p?.enabled !== true || !Number.isSafeInteger(p.minimumSearchLength) || p.minimumSearchLength < 1 ||
      !Number.isSafeInteger(p.maximumSearchLength) || p.maximumSearchLength < p.minimumSearchLength || p.maximumSearchLength > 500 ||
      !Number.isSafeInteger(p.maximumResults) || p.maximumResults < 1 || p.maximumResults > 100) this.fail("POLICY");
    return p;
  },
  /** Requires current original Customer/Employee authority before private owner reads. */
  context: async function (request) {
    SERVICE.DefaultLoggerService.assertSensitiveRequest(request);
    const auth = structuredClone(request.authData || {}), tenant = request.tenant;
    const input = request.body ?? request.payload ?? request.httpRequest?.body;
    if (!input || Object.getPrototypeOf(input) !== Object.prototype) this.fail("REQUEST");
    const headerSelectors = () => [request.headers, request.header, request.httpRequest?.headers, request.httpRequest?.header]
      .map((headers) => headers && typeof headers === "object" && !Array.isArray(headers)
        ? Object.fromEntries(Object.entries(headers).filter(([key]) =>
          ["x-tenant-code", "x-enterprise-code"].includes(key.toLowerCase())))
        : null);
    const pin = {
      input: structuredClone(input),
      policy: structuredClone(this.policy()),
      authorization: request.authorization,
      headerSelectors: structuredClone(headerSelectors()),
    };
    const bound = () => {
      if (!isDeepStrictEqual(request.authData, auth) || request.tenant !== tenant || !tenant || auth.tenant !== tenant ||
        auth.tokenType !== "access" || auth.isSystem || !["customer", "human"].includes(auth.principalType) || !auth.entCode ||
        request.authorization !== pin.authorization || !isDeepStrictEqual(this.policy(), pin.policy) ||
        !isDeepStrictEqual(headerSelectors(), pin.headerSelectors) ||
        [request.body, request.payload, request.httpRequest?.body].some(value => value !== undefined && !isDeepStrictEqual(value, pin.input)) ||
        [request.query, request.httpRequest?.query].some(value => value !== undefined &&
          (!value || Object.getPrototypeOf(value) !== Object.prototype || Object.keys(value).length)) ||
        [auth.tenantCode, request.tenantCode].some(value => value !== undefined && value !== tenant) ||
        [auth.enterpriseCode, request.enterpriseCode, request.entCode].some(value => value !== undefined && value !== auth.entCode) ||
        pin.headerSelectors.some(headers => Object.entries(headers || {}).some(([key, value]) =>
          key.toLowerCase() === "x-tenant-code" && value !== tenant ||
          key.toLowerCase() === "x-enterprise-code" && value !== auth.entCode))) this.fail("SCOPE");
    };
    bound();
    await SERVICE.DefaultEnterpriseMembershipService.verifyAuthenticatedActor(request);
    bound();
    return { tenant, bound, input: pin.input, policy: pin.policy };
  },
  /** Projects only public display and a typed owner reference; identifiers disambiguate equal names. */
  project: function (row, type, tenant) {
    if (!row || row.active !== true || row.disabled === true || row.registrationSuspended === true ||
      typeof row.code !== "string" || !/^[A-Za-z0-9_.:@|-]{1,200}$/.test(row.code) ||
      (type === "CUSTOMER" && row.tenant !== undefined && row.tenant !== tenant) ||
      (type === "ENTERPRISE" && row.tenant !== tenant)) this.fail("PROJECTION");
    const name = type === "CUSTOMER"
      ? [row.name?.firstName, row.name?.middleName, row.name?.lastName].filter(value => typeof value === "string").join(" ")
      : row.name;
    return { ownerType: type, ownerCode: row.code, displayName: typeof name === "string" && name.trim() ? name.trim() : row.code };
  },
  /** Reads only a bounded current-partition result, never generic browser query syntax. */
  lookup: async function (request, exact) {
    try {
      const context = await this.context(request), p = context.policy, input = context.input;
      const type = input.ownerType;
      if (!["CUSTOMER", "ENTERPRISE"].includes(type) || Object.keys(input).some(key => !["ownerType", exact ? "ownerCode" : "search"].includes(key))) this.fail("SELECTOR");
      let query = { active: true };
      if (exact) {
        if (typeof input.ownerCode !== "string" || !/^[A-Za-z0-9_.:@|-]{1,200}$/.test(input.ownerCode)) this.fail("SELECTOR");
        query.code = input.ownerCode;
      } else {
        if (typeof input.search !== "string" || input.search.trim().length < p.minimumSearchLength || input.search.length > p.maximumSearchLength) this.fail("SELECTOR");
        const text = input.search.trim(), prefix = "^" + text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        query.$or = [{ code: text }, ...(type === "CUSTOMER" ? ["name.firstName", "name.lastName"] : ["name"])
          .map(field => ({ [field]: { $regex: prefix, $options: "i" } }))];
      }
      const partition = type === "ENTERPRISE" ? CONFIG.get("defaultTenant") : context.tenant;
      if (typeof partition !== "string" || !partition) this.fail("POLICY");
      if (type === "ENTERPRISE") query.tenant = context.tenant;
      const read = { tenant: partition, authData: SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(), query,
        options: { recursive: false, skipItemCache: true }, searchOptions: { pageSize: exact ? 2 : p.maximumResults, pageNumber: 1 } };
      const result = await SERVICE[type === "CUSTOMER" ? "DefaultCustomerService" : "DefaultEnterpriseService"].get(read);
      context.bound();
      if (read.tenant !== partition || !/^SUC_/.test(result?.code || "") || result.error || result.success === false || result.errors?.length ||
        !Array.isArray(result.result) || result.result.length > (exact ? 1 : p.maximumResults) ||
        !Number.isSafeInteger(result.count) || result.count < result.result.length || exact && result.count !== result.result.length) this.fail("RESULT");
      const items = result.result.map(row => this.project(row, type, context.tenant));
      if (new Set(items.map(item => item.ownerCode)).size !== items.length || exact && items.some(item => item.ownerCode !== input.ownerCode)) this.fail("RESULT");
      await SERVICE.DefaultEnterpriseMembershipService.verifyAuthenticatedActor(request);
      context.bound();
      return exact ? { contractVersion: 1, tenant: context.tenant, recipient: items[0] || null }
        : { contractVersion: 1, tenant: context.tenant, items };
    } catch {
      this.fail("DEPENDENCY");
    }
  },
  /** Searches only existing visible participants by bounded display-name prefix or exact code. */
  search: function (request) { return this.lookup(request, false); },
  /** Revalidates a selected recipient without creating an account or granting operating authority. */
  resolve: function (request) { return this.lookup(request, true); },
};
