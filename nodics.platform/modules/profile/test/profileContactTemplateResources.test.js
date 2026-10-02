/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module profile/test/profileContactTemplateResources @description Deferred Contact-specific layered EMAIL/SMS resource rendering fixtures; no transport or sender. @owner profile @layer test */
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const templates = require("../../../../nodics.communication/modules/commsCore/src/service/defaultCommunicationTemplateService");
const policy =
  require("../../../../nodics.communication/modules/commsCore/config/properties").communication;
for (const channel of ["EMAIL", "SMS"])
  test("Contact-specific " + channel + " resource", () => {
    const previous = global.NODICS;
    const module = { name: "profile", path: path.resolve(__dirname, "..") };
    global.NODICS = {
      getIndexedModules: () => new Map([["profile", module]]),
      getRawModule: () => module,
    };
    try {
      const code =
        channel === "EMAIL"
          ? "profile.contact.emailVerification"
          : "profile.contact.smsVerification";
      assert.equal(
        templates.resolve(
          { templateCode: code, channel, locale: "en" },
          policy,
        ),
        undefined,
      );
      const approvedPolicy = {
        ...policy,
        templateResources: {
          ...policy.templateResources,
          selections: { ...policy.templateResources.selections, [code]: true },
        },
      };
      const template = templates.resolve(
        { templateCode: code, channel, locale: "en" },
        approvedPolicy,
      );
      assert.equal(template.purpose, "PROFILE_CANONICAL_CONTACT");
      assert.deepEqual(template.sourceModules, ["profile"]);
      const rendered = templates.render(
        template,
        {
          verificationCode: "FAKE-CODE",
          expiresAt: "2026-10-02T14:30:00.000Z",
        },
        approvedPolicy,
      );
      assert.ok(rendered.body.includes("FAKE-CODE"));
      assert.ok(
        rendered.body.includes(
          templates.presentDateTime("2026-10-02T14:30:00.000Z", approvedPolicy),
        ),
      );
      assert.ok(!rendered.body.includes("{{"));
      assert.ok(!code.includes("employee"));
      assert.throws(
        () =>
          templates.render(
            template,
            {
              verificationCode: "FAKE",
              expiresAt: "2026-10-02T14:30:00.000Z",
              password: "forbidden",
            },
            approvedPolicy,
          ),
        /not declared/,
      );
      assert.throws(
        () =>
          templates.render(
            template,
            {
              verificationCode: "FAKE-CODE",
              expiresAt: "INVALID-DATE",
            },
            approvedPolicy,
          ),
        /date-time presentation is invalid/,
      );
    } finally {
      global.NODICS = previous;
    }
  });
