/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
/** @module profile/facade/identity/DefaultProfileSessionContextFacade @description Keeps runtime context validation behind the Profile capability facade. @layer facade @owner profile @override Later layers may narrow runtime admission without bypassing signed live owner proof. */
module.exports = {
  /** Delegates only the fixed read-only signed-token owner operation. @param {Object} request Scoped runtime request. @returns {Promise<Object>} Public live context proof. */
  validate: function (request) {
    return SERVICE.DefaultProfileSessionContextValidationService.validateRemote(
      request,
    );
  },
};
