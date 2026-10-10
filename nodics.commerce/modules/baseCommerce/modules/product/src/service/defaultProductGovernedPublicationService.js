/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/** @module product/service/defaultProductGovernedPublicationService @description Seals catalogue membership through versioned Product save and submits existing nPublish governance; validates target intent against stored lifecycle state. @layer service @owner product */
module.exports = {
    /** Captures and saves one successor root using the original version; retries reuse the publication's sealed root. */
    create: async function (request, input) {
        request = { ...request, authData: structuredClone(request.authData || {}) };
        input = structuredClone(input);
        SERVICE.DefaultProductPublicationVersionProviderService.assertStaged();
        if (!input || !['publicationCode', 'productCode', 'storeCode'].every(key => typeof input[key] === 'string' && input[key].trim()) ||
            !Number.isSafeInteger(input.versionId) || input.versionId < 0) throw new Error('Exact Product authoring identity is required');
        const lifecycle = SERVICE.DefaultPublicationLifecycleService;
        if (!lifecycle || typeof lifecycle.getRepository !== 'function' ||
            ['create', 'validate', 'requestApproval'].some(operation => typeof lifecycle[operation] !== 'function')) {
            throw new Error('Product governed publication requires the publish module active on the Staged runtime');
        }
        let publication = await lifecycle.getRepository().get(input.publicationCode, request);
        const graph = SERVICE.DefaultProductPublicationGraphService;
        if (publication) {
            const manifest = await graph.resolve(publication, request);
            if (publication.domain !== 'product' || publication.rootCode !== input.productCode || manifest.scope.storeCode !== input.storeCode ||
                manifest.root.publicationReferences.capturedFromVersion !== input.versionId) throw new Error('Product publication retry identity conflict');
        } else {
            const root = await graph.read(request, { schema: 'product', code: input.productCode, versionId: input.versionId });
            const current = await graph.current(request, 'product', { code: input.productCode });
            let saved = current[0], references = saved && saved.publicationReferences;
            if (current.length !== 1) throw new Error('Current Product root is ambiguous');
            const replay = saved.versionId === input.versionId + 1 && references && references.publicationCode === input.publicationCode &&
                references.capturedFromVersion === input.versionId && references.storeCode === input.storeCode;
            if (!replay) {
                if (saved.versionId !== input.versionId) throw new Error('Product root version conflict');
                references = await graph.captureReferences(request, input.productCode, input.storeCode);
                references.capturedFromVersion = input.versionId;
                references.publicationCode = input.publicationCode;
                // The existing versioned update rejects a stale selection and preserves root business fields.
                await graph.sealRoot(request, input.productCode, input.versionId, references);
                saved = await graph.read(request, { schema: 'product', code: input.productCode, versionId: input.versionId + 1 });
            }
            if (graph.hash(saved.publicationReferences) !== graph.hash(references) || saved.catalogVersion !== root.catalogVersion) {
                throw new Error('Product root save needs reconciliation');
            }
            const owner = graph.publisherScope(request);
            if (saved.tenant !== request.tenant || saved.enterpriseCode !== root.enterpriseCode ||
                (owner && saved.enterpriseCode !== owner.enterpriseCode)) throw new Error('Product publication source owner mismatch');
            publication = await lifecycle.create({ ...request, publication: { code: input.publicationCode, domain: 'product',
                tenantCode: saved.tenant, enterpriseCode: saved.enterpriseCode,
                rootType: 'product', rootCode: input.productCode, sourceVersion: String(saved.versionId) } });
        }
        if (publication.state === 'STAGED') publication = await lifecycle.validate({ ...request, publicationCode: publication.code, expectedRevision: publication.revision });
        if (publication.state === 'VALIDATED') publication = await lifecycle.requestApproval({ ...request, publicationCode: publication.code, expectedRevision: publication.revision });
        return publication;
    },
    /** Checks stored nPublish intent, source identity, target digest and immutable operation key independently of the transport caller. */
    authorizeTarget: async function (request, input) {
        SERVICE.DefaultProductPublicationVersionProviderService.assertStaged();
        SERVICE.DefaultServiceTokenService.requireRuntimePrincipal(request, 'product');
        if (!input || !['deploy', 'rollback', 'withdraw'].includes(input.operation) ||
            typeof input.publicationCode !== 'string' || !input.publicationCode) throw new Error('Product source operation is invalid');
        SERVICE.DefaultProductPublicationTargetService.scopeCode(input.scope, request);
        const local = Object.assign({}, request, { authData: Object.assign({}, request.authData,
            SERVICE.DefaultIdentityGovernanceService.getSystemAuthData()) });
        const publication = await SERVICE.DefaultPublicationLifecycleService.get({ ...local, publicationCode: input.publicationCode });
        if (!publication || publication.domain !== 'product' || publication.sourceVersion !== input.sourceVersion) throw new Error('Product source intent mismatch');
        const provider = SERVICE.DefaultProductPublicationVersionProviderService;
        const manifest = await provider.getVersion(publication, local);
        const graph = SERVICE.DefaultProductPublicationGraphService;
        if (graph.hash(manifest.scope) !== graph.hash(input.scope)) throw new Error('Product target scope mismatch');
        const expected = input.operation === 'deploy' ? { state: 'ACTIVATING', key: publication.activationOperation && publication.activationOperation.key,
            version: manifest.version, previous: publication.activationOperation && publication.activationOperation.previousOnlineVersion } :
            input.operation === 'rollback' ? { state: 'ROLLING_BACK', key: provider.operationKey(publication, 'rollback', publication.previousOnlineVersion),
                version: publication.previousOnlineVersion, previous: publication.targetVersion } :
                input.operation === 'withdraw' ? { state: 'WITHDRAWING', key: provider.operationKey(publication, 'withdraw', publication.targetVersion),
                    version: '', previous: publication.targetVersion } : null;
        if (!expected || publication.state !== expected.state || !expected.key || input.operationKey !== expected.key ||
            input.version !== expected.version || input.expectedVersion !== expected.previous) throw new Error('Product target operation is not currently authorized');
        return { authorized: true, fingerprint: graph.hash(input) };
    }
};
