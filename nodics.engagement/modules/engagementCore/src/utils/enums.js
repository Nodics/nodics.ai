/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module engagementCore/src/utils/enums @description Defines loader-compatible provider-neutral Engagement enum contributions. @layer utility @owner engagementCore @override Later modules may add supported values without redefining meanings. */
module.exports = {
    EngagementProcessingStatus: { definition: ['RECEIVED', 'VALIDATING', 'ACCEPTED', 'TRIAGED', 'ASSIGNED', 'IN_PROGRESS', 'WAITING_CUSTOMER', 'WAITING_INTERNAL', 'ON_HOLD', 'ACTIONED', 'RESOLVED', 'CLOSED', 'REJECTED', 'SPAM', 'DUPLICATE', 'ARCHIVED'] },
    EngagementConsentStatus: { definition: ['NOT_REQUIRED', 'PENDING', 'GRANTED', 'DENIED', 'WITHDRAWN', 'EXPIRED'] },
    EngagementConsentAction: { definition: ['CAPTURE', 'GRANT', 'DENY', 'WITHDRAW', 'EXPIRE'] },
    EngagementAssignmentStatus: { definition: ['UNASSIGNED', 'ASSIGNED', 'CLAIMED', 'REASSIGNED', 'RELEASED', 'COMPLETED'] },
    EngagementClassificationSource: { definition: ['RULE', 'OPERATOR', 'IMPORT', 'EXTERNAL', 'AI'] },
    EngagementPublicationEligibility: { definition: ['NOT_EVALUATED', 'ELIGIBLE', 'INELIGIBLE', 'WITHDRAWN'] },
    EngagementIntegrationAuthorityMode: { definition: ['ENGAGEMENT', 'EXTERNAL_CASE'] },
    EngagementIntegrationStatus: { definition: ['PENDING', 'IN_PROGRESS', 'SUCCEEDED', 'FAILED', 'RETRY_PENDING', 'DEAD_LETTER', 'RECONCILED'] },
    EngagementFormStatus: { definition: ['DRAFT', 'VALIDATED', 'ACTIVE', 'RETIRED'] },
    EngagementChannel: { definition: ['WEB', 'MOBILE', 'API', 'BACKOFFICE', 'IMPORT', 'INTEGRATION'] }
};
