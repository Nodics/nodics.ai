/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/** @module engagementApi/src/service/defaultEngagementDomainGatewayService @description Fail-closed port replaced by owning domain modules; prevents API-to-persistence coupling. @layer service @owner engagementApi @override Domain modules implement only the operations they own through later loader precedence. */
module.exports = {
    /** Handles contact within the module-owned contract. */
    contact: function (operation, request) { let service = typeof SERVICE !== 'undefined' && SERVICE.DefaultContactSubmissionApiService; return service && typeof service[operation] === 'function' ? service[operation](request) : this.unavailable(); },
    /** Dispatches one request to the testimonial-owned API service. */
    testimonial: function (operation, request) { let service = typeof SERVICE !== 'undefined' && SERVICE.DefaultTestimonialApiService; return service && typeof service[operation] === 'function' ? service[operation](request) : this.unavailable(); },
    /** Dispatches one request to the customerReview-owned API service. */
    review: function (operation, request) { let service = typeof SERVICE !== 'undefined' && SERVICE.DefaultCustomerReviewApiService; return service && typeof service[operation] === 'function' ? service[operation](request) : this.unavailable(); },
    /** Dispatches one request to the customerFeedback-owned API service. */
    feedback: function (operation, request) { let service = typeof SERVICE !== 'undefined' && SERVICE.DefaultCustomerFeedbackApiService; return service && typeof service[operation] === 'function' ? service[operation](request) : this.unavailable(); },
    /** Dispatches one request to Engagement Core unified operations. */
    operations: function (operation, request) { let service = typeof SERVICE !== 'undefined' && SERVICE.DefaultEngagementOperationsApiService; return service && typeof service[operation] === 'function' ? service[operation](request) : this.unavailable(); },
    /** Handles unavailable within the module-owned contract. */
    unavailable: function () { let error = new Error('engagement domain operation is unavailable'); error.code = 'ERR_ENG_API_00005'; return Promise.reject(error); },
    /** Handles get active form within the module-owned contract. */
    getActiveForm: function (request) { return this.contact('getActiveForm', request); }, submitContact: function (request) { return this.contact('submit', request); },
    /** Handles list own submissions within the module-owned contract. */
    listOwnSubmissions: function (request) { return this.contact('listOwnSubmissions', request); }, getOwnSubmission: function (request) { return this.contact('getOwnSubmission', request); },
    /** Handles list submissions within the module-owned contract. */
    listSubmissions: function (request) { return this.contact('listSubmissions', request); }, getSubmission: function (request) { return this.contact('getSubmission', request); },
    /** Handles act on contact within the module-owned contract. */
    actOnContact: function (request) { return this.contact('act', request); }, runHandoffRecovery: function (request) { return this.contact('runHandoffRecovery', request); }, retryHandoff: function (request) { return this.contact('retryHandoff', request); }, reconcileHandoff: function (request) { return this.contact('reconcileHandoff', request); },
    /** Lists published testimonial projections. */
    listTestimonials: function (request) { return this.testimonial('listPublished', request); },
    /** Submits one testimonial candidate to the testimonial domain. */
    submitTestimonialCandidate: function (request) { return this.testimonial('submitCandidate', request); },
    /** Gets customer-owned testimonial consent. */
    getOwnTestimonialConsent: function (request) { return this.testimonial('getOwnConsent', request); },
    /** Withdraws customer-owned testimonial consent. */
    withdrawOwnTestimonialConsent: function (request) { return this.testimonial('withdrawOwnConsent', request); },
    /** Executes an operator testimonial action. */
    actOnTestimonial: function (request) { return this.testimonial('act', request); }, receiveCallback: function () { return this.unavailable(); }
    , submitReview: function (request) { return this.review('submit', request); }
    , listOwnReviews: function (request) { return this.review('listOwn', request); }
    , getOwnReview: function (request) { return this.review('getOwn', request); }
    , withdrawOwnReview: function (request) { return this.review('withdrawOwn', request); }
    , reportReviewAbuse: function (request) { return this.review('reportAbuse', request); }
    , moderateReview: function (request) { return this.review('moderate', request); }
    , previewCresMigration: function (request) { return this.review('previewMigration', request); }
    , listReviews: function (request) { return this.review('listPublished', request); }
    , getReviewAggregate: function (request) { return this.review('getAggregate', request); }
    , voteReviewHelpfulness: function (request) { return this.review('voteHelpfulness', request); }
    , getOwnReviewRequest: function (request) { return this.review('getOwnRequest', request); }
    , startReviewSession: function (request) { return this.review('startSession', request); }
    , createReviewRequest: function (request) { return this.review('createRequest', request); }
    , importSyndicatedReview: function (request) { return this.review('importSyndicated', request); }
    , submitFeedback: function (request) { return this.feedback('submit', request); }
    , listOwnFeedback: function (request) { return this.feedback('listOwn', request); }
    , listFeedback: function (request) { return this.feedback('list', request); }
    , actOnFeedback: function (request) { return this.feedback('act', request); }
    , classifyFeedback: function (request) { return this.feedback('classify', request); }
    , deriveFeedbackInsight: function (request) { return this.feedback('deriveInsight', request); }
    , listUnifiedQueue: function (request) { return this.operations('listQueue', request); }
    , getEngagementDashboard: function (request) { return this.operations('dashboard', request); }
    , previewEngagementBatch: function (request) { return this.operations('batchPreview', request); }
    , previewEngagementExport: function (request) { return this.operations('exportPreview', request); }
    , previewEngagementRepair: function (request) { return this.operations('repairPreview', request); }
    , executeEngagementBatch: function (request) { return this.operations('executeBatch', request); }
    , executeEngagementExport: function (request) { return this.operations('executeExport', request); }
    , executeEngagementRepair: function (request) { return this.operations('executeRepair', request); }
    , executeEngagementPrivacy: function (request) { return SERVICE.DefaultEngagementPrivacyOperationsService.execute(request); }
};
