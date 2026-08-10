/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';

/**
 * @module engagementCore/src/service/defaultEngagementRetentionPlanningService
 * @description Creates bounded Cron-triggerable retention decisions while domain owners execute archive or anonymization commands.
 * @layer service
 * @owner engagementCore
 * @override Tenants may provide stricter policy durations while preserving legal hold, dry-run, owner dispatch, and hard-delete prohibition.
 */
module.exports = {
    /** Evaluates one projection without mutating its owning domain record. */
    decide: function (record, command, policy) {
        policy = policy || {};
        if (!record || !record.tenant || record.tenant !== command.tenant) throw new Error('Tenant-scoped retention record is required');
        if (record.legalHold === true && policy.legalHoldOverridesExpiry !== false) return { domainType: command.domainType, domainCode: record.code, decision: 'SKIP_LEGAL_HOLD', eligible: false };
        let basis = record.closedAt || record.resolvedAt || record.withdrawnAt || record.createdAt || record.submittedAt;
        if (!basis) return { domainType: command.domainType, domainCode: record.code, decision: 'SKIP_NO_RETENTION_BASIS', eligible: false };
        let dueAt = new Date(new Date(basis).getTime() + Number(command.retentionDays || policy.defaultRetentionDays || 365) * 86400000);
        let eligible = dueAt.getTime() <= new Date(command.now || Date.now()).getTime();
        return { domainType: command.domainType, domainCode: record.code, decision: eligible ? 'ANONYMIZE_OR_ARCHIVE' : 'RETAIN', eligible: eligible, dueAt: dueAt, ownerOperation: eligible ? 'RETENTION' : undefined };
    },

    /** Builds a bounded, resumable Cron work plan for domain-owner dispatch. */
    plan: function (records, command, policy) {
        if (!command || !command.tenant || !command.domainType || !command.correlationId) throw new Error('Retention tenant, domain, and correlation are required');
        let maximum = Math.max(1, Math.min(Number(command.maximumBatchSize || policy.maximumBatchSize || 100), 1000));
        let cursor = Math.max(0, Number(command.cursor || 0));
        let page = (records || []).slice(cursor, cursor + maximum);
        let decisions = page.map(record => this.decide(record, command, policy));
        return {
            mode: command.approved === true ? 'EXECUTE_OWNER_COMMANDS' : 'DRY_RUN',
            hardDeleteAllowed: false,
            cursor: cursor,
            nextCursor: cursor + page.length < (records || []).length ? cursor + page.length : undefined,
            decisions: decisions,
            commands: command.approved === true ? decisions.filter(item => item.eligible).map(item => ({ tenant: command.tenant, domainType: item.domainType, domainCode: item.domainCode, operation: 'ANONYMIZE', purpose: command.purpose, actorId: command.actorId, correlationId: command.correlationId })) : []
        };
    }
};
