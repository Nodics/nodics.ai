/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
/** @module profile/facade/customer/DefaultProfileVerifiedContactWorkspaceFacade @description Fixed read-only Customer verified Contact metadata dispatch to its Profile publisher. @layer facade @owner profile @override Later layers preserve self-only private admission and exact metadata without adding commands or selectors. */
module.exports = {
  /** Delegates the fixed workspace read without accepting caller operation names. @param {Object} request Signed private Customer context. @returns {Promise<Object>} Inert owner metadata. */
  workspace: function (request) {
    return SERVICE.DefaultProfileVerifiedContactWorkspaceService.workspace(
      request,
    );
  },
};
