/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/**
 * @module nPublish/service/defaultPublicationSetupService
 * @description Coordinates bounded application publication intents through existing
 * domain capture, nPublish requests and Process approvals. Stores no bundle state.
 * @layer service
 * @owner nPublish
 * @override Domain version providers implement prepareSetup and validateSetup;
 * later layers may narrow limits but cannot approve or infer target activation.
 */
module.exports = {
    /** Rejects unsafe intent or owner evidence without returning source/provider details. */
    fail: function () { throw new CLASSES.NodicsError('ERR_PUB_SETUP_INVALID'); },
    /** Pins original human scope and detached intents before asynchronous work. */
    context: function (request, input) {
        const auth = request.authData || {}, enterpriseCode = auth.enterpriseCode || auth.entCode;
        if (!auth.tenant || request.tenant !== auth.tenant || !enterpriseCode || auth.tokenType !== 'access' ||
            auth.principalType !== 'human' || auth.isSystem || !(auth.principalId || auth.loginId || auth.code) ||
            [auth.enterpriseCode, auth.entCode, request.enterpriseCode, request.entCode].some(value => value !== undefined && value !== enterpriseCode) ||
            CONFIG.get('runtimeRole')?.publication !== 'STAGED') this.fail();
        const policy = CONFIG.get('publish')?.setup || {};
        if (!Number.isSafeInteger(policy.maximumItems) || policy.maximumItems < 1 || policy.maximumItems > 1000 ||
            !Number.isSafeInteger(policy.maximumBytes) || policy.maximumBytes < 1 ||
            !input || Object.keys(input).sort().join(',') !== 'contractVersion,items' || input.contractVersion !== 1 ||
            !Array.isArray(input.items) || !input.items.length || input.items.length > policy.maximumItems ||
            Buffer.byteLength(JSON.stringify(input)) > policy.maximumBytes) this.fail();
        const identifier = value => typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9_.:-]{0,191}$/.test(value);
        const seen = new Set(), codes = new Set();
        for (const item of input.items) {
            if (!item || Object.keys(item).sort().join(',') !== 'code,domain,input,rootCode,rootType,sourceVersion' ||
                !['code', 'domain', 'rootCode', 'rootType', 'sourceVersion'].every(key => identifier(item[key])) ||
                !item.input || typeof item.input !== 'object' || Array.isArray(item.input) ||
                item.input.publicationCode !== item.code || seen.has(item.domain + ':' + item.rootCode) || codes.has(item.code)) this.fail();
            seen.add(item.domain + ':' + item.rootCode); codes.add(item.code);
        }
        return { request: { ...request, authData: structuredClone(auth), enterpriseCode }, input: structuredClone(input) };
    },
    /** Requires the existing permission vocabulary and fully registered domain owners, never body-selected providers. */
    provider: function (request, item, submit) {
        const config = CONFIG.get('publish') || {}, lifecycle = SERVICE.DefaultPublicationLifecycleService;
        const name = config.providers?.versionProviders?.[item.domain], provider = name && SERVICE[name];
        const security = SERVICE.DefaultSecuredRequestPipelineService;
        if (typeof security?.getGrantedPermissions !== 'function') this.fail();
        const granted = security.getGrantedPermissions(request);
        const permissions = ['publish.lifecycle.view', config.setup?.permissions?.[item.domain],
            ...(submit ? ['publish.lifecycle.create', 'publish.lifecycle.validate', 'publish.lifecycle.requestApproval'] : [])];
        if (!lifecycle || !provider || ['getVersion', 'getOnlineVersion', 'prepareSetup', 'validateSetup', 'isSetupReceiptCommitted'].some(key => typeof provider[key] !== 'function') ||
            !config.providers?.domainAdapters?.[item.domain] || !config.providers?.workflowProviders?.[item.domain] ||
            typeof security?.isPermissionGranted !== 'function' || permissions.some(permission => typeof permission !== 'string' ||
                !security.isPermissionGranted(permission, granted, {}))) this.fail();
        return provider;
    },
    /** Reads exact identity candidates through the generated publication owner; errors and ambiguity never mean absence. */
    candidates: async function (request, item) {
        const response = await SERVICE.DefaultPublicationRequestService.get({ tenant: request.tenant, authData: request.authData,
            query: { domain: item.domain, rootType: item.rootType, rootCode: item.rootCode, sourceVersion: item.sourceVersion },
            options: { skipItemCache: true }, searchOptions: { pageSize: 17, limit: 17, pageNumber: 1 } });
        if (!response || !Array.isArray(response.result) || response.error || response.errors?.length ||
            response.code && !/^SUC_/.test(response.code) || response.success === false || response.result.length > 16 ||
            Number.isFinite(response.count) && response.count > 16 ||
            response.result.some(row => row.domain !== item.domain || row.rootType !== item.rootType ||
                row.rootCode !== item.rootCode || row.sourceVersion !== item.sourceVersion ||
                row.tenantCode !== undefined && row.tenantCode !== request.tenant ||
                row.enterpriseCode !== undefined && row.enterpriseCode !== request.enterpriseCode)) this.fail();
        return response.result;
    },
    /** Verifies the existing approved receipt and current target against exact owner-qualified source. */
    inspect: async function (request, item, provider) {
        const rows = await this.candidates(request, item);
        const online = rows.filter(row => row.state === 'ONLINE');
        if (online.length > 1) this.fail();
        const publication = online[0] || rows.find(row => row.code === item.code) ||
            (rows.length === 1 ? rows[0] : undefined);
        if (rows.length && !publication) this.fail();
        if (!publication) return { code: item.code, domain: item.domain, rootCode: item.rootCode, status: 'NOT_REQUESTED' };
        const version = await provider.validateSetup(publication, request, item);
        let current = false;
        if (publication.state === 'ONLINE') {
            const target = await provider.getOnlineVersion(publication, request);
            const actual = typeof target === 'string' ? target : target?.version || target?.activeVersion;
            const activation = publication.auditTrail?.filter(entry => entry.toState === 'ONLINE').at(-1)?.details;
            const receipt = activation?.receipt;
            current = actual === version && publication.targetVersion === version &&
                publication.auditTrail?.some(entry => entry.toState === 'APPROVED') &&
                await provider.isSetupReceiptCommitted(publication, request, receipt) === true &&
                receipt.operationKey === publication.activationOperation?.key && receipt.publicationCode === publication.code &&
                receipt.sourceVersion === publication.sourceVersion && receipt.targetVersion === version;
        }
        return { code: publication.code, domain: item.domain, rootCode: item.rootCode,
            status: current ? 'CURRENT' : publication.state === 'PENDING_APPROVAL' ? 'PENDING_APPROVAL' :
                ['STAGED', 'VALIDATED'].includes(publication.state) ? 'SUBMISSION_REQUIRED' : 'REVIEW_REQUIRED',
            state: publication.state, revision: publication.revision, sourceVersion: publication.sourceVersion,
            targetVersion: publication.targetVersion, workflowRef: publication.workflowRef };
    },
    /** Reads all required roots, with no creation, validation, retry, approval or activation side effects. */
    status: async function (request, input) {
        ({ request, input } = this.context(request, input));
        const providers = input.items.map(item => this.provider(request, item, false)), items = [];
        for (let index = 0; index < input.items.length; index++) items.push(await this.inspect(request, input.items[index], providers[index]));
        return { contractVersion: 1, ready: items.every(item => item.status === 'CURRENT'), items };
    },
    /** Submits missing roots through domain capture and existing approval requests; never approves, retries failures or restores targets. */
    submit: async function (request, input) {
        ({ request, input } = this.context(request, input));
        const providers = input.items.map(item => this.provider(request, item, true));
        const before = [];
        for (let index = 0; index < input.items.length; index++) before.push(await this.inspect(request, input.items[index], providers[index]));
        for (let index = 0; index < input.items.length; index++) {
            if (before[index].status !== 'NOT_REQUESTED' && !['STAGED', 'VALIDATED'].includes(before[index].state)) continue;
            let publication = before[index].status === 'NOT_REQUESTED'
                ? await providers[index].prepareSetup(request, input.items[index])
                : await SERVICE.DefaultPublicationLifecycleService.get({ ...request, publicationCode: before[index].code });
            if (!publication || publication.code !== (before[index].status === 'NOT_REQUESTED' ? input.items[index].code : before[index].code) ||
                publication.domain !== input.items[index].domain || publication.rootCode !== input.items[index].rootCode ||
                publication.rootType !== input.items[index].rootType || publication.sourceVersion !== input.items[index].sourceVersion) this.fail();
            const lifecycle = SERVICE.DefaultPublicationLifecycleService;
            if (publication.state === 'STAGED') publication = await lifecycle.validate({ ...request, publicationCode: publication.code, expectedRevision: publication.revision });
            if (publication.state === 'VALIDATED') await lifecycle.requestApproval({ ...request, publicationCode: publication.code, expectedRevision: publication.revision });
        }
        return this.status(request, input);
    }
};
