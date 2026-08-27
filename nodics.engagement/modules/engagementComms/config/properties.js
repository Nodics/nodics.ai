/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module engagementComms/config/properties
 * @description Reserves the layered configuration boundary for engagementComms; no active business defaults are enabled.
 * @layer config
 * @owner engagementComms
 * @override Project, environment, server, node, tenant, or customer layers may override these defaults through Nodics configuration layering.
 */
module.exports = { engagementComms: { enabled: true, acknowledgementTemplates: { CONTACT: 'CONTACT_ACKNOWLEDGEMENT', FEEDBACK: 'FEEDBACK_ACKNOWLEDGEMENT', REVIEW: 'REVIEW_ACKNOWLEDGEMENT', TESTIMONIAL: 'TESTIMONIAL_CONSENT_REQUEST' }, allowedPurposes: ['TRANSACTIONAL', 'SERVICE', 'CONSENT'], defaultChannel: 'EMAIL' } };
