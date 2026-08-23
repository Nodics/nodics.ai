/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module media/service/storage/provider/DefaultCloudMediaStorageProviderService
 * @description Generic cloud media provider contract for streaming, signed-copy, or multipart implementations.
 * @layer service
 * @owner media
 * @override Configure a concrete cloud adapter by overriding these methods with provider SDK behavior.
 */
module.exports = {
    /** Initializes the service. */
    init: function () { return Promise.resolve(true); },
    /** Completes service initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Raises a configuration error for an unconfigured cloud adapter. */
    unavailable: function () { throw new CLASSES.NodicsError('ERR_MED_00032', 'Concrete cloud media provider adapter is not configured'); },
    /** Resolves a provider-specific storage location. */
    resolveLocation: function () { return this.unavailable(); },
    /** Stores a media payload through a concrete cloud adapter. */
    store: function () { return this.unavailable(); },
    /** Reads a bounded media payload through the provider. */
    read: function () { return this.unavailable(); },
    /** Transfers media through cloud-native copy, streaming, or multipart behavior. */
    transfer: function () { return this.unavailable(); },
    /** Removes media through the provider. */
    remove: function () { return this.unavailable(); },
    /** Resolves a backend-only cloud import source descriptor. */
    resolveImportSource: function () { return this.unavailable(); },
    /** Returns safe provider health metadata. */
    summarizeHealth: function () { return { status: 'NOT_CONFIGURED', providerType: 'CLOUD_OBJECT_STORAGE', message: 'Configure a concrete S3, Azure Blob, GCP Storage, or custom cloud adapter before production use.' }; }
};
