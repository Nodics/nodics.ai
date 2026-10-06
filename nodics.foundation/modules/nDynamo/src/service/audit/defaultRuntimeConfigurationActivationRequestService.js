/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const crypto = require('crypto');

/**
 * @module dynamo/service/audit/DefaultRuntimeConfigurationActivationRequestService
 * @description Manages runtime configuration activation request lifecycle:
 * request, approve, reject, and activate approved schema, router, property,
 * and schema access-policy changes.
 * @layer service
 * @owner dynamo
 * @override Project modules may override this service to integrate enterprise
 * workflow engines, ticketing, approval matrices, or release governance while
 * preserving the control-plane request lifecycle contract.
 */
module.exports = {

    /**
     * Initializes the runtime activation request service.
     *
     * @param {Object} options Startup options.
     * @returns {Promise<boolean>} Resolves when initialization is complete.
     */
    init: function (options) {
        return Promise.resolve(true);
    },

    /**
     * Finalizes the runtime activation request service.
     *
     * @param {Object} options Startup options.
     * @returns {Promise<boolean>} Resolves when post-initialization is complete.
     */
    postInit: function (options) {
        return Promise.resolve(true);
    },

    /**
     * Creates a persisted activation request with captured preview impact.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Activation request response.
     */
    createActivationRequest: function (request) {
        return new Promise((resolve, reject) => {
            let payload = this.getPayload(request);
            this.prepareRequestPayload(request, payload)
                .then((prepared) => {
                    payload = prepared;
                    return this.previewActivationRequest(request, payload);
                })
                .then((preview) => {
                    if (payload.expectedPreviewDigest !== undefined &&
                        (typeof payload.expectedPreviewDigest !== 'string' ||
                         payload.expectedPreviewDigest !== this.createConfigurationDigest(preview))) {
                        throw new CLASSES.NodicsError('ERR_SYS_00002', 'Runtime configuration preview changed before submission');
                    }
                    let model = this.createRequestModel(
                        request,
                        payload,
                        preview,
                    );
                    this.persistRequestModel(request, model)
                        .then((success) => {
                            resolve({
                                code: 'SUC_SYS_00000',
                                message:
                                    'Runtime configuration activation request created successfully',
                                data: model,
                                result: success,
                            });
                        })
                        .catch((error) => {
                            reject(error);
                        });
                })
                .catch((error) => {
                    reject(error);
                });
        });
    },

    /** Resolves a durable rollback reference into a new approval-bound compensating proposal.
     * @param {Object} request Trusted tenant and actor.
     * @param {Object} payload Submitted request.
     * @returns {Promise<Object>} Prepared payload; never executes a rollback.
     */
    prepareRequestPayload: async function (request, payload) {
        if (payload.rollbackRevision === undefined) return payload;
        if (
            payload.configurationType !== 'propertyConfiguration' ||
            payload.configuration !== undefined ||
            !SERVICE.DefaultRuntimePropertyPersistenceService
        ) {
            throw new CLASSES.NodicsError(
                'ERR_SYS_00002',
                'Rollback requires a property revision without a caller-supplied patch',
            );
        }
        return {
            ...payload,
            configuration:
                await SERVICE.DefaultRuntimePropertyPersistenceService.prepareRollback(
                    request,
                    payload.rollbackRevision,
                ),
        };
    },

    /**
     * Approves a pending activation request.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Approval response.
     */
    approveActivationRequest: function (request) {
        return this.transitionActivationRequest(request, 'APPROVED', 'APPROVED');
    },

    /**
     * Rejects a pending activation request.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Rejection response.
     */
    rejectActivationRequest: function (request) {
        return this.transitionActivationRequest(request, 'REJECTED', 'REJECTED');
    },

    /**
     * Activates an approved runtime configuration request.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Activation response.
     */
    activateApprovedRequest: async function (request) {
        const activationRequest = await this.resolveActivationRequest(request);
        if (
            activationRequest.approvalStatus !== 'APPROVED' ||
            activationRequest.status !== 'APPROVED'
        ) {
            throw new CLASSES.NodicsError(
                'ERR_SYS_00002',
                'Activation request must be approved and unclaimed before activation',
            );
        }
        const actor = this.resolveRequestedBy(request);
        this.assertActivationSeparation(activationRequest, actor);
        if (
            request.scheduledActivation === true &&
            (activationRequest.active !== true ||
                activationRequest.configurationType !==
                    'propertyConfiguration' ||
                !this.isDueActivation(
                    activationRequest.notBefore,
                    new Date().toISOString(),
                ))
        ) {
            throw new CLASSES.NodicsError(
                'ERR_SYS_00002',
                'Scheduled request is no longer eligible',
            );
        }
        if (
            activationRequest.notBefore &&
            (!Number.isFinite(Date.parse(activationRequest.notBefore)) ||
                Date.parse(activationRequest.notBefore) > Date.now())
        ) {
            throw new CLASSES.NodicsError(
                'ERR_SYS_00002',
                'Activation request is not due',
            );
        }
        const claimed = await this.updateRequestState(
            request,
            activationRequest,
            {
                status: this.getActivationState('ACTIVATING'),
                activatedBy: actor,
            },
        );
        // Unknown owner or final-ack outcomes retain the claim; never replay automatically.
        const success = await this.activateConfiguration(request, claimed);
        const updatedRequest = await this.updateRequestState(request, claimed, {
            status: 'ACTIVATED',
        });
        return {
            code: 'SUC_SYS_00000',
            message:
                'Approved runtime configuration request activated successfully',
            data: updatedRequest,
            result: success,
        };
    },

    /**
     * Queries activation requests for the control-plane work queue.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Activation request query response.
     */
    getActivationRequests: function (request) {
        return new Promise((resolve, reject) => {
            let requestService = this.getActivationRequestModelService();
            if (!requestService || typeof requestService.get !== 'function') {
                reject(new CLASSES.NodicsError('ERR_SYS_00001', 'Configuration activation request service is not available'));
                return;
            }
            let query = this.prepareActivationRequestQuery(request);
            requestService.get({
                tenant: this.getTenant(request),
                authData: request.authData,
                query: query,
                searchOptions: request.searchOptions || this.prepareActivationRequestSearchOptions(request)
            }).then(success => {
                if (!success || !/^SUC_/.test(success.code || '') || !Array.isArray(success.result)) throw new CLASSES.NodicsError('ERR_SYS_00002', 'Activation request query was not acknowledged');
                resolve({
                    code: 'SUC_SYS_00000',
                    message: 'Runtime configuration activation requests fetched successfully',
                    data: success.result || [],
                    metadata: {
                        query: query,
                        count: success.result ? success.result.length : 0,
                        tenant: this.getTenant(request)
                    }
                });
            }).catch(error => {
                reject(error);
            });
        });
    },

    /** Dispatches a bounded due-property page when invoked by the existing CronJob target transport.
     * @param {Object} request Authenticated tenant-bound command, without client query overrides.
     * @returns {Promise<Object>} Content-free outcomes. Claimed/uncertain requests are never replayed.
     */
    activateDueRequests: async function (request) {
        const policy =
            (CONFIG.get('runtimePropertyGovernance') || {})
                .scheduledActivation || {};
        if (
            policy.enabled !== true ||
            !Number.isSafeInteger(policy.maximumBatch) ||
            policy.maximumBatch < 1 ||
            policy.maximumBatch > 100
        ) {
            throw new CLASSES.NodicsError(
                'ERR_SYS_00002',
                'Scheduled property activation is unavailable',
            );
        }
        const persistence = SERVICE.DefaultRuntimePropertyPersistenceService;
        if (!persistence || !persistence.policy().enabled) {
            throw new CLASSES.NodicsError(
                'ERR_SYS_00002',
                'Scheduled activation requires durable property persistence',
            );
        }
        persistence.scope(request);
        const actor = this.resolveRequestedBy(request);
        if (typeof actor !== 'string' || !actor.trim())
            throw new CLASSES.NodicsError(
                'ERR_AUTH_00003',
                'An authenticated scheduling actor is required',
            );
        if (Object.keys(this.getPayload(request)).length)
            throw new CLASSES.NodicsError(
                'ERR_SYS_00002',
                'Scheduled dispatch does not accept query or property overrides',
            );
        const now = new Date().toISOString();
        const success = await this.getActivationRequestModelService().get({
            tenant: request.tenant,
            authData: request.authData,
            query: {
                active: true,
                configurationType: 'propertyConfiguration',
                status: 'APPROVED',
                approvalStatus: 'APPROVED',
                notBefore: { $exists: true, $ne: null, $lte: new Date(now) },
            },
            searchOptions: {
                pageSize: policy.maximumBatch,
                pageNumber: 1,
                sort: { notBefore: 1, code: 1 },
            },
            options: { recursive: false },
        });
        if (
            !success ||
            !/^SUC_/.test(success.code || '') ||
            !Array.isArray(success.result) ||
            success.result.length > policy.maximumBatch ||
            success.result.some(
                (row) =>
                    !row ||
                    typeof row.code !== 'string' ||
                    !row.code ||
                    (row.tenant !== undefined &&
                        row.tenant !== request.tenant) ||
                    row.active !== true ||
                    row.configurationType !== 'propertyConfiguration' ||
                    row.status !== 'APPROVED' ||
                    row.approvalStatus !== 'APPROVED' ||
                    !this.isDueActivation(row.notBefore, now),
            ) ||
            new Set(success.result.map((row) => row.code)).size !==
                success.result.length
        ) {
            throw new CLASSES.NodicsError(
                'ERR_SYS_00002',
                'Scheduled activation inventory is invalid or unacknowledged',
            );
        }
        const results = [];
        for (const row of success.result) {
            try {
                await this.activateApprovedRequest({
                    tenant: request.tenant,
                    authData: request.authData,
                    autData: request.autData,
                    correlationId: request.correlationId,
                    scheduledActivation: true,
                    activationRequest: { activationRequestCode: row.code },
                });
                results.push({ code: row.code, activated: true });
            } catch {
                // The request owner retains its exact claim on uncertain execution.
                results.push({
                    code: row.code,
                    activated: false,
                    requiresReview: true,
                });
            }
        }
        return {
            code: 'SUC_SYS_00000',
            data: {
                checkedAt: now,
                tenant: request.tenant,
                results,
                limited: results.length === policy.maximumBatch,
            },
        };
    },

    /** Accepts generated database Date values and canonical JSON instants, never coercible or missing schedules.
     * @param {Date|string} value Persisted earliest activation.
     * @param {string} now Dispatcher observation instant.
     * @returns {boolean} Whether due and valid.
     */
    isDueActivation: function (value, now) {
        if (!(value instanceof Date) && typeof value !== 'string') return false;
        const instant =
            value instanceof Date ? value.getTime() : Date.parse(value);
        return (
            Number.isFinite(instant) &&
            (value instanceof Date ||
                new Date(instant).toISOString() === value) &&
            instant <= Date.parse(now)
        );
    },

    /** Reconciles an uncertain property activation from its acknowledged durable owner evidence without executing it again.
     * @param {Object} request Authenticated operator with activation permission and request identity.
     * @returns {Promise<Object>} Reconciled lifecycle receipt; missing evidence leaves the claim untouched.
     */
    reconcilePropertyActivation: async function (request) {
        const persistence = SERVICE.DefaultRuntimePropertyPersistenceService;
        if (!persistence || !persistence.policy().enabled)
            throw new CLASSES.NodicsError(
                'ERR_SYS_00002',
                'Durable property recovery is unavailable',
            );
        persistence.scope(request);
        const actor = this.resolveRequestedBy(request);
        if (typeof actor !== 'string' || !actor.trim())
            throw new CLASSES.NodicsError(
                'ERR_AUTH_00003',
                'An authenticated recovery actor is required',
            );
        const activation = await this.resolveActivationRequest(request);
        if (
            activation.configurationType !== 'propertyConfiguration' ||
            activation.approvalStatus !== 'APPROVED' ||
            !['ACTIVATING', 'ACTIVATED'].includes(activation.status) ||
            !activation.configuration ||
            activation.configurationDigest !==
                this.createConfigurationDigest(activation.configuration)
        ) {
            throw new CLASSES.NodicsError(
                'ERR_SYS_00002',
                'Property recovery requires an intact claimed approval',
            );
        }
        const current = await persistence.refresh(request);
        const evidence = current
            ? current.governedProperties.audit.filter(
                  (entry) => entry.activationRequestCode === activation.code,
              )
            : [];
        const match = evidence[0];
        if (
            evidence.length !== 1 ||
            match.actor !== activation.activatedBy ||
            match.approvedBy !== activation.approvedBy ||
            this.createConfigurationDigest(match.previousSnapshot) !==
                this.createConfigurationDigest(
                    activation.preview && activation.preview.previousSnapshot,
                ) ||
            this.createConfigurationDigest(match.nextSnapshot) !==
                this.createConfigurationDigest(
                    activation.preview && activation.preview.nextSnapshot,
                )
        ) {
            throw new CLASSES.NodicsError(
                'ERR_SYS_00002',
                'No exact committed property evidence is available; do not replay',
            );
        }
        const updated =
            activation.status === 'ACTIVATED'
                ? activation
                : await this.updateRequestState(request, activation, {
                      status: 'ACTIVATED',
                  });
        return {
            code: 'SUC_SYS_00000',
            data: {
                activationRequestCode: updated.code,
                status: updated.status,
                revision: updated.revision,
                committedRevision: match.revision,
                replayed: false,
            },
        };
    },

    /**
     * Transitions approval status for an activation request.
     *
     * @param {Object} request Nodics request context.
     * @param {string} approvalStatus New approval status.
     * @param {string} status New lifecycle status.
     * @returns {Promise<Object>} Transition response.
     */
    transitionActivationRequest: function (request, approvalStatus, status) {
        return new Promise((resolve, reject) => {
            this.resolveActivationRequest(request).then(activationRequest => {
                let payload = this.getPayload(request);
                let actor = this.resolveRequestedBy(request);
                try {
                    this.assertDecisionSeparation(activationRequest, actor);
                    if (activationRequest.status !== 'REQUESTED' || activationRequest.approvalStatus !== 'PENDING') {
                        throw new CLASSES.NodicsError('ERR_SYS_00002', 'Only a pending request can receive a decision');
                    }
                } catch (error) {
                    reject(error);
                    return;
                }
                let updatedRequest = Object.assign({}, activationRequest, {
                    approvalStatus: approvalStatus,
                    status: status,
                    approvedBy: actor,
                    approvalReason: payload.approvalReason || payload.reason
                });
                this.updateRequestState(request, activationRequest, updatedRequest).then(success => {
                    resolve({
                        code: 'SUC_SYS_00000',
                        message: 'Runtime configuration activation request ' + approvalStatus.toLowerCase() + ' successfully',
                        data: success,
                        result: success
                    });
                }).catch(error => {
                    reject(error);
                });
            }).catch(error => {
                reject(error);
            });
        });
    },

    /**
     * Runs preview for the requested runtime activation.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} payload Activation request payload.
     * @returns {Promise<Object>} Preview data.
     */
    previewActivationRequest: function (request, payload) {
        if (!SERVICE.DefaultRuntimeConfigurationPreviewService ||
            typeof SERVICE.DefaultRuntimeConfigurationPreviewService.previewActivation !== 'function') {
            return Promise.reject(new CLASSES.NodicsError('ERR_SYS_00001', 'Runtime configuration preview service is not available'));
        }
        return SERVICE.DefaultRuntimeConfigurationPreviewService.previewActivation({
            tenant: this.getTenant(request),
            authData: request.authData,
            autData: request.autData,
            correlationId: request.correlationId,
            preview: {
                configurationType: payload.configurationType,
                configurationCode: payload.configurationCode,
                moduleName: payload.moduleName,
                configuration: payload.configuration
            }
        }).then(success => success.data);
    },

    /**
     * Activates schema or router configuration for an approved request.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} activationRequest Activation request model.
     * @returns {Promise<Object>} Activation result.
     */
    activateConfiguration: function (request, activationRequest) {
        let activationContext = this.createActivationContext(request, activationRequest);
        if (activationRequest.configurationType === 'schemaConfiguration') {
            if (!SERVICE.DefaultSchemaConfigurationService ||
                typeof SERVICE.DefaultSchemaConfigurationService.handleSchemaUpdate !== 'function') {
                return Promise.reject(new CLASSES.NodicsError('ERR_SYS_00001', 'Schema configuration service is not available for activation request'));
            }
            return SERVICE.DefaultSchemaConfigurationService.handleSchemaUpdate(activationContext, [activationRequest.configurationCode]);
        }
        if (activationRequest.configurationType === 'routerConfiguration') {
            if (!SERVICE.DefaultRouterConfigurationService ||
                typeof SERVICE.DefaultRouterConfigurationService.registerRoutersFromDatabase !== 'function') {
                return Promise.reject(new CLASSES.NodicsError('ERR_SYS_00001', 'Router configuration service is not available for activation request'));
            }
            return SERVICE.DefaultRouterConfigurationService.registerRoutersFromDatabase(activationContext);
        }
        if (activationRequest.configurationType === 'propertyConfiguration') {
            if (!SERVICE.DefaultConfigurationService ||
                typeof SERVICE.DefaultConfigurationService.applyPropertyConfiguration !== 'function') {
                return Promise.reject(new CLASSES.NodicsError('ERR_SYS_00001', 'Property configuration service is not available for activation request'));
            }
            if (!activationRequest.configuration ||
                activationRequest.configurationDigest !== this.createConfigurationDigest(activationRequest.configuration)) {
                return Promise.reject(new CLASSES.NodicsError('ERR_SYS_00002', 'Approved property configuration payload failed integrity validation'));
            }
            return SERVICE.DefaultConfigurationService.applyPropertyConfiguration(
                activationContext,
                activationRequest.configuration,
                activationRequest.preview
            );
        }
        if (activationRequest.configurationType === 'schemaAccessPolicy') {
            return this.activateSchemaAccessPolicyConfiguration(request, activationRequest, activationContext);
        }
        return Promise.reject(new CLASSES.NodicsError('ERR_SYS_00002', 'Activation request is not supported for configuration type: ' + activationRequest.configurationType));
    },

    /**
     * Activates a governed schema/property access policy through the generated model service.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} activationRequest Approved activation request.
     * @param {Object} activationContext Runtime activation context.
     * @returns {Promise<Object>} Activation result.
     */
    activateSchemaAccessPolicyConfiguration: function (request, activationRequest, activationContext) {
        return new Promise((resolve, reject) => {
            let policyService = SERVICE.DefaultSchemaAccessPolicyService;
            if (!policyService || typeof policyService.save !== 'function') {
                reject(new CLASSES.NodicsError('ERR_SYS_00001', 'Schema access policy service is not available for activation request'));
                return;
            }
            if (!activationRequest.configuration ||
                activationRequest.configurationDigest !== this.createConfigurationDigest(activationRequest.configuration)) {
                reject(new CLASSES.NodicsError('ERR_SYS_00002', 'Approved schema access policy payload failed integrity validation'));
                return;
            }
            policyService.save({
                tenant: activationContext.tenant,
                authData: activationContext.authData,
                autData: activationContext.autData,
                model: activationRequest.configuration
            }).then(saveResult => {
                return this.recordSchemaAccessPolicyActivation(activationContext, activationRequest, 'SUCCESS').then(auditResult => {
                    resolve({
                        saveResult: saveResult,
                        auditResult: auditResult
                    });
                });
            }).catch(error => {
                this.recordSchemaAccessPolicyActivation(activationContext, activationRequest, 'FAILED', error).then(() => {
                    reject(error);
                });
            });
        });
    },

    /**
     * Records schema access-policy activation audit after governed save.
     *
     * @param {Object} activationContext Runtime activation context.
     * @param {Object} activationRequest Approved activation request.
     * @param {string} status Activation status.
     * @param {Error} [error] Activation error.
     * @returns {Promise<Object>} Audit result.
     */
    recordSchemaAccessPolicyActivation: function (activationContext, activationRequest, status, error) {
        let auditService = SERVICE.DefaultRuntimeConfigurationAuditService;
        if (!auditService || typeof auditService.recordActivation !== 'function') {
            return Promise.resolve(true);
        }
        let preview = activationRequest.preview || {};
        return auditService.recordActivation({
            configurationType: activationRequest.configurationType,
            configurationCode: activationRequest.configurationCode,
            moduleName: activationRequest.moduleName,
            action: 'activate',
            status: status,
            tenant: activationContext.tenant,
            requestedBy: activationRequest.requestedBy,
            approvedBy: activationRequest.approvedBy,
            approvalStatus: activationRequest.approvalStatus,
            approvalReason: activationRequest.approvalReason,
            riskLevel: activationRequest.riskLevel,
            activationRequestCode: activationRequest.code,
            correlationId: activationContext.correlationId,
            previousSnapshot: preview.previousSnapshot,
            nextSnapshot: preview.nextSnapshot,
            warnings: preview.warnings,
            error: error
        });
    },

    /**
     * Creates runtime activation context from approved request.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} activationRequest Activation request model.
     * @returns {Object} Activation context.
     */
    createActivationContext: function (request, activationRequest) {
        return {
            tenant: this.getTenant(request),
            runtimeActivationSource: 'approvedRequest',
            trustedRuntimeActivation: true,
            authData: request.authData,
            autData: request.autData,
            correlationId: request.correlationId || activationRequest.correlationId,
            activationRequestCode: activationRequest.code,
            activationRevision: activationRequest.revision,
            activationApproval: {
                approved: true,
                approvedBy: activationRequest.approvedBy,
                approvalReason: activationRequest.approvalReason,
                activationRequestCode: activationRequest.code
            },
            query: {
                code: activationRequest.configurationCode
            },
            event: {
                data: {
                    models: [activationRequest.configurationCode],
                    activationApproval: {
                        approved: true,
                        approvedBy: activationRequest.approvedBy,
                        approvalReason: activationRequest.approvalReason,
                        activationRequestCode: activationRequest.code
                    }
                }
            }
        };
    },

    /**
     * Builds the activation request model from payload and preview.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} payload Request payload.
     * @param {Object} preview Preview data.
     * @returns {Object} Activation request model.
     */
    createRequestModel: function (request, payload, preview) {
        let requestedBy = this.resolveRequestedBy(request);
        this.assertActor(requestedBy);
        const requestEnterpriseCode = request.authData?.enterpriseCode || request.authData?.entCode;
        if (requestEnterpriseCode !== undefined && (typeof requestEnterpriseCode !== 'string' || !requestEnterpriseCode.trim() || requestEnterpriseCode.length > 128)) throw new CLASSES.NodicsError('ERR_SYS_00002', 'Trusted request enterprise is invalid');
        if (payload.notBefore !== undefined && (typeof payload.notBefore !== 'string' ||
            !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/.test(payload.notBefore) ||
            !Number.isFinite(Date.parse(payload.notBefore)) || new Date(payload.notBefore).toISOString() !==
                (payload.notBefore.includes('.') ? payload.notBefore : payload.notBefore.replace('Z', '.000Z')))) {
            throw new CLASSES.NodicsError('ERR_SYS_00002', 'notBefore must be a valid UTC ISO timestamp');
        }
        let model = {
            code: payload.code || this.createActivationRequestCode(payload),
            active: true,
            configurationType: payload.configurationType,
            configurationCode: payload.configurationCode || preview.configurationCode,
            moduleName: payload.moduleName || preview.moduleName,
            requestedBy: requestedBy,
            requestEnterpriseCode: requestEnterpriseCode,
            requestReason: payload.requestReason || payload.reason,
            approvalStatus: 'PENDING',
            riskLevel: preview.destructive ? 'HIGH' : 'LOW',
            preview: preview,
            status: 'REQUESTED',
            revision: 0,
            lifecycle: [{ status: 'REQUESTED', actor: requestedBy, at: new Date().toISOString() }],
            notBefore: payload.notBefore === undefined ? undefined : new Date(payload.notBefore).toISOString(),
            correlationId: request.correlationId
        };
        if (payload.configurationType === 'propertyConfiguration' || payload.configurationType === 'schemaAccessPolicy') {
            model.configuration = payload.configuration;
            model.configurationDigest = this.createConfigurationDigest(payload.configuration);
        }
        return model;
    },

    /**
     * Creates an order-independent digest binding approval to an exact patch.
     *
     * @param {Object} configuration Property patch.
     * @returns {string} SHA-256 digest.
     */
    createConfigurationDigest: function (configuration) {
        let canonicalize = value => {
            if (Array.isArray(value)) return value.map(canonicalize);
            if (value && typeof value === 'object') {
                return Object.keys(value).sort().reduce((result, key) => {
                    result[key] = canonicalize(value[key]);
                    return result;
                }, {});
            }
            return value;
        };
        return crypto.createHash('sha256').update(JSON.stringify(canonicalize(configuration || {}))).digest('hex');
    },

    /**
     * Resolves an activation request by code.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Activation request model.
     */
    resolveActivationRequest: function (request) {
        return new Promise((resolve, reject) => {
            let requestCode = this.getActivationRequestCode(request);
            if (
                typeof requestCode !== 'string' ||
                !requestCode.trim() ||
                requestCode.length > 256
            ) {
                reject(
                    new CLASSES.NodicsError(
                        'ERR_SYS_00001',
                        'activationRequestCode is required',
                    ),
                );
                return;
            }
            let requestService = this.getActivationRequestModelService();
            if (!requestService || typeof requestService.get !== 'function') {
                reject(
                    new CLASSES.NodicsError(
                        'ERR_SYS_00001',
                        'Configuration activation request service is not available',
                    ),
                );
                return;
            }
            requestService
                .get({
                    tenant: this.getTenant(request),
                    authData: request.authData,
                    query: {
                        code: requestCode,
                    },
                    searchOptions: { pageSize: 2, pageNumber: 1 },
                    options: { recursive: false },
                })
                .then((success) => {
                    if (
                        !success ||
                        !/^SUC_/.test(success.code || '') ||
                        !Array.isArray(success.result) ||
                        success.result.length > 1 ||
                        success.result.some(
                            (row) =>
                                !row ||
                                row.code !== requestCode ||
                                (row.tenant !== undefined &&
                                    row.tenant !== this.getTenant(request)),
                        )
                    ) {
                        throw new CLASSES.NodicsError(
                            'ERR_SYS_00002',
                            'Activation request lookup was invalid or unacknowledged',
                        );
                    }
                    let activationRequest = success.result[0];
                    if (!activationRequest) {
                        reject(
                            new CLASSES.NodicsError(
                                'ERR_SYS_00001',
                                'Activation request not found for code: ' +
                                    requestCode,
                            ),
                        );
                    } else {
                        resolve(activationRequest);
                    }
                })
                .catch((error) => {
                    reject(error);
                });
        });
    },

    /**
     * Builds query filters for activation request lookup.
     *
     * @param {Object} request Nodics request context.
     * @returns {Object} Query filters.
     */
    prepareActivationRequestQuery: function (request) {
        let filters = this.getPayload(request);
        let query = {};
        [
            'code',
            'configurationType',
            'configurationCode',
            'moduleName',
            'requestedBy',
            'requestEnterpriseCode',
            'approvalStatus',
            'approvedBy',
            'riskLevel',
            'status',
            'correlationId',
            'activationLogCode'
        ].forEach(property => {
            if (filters[property]) {
                query[property] = filters[property];
            }
        });
        if (filters.activationRequestCode && !query.code) {
            query.code = filters.activationRequestCode;
        }
        return query;
    },

    /**
     * Builds generated-service search options for activation request queries.
     *
     * @param {Object} request Nodics request context.
     * @returns {Object} Search options.
     */
    prepareActivationRequestSearchOptions: function (request) {
        let filters = this.getPayload(request);
        let options = {};
        if (filters.limit) {
            options.limit = Number(filters.limit);
        }
        if (filters.skip) {
            options.skip = Number(filters.skip);
        }
        if (filters.projection) {
            options.projection = filters.projection;
        }
        options.sort = filters.sort || {
            creationTime: -1
        };
        return options;
    },

    /**
     * Persists an activation request model.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} model Activation request model.
     * @returns {Promise<Object>} Persistence result.
     */
    persistRequestModel: function (request, model) {
        let requestService = this.getActivationRequestModelService();
        if (!requestService || typeof requestService.save !== 'function') {
            return Promise.reject(new CLASSES.NodicsError('ERR_SYS_00001', 'Configuration activation request service is not available'));
        }
        return requestService.save({
            tenant: this.getTenant(request),
            authData: request.authData,
            model: model
        }).then(response => {
            const record = response && response.result;
            if (!response || !/^SUC_/.test(response.code || '') || !record || Array.isArray(record) || record.code !== model.code || record.revision !== 0) {
                throw new CLASSES.NodicsError('ERR_SYS_00001', 'Activation request persistence was not acknowledged; inspect before retrying');
            }
            return response;
        });
    },

    /** Resolves loader-visible lifecycle vocabulary with a source fallback for isolated consumers. @param {string} key State name. @returns {string} Stable wire key. */
    getActivationState: function (key) {
        const states = typeof ENUMS !== 'undefined' && ENUMS.RuntimeActivationState;
        if (states && states[key]) return states[key].key;
        if (require('../../utils/enums').RuntimeActivationState.definition.includes(key)) return key;
        throw new CLASSES.NodicsError('ERR_SYS_00002', 'Unsupported activation state');
    },

    /** Commits one lifecycle transition and its audit in an exact-revision generated update. Unknown acknowledgements are never retried. @param {Object} request Trusted context. @param {Object} current Reviewed request. @param {Object} changes Owner-controlled transition. @returns {Promise<Object>} Acknowledged next request. */
    updateRequestState: async function (request, current, changes) {
        const service = this.getActivationRequestModelService();
        if (!service || typeof service.update !== 'function' || !Number.isSafeInteger(current.revision) || current.revision < 0 || current.revision >= Number.MAX_SAFE_INTEGER || !Array.isArray(current.lifecycle) || current.lifecycle.length > 8) {
            throw new CLASSES.NodicsError('ERR_SYS_00001', 'Revision-managed activation persistence is required; recreate legacy requests');
        }
        const actor = this.resolveRequestedBy(request);
        this.assertActor(actor);
        const next = Object.assign({}, current, changes, {
            revision: current.revision + 1,
            lifecycle: current.lifecycle.concat([{ status: changes.status, actor, at: new Date().toISOString() }])
        });
        const response = await service.update({
            tenant: this.getTenant(request), authData: request.authData,
            query: { code: current.code, revision: current.revision, status: current.status, approvalStatus: current.approvalStatus },
            model: { status: next.status, approvalStatus: next.approvalStatus, approvedBy: next.approvedBy,
                approvalReason: next.approvalReason, activatedBy: next.activatedBy, revision: next.revision, lifecycle: next.lifecycle }
        });
        if (!response || !/^SUC_/.test(response.code || '') || !response.result || response.result.acknowledged === false || response.result.matchedCount !== 1) {
            throw new CLASSES.NodicsError('ERR_SYS_00002', 'Activation transition was not acknowledged or is stale; inspect before retrying');
        }
        return next;
    },

    /**
     * Returns the generated activation request model service.
     *
     * @returns {Object|undefined} Generated service.
     */
    getActivationRequestModelService: function () {
        return SERVICE.DefaultConfigurationActivationRequestService;
    },

    /**
     * Returns payload from request body, query, or direct request fields.
     *
     * @param {Object} request Nodics request context.
     * @returns {Object} Payload map.
     */
    getPayload: function (request) {
        let body = request.httpRequest && request.httpRequest.body ? request.httpRequest.body : {};
        let query = request.httpRequest && request.httpRequest.query ? request.httpRequest.query : {};
        return Object.assign({}, request.activationRequest || {}, query, body);
    },

    /**
     * Returns activation request code from request.
     *
     * @param {Object} request Nodics request context.
     * @returns {string|undefined} Activation request code.
     */
    getActivationRequestCode: function (request) {
        let payload = this.getPayload(request);
        return payload.activationRequestCode || payload.code;
    },

    /**
     * Creates a unique activation request code.
     *
     * @param {Object} payload Request payload.
     * @returns {string} Request code.
     */
    createActivationRequestCode: function (payload) {
        return [
            'activationRequest',
            payload.configurationType || 'runtimeConfiguration',
            payload.configurationCode || 'unknown',
            Date.now()
        ].join('_');
    },

    /**
     * Resolves tenant for activation request persistence.
     *
     * @param {Object} request Nodics request context.
     * @returns {string} Tenant code.
     */
    getTenant: function (request) {
        return request.tenant || CONFIG.get('defaultTenant') || 'default';
    },

    /**
     * Extracts a user/process identifier from a runtime request.
     *
     * @param {Object} request Runtime request.
     * @returns {string|undefined} Requesting user or process.
     */
    resolveRequestedBy: function (request) {
        let authData = request && (request.authData || request.autData);
        if (!authData) {
            return undefined;
        }
        return authData.loginId || authData.serviceId || authData.sub || authData.code || authData.userId || authData.uid || authData.email;
    },

    /**

     * Retrieves separation policy information.

     *

     * @returns {*} Method result.

     */

    getSeparationPolicy: function () {
        let governance = CONFIG.get('identityGovernance') || {};
        return governance.separationOfDuties || {};
    },

    /**

     * Executes assert actor behavior.

     *

     * @param {*} actor Method input.

     * @returns {*} Method result.

     */

    assertActor: function (actor) {
        if (!actor && this.getSeparationPolicy().requireActor !== false) {
            throw new CLASSES.NodicsError('ERR_AUTH_00003', 'An authenticated actor is required for governed runtime changes');
        }
    },

    /**

     * Ensures a governed runtime decision has an authenticated actor.

     *

     * @param {*} activationRequest Method input.

     * @param {*} actor Method input.

     * @returns {*} Method result.

     */

    assertDecisionSeparation: function (activationRequest, actor) {
        this.assertActor(actor);
    },

    /**

     * Ensures a governed runtime activation has an authenticated actor.

     *

     * @param {*} activationRequest Method input.

     * @param {*} actor Method input.

     * @returns {*} Method result.

     */

    assertActivationSeparation: function (activationRequest, actor) {
        this.assertActor(actor);
    }
};
