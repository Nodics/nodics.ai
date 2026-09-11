/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module eWaste/test/eWasteBackofficeContributionContract @description Proves separate navigation ownership and registration/authorization withdrawal across module boundaries. @layer test @owner eWaste */
const { test, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const root = path.resolve(__dirname, "../../../../../..");
const source = (file) => require(path.join(root, file));
const coreData = source(
  "nodics.waste/modules/wasteCore/data/backoffice/wasteCoreBackofficeCapabilityData",
);
const data = require("../data/backoffice/eWasteBackofficeCapabilityData");
const builder = source(
  "nodics.foundation/modules/nService/src/service/module/defaultBackofficeCapabilityDataService",
);
const registry = source(
  "nodics.platform/modules/backoffice/src/service/registry/defaultBackofficeCapabilityRegistryService",
);
const contract = source(
  "nodics.platform/modules/backoffice/src/service/contract/defaultBackofficeContractService",
);
let core, electronics;
beforeEach(() => {
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(code, message) {
        super(message);
        this.code = code;
      }
    },
  };
  global.SERVICE = {
    DefaultBackofficeCapabilityDefinitionService: source(
      "nodics.foundation/modules/nService/src/service/module/defaultBackofficeCapabilityDefinitionService",
    ),
    DefaultBackofficeCapabilityDataService: builder,
    DefaultBackofficeRegistryService: {
      evaluateCompatibility: () => ({ status: "COMPATIBLE" }),
    },
  };
  core = builder.capability(coreData);
  electronics = builder.capability(data);
});
const catalogue = (modules, permissions = ["*"]) =>
  registry.buildCatalogue(modules, 1, { permissions });
test("Waste core owns only generic operational links; eWaste registers its own Electronics tree", async () => {
  assert.equal(contract.validateBackofficeMetadata(core), true);
  assert.equal(contract.validateBackofficeMetadata(electronics), true);
  assert.deepEqual(
    core.navigation
      .filter((item) => item.parentId === "waste-operations")
      .map((item) => item.label),
    ["All submissions", "Review queue"],
  );
  assert.equal(
    /Electronics|Clothing|TEXTILES|eWaste/.test(JSON.stringify(coreData)),
    false,
  );
  assert.deepEqual(
    electronics.navigation.map((item) => item.label),
    ["Electronics", "Submissions", "Review queue"],
  );
  assert.equal(
    core.navigation.find((item) => item.id === "waste-operations")
      .backendWorkspace.viewCode,
    "waste.overview",
  );
  assert.equal(
    electronics.navigation[0].backendWorkspace.viewCode,
    "ewaste.overview",
  );
  assert.equal(electronics.navigation[0].parentModuleName, "wasteCore");
  assert.equal(electronics.navigation[0].parentId, "waste-operations");
  const registered = [];
  SERVICE.DefaultModuleRegistrationAgentService = {
    registerBackofficeCapabilityProvider: (module, provider) =>
      registered.push(module),
  };
  await require("../src/service/defaultEWasteBackofficeCapabilityService").init();
  assert.deepEqual(registered, ["eWaste"]);
});
test("active contributions attach without copying parent group data", () => {
  const result = catalogue({
    wasteCore: [{ backoffice: core }],
    eWaste: [{ backoffice: electronics }],
  });
  assert.equal(data.defaults.group, undefined);
  assert.equal(result.eWaste.navigation.length, 3);
  assert.equal(
    result.eWaste.navigation[2].group.id,
    "sustainability-operations",
  );
  assert.equal(
    electronics.navigation[2].group,
    undefined,
    "aggregation must not mutate the source contribution",
  );
});
test("absent or denied anchor withdraws the complete accelerator branch including local grandchildren", () => {
  assert.equal(
    catalogue({ eWaste: [{ backoffice: electronics }] }).eWaste.navigation
      .length,
    0,
  );
  core.navigation.find(
    (item) => item.id === "waste-operations",
  ).requiredPermissions = ["waste.anchor.only"];
  const result = catalogue(
    {
      wasteCore: [{ backoffice: core }],
      eWaste: [{ backoffice: electronics }],
    },
    ["waste.backoffice.view"],
  );
  assert.equal(result.eWaste.navigation.length, 0);
  assert.ok(
    result.wasteCore.navigation.some((item) => item.id === "waste-management"),
    "unrelated configuration remains available",
  );
  assert.equal(
    catalogue({ wasteCore: [{ backoffice: core }] }).eWaste,
    undefined,
  );
});
test("future accelerator fixture can attach through the same contract without a core edit", () => {
  const future = structuredClone(electronics);
  future.navigation = future.navigation.map((item) => ({
    ...item,
    id: item.id.replace("ewaste", "apparelwaste"),
    label: item.label === "Electronics" ? "Clothing & Textiles" : item.label,
    route: item.route.replace("electronics", "textiles"),
    parentId:
      item.parentId === "waste-operations"
        ? item.parentId
        : item.parentId.replace("ewaste", "apparelwaste"),
  }));
  const result = catalogue({
    wasteCore: [{ backoffice: core }],
    eWaste: [{ backoffice: electronics }],
    apparelWaste: [{ backoffice: future }],
  });
  assert.equal(result.apparelWaste.navigation.length, 3);
  assert.equal(result.apparelWaste.navigation[0].label, "Clothing & Textiles");
});
test("disabled or denied accelerator contribution leaves the generic Waste workspace usable", () => {
  const inactive = catalogue({
    wasteCore: [{ backoffice: core }],
    eWaste: [{ backoffice: { ...electronics, enabled: false } }],
  });
  assert.equal(inactive.eWaste, undefined);
  assert.equal(
    inactive.wasteCore.navigation.filter(
      (item) => item.parentId === "waste-operations",
    ).length,
    2,
  );
  electronics.navigation[0].requiredPermissions = ["ewaste.only"];
  const denied = catalogue(
    {
      wasteCore: [{ backoffice: core }],
      eWaste: [{ backoffice: electronics }],
    },
    ["waste.backoffice.view"],
  );
  assert.equal(denied.eWaste.navigation.length, 0);
  assert.equal(
    denied.wasteCore.navigation.filter(
      (item) => item.parentId === "waste-operations",
    ).length,
    2,
  );
});
test("cross-provider cycles fail instead of rendering detached navigation", () => {
  core.navigation = [
    {
      ...core.navigation.find((item) => item.id === "waste-operations"),
      parentId: "ewaste-operations",
      parentModuleName: "eWaste",
    },
  ];
  assert.throws(
    () =>
      catalogue({
        wasteCore: [{ backoffice: core }],
        eWaste: [{ backoffice: electronics }],
      }),
    /Cyclic/,
  );
});
test("native workspace declarations allow stable keys and reject executable or unbounded metadata", () => {
  const view = electronics.navigation[0].backendWorkspace;
  assert.equal(contract.validateBackendWorkspace(view), true);
  for (const change of [
    { component: "./evil.js" },
    { script: "alert(1)" },
    { renderer: "javascript:evil" },
    { workspaceCode: "https://example.com" },
    { viewCode: "x".repeat(129) },
    { contractVersion: 2 },
  ])
    assert.equal(
      contract.validateBackendWorkspace({ ...view, ...change }),
      false,
    );
});
test("later-layer labels and ordering customize placement without changing source ownership", () => {
  const custom = structuredClone(data);
  custom.navigation[0].label = "Device recovery";
  custom.navigation[0].order = 700;
  const result = builder.capability(custom);
  assert.equal(result.navigation[0].label, "Device recovery");
  assert.equal(result.navigation[0].parentModuleName, "wasteCore");
  assert.equal(data.navigation[0].label, "Electronics");
});

test("capability source is declared separately from executable core imports", () => {
  for (const owner of [
    "nodics.waste/modules/wasteCore",
    "nodics.accelerators/modules/waste/modules/eWaste",
  ]) {
    const manifest = source(owner + "/data/manifest.json");
    const contribution = manifest.sections["backoffice-capability"];
    assert.equal(contribution.kind, "SOURCE_CONTRIBUTION");
    const paths = Object.keys(contribution.files);
    assert.equal(paths.length, 1);
    for (const section of Object.values(manifest.sections).filter(
      (section) => section.kind === "DATA_RELEASE",
    ))
      assert.equal(
        paths.some((file) => Object.hasOwn(section.files, file)),
        false,
      );
    const fs = require("node:fs"),
      crypto = require("node:crypto");
    assert.equal(
      contribution.files[paths[0]],
      crypto
        .createHash("sha256")
        .update(fs.readFileSync(path.join(root, owner, "data", paths[0])))
        .digest("hex"),
    );
  }
});
