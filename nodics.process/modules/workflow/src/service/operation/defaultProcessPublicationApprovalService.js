/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const crypto = require('crypto');

/** @module workflow/service/operation/DefaultProcessPublicationApprovalService @description Starts the fixed CMS publication approval workflow from bounded service-authenticated context. */
module.exports = {
    /** Builds a deterministic instance identity so response loss and retries cannot create duplicate approvals. */
    instanceCode: function (publicationCode, publicationRevision) {
        return 'cmsPublicationApproval-' + crypto.createHash('sha256')
            .update(publicationCode + ':' + String(publicationRevision)).digest('hex').slice(0, 24);
    },
    /** Ensures the framework-owned approval definition through the governed nImport contribution installer. */
    ensureDefinition: async function (request) {
        let definition = await SERVICE.DefaultProcessDefinitionService.get({ tenant: request.tenant,
            query: { code: 'cmsPublicationApproval' }, searchOptions: { limit: 1 }, authData: request.authData })
            .then(response => response && response.result && response.result[0]);
        if (definition) return definition;
        await SERVICE.DefaultDataReleaseService.execute({ tenant: request.tenant, authData: request.authData,
            releaseRequest: { dataType: 'init', releaseCodes: ['cms:cmsPublicationApproval'],
                expectedReleases: { 'cms:cmsPublicationApproval': '1.0.0' } } });
        definition = await SERVICE.DefaultProcessDefinitionService.get({ tenant: request.tenant,
            query: { code: 'cmsPublicationApproval' }, searchOptions: { limit: 1 }, authData: request.authData })
            .then(response => response && response.result && response.result[0]);
        if (!definition) throw new CLASSES.NodicsError('ERR_PROCESS_00002', 'CMS publication approval definition installation failed');
        return definition;
    },
    /** Repairs only a missing human task for an existing waiting publication instance. */
    repairWaitingTask: async function (request, instance) {
        let lifecycle = SERVICE.DefaultProcessRuntimeLifecycleService;
        let taskResponse = await SERVICE.DefaultProcessTaskService.get({ tenant: request.tenant,
            query: { instanceCode: instance.code, status: { $in: ['OPEN', 'CLAIMED', 'ESCALATED'] } },
            searchOptions: { limit: 1 }, authData: request.authData });
        let existingTask = taskResponse && taskResponse.result && taskResponse.result[0];
        if (existingTask || instance.status !== 'WAITING' || !instance.currentNode) return existingTask;
        let version = await lifecycle.requireVersion(request, instance.definitionCode, instance.version);
        let node = lifecycle.findNode(version.graph || {}, instance.currentNode);
        if (!node || node.type !== 'TASK') {
            throw new CLASSES.NodicsError('ERR_PROCESS_00013', 'Waiting publication instance is not positioned at a human task');
        }
        return lifecycle.createTaskForNode(request, instance, node, {
            taskCode: (instance.code + '-' + node.code).slice(0, 128)
        });
    },
    /** Starts or returns the existing approval instance for one immutable publication request. */
    start: async function (request) {
        let input = request.publicationApproval || request.runtimeOperation || {};
        if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(input.publicationCode || '') ||
            !Number.isInteger(Number(input.publicationRevision)) || !input.sourceVersion || !input.correlationId) {
            throw new CLASSES.NodicsError('ERR_PROCESS_00001', 'Publication approval request is invalid');
        }
        await this.ensureDefinition(request);
        let instanceCode = this.instanceCode(input.publicationCode, Number(input.publicationRevision));
        let existing = await SERVICE.DefaultProcessInstanceService.get({ tenant: request.tenant, query: { code: instanceCode },
            searchOptions: { limit: 1 }, authData: request.authData }).then(response => response && response.result && response.result[0]);
        if (existing) {
            let task = await this.repairWaitingTask(request, existing);
            return { code: 'SUC_PROCESS_00007', data: { instance: existing, task: task, replay: true } };
        }
        let context = {
            publicationCode: input.publicationCode,
            publicationRevision: Number(input.publicationRevision),
            sourceVersion: String(input.sourceVersion),
            tenantCode: input.tenantCode && String(input.tenantCode),
            enterpriseCode: input.enterpriseCode && String(input.enterpriseCode),
            environmentCode: input.environmentCode && String(input.environmentCode),
            profileCode: input.profileCode && String(input.profileCode),
            siteCode: input.siteCode && String(input.siteCode),
            catalogCode: input.catalogCode && String(input.catalogCode),
            requestedBy: input.requestedBy && String(input.requestedBy),
            correlationId: String(input.correlationId)
        };
        Object.keys(context).forEach(key => context[key] === undefined && delete context[key]);
        if (Buffer.byteLength(JSON.stringify(context), 'utf8') > 65536) {
            throw new CLASSES.NodicsError('ERR_PROCESS_00001', 'Publication approval context exceeds the allowed boundary');
        }
        return SERVICE.DefaultProcessRuntimeLifecycleService.startInstance(Object.assign({}, request, {
            runtimeOperation: { definitionCode: 'cmsPublicationApproval', instanceCode: instanceCode,
                name: 'CMS Publication ' + input.publicationCode, context: context }
        }));
    }
};
