/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module editorial/test/editorialProcessActionCallback @description Checks internal-only routing and denies the original human callback bypass without touching persistence. @layer test @owner editorial */
const assert = require('node:assert/strict');
const test = require('node:test');
const controller = require('../src/controller/defaultEditorialProcessActionController');
const routes = require('../src/router/routers').editorial.editorialAuthoring;
const tokens = require('../../../../nodics.foundation/modules/nAuth/src/service/identity/defaultServiceTokenService');
test('Process callbacks require scoped runtime authority; user access cannot apply a correlated decision', async () => {
    global.CLASSES = {
        NodicsError: class extends Error {
            constructor(code, message) {
                super(message);
                this.code = code;
            }
        },
    };
    let reads = 0;
    global.SERVICE = {
        DefaultServiceTokenService: tokens,
        DefaultEditorialArticleService: {
            get: async () => {
                reads++;
            },
        },
    };
    await assert.rejects(
        controller.applyDecision({
            tenant: 'tenantA',
            authData: { tokenType: 'access', loginId: 'submitter' },
            httpRequest: {
                body: {
                    instance: { code: 'review', context: { articleCode: 'news', articleRevision: 1 } },
                    body: { decision: { action: 'APPROVE' } },
                },
            },
        }),
        /scoped runtime/,
    );
    assert.equal(reads, 0);
    for (const route of [routes.processDecision, routes.processPublication]) {
        assert.deepEqual(route.authTokenTypes, ['service']);
        assert.equal(route.permission, undefined);
        assert.equal(route.permissionConfig, 'authSecurity.internalToken.routePermission');
        assert.equal(route.apiExposure, 'moduleInternal');
        assert.equal(route.secured, true);
    }
});


test('Online target uses internal persistence authority only after scoped Editorial and runtime validation', async () => {
    const target = require('../src/controller/defaultEditorialPublicationTargetController');
    const targetService = require('../src/service/defaultEditorialPublicationTargetService');
    const identity = require('../../../../nodics.foundation/modules/nAuth/src/service/identity/defaultIdentityGovernanceService');
    const defaults = require('../../../../nodics.foundation/modules/nAuth/config/properties');
    const access = require('../../../../nodics.foundation/modules/nDatabase/database/src/service/schema/defaultSchemaAccessHandlerService');
    const groups = require('../config/properties').schemaPolicies.editorial.operational.accessGroups;
    let runtimeRole = 'ONLINE', reads = 0, authorityRequests = 0;
    global.UTILS = { isBlank: value => !value || !Object.keys(value).length };
    global.CONFIG = { get: key => key === 'editorial' ? { publication: { runtimeRole } } :
        key === 'identityGovernance' ? defaults.identityGovernance : undefined };
    global.SERVICE = {
        DefaultServiceTokenService: tokens,
        DefaultEditorialPublicationTargetService: targetService,
        DefaultIdentityGovernanceService: { getSystemAuthData: () => { authorityRequests++; return identity.getSystemAuthData(); } },
        DefaultEditorialOnlineArticleService: { get: async request => {
            assert.ok(access.getAccessPoint(request.authData, groups) >= 10);
            assert.equal(request.authData.serviceId, 'source');
            assert.equal(request.tenant, 'tenantA');
            assert.deepEqual(request.query, { articleCode: 'article-one', status: 'CURRENT' });
            reads++;
            return { result: [] };
        } },
    };
    const authData = { tokenType: 'service', serviceId: 'source', entCode: 'enterpriseA', tenant: 'tenantA',
        modules: ['editorial'], runtimeInstanceId: 'source', runtimeScope: {
            instanceCode: 'source', projectCode: 'projectA', environmentCode: 'local', serverCode: 'staged', assignmentCode: 'source-grant',
        } };
    const request = { tenant: 'tenantA', authData, httpRequest: { body: { articleCode: 'article-one' } } };
    for (const invalid of [{ ...authData, tokenType: 'access' }, { ...authData, modules: ['workflow'] },
        { ...authData, tenant: 'tenantB' }, { ...authData, runtimeScope: undefined }]) {
        await assert.rejects(target.status({ ...request, authData: invalid }), /scoped runtime/);
    }
    runtimeRole = 'STAGED';
    await assert.rejects(target.status(request), /Online runtime/);
    assert.equal(reads, 0);
    assert.equal(authorityRequests, 0);
    runtimeRole = 'ONLINE';
    assert.equal(await target.status(request), null);
    assert.equal(reads, 1);
    assert.equal(authorityRequests, 1);
    assert.equal(request.authData.userGroups, undefined);
    assert.equal(request.editorialPublicationTarget, undefined);
});
