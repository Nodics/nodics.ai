/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/**
 * @module profile/service/enterprise/DefaultEnterpriseApplicationReviewService
 * @description Correlates existing employee applications with Process-owned review
 * and authoritative decisions. Uses only existing generated services and transport.
 * @layer service
 * @owner profile
 * @sideEffects Conditionally writes assignment review evidence, starts/claims Process
 * work and requests Communication intents. Never creates identity or credentials.
 * @throws {CLASSES.NodicsError} ERR_PROFILE_APP_REVIEW or owner failures;
 * notification uncertainty does not undo or repeat an authoritative decision.
 * @override Tighten policy or transport through later layers while preserving
 * source correlation, single-claim decisions, no-self-review and no credential writes.
 */
module.exports = {
  /**
   * Returns the canonical registration persistence and digest owner.
   * @returns {Object} Effective loader-merged registration owner rather than a copied implementation.
   */
  base: function () {
    return SERVICE.DefaultEnterpriseRegistrationService;
  },
  /**
   * Raises a stable, redacted application-review error.
   * @returns {never} Throws the stable redacted owner error.
   */
  fail: function () {
    throw new CLASSES.NodicsError("ERR_PROFILE_APP_REVIEW");
  },
  /**
   * Reads one application in Profile's authority partition, without item caching.
   * @param {string} code Exact opaque application assignment code.
   * @returns {Promise<Object|undefined>} Exact uncached record; ambiguity and transport failure reject.
   */
  read: function (code) {
    return this.base().read(
      "DefaultEnterpriseAccessAssignmentService",
      CONFIG.get("defaultTenant"),
      { code },
    );
  },
  /**
   * Resolves a reviewed attempt from bounded immutable source history, never a browser workflow identifier.
   * @param {Object} record Fresh authoritative assignment.
   * @param {number} [attempt] Reviewed attempt number; absent selects the current attempt.
   * @returns {Object} Exact attempt snapshot retaining its original revision and correlation.
   */
  retirementAttempt: function (record, attempt) {
    const history = record?.application?.history || [];
    if (
      record?.origin !== "SELF_APPLICATION" ||
      record.active !== true ||
      !Array.isArray(history) ||
      history.length >= 20 ||
      Buffer.byteLength(JSON.stringify(history)) > 262144 ||
      (attempt !== undefined &&
        (!Number.isSafeInteger(attempt) || attempt < 1 || attempt > 20))
    )
      this.fail();
    const currentAttempt = record.application.attempt || 1;
    const selected = attempt === undefined ? currentAttempt : attempt;
    const matches = history.filter(
      (item) => (item.application?.attempt || 1) === selected,
    );
    if (selected === currentAttempt)
      matches.push({
        application: record.application,
        status: record.status,
        revision: record.revision,
      });
    if (matches.length !== 1) this.fail();
    const item = matches[0],
      application = item.application;
    if (
      !["WITHDRAWN", "EXPIRED"].includes(item.status) ||
      !/^[a-f0-9]{64}$/.test(application?.requestHash || "") ||
      !Number.isSafeInteger(application.closedFromRevision) ||
      item.revision !== application.closedFromRevision + 1 ||
      !Number.isFinite(Date.parse(application.closedAt)) ||
      (selected !== currentAttempt && selected >= currentAttempt)
    )
      this.fail();
    return {
      ...record,
      status: item.status,
      revision: item.revision,
      application,
    };
  },
  /**
   * Reconciles the exact closed attempt with Process without reopening domain access.
   * @param {Object} record Authoritative assignment at the reviewed revision.
   * @param {number} [attempt] Stored closed attempt number, never a caller-supplied Process identity.
   * @returns {Promise<Object>} Disabled, not-started, retired or unconfirmed reconciliation outcome.
   * @override Preserve fresh source reads and single-attempt scoped transport; never cancel by browser task code.
   */
  retireClosedReview: async function (record, attempt) {
    const policy = (CONFIG.get("enterpriseManagement") || {}).applications
      ?.review;
    if (policy?.retirementQualified !== true) return { status: "DISABLED" };
    const p = this.settings();
    const fresh = await this.read(record.code);
    if (
      fresh?.revision !== record.revision ||
      fresh.application?.requestHash !== record.application?.requestHash
    )
      this.fail();
    const current = this.retirementAttempt(fresh, attempt);
    const application = current.application;
    const review = application.review;
    if (!review) return { status: "NOT_STARTED" };
    const expected = this.correlation(current);
    if (Object.entries(expected).some(([key, value]) => review[key] !== value))
      this.fail();
    const closureCode =
      "applicationClosure_" +
      require("node:crypto")
        .createHash("sha256")
        .update(
          JSON.stringify([
            current.code,
            application.requestHash,
            current.status,
            application.closedFromRevision,
          ]),
        )
        .digest("hex");
    try {
      const response = this.result(
        await SERVICE.DefaultModuleService.invokeModule({
          local: false,
          moduleName: "workflow",
          connectionName: p.connectionName,
          connectionType: "abstract",
          targetAuthority: { runtimeRole: "PROCESS" },
          tenant: current.tenantCode,
          header: { "X-Enterprise-Code": current.enterpriseCode },
          apiName: "/internal/instances/retire-review",
          methodName: "POST",
          requestBody: {
            sourceModule: "profile",
            instanceCode: expected.instanceCode,
            closureCode,
            context: {
              applicationCode: current.code,
              requestHash: application.requestHash,
              enterpriseCode: current.enterpriseCode,
              requestedBy: current.normalizedEmail,
            },
          },
          timeoutMs: p.timeoutMilliseconds,
          maxResponseBytes: 16384,
          maxAttempts: 1,
          followRedirects: false,
          requireInternalAuth: true,
        }),
      );
      if (
        response.instanceCode !== expected.instanceCode ||
        !["RETIRED", "DECISION_IN_PROGRESS"].includes(response.status)
      )
        this.fail();
      const observed = await this.read(record.code);
      const retained = this.retirementAttempt(
        observed,
        application.attempt || 1,
      );
      if (
        !require("node:util").isDeepStrictEqual(
          retained.application,
          application,
        ) ||
        retained.status !== current.status ||
        retained.revision !== current.revision
      )
        this.fail();
      return { status: response.status, attempt: application.attempt || 1 };
    } catch (error) {
      // Domain closure is already committed; transport uncertainty cannot undo it.
      return { status: "UNCONFIRMED" };
    }
  },
  /**
   * Validates the opt-in Process connection and pinned definition selection.
   * @returns {Object} Validated opt-in Process connection, version and permission policy.
   */
  settings: function () {
    const p = (CONFIG.get("enterpriseManagement") || {}).applications?.review;
    if (
      !p ||
      p.enabled !== true ||
      !/^[A-Za-z][A-Za-z0-9_.-]{0,127}$/.test(p.connectionName || "") ||
      p.connectionName === "default" ||
      !/^[A-Za-z][A-Za-z0-9_.-]{0,127}$/.test(p.definitionCode || "") ||
      typeof p.callbackPermission !== "string" ||
      !p.callbackPermission ||
      typeof p.decisionPermission !== "string" ||
      !p.decisionPermission ||
      !Number.isSafeInteger(p.definitionVersion) ||
      p.definitionVersion < 1 ||
      !Number.isSafeInteger(p.timeoutMilliseconds) ||
      p.timeoutMilliseconds < 1 ||
      p.timeoutMilliseconds > 60000
    )
      this.fail();
    return p;
  },
  /**
   * Checks immutable application details and current enterprise policy before review writes.
   * @param {Object} record Authoritative application with submitted/review evidence.
   * @returns {Promise<Object>} Fresh enterprise/tenant after immutable application-policy validation.
   */
  assertSource: async function (record) {
    const management = SERVICE.DefaultEnterpriseManagementService,
      intake = SERVICE.DefaultEnterpriseApplicationService;
    const a = record && record.application;
    if (
      !record ||
      record.origin !== "SELF_APPLICATION" ||
      record.active !== true ||
      !a ||
      ![
        ENUMS.ProfileEmployeeApplicationStatus.AWAITING_REVIEW.key,
        ENUMS.ProfileEmployeeApplicationStatus.APPROVED.key,
        ENUMS.ProfileEmployeeApplicationStatus.REJECTED.key,
      ].includes(record.status) ||
      !Number.isSafeInteger(record.revision) ||
      record.revision < 1 ||
      record.registration ||
      record.identityClaimed ||
      typeof record.normalizedEmail !== "string" ||
      record.email !== record.normalizedEmail ||
      record.code !==
        management.assignmentCode(
          record.enterpriseCode,
          record.normalizedEmail,
        ) ||
      !Number.isFinite(Date.parse(a.submittedAt)) ||
      a.requestHash !==
        this.base().digest([
          record.code,
          a.policyDigest,
          {
            firstName: a.firstName,
            lastName: a.lastName,
            note: a.note,
          },
          ...(a.attempt > 1 ? [a.attempt] : []),
        ])
    )
      this.fail();
    const target = await management.retrieveEnterpriseForAccess(
      record.enterpriseCode,
    );
    const policy = intake.enterprisePolicy(target.enterprise);
    if (
      !policy ||
      target.tenantCode !== record.tenantCode ||
      policy.digest !== a.policyDigest ||
      record.roleCode !== policy.roleCode ||
      record.scopeType !== "ENTERPRISE" ||
      record.scopeCode !== record.enterpriseCode ||
      this.base().digest(record.groupCodes) !==
        this.base().digest(policy.groupCodes)
    )
      this.fail();
    return target;
  },
  /**
   * Correlates one immutable application with a deterministic existing Process instance.
   * @param {Object} record Authoritative application with submitted/review evidence.
   * @returns {Object} Deterministic Process identity preserving an existing pinned definition/version.
   */
  correlation: function (record) {
    const p = this.settings(),
      saved = record.application.review;
    const definitionCode = saved ? saved.definitionCode : p.definitionCode;
    const version = saved ? saved.version : p.definitionVersion;
    if (
      !/^[A-Za-z][A-Za-z0-9_.-]{0,127}$/.test(definitionCode || "") ||
      !Number.isSafeInteger(version) ||
      version < 1
    )
      this.fail();
    const hash = this.base().digest([
      record.code,
      record.application.requestHash,
      definitionCode,
      version,
    ]);
    return {
      instanceCode: "employeeApplicationReview_" + hash,
      definitionCode,
      version,
      requestHash: record.application.requestHash,
      enterpriseCode: record.enterpriseCode,
      tenantCode: record.tenantCode,
    };
  },
  /**
   * Persists correlation/decision through managed concurrency and exact own-write readback.
   * @param {Object} record Authoritative application with submitted/review evidence.
   * @param {Object} review Stored correlation and current decision/notification evidence.
   * @param {Object} [patch] Owner-built conditional-update fields.
   * @returns {Promise<Object>} Exact saved revision after managed concurrency and own-write readback.
   */
  change: async function (record, review, patch = {}) {
    const mutation = require("node:crypto").randomBytes(32).toString("hex");
    const application = {
      ...record.application,
      review: { ...review, mutation },
    };
    let failure;
    try {
      const result = await SERVICE.DefaultEnterpriseApplicationService.write(
        "update",
        {
          tenant: CONFIG.get("defaultTenant"),
          authData:
            SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
          query: {
            code: record.code,
            revision: record.revision,
            status: record.status,
            active: true,
            origin: "SELF_APPLICATION",
            "application.requestHash": record.application.requestHash,
          },
          model: { ...patch, revision: record.revision, application },
          options: { recursive: false },
        },
      );
      this.base().assertWrite(result);
      if (result.result?.matchedCount !== 1) this.fail();
    } catch (error) {
      failure = error;
    }
    const saved = await this.read(record.code);
    if (
      !saved ||
      saved.revision !== record.revision + 1 ||
      saved.application?.review?.mutation !== mutation ||
      saved.status !== (patch.status || record.status) ||
      saved.application.requestHash !== record.application.requestHash ||
      saved.active !== true
    ) {
      if (failure) throw failure;
      this.fail();
    }
    return saved;
  },
  /**
   * Unwraps bounded, successful module replies without accepting an error envelope as data.
   * @param {Object} response Generated-service or transport envelope to validate.
   * @returns {Object} Successful bounded transport payload; error/ambiguous envelopes throw.
   */
  result: function (response) {
    let value = response;
    for (let depth = 0; depth < 4; depth++) {
      if (
        !value ||
        typeof value !== "object" ||
        Array.isArray(value) ||
        value.success === false ||
        value.error ||
        /^ERR_/.test(value.code || "") ||
        (value.errors && (!Array.isArray(value.errors) || value.errors.length))
      )
        this.fail();
      if (!Object.hasOwn(value, "data") && !Object.hasOwn(value, "result"))
        return value;
      if (Object.hasOwn(value, "data") === Object.hasOwn(value, "result"))
        this.fail();
      value = Object.hasOwn(value, "data") ? value.data : value.result;
    }
    this.fail();
  },
  /**
   * Starts/reconciles only the exact review of a mailbox-proven submitted application.
   * @param {Object} context Existing server-admitted registration context.
   * @param {Object} session Existing fresh verified continuation.
   * @param {Object} record Existing application; refreshed before each write.
   * @returns {Promise<Object>} Saved application with confirmed start correlation.
   * @throws {Error} Unconfirmed start; caller retains the submitted application.
   */
  start: async function (context, session, record) {
    SERVICE.DefaultEnterpriseApplicationService.assertVerified(
      context,
      session,
    );
    if (record.normalizedEmail !== session.email) this.fail();
    return this.resumeStart(record);
  },
  /**
   * Reconciles a persisted review after verified intake or an authorised operator retry.
   * @param {Object} record Private Profile application, never request-body state.
   * @returns {Promise<Object>} Current application with an acknowledged Process start.
   * @throws {Error} Conflicting or incomplete Process start; never creates a second review.
   */
  resumeStart: async function (record) {
    const p = this.settings();
    let current = await this.read(record.code);
    await this.assertSource(current);
    if (
      current.normalizedEmail !== record.normalizedEmail ||
      current.status !==
        ENUMS.ProfileEmployeeApplicationStatus.AWAITING_REVIEW.key
    )
      this.fail();
    const expected = this.correlation(current);
    if (current.application.review) {
      if (
        Object.entries(expected).some(
          ([key, value]) => current.application.review[key] !== value,
        )
      )
        this.fail();
      if (current.application.review.started === true) return current;
    } else
      current = await this.change(current, {
        ...expected,
        started: false,
      });
    await this.assertSource(current);
    const response = this.result(
      await SERVICE.DefaultModuleService.invokeModule({
        local: false,
        moduleName: "workflow",
        connectionName: p.connectionName,
        connectionType: "abstract",
        targetAuthority: { runtimeRole: "PROCESS" },
        tenant: current.tenantCode,
        header: { "X-Enterprise-Code": current.enterpriseCode },
        apiName: "/internal/instances",
        methodName: "POST",
        requestBody: {
          sourceModule: "profile",
          definitionCode: expected.definitionCode,
          version: expected.version,
          instanceCode: expected.instanceCode,
          context: {
            applicationCode: current.code,
            requestHash: current.application.requestHash,
            enterpriseCode: current.enterpriseCode,
            requestedBy: current.normalizedEmail,
          },
        },
        timeoutMs: p.timeoutMilliseconds,
        maxResponseBytes: 16384,
        maxAttempts: 1,
        followRedirects: false,
        requireInternalAuth: true,
      }),
    );
    const instance = response.instance;
    if (
      !instance ||
      instance.code !== expected.instanceCode ||
      instance.definitionCode !== expected.definitionCode ||
      instance.version !== expected.version ||
      instance.startCompleted !== true ||
      instance.context?.applicationCode !== current.code ||
      instance.context.requestHash !== expected.requestHash ||
      instance.context.enterpriseCode !== current.enterpriseCode ||
      instance.context.requestedBy !== current.normalizedEmail
    )
      this.fail();
    current = await this.read(current.code);
    if (current?.application?.requestHash !== expected.requestHash) {
      const historical = current?.application?.history?.filter(
        (item) => item.application?.requestHash === expected.requestHash,
      );
      if (
        historical?.length !== 1 ||
        !["WITHDRAWN", "EXPIRED"].includes(historical[0].status)
      )
        this.fail();
      const prior = this.retirementAttempt(
        current,
        historical[0].application.attempt || 1,
      );
      if (
        Object.entries(expected).some(
          ([key, value]) => prior.application.review?.[key] !== value,
        )
      )
        this.fail();
      await SERVICE.DefaultEnterpriseApplicationService.reconcileClosedReview(
        current,
        prior.application.attempt || 1,
      );
      return current;
    }
    if (
      ["WITHDRAWN", "EXPIRED"].includes(current?.status) &&
      current.application?.requestHash === expected.requestHash
    ) {
      await SERVICE.DefaultEnterpriseApplicationService.reconcileClosedReview(
        current,
      );
      return current;
    }
    await this.assertSource(current);
    if (
      current.status !==
        ENUMS.ProfileEmployeeApplicationStatus.AWAITING_REVIEW.key ||
      Object.entries(expected).some(
        ([key, value]) => current.application.review?.[key] !== value,
      )
    )
      this.fail();
    if (current.application.review.started === true) return current;
    return this.change(current, {
      ...current.application.review,
      started: true,
    });
  },
  /**
   * Claims one Process-authored completed-task decision; HTTP input contains identifiers only.
   * @param {Object} request Nodics request validated by the owning entry point.
   * @returns {Promise<Object>} Single-claimed Process decision context, never caller-supplied decisions.
   */
  claim: async function (request) {
    const p = this.settings();
    const auth = SERVICE.DefaultServiceTokenService.requireRuntimePrincipal(
      request,
      "workflow",
    );
    SERVICE.DefaultServiceTokenService.requireRuntimePrincipal(
      request,
      "profile",
    );
    if (
      auth.principalType !== "service" ||
      !Array.isArray(auth.permissions) ||
      !auth.permissions.includes(p.callbackPermission)
    )
      this.fail();
    const input = request.httpRequest?.body || request.body || {};
    if (
      !input ||
      typeof input !== "object" ||
      Array.isArray(input) ||
      Object.keys(input).length !== 2 ||
      Object.keys(input).some(
        (key) => !["instanceCode", "executionCode"].includes(key),
      ) ||
      !/^employeeApplicationReview_[a-f0-9]{64}$/.test(
        input.instanceCode || "",
      ) ||
      !/^[a-f0-9-]{36}$/.test(input.executionCode || "")
    )
      this.fail();
    const execution = this.result(
      await SERVICE.DefaultModuleService.invokeModule({
        local: false,
        moduleName: "workflow",
        connectionName: p.connectionName,
        connectionType: "abstract",
        targetAuthority: { runtimeRole: "PROCESS" },
        tenant: request.tenant,
        header: { "X-Enterprise-Code": auth.entCode },
        apiName:
          "/instances/" +
          encodeURIComponent(input.instanceCode) +
          "/actions/claim",
        methodName: "POST",
        requestBody: {
          executionCode: input.executionCode,
          actionKey: "profile.applyEmployeeApplicationDecision",
          sourceRuntimeInstanceId: auth.runtimeInstanceId,
        },
        timeoutMs: p.timeoutMilliseconds,
        maxResponseBytes: 16384,
        maxAttempts: 1,
        followRedirects: false,
        requireInternalAuth: true,
      }),
    );
    if (
      execution.instance?.code !== input.instanceCode ||
      execution.executionCode !== input.executionCode ||
      execution.nodeCode !== "applyDecision" ||
      typeof execution.taskCode !== "string" ||
      !execution.taskCode ||
      typeof execution.actor !== "string" ||
      !execution.actor
    )
      this.fail();
    return execution;
  },
  /**
   * Rechecks the recorded reviewer's live account, permission and enterprise scope before approval.
   * @param {Object} record Authoritative application with submitted/review evidence.
   * @param {string} actor Process-recorded human reviewer login, never supplied by applicant input.
   * @returns {Promise<void>} Resolves only for a current enabled non-self reviewer with live permission and scope.
   */
  assertReviewer: async function (record, actor) {
    const p = this.settings(),
      router = SERVICE.DefaultSecuredRequestPipelineService;
    if (actor.trim().toLowerCase() === record.normalizedEmail || !router)
      this.fail();
    const response = await SERVICE.DefaultEmployeeService.get({
      tenant: record.tenantCode,
      authData: SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
      query: { loginId: actor },
      options: { recursive: true, skipItemCache: true },
      searchOptions: { pageSize: 2, pageNumber: 1 },
    });
    const rows = this.base().rows(response),
      person = rows[0];
    if (
      rows.length !== 1 ||
      person.loginId !== actor ||
      person.principalType !== "human" ||
      person.active !== true ||
      person.disabled === true ||
      person.registrationSuspended === true
    )
      this.fail();
    const state = await SERVICE.DefaultUserStateService.findUserState({
      tenant: record.tenantCode,
      loginId: actor,
      _id: person._id,
    });
    if (!state || state.locked !== false) this.fail();
    // This is a permission projection of a fresh owner record, not a new token or authenticated request.
    const view = {
      principalType: "human",
      loginId: actor,
      entCode: record.enterpriseCode,
      tenant: record.tenantCode,
      userGroups: person.userGroups || [],
    };
    if (
      !router.isPermissionGranted(
        p.decisionPermission,
        router.getGrantedPermissions({ authData: view }),
        router.getRouteActionAuthorizationConfig(),
      )
    )
      this.fail();
    const groups =
      SERVICE.DefaultAuthenticationProviderService.resolveSessionUserGroups(
        person,
      );
    const scopes =
      await SERVICE.DefaultPrincipalScopeGovernanceService.getEffectiveScopes({
        tenant: record.tenantCode,
        authData: { ...view, userGroups: groups },
      });
    if (
      !scopes ||
      !Array.isArray(scopes.scopes) ||
      !Array.isArray(scopes.deniedScopes)
    )
      this.fail();
    const relevant = (scope) =>
      (scope.scopeType === "ENTERPRISE" &&
        scope.scopeCode === record.enterpriseCode) ||
      scope.scopeType === "GLOBAL" ||
      (scope.scopeType === "TENANT" && scope.scopeCode === record.tenantCode);
    if (
      scopes.deniedScopes.some(
        (scope) =>
          relevant(scope) &&
          (!scope.permissionCode ||
            router.isPermissionGranted(
              p.decisionPermission,
              [scope.permissionCode],
              router.getRouteActionAuthorizationConfig(),
            )),
      )
    )
      this.fail();
    const platform =
      SERVICE.DefaultEnterpriseManagementService.isPlatformAdministrator({
        ...view,
        userGroups: groups,
      });
    if (
      !platform &&
      !scopes.scopes.some(
        (scope) =>
          scope.scopeType === "ENTERPRISE" &&
          scope.scopeCode === record.enterpriseCode &&
          scope.enterpriseCode === record.enterpriseCode &&
          scope.tenantCode === record.tenantCode &&
          (!scope.capabilityCode || scope.capabilityCode === "profile") &&
          (!scope.permissionCode ||
            router.isPermissionGranted(
              p.decisionPermission,
              [scope.permissionCode],
              router.getRouteActionAuthorizationConfig(),
            )),
      )
    )
      this.fail();
  },
  /**
   * Applies only a successfully claimed, source-correlated Process decision.
   * @param {Object} request Verified Process service callback with two opaque handles.
   * @returns {Promise<Object>} Idempotent application outcome; no employee or credential is created.
   * @throws {Error} Wrong source, reviewer, decision, current policy or competing write.
   */
  applyDecision: async function (request) {
    const execution = await this.claim(request),
      instance = execution.instance,
      context = instance.context || {};
    const decision = execution.body && execution.body.decision;
    if (
      !context.applicationCode ||
      !/^[a-f0-9]{64}$/.test(context.requestHash || "") ||
      !decision ||
      typeof decision !== "object" ||
      Array.isArray(decision) ||
      typeof decision.approved !== "boolean" ||
      Object.keys(decision).some(
        (key) => !["approved", "reason"].includes(key),
      ) ||
      (decision.reason !== undefined &&
        (typeof decision.reason !== "string" ||
          decision.reason.length > 1000)) ||
      (decision.approved === false && !decision.reason?.trim())
    )
      this.fail();
    let record = await this.read(context.applicationCode);
    // A new attempt never consumes the old Process instance's decision.
    const historical = record?.application?.history?.filter(
      (item) => item.application?.requestHash === context.requestHash,
    );
    if (historical?.length > 1) this.fail();
    const superseded = record?.application?.requestHash !== context.requestHash;
    if (superseded && historical?.length === 1)
      record = {
        ...record,
        application: historical[0].application,
        status: historical[0].status,
        revision: historical[0].revision,
      };
    const review = record?.application?.review;
    if (
      !record ||
      !review ||
      record.origin !== "SELF_APPLICATION" ||
      record.application.requestHash !== context.requestHash ||
      review.instanceCode !== instance.code ||
      review.definitionCode !== instance.definitionCode ||
      review.version !== instance.version ||
      review.requestHash !== context.requestHash ||
      review.enterpriseCode !== record.enterpriseCode ||
      review.tenantCode !== record.tenantCode ||
      request.tenant !== record.tenantCode ||
      request.authData.entCode !== record.enterpriseCode ||
      context.enterpriseCode !== record.enterpriseCode ||
      context.requestedBy !== record.normalizedEmail ||
      execution.actor.trim().toLowerCase() === record.normalizedEmail
    )
      this.fail();
    if (!superseded)
      record = await SERVICE.DefaultEnterpriseApplicationService.expire(
        {
          tenant: CONFIG.get("defaultTenant"),
          authData:
            SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
        },
        record,
      );
    if (
      ["WITHDRAWN", "EXPIRED"].includes(record.status) ||
      (superseded && record.status === "REJECTED")
    )
      return {
        status: "COMPLETED",
        output: {
          applicationCode: record.code,
          decision: record.status,
          registrationRequired: false,
          superseded,
        },
      };
    const reason = (decision.reason || "").trim();
    const decisionHash = this.base().digest([
      context.requestHash,
      execution.taskCode,
      execution.actor,
      decision.approved,
      reason,
    ]);
    if (review.decisionHash) {
      if (review.decisionHash !== decisionHash) this.fail();
      this.assertDecisionRecord(record);
      const notification = await this.requestNotification(record);
      return {
        status: "COMPLETED",
        output: {
          applicationCode: record.code,
          decision: review.decision.approved
            ? ENUMS.ProfileEmployeeApplicationStatus.APPROVED.key
            : ENUMS.ProfileEmployeeApplicationStatus.REJECTED.key,
          replay: true,
          notification,
        },
      };
    }
    await this.assertSource(record);
    if (
      record.status !==
      ENUMS.ProfileEmployeeApplicationStatus.AWAITING_REVIEW.key
    )
      this.fail();
    await this.assertReviewer(record, execution.actor);
    const days = (CONFIG.get("enterpriseManagement") || {}).accessAssignments
      ?.defaultExpiryDays;
    if (!Number.isSafeInteger(days) || days < 1 || days > 365) this.fail();
    const at = this.base().now();
    record = await this.change(
      record,
      {
        ...review,
        started: true,
        decisionHash,
        decision: {
          approved: decision.approved,
          actor: execution.actor,
          reason,
          taskCode: execution.taskCode,
          decidedAt: new Date(at).toISOString(),
        },
      },
      {
        status: decision.approved
          ? ENUMS.ProfileEmployeeApplicationStatus.APPROVED.key
          : ENUMS.ProfileEmployeeApplicationStatus.REJECTED.key,
        expiresAt: new Date(at + days * 86400000).toISOString(),
      },
    );
    const notification = await this.requestNotification(record);
    return {
      status: "COMPLETED",
      output: {
        applicationCode: record.code,
        decision: decision.approved
          ? ENUMS.ProfileEmployeeApplicationStatus.APPROVED.key
          : ENUMS.ProfileEmployeeApplicationStatus.REJECTED.key,
        registrationRequired: decision.approved,
        notification,
      },
    };
  },
  /**
   * Validates immutable decision evidence without reinterpreting later intake settings.
   * @param {Object} record Authoritative private assignment, including its saved review.
   * @returns {Object} Recorded decision; this validation grants no account or membership.
   * @throws {Error} Altered identity, decision, correlation or lifecycle evidence.
   */
  assertDecisionRecord: function (record) {
    const a = record && record.application,
      r = a && a.review,
      d = r && r.decision;
    if (
      !record ||
      record.origin !== "SELF_APPLICATION" ||
      record.active !== true ||
      ![
        ENUMS.ProfileEmployeeApplicationStatus.APPROVED.key,
        ENUMS.ProfileEmployeeApplicationStatus.REJECTED.key,
        ENUMS.ProfileEmployeeApplicationStatus.REGISTERED.key,
      ].includes(record.status) ||
      !a ||
      !r ||
      !d ||
      typeof d.approved !== "boolean" ||
      typeof d.reason !== "string" ||
      typeof d.actor !== "string" ||
      !d.actor ||
      d.actor.trim().toLowerCase() === record.normalizedEmail ||
      typeof d.taskCode !== "string" ||
      !d.taskCode ||
      !Number.isFinite(Date.parse(d.decidedAt)) ||
      !Number.isSafeInteger(r.version) ||
      r.version < 1 ||
      r.started !== true ||
      r.requestHash !== a.requestHash ||
      r.enterpriseCode !== record.enterpriseCode ||
      r.tenantCode !== record.tenantCode ||
      (d.approved
        ? ![
            ENUMS.ProfileEmployeeApplicationStatus.APPROVED.key,
            ENUMS.ProfileEmployeeApplicationStatus.REGISTERED.key,
          ].includes(record.status)
        : record.status !==
          ENUMS.ProfileEmployeeApplicationStatus.REJECTED.key) ||
      (!d.approved && !d.reason.trim()) ||
      record.code !==
        SERVICE.DefaultEnterpriseManagementService.assignmentCode(
          record.enterpriseCode,
          record.normalizedEmail,
        ) ||
      a.requestHash !==
        this.base().digest([
          record.code,
          a.policyDigest,
          {
            firstName: a.firstName,
            lastName: a.lastName,
            note: a.note,
          },
          ...(a.attempt > 1 ? [a.attempt] : []),
        ]) ||
      r.instanceCode !==
        "employeeApplicationReview_" +
          this.base().digest([
            record.code,
            a.requestHash,
            r.definitionCode,
            r.version,
          ]) ||
      r.decisionHash !==
        this.base().digest([
          a.requestHash,
          d.taskCode,
          d.actor,
          d.approved,
          d.reason,
        ])
    )
      this.fail();
    return d;
  },
  /**
   * Records a Communication request separately from the completed approval decision.
   * @param {Object} record Saved application decision, refreshed before changes.
   * @returns {Promise<string>} Recorded provider-neutral progress, never an inbox claim.
   * @throws {Error} No error reverses the domain decision; unconfirmed delivery is returned.
   */
  requestNotification: async function (record) {
    try {
      let current = await this.read(record.code);
      const decision = this.assertDecisionRecord(current),
        review = current.application.review;
      if (
        review.notification &&
        typeof review.notification.intentCode === "string"
      ) {
        if (
          !/^COMM_[a-f0-9]{64}$/.test(review.notification.intentCode) ||
          ![
            "ACCEPTED",
            "QUEUED",
            "DELIVERING",
            "DELIVERED",
            "RETRY_PENDING",
            "UNCERTAIN",
            "SUPPRESSED",
          ].includes(review.notification.status)
        )
          this.fail();
        return review.notification.status;
      }
      if (
        current.status === ENUMS.ProfileEmployeeApplicationStatus.REGISTERED.key
      )
        return (
          review.notification?.status ||
          ENUMS.ProfileEmployeeNotificationStatus.NOT_REQUESTED.key
        );
      const mail = this.settings().mail;
      if (!mail || mail.enabled !== true)
        return ENUMS.ProfileEmployeeNotificationStatus.NOT_REQUESTED.key;
      let message = review.notification?.message;
      if (!message) {
        message = {
          templateCode: mail.templateCode,
          purpose: mail.purpose,
          locale: mail.locale,
          variables: {
            enterpriseName: current.application.enterpriseName,
            decision: decision.approved
              ? ENUMS.ProfileEmployeeApplicationStatus.APPROVED.key
              : ENUMS.ProfileEmployeeApplicationStatus.REJECTED.key,
            decidedAt: decision.decidedAt,
            nextStep: decision.approved
              ? mail.approvedNextStep
              : mail.rejectedNextStep,
          },
        };
        if (
          ["templateCode", "purpose", "locale"].some(
            (key) => typeof message[key] !== "string" || !message[key],
          ) ||
          Object.values(message.variables).some(
            (value) =>
              typeof value !== "string" || !value || value.length > 2000,
          )
        )
          this.fail();
        current = await this.change(current, {
          ...review,
          notification: { message, status: "PENDING" },
        });
      }
      const outcome = await this.notify(current, message);
      current = await this.read(current.code);
      this.assertDecisionRecord(current);
      if (
        current.application.review.decisionHash !== review.decisionHash ||
        this.base().digest(current.application.review.notification?.message) !==
          this.base().digest(message)
      )
        this.fail();
      if (current.application.review.notification.intentCode)
        return current.application.review.notification.status;
      await this.change(current, {
        ...current.application.review,
        notification: {
          ...current.application.review.notification,
          ...outcome,
          requestedAt: new Date(this.base().now()).toISOString(),
        },
      });
      return outcome.status;
    } catch (_) {
      return ENUMS.ProfileEmployeeNotificationStatus.UNCONFIRMED.key;
    }
  },
  /**
   * Requests the same frozen message using the existing Communication idempotency key.
   * @param {Object} record Authoritative decision record; recipient is never caller-supplied.
   * @param {Object} message Persisted non-secret template and variable snapshot.
   * @returns {Promise<Object>} Intent identity and provider-neutral progress.
   * @throws {Error} Unconfirmed intent. Direct SMTP and speculative send retries are prohibited.
   */
  notify: async function (record, message) {
    const mail = this.settings().mail;
    if (
      !mail ||
      mail.enabled !== true ||
      !/^[A-Za-z][A-Za-z0-9_.-]{0,127}$/.test(mail.connectionName || "")
    )
      this.fail();
    this.assertDecisionRecord(record);
    const response = this.result(
      await SERVICE.DefaultEnterpriseManagementService.invokePrivateCommunication(
        {
          local: false,
          moduleName: "commsApi",
          connectionName: mail.connectionName,
          tenant: CONFIG.get("defaultTenant"),
          header: {
            "X-Enterprise-Code": CONFIG.get("defaultEnterprise"),
          },
          apiName: "/internal/communications",
          methodName: "POST",
          requestBody: {
            sourceModule: "profile",
            sourceType: "EMPLOYEE_APPLICATION",
            sourceCode: record.code,
            templateCode: message.templateCode,
            purpose: message.purpose,
            channel: "EMAIL",
            locale: message.locale,
            recipientId:
              "application:" + this.base().digest(record.normalizedEmail),
            recipientAddressReference: record.normalizedEmail,
            variables: message.variables,
            idempotencyKey:
              "application-decision:" + record.application.review.decisionHash,
          },
          timeoutMs: this.settings().timeoutMilliseconds,
          maxResponseBytes: 8192,
          maxAttempts: 1,
          followRedirects: false,
          requireInternalAuth: true,
        },
        mail,
      ),
    );
    if (
      typeof response.intentCode !== "string" ||
      !response.intentCode ||
      response.intentCode.length > 192 ||
      ![
        "ACCEPTED",
        "QUEUED",
        "DELIVERING",
        "DELIVERED",
        "RETRY_PENDING",
        "UNCERTAIN",
        "SUPPRESSED",
      ].includes(response.status)
    )
      this.fail();
    return { intentCode: response.intentCode, status: response.status };
  },
  /**
   * Inspects one scoped application without starting or deciding its Process review.
   * @param {Object} request Fresh administrator with an opaque applicationCode and no selectors.
   * @returns {Promise<Object>} Redacted application and inert presentation.
   */
  inspect: async function (request) {
    const p = this.settings(),
      code = request.params?.applicationCode;
    this.base().input(request.body || {}, []);
    this.base().input(request.query || {}, []);
    if (
      p.operatorRecoveryQualified !== true ||
      !/^enterpriseAccess_[a-f0-9]{64}$/.test(code || "")
    )
      this.fail();
    const record = await this.read(code);
    if (
      !record ||
      record.origin !== "SELF_APPLICATION" ||
      record.active !== true
    )
      this.fail();
    await SERVICE.DefaultEnterpriseMembershipService.administrator(
      request,
      record.enterpriseCode,
    );
    const router = SERVICE.DefaultSecuredRequestPipelineService;
    if (
      !router.isPermissionGranted(
        p.decisionPermission,
        router.getGrantedPermissions(request),
        router.getRouteActionAuthorizationConfig(),
      )
    )
      this.fail();
    return {
      contractVersion: 1,
      owner: "profile",
      application: this.operatorProjection(record),
      presentation: p.recoveryPresentation,
    };
  },
  /** Executes one fixed reviewed recovery command; approval remains Process-owned. @param {Object} request Exact operation/revision and scoped actor. @returns {Promise<Object>} Fresh recovery evidence. */
  manage: async function (request) {
    const intake = SERVICE.DefaultEnterpriseApplicationService;
    const input = request.body || {},
      code = request.params && request.params.applicationCode;
    this.base().input(input, ["operation", "revision", "attempt"]);
    if (
      !/^enterpriseAccess_[a-f0-9]{64}$/.test(code || "") ||
      ![
        ENUMS.ProfileApplicationReviewOperation.RETRY_REVIEW_START.key,
        ENUMS.ProfileApplicationReviewOperation.RETRY_NOTIFICATION.key,
        ENUMS.ProfileApplicationReviewOperation.RETRY_REVIEW_RETIREMENT.key,
      ].includes(input.operation) ||
      !Number.isSafeInteger(input.revision) ||
      input.revision < 1
    )
      this.fail();
    if (
      input.attempt !== undefined &&
      (input.operation !==
        ENUMS.ProfileApplicationReviewOperation.RETRY_REVIEW_RETIREMENT.key ||
        !Number.isSafeInteger(input.attempt) ||
        input.attempt < 1 ||
        input.attempt > 20)
    )
      this.fail();
    const permittedEnterprise = intake.reviewEnterprise(request);
    const router = SERVICE.DefaultSecuredRequestPipelineService,
      p = this.settings();
    if (
      !router.isPermissionGranted(
        p.decisionPermission,
        router.getGrantedPermissions(request),
        router.getRouteActionAuthorizationConfig(),
      )
    )
      this.fail();
    let record = await this.read(code);
    const auth = request.authData || {};
    if (
      permittedEnterprise === undefined &&
      (auth.entCode || auth.enterpriseCode) !== CONFIG.get("defaultEnterprise")
    )
      this.fail();
    if (
      !record ||
      (permittedEnterprise && record.enterpriseCode !== permittedEnterprise) ||
      (permittedEnterprise &&
        (auth.tenant !== record.tenantCode ||
          request.tenant !== auth.tenant)) ||
      record.revision !== input.revision ||
      record.active !== true ||
      record.origin !== "SELF_APPLICATION"
    )
      this.fail();
    let retirement;
    if (
      input.operation ===
      ENUMS.ProfileApplicationReviewOperation.RETRY_REVIEW_RETIREMENT.key
    ) {
      if (p.retirementQualified !== true) this.fail();
      retirement = await this.retireClosedReview(record, input.attempt);
      record = await this.read(code);
    } else if (
      input.operation ===
      ENUMS.ProfileApplicationReviewOperation.RETRY_REVIEW_START.key
    ) {
      await this.assertSource(record);
      record = await this.resumeStart(record);
    } else {
      this.assertDecisionRecord(record);
      await this.requestNotification(record);
      record = await this.read(code);
    }
    if (
      !record ||
      record.active !== true ||
      (permittedEnterprise && record.enterpriseCode !== permittedEnterprise)
    )
      this.fail();
    return {
      ...this.operatorProjection(record),
      ...(retirement
        ? {
            retirementStatus: retirement.status,
            retirementAttempt: retirement.attempt,
          }
        : {}),
    };
  },
  /**
   * Projects stored recovery evidence for administrators without private decision or proof data.
   * @param {Object} record A scoped authoritative application.
   * @returns {Object} Revision, safe status and the Process instance reference.
   */
  operatorProjection: function (record) {
    const view =
      SERVICE.DefaultEnterpriseApplicationService.projectRecord(record);
    const review = record.application.review;
    return {
      ...view,
      revision: record.revision,
      reviewInstanceCode: review && review.instanceCode,
      canRetireReview:
        (CONFIG.get("enterpriseManagement") || {}).applications?.review
          ?.retirementQualified === true &&
        ["WITHDRAWN", "EXPIRED"].includes(record.status) &&
        !!review,
      reviewRetirementAttempts: this.retirementInspection(record),
      notificationStatus:
        review?.notification?.status ||
        ENUMS.ProfileEmployeeNotificationStatus.NOT_REQUESTED.key,
    };
  },
  /**
   * Projects bounded closed-attempt inspection without hashes, messages, identities or private Process checkpoints.
   * @param {Object} record Scoped authoritative assignment.
   * @returns {Object[]} Safe attempt identity/status and gated retry availability.
   */
  retirementInspection: function (record) {
    const history = record.application?.history || [];
    if (
      !Array.isArray(history) ||
      history.length >= 20 ||
      Buffer.byteLength(JSON.stringify(history)) > 262144
    )
      this.fail();
    const candidates = [
      ...history,
      {
        application: record.application,
        status: record.status,
        revision: record.revision,
      },
    ];
    return candidates
      .filter((item) => ["WITHDRAWN", "EXPIRED"].includes(item.status))
      .map((item) => {
        const selected = this.retirementAttempt(
          record,
          item.application.attempt || 1,
        );
        const review = selected.application.review;
        if (
          review &&
          Object.entries(this.correlation(selected)).some(
            ([key, value]) => review[key] !== value,
          )
        )
          this.fail();
        return {
          attempt: selected.application.attempt || 1,
          status: selected.status,
          closedAt: selected.application.closedAt,
          reviewStarted: review?.started === true,
          canRetireReview:
            !!review &&
            (CONFIG.get("enterpriseManagement") || {}).applications?.review
              ?.retirementQualified === true,
        };
      });
  },
  /**
   * Validates an already recorded approval without treating later intake disablement as revocation.
   * @param {Object} record Private assignment read through Profile's owner.
   * @returns {boolean} True only for a consistent approved application; grants no session by itself.
   */
  assertApprovedAssignment: function (record) {
    const a = record && record.application,
      r = a && a.review,
      d = r && r.decision;
    if (
      !record ||
      record.origin !== "SELF_APPLICATION" ||
      ![
        ENUMS.ProfileEmployeeApplicationStatus.APPROVED.key,
        ENUMS.ProfileEmployeeApplicationStatus.REGISTERED.key,
      ].includes(record.status) ||
      record.active !== true ||
      !a ||
      !r ||
      !d ||
      d.approved !== true ||
      typeof d.actor !== "string" ||
      !d.actor ||
      d.actor.trim().toLowerCase() === record.normalizedEmail ||
      typeof d.taskCode !== "string" ||
      !d.taskCode ||
      typeof d.reason !== "string" ||
      !Number.isFinite(Date.parse(d.decidedAt)) ||
      !Number.isSafeInteger(r.version) ||
      r.version < 1 ||
      r.requestHash !== a.requestHash ||
      r.enterpriseCode !== record.enterpriseCode ||
      r.tenantCode !== record.tenantCode ||
      a.policyDigest !==
        this.base().digest(["PASSWORD", record.roleCode, record.groupCodes]) ||
      a.requestHash !==
        this.base().digest([
          record.code,
          a.policyDigest,
          {
            firstName: a.firstName,
            lastName: a.lastName,
            note: a.note,
          },
          ...(a.attempt > 1 ? [a.attempt] : []),
        ]) ||
      r.instanceCode !==
        "employeeApplicationReview_" +
          this.base().digest([
            record.code,
            a.requestHash,
            r.definitionCode,
            r.version,
          ]) ||
      r.decisionHash !==
        this.base().digest([a.requestHash, d.taskCode, d.actor, true, d.reason])
    )
      this.fail();
    return true;
  },
};
