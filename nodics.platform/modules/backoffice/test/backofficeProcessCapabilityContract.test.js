/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module backoffice/test/backofficeProcessCapabilityContract
 * @description Protects the process/workflow capability metadata consumed by Axis through BackOffice.
 * @layer test
 * @owner backoffice
 */
const assert = require("assert");
const service = require("../src/service/contract/defaultBackofficeContractService");

const processCapability = require("../../../../nodics.process/modules/workflow/src/service/defaultWorkflowBackofficeCapabilityService")
  .getCapability();

assert(
  service.validateBackofficeMetadata(processCapability),
  "Process capability must expose valid BackOffice metadata",
);

assert.strictEqual(
  processCapability.capabilityId,
  "business-process-workflow",
  "Process capability id must remain stable",
);

const root = processCapability.navigation.find(
  (entry) => entry.id === "process-workflows",
);
assert(root, "Process root navigation must exist");
assert.strictEqual(root.route, "/process", "Process root route must be /process");

for (const entry of processCapability.navigation) {
  assert(
    entry.route.startsWith("/process"),
    `${entry.id} must stay inside the /process Axis route family`,
  );
  assert.strictEqual(
    entry.group.id,
    "process-and-automations",
    `${entry.id} must stay under Process and Automation group`,
  );
  assert(
    entry.help?.documentationRoute?.startsWith("/docs/capabilities/process-workflow") ||
      entry.help?.documentationRoute?.startsWith("/docs/framework/process/"),
    `${entry.id} must point to process/workflow documentation`,
  );
  assert(
    ["PREVIEW", "DISABLED"].includes(entry.featureState),
    `${entry.id} must stay explicitly gated until process APIs are implemented`,
  );
}

["pipeline-management", "automation-monitoring", "automation-advanced-configuration"].forEach((id) => {
  const entry = processCapability.navigation.find((item) => item.id === id);
  assert.strictEqual(entry.featureState, "DISABLED", `${id} must stay disabled while planned`);
});

console.log("BackOffice process capability contract passed");
