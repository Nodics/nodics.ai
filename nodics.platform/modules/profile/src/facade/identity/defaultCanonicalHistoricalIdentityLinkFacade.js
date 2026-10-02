/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
/** @module profile/facade/identity/DefaultCanonicalHistoricalIdentityLinkFacade @description Exposes fixed proof-backed link commands through the existing Profile ownership boundary. @layer facade @owner profile @override Later layers may narrow operator policy; retain fresh dual proof, private entry and irreversible retirement fences. */
module.exports = {
  /** Dispatches only fixed controller-selected operations, never a client-selected service or method. @param {Object} request Protected human operator envelope. @param {string} operation Fixed PREPARE, COMMIT or INSPECT. @returns {Promise<Object>} Redacted link evidence. */
  invoke: function (request, operation) {
    const owner = SERVICE.DefaultCanonicalHistoricalIdentityLinkService;
    if (operation === "PREPARE") return owner.prepare(request);
    if (operation === "COMMIT") return owner.commit(request);
    if (operation === "INSPECT") return owner.inspect(request);
    throw new CLASSES.NodicsError("ERR_PROFILE_MEMBERSHIP_UNAVAILABLE");
  },
};
