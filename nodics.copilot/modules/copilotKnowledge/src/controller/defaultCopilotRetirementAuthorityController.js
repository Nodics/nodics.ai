/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module copilotKnowledge/controller/defaultCopilotRetirementAuthorityController @description Fixed internal source-evidence port; original employee token is independently verified by the source owner. @layer controller @owner copilotKnowledge */
module.exports={
    /** Preserves middleware tenant; transient source credential is never an actor assertion.
     * @param {Object} request Authenticated service request.
     * @param {Function} callback Optional pipeline callback.
     * @returns {Promise|undefined} Bounded evidence.
     * @throws {Error} Tenant mismatch or fresh authority refusal.
     */
    validate:function(request,callback){
        const promise=Promise.resolve().then(()=>{
            if(request.body?.tenant!==request.tenant)throw new Error('Source authority tenant mismatch');
            return SERVICE.DefaultCopilotKnowledgeMigrationService.validateRetirementAuthority({...request.body,tenant:request.tenant});
        });
        if(callback){promise.then(value=>callback(null,value),error=>callback(error));return;}
        return promise;
    }
};
