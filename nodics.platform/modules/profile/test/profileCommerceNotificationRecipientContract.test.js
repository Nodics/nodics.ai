/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
/** @module profile/test/profileCommerceNotificationRecipientContract @description Deferred financial-source and verified-contact admission fixtures; not live delivery acceptance. @layer test @owner profile */
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const implementation = require("../src/service/customer/defaultProfileCommerceNotificationRecipientService");

function fixture() {
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(code) {
        super(code);
        this.code = code;
      }
    },
  };
  global.CONFIG = {
    get: () => ({
      enabled: true,
      qualified: true,
      sourceConnectionName: "digitalCore",
      timeoutMs: 5000,
      verifiedContactService: "DefaultProfileVerifiedContactService",
      permission: "recipient.resolve",
    }),
  };
  const request = {
    tenant: "tenant",
    entCode: "enterprise",
    query: {},
    body: {
      channel: "EMAIL",
      source: {
        kind: "PURCHASED",
        orderCode: "order",
        sourceCode: "entitlement",
        orderRevision: 2,
      },
    },
  };
  const proof = {
    contractVersion: 1,
    sourceModule: "digitalCore",
    sourceType: "DIGITAL_COUPON_PURCHASED",
    committed: true,
    tenant: "tenant",
    enterpriseCode: "enterprise",
    ownerId: "buyer",
    channel: "EMAIL",
    source: { ...request.body.source },
  };
  const reads = [];
  global.SERVICE = {
    DefaultLoggerService: {
      assertSensitiveRequest: () => {},
      inheritRequestPrivacy: () => {},
    },
    DefaultServiceTokenService: {
      requireRuntimePrincipal: () => ({
        principalType: "service",
        tenant: "tenant",
        entCode: "enterprise",
        modules: ["digitalCore"],
        permissions: ["recipient.resolve"],
      }),
    },
    DefaultProfileVerifiedContactService: {
      resolveCanonicalContact: async (input) => {
        reads.push(input);
        return {
          verified: true,
          recipientId: "contact",
          recipientAddressReference: "verified@example.invalid",
        };
      },
    },
  };
  const owner = {
    ...implementation,
    source: async () => ({ ...proof, source: { ...proof.source } }),
  };
  return { request, proof, reads, owner };
}

test("only a committed exact event permits contact resolution; source is reread", async () => {
  const { request, proof, reads, owner } = fixture();
  let count = 0;
  owner.source = async () => {
    count++;
    return { ...proof, source: { ...proof.source } };
  };
  const result = await owner.resolve(request);
  assert.equal(count, 2);
  assert.equal(result.ownerId, "buyer");
  assert.deepEqual(reads, [
    {
      tenant: "tenant",
      enterpriseCode: "enterprise",
      ownerId: "buyer",
      channel: "EMAIL",
      purpose: "DIGITAL_COUPON_PURCHASED",
    },
  ]);
});

test("buyer input, uncommitted evidence and missing privacy refuse before contact reads", async () => {
  for (const mode of ["buyer", "uncommitted", "privacy"]) {
    const { request, proof, reads, owner } = fixture();
    if (mode === "buyer") request.body.ownerId = "another";
    if (mode === "uncommitted") proof.committed = false;
    if (mode === "privacy")
      SERVICE.DefaultLoggerService.assertSensitiveRequest = () => {
        throw new Error("private capture unavailable");
      };
    await assert.rejects(owner.resolve(request), { code: "ERR_AUTH_00003" });
    assert.equal(reads.length, 0);
  }
});

test("contact suppression and source drift never return a recipient", async () => {
  for (const mode of ["contact", "source"]) {
    const { request, proof, owner } = fixture();
    if (mode === "contact")
      SERVICE.DefaultProfileVerifiedContactService.resolveCanonicalContact =
        async () => ({ verified: false });
    let count = 0;
    owner.source = async () => ({
      ...proof,
      ownerId: mode === "source" && ++count === 2 ? "another" : "buyer",
      source: { ...proof.source },
    });
    await assert.rejects(owner.resolve(request), { code: "ERR_AUTH_00003" });
  }
});

test("signed scope is retained across asynchronous mutable request changes", async () => {
  const { request, proof, reads, owner } = fixture();
  owner.source = async (scope) => {
    request.tenant = "changed";
    request.entCode = "changed";
    assert.deepEqual(scope, { tenant: "tenant", entCode: "enterprise" });
    return { ...proof, source: { ...proof.source } };
  };
  const result = await owner.resolve(request);
  assert.equal(result.tenant, "tenant");
  assert.equal(reads[0].enterpriseCode, "enterprise");
});
