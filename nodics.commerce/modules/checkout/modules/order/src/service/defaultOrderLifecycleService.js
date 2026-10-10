/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module order/src/service/defaultOrderLifecycleService @description Coordinates cancellation, return, and refund intents while preserving domain ownership and recording recoverable partial-failure evidence. @layer service @owner order @override Customer Order modules may override individual orchestration steps while retaining idempotency, owner ports, and compensation evidence. */
module.exports = {
    /** Rejects errored owner envelopes before interpreting an explicit lifecycle result. */
    affirmative: function (value) {
        return !!value && typeof value === 'object' && !Array.isArray(value) && !value.error &&
            value.success !== false && value.acknowledged !== false &&
            (value.code === undefined || typeof value.code === 'string' && !value.code.startsWith('ERR_')) &&
            !(value.errors && (!Array.isArray(value.errors) || value.errors.length > 0));
    },
    /** Requires an explicit owner success; a Payment success additionally needs its retained transaction reference. */
    confirmed: function (owner, value) {
        const statuses = {
            FULFILLMENT: ['PREPARED', 'COMPLETED', 'CANCELLED', 'RETURN_RECEIVED', 'RECEIVED', 'INSPECTED'],
            INVENTORY: ['SETTLED', 'COMPLETED', 'RELEASED', 'DISPOSED', 'RESTOCKED'],
            PAYMENT: ['REFUND_SUCCEEDED', 'VOID_SUCCEEDED'],
            COMPLETE: ['COMPLETED']
        };
        return this.affirmative(value) && statuses[owner]?.includes(value.status) === true &&
            (owner !== 'PAYMENT' || typeof value.transactionCode === 'string' && value.transactionCode.trim().length > 0);
    },
    /** Processes one idempotent reverse-lifecycle request through confirmed owner ports. @param {Object} request Tenant-scoped lifecycle request. @param {Object} ports Domain-owner ports including an optional compensation recorder. @returns {Promise<Object>} Completed, rejected, awaiting-approval, or replayed lifecycle evidence. */
    process: async function (request, ports) {
        if (!request || !request.tenant || !request.orderCode || !request.idempotencyKey) throw new Error('Tenant order lifecycle intent is required');
        if (typeof ports?.find !== 'function') throw new Error('Reverse owner port unavailable: find');
        const existing = await ports.find(request.tenant, request.idempotencyKey);
        if (existing) {
            if (!this.confirmed('COMPLETE', existing) || ['tenant', 'orderCode', 'idempotencyKey'].some(key => existing[key] !== request[key]))
                throw new Error('Reverse replay evidence is unconfirmed; reconcile the original command');
            return existing;
        }
        if (typeof ports.evaluatePolicy !== 'function') throw new Error('Reverse policy owner port unavailable');
        const eligibility = await ports.evaluatePolicy(request);
        if (!this.affirmative(eligibility) || typeof eligibility.eligible !== 'boolean')
            throw new Error('Reverse policy decision is unconfirmed');
        if (!eligibility.eligible) {
            if (typeof ports.reject !== 'function') throw new Error('Reverse rejection owner port unavailable');
            const rejected = await ports.reject(request, eligibility);
            if (!this.affirmative(rejected) || rejected.status !== 'REJECTED') throw new Error('Reverse rejection outcome is unconfirmed');
            return rejected;
        }
        if (typeof eligibility.requiresApproval !== 'boolean') throw new Error('Reverse approval policy is unconfirmed');
        if (eligibility.requiresApproval && typeof ports.requestApproval !== 'function') throw new Error('Reverse approval owner port unavailable');
        const approval = eligibility.requiresApproval ? await ports.requestApproval(request, eligibility) : { status: 'APPROVED' };
        if (!this.affirmative(approval)) throw new Error('Reverse approval decision is unconfirmed');
        if (approval.status !== 'APPROVED') {
            if (approval.status === 'REJECTED') {
                if (typeof ports.reject !== 'function') throw new Error('Reverse rejection owner port unavailable');
                const rejected = await ports.reject(request, { ...eligibility, approval });
                if (!this.affirmative(rejected) || rejected.status !== 'REJECTED') throw new Error('Reverse rejection outcome is unconfirmed');
                return rejected;
            }
            if (!['PENDING', 'PENDING_APPROVAL', 'AWAITING_APPROVAL'].includes(approval.status)) throw new Error('Reverse approval decision is unconfirmed');
            if (typeof ports.awaitApproval !== 'function') throw new Error('Reverse pending approval owner port unavailable');
            const pending = await ports.awaitApproval(request, approval);
            if (!this.affirmative(pending) || !['PENDING', 'PENDING_APPROVAL', 'AWAITING_APPROVAL'].includes(pending.status))
                throw new Error('Reverse pending approval outcome is unconfirmed');
            return pending;
        }
        for (const name of ['fulfillmentIntent', 'inventoryDisposition', 'paymentIntent', 'complete'])
            if (typeof ports[name] !== 'function') throw new Error('Reverse owner port unavailable: ' + name);
        const checkpoint = { eligibility, approval, completed: [], results: {} };
        const invoke = async (owner, operation) => {
            checkpoint.unconfirmed = { owner, status: 'UNCONFIRMED' };
            const value = await operation();
            if (!this.confirmed(owner, value)) {
                throw new Error('Reverse ' + owner + ' outcome is unconfirmed; reconcile before retry');
            }
            delete checkpoint.unconfirmed;
            checkpoint.results[owner.toLowerCase()] = value;
            if (owner !== 'COMPLETE') checkpoint.completed.push(owner);
            return value;
        };
        try {
            const fulfillment = await invoke('FULFILLMENT', () => ports.fulfillmentIntent(request, eligibility));
            const inventory = await invoke('INVENTORY', () => ports.inventoryDisposition(request, fulfillment));
            const payment = await invoke('PAYMENT', () => ports.paymentIntent(request, eligibility));
            return await invoke('COMPLETE', () => ports.complete(request, { eligibility, approval, fulfillment, inventory, payment }));
        } catch (error) {
            if (typeof ports.compensate === 'function') {
                try { await ports.compensate(request, checkpoint, error); }
                catch (_) {
                    try { if (error && typeof error === 'object') error.compensationRequired = true; }
                    catch (_) { /* An immutable error must still preserve the original failure. */ }
                }
            }
            throw error;
        }
    }
};
