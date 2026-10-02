/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
/**
 * @module profile/service/interceptors/DefaultProfileVerifiedContactInterceptorService
 * @description Fixed generated-hook adapters for existing verified Contact evidence and Customer/Employee associations; guards remain active independently of rollout flags.
 * @layer service
 * @owner profile
 * @override Later Profile layers may tighten fixed adapters while preserving generated operation semantics, exact private owner admission and always-on evidence protection.
 */
module.exports = {
  /** Resolves the sole verified-contact authority; missing source refuses rather than dropping protection. @returns {Object} Effective owner. */
  owner: function () {
    const owner = SERVICE.DefaultProfileVerifiedContactService;
    for (const method of [
      "guardContactRead",
      "guardContactMutation",
      "guardCustomerAssociationMutation",
      "guardEmployeeAssociationMutation",
      "redactContactRead",
      "privateField",
      "fail",
    ])
      if (typeof owner?.[method] !== "function")
        throw new CLASSES.NodicsError("ERR_AUTH_00003");
    return owner;
  },
  /** Requires the actual prepared fixed schema, not a submitted operation/schema selector. @param {Object} request Generated request. @param {string} schema Fixed adapter schema. @returns {Object} Verified-contact owner. */
  fixed: function (request, schema) {
    const owner = this.owner();
    if (!request || request.schemaModel?.schemaName !== schema) owner.fail();
    return owner;
  },
  /** Composes independent Contact and decision guards through the prepared-schema standard cache/Mongo integration, not a fictitious generated preCount hook. @param {Object} request Exact provider read envelope retaining genuine owner admission. @param {Object} model Actual prepared provider receiver, never a submitted schema selector. @returns {boolean} Existing read guard. */
  providerRead: function (request, model) {
    const owner = this.owner();
    if (
      !model?.rawSchema ||
      ![
        "contact",
        "customer",
        "employee",
        "enterprise",
        "password",
        "identityMigrationAudit",
      ].includes(model.schemaName)
    )
      owner.fail();
    if (owner.guardContactRead(request) !== true) owner.fail();
    const decision =
      SERVICE.DefaultCustomerEligibilityDecisionGovernanceService;
    if (typeof decision?.protectRead !== "function") owner.fail();
    if (decision.protectRead(request) !== true) owner.fail();
    if (model.schemaName === "identityMigrationAudit") {
      const historical = SERVICE.DefaultCanonicalHistoricalIdentityLinkService;
      if (
        typeof historical?.protectRead !== "function" ||
        historical.protectRead(request) !== true
      )
        owner.fail();
    }
    return true;
  },
  /** Composes independent evidence redactors before standard provider/public serialization; private input identity is preserved, not reconstructed from flags. @param {Object} request Exact provider read input. @param {Object} response Wrapper whose success contains the actual result envelope. @param {Object} model Actual prepared provider receiver. @returns {boolean} Both owner redactions acknowledged. */
  providerResult: function (request, response, model) {
    const owner = this.owner();
    if (
      !model?.rawSchema ||
      ![
        "contact",
        "customer",
        "employee",
        "enterprise",
        "password",
        "identityMigrationAudit",
      ].includes(model.schemaName)
    )
      owner.fail();
    const historical = SERVICE.DefaultCanonicalHistoricalIdentityLinkService;
    const team = SERVICE.DefaultEnterpriseTeamAdministrationService;
    if (
      typeof historical?.redactRetirement !== "function" ||
      typeof team?.redactEnterprise !== "function"
    )
      owner.fail();
    // Validate/clone provider shapes before less restrictive domain projections; each owner keeps its own exact admission.
    if (team.redactEnterprise(request, response) !== true) owner.fail();
    if (historical.redactRetirement(request, response) !== true) owner.fail();
    if (owner.redactContactRead(request, response) !== true) owner.fail();
    const decision =
      SERVICE.DefaultCustomerEligibilityDecisionGovernanceService;
    if (typeof decision?.redactDecision !== "function") owner.fail();
    if (decision.redactDecision(request, response) !== true) owner.fail();
    if (model.schemaName === "enterprise") {
      const consent = SERVICE.DefaultEnterpriseAdministrationConsentService;
      if (
        typeof consent?.redact !== "function" ||
        consent.redact(request, response) !== true
      )
        owner.fail();
    }
    return true;
  },
  /** Classifies only the existing no-query, unmanaged, unversioned generated provider insert as INSERT; every possible save-existing path is conservative REPLACE. @param {Object} request Prepared generated save. @returns {string} Trusted INSERT or REPLACE, never a body flag. */
  saveOperation: function (request) {
    const owner = this.owner(),
      model = request.schemaModel;
    const concurrency = SERVICE.DefaultModelConcurrencyService;
    if (
      typeof concurrency?.getField !== "function" ||
      typeof model?.saveItems !== "function"
    )
      owner.fail();
    // Empty generated selectors have the same insert semantics as an absent selector.
    if (
      request.query &&
      Object.getPrototypeOf(request.query) === Object.prototype &&
      !Object.keys(request.query).length
    )
      delete request.query;
    return !request.query &&
      request.options?.upsert !== true &&
      model.versioned !== true &&
      model.rawSchema?.isVersionedEnabled !== true &&
      !concurrency.getField(model.rawSchema)
      ? "INSERT"
      : "REPLACE";
  },
  /** Protects reserved marker paths before association skips, with no blanket system/projection/provisioning bypass. @param {Object} request Generated association command. @param {string} schema Fixed customer/employee schema. @param {string} operation Trusted INSERT/PATCH/REPLACE/REMOVE. @returns {Promise<boolean>} Existing authority result. */
  association: async function (request, schema, operation) {
    const owner = this.fixed(request, schema);
    owner.guardContactRead(request);
    if (owner.privateField(request.model)) owner.fail();
    // Current registration/membership writers have no admitted protected Contact reassociation operation.
    return schema === "employee"
      ? await owner.guardEmployeeAssociationMutation(request, operation)
      : await owner.guardCustomerAssociationMutation(
          request,
          operation,
          "Customer",
        );
  },
  /** Guards Contact save using actual generated insert/upsert semantics. @param {Object} request Exact save. @returns {Promise<boolean>} Owner admission or unprotected write. */
  contactPreSave: async function (request) {
    const owner = this.fixed(request, "contact");
    return await owner.guardContactMutation(
      request,
      this.saveOperation(request) === "INSERT" ? "INSERT" : "MUTATE",
    );
  },
  /** Guards Contact update regardless of rollout flags. @param {Object} request Exact update. @returns {Promise<boolean>} Existing owner guard. */
  contactPreUpdate: async function (request) {
    return await this.fixed(request, "contact").guardContactMutation(
      request,
      "MUTATE",
    );
  },
  /** Guards Contact removal before provider dispatch. @param {Object} request Exact removal. @returns {Promise<boolean>} Existing owner guard. */
  contactPreRemove: async function (request) {
    return await this.fixed(request, "contact").guardContactMutation(
      request,
      "MUTATE",
    );
  },
  /** Guards Contact get selectors/options, including the generated provider count. @param {Object} request Exact get. @returns {boolean} Existing read guard. */
  contactPreGet: function (request) {
    return this.fixed(request, "contact").guardContactRead(request);
  },
  /** Redacts Contact result and nested markers through the sole private-read authority. @param {Object} request Exact get. @param {Object} response Generated envelope. @returns {boolean} Existing projection result. */
  contactPostGet: function (request, response) {
    return this.fixed(request, "contact").redactContactRead(request, response);
  },
  /** Guards Customer save as proven insert or conservative replacement. @param {Object} request Exact save. @returns {Promise<boolean>} Existing association guard. */
  customerPreSave: async function (request) {
    this.fixed(request, "customer");
    return await this.association(
      request,
      "customer",
      this.saveOperation(request),
    );
  },
  /** Guards only actual Customer patch semantics, never caller-selected operation. @param {Object} request Exact update. @returns {Promise<boolean>} Existing association guard. */
  customerPreUpdate: async function (request) {
    return await this.association(request, "customer", "PATCH");
  },
  /** Checks existing Customer Contact associations even when removal has no model. @param {Object} request Exact remove. @returns {Promise<boolean>} Existing association guard. */
  customerPreRemove: async function (request) {
    return await this.association(request, "customer", "REMOVE");
  },
  /** Guards Customer reads containing private Contact selectors/options. @param {Object} request Exact get. @returns {boolean} Existing read guard. */
  customerPreGet: function (request) {
    return this.fixed(request, "customer").guardContactRead(request);
  },
  /** Redacts recursive Customer Contact evidence without a role-based exception. @param {Object} request Exact get. @param {Object} response Generated envelope. @returns {boolean} Existing redaction. */
  customerPostGet: function (request, response) {
    return this.fixed(request, "customer").redactContactRead(request, response);
  },
  /** Guards Employee save using only the fixed Employee association owner. @param {Object} request Exact save. @returns {Promise<boolean>} Existing association guard. */
  employeePreSave: async function (request) {
    this.fixed(request, "employee");
    return await this.association(
      request,
      "employee",
      this.saveOperation(request),
    );
  },
  /** Guards Employee association patches while preserving untouched ordinary fields. @param {Object} request Exact update. @returns {Promise<boolean>} Existing association guard. */
  employeePreUpdate: async function (request) {
    return await this.association(request, "employee", "PATCH");
  },
  /** Checks original Employee Contact associations before removal. @param {Object} request Exact remove. @returns {Promise<boolean>} Existing association guard. */
  employeePreRemove: async function (request) {
    return await this.association(request, "employee", "REMOVE");
  },
  /** Guards Employee reads before generated provider query/count execution. @param {Object} request Exact get. @returns {boolean} Existing read guard. */
  employeePreGet: function (request) {
    return this.fixed(request, "employee").guardContactRead(request);
  },
  /** Redacts nested Employee Contact evidence with exact private-read handling. @param {Object} request Exact get. @param {Object} response Generated envelope. @returns {boolean} Existing projection result. */
  employeePostGet: function (request, response) {
    return this.fixed(request, "employee").redactContactRead(request, response);
  },
};
