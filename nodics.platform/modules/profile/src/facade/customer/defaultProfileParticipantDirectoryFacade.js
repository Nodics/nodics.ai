/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
/** @module profile/facade/customer/defaultProfileParticipantDirectoryFacade @description Recipient directory orchestration. @layer facade @owner profile */
module.exports = {
  /** Delegates bounded existing-recipient search. */
  search: function (request) { return SERVICE.DefaultProfileParticipantDirectoryService.search(request); },
  /** Delegates fresh selected-recipient resolution. */
  resolve: function (request) { return SERVICE.DefaultProfileParticipantDirectoryService.resolve(request); },
};
