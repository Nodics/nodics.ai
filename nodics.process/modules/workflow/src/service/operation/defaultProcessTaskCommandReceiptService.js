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
 * @module workflow/service/operation/DefaultProcessTaskCommandReceiptService
 * @description Wraps fixed human task commands in the existing private native receipt protocol. Records original acknowledgements, never replays a decision or infers completion from current task state.
 * @layer service @owner workflow
 * @override Later layers may tighten admission; preserve native permissions, original actor/scope/input/key, lifecycle delegation and fail-closed result validation.
 */
module.exports = {
  /** Resolves only the four native task commands. @param {string} kind Operation suffix. @returns {Object} Native declaration; throws for unsupported commands. */
  operation: function (kind) {
    const definitions = {
      claim: { method: "claimTask", status: "CLAIMED" },
      assign: { method: "assignTask" },
      complete: { method: "completeTask", status: "COMPLETED" },
      cancel: { method: "cancelTask", status: "CANCELLED" },
    };
    if (!Object.hasOwn(definitions, kind))
      SERVICE.DefaultModelCommandReceiptService.fail();
    return definitions[kind];
  },
  /** Rechecks independent native permission on every receipt boundary. @param {Object} request Employee context. @param {string} kind Fixed command. @returns {void} Throws on denial. */
  authorize: function (request, kind) {
    this.operation(kind);
    const security = SERVICE.DefaultSecuredRequestPipelineService;
    if (
      !security?.isPermissionGranted(
        "process.task." + kind,
        security.getGrantedPermissions(request),
        security.getRouteActionAuthorizationConfig(),
      )
    )
      SERVICE.DefaultModelCommandReceiptService.fail();
  },
  /** Binds exact native inputs and validates the original lifecycle acknowledgement. @param {Object} request Employee request. @param {string} kind Fixed command. @param {string} key Original idempotency key. @returns {Object} Shared protocol declaration. */
  command: function (request, kind, key) {
    const declaration = this.operation(kind);
    const lifecycle = SERVICE.DefaultProcessRuntimeLifecycleService;
    const protocol = SERVICE.DefaultModelCommandReceiptService;
    const input = {
      taskCode: lifecycle.assertCode(request.taskCode),
      body: structuredClone(lifecycle.bodyOf(request)),
    };
    return {
      moduleName: "workflow",
      journalSchema: "processCommandReceipt",
      operation: "task." + kind,
      input,
      key,
      authorize: () => this.authorize(request, kind),
      resultIdentity: (response) => {
        protocol.result({ ...response, result: response?.data });
        const task =
          kind === "complete" ? response?.data?.task : response?.data;
        protocol.result({ code: response?.code, result: task });
        if (
          response?.code !== "SUC_PROCESS_00008" ||
          response.error ||
          response.success === false ||
          (response.errors !== undefined &&
            (!Array.isArray(response.errors) || response.errors.length)) ||
          !task ||
          task.code !== input.taskCode ||
          (declaration.status && task.status !== declaration.status) ||
          (kind === "assign" &&
            (!["OPEN", "CLAIMED", "ESCALATED"].includes(task.status) ||
              task.assignee !== input.body.assignee)) ||
          (kind === "claim" &&
            task.assignee !==
              (input.body.assignee || lifecycle.getActor(request))) ||
          (kind === "complete" &&
            (task.completedBy !== lifecycle.getActor(request) ||
              !isDeepStrictEqual(task.decision, input.body.decision || {}))) ||
          (kind === "cancel" &&
            (task.cancelledBy !== lifecycle.getActor(request) ||
              task.cancellationReason !== input.body.reason))
        )
          protocol.fail();
        return task.code;
      },
    };
  },
  /** Delegates unchanged native behavior without a key; a keyed command requires explicitly enabled durable receipts before any mutation. @param {Object} request Native context. @param {string} kind Fixed command. @returns {Promise<Object>} Native result or uncertainty error; never retries. */
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
          runtimeOperation: structuredClone(command.input.body),
        }),
    );
  },
  /** Reads only original private evidence under current employee authority, including when new recording is disabled. @param {Object} request Secured HTTP context with task/command params and original body/key. @returns {Promise<Object>} Shared receipt envelope; no task mutation. */
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
      code: "SUC_PROCESS_00008",
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
