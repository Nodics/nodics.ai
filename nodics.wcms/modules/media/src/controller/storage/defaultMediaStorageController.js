/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nodics.wcms/media/src/controller/storage/defaultMediaStorageController
 * @description Exposes media storage policy and location controller operations.
 * @layer controller
 * @owner media
 * @override Later layers may add upload endpoints after media-owned multipart intake exists.
 */
module.exports = {
    /**
     * Initializes the media storage controller.
     *
     * @returns {Promise<boolean>} Resolves when initialization is complete.
     */
    init: function () {
        return Promise.resolve(true);
    },
    /**
     * Finalizes the media storage controller.
     *
     * @returns {Promise<boolean>} Resolves when post-initialization is complete.
     */
    postInit: function () {
        return Promise.resolve(true);
    },
    /**
     * Resolves the upload policy for a media folder.
     *
     * @param {Object} request Nodics request wrapper.
     * @param {Function} callback Optional callback used by router pipeline.
     * @returns {Promise<Object>|void} Policy response or callback result.
     */
    resolveStoragePolicy: function (request, callback) {
        let body = request && request.httpRequest && request.httpRequest.body || {};
        let input = Object.assign({}, body, {
            tenant: request && request.tenant,
            authData: request && request.authData
        });
        if (callback) {
            FACADE.DefaultMediaStorageFacade.resolveStoragePolicy(input).then(success => callback(null, success)).catch(error => callback(error));
        } else {
            return FACADE.DefaultMediaStorageFacade.resolveStoragePolicy(input);
        }
    },
    /**
     * Lists safe backend-owned media source context metadata.
     *
     * @param {Object} request Nodics request wrapper.
     * @param {Function} callback Optional callback used by router pipeline.
     * @returns {Promise<Object>|void} Context metadata response or callback result.
     */
    listMediaContexts: function (request, callback) {
        if (callback) {
            FACADE.DefaultMediaStorageFacade.listMediaContexts().then(success => callback(null, success)).catch(error => callback(error));
        } else {
            return FACADE.DefaultMediaStorageFacade.listMediaContexts();
        }
    },
    /**
     * Returns safe storage provider summary metadata.
     *
     * @param {Object} request Nodics request wrapper.
     * @param {Function} callback Optional callback used by router pipeline.
     * @returns {Promise<Object>|void} Provider summary response or callback result.
     */
    summarizeStorageProviders: function (request, callback) {
        let input = {
            tenant: request && request.tenant,
            authData: request && request.authData
        };
        if (callback) {
            FACADE.DefaultMediaStorageFacade.summarizeStorageProviders(input).then(success => callback(null, success)).catch(error => callback(error));
        } else {
            return FACADE.DefaultMediaStorageFacade.summarizeStorageProviders(input);
        }
    },
    /**
     * Creates or updates a backend-owned media folder policy.
     *
     * @param {Object} request Nodics request wrapper.
     * @param {Function} callback Optional callback used by router pipeline.
     * @returns {Promise<Object>|void} Folder policy response or callback result.
     */
    saveFolderPolicy: function (request, callback) {
        let body = request && request.httpRequest && request.httpRequest.body || {};
        let params = request && request.httpRequest && request.httpRequest.params || {};
        let input = Object.assign({}, body, params, {
            tenant: request && request.tenant,
            authData: request && request.authData
        });
        if (callback) {
            FACADE.DefaultMediaStorageFacade.saveFolderPolicy(input).then(success => callback(null, success)).catch(error => callback(error));
        } else {
            return FACADE.DefaultMediaStorageFacade.saveFolderPolicy(input);
        }
    },
    /**
     * Creates a backend-owned media folder policy.
     *
     * @param {Object} request Nodics request wrapper.
     * @param {Function} callback Optional callback used by router pipeline.
     * @returns {Promise<Object>|void} Folder policy response or callback result.
     */
    createFolderPolicy: function (request, callback) {
        let body = request && request.httpRequest && request.httpRequest.body || {};
        let input = Object.assign({}, body, {
            create: true,
            tenant: request && request.tenant,
            authData: request && request.authData
        });
        if (callback) {
            FACADE.DefaultMediaStorageFacade.saveFolderPolicy(input).then(success => callback(null, success)).catch(error => callback(error));
        } else {
            return FACADE.DefaultMediaStorageFacade.saveFolderPolicy(input);
        }
    },
    /**
     * Activates a backend-owned media folder policy.
     *
     * @param {Object} request Nodics request wrapper.
     * @param {Function} callback Optional callback used by router pipeline.
     * @returns {Promise<Object>|void} Folder policy response or callback result.
     */
    activateFolderPolicy: function (request, callback) {
        let params = request && request.httpRequest && request.httpRequest.params || {};
        let input = {
            folderCode: params.folderCode,
            tenant: request && request.tenant,
            authData: request && request.authData
        };
        if (callback) {
            FACADE.DefaultMediaStorageFacade.activateFolderPolicy(input).then(success => callback(null, success)).catch(error => callback(error));
        } else {
            return FACADE.DefaultMediaStorageFacade.activateFolderPolicy(input);
        }
    },
    /**
     * Deactivates a backend-owned media folder policy.
     *
     * @param {Object} request Nodics request wrapper.
     * @param {Function} callback Optional callback used by router pipeline.
     * @returns {Promise<Object>|void} Folder policy response or callback result.
     */
    deactivateFolderPolicy: function (request, callback) {
        let params = request && request.httpRequest && request.httpRequest.params || {};
        let input = {
            folderCode: params.folderCode,
            tenant: request && request.tenant,
            authData: request && request.authData
        };
        if (callback) {
            FACADE.DefaultMediaStorageFacade.deactivateFolderPolicy(input).then(success => callback(null, success)).catch(error => callback(error));
        } else {
            return FACADE.DefaultMediaStorageFacade.deactivateFolderPolicy(input);
        }
    },
    /**
     * Updates a backend-owned media format policy.
     *
     * @param {Object} request Nodics request wrapper.
     * @param {Function} callback Optional callback used by router pipeline.
     * @returns {Promise<Object>|void} Format policy response or callback result.
     */
    saveFormatPolicy: function (request, callback) {
        let body = request && request.httpRequest && request.httpRequest.body || {};
        let params = request && request.httpRequest && request.httpRequest.params || {};
        let input = Object.assign({}, body, params, {
            tenant: request && request.tenant,
            authData: request && request.authData
        });
        if (callback) {
            FACADE.DefaultMediaStorageFacade.saveFormatPolicy(input).then(success => callback(null, success)).catch(error => callback(error));
        } else {
            return FACADE.DefaultMediaStorageFacade.saveFormatPolicy(input);
        }
    },
    /**
     * Creates a backend-owned media format policy.
     *
     * @param {Object} request Nodics request wrapper.
     * @param {Function} callback Optional callback used by router pipeline.
     * @returns {Promise<Object>|void} Format policy response or callback result.
     */
    createFormatPolicy: function (request, callback) {
        let body = request && request.httpRequest && request.httpRequest.body || {};
        let input = Object.assign({}, body, {
            create: true,
            tenant: request && request.tenant,
            authData: request && request.authData
        });
        if (callback) {
            FACADE.DefaultMediaStorageFacade.saveFormatPolicy(input).then(success => callback(null, success)).catch(error => callback(error));
        } else {
            return FACADE.DefaultMediaStorageFacade.saveFormatPolicy(input);
        }
    },
    /**
     * Activates a backend-owned media format policy.
     *
     * @param {Object} request Nodics request wrapper.
     * @param {Function} callback Optional callback used by router pipeline.
     * @returns {Promise<Object>|void} Format policy response or callback result.
     */
    activateFormatPolicy: function (request, callback) {
        let params = request && request.httpRequest && request.httpRequest.params || {};
        let input = {
            formatCode: params.formatCode,
            tenant: request && request.tenant,
            authData: request && request.authData
        };
        if (callback) {
            FACADE.DefaultMediaStorageFacade.activateFormatPolicy(input).then(success => callback(null, success)).catch(error => callback(error));
        } else {
            return FACADE.DefaultMediaStorageFacade.activateFormatPolicy(input);
        }
    },
    /**
     * Deactivates a backend-owned media format policy.
     *
     * @param {Object} request Nodics request wrapper.
     * @param {Function} callback Optional callback used by router pipeline.
     * @returns {Promise<Object>|void} Format policy response or callback result.
     */
    deactivateFormatPolicy: function (request, callback) {
        let params = request && request.httpRequest && request.httpRequest.params || {};
        let input = {
            formatCode: params.formatCode,
            tenant: request && request.tenant,
            authData: request && request.authData
        };
        if (callback) {
            FACADE.DefaultMediaStorageFacade.deactivateFormatPolicy(input).then(success => callback(null, success)).catch(error => callback(error));
        } else {
            return FACADE.DefaultMediaStorageFacade.deactivateFormatPolicy(input);
        }
    },
    /** Adds a media set entry. */
    addMediaSetEntry: function (request, callback) {
        let body = request && request.httpRequest && request.httpRequest.body || {};
        let params = request && request.httpRequest && request.httpRequest.params || {};
        let input = Object.assign({}, body, params, { tenant: request && request.tenant, authData: request && request.authData });
        if (callback) {
            FACADE.DefaultMediaStorageFacade.addMediaSetEntry(input).then(success => callback(null, success)).catch(error => callback(error));
        } else {
            return FACADE.DefaultMediaStorageFacade.addMediaSetEntry(input);
        }
    },
    /** Updates a media set entry. */
    updateMediaSetEntry: function (request, callback) {
        let body = request && request.httpRequest && request.httpRequest.body || {};
        let params = request && request.httpRequest && request.httpRequest.params || {};
        let input = Object.assign({}, body, params, { tenant: request && request.tenant, authData: request && request.authData });
        if (callback) {
            FACADE.DefaultMediaStorageFacade.updateMediaSetEntry(input).then(success => callback(null, success)).catch(error => callback(error));
        } else {
            return FACADE.DefaultMediaStorageFacade.updateMediaSetEntry(input);
        }
    },
    /** Removes a media set entry. */
    removeMediaSetEntry: function (request, callback) {
        let params = request && request.httpRequest && request.httpRequest.params || {};
        let input = Object.assign({}, params, { tenant: request && request.tenant, authData: request && request.authData });
        if (callback) {
            FACADE.DefaultMediaStorageFacade.removeMediaSetEntry(input).then(success => callback(null, success)).catch(error => callback(error));
        } else {
            return FACADE.DefaultMediaStorageFacade.removeMediaSetEntry(input);
        }
    },
    /** Reorders media set entries. */
    reorderMediaSetEntries: function (request, callback) {
        let body = request && request.httpRequest && request.httpRequest.body || {};
        let params = request && request.httpRequest && request.httpRequest.params || {};
        let input = Object.assign({}, body, params, { tenant: request && request.tenant, authData: request && request.authData });
        if (callback) {
            FACADE.DefaultMediaStorageFacade.reorderMediaSetEntries(input).then(success => callback(null, success)).catch(error => callback(error));
        } else {
            return FACADE.DefaultMediaStorageFacade.reorderMediaSetEntries(input);
        }
    },
    /** Marks one media set entry primary. */
    setPrimaryMediaSetEntry: function (request, callback) {
        let params = request && request.httpRequest && request.httpRequest.params || {};
        let input = Object.assign({}, params, { tenant: request && request.tenant, authData: request && request.authData });
        if (callback) {
            FACADE.DefaultMediaStorageFacade.setPrimaryMediaSetEntry(input).then(success => callback(null, success)).catch(error => callback(error));
        } else {
            return FACADE.DefaultMediaStorageFacade.setPrimaryMediaSetEntry(input);
        }
    },
    /** Approves one media reference for target usage. */
    approveMediaReference: function (request, callback) {
        let body = request && request.httpRequest && request.httpRequest.body || {};
        let params = request && request.httpRequest && request.httpRequest.params || {};
        let input = Object.assign({}, body, params, { tenant: request && request.tenant, authData: request && request.authData });
        if (callback) {
            FACADE.DefaultMediaStorageFacade.approveMediaReference(input).then(success => callback(null, success)).catch(error => callback(error));
        } else {
            return FACADE.DefaultMediaStorageFacade.approveMediaReference(input);
        }
    },
    /** Activates one approved media reference. */
    activateMediaReference: function (request, callback) {
        let body = request && request.httpRequest && request.httpRequest.body || {};
        let params = request && request.httpRequest && request.httpRequest.params || {};
        let input = Object.assign({}, body, params, { tenant: request && request.tenant, authData: request && request.authData });
        if (callback) {
            FACADE.DefaultMediaStorageFacade.activateMediaReference(input).then(success => callback(null, success)).catch(error => callback(error));
        } else {
            return FACADE.DefaultMediaStorageFacade.activateMediaReference(input);
        }
    },
    /** Deactivates one media reference while retaining rollback evidence. */
    deactivateMediaReference: function (request, callback) {
        let body = request && request.httpRequest && request.httpRequest.body || {};
        let params = request && request.httpRequest && request.httpRequest.params || {};
        let input = Object.assign({}, body, params, { tenant: request && request.tenant, authData: request && request.authData });
        if (callback) {
            FACADE.DefaultMediaStorageFacade.deactivateMediaReference(input).then(success => callback(null, success)).catch(error => callback(error));
        } else {
            return FACADE.DefaultMediaStorageFacade.deactivateMediaReference(input);
        }
    },
    /**
     * Resolves a safe provider storage location for a media descriptor.
     *
     * @param {Object} request Nodics request wrapper.
     * @param {Function} callback Optional callback used by router pipeline.
     * @returns {Promise<Object>|void} Location response or callback result.
     */
    resolveStorageLocation: function (request, callback) {
        let body = request && request.httpRequest && request.httpRequest.body || {};
        let input = Object.assign({}, body, {
            tenant: request && request.tenant,
            authData: request && request.authData
        });
        if (callback) {
            FACADE.DefaultMediaStorageFacade.resolveStorageLocation(input).then(success => callback(null, success)).catch(error => callback(error));
        } else {
            return FACADE.DefaultMediaStorageFacade.resolveStorageLocation(input);
        }
    },
    /**
     * Stores one media-parsed media upload through media.
     *
     * @param {Object} request Nodics request wrapper containing `httpRequest.files`.
     * @param {Function} callback Optional callback used by router pipeline.
     * @returns {Promise<Object>|void} Upload response or callback result.
     */
    uploadMedia: function (request, callback) {
        let body = request && request.httpRequest && request.httpRequest.body || {};
        let files = request && request.httpRequest && request.httpRequest.files || [];
        let input = Object.assign({}, body, {
            tenant: request && request.tenant,
            authData: request && request.authData,
            files: files
        });
        if (callback) {
            FACADE.DefaultMediaStorageFacade.uploadMedia(input).then(success => callback(null, success)).catch(error => callback(error));
        } else {
            return FACADE.DefaultMediaStorageFacade.uploadMedia(input);
        }
    },
    /**
     * Imports path-free media publication assets through the internal publication boundary.
     *
     * @param {Object} request Nodics request wrapper.
     * @param {Function} callback Optional callback used by router pipeline.
     * @returns {Promise<Object>|void} Imported media response.
     */
    importPublishedMediaAssets: function (request, callback) {
        let body = request && request.httpRequest && request.httpRequest.body || {};
        let input = Object.assign({}, body, {
            tenant: request && request.tenant,
            authData: request && request.authData
        });
        if (callback) {
            FACADE.DefaultMediaStorageFacade.importPublishedMediaAssets(input).then(success => callback(null, success)).catch(error => callback(error));
        } else {
            return FACADE.DefaultMediaStorageFacade.importPublishedMediaAssets(input);
        }
    },
    /**
     * Replays path-free media publication assets to the replication target.
     *
     * @param {Object} request Nodics request wrapper.
     * @param {Function} callback Optional callback used by router pipeline.
     * @returns {Promise<Object>|void} Replication reconciliation response.
     */
    reconcilePublishedMediaReplication: function (request, callback) {
        let body = request && request.httpRequest && request.httpRequest.body || {};
        let input = Object.assign({}, body, {
            tenant: request && request.tenant,
            authData: request && request.authData
        });
        if (callback) {
            FACADE.DefaultMediaStorageFacade.reconcilePublishedMediaReplication(input).then(success => callback(null, success)).catch(error => callback(error));
        } else {
            return FACADE.DefaultMediaStorageFacade.reconcilePublishedMediaReplication(input);
        }
    },
    /**
     * Retries due generic media replication obligations.
     *
     * @param {Object} request Nodics request wrapper.
     * @param {Function} callback Optional callback used by router pipeline.
     * @returns {Promise<Object>|void} Retry response.
     */
    retryPendingMediaReplication: function (request, callback) {
        let body = request && request.httpRequest && request.httpRequest.body || {};
        let input = Object.assign({}, body, {
            tenant: request && request.tenant,
            authData: request && request.authData
        });
        if (callback) {
            FACADE.DefaultMediaStorageFacade.retryPendingMediaReplication(input).then(success => callback(null, success)).catch(error => callback(error));
        } else {
            return FACADE.DefaultMediaStorageFacade.retryPendingMediaReplication(input);
        }
    },
    /** Builds a generic physical media transfer manifest. */
    buildArtifactTransferManifest: function (request, callback) {
        let body = request && request.httpRequest && request.httpRequest.body || {};
        let input = Object.assign({}, body, { tenant: request && request.tenant, authData: request && request.authData });
        if (callback) {
            FACADE.DefaultMediaStorageFacade.buildArtifactTransferManifest(input).then(success => callback(null, success)).catch(error => callback(error));
        } else {
            return FACADE.DefaultMediaStorageFacade.buildArtifactTransferManifest(input);
        }
    },
    /** Records a physical media publication receipt. */
    recordArtifactPublicationReceipt: function (request, callback) {
        let body = request && request.httpRequest && request.httpRequest.body || {};
        let input = Object.assign({}, body, { tenant: request && request.tenant, authData: request && request.authData });
        if (callback) {
            FACADE.DefaultMediaStorageFacade.recordArtifactPublicationReceipt(input).then(success => callback(null, success)).catch(error => callback(error));
        } else {
            return FACADE.DefaultMediaStorageFacade.recordArtifactPublicationReceipt(input);
        }
    },
    /** Resolves PROD/DR media role switch behavior. */
    switchProdDrMediaRoles: function (request, callback) {
        let body = request && request.httpRequest && request.httpRequest.body || {};
        let input = Object.assign({}, body, { tenant: request && request.tenant, authData: request && request.authData });
        if (callback) {
            FACADE.DefaultMediaStorageFacade.switchProdDrMediaRoles(input).then(success => callback(null, success)).catch(error => callback(error));
        } else {
            return FACADE.DefaultMediaStorageFacade.switchProdDrMediaRoles(input);
        }
    },
    /** Previews media cleanup candidates without persistence. */
    previewCleanupCandidates: function (request, callback) {
        let body = request && request.httpRequest && request.httpRequest.body || {};
        let input = Object.assign({}, body, { tenant: request && request.tenant, authData: request && request.authData });
        if (callback) {
            FACADE.DefaultMediaStorageFacade.previewCleanupCandidates(input).then(success => callback(null, success)).catch(error => callback(error));
        } else {
            return FACADE.DefaultMediaStorageFacade.previewCleanupCandidates(input);
        }
    },
    /** Scans and persists media cleanup candidates. */
    scanCleanupCandidates: function (request, callback) {
        let body = request && request.httpRequest && request.httpRequest.body || {};
        let input = Object.assign({}, body, { tenant: request && request.tenant, authData: request && request.authData });
        if (callback) {
            FACADE.DefaultMediaStorageFacade.scanCleanupCandidates(input).then(success => callback(null, success)).catch(error => callback(error));
        } else {
            return FACADE.DefaultMediaStorageFacade.scanCleanupCandidates(input);
        }
    },
    /** Marks one media cleanup candidate passive. */
    markCleanupCandidatePassive: function (request, callback) {
        let body = request && request.httpRequest && request.httpRequest.body || {};
        let params = request && request.httpRequest && request.httpRequest.params || {};
        let input = Object.assign({}, body, params, { tenant: request && request.tenant, authData: request && request.authData });
        if (callback) {
            FACADE.DefaultMediaStorageFacade.markCleanupCandidatePassive(input).then(success => callback(null, success)).catch(error => callback(error));
        } else {
            return FACADE.DefaultMediaStorageFacade.markCleanupCandidatePassive(input);
        }
    },
    /** Runs approved passive-retention cleanup. */
    runPassiveRetentionCleanup: function (request, callback) {
        let body = request && request.httpRequest && request.httpRequest.body || {};
        let input = Object.assign({}, body, { tenant: request && request.tenant, authData: request && request.authData });
        if (callback) {
            FACADE.DefaultMediaStorageFacade.runPassiveRetentionCleanup(input).then(success => callback(null, success)).catch(error => callback(error));
        } else {
            return FACADE.DefaultMediaStorageFacade.runPassiveRetentionCleanup(input);
        }
    },
    /**
     * Delivers authorized media content by media code.
     *
     * @param {Object} request Nodics request wrapper.
     * @param {Function} callback Optional callback used by router pipeline.
     * @returns {Promise<Object>|void} File response descriptor or callback result.
     */
    deliverMediaContent: function (request, callback) {
        let params = Object.assign(
            {},
            request && request.params || {},
            request && request.httpRequest && request.httpRequest.params || {}
        );
        let query = Object.assign(
            {},
            request && request.query || {},
            request && request.httpRequest && request.httpRequest.query || {}
        );
        let input = {
            tenant: request && request.tenant,
            authData: request && request.authData,
            params: params,
            query: query
        };
        if (callback) {
            FACADE.DefaultMediaStorageFacade.deliverMediaContent(input).then(success => callback(null, success)).catch(error => callback(error));
        } else {
            return FACADE.DefaultMediaStorageFacade.deliverMediaContent(input);
        }
    },
    /**
     * Downloads authorized media content by media code.
     *
     * @param {Object} request Nodics request wrapper.
     * @param {Function} callback Optional callback used by router pipeline.
     * @returns {Promise<Object>|void} File response descriptor or callback result.
     */
    downloadMediaContent: function (request, callback) {
        let params = Object.assign(
            {},
            request && request.params || {},
            request && request.httpRequest && request.httpRequest.params || {}
        );
        let query = Object.assign(
            {},
            request && request.query || {},
            request && request.httpRequest && request.httpRequest.query || {}
        );
        let input = {
            tenant: request && request.tenant,
            authData: request && request.authData,
            params: params,
            query: query,
            download: true
        };
        if (callback) {
            FACADE.DefaultMediaStorageFacade.deliverMediaContent(input).then(success => callback(null, success)).catch(error => callback(error));
        } else {
            return FACADE.DefaultMediaStorageFacade.deliverMediaContent(input);
        }
    }
};
