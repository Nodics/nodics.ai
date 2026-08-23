/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics source-available software. See root LICENSE. */
/** @module paymentCore/service/DefaultPaymentCoreBackofficeCapabilityService @description Publishes Payment-owned BackOffice operations and reconciliation workspaces. @layer service @owner paymentCore */
module.exports = {
    /** Registers Payment Core as the BackOffice capability provider for payment and reconciliation workspaces. */
    init: function () {
        SERVICE.DefaultModuleRegistrationAgentService.registerBackofficeCapabilityProvider('paymentCore', this);
        return Promise.resolve(true);
    },
    /** Completes the provider lifecycle after registration without additional startup work. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns the Payment BackOffice capability descriptor, navigation entries, and presentations. */
    getCapability: function () {
        let d = SERVICE.DefaultBackofficeCapabilityDefinitionService;
        let group = { id: 'payment-operations', label: 'Payment Operations', order: 1200 };
        let txColumns = { defaultColumns: ['code', 'orderCode', 'cartCode', 'status', 'currency', 'totalAmount', 'revision', 'occurredAt'], hiddenFields: ['ownerId', 'idempotencyKey', 'correlationId', 'evidence'] };
        let recColumns = { defaultColumns: ['code', 'orderCode', 'status', 'revision', 'occurredAt'], hiddenFields: ['ownerId', 'idempotencyKey', 'correlationId', 'evidence'] };
        let item = (id, label, route, schemaName, order, permission, summary, presentation, state) => d.workbench({
            id: id,
            label: label,
            route: route,
            moduleName: 'paymentCore',
            schemaName: schemaName,
            order: order,
            permission: permission,
            summary: summary,
            group: group,
            presentation: presentation,
            featureState: state
        });
        return d.capability({
            capabilityId: 'commerce-payment',
            displayName: 'Payment Operations',
            category: 'commerce',
            icon: 'commerce',
            navigation: [
                item('payment-operations', 'Payment Workspace', '/commerce/payments', 'paymentTransaction', 1200, 'commerce.payment.read', 'Review transactions, authorizations, captures, voids, refunds, methods, providers, reconciliation, disputes, exceptions, audit, and insights.', txColumns),
                item('payment-transactions', 'Payment Transactions', '/commerce/payments/transactions', 'paymentTransaction', 1210, 'commerce.payment.read', 'Inspect provider-safe payment transaction evidence.', txColumns),
                item('payment-authorizations', 'Authorizations', '/commerce/payments/authorizations', 'paymentTransaction', 1220, 'commerce.payment.read', 'Planned authorization workspace.', txColumns, 'DISABLED'),
                item('payment-captures', 'Captures', '/commerce/payments/captures', 'paymentTransaction', 1230, 'commerce.payment.read', 'Planned capture workspace.', txColumns, 'DISABLED'),
                item('payment-voids-reversals', 'Voids and Reversals', '/commerce/payments/voids', 'paymentTransaction', 1240, 'commerce.payment.read', 'Planned void and reversal workspace.', txColumns, 'DISABLED'),
                item('refund-execution', 'Refund Execution', '/commerce/payments/refunds', 'paymentTransaction', 1250, 'commerce.payment.read', 'Planned refund execution workspace.', txColumns, 'DISABLED'),
                item('payment-methods', 'Payment Methods', '/commerce/payments/methods', 'paymentTransaction', 1260, 'commerce.payment.read', 'Planned payment-method workspace.', txColumns, 'DISABLED'),
                item('payment-providers', 'Payment Providers', '/commerce/payments/providers', 'paymentTransaction', 1270, 'commerce.payment.read', 'Planned payment-provider workspace without secret exposure.', txColumns, 'DISABLED'),
                item('payment-reconciliation', 'Reconciliation and Settlement', '/commerce/payments/reconciliation', 'paymentReconciliation', 1280, 'commerce.payment.reconcile', 'Reconcile provider outcomes without exposing tokens or secrets.', recColumns),
                item('payment-disputes-chargebacks', 'Disputes and Chargebacks', '/commerce/payments/disputes', 'paymentReconciliation', 1290, 'commerce.payment.reconcile', 'Planned disputes and chargebacks workspace.', recColumns, 'DISABLED'),
                item('payment-exceptions-recovery', 'Payment Exceptions and Recovery', '/commerce/payments/exceptions', 'paymentReconciliation', 1295, 'commerce.payment.reconcile', 'Planned payment exceptions and recovery workspace.', recColumns, 'DISABLED'),
                item('payment-audit-insights', 'Payment Audit and Insights', '/commerce/payments/audit', 'paymentReconciliation', 1298, 'commerce.payment.reconcile', 'Planned payment audit and insights workspace.', recColumns, 'DISABLED')
            ]
        });
    }
};
