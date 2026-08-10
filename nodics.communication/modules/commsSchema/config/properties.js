/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module commsSchema/config/properties @description Defines internal Communication schema access policies. @layer config @owner commsSchema @override Projects may narrow groups through layered configuration. */
module.exports = { schemaPolicies: { commsSchema: { operational: { accessGroups: { adminGroup: 10, serviceAccountUserGroup: 10, employeeUserGroup: 10 } }, customerOwned: { accessGroups: { adminGroup: 10, serviceAccountUserGroup: 10, employeeUserGroup: 10, customerUserGroup: 10 }, ownership: { enabled: true, ownerProperty: 'recipientId', bypassGroups: { adminGroup: true, serviceAccountUserGroup: true, employeeUserGroup: true }, subjectGroups: { customerUserGroup: true }, principalTypes: { customer: true } } } } } };
