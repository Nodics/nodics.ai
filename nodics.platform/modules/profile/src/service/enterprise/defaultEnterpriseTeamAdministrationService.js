/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
const enterpriseWrites = new WeakSet();
const historicalLinkRetirements = new Set();
const administratorOwnerWrites = new WeakMap();
const enterpriseReads = new WeakMap();
const { cloneDeep } = require("lodash");
const { ObjectId } = require("mongodb");
const { types } = require("node:util");
const objectIdScalarKeys = Reflect.ownKeys(
  new ObjectId("000000000000000000000000"),
);

/**
 * @module profile/service/enterprise/DefaultEnterpriseTeamAdministrationService
 * @description Serializes membership restrictions and administrator handover on the existing enterprise authority; uncertain writes retain recoverable evidence.
 * @layer service
 * @owner profile
 * @override Later Profile layers may tighten admission and replace serialized persistence, preserving current permission, revision, last-admin and same-command recovery checks.
 */
module.exports = {
  /** Recognizes only the unchanged exact generated request during a private Team read, independently of mutation qualification. @param {Object} request Generated request. @returns {boolean} In-process provenance; no system/body bypass. */
  ownsEnterpriseRead: function (request) {
    return (
      enterpriseReads.has(request) &&
      enterpriseReads
        .get(request)
        .includes(
          this.memberships().digest([
            request.tenant,
            request.query,
            request.options,
            request.searchOptions,
          ]),
        )
    );
  },
  /** Holds private Team-field visibility for one bounded fresh generated read. @param {Object} owner Exact Enterprise generated owner. @param {Object} request Owner-built request. @param {Function} [execute] Existing generated/Consent read continuation. @returns {Promise<Object>} Original generated envelope, never a public projection. */
  readEnterpriseEnvelope: async function (owner, request, execute) {
    if (
      owner !== SERVICE.DefaultEnterpriseService ||
      typeof owner?.get !== "function" ||
      typeof request?.tenant !== "string" ||
      !request.tenant ||
      !request.query ||
      Array.isArray(request.query) ||
      request.options?.recursive !== false ||
      request.options.skipItemCache !== true ||
      !Number.isSafeInteger(request.searchOptions?.pageSize) ||
      request.searchOptions.pageSize < 1 ||
      request.searchOptions.pageSize > 101 ||
      request.searchOptions.pageNumber !== 1 ||
      (execute !== undefined && typeof execute !== "function") ||
      enterpriseReads.has(request)
    )
      this.fail("UNAVAILABLE");
    const original = this.memberships().digest([
      request.tenant,
      request.query,
      request.options,
      request.searchOptions,
    ]);
    const preparedOptions = {
      ...request.searchOptions,
      limit: request.searchOptions.pageSize,
      skip: 0,
      snapshot: request.searchOptions.snapshot || false,
    };
    if (preparedOptions.timeout === true)
      preparedOptions.maxTimeMS = CONFIG.get("queryMaxTimeMS");
    const prepared = this.memberships().digest([
      request.tenant,
      request.query,
      request.options,
      preparedOptions,
    ]);
    enterpriseReads.set(request, [original, prepared]);
    try {
      return await (execute ? execute() : owner.get(request));
    } finally {
      enterpriseReads.delete(request);
    }
  },
  /** Creates a narrow internal callback for an explicitly selected Enterprise access read; Tenant and arbitrary owners are never admitted. @returns {Function} Generated owner/request/continuation interface, not a DTO flag. */
  enterpriseReader: function () {
    return (owner, request, execute) =>
      this.readEnterpriseEnvelope(owner, request, execute);
  },
  /** Reads one exact Enterprise privately through its generated owner and existing strict envelope parser. @param {string} tenant Owner-resolved partition. @param {Object} query Exact owner selector. @returns {Promise<Object|null>} Uncached record; ambiguity rejects. */
  readEnterprise: async function (tenant, query) {
    const m = this.memberships();
    const rows = m.rows(
      await this.readEnterpriseEnvelope(SERVICE.DefaultEnterpriseService, {
        tenant,
        authData: SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
        query,
        options: { recursive: false, skipItemCache: true },
        searchOptions: { pageSize: 2, pageNumber: 1 },
      }),
    );
    if (rows.length > 1) this.fail("CONFLICT");
    return rows[0];
  },
  /** Selects private Enterprise evidence only for this explicit Team access path. @param {string} code Enterprise code. @returns {Promise<Object>} Fresh Enterprise/Tenant access evidence. */
  enterpriseForAccess: function (code) {
    return this.memberships().enterprise(code, this.enterpriseReader());
  },
  /** Selects private Enterprise evidence for Team assignment decisions only. @param {string} code Assignment code. @param {boolean} [history] Terminal inspection. @returns {Promise<Object>} Fresh assignment and private target Enterprise. */
  assignment: function (code, history = false) {
    return this.memberships().assignment(
      code,
      history,
      this.enterpriseReader(),
    );
  },
  /** Validates a bounded plain public projection before cloning or traversing provider values. @param {Object[]} rows Generated Enterprise rows. @returns {void} Rejects accessors, functions, custom serialization/classes, excess budgets and scalar adornments. */
  validateEnterprisePublicRows: function (rows) {
    if (
      types.isProxy(rows) ||
      !Array.isArray(rows) ||
      Object.getPrototypeOf(rows) !== Array.prototype ||
      rows.length > 1000
    )
      this.fail("UNAVAILABLE");
    const rootDescriptors = Object.getOwnPropertyDescriptors(rows);
    for (const key of Reflect.ownKeys(rootDescriptors)) {
      if (key === "length") continue;
      const descriptor = rootDescriptors[key];
      if (
        typeof key !== "string" ||
        !/^(0|[1-9][0-9]*)$/.test(key) ||
        !Object.hasOwn(descriptor, "value") ||
        !descriptor.enumerable
      )
        this.fail("UNAVAILABLE");
      const row = descriptor.value;
      if (
        !row ||
        typeof row !== "object" ||
        types.isProxy(row) ||
        ![Object.prototype, null].includes(Object.getPrototypeOf(row))
      )
        this.fail("UNAVAILABLE");
    }
    let entries = 0;
    const seen = new WeakSet(),
      active = new WeakSet(),
      pending = [{ value: rows, depth: 0 }];
    while (pending.length) {
      const frame = pending.pop(),
        value = frame.value;
      if (frame.leave) {
        active.delete(value);
        continue;
      }
      if (frame.depth > 32 || typeof value === "function")
        this.fail("UNAVAILABLE");
      if (!value || typeof value !== "object") continue;
      if (types.isProxy(value)) this.fail("UNAVAILABLE");
      if (active.has(value)) this.fail("UNAVAILABLE");
      if (seen.has(value)) continue;
      seen.add(value);
      const proto = Object.getPrototypeOf(value);
      if (proto === Date.prototype) {
        if (
          Reflect.ownKeys(value).length ||
          !Number.isFinite(Date.prototype.getTime.call(value))
        )
          this.fail("UNAVAILABLE");
        continue;
      }
      if (proto === Buffer.prototype) {
        if (
          !Buffer.isBuffer(value) ||
          value.length > 65536 ||
          Reflect.ownKeys(value).some(
            (key) =>
              typeof key !== "string" ||
              !/^(0|[1-9][0-9]*)$/.test(key) ||
              Number(key) >= value.length,
          )
        )
          this.fail("UNAVAILABLE");
        entries += value.length;
        if (entries > 50000) this.fail("UNAVAILABLE");
        continue;
      }
      if (proto === ObjectId.prototype) {
        const descriptors = Object.getOwnPropertyDescriptors(value);
        if (
          Reflect.ownKeys(descriptors).some(
            (key) =>
              !objectIdScalarKeys.includes(key) ||
              !Object.hasOwn(descriptors[key], "value"),
          )
        )
          this.fail("UNAVAILABLE");
        for (const key of objectIdScalarKeys) {
          const scalar = descriptors[key]?.value;
          if (
            types.isProxy(scalar) ||
            !(scalar instanceof Uint8Array) ||
            scalar.length !== 12 ||
            ![Buffer.prototype, Uint8Array.prototype].includes(
              Object.getPrototypeOf(scalar),
            ) ||
            Reflect.ownKeys(scalar).some(
              (name) =>
                typeof name !== "string" ||
                !/^(0|[1-9][0-9]*)$/.test(name) ||
                Number(name) >= 12,
            )
          )
            this.fail("UNAVAILABLE");
        }
        continue;
      }
      if (
        (!Array.isArray(value) && ![Object.prototype, null].includes(proto)) ||
        (Array.isArray(value) && proto !== Array.prototype)
      )
        this.fail("UNAVAILABLE");
      if (Array.isArray(value) && value.length > 50000)
        this.fail("UNAVAILABLE");
      const descriptors = Object.getOwnPropertyDescriptors(value),
        keys = Reflect.ownKeys(descriptors);
      entries += keys.length;
      if (entries > 50000) this.fail("UNAVAILABLE");
      active.add(value);
      pending.push({ value, leave: true });
      for (const key of keys) {
        const descriptor = descriptors[key];
        if (
          typeof key !== "string" ||
          !Object.hasOwn(descriptor, "value") ||
          (!descriptor.enumerable &&
            !(Array.isArray(value) && key === "length"))
        )
          this.fail("UNAVAILABLE");
        pending.push({ value: descriptor.value, depth: frame.depth + 1 });
      }
    }
  },
  /** Removes Team authority evidence from public generated reads without mutating cached/shared rows; Consent retains independent admission and redaction. @param {Object} request Generated read. @param {Object} response Pipeline response. @returns {boolean} Original envelope with independently cloned public results. */
  redactEnterprise: function (request, response) {
    if (this.ownsEnterpriseRead(request)) return true;
    let projected = false;
    for (const [key, envelope] of [
      ["result", response],
      ["success", response?.success],
    ]) {
      if (!envelope || !Object.hasOwn(envelope, "result")) continue;
      if (!Array.isArray(envelope.result)) this.fail("UNAVAILABLE");
      this.validateEnterprisePublicRows(envelope.result);
      projected = true;
      const rows = cloneDeep(envelope.result),
        seen = new WeakSet(),
        pending = [rows];
      while (pending.length) {
        const value = pending.pop();
        if (
          !value ||
          typeof value !== "object" ||
          seen.has(value) ||
          (!Array.isArray(value) &&
            ![Object.prototype, null].includes(Object.getPrototypeOf(value)))
        )
          continue;
        seen.add(value);
        delete value.teamOperation;
        delete value.teamRevision;
        delete value.defaultAdminAssignmentCode;
        for (const child of Object.values(value))
          if (child && typeof child === "object") pending.push(child);
      }
      if (key === "success") response.success = { ...envelope, result: rows };
      else response.result = rows;
    }
    if (!projected) this.fail("UNAVAILABLE");
    return true;
  },
  /** Finds exact transient owner provenance without accepting request flags or generic projection ownership. @param {Object} request Generated command. @returns {Object|null} Fixed existing lifecycle owner. */
  administratorMutationOwner: function (request) {
    for (const owner of [
      SERVICE.DefaultEnterpriseRegistrationService,
      SERVICE.DefaultEnterpriseMembershipService,
    ])
      if (owner?.ownsAdministratorMutation?.(request)) return owner;
    return null;
  },
  /** Revalidates the exact generated write against its held Team operation. @param {Object} request Exact transient command. @param {string} service Fixed schema owner. @param {string} operation Fixed hook. @param {boolean} [after] Validate acknowledged readback instead of activation pre-state. @returns {Promise<boolean>} Narrow additive lifecycle admission only. */
  admitsAdministratorOwnerMutation: async function (
    request,
    service,
    operation,
    after = false,
  ) {
    const held = administratorOwnerWrites.get(request),
      owner = this.administratorMutationOwner(request);
    if (
      !held ||
      !owner ||
      held.owner !== owner ||
      held.service !== service ||
      held.operation !== operation
    )
      return false;
    const evidence = await owner.validateAdministratorMutation(request, after);
    if (this.memberships().digest(evidence) !== held.hash)
      this.fail("CONFLICT");
    const enterprise = await this.readEnterprise(
      this.memberships().authority(),
      { code: evidence.enterpriseCode },
    );
    if (
      enterprise?.active !== true ||
      enterprise.teamRevision !== held.revision ||
      enterprise.teamOperation?.id !== held.id ||
      enterprise.teamOperation?.phase !== "PENDING" ||
      enterprise.teamOperation.operation !== "OWNER_PROVISION" ||
      enterprise.teamOperation.hash !== held.hash ||
      this.memberships().digest(enterprise.teamOperation.input) !== held.hash
    )
      this.fail("CONFLICT");
    return true;
  },
  /** Serializes a fixed privately proved additive scope/activation step on the existing enterprise owner. @param {Object} request Exact generated command. @param {string} service Fixed owner. @param {string} operation Fixed save/update. @param {Function} work Owner callback retaining generated hooks. @returns {Promise<Object>} Acknowledged generated outcome; uncertainty retains the fence. */
  withAdministratorOwnerMutation: async function (
    request,
    service,
    operation,
    work,
  ) {
    const p = this.genericAdministratorPolicy();
    if (
      !p ||
      ![
        "DefaultEmployeeService",
        "DefaultPrincipalScopeAssignmentService",
      ].includes(service) ||
      !["save", "update"].includes(operation) ||
      typeof work !== "function"
    )
      this.fail("UNAVAILABLE");
    this.policy();
    const owner = this.administratorMutationOwner(request);
    if (!owner) this.fail("CONFLICT");
    const evidence = await owner.validateAdministratorMutation(request),
      m = this.memberships();
    const hash = m.digest(evidence),
      id =
        "ownerProvision_" +
        m.digest([
          evidence.owner,
          evidence.assignmentCode,
          evidence.commandId,
          evidence.step,
          evidence.targetCode,
        ]);
    let enterprise = await this.readEnterprise(m.authority(), {
      code: evidence.enterpriseCode,
    });
    if (!enterprise || enterprise.active !== true) this.fail("CONFLICT");
    const previous = enterprise.teamOperation;
    if (previous?.phase === "PENDING") {
      if (
        previous.id !== id ||
        previous.hash !== hash ||
        previous.operation !== "OWNER_PROVISION"
      )
        this.fail("CONFLICT");
    } else {
      if (previous && previous.phase !== "COMPLETE") this.fail("CONFLICT");
      const revision =
        enterprise.teamRevision === undefined ? 0 : enterprise.teamRevision;
      if (
        !Number.isSafeInteger(revision) ||
        revision < 0 ||
        revision >= 2147483647
      )
        this.fail("CONFLICT");
      enterprise = await this.persist(
        enterprise,
        {
          ...(previous
            ? {
                "teamOperation.id": previous.id,
                "teamOperation.phase": "COMPLETE",
              }
            : { teamOperation: { $exists: false } }),
          ...(enterprise.teamRevision === undefined
            ? { teamRevision: { $exists: false } }
            : { teamRevision: revision }),
        },
        {
          teamRevision: revision + 1,
          teamOperation: {
            id,
            hash,
            operation: "OWNER_PROVISION",
            phase: "PENDING",
            input: evidence,
          },
        },
      );
    }
    const held = {
      owner,
      service,
      operation,
      hash,
      id,
      revision: enterprise.teamRevision,
    };
    administratorOwnerWrites.set(request, held);
    let response;
    try {
      if (
        !(await this.admitsAdministratorOwnerMutation(
          request,
          service,
          operation,
        ))
      )
        this.fail("CONFLICT");
      response = await work();
      m.base().assertWrite(response);
      if (
        !(await this.admitsAdministratorOwnerMutation(
          request,
          service,
          operation,
          true,
        ))
      )
        this.fail("CONFLICT");
    } finally {
      administratorOwnerWrites.delete(request);
    }
    await this.finish(enterprise, {
      owner: evidence.owner,
      step: evidence.step,
      targetCode: evidence.targetCode,
      phase: "COMPLETE",
    });
    return response;
  },
  /**
   * Resolves separately qualified generic mutation coverage; absence never claims installed enforcement.
   * @returns {Object|null} Bounded explicit full-administrator classification policy or inactive source.
   */
  genericAdministratorPolicy: function () {
    const p = (CONFIG.get("enterpriseManagement") || {}).teamAdministration
      ?.genericMutationGuard;
    if (p?.enabled !== true) return null;
    if (
      p.installedCoverageQualified !== true ||
      !Number.isSafeInteger(p.maximumRecords) ||
      p.maximumRecords < 1 ||
      p.maximumRecords > 100 ||
      ![
        p.superAdministratorRoleCodes,
        p.nativeSuperAdministratorGroupCodes,
      ].every(
        (items) =>
          Array.isArray(items) &&
          items.length > 0 &&
          items.length <= 20 &&
          new Set(items).size === items.length &&
          items.every(
            (value) =>
              typeof value === "string" &&
              /^[A-Za-z0-9_.:-]{1,128}$/.test(value),
          ),
      )
    )
      this.fail("UNAVAILABLE");
    return p;
  },
  /**
   * Reads a complete bounded page through a fixed generated owner with strict fresh evidence.
   * @param {string} owner Generated owner selected internally.
   * @param {string} tenant Exact persisted partition.
   * @param {Object} query Owner-built selector.
   * @param {Object} policy Qualified bounds.
   * @returns {Promise<Object[]>} Complete fresh records; failure, ambiguity and overflow reject.
   */
  genericAdministratorRows: async function (owner, tenant, query, policy) {
    if (
      typeof tenant !== "string" ||
      !tenant ||
      !SERVICE[owner]?.get ||
      !SERVICE.DefaultIdentityGovernanceService?.getSystemAuthData
    )
      this.fail("UNAVAILABLE");
    const request = {
      tenant,
      authData: SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
      query,
      options: { recursive: false, skipItemCache: true },
      searchOptions: { pageSize: policy.maximumRecords + 1, pageNumber: 1 },
    };
    const response =
      owner === "DefaultEnterpriseService"
        ? await this.readEnterpriseEnvelope(SERVICE[owner], request)
        : await SERVICE[owner].get(request);
    if (
      !/^SUC_/.test(response?.code || "") ||
      response.error ||
      response.success === false ||
      (response.errors !== undefined &&
        (!Array.isArray(response.errors) || response.errors.length)) ||
      !Array.isArray(response.result) ||
      response.result.length > policy.maximumRecords ||
      (response.count !== undefined &&
        (!Number.isSafeInteger(response.count) ||
          response.count !== response.result.length)) ||
      response.result.some((row) => !row || typeof row !== "object")
    )
      this.fail("UNAVAILABLE");
    return response.result;
  },
  /**
   * Captures all source/destination identities so a supplied selector cannot hide save or rename targets.
   * @param {Object} request Generated command.
   * @param {string} operation Fixed hook operation.
   * @returns {Object} Bounded query; mutations with no provable selector reject.
   */
  genericAdministratorLookup: function (request, operation) {
    const selectors = [];
    if (request.query && Object.keys(request.query).length)
      selectors.push(request.query);
    const models = Array.isArray(request.model)
      ? request.model
      : [request.model || {}];
    if (models.length > 100) this.fail("UNAVAILABLE");
    for (const model of models) {
      for (const field of ["_id", "code", "loginId"]) {
        const value = model[field] ?? model.$set?.[field];
        if (value !== undefined) selectors.push({ [field]: value });
      }
    }
    if (!selectors.length) this.fail("UNAVAILABLE");
    if (operation !== "save" && !request.query) this.fail("UNAVAILABLE");
    return { $or: selectors };
  },
  /**
   * Classifies only understood update paths; pipelines/replacement operators cannot masquerade as display changes.
   * @param {Object} request Generated mutation.
   * @returns {string[]} Root paths including rename destinations.
   */
  genericAdministratorPaths: function (request) {
    const models = Array.isArray(request.model)
      ? request.model
      : [request.model || {}];
    if (models.length > 100) this.fail("UNAVAILABLE");
    const allowed = [
      "$set",
      "$unset",
      "$inc",
      "$mul",
      "$min",
      "$max",
      "$push",
      "$pop",
      "$pull",
      "$pullAll",
      "$addToSet",
      "$currentDate",
      "$bit",
      "$rename",
    ];
    const paths = [];
    for (const model of models) {
      if (!model || typeof model !== "object" || Array.isArray(model))
        this.fail("UNAVAILABLE");
      for (const [key, value] of Object.entries(model)) {
        if (!key.startsWith("$")) paths.push(key);
        else {
          if (
            !allowed.includes(key) ||
            !value ||
            typeof value !== "object" ||
            Array.isArray(value) ||
            Array.isArray(request.model)
          )
            this.fail("UNAVAILABLE");
          paths.push(...Object.keys(value));
          if (key === "$rename") paths.push(...Object.values(value));
        }
      }
    }
    if (paths.some((path) => typeof path !== "string"))
      this.fail("UNAVAILABLE");
    return paths.map((path) => path.split(".")[0]);
  },
  /**
   * Resolves configured full-role group ancestry without interpreting individual permissions as administrator identity.
   * @param {string} tenant Exact group partition.
   * @param {Object} policy Qualified explicit role/group policy.
   * @returns {Promise<Set<string>>} Bounded protected group closure, including inherited parents.
   */
  genericAdministratorGroups: async function (tenant, policy) {
    const roles =
      (CONFIG.get("enterpriseManagement") || {}).accessAssignments?.roles || {};
    const pending = [...policy.nativeSuperAdministratorGroupCodes];
    for (const code of policy.superAdministratorRoleCodes) {
      const groups = roles[code]?.groupCodes;
      if (
        !Array.isArray(groups) ||
        !groups.length ||
        groups.length > policy.maximumRecords
      )
        this.fail("UNAVAILABLE");
      pending.push(...groups);
    }
    const visited = new Set();
    while (pending.length) {
      const value = pending.shift();
      const code = typeof value === "string" ? value : value?.code;
      if (typeof code !== "string" || !/^[A-Za-z0-9_.:-]{1,128}$/.test(code))
        this.fail("UNAVAILABLE");
      if (visited.has(code)) continue;
      if (visited.size >= policy.maximumRecords) this.fail("UNAVAILABLE");
      visited.add(code);
      const rows = await this.genericAdministratorRows(
        "DefaultUserGroupService",
        tenant,
        { code },
        policy,
      );
      if (
        rows.length !== 1 ||
        rows[0].code !== code ||
        rows[0].active !== true ||
        (rows[0].parentGroups !== undefined &&
          !Array.isArray(rows[0].parentGroups))
      )
        this.fail("UNAVAILABLE");
      pending.push(...(rows[0].parentGroups || []));
      if (pending.length > policy.maximumRecords * policy.maximumRecords)
        this.fail("UNAVAILABLE");
    }
    return visited;
  },
  /**
   * Protects native registered administrators as well as membership projections without requiring a COMPLETE membership.
   * @param {Object} request Generated employee mutation.
   * @param {string} operation Fixed save/update/remove hook operation.
   * @returns {Promise<boolean>} Unrelated changes pass; authority changes require the governed team lifecycle.
   */
  protectAdministratorEmployee: async function (request, operation) {
    if (
      (CONFIG.get("enterpriseManagement") || {}).teamAdministration
        ?.genericMutationGuard?.enabled !== true
    )
      return true;
    if (
      await this.admitsAdministratorOwnerMutation(
        request,
        "DefaultEmployeeService",
        operation,
      )
    )
      return true;
    if (
      SERVICE.DefaultCanonicalHistoricalIdentityLinkService?.ownsWrite(
        request,
      ) &&
      [...historicalLinkRetirements].some(
        (context) =>
          context.identity.tenantCode === request.tenant &&
          String(request.query?._id) === context.identity.recordId,
      )
    )
      return true;
    const fields = [
      "active",
      "disabled",
      "registrationSuspended",
      "principalType",
      "loginId",
      "userGroups",
      "password",
      "authenticationIdentity",
      "registrationAssignmentCode",
      "code",
      "_id",
      "enterprise",
      "tenant",
    ];
    if (
      operation === "update" &&
      request.options?.upsert !== true &&
      request.options?.overwrite !== true &&
      request.upsert !== true &&
      !this.genericAdministratorPaths(request).some((path) =>
        fields.includes(path),
      )
    )
      return true;
    const p = this.genericAdministratorPolicy();
    if (!p) return true;
    this.genericAdministratorPaths(request);
    if (
      request.options?.upsert === true ||
      request.options?.overwrite === true ||
      request.upsert === true
    )
      this.fail("LAST_ADMIN");
    const rows = await this.genericAdministratorRows(
      "DefaultEmployeeService",
      request.tenant,
      this.genericAdministratorLookup(request, operation),
      p,
    );
    // Blocking all active human authority changes avoids a cross-record promotion/count race.
    if (
      rows.some(
        (row) =>
          (operation === "save" || row.active === true) &&
          (row.principalType === "human" || row.principalType === undefined),
      )
    )
      this.fail("LAST_ADMIN");
    if (operation !== "save")
      request.query = {
        $and: [
          request.query,
          {
            $nor: [
              { active: true, principalType: "human" },
              { active: true, principalType: { $exists: false } },
            ],
          },
        ],
      };
    return true;
  },
  /**
   * Rejects authority mutations of configured superadmin groups/parents, preserving unrelated group metadata and definitions.
   * @param {Object} request Generated group mutation.
   * @param {string} operation Fixed hook operation.
   * @returns {Promise<boolean>} No governed group authority can be lost through generic CRUD.
   */
  protectAdministratorGroup: async function (request, operation) {
    if (
      (CONFIG.get("enterpriseManagement") || {}).teamAdministration
        ?.genericMutationGuard?.enabled !== true
    )
      return true;
    const fields = ["active", "permissions", "parentGroups", "code", "_id"];
    if (
      operation === "update" &&
      request.options?.upsert !== true &&
      request.options?.overwrite !== true &&
      request.upsert !== true &&
      !this.genericAdministratorPaths(request).some((path) =>
        fields.includes(path),
      )
    )
      return true;
    const p = this.genericAdministratorPolicy();
    if (!p) return true;
    if (
      request.options?.upsert === true ||
      request.options?.overwrite === true ||
      request.upsert === true
    )
      this.fail("LAST_ADMIN");
    const protectedGroups = await this.genericAdministratorGroups(
      request.tenant,
      p,
    );
    const rows = await this.genericAdministratorRows(
      "DefaultUserGroupService",
      request.tenant,
      this.genericAdministratorLookup(request, operation),
      p,
    );
    if (rows.some((row) => protectedGroups.has(row.code)))
      this.fail("LAST_ADMIN");
    // Group ancestry is cross-record authority; generic rewiring cannot be admitted by a stale pre-read.
    if (this.genericAdministratorPaths(request).includes("parentGroups"))
      this.fail("LAST_ADMIN");
    if (operation !== "save")
      request.query = {
        $and: [request.query, { code: { $nin: [...protectedGroups] } }],
      };
    return true;
  },
  /**
   * Keeps human/group scope restriction in the serialized owner, including newly inserted DENY records.
   * @param {Object} request Generated scope mutation.
   * @param {string} operation Fixed hook operation.
   * @returns {Promise<boolean>} Unrelated service/customer scopes and descriptive updates pass.
   */
  protectAdministratorScope: async function (request, operation) {
    if (
      (CONFIG.get("enterpriseManagement") || {}).teamAdministration
        ?.genericMutationGuard?.enabled !== true
    )
      return true;
    if (
      await this.admitsAdministratorOwnerMutation(
        request,
        "DefaultPrincipalScopeAssignmentService",
        operation,
      )
    )
      return true;
    const fields = [
      "active",
      "principalType",
      "principalCode",
      "groupCode",
      "permissionCode",
      "capabilityCode",
      "scopeType",
      "scopeCode",
      "tenantCode",
      "enterpriseCode",
      "effect",
      "inheritanceMode",
      "status",
      "effectiveFrom",
      "effectiveTo",
      "code",
      "_id",
    ];
    if (
      operation === "update" &&
      request.options?.upsert !== true &&
      request.options?.overwrite !== true &&
      request.upsert !== true &&
      !this.genericAdministratorPaths(request).some((path) =>
        fields.includes(path),
      )
    )
      return true;
    const p = this.genericAdministratorPolicy();
    if (!p) return true;
    if (
      request.options?.upsert === true ||
      request.options?.overwrite === true ||
      request.upsert === true
    )
      this.fail("LAST_ADMIN");
    const rows = await this.genericAdministratorRows(
      "DefaultPrincipalScopeAssignmentService",
      request.tenant,
      this.genericAdministratorLookup(request, operation),
      p,
    );
    const models = Array.isArray(request.model)
      ? request.model
      : [request.model || {}];
    const governed = (row) =>
      !["service", "customer"].includes(row.principalType) || !!row.groupCode;
    const paths = this.genericAdministratorPaths(request);
    if (
      rows.some(governed) ||
      (operation === "save" && models.some((model) => governed(model))) ||
      (operation === "update" &&
        paths.some((path) => ["principalType", "groupCode"].includes(path)))
    )
      this.fail("LAST_ADMIN");
    if (operation !== "save")
      request.query = {
        $and: [
          request.query,
          {
            principalType: { $in: ["service", "customer"] },
            groupCode: { $exists: false },
          },
        ],
      };
    return true;
  },
  /** Guards generated Employee save. @param {Object} request Generated command. @returns {Promise<boolean>} Governed admission. */
  protectAdministratorEmployeeSave: function (request) {
    return this.protectAdministratorEmployee(request, "save");
  },
  /** Guards generated Employee update. @param {Object} request Generated command. @returns {Promise<boolean>} Governed admission. */
  protectAdministratorEmployeeUpdate: function (request) {
    return this.protectAdministratorEmployee(request, "update");
  },
  /** Guards generated Employee remove. @param {Object} request Generated command. @returns {Promise<boolean>} Governed admission. */
  protectAdministratorEmployeeRemove: function (request) {
    return this.protectAdministratorEmployee(request, "remove");
  },
  /** Guards generated UserGroup save. @param {Object} request Generated command. @returns {Promise<boolean>} Governed admission. */
  protectAdministratorGroupSave: function (request) {
    return this.protectAdministratorGroup(request, "save");
  },
  /** Guards generated UserGroup update. @param {Object} request Generated command. @returns {Promise<boolean>} Governed admission. */
  protectAdministratorGroupUpdate: function (request) {
    return this.protectAdministratorGroup(request, "update");
  },
  /** Guards generated UserGroup remove. @param {Object} request Generated command. @returns {Promise<boolean>} Governed admission. */
  protectAdministratorGroupRemove: function (request) {
    return this.protectAdministratorGroup(request, "remove");
  },
  /** Guards generated scope save. @param {Object} request Generated command. @returns {Promise<boolean>} Governed admission. */
  protectAdministratorScopeSave: function (request) {
    return this.protectAdministratorScope(request, "save");
  },
  /** Guards generated scope update. @param {Object} request Generated command. @returns {Promise<boolean>} Governed admission. */
  protectAdministratorScopeUpdate: function (request) {
    return this.protectAdministratorScope(request, "update");
  },
  /** Guards generated scope remove. @param {Object} request Generated command. @returns {Promise<boolean>} Governed admission. */
  protectAdministratorScopeRemove: function (request) {
    return this.protectAdministratorScope(request, "remove");
  },
  /**
   * Checks fresh native ownership and rejects every full/default administrator rather than counting an unlocked snapshot.
   * @param {Object} request Existing identity owner operator command.
   * @param {Object} historical Proved Employee anchor with its immutable identity.
   * @returns {Promise<Object>} Single owning enterprise and fresh non-administrator principal.
   */
  assertHistoricalLinkRetirement: async function (request, historical) {
    this.policy();
    if (
      (CONFIG.get("enterpriseManagement") || {}).teamAdministration
        ?.historicalLinkRetirementQualified !== true
    )
      this.fail("UNAVAILABLE");
    const p = this.genericAdministratorPolicy();
    if (!p) this.fail("UNAVAILABLE");
    const m = this.memberships(),
      identity = m.identity(historical?.identity);
    if (identity.recordKind !== "EMPLOYEE") this.fail("CONFLICT");
    const linking = SERVICE.DefaultCanonicalHistoricalIdentityLinkService;
    if (typeof linking?.operator !== "function") this.fail("UNAVAILABLE");
    await linking.operator(request);
    const people = await this.genericAdministratorRows(
      "DefaultEmployeeService",
      identity.tenantCode,
      { _id: identity.recordId },
      p,
    );
    const person = people[0];
    if (
      people.length !== 1 ||
      String(person._id) !== identity.recordId ||
      person.principalType !== "human" ||
      typeof person.loginId !== "string" ||
      !Array.isArray(person.userGroups)
    )
      this.fail("CONFLICT");
    const enterprises = await this.genericAdministratorRows(
      "DefaultEnterpriseService",
      m.authority(),
      { tenant: identity.tenantCode, active: true },
      p,
    );
    // Multi-enterprise native ownership needs a reviewed multi-fence contract, not a guessed enterprise.
    if (
      enterprises.length !== 1 ||
      typeof enterprises[0].code !== "string" ||
      (typeof enterprises[0].tenant === "string"
        ? enterprises[0].tenant
        : enterprises[0].tenant?.code) !== identity.tenantCode
    )
      this.fail("UNAVAILABLE");
    const enterprise = enterprises[0];
    if (
      enterprise.adminEmail?.trim().toLowerCase() ===
      person.loginId.trim().toLowerCase()
    )
      this.fail("LAST_ADMIN");
    const assignments = await this.genericAdministratorRows(
      "DefaultEnterpriseAccessAssignmentService",
      m.authority(),
      {
        tenantCode: identity.tenantCode,
        enterpriseCode: enterprise.code,
        active: true,
        status: "REGISTERED",
      },
      p,
    );
    if (
      assignments.some(
        (item) =>
          (item.registeredLoginId === person.loginId ||
            item.registration?.employeeCode === person.code ||
            item.code === person.registrationAssignmentCode ||
            String(item.membership?.projectionId || "") ===
              identity.recordId) &&
          (item.code === enterprise.defaultAdminAssignmentCode ||
            p.superAdministratorRoleCodes.includes(item.roleCode)),
      )
    )
      this.fail("LAST_ADMIN");
    const pending = [...person.userGroups],
      visited = new Set();
    while (pending.length) {
      const ref = pending.shift(),
        code = typeof ref === "string" ? ref : ref?.code;
      if (typeof code !== "string" || !/^[A-Za-z0-9_.:-]{1,128}$/.test(code))
        this.fail("UNAVAILABLE");
      if (p.nativeSuperAdministratorGroupCodes.includes(code))
        this.fail("LAST_ADMIN");
      if (visited.has(code)) continue;
      if (visited.size >= p.maximumRecords) this.fail("UNAVAILABLE");
      visited.add(code);
      const groups = await this.genericAdministratorRows(
        "DefaultUserGroupService",
        identity.tenantCode,
        { code },
        p,
      );
      if (
        groups.length !== 1 ||
        groups[0].code !== code ||
        groups[0].active !== true ||
        (groups[0].parentGroups !== undefined &&
          !Array.isArray(groups[0].parentGroups))
      )
        this.fail("UNAVAILABLE");
      pending.push(...(groups[0].parentGroups || []));
      if (pending.length > p.maximumRecords * p.maximumRecords)
        this.fail("UNAVAILABLE");
    }
    return { identity, person, enterprise };
  },
  /**
   * Holds the existing team operation across privately admitted identity retirement and exact same-operation recovery.
   * @param {Object} request Existing reviewed identity commit/recovery request.
   * @param {Object} historicalIdentity Immutable Employee locator from the stored reviewed plan.
   * @param {Function} operation Identity-owner callback with its own private reviewed admission.
   * @returns {Promise<Object>} Confirmed identity outcome; uncertain failures retain the held fence.
   */
  withHistoricalLinkRetirement: async function (
    request,
    historicalIdentity,
    operation,
  ) {
    if (typeof operation !== "function") this.fail("CONFLICT");
    const m = this.memberships(),
      identity = m.identity(historicalIdentity);
    const linking = SERVICE.DefaultCanonicalHistoricalIdentityLinkService;
    const input = request.body || request.httpRequest?.body || {};
    if (
      !/^canonical-link-[a-f0-9]{40}$/.test(input.auditCode || "") ||
      typeof input.fingerprint !== "string" ||
      !/^[a-f0-9]{64}$/.test(input.fingerprint) ||
      typeof linking?.audit !== "function"
    )
      this.fail("CONFLICT");
    const audit = await linking.audit(input.auditCode);
    if (
      !audit ||
      audit.preview?.fingerprint !== input.fingerprint ||
      m.digest(
        audit.snapshot?.canonicalHistoricalLink?.historical?.identity,
      ) !== m.digest(identity) ||
      ![
        "LINK_APPLYING",
        "LINK_DISABLED",
        "LINK_CREDENTIAL_RETIRED",
        "LINK_COMPLETE",
      ].includes(audit.status)
    )
      this.fail("CONFLICT");
    const initial = await this.assertHistoricalLinkRetirement(request, {
      identity,
    });
    const command = {
      operationId:
        "historicalLink_" +
        m.digest([input.auditCode, input.fingerprint, identity]),
      auditCode: input.auditCode,
      fingerprint: input.fingerprint,
      identity,
    };
    const lease = await this.begin(
      request,
      "HISTORICAL_LINK_RETIREMENT",
      command,
      initial.enterprise.code,
    );
    if (lease.teamOperation.phase === "COMPLETE") {
      if (audit.status !== "LINK_COMPLETE") this.fail("CONFLICT");
      return this.outcome(lease.teamOperation.outcome);
    }
    const fresh = await this.assertHistoricalLinkRetirement(request, {
      identity,
    });
    if (
      fresh.enterprise.code !== lease.code ||
      fresh.enterprise.teamRevision !== lease.teamRevision ||
      fresh.enterprise.teamOperation?.id !== command.operationId ||
      fresh.enterprise.teamOperation?.phase !== "PENDING"
    )
      this.fail("CONFLICT");
    const context = { identity };
    historicalLinkRetirements.add(context);
    let result;
    try {
      result = await operation();
    } finally {
      historicalLinkRetirements.delete(context);
    }
    const completed = await linking.audit(input.auditCode);
    const current = await this.readEnterprise(m.authority(), {
      code: lease.code,
    });
    const retired = await m.read(
      "DefaultEmployeeService",
      identity.tenantCode,
      { _id: identity.recordId },
    );
    if (
      completed?.status !== "LINK_COMPLETE" ||
      completed.preview?.fingerprint !== input.fingerprint ||
      result?.phase !== "LINK_COMPLETE" ||
      result.auditCode !== input.auditCode ||
      result.fingerprint !== input.fingerprint ||
      retired?.active !== false ||
      retired.disabled !== true ||
      retired.password ||
      retired.identityLinkRetirement?.auditCode !== input.auditCode ||
      retired.identityLinkRetirement?.fingerprint !== input.fingerprint ||
      current?.teamRevision !== lease.teamRevision ||
      current.teamOperation?.id !== command.operationId ||
      current.teamOperation?.phase !== "PENDING"
    )
      this.fail("CONFLICT");
    return this.finish(lease, result);
  },
  /** Builds the current enterprise's authorized team task without exposing canonical locators or operation hashes. @param {Object} request Fresh human access request. @returns {Promise<Object>} Bounded inert presentation, rows and recovery state. */
  workspace: async function (request) {
    this.policy();
    const m = this.memberships();
    m.base().input(request.query || {}, []);
    const code = request.authData?.entCode;
    await m.administrator(request, code);
    const target = await this.enterpriseForAccess(code);
    const enterprise = target.enterprise;
    const administrators = await this.administrators(code);
    const adminCodes = new Set(administrators.map((item) => item.code));
    const rows = await m.inventory(
      "DefaultEnterpriseAccessAssignmentService",
      m.authority(),
      { enterpriseCode: code, active: true },
    );
    if (rows.length > 100) this.fail("UNAVAILABLE");
    const items = [];
    for (const row of rows) {
      if (
        !["PENDING", "ACTIVE", "REGISTERED", "SUSPENDED"].includes(row.status)
      )
        continue;
      const { item, enterprise: current } = await this.assignment(
        row.code,
        true,
      );
      if (current.code !== code || item.tenantCode !== target.tenantCode)
        this.fail("CONFLICT");
      const accepted = item.membership?.phase === "COMPLETE";
      const designated = enterprise.defaultAdminAssignmentCode === item.code;
      const restricted =
        designated || (adminCodes.has(item.code) && adminCodes.size < 2);
      const actions = !accepted
        ? (CONFIG.get("enterpriseManagement") || {}).teamAdministration
            ?.invitationWithdrawalQualified === true &&
          ["PENDING", "ACTIVE"].includes(item.status) &&
          !item.registration &&
          !item.membership &&
          !item.identityClaimed
          ? ["WITHDRAW"]
          : []
        : item.status === "SUSPENDED"
          ? ["RESUME"]
          : item.status === "REGISTERED"
            ? [
                ...(!restricted ? ["SUSPEND", "REVOKE"] : []),
                ...(adminCodes.has(item.code) && !designated
                  ? ["HANDOVER"]
                  : []),
              ]
            : [];
      items.push({
        ...m.project(item, current),
        email: item.normalizedEmail,
        designated,
        actions,
      });
    }
    return {
      contractVersion: 1,
      owner: "profile",
      renderer: "axis.enterprise-team",
      enterpriseCode: code,
      enterpriseName:
        typeof enterprise.name === "string"
          ? enterprise.name
          : enterprise.name?.en || code,
      presentation: CONFIG.get("enterpriseManagement").teamAdministration
        .presentation,
      items,
      operation: enterprise.teamOperation
        ? {
            id: enterprise.teamOperation.id,
            phase: enterprise.teamOperation.phase,
          }
        : null,
    };
  },
  /** Returns the effective existing membership owner. @returns {Object} Profile owner. */
  memberships: function () {
    return SERVICE.DefaultEnterpriseMembershipService;
  },
  /** Raises a stable redacted lifecycle rejection. @param {string} suffix Error suffix. @returns {never} Throws. */
  fail: function (suffix) {
    throw new CLASSES.NodicsError("ERR_PROFILE_TEAM_" + suffix);
  },
  /** Requires explicit serialization qualification. @returns {void} Qualified policy. */
  policy: function () {
    this.memberships().policy();
    const p = (CONFIG.get("enterpriseManagement") || {}).teamAdministration;
    if (!p || p.enabled !== true || p.serializedWritesQualified !== true)
      this.fail("UNAVAILABLE");
  },
  /** Recognizes private in-process enterprise writes. @param {Object} request Generated command. @returns {boolean} Owner provenance. */
  ownsEnterpriseWrite: function (request) {
    return enterpriseWrites.has(request);
  },
  /** Blocks generic designation and serialization mutations. @param {Object} request Generated mutation. @returns {boolean} Owner or unrelated mutation. */
  protectEnterprise: function (request) {
    if (this.ownsEnterpriseWrite(request)) return true;
    const m = this.memberships(),
      models = Array.isArray(request.model)
        ? request.model
        : [request.model || {}];
    if (
      models.some((model) =>
        m
          .paths(model)
          .some((path) =>
            [
              "teamOperation",
              "teamRevision",
              "defaultAdminAssignmentCode",
              "adminEmail",
            ].some((key) => path === key || path.startsWith(key + ".")),
          ),
      )
    )
      m.fail("FORBIDDEN");
    return true;
  },
  /** Permits initial enterprise nomination, but never upsert replacement of managed team authority. @param {Object} request Generated save/remove. @returns {Promise<boolean>} Safe unbound record or private command. */
  protectEnterpriseSave: async function (request) {
    if (this.ownsEnterpriseWrite(request)) return true;
    const m = this.memberships(),
      models = Array.isArray(request.model)
        ? request.model
        : [request.model || {}];
    for (const model of models) {
      if (
        m
          .paths(model)
          .some((path) =>
            ["teamOperation", "teamRevision"].some(
              (key) => path === key || path.startsWith(key + "."),
            ),
          )
      )
        m.fail("FORBIDDEN");
      if (!model.code) m.fail("FORBIDDEN");
      const current = await this.readEnterprise(request.tenant, {
        code: model.code,
      });
      if (
        current &&
        (current.defaultAdminAssignmentCode || current.teamOperation)
      )
        m.fail("FORBIDDEN");
    }
    return true;
  },
  /** Rejects generic removal of enterprises with governed administrator authority. @param {Object} request Generated removal. @returns {Promise<boolean>} Unmanaged removal only. */
  protectEnterpriseRemove: async function (request) {
    const m = this.memberships(),
      rows = m.mutationRows(
        await this.readEnterpriseEnvelope(SERVICE.DefaultEnterpriseService, {
          tenant: request.tenant,
          authData:
            SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
          query: request.query || {},
          options: { recursive: false, skipItemCache: true },
          searchOptions: { pageSize: 101, pageNumber: 1 },
        }),
      );
    if (
      rows.length > 100 ||
      rows.some((row) => row.defaultAdminAssignmentCode || row.teamOperation)
    )
      m.fail("FORBIDDEN");
    return true;
  },
  /** Replays safe outcomes without converting a recorded refusal into success. @param {Object} outcome Stored result. @returns {Object} Success or original refusal. */
  outcome: function (outcome) {
    if (outcome?.errorCode) throw new CLASSES.NodicsError(outcome.errorCode);
    return outcome;
  },
  /** Applies an exact enterprise compare-and-set with durable own-write recovery. @param {Object} enterprise Current authority record. @param {Object} query Exact lease predicate. @param {Object} patch Owner patch. @returns {Promise<Object>} Saved authority. */
  persist: async function (enterprise, query, patch) {
    const m = this.memberships();
    const command = {
      tenant: m.authority(),
      authData: SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
      query: { code: enterprise.code, active: true, ...query },
      model: patch,
      options: { recursive: false },
    };
    enterpriseWrites.add(command);
    let failure;
    try {
      m.base().assertWrite(
        await SERVICE.DefaultEnterpriseService.update(command),
      );
    } catch (error) {
      failure = error;
    } finally {
      enterpriseWrites.delete(command);
    }
    const saved = await this.readEnterprise(m.authority(), {
      code: enterprise.code,
    });
    if (
      !saved ||
      Object.keys(patch).some(
        (key) =>
          saved[key] === undefined ||
          m.digest(saved[key]) !== m.digest(patch[key]),
      )
    ) {
      if (failure) throw failure;
      this.fail("CONFLICT");
    }
    return saved;
  },
  /** Acquires or resumes one immutable operation; there is deliberately no timeout-based unlock. @param {Object} request Human command. @param {string} operation Fixed command. @param {Object} input Exact DTO. @param {string} code Enterprise. @returns {Promise<Object>} Current leased enterprise. */
  begin: async function (request, operation, input, code) {
    const m = this.memberships();
    let actor;
    if (operation === "SETUP_CONTINUATION") {
      const setup = SERVICE.DefaultEnterpriseSetupContinuationService;
      if (typeof setup?.authorizeSerializedSetup !== "function")
        this.fail("UNAVAILABLE");
      actor = await setup.authorizeSerializedSetup(request, input, code);
    } else {
      this.policy();
      actor = await m.administrator(request, code);
    }
    if (
      typeof input.operationId !== "string" ||
      !/^[A-Za-z0-9_-]{16,128}$/.test(input.operationId)
    )
      this.fail("CONFLICT");
    const hash = m.digest({
      operation,
      input,
      identity: actor.identity,
      enterpriseCode: code,
    });
    const enterprise = await this.readEnterprise(m.authority(), {
      code,
    });
    if (!enterprise || enterprise.active !== true) this.fail("CONFLICT");
    const previous = enterprise.teamOperation;
    if (previous?.id === input.operationId) {
      if (previous.hash !== hash) this.fail("CONFLICT");
      return enterprise;
    }
    if (previous && previous.phase !== "COMPLETE") this.fail("CONFLICT");
    const version =
      enterprise.teamRevision === undefined ? 0 : enterprise.teamRevision;
    if (!Number.isSafeInteger(version) || version < 0 || version >= 2147483647)
      this.fail("CONFLICT");
    const query = {
      ...(previous
        ? {
            "teamOperation.id": previous.id,
            "teamOperation.phase": "COMPLETE",
          }
        : { teamOperation: { $exists: false } }),
      ...(enterprise.teamRevision === undefined
        ? { teamRevision: { $exists: false } }
        : { teamRevision: version }),
    };
    return this.persist(enterprise, query, {
      teamRevision: version + 1,
      teamOperation: {
        id: input.operationId,
        hash,
        operation,
        input: { ...input },
        phase: "PENDING",
        actor: actor.identity,
      },
    });
  },
  /**
   * Checks the exact owner-retained command and original actor binding, never replacement operator input.
   * @param {Object} enterprise Fresh Enterprise carrying the reviewed operation.
   * @returns {boolean} Whether the stored command is a bounded supported recovery proof.
   */
  reviewedRecoveryOperation: function (enterprise) {
    const operation = enterprise.teamOperation;
    const input = operation?.input;
    const handover = operation?.operation === "HANDOVER";
    return Boolean(
      ["SUSPEND", "REVOKE", "RESUME", "WITHDRAW", "HANDOVER"].includes(
        operation?.operation,
      ) &&
      input &&
      typeof input === "object" &&
      !Array.isArray(input) &&
      Object.keys(input).sort().join(",") ===
        (handover
          ? "assignmentCode,enterpriseCode,operationId,revision"
          : "assignmentCode,operationId,revision") &&
      typeof input.assignmentCode === "string" &&
      input.assignmentCode.trim() &&
      input.assignmentCode.length <= 128 &&
      typeof input.operationId === "string" &&
      /^[A-Za-z0-9_-]{16,128}$/.test(input.operationId) &&
      input.operationId === operation.id &&
      Number.isSafeInteger(input.revision) &&
      input.revision > 0 &&
      input.revision < Number.MAX_SAFE_INTEGER &&
      (!handover || input.enterpriseCode === enterprise.code) &&
      operation.actor &&
      operation.hash ===
        this.memberships().digest({
          operation: operation.operation,
          input,
          identity: operation.actor,
          enterpriseCode: enterprise.code,
        }),
    );
  },
  /**
   * Recognizes committed assignment evidence only; pending handover has no independently committed write.
   * @param {Object} enterprise Current target Enterprise.
   * @param {Object} item Fresh assignment read through the existing owner.
   * @param {Object} operation Validated original pending operation.
   * @returns {boolean} Exact terminal evidence, without changing or adopting any identity/grant.
   */
  committedRecoveryMatches: function (enterprise, item, operation) {
    if (
      item.code !== operation.input.assignmentCode ||
      item.enterpriseCode !== enterprise.code ||
      item.revision !== operation.input.revision + 1
    )
      return false;
    if (operation.operation === "WITHDRAW") {
      return Boolean(
        item.status === "REVOKED" &&
        item.active === false &&
        !item.membership &&
        !item.registration &&
        !item.identityClaimed &&
        enterprise.defaultAdminAssignmentCode !== item.code &&
        item.invitationWithdrawal?.operationId === operation.id &&
        typeof item.invitationWithdrawal.withdrawnAt === "string" &&
        Number.isFinite(Date.parse(item.invitationWithdrawal.withdrawnAt)),
      );
    }
    return (
      ["SUSPEND", "REVOKE", "RESUME"].includes(operation.operation) &&
      item.membership?.phase === "COMPLETE" &&
      item.membership.lastTeamOperation === operation.id &&
      item.status ===
        (operation.operation === "RESUME"
          ? "REGISTERED"
          : operation.operation === "SUSPEND"
            ? "SUSPENDED"
            : "REVOKED") &&
      item.active === (operation.operation !== "REVOKE")
    );
  },
  /**
   * Repairs the existing stamp only for an exact committed command, then rechecks authority and evidence.
   * @param {Object} request Fresh authenticated original administrator or admitted recovery operator.
   * @param {Object} enterprise Held Enterprise operation; its input and actor remain unchanged.
   * @param {Object} item Exact assignment observed before repair.
   * @returns {Promise<Object>} Fresh assignment and enterprise for final fenced acknowledgement.
   * @override Later layers may tighten these checks without replaying mutations or bypassing fresh authorization.
   */
  repairCommittedAssignment: async function (request, enterprise, item) {
    const m = this.memberships();
    const operation = enterprise.teamOperation;
    if (
      operation?.phase !== "PENDING" ||
      !this.reviewedRecoveryOperation(enterprise) ||
      !this.committedRecoveryMatches(enterprise, item, operation)
    )
      this.fail("CONFLICT");
    const digest = m.digest(item);
    await m.registerMembership(item);
    await m.administrator(request, enterprise.code);
    const verified = await this.assignment(
      operation.input.assignmentCode,
      true,
    );
    if (
      verified.enterprise.code !== enterprise.code ||
      !this.committedRecoveryMatches(
        verified.enterprise,
        verified.item,
        operation,
      ) ||
      m.digest(verified.item) !== digest
    )
      this.fail("CONFLICT");
    return verified;
  },
  /** Reconciles an evidenced committed membership/withdrawal after actor loss, or returns a completed historical outcome; never replays a write or clears an ambiguous lease. @param {Object} request Fresh platform PASSWORD operator and reviewed enterprise operation revision. @returns {Promise<Object>} Recorded safe outcome. */
  reconcileCommittedOperation: async function (request) {
    this.policy();
    if (
      CONFIG.get(
        "enterpriseManagement.teamAdministration.operatorRecoveryQualified",
      ) !== true
    )
      this.fail("UNAVAILABLE");
    const m = this.memberships();
    const input = m
      .base()
      .input(request.body || {}, [
        "enterpriseCode",
        "teamRevision",
        "operationId",
      ]);
    m.base().input(request.query || {}, []);
    if (
      typeof input.enterpriseCode !== "string" ||
      !input.enterpriseCode.trim() ||
      input.enterpriseCode.length > 128 ||
      typeof input.operationId !== "string" ||
      !/^[A-Za-z0-9_-]{16,128}$/.test(input.operationId) ||
      !Number.isSafeInteger(input.teamRevision) ||
      input.teamRevision < 1
    )
      this.fail("CONFLICT");
    const actor = await m.administrator(request, input.enterpriseCode);
    if (
      request.authData.authenticationMethod !== "PASSWORD" ||
      !SERVICE.DefaultEnterpriseManagementService.isPlatformAdministrator(
        request.authData,
      )
    )
      this.fail("FORBIDDEN");
    const enterprise = await this.readEnterprise(m.authority(), {
      code: input.enterpriseCode,
    });
    const operation = enterprise?.teamOperation;
    if (
      !enterprise ||
      enterprise.active !== true ||
      enterprise.teamRevision !== input.teamRevision ||
      !operation ||
      operation.id !== input.operationId
    )
      this.fail("CONFLICT");
    if (
      operation.operation === "WITHDRAW" &&
      (CONFIG.get("enterpriseManagement") || {}).teamAdministration
        ?.invitationWithdrawalQualified !== true
    )
      this.fail("UNAVAILABLE");
    if (!this.reviewedRecoveryOperation(enterprise)) this.fail("CONFLICT");
    // Handover has a different outcome DTO and commits designation plus COMPLETE atomically.
    if (operation.operation === "HANDOVER") this.fail("CONFLICT");
    if (operation.phase === "COMPLETE") return this.outcome(operation.outcome);
    if (operation.phase !== "PENDING") this.fail("CONFLICT");
    const reviewed = operation.input;
    const { item, enterprise: current } = await this.assignment(
      reviewed.assignmentCode,
      true,
    );
    if (
      current.code !== enterprise.code ||
      !this.committedRecoveryMatches(current, item, operation)
    )
      this.fail("CONFLICT");
    const verified = await this.repairCommittedAssignment(
      request,
      enterprise,
      item,
    );
    return this.finish(
      {
        ...enterprise,
        teamOperation: {
          ...operation,
          recovery: {
            actor: actor.identity,
            reconciledRevision: item.revision,
            mode: "COMMITTED_EVIDENCE",
          },
        },
      },
      m.project(verified.item, verified.enterprise),
    );
  },
  /** Inspects one explicit enterprise operation for qualified platform recovery without disclosing identity/hash/input. @param {Object} request Fresh platform operator and exact enterprise code. @returns {Promise<Object>} Inert current evidence/recovery eligibility. */
  recoveryWorkspace: async function (request) {
    this.policy();
    if (
      CONFIG.get(
        "enterpriseManagement.teamAdministration.operatorRecoveryQualified",
      ) !== true
    )
      this.fail("UNAVAILABLE");
    const m = this.memberships(),
      input = m.base().input(request.body || {}, ["enterpriseCode"]);
    m.base().input(request.query || {}, []);
    if (
      typeof input.enterpriseCode !== "string" ||
      !/^[A-Za-z0-9_.:-]{1,128}$/.test(input.enterpriseCode)
    )
      this.fail("CONFLICT");
    await m.administrator(request, input.enterpriseCode);
    if (
      request.authData.authenticationMethod !== "PASSWORD" ||
      !SERVICE.DefaultEnterpriseManagementService.isPlatformAdministrator(
        request.authData,
      )
    )
      this.fail("FORBIDDEN");
    const enterprise = await this.readEnterprise(m.authority(), {
      code: input.enterpriseCode,
    });
    if (!enterprise || enterprise.active !== true) this.fail("CONFLICT");
    const op = enterprise.teamOperation;
    let recoverable = false;
    if (
      op?.phase === "PENDING" &&
      op.operation !== "HANDOVER" &&
      this.reviewedRecoveryOperation(enterprise) &&
      (op.operation !== "WITHDRAW" ||
        (CONFIG.get("enterpriseManagement") || {}).teamAdministration
          ?.invitationWithdrawalQualified === true)
    ) {
      const { item, enterprise: current } = await this.assignment(
        op.input.assignmentCode,
        true,
      );
      recoverable =
        current.code === enterprise.code &&
        this.committedRecoveryMatches(current, item, op);
    }
    return {
      contractVersion: 1,
      owner: "profile",
      enterpriseCode: enterprise.code,
      operation: op
        ? {
            id: op.id,
            phase: op.phase,
            teamRevision: enterprise.teamRevision,
            recoverable,
          }
        : null,
      presentation: CONFIG.get("enterpriseManagement").teamAdministration
        .recoveryPresentation,
    };
  },
  /** Completes only the held operation after all mutation acknowledgements. @param {Object} enterprise Leased authority. @param {Object} outcome Safe response. @param {Object} [patch] Optional designation patch. @returns {Promise<Object>} Recorded outcome. */
  finish: async function (enterprise, outcome, patch = {}) {
    await this.persist(
      enterprise,
      {
        teamRevision: enterprise.teamRevision,
        "teamOperation.id": enterprise.teamOperation.id,
        "teamOperation.phase": "PENDING",
      },
      {
        ...patch,
        teamOperation: {
          ...enterprise.teamOperation,
          phase: "COMPLETE",
          outcome,
        },
      },
    );
    return outcome;
  },
  /**
   * Reads native registration authority only after the membership owner explicitly reports no managed context.
   * @param {Object} item Fresh completed native registration assignment.
   * @param {Object} person Fresh native Employee already checked by the canonical identity owner.
   * @param {Object} enterprise Current target enterprise with its resolved tenant.
   * @returns {Promise<Object>} Fresh group projection; never adopts membership or issues a session.
   */
  nativeAdministratorPerson: async function (item, person, enterprise) {
    const registration = SERVICE.DefaultEnterpriseRegistrationService;
    const scopes = SERVICE.DefaultPrincipalScopeGovernanceService;
    if (
      item.membership ||
      person.authenticationIdentity ||
      person.registrationAssignmentCode !== item.code ||
      item.registration?.phase !== "COMPLETE" ||
      typeof registration?.assertSessionEligible !== "function" ||
      typeof scopes?.getEffectiveScopes !== "function"
    )
      this.fail("UNAVAILABLE");
    await registration.assertSessionEligible({ person, enterprise });
    const groups = await this.memberships().groups(
      item.tenantCode,
      (person.userGroups || []).map((group) =>
        typeof group === "string" ? group : group?.code,
      ),
    );
    const effectivePerson = {
      ...person,
      userGroups: groups,
      userGroupCodes: undefined,
      userGroupPermissions: undefined,
    };
    const effective = await scopes.getEffectiveScopes({
      tenant: item.tenantCode,
      authData: {
        principalType: "human",
        loginId: person.loginId,
        userGroups:
          SERVICE.DefaultAuthenticationProviderService.resolveSessionUserGroups(
            effectivePerson,
          ),
      },
    });
    if (
      !Array.isArray(effective?.scopes) ||
      !Array.isArray(effective?.deniedScopes) ||
      !effective.scopes.some(
        (scope) =>
          scope.scopeType === "ENTERPRISE" &&
          scope.scopeCode === enterprise.code,
      ) ||
      effective.deniedScopes.some(
        (scope) =>
          scope.scopeType === "GLOBAL" ||
          (scope.scopeType === "TENANT" &&
            scope.scopeCode === item.tenantCode) ||
          (scope.scopeType === "ENTERPRISE" &&
            scope.scopeCode === enterprise.code),
      )
    )
      this.fail("UNAVAILABLE");
    return effectivePerson;
  },
  /** Reads complete active administrators and their fresh target permissions, including explicitly proven native registrations. @param {string} code Enterprise. @returns {Promise<Object[]>} Current qualified administrators. */
  administrators: async function (code) {
    const m = this.memberships(),
      result = [];
    const management = CONFIG.get("enterpriseManagement") || {};
    const roles = management.teamAdministration?.genericMutationGuard
      ?.superAdministratorRoleCodes || ["ENTERPRISE_ADMIN"];
    if (!Array.isArray(roles) || !roles.length || roles.length > 20)
      this.fail("UNAVAILABLE");
    const rows = await m.inventory(
      "DefaultEnterpriseAccessAssignmentService",
      m.authority(),
      { enterpriseCode: code, active: true, status: "REGISTERED" },
    );
    for (const row of rows) {
      if (!roles.includes(row.roleCode)) continue;
      const { item, enterprise } = await this.assignment(row.code);
      if (item.enterpriseCode !== code || !roles.includes(item.roleCode))
        this.fail("CONFLICT");
      const query =
        item.membership?.phase === "COMPLETE"
          ? { _id: item.membership.projectionId }
          : item.registration?.phase === "COMPLETE" &&
              item.registration.employeeCode &&
              item.registeredLoginId
            ? {
                code: item.registration.employeeCode,
                loginId: item.registeredLoginId,
              }
            : null;
      if (!query) this.fail("UNAVAILABLE");
      const person = await m.read(
        "DefaultEmployeeService",
        item.tenantCode,
        query,
      );
      if (
        !person ||
        person.active !== true ||
        person.principalType !== "human" ||
        person.disabled === true ||
        person.registrationSuspended === true
      )
        this.fail("UNAVAILABLE");
      const requiredGroups =
        management.accessAssignments?.roles?.[item.roleCode]?.groupCodes;
      const actualGroups = (person.userGroups || []).map((group) =>
        typeof group === "string" ? group : group?.code,
      );
      if (
        !Array.isArray(requiredGroups) ||
        !requiredGroups.length ||
        !requiredGroups.every((group) => actualGroups.includes(group))
      )
        this.fail("UNAVAILABLE");
      const context = await m.sessionContext(
        person,
        { ...enterprise, tenant: { code: item.tenantCode } },
        "Employee",
      );
      const effectivePerson =
        context === null
          ? await this.nativeAdministratorPerson(item, person, {
              ...enterprise,
              tenant: { code: item.tenantCode },
            })
          : context?.person;
      if (!effectivePerson) this.fail("UNAVAILABLE");
      const authData = {
        principalType: "human",
        userGroups:
          SERVICE.DefaultAuthenticationProviderService.resolveSessionUserGroups(
            effectivePerson,
          ),
        permissions: UTILS.getUserGroupPermissions(effectivePerson.userGroups),
      };
      const secured = SERVICE.DefaultSecuredRequestPipelineService;
      if (
        secured.isPermissionGranted(
          "profile.enterpriseAccess.assign",
          secured.getGrantedPermissions({ authData }),
          secured.getRouteActionAuthorizationConfig(),
        )
      )
        result.push(item);
    }
    return result;
  },
  /** Rejects default-admin removal and removal of the final current administrator. @param {Object} item Target membership. @param {Object} enterprise Leased authority. @returns {Promise<void>} Coverage proven. */
  assertMayRestrict: async function (item, enterprise) {
    if (enterprise.defaultAdminAssignmentCode === item.code)
      this.fail("LAST_ADMIN");
    const admins = await this.administrators(item.enterpriseCode);
    if (admins.some((admin) => admin.code === item.code) && admins.length < 2)
      this.fail("LAST_ADMIN");
    if (
      !admins.length ||
      !admins.some(
        (admin) => admin.code === enterprise.defaultAdminAssignmentCode,
      )
    )
      this.fail("LAST_ADMIN");
  },
  /** Performs a recoverable fixed membership lifecycle command inside the held enterprise operation. @param {Object} request Authenticated command. @param {string} operation Fixed lifecycle action. @returns {Promise<Object>} Safe saved membership. */
  changeMembership: async function (request, operation) {
    const m = this.memberships(),
      input = m
        .base()
        .input(request.body || {}, [
          "assignmentCode",
          "revision",
          "operationId",
        ]);
    if (
      !["SUSPEND", "REVOKE", "RESUME"].includes(operation) ||
      !Number.isSafeInteger(input.revision)
    )
      this.fail("CONFLICT");
    let { item, enterprise } = await this.assignment(
      input.assignmentCode,
      true,
    );
    const lease = await this.begin(
      request,
      operation,
      input,
      item.enterpriseCode,
    );
    if (lease.teamOperation.phase === "COMPLETE")
      return this.outcome(lease.teamOperation.outcome);
    ({ item, enterprise } = await this.assignment(input.assignmentCode, true));
    if (item.membership?.lastTeamOperation === input.operationId) {
      const verified = await this.repairCommittedAssignment(
        request,
        lease,
        item,
      );
      return this.finish(lease, m.project(verified.item, verified.enterprise));
    }
    try {
      if (
        item.revision !== input.revision ||
        item.membership?.phase !== "COMPLETE" ||
        (operation === "RESUME"
          ? item.status !== "SUSPENDED"
          : item.status !== "REGISTERED")
      )
        this.fail("CONFLICT");
      await m.administrator(request, item.enterpriseCode);
      if (operation !== "RESUME") await this.assertMayRestrict(item, lease);
    } catch (error) {
      // No membership write has started: record a refusal, freeing the serialized owner safely.
      await this.finish(lease, {
        errorCode: error.code || "ERR_PROFILE_TEAM_CONFLICT",
      });
      throw error;
    }
    const status =
      operation === "RESUME"
        ? "REGISTERED"
        : operation === "SUSPEND"
          ? "SUSPENDED"
          : "REVOKED";
    item = await m.write(item, {
      status,
      active: operation !== "REVOKE",
      membership: {
        ...item.membership,
        lastTeamOperation: input.operationId,
      },
    });
    return this.finish(lease, m.project(item, enterprise));
  },
  /** Withdraws only an unused invitation under the same serialized owner; same-command replay relies on committed assignment evidence. @param {Object} request Fresh administrator and reviewed revision. @returns {Promise<Object>} Safe terminal invitation outcome. */
  withdrawInvitation: async function (request) {
    if (
      (CONFIG.get("enterpriseManagement") || {}).teamAdministration
        ?.invitationWithdrawalQualified !== true
    )
      this.fail("UNAVAILABLE");
    const m = this.memberships(),
      input = m
        .base()
        .input(request.body || {}, [
          "assignmentCode",
          "revision",
          "operationId",
        ]);
    m.base().input(request.query || {}, []);
    if (!Number.isSafeInteger(input.revision) || input.revision < 1)
      this.fail("CONFLICT");
    let { item, enterprise } = await this.assignment(
      input.assignmentCode,
      true,
    );
    const lease = await this.begin(
      request,
      "WITHDRAW",
      input,
      item.enterpriseCode,
    );
    if (lease.teamOperation.phase === "COMPLETE")
      return this.outcome(lease.teamOperation.outcome);
    ({ item, enterprise } = await this.assignment(input.assignmentCode, true));
    if (item.invitationWithdrawal?.operationId === input.operationId) {
      const verified = await this.repairCommittedAssignment(
        request,
        lease,
        item,
      );
      return this.finish(lease, m.project(verified.item, verified.enterprise));
    }
    try {
      if (
        item.revision !== input.revision ||
        item.active !== true ||
        !["PENDING", "ACTIVE"].includes(item.status) ||
        item.registration ||
        item.membership ||
        item.identityClaimed ||
        enterprise.defaultAdminAssignmentCode === item.code
      )
        this.fail("CONFLICT");
      await m.administrator(request, item.enterpriseCode);
    } catch (error) {
      await this.finish(lease, {
        errorCode: error.code || "ERR_PROFILE_TEAM_CONFLICT",
      });
      throw error;
    }
    item = await m.write(item, {
      status: "REVOKED",
      active: false,
      invitationWithdrawal: {
        operationId: input.operationId,
        withdrawnAt: new Date().toISOString(),
      },
    });
    return this.finish(lease, m.project(item, enterprise));
  },
  /** Transfers designation only to a current administrator; neither passwords nor existing access are changed. @param {Object} request Human command. @returns {Promise<Object>} Safe designation. */
  handover: async function (request) {
    const m = this.memberships(),
      input = m
        .base()
        .input(request.body || {}, [
          "enterpriseCode",
          "assignmentCode",
          "revision",
          "operationId",
        ]);
    const lease = await this.begin(
      request,
      "HANDOVER",
      input,
      input.enterpriseCode,
    );
    if (lease.teamOperation.phase === "COMPLETE")
      return this.outcome(lease.teamOperation.outcome);
    let target;
    try {
      const admins = await this.administrators(input.enterpriseCode);
      target = admins.find((item) => item.code === input.assignmentCode);
      if (!target || target.revision !== input.revision)
        this.fail("LAST_ADMIN");
      await m.administrator(request, input.enterpriseCode);
    } catch (error) {
      await this.finish(lease, {
        errorCode: error.code || "ERR_PROFILE_TEAM_CONFLICT",
      });
      throw error;
    }
    return this.finish(
      lease,
      {
        enterpriseCode: input.enterpriseCode,
        defaultAdministratorAssignmentCode: target.code,
      },
      {
        adminEmail: target.normalizedEmail,
        defaultAdminAssignmentCode: target.code,
      },
    );
  },
};
