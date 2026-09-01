/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const assert = require('node:assert/strict');
const routes = require('../src/router/routers');
const delivery = require('../src/controller/defaultWcmsExperienceDeliveryController');
const authoring = require('../src/controller/defaultWcmsExperienceAuthoringController');

/** @module wcmsExperience/test/wcmsExperienceRouteSecurityContract @description Verifies public delivery and Axis preview/status boundaries. @layer test @owner wcmsExperience */

const deliveryRoute = routes.wcmsExperience.experienceDelivery.resolve;
const previewRoute = routes.wcmsExperience.experienceAuthoring.preview;
const indexStatusRoute = routes.wcmsExperience.experienceAuthoring.indexStatus;

assert.equal(deliveryRoute.secured, false);
assert.equal(deliveryRoute.publicAccess, true);
assert.equal(deliveryRoute.apiExposure, 'cmsDelivery');
assert.equal(deliveryRoute.key, '/delivery/resolve');
assert.equal(deliveryRoute.method, 'POST');

assert.equal(previewRoute.secured, true);
assert.equal(previewRoute.apiExposure, 'cmsAuthoring');
assert.equal(previewRoute.permission, 'WCMS_EXPERIENCE_PREVIEW');
assert.equal(previewRoute.method, 'POST');

assert.equal(indexStatusRoute.secured, true);
assert.equal(indexStatusRoute.apiExposure, 'cmsAuthoring');
assert.equal(indexStatusRoute.permission, 'WCMS_EXPERIENCE_PUBLISH_STATUS');
assert.equal(indexStatusRoute.method, 'GET');

let facadeRequest;
global.FACADE = {
    DefaultWcmsExperienceDeliveryFacade: {
        resolve: request => {
            facadeRequest = request;
            return Promise.resolve({ ok: true });
        }
    }
};
global.SERVICE = {
    DefaultWcmsExperienceIndexStatusService: {
        getStatus: request => Promise.resolve({ checked: request.tenant })
    }
};

(async () => {
    await delivery.resolve({ body: { site: 'agoraApparelSite', previewMode: true } });
    assert.equal(facadeRequest.experience.previewMode, false, 'public delivery must force Online delivery mode');

    await authoring.preview({ body: { site: 'agoraApparelSite', previewMode: false } });
    assert.equal(facadeRequest.experience.previewMode, true, 'Axis preview must force previewMode=true');

    console.log('WCMS Experience route security contract validated');
})().catch(error => { console.error(error); process.exit(1); });
