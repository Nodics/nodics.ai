/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('node:assert/strict');
const test = require('node:test');

const serviceContract = require('../src/service/localization/defaultCmsContentLocalizationService');
const sampleSites = require('../data/sample/data/sites/sampleCmsSiteData');
const samplePages = require('../data/sample/data/pages/sampleCmsPageData');
const sampleComponents = require('../data/sample/data/components/sampleCmsComponentData');
const sampleLocalizations = require('../data/sample/data/components/sampleCmsComponentLocalizationData');
const sampleRoutes = require('../data/sample/data/pages/sampleCmsPageRouteData');
const statusDefinitions = require('../src/utils/statusDefinitions');

[
    ['ERR_CMS_00107', '400'],
    ['ERR_CMS_00108', '422'],
    ['ERR_CMS_00109', '422'],
    ['ERR_CMS_00110', '422']
].forEach(([code, httpStatus]) => {
    assert.equal(statusDefinitions[code].code, httpStatus, code + ' must be registered with the expected HTTP status');
});

function service() {
    return Object.assign({}, serviceContract, {
        policy: () => ({ supportedLocales: ['en', 'ar'], defaultLocale: 'en', fallbackLocales: ['en'],
            legacyRouteLocale: 'default', allowLegacySharedProperties: true, maximumLocalizedProperties: 10 }),
        error: (code, message) => Object.assign(new Error(message), { code })
    });
}

const bannerType = {
    propertySchema: {
        trackingId: { type: 'string', localized: false },
        title: { type: 'string', localized: true, requiredLocales: ['en', 'ar'] },
        body: { type: 'string', localized: true }
    }
};

test('one component identity resolves exact and fallback localized properties', () => {
    const localization = service();
    const component = { code: 'homeBanner', properties: { trackingId: 'hero-1' } };
    const variants = [
        { componentCode: 'homeBanner', locale: 'en', properties: { title: 'Welcome', body: 'Hello' } },
        { componentCode: 'homeBanner', locale: 'ar', properties: { title: 'مرحبا', body: 'أهلا' } }
    ];
    assert.deepEqual(localization.resolve(component, variants, 'ar'), {
        properties: { trackingId: 'hero-1', title: 'مرحبا', body: 'أهلا' },
        localization: { requestedLocale: 'ar', resolvedLocale: 'ar', fallbackUsed: false, missing: false }
    });
    const fallback = localization.resolve(component, variants.slice(0, 1), 'ar');
    assert.equal(fallback.properties.title, 'Welcome');
    assert.equal(fallback.localization.fallbackUsed, true);
});

test('localized declarations reject shared fields and missing mandatory values', () => {
    const localization = service();
    const component = { code: 'homeBanner' };
    localization.validateTypeContract(bannerType);
    assert.throws(() => localization.validateVariant({ componentCode: 'homeBanner', locale: 'en',
        properties: { trackingId: 'wrong place', title: 'Welcome' } }, bannerType, component), { code: 'ERR_CMS_00109' });
    assert.throws(() => localization.validateVariant({ componentCode: 'homeBanner', locale: 'ar',
        properties: {} }, bannerType, component), { code: 'ERR_CMS_00110' });
});

test('legacy string declarations remain valid only while the compatibility policy is enabled', () => {
    const localization = service();
    assert.equal(localization.validateTypeContract({ propertySchema: { title: 'string' } }), true);
    localization.policy = () => ({ allowLegacySharedProperties: false });
    assert.throws(() => localization.validateTypeContract({ propertySchema: { title: 'string' } }), {
        code: 'ERR_CMS_00108'
    });
});

test('localized media selects exact locale, then fallback, then unscoped placement', () => {
    const localization = service();
    const references = [
        { componentMediaCode: 'hero-en', role: 'primary', slot: 'hero', position: 0, localeCode: 'en' },
        { componentMediaCode: 'hero-ar', role: 'primary', slot: 'hero', position: 0, localeCode: 'ar' },
        { componentMediaCode: 'icon', role: 'icon', slot: 'hero', position: 1 }
    ];
    assert.deepEqual(localization.selectMedia(references, 'ar').map(item => item.componentMediaCode), ['hero-ar', 'icon']);
});

test('representative sample persists one site, page, and banner identity for English and Arabic', () => {
    const site = Object.values(sampleSites).find(item => item.code === 'sampleLocalizedCmsSite');
    const page = Object.values(samplePages).find(item => item.code === 'sampleLocalizedHomePage');
    const component = Object.values(sampleComponents).find(item => item.code === 'sampleLocalizedHomeBanner');
    const variants = Object.values(sampleLocalizations).filter(item => item.componentCode === component.code);
    const routes = Object.values(sampleRoutes).filter(item => item.page === page.code);
    assert.equal(site.catalog, 'defaultContentCatalog');
    assert.deepEqual(page.cmsSite, [site.code]);
    assert.equal(page.cmsComponents.length, 1);
    assert.equal(page.cmsComponents[0].target, component.code);
    assert.deepEqual(variants.map(item => item.locale).sort(), ['ar', 'en']);
    assert(variants.every(item => item.status === 'READY'));
    assert.deepEqual(routes.map(item => item.locale).sort(), ['ar', 'en']);
    assert(routes.every(item => item.site === site.code && item.accessMode === 'PUBLIC' && item.deliveryState === 'ONLINE'));
});
