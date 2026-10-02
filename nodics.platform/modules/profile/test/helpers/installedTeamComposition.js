/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/**
 * @module profile/test/helpers/installedTeamComposition
 * @description Disposable Team/provider composition. Fixture schemas and in-memory actor admission are not installed Profile qualification.
 * @layer test
 * @owner profile
 * @sideEffects Explicit loopback opt-in writes only random fixture collections and exact namespaced Redis keys, then removes their records/keys.
 */
const assert = require("node:assert/strict");
const { randomUUID, createHash } = require("node:crypto");
const { cloneDeep, merge } = require("lodash");
const foundation = "../../../../../nodics.foundation/modules/";
const log = { debug() {}, info() {}, error() {}, warn() {} };
const common = require(foundation + "nService/src/service/common");
const teamSource = require("../../src/service/enterprise/defaultEnterpriseTeamAdministrationService");
const membershipSource = require("../../src/service/enterprise/defaultEnterpriseMembershipService");
const registrationSource = require("../../src/service/enterprise/defaultEnterpriseRegistrationService");

/** Rejects credentials, selected databases, multi-host/query redirects and all non-loopback provider endpoints. */
function localEndpoint(value, protocol) {
  const url = new URL(value);
  assert.equal(url.protocol, protocol);
  assert(["127.0.0.1", "localhost", "[::1]"].includes(url.hostname));
  assert(!url.username && !url.password && !url.search && !url.hash);
  assert(["", "/"].includes(url.pathname));
  return url.href;
}

/** Admits only fresh random fixture scope; callers cannot nominate an installed tenant/database. */
function fixtureScope(namespace) {
  assert.match(namespace, /^nodics_profile_qualification_[a-f0-9]{32}$/);
}

/**
 * Connects through existing provider owners and assembles the generated update pipeline, not a live runtime.
 * @param {string} mongoEndpoint Explicit loopback-only Mongo endpoint without database/credentials.
 * @param {string} redisEndpoint Explicit loopback-only Redis endpoint without credentials/database.
 * @returns {Promise<Object>} Scoped fixture factory and mandatory exact cleanup.
 */
async function installedTeam(mongoEndpoint, redisEndpoint) {
  const mongoUri = localEndpoint(mongoEndpoint, "mongodb:");
  const redisUri = localEndpoint(redisEndpoint, "redis:");
  const namespace =
    "nodics_profile_qualification_" + randomUUID().replaceAll("-", "");
  fixtureScope(namespace);
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(code, message, explicitCode) {
        super(message || String(code));
        this.code = explicitCode || code;
      }
      static enrich(error) {
        return error;
      }
    },
    CacheError: class extends Error {},
    PipelineHead: require(foundation + "nPipeline/src/lib/pipelineHead"),
    PipelineNode: require(foundation + "nPipeline/src/lib/pipelineNode"),
  };
  global.UTILS = {
    isBlank: (value) => !value || Object.keys(value).length === 0,
    isObject: (value) => value !== null && typeof value === "object",
    generateUniqueCode: randomUUID,
  };
  require(
    foundation + "nConfig/config/prescripts",
  ).addStringCamelCaseFunction();
  const identity = require(
    foundation + "nAuth/config/properties",
  ).identityGovernance;
  const accessPoints = require(
    foundation + "nDatabase/database/config/properties",
  ).accessPoints;
  // These policies exist only in this isolated test process, never a deployment configuration.
  const policy = {
    memberships: {
      enabled: true,
      inventoryQualified: true,
      sessionBindingQualified: true,
      assignmentClaimIndexQualified: true,
      pageSize: 50,
      maximumInventoryPages: 100,
    },
    teamAdministration: {
      enabled: true,
      serializedWritesQualified: true,
      operatorRecoveryQualified: true,
      invitationWithdrawalQualified: true,
      recoveryPresentation: { title: "Disposable fixture" },
    },
  };
  global.CONFIG = {
    get: (key) =>
      ({
        enterpriseManagement: policy,
        accessPoints,
        identityGovernance: identity,
        "enterpriseManagement.teamAdministration.operatorRecoveryQualified": true,
        defaultEnterprise: "platform",
        profileModuleName: "profile",
      })[key],
  };
  global.SERVICE = {
    DefaultLoggerService: {
      createLogger: () => log,
      inheritRequestPrivacy() {},
      isSensitiveRequest: () => true,
    },
    DefaultModelValidatorService: {
      ...require(
        foundation +
          "nDatabase/database/src/service/model/defaultModelValidatorService",
      ),
      LOG: log,
    },
    DefaultNodicsPromiseService: { all: (values) => Promise.all(values) },
    DefaultCacheConfigurationService: require(
      foundation +
        "nCache/cache/src/service/config/defaultCacheConfigurationService",
    ),
    DefaultIdentityGovernanceService: require(
      foundation +
        "nAuth/src/service/identity/defaultIdentityGovernanceService",
    ),
    DefaultSchemaAccessHandlerService: require(
      foundation +
        "nDatabase/database/src/service/schema/defaultSchemaAccessHandlerService",
    ),
    DefaultRecordOwnershipPolicyService: require(
      foundation +
        "nDatabase/database/src/service/access/defaultRecordOwnershipPolicyService",
    ),
    DefaultSchemaWriteAccessPolicyService: require(
      foundation +
        "nDatabase/database/src/service/schema/defaultSchemaWriteAccessPolicyService",
    ),
    DefaultModelConcurrencyService: require(
      foundation +
        "nDatabase/database/src/service/schema/defaultModelConcurrencyService",
    ),
    DefaultModelsUpdateInitializerService: {
      ...require(
        foundation +
          "nDatabase/database/src/service/procs/update/defaultModelsUpdateInitializerService",
      ),
      LOG: log,
    },
    DefaultPipelineService: {
      ...require(
        foundation + "nPipeline/src/service/pipeline/defaultPipelineService",
      ),
      LOG: log,
    },
    // No deployed Profile hook set is claimed. Private owner guards execute at the fixed adapters below.
    DefaultDatabaseConfigurationService: {
      getSchemaInterceptors: () => ({}),
      getSchemaValidators: () => ({}),
    },
  };
  global.PIPELINE = merge(
    {},
    require(foundation + "nPipeline/src/pipelines/pipelines"),
    require(foundation + "nDatabase/database/src/pipelines/pipelines"),
  );
  const connection = await {
    ...require(
      foundation +
        "nDatabase/mongodb/src/service/connection/defaultMongodbDatabaseConnectionHandlerService",
    ),
    LOG: log,
  }.createConnection({
    URI: mongoUri,
    databaseName: namespace,
    options: { serverSelectionTimeoutMS: 5000 },
  });
  let client;
  const models = {};
  const knownCodes = new Map();
  const knownKeys = new Set();
  const cache = {
    ...require(
      foundation +
        "nCache/redisCache/src/service/cache/defaultRedisCacheService",
    ),
    LOG: log,
  };
  let channel;
  /** Removes only known fixture identities/keys; never drops databases or flushes shared caches. */
  async function close() {
    try {
      for (const [kind, codes] of knownCodes) {
        if (!codes.size) continue;
        fixtureScope(namespace);
        assert.equal(
          models[kind].dataBase.getConnection().databaseName,
          namespace,
        );
        await models[kind].removeItems({
          query: { code: { $in: [...codes] } },
          options: {},
        });
        assert.equal(
          (
            await models[kind].getItems({
              query: { code: { $in: [...codes] } },
              options: {},
            })
          ).count,
          0,
        );
      }
    } finally {
      try {
        if (client && knownKeys.size) {
          await cache.flushByKeys({
            moduleName: "profile",
            tenant: "fixture",
            channel,
            keys: [...knownKeys],
          });
          for (const key of knownKeys)
            await assert.rejects(
              cache.get({
                moduleName: "profile",
                tenant: "fixture",
                channel,
                key,
              }),
            );
        }
      } finally {
        try {
          if (client) await client.quit();
        } finally {
          await connection.client.close();
        }
      }
    }
  }
  try {
    const opened = await {
      ...require(
        foundation +
          "nCache/redisCache/src/service/engine/defaultRedisCacheEngineService",
      ),
      LOG: log,
    }.initCache(
      {
        options: {
          url: redisUri,
          prefix: namespace,
          socket: { connectTimeout: 5000, reconnectStrategy: false },
        },
      },
      "profile",
    );
    client = opened.result;
    channel = {
      client,
      channelName: "auth",
      engineOptions: { options: { prefix: namespace } },
      channelOptions: { ttl: 120 },
    };
    const binder = require(
      foundation +
        "nDatabase/mongodb/src/service/model/defaultMongodbInstalledVersionMigrationService",
    );
    for (const kind of ["enterprise", "assignment"]) {
      const schema = {
        definition: {
          code: { type: "string", primary: true },
          ...(kind === "assignment" ? { revision: { type: "long" } } : {}),
        },
        accessGroups: Object.fromEntries(
          identity.systemAccessGroups.map((group) => [
            group,
            accessPoints.fullAccessPoint,
          ]),
        ),
        ...(kind === "assignment"
          ? {
              backoffice: { concurrency: { managed: true, field: "revision" } },
            }
          : {}),
      };
      models[kind] = binder.bindMaintenanceModel({
        connection,
        schema,
        scope: {
          database: namespace,
          collection:
            kind === "enterprise"
              ? "TeamEnterpriseFixture"
              : "TeamAssignmentFixture",
          tenant: "fixture",
          channel: "master",
          schemaName: kind,
        },
        databaseOptions: {
          defaultIndexes: ["_id"],
          modelRemoveOptions: { j: true },
          modelUpdateOptions: { upsert: false },
        },
      });
      models[kind].moduleName = "profile";
      knownCodes.set(kind, new Set());
    }
    global.NODICS = {
      getServerState: () => "started",
      getModels: (name) => ({ mdlnm: models[name] }),
    };
    const stampOwner = require(
      foundation +
        "nAuth/src/service/identity/defaultPrincipalSecurityStampService",
    );
    const stampRead = (key) =>
      cache.get({ moduleName: "profile", tenant: "fixture", channel, key });
    let current;
    SERVICE.DefaultCacheService = {
      invalidateResource: async () => true,
      putVersioned: async (options) => {
        assert.equal(options.moduleName, "profile");
        assert.equal(options.channelName, "auth");
        assert(options.key.startsWith("securityStamp:fixture:membership:"));
        knownKeys.add(options.key);
        if (current?.faults.stampBefore) {
          current.faults.stampBefore = false;
          throw new Error("fixture stamp unavailable");
        }
        const result = await cache.putVersioned({
          ...options,
          // Disposable evidence expires even when execution stops before exact cleanup.
          ttl: 120,
          tenant: "fixture",
          channel,
        });
        const ttl = await client.ttl(
          cache.getKey({ ...options, tenant: "fixture", channel }),
        );
        assert(
          ttl > 0 && ttl <= 120,
          "Fixture stamp must expire within 120 seconds",
        );
        if (current?.faults.stampAfter) {
          current.faults.stampAfter = false;
          throw new Error("fixture stamp acknowledgement lost");
        }
        return result;
      },
    };
    SERVICE.DefaultPrincipalSecurityStampService = stampOwner;
    SERVICE.DefaultEnterpriseRegistrationService = { ...registrationSource };
    SERVICE.DefaultEnterpriseManagementService = {
      commandDigest: (value) =>
        createHash("sha256").update(JSON.stringify(value)).digest("hex"),
      rolePolicy: () => ({ label: "Fixture responsibility" }),
      isPlatformAdministrator: (auth) =>
        auth.entCode === "platform" && auth.principalType === "human",
    };
    /** Builds one scenario through provider-owned inserts; there are no Employee/Password collections. */
    async function scenario() {
      const id = randomUUID().replaceAll("-", "");
      const enterprise = {
        code: "team_" + id,
        active: true,
        defaultAdminAssignmentCode: "original-fixture-admin",
        adminEmail: "original@example.invalid",
      };
      const assignment = {
        code: "invitation_" + id,
        revision: 3,
        enterpriseCode: enterprise.code,
        tenantCode: "fixture",
        roleCode: "OPERATOR",
        status: "ACTIVE",
        active: true,
        normalizedEmail: "unused@example.invalid",
      };
      for (const [kind, row] of [
        ["enterprise", enterprise],
        ["assignment", assignment],
      ]) {
        knownCodes.get(kind).add(row.code);
        await models[kind].compareAndSetItem({
          operation: "create",
          internalPersistence: "DURABLE_JOURNAL",
          model: cloneDeep(row),
        });
      }
      const faults = {};
      const counts = { enterprise: 0, assignment: 0 };
      const updates = [];
      const actors = new WeakMap();
      const team = { ...teamSource };
      const m = {
        ...membershipSource,
        authority: () => "fixture",
        administrator: async (request, code) => {
          const identity = actors.get(request.authData);
          assert(
            identity && identity.active && code === enterprise.code,
            "fixture actor denied",
          );
          return {
            identity: {
              tenantCode: "fixture",
              recordKind: "EMPLOYEE",
              recordId: identity.id,
            },
          };
        },
        read: async (_owner, tenant, query) => {
          assert.equal(tenant, "fixture");
          const result =
            await SERVICE.DefaultEnterpriseAccessAssignmentService.get({
              tenant,
              query,
            });
          const rows = m.rows(result);
          assert(rows.length <= 1);
          return rows[0];
        },
        enterprise: async (code) => ({
          enterprise: await team.readEnterprise("fixture", { code }),
          tenantCode: "fixture",
        }),
      };
      SERVICE.DefaultEnterpriseTeamAdministrationService = team;
      SERVICE.DefaultEnterpriseMembershipService = m;
      /** Fixed generated adapter preserves owner provenance and routes to the real generic pipeline. */
      const update = (kind) => async (request) => {
        assert.equal(request.tenant, "fixture");
        assert(knownCodes.get(kind).has(request.query.code));
        if (kind === "enterprise") {
          assert(team.ownsEnterpriseWrite(request));
          team.protectEnterprise(request);
        } else {
          assert(m.ownsMembershipWrite(request));
          await m.protectAssignment(request);
        }
        request.moduleName = kind;
        if (
          faults.rejectFinish &&
          request.model.teamOperation?.phase === "COMPLETE"
        )
          throw new Error("fixture finish uncommitted");
        const result = await common.update(request);
        updates.push({
          kind,
          query: cloneDeep(request.query),
          model: cloneDeep(request.model),
          result: cloneDeep(result),
        });
        if (result.result.matchedCount === 1) counts[kind]++;
        if (kind === "assignment" && faults.assignmentAck) {
          faults.assignmentAck = false;
          faults.assignmentRead = true;
          throw new Error("fixture assignment acknowledgement lost");
        }
        if (
          kind === "enterprise" &&
          request.model.teamOperation?.phase === "COMPLETE" &&
          faults.finishAck
        ) {
          faults.finishAck = false;
          if (faults.finishRead) {
            faults.finishRead = false;
            faults.enterpriseRead = true;
          }
          throw new Error("fixture finish acknowledgement lost");
        }
        return result;
      };
      SERVICE.DefaultEnterpriseService = {
        get: async (request) => {
          assert.equal(request.tenant, "fixture");
          assert(knownCodes.get("enterprise").has(request.query.code));
          if (faults.enterpriseRead) {
            faults.enterpriseRead = false;
            throw new Error("fixture enterprise read lost");
          }
          const response = {
            code: "SUC_FIND_00000",
            ...(await models.enterprise.getItems(request)),
          };
          team.redactEnterprise(request, response);
          return response;
        },
        update: update("enterprise"),
      };
      SERVICE.DefaultEnterpriseAccessAssignmentService = {
        get: async (request) => {
          assert.equal(request.tenant, "fixture");
          assert(knownCodes.get("assignment").has(request.query.code));
          if (faults.assignmentRead) {
            faults.assignmentRead = false;
            throw new Error("fixture assignment read lost");
          }
          return {
            code: "SUC_FIND_00000",
            ...(await models.assignment.getItems(request)),
          };
        },
        update: update("assignment"),
      };
      const original = {
        authData: {
          principalType: "human",
          authenticationMethod: "PASSWORD",
          entCode: enterprise.code,
        },
        body: {
          assignmentCode: assignment.code,
          revision: 3,
          operationId: "withdraw_" + id,
        },
      };
      const operator = {
        authData: {
          principalType: "human",
          authenticationMethod: "PASSWORD",
          entCode: "platform",
        },
        body: {
          enterpriseCode: enterprise.code,
          teamRevision: 1,
          operationId: original.body.operationId,
        },
      };
      actors.set(original.authData, { id: "fixture-original", active: true });
      actors.set(operator.authData, { id: "fixture-operator", active: true });
      const readEnterprise = () =>
        team.readEnterprise("fixture", { code: enterprise.code });
      const readAssignment = () =>
        m.read("DefaultEnterpriseAccessAssignmentService", "fixture", {
          code: assignment.code,
        });
      current = {
        team,
        m,
        enterprise,
        assignment,
        original,
        operator,
        faults,
        counts,
        updates,
        readEnterprise,
        readAssignment,
        loseOriginalActor: () => {
          actors.get(original.authData).active = false;
        },
        inspect: () =>
          team.recoveryWorkspace({
            ...operator,
            body: { enterpriseCode: enterprise.code },
          }),
        readStamp: () =>
          stampRead(
            stampOwner.getKey("fixture", m.membershipKey(assignment.code)),
          ),
        publicEnterprise: () =>
          SERVICE.DefaultEnterpriseService.get({
            tenant: "fixture",
            query: { code: enterprise.code },
            options: {},
          }),
        prepareHandover: () => {
          original.body.enterpriseCode = enterprise.code;
          original.body.operationId = operator.body.operationId =
            "handover_" + id;
          team.administrators = async () => [cloneDeep(assignment)];
        },
      };
      return current;
    }
    return { namespace, scenario, close, models };
  } catch (error) {
    await close();
    throw error;
  }
}

module.exports = { localEndpoint, fixtureScope, installedTeam };
