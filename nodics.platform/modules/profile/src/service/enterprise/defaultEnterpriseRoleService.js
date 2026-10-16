/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module profile/service/enterprise/DefaultEnterpriseRoleService
 * @description Extends the generated enterprise-role owner with insert-only reference import.
 * @layer service @owner profile
 * @override Preserve generated authorisation, governance and existing records.
 */
module.exports = {
  /** Seeds missing responsibilities without overwriting Axis decisions. */
  ensureReferenceAll: function (request) {
    return SERVICE.DefaultIdentityCatalogueService.ensureReferenceAll(this, request);
  },
};
