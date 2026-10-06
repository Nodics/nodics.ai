/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module copilotConversation/config/properties
 * @description Defines generated configurable defaults for copilotConversation.
 * @layer config
 * @owner generated
 * @override Project, environment, server, node, tenant, or customer layers may override these defaults through Nodics configuration layering.
 */
module.exports = {
    copilot: {
        conversation: {
            activity: {
                presentation: {
                    updatedFrom: 'Updated from',
                    updatedTo: 'Updated until',
                    title: 'Copilot Activity',
                    principal: 'Employee identifier',
                    search: 'Apply filter',
                    refresh: 'Refresh activity',
                    empty: 'No activity in this page',
                    conversation: 'Conversation',
                    employee: 'Employee',
                    state: 'State',
                    updated: 'Updated',
                    previous: 'Previous page',
                    next: 'Next page',
                    page: 'Page',
                    metadataOnly:
                        'Activity metadata only. Conversation content is not included.',
                },
            },
            storage: 'GENERATED_SERVICE',
            recordedSearch: {
                enabled: false,
                maximumWindowDays: 31,
                minimumTermLength: 3,
                presentation: {
                    title: 'Search recorded content',
                    term: 'Exact text (case-sensitive)',
                    from: 'Recorded from',
                    to: 'Recorded until',
                    purpose: 'Search purpose',
                    search: 'Search',
                    close: 'Close',
                    empty: 'No matching recorded messages in this page',
                    coverage:
                        'Only enterprise-bound recorded messages are searchable. Legacy unbound messages and unrecorded turns are excluded.',
                    failure:
                        'Search unavailable. No recorded content is displayed.',
                    audit: 'Access receipt',
                    previous: 'Previous page',
                    next: 'Next page',
                    page: 'Page',
                },
            },
            transcriptInspection: {
                enabled: false,
                purposes: [
                    {
                        code: 'CUSTOMER_SUPPORT',
                        label: 'Customer support investigation',
                    },
                    { code: 'SECURITY_REVIEW', label: 'Security review' },
                    { code: 'QUALITY_REVIEW', label: 'Quality review' },
                ],
                presentation: {
                    title: 'Recorded conversation',
                    open: 'Inspect recorded conversation',
                    purpose: 'Inspection purpose',
                    inspect: 'Inspect',
                    close: 'Close',
                    previous: 'Previous page',
                    next: 'Next page',
                    page: 'Page',
                    unrecorded: 'Content not recorded',
                    empty: 'No recorded messages in this page',
                    audit: 'Access receipt',
                    user: 'Employee',
                    assistant: 'Copilot',
                    failure: 'Inspection unavailable. No content is displayed.',
                },
            },
            allowVolatileLocalStorage: false,
            recording: { enabled: true, version: '1' },
            replayEventLimit: 500,
            leaseMs: 30000,
            retentionDays: 90,
            writerFence: { enabled: false },
            auditRetention: {
                deletionEnabled: false,
                maximumBatch: 25,
                enterprisePolicies: [],
                presentation: {
                    title: 'Audit retention', kind: 'Audit category', TRANSCRIPT_ACCESS: 'Transcript access receipts', ACTION: 'Completed action audit',
                    reason: 'Business reason', review: 'Review audit deletion', confirm: 'I confirm this irreversible audit deletion', execute: 'Delete reviewed batch',
                    inspect: 'Inspect original operation', stop: 'Stop pending operation', release: 'Release retained policy fence', operationCode: 'Operation reference',
                    PREPARED: 'Prepared; deletion not confirmed', COMPLETED: 'Reviewed audit batch deleted', STOPPED: 'Stopped; no deletion committed',
                    OUTCOME_UNKNOWN: 'Outcome unconfirmed. Inspect the original operation.', failed: 'Audit retention is unavailable. No deletion was retried.',
                    count: 'Eligible records in this batch', cutoff: 'Retention cutoff', reference: 'Review reference',
                },
            },
            lifecycle: {
                enterprisePolicies: [],
                deletionEnabled: false,
                maximumBatch: 100,
                executionPresentation: {
                    open: 'Retention operation',
                    title: 'Conversation retention',
                    reason: 'Business reason',
                    review: 'Review deletion',
                    reviewResume: 'Review remaining deletion',
                    resume: 'Confirm resumption',
                    RESUMING: 'Resumption reviewed; remaining content stays frozen',
                    reviewClosure: 'Review conversation closure',
                    closeConversation: 'Confirm closure',
                    inspectClosure: 'Inspect original closure',
                    closureNotice: 'Closing prevents further conversation writes and keeps its content. It does not cancel provider calls or business operations already in progress.',
                    closureRecorded: 'Conversation closure recorded',
                    inspect: 'Inspect original operation',
                    begin: 'Confirm retention operation',
                    advance: 'Delete next batch',
                    stop: 'Stop and preserve remaining content',
                    confirm: 'I confirm this irreversible operation',
                    notice: 'Conversation content only. Audit and accounting evidence are retained. Stopped conversations remain frozen.',
                    failure:
                        'Outcome unconfirmed. Inspect the original operation before another command.',
                    digest: 'Review reference',
                    batch: 'Maximum records per batch',
                    removed: 'Removed records',
                    PREPARED: 'Prepared; no content deleted',
                    PURGING: 'Deletion in progress',
                    PURGED: 'Conversation content removed',
                    STOPPED: 'Stopped; remaining content preserved',
                },
                presentation: {
                    title: 'Retention review',
                    inspect: 'Load review',
                    close: 'Close',
                    previous: 'Previous page',
                    next: 'Next page',
                    empty: 'No conversations in this page',
                    failure: 'Retention review unavailable',
                    cutoff: 'Retention cutoff',
                    notice: 'Preview only. No content is deleted.',
                    HELD: 'On legal hold',
                    ACTIVE: 'Active conversation',
                    UNKNOWN: 'Insufficient lifecycle evidence',
                    EXPIRED_REVIEW_REQUIRED: 'Expired; review required',
                    WITHIN_RETENTION: 'Within retention',
                    PURGING: 'Content deletion in progress',
                    PURGED: 'Retained conversation tombstone',
                    RETENTION_STOPPED:
                        'Retention stopped; remaining content frozen',
                },
            },
            allowAnonymous: false,
        },
    },
};
