/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module copilotKnowledge/service/DefaultCopilotKnowledgeProcessStartService
 * @description Shared single-dispatch Process start transport for already-authorized source events and employee refresh commands.
 * @layer service @owner copilotKnowledge
 * @override Callers must select and recheck current authority; preserve strict acknowledgements, exact identity and no transport retry.
 */
module.exports = {
  /** Starts an owner-authorized stable identity through nService, accepting only exact Process evidence. @param {Object} request Verified caller request. @param {Object} selected Knowledge-owned assignment and target. @returns {Promise<Object>} Minimized Process receipt. */
  start: async function (request, selected) {
    const response = await SERVICE.DefaultModuleService.invokeModule({
      moduleName: "workflow",
      local: false,
      connectionName: selected.target.connectionName,
      targetAuthority: { runtimeRole: selected.target.runtimeRole },
      tenant: request.tenant,
      header: { tenant: request.tenant },
      methodName: "POST",
      apiName: "/internal/instances",
      timeoutMs: selected.target.timeoutMs,
      maxAttempts: 1,
      requestBody: {
        sourceModule: "copilotApi",
        definitionCode: selected.definitionCode,
        version: selected.version,
        instanceCode: selected.instanceCode,
        context: {
          sourceCode: selected.sourceCode,
          expectedPolicyDigest: selected.sourcePolicyDigest,
        },
      },
    });
    const instance = response?.data?.instance;
    if (
      !/^SUC_/.test(response?.code || "") ||
      [response, response?.data].some(
        (value) =>
          !value ||
          value.error ||
          value.success === false ||
          value.acknowledged === false ||
          (value.errors !== undefined &&
            (!Array.isArray(value.errors) || value.errors.length)),
      ) ||
      !instance ||
      instance.code !== selected.instanceCode ||
      instance.definitionCode !== selected.definitionCode ||
      instance.version !== selected.version ||
      instance.startCompleted !== true ||
      instance.context?.sourceCode !== selected.sourceCode ||
      instance.context?.expectedPolicyDigest !== selected.sourcePolicyDigest
    )
      throw new CLASSES.NodicsError("ERR_CPK_00024");
    return {
      contractVersion: 1,
      state: "START_ACKNOWLEDGED",
      instanceCode: selected.instanceCode,
      definitionCode: selected.definitionCode,
      version: selected.version,
      sourceCode: selected.sourceCode,
      sourcePolicyDigest: selected.sourcePolicyDigest,
      evidence: "PROCESS_INSTANCE",
    };
  },
};
