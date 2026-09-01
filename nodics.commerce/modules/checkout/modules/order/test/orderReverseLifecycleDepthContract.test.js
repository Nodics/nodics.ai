/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

/**
 * @module order/test/orderReverseLifecycleDepthContract
 * @description Verifies Order-owned reverse lifecycle eligibility, RMA, refund preview, and evidence boundaries.
 * @layer test
 * @owner order
 */

const service = require('../src/service/defaultOrderLifecycleOperationService');
const facade = require('../src/facade/defaultOrderLifecycleFacade');
const backofficeCapability = require('../src/service/defaultOrderBackofficeCapabilityService');

let saved;
let auths;
let storedLifecycle;
let lifecycleUpdates;

test.beforeEach(() => {
    saved = [];
    auths = [];
    storedLifecycle = [];
    lifecycleUpdates = [];
    global.SERVICE = {
        DefaultOrderLifecycleRepositoryService: {
            list: async (_tenant, _query, authData) => {
                auths.push(authData);
                return storedLifecycle;
            },
            save: async (_tenant, model, authData) => {
                auths.push(authData);
                saved.push(model);
                return model;
            },
            get: async (_tenant, code) => storedLifecycle.find(item => item.code === code),
            update: async (_tenant, record, patch) => {
                const updated = Object.assign({}, record, patch);
                lifecycleUpdates.push(updated);
                return updated;
            }
        }
    };
});

test('reverse lifecycle preview exposes cancellation return and refund customer policy depth', async () => {
    const cancellation = await service.preview({
        tenant: 'default',
        ownerId: 'customer-1',
        orderCode: 'order-1',
        payload: { requestType: 'CANCELLATION', policyVersion: '1' },
        correlationId: 'corr-1'
    });
    const returnPreview = await service.preview({
        tenant: 'default',
        ownerId: 'customer-1',
        orderCode: 'order-1',
        payload: { requestType: 'RETURN', evidence: { quantity: '1', returnMethod: 'DROP_OFF', productCodes: ['agoraLinenWrapDress'] } },
        correlationId: 'corr-2'
    });
    const refund = await service.preview({
        tenant: 'default',
        ownerId: 'customer-1',
        orderCode: 'order-1',
        payload: { requestType: 'REFUND', refundAmount: '12.00', currency: 'USD', evidence: { refundMethod: 'ORIGINAL_PAYMENT' } },
        correlationId: 'corr-3'
    });

    assert.equal(cancellation.eligible, true);
    assert.equal(cancellation.itemSelectionRequired, true);
    assert(cancellation.reasonCodes.includes('CUSTOMER_CHANGED_MIND'));
    assert.deepEqual(returnPreview.returnMethods, ['PICKUP', 'DROP_OFF', 'STORE_RETURN']);
    assert.match(returnPreview.rmaCode, /^order-1:RMA:/);
    assert.equal(returnPreview.refundPreview.status, 'REQUIRES_BACKOFFICE_CALCULATION');
    assert(returnPreview.automationPlan.some(step => step.step === 'return-logistics' && step.owner === 'fulfillment'));
    assert(returnPreview.automationPlan.some(step => step.step === 'inspection-disposition' && step.owner === 'fulfillment+inventory'));
    assert.equal(refund.requiresApproval, true);
    assert.equal(refund.refundPreview.amount, '12.00');
    assert.equal(refund.refundPreview.reconciliationRequired, true);
    assert(refund.automationPlan.some(step => step.step === 'refund-reconciliation' && step.owner === 'payment'));
    assert(refund.downstreamOwners.includes('payment'));
});

test('reverse lifecycle preview exposes exchange replacement and appeal policy depth', async () => {
    const exchange = await service.preview({
        tenant: 'default',
        ownerId: 'customer-1',
        orderCode: 'order-1',
        payload: { requestType: 'EXCHANGE', replacementProductCode: 'agoraCashmereCardigan', evidence: { quantity: '1', returnMethod: 'STORE_RETURN' } },
        correlationId: 'corr-exchange'
    });
    const replacement = await service.preview({
        tenant: 'default',
        ownerId: 'customer-1',
        orderCode: 'order-1',
        payload: { requestType: 'REPLACEMENT', evidence: { quantity: '1', returnMethod: 'PICKUP', preferredResolution: 'SHIP_REPLACEMENT' } },
        correlationId: 'corr-replacement'
    });
    const appeal = await service.preview({
        tenant: 'default',
        ownerId: 'customer-1',
        orderCode: 'order-1',
        payload: { requestType: 'APPEAL', appealReferenceCode: 'order-1:return:1', appealReason: 'Inspection evidence missing' },
        correlationId: 'corr-appeal'
    });

    assert.equal(exchange.replacementSelectionRequired, true);
    assert.match(exchange.rmaCode, /^order-1:RMA:/);
    assert(exchange.automationPlan.some(step => step.step === 'replacement-reservation' && step.owner === 'inventory'));
    assert(exchange.automationPlan.some(step => step.step === 'exchange-shipment' && step.owner === 'fulfillment'));
    assert(exchange.downstreamOwners.includes('inventory'));
    assert.equal(replacement.inspectionRequired, true);
    assert.equal(replacement.replacementSelectionRequired, true);
    assert.match(replacement.rmaCode, /^order-1:RMA:/);
    assert.equal(appeal.appealEvidenceRequired, true);
    assert.equal(appeal.itemSelectionRequired, false);
    assert(appeal.reasonCodes.includes('RETURN_REJECTED'));
    assert(appeal.automationPlan.some(step => step.step === 'appeal-sla-review' && step.owner === 'workflow+order'));
});

test('reverse lifecycle create persists structured item return refund and reconciliation evidence', async () => {
    const result = await service.create({
        tenant: 'default',
        ownerId: 'customer-1',
        orderCode: 'order-1',
        idempotencyKey: 'order-1:return:1',
        payload: {
            code: 'order-1:return:1',
            requestType: 'RETURN',
            reasonCode: 'DAMAGED_ITEM',
            evidence: {
                quantity: '2',
                returnMethod: 'PICKUP',
                refundMethod: 'ORIGINAL_PAYMENT',
                productCodes: ['agoraLinenWrapDress'],
                reconciliationStatus: 'REQUIRED'
            }
        },
        correlationId: 'corr-create-1',
        authData: { groups: ['customerUserGroup'] }
    });

    assert.equal(result.status, 'SUBMITTED');
    assert.equal(saved[0].evidence.quantity, '2');
    assert.equal(saved[0].evidence.returnMethod, 'PICKUP');
    assert.equal(saved[0].evidence.refundPreview.reconciliationRequired, true);
    assert(saved[0].automationPlan.some(step => step.step === 'return-logistics'));
    assert.match(saved[0].evidence.rmaCode, /^order-1:RMA:/);
    assert.deepEqual(saved[0].evidence.productCodes, ['agoraLinenWrapDress']);
    assert.equal(saved[0].active, true);
    assert(saved[0].created instanceof Date);
    assert(auths.every(authData => authData.groups.includes('serviceAccountUserGroup')));
    assert(auths.every(authData => authData.userGroups.includes('serviceAccountUserGroup')));
});

test('reverse lifecycle facade resolves customer ownership from authenticated login id', async () => {
    let captured;
    global.SERVICE = {
        DefaultOrderLifecycleOperationService: {
            preview: async request => {
                captured = request;
                return { ownerId: request.ownerId, actorId: request.actorId, tenant: request.tenant };
            }
        }
    };

    const result = await facade.preview({
        authData: { tenant: 'default', loginId: 'customer@example.com' },
        orderCode: 'order-1',
        payload: { requestType: 'CANCELLATION' }
    });

    assert.equal(result.ownerId, 'customer@example.com');
    assert.equal(result.actorId, 'customer@example.com');
    assert.equal(captured.tenant, 'default');
});

test('reverse lifecycle facade keeps operator action actor separate from customer owner', async () => {
    let captured;
    global.SERVICE = {
        DefaultOrderLifecycleOperationService: {
            action: async request => {
                captured = request;
                return { actorId: request.actorId, ownerId: request.ownerId };
            }
        }
    };

    const result = await facade.action({
        tenant: 'default',
        authData: { tenant: 'default', loginId: 'operator@example.com' },
        ownerId: 'customer@example.com',
        requestCode: 'order-1:cancellation:1',
        actionCode: 'APPROVE',
        payload: { refundAmount: '5.00' }
    });

    assert.equal(result.actorId, 'operator@example.com');
    assert.equal(result.ownerId, 'customer@example.com');
    assert.equal(captured.actorId, 'operator@example.com');
});

test('reverse lifecycle operator approve executes Payment-owned refund and records downstream evidence', async () => {
    let refundRequest;
    storedLifecycle = [{
        code: 'order-1:refund:1',
        tenant: 'default',
        ownerId: 'customer-1',
        orderCode: 'order-1',
        requestType: 'REFUND',
        status: 'SUBMITTED',
        revision: 0,
        evidence: { refundPreview: { amount: '12.00', currency: 'USD' } }
    }];
    global.SERVICE.DefaultPaymentRefundExecutionService = {
        executeRefund: async request => {
            refundRequest = request;
            return { status: 'REFUND_SUCCEEDED', reconciliationRequired: false };
        }
    };

    const result = await service.action({
        tenant: 'default',
        actorId: 'operator-1',
        requestCode: 'order-1:refund:1',
        actionCode: 'APPROVE',
        payload: {},
        authData: { groups: ['employeeUserGroup'] },
        correlationId: 'corr-approve-refund'
    });

    assert.equal(result.status, 'APPROVED');
    assert.equal(refundRequest.orderCode, 'order-1');
    assert.equal(refundRequest.payload.amount, '12.00');
    assert.equal(lifecycleUpdates[0].evidence.downstream.payment.status, 'REFUND_SUCCEEDED');
});

test('reverse lifecycle operator cancellation approval executes refund when amount is confirmed', async () => {
    let refundRequest;
    let digitalRequest;
    storedLifecycle = [{
        code: 'order-1:cancellation:1',
        tenant: 'default',
        enterpriseCode: 'enterpriseX',
        ownerId: 'customer-1',
        orderCode: 'order-1',
        requestType: 'CANCELLATION',
        status: 'SUBMITTED',
        revision: 0,
        evidence: { refundPreview: { amount: 'PENDING_CALCULATION', currency: 'USD' } }
    }];
    global.SERVICE.DefaultDigitalCommerceEntitlementService = {
        revokeForOrderLifecycle: async request => {
            digitalRequest = request;
            return [{ entitlementCode: 'entitlement-1', policyDecision: 'REVOKE_AND_REFUND' }];
        }
    };
    global.SERVICE.DefaultPaymentRefundExecutionService = {
        executeRefund: async request => {
            refundRequest = request;
            return { status: 'REFUND_SUCCEEDED', refundCode: 'refund-1' };
        }
    };

    const result = await service.action({
        tenant: 'default',
        enterpriseCode: 'enterpriseX',
        actorId: 'operator-1',
        requestCode: 'order-1:cancellation:1',
        actionCode: 'APPROVE',
        payload: { refundAmount: '5.00', currency: 'USD' },
        authData: { groups: ['employeeUserGroup'] },
        correlationId: 'corr-cancellation-approve'
    });

    assert.equal(result.status, 'APPROVED');
    assert.equal(digitalRequest.payload.requestType, 'CANCELLATION');
    assert.equal(refundRequest.orderCode, 'order-1');
    assert.equal(refundRequest.payload.amount, '5.00');
    assert.equal(result.evidence.downstream.digitalCommerce[0].policyDecision, 'REVOKE_AND_REFUND');
    assert.equal(result.evidence.downstream.payment.status, 'REFUND_SUCCEEDED');
});

test('reverse lifecycle refund approval calls Digital Commerce entitlement revocation policy', async () => {
    let digitalRequest;
    storedLifecycle = [{
        code: 'order-1:refund-digital:1',
        tenant: 'default',
        enterpriseCode: 'enterpriseX',
        ownerId: 'customer-1',
        orderCode: 'order-1',
        requestType: 'REFUND',
        status: 'SUBMITTED',
        revision: 0,
        evidence: { refundPreview: { amount: '5.00', currency: 'USD' } }
    }];
    global.SERVICE.DefaultDigitalCommerceEntitlementService = {
        revokeForOrderLifecycle: async request => {
            digitalRequest = request;
            return [{ entitlementCode: 'entitlement-1', policyDecision: 'REVOKE_AND_REFUND' }];
        }
    };
    global.SERVICE.DefaultPaymentRefundExecutionService = {
        executeRefund: async () => ({ status: 'REFUND_SUCCEEDED' })
    };

    const result = await service.action({
        tenant: 'default',
        enterpriseCode: 'enterpriseX',
        actorId: 'operator-1',
        requestCode: 'order-1:refund-digital:1',
        actionCode: 'APPROVE',
        payload: {},
        authData: { groups: ['employeeUserGroup'] },
        correlationId: 'corr-approve-digital-refund'
    });

    assert.equal(digitalRequest.enterpriseCode, 'enterpriseX');
    assert.equal(digitalRequest.payload.requestType, 'REFUND');
    assert.equal(result.evidence.downstream.digitalCommerce[0].policyDecision, 'REVOKE_AND_REFUND');
});

test('reverse lifecycle operator return actions call Fulfillment-owned receipt and inspection services', async () => {
    const calls = [];
    storedLifecycle = [{
        code: 'order-1:return:1',
        tenant: 'default',
        ownerId: 'customer-1',
        orderCode: 'order-1',
        requestType: 'RETURN',
        status: 'SUBMITTED',
        revision: 0,
        evidence: { rmaCode: 'RMA-1' }
    }];
    global.SERVICE.DefaultFulfillmentReturnExecutionService = {
        recordReceipt: async request => {
            calls.push({ operation: 'receipt', request });
            return { status: 'RECEIVED' };
        },
        recordInspection: async request => {
            calls.push({ operation: 'inspection', request });
            return { status: 'INSPECTED', evidence: { disposition: request.payload.disposition } };
        }
    };

    await service.action({ tenant: 'default', actorId: 'operator-1', requestCode: 'order-1:return:1', actionCode: 'MARK_RECEIVED', payload: {}, authData: {}, correlationId: 'corr-receipt' });
    const inspected = await service.action({ tenant: 'default', actorId: 'operator-1', requestCode: 'order-1:return:1', actionCode: 'DISPOSITION', payload: { disposition: 'RESTOCK' }, authData: {}, correlationId: 'corr-inspection' });

    assert.deepEqual(calls.map(call => call.operation), ['receipt', 'inspection']);
    assert.equal(calls[0].request.payload.rmaCode, 'RMA-1');
    assert.equal(inspected.status, 'DISPOSITION_RECORDED');
    assert.equal(lifecycleUpdates[1].evidence.downstream.fulfillment.evidence.disposition, 'RESTOCK');
});

test('reverse lifecycle operator exchange approval calls Inventory and Fulfillment owner hooks', async () => {
    const calls = [];
    storedLifecycle = [{
        code: 'order-1:exchange:1',
        tenant: 'default',
        ownerId: 'customer-1',
        orderCode: 'order-1',
        requestType: 'EXCHANGE',
        status: 'SUBMITTED',
        revision: 0,
        evidence: { productCodes: ['agoraLinenWrapDress'], replacementProductCode: 'agoraCashmereCardigan', preferredResolution: 'SHIP_REPLACEMENT' }
    }];
    global.SERVICE.DefaultInventoryReplacementReservationService = {
        reserveReplacement: async request => {
            calls.push({ operation: 'inventory', request });
            return { status: 'RESERVED', reservationCode: 'reservation-1' };
        }
    };
    global.SERVICE.DefaultFulfillmentExchangeShipmentService = {
        createExchangeShipment: async request => {
            calls.push({ operation: 'fulfillment', request });
            return { status: 'SHIPMENT_CREATED', shipmentCode: 'shipment-1' };
        }
    };

    const result = await service.action({ tenant: 'default', actorId: 'operator-1', requestCode: 'order-1:exchange:1', actionCode: 'APPROVE', payload: {}, authData: {}, correlationId: 'corr-exchange-approve' });

    assert.deepEqual(calls.map(call => call.operation), ['inventory', 'fulfillment']);
    assert.equal(calls[0].request.payload.replacementProductCode, 'agoraCashmereCardigan');
    assert.equal(calls[1].request.idempotencyKey, 'order-1:exchange:1:APPROVE:exchangeShipment');
    assert.equal(result.evidence.downstream.inventory.status, 'RESERVED');
    assert.equal(result.evidence.downstream.fulfillment.status, 'SHIPMENT_CREATED');
});

test('reverse lifecycle operator appeal approval calls Workflow SLA owner hook', async () => {
    let workflowRequest;
    storedLifecycle = [{
        code: 'order-1:appeal:1',
        tenant: 'default',
        ownerId: 'customer-1',
        orderCode: 'order-1',
        requestType: 'APPEAL',
        status: 'SUBMITTED',
        revision: 0,
        evidence: { appealReferenceCode: 'order-1:return:1', appealReason: 'Inspection evidence missing' }
    }];
    global.SERVICE.DefaultWorkflowAppealSlaService = {
        startAppealReview: async request => {
            workflowRequest = request;
            return { status: 'SLA_STARTED', taskCode: 'appeal-task-1' };
        }
    };

    const result = await service.action({ tenant: 'default', actorId: 'operator-1', requestCode: 'order-1:appeal:1', actionCode: 'APPROVE', payload: {}, authData: {}, correlationId: 'corr-appeal-approve' });

    assert.equal(workflowRequest.payload.appealReferenceCode, 'order-1:return:1');
    assert.equal(workflowRequest.idempotencyKey, 'order-1:appeal:1:APPROVE:appealSla');
    assert.equal(result.evidence.downstream.workflow.status, 'SLA_STARTED');
});

test('Order BackOffice capability declares operator actions for cancellation return and refund', () => {
    global.SERVICE.DefaultBackofficeCapabilityDefinitionService = {
        capability: input => input,
        workbench: input => input
    };

    const capability = backofficeCapability.getCapability();
    const cancellations = capability.navigation.find(item => item.id === 'order-cancellations');
    const returns = capability.navigation.find(item => item.id === 'order-returns');
    const refunds = capability.navigation.find(item => item.id === 'order-refunds');

    assert(cancellations.lifecycleActions.some(action => action.id === 'approve' && action.inputFields.some(field => field.name === 'refundAmount')));
    assert(returns.lifecycleActions.some(action => action.id === 'mark-received' && action.operationRoute.includes('MARK_RECEIVED')));
    assert(returns.lifecycleActions.some(action => action.id === 'record-disposition' && action.inputFields.some(field => field.name === 'disposition' && field.type === 'SELECT')));
    assert(refunds.lifecycleActions.some(action => action.id === 'approve' && action.inputFields.some(field => field.name === 'refundAmount')));
    assert(refunds.lifecycleActions.every(action => action.ownerModule === 'order'));
    assert(capability.navigation.some(item => item.id === 'order-exchanges' && item.summary.includes('exchange and replacement')));
    assert(capability.navigation.some(item => item.id === 'order-appeals' && item.presentation.fixedFilters[0].value === 'APPEAL'));
});
