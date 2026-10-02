/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nConfig/test/runtimeRootDataReleaseProjectionContract
 * @description Checks declared inactive-owner release discovery after live and offline role-profile composition without installing data or starting providers.
 * @layer test
 * @owner nConfig
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const initializer = require("../src/service/DefaultFrameworkInitializerService");
const releases = require("../../nData/nImport/import/src/service/release/defaultDataReleaseService");
const framework = path.resolve(__dirname, "../../../..");

function fixture(t) {
  const root = fs.mkdtempSync(
    path.join(os.tmpdir(), "nodics-root-release-profile-"),
  );
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const environment = path.join(root, "envs/local");
  const server = path.join(environment, "worker");
  for (const [directory, metadata] of [
    [root, { name: "test.project" }],
    [
      environment,
      { name: "local", nodics: { kind: "group", runtimeModule: true } },
    ],
    [
      server,
      {
        name: "worker",
        nodics: {
          kind: "server",
          runtimeModule: true,
          runtimeModuleRoots: ["nodics.process", "nodics.wcms"],
        },
      },
    ],
  ]) {
    fs.mkdirSync(directory, { recursive: true });
    fs.writeFileSync(
      path.join(directory, "package.json"),
      JSON.stringify(metadata),
    );
  }
  const properties = {
    runtimeRole: { code: "PROCESS" },
    data: {
      dataReleases: {
        runtimeRoleProfiles: {
          PROCESS: {
            contributions: [
              { moduleName: "editorial", sections: ["editorialWorkflows"] },
            ],
          },
        },
      },
    },
  };
  const oldNodics = global.NODICS,
    oldConfig = global.CONFIG;
  t.after(() => {
    global.NODICS = oldNodics;
    global.CONFIG = oldConfig;
  });
  global.NODICS = {
    getNodicsHome: () => path.join(framework, "nodics.foundation"),
    getEnvironmentPath: () => root,
    getServerRootPath: () => environment,
    getServerPath: () => server,
    getActiveModules: () => ["workflow"],
    getRawModules: () => ({}),
    getRawModule: (name) =>
      name === "cms"
        ? {
            name,
            index: "50.20",
            path: path.join(framework, "nodics.wcms/modules/cms"),
            metaData: { nodics: {} },
          }
        : undefined,
  };
  return { root, properties };
}

for (const mode of ["live", "offline"]) {
  test(`${mode} composition retains declared CMS and later editorial selectors without activating CMS`, (t) => {
    const { root, properties } = fixture(t);
    const original = structuredClone(properties);
    const resolved =
      mode === "live"
        ? initializer.deriveCurrentRuntimeConfiguration(properties)
        : initializer.readDeploymentConfiguration({
            projectRoot: root,
            environmentCode: "local",
            serverCode: "worker",
            frameworkRoot: framework,
            inheritedProperties: properties,
          });
    const policy = resolved.data.dataReleases;
    assert.deepEqual(policy.contributions, [
      { moduleName: "cms", sections: ["cmsPublicationApproval"] },
      { moduleName: "media", sections: ["mediaPublicationWorkflow"] },
      { moduleName: "editorial", sections: ["editorialWorkflows"] },
    ]);
    assert.equal(
      policy.installers.PROCESS_DEFINITION,
      "DefaultProcessDefinitionContributionService",
    );
    assert.equal(policy.runtimeRoleProfiles, undefined);
    assert.deepEqual(properties, original);
    assert.deepEqual(NODICS.getActiveModules(), ["workflow"]);
    global.CONFIG = { get: (key) => resolved[key] };
    const discovered = releases.discoverReleases("init");
    assert.deepEqual(
      discovered.map((release) => release.releaseCode),
      ["cms:cmsPublicationApproval"],
    );
    assert.equal(discovered[0].version, "1.0.0");
    assert.equal(discovered[0].destinationRole, "PROCESS");
    assert.equal(discovered[0].invalidManifest, undefined);
    policy.contributions = [];
    assert.deepEqual(
      releases.discoverReleases("init"),
      [],
      "raw presence alone does not delegate inactive releases",
    );
  });
}
