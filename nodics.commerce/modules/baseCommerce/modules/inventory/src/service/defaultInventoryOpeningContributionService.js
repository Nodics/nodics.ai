/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/**
 * @module inventory/service/DefaultInventoryOpeningContributionService
 * @description Handles immutable opening-intake contributions selected by nImport.
 * Instructions belong to their application/accelerator pack; Inventory alone
 * admits and records stock. No generic balance imports or implicit startup work.
 * @layer service
 * @owner inventory
 * @override Narrow pack limits/validation through later modules while retaining
 * nImport qualification, human Inventory permission and per-receipt atomicity.
 */
module.exports = {
    /** Detaches principal and source before awaited qualification. @param {Object} request Import context. @returns {Object} Original command snapshot. */
    snapshot: function (request) { return { ...request, authData: structuredClone(request.authData || {}), contribution: structuredClone(request.contribution) }; },
    /** Loads detached immutable JSON only through nImport's qualified contribution owner. @param {Object} request Import context. @returns {Promise<Object>} Intake and source. */
    load: async function (request) {
        const contribution = request.contribution;
        if (contribution?.destinationRole !== 'COMMERCE' || contribution.lifecycle !== 'OPERATIONAL_VERSIONED' ||
            contribution.selectionPolicy !== 'EXPLICIT' || contribution.dataType !== 'sample')
            SERVICE.DefaultInventoryOpeningReceiptService.fail();
        const payload = await SERVICE.DefaultDataReleaseService.readContributionPayload(contribution, 'INVENTORY_OPENING_RECEIPTS', 'inventoryOpening.json');
        const maximum = CONFIG.get('inventory')?.openingReceipts?.maximumInstructions ?? 1000;
        if (!Number.isSafeInteger(maximum) || maximum < 1 || maximum > 10000 ||
            !payload || Object.keys(payload).sort().join(',') !== 'contractVersion,receipts' || payload.contractVersion !== 1 ||
            !Array.isArray(payload.receipts) || !payload.receipts.length || payload.receipts.length > maximum ||
            new Set(payload.receipts.map(row => row?.code)).size !== payload.receipts.length ||
            new Set(payload.receipts.map(row => JSON.stringify([row?.warehouseCode, row?.sku]))).size !== payload.receipts.length)
            SERVICE.DefaultInventoryOpeningReceiptService.fail();
        return { receipts: payload.receipts, source: { releaseCode: contribution.releaseCode, version: contribution.version, checksum: contribution.checksum } };
    },
    /** Read-only owner plan; known missing prerequisites are blockers, not installation success. @param {Object} request Original import context. @returns {Promise<Object>} Bounded contribution plan. */
    preflightContribution: async function (request) {
        request = this.snapshot(request);
        const { receipts, source } = await this.load(request);
        const plans = [];
        try {
            for (const input of receipts) plans.push(await SERVICE.DefaultInventoryOpeningReceiptService.inspect(request, input, source));
            return { ready: true, plan: { receiptCount: plans.length, currentCount: plans.filter(row => row.action === 'CURRENT').length } };
        } catch (error) {
            if (!['ERR_INVENTORY_OPENING_UNAVAILABLE', 'ERR_INVENTORY_OPENING_POLICY', 'ERR_INVENTORY_OPENING_CONFLICT', 'ERR_AUTH_00003'].includes(error.code)) throw error;
            return { ready: false, blocker: { owner: 'inventory', code: error.code }, plan: { receiptCount: receipts.length } };
        }
    },
    /** Revalidates the complete pack before receiving any item; each receipt is atomic and replayable, not the entire batch. @param {Object} request Authorized import context. @returns {Promise<Object>} Receipt identities only. */
    installContribution: async function (request) {
        request = this.snapshot(request);
        const { receipts, source } = await this.load(request), owner = SERVICE.DefaultInventoryOpeningReceiptService;
        for (const input of receipts) await owner.inspect(request, input, source);
        const results = [];
        for (const input of receipts) results.push(await owner.receive(request, input, source));
        return { data: { releaseCode: source.releaseCode, version: source.version, receipts: results } };
    }
};
