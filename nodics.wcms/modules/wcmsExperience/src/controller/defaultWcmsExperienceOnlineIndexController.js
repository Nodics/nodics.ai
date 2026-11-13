/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module wcmsExperience/controller/defaultWcmsExperienceOnlineIndexController @description Fixed authenticated Online indexing owner boundary. @layer controller @owner wcmsExperience */
module.exports={execute:function(request,callback){
 const body=request.httpRequest?.body || request.body || {};
 const promise=Promise.resolve().then(()=>{if(body.tenant!==request.tenant || Object.keys(body).some(key=>!['tenant','site','operation','revision','pendingGeneration'].includes(key)))throw new CLASSES.NodicsError('ERR_WCMS_EXPERIENCE_INPUT_INVALID');
 return SERVICE.DefaultWcmsExperienceOnlineIndexControlService.execute({...request,body});});
 if(!callback)return promise;promise.then(result=>callback(null,{code:'SUC_WCMS_EXPERIENCE_00000',result})).catch(callback);
}};
