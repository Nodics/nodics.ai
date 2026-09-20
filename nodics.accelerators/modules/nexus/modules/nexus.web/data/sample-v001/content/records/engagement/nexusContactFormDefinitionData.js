/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module modules/nexus.web/data/sample-v001/content/records/engagement/nexusContactFormDefinitionData
 * @description Defines Kickoff project-owned data records for this module data pack.
 * @layer data
 * @owner nexus.web
 * @override Customer projects may extend or replace this artifact in their own project layer.
 */

/** @lifecycle VERSIONED_OPERATIONAL @destination ENGAGEMENT_ONLINE @owner engagementCore */

/** @description Nexus public contact form definition owned by Engagement. */
module.exports = {
    record0: {
        code: 'nexus-contact',
        active: true,
        tenant: 'default',
        submissionType: 'CONTACT',
        targetCapability: 'contactSubmission',
        status: 'ACTIVE',
        currentVersion: 1,
        sites: ['nexusCorporateSite'],
        locales: ['en'],
        channels: ['web'],
        accessibilityPolicyCode: 'wcag-aa',
        validationPolicyCode: 'contactSubmission.default',
        correlationId: 'nexus-contact-form-definition-v1'
    }
};
