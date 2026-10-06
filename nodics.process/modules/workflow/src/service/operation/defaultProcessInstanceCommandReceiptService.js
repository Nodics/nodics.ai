/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";

/**
 * @module workflow/service/operation/DefaultProcessInstanceCommandReceiptService
 * @description Binds four fixed runtime-instance commands to Workflow's private durable receipt protocol so uncertain starts, cancellations, retries, and compensations are inspected rather than replayed.
 * @layer service
 * @owner workflow
 * @override Preserve native lifecycle ownership, exact inputs, original authority and result, and no automatic retry.
 */
module.exports = {
  /** Resolves only fixed instance commands. @param {string} kind Command suffix. @returns {Object} Native method and permission. */
  operation: function (kind) {
    const commands = {
      start: { method: "startInstance", permission: "process.instance.start" },
      cancel: {
        method: "cancelInstance",
        permission: "process.instance.cancel",
      },
      retry: { method: "retryInstance", permission: "process.instance.retry" },
      compensate: {
        method: "compensateInstance",
        permission: "process.instance.compensate",
      },
    };
    if (!Object.hasOwn(commands, kind))
      SERVICE.DefaultModelCommandReceiptService.fail();
    return commands[kind];
  },

  /** Rechecks native permission at each receipt boundary. @param {Object} request Original employee context. @param {string} kind Fixed command. @returns {void} */
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

  /** Declares exact input and validates the original native acknowledgement. @param {Object} request Native context. @param {string} kind Command suffix. @param {string} key Original key. @returns {Object} Receipt declaration. */
  command: function (request, kind, key) {
    this.operation(kind);
    const lifecycle = SERVICE.DefaultProcessRuntimeLifecycleService;
    const protocol = SERVICE.DefaultModelCommandReceiptService;
    const body = structuredClone(lifecycle.bodyOf(request));
    const instanceCode = lifecycle.assertCode(
      request.instanceCode || body.instanceCode,
    );
    if (body.instanceCode !== undefined && body.instanceCode !== instanceCode)
      protocol.fail();
    const input = { instanceCode, body };
    return {
      moduleName: "workflow",
      journalSchema: "processCommandReceipt",
      operation: "instance." + kind,
      input,
      key,
      authorize: () => this.authorize(request, kind),
      resultIdentity: (response) => {
        const data = protocol.result({ ...response, result: response?.data });
        if (kind === "start") {
          const instance = protocol.result({
            code: response.code,
            result: data.instance,
          });
          if (
            response.code !== "SUC_PROCESS_00007" ||
            instance.code !== instanceCode ||
            instance.startCompleted !== true ||
            !["RUNNING", "WAITING", "COMPLETED"].includes(instance.status)
          )
            protocol.fail();
        } else if (kind === "cancel") {
          if (
            response.code !== "SUC_PROCESS_00009" ||
            data.code !== instanceCode ||
            data.status !== "CANCELLED"
          )
            protocol.fail();
        } else if (kind === "retry") {
          const instance = protocol.result({
            code: response.code,
            result: data.instance,
          });
          const incident = protocol.result({
            code: response.code,
            result: data.incident,
          });
          if (
            response.code !== "SUC_PROCESS_00012" ||
            instance.code !== instanceCode ||
            incident.status !== "RESOLVED"
          )
            protocol.fail();
        } else if (
          response.code !== "SUC_PROCESS_00013" ||
          data.instanceCode !== instanceCode ||
          data.compensationStatus !== "COMPLETED"
        )
          protocol.fail();
        return instanceCode;
      },
    };
  },

  /** Executes once under durable receipts when keyed; unkeyed native calls preserve existing behavior. @param {Object} request Native context. @param {string} kind Fixed command. @returns {Promise<Object>} Owner response. */
  execute: async function (request, kind) {
    const declaration = this.operation(kind);
    const headers = request.httpRequest?.headers || request.headers || {};
    const key =
      request.idempotencyKey !== undefined
        ? request.idempotencyKey
        : Object.hasOwn(headers, "idempotency-key")
          ? headers["idempotency-key"]
          : headers["Idempotency-Key"];
    if (key === undefined)
      return SERVICE.DefaultProcessRuntimeLifecycleService[declaration.method](
        request,
      );
    const command = this.command(request, kind, key);
    return SERVICE.DefaultModelCommandReceiptService.execute(
      request,
      command,
      () =>
        SERVICE.DefaultProcessRuntimeLifecycleService[declaration.method]({
          ...request,
          instanceCode: command.input.instanceCode,
          runtimeOperation: structuredClone(command.input.body),
        }),
    );
  },

  /** Inspects the exact original receipt and never repeats runtime effects. @param {Object} request Secured inspection request. @returns {Promise<Object>} Receipt envelope. */
  inspect: async function (request) {
    const body =
      request.httpRequest?.body || request.runtimeOperation || request.body;
    if (
      !body ||
      Object.keys(body).sort().join() !== "command,idempotencyKey" ||
      !body.command ||
      typeof body.command !== "object" ||
      Array.isArray(body.command)
    ) {
      SERVICE.DefaultModelCommandReceiptService.fail();
    }
    const original = { ...request, runtimeOperation: body.command };
    return {
      code: "SUC_PROCESS_00009",
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
