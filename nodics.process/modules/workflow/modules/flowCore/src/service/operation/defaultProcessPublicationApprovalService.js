/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const crypto = require('crypto');

/** @module flowCore/service/operation/DefaultProcessPublicationApprovalService @description Starts the fixed CMS publication approval workflow from bounded service-authenticated context. */
module.exports = {
    /** Builds a deterministic instance identity so response loss and retries cannot create duplicate approvals. */
    instanceCode: function (publicationCode, publicationRevision) {
        return 'cmsPublicationApproval-' + crypto.createHash('sha256')
            .update(publicationCode + ':' + String(publicationRevision)).digest('hex').slice(0, 24);
    },
    /** Starts or returns the existing approval instance for one immutable publication request. */
    start: async function (request) {
        let input = request.publicationApproval || request.runtimeOperation || {};
        if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(input.publicationCode || '') ||
            !Number.isInteger(Number(input.publicationRevision)) || !input.sourceVersion || !input.correlationId) {
            throw new CLASSES.NodicsError('ERR_PROCESS_00001', 'Publication approval request is invalid');
        }
        let instanceCode = this.instanceCode(input.publicationCode, Number(input.publicationRevision));
        let existing = await SERVICE.DefaultProcessInstanceService.get({ tenant: request.tenant, query: { code: instanceCode },
            searchOptions: { limit: 1 }, authData: request.authData }).then(response => response && response.result && response.result[0]);
        if (existing) return { code: 'SUC_PROCESS_00007', data: { instance: existing, replay: true } };
        let context = {
            publicationCode: input.publicationCode,
            publicationRevision: Number(input.publicationRevision),
            sourceVersion: String(input.sourceVersion),
            siteCode: input.siteCode && String(input.siteCode),
            catalogCode: input.catalogCode && String(input.catalogCode),
            correlationId: String(input.correlationId)
        };
        if (Buffer.byteLength(JSON.stringify(context), 'utf8') > 65536) {
            throw new CLASSES.NodicsError('ERR_PROCESS_00001', 'Publication approval context exceeds the allowed boundary');
        }
        return SERVICE.DefaultProcessRuntimeLifecycleService.startInstance(Object.assign({}, request, {
            runtimeOperation: { definitionCode: 'cmsPublicationApproval', instanceCode: instanceCode,
                name: 'CMS Publication ' + input.publicationCode, context: context }
        }));
    }
};
