/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module profile/test/employeeTemplateResources @description Proves all Profile-owned employee mail defaults match owner configuration and render with non-secret fixtures. @owner profile @layer test */
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const templates = require("../../../../nodics.communication/modules/commsCore/src/service/defaultCommunicationTemplateService");
const policy =
  require("../../../../nodics.communication/modules/commsCore/config/properties").communication;
const profile = require("../config/properties");
const declarations = [
  profile.enterpriseManagement.registration.mail,
  profile.profileEmployeeRecovery.mail,
  profile.profileEmployeeRecovery.confirmation,
  profile.enterpriseManagement.applications.review.mail,
  {
    templateCode: "profile.employee.invitation",
    purpose: "EMPLOYEE_INVITATION",
  },
  {
    templateCode: "profile.employee.accountReady",
    purpose: "EMPLOYEE_ACCOUNT_READY",
  },
];
for (const declaration of declarations) {
  test(
    "Profile template contract and non-secret presentation: " +
      declaration.templateCode,
    () => {
      const previous = global.NODICS;
      const module = { name: "profile", path: path.resolve(__dirname, "..") };
      global.NODICS = {
        getIndexedModules: () => new Map([["profile", module]]),
        getRawModule: () => module,
      };
      try {
        const template = templates.resolve(
          {
            templateCode: declaration.templateCode,
            channel: "EMAIL",
            locale: "en",
          },
          policy,
        );
        assert.equal(template.purpose, declaration.purpose);
        assert.deepEqual(template.sourceModules, ["profile"]);
        const variables = Object.fromEntries(
          Object.entries(template.parameters)
            .filter(([, value]) => value.required)
            .map(([name, parameter]) => [
              name,
              parameter.presentation === "date-time"
                ? "2026-10-02T14:30:00.000Z"
                : parameter.format === "https-url"
                  ? "https://example.test/fixture"
                  : "FAKE TEST VALUE",
            ]),
        );
        const rendered = templates.render(template, variables, policy);
        assert.ok(rendered.subject);
        assert.ok(rendered.body);
        assert.ok(rendered.html.includes("<html"));
        assert.ok(!rendered.html.includes("{{"));
        assert.ok(!rendered.body.includes("{{"));
        for (const [name, parameter] of Object.entries(template.parameters)) {
          if (parameter.presentation !== "date-time") continue;
          assert.ok(
            rendered.body.includes(
              templates.presentDateTime(variables[name], policy),
            ),
          );
          assert.throws(
            () =>
              templates.render(
                template,
                { ...variables, [name]: "INVALID-DATE" },
                policy,
              ),
            /date-time presentation is invalid/,
          );
        }
        assert.equal(template.parameters.password, undefined);
        assert.equal(template.parameters.credential, undefined);
        assert.throws(
          () =>
            templates.render(
              template,
              { ...variables, password: "forbidden" },
              policy,
            ),
          /not declared/,
        );
      } finally {
        global.NODICS = previous;
      }
    },
  );
}
