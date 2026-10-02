/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
/**
 * @module profile/service/customer/DefaultCustomerEligibilityRulePropertyService
 * @description Registers generic customer eligibility facts from current canonical Profile owners; never certifies regulated KYC or accepts caller-supplied evidence.
 * @layer service
 * @owner profile
 * @override Later layers may extend exported catalogue/fact members or select a genuine verified-evidence provider; preserve fresh generated reads, immutable identity and transient context admission.
 */
const snapshots = new WeakMap();

module.exports = {
  providerCode: "profile.customerEligibility",
  ownerModule: "profile",
  /** Registers this effective layered service in the existing Rules registry. @returns {Promise<boolean>} Lifecycle completion. */
  init: async function () {
    if (
      typeof SERVICE !== "undefined" &&
      SERVICE.DefaultRulePropertyCatalogueRegistryService
    )
      SERVICE.DefaultRulePropertyCatalogueRegistryService.registerProvider(
        this.providerCode,
        this,
      );
    return true;
  },
  /** Repeats idempotent registration after all services are initialized. @returns {Promise<boolean>} Lifecycle completion. */
  postInit: function () {
    return this.init();
  },
  /** Rejects incomplete or ambiguous current owner evidence without exposing records. @returns {never} Failure. */
  fail: function () {
    throw new CLASSES.NodicsError("ERR_PROFILE_MEMBERSHIP_UNAVAILABLE");
  },
  /** Constructs an unavailable resolution, not an inferred negative verification. @param {string} [source] Evidence limitation. @returns {Object} Resolution. */
  unavailable: function (source = "PROFILE_EVIDENCE_UNAVAILABLE") {
    return { available: false, quality: "UNAVAILABLE", source };
  },
  /** Normalizes a retained scalar, with record confidence distinct from identity verification. @param {*} value Scalar. @param {string} [quality] Rules quality. @returns {Object} Resolution. */
  fact: function (value, quality = "REFERENCE_DEFAULT") {
    if (
      typeof value !== "boolean" &&
      typeof value !== "string" &&
      !Number.isSafeInteger(value)
    )
      return this.unavailable();
    return {
      available: true,
      value,
      quality,
      confidence: 1,
      source: "PROFILE_CURRENT_RECORD",
    };
  },
  /** Declares generic facts; contact verification deliberately remains unavailable without a genuine proof owner. @returns {Object} Versioned Rules catalogue. */
  getCatalogue: function () {
    const boolean = [
      "IS_TRUE",
      "IS_FALSE",
      "EQUALS",
      "NOT_EQUALS",
      "IS_AVAILABLE",
      "IS_NOT_AVAILABLE",
    ];
    const properties = [
      "customer.exists",
      "customer.active",
      "customer.disabled",
      "customer.registrationSuspended",
      "canonical.exists",
      "canonical.active",
      "canonical.disabled",
      "canonical.registrationSuspended",
      "consent.present",
      "consent.complete",
      "consent.currentTerms",
      "contact.emailPresent",
      "contact.emailVerified",
    ].map((code) => ({
      code,
      displayName: code,
      dataType: "BOOLEAN",
      allowedOperators: boolean.slice(),
      qualityAware: true,
      supportsFallback: false,
    }));
    properties.push({
      code: "canonical.recordKind",
      displayName: "Canonical record kind",
      dataType: "STRING",
      allowedOperators: [
        "EQUALS",
        "NOT_EQUALS",
        "IN",
        "NOT_IN",
        "IS_AVAILABLE",
        "IS_NOT_AVAILABLE",
      ],
      allowedValues: ["CUSTOMER", "EMPLOYEE"],
      qualityAware: true,
      supportsFallback: false,
    });
    return {
      code: "PROFILE_CUSTOMER_ELIGIBILITY_PROPERTIES",
      version: "1",
      providerCode: this.providerCode,
      consumerModule: "profile",
      properties,
    };
  },
  /** Reads one exact original/generated record through complete uncached inventory. @param {string} name Generated service. @param {string} tenant Partition. @param {Object} query Exact lookup. @returns {Promise<Object|undefined>} Retained record. */
  read: async function (name, tenant, query) {
    const service = SERVICE[name],
      inventory = SERVICE.DefaultPrincipalSecurityStampGovernanceService;
    if (
      typeof service?.get !== "function" ||
      typeof inventory?.inventory !== "function"
    )
      this.fail();
    const rows = await inventory.inventory(service, tenant, query);
    if (!Array.isArray(rows) || rows.length > 1) this.fail();
    return rows[0];
  },
  /** Copies only exact immutable locator fields through the canonical normalization owner. @param {Object} value Stored or owner-resolved locator. @returns {Object} Locator. */
  identity: function (value) {
    if (
      !value ||
      Object.keys(value).length !== 3 ||
      Object.keys(value).some(
        (key) => !["tenantCode", "recordKind", "recordId"].includes(key),
      )
    )
      this.fail();
    return SERVICE.DefaultEnterpriseMembershipService.identity(value);
  },
  /** Compares canonical locators without interpreting login/email as an identity link. @param {Object} left Locator. @param {Object} right Locator. @returns {boolean} Exact match. */
  sameIdentity: function (left, right) {
    return ["tenantCode", "recordKind", "recordId"].every(
      (key) => left[key] === right[key],
    );
  },
  /** Derives retained consent only, validating current configured terms through their existing owner. @param {Object} person Target Customer. @param {Object} context Current coordinates. @returns {Object} Normalized facts. */
  consentFacts: function (person, context) {
    const consent = person?.customerParticipation;
    const facts = {
      "consent.present": this.fact(Boolean(consent)),
      "consent.complete": this.fact(consent?.phase === "COMPLETE"),
      "consent.currentTerms": this.unavailable(),
    };
    if (!consent) {
      facts["consent.currentTerms"] = this.fact(false);
      return facts;
    }
    let terms;
    try {
      terms =
        SERVICE.DefaultCustomerRegistrationService.participationPolicy().terms;
    } catch {
      return facts;
    }
    const accepted = new Date(consent.acceptedAt).getTime();
    const current =
      consent.phase === "COMPLETE" &&
      consent.enterpriseCode === context.enterpriseCode &&
      Number.isSafeInteger(consent.revision) &&
      consent.revision >= 1 &&
      Number.isFinite(accepted) &&
      accepted <= Date.now() &&
      typeof consent.eligibilityDecisionId === "string" &&
      /^[A-Za-z0-9._:-]{1,192}$/.test(consent.eligibilityDecisionId) &&
      consent.termsVersion === terms.version &&
      consent.termsDigest === terms.digest &&
      consent.termsDocumentCode === terms.documentCode;
    facts["consent.currentTerms"] = this.fact(current, "CUSTOMER_CONFIRMED");
    return facts;
  },
  /** Resolves email presence from exact active referenced Contact records; presence is never verification. @param {Object} person Original principal. @param {string} tenant Original partition. @returns {Promise<Object>} Resolution. */
  emailPresence: async function (person, tenant) {
    if (person.contacts == null) return this.fact(false);
    if (!Array.isArray(person.contacts) || person.contacts.length > 100)
      this.fail();
    let found = false;
    const seen = new Set();
    for (const reference of person.contacts) {
      const code = typeof reference === "string" ? reference : reference?.code;
      if (
        typeof code !== "string" ||
        !/^[A-Za-z0-9._:-]{1,192}$/.test(code) ||
        seen.has(code)
      )
        this.fail();
      seen.add(code);
      const contact = await this.read("DefaultContactService", tenant, {
        code,
      });
      if (!contact || contact.code !== code) this.fail();
      if (
        contact.active === true &&
        contact.type === "EMAIL" &&
        typeof contact.value === "string" &&
        contact.value.length > 0 &&
        contact.value.length <= 320
      )
        found = true;
    }
    return this.fact(found);
  },
  /** Consumes the genuine canonical Contact fact under detached logger-private entry; absent/unqualified/failed owners never become verified evidence and original identity avoids registration/session recursion. @param {Object} identity Original immutable locator. @returns {Promise<Object>} Boolean verification resolution or unavailable. */
  verifiedContact: async function (identity) {
    const owner = SERVICE.DefaultProfileVerifiedContactService,
      logger = SERVICE.DefaultLoggerService;
    if (typeof owner?.getCanonicalVerificationFact !== "function")
      return this.unavailable("PROFILE_CONTACT_VERIFICATION_OWNER_ABSENT");
    if (typeof logger?.runSensitiveOperation !== "function")
      return this.unavailable(
        "PROFILE_CONTACT_VERIFICATION_PRIVACY_UNAVAILABLE",
      );
    const input = { identity: this.identity(identity), channel: "EMAIL" };
    try {
      const fact = await logger.runSensitiveOperation(input, () =>
        owner.getCanonicalVerificationFact(input),
      );
      if (
        !fact ||
        Object.keys(fact).length !== 1 ||
        typeof fact.verified !== "boolean"
      )
        return this.unavailable(
          "PROFILE_CONTACT_VERIFICATION_OWNER_UNAVAILABLE",
        );
      return {
        ...this.fact(
          fact.verified,
          fact.verified ? "CONTACT_VERIFIED" : "REFERENCE_DEFAULT",
        ),
        source: "PROFILE_VERIFIED_CONTACT_OWNER",
      };
    } catch {
      return this.unavailable("PROFILE_CONTACT_VERIFICATION_OWNER_UNAVAILABLE");
    }
  },
  /** Loads current canonical state from generated owners without credentials, raw records or inferred verification in the snapshot. @param {Object} context Trusted placement. @returns {Promise<Object>} Minimal normalized facts. */
  loadFacts: async function (context) {
    const m = SERVICE.DefaultEnterpriseMembershipService;
    if (typeof m?.identity !== "function" || typeof m?.locator !== "function")
      this.fail();
    const placement =
      await SERVICE.DefaultEnterpriseManagementService.retrieveEnterpriseForAccess(
        context.enterpriseCode,
      );
    if (
      placement?.enterprise?.code !== context.enterpriseCode ||
      placement.enterprise.active !== true ||
      placement.tenantCode !== context.tenant
    )
      this.fail();
    const customer = await this.read("DefaultCustomerService", context.tenant, {
      loginId: context.subjectCode,
    });
    if (
      customer &&
      (customer.loginId !== context.subjectCode ||
        customer.principalType !== "customer")
    )
      this.fail();
    let identity = context.identity && this.identity(context.identity);
    if (customer) {
      const retained = this.identity(
        customer.authenticationIdentity ||
          m.locator(context.tenant, "CUSTOMER", customer),
      );
      if (identity && !this.sameIdentity(identity, retained)) this.fail();
      identity = retained;
      if (customer.authenticationIdentity && customer.password) this.fail();
    }
    let canonical;
    if (identity) {
      canonical = await this.read(
        identity.recordKind === "EMPLOYEE"
          ? "DefaultEmployeeService"
          : "DefaultCustomerService",
        identity.tenantCode,
        { _id: identity.recordId },
      );
      if (
        !canonical ||
        m.recordId(canonical._id) !== identity.recordId ||
        canonical.loginId !== context.subjectCode ||
        canonical.principalType !==
          (identity.recordKind === "EMPLOYEE" ? "human" : "customer") ||
        (canonical.authenticationIdentity &&
          !this.sameIdentity(
            this.identity(canonical.authenticationIdentity),
            identity,
          ))
      )
        this.fail();
    }
    const facts = {
      "customer.exists": this.fact(Boolean(customer)),
      "canonical.exists": this.fact(Boolean(canonical)),
      "canonical.recordKind": identity
        ? this.fact(identity.recordKind)
        : this.unavailable(),
      ...this.consentFacts(customer, context),
      "contact.emailVerified": identity
        ? await this.verifiedContact(identity)
        : this.unavailable(),
      "contact.emailPresent": canonical
        ? await this.emailPresence(canonical, identity.tenantCode)
        : this.unavailable(),
    };
    for (const [prefix, person] of [
      ["customer", customer],
      ["canonical", canonical],
    ]) {
      facts[prefix + ".active"] =
        person && typeof person.active === "boolean"
          ? this.fact(person.active)
          : this.unavailable();
      for (const flag of ["disabled", "registrationSuspended"])
        facts[prefix + "." + flag] = person
          ? person[flag] == null
            ? this.fact(false)
            : typeof person[flag] === "boolean"
              ? this.fact(person[flag])
              : this.unavailable()
          : this.unavailable();
    }
    return Object.freeze(
      Object.fromEntries(
        Object.entries(facts).map(([key, value]) => [
          key,
          Object.freeze(value),
        ]),
      ),
    );
  },
  /** Prepares async owner facts for synchronous Rules resolution and removes admission on success/failure. @param {Object} context Owner-built coordinates. @param {Function} operation Rules callback. @returns {Promise<*>} Callback result. */
  withContext: async function (context, operation) {
    if (
      typeof operation !== "function" ||
      context?.subjectType !== "CUSTOMER" ||
      context.action !== "ONBOARDING" ||
      typeof context.subjectCode !== "string" ||
      !context.subjectCode ||
      context.subjectCode.length > 320 ||
      !/^[A-Za-z0-9._-]{1,128}$/.test(context.tenant || "") ||
      !/^[A-Za-z0-9._-]{1,128}$/.test(context.enterpriseCode || "") ||
      Object.keys(context).some(
        (key) =>
          ![
            "tenant",
            "action",
            "subjectType",
            "subjectCode",
            "enterpriseCode",
            "identity",
          ].includes(key),
      )
    )
      this.fail();
    const input = Object.freeze({
      tenant: context.tenant,
      action: context.action,
      subjectType: context.subjectType,
      subjectCode: context.subjectCode,
      enterpriseCode: context.enterpriseCode,
      ...(context.identity
        ? { identity: Object.freeze(this.identity(context.identity)) }
        : {}),
    });
    const facts = await this.loadFacts(input);
    snapshots.set(input, facts);
    try {
      return await operation(input);
    } finally {
      snapshots.delete(input);
    }
  },
  /** Resolves only the exact transient context; copied, cached or public nested contexts provide no evidence. @param {Object} request Registry property request. @returns {Object} Normalized scalar only. */
  resolveProperty: function (request) {
    const facts = request?.context && snapshots.get(request.context);
    return facts && Object.hasOwn(facts, request.propertyCode)
      ? { ...facts[request.propertyCode] }
      : this.unavailable();
  },
};
