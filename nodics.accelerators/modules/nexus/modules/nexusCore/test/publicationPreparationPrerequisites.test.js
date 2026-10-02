/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nexusCore/test/publicationPreparationPrerequisites
 * @description Protects explicit Media approval prerequisites without selecting grants or Commerce domains.
 * @layer test
 * @owner nexusCore
 */
const assert = require("node:assert/strict");
const { test } = require("node:test");
const path = require("node:path");
const fs = require("node:fs");
const properties = require("../config/properties");
test("Nexus declares only its actual Media workflow before content preparation", () => {
  const steps =
    properties.backofficeApplicationInitialization.profiles.nexus.dataPackages
      .value;
  assert.deepEqual(
    steps
      .filter((step) => step.targetRuntimeRole === "PROCESS")
      .map((step) => step.code),
    ["media:mediaPublicationWorkflow"],
  );
  assert.equal(steps[0].code, "media:mediaPublicationWorkflow");
  assert.equal(steps[0].dataType, "init");
  assert.equal(steps[0].targetServer, "process");
  assert.equal(steps[0].required, true);
  assert.equal(steps[0].trigger, "USER");
  const ownerRoot = path.resolve(
    __dirname,
    "../../../../../../nodics.wcms/modules/media",
  );
  const manifest = JSON.parse(
    fs.readFileSync(path.join(ownerRoot, "data/manifest.json"), "utf8"),
  );
  const release = manifest.sections.mediaPublicationWorkflow;
  assert.equal(manifest.module, "media");
  assert.equal(release.destinationRole, "PROCESS");
  assert.equal(release.selectionPolicy, "EXPLICIT");
  assert.equal(release.installer, "PROCESS_DEFINITION");
  assert(
    Object.keys(release.files).every(
      (file) =>
        file.includes("/records/process/") &&
        !/grant|permission|accessGroup/i.test(file),
    ),
  );
});
