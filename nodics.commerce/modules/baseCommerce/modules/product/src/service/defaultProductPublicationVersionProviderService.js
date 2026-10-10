/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/**
 * @module product/service/defaultProductPublicationVersionProviderService
 * @description Bridges nPublish to exact Product sources and the independently authorized Online target.
 * @layer service
 * @owner product
 * @override Replace transport through layered configuration without changing approval or immutable operation identity.
 */
module.exports = {
    /** Seals exact Product setup membership through the existing governed capture operation. */
    prepareSetup: function (request, item) {
        if (item.domain !== 'product' || item.rootType !== 'product' || item.rootCode !== item.input.productCode ||
            !Number.isSafeInteger(item.input.versionId) || String(item.input.versionId + 1) !== item.sourceVersion)
            throw new CLASSES.NodicsError('ERR_PUB_SETUP_INVALID');
        return SERVICE.DefaultProductGovernedPublicationService.create(request, item.input);
    },
    /** Qualifies exact sealed source and Store membership without mutable fallback or publication writes. */
    validateSetup: async function (publication, request, item) {
        const manifest = await this.getVersion(publication, request);
        if (manifest.scope.tenant !== request.tenant || manifest.root.enterpriseCode !== request.enterpriseCode ||
            manifest.scope.storeCode !== item.input.storeCode || manifest.root.code !== item.rootCode ||
            manifest.root.publicationReferences?.capturedFromVersion !== item.input.versionId ||
            String(manifest.root.versionId) !== item.sourceVersion)
            throw new CLASSES.NodicsError('ERR_PUB_SETUP_INVALID');
        return manifest.version;
    },
    targetReceiptContract: 'v1',
    /** Pure target-local observation under nPublish's reviewed deployment plan; does not prepare or activate. */
    observeSetupTarget: async function (publication, request) {
        const scope = { tenant: request.tenant, productCode: publication.rootCode, storeCode: publication.input.storeCode };
        const target = await SERVICE.DefaultProductPublicationTargetService.getStatus({ scope, operationKey: publication.activationOperation.key }, request);
        if (target.receipt && target.receipt.committed !== true) throw new CLASSES.NodicsError('ERR_PUB_SETUP_OBSERVATION');
        return target;
    },
    /** Preserves Product's own committed target receipt semantics for coordinated readiness. */
    isSetupReceiptCommitted: function (publication, request, receipt) {
        return receipt?.committed === true && receipt.previousOnlineVersion === publication.activationOperation?.previousOnlineVersion;
    },
    /** Requires the existing runtime-role authority; source operations never activate versioning themselves. */
    assertStaged: function () {
        if ((CONFIG.get('runtimeRole') || {}).publication !== 'STAGED') throw new Error('Product publication requires Staged runtime');
    },
    /** Resolves the owner-selected transport without a local fallback or credential synthesis. */
    transport: function () {
        const name = ((CONFIG.get('product') || {}).publication || {}).targetTransportProvider;
        if (!name || !SERVICE[name]) throw new Error('Product Online transport is not qualified');
        return SERVICE[name];
    },
    /** Resolves one exact source graph through versioned owner services. */
    getVersion: function (publication, request) {
        this.assertStaged();
        return SERVICE.DefaultProductPublicationGraphService.resolve(publication, request);
    },
    /** Qualifies older publication journals through their sealed root, without rewriting their metadata. */
    getPublicationEnterprise: async function (publication, request) {
        const manifest = await this.getVersion(publication, request);
        if (manifest.scope.tenant !== request.tenant || manifest.root.tenant !== request.tenant ||
            manifest.root.code !== publication.rootCode || String(manifest.root.versionId) !== publication.sourceVersion ||
            typeof manifest.root.enterpriseCode !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,191}$/.test(manifest.root.enterpriseCode)) {
            throw new Error('Sealed Product publication owner is invalid');
        }
        return manifest.root.enterpriseCode;
    },
    /** Returns authoritative Online scope status before a transition. */
    getOnlineVersion: async function (publication, request) {
        const manifest = await this.getVersion(publication, request);
        return this.transport().getStatus({ scope: manifest.scope }, request);
    },
    /** Preserves operation identity over infrastructure retries of the same immutable publication. */
    operationKey: function (publication, operation, version) {
        return SERVICE.DefaultProductPublicationGraphService.hash([publication.code, publication.sourceVersion,
            publication.activationOperation && publication.activationOperation.key, operation, version]);
    },
    /** Revalidates approved immutable dependencies and delegates hidden preparation plus atomic activation. */
    activate: async function (publication, request) {
        const manifest = await this.getVersion(publication, request);
        const service = SERVICE.DefaultProductPublicationGraphService;
        if (!publication.validation || publication.validation.manifestVersion !== manifest.version ||
            service.hash(publication.dependencies) !== service.hash(manifest.references)) throw new Error('Approved Product graph changed');
        const operation = publication.activationOperation;
        if (!operation || !operation.key || !(operation.previousOnlineVersion === null ||
            typeof operation.previousOnlineVersion === 'string' && operation.previousOnlineVersion)) {
            throw new Error('Product activation requires retained nPublish operation and predecessor');
        }
        const input = { manifest: manifest, projections: service.projections(manifest, request),
            operationKey: operation.key, expectedVersion: operation.previousOnlineVersion,
            publicationCode: publication.code, sourceVersion: publication.sourceVersion };
        const result = await this.transport().deploy(input, request);
        if (!result || result.activeVersion !== manifest.version || !result.receipt || !result.receipt.committed ||
            result.receipt.operationKey !== operation.key || result.receipt.targetVersion !== manifest.version ||
            result.receipt.publicationCode !== publication.code || result.receipt.sourceVersion !== publication.sourceVersion ||
            result.receipt.previousOnlineVersion !== operation.previousOnlineVersion) throw new Error('Product active receipt mismatch');
        return result;
    },
    /** Restores only retained target projections through the existing governed rollback operation. */
    rollback: async function (publication, targetVersion, request) {
        const manifest = await this.getVersion(publication, request);
        if (!targetVersion || !publication.targetVersion) throw new Error('Retained Product rollback versions are required');
        const result = await this.transport().rollback({ scope: manifest.scope, version: targetVersion,
            expectedVersion: publication.targetVersion, publicationCode: publication.code, sourceVersion: publication.sourceVersion,
            operationKey: this.operationKey(publication, 'rollback', targetVersion) }, request);
        if (!result || result.version !== targetVersion || result.activeVersion !== targetVersion ||
            !result.receipt || result.receipt.previousOnlineVersion !== publication.targetVersion) throw new Error('Product rollback receipt mismatch');
        return result;
    },
    /** Reads exact durable target operation evidence; it never repairs activation by guessing. */
    reconcile: async function (publication, request) {
        const manifest = await this.getVersion(publication, request);
        if (!publication.activationOperation || !publication.activationOperation.key) throw new Error('Product activation operation is unavailable');
        return this.transport().getStatus({ scope: manifest.scope, operationKey: publication.activationOperation.key }, request);
    },
    /** Withdraws only this activation cycle while retaining immutable content and rollback receipts. */
    withdraw: async function (publication, request) {
        const manifest = await this.getVersion(publication, request);
        if (!publication.targetVersion) throw new Error('Product withdrawal version is required');
        const result = await this.transport().withdraw({ scope: manifest.scope, expectedVersion: publication.targetVersion,
            sourceVersion: publication.sourceVersion, publicationCode: publication.code,
            operationKey: this.operationKey(publication, 'withdraw', publication.targetVersion) }, request);
        if (!result || result.activeVersion !== null || !result.receipt || result.receipt.previousOnlineVersion !== publication.targetVersion) {
            throw new Error('Product withdrawal receipt mismatch');
        }
        return result;
    }
};
