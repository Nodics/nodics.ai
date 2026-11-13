/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module discoveryProjection/service/defaultDiscoveryPhysicalRetirementBoundaryService @description Bounded physical commands using model-owned authority qualification and fresh source-owner decisions. @layer service @owner discoveryProjection */
module.exports = {
    /** Selects immutable scope and transient credential, rejecting callback-shaped declarations.
     * @param {Object} request Trusted source declaration.
     * @param {string} [reviewDigest] Exact review.
     * @returns {Object} JSON-only bounded request.
     * @throws {Error} Invalid scope or credential.
     */
    body: function(request, reviewDigest) {
        if (request.assertCurrent || request.replacementEvidence) throw new Error('Physical command cannot transport callbacks');
        const body = {};
        for (const key of ['tenant','enterpriseCode','principalCode','legacyIndexName','planCode','ownerType']) {
            const value=request[key];
            if (typeof value!=='string'||!/^[A-Za-z0-9][A-Za-z0-9._:@+-]{0,191}$/.test(value)) throw new Error('Invalid retirement scope');
            body[key]=value;
        }
        if (typeof request.sourceCredential!=='string'||!request.sourceCredential||request.sourceCredential.length>32768||
            !/^[a-f0-9]{64}$/.test(request.sourceFingerprint||'')) throw new Error('Signed source authority required');
        body.sourceCredential=request.sourceCredential;body.sourceFingerprint=request.sourceFingerprint;
        if(reviewDigest!==undefined){if(!/^[a-f0-9]{64}$/.test(reviewDigest))throw new Error('Invalid retirement review');body.reviewDigest=reviewDigest;}
        return body;
    },
    /** Reconstructs local guards from the qualified physical model; caller data cannot choose callback endpoints.
     * @param {Object} request Authenticated fixed operation.
     * @param {string} operation Fixed command determining required source permission.
     * @returns {Object} Owner-local request with fresh async checks.
     * @throws {Error} Missing owner, authority binding or rejected source decision.
     */
    declaration: function(request, operation) {
        const body=this.body(request,request.reviewDigest);
        const owner=SERVICE.DefaultDiscoveryPhysicalRetirementService;
        const model=owner.model(body);
        const defaults=(((CONFIG.get('discovery')||{}).projection||{}).retirement||{}).authorityDefaults||{};
        const authority=structuredClone({...defaults,...model.indexDef.retirement.authority});
        const authorityDigest=owner.digest(model.indexDef.retirement.authority);
        if(Object.keys(authority).some(key=>!['moduleName','serviceName','operationName','apiName','targetAuthority'].includes(key)))throw new Error('Invalid authority binding');
        if(!authority || typeof authority.moduleName!=='string'||! /^[A-Za-z][A-Za-z0-9_.-]{0,127}$/.test(authority.moduleName)||
            typeof authority.serviceName!=='string'||!/^Default[A-Za-z0-9]+Service$/.test(authority.serviceName)||
            authority.operationName!=='validateRetirementAuthority'||authority.apiName!=='/internal/discovery/retirement-authority') throw new Error('Qualified source authority binding required');
        const targetAuthority=SERVICE.DefaultModuleService.normalizeTargetAuthority(authority.targetAuthority);
        const check=async legacy=>{
            if(owner.model(body)!==model||owner.digest(model.indexDef.retirement.authority)!==authorityDigest)throw new Error('Retirement binding changed');
            const payload={...body,operation,legacy:legacy?{index:legacy.index,uuid:legacy.uuid}:undefined};
            delete payload.reviewDigest;
            const result=await SERVICE.DefaultModuleService.invokeModule({moduleName:authority.moduleName,targetAuthority,
                serviceName:authority.serviceName,operationName:authority.operationName,apiName:authority.apiName,methodName:'POST',
                tenant:body.tenant,request:payload,requestBody:payload});
            if(!result || result.fingerprint!==body.sourceFingerprint || result.principalCode!==body.principalCode ||
                result.enterpriseCode!==body.enterpriseCode || result.ownerType!==body.ownerType || result.legacyIndexName!==body.legacyIndexName ||
                result.planCode!==body.planCode || result.tenant!==body.tenant || (legacy&&!Array.isArray(result.replacements))) throw new Error('Source retirement authority changed');
            if(owner.model(body)!==model||owner.digest(model.indexDef.retirement.authority)!==authorityDigest)throw new Error('Retirement binding changed');
            return result.replacements;
        };
        return {...body,authData:request.authData,assertCurrent:async()=>{await check();},replacementEvidence:check};
    },
    /** Runs a fixed physical operation with fresh domain checks and no automatic replay.
     * @param {string} operation Fixed operation.
     * @param {Object} request Bounded authenticated payload.
     * @returns {Promise<Object>} Public result without credentials or model handles.
     * @throws {Error} Admission failure or original uncertain outcome.
     */
    run: async function(operation,request){
        if(!['preview','execute','inspect','previewErasure','erase','inspectErasure'].includes(operation))throw new Error('Unsupported physical command');
        const declaration=this.declaration(request,operation),owner=SERVICE.DefaultDiscoveryPhysicalRetirementService;
        if(operation==='inspect')return owner.project(declaration,await owner.inspect(declaration));
        if(operation==='inspectErasure')return owner.projectErasure(declaration,await owner.erasureEvidence(declaration));
        return owner[operation](declaration,request.reviewDigest);
    },
    /** Reviews retirement. @param {Object} request Payload. @returns {Promise<Object>} Review. @throws {Error} Denial. */
    preview:function(request){return this.run('preview',request);},
    /** Executes retirement once. @param {Object} request Payload. @returns {Promise<Object>} Receipt. @throws {Error} Denial or uncertain outcome. */
    execute:function(request){return this.run('execute',request);},
    /** Inspects original retirement. @param {Object} request Payload. @returns {Promise<Object>} Status. @throws {Error} Denial. */
    inspect:function(request){return this.run('inspect',request);},
    /** Reviews erasure separately. @param {Object} request Payload. @returns {Promise<Object>} Review. @throws {Error} Denial. */
    previewErasure:function(request){return this.run('previewErasure',request);},
    /** Executes erasure once. @param {Object} request Payload. @returns {Promise<Object>} Receipt. @throws {Error} Denial or uncertain outcome. */
    erase:function(request){return this.run('erase',request);},
    /** Inspects original erasure. @param {Object} request Payload. @returns {Promise<Object>} Status. @throws {Error} Denial. */
    inspectErasure:function(request){return this.run('inspectErasure',request);}
};
