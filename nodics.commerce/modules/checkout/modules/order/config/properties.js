/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module order/config/properties @description Defines Commerce capability and schema access policies. @layer config @owner order */
module.exports = {
    order: {
        enabled: true,
        lifecycleWorkflowDefinitions: {
            cancellation: { code: 'commerceOrderCancellation', version: '1', steps: ['ELIGIBILITY', 'APPROVAL_IF_REQUIRED', 'FULFILLMENT_INTENT', 'INVENTORY_DISPOSITION', 'PAYMENT_VOID_OR_REFUND', 'ORDER_PROJECTION'], makerChecker: true },
            return: { code: 'commerceOrderReturn', version: '1', steps: ['ELIGIBILITY', 'APPROVAL_IF_REQUIRED', 'RETURN_LOGISTICS', 'RECEIPT_AND_INSPECTION', 'INVENTORY_DISPOSITION', 'PAYMENT_REFUND', 'ORDER_PROJECTION'], makerChecker: true },
            refund: { code: 'commerceOrderRefund', version: '1', steps: ['ELIGIBILITY', 'APPROVAL_IF_REQUIRED', 'PAYMENT_REFUND', 'RECONCILIATION', 'ORDER_PROJECTION'], makerChecker: true }
        },
        compatibility: { legacyAliasesEnabled: true, aliasWindow: '2_MINOR_RELEASES_OR_180_DAYS' }
    },
    schemaPolicies: { order: {
        operational: { accessGroups: { adminGroup: 10, commerceOperatorUserGroup: 10, serviceAccountUserGroup: 10 } },
        tenantOwned: { accessGroups: { adminGroup: 10, commerceOperatorUserGroup: 10, serviceAccountUserGroup: 10 } },
        customerOwned: { accessGroups: { adminGroup: 10, commerceOperatorUserGroup: 10, serviceAccountUserGroup: 10, customerUserGroup: 10 }, ownership: { enabled: true, ownerProperty: 'ownerId', bypassGroups: { adminGroup: true, commerceOperatorUserGroup: true, serviceAccountUserGroup: true }, subjectGroups: { customerUserGroup: true }, principalTypes: { customer: true } } }
    } }
};
