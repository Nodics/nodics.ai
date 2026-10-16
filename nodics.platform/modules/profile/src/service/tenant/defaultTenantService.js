/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module profile/service/tenant/DefaultTenantService
 * @description Preserves existing tenant records during governed bootstrap imports.
 * @layer service
 * @owner profile
 * @override Later layers retain private Init admission and normal generated insert guards.
 */
module.exports = {
  /** Creates missing bootstrap records without updating retained data or lifecycle state. */
  ensureBootstrapAll: function (request) {
    return SERVICE.DefaultMandatoryIdentityBootstrapService.ensureBootstrapAll(this, "tenant", request);
  },
};
