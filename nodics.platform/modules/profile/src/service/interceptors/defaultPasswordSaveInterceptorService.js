/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nodics.platform/modules/profile/src/service/interceptors/defaultPasswordSaveInterceptorService
 * @description Enforces canonical credential ownership on generated principal/Password writes and native reads, preserving legacy selectors and managed revision fences before hashing.
 * @layer service
 * @owner profile
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
  /** Rejects credential identity/selection failures without exposing retained values. @returns {never} Content-free integrity rejection. */
  failOwnership: function () {
    throw new CLASSES.NodicsError("ERR_PROFILE_CREDENTIAL_OWNERSHIP");
  },
  /** Reads bounded uncached records through the existing generated security inventory owner, never a new credential authority. @param {string} name Existing service. @param {string} tenant Original partition. @param {Object} query Exact owner selector. @returns {Promise<Array>} Fresh records. */
  ownershipRows: async function (name, tenant, query) {
    const inventory = SERVICE.DefaultPrincipalSecurityStampGovernanceService;
    if (
      typeof inventory?.inventory !== "function" ||
      typeof SERVICE[name]?.get !== "function"
    )
      this.failOwnership();
    try {
      return await inventory.inventory(SERVICE[name], tenant, query);
    } catch {
      this.failOwnership();
    }
  },
  /** Validates literal IDs without accepting operators, descriptors or arbitrary object coercion. @param {*} value Existing generated identifier. @returns {boolean} Exact identifier. */
  ownershipId: function (value) {
    return (
      (typeof value === "string" && /^[A-Za-z0-9._:-]{1,192}$/.test(value)) ||
      (value &&
        typeof value === "object" &&
        typeof value.toHexString === "function" &&
        /^[a-f0-9]{24}$/i.test(value.toHexString()))
    );
  },
  /** Resolves one original principal's fresh credential and proves its sole generated owner; cached embedded hashes and code-alias credential selection cannot authorize authentication. @param {string} tenant Original partition. @param {Object} person Original generated principal. @param {string} kind Fixed issuer Employee or Customer type. @returns {Promise<Object>} Fresh credential, never public transport. */
  readPrincipalCredential: async function (tenant, person, kind) {
    const reference = person?.password;
    const id =
      reference && Object.getPrototypeOf(reference) === Object.prototype
        ? reference._id
        : reference;
    if (
      !["Employee", "Customer"].includes(kind) ||
      !person?._id ||
      !this.ownershipId(id) ||
      typeof person.loginId !== "string" ||
      !person.loginId ||
      person.authenticationIdentity
    )
      this.failOwnership();
    const credentials = await this.ownershipRows(
      "DefaultPasswordService",
      tenant,
      { _id: id },
    );
    if (
      credentials.length !== 1 ||
      String(credentials[0]._id) !== String(id) ||
      credentials[0].loginId !== person.loginId ||
      credentials[0].active === false ||
      credentials[0].identityLinkRetirement ||
      typeof credentials[0].password !== "string" ||
      (credentials[0].provider && credentials[0].provider !== "PASSWORD")
    )
      this.failOwnership();
    const owners = [];
    for (const name of ["DefaultEmployeeService", "DefaultCustomerService"]) {
      owners.push(
        ...(
          await this.ownershipRows(name, tenant, {
            password: credentials[0]._id,
          })
        ).map((row) => ({ name, row })),
      );
    }
    if (
      owners.length !== 1 ||
      String(owners[0].row._id) !== String(person._id) ||
      owners[0].row.loginId !== person.loginId ||
      owners[0].row.authenticationIdentity ||
      owners[0].name !==
        (kind === "Customer"
          ? "DefaultCustomerService"
          : "DefaultEmployeeService")
    )
      this.failOwnership();
    return credentials[0];
  },
  /** Extracts an exact selector beneath existing generated retirement exclusions; guards alone never select an owner. @param {Object} query Generated selector. @param {number} [depth] Bounded guard nesting. @returns {Object} Literal credential fields. */
  ownershipSelector: function (query, depth = 0) {
    if (
      !query ||
      Object.getPrototypeOf(query) !== Object.prototype ||
      depth > 8
    )
      this.failOwnership();
    if (
      Object.keys(query).length === 1 &&
      Array.isArray(query.$and) &&
      query.$and.length === 2 &&
      JSON.stringify(query.$and[1]) ===
        JSON.stringify({ identityLinkRetirement: { $exists: false } })
    )
      return this.ownershipSelector(query.$and[0], depth + 1);
    if (
      !Object.keys(query).length ||
      Object.keys(query).some(
        (key) =>
          ![
            "_id",
            "code",
            "loginId",
            "active",
            "revision",
            "password",
            "identityLinkRetirement",
          ].includes(key),
      )
    )
      this.failOwnership();
    for (const [key, value] of Object.entries(query)) {
      if (
        key === "_id"
          ? !this.ownershipId(value)
          : key === "active"
            ? typeof value !== "boolean"
            : key === "revision"
              ? !Number.isSafeInteger(value) || value < 1
              : key === "identityLinkRetirement"
                ? JSON.stringify(value) !== JSON.stringify({ $exists: false })
                : typeof value !== "string" || !value || value.length > 1024
      )
        this.failOwnership();
    }
    if (!query._id && !query.code) this.failOwnership();
    return query;
  },
  /** Protects every legacy/managed Password save/update before retirement guards can turn an empty insert query into a broad replacement. Exact-ID existing writes retain the same original owner; new credentials cannot replace another principal. @param {Object} request Generated Password write. @param {string} operation SAVE or UPDATE. @returns {Promise<boolean>} Safe existing generated operation. */
  guardOwnership: async function (request, operation) {
    if (
      request?.schemaModel?.schemaName !== "password" ||
      !["SAVE", "UPDATE"].includes(operation) ||
      typeof request.tenant !== "string" ||
      !request.tenant ||
      !request.model ||
      Object.getPrototypeOf(request.model) !== Object.prototype ||
      Object.keys(request.model).some(
        (key) =>
          key.startsWith("$") ||
          key.startsWith("loginId.") ||
          key.startsWith("password."),
      ) ||
      request.options?.replaceAllMatchesByQuery === true ||
      request.options?.allowCmsAssociationReplacement === true
    )
      this.failOwnership();
    if (
      request.query &&
      Object.getPrototypeOf(request.query) === Object.prototype &&
      !Object.keys(request.query).length
    )
      delete request.query;
    if (!request.query) {
      if (
        operation !== "SAVE" ||
        request.model._id ||
        typeof request.model.loginId !== "string" ||
        !request.model.loginId ||
        request.model.loginId.length > 320
      )
        this.failOwnership();
      return true;
    }
    const selector = this.ownershipSelector(request.query);
    if (
      !selector._id &&
      (!request.model.code ||
        selector.code !== request.model.code ||
        typeof request.model.loginId !== "string" ||
        !request.model.loginId ||
        (selector.loginId !== undefined &&
          selector.loginId !== request.model.loginId))
    )
      this.failOwnership();
    const rows = await this.ownershipRows(
      "DefaultPasswordService",
      request.tenant,
      selector,
    );
    if (rows.length > 1 || (operation === "UPDATE" && rows.length !== 1))
      this.failOwnership();
    if (!rows.length) {
      if (
        selector._id ||
        typeof request.model.loginId !== "string" ||
        !request.model.loginId
      )
        this.failOwnership();
      // A new natural-key save is insert-only. A concurrent existing key must fail, not become an upsert overwrite.
      delete request.query;
      request.options = { ...request.options, upsert: false };
      return true;
    }
    const original = rows[0];
    if (
      !selector._id ||
      String(original._id) !== String(selector._id) ||
      typeof original.loginId !== "string" ||
      !original.loginId ||
      original.identityLinkRetirement ||
      (request.model._id !== undefined &&
        String(request.model._id) !== String(original._id)) ||
      (request.model.loginId !== undefined &&
        request.model.loginId !== original.loginId) ||
      (request.model.code !== undefined && request.model.code !== original.code)
    )
      this.failOwnership();
    const concurrency = SERVICE.DefaultModelConcurrencyService;
    if (
      request.schemaModel.rawSchema?.backoffice?.concurrency?.managed ===
        true &&
      typeof concurrency?.getCredentialWritePolicy !== "function"
    )
      this.failOwnership();
    const policy = concurrency?.getCredentialWritePolicy?.(
      request.schemaModel.rawSchema,
    );
    if (policy) {
      if (selector.password !== undefined) this.failOwnership();
      if (selector.revision !== undefined)
        request.model.revision = selector.revision;
      if (request.model.code === undefined) request.model.code = original.code;
    }
    const principals = [];
    for (const name of ["DefaultEmployeeService", "DefaultCustomerService"]) {
      principals.push(
        ...(await this.ownershipRows(name, request.tenant, {
          password: original._id,
        })),
      );
    }
    if (
      principals.length > 1 ||
      principals.some(
        (person) =>
          person.loginId !== original.loginId || person.authenticationIdentity,
      )
    )
      this.failOwnership();
    request.query = {
      ...selector,
      _id: original._id,
      loginId: original.loginId,
      identityLinkRetirement: { $exists: false },
    };
    request.options = { ...request.options, upsert: false };
    return true;
  },
  /** Mandatory generated Password save hook; does not depend on rollout flags. @param {Object} request Generated write. @returns {Promise<boolean>} Ownership admission. */
  guardSaveOwnership: function (request) {
    return this.guardOwnership(request, "SAVE");
  },
  /** Mandatory generated Password update hook; does not depend on rollout flags. @param {Object} request Generated write. @returns {Promise<boolean>} Ownership admission. */
  guardUpdateOwnership: function (request) {
    return this.guardOwnership(request, "UPDATE");
  },
  /** Preserves an unchanged original Customer credential during the existing private startup Init execution only. Never copies hashes or creates lifecycle authority from request fields. @param {Object} request Exact generated parent write. @param {Object} original Fresh sole Customer selected by the generated query. @returns {Promise<boolean>} Whether retained credential input was substituted. @override Later Profile layers may narrow preservation; retain fresh sole-owner proof and startup provenance. */
  preserveStartupCustomerCredential: async function (request, original) {
    if (request.schemaModel?.schemaName !== "customer") return false;
    return this.preserveStartupPrincipalCredential(request, original);
  },
  /** Preserves an existing Employee credential during private Init, with authority-only humans and tenant-local service principals. @param {Object} request Generated Employee write. @param {Object} original Fresh sole Employee. @returns {Promise<boolean>} Whether the original credential was retained. @override Later Profile layers may narrow startup preservation without permitting credential replacement. */
  preserveStartupEmployeeCredential: async function (request, original) {
    if (request.schemaModel?.schemaName !== "employee") return false;
    return this.preserveStartupPrincipalCredential(request, original);
  },
  /** Retains a freshly verified sole credential owner under a no-upsert conditional parent write. @param {Object} request Private startup generated principal write. @param {Object} original Original principal. @returns {Promise<boolean>} Preservation result. */
  preserveStartupPrincipalCredential: async function (request, original) {
    const releases = SERVICE.DefaultDataReleaseService;
    const model = request.model;
    const schema = request.schemaModel?.schemaName;
    if (
      !["customer", "employee"].includes(schema) ||
      model?.$set ||
      !original ||
      typeof releases?.isStartupReleaseExecution !== "function" ||
      releases.isStartupReleaseExecution(request.tenant) !== true
    )
      return false;
    const reference = model.password;
    if (
      !reference ||
      Object.getPrototypeOf(reference) !== Object.prototype ||
      typeof reference.password !== "string" ||
      reference._id !== undefined
    )
      return false;
    if (
      (request.tenant !== (CONFIG.get("defaultTenant") || "default") &&
        !(
          schema === "employee" &&
          original.principalType === "service" &&
          model.principalType === "service"
        )) ||
      (schema === "employee" &&
        original.principalType !== model.principalType) ||
      model.code !== original.code ||
      model.loginId !== original.loginId ||
      reference.loginId !== original.loginId ||
      original.authenticationIdentity ||
      model.authenticationIdentity ||
      original.identityLinkRetirement
    )
      this.failOwnership();
    const credential = await this.readPrincipalCredential(
      request.tenant,
      original,
      schema === "employee" ? "Employee" : "Customer",
    );
    if (releases.isStartupReleaseExecution(request.tenant) !== true)
      this.failOwnership();
    model.password = credential._id;
    if (original.authVersion === undefined) delete model.authVersion;
    else model.authVersion = original.authVersion;
    request.query = {
      $and: [
        request.query,
        {
          _id: original._id,
          loginId: original.loginId,
          password: credential._id,
          authenticationIdentity:
            original.authenticationIdentity === undefined
              ? { $exists: false }
              : original.authenticationIdentity,
          identityLinkRetirement:
            original.identityLinkRetirement === undefined
              ? { $exists: false }
              : original.identityLinkRetirement,
          ...(schema === "employee"
            ? {
                principalType:
                  original.principalType === undefined
                    ? { $exists: false }
                    : original.principalType,
              }
            : {}),
          authVersion:
            original.authVersion === undefined
              ? { $exists: false }
              : original.authVersion,
        },
      ],
    };
    request.options = { ...request.options, upsert: false };
    return true;
  },
  /** Protects parent credentials before generated nested relation writes. Scope/authVersion-only updates do not inspect or mutate Password. @param {Object} request Generated Employee/Customer write. @returns {Promise<boolean>} Same canonical credential owner or new matching nested credential. */
  guardPrincipalCredential: async function (request) {
    const schema = request?.schemaModel?.schemaName;
    if (!["employee", "customer"].includes(schema)) this.failOwnership();
    const model = request.model;
    if (!model || Object.getPrototypeOf(model) !== Object.prototype)
      this.failOwnership();
    const paths = Object.keys(model).flatMap((key) =>
      key.startsWith("$") && model[key] && typeof model[key] === "object"
        ? Object.keys(model[key])
        : [key],
    );
    if (
      !paths.some(
        (key) =>
          key === "password" ||
          key === "loginId" ||
          key.startsWith("password.") ||
          key.startsWith("loginId."),
      )
    )
      return true;
    if (
      paths.some(
        (key) => key.startsWith("password.") || key.startsWith("loginId."),
      ) ||
      Object.keys(model).some((key) => key.startsWith("$") && key !== "$set")
    )
      this.failOwnership();
    const patch = model.$set || model;
    const rows =
      request.query && Object.keys(request.query).length
        ? await this.ownershipRows(
            schema === "employee"
              ? "DefaultEmployeeService"
              : "DefaultCustomerService",
            request.tenant,
            request.query,
          )
        : [];
    if (rows.length > 1) this.failOwnership();
    if (schema === "customer")
      await this.preserveStartupCustomerCredential(request, rows[0]);
    else await this.preserveStartupEmployeeCredential(request, rows[0]);
    const loginId =
      patch.loginId === undefined ? rows[0]?.loginId : patch.loginId;
    const reference =
      patch.password === undefined ? rows[0]?.password : patch.password;
    // Credential-free projections remain subject to the existing private membership guards.
    if (
      !reference &&
      (patch.authenticationIdentity || rows[0]?.authenticationIdentity)
    )
      return true;
    if (typeof loginId !== "string" || !loginId || !reference)
      this.failOwnership();
    if (
      reference &&
      Object.getPrototypeOf(reference) === Object.prototype &&
      typeof reference.password === "string"
    ) {
      if (
        reference.loginId !== loginId ||
        (rows.length && reference._id === undefined)
      )
        this.failOwnership();
      if (reference._id === undefined) return true;
    }
    const id =
      reference && Object.getPrototypeOf(reference) === Object.prototype
        ? reference._id
        : reference;
    if (!this.ownershipId(id)) this.failOwnership();
    const credentials = await this.ownershipRows(
      "DefaultPasswordService",
      request.tenant,
      { _id: id },
    );
    if (
      credentials.length !== 1 ||
      credentials[0].loginId !== loginId ||
      credentials[0].identityLinkRetirement ||
      String(credentials[0]._id) !== String(id)
    )
      this.failOwnership();
    const retainedReference = rows[0]?.password;
    const retainedId =
      retainedReference &&
      Object.getPrototypeOf(retainedReference) === Object.prototype
        ? retainedReference._id
        : retainedReference;
    if (
      retainedReference &&
      (!this.ownershipId(retainedId) || String(retainedId) !== String(id))
    )
      this.failOwnership();
    for (const name of ["DefaultEmployeeService", "DefaultCustomerService"]) {
      const owners = await this.ownershipRows(name, request.tenant, {
        password: credentials[0]._id,
      });
      if (
        owners.some(
          (person) =>
            name !==
              (schema === "employee"
                ? "DefaultEmployeeService"
                : "DefaultCustomerService") ||
            String(person._id) !== String(rows[0]?._id) ||
            person.loginId !== loginId,
        )
      )
        this.failOwnership();
    }
    return true;
  },
  /** Resolves the actual prepared Password model policy, never inferring managed ownership from a record field. @param {string} tenant Original partition. @returns {Object|undefined} Effective managed credential contract or legacy mode. */
  managedPolicy: function (tenant) {
    if (
      typeof SERVICE.DefaultProfileService?.getProfileModuleName !==
        "function" ||
      typeof NODICS === "undefined" ||
      typeof NODICS.getModels !== "function"
    ) {
      throw new CLASSES.NodicsError("ERR_CONCURRENCY_00003");
    }
    const moduleName = SERVICE.DefaultProfileService.getProfileModuleName();
    const model = NODICS.getModels(moduleName, tenant)?.PasswordModel;
    if (
      !model?.rawSchema ||
      !SERVICE.DefaultModelConcurrencyService?.getCredentialWritePolicy
    ) {
      throw new CLASSES.NodicsError("ERR_CONCURRENCY_00003");
    }
    return SERVICE.DefaultModelConcurrencyService.getCredentialWritePolicy(
      model.rawSchema,
    );
  },
  /** Builds exact original-token, active, non-retired writer conditions when configured; no counter synthesis or hash predicate. @param {string} tenant Original partition. @param {Object} record Fresh credential. @returns {Object|undefined} Managed selector or unchanged legacy mode. */
  mutationQuery: function (tenant, record) {
    if (!this.managedPolicy(tenant)) return undefined;
    if (
      !record?._id ||
      typeof record.code !== "string" ||
      !record.code ||
      typeof record.loginId !== "string" ||
      !record.loginId ||
      record.active !== true ||
      Object.hasOwn(record, "identityLinkRetirement") ||
      !Number.isSafeInteger(record.revision) ||
      record.revision < 1 ||
      !Number.isSafeInteger(record.revision + 1)
    ) {
      throw new CLASSES.NodicsError("ERR_CONCURRENCY_00001");
    }
    return {
      _id: record._id,
      code: record.code,
      loginId: record.loginId,
      revision: record.revision,
      active: true,
      identityLinkRetirement: { $exists: false },
    };
  },
  /**
   * Executes encrypt password behavior.
   *
   * @param {*} request Method input.
   * @param {*} response Method input.
   * @returns {*} Method result.
   */
  encryptPassword: async function (request, response) {
    // Recheck after other pre-write hooks and flatten only recognized exclusion guards, preserving the caller's original managed token.
    await this.guardOwnership(request, request.query ? "UPDATE" : "SAVE");
    return new Promise((resolve, reject) => {
      let password = request.model.password;
      let bcryptHash =
        typeof password === "string" && /^\$2[aby]\$\d{2}\$/.test(password);
      if (password && !bcryptHash) {
        UTILS.encryptPassword(password)
          .then((hash) => {
            request.model.password = hash;
            resolve(true);
          })
          .catch((error) => {
            reject(error);
          });
      } else {
        resolve(true);
      }
    });
  },
};
