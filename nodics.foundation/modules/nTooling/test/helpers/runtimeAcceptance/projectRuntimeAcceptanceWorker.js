/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTooling/test/helpers/runtimeAcceptance/ProjectRuntimeAcceptanceWorker
 * @description Runs a real selected runtime and verifies remote identity, HTTP rejection, restart and partial-start cleanup.
 * @layer test
 * @owner nTooling
 */
const fs = require("node:fs"),
  path = require("node:path"),
  assert = require("node:assert/strict");
const root = path.resolve(__dirname, "../../../../../..");
(async () => {
  const c = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
  if (c.nodeName) {
    process.env.NODICS_NODE = c.nodeName;
    process.env.S = c.serverName;
    process.env.E = c.environmentName;
  }
  const foundation = require(path.join(root, "nodics.foundation"));
  const options = {
    NODICS_HOME: path.join(root, "nodics.foundation"),
    CUSTOM_HOME: c.root,
    MODULE_ROOTS: require(path.join(root, "package.json"))
      .workspaces.map((x) => path.join(root, x))
      .concat(c.root),
    defaultServer: c.serverName,
    defaultEnvironment: c.environmentName,
  };
  if (process.argv[3] === "build") {
    await foundation.buildAll(options);
    fs.writeFileSync(
      path.join(
        c.root,
        c.serverName === "remoteWorkerServer"
          ? "worker-modules.json"
          : "authority-modules.json",
      ),
      JSON.stringify(NODICS.getActiveModules()),
    );
    console.log("PROFILE_DISPOSABLE_BUILD_PASS");
    return;
  }
  const remoteChildren = [];
  try {
    if (process.argv[3] === "failure") {
      await assert.rejects(
        foundation.start(options),
        (error) => error.message === "INJECTED_POST_RESOURCE_FAILURE",
      );
      assert.equal(NODICS.getServerState(), "stopped");
      assert.deepEqual(
        SERVICE.DefaultCacheEngineService.getInitializedClients(),
        [],
      );
      console.log("FAILED_START_RESOURCES_CLOSED_ORIGINAL_ERROR_PRESERVED");
      return;
    }
    await foundation.start(options);
    const recordService = SERVICE.DefaultRuntimeAcceptanceRecordService;
    assert(
      recordService,
      "Project-only schema must produce and load its generated service",
    );
    const recordCode =
      "acceptance" + require("node:crypto").randomUUID().replace(/-/g, "");
    const recordRequest = () => ({
      tenant: "default",
      authData: SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
      query: { code: recordCode },
    });
    const saved = await recordService.save({
      ...recordRequest(),
      model: { code: recordCode, active: true, marker: "created" },
    });
    assert(saved && /^SUC_/.test(saved.code));
    const changed = await recordService.update({
      ...recordRequest(),
      model: { $set: { marker: "updated" } },
    });
    assert(changed.result.acknowledged && changed.result.matchedCount === 1);
    assert.equal(
      (await recordService.get(recordRequest())).result[0].marker,
      "updated",
    );
    const removed = await recordService.remove(recordRequest());
    assert(removed && /^SUC_/.test(removed.code));
    assert.equal((await recordService.get(recordRequest())).result.length, 0);
    console.log("PROJECT_ONLY_GENERATED_PERSISTENCE_PASS");
    const token = NODICS.getInternalAuthToken("default");
    assert(token);
    const decoded = (
      await SERVICE.DefaultAuthorizationProviderService.authorizeToken({
        authToken: token,
      })
    ).result;
    assert.equal(
      decoded.runtimeScope.instanceCode,
      c.serverName === "remoteWorkerServer"
        ? c.instanceCode || "worker-1"
        : "profile-1",
    );
    assert(decoded.modules.includes("profile"));
    const renewed =
      await SERVICE.DefaultInternalAuthenticationProviderService.fetchInternalAuthToken(
        "default",
      );
    assert(renewed.authToken);
    if (c.serverName === "remoteWorkerServer") {
      assert(!NODICS.getActiveModules().includes("profile"));
      assert.equal(SERVICE.DefaultEmployeeService, undefined);
      if (c.variant === "process")
        await require("./processRuntimeAcceptance").worker();
      const verdict = new Promise((resolve) =>
        process.once("message", resolve),
      );
      process.send({
        phase: "revoke-runtime",
        grantCode: c.grantCode || "worker_runtime_grant",
        generatedPath: NODICS.getGeneratedArtifactPath("service"),
        node: NODICS.getNodeName(),
        instance: c.instanceCode,
        marker: CONFIG.get("acceptanceNode"),
      });
      assert.equal((await verdict).phase, "runtime-revoked");
      await assert.rejects(
        SERVICE.DefaultAuthorizationProviderService.authorizeToken({
          authToken: token,
        }),
      );
      await assert.rejects(
        SERVICE.DefaultInternalAuthenticationProviderService.fetchInternalAuthToken(
          "default",
        ),
      );
      console.log("PERSISTED_RUNTIME_REVOCATION_PASS");
      console.log(
        "REMOTE_PROFILE_BOOTSTRAP_PASS " +
          JSON.stringify({
            activeModules: NODICS.getActiveModules(),
            state: NODICS.getServerState(),
          }),
      );
      return;
    }
    const { spawn } = require("node:child_process");
    const observations = [];
    await Promise.all(
      (c.clusterSelections || [path.join(c.root, "worker-selection.json")]).map(
        async (selection) => {
          const remote = spawn(
            process.execPath,
            [__filename, selection, "start"],
            { cwd: root, stdio: ["ignore", "pipe", "pipe", "ipc"] },
          );
          remoteChildren.push(remote);
          if (c.variant === "process")
            require("./processRuntimeAcceptance").authority(remote);
          remote.on("message", (message) => {
            if (message.phase !== "revoke-runtime") return;
            observations.push({
              generatedPath: message.generatedPath,
              node: message.node,
              instance: message.instance,
              marker: message.marker,
            });
            Promise.resolve()
              .then(async () => {
                const result =
                  await SERVICE.DefaultPrincipalScopeAssignmentService.update({
                    tenant: "default",
                    authData:
                      SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
                    query: { code: message.grantCode },
                    model: { $set: { status: "INACTIVE" } },
                  });
                assert(
                  result &&
                    /^SUC_/.test(result.code) &&
                    result.result.acknowledged &&
                    result.result.matchedCount === 1,
                );
                remote.send({ phase: "runtime-revoked" });
              })
              .catch((error) => {
                console.error(error);
                remote.kill("SIGTERM");
              });
          });
          let remoteOutput = "";
          remote.stdout.on("data", (value) => (remoteOutput += value));
          remote.stderr.on("data", (value) => (remoteOutput += value));
          const remoteCode = await new Promise((resolve) => {
            const timer = setTimeout(() => {
              remote.kill("SIGTERM");
              resolve(-1);
            }, 20000);
            remote.on("exit", (code) => {
              clearTimeout(timer);
              resolve(code);
            });
          });
          if (remoteCode !== 0) {
            console.error(remoteOutput);
            throw new Error("Remote runtime failed: " + remoteCode);
          }
          assert(remoteOutput.includes("REMOTE_PROFILE_BOOTSTRAP_PASS"));
          assert(remoteOutput.includes("PERSISTED_RUNTIME_REVOCATION_PASS"));
          if (c.variant === "process")
            assert(remoteOutput.includes("PROCESS_REGISTRY_LIFECYCLE_PASS"));
          console.log("PERSISTED_RUNTIME_REVOCATION_PASS");
          if (c.variant === "process")
            console.log("PROCESS_REGISTRY_LIFECYCLE_PASS");
          console.log(
            remoteOutput
              .split("\n")
              .find((line) => line.startsWith("REMOTE_PROFILE_BOOTSTRAP_PASS")),
          );
          console.log("SEPARATE_RUNTIME_PROFILE_BOOTSTRAP_PASS");
        },
      ),
    );
    if (c.clusterSelections) {
      assert.equal(observations.length, 2);
      assert.equal(new Set(observations.map((x) => x.generatedPath)).size, 1);
      assert.equal(new Set(observations.map((x) => x.instance)).size, 2);
      assert.equal(new Set(observations.map((x) => x.marker)).size, 2);
      console.log(
        "CLUSTER_SHARED_GENERATION_DISTINCT_INSTANCES_PASS " +
          JSON.stringify(
            observations.map(({ generatedPath, ...item }) => item),
          ),
      );
    }
    const provider = SERVICE.DefaultInternalAuthenticationProviderService;
    const proof = CONFIG.get("defaultAuthDetail");
    const headers = {
      ...provider.buildRuntimeIdentityHeaders("default"),
      "x-api-key": proof.apiKey,
      "x-enterprise-code": proof.entCode,
    };
    const request = SERVICE.DefaultModuleService.buildRequest({
      moduleName: "profile",
      methodName: "GET",
      apiName: "/auth/token/default",
      requestBody: {},
      responseType: true,
      header: headers,
    });
    const httpIssued = await SERVICE.DefaultModuleService.fetch(request);
    assert(httpIssued.result && httpIssued.result.authToken);
    assert.equal(
      (
        await SERVICE.DefaultAuthorizationProviderService.authorizeToken({
          authToken: httpIssued.result.authToken,
        })
      ).result.runtimeScope.instanceCode,
      "profile-1",
    );
    console.log("PROFILE_HTTP_ISSUANCE_PASS");
    for (const [key, value] of [
      ["x-nodics-runtime-instance", "unapproved-replica"],
      ["x-nodics-modules", headers["x-nodics-modules"] + ",inventory"],
    ]) {
      const denied = SERVICE.DefaultModuleService.buildRequest({
        moduleName: "profile",
        methodName: "GET",
        apiName: "/auth/token/default",
        requestBody: {},
        responseType: true,
        header: { ...headers, [key]: value },
      });
      await assert.rejects(SERVICE.DefaultModuleService.fetch(denied));
    }
    console.log("PROFILE_HTTP_SCOPE_REJECTIONS_PASS");
    console.log(
      "PROFILE_DISPOSABLE_START_PASS " +
        JSON.stringify({
          state: NODICS.getServerState(),
          scopedToken: true,
          renewed: true,
          activeModules: NODICS.getActiveModules().length,
        }),
    );
  } finally {
    await Promise.all(
      remoteChildren.map(async (child) => {
        if (child.exitCode !== null || child.signalCode !== null) return;
        child.kill("SIGTERM");
        await Promise.race([
          new Promise((resolve) => child.once("exit", resolve)),
          new Promise((resolve) => setTimeout(resolve, 1000)),
        ]);
        if (child.exitCode === null && child.signalCode === null)
          child.kill("SIGKILL");
      }),
    );
    if (global.SERVICE && SERVICE.DefaultRuntimeLifecycleService)
      await SERVICE.DefaultRuntimeLifecycleService.requestShutdown({
        reason: "disposable-acceptance",
      });
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
