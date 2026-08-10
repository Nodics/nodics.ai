/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
const crypto = require('node:crypto');
/** @module checkoutCore/src/service/defaultCommerceOperationsService @description Creates bounded capacity, retry, recovery, compatibility, and migration evidence. @layer service @owner checkoutCore */
module.exports = {
    pageSize: (requested, maximum) => Math.max(1, Math.min(Number(requested || 50), Number(maximum || 100))),
    /** Calculates a bounded exponential retry decision. @param {number} attempt Attempt number. @param {Object} policy Retry policy. @returns {Object} Retry evidence. */
    retry: function (attempt, policy) { const maximum = Number(policy.maximumAttempts || 5); return { attempt, retryable: attempt < maximum, delayMs: attempt < maximum ? Math.min(Number(policy.baseDelayMs || 250) * (2 ** Math.max(0, attempt - 1)), Number(policy.maximumDelayMs || 30000)) : undefined }; },
    /** Creates a hashed recovery checkpoint. @param {Object} request Workload position. @returns {Object} Immutable checkpoint. */
    checkpoint: function (request) {
        if (!request.tenant || !request.workload || !request.partitionKey) throw new Error('Tenant workload checkpoint is required');
        const source = { tenant: request.tenant, workload: request.workload, partitionKey: request.partitionKey, cursor: request.cursor, processedCount: Number(request.processedCount || 0), failedCount: Number(request.failedCount || 0) };
        return Object.freeze(Object.assign(source, { status: request.failedCount ? 'PARTIAL' : 'CURRENT', revision: Number(request.revision || 0) + 1, sourceHash: crypto.createHash('sha256').update(JSON.stringify(source)).digest('hex'), correlationId: request.correlationId, checkpointedAt: request.now || new Date() }));
    },
    /** Classifies a proposed contract change. @param {Object} current Current contract. @param {Object} proposed Proposed contract. @returns {Object} Compatibility record. */
    compatibility: function (current, proposed) {
        const breaking = current.contractCode !== proposed.contractCode || Number(proposed.major) > Number(current.major);
        return Object.freeze({ contractType: current.contractType, contractCode: current.contractCode, version: proposed.version, compatibility: breaking ? 'BREAKING' : proposed.deprecated ? 'DEPRECATED' : 'COMPATIBLE', successorVersion: proposed.successorVersion, evidence: { currentVersion: current.version, proposedVersion: proposed.version } });
    },
    /** Creates dry-run, cutover, or quarantine migration evidence. @param {Object} request Migration request. @param {Object} source Source record. @returns {Object} Migration record. */
    migration: function (request, source) {
        if (!request.tenant || !source || !source.code) throw new Error('Tenant migration source is required');
        const canonical = JSON.stringify(source);
        return Object.freeze({ tenant: request.tenant, sourceModule: request.sourceModule, sourceSchema: request.sourceSchema, sourceCode: source.code, targetModule: request.targetModule, targetSchema: request.targetSchema, targetCode: request.targetCode, sourceHash: crypto.createHash('sha256').update(canonical).digest('hex'), mappingVersion: request.mappingVersion, strategy: request.strategy || 'DRY_RUN', status: request.errors && request.errors.length ? 'QUARANTINED' : request.strategy === 'CUTOVER' ? 'MIGRATED' : 'VALIDATED', errors: request.errors || [], correlationId: request.correlationId });
    },
    /** Compares source and restored manifests. @param {Object} source Source manifest. @param {Object} restored Restored manifest. @returns {Object} Restore verification. */
    restore: function (source, restored) {
        if (!source || !restored || source.tenant !== restored.tenant) throw new Error('Tenant-scoped restore manifests are required');
        const keys = ['orders', 'payments', 'shipments', 'lifecycleRequests', 'history'];
        const mismatches = keys.filter(key => Number(source.counts[key] || 0) !== Number(restored.counts[key] || 0));
        if (source.checksum !== restored.checksum) mismatches.push('checksum');
        return Object.freeze({ status: mismatches.length ? 'DRIFTED' : 'VERIFIED', mismatches, sourceCheckpoint: source.checkpoint, restoredCheckpoint: restored.checkpoint });
    }
};
