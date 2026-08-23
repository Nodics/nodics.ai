/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nodics.wcms/media/src/router/routers
 * @description Defines media route registration and HTTP exposure metadata.
 * @layer router
 * @owner media
 * @override Later active modules may add media operations while preserving media storage authority.
 */
module.exports = {
    media: {
        storagePolicy: {
            listMediaContexts: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'media.context.view',
                apiExposure: 'mediaManagement',
                key: '/contexts',
                method: 'GET',
                controller: 'DefaultMediaStorageController',
                operation: 'listMediaContexts',
                help: {
                    requestType: 'secured',
                    message: 'Returns backend-owned media source context metadata for upload and management clients. Does not expose provider secrets.',
                    method: 'GET',
                    url: 'http://host:port/nodics/media/v0/contexts'
                },
                responses: { '200': { description: 'Media source context metadata' } }
            },
            summarizeStorageProviders: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'media.storage.policy.view',
                apiExposure: 'mediaManagement',
                key: '/storage/providers/summary',
                method: 'GET',
                controller: 'DefaultMediaStorageController',
                operation: 'summarizeStorageProviders',
                help: {
                    requestType: 'secured',
                    message: 'Returns safe storage provider and delivery summary metadata without exposing paths, buckets, credentials, or secrets.',
                    method: 'GET',
                    url: 'http://host:port/nodics/media/v0/storage/providers/summary'
                },
                responses: { '200': { description: 'Safe media storage provider summary' } }
            },
            resolveStoragePolicy: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'media.storage.policy.view',
                apiExposure: 'mediaManagement',
                key: '/storage/policy',
                method: 'POST',
                controller: 'DefaultMediaStorageController',
                operation: 'resolveStoragePolicy',
                help: {
                    requestType: 'secured',
                    message: 'Returns upload/storage policy for a backend-owned media folder. Does not expose provider secrets.',
                    method: 'POST',
                    url: 'http://host:port/nodics/media/v0/storage/policy',
                    body: {
                        folderCode: 'importSources',
                        fileName: 'catalog.xlsx',
                        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                        sizeBytes: 20480
                    }
                }
            },
            createFolderPolicy: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'media.folder.policy.manage',
                apiExposure: 'mediaManagement',
                key: '/folders/policy',
                method: 'PUT',
                controller: 'DefaultMediaStorageController',
                operation: 'createFolderPolicy',
                help: {
                    requestType: 'secured',
                    message: 'Creates a backend-owned media folder policy in effective runtime configuration. Does not accept provider secrets or raw paths.',
                    method: 'PUT',
                    url: 'http://host:port/nodics/media/v0/folders/policy',
                    body: {
                        code: 'businessDocuments',
                        name: 'Business documents',
                        storagePrefix: 'media/business',
                        access: 'PRIVATE',
                        allowedExtensions: ['pdf'],
                        allowedMimeTypes: ['application/pdf'],
                        maximumFileSizeBytes: 10485760,
                        retentionDays: 90
                    }
                }
            },
            updateFolderPolicy: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'media.folder.policy.manage',
                apiExposure: 'mediaManagement',
                key: '/folders/policy/:folderCode',
                method: 'PATCH',
                controller: 'DefaultMediaStorageController',
                operation: 'saveFolderPolicy',
                help: {
                    requestType: 'secured',
                    message: 'Updates a backend-owned media folder policy in effective runtime configuration. Does not accept provider secrets or raw paths.',
                    method: 'PATCH',
                    url: 'http://host:port/nodics/media/v0/folders/policy/{folderCode}'
                }
            },
            activateFolderPolicy: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'media.folder.policy.manage',
                apiExposure: 'mediaManagement',
                key: '/folders/policy/:folderCode/activate',
                method: 'POST',
                controller: 'DefaultMediaStorageController',
                operation: 'activateFolderPolicy'
            },
            deactivateFolderPolicy: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'media.folder.policy.manage',
                apiExposure: 'mediaManagement',
                key: '/folders/policy/:folderCode/deactivate',
                method: 'POST',
                controller: 'DefaultMediaStorageController',
                operation: 'deactivateFolderPolicy'
            },
            createFormatPolicy: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'media.format.policy.manage',
                apiExposure: 'mediaManagement',
                key: '/formats/policy',
                method: 'PUT',
                controller: 'DefaultMediaStorageController',
                operation: 'createFormatPolicy',
                help: {
                    requestType: 'secured',
                    message: 'Creates a backend-owned media format policy in effective runtime configuration.',
                    method: 'PUT',
                    url: 'http://host:port/nodics/media/v0/formats/policy'
                }
            },
            updateFormatPolicy: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'media.format.policy.manage',
                apiExposure: 'mediaManagement',
                key: '/formats/policy/:formatCode',
                method: 'PATCH',
                controller: 'DefaultMediaStorageController',
                operation: 'saveFormatPolicy'
            },
            activateFormatPolicy: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'media.format.policy.manage',
                apiExposure: 'mediaManagement',
                key: '/formats/policy/:formatCode/activate',
                method: 'POST',
                controller: 'DefaultMediaStorageController',
                operation: 'activateFormatPolicy'
            },
            deactivateFormatPolicy: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'media.format.policy.manage',
                apiExposure: 'mediaManagement',
                key: '/formats/policy/:formatCode/deactivate',
                method: 'POST',
                controller: 'DefaultMediaStorageController',
                operation: 'deactivateFormatPolicy'
            },
            addMediaSetEntry: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'media.set.manage',
                apiExposure: 'mediaManagement',
                key: '/sets/:mediaSetCode/entries',
                method: 'POST',
                controller: 'DefaultMediaStorageController',
                operation: 'addMediaSetEntry'
            },
            updateMediaSetEntry: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'media.set.manage',
                apiExposure: 'mediaManagement',
                key: '/sets/:mediaSetCode/entries/:entryCode',
                method: 'PATCH',
                controller: 'DefaultMediaStorageController',
                operation: 'updateMediaSetEntry'
            },
            removeMediaSetEntry: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'media.set.manage',
                apiExposure: 'mediaManagement',
                key: '/sets/:mediaSetCode/entries/:entryCode',
                method: 'DELETE',
                controller: 'DefaultMediaStorageController',
                operation: 'removeMediaSetEntry'
            },
            reorderMediaSetEntries: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'media.set.manage',
                apiExposure: 'mediaManagement',
                key: '/sets/:mediaSetCode/entries/reorder',
                method: 'POST',
                controller: 'DefaultMediaStorageController',
                operation: 'reorderMediaSetEntries'
            },
            setPrimaryMediaSetEntry: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'media.set.manage',
                apiExposure: 'mediaManagement',
                key: '/sets/:mediaSetCode/entries/:entryCode/primary',
                method: 'POST',
                controller: 'DefaultMediaStorageController',
                operation: 'setPrimaryMediaSetEntry'
            },
            approveMediaReference: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'media.reference.lifecycle.manage',
                apiExposure: 'mediaManagement',
                key: '/references/:referenceCode/approve',
                method: 'POST',
                controller: 'DefaultMediaStorageController',
                operation: 'approveMediaReference'
            },
            activateMediaReference: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'media.reference.lifecycle.manage',
                apiExposure: 'mediaManagement',
                key: '/references/:referenceCode/activate',
                method: 'POST',
                controller: 'DefaultMediaStorageController',
                operation: 'activateMediaReference'
            },
            deactivateMediaReference: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'media.reference.lifecycle.manage',
                apiExposure: 'mediaManagement',
                key: '/references/:referenceCode/deactivate',
                method: 'POST',
                controller: 'DefaultMediaStorageController',
                operation: 'deactivateMediaReference'
            },
            resolveStorageLocation: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'media.storage.location.resolve',
                apiExposure: 'mediaManagement',
                key: '/storage/location',
                method: 'POST',
                controller: 'DefaultMediaStorageController',
                operation: 'resolveStorageLocation',
                help: {
                    requestType: 'secured',
                    message: 'Resolves a safe provider storage key and URL for a parsed media descriptor. Raw filesystem paths are rejected.',
                    method: 'POST',
                    url: 'http://host:port/nodics/media/v0/storage/location',
                    body: {
                        folderCode: 'importSources',
                        fileName: 'catalog.xlsx',
                        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                        sizeBytes: 20480
                    }
                }
            },
            uploadMedia: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'media.upload.create',
                apiExposure: 'mediaManagement',
                bodyParserHandler: 'mediaMultipartUploadBodyParserHandler',
                key: '/storage/upload',
                method: 'POST',
                controller: 'DefaultMediaStorageController',
                operation: 'uploadMedia',
                help: {
                    requestType: 'secured',
                    message: 'Uploads one file through media-owned multipart intake and stores it as media-owned media metadata.',
                    method: 'POST',
                    url: 'http://host:port/nodics/media/v0/storage/upload',
                    body: {
                        folderCode: 'importSources',
                        formatCode: 'importFile',
                        file: '<multipart file field>'
                    }
                },
                requestBody: {
                    required: true,
                    content: {
                        'multipart/form-data': {
                            schema: {
                                type: 'object',
                                required: ['file'],
                                properties: {
                                    file: { type: 'string', format: 'binary' },
                                    folderCode: { type: 'string' },
                                    formatCode: { type: 'string' },
                                    moduleName: { type: 'string' },
                                    schemaName: { type: 'string' },
                                    indexName: { type: 'string' },
                                    keyStrategy: { type: 'string' },
                                    mediaCode: { type: 'string' },
                                    name: { type: 'string' },
                                    description: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: { '200': { description: 'Stored media metadata descriptor' } }
            },
            importPublishedMediaAssets: {
                secured: true,
                authTokenTypes: ['service'],
                accessGroups: ['userGroup'],
                permissionConfig: 'authSecurity.internalToken.routePermission',
                apiExposure: 'moduleInternal',
                bodyParserHandler: 'mediaPublicationBodyParserHandler',
                key: '/publication/target/assets/import',
                method: 'POST',
                controller: 'DefaultMediaStorageController',
                operation: 'importPublishedMediaAssets',
                help: {
                    requestType: 'internalService',
                    message: 'Imports checksum-verified path-free media assets into a publication target runtime.',
                    method: 'POST',
                    url: 'http://host:port/nodics/media/v0/publication/target/assets/import'
                },
                responses: { '200': { description: 'Imported media publication assets' } }
            },
            reconcilePublishedMediaReplication: {
                secured: true,
                authTokenTypes: ['service'],
                accessGroups: ['userGroup'],
                permissionConfig: 'authSecurity.internalToken.routePermission',
                apiExposure: 'moduleInternal',
                bodyParserHandler: 'mediaPublicationBodyParserHandler',
                key: '/publication/target/assets/reconcile-replication',
                method: 'POST',
                controller: 'DefaultMediaStorageController',
                operation: 'reconcilePublishedMediaReplication',
                help: {
                    requestType: 'internalService',
                    message: 'Replays checksum-verified media assets to the configured replication target through governed media providers.',
                    method: 'POST',
                    url: 'http://host:port/nodics/media/v0/publication/target/assets/reconcile-replication'
                },
                responses: { '200': { description: 'Media replication reconciliation result' } }
            },
            retryPendingMediaReplication: {
                secured: true,
                authTokenTypes: ['service'],
                accessGroups: ['userGroup'],
                permissionConfig: 'authSecurity.internalToken.routePermission',
                apiExposure: 'moduleInternal',
                key: '/publication/replication/retry-pending',
                method: 'POST',
                controller: 'DefaultMediaStorageController',
                operation: 'retryPendingMediaReplication',
                help: {
                    requestType: 'internalService',
                    message: 'Retries due generic media replication obligations for content, product, import, export, and custom media owners.',
                    method: 'POST',
                    url: 'http://host:port/nodics/media/v0/publication/replication/retry-pending'
                },
                responses: { '200': { description: 'Generic media replication retry result' } }
            },
            buildArtifactTransferManifest: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'media.publication.artifact.manage',
                apiExposure: 'mediaManagement',
                key: '/publication/artifacts/manifest',
                method: 'POST',
                controller: 'DefaultMediaStorageController',
                operation: 'buildArtifactTransferManifest',
                help: { requestType: 'secured', message: 'Builds a provider-neutral physical media transfer manifest for publishable content, product, documentation, accelerator, import, export, or custom media artifacts.', method: 'POST', url: 'http://host:port/nodics/media/v0/publication/artifacts/manifest' },
                responses: { '200': { description: 'Physical media transfer manifest' } }
            },
            recordArtifactPublicationReceipt: {
                secured: true,
                authTokenTypes: ['service'],
                accessGroups: ['userGroup'],
                permissionConfig: 'authSecurity.internalToken.routePermission',
                apiExposure: 'moduleInternal',
                key: '/publication/artifacts/receipt',
                method: 'POST',
                controller: 'DefaultMediaStorageController',
                operation: 'recordArtifactPublicationReceipt',
                help: { requestType: 'internalService', message: 'Records target import, publication, replication, or cleanup receipt for physical media artifacts.', method: 'POST', url: 'http://host:port/nodics/media/v0/publication/artifacts/receipt' },
                responses: { '200': { description: 'Physical media publication receipt' } }
            },
            switchProdDrMediaRoles: {
                secured: true,
                authTokenTypes: ['service'],
                accessGroups: ['userGroup'],
                permissionConfig: 'authSecurity.internalToken.routePermission',
                apiExposure: 'moduleInternal',
                key: '/publication/topology/prod-dr/switch-roles',
                method: 'POST',
                controller: 'DefaultMediaStorageController',
                operation: 'switchProdDrMediaRoles',
                help: { requestType: 'internalService', message: 'Resolves PROD/DR active and replication media role switch behavior for failover/failback orchestration.', method: 'POST', url: 'http://host:port/nodics/media/v0/publication/topology/prod-dr/switch-roles' },
                responses: { '200': { description: 'PROD/DR media role switch descriptor' } }
            },
            previewCleanupCandidates: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'media.cleanup.view',
                apiExposure: 'mediaManagement',
                key: '/cleanup/candidates/preview',
                method: 'POST',
                controller: 'DefaultMediaStorageController',
                operation: 'previewCleanupCandidates',
                help: { requestType: 'secured', message: 'Previews unused or expired media cleanup candidates without persisting records or deleting physical media.', method: 'POST', url: 'http://host:port/nodics/media/v0/cleanup/candidates/preview' },
                responses: { '200': { description: 'Dry-run media cleanup candidate result' } }
            },
            scanCleanupCandidates: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'media.cleanup.manage',
                apiExposure: 'mediaManagement',
                key: '/cleanup/candidates/scan',
                method: 'POST',
                controller: 'DefaultMediaStorageController',
                operation: 'scanCleanupCandidates',
                help: { requestType: 'secured', message: 'Scans for generic media cleanup candidates and persists safe operator-visible review records.', method: 'POST', url: 'http://host:port/nodics/media/v0/cleanup/candidates/scan' },
                responses: { '200': { description: 'Persisted media cleanup candidate scan result' } }
            },
            markCleanupCandidatePassive: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'media.cleanup.manage',
                apiExposure: 'mediaManagement',
                key: '/cleanup/candidates/:candidateCode/mark-passive',
                method: 'POST',
                controller: 'DefaultMediaStorageController',
                operation: 'markCleanupCandidatePassive',
                help: { requestType: 'secured', message: 'Marks one cleanup candidate passive without physically deleting provider media.', method: 'POST', url: 'http://host:port/nodics/media/v0/cleanup/candidates/{candidateCode}/mark-passive' },
                parameters: [{ name: 'candidateCode', in: 'path', required: true, schema: { type: 'string' } }],
                responses: { '200': { description: 'Passive media cleanup candidate' } }
            },
            runPassiveRetentionCleanup: {
                secured: true,
                authTokenTypes: ['service'],
                accessGroups: ['userGroup'],
                permissionConfig: 'authSecurity.internalToken.routePermission',
                apiExposure: 'moduleInternal',
                key: '/cleanup/retention/run',
                method: 'POST',
                controller: 'DefaultMediaStorageController',
                operation: 'runPassiveRetentionCleanup',
                help: { requestType: 'internalService', message: 'Runs approved passive-retention physical media cleanup through governed provider APIs.', method: 'POST', url: 'http://host:port/nodics/media/v0/cleanup/retention/run' },
                responses: { '200': { description: 'Passive retention cleanup result' } }
            },
            deliverMediaContent: {
                secured: true,
                permission: 'media.content.read',
                accessGroups: ['userGroup'],
                publicAccess: true,
                apiExposure: 'mediaDelivery',
                key: '/content/:mediaCode',
                method: 'GET',
                controller: 'DefaultMediaStorageController',
                operation: 'deliverMediaContent',
                responseHandler: 'mediaContentResponseHandler',
                help: {
                    requestType: 'publicMediaDelivery',
                    message: 'Delivers media content by media code after media access policy validation.',
                    method: 'GET',
                    url: 'http://host:port/nodics/media/v0/content/{mediaCode}'
                },
                parameters: [
                    { name: 'mediaCode', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: { '200': { description: 'Media binary content' } }
            },
            downloadMediaContent: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'media.content.download',
                apiExposure: 'mediaManagement',
                key: '/download/:mediaCode',
                method: 'GET',
                controller: 'DefaultMediaStorageController',
                operation: 'downloadMediaContent',
                responseHandler: 'fileDownloadResponseHandler',
                help: {
                    requestType: 'secured',
                    message: 'Downloads private or public media content by media code after media access policy validation.',
                    method: 'GET',
                    url: 'http://host:port/nodics/media/v0/download/{mediaCode}'
                },
                parameters: [
                    { name: 'mediaCode', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: { '200': { description: 'Media binary download' } }
            }
        },
        referenceLookup: {
            validate: {
                secured: true,
                accessGroups: ['userGroup'],
                permissionConfig: 'authSecurity.internalToken.routePermission',
                apiExposure: 'moduleInternal',
                key: '/references/media/validate',
                method: 'POST',
                controller: 'DefaultMediaReferenceLookupController',
                operation: 'validate',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                additionalProperties: false,
                                required: ['referenceType', 'referenceCode'],
                                properties: {
                                    referenceType: { type: 'string', enum: ['MEDIA', 'MEDIA_SET'] },
                                    referenceCode: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: { '200': { description: 'Bounded media reference validation result' } }
            }
        }
    }
};
