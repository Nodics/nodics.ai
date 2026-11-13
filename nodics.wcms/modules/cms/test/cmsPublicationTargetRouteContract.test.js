/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const routes = require('../src/router/routers').cms.cmsPublicationTarget;

test('retained approval recovery is a bound internal CMS command, not baseline installation', () => {
    const route = require('../src/router/routers').cms.cmsPublicationBaseline.reconcileApproval;
    assert.equal(route.key, '/publication/baselines/:baselineCode/reconcile-approval');
    assert.equal(route.method, 'POST');
    assert.equal(route.apiExposure, 'moduleInternal');
    assert.equal(route.secured, true);
    assert.deepEqual(route.authTokenTypes, ['service']);
    assert.equal(route.permissionConfig, 'authSecurity.internalToken.routePermission');
    const schema = route.requestBody.content['application/json'].schema;
    assert(schema.required.includes('approvalRepairBinding'));
    assert.equal(schema.additionalProperties, false);
    assert.equal(schema.properties.forceRefresh, undefined);
});

test('every publication target route is service-only and uses internal permission policy', () => {
    assert.deepEqual(Object.keys(routes).sort(), ['deployPublication', 'getPublicationStatus', 'verifyPublicationOnline',
        'detectPublicationCollisions', 'getPublicationSupportBundle', 'reconcilePublicationEvidence',
        'collectPublishedMediaGarbage', 'reconcilePublishedMediaReplication', 'retryPendingPublishedMediaReplication',
        'rollbackPublication', 'withdrawPublication'].sort());
    assert(Object.values(routes).some(route => route.key === '/publication/target/reconcile'));
    for (const route of Object.values(routes)) {
        assert.equal(route.method, 'POST', route.key);
        assert.equal(route.apiExposure, 'moduleInternal', route.key);
        assert.equal(route.secured, true, route.key);
        assert.deepEqual(route.authTokenTypes, ['service'], route.key);
        assert.equal(route.permissionConfig, 'authSecurity.internalToken.routePermission', route.key);
    }
});

test('publication parser size and read-only delivery stay CMS-owned', () => {
    assert.equal(routes.deployPublication.bodyParserHandler, 'cmsPublicationBodyParserHandler');
    assert.equal(require('../config/properties').cms.publication.maximumDeploymentRequestBytes, '64mb');
    const delivery = require('../src/router/routers').cms.cmsDelivery;
    assert.deepEqual(Object.keys(delivery).sort(), ['documentationGuides', 'publishedKnowledge', 'resolvePublicPage', 'resolveAuthenticatedPage', 'resolveStorefrontPage'].sort());
    assert.equal(delivery.publishedKnowledge.secured, false);
    assert.equal(delivery.publishedKnowledge.cache.enabled, false);
    assert.equal(delivery.documentationGuides.secured, true);
    assert.equal(delivery.documentationGuides.permissionConfig, 'cms.delivery.authenticatedPermission');
    assert.equal(delivery.documentationGuides.cache.enabled, false);
    for (const route of Object.values(delivery)) {
        assert.equal(route.method, 'GET', route.key);
        assert.notEqual(route.apiExposure, 'moduleInternal', route.key);
    }
});

test('guided publication acceptance uses semantic roles and owner APIs without persistence access', () => {
    const source = fs.readFileSync(path.join(__dirname, '../src/service/acceptance/defaultGuidedInitializationAcceptanceService.mjs'), 'utf8');
    assert(source.includes("runtimeRole?.publication === 'STAGED'"));
    assert(source.includes("runtimeRole?.publication === 'ONLINE'"));
    assert(source.includes('onlineResponse.status === 403') && source.includes("includes('dataImport')"));
    assert.doesNotMatch(source, /mongodb|mongoose|MongoClient|deleteMany|dropDatabase/i);
});
