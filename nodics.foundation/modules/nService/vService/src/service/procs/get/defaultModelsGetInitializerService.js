/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module service/vService/procs/get/DefaultModelsGetInitializerService
 * @description Selects schema-owned current-version reads while retaining the
 * generic secured get pipeline and response envelope.
 * @layer service
 * @owner nService
 * @override Project modules may add version-aware get behavior here without
 * modifying the generic database get pipeline service.
 */
module.exports = {
    /** Selects the owning model read method without accepting request-owned mode overrides. */
    resolveReadMethod: function (request) {
        const model = request.schemaModel;
        const mode = (model.rawSchema || {}).versionedReadMode;
        if (mode === undefined || mode === 'HISTORY') return 'getItems';
        if (mode !== 'CURRENT' || model.versioned !== true || typeof model.getCurrentVersionItems !== 'function') {
            throw new CLASSES.NodicsError('ERR_FIND_00003', 'Selected version-aware read capability is unavailable');
        }
        if (Object.prototype.hasOwnProperty.call(request.query || {}, 'versionId')) {
            if (!Number.isSafeInteger(request.query.versionId) || request.query.versionId < 0) {
                throw new CLASSES.NodicsError('ERR_FIND_00003', 'Exact version reads require a nonnegative safe integer');
            }
            return 'getItems';
        }
        return 'getCurrentVersionItems';
    },
    /**
     * This function is used to initiate entity loader process. If there is any functionalities, required to be executed on entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * This function is used to finalize entity loader process. If there is any functionalities, required to be executed after entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },


};
