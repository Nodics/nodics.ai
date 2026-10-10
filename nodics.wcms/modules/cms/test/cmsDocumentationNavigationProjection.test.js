/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
'use strict';

/** @module cms/test/cmsDocumentationNavigationProjection @description Protects immutable, scoped navigation search derived only from reachable frozen articles. @layer test @owner cms */
const assert = require('node:assert/strict');
const test = require('node:test');
const owner = require('../src/service/publication/defaultCmsPublicationManifestOrchestrationService');
global.SERVICE = {};
global.CLASSES = { NodicsError: class extends Error {} };

function fixture() {
    const route = { code: 'route', site: 'site', path: '/guide', locale: 'en', channel: 'web', accessMode: 'PUBLIC', page: 'page', active: true };
    const article = { code: 'article', renderer: 'documentation.component.article', active: true,
        properties: { code: 'owner.guide', route: '/guide', title: 'Current guide', summary: 'Current summary',
            source: { owner: 'capability' }, searchText: 'Current afterPublicationStepCode guidance', searchKeywords: ['selected stage'] } };
    const properties = { title: 'Documentation', items: [{ code: 'owner.guide', route: '/guide', title: 'Old guide',
        summary: 'Old summary', searchText: 'Historical global barrier', searchKeywords: ['old'], order: 2 }] };
    const models = { 'cmsPageRoute:route': route, 'cmsPage:page': { code: 'page', active: true },
        'cmsComponentDetail:navigation': { source: 'page', target: 'navigation' },
        'cmsComponentDetail:wrapper': { source: 'page', target: 'wrapper' },
        'cmsComponentDetail:article': { source: 'wrapper', target: 'article' },
        'cmsComponent:navigation': { code: 'navigation', renderer: 'documentation.component.navigation', properties },
        'cmsComponent:wrapper': { code: 'wrapper', properties: {} }, 'cmsComponent:article': article };
    return { route, article, properties, models };
}

test('snapshot reader search uses the exact current article without changing frozen source or exposing article search fields', () => {
    const f = fixture(), before = structuredClone(f);
    const result = owner.buildRouteSnapshot(f.models, f.route);
    const nav = result.page.components.find(component => component.code === 'navigation');
    assert.equal(nav.properties.items[0].searchText, f.article.properties.searchText);
    assert.equal(nav.properties.items[0].title, 'Current guide');
    assert.equal(nav.properties.items[0].summary, 'Current summary');
    assert.deepEqual(nav.properties.items[0].searchKeywords, ['selected stage']);
    assert.equal(nav.properties.items[0].order, 2);
    assert.equal(result.page.components.find(component => component.code === 'wrapper').components[0].properties.searchText, undefined);
    assert.deepEqual(f, before);
});

test('absent, unassociated, inactive, foreign Site/locale/channel/access and redirected articles never become reader search results', () => {
    for (const mutate of [
        f => { delete f.models['cmsComponent:article']; },
        f => { delete f.models['cmsComponentDetail:article']; },
        f => { f.article.active = false; }, f => { f.models['cmsComponentDetail:article'].active = false; },
        f => { f.models['cmsPage:page'].active = false; }, f => { f.route.active = false; },
        f => { f.route.routeType = 'REDIRECT'; },
        f => { f.article.properties.route = '/another'; }, f => { delete f.article.properties.source.owner; },
        ...['site', 'locale', 'channel', 'accessMode'].map(field => f => {
            f.models['cmsPageRoute:route'] = { ...f.route, [field]: 'foreign' };
        }),
    ]) {
        const f = fixture(); mutate(f);
        assert.deepEqual(owner.documentationNavigationProperties(f.properties, f.models, f.route).items, []);
    }
});

test('duplicate canonical identities and mismatched navigation routes refuse stale projection rather than choose an owner', () => {
    const f = fixture();
    f.models['cmsComponent:duplicate'] = { ...f.article, code: 'duplicate', properties: { ...f.article.properties, source: { owner: 'another' } } };
    f.models['cmsComponentDetail:duplicate'] = { source: 'page', target: 'duplicate' };
    assert.deepEqual(owner.documentationNavigationProperties(f.properties, f.models, f.route).items, []);
    delete f.models['cmsComponentDetail:duplicate'];
    f.properties.items[0].route = '/wrong';
    assert.deepEqual(owner.documentationNavigationProperties(f.properties, f.models, f.route).items, []);
});

test('missing canonical full text falls back to current metadata, not historical text or an unfrozen read', () => {
    const f = fixture(); delete f.article.properties.searchText;
    assert.equal(owner.documentationNavigationProperties(f.properties, f.models, f.route).items[0].searchText,
        'Current guide Current summary selected stage');
});

test('article localization uses only the same preloaded exact component variants', t => {
    const f = fixture();
    const variant = { componentCode: 'article', locale: 'en', properties: { searchText: 'Localized current search' } };
    f.models['cmsComponentLocalization:article-en'] = variant;
    global.SERVICE.DefaultCmsContentLocalizationService = { resolve(component, variants, locale) {
        assert.equal(component, f.article); assert.equal(locale, 'en'); assert.deepEqual(variants, [variant]);
        return { properties: { ...component.properties, ...variant.properties } };
    } };
    t.after(() => { delete global.SERVICE.DefaultCmsContentLocalizationService; });
    assert.equal(owner.documentationNavigationProperties(f.properties, f.models, f.route).items[0].searchText, 'Localized current search');
});
