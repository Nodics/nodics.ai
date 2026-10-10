/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module cms/test/cmsDocumentationOptionalNavigation @description Proves optional documentation navigation uses exact immutable publication availability without mutating source records. @layer test @owner cms */
const test = require('node:test');
const assert = require('node:assert/strict');
const delivery = require('../src/service/delivery/defaultCmsDeliveryService');

test('published documentation navigation excludes missing and cross-scope routes without importing anything', () => {
    const scope = { site: 'docsSite', locale: 'en', channel: 'web', accessMode: 'PUBLIC' };
    const snapshot = { ...scope, page: { components: [{ renderer: 'documentation.component.navigation',
        properties: { items: [{ route: '/docs/available' }, { route: '/docs/missing' }, { route: '/docs/private' }, { route: '/docs/french' }, { route: '/docs/foreign' }] } }] } };
    const before = JSON.stringify(snapshot);
    const routes = [{ ...scope, path: '/docs/available' }, { ...scope, path: '/docs/private', accessMode: 'AUTHENTICATED' },
        { ...scope, path: '/docs/french', locale: 'fr' }, { ...scope, path: '/docs/foreign', site: 'otherSite' }];
    const result = delivery.filterDocumentationNavigation(snapshot, routes);
    assert.deepEqual(result.page.components[0].properties.items, [{ route: '/docs/available' }]);
    assert.equal(JSON.stringify(snapshot), before);
});

test('related guides resolve exact owners and anchors only inside the immutable published scope', () => {
    const scope = { site: 'docsSite', locale: 'en', channel: 'web', accessMode: 'PUBLIC' };
    const target = { renderer: 'documentation.component.article', properties: { code: 'shared.guide', title: 'Shared guide',
        source: { owner: 'sharedModule' }, headings: [{ anchor: 'verified-section' }] } };
    const article = { renderer: 'documentation.component.article', properties: {
        previous: { route: '/docs/missing' }, next: { route: '/docs/shared' },
        relatedLinks: [{ title: 'Untrusted projection', route: '/docs/missing' }],
        references: [{ documentId: 'shared.guide', owner: 'sharedModule', anchor: 'verified-section' },
            { documentId: 'shared.guide', owner: 'sharedModule', anchor: 'verified-section' },
            { documentId: 'shared.guide', owner: 'wrongOwner' },
            { documentId: 'shared.guide', owner: 'sharedModule', anchor: 'missing-section' },
            { documentId: 'private.guide', owner: 'sharedModule' }, { documentId: 'missing.guide', owner: 'sharedModule' }] } };
    const snapshot = { ...scope, page: { components: [article] } };
    const routes = [{ ...scope, path: '/docs/shared', page: { components: [{ componentRef: 'sharedArticle' }] } },
        { ...scope, path: '/docs/private', accessMode: 'AUTHENTICATED', page: { components: [{ ...target,
            properties: { ...target.properties, code: 'private.guide' } }] } }];
    const before = JSON.stringify({ snapshot, routes, target });
    const result = delivery.filterDocumentationNavigation(snapshot, routes, { sharedArticle: target });
    assert.deepEqual(result.page.components[0].properties.relatedLinks, [{ title: 'Shared guide', route: '/docs/shared#verified-section' }]);
    assert.equal(result.page.components[0].properties.previous, undefined);
    assert.deepEqual(result.page.components[0].properties.next, { route: '/docs/shared' });
    assert.equal(JSON.stringify({ snapshot, routes, target }), before);
});
