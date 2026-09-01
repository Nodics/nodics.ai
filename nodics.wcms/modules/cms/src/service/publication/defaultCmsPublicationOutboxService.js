/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module cms/service/publication/DefaultCmsPublicationOutboxService
 * @description Persists target publication side effects in the deployment transaction and delivers them only after commit.
 * @layer service
 * @owner cms
 * @override Projects may extend consumers while preserving deterministic identity, at-least-once delivery, and reconciliation.
 */
const crypto = require('crypto');

module.exports = {
    /** Defers startup recovery until generated models and runtime services are ready. */
    init: function () { return Promise.resolve(true); },
    /** Replays bounded pending work after an Online runtime restart. */
    postInit: function () {
        let publication = (CONFIG.get('cms') || {}).publication || {};
        if (publication.runtimeRole !== 'ONLINE' || publication.outbox && publication.outbox.startupReconciliation === false) {
            return Promise.resolve(true);
        }
        let tenants = NODICS.getActiveTenants ? NODICS.getActiveTenants() : [CONFIG.get('defaultTenant') || 'default'];
        return Promise.all(tenants.map(tenant => this.reconcile({ tenant: tenant, authData: { tokenType: 'service' } })
            .catch(error => { if (this.LOG && this.LOG.error) this.LOG.error('CMS publication outbox startup reconciliation failed', error); return false; })))
            .then(() => true);
    },
    /** Returns normalized generated-service items. */
    items: function (response) { return response && Array.isArray(response.result) ? response.result : []; },
    /** Returns a provider-neutral affected-record count. */
    affected: function (response) {
        let result = response && response.result !== undefined ? response.result : response;
        return Number(result && (result.modifiedCount !== undefined ? result.modifiedCount : result.nModified !== undefined
            ? result.nModified : result.n) || 0);
    },
    /** Resolves the governed publication revision embedded in an operation key. */
    sequence: function (request) {
        let match = String(request.publicationOperationKey || '').match(/:(\d+)$/);
        return match ? Number(match[1]) : 0;
    },
    /** Creates one deterministic pending outbox event inside the caller transaction. */
    enqueue: async function (operation, manifest, request) {
        let identity = request.publicationOperationKey || request.correlationId || manifest.code;
        let code = [operation, manifest.publicationCode, manifest.code,
            crypto.createHash('sha256').update(String(identity)).digest('hex').slice(0, 16)].join('_');
        let existing = this.items(await SERVICE.DefaultCmsPublicationEventOutboxService.get({ tenant: request.tenant,
            authData: request.authData, transactionContext: request.transactionContext,
            query: { code: code }, searchOptions: { limit: 1 } }))[0];
        if (existing) return existing;
        let model = { code: code, active: true, publicationCode: manifest.publicationCode,
            manifestCode: manifest.code, operation: operation, eventType: 'CMS_ONLINE_CHANGED',
            operationKey: request.publicationOperationKey, sequence: this.sequence(request),
            status: 'PENDING', attempts: 0, correlationId: request.correlationId || request.requestId };
        let response = await SERVICE.DefaultCmsPublicationEventOutboxService.save({ tenant: request.tenant,
            authData: request.authData, transactionContext: request.transactionContext, model: model });
        return this.items(response)[0] || response.result || model;
    },
    /** Delivers one committed event idempotently and records its projection status. */
    deliver: async function (event, request) {
        if (!event || event.status === 'DELIVERED') return event;
        let policy = (((CONFIG.get('cms') || {}).publication || {}).outbox || {});
        let now = Date.now();
        if (event.status === 'PROCESSING' && Date.parse(event.leaseUntil || '') > now) {
            return Object.assign({}, event, { duplicateSuppressed: true });
        }
        if (event.status === 'PROCESSING') {
            await SERVICE.DefaultCmsPublicationEventOutboxService.update({ tenant: request.tenant, authData: request.authData,
                query: { code: event.code, status: 'PROCESSING', leaseToken: event.leaseToken },
                model: { status: 'PENDING' } });
        }
        let leaseToken = crypto.randomBytes(16).toString('hex');
        let claimed = await SERVICE.DefaultCmsPublicationEventOutboxService.update({ tenant: request.tenant, authData: request.authData,
            query: { code: event.code, status: 'PENDING' }, model: { status: 'PROCESSING', leaseToken: leaseToken,
                leaseUntil: new Date(now + Number(policy.leaseMs || 30000)).toISOString() } });
        if (this.affected(claimed) !== 1) {
            let winner = this.items(await SERVICE.DefaultCmsPublicationEventOutboxService.get({ tenant: request.tenant,
                authData: request.authData, query: { code: event.code }, searchOptions: { limit: 1 } }))[0];
            return Object.assign({}, winner || event, { duplicateSuppressed: true });
        }
        let attempts = Number(event.attempts || 0) + 1;
        try {
            await SERVICE.DefaultCmsDeliveryCacheInvalidationService.invalidate(Object.assign({}, request, {
                publicationEvent: event
            }));
            if (SERVICE.DefaultWcmsExperiencePublicationIndexingService &&
                typeof SERVICE.DefaultWcmsExperiencePublicationIndexingService.handlePublicationEvent === 'function') {
                await SERVICE.DefaultWcmsExperiencePublicationIndexingService.handlePublicationEvent(event, request);
            }
            await SERVICE.DefaultCmsPublicationEventOutboxService.update({ tenant: request.tenant, authData: request.authData,
                query: { code: event.code, status: 'PROCESSING', leaseToken: leaseToken }, model: {
                    status: 'DELIVERED', attempts: attempts, lastAttemptAt: new Date().toISOString(),
                    deliveredAt: new Date().toISOString()
                } });
            return Object.assign({}, event, { status: 'DELIVERED', attempts: attempts });
        } catch (error) {
            await SERVICE.DefaultCmsPublicationEventOutboxService.update({ tenant: request.tenant, authData: request.authData,
                query: { code: event.code, status: 'PROCESSING', leaseToken: leaseToken }, model: {
                    status: 'PENDING', attempts: attempts, lastAttemptAt: new Date().toISOString(),
                    failureCode: String(error.code || error.name || 'DELIVERY_FAILED').slice(0, 128)
                } }).catch(() => false);
            throw error;
        }
    },
    /** Replays one bounded tenant-scoped pending batch after restart or consumer failure. */
    reconcile: async function (request) {
        let policy = (((CONFIG.get('cms') || {}).publication || {}).outbox || {});
        let response = await SERVICE.DefaultCmsPublicationEventOutboxService.get({ tenant: request.tenant,
            authData: request.authData, query: { status: { $in: ['PENDING', 'PROCESSING'] } },
            searchOptions: { limit: Number(policy.batchSize || 100), sort: { sequence: 1, createdAt: 1, code: 1 } } });
        let events = this.items(response).sort((left, right) => Number(left.sequence || 0) - Number(right.sequence || 0) ||
            String(left.code).localeCompare(String(right.code)));
        let result = { selected: events.length, delivered: 0, failed: 0 };
        for (let event of events) {
            if (Number(event.attempts || 0) >= Number(policy.maximumAttempts || 10)) {
                result.failed++;
                continue;
            }
            try { await this.deliver(event, request); result.delivered++; } catch (error) { result.failed++; }
        }
        return result;
    }
};
