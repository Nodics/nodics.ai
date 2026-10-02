/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
/** @module profile/facade/enterprise/DefaultTenantNamespaceBindingFacade @description Verifies actual retained bearer proof for local and HTTP namespace admission before Profile persistence. @layer facade @owner profile @override Preserve verified-token, deployment-grant and protected Tenant-owner boundaries. */
module.exports = {
  /** Fixed proof-bound inventory; no browser selectors or generic query forwarding. */
  inventory: function (request) {
    return SERVICE.DefaultEnterpriseTenantProvisioningService.inventoryWithProof(request);
  },
  /** Uses canonical JWT/revocation/stamp validation; caller authData alone is never admission. */
  bind: async function (request) {
    return SERVICE.DefaultEnterpriseTenantProvisioningService.bindWithProof(request);
  }
};
