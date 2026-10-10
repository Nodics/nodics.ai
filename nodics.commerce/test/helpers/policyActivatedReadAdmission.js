/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
'use strict';
/** @module commerce/test/helpers/policyActivatedReadAdmission @description Tests Online retained reads with real permission, identity and schema access owners, using isolated persistence ports rather than installed qualification. @layer test @owner nodics.commerce */
const assert = require('node:assert/strict');
const { test } = require('node:test');
const path = require('node:path');
const root = path.resolve(__dirname, '../../..');
const foundation = file => require(path.join(root, 'nodics.foundation/modules', file));

module.exports = function register({ domain, setup, request }) {
    const title = domain[0].toUpperCase() + domain.slice(1);
    const directory = path.join(root, 'nodics.commerce/modules/baseCommerce/modules', domain);

    async function fixture(t) {
        const previous = Object.fromEntries(['CONFIG', 'SERVICE', 'CLASSES', 'NODICS', 'UTILS'].map(key => [key, global[key]]));
        t.after(() => Object.assign(global, previous));
        const f = setup(), publication = await f.publication();
        await f.source.activate(publication, request);
        const settings = { runtimeRole: 'ONLINE', sourceVersioningQualified: false,
            delivery: { enabled: true, storeCodes: ['reviewed-store'], rootCodes: [publication.rootCode] } };
        let domainPermission = 'commerce.product.publish';
        global.CONFIG = { get: name => name === 'identityGovernance' ? { systemAccessGroups: ['serviceAccountUserGroup'] } :
            name === 'publish' ? { setup: { permissions: { [domain]: domainPermission } } } :
            name === domain ? { publication: settings } : {} };
        global.CLASSES = { NodicsError: class extends Error { constructor(code) { super(code); this.code = code; } } };
        UTILS.isBlank = value => !value || !Object.keys(value).length;
        const access = foundation('nDatabase/database/src/service/schema/defaultSchemaAccessHandlerService');
        SERVICE.DefaultSecuredRequestPipelineService = foundation('nRouter/src/service/request/defaultSecuredRequestPipelineService');
        const identity = foundation('nAuth/src/service/identity/defaultIdentityGovernanceService');
        const state = { reads: [], writes: [], authorities: 0 };
        SERVICE.DefaultIdentityGovernanceService = { ...identity, getSystemAuthData: function () {
            state.authorities++;
            return identity.getSystemAuthData.call(this);
        } };
        SERVICE['Default' + title + 'PublicationService'] = f.target;
        f.target.publicationSettings = () => settings;
        const groups = require(path.join(directory, 'config/properties')).schemaPolicies[domain].operational.accessGroups;
        for (const service of Object.values(f.targetStore)) {
            for (const method of ['get', 'save', 'update']) {
                const original = service[method].bind(service);
                service[method] = async input => {
                    assert(access.getAccessPoint(input.authData, groups) >= 1, 'generated schema access denied');
                    state[method === 'get' ? 'reads' : 'writes'].push(input);
                    return original(input);
                };
            }
        }
        const context = { ...request, storeCode: 'reviewed-store', authData: { tenant: request.tenant,
            entCode: request.enterpriseCode, tokenType: 'access', principalType: 'human', principalId: 'publisher',
            loginId: 'original-publisher', userGroups: ['setupPublisher'],
            permissions: ['publish.lifecycle.create', 'commerce.product.publish', 'commerce.promotion.manage'] } };
        return { ...f, publication, settings, state, context, access, groups,
            permission: value => { domainPermission = value; } };
    }

    test(domain + ' Online publisher reads actual retained activation without Staged source qualification or writes', async t => {
        const f = await fixture(t), before = structuredClone(f.context);
        assert.equal(f.access.getAccessPoint(f.context.authData, f.groups), 0);
        const expected = structuredClone([...f.targetStore.release.rows.values()][0].payload.records);
        assert.deepEqual(await f.target.readActivated(f.publication, f.context), expected);
        assert.equal(f.state.reads.length, 3);
        assert(f.state.reads.every(input => input.authData.isSystem === true &&
            input.query.tenant === request.tenant && input.query.enterpriseCode === request.enterpriseCode &&
            input.options.skipItemCache === true && input.searchOptions.limit === 2));
        assert.deepEqual(f.context, before);
        assert.equal(f.state.writes.length, 0);
        await assert.rejects(f.target.capture(f.context, f.input), /immutable source is not qualified/);
        await assert.rejects(f.target.retain(f.targetStore.release, { ...request, code: 'never-write' }, f.context), /immutable source is not qualified/);
        assert.equal(f.state.writes.length, 0);
    });

    test(domain + ' Online read permission is independent of Staged lifecycle creation and remains exact-domain', async t => {
        const f = await fixture(t);
        f.permission('reviewed.domain.publish');
        f.context.authData.permissions = ['commerce.product.publish', 'reviewed.domain.publish'];
        assert((await f.target.readActivated(f.publication, f.context)).length);
        const count = f.state.authorities;
        for (const permissions of [[], ['publish.lifecycle.create'], ['commerce.product.publish'], ['reviewed.domain.publish']]) {
            f.context.authData.permissions = permissions;
            await assert.rejects(f.target.readActivated(f.publication, f.context), /generated schema access denied/);
            assert.equal(f.state.authorities, count);
        }
        for (const selected of [undefined, '']) {
            f.permission(selected);
            f.context.authData.permissions = ['commerce.product.publish', 'publish.lifecycle.create'];
            await assert.rejects(f.target.readActivated(f.publication, f.context), /generated schema access denied/);
            assert.equal(f.state.authorities, count);
        }
        assert.equal(f.state.writes.length, 0);
    });

    test(domain + ' ordinary Online consumers retain schema authorization and group-free services gain no authority', async t => {
        const f = await fixture(t);
        for (const authData of [
            { tenant: request.tenant, entCode: request.enterpriseCode, principalType: 'human', tokenType: 'access',
                loginId: 'operator', userGroups: ['commerceOperatorUserGroup'], permissions: [] },
            { tenant: request.tenant, entCode: 'default', principalType: 'service', tokenType: 'service',
                serviceId: 'original-deployment', userGroups: ['serviceAccountUserGroup'], permissions: [] },
        ]) {
            const context = { ...f.context, authData };
            const before = structuredClone(context);
            assert((await f.target.readActivated(f.publication, context)).length);
            assert.deepEqual(context, before);
            assert.equal(f.state.authorities, 0);
            assert.deepEqual(f.state.reads.at(-1).authData, authData);
        }
        for (const principalType of ['service', 'customer']) {
            const authData = { ...f.context.authData, principalType,
                tokenType: principalType === 'service' ? 'service' : 'access', userGroups: [] };
            await assert.rejects(f.target.readActivated(f.publication, { ...f.context, authData }), /generated schema access denied/);
            assert.equal(f.state.authorities, 0);
        }
        // No arbitrary generated service or live operational row receives retained-read authority.
        const foreignService = { get: async input => {
            assert.equal(input.authData, f.context.authData);
            assert.equal(input.authData.isSystem, undefined);
            return { result: [] };
        } };
        await f.target.readRecord(foreignService, 'not-retained', f.context);
        assert.equal(f.state.authorities, 0);
        assert.equal(f.state.writes.length, 0);
    });

    test(domain + ' Online human scope conflicts refuse before generated reads or canonical authority', async t => {
        const f = await fixture(t);
        for (const mutate of [r => { r.tenant = 'foreign'; }, r => { r.tenantCode = 'foreign'; },
            r => { r.enterpriseCode = 'foreign'; }, r => { r.entCode = 'foreign'; },
            r => { r.authData.enterpriseCode = 'foreign'; }, r => { r.authData.tenantCode = 'foreign'; },
            r => { r.authData.tokenType = 'service'; }, r => { r.authData.isSystem = true; },
            r => { delete r.authData.entCode; }, r => { delete r.authData.principalId; delete r.authData.loginId; }]) {
            const context = structuredClone(f.context); mutate(context);
            await assert.rejects(f.target.readActivated(f.publication, context), /activated reader scope/);
        }
        assert.equal(f.state.reads.length, 0);
        assert.equal(f.state.authorities, 0);
        assert.equal(f.state.writes.length, 0);
    });

    test(domain + ' Online reader preserves exact pointer, receipt, root and immutable release proof', async t => {
        const f = await fixture(t);
        const pointer = [...f.targetStore.pointer.rows.values()][0];
        const receipt = [...f.targetStore.receipt.rows.values()][0];
        const release = [...f.targetStore.release.rows.values()][0];
        for (const [row, changes] of [[pointer, { version: 'missing' }], [pointer, { receiptCode: 'missing' }],
            [pointer, { tenant: 'foreign' }], [receipt, { targetVersion: 'foreign' }],
            [receipt, { expectedRevision: receipt.expectedRevision + 1 }], [receipt, { fingerprint: 'foreign' }],
            [release, { payload: { ...release.payload, enterpriseCode: 'foreign' } }]]) {
            const original = structuredClone(row);
            Object.assign(row, changes);
            await assert.rejects(f.target.readActivated(f.publication, f.context), /activated policy|receipt mismatch|fingerprint mismatch|Retained policy/);
            Object.assign(row, original);
        }
        await assert.rejects(f.target.readActivated({ ...f.publication, rootCode: 'foreign' }, f.context), /No activated policy/);
        assert.equal(f.state.writes.length, 0);
    });

    test(domain + ' activated read pins human identity across generated awaits', async t => {
        const f = await fixture(t), get = f.targetStore.pointer.get;
        f.targetStore.pointer.get = async input => {
            f.context.enterpriseCode = 'foreign';
            f.context.authData.entCode = 'foreign';
            f.publication.rootCode = 'foreign';
            return get(input);
        };
        assert((await f.target.readActivated(f.publication, f.context)).length);
        assert(f.state.reads.every(input => input.query.enterpriseCode === request.enterpriseCode));
        assert.equal(f.state.writes.length, 0);
    });

    if (domain === 'promotion') test('Promotion actual human budget context selects actual activated retained policy without source qualification', async t => {
        const f = await fixture(t);
        const admission = require(path.join(directory, 'src/service/defaultPromotionBudgetAdmissionService'));
        SERVICE.DefaultExactAmountService = require(path.join(root, 'nodics.commerce/modules/baseCommerce/modules/pricing/src/service/defaultExactAmountService'));
        const policy = [...f.targetStore.release.rows.values()][0].payload.records[0].policy;
        const context = admission.context({ ...f.context, promotionCode: policy.code });
        const selected = await admission.policy(context, { rootCode: f.publication.rootCode,
            policyFingerprint: f.target.fingerprint(policy) });
        assert.deepEqual(selected, policy);
        assert.equal(selected.budget.spent, undefined);
        assert.equal(context.actorId, 'original-publisher');
        assert.equal(f.state.writes.length, 0);
        await assert.rejects(admission.policy(context, { rootCode: 'foreign', policyFingerprint: f.target.fingerprint(policy) }), /ERR_PROMOTION_BUDGET_ADMISSION_UNCONFIRMED/);
    });
};
