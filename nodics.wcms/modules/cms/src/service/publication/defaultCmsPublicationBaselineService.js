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
    /** Normalizes media identities that the publishing application declares as part of the complete Online release. */
    mediaCodes: function (input) {
        return Array.from(new Set([].concat(input && input.mediaCodes || []).map(code => String(code || '').trim())
            .filter(code => /^[A-Za-z0-9][A-Za-z0-9._-]{0,255}$/.test(code)))).sort();
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
    /** Reads Process-owned publication approval diagnostics when a pending publication has workflow scope. */
    approvalDiagnostic: async function (publication, request) {
        if (!publication || publication.state !== 'PENDING_APPROVAL' ||
            !SERVICE.DefaultCmsPublicationWorkflowService ||
            typeof SERVICE.DefaultCmsPublicationWorkflowService.diagnoseApproval !== 'function') return undefined;
        try {
            let result = await SERVICE.DefaultCmsPublicationWorkflowService.diagnoseApproval(publication, request);
            return result && (result.data || result.result || result);
        } catch (error) {
            return {
                source: 'PUBLICATION_APPROVAL',
                status: 'PROVIDER_UNAVAILABLE',
                publicationCode: publication.code,
                publicationRevision: publication.revision,
                publicationState: publication.state,
                workflowRef: publication.workflowRef || SERVICE.DefaultCmsPublicationWorkflowService.reference(publication),
                message: 'Process approval diagnostic is unavailable.',
                suggestedAction: 'Check Process runtime connectivity',
                disabledReason: 'CMS could not read the Process approval task diagnostic for this publication.',
                owner: 'PROCESS',
                errorCode: error && (error.code || error.message)
            };
        }
    },
    /** Returns stable publication repair metadata owned by CMS/nPublish readiness. */
    publicationRepair: function (status) {
        let repairs = {
            STAGED_SOURCE_NOT_INSTALLED: { action: 'INSTALL_STAGED_SOURCE', operation: 'cmsPublicationBaseline.initiate',
                label: 'Install staged source', available: true, idempotent: true },
            STAGED_SOURCE_IMPORTING: { action: 'REFRESH_STAGED_SOURCE', operation: 'cmsPublicationBaseline.status',
                label: 'Refresh staged source', available: true, idempotent: true },
            STAGED_SOURCE_INVALID_RELEASE: { action: 'REPAIR_STAGED_SOURCE_MANIFEST',
                operation: 'dataRelease.repairManifest', label: 'Repair staged source manifest',
                available: false, idempotent: true },
            PUBLICATION_NOT_CREATED: { action: 'CREATE_PUBLICATION', operation: 'cmsPublicationBaseline.initiate',
                label: 'Create publication', available: true, idempotent: true },
            PUBLICATION_VALIDATION_PENDING: { action: 'VALIDATE_PUBLICATION', operation: 'cmsPublicationBaseline.initiate',
                label: 'Validate publication', available: true, idempotent: true },
            PUBLICATION_APPROVAL_NOT_REQUESTED: { action: 'REQUEST_PUBLICATION_APPROVAL',
                operation: 'cmsPublicationBaseline.initiate', label: 'Request approval', available: true, idempotent: true },
            PUBLICATION_APPROVAL_PENDING: { action: 'REVIEW_APPROVAL_TASK', operation: 'process.reviewApprovalTask',
                label: 'Review approval queue', available: false, idempotent: true },
            PUBLICATION_APPROVAL_REJECTED: { action: 'RESUBMIT_PUBLICATION', operation: 'cmsPublicationBaseline.initiate',
                label: 'Resubmit publication', available: true, idempotent: true },
            PUBLICATION_FAILED: { action: 'RETRY_PUBLICATION', operation: 'cmsPublicationBaseline.initiate',
                label: 'Retry publication', available: true, idempotent: true },
            PUBLICATION_ROLLED_BACK: { action: 'REPUBLISH_PUBLICATION', operation: 'cmsPublicationBaseline.initiate',
                label: 'Republish publication', available: true, idempotent: true },
            PUBLICATION_WITHDRAWN: { action: 'RESTORE_PUBLICATION', operation: 'cmsPublicationBaseline.initiate',
                label: 'Restore publication', available: true, idempotent: true },
            ONLINE_RECEIPT_MISSING: { action: 'RECONCILE_ONLINE_EVIDENCE', operation: 'publishing.reconcileReceipt',
                label: 'Reconcile Online evidence', available: true, idempotent: true },
            ONLINE_POINTER_STALE: { action: 'REVIEW_ONLINE_POINTER', operation: 'publishing.reviewOnlinePointer',
                label: 'Review Online pointer', available: false, idempotent: true },
            PUBLICATION_ONLINE: { action: 'MONITOR_PUBLICATION', operation: 'cmsPublicationBaseline.status',
                label: 'Monitor publication', available: true, idempotent: true }
        };
        let repair = repairs[status] || { action: 'REFRESH_PUBLICATION_STATUS', operation: 'cmsPublicationBaseline.status',
            label: 'Refresh publication status', available: true, idempotent: true };
        return Object.assign({ requiresConfirmation: false }, repair);
    },
    /** Normalizes source, lifecycle, workflow, and Online evidence into one publication diagnostic. */
    publicationDiagnostic: function (descriptor, release, publication, target, targetEvidenceError, approvalDiagnostic, transitions) {
        let state = publication && publication.state;
        let lastTransition = transitions && transitions.length ? transitions[transitions.length - 1] : undefined;
        let status = release.status === 'INVALID_RELEASE' ? 'STAGED_SOURCE_INVALID_RELEASE' :
            release.status === 'RUNNING' ? 'STAGED_SOURCE_IMPORTING' :
            release.status !== 'CURRENT' ? 'STAGED_SOURCE_NOT_INSTALLED' :
                !publication ? 'PUBLICATION_NOT_CREATED' :
                    ['STAGED', 'VALIDATING'].includes(state) ? 'PUBLICATION_VALIDATION_PENDING' :
                        state === 'VALIDATED' ? 'PUBLICATION_APPROVAL_NOT_REQUESTED' :
                            state === 'PENDING_APPROVAL' ? 'PUBLICATION_APPROVAL_PENDING' :
                                state === 'REJECTED' ? 'PUBLICATION_APPROVAL_REJECTED' :
                                    state === 'FAILED' ? 'PUBLICATION_FAILED' :
                                        state === 'ROLLED_BACK' ? 'PUBLICATION_ROLLED_BACK' :
                                            state === 'WITHDRAWN' ? 'PUBLICATION_WITHDRAWN' :
                                                state === 'ONLINE' && targetEvidenceError ? 'ONLINE_RECEIPT_MISSING' :
                                                    state === 'ONLINE' && target && target.status === 'POINTER_DRIFT' ? 'ONLINE_POINTER_STALE' :
                                                        state === 'ONLINE' ? 'PUBLICATION_ONLINE' : 'PUBLICATION_STATE_UNKNOWN';
        let severity = status === 'PUBLICATION_ONLINE' ? 'INFO' :
            ['STAGED_SOURCE_IMPORTING', 'PUBLICATION_APPROVAL_PENDING'].includes(status) ? 'WAITING' :
                ['PUBLICATION_FAILED', 'STAGED_SOURCE_NOT_INSTALLED', 'PUBLICATION_NOT_CREATED',
                    'PUBLICATION_VALIDATION_PENDING', 'PUBLICATION_APPROVAL_NOT_REQUESTED',
                    'PUBLICATION_APPROVAL_REJECTED', 'PUBLICATION_ROLLED_BACK', 'PUBLICATION_WITHDRAWN',
                    'ONLINE_RECEIPT_MISSING'].includes(status) ? 'REPAIR_REQUIRED' : 'BLOCKED';
        let messages = {
            STAGED_SOURCE_NOT_INSTALLED: 'The publishable Staged source is not installed/current.',
            STAGED_SOURCE_IMPORTING: 'The publishable Staged source is still importing.',
            STAGED_SOURCE_INVALID_RELEASE: 'The publishable Staged source manifest or runtime contract is invalid.',
            PUBLICATION_NOT_CREATED: 'The Staged source is current, but no publication lifecycle receipt exists.',
            PUBLICATION_VALIDATION_PENDING: 'The publication exists and must complete validation.',
            PUBLICATION_APPROVAL_NOT_REQUESTED: 'The publication is validated but approval has not been requested.',
            PUBLICATION_APPROVAL_PENDING: 'The publication is waiting for governed approval.',
            PUBLICATION_APPROVAL_REJECTED: 'The governed publication approval was rejected.',
            PUBLICATION_FAILED: 'Publication failed before reaching Online.',
            PUBLICATION_ROLLED_BACK: 'Publication was rolled back from Online.',
            PUBLICATION_WITHDRAWN: 'Publication was withdrawn from Online.',
            ONLINE_RECEIPT_MISSING: 'Online publication evidence is incomplete or unavailable.',
            ONLINE_POINTER_STALE: 'Online pointer evidence does not match the expected target publication.',
            PUBLICATION_ONLINE: 'Publication is Online with target evidence.'
        };
        let repair = this.publicationRepair(status);
        return {
            source: 'CMS_PUBLICATION',
            owner: 'cms',
            status: status,
            severity: severity,
            baselineCode: descriptor.code,
            releaseCode: release.releaseCode,
            releaseVersion: release.version,
            releaseStatus: release.status,
            publicationCode: publication && publication.code,
            publicationState: state,
            publicationRevision: publication && publication.revision,
            sourceVersion: publication && publication.sourceVersion || descriptor.sourceVersion,
            targetVersion: publication && publication.targetVersion,
            previousOnlineVersion: publication && publication.previousOnlineVersion,
            workflowRef: publication && (publication.workflowRef || (state === 'PENDING_APPROVAL' &&
                SERVICE.DefaultCmsPublicationWorkflowService.reference(publication))),
            approvalStatus: approvalDiagnostic && approvalDiagnostic.status,
            targetStatus: target && target.status,
            failureCode: state === 'FAILED' && lastTransition && lastTransition.failureCode || targetEvidenceError,
            lastTransition: lastTransition,
            message: messages[status] || 'Publication readiness requires owner review.',
            suggestedAction: repair.label,
            disabledReason: severity === 'INFO' ? 'Publication is ready.' :
                'Resolve the CMS/nPublish publication diagnostic before treating this capability as Online.',
            repair: repair
        };
    },
    /** Builds a compact owner dependency graph for publication readiness rendering. */
    publicationDependencyGraph: function (descriptor, release, publication, target, approvalDiagnostic) {
        let publicationCode = publication && publication.code || this.publicationCode(descriptor);
        let workflowRef = publication && (publication.workflowRef ||
            (publication.state === 'PENDING_APPROVAL' && SERVICE.DefaultCmsPublicationWorkflowService.reference(publication)));
        let targetVersion = publication && publication.targetVersion;
        let nodes = [
            { id: 'source:' + release.releaseCode, kind: release.sourceKind || 'DATA_RELEASE',
                label: release.releaseCode, owner: 'nImport', status: release.status },
            { id: 'publication:' + publicationCode, kind: 'PUBLICATION',
                label: publicationCode, owner: 'nPublish', status: publication && publication.state || 'MISSING' }
        ];
        let edges = [{ from: nodes[0].id, to: nodes[1].id, relationship: 'PUBLISHES_TO' }];
        if (workflowRef) {
            nodes.push({ id: 'workflow:' + workflowRef, kind: 'PROCESS_WORKFLOW',
                label: workflowRef, owner: 'process', status: approvalDiagnostic && approvalDiagnostic.status || 'UNKNOWN' });
            edges.push({ from: nodes[1].id, to: 'workflow:' + workflowRef, relationship: 'REQUIRES_APPROVAL' });
        }
        if (targetVersion || target) {
            nodes.push({ id: 'online:' + (targetVersion || publicationCode), kind: 'ONLINE_TARGET',
                label: targetVersion || publicationCode, owner: 'wcms', status: target && target.status || 'UNKNOWN' });
            edges.push({ from: nodes[1].id, to: 'online:' + (targetVersion || publicationCode),
                relationship: 'DEPLOYS_TO' });
        }
        return { nodes: nodes, edges: edges };
    },
    /** Builds a non-throwing readiness projection when source qualification itself fails. */
    invalidReleaseStatus: function (descriptor, error) {
        let release = {
            releaseCode: descriptor.releaseCode || 'contentPack:' + descriptor.contentPackCode,
            version: descriptor.releaseVersion,
            status: 'INVALID_RELEASE',
            sourceKind: descriptor.contentPackCode ? 'CONTENT_PACK' : 'DATA_RELEASE',
            errorCode: error && (error.code || error.message)
        };
        let diagnostic = this.publicationDiagnostic(descriptor, release, undefined, undefined,
            error && (error.code || error.message), undefined, []);
        return { baselineCode: descriptor.code, releaseCode: release.releaseCode, releaseVersion: release.version,
            releaseStatus: release.status, readiness: 'BLOCKED',
            publicationDiagnostic: diagnostic,
            publicationDependencyGraph: this.publicationDependencyGraph(descriptor, release),
            lineage: { source: { releaseCode: release.releaseCode, releaseVersion: release.version,
                sourceVersion: descriptor.sourceVersion }, targetEvidenceError: error && (error.code || error.message) } };
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
    /** Builds the delegated human publication context for baseline lifecycle operations. */
    actorRequest: function (request, defaultReason) {
        let input = request.baseline || {};
        let requestedBy = String(input.requestedBy || '');
        if (!/^[A-Za-z0-9][A-Za-z0-9@._:-]{0,255}$/.test(requestedBy)) {
            throw new CLASSES.NodicsError('CMS_BASELINE_HUMAN_REQUIRED', 'A delegated human administrator identity is required');
        }
        let serviceAuth = request.authData || {};
        let permissions = ['publish.lifecycle.create', 'publish.lifecycle.view',
            'publish.lifecycle.validate', 'publish.lifecycle.requestApproval'];
        return Object.assign({}, request, { authData: Object.assign({}, serviceAuth, {
            tokenType: 'access',
            principalType: 'human',
            loginId: requestedBy,
            principalId: requestedBy,
            userGroups: ['runtimeConfigAdminUserGroup'],
            permissions: [...new Set([].concat(serviceAuth.permissions || [], permissions))],
            delegatedBy: serviceAuth.principalId || serviceAuth.code || serviceAuth.serviceId
        }), reason: input.reason || defaultReason,
        correlationId: input.correlationId || request.correlationId || request.requestId });
    },
    /** Derives a sanitized readiness projection from nImport and nPublish authorities. */
    status: async function (code, request) {
        this.assertStaged();
        let descriptor = this.descriptor(code);
        let release;
        try {
            release = await this.release(descriptor, request);
        } catch (error) {
            if (error && error.code === 'CMS_BASELINE_RELEASE_INVALID') return this.invalidReleaseStatus(descriptor, error);
            throw error;
        }
        let publication = await this.publication(descriptor, request);
        let state = publication && publication.state;
        let lastAudit = publication && Array.isArray(publication.auditTrail) && publication.auditTrail.length
            ? publication.auditTrail[publication.auditTrail.length - 1] : undefined;
        let target;
        let targetEvidenceError;
        if (publication && publication.targetVersion && SERVICE.DefaultCmsPublicationVersionProviderService &&
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
        let approvalDiagnostic = await this.approvalDiagnostic(publication, request);
        let approvalTask = approvalDiagnostic && approvalDiagnostic.taskCode ? {
            code: approvalDiagnostic.taskCode,
            status: approvalDiagnostic.taskStatus,
            assignee: approvalDiagnostic.assignee,
            queue: approvalDiagnostic.queue,
            requiresAssignee: approvalDiagnostic.status === 'TASK_ASSIGNEE_MISSING'
        } : undefined;
        let publicationDiagnostic = this.publicationDiagnostic(descriptor, release, publication, target,
            targetEvidenceError, approvalDiagnostic, transitions);
        let publicationDependencyGraph = this.publicationDependencyGraph(descriptor, release, publication, target,
            approvalDiagnostic);
        let readiness = state === 'ONLINE' ? 'READY' : state === 'WITHDRAWN' ? 'RETIRED' :
            state === 'ROLLED_BACK' ? 'ROLLED_BACK' : state === 'REJECTED' ? 'REJECTED' :
            state === 'FAILED' ? 'FAILED' : state ? 'PUBLICATION_PENDING' :
                release.status === 'RUNNING' ? 'IMPORTING' :
                release.status === 'CURRENT' ? 'IMPORTED' : 'NOT_IMPORTED';
        return { baselineCode: descriptor.code, releaseCode: release.releaseCode, releaseVersion: release.version,
            releaseStatus: release.status, readiness: readiness,
            review: this.review(descriptor, release, publication, request),
            publicationDiagnostic: publicationDiagnostic,
            publicationDependencyGraph: publicationDependencyGraph,
            publication: publication && { code: publication.code, state: publication.state, revision: publication.revision,
                targetVersion: publication.targetVersion, previousOnlineVersion: publication.previousOnlineVersion,
                sourceVersion: publication.sourceVersion, requestedBy: publication.requestedBy,
                workflowRef: publication.workflowRef || (state === 'PENDING_APPROVAL' &&
                    SERVICE.DefaultCmsPublicationWorkflowService.reference(publication)),
                correlationId: publication.correlationId,
                failureCode: state === 'FAILED' && lastAudit && lastAudit.details && lastAudit.details.failureCode,
                approvalDiagnostic: approvalDiagnostic,
                approvalTask: approvalTask },
            lineage: publication && { actor: publication.requestedBy,
                source: { releaseCode: release.releaseCode, releaseVersion: release.version,
                    sourceVersion: publication.sourceVersion },
            publication: { code: publication.code, workflowRef: publication.workflowRef,
                    correlationId: publication.correlationId, transitions: transitions,
                    diagnostic: publicationDiagnostic },
                target: target, targetEvidenceError: targetEvidenceError } };
    },
    /** Installs and submits one baseline without approving or deploying it. */
    initiate: async function (code, request) {
        this.assertStaged();
        let input = request.baseline || {};
        let descriptor = this.descriptor(code);
        let release = await this.release(descriptor, request);
        if (release.status !== 'CURRENT' && release.sourceKind === 'CONTENT_PACK') {
            try {
                await SERVICE.DefaultContentPackService.importPack(Object.assign({}, request,
                    { packCode: descriptor.contentPackCode, correlationId: request.correlationId || request.requestId }));
            } catch (error) {
                if (!this.isAlreadyCurrent(error)) throw error;
            }
        } else if (release.status !== 'CURRENT' || input.forceRefresh === true) {
            try {
                await SERVICE.DefaultDataReleaseService.execute({ tenant: request.tenant, authData: request.authData,
                    correlationId: request.correlationId || request.requestId,
                    releaseRequest: { dataType: descriptor.dataType || 'init', releaseCodes: [descriptor.releaseCode],
                        expectedReleases: { [descriptor.releaseCode]: descriptor.releaseVersion },
                        forceCurrent: input.forceRefresh === true } });
            } catch (error) {
                if (!this.isAlreadyCurrent(error)) throw error;
            }
        }
        let actorRequest = this.actorRequest(request, 'Administrator initiated CMS baseline publication');
        let mediaCodes = this.mediaCodes(input);
        let publicationInput = { code: this.publicationCode(descriptor), domain: 'cms', rootType: descriptor.rootType,
            rootCode: descriptor.rootCode, sourceVersion: String(descriptor.sourceVersion),
            siteCode: descriptor.rootCode, catalogCode: input.catalogCode };
        if (mediaCodes.length) publicationInput.mediaCodes = mediaCodes;
        let publication = await this.publication(descriptor, actorRequest);
        if (!publication) {
            publication = await SERVICE.DefaultPublicationLifecycleService.create(Object.assign({}, actorRequest,
                { publication: publicationInput }));
        }
        if (publication.state === 'ONLINE' && (release.status !== 'CURRENT' || input.forceRefresh === true)) {
            publication = await SERVICE.DefaultPublicationLifecycleService.validate(Object.assign({}, actorRequest,
                { publicationCode: publication.code, expectedRevision: publication.revision }));
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
        let actorRequest = this.actorRequest(request, 'Administrator rolled back CMS baseline publication');
        let publication = await this.publication(descriptor, actorRequest);
        if (!publication || publication.state !== 'ONLINE' || !publication.previousOnlineVersion) {
            throw new CLASSES.NodicsError('CMS_BASELINE_ROLLBACK_UNAVAILABLE', 'CMS baseline has no previous Online release to restore');
        }
        let rolledBack = await SERVICE.DefaultPublicationLifecycleService.rollback(Object.assign({}, actorRequest,
            { publicationCode: publication.code, expectedRevision: publication.revision }));
        return this.status(code, actorRequest).then(status => Object.assign({}, status, { publication: {
            code: rolledBack.code, state: rolledBack.state, revision: rolledBack.revision,
            correlationId: rolledBack.correlationId } }));
    },
    /** Retires current Online visibility through the domain withdrawal provider. */
    retire: async function (code, request) {
        this.assertStaged();
        let descriptor = this.descriptor(code);
        let actorRequest = this.actorRequest(request, 'Administrator retired CMS baseline publication');
        let publication = await this.onlinePublication(descriptor, actorRequest);
        if (!publication || publication.state !== 'ONLINE') {
            throw new CLASSES.NodicsError('CMS_BASELINE_RETIREMENT_UNAVAILABLE',
                'Only an Online CMS baseline can be retired; current state: ' + String(publication && publication.state || 'MISSING'));
        }
        let retired = await SERVICE.DefaultPublicationLifecycleService.withdraw(Object.assign({}, actorRequest,
            { publicationCode: publication.code, expectedRevision: publication.revision }));
        return this.status(code, actorRequest).then(status => Object.assign({}, status, { readiness: 'RETIRED', publication: {
            code: retired.code, state: retired.state, revision: retired.revision,
            correlationId: retired.correlationId } }));
    }
};
