/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/** @module localizationCore/service/DefaultLocalizationOperationsService @description Projects coverage, queues, side-by-side values, fallback, and audit analytics for authorized operators. @layer service @owner localizationCore @override Reporting stores may replace projection reads without changing value authority. */
module.exports = {
    /** Resolves bounded keys and values for an operations request. */
    load: async function (request) {
        if (!request || !request.tenant || !Array.isArray(request.namespaces) || !request.namespaces.length || !Array.isArray(request.locales) || !request.locales.length) throw this.error('ERR_LOC_00002', 'Localization operations scope is invalid');
        let authority = (CONFIG.get('localization') || {}).authority || {};
        let repository = SERVICE.DefaultLocalizationReleaseManagementService.repository();
        let keys = await repository.listKeys(request);
        let values = [];
        for (let locale of request.locales) values = values.concat(await repository.listValues(Object.assign({}, request, { locale: locale })));
        if (keys.length > Number(authority.maximumQueueItems || 1000) || values.length > Number(authority.maximumAnalyticsAuditEntries || 10000)) throw this.error('ERR_LOC_00005', 'Localization operations boundary exceeded');
        return { keys: keys, values: values };
    },
    /** Returns per-locale coverage reconciled with explicit fallback usage. */
    coverage: async function (request) {
        let data = await this.load(request); let fallbackLocales = request.fallbackLocales || ((CONFIG.get('localization') || {}).authority || {}).defaultFallbackLocales || [];
        let locales = request.locales.map(locale => { let approved = 0; let draft = 0; let review = 0; let missing = 0; let fallback = 0;
            data.keys.forEach(key => { let exact = data.values.find(value => value.locale === locale && value.namespace === key.namespace && value.key === key.key && value.state === 'APPROVED');
                if (exact) approved++; else { let any = data.values.find(value => value.locale === locale && value.namespace === key.namespace && value.key === key.key); if (any && any.state === 'REVIEW') review++; else if (any) draft++; let fallbackValue = fallbackLocales.some(fallbackLocale => data.values.some(value => value.locale === fallbackLocale && value.namespace === key.namespace && value.key === key.key && value.state === 'APPROVED')); if (fallbackValue) fallback++; else missing++; } });
            return { locale: locale, total: data.keys.length, approved: approved, review: review, draft: draft, fallback: fallback, missing: missing, coveragePercent: data.keys.length ? Math.round((approved / data.keys.length) * 10000) / 100 : 100 }; });
        return Object.freeze({ tenant: request.tenant, namespaces: request.namespaces, locales: Object.freeze(locales), telemetry: { exact: locales.reduce((sum, item) => sum + item.approved, 0), fallback: locales.reduce((sum, item) => sum + item.fallback, 0), missing: locales.reduce((sum, item) => sum + item.missing, 0) } });
    },
    /** Returns missing, draft, and review work ordered without exposing internal messages. */
    queue: async function (request) { let data = await this.load(request); let items = []; data.keys.forEach(key => request.locales.forEach(locale => { let value = data.values.find(item => item.locale === locale && item.namespace === key.namespace && item.key === key.key); if (!value || value.state !== 'APPROVED') items.push({ namespace: key.namespace, key: key.key, locale: locale, ownerModule: key.ownerModule, exposure: key.exposure, protected: key.protected === true, state: value && value.state || 'MISSING', revision: value && value.revision || 0 }); })); return Object.freeze(items); },
    /** Returns values grouped by key for safe side-by-side editing. */
    sideBySide: async function (request) { let data = await this.load(request); return Object.freeze(data.keys.map(key => Object.freeze({ namespace: key.namespace, key: key.key, defaultMessage: key.defaultMessage, parameters: key.parameters, exposure: key.exposure, protected: key.protected === true, values: Object.freeze(Object.fromEntries(request.locales.map(locale => { let value = data.values.find(item => item.locale === locale && item.namespace === key.namespace && item.key === key.key); return [locale, value ? { message: value.message, state: value.state, revision: value.revision, scopeType: value.scopeType, scopeCode: value.scopeCode } : undefined]; }))) }))); },
    /** Aggregates content-free lifecycle audit counts for operational analytics. */
    analytics: async function (request) { let data = await this.load(request); let transitions = {}; let actors = new Set(); data.values.forEach(value => (value.auditTrail || []).forEach(audit => { transitions[audit.toState] = Number(transitions[audit.toState] || 0) + 1; if (audit.actor) actors.add(audit.actor); })); return Object.freeze({ tenant: request.tenant, valueCount: data.values.length, transitionCounts: Object.freeze(transitions), distinctActorCount: actors.size }); },
    /** Creates a stable operations error. */ error: function (code, message) { let error = typeof CLASSES !== 'undefined' && CLASSES.NodicsError ? new CLASSES.NodicsError(code, message) : new Error(message); error.code = error.code || code; return error; }
};
