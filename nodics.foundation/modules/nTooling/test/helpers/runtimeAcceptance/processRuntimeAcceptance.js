/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTooling/test/helpers/runtimeAcceptance/ProcessRuntimeAcceptance
 * @description Exercises real registry HTTP lifecycle decisions and owning-module admission against disposable storage.
 * @layer test
 * @owner nTooling
 */
const assert = require("node:assert/strict");
/** Awaits one parent instruction without polling a production endpoint. */
function instruction() {
  return new Promise((resolve) => process.once("message", resolve));
}
module.exports = {
  /** Runs the worker side against the actual registration agent, authentication cache and Process owners. */
  worker: async function () {
    const agent = SERVICE.DefaultModuleRegistrationAgentService;
    assert(await agent.runRegistration(), JSON.stringify(agent._metrics));
    await assert.rejects(
      SERVICE.DefaultCronJobService.assertOperational("default"),
      /inactive/,
    );
    await assert.rejects(
      SERVICE.DefaultProcessRuntimeLifecycleService.startInstance({
        tenant: "default",
      }),
      /inactive/,
    );
    process.send({ phase: "registered" });
    const activated = await instruction();
    assert.equal(activated.phase, "activated");
    assert(await agent.runRegistration(), JSON.stringify(agent._metrics));
    await SERVICE.DefaultCronJobService.assertOperational("default");
    const adminAuth = (
      await SERVICE.DefaultAuthorizationProviderService.authorizeToken({
        authToken: activated.adminToken,
      })
    ).result;
    const definitionCode =
      "runtimeAcceptance" +
      require("node:crypto").randomUUID().replace(/-/g, "");
    const request = { tenant: "default", authData: adminAuth, definitionCode };
    await SERVICE.DefaultProcessDefinitionLifecycleService.createDefinition({
      ...request,
      model: {
        code: definitionCode,
        name: "Runtime acceptance",
        graph: {
          nodes: [
            { code: "start", type: "START", name: "Start" },
            { code: "end", type: "END", name: "End" },
          ],
          transitions: [{ code: "finish", source: "start", target: "end" }],
        },
      },
    });
    await SERVICE.DefaultProcessDefinitionLifecycleService.publishDraft(
      request,
    );
    const started =
      await SERVICE.DefaultProcessRuntimeLifecycleService.startInstance({
        ...request,
        runtimeOperation: {
          definitionCode,
          instanceCode: definitionCode + "-instance",
        },
      });
    assert(started.code && /^SUC_/.test(started.code));
    let completeJob,
      executed = 0;
    SERVICE.RuntimeAcceptanceTarget = {
      run: () => {
        executed++;
        return new Promise((resolve) => {
          completeJob = resolve;
        });
      },
    };
    const outcome = [];
    const trigger = () =>
      SERVICE.DefaultCronJobTriggerHandlerService.triggerProcess(
        {
          definition: {
            tenant: "default",
            jobDetail: { startNode: "RuntimeAcceptanceTarget.run" },
          },
        },
        {},
        {
          nextSuccess: () => outcome.push("completed"),
          error: (_request, _response, error) => outcome.push(error.message),
        },
      );
    await trigger();
    assert.equal(executed, 1);
    process.send({ phase: "running" });
    assert.equal((await instruction()).phase, "deactivated");
    assert(await agent.runRegistration());
    await trigger();
    assert.equal(executed, 1);
    assert.match(outcome[0], /inactive/);
    await assert.rejects(
      SERVICE.DefaultProcessRuntimeLifecycleService.startInstance(request),
      /inactive/,
    );
    completeJob({ completed: true });
    await new Promise(setImmediate);
    assert(
      outcome.includes("completed"),
      "Admitted work completes after deactivation",
    );
    process.send({ phase: "deactivation-enforced" });
    assert.equal((await instruction()).phase, "deregistered");
    assert(await agent.runRegistration());
    await assert.rejects(
      SERVICE.DefaultCronJobService.assertOperational("default"),
      /inactive/,
    );
    console.log("PROCESS_REGISTRY_LIFECYCLE_PASS");
  },
  /** Uses a real authenticated employee session for revision-protected lifecycle HTTP decisions. */
  authority: function (remote) {
    let adminToken;
    const transition = async (action) => {
      const catalogue = SERVICE.DefaultFunctionalModuleCatalogueService;
      const project = NODICS.getEnvironmentName();
      const record = await catalogue.getRecord(project, "nodics.process", {
        tenant: "default",
      });
      assert(
        record,
        "Process observation must be persisted before lifecycle decisions",
      );
      const request = SERVICE.DefaultModuleService.buildRequest({
        moduleName: "backoffice",
        methodName: "POST",
        apiName: "/runtime/modules/registrations/nodics.process/" + action,
        header: { Authorization: "Bearer " + adminToken },
        requestBody: {
          project,
          expectedRevision: record.catalogueRevision,
          reason: "Disposable runtime acceptance",
        },
      });
      return SERVICE.DefaultModuleService.fetch(request);
    };
    remote.on("message", (message) => {
      Promise.resolve()
        .then(async () => {
          if (message.phase === "registered") {
            const session =
              await SERVICE.DefaultAuthenticationProviderService.authenticateEmployee(
                {
                  loginId: "admin",
                  entCode: "default",
                  password: CONFIG.get("bootstrapIdentity").adminPassword,
                },
              );
            adminToken = session.result.authToken;
            assert(adminToken);
            await transition("register");
            await transition("activate");
            remote.send({ phase: "activated", adminToken });
          } else if (message.phase === "running") {
            await transition("deactivate");
            remote.send({ phase: "deactivated" });
          } else if (message.phase === "deactivation-enforced") {
            await transition("deregister");
            remote.send({ phase: "deregistered" });
          }
        })
        .catch((error) => {
          console.error(error);
          remote.kill("SIGTERM");
        });
    });
  },
};
