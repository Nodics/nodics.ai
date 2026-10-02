/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module commsCore/data/sample-v002/commsSampleTemplateData @description Declares governed resource adoption references; presentation is module-owned. @owner commsCore @layer data */
module.exports = {
  record0: {
    code: "CONTACT_ACKNOWLEDGEMENT",
    tenant: "default",
    purpose: "TRANSACTIONAL",
    channels: ["EMAIL"],
    declaredVariables: ["reference"],
    sourceModules: ["contactSubmission"],
    currentVersion: 2,
    status: "ACTIVE",
    correlationId: "communication-resource-migration",
    revision: 1,
    active: true,
  },
  record1: {
    code: "FEEDBACK_ACKNOWLEDGEMENT",
    tenant: "default",
    purpose: "TRANSACTIONAL",
    channels: ["EMAIL"],
    declaredVariables: ["reference"],
    sourceModules: ["customerFeedback"],
    currentVersion: 2,
    status: "ACTIVE",
    correlationId: "communication-resource-migration",
    revision: 1,
    active: true,
  },
  record2: {
    code: "REVIEW_ACKNOWLEDGEMENT",
    tenant: "default",
    purpose: "TRANSACTIONAL",
    channels: ["EMAIL"],
    declaredVariables: ["reference"],
    sourceModules: ["customerReview"],
    currentVersion: 2,
    status: "ACTIVE",
    correlationId: "communication-resource-migration",
    revision: 1,
    active: true,
  },
  record3: {
    code: "TESTIMONIAL_CONSENT_REQUEST",
    tenant: "default",
    purpose: "CONSENT",
    channels: ["EMAIL"],
    declaredVariables: ["reference"],
    sourceModules: ["testimonial"],
    currentVersion: 2,
    status: "ACTIVE",
    correlationId: "communication-resource-migration",
    revision: 1,
    active: true,
  },
};
