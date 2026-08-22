/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
const zlib = require('zlib');
/** @module localizationApi/service/DefaultLocalizationBundleService @description Projects published immutable releases into allow-listed public runtime bundles with ETag and optional gzip transport metadata. @layer service @owner localizationApi @override Cache transports may vary while preserving scope, exposure, version, and checksum boundaries. */
module.exports = {
    /** Returns API limits. */ configuration: function () { return ((CONFIG.get('localization') || {}).api || {}); },
    /** Returns a published public-safe runtime bundle or a not-modified result. */ get: async function (request) { this.validateRequest(request); let repository = SERVICE.DefaultLocalizationReleaseManagementService.repository(); let online = await repository.getOnline(request.scopeCode, request); if (!online) throw this.error('ERR_LAPI_00001', 'Published localization release is unavailable'); let release = await repository.getRelease(online.version || online.releaseVersion, request); SERVICE.DefaultLocalizationReleaseManagementService.validate(release); let allowed = (((CONFIG.get('localization') || {}).authority || {}).publicExposures || ['PUBLIC']); let namespaces = new Set(request.namespaces); let entries = Object.fromEntries(Object.entries(release.entries || {}).filter(([identity, value]) => namespaces.has(identity.split(':')[0]) && allowed.includes(value.exposure)).map(([identity, value]) => [identity.replace(':', '.'), value.message])); if (Object.keys(entries).length > Number(this.configuration().maximumBundleKeys || 10000)) throw this.error('ERR_LAPI_00002', 'Bundle contains too many keys'); let etag = '"loc-' + release.checksum + '"'; if (request.ifNoneMatch === etag) return { statusCode: 304, etag: etag, releaseVersion: release.version, notModified: true }; let bundle = { contractVersion: 0, locale: release.locale, scopeCode: release.scopeCode, channel: release.channel, namespaces: [...namespaces].sort(), releaseVersion: release.version, entries: entries }; let serialized = Buffer.from(JSON.stringify(bundle)); let response = { statusCode: 200, etag: etag, cacheControl: this.configuration().cacheControl, releaseVersion: release.version, bundle: bundle }; if (request.acceptsGzip === true && serialized.length >= Number(this.configuration().compressionThresholdBytes || 1024)) { response.contentEncoding = 'gzip'; response.encodedBody = zlib.gzipSync(serialized).toString('base64'); delete response.bundle; } return Object.freeze(response); },
    /** Validates bounded trusted public bundle scope. */ validateRequest: function (request) { let maximum = Number(this.configuration().maximumNamespaces || 50); if (!request || !request.tenant || !request.scopeCode || !request.channel || !request.locale || !Array.isArray(request.namespaces) || !request.namespaces.length || request.namespaces.length > maximum || request.namespaces.some(value => typeof value !== 'string' || !/^[a-z][a-z0-9.-]*$/.test(value))) throw this.error('ERR_LAPI_00000', 'Bundle scope is invalid'); },
    /** Creates a stable bundle error. */ error: function (code, message) { let error = typeof CLASSES !== 'undefined' && CLASSES.NodicsError ? new CLASSES.NodicsError(code, message) : new Error(message); error.code = error.code || code; return error; }
};
