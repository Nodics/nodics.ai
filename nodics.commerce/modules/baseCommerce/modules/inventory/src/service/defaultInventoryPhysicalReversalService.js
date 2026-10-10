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
/** @module inventory/service/defaultInventoryPhysicalReversalService @description Commits reviewed physical shipment, pre-dispatch release and inspected return dispositions through existing Inventory balance, reservation and movement owners. @layer service @owner inventory @override Preserve original hold proof, fresh Fulfillment/Order authority, exact remaining quantities, atomic readback and replay. Never impersonate the checkout customer. */
module.exports = {
    /** Refuses missing original authority through the existing stock error contract. */
    fail: function () { return SERVICE.DefaultInventoryReservationOperationService.fail(); },
    /** Reuses Inventory's generated, qualified persistence owner. */
    owner: function () { return SERVICE.DefaultInventoryReservationOperationService; },
    /** Derives an append-only stock movement identity from original command and hold. */
    movementCode: function (r, kind, referenceCode, reservationCode) {
        return 'physical-stock-' + crypto.createHash('sha256').update(JSON.stringify([r.tenant,r.enterpriseCode,kind,referenceCode,reservationCode])).digest('hex');
    },
    /** Rechecks original acquisition movement and exact Order line without treating legacy reservation rows as stock authority. */
    hold: async function (r, line) {
        const owner = this.owner(), row = await owner.read('DefaultInventoryReservationService',r,{code:line.reservationCode});
        if (!row || row.ownerType !== 'ORDER' || row.ownerCode !== r.orderCode || row.ownerId !== r.ownerId ||
            row.sku !== line.sku || row.warehouseCode !== line.warehouseCode || row.balanceCode !== line.balanceCode ||
            row.quantity !== line.quantity || !['ACTIVE','CONSUMED','RELEASED'].includes(row.status) ||
            !Number.isSafeInteger(row.revision) || row.revision < 0) this.fail();
        const reserve = await owner.read('DefaultInventoryMovementService',r,{code:owner.movementCode(r,row.code,'RESERVE')});
        const balance = await owner.read('DefaultInventoryBalanceService',r,{code:row.balanceCode}), exact = SERVICE.DefaultExactAmountService;
        if (!reserve || !balance || reserve.movementType !== 'RESERVE' || reserve.referenceCode !== row.code ||
            reserve.quantity !== row.quantity || reserve.sku !== row.sku || reserve.warehouseCode !== row.warehouseCode ||
            balance.sku !== row.sku || balance.warehouseCode !== row.warehouseCode ||
            !Number.isSafeInteger(reserve.balanceRevision) || !Number.isSafeInteger(balance.revision) || balance.revision < reserve.balanceRevision ||
            ['available','reserved','allocated','onHand'].some(key=>typeof balance[key] !== 'string' ||
                exact.normalize(balance[key]) !== balance[key] || exact.compare(balance[key],'0') < 0) ||
            exact.compare(balance.onHand,exact.add(balance.available,exact.add(balance.reserved,balance.allocated))) !== 0 ||
            exact.compare(row.quantity,'0') <= 0 || row.returnedQuantity !== undefined &&
                (typeof row.returnedQuantity !== 'string' || exact.normalize(row.returnedQuantity) !== row.returnedQuantity ||
                    exact.compare(row.returnedQuantity,'0') < 0 || exact.compare(row.returnedQuantity,row.quantity)>0)) this.fail();
        return {row,balance};
    },
    /** Verifies all scoped original holds and, for shipped stock, the retained owner-issued SHIP movements. */
    verify: async function (r, lines, status, shipmentCode) {
        await this.owner().persistence(r);
        if (!Array.isArray(lines) || !lines.length || new Set(lines.map(line=>line.reservationCode)).size !== lines.length) this.fail();
        const rows = [];
        for (const line of lines) {
            const {row} = await this.hold(r,line);
            if (row.status !== status) this.fail();
            if (status === 'CONSUMED') {
                const proof = await this.owner().read('DefaultInventoryMovementService',r,{code:this.movementCode(r,'SHIP',shipmentCode,row.code)});
                if (row.evidence?.shipmentCode !== shipmentCode || !proof || proof.movementType !== 'SHIP' ||
                    proof.referenceCode !== shipmentCode || proof.quantity !== row.quantity || proof.sku !== row.sku ||
                    proof.warehouseCode !== row.warehouseCode || proof.evidence?.reservationCode !== row.code) this.fail();
            }
            rows.push(row);
        }
        return rows;
    },
    /** Validates exact immutable stock movement readback, including the original reviewed receipt and disposition. */
    proof: async function (r, command) {
        const code = this.movementCode(r,command.kind,command.referenceCode,command.reservationCode);
        const row = await this.owner().read('DefaultInventoryMovementService',r,{code});
        if (!row) return undefined;
        const evidence = { reservationCode:command.reservationCode, ...(command.kind === 'SHIP' ? {shipmentCode:command.referenceCode} :
            {refundCode:r.refundCode}), ...(command.kind === 'RETURN' ? {shipmentCode:command.shipmentCode,
                inspectionCode:command.inspectionCode,disposition:command.disposition} : {}) };
        if (row.movementType !== command.kind || row.referenceCode !== command.referenceCode || row.quantity !== command.quantity ||
            row.sku !== command.sku || row.warehouseCode !== command.warehouseCode || !isDeepStrictEqual(row.evidence,evidence) ||
            !Number.isSafeInteger(row.balanceRevision)) this.fail();
        return row;
    },
    /** Builds append-only movement evidence inside the same transaction as its exact stock delta. */
    movement: async function (r, command, revision) {
        const now = new Date();
        return this.owner().insert('DefaultInventoryMovementService',r,{tenant:r.tenant,enterpriseCode:r.enterpriseCode,
            code:this.movementCode(r,command.kind,command.referenceCode,command.reservationCode),warehouseCode:command.warehouseCode,
            sku:command.sku,quantity:command.quantity,movementType:command.kind,referenceCode:command.referenceCode,
            balanceRevision:revision,occurredAt:now,correlationId:r.correlationId || command.referenceCode,active:true,created:now,updated:now,
            evidence:{reservationCode:command.reservationCode,...(command.kind === 'SHIP'?{shipmentCode:command.referenceCode}:{refundCode:r.refundCode}),
                ...(command.kind === 'RETURN'?{shipmentCode:command.shipmentCode,inspectionCode:command.inspectionCode,disposition:command.disposition}:{})}});
    },
    /** Confirms every original movement and resulting hold after a successful or ambiguous commit, without repeating stock deltas. */
    outcome: async function (r, commands) {
        const exact = SERVICE.DefaultExactAmountService;
        for (const command of commands) {
            const original = r.lines.find(line=>line.reservationCode === command.reservationCode), {row,balance} = await this.hold(r,original);
            const proof = await this.proof(r,command);
            if (!proof || balance.revision < proof.balanceRevision) this.fail();
            if (command.kind === 'SHIP' && (row.status !== 'CONSUMED' || row.evidence?.shipmentCode !== r.shipmentCode) ||
                command.kind === 'RELEASE' && (row.status !== 'RELEASED' || row.evidence?.refundCode !== r.refundCode) ||
                command.kind === 'RETURN' && (row.status !== 'CONSUMED' || row.evidence?.refundCode !== r.refundCode ||
                    !row.evidence.returnMovementCodes?.includes(proof.code) || exact.compare(row.returnedQuantity || '0',row.quantity)!==0)) this.fail();
            if (command.kind === 'RETURN') {
                const expected = commands.filter(item=>item.reservationCode===row.code).map(item=>this.movementCode(r,item.kind,item.referenceCode,item.reservationCode)).sort();
                if (!isDeepStrictEqual(row.evidence.returnMovementCodes?.slice().sort(),expected)) this.fail();
            }
        }
        return { status: 'SETTLED', movementCodes:commands.map(command=>this.movementCode(r,command.kind,command.referenceCode,command.reservationCode)) };
    },
    /** Commits one owner-admitted shipment or reversal atomically across all exact original Inventory lines. */
    execute: async function (input, operation) {
        const physical = SERVICE.DefaultPhysicalOrderReversalService, owner = this.owner();
        const resolve = () => operation === 'SHIP' ? physical.dispatchStockAuthority(input) : physical.stockAuthority(input);
        const r = await resolve();
        r.commands = operation === 'SHIP' ? r.lines.map(line=>({...line,kind:'SHIP',referenceCode:r.shipmentCode})) : r.commands;
        const commands = structuredClone(r.commands);
        if (!commands?.length || commands.length > 10000 || new Set(commands.map(command=>this.movementCode(r,command.kind,command.referenceCode,command.reservationCode))).size !== commands.length)
            this.fail();
        await owner.persistence(r);
        try {
            await SERVICE.DefaultDatabaseTransactionService.execute({moduleName:'inventory',tenant:r.tenant},async transactionContext=>{
                const fresh = await resolve();
                const freshCommands = operation === 'SHIP' ? fresh.lines.map(line=>({...line,kind:'SHIP',referenceCode:fresh.shipmentCode})) : fresh.commands;
                if (!isDeepStrictEqual(commands,freshCommands) || fresh.ownerId !== r.ownerId || fresh.orderCode !== r.orderCode ||
                    fresh.enterpriseCode !== r.enterpriseCode || fresh.tenant !== r.tenant || fresh.refundCode !== r.refundCode ||
                    fresh.shipmentCode !== r.shipmentCode) this.fail();
                const tx = {...r,transactionContext}, exact = SERVICE.DefaultExactAmountService;
                for (const command of commands) {
                    const original = r.lines.find(line=>line.reservationCode===command.reservationCode), {row,balance} = await this.hold(tx,original);
                    const existing = await this.proof(tx,command);
                    if (existing) continue;
                    const quantity = command.quantity, negative = exact.multiply(quantity,'-1');
                    let patch, holdPatch;
                    if (command.kind === 'SHIP' || command.kind === 'RELEASE') {
                        if (row.status !== 'ACTIVE' || row.evidence?.shipmentCode || row.evidence?.refundCode ||
                            quantity !== row.quantity || exact.compare(balance.reserved,quantity)<0) this.fail();
                        if (command.kind === 'SHIP') {
                            if (exact.compare(balance.onHand,quantity)<0) this.fail();
                            patch = {reserved:exact.add(balance.reserved,negative),onHand:exact.add(balance.onHand,negative)};
                            holdPatch = {status:'CONSUMED',evidence:{...row.evidence,shipmentCode:r.shipmentCode}};
                        } else {
                            patch = {reserved:exact.add(balance.reserved,negative),available:exact.add(balance.available,quantity)};
                            holdPatch = {status:'RELEASED',evidence:{...row.evidence,refundCode:r.refundCode}};
                        }
                    } else if (command.kind === 'RETURN') {
                        const total = exact.add(row.returnedQuantity || '0',quantity);
                        if (row.status !== 'CONSUMED' || row.evidence?.shipmentCode !== command.shipmentCode ||
                            row.evidence?.refundCode && row.evidence.refundCode !== r.refundCode ||
                            exact.compare(total,row.quantity)>0 || !['RESTOCK','SCRAP'].includes(command.disposition)) this.fail();
                        const ship = await this.proof(tx,{...original,kind:'SHIP',referenceCode:command.shipmentCode});
                        if (!ship) this.fail();
                        patch = command.disposition === 'RESTOCK' ? {available:exact.add(balance.available,quantity),onHand:exact.add(balance.onHand,quantity)} : {};
                        holdPatch = {returnedQuantity:total,evidence:{...row.evidence,refundCode:r.refundCode,
                            returnMovementCodes:[...(row.evidence.returnMovementCodes || []),this.movementCode(r,'RETURN',command.referenceCode,row.code)]}};
                    } else this.fail();
                    const revision = balance.revision + 1;
                    await owner.update('DefaultInventoryBalanceService',tx,balance,{...patch,revision,updated:new Date()});
                    await this.movement(tx,command,revision);
                    await owner.update('DefaultInventoryReservationService',tx,row,{...holdPatch,revision:row.revision+1,updated:new Date()});
                }
                await this.outcome(tx,commands);
            });
        } catch (error) {
            try { return await this.outcome(r,commands); } catch (_) { /* Ambiguous evidence stays recoverable, never double-applied. */ }
            error.inventoryPhysicalRecoveryRequired = true;
            throw error;
        }
        return this.outcome(r,commands);
    },
    /** Consumes original reserved units only under the retained reviewed dispatch lock. */
    ship: async function (input) { return this.execute(input,'SHIP'); },
    /** Releases pre-dispatch holds or disposes fully received/inspected returns using fresh reviewed owner authority. */
    settle: async function (input) { return this.execute(input,'REVERSE'); }
};
