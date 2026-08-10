/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module testimonial/src/service/defaultTestimonialPolicyService @description Enforces immutable evidence, scoped consent, publication eligibility, and safe public projection rules. @layer service @owner testimonial @override Policy may be strengthened through later configuration or service overrides. */
module.exports = {
    /** Creates a stable domain error. */
    error: function (code, message) { let error = new Error(message); error.code = code; return error; },
    /** Verifies the immutable candidate source has not been rewritten. */
    assertOriginalPreserved: function (current, patch) { if (patch.originalText !== undefined && patch.originalText !== current.originalText) throw this.error('ERR_TESTIMONIAL_00002', 'original testimonial evidence is immutable'); return true; },
    /** Verifies a consent record covers the requested target at the supplied time. */
    assertConsent: function (consent, target, now) {
        if (!consent || consent.status !== 'GRANTED') throw this.error('ERR_TESTIMONIAL_00003', 'active publication consent is required');
        now = new Date(now || Date.now()); if (consent.expiresAt && new Date(consent.expiresAt) <= now) throw this.error('ERR_TESTIMONIAL_00003', 'publication consent expired');
        if (!(consent.channels || []).includes(target.channel) || !(consent.regions || []).includes(target.region)) throw this.error('ERR_TESTIMONIAL_00003', 'publication target is outside consent scope');
        return true;
    },
    /** Verifies the version and consent are eligible for publication. */
    assertEligible: function (version, consent, target, now) { if (!version || version.status !== 'APPROVED') throw this.error('ERR_TESTIMONIAL_00004', 'approved editorial version is required'); this.assertConsent(consent, target, now); if ((version.mediaCodes || []).length && !consent.mediaAllowed) throw this.error('ERR_TESTIMONIAL_00003', 'media use is not consented'); return true; },
    /** Produces a bounded public projection without evidence or owner identifiers. */
    project: function (candidate, version, consent, target, now) { this.assertEligible(version, consent, target, now); return { candidateCode: candidate.code, versionCode: version.code, projectionVersion: version.version, publicText: version.sanitizedText, attribution: consent.attribution, disclosures: candidate.materialRelationship ? [candidate.materialRelationship] : [], channel: target.channel, region: target.region, locale: version.locale, wcmsPlacementCodes: target.wcmsPlacementCodes || [], status: target.scheduledAt ? 'SCHEDULED' : 'PREVIEW', scheduledAt: target.scheduledAt, expiresAt: target.expiresAt || consent.expiresAt, revision: 0, correlationId: target.correlationId || candidate.correlationId }; }
};
