/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module backoffice/test/applicationImportHistoryHandoffContract
 * @description Uses actual authorized registry navigation and exact fresh runtime evidence for read-only recovery.
 * @layer test
 * @owner backoffice
 */
const assert = require("node:assert/strict");
const { test, after } = require("node:test");
const application = require("../src/service/defaultBackofficeApplicationInitializationService");
const registry = require("../src/service/registry/defaultBackofficeRegistryService");
const capabilities = require("../src/service/registry/defaultBackofficeCapabilityRegistryService");
const availability = require("../src/service/availability/defaultBackofficeAvailabilityService");
const previous = {
  SERVICE: global.SERVICE,
  NODICS: global.NODICS,
  CONFIG: global.CONFIG,
};
after(() => {
  for (const [key, value] of Object.entries(previous)) {
    if (value === undefined) delete global[key];
    else global[key] = value;
  }
});
const target = {
  targetServer: "contentStaged",
  targetRuntimeRole: "WCMS_STAGED",
};
const request = {
  tenant: "tenant",
  authData: { permissions: ["import.history"] },
};
function fixture({
  permissions = ["import.history"],
  duplicate = false,
  expired = false,
  environment = "local",
  observed = true,
  route = "/custom/operations/imports-exports",
  active = true,
} = {}) {
  const navigation = {
    id: "imports-exports",
    route,
    label: "Imports",
    requiredPermissions: ["import.history"],
  };
  const leases = [
    {
      moduleName: "backoffice",
      instanceId: "bo-1",
      environment: "local",
      state: "UP",
      expiresAt: Date.now() + 60000,
      backoffice: { contractVersion: 1, navigation: [navigation] },
    },
    {
      moduleName: "import",
      instanceId: "staged-import-1",
      environment,
      server: target.targetServer,
      runtimeRole: { code: target.targetRuntimeRole, publication: "STAGED" },
      state: "UP",
      clientCallable: true,
      endpoint: "http://localhost:9000/nodics/import",
      expiresAt: expired ? 1 : Date.now() + 60000,
      privateToken: "do-not-project",
      functionalModuleIdentity: "import",
      backoffice: { contractVersion: 1 },
    },
  ];
  if (duplicate) leases.push({ ...leases[1], instanceId: "staged-import-2" });
  const registryOwner = Object.assign(Object.create(registry), {
    _navigationCompositionState: {},
    _store: {
      values: async () => leases.map((value) => ({ value })),
      remove: () => {
        throw new Error("No registry writes allowed");
      },
    },
    expireStale: () => {
      throw new Error("Recovery must not expire registry leases");
    },
    audit: () => {
      throw new Error("Recovery must not emit audits");
    },
  });
  const availabilityOwner = Object.assign(Object.create(availability), {
    _observations: new Map(
      leases
        .filter((item) => observed || item.moduleName === "backoffice")
        .map((item) => [
          item.instanceId,
          { state: "UP", observedAt: new Date().toISOString() },
        ]),
    ),
    _metrics: { staleReads: 0 },
  });
  global.CONFIG = {
    get: (key) =>
      key === "backofficeRegistry"
        ? {
            clientSafeMetadata: [
              "moduleName",
              "instanceId",
              "environment",
              "server",
              "runtimeRole",
              "state",
              "clientCallable",
              "endpoint",
              "backoffice",
              "functionalModuleIdentity",
            ],
            modulePermissions: { import: ["import.history"] },
          }
        : undefined,
  };
  global.NODICS = { getSelectedEnvironmentName: () => "local" };
  global.SERVICE = {
    DefaultBackofficeRegistryService: registryOwner,
    DefaultBackofficeCapabilityRegistryService: capabilities,
    DefaultBackofficeAvailabilityService: availabilityOwner,
    DefaultFunctionalModuleCatalogueService: {
      getPresentationEligibility: async () => ({
        governedModules: ["import"],
        eligibleModules: active ? ["import"] : [],
      }),
    },
  };
  return { registryOwner, request: { ...request, authData: { permissions } } };
}

test("actual registry and navigation owners supply exact runtime History with a customized route", async () => {
  const setup = fixture();
  const handoff = await application.importHistoryHandoff(target, setup.request);
  assert.equal(handoff.available, true);
  assert.equal(
    handoff.route,
    "/custom/operations/imports-exports?area=history&importInstance=staged-import-1",
  );
  assert.equal(handoff.readOnly, true);
  assert.equal(handoff.automaticExecution, false);
  assert(!JSON.stringify(handoff).includes("do-not-project"));
  assert(!JSON.stringify(handoff).includes("localhost"));
  const repair = application.capabilityRepairProjection("IMPORT_FAILED", {
    ...target,
    historyHandoff: handoff,
  });
  assert.equal(repair.available, true);
  assert.equal(repair.route, handoff.route);
  assert.equal(repair.operation, undefined);
});

test("missing, ambiguous, expired, unhealthy, unauthorized and inactive owners never produce guessed routes", async () => {
  for (const options of [
    { permissions: [] },
    { duplicate: true },
    { expired: true },
    { environment: "other" },
    { observed: false },
    { active: false },
    { route: "//outside.invalid/history" },
    { route: "/../history" },
  ]) {
    const setup = fixture(options);
    const handoff = await application.importHistoryHandoff(
      target,
      setup.request,
    );
    assert.equal(handoff.available, false, JSON.stringify(options));
    assert.equal(handoff.route, undefined);
  }
});

test("missing registry service scope fails closed without a ReferenceError", async () => {
  delete global.SERVICE;
  assert.equal(
    (await application.importHistoryHandoff(target, request)).available,
    false,
  );
});

test("readiness projection attaches History only to actual owner-confirmed failed releases", async () => {
  const setup = fixture();
  const selected = Object.assign(Object.create(application), {
    preparationSteps: () => [
      {
        ...target,
        code: "nexus:content",
        type: "DATA_RELEASE",
        required: true,
      },
    ],
    functionalModulePreparationStatus: async () => [],
    preparationGroups: (profile, request, steps) => [{ steps }],
    invokeDataReleaseOperation: async () => ({
      releases: [
        {
          releaseCode: "nexus:content",
          status: "FAILED",
          lastRunId: "retained-run",
        },
      ],
    }),
  });
  const preparation = await selected.preparationStatus({}, setup.request);
  const blocker = selected.capabilityBlockers({ preparation })[0];
  assert.equal(blocker.code, "IMPORT_FAILED");
  assert.equal(blocker.repair.handoff.importInstance, "staged-import-1");
  assert(!blocker.repair.route.includes("retained-run"));
  selected.invokeDataReleaseOperation = async () => ({ releases: [] });
  const unknown = await selected.preparationStatus({}, setup.request);
  assert.equal(unknown.steps[0].historyHandoff, undefined);
});
