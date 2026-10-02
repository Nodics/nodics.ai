/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
const crypto = require("node:crypto");
const projectionWrites = new WeakSet();
const membershipWrites = new WeakSet();
const invitationWrites = new WeakSet();
const administratorScopeAcceptance = new WeakMap();
const administratorScopeContexts = new WeakMap();
const administratorScopeWrites = new WeakMap();

/**
 * @module profile/service/enterprise/DefaultEnterpriseMembershipService
 * @description Composes canonical Profile identities, independently accepted enterprise assignments and context-bound sessions through existing owners.
 * @layer service
 * @owner profile
 * @override Later Profile modules may tighten policy or override individual members; retain authenticated linking, credential ownership, managed revisions and independent session invalidation.
 */
module.exports = {
  /** Recognizes an exact accept-created scope context, never a caller flag. @param {Object} context In-process constructor context. @returns {boolean} Private provenance. */
  ownsAdministratorScopeContext: function (context) {
    return administratorScopeContexts.has(context);
  },
  /** Recognizes only the exact transient generated scope command. @param {Object} request Generated request. @returns {boolean} Private request identity. */
  ownsAdministratorMutation: function (request) {
    return administratorScopeWrites.has(request);
  },
  /** Rechecks an accept-created deterministic scope against fresh assignment, canonical identity and projection. @param {Object} request Exact private generated scope command. @param {boolean} [after] Validate acknowledged create/readback instead of absent pre-state. @returns {Promise<Object>} Non-secret fixed-step Team evidence. */
  validateAdministratorMutation: async function (request, after = false) {
    const write = administratorScopeWrites.get(request),
      context = write && administratorScopeContexts.get(write.context);
    if (
      !context ||
      !["save", "update"].includes(write.operation) ||
      request.options?.upsert ||
      request.options?.overwrite ||
      this.digest([request.tenant, request.query, request.model]) !==
        write.digest
    )
      this.fail("CONFLICT");
    const { item } = await this.assignment(context.assignmentCode);
    if (
      item.revision !== context.revision ||
      item.membership?.phase !== "PREPARED" ||
      item.membership.commandId !== context.commandId ||
      this.digest(item.membership.identity) !== this.digest(context.identity) ||
      item.membership.assignmentDigest !== this.base().assignmentDigest(item)
    )
      this.fail("CONFLICT");
    await this.assertInviter(item);
    const canonical = await this.anchor(context.identity);
    if (
      !Number.isSafeInteger(context.anchorVersion) ||
      context.anchorVersion < 1 ||
      (canonical.person.authVersion || 1) !== context.anchorVersion
    )
      this.fail("IDENTITY");
    const person = await this.read("DefaultEmployeeService", item.tenantCode, {
      _id: context.projectionId,
    });
    if (
      !person ||
      person.active !== true ||
      person.principalType !== "human" ||
      person.disabled === true ||
      person.registrationSuspended === true ||
      this.digest(person.userGroups) !== context.groupsDigest ||
      this.digest(
        person.authenticationIdentity ||
          this.locator(item.tenantCode, "EMPLOYEE", person),
      ) !== this.digest(context.identity) ||
      (person.authenticationIdentity && person.password)
    )
      this.fail("CONFLICT");
    const expected = {
      code: "membershipScope_" + this.digest(item.code),
      active: true,
      principalType: "human",
      principalCode: person.loginId,
      scopeType: "ENTERPRISE",
      scopeCode: item.enterpriseCode,
      tenantCode: item.tenantCode,
      enterpriseCode: item.enterpriseCode,
      effect: "ALLOW",
      status: "ACTIVE",
      inheritanceMode: "DIRECT",
    };
    if (
      request.tenant !== item.tenantCode ||
      (write.operation === "save" &&
        (request.query ||
          this.digest(request.model) !== this.digest(expected))) ||
      (write.operation === "update" &&
        (this.digest(request.model) !== this.digest({ status: "ACTIVE" }) ||
          this.digest(request.query) !==
            this.digest(this.base().administratorScopeQuery(expected))))
    )
      this.fail("CONFLICT");
    const previous = await this.read(
      "DefaultPrincipalScopeAssignmentService",
      item.tenantCode,
      { code: expected.code },
    );
    if (write.operation === "save" && !after && previous) this.fail("CONFLICT");
    if (
      previous &&
      (Object.entries(expected).some(
        ([key, value]) => this.digest(previous[key]) !== this.digest(value),
      ) ||
        [
          "groupCode",
          "effectiveFrom",
          "effectiveTo",
          "permissionCode",
          "capabilityCode",
        ].some((key) => previous[key] !== undefined))
    )
      this.fail("CONFLICT");
    if ((after || write.operation === "update") && !previous)
      this.fail("CONFLICT");
    return {
      owner: "membership",
      assignmentCode: item.code,
      commandId: item.membership.commandId,
      enterpriseCode: item.enterpriseCode,
      tenantCode: item.tenantCode,
      step: "SCOPE",
      targetCode: expected.code,
      modelDigest: this.digest(expected),
    };
  },
  /** Admits only an exact accept-created scope save/re-ack while Team holds its existing operation fence. @param {Object} context Private accept context. @param {string} operation Fixed generated save/update. @param {Object} request Exact generated request. @param {Function} work Generated callback. @returns {Promise<Object>} Owner acknowledgement. */
  withAdministratorScopeMutation: async function (
    context,
    operation,
    request,
    work,
  ) {
    if (
      !administratorScopeContexts.has(context) ||
      !["save", "update"].includes(operation)
    )
      this.fail("CONFLICT");
    if (
      (CONFIG.get("enterpriseManagement") || {}).teamAdministration
        ?.genericMutationGuard?.enabled !== true
    )
      return await work();
    administratorScopeWrites.set(request, {
      context,
      operation,
      digest: this.digest([request.tenant, request.query, request.model]),
    });
    try {
      return await SERVICE.DefaultEnterpriseTeamAdministrationService.withAdministratorOwnerMutation(
        request,
        "DefaultPrincipalScopeAssignmentService",
        operation,
        work,
      );
    } finally {
      administratorScopeWrites.delete(request);
    }
  },
  /** Revalidates Profile-owned selected contexts after token authentication on every secured request, including consent expiry/source loss. @param {Object} request Verified request context. @param {Object} response Pipeline response. @param {Object} process Existing pipeline continuation. @returns {Promise<void>} Continue only with current owner evidence. */
  validateRequestContext: async function (request, response, process) {
    try {
      const auth = request.authData;
      if (
        auth?.sessionContext &&
        [
          "profile",
          "profile.customerParticipation",
          "profile.customerEligibility",
        ].includes(auth.sessionContext.owner)
      )
        await this.validateContext(auth);
      process.nextSuccess(request, response);
    } catch {
      process.error(
        request,
        response,
        new CLASSES.NodicsError("ERR_AUTH_00001"),
      );
    }
  },
  /** Builds an authenticated person's inert membership task, never an access grant. @param {Object} request Current access context. @returns {Promise<Object>} Safe choices and layered presentation. */
  workspace: async function (request) {
    const list = await this.list(request);
    const policy = this.policy();
    const passwordProof = request.authData.authenticationMethod === "PASSWORD";
    const items = [];
    for (const projected of list.items) {
      const { item } = await this.assignment(projected.code, true);
      if (item.revision !== projected.revision) this.fail("CONFLICT");
      items.push({
        ...projected,
        actions: projected.accepted
          ? passwordProof &&
            request.authData.principalType === "human" &&
            policy.browserContextSwitchQualified === true &&
            projected.enterpriseCode !== request.authData.entCode
            ? ["SWITCH"]
            : []
          : passwordProof &&
              ["PENDING", "ACTIVE"].includes(item.status) &&
              !!item.invitationAuthority &&
              (!item.membership || item.membership.phase === "PREPARED")
            ? ["ACCEPT"]
            : [],
      });
    }
    return {
      contractVersion: 1,
      owner: "profile",
      renderer: "axis.enterprise-memberships",
      enterpriseCode: request.authData.entCode,
      presentation: policy.presentation,
      items,
    };
  },
  /** Prepares an exact accepted target using fresh canonical/scope authority, not caller identity or tenant fields. @param {Object} request Signed current context and reviewed assignment revision. @returns {Promise<Object>} Private issuer input. */
  prepareContextSwitch: async function (request) {
    if (this.policy().browserContextSwitchQualified !== true)
      this.fail("UNAVAILABLE");
    const input = this.base().input(request.body || {}, [
      "assignmentCode",
      "revision",
    ]);
    this.base().input(request.httpRequest?.query || request.query || {}, []);
    if (!Number.isSafeInteger(input.revision) || input.revision < 1)
      this.fail("CONFLICT");
    const auth = request.authData || {};
    if (
      auth.principalType !== "human" ||
      auth.authenticationMethod !== "PASSWORD"
    )
      this.fail("FORBIDDEN");
    const anchor = await this.actor(request);
    await this.credential(anchor);
    const { item, enterprise } = await this.assignment(input.assignmentCode);
    if (
      !enterprise.active ||
      !enterprise.tenant ||
      enterprise.tenant.active === false ||
      enterprise.tenant.code !== item.tenantCode
    )
      this.fail("ASSIGNMENT");
    if (
      !Number.isSafeInteger(input.revision) ||
      input.revision !== item.revision ||
      item.status !== "REGISTERED" ||
      item.membership?.phase !== "COMPLETE" ||
      item.enterpriseCode === auth.entCode ||
      this.digest(item.membership.identity) !== this.digest(anchor.identity)
    )
      this.fail("CONFLICT");
    const person = await this.read("DefaultEmployeeService", item.tenantCode, {
      _id: item.membership.projectionId,
    });
    const context = await this.sessionContext(
      person,
      { ...enterprise, tenant: { code: item.tenantCode } },
      "Employee",
    );
    if (
      !context ||
      this.digest(context.anchor.identity) !== this.digest(anchor.identity)
    )
      this.fail("IDENTITY");
    return { context, enterprise, item };
  },
  /** Returns the existing registration persistence/continuation owner. @returns {Object} Effective owner. */
  base: function () {
    return SERVICE.DefaultEnterpriseRegistrationService;
  },
  /** Reports explicit activation without substituting it for qualification. @returns {boolean} Selected capability. */
  enabled: function () {
    return (
      (CONFIG.get("enterpriseManagement") || {}).memberships?.enabled === true
    );
  },
  /** Raises a redacted Profile membership rejection. @param {string} [suffix] Stable error suffix. @returns {never} Throws. */
  fail: function (suffix = "CONFLICT") {
    throw new CLASSES.NodicsError("ERR_PROFILE_MEMBERSHIP_" + suffix);
  },
  /** Resolves independently qualified framework policy. @returns {Object} Enabled policy or rejection. */
  policy: function () {
    const p = (CONFIG.get("enterpriseManagement") || {}).memberships;
    if (
      !p ||
      p.enabled !== true ||
      p.inventoryQualified !== true ||
      p.sessionBindingQualified !== true ||
      p.assignmentClaimIndexQualified !== true ||
      !Number.isSafeInteger(p.pageSize) ||
      p.pageSize < 1 ||
      p.pageSize > 100 ||
      !Number.isSafeInteger(p.maximumInventoryPages) ||
      p.maximumInventoryPages < 1
    )
      this.fail("UNAVAILABLE");
    return p;
  },
  /** Returns the existing assignment authority partition. @returns {string} Trusted tenant. */
  authority: function () {
    return SERVICE.DefaultEnterpriseManagementService.assignmentTenant();
  },
  /** Reuses canonical Profile digests. @param {*} value Metadata. @returns {string} Digest. */
  digest: function (value) {
    return this.base().digest(value);
  },
  /** Reuses strict generated reads. @param {Object} value Owner envelope. @returns {Object[]} Valid rows. */
  rows: function (value) {
    return this.base().rows.call(this, value);
  },
  /** Reuses exact uncached reads. @param {string} service Owner. @param {string} tenant Partition. @param {Object} query Trusted query. @returns {Promise<Object|null>} Record. */
  read: function (service, tenant, query) {
    return this.base().read.call(this, service, tenant, query);
  },
  /** Reuses bounded complete pagination. @param {string} service Owner. @param {string} tenant Partition. @param {Object} query Trusted query. @returns {Promise<Object[]>} Records. */
  inventory: function (service, tenant, query) {
    return this.base().inventory.call(this, service, tenant, query);
  },
  /** Normalizes immutable record references only. @param {*} value Persisted reference. @returns {string} Bounded ID. */
  recordId: function (value) {
    const id =
      typeof value === "string"
        ? value
        : value && typeof value.toHexString === "function"
          ? value.toHexString()
          : undefined;
    if (!id || id.length > 128 || !/^[A-Za-z0-9._:-]+$/.test(id))
      this.fail("IDENTITY");
    return id;
  },
  /** Chooses an existing generated principal owner from the stable record-kind vocabulary. @param {string} kind Record kind. @returns {string} Owner name. */
  principalService: function (kind) {
    if (kind === "EMPLOYEE") return "DefaultEmployeeService";
    if (kind === "CUSTOMER") return "DefaultCustomerService";
    this.fail("IDENTITY");
  },
  /** Constructs the immutable locator of an existing principal. @param {string} tenant Partition. @param {string} kind Kind. @param {Object} person Record. @returns {Object} Locator. */
  locator: function (tenant, kind, person) {
    return {
      tenantCode: tenant,
      recordKind: kind,
      recordId: this.recordId(person._id),
    };
  },
  /** Validates a server-owned stored locator. @param {Object} value Locator. @returns {Object} Exact safe locator. */
  identity: function (value) {
    if (
      !value ||
      typeof value.tenantCode !== "string" ||
      !/^[A-Za-z0-9._-]{1,128}$/.test(value.tenantCode)
    )
      this.fail("IDENTITY");
    this.principalService(value.recordKind);
    return {
      tenantCode: value.tenantCode,
      recordKind: value.recordKind,
      recordId: this.recordId(value.recordId),
    };
  },
  /** Resolves a direct canonical anchor; chains and cycles are rejected. @param {Object} identity Stored locator. @returns {Promise<Object>} Fresh anchor and locator. */
  anchor: async function (identity) {
    identity = this.identity(identity);
    const person = await this.read(
      this.principalService(identity.recordKind),
      identity.tenantCode,
      { _id: identity.recordId },
    );
    if (
      !person ||
      person.active !== true ||
      person.disabled === true ||
      person.registrationSuspended === true ||
      person.principalType !==
        (identity.recordKind === "EMPLOYEE" ? "human" : "customer") ||
      (person.authenticationIdentity &&
        this.digest(this.identity(person.authenticationIdentity)) !==
          this.digest(identity))
    )
      this.fail("IDENTITY");
    const state = await SERVICE.DefaultUserStateService.findUserState({
      tenant: identity.tenantCode,
      loginId: person.loginId,
      _id: person._id,
    });
    if (!state || state.locked) this.fail("IDENTITY");
    return { identity, person, state };
  },
  /** Resolves the canonical owner from a projection without copying credentials. @param {Object} person Projection. @param {string} tenant Target partition. @param {string} kind Target kind. @returns {Promise<Object>} Canonical anchor. */
  resolve: function (person, tenant, kind) {
    this.policy();
    if (
      !person ||
      person.active !== true ||
      person.disabled === true ||
      person.registrationSuspended === true
    )
      this.fail("IDENTITY");
    return this.anchor(
      person.authenticationIdentity || this.locator(tenant, kind, person),
    );
  },
  /** Reloads the password at its original owner, never the projection tenant. @param {Object} anchor Fresh anchor. @returns {Promise<Object>} Credential or rejection. */
  credential: async function (anchor) {
    const reference =
      anchor.person.password &&
      (anchor.person.password._id || anchor.person.password);
    const password = await this.read(
      "DefaultPasswordService",
      anchor.identity.tenantCode,
      { _id: this.recordId(reference) },
    );
    if (
      !password ||
      password.active === false ||
      password.loginId !== anchor.person.loginId ||
      typeof password.password !== "string" ||
      (password.provider && password.provider !== "PASSWORD")
    )
      this.fail("IDENTITY");
    return password;
  },
  /** Authenticates an existing identity after mailbox proof, with original lockout state. @param {Object} context Admitted continuation. @param {Object} session Verified session. @param {string} password Existing password. @returns {Promise<Object>} Fresh proved anchor. */
  proveExisting: async function (context, session, password) {
    this.policy();
    if (!this.base().ownsContext(context)) this.fail("FORBIDDEN");
    if (
      !session.proof ||
      !Number.isFinite(session.proofExpiresAt) ||
      session.proofExpiresAt <= Date.now() ||
      typeof password !== "string" ||
      !password ||
      password.length > 1024
    )
      this.fail("IDENTITY");
    const matches = await this.base().identities(context, session.email),
      anchors = new Map();
    for (const match of matches) {
      const resolved = await this.resolve(
        match.person,
        match.tenant,
        match.kind,
      );
      anchors.set(this.digest(resolved.identity), resolved);
    }
    if (anchors.size !== 1) this.fail("IDENTITY");
    const anchor = [...anchors.values()][0];
    if (
      SERVICE.DefaultEnterpriseManagementService.normalizeEmail(
        anchor.person.loginId,
      ) !== session.email
    )
      this.fail("IDENTITY");
    const credential = await this.credential(anchor);
    if (!(await UTILS.compareHash(password, credential.password))) {
      await SERVICE.DefaultAuthenticationProviderService.updateFailedAuthData({
        state: anchor.state,
        tenant: anchor.identity.tenantCode,
      });
      this.fail("IDENTITY");
    }
    anchor.state.attempts = 0;
    await SERVICE.DefaultAuthenticationProviderService.updateAuthData({
      state: anchor.state,
      tenant: anchor.identity.tenantCode,
    });
    return anchor;
  },
  /** Reloads a signed actor's current identity and context. @param {Object} request Authorized request. @returns {Promise<Object>} Fresh anchor. */
  actor: async function (request) {
    this.policy();
    return this.verifyAuthenticatedActor(request);
  },
  /** Reloads canonical authenticated identity without admitting optional membership features. Linked contexts still require qualified membership policy. @param {Object} request Authenticated request. @returns {Promise<Object>} Fresh canonical anchor. */
  verifyAuthenticatedActor: async function (request) {
    const auth = request.authData || {};
    if (
      auth.tokenType !== "access" ||
      auth.isSystem ||
      !["human", "customer"].includes(auth.principalType) ||
      !auth.loginId ||
      auth.tenant !== request.tenant
    )
      this.fail("FORBIDDEN");
    await SERVICE.DefaultPrincipalSecurityStampService.validate(auth);
    if (auth.sessionContext) {
      this.policy();
      return this.validateContext(auth);
    }
    const kind = auth.principalType === "human" ? "EMPLOYEE" : "CUSTOMER";
    const person = await this.read(this.principalService(kind), auth.tenant, {
      loginId: auth.loginId,
    });
    if (
      !person ||
      person.authenticationIdentity ||
      Number(person.authVersion || 1) !== Number(auth.authVersion)
    )
      this.fail("IDENTITY");
    const anchor = await this.anchor(this.locator(auth.tenant, kind, person));
    if (
      anchor.person.loginId !== auth.loginId ||
      Number(anchor.person.authVersion || 1) !== Number(auth.authVersion)
    )
      this.fail("IDENTITY");
    return anchor;
  },
  /** Uses the existing nRouter permission matcher. @param {Object} request Authenticated request. @param {string} permission Domain permission. @returns {void} Returns after permission. */
  permission: function (request, permission) {
    const owner = SERVICE.DefaultSecuredRequestPipelineService;
    if (
      !owner ||
      !owner.isPermissionGranted(
        permission,
        owner.getGrantedPermissions(request),
        owner.getRouteActionAuthorizationConfig(),
      )
    )
      this.fail("FORBIDDEN");
  },
  /** Admits a human administrator in the exact target or platform context. @param {Object} request Request. @param {string} code Enterprise. @returns {Promise<Object>} Fresh actor. */
  administrator: async function (request, code) {
    const actor = await this.actor(request),
      auth = request.authData;
    if (auth.principalType !== "human") this.fail("FORBIDDEN");
    this.permission(request, "profile.enterpriseAccess.assign");
    if (
      auth.entCode !== code &&
      !SERVICE.DefaultEnterpriseManagementService.isPlatformAdministrator(auth)
    )
      this.fail("FORBIDDEN");
    return actor;
  },
  /** Resolves normal access evidence, with private Team fields only through an explicitly supplied internal reader. @param {string} code Enterprise code. @param {Function} [reader] Trusted generated owner/request/continuation interface, never request data. @returns {Promise<Object>} Current Enterprise/Tenant evidence. */
  enterprise: async function (code, reader) {
    if (reader !== undefined && typeof reader !== "function")
      this.fail("UNAVAILABLE");
    let used = false;
    const selected =
      reader &&
      ((owner, request, execute) => {
        used = true;
        return reader(owner, request, execute);
      });
    const result =
      await SERVICE.DefaultEnterpriseManagementService.retrieveEnterpriseForAccess(
        code,
        selected,
      );
    if (reader && !used) this.fail("UNAVAILABLE");
    return result;
  },
  /** Reloads current assignment and enterprise policy without granting access. @param {string} code Assignment. @param {boolean} [history] Permit terminal inspection. @param {Function} [enterpriseReader] Explicit internal owner callback for Team decisions only. @returns {Promise<Object>} Bound current assignment. */
  assignment: async function (code, history = false, enterpriseReader) {
    if (typeof code !== "string" || !code.trim() || code.length > 128)
      this.fail("ASSIGNMENT");
    const item = await this.read(
      "DefaultEnterpriseAccessAssignmentService",
      this.authority(),
      { code },
    );
    if (
      !item ||
      !Number.isSafeInteger(item.revision) ||
      !item.enterpriseCode ||
      !item.tenantCode
    )
      this.fail("ASSIGNMENT");
    if (!history)
      this.base().assertAssignment(item, item.normalizedEmail, true);
    const target = await this.enterprise(item.enterpriseCode, enterpriseReader);
    if (target.tenantCode !== item.tenantCode) this.fail("ASSIGNMENT");
    return { item, enterprise: target.enterprise };
  },
  /** Retains invitation authority at creation; new invitations can be revalidated at acceptance. @param {Object} request Human inviter. @param {string} code Target enterprise. @returns {Promise<Object>} Immutable authority evidence. */
  invitationAuthority: async function (request, code) {
    const delegated =
      request.authData?.entCode !== code &&
      !SERVICE.DefaultEnterpriseManagementService.isPlatformAdministrator(
        request.authData,
      );
    const actor = delegated
      ? await this.actor(request)
      : await this.administrator(request, code);
    const consent = delegated
      ? await SERVICE.DefaultEnterpriseAdministrationConsentService.authorizeInvitation(
          request,
          code,
          request.body?.roleCode,
          request.body?.email,
        )
      : null;
    return {
      version: 1,
      identity: actor.identity,
      enterpriseCode: request.authData.entCode,
      ...(consent ? { administrationConsent: consent } : {}),
      ...(request.authData.sessionContext
        ? { membershipCode: request.authData.sessionContext.code }
        : {}),
    };
  },
  /** Rechecks current inviter permissions and target responsibility before acceptance. @param {Object} item Invitation. @returns {Promise<void>} Current delegation or rejection. */
  assertInviter: async function (item) {
    const binding = item.invitationAuthority;
    if (!binding || binding.version !== 1) this.fail("ASSIGNMENT");
    const anchor = await this.anchor(binding.identity);
    let person = anchor.person,
      tenant = anchor.identity.tenantCode;
    if (binding.membershipCode) {
      const current = (await this.assignment(binding.membershipCode)).item;
      if (
        !current.membership ||
        current.status !== "REGISTERED" ||
        this.digest(current.membership.identity) !==
          this.digest(anchor.identity) ||
        current.enterpriseCode !== binding.enterpriseCode
      )
        this.fail("FORBIDDEN");
      const groups = await this.groups(current.tenantCode, current.groupCodes);
      person = { userGroups: groups };
      tenant = current.tenantCode;
    } else {
      if (anchor.identity.recordKind !== "EMPLOYEE") this.fail("FORBIDDEN");
      person = {
        ...person,
        userGroups: await this.groups(tenant, person.userGroups || []),
      };
    }
    const authData = {
      tokenType: "access",
      principalType: "human",
      entCode: binding.enterpriseCode,
      tenant,
      loginId: anchor.person.loginId,
      userGroups:
        SERVICE.DefaultAuthenticationProviderService.resolveSessionUserGroups(
          person,
        ),
      permissions: UTILS.getUserGroupPermissions(person.userGroups),
    };
    this.permission({ authData }, "profile.enterpriseAccess.assign");
    const delegated = binding.administrationConsent
      ? await SERVICE.DefaultEnterpriseAdministrationConsentService.validateInvitation(
          item,
        )
      : null;
    if (
      binding.enterpriseCode !== item.enterpriseCode &&
      !delegated &&
      !SERVICE.DefaultEnterpriseManagementService.isPlatformAdministrator(
        authData,
      )
    )
      this.fail("FORBIDDEN");
    const role = SERVICE.DefaultEnterpriseManagementService.rolePolicy(
      item.roleCode,
    );
    if (
      role.delegable !== true ||
      this.digest(role.groupCodes) !== this.digest(item.groupCodes)
    )
      this.fail("FORBIDDEN");
  },
  /** Resolves actual target groups with exact owner reads. @param {string} tenant Target. @param {string[]} codes Responsibility groups. @returns {Promise<Object[]>} Groups. */
  groups: async function (tenant, codes) {
    if (!Array.isArray(codes) || !codes.length || codes.length > 100)
      this.fail("ASSIGNMENT");
    const result = this.rows(
      await SERVICE.DefaultUserGroupService.get({
        tenant,
        authData: SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
        query: { code: { $in: codes } },
        options: { recursive: true, skipItemCache: true },
        searchOptions: { pageSize: 101, pageNumber: 1 },
      }),
    );
    if (
      result.length !== new Set(codes).size ||
      new Set(result.map((row) => row.code)).size !== result.length ||
      result.some((row) => !codes.includes(row.code) || row.active === false)
    )
      this.fail("ASSIGNMENT");
    return result;
  },
  /** Marks private owner provenance for generated mutations. @param {Object} request Generated command. @param {string} kind Projection or membership. @returns {Object} Same request. */
  mutation: function (request, kind) {
    (kind === "projection" ? projectionWrites : membershipWrites).add(request);
    return request;
  },
  /** Recognizes in-process identity projection writes. @param {Object} request Request. @returns {boolean} Owner provenance. */
  ownsProjectionWrite: function (request) {
    return projectionWrites.has(request);
  },
  /** Recognizes in-process assignment lifecycle writes. @param {Object} request Request. @returns {boolean} Owner provenance. */
  ownsMembershipWrite: function (request) {
    return membershipWrites.has(request);
  },
  /** Marks an invitation prepared by the current human authority. @param {Object} request Generated save. @returns {Object} Same request. */
  invitationMutation: function (request) {
    invitationWrites.add(request);
    return request;
  },
  /** Lists all paths touched by plain fields or Mongo-style update operators. @param {Object} model Mutation. @returns {string[]} Changed paths. */
  paths: function (model) {
    if (!model || Array.isArray(model)) this.fail("FORBIDDEN");
    return Object.entries(model).flatMap(([key, value]) =>
      key.startsWith("$")
        ? Object.keys(value || {}).concat(
            key === "$rename" ? Object.values(value || {}) : [],
          )
        : [key],
    );
  },
  /** Resolves bounded save/upsert identities for single and bulk mutation guards. @param {Object} request Generated command. @param {Object[]} models Mutation models. @returns {Object|null} Exact selectors or the supplied update predicate. */
  mutationLookup: function (request, models) {
    if (models.length > 100) this.fail("FORBIDDEN");
    if (request.query) return request.query;
    const selectors = [];
    for (const model of models) {
      if (model.code) selectors.push({ code: model.code });
      if (model._id) selectors.push({ _id: model._id });
    }
    return selectors.length ? { $or: selectors } : null;
  },
  /** Rejects truncated mutation inventories rather than inspecting a partial page. @param {Object} response Generated read. @returns {Object[]} Complete bounded page. */
  mutationRows: function (response) {
    const rows = this.rows(response);
    if (
      rows.length > 100 ||
      (response.count !== undefined &&
        (!Number.isSafeInteger(response.count) ||
          response.count !== rows.length))
    )
      this.fail("FORBIDDEN");
    return rows;
  },
  /** Protects canonical projection binding and credential ownership before generated save/update. @param {Object} request Generated mutation. @returns {Promise<boolean>} Admitted command. */
  protectPrincipal: async function (request) {
    if (
      SERVICE.DefaultCanonicalHistoricalIdentityLinkService?.ownsWrite(request)
    )
      return true;
    const models = Array.isArray(request.model)
      ? request.model
      : [request.model || {}];
    const owns = this.ownsProjectionWrite(request);
    for (const model of models) {
      const paths = this.paths(model);
      if (
        paths.some(
          (path) =>
            path === "authenticationIdentity" ||
            path.startsWith("authenticationIdentity."),
        ) &&
        !owns
      )
        this.fail("FORBIDDEN");
      if (
        owns &&
        (!model.authenticationIdentity ||
          model.password ||
          model.apiKey ||
          model.apiKeyHash ||
          (model.userGroups || []).length)
      )
        this.fail("FORBIDDEN");
    }
    const query = this.mutationLookup(request, models);
    if (query) {
      const service =
        request.schemaModel?.schemaName === "customer"
          ? "DefaultCustomerService"
          : "DefaultEmployeeService";
      const rows = this.mutationRows(
        await SERVICE[service].get({
          tenant: request.tenant,
          authData:
            SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
          query,
          options: { recursive: false, skipItemCache: true },
          searchOptions: { pageSize: 101, pageNumber: 1 },
        }),
      );
      if (rows.length > 100) this.fail("FORBIDDEN");
      if (
        rows.some((row) => row.authenticationIdentity) &&
        models.some((model) =>
          this.paths(model).some((path) =>
            [
              "password",
              "loginId",
              "principalType",
              "userGroups",
              "authenticationIdentity",
            ].some((key) => path === key || path.startsWith(key + ".")),
          ),
        )
      )
        this.fail("FORBIDDEN");
    }
    return true;
  },
  /** Preserves mandatory original credentials while permitting owner-only credential-free projections. @param {Object} request Generated save. @returns {Promise<boolean>} Admitted principal. */
  protectPrincipalSave: function (request) {
    const models = Array.isArray(request.model)
      ? request.model
      : [request.model || {}];
    if (
      models.some((model) => !model.authenticationIdentity && !model.password)
    )
      this.fail("IDENTITY");
    return this.protectPrincipal(request);
  },
  /** Protects private membership and invitation authority from generic CRUD. @param {Object} request Generated mutation. @returns {Promise<boolean>} Admitted owner or unbound record. */
  protectAssignment: async function (request) {
    if (
      this.ownsMembershipWrite(request) ||
      invitationWrites.has(request) ||
      SERVICE.DefaultEnterpriseApplicationService?.ownsWrite?.(request) ||
      SERVICE.DefaultEnterpriseRegistrationService?.ownsProvisioningMutation?.(
        request,
      )
    )
      return true;
    const models = Array.isArray(request.model)
      ? request.model
      : [request.model || {}];
    if (
      models.some((model) =>
        this.paths(model).some((path) =>
          [
            "membership",
            "membershipMutation",
            "invitationAuthority",
            "invitationWithdrawal",
            "lifecycleNotifications",
            "application",
            "origin",
          ].some((key) => path === key || path.startsWith(key + ".")),
        ),
      ) ||
      models.some((model) => model.origin === "SELF_APPLICATION")
    )
      this.fail("FORBIDDEN");
    const query = this.mutationLookup(request, models);
    if (query) {
      const rows = this.mutationRows(
        await SERVICE.DefaultEnterpriseAccessAssignmentService.get({
          tenant: request.tenant,
          authData:
            SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
          query,
          options: { recursive: false, skipItemCache: true },
          searchOptions: { pageSize: 101, pageNumber: 1 },
        }),
      );
      if (
        rows.length > 100 ||
        rows.some(
          (row) =>
            row.membership ||
            row.invitationWithdrawal ||
            row.lifecycleNotifications ||
            row.application ||
            row.origin === "SELF_APPLICATION",
        )
      )
        this.fail("FORBIDDEN");
    }
    return true;
  },
  /** Invalidates affected context permissions through managed assignment revisions after a group change. @param {string} tenant Target partition. @param {string[]} codes Changed groups including descendants. @returns {Promise<void>} Awaited invalidation. */
  invalidateGroupMemberships: async function (tenant, codes) {
    if (!this.enabled()) return;
    const rows = await this.inventory(
      "DefaultEnterpriseAccessAssignmentService",
      this.authority(),
      {
        tenantCode: tenant,
        groupCodes: { $in: codes },
        "membership.phase": "COMPLETE",
        status: "REGISTERED",
        active: true,
      },
    );
    for (const item of rows)
      await this.write(item, {
        membership: {
          ...item.membership,
          permissionMutation: crypto.randomBytes(16).toString("hex"),
        },
      });
  },
  /** Invalidates only affected employee projections' accepted contexts after scope changes. @param {string} tenant Target partition. @param {string[]} ids Immutable projection IDs. @returns {Promise<void>} Awaited managed revision propagation. */
  invalidatePrincipalMemberships: async function (tenant, ids) {
    if (!this.enabled()) return;
    if (!Array.isArray(ids) || ids.some((id) => typeof id !== "string" || !id))
      this.fail("STORAGE");
    if (!ids.length) return;
    const rows = await this.inventory(
      "DefaultEnterpriseAccessAssignmentService",
      this.authority(),
      {
        tenantCode: tenant,
        "membership.projectionId": { $in: [...new Set(ids)] },
        "membership.phase": "COMPLETE",
        status: "REGISTERED",
        active: true,
      },
    );
    for (const item of rows)
      await this.write(item, {
        membership: {
          ...item.membership,
          permissionMutation: crypto.randomBytes(16).toString("hex"),
        },
      });
  },
  /** Applies a managed assignment revision and resolves uncertain acknowledgements by exact readback. @param {Object} item Current assignment. @param {Object} patch Owner patch. @returns {Promise<Object>} Persisted next revision. */
  write: async function (item, patch) {
    const mutation = crypto.randomBytes(32).toString("hex");
    const model = {
      ...patch,
      code: item.code,
      revision: item.revision,
      membershipMutation: mutation,
    };
    let failure;
    try {
      const response =
        await SERVICE.DefaultEnterpriseAccessAssignmentService.update(
          this.mutation(
            {
              tenant: this.authority(),
              authData:
                SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
              query: {
                code: item.code,
                revision: item.revision,
                status: item.status,
                active: item.active,
              },
              model,
              options: { recursive: false },
            },
            "membership",
          ),
        );
      this.base().assertWrite(response);
      if (response.result?.matchedCount !== 1) this.fail("CONFLICT");
    } catch (error) {
      failure = error;
    }
    const current = await this.read(
      "DefaultEnterpriseAccessAssignmentService",
      this.authority(),
      { code: item.code },
    );
    if (
      !current ||
      current.revision !== item.revision + 1 ||
      current.membershipMutation !== mutation ||
      Object.keys(patch).some(
        (key) =>
          current[key] === undefined ||
          this.digest(current[key]) !== this.digest(patch[key]),
      )
    ) {
      if (failure) throw failure;
      this.fail("CONFLICT");
    }
    await this.registerMembership(current);
    return current;
  },
  /** Builds the existing shared stamp key for a membership. @param {string} code Assignment. @returns {string} Typed principal key. */
  membershipKey: function (code) {
    return "membership:" + this.digest([this.authority(), code]);
  },
  /** Builds an immutable canonical identity stamp key. @param {Object} identity Locator. @returns {string} Typed principal key. */
  identityKey: function (identity) {
    return "identity:" + identity.recordKind + ":" + identity.recordId;
  },
  /** Registers one independent membership revision through nAuth. @param {Object} item Current assignment. @returns {Promise<*>} Cache acknowledgement. */
  registerMembership: function (item) {
    return SERVICE.DefaultPrincipalSecurityStampService.register(
      this.authority(),
      this.membershipKey(item.code),
      item.revision,
    );
  },
  /** Creates or reuses a target projection without a credential copy. @param {Object} item Assignment. @param {Object} anchor Proved anchor. @returns {Promise<Object>} Target employee. */
  projection: async function (item, anchor) {
    let person = await this.read("DefaultEmployeeService", item.tenantCode, {
      loginId: anchor.person.loginId,
    });
    if (person) {
      const bound =
        person.authenticationIdentity ||
        this.locator(item.tenantCode, "EMPLOYEE", person);
      if (
        this.digest(bound) !== this.digest(anchor.identity) ||
        person.active !== true ||
        person.disabled === true
      )
        this.fail("IDENTITY");
      return person;
    }
    const model = {
      code:
        "membershipEmployee_" + this.digest([item.tenantCode, anchor.identity]),
      active: true,
      loginId: anchor.person.loginId,
      name: anchor.person.name,
      principalType: "human",
      userGroups: [],
      authenticationIdentity: anchor.identity,
    };
    let failure;
    try {
      await SERVICE.DefaultEmployeeService.save(
        this.mutation(
          {
            tenant: item.tenantCode,
            authData:
              SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
            model,
            options: { recursive: false },
          },
          "projection",
        ),
      );
    } catch (error) {
      failure = error;
    }
    person = await this.read("DefaultEmployeeService", item.tenantCode, {
      code: model.code,
    });
    if (
      !person ||
      person.loginId !== model.loginId ||
      this.digest(person.authenticationIdentity) !==
        this.digest(anchor.identity) ||
      person.password ||
      person.principalType !== "human" ||
      person.active !== true
    ) {
      if (failure) throw failure;
      this.fail("STORAGE");
    }
    return person;
  },
  /** Prepares a single membership scope using the existing scope owner. @param {Object} item Assignment. @param {Object} person Target projection. @returns {Promise<void>} Exact scope readback. */
  ensureScope: async function (item, person) {
    const scope = {
      code: "membershipScope_" + this.digest(item.code),
      active: true,
      principalType: "human",
      principalCode: person.loginId,
      scopeType: "ENTERPRISE",
      scopeCode: item.enterpriseCode,
      tenantCode: item.tenantCode,
      enterpriseCode: item.enterpriseCode,
      effect: "ALLOW",
      status: "ACTIVE",
      inheritanceMode: "DIRECT",
    };
    const admitted = administratorScopeAcceptance.get(item);
    if (
      (CONFIG.get("enterpriseManagement") || {}).teamAdministration
        ?.genericMutationGuard?.enabled === true &&
      !admitted
    )
      this.fail("CONFLICT");
    const context = {
      authData: SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
    };
    if (admitted)
      administratorScopeContexts.set(context, {
        ...admitted,
        projectionId: this.recordId(person._id),
        groupsDigest: this.digest(person.userGroups),
      });
    try {
      await this.base().insert(
        "DefaultPrincipalScopeAssignmentService",
        context,
        item.tenantCode,
        scope,
        scope,
      );
      if (
        (CONFIG.get("enterpriseManagement") || {}).teamAdministration
          ?.genericMutationGuard?.enabled === true
      )
        await this.base().updateOne(
          "DefaultPrincipalScopeAssignmentService",
          context,
          item.tenantCode,
          this.base().administratorScopeQuery(scope),
          { status: "ACTIVE" },
        );
    } finally {
      administratorScopeContexts.delete(context);
    }
  },
  /** Accepts an invitation with immutable anchor proof and recoverable provisioning. @param {Object} anchor Proved identity. @param {Object} item Assignment. @param {Function} [authorize] Existing one-use proof owner callback. @returns {Promise<Object>} Accepted membership. */
  accept: async function (anchor, item, authorize) {
    this.policy();
    if (
      item.normalizedEmail !==
        SERVICE.DefaultEnterpriseManagementService.normalizeEmail(
          anchor.person.loginId,
        ) ||
      item.registration
    )
      this.fail("IDENTITY");
    this.base().assertAssignment(item, item.normalizedEmail, true);
    if (item.membership) {
      if (
        this.digest(item.membership.identity) !==
          this.digest(anchor.identity) ||
        item.membership.assignmentDigest !== this.base().assignmentDigest(item)
      )
        this.fail("CONFLICT");
      if (item.status === "REGISTERED" && item.membership.phase === "COMPLETE")
        return item;
    } else {
      await this.assertInviter(item);
      item = await this.write(item, {
        membership: {
          version: 1,
          identity: anchor.identity,
          phase: "PREPARED",
          commandId: crypto.randomBytes(32).toString("hex"),
          assignmentDigest: this.base().assignmentDigest(item),
          acceptedAt: new Date().toISOString(),
        },
      });
    }
    if (authorize) await authorize(item);
    await this.assertInviter(item);
    const previousVersion = anchor.person.authVersion || 1;
    anchor = await this.anchor(anchor.identity);
    if ((anchor.person.authVersion || 1) !== previousVersion)
      this.fail("IDENTITY");
    const person = await this.projection(item, anchor);
    administratorScopeAcceptance.set(item, {
      assignmentCode: item.code,
      revision: item.revision,
      commandId: item.membership.commandId,
      identity: anchor.identity,
      anchorVersion: previousVersion,
    });
    try {
      await this.ensureScope(item, person);
    } finally {
      administratorScopeAcceptance.delete(item);
    }
    const fresh = (await this.assignment(item.code)).item;
    if (
      fresh.revision !== item.revision ||
      fresh.membership.assignmentDigest !== this.base().assignmentDigest(fresh)
    )
      this.fail("CONFLICT");
    const canonical = await this.anchor(anchor.identity);
    if ((canonical.person.authVersion || 1) !== previousVersion)
      this.fail("IDENTITY");
    item = await this.write(fresh, {
      membership: {
        ...fresh.membership,
        phase: "COMPLETE",
        projectionId: this.recordId(person._id),
      },
      status: "REGISTERED",
      registeredLoginId: person.loginId,
    });
    if (
      (CONFIG.get("enterpriseManagement") || {}).notifications?.enabled === true
    ) {
      await SERVICE.DefaultEnterpriseNotificationService.request(
        item.code,
        "ACCOUNT_READY",
      );
      item = (await this.assignment(item.code, true)).item;
    }
    return item;
  },
  /** Accepts an existing person's selected invitation within its verified continuation. @param {Object} context Admitted context. @param {Object} session Verified continuation. @param {Object} input Exact DTO. @returns {Promise<Object>} Safe registration completion. */
  completeExisting: async function (context, session, input) {
    this.base().input(input, ["continuation", "assignmentCode", "password"]);
    await this.base().rate(context, "complete", session.email);
    const anchor = await this.proveExisting(context, session, input.password);
    const choice = (session.assignments || []).find(
      (item) => item.code === (input.assignmentCode || session.assignmentCode),
    );
    if (!choice) this.fail("ASSIGNMENT");
    if (
      session.membershipAssignmentCode &&
      session.membershipAssignmentCode !== choice.code
    )
      this.fail("CONFLICT");
    session.membershipAssignmentCode = choice.code;
    const item = (await this.assignment(choice.code)).item;
    const accepted = await this.accept(anchor, item, (current) =>
      this.base().authoriseProvisioning(context, session, {
        code: current.code,
        registration: { commandId: current.membership.commandId },
      }),
    );
    session.stage = ENUMS.ProfileEmployeeAccessStage.COMPLETE.key;
    session.membershipIdentity = anchor.identity;
    session.signInEnterpriseCode = accepted.enterpriseCode;
    delete session.proof;
    delete session.proofExpiresAt;
    return this.base().project(session);
  },
  /** Checks current acceptance without replaying provisioning or requiring a submitted password. @param {Object} session Private continuation. @returns {Promise<Object>} Safe current completion. */
  completionStatus: async function (session) {
    const { item, enterprise } = await this.assignment(
      session.membershipAssignmentCode,
    );
    if (
      item.status !== "REGISTERED" ||
      item.membership?.phase !== "COMPLETE" ||
      this.digest(item.membership.identity) !==
        this.digest(session.membershipIdentity)
    )
      this.fail("ASSIGNMENT");
    const person = await this.read("DefaultEmployeeService", item.tenantCode, {
      _id: item.membership.projectionId,
    });
    await this.sessionContext(
      person,
      { ...enterprise, tenant: { code: item.tenantCode } },
      "Employee",
    );
    return this.base().project(session);
  },
  /** Adopts only a completed owner-verified new-account registration, retaining its credential and checkpoint. @param {Object} context Admitted registration. @param {Object} assignment Completed assignment. @param {Object} person Exact original account. @returns {Promise<Object>} Membership-bearing assignment. */
  adoptRegistration: async function (context, assignment, person) {
    this.policy();
    if (
      !this.base().ownsContext(context) ||
      assignment.registration?.phase !== "COMPLETE" ||
      assignment.status !== "REGISTERED" ||
      person.registrationAssignmentCode !== assignment.code ||
      person.loginId !== assignment.normalizedEmail
    )
      this.fail("FORBIDDEN");
    const anchor = await this.resolve(
      person,
      assignment.tenantCode,
      "EMPLOYEE",
    );
    if (
      this.digest(anchor.identity) !==
      this.digest(this.locator(assignment.tenantCode, "EMPLOYEE", person))
    )
      this.fail("IDENTITY");
    if (assignment.membership) {
      if (
        assignment.membership.phase !== "COMPLETE" ||
        this.digest(assignment.membership.identity) !==
          this.digest(anchor.identity)
      )
        this.fail("CONFLICT");
      return assignment;
    }
    await this.assertInviter(assignment);
    await this.ensureScope(assignment, person);
    return this.write(assignment, {
      membership: {
        version: 1,
        identity: anchor.identity,
        phase: "COMPLETE",
        projectionId: this.recordId(person._id),
        assignmentDigest: this.base().assignmentDigest(assignment),
        acceptedAt: new Date().toISOString(),
      },
    });
  },
  /** Builds fresh context groups, canonical proof and independent security bindings for issue/refresh/switch. @param {Object} person Target projection. @param {Object} enterprise Active enterprise. @param {string} type Projection type. @returns {Promise<Object>} Session context or null for legacy. */
  sessionContext: async function (person, enterprise, type) {
    this.policy();
    const kind = type === "Customer" ? "CUSTOMER" : "EMPLOYEE";
    const anchor = await this.resolve(person, enterprise.tenant.code, kind);
    if (!person.authenticationIdentity && kind === "CUSTOMER") return null;
    if (kind === "CUSTOMER")
      return SERVICE.DefaultCustomerRegistrationService.participationContext(
        person,
        enterprise,
      );
    const records = await this.inventory(
      "DefaultEnterpriseAccessAssignmentService",
      this.authority(),
      {
        enterpriseCode: enterprise.code,
        "membership.identity.recordId": anchor.identity.recordId,
        "membership.identity.tenantCode": anchor.identity.tenantCode,
        "membership.identity.recordKind": anchor.identity.recordKind,
      },
    );
    if (!records.length && !person.authenticationIdentity) return null;
    if (records.length !== 1) this.fail("ASSIGNMENT");
    const item = (await this.assignment(records[0].code)).item;
    const consent = item.invitationAuthority?.administrationConsent
      ? await SERVICE.DefaultEnterpriseAdministrationConsentService.validateInvitation(
          item,
        )
      : null;
    if (
      item.status !== "REGISTERED" ||
      item.membership?.phase !== "COMPLETE" ||
      item.membership.projectionId !== this.recordId(person._id) ||
      this.digest(item.membership.identity) !== this.digest(anchor.identity) ||
      item.membership.assignmentDigest !== this.base().assignmentDigest(item)
    )
      this.fail("ASSIGNMENT");
    const scope = await this.read(
      "DefaultPrincipalScopeAssignmentService",
      item.tenantCode,
      { code: "membershipScope_" + this.digest(item.code) },
    );
    if (
      !scope ||
      scope.active !== true ||
      scope.status !== "ACTIVE" ||
      scope.effect !== "ALLOW" ||
      scope.principalType !== "human" ||
      scope.principalCode !== person.loginId ||
      scope.enterpriseCode !== enterprise.code ||
      scope.scopeType !== "ENTERPRISE" ||
      scope.scopeCode !== enterprise.code ||
      scope.tenantCode !== item.tenantCode ||
      scope.inheritanceMode !== "DIRECT"
    )
      this.fail("ASSIGNMENT");
    if (!SERVICE.DefaultPrincipalScopeGovernanceService.isEffective(scope))
      this.fail("ASSIGNMENT");
    const groups = await this.groups(item.tenantCode, item.groupCodes);
    const effective =
      await SERVICE.DefaultPrincipalScopeGovernanceService.getEffectiveScopes({
        tenant: item.tenantCode,
        authData: {
          principalType: "human",
          loginId: person.loginId,
          userGroups:
            SERVICE.DefaultAuthenticationProviderService.resolveSessionUserGroups(
              { userGroups: groups },
            ),
        },
      });
    if (
      !effective ||
      !Array.isArray(effective.scopes) ||
      !Array.isArray(effective.deniedScopes) ||
      !effective.scopes.some(
        (row) =>
          row.scopeType === "ENTERPRISE" && row.scopeCode === enterprise.code,
      ) ||
      effective.deniedScopes.some(
        (row) =>
          (row.scopeType === "ENTERPRISE" &&
            row.scopeCode === enterprise.code) ||
          (row.scopeType === "TENANT" && row.scopeCode === item.tenantCode),
      )
    )
      this.fail("ASSIGNMENT");
    const binding = {
      owner: "profile",
      code: item.code,
      version: item.revision,
    };
    await SERVICE.DefaultPrincipalSecurityStampService.register(
      anchor.identity.tenantCode,
      this.identityKey(anchor.identity),
      anchor.person.authVersion || 1,
    );
    await this.registerMembership(item);
    const securityBindings = [
      {
        tenant: anchor.identity.tenantCode,
        principalId: this.identityKey(anchor.identity),
        authVersion: anchor.person.authVersion || 1,
      },
      {
        tenant: this.authority(),
        principalId: this.membershipKey(item.code),
        authVersion: item.revision,
      },
    ];
    if (consent) {
      const owner = SERVICE.DefaultEnterpriseAdministrationConsentService;
      await owner.register(item.enterpriseCode, consent);
      securityBindings.push({
        tenant: this.authority(),
        principalId: owner.stampKey(item.enterpriseCode, consent.code),
        authVersion: consent.revision,
      });
    }
    return {
      anchor,
      person: {
        ...person,
        userGroups: groups,
        userGroupCodes: undefined,
        userGroupPermissions: undefined,
      },
      sessionContext: binding,
      securityBindings,
    };
  },
  /** Validates the complete current context at refresh/switch; stale bindings cannot be upgraded. @param {Object} session Signed/cache-owned session. @returns {Promise<Object>} Fresh canonical anchor. */
  validateContext: async function (session) {
    if (session.sessionContext?.owner === "profile.customerEligibility")
      return SERVICE.DefaultCustomerRegistrationService.validateCustomerEligibilityContext(
        { ...session, type: "Customer" },
      );
    if (session.sessionContext?.owner === "profile.customerParticipation")
      return SERVICE.DefaultCustomerRegistrationService.validateParticipationContext(
        session,
      );
    const binding = session.sessionContext;
    if (
      !binding ||
      binding.owner !== "profile" ||
      !Number.isSafeInteger(binding.version) ||
      !Array.isArray(session.securityBindings)
    )
      this.fail("IDENTITY");
    await SERVICE.DefaultPrincipalSecurityStampService.validateBindings(
      session.securityBindings,
    );
    const { item, enterprise } = await this.assignment(binding.code);
    if (
      !item.membership ||
      item.revision !== binding.version ||
      item.enterpriseCode !== session.entCode ||
      item.tenantCode !== session.tenant
    )
      this.fail("ASSIGNMENT");
    const person = await this.read("DefaultEmployeeService", session.tenant, {
      _id: item.membership.projectionId,
    });
    if (
      !person ||
      person.loginId !== session.loginId ||
      person.principalType !== session.principalType
    )
      this.fail("IDENTITY");
    const current = await this.sessionContext(
      person,
      { ...enterprise, tenant: { code: item.tenantCode } },
      "Employee",
    );
    if (
      !current ||
      this.digest(current.sessionContext) !== this.digest(binding) ||
      this.digest(current.securityBindings) !==
        this.digest(session.securityBindings)
    )
      this.fail("IDENTITY");
    return current.anchor;
  },
  /** Lists only the actor's immutable bound memberships and matching unused invitations. @param {Object} request Actor. @returns {Promise<Object>} Business-facing choices. */
  list: async function (request) {
    this.base().input(request.query || {}, []);
    const anchor = await this.actor(request),
      email = SERVICE.DefaultEnterpriseManagementService.normalizeEmail(
        anchor.person.loginId,
      );
    const records = await this.inventory(
      "DefaultEnterpriseAccessAssignmentService",
      this.authority(),
      { normalizedEmail: email },
    );
    const items = [];
    for (const row of records) {
      if (
        row.active !== true ||
        !["PENDING", "ACTIVE", "REGISTERED", "SUSPENDED"].includes(
          row.status,
        ) ||
        (row.registration && row.membership?.phase !== "COMPLETE")
      )
        continue;
      if (
        row.membership &&
        this.digest(row.membership.identity) !== this.digest(anchor.identity)
      )
        continue;
      const { item, enterprise } = await this.assignment(row.code, true);
      items.push(this.project(item, enterprise));
      if (items.length > 100) this.fail("UNAVAILABLE");
    }
    return { contractVersion: 1, items };
  },
  /** Projects allowed business fields only. @param {Object} item Assignment. @param {Object} enterprise Enterprise. @returns {Object} Safe membership. */
  project: function (item, enterprise) {
    return {
      code: item.code,
      revision: item.revision,
      enterpriseCode: item.enterpriseCode,
      enterpriseName:
        typeof enterprise.name === "string"
          ? enterprise.name
          : enterprise.name?.en || enterprise.code,
      responsibility:
        SERVICE.DefaultEnterpriseManagementService.rolePolicy(item.roleCode)
          .label || item.roleCode,
      status: item.status,
      accepted:
        item.membership?.phase === "COMPLETE" && item.status === "REGISTERED",
    };
  },
  /** Performs one fixed authenticated acceptance or membership lifecycle command. @param {Object} request Authenticated request. @param {string} operation Controller-owned command. @returns {Promise<Object>} Fresh safe state. */
  command: async function (request, operation) {
    if (["SUSPEND", "REVOKE", "RESUME"].includes(operation))
      return SERVICE.DefaultEnterpriseTeamAdministrationService.changeMembership(
        request,
        operation,
      );
    const input = this.base().input(request.body || {}, [
      "assignmentCode",
      "revision",
    ]);
    const anchor = await this.actor(request),
      { item, enterprise } = await this.assignment(
        input.assignmentCode,
        operation !== "ACCEPT",
      );
    if (
      !Number.isSafeInteger(input.revision) ||
      input.revision < 1 ||
      input.revision !== item.revision
    )
      this.fail("CONFLICT");
    if (operation === "ACCEPT") {
      if (request.authData.authenticationMethod !== "PASSWORD")
        this.fail("IDENTITY");
      return this.project(await this.accept(anchor, item), enterprise);
    }
    this.fail("ASSIGNMENT");
  },
};
