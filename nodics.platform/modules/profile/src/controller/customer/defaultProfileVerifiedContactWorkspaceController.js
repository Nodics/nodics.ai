/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
/** @module profile/controller/customer/DefaultProfileVerifiedContactWorkspaceController @description Publishes private self Customer Contact task metadata with no-store and fixed redacted errors. @layer controller @owner profile @override Later layers preserve exact sensitive capture, fixed GET dispatch and content-free projection. */
module.exports = {
  /** Maps one fixed private workspace read, never browser owner/identity selectors. @param {Object} request Protected signed request. @param {Function} [callback] Framework callback. @returns {Promise<Object>|void} Safe metadata envelope. */
  workspace: function (request, callback) {
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    const promise = Promise.resolve()
      .then(async () => {
        SERVICE.DefaultLoggerService.assertSensitiveRequest(request);
        for (const field of ["body", "query", "params"]) {
          if (request.httpRequest?.[field] !== undefined)
            request[field] = request.httpRequest[field];
          else if (request[field] === undefined) request[field] = {};
        }
        const owner = SERVICE.DefaultProfileVerifiedContactWorkspaceService;
        owner.emptyInput(request.body);
        owner.emptyInput(request.query);
        owner.emptyInput(request.params);
        const result =
          await FACADE.DefaultProfileVerifiedContactWorkspaceFacade.workspace(
            request,
          );
        return {
          code: "SUC_PRFL_00000",
          data: SERVICE.DefaultProfileVerifiedContactWorkspaceService.publicWorkspace(
            result,
          ),
        };
      })
      .catch(() => {
        throw new CLASSES.NodicsError("ERR_AUTH_00003");
      });
    return callback
      ? promise.then((result) => callback(null, result)).catch(callback)
      : promise;
  },
};
