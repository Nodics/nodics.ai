/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module cms/service/publication/DefaultCmsPublicationBaselineService
 * @description Installs one allowlisted immutable baseline into CMS Staged and submits one atomic site publication to the normal Process workflow.
 * @layer service
 * @owner cms
 * @override Projects may add baseline descriptors while retaining exact-release qualification, human initiation, Staged-only execution, and normal approval.
 */
module.exports = {
    /** Returns effective CMS publication configuration. */
    settings: function () { return (CONFIG.get('cms') || {}).publication || {}; },
    /** Rejects baseline control outside CMS Staged. */
    assertStaged: function () {
        if (this.settings().runtimeRole !== 'STAGED') {
            throw new CLASSES.NodicsError('CMS_BASELINE_SOURCE_ROLE_INVALID', 'CMS baseline operations require WCMS Staged');
        }
    },
    /** Resolves one explicitly configured baseline descriptor. */
    descriptor: function (code) {
        if (!/^[a-z][a-z0-9_-]{0,63}$/.test(String(code || ''))) {
            throw new CLASSES.NodicsError('CMS_BASELINE_INVALID', 'CMS baseline code is invalid');
        }
        let descriptor = (this.settings().baselines || {})[code];
        if (!descriptor || (!descriptor.releaseCode && !descriptor.contentPackCode) || !descriptor.releaseVersion || !descriptor.rootType ||
            !descriptor.rootCode || !descriptor.sourceVersion) {
            throw new CLASSES.NodicsError('CMS_BASELINE_UNAVAILABLE', 'CMS baseline is unavailable');
        }
        return Object.assign({ code: code }, descriptor);
    },
    /** Returns the deterministic publication identity for one immutable release. */
    publicationCode: function (descriptor) {
        return ['cmsBaseline', descriptor.code, descriptor.releaseVersion].join('_').replace(/[^A-Za-z0-9_-]/g, '_');
    },
    /** Builds the client-safe review bound to the exact qualified release checksum and publication identity. */
    review: function (descriptor, release, publication, request) {
        if (!release.publicationReview) return undefined;
        return Object.assign({}, release.publicationReview, {
            releaseChecksum: release.checksum,
            publicationCode: publication && publication.code || this.publicationCode(descriptor),
            workflowRef: publication && (publication.workflowRef || (publication.state === 'PENDING_APPROVAL' &&
                SERVICE.DefaultCmsPublicationWorkflowService.reference(publication))),
            requestedBy: publication && publication.requestedBy,
            requestedAt: publication && (publication.createdAt || publication.createdTime),
            tenant: request.tenant,
            validation: { status: 'PASSED', warnings: [] }
        });
    },
    /** Returns the exact release catalogue projection visible to this Staged runtime. */
    release: async function (descriptor, request) {
        if (descriptor.contentPackCode) {
            let context = SERVICE.DefaultContentPackService.resolvePackContext(descriptor.contentPackCode);
            let available = SERVICE.DefaultContentPackService.inspectRelease(context);
            let manifest = available.manifest || {};
            if (!available.available || available.version !== descriptor.releaseVersion ||
                manifest.destinationRole !== 'WCMS_STAGED' || manifest.lifecycle !== 'PUBLISHABLE' ||
                manifest.initialPublicationPolicy !== 'ADMIN_INITIATED' ||
                !Array.isArray(manifest.sites) || !manifest.sites.includes(descriptor.rootCode)) {
                throw new CLASSES.NodicsError('CMS_BASELINE_RELEASE_INVALID', 'CMS content-pack baseline qualification failed');
            }
            let statusResult = await SERVICE.DefaultContentPackService.getStatus(Object.assign({}, request,
                { packCode: descriptor.contentPackCode }));
            let status = statusResult.data || statusResult;
            return { releaseCode: 'contentPack:' + descriptor.contentPackCode, version: available.version,
                status: status.state, sourceKind: 'CONTENT_PACK', packCode: descriptor.contentPackCode };
        }
        let dataType = descriptor.dataType || 'init';
        let catalogue = await SERVICE.DefaultDataReleaseService.getCatalogue({ tenant: request.tenant, authData: request.authData,
            dataType: dataType });
        let release = (catalogue.data || []).find(item => item.releaseCode === descriptor.releaseCode);
        if (!release || release.version !== descriptor.releaseVersion || release.destinationRole !== 'WCMS_STAGED' ||
            release.lifecycle !== 'PUBLISHABLE' || release.initialPublicationPolicy !== 'ADMIN_INITIATED') {
            throw new CLASSES.NodicsError('CMS_BASELINE_RELEASE_INVALID', 'CMS baseline release qualification failed');
        }
        return release;
    },
    /** Returns one publication when present without treating absence as a runtime failure. */
    publication: async function (descriptor, request) {
        try {
            return await SERVICE.DefaultPublicationLifecycleService.get(Object.assign({}, request,
                { publicationCode: this.publicationCode(descriptor) }));
        } catch (error) {
            if (error && (error.code === 'ERR_PUB_00000' || /not found/i.test(error.message || ''))) return undefined;
            throw error;
        }
    },
    /** Waits briefly for a cross-runtime approval callback to finish its local Online transition. */
    onlinePublication: async function (descriptor, request) {
        let publication;
        for (let attempt = 0; attempt < 20; attempt++) {
            publication = await this.publication(descriptor, request);
            if (publication && publication.state === 'ONLINE') return publication;
            if (!publication || !['APPROVED', 'ACTIVATING', 'ROLLED_BACK', 'WITHDRAWN'].includes(publication.state)) return publication;
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        return publication;
    },
    /** Returns whether a data-install/import failure is the idempotent already-current case. */
    isAlreadyCurrent: function (error) {
        let message = String(error && (error.message || error.code) || '');
        return /already current/i.test(message);
    },
    /** Derives a sanitized readiness projection from nImport and nPublish authorities. */
    status: async function (code, request) {
        this.assertStaged();
        let descriptor = this.descriptor(code);
        let release = await this.release(descriptor, request);
        let publication = await this.publication(descriptor, request);
        let state = publication && publication.state;
        let lastAudit = publication && Array.isArray(publication.auditTrail) && publication.auditTrail.length
            ? publication.auditTrail[publication.auditTrail.length - 1] : undefined;
        let target;
        let targetEvidenceError;
        if (publication && publication.targetVersion &&
            SERVICE.DefaultCmsPublicationVersionProviderService.getLineage) {
            try {
                target = await SERVICE.DefaultCmsPublicationVersionProviderService.getLineage(publication, request);
            } catch (error) {
                targetEvidenceError = error && (error.code || error.message) || 'CMS_TARGET_EVIDENCE_UNAVAILABLE';
            }
        }
        let transitions = publication && [].concat(publication.auditTrail || []).map(entry => ({
            revision: entry.revision, fromState: entry.fromState, toState: entry.toState,
            actor: entry.actor, reason: entry.reason, correlationId: entry.correlationId,
            workflow: entry.details && entry.details.workflow,
            failureCode: entry.details && entry.details.failureCode
        }));
        let readiness = state === 'ONLINE' ? 'READY' : state === 'WITHDRAWN' ? 'RETIRED' :
            state === 'ROLLED_BACK' ? 'ROLLED_BACK' : state === 'REJECTED' ? 'REJECTED' :
            state === 'FAILED' ? 'FAILED' : state ? 'PUBLICATION_PENDING' :
                release.status === 'CURRENT' ? 'IMPORTED' : 'NOT_IMPORTED';
        return { baselineCode: descriptor.code, releaseCode: release.releaseCode, releaseVersion: release.version,
            releaseStatus: release.status, readiness: readiness,
            review: this.review(descriptor, release, publication, request),
            publication: publication && { code: publication.code, state: publication.state, revision: publication.revision,
                targetVersion: publication.targetVersion, previousOnlineVersion: publication.previousOnlineVersion,
                sourceVersion: publication.sourceVersion, requestedBy: publication.requestedBy,
                workflowRef: publication.workflowRef || (state === 'PENDING_APPROVAL' &&
                    SERVICE.DefaultCmsPublicationWorkflowService.reference(publication)),
                correlationId: publication.correlationId,
                failureCode: state === 'FAILED' && lastAudit && lastAudit.details && lastAudit.details.failureCode },
            lineage: publication && { actor: publication.requestedBy,
                source: { releaseCode: release.releaseCode, releaseVersion: release.version,
                    sourceVersion: publication.sourceVersion },
            publication: { code: publication.code, workflowRef: publication.workflowRef,
                    correlationId: publication.correlationId, transitions: transitions },
                target: target, targetEvidenceError: targetEvidenceError } };
    },
    /** Installs and submits one baseline without approving or deploying it. */
    initiate: async function (code, request) {
        this.assertStaged();
        let input = request.baseline || {};
        let requestedBy = String(input.requestedBy || '');
        if (!/^[A-Za-z0-9][A-Za-z0-9@._:-]{0,255}$/.test(requestedBy)) {
            throw new CLASSES.NodicsError('CMS_BASELINE_HUMAN_REQUIRED', 'A delegated human administrator identity is required');
        }
        let descriptor = this.descriptor(code);
        let release = await this.release(descriptor, request);
        if (release.status !== 'CURRENT' && release.sourceKind === 'CONTENT_PACK') {
            try {
                await SERVICE.DefaultContentPackService.importPack(Object.assign({}, request,
                    { packCode: descriptor.contentPackCode, correlationId: request.correlationId || request.requestId }));
            } catch (error) {
                if (!this.isAlreadyCurrent(error)) throw error;
            }
        } else if (release.status !== 'CURRENT') {
            try {
                await SERVICE.DefaultDataReleaseService.execute({ tenant: request.tenant, authData: request.authData,
                    correlationId: request.correlationId || request.requestId,
                    releaseRequest: { dataType: descriptor.dataType || 'init', releaseCodes: [descriptor.releaseCode],
                        expectedReleases: { [descriptor.releaseCode]: descriptor.releaseVersion } } });
            } catch (error) {
                if (!this.isAlreadyCurrent(error)) throw error;
            }
        }
        let actorRequest = Object.assign({}, request, { authData: Object.assign({}, request.authData, {
            principalId: requestedBy, delegatedBy: request.authData && (request.authData.principalId || request.authData.code)
        }), reason: input.reason || 'Administrator initiated CMS baseline publication',
        correlationId: input.correlationId || request.correlationId || request.requestId });
        let publicationInput = { code: this.publicationCode(descriptor), domain: 'cms', rootType: descriptor.rootType,
            rootCode: descriptor.rootCode, sourceVersion: String(descriptor.sourceVersion),
            siteCode: descriptor.rootCode, catalogCode: input.catalogCode };
        let publication = await this.publication(descriptor, actorRequest);
        if (!publication) {
            publication = await SERVICE.DefaultPublicationLifecycleService.create(Object.assign({}, actorRequest,
                { publication: publicationInput }));
        }
        if (publication.state === 'FAILED') {
            publication = await SERVICE.DefaultPublicationLifecycleService.retry(Object.assign({}, actorRequest,
                { publicationCode: publication.code, expectedRevision: publication.revision }));
        }
        if (['ROLLED_BACK', 'WITHDRAWN', 'REJECTED'].includes(publication.state)) {
            publication = await SERVICE.DefaultPublicationLifecycleService.resubmit(Object.assign({}, actorRequest,
                { publicationCode: publication.code, expectedRevision: publication.revision }));
        }
        if (publication.state === 'STAGED' || publication.state === 'VALIDATING') {
            publication = await SERVICE.DefaultPublicationLifecycleService.validate(Object.assign({}, actorRequest,
                { publicationCode: publication.code, expectedRevision: publication.revision }));
        }
        if (publication.state === 'VALIDATED' || publication.state === 'PENDING_APPROVAL') {
            publication = await SERVICE.DefaultPublicationLifecycleService.requestApproval(Object.assign({}, actorRequest,
                { publicationCode: publication.code, expectedRevision: publication.revision }));
        }
        let readiness = publication.state === 'ONLINE' ? 'READY' : publication.state === 'REJECTED' ? 'REJECTED' :
            publication.state === 'FAILED' ? 'FAILED' : 'PUBLICATION_PENDING';
        return { baselineCode: descriptor.code, releaseCode: release.releaseCode, releaseVersion: descriptor.releaseVersion,
            releaseStatus: 'CURRENT',
            readiness: readiness,
            review: this.review(descriptor, release, publication, request),
            publication: { code: publication.code, state: publication.state, revision: publication.revision,
                workflowRef: publication.workflowRef || (publication.state === 'PENDING_APPROVAL' &&
                    SERVICE.DefaultCmsPublicationWorkflowService.reference(publication)),
                correlationId: publication.correlationId } };
    },
    /** Rolls an Online baseline back to its captured previous release through nPublish. */
    rollback: async function (code, request) {
        this.assertStaged();
        let descriptor = this.descriptor(code);
        let publication = await this.publication(descriptor, request);
        if (!publication || publication.state !== 'ONLINE' || !publication.previousOnlineVersion) {
            throw new CLASSES.NodicsError('CMS_BASELINE_ROLLBACK_UNAVAILABLE', 'CMS baseline has no previous Online release to restore');
        }
        let rolledBack = await SERVICE.DefaultPublicationLifecycleService.rollback(Object.assign({}, request,
            { publicationCode: publication.code, expectedRevision: publication.revision }));
        return this.status(code, request).then(status => Object.assign({}, status, { publication: {
            code: rolledBack.code, state: rolledBack.state, revision: rolledBack.revision,
            correlationId: rolledBack.correlationId } }));
    },
    /** Retires current Online visibility through the domain withdrawal provider. */
    retire: async function (code, request) {
        this.assertStaged();
        let descriptor = this.descriptor(code);
        let publication = await this.onlinePublication(descriptor, request);
        if (!publication || publication.state !== 'ONLINE') {
            throw new CLASSES.NodicsError('CMS_BASELINE_RETIREMENT_UNAVAILABLE',
                'Only an Online CMS baseline can be retired; current state: ' + String(publication && publication.state || 'MISSING'));
        }
        let retired = await SERVICE.DefaultPublicationLifecycleService.withdraw(Object.assign({}, request,
            { publicationCode: publication.code, expectedRevision: publication.revision }));
        return this.status(code, request).then(status => Object.assign({}, status, { readiness: 'RETIRED', publication: {
            code: retired.code, state: retired.state, revision: retired.revision,
            correlationId: retired.correlationId } }));
    }
};
