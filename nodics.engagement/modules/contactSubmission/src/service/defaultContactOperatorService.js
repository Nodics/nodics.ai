/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module contactSubmission/src/service/defaultContactOperatorService @description Maps governed operator actions to lifecycle transitions and persistence. @layer service @owner contactSubmission @override Later modules may add actions without bypassing revision or tenant checks. */
module.exports = {
    targets: { REQUEST_INFORMATION: 'WAITING_CUSTOMER', ATTEMPT_CONTACT: 'IN_PROGRESS', RESOLVE: 'RESOLVED', CLOSE: 'CLOSED', REOPEN: 'IN_PROGRESS', MARK_DUPLICATE: 'DUPLICATE', MARK_SPAM: 'SPAM' },
    /** Handles act within the module-owned contract. */
    act: async function (request) { let repository = SERVICE.DefaultContactRequestRepositoryService; let contact = await repository.get(request); let target = this.targets[request.actionCode]; if (!target) { let error = new Error('unknown action'); error.code = 'ERR_CONTACT_00000'; throw error; } let expectedRevision = request.payload.expectedRevision === undefined && request.payload.model ? request.payload.model.revision : request.payload.expectedRevision; let changed = SERVICE.DefaultContactLifecycleService.transition(contact, { toStatus: target, expectedRevision: expectedRevision, correlationId: request.correlationId, authData: request.authData }, (CONFIG.get('contactSubmission') || {}).lifecycle); return repository.save(request, changed); }
};
