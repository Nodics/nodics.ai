/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');
class NodicsError extends Error {}
global.CLASSES = { NodicsError };
global.CONFIG = { get: () => ({ delivery: { defaultLimit: 20, maximumLimit: 100, supportedLocales: ['en'], supportedChannels: ['web'] } }) };
global.SERVICE = { DefaultEditorialOnlineArticleService: { get: request => Promise.resolve({ result: [{ slug: 'safe', payload: { title: 'Safe', slug: '/safe' } }].filter(item => !request.query.slug || item.slug === request.query.slug) }) } };
const delivery = require('../src/service/defaultEditorialDeliveryService');
(async () => {
    let request = { tenant: 'default', delivery: { siteCode: 'main', localeCode: 'en', channel: 'web', limit: 1000 } };
    assert.equal((await delivery.list(request)).limit, 100);
    assert.equal((await delivery.detail(Object.assign({}, request, { delivery: Object.assign({}, request.delivery, { slug: 'safe' }) }))).title, 'Safe');
    assert.throws(() => delivery.context({ tenant: 'default', delivery: { siteCode: 'main', localeCode: 'fr', channel: 'web' } }));
    assert.throws(() => delivery.context({ delivery: { siteCode: 'main', localeCode: 'en', channel: 'web' } }));
})().catch(error => { console.error(error); process.exitCode = 1; });
