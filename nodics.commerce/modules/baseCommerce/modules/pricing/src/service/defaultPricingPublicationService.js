/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/** @module pricing/src/service/defaultPricingPublicationService @description Restores Pricing operational records into Online runtime boundaries. @layer service @owner pricing */
module.exports = {
    records: value => Array.isArray(value) ? value : value && typeof value === 'object' ? Object.values(value) : [],
    normalizeDateField: function (model, field) {
        if (!Object.prototype.hasOwnProperty.call(model, field) || model[field] instanceof Date) return;
        if (model[field] === undefined || model[field] === null || model[field] === '') {
            delete model[field];
            return;
        }
        model[field] = new Date(model[field]);
        if (Number.isNaN(model[field].getTime())) delete model[field];
    },
    persistenceModel: function (record) {
        let now = new Date();
        let model = Object.assign({}, record, {
            active: record.active !== undefined ? record.active : true,
            created: record.created instanceof Date ? record.created : now,
            updated: now
        });
        this.normalizeDateField(model, 'validFrom');
        this.normalizeDateField(model, 'validTo');
        return model;
    },
    saveAll: async function (service, request, records) {
        let restored = [];
        for (let record of records) {
            if (!record || record.tenant !== request.tenant || !record.code) throw new Error('Pricing restoration record escaped its tenant boundary');
            let model = this.persistenceModel(record);
            await service.save({ tenant: request.tenant, authData: request.authData, model }).then(response => response && Object.prototype.hasOwnProperty.call(response, 'result') ? response.result : response);
            restored.push(model.code);
        }
        return restored;
    },
    restoreOperational: async function (request, input) {
        let priceBooks = this.records(input.priceBooks), priceRows = this.records(input.priceRows);
        if (priceBooks.length === 0 || priceRows.length === 0) throw new Error('Price books and price rows are required for Pricing restoration');
        let restoredBooks = await this.saveAll(SERVICE.DefaultPriceBookService, request, priceBooks);
        let restoredRows = await this.saveAll(SERVICE.DefaultPriceRowService, request, priceRows);
        return { tenant: request.tenant, restored: restoredBooks.length + restoredRows.length, priceBooks: restoredBooks, priceRows: restoredRows };
    }
};
