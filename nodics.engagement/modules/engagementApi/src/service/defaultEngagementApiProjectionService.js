/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/** @module engagementApi/src/service/defaultEngagementApiProjectionService @description Produces strict allow-listed API DTOs that cannot leak operational records. @layer service @owner engagementApi @override Later modules may add projection fields only through reviewed configuration and tests. */
module.exports = {
    /** Handles project within the module-owned contract. */
    project: function (value, fields) { return (fields || []).reduce((result, field) => { if (value && value[field] !== undefined) result[field] = value[field]; return result; }, {}); },
    /** Handles project many within the module-owned contract. */
    projectMany: function (values, fields) { return (values || []).map(value => this.project(value, fields)); }
};
