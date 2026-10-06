/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
const { isDeepStrictEqual } = require("node:util");
/**
 * @module workflow/service/operation/DefaultProcessTriggerCommandReceiptService
 * @description Binds four native trigger commands to the existing private command receipt protocol. Inputs, employee and original result remain Workflow-owned; inspection never executes a trigger.
 * @layer service @owner workflow
 * @override Later layers may tighten admission and native lifecycle validation while preserving original scope, exact inputs and no uncertain replay.
 */
module.exports = {
  /** Resolves only fixed native trigger commands. @param {string} kind Command suffix. @returns {Object} Owner method and permission; throws for unknown names. */
  operation: function (kind) {
    const commands = {
      create: { method: "createTrigger", permission: "process.trigger.manage" },
      update: { method: "updateTrigger", permission: "process.trigger.manage" },
      archive: {
        method: "archiveTrigger",
        permission: "process.trigger.manage",
      },
      execute: {
        method: "executeTrigger",
        permission: "process.trigger.execute",
      },
    };
    if (!Object.hasOwn(commands, kind))
      SERVICE.DefaultModelCommandReceiptService.fail();
    return commands[kind];
  },
  /** Rechecks native permission at every shared receipt boundary. @param {Object} request Original employee context. @param {string} kind Fixed command. @returns {void} Throws on denial. */
  authorize: function (request, kind) {
    const security = SERVICE.DefaultSecuredRequestPipelineService;
    if (
      !security?.isPermissionGranted(
        this.operation(kind).permission,
        security.getGrantedPermissions(request),
        security.getRouteActionAuthorizationConfig(),
      )
    )
      SERVICE.DefaultModelCommandReceiptService.fail();
  },
  /** Binds the command input and checks original acknowledged domain identity. @param {Object} request Native context. @param {string} kind Command suffix. @param {string} key Original key. @returns {Object} Existing journal declaration. */
  command: function (request, kind, key) {
    this.operation(kind);
    const lifecycle = SERVICE.DefaultProcessRuntimeLifecycleService;
    const protocol = SERVICE.DefaultModelCommandReceiptService;
    const body = structuredClone(lifecycle.bodyOf(request));
    const input = {
      triggerCode: lifecycle.assertCode(
        request.triggerCode || body.code || body.triggerCode,
      ),
      body,
    };
    if (kind === "create" && body.code !== input.triggerCode) protocol.fail();
    return {
      moduleName: "workflow",
      journalSchema: "processCommandReceipt",
      operation: "trigger." + kind,
      input,
      key,
      authorize: () => this.authorize(request, kind),
      resultIdentity: (response) => {
        const data = protocol.result({ ...response, result: response?.data });
        const trigger = kind === "execute" ? data.trigger : data;
        protocol.result({ code: response.code, result: trigger });
        if (kind === "execute") {
          protocol.result({ code: response.code, result: data.execution });
          protocol.result({
            code: response.code,
            result: data.execution.instance,
          });
        }
        if (
          response.code !==
            (kind === "execute" ? "SUC_PROCESS_00011" : "SUC_PROCESS_00010") ||
          trigger?.code !== input.triggerCode
        )
          protocol.fail();
        if (kind === "create" || kind === "update") {
          const fields = [
            "name",
            "version",
            "triggerType",
            "cronJobCode",
            "status",
            "schedule",
            "active",
            ...(kind === "create" ? ["definitionCode", "ownerModule"] : []),
          ];
          if (
            fields.some(
              (field) =>
                body[field] !== undefined &&
                !isDeepStrictEqual(trigger[field], body[field]),
            )
          )
            protocol.fail();
        }
        if (
          kind === "archive" &&
          (trigger.status !== "ARCHIVED" || trigger.active !== false)
        )
          protocol.fail();
        if (
          kind === "execute" &&
          (data.execution?.instance?.startCompleted !== true ||
            data.execution.instance.definitionCode !== trigger.definitionCode ||
            (body.instanceCode !== undefined &&
              data.execution.instance.code !== body.instanceCode) ||
            !["RUNNING", "WAITING", "COMPLETED"].includes(
              data.execution.instance.status,
            ))
        )
          protocol.fail();
        return input.triggerCode;
      },
    };
  },
  /** Records a keyed command before native mutation; genuinely unkeyed native requests retain their existing lifecycle. @param {Object} request Native context. @param {string} kind Fixed command. @returns {Promise<Object>} Owner acknowledgement; no retry. */
  execute: async function (request, kind) {
    const operation = this.operation(kind);
    const lifecycle = SERVICE.DefaultProcessRuntimeLifecycleService;
    const headers = request.httpRequest?.headers || request.headers || {};
    const key =
      request.idempotencyKey !== undefined
        ? request.idempotencyKey
        : Object.hasOwn(headers, "idempotency-key")
          ? headers["idempotency-key"]
          : headers["Idempotency-Key"];
    if (key === undefined) return lifecycle[operation.method](request);
    const command = this.command(request, kind, key);
    return SERVICE.DefaultModelCommandReceiptService.execute(
      request,
      command,
      () =>
        lifecycle[operation.method]({
          ...request,
          triggerCode: command.input.triggerCode,
          runtimeOperation: structuredClone(command.input.body),
        }),
    );
  },
  /** Reads the exact original receipt, including with new recording disabled. @param {Object} request Secured original command/key query. @returns {Promise<Object>} Scoped receipt without a trigger/instance mutation. */
  inspect: async function (request) {
    const body =
      request.httpRequest?.body || request.runtimeOperation || request.body;
    if (
      !body ||
      Object.keys(body).sort().join() !== "command,idempotencyKey" ||
      !body.command ||
      typeof body.command !== "object" ||
      Array.isArray(body.command)
    )
      SERVICE.DefaultModelCommandReceiptService.fail();
    const original = { ...request, runtimeOperation: body.command };
    return {
      code: "SUC_PROCESS_00010",
      data: await SERVICE.DefaultModelCommandReceiptService.inspect(
        original,
        this.command(
          original,
          request.httpRequest?.params?.command || request.command,
          body.idempotencyKey,
        ),
      ),
    };
  },
};
