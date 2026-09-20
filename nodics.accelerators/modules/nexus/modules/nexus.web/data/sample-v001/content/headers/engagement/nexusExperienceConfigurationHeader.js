/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module modules/nexus.web/data/sample-v001/content/headers/engagement/nexusExperienceConfigurationHeader
 * @description Defines Kickoff project-owned import header records for this data pack.
 * @layer data-header
 * @owner nexus.web
 * @override Customer projects may extend or replace this artifact in their own project layer.
 */

/** @description Versioned operational Nexus form definitions and sanitized testimonial projections installed only through Engagement services. */
module.exports = {
    engagementCore: {
        nexusContactFormDefinitionData: { options: { enabled: true, schemaName: 'engagementFormDefinition', operation: 'saveAll', dataFilePrefix: 'nexusContactFormDefinitionData', userGroups: ['adminGroup'] }, query: { code: '$code' } },
        nexusContactFormVersionData: { options: { enabled: true, schemaName: 'engagementFormVersion', operation: 'saveAll', dataFilePrefix: 'nexusContactFormVersionData', userGroups: ['adminGroup'] }, query: { code: '$code' } }
    },
    testimonial: {
        nexusTestimonialProjectionData: { options: { enabled: true, schemaName: 'testimonialProjection', operation: 'saveAll', dataFilePrefix: 'nexusTestimonialProjectionData', userGroups: ['adminGroup'] }, query: { code: '$code' } }
    }
};
