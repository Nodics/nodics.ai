/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module testimonial/src/service/defaultTestimonialPublicationAdapterService @description Bridges eligible testimonial projections to nPublish while keeping generic publication state in nPublish. @layer service @owner testimonial @override Projects may replace reference resolution but must preserve immutable versions and synchronous hide semantics. */
module.exports = {
    /** Returns one immutable testimonial projection to nPublish. */
    getVersion: function (publication, request) { return SERVICE.DefaultTestimonialRepositoryService.get('testimonialProjection', request.tenant, publication.sourceVersion, request.authData).then(value => { if (!value) { let error = new Error('testimonial projection not found'); error.code = 'ERR_TESTIMONIAL_00001'; throw error; } return Object.assign({ version: value.code }, value); }); },
    /** Returns the current Online testimonial projection when one exists. */
    getOnlineVersion: function (publication, request) { return SERVICE.DefaultTestimonialRepositoryService.list('testimonialProjection', request.tenant, { candidateCode: publication.rootCode, status: 'PUBLISHED' }, request.authData, 1).then(items => items[0]); },
    /** Activates the immutable projection; domain persistence is completed after nPublish becomes Online. */
    activate: function (publication) { return Promise.resolve({ version: publication.sourceVersion }); },
    /** Resolves external-owned WCMS and Media references without loading their records. */
    resolveDependencies: function (publication, version) { return [].concat(version.wcmsPlacementCodes || []).map(code => ({ type: 'WCMS_PLACEMENT', code: code })); },
    /** Validates that only an eligible non-public terminal projection enters nPublish. */
    validate: function (publication, version) { return Promise.resolve({ valid: ['PREVIEW', 'SCHEDULED'].includes(version.status), projectionVersion: version.projectionVersion }); },
    /** Records no duplicate generic lifecycle state after activation. */
    afterActivate: function () { return Promise.resolve(true); },
    /** Records no duplicate generic lifecycle state after rollback. */
    afterRollback: function () { return Promise.resolve(true); }
};
