/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
const crypto = require('crypto');
/** @module engagementCore/src/service/defaultEngagementOperationsExecutionService @description Executes approved, idempotent operational plans only through domain-owned command and evidence ports. @layer service @owner engagementCore */
module.exports = {
    /** Resolves the authenticated approving actor. */
    actor: function (command) { return command.actorId || command.approvedBy; },
    /** Rejects execution without explicit approval, reason, actor, and replay identity. */
    assertApproval: function (command) { if (!command || command.approved !== true || !command.approvalReason || !this.actor(command) || !command.idempotencyKey) throw new Error('approved operation, reason, actor, and idempotency key are required'); },
    /** Executes a resumable batch through domain-owned dispatch and evidence ports. */
    executeBatch: async function (preview, command, ports) {
        this.assertApproval(command); ports = ports || {};
        if (!preview || preview.preview !== true || preview.requiresApproval !== true) throw new Error('an immutable batch preview is required');
        let existing = ports.findReceipt && await ports.findReceipt(command.tenant, command.idempotencyKey); if (existing) return Object.assign({}, existing, { duplicate: true });
        let run = { tenant: command.tenant, idempotencyKey: command.idempotencyKey, action: command.action, reason: command.approvalReason, requestedBy: command.requestedBy || this.actor(command), approvedBy: this.actor(command), status: 'IN_PROGRESS', total: preview.commands.length, succeeded: 0, failed: 0, cursor: 0, results: [], correlationId: command.correlationId, startedAt: command.now || new Date() };
        for (let index = Number(command.resumeFrom || 0); index < preview.commands.length; index += 1) { let item = preview.commands[index]; try { let result = await ports.dispatch(Object.assign({}, item, { tenant: command.tenant, correlationId: command.correlationId })); run.results.push({ domainType: item.domainType, domainCode: item.domainCode, status: 'SUCCEEDED', revision: result && result.revision }); run.succeeded += 1; } catch (error) { run.results.push({ domainType: item.domainType, domainCode: item.domainCode, status: 'FAILED', errorCode: error.code || 'OPERATION_FAILED' }); run.failed += 1; if (command.continueOnError !== true) { run.cursor = index; break; } } run.cursor = index + 1; }
        run.status = run.failed ? (run.succeeded ? 'PARTIAL' : 'FAILED') : 'COMPLETED'; run.completedAt = command.now || new Date();
        return ports.saveReceipt ? ports.saveReceipt(run) : run;
    },
    /** Generates an allow-listed bounded export and immutable checksum. */
    executeExport: async function (preview, items, command, ports) {
        this.assertApproval(command); ports = ports || {}; let fields = preview.fields || [];
        let rows = (items || []).slice(0, preview.maximumRecords).map(item => Object.fromEntries(fields.map(field => [field, item[field]])));
        let serialized = JSON.stringify(rows); let evidence = Object.assign({}, preview, { tenant: command.tenant, requestedBy: this.actor(command), approvedBy: this.actor(command), status: 'AVAILABLE', checksum: crypto.createHash('sha256').update(serialized).digest('hex'), generatedAt: command.now || new Date(), expiresAt: command.expiresAt, rows: rows });
        return ports.saveExport ? ports.saveExport(evidence) : evidence;
    },
    /** Executes an approved repair through its domain owner. */
    executeRepair: async function (preview, command, ports) {
        this.assertApproval(command); ports = ports || {};
        let result = await ports.dispatch({ tenant: command.tenant, domainType: preview.domainType, domainCode: preview.domainCode, action: command.action || 'RECONCILE', expectedSourceHash: preview.observedSourceHash, reason: command.approvalReason, correlationId: command.correlationId });
        let evidence = Object.assign({}, preview, { status: 'REPAIRED', approvedBy: this.actor(command), result: { status: result.status, revision: result.revision }, repairedAt: command.now || new Date() });
        return ports.saveRepair ? ports.saveRepair(evidence) : evidence;
    }
};
