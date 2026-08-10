/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
const UTILS = require('../utils/utils');

/** @module engagementCore/src/service/defaultEngagementLifecycleService @description Enforces optimistic, auditable submission lifecycle transitions. @layer service @owner engagementCore @override Later modules may add transitions through configuration without bypassing expected revision checks. */
module.exports = {
    /** Handles transition within the module-owned contract. */
    transition: function (submission, command, configuration) {
        configuration = configuration || {};
        let current = submission.processingStatus;
        if (configuration.requireExpectedRevision !== false && Number(command.expectedRevision) !== Number(submission.revision || 0)) {
            let error = new Error('revision conflict'); error.code = 'ERR_ENG_00005'; throw error;
        }
        if (!((configuration.transitions || {})[current] || []).includes(command.toStatus)) {
            let error = new Error('invalid lifecycle transition'); error.code = 'ERR_ENG_00004'; throw error;
        }
        let timestamp = UTILS.now(command);
        return {
            submission: Object.assign({}, submission, { processingStatus: command.toStatus, revision: Number(submission.revision || 0) + 1, updatedAt: timestamp }),
            activity: { tenant: submission.tenant, submissionCode: submission.code, fromStatus: current, toStatus: command.toStatus, reasonCode: command.reasonCode, actorId: UTILS.resolvePrincipalId(command), occurredAt: timestamp, correlationId: command.correlationId || submission.correlationId },
            event: { type: 'engagement.submission.statusChanged', tenant: submission.tenant, aggregateCode: submission.code, correlationId: command.correlationId || submission.correlationId }
        };
    }
};
