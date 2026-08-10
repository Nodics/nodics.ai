/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module contactSubmission/src/service/defaultContactFormQueryService @description Reads only active contact form versions through Core-generated services. @layer service @owner contactSubmission @override Later modules may select site/locale variants while requiring ACTIVE state. */
module.exports = { getActiveForm: function (request) { return SERVICE.DefaultEngagementFormVersionService.get({ tenant: request.tenant, authData: { userGroups: ['serviceAccountUserGroup'] }, query: { tenant: request.tenant, definitionCode: request.definitionCode, status: 'ACTIVE' } }).then(response => (response.result || [])[0]); } };
