/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module profile/service/identity/DefaultIdentityGovernanceMigrationService
 * @description Owns read-only cross-tenant identity assessment and legacy tenant-scoped migration, audit, rollback and service-key rotation.
 * @layer service
 * @owner profile
 * @override Project modules may override migration policy and persistence while preserving preview safety, credential redaction, and change-set rollback.
 */
const reviewedMigrationPlans = new WeakMap();
const crypto = require("node:crypto");
module.exports = {
  /** Reads one reviewed structural audit under current original PASSWORD platform authority. @param {Object} request Exact auditCode/fingerprint/confirmed command. @returns {Promise<Object>} Stored immutable plan. */
  recoveryAudit: async function (request) {
    return this.readReviewedStructuralAudit(request, false);
  },
  /** Reads immutable structural evidence for a fixed inspection or recovery entry point. @param {Object} request Exact reviewed audit command and original operator proof. @param {boolean} inspection Internal fixed read-only mode, never a request selector. @returns {Promise<Object>} Validated stored audit; no writes. */
  readReviewedStructuralAudit: async function (request, inspection) {
    const p = this.getPolicy(),
      input = request.identityMigration || {},
      auth = request.authData || {};
    const m = SERVICE.DefaultEnterpriseMembershipService;
    if (
      (inspection
        ? p.recoveryInspectionEnabled !== true ||
          p.recoveryInspectionQualified !== true
        : p.reviewedRecoveryEnabled !== true ||
          p.reviewedRecoveryQualified !== true) ||
      auth.tokenType !== "access" ||
      auth.principalType !== "human" ||
      auth.authenticationMethod !== "PASSWORD" ||
      auth.sessionContext ||
      auth.isSystem ||
      auth.tenant !== request.tenant ||
      !SERVICE.DefaultEnterpriseManagementService.isPlatformAdministrator(
        auth,
      ) ||
      Object.keys(input).sort().join(",") !==
        "auditCode,confirmed,fingerprint" ||
      input.confirmed !== true ||
      typeof input.auditCode !== "string" ||
      !input.auditCode ||
      input.auditCode.length > 192 ||
      !/^[a-f0-9]{64}$/.test(input.fingerprint || "") ||
      Object.keys(request.query || {}).length ||
      Object.keys(request.httpRequest?.query || {}).length
    )
      throw new CLASSES.NodicsError("ERR_AUTH_00003");
    m.permission(
      request,
      inspection ? "identity.migration.preview" : "identity.migration.apply",
    );
    await m.administrator(request, auth.entCode);
    await m.credential(await m.actor(request));
    const rows =
      await SERVICE.DefaultPrincipalSecurityStampGovernanceService.inventory(
        SERVICE.DefaultIdentityMigrationAuditService,
        request.tenant,
        { code: input.auditCode },
      );
    const audit = rows[0];
    if (
      rows.length !== 1 ||
      audit.tenant !== request.tenant ||
      !(
        inspection
          ? [
              "APPLYING",
              "FAILED",
              "RECOVERING",
              "ROLLING_BACK",
              "APPLIED",
              "NO_CHANGES",
              "ROLLED_BACK",
            ]
          : ["APPLYING", "FAILED", "RECOVERING", "APPLIED"]
      ).includes(audit.status) ||
      audit.planFingerprint !== input.fingerprint ||
      this.planFingerprint(audit.preview) !== input.fingerprint ||
      !Array.isArray(audit.preview?.changes) ||
      audit.preview.changes.length !== audit.preview.changeCount ||
      !Number.isSafeInteger(audit.appliedChangeCount) ||
      audit.appliedChangeCount < 0 ||
      audit.appliedChangeCount > audit.preview.changes.length
    )
      throw new CLASSES.NodicsError("ERR_AUTH_00003");
    if (
      !inspection &&
      (audit.status === "RECOVERING" || audit.status === "APPLIED") &&
      (!/^[a-f0-9-]{36}$/.test(audit.recoveryOperationId || "") ||
        (audit.status === "APPLIED" &&
          (audit.result?.recovered !== true ||
            audit.appliedChangeCount !== audit.preview.changeCount)))
    )
      throw new CLASSES.NodicsError("ERR_AUTH_00003");
    return audit;
  },
  /** Classifies one live record as exact audited pre/post state; ambiguous changes cannot be replayed. @param {Object} request Current operator. @param {Object} change Stored structural change. @returns {Promise<string>} BEFORE or AFTER. */
  structuralChangeState: async function (request, change) {
    const state = await this.inspectStructuralChange(request, change);
    if (state !== "DRIFT") return state;
    throw new CLASSES.NodicsError(
      "ERR_AUTH_00003",
      "Structural audit has drifted; inspect without replay",
    );
  },
  /** Reads one audited record without projecting its identity or fields to a consumer. @param {Object} request Current operator tenant. @param {Object} change Immutable stored structural change. @returns {Promise<string>} BEFORE, AFTER or DRIFT; provider failures still reject. */
  inspectStructuralChange: async function (request, change) {
    const names = {
      employee: "DefaultEmployeeService",
      customer: "DefaultCustomerService",
      userGroup: "DefaultUserGroupService",
      address: "DefaultAddressService",
      contact: "DefaultContactService",
    };
    if (
      !change ||
      !names[change.schema] ||
      !change.from ||
      !change.to ||
      typeof change.code !== "string"
    )
      throw new CLASSES.NodicsError("ERR_AUTH_00003");
    const rows =
      await SERVICE.DefaultPrincipalSecurityStampGovernanceService.inventory(
        SERVICE[names[change.schema]],
        request.tenant,
        { code: change.code },
      );
    const row = rows[0],
      keys = Object.keys(change.to).filter(
        (key) =>
          !["revokeAPIKey", "revokeLegacyAPIKey", "rotationRequired"].includes(
            key,
          ),
      );
    if (
      rows.length !== 1 ||
      (change.from._id && String(row._id) !== String(change.from._id)) ||
      (["employee", "customer"].includes(change.schema) &&
        (row.loginId !== change.from.loginId || row.authenticationIdentity))
    )
      return "DRIFT";
    const matches = (value) =>
      keys.every(
        (key) => this.auditDigest(row[key]) === this.auditDigest(value[key]),
      );
    const revoked =
      change.to.revokeAPIKey ||
      change.to.revokeLegacyAPIKey ||
      change.to.rotationRequired;
    const after =
      matches(change.to) &&
      (!revoked ||
        (!row.apiKey &&
          row.apiKeyStatus ===
            (change.to.rotationRequired ? "rotation_required" : "revoked")));
    if (after) return "AFTER";
    if (
      matches(change.from) &&
      (!revoked || row.apiKeyStatus === change.from.apiKeyStatus)
    )
      return "BEFORE";
    return "DRIFT";
  },
  /** Inspects interrupted structural work without replay, finalization or unlocking. @param {Object} request Exact reviewed command under independently qualified PASSWORD platform admission. @returns {Promise<Object>} Redacted positional evidence, explicitly non-atomic and never apply authority. */
  inspectReviewedMigration: async function (request) {
    const audit = await this.readReviewedStructuralAudit(request, true);
    const maximum = this.getPolicy().recoveryInspectionMaximumChanges;
    if (
      !Number.isSafeInteger(maximum) ||
      maximum < 1 ||
      maximum > 10000 ||
      audit.preview.changes.length > maximum
    )
      throw new CLASSES.NodicsError("ERR_AUTH_00003");
    const states = [];
    for (const change of audit.preview.changes)
      states.push(await this.inspectStructuralChange(request, change));
    const current =
      await SERVICE.DefaultPrincipalSecurityStampGovernanceService.inventory(
        SERVICE.DefaultIdentityMigrationAuditService,
        request.tenant,
        { code: audit.code },
      );
    const fields = [
      "status",
      "planFingerprint",
      "appliedChangeCount",
      "recoveryOperationId",
      "preview",
    ];
    if (
      current.length !== 1 ||
      fields.some(
        (key) =>
          this.auditDigest(current[0][key]) !== this.auditDigest(audit[key]),
      )
    )
      throw new CLASSES.NodicsError(
        "ERR_AUTH_00003",
        "Migration audit changed during inspection",
      );
    return {
      code: "SUC_SYS_00000",
      data: {
        auditCode: audit.code,
        fingerprint: audit.planFingerprint,
        status: audit.status,
        recordedAppliedCount: audit.appliedChangeCount,
        states: states.map((state, index) => ({ index, state })),
        locked: ["RECOVERING", "ROLLING_BACK"].includes(audit.status),
        atomicSnapshot: false,
        readyForApply: false,
        effects: false,
        credentialsRestored: false,
      },
    };
  },
  /** Recovers exact structural pre/post states under the original persisted operation fence; reviewed crash resumption never takes a new lease. @param {Object} request Reviewed current operator command. @returns {Promise<Object>} Audit progress; not canonical linking or installed acceptance. */
  recoverReviewedMigration: async function (request) {
    const audit = await this.recoveryAudit(request);
    const maximum = this.getPolicy().recoveryInspectionMaximumChanges;
    if (
      !Number.isSafeInteger(maximum) ||
      maximum < 1 ||
      maximum > 10000 ||
      audit.preview.changes.length > maximum
    )
      throw new CLASSES.NodicsError("ERR_AUTH_00003");
    for (let index = 0; index < audit.preview.changes.length; index++) {
      const state = await this.structuralChangeState(
        request,
        audit.preview.changes[index],
      );
      if (index < audit.appliedChangeCount && state !== "AFTER")
        throw new CLASSES.NodicsError("ERR_AUTH_00003");
    }
    if (audit.status === "APPLIED")
      return this.reviewedRecoveryProjection(audit);
    const recoveryOperationId =
      audit.status === "RECOVERING"
        ? audit.recoveryOperationId
        : crypto.randomUUID();
    if (!/^[a-f0-9-]{36}$/.test(recoveryOperationId || ""))
      throw new CLASSES.NodicsError("ERR_AUTH_00003");
    if (audit.status !== "RECOVERING")
      await this.updateAudit(
        request,
        audit.code,
        audit.status,
        { status: "RECOVERING", recoveryOperationId },
        {
          appliedChangeCount: audit.appliedChangeCount,
          planFingerprint: audit.planFingerprint,
        },
      );
    for (
      let index = audit.appliedChangeCount;
      index < audit.preview.changes.length;
      index++
    ) {
      const change = audit.preview.changes[index];
      if ((await this.structuralChangeState(request, change)) === "BEFORE")
        await this.updatePrincipal(request, change);
      if ((await this.structuralChangeState(request, change)) !== "AFTER")
        throw new CLASSES.NodicsError("ERR_AUTH_00003");
      await this.updateAudit(
        request,
        audit.code,
        "RECOVERING",
        {
          appliedChangeCount: index + 1,
        },
        {
          recoveryOperationId,
          appliedChangeCount: index,
          planFingerprint: audit.planFingerprint,
        },
      );
    }
    for (const change of audit.preview.changes)
      if ((await this.structuralChangeState(request, change)) !== "AFTER")
        throw new CLASSES.NodicsError("ERR_AUTH_00003");
    const completed = await this.updateAudit(
      request,
      audit.code,
      "RECOVERING",
      {
        status: "APPLIED",
        result: { changed: audit.preview.changeCount, recovered: true },
      },
      {
        recoveryOperationId,
        appliedChangeCount: audit.preview.changeCount,
        planFingerprint: audit.planFingerprint,
      },
    );
    return this.reviewedRecoveryProjection(completed);
  },
  /** Projects only committed structural recovery progress, never identity-linking evidence. @param {Object} audit Owner-confirmed audit. @returns {Object} Redacted replay-safe outcome. */
  reviewedRecoveryProjection: function (audit) {
    return {
      code: "SUC_SYS_00000",
      data: {
        auditCode: audit.code,
        status: "APPLIED",
        changed: audit.preview.changeCount,
      },
    };
  },
  /** Computes a credential-free reviewed structural-plan fingerprint; this is not canonical identity linking or uniqueness approval. */
  planFingerprint: function (preview) {
    return crypto
      .createHash("sha256")
      .update(JSON.stringify(this.assessmentCanonical(preview)))
      .digest("hex");
  },
  /** Admits an explicitly reviewed structural migration from fresh canonical platform PASSWORD proof; target execution remains disabled by default. */
  applyReviewedMigration: async function (request) {
    const policy = this.getPolicy(),
      auth = request.authData || {},
      payload = request.identityMigration || {};
    if (
      policy.reviewedApplyEnabled !== true ||
      policy.reviewedApplyQualified !== true ||
      auth.tokenType !== "access" ||
      auth.principalType !== "human" ||
      auth.authenticationMethod !== "PASSWORD" ||
      auth.isSystem ||
      auth.sessionContext ||
      auth.tenant !== request.tenant ||
      !SERVICE.DefaultEnterpriseManagementService.isPlatformAdministrator(auth)
    )
      throw new CLASSES.NodicsError(
        "ERR_AUTH_00003",
        "Reviewed migration is unavailable",
      );
    SERVICE.DefaultEnterpriseMembershipService.permission(
      request,
      "identity.migration.apply",
    );
    await SERVICE.DefaultPrincipalSecurityStampService.validate(auth);
    const principals =
      await SERVICE.DefaultPrincipalSecurityStampGovernanceService.inventory(
        SERVICE.DefaultEmployeeService,
        request.tenant,
        { loginId: auth.loginId },
      );
    if (
      principals.length !== 1 ||
      principals[0].active !== true ||
      principals[0].principalType !== "human" ||
      principals[0].disabled === true ||
      principals[0].registrationSuspended === true ||
      principals[0].authenticationIdentity ||
      principals[0].authVersion !== auth.authVersion ||
      Object.keys(payload).sort().join(",") !==
        "confirmed,fingerprint,migrationVersion" ||
      payload.confirmed !== true ||
      !/^[a-f0-9]{64}$/.test(payload.fingerprint || "") ||
      !Number.isSafeInteger(payload.migrationVersion)
    )
      throw new CLASSES.NodicsError("ERR_AUTH_00003");
    const state = await SERVICE.DefaultUserStateService.findUserState({
      tenant: request.tenant,
      loginId: principals[0].loginId,
      _id: principals[0]._id,
    });
    if (!state || state.locked) throw new CLASSES.NodicsError("ERR_AUTH_00003");
    if (
      Object.keys(request.query || {}).length ||
      Object.keys(request.httpRequest?.query || {}).length
    )
      throw new CLASSES.NodicsError("ERR_AUTH_00003");
    reviewedMigrationPlans.set(request, {
      fingerprint: payload.fingerprint,
      version: payload.migrationVersion,
    });
    try {
      return await this.applyMigration(request);
    } finally {
      reviewedMigrationPlans.delete(request);
    }
  },
  /**
   * Rejects assessment uncertainty without disclosing provider or identity data.
   * @returns {never} Always throws the Profile assessment rejection error.
   */
  rejectAssessment: function () {
    throw new CLASSES.NodicsError("ERR_PROFILE_IDENTITY_ASSESSMENT");
  },
  /**
   * Admits only an explicitly enabled, empty command from a human platform owner.
   * @param {Object} request Authenticated request; caller scope selectors are not supported.
   * @returns {Object} Validated layered limits and authority tenant.
   */
  assessmentContext: function (request, review = false) {
    const policy = this.getPolicy().assessment || {};
    const auth = request.authData || {};
    const tenant =
      SERVICE.DefaultEnterpriseManagementService.assignmentTenant();
    const groups = [].concat(
      auth.userGroups || [],
      auth.allUserGroupCodes || [],
    );
    if (
      policy.enabled !== true ||
      auth.tokenType !== "access" ||
      auth.principalType !== "human" ||
      auth.isSystem ||
      !this.getActor(request) ||
      auth.tenant !== tenant ||
      request.tenant !== tenant ||
      auth.entCode !== CONFIG.get("defaultEnterprise") ||
      !groups.includes("runtimeConfigAdminUserGroup") ||
      groups.includes("serviceAccountUserGroup") ||
      !Array.isArray(auth.permissions) ||
      !auth.permissions.includes("identity.migration.preview")
    ) {
      this.rejectAssessment();
    }
    for (const value of [
      request.identityMigration,
      request.httpRequest && request.httpRequest.body,
      request.query,
      request.httpRequest && request.httpRequest.query,
    ]) {
      if (
        value !== undefined &&
        (!value ||
          typeof value !== "object" ||
          Array.isArray(value) ||
          (review && (value === request.identityMigration || value === request.httpRequest?.body)
            ? Object.keys(value).sort().join() !== "confirmed,reviewToken"
            : Object.keys(value).length))
      ) {
        this.rejectAssessment();
      }
    }
    for (const key of [
      "pageSize",
      "maximumPages",
      "maximumTenants",
      "maximumRecords",
    ]) {
      if (!Number.isSafeInteger(policy[key]) || policy[key] < 1)
        this.rejectAssessment();
    }
    return { tenant, policy };
  },
  /**
   * Declares existing generated owners and a credential-free read projection.
   * @returns {Object} Collection descriptors; later layers may extend safe metadata fields.
   */
  assessmentSources: function () {
    const principal = [
      "loginId",
      "principalType",
      "password",
      "userGroups",
      "authVersion",
      "disabled",
      "registrationSuspended",
      "registrationAssignmentCode",
      "authenticationIdentity.tenantCode",
      "authenticationIdentity.recordKind",
      "authenticationIdentity.recordId",
    ];
    return {
      tenants: { service: "DefaultTenantService", fields: [] },
      enterprises: {
        service: "DefaultEnterpriseService",
        fields: ["tenant"],
      },
      assignments: {
        service: "DefaultEnterpriseAccessAssignmentService",
        fields: [
          "normalizedEmail",
          "enterpriseCode",
          "tenantCode",
          "status",
          "identityClaimed",
          "registeredLoginId",
          "registration.phase",
          "registration.employeeCode",
          "registration.passwordCode",
          "membership.phase",
          "membership.identity.tenantCode",
          "membership.identity.recordKind",
          "membership.identity.recordId",
          "membership.projectionId",
        ],
      },
      employees: { service: "DefaultEmployeeService", fields: principal },
      customers: { service: "DefaultCustomerService", fields: principal },
      passwords: {
        service: "DefaultPasswordService",
        codeOptional: true,
        fields: ["loginId"],
      },
      groups: {
        service: "DefaultUserGroupService",
        fields: ["parentGroups"],
      },
    };
  },
  /**
   * Converts a persisted reference without accepting populated objects or guessing an ID.
   * @param {*} value String or database ObjectId reference.
   * @returns {string|null} Unambiguous reference, or null for operator review.
   */
  assessmentReference: function (value) {
    if (typeof value === "string" && value.length > 0) return value;
    if (value && typeof value.toHexString === "function")
      return value.toHexString();
    return null;
  },
  /**
   * Canonicalizes observed metadata for pass comparison, never for authentication.
   * @param {*} value Projected metadata.
   * @returns {*} Deterministically ordered JSON-compatible metadata.
   */
  assessmentCanonical: function (value) {
    if (value === undefined) return null;
    if (value instanceof Date) return value.toISOString();
    if (value && typeof value.toHexString === "function")
      return value.toHexString();
    if (Array.isArray(value))
      return value.map((item) => this.assessmentCanonical(item));
    if (value && typeof value === "object")
      return Object.fromEntries(
        Object.keys(value)
          .sort()
          .map((key) => [key, this.assessmentCanonical(value[key])]),
      );
    return value;
  },
  /**
   * Reads all counted pages through the generated owner; partial reads never mean absence.
   * @param {Object} context Admitted authority and limits.
   * @param {string} tenant Registry-derived tenant.
   * @param {Object} source Generated owner and field projection.
   * @param {Object} budget Shared per-pass record budget.
   * @returns {Promise<Object[]>} Complete observed collection metadata.
   */
  assessmentInventory: async function (context, tenant, source, budget) {
    const fields = [
      "_id",
      "code",
      "active",
      "revision",
      "versionId",
      "updated",
    ].concat(source.fields);
    const projection = Object.fromEntries(fields.map((field) => [field, 1]));
    const rows = [],
      seen = new Set(),
      codes = new Set();
    let total;
    for (let page = 1; page <= context.policy.maximumPages; page++) {
      const response = await SERVICE[source.service].get(
        this.systemRequest(
          { tenant },
          {
            query: {},
            searchOptions: {
              projection,
              sort: { _id: 1 },
              pageSize: context.policy.pageSize,
              pageNumber: page,
            },
          },
        ),
      );
      if (
        !response ||
        response.success === false ||
        typeof response.code !== "string" ||
        !response.code.startsWith("SUC_") ||
        !Array.isArray(response.result) ||
        (response.errors !== undefined &&
          (!Array.isArray(response.errors) || response.errors.length)) ||
        !Number.isSafeInteger(response.count) ||
        response.count < 0 ||
        response.result.length > context.policy.pageSize ||
        (total !== undefined && total !== response.count)
      )
        this.rejectAssessment();
      total = response.count;
      for (const row of response.result) {
        const id = row && this.assessmentReference(row._id);
        // Password inherits super, not base: its canonical reference is _id.
        const hasCode = row && row.code !== undefined;
        if (
          !id ||
          (!hasCode && source.codeOptional !== true) ||
          (hasCode && (typeof row.code !== "string" || !row.code)) ||
          seen.has(id) ||
          (hasCode && codes.has(row.code)) ||
          ++budget.records > context.policy.maximumRecords
        )
          this.rejectAssessment();
        seen.add(id);
        if (hasCode) codes.add(row.code);
        // Project again so a provider ignoring projection cannot retain credential bodies.
        const item = {};
        for (const field of fields) {
          const value = field
            .split(".")
            .reduce((current, part) => current && current[part], row);
          item[field] =
            field === "password"
              ? this.assessmentReference(value)
              : field === "tenant" && value && typeof value === "object"
                ? value.code
                : value;
        }
        rows.push(item);
      }
      if (rows.length > total) this.rejectAssessment();
      if (response.result.length < context.policy.pageSize) {
        if (rows.length !== total) this.rejectAssessment();
        return rows;
      }
    }
    this.rejectAssessment();
  },
  /**
   * Inventories registry tenants, enterprise targets and assignment targets without excluding inactive history.
   * @param {Object} context Admitted authority and limits.
   * @returns {Promise<Object>} One bounded observed pass over existing Profile owners.
   */
  assessmentState: async function (context) {
    const sources = this.assessmentSources(),
      budget = { records: 0 },
      state = { partitions: [] };
    for (const kind of ["tenants", "enterprises", "assignments"]) {
      state[kind] = await this.assessmentInventory(
        context,
        context.tenant,
        sources[kind],
        budget,
      );
    }
    const tenants = new Set([
      context.tenant,
      ...state.tenants.map((row) => row.code),
    ]);
    for (const row of state.enterprises) {
      if (typeof row.tenant !== "string" || !row.tenant)
        this.rejectAssessment();
      tenants.add(row.tenant);
    }
    for (const row of state.assignments) {
      if (typeof row.tenantCode === "string" && row.tenantCode)
        tenants.add(row.tenantCode);
    }
    if (tenants.size > context.policy.maximumTenants) this.rejectAssessment();
    for (const tenant of Array.from(tenants).sort()) {
      const partition = { tenant };
      for (const kind of ["employees", "customers", "passwords", "groups"]) {
        partition[kind] = await this.assessmentInventory(
          context,
          tenant,
          sources[kind],
          budget,
        );
      }
      state.partitions.push(partition);
    }
    return state;
  },
  /**
   * Uses the existing email policy without rewriting aliases or legacy non-email logins.
   * @param {*} value Persisted login or normalized email.
   * @returns {string|null} Canonical email when valid; otherwise a review-only legacy value.
   */
  assessmentEmail: function (value) {
    if (typeof value !== "string") return null;
    try {
      return SERVICE.DefaultEnterpriseManagementService.normalizeEmail(value);
    } catch (error) {
      return null;
    }
  },
  /**
   * Classifies conflicts without deciding canonical identity or modifying any record.
   * @param {Object} state Matching observed inventory.
   * @param {string} authority Profile registry tenant.
   * @param {Function} opaque Per-run keyed reference function; no raw identifiers leave this method.
   * @returns {Object} Redacted counts and review findings, never an executable migration plan.
   */
  classifyIdentityAssessment: function (state, authority, opaque) {
    const findings = [],
      emails = new Map(),
      claims = new Map();
    const counts = {
      tenants: state.partitions.length,
      enterprises: state.enterprises.length,
      assignments: state.assignments.length,
      employees: 0,
      customers: 0,
      servicePrincipals: 0,
      passwords: 0,
    };
    const reference = (tenant, kind, row) =>
      opaque([tenant, kind, this.assessmentReference(row._id)]);
    const add = (code, references) =>
      findings.push({
        code: "RSN_PROFILE_IDENTITY_" + code,
        references: Array.from(new Set(references)).sort(),
      });
    const group = (map, key, item) => {
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(item);
    };
    const enterpriseMap = new Map(
      state.enterprises.map((row) => [row.code, row]),
    );
    const assignments = new Map(
      state.assignments.map((row) => [row.code, row]),
    );
    const identityKey = (tenant, kind, id) =>
      JSON.stringify([tenant, kind, id]);
    const principalMap = new Map();
    for (const partition of state.partitions)
      for (const [collection, kind] of [
        ["employees", "EMPLOYEE"],
        ["customers", "CUSTOMER"],
      ]) {
        for (const row of partition[collection])
          principalMap.set(
            identityKey(
              partition.tenant,
              kind,
              this.assessmentReference(row._id),
            ),
            row,
          );
      }
    const bindingKey = (row) =>
      identityKey(
        row["authenticationIdentity.tenantCode"],
        row["authenticationIdentity.recordKind"],
        row["authenticationIdentity.recordId"],
      );
    const hasBinding = (row) =>
      ["tenantCode", "recordKind", "recordId"].some(
        (key) => row["authenticationIdentity." + key] !== undefined,
      );
    for (const partition of state.partitions) {
      const passwords = new Map(
        partition.passwords.map((row) => [
          this.assessmentReference(row._id),
          row,
        ]),
      );
      const groups = new Set(partition.groups.map((row) => row.code)),
        used = new Map();
      counts.passwords += partition.passwords.length;
      for (const kind of ["employees", "customers"])
        for (const row of partition[kind]) {
          counts[kind]++;
          const ref = reference(partition.tenant, kind, row);
          const self = identityKey(
            partition.tenant,
            kind === "employees" ? "EMPLOYEE" : "CUSTOMER",
            this.assessmentReference(row._id),
          );
          const linked = hasBinding(row),
            targetKey = linked ? bindingKey(row) : self;
          const target = principalMap.get(targetKey);
          const canonicalTarget = Boolean(
            target && (!hasBinding(target) || bindingKey(target) === targetKey),
          );
          if (linked && (!canonicalTarget || target.active !== true))
            add("INVALID_CANONICAL_BINDING", [ref]);
          if (
            linked &&
            canonicalTarget &&
            this.assessmentEmail(target.loginId) !==
              this.assessmentEmail(row.loginId)
          )
            add("CANONICAL_LOGIN_MISMATCH", [ref]);
          const credential = this.assessmentReference(row.password);
          if (linked && targetKey !== self && credential)
            add("PROJECTION_CREDENTIAL_COPY", [ref]);
          if (credential) group(used, credential, ref);
          const policy = this.getPolicy();
          const service =
            kind === "employees" &&
            (row.principalType === "service" ||
              (Array.isArray(row.userGroups) &&
                row.userGroups.includes(policy.serviceGroup)) ||
              (policy.servicePrincipalCodes || []).includes(row.code));
          if (service) {
            counts.servicePrincipals++;
            continue;
          }
          if (
            row.principalType !== (kind === "employees" ? "human" : "customer")
          )
            add("PRINCIPAL_TYPE_REVIEW", [ref]);
          const email = this.assessmentEmail(row.loginId);
          if (!email) add("NON_EMAIL_LOGIN_REVIEW", [ref]);
          else {
            group(emails, email, {
              kind,
              ref,
              identity: linked && canonicalTarget ? targetKey : self,
            });
            if (row.loginId !== email) add("NORMALIZATION_VARIANT", [ref]);
          }
          if (
            (!credential || !passwords.has(credential)) &&
            !(linked && targetKey !== self && canonicalTarget)
          )
            add("MISSING_CREDENTIAL", [ref]);
          else if (
            credential &&
            passwords.has(credential) &&
            passwords.get(credential).loginId !== row.loginId
          )
            add("CREDENTIAL_LOGIN_MISMATCH", [ref]);
          if (
            !Array.isArray(row.userGroups) ||
            row.userGroups.some((code) => !groups.has(code))
          )
            add("UNRESOLVED_GROUP", [ref]);
          if (
            row.registrationAssignmentCode &&
            !assignments.has(row.registrationAssignmentCode)
          )
            add("MISSING_REGISTRATION_ASSIGNMENT", [ref]);
          const assignment = assignments.get(row.registrationAssignmentCode);
          if (
            assignment &&
            (assignment.tenantCode !== partition.tenant ||
              kind !== "employees" ||
              (assignment["registration.employeeCode"] &&
                assignment["registration.employeeCode"] !== row.code) ||
              (assignment.registeredLoginId &&
                assignment.registeredLoginId !== row.loginId))
          ) {
            add("ASSIGNMENT_PRINCIPAL_MISMATCH", [
              ref,
              reference(authority, "assignments", assignment),
            ]);
          }
        }
      for (const row of partition.passwords) {
        const ref = reference(partition.tenant, "passwords", row);
        const users = used.get(this.assessmentReference(row._id)) || [];
        if (!users.length) add("ORPHAN_CREDENTIAL_REVIEW", [ref]);
        if (users.length > 1) add("SHARED_CREDENTIAL_REVIEW", [ref, ...users]);
      }
      for (const row of partition.groups) {
        if (
          row.parentGroups !== undefined &&
          (!Array.isArray(row.parentGroups) ||
            row.parentGroups.some((code) => !groups.has(code)))
        )
          add("UNRESOLVED_PARENT_GROUP", [
            reference(partition.tenant, "groups", row),
          ]);
      }
    }
    for (const identities of emails.values()) {
      const employees = identities.filter((row) => row.kind === "employees");
      const customers = identities.filter((row) => row.kind === "customers");
      if (new Set(employees.map((row) => row.identity)).size > 1)
        add(
          "DUPLICATE_EMPLOYEE_EMAIL",
          employees.map((row) => row.ref),
        );
      if (new Set(customers.map((row) => row.identity)).size > 1)
        add(
          "DUPLICATE_CUSTOMER_EMAIL",
          customers.map((row) => row.ref),
        );
      if (
        employees.length &&
        customers.length &&
        new Set(identities.map((row) => row.identity)).size > 1
      )
        add(
          "UNPROVEN_DUAL_IDENTITY",
          identities.map((row) => row.ref),
        );
    }
    for (const row of state.assignments) {
      const ref = reference(authority, "assignments", row),
        enterprise = enterpriseMap.get(row.enterpriseCode);
      const email = this.assessmentEmail(row.normalizedEmail);
      if (!email || email !== row.normalizedEmail)
        add("ASSIGNMENT_EMAIL_REVIEW", [ref]);
      if (!enterprise) add("MISSING_ENTERPRISE", [ref]);
      else if (enterprise.tenant !== row.tenantCode)
        add("ASSIGNMENT_TENANT_MISMATCH", [ref]);
      if (row.identityClaimed === true && email) group(claims, email, ref);
      const phase = row["registration.phase"];
      if (phase && phase !== ENUMS.ProfileRegistrationPhase.COMPLETE.key)
        add("REGISTRATION_IN_PROGRESS", [ref]);
      const partition = state.partitions.find(
        (item) => item.tenant === row.tenantCode,
      );
      if (
        row.registeredLoginId &&
        (!partition ||
          !partition.employees.some(
            (person) => person.loginId === row.registeredLoginId,
          ))
      ) {
        add("MISSING_REGISTERED_EMPLOYEE", [ref]);
      }
      for (const [field, kind] of [
        ["registration.employeeCode", "employees"],
        ["registration.passwordCode", "passwords"],
      ]) {
        if (
          row[field] &&
          (!partition ||
            !partition[kind].some((item) => item.code === row[field]))
        )
          add("MISSING_REGISTRATION_ARTIFACT", [ref]);
      }
    }
    for (const refs of claims.values())
      if (refs.length > 1) add("DUPLICATE_IDENTITY_CLAIM", refs);
    findings.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
    return { counts, findings, reviewRequired: findings.length > 0 };
  },
  /**
   * Returns two-pass observed evidence only; no writes, indexes, sessions or delivery occur.
   * @param {Object} request Empty command with human platform-owner access.
   * @returns {Promise<Object>} Redacted report with run-local handles and explicit non-atomicity.
   */
  assessIdentities: async function (request) {
    return this.assessIdentityObservation(request, false);
  },
  /** Reviews only a source-matched bootstrap observation under original fresh human authority, with an explicit audit but no identity writes or grants. @param {Object} request Explicit bounded confirmation. @returns {Promise<Object>} Preserved findings and reviewed evidence. */
  reviewBootstrapIdentities: async function (request) {
    return this.assessIdentityObservation(request, true);
  },
  /** Reads a fresh matching two-pass observation for either fixed entry point. @param {Object} request Authorized command. @param {boolean} review Internal operation selector. @returns {Promise<Object>} Redacted owner evidence. */
  assessIdentityObservation: async function (request, review) {
    try {
      const context = this.assessmentContext(request, review);
      const crypto = require("crypto"),
        key = crypto.randomBytes(32);
      const opaque = (value) =>
        crypto
          .createHmac("sha256", key)
          .update(JSON.stringify(this.assessmentCanonical(value)))
          .digest("hex");
      const first = await this.assessmentState(context);
      const fingerprint = opaque(first);
      const second = await this.assessmentState(context);
      if (fingerprint !== opaque(second)) this.rejectAssessment();
      const report = this.classifyIdentityAssessment(second, context.tenant, opaque);
      let bootstrapReview;
      const policy = context.policy.bootstrapReview;
      if (review || policy?.enabled === true && report.findings.length) {
        const owner = policy && SERVICE[policy.ownerService];
        if (!owner || typeof owner.challenge !== "function" || typeof owner.review !== "function") this.rejectAssessment();
        if (review) bootstrapReview = await owner.review(request, second, report);
        else {
          try { bootstrapReview = await owner.challenge(request, second, report); }
          catch { bootstrapReview = { version: 1, disposition: "UNRESOLVED", findingCount: report.findings.length }; }
        }
        // Source/operator comparison awaits reads; confirm the installed observation still matches afterward.
        const final = await this.assessmentState(context);
        if (fingerprint !== opaque(final)) this.rejectAssessment();
        if (review) {
          if (typeof owner.recordReview !== "function") this.rejectAssessment();
          bootstrapReview = await owner.recordReview(request, bootstrapReview);
        }
      }
      return {
        code: "SUC_SYS_00000",
        data: {
          ...report,
          ...(bootstrapReview ? { bootstrapReview } : {}),
          contractVersion: 1,
          assessmentId: crypto.randomUUID(),
          observedAt: new Date().toISOString(),
          inventoryComplete: true,
          consistency:
            ENUMS.ProfileIdentityAssessmentConsistency.TWO_PASS_OBSERVED_MATCH
              .key,
          atomicSnapshot: false,
          readyForApply: false,
          fingerprint,
        },
      };
    } catch (error) {
      this.rejectAssessment();
    }
  },
  /** Returns the effective layered identity migration policy. */
  getPolicy: function () {
    return CONFIG.get("identityGovernance").migration || {};
  },
  /** Resolves the tenant receiving migration operations. */
  getTenant: function (request) {
    return request.tenant || CONFIG.get("defaultTenant") || "default";
  },
  /** Resolves the authenticated governance actor. */
  getActor: function (request) {
    let authData = request.authData || request.autData || {};
    return (
      authData.loginId ||
      authData.serviceId ||
      authData.code ||
      authData.userId ||
      authData.uid ||
      authData.email
    );
  },
  /** Creates a trusted generated-service request scoped to the migration tenant. */
  systemRequest: function (request, additions) {
    let baseRequest = {
      tenant: this.getTenant(request),
      authData: SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
      options: { recursive: false, skipItemCache: true },
    };
    let mergedRequest = Object.assign({}, baseRequest, additions || {});
    mergedRequest.options = Object.assign(
      {},
      baseRequest.options,
      additions && additions.options ? additions.options : {},
    );
    return mergedRequest;
  },
  /** Loads governance groups from durable tenant model state, bypassing item-cache snapshots. */
  loadGroups: function (request) {
    return SERVICE.DefaultPrincipalSecurityStampGovernanceService.inventory(
      SERVICE.DefaultUserGroupService,
      this.getTenant(request),
      {},
    );
  },
  /** Loads groups, principals, and owned profile resources without recursive population. */
  loadState: function (request) {
    return Promise.all([
      this.loadGroups(request),
      ...[
        SERVICE.DefaultEmployeeService,
        SERVICE.DefaultCustomerService,
        SERVICE.DefaultAddressService,
        SERVICE.DefaultContactService,
      ].map((service) =>
        SERVICE.DefaultPrincipalSecurityStampGovernanceService.inventory(
          service,
          this.getTenant(request),
          {},
        ),
      ),
    ]).then((results) => ({
      groups: results[0] || [],
      employees: results[1],
      customers: results[2],
      addresses: results[3],
      contacts: results[4],
    }));
  },
  /** Removes credential material from a principal audit snapshot. */
  sanitizePrincipal: function (principal) {
    return {
      _id: principal._id,
      code: principal.code,
      loginId: principal.loginId,
      principalType: principal.principalType,
      userGroups: [].concat(principal.userGroups || []),
      identityMigrationVersion: principal.identityMigrationVersion,
      ownerId: principal.ownerId,
      ownerType: principal.ownerType,
      createdBy: principal.createdBy,
      updatedBy: principal.updatedBy,
      apiKeyStatus:
        principal.apiKey || principal.apiKeyHash
          ? principal.apiKeyStatus || "active"
          : principal.apiKeyStatus,
      hadApiKey: Boolean(principal.apiKey || principal.apiKeyHash),
      hadLegacyPlaintextAPIKey: Boolean(principal.apiKey),
    };
  },
  /** Captures only the structural records present in the preview change set. */
  snapshot: function (preview) {
    return {
      changes: preview.changes.map((change) => ({
        schema: change.schema,
        code: change.code,
        from: change.from,
      })),
    };
  },
  /** Computes a safe target without downgrading custom service principals. */
  targetPrincipal: function (principal, type) {
    let policy = this.getPolicy();
    let configuredService =
      type === "employee" &&
      (policy.servicePrincipalCodes || []).includes(principal.code);
    let isService =
      type === "employee" &&
      (configuredService ||
        principal.principalType === "service" ||
        (principal.userGroups || []).includes(policy.serviceGroup));
    let isAdmin =
      type === "employee" &&
      (policy.administratorCodes || []).includes(principal.code);
    let serviceGroups = configuredService
      ? [policy.serviceGroup]
      : Array.from(
          new Set(
            []
              .concat(principal.userGroups || [], policy.serviceGroup)
              .filter(Boolean),
          ),
        );
    return {
      principalType:
        type === "customer" ? "customer" : isService ? "service" : "human",
      userGroups:
        type === "customer"
          ? [policy.customerGroup]
          : isService
            ? serviceGroups
            : isAdmin
              ? policy.administratorGroups
              : principal.userGroups && principal.userGroups.length
                ? principal.userGroups.filter(
                    (group) => group !== policy.serviceGroup,
                  )
                : [policy.humanDefaultGroup],
      revokeAPIKey: !isService && Boolean(principal.apiKey),
      rotationRequired:
        isService &&
        (Boolean(principal.apiKey) ||
          !principal.apiKeyHash ||
          principal.identityMigrationVersion !== (policy.version || 1)),
      revokeLegacyAPIKey: isService && Boolean(principal.apiKey),
      ownerId: type === "customer" ? principal.loginId : principal.ownerId,
      ownerType: type === "customer" ? "customer" : principal.ownerType,
      createdBy:
        type === "customer"
          ? principal.createdBy || principal.loginId
          : principal.createdBy,
      updatedBy: type === "customer" ? principal.loginId : principal.updatedBy,
      identityMigrationVersion: policy.version || 1,
    };
  },
  /** Builds address and contact ownership backfill changes from customer references. */
  buildOwnedResourceChanges: function (state) {
    let changes = [],
      ownership = { address: {}, contact: {} };
    state.customers.forEach((customer) => {
      [
        ["address", customer.addresses || []],
        ["contact", customer.contacts || []],
      ].forEach((entry) =>
        entry[1].forEach((code) => {
          let existing = ownership[entry[0]][code];
          if (existing && existing !== customer.loginId)
            throw new CLASSES.NodicsError(
              "ERR_AUTH_00003",
              "Shared customer-owned resource requires explicit ownership resolution: " +
                entry[0] +
                ":" +
                code,
            );
          ownership[entry[0]][code] = customer.loginId;
        }),
      );
    });
    [
      ["address", state.addresses || []],
      ["contact", state.contacts || []],
    ].forEach((entry) =>
      entry[1].forEach((record) => {
        let ownerId = ownership[entry[0]][record.code];
        if (
          !ownerId ||
          (record.ownerId === ownerId && record.ownerType === "customer")
        )
          return;
        changes.push({
          schema: entry[0],
          code: record.code,
          from: {
            _id: record._id,
            code: record.code,
            ownerId: record.ownerId,
            ownerType: record.ownerType,
            createdBy: record.createdBy,
            updatedBy: record.updatedBy,
          },
          to: {
            ownerId: ownerId,
            ownerType: "customer",
            createdBy: record.createdBy || ownerId,
            updatedBy: ownerId,
          },
        });
      }),
    );
    return changes;
  },
  /** Builds the complete idempotent migration change set. */
  buildPreview: function (state) {
    let changes = [],
      serviceKeyRotationsRequired = [];
    let groupTargets = this.getPolicy().groupTargets || {};
    state.groups.forEach((group) => {
      let target = groupTargets[group.code];
      if (!target) return;
      let parentsChanged =
        JSON.stringify(group.parentGroups || []) !==
        JSON.stringify(target.parentGroups || []);
      let permissionsChanged =
        target.permissions &&
        JSON.stringify(group.permissions || []) !==
          JSON.stringify(target.permissions);
      if (parentsChanged || permissionsChanged)
        changes.push({
          schema: "userGroup",
          code: group.code,
          from: {
            _id: group._id,
            code: group.code,
            parentGroups: [].concat(group.parentGroups || []),
            permissions: [].concat(group.permissions || []),
          },
          to: target,
        });
    });
    changes = changes.concat(this.buildOwnedResourceChanges(state));
    state.employees.forEach((principal) => {
      if (principal.authenticationIdentity) return;
      let target = this.targetPrincipal(principal, "employee");
      if (target.rotationRequired)
        serviceKeyRotationsRequired.push(principal.code);
      let rotationStateChanged =
        target.rotationRequired &&
        principal.apiKeyStatus !== "rotation_required";
      if (
        principal.principalType !== target.principalType ||
        JSON.stringify(principal.userGroups || []) !==
          JSON.stringify(target.userGroups) ||
        principal.identityMigrationVersion !==
          target.identityMigrationVersion ||
        target.revokeAPIKey ||
        target.revokeLegacyAPIKey ||
        rotationStateChanged
      ) {
        changes.push({
          schema: "employee",
          code: principal.code,
          from: this.sanitizePrincipal(principal),
          to: target,
        });
      }
    });
    state.customers.forEach((principal) => {
      if (principal.authenticationIdentity) return;
      let target = this.targetPrincipal(principal, "customer");
      if (
        principal.principalType !== target.principalType ||
        JSON.stringify(principal.userGroups || []) !==
          JSON.stringify(target.userGroups) ||
        principal.identityMigrationVersion !==
          target.identityMigrationVersion ||
        principal.ownerId !== target.ownerId ||
        principal.ownerType !== target.ownerType ||
        target.revokeAPIKey
      ) {
        changes.push({
          schema: "customer",
          code: principal.code,
          from: this.sanitizePrincipal(principal),
          to: target,
        });
      }
    });
    return {
      migrationVersion: this.getPolicy().version || 1,
      changes: changes,
      changeCount: changes.length,
      serviceKeyRotationsRequired: serviceKeyRotationsRequired,
      idempotent: changes.length === 0,
    };
  },
  /** Returns a non-mutating migration preview response. */
  previewMigration: function (request) {
    return this.loadState(request).then((state) => {
      const preview = this.buildPreview(state);
      return {
        code: "SUC_SYS_00000",
        data: {
          ...preview,
          fingerprint: this.planFingerprint(preview),
          atomicSnapshot: false,
          scope: "LEGACY_STRUCTURAL",
          identityReconciliation: false,
        },
      };
    });
  },
  /** Applies one structural migration change without generating secrets. */
  updatePrincipal: function (request, change) {
    let target = change.to;
    const query = { code: change.code };
    if (change.from?._id) query._id = change.from._id;
    for (const key of Object.keys(target).filter(
      (key) =>
        !["revokeAPIKey", "revokeLegacyAPIKey", "rotationRequired"].includes(
          key,
        ),
    )) {
      query[key] =
        change.from[key] === undefined ? { $exists: false } : change.from[key];
    }
    const acknowledged = (response) => {
      if (
        !response ||
        !/^SUC_/.test(response.code || "") ||
        response.success === false ||
        response.error ||
        (response.errors &&
          (!Array.isArray(response.errors) || response.errors.length)) ||
        response.result?.acknowledged !== true ||
        response.result?.matchedCount !== 1
      )
        throw new CLASSES.NodicsError(
          "ERR_AUTH_00003",
          "Migration write was not exactly acknowledged",
        );
      return response;
    };
    if (change.schema === "userGroup") {
      return SERVICE.DefaultUserGroupService.update(
        this.systemRequest(request, { query, model: { $set: target } }),
      ).then(acknowledged);
    }
    if (change.schema === "address" || change.schema === "contact") {
      let ownedService =
        change.schema === "address"
          ? SERVICE.DefaultAddressService
          : SERVICE.DefaultContactService;
      return ownedService
        .update(
          this.systemRequest(request, {
            query,
            model: { $set: target },
          }),
        )
        .then(acknowledged);
    }
    let model = {
      $set: {
        principalType: target.principalType,
        userGroups: target.userGroups,
        identityMigrationVersion: target.identityMigrationVersion,
        ownerId: target.ownerId,
        ownerType: target.ownerType,
        createdBy: target.createdBy,
        updatedBy: target.updatedBy,
      },
    };
    if (
      target.revokeAPIKey ||
      target.revokeLegacyAPIKey ||
      target.rotationRequired
    ) {
      Object.assign(model.$set, {
        apiKeyStatus: target.rotationRequired ? "rotation_required" : "revoked",
        apiKeyExpiresAt: new Date(),
      });
      model.$unset = { apiKey: 1 };
    }
    let service =
      change.schema === "employee"
        ? SERVICE.DefaultEmployeeService
        : SERVICE.DefaultCustomerService;
    query.loginId = change.from.loginId;
    return service
      .update(this.systemRequest(request, { query, model }))
      .then(acknowledged);
  },
  /** Persists a redacted identity governance audit record. */
  saveAudit: async function (request, model) {
    let failure;
    try {
      const response = await SERVICE.DefaultIdentityMigrationAuditService.save(
        this.systemRequest(request, { model }),
      );
      SERVICE.DefaultEnterpriseRegistrationService.assertWrite(response);
    } catch (error) {
      failure = error;
    }
    const rows =
      await SERVICE.DefaultPrincipalSecurityStampGovernanceService.inventory(
        SERVICE.DefaultIdentityMigrationAuditService,
        this.getTenant(request),
        { code: model.code },
      );
    if (
      rows.length !== 1 ||
      Object.keys(model).some(
        (key) =>
          this.auditDigest(rows[0][key]) !== this.auditDigest(model[key]),
      )
    ) {
      if (failure) throw failure;
      throw new CLASSES.NodicsError(
        "ERR_AUTH_00003",
        "Migration audit persistence is unconfirmed",
      );
    }
    return rows[0];
  },
  /** Compares persisted JSON audit facts without credential material or serializer-specific missing fields. @param {*} value Audit projection. @returns {string} Stable digest. */
  auditDigest: function (value) {
    return this.planFingerprint(
      value === undefined ? null : JSON.parse(JSON.stringify(value)),
    );
  },
  /** Advances only a current audit phase and reconciles exact uncertain acknowledgements by bounded readback. @param {Object} request Trusted migration request. @param {string} code Audit. @param {string} from Expected phase. @param {Object} patch Non-secret progress. @param {Object} [expected] Owner-built operation fence, never caller fields. @returns {Promise<Object>} Exact persisted evidence. */
  updateAudit: async function (request, code, from, patch, expected = {}) {
    let failure;
    try {
      const response =
        await SERVICE.DefaultIdentityMigrationAuditService.update(
          this.systemRequest(request, {
            query: { ...expected, code, status: from },
            model: { $set: patch },
          }),
        );
      SERVICE.DefaultEnterpriseRegistrationService.assertWrite(response);
      if (
        response.result?.acknowledged !== true ||
        response.result?.matchedCount !== 1
      )
        throw new CLASSES.NodicsError("ERR_AUTH_00003");
    } catch (error) {
      failure = error;
    }
    const rows =
      await SERVICE.DefaultPrincipalSecurityStampGovernanceService.inventory(
        SERVICE.DefaultIdentityMigrationAuditService,
        this.getTenant(request),
        { code },
      );
    if (
      rows.length !== 1 ||
      rows[0].status !== (patch.status || from) ||
      Object.keys(expected).some(
        (key) =>
          !(key in patch) &&
          this.auditDigest(rows[0][key]) !== this.auditDigest(expected[key]),
      ) ||
      Object.keys(patch).some(
        (key) =>
          this.auditDigest(rows[0][key]) !== this.auditDigest(patch[key]),
      )
    ) {
      if (failure) throw failure;
      throw new CLASSES.NodicsError(
        "ERR_AUTH_00003",
        "Migration audit progress is unconfirmed",
      );
    }
    return rows[0];
  },
  /** Builds set/unset operators that accurately restore absent fields. */
  buildRestoreModel: function (source, properties) {
    let set = {},
      unset = {};
    properties.forEach((property) =>
      source[property] === undefined
        ? (unset[property] = 1)
        : (set[property] = source[property]),
    );
    let model = {};
    if (Object.keys(set).length > 0) model.$set = set;
    if (Object.keys(unset).length > 0) model.$unset = unset;
    return model;
  },
  /** Applies the versioned migration and reports pending credential rotations. */
  applyMigration: function (request) {
    return this.loadState(request).then((state) => {
      let preview = this.buildPreview(state);
      const reviewed = reviewedMigrationPlans.get(request);
      if (
        reviewed &&
        (reviewed.version !== preview.migrationVersion ||
          reviewed.fingerprint !== this.planFingerprint(preview))
      )
        throw new CLASSES.NodicsError(
          "ERR_AUTH_00003",
          "Reviewed migration plan changed",
        );
      let auditCode =
        "identityMigration_" +
        this.getTenant(request) +
        "_" +
        crypto.randomUUID();
      let audit = {
        code: auditCode,
        active: true,
        migrationVersion: preview.migrationVersion,
        status: "APPLYING",
        tenant: this.getTenant(request),
        requestedBy: this.getActor(request),
        preview: preview,
        snapshot: this.snapshot(preview),
        appliedChangeCount: 0,
        planFingerprint: this.planFingerprint(preview),
        correlationId: request.correlationId,
      };
      return this.saveAudit(request, audit).then(() => {
        return preview.changes
          .reduce(
            (promise, change, index) =>
              promise.then(async () => {
                await this.updatePrincipal(request, change);
                await this.updateAudit(request, auditCode, "APPLYING", {
                  appliedChangeCount: index + 1,
                });
                audit.appliedChangeCount = index + 1;
              }),
            Promise.resolve(),
          )
          .then(() => {
            audit.status = preview.idempotent ? "NO_CHANGES" : "APPLIED";
            audit.result = {
              changed: preview.changeCount,
              credentialsRevoked: preview.changes.filter(
                (change) =>
                  change.to.revokeAPIKey || change.to.revokeLegacyAPIKey,
              ).length,
              serviceKeyRotationsRequired: preview.serviceKeyRotationsRequired,
            };
            return this.updateAudit(request, auditCode, "APPLYING", {
              status: audit.status,
              result: audit.result,
            }).then(() => ({ code: "SUC_SYS_00000", data: audit }));
          })
          .catch((error) => {
            let failure = {
              code: error.code || "ERR_AUTH_00000",
              message:
                "Identity migration failed; inspect correlated server diagnostics",
            };
            return this.updateAudit(request, auditCode, "APPLYING", {
              status: "FAILED",
              result: { failure },
            })
              .catch(() => false)
              .then(() => {
                throw error;
              });
          });
      });
    });
  },
  /** Restores only records present in the audited change set. */
  rollbackMigration: function (request) {
    let payload = request.identityMigration || {};
    if (!payload.auditCode)
      return Promise.reject(
        new CLASSES.NodicsError(
          "ERR_AUTH_00003",
          "auditCode is required for identity migration rollback",
        ),
      );
    return SERVICE.DefaultIdentityMigrationAuditService.get(
      this.systemRequest(request, { query: { code: payload.auditCode } }),
    ).then((result) => {
      let audit = result.result && result.result[0];
      if (!audit || !audit.preview || !Array.isArray(audit.preview.changes))
        throw new CLASSES.NodicsError(
          "ERR_AUTH_00003",
          "Identity migration audit change set was not found",
        );
      if (audit.status === "ROLLED_BACK")
        return {
          code: "SUC_SYS_00000",
          data: {
            auditCode: payload.auditCode,
            status: "ROLLED_BACK",
            credentialsRestored: false,
            idempotent: true,
          },
        };
      let changes = audit.preview.changes;
      if (!["APPLIED", "NO_CHANGES"].includes(audit.status))
        throw new CLASSES.NodicsError(
          "ERR_AUTH_00003",
          "Partial migrations require inspected recovery",
        );
      return this.updateAudit(request, payload.auditCode, audit.status, {
        status: "ROLLING_BACK",
      })
        .then(() =>
          changes.reduce(
            (promise, change) =>
              promise.then(async () => {
                let item = change.from || {};
                const restore = async (service, model) => {
                  const response = await service.update(
                    this.systemRequest(request, {
                      query: this.restorationQuery(change),
                      model,
                    }),
                  );
                  SERVICE.DefaultEnterpriseRegistrationService.assertWrite(
                    response,
                  );
                  if (
                    response.result?.acknowledged !== true ||
                    response.result?.matchedCount !== 1
                  )
                    throw new CLASSES.NodicsError(
                      "ERR_AUTH_00003",
                      "Restoration requires one unchanged audited record",
                    );
                };
                if (change.schema === "userGroup")
                  return restore(SERVICE.DefaultUserGroupService, {
                    $set: {
                      parentGroups: item.parentGroups,
                      permissions: item.permissions,
                    },
                  });
                if (
                  change.schema === "address" ||
                  change.schema === "contact"
                ) {
                  let service =
                    change.schema === "address"
                      ? SERVICE.DefaultAddressService
                      : SERVICE.DefaultContactService;
                  return restore(
                    service,
                    this.buildRestoreModel(item, [
                      "ownerId",
                      "ownerType",
                      "createdBy",
                      "updatedBy",
                    ]),
                  );
                }
                let service =
                  change.schema === "customer"
                    ? SERVICE.DefaultCustomerService
                    : SERVICE.DefaultEmployeeService;
                let model = this.buildRestoreModel(item, [
                  "principalType",
                  "userGroups",
                  "identityMigrationVersion",
                  "ownerId",
                  "ownerType",
                  "createdBy",
                  "updatedBy",
                  "apiKeyStatus",
                ]);
                if (
                  change.to &&
                  (change.to.revokeAPIKey ||
                    change.to.revokeLegacyAPIKey ||
                    change.to.rotationRequired)
                ) {
                  model.$set = model.$set || {};
                  model.$set.apiKeyStatus = "revoked";
                  model.$unset = Object.assign({}, model.$unset || {}, {
                    apiKey: 1,
                  });
                }
                return restore(service, model);
              }),
            Promise.resolve(),
          ),
        )
        .then(() =>
          this.updateAudit(request, payload.auditCode, "ROLLING_BACK", {
            status: "ROLLED_BACK",
            result: {
              credentialsRestored: false,
              principalsRestored: changes.length,
            },
          }),
        )
        .then(() => ({
          code: "SUC_SYS_00000",
          data: {
            auditCode: payload.auditCode,
            status: "ROLLED_BACK",
            credentialsRestored: false,
          },
        }));
    });
  },
  /** Admits only an explicit reviewed completed structural rollback, never partial/canonical identity repair. @param {Object} request Fresh platform PASSWORD operator and exact audit evidence. @returns {Promise<Object>} Governed rollback result. */
  rollbackReviewedMigration: async function (request) {
    const p = this.getPolicy(),
      input = request.identityMigration || {},
      auth = request.authData || {};
    if (
      p.reviewedRollbackEnabled !== true ||
      p.reviewedRollbackQualified !== true ||
      auth.tokenType !== "access" ||
      auth.authenticationMethod !== "PASSWORD" ||
      auth.principalType !== "human" ||
      auth.sessionContext ||
      auth.isSystem ||
      !SERVICE.DefaultEnterpriseManagementService.isPlatformAdministrator(
        auth,
      ) ||
      auth.tenant !== request.tenant ||
      Object.keys(input).sort().join(",") !==
        "auditCode,confirmed,fingerprint" ||
      input.confirmed !== true ||
      typeof input.auditCode !== "string" ||
      input.auditCode.length > 192 ||
      !/^[a-f0-9]{64}$/.test(input.fingerprint || "") ||
      Object.keys(request.query || {}).length ||
      Object.keys(request.httpRequest?.query || {}).length
    )
      throw new CLASSES.NodicsError("ERR_AUTH_00003");
    await SERVICE.DefaultEnterpriseMembershipService.administrator(
      request,
      auth.entCode,
    );
    const audits =
      await SERVICE.DefaultPrincipalSecurityStampGovernanceService.inventory(
        SERVICE.DefaultIdentityMigrationAuditService,
        request.tenant,
        { code: input.auditCode },
      );
    const audit = audits[0];
    if (
      audits.length !== 1 ||
      audit.tenant !== request.tenant ||
      !["APPLIED", "NO_CHANGES"].includes(audit.status) ||
      audit.planFingerprint !== input.fingerprint ||
      this.planFingerprint(audit.preview) !== input.fingerprint ||
      audit.appliedChangeCount !== audit.preview.changeCount
    )
      throw new CLASSES.NodicsError("ERR_AUTH_00003");
    return this.rollbackMigration(request);
  },
  /** Guards restoration against changed post-apply facts rather than blindly overwriting current records. @param {Object} change Audited structural change. @returns {Object} Exact conditional query. */
  restorationQuery: function (change) {
    const query = {
      code: change.code,
      ...(change.from._id ? { _id: change.from._id } : {}),
    };
    for (const key of Object.keys(change.to || {}).filter(
      (key) =>
        !["revokeAPIKey", "revokeLegacyAPIKey", "rotationRequired"].includes(
          key,
        ),
    ))
      query[key] =
        change.to[key] === undefined ? { $exists: false } : change.to[key];
    if (change.schema === "employee" || change.schema === "customer")
      query.loginId = change.from.loginId;
    if (
      change.to.rotationRequired ||
      change.to.revokeAPIKey ||
      change.to.revokeLegacyAPIKey
    )
      query.apiKeyStatus = change.to.rotationRequired
        ? "rotation_required"
        : "revoked";
    return query;
  },
  /** Activates a client-generated replacement key for a verified service principal. */
  rotateServiceKey: function (request) {
    let payload = request.identityMigration || {};
    if (
      !payload.principalCode ||
      typeof payload.newApiKey !== "string" ||
      payload.newApiKey.length < 32
    )
      return Promise.reject(
        new CLASSES.NodicsError(
          "ERR_AUTH_00003",
          "principalCode and a client-generated API key of at least 32 characters are required",
        ),
      );
    return SERVICE.DefaultEmployeeService.get(
      this.systemRequest(request, {
        query: { code: payload.principalCode },
      }),
    ).then((result) => {
      let principal = result.result && result.result[0];
      let policy = this.getPolicy();
      if (
        !principal ||
        (principal.principalType !== "service" &&
          !(principal.userGroups || []).includes(policy.serviceGroup))
      )
        throw new CLASSES.NodicsError(
          "ERR_AUTH_00003",
          "API keys may only be rotated for service principals",
        );
      let keyPolicy = CONFIG.get("authSecurity").apiKey || {};
      let credential = SERVICE.DefaultAPIKeyCredentialService.prepare(
        payload.newApiKey,
      );
      let configuredScopes =
        (policy.servicePrincipalScopes &&
          policy.servicePrincipalScopes[principal.code]) ||
        [];
      let scopes = Array.from(
        new Set(
          []
            .concat(
              payload.apiKeyScopes ||
                principal.apiKeyScopes ||
                configuredScopes,
            )
            .filter(Boolean),
        ),
      );
      let permissionCatalog =
        CONFIG.get("identityGovernance").permissionCatalog || [];
      let invalidScopes = scopes.filter(
        (scope) => !permissionCatalog.includes(scope),
      );
      if (invalidScopes.length > 0)
        throw new CLASSES.NodicsError(
          "ERR_AUTH_00003",
          "API-key scopes are not present in the identity permission catalog: " +
            invalidScopes.join(", "),
        );
      if (keyPolicy.requireScopes === true && scopes.length === 0)
        throw new CLASSES.NodicsError(
          "ERR_AUTH_00003",
          "At least one governed API-key scope is required",
        );
      credential.apiKeyScopes = scopes;
      if (keyPolicy.defaultLifetimeSeconds)
        credential.apiKeyExpiresAt = new Date(
          Date.now() + keyPolicy.defaultLifetimeSeconds * 1000,
        );
      return SERVICE.DefaultEmployeeService.update(
        this.systemRequest(request, {
          query: { code: principal.code, loginId: principal.loginId },
          model: {
            $set: Object.assign(
              {
                principalType: principal.principalType,
                userGroups: principal.userGroups,
              },
              credential,
            ),
            $unset: { apiKey: 1 },
          },
        }),
      )
        .then(() =>
          this.saveAudit(request, {
            code:
              "serviceKeyRotation_" +
              this.getTenant(request) +
              "_" +
              Date.now(),
            active: true,
            migrationVersion: policy.version || 1,
            status: "CREDENTIAL_ROTATED",
            tenant: this.getTenant(request),
            requestedBy: this.getActor(request),
            result: { principalCode: principal.code },
            correlationId: request.correlationId,
          }),
        )
        .then(() => ({
          code: "SUC_SYS_00000",
          data: {
            principalCode: principal.code,
            status: "CREDENTIAL_ROTATED",
          },
        }));
    });
  },
};
