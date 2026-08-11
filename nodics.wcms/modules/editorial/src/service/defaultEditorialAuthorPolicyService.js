/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module editorial/service/DefaultEditorialAuthorPolicyService @description Validates Editorial author reference readiness. @layer service @owner editorial */
module.exports = { /** Returns whether an author can be assigned to publishable Editorial work. */ isAssignable: function (author) { return Boolean(author && author.code && author.displayName && author.status === 'ACTIVE'); } };
