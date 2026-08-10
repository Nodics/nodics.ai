/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/** @module localizationApi/controller/DefaultLocalizationApiController @description Maps bounded HTTP localization inputs to the secured facade. @layer controller @owner localizationApi @override Controllers may adapt transport details without trusting browser tenant or site scope. */
module.exports = {
    /** Maps transport filters and invokes one facade operation; tenant remains trusted server context and only published public values are addressable. */ invoke: function (operation, request, callback) { let http = request.httpRequest || {}; let params = http.params || {}; let query = http.query || {}; request.locale = params.locale || request.locale; request.namespaces = typeof query.namespaces === 'string' ? query.namespaces.split(',').filter(Boolean) : request.namespaces; request.scopeCode = typeof query.scopeCode === 'string' ? query.scopeCode : request.scopeCode; request.channel = typeof query.channel === 'string' ? query.channel : request.channel || 'web'; request.ifNoneMatch = (http.headers || {})['if-none-match']; request.acceptsGzip = /gzip/.test((http.headers || {})['accept-encoding'] || ''); request.payload = http.body || request.payload; let promise = Promise.resolve(FACADE.DefaultLocalizationApiFacade[operation](request)); if (!callback) return promise; promise.then(value => callback(null, value)).catch(callback); },
    /** Handles runtime bundle retrieval. */ getRuntimeBundle: function (request, callback) { return this.invoke('getRuntimeBundle', request, callback); },
    /** Handles contribution import. */ importContribution: function (request, callback) { return this.invoke('importContribution', request, callback); },
    /** Handles translation package export. */ exportPackage: function (request, callback) { return this.invoke('exportPackage', request, callback); }
    ,/** Maps a secured management body without accepting tenant identity from the browser. */ management: function (operation, request, callback) { let body = Object.assign({}, (request.httpRequest || {}).body || {}); delete body.tenant; Object.assign(request, body); let params = (request.httpRequest || {}).params || {}; if (params.version) request.version = params.version; if (params.publicationCode) request.publicationCode = params.publicationCode; let promise = Promise.resolve(FACADE.DefaultLocalizationApiFacade[operation](request)); if (!callback) return promise; promise.then(value => callback(null, value)).catch(callback); },
    /** Returns localized coverage for the authorized scope. */ coverage: function (request, callback) { return this.management('coverage', request, callback); },
    /** Returns the authorized translation work queue. */ queue: function (request, callback) { return this.management('queue', request, callback); },
    /** Returns bounded values for side-by-side authoring. */ sideBySide: function (request, callback) { return this.management('sideBySide', request, callback); },
    /** Returns content-free localization lifecycle analytics. */ analytics: function (request, callback) { return this.management('analytics', request, callback); },
    /** Saves one translation draft. */ saveDraft: function (request, callback) { return this.management('saveDraft', request, callback); },
    /** Submits one translation draft for review. */ submitReview: function (request, callback) { return this.management('submitReview', request, callback); },
    /** Approves one reviewed translation. */ approve: function (request, callback) { return this.management('approve', request, callback); },
    /** Requests a non-publishable translation suggestion. */ suggest: function (request, callback) { return this.management('suggest', request, callback); },
    /** Builds one immutable localization release. */ buildRelease: function (request, callback) { return this.management('buildRelease', request, callback); },
    /** Publishes one approved localization release. */ publishRelease: function (request, callback) { return this.management('publishRelease', request, callback); },
    /** Restores a prior immutable localization release. */ rollbackRelease: function (request, callback) { return this.management('rollbackRelease', request, callback); }
};
