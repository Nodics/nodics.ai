/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nPublish/service/DefaultPublicationOperationsService
 * @description Provides sanitized diagnostics, correlation search, reconciliation, and governed recovery over publication services.
 * @layer service
 * @owner nPublish
 * @override Projects may extend operator evidence while preserving bounded service-only access and lifecycle authority.
 */
module.exports = {
    /** Initializes publication operations. */
    init: function () { return Promise.resolve(true); },
    /** Completes publication operations initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Resolves bounded reconciliation configuration. */
    config: function () { return (CONFIG.get('publish') || {}).reconciliation || {}; },
    /** Resolves the publication repository through its owning service. */
    repository: function () { return SERVICE.DefaultPublicationAuditReconciliationService.getRepository(); },
    /** Projects non-sensitive operator evidence. */
    safe: function (item) {
        return { code: item.code, domain: item.domain, state: item.state, revision: item.revision,
            sourceVersion: item.sourceVersion, targetVersion: item.targetVersion,
            previousOnlineVersion: item.previousOnlineVersion, workflowRef: item.workflowRef,
            correlationId: item.correlationId, failureCode: item.failureCode,
            updatedAt: item.updatedAt || item.modifiedTime || item.createdAt };
    },
    /** Selects a bounded tenant-scoped publication batch. */
    select: async function (request) {
        let limit = Math.max(1, Math.min(Number(this.config().correlationSearchLimit || 100), 1000));
        return this.repository().list(request, limit);
    },
    /** Builds health, metrics, stuck-state, and alert diagnostics. */
    diagnostics: async function (request) {
        let rows = await this.select(request);
        let now = Date.now(); let stuckAfterMs = Number(this.config().stuckAfterMs || 300000);
        let transient = new Set(['VALIDATING', 'PENDING_APPROVAL', 'ACTIVATING', 'ROLLING_BACK', 'WITHDRAWING']);
        let counts = {}; let stuck = [];
        rows.forEach(item => {
            counts[item.state] = Number(counts[item.state] || 0) + 1;
            let changed = new Date(item.updatedAt || item.modifiedTime || item.createdAt || now).getTime();
            if (transient.has(item.state) && now - changed >= stuckAfterMs) stuck.push(this.safe(item));
        });
        let failed = Number(counts.FAILED || 0);
        return { readiness: stuck.length ? 'DEGRADED' : 'READY', scanned: rows.length, stateCounts: counts,
            stuck: stuck, metrics: { publicationTotal: rows.length, failedTotal: failed, stuckTotal: stuck.length },
            alerts: failed >= Number(this.config().alertFailureCount || 1) ? [{ code: 'PUBLICATION_FAILURES_PRESENT', severity: 'WARNING', count: failed }] : [] };
    },
    /** Finds publications by a validated correlation identifier. */
    correlation: async function (request) {
        let params = request.httpRequest && request.httpRequest.params || request.params || {};
        let correlationId = String(params.correlationId || request.correlationId || '').trim();
        if (!/^[A-Za-z0-9._:-]{1,128}$/.test(correlationId)) throw new CLASSES.NodicsError('ERR_PUB_00001', 'A bounded correlation identifier is required');
        let rows = await this.select(request);
        return { correlationId: correlationId, publications: rows.filter(item => item.correlationId === correlationId).map(this.safe) };
    },
    /** Reconciles audit and outbox projections through owning services. */
    reconcile: async function (request) {
        let projection = await SERVICE.DefaultPublicationAuditReconciliationService.reconcile(request);
        let outbox = SERVICE.DefaultCmsPublicationOutboxService && SERVICE.DefaultCmsPublicationOutboxService.reconcile ?
            await SERVICE.DefaultCmsPublicationOutboxService.reconcile(request) : { skipped: true, reason: 'CMS_OUTBOX_NOT_LOADED' };
        let target = [];
        for (let publication of await this.select(request)) {
            if (!publication.targetVersion) continue;
            try {
                let provider = SERVICE.DefaultPublicationLifecycleService.getVersionProvider(publication.domain);
                if (provider && typeof provider.reconcile === 'function') target.push({ publicationCode: publication.code,
                    result: await provider.reconcile(publication, request) });
            } catch (error) {
                target.push({ publicationCode: publication.code, result: { status: 'FAILED', repaired: false,
                    failureCode: String(error.code || error.name || 'RECONCILIATION_FAILED').slice(0, 128) } });
            }
        }
        return { projection: projection, outbox: outbox, target: target };
    },
    /** Retries only lifecycle states explicitly classified as recoverable. */
    recover: async function (request) {
        let publication = await SERVICE.DefaultPublicationLifecycleService.get(request);
        if (!['FAILED', 'REJECTED', 'WITHDRAWN', 'ROLLED_BACK'].includes(publication.state)) {
            throw new CLASSES.NodicsError('ERR_PUB_00003', 'Publication is not in a recoverable state');
        }
        request.expectedRevision = publication.revision;
        request.reason = request.reason || 'Operator-governed recovery';
        return SERVICE.DefaultPublicationLifecycleService.retry(request);
    }
};
