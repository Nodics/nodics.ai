/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module database/service/schema/DefaultSchemaCommandReceiptService
 * @description Adds opt-in native receipts around generated single-record create, update, and delete paths without adding a second mutation dispatcher.
 * @layer service @owner nDatabase
 * @override Preserve current effective schema access, Staged authoring, private owner journals and the original generated operation.
 */
module.exports = {
  /** Resolves the shared private receipt protocol. @returns {Object} Owner. */
  receipts: function () {
    return SERVICE.DefaultModelCommandReceiptService;
  },
  /** Rechecks current schema mutation authority and the configured write grant. @param {Object} request Trusted employee. @param {string} schemaName Compiled schema. @param {string} operation Fixed generated operation. @returns {Object} Native schema binding. */
  authorize: function (request, schemaName, operation = "create") {
    const utility = SERVICE.DefaultSchemaUtilityService;
    const { moduleName } = utility.resolveSchemaModule(request.moduleName);
    const schema = NODICS.getModule(moduleName)?.rawSchema?.[schemaName];
    const descriptor = utility.resolveDescriptor(
      request,
      moduleName,
      schemaName,
    );
    const security = SERVICE.DefaultSecuredRequestPipelineService;
    const permission = CONFIG.get("schemaApi")?.writePermission;
    if (
      !schema?.commandReceipt?.journalSchema ||
      !["create", "update", "delete"].includes(operation) ||
      !descriptor?.operations?.includes(operation) ||
      (operation === "create" && descriptor.form?.createOperation) ||
      typeof permission !== "string" ||
      !security?.isPermissionGranted(
        permission,
        security.getGrantedPermissions(request),
        security.getRouteActionAuthorizationConfig(),
      )
    )
      this.receipts().fail();
    SERVICE.DefaultSchemaAuthoringPolicyService.assertMutationAllowed(
      moduleName,
      schemaName,
      operation,
    );
    return { moduleName, journalSchema: schema.commandReceipt.journalSchema };
  },
  /** Resolves one exact affected-record acknowledgement from generated persistence shapes. @param {Object} result Native result. @returns {number} Affected count. */
  affected: function (result) {
    for (const key of [
      "matchedCount",
      "modifiedCount",
      "deletedCount",
      "nModified",
      "n",
    ])
      if (Number.isSafeInteger(result?.[key])) return result[key];
    return Number.NaN;
  },
  /** Builds a fixed native receipt declaration from compiled schema metadata. @param {Object} request Original request. @param {string} schemaName Compiled schema. @param {string} operation Fixed operation. @param {Object} input Original normalized input. @param {string} key Original key. @returns {Object} Private declaration. */
  command: function (request, schemaName, operation, input, key) {
    const selected = this.authorize(request, schemaName, operation);
    return {
      ...selected,
      operation: schemaName + "." + operation,
      input,
      key,
      authorize: () => {
        const fresh = this.authorize(request, schemaName, operation);
        if (JSON.stringify(fresh) !== JSON.stringify(selected))
          this.receipts().fail();
      },
      resultIdentity: (response) => {
        const row = this.receipts().result(response);
        if (operation === "create") {
          if (
            Array.isArray(row) ||
            typeof row.code !== "string" ||
            row.code !== request.model?.code
          )
            this.receipts().fail();
          return row.code;
        }
        if (this.affected(row) !== 1) this.receipts().fail();
        return operation + ":" + this.receipts().digest(input.query);
      },
    };
  },
  /** Applies owner-declared create-only intent independently of optional recording, then wraps opted-in single-record receipts. @param {Object} request Normalized original mutation. @param {string} schemaName Compiled schema. @param {Function} execute Existing generated facade. @param {string} operation Fixed operation. @param {Object} input Normalized mutation input. @returns {Promise<Object>} Native response. */
  execute: async function (
    request,
    schemaName,
    execute,
    operation = "create",
    input = request.httpRequest.body,
  ) {
    const owner = SERVICE.DefaultSchemaUtilityService.resolveSchemaModule(
      request.moduleName,
    );
    const schema = NODICS.getModule(owner.moduleName)?.rawSchema?.[schemaName];
    if (operation === "create" && schema?.commandReceipt?.insertOnly === true)
      request.options = { ...request.options, insertOnly: true };
    if (!schema?.commandReceipt || !this.receipts().enabled(owner.moduleName))
      return execute();
    const command = this.command(
      request,
      schemaName,
      operation,
      structuredClone(input),
      request.idempotencyKey,
    );
    if (operation === "create") request.model = structuredClone(request.model);
    return this.receipts().execute(request, command, execute);
  },
  /** Reads one exact original native command without normalizing it into a new mutation. @param {Object} request Trusted request. @param {string} schemaName Compiled schema. @returns {Promise<Object>} Native receipt envelope. */
  inspect: async function (request, schemaName) {
    const body = request.httpRequest?.body;
    const legacy =
      body && Object.keys(body).sort().join() === "idempotencyKey,model";
    if (
      !body ||
      (!legacy &&
        Object.keys(body).sort().join() !== "idempotencyKey,input,operation") ||
      !(legacy ? body.model : body.input) ||
      typeof (legacy ? body.model : body.input) !== "object" ||
      Array.isArray(legacy ? body.model : body.input)
    )
      this.receipts().fail();
    const operation = legacy ? "create" : body.operation;
    return {
      code: "SUC_DBS_00000",
      data: await this.receipts().inspect(
        request,
        this.command(
          request,
          schemaName,
          operation,
          legacy ? body.model : body.input,
          body.idempotencyKey,
        ),
      ),
    };
  },
};
