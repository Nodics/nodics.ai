/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
const crypto = require('crypto');
const UTILS = require('../utils/utils');
/** @module contactSubmission/src/service/defaultContactSubmissionApiService @description Implements the contact vertical slice behind the Engagement API gateway. @layer service @owner contactSubmission @override Later modules may replace repositories and adapters while preserving Core intake and security contracts. */
module.exports = {
    /** Handles assert enabled within the module-owned contract. */
    assertEnabled: function () { let engagement = CONFIG.get('engagement') || {}; if (!(engagement.capabilities && engagement.capabilities.contactSubmission === true)) { let error = new Error('contact submission is disabled'); error.code = 'ERR_CONTACT_00006'; throw error; } },
    /** Handles context within the module-owned contract. */
    context: function () { let engagement = CONFIG.get('engagement') || {}; return { enabled: engagement.capabilities && engagement.capabilities.contactSubmission === true, configuration: CONFIG.get('contactSubmission') || {}, validation: SERVICE.DefaultContactValidationService, routing: SERVICE.DefaultContactRoutingService, lifecycle: SERVICE.DefaultContactLifecycleService, coreIntake: SERVICE.DefaultEngagementIntakeService, coreValidation: SERVICE.DefaultEngagementValidationService, coreProtection: SERVICE.DefaultEngagementProtectionService, engagementRepository: SERVICE.DefaultContactEngagementRepositoryService, contactRepository: SERVICE.DefaultContactRequestRepositoryService, handoffRepository: SERVICE.DefaultContactHandoffRepositoryService, handoff: SERVICE.DefaultContactHandoffDispatchService }; },
    /** Handles submit within the module-owned contract. */
    submit: async function (request, context) {
        context = context || this.context(); if (context.enabled !== true) { let error = new Error('contact submission is disabled'); error.code = 'ERR_CONTACT_00006'; throw error; } let data = context.validation.validate(request, context.configuration); let now = UTILS.now(request);
        let ownerId = request.authData && (request.authData.principalId || request.authData.customerCode) || 'guest:' + crypto.createHash('sha256').update(data.contactEmail).digest('hex').slice(0, 24);
        let contactCode = request.contactCode || crypto.randomUUID();
        let coreResult = await context.coreIntake.submit(Object.assign({}, request, { submissionType: 'CONTACT', domainType: 'CONTACT', domainCode: contactCode, channel: request.channel || 'WEB', source: request.source || 'CONTACT_FORM', retentionPolicyCode: request.retentionPolicyCode || context.configuration.retentionPolicyCode, payload: data, ownerId: ownerId }), { validationService: context.coreValidation, protectionService: context.coreProtection, configuration: CONFIG.get('engagementCore') || {}, repository: context.engagementRepository, riskAdapter: context.riskAdapter });
        if (coreResult.duplicate) return context.contactRepository.findByEngagementSubmissionCode(request.tenant, coreResult.submission.code).then(contact => ({ contact: contact, duplicate: true, referenceCode: contact.code }));
        let routing = context.routing.route(data, context.configuration.routing, now); let guest = ownerId.startsWith('guest:');
        let model = Object.assign({}, data, routing, { code: contactCode, tenant: request.tenant, engagementSubmissionCode: coreResult.submission.code, ownerId: ownerId, verificationStatus: guest && context.configuration.verification.guestRequired ? 'PENDING' : 'NOT_REQUIRED', status: guest && context.configuration.verification.guestRequired ? 'VERIFICATION_PENDING' : 'OPEN', revision: 0, retentionPolicyCode: request.retentionPolicyCode || context.configuration.retentionPolicyCode, correlationId: request.correlationId, submittedAt: now });
        let contact = await context.contactRepository.create(model); let process = await context.handoff.dispatch('PROCESS', contact, context.processAdapter, Object.assign({}, request, { processDefinitionCode: context.configuration.processDefinitionCode }));
        if (context.handoffRepository) process = await context.handoffRepository.create(process);
        return { contact: contact, duplicate: false, referenceCode: contact.code, verificationRequired: model.verificationStatus === 'PENDING', handoff: process };
    },
    /** Handles get active form within the module-owned contract. */
    getActiveForm: function (request) { this.assertEnabled(); return SERVICE.DefaultContactFormQueryService.getActiveForm(request); },
    /** Handles list own submissions within the module-owned contract. */
    listOwnSubmissions: function (request) { this.assertEnabled(); return SERVICE.DefaultContactRequestRepositoryService.list(request); },
    /** Handles get own submission within the module-owned contract. */
    getOwnSubmission: function (request) { this.assertEnabled(); return SERVICE.DefaultContactRequestRepositoryService.get(request); },
    /** Handles list submissions within the module-owned contract. */
    listSubmissions: function (request) { this.assertEnabled(); return SERVICE.DefaultContactRequestRepositoryService.list(request); },
    /** Handles get submission within the module-owned contract. */
    getSubmission: function (request) { this.assertEnabled(); return SERVICE.DefaultContactRequestRepositoryService.get(request); },
    /** Handles act within the module-owned contract. */
    act: function (request) { this.assertEnabled(); return SERVICE.DefaultContactOperatorService.act(request); },
    /** Handles run handoff recovery within the module-owned contract. */
    runHandoffRecovery: function (request) { this.assertEnabled(); return SERVICE.DefaultContactHandoffRecoveryService.run(request); },
    /** Handles retry handoff within the module-owned contract. */
    retryHandoff: function (request) { this.assertEnabled(); return SERVICE.DefaultContactHandoffRecoveryService.retry(request); },
    /** Handles reconcile handoff within the module-owned contract. */
    reconcileHandoff: function (request) { this.assertEnabled(); return SERVICE.DefaultContactHandoffRecoveryService.reconcile(request); }
};
