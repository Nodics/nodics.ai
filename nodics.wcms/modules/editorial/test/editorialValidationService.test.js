/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');
global.SERVICE = {};
SERVICE.DefaultEditorialValidationService = require('../src/service/defaultEditorialValidationService');
SERVICE.DefaultEditorialReadinessService = require('../src/service/defaultEditorialReadinessService');
let article = { code: 'welcome', contentTypeCode: 'NEWS', internalName: 'Welcome', slug: 'welcome', siteCodes: ['main'], authorCodes: ['editor'], publishFrom: '2026-01-01', publishUntil: '2026-02-01' };
let localization = { articleCode: 'welcome', localeCode: 'en', title: 'Welcome', slug: 'welcome', body: { blocks: [] }, status: 'READY' };
assert.equal(SERVICE.DefaultEditorialValidationService.validate(article, [localization], { requiredLocaleCodes: ['en'] }).valid, true);
assert.equal(SERVICE.DefaultEditorialReadinessService.evaluate(article, [localization], { requiredLocaleCodes: ['en'] }).status, 'READY');
assert.equal(SERVICE.DefaultEditorialReadinessService.evaluate(Object.assign({}, article, { authorCodes: [] }), [localization], {}).status, 'BLOCKED');
assert.equal(SERVICE.DefaultEditorialValidationService.validate(Object.assign({}, article, { publishUntil: '2025-01-01' }), [localization], {}).valid, false);
