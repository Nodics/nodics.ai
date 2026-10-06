/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module copilotKnowledge/test/runtimeFixture
 * @description Composes a disposable authenticated Copilot runtime using nTooling and provider-owned fixtures. Does not launch or test a frontend.
 * @layer test @owner copilotKnowledge
 */
const fs = require("node:fs");
const path = require("node:path");
const net = require("node:net");
const http = require("node:http");
const crypto = require("node:crypto");
const { spawn } = require("node:child_process");
const { once } = require("node:events");
const ownedCleanup = require("./ownedCleanup");
const root = path.resolve(__dirname, "../../../../../..");
const composition = require(
  path.join(
    root,
    "nodics.foundation/modules/nTooling/src/service/command/defaultRepositoryBuildCompositionService",
  ),
);
const elastic = require(
  path.join(
    root,
    "nodics.foundation/modules/nSearch/elastic/test/helpers/isolatedRetirementProvider",
  ),
);
const journal = require(
  path.join(
    root,
    "nodics.foundation/modules/nDatabase/mongodb/test/helpers/disposableJournal",
  ),
);

/** Selects an ephemeral loopback port without occupying another application's port. @returns {Promise<number>} Port. */
async function port() {
  const server = net.createServer();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const value = server.address().port;
  await new Promise((resolve) => server.close(resolve));
  return value;
}

/** Starts the owned backend fixture with real security, generation publication and persistent receipts. @returns {Promise<Object>} Fixture, restart and mandatory close. */
async function start({
  withOllama = false,
  withRegistration = false,
  withActivity = false,
  withBudgets = false,
  withReconciliation = false,
  withGovernance = false,
  withRetention = false,
  withDatabase = false,
  withEnterpriseActions = false,
  withPriceActions = false,
  withGovernedSchemaActions = false,
  priceResponseLossCode = null,
  withCollectionActions = false,
  collectionResponseLossCode = null,
  withCouponActions = false,
  withRulesInspection = false,
  withProcessInspection = false,
  withProcessActions = false,
  withProcessTriggerActions = false,
  withProcessLifecycleActions = false,
  withProcessTriggerResponseLoss = false,
  withProcessResponseLoss = false,
  withCouponResponseLoss = false,
  withEnterpriseResponseLoss = false,
  withRefresh = false,
  withScheduleResponseLoss = false,
  withRuntimeKnowledge = false,
  withGroups = false,
  withDeleteResponseLoss = false,
  journalResponseLoss = null,
  withAxis = false,
  withIncremental = false,
  erasureEnabled = false,
} = {}) {
  withProcessActions =
    withProcessActions ||
    withProcessTriggerActions ||
    withProcessLifecycleActions;
  withProcessInspection = withProcessInspection || withProcessActions;
  if (withProcessTriggerResponseLoss && !withProcessTriggerActions)
    throw new Error("Trigger response loss requires owned trigger actions");
  if (withProcessResponseLoss && !withProcessActions)
    throw new Error("Process response loss requires owned task actions");
  const withSchemaActions =
    withPriceActions || withCollectionActions || withGovernedSchemaActions;
  const withNativeActions =
    withSchemaActions ||
    withCouponActions ||
    withRulesInspection ||
    withProcessInspection;
  if (withCouponResponseLoss && !withCouponActions)
    throw new Error("Coupon response loss requires owned coupon actions");
  if (withRetention && !withGovernance)
    throw new Error("Retention requires owned governance");
  if (
    priceResponseLossCode !== null &&
    (!withPriceActions ||
      !/^acceptance_[a-zA-Z0-9_-]{1,64}$/.test(priceResponseLossCode))
  )
    throw new Error(
      "Price response loss requires one synthetic owned price code",
    );
  if (
    collectionResponseLossCode !== null &&
    (!withCollectionActions ||
      !/^acceptance_[a-z0-9_]{1,64}$/.test(collectionResponseLossCode))
  )
    throw new Error(
      "Collection response loss requires one synthetic owned centre code",
    );
  if (withRefresh && (!withAxis || !withRegistration))
    throw new Error("Recorded refresh requires owned Process and registration");
  if (withScheduleResponseLoss && !withRefresh)
    throw new Error("Schedule response loss requires owned refresh");
  if (withEnterpriseResponseLoss && !withEnterpriseActions)
    throw new Error(
      "Enterprise response loss requires owned enterprise actions",
    );
  if (![null, "STARTED", "ERASED"].includes(journalResponseLoss))
    throw new Error("Unsupported disposable journal fault");
  const c = composition.create(root);
  c.additionalModuleRoots = [
    ...(withCollectionActions ? ["nodics.waste"] : []),
    ...(withRulesInspection ? ["nodics.rulesEngine"] : []),
  ];
  c.journalResponseLoss = journalResponseLoss;
  c.failMeasuredSettlement = withReconciliation;
  if (withAxis || withEnterpriseActions || withNativeActions) {
    const environmentRoot = path.join(c.root, "envs", "copilotAcceptanceLocal");
    fs.renameSync(c.environmentRoot, environmentRoot);
    c.environmentRoot = environmentRoot;
    c.environmentName = "copilotAcceptanceLocal";
    c.serverRoot = path.join(environmentRoot, c.serverName);
    const environmentMetadata = JSON.parse(
      fs.readFileSync(path.join(environmentRoot, "package.json")),
    );
    environmentMetadata.name = c.environmentName;
    environmentMetadata.nodics.kind = "group";
    environmentMetadata.nodics.deploymentClass = "LOCAL";
    composition.writeFile(
      path.join(environmentRoot, "package.json"),
      environmentMetadata,
    );
  }
  let provider, database, testDatabase, runtime, redis;
  const derivedDatabaseNames = [];
  const password = crypto.randomBytes(32).toString("hex");
  const secrets = [password];
  let childSequence = 0;
  const cleanup = ownedCleanup.create(() => composition.remove(c));
  const diagnostics = [];
  const runtimeLogs = [];
  const worker = path.join(__dirname, "runtimeWorker.js");
  const selection = path.join(c.root, "acceptance-selection.json");
  /** Stops only a child created by this fixture and awaits actual exit. */
  async function stop(child) {
    if (!child || child.exitCode !== null || child.signalCode !== null) return;
    const exit = once(child, "exit");
    child.kill("SIGTERM");
    const timeout = setTimeout(() => child.kill("SIGKILL"), 15000);
    try {
      await exit;
    } finally {
      clearTimeout(timeout);
    }
  }
  /** Removes only newly generated resources after all runtime connections close. */
  async function close() {
    await cleanup.close();
  }
  /** Runs the normal Foundation build/start in a fresh process, redacting fixture secrets on errors. */
  async function launch(mode, selected = c) {
    const selectionPath =
      selected === c
        ? selection
        : path.join(c.root, selected.serverName + "-selection.json");
    if (selected !== c) composition.writeFile(selectionPath, selected);
    const child = spawn(process.execPath, [worker, selectionPath, mode], {
      cwd: root,
      env: {
        ...process.env,
        ELASTIC_APM_ACTIVE: "false",
        ELASTIC_APM_CAPTURE_BODY: "off",
        ELASTIC_APM_CAPTURE_HEADERS: "false",
      },
      stdio: ["ignore", "pipe", "pipe", "ipc"],
    });
    cleanup.add("process:" + ++childSequence, () => stop(child));
    let output = "";
    if (mode === "start")
      runtimeLogs.push({
        server: selected.serverName,
        read: () =>
          output
            .split("\n")
            .filter((line) =>
              /error|TypeError|ReferenceError|^\s+at |ERR_[A-Z_0-9]+/.test(
                line,
              ),
            )
            .map((line) => {
              let value = line;
              for (const secret of secrets)
                value = value.split(secret).join("[REDACTED]");
              value = value.replace(
                /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g,
                "[REDACTED]",
              );
              return {
                codes: [
                  ...new Set(
                    value.match(
                      /\b(?:ERR_[A-Z0-9_]+|[A-Z]+_[A-Z0-9_]{3,})\b/g,
                    ) || [],
                  ),
                ],
                frames: (value.match(/at [^\n\\]+:\d+:\d+\)?/g) || []).slice(
                  0,
                  4,
                ),
              };
            })
            .filter((entry) => entry.codes.length || entry.frames.length)
            .slice(-30),
      });
    for (const stream of [child.stdout, child.stderr])
      stream.on("data", (data) => {
        output = (output + data).slice(-48000);
      });
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        child.kill("SIGTERM");
        reject(new Error("Acceptance runtime deadline: " + safeOutput()));
      }, 180000);
      /** Redacts known generated credentials and bearer-shaped values before exposing startup diagnostics. */
      function safeOutput() {
        let value = output;
        for (const secret of secrets)
          value = value.split(secret).join("[REDACTED]");
        return value.replace(
          /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g,
          "[REDACTED]",
        );
      }
      child.once("error", (error) => {
        clearTimeout(timer);
        reject(error);
      });
      child.on("message", (message) => {
        if (message.phase === "diagnostic") diagnostics.push(message);
        if (message.phase === "failed") {
          clearTimeout(timer);
          reject(
            new Error("Acceptance runtime startup failed: " + safeOutput()),
          );
        }
        if (message.phase === "ready") {
          clearTimeout(timer);
          resolve();
        }
      });
      child.once("exit", (code) => {
        clearTimeout(timer);
        if (mode === "build" && code === 0) resolve();
        else
          reject(
            new Error(
              "Acceptance runtime exited: " + code + "\n" + safeOutput(),
            ),
          );
      });
    });
    return child;
  }
  try {
    provider = await elastic.start();
    cleanup.add("provider:elastic", () => provider.close());
    database = await journal.create(
      require(
        path.join(
          root,
          "nodics.discovery/modules/discoveryPublication/src/schemas/schemas",
        ),
      ).discoveryPublication.discoveryIndexRetirementReceipt,
    );
    cleanup.add("database:journal", () => database.close());
    if (withEnterpriseActions) {
      derivedDatabaseNames.push(
        await database.reserveTenantNamespace("acceptance_business"),
      );
      testDatabase = await journal.create({});
      cleanup.add("database:test-channel", () => testDatabase.close());
      derivedDatabaseNames.push(
        await testDatabase.reserveTenantNamespace("acceptance_business"),
      );
    }
    const target = await provider.createTarget({
      ownerType: "COPILOT_KNOWLEDGE",
      tenantCode: "default",
      enterpriseCode: "default",
    });
    const native = provider.inspectionInput(target.model);
    const fault = withDeleteResponseLoss
      ? await require(
          path.join(
            root,
            "nodics.foundation/modules/nSearch/elastic/test/helpers/deleteAcknowledgementProxy",
          ),
        ).start(native.node, target.identity.physicalName)
      : null;
    if (fault)
      cleanup.add("transport:delete-acknowledgement", () => fault.close());
    secrets.push(native.auth.password);
    const httpPort = await port();
    const redisPort = await port();
    redis = spawn(
      process.env.NODICS_REDIS_BINARY || "redis-server",
      [
        "--bind",
        "127.0.0.1",
        "--port",
        String(redisPort),
        "--save",
        "",
        "--appendonly",
        "no",
        "--dir",
        c.root,
      ],
      { stdio: ["ignore", "pipe", "pipe"] },
    );
    cleanup.add("process:" + ++childSequence, () => stop(redis));
    await new Promise((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error("Owned Redis startup deadline")),
        10000,
      );
      redis.once("error", (error) => {
        clearTimeout(timer);
        reject(error);
      });
      redis.stdout.on("data", (bytes) => {
        if (String(bytes).includes("Ready to accept connections")) {
          clearTimeout(timer);
          resolve();
        }
      });
    });
    const secret = () => {
      const value = crypto.randomBytes(40).toString("hex");
      secrets.push(value);
      return value;
    };
    const bootstrapIdentity = {
      source: "runtimeSecret",
      adminPassword: secret(),
      servicePassword: secret(),
      serviceApiKey: secret(),
    };
    const corpus = path.join(c.root, "corpus");
    composition.writeFile(
      path.join(corpus, "README.md"),
      "# Synthetic acceptance knowledge\nThe acceptance collection colour is green.\n",
    );
    const props = {
      httpHardening: {
        cors: {
          allowedOrigins: ["http://127.0.0.1:3100", "http://127.0.0.1:3102"],
        },
      },
      profileBrowserSession: {
        enabled: true,
        allowInsecureLoopback: true,
        sameSite: "Lax",
        refreshCookieName: "copilot_acceptance_refresh",
        csrfCookieName: "copilot_acceptance_csrf",
      },
      ...(withAxis
        ? {
            backofficeRegistration: {
              heartbeatIntervalMs: 30000,
              leaseTtlMs: 60000,
              operationalStateTtlMs: 60000,
            },
            backofficeRegistry: {
              publicBootstrap: {
                requiredModules: {
                  cms: {
                    moduleName: "cms",
                    server: "acceptanceWcmsOnline",
                    runtimeRole: "ONLINE",
                  },
                },
                optionalModules: {
                  editorial: {
                    moduleName: "editorial",
                    server: "acceptanceWcmsOnline",
                    runtimeRole: "ONLINE",
                  },
                },
              },
            },
          }
        : {}),
      log: {
        level: "error",
        requestPrivacy: { qualified: true, captureMode: "disabled" },
      },
      runtimeRole: { code: "PLATFORM", publication: "OPERATIONAL" },
      runtimeIdentity: {
        instanceCode: "copilot-acceptance",
        ...(withAxis || withNativeActions
          ? {
              remoteModules: [
                ...(withAxis
                  ? ["cms", "workflow", "editorial", "publish"]
                  : []),
                ...(withPriceActions ? ["pricing", "product"] : []),
                ...(withGovernedSchemaActions ? ["product"] : []),
                ...(withCouponActions ? ["digitalCore"] : []),
                ...(withRulesInspection ? ["rulesApi"] : []),
                ...(withProcessInspection ? ["workflow"] : []),
                ...(withCollectionActions
                  ? ["wasteCollection", "locationCore"]
                  : []),
              ],
            }
          : {}),
      },
      bootstrapIdentity,
      defaultAuthDetail: {
        apiKey: bootstrapIdentity.serviceApiKey,
        entCode: "default",
      },
      authSecurity: {
        apiKey: { pepper: secret() },
        jwt: { secret: secret() },
        securityStamp: {
          enabled: true,
          failClosed: true,
          allowMissingStamp: false,
          cacheModuleName: "auth",
        },
        refreshToken: { requireDistributedCache: true },
      },
      database: {
        default: {
          mongodb: {
            master: {
              URI: process.env.NODICS_ERASURE_MONGO_URI,
              databaseName: database.databaseName,
            },
            test: {
              URI: process.env.NODICS_ERASURE_MONGO_URI,
              databaseName: (testDatabase || database).databaseName,
            },
          },
        },
      },
      cache: {
        invalidation: { crossNode: false },
        default: {
          engines: {
            redis: {
              enabled: true,
              options: { url: "redis://127.0.0.1:" + redisPort },
            },
          },
        },
        auth: {
          channels: {
            auth: { enabled: true, engine: "redis", fallback: false },
          },
        },
        profile: {
          channels: {
            auth: { enabled: true, engine: "redis", fallback: false },
          },
        },
      },
      search: {
        default: {
          elastic: {
            connection: {
              hosts: [fault ? fault.origin : native.node],
              auth: native.auth,
              maxRetries: 0,
            },
          },
        },
      },
      backofficeRegistration: { enabled: withRegistration },
      runtimeLifecycle: { installSignalHandlers: false },
      mandatoryBootstrapServices: {
        copilotAcceptance: {
          enabled: true,
          order: 150,
          service: "DefaultCopilotAcceptanceBootstrapService",
        },
      },
      copilotAcceptance: {
        password,
        databaseName: database.databaseName,
        withOllama,
        withRegistration,
        withActivity,
        withBudgets,
        withReconciliation,
        withGovernance,
        withRetention,
        withDatabase,
        withEnterpriseActions,
        withPriceActions,
        withGovernedSchemaActions,
        withCollectionActions,
        withCouponActions,
        withRulesInspection,
        withProcessInspection,
        withProcessActions,
        withProcessTriggerActions,
        withProcessLifecycleActions,
        withProcessTriggerResponseLoss,
        withProcessResponseLoss,
        withCouponResponseLoss,
        collectionResponseLossCode,
        priceResponseLossCode,
        withEnterpriseResponseLoss,
        withRefresh,
        withScheduleResponseLoss,
        withRuntimeKnowledge,
        withAxis,
      },
      copilot: {
        core: {
          environment: withRefresh ? c.environmentName : "acceptance",
          ...(withRefresh
            ? { customerProject: "nodics.repository-build" }
            : {}),
        },
        api: { enabled: true },
        conversation: { transcriptInspection: { enabled: withActivity } },
        knowledge: {
          groups: {
            enabled: withGroups,
            definitions: withGroups
              ? [
                  {
                    code: "acceptance-group",
                    name: "Acceptance knowledge",
                    active: true,
                    sourceCodes: ["acceptance"],
                  },
                  {
                    code: "inactive-group",
                    name: "Inactive knowledge",
                    active: false,
                    sourceCodes: ["acceptance"],
                  },
                ]
              : [],
            assignments: withGroups
              ? [
                  {
                    tenantCode: "default",
                    enterpriseCode: "default",
                    groupCodes: ["acceptance-group", "inactive-group"],
                    allowedSourceCodes: ["acceptance"],
                  },
                ]
              : [],
          },
          generationPublication: {
            enabled: true,
            incrementalEnabled: withIncremental,
          },
          ingestion: { enabled: true, ingestOnStart: false },
          retrieval: { enabled: true },
          repositoryRoots: {
            acceptance: corpus,
            ...(withRuntimeKnowledge ? { framework: root } : {}),
          },
          sourceRegistry: {
            definitions: {
              $config: "replace",
              value: [
                {
                  code: "acceptance",
                  repository: "acceptance",
                  project: "acceptance",
                  module: "copilotKnowledge",
                  owner: "copilotKnowledge",
                  version: "v1",
                  sourceType: "README",
                  classification: "INTERNAL",
                  paths: ["README.md"],
                  allowedChannels: withRefresh
                    ? ["EMPLOYEE", "SYSTEM"]
                    : ["EMPLOYEE"],
                  requiredPermissions: ["copilot.knowledge.internal.read"],
                  enterpriseScopes: ["default"],
                  secretScanPolicy: "REQUIRED",
                  enabled: true,
                },
                ...(withDatabase
                  ? [
                      {
                        code: "acceptance-data",
                        repository: "runtime",
                        project: "acceptance",
                        module: "profile",
                        owner: "profile",
                        version: "v1",
                        sourceType: "DATABASE",
                        classification: "RESTRICTED",
                        paths: ["*"],
                        excludedPaths: ["employee", "user", "policy"],
                        allowedChannels: ["EMPLOYEE"],
                        requiredPermissions: ["copilot.data.query"],
                        tenantScopes: ["default"],
                        enterpriseScopes: ["default"],
                        environmentScopes: ["acceptance"],
                        secretScanPolicy: "REQUIRED",
                        enabled: true,
                      },
                    ]
                  : []),
                ...(withGovernedSchemaActions
                  ? [
                      {
                        code: "acceptance-product-data",
                        repository: "runtime",
                        project: "acceptance",
                        module: "product",
                        owner: "product",
                        version: "v1",
                        sourceType: "DATABASE",
                        classification: "RESTRICTED",
                        paths: ["schemaActionRecord"],
                        excludedPaths: [],
                        allowedChannels: ["EMPLOYEE"],
                        requiredPermissions: ["copilot.data.query"],
                        tenantScopes: ["default"],
                        enterpriseScopes: ["default"],
                        environmentScopes: ["acceptance"],
                        secretScanPolicy: "REQUIRED",
                        enabled: true,
                      },
                    ]
                  : []),
              ],
            },
          },
          legacyMigration: {
            enabled: true,
            erasureEnabled,
            plans: {
              acceptance: {
                label: "Disposable legacy knowledge",
                tenantCode: "default",
                enterpriseCode: "default",
                legacyIndexName: "acceptanceLegacy",
                sourceCodes: ["acceptance"],
              },
            },
          },
        },
      },
    };
    if (withRuntimeKnowledge) {
      for (const [code, sourceType, relative] of [
        [
          "acceptance-runtime-code",
          "SOURCE_CODE",
          "src/service/defaultCopilotKnowledgeSourceRegistryService.js",
        ],
        ["acceptance-runtime-docs", "README", "README.md"],
      ])
        props.copilot.knowledge.sourceRegistry.definitions.value.push({
          code,
          repository: "framework",
          project: "acceptance",
          module: "copilotKnowledge",
          owner: "copilotKnowledge",
          runtimeModule: "copilotKnowledge",
          version: crypto
            .createHash("sha256")
            .update(
              fs.readFileSync(
                path.join(
                  root,
                  "nodics.copilot/modules/copilotKnowledge",
                  relative,
                ),
              ),
            )
            .digest("hex"),
          sourceType,
          classification: "RESTRICTED",
          paths: [relative],
          allowedChannels: ["EMPLOYEE"],
          requiredPermissions: ["copilot.knowledge.restricted.read"],
          tenantScopes: ["default"],
          enterpriseScopes: ["default"],
          environmentScopes: ["acceptance"],
          secretScanPolicy: "REQUIRED",
          enabled: true,
        });
    }
    if (withEnterpriseActions) {
      props.serviceCommunication = { timeoutMs: 30000 };
      props.profileTenantProvisioning = {
        enabled: true,
        allowInsecureLoopback: true,
      };
      props.apiExposure = {
        categories: { profileTenantProvisioning: { enabled: true } },
      };
      props.commandReceipts = { enabled: true, owners: { profile: true } };
      props.identityGovernance = {
        migration: {
          localRuntimeDeploymentGrantPermissions: [
            ...require(
              path.join(
                root,
                "nodics.foundation/modules/nAuth/config/properties",
              ),
            ).identityGovernance.migration
              .localRuntimeDeploymentGrantPermissions,
            "profile.tenant.namespace.bind",
          ],
        },
      };
      props.copilot.workbench = {
        enterpriseTarget: {
          enabled: true,
          moduleName: "profile",
          connectionName: "profile",
          targetAuthority: { runtimeRole: "PLATFORM" },
        },
        standaloneInvitationsEnabled: true,
        receiptRecovery: { enabled: true },
      };
    }
    if (withProcessActions) {
      props.commandReceipts = {
        enabled: true,
        owners: { ...props.commandReceipts?.owners, workflow: true },
      };
      props.copilot.workbench = {
        ...props.copilot.workbench,
        processTaskTarget: {
          enabled: true,
          moduleName: "workflow",
          connectionName: "process",
          targetAuthority: { runtimeRole: "PROCESS" },
        },
        ...(withProcessTriggerActions
          ? {
              processTriggerTarget: {
                enabled: true,
                moduleName: "workflow",
                connectionName: "process",
                targetAuthority: { runtimeRole: "PROCESS" },
              },
            }
          : {}),
        ...(withProcessLifecycleActions
          ? {
              processLifecycleTarget: {
                enabled: true,
                moduleName: "workflow",
                connectionName: "process",
                targetAuthority: { runtimeRole: "PROCESS" },
              },
              processLifecycleTimeoutMs: 30000,
            }
          : {}),
        receiptRecovery: { enabled: true },
      };
    }
    if (withProcessInspection) {
      props.copilot.capability = {
        ...props.copilot.capability,
        processInspection: {
          enabled: true,
          connectionName: "process",
          targetAuthority: { runtimeRole: "PROCESS" },
          scopes: [
            {
              tenant: "default",
              enterprise: "default",
              environment: withRefresh ? c.environmentName : "acceptance",
              definitionCodes: ["acceptance_process", "acceptance_failure"],
              instanceCodes: ["acceptance_instance", "acceptance_failed"],
              taskCodes: ["acceptance_task"],
              incidentCodes: [],
              triggerCodes: [],
            },
          ],
        },
      };
    }
    if (withRulesInspection) {
      props.copilot.capability = {
        ...props.copilot.capability,
        rulesInspection: {
          enabled: true,
          connectionName: "rules",
          targetAuthority: { runtimeRole: "RULES" },
          maximumRows: 25,
          scopes: [
            {
              tenant: "default",
              enterprise: "default",
              environment: "acceptance",
              ruleCodes: ["acceptance_rule"],
              bandCodes: ["acceptance_band"],
              propertyProviderCodes: ["acceptance"],
            },
          ],
        },
      };
    }
    if (withCouponActions) {
      props.copilot.workbench = {
        ...props.copilot.workbench,
        couponTarget: {
          enabled: true,
          moduleName: "digitalCore",
          connectionName: "commerce",
          targetAuthority: { runtimeRole: "COMMERCE" },
        },
      };
    }
    if (withPriceActions) {
      props.commandReceipts = {
        enabled: true,
        owners: {
          ...props.commandReceipts?.owners,
          pricing: true,
          product: true,
        },
      };
      props.copilot.workbench = {
        ...props.copilot.workbench,
        standalonePricesEnabled: true,
        target: {
          pricingModule: "pricing",
          productModule: "product",
          connectionName: "commerceStaged",
          targetAuthority: { runtimeRole: "STAGED" },
        },
        receiptRecovery: { enabled: true },
      };
    }
    if (withGovernedSchemaActions) {
      props.commandReceipts = {
        enabled: true,
        owners: { ...props.commandReceipts?.owners, product: true },
      };
      props.copilot.workbench = {
        ...props.copilot.workbench,
        schemaActions: {
          enabled: true,
          sources: {
            "acceptance-product-data": ["schemaActionRecord"],
          },
          timeoutMs: 30000,
        },
        receiptRecovery: { enabled: true },
      };
    }
    if (withCollectionActions) {
      props.commandReceipts = {
        enabled: true,
        owners: { ...props.commandReceipts?.owners, wasteCollection: true },
      };
      props.copilot.workbench = {
        ...props.copilot.workbench,
        collectionCentreTarget: {
          enabled: true,
          moduleName: "wasteCollection",
          connectionName: "waste",
          targetAuthority: { runtimeRole: "WASTE" },
        },
        receiptRecovery: { enabled: true },
      };
    }
    if (withRefresh) {
      props.apiExposure = {
        categories: {
          ...props.apiExposure?.categories,
          moduleInternal: { enabled: true },
        },
      };
      props.identityGovernance = {
        migration: {
          localRuntimeDeploymentGrantPermissions: [
            ...require(
              path.join(
                root,
                "nodics.foundation/modules/nAuth/config/properties",
              ),
            ).identityGovernance.migration
              .localRuntimeDeploymentGrantPermissions,
            "process.instance.start.internal",
            "copilot.knowledge.source.manage",
            "copilot.knowledge.source.notify",
            "copilot.knowledge.internal.read",
            ...(withEnterpriseActions ? ["profile.tenant.namespace.bind"] : []),
          ],
        },
      };
      props.copilot.knowledge.workflowRefresh = {
        enabled: true,
        manualEnabled: true,
        actionAuthority: {
          connectionName: "process",
          runtimeRole: "PROCESS",
          timeoutMs: 30000,
        },
        assignments: [
          {
            tenantCode: "default",
            enterpriseCode: "default",
            projectCode: "nodics.repository-build",
            environmentCode: c.environmentName,
            definitionCode: "copilotKnowledgeRefresh",
            version: 1,
            sourceCode: "acceptance",
          },
        ],
      };
      props.copilotAcceptance.refreshOrigin = "http://127.0.0.1:" + httpPort;
      props.copilot.knowledge.eventRefresh = {
        enabled: true,
        publishers: [
          {
            tenantCode: "default",
            enterpriseCode: "default",
            projectCode: "nodics.repository-build",
            environmentCode: c.environmentName,
            publisherId: "apiAdmin",
            sourceCode: "acceptance",
            definitionCode: "copilotKnowledgeRefresh",
            version: 1,
          },
        ],
      };
    }
    if (withGovernance) {
      props.dynamoEnabled = true;
      props.copilot.policy = {
        administration: {
          delegations: [
            {
              tenantCode: "default",
              enterpriseCode: "default",
              sections: ["allocations", "groups"],
            },
          ],
        },
      };
      props.runtimePropertyGovernance = {
        persistence: {
          enabled: true,
          requireDurableJournal: true,
          maximumChanges: 1000,
          maximumBytes: 1048576,
        },
        readFence: { enabled: true, owners: { copilotConversation: true } },
      };
    }
    if (withRetention) {
      props.databaseTransactions = { enabled: true, failClosed: true };
      Object.assign(props.copilot.conversation, {
        storage: "GENERATED_SERVICE",
        retentionDays: 1,
        writerFence: { enabled: true },
        lifecycle: { deletionEnabled: true, maximumBatch: 1 },
        auditRetention: {
          deletionEnabled: true,
          maximumBatch: 1,
          enterprisePolicies: ["TRANSCRIPT_ACCESS", "ACTION"].map((kind) => ({
            tenantCode: "default",
            enterpriseCode: "default",
            kind,
            retentionDays: 2,
            holdAll: false,
            conversationCodes: [],
            recordCodes: ["acceptance-held-audit"],
          })),
        },
      });
    }
    if (withOllama) {
      props.copilot.providers = {
        enabled: true,
        default: { adapter: "ollama", streaming: false, maximumRetries: 0 },
        adapters: {
          ollama: {
            enabled: true,
            model: {
              name:
                process.env.NODICS_COPILOT_LOCAL_MODEL || "qwen2.5-coder:7b",
            },
          },
        },
        profiles: {
          conversation: {
            maximumOutputTokens:
              withEnterpriseActions || withSchemaActions ? 2048 : 64,
            temperature: 0,
          },
        },
        accounting: {
          enabled: true,
          reconciliation: { enabled: withReconciliation },
          tenantLimit: 100000,
          enterprises: [
            {
              tenantCode: "default",
              enterpriseCode: "default",
              limit: 100000,
              adapters: ["ollama"],
              profiles: ["conversation"],
              users: [
                { principalCode: "copilot_acceptance_operator", limit: 10000 },
                { principalCode: "copilot_acceptance_reader", limit: 0 },
              ],
            },
          ],
        },
      };
      if (withEnterpriseActions || withSchemaActions || withProcessActions)
        props.copilot.core.intentPlanning = { enabled: true };
    }
    const providerBaseline = withOllama
      ? structuredClone(props.copilot.providers.adapters.ollama)
      : null;
    let providerFault = { mode: "NORMAL", requests: 0 };
    let providerFaultSequence = 0;
    const propertiesPath = path.join(c.environmentRoot, "config/properties.js");
    composition.writeFile(
      propertiesPath,
      "module.exports=" + JSON.stringify(props) + ";\n",
    );
    const metadata = JSON.parse(
      fs.readFileSync(path.join(c.serverRoot, "package.json")),
    );
    metadata.nodics.extends = [
      "nodics.platform",
      "nodics.discovery",
      "nodics.copilot",
    ];
    metadata.nodics.runtimeAliases = ["platform", "profile", "backoffice"];
    if (withAxis || withNativeActions)
      metadata.nodics.runtimeModuleRoots = composition
        .runtimeGroups(root)
        .concat(c.additionalModuleRoots)
        .filter((name) => name !== "nodics.foundation");
    composition.writeFile(path.join(c.serverRoot, "package.json"), metadata);
    const endpoint = {
      httpHost: "127.0.0.1",
      httpPort,
      httpsHost: "127.0.0.1",
      httpsPort: 0,
    };
    composition.writeFile(
      path.join(c.serverRoot, "config/properties.js"),
      "module.exports=" +
        JSON.stringify({
          activeModules: {
            groups: [],
            modules: [
              "redisCache",
              "search",
              "elastic",
              "ollamaProvider",
              ...(withGovernance ? ["dynamo"] : []),
              "nodics.repository-build",
              c.environmentName,
              c.serverName,
            ],
          },
          servers: { default: { endpoint, abstractEndpoint: endpoint } },
        }) +
        ";\n",
    );
    composition.writeFile(
      path.join(
        c.root,
        "src/service/defaultCopilotAcceptanceBootstrapService.js",
      ),
      fs.readFileSync(
        path.join(__dirname, "defaultCopilotAcceptanceBootstrapService.js"),
        "utf8",
      ),
    );
    if (withDatabase || withRefresh || withSchemaActions)
      composition.writeFile(
        path.join(c.root, "src/schemas/schemas.js"),
        "module.exports=" +
          JSON.stringify({
            ...(withCollectionActions
              ? {
                  wasteCollection: {
                    wasteCollectionPoint: {
                      accessGroups: { copilot_acceptance_operator: 10 },
                    },
                  },
                  locationCore: {
                    location: {
                      accessGroups: { copilot_acceptance_operator: 10 },
                    },
                  },
                  profile: {
                    address: {
                      accessGroups: { copilot_acceptance_operator: 10 },
                    },
                  },
                }
              : {}),
            ...(withPriceActions || withGovernedSchemaActions
              ? {
                  product: {
                    product: {
                      accessGroups: { copilot_acceptance_operator: 10 },
                    },
                    ...(withGovernedSchemaActions
                      ? {
                          schemaActionRecord: {
                            super: "base",
                            model: true,
                            service: { enabled: true },
                            router: {
                              enabled: true,
                              groups: { schemaOperations: true },
                            },
                            cache: { enabled: false },
                            event: { enabled: false },
                            accessGroups: {
                              copilot_acceptance_operator: 10,
                            },
                            backoffice: {
                              enabled: true,
                              operations: [
                                "search",
                                "read",
                                "create",
                                "update",
                                "delete",
                              ],
                              concurrency: {
                                enabled: true,
                                required: true,
                                field: "revision",
                              },
                            },
                            commandReceipt: {
                              journalSchema: "productCommandReceipt",
                              insertOnly: true,
                            },
                            definition: {
                              code: { type: "string", required: true },
                              name: { type: "string", required: true },
                              revision: { type: "int", required: true },
                            },
                          },
                        }
                      : {}),
                  },
                  pricing: {
                    priceRow: {
                      accessGroups: { copilot_acceptance_operator: 10 },
                    },
                    priceBook: {
                      accessGroups: { copilot_acceptance_operator: 10 },
                    },
                  },
                }
              : {}),
            ...(withDatabase
              ? {
                  profile: {
                    address: {
                      accessGroups: { copilot_acceptance_operator: 10 },
                    },
                    enterprise: {
                      accessGroups: { copilot_acceptance_operator: 1 },
                    },
                    employee: {
                      accessGroups: { copilot_acceptance_operator: 1 },
                    },
                  },
                }
              : {}),
            ...(withRefresh
              ? {
                  cronjob: {
                    cronJob: {
                      accessGroups: {
                        copilot_acceptance_operator: 10,
                        serviceAccountUserGroup: 10,
                      },
                    },
                  },
                }
              : {}),
          }) +
          ";\n",
      );
    const replacement = "acceptance-replacement-" + crypto.randomUUID();
    composition.writeFile(
      path.join(c.root, "src/search/indexes.js"),
      "module.exports=" +
        JSON.stringify({
          discoveryProjection: {
            discoveryDocumentProjection: { indexName: replacement },
            acceptanceLegacy: {
              enabled: true,
              schemaName: "discoveryDocumentProjection",
              typeName: "acceptanceLegacy",
              properties: {},
              indexName: native.indexDef.indexName,
              retirement: native.indexDef.retirement,
            },
          },
        }) +
        ";\n",
    );
    const axisRuntimes = [];
    if (withAxis || withNativeActions) {
      for (const [
        serverName,
        role,
        extendsGroups,
        modules,
        aliases,
        publication,
      ] of [
        ...(withProcessInspection && !withAxis
          ? [
              [
                "acceptanceProcess",
                "PROCESS",
                ["nodics.process"],
                ["workflow"],
                ["process", "workflow"],
                "OPERATIONAL",
              ],
            ]
          : []),
        ...(withRulesInspection
          ? [
              [
                "acceptanceRules",
                "RULES",
                ["nodics.rulesEngine"],
                ["rulesApi", "rulesDefinition", "rulesEvaluation", "rulesCore"],
                ["rules"],
                "OPERATIONAL",
              ],
            ]
          : []),
        ...(withCouponActions
          ? [
              [
                "acceptanceCommerce",
                "COMMERCE",
                ["nodics.commerce"],
                ["digitalCore", "promotion"],
                ["commerce"],
                "OPERATIONAL",
              ],
            ]
          : []),
        ...(withCollectionActions
          ? [
              [
                "acceptanceLocation",
                "LOCATION",
                ["nodics.location"],
                ["locationCore"],
                ["location", "locationCore"],
                "OPERATIONAL",
              ],
              [
                "acceptanceWaste",
                "WASTE",
                ["nodics.waste"],
                ["wasteCore", "wasteCollection"],
                ["waste", "wasteCollection"],
                "OPERATIONAL",
              ],
            ]
          : []),
        ...(withPriceActions || withGovernedSchemaActions
          ? [
              [
                "acceptanceCommerceStaged",
                "COMMERCE_STAGED",
                ["nodics.commerce"],
                ["pricing", "product", "store", "publish", "vMongodb"],
                ["commerceStaged"],
                "STAGED",
              ],
            ]
          : []),
        ...(withAxis
          ? [
              [
                "acceptanceWcmsOnline",
                "WCMS_ONLINE",
                ["nodics.wcms", "nodics.discovery"],
                [
                  "axis",
                  "cms",
                  "editorial",
                  "media",
                  "publish",
                  "wcmsExperience",
                ],
                ["wcmsOnline", "cmsOnline"],
                "ONLINE",
              ],
              [
                "acceptanceProcess",
                "PROCESS",
                ["nodics.process"],
                [],
                ["process", "workflow"],
                "OPERATIONAL",
              ],
              [
                "acceptanceWcmsStaged",
                "WCMS_STAGED",
                ["nodics.wcms", "nodics.discovery"],
                [
                  "axis",
                  "cms",
                  "editorial",
                  ...(withCollectionActions
                    ? ["locationCore", "wasteCollection"].filter(
                        (name) => !modules.includes(name),
                      )
                    : []),
                  "media",
                  "publish",
                  "wcmsExperience",
                  "cmsStaged",
                  "vMongodb",
                ],
                ["wcmsStaged", "cmsStaged", "wcms"],
                "STAGED",
              ],
            ]
          : []),
      ]) {
        const store = await journal.create(
          require(
            path.join(
              root,
              "nodics.discovery/modules/discoveryPublication/src/schemas/schemas",
            ),
          ).discoveryPublication.discoveryIndexRetirementReceipt,
        );
        cleanup.add("database:" + serverName.toLowerCase(), () =>
          store.close(),
        );
        let variantStore = store;
        if (withEnterpriseActions) {
          derivedDatabaseNames.push(
            await store.reserveTenantNamespace("acceptance_business"),
          );
          variantStore = await journal.create({});
          cleanup.add("database:test-" + serverName.toLowerCase(), () =>
            variantStore.close(),
          );
          derivedDatabaseNames.push(
            await variantStore.reserveTenantNamespace("acceptance_business"),
          );
        }
        const selected = {
          ...c,
          serverName,
          serverRoot: path.join(c.environmentRoot, serverName),
        };
        const httpPort = await port();
        const definition = structuredClone(metadata);
        definition.name = serverName;
        definition.index = "9000." + (21 + axisRuntimes.length);
        definition.nodics.extends = extendsGroups;
        definition.nodics.runtimeAliases = aliases;
        definition.nodics.runtimeIdentity = {
          instanceCode: "copilot-" + serverName,
          remoteModules: [
            "profile",
            "backoffice",
            "workflow",
            "cms",
            "editorial",
            ...(withRefresh ? ["copilotApi"] : []),
          ],
        };
        const serverProperties = {
          activeModules: {
            groups: [],
            modules: [
              "redisCache",
              "search",
              "elastic",
              ...modules,
              "nodics.repository-build",
              c.environmentName,
              serverName,
            ],
          },
          runtimeRole: { code: role, publication },
          runtimeIdentity: definition.nodics.runtimeIdentity,
          ...(role === "COMMERCE" && withCouponActions
            ? {
                digitalCore: { merchantRedemption: { enabled: true } },
                promotion: { publication: { runtimeRole: "OPERATIONAL" } },
              }
            : {}),
          ...(role === "LOCATION"
            ? {
                apiExposure: {
                  categories: { locationInternal: { enabled: true } },
                },
              }
            : {}),
          ...(role === "COMMERCE_STAGED"
            ? {
                runtimeAuthorityContexts: {
                  default: "commerce.staged",
                  modules: {
                    pricing: true,
                    product: true,
                    store: true,
                    publish: true,
                  },
                },
                schemaPolicies: {
                  pricing: {
                    publicationVersioned: {
                      isVersionedEnabled: true,
                      versionedReadMode: "CURRENT",
                    },
                  },
                  product: {
                    catalogueVersioned: {
                      isVersionedEnabled: true,
                      versionedReadMode: "CURRENT",
                    },
                  },
                },
                pricing: { publication: { runtimeRole: "STAGED" } },
              }
            : {}),
          ...(role.startsWith("WCMS_")
            ? {
                runtimeAuthorityContexts: {
                  default:
                    role === "WCMS_STAGED" ? "wcms.staged" : "wcms.online",
                  modules: Object.fromEntries(
                    [
                      "cms",
                      "editorial",
                      "media",
                      "publish",
                      "wcmsExperience",
                      "discoveryConfig",
                      "discoveryMapping",
                      "discoveryProjection",
                      "discoveryPublication",
                      "discoveryQuery",
                      "discoveryRanking",
                      "discoveryRuntime",
                      "discoverySource",
                    ].map((name) => [name, true]),
                  ),
                },
              }
            : {}),
          mandatoryBootstrapServices: { copilotAcceptance: { enabled: false } },
          ...(role === "PROCESS"
            ? {
                ...(withRefresh
                  ? {
                      data: {
                        dataReleases: {
                          contributions: [
                            {
                              moduleName: "cms",
                              sections: ["cmsPublicationApproval"],
                            },
                            {
                              moduleName: "copilotApi",
                              sections: ["knowledgeRefreshWorkflow"],
                            },
                          ],
                        },
                      },
                    }
                  : {}),
                process: {
                  publicationDecisionCallback: {
                    target: { connectionName: "cmsStaged" },
                  },
                  actionAdapters: {
                    allowedActions: {
                      $config: "replace",
                      value: [
                        "cms.applyPublicationDecision",
                        ...(withRefresh ? ["copilotApi.refreshKnowledge"] : []),
                      ],
                    },
                    ...(withRefresh
                      ? {
                          definitions: {
                            "copilotApi.refreshKnowledge": {
                              moduleName: "copilotApi",
                              operation: "refreshKnowledge",
                              remote: {
                                moduleName: "copilotApi",
                                target: "copilotKnowledge",
                                runtimeRole: "PLATFORM",
                                apiName: "/workflow/actions/refreshKnowledge",
                                recordAttempts: true,
                              },
                            },
                          },
                        }
                      : {}),
                  },
                  ...(withRefresh
                    ? {
                        runtime: {
                          internalStarts: {
                            enabled: true,
                            allowedDefinitions: ["copilotKnowledgeRefresh"],
                          },
                        },
                        remoteActions: {
                          targets: {
                            copilotKnowledge: {
                              connectionName: "platform",
                              timeoutMs: 30000,
                            },
                          },
                        },
                      }
                    : {}),
                },
              }
            : {}),
          database: {
            default: {
              mongodb: {
                master: { databaseName: store.databaseName },
                test: { databaseName: variantStore.databaseName },
              },
            },
          },
          ...(role === "PROCESS" && withRefresh
            ? {
                nodeId: "copilot-acceptance-process",
                cronjob: {
                  scheduleDrafts: {
                    enabled: true,
                    activationEnabled: true,
                    targets: [
                      {
                        code: "acceptance-refresh",
                        label: "Disposable source refresh",
                        tenantCode: "default",
                        enterpriseCode: "default",
                        runOnNode: "copilot-acceptance-process",
                        triggerCode: "acceptance-refresh-trigger",
                        expressions: ["*/5 * * * * *"],
                        context: {
                          sourceCode: "acceptance",
                          expectedPolicyDigest:
                            require("../../../src/service/defaultCopilotKnowledgeSourceRegistryService").normalize(
                              props.copilot.knowledge.sourceRegistry.definitions
                                .value[0],
                              require("../../../config/properties").copilot
                                .knowledge.sourceRegistry,
                              require("../../../../copilotPolicy/src/service/defaultCopilotPolicyService"),
                            ).sourcePolicyDigest,
                        },
                      },
                    ],
                  },
                },
              }
            : {}),
          servers: {
            default: {
              endpoint: {
                httpHost: "127.0.0.1",
                httpPort,
                httpsHost: "127.0.0.1",
                httpsPort: 0,
              },
              abstractEndpoint: {
                httpHost: "127.0.0.1",
                httpPort,
                httpsHost: "127.0.0.1",
                httpsPort: 0,
              },
            },
          },
          ...(role === "WCMS_STAGED"
            ? {
                cms: {
                  publication: {
                    enabled: true,
                    runtimeRole: "STAGED",
                    baselines: {
                      axis: {
                        releaseVersion: require(
                          path.join(
                            root,
                            "nodics.platform/modules/axis/data/manifest.json",
                          ),
                        ).sections.axisBaseline.version,
                      },
                    },
                    targetTransportProvider:
                      "DefaultCmsPublicationModuleTransportService",
                    target: { connectionName: "cmsOnline" },
                    workflow: { target: { connectionName: "process" } },
                  },
                },
                publish: {
                  approvalWorkflow: {
                    target: {
                      connectionName: "process",
                      connectionType: "abstract",
                      runtimeRole: "PROCESS",
                    },
                  },
                },
              }
            : role === "WCMS_ONLINE"
              ? {
                  cms: {
                    publication: {
                      enabled: true,
                      runtimeRole: "ONLINE",
                      baselines: {
                        axis: {
                          releaseVersion: require(
                            path.join(
                              root,
                              "nodics.platform/modules/axis/data/manifest.json",
                            ),
                          ).sections.axisBaseline.version,
                        },
                      },
                    },
                  },
                  editorial: {
                    publication: {
                      runtimeRole: "ONLINE",
                      targetTransportProvider: null,
                    },
                  },
                }
              : {}),
        };
        composition.writeModule(selected.serverRoot, {
          packageJson: definition,
          properties: serverProperties,
        });
        axisRuntimes.push({
          selected,
          role,
          databaseName: store.databaseName,
          origin: "http://127.0.0.1:" + httpPort,
        });
      }
    }
    composition.writeFile(selection, c);
    if (withAxis) {
      const projection = require(
        path.join(
          root,
          "nodics.foundation/modules/nConfig/src/service/defaultDeploymentConfigurationProjectionService",
        ),
      );
      for (const selected of [
        c,
        ...axisRuntimes.map((item) => item.selected),
      ]) {
        try {
          const projected = projection.read({
            projectRoot: c.root,
            frameworkRoot: root,
            environment: c.environmentName,
            server: selected.serverName,
            inheritEnvironment: true,
          });
          if (
            selected.serverName.startsWith("acceptanceWcms") &&
            (!projected.modules.includes("cms") ||
              projected.properties.servers.cms?.remoteOnly === true)
          )
            throw new Error(
              "Owned WCMS composition must mount its local CMS routes",
            );
        } catch (error) {
          let diagnostic =
            String(error.stderr || "")
              .split("\n")
              .find((line) => line.startsWith("Error:")) ||
            (error.message ===
            "Owned WCMS composition must mount its local CMS routes"
              ? error.message
              : "Projection unavailable");
          for (const secret of secrets)
            diagnostic = diagnostic.split(secret).join("[REDACTED]");
          throw new Error(
            "Owned composition " + selected.serverName + ": " + diagnostic,
          );
        }
      }
    }
    await launch("build");
    runtime = await launch("start");
    for (const item of axisRuntimes) {
      await launch("build", item.selected);
      item.runtime = await launch("start", item.selected);
    }
    /** Rebuilds only the owned runtime after a fixture configuration change. */
    async function restartConfigured() {
      await stop(runtime);
      composition.writeFile(
        path.join(
          c.root,
          "src/service/defaultCopilotAcceptanceBootstrapService.js",
        ),
        fs.readFileSync(
          path.join(__dirname, "defaultCopilotAcceptanceBootstrapService.js"),
          "utf8",
        ),
      );
      composition.writeFile(
        propertiesPath,
        "module.exports=" + JSON.stringify(props) + ";\n",
      );
      await launch("build");
      runtime = await launch("start");
    }
    return {
      root: c.root,
      diagnostics,
      baseUrl: "http://127.0.0.1:" + httpPort,
      projectCode: JSON.parse(
        fs.readFileSync(path.join(c.root, "package.json"), "utf8"),
      ).name,
      password,
      target,
      fault,
      axisRuntimes: axisRuntimes.map(({ role, origin }) => ({ role, origin })),
      close,
      /** Disables new manual starts while preserving original Process history admission. */
      restartRecordedRefreshDisabled: async () => {
        if (!withRefresh) throw new Error("Owned refresh fixture required");
        props.copilot.knowledge.workflowRefresh.manualEnabled = false;
        composition.writeFile(
          propertiesPath,
          "module.exports=" + JSON.stringify(props) + ";\n",
        );
        await stop(runtime);
        await launch("build");
        runtime = await launch("start");
      },
      runtimeDiagnostics: () => ({
        diagnostics,
        runtimes: runtimeLogs.map(({ server, read }) => ({
          server,
          lines: read(),
        })),
      }),
      restartAxisRuntime: async (role) => {
        const item = axisRuntimes.find((entry) => entry.role === role);
        if (!item) throw new Error("Owned Axis runtime required");
        await stop(item.runtime);
        await launch("build", item.selected);
        item.runtime = await launch("start", item.selected);
      },
      restart: restartConfigured,
      /** Sends one event from the owned registered runtime; credentials never leave that worker. */
      notifySourceEvent: async function (body) {
        if (!withRefresh) throw new Error("Owned refresh fixture required");
        const requestId = crypto.randomUUID();
        return new Promise((resolve, reject) => {
          const child = runtime;
          const timer = setTimeout(() => {
            child.off("message", receive);
            reject(new Error("Event notification deadline"));
          }, 60000);
          /** Receives only the correlated minimized HTTP result. */
          function receive(message) {
            if (
              message.phase !== "sourceEventEvidence" ||
              message.requestId !== requestId
            )
              return;
            clearTimeout(timer);
            child.off("message", receive);
            if (message.failed)
              reject(
                new Error(
                  "Event notification failed: " +
                    JSON.stringify(message.diagnostic),
                ),
              );
            else resolve(message.evidence);
          }
          child.on("message", receive);
          child.send({ action: "notifySourceEvent", requestId, body });
        });
      },
      /** Reads fixed synthetic retention identities through generated owners; this IPC seam cannot mutate records. */
      inspectRetentionFixture: async function () {
        if (!withRetention) throw new Error("Owned retention fixture required");
        const requestId = crypto.randomUUID();
        return new Promise((resolve, reject) => {
          const child = runtime;
          const timer = setTimeout(() => {
            child.off("message", receive);
            reject(new Error("Retention inspection deadline"));
          }, 10000);
          /** Resolves only this bounded inspection's correlated reply. */
          function receive(message) {
            if (
              message.phase !== "retentionEvidence" ||
              message.requestId !== requestId
            )
              return;
            clearTimeout(timer);
            child.off("message", receive);
            if (message.failed)
              reject(new Error("Retention inspection failed"));
            else resolve(message.evidence);
          }
          child.on("message", receive);
          child.send({ action: "inspectRetentionFixture", requestId });
        });
      },
      /** Returns transport counters only; synthetic payloads and credentials are not captured. */
      providerFaultEvidence: () => ({ ...providerFault }),
      /** Changes only the owned fixture's layered provider settings and rebuilds normally. */
      restartProviderScenario: async function (mode) {
        if (
          !withOllama ||
          ![
            "NORMAL",
            "MISSING_MODEL",
            "UNAVAILABLE",
            "TIMEOUT",
            "INVALID_PROFILE",
          ].includes(mode)
        )
          throw new Error("Owned provider scenario required");
        const adapter = structuredClone(providerBaseline);
        props.copilot.providers.adapters.ollama = adapter;
        props.copilot.providers.profiles.conversation.temperature =
          mode === "INVALID_PROFILE" ? 3 : 0;
        providerFault = { mode, requests: 0 };
        if (mode === "MISSING_MODEL")
          adapter.model.name =
            "copilot-acceptance-missing-" + crypto.randomUUID();
        if (["UNAVAILABLE", "TIMEOUT"].includes(mode)) {
          const evidence = providerFault;
          const server = http.createServer((request, response) => {
            evidence.requests++;
            request.resume();
            if (mode === "UNAVAILABLE") {
              response.writeHead(503, { "Content-Type": "text/plain" });
              response.end("Synthetic provider unavailable");
            }
          });
          cleanup.add(
            "transport:provider-" +
              mode.toLowerCase() +
              "-" +
              ++providerFaultSequence,
            async () => {
              server.closeAllConnections();
              if (!server.listening) return;
              await new Promise((resolve, reject) =>
                server.close((error) => (error ? reject(error) : resolve())),
              );
            },
          );
          server.listen(0, "127.0.0.1");
          await once(server, "listening");
          adapter.connection = {
            host: "127.0.0.1",
            port: server.address().port,
            timeoutMs: 250,
            healthTimeoutMs: 250,
          };
        }
        await restartConfigured();
      },
      /** Returns scoped topology and cleanup evidence without configuration values or credentials. */
      evidence: function () {
        return {
          compositionRoot: c.root,
          databaseName: database.databaseName,
          ...(testDatabase
            ? {
                testDatabaseName: testDatabase.databaseName,
                derivedDatabaseNames: derivedDatabaseNames.slice(),
              }
            : {}),
          axisRuntimes: axisRuntimes.map(
            ({ role, origin, databaseName, runtime: child }) => ({
              role,
              origin,
              databaseName,
              pid: child.pid,
            }),
          ),
          runtime: {
            role: "PLATFORM",
            origin: "http://127.0.0.1:" + httpPort,
            pid: runtime.pid,
          },
          redis: { port: redisPort, pid: redis.pid },
          provider: {
            version: provider.version,
            origin: native.node,
            ...provider.resources,
          },
          binding: {
            logical: "acceptanceLegacy",
            ...target.identity,
            replacement,
          },
          configuration: {
            sourceVersion:
              props.copilot.knowledge.sourceRegistry.definitions.value[0]
                .version,
            migrationEnabled: props.copilot.knowledge.legacyMigration.enabled,
            erasureEnabled:
              props.copilot.knowledge.legacyMigration.erasureEnabled,
            allowedOrigins: props.httpHardening.cors.allowedOrigins,
            profileSecurityStamp: props.authSecurity.securityStamp.enabled,
            distributedAuth:
              props.authSecurity.refreshToken.requireDistributedCache,
          },
          capture: {
            request: "disabled",
            apmActive: false,
            apmBody: "off",
            apmHeaders: false,
          },
          faultEvidence: {
            priceResponseLoss: priceResponseLossCode !== null,
            nativePriceCompletions: diagnostics.filter(
              (entry) => entry.code === "PRICE_NATIVE_COMPLETED",
            ).length,
            priceResponsesLost: diagnostics.filter(
              (entry) => entry.code === "PRICE_RESPONSE_LOST",
            ).length,
            journalResponseLoss,
            enterpriseResponseLoss: withEnterpriseResponseLoss,
            nativeEnterpriseCompletions: diagnostics.filter(
              (entry) => entry.code === "ENTERPRISE_NATIVE_COMPLETED",
            ).length,
            enterpriseResponsesLost: diagnostics.filter(
              (entry) => entry.code === "ENTERPRISE_RESPONSE_LOST",
            ).length,
            journalResponsesLost: diagnostics.filter(
              (entry) => entry.code === "ERASURE_JOURNAL_RESPONSE_LOST",
            ).length,
            ...(fault ? { nativeDelete: fault.evidence() } : {}),
          },
          cleanup: cleanup.snapshot(),
        };
      },
      /** Enables erasure only in the owned fixture after its caller has qualified retirement and native writer revocation. */
      restartErasureEnabled: async function () {
        props.copilot.knowledge.legacyMigration.erasureEnabled = true;
        await restartConfigured();
      },
      /** Changes only the synthetic source's required grants to exercise real policy drift after review. */
      restartSourceAccess: async function (requireRestricted) {
        props.copilot.knowledge.sourceRegistry.definitions.value[0].requiredPermissions =
          [
            "copilot.knowledge.internal.read",
            ...(requireRestricted ? ["copilot.knowledge.restricted.read"] : []),
          ];
        await restartConfigured();
      },
      /** Applies an empty enterprise source ceiling only to the owned group's fixture configuration. */
      restartGroupCeiling: async function (exclude) {
        if (!withGroups) throw new Error("Owned group fixture required");
        props.copilot.knowledge.groups.assignments[0].allowedSourceCodes =
          exclude ? [] : ["acceptance"];
        await restartConfigured();
      },
      /** Restarts the actual Nodics process after updating only this fixture's authored write gates. */
      restartReadOnly: async function () {
        props.copilot.knowledge.legacyMigration.enabled = false;
        props.copilot.knowledge.legacyMigration.erasureEnabled = false;
        await restartConfigured();
      },
      /** Admits one native failure incident only in this private Process fixture, then reloads normal application configuration. */
      restartProcessIncident: async function (code) {
        if (
          !withProcessInspection ||
          typeof code !== "string" ||
          !/^acceptance_failed-incident[A-Za-z0-9._-]{0,100}$/.test(code)
        )
          throw new Error("Owned native Process incident required");
        props.copilot.capability.processInspection.scopes[0].incidentCodes = [
          code,
        ];
        await restartConfigured();
      },
      /** Disables transcript recording through the real conversation configuration owner. */
      restartRecordingOff: async function () {
        props.copilot.conversation ||= {};
        props.copilot.conversation.recording = {
          enabled: false,
          version: "acceptance-off",
        };
        await restartConfigured();
      },
    };
  } catch (error) {
    await close();
    throw error;
  }
}
module.exports = { start };
