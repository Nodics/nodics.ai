/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module editorial/data/init/data/content/defaultEditorialContentTypeData @description Supplies the initial News and Blog content-type policies. @layer data @owner editorial */
module.exports = {
    record0: { code: 'NEWS', name: 'News', description: 'Time-sensitive factual editorial content.', active: true, workflowDefinitionCode: 'editorialApproval', requiredLocaleCodes: ['en'], validationRules: { requireAuthor: true, requireSite: true }, publicationPolicy: { approvalRequired: true } },
    record1: { code: 'BLOG', name: 'Blog', description: 'Long-form editorial and thought-leadership content.', active: true, workflowDefinitionCode: 'editorialApproval', requiredLocaleCodes: ['en'], validationRules: { requireAuthor: true, requireSite: true }, publicationPolicy: { approvalRequired: true } }
};
