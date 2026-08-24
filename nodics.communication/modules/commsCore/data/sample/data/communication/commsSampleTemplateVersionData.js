/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module commsCore/data/sample/communication/commsSampleTemplateVersionData @description Provides optional versioned sample Communication template bodies. @layer data @owner commsCore */
module.exports = {
    record0: {
        code: 'CONTACT_ACKNOWLEDGEMENT:1:en:EMAIL',
        tenant: 'default',
        templateCode: 'CONTACT_ACKNOWLEDGEMENT',
        version: 1,
        locale: 'en',
        channel: 'EMAIL',
        subjectTemplate: 'We received {{reference}}',
        bodyTemplate: 'We received your request {{reference}} and will keep you updated.',
        checksum: '9d7378d3d458e4f2fcff4e0aa2cb37d11f504df139ad480238c385961937375e',
        status: 'ACTIVE',
        validatedAt: new Date('2026-08-24T00:00:00.000Z'),
        correlationId: 'communication-sample-templates',
        revision: 1,
        active: true
    },
    record1: {
        code: 'FEEDBACK_ACKNOWLEDGEMENT:1:en:EMAIL',
        tenant: 'default',
        templateCode: 'FEEDBACK_ACKNOWLEDGEMENT',
        version: 1,
        locale: 'en',
        channel: 'EMAIL',
        subjectTemplate: 'Feedback received {{reference}}',
        bodyTemplate: 'Thanks for sharing feedback {{reference}}. Our team will review it.',
        checksum: '7d6f650741c1920fabf629576c6a0405ee8d705dbf4d36add65a33d1d7c70e0e',
        status: 'ACTIVE',
        validatedAt: new Date('2026-08-24T00:00:00.000Z'),
        correlationId: 'communication-sample-templates',
        revision: 1,
        active: true
    },
    record2: {
        code: 'REVIEW_ACKNOWLEDGEMENT:1:en:EMAIL',
        tenant: 'default',
        templateCode: 'REVIEW_ACKNOWLEDGEMENT',
        version: 1,
        locale: 'en',
        channel: 'EMAIL',
        subjectTemplate: 'Review received {{reference}}',
        bodyTemplate: 'Thanks for sending review {{reference}}. It is now in the governed review flow.',
        checksum: '08c9739985d486a7da486c39927e73f4e7bdab66a58aeb824c9529e3c33a5a82',
        status: 'ACTIVE',
        validatedAt: new Date('2026-08-24T00:00:00.000Z'),
        correlationId: 'communication-sample-templates',
        revision: 1,
        active: true
    },
    record3: {
        code: 'TESTIMONIAL_CONSENT_REQUEST:1:en:EMAIL',
        tenant: 'default',
        templateCode: 'TESTIMONIAL_CONSENT_REQUEST',
        version: 1,
        locale: 'en',
        channel: 'EMAIL',
        subjectTemplate: 'Consent request {{reference}}',
        bodyTemplate: 'Please review the consent request {{reference}} before your testimonial is published.',
        checksum: '6ed2073da6e673973885256044789133fd2e3bd2d99561e84d399a525535bdc1',
        status: 'ACTIVE',
        validatedAt: new Date('2026-08-24T00:00:00.000Z'),
        correlationId: 'communication-sample-templates',
        revision: 1,
        active: true
    }
};
