/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module cms/service/localization/defaultCmsContentLocalizationService
 * @description Validates and resolves locale-specific CMS properties while preserving one shared component identity.
 * @layer service
 * @owner cms
 */
module.exports = {
    /** Initializes the stateless CMS localization service. */
    init: function () { return Promise.resolve(true); },
    /** Completes initialization without creating parallel state. */
    postInit: function () { return Promise.resolve(true); },

    /** Canonicalizes and validates one BCP47 locale identifier. */
    canonicalize: function (locale) {
        if (typeof SERVICE !== 'undefined' && SERVICE.DefaultLocaleCanonicalizationService &&
            typeof SERVICE.DefaultLocaleCanonicalizationService.canonicalize === 'function') {
            return SERVICE.DefaultLocaleCanonicalizationService.canonicalize(locale);
        }
        try { return Intl.getCanonicalLocales(String(locale))[0]; } catch (error) {
            throw this.error('ERR_CMS_00107', 'CMS locale must be a valid BCP47 language tag');
        }
    },

    /** Returns the layered CMS localization policy. */ policy: function () {
        let configured = typeof CONFIG !== 'undefined' && CONFIG.get ? (CONFIG.get('cms') || {}).localization : {};
        return Object.assign({ enabled: false, supportedLocales: [], defaultLocale: 'en', fallbackLocales: [],
            legacyRouteLocale: 'default', allowLegacySharedProperties: true, maximumLocalizedProperties: 100 }, configured || {});
    },

    /** Builds the ordered requested and fallback locale chain. */ localeChain: function (requestedLocale) {
        let policy = this.policy();
        let requested = this.canonicalize(requestedLocale || policy.defaultLocale);
        let supported = (policy.supportedLocales || []).map(this.canonicalize.bind(this));
        if (supported.length && !supported.includes(requested)) throw this.error('ERR_CMS_00107', 'CMS locale is not supported');
        return Array.from(new Set([requested].concat(policy.fallbackLocales || []).map(this.canonicalize.bind(this))));
    },

    /** Returns property declarations for a CMS component type. */ declarations: function (typeCode) {
        let schema = typeCode && typeCode.propertySchema;
        return schema && typeof schema === 'object' && !Array.isArray(schema) ? schema : {};
    },

    /** Validates localized-property declarations for one component type. */ validateTypeContract: function (typeCode) {
        Object.keys(this.declarations(typeCode)).forEach(name => {
            let declaration = typeCode.propertySchema[name];
            if (typeof declaration === 'string' && this.policy().allowLegacySharedProperties === true) return;
            if (!declaration || typeof declaration !== 'object' || Array.isArray(declaration) ||
                (declaration.localized !== undefined && typeof declaration.localized !== 'boolean') ||
                (declaration.requiredLocales !== undefined && !Array.isArray(declaration.requiredLocales))) {
                throw this.error('ERR_CMS_00108', 'CMS localized property declaration is invalid');
            }
            (declaration.requiredLocales || []).forEach(this.canonicalize.bind(this));
        });
        return true;
    },

    /** Validates one locale variant against its component and type contract. */ validateVariant: function (variant, typeCode, component) {
        let model = variant || {};
        let locale = this.canonicalize(model.locale);
        if (!component || model.componentCode !== component.code) throw this.error('ERR_CMS_00109', 'CMS localization component identity is invalid');
        let properties = model.properties;
        if (!properties || typeof properties !== 'object' || Array.isArray(properties)) throw this.error('ERR_CMS_00109', 'CMS localized properties must be an object');
        let declarations = this.declarations(typeCode);
        let names = Object.keys(properties);
        if (names.length > Number(this.policy().maximumLocalizedProperties) || names.some(name => !declarations[name] || declarations[name].localized !== true)) {
            throw this.error('ERR_CMS_00109', 'CMS localization contains undeclared localized properties');
        }
        Object.keys(declarations).forEach(name => {
            let declaration = declarations[name];
            if (declaration.localized === true && (declaration.requiredLocales || []).map(this.canonicalize.bind(this)).includes(locale) &&
                (properties[name] === undefined || properties[name] === null || properties[name] === '')) {
                throw this.error('ERR_CMS_00110', 'CMS localization is missing a mandatory property');
            }
        });
        model.locale = locale;
        return true;
    },

    /** Resolves shared and localized properties using the governed fallback chain. */ resolve: function (component, variants, requestedLocale) {
        let chain = this.localeChain(requestedLocale);
        let byLocale = (variants || []).reduce((result, variant) => {
            result[this.canonicalize(variant.locale)] = variant;
            return result;
        }, {});
        let resolvedLocale = chain.find(locale => byLocale[locale]);
        let localized = resolvedLocale ? byLocale[resolvedLocale].properties : {};
        return {
            properties: Object.assign({}, component.properties || {}, localized || {}),
            localization: {
                requestedLocale: chain[0],
                resolvedLocale: resolvedLocale,
                fallbackUsed: !!resolvedLocale && resolvedLocale !== chain[0],
                missing: !resolvedLocale
            }
        };
    },

    /** Selects locale-preferred media without duplicating semantic slots. */ selectMedia: function (references, requestedLocale) {
        let chain = this.localeChain(requestedLocale);
        let scoped = references || [];
        return scoped.filter(reference => !reference.localeCode || chain.includes(this.canonicalize(reference.localeCode)))
            .sort((left, right) => {
                let leftRank = left.localeCode ? chain.indexOf(this.canonicalize(left.localeCode)) : chain.length;
                let rightRank = right.localeCode ? chain.indexOf(this.canonicalize(right.localeCode)) : chain.length;
                return leftRank - rightRank || Number(left.position || 0) - Number(right.position || 0);
            }).reduce((result, reference) => {
                let key = [reference.role, reference.slot || 'default', reference.position || 0].join(':');
                if (!result.keys.has(key)) { result.keys.add(key); result.items.push(reference); }
                return result;
            }, { keys: new Set(), items: [] }).items;
    },

    /** Creates one stable CMS localization error. */ error: function (code, message) {
        let error = typeof CLASSES !== 'undefined' && CLASSES.NodicsError ? new CLASSES.NodicsError(code, message) : new Error(message);
        error.code = error.code || code;
        return error;
    }
};
