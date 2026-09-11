/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module eWaste/service/defaultEWasteRequestService @description Maps trusted HTTP identity and revision/idempotency context for e-waste and project adapters; caller payload cannot select the service. @layer service @owner eWaste */
module.exports = {
  /** Preserves trusted identity and removes caller attempts to supply owner or runtime context. */
  invoke: function (
    operation,
    request,
    callback,
    serviceName = "DefaultEWasteExperienceService",
  ) {
    const http = request.httpRequest || {},
      body = http.body || {},
      headers = http.headers || {};
    const input = {
      tenant:
        (request.authData && request.authData.tenant) ||
        request.tenant ||
        CONFIG.get("defaultTenant"),
      authData: request.authData,
      code: (http.params || {}).code,
      payload: body,
      query: http.query || {},
      expectedRevision: body.expectedRevision,
      confirmed: body.confirmed === true,
      idempotencyKey: headers["idempotency-key"] || body.idempotencyKey,
      resourceType:
        operation === "reviewPhoto"
          ? "review"
          : operation === "assetPhoto"
            ? "asset"
            : "submission",
      authorization: headers.authorization,
      correlationId: headers["x-correlation-id"],
      isCancelled: () => Boolean(http.aborted || http.res?.destroyed),
    };
    const promise = Promise.resolve()
      .then(() => SERVICE.DefaultEWasteExperienceService.resolveCustomer(input))
      .then(async (context) => {
        const data = await SERVICE[serviceName][
          ["reviewPhoto", "assetPhoto", "submissionPhoto"].includes(operation)
            ? "evidencePhoto"
            : operation
        ](context);
        if (['reviewPhoto', 'assetPhoto', 'submissionPhoto', 'experience', 'wallet', 'accountItems', 'accountItem'].includes(operation)) return data;
        return SERVICE.DefaultWasteItemDescriptorService.projectResponse(data, context);
      })
      .then((data) => ({ data: data }));
    if (!callback) return promise;
    promise.then((result) => callback(null, result)).catch(callback);
  },
};
