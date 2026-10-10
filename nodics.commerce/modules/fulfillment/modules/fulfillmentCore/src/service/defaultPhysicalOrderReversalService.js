/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
'use strict';
const crypto = require('node:crypto');
const { isDeepStrictEqual } = require('node:util');
/** @module fulfillmentCore/service/defaultPhysicalOrderReversalService @description Owns reviewed full-order physical cancellation and returned-goods logistics; Inventory owns atomic stock effects and Order owns approval and financial recovery. @layer service @owner fulfillmentCore @override Preserve retained consignment, current Profile scope, immutable command identity, installed transaction qualification and exact stock proof. Manual handover attestation is not live-carrier confirmation. */
module.exports = {
    /** Reads explicit physical-operation selection, independently disabled by default. */
    policy: function () { return (CONFIG.get('fulfillmentCore') || {}).physicalOperations || {}; },
    /** Resolves the effective owner status vocabulary. */
    status: function (name) { return ENUMS.PhysicalFulfillmentStatus[name].key; },
    /** Refuses unqualified evidence without manufacturing operational success. */
    fail: function (message) { throw new CLASSES.NodicsError('ERR_FULFILLMENT_PHYSICAL_UNCONFIRMED', message); },
    /** Validates bounded opaque identities. */
    identity: function (value) { return typeof value === 'string' && value.length > 0 && value.length <= 192 && !/[\u0000-\u0020\u007f]/.test(value); },
    /** Reuses current Profile-backed employee scope and existing fulfillment-return permission. */
    operator: async function (input) {
        const policy = this.policy(), role = CONFIG.get('runtimeRole');
        if (policy.enabled !== true || policy.evidenceMode !== 'MANUAL_ATTESTATION' ||
            !Number.isSafeInteger(policy.maximumLines) || policy.maximumLines < 1 || policy.maximumLines > 100 ||
            !Number.isSafeInteger(policy.maximumReceipts) || policy.maximumReceipts < 1 || policy.maximumReceipts > 100 ||
            (typeof role === 'string' ? role : role?.code) !== 'COMMERCE') this.fail('Physical owner operations are unavailable');
        const r = await SERVICE.DefaultOrderDisputeService.staff(input, 'commerce.fulfillment.return', ['commerce','fulfillmentCore']), security = SERVICE.DefaultSecuredRequestPipelineService;
        if (!this.identity(r.tenant) || !this.identity(r.enterpriseCode) ||
            r.authData.tenant !== undefined && r.authData.tenant !== r.tenant ||
            !security.isPermissionGranted('commerce.fulfillment.return', security.getGrantedPermissions(r), {}))
            this.fail('Physical owner scope is not permitted');
        return r;
    },
    /** Reloads Order's original case, entries and reviewed approval, ignoring caller copies of authority. */
    authority: async function (input, execution = true) {
        await this.operator(input);
        return SERVICE.DefaultOrderRefundRecoveryService.physicalAuthority(input, execution);
    },
    /** Creates scoped internal model access, never a customer impersonation. */
    storage: function (r) {
        return { tenant: r.tenant, authData: SERVICE.DefaultFulfillmentReturnExecutionService.serviceAuthData(r),
            options: { recursive: false, skipItemCache: true }, ...(r.transactionContext ? { transactionContext: r.transactionContext } : {}) };
    },
    /** Requires successful generated persistence envelopes. */
    result: function (response) {
        if (!response || !/^SUC_/.test(response.code || '') || response.error || response.success === false ||
            response.errors?.length || response.result?.acknowledged === false) this.fail('Physical persistence did not confirm success');
        return response.result;
    },
    /** Reads at most one record bound to the exact tenant, enterprise, Order and buyer. */
    read: async function (name, r, query) {
        const scope = { ...query, tenant: r.tenant, enterpriseCode: r.enterpriseCode, orderCode: r.orderCode, ownerId: r.ownerId };
        const rows = this.result(await SERVICE[name].get({ ...this.storage(r), query: scope, searchOptions: { pageSize: 2, pageNumber: 1 } }));
        if (!Array.isArray(rows) || rows.length > 1 || rows.some(row => Object.entries(scope).some(([k,v]) => row[k] !== v)))
            this.fail('Physical evidence is missing, foreign or ambiguous');
        return rows[0];
    },
    /** Checks installed nonversioned atomic models and actual unconditional unique identities. */
    persistence: async function (r) {
        const transaction = SERVICE.DefaultDatabaseTransactionService, models = NODICS.getModels('fulfillmentCore', r.tenant) || {};
        if (transaction?.capabilities({ moduleName: 'fulfillmentCore', tenant: r.tenant }).multiRecordAtomic !== true)
            this.fail('Atomic Fulfillment persistence is unavailable');
        for (const name of ['consignment', 'shipment', 'fulfillmentReturn', 'returnReceipt', 'returnInspection']) {
            const model = models[UTILS.createModelName(name)];
            if (!model || model.versioned !== false || typeof model.compareAndSetItem !== 'function' ||
                SERVICE.DefaultModelConcurrencyService?.getField(model.rawSchema)) this.fail('Physical models are not qualified');
            transaction.assertSchemaEligible(model);
            const evidence = await SERVICE.DefaultDatabaseModelHandlerService.inspectIndexes(model);
            if (evidence?.versioned !== false || !evidence.indexes?.some(index => index.unique === true &&
                !index.sparse && !index.partialFilterExpression && (!index.collation || index.collation.locale === 'simple') &&
                Object.keys(index.key || {}).join(',') === 'code' && index.key.code === 1)) this.fail('Physical identities are not installed');
        }
    },
    /** Inserts immutable owner evidence and verifies exact readback in the transaction. */
    insert: async function (name, r, code, status, evidence) {
        const now = new Date(), model = { code, tenant: r.tenant, enterpriseCode: r.enterpriseCode, orderCode: r.orderCode,
            ownerId: r.ownerId, status, revision: 0, active: true, created: now, updated: now, occurredAt: now,
            correlationId: r.correlationId || code, idempotencyKey: code, evidence };
        this.result(await SERVICE[name].save({ ...this.storage(r), options: { insertOnly: true, recursive: false }, model }));
        const stored = await this.read(name, r, { code });
        if (!stored || stored.status !== status || stored.revision !== 0 || !isDeepStrictEqual(stored.evidence, evidence)) this.fail('Physical insert readback requires reconciliation');
        return stored;
    },
    /** Serializes dispatch, cancellation and every receipt against one actual consignment revision. */
    update: async function (r, row, patch) {
        if (!Number.isSafeInteger(row.revision) || row.revision < 0 || row.revision >= Number.MAX_SAFE_INTEGER) this.fail('Invalid consignment revision');
        const intended = { ...patch, revision: row.revision + 1 };
        const result = this.result(await SERVICE.DefaultConsignmentService.update({ ...this.storage(r),
            query: { code: row.code, tenant: r.tenant, enterpriseCode: r.enterpriseCode, orderCode: r.orderCode,
                ownerId: r.ownerId, revision: row.revision, status: row.status }, model: { $set: intended } }));
        if (result?.acknowledged !== true || result.matchedCount !== 1) this.fail('Concurrent consignment command requires reread');
        const stored = await this.read('DefaultConsignmentService', r, { code: row.code });
        if (!stored || Object.entries(intended).some(([key,value]) => !isDeepStrictEqual(stored[key], value)))
            this.fail('Consignment update readback requires reconciliation');
        return stored;
    },
    /** Commits only within Fulfillment; lost acknowledgements recover exclusively from exact persisted owner proof. */
    commit: async function (r, work, recover) {
        await this.persistence(r);
        try { return await SERVICE.DefaultDatabaseTransactionService.execute({ moduleName: 'fulfillmentCore', tenant: r.tenant },
            transactionContext => work({ ...r, transactionContext })); }
        catch (error) {
            try { const value = await recover(); if (value) return value; } catch (_) { /* Preserve the original uncertain outcome. */ }
            throw error;
        }
    },
    /** Pins a deterministic identity to original tenant, enterprise, Order and command. */
    code: function (r, kind, key) {
        return 'physical-' + kind + '-' + crypto.createHash('sha256').update(JSON.stringify([r.tenant,r.enterpriseCode,r.orderCode,key])).digest('hex');
    },
    /** Requires confirmed, bounded manual attestation and an immutable command reference. */
    command: function (r) {
        const p = r.payload || {};
        if (p.confirmed !== true || !/^[A-Za-z0-9._:-]{8,180}$/.test(r.idempotencyKey || '') ||
            typeof p.reason !== 'string' || p.reason.trim().length < 10 || p.reason.length > 2000)
            this.fail('Review and confirm physical evidence with a reason and stable command');
        return { commandKey: r.idempotencyKey, reason: p.reason.trim() };
    },
    /** Loads exact retained Order entries and original Inventory holds; mixed digital or incomplete orders are rejected. */
    source: async function (r) {
        const consignment = await this.read('DefaultConsignmentService', r, {}), codes = r.order.evidence?.reservationCodes;
        if (!consignment || consignment.totalAmount !== r.order.totalAmount || consignment.currency !== r.order.currency ||
            !Array.isArray(codes) || !codes.length || codes.length > this.policy().maximumLines ||
            new Set(codes).size !== codes.length || codes.some(code => typeof code !== 'string' || !code) ||
            !Array.isArray(r.entries) || r.entries.length !== codes.length || r.order.evidence?.digitalReservationCodes?.length)
            this.fail('Full physical Order and retained consignment evidence are required');
        const inventory = SERVICE.DefaultInventoryReservationOperationService, lines = [];
        for (const code of codes.slice().sort()) {
            const hold = await inventory.read('DefaultInventoryReservationService', { ...r, transactionContext: undefined }, { code });
            const matches = r.entries.filter(entry => entry.code === code);
            if (!hold || matches.length !== 1 || ['tenant','enterpriseCode','ownerId','orderCode'].some(key=>matches[0][key] !== r[key]) ||
                hold.ownerId !== r.ownerId || hold.ownerType !== 'ORDER' ||
                hold.ownerCode !== r.orderCode || hold.sku !== matches[0].sku || hold.quantity !== matches[0].quantity ||
                !hold.balanceCode || SERVICE.DefaultExactAmountService.compare(hold.quantity, '0') <= 0)
                this.fail('Original Order entry and Inventory hold bindings are incomplete');
            lines.push({ reservationCode: code, sku: hold.sku, warehouseCode: hold.warehouseCode, balanceCode: hold.balanceCode, quantity: hold.quantity });
        }
        return { consignment, lines };
    },
    /** Returns a reviewable full-order plan; return receipt and inspection remain explicit prerequisites before Payment. */
    preview: async function (input) {
        const r = await this.authority(input, false), { consignment, lines } = await this.source(r);
        const kind = r.caseRow.evidence.requestedResolution;
        if (kind === 'CANCELLATION') {
            if (consignment.status !== this.status('READY') || consignment.evidence?.dispatch || consignment.evidence?.reversal)
                this.fail('Cancellation is available only before dispatch');
            await SERVICE.DefaultInventoryPhysicalReversalService.verify(r, lines, 'ACTIVE');
        } else {
            const shipment = await this.shipment(r, consignment);
            if (consignment.status !== this.status('SHIPPED') || !isDeepStrictEqual(shipment.evidence.lines, lines))
                this.fail('Return requires the original owner-issued shipment');
            await SERVICE.DefaultInventoryPhysicalReversalService.verify(r, lines, 'CONSUMED', shipment.code);
        }
        return { eligible: true, kind, consignmentCode: consignment.code, consignmentRevision: consignment.revision,
            shipmentCode: consignment.evidence?.dispatch?.shipmentCode, lines,
            evidenceMode: 'MANUAL_ATTESTATION', requiresFullInspectedReceipt: kind === 'RETURN' };
    },
    /** Reads the original finalized shipment, never a client-supplied shipment flag. */
    shipment: async function (r, consignment) {
        const dispatch = consignment.evidence?.dispatch;
        const row = dispatch?.shipmentCode && await this.read('DefaultShipmentService', r, { code: dispatch.shipmentCode });
        if (!row || row.status !== this.status('SHIPPED') || row.evidence?.consignmentCode !== consignment.code ||
            row.evidence.commandKey !== dispatch.commandKey || !row.evidence.handoverReference || !row.evidence.reviewedBy ||
            row.evidence.evidenceMode !== 'MANUAL_ATTESTATION' || !isDeepStrictEqual(row.evidence.lines,dispatch.lines)) this.fail('Original shipment handover is unconfirmed');
        return row;
    },
    /** Verifies current pinned approval and the monotonic physical lock before Inventory effects. */
    locked: async function (input) {
        const r = await this.authority(input, true), source = await this.source(r), plan = r.physicalPlan;
        if (!plan || plan.kind !== r.caseRow.evidence.requestedResolution || plan.consignmentCode !== source.consignment.code ||
            !isDeepStrictEqual(plan.lines, source.lines) || source.consignment.evidence?.reversal?.refundCode !== r.refundCode ||
            source.consignment.evidence.reversal.caseCode !== r.caseRow.code || source.consignment.evidence.reversal.kind !== plan.kind ||
            !(plan.kind === 'CANCELLATION' ? [this.status('CANCELLATION_PENDING'),this.status('CANCELLED')] :
                [this.status('RETURN_PENDING'),this.status('RETURNED')]).includes(source.consignment.status))
            this.fail('Original physical approval or consignment lock changed');
        return { ...r, ...source };
    },
    /** Locks the real consignment against dispatch and retains the reviewed return intent before stock effects. */
    prepare: async function (input) {
        const r = await this.authority(input, true), plan = r.physicalPlan;
        const verify = async () => {
            const current = await this.locked(input);
            if (plan.kind === 'RETURN') {
                const intent = await this.read('DefaultFulfillmentReturnService', current, { code: this.code(r,'return',r.refundCode) });
                if (!intent || intent.status !== this.status('WAITING_RECEIPT') || intent.evidence.refundCode !== r.refundCode || !isDeepStrictEqual(intent.evidence.lines, plan.lines)) return undefined;
            }
            return { status: 'PREPARED', consignmentCode: current.consignment.code, refundCode: r.refundCode };
        };
        const existing = await this.source(r);
        if (existing.consignment.evidence?.reversal) return verify();
        await this.commit(r, async tx => {
            const { consignment, lines } = await this.source(tx);
            if (!plan || consignment.code !== plan.consignmentCode || consignment.revision !== plan.consignmentRevision ||
                !isDeepStrictEqual(lines, plan.lines) || consignment.evidence?.reversal ||
                consignment.status !== this.status(plan.kind === 'CANCELLATION' ? 'READY' : 'SHIPPED')) this.fail('Reviewed physical plan changed');
            if (plan.kind === 'CANCELLATION' && consignment.evidence?.dispatch) this.fail('Dispatch already owns this consignment');
            if (plan.kind === 'RETURN') {
                const shipment = await this.shipment(tx, consignment);
                if (shipment.code !== plan.shipmentCode) this.fail('Reviewed shipment changed');
                await this.insert('DefaultFulfillmentReturnService', tx, this.code(r,'return',r.refundCode), this.status('WAITING_RECEIPT'),
                    { consignmentCode: consignment.code, shipmentCode: shipment.code, refundCode: r.refundCode,
                        caseCode: r.caseRow.code, reviewedBy: r.physicalApproval.evidence.approval.by, lines });
            }
            return this.update(tx, consignment, { status: this.status(plan.kind === 'CANCELLATION' ? 'CANCELLATION_PENDING' : 'RETURN_PENDING'),
                evidence: { ...consignment.evidence, reversal: { refundCode: r.refundCode, caseCode: r.caseRow.code, kind: plan.kind }, receiptCodes: [] } });
        }, verify);
        return verify();
    },
    /** Builds scoped dispatch authority from the original Order, not a supplied customer or hold list. */
    dispatchAuthority: async function (input) {
        const request = await this.operator(input);
        const scope = { tenant: request.tenant, enterpriseCode: request.enterpriseCode, code: input.code };
        const rows = this.result(await SERVICE.DefaultCommerceOrderService.get({
            ...SERVICE.DefaultOrderDisputeService.storage(request), query: scope }));
        if (!Array.isArray(rows) || rows.length !== 1 || Object.entries(scope).some(([key,value]) => rows[0][key] !== value))
            this.fail('Scoped dispatch Order is unavailable');
        const order = rows[0];
        if (!['PLACED','FULFILLED','COMPLETED'].includes(order.status) || order.evidence?.refundCode) this.fail('Order is locked for reversal');
        await SERVICE.DefaultOrderDisputeService.policyAdmission(request, order, SERVICE.DefaultOrderDisputeService.policy());
        const r = { ...request, order, orderCode: order.code, ownerId: order.ownerId };
        r.entries = await SERVICE.DefaultOrderOperationService.entries(r, order.code);
        return r;
    },
    /** Revalidates the durable reviewed dispatch lock for Inventory's shipment operation. */
    dispatchStockAuthority: async function (input) {
        const r = await this.dispatchAuthority(input), source = await this.source(r), command = this.command(r), p = r.payload;
        const dispatch = source.consignment.evidence?.dispatch;
        if (!dispatch || ![this.status('DISPATCH_PENDING'),this.status('SHIPPED')].includes(source.consignment.status) ||
            source.consignment.evidence?.reversal || dispatch.commandKey !== command.commandKey || dispatch.reason !== command.reason ||
            dispatch.handoverReference !== p.handoverReference || !dispatch.reviewedBy || !isDeepStrictEqual(dispatch.lines, source.lines))
            this.fail('Original reviewed dispatch lock is unavailable');
        return { ...r, ...source, shipmentCode: dispatch.shipmentCode };
    },
    /** Records a confirmed manual warehouse handover, consumes original holds once, and issues the retained shipment after stock proof. */
    dispatch: async function (input) {
        const r = await this.dispatchAuthority(input), command = this.command(r), p = r.payload;
        if (!this.identity(p.handoverReference)) this.fail('An actual handover reference is required');
        const { consignment, lines } = await this.source(r), shipmentCode = this.code(r,'shipment',command.commandKey);
        const verifyLock = async () => (await this.dispatchStockAuthority(input)).consignment;
        if (!consignment.evidence?.dispatch) await this.commit(r, async tx => {
            const fresh = await this.source(tx);
            if (fresh.consignment.status !== this.status('READY') || fresh.consignment.evidence?.reversal || fresh.consignment.evidence?.dispatch)
                this.fail('Dispatch or cancellation already owns this consignment');
            return this.update(tx, fresh.consignment, { status: this.status('DISPATCH_PENDING'), evidence: { ...fresh.consignment.evidence,
                dispatch: { ...command, shipmentCode, handoverReference: p.handoverReference, reviewedBy: r.authData.loginId,
                    evidenceMode: 'MANUAL_ATTESTATION', lines } } });
        }, verifyLock);
        await verifyLock();
        await SERVICE.DefaultInventoryPhysicalReversalService.ship(input);
        const verifyShipment = async () => {
            const fresh = await this.dispatchStockAuthority(input), shipment = await this.shipment(fresh, fresh.consignment);
            if (fresh.consignment.status !== this.status('SHIPPED') || shipment.code !== shipmentCode) return undefined;
            return { status: this.status('SHIPPED'), shipmentCode, consignmentCode: fresh.consignment.code, evidenceMode: 'MANUAL_ATTESTATION' };
        };
        const current = await verifyLock();
        if (current.status !== this.status('SHIPPED')) await this.commit(r, async tx => {
            const fresh = await this.source(tx);
            if (fresh.consignment.status !== this.status('DISPATCH_PENDING') || fresh.consignment.evidence.dispatch.shipmentCode !== shipmentCode)
                this.fail('Dispatch lock changed');
            await this.insert('DefaultShipmentService', tx, shipmentCode, this.status('SHIPPED'),
                { ...fresh.consignment.evidence.dispatch, consignmentCode: fresh.consignment.code });
            return this.update(tx, fresh.consignment, { status: this.status('SHIPPED') });
        }, verifyShipment);
        return verifyShipment();
    },
    /** Validates receipt lines against the original shipment; no requested amount or total can increase authority. */
    receiptLines: function (r, input) {
        const exact = SERVICE.DefaultExactAmountService;
        if (!Array.isArray(input) || !input.length || input.length > this.policy().maximumLines ||
            new Set(input.map(line => line?.reservationCode)).size !== input.length) this.fail('Receipt lines are invalid');
        return input.map(line => {
            const original = r.lines.find(item => item.reservationCode === line?.reservationCode);
            if (!original || typeof line.quantity !== 'string') this.fail('Receipt does not belong to the original shipment');
            const quantity = exact.normalize(line.quantity);
            if (quantity !== line.quantity || exact.compare(quantity,'0') <= 0 || exact.compare(quantity,original.quantity) > 0)
                this.fail('Receipt exceeds original shipped quantity');
            return { reservationCode: original.reservationCode, quantity };
        }).sort((a,b) => a.reservationCode.localeCompare(b.reservationCode));
    },
    /** Reads every retained receipt and enforces exact remaining shipped authority across concurrent commands. */
    receipts: async function (r) {
        const codes = r.consignment.evidence?.receiptCodes || [], result = [];
        if (!Array.isArray(codes) || codes.length > this.policy().maximumReceipts || new Set(codes).size !== codes.length)
            this.fail('Receipt journal is unconfirmed');
        const totals = new Map(), exact = SERVICE.DefaultExactAmountService;
        for (const code of codes) {
            const row = await this.read('DefaultReturnReceiptService',r,{code});
            if (!row || row.status !== 'RECEIVED' || row.evidence?.refundCode !== r.refundCode ||
                row.evidence.shipmentCode !== r.physicalPlan.shipmentCode || !row.evidence.reviewedBy ||
                row.evidence.evidenceMode !== 'MANUAL_ATTESTATION' || !this.identity(row.evidence.receiptReference))
                this.fail('Original return receipt is unconfirmed');
            const lines = this.receiptLines(r,row.evidence.lines);
            for (const line of lines) {
                const total = exact.add(totals.get(line.reservationCode) || '0',line.quantity);
                if (exact.compare(total,r.lines.find(item => item.reservationCode === line.reservationCode).quantity)>0)
                    this.fail('Receipts exceed original shipment authority');
                totals.set(line.reservationCode,total);
            }
            result.push(row);
        }
        return { rows: result, totals };
    },
    /** Retains one actual manually attested returned package under the reviewed return and consignment CAS. */
    recordReceipt: async function (input) {
        const r = await this.locked(input), command = this.command(r), p = r.payload;
        if (r.physicalPlan.kind !== 'RETURN' || ![this.status('RETURN_PENDING'),this.status('RETURNED')].includes(r.consignment.status) || !this.identity(p.receiptReference))
            this.fail('An open reviewed return and actual receipt reference are required');
        const lines = this.receiptLines(r,p.lines), code = this.code(r,'receipt',command.commandKey);
        const intent = { ...command, refundCode:r.refundCode, shipmentCode:r.physicalPlan.shipmentCode,
            receiptReference:p.receiptReference, lines };
        const verify = async () => {
            const fresh = await this.locked(input), row = await this.read('DefaultReturnReceiptService',fresh,{code});
            if (!row || row.status !== 'RECEIVED' || !fresh.consignment.evidence.receiptCodes.includes(code) ||
                Object.entries(intent).some(([key,value])=>!isDeepStrictEqual(row.evidence[key],value))) return undefined;
            return { status:'RECEIVED',receiptCode:code,lines };
        };
        const existing = await this.read('DefaultReturnReceiptService',r,{code});
        if (existing) { const replay = await verify(); if (!replay) this.fail('Receipt command belongs to different details'); return replay; }
        await this.commit(r, async tx => {
            const consignment = await this.read('DefaultConsignmentService',tx,{code:r.consignment.code});
            if (consignment.status !== this.status('RETURN_PENDING')) this.fail('Return receipt window is closed');
            const receiptState = await this.receipts({...r,transactionContext:tx.transactionContext,consignment});
            if (receiptState.rows.some(row=>row.evidence.receiptReference === p.receiptReference)) this.fail('This returned package already has a receipt');
            if (receiptState.rows.length >= this.policy().maximumReceipts) this.fail('Receipt limit reached');
            const exact = SERVICE.DefaultExactAmountService;
            for (const line of lines) if (exact.compare(exact.add(receiptState.totals.get(line.reservationCode)||'0',line.quantity),
                r.lines.find(item=>item.reservationCode===line.reservationCode).quantity)>0) this.fail('Receipt exceeds remaining shipped quantity');
            await this.insert('DefaultReturnReceiptService',tx,code,'RECEIVED',{...intent,reviewedBy:r.authData.loginId,evidenceMode:'MANUAL_ATTESTATION'});
            return this.update(tx,consignment,{evidence:{...consignment.evidence,receiptCodes:[...consignment.evidence.receiptCodes,code]}});
        },verify);
        return verify();
    },
    /** Records an immutable accepted/rejected inspection against one exact retained receipt; it cannot directly change stock. */
    recordInspection: async function (input) {
        const r = await this.locked(input), command = this.command(r), p = r.payload;
        if (r.physicalPlan.kind !== 'RETURN' || ![this.status('RETURN_PENDING'),this.status('RETURNED')].includes(r.consignment.status) ||
            !r.consignment.evidence.receiptCodes.includes(p.receiptCode) || !['RESTOCK','SCRAP','REJECT_RETURN'].includes(p.disposition))
            this.fail('Inspect an original received package with a supported disposition');
        const receipt = await this.read('DefaultReturnReceiptService',r,{code:p.receiptCode});
        if (!receipt || receipt.status !== 'RECEIVED' || receipt.evidence.refundCode !== r.refundCode) this.fail('Receipt is not confirmed');
        const code = this.code(r,'inspection',receipt.code), status = p.disposition === 'REJECT_RETURN' ? 'REJECTED' : 'INSPECTED';
        const intent = {...command,refundCode:r.refundCode,receiptCode:receipt.code,shipmentCode:r.physicalPlan.shipmentCode,
            lines:receipt.evidence.lines,disposition:p.disposition};
        const verify = async () => {
            const fresh = await this.locked(input), row = await this.read('DefaultReturnInspectionService',fresh,{code});
            if (!row || row.status !== status || Object.entries(intent).some(([key,value])=>!isDeepStrictEqual(row.evidence[key],value))) return undefined;
            return {status,inspectionCode:code,receiptCode:receipt.code,disposition:p.disposition};
        };
        const existing = await this.read('DefaultReturnInspectionService',r,{code});
        if (existing) { const replay = await verify(); if (!replay) this.fail('Receipt already has a different inspection'); return replay; }
        await this.commit(r, async tx => {
            const consignment = await this.read('DefaultConsignmentService',tx,{code:r.consignment.code});
            if (consignment.status !== this.status('RETURN_PENDING')) this.fail('Inspection window is closed');
            await this.insert('DefaultReturnInspectionService',tx,code,status,{...intent,reviewedBy:r.authData.loginId,evidenceMode:'MANUAL_ATTESTATION'});
            return this.update(tx,consignment,{evidence:{...consignment.evidence}});
        },verify);
        return verify();
    },
    /** Produces original inspected stock commands only after full shipment coverage; partial, rejected or missing inspections block Payment. */
    stockAuthority: async function (input) {
        const r = await this.locked(input);
        if (r.physicalPlan.kind === 'CANCELLATION') {
            if (r.consignment.evidence?.dispatch || ![this.status('CANCELLATION_PENDING'),this.status('CANCELLED')].includes(r.consignment.status))
                this.fail('Dispatched goods cannot use cancellation release');
            return {...r,commands:r.lines.map(line=>({...line,referenceCode:r.refundCode,kind:'RELEASE'}))};
        }
        const shipment = await this.shipment(r,r.consignment);
        if (shipment.code !== r.physicalPlan.shipmentCode || !isDeepStrictEqual(shipment.evidence.lines,r.lines)) this.fail('Shipment binding changed');
        const receipts = await this.receipts(r), exact = SERVICE.DefaultExactAmountService, commands = [];
        if (r.lines.some(line=>exact.compare(receipts.totals.get(line.reservationCode)||'0',line.quantity)!==0))
            this.fail('Full shipped quantity must be physically received before refund settlement');
        for (const receipt of receipts.rows) {
            const inspection = await this.read('DefaultReturnInspectionService',r,{code:this.code(r,'inspection',receipt.code)});
            if (!inspection || inspection.status !== 'INSPECTED' || inspection.evidence?.refundCode !== r.refundCode ||
                inspection.evidence.receiptCode !== receipt.code || inspection.evidence.shipmentCode !== shipment.code ||
                !inspection.evidence.reviewedBy || inspection.evidence.evidenceMode !== 'MANUAL_ATTESTATION' || !['RESTOCK','SCRAP'].includes(inspection.evidence.disposition) ||
                !isDeepStrictEqual(inspection.evidence.lines,receipt.evidence.lines)) this.fail('Every original receipt requires an accepted inspection');
            for (const line of receipt.evidence.lines) commands.push({...r.lines.find(item=>item.reservationCode===line.reservationCode),
                quantity:line.quantity,referenceCode:receipt.code,inspectionCode:inspection.code,shipmentCode:shipment.code,
                disposition:inspection.evidence.disposition,kind:'RETURN'});
        }
        return {...r,commands};
    },
    /** Delegates all exact reviewed release/return effects to the atomic Inventory owner. */
    settle: async function (input) { return SERVICE.DefaultInventoryPhysicalReversalService.settle(input); },
    /** Finalizes physical projection only after the original persisted Payment refund and exact stock readback. */
    complete: async function (input) {
        const r = await this.locked(input), evidence = r.physicalApproval.evidence;
        if (!SERVICE.DefaultOrderRefundRecoveryService.checkpointReady('PAYMENT',evidence.steps?.PAYMENT))
            this.fail('Physical completion requires confirmed original Payment refund');
        await SERVICE.DefaultInventoryPhysicalReversalService.settle(input);
        const status = this.status(r.physicalPlan.kind === 'CANCELLATION' ? 'CANCELLED' : 'RETURNED');
        const verify = async () => {
            const fresh = await this.locked(input);
            if (fresh.consignment.status !== status) return undefined;
            return {status:'COMPLETED',consignmentCode:fresh.consignment.code,physicalStatus:status,refundCode:r.refundCode};
        };
        if (r.consignment.status !== status) await this.commit(r, async tx => {
            const current = await this.read('DefaultConsignmentService',tx,{code:r.consignment.code});
            if (current.evidence?.reversal?.refundCode !== r.refundCode || current.status !== this.status(r.physicalPlan.kind === 'CANCELLATION'?'CANCELLATION_PENDING':'RETURN_PENDING'))
                this.fail('Physical completion lock changed');
            return this.update(tx,current,{status});
        },verify);
        return verify();
    }
};
