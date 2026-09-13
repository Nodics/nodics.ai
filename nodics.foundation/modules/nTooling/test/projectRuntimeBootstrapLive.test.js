/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTooling/test/projectRuntimeBootstrapLive
 * @description Qualifies selected runtimes with isolated real Profile, MongoDB, Redis, per-instance proof and full cleanup.
 * @layer test
 * @owner nTooling
 */
const fs = require("node:fs"),
  path = require("node:path"),
  os = require("node:os"),
  net = require("node:net"),
  crypto = require("node:crypto"),
  { spawn } = require("node:child_process");
const root = path.resolve(__dirname, "../../../..");
const helperRoot = path.join(__dirname, "helpers/runtimeAcceptance");
const composition = require(
  path.join(
    root,
    "nodics.foundation/modules/nTooling/src/service/command/defaultRepositoryBuildCompositionService",
  ),
);
/** Reserves and releases a loopback port for a disposable test process. */
async function port() {
  const s = net.createServer();
  await new Promise((r) => s.listen(0, "127.0.0.1", r));
  const p = s.address().port;
  await new Promise((r) => s.close(r));
  return p;
}
(async () => {
  if (!process.argv.includes("--require-live")) {
    console.log(
      "Runtime bootstrap live acceptance NOT EXECUTED: use --require-live to start disposable MongoDB and Redis",
    );
    return;
  }
  const evidenceRoot =
    process.env.NODICS_RUNTIME_ACCEPTANCE_OUTPUT ||
    fs.mkdtempSync(path.join(os.tmpdir(), "nodics-runtime-evidence-"));
  fs.mkdirSync(evidenceRoot, { recursive: true });
  const variant = (
    process.argv.find((value) => value.startsWith("--composition=")) ||
    "--composition=foundation"
  ).split("=")[1];
  if (
    ![
      "foundation",
      "inventory",
      "commerce",
      "cms",
      "process",
      "cluster",
    ].includes(variant)
  )
    throw new Error("Unknown acceptance composition");
  const selected =
    variant === "process"
      ? ["cronjob", "workflow"]
      : variant === "inventory"
        ? ["inventory"]
        : variant === "commerce"
          ? [
              "store",
              "product",
              "pricing",
              "tax",
              "promotion",
              "shoppingList",
              "checkoutCore",
              "order",
              "paymentCore",
              "fulfillmentCore",
            ]
          : [];
  const c = Object.assign(composition.create(root), { variant }),
    db = path.join(c.root, "mongo"),
    redisDir = path.join(c.root, "redis");
  fs.mkdirSync(db);
  fs.mkdirSync(redisDir);
  const mongoPort = await port(),
    redisPort = await port(),
    httpPort = await port();
  const processes = [];
  const secrets = [];
  let providerError;
  const track = (child) => {
    processes.push(child);
    child.on("error", (error) => {
      providerError = error;
    });
    return child;
  };
  try {
    const mongo = spawn(
      process.env.NODICS_MONGOD_BINARY || "mongod",
      [
        "--bind_ip",
        "127.0.0.1",
        "--port",
        String(mongoPort),
        "--dbpath",
        db,
        "--logpath",
        path.join(db, "mongo.log"),
      ],
      { stdio: "ignore" },
    );
    track(mongo);
    const redis = spawn(
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
        redisDir,
      ],
      { stdio: "ignore" },
    );
    track(redis);
    await new Promise((resolve, reject) => {
      const started = Date.now(),
        t = setInterval(() => {
          if (providerError) {
            clearInterval(t);
            reject(providerError);
            return;
          }
          if (
            fs.existsSync(path.join(db, "mongo.log")) &&
            fs
              .readFileSync(path.join(db, "mongo.log"), "utf8")
              .includes("Waiting for connections")
          ) {
            clearInterval(t);
            resolve();
          } else if (Date.now() - started > 12000) {
            clearInterval(t);
            reject(new Error("Isolated provider startup deadline"));
          }
        }, 50);
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
    const props = {
      log: { level: "error" },
      ...(variant === "process"
        ? {
            apiExposure: {
              categories: {
                serviceRegistry: { enabled: true },
                dataImport: { enabled: true },
              },
            },
          }
        : {}),
      runtimeRole: { code: "PLATFORM", publication: "OPERATIONAL" },
      runtimeIdentity: { instanceCode: "profile-1" },
      bootstrapIdentity,
      ...(variant === "process"
        ? {
            identityGovernance: {
              migration: {
                servicePrincipalScopes: {
                  apiAdmin: [
                    "auth.internal.token.read",
                    "import.release.validate",
                    "import.core.run",
                  ],
                },
              },
            },
          }
        : {}),
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
              URI: "mongodb://127.0.0.1:" + mongoPort,
              databaseName: "runtime_acceptance_test",
              options: {
                serverSelectionTimeoutMS: 1500,
                connectTimeoutMS: 1500,
              },
            },
            test: {
              URI: "mongodb://127.0.0.1:" + mongoPort,
              databaseName: "runtime_acceptance_test",
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
            auth: {
              enabled: true,
              engine: "redis",
              fallback: false,
            },
          },
        },
        profile: {
          channels: {
            auth: {
              enabled: true,
              engine: "redis",
              fallback: false,
            },
          },
        },
      },
      backofficeRegistration: { enabled: false },
      runtimeLifecycle: { installSignalHandlers: false },
      mandatoryBootstrapServices: {
        acceptanceGrant: {
          enabled: true,
          order: 150,
          service: "DefaultRuntimeAcceptanceBootstrapService",
        },
        acceptanceFailure: {
          enabled: true,
          order: 999,
          service: "DefaultRuntimeAcceptanceFailureService",
        },
      },
    };
    composition.writeFile(
      path.join(c.environmentRoot, "config/properties.js"),
      "module.exports=" + JSON.stringify(props) + ";",
    );
    const mp = path.join(c.serverRoot, "package.json"),
      metadata = JSON.parse(fs.readFileSync(mp));
    metadata.nodics.extends = ["nodics.foundation"];
    fs.writeFileSync(mp, JSON.stringify(metadata));
    composition.writeFile(
      path.join(c.serverRoot, "config/properties.js"),
      "module.exports=" +
        JSON.stringify({
          activeModules: {
            groups: [],
            modules: [
              "profile",
              ...(variant === "process" ? ["backoffice"] : []),
              "redisCache",
              "nodics.repository-build",
              c.environmentName,
              c.serverName,
            ],
          },
          servers: {
            default: {
              abstractEndpoint: {
                httpHost: "127.0.0.1",
                httpPort,
                httpsHost: "127.0.0.1",
                httpsPort: 0,
              },
              endpoint: {
                httpHost: "127.0.0.1",
                httpPort,
                httpsHost: "127.0.0.1",
                httpsPort: 0,
              },
            },
          },
        }) +
        ";",
    );
    composition.writeFile(
      path.join(
        c.root,
        "src/service/defaultRuntimeAcceptanceBootstrapService.js",
      ),
      fs.readFileSync(
        path.join(helperRoot, "defaultRuntimeAcceptanceBootstrapService.js"),
        "utf8",
      ),
    );
    const workerName = "remoteWorkerServer",
      workerRoot = path.join(c.environmentRoot, workerName),
      workerKey = secret();
    const worker = { ...c, serverName: workerName, serverRoot: workerRoot };
    const workerMetadata = {
      ...metadata,
      name: workerName,
      index: "9000.21",
      nodics: {
        ...metadata.nodics,
        extends: variant === "cms" ? ["nodics.wcms"] : ["nodics.foundation"],
      },
    };
    composition.writeModule(workerRoot, { packageJson: workerMetadata });
    const workerHttp = await port(),
      profileEndpoint = { httpHost: "127.0.0.1", httpPort };
    console.log("PORTS " + JSON.stringify({ httpPort, workerHttp }));
    composition.writeFile(
      path.join(workerRoot, "config/properties.js"),
      "module.exports=" +
        JSON.stringify({
          runtimeRole: {
            code:
              variant === "process"
                ? "PROCESS"
                : variant === "cms"
                  ? "WCMS_ONLINE"
                  : variant === "commerce"
                    ? "COMMERCE"
                    : variant === "inventory"
                      ? "INVENTORY"
                      : "FOUNDATION",
            publication: variant === "cms" ? "ONLINE" : "OPERATIONAL",
          },
          data: { dataReleases: { destinationEnforced: true } },
          activeModules: {
            groups: [],
            modules: [
              ...selected,
              "redisCache",
              "nodics.repository-build",
              c.environmentName,
              workerName,
            ],
          },
          runtimeIdentity: {
            instanceCode: "worker-1",
            remoteModules:
              variant === "process" ? ["profile", "backoffice"] : ["profile"],
          },
          defaultAuthDetail: {
            apiKey: workerKey,
            entCode: "default",
          },
          mandatoryBootstrapServices: {
            acceptanceGrant: { enabled: false },
          },
          servers: {
            default: {
              endpoint: {
                httpHost: "127.0.0.1",
                httpPort: workerHttp,
                httpsPort: 0,
              },
              abstractEndpoint: {
                httpHost: "127.0.0.1",
                httpPort: workerHttp,
                httpsPort: 0,
              },
            },
            ...(variant === "process"
              ? {
                  backoffice: {
                    endpoint: profileEndpoint,
                    abstractEndpoint: profileEndpoint,
                    options: { remoteOnly: true },
                  },
                }
              : {}),
            profile: {
              endpoint: profileEndpoint,
              abstractEndpoint: profileEndpoint,
              options: { remoteOnly: true },
            },
          },
        }) +
        ";",
    );
    const workerSelection = path.join(c.root, "worker-selection.json");
    fs.writeFileSync(workerSelection, JSON.stringify(worker));
    const workerGrant = {
      principalCode: "runtimeWorker",
      remoteModules:
        variant === "process" ? ["profile", "backoffice"] : ["profile"],
      apiKey: workerKey,
      password: secret(),
      serverCode: workerName,
      instanceCode: "worker-1",
    };
    fs.writeFileSync(
      path.join(c.root, "worker-proof.json"),
      JSON.stringify(workerGrant),
    );
    composition.writeFile(
      path.join(
        c.root,
        "src/service/defaultRuntimeAcceptanceFailureService.js",
      ),
      "module.exports={reconcile:async function(){if(process.env.NODICS_TEST_FAILURE==='true')throw new Error('INJECTED_POST_RESOURCE_FAILURE');return true;}};",
    );
    if (variant === "cluster") {
      const clusterProofs = [];
      c.clusterSelections = [];
      for (const index of [0, 1]) {
        const nodeName = "replica" + index,
          nodePort = await port(),
          key = secret();
        composition.writeModule(path.join(workerRoot, nodeName), {
          packageJson: {
            ...workerMetadata,
            name: nodeName,
            index: "9000." + (22 + index),
            nodics: { ...workerMetadata.nodics, kind: "node", extends: [] },
          },
          properties: {
            nodeId: nodeName,
            acceptanceNode: nodeName,
            runtimeIdentity: { instanceCode: "cluster-" + index },
            defaultAuthDetail: { apiKey: key },
            servers: {
              default: {
                endpoint: { httpPort: nodePort },
                abstractEndpoint: { httpPort: nodePort },
                nodes: {
                  [nodeName]: {
                    httpHost: "127.0.0.1",
                    httpPort: nodePort,
                    httpsPort: 0,
                  },
                },
              },
            },
          },
        });
        const grantCode = "cluster_grant_" + index;
        clusterProofs.push({
          ...workerGrant,
          principalCode: "clusterWorker" + index,
          apiKey: key,
          password: secret(),
          instanceCode: "cluster-" + index,
          grantCode,
          nodeName,
        });
        const selected = path.join(c.root, "node-" + index + ".json");
        fs.writeFileSync(
          selected,
          JSON.stringify({
            ...worker,
            nodeName,
            instanceCode: "cluster-" + index,
            grantCode,
          }),
        );
        c.clusterSelections.push(selected);
      }
      fs.writeFileSync(
        path.join(c.root, "cluster-proofs.json"),
        JSON.stringify(clusterProofs),
      );
    }
    composition.writeFile(
      path.join(c.root, "src/schemas/schemas.js"),
      "module.exports=" +
        JSON.stringify({
          "nodics.repository-build": {
            runtimeAcceptanceRecord: {
              super: "base",
              model: true,
              service: { enabled: true },
              router: { enabled: false },
              cache: { enabled: false },
              definition: { marker: { type: "string", required: true } },
            },
          },
        }) +
        ";",
    );
    const selection = path.join(c.root, "selection.json");
    fs.writeFileSync(selection, JSON.stringify(c));
    for (const mode of [
      "worker-build",
      "build",
      "start",
      "restart",
      "failure",
    ]) {
      const child = spawn(
        process.execPath,
        [
          path.join(helperRoot, "projectRuntimeAcceptanceWorker.js"),
          mode === "worker-build" ? workerSelection : selection,
          mode === "worker-build" ? "build" : mode,
        ],
        {
          cwd: root,
          env: {
            ...process.env,
            NODICS_RUNTIME_ACCEPTANCE_ROOT: c.root,
            NODICS_TEST_FAILURE: mode === "failure" ? "true" : "false",
          },
          stdio: ["ignore", "pipe", "pipe"],
        },
      );
      processes.push(child);
      let output = "";
      child.stdout.on("data", (x) => (output += x));
      child.stderr.on("data", (x) => (output += x));
      const code = await new Promise((resolve, reject) => {
        const t = setTimeout(() => {
          child.kill("SIGTERM");
          resolve(-1);
        }, 30000);
        child.once("error", reject);
        child.once("exit", (code) => {
          clearTimeout(t);
          resolve(code);
        });
      });
      for (const value of secrets)
        output = output.split(value).join("[REDACTED]");
      output = output.replace(
        /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g,
        "[REDACTED_TOKEN]",
      );
      fs.writeFileSync(
        path.join(evidenceRoot, variant + "-" + mode + ".log"),
        output,
        { mode: 0o600 },
      );
      if (code !== 0)
        throw new Error("Isolated runtime " + mode + " failed: " + code);
      console.log("PROFILE_" + mode.toUpperCase() + "_PASS " + variant);
    }
  } finally {
    for (const child of processes.reverse()) {
      if (child.pid && child.exitCode === null) {
        child.kill("SIGTERM");
        await Promise.race([
          new Promise((r) => child.once("exit", r)),
          new Promise((r) => setTimeout(r, 3000)),
        ]);
        if (child.exitCode === null) child.kill("SIGKILL");
      }
    }
    fs.rmSync(c.root, { recursive: true, force: true });
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
