/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/*
 * Nodics - Enterprise Micro-Services Management Framework
 * Copyright (c) 2026 Nodics. Governed by the root LICENSE.
 */

/**
 * @module backoffice/test/profileConfiguredRegistrationContract
 * @description Verifies configured Profile registration and strict backend workspace transport admission without runtime resources.
 * @layer test
 * @owner backoffice
 */
const assert = require("node:assert/strict");
const test = require("node:test");
const contract = require("../src/service/contract/defaultBackofficeContractService");
const apiContracts = require("../src/schemas/apiContracts");
const profile = require("../../profile/config/properties");
const provider = require("../../profile/src/service/defaultProfileBackofficeCapabilityService");
const enterpriseManagement = require("../../profile/src/service/enterprise/defaultEnterpriseManagementService");
const setupContinuation = require("../../profile/src/service/enterprise/defaultEnterpriseSetupContinuationService");
const agentSource = require("../../../../nodics.foundation/modules/nService/src/service/module/defaultModuleRegistrationAgentService");
const clone = (value) => JSON.parse(JSON.stringify(value));
const createSection = () =>
  clone(profile.enterpriseManagement.workspace.tabs[0].sections[1]);

test("real registration builder admits configured Profile metadata without raising claim limits", () => {
  const previous = {
    CONFIG: global.CONFIG,
    ENUMS: global.ENUMS,
    NODICS: global.NODICS,
    SERVICE: global.SERVICE,
  };
  try {
    global.CONFIG = { get: (name) => profile[name] };
    global.ENUMS = {
      ContactType: Object.fromEntries(
        ["EMAIL", "PHONE", "FAX", "PAGER"].map((key) => [key, { key }]),
      ),
    };
    const rawSchema = require("../../profile/src/schemas/schemas").profile;
    const rawModule = {
      metaData: require("../../profile/package.json"),
      rawSchema,
      path: require("node:path").resolve(__dirname, "../../profile"),
      parent: "nodics.platform",
      canonicalIdentity: "nodics.platform/modules/profile",
    };
    global.NODICS = {
      getRawModule: () => rawModule,
      getServerName: () => "platformServer",
      getRouters: () => ({}),
    };
    global.SERVICE = {
      DefaultEnterpriseManagementService: enterpriseManagement,
      DefaultEnterpriseSetupContinuationService: setupContinuation,
      DefaultRouterService: {
        prepareUrl: () => "http://localhost:4300/nodics/profile/v0",
      },
    };
    const agent = {
      ...agentSource,
      getConfiguration: () => ({ healthPath: "/health", leaseTtlMs: 30000 }),
      getInstanceId: () => "fixture-instance",
      _backofficeCapabilityProviders: new Map([["profile", provider]]),
    };
    const registration = agent.buildRegistration("profile");
    const workspace = registration.backoffice.navigation.find(
      (row) => row.id === "enterprises",
    ).backendWorkspace;
    assert.deepEqual(
      workspace.setupContinuation,
      clone(setupContinuation.workspaceDescriptor()),
    );
    assert.equal(workspace.setupContinuation.available, false);
    assert.equal(
      contract.validateEnterpriseSetupContinuation(workspace.setupContinuation),
      true,
    );
    assert.equal(registration.authorityClaims.length, 26);
    assert.equal(contract.validateRegistration(registration), true);
    assert.equal(
      contract.validateRegistrationBatch(
        { instanceId: "fixture-instance", registrations: [registration] },
        512,
      ),
      true,
    );
    const malformed = clone(registration);
    malformed.backoffice.navigation.find(
      (row) => row.backendWorkspace,
    ).backendWorkspace.tabs[0].sections[1].endpoint.bodyShape = "EXECUTE";
    assert.equal(
      contract.validateRegistrationBatch(
        { instanceId: "fixture-instance", registrations: [malformed] },
        512,
      ),
      false,
    );
    assert.equal(
      contract.validateAuthorityClaims(
        Array.from({ length: 513 }, () => registration.authorityClaims[0]),
        "profile",
      ),
      false,
    );
  } finally {
    for (const [name, value] of Object.entries(previous)) {
      if (value === undefined) delete global[name];
      else global[name] = value;
    }
  }
});

test("setup continuation transport admits exact owner metadata and refuses extra proof, unsafe routes and false readiness", () => {
  const previous = { CONFIG: global.CONFIG, NODICS: global.NODICS };
  try {
    const configuration = clone(profile);
    configuration.enterpriseManagement.setupContinuation.inspectionQualified =
      true;
    configuration.enterpriseManagement.setupContinuation.privateGuardsQualified =
      true;
    configuration.enterpriseManagement.setupContinuation.resumeQualified = true;
    global.CONFIG = { get: (key) => configuration[key] };
    global.NODICS = {
      getRouters: () => ({
        inspect: {
          controller: "DefaultEnterpriseManagementController",
          operation: "inspectEnterpriseSetup",
          method: "GET",
          secured: true,
          permission: "profile.enterprise.create",
          authTokenTypes: ["access"],
          url: "/customRoot/profile/v7/enterprises/:enterpriseCode/setup",
        },
        resume: {
          controller: "DefaultEnterpriseManagementController",
          operation: "resumeEnterpriseSetup",
          method: "POST",
          secured: true,
          permission: "profile.enterprise.create",
          authTokenTypes: ["access"],
          url: "/customRoot/profile/v7/enterprises/:enterpriseCode/setup/resume",
        },
      }),
    };
    const descriptor = setupContinuation.workspaceDescriptor();
    assert.equal(descriptor.available, true);
    assert.equal(descriptor.actions.resume.qualified, true);
    assert.equal(contract.validateEnterpriseSetupContinuation(descriptor), true);
    for (const mutate of [
      (d) => {
        d.version = 2;
      },
      (d) => {
        d.intentDigest = "private";
      },
      (d) => {
        d.actions.execute = {};
      },
      (d) => {
        d.actions.inspect.method = "POST";
      },
      (d) => {
        d.actions.inspect.path = "https://external.test/setup";
      },
      (d) => {
        d.actions.inspect.path = "/a/../{enterpriseCode}/setup";
      },
      (d) => {
        d.actions.inspect.path = "/../{enterpriseCode}/setup";
      },
      (d) => {
        d.actions.inspect.path = "/a//{enterpriseCode}/setup";
      },
      (d) => {
        d.actions.inspect.path = "/a/{actorId}/setup";
      },
      (d) => {
        d.actions.inspect.path = "/a/{enterpriseCode}/{enterpriseCode}";
      },
      (d) => {
        d.actions.inspect.path += "?token=private";
      },
      (d) => {
        d.actions.resume.bodyFields = ["identity"];
      },
      (d) => {
        d.actions.resume.bodyFields.push("expectedRevision");
      },
      (d) => {
        d.actions.resume.actorId = "private";
      },
      (d) => {
        d.available = false;
      },
      (d) => {
        delete d.actions.inspect;
      },
      (d) => {
        d.presentation.title = "x".repeat(161);
      },
      (d) => {
        d.presentation.inspectLabel = {};
      },
      (d) => {
        d.presentation.html = "<script>";
      },
      (d) => {
        d.presentation.reasons.NEW_PRIVATE_REASON = "private";
      },
    ]) {
      const invalid = clone(descriptor);
      mutate(invalid);
      assert.equal(contract.validateEnterpriseSetupContinuation(invalid), false);
      const workspace = clone(profile.enterpriseManagement.workspace);
      workspace.setupContinuation = invalid;
      assert.equal(contract.validateBackendWorkspace(workspace), false);
    }
    const unavailable = clone(descriptor);
    unavailable.available = false;
    unavailable.actions.resume.qualified = false;
    assert.equal(contract.validateEnterpriseSetupContinuation(unavailable), true);
    unavailable.actions = {};
    assert.equal(contract.validateEnterpriseSetupContinuation(unavailable), true);
    delete unavailable.actions;
    assert.equal(
      contract.validateEnterpriseSetupContinuation(unavailable),
      true,
      "explicit unavailable may omit actions entirely",
    );
    const noAvailableActions = clone(descriptor);
    delete noAvailableActions.actions;
    assert.equal(
      contract.validateEnterpriseSetupContinuation(noAvailableActions),
      false,
    );
    const native = {
      contractVersion: 1,
      renderer: "axis.workspace.native",
      workspaceCode: "profile.enterpriseSetup",
      viewCode: "setup",
      title: "Setup",
      setupContinuation: descriptor,
    };
    assert.equal(
      contract.validateBackendWorkspace(native),
      false,
      "unrelated native workspaces retain their field ceiling",
    );
    assert.equal(apiContracts.enterpriseSetupContinuation.additionalProperties, false);
    assert.equal(
      apiContracts.backendWorkspace.oneOf[0].properties.setupContinuation,
      apiContracts.enterpriseSetupContinuation,
    );
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete global[key];
      else global[key] = value;
    }
  }
});

test("model commands require a bounded selector and one declared required idempotency field", () => {
  assert.equal(contract.validateBackendWorkspaceSection(createSection()), true);
  for (const mutate of [
    (s) => {
      s.endpoint.method = "GET";
    },
    (s) => {
      delete s.endpoint.idempotencyField;
    },
    (s) => {
      s.endpoint.idempotencyField = "../identity";
    },
    (s) => {
      s.endpoint.idempotencyField = "a".repeat(65);
    },
    (s) => {
      s.endpoint.idempotencyField = "other";
    },
    (s) => {
      s.fields.find((f) => f.type === "IDEMPOTENCY").required = false;
    },
    (s) => {
      s.fields.push(clone(s.fields.find((f) => f.type === "IDEMPOTENCY")));
    },
    (s) => {
      s.type = "listing";
    },
    (s) => {
      s.endpoint.path = "//untrusted";
    },
    (s) => {
      s.endpoint.executable = true;
    },
    (s) => {
      s.successMessage = "x".repeat(513);
    },
    (s) => {
      s.successMessage = {};
    },
    (s) => {
      s.successMessage = "";
    },
  ]) {
    const section = createSection();
    mutate(section);
    assert.equal(contract.validateBackendWorkspaceSection(section), false);
  }
});

test("legacy field transport and bounded inert labels remain supported", () => {
  const section = createSection();
  delete section.endpoint.bodyShape;
  delete section.endpoint.idempotencyField;
  delete section.successMessage;
  assert.equal(contract.validateBackendWorkspaceSection(section), true);
  section.endpoint.bodyShape = "FIELDS";
  section.successMessage = "x".repeat(512);
  assert.equal(contract.validateBackendWorkspaceSection(section), true);
});

test("published API schema advertises the same bounded transport contract", () => {
  const sectionSchema =
    apiContracts.backendWorkspace.oneOf[0].properties.tabs.items.properties
      .sections.items;
  assert.equal(sectionSchema.properties.successMessage.maxLength, 512);
  const endpoint = sectionSchema.properties.endpoint;
  assert.deepEqual(endpoint.properties.bodyShape.enum, ["FIELDS", "MODEL"]);
  assert.equal(endpoint.properties.idempotencyField.maxLength, 64);
  assert.deepEqual(endpoint.allOf[0].then.required, ["idempotencyField"]);
  assert.equal(
    endpoint.allOf[0].then.properties.method.enum.includes("GET"),
    false,
  );
  assert.equal(endpoint.additionalProperties, false);
});
