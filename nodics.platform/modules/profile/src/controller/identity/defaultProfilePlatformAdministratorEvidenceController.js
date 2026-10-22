/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
/** @module profile/controller/identity/defaultProfilePlatformAdministratorEvidenceController @description Noncacheable native administrator evidence transport. @layer controller @owner profile */
module.exports = {
  /** Retains the original authenticated request and projects the existing Profile success envelope. */
  evidence: function (request, callback) {
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    const work = Promise.resolve().then(() => FACADE.DefaultProfilePlatformAdministratorEvidenceFacade.evidence(request))
      .then(data => ({ code: "SUC_PRFL_00000", data }));
    return callback ? work.then(value => callback(null, value), error => callback(error)) : work;
  },
};
