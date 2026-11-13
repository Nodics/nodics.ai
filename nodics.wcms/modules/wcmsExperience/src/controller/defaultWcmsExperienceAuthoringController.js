/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module wcmsExperience/controller/defaultWcmsExperienceAuthoringController
 * @description HTTP boundary for Axis WCMS Experience preview and diagnostics.
 * @layer controller
 * @owner wcmsExperience
 * @override Later modules may extend authoring diagnostics while preserving safe preview behavior.
 */
module.exports = {
    /** Initializes the controller lifecycle. @returns {Promise<boolean>} Initialized state. */
    init: function () { return Promise.resolve(true); },

    /** Completes the controller lifecycle. @returns {Promise<boolean>} Initialized state. */
    postInit: function () { return Promise.resolve(true); },

    /** Retains the original HTTP authorization for CMS-owned scope admission; body values never supply identity. */
    originalAuthorization: function (request) {
        if (request.httpRequest) {
            const headers = request.httpRequest.headers || {};
            request.authorization = headers.authorization || headers.Authorization;
        }
    },

    /** Preserves the original caller and maps only owner-safe failures for guided placement operations. */
    authoring: function (operation, request, callback) {
        this.originalAuthorization(request);
        const promise = Promise.resolve().then(() => SERVICE.DefaultWcmsExperienceAuthoringService[operation](request))
            .catch(error => { if (error instanceof CLASSES.NodicsError) throw error; return SERVICE.DefaultWcmsExperienceAuthoringService.fail(); });
        if (!callback) return promise;
        promise.then(value => callback(null, this.success(value))).catch(callback);
    },
    /** Reads the exact saved page and configured targeting choices. */
    inspectPlacements: function (request, callback) { return this.authoring('inspect', request, callback); },
    /** Executes one explicitly reviewed placement edit. */
    savePlacement: function (request, callback) { return this.authoring('save', request, callback); },

    /** Dispatches only fixed private-preview operations through the existing facade. */
    preparation: function (operation, request, callback) {
        this.originalAuthorization(request);
        const pending = Promise.resolve().then(() => FACADE.DefaultWcmsExperienceDeliveryFacade[operation](request))
            .catch(error => {
                if (error instanceof CLASSES.NodicsError) throw error;
                return SERVICE.DefaultWcmsExperiencePreviewPreparationService.fail();
            });
        if (!callback) return pending;
        pending.then(value => callback(null, this.success(value))).catch(error => callback(error));
    },
    /** Reads original owner evidence without replay. */
    inspectPreparation: function (request, callback) { return this.preparation('inspectPreparation', request, callback); },
    /** Explicitly prepares a private Staged generation; no Online publication is performed. */
    preparePreview: function (request, callback) { return this.preparation('preparePreview', request, callback); },
    /** Retires only the inspected uncertain writer. */
    abandonPreparation: function (request, callback) { return this.preparation('abandonPreparation', request, callback); },

    /** Dispatches a currently authorized Online index command. */
    onlineCommand: function(operation,request,callback){this.originalAuthorization(request);
        const promise=Promise.resolve().then(()=>SERVICE.DefaultWcmsExperienceOnlineIndexControlService.invoke(operation,request)).catch(error=>{
            const known=['ERR_WCMS_EXPERIENCE_ONLINE_INSPECTION_REQUIRED','ERR_AUTH_00001','ERR_AUTH_00003'];
            if(known.includes(error?.code))throw new CLASSES.NodicsError(error.code);
            if(error instanceof CLASSES.NodicsError)throw error;
            throw new CLASSES.NodicsError('ERR_WCMS_EXPERIENCE_INDEX_SERVICE_UNAVAILABLE');
        });
        if(!callback)return promise;promise.then(value=>callback(null,this.success(value))).catch(callback);},
    /** Inspects the exact current Online generation. */
    onlineIndex:function(request,callback){return this.onlineCommand('inspect',request,callback);},
    /** Retires an explicitly inspected pending writer without deleting data. */
    retireOnlineIndex:function(request,callback){return this.onlineCommand('retire',request,callback);},
    /** Explicitly rebuilds from current approved public manifests. */
    rebuildOnlineIndex:function(request,callback){return this.onlineCommand('rebuild',request,callback);},
    /** Formats a successful WCMS Experience authoring response. @param {*} value Service result. @returns {Object} API payload. */
    success: function (value) {
        return { code: 'SUC_WCMS_EXPERIENCE_00000', result: value && value.result !== undefined ? value.result : value };
    },

    /** Resolves a Staged preview experience for Axis. @param {Object} request Nodics request. @param {Function} callback Callback. @returns {Promise|undefined} Operation when no callback is supplied. */
    preview: function (request, callback) {
        this.originalAuthorization(request);
        request.experience = Object.assign({}, this.readContext(request), { previewMode: true });
        let operation = FACADE.DefaultWcmsExperienceDeliveryFacade.resolve(request);
        if (!callback) return operation;
        operation.then(success => callback(null, this.success(success))).catch(error => callback(error));
    },

    /** Returns current index status for Axis diagnostics. @param {Object} request Nodics request. @param {Function} callback Callback. @returns {Promise|undefined} Operation when no callback is supplied. */
    indexStatus: function (request, callback) {
        this.originalAuthorization(request);
        let operation = SERVICE.DefaultWcmsExperienceIndexStatusService.getStatus(request);
        if (!callback) return operation;
        operation.then(success => callback(null, this.success(success))).catch(error => callback(error));
    },

    /** Accepts inert journey fields only. HTTP callers cannot change the clock,
     * tenant, identity or trusted customer-segment membership.
     * @param {Object} request HTTP request. @returns {Object} Allowed context.
     */
    readContext: function (request) {
        const body = this.readBody(request);
        return Object.fromEntries(['site', 'pageType', 'targetType', 'targetCode', 'locale', 'channel', 'device', 'region'].filter(key => Object.hasOwn(body, key)).map(key => [key, body[key]]));
    },

    /** Reads request body from Nodics request shapes. @param {Object} request Nodics request. @returns {Object} Body. */
    readBody: function (request) {
        if (request && request.httpRequest && request.httpRequest.body) return request.httpRequest.body;
        return request && request.body ? request.body : {};
    }
};
