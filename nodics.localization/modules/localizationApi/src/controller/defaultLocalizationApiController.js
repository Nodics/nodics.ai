/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/** @module localizationApi/controller/DefaultLocalizationApiController @description Maps bounded HTTP localization inputs to the secured facade. @layer controller @owner localizationApi @override Controllers may adapt transport details without trusting browser tenant or site scope. */
// Map owner-defined business inputs separately from identity and HTTP context.
const operationsInputs = ['namespaces', 'locales', 'fallbackLocales', 'scopeType', 'scopeCode', 'channel', 'projectCode'];
const valueInputs = ['namespace', 'key', 'locale', 'scopeType', 'scopeCode', 'projectCode', 'expectedRevision', 'reason'];
const inputs = Object.freeze({
    coverage: operationsInputs, queue: operationsInputs, sideBySide: operationsInputs, memory: ['namespaces', 'locales'],
    releases: ['scopeCode', 'channel', 'locales'], analytics: operationsInputs,
    saveDraft: [...valueInputs, 'message', 'provenance'],
    submitReview: valueInputs, approve: valueInputs,
    suggest: [...valueInputs, 'sourceLocale', 'parameters'],
    buildRelease: ['locale', 'namespaces', 'scopeCode', 'channel', 'projectCode', 'defaultLocale', 'fallbackLocales', 'version'],
    publishRelease: ['scopeCode', 'channel', 'locale', 'publicationCode', 'reason'],
    rollbackRelease: ['expectedRevision', 'reason']
});

module.exports = {
    /** Translates the owner bundle into the ordinary router success contract and honors conditional reads. */
    getRuntimeBundle: function (request, callback) {
        const { params = {}, query = {}, headers = {}, res } = request.httpRequest || {};
        const input = { ...request, locale: params.locale || request.locale,
            namespaces: typeof query.namespaces === 'string' ? query.namespaces.split(',').filter(Boolean) : request.namespaces,
            scopeCode: typeof query.scopeCode === 'string' ? query.scopeCode : request.scopeCode,
            channel: typeof query.channel === 'string' ? query.channel : request.channel || 'web',
            ifNoneMatch: headers['if-none-match'], acceptsGzip: false };
        const result = Promise.resolve().then(() => FACADE.DefaultLocalizationApiFacade.getRuntimeBundle(input)).then(bundle => {
            res?.set?.('ETag', bundle.etag);
            res?.vary?.('X-Tenant-Code');
            res?.vary?.('X-Enterprise-Code');
            if (bundle.cacheControl) res?.set?.('Cache-Control', bundle.cacheControl);
            return bundle.notModified ? { code: 'SUC_LAPI_00001' } :
                { code: 'SUC_LAPI_00000', result: { bundle: bundle.bundle } };
        });
        return this.respond(result, callback);
    },
    /** Delegates governed contribution import while keeping body data separate from verified request context. */
    importContribution: function (request, callback) {
        return this.managementResult('importContribution', {
            ...request, payload: request.httpRequest?.body || request.payload
        }, callback);
    },
    /** Delegates translation export with the exact route locale and trusted owner context. */
    exportPackage: function (request, callback) {
        const body = request.httpRequest?.body || {};
        const selected = Object.fromEntries(operationsInputs.filter(key => Object.hasOwn(body, key)).map(key => [key, body[key]]));
        return this.managementResult('exportPackage', {
            ...request, ...selected, locale: request.httpRequest?.params?.locale || request.locale
        }, callback);
    },
    /** Preserves Promise and callback entry points used by the normal router. */
    respond: function (promise, callback) {
        if (!callback) return promise;
        promise.then(value => callback(null, value)).catch(callback);
    },
    /** Wraps owner DTOs with a registered status code, leaving failures to the router. */
    managementResult: function (operation, request, callback) {
        return this.respond(Promise.resolve().then(() => FACADE.DefaultLocalizationApiFacade[operation](request))
            .then(result => ({ code: 'SUC_LAPI_00002', result })), callback);
    },
    /** Selects approved business inputs while retaining the original authorization and HTTP metadata. */
    management: function (operation, request, callback) {
        const body = request.httpRequest?.body || {};
        const params = request.httpRequest?.params || {};
        const selected = Object.fromEntries(inputs[operation].filter(key => Object.hasOwn(body, key)).map(key => [key, body[key]]));
        const input = { ...request, ...selected };
        if (params.version) input.version = params.version;
        if (params.publicationCode) input.publicationCode = params.publicationCode;
        return this.managementResult(operation, input, callback);
    },
    /** Returns localized coverage for the authorized scope. */ coverage: function (request, callback) { return this.management('coverage', request, callback); },
    /** Returns the authorized translation work queue. */ queue: function (request, callback) { return this.management('queue', request, callback); },
    /** Returns bounded values for side-by-side authoring. */ sideBySide: function (request, callback) { return this.management('sideBySide', request, callback); },
    /** Returns immutable release metadata and Online status within the authorized scope. */
    releases: function (request, callback) { return this.management('releases', request, callback); },
    /** Returns approved, reusable translation pairs for the caller's tenant. */
    memory: function (request, callback) { return this.management('memory', request, callback); },
    /** Returns content-free localization lifecycle analytics. */ analytics: function (request, callback) { return this.management('analytics', request, callback); },
    /** Saves one translation draft. */ saveDraft: function (request, callback) { return this.management('saveDraft', request, callback); },
    /** Submits one translation draft for review. */ submitReview: function (request, callback) { return this.management('submitReview', request, callback); },
    /** Approves one reviewed translation. */ approve: function (request, callback) { return this.management('approve', request, callback); },
    /** Requests a non-publishable translation suggestion. */ suggest: function (request, callback) { return this.management('suggest', request, callback); },
    /** Builds one immutable localization release. */ buildRelease: function (request, callback) { return this.management('buildRelease', request, callback); },
    /** Publishes one approved localization release. */ publishRelease: function (request, callback) { return this.management('publishRelease', request, callback); },
    /** Restores a prior immutable localization release. */ rollbackRelease: function (request, callback) { return this.management('rollbackRelease', request, callback); }
};
