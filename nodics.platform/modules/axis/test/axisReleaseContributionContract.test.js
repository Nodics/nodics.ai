/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module axis/test/axisReleaseContributionContract @description Verifies ordinary Axis discovery and preserved Init/Core publication semantics. @layer test @owner axis */
const test = require('node:test');
const assert = require('node:assert/strict');
const binding = require('../../../../nodics.foundation/modules/nConfig/src/service/defaultConfigurationBindingService');
const source = require('../config/properties');
const manifest = require('../data/manifest.json');

test('Axis contributes only its selected source sections and does not enable an initialization profile', () => {
    const policy = binding.merge({}, source).data.dataReleases;
    assert.equal(policy.runtimeRoleProfiles, undefined);
    assert.deepEqual(policy.contributions, [{ moduleName: 'axis', sections: ['axisBaseline', 'core-v001'] }]);
    assert.equal(policy.initializationProfiles, undefined);
    assert.equal(policy.types, undefined);
    assert.deepEqual(policy.initializationProfileDefaults.axisDocumentationFoundation.steps,
        [{ dataType: 'init', releaseCodes: ['axis:axisBaseline', 'cms:init-v001'] }]);
    assert.equal(manifest.sections.axisBaseline.dataType, 'init');
    assert.equal(manifest.sections['core-v001'].dataType, 'core');
    for (const key of ['axisBaseline', 'core-v001']) {
        assert.equal(manifest.sections[key].lifecycle, 'PUBLISHABLE');
        assert.equal(manifest.sections[key].publicationPolicy, 'REQUIRED');
        assert.equal(manifest.sections[key].initialPublicationPolicy, 'ADMIN_INITIATED');
    }
});

test('release selector composition leaves parent-owned CMS baseline and other namespaces unchanged', () => {
    const before = structuredClone(source);
    const effective = binding.merge({}, source);
    assert.deepEqual(effective.cms, before.cms);
    assert.deepEqual(effective.backoffice, before.backoffice);
    for (const key of Object.keys(source).filter(key => key !== 'data')) assert.deepEqual(effective[key], before[key]);
    assert.deepEqual(source, before);
    const narrowed = binding.merge(effective, { data: { dataReleases: { contributions: {
        $config: 'keyed', key: 'moduleName', entries: [{ moduleName: 'axis',
            sections: { $config: 'replace', value: ['axisBaseline'] } }], remove: []
    } } } });
    assert.deepEqual(narrowed.data.dataReleases.contributions[0].sections, ['axisBaseline']);
    assert.deepEqual(narrowed.cms, before.cms);
});
