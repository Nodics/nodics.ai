/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";

/**
 * @module workflow/service/definition/DefaultProcessDefinitionCommandReceiptService
 * @description Binds six fixed process-definition lifecycle commands to Workflow's private durable receipt protocol without replaying uncertain definition writes.
 * @layer service
 * @owner workflow
 * @override Preserve native permissions, exact original input, owner lifecycle delegation, result identity validation, and inspection-only recovery.
 */
module.exports = {
  /** Resolves a fixed definition command. @param {string} kind Command suffix. @returns {Object} Owner method and permission. */
  operation: function (kind) {
    const commands = {
      create: {
        method: "createDefinition",
        permission: "process.definition.create",
      },
      update: {
        method: "updateDraft",
        permission: "process.definition.update",
      },
      prepare: {
        method: "prepareNextDraft",
        permission: "process.definition.update",
      },
      validate: {
        method: "validateDraft",
        permission: "process.definition.validate",
      },
      publish: {
        method: "publishDraft",
        permission: "process.definition.publish",
      },
      delete: {
        method: "deleteOrArchive",
        permission: "process.definition.delete",
      },
    };
    if (!Object.hasOwn(commands, kind))
      SERVICE.DefaultModelCommandReceiptService.fail();
    return commands[kind];
  },

  /** Rechecks native authorization at every receipt boundary. @param {Object} request Original employee context. @param {string} kind Fixed command. @returns {void} */
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

  /** Declares exact command input and validates the original owner result. @param {Object} request Native context. @param {string} kind Command suffix. @param {string} key Original key. @returns {Object} Receipt declaration. */
  command: function (request, kind, key) {
    const declaration = this.operation(kind);
    const lifecycle = SERVICE.DefaultProcessDefinitionLifecycleService;
    const protocol = SERVICE.DefaultModelCommandReceiptService;
    const body = structuredClone(lifecycle.modelOf(request));
    const definitionCode = lifecycle.assertCode(
      kind === "create"
        ? body.code
        : request.definitionCode || body.definitionCode,
    );
    if (kind !== "create" && Object.hasOwn(body, "definitionCode"))
      delete body.definitionCode;
    const input = { definitionCode, body };
    return {
      moduleName: "workflow",
      journalSchema: "processCommandReceipt",
      operation: "definition." + kind,
      input,
      key,
      authorize: () => this.authorize(request, kind),
      resultIdentity: (response) => {
        const data = protocol.result({ ...response, result: response?.data });
        const code =
          data?.code || (kind === "validate" ? definitionCode : undefined);
        if (
          !/^SUC_PROCESS_/.test(response?.code || "") ||
          code !== definitionCode
        )
          protocol.fail();
        if (
          kind === "create" &&
          (data.status !== "DRAFT" ||
            data.currentVersion !== 0 ||
            data.draftRevision !== 1)
        )
          protocol.fail();
        if (
          kind === "update" &&
          (!Number.isSafeInteger(data.draftRevision) || data.draftRevision < 2)
        )
          protocol.fail();
        if (kind === "prepare" && data.status !== "DRAFT") protocol.fail();
        if (kind === "validate" && data.valid !== true) protocol.fail();
        if (
          kind === "publish" &&
          (!Number.isSafeInteger(data.version) ||
            data.version < 1 ||
            !/^[a-f0-9]{64}$/.test(data.checksum || ""))
        )
          protocol.fail();
        if (
          kind === "delete" &&
          !["DELETED_DRAFT", "DRAFT_DISCARDED", "ARCHIVED"].includes(
            data.status,
          )
        )
          protocol.fail();
        return definitionCode;
      },
      method: declaration.method,
    };
  },

  /** Executes once under the shared durable protocol when keyed; unkeyed native calls retain existing behavior. @param {Object} request Native context. @param {string} kind Fixed command. @returns {Promise<Object>} Original owner response. */
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
      return SERVICE.DefaultProcessDefinitionLifecycleService[
        declaration.method
      ](request);
    const command = this.command(request, kind, key);
    return SERVICE.DefaultModelCommandReceiptService.execute(
      request,
      command,
      () =>
        SERVICE.DefaultProcessDefinitionLifecycleService[declaration.method]({
          ...request,
          definitionCode: command.input.definitionCode,
          processDefinition: structuredClone(command.input.body),
        }),
    );
  },

  /** Reads only the original private command result and never repeats a definition transition. @param {Object} request Secured inspection request. @returns {Promise<Object>} Receipt envelope. */
  inspect: async function (request) {
    const body =
      request.httpRequest?.body || request.processDefinition || request.body;
    if (
      !body ||
      Object.keys(body).sort().join() !== "command,idempotencyKey" ||
      !body.command ||
      typeof body.command !== "object" ||
      Array.isArray(body.command)
    ) {
      SERVICE.DefaultModelCommandReceiptService.fail();
    }
    const original = {
      ...request,
      definitionCode: request.definitionCode,
      processDefinition: body.command,
    };
    return {
      code: "SUC_PROCESS_00000",
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
