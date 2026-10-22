/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
/** @module profile/facade/identity/defaultProfilePlatformAdministratorEvidenceFacade @description Delegates current platform authority evidence to Profile. @layer facade @owner profile */
module.exports = {
  /** Performs no authority transformation or synthetic service authentication. */
  evidence: function (request) { return SERVICE.DefaultProfilePlatformAdministratorEvidenceService.evidence(request); },
};
