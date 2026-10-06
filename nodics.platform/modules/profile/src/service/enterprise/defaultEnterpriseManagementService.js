/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module profile/service/enterprise/DefaultEnterpriseManagementService
 * @description Implements bounded, human-only enterprise discovery over the generated Profile enterprise service.
 * @layer service
 * @owner profile
 * @override Later modules may tighten filters, bounds, or projection through layered configuration without creating another persistence path.
 */
const crypto = require("node:crypto");

module.exports = {
  /** Sends only fixed Profile Communication commands inside a detached qualified private entry. Transport failures never expose proofs, addresses or provider diagnostics. @param {Object} invocation Owner-built transport options. @param {Object} policy Effective owner transport policy. @returns {Promise<Object>} Existing transport acknowledgement. */
  invokePrivateCommunication: async function (invocation, policy) {
    try {
      if (
        invocation.moduleName !== "commsApi" ||
        ![
          "/internal/communications",
          "/internal/verification/commands",
        ].includes(invocation.apiName) ||
        invocation.methodName !== "POST"
      )
        throw new Error("PROFILE_PRIVATE_COMMAND_INVALID");
      const envelope = { tenant: invocation.tenant };
      return await SERVICE.DefaultLoggerService.runSensitiveOperation(
        envelope,
        () => {
          SERVICE.DefaultLoggerService.assertSensitiveRequest(envelope);
          return SERVICE.DefaultModuleService.invokeModule({
            ...invocation,
            request: envelope,
            local: false,
            requireInternalAuth: true,
            maxAttempts: 1,
            followRedirects: false,
            secureTransport: {
              required: true,
              allowInsecureLoopback: policy.allowInsecureLoopback === true,
            },
          });
        },
      );
    } catch {
      throw new CLASSES.NodicsError("ERR_PRFL_00003");
    }
  },
  /**
   * Calls the existing Communication verification API using declared runtime transport.
   * This is an internal service adapter, not a public registration entry point.
   * Credentials, origin validation and invitation/application authority are not
   * manufactured from browser payloads. No local verification or retry fallback.
   */
  invokeRegistrationVerification: async function (request, command) {
    const recovery = SERVICE.DefaultEmployeeRecoveryService;
    const recoveryContext = recovery && recovery.ownsContext(request);
    const configured = this.accessPolicy().registrationVerification;
    const policy = recoveryContext
      ? { ...configured, purpose: recovery.policy().verificationPurpose }
      : configured;
    const admitted =
      SERVICE.DefaultEnterpriseRegistrationService &&
      SERVICE.DefaultEnterpriseRegistrationService.ownsContext(request);
    const auth = admitted
      ? { ...request.authData, entCode: request.enterpriseCode }
      : request && request.authData;
    if (
      !policy ||
      policy.enabled !== true ||
      policy.mode !== "REMOTE" ||
      typeof policy.connectionName !== "string" ||
      !/^[A-Za-z][A-Za-z0-9_.-]{0,127}$/.test(policy.connectionName) ||
      typeof policy.purpose !== "string" ||
      !policy.purpose.trim() ||
      policy.purpose.length > 512 ||
      !Number.isSafeInteger(policy.timeoutMilliseconds) ||
      policy.timeoutMilliseconds < 1 ||
      policy.timeoutMilliseconds > 60000 ||
      !Number.isSafeInteger(policy.maximumResponseBytes) ||
      policy.maximumResponseBytes < 1024 ||
      policy.maximumResponseBytes > 65536
    ) {
      throw this.error("Employee verification transport is not configured.");
    }
    if (
      !admitted &&
      (!auth ||
        auth.tokenType !== "service" ||
        auth.principalType !== "service" ||
        !(auth.principalId || auth.serviceId || auth.loginId) ||
        request.tenant !== this.assignmentTenant() ||
        auth.tenant !== request.tenant ||
        typeof auth.entCode !== "string" ||
        !auth.entCode ||
        !Array.isArray(auth.modules) ||
        !auth.modules.includes("profile") ||
        !auth.modules.includes("commsApi") ||
        !Array.isArray(auth.permissions) ||
        !auth.permissions.includes("communication.verification.execute"))
    ) {
      throw this.error(
        "Employee verification requires an authorised runtime context.",
      );
    }
    if (
      !command ||
      typeof command !== "object" ||
      Array.isArray(command) ||
      (command.sourceModule !== undefined &&
        command.sourceModule !== "profile") ||
      (command.purpose !== undefined && command.purpose !== policy.purpose) ||
      Object.keys(command).some(
        (key) =>
          ![
            "operation",
            "sourceModule",
            "purpose",
            "subjectReference",
            "channel",
            "destination",
            "bindingReference",
            "challengeCode",
            "generation",
            "secret",
            "proof",
            "operationReference",
            "expectedRevision",
          ].includes(key),
      )
    ) {
      throw this.error("Employee verification command is invalid.");
    }
    const transport = SERVICE.DefaultModuleService;
    if (!transport || typeof transport.invokeModule !== "function") {
      throw this.error("Employee verification transport is unavailable.");
    }
    const response = await this.invokePrivateCommunication(
      {
        local: false,
        moduleName: "commsApi",
        connectionName: policy.connectionName,
        apiName: "/internal/verification/commands",
        methodName: "POST",
        tenant: request.tenant,
        request: {
          tenant: request.tenant,
          correlationId: request.correlationId,
        },
        requestBody: {
          ...command,
          sourceModule: "profile",
          purpose: policy.purpose,
        },
        header: { "X-Enterprise-Code": auth.entCode },
        maxAttempts: 1,
        timeoutMs: policy.timeoutMilliseconds,
        maxResponseBytes: policy.maximumResponseBytes,
        followRedirects: false,
        requireInternalAuth: true,
      },
      policy,
    );
    return this.registrationVerificationResponse(response, command.operation);
  },

  /** Accepts only bounded successful transport envelopes and the versioned owner reply; uncertain writes are never auto-replayed. */
  registrationVerificationResponse: function (response, operation) {
    let value = response;
    for (let depth = 0; depth < 4; depth++) {
      if (
        !value ||
        typeof value !== "object" ||
        Array.isArray(value) ||
        value.success === false ||
        value.error ||
        (Array.isArray(value.errors) && value.errors.length) ||
        (typeof value.code === "string" && value.code.startsWith("ERR_"))
      ) {
        throw this.error(
          "Employee verification result could not be confirmed.",
        );
      }
      if (value.contractVersion === 1) {
        if (
          !/^CV_[a-f0-9]{64}$/.test(value.challengeCode || "") ||
          typeof value.status !== "string" ||
          !Number.isSafeInteger(value.revision) ||
          value.revision < 1 ||
          !Number.isSafeInteger(value.generation) ||
          value.generation < 1 ||
          Object.hasOwn(value, "data") ||
          Object.hasOwn(value, "result") ||
          (["CONSUME", "RECEIPT"].includes(operation) &&
            value.status !== "CONSUMED") ||
          (operation === "CONSUME" && value.executionGranted !== true) ||
          (operation === "RECEIPT" && value.executionGranted !== false)
        ) {
          throw this.error(
            "Employee verification result could not be confirmed.",
          );
        }
        return value;
      }
      if (Object.hasOwn(value, "data") === Object.hasOwn(value, "result"))
        break;
      value = Object.hasOwn(value, "data") ? value.data : value.result;
    }
    throw this.error("Employee verification result could not be confirmed.");
  },

  /** Canonicalizes command input for retry comparison without persisting personal input twice. */
  commandDigest: function (value) {
    const canonical = this.canonicalCommand(value);
    return crypto
      .createHash("sha256")
      .update(JSON.stringify(canonical))
      .digest("hex");
  },

  /** Returns stable JSON field ordering while retaining array order and scalar types. */
  canonicalCommand: function (value) {
    if (Array.isArray(value))
      return value.map((item) => this.canonicalCommand(item));
    if (value && typeof value === "object")
      return Object.keys(value)
        .sort()
        .reduce((result, key) => {
          if (value[key] !== undefined)
            result[key] = this.canonicalCommand(value[key]);
          return result;
        }, {});
    return value;
  },

  /** Reads bounded setup policy; this nominates an enterprise admin, never a platform role. */
  setupAdministratorPolicy: function () {
    const policy = (CONFIG.get("enterpriseManagement") || {}).create || {};
    const admin = policy.defaultAdministrator;
    if (
      !admin ||
      typeof admin.roleCode !== "string" ||
      !admin.roleCode ||
      !Number.isSafeInteger(admin.maximumContacts) ||
      admin.maximumContacts < 1 ||
      admin.maximumContacts > 100
    ) {
      throw this.error("Default administrator setup policy is unavailable");
    }
    const role = this.rolePolicy(admin.roleCode);
    if (role.scopeType !== "ENTERPRISE" || role.delegable !== true) {
      throw this.error(
        "Default administrator must use a delegable enterprise responsibility",
      );
    }
    return admin;
  },

  /** Requires an exact successful generated read; a failed read cannot imply missing staff. */
  setupRows: function (response) {
    if (
      !response ||
      response.success === false ||
      response.error ||
      typeof response.code !== "string" ||
      !response.code.startsWith("SUC_") ||
      (response.errors &&
        (!Array.isArray(response.errors) || response.errors.length)) ||
      !Array.isArray(response.result)
    ) {
      throw this.error("Enterprise setup state could not be confirmed");
    }
    return response.result;
  },

  /** Resolves a valid explicit nomination or one unambiguous associated email before any creation. */
  resolveSetupAdministrator: async function (request, input) {
    const policy = this.setupAdministratorPolicy();
    let email;
    if (
      input.adminEmail !== undefined &&
      !(typeof input.adminEmail === "string" && !input.adminEmail.trim())
    ) {
      if (typeof input.adminEmail !== "string")
        throw this.error("Administrator email must be a valid email address");
      email = this.normalizeEmail(input.adminEmail);
    } else {
      const contacts = input.contacts;
      if (
        !Array.isArray(contacts) ||
        !contacts.length ||
        contacts.length > policy.maximumContacts ||
        contacts.some(
          (code) =>
            typeof code !== "string" || !code.trim() || code.length > 128,
        ) ||
        new Set(contacts).size !== contacts.length
      ) {
        throw this.error(
          "Enter an administrator email or select the enterprise email contact",
        );
      }
      if (
        !SERVICE.DefaultContactService ||
        typeof SERVICE.DefaultContactService.get !== "function"
      ) {
        throw this.error("Enterprise email contact service is unavailable");
      }
      const rows = this.setupRows(
        await SERVICE.DefaultContactService.get({
          tenant: this.assignmentTenant(),
          authData: request.authData,
          query: { code: { $in: contacts } },
          options: { recursive: false, skipItemCache: true },
          searchOptions: {
            pageSize: policy.maximumContacts + 1,
            pageNumber: 1,
          },
        }),
      );
      if (
        rows.length !== contacts.length ||
        new Set(rows.map((row) => row.code)).size !== contacts.length ||
        rows.some((row) => !contacts.includes(row.code))
      )
        throw this.error("Enterprise email contacts could not be confirmed");
      const emails = new Set(
        rows
          .filter(
            (row) =>
              row.active !== false && row.type === ENUMS.ContactType.EMAIL.key,
          )
          .map((row) => this.normalizeEmail(row.value)),
      );
      if (emails.size !== 1)
        throw this.error(
          "Choose an administrator email when the enterprise has no unique email contact",
        );
      email = [...emails][0];
    }
    if (
      typeof input.code !== "string" ||
      !/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(input.code.trim())
    )
      throw this.error("Enterprise code is invalid");
    return {
      email,
      roleCode: policy.roleCode,
      assignmentCode: this.assignmentCode(input.code.trim(), email),
    };
  },

  /** Reuses the existing invitation owner and verifies persisted state without credential writes or replay downgrades. */
  prepareDefaultAdministrator: async function (
    request,
    enterprise,
    nomination,
  ) {
    if (!nomination) return;
    const policy = this.setupAdministratorPolicy();
    const tenantCode =
      enterprise && typeof enterprise.tenant === "object"
        ? enterprise.tenant.code
        : enterprise && enterprise.tenant;
    if (
      !enterprise ||
      enterprise.active !== true ||
      enterprise.adminEmail !== nomination.email ||
      enterprise.defaultAdminAssignmentCode !== nomination.assignmentCode ||
      nomination.roleCode !== policy.roleCode
    ) {
      throw this.error(
        "Enterprise administrator nomination changed; review the saved enterprise",
      );
    }
    const query = { code: nomination.assignmentCode };
    const read = {
      tenant: this.assignmentTenant(),
      authData: request.authData,
      query,
      options: { recursive: false, skipItemCache: true },
      searchOptions: { pageSize: 2, pageNumber: 1 },
    };
    let assignments = this.setupRows(
      await SERVICE.DefaultEnterpriseAccessAssignmentService.get(read),
    );
    if (assignments.length > 1)
      throw this.error("Enterprise administrator association is ambiguous");
    if (!assignments.length) {
      await this.preAssignAccess({
        ...request,
        params: { enterpriseCode: enterprise.code },
        body: {
          email: nomination.email,
          roleCode: nomination.roleCode,
          idempotencyKey: "default-admin-" + nomination.assignmentCode,
        },
      });
      assignments = this.setupRows(
        await SERVICE.DefaultEnterpriseAccessAssignmentService.get(read),
      );
    }
    const assignment = assignments[0];
    const role = this.rolePolicy(nomination.roleCode);
    if (
      assignments.length !== 1 ||
      !assignment ||
      assignment.code !== nomination.assignmentCode ||
      assignment.enterpriseCode !== enterprise.code ||
      assignment.tenantCode !== tenantCode ||
      assignment.normalizedEmail !== nomination.email ||
      assignment.roleCode !== nomination.roleCode ||
      assignment.scopeType !== "ENTERPRISE" ||
      assignment.scopeCode !== enterprise.code ||
      this.commandDigest(assignment.groupCodes) !==
        this.commandDigest(role.groupCodes) ||
      assignment.active !== true ||
      !["PENDING", "ACTIVE", "REGISTERED"].includes(assignment.status) ||
      (assignment.origin && assignment.origin !== "ADMIN_PRE_ENROLLED") ||
      (assignment.status !== "REGISTERED" &&
        assignment.expiresAt &&
        (!Number.isFinite(new Date(assignment.expiresAt).getTime()) ||
          new Date(assignment.expiresAt).getTime() <= Date.now()))
    ) {
      throw this.error(
        "Enterprise was saved but administrator setup requires review; retry the same setup after correction",
      );
    }
  },

  /** Returns effective layered enterprise-search policy. */
  policy: function () {
    return (CONFIG.get("enterpriseManagement") || {}).search || {};
  },

  /** Returns effective layered enterprise access-assignment policy. */
  accessPolicy: function () {
    return (CONFIG.get("enterpriseManagement") || {}).accessAssignments || {};
  },

  /** Creates a stable Profile validation error. */
  error: function (message) {
    return new CLASSES.NodicsError("ERR_PRFL_00003", message);
  },

  /** Requires an authenticated human access-token principal. */
  authorize: function (request) {
    let auth = (request && request.authData) || {};
    if (
      auth.tokenType !== "access" ||
      auth.principalType !== "human" ||
      auth.isSystem ||
      []
        .concat(auth.userGroups || [], auth.allUserGroupCodes || [])
        .includes("serviceAccountUserGroup") ||
      !(auth.principalId || auth.loginId || auth.code)
    ) {
      throw this.error(
        "Enterprise management requires an authenticated human employee access token",
      );
    }
  },

  /** Returns true when the authenticated principal acts from the Platform Owner enterprise. */
  isPlatformAdministrator: function (auth) {
    let groups = [].concat(
      (auth && auth.userGroups) || [],
      (auth && auth.allUserGroupCodes) || [],
    );
    if (groups.includes("serviceAccountUserGroup") || (auth && auth.isSystem))
      return true;
    let platformEnterprise = CONFIG.get("defaultEnterprise") || "default";
    let currentEnterprise = auth && (auth.entCode || auth.enterpriseCode);
    return (
      currentEnterprise === platformEnterprise &&
      ["runtimeConfigAdminUserGroup", "adminGroup"].some((group) =>
        groups.includes(group),
      )
    );
  },

  /** Returns the principal login/code used for audit fields. */
  principalCode: function (auth) {
    return (
      (auth &&
        (auth.loginId ||
          auth.principalId ||
          auth.code ||
          auth.principalCode)) ||
      "unknown"
    );
  },

  /** Requires platform admin or same-enterprise administrator scope for a target enterprise. */
  authorizeEnterpriseAccess: function (request, enterpriseCode) {
    this.authorize(request);
    let auth = (request && request.authData) || {};
    if (this.isPlatformAdministrator(auth)) return;
    let currentEnterprise =
      auth.entCode ||
      auth.enterpriseCode ||
      request.entCode ||
      request.enterpriseCode;
    if (currentEnterprise && currentEnterprise === enterpriseCode) return;
    throw this.error(
      "Enterprise access assignment is limited to the caller enterprise",
    );
  },

  /** Parses one positive bounded integer without silently changing caller intent. */
  boundedInteger: function (value, fallback, maximum, name) {
    if (value === undefined || value === null || value === "") return fallback;
    let normalized = typeof value === "number" ? value : Number(String(value));
    if (
      !Number.isSafeInteger(normalized) ||
      normalized < 1 ||
      normalized > maximum
    ) {
      throw this.error(name + " is outside the configured boundary");
    }
    return normalized;
  },

  /** Validates and maps scalar HTTP filters to the authoritative generated-service query. */
  buildQuery: function (input, policy) {
    let allowed = ["code", "name", "active", "page", "limit"];
    if (
      !input ||
      typeof input !== "object" ||
      Array.isArray(input) ||
      Object.keys(input).some((key) => !allowed.includes(key)) ||
      Object.values(input).some(
        (value) => value !== null && typeof value === "object",
      )
    ) {
      throw this.error("Enterprise search filters are invalid");
    }
    let query = {};
    if (input.code !== undefined) {
      let code = String(input.code).trim();
      if (
        !code ||
        code.length > Number(policy.maximumCodeLength || 128) ||
        !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(code)
      ) {
        throw this.error("Enterprise code filter is invalid");
      }
      query.code = code;
    }
    if (input.name !== undefined) {
      let name = String(input.name).trim();
      if (!name || name.length > Number(policy.maximumNameLength || 256)) {
        throw this.error("Enterprise name filter is invalid");
      }
      query.name = name;
    }
    if (input.active !== undefined) {
      if (
        input.active !== true &&
        input.active !== false &&
        input.active !== "true" &&
        input.active !== "false"
      ) {
        throw this.error("Enterprise active filter must be true or false");
      }
      query.active = input.active === true || input.active === "true";
    }
    return query;
  },

  /** Preserves non-customizable private evidence exclusions even when later layers choose additional display fields. @param {string} field Requested projection key. @returns {boolean} Public field admission. */
  publicProjectionField: function (field) {
    return (
      typeof field === "string" &&
      ![
        "__proto__",
        "constructor",
        "prototype",
        "_id",
        "password",
        "authenticationIdentity",
        "setupRequestKey",
        "setupRequestHash",
        "setupContinuation",
        "defaultAdminAssignmentCode",
        "teamOperation",
        "teamRevision",
        "administrationConsent",
        "administrationHierarchyEpoch",
        "administrationHierarchyOperation",
        "administrationHierarchySerialOperation",
        "identityLinkRetirement",
        "membership",
        "membershipMutation",
        "invitationAuthority",
        "invitationWithdrawal",
        "lifecycleNotifications",
        "application",
      ].some((key) => field === key || field.startsWith(key + "."))
    );
  },
  /** Projects configured enterprise fields while always excluding private owner evidence. @param {Object} item Fresh owner record. @param {string[]} fields Layered display selection. @returns {Object} Explicit public projection. */
  project: function (item, fields) {
    return fields.reduce((result, field) => {
      if (
        !this.publicProjectionField(field) ||
        !item ||
        !Object.hasOwn(item, field) ||
        item[field] === undefined
      )
        return result;
      if (field === "tenant") {
        result.tenantCode =
          item.tenant && typeof item.tenant === "object"
            ? item.tenant.code
            : item.tenant;
      } else if (field === "superEnterprise") {
        result.superEnterpriseCode =
          item.superEnterprise && typeof item.superEnterprise === "object"
            ? item.superEnterprise.code
            : item.superEnterprise;
      } else {
        result[field] = item[field];
      }
      return result;
    }, {});
  },

  /** Projects only configured client-safe access assignment fields. */
  projectAssignment: function (item, fields) {
    return fields.reduce((result, field) => {
      if (
        !this.publicProjectionField(field) ||
        !item ||
        !Object.hasOwn(item, field) ||
        item[field] === undefined
      )
        return result;
      result[field] = item[field];
      return result;
    }, {});
  },

  /** Normalizes and validates one email address for invite lookup. */
  normalizeEmail: function (value) {
    let email = String(value || "")
      .trim()
      .toLowerCase();
    let policy = this.accessPolicy();
    if (
      !email ||
      email.length > Number(policy.maximumEmailLength || 320) ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      throw this.error("Enterprise user email is invalid");
    }
    return email;
  },

  /** Validates one configured enterprise employee role. */
  rolePolicy: function (roleCode) {
    let roles = this.accessPolicy().roles || {};
    let role = roles[String(roleCode || "").trim()];
    if (
      !role ||
      !Array.isArray(role.groupCodes) ||
      role.groupCodes.length === 0
    ) {
      throw this.error("Enterprise user role is not configured");
    }
    return role;
  },

  /** Builds an access-assignment lookup query without exposing recursive identity data. */
  buildAssignmentQuery: function (input, policy) {
    let allowed = [
      "code",
      "email",
      "enterpriseCode",
      "tenantCode",
      "roleCode",
      "status",
      "page",
      "limit",
    ];
    if (
      !input ||
      typeof input !== "object" ||
      Array.isArray(input) ||
      Object.keys(input).some((key) => !allowed.includes(key)) ||
      Object.values(input).some(
        (value) => value !== null && typeof value === "object",
      )
    ) {
      throw this.error("Enterprise access assignment filters are invalid");
    }
    let query = {};
    if (input.code !== undefined) query.code = String(input.code).trim();
    if (input.email !== undefined)
      query.normalizedEmail = this.normalizeEmail(input.email);
    ["enterpriseCode", "tenantCode", "roleCode"].forEach((key) => {
      if (input[key] === undefined) return;
      let value = String(input[key]).trim();
      if (
        !value ||
        value.length > 128 ||
        !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(value)
      ) {
        throw this.error(
          "Enterprise access assignment filter is invalid: " + key,
        );
      }
      query[key] = value;
    });
    if (input.status !== undefined) {
      let status = String(input.status).trim();
      if (!status) return;
      if (
        !Array.isArray(policy.statuses) ||
        !policy.statuses.includes(status)
      ) {
        throw this.error("Enterprise access assignment status is invalid");
      }
      query.status = status;
    }
    return query;
  },

  /** Loads fresh exact active owner evidence without cached recursion. @param {string} enterpriseCode Exact enterprise. @param {Function} [privateReader] Explicit internal Team reader; never mapped from HTTP input. @returns {Promise<Object>} Fresh Enterprise/Tenant context. */
  retrieveEnterpriseForAccess: async function (enterpriseCode, privateReader) {
    if (privateReader !== undefined && typeof privateReader !== "function")
      throw this.error("Enterprise owner reader is invalid");
    let code = String(enterpriseCode || "").trim();
    if (
      !code ||
      code.length > 128 ||
      !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(code)
    ) {
      throw this.error("Enterprise code is invalid");
    }
    const owner = SERVICE.DefaultEnterpriseService;
    const enterprise = await owner.readHierarchyRecord(
      owner,
      code,
      privateReader,
    );
    const tenantCode = owner.hierarchyReferenceCode(enterprise.tenant);
    const tenant = await owner.readHierarchyRecord(
      SERVICE.DefaultTenantService,
      tenantCode,
    );
    return { enterprise: { ...enterprise, tenant }, tenantCode };
  },

  /**
   * Derives a bounded assignment identity from the exact enterprise/email tuple.
   * Reuses the canonical digest so punctuation-distinct emails cannot share a
   * lossy slug. Existing assignments retain their persisted code when refreshed.
   */
  assignmentCode: function (enterpriseCode, normalizedEmail) {
    return (
      "enterpriseAccess_" +
      this.commandDigest(["enterpriseAccess", enterpriseCode, normalizedEmail])
    );
  },

  /** Returns the Profile authority tenant for enterprise access-assignment registry state. */
  assignmentTenant: function () {
    return CONFIG.get("defaultTenant") || "default";
  },

  /** Creates the tenant backing a newly created enterprise when it is not already present. */
  ensureTenant: async function (tenantCode, request, enterpriseName, creation) {
    if (
      typeof SERVICE.DefaultTenantService?.get !== "function" ||
      typeof SERVICE.DefaultTenantService?.save !== "function"
    ) {
      throw new CLASSES.NodicsError("ERR_PROFILE_TENANT_PROVISIONING_HELD");
    }
    let persistenceTenant = CONFIG.get("defaultTenant") || "default";
    let existing = await SERVICE.DefaultTenantService.get({
      tenant: persistenceTenant,
      authData: request.authData,
      query: { code: tenantCode },
      options: { recursive: false, skipItemCache: true },
      searchOptions: { pageSize: 2, pageNumber: 1 },
    });
    const tenants = this.setupRows(existing);
    if (tenants.length > 1)
      throw new CLASSES.NodicsError("ERR_PROFILE_TENANT_PROVISIONING_HELD");
    if (tenants.length) return;
    await SERVICE.DefaultTenantProvisioningGuardService.invoke("save", {
      tenant: persistenceTenant,
      authData: request.authData,
      model: {
        code: tenantCode,
        active: true,
        description: "Tenant for " + enterpriseName,
        ...(tenantCode === persistenceTenant
          ? {}
          : {
              properties:
                await SERVICE.DefaultEnterpriseTenantProvisioningService.captureCreationProperties(
                  tenantCode,
                  creation,
                ),
            }),
      },
      idempotencyKey:
        request.body && request.body.idempotencyKey
          ? "tenant-" + request.body.idempotencyKey
          : undefined,
    });
  },

  /** Ensures the newly created enterprise tenant is addressable before registration begins. */
  activateEnterpriseRuntime: async function (enterprise, tenantCode) {
    if (
      !SERVICE.DefaultEnterpriseHandlerService ||
      typeof NODICS === "undefined" ||
      !NODICS.getActiveTenants ||
      !SERVICE.DefaultEnterpriseHandlerService.buildEnterprise
    ) {
      return;
    }
    let tenant =
      enterprise && enterprise.tenant && typeof enterprise.tenant === "object"
        ? enterprise.tenant
        : { code: tenantCode, active: true };
    if (tenant.active === false) return;
    await SERVICE.DefaultEnterpriseHandlerService.buildEnterprise([
      Object.assign({}, enterprise || {}, {
        tenant: tenant,
        active: !enterprise || enterprise.active !== false,
      }),
    ]);
  },

  /** Returns a backend-driven enterprise access workspace contract. */
  getAccessWorkspace: function (request) {
    if (request && request.publicOnly === true)
      return SERVICE.DefaultEnterpriseRegistrationService.workspace();
    let workspace = (CONFIG.get("enterpriseManagement") || {}).workspace;
    if (!workspace)
      throw this.error("Enterprise access workspace is not configured");
    let effective = JSON.parse(JSON.stringify(workspace));
    const setupOwner = SERVICE.DefaultEnterpriseSetupContinuationService;
    if (
      typeof setupOwner?.workspaceDescriptor !== "function" &&
      CONFIG.get("enterpriseManagement")?.setupContinuation
        ?.inspectionQualified === true
    )
      throw this.error("Enterprise setup metadata is unavailable");
    if (typeof setupOwner?.workspaceDescriptor === "function")
      effective.setupContinuation = setupOwner.workspaceDescriptor();
    let publicOnly = request && request.publicOnly === true;
    if (!publicOnly) {
      effective.tabs = (effective.tabs || [])
        .map((tab) => ({
          ...tab,
          sections: (tab.sections || []).filter(
            (section) => section.public !== true,
          ),
        }))
        .filter((tab) => tab.sections.length);
      if (!effective.tabs.some((tab) => tab.id === effective.defaultTab))
        effective.defaultTab = effective.tabs[0] && effective.tabs[0].id;
      return effective;
    }
    effective.tabs = (effective.tabs || [])
      .map((tab) => {
        let sections = (tab.sections || []).filter(
          (section) => section.public === true,
        );
        return Object.assign({}, tab, { sections: sections });
      })
      .filter((tab) => tab.sections.length > 0);
    effective.defaultTab =
      (effective.tabs[0] && effective.tabs[0].id) || effective.defaultTab;
    return effective;
  },

  /**
   * Reads completed registration independently of invitation eligibility.
   * A registered assignment remains protected after its invitation expires and
   * cannot be hidden by a page of newer pending records. Preserve authority,
   * fresh owner reads and the existing generated-service response contract.
   */
  findRegisteredAssignment: async function (
    normalizedEmail,
    enterpriseCode,
    authData,
  ) {
    let response = await SERVICE.DefaultEnterpriseAccessAssignmentService.get({
      tenant: this.assignmentTenant(),
      authData: authData,
      query: {
        normalizedEmail: normalizedEmail,
        enterpriseCode: enterpriseCode,
        status: "REGISTERED",
      },
      options: { recursive: false, skipItemCache: true },
      searchOptions: { pageSize: 1, pageNumber: 1 },
    });
    if (
      !response ||
      response.success === false ||
      response.error ||
      (typeof response.code === "string" && response.code.startsWith("ERR_")) ||
      !Array.isArray(response.result)
    ) {
      throw this.error("Enterprise registration state is unavailable");
    }
    return response.result[0];
  },

  /** Finds active assignment candidates for one normalized email and enterprise. */
  findActiveAssignment: async function (
    normalizedEmail,
    enterpriseCode,
    authData,
  ) {
    let policy = this.accessPolicy();
    let activeStatuses = Array.isArray(policy.activeStatuses)
      ? policy.activeStatuses
      : ["PENDING", "ACTIVE"];
    let response = await SERVICE.DefaultEnterpriseAccessAssignmentService.get({
      tenant: this.assignmentTenant(),
      authData: authData,
      query: {
        normalizedEmail: normalizedEmail,
        enterpriseCode: enterpriseCode,
      },
      options: { recursive: false },
      searchOptions: {
        pageSize: 25,
        pageNumber: 1,
        sort: { created: -1 },
      },
    });
    let assignments =
      response && Array.isArray(response.result) ? response.result : [];
    return assignments.find(
      (item) =>
        activeStatuses.includes(item.status) &&
        (!item.expiresAt || new Date(item.expiresAt).getTime() >= Date.now()),
    );
  },

  /** Searches enterprises through the existing generated Profile service. */
  search: async function (request) {
    this.authorize(request);
    if (
      request.authData?.principalType !== "human" ||
      request.authData.isSystem
    )
      throw this.error("Enterprise management search requires a human context");
    let policy = this.policy();
    let input = request.query || {};
    let limit = this.boundedInteger(
      input.limit,
      Number(policy.defaultResultCount || 25),
      Number(policy.maximumResultCount || 100),
      "limit",
    );
    let page = this.boundedInteger(
      input.page,
      1,
      Number(policy.maximumPageNumber || 10000),
      "page",
    );
    let enterpriseQuery = this.buildQuery(input, policy);
    if (!this.isPlatformAdministrator(request.authData)) {
      const consent =
        CONFIG.get("enterpriseManagement.administrationConsent") || {};
      const codes =
        consent.enabled === true && consent.enforcementQualified === true
          ? await SERVICE.DefaultEnterpriseAdministrationConsentService.visibleEnterpriseCodes(
              request,
            )
          : [request.authData.entCode];
      if (
        !codes.length ||
        codes.some((code) => typeof code !== "string" || !code)
      )
        throw this.error("Enterprise management search requires current scope");
      enterpriseQuery = { $and: [enterpriseQuery, { code: { $in: codes } }] };
    }
    let response = await SERVICE.DefaultEnterpriseService.get({
      tenant: CONFIG.get("defaultTenant") || "default",
      authData: request.authData,
      query: enterpriseQuery,
      options: { recursive: false },
      searchOptions: {
        pageSize: limit,
        pageNumber: page,
        sort: { code: 1 },
      },
    });
    let items =
      response && Array.isArray(response.result) ? response.result : [];
    let fields = Array.isArray(policy.projectedFields)
      ? policy.projectedFields
      : ["code", "name", "active", "tenant"];
    return {
      page: page,
      limit: limit,
      count: items.length,
      items: items.map((item) => this.project(item, fields)),
    };
  },

  /**
   * Adapts the schema editor's declared CREATE aggregate to Profile enterprise setup.
   * Tenant provisioning stays server-owned; later schema fields are accepted only
   * when the effective descriptor declares them writable. No client service names
   * or runtime coordinates are accepted.
   * @param {Object} request Authenticated aggregate request with payload.model.
   * @returns {Promise<Object>} Persisted enterprise, including reference identities.
   */
  createFromModel: async function (request) {
    if (CONFIG.get('commandReceipts')?.enabled === true && CONFIG.get('commandReceipts').owners?.profile === true) {
      if (!SERVICE.DefaultEnterpriseCommandReceiptService) throw this.error('Native command receipts are unavailable');
      return SERVICE.DefaultEnterpriseCommandReceiptService.execute(request, 'CREATE', () => this.createFromModelOriginal(request));
    }
    return this.createFromModelOriginal(request);
  },
  /** Executes the existing descriptor-validated enterprise setup; receipt wrapping never changes its native guards. @param {Object} request Trusted original aggregate. @returns {Promise<Object>} Native projection. */
  createFromModelOriginal: async function (request) {
    this.authorize(request);
    if (!this.isPlatformAdministrator(request.authData))
      throw this.error(
        "Enterprise creation is limited to the Platform Owner enterprise",
      );
    let schemaUtility = SERVICE.DefaultSchemaUtilityService;
    if (!schemaUtility || typeof schemaUtility.buildDescriptor !== "function") {
      throw this.error("Schema metadata is unavailable for enterprise setup");
    }
    let moduleObject = NODICS.getModule("profile");
    let descriptor = schemaUtility.buildDescriptor(
      request,
      moduleObject,
      "enterprise",
      "profile",
    );
    let input = request.payload && request.payload.model;
    if (
      !descriptor ||
      !descriptor.operations.includes("create") ||
      !input ||
      typeof input !== "object" ||
      Array.isArray(input)
    ) {
      throw this.error("Enterprise creation input is invalid");
    }
    let writable = new Set(
      descriptor.fields
        .filter((field) => !field.readOnly)
        .map((field) => field.name),
    );
    let reserved = new Set([
      "tenant",
      "capabilityScopes",
      "defaultAdminAssignmentCode",
      "setupRequestKey",
      "setupRequestHash",
      "setupContinuation",
      "administrationConsent",
      "administrationHierarchyEpoch",
      "administrationHierarchyOperation",
      "administrationHierarchySerialOperation",
    ]);
    if (
      Object.keys(input).some((key) => !writable.has(key) || reserved.has(key))
    ) {
      throw this.error(
        "Enterprise creation contains a managed or unavailable field",
      );
    }
    const idempotencyKey = schemaUtility.getIdempotencyKey(request);
    if (!idempotencyKey)
      throw this.error("Enterprise setup requires a valid Idempotency-Key");
    const administrator = await this.resolveSetupAdministrator(request, input);
    let {
      code,
      name,
      active,
      roleCodes,
      superEnterprise,
      adminEmail,
      ...additional
    } = input;
    await this.create(
      {
        ...request,
        body: {
          code,
          name,
          active,
          roleCodes,
          superEnterpriseCode: superEnterprise,
          tenantCode: code,
          idempotencyKey,
        },
      },
      additional,
      administrator,
    );
    let result = await SERVICE.DefaultEnterpriseService.get({
      tenant: CONFIG.get("defaultTenant") || "default",
      authData: request.authData,
      query: { code },
      options: { recursive: false },
      searchOptions: { pageSize: 1, pageNumber: 1 },
    });
    let saved = result && result.result && result.result[0];
    if (!saved)
      throw this.error("Enterprise was created but could not be reloaded");
    return descriptor.fields.reduce((record, field) => {
      if (
        this.publicProjectionField(field.name) &&
        saved[field.name] !== undefined
      )
        record[field.name] = saved[field.name];
      return record;
    }, {});
  },

  /** Creates one enterprise; additionalModel is a server-only, descriptor-validated contribution. */
  create: async function (request, additionalModel, administrator) {
    this.authorize(request);
    if (!this.isPlatformAdministrator(request.authData)) {
      throw this.error(
        "Enterprise creation is limited to the Platform Owner enterprise",
      );
    }
    let policy = (CONFIG.get("enterpriseManagement") || {}).create || {};
    let input = request.body || {};
    let allowed = [
      "code",
      "name",
      "tenantCode",
      "superEnterpriseCode",
      "active",
      "roleCodes",
      "idempotencyKey",
    ];
    if (
      !input ||
      typeof input !== "object" ||
      Array.isArray(input) ||
      Object.keys(input).some((key) => !allowed.includes(key))
    ) {
      throw this.error("Enterprise creation input is invalid");
    }
    let code = String(input.code || "").trim();
    let name = String(input.name || "").trim();
    let tenantCode = String(
      input.tenantCode ||
        request.tenant ||
        CONFIG.get("defaultTenant") ||
        "default",
    ).trim();
    let persistenceTenant = CONFIG.get("defaultTenant") || "default";
    let requestKey = input.idempotencyKey
      ? this.commandDigest([
          this.principalCode(request.authData),
          String(input.idempotencyKey),
        ])
      : undefined;
    let requestHash = requestKey
      ? this.commandDigest({ input, additionalModel, administrator })
      : undefined;
    if (
      !code ||
      code.length > Number(policy.maximumCodeLength || 128) ||
      !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(code) ||
      !name ||
      name.length > Number(policy.maximumNameLength || 256) ||
      !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(tenantCode)
    ) {
      throw this.error("Enterprise creation fields are invalid");
    }
    const existingRead = {
      tenant: persistenceTenant,
      authData: request.authData,
      query: { code: code },
      options: { recursive: false, skipItemCache: true },
      searchOptions: { pageSize: 2, pageNumber: 1 },
    };
    const teamOwner = SERVICE.DefaultEnterpriseTeamAdministrationService;
    const setupOwner = SERVICE.DefaultEnterpriseSetupContinuationService;
    if (
      administrator &&
      requestKey &&
      (typeof setupOwner?.createSnapshot !== "function" ||
        typeof setupOwner.withCreationMutation !== "function" ||
        typeof setupOwner.readForCreation !== "function")
    )
      throw this.error("Enterprise setup continuation owner is unavailable");
    let existing =
      typeof setupOwner?.readForCreation === "function"
        ? await setupOwner.readForCreation(existingRead, request)
        : typeof teamOwner?.readEnterpriseEnvelope === "function"
          ? await teamOwner.readEnterpriseEnvelope(
              SERVICE.DefaultEnterpriseService,
              existingRead,
            )
          : await SERVICE.DefaultEnterpriseService.get(existingRead);
    const existingRows = this.setupRows(existing);
    if (
      existingRows.length > 1 ||
      (existingRows.length && existingRows[0].code !== code)
    )
      throw this.error("Enterprise lookup did not establish an exact result");
    if (existingRows.length) {
      let saved = existingRows[0];
      if (requestKey && saved.setupRequestKey === requestKey) {
        if (saved.setupRequestHash !== requestHash)
          throw this.error(
            "This setup request has changed. Open the existing enterprise before making further changes.",
          );
        if (saved.teamOperation && saved.teamOperation.phase !== "COMPLETE") {
          if (typeof setupOwner?.resume !== "function")
            throw this.error("Enterprise setup is held");
          await setupOwner.resume({
            ...request,
            query: {},
            params: { enterpriseCode: code },
            body: { expectedRevision: saved.setupContinuation?.revision },
          });
          return this.project(
            saved,
            policy.projectedFields || ["code", "name", "active", "tenant"],
          );
        }
        await this.activateEnterpriseRuntime(saved, tenantCode);
        await this.prepareDefaultAdministrator(request, saved, administrator);
        return this.project(
          saved,
          policy.projectedFields || ["code", "name", "active", "tenant"],
        );
      }
      throw new CLASSES.NodicsError("ERR_PROFILE_ENTERPRISE_DUPLICATE");
    }
    let tenantOwner = await SERVICE.DefaultEnterpriseService.get({
      tenant: persistenceTenant,
      authData: request.authData,
      query: { tenant: tenantCode },
      searchOptions: { pageSize: 2, pageNumber: 1 },
    });
    if (
      tenantOwner &&
      Array.isArray(tenantOwner.result) &&
      tenantOwner.result.length
    ) {
      throw this.error("Enterprise tenant is already assigned");
    }
    let model = Object.assign({}, additionalModel || {}, {
      code: code,
      name: name,
      tenant: tenantCode,
      active: input.active !== false,
    });
    if (requestKey) {
      model.setupRequestKey = requestKey;
      model.setupRequestHash = requestHash;
    }
    if (administrator) {
      model.adminEmail = administrator.email;
      model.defaultAdminAssignmentCode = administrator.assignmentCode;
    }
    if (
      input.superEnterpriseCode !== undefined &&
      input.superEnterpriseCode !== null &&
      input.superEnterpriseCode !== ""
    ) {
      model.superEnterprise = input.superEnterpriseCode;
    }
    if (
      model.superEnterprise !== undefined &&
      model.superEnterprise !== null &&
      model.superEnterprise !== ""
    ) {
      const parentCode =
        SERVICE.DefaultEnterpriseService.hierarchyReferenceCode(
          model.superEnterprise,
        );
      await SERVICE.DefaultEnterpriseService.hierarchy(parentCode, code);
      model.superEnterprise = parentCode;
    }
    if (Array.isArray(input.roleCodes) && input.roleCodes.length) {
      let allowedRoles = Array.isArray(policy.allowedRoleCodes)
        ? policy.allowedRoleCodes
        : [];
      let roleCodes = Array.from(
        new Set(
          input.roleCodes
            .map((item) => String(item || "").trim())
            .filter(Boolean),
        ),
      );
      if (roleCodes.some((role) => !allowedRoles.includes(role))) {
        throw this.error("Enterprise role code is invalid");
      }
      model.roleCodes = roleCodes;
    }
    const consentOwner = SERVICE.DefaultEnterpriseAdministrationConsentService;
    if (
      consentOwner &&
      CONFIG.get("enterpriseManagement.administrationConsent") !== undefined
    )
      model = await consentOwner.prepareCreation(model, request);
    if (administrator && requestKey)
      model.setupContinuation = setupOwner.createSnapshot(model, administrator);
    await this.ensureTenant(tenantCode, request, name, {
      enterpriseCode: code,
      setupRequestKey: requestKey,
      setupRequestHash: requestHash,
    });
    const creation = {
      tenant: persistenceTenant,
      authData: request.authData,
      model: model,
      idempotencyKey: input.idempotencyKey,
    };
    const saveCreation = () =>
      model.administrationConsent
        ? consentOwner.saveCreated(creation)
        : SERVICE.DefaultEnterpriseService.save(creation);
    let response = model.setupContinuation
      ? await setupOwner.withCreationMutation(
          creation,
          administrator,
          saveCreation,
          request,
        )
      : await saveCreation();
    let saved = response && (response.result || response.data || response);
    await this.activateEnterpriseRuntime(saved, tenantCode);
    await this.prepareDefaultAdministrator(request, saved, administrator);
    let fields = Array.isArray(policy.projectedFields)
      ? policy.projectedFields
      : ["code", "name", "active", "tenant"];
    return this.project(saved, fields);
  },

  /** Delegates bounded native setup inspection; no lost browser command is reconstructed. @param {Object} request Human operator request. @returns {Promise<Object>} Safe current setup. */
  inspectEnterpriseSetup: function (request) {
    return SERVICE.DefaultEnterpriseSetupContinuationService.inspect(request);
  },
  /** Delegates reviewed same-intent continuation through the existing serialized owner. @param {Object} request Human revision-bound command. @returns {Promise<Object>} Safe outcome. */
  resumeEnterpriseSetup: function (request) {
    return SERVICE.DefaultEnterpriseSetupContinuationService.resume(request);
  },

  /** Lists pre-assigned enterprise access records through the Profile-owned generated service. */
  searchAccessAssignments: async function (request) {
    this.authorize(request);
    let policy = this.accessPolicy();
    let input = request.query || {};
    let limit = this.boundedInteger(
      input.limit,
      Number(policy.defaultResultCount || 25),
      Number(policy.maximumResultCount || 100),
      "limit",
    );
    let page = this.boundedInteger(
      input.page,
      1,
      Number(policy.maximumPageNumber || 10000),
      "page",
    );
    let query = this.buildAssignmentQuery(input, policy);
    if (!this.isPlatformAdministrator(request.authData)) {
      let callerEnterprise =
        request.authData &&
        (request.authData.entCode || request.authData.enterpriseCode);
      if (!callerEnterprise)
        throw this.error(
          "Enterprise assignment search requires caller enterprise scope",
        );
      if (query.enterpriseCode && query.enterpriseCode !== callerEnterprise) {
        throw this.error(
          "Enterprise assignment search is limited to the caller enterprise",
        );
      }
      query.enterpriseCode = callerEnterprise;
    }
    let response = await SERVICE.DefaultEnterpriseAccessAssignmentService.get({
      tenant: this.assignmentTenant(),
      authData: request.authData,
      query: query,
      options: { recursive: false },
      searchOptions: {
        pageSize: limit,
        pageNumber: page,
        sort: { created: -1 },
      },
    });
    let items =
      response && Array.isArray(response.result) ? response.result : [];
    let fields = Array.isArray(policy.projectedFields)
      ? policy.projectedFields
      : ["code", "email", "enterpriseCode", "tenantCode", "roleCode", "status"];
    return {
      page: page,
      limit: limit,
      count: items.length,
      items: items.map((item) => this.projectAssignment(item, fields)),
    };
  },

  /** Creates or refreshes one email pre-assignment for enterprise employee registration. */
  preAssignAccess: async function (request) {
    if (CONFIG.get('commandReceipts')?.enabled === true && CONFIG.get('commandReceipts').owners?.profile === true) {
      if (!SERVICE.DefaultEnterpriseCommandReceiptService) throw this.error('Native command receipts are unavailable');
      return SERVICE.DefaultEnterpriseCommandReceiptService.execute(request, 'INVITE', () => this.preAssignAccessOriginal(request));
    }
    return this.preAssignAccessOriginal(request);
  },
  /** Preserves the native invitation lifecycle and consent/role guards beneath optional receipt capture. @param {Object} request Original invitation. @returns {Promise<Object>} Native invitation projection. */
  preAssignAccessOriginal: async function (request) {
    let body = request.body || {};
    let enterpriseCode = String(
      (request.params && request.params.enterpriseCode) ||
        body.enterpriseCode ||
        "",
    ).trim();
    if (
      request.authData?.entCode !== enterpriseCode &&
      !this.isPlatformAdministrator(request.authData)
    ) {
      await SERVICE.DefaultEnterpriseAdministrationConsentService.authorizeInvitation(
        request,
        enterpriseCode,
        body.roleCode,
        body.email,
      );
    } else this.authorizeEnterpriseAccess(request, enterpriseCode);
    let policy = this.accessPolicy();
    let normalizedEmail = this.normalizeEmail(body.email);
    let roleCode = String(body.roleCode || "").trim();
    let role = this.rolePolicy(roleCode);
    let enterprise = await this.retrieveEnterpriseForAccess(enterpriseCode);
    let registered = await this.findRegisteredAssignment(
      normalizedEmail,
      enterpriseCode,
      request.authData,
    );
    if (registered) {
      if (
        registered.active === true &&
        registered.roleCode === roleCode &&
        registered.tenantCode === enterprise.tenantCode &&
        SERVICE.DefaultEnterpriseRegistrationService.digest(
          registered.groupCodes,
        ) ===
          SERVICE.DefaultEnterpriseRegistrationService.digest(role.groupCodes)
      ) {
        return this.projectAssignment(
          registered,
          policy.projectedFields || [
            "code",
            "email",
            "enterpriseCode",
            "roleCode",
            "status",
          ],
        );
      }
      throw this.error(
        "Use the governed team lifecycle to change an existing responsibility",
      );
    }
    // A submitted application is not an invitation refresh. Preserve its review history.
    const applicationOwner = SERVICE.DefaultEnterpriseApplicationService;
    if (applicationOwner) {
      await applicationOwner.assertNoApplication(
        enterpriseCode,
        normalizedEmail,
      );
    }
    let existing = await this.findActiveAssignment(
      normalizedEmail,
      enterpriseCode,
      request.authData,
    );
    let expiresAt = body.expiresAt
      ? new Date(body.expiresAt)
      : new Date(
          Date.now() +
            Number(policy.defaultExpiryDays || 14) * 24 * 60 * 60 * 1000,
        );
    if (!Number.isFinite(expiresAt.getTime()))
      throw this.error("Enterprise access expiry is invalid");
    let message =
      body.message === undefined ? undefined : String(body.message).trim();
    if (
      message &&
      message.length > Number(policy.maximumMessageLength || 1000)
    ) {
      throw this.error("Enterprise access message exceeds configured length");
    }
    if (existing && (existing.registration || existing.membership))
      throw this.error(
        "Registration or membership acceptance is already in progress. Review its existing state.",
      );
    let model = {
      revision: (existing && existing.revision) || 0,
      code:
        (existing && existing.code) ||
        this.assignmentCode(enterpriseCode, normalizedEmail),
      email: String(body.email || "").trim(),
      normalizedEmail: normalizedEmail,
      enterpriseCode: enterpriseCode,
      tenantCode: enterprise.tenantCode,
      roleCode: roleCode,
      groupCodes: role.groupCodes,
      scopeType: role.scopeType || "ENTERPRISE",
      scopeCode: enterpriseCode,
      status: "PENDING",
      active: true,
      expiresAt: expiresAt,
      invitedBy: this.principalCode(request.authData),
    };
    if (message) model.message = message;
    const membershipOwner = SERVICE.DefaultEnterpriseMembershipService;
    if (membershipOwner && membershipOwner.enabled())
      model.invitationAuthority = await membershipOwner.invitationAuthority(
        request,
        enterpriseCode,
      );
    const command = {
      tenant: this.assignmentTenant(),
      authData: request.authData,
      model: model,
      idempotencyKey: body.idempotencyKey,
    };
    let response = await SERVICE.DefaultEnterpriseAccessAssignmentService.save(
      model.invitationAuthority
        ? membershipOwner.invitationMutation(command)
        : command,
    );
    let saved = response && (response.result || response.data || response);
    let fields = Array.isArray(policy.projectedFields)
      ? policy.projectedFields
      : ["code", "email", "enterpriseCode", "tenantCode", "roleCode", "status"];
    if (
      (CONFIG.get("enterpriseManagement") || {}).notifications?.enabled === true
    ) {
      await SERVICE.DefaultEnterpriseNotificationService.request(
        model.code,
        "INVITATION",
      );
      saved = await membershipOwner.read(
        "DefaultEnterpriseAccessAssignmentService",
        this.assignmentTenant(),
        { code: model.code },
      );
    }
    return this.projectAssignment(saved, fields);
  },

  /** Resolves one public pre-assignment for the registration page without exposing private identity data. */
  resolvePreAssignedAccess: function () {
    // Legacy GET never discloses invitation, role or enterprise membership.
    return { verificationRequired: true };
  },

  /** Completes pre-approved employee registration and binds the new principal to its enterprise scope. */
  registerPreAssignedEmployee: function (request) {
    return SERVICE.DefaultEnterpriseRegistrationService.execute(
      request,
      "COMPLETE",
    );
  },
};
