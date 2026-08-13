/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** Proves the opt-in Staged layer versions publishable CMS schemas only. */
const assert = require('node:assert/strict');
const schemas = require('../src/schemas/schemas').cms;

['cmsSite', 'cmsPageRoute', 'cmsPage', 'cmsComponentDetail', 'cmsComponent',
    'cmsComponentLocalization', 'cmsComponentMedia', 'cmsTypeCode',
    'cmsPageTemplate', 'cmsSlotDefinition'].forEach(name => {
    assert.equal(schemas[name].isVersionedEnabled, true, name + ' must be versioned in CMS Staged');
});
assert.equal(schemas.cmsPublicationManifest, undefined, 'operational publication records must not become business-versioned');
console.log('CMS Staged schema versioning contract validated');
