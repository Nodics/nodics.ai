/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nodics.engagement/config/properties
 * @description Registers Customer Engagement as a discoverable preview capability without enabling business APIs or workflows.
 * @layer config
 * @owner nodics.engagement
 * @override Project, environment, server, node, tenant, or customer layers may refine presentation and feature policy without changing functional identity.
 */
module.exports = {
    engagement: {
        capabilities: {
            contactSubmission: true,
            customerReview: false,
            customerFeedback: false,
            testimonial: false,
            communication: false
        }
    }
};
