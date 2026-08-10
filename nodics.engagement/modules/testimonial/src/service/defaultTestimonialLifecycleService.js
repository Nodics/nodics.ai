/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module testimonial/src/service/defaultTestimonialLifecycleService @description Orchestrates candidate editing, confirmation, approval, publication, withdrawal, expiry, and repair while preserving source evidence. @layer service @owner testimonial @override Later modules may extend configured workflow without weakening consent or emergency takedown. */
module.exports = {
    /** Returns effective testimonial configuration. */
    getConfiguration: function () { return typeof CONFIG !== 'undefined' && CONFIG.get('testimonial') || {}; },
    /** Returns the active policy service. */
    policy: function () { return SERVICE.DefaultTestimonialPolicyService; },
    /** Verifies optimistic revision and applies a candidate transition. */
    transitionCandidate: function (candidate, patch, expectedRevision) { this.policy().assertOriginalPreserved(candidate, patch); if (Number(expectedRevision) !== Number(candidate.revision || 0)) throw this.policy().error('ERR_TESTIMONIAL_00005', 'testimonial revision conflict'); return Object.assign({}, candidate, patch, { revision: Number(candidate.revision || 0) + 1 }); },
    /** Creates the next immutable editorial version. */
    createVersion: function (candidate, previousVersions, command) { let next = Math.max(0, ...(previousVersions || []).map(item => Number(item.version || 0))) + 1; return { tenant: candidate.tenant, candidateCode: candidate.code, version: next, locale: command.locale || 'en', variant: command.variant || 'SHORT_QUOTE', editorialText: command.editorialText, sanitizedText: command.sanitizedText || command.editorialText, mediaCodes: command.mediaCodes || [], status: command.requireCustomerConfirmation === false ? 'PENDING_APPROVAL' : 'PENDING_CUSTOMER_CONFIRMATION', correlationId: command.correlationId || candidate.correlationId, createdAt: command.now || new Date() }; },
    /** Records customer confirmation of exactly one immutable editorial version. */
    confirmVersion: function (version, command) { if (version.status !== 'PENDING_CUSTOMER_CONFIRMATION') throw this.policy().error('ERR_TESTIMONIAL_00006', 'version is not awaiting customer confirmation'); return Object.assign({}, version, { status: 'CUSTOMER_CONFIRMED', customerConfirmedAt: command.now || new Date() }); },
    /** Records brand or legal approval for a confirmed or directly approvable version. */
    approveVersion: function (version, command) { if (!['CUSTOMER_CONFIRMED', 'PENDING_APPROVAL'].includes(version.status)) throw this.policy().error('ERR_TESTIMONIAL_00006', 'version is not eligible for approval'); return Object.assign({}, version, { status: 'APPROVED', approvedBy: command.actorId, approvedAt: command.now || new Date() }); },
    /** Builds one eligible sanitized projection for nPublish handoff. */
    prepareProjection: function (candidate, version, consent, target, now) { return this.policy().project(candidate, version, consent, target, now); },
    /** Marks one projection published after nPublish reports Online activation. */
    publish: function (projection, publication, now) { if (!publication || publication.state !== 'ONLINE') throw this.policy().error('ERR_TESTIMONIAL_00007', 'nPublish Online evidence is required'); return Object.assign({}, projection, { status: 'PUBLISHED', publicationRequestCode: publication.code, publishedAt: now || new Date(), revision: Number(projection.revision || 0) + 1 }); },
    /** Immediately hides every active projection after withdrawal or emergency takedown. */
    hideAll: function (projections, reason, now) { return (projections || []).map(item => ['PUBLISHED', 'SCHEDULED', 'PREVIEW'].includes(item.status) ? Object.assign({}, item, { status: reason === 'CONSENT_WITHDRAWN' ? 'WITHDRAWN' : 'HIDDEN', hiddenAt: now || new Date(), revision: Number(item.revision || 0) + 1 }) : item); },
    /** Restores a hidden projection only after current eligibility is re-established. */
    restore: function (projection, version, consent, now) { this.policy().assertEligible(version, consent, projection, now); if (projection.status !== 'HIDDEN') throw this.policy().error('ERR_TESTIMONIAL_00006', 'only hidden projections can be restored'); return Object.assign({}, projection, { status: 'PREVIEW', hiddenAt: undefined, revision: Number(projection.revision || 0) + 1 }); },
    /** Expires due active projections deterministically. */
    expireDue: function (projections, now) { now = new Date(now || Date.now()); return (projections || []).map(item => item.expiresAt && new Date(item.expiresAt) <= now && ['PUBLISHED', 'SCHEDULED', 'PREVIEW'].includes(item.status) ? Object.assign({}, item, { status: 'EXPIRED', hiddenAt: now, revision: Number(item.revision || 0) + 1 }) : item); },
    /** Reports drift between consent authority and public visibility for repair workers. */
    reconcile: function (projections, consents, now) { let consentByCandidate = new Map((consents || []).map(item => [item.candidateCode, item])); let repaired = this.expireDue(projections, now).map(item => { let consent = consentByCandidate.get(item.candidateCode); return ['PUBLISHED', 'SCHEDULED', 'PREVIEW'].includes(item.status) && (!consent || consent.status !== 'GRANTED') ? Object.assign({}, item, { status: 'WITHDRAWN', hiddenAt: new Date(now || Date.now()), revision: Number(item.revision || 0) + 1 }) : item; }); return { examined: (projections || []).length, repaired: repaired.filter((item, index) => item !== projections[index]).length, projections: repaired }; }
};
