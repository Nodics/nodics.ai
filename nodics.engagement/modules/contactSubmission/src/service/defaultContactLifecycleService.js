/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
const UTILS = require('../utils/utils');
/** @module contactSubmission/src/service/defaultContactLifecycleService @description Enforces contact actions, visibility, and optimistic lifecycle transitions. @layer service @owner contactSubmission @override Later modules may add configured transitions without bypassing revisions. */
module.exports = {
    /** Handles transition within the module-owned contract. */
    transition: function (contact, command, configuration) {
        if (Number(command.expectedRevision) !== Number(contact.revision || 0)) { let error = new Error('revision conflict'); error.code = 'ERR_CONTACT_00003'; throw error; }
        if (!((configuration.transitions || {})[contact.status] || []).includes(command.toStatus)) { let error = new Error('invalid transition'); error.code = 'ERR_CONTACT_00002'; throw error; }
        let now = UTILS.now(command); let changed = Object.assign({}, contact, { status: command.toStatus, revision: Number(contact.revision || 0) + 1, updatedAt: now });
        if (command.toStatus === 'RESOLVED') changed.resolvedAt = now; if (command.toStatus === 'CLOSED') changed.closedAt = now;
        return changed;
    },
    /** Handles visible correspondence within the module-owned contract. */
    visibleCorrespondence: function (records, customerView) { return (records || []).filter(record => !customerView || record.visibility === 'CUSTOMER'); }
};
