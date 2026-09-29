/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module backoffice/test/applicationSetupPlan @description Read-only, extensible setup-scope projection. */
const assert = require('node:assert/strict');
const service = require('../src/service/defaultBackofficeApplicationInitializationService');
const defaults = require('../config/properties').backofficeApplicationInitialization;
const profile = {
  code: 'newOffering', type: 'NEW_CATEGORY', owner: 'partner.service',
  applicationCode: 'newOffering', siteCode: 'newSite', baselineCode: 'newBaseline',
  presentation: { title: 'New business service', category: 'New category', requiredFunctionalModules: ['nodics.process'] },
  requiredFunctionalModules: [{ code: 'nodics.process', label: 'Approval capability' }],
  preparation: { steps: [
    { order: 2, code: 'partner:optional', kind: 'Demonstration records', type: 'DATA_RELEASE', dataType: 'sample', targetServer: 'service', targetRuntimeRole: 'SERVICE', required: false },
    { order: 1, code: 'partner:core', kind: 'Required records', type: 'DATA_RELEASE', dataType: 'core', targetServer: 'service', targetRuntimeRole: 'SERVICE' },
    { order: 3, code: 'partner:core', kind: 'Required records', type: 'DATA_RELEASE', dataType: 'core', targetServer: 'service', targetRuntimeRole: 'SERVICE' },
  ] },
};
global.CONFIG = { get: key => key === 'backofficeApplicationInitialization' ? { ...defaults, profiles: { newOffering: profile } } : undefined };
global.SERVICE = new Proxy({}, { get() { throw new Error('Plan discovery must not invoke services'); } });
global.CLASSES = { NodicsError: class extends Error {} };
const projected = service.describe(profile);
assert.equal(projected.category, 'New category');
assert.equal(projected.title, 'New business service');
const plan = projected.setupPlan;
assert.deepEqual(plan.stages.map(stage => stage.code), ['capabilities', 'preparation', 'publication']);
assert.equal(plan.stages[0].items.length, 1, 'shared requirements are projected once');
assert.deepEqual(plan.stages[1].items.map(item => [item.label, item.required]), [['Required records', true], ['Demonstration records', false]]);
assert(!JSON.stringify(plan).includes('targetServer'));
assert(!JSON.stringify(plan).includes('manifestPath'));
const override = { ...service, preparationSteps() { return []; } };
assert.deepEqual(override.describe(profile).setupPlan.stages.map(stage => stage.code), ['capabilities', 'publication'], 'later module overrides remain effective');
const extended = { ...service, setupPlan(input) { const result = service.setupPlan.call(this, input); return { ...result, stages: [...result.stages, { code: 'partnerReview', title: 'Partner review', summary: 'Partner-owned decision', items: [{ code: 'review', label: 'Review terms', required: true, type: 'REVIEW', owner: input.owner }] }] }; } };
assert.equal(extended.describe(profile).setupPlan.stages.at(-1).code, 'partnerReview');
console.log('application setup plan contract passed');
const artwork = { mediaCode: 'owner-preview', alt: 'Application preview', secret: 'must-not-project' };
const target = { runtimeRole: 'WCMS_STAGED', endpoint: 'must-not-project' };
assert.deepEqual(service.describe({ ...profile, target, presentation: { ...profile.presentation, visual: artwork } }).visual, { mediaCode: artwork.mediaCode, alt: artwork.alt, runtimeRole: 'WCMS_STAGED', active: false });
for (const src of ['javascript:alert(1)', 'data:image/svg+xml,test', '//other.test/img', 'https://user:secret@other.test/img', 'http://other.test/img', '/\\other.test/img', 'relative.jpg']) {
  assert.equal(service.visual({ src, alt: 'Preview' }, target), undefined);
}
assert.equal(service.visual({ src: '/brand/preview.webp', alt: 'Preview' }, target), undefined);
assert.equal(service.visual(artwork), undefined, 'no transport target must not guess a runtime');
for (const mediaCode of ['../secret', 'x/y', 'x?token=test', 'a'.repeat(161), '']) {
  assert.equal(service.visual({ ...artwork, mediaCode }, target), undefined);
}
assert.deepEqual(service.visual(artwork, { runtimeRole: 'PARTNER_CONTENT' }), { mediaCode: artwork.mediaCode, alt: artwork.alt, runtimeRole: 'PARTNER_CONTENT', active: false }, 'use the owning profile target, not a frontend runtime map');
const prepared = { readiness: 'IMPORTED', preparation: { steps: service.requiredFunctionalModules(profile).map(step => ({ ...step, status: 'CURRENT' })) } };
assert.equal(service.applicationArtworkActive(profile, prepared), true, 'publication is not required for activated application media');
assert.equal(service.applicationArtworkActive(profile, { ...prepared, readiness: 'NOT_IMPORTED' }), false, 'catalogue discovery is not application activation');
assert.equal(service.applicationArtworkActive(profile, { ...prepared, readiness: 'RETIRED' }), false);
assert.equal(service.applicationArtworkActive(profile, { ...prepared, preparation: { steps: [] } }), false, 'missing activation evidence cannot show application media');
assert.equal(service.applicationArtworkActive(profile, { ...prepared, preparation: { steps: prepared.preparation.steps.map(step => ({ ...step, status: 'NOT_ACTIVE' })) } }), false);
