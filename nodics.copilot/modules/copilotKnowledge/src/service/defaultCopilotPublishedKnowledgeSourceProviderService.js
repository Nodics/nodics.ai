/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/** @module copilotKnowledge/service/DefaultCopilotPublishedKnowledgeSourceProviderService @description Reads exact governed public CMS Online pages through the owner and revalidates immutable content pins before evidence use. @layer service @owner copilotKnowledge @override Preserve CMS publication proof, configured scope, secret scanning and Discovery ownership. */
module.exports = {
    /** Uses the same effective ingestion limits for ingestion and current-publication checks. */
    configuration: function () { return CONFIG.get('copilot')?.knowledge?.ingestion || {}; },
    /** Resolves the logical public Online connection; deployment coordinates stay outside the provider. */
    connectionName: function () {
        const name=CONFIG.get('copilot')?.knowledge?.publishedContent?.connectionName;
        if (typeof name !== 'string' || !/^[A-Za-z][A-Za-z0-9_.-]{0,127}$/.test(name)) throw new Error('COPILOT_PUBLISHED_CONNECTION_REQUIRED');
        return name;
    },
    /** Rejects success-shaped errors before unwrapping a native owner envelope. */
    data: function (response) {
        let value = response;
        for (let depth=0; depth<8; depth++) {
            if (!value || typeof value !== 'object' || Array.isArray(value) || value.error || value.success === false || value.acknowledged === false ||
                value.errors && (!Array.isArray(value.errors) || value.errors.length) ||
                value.code !== undefined && !/^SUC_/.test(value.code)) throw new Error('COPILOT_PUBLICATION_UNCONFIRMED');
            if (value.contractVersion === 1 && value.publication) return value;
            value = value.data ?? value.result;
        }
        throw new Error('COPILOT_PUBLICATION_UNCONFIRMED');
    },
    /** Extracts visible authored copy only, excluding dynamic bindings and arbitrary configuration strings. */
    text: function (page) {
        const output=[]; let visited=0;
        const fields = new Set(['title','heading','subtitle','summary','description','text','body','content','paragraphs','sections','items','label','children']);
        const walk = (value, depth, selected=false) => {
            if (depth>32 || ++visited>10000) throw new Error('COPILOT_PUBLISHED_CONTENT_BOUND_EXCEEDED');
            if (typeof value === 'string') { if (selected && value.trim()) output.push(value.trim()); return; }
            if (Array.isArray(value)) { value.forEach(item=>walk(item,depth+1,selected)); return; }
            if (!value || typeof value !== 'object' || value.active === false) return;
            if (value.accessMode && value.accessMode !== 'PUBLIC' || value.publiclyAvailable === false || value.requiresAuthentication === true ||
                ['allowedRoles','allowedGroups','allowedPermissions'].some(key => Array.isArray(value[key]) && value[key].length))
                throw new Error('COPILOT_PUBLISHED_CONTENT_PRIVATE');
            for (const [key,child] of Object.entries(value)) if (fields.has(key)) walk(child,depth+1,true);
        };
        const component = (value,depth) => {
            if (depth>32 || ++visited>10000) throw new Error('COPILOT_PUBLISHED_CONTENT_BOUND_EXCEEDED');
            if (!value || value.active === false) return;
            if (!Array.isArray(value.components || [])) throw new Error('COPILOT_PUBLICATION_UNCONFIRMED');
            walk(value,0);
            walk(value.properties,0);
            (value.components || []).forEach(child=>component(child,depth+1));
        };
        (page.components || []).forEach(value=>component(value,0));
        if (!output.length) throw new Error('COPILOT_PUBLISHED_CONTENT_EMPTY');
        return output.join('\n\n');
    },
    /** Reads the owner-selected public Online endpoint, never a caller URL or private content API. */
    read: async function (source, options={}) {
        const binding=source?.publishedContent;
        if (!binding || source.sourceType !== 'PUBLISHED_DOCUMENTATION' || source.module !== 'cms' || source.public !== true || source.lifecycle !== 'ONLINE' || source.tenantScopes?.length !== 1)
            throw new Error('COPILOT_PUBLISHED_CONTENT_BINDING_REQUIRED');
        const config = SERVICE.DefaultCopilotRepositoryKnowledgeSourceProviderService.effectiveConfiguration(source, options.configuration || this.configuration());
        if (!Array.isArray(source.paths) || !source.paths.length || source.paths.some(path => !/^[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)*$/.test(path)) ||
            !binding.digests || source.paths.some(path => !Object.hasOwn(binding.digests,path) || !/^[a-f0-9]{64}$/.test(binding.digests[path])))
            throw new Error('COPILOT_PUBLISHED_CONTENT_BINDING_REQUIRED');
        if (source.paths.length > Math.min(100, config.maximumFilesPerSource)) throw new Error('COPILOT_PUBLISHED_CONTENT_BOUND_EXCEEDED');
        const connectionName=this.connectionName();
        const files=[];let bytes=0;
        for (const path of source.paths) {
            if ((source.excludedPaths || []).some(excluded=>SERVICE.DefaultCopilotRepositoryKnowledgeSourceProviderService.matchesPattern(path,excluded))) continue;
            const scope={site:binding.site,path:'/'+path,locale:binding.locale,channel:binding.channel};
            const query=new URLSearchParams(scope).toString();
            const response=await SERVICE.DefaultModuleService.invokeModule({moduleName:'cms',connectionName,tenant:source.tenantScopes[0],local:false,requireInternalAuth:false,
                targetAuthority:{publication:'ONLINE'},apiName:'/delivery/knowledge?'+query,apiVersion:'v0',methodName:'GET',maxAttempts:1});
            const result=this.data(response), proof=result.publication;
            if (proof.state !== 'ONLINE' || proof.accessMode !== 'PUBLIC' || proof.contentDigest !== binding.digests[path] ||
                Object.keys(scope).some(key=>result.scope?.[key]!==scope[key]) || result.content?.accessMode !== 'PUBLIC')
                throw new Error('COPILOT_PUBLISHED_CONTENT_STALE');
            const raw=JSON.stringify(result.content);
            if (require('node:crypto').createHash('sha256').update(raw).digest('hex') !== proof.contentDigest)
                throw new Error('COPILOT_PUBLICATION_UNCONFIRMED');
            bytes+=Buffer.byteLength(raw);
            if (Buffer.byteLength(raw)>config.maximumFileBytes || bytes>config.maximumSourceBytes) throw new Error('COPILOT_PUBLISHED_CONTENT_BOUND_EXCEEDED');
            const content=this.text(result.content.page);
            files.push({relativePath:path,content,size:Buffer.byteLength(content)});
        }
        return files;
    },
    /** Rechecks current publication pins before and after indexed retrieval; no index or model effects. */
    assertCurrent: async function (sources) {
        for (const source of sources.filter(value=>value.sourceType==='PUBLISHED_DOCUMENTATION')) await this.read(source);
    }
};
