/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/** @module loyaltyWallet/test/workspace @description Synthetic registration and governed presentation checks; no live enablement or credit. @layer test @owner loyaltyWallet */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const provider = require('../src/service/defaultLoyaltyWalletBackofficeCapabilityService');
const definition = require('../../../../nodics.foundation/modules/nService/src/service/module/defaultBackofficeCapabilityDefinitionService');
test('actual module registration advertises exact implemented views and existing secured owner routes without granting anything', async () => {
    let registered;
    global.SERVICE = {
        DefaultModuleRegistrationAgentService: { registerBackofficeCapabilityProvider: (module, value) => { registered = { module, value }; } },
        DefaultBackofficeCapabilityDefinitionService: definition
    };
    await provider.init();
    assert.deepEqual(registered, { module: 'loyaltyWallet', value: provider });
    const views = provider.getCapability().navigation;
    assert.equal(views.length, 3);
    assert.deepEqual(views.map(view => view.backendWorkspace.viewCode), ['loyalty.wallet', 'loyalty.transferSettings', 'loyalty.enterpriseTestCredit']);
    const routes = Object.values(require('../../loyaltyApi/src/router/routers').loyaltyApi.participation);
    for (const view of views) {
        assert.equal(view.featureState, 'ACTIVE');
        assert.equal(view.backendWorkspace.renderer, 'axis.workspace.native');
        assert.equal(view.backendWorkspace.workspaceCode, 'loyalty.participation');
        assert.equal(view.workbenchTarget, undefined);
        const action = view.lifecycleActions[0];
        const route = routes.find(route => route.key === action.operationRoute && route.method === action.httpMethod);
        assert(route);
        assert.equal(action.ownerModule, 'loyaltyApi');
        assert.equal(route.permission, view.requiredPermissions[0]);
        assert.deepEqual(route.authTokenTypes, ['access']);
        assert.equal(route.secured, true);
        assert.equal(route.cache.enabled, false);
        assert.equal(route.requestPrivacy.sensitive, true);
    }
    assert.deepEqual(routes.find(route => route.operation === 'enterpriseTestCredit').accessGroups, ['platformAdministratorUserGroup']);
    const properties = require('../config/properties').loyalty;
    assert.equal(properties.enterpriseTestCredits.enabled, false);
    assert.deepEqual(properties.enterpriseTestCredits.allowedEnvironments, []);
    assert.equal(properties.transactions.enabled, false);
});
test('workspace release binds copy to existing Axis templates, localized properties and exact files without policy selections or grants', () => {
    const manifest = require('../data/manifest.json').sections.participationWorkspace;
    assert.equal(manifest.selectionPolicy, 'EXPLICIT');
    assert.equal(manifest.initialPublicationPolicy, 'ADMIN_INITIATED');
    assert.equal(manifest.destinationRole, 'WCMS_STAGED');
    for (const [file, expected] of Object.entries(manifest.files)) {
        assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(__dirname, '../data', file))).digest('hex'), expected);
    }
    const type = require('../data/core-v001/records/workspace/loyaltyParticipationCmsTypeData').record0;
    const component = require('../data/core-v001/records/workspace/loyaltyParticipationCmsComponentData').record0;
    const page = require('../data/core-v001/records/workspace/loyaltyParticipationCmsPageData').record0;
    const routes = Object.values(require('../data/core-v001/records/workspace/loyaltyParticipationCmsRouteData'));
    assert.deepEqual(Object.keys(component.properties).sort(), Object.keys(type.propertySchema).sort());
    assert(Object.values(type.propertySchema).every(field => field.type === 'string' && field.localized === true));
    assert.equal(component.code, 'loyaltyParticipationWorkspaceCopy');
    assert.equal(component.activationMode, undefined);
    assert.equal(component.selections, undefined);
    assert.equal(component.permissions, undefined);
    assert.equal(page.template, 'axisSchemaWorkbenchPageTemplate');
    assert.equal(page.cmsComponents[0].target, component.code);
    assert(routes.every(route => route.site === 'axisCmsSite' && route.page === page.code && route.accessMode === 'AUTHENTICATED'));
    assert.deepEqual(routes.map(route => route.path), ['/loyalty/wallet', '/loyalty/transfer-settings', '/loyalty/enterprise-test-credits']);
});
