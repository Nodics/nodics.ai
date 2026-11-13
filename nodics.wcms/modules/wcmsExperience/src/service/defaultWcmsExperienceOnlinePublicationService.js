/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
const crypto = require('node:crypto');
/** @module wcmsExperience/service/defaultWcmsExperienceOnlinePublicationService
 * @description Publishes complete immutable Online experience generations from active public CMS manifests through Discovery.
 * @layer service @owner wcmsExperience
 * @override Preserve current CMS pointer checks, guarded writes, scoped visibility and explicit pending-writer retirement. */
module.exports = {
    /** Returns Framework-owned bounded defaults. */
    policy: function () { return (CONFIG.get('wcmsExperience') || {}).indexing || {}; },
    /** Fails without exposing provider details. */
    fail: function () { throw SERVICE.DefaultWcmsExperienceResolverService.error('ERR_WCMS_EXPERIENCE_INDEX_SERVICE_UNAVAILABLE'); },
    /** Requires the Online owner and a bounded site. */
    assertOwner: function (site) {
        if (CONFIG.get('runtimeRole')?.publication !== 'ONLINE' || typeof site !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(site)) this.fail();
    },
    /** Reuses Discovery's existing generation identity as the logical current alias. */
    scope: function (site, request) {
        this.assertOwner(site);
        const projection = (CONFIG.get('wcmsExperience') || {}).projection || {};
        return {tenant: request.tenant, authData: request.authData, guardedWrites: true, indexName: projection.indexName,
            indexConfigurationCode: projection.indexConfigurationCode, ownerType: projection.ownerType,
            ownerCode: 'experience-online-' + crypto.createHash('sha256').update(site).digest('hex').slice(0,40)};
    },
    /** Finds a component only within the exact approved route graph. */
    component: function (items, code, depth = 0) {
        if (depth > ((CONFIG.get('wcmsExperience') || {}).resolver?.maxDepth || 10)) this.fail();
        for (const item of items || []) { if (item.code === code) return item; const child = this.component(item.components, code, depth + 1); if (child) return child; }
    },
    /** Reads bounded active public pointers and their immutable route graphs; never reads mutable placements. */
    source: async function (site, request) {
        this.assertOwner(site);
        const max = this.policy().maximumRoutes, limit = this.policy().maximumPlacements;
        if (!Number.isSafeInteger(max) || max < 1 || !Number.isSafeInteger(limit) || limit < 1) this.fail();
        const response = await SERVICE.DefaultCmsOnlinePublicationPointerService.get({tenant: request.tenant, authData: request.authData,
            query: {site, active: true, accessMode: 'PUBLIC'}, options: {skipItemCache:true}, searchOptions:{limit:max+1,pageSize:max+1}});
        if (!Array.isArray(response?.result) || response.result.length > max) this.fail();
        const pointers = response.result.sort((a,b) => JSON.stringify([a.path,a.locale,a.channel]).localeCompare(JSON.stringify([b.path,b.locale,b.channel])));
        const manifests = SERVICE.DefaultCmsPublicationManifestOrchestrationService, memo = new Map(), entries = new Map(), pins = [];
        if (new Set(pointers.map(pointer=>JSON.stringify([pointer.path,pointer.locale,pointer.channel]))).size !== pointers.length) this.fail();
        for (const pointer of pointers) {
            if (!memo.has(pointer.manifestCode)) memo.set(pointer.manifestCode, await manifests.getManifest(pointer.manifestCode,request));
            const manifest = memo.get(pointer.manifestCode);
            if (!manifest || manifest.active !== true || !manifest.contentHash) this.fail();
            let graph = manifest.snapshot;
            if (graph?.bundleType === 'SITE_INDEX') this.fail(); // Online pointers must select their prepared route manifest.
            if (graph?.bundleType === 'SITE') {
                const candidates = (graph.routes || []).filter(row => ['site','path','locale','channel','accessMode'].every(key=>row[key]===pointer[key]));
                if (candidates.length !== 1) this.fail();
                graph = SERVICE.DefaultCmsDeliveryService.expandSharedComponents(candidates[0],manifest.snapshot.sharedComponents);
            }
            if (!graph || ['site','path','locale','channel','accessMode'].some(key=>graph[key]!==pointer[key]) || !graph.page) this.fail();
            pins.push([pointer.path,pointer.locale,pointer.channel,pointer.manifestCode,manifest.contentHash]);
            for (const placement of manifest.cmsExperiencePlacements || []) {
                if (placement.site !== site || (placement.locale && placement.locale !== graph.locale) || (placement.channel && placement.channel !== graph.channel)) continue;
                const component = this.component(graph.page.components,placement.component);
                if (!component) continue;
                const payload = SERVICE.DefaultWcmsExperiencePublicationIndexingService.toProjectionPayload({...placement,
                    rendererKey: placement.rendererKey, contractVersion: placement.contractVersion,
                    properties: {...component.properties,...(placement.properties || {})}, media: component.media || [], components:component.components || []},
                    {site,locale:graph.locale,channel:graph.channel,publicationStatus:'ONLINE',deliveryStatus:placement.deliveryStatus || 'ACTIVE',release:manifest.publicationCode,indexVersion:manifest.code});
                const clean = SERVICE.DefaultDiscoveryProjectionTransportService.data(payload);
                const key = JSON.stringify([clean.code,clean.locale,clean.channel]);
                if (entries.has(key) && JSON.stringify(entries.get(key)) !== JSON.stringify(clean)) this.fail();
                entries.set(key,clean);
            }
        }
        const values = [...entries.entries()].sort(([a],[b])=>a.localeCompare(b)).map(([,value])=>value);
        if (values.length > limit || Buffer.byteLength(JSON.stringify(values)) > this.policy().maximumProjectionBytes) this.fail();
        const digest = crypto.createHash('sha256').update(JSON.stringify([pins,values])).digest('hex');
        return {digest,values,pins};
    },
    /** Publishes only after every write, refresh, exact count and fresh CMS pointer read agrees. */
    publish: async function (site, request, options = {}) {
        const scope = this.scope(site,request), source = await this.source(site,request), owner = SERVICE.DefaultDiscoveryGenerationPublicationService;
        const descriptor = {digest:source.digest,contentDigest:source.digest,count:source.values.length};
        const assertCurrent = async()=>{if((await this.source(site,request)).digest!==source.digest)this.fail();};
        const unchanged = await owner.unchanged(scope,descriptor,{assertCurrent});
        if(unchanged) return {state:'CURRENT',unchanged:true,generation:unchanged.currentGeneration.token,documentCount:descriptor.count};
        // An outbox retry may observe a completed repair, but may never restart an uncertain writer.
        if(options.inspectOnly===true)throw SERVICE.DefaultWcmsExperienceResolverService.error('ERR_WCMS_EXPERIENCE_ONLINE_INSPECTION_REQUIRED');
        let claimed = await owner.begin(scope,descriptor), token=claimed.pendingGeneration.token;
        for (const [position,value] of source.values.entries()) {
            await assertCurrent();
            const started = await owner.startWrite(scope,claimed);
            const payload = {...value,publicationOwner:scope.ownerCode,publicationGeneration:token};
            const result = await SERVICE.DefaultDiscoveryDocumentProjectionService.doSave({tenant:request.tenant,authData:request.authData,
                targetAuthority:{publication:'ONLINE'},indexName:scope.indexName,model:{code:'experience-online-'+token+'-'+position,tenant:request.tenant,
                    active:true,ownerType:scope.ownerType,ownerCode:value.code,indexConfigurationCode:scope.indexConfigurationCode,status:'CURRENT',payload,sourceHash:source.digest}});
            if(!owner.acknowledged(result))this.fail();
            claimed=await owner.completeWrite(scope,started);
        }
        claimed=await owner.sealWriter(scope,claimed);
        const refreshed=await SERVICE.DefaultDiscoveryDocumentProjectionService.doRefresh({tenant:request.tenant,authData:request.authData,targetAuthority:{publication:'ONLINE'},indexName:scope.indexName});
        const shards=(refreshed?.result?.body || refreshed?.result)?._shards;
        if(!owner.acknowledged(refreshed)||!shards||shards.failed!==0||!Number.isSafeInteger(shards.successful)||shards.successful<1||await owner.count(scope,token)!==descriptor.count)this.fail();
        await assertCurrent();await owner.publish(scope,claimed);
        return {state:'CURRENT',unchanged:false,generation:token,documentCount:descriptor.count};
    },
    /** Resolves only the last complete generation; a pending failed writer cannot hide the previous working alias. */
    read: async function (context) {
        const request=context.sourceRequest || context, scope=this.scope(context.site,request), owner=SERVICE.DefaultDiscoveryGenerationPublicationService;
        const manifest=await owner.read(scope),current=manifest?.currentGeneration;
        if(!current)return [];
        const response=await SERVICE.DefaultDiscoveryDocumentProjectionService.doSearch({tenant:request.tenant,authData:request.authData,targetAuthority:{publication:'ONLINE'},
            indexName:scope.indexName,query:owner.query(scope,current.token),options:{size:this.policy().maximumPlacements,track_total_hits:true}});
        const result=response?.result?.body || response?.result,hits=SERVICE.DefaultDiscoveryRuntimeService.findHits(response,0);
        if(!owner.acknowledged(response)||result?.timed_out!==false||result?._shards?.failed!==0||!hits||hits.total?.relation!=='eq'||hits.total.value!==current.count||hits.hits.length!==current.count)this.fail();
        const rows=SERVICE.DefaultDiscoveryRuntimeService.records(response);
        if(rows.some(row=>row.tenant!==request.tenant||row.payload?.publicationOwner!==scope.ownerCode||row.payload?.publicationGeneration!==current.token||row.payload?.site!==context.site||row.payload?.publicationStatus!=='ONLINE'))this.fail();
        return rows.map(row=>row.payload);
    },
    /** Returns the exact private receipt for an admitted operator. */
    inspect: async function (site,request) {
        const scope=this.scope(site,request),manifest=await SERVICE.DefaultDiscoveryGenerationPublicationService.read(scope);
        return {site,publication:'ONLINE',revision:manifest?.revision ?? 0,state:manifest?.pendingGeneration?'INSPECTION_REQUIRED':manifest?.currentGeneration?'CURRENT':'EMPTY',
            generation:manifest?.currentGeneration?.token,documentCount:manifest?.currentGeneration?.count,
            pendingGeneration:manifest?.pendingGeneration?.token,writer:manifest?.pendingGeneration?.writer};
    },
    /** Retires only the exact inspected writer; old physical writes stay fenced and no bytes are deleted. */
    retire: async function(site,revision,pendingGeneration,request) {
        const scope=this.scope(site,request);
        await SERVICE.DefaultDiscoveryGenerationPublicationService.abandon(scope,revision,pendingGeneration,{assertCurrent:async()=>this.assertOwner(site)});
        return this.inspect(site,request);
    }
};
