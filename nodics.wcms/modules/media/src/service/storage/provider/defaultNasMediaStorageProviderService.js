/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module media/service/storage/provider/DefaultNasMediaStorageProviderService
 * @description Shared filesystem/NAS media provider using local provider semantics behind a distinct provider service.
 * @layer service
 * @owner media
 * @override Production customers may replace this with mounted NAS locking, checksum, and health behavior.
 */
module.exports = {
    /** Initializes the service. */
    init: function () { return Promise.resolve(true); },
    /** Completes service initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns the delegated local provider implementation. */
    local: function () { return SERVICE.DefaultLocalMediaStorageProviderService; },
    /** Resolves a provider-specific storage location. */
    resolveLocation: function (request) { return this.local().resolveLocation(request); },
    /** Stores a media payload through the provider. */
    store: function (request) { return this.local().store(request); },
    /** Reads a bounded media payload through the provider. */
    read: function (request) { return this.local().read(request); },
    /** Transfers media through provider-native or delegated behavior. */
    transfer: function (request) { return this.local().transfer(request); },
    /** Removes media through the provider. */
    remove: function (request) { return this.local().remove(request); },
    /** Resolves a backend-only NAS import source descriptor. */
    resolveImportSource: function (request) { return this.local().resolveImportSource(request); },
    /** Returns safe provider health metadata. */
    summarizeHealth: function (request) { return Object.assign({}, this.local().summarizeHealth ? this.local().summarizeHealth(request) : { status: 'UNKNOWN' }, { providerType: 'SHARED_FILESYSTEM' }); }
};
