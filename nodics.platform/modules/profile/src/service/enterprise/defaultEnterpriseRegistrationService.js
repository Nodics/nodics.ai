/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
const crypto = require("node:crypto");
const admittedContexts = new WeakSet();
const provisioningMutations = new WeakSet();
const administratorProvisioningContexts = new WeakMap();
const administratorProvisioningWrites = new WeakMap();
/**
 * @module profile/service/enterprise/DefaultEnterpriseRegistrationService
 * @description Coordinates the existing invited-employee journey. Profile auth
 * cache holds short-lived continuations; the existing enterprise access assignment
 * holds the recoverable provisioning checkpoint. Communication owns verification
 * and delivery, and generated Profile services own every identity write.
 * @layer service
 * @owner profile
 * @sideEffects Public commands consume distributed rate limits and auth-cache leases,
 * invoke Communication, and conditionally provision generated Profile records.
 * @throws {CLASSES.NodicsError} Redacted ERR_PROFILE_REG_* failures; owner transport
 * errors propagate. Partial provisioning stays checkpointed and does not grant login.
 * @override Later layers may tighten policy and presentation. Preserve admission,
 * mailbox proof, exact assignment/command binding, insert-only credential creation,
 * acknowledged provisioning and the registration-aware session gate.
 * Exported helpers dispatch through the effective receiver so later module overrides
 * participate in composed calls; never replace admission markers with JSON flags.
 */
module.exports = {
  /** Recognizes only an exact transient registration authority write. @param {Object} request Generated command. @returns {boolean} Private request identity, not system auth. */
  ownsAdministratorMutation: function (request) {
    return administratorProvisioningWrites.has(request);
  },
  /**
   * Revalidates a privately consumed registration step against fresh assignment, checkpoint and native principal.
   * @param {Object} request Exact privately admitted generated command.
   * @param {boolean} [after] Validate acknowledged activation rather than its original pre-state.
   * @returns {Promise<Object>} Non-secret fixed-step evidence for the existing Team fence.
   */
  validateAdministratorMutation: async function (request, after = false) {
    const write = administratorProvisioningWrites.get(request);
    if (
      !write ||
      !["save", "update"].includes(write.operation) ||
      request.options?.upsert ||
      request.options?.overwrite ||
      this.digest([request.tenant, request.query, request.model]) !==
        write.digest
    )
      this.fail("CONFLICT");
    const admitted = administratorProvisioningContexts.get(write.context);
    if (!admitted) this.fail("CONFLICT");
    const { session } = admitted;
    const item = await this.current(
        write.context,
        session,
        admitted.assignmentCode,
      ),
      r = item.registration;
    if (
      !r ||
      r.commandId !== admitted.commandId ||
      r.assignmentDigest !== this.assignmentDigest(item) ||
      r.employeeCode !== session.email ||
      r.scopeCode !==
        "registrationScope_" + this.digest([item.code, r.commandId]) ||
      session.consumedOperation !== item.code + ":" + r.commandId ||
      !["CREDENTIAL", "ACTIVATING"].includes(r.phase)
    )
      this.fail("CONFLICT");
    const person = await this.read("DefaultEmployeeService", item.tenantCode, {
      code: r.employeeCode,
    });
    if (
      !person ||
      typeof person.active !== "boolean" ||
      (r.phase === "CREDENTIAL" && person.active !== false) ||
      person.authenticationIdentity ||
      person.loginId !== session.email ||
      person.principalType !== "human" ||
      person.registrationAssignmentCode !== item.code ||
      person.disabled === true ||
      person.registrationSuspended === true ||
      String(person.password) !== r.passwordId ||
      this.digest(person.userGroups) !== this.digest(item.groupCodes) ||
      request.tenant !== item.tenantCode
    )
      this.fail("CONFLICT");
    const expected = {
      code: r.scopeCode,
      principalType: "human",
      principalCode: session.email,
      scopeType: "ENTERPRISE",
      scopeCode: item.enterpriseCode,
      tenantCode: item.tenantCode,
      enterpriseCode: item.enterpriseCode,
      effect: "ALLOW",
      inheritanceMode: "DIRECT",
      status: "ACTIVE",
      reasonCode: "ENTERPRISE_ACCESS_ASSIGNMENT",
      active: true,
    };
    if (write.service === "DefaultPrincipalScopeAssignmentService") {
      if (
        write.operation === "save" &&
        (request.query || this.digest(request.model) !== this.digest(expected))
      )
        this.fail("CONFLICT");
      if (
        write.operation === "update" &&
        (this.digest(request.model) !== this.digest({ status: "ACTIVE" }) ||
          this.digest(request.query) !==
            this.digest(this.administratorScopeQuery(expected)))
      )
        this.fail("CONFLICT");
      const existing = await this.read(write.service, item.tenantCode, {
        code: expected.code,
      });
      if (write.operation === "save" && !after && existing)
        this.fail("CONFLICT");
      if (
        ((after || write.operation === "update") && !existing) ||
        (existing &&
          (Object.entries(expected).some(
            ([key, value]) => this.digest(existing[key]) !== this.digest(value),
          ) ||
            [
              "groupCode",
              "effectiveFrom",
              "effectiveTo",
              "permissionCode",
              "capabilityCode",
            ].some((key) => existing[key] !== undefined)))
      )
        this.fail("CONFLICT");
    } else if (write.service === "DefaultEmployeeService") {
      const query = {
        code: r.employeeCode,
        loginId: session.email,
        registrationAssignmentCode: item.code,
        authVersion: request.query?.authVersion,
        active: request.query?.active,
        registrationSuspended: { $ne: true },
        password: person.password,
        principalType: "human",
        userGroups: item.groupCodes,
        disabled: { $ne: true },
        authenticationIdentity: { $exists: false },
      };
      if (
        write.operation !== "update" ||
        r.phase !== "ACTIVATING" ||
        !Number.isSafeInteger(query.authVersion) ||
        query.authVersion < 1 ||
        typeof query.active !== "boolean" ||
        this.digest(request.query) !== this.digest(query) ||
        this.digest(request.model) !== this.digest({ active: true }) ||
        (!after &&
          (query.authVersion !== person.authVersion ||
            query.active !== person.active)) ||
        (after &&
          (person.active !== true ||
            !Number.isSafeInteger(person.authVersion) ||
            person.authVersion < query.authVersion))
      )
        this.fail("CONFLICT");
    } else this.fail("CONFLICT");
    return {
      owner: "registration",
      assignmentCode: item.code,
      commandId: r.commandId,
      enterpriseCode: item.enterpriseCode,
      tenantCode: item.tenantCode,
      step: write.service === "DefaultEmployeeService" ? "ACTIVATE" : "SCOPE",
      targetCode:
        write.service === "DefaultEmployeeService"
          ? r.employeeCode
          : r.scopeCode,
      modelDigest: this.digest(
        write.service === "DefaultEmployeeService" ? request.model : expected,
      ),
    };
  },
  /** Binds a re-ack to the entire deterministic ALLOW preimage, excluding unreviewed qualifiers. @param {Object} scope Exact owner-built model. @returns {Object} Generated atomic selector. */
  administratorScopeQuery: function (scope) {
    return {
      ...scope,
      groupCode: { $exists: false },
      effectiveFrom: { $exists: false },
      effectiveTo: { $exists: false },
      permissionCode: { $exists: false },
      capabilityCode: { $exists: false },
    };
  },
  /** Wraps an exact generated step with transient private provenance and the existing Team fence. @param {Object} context Private consumed provisioning context. @param {string} service Fixed generated owner. @param {string} operation Fixed save/update step. @param {Object} request Exact generated command. @param {Function} work Generated owner callback. @returns {Promise<Object>} Owner acknowledgement. */
  withAdministratorMutation: async function (
    context,
    service,
    operation,
    request,
    work,
  ) {
    if (!administratorProvisioningContexts.has(context)) this.fail("CONFLICT");
    if (
      (CONFIG.get("enterpriseManagement") || {}).teamAdministration
        ?.genericMutationGuard?.enabled !== true
    )
      return await work();
    administratorProvisioningWrites.set(request, {
      context,
      service,
      operation,
      digest: this.digest([request.tenant, request.query, request.model]),
    });
    try {
      return await SERVICE.DefaultEnterpriseTeamAdministrationService.withAdministratorOwnerMutation(
        request,
        service,
        operation,
        work,
      );
    } finally {
      administratorProvisioningWrites.delete(request);
    }
  },
  /**
   * Uses server time; a browser cannot submit its own clock.
   * @returns {number} Server epoch milliseconds; supports an overridden owner clock.
   */
  now: function () {
    return Date.now();
  },
  /**
   * Raises safe, stable Profile errors without reflecting input or storage data.
   * @param {string} suffix Stable Profile error suffix.
   * @returns {never} Throws the stable redacted owner error.
   */
  fail: function (suffix) {
    throw new CLASSES.NodicsError("ERR_PROFILE_REG_" + suffix);
  },
  /**
   * Reuses Profile's canonical tuple digest.
   * @param {*} value Helper input; shape alone grants no authority.
   * @returns {string} Canonical Profile command digest.
   */
  digest: function (value) {
    return SERVICE.DefaultEnterpriseManagementService.commandDigest(value);
  },
  /**
   * Accepts only complete configured policy; code availability does not enable registration.
   * @returns {Object} Validated effective policy; disabled or unqualified policy throws.
   */
  policy: function () {
    const p = (CONFIG.get("enterpriseManagement") || {}).registration;
    if (
      !p ||
      p.enabled !== true ||
      p.method !== "PASSWORD" ||
      !Number.isSafeInteger(p.continuationSeconds) ||
      p.continuationSeconds < 60 ||
      p.continuationSeconds > 3600 ||
      !Number.isSafeInteger(p.maximumInventoryPages) ||
      p.maximumInventoryPages < 1 ||
      p.maximumInventoryPages > 1000 ||
      !Number.isSafeInteger(p.pageSize) ||
      p.pageSize < 1 ||
      p.pageSize > 100 ||
      !Number.isSafeInteger(p.maximumNameLength) ||
      p.maximumNameLength < 1 ||
      p.maximumNameLength > 256 ||
      !Number.isSafeInteger(p.minimumPasswordLength) ||
      p.minimumPasswordLength < 12 ||
      !Number.isSafeInteger(p.maximumPasswordLength) ||
      p.maximumPasswordLength < p.minimumPasswordLength ||
      p.maximumPasswordLength > 1024 ||
      p.requireDistributedRateLimit !== true ||
      p.inventoryQualified !== true ||
      p.assignmentClaimIndexQualified !== true ||
      !p.presentation ||
      !p.rates
    )
      this.fail("UNAVAILABLE");
    return p;
  },
  /**
   * Admits a public request under the existing exact-origin and distributed-rate owners.
   * @param {Object} request Nodics request validated by the owning entry point.
   * @param {string} operation Fixed controller-selected capability operation.
   * @returns {Promise<Object>} Frozen admitted context after origin/rate checks.
   */
  context: async function (request, operation) {
    const p = this.policy(),
      browser = SERVICE.DefaultBrowserSessionService;
    if (
      !browser ||
      !SERVICE.DefaultRateLimitService ||
      !SERVICE.DefaultIdentityGovernanceService
    )
      this.fail("UNAVAILABLE");
    let browserPolicy;
    try {
      browserPolicy = browser.config(request);
    } catch (_) {
      this.fail("UNAVAILABLE");
    }
    try {
      browser.validateOrigin(request, browserPolicy);
    } catch (_) {
      this.fail("ORIGIN");
    }
    const ip = request.httpRequest && request.httpRequest.ip;
    if (typeof ip !== "string" || !ip || ip.length > 128) this.fail("INPUT");
    const tenant = CONFIG.get("defaultTenant"),
      enterpriseCode = CONFIG.get("defaultEnterprise");
    if (
      typeof tenant !== "string" ||
      !tenant ||
      typeof enterpriseCode !== "string" ||
      !enterpriseCode
    )
      this.fail("UNAVAILABLE");
    const context = Object.freeze({
      tenant,
      enterpriseCode,
      origin: request.httpRequest.headers.origin,
      ip,
      authData: SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
    });
    await this.rate(context, "request", [ip, operation]);
    admittedContexts.add(context);
    return context;
  },
  /**
   * Recognises a server-admitted local call; JSON/header flags cannot manufacture this capability.
   * @param {Object} context Server-admitted tenant, origin and trusted authorization.
   * @returns {boolean} Whether this exact object was admitted in-process.
   */
  ownsContext: function (context) {
    return admittedContexts.has(context);
  },
  /**
   * Marks only in-process owner commands; a request body cannot bypass ordinary suspension semantics.
   * @param {Object} request Nodics request validated by the owning entry point.
   * @returns {boolean} Whether provisioning marked this exact command.
   */
  ownsProvisioningMutation: function (request) {
    return provisioningMutations.has(request);
  },
  /**
   * Applies an existing atomic rate limit using non-reversible subject keys.
   * @param {Object} context Server-admitted tenant, origin and trusted authorization.
   * @param {string} name Fixed owner-defined operation or rate-policy key.
   * @param {string|string[]} identity Subject components for the owner's rate capability.
   * @returns {Promise<void>} Resolves only after the distributed limiter admits the request.
   */
  rate: async function (context, name, identity) {
    const p = this.policy(),
      limit = p.rates[name];
    if (
      !limit ||
      !Number.isSafeInteger(limit.limit) ||
      limit.limit < 1 ||
      !Number.isSafeInteger(limit.windowSeconds) ||
      limit.windowSeconds < 1
    )
      this.fail("UNAVAILABLE");
    await SERVICE.DefaultRateLimitService.enforce({
      moduleName: "profile",
      channelName: "rateLimit",
      tenant: context.tenant,
      capability: "profile.enterpriseRegistration",
      operation: name,
      identity,
      limit: limit.limit,
      windowSeconds: limit.windowSeconds,
      requireDistributed: true,
    });
  },
  /**
   * Validates the exact public DTO; roles, proof, enterprise and authority never come from arbitrary body fields.
   * @param {*} value Helper input; shape alone grants no authority.
   * @param {string[]} allowed Exact permitted DTO field names.
   * @returns {Object} Validated input; unknown fields throw.
   */
  input: function (value, allowed) {
    if (
      !value ||
      typeof value !== "object" ||
      Array.isArray(value) ||
      Object.keys(value).some((key) => !allowed.includes(key))
    )
      this.fail("INPUT");
    return value;
  },
  /**
   * Namespaces opaque continuation handles inside the existing Profile auth cache.
   * @param {string} token Opaque continuation handle; never log or return outside start.
   * @returns {string} Namespaced digest; invalid handles throw before cache access.
   */
  cacheKey: function (token) {
    if (typeof token !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(token))
      this.fail("CONTINUATION");
    return "enterprise-registration:" + this.digest(token);
  },
  /**
   * Restores only remaining lifetime; retries never renew an expired grant.
   * @param {string} token Opaque continuation handle; never log or return outside start.
   * @param {Object} session Mutable private continuation, never caller-supplied authority.
   * @returns {Promise<void>} Cache acknowledgement using only the original remaining lifetime.
   */
  store: async function (token, session) {
    const remaining = Math.floor((session.expiresAt - this.now()) / 1000);
    if (remaining < 1) this.fail("CONTINUATION");
    await SERVICE.DefaultAuthenticationProviderService.addToken(
      "profile",
      true,
      this.cacheKey(token),
      session,
      remaining,
    );
  },
  /**
   * Serialises one continuation operation using the existing distributed atomic consume. Cache loss requires fresh email verification.
   * @param {Object} context Server-admitted tenant, origin and trusted authorization.
   * @param {string} token Opaque continuation handle; never log or return outside start.
   * @param {function(Object): Promise<*>} work Awaited callback receiving the atomically leased continuation.
   * @returns {Promise<*>} Callback result; unexpired state is restored in finally, failures propagate.
   */
  session: async function (context, token, work) {
    let state;
    try {
      state = await SERVICE.DefaultAuthenticationProviderService.consumeToken(
        "profile",
        this.cacheKey(token),
      );
    } catch (error) {
      if (error.code === "ERR_CACHE_00001") this.fail("CONTINUATION");
      throw error;
    }
    if (
      !state ||
      state.tenant !== context.tenant ||
      state.origin !== context.origin ||
      !Number.isFinite(state.expiresAt) ||
      state.expiresAt <= this.now()
    )
      this.fail("CONTINUATION");
    try {
      return await work(state);
    } finally {
      if (state.expiresAt > this.now()) await this.store(token, state);
    }
  },
  /**
   * Binds every challenge operation to the server-owned email and continuation.
   * @param {Object} session Mutable private continuation, never caller-supplied authority.
   * @param {string} operation Fixed controller-selected capability operation.
   * @param {Object} [fields] Operation-specific server-held verification fields.
   * @returns {Object} Bound verification DTO with owner-selected authority.
   */
  command: function (session, operation, fields = {}) {
    return {
      operation,
      subjectReference: "employee-email:" + this.digest(session.email),
      channel: "EMAIL",
      destination: session.email,
      bindingReference: session.binding,
      ...fields,
    };
  },
  /**
   * Invokes the existing remote verification connection; real runtime credentials remain transport-owned.
   * @param {Object} context Server-admitted tenant, origin and trusted authorization.
   * @param {Object} session Mutable private continuation, never caller-supplied authority.
   * @param {string} operation Fixed controller-selected capability operation.
   * @param {Object} [fields] Operation-specific server-held verification fields.
   * @returns {Promise<Object>} Verification transport result without local fallback.
   */
  verifyRpc: function (context, session, operation, fields = {}) {
    return SERVICE.DefaultEnterpriseManagementService.invokeRegistrationVerification(
      context,
      this.command(session, operation, fields),
    );
  },
  /**
   * Sends transient verification content through the existing Communication intent, not SMTP from Profile.
   * @param {Object} context Server-admitted tenant, origin and trusted authorization.
   * @param {Object} session Mutable private continuation, never caller-supplied authority.
   * @param {string} secret Transient code used only for the current delivery intent.
   * @returns {Promise<void>} Updates session delivery acceptance, not proof of inbox receipt.
   */
  deliver: async function (context, session, secret) {
    const p = this.policy(),
      mail = p.mail;
    if (
      !mail ||
      !/^[A-Za-z][A-Za-z0-9_.-]{0,127}$/.test(mail.connectionName || "") ||
      !mail.templateCode ||
      !mail.purpose ||
      !mail.locale ||
      !Number.isSafeInteger(mail.timeoutMilliseconds) ||
      mail.timeoutMilliseconds < 1 ||
      mail.timeoutMilliseconds > 60000
    )
      this.fail("UNAVAILABLE");
    const response =
      await SERVICE.DefaultEnterpriseManagementService.invokePrivateCommunication(
        {
          local: false,
          moduleName: "commsApi",
          connectionName: mail.connectionName,
          apiName: "/internal/communications",
          methodName: "POST",
          tenant: context.tenant,
          request: { tenant: context.tenant },
          header: { "X-Enterprise-Code": context.enterpriseCode },
          requestBody: {
            sourceModule: "profile",
            sourceType: "EMPLOYEE_EMAIL_VERIFICATION",
            sourceCode: session.challenge.challengeCode,
            templateCode: mail.templateCode,
            recipientId: "registration:" + this.digest(session.email),
            recipientAddressReference: session.email,
            purpose: mail.purpose,
            channel: "EMAIL",
            locale: mail.locale,
            variables: {
              verificationCode: secret,
              expiresAt: session.challenge.expiresAt,
            },
            idempotencyKey:
              session.challenge.challengeCode +
              ":" +
              session.challenge.generation,
            expiresAt: session.challenge.expiresAt,
          },
          maxAttempts: 1,
          timeoutMs: mail.timeoutMilliseconds,
          maxResponseBytes: 8192,
          followRedirects: false,
          requireInternalAuth: true,
        },
        mail,
      ).catch(() => this.fail("DELIVERY"));
    let result = response;
    for (let n = 0; n < 4; n++) {
      if (
        !result ||
        typeof result !== "object" ||
        Array.isArray(result) ||
        result.success === false ||
        result.error ||
        /^ERR_/.test(result.code || "")
      )
        this.fail("DELIVERY");
      if (
        typeof result.intentCode === "string" &&
        typeof result.status === "string"
      )
        break;
      if (Object.hasOwn(result, "result") === Object.hasOwn(result, "data"))
        this.fail("DELIVERY");
      result = Object.hasOwn(result, "result") ? result.result : result.data;
    }
    if (
      !result ||
      ![
        "ACCEPTED",
        "QUEUED",
        "DELIVERING",
        "DELIVERED",
        "RETRY_PENDING",
        "UNCERTAIN",
      ].includes(result.status)
    )
      this.fail("DELIVERY");
    session.deliveryStatus = result.status; // Provider acceptance is not a claim of inbox receipt.
  },
  /**
   * Starts identically for invited, registered and unknown mailboxes; identity resolution follows proof.
   * @param {Object} context Server-admitted tenant, origin and trusted authorization.
   * @param {Object} input Untrusted DTO checked against the operation allowlist.
   * @returns {Promise<Object>} Neutral progress and new continuation after issuing and storing verification.
   */
  start: async function (context, input) {
    this.input(input, ["email"]);
    if (typeof input.email !== "string") this.fail("INPUT");
    let email;
    try {
      email = SERVICE.DefaultEnterpriseManagementService.normalizeEmail(
        input.email,
      );
    } catch (_) {
      this.fail("INPUT");
    }
    await this.rate(context, "email", email);
    const token = crypto.randomBytes(32).toString("base64url");
    const session = {
      tenant: context.tenant,
      origin: context.origin,
      email,
      binding: this.digest([context.tenant, token]),
      expiresAt: this.now() + this.policy().continuationSeconds * 1000,
      stage: ENUMS.ProfileEmployeeAccessStage.VERIFY_EMAIL.key,
      deliveryStatus: ENUMS.ProfileEmployeeNotificationStatus.PENDING.key,
    };
    const issued = await this.verifyRpc(context, session, "ISSUE");
    const { secret, ...challenge } = issued;
    session.challenge = challenge;
    if (typeof secret !== "string") this.fail("DELIVERY");
    try {
      await this.deliver(context, session, secret);
    } catch (_) {
      session.deliveryStatus =
        ENUMS.ProfileEmployeeNotificationStatus.UNAVAILABLE.key;
    }
    await this.store(token, session);
    return { ...this.project(session), continuation: token };
  },
  /**
   * Requires canonical bounded generated reads; transport failure cannot become an empty directory.
   * @param {Object} response Generated-service or transport envelope to validate.
   * @returns {Object[]} Successful result records; failed transport cannot become an empty inventory.
   */
  rows: function (response) {
    if (
      !response ||
      response.success === false ||
      response.error ||
      !/^SUC_/.test(response.code || "") ||
      (Array.isArray(response.errors) && response.errors.length) ||
      !Array.isArray(response.result)
    )
      this.fail("STORAGE");
    return response.result;
  },
  /** Converts canonical ID selectors using the selected Profile model's provider, preserving caller queries and non-ID values. @param {string} service Generated Profile owner. @param {string} tenant Exact partition. @param {Object} query Owner-built selector. @returns {Object} Provider-typed query. */
  prepareReadQuery: function (service, tenant, query) {
    let model;
    const convert = (value) => {
      if (typeof value !== "string") return value;
      if (!model) {
        const name = /^Default([A-Z][A-Za-z0-9]*)Service$/.exec(service);
        const moduleName =
          SERVICE.DefaultProfileService?.getProfileModuleName?.();
        model =
          name &&
          moduleName &&
          NODICS.getModels?.(moduleName, tenant)?.[name[1] + "Model"];
        if (
          !model?.dataBase ||
          typeof SERVICE.DefaultDatabaseConfigurationService?.toObjectId !==
            "function"
        )
          this.fail("UNAVAILABLE");
      }
      return SERVICE.DefaultDatabaseConfigurationService.toObjectId(
        model,
        value,
      );
    };
    let nodes = 0;
    const visit = (selector, depth = 0) => {
      if (++nodes > 256 || depth > 16) this.fail("STORAGE");
      const result = { ...selector };
      for (const key of Object.keys(result)) {
        if (["$and", "$or", "$nor"].includes(key)) {
          if (!Array.isArray(result[key])) this.fail("STORAGE");
          result[key] = result[key].map((item) => visit(item, depth + 1));
        } else if (key === "_id") {
          const value = result[key];
          if (
            value &&
            typeof value === "object" &&
            Object.keys(value).some((operator) => operator.startsWith("$"))
          ) {
            result[key] = { ...value };
            for (const operator of ["$eq", "$ne", "$in", "$nin"]) {
              if (!Object.hasOwn(value, operator)) continue;
              if (["$in", "$nin"].includes(operator)) {
                if (
                  !Array.isArray(value[operator]) ||
                  value[operator].length > 256
                )
                  this.fail("STORAGE");
                result[key][operator] = value[operator].map(convert);
              } else result[key][operator] = convert(value[operator]);
            }
          } else result[key] = convert(value);
        }
      }
      return result;
    };
    return visit(query);
  },
  /**
   * Reads one exact identity through its owner, uncached and non-recursive.
   * @param {string} service Internal generated-service name, never a public selector.
   * @param {string} tenant Owner-resolved persistence partition.
   * @param {Object} query Owner-built exact lookup or conditional-write predicate.
   * @returns {Promise<Object|undefined>} Exact uncached record; ambiguity and transport failure reject.
   */
  read: async function (service, tenant, query) {
    if (!SERVICE[service] || typeof SERVICE[service].get !== "function")
      this.fail("UNAVAILABLE");
    const rows = this.rows(
      await SERVICE[service].get({
        tenant,
        authData: SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
        query: SERVICE.DefaultEnterpriseRegistrationService.prepareReadQuery(
          service,
          tenant,
          query,
        ),
        options: { recursive: false, skipItemCache: true },
        searchOptions: { pageSize: 2, pageNumber: 1 },
      }),
    );
    if (rows.length > 1) this.fail("CONFLICT");
    return rows[0];
  },
  /**
   * Paginates the existing registry with a hard bound. Repeated pages, inconsistent counts and truncation fail closed.
   * @param {string} service Internal generated-service name, never a public selector.
   * @param {string} tenant Owner-resolved persistence partition.
   * @param {Object} query Owner-built exact lookup or conditional-write predicate.
   * @returns {Promise<Object[]>} Bounded complete inventory; duplicates and truncation reject.
   */
  inventory: async function (service, tenant, query) {
    const p = this.policy(),
      all = [],
      seen = new Set();
    for (let page = 1; page <= p.maximumInventoryPages; page++) {
      const response = await SERVICE[service].get({
        tenant,
        authData: SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
        query,
        options: { recursive: false, skipItemCache: true },
        searchOptions: {
          pageSize: p.pageSize,
          pageNumber: page,
          sort: { code: 1 },
        },
      });
      const rows = this.rows(response);
      if (rows.length > p.pageSize) this.fail("STORAGE");
      for (const row of rows) {
        if (
          !row ||
          typeof row.code !== "string" ||
          !row.code ||
          seen.has(row.code)
        )
          this.fail("STORAGE");
        seen.add(row.code);
        all.push(row);
      }
      if (rows.length < p.pageSize) {
        if (Number.isSafeInteger(response.count) && response.count > all.length)
          this.fail("STORAGE");
        return all;
      }
    }
    this.fail("UNAVAILABLE");
  },
  /**
   * Locates existing identities across the authority's declared tenant inventory; never searches raw databases.
   * @param {Object} context Server-admitted tenant, origin and trusted authorization.
   * @param {string} email Canonical normalized mailbox.
   * @returns {Promise<Object[]>} Existing employee/customer matches in the declared tenant inventory.
   */
  identities: async function (context, email) {
    const enterprises = await this.inventory(
      "DefaultEnterpriseService",
      context.tenant,
      {},
    );
    const tenants = new Set([context.tenant]);
    for (const enterprise of enterprises) {
      const tenant =
        enterprise.tenant && typeof enterprise.tenant === "object"
          ? enterprise.tenant.code
          : enterprise.tenant;
      if (typeof tenant !== "string" || !tenant) this.fail("STORAGE");
      tenants.add(tenant);
    }
    const identities = [];
    for (const tenant of tenants) {
      for (const [service, kind] of [
        ["DefaultEmployeeService", "EMPLOYEE"],
        ["DefaultCustomerService", "CUSTOMER"],
      ]) {
        const person = await this.read(service, tenant, { loginId: email });
        if (person) identities.push({ tenant, kind, person });
      }
    }
    return identities;
  },
  /**
   * Reads invitations by exact normalised email; no employee or enterprise directory is exposed publicly.
   * @param {Object} context Server-admitted tenant, origin and trusted authorization.
   * @param {string} email Canonical normalized mailbox.
   * @returns {Promise<Object[]>} Exact-email assignments from the existing owner.
   */
  assignments: function (context, email) {
    return this.inventory(
      "DefaultEnterpriseAccessAssignmentService",
      context.tenant,
      { normalizedEmail: email },
    );
  },
  /**
   * Compares current pre-authorisation with the immutable checkpoint responsibilities.
   * @param {Object} assignment Authoritative assignment and private checkpoint.
   * @returns {string} Digest of immutable granted responsibilities.
   */
  assignmentDigest: function (assignment) {
    return this.digest([
      assignment.code,
      assignment.normalizedEmail,
      assignment.enterpriseCode,
      assignment.tenantCode,
      assignment.roleCode,
      assignment.groupCodes,
      assignment.scopeType,
      assignment.scopeCode,
    ]);
  },
  /**
   * Refuses inactive, expired, malformed or non-invited assignments before every write.
   * @param {Object} assignment Authoritative assignment and private checkpoint.
   * @param {string} email Canonical normalized mailbox.
   * @param {boolean} [permitRegistered] Permit inspection of previously completed registration.
   * @returns {void} Returns only for currently valid responsibilities; otherwise throws.
   */
  assertAssignment: function (assignment, email, permitRegistered = false) {
    if (
      !assignment ||
      assignment.normalizedEmail !== email ||
      assignment.active !== true ||
      (![
        "PENDING",
        "ACTIVE",
        ENUMS.ProfileEmployeeApplicationStatus.APPROVED.key,
      ].includes(assignment.status) &&
        !(
          permitRegistered &&
          assignment.status ===
            ENUMS.ProfileEmployeeApplicationStatus.REGISTERED.key
        )) ||
      (assignment.status !==
        ENUMS.ProfileEmployeeApplicationStatus.REGISTERED.key &&
        assignment.expiresAt &&
        (!Number.isFinite(new Date(assignment.expiresAt).getTime()) ||
          new Date(assignment.expiresAt).getTime() <= this.now())) ||
      !assignment.enterpriseCode ||
      !assignment.tenantCode ||
      assignment.scopeType !== "ENTERPRISE" ||
      assignment.scopeCode !== assignment.enterpriseCode ||
      !Array.isArray(assignment.groupCodes) ||
      !assignment.groupCodes.length ||
      assignment.groupCodes.some(
        (group) => typeof group !== "string" || !group,
      ) ||
      (assignment.origin &&
        assignment.origin !== "ADMIN_PRE_ENROLLED" &&
        !(
          assignment.origin === "SELF_APPLICATION" &&
          SERVICE.DefaultEnterpriseApplicationReviewService?.assertApprovedAssignment(
            assignment,
          )
        ))
    )
      this.fail("ASSIGNMENT");
    const role = SERVICE.DefaultEnterpriseManagementService.rolePolicy(
      assignment.roleCode,
    );
    if (this.digest(role.groupCodes) !== this.digest(assignment.groupCodes))
      this.fail("ASSIGNMENT");
    if (
      assignment.registration &&
      assignment.registration.assignmentDigest !==
        this.assignmentDigest(assignment)
    )
      this.fail("CONFLICT");
  },
  /**
   * Matches a completed native registration to one observed employee, without granting authority.
   * @param {Object} item Owner-read access assignment.
   * @param {Object} identity Owner-read employee and its inventory tenant.
   * @param {string} email Verified normalized mailbox.
   * @returns {boolean} Exact checkpoint/identity match. Later layers must preserve these bindings.
   */
  matchesRegisteredSignIn: function (item, identity, email) {
    const person = identity.person,
      registration = item.registration;
    return Boolean(
      identity.kind === "EMPLOYEE" &&
      person &&
      !person.authenticationIdentity &&
      person.loginId === email &&
      item.normalizedEmail === email &&
      item.status === ENUMS.ProfileEmployeeApplicationStatus.REGISTERED.key &&
      registration?.phase === ENUMS.ProfileRegistrationPhase.COMPLETE.key &&
      item.tenantCode === identity.tenant &&
      item.registeredLoginId === email &&
      person.registrationAssignmentCode === item.code &&
      registration.employeeCode === person.code &&
      registration.passwordId &&
      person.password &&
      String(registration.passwordId) ===
        String(person.password._id || person.password),
    );
  },
  /**
   * Resolves an optional routing hint after mailbox proof using fresh existing owners only.
   * @param {Object} context Server-admitted authority context.
   * @param {Object} session Private verified continuation.
   * @param {Object[]} assignments Complete bounded mailbox assignment inventory.
   * @param {Object[]} identities Complete bounded employee/customer inventory.
   * @returns {Promise<string|undefined>} Unambiguous enterprise hint; unavailable or changed evidence rejects.
   * @override Preserve unique identity, fresh checkpoint/credential/readiness evidence and proof bounds.
   * No provisioning, proof consumption, membership adoption, notification or session issuance occurs.
   */
  registeredSignInEnterprise: async function (
    context,
    session,
    assignments,
    identities,
  ) {
    if (
      session.challenge.status !== "VERIFIED" ||
      !session.proof ||
      !Number.isFinite(session.proofExpiresAt) ||
      session.proofExpiresAt <= this.now()
    )
      this.fail("VERIFY_AGAIN");
    if (identities.length !== 1 || identities[0].kind !== "EMPLOYEE")
      return undefined;
    const identity = identities[0];
    const candidates = assignments.filter((item) =>
      this.matchesRegisteredSignIn(item, identity, session.email),
    );
    if (candidates.length !== 1) return undefined;
    const item = await this.current(context, session, candidates[0].code);
    if (!this.matchesRegisteredSignIn(item, identity, session.email))
      this.fail("ASSIGNMENT");
    if (
      typeof item.enterpriseCode !== "string" ||
      !/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(item.enterpriseCode)
    )
      this.fail("ASSIGNMENT");
    await this.assertSessionEligible({
      person: identity.person,
      enterprise: {
        code: item.enterpriseCode,
        tenant: { code: item.tenantCode },
      },
    });
    if (!item.registration.passwordCode) this.fail("ASSIGNMENT");
    const credential = await this.read("DefaultPasswordService", item.tenantCode, {
      code: item.registration.passwordCode,
    });
    if (
      !credential ||
      credential.active !== true ||
      String(credential._id) !== String(item.registration.passwordId)
    )
      this.fail("ASSIGNMENT");
    return item.enterpriseCode;
  },
  /**
   * Resolves only verified email routes and authorised invitation choices. Partial current work is resumable, not a second identity.
   * @param {Object} context Server-admitted tenant, origin and trusted authorization.
   * @param {Object} session Mutable private continuation, never caller-supplied authority.
   * @returns {Promise<void>} Updates the private continuation's next stage and choices.
   */
  resolveVerified: async function (context, session) {
    delete session.signInEnterpriseCode;
    const assignments = await this.assignments(context, session.email);
    const identities = await this.identities(context, session.email);
    const partial = assignments.filter(
      (item) =>
        item.registration &&
        item.registration.phase !==
          ENUMS.ProfileRegistrationPhase.COMPLETE.key &&
        item.status !== ENUMS.ProfileEmployeeApplicationStatus.REGISTERED.key,
    );
    const knownOutsidePartial = identities.some(
      (identity) =>
        identity.kind === "CUSTOMER" ||
        !partial.some(
          (item) =>
            item.tenantCode === identity.tenant &&
            identity.person.registrationAssignmentCode === item.code &&
            identity.person.password &&
            item.registration.passwordId &&
            String(identity.person.password) ===
              String(item.registration.passwordId),
        ),
    );
    const membershipOwner = SERVICE.DefaultEnterpriseMembershipService;
    const existingMembership =
      knownOutsidePartial && membershipOwner && membershipOwner.enabled();
    if (
      !existingMembership &&
      (knownOutsidePartial ||
        assignments.some(
          (item) =>
            item.status ===
            ENUMS.ProfileEmployeeApplicationStatus.REGISTERED.key,
        ))
    ) {
      session.signInEnterpriseCode = await this.registeredSignInEnterprise(
        context,
        session,
        assignments,
        identities,
      );
      session.stage = ENUMS.ProfileEmployeeAccessStage.SIGN_IN.key;
      return;
    }
    const eligible = [];
    for (const assignment of assignments) {
      if (
        existingMembership &&
        (assignment.registration || assignment.status === "REGISTERED")
      )
        continue;
      try {
        this.assertAssignment(assignment, session.email);
      } catch (error) {
        if (error.code === "ERR_PROFILE_REG_ASSIGNMENT") continue;
        throw error;
      }
      const enterprise =
        await SERVICE.DefaultEnterpriseManagementService.retrieveEnterpriseForAccess(
          assignment.enterpriseCode,
        );
      if (enterprise.tenantCode !== assignment.tenantCode)
        this.fail("ASSIGNMENT");
      const name = enterprise.enterprise.name;
      eligible.push({
        code: assignment.code,
        name:
          typeof name === "string"
            ? name
            : (name && name.en) || assignment.enterpriseCode,
        recovery: Boolean(assignment.registration),
        ...(assignment.registration || assignment.application
          ? {
              profile: {
                firstName: (assignment.registration || assignment.application)
                  .firstName,
                lastName: (assignment.registration || assignment.application)
                  .lastName,
              },
            }
          : {}),
      });
    }
    if (existingMembership) {
      if (!eligible.length)
        session.signInEnterpriseCode = await this.registeredSignInEnterprise(
          context,
          session,
          assignments,
          identities,
        );
      session.assignments = eligible;
      session.stage = eligible.length
        ? ENUMS.ProfileEmployeeAccessStage.EXISTING_ACCOUNT.key
        : ENUMS.ProfileEmployeeAccessStage.SIGN_IN.key;
      if (eligible.length === 1) session.assignmentCode = eligible[0].code;
      return;
    }
    if (
      !eligible.length &&
      SERVICE.DefaultEnterpriseApplicationService &&
      (await SERVICE.DefaultEnterpriseApplicationService.resolve(
        context,
        session,
        assignments,
      ))
    )
      return;
    session.assignments = eligible;
    session.stage = eligible.length
      ? ENUMS.ProfileEmployeeAccessStage.DETAILS.key
      : ENUMS.ProfileEmployeeAccessStage.NO_INVITATION.key;
    if (eligible.length === 1) session.assignmentCode = eligible[0].code;
  },
  /**
   * Verifies the current code and retains the execution proof only in the protected server auth cache.
   * @param {Object} context Server-admitted tenant, origin and trusted authorization.
   * @param {Object} session Mutable private continuation, never caller-supplied authority.
   * @param {Object} input Untrusted DTO checked against the operation allowlist.
   * @returns {Promise<Object>} Safe progress after verification; raw proof stays server-side.
   */
  verify: async function (context, session, input) {
    this.input(input, ["continuation", "code"]);
    if (session.stage === ENUMS.ProfileEmployeeAccessStage.RESOLVING.key) {
      await this.resolveVerified(context, session);
      return this.project(session);
    }
    if (session.stage !== ENUMS.ProfileEmployeeAccessStage.VERIFY_EMAIL.key)
      return this.project(session);
    if (
      typeof input.code !== "string" ||
      !/^[A-Za-z0-9]{6,128}$/.test(input.code)
    )
      this.fail("INPUT");
    const result = await this.verifyRpc(context, session, "VERIFY", {
      challengeCode: session.challenge.challengeCode,
      generation: session.challenge.generation,
      secret: input.code,
    });
    const { proof, ...challenge } = result;
    session.challenge = challenge;
    if (result.status === "VERIFIED") {
      delete session.notice;
      session.stage = ENUMS.ProfileEmployeeAccessStage.RESOLVING.key;
      session.proof = proof;
      session.proofExpiresAt = new Date(result.proofExpiresAt).getTime();
      await this.resolveVerified(context, session);
    } else if (["EXPIRED", "LOCKED"].includes(result.status)) {
      session.stage = ENUMS.ProfileEmployeeAccessStage.VERIFY_EMAIL.key;
      session.notice = "CODE_UNAVAILABLE";
    } else session.notice = "INVALID_CODE";
    return this.project(session);
  },
  /**
   * Replaces through the existing verification owner. New generations invalidate stale proof; no automatic send replay.
   * @param {Object} context Server-admitted tenant, origin and trusted authorization.
   * @param {Object} session Mutable private continuation, never caller-supplied authority.
   * @param {Object} input Untrusted DTO checked against the operation allowlist.
   * @returns {Promise<Object>} Safe progress after replacing the code and invalidating old proof.
   */
  resend: async function (context, session, input) {
    this.input(input, ["continuation"]);
    if (session.stage !== ENUMS.ProfileEmployeeAccessStage.VERIFY_EMAIL.key)
      this.fail("CONFLICT");
    await this.rate(context, "email", session.email);
    const result = await this.verifyRpc(context, session, "REPLACE", {
      challengeCode: session.challenge.challengeCode,
      expectedRevision: session.challenge.revision,
    });
    const { secret, ...challenge } = result;
    session.challenge = challenge;
    delete session.proof;
    delete session.proofExpiresAt;
    delete session.notice;
    try {
      await this.deliver(context, session, secret);
    } catch (_) {
      session.deliveryStatus =
        ENUMS.ProfileEmployeeNotificationStatus.UNAVAILABLE.key;
    }
    return this.project(session);
  },
  /**
   * Rejects failed or non-canonical write envelopes; successful transport is not successful persistence.
   * @param {Object} response Generated-service or transport envelope to validate.
   * @returns {void} Returns only for a canonical successful write envelope.
   */
  assertWrite: function (response) {
    if (
      !response ||
      response.success === false ||
      response.error ||
      !/^SUC_/.test(response.code || "") ||
      (Array.isArray(response.errors) && response.errors.length)
    )
      this.fail("STORAGE");
  },
  /**
   * Writes one checkpoint through the existing generated managed-concurrency contract and exact readback.
   * @param {Object} context Server-admitted tenant, origin and trusted authorization.
   * @param {Object} assignment Authoritative assignment and private checkpoint.
   * @param {Object} registration Private checkpoint persisted at the expected revision.
   * @param {Object} [patch] Owner-built conditional-update fields.
   * @returns {Promise<Object>} Saved assignment after exact own-write revision readback.
   */
  checkpoint: async function (context, assignment, registration, patch = {}) {
    const mutation = crypto.randomBytes(32).toString("hex");
    const revision =
      assignment.revision === undefined ? 0 : assignment.revision;
    const command = {
      tenant: context.tenant,
      authData: context.authData,
      query: {
        code: assignment.code,
        revision,
        status: assignment.status,
        normalizedEmail: assignment.normalizedEmail,
        active: true,
      },
      model: {
        ...patch,
        code: assignment.code,
        revision,
        registration: { ...registration, mutation },
      },
      options: { recursive: false },
    };
    provisioningMutations.add(command);
    const response =
      await SERVICE.DefaultEnterpriseAccessAssignmentService.update(command);
    this.assertWrite(response);
    const saved = await this.read(
      "DefaultEnterpriseAccessAssignmentService",
      context.tenant,
      {
        code: assignment.code,
      },
    );
    if (
      !saved ||
      !saved.registration ||
      saved.revision !== revision + 1 ||
      saved.registration.mutation !== mutation
    )
      this.fail("CONFLICT");
    this.assertAssignment(saved, assignment.normalizedEmail, true);
    return saved;
  },
  /**
   * Reads current responsibility and registered-state authority before every provisioning stage.
   * @param {Object} context Server-admitted tenant, origin and trusted authorization.
   * @param {Object} session Mutable private continuation, never caller-supplied authority.
   * @param {string} code Stable owner error suffix.
   * @returns {Promise<Object>} Fresh validated owner state; changed identity or scope rejects.
   */
  current: async function (context, session, code) {
    const item = await this.read(
      "DefaultEnterpriseAccessAssignmentService",
      context.tenant,
      { code },
    );
    this.assertAssignment(item, session.email, true);
    const enterprise =
      await SERVICE.DefaultEnterpriseTeamAdministrationService.enterpriseForAccess(
        item.enterpriseCode,
      );
    if (enterprise.tenantCode !== item.tenantCode) this.fail("ASSIGNMENT");
    return item;
  },
  /**
   * Inserts an exact deterministic new record without a query/upsert. A lost response is inspected; existing records are never overwritten.
   * @param {string} service Internal generated-service name, never a public selector.
   * @param {Object} context Server-admitted tenant, origin and trusted authorization.
   * @param {string} tenant Owner-resolved persistence partition.
   * @param {Object} model Deterministic new owner record; never an upsert.
   * @param {Object} expected Fields required to match saved or recovered persistence.
   * @returns {Promise<Object>} Exact saved record, reconciling uncertain responses without overwrite.
   */
  insert: async function (service, context, tenant, model, expected) {
    let existing = await this.read(service, tenant, { code: model.code });
    if (!existing) {
      try {
        const command = {
          tenant,
          authData: context.authData,
          model,
          options: { recursive: false },
        };
        this.assertWrite(
          service === "DefaultEnterpriseAccessAssignmentService" &&
            model.origin === "SELF_APPLICATION"
            ? await SERVICE.DefaultEnterpriseApplicationService.write(
                "save",
                command,
              )
            : administratorProvisioningContexts.has(context) &&
                service === "DefaultPrincipalScopeAssignmentService"
              ? await this.withAdministratorMutation(
                  context,
                  service,
                  "save",
                  command,
                  () => SERVICE[service].save(command),
                )
              : service === "DefaultPrincipalScopeAssignmentService" &&
                  SERVICE.DefaultEnterpriseMembershipService?.ownsAdministratorScopeContext?.(
                    context,
                  )
                ? await SERVICE.DefaultEnterpriseMembershipService.withAdministratorScopeMutation(
                    context,
                    "save",
                    command,
                    () => SERVICE[service].save(command),
                  )
                : await SERVICE[service].save(command),
        );
      } catch (error) {
        existing = await this.read(service, tenant, { code: model.code });
        if (!existing) throw error;
      }
      existing = await this.read(service, tenant, { code: model.code });
    }
    if (
      !existing ||
      Object.entries(expected).some(
        ([key, value]) => this.digest(existing[key]) !== this.digest(value),
      )
    )
      this.fail("CONFLICT");
    return existing;
  },
  /**
   * Re-acknowledges conditional domain updates, including their existing invalidation hooks. Never infers success from an unacknowledged activation.
   * @param {string} service Internal generated-service name, never a public selector.
   * @param {Object} context Server-admitted tenant, origin and trusted authorization.
   * @param {string} tenant Owner-resolved persistence partition.
   * @param {Object} query Owner-built exact lookup or conditional-write predicate.
   * @param {Object} patch Owner-built conditional-update fields.
   * @returns {Promise<void>} One acknowledged update including existing invalidation hooks.
   */
  updateOne: async function (service, context, tenant, query, patch) {
    const command = {
      tenant,
      authData: context.authData,
      query,
      model: patch,
      options: { recursive: false },
    };
    provisioningMutations.add(command);
    try {
      const work = async () => {
        const response = await SERVICE[service].update(command);
        this.assertWrite(response);
        if (!response.result || response.result.matchedCount !== 1)
          this.fail("CONFLICT");
        return response;
      };
      if (
        administratorProvisioningContexts.has(context) &&
        [
          "DefaultPrincipalScopeAssignmentService",
          "DefaultEmployeeService",
        ].includes(service)
      )
        await this.withAdministratorMutation(
          context,
          service,
          "update",
          command,
          work,
        );
      else if (
        service === "DefaultPrincipalScopeAssignmentService" &&
        SERVICE.DefaultEnterpriseMembershipService?.ownsAdministratorScopeContext?.(
          context,
        )
      )
        await SERVICE.DefaultEnterpriseMembershipService.withAdministratorScopeMutation(
          context,
          "update",
          command,
          work,
        );
      else await work();
    } finally {
      provisioningMutations.delete(command);
    }
  },
  /**
   * Persists/reuses the immutable operation before consuming a one-time verification proof.
   * @param {Object} context Server-admitted tenant, origin and trusted authorization.
   * @param {Object} session Mutable private continuation, never caller-supplied authority.
   * @param {Object} input Untrusted DTO checked against the operation allowlist.
   * @param {Object} assignment Authoritative assignment and private checkpoint.
   * @returns {Promise<Object>} Assignment retaining its immutable claimed provisioning checkpoint.
   */
  prepare: async function (context, session, input, assignment) {
    const p = this.policy();
    const firstName =
      typeof input.firstName === "string" ? input.firstName.trim() : "";
    const lastName =
      typeof input.lastName === "string" ? input.lastName.trim() : "";
    if (
      !firstName ||
      !lastName ||
      firstName.length > p.maximumNameLength ||
      lastName.length > p.maximumNameLength ||
      typeof input.password !== "string" ||
      input.password.length < p.minimumPasswordLength ||
      input.password.length > p.maximumPasswordLength
    )
      this.fail("INPUT");
    if (
      assignment.origin === "SELF_APPLICATION" &&
      (firstName !== assignment.application?.firstName ||
        lastName !== assignment.application?.lastName)
    )
      this.fail("CONFLICT");
    const detailsDigest = this.digest([
      firstName,
      lastName,
      this.assignmentDigest(assignment),
    ]);
    if (assignment.registration) {
      if (assignment.registration.detailsDigest !== detailsDigest)
        this.fail("CONFLICT");
      return assignment;
    }
    const currentIdentities = await this.identities(context, session.email);
    if (currentIdentities.length) this.fail("EXISTING");
    const commandId = crypto.randomBytes(32).toString("hex");
    const registration = {
      commandId,
      detailsDigest,
      assignmentDigest: this.assignmentDigest(assignment),
      firstName,
      lastName,
      phase: ENUMS.ProfileRegistrationPhase.PREPARED.key,
      createdAt: new Date(this.now()).toISOString(),
      passwordCode:
        "registrationPassword_" + this.digest([assignment.code, commandId]),
      employeeCode: session.email,
      scopeCode:
        "registrationScope_" + this.digest([assignment.code, commandId]),
    };
    try {
      return await this.checkpoint(context, assignment, registration, {
        identityClaimed: true,
      });
    } catch (error) {
      const saved = await this.current(context, session, assignment.code);
      if (
        saved.registration &&
        saved.registration.detailsDigest === detailsDigest
      )
        return saved;
      throw error;
    }
  },
  /**
   * Consumes proof once per continuation/operation. Receipt recovery does not grant another operation; the persisted checkpoint controls resumption.
   * @param {Object} context Server-admitted tenant, origin and trusted authorization.
   * @param {Object} session Mutable private continuation, never caller-supplied authority.
   * @param {Object} assignment Authoritative assignment and private checkpoint.
   * @returns {Promise<void>} Records consumption for this operation; a receipt grants no new execution.
   */
  authoriseProvisioning: async function (context, session, assignment) {
    if (
      !session.proof ||
      !Number.isFinite(session.proofExpiresAt) ||
      session.proofExpiresAt <= this.now()
    )
      this.fail("VERIFY_AGAIN");
    const reference = assignment.code + ":" + assignment.registration.commandId;
    const fields = {
      challengeCode: session.challenge.challengeCode,
      generation: session.challenge.generation,
      proof: session.proof,
      operationReference: reference,
    };
    if (session.consumedOperation === reference) return;
    try {
      await this.verifyRpc(context, session, "CONSUME", fields);
    } catch (error) {
      const receipt = await this.verifyRpc(context, session, "RECEIPT", fields);
      if (receipt.executionGranted !== false) throw error;
    }
    session.consumedOperation = reference;
  },
  /**
   * Resumes the same operation by inspecting exact saved artifacts, never by replaying registration wholesale.
   * @param {Object} context Server-admitted tenant, origin and trusted authorization.
   * @param {Object} session Mutable private continuation, never caller-supplied authority.
   * @param {Object} input Untrusted DTO checked against the operation allowlist.
   * @param {Object} assignment Authoritative assignment and private checkpoint.
   * @returns {Promise<Object>} Completed safe progress after owner writes and acknowledgements.
   */
  provision: async function (context, session, input, assignment) {
    let current = await this.current(context, session, assignment.code);
    let r = current.registration;
    if (
      current.status ===
        ENUMS.ProfileEmployeeApplicationStatus.REGISTERED.key &&
      r.phase === ENUMS.ProfileRegistrationPhase.COMPLETE.key
    )
      return this.completed(context, session, current);
    await this.authoriseProvisioning(context, session, current);
    if (administratorProvisioningContexts.has(context)) this.fail("CONFLICT");
    administratorProvisioningContexts.set(context, {
      session,
      assignmentCode: current.code,
      commandId: current.registration.commandId,
    });
    try {
      return await this.provisionOwned(context, session, input, current);
    } finally {
      administratorProvisioningContexts.delete(context);
    }
  },
  /** Runs only an already consumed in-process registration under its immutable checkpoint. @param {Object} context Private provisioning context. @param {Object} session Verified continuation. @param {Object} input Checked profile input. @param {Object} assignment Fresh owner assignment. @returns {Promise<Object>} Safe completed progress. */
  provisionOwned: async function (context, session, input, assignment) {
    if (!administratorProvisioningContexts.has(context)) this.fail("CONFLICT");
    let current = await this.current(context, session, assignment.code),
      r = current.registration;
    const credential = await this.insert(
      "DefaultPasswordService",
      context,
      current.tenantCode,
      {
        code: r.passwordCode,
        loginId: session.email,
        password: input.password,
        active: true,
      },
      { code: r.passwordCode, loginId: session.email, active: true },
    );
    SERVICE.DefaultPasswordSaveInterceptorService.mutationQuery(
      current.tenantCode,
      credential,
    );
    if (
      !credential._id ||
      typeof credential.password !== "string" ||
      typeof UTILS.compareHash !== "function" ||
      !(await UTILS.compareHash(input.password, credential.password))
    )
      this.fail("CREDENTIAL");
    const passwordId = String(credential._id);
    if (r.passwordId && r.passwordId !== passwordId) this.fail("CONFLICT");
    if (!r.passwordId)
      current = await this.checkpoint(context, current, {
        ...r,
        passwordId,
        phase: ENUMS.ProfileRegistrationPhase.CREDENTIAL.key,
      });
    current = await this.current(context, session, current.code);
    r = current.registration;
    let employee = await this.insert(
      "DefaultEmployeeService",
      context,
      current.tenantCode,
      {
        code: r.employeeCode,
        loginId: session.email,
        name: { firstName: r.firstName, lastName: r.lastName },
        password: credential._id,
        principalType: "human",
        userGroups: current.groupCodes,
        active: false,
        registrationAssignmentCode: current.code,
      },
      {
        code: r.employeeCode,
        loginId: session.email,
        principalType: "human",
        registrationAssignmentCode: current.code,
      },
    );
    if (
      String(employee.password) !== passwordId ||
      employee.disabled === true ||
      employee.registrationSuspended === true ||
      this.digest(employee.userGroups) !== this.digest(current.groupCodes)
    )
      this.fail("CONFLICT");
    if (
      employee.active &&
      ![
        ENUMS.ProfileRegistrationPhase.ACTIVATING.key,
        ENUMS.ProfileRegistrationPhase.COMPLETE.key,
      ].includes(r.phase)
    )
      this.fail("CONFLICT");
    const state =
      SERVICE.DefaultUserStateService &&
      (await SERVICE.DefaultUserStateService.findUserState({
        tenant: current.tenantCode,
        loginId: employee.loginId,
        _id: employee._id,
      }));
    if (!state || state.locked) this.fail("ASSIGNMENT");
    current = await this.current(context, session, current.code);
    r = current.registration;
    const scope = {
      code: r.scopeCode,
      principalType: "human",
      principalCode: session.email,
      scopeType: "ENTERPRISE",
      scopeCode: current.enterpriseCode,
      tenantCode: current.tenantCode,
      enterpriseCode: current.enterpriseCode,
      effect: "ALLOW",
      inheritanceMode: "DIRECT",
      status: "ACTIVE",
      reasonCode: "ENTERPRISE_ACCESS_ASSIGNMENT",
      active: true,
    };
    await this.insert(
      "DefaultPrincipalScopeAssignmentService",
      context,
      current.tenantCode,
      scope,
      scope,
    );
    // Re-acknowledge the normal scope update path if an earlier save lost its stamp acknowledgement.
    await this.updateOne(
      "DefaultPrincipalScopeAssignmentService",
      context,
      current.tenantCode,
      this.administratorScopeQuery(scope),
      { status: "ACTIVE" },
    );
    current = await this.current(context, session, current.code);
    r = current.registration;
    employee = await this.read("DefaultEmployeeService", current.tenantCode, {
      code: r.employeeCode,
    });
    if (
      !employee ||
      employee.disabled === true ||
      employee.registrationSuspended === true ||
      employee.registrationAssignmentCode !== current.code
    )
      this.fail("ASSIGNMENT");
    const authVersion = employee.authVersion;
    if (!Number.isSafeInteger(authVersion) || authVersion < 1)
      this.fail("STORAGE");
    if (r.phase !== ENUMS.ProfileRegistrationPhase.ACTIVATING.key)
      current = await this.checkpoint(context, current, {
        ...r,
        phase: ENUMS.ProfileRegistrationPhase.ACTIVATING.key,
      });
    current = await this.current(context, session, current.code);
    r = current.registration;
    await this.updateOne(
      "DefaultEmployeeService",
      context,
      current.tenantCode,
      {
        code: r.employeeCode,
        loginId: session.email,
        registrationAssignmentCode: current.code,
        authVersion,
        active: employee.active,
        registrationSuspended: { $ne: true },
        password: credential._id,
        principalType: "human",
        userGroups: current.groupCodes,
        disabled: { $ne: true },
        authenticationIdentity: { $exists: false },
      },
      { active: true },
    );
    // The session gate below still denies login until this final owner checkpoint succeeds.
    current = await this.current(context, session, current.code);
    r = current.registration;
    current = await this.checkpoint(
      context,
      current,
      {
        ...r,
        phase: ENUMS.ProfileRegistrationPhase.COMPLETE.key,
        completedAt: new Date(this.now()).toISOString(),
      },
      {
        status: ENUMS.ProfileEmployeeApplicationStatus.REGISTERED.key,
        registeredLoginId: session.email,
        registeredAt: new Date(this.now()),
      },
    );
    return this.completed(context, session, current);
  },
  /**
   * Checks the full committed outcome. A status string alone never proves usable access.
   * @param {Object} context Server-admitted tenant, origin and trusted authorization.
   * @param {Object} session Mutable private continuation, never caller-supplied authority.
   * @param {Object} assignment Authoritative assignment and private checkpoint.
   * @returns {Promise<Object>} Completion after credential, assignment and session eligibility checks.
   */
  completed: async function (context, session, assignment) {
    const r = assignment.registration;
    const person = await this.read(
      "DefaultEmployeeService",
      assignment.tenantCode,
      { code: r.employeeCode },
    );
    await this.assertSessionEligible({
      person,
      enterprise: {
        code: assignment.enterpriseCode,
        tenant: { code: assignment.tenantCode },
      },
    });
    const credential = await this.read(
      "DefaultPasswordService",
      assignment.tenantCode,
      { code: r.passwordCode },
    );
    if (credential)
      SERVICE.DefaultPasswordSaveInterceptorService.mutationQuery(
        assignment.tenantCode,
        credential,
      );
    if (
      !credential ||
      credential.active !== true ||
      String(person.password) !== String(credential._id)
    )
      this.fail("STORAGE");
    if (SERVICE.DefaultEnterpriseMembershipService?.enabled())
      await SERVICE.DefaultEnterpriseMembershipService.adoptRegistration(
        context,
        assignment,
        person,
      );
    session.stage = ENUMS.ProfileEmployeeAccessStage.COMPLETE.key;
    session.signInEnterpriseCode = assignment.enterpriseCode;
    delete session.proof;
    delete session.proofExpiresAt;
    session.assignmentCode = assignment.code;
    if (
      (CONFIG.get("enterpriseManagement") || {}).notifications?.enabled === true
    )
      await SERVICE.DefaultEnterpriseNotificationService.request(
        assignment.code,
        "ACCOUNT_READY",
      );
    return this.project(session);
  },
  /**
   * Completes or resumes only a mailbox-verified, administrator-pre-authorised invitation.
   * @param {Object} context Server-admitted tenant, origin and trusted authorization.
   * @param {Object} session Mutable private continuation, never caller-supplied authority.
   * @param {Object} input Untrusted DTO checked against the operation allowlist.
   * @returns {Promise<Object>} Safe progress from the guarded complete/resume operation.
   */
  complete: async function (context, session, input) {
    this.input(input, [
      "continuation",
      "assignmentCode",
      "firstName",
      "lastName",
      "password",
    ]);
    if (session.stage === ENUMS.ProfileEmployeeAccessStage.COMPLETE.key)
      return this.status(context, session);
    if (session.stage === ENUMS.ProfileEmployeeAccessStage.EXISTING_ACCOUNT.key)
      return SERVICE.DefaultEnterpriseMembershipService.completeExisting(
        context,
        session,
        input,
      );
    if (
      ![
        ENUMS.ProfileEmployeeAccessStage.DETAILS.key,
        ENUMS.ProfileEmployeeAccessStage.RECOVERY.key,
      ].includes(session.stage)
    )
      this.fail("CONFLICT");
    await this.rate(context, "complete", session.email);
    const code = session.assignmentCode || input.assignmentCode;
    if (
      typeof code !== "string" ||
      !(session.assignments || []).some((item) => item.code === code)
    )
      this.fail("ASSIGNMENT");
    if (
      session.assignmentCode &&
      input.assignmentCode &&
      input.assignmentCode !== session.assignmentCode
    )
      this.fail("ASSIGNMENT");
    let assignment = await this.current(context, session, code);
    if (
      assignment.status ===
      ENUMS.ProfileEmployeeApplicationStatus.REGISTERED.key
    )
      return this.completed(context, session, assignment);
    if (!session.proof || session.proofExpiresAt <= this.now())
      this.fail("VERIFY_AGAIN");
    assignment = await this.prepare(context, session, input, assignment);
    session.assignmentCode = assignment.code;
    try {
      return await this.provision(context, session, input, assignment);
    } catch (error) {
      session.stage = ENUMS.ProfileEmployeeAccessStage.RECOVERY.key;
      throw error;
    }
  },
  /**
   * Returns progress without performing provisioning or claiming another proof.
   * @param {Object} context Server-admitted tenant, origin and trusted authorization.
   * @param {Object} session Mutable private continuation, never caller-supplied authority.
   * @returns {Promise<Object>} Safe progress without provisioning or another proof consumption.
   */
  status: async function (context, session) {
    if (
      session.membershipIdentity &&
      session.stage === ENUMS.ProfileEmployeeAccessStage.COMPLETE.key
    )
      return SERVICE.DefaultEnterpriseMembershipService.completionStatus(
        session,
      );
    if (
      [
        ENUMS.ProfileEmployeeAccessStage.APPLICATION_DETAILS.key,
        ENUMS.ProfileEmployeeAccessStage.APPLICATION_PENDING.key,
        ENUMS.ProfileEmployeeAccessStage.APPLICATION_APPROVED.key,
        ENUMS.ProfileEmployeeAccessStage.APPLICATION_REJECTED.key,
        ENUMS.ProfileEmployeeAccessStage.APPLICATION_CLOSED.key,
      ].includes(session.stage)
    )
      return SERVICE.DefaultEnterpriseApplicationService.status(
        context,
        session,
      );
    if (session.stage === ENUMS.ProfileEmployeeAccessStage.RESOLVING.key) {
      await this.resolveVerified(context, session);
      return this.project(session);
    }
    if (
      session.assignmentCode &&
      [
        ENUMS.ProfileEmployeeAccessStage.DETAILS.key,
        ENUMS.ProfileEmployeeAccessStage.RECOVERY.key,
        ENUMS.ProfileEmployeeAccessStage.COMPLETE.key,
      ].includes(session.stage)
    ) {
      const assignment = await this.current(
        context,
        session,
        session.assignmentCode,
      );
      if (
        assignment.status ===
          ENUMS.ProfileEmployeeApplicationStatus.REGISTERED.key &&
        assignment.registration &&
        assignment.registration.phase ===
          ENUMS.ProfileRegistrationPhase.COMPLETE.key
      )
        return this.completed(context, session, assignment);
    }
    return this.project(session);
  },
  /**
   * Gates newly provisioned employees through the authoritative assignment at login and refresh. Legacy identities keep their existing policy.
   * @param {Object} options Authentication candidate with person and resolved enterprise.
   * @returns {Promise<void>} Resolves for legacy or fully acknowledged registration; otherwise rejects.
   */
  assertSessionEligible: async function (options) {
    const person = options.person;
    if (!person || !person.registrationAssignmentCode) return;
    const tenant = CONFIG.get("defaultTenant");
    const fresh = await this.read(
      "DefaultEmployeeService",
      options.enterprise.tenant.code,
      {
        code: person.code,
        loginId: person.loginId,
      },
    );
    if (
      !fresh ||
      fresh.active !== true ||
      fresh.disabled === true ||
      fresh.registrationSuspended === true ||
      fresh.principalType !== "human" ||
      person.principalType !== "human" ||
      fresh.registrationAssignmentCode !== person.registrationAssignmentCode ||
      String(fresh.authVersion) !== String(person.authVersion) ||
      String((fresh.password && fresh.password._id) || fresh.password) !==
        String((person.password && person.password._id) || person.password)
    )
      this.fail("ASSIGNMENT");
    const item = await this.read(
      "DefaultEnterpriseAccessAssignmentService",
      tenant,
      {
        code: person.registrationAssignmentCode,
      },
    );
    this.assertAssignment(item, person.loginId, true);
    if (
      !person.active ||
      person.disabled === true ||
      person.registrationSuspended === true ||
      item.status !== ENUMS.ProfileEmployeeApplicationStatus.REGISTERED.key ||
      !item.registration ||
      item.registration.phase !== ENUMS.ProfileRegistrationPhase.COMPLETE.key ||
      item.registeredLoginId !== person.loginId ||
      item.tenantCode !== options.enterprise.tenant.code ||
      item.enterpriseCode !== options.enterprise.code ||
      item.registration.employeeCode !== person.code ||
      String(item.registration.passwordId) !==
        String((person.password && person.password._id) || person.password)
    )
      this.fail("ASSIGNMENT");
    const scope = await this.read(
      "DefaultPrincipalScopeAssignmentService",
      item.tenantCode,
      {
        code: item.registration.scopeCode,
      },
    );
    // Readiness proves the original direct enterprise grant, not merely a
    // matching display code. Normal authorization still owns every API action.
    if (
      !scope ||
      scope.status !== "ACTIVE" ||
      scope.active !== true ||
      scope.effect !== "ALLOW" ||
      scope.principalType !== "human" ||
      scope.scopeType !== "ENTERPRISE" ||
      scope.tenantCode !== item.tenantCode ||
      scope.inheritanceMode !== "DIRECT" ||
      scope.groupCode ||
      scope.principalCode !== person.loginId ||
      scope.enterpriseCode !== item.enterpriseCode ||
      scope.scopeCode !== item.enterpriseCode
    )
      this.fail("ASSIGNMENT");
    const now = this.now();
    if (scope.effectiveFrom !== undefined && scope.effectiveFrom !== null) {
      const from = new Date(scope.effectiveFrom).getTime();
      if (!Number.isFinite(from) || from > now) this.fail("ASSIGNMENT");
    }
    if (scope.effectiveTo !== undefined && scope.effectiveTo !== null) {
      const to = new Date(scope.effectiveTo).getTime();
      if (!Number.isFinite(to) || now >= to) this.fail("ASSIGNMENT");
    }
  },
  /**
   * Exposes business progress only. Proofs, hashes, tenant IDs and checkpoint contents never enter browser responses.
   * @param {Object} session Mutable private continuation, never caller-supplied authority.
   * @returns {Object} Allowlisted progress without credentials, proofs or private checkpoints.
   */
  project: function (session) {
    return {
      contractVersion: SERVICE.DefaultEnterpriseMembershipService?.enabled()
        ? 2
        : 1,
      stage: session.stage,
      email: session.email,
      ...(session.stage === ENUMS.ProfileEmployeeAccessStage.COMPLETE.key
        ? { signInEnterpriseCode: session.signInEnterpriseCode }
        : {}),
      ...(session.stage === ENUMS.ProfileEmployeeAccessStage.SIGN_IN.key &&
      session.challenge.status === "VERIFIED" &&
      session.proof &&
      Number.isFinite(session.proofExpiresAt) &&
      session.proofExpiresAt > this.now() &&
      typeof session.signInEnterpriseCode === "string" &&
      /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(session.signInEnterpriseCode)
        ? { signInEnterpriseCode: session.signInEnterpriseCode }
        : {}),
      ...([
        ENUMS.ProfileEmployeeAccessStage.APPLICATION_DETAILS.key,
        ENUMS.ProfileEmployeeAccessStage.APPLICATION_PENDING.key,
        ENUMS.ProfileEmployeeAccessStage.APPLICATION_APPROVED.key,
        ENUMS.ProfileEmployeeAccessStage.APPLICATION_REJECTED.key,
        ENUMS.ProfileEmployeeAccessStage.APPLICATION_CLOSED.key,
      ].includes(session.stage)
        ? {
            applicationChoices: session.applicationChoices || [],
            applications: session.applications || [],
          }
        : {}),
      codeState: session.challenge.status,
      ...(session.notice ? { notice: session.notice } : {}),
      resendAt: session.challenge.nextIssueAt,
      expiresAt: new Date(session.expiresAt).toISOString(),
      deliveryStatus: session.deliveryStatus,
      ...(session.stage === ENUMS.ProfileEmployeeAccessStage.DETAILS.key ||
      session.stage === ENUMS.ProfileEmployeeAccessStage.RECOVERY.key ||
      session.stage === ENUMS.ProfileEmployeeAccessStage.EXISTING_ACCOUNT.key
        ? {
            assignments: session.assignments,
            selectedAssignment: session.assignmentCode,
          }
        : {}),
    };
  },
  /**
   * Publishes a single declarative Profile-owned journey; no framework identifiers are editable by the user.
   * @returns {Object} Backend-owned declarative presentation, constraints and endpoints.
   */
  workspace: function () {
    const p = this.policy();
    return {
      contractVersion: SERVICE.DefaultEnterpriseMembershipService?.enabled()
        ? 2
        : 1,
      owner: "profile",
      renderer: "axis.enterprise-registration",
      endpoints: p.endpoints,
      presentation: p.presentation,
      constraints: {
        maximumNameLength: p.maximumNameLength,
        minimumPasswordLength: p.minimumPasswordLength,
        maximumPasswordLength: p.maximumPasswordLength,
      },
      method: p.method,
      ...((CONFIG.get("enterpriseManagement") || {}).applications?.enabled ===
      true
        ? {
            applications: {
              ...(CONFIG.get("enterpriseManagement").applications.lifecycle
                ?.qualified === true
                ? {
                    withdrawPath: CONFIG.get("enterpriseManagement")
                      .applications.lifecycle.withdrawPath,
                  }
                : {}),
              submitPath: CONFIG.get("enterpriseManagement").applications
                .submitPath,
              maximumNoteLength: CONFIG.get("enterpriseManagement").applications
                .maximumNoteLength,
              presentation: CONFIG.get("enterpriseManagement").applications
                .presentation,
            },
          }
        : {}),
    };
  },
  /**
   * Dispatches a fixed controller-selected operation after admission; no dynamic service/method names are accepted.
   * @param {Object} request Nodics request validated by the owning entry point.
   * @param {string} operation Fixed controller-selected capability operation.
   * @returns {Promise<Object>} Authorized operation result; errors propagate without implicit retries.
   */
  execute: async function (request, operation) {
    if (
      ![
        ENUMS.ProfileEmployeeAccessOperation.START.key,
        ENUMS.ProfileEmployeeAccessOperation.VERIFY.key,
        ENUMS.ProfileEmployeeAccessOperation.RESEND.key,
        ENUMS.ProfileEmployeeAccessOperation.COMPLETE.key,
        ENUMS.ProfileEmployeeAccessOperation.STATUS.key,
        ENUMS.ProfileEmployeeAccessOperation.APPLY.key,
        ENUMS.ProfileEmployeeAccessOperation.WITHDRAW_APPLICATION.key,
      ].includes(operation)
    )
      this.fail("INPUT");
    const context = await this.context(request, operation),
      input = request.body || {};
    if (operation === ENUMS.ProfileEmployeeAccessOperation.START.key)
      return this.start(context, input);
    this.input(
      input,
      operation === ENUMS.ProfileEmployeeAccessOperation.VERIFY.key
        ? ["continuation", "code"]
        : operation === ENUMS.ProfileEmployeeAccessOperation.COMPLETE.key
          ? [
              "continuation",
              "assignmentCode",
              "firstName",
              "lastName",
              "password",
            ]
          : operation === ENUMS.ProfileEmployeeAccessOperation.APPLY.key
            ? [
                "continuation",
                "enterpriseCode",
                "firstName",
                "lastName",
                "note",
              ]
            : operation ===
                ENUMS.ProfileEmployeeAccessOperation.WITHDRAW_APPLICATION.key
              ? ["continuation", "applicationCode", "expectedRevision"]
              : ["continuation"],
    );
    return this.session(context, input.continuation, (session) => {
      if (operation === ENUMS.ProfileEmployeeAccessOperation.VERIFY.key)
        return this.verify(context, session, input);
      if (operation === ENUMS.ProfileEmployeeAccessOperation.RESEND.key)
        return this.resend(context, session, input);
      if (operation === ENUMS.ProfileEmployeeAccessOperation.COMPLETE.key)
        return this.complete(context, session, input);
      if (operation === ENUMS.ProfileEmployeeAccessOperation.APPLY.key)
        return SERVICE.DefaultEnterpriseApplicationService.apply(
          context,
          session,
          input,
        );
      if (
        operation ===
        ENUMS.ProfileEmployeeAccessOperation.WITHDRAW_APPLICATION.key
      )
        return SERVICE.DefaultEnterpriseApplicationService.withdraw(
          context,
          session,
          input,
        );
      return this.status(context, session);
    });
  },
};
