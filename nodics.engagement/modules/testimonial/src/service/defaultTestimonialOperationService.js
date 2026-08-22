/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
const crypto = require('crypto');
/** @module testimonial/src/service/defaultTestimonialOperationService @description Implements bounded public, customer, and operator testimonial use cases without exposing generated schema CRUD. @layer service @owner testimonial @override Later modules may extend actions through secured gateway contracts. */
module.exports = {
    /** Normalizes one public testimonial intake field. */
    text: function (value) { return String(value || '').trim(); },
    /** Creates a stable anonymous owner key for public testimonial intake. */
    publicOwnerId: function (email, request) { let source = this.text(email) || this.text(request.correlationId) || crypto.randomUUID(); return 'public:' + crypto.createHash('sha256').update(source.toLowerCase()).digest('hex').slice(0, 24); },
    /** Returns testimonial configuration with safe defaults. */
    configuration: function () { return typeof CONFIG !== 'undefined' && CONFIG.get ? CONFIG.get('testimonial') || {} : {}; },
    /** Accepts a public testimonial candidate for Axis curation without publishing it. */
    submitCandidate: async function (request) {
        let payload = request.payload || {};
        let originalText = this.text(payload.originalText || payload.testimonial || payload.message);
        let email = this.text(payload.contactEmail || payload.email);
        let configuration = this.configuration();
        let maximumTextLength = Number(configuration.intake && configuration.intake.publicCandidateMaximumTextLength || 1000);
        if (!originalText) throw SERVICE.DefaultTestimonialPolicyService.error('ERR_TESTIMONIAL_00009', 'testimonial text is required');
        if (originalText.length > maximumTextLength) throw SERVICE.DefaultTestimonialPolicyService.error('ERR_TESTIMONIAL_00010', 'testimonial text exceeds configured public intake length');
        let now = new Date();
        let candidate = await SERVICE.DefaultTestimonialRepositoryService.save('testimonialCandidate', request.tenant, {
            tenant: request.tenant,
            ownerId: this.publicOwnerId(email, request),
            sourceType: 'DIRECT',
            sourceModule: 'engagementApi',
            sourceRecordType: 'PUBLIC_TESTIMONIAL_INTAKE',
            originalText: originalText,
            provenance: {
                contactEmail: email,
                contactName: this.text(payload.name || payload.contactName),
                organization: this.text(payload.organization || payload.company),
                role: this.text(payload.role),
                sourcePage: this.text(payload.sourcePage || 'nexus-contact'),
                channel: this.text(request.channel || payload.channel || 'WEB')
            },
            evidenceReferences: [],
            materialRelationship: this.text(payload.materialRelationship),
            status: 'CANDIDATE',
            revision: 0,
            correlationId: request.correlationId,
            capturedAt: now
        }, request.authData);
        return { referenceCode: candidate.code, status: candidate.status, verificationRequired: true };
    },
    /** Returns active public projections for one explicit channel, region, and locale. */
    listPublished: function (request) { let query = request.query || {}; return SERVICE.DefaultTestimonialRepositoryService.list('testimonialProjection', request.tenant, { status: 'PUBLISHED', channel: query.channel, region: query.region, locale: query.locale || 'en' }, undefined, query.limit); },
    /** Returns one customer-owned consent record. */
    getOwnConsent: async function (request) { let principalId = request.principalId || request.authData && (request.authData.principalId || request.authData.code || request.authData.loginId); let record = await SERVICE.DefaultTestimonialRepositoryService.get('testimonialConsent', request.tenant, request.consentCode, request.authData); return record && record.ownerId === principalId ? record : undefined; },
    /** Withdraws customer consent and synchronously removes every active public projection. */
    withdrawOwnConsent: async function (request) { let consent = await this.getOwnConsent(request); if (!consent) { let error = new Error('testimonial consent not found'); error.code = 'ERR_TESTIMONIAL_00001'; throw error; } let now = new Date(); consent = Object.assign({}, consent, { status: 'WITHDRAWN', withdrawnAt: now }); await SERVICE.DefaultTestimonialRepositoryService.save('testimonialConsent', request.tenant, consent, request.authData); let projections = await SERVICE.DefaultTestimonialRepositoryService.list('testimonialProjection', request.tenant, { candidateCode: consent.candidateCode }, undefined, 100); let hidden = SERVICE.DefaultTestimonialLifecycleService.hideAll(projections, 'CONSENT_WITHDRAWN', now); await Promise.all(hidden.filter((item, index) => item !== projections[index]).map(item => SERVICE.DefaultTestimonialRepositoryService.save('testimonialProjection', request.tenant, item))); return { consentCode: consent.code, status: consent.status, hiddenCount: hidden.filter(item => item.status === 'WITHDRAWN').length, withdrawnAt: now }; },
    /** Executes a secured operator testimonial action. */
    act: async function (request) { let action = String(request.actionCode || '').toUpperCase(); if (action === 'EMERGENCY_HIDE') { let items = await SERVICE.DefaultTestimonialRepositoryService.list('testimonialProjection', request.tenant, { candidateCode: request.testimonialCode }, request.authData, 100); let hidden = SERVICE.DefaultTestimonialLifecycleService.hideAll(items, 'EMERGENCY', new Date()); await Promise.all(hidden.filter((item, index) => item !== items[index]).map(item => SERVICE.DefaultTestimonialRepositoryService.save('testimonialProjection', request.tenant, item, request.authData))); return { testimonialCode: request.testimonialCode, status: 'HIDDEN', hiddenCount: hidden.filter(item => item.status === 'HIDDEN').length }; } if (action === 'RECONCILE') { let items = await SERVICE.DefaultTestimonialRepositoryService.list('testimonialProjection', request.tenant, { candidateCode: request.testimonialCode }, request.authData, 100); let consents = await SERVICE.DefaultTestimonialRepositoryService.list('testimonialConsent', request.tenant, { candidateCode: request.testimonialCode }, request.authData, 100); let result = SERVICE.DefaultTestimonialLifecycleService.reconcile(items, consents, new Date()); await Promise.all(result.projections.filter((item, index) => item !== items[index]).map(item => SERVICE.DefaultTestimonialRepositoryService.save('testimonialProjection', request.tenant, item, request.authData))); return result; } let error = new Error('unsupported testimonial action'); error.code = 'ERR_TESTIMONIAL_00006'; throw error; },
    /** Executes a purpose-bound privacy operation on one testimonial candidate. */ privacy: async function (request) { let repository = SERVICE.DefaultTestimonialRepositoryService; let record = await repository.get('testimonialCandidate', request.tenant, request.domainCode, request.authData); if (!record) throw SERVICE.DefaultTestimonialPolicyService.error('ERR_TESTIMONIAL_00001', 'testimonial candidate not found'); let command = Object.assign({}, request.payload, { actorId: request.authData && (request.authData.principalId || request.authData.code), domainType: 'TESTIMONIAL', correlationId: request.correlationId }); if (request.payload.operation === 'EXPORT') return { record: record, result: SERVICE.DefaultEngagementPrivacyService.exportRecord(record, command, ['code', 'sourceType', 'originalText', 'status', 'capturedAt']) }; let result = SERVICE.DefaultEngagementPrivacyService.anonymize(record, command, { redactFields: ['originalText'], clearArrayFields: ['evidenceReferences'], removeFields: ['provenance'] }); if (result.changed) result.record = await repository.save('testimonialCandidate', request.tenant, result.record, request.authData); return { record: record, result: result }; }
};
