/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module modules/nexus.web/data/sample-v001/content/records/engagement/nexusContactFormVersionData
 * @description Defines Kickoff project-owned data records for this module data pack.
 * @layer data
 * @owner nexus.web
 * @override Customer projects may extend or replace this artifact in their own project layer.
 */

/** @lifecycle VERSIONED_OPERATIONAL @destination ENGAGEMENT_ONLINE @owner engagementCore */

/** @description Active Nexus public contact form version owned by Engagement. */
module.exports = {
    record0: {
        code: 'nexus-contact-v1',
        active: true,
        tenant: 'default',
        definitionCode: 'nexus-contact',
        version: 1,
        status: 'ACTIVE',
        structure: {
            fields: [
                { name: 'subject', label: 'Subject', type: 'text', required: true },
                { name: 'contactEmail', label: 'Business email', type: 'email', required: true },
                { name: 'contactPhone', label: 'Phone', type: 'tel', required: false },
                { name: 'type', label: 'Conversation type', type: 'text', required: false },
                { name: 'message', label: 'Message', type: 'textarea', required: true }
            ]
        },
        checksum: 'nexus-contact-v1-fields',
        validatedAt: new Date('2026-08-11T00:00:00.000Z'),
        activatedAt: new Date('2026-08-11T00:00:00.000Z'),
        correlationId: 'nexus-contact-form-version-v1'
    }
};
