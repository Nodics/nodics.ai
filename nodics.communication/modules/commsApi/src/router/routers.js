/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/** @module commsApi/src/router/routers @description Declares secured Communication customer, operator, and provider callback routes. @layer router @owner commsApi @override Provider modules may add secured callback mappings without exposing generic schema CRUD. */
module.exports = { communicationApi: {
    customer: { listInbox: { secured: true, authTokenTypes: ['access'], accessGroups: ['customerUserGroup'], permission: 'communication.customer.read', apiExposure: 'communicationCustomer', key: '/customer/communications', method: 'GET', controller: 'DefaultCommunicationApiController', operation: 'listInbox' } },
    operator: { retryDelivery: { secured: true, authTokenTypes: ['access'], accessGroups: ['employeeUserGroup'], permission: 'communication.delivery.retry', apiExposure: 'communicationManagement', key: '/operator/communications/:intentCode/retry', method: 'POST', controller: 'DefaultCommunicationApiController', operation: 'retryDelivery' } },
    integration: { receiveCallback: { secured: true, authTokenTypes: ['service'], accessGroups: ['serviceAccountUserGroup'], permission: 'communication.callback.receive', apiExposure: 'communicationIntegration', key: '/integrations/:providerCode/communication-callback', method: 'POST', controller: 'DefaultCommunicationApiController', operation: 'receiveCallback' } }
} };
