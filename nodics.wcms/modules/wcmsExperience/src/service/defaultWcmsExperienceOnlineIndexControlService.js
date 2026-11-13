/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module wcmsExperience/service/defaultWcmsExperienceOnlineIndexControlService @description Admits Site-scoped operators and routes only fixed Online inspection, retirement and rebuild commands. @layer service @owner wcmsExperience */
module.exports={
    /** Emits stable owner guidance without exposing provider internals. */
    fail:function(){throw new CLASSES.NodicsError('ERR_WCMS_EXPERIENCE_ONLINE_INSPECTION_REQUIRED');},
    /** Authorizes the original employee against persisted Site and Catalog ownership before every command. */
    invoke:async function(operation,request){
        const input=request.httpRequest?.body && Object.keys(request.httpRequest.body).length?request.httpRequest.body:request.httpRequest?.query || request.body || request.query || {};
        const keys=operation==='inspect'?['site']:operation==='retire'?['site','revision','pendingGeneration']:['site','revision'];
        if(!['inspect','retire','rebuild'].includes(operation)||Object.keys(input).some(key=>!keys.includes(key))||typeof input.site!=='string')this.fail();
        const access=SERVICE.DefaultCmsDesignerAccessService,permission=operation==='inspect'?'WCMS_EXPERIENCE_PUBLISH_STATUS':'WCMS_EXPERIENCE_OVERRIDE';
        const actor={...request};access.authorize(actor,permission);
        const sites=await access.records('DefaultCmsSiteService',actor,{code:input.site,active:true});
        const catalogs=[...new Set(sites.map(row=>row.catalog))];if(!sites.length||catalogs.length!==1)access.deny();
        await access.scope({...actor,body:{site:input.site,catalogCode:catalogs[0]}},permission);
        const body={...input,operation,tenant:request.tenant};
        return SERVICE.DefaultModuleService.invokeModule({moduleName:'wcmsExperience',connectionName:CONFIG.get('cms')?.publication?.target?.connectionName,targetAuthority:{publication:'ONLINE'},local:false,maxAttempts:1,
            serviceName:'DefaultWcmsExperienceOnlineIndexControlService',operationName:'execute',apiName:'/internal/online-index',methodName:'POST',tenant:request.tenant,requestBody:body,responseSelector:response=>response?.result});
    },
    /** Accepts service-owned exact commands only; no browser-controlled identity, model, query or source is admitted. */
    execute:async function(request){
        const native=SERVICE.DefaultServiceTokenService.requireRuntimePrincipal(request,'wcmsExperience');
        const input=request.body || request.httpRequest?.body || request;
        if(request.authData?.tokenType!=='service'||input.tenant!==request.tenant)this.fail();
        const {site,operation,revision,pendingGeneration}=input,owner=SERVICE.DefaultWcmsExperienceOnlinePublicationService;
        const persistence={...request,authData:{...native,...SERVICE.DefaultIdentityGovernanceService.getSystemAuthData()}};
        if(operation==='inspect')return owner.inspect(site,persistence);
        if(!Number.isSafeInteger(revision)||revision<0)this.fail();
        const observed=await owner.inspect(site,request);
        if(observed.revision!==revision)this.fail();
        if(operation==='retire'){if(typeof pendingGeneration!=='string'||pendingGeneration!==observed.pendingGeneration)this.fail();return owner.retire(site,revision,pendingGeneration,persistence);}
        if(operation==='rebuild'&&!observed.pendingGeneration)return owner.publish(site,persistence);
        this.fail();
    }
};
