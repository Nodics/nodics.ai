/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module customerList/src/controller/defaultCustomerListCustomerController @description Maps Customer List HTTP inputs to the secured facade. @layer controller @owner customerList */
module.exports = {
    /**
     * Executes `applyHttp` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    applyHttp: function (request) {
        const http = request.httpRequest || {};
        const params = http.params || {};
        request.listType = (params.listType || request.listType || '').toUpperCase();
        request.entryCode = params.entryCode || request.entryCode;
        request.payload = http.body || request.payload || {};
        request.query = Object.assign({}, request.query || {}, http.query || {});
        return request;
    },
    /**
     * Executes `invoke` as a loader-visible operation owned by this module.
     * @param {*} operation Value defined by the owning module contract.
     * @param {*} request Value defined by the owning module contract.
     * @param {*} callback Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    invoke: function (operation, request, callback) {
        const promise = FACADE.DefaultCustomerListCustomerFacade[operation](this.applyHttp(request)).then(data => ({ data }));
        if (!callback) return promise;
        promise.then(value => callback(null, value)).catch(callback);
    },
    /**
     * Executes `read` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @param {*} callback Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    read: function (request, callback) { return this.invoke('read', request, callback); },
    /**
     * Executes `addEntry` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @param {*} callback Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    addEntry: function (request, callback) { return this.invoke('addEntry', request, callback); },
    /**
     * Executes `removeEntry` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @param {*} callback Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    removeEntry: function (request, callback) { return this.invoke('removeEntry', request, callback); },
    /**
     * Executes `clear` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @param {*} callback Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    clear: function (request, callback) { return this.invoke('clear', request, callback); }
};
