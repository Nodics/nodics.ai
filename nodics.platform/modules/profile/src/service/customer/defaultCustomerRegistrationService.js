/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nodics.platform/modules/profile/src/service/customer/defaultCustomerRegistrationService
 * @description Implements profile default customer registration service business behavior and extension logic.
 * @layer service
 * @owner profile
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
const participationWrites = new WeakSet();
const importPlacementRequests = new WeakMap();
module.exports = {
  /** Reads fresh active placement for the explicit Customer import target, never inferring an enterprise from its tenant. @param {Object} metadata Governed operation metadata. @returns {Promise<Object>} Existing Enterprise/Tenant owner result. */
  readImportRegistrationPlacement: async function (metadata) {
    if (
      metadata?.moduleName !== "profile" ||
      metadata.schemaName !== "customer" ||
      metadata.operation !== "signUpAll" ||
      ["tenant", "enterpriseCode"].some(
        (key) =>
          typeof metadata[key] !== "string" ||
          !/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(metadata[key]),
      )
    )
      throw new CLASSES.NodicsError("ERR_PROFILE_MEMBERSHIP_FORBIDDEN");
    const owner = SERVICE.DefaultEnterpriseManagementService;
    if (typeof owner?.retrieveEnterpriseForAccess !== "function")
      throw new CLASSES.NodicsError("ERR_PROFILE_MEMBERSHIP_UNAVAILABLE");
    const placement = await owner.retrieveEnterpriseForAccess(
      metadata.enterpriseCode,
    );
    if (
      placement?.enterprise?.code !== metadata.enterpriseCode ||
      placement.enterprise.active !== true ||
      placement.tenantCode !== metadata.tenant ||
      placement.enterprise.tenant?.code !== metadata.tenant ||
      placement.enterprise.tenant.active !== true
    )
      throw new CLASSES.NodicsError("ERR_PROFILE_MEMBERSHIP_FORBIDDEN");
    return placement;
  },
  /** Admits explicit active Customer signup placement only after configured eligibility-owner read-only readiness; unrelated Profile operations retain their existing admission. @param {Object} metadata Immutable release-header target selection. @returns {Promise<boolean>} Positive true only after placement and readiness validation. */
  validateImportTarget: async function (metadata) {
    if (
      metadata?.moduleName === "profile" &&
      metadata.schemaName === "customer" &&
      metadata.operation === "signUpAll"
    ) {
      await this.readImportRegistrationPlacement(metadata);
      const name = (CONFIG.get("profileCustomerParticipation") || {})
        .eligibilityService;
      const owner =
        typeof name === "string" &&
        /^Default[A-Za-z0-9]+Service$/.test(name) &&
        SERVICE[name];
      if (
        typeof owner?.enforce !== "function" ||
        typeof owner.assertOnboardingReady !== "function"
      )
        throw new CLASSES.NodicsError("ERR_PROFILE_ELIGIBILITY_OWNER");
      let ready;
      try {
        ready = await owner.assertOnboardingReady(
          Object.freeze({
            tenant: metadata.tenant,
            enterpriseCode: metadata.enterpriseCode,
          }),
        );
      } catch (error) {
        const reviewed = [
          "OWNER",
          "CONFIGURATION",
          "COLLABORATORS",
          "POLICY",
          "REGISTRY",
          "AUDIT",
        ].map((category) => "ERR_PROFILE_ELIGIBILITY_" + category);
        if (reviewed.includes(error?.code))
          throw new CLASSES.NodicsError(error.code);
        throw new CLASSES.NodicsError("ERR_PROFILE_ELIGIBILITY_OWNER");
      }
      if (ready !== true)
        throw new CLASSES.NodicsError("ERR_PROFILE_ELIGIBILITY_OWNER");
    }
    return true;
  },
  /** Reads only the selected nImport owner's exact live request admission; no request/body marker acquires placement. @param {Object} request Exact schema-service request. @returns {Object|undefined} Frozen admitted operation metadata. */
  admittedImportPlacement: function (request) {
    const name = (CONFIG.get("identityGovernance") || {}).customerRegistration
      ?.importPlacement?.metadataOwnerService;
    if (name === undefined) return undefined;
    if (typeof name !== "string" || !/^Default[A-Za-z0-9]+Service$/.test(name))
      throw new CLASSES.NodicsError("ERR_PROFILE_MEMBERSHIP_UNAVAILABLE");
    const owner = SERVICE[name];
    if (typeof owner?.readAdmittedOperationMetadata !== "function")
      return undefined;
    const metadata = owner.readAdmittedOperationMetadata(request);
    if (metadata === undefined) return undefined;
    if (
      !metadata ||
      !Object.isFrozen(metadata) ||
      Object.keys(metadata).sort().join(",") !==
        "enterpriseCode,moduleName,operation,schemaName,tenant"
    )
      throw new CLASSES.NodicsError("ERR_PROFILE_MEMBERSHIP_FORBIDDEN");
    return metadata;
  },
  /** Revalidates admitted import placement, including the live parent of privately bound record requests; public registration keeps its trusted mapper. @param {Object} request Original or privately bound child request. @returns {Promise<Object>} Explicit tenant and enterpriseCode coordinates. */
  resolveRegistrationPlacement: async function (request) {
    const binding = importPlacementRequests.get(request);
    const metadata = this.admittedImportPlacement(
      binding ? binding.parent : request,
    );
    if (
      binding &&
      (!metadata ||
        Object.keys(binding.metadata).some(
          (key) => metadata[key] !== binding.metadata[key],
        ))
    )
      throw new CLASSES.NodicsError("ERR_PROFILE_MEMBERSHIP_FORBIDDEN");
    if (metadata) {
      if (metadata.tenant !== request.tenant)
        throw new CLASSES.NodicsError("ERR_PROFILE_MEMBERSHIP_FORBIDDEN");
      await this.readImportRegistrationPlacement(metadata);
      return {
        tenant: metadata.tenant,
        enterpriseCode: metadata.enterpriseCode,
      };
    }
    const enterpriseCode =
      request.enterprise?.code || request.authData?.entCode;
    if (!enterpriseCode)
      throw new CLASSES.NodicsError("ERR_PROFILE_MEMBERSHIP_FORBIDDEN");
    return { tenant: request.tenant, enterpriseCode };
  },
  /** Pins import provenance for an awaited batch so admission loss cannot fall back to actor placement; cleanup never survives completion or failure. @param {Object} request Exact batch request. @param {Function} operation Awaited batch callback. @returns {Promise<*>} Original result. */
  withRegistrationBatchPlacement: async function (request, operation) {
    if (importPlacementRequests.has(request) || typeof operation !== "function")
      throw new CLASSES.NodicsError("ERR_PROFILE_MEMBERSHIP_FORBIDDEN");
    const metadata = this.admittedImportPlacement(request);
    if (metadata)
      importPlacementRequests.set(request, { parent: request, metadata });
    try {
      await this.resolveRegistrationPlacement(request);
      return await operation();
    } finally {
      importPlacementRequests.delete(request);
    }
  },
  /** Binds one child to the exact live admitted batch only for its awaited registration; copying a child never copies admission. @param {Object} parent Exact schema-service request. @param {Object} child Per-record pipeline request. @param {Function} operation Awaited registration callback. @returns {Promise<*>} Original operation result. */
  withRegistrationPlacement: async function (parent, child, operation) {
    if (
      !child ||
      child === parent ||
      importPlacementRequests.has(child) ||
      typeof operation !== "function"
    )
      throw new CLASSES.NodicsError("ERR_PROFILE_MEMBERSHIP_FORBIDDEN");
    await this.resolveRegistrationPlacement(parent);
    const metadata = this.admittedImportPlacement(parent);
    if (metadata) importPlacementRequests.set(child, { parent, metadata });
    try {
      const placement = await this.resolveRegistrationPlacement(child);
      if (placement.tenant !== parent.tenant)
        throw new CLASSES.NodicsError("ERR_PROFILE_MEMBERSHIP_FORBIDDEN");
      return await operation(child);
    } finally {
      importPlacementRequests.delete(child);
    }
  },
  /** Prepares customer-only context from existing explicit consent; never creates participation during a session switch. @param {Object} request Current Employee PASSWORD actor and reviewed revision. @returns {Promise<Object>} Private issuer input. */
  prepareParticipationSession: async function (request) {
    const p = this.participationPolicy(),
      m = SERVICE.DefaultEnterpriseMembershipService;
    if (p.browserContextQualified !== true) m.fail("UNAVAILABLE");
    const input = m.base().input(request.body || {}, ["revision"]);
    m.base().input(request.httpRequest?.query || request.query || {}, []);
    if (
      Object.keys(input).join(",") !== "revision" ||
      !Number.isSafeInteger(input.revision) ||
      input.revision < 1 ||
      request.authData?.principalType !== "human" ||
      request.authData.authenticationMethod !== "PASSWORD"
    )
      m.fail("FORBIDDEN");
    const anchor = await m.actor(request);
    await m.credential(anchor);
    if (anchor.identity.recordKind !== "EMPLOYEE") m.fail("IDENTITY");
    const target =
      await SERVICE.DefaultEnterpriseManagementService.retrieveEnterpriseForAccess(
        request.authData.entCode,
      );
    if (target.tenantCode !== request.tenant) m.fail("IDENTITY");
    const code =
      "CUSTOMER_PARTICIPATION_" +
      m.digest([anchor.identity, target.enterprise.code]).slice(0, 32);
    const person = await m.read("DefaultCustomerService", target.tenantCode, {
      code,
    });
    if (person?.customerParticipation?.revision !== input.revision)
      m.fail("CONFLICT");
    await this.enforceParticipationEligibility(request, anchor, target);
    const context = await this.participationContext(person, {
      ...target.enterprise,
      tenant: { code: target.tenantCode },
    });
    if (m.digest(context.anchor.identity) !== m.digest(anchor.identity))
      m.fail("IDENTITY");
    return {
      context,
      enterprise: target.enterprise,
      tenantCode: target.tenantCode,
    };
  },
  /** Renews or withdraws one own participation under exact current revision; histories and credentials are untouched. @param {Object} request Original Employee proof and bounded consent command. @param {string} operation Fixed RENEW/WITHDRAW owner action. @returns {Promise<Object>} Redacted current consent state. */
  changeParticipation: async function (request, operation) {
    const m = SERVICE.DefaultEnterpriseMembershipService,
      p = CONFIG.get("profileCustomerParticipation") || {};
    if (
      p.enabled !== true ||
      p.qualified !== true ||
      p.lifecycleQualified !== true ||
      !["RENEW", "WITHDRAW"].includes(operation)
    )
      m.fail("UNAVAILABLE");
    const keys =
      operation === "RENEW"
        ? ["revision", "termsVersion", "termsDigest", "accepted"]
        : ["revision", "confirmed"];
    const input = m.base().input(request.body || {}, keys);
    m.base().input(request.query || {}, []);
    if (
      Object.keys(input).sort().join(",") !== keys.sort().join(",") ||
      !Number.isSafeInteger(input.revision) ||
      input.revision < 1 ||
      input.revision >= 2147483647 ||
      request.authData?.principalType !== "human" ||
      request.authData.authenticationMethod !== "PASSWORD"
    )
      m.fail("FORBIDDEN");
    const anchor = await m.actor(request);
    if (anchor.identity.recordKind !== "EMPLOYEE") m.fail("IDENTITY");
    const target =
      await SERVICE.DefaultEnterpriseManagementService.retrieveEnterpriseForAccess(
        request.authData.entCode,
      );
    if (target.tenantCode !== request.tenant) m.fail("IDENTITY");
    const code =
      "CUSTOMER_PARTICIPATION_" +
      m.digest([anchor.identity, target.enterprise.code]).slice(0, 32);
    const person = await m.read("DefaultCustomerService", target.tenantCode, {
      code,
    });
    const prior = person?.customerParticipation;
    if (
      !person ||
      !person._id ||
      person.active !== true ||
      person.password ||
      person.apiKey ||
      person.apiKeyHash ||
      m.digest(person.authenticationIdentity) !== m.digest(anchor.identity) ||
      prior?.enterpriseCode !== target.enterprise.code ||
      prior.phase !== "COMPLETE" ||
      prior.revision !== input.revision
    )
      m.fail("CONFLICT");
    let next;
    if (operation === "RENEW") {
      const policy = this.participationPolicy();
      if (
        input.accepted !== true ||
        input.termsVersion !== policy.terms.version ||
        input.termsDigest !== policy.terms.digest
      )
        m.fail("FORBIDDEN");
      const eligibility = await this.enforceParticipationEligibility(
        request,
        anchor,
        target,
      );
      if (
        !Number.isSafeInteger(p.maximumConsentHistory) ||
        p.maximumConsentHistory < 1 ||
        p.maximumConsentHistory > 1000 ||
        (prior.history !== undefined && !Array.isArray(prior.history)) ||
        (prior.history || []).length >= p.maximumConsentHistory
      )
        m.fail("CONFLICT");
      next = {
        ...prior,
        revision: prior.revision + 1,
        history: [
          ...(prior.history || []),
          {
            revision: prior.revision,
            version: prior.termsVersion,
            digest: prior.termsDigest,
            documentCode: prior.termsDocumentCode,
            acceptedAt: prior.acceptedAt,
            eligibilityDecisionId: prior.eligibilityDecisionId,
          },
        ],
        termsVersion: policy.terms.version,
        termsDigest: policy.terms.digest,
        termsDocumentCode: policy.terms.documentCode,
        acceptedAt: new Date().toISOString(),
        eligibilityDecisionId: eligibility.decisionId,
      };
    } else {
      if (input.confirmed !== true) m.fail("FORBIDDEN");
      next = {
        ...prior,
        phase: "WITHDRAWN",
        revision: prior.revision + 1,
        withdrawnAt: new Date().toISOString(),
      };
    }
    const command = {
      tenant: target.tenantCode,
      authData: SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
      query: {
        code,
        _id: person._id,
        active: true,
        "customerParticipation.phase": "COMPLETE",
        "customerParticipation.revision": prior.revision,
      },
      model: { $set: { customerParticipation: next } },
      options: { recursive: false },
    };
    const response = await this.participationWrite("update", command);
    m.base().assertWrite(response);
    if (
      response.result?.acknowledged !== true ||
      response.result?.matchedCount !== 1
    )
      m.fail("CONFLICT");
    const saved = await m.read("DefaultCustomerService", target.tenantCode, {
      code,
    });
    if (m.digest(saved?.customerParticipation) !== m.digest(next))
      m.fail("STORAGE");
    await SERVICE.DefaultPrincipalSecurityStampService.register(
      target.tenantCode,
      "participation:CUSTOMER:" + String(person._id),
      next.revision,
    );
    return {
      code,
      enterpriseCode: target.enterprise.code,
      revision: next.revision,
      phase: next.phase,
      accepted: next.phase === "COMPLETE",
    };
  },
  /** Executes one fixed generated Customer mutation with transient exact private consent admission; no body flag or retained request grants later authority. @param {string} operation Fixed save/update operation. @param {Object} command Owner-built generated request. @returns {Promise<Object>} Canonical generated acknowledgement. */
  participationWrite: async function (operation, command) {
    if (
      !["save", "update"].includes(operation) ||
      participationWrites.has(command)
    )
      SERVICE.DefaultEnterpriseMembershipService.fail("FORBIDDEN");
    participationWrites.add(command);
    try {
      return await SERVICE.DefaultCustomerService[operation](command);
    } finally {
      participationWrites.delete(command);
    }
  },
  /** Validates the exact plain-text document that consent claims identify. @param {Object} policy Qualified participation settings. @returns {void} Stable document. */
  validateParticipationTerms: function (policy) {
    const terms = policy.terms,
      m = SERVICE.DefaultEnterpriseMembershipService;
    if (
      typeof terms?.content !== "string" ||
      !terms.content ||
      terms.content.length > 100000 ||
      typeof terms.title !== "string" ||
      !terms.title ||
      terms.title.length > 192 ||
      require("node:crypto")
        .createHash("sha256")
        .update(terms.content)
        .digest("hex") !== terms.digest
    )
      m.fail("UNAVAILABLE");
  },
  /** Exposes exact qualified terms to the current original Employee; never grants customer access. @param {Object} request Signed person with no selectors. @returns {Promise<Object>} Inert terms and presentation. */
  participationWorkspace: async function (request) {
    const p = this.participationPolicy(),
      m = SERVICE.DefaultEnterpriseMembershipService;
    m.base().input(request.body || {}, []);
    m.base().input(request.query || {}, []);
    if (
      request.authData?.principalType !== "human" ||
      request.authData.authenticationMethod !== "PASSWORD"
    )
      m.fail("FORBIDDEN");
    const anchor = await m.actor(request);
    if (anchor.identity.recordKind !== "EMPLOYEE") m.fail("IDENTITY");
    this.validateParticipationTerms(p);
    const target =
      await SERVICE.DefaultEnterpriseManagementService.retrieveEnterpriseForAccess(
        request.authData.entCode,
      );
    if (target.tenantCode !== request.tenant) m.fail("IDENTITY");
    const code =
      "CUSTOMER_PARTICIPATION_" +
      m.digest([anchor.identity, target.enterprise.code]).slice(0, 32);
    const existing = await m.read("DefaultCustomerService", target.tenantCode, {
      code,
    });
    let participation = null;
    if (existing) {
      const consent = existing.customerParticipation;
      if (
        m.digest(existing.authenticationIdentity) !==
          m.digest(anchor.identity) ||
        consent?.enterpriseCode !== target.enterprise.code ||
        !["COMPLETE", "WITHDRAWN"].includes(consent.phase) ||
        !Number.isSafeInteger(consent.revision) ||
        consent.revision < 1
      )
        m.fail("CONFLICT");
      participation = {
        phase: consent.phase,
        revision: consent.revision,
        currentTerms: this.hasCurrentParticipationTerms(
          existing,
          target.enterprise.code,
          p,
        ),
        canSwitch: false,
      };
      if (participation.currentTerms && p.browserContextQualified === true) {
        try {
          const prepared = await this.prepareParticipationSession({
            ...request,
            body: { revision: consent.revision },
            query: {},
          });
          // Inspection issues no token and consumes no refresh; reject drift during deferred qualification.
          const current = await m.read(
            "DefaultCustomerService",
            target.tenantCode,
            { code },
          );
          participation.currentTerms = this.hasCurrentParticipationTerms(
            current,
            target.enterprise.code,
            p,
          );
          participation.canSwitch =
            participation.currentTerms &&
            m.digest(current.authenticationIdentity) ===
              m.digest(anchor.identity) &&
            m.digest(current.customerParticipation) === m.digest(consent) &&
            prepared.tenantCode === target.tenantCode &&
            prepared.context?.sessionContext?.version ===
              current.customerParticipation.revision &&
            m.digest(prepared.context?.anchor?.identity) ===
              m.digest(anchor.identity);
          if (current?.customerParticipation) {
            participation.phase = current.customerParticipation.phase;
            participation.revision = current.customerParticipation.revision;
          }
        } catch {
          participation.canSwitch = false;
          const current = await m.read(
            "DefaultCustomerService",
            target.tenantCode,
            { code },
          );
          participation.currentTerms =
            this.hasCurrentParticipationTerms(
              current,
              target.enterprise.code,
              p,
            ) &&
            m.digest(current?.authenticationIdentity) ===
              m.digest(anchor.identity);
          if (current?.customerParticipation) {
            participation.phase = current.customerParticipation.phase;
            participation.revision = current.customerParticipation.revision;
          }
        }
      }
    }
    return {
      contractVersion: 1,
      owner: "profile",
      enterpriseCode: request.authData.entCode,
      participation,
      lifecycleQualified: p.lifecycleQualified === true,
      terms: {
        version: p.terms.version,
        digest: p.terms.digest,
        documentCode: p.terms.documentCode,
        title: p.terms.title,
        content: p.terms.content,
      },
      presentation: p.presentation,
    };
  },
  /** Reports current explicit consent from an active projection, never inferring acceptance from phase or renewing it. @param {Object} person Current generated Customer. @param {string} enterpriseCode Placement. @param {Object} policy Validated current terms. @returns {boolean} Retained current consent. */
  hasCurrentParticipationTerms: function (person, enterpriseCode, policy) {
    const consent = person?.customerParticipation;
    return Boolean(
      person?.active === true &&
      person.principalType === "customer" &&
      person.disabled !== true &&
      person.registrationSuspended !== true &&
      consent?.phase === "COMPLETE" &&
      consent.enterpriseCode === enterpriseCode &&
      Number.isSafeInteger(consent.revision) &&
      consent.revision > 0 &&
      consent.termsVersion === policy.terms.version &&
      consent.termsDigest === policy.terms.digest &&
      consent.termsDocumentCode === policy.terms.documentCode &&
      typeof consent.acceptedAt === "string" &&
      Number.isFinite(Date.parse(consent.acceptedAt)) &&
      Date.parse(consent.acceptedAt) <= Date.now() &&
      typeof consent.eligibilityDecisionId === "string" &&
      /^[A-Za-z0-9._:-]{1,192}$/.test(consent.eligibilityDecisionId),
    );
  },
  /** Uses the configured existing eligibility owner; absence or non-explicit approval fails closed. @param {Object} request Signed participant. @param {Object} anchor Original account. @param {Object} target Enterprise placement. @returns {Promise<Object>} Approved decision reference. */
  enforceParticipationEligibility: async function (request, anchor, target) {
    this.participationPolicy();
    return this.enforceCustomerEligibility(request, {
      subjectType: "CUSTOMER",
      subjectCode: anchor.person.loginId,
      enterpriseCode: target.enterprise.code,
      identity: anchor.identity,
    });
  },
  /** Calls the selected authoritative onboarding decision owner; absence, denial and malformed decisions never authorize persistence. @param {Object} request Trusted Profile request. @param {Object} subject Owner-resolved customer and enterprise coordinates. @returns {Promise<Object>} Explicit affirmative decision with bounded retained reference. */
  enforceCustomerEligibility: async function (request, subject) {
    const name = (CONFIG.get("profileCustomerParticipation") || {})
      .eligibilityService;
    if (
      typeof name !== "string" ||
      !/^Default[A-Za-z0-9]+Service$/.test(name) ||
      typeof SERVICE[name]?.enforce !== "function"
    )
      throw new CLASSES.NodicsError("ERR_PROFILE_MEMBERSHIP_UNAVAILABLE");
    if (
      subject?.subjectType !== "CUSTOMER" ||
      typeof subject.subjectCode !== "string" ||
      !subject.subjectCode ||
      subject.subjectCode.length > 320 ||
      typeof subject.enterpriseCode !== "string" ||
      !/^[A-Za-z0-9._-]{1,128}$/.test(subject.enterpriseCode)
    )
      throw new CLASSES.NodicsError("ERR_PROFILE_MEMBERSHIP_FORBIDDEN");
    const placement =
      await SERVICE.DefaultEnterpriseManagementService.retrieveEnterpriseForAccess(
        subject.enterpriseCode,
      );
    if (
      placement?.enterprise?.code !== subject.enterpriseCode ||
      placement.enterprise.active !== true ||
      placement.tenantCode !== request.tenant
    )
      throw new CLASSES.NodicsError("ERR_PROFILE_MEMBERSHIP_FORBIDDEN");
    const decision = await SERVICE[name].enforce(
      {
        tenant: request.tenant,
        authData: request.authData,
        correlationId: request.correlationId,
      },
      "ONBOARDING",
      { ...subject },
    );
    if (
      decision?.eligible !== true ||
      decision.success === false ||
      decision.error ||
      (decision.errors &&
        (!Array.isArray(decision.errors) || decision.errors.length)) ||
      typeof decision.decisionId !== "string" ||
      !/^[A-Za-z0-9._:-]{1,192}$/.test(decision.decisionId)
    )
      throw new CLASSES.NodicsError("ERR_PROFILE_MEMBERSHIP_FORBIDDEN");
    const projected = { eligible: true, decisionId: decision.decisionId };
    return SERVICE.DefaultCustomerEligibilityDecisionGovernanceService
      ?.transferRegistrationDecision
      ? SERVICE.DefaultCustomerEligibilityDecisionGovernanceService.transferRegistrationDecision(
          decision,
          projected,
        )
      : projected;
  },
  /** Resolves one fresh original native Customer and current eligibility for a trusted issuer/validator, never authenticating unsigned claims. @param {Object} session Owner-built or already verified subject coordinates. @returns {Promise<Object>} Private original Customer anchor. */
  customerEligibilityAnchor: async function (session) {
    if (
      session?.type !== "Customer" ||
      session.principalType !== "customer" ||
      session.isSystem ||
      []
        .concat(session.userGroups || [], session.allUserGroupCodes || [])
        .includes("serviceAccountUserGroup") ||
      typeof session.tenant !== "string" ||
      !/^[A-Za-z0-9._-]{1,128}$/.test(session.tenant) ||
      typeof session.loginId !== "string" ||
      !session.loginId ||
      session.loginId.length > 320 ||
      !Number.isSafeInteger(session.authVersion) ||
      session.authVersion < 1
    )
      throw new CLASSES.NodicsError("ERR_PROFILE_MEMBERSHIP_FORBIDDEN");
    if (
      typeof SERVICE.DefaultPrincipalSecurityStampGovernanceService
        ?.inventory !== "function" ||
      typeof SERVICE.DefaultCustomerService?.get !== "function"
    )
      throw new CLASSES.NodicsError("ERR_PROFILE_MEMBERSHIP_UNAVAILABLE");
    const people =
      await SERVICE.DefaultPrincipalSecurityStampGovernanceService.inventory(
        SERVICE.DefaultCustomerService,
        session.tenant,
        {
          loginId: session.loginId,
          identityLinkRetirement: { $exists: false },
        },
      );
    if (
      people.length !== 1 ||
      people[0].loginId !== session.loginId ||
      people[0].principalType !== "customer" ||
      people[0].active !== true ||
      people[0].disabled === true ||
      people[0].registrationSuspended === true ||
      people[0].authenticationIdentity ||
      people[0].customerParticipation ||
      !people[0]._id ||
      typeof people[0].code !== "string" ||
      !/^[A-Za-z0-9_.:-]{1,192}$/.test(people[0].code) ||
      (people[0].authVersion || 1) !== session.authVersion
    )
      throw new CLASSES.NodicsError("ERR_PROFILE_MEMBERSHIP_FORBIDDEN");
    const anchor = {
      identity: {
        tenantCode: session.tenant,
        recordKind: "CUSTOMER",
        recordId: SERVICE.DefaultEnterpriseMembershipService.recordId(
          people[0]._id,
        ),
      },
      person: people[0],
    };
    await this.validateNativeCustomerCredentialState(anchor);
    const decision = await this.enforceCustomerEligibility(
      { tenant: session.tenant },
      {
        subjectType: "CUSTOMER",
        subjectCode: people[0].loginId,
        enterpriseCode: session.entCode,
      },
    );
    const governance =
      SERVICE.DefaultCustomerEligibilityDecisionGovernanceService;
    let current;
    if (typeof governance?.nativeAuditAnchor === "function")
      current = await governance.nativeAuditAnchor(anchor, decision);
    else {
      const records =
        await SERVICE.DefaultPrincipalSecurityStampGovernanceService.inventory(
          SERVICE.DefaultCustomerService,
          session.tenant,
          { _id: people[0]._id, identityLinkRetirement: { $exists: false } },
        );
      if (
        records.length !== 1 ||
        SERVICE.DefaultEnterpriseMembershipService.recordId(records[0]._id) !==
          anchor.identity.recordId ||
        records[0].loginId !== people[0].loginId ||
        records[0].code !== people[0].code ||
        records[0].principalType !== "customer" ||
        records[0].active !== true ||
        records[0].disabled === true ||
        records[0].registrationSuspended === true ||
        records[0].authenticationIdentity ||
        records[0].customerParticipation ||
        (records[0].authVersion || 1) !== session.authVersion
      )
        throw new CLASSES.NodicsError("ERR_PROFILE_MEMBERSHIP_FORBIDDEN");
      current = { identity: anchor.identity, person: records[0] };
    }
    if ((current.person.authVersion || 1) !== (anchor.person.authVersion || 1))
      await this.validateNativeCustomerCredentialState(current);
    return current;
  },
  /** Rechecks original native Password and lockout through complete uncached generated owners on each issuance/refresh/access validation; never authenticates or returns a hash. @param {Object} anchor Fresh original Customer. @returns {Promise<boolean>} Current credential/state admission. */
  validateNativeCustomerCredentialState: async function (anchor) {
    const inventory = SERVICE.DefaultPrincipalSecurityStampGovernanceService,
      m = SERVICE.DefaultEnterpriseMembershipService;
    if (
      typeof inventory?.inventory !== "function" ||
      typeof SERVICE.DefaultPasswordService?.get !== "function" ||
      typeof SERVICE.DefaultUserStateService?.get !== "function"
    )
      throw new CLASSES.NodicsError("ERR_PROFILE_MEMBERSHIP_UNAVAILABLE");
    const reference =
      anchor.person.password &&
      (anchor.person.password._id || anchor.person.password);
    if (!reference)
      throw new CLASSES.NodicsError("ERR_PROFILE_MEMBERSHIP_FORBIDDEN");
    const id = m.recordId(reference);
    const passwords = await inventory.inventory(
      SERVICE.DefaultPasswordService,
      anchor.identity.tenantCode,
      { _id: id, identityLinkRetirement: { $exists: false } },
    );
    if (
      passwords.length !== 1 ||
      m.recordId(passwords[0]._id) !== id ||
      passwords[0].active !== true ||
      passwords[0].loginId !== anchor.person.loginId ||
      typeof passwords[0].password !== "string" ||
      !passwords[0].password ||
      (passwords[0].provider && passwords[0].provider !== "PASSWORD")
    )
      throw new CLASSES.NodicsError("ERR_PROFILE_MEMBERSHIP_FORBIDDEN");
    const states = await inventory.inventory(
      SERVICE.DefaultUserStateService,
      anchor.identity.tenantCode,
      {
        $and: [
          { loginId: anchor.person.loginId },
          { personId: anchor.person._id },
        ],
      },
    );
    if (
      states.length > 1 ||
      (states.length === 1 &&
        (states[0].loginId !== anchor.person.loginId ||
          m.recordId(states[0].personId) !== anchor.identity.recordId ||
          states[0].active === false ||
          states[0].locked === true ||
          (states[0].locked != null && typeof states[0].locked !== "boolean")))
    )
      throw new CLASSES.NodicsError("ERR_PROFILE_MEMBERSHIP_FORBIDDEN");
    return true;
  },
  /** Builds bounded native Customer context and existing login/typed-original stamp bindings; eligibility remains a live decision, not a retained ALLOW bit. @param {Object} anchor Fresh original Customer. @returns {Object} Non-secret typed proof fields. */
  customerEligibilityProof: function (anchor) {
    const version = anchor.person.authVersion || 1;
    return {
      sessionContext: {
        owner: "profile.customerEligibility",
        code: anchor.person.code,
        version,
      },
      securityBindings: [
        {
          tenant: anchor.identity.tenantCode,
          principalId: anchor.person.loginId,
          authVersion: version,
        },
        {
          tenant: anchor.identity.tenantCode,
          principalId: "identity:CUSTOMER:" + anchor.identity.recordId,
          authVersion: version,
        },
      ],
    };
  },
  /** Keeps native Customer context issuance/validation separately closed until its existing issuer and every-request broker integration are qualified. @returns {void} Admission or existing unavailable error. */
  customerEligibilitySessionPolicy: function () {
    if (
      (CONFIG.get("profileCustomerEligibility") || {})
        .nativeSessionQualified !== true
    )
      throw new CLASSES.NodicsError("ERR_PROFILE_MEMBERSHIP_UNAVAILABLE");
  },
  /** Prepares typed native Customer proof only for the existing issuer after credential verification; does not register stamps or issue tokens. @param {Object} person Credential-owner-verified original person. @param {Object} enterprise Verified enterprise placement. @returns {Promise<Object>} Private fresh anchor/person and bounded context/bindings for issuer. */
  prepareCustomerEligibilityContext: async function (person, enterprise) {
    this.customerEligibilitySessionPolicy();
    if (!person?._id || !enterprise?.tenant?.code)
      throw new CLASSES.NodicsError("ERR_PROFILE_MEMBERSHIP_FORBIDDEN");
    const anchor = await this.customerEligibilityAnchor({
      type: "Customer",
      principalType: person.principalType,
      tenant: enterprise.tenant.code,
      entCode: enterprise.code,
      loginId: person.loginId,
      authVersion: person.authVersion || 1,
    });
    if (
      anchor.identity.recordId !==
        SERVICE.DefaultEnterpriseMembershipService.recordId(person._id) ||
      anchor.person.code !== person.code
    )
      throw new CLASSES.NodicsError("ERR_PROFILE_MEMBERSHIP_FORBIDDEN");
    return {
      anchor,
      person: anchor.person,
      ...this.customerEligibilityProof(anchor),
    };
  },
  /** Validates exact typed proof from the issuer or an already cryptographically verified access/refresh token; returns the private original anchor, never a decision-shaped substitute. @param {Object} session Trusted verified session, not an HTTP body. @returns {Promise<Object>} Current original Customer anchor. */
  validateCustomerEligibilityContext: async function (session) {
    this.customerEligibilitySessionPolicy();
    const binding = session?.sessionContext;
    if (
      binding?.owner !== "profile.customerEligibility" ||
      Object.keys(binding).sort().join(",") !== "code,owner,version" ||
      typeof binding.code !== "string" ||
      !/^[A-Za-z0-9_.:-]{1,192}$/.test(binding.code) ||
      !Number.isSafeInteger(binding.version) ||
      binding.version < 1 ||
      !Array.isArray(session.securityBindings) ||
      session.securityBindings.length !== 2 ||
      (session.tokenType !== undefined && session.tokenType !== "access") ||
      typeof SERVICE.DefaultPrincipalSecurityStampService?.validateBindings !==
        "function"
    )
      throw new CLASSES.NodicsError("ERR_PROFILE_MEMBERSHIP_FORBIDDEN");
    const anchor = await this.customerEligibilityAnchor(session);
    const expected = this.customerEligibilityProof(anchor);
    if (
      binding.code !== expected.sessionContext.code ||
      binding.version !== expected.sessionContext.version ||
      session.securityBindings.some(
        (item, index) =>
          !item ||
          Object.keys(item).sort().join(",") !==
            "authVersion,principalId,tenant" ||
          item.tenant !== expected.securityBindings[index].tenant ||
          item.principalId !== expected.securityBindings[index].principalId ||
          item.authVersion !== expected.securityBindings[index].authVersion,
      )
    )
      throw new CLASSES.NodicsError("ERR_PROFILE_MEMBERSHIP_FORBIDDEN");
    await SERVICE.DefaultPrincipalSecurityStampService.validateBindings(
      session.securityBindings,
    );
    return anchor;
  },
  /** Resolves explicit customer terms and qualification; employee membership is never customer consent. */
  participationPolicy: function () {
    const p = CONFIG.get("profileCustomerParticipation") || {};
    if (
      p.enabled !== true ||
      p.qualified !== true ||
      p.sessionQualified !== true ||
      typeof p.terms?.version !== "string" ||
      !p.terms.version ||
      p.terms.version.length > 128 ||
      typeof p.terms?.documentCode !== "string" ||
      !p.terms.documentCode ||
      p.terms.documentCode.length > 192 ||
      !/^[a-f0-9]{64}$/.test(p.terms?.digest || "")
    )
      SERVICE.DefaultEnterpriseMembershipService.fail("UNAVAILABLE");
    this.validateParticipationTerms(p);
    return p;
  },
  /** Recognizes only private owner participation mutations. */
  ownsParticipationWrite: function (request) {
    return participationWrites.has(request);
  },
  /** Protects participation evidence from public/generated CRUD edits while retaining ordinary profile updates. */
  protectParticipation: function (request) {
    const m = SERVICE.DefaultEnterpriseMembershipService;
    if (
      !participationWrites.has(request) &&
      (Array.isArray(request.model)
        ? request.model
        : [request.model || {}]
      ).some((model) =>
        m
          .paths(model)
          .some(
            (path) =>
              path === "customerParticipation" ||
              path.startsWith("customerParticipation."),
          ),
      )
    )
      m.fail("FORBIDDEN");
    return true;
  },
  /** Accepts configured terms for the signed employee's current enterprise and creates only a credential-free customer projection. */
  acceptParticipation: async function (request) {
    const p = this.participationPolicy(),
      m = SERVICE.DefaultEnterpriseMembershipService;
    const input = m
      .base()
      .input(request.body || {}, ["termsVersion", "termsDigest", "accepted"]);
    m.base().input(request.query || {}, []);
    if (
      request.authData?.principalType !== "human" ||
      request.authData.authenticationMethod !== "PASSWORD" ||
      input.accepted !== true ||
      input.termsVersion !== p.terms.version ||
      input.termsDigest !== p.terms.digest
    )
      m.fail("FORBIDDEN");
    const anchor = await m.actor(request);
    if (anchor.identity.recordKind !== "EMPLOYEE") m.fail("IDENTITY");
    const target =
      await SERVICE.DefaultEnterpriseManagementService.retrieveEnterpriseForAccess(
        request.authData.entCode,
      );
    if (target.tenantCode !== request.tenant) m.fail("IDENTITY");
    const code =
      "CUSTOMER_PARTICIPATION_" +
      m.digest([anchor.identity, target.enterprise.code]).slice(0, 32);
    const lookup = { $or: [{ code }, { loginId: anchor.person.loginId }] };
    let found = await m.inventory(
      "DefaultCustomerService",
      target.tenantCode,
      lookup,
    );
    if (found.length > 1) m.fail("IDENTITY");
    if (found.length) {
      const prior = found[0];
      if (
        prior.code !== code ||
        prior.customerParticipation?.phase !== "COMPLETE" ||
        prior.customerParticipation.termsDigest !== p.terms.digest ||
        prior.customerParticipation.termsVersion !== p.terms.version ||
        prior.active !== true ||
        m.digest(prior.authenticationIdentity) !== m.digest(anchor.identity)
      )
        m.fail("CONFLICT");
      await this.participationContext(prior, {
        ...target.enterprise,
        tenant: { code: target.tenantCode },
      });
      return {
        code: prior.code,
        enterpriseCode: target.enterprise.code,
        accepted: true,
        revision: prior.customerParticipation.revision,
      };
    }
    const eligibility = await this.enforceParticipationEligibility(
      request,
      anchor,
      target,
    );
    await this.participationWorkspace({ ...request, body: {}, query: {} });
    const current = await m.actor(request);
    if (
      m.digest(current.identity) !== m.digest(anchor.identity) ||
      current.person.loginId !== anchor.person.loginId
    )
      m.fail("IDENTITY");
    const model = {
      code,
      loginId: anchor.person.loginId,
      name: anchor.person.name,
      active: true,
      principalType: "customer",
      authVersion: 1,
      userGroups: [],
      authenticationIdentity: anchor.identity,
      customerParticipation: {
        phase: "COMPLETE",
        enterpriseCode: target.enterprise.code,
        revision: 1,
        termsVersion: p.terms.version,
        termsDigest: p.terms.digest,
        termsDocumentCode: p.terms.documentCode,
        acceptedAt: new Date().toISOString(),
        eligibilityDecisionId: eligibility.decisionId,
      },
    };
    const command = m.mutation(
      {
        tenant: target.tenantCode,
        authData: SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
        model,
        options: { recursive: false },
      },
      "projection",
    );
    let failure;
    try {
      m.base().assertWrite(await this.participationWrite("save", command));
    } catch (error) {
      failure = error;
    }
    found = await m.inventory(
      "DefaultCustomerService",
      target.tenantCode,
      lookup,
    );
    if (
      found.length !== 1 ||
      found[0].code !== code ||
      m.digest(found[0].authenticationIdentity) !== m.digest(anchor.identity) ||
      m.digest(found[0].customerParticipation) !==
        m.digest(model.customerParticipation)
    ) {
      if (failure) throw failure;
      m.fail("STORAGE");
    }
    await this.participationContext(found[0], {
      ...target.enterprise,
      tenant: { code: target.tenantCode },
    });
    return {
      code,
      enterpriseCode: target.enterprise.code,
      accepted: true,
      revision: 1,
    };
  },
  /** Builds customer-only grants and independently typed canonical/participation proof for issue and refresh. */
  participationContext: async function (person, enterprise) {
    const p = this.participationPolicy(),
      m = SERVICE.DefaultEnterpriseMembershipService,
      participation = person.customerParticipation;
    if (
      !person.authenticationIdentity ||
      person.password ||
      person.apiKey ||
      person.apiKeyHash ||
      person.principalType !== "customer" ||
      person.active !== true ||
      person.disabled === true ||
      participation?.phase !== "COMPLETE" ||
      participation.enterpriseCode !== enterprise.code ||
      participation.termsVersion !== p.terms.version ||
      participation.termsDigest !== p.terms.digest ||
      participation.termsDocumentCode !== p.terms.documentCode ||
      typeof participation.eligibilityDecisionId !== "string" ||
      !/^[A-Za-z0-9._:-]{1,192}$/.test(participation.eligibilityDecisionId) ||
      typeof participation.acceptedAt !== "string" ||
      !Number.isFinite(new Date(participation.acceptedAt).getTime()) ||
      new Date(participation.acceptedAt).getTime() > Date.now() ||
      !Number.isSafeInteger(participation.revision) ||
      participation.revision < 1
    )
      m.fail("IDENTITY");
    const anchor = await m.resolve(person, enterprise.tenant.code, "CUSTOMER");
    if (person.loginId !== anchor.person.loginId) m.fail("IDENTITY");
    // Every issue/refresh/replay rechecks current eligibility before any customer grants or stamp registration.
    await this.enforceParticipationEligibility(
      { tenant: enterprise.tenant.code },
      anchor,
      { enterprise, tenantCode: enterprise.tenant.code },
    );
    const registration = (CONFIG.get("identityGovernance") || {})
      .customerRegistration;
    if (
      !registration ||
      registration.principalType !== "customer" ||
      typeof registration.group !== "string" ||
      !registration.group
    )
      m.fail("UNAVAILABLE");
    SERVICE.DefaultPrincipalGovernanceService.validateModels([
      { ...person, userGroups: [registration.group] },
    ]);
    const groups = await m.groups(enterprise.tenant.code, [registration.group]);
    if (
      SERVICE.DefaultIdentityGovernanceService.hasAdministrativeAccess({
        userGroups:
          SERVICE.DefaultAuthenticationProviderService.resolveSessionUserGroups(
            { userGroups: groups },
          ),
      })
    )
      m.fail("FORBIDDEN");
    const effective =
      await SERVICE.DefaultPrincipalScopeGovernanceService.getEffectiveScopes({
        tenant: enterprise.tenant.code,
        authData: {
          principalType: "customer",
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
      effective.deniedScopes.some(
        (row) =>
          row.scopeType === "GLOBAL" ||
          (row.scopeType === "TENANT" &&
            row.scopeCode === enterprise.tenant.code) ||
          (row.scopeType === "ENTERPRISE" && row.scopeCode === enterprise.code),
      )
    )
      m.fail("FORBIDDEN");
    if (!person._id) m.fail("IDENTITY");
    const securityBindings = [
      {
        tenant: anchor.identity.tenantCode,
        principalId: m.identityKey(anchor.identity),
        authVersion: anchor.person.authVersion || 1,
      },
      {
        tenant: enterprise.tenant.code,
        principalId: "participation:CUSTOMER:" + String(person._id),
        authVersion: participation.revision,
      },
    ];
    for (const item of securityBindings)
      await SERVICE.DefaultPrincipalSecurityStampService.register(
        item.tenant,
        item.principalId,
        item.authVersion,
      );
    return {
      anchor,
      person: {
        ...person,
        userGroups: groups,
        userGroupCodes: undefined,
        userGroupPermissions: undefined,
      },
      sessionContext: {
        owner: "profile.customerParticipation",
        code: person.code,
        version: participation.revision,
      },
      securityBindings,
    };
  },
  /** Revalidates live customer participation without upgrading customer proof to staff authority. */
  validateParticipationContext: async function (session) {
    const m = SERVICE.DefaultEnterpriseMembershipService;
    if (
      session.principalType !== "customer" ||
      session.sessionContext?.owner !== "profile.customerParticipation"
    )
      m.fail("IDENTITY");
    await SERVICE.DefaultPrincipalSecurityStampService.validateBindings(
      session.securityBindings,
    );
    const target =
      await SERVICE.DefaultEnterpriseManagementService.retrieveEnterpriseForAccess(
        session.entCode,
      );
    if (target.tenantCode !== session.tenant) m.fail("IDENTITY");
    const person = await m.read("DefaultCustomerService", session.tenant, {
      code: session.sessionContext.code,
    });
    if (!person || person.loginId !== session.loginId) m.fail("IDENTITY");
    const context = await this.participationContext(person, {
      ...target.enterprise,
      tenant: { code: target.tenantCode },
    });
    if (
      m.digest(context.securityBindings) !==
        m.digest(session.securityBindings) ||
      m.digest(context.sessionContext) !== m.digest(session.sessionContext)
    )
      m.fail("IDENTITY");
    return context.anchor;
  },
  /** Advances only linked customer participation revisions after principal/scope/group mutations. */
  invalidateParticipations: async function (tenant, ids) {
    const m = SERVICE.DefaultEnterpriseMembershipService;
    for (const person of await m.inventory("DefaultCustomerService", tenant, {
      _id: { $in: ids },
    })) {
      if (
        !person.authenticationIdentity ||
        person.customerParticipation?.phase !== "COMPLETE"
      )
        continue;
      const previous = person.customerParticipation.revision;
      if (
        !Number.isSafeInteger(previous) ||
        previous < 1 ||
        previous >= 2147483647
      )
        m.fail("STORAGE");
      const customerParticipation = {
        ...person.customerParticipation,
        revision: previous + 1,
      };
      const command = {
        tenant,
        authData: SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
        query: { _id: person._id, "customerParticipation.revision": previous },
        model: { $set: { customerParticipation } },
      };
      const result = await this.participationWrite("update", command);
      m.base().assertWrite(result);
      if (result.result?.matchedCount !== 1) m.fail("CONFLICT");
      await SERVICE.DefaultPrincipalSecurityStampService.register(
        tenant,
        "participation:CUSTOMER:" + String(person._id),
        previous + 1,
      );
    }
  },
  /** Invalidates current customer-only grants when the configured customer group or an ancestor changes. */
  invalidateGroupParticipations: async function (tenant, codes) {
    const registration = (CONFIG.get("identityGovernance") || {})
      .customerRegistration;
    if (!registration || !codes.includes(registration.group)) return;
    const m = SERVICE.DefaultEnterpriseMembershipService;
    const people = await m.inventory("DefaultCustomerService", tenant, {
      authenticationIdentity: { $exists: true },
      "customerParticipation.phase": "COMPLETE",
    });
    if (people.length)
      await this.invalidateParticipations(
        tenant,
        people.map((person) => String(person._id)),
      );
  },
  /** Maps a public account form into the existing signup pipeline. Rejects invalid fields and ignores caller-supplied identity, roles and verification flags; later layers customize limits through Profile properties. */
  formModel: function (payload) {
    const policy = CONFIG.get("profileCustomerRegistrationForm") || {};
    const email =
      typeof payload.email === "string"
        ? payload.email.trim().toLowerCase()
        : "";
    const name =
      typeof payload.name === "string"
        ? payload.name.trim().replace(/\s+/gu, " ")
        : "";
    const password = payload.password;
    if (
      !Number.isSafeInteger(policy.minimumPasswordCharacters) ||
      policy.minimumPasswordCharacters < 1 ||
      !Number.isSafeInteger(policy.maximumPasswordCharacters) ||
      policy.maximumPasswordCharacters < policy.minimumPasswordCharacters ||
      !Number.isSafeInteger(policy.maximumEmailCharacters) ||
      !Number.isSafeInteger(policy.maximumNameCharacters) ||
      !Number.isSafeInteger(policy.maximumNamePartCharacters)
    ) {
      throw new CLASSES.NodicsError("ERR_PROFILE_REGISTRATION_POLICY");
    }
    if (
      !email ||
      email.length > policy.maximumEmailCharacters ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email) ||
      typeof password !== "string" ||
      password.length < policy.minimumPasswordCharacters ||
      password.length > policy.maximumPasswordCharacters ||
      !name ||
      name.length > policy.maximumNameCharacters
    ) {
      throw new CLASSES.NodicsError("ERR_PROFILE_REGISTRATION_FORM");
    }
    const [firstName, ...rest] = name.split(" "),
      lastName = rest.join(" ");
    if (
      firstName.length > policy.maximumNamePartCharacters ||
      lastName.length > policy.maximumNamePartCharacters
    ) {
      throw new CLASSES.NodicsError("ERR_PROFILE_REGISTRATION_FORM");
    }
    return {
      code: this.formCustomerCode(email),
      loginId: email,
      name: { firstName, ...(lastName ? { lastName } : {}) },
      password: { loginId: email, password, confirmPassword: password },
    };
  },
  /** Derives the canonical new-account reference from normalized login identity; preserves existing reference-format compatibility. */
  formCustomerCode: function (loginId) {
    return (
      "CUSTOMER_" +
      require("node:crypto")
        .createHash("sha256")
        .update(loginId)
        .digest("hex")
        .slice(0, 24)
        .toUpperCase()
    );
  },

  /**
   * This function is used to initiate entity loader process. If there is any functionalities, required to be executed on entity loading.
   * defined it that with Promise way
   * @param {*} options
   */
  init: function (options) {
    return new Promise((resolve, reject) => {
      resolve(true);
    });
  },

  /**
   * This function is used to finalize entity loader process. If there is any functionalities, required to be executed after entity loading.
   * defined it that with Promise way
   * @param {*} options
   */
  postInit: function (options) {
    return new Promise((resolve, reject) => {
      resolve(true);
    });
  },

  /**

     * Validates request rules.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @param {*} process Method input.

     * @returns {*} Method result.

     */

  validateRequest: function (request, response, process) {
    this.LOG.debug("Validating customer registration request");
    if (!request.defaultCustomerService) {
      process.error(
        request,
        response,
        new CLASSES.NodicsError(
          "ERR_PRFL_00003",
          "Invalid service detail to execute",
        ),
      );
    } else if (!request.model) {
      process.error(
        request,
        response,
        new CLASSES.NodicsError(
          "ERR_PRFL_00003",
          "Invalid customer detail to execute",
        ),
      );
    } else {
      let registration =
        (CONFIG.get("identityGovernance") &&
          CONFIG.get("identityGovernance").customerRegistration) ||
        {};
      if (!registration.group || !registration.principalType) {
        return process.error(
          request,
          response,
          new CLASSES.NodicsError(
            "ERR_PRFL_00003",
            "Customer registration policy is incomplete",
          ),
        );
      }
      request.model.userGroups = [registration.group];
      request.model.principalType = registration.principalType;
      request.model.ownerId = request.model.loginId;
      request.model.ownerType = registration.principalType;
      request.model.createdBy = request.model.loginId;
      request.model.updatedBy = request.model.loginId;
      request.model.active = registration.active === true;
      request.model.accessGroups = [registration.group];
      delete request.model.apiKey;
      delete request.model.apiKeyStatus;
      delete request.model.apiKeyScopes;
      delete request.model.permissions;
      process.nextSuccess(request, response);
    }
  },
  /**
   * Validates if customer exist rules.
   *
   * @param {*} request Method input.
   * @param {*} response Method input.
   * @param {*} process Method input.
   * @returns {*} Method result.
   */
  validateIfCustomerExist: function (request, response, process) {
    this.LOG.debug("Validating if customer exist");
    request.defaultCustomerService
      .isCustomerExist({
        tenant: request.tenant,
        loginId: request.model.loginId,
      })
      .then((error) => {
        process.error(
          request,
          response,
          new CLASSES.NodicsError(error, null, "ERR_PRFL_00007"),
        );
      })
      .catch((success) => {
        process.nextSuccess(request, response);
      });
  },
  /**
   * Validates confirm password rules.
   *
   * @param {*} request Method input.
   * @param {*} response Method input.
   * @param {*} process Method input.
   * @returns {*} Method result.
   */
  validateConfirmPassword: function (request, response, process) {
    this.LOG.debug("Validating confirmed password");
    let model = request.model;
    if (
      !model.password ||
      !model.password.password ||
      !model.password.confirmPassword ||
      model.password.password !== model.password.confirmPassword
    ) {
      process.error(
        request,
        response,
        new CLASSES.NodicsError(
          "ERR_PRFL_00003",
          "Invalid customer password detail to execute",
        ),
      );
    } else {
      // Password identity is derived from the registered principal, never a separate caller value.
      request.model.password.loginId = request.model.loginId;
      delete request.model.password.confirmPassword;
      process.nextSuccess(request, response);
    }
  },
  /**
   * Updates customer information.
   *
   * @param {*} request Method input.
   * @param {*} response Method input.
   * @param {*} process Method input.
   * @returns {*} Method result.
   */
  createCustomer: function (request, response, process) {
    // The registration pipeline resolves placement before credential creation.
    const gate = this.resolveRegistrationPlacement(request).then((placement) =>
      this.enforceCustomerEligibility(request, {
        subjectType: "CUSTOMER",
        subjectCode: request.model.loginId,
        enterpriseCode: placement.enterpriseCode,
      }),
    );
    gate
      .then((kycDecision) => {
        request.kycDecisionReference = kycDecision.decisionId;
        const owner =
          SERVICE.DefaultCustomerEligibilityDecisionGovernanceService;
        if (typeof owner?.withRegistrationDecision !== "function")
          throw new CLASSES.NodicsError("ERR_PROFILE_MEMBERSHIP_UNAVAILABLE");
        const command = Object.assign({}, request, {
          authData:
            SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
        });
        return owner.withRegistrationDecision(
          command,
          kycDecision,
          async (generated) => {
            await this.resolveRegistrationPlacement(request);
            return request.defaultCustomerService.save(generated);
          },
        );
      })
      .then((success) => {
        response.success = success;
        process.nextSuccess(request, response);
      })
      .catch((error) => {
        process.error(
          request,
          response,
          new CLASSES.NodicsError(error, null, "ERR_PRFL_00006"),
        );
      });
  },
};
