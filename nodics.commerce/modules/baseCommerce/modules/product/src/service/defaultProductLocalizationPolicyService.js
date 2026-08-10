/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module product/service/defaultProductLocalizationPolicyService
 * @description Validates and resolves Product-owned localized business data without duplicating commercial identities.
 * @layer service
 * @owner product
 * @override Later modules may override policy methods or layered product.localization properties.
 */
module.exports = {
    /** Initializes the Product localization policy service. */
    init: function () { return Promise.resolve(true); },
    /** Completes Product localization policy service initialization. */
    postInit: function () { return Promise.resolve(true); },

    /** Returns the effective layered Product localization policy. */
    policy: function () {
        let product = typeof CONFIG !== 'undefined' && CONFIG.get ? CONFIG.get('product') : {};
        return Object.assign({ supportedLocales: ['en'], defaultLocale: 'en', fallbackLocales: [], requiredLocales: ['en'],
            requiredProductFields: ['name'], requiredCategoryFields: ['name'], requiredVariantFields: [],
            allowLegacySharedText: true, maximumLocalizedFields: 100 }, product && product.localization || {});
    },

    /** Canonicalizes one BCP47 locale through nLocalization when available. */
    canonicalize: function (locale) {
        if (typeof SERVICE !== 'undefined' && SERVICE.DefaultLocaleCanonicalizationService) {
            return SERVICE.DefaultLocaleCanonicalizationService.canonicalize(locale);
        }
        try { return Intl.getCanonicalLocales(String(locale).replace(/_/g, '-'))[0]; } catch (error) {
            throw this.error('ERR_PRODUCT_L10N_0001', 'Product locale is invalid');
        }
    },

    /** Validates tenant, aggregate identity, locale, bounded fields, and readiness state for one variant. */
    validate: function (request, localization, kind) {
        let model = localization || {};
        let ownerProperty = kind === 'category' ? 'categoryCode' : kind === 'variant' ? 'variantCode' : 'productCode';
        if (!request || !request.tenant || model.tenant !== request.tenant || !model[ownerProperty]) {
            throw this.error('ERR_PRODUCT_L10N_0002', 'Tenant-scoped Product localization identity is required');
        }
        model.locale = this.canonicalize(model.locale);
        let supported = this.policy().supportedLocales.map(this.canonicalize.bind(this));
        if (!supported.includes(model.locale)) throw this.error('ERR_PRODUCT_L10N_0003', 'Product locale is not supported');
        let fields = Object.keys(model).filter(key => !['code', 'tenant', ownerProperty, 'productCode', 'locale', 'status', 'revision', 'active'].includes(key));
        if (fields.length > Number(this.policy().maximumLocalizedFields)) throw this.error('ERR_PRODUCT_L10N_0004', 'Product localization exceeds configured field bounds');
        if (!['DRAFT', 'READY'].includes(model.status)) throw this.error('ERR_PRODUCT_L10N_0005', 'Product localization status is invalid');
        return true;
    },

    /** Proves all required locales and fields are READY before publication. */
    completeness: function (request, localizations, kind) {
        let policy = this.policy();
        let requiredLocales = policy.requiredLocales.map(this.canonicalize.bind(this));
        let requiredFields = kind === 'category' ? policy.requiredCategoryFields :
            kind === 'variant' ? policy.requiredVariantFields : policy.requiredProductFields;
        let variants = (localizations || []).filter(model => model.tenant === request.tenant);
        for (let locale of requiredLocales) {
            let variant = variants.find(model => this.canonicalize(model.locale) === locale);
            if (!variant || variant.status !== 'READY') throw this.error('ERR_PRODUCT_L10N_0006', 'Required Product locale is not ready');
            this.validate(request, variant, kind);
            if ((requiredFields || []).some(field => variant[field] === undefined || variant[field] === null || variant[field] === '')) {
                throw this.error('ERR_PRODUCT_L10N_0007', 'Required Product localized field is missing');
            }
        }
        return { complete: true, requiredLocales: requiredLocales, readyLocales: variants.filter(item => item.status === 'READY').map(item => this.canonicalize(item.locale)) };
    },

    /** Resolves exact then configured fallback localized values for a Product projection. */
    resolve: function (request, localizations, requestedLocale) {
        let policy = this.policy();
        let requested = this.canonicalize(requestedLocale || policy.defaultLocale);
        let chain = Array.from(new Set([requested].concat(policy.fallbackLocales || []).map(this.canonicalize.bind(this))));
        let variants = (localizations || []).filter(item => item.tenant === request.tenant && item.status === 'READY');
        let resolvedLocale = chain.find(locale => variants.some(item => this.canonicalize(item.locale) === locale));
        let value = variants.find(item => this.canonicalize(item.locale) === resolvedLocale);
        return { value: value, requestedLocale: requested, resolvedLocale: resolvedLocale,
            fallbackUsed: !!resolvedLocale && resolvedLocale !== requested, missing: !value };
    },

    /** Creates a stable Product localization error. */
    error: function (code, message) {
        let error = typeof CLASSES !== 'undefined' && CLASSES.NodicsError ? new CLASSES.NodicsError(code, message) : new Error(message);
        error.code = error.code || code;
        return error;
    }
};
