/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module editorial/service/DefaultEditorialSearchProjectionService @description Projects activated Editorial delivery records into the configured Search boundary. @layer service @owner editorial */
module.exports = { /** Projects only after nPublish activation. */ projectActivation: function (publication, activation, request) { if (!SERVICE.DefaultSearchProjectionService) return Promise.resolve({ skipped: true }); return SERVICE.DefaultSearchProjectionService.project({ tenant: request.tenant, domain: 'editorial', rootCode: publication.rootCode, projectionCodes: activation.projectionCodes || [] }); } };
