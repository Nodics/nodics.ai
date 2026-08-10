/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';

/**
 * @module pricing/src/service/defaultPriceSelectionService
 * @description Selects one tenant-safe, date-effective quantity tier and returns explainable conflict evidence.
 * @layer service
 * @owner pricing
 * @override Later project modules may add customer-group or channel specificity while retaining deterministic precedence and conflict evidence.
 */
module.exports = {
    /** Returns whether an optional validity window contains the decision time. */
    effective: function (record, now) {
        let time = (now || new Date()).getTime();
        return (!record.validFrom || new Date(record.validFrom).getTime() <= time) && (!record.validTo || new Date(record.validTo).getTime() > time);
    },

    /** Selects the most specific quantity tier and explains every rejected row. */
    select: function (request, books, rows, exact) {
        if (!request || !request.tenant || !request.productCode || !request.currency) throw new Error('Tenant, product, and currency are required');
        let quantity = exact.normalize(request.quantity || '1');
        let activeBooks = (books || []).filter(book => book.tenant === request.tenant && book.currency === request.currency && book.status === 'ACTIVE' && this.effective(book, request.now));
        let activeCodes = new Set(activeBooks.map(book => book.code));
        let considered = (rows || []).filter(row => row.tenant === request.tenant && row.productCode === request.productCode);
        let eligible = considered.filter(row => activeCodes.has(row.priceBookCode) && row.currency === request.currency && this.effective(row, request.now) && exact.compare(row.minQuantity || '1', quantity) <= 0);
        eligible.sort((left, right) => exact.compare(right.minQuantity || '1', left.minQuantity || '1') || String(left.code).localeCompare(String(right.code)));
        if (!eligible[0]) return { selected: undefined, quantity: quantity, conflicts: [], explanation: considered.map(row => ({ rowCode: row.code, eligible: false, reason: activeCodes.has(row.priceBookCode) ? 'QUANTITY_OR_WINDOW' : 'PRICE_BOOK_INACTIVE' })) };
        let sameTier = eligible.filter(row => exact.compare(row.minQuantity || '1', eligible[0].minQuantity || '1') === 0);
        let conflicts = sameTier.slice(1).map(row => row.code);
        return {
            selected: eligible[0],
            quantity: quantity,
            conflicts: conflicts,
            explanation: considered.map(row => ({ rowCode: row.code, eligible: eligible.includes(row), selected: row.code === eligible[0].code, reason: row.code === eligible[0].code ? 'HIGHEST_APPLICABLE_TIER' : eligible.includes(row) ? 'LOWER_PRECEDENCE' : 'INELIGIBLE' }))
        };
    }
};
