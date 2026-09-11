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
