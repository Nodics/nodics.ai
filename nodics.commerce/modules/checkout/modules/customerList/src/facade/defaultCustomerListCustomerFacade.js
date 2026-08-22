/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module customerList/src/facade/defaultCustomerListCustomerFacade @description Enforces customer ownership context for wishlist and compare APIs. @layer facade @owner customerList */
module.exports = {
    /**
     * Executes `applyContext` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    applyContext: function (request) {
        const auth = request.authData || {};
        request.tenant = auth.tenant || request.tenant;
        request.ownerId = auth.principalId || auth.code || auth.loginId || request.ownerId;
        if (!request.tenant || !request.ownerId) throw new Error('Authenticated tenant and customer are required');
        return request;
    },
    /**
     * Executes `read` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    read: function (request) { return Promise.resolve().then(() => SERVICE.DefaultCustomerListOperationService.read(this.applyContext(request))); },
    /**
     * Executes `addEntry` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    addEntry: function (request) { return Promise.resolve().then(() => SERVICE.DefaultCustomerListOperationService.addEntry(this.applyContext(request))); },
    /**
     * Executes `removeEntry` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    removeEntry: function (request) { return Promise.resolve().then(() => SERVICE.DefaultCustomerListOperationService.removeEntry(this.applyContext(request))); },
    /**
     * Executes `clear` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    clear: function (request) { return Promise.resolve().then(() => SERVICE.DefaultCustomerListOperationService.clear(this.applyContext(request))); }
};
