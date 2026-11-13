/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module discoveryPublication/service/defaultDiscoveryRetirementReceiptOwnerService @description Exact original retirement/erasure journal commands; generated persistence retains unique insert and scalar CAS. @layer service @owner discoveryPublication */
module.exports={
    /** Validates exact scalar fields without accepting arbitrary predicates.
     * @param {Object} value Exact record or predicate.
     * @param {string[]} keys Allowed required fields.
     * @returns {Object} Independent scalar copy.
     * @throws {Error} Missing, extra or non-scalar fields.
     */
    exact:function(value,keys){
        if(!value||Object.keys(value).sort().join()!==keys.slice().sort().join()||Object.values(value).some(v=>v!==null&&typeof v!=='string'))throw new Error('Invalid retirement receipt binding');
        return {...value};
    },
    /** Validates trusted owner, actor and tenant-qualified original identity.
     * @param {Object} request Authenticated command.
     * @param {Object} binding Scalar identity.
     * @returns {Object} Generated persistence context.
     * @throws {Error} Nonowner, tenant mismatch or malformed scope.
     */
    context:function(request,binding){
        const dms=SERVICE.DefaultModuleService;
        if(!dms.isLocalModuleActive('discoveryPublication')||!dms.isCurrentRuntimeAuthority(SERVICE.DefaultDiscoveryGenerationTransportService.targetAuthority())||!request.authData||request.tenant!==binding.tenantCode)throw new Error('Retirement receipt owner denied');
        for(const key of ['tenantCode','enterpriseCode','indexName','ownerType'])if(typeof binding[key]!=='string'||!/^[A-Za-z0-9][A-Za-z0-9._:@+-]{0,191}$/.test(binding[key]))throw new Error('Invalid retirement receipt scope');
        if(binding.code!==undefined){
            const scope={tenantCode:binding.tenantCode,enterpriseCode:binding.enterpriseCode,indexName:binding.indexName,indexUUID:binding.indexUUID,ownerType:binding.ownerType};
            if(!/^[A-Za-z0-9_-]{10,128}$/.test(binding.indexUUID||'')||binding.code!=='index-retirement-'+SERVICE.DefaultModelCommandReceiptService.digest(scope))throw new Error('Invalid retirement receipt identity');
        }
        return {tenant:request.tenant,authData:request.authData,internalPersistence:'DURABLE_JOURNAL'};
    },
    /** Reads only exact scope, never arbitrary caller filters. @param {Object} request Read command. @returns {Promise<Object>} Generated envelope. @throws {Error} Invalid binding. */
    read:function(request){
        const keys=['tenantCode','enterpriseCode','indexName','ownerType'];if(request.binding?.code!==undefined)keys.push('code','indexUUID');
        const query=this.exact(request.binding,keys),context=this.context(request,query);
        return SERVICE.DefaultDiscoveryIndexRetirementReceiptService.get({...context,query,options:{skipItemCache:true},searchOptions:{pageNumber:1,pageSize:2}});
    },
    /** Inserts one canonical STARTED receipt under the existing unique identity. @param {Object} request Claim. @returns {Promise<Object>} Insert result. @throws {Error} Invalid record or duplicate. */
    claim:function(request){
        const record=this.exact(request.record,['tenantCode','enterpriseCode','indexName','indexUUID','ownerType','code','principalCode','planCode','reviewDigest','state','startedAt','operationCode']);
        const context=this.context(request,record);
        if(record.state!=='STARTED'||!/^[a-f0-9]{64}$/.test(record.reviewDigest)||!/^[a-f0-9-]{36}$/.test(record.operationCode)||!Number.isFinite(Date.parse(record.startedAt)))throw new Error('Invalid retirement claim');
        return SERVICE.DefaultDiscoveryIndexRetirementReceiptService.save({...context,options:{insertOnly:true},model:record});
    },
    /** Completes only the originally claimed scalar retirement record. @param {Object} request Completion. @returns {Promise<Object>} CAS result. @throws {Error} Invalid transition. */
    complete:function(request){
        const query=this.exact(request.binding,['tenantCode','enterpriseCode','indexName','indexUUID','ownerType','code','principalCode','planCode','reviewDigest','state','startedAt','operationCode']);
        const model=this.exact(request.record,['state','completedAt']);
        if(query.state!=='STARTED'||model.state!=='RETIRED'||!Number.isFinite(Date.parse(model.completedAt)))throw new Error('Invalid retirement completion');
        return SERVICE.DefaultDiscoveryIndexRetirementReceiptService.update({...this.context(request,query),query,model});
    },
    /** Claims or completes the existing receipt's immutable erasure attempt.
     * @param {Object} request Scalar original binding and erasure patch.
     * @param {boolean} completing Whether this is completion.
     * @returns {Promise<Object>} Generated CAS result.
     * @throws {Error} Missing original binding or invalid one-shot transition.
     */
    erasure:function(request,completing){
        const keys=['code','tenantCode','enterpriseCode','indexName','ownerType','indexUUID','principalCode','planCode','state','reviewDigest'];
        if(completing)keys.push('erasure.state','erasure.reviewDigest','erasure.indexName','erasure.startedAt');else keys.push('erasure');
        const query=this.exact(request.binding,keys);
        if(!request.record||Object.keys(request.record).join()!=='erasure')throw new Error('Invalid erasure patch');
        const fields=['state','reviewDigest','indexName','startedAt'];if(completing)fields.push('completedAt');
        const erasure=this.exact(request.record.erasure,fields);
        if(query.state!=='RETIRED'||erasure.state!==(completing?'ERASED':'STARTED')||(!completing&&query.erasure!==null)||
            !/^[a-f0-9]{64}$/.test(erasure.reviewDigest)||!Number.isFinite(Date.parse(erasure.startedAt))||
            (completing&&(query['erasure.state']!=='STARTED'||['reviewDigest','indexName','startedAt'].some(key=>query['erasure.'+key]!==erasure[key])||!Number.isFinite(Date.parse(erasure.completedAt)))))throw new Error('Invalid erasure transition');
        return SERVICE.DefaultDiscoveryIndexRetirementReceiptService.update({...this.context(request,query),query,model:{erasure}});
    },
    /** Claims independent erasure. @param {Object} request Claim. @returns {Promise<Object>} CAS result. @throws {Error} Invalid claim. */
    claimErasure:function(request){return this.erasure(request,false);},
    /** Completes original erasure. @param {Object} request Completion. @returns {Promise<Object>} CAS result. @throws {Error} Invalid completion. */
    completeErasure:function(request){return this.erasure(request,true);}
};
