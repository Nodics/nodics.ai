/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const UTILS = require('../../../wasteCore/src/utils/utils');

/** @module wasteSubmission/src/service/defaultWasteSubmissionLifecycleService @description Applies generic Waste submission lifecycle transitions without owning receipt, impact, or reward state. @layer service @owner wasteSubmission @override Partner modules may add policy checks while preserving separate lifecycle ownership. */
module.exports = {
    /** Initializes this service. */
    init: function () { return Promise.resolve(true); },

    /** Completes this service startup. */
    postInit: function () { return Promise.resolve(true); },

    /** Throws a Nodics-compatible error when available. */
    fail: function (code, message) {
        let error = typeof CLASSES !== 'undefined' && CLASSES.NodicsError ? new CLASSES.NodicsError(code, message) : new Error(message);
        error.code = code;
        throw error;
    },

    /** Returns allowed generic submission transitions. */
    transitions: function () {
        return {
            DRAFT: ['MEDIA_STAGED', 'METADATA_SUGGESTED', 'AWAITING_SUBMITTER_CONFIRMATION', 'SUBMITTED', 'CANCELLED'],
            MEDIA_STAGED: ['METADATA_SUGGESTED', 'AWAITING_SUBMITTER_CONFIRMATION', 'SUBMITTED', 'CANCELLED'],
            METADATA_SUGGESTED: ['AWAITING_SUBMITTER_CONFIRMATION', 'SUBMITTED', 'CANCELLED'],
            AWAITING_SUBMITTER_CONFIRMATION: ['SUBMITTED', 'CANCELLED'],
            SUBMITTED: ['UNDER_REVIEW', 'CHANGES_REQUESTED', 'APPROVED', 'REJECTED', 'CANCELLED'],
            UNDER_REVIEW: ['CHANGES_REQUESTED', 'APPROVED', 'REJECTED', 'CANCELLED'],
            CHANGES_REQUESTED: ['SUBMITTED', 'CANCELLED'],
            APPROVED: ['ARCHIVED'],
            REJECTED: ['ARCHIVED'],
            CANCELLED: ['ARCHIVED'],
            ARCHIVED: []
        };
    },

    /** Returns true when a target status belongs to the submission lifecycle. */
    isSubmissionStatus: function (status) {
        return Object.prototype.hasOwnProperty.call(this.transitions(), status);
    },

    /** Applies a lifecycle transition and preserves receipt and impact as references only. */
    transition: function (submission, targetStatus, context) {
        submission = Object.assign({}, submission || {});
        context = context || {};
        let current = submission.submissionStatus || 'DRAFT';
        targetStatus = UTILS.normalizeCode(targetStatus);
        if (!this.isSubmissionStatus(targetStatus)) this.fail('ERR_WASTE_SUBMISSION_STATUS_INVALID', 'target status is not a submission lifecycle status');
        if (this.transitions()[current].indexOf(targetStatus) < 0 && current !== targetStatus) {
            this.fail('ERR_WASTE_SUBMISSION_TRANSITION_INVALID', current + ' cannot transition to ' + targetStatus);
        }
        submission.submissionStatus = targetStatus;
        submission.statusUpdatedAt = context.now || new Date();
        submission.correlationId = context.correlationId || submission.correlationId;
        submission.idempotencyKey = context.idempotencyKey || submission.idempotencyKey;
        submission.revision = Number(submission.revision || 0) + (current === targetStatus ? 0 : 1);
        return UTILS.persistenceModel(submission);
    },

    /** Confirms advisory metadata as submitter-confirmed facts without making provider output authoritative. */
    confirmFacts: function (submission, confirmedFacts, context) {
        submission = this.transition(submission, 'SUBMITTED', context);
        submission.confirmedFacts = Object.assign({}, confirmedFacts || {});
        return submission;
    }
};
