/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const crypto = require('crypto');

/**
 * @module media/service/publication/DefaultMediaArtifactPublicationService
 * @description Builds generic media artifact dependencies, transfer manifests, and target receipts for publication domains.
 * @layer service
 * @owner media
 * @override Domains may contribute collector services, but Media owns physical artifact manifest and receipt semantics.
 */
module.exports = {
    /** Initializes the service. */
    init: function () { return Promise.resolve(true); },
    /** Completes service initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns generated-service records from a Nodics response. */
    items: function (response) { return response && Array.isArray(response.result) ? response.result : []; },
    /** Builds a stable hash code from identity parts. */
    code: function (parts) { return crypto.createHash('sha256').update([].concat(parts || []).map(value => String(value || '')).join('|')).digest('hex'); },
    /** Returns effective media publication or cleanup policy. */
    policy: function () {
        let media = CONFIG && typeof CONFIG.get === 'function' ? CONFIG.get('media') || {} : {};
        let publication = media.publication || {};
        return Object.assign({ defaultTransportStrategy: 'PROVIDER_COPY', packageThresholdBytes: 10485760, inlineThresholdBytes: 1048576 }, publication.artifacts || {});
    },
    /** Classifies a physical artifact from media ownership metadata. */
    classify: function (record) {
        let text = [record && record.folderCode, record && record.ownerModule, record && record.ownerType, record && record.businessPurpose].map(value => String(value || '')).join(' ').toLowerCase();
        if (text.includes('product') || text.includes('catalog')) return 'PRODUCT_ASSET';
        if (text.includes('cms') || text.includes('content')) return 'CMS_ASSET';
        if (text.includes('documentation') || text.includes('docs')) return 'DOCUMENTATION_ASSET';
        if (text.includes('import')) return 'IMPORT_FILE';
        if (text.includes('export')) return 'EXPORT_FILE';
        if (text.includes('audit')) return 'AUDIT_FILE';
        if (text.includes('generated')) return 'GENERATED_FILE';
        if (text.includes('customer')) return 'CUSTOMER_UPLOAD';
        if (text.includes('log') || text.includes('operational')) return 'OPERATIONAL_FILE';
        return 'CUSTOM';
    },
    /** Returns whether an artifact may enter publication transfer. */
    isPublishable: function (artifact) {
        if (!artifact) return false;
        if (artifact.publishable === false) return false;
        if (['OPERATIONAL_FILE', 'AUDIT_FILE'].includes(artifact.artifactClass) && artifact.allowOperationalPublication !== true) return false;
        let name = String(artifact.originalFileName || artifact.fileName || artifact.storageKey || '').toLowerCase();
        return !(/(^|\/)(logs?|tmp|temp|build|dist|coverage|node_modules|\.git)(\/|$)/.test(name) || /\.(log|tmp|bak|swp|map)$/i.test(name));
    },
    /** Selects the physical transport strategy for one artifact. */
    selectTransportStrategy: function (artifact, request) {
        let policy = this.policy();
        if (request && request.transportStrategy) return request.transportStrategy;
        if (artifact && artifact.contentBase64) return 'INLINE_BASE64';
        if (Number(artifact && artifact.sizeBytes || 0) <= Number(policy.inlineThresholdBytes || 0)) return 'INLINE_BASE64';
        if (artifact && artifact.sourceProviderCode && artifact.targetProviderCode && artifact.sourceProviderCode === artifact.targetProviderCode) return 'PROVIDER_COPY';
        if (Number(artifact && artifact.sizeBytes || 0) > Number(policy.packageThresholdBytes || 0)) return 'STREAMING_TRANSFER';
        return policy.defaultTransportStrategy || 'PUBLICATION_PACKAGE';
    },
    /** Projects a media record into a provider-neutral artifact descriptor. */
    normalizeArtifact: function (media, request) {
        let artifactClass = media.artifactClass || this.classify(media);
        return { code: media.artifactCode || this.code([media.code, media.checksum, artifactClass]), mediaCode: media.code, mediaChecksum: media.checksum,
            checksum: media.checksum, checksumAlgorithm: media.checksumAlgorithm || 'sha256', folderCode: media.folderCode, providerCode: media.providerCode,
            sourceProviderCode: media.providerCode, targetProviderCode: request && request.targetProviderCode, sourceStorageKey: media.storageKey,
            originalFileName: media.originalFileName, mimeType: media.mimeType, sizeBytes: media.sizeBytes, artifactClass: artifactClass,
            ownerModule: media.ownerModule || request && request.ownerModule, ownerSchema: media.ownerSchema || request && request.ownerSchema,
            ownerReference: media.ownerReference, publishable: media.publishable !== false, lifecycleState: request && request.sourceRuntimeRole || 'STAGED' };
    },
    /** Collects publishable physical media artifact dependencies for a publication request. */
    collectDependencies: async function (request) {
        let mediaCodes = Array.from(new Set([].concat(request.mediaCodes || []).filter(Boolean)));
        let collected = [];
        if (mediaCodes.length && SERVICE.DefaultMediaService && typeof SERVICE.DefaultMediaService.get === 'function') {
            let response = await SERVICE.DefaultMediaService.get({ tenant: request.tenant, authData: request.authData,
                query: { code: { $in: mediaCodes }, active: true }, searchOptions: { limit: mediaCodes.length } });
            collected = collected.concat(this.items(response).map(media => this.normalizeArtifact(media, request)));
        }
        let collectorNames = [].concat(request.collectorServices || []).filter(Boolean);
        for (let serviceName of collectorNames) {
            let collector = SERVICE[serviceName];
            if (collector && typeof collector.collectMediaArtifacts === 'function') {
                let artifacts = await collector.collectMediaArtifacts(request);
                collected = collected.concat([].concat(artifacts || []));
            }
        }
        let artifacts = collected.filter(artifact => this.isPublishable(artifact)).map(artifact => Object.assign({}, artifact, {
            transportStrategy: this.selectTransportStrategy(artifact, request)
        }));
        return { requested: mediaCodes.length, collected: collected.length, publishable: artifacts.length, artifacts: artifacts,
            blocked: collected.filter(artifact => !this.isPublishable(artifact)).map(artifact => ({ code: artifact.code, artifactClass: artifact.artifactClass })) };
    },
    /** Builds and optionally persists one provider-neutral physical transfer manifest. */
    buildTransferManifest: async function (request) {
        let dependency = await this.collectDependencies(request);
        let totalBytes = dependency.artifacts.reduce((total, artifact) => total + Number(artifact.sizeBytes || 0), 0);
        let strategy = request.transportStrategy || (dependency.artifacts[0] && dependency.artifacts[0].transportStrategy) || this.policy().defaultTransportStrategy;
        let model = { code: request.manifestCode || this.code([request.publicationCode, request.sourceRuntimeRole, request.targetRuntimeRole, dependency.artifacts.map(item => item.code).join(',')]),
            active: true, publicationCode: request.publicationCode, manifestCode: request.manifestCode, sourceRuntimeRole: request.sourceRuntimeRole || 'STAGED',
            targetRuntimeRole: request.targetRuntimeRole || 'ONLINE', transportStrategy: strategy, artifactCount: dependency.artifacts.length,
            totalBytes: totalBytes, status: 'READY', artifacts: dependency.artifacts, evidence: { dependency: dependency, createdAt: new Date().toISOString() } };
        if (SERVICE.DefaultMediaTransferManifestService && typeof SERVICE.DefaultMediaTransferManifestService.save === 'function' && request.persist !== false) {
            let response = await SERVICE.DefaultMediaTransferManifestService.save({ tenant: request.tenant, authData: request.authData,
                transactionContext: request.transactionContext, query: { code: model.code }, model: model });
            return this.items(response)[0] || model;
        }
        return model;
    },
    /** Records one target import, publication, replication, cleanup, or rollback receipt. */
    recordReceipt: async function (request) {
        let now = request.receivedAt || new Date().toISOString();
        let model = { code: request.code || this.code([request.publicationCode, request.manifestCode, request.mediaCode, request.receiptType, request.targetRuntimeRole]),
            active: true, publicationCode: request.publicationCode, manifestCode: request.manifestCode, mediaCode: request.mediaCode,
            artifactCode: request.artifactCode, targetRuntimeRole: request.targetRuntimeRole || 'ONLINE', receiptType: request.receiptType || 'IMPORT_RECEIPT',
            status: request.status || 'ACCEPTED', checksum: request.checksum, receivedAt: now, evidence: Object.assign({ receivedAt: now }, request.evidence || {}) };
        if (SERVICE.DefaultMediaPublicationReceiptService && typeof SERVICE.DefaultMediaPublicationReceiptService.save === 'function') {
            let response = await SERVICE.DefaultMediaPublicationReceiptService.save({ tenant: request.tenant, authData: request.authData,
                transactionContext: request.transactionContext, query: { code: model.code }, model: model });
            return this.items(response)[0] || model;
        }
        return model;
    },
    /** Resolves active and replication role switching for PROD/DR failover or failback. */
    switchProdDrRoles: function (request) {
        let active = request.activeLocationRole || 'ACTIVE_PROD_MEDIA_LOCATION';
        let replication = request.replicationLocationRole || 'REPLICATION_PROD_MEDIA_LOCATION';
        return { activeLocationRole: replication, replicationLocationRole: active, previousActiveLocationRole: active,
            previousReplicationLocationRole: replication, status: 'PROD_DR_ROLE_SWITCH_READY', evidence: { switchedAt: new Date().toISOString(), reason: request.reason || 'DR_FAILOVER' } };
    }
};
