/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module import/test/startupDestinationOwnership
 * @description Composes actual WCMS module release discovery and nConfig role projection with startup/manual admission.
 * @layer test
 * @owner import
 */
const assert = require("node:assert/strict");
const test = require("node:test");
const path = require("node:path");
const lodash = require("lodash");
const service = require("../src/service/release/defaultDataReleaseService");
const initializer = require("../../../../nConfig/src/service/DefaultFrameworkInitializerService");
const root = path.resolve(__dirname, "../../../../../..");

function setup(role = "WCMS_ONLINE") {
  const properties = initializer.deriveRuntimeRoleDataReleases(
    lodash.merge(
      {},
      require("../config/properties"),
      require(path.join(root, "nodics.wcms/config/properties")),
      { runtimeRole: { code: role }, environment: { class: "LOCAL" } },
    ),
  );
  const modules = Object.fromEntries(
    ["cms", "media", "wcms", "editorial"].map((name, index) => [
      name,
      {
        name,
        index: "60." + index,
        parent: "nodics.wcms",
        path: path.join(root, "nodics.wcms/modules", name),
      },
    ]),
  );
  let effects = 0;
  global.CONFIG = { get: (key) => properties[key] };
  global.NODICS = {
    getActiveModules: () => Object.keys(modules),
    getRawModule: (name) => modules[name],
  };
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(code, message) {
        super(message);
        this.code = code;
      }
    },
  };
  global.SERVICE = {
    DefaultDataInstallationService: {
      get: async () => {
        effects += 1;
        throw new Error("Unexpected receipt read");
      },
    },
  };
  return { properties, effects: () => effects };
}

test("actual Online initializer excludes media:init-v002 fallback through effective empty role allowance", async () => {
  const fixture = setup();
  assert.deepEqual(
    fixture.properties.data.dataReleases.allowedDestinationRoles,
    [],
  );
  const discovered = service.discoverReleases("init");
  const candidate = discovered.find(
    (release) => release.releaseCode === "media:init-v002",
  );
  assert.ok(
    candidate,
    "Retained conventional Media source must exercise real discovery",
  );
  assert.equal(candidate.destinationRole, "WCMS_ONLINE");
  assert.equal(candidate.sourceRoot, "init-v002");
  assert.equal(candidate.invalidManifest, undefined);
  assert.equal(service.isDestinationCompatible(candidate), false);
  const result = await service.installStartupReleases({
    tenant: "default",
    modules: NODICS.getActiveModules(),
  });
  assert.deepEqual(result, { skipped: true, reason: "NO_INIT_RELEASES" });
  assert.equal(fixture.effects(), 0);
  await assert.rejects(
    service.preparePlan({
      tenant: "default",
      releaseRequest: {
        dataType: "init",
        releaseCodes: [candidate.releaseCode],
      },
    }),
    { code: "ERR_IMP_00004" },
  );
  assert.equal(
    fixture.effects(),
    0,
    "Explicit request must refuse before receipt/import operations",
  );
});

test("actual Staged release selection remains admitted; Online cannot import Staged or Process releases", () => {
  setup("WCMS_STAGED");
  const staged = service
    .discoverReleases("init")
    .find((release) => release.releaseCode === "cms:init-v001");
  assert.ok(staged);
  assert.equal(staged.destinationRole, "WCMS_STAGED");
  assert.equal(service.isDestinationCompatible(staged), true);
  assert.equal(service.validateDestination(staged), true);
  setup();
  assert.equal(service.isDestinationCompatible(staged), false);
  assert.throws(() => service.validateDestination(staged), {
    code: "ERR_IMP_00004",
  });
  const process = service
    .discoverReleases("init")
    .find((release) => release.releaseCode === "cms:cmsPublicationApproval");
  assert.equal(service.isDestinationCompatible(process), false);
  assert.throws(() => service.validateDestination(process), {
    code: "ERR_IMP_00004",
  });
});

test("empty, explicit, omitted and mismatched role allowances stay identical to manual destination policy", () => {
  const { properties } = setup();
  const release = { destinationRole: "WCMS_ONLINE", environmentScope: ["ALL"] };
  for (const allowed of [[], ["WCMS_STAGED"], ["WCMS_ONLINE"]]) {
    properties.data.dataReleases.allowedDestinationRoles = allowed;
    const admitted = allowed.includes("WCMS_ONLINE");
    assert.equal(service.isDestinationCompatible(release), admitted);
    if (admitted) assert.equal(service.validateDestination(release), true);
    else
      assert.throws(() => service.validateDestination(release), {
        code: "ERR_IMP_00004",
      });
  }
  delete properties.data.dataReleases.allowedDestinationRoles;
  assert.equal(service.isDestinationCompatible(release), true);
  assert.equal(service.validateDestination(release), true);
  assert.equal(
    service.isDestinationCompatible({
      ...release,
      environmentScope: ["PRODUCTION"],
    }),
    false,
  );
});
