/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module profile/test/profileCustomerRegistrationForm @description Proves canonical account normalization, server validation, caller-field isolation and later-layer policy customization through the existing signup facade. @owner profile @layer test */
const { test, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const registration = require("../src/service/customer/defaultCustomerRegistrationService");
const controller = require("../src/controller/customer/DefaultCustomerController");
let policy, saved;
class OwnerError extends Error {
  constructor(code) {
    super(code);
    this.code = code;
  }
}
const form = {
  email: "  USER@EXAMPLE.COM ",
  name: "  Jane   Doe  ",
  password: "long-password-example",
};
beforeEach(() => {
  policy = {
    ...require("../config/properties").profileCustomerRegistrationForm,
  };
  saved = null;
  global.CONFIG = {
    get: (key) =>
      key === "profileCustomerRegistrationForm" ? policy : undefined,
  };
  global.CLASSES = { NodicsError: OwnerError };
  global.SERVICE = { DefaultCustomerRegistrationService: registration };
  global.FACADE = {
    DefaultCustomerFacade: {
      signUp: async (request) => {
        saved = request.model;
        return { result: { sensitive: true } };
      },
    },
  };
});
test("normalizes email/name and derives canonical identity while stripping privilege and verification input", async () => {
  const response = await controller.registerForm({
    httpRequest: {
      body: {
        ...form,
        code: "admin",
        userGroups: ["adminGroup"],
        principalType: "service",
        emailVerified: true,
      },
    },
  });
  assert.equal(saved.loginId, "user@example.com");
  assert.deepEqual(saved.name, { firstName: "Jane", lastName: "Doe" });
  assert.match(saved.code, /^CUSTOMER_[A-F0-9]{24}$/);
  assert.equal(saved.password.loginId, saved.loginId);
  assert.equal(saved.userGroups, undefined);
  assert.equal(saved.emailVerified, undefined);
  assert.equal(saved.principalType, undefined);
  assert.deepEqual(response.result, { registered: true });
});
test("mononyms remain valid and normalized login gives the existing stable customer reference", () => {
  const first = registration.formModel({ ...form, name: "Cher" });
  assert.deepEqual(first.name, { firstName: "Cher" });
  assert.equal(
    first.code,
    registration.formModel({ ...form, email: "user@example.com" }).code,
  );
});
test("invalid form is rejected before signup and no name/password is silently truncated", async () => {
  for (const delta of [
    { email: "invalid" },
    { password: "short" },
    { password: "x".repeat(129) },
    { name: "" },
    { name: "a".repeat(81) },
    { name: "First " + "z".repeat(81) },
  ]) {
    await assert.rejects(
      controller.registerForm({ httpRequest: { body: { ...form, ...delta } } }),
      { code: "ERR_PROFILE_REGISTRATION_FORM" },
    );
    assert.equal(saved, null);
  }
});
test("owner validation and identity member remain supported later-layer extension points", () => {
  policy.minimumPasswordCharacters = 16;
  assert.throws(
    () => registration.formModel({ ...form, password: "a".repeat(15) }),
    { code: "ERR_PROFILE_REGISTRATION_FORM" },
  );
  const customized = {
    ...registration,
    formCustomerCode: (login) => "PARTNER_" + login,
  };
  assert.equal(customized.formModel(form).code, "PARTNER_user@example.com");
});
test("service registration persists customer through Profile system write context", async () => {
  const systemAuth = {
    isSystem: true,
    userGroups: ["serviceAccountUserGroup"],
  };
  global.SERVICE.DefaultIdentityGovernanceService = {
    getSystemAuthData: () => systemAuth,
  };
  const currentConfig = CONFIG.get;
  CONFIG.get = (key) =>
    key === "profileCustomerParticipation"
      ? { eligibilityService: "DefaultKycDecisionEnforcementService" }
      : currentConfig(key);
  SERVICE.DefaultEnterpriseManagementService = {
    retrieveEnterpriseForAccess: async (code) => {
      assert.equal(code, "fixture-enterprise");
      return { enterprise: { code, active: true }, tenantCode: "default" };
    },
  };
  const approved = Object.freeze({
    eligible: true,
    decisionId: "FIXTURE_ONLY_DECISION",
  });
  const admissions = new WeakSet();
  // This consumer fixture supplies an explicit isolated decision owner; durable audit/private admission itself is exercised by the governance contract.
  SERVICE.DefaultKycDecisionEnforcementService = {
    enforce: async (request, action, subject) => {
      assert.equal(request.tenant, "default");
      assert.equal(action, "ONBOARDING");
      assert.deepEqual(subject, {
        subjectType: "CUSTOMER",
        subjectCode: "user@example.com",
        enterpriseCode: "fixture-enterprise",
      });
      return approved;
    },
  };
  SERVICE.DefaultCustomerEligibilityDecisionGovernanceService = {
    transferRegistrationDecision: (original, projected) => {
      assert.equal(original, approved);
      assert.deepEqual(projected, approved);
      admissions.add(projected);
      return projected;
    },
    withRegistrationDecision: async (command, decision, operation) => {
      assert.equal(admissions.has(decision), true);
      admissions.delete(decision);
      assert.equal(command.kycDecisionReference, approved.decisionId);
      assert.equal(command.authData, systemAuth);
      return operation(command);
    },
  };
  let savedRequest;
  const outcome = await new Promise((resolve, reject) =>
    registration.createCustomer(
      {
        tenant: "default",
        enterprise: { code: "fixture-enterprise" },
        authData: { tokenType: "service" },
        model: { loginId: "user@example.com" },
        defaultCustomerService: {
          save: async (request) => {
            savedRequest = request;
            return {
              code: "SUC_SAVE_00000",
              result: { code: request.model.loginId },
            };
          },
        },
      },
      {},
      {
        nextSuccess: (request, response) => resolve(response.success),
        error: (request, response, error) => reject(error),
      },
    ),
  );
  assert.equal(outcome.code, "SUC_SAVE_00000");
  assert.deepEqual(savedRequest.authData, systemAuth);
  assert.equal(savedRequest.model.loginId, "user@example.com");
  assert.equal(savedRequest.kycDecisionReference, approved.decisionId);
});

test("service registration with no selected eligibility owner completes failure and never saves", async () => {
  let savedRequest;
  SERVICE.DefaultKycDecisionEnforcementService = null;
  const failure = await new Promise((resolve, reject) =>
    registration.createCustomer(
      {
        tenant: "default",
        enterprise: { code: "fixture-enterprise" },
        model: { loginId: "user@example.com" },
        defaultCustomerService: {
          save: async (request) => {
            savedRequest = request;
          },
        },
      },
      {},
      {
        nextSuccess: () =>
          reject(Error("missing owner must not complete registration")),
        error: (request, response, error) => resolve(error),
      },
    ),
  );
  assert.match(String(failure), /ERR_PROFILE_MEMBERSHIP_UNAVAILABLE/);
  assert.equal(savedRequest, undefined);
});
