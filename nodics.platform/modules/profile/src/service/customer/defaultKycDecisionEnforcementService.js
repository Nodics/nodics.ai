/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
/**
 * @module profile/service/customer/DefaultKycDecisionEnforcementService
 * @description Consumes current published Rules policies and registered authoritative property evidence for Profile customer eligibility, without manufacturing KYC records or approvals.
 * @layer service
 * @owner profile
 * @override Later layers select reviewed policy/provider/outcome references and override exported members; preserve fresh owner reads, denial precedence, isolation and fail-closed missing evidence.
 */
const crypto = require("node:crypto");

module.exports = {
  /** Raises existing content-free Profile admission errors. @param {string} [suffix] Existing membership error suffix. @returns {never} Rejection. */
  fail: function (suffix = "UNAVAILABLE") {
    throw new CLASSES.NodicsError("ERR_PROFILE_MEMBERSHIP_" + suffix);
  },
  /** Requires reviewed selection and independent policy/evidence qualification, with no default business decisions. @returns {Object} Qualified existing-owner references. */
  policy: function () {
    const policy = CONFIG.get("profileCustomerEligibility");
    if (
      policy?.enabled !== true ||
      policy.enforcementQualified !== true ||
      policy.publishedPolicyQualified !== true ||
      policy.evidenceProviderQualified !== true ||
      [
        "policyType",
        "propertyProviderCode",
        "propertyCatalogueVersion",
        "approvalOutcomeType",
        "platformScopeCode",
      ].some(
        (key) =>
          typeof policy[key] !== "string" ||
          !/^[A-Za-z0-9._:-]{1,128}$/.test(policy[key]),
      ) ||
      (policy.domainScopeCode != null &&
        (typeof policy.domainScopeCode !== "string" ||
          !/^[A-Za-z0-9._:-]{1,128}$/.test(policy.domainScopeCode))) ||
      !Array.isArray(policy.denialOutcomeTypes) ||
      !policy.denialOutcomeTypes.length ||
      policy.denialOutcomeTypes.length > 25 ||
      policy.denialOutcomeTypes.some(
        (type) =>
          typeof type !== "string" ||
          !/^[A-Za-z0-9._:-]{1,128}$/.test(type) ||
          type === policy.approvalOutcomeType,
      ) ||
      new Set(policy.denialOutcomeTypes).size !==
        policy.denialOutcomeTypes.length
    )
      this.fail();
    return policy;
  },
  /** Inspects actual selected published Rules policy and installed owner qualifications without evaluating a subject or recording a decision. @param {Object} context Exact tenant and enterpriseCode only. @returns {Promise<boolean>} Positive true after all read-only prerequisites. @throws {CLASSES.NodicsError} Reviewed ERR_PROFILE_ELIGIBILITY_* readiness category, never raw provider evidence. @override Custom owners preserve real read-only inspection and independent qualifications; no synthetic approval or identity. */
  assertOnboardingReady: async function (context) {
    const reject = (category) => {
      throw new CLASSES.NodicsError("ERR_PROFILE_ELIGIBILITY_" + category);
    };
    if (
      !context ||
      Object.keys(context).sort().join(",") !== "enterpriseCode,tenant" ||
      ["tenant", "enterpriseCode"].some(
        (key) =>
          typeof context[key] !== "string" ||
          !/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(context[key]),
      )
    )
      reject("CONFIGURATION");
    const coordinates = Object.freeze({
      tenant: context.tenant,
      enterpriseCode: context.enterpriseCode,
    });
    let selection, owners, policy;
    try {
      selection = this.policy();
    } catch {
      reject("CONFIGURATION");
    }
    try {
      owners = this.owners();
    } catch {
      reject("COLLABORATORS");
    }
    try {
      const placement = await owners.placement.retrieveEnterpriseForAccess(
        coordinates.enterpriseCode,
      );
      if (
        placement?.enterprise?.code !== coordinates.enterpriseCode ||
        placement.enterprise.active !== true ||
        placement.tenantCode !== coordinates.tenant ||
        placement.enterprise.tenant?.code !== coordinates.tenant ||
        placement.enterprise.tenant.active !== true
      )
        reject("CONFIGURATION");
    } catch {
      reject("CONFIGURATION");
    }
    try {
      const audit = SERVICE.DefaultCustomerEligibilityDecisionGovernanceService;
      if (
        typeof audit?.policy !== "function" ||
        [
          "withObservation",
          "record",
          "withRegistrationDecision",
          "transferRegistrationDecision",
        ].some((method) => typeof audit[method] !== "function")
      )
        reject("AUDIT");
      audit.policy();
      for (const [name, methods] of Object.entries({
        DefaultCustomerService: ["get", "update"],
        DefaultPrincipalSecurityStampService: [
          "reserveVersion",
          "getKey",
          "getCacheModuleName",
        ],
        DefaultAuthenticationProviderService: ["findToken"],
        DefaultIdentityGovernanceService: ["getSystemAuthData"],
        DefaultEnterpriseMembershipService: ["recordId", "paths"],
      })) {
        if (
          methods.some(
            (method) => typeof SERVICE[name]?.[method] !== "function",
          )
        )
          reject("AUDIT");
      }
    } catch {
      reject("AUDIT");
    }
    try {
      policy = await this.resolvePolicy(coordinates, selection, owners);
    } catch {
      reject("POLICY");
    }
    try {
      const provider = owners.properties.getProvider(
        selection.propertyProviderCode,
      );
      if (
        provider?.ownerModule !== "profile" ||
        ["getCatalogue", "resolveProperty", "withContext"].some(
          (method) => typeof provider[method] !== "function",
        )
      )
        reject("REGISTRY");
      const catalogue = provider.getCatalogue(coordinates);
      if (
        catalogue?.then ||
        typeof catalogue?.code !== "string" ||
        !catalogue.code ||
        String(catalogue.version) !== selection.propertyCatalogueVersion
      )
        reject("REGISTRY");
      const types = [
        selection.approvalOutcomeType,
        ...selection.denialOutcomeTypes,
      ];
      for (const type of types) {
        const outcome = owners.outcomes.get(type);
        if (
          outcome?.ownerModule !== "profile" ||
          typeof outcome.validate !== "function"
        )
          reject("REGISTRY");
      }
      const validation = owners.validator.validateDefinition({
        definition: policy.definition,
        propertyProviderCode: selection.propertyProviderCode,
        context: coordinates,
      });
      if (
        validation?.valid !== true ||
        (validation.issues &&
          (!Array.isArray(validation.issues) || validation.issues.length))
      )
        reject("REGISTRY");
      const pending = [...policy.definition.groups];
      let inspected = 0;
      while (pending.length) {
        if (++inspected > 4096 || pending.length > 4096) reject("REGISTRY");
        const group = pending.pop();
        if (group.outcome && !types.includes(group.outcome.outcomeType))
          reject("REGISTRY");
        pending.push(...(group.childGroups || []));
      }
    } catch {
      reject("REGISTRY");
    }
    return true;
  },
  /** Resolves only installed canonical Rules/identity owners; no local fallback evaluator or persistence adapter. @returns {Object} Existing effective collaborators. */
  owners: function () {
    const owners = {
      versions: SERVICE.DefaultRuleSetVersionService,
      inventory: SERVICE.DefaultPrincipalSecurityStampGovernanceService,
      resolver: SERVICE.DefaultRulePolicyResolutionService,
      validator: SERVICE.DefaultRuleDefinitionValidationService,
      properties: SERVICE.DefaultRulePropertyCatalogueRegistryService,
      outcomes: SERVICE.DefaultRuleOutcomeRegistryService,
      evaluator: SERVICE.DefaultRuleEvaluationService,
      placement: SERVICE.DefaultEnterpriseManagementService,
    };
    for (const [name, method] of Object.entries({
      versions: "get",
      inventory: "inventory",
      resolver: "materialize",
      validator: "validateDefinition",
      properties: "getProvider",
      outcomes: "get",
      evaluator: "evaluate",
      placement: "retrieveEnterpriseForAccess",
    })) {
      if (typeof owners[name]?.[method] !== "function") this.fail();
    }
    return owners;
  },
  /** Builds isolated subject coordinates, never passing a caller body, password, proof Boolean or rule graph to property owners. @param {Object} request Profile-owned request. @param {string} action Fixed existing onboarding action. @param {Object} subject Owner-resolved coordinates. @returns {Object} Minimal current placement. */
  context: async function (request, action, subject) {
    if (
      action !== "ONBOARDING" ||
      typeof request?.tenant !== "string" ||
      !/^[A-Za-z0-9._-]{1,128}$/.test(request.tenant) ||
      subject?.subjectType !== "CUSTOMER" ||
      typeof subject.subjectCode !== "string" ||
      !subject.subjectCode ||
      subject.subjectCode.length > 320 ||
      typeof subject.enterpriseCode !== "string" ||
      !/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(subject.enterpriseCode) ||
      Object.keys(subject).some(
        (key) =>
          ![
            "subjectType",
            "subjectCode",
            "enterpriseCode",
            "identity",
          ].includes(key),
      )
    )
      this.fail("FORBIDDEN");
    const placement =
      await SERVICE.DefaultEnterpriseManagementService.retrieveEnterpriseForAccess(
        subject.enterpriseCode,
      );
    if (
      placement?.enterprise?.code !== subject.enterpriseCode ||
      placement.enterprise.active !== true ||
      placement.tenantCode !== request.tenant
    )
      this.fail("FORBIDDEN");
    let identity;
    if (subject.identity !== undefined) {
      if (
        !subject.identity ||
        Object.keys(subject.identity).length !== 3 ||
        Object.keys(subject.identity).some(
          (key) => !["tenantCode", "recordKind", "recordId"].includes(key),
        )
      )
        this.fail("FORBIDDEN");
      identity = Object.freeze(
        SERVICE.DefaultEnterpriseMembershipService.identity(subject.identity),
      );
    }
    return Object.freeze({
      tenant: request.tenant,
      action,
      subjectType: subject.subjectType,
      subjectCode: subject.subjectCode,
      enterpriseCode: subject.enterpriseCode,
      ...(identity ? { identity } : {}),
    });
  },
  /** Materializes counted uncached published versions through the existing inventory and policy owners; ambiguous scope versions, malformed windows and unsupported score policies reject. @param {Object} context Trusted subject placement. @param {Object} selection Qualified selection. @param {Object} owners Existing collaborators. @returns {Promise<Object>} Current effective Rules policy. */
  resolvePolicy: async function (context, selection, owners) {
    const versions = await owners.inventory.inventory(
      owners.versions,
      context.tenant,
      { consumerModule: "profile", policyType: selection.policyType },
    );
    const scope = {
      platformCode: selection.platformScopeCode,
      domainCode: selection.domainScopeCode,
      enterpriseCode: context.enterpriseCode,
    };
    const now = new Date(),
      active = [],
      identities = new Set(),
      scopeOwners = new Map();
    for (const version of versions) {
      if (
        version.consumerModule !== "profile" ||
        version.policyType !== selection.policyType
      )
        this.fail();
      if (!owners.resolver.scopeMatches(version, scope)) continue;
      if (
        ["effectiveFrom", "effectiveTo"].some(
          (key) =>
            version[key] != null &&
            !Number.isFinite(new Date(version[key]).getTime()),
        )
      )
        this.fail();
      if (!owners.resolver.isEffective(version, now)) continue;
      if (
        version.active !== true ||
        !Number.isSafeInteger(version.version) ||
        version.version < 1 ||
        typeof version.code !== "string" ||
        typeof version.ruleSetCode !== "string" ||
        !/^[a-f0-9]{64}$/.test(version.checksum || "") ||
        version.propertyProviderCode !== selection.propertyProviderCode ||
        String(version.propertyCatalogueVersion) !==
          selection.propertyCatalogueVersion ||
        version.scoreBandSetCode ||
        version.scoreBandSetVersion
      )
        this.fail();
      const key = JSON.stringify([
        version.scopeType,
        version.scopeCode,
        version.version,
      ]);
      const scopeKey = JSON.stringify([version.scopeType, version.scopeCode]);
      if (
        identities.has(key) ||
        (scopeOwners.has(scopeKey) &&
          scopeOwners.get(scopeKey) !== version.ruleSetCode)
      )
        this.fail();
      identities.add(key);
      scopeOwners.set(scopeKey, version.ruleSetCode);
      active.push(version);
    }
    if (!active.length) this.fail();
    const effective = owners.resolver.materialize(active, scope, now);
    if (
      effective.propertyProviderCode !== selection.propertyProviderCode ||
      String(effective.propertyCatalogueVersion) !==
        selection.propertyCatalogueVersion ||
      effective.scoreBandSetCode ||
      effective.scoreBandSetVersion
    )
      this.fail();
    return effective;
  },
  /** Interprets only explicitly selected registered outcomes; denial wins and no matched approval denies. @param {Object} evidence Existing evaluator result. @param {Object} selection Reviewed consumer outcome mapping. @returns {boolean} Current approval. */
  approved: function (evidence, selection) {
    if (
      !Array.isArray(evidence?.outcomes) ||
      !/^[a-f0-9]{64}$/.test(evidence.sourceHash || "")
    )
      this.fail();
    const types = evidence.outcomes.map((entry) => entry?.outcome?.outcomeType);
    if (
      types.some(
        (type) =>
          type !== selection.approvalOutcomeType &&
          !selection.denialOutcomeTypes.includes(type),
      )
    )
      this.fail();
    return (
      types.includes(selection.approvalOutcomeType) &&
      !types.some((type) => selection.denialOutcomeTypes.includes(type))
    );
  },
  /** Evaluates real published policy with registered property semantics; returns a bounded subject/policy/evaluation reference, not a fabricated persisted KYC decision. @param {Object} request Trusted Profile request. @param {string} action Existing ONBOARDING action. @param {Object} subject Owner-resolved subject. @returns {Promise<Object>} Current admission decision. */
  assess: async function (request, action, subject) {
    try {
      const selection = this.policy(),
        owners = this.owners();
      const context = await this.context(request, action, subject);
      const governance =
        SERVICE.DefaultCustomerEligibilityDecisionGovernanceService;
      if (
        typeof governance?.withObservation !== "function" ||
        typeof governance.record !== "function"
      )
        this.fail();
      return await governance.withObservation(
        context,
        async (observation) => {
          const policy = await this.resolvePolicy(context, selection, owners);
          const provider = owners.properties.getProvider(
            selection.propertyProviderCode,
          );
          if (
            provider.ownerModule !== "profile" ||
            typeof provider.getCatalogue !== "function" ||
            typeof provider.resolveProperty !== "function" ||
            typeof provider.withContext !== "function"
          )
            this.fail();
          return await provider.withContext(context, async (input) =>
            this.evaluatePolicy(
              input,
              selection,
              owners,
              policy,
              provider,
              observation,
            ),
          );
        },
        request,
      );
    } catch (error) {
      if (
        [
          "ERR_PROFILE_MEMBERSHIP_UNAVAILABLE",
          "ERR_PROFILE_MEMBERSHIP_FORBIDDEN",
        ].includes(error?.code)
      )
        throw error;
      this.fail();
    }
  },
  /** Admits only actual audited ALLOW; internal assess retains real DENY evidence without turning it into a public successful registration. @param {Object} request Trusted Profile request. @param {string} action Existing onboarding action. @param {Object} subject Owner coordinates. @returns {Promise<Object>} Minimal affirmative decision. */
  enforce: async function (request, action, subject) {
    const decision = await this.assess(request, action, subject);
    if (decision?.eligible !== true) this.fail("FORBIDDEN");
    return decision;
  },
  /** Evaluates only within the registered provider's fresh private snapshot lifetime. @param {Object} context Exact provider-admitted context. @param {Object} selection Reviewed selection. @param {Object} owners Rules owners. @param {Object} policy Published effective policy. @param {Object} provider Registered property owner. @returns {Promise<Object>} Minimal decision. */
  evaluatePolicy: async function (
    context,
    selection,
    owners,
    policy,
    provider,
    observation,
  ) {
    const catalogue = provider.getCatalogue(context);
    if (
      catalogue?.then ||
      typeof catalogue?.code !== "string" ||
      String(catalogue.version) !== selection.propertyCatalogueVersion
    )
      this.fail();
    for (const type of [
      selection.approvalOutcomeType,
      ...selection.denialOutcomeTypes,
    ]) {
      const definition = owners.outcomes.get(type);
      if (
        definition?.ownerModule !== "profile" ||
        typeof definition.validate !== "function"
      )
        this.fail();
    }
    const validation = owners.validator.validateDefinition({
      definition: policy.definition,
      propertyProviderCode: selection.propertyProviderCode,
      context,
    });
    if (
      validation?.valid !== true ||
      (validation.issues &&
        (!Array.isArray(validation.issues) || validation.issues.length))
    )
      this.fail();
    const evidence = await owners.evaluator.evaluate({
      ruleSet: {
        code: policy.ruleSetCode,
        version: policy.version,
        groups: policy.definition.groups,
      },
      propertyProviderCode: selection.propertyProviderCode,
      propertyCatalogueCode: catalogue.code,
      propertyCatalogueVersion: catalogue.version,
      input: context,
    });
    const approved = this.approved(evidence, selection);
    const decisionId =
      "KYC_" +
      crypto
        .createHash("sha256")
        .update(
          JSON.stringify({
            context,
            scopes: policy.sourceScopes,
            catalogue: [catalogue.code, catalogue.version],
            sourceHash: evidence.sourceHash,
          }),
        )
        .digest("hex");
    const governance =
      SERVICE.DefaultCustomerEligibilityDecisionGovernanceService;
    const result = await governance.record(observation, {
      decisionId,
      outcome: approved ? "ALLOW" : "DENY",
      policyType: selection.policyType,
      propertyProviderCode: selection.propertyProviderCode,
      catalogueCode: catalogue.code,
      catalogueVersion: String(catalogue.version),
      sourceHash: evidence.sourceHash,
      sourceScopes: policy.sourceScopes,
      policyFingerprint: governance.policyFingerprint(policy),
    });
    if (result?.eligible !== approved) this.fail();
    return result;
  },
};
