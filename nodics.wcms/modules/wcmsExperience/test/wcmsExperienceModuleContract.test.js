/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const assert = require('node:assert/strict');
const schemas = require('../src/schemas/schemas');
const backoffice = require('../src/service/defaultWcmsExperienceBackofficeCapabilityService');
const packageDefinition = require('../package.json');

/** @module wcmsExperience/test/wcmsExperienceModuleContract @description Verifies module loader, schema wrapper, and BackOffice capability contracts. @layer test @owner wcmsExperience */

assert.equal(packageDefinition.name, 'wcmsExperience');
assert.equal(packageDefinition.index, '75.90');
assert(packageDefinition.requiredModules.includes('cms'));
assert(packageDefinition.requiredModules.includes('discoveryQuery'));
assert(packageDefinition.nodics.loadableByNodicsModuleLoader);

assert(schemas.wcmsExperience, 'schemas must be wrapped under the module key for loader customization');
assert(schemas.wcmsExperience.cmsExperiencePlacement, 'cmsExperiencePlacement schema must belong to wcmsExperience');
assert.equal(schemas.wcmsExperience.cmsExperiencePlacement.model, true);
assert.equal(schemas.wcmsExperience.cmsExperiencePlacement.router.enabled, false);
assert.equal(schemas.wcmsExperience.cmsExperiencePlacement.definition.component.required, true);

let registered;
global.CONFIG = {
    get: key => key === 'wcmsExperience' ? {
        backoffice: {
            capabilityCode: 'wcms-experience-studio',
            displayName: 'Experience Studio',
            documentationRoute: '/docs/capabilities/content-publishing/experience-targeting'
        }
    } : undefined
};
global.SERVICE = {
    DefaultModuleRegistrationAgentService: {
        registerBackofficeCapabilityProvider: function (name, provider) {
            registered = { name: name, provider: provider };
        }
    }
};

backoffice.init().then(() => {
    let capability = registered.provider.getCapability();
    assert.equal(registered.name, 'wcmsExperience');
    assert.equal(capability.capabilityId, 'wcms-experience-studio');
    assert.equal(capability.displayName, 'Experience Studio');
    assert.deepEqual(capability.requiredPermissions, ['WCMS_EXPERIENCE_VIEW']);
    assert.equal(capability.navigation[0].route, '/content/experience-studio');
    assert.equal(capability.navigation[0].group.label, 'Content and Experience');
    assert.equal(capability.navigation[0].help.documentationRoute, '/docs/capabilities/content-publishing/experience-targeting');
    assert(capability.navigation.some(item => item.route === '/content/experience-studio/preview' &&
        item.requiredPermissions.includes('WCMS_EXPERIENCE_PREVIEW')));
    assert(capability.navigation.some(item => item.route === '/content/experience-studio/index-status' &&
        item.requiredPermissions.includes('WCMS_EXPERIENCE_PUBLISH_STATUS')));
    console.log('WCMS Experience module contract validated');
}).catch(error => { console.error(error); process.exit(1); });
