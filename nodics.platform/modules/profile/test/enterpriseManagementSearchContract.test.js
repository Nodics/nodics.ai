/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module profile/test/EnterpriseManagementSearchContract
 * @description Verifies the bounded, human-only, projected Profile enterprise-search contract and Assistant allowlist identity.
 * @layer test
 * @owner profile
 * Fixture maintenance is authored only; behavioral execution and installed qualification remain deferred.
 */
const assert = require("assert");
const properties = require("../config/properties");
const routes = require("../src/router/routers").profile.loadDefaults;

const policyData = {
  record0: {
    enabled: false,
    approvedOperations: [
      {
        toolId: "profile.enterprise.search",
        ownerModule: "profile",
        operationId: "profile_searchenterprises",
        requiredPermissions: ["profile.enterprise.search"],
        resultFields: ["page", "limit", "count", "items"],
        inputSchema: {
          properties: {
            queryParameters: {
              additionalProperties: false,
            },
          },
        },
      },
      {
        toolId: "profile.enterprise.create",
        ownerModule: "profile",
        operationId: "profile_createenterprise",
        mode: "MUTATION",
        confirmationRequired: true,
        requiredPermissions: ["profile.enterprise.create"],
        inputSchema: {
          required: ["code", "name"],
          additionalProperties: false,
        },
      },
    ],
  },
};
const localPolicyData = {
  record0: Object.assign({}, policyData.record0, {
    enabled: true,
  }),
};

global.CONFIG = {
  get: (key) =>
    key === "enterpriseManagement"
      ? properties.enterpriseManagement
      : key === "defaultTenant"
        ? "default"
        : key === "profileTenantProvisioning"
          ? properties.profileTenantProvisioning
          : key === "defaultAuthDetail"
            ? { entCode: "default" }
        : undefined,
};
global.SERVICE = {
  DefaultStatusService: {
    get: () => ({ code: 400, message: "Invalid request parameters" }),
  },
};
global.UTILS = {
  extractFromMessage: (message, code) => ({
    code: code,
    responseCode: 400,
    message: message,
  }),
  extractFromError: (error, message, code) => ({
    code: code,
    responseCode: 400,
    message: message || error.message,
    stack: error.stack,
  }),
};
global.CLASSES = {
  NodicsError: class NodicsError extends Error {
    constructor(code, message) {
      super(message);
      this.code = code;
      this.name = "NodicsError";
    }
  },
};

const service = require("../src/service/enterprise/defaultEnterpriseManagementService");
const enterpriseService = require("../src/service/enterprise/defaultEnterpriseService");
const controller = require("../src/controller/enterprise/defaultEnterpriseManagementController");

async function run() {
  const route = routes.searchEnterprises;
  assert.strictEqual(route.method, "GET");
  assert.strictEqual(route.secured, true);
  assert.deepStrictEqual(route.authTokenTypes, ["access"]);
  assert.strictEqual(route.permission, "profile.enterprise.search");
  assert.strictEqual(route.operation, "search");
  assert.strictEqual(routes.createEnterprise.method, "POST");
  assert.strictEqual(
    routes.createEnterprise.permission,
    "profile.enterprise.create",
  );
  assert.strictEqual(
    routes.createEnterprise.requestBody.content["application/json"].schema
      .additionalProperties,
    false,
  );
  assert.strictEqual(routes.searchEnterpriseAccessAssignments.method, "GET");
  assert.strictEqual(
    routes.searchEnterpriseAccessAssignments.permission,
    "profile.enterpriseAccess.search",
  );
  assert.strictEqual(routes.preAssignEnterpriseAccess.method, "POST");
  assert.strictEqual(
    routes.preAssignEnterpriseAccess.permission,
    "profile.enterpriseAccess.assign",
  );
  assert.strictEqual(routes.resolvePreAssignedEnterpriseAccess.secured, false);
  assert.strictEqual(
    routes.getPreAssignedEnterpriseAccessWorkspace.secured,
    false,
  );
  assert.strictEqual(
    routes.registerPreAssignedEnterpriseEmployee.secured,
    false,
  );
  assert(service.create.toString().includes("DefaultEnterpriseService.save"));
  assert(
    service.registerPreAssignedEmployee
      .toString()
      .includes("DefaultEnterpriseRegistrationService.execute"),
  );

  let mappedRequest;
  global.FACADE = {
    DefaultEnterpriseManagementFacade: {
      search: (request) => {
        mappedRequest = request;
        return Promise.resolve({ items: [] });
      },
    },
  };
  await controller.search({
    query: { code: "stale" },
    httpRequest: { query: { code: "default", limit: "10" } },
  });
  assert.deepStrictEqual(
    mappedRequest.query,
    { code: "default", limit: "10" },
    "Controller must map HTTP query parameters into the service request",
  );

  let captured;
  global.SERVICE.DefaultEnterpriseService = {
    get: (request) => {
      captured = request;
      return Promise.resolve({
        code: "SUC_DBS_00000",
        result: [
          {
            code: "acme",
            name: "Acme",
            active: true,
            tenant: { code: "acmeTenant", secret: "hidden" },
            superEnterprise: { code: "global" },
            contacts: [{ value: "private@example.test" }],
            addresses: [{ city: "Private" }],
            apiKey: "never-project",
          },
        ],
      });
    },
  };
  const request = {
    tenant: "callerTenant",
    authData: {
      tokenType: "access",
      principalType: "human",
      principalId: "admin",
      entCode: "default",
      userGroups: ["adminGroup"],
      permissions: ["profile.enterprise.search"],
    },
    query: { code: "acme", active: "true", page: "2", limit: "10" },
  };
  const result = await service.search(request);
  assert.strictEqual(
    captured.tenant,
    "default",
    "Enterprise persistence remains in the configured Profile authority tenant",
  );
  assert.strictEqual(captured.authData, request.authData);
  assert.deepStrictEqual(captured.query, { code: "acme", active: true });
  assert.deepStrictEqual(captured.options, { recursive: false });
  assert.deepStrictEqual(captured.searchOptions, {
    pageSize: 10,
    pageNumber: 2,
    sort: { code: 1 },
  });
  assert.deepStrictEqual(result, {
    page: 2,
    limit: 10,
    count: 1,
    items: [
      {
        code: "acme",
        name: "Acme",
        active: true,
        tenantCode: "acmeTenant",
        superEnterpriseCode: "global",
      },
    ],
  });
  assert.strictEqual(
    JSON.stringify(result).includes("private@example.test"),
    false,
  );
  assert.strictEqual(JSON.stringify(result).includes("never-project"), false);

  await assert.rejects(
    service.search({
      authData: {
        ...request.authData,
        tokenType: "service",
        principalType: "service",
        principalId: "apiAdmin",
      },
      query: {},
    }),
    (error) => error.code === "ERR_PRFL_00003",
  );
  await assert.rejects(
    service.search({
      authData: { ...request.authData },
      query: { $where: "unsafe" },
    }),
    (error) => error.code === "ERR_PRFL_00003",
  );
  await assert.rejects(
    service.search({
      authData: { ...request.authData },
      query: { code: { $ne: null } },
    }),
    (error) => error.code === "ERR_PRFL_00003",
  );
  await assert.rejects(
    service.search({
      authData: { ...request.authData },
      query: {
        limit: properties.enterpriseManagement.search.maximumResultCount + 1,
      },
    }),
    (error) => error.code === "ERR_PRFL_00003",
  );

  for (const claims of [
    { principalType: undefined },
    { principalType: "customer" },
    { principalType: "service" },
    { isSystem: true },
    { userGroups: ["adminGroup", "serviceAccountUserGroup"] },
    { allUserGroupCodes: ["serviceAccountUserGroup"] },
  ]) {
    captured = undefined;
    await assert.rejects(
      service.search({
        authData: { ...request.authData, ...claims },
        query: {},
      }),
      (error) =>
        error.code === "ERR_PRFL_00003" &&
        /authenticated human employee/.test(error.message),
    );
    assert.strictEqual(
      captured,
      undefined,
      "Non-human or system authority must not reach generated storage",
    );
  }

  let createQueries = [];
  let tenantQueries = [];
  let savedTenantRequest;
  let savedRequest;
  let activatedEnterprises;
  global.NODICS = {
    getActiveTenants: () => ["default"],
    getEnvironmentName: () => "testProject",
    getSelectedEnvironmentName: () => "testLocal",
    getModels: () => ({ TenantModel: { rawSchema: { definition: {} } } }),
  };
  const tenantGuard = require("../src/service/enterprise/defaultTenantProvisioningGuardService");
  global.SERVICE.DefaultTenantProvisioningGuardService = tenantGuard;
  global.SERVICE.DefaultEnterpriseTenantProvisioningService = require("../src/service/enterprise/defaultEnterpriseTenantProvisioningService");
  global.SERVICE.DefaultDatabaseConfigurationService = require("../../../../nodics.foundation/modules/nDatabase/database/src/service/config/defaultDatabaseConfigurationService");
  global.SERVICE.DefaultRuntimeAuthorizationService = require("../src/service/identity/defaultRuntimeAuthorizationService");
  global.SERVICE.DefaultLoggerService = { runSensitiveOperation: async (_request, work) => work() };
  global.SERVICE.DefaultIdentityGovernanceService = { getSystemAuthData: () => ({ isSystem: true }) };
  global.SERVICE.DefaultPrincipalScopeAssignmentService = { get: async () => ({ code: "SUC_DBS_00000", result: [{
    code: "testDeployment", scopeType: "RUNTIME_DEPLOYMENT", principalType: "service", principalCode: "runtime",
    inheritanceMode: "DIRECT", tenantCode: "default", enterpriseCode: "default", status: "ACTIVE", effect: "ALLOW",
    runtimeScope: { projectCode: "testProject", environmentCode: "testLocal", serverCode: "platform", instanceCode: "replica1",
      modules: ["profile"], permissions: ["profile.tenant.namespace.bind"] },
  }] }) };
  global.SERVICE.DefaultModelSaveInitializerService = {
    ...require("../../../../nodics.foundation/modules/nDatabase/database/src/service/procs/save/defaultModelSaveInitializerService"),
    LOG: { debug() {} },
  };
  global.UTILS.isBlank = value => Object.keys(value).length === 0;
  global.SERVICE.DefaultEnterpriseService = {
    get: (request) => {
      createQueries.push(request);
      return Promise.resolve({
        code: "SUC_DBS_00000",
        result:
          request.query.tenant === "assignedTenant" ? [{ code: "owner" }] : [],
      });
    },
    save: (request) => {
      savedRequest = request;
      return Promise.resolve({ code: "SUC_DBS_00000", result: request.model });
    },
  };
  global.SERVICE.DefaultEnterpriseHandlerService = {
    buildEnterprise: (enterprises) => {
      activatedEnterprises = enterprises;
      return Promise.resolve(true);
    },
  };
  global.SERVICE.DefaultTenantService = {
    get: (request) => {
      tenantQueries.push(request);
      return Promise.resolve({ code: "SUC_DBS_00000", result: [] });
    },
    save: async (request) => {
      await tenantGuard.protectSave(request);
      savedTenantRequest = request;
      return Promise.resolve({ code: "SUC_DBS_00000", result: request.model });
    },
  };
  const createRequest = {
    authData: {
      tokenType: "access",
      principalType: "human",
      principalId: "admin",
      entCode: "default",
      userGroups: ["adminGroup"],
    },
    body: { code: "acme-new", name: "Acme New", tenantCode: "availableTenant", idempotencyKey: "create-acme-new" },
  };
  const created = await service.create(createRequest);
  assert.deepStrictEqual(
    createQueries.map((item) => item.query),
    [{ code: "acme-new" }, { tenant: "availableTenant" }],
  );
  assert.deepStrictEqual(
    tenantQueries.map((item) => item.query),
    [{ code: "availableTenant" }],
  );
  assert.strictEqual(savedTenantRequest.tenant, "default");
  const creation = {
    enterpriseCode: "acme-new",
    setupRequestKey: service.commandDigest(["admin", "create-acme-new"]),
    setupRequestHash: service.commandDigest({ input: createRequest.body, additionalModel: undefined, administrator: undefined }),
  };
  const tenantProperties = await SERVICE.DefaultEnterpriseTenantProvisioningService.captureCreationProperties("availableTenant", creation);
  assert.deepStrictEqual(savedTenantRequest.model, {
    code: "availableTenant",
    active: true,
    description: "Tenant for Acme New",
    properties: tenantProperties,
  });
  assert.deepStrictEqual(savedTenantRequest.query, { code: "availableTenant", properties: { $exists: false } });
  await assert.rejects(tenantGuard.protectSave(structuredClone(savedTenantRequest)),
    error => error.code === "ERR_PROFILE_TENANT_PROVISIONING_HELD");
  assert.strictEqual(savedRequest.tenant, "default");
  assert.deepStrictEqual(savedRequest.model, {
    code: "acme-new",
    name: "Acme New",
    tenant: "availableTenant",
    active: true,
    setupRequestKey: creation.setupRequestKey,
    setupRequestHash: creation.setupRequestHash,
  });
  assert.strictEqual(activatedEnterprises[0].tenant.code, "availableTenant");
  assert.deepStrictEqual(created, {
    code: "acme-new",
    name: "Acme New",
    tenantCode: "availableTenant",
    active: true,
  });
  await assert.rejects(
    service.create({
      authData: {
        tokenType: "access",
        principalType: "human",
        principalId: "enterprise-admin",
        entCode: "acme-new",
        userGroups: ["adminGroup"],
      },
      body: { code: "blocked", name: "Blocked", tenantCode: "blockedTenant" },
    }),
    (error) =>
      error.code === "ERR_PRFL_00003" &&
      error.message ===
        "Enterprise creation is limited to the Platform Owner enterprise",
  );
  await assert.rejects(
    service.create({
      authData: {
        tokenType: "access",
        principalType: "human",
        principalId: "admin",
        entCode: "default",
        userGroups: ["adminGroup"],
      },
      body: {
        code: "second-owner",
        name: "Second Owner",
        tenantCode: "assignedTenant",
      },
    }),
    (error) =>
      error.code === "ERR_PRFL_00003" &&
      error.message === "Enterprise tenant is already assigned",
  );

  let assignmentGets = [];
  let assignmentSaves = [];
  const systemAuth = {
    isSystem: true,
    principalType: "service",
    tokenType: "service",
  };
  const hierarchyReads = [];
  global.SERVICE.DefaultIdentityGovernanceService = {
    getSystemAuthData: () => systemAuth,
  };
  const hierarchyGet = (kind) => async (request) => {
    hierarchyReads.push({ kind, request });
    assert.strictEqual(request.tenant, "default");
    assert.strictEqual(request.authData, systemAuth);
    assert.deepStrictEqual(request.options, {
      recursive: false,
      skipItemCache: true,
    });
    assert.deepStrictEqual(request.searchOptions, {
      pageSize: 2,
      pageNumber: 1,
    });
    const code = request.query.code;
    assert.deepStrictEqual(request.query, { code });
    return {
      code: "SUC_DBS_00000",
      count: 1,
      result: [
        {
          code,
          active: true,
          ...(kind === "enterprise" ? { tenant: code + "Tenant" } : {}),
        },
      ],
    };
  };
  global.SERVICE.DefaultEnterpriseService = {
    ...enterpriseService,
    get: hierarchyGet("enterprise"),
  };
  global.SERVICE.DefaultTenantService = { get: hierarchyGet("tenant") };
  global.SERVICE.DefaultEnterpriseAccessAssignmentService = {
    get: (request) => {
      assignmentGets.push(request);
      return Promise.resolve({ code: "SUC_DBS_00000", result: [] });
    },
    save: (request) => {
      assignmentSaves.push(request);
      return Promise.resolve({ code: "SUC_DBS_00000", result: request.model });
    },
  };
  const assigned = await service.preAssignAccess({
    params: { enterpriseCode: "du-shop" },
    authData: {
      tokenType: "access",
      principalType: "human",
      loginId: "owner@example.test",
      entCode: "default",
      userGroups: ["adminGroup"],
      permissions: ["profile.enterpriseAccess.assign"],
    },
    body: {
      email: "DuShop@DU.AE",
      roleCode: "ENTERPRISE_ADMIN",
      idempotencyKey: "invite-du-shop-admin",
    },
  });
  assert.strictEqual(
    assignmentGets[0].tenant,
    "default",
    "Access assignments stay in the Profile authority tenant",
  );
  assert.strictEqual(assignmentSaves[0].tenant, "default");
  assert.strictEqual(assignmentSaves[0].model.normalizedEmail, "dushop@du.ae");
  assert.strictEqual(assignmentSaves[0].model.tenantCode, "du-shopTenant");
  assert.strictEqual(assigned.roleCode, "ENTERPRISE_ADMIN");
  assert.deepStrictEqual(assigned.groupCodes, [
    "adminGroup",
    "axisViewerUserGroup",
  ]);
  assert.deepStrictEqual(
    hierarchyReads.map((item) => [item.kind, item.request.query.code]),
    [
      ["enterprise", "du-shop"],
      ["tenant", "du-shopTenant"],
    ],
  );

  global.SERVICE.DefaultEnterpriseAdministrationConsentService = require("../src/service/enterprise/defaultEnterpriseAdministrationConsentService");
  const beforeDeniedWrites = assignmentSaves.length;
  await assert.rejects(
    service.preAssignAccess({
      params: { enterpriseCode: "other-ent" },
      authData: {
        tokenType: "access",
        principalType: "human",
        loginId: "enterprise-admin@example.test",
        userGroups: ["adminGroup", "axisViewerUserGroup"],
        entCode: "my-ent",
        permissions: ["profile.enterpriseAccess.assign"],
      },
      body: {
        email: "user@example.test",
        roleCode: "VIEWER",
        idempotencyKey: "invite-other-user",
      },
    }),
    (error) => error.code === "ERR_PROFILE_CONSENT_UNAVAILABLE",
  );
  assert.strictEqual(
    assignmentSaves.length,
    beforeDeniedWrites,
    "Unqualified cross-enterprise consent must not create an assignment",
  );
  delete global.SERVICE.DefaultEnterpriseAdministrationConsentService;

  assignmentGets = [];
  assignmentSaves = [];
  global.SERVICE.DefaultEnterpriseAccessAssignmentService = {
    get: (request) => {
      assignmentGets.push(request);
      return Promise.resolve({
        code: "SUC_DBS_00000",
        result: [
          {
            code: "enterpriseAccess_du_shop_dushop_du_ae",
            email: "dushop@du.ae",
            normalizedEmail: "dushop@du.ae",
            enterpriseCode: "du-shop",
            tenantCode: "du-shopTenant",
            roleCode: "ENTERPRISE_ADMIN",
            groupCodes: ["adminGroup", "axisViewerUserGroup"],
            scopeType: "ENTERPRISE",
            scopeCode: "du-shop",
            status: "PENDING",
          },
        ],
      });
    },
    save: (request) => {
      assignmentSaves.push(request);
      return Promise.resolve({ code: "SUC_DBS_00000", result: request.model });
    },
  };
  // This owner-level contract checks delegation. The complete verified and
  // recoverable flow is covered by enterpriseRegistrationJourney.test.js.
  const registrationWorkspace = {
    contractVersion: 1,
    owner: "profile",
    renderer: "axis.enterprise-registration",
  };
  const registrationResult = {
    contractVersion: 1,
    stage: "COMPLETE",
    signInEnterpriseCode: "du-shop",
  };
  const completionBody = {
    continuation: "a".repeat(43),
    firstName: "Du",
    lastName: "Admin",
    password: "fixture-only-password",
  };
  global.SERVICE.DefaultEnterpriseRegistrationService = {
    execute: async (request, operation) => {
      assert.strictEqual(operation, "COMPLETE");
      assert.deepStrictEqual(request.body, completionBody);
      return registrationResult;
    },
    workspace: () => registrationWorkspace,
  };
  const registration = await service.registerPreAssignedEmployee({
    body: completionBody,
  });
  assert.strictEqual(registration, registrationResult);

  const workspace = service.getAccessWorkspace({});
  assert.strictEqual(workspace.renderer, "axis.workspace.backend-operations");
  assert(
    workspace.tabs.some(
      (tab) =>
        tab.id === "users" &&
        tab.sections.some((section) => section.id === "assign-user"),
    ),
  );
  const publicWorkspace = service.getAccessWorkspace({ publicOnly: true });
  assert.strictEqual(publicWorkspace, registrationWorkspace);

  SERVICE.DefaultEnterpriseManagementService = service;
  const provider = require("../src/service/defaultProfileBackofficeCapabilityService");
  const projected = provider.getCapability();
  const enterpriseItem = projected.navigation.find(
    (item) => item.id === "enterprises",
  );
  assert.equal(enterpriseItem.featureState, "ACTIVE");
  assert.deepEqual(enterpriseItem.backendWorkspace, workspace);
  assert(!workspace.tabs.some((tab) => tab.id === "registration"));
  const unrelatedIds = [
    "organisations-business-accounts",
    "employees-teams",
    "roles-access",
    "employees",
    "roles",
    "permission-groups",
  ];
  const assertUnrelated = (navigation) => {
    for (const id of unrelatedIds) {
      const item = navigation.find((row) => row.id === id);
      assert(item, id);
      assert.equal(item.featureState, "DISABLED", id);
      assert.equal(item.backendWorkspace, undefined, id);
      assert(
        !(item.requiredPermissions || []).some((permission) =>
          permission.startsWith("profile.enterpriseAccess."),
        ),
        id,
      );
    }
  };
  assertUnrelated(projected.navigation);
  delete SERVICE.DefaultEnterpriseManagementService;
  assert.throws(
    () => provider.getCapability(),
    /authenticated enterprise workspace owner unavailable/,
  );
  SERVICE.DefaultEnterpriseManagementService = service;

  // Later-layer public sections must pass through the same authenticated owner.
  const configured = JSON.parse(
    JSON.stringify(properties.enterpriseManagement),
  );
  configured.workspace.tabs.unshift({
    id: "public-only",
    sections: [{ id: "public", public: true }],
  });
  configured.workspace.defaultTab = "public-only";
  configured.workspace.tabs[1].sections.push({
    id: "public-mixed",
    public: true,
  });
  const priorGet = CONFIG.get;
  CONFIG.get = (key) =>
    key === "enterpriseManagement" ? configured : priorGet(key);
  const layered = provider
    .getCapability()
    .navigation.find((item) => item.id === "enterprises").backendWorkspace;
  assert(!layered.tabs.some((tab) => tab.id === "public-only"));
  assert(
    !layered.tabs.some((tab) =>
      tab.sections.some((section) => section.public === true),
    ),
  );
  assert.equal(layered.defaultTab, layered.tabs[0].id);
  assert.equal(configured.workspace.tabs[0].sections.length, 1);
  CONFIG.get = priorGet;

  // Exercise the real bootstrap catalogue/Axis projection with an admitted lease;
  // only transport, publication and operational readiness are isolated here.
  global.ENUMS = {
    ContactType: Object.fromEntries(
      ["EMAIL", "PHONE", "FAX", "PAGER"].map((key) => [key, { key }]),
    ),
  };
  const rawModule = {
    metaData: require("../package.json"),
    rawSchema: require("../src/schemas/schemas").profile,
    path: require("node:path").resolve(__dirname, ".."),
    parent: "nodics.platform",
    canonicalIdentity: "nodics.platform/modules/profile",
  };
  NODICS.getRawModule = () => rawModule;
  NODICS.getServerName = () => "platformServer";
  SERVICE.DefaultRouterService = {
    prepareUrl: () => "http://localhost:4300/nodics/profile/v0",
  };
  const agent = {
    ...require("../../../../nodics.foundation/modules/nService/src/service/module/defaultModuleRegistrationAgentService"),
    getConfiguration: () => ({ healthPath: "/health", leaseTtlMs: 30000 }),
    getInstanceId: () => "fixture-instance",
    _backofficeCapabilityProviders: new Map([["profile", provider]]),
  };
  const moduleRegistration = agent.buildRegistration("profile");
  assert.equal(
    require("../../backoffice/src/service/contract/defaultBackofficeContractService").validateRegistration(
      moduleRegistration,
    ),
    true,
  );
  const registrySource = require("../../backoffice/src/service/registry/defaultBackofficeRegistryService");
  const capabilityRegistry = require("../../backoffice/src/service/registry/defaultBackofficeCapabilityRegistryService");
  const registry = {
    ...registrySource,
    list: async () => ({
      data: { modules: { profile: [moduleRegistration] } },
    }),
    getConfiguration: () => ({
      compatibility: { contractVersion: 1, registryContractVersion: 1 },
    }),
    getNavigationCompositionState: () => ({ history: [] }),
    buildDocumentationPublicationState: async () => ({}),
    audit: async () => true,
  };
  SERVICE.DefaultBackofficeRegistryService = registry;
  SERVICE.DefaultBackofficeCapabilityRegistryService = capabilityRegistry;
  SERVICE.DefaultAxisExperiencePolicyService = {
    getEffective: async () => ({}),
  };
  const bootstrap = await registry.bootstrap({
    tenant: "default",
    authData: { permissions: ["*"] },
  });
  assertUnrelated(bootstrap.data.catalogue.profile.navigation);
  assertUnrelated(bootstrap.data.effectiveNavigationComposition.navigation);
  const bootstrapEnterprise = bootstrap.data.catalogue.profile.navigation.find(
    (item) => item.id === "enterprises",
  );
  assert.deepEqual(bootstrapEnterprise.backendWorkspace, workspace);

  const assertPolicy = (policy) => {
    const tool = policy.record0.approvedOperations.find(
      (item) => item.toolId === "profile.enterprise.search",
    );
    assert(tool, "Enterprise search must be explicitly allowlisted");
    assert.strictEqual(tool.ownerModule, "profile");
    assert.strictEqual(tool.operationId, "profile_searchenterprises");
    assert.deepStrictEqual(tool.requiredPermissions, [
      "profile.enterprise.search",
    ]);
    assert.deepStrictEqual(tool.resultFields, [
      "page",
      "limit",
      "count",
      "items",
    ]);
    assert.strictEqual(
      tool.inputSchema.properties.queryParameters.additionalProperties,
      false,
    );
    const mutation = policy.record0.approvedOperations.find(
      (item) => item.toolId === "profile.enterprise.create",
    );
    assert(mutation, "Enterprise creation must be explicitly allowlisted");
    assert.strictEqual(mutation.ownerModule, "profile");
    assert.strictEqual(mutation.operationId, "profile_createenterprise");
    assert.strictEqual(mutation.mode, "MUTATION");
    assert.strictEqual(mutation.confirmationRequired, true);
    assert.deepStrictEqual(mutation.requiredPermissions, [
      "profile.enterprise.create",
    ]);
    assert.deepStrictEqual(mutation.inputSchema.required, ["code", "name"]);
    assert.strictEqual(mutation.inputSchema.additionalProperties, false);
  };
  assertPolicy(policyData);
  assertPolicy(localPolicyData);
  assert.strictEqual(policyData.record0.enabled, false);
  assert.strictEqual(localPolicyData.record0.enabled, true);

  console.log("Profile enterprise management search contract validated");
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
