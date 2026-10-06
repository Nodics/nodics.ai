/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @file Verifies the explicit Copilot workflow contribution through the real Process owner registry and graph contracts, without installation or runtime grants. */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const ownerPath = path.resolve(__dirname, "../modules/copilotApi");
const manifest = require("../modules/copilotApi/data/manifest.json");
const registry = require("../../nodics.process/modules/workflow/src/service/operation/defaultProcessActionAdapterRegistryService");
const contributions = require("../../nodics.process/modules/workflow/src/service/definition/defaultProcessDefinitionContributionService");
const graph = require("../../nodics.process/modules/workflow/src/service/designer/defaultProcessGraphValidationService");

test("explicit Process contribution is immutable, domain-owned and inert until selected", () => {
  global.CONFIG = { get: () => ({}) };
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(code, message) {
        super(message);
        this.code = code;
      }
    },
  };
  global.NODICS = {
    getRawModule: (name) =>
      name === "copilotApi" ? { path: ownerPath } : undefined,
  };
  global.SERVICE = { DefaultProcessGraphValidationService: graph };
  const section = manifest.sections.knowledgeRefreshWorkflow;
  assert.equal(section.selectionPolicy, "EXPLICIT");
  assert.equal(section.destinationRole, "PROCESS");
  const [file, checksum] = Object.entries(section.files)[0];
  assert.equal(
    crypto
      .createHash("sha256")
      .update(fs.readFileSync(path.join(ownerPath, "data", file)))
      .digest("hex"),
    checksum,
  );
  const contribution = {
    ...section,
    moduleName: "copilotApi",
    releaseCode: "copilotApi:knowledgeRefreshWorkflow",
    checksum,
    declaredFiles: [file],
  };
  const definitions = contributions.contributionDefinitions(contribution);
  assert.equal(definitions.length, 1);
  assert.equal(definitions[0].ownerModule, "copilotApi");
  assert.deepEqual(definitions[0].policy.contextAllowlist, [
    "sourceCode",
    "expectedPolicyDigest",
  ]);
  assert.equal(section.version, "1.1.0");
  assert.equal(
    crypto
      .createHash("sha256")
      .update(
        fs.readFileSync(
          path.join(
            ownerPath,
            "data/init-v001/records/process/copilotKnowledgeWorkflowData.js",
          ),
        ),
      )
      .digest("hex"),
    "a0f19a23631d0367f4f0ecc2ceb0db7f917f6ebc60a4707cf05a5acca2c50b9a",
  );
  const action = definitions[0].graph.nodes.find(
    (node) => node.type === "ACTION",
  );
  assert.equal(action.retry.maximumAttempts, 1);
  assert.equal(registry.findAllowedAction(action.action), undefined);
  const declaration = registry.ownerDefinition("copilotApi.refreshKnowledge");
  assert.equal(declaration.remote.recordAttempts, true);
  assert.equal(
    declaration.remote.apiName,
    "/workflow/actions/refreshKnowledge",
  );
  global.CONFIG = {
    get: () => ({
      actionAdapters: { allowedActions: ["copilotApi.refreshKnowledge"] },
    }),
  };
  assert.deepEqual(registry.findAllowedAction(action.action), declaration);
  assert.throws(
    () =>
      contributions.validateContribution(
        { ...contribution, destinationRole: "COPILOT" },
        { definitions },
      ),
    /contract is invalid/,
  );
  assert.throws(
    () =>
      contributions.validateContribution(
        { ...contribution, owningDomain: "foreign" },
        { definitions },
      ),
    /identity is invalid/,
  );
});
