/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module discoveryProjection/service/defaultDiscoveryRetirementReceiptTransportService @description Fixed Publication receipt operations for physical commands; no generic persistence execution. @layer service @owner discoveryProjection */
module.exports = {
    /** Dispatches exact typed receipt data through canonical Publication authority.
     * @param {string} operation Fixed receipt operation.
     * @param {Object} request Existing owner journal request.
     * @returns {Promise<Object>} Original generated envelope.
     * @throws {Error} Invalid scope or owner failure.
     */
    invoke:function(operation,request){
        const target=(((CONFIG.get('discovery')||{}).projection||{}).retirement||{}).receiptTargetAuthority;
        if(!target)throw new Error('Publication authority required');
        const targetAuthority=SERVICE.DefaultModuleService.normalizeTargetAuthority(Object.fromEntries(Object.entries(target).filter(([key,value])=>!(['server','environment'].includes(key)&&value===null))));
        const body=SERVICE.DefaultDiscoveryProjectionTransportService.data({tenant:request.tenant,...(request.query?{binding:request.query}:{}),...(request.model?{record:request.model}:{})});
        return SERVICE.DefaultModuleService.invokeModule({moduleName:'discoveryPublication',targetAuthority,
            serviceName:'DefaultDiscoveryRetirementReceiptOwnerService',operationName:operation,apiName:'/internal/retirement-receipt/'+operation,methodName:'POST',tenant:request.tenant,
            request:{...body,authData:request.authData},requestBody:body,maxAttempts:1});
    },
    /** Reads exact original scope. @param {Object} request Journal read. @returns {Promise<Object>} Original envelope. @throws {Error} Denial. */
    get:function(request){return this.invoke('read',request);},
    /** Claims first retirement only. @param {Object} request Initial receipt. @returns {Promise<Object>} Insert envelope. @throws {Error} Duplicate or denial. */
    save:function(request){return this.invoke('claim',request);},
    /** Advances one fixed original claim. @param {Object} request Scalar binding and patch. @returns {Promise<Object>} CAS result. @throws {Error} Invalid transition or denial. */
    update:function(request){return this.invoke(request.model.erasure?(request.model.erasure.state==='STARTED'?'claimErasure':'completeErasure'):'complete',request);}
};
