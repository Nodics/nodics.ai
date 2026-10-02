/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
/**
 * @module profile/service/customer/DefaultCustomerEligibilityDecisionGovernanceService
 * @description Retains bounded customer decision evidence on the existing Customer and invalidates current proofs through existing principal stamp/update owners; never creates a policy, registry, credential or KYC certificate.
 * @layer service
 * @owner profile
 * @override Later layers may tighten exported receipt/history checks; preserve private admission, fresh generated inventory, stamp CAS, denial evidence, pre/post policy fencing and acknowledgement failures.
 */
const crypto = require("node:crypto");
const factsChanges = new WeakMap();
const auditedVersions = new WeakMap();
const guardQueries = new WeakMap();
const contactChanges = new WeakMap();
const reconciliations = new WeakMap();
const fenceAdmissions = new WeakMap();
const reads = new WeakSet(),
  writes = new WeakSet(),
  observations = new WeakMap(),
  staged = new WeakMap(),
  policyChanges = new WeakMap();

module.exports = {
  /** Rejects uncertain evidence or incomplete installation without disclosing private metadata. @param {string} [suffix] Existing Profile error suffix. @returns {never} Failure. */
  fail: function (suffix = "UNAVAILABLE") {
    throw new CLASSES.NodicsError("ERR_PROFILE_MEMBERSHIP_" + suffix);
  },
  /** Requires independently qualified audit and installed stamp/hook enforcement; flags remain false by default. @returns {Object} Effective Profile selection. */
  policy: function () {
    const p = CONFIG.get("profileCustomerEligibility");
    if (
      p?.enabled !== true ||
      p.enforcementQualified !== true ||
      p.decisionAuditQualified !== true ||
      p.decisionInvalidationQualified !== true ||
      !Number.isSafeInteger(p.maximumDecisionHistory) ||
      p.maximumDecisionHistory < 1 ||
      p.maximumDecisionHistory > 1000
    )
      this.fail();
    return p;
  },
  /** Hashes only non-secret owner receipts for stable no-op comparison. @param {*} value Receipt. @returns {string} Digest. */
  digest: function (value) {
    return crypto
      .createHash("sha256")
      .update(JSON.stringify(value))
      .digest("hex");
  },
  /** Validates a bounded non-secret reference code. @param {*} value Reference. @returns {boolean} Valid code. */
  isReferenceCode: function (value) {
    return typeof value === "string" && /^[A-Za-z0-9._:-]{1,192}$/.test(value);
  },
  /** Recognizes exact active generated reads, not caller flags. @param {Object} request Generated request. @returns {boolean} Admission. */
  ownsRead: function (request) {
    return reads.has(request);
  },
  /** Recognizes exact active generated metadata writes. @param {Object} request Generated request. @returns {boolean} Admission. */
  ownsWrite: function (request) {
    return writes.has(request);
  },
  /** Content-free dependency predicate for proved historical targets: retained decisions/fences cannot be reinterpreted under a different canonical identity. Uses this owner's exact uncached generated read, never another owner's redacted model. No public route/flag admission. @param {Object} identity Original typed locator. @returns {Promise<boolean>} Retained private dependency. */
  hasRetainedDecision: async function (identity) {
    if (
      !identity ||
      Object.keys(identity).sort().join(",") !==
        "recordId,recordKind,tenantCode" ||
      !["CUSTOMER", "EMPLOYEE"].includes(identity.recordKind) ||
      !this.isReferenceCode(identity.tenantCode)
    )
      this.fail("FORBIDDEN");
    const id = SERVICE.DefaultEnterpriseMembershipService.recordId(
      identity.recordId,
    );
    if (identity.recordKind === "EMPLOYEE") return false;
    const rows = await this.inventory(identity.tenantCode, { _id: id });
    if (rows.length !== 1) this.fail("CONFLICT");
    return (
      Object.hasOwn(rows[0], "customerEligibilityDecision") &&
      rows[0].customerEligibilityDecision != null
    );
  },
  /** Identifies only an exact executing metadata-write query for the existing stamp inventory adapter; cloned/body queries cannot acquire private read rights. @param {Object} query Query identity. @param {Object} service Actual generated owner. @param {string} tenant Partition. @returns {boolean} Guard admission. */
  ownsGuardQuery: function (query, service, tenant) {
    const command = query && guardQueries.get(query);
    return Boolean(
      command &&
      writes.has(command) &&
      command.query === query &&
      command.tenant === tenant &&
      service === SERVICE.DefaultCustomerService,
    );
  },
  /** Admits an exact generated stamp-guard page only while its unchanged originating metadata write executes. @param {Object} service Actual generated Customer owner. @param {Object} request Exact generated page. @returns {Promise<Object>} Existing generated envelope. */
  guardInventoryRead: function (service, request) {
    if (!this.ownsGuardQuery(request.query, service, request.tenant))
      return service.get(request);
    return this.generatedRead(request);
  },
  /** Delegates the existing Customer stamp pre-hook, adapting only this owner's exact private CAS-query inventory; all other stamp calls retain the original receiver/path. @param {Object} request Generated Customer update. @returns {Promise<boolean>} Existing stamp preparation. */
  prepareCustomerSecurityStamp: function (request) {
    const owner = SERVICE.DefaultPrincipalSecurityStampGovernanceService;
    if (
      !this.ownsGuardQuery(
        request.query,
        SERVICE.DefaultCustomerService,
        request.tenant,
      )
    )
      return owner.preparePrincipalUpdate(request);
    const delegate = Object.create(owner);
    delegate.inventory = (service, tenant, query) =>
      owner.inventory(
        { get: (page) => this.guardInventoryRead(service, page) },
        tenant,
        query,
      );
    return owner.preparePrincipalUpdate.call(delegate, request);
  },
  /** Finds private metadata in selectors/projections, including string expressions, under fixed traversal bounds. @param {*} value Fragment. @param {number} [depth] Depth. @param {Object} [budget] Node ceiling. @returns {boolean} Private/unsafe fragment. */
  containsPrivateMetadata: function (
    value,
    depth = 0,
    budget = { entries: 0 },
  ) {
    if (depth > 32 || ++budget.entries > 4096) return true;
    if (typeof value === "string")
      return value.includes("customerEligibilityDecision");
    if (!value || typeof value !== "object") return false;
    return Object.entries(value).some(
      ([key, entry]) =>
        key.includes("customerEligibilityDecision") ||
        [
          "$where",
          "$function",
          "$accumulator",
          "$getField",
          "$setField",
        ].includes(key) ||
        this.containsPrivateMetadata(entry, depth + 1, budget),
    );
  },
  /** Forbids public private-metadata selectors/projections, independently of activation. @param {Object} request Generic get/count/export. @returns {boolean} Safe read. */
  protectRead: function (request) {
    if (reads.has(request)) return true;
    if (
      this.containsPrivateMetadata({
        query: request.query || {},
        searchOptions: request.searchOptions || {},
        options: request.options || {},
      })
    )
      this.fail("FORBIDDEN");
    return true;
  },
  /** Preserves private metadata only during exact uncached generated owner reads. @param {Object} request Inventory page. @returns {Promise<Object>} Generated envelope. */
  generatedRead: async function (request) {
    if (
      reads.has(request) ||
      request.options?.recursive !== false ||
      request.options?.skipItemCache !== true ||
      typeof SERVICE.DefaultCustomerService?.get !== "function"
    )
      this.fail();
    reads.add(request);
    try {
      return await SERVICE.DefaultCustomerService.get(request);
    } finally {
      reads.delete(request);
    }
  },
  /** Uses the existing complete security inventory, including private-read admission for each page. @param {string} tenant Partition. @param {Object} query Exact lookup. @returns {Promise<Object[]>} Current Customers. */
  inventory: function (tenant, query) {
    return SERVICE.DefaultPrincipalSecurityStampGovernanceService.inventory(
      { get: (request) => this.generatedRead(request) },
      tenant,
      query,
    );
  },
  /** Requires one exact canonical Customer and a usable existing stamp revision. @param {Object[]} rows Inventory. @param {string} loginId Subject. @returns {Object|undefined} Customer. */
  customer: function (rows, loginId) {
    if (!Array.isArray(rows) || rows.length > 1) this.fail("CONFLICT");
    const person = rows[0];
    if (
      person &&
      (!person._id ||
        person.loginId !== loginId ||
        person.principalType !== "customer" ||
        !Number.isSafeInteger(person.authVersion || 1) ||
        (person.authVersion || 1) < 1 ||
        (person.authVersion || 1) >= 2147483647)
    )
      this.fail("CONFLICT");
    return person;
  },
  /** Admits only a transient owner observation, capturing current original Customer revision before policy/fact evaluation. @param {Object} context Minimal owner coordinates. @param {Function} operation Evaluation callback. @returns {Promise<*>} Callback result. */
  withObservation: async function (context, operation, request) {
    this.policy();
    const person = this.customer(
      await this.inventory(context.tenant, { loginId: context.subjectCode }),
      context.subjectCode,
    );
    const recovery = request && reconciliations.get(request);
    if (
      recovery &&
      (!person ||
        recovery.tenant !== context.tenant ||
        String(person._id) !== String(recovery.person._id) ||
        (person.authVersion || 1) !== (recovery.person.authVersion || 1) ||
        this.digest(person.customerEligibilityDecision) !==
          this.digest(recovery.person.customerEligibilityDecision))
    )
      this.fail("CONFLICT");
    if (
      person?.customerEligibilityDecision?.invalidation?.phase === "PENDING" &&
      !recovery
    )
      this.fail("CONFLICT");
    const handle = Object.freeze({});
    observations.set(handle, { context, person, recovery });
    try {
      return await operation(handle);
    } finally {
      observations.delete(handle);
    }
  },
  /** Retains only bounded policy/evaluation references from the actual evaluator; no raw facts, contacts, credentials or graphs. @param {Object} context Owner coordinates. @param {Object} decision Actual evaluation receipt. @returns {Object} Private persisted receipt. */
  receipt: function (context, decision) {
    const scalar = (value) => this.isReferenceCode(value);
    if (
      !decision ||
      !["ALLOW", "DENY"].includes(decision.outcome) ||
      !scalar(decision.decisionId) ||
      !/^[a-f0-9]{64}$/.test(decision.sourceHash || "") ||
      !/^[a-f0-9]{64}$/.test(decision.policyFingerprint || "") ||
      ![
        decision.policyType,
        decision.propertyProviderCode,
        decision.catalogueCode,
        decision.catalogueVersion,
        context.tenant,
        context.enterpriseCode,
      ].every(scalar) ||
      !Array.isArray(decision.sourceScopes) ||
      !decision.sourceScopes.length ||
      decision.sourceScopes.length > 3
    )
      this.fail();
    const sourceScopes = decision.sourceScopes.map((scope) => {
      if (
        !["PLATFORM", "DOMAIN", "ENTERPRISE"].includes(scope.scopeType) ||
        !scalar(scope.scopeCode) ||
        !scalar(scope.code) ||
        !Number.isSafeInteger(scope.version) ||
        scope.version < 1
      )
        this.fail();
      return {
        scopeType: scope.scopeType,
        scopeCode: scope.scopeCode,
        code: scope.code,
        version: scope.version,
      };
    });
    return {
      decisionId: decision.decisionId,
      outcome: decision.outcome,
      evaluatedAt: new Date().toISOString(),
      tenantCode: context.tenant,
      enterpriseCode: context.enterpriseCode,
      policyType: decision.policyType,
      propertyProviderCode: decision.propertyProviderCode,
      catalogueCode: decision.catalogueCode,
      catalogueVersion: decision.catalogueVersion,
      sourceHash: decision.sourceHash,
      policyFingerprint: decision.policyFingerprint,
      sourceScopes,
    };
  },
  /** Fingerprints an observed existing policy snapshot, never allocating a policy revision. @param {Object} policy Actual resolved Rules policy. @returns {string} Snapshot digest. */
  policyFingerprint: function (policy) {
    return this.digest({
      definition: policy.definition,
      sourceScopes: policy.sourceScopes,
      propertyProviderCode: policy.propertyProviderCode,
      propertyCatalogueVersion: String(policy.propertyCatalogueVersion),
    });
  },
  /** Re-resolves existing current published policy before/after persistence, rejecting publication/window drift. @param {Object} context Placement. @param {Object} receipt Actual evaluation reference. @returns {Promise<boolean>} Current policy evidence. */
  assertPolicyCurrent: async function (context, receipt) {
    const owner = SERVICE.DefaultKycDecisionEnforcementService;
    if (typeof owner?.resolvePolicy !== "function") this.fail();
    const selection = owner.policy();
    if (
      selection.policyType !== receipt.policyType ||
      selection.propertyProviderCode !== receipt.propertyProviderCode ||
      selection.propertyCatalogueVersion !== receipt.catalogueVersion
    )
      this.fail("CONFLICT");
    const current = await owner.resolvePolicy(
      context,
      selection,
      owner.owners(),
    );
    if (this.policyFingerprint(current) !== receipt.policyFingerprint)
      this.fail("CONFLICT");
    return true;
  },
  /** Compares decision content independently of observation time. @param {Object} value Retained receipt. @returns {string} Content digest. */
  receiptDigest: function (value) {
    if (!value) return "";
    const { evaluatedAt, ...content } = value;
    return this.digest(content);
  },
  /** Checks one exact acknowledged update, then proves principal revision/stamps advanced through installed existing hooks. @param {Object} person Original Customer. @param {string} tenant Partition. @param {Object} metadata Next private evidence. @returns {Promise<Object>} Fresh persisted Customer. */
  update: async function (person, tenant, metadata) {
    // Legacy absent authVersion is interpreted as 1; advance the existing sequence before its update hook allocates, never mint a second revision owner.
    if (person.authVersion === undefined) {
      if (
        typeof SERVICE.DefaultPrincipalSecurityStampService?.reserveVersion !==
        "function"
      )
        this.fail();
      await SERVICE.DefaultPrincipalSecurityStampService.reserveVersion(
        tenant,
        2,
      );
    }
    const command = {
      tenant,
      authData: SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
      query: {
        _id: person._id,
        authVersion:
          person.authVersion === undefined
            ? { $exists: false }
            : person.authVersion,
        customerEligibilityDecision:
          person.customerEligibilityDecision === undefined
            ? { $exists: false }
            : person.customerEligibilityDecision,
      },
      model: { $set: { customerEligibilityDecision: metadata } },
      options: { recursive: false, upsert: false },
    };
    writes.add(command);
    guardQueries.set(command.query, command);
    let response;
    try {
      response = await SERVICE.DefaultCustomerService.update(command);
    } finally {
      writes.delete(command);
      guardQueries.delete(command.query);
    }
    if (
      !/^SUC_/.test(response?.code || "") ||
      response.success === false ||
      response.error ||
      (response.errors &&
        (!Array.isArray(response.errors) || response.errors.length)) ||
      response.result?.acknowledged !== true ||
      response.result.matchedCount !== 1
    )
      this.fail("CONFLICT");
    const current = this.customer(
      await this.inventory(tenant, { _id: person._id }),
      person.loginId,
    );
    if (
      !current ||
      current.authVersion <= (person.authVersion || 1) ||
      (!person.authenticationIdentity &&
        current.authVersion !== command.securityStampVersion) ||
      this.digest(current.customerEligibilityDecision) !== this.digest(metadata)
    )
      this.fail("CONFLICT");
    const stamps = SERVICE.DefaultPrincipalSecurityStampService,
      tokens = SERVICE.DefaultAuthenticationProviderService;
    if (
      typeof stamps?.getKey !== "function" ||
      typeof stamps?.getCacheModuleName !== "function" ||
      typeof tokens?.findToken !== "function"
    )
      this.fail();
    for (const principal of [
      person.loginId,
      "identity:CUSTOMER:" +
        SERVICE.DefaultEnterpriseMembershipService.recordId(person._id),
    ]) {
      const stamp = await tokens.findToken(
        stamps.getCacheModuleName(),
        stamps.getKey(tenant, principal),
      );
      if (!stamp || stamp.authVersion !== current.authVersion)
        this.fail("CONFLICT");
    }
    return current;
  },
  /** Records an actual evaluation, preserves prior bounded history and invalidates current sessions on changed decision content. @param {Object} handle Exact active observation. @param {Object} decision Evaluator receipt. @returns {Promise<Object>} Minimal public decision or denial. */
  record: async function (handle, decision) {
    const observation = observations.get(handle);
    if (!observation || observation.recorded) this.fail("FORBIDDEN");
    observation.recorded = true;
    const { context, person, recovery } = observation,
      receipt = this.receipt(context, decision);
    await this.assertPolicyCurrent(context, receipt);
    const current = this.customer(
      await this.inventory(context.tenant, { loginId: context.subjectCode }),
      context.subjectCode,
    );
    if (
      Boolean(current) !== Boolean(person) ||
      (current &&
        (String(current._id) !== String(person._id) ||
          (current.authVersion || 1) !== (person.authVersion || 1) ||
          (current.customerEligibilityDecision?.invalidation?.phase ===
            "PENDING" &&
            !recovery) ||
          (recovery &&
            this.digest(current.customerEligibilityDecision) !==
              this.digest(person.customerEligibilityDecision))))
    )
      this.fail("CONFLICT");
    let persisted = current;
    if (current) {
      const prior = current.customerEligibilityDecision;
      if (
        prior?.current &&
        this.receiptDigest(prior.current) === this.receiptDigest(receipt) &&
        !recovery
      ) {
        await this.assertPolicyCurrent(context, receipt);
        const result = {
          eligible: receipt.outcome === "ALLOW",
          decisionId: receipt.decisionId,
        };
        auditedVersions.set(result, {
          context,
          before: current,
          after: current,
        });
        return result;
      }
      const history = prior?.history || [];
      const changed =
        !prior?.current ||
        this.receiptDigest(prior.current) !== this.receiptDigest(receipt);
      if (
        !Array.isArray(history) ||
        history.length + (changed && prior?.current ? 1 : 0) >
          this.policy().maximumDecisionHistory
      )
        this.fail("CONFLICT");
      persisted = await this.update(current, context.tenant, {
        ...prior,
        current: receipt,
        history: [
          ...history,
          ...(changed && prior?.current ? [prior.current] : []),
        ],
        ...(recovery
          ? {
              invalidation: {
                ...prior.invalidation,
                phase: "COMPLETE",
                reconciledAt: new Date().toISOString(),
                operatorIdentity: recovery.operatorIdentity,
                evaluatedDecisionId: receipt.decisionId,
              },
            }
          : {}),
      });
    }
    await this.assertPolicyCurrent(context, receipt);
    const result = {
      eligible: receipt.outcome === "ALLOW",
      decisionId: receipt.decisionId,
    };
    if (!current && result.eligible) staged.set(result, { context, receipt });
    if (current)
      auditedVersions.set(result, {
        context,
        before: current,
        after: persisted,
      });
    return result;
  },
  /** Transfers staged receipt ownership across the existing registration's minimal response projection, never from caller fields. @param {Object} original Exact evaluated result. @param {Object} projected Minimal Profile projection. @returns {Object} Unchanged public projection. */
  transferRegistrationDecision: function (original, projected) {
    const revision = auditedVersions.get(original);
    if (
      revision &&
      original.eligible === projected.eligible &&
      original.decisionId === projected.decisionId
    ) {
      auditedVersions.delete(original);
      auditedVersions.set(projected, revision);
    }
    const admission = staged.get(original);
    if (
      admission &&
      original.eligible === projected.eligible &&
      original.decisionId === projected.decisionId
    ) {
      staged.delete(original);
      staged.set(projected, admission);
    }
    return projected;
  },
  /** Resolves a fresh native anchor after decision persistence, admitting only this exact audited revision transition and unchanged credential ownership; no public revision/proof flag is returned. @param {Object} anchor Original verified native anchor. @param {Object} decision Exact private-provenance result. @returns {Promise<Object>} Fresh original anchor. */
  nativeAuditAnchor: async function (anchor, decision) {
    const proof = auditedVersions.get(decision);
    auditedVersions.delete(decision);
    if (
      !proof ||
      decision.eligible !== true ||
      proof.context.tenant !== anchor.identity.tenantCode ||
      String(proof.before._id) !== anchor.identity.recordId ||
      proof.before.loginId !== anchor.person.loginId ||
      (proof.before.authVersion || 1) !== (anchor.person.authVersion || 1)
    )
      this.fail("CONFLICT");
    const person = this.customer(
      await this.inventory(anchor.identity.tenantCode, {
        _id: anchor.person._id,
        identityLinkRetirement: { $exists: false },
      }),
      anchor.person.loginId,
    );
    if (
      !person ||
      person.active !== true ||
      person.disabled === true ||
      person.registrationSuspended === true ||
      person.authenticationIdentity ||
      person.customerParticipation ||
      person.code !== anchor.person.code ||
      (person.authVersion || 1) !== (proof.after.authVersion || 1) ||
      this.digest(person.password || null) !==
        this.digest(anchor.person.password || null) ||
      person.customerEligibilityDecision?.current?.decisionId !==
        decision.decisionId ||
      person.customerEligibilityDecision?.invalidation?.phase === "PENDING"
    )
      this.fail("CONFLICT");
    return { identity: anchor.identity, person };
  },
  /** Attaches one privately staged ordinary-registration decision to the existing generated Customer save; consumes admission even on failure. @param {Object} command Original save command. @param {Object} decision Exact evaluated result. @param {Function} operation Generated save callback. @returns {Promise<Object>} Acknowledged original save envelope. */
  withRegistrationDecision: async function (command, decision, operation) {
    this.policy();
    const admission = staged.get(decision);
    staged.delete(decision);
    if (
      !admission ||
      decision.eligible !== true ||
      command.tenant !== admission.context.tenant ||
      command.model?.loginId !== admission.context.subjectCode ||
      command.model.customerEligibilityDecision !== undefined ||
      command.model.authenticationIdentity ||
      typeof operation !== "function"
    )
      this.fail("FORBIDDEN");
    await this.assertPolicyCurrent(admission.context, admission.receipt);
    command.model = {
      ...command.model,
      customerEligibilityDecision: { current: admission.receipt, history: [] },
    };
    writes.add(command);
    let response;
    try {
      response = await operation(command);
    } finally {
      writes.delete(command);
    }
    if (
      !/^SUC_/.test(response?.code || "") ||
      response.success === false ||
      response.error ||
      (response.errors &&
        (!Array.isArray(response.errors) || response.errors.length))
    )
      this.fail("CONFLICT");
    const retained = this.customer(
      await this.inventory(command.tenant, { loginId: command.model.loginId }),
      command.model.loginId,
    );
    if (
      !retained ||
      this.digest(retained.customerEligibilityDecision?.current) !==
        this.digest(admission.receipt)
    )
      this.fail("CONFLICT");
    await this.assertPolicyCurrent(admission.context, admission.receipt);
    return this.publicValue(response);
  },
  /** Rejects public metadata construction/rewrite/removal; exact generated owner writes are the only admission. @param {Object} request Generated Customer mutation. @returns {Promise<boolean>} Safe mutation. */
  protectMutation: async function (request) {
    if (writes.has(request)) return true;
    if (this.containsPrivateMetadata(request.query || {}))
      this.fail("FORBIDDEN");
    const models = Array.isArray(request.model)
      ? request.model
      : [request.model || {}];
    for (const model of models) {
      const paths = SERVICE.DefaultEnterpriseMembershipService.paths(model);
      if (
        paths.some((path) =>
          /(^|\.)customerEligibilityDecision(\.|$)/.test(path),
        )
      )
        this.fail("FORBIDDEN");
      if (
        model.$rename &&
        Object.values(model.$rename).some(
          (path) =>
            typeof path !== "string" ||
            /(^|\.)customerEligibilityDecision(\.|$)/.test(path),
        )
      )
        this.fail("FORBIDDEN");
    }
    const replacement =
      request.options?.overwrite === true ||
      (Array.isArray(request.model) &&
        models.some((model) =>
          Object.keys(model).some((key) => key.startsWith("$")),
        )) ||
      models.some((model) =>
        Object.keys(model).some((key) =>
          ["$replaceRoot", "$replaceWith"].includes(key),
        ),
      );
    if (replacement) {
      // Replacement is compatible for unmarked rows, but may not erase retained proof.
      if (
        !request.query ||
        !Object.keys(request.query).length ||
        this.containsPrivateMetadata(request.query)
      )
        this.fail("FORBIDDEN");
      if (
        (await this.inventory(request.tenant, request.query)).some(
          (person) => person.customerEligibilityDecision,
        )
      )
        this.fail("FORBIDDEN");
    }
    if (request.operation === "remove" || request.operationName === "remove") {
      if (
        (await this.inventory(request.tenant, request.query || {})).some(
          (person) => person.customerEligibilityDecision,
        )
      )
        this.fail("FORBIDDEN");
    }
    return true;
  },
  /** Generated save can upsert without update stamp hooks: retained decision-bearing Customers must use governed update, while ordinary unmarked import/save remains supported. @param {Object} request Exact generated save. @returns {Promise<boolean>} Safe save. */
  protectSave: async function (request) {
    if (writes.has(request)) return true;
    await this.protectMutation(request);
    if (
      request.query &&
      Object.keys(request.query).length &&
      (await this.inventory(request.tenant, request.query)).some(
        (person) => person.customerEligibilityDecision,
      )
    )
      this.fail("FORBIDDEN");
    return true;
  },
  /** Explicit preRemove handler preserves retained decision audit independently of request operation aliases. @param {Object} request Generated Customer removal. @returns {Promise<boolean>} Safe removal. */
  protectRemoval: async function (request) {
    if (writes.has(request)) this.fail("FORBIDDEN");
    if (
      (await this.inventory(request.tenant, request.query || {})).some(
        (person) => person.customerEligibilityDecision,
      )
    )
      this.fail("FORBIDDEN");
    return true;
  },
  /** Clones structured public values, preserving ordinary BSON scalars while refusing attached private audit fields. @param {*} value Generated response. @param {WeakMap} [seen] Traversal. @param {number} [depth] Bound. @returns {*} Public copy. */
  publicValue: function (value, seen = new WeakMap(), depth = 0) {
    if (!value || typeof value !== "object") return value;
    if (depth > 64) this.fail();
    if (seen.has(value)) return seen.get(value);
    const scalar =
      !Array.isArray(value) &&
      Object.getPrototypeOf(value) !== Object.prototype &&
      Object.getPrototypeOf(value) !== null;
    if (scalar) {
      this.assertPublicScalar(value, new WeakSet(), depth);
      return value;
    }
    const copy = Array.isArray(value) ? [] : {};
    seen.set(value, copy);
    for (const key of Object.keys(value))
      if (!/(^|\.)customerEligibilityDecision(\.|$)/.test(key))
        Object.defineProperty(copy, key, {
          value: this.publicValue(value[key], seen, depth + 1),
          enumerable: true,
          writable: true,
          configurable: true,
        });
    return copy;
  },
  /** Preserves BSON scalar identity only if all attached structured fields are free of private decision metadata. @param {*} value Scalar. @param {WeakSet} [seen] Traversal. @param {number} [depth] Bound. @returns {boolean} Safe scalar. */
  assertPublicScalar: function (value, seen = new WeakSet(), depth = 0) {
    if (!value || typeof value !== "object" || seen.has(value)) return true;
    if (depth > 64) this.fail();
    seen.add(value);
    for (const key of Object.keys(value)) {
      if (/(^|\.)customerEligibilityDecision(\.|$)/.test(key)) this.fail();
      this.assertPublicScalar(value[key], seen, depth + 1);
    }
    return true;
  },
  /** Removes private Customer decision metadata from generated public/nested envelopes; exact current owner reads retain it. @param {Object} request Generated read. @param {Object} response Pipeline wrapper. @returns {boolean} Projection completion. */
  redactDecision: function (request, response) {
    if (!reads.has(request))
      response.success = this.publicValue(response.success);
    return true;
  },
  /** Re-evaluates current retained placement after an acknowledged canonical evidence-owner change, persisting real denial/approval and stamp invalidation rather than accepting an event's asserted outcome. @param {string} tenant Customer partition. @param {string} recordId Immutable Customer ID. @returns {Promise<Object>} Minimal assessed decision, including durable denial without approval. */
  refreshCurrentDecision: async function (tenant, recordId) {
    this.policy();
    if (!/^[A-Za-z0-9._-]{1,128}$/.test(tenant || "")) this.fail("FORBIDDEN");
    const id = SERVICE.DefaultEnterpriseMembershipService.recordId(recordId);
    const rows = await this.inventory(tenant, { _id: id });
    if (rows.length !== 1) this.fail("CONFLICT");
    const person = this.customer(rows, rows[0].loginId),
      current = person.customerEligibilityDecision?.current;
    if (!current || current.tenantCode !== tenant || !current.enterpriseCode)
      this.fail("CONFLICT");
    return SERVICE.DefaultKycDecisionEnforcementService.assess(
      { tenant },
      "ONBOARDING",
      {
        subjectType: "CUSTOMER",
        subjectCode: person.loginId,
        enterpriseCode: current.enterpriseCode,
        ...(person.authenticationIdentity
          ? { identity: person.authenticationIdentity }
          : {}),
      },
    );
  },
  /** Fences real verification-phase changes before Contact persistence. Exact original identities select Customers/projections across the existing bounded Tenant inventory, never email/login inference. Internal owner API only. @param {Object} identity Canonical locator. @param {Object} evidence Non-secret original Contact revision/phase coordinates. @returns {Promise<Object|undefined>} Transient completion handle. */
  prepareCanonicalContactChange: async function (identity, evidence) {
    if (
      (CONFIG.get("profileCustomerEligibility") || {}).enabled !== true ||
      evidence.beforePhase === evidence.afterPhase
    )
      return undefined;
    this.policy();
    const m = SERVICE.DefaultEnterpriseMembershipService;
    identity = m.locator(identity.tenantCode, identity.recordKind, {
      _id: identity.recordId,
    });
    if (
      !this.isReferenceCode(evidence.contactCode) ||
      !Number.isSafeInteger(evidence.beforeRevision) ||
      evidence.beforeRevision < 0 ||
      evidence.afterRevision !== evidence.beforeRevision + 1
    )
      this.fail("FORBIDDEN");
    const root = CONFIG.get("defaultTenant") || "default";
    const tenants =
      await SERVICE.DefaultPrincipalSecurityStampGovernanceService.inventory(
        SERVICE.DefaultTenantService,
        root,
        {},
      );
    if (
      tenants.length > 100 ||
      tenants.some((row) => !this.isReferenceCode(row.code))
    )
      this.fail();
    const partitions = [
      ...new Set([identity.tenantCode, ...tenants.map((row) => row.code)]),
    ].sort();
    if (partitions.length > 100) this.fail();
    const affected = [];
    for (const tenant of partitions) {
      const rows = await this.inventory(tenant, {
        $or: [
          ...(identity.recordKind === "CUSTOMER" &&
          tenant === identity.tenantCode
            ? [
                {
                  _id: identity.recordId,
                  authenticationIdentity: { $exists: false },
                },
              ]
            : []),
          {
            "authenticationIdentity.tenantCode": identity.tenantCode,
            "authenticationIdentity.recordKind": identity.recordKind,
            "authenticationIdentity.recordId": identity.recordId,
          },
        ],
      });
      const ids = rows
        .filter((row) => row.customerEligibilityDecision?.current)
        .map((row) => m.recordId(row._id));
      if (ids.length) affected.push({ tenant, customerIds: ids });
    }
    const handle = Object.freeze({}),
      changeId = crypto.randomUUID();
    const source = {
      kind: "CANONICAL_CONTACT",
      identity,
      contactCode: evidence.contactCode,
      beforeRevision: evidence.beforeRevision,
      afterRevision: evidence.afterRevision,
    };
    const operations = [];
    for (const partition of affected) {
      const request = Object.freeze({});
      policyChanges.set(request, {
        ...partition,
        changeId,
        reason: "CANONICAL_CONTACT_CHANGE",
        source,
      });
      try {
        await this.invalidateCurrentPolicyCustomers(request, "PENDING");
      } finally {
        policyChanges.delete(request);
      }
      operations.push(partition);
    }
    contactChanges.set(handle, {
      identity,
      revision: evidence.afterRevision,
      changeId,
      source,
      operations,
    });
    return handle;
  },
  /** Completes only the original acknowledged/readback Contact callback, assessing current policy/facts for each fenced Customer; failed callbacks retain PENDING. No asserted decision or notification consent grants eligibility. @param {Object} handle Exact transient capture. @param {Object} identity Fresh Contact owner. @param {number} revision Persisted revision. @returns {Promise<boolean>} Completion. */
  completeCanonicalContactChange: async function (handle, identity, revision) {
    const change = contactChanges.get(handle);
    contactChanges.delete(handle);
    if (
      !change ||
      this.digest(change.identity) !== this.digest(identity) ||
      change.revision !== revision
    )
      this.fail("FORBIDDEN");
    for (const partition of change.operations)
      for (const id of partition.customerIds) {
        const rows = await this.inventory(partition.tenant, { _id: id });
        if (
          rows.length !== 1 ||
          rows[0].customerEligibilityDecision?.invalidation?.changeId !==
            change.changeId
        )
          this.fail("CONFLICT");
        fenceAdmissions.set(rows[0], { tenant: partition.tenant });
        try {
          await this.assessRetainedFence(partition.tenant, rows[0]);
        } finally {
          fenceAdmissions.delete(rows[0]);
        }
      }
    return true;
  },
  /** Assesses a privately admitted exact retained fence through actual Rules; CAS preserves all history and only current evaluated outcomes may replace old decisions. @param {string} tenant Partition. @param {Object} person Fresh private Customer. @param {Object} [operatorIdentity] Verified operator locator. @returns {Promise<Object>} Actual minimal decision. */
  assessRetainedFence: async function (tenant, person, operatorIdentity) {
    const admission = fenceAdmissions.get(person);
    fenceAdmissions.delete(person);
    if (
      !admission ||
      admission.tenant !== tenant ||
      this.digest(admission.operatorIdentity || null) !==
        this.digest(operatorIdentity || null)
    )
      this.fail("FORBIDDEN");
    const current = person.customerEligibilityDecision?.current;
    if (
      !current ||
      current.tenantCode !== tenant ||
      person.customerEligibilityDecision?.invalidation?.phase !== "PENDING"
    )
      this.fail("CONFLICT");
    const request = { tenant };
    reconciliations.set(request, { tenant, person, operatorIdentity });
    try {
      return await SERVICE.DefaultKycDecisionEnforcementService.assess(
        request,
        "ONBOARDING",
        {
          subjectType: "CUSTOMER",
          subjectCode: person.loginId,
          enterpriseCode: current.enterpriseCode,
          ...(person.authenticationIdentity
            ? { identity: person.authenticationIdentity }
            : {}),
        },
      );
    } finally {
      reconciliations.delete(request);
    }
  },
  /** Requires qualified human permission, live original Employee proof, enterprise authority and exact retained Customer metadata. No public transport is created here. @param {Object} request Explicit operator command. @param {string} permission Fixed operation permission. @returns {Promise<Object>} Private inspected owner. */
  operatorCustomer: async function (request, permission) {
    this.policy();
    if (
      (CONFIG.get("profileCustomerEligibility") || {}).recoveryQualified !==
      true
    )
      this.fail();
    const m = SERVICE.DefaultEnterpriseMembershipService,
      management = SERVICE.DefaultEnterpriseManagementService;
    management.authorize(request);
    m.permission(request, permission);
    const actor = await m.actor(request);
    if (actor.identity.recordKind !== "EMPLOYEE") this.fail("FORBIDDEN");
    await m.credential(actor);
    const input = m
      .base()
      .input(request.body || {}, ["customerId", "authVersion", "changeId"]);
    m.base().input(request.query || {}, []);
    const id = m.recordId(input.customerId),
      rows = await this.inventory(request.tenant, { _id: id });
    if (rows.length !== 1) this.fail("CONFLICT");
    const person = this.customer(rows, rows[0].loginId),
      metadata = person.customerEligibilityDecision;
    if (!metadata?.current || metadata.current.tenantCode !== request.tenant)
      this.fail("CONFLICT");
    management.authorizeEnterpriseAccess(
      request,
      metadata.current.enterpriseCode,
    );
    const placement = await management.retrieveEnterpriseForAccess(
      metadata.current.enterpriseCode,
    );
    if (placement.tenantCode !== request.tenant) this.fail("FORBIDDEN");
    return { input, person, actor };
  },
  /** Projects retained fence/history-capacity status only; never returns facts, policy graphs or private source proof. Exhaustion requires reviewed configuration-bound retention governance, never truncation or a fabricated archive. @param {Object} request Human operator. @returns {Promise<Object>} Redacted status. */
  inspect: async function (request) {
    const { person } = await this.operatorCustomer(
      request,
      "profile.customerEligibility.inspect",
    );
    const metadata = person.customerEligibilityDecision;
    return {
      customerId: String(person._id),
      authVersion: person.authVersion || 1,
      phase: metadata.invalidation?.phase || "CURRENT",
      changeId: metadata.invalidation?.changeId,
      sourceKind: metadata.invalidation?.source?.kind,
      historyCount: metadata.history?.length || 0,
      maximumDecisionHistory: this.policy().maximumDecisionHistory,
      capacityExhausted:
        (metadata.history?.length || 0) >= this.policy().maximumDecisionHistory,
    };
  },
  /** Reconciles only an explicitly reviewed original retained PENDING fence with fresh policy/facts. Does not replay the original mutation, clear by age, invent approval, raise a capacity bound or evict history. @param {Object} request Human exact-CAS command. @returns {Promise<Object>} Actual current decision. */
  reconcile: async function (request) {
    const { input, person, actor } = await this.operatorCustomer(
      request,
      "profile.customerEligibility.reconcile",
    );
    if (
      !Number.isSafeInteger(input.authVersion) ||
      input.authVersion !== (person.authVersion || 1) ||
      input.changeId !==
        person.customerEligibilityDecision.invalidation?.changeId ||
      person.customerEligibilityDecision.invalidation?.phase !== "PENDING"
    )
      this.fail("CONFLICT");
    fenceAdmissions.set(person, {
      tenant: request.tenant,
      operatorIdentity: actor.identity,
    });
    try {
      return await this.assessRetainedFence(
        request.tenant,
        person,
        actor.identity,
      );
    } finally {
      fenceAdmissions.delete(person);
    }
  },
  /** Captures exact affected Customer IDs for acknowledged account/contact/consent changes, excluding this owner's writes to prevent recursive evaluation. @param {Object} request Generated Customer update. @returns {Promise<boolean>} Capture completion. */
  prepareCustomerFactsChange: async function (request) {
    if (
      writes.has(request) ||
      (CONFIG.get("profileCustomerEligibility") || {}).enabled !== true
    )
      return true;
    const paths = SERVICE.DefaultEnterpriseMembershipService.paths(
      request.model || {},
    );
    if (
      !paths.some((path) =>
        /(^|\.)(active|disabled|registrationSuspended|contacts|customerParticipation|authenticationIdentity)(\.|$)/.test(
          path,
        ),
      )
    )
      return true;
    this.policy();
    const rows = await this.inventory(request.tenant, request.query || {});
    factsChanges.set(request, {
      tenant: request.tenant,
      ids: rows
        .filter((person) => person.customerEligibilityDecision?.current)
        .map((person) =>
          SERVICE.DefaultEnterpriseMembershipService.recordId(person._id),
        ),
    });
    return true;
  },
  /** Re-evaluates captured current facts only after exact acknowledged persistence, with no Customer/Employee event recursion or asserted outcome. @param {Object} request Exact captured Customer update. @param {Object} response Pipeline wrapper. @returns {Promise<boolean>} Completion. */
  completeCustomerFactsChange: async function (request, response) {
    const change = factsChanges.get(request);
    if (!change) return true;
    try {
      const result = response?.success;
      if (
        !/^SUC_/.test(result?.code || "") ||
        result.success === false ||
        result.error ||
        (result.errors &&
          (!Array.isArray(result.errors) || result.errors.length)) ||
        result.result?.acknowledged !== true ||
        !Number.isSafeInteger(result.result.matchedCount) ||
        result.result.matchedCount < change.ids.length ||
        result.result.matchedCount < 1
      )
        this.fail("CONFLICT");
      for (const id of change.ids)
        await this.refreshCurrentDecision(change.tenant, id);
    } finally {
      factsChanges.delete(request);
    }
    return true;
  },
  /** Invalidates current Customer proofs under an exact privately captured policy operation, without touching original Employee credentials. @param {Object} request Captured operation. @param {string} phase PENDING/COMPLETE policy fence. @returns {Promise<Object[]>} Persisted records. */
  invalidateCurrentPolicyCustomers: async function (request, phase) {
    this.policy();
    const change = policyChanges.get(request),
      tenant = change?.tenant;
    if (
      !/^[A-Za-z0-9._-]{1,128}$/.test(tenant || "") ||
      !["PENDING", "COMPLETE"].includes(phase)
    )
      this.fail("FORBIDDEN");
    const customers = await this.inventory(tenant, {
      principalType: "customer",
      ...(change.customerIds ? { _id: { $in: change.customerIds } } : {}),
    });
    if (change.customerIds && customers.length !== change.customerIds.length)
      this.fail("CONFLICT");
    const results = [];
    for (const person of customers) {
      this.customer([person], person.loginId);
      const pending = person.customerEligibilityDecision?.invalidation;
      if (
        pending?.phase === "PENDING" &&
        (phase === "PENDING" || pending.changeId !== change.changeId)
      )
        this.fail("CONFLICT");
      results.push(
        await this.update(person, tenant, {
          ...person.customerEligibilityDecision,
          invalidation: {
            phase,
            changeId: change.changeId,
            reason: change.reason || "APPROVED_POLICY_CHANGE",
            ...(change.source ? { source: change.source } : {}),
            ...(change.boundaries
              ? {
                  boundaryFingerprint: change.boundaries.get(
                    String(person._id),
                  ),
                }
              : {}),
            observedAt: new Date().toISOString(),
          },
        }),
      );
    }
    return results;
  },
  /** Captures relevant existing published-version writes and invalidates before persistence; drafts and unrelated consumers do not trigger Profile work. @param {Object} request RuleSetVersion generated write. @returns {Promise<boolean>} Preparation completion. */
  preparePolicyChange: async function (request) {
    const p = CONFIG.get("profileCustomerEligibility");
    if (p?.enabled !== true) return true;
    if (policyChanges.has(request)) this.fail("CONFLICT");
    const rows = request.query
      ? await SERVICE.DefaultPrincipalSecurityStampGovernanceService.inventory(
          SERVICE.DefaultRuleSetVersionService,
          request.tenant,
          request.query,
        )
      : [];
    const models = Array.isArray(request.model)
      ? request.model
      : [request.model || {}];
    const relevant = [
      ...rows,
      ...models.map((model) => model.$set || model),
    ].some(
      (row) =>
        row.consumerModule === "profile" && row.policyType === p.policyType,
    );
    if (!relevant) return true;
    this.policy();
    if (rows.length > 100 || models.length > 100) this.fail();
    policyChanges.set(request, {
      tenant: request.tenant,
      changeId: crypto.randomUUID(),
      previousCount: rows.length,
      source: {
        kind: "RULE_SET_VERSION",
        originalSnapshotHash: this.digest(rows),
        intendedMutationHash: this.digest(
          request.model || { operation: "REMOVE" },
        ),
        sourceScopes: rows.map((row) => ({
          scopeType: row.scopeType,
          scopeCode: row.scopeCode,
          code: row.code,
          version: row.version,
        })),
      },
    });
    try {
      await this.invalidateCurrentPolicyCustomers(request, "PENDING");
    } catch (error) {
      policyChanges.delete(request);
      throw error;
    }
    return true;
  },
  /** Completes only the exact prepared policy write after an explicit successful acknowledgement; failed/interrupted operations remain fenced. @param {Object} request Exact generated write. @param {Object} response Pipeline wrapper. @returns {Promise<boolean>} Post-write completion. */
  completePolicyChange: async function (request, response) {
    const change = policyChanges.get(request);
    if (!change) return true;
    try {
      const result = response?.success;
      if (
        !/^SUC_/.test(result?.code || "") ||
        result.success === false ||
        result.error ||
        (result.errors &&
          (!Array.isArray(result.errors) || result.errors.length))
      )
        this.fail("CONFLICT");
      if (
        result.result?.matchedCount !== undefined &&
        (result.result.acknowledged !== true ||
          result.result.matchedCount !== change.previousCount ||
          change.previousCount < 1)
      )
        this.fail("CONFLICT");
      if (
        result.result?.deletedCount !== undefined &&
        (result.result.acknowledged !== true ||
          result.result.deletedCount !== change.previousCount ||
          change.previousCount < 1)
      )
        this.fail("CONFLICT");
      await this.invalidateCurrentPolicyCustomers(request, "COMPLETE");
    } finally {
      policyChanges.delete(request);
    }
    return true;
  },
  /** Rechecks existing policy fingerprints at scheduled windows; an existing governed scheduler may call this internal API, but this service creates no cron/policy records. @param {string} tenant Approved partition. @returns {Promise<number>} Invalidated Customer count. */
  invalidatePolicyBoundary: async function (tenant) {
    this.policy();
    if (!/^[A-Za-z0-9._-]{1,128}$/.test(tenant || "")) this.fail("FORBIDDEN");
    const owner = SERVICE.DefaultKycDecisionEnforcementService,
      selection = owner.policy(),
      boundaries = new Map();
    const customers = await this.inventory(tenant, {
      principalType: "customer",
    });
    for (const person of customers) {
      const metadata = person.customerEligibilityDecision,
        current = metadata?.current;
      if (!current) continue;
      if (
        metadata.invalidation?.phase === "PENDING" ||
        current.tenantCode !== tenant
      )
        this.fail("CONFLICT");
      let fingerprint;
      try {
        fingerprint = this.policyFingerprint(
          await owner.resolvePolicy(
            { tenant, enterpriseCode: current.enterpriseCode },
            selection,
            owner.owners(),
          ),
        );
      } catch {
        fingerprint = "UNAVAILABLE";
      }
      if (
        fingerprint !== current.policyFingerprint &&
        fingerprint !== metadata.invalidation?.boundaryFingerprint
      )
        boundaries.set(String(person._id), fingerprint);
    }
    if (!boundaries.size) return 0;
    const request = Object.freeze({});
    policyChanges.set(request, {
      tenant,
      changeId: crypto.randomUUID(),
      reason: "CURRENT_POLICY_BOUNDARY",
      customerIds: [...boundaries.keys()],
      boundaries,
    });
    try {
      await this.invalidateCurrentPolicyCustomers(request, "PENDING");
      await this.invalidateCurrentPolicyCustomers(request, "COMPLETE");
    } finally {
      policyChanges.delete(request);
    }
    return boundaries.size;
  },
};
