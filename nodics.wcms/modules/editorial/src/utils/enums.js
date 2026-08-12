/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module editorial/src/utils/enums
 * @description Enum definition registry for this boundary.
 * @layer definition
 * @owner generated
 * @override Later active modules may extend or replace this registry through Nodics layering.
 */
module.exports = {
    EDITORIAL_CONTENT_TYPES: { definition: ['NEWS', 'BLOG'] },
    EDITORIAL_ARTICLE_STATUSES: { definition: ['DRAFT', 'READY', 'IN_REVIEW', 'CHANGES_REQUESTED', 'APPROVED', 'PUBLISHED', 'WITHDRAWN', 'ARCHIVED'] },
    EDITORIAL_LOCALIZATION_STATUSES: { definition: ['DRAFT', 'READY'] },
    EDITORIAL_AUTHOR_STATUSES: { definition: ['DRAFT', 'ACTIVE', 'INACTIVE'] },
    EDITORIAL_READINESS_STATUSES: { definition: ['READY', 'BLOCKED'] },
    EDITORIAL_PUBLICATION_STATUSES: { definition: ['STAGED', 'PUBLISHED', 'SUPERSEDED', 'WITHDRAWN', 'FAILED'] }
};
