/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";

/** Verifies inert documentation setup metadata and later customer selection. */
const assert = require("node:assert/strict");
const merge = require("lodash/merge");
const test = require("node:test");
const defaults = require("../config/properties");
const consumer = require("../../backoffice/src/service/defaultBackofficeApplicationInitializationService");

test("documentation profiles remain inert until a customer selects them", () => {
  const previous = global.CONFIG;
  try {
    global.CONFIG = { get: key => defaults[key] };
    assert.deepEqual(consumer.profiles(), []);
    const custom = merge({}, defaults, { backofficeApplicationInitialization: { profiles: {
      frameworkdocs: { enabled: true, presentation: { title: "Operations Library" } }
    } } });
    const selected = custom.backofficeApplicationInitialization.profiles.frameworkdocs;
    assert.equal(selected.owner, "nodics.docs");
    assert.equal(selected.contentPackCode, "nodicsDocumentation");
    assert.equal(selected.presentation.title, "Operations Library");
    assert.equal(selected.presentation.activationPolicy.approvalRequiredForOnline, true);
    assert.equal(defaults.backofficeApplicationInitialization.profiles.frameworkdocs.enabled, false);
  } finally {
    global.CONFIG = previous;
  }
});
