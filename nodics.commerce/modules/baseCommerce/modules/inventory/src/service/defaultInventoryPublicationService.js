/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/** @module inventory/src/service/defaultInventoryPublicationService @description Restores Inventory operational records into Online runtime boundaries. @layer service @owner inventory */
module.exports = {
    records: value => Array.isArray(value) ? value : value && typeof value === 'object' ? Object.values(value) : [],
    /**
     * Executes `persistenceModel` as a loader-visible operation owned by this module.
     * @param {*} record Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    persistenceModel: function (record, request) {
        let now = new Date();
        const auth = request && request.authData || {};
        const enterpriseCode = record.enterpriseCode || request && (request.enterpriseCode || request.entCode) || auth.enterpriseCode || auth.entCode;
        return Object.assign({}, record, {
            enterpriseCode: enterpriseCode,
            active: record.active !== undefined ? record.active : true,
            created: record.created instanceof Date ? record.created : now,
            updated: now
        });
    },
    /**
     * Executes `saveAll` as a loader-visible operation owned by this module.
     * @param {*} service Value defined by the owning module contract.
     * @param {*} request Value defined by the owning module contract.
     * @param {*} records Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    saveAll: async function (service, request, records) {
        let restored = [];
        for (let record of records) {
            if (!record || record.tenant !== request.tenant || !record.code) throw new Error('Inventory restoration record escaped its tenant boundary');
            const requestEnterpriseCode = request.enterpriseCode || request.entCode || request.authData && (request.authData.enterpriseCode || request.authData.entCode);
            if (record.enterpriseCode && requestEnterpriseCode && record.enterpriseCode !== requestEnterpriseCode) throw new Error('Inventory restoration record escaped its enterprise boundary');
            let model = this.persistenceModel(record, request);
            await service.save({ tenant: request.tenant, authData: request.authData, model }).then(response => response && Object.prototype.hasOwnProperty.call(response, 'result') ? response.result : response);
            restored.push(model.code);
        }
        return restored;
    },
    /**
     * Executes `restoreOperational` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @param {*} input Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    restoreOperational: async function (request, input) {
        let warehouses = this.records(input.warehouses), inventoryBalances = this.records(input.inventoryBalances);
        if (warehouses.length === 0 || inventoryBalances.length === 0) throw new Error('Warehouses and inventory balances are required for Inventory restoration');
        let restoredWarehouses = await this.saveAll(SERVICE.DefaultWarehouseService, request, warehouses);
        let restoredBalances = await this.saveAll(SERVICE.DefaultInventoryBalanceService, request, inventoryBalances);
        return { tenant: request.tenant, enterpriseCode: request.enterpriseCode || request.entCode || request.authData && (request.authData.enterpriseCode || request.authData.entCode), restored: restoredWarehouses.length + restoredBalances.length, warehouses: restoredWarehouses, inventoryBalances: restoredBalances };
    }
};
