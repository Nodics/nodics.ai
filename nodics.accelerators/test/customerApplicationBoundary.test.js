/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";

/** Guards the distinction between reusable accelerators and their customer applications. */
const assert = require("node:assert/strict");
const path = require("node:path");
const test = require("node:test");
const utils = require("../../nodics.foundation/modules/nConfig/src/utils/utils");

test("framework accelerator discovery does not own customer applications", () => {
  const records = [];
  const modules = {};
  utils.collectModuleRecords(path.resolve(__dirname, ".."), records, null);
  utils.indexModuleRecords(records, modules);
  for (const [application, accelerator] of [
    ["agora.apparel", "apparel"],
    ["agora.electronics", "electronics"],
    ["agora.telco", "telco"],
    ["circa.ewaste", "eWaste"],
  ]) {
    assert(modules[accelerator], "Reusable domain must remain discoverable");
    assert.equal(modules[application], undefined, "Customer application must remain project-owned");
  }
});
