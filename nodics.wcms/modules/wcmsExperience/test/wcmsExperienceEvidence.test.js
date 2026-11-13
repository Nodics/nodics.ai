/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');
/** @module wcmsExperience/test/wcmsExperienceEvidence @description Proves truthful scoped evidence, no fixture fallback and remote clock guards. @layer test @owner wcmsExperience */

const status = require('../src/service/defaultWcmsExperienceIndexStatusService');
const resolver = require('../src/service/defaultWcmsExperienceResolverService');
const projection = require('../src/service/defaultWcmsExperienceProjectionService');
const request = {tenant: 'isolated', authData: {employee: 'author'}, httpRequest: {query: {site: 'site-a', pageType: 'PRODUCT_LISTING', targetType: 'DEFAULT', targetCode: '*', locale: 'en'}}};
test('scoped status distinguishes empty, observed and unavailable; never certifies an alias', async () => {
 global.CONFIG = {get: () => ({resolver: {maxComponents: 3}, indexing: {mode: 'OUTBOX_EVENTUAL'}})};
 let captured;
 global.SERVICE = {DefaultWcmsExperienceResolverService: resolver, DefaultWcmsExperienceProjectionService: {...projection, findPlacements: async context => {captured = context; return [];}}};
 let value = await status.getStatus(request);
 assert.equal(value.status, 'EMPTY'); assert.equal(value.documentCount, 0); assert.equal(value.observationLimit, 3);
 assert.equal(captured.tenant, 'isolated'); assert.equal(captured.previewMode, true); assert.equal(captured.site, 'site-a');
 SERVICE.DefaultWcmsExperienceProjectionService.findPlacements = async () => [{site: 'site-a', pageType: 'PRODUCT_LISTING', targetType: 'DEFAULT', targetCode: '*', publicationStatus: 'STAGED', deliveryStatus: 'ACTIVE', indexVersion: 'one'}];
 value = await status.getStatus(request); assert.equal(value.status, 'OBSERVED'); assert.equal(value.currentIndexVersion, 'one'); assert.equal(value.documentCount, 1); assert.equal(value.resolvedPlacementCount, 1); assert.equal(value.onlineAliasTemplate, undefined);
 SERVICE.DefaultWcmsExperienceProjectionService.findPlacements = async () => {throw new Error('private credentials');};
 value = await status.getStatus(request); assert.equal(value.status, 'UNAVAILABLE'); assert.equal(value.documentCount, undefined); assert(!JSON.stringify(value).includes('private credentials'));
 await assert.rejects(status.getStatus({query: {}}), error => error.code === 'ERR_WCMS_EXPERIENCE_INPUT_INVALID');
});
test('HTTP contexts cannot select the clock or assert private segment membership', async () => {
 const body = {site: 'site-a', pageType: 'PRODUCT_LISTING', now: '2000-01-01', customerSegments: ['staff'], tenant: 'foreign', previewMode: true};
 for(const name of ['Delivery', 'Authoring']) {
  const controller = require('../src/controller/defaultWcmsExperience'+name+'Controller');
  assert.deepEqual(controller.readContext({body}), {site: 'site-a', pageType: 'PRODUCT_LISTING'});
 }
 const context = resolver.normalizeContext({experience: {site: 'site-a', pageType: 'PRODUCT_LISTING'}});
 const row = {site: 'site-a', pageType: 'PRODUCT_LISTING', publicationStatus: 'ONLINE', deliveryStatus: 'ACTIVE'};
 assert.equal(resolver.isActivePlacement(context, row), true);
 for(const unsafe of [{publicationStatus: undefined}, {deliveryStatus: undefined}, {region: 'private-region'}, {validTo: 'bad-date'}, {customerSegments: ['staff']}]) assert.equal(resolver.isActivePlacement(context, {...row, ...unsafe}), false);
 assert.equal(resolver.validateContext({...context, targetType: 'INVALID'}).valid, false);
 assert.equal(resolver.validateContext({...context, site: 'x'.repeat(257)}).valid, false);
});

test('default Experience help uses the canonical CMS documentation route; explicit overrides remain supported', () => {
 const route = Object.values(require('../data/docs-v001/records/documentation/wcmsExperienceDocumentationRouteData'))[0].path;
 const config = require('../config/properties');
 const capability = require('../src/service/defaultWcmsExperienceBackofficeCapabilityService');
 assert.equal(config.wcmsExperience.backoffice.documentationRoute, route);
 assert(capability.navigation({}).every(entry => entry.help.documentationRoute === route));
 assert(capability.navigation({documentationRoute: '/docs/customer/custom-experience'}).every(entry => entry.help.documentationRoute === '/docs/customer/custom-experience'));
});
