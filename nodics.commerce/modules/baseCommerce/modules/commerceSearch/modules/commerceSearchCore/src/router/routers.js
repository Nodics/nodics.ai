/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module commerceSearchCore/router/routers @description Declares Commerce Search operator publication route. @layer router @owner commerceSearchCore */
module.exports = { commerceSearchCore: { operatorPublication: {
    publish: {
        secured: true,
        authTokenTypes: ['access'],
        accessGroups: ['employeeUserGroup'],
        permission: 'commerce.search.publish',
        apiExposure: 'commerceManagement',
        key: '/operator/commerce-search/publication/rules',
        method: 'POST',
        controller: 'DefaultCommerceSearchPublicationController',
        operation: 'publish'
    }
} } };
