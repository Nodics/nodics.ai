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
    persistenceModel: function (record) {
        let now = new Date();
        return Object.assign({}, record, {
            active: record.active !== undefined ? record.active : true,
            created: record.created instanceof Date ? record.created : now,
            updated: now
        });
    },
    saveAll: async function (service, request, records) {
        let restored = [];
        for (let record of records) {
            if (!record || record.tenant !== request.tenant || !record.code) throw new Error('Inventory restoration record escaped its tenant boundary');
            let model = this.persistenceModel(record);
            await service.save({ tenant: request.tenant, authData: request.authData, model }).then(response => response && Object.prototype.hasOwnProperty.call(response, 'result') ? response.result : response);
            restored.push(model.code);
        }
        return restored;
    },
    restoreOperational: async function (request, input) {
        let warehouses = this.records(input.warehouses), inventoryBalances = this.records(input.inventoryBalances);
        if (warehouses.length === 0 || inventoryBalances.length === 0) throw new Error('Warehouses and inventory balances are required for Inventory restoration');
        let restoredWarehouses = await this.saveAll(SERVICE.DefaultWarehouseService, request, warehouses);
        let restoredBalances = await this.saveAll(SERVICE.DefaultInventoryBalanceService, request, inventoryBalances);
        return { tenant: request.tenant, restored: restoredWarehouses.length + restoredBalances.length, warehouses: restoredWarehouses, inventoryBalances: restoredBalances };
    }
};
