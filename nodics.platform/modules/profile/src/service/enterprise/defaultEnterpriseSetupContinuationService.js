/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";

const { AsyncLocalStorage } = require("node:async_hooks");
const { randomUUID } = require("node:crypto");
const { isDeepStrictEqual } = require("node:util");
const cloneDeep = require("lodash/cloneDeep");
const reads = new WeakMap();
const creations = new WeakMap();
const inspectionFailures = new WeakMap();
const writes = new AsyncLocalStorage();

/**
 * @module profile/service/enterprise/defaultEnterpriseSetupContinuationService
 * @description Retains original setup nomination and resumes only evidenced steps through existing Profile owners.
 * @owner profile
 * @layer service
 * @override Preserve disabled qualification, original intent, private provenance, serialization and uncertain-write holds.
 */
module.exports = {
  /** Emits a fixed content-free failure through the existing Profile status owner. */
  fail: function () {
    throw new CLASSES.NodicsError(
      "ERR_PRFL_00003",
      "Enterprise setup continuation is held",
    );
  },
  /** Returns the existing EnterpriseManagement capability owner. */
  management: function () {
    return SERVICE.DefaultEnterpriseManagementService;
  },
  /** Returns independently qualified recovery policy; source availability never activates transport. */
  policy: function (resume = false) {
    const policy = CONFIG.get("enterpriseManagement")?.setupContinuation;
    if (
      policy?.inspectionQualified !== true ||
      policy.privateGuardsQualified !== true ||
      (resume && policy.resumeQualified !== true)
    )
      this.fail();
    return policy;
  },
  /** Snapshots validated creation intent; this pure helper does not admit a persistence command. */
  createSnapshot: function (enterprise, nomination) {
    const m = this.management();
    if (!enterprise || !nomination || typeof nomination.email !== "string")
      this.fail();
    const tenantCode =
      typeof enterprise?.tenant === "object"
        ? enterprise.tenant.code
        : enterprise?.tenant;
    const role = m.rolePolicy(nomination?.roleCode);
    if (
      ![enterprise?.code, tenantCode].every(
        (code) =>
          typeof code === "string" &&
          /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(code),
      ) ||
      ![enterprise.setupRequestKey, enterprise.setupRequestHash].every(
        (value) => /^[a-f0-9]{64}$/.test(value || ""),
      ) ||
      enterprise.adminEmail !== nomination?.email ||
      m.normalizeEmail(nomination.email) !== nomination.email ||
      enterprise.defaultAdminAssignmentCode !== nomination.assignmentCode ||
      nomination.assignmentCode !==
        m.assignmentCode(enterprise.code, nomination.email) ||
      nomination.roleCode !== m.setupAdministratorPolicy().roleCode ||
      role?.scopeType !== "ENTERPRISE" ||
      role.delegable !== true ||
      !Array.isArray(role.groupCodes) ||
      !role.groupCodes.length ||
      role.groupCodes.length > 100 ||
      role.groupCodes.some(
        (code) =>
          typeof code !== "string" || !/^[A-Za-z0-9_.:-]{1,128}$/.test(code),
      )
    )
      this.fail();
    const intent = {
      enterpriseCode: enterprise.code,
      tenantCode,
      setupRequestKey: enterprise.setupRequestKey,
      setupRequestHash: enterprise.setupRequestHash,
      administrator: {
        email: nomination.email,
        assignmentCode: nomination.assignmentCode,
        roleCode: nomination.roleCode,
        groupCodes: [...role.groupCodes],
      },
    };
    return {
      version: 1,
      revision: 0,
      phase: "PENDING",
      stage: "INITIAL",
      intent,
      intentDigest: m.commandDigest(intent),
    };
  },
  /** Admits exactly the awaited initial save with an independently constructed matching snapshot. */
  withCreationMutation: async function (
    request,
    nomination,
    execute,
    authorizationRequest = request,
  ) {
    this.authorizeCreation(authorizationRequest);
    if (typeof execute !== "function" || creations.has(request)) this.fail();
    const expected = this.createSnapshot(request.model, nomination);
    if (!isDeepStrictEqual(request.model?.setupContinuation, expected))
      this.fail();
    creations.set(request, { expected, nomination: cloneDeep(nomination) });
    try {
      return await execute();
    } finally {
      creations.delete(request);
    }
  },
  /** Uses existing creation authorization without activating membership/recovery policy. @param {Object} request Original human create. @returns {void} Existing capability admission. */
  authorizeCreation: function (request) {
    const management = this.management();
    management.authorize(request);
    if (!management.isPlatformAdministrator(request.authData)) this.fail();
    SERVICE.DefaultEnterpriseMembershipService.permission(
      request,
      "profile.enterprise.create",
    );
  },
  /** Retains private immutable setup fields only during the existing awaited creation lookup. @param {Object} request Exact generated lookup. @param {Object} authorizationRequest Original human create. @returns {Promise<Object>} Existing generated envelope. */
  readForCreation: async function (request, authorizationRequest) {
    this.authorizeCreation(authorizationRequest);
    if (
      !request.query ||
      Object.keys(request.query).length !== 1 ||
      typeof request.query.code !== "string" ||
      request.tenant !== (CONFIG.get("defaultTenant") || "default")
    )
      this.fail();
    reads.set(request, request.query.code);
    try {
      const result =
        await SERVICE.DefaultEnterpriseTeamAdministrationService.readEnterpriseEnvelope(
          SERVICE.DefaultEnterpriseService,
          request,
        );
      if (this.management().setupRows(result).length > 1) this.fail();
      return result;
    } finally {
      reads.delete(request);
    }
  },
  /** Detects private command paths under bounded traversal, including expressions and dotted references. @param {*} value Selector/options fragment. @returns {boolean} Whether public access must refuse. */
  privateField: function (value) {
    const fields = [
      "setupContinuation",
      "setupRequestKey",
      "setupRequestHash",
      "defaultAdminAssignmentCode",
      "teamOperation",
      "teamRevision",
      "enterpriseProvisioning",
      "tenantNamespace",
      "tenantNamespaceBindings",
      "properties.database",
      "tenant.properties",
    ];
    const pending = [{ value, depth: 0 }],
      seen = new WeakSet();
    let budget = 0;
    while (pending.length) {
      const frame = pending.pop();
      if (++budget > 2048 || frame.depth > 24) return true;
      if (
        typeof frame.value === "string" &&
        fields.some((field) => frame.value.includes(field))
      )
        return true;
      if (!frame.value || typeof frame.value !== "object") continue;
      if (seen.has(frame.value)) return true;
      seen.add(frame.value);
      for (const [key, item] of Object.entries(frame.value)) {
        if (fields.some((field) => key.includes(field))) return true;
        pending.push({ value: item, depth: frame.depth + 1 });
      }
    }
    return false;
  },
  /** Rejects private query/count/projection/sort/expression selection before cache/provider access. @param {Object} request Exact owner request. @returns {boolean} Protected read admission. */
  protectRead: function (request) {
    if (
      SERVICE.DefaultEnterpriseTeamAdministrationService.ownsEnterpriseRead(
        request,
      )
    )
      return true;
    if (
      this.privateField([request.query, request.options, request.searchOptions])
    )
      this.fail();
    return true;
  },
  /** Composes the existing Contact/decision/historical read boundary for the actual Enterprise receiver. @param {Object} request Original request. @param {Object} model Prepared model. @returns {boolean} Positive canonical read admission. */
  providerRead: function (request, model) {
    if (
      model?.schemaName !== "enterprise" ||
      !model.rawSchema ||
      SERVICE.DefaultProfileVerifiedContactInterceptorService?.providerRead?.(
        request,
        model,
      ) !== true ||
      SERVICE.DefaultTenantProvisioningGuardService?.protectRead?.(request) !==
        true
    )
      this.fail();
    return this.protectRead(request);
  },
  /** Composes existing canonical projections then removes setup evidence before provider/export delivery. @param {Object} request Original request. @param {Object} response Envelope. @param {Object} model Prepared Enterprise model. @returns {boolean} Positive projection. */
  providerResult: function (request, response, model) {
    if (
      model?.schemaName !== "enterprise" ||
      !model.rawSchema ||
      SERVICE.DefaultProfileVerifiedContactInterceptorService?.providerResult?.(
        request,
        response,
        model,
      ) !== true
    )
      this.fail();
    if (
      SERVICE.DefaultTenantProvisioningGuardService?.redact?.(
        request,
        response,
      ) !== true
    )
      this.fail();
    return this.redactEnterprise(request, response);
  },
  /** Blocks generic private-field writes; serialized commands require the exact active owner patch. */
  protectMutation: function (request) {
    const teamOwner = SERVICE.DefaultEnterpriseTeamAdministrationService;
    if (
      !creations.has(request) &&
      !teamOwner.ownsEnterpriseWrite(request) &&
      this.privateField([request.query, request.options, request.searchOptions])
    )
      this.fail();
    const models = Array.isArray(request.model)
      ? request.model
      : [request.model || {}];
    const carries = models.some((model) =>
      Object.keys(model).some(
        (key) =>
          ["setupContinuation", "setupRequestKey", "setupRequestHash"].some(
            (field) => key === field || key.startsWith(field + "."),
          ) ||
          (key.startsWith("$") &&
            model[key] &&
            Object.keys(model[key]).some((path) =>
              ["setupContinuation", "setupRequestKey", "setupRequestHash"].some(
                (field) => path === field || path.startsWith(field + "."),
              ),
            )),
      ),
    );
    if (!carries) return true;
    const creation = creations.get(request);
    if (creation) {
      if (
        !isDeepStrictEqual(
          request.model.setupContinuation,
          creation.expected,
        ) ||
        !isDeepStrictEqual(
          this.createSnapshot(request.model, creation.nomination),
          creation.expected,
        )
      )
        this.fail();
      return true;
    }
    const scope = writes.getStore();
    if (
      !scope?.active ||
      !SERVICE.DefaultEnterpriseTeamAdministrationService.ownsEnterpriseWrite(
        request,
      ) ||
      request.tenant !== (CONFIG.get("defaultTenant") || "default") ||
      !isDeepStrictEqual(request.query, scope.query) ||
      !isDeepStrictEqual(request.model, { setupContinuation: scope.next })
    )
      this.fail();
    return true;
  },
  /** Redacts private continuation from all public nested results, never mutating cached/shared rows. */
  redactEnterprise: function (request, response) {
    if (creations.has(request)) return true;
    if (
      reads.has(request) &&
      request.query?.code === reads.get(request) &&
      SERVICE.DefaultEnterpriseTeamAdministrationService.ownsEnterpriseRead(
        request,
      )
    )
      return true;
    const scope = writes.getStore();
    if (
      scope?.active &&
      scope.allowTeamReads &&
      request.tenant === (CONFIG.get("defaultTenant") || "default") &&
      request.query?.code === scope.code &&
      Object.keys(request.query).length === 1 &&
      SERVICE.DefaultEnterpriseTeamAdministrationService.ownsEnterpriseRead(
        request,
      )
    )
      return true;
    const teamRead =
      SERVICE.DefaultEnterpriseTeamAdministrationService.ownsEnterpriseRead(
        request,
      );
    for (const key of [null, "success"]) {
      const envelope = key ? response?.[key] : response;
      if (!envelope || !Object.hasOwn(envelope, "result")) continue;
      const collection = Array.isArray(envelope.result);
      SERVICE.DefaultEnterpriseTeamAdministrationService.validateEnterprisePublicRows(
        collection ? envelope.result : [envelope.result],
      );
      const teamProjection = {
        result: collection ? envelope.result : [envelope.result],
      };
      if (
        SERVICE.DefaultEnterpriseTeamAdministrationService.redactEnterprise(
          request,
          teamProjection,
        ) !== true
      )
        this.fail();
      const rows = cloneDeep(
          collection ? teamProjection.result : teamProjection.result[0],
        ),
        pending = [rows],
        seen = new WeakSet();
      while (pending.length) {
        const value = pending.pop();
        if (!value || typeof value !== "object" || seen.has(value)) continue;
        seen.add(value);
        delete value.setupContinuation;
        if (!teamRead) {
          delete value.setupRequestKey;
          delete value.setupRequestHash;
        }
        pending.push(...Object.values(value));
      }
      if (key) response[key] = { ...envelope, result: rows };
      else response.result = rows;
    }
    if (
      SERVICE.DefaultTenantProvisioningGuardService?.redact?.(
        request,
        response,
      ) !== true
    )
      this.fail();
    return true;
  },
  /** Returns one bounded fresh generated-owner envelope with transient private visibility. */
  readEnterprise: async function (code) {
    const request = {
      tenant: CONFIG.get("defaultTenant") || "default",
      authData: SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
      query: { code },
      options: { recursive: false, skipItemCache: true },
      searchOptions: { pageSize: 2, pageNumber: 1 },
    };
    reads.set(request, code);
    try {
      const result =
        await SERVICE.DefaultEnterpriseTeamAdministrationService.readEnterpriseEnvelope(
          SERVICE.DefaultEnterpriseService,
          request,
        );
      const rows = this.management().setupRows(result);
      if (rows.length !== 1 || rows[0].code !== code || rows[0].active !== true)
        this.fail();
      return rows[0];
    } finally {
      reads.delete(request);
    }
  },
  /** Requires fresh PASSWORD human Platform Owner administration and existing creation permission. */
  authorize: async function (request) {
    const m = this.management(),
      auth = request.authData;
    m.authorize(request);
    if (
      auth?.principalType !== "human" ||
      auth.authenticationMethod !== "PASSWORD" ||
      !m.isPlatformAdministrator(auth)
    )
      this.fail();
    const memberships = SERVICE.DefaultEnterpriseMembershipService;
    const actor = await memberships.verifyAuthenticatedActor(request);
    memberships.permission(request, "profile.enterprise.create");
    return actor;
  },
  /** Checks exact retained intent; no old form/hash reconstruction or current-policy role inference. */
  validIntent: function (enterprise) {
    const state = enterprise.setupContinuation,
      intent = state?.intent;
    const tenantCode =
      typeof enterprise.tenant === "object"
        ? enterprise.tenant.code
        : enterprise.tenant;
    return (
      state?.version === 1 &&
      Object.keys(state).every((key) =>
        [
          "version",
          "revision",
          "phase",
          "stage",
          "intent",
          "intentDigest",
          "attemptId",
        ].includes(key),
      ) &&
      (state.attemptId === undefined ||
        /^[a-f0-9-]{36}$/.test(state.attemptId)) &&
      Number.isSafeInteger(state.revision) &&
      state.revision >= 0 &&
      state.revision < 2147483647 &&
      ["PENDING", "COMPLETE"].includes(state.phase) &&
      [
        "INITIAL",
        "RUNTIME_PENDING",
        "RUNTIME_COMPLETE",
        "ADMIN_PENDING",
        "COMPLETE",
      ].includes(state.stage) &&
      intent?.enterpriseCode === enterprise.code &&
      intent.tenantCode === tenantCode &&
      Object.keys(intent).length === 5 &&
      intent.setupRequestKey === enterprise.setupRequestKey &&
      intent.setupRequestHash === enterprise.setupRequestHash &&
      /^[a-f0-9]{64}$/.test(intent.setupRequestKey || "") &&
      /^[a-f0-9]{64}$/.test(intent.setupRequestHash || "") &&
      intent.administrator?.email === enterprise.adminEmail &&
      Object.keys(intent.administrator).length === 4 &&
      typeof intent.administrator.email === "string" &&
      this.management().normalizeEmail(intent.administrator.email) ===
        intent.administrator.email &&
      typeof intent.administrator.roleCode === "string" &&
      /^[A-Za-z0-9_.:-]{1,128}$/.test(intent.administrator.roleCode) &&
      intent.administrator.assignmentCode ===
        enterprise.defaultAdminAssignmentCode &&
      intent.administrator.assignmentCode ===
        this.management().assignmentCode(
          enterprise.code,
          intent.administrator.email,
        ) &&
      Array.isArray(intent.administrator.groupCodes) &&
      intent.administrator.groupCodes.length > 0 &&
      intent.administrator.groupCodes.length <= 100 &&
      intent.administrator.groupCodes.every(
        (code) =>
          typeof code === "string" && /^[A-Za-z0-9_.:-]{1,128}$/.test(code),
      ) &&
      state.intentDigest === this.management().commandDigest(intent) &&
      (state.phase === "COMPLETE") === (state.stage === "COMPLETE")
    );
  },
  /** Validates current policy against retained nomination; changed policy never grants a replacement role. */
  samePolicy: function (enterprise) {
    try {
      const admin = enterprise.setupContinuation.intent.administrator,
        m = this.management();
      const role = m.rolePolicy(admin.roleCode);
      return (
        m.setupAdministratorPolicy().roleCode === admin.roleCode &&
        role.scopeType === "ENTERPRISE" &&
        role.delegable === true &&
        isDeepStrictEqual(role.groupCodes, admin.groupCodes)
      );
    } catch {
      return false;
    }
  },
  /** Inspects an already compiled namespace against fresh Tenant evidence and nDatabase pins, without preparation or config mutation. */
  namespaceReady: async function (enterprise) {
    try {
      const tenant = enterprise.setupContinuation.intent.tenantCode,
        authority = CONFIG.get("defaultTenant") || "default";
      if (
        typeof SERVICE.DefaultTenantProvisioningGuardService?.invoke !==
        "function"
      )
        return false;
      const result = await SERVICE.DefaultTenantProvisioningGuardService.invoke(
        "get",
        {
          tenant: authority,
          authData:
            SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
          query: { code: tenant },
          options: { recursive: false, skipItemCache: true },
          searchOptions: { pageSize: 2, pageNumber: 1 },
        },
      );
      const rows = this.management().setupRows(result);
      if (
        rows.length !== 1 ||
        rows[0].code !== tenant ||
        rows[0].active !== true
      )
        return false;
      const owner = SERVICE.DefaultDatabaseConfigurationService;
      if (tenant !== authority) {
        const stored = rows[0].properties?.database,
          effective = CONFIG.get("database", tenant);
        if (
          !stored?.tenantNamespace ||
          !isDeepStrictEqual(
            stored.tenantNamespace,
            effective?.tenantNamespace,
          ) ||
          !isDeepStrictEqual(
            stored.tenantNamespaceBindings,
            effective?.tenantNamespaceBindings,
          ) ||
          typeof owner.assertTenantNamespaceBinding !== "function"
        )
          return false;
        if (owner.assertTenantNamespaceBinding(tenant) !== true) return false;
      }
      for (const module of new Set([
        "default",
        ...owner.getDatabaseActiveModules(),
      ])) {
        const resolved = owner.resolveTenantDatabaseConfiguration(
          module,
          tenant,
        );
        if (
          owner.assertTenantDatabaseIsolation(module, tenant, resolved) !== true
        )
          return false;
      }
      return true;
    } catch {
      return false;
    }
  },
  /** Reads the original assignment only; refusals cannot be interpreted as absence. */
  assignment: async function (enterprise) {
    const result = await SERVICE.DefaultEnterpriseAccessAssignmentService.get({
      tenant: CONFIG.get("defaultTenant") || "default",
      authData: SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
      query: { code: enterprise.defaultAdminAssignmentCode },
      options: { recursive: false, skipItemCache: true },
      searchOptions: { pageSize: 2, pageNumber: 1 },
    });
    const rows = this.management().setupRows(result);
    if (rows.length > 1) this.fail();
    return rows[0];
  },
  /** Validates the existing nomination without inviting, extending expiry or modifying credentials. */
  assignmentMatches: function (enterprise, assignment) {
    const intent = enterprise.setupContinuation.intent,
      admin = intent.administrator;
    return (
      !!assignment &&
      assignment.code === admin.assignmentCode &&
      assignment.enterpriseCode === enterprise.code &&
      assignment.tenantCode === intent.tenantCode &&
      assignment.normalizedEmail === admin.email &&
      assignment.roleCode === admin.roleCode &&
      assignment.scopeType === "ENTERPRISE" &&
      assignment.scopeCode === enterprise.code &&
      isDeepStrictEqual(assignment.groupCodes, admin.groupCodes) &&
      assignment.active === true &&
      ["PENDING", "ACTIVE", "REGISTERED"].includes(assignment.status) &&
      (!assignment.origin || assignment.origin === "ADMIN_PRE_ENROLLED") &&
      (assignment.status === "REGISTERED" ||
        !assignment.expiresAt ||
        new Date(assignment.expiresAt).getTime() > Date.now())
    );
  },
  /** Reads current runtime completion evidence only, never exposing the retained token. */
  runtimeReady: function (enterprise) {
    return (
      SERVICE.DefaultEnterpriseHandlerService?.isEnterpriseRuntimeReady?.(
        enterprise,
      ) === true
    );
  },
  /** Builds a bounded content-safe projection; private request keys, hashes and assignment IDs are never returned. */
  project: function (enterprise, state, reasons, assignment) {
    return {
      contractVersion: 1,
      enterprise: {
        code: enterprise.code,
        name: enterprise.name,
        tenantCode:
          typeof enterprise.tenant === "object"
            ? enterprise.tenant.code
            : enterprise.tenant,
      },
      administrator: {
        email: enterprise.adminEmail,
        status: assignment?.status || "UNCONFIRMED",
      },
      setup: {
        revision: Number.isSafeInteger(enterprise.setupContinuation?.revision)
          ? enterprise.setupContinuation.revision
          : null,
        state,
        canResume: state === "RESUMABLE",
        reasonCodes: reasons,
      },
      descriptor: this.workspaceDescriptor(),
    };
  },
  /** Returns owner-controlled versioned UI metadata without private setup evidence or authorization grants. @returns {Object} Native Axis recovery descriptor. */
  workspaceDescriptor: function () {
    const policy = CONFIG.get("enterpriseManagement")?.setupContinuation || {};
    const inspect = this.operationRoute("inspectEnterpriseSetup", "GET"),
      resume = this.operationRoute("resumeEnterpriseSetup", "POST");
    const available =
      !!inspect &&
      !!resume &&
      policy.inspectionQualified === true &&
      policy.privateGuardsQualified === true;
    return {
      version: 1,
      type: "enterpriseSetupContinuation",
      available,
      actions: {
        inspect,
        resume: resume
          ? {
              ...resume,
              qualified: available && policy.resumeQualified === true,
              bodyFields: ["expectedRevision"],
            }
          : undefined,
      },
      presentation: cloneDeep(policy.workspace?.presentation || {}),
    };
  },
  /** Resolves only the prepared public owner route; customization follows nRouter, never another path registry. @param {string} operation Fixed exported action. @param {string} method Fixed method. @returns {Object|undefined} Safe URL template or unavailable. */
  operationRoute: function (operation, method) {
    try {
      if (typeof NODICS.getRouters !== "function") return undefined;
      const matches = Object.values(
        NODICS.getRouters(CONFIG.get("profileModuleName") || "profile") || {},
      ).filter(
        (route) =>
          route.controller === "DefaultEnterpriseManagementController" &&
          route.operation === operation &&
          route.active !== false,
      );
      if (matches.length !== 1) return undefined;
      const route = matches[0];
      if (
        String(route.method).toUpperCase() !== method ||
        route.secured !== true ||
        route.permission !== "profile.enterprise.create" ||
        !route.authTokenTypes?.includes("access") ||
        typeof route.url !== "string" ||
        !/^\/[A-Za-z0-9_/:.-]+$/.test(route.url) ||
        route.url.includes("//") ||
        route.url
          .split("/")
          .some((segment) => segment === "." || segment === "..") ||
        route.url
          .split("/")
          .filter((segment) => segment.startsWith(":"))
          .join(",") !== ":enterpriseCode"
      )
        return undefined;
      return {
        method,
        path: route.url.replace(/:enterpriseCode(?=\/|$)/, "{enterpriseCode}"),
      };
    } catch {
      return undefined;
    }
  },
  /** Assesses owner evidence without writes; missing historical intent remains held. */
  assess: async function (enterprise, actor) {
    if (!this.validIntent(enterprise))
      return this.project(enterprise, "HELD", ["ORIGINAL_INTENT_UNAVAILABLE"]);
    if (!this.samePolicy(enterprise))
      return this.project(enterprise, "HELD", ["NOMINATION_POLICY_CHANGED"]);
    if (!(await this.namespaceReady(enterprise)))
      return this.project(enterprise, "HELD", ["TENANT_NAMESPACE_UNSAFE"]);
    let assignment;
    try {
      assignment = await this.assignment(enterprise);
    } catch {
      return this.project(enterprise, "HELD", ["ASSIGNMENT_READ_UNAVAILABLE"]);
    }
    if (assignment && !this.assignmentMatches(enterprise, assignment))
      return this.project(enterprise, "HELD", ["NOMINATION_CHANGED"]);
    const op = enterprise.teamOperation,
      stage = enterprise.setupContinuation.stage;
    if (
      op?.phase !== undefined &&
      op.phase !== "COMPLETE" &&
      (op.operation !== "SETUP_CONTINUATION" ||
        op.input?.intentDigest !== enterprise.setupContinuation.intentDigest)
    )
      return this.project(
        enterprise,
        "HELD",
        ["OTHER_OPERATION_PENDING"],
        assignment,
      );
    if (op?.phase === "PENDING") {
      const expectedId = "setup_" + enterprise.setupContinuation.intentDigest;
      if (
        op.id !== expectedId ||
        op.input?.operationId !== expectedId ||
        Object.keys(op.input).length !== 2 ||
        op.hash !==
          SERVICE.DefaultEnterpriseMembershipService.digest({
            operation: op.operation,
            input: op.input,
            identity: op.actor,
            enterpriseCode: enterprise.code,
          })
      )
        return this.project(
          enterprise,
          "HELD",
          ["OPERATION_EVIDENCE_INVALID"],
          assignment,
        );
      if (!actor?.identity || !isDeepStrictEqual(actor.identity, op.actor))
        return this.project(
          enterprise,
          "HELD",
          ["ORIGINAL_OPERATOR_REQUIRED"],
          assignment,
        );
    }
    if (
      (stage === "RUNTIME_PENDING" && !this.runtimeReady(enterprise)) ||
      (stage === "ADMIN_PENDING" && !assignment)
    )
      return this.project(
        enterprise,
        "HELD",
        ["STEP_OUTCOME_UNCONFIRMED"],
        assignment,
      );
    if (
      enterprise.setupContinuation.phase === "COMPLETE" &&
      op?.phase !== "PENDING"
    )
      return this.project(
        enterprise,
        assignment && this.runtimeReady(enterprise) ? "COMPLETE" : "HELD",
        assignment && this.runtimeReady(enterprise)
          ? []
          : ["COMPLETION_UNCONFIRMED"],
        assignment,
      );
    return this.project(enterprise, "RESUMABLE", [], assignment);
  },
  /** Fixed read-only inspection entry; authorization failure is not converted to an inert success. */
  /** Returns only the fixed inspection stage retained for an exact owner failure; no messages or private evidence. @param {Object} error Original owner failure. @returns {string|undefined} Registered safe code. */
  inspectionFailureCode: function (error) {
    return error && typeof error === "object"
      ? inspectionFailures.get(error)
      : undefined;
  },
  /** Retains content-free stage provenance without altering the underlying exception or authorization. @param {string} code Fixed owner status code. @param {Function} execute Internal inspection step. @returns {Promise<*>} Original step result. */
  inspectionStep: async function (code, execute) {
    try {
      return await execute();
    } catch (error) {
      if (error && typeof error === "object")
        inspectionFailures.set(error, code);
      throw error;
    }
  },
  /**
   * Inspects one saved enterprise under fresh operator authority without resuming setup.
   * @param {Object} request Authenticated request containing only the enterprise route parameter.
   * @returns {Promise<Object>} Redacted current setup assessment with content-free failure provenance.
   */
  inspect: async function (request) {
    await this.inspectionStep("ERR_PROFILE_SETUP_INSPECTION_POLICY", () =>
      this.policy(),
    );
    const actor = await this.inspectionStep(
      "ERR_PROFILE_SETUP_INSPECTION_AUTHORIZATION",
      () => this.authorize(request),
    );
    const code = request.params?.enterpriseCode;
    await this.inspectionStep("ERR_PROFILE_SETUP_INSPECTION_INPUT", () => {
      if (
        !/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(code || "") ||
        Object.keys(request.query || {}).length ||
        Object.keys(request.body || {}).length
      )
        this.fail();
    });
    const enterprise = await this.inspectionStep(
      "ERR_PROFILE_SETUP_INSPECTION_READ",
      () => this.readEnterprise(code),
    );
    return this.inspectionStep("ERR_PROFILE_SETUP_INSPECTION_ASSESSMENT", () =>
      this.assess(enterprise, actor),
    );
  },
  /** Persists one monotonic checkpoint through the existing serialized owner with transient exact-patch admission. */
  checkpoint: async function (enterprise, stage) {
    const transitions = {
      INITIAL: ["RUNTIME_PENDING", "RUNTIME_COMPLETE"],
      RUNTIME_PENDING: ["RUNTIME_COMPLETE"],
      RUNTIME_COMPLETE: ["ADMIN_PENDING", "COMPLETE"],
      ADMIN_PENDING: ["COMPLETE"],
    };
    if (
      !this.validIntent(enterprise) ||
      enterprise.setupContinuation.revision >= 2147483646 ||
      !transitions[enterprise.setupContinuation.stage]?.includes(stage) ||
      enterprise.teamOperation?.phase !== "PENDING" ||
      enterprise.teamOperation.operation !== "SETUP_CONTINUATION" ||
      enterprise.teamOperation.input?.intentDigest !==
        enterprise.setupContinuation.intentDigest
    )
      this.fail();
    const next = {
      ...cloneDeep(enterprise.setupContinuation),
      revision: enterprise.setupContinuation.revision + 1,
      stage,
      attemptId: randomUUID(),
      phase: stage === "COMPLETE" ? "COMPLETE" : "PENDING",
    };
    const query = {
      teamRevision: enterprise.teamRevision,
      "teamOperation.id": enterprise.teamOperation.id,
      "teamOperation.phase": "PENDING",
      "setupContinuation.revision": enterprise.setupContinuation.revision,
      "setupContinuation.intentDigest":
        enterprise.setupContinuation.intentDigest,
    };
    const scope = {
      active: true,
      code: enterprise.code,
      next,
      allowTeamReads: true,
      query: { code: enterprise.code, active: true, ...query },
    };
    try {
      return await writes.run(scope, () =>
        SERVICE.DefaultEnterpriseTeamAdministrationService.persist(
          enterprise,
          query,
          { setupContinuation: next },
        ),
      );
    } finally {
      scope.active = false;
    }
  },
  /** Admits only the exact awaited setup serialization request and input under fresh native operator authority. @param {Object} request Original verified command. @param {Object} input Retained setup operation input. @param {string} code Enterprise code. @returns {Promise<Object>} Fresh canonical actor. */
  authorizeSerializedSetup: async function (request, input, code) {
    const scope = writes.getStore();
    if (
      !scope?.active ||
      scope.authorizationRequest !== request ||
      scope.setupInput !== input ||
      scope.code !== code ||
      input.operationId !== "setup_" + input.intentDigest ||
      !/^[a-f0-9]{64}$/.test(input.intentDigest || "") ||
      Object.keys(input).sort().join(",") !== "intentDigest,operationId"
    )
      this.fail();
    this.policy(true);
    const actor = await this.authorize(request);
    SERVICE.DefaultEnterpriseMembershipService.permission(
      request,
      "profile.enterpriseAccess.assign",
    );
    return actor;
  },
  /** Resumes only the retained nomination under existing Team CAS; uncertain steps are not replayed. */
  resume: async function (request) {
    this.policy(true);
    const actor = await this.authorize(request);
    const code = request.params?.enterpriseCode,
      body = request.body || {};
    if (
      !/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(code || "") ||
      Object.keys(request.query || {}).length ||
      Object.keys(body).length !== 1 ||
      !Object.hasOwn(body, "expectedRevision") ||
      !Number.isSafeInteger(body.expectedRevision) ||
      body.expectedRevision < 0
    )
      this.fail();
    let enterprise = await this.readEnterprise(code),
      assessment = await this.assess(enterprise, actor);
    if (assessment.setup.state === "COMPLETE") return assessment;
    if (
      !assessment.setup.canResume ||
      enterprise.setupContinuation.revision !== body.expectedRevision
    )
      this.fail();
    const team = SERVICE.DefaultEnterpriseTeamAdministrationService,
      m = this.management();
    if (
      typeof team?.begin !== "function" ||
      typeof team.persist !== "function" ||
      typeof team.finish !== "function" ||
      typeof m.activateEnterpriseRuntime !== "function" ||
      typeof m.prepareDefaultAdministrator !== "function"
    )
      this.fail();
    const operationId = "setup_" + enterprise.setupContinuation.intentDigest;
    const setupInput = {
      operationId,
      intentDigest: enterprise.setupContinuation.intentDigest,
    };
    const scope = {
      active: true,
      code,
      allowTeamReads: true,
      authorizationRequest: request,
      setupInput,
    };
    try {
      enterprise = await writes.run(scope, () =>
        team.begin(request, "SETUP_CONTINUATION", setupInput, code),
      );
    } finally {
      scope.active = false;
    }
    if (
      enterprise.teamOperation?.phase !== "PENDING" ||
      enterprise.setupContinuation.revision !== body.expectedRevision ||
      !(await this.assess(enterprise, actor)).setup.canResume
    )
      this.fail();
    if (!this.runtimeReady(enterprise)) {
      if (enterprise.setupContinuation.stage !== "INITIAL") this.fail();
      enterprise = await this.checkpoint(enterprise, "RUNTIME_PENDING");
      await this.authorize(request);
      if (!(await this.namespaceReady(enterprise))) this.fail();
      await m.activateEnterpriseRuntime(
        enterprise,
        enterprise.setupContinuation.intent.tenantCode,
      );
      if (!this.runtimeReady(enterprise)) this.fail();
    }
    if (
      ["INITIAL", "RUNTIME_PENDING"].includes(
        enterprise.setupContinuation.stage,
      )
    )
      enterprise = await this.checkpoint(enterprise, "RUNTIME_COMPLETE");
    let assignment = await this.assignment(enterprise);
    if (!assignment) {
      if (enterprise.setupContinuation.stage !== "RUNTIME_COMPLETE")
        this.fail();
      enterprise = await this.checkpoint(enterprise, "ADMIN_PENDING");
      await this.authorize(request);
      if (
        !(await this.namespaceReady(enterprise)) ||
        !this.samePolicy(enterprise)
      )
        this.fail();
      const admin = enterprise.setupContinuation.intent.administrator;
      await m.prepareDefaultAdministrator(request, enterprise, {
        email: admin.email,
        roleCode: admin.roleCode,
        assignmentCode: admin.assignmentCode,
      });
      assignment = await this.assignment(enterprise);
    }
    if (!this.assignmentMatches(enterprise, assignment)) this.fail();
    await this.authorize(request);
    if (
      !this.samePolicy(enterprise) ||
      !(await this.namespaceReady(enterprise)) ||
      !this.runtimeReady(enterprise)
    )
      this.fail();
    if (enterprise.setupContinuation.phase !== "COMPLETE")
      enterprise = await this.checkpoint(enterprise, "COMPLETE");
    const result = this.project(enterprise, "COMPLETE", [], assignment);
    await team.finish(enterprise, result);
    return result;
  },
};
