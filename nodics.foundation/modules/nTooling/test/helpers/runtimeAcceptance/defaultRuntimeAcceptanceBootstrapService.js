/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTooling/test/helpers/runtimeAcceptance/DefaultRuntimeAcceptanceBootstrapService
 * @description Provisions disposable operator-owned principals and exact deployment grants for runtime acceptance only.
 * @layer test
 * @owner nTooling
 */
const path = require("node:path");
module.exports = {
  /** Creates only fixture records through the real generated Profile services and stamp hooks. */
  reconcile: async function () {
    const root = process.env.NODICS_RUNTIME_ACCEPTANCE_ROOT;
    if (!root) throw new Error("An isolated acceptance root is required");
    const authData =
      SERVICE.DefaultIdentityGovernanceService.getSystemAuthData();
    const model = {
      code: "runtime_acceptance_test",
      principalType: "service",
      principalCode: "apiAdmin",
      scopeType: "RUNTIME_DEPLOYMENT",
      scopeCode: "runtime_acceptance_test",
      inheritanceMode: "DIRECT",
      tenantCode: "default",
      enterpriseCode: "default",
      status: "ACTIVE",
      effect: "ALLOW",
      runtimeScope: {
        projectCode: NODICS.getEnvironmentName(),
        environmentCode: NODICS.getSelectedEnvironmentName(),
        serverCode: NODICS.getServerName(),
        instanceCode: "profile-1",
        modules: NODICS.getActiveModules(),
        permissions: NODICS.getActiveModules().includes("backoffice")
          ? [
              "auth.internal.token.read",
              "import.release.validate",
              "import.core.run",
            ]
          : ["auth.internal.token.read"],
      },
    };
    const save = async (service, record) => {
      const result = await service.save({
        tenant: "default",
        authData,
        query: { code: record.code },
        model: record,
      });
      if (!result || !/^SUC_/.test(result.code || ""))
        throw new Error("Disposable initializer save failed");
    };
    await save(SERVICE.DefaultPrincipalScopeAssignmentService, model);
    const workers = require("node:fs").existsSync(
      path.join(root, "cluster-proofs.json"),
    )
      ? require(path.join(root, "cluster-proofs.json"))
      : [require(path.join(root, "worker-proof.json"))];
    for (const worker of workers) {
      const declared = require(path.join(root, "worker-modules.json"));
      const permissions = [
        "auth.internal.token.read",
        "profile.enterprise.search",
      ];
      const employee = {
        code: worker.principalCode,
        loginId: worker.principalCode,
        active: true,
        name: { firstName: "Runtime", lastName: "Worker" },
        password: {
          loginId: worker.principalCode,
          password: worker.password,
          active: true,
        },
        apiKey: worker.apiKey,
        apiKeyScopes: permissions,
        apiKeyStatus: "active",
        principalType: "service",
        identityMigrationVersion: 5,
        userGroups: ["serviceAccountUserGroup"],
      };
      await save(SERVICE.DefaultEmployeeService, employee);
      await save(SERVICE.DefaultPrincipalScopeAssignmentService, {
        ...model,
        code: worker.grantCode || "worker_runtime_grant",
        principalCode: employee.code,
        runtimeScope: {
          ...model.runtimeScope,
          serverCode: worker.serverCode,
          instanceCode: worker.instanceCode,
          modules: [
            ...new Set([
              ...declared,
              ...(worker.nodeName ? [worker.nodeName] : []),
              ...(worker.remoteModules || ["profile"]),
            ]),
          ],
          permissions,
        },
      });
    }
    return true;
  },
};
