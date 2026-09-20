/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module modules/nexus.web/data/sample-v001/content/records/engagement/nexusTestimonialProjectionData
 * @description Defines Kickoff project-owned data records for this module data pack.
 * @layer data
 * @owner nexus.web
 * @override Customer projects may extend or replace this artifact in their own project layer.
 */

/** @lifecycle VERSIONED_OPERATIONAL @destination ENGAGEMENT_ONLINE @owner testimonial */

/** @description Sanitized public testimonial projections for the Nexus reference site. */
module.exports = {
    record0: {
        code: 'nexus-testimonial-aarohi-web-en',
        active: true,
        tenant: 'default',
        candidateCode: 'nexus-testimonial-aarohi',
        versionCode: 'nexus-testimonial-aarohi-v1',
        projectionVersion: 1,
        publicText: 'Nodics gave our engineering teams a shared foundation without taking away their freedom to deliver domain-specific experiences.',
        attribution: { name: 'Aarohi Mehta', role: 'Director of Platform Engineering', organization: 'Illustrative profile' },
        avatarReferenceImageCode: 'nexusTestimonialAarohi',
        avatarAlt: 'Illustrative portrait of Aarohi Mehta',
        disclosures: ['Illustrative reference profile for local Nexus validation.'],
        channel: 'web',
        region: 'global',
        locale: 'en',
        wcmsPlacementCodes: ['nexusHomeTestimonials'],
        status: 'PUBLISHED',
        publishedAt: new Date('2026-08-11T00:00:00.000Z'),
        revision: 0,
        correlationId: 'nexus-testimonial-aarohi-published'
    },
    record1: {
        code: 'nexus-testimonial-marcus-web-en',
        active: true,
        tenant: 'default',
        candidateCode: 'nexus-testimonial-marcus',
        versionCode: 'nexus-testimonial-marcus-v1',
        projectionVersion: 1,
        publicText: 'The modular architecture made complex enterprise boundaries easier to understand, govern, and evolve across delivery teams.',
        attribution: { name: 'Marcus Reed', role: 'Enterprise Solutions Architect', organization: 'Illustrative profile' },
        avatarReferenceImageCode: 'nexusTestimonialMarcus',
        avatarAlt: 'Illustrative portrait of Marcus Reed',
        disclosures: ['Illustrative reference profile for local Nexus validation.'],
        channel: 'web',
        region: 'global',
        locale: 'en',
        wcmsPlacementCodes: ['nexusHomeTestimonials'],
        status: 'PUBLISHED',
        publishedAt: new Date('2026-08-11T00:00:00.000Z'),
        revision: 0,
        correlationId: 'nexus-testimonial-marcus-published'
    },
    record2: {
        code: 'nexus-testimonial-daniel-web-en',
        active: true,
        tenant: 'default',
        candidateCode: 'nexus-testimonial-daniel',
        versionCode: 'nexus-testimonial-daniel-v1',
        projectionVersion: 1,
        publicText: 'With Axis and AI-assisted workflows, our teams can move from configuration to a working customer journey with far greater clarity.',
        attribution: { name: 'Daniel Kim', role: 'Head of Commerce Technology', organization: 'Illustrative profile' },
        avatarReferenceImageCode: 'nexusTestimonialDaniel',
        avatarAlt: 'Illustrative portrait of Daniel Kim',
        disclosures: ['Illustrative reference profile for local Nexus validation.'],
        channel: 'web',
        region: 'global',
        locale: 'en',
        wcmsPlacementCodes: ['nexusHomeTestimonials'],
        status: 'PUBLISHED',
        publishedAt: new Date('2026-08-11T00:00:00.000Z'),
        revision: 0,
        correlationId: 'nexus-testimonial-daniel-published'
    },
    record3: {
        code: 'nexus-testimonial-sofia-web-en',
        active: true,
        tenant: 'default',
        candidateCode: 'nexus-testimonial-sofia',
        versionCode: 'nexus-testimonial-sofia-v1',
        projectionVersion: 1,
        publicText: 'Nodics helped us treat customer-facing experience, operations, and governance as one connected product instead of separate delivery islands.',
        attribution: { name: 'Sofia Alvarez', role: 'VP Digital Transformation', organization: 'Illustrative profile' },
        disclosures: ['Illustrative reference profile for local Nexus validation.'],
        channel: 'web',
        region: 'global',
        locale: 'en',
        wcmsPlacementCodes: ['nexusHomeTestimonials'],
        status: 'PUBLISHED',
        publishedAt: new Date('2026-08-11T00:00:00.000Z'),
        revision: 0,
        correlationId: 'nexus-testimonial-sofia-published'
    }
};
