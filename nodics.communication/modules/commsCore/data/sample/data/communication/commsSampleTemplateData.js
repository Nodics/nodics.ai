/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module commsCore/data/sample/communication/commsSampleTemplateData @description Provides optional engagement-facing Communication sample templates. @layer data @owner commsCore */
module.exports = {
    record0: {
        code: 'CONTACT_ACKNOWLEDGEMENT',
        tenant: 'default',
        purpose: 'TRANSACTIONAL',
        channels: ['EMAIL'],
        declaredVariables: ['reference'],
        currentVersion: 1,
        status: 'ACTIVE',
        correlationId: 'communication-sample-templates',
        revision: 1,
        active: true
    },
    record1: {
        code: 'FEEDBACK_ACKNOWLEDGEMENT',
        tenant: 'default',
        purpose: 'TRANSACTIONAL',
        channels: ['EMAIL'],
        declaredVariables: ['reference'],
        currentVersion: 1,
        status: 'ACTIVE',
        correlationId: 'communication-sample-templates',
        revision: 1,
        active: true
    },
    record2: {
        code: 'REVIEW_ACKNOWLEDGEMENT',
        tenant: 'default',
        purpose: 'TRANSACTIONAL',
        channels: ['EMAIL'],
        declaredVariables: ['reference'],
        currentVersion: 1,
        status: 'ACTIVE',
        correlationId: 'communication-sample-templates',
        revision: 1,
        active: true
    },
    record3: {
        code: 'TESTIMONIAL_CONSENT_REQUEST',
        tenant: 'default',
        purpose: 'CONSENT',
        channels: ['EMAIL'],
        declaredVariables: ['reference'],
        currentVersion: 1,
        status: 'ACTIVE',
        correlationId: 'communication-sample-templates',
        revision: 1,
        active: true
    }
};
