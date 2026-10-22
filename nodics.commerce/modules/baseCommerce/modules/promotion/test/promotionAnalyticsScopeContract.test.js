/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
'use strict';
/** @module promotion/test/promotionAnalyticsScopeContract @description Tests actual business groups, route admission and scoped generated analytics reads over isolated cursors, without native persistence. @layer test @owner promotion */
const test = require('node:test'), assert = require('node:assert/strict');
const operation = require('../src/service/defaultPromotionOperationService');
const controller = require('../src/controller/defaultPromotionController');
const facade = require('../src/facade/defaultPromotionFacade');
const routers = require('../src/router/routers').promotion.backoffice;
const generatedReads = require('./helpers/generatedCouponReadFixture');
const security = require('../../../../../../nodics.foundation/modules/nRouter/src/service/request/defaultSecuredRequestPipelineService');
const utils = require('../../../../../../nodics.foundation/modules/nCommon/src/utils/utils');
const groups = Object.values(require('../data/init-v001/records/identity/promotionBusinessAccessGroupData'));
const catalogue = Object.fromEntries([...groups,
    ...Object.values(require('../../../../../../nodics.platform/modules/axis/data/init-v001/records/identity/axisUserGroupData')),
    ...Object.values(require('../../../../../../nodics.platform/modules/profile/data/init-v001/records/identity/profileUserGroupData')),
].map(group => [group.code, group]));
const statuses = Object.assign({}, require('../src/utils/statusDefinitions'),
    require('../../../../../../nodics.foundation/modules/nDatabase/database/src/utils/statusDefinitions'),
    require('../../../../../../nodics.foundation/modules/nCommon/src/utils/statusDefinitions'),
    require('../../../../../../nodics.foundation/modules/nAuth/src/utils/statusDefinitions'));
const unconfirmed = { code: 'ERR_PROMOTION_ANALYTICS_UNCONFIRMED' };

/** Hydrates only persisted fixture ancestry, never configuration-derived grants. */
function hydrate(code) {
    const group = catalogue[code];
    assert(group, 'Persisted group exists: ' + code);
    return { ...group, parentGroups: (group.parentGroups || []).map(hydrate) };
}
/** Native authenticated request: nRouter entCode is not an enterpriseCode copy. */
function nativeRequest(group = groups[0]) {
    const userGroups = [hydrate(group.code)];
    return { tenant: 'runtime', entCode: 'issuer', auth: { entCode: 'issuer', type: 'bearer' },
        authData: { tenant: 'runtime', entCode: 'issuer', tokenType: 'access', principalType: 'human',
            loginId: 'employee', userGroups, permissions: utils.getUserGroupPermissions(userGroups) },
        httpRequest: { headers: { 'x-enterprise-code': 'issuer', 'x-tenant-code': 'runtime' },
            params: { promotionCode: 'campaign' }, query: {} } };
}
/** Installs genuine generated reads and public projection over in-memory cursors. */
function fixture(t) {
    const keys = ['CONFIG', 'SERVICE', 'CLASSES', 'FACADE'];
    const previous = Object.fromEntries(keys.map(key => [key, Object.getOwnPropertyDescriptor(global, key)]));
    t.after(() => {
        for (const key of keys) {
            if (previous[key]) Object.defineProperty(global, key, previous[key]); else delete global[key];
        }
    });
    global.CONFIG = { get: key => ({ defaultPageSize: 20, routeActionAuthorization: { enabled: true, strict: true },
        defaultErrorCodes: { NodicsError: 'ERR_SYS_00000' } }[key]) };
    global.CLASSES = { NodicsError: require('../../../../../../nodics.foundation/modules/nCommon/src/lib/nodicsError') };
    global.SERVICE = {
        DefaultStatusService: { get: code => { assert(statuses[code], 'Registered status: ' + code); return statuses[code]; } },
        DefaultPromotionOperationService: operation,
        DefaultSecuredRequestPipelineService: security,
        DefaultExactAmountService: require('../../pricing/src/service/defaultExactAmountService'),
        DefaultPromotionBudgetMutationService: require('../src/service/defaultPromotionBudgetMutationService'),
        DefaultCouponSecureIssuanceService: require('../src/service/defaultCouponSecureIssuanceService'),
    };
    global.FACADE = { DefaultPromotionFacade: facade };
    const own = { tenant: 'runtime', enterpriseCode: 'issuer', promotionCode: 'campaign' };
    const records = {
        promotion: [{ ...own, code: 'campaign', status: 'DRAFT', revision: 1, actions: {}, conditions: {} }],
        promotionRedemption: [{ ...own, code: 'redemption', status: 'APPLIED' }],
        promotionBudgetLedger: [{ ...own, code: 'ledger', mutationType: 'COMMIT', amount: '10',
            budgetMutation: { private: 'SECRET' } }],
        coupon: [{ ...own, code: 'coupon', status: 'RESERVED', protectedToken: { private: 'SECRET' } }],
    };
    for (const rows of Object.values(records)) {
        rows.push({ ...rows[0], code: 'foreign-enterprise', enterpriseCode: 'other' },
            { ...rows[0], code: 'foreign-tenant', tenant: 'other' },
            { ...rows[0], code: 'foreign-campaign', promotionCode: 'other' });
    }
    const state = generatedReads(t, name => records[name], Object.keys(records));
    global.UTILS = { ...utils, ...require('../../../../../../nodics.foundation/modules/nRouter/src/utils/utils'), ...UTILS };
    return { state, records };
}
/** Executes the actual post-authentication router guard, not a permission double. */
function admit(request, route) {
    return new Promise((resolve, reject) => security.checkAccess({ ...request, moduleName: 'promotion', router: route }, {},
        { nextSuccess: resolve, error: (_request, _response, error) => reject(error) }));
}

for (const group of groups) test(group.code + ' reads own analytics through real router/controller/generated guards', async t => {
    const f = fixture(t), input = nativeRequest(group), original = structuredClone(input);
    await admit(input, routers.analytics);
    const result = await controller.analytics(input);
    assert.deepEqual(result.data, { promotionCode: 'campaign', redemptionCount: 1, appliedCount: 1, reversedCount: 0,
        couponIssuedCount: 1, couponReservedCount: 1, couponRedeemedCount: 0,
        budgetCommitted: '10', budgetReleased: '0', budgetExposure: '10' });
    assert.equal(f.state.reads.length, 3);
    for (const read of f.state.reads) {
        assert.deepEqual(read.query, { tenant: 'runtime', enterpriseCode: 'issuer', promotionCode: 'campaign' });
        assert.equal(read.options.limit, 1000);
        assert.equal(read.options.skip, 0);
    }
    assert.deepEqual(input, original);
    assert(!input.authData.permissions.some(permission => permission.startsWith('system.schema.')));
    await assert.rejects(SERVICE.DefaultPromotionRedemptionService.get({ tenant: 'runtime', authData: input.authData,
        query: { tenant: 'runtime', enterpriseCode: 'issuer', promotionCode: 'campaign' } }));
    await assert.rejects(SERVICE.DefaultPromotionService.get({ tenant: 'runtime', authData: input.authData,
        query: { tenant: 'runtime', enterpriseCode: 'issuer' } }));
    await admit(input, routers.budgetLedger);
    const ledger = await controller.budgetLedger(input);
    assert.equal(ledger.data.completeness.enterpriseCode, 'issuer');
    assert.equal(ledger.data.completeness.complete, true);
    assert.equal(ledger.data.entries.length, 1);
    assert.equal(ledger.data.entries[0].budgetMutation, undefined);
});

test('independent signed aliases and explicitly empty own-enterprise results remain usable', async t => {
    const f = fixture(t), input = nativeRequest();
    input.authData.enterpriseCode = input.authData.entCode;
    input.authData.tenantCode = input.authData.tenant;
    delete input.authData.entCode;
    delete input.authData.tenant;
    Object.values(f.records).forEach(rows => rows.splice(0, 1));
    const result = await controller.analytics(input);
    assert.equal(result.data.redemptionCount, 0);
    assert.equal(result.data.couponIssuedCount, 0);
    assert.equal(result.data.budgetExposure, '0');
    assert.equal(f.state.reads.length, 3);
});

test('missing, malformed and conflicting signed/presented scopes fail before any read', async t => {
    const f = fixture(t);
    const cases = [
        r => { delete r.authData; }, r => { delete r.authData.tenant; },
        r => { delete r.authData.entCode; }, r => { delete r.authData.loginId; r.actorId = 'forged'; },
        r => { delete r.authData.tokenType; }, r => { delete r.authData.principalType; },
        r => { r.authData.tokenType = 'refresh'; }, r => { r.authData.principalType = 'customer'; },
        r => { r.authData.isSystem = true; }, r => { r.transactionContext = {}; },
        r => { r.internalPersistence = true; }, r => { r.httpRequest.params.promotionCode = ''; },
    ];
    for (const holder of ['authData', 'root', 'auth', 'body', 'query']) {
        for (const key of ['tenant', 'tenantCode', 'entCode', 'enterpriseCode']) {
            for (const value of ['other', null, '', ['issuer'], { $ne: 'issuer' }]) cases.push(r => {
                const target = holder === 'root' ? r : ['body', 'query'].includes(holder)
                    ? (r.httpRequest[holder] ||= {}) : r[holder];
                target[key] = value;
            });
        }
    }
    for (const key of ['X-Enterprise-Code', 'entCode', 'enterpriseCode', 'X-Tenant-Code', 'tenant', 'tenantCode'])
        cases.push(r => { r.httpRequest.headers[key] = 'other'; });
    cases.push(r => { r.httpRequest.query.promotionCode = 'other'; });
    cases.push(r => { r.httpRequest.body = { promotionCode: 'other' }; });
    for (const mutate of cases) {
        const input = nativeRequest(); mutate(input);
        await assert.rejects(controller.analytics(input), unconfirmed);
    }
    assert.equal(f.state.findCalls, 0);
});

test('direct human operations cannot bypass exact scope, employee membership or read authority', async t => {
    const f = fixture(t);
    for (const mutate of [r => { delete r.authData.entCode; }, r => { r.query = { enterpriseCode: 'other' }; },
        r => { r.authData.userGroups = []; }, r => { r.authData.permissions = []; r.authData.userGroups = ['employeeUserGroup']; }]) {
        const input = { ...nativeRequest(), promotionCode: 'campaign' }; mutate(input);
        await assert.rejects(operation.analytics(input), unconfirmed);
    }
    assert.equal(f.state.findCalls, 0);
});

for (const schema of ['promotionRedemption', 'promotionBudgetLedger', 'coupon']) {
    for (const key of ['tenant', 'enterpriseCode', 'promotionCode']) {
        for (const value of ['other', undefined]) test(`${schema} rejects provider ${key}=${value}`, async t => {
            const f = fixture(t);
            f.state.afterGet = response => {
                if (f.state.reads.at(-1).schema === schema) response.result[0][key] = value;
            };
            await assert.rejects(controller.analytics(nativeRequest()), unconfirmed);
        });
    }
}

for (const mutate of [response => { delete response.code; }, response => { response.code = 'ERR_READ'; },
    response => { response.error = { message: 'failed' }; }, response => { response.success = false; },
    response => { response.errors = ['failed']; }, response => { response.result = null; }]) {
    test('failed or malformed provider envelope is not successful empty analytics: ' + mutate.toString(), async t => {
        const f = fixture(t); f.state.afterGet = mutate;
        await assert.rejects(controller.analytics(nativeRequest()), unconfirmed);
        assert.equal(f.state.reads.length, 1);
    });
}

test('captured scope survives caller and earlier provider mutation across awaits', async t => {
    const f = fixture(t), input = nativeRequest();
    f.state.afterGet = () => {
        input.authData.entCode = 'other'; input.entCode = 'other';
        f.state.current.query.enterpriseCode = 'other';
        f.state.current.authData.entCode = 'other';
    };
    const result = await controller.analytics(input);
    assert.equal(result.data.redemptionCount, 1);
    assert(f.state.reads.every(read => read.query.enterpriseCode === 'issuer'));
});

test('internal service preserves existing generated authority and cannot enter the human API', async t => {
    const f = fixture(t), input = { tenant: 'runtime', promotionCode: 'campaign',
        authData: { tenant: 'runtime', entCode: 'issuer', principalType: 'service', tokenType: 'service',
            principalId: 'existing-service', userGroups: ['serviceAccountUserGroup'], permissions: [] } };
    const original = structuredClone(input);
    const result = await operation.analytics(input);
    assert.equal(result.couponIssuedCount, 1);
    assert.deepEqual(f.state.current.authData, input.authData);
    assert.deepEqual(input, original);
    await assert.rejects(admit(input, routers.analytics), { code: 'ERR_AUTH_00003' });
    await assert.rejects(controller.analytics(input), unconfirmed);
    const reads = f.state.findCalls;
    for (const mutate of [r => { r.authData.userGroups = ['employeeUserGroup']; },
        r => { delete r.authData.entCode; }, r => { r.enterpriseCode = 'other'; },
        r => { r.authData.runtimeScope = true; r.authData.modules = ['other']; },
        r => { r.authData.runtimeScope = true; r.authData.modules = ['promotion']; },
        r => { r.authData.tokenType = 'access'; }]) {
        const request = structuredClone(input); mutate(request);
        await assert.rejects(operation.analytics(request));
    }
    assert.equal(f.state.findCalls, reads);
    const bounded = structuredClone(input);
    Object.assign(bounded.authData, { runtimeScope: true, modules: ['promotion'], permissions: ['commerce.promotion.read'] });
    assert.equal((await operation.analytics(bounded)).redemptionCount, 1);
    assert.deepEqual(f.state.current.authData, bounded.authData);
});

test('unavailable generated analytics owner refuses instead of reporting zero', async t => {
    const f = fixture(t);
    delete SERVICE.DefaultPromotionRedemptionService;
    await assert.rejects(controller.analytics(nativeRequest()), unconfirmed);
    assert.equal(f.state.findCalls, 0);
});

test('actual business groups retain draft-only editing without legacy manage, approval or schema grants', async t => {
    fixture(t);
    for (const group of groups) {
        const input = nativeRequest(group), draft = group.permissions.includes('commerce.promotion.draft.write');
        assert(!group.permissions.includes('commerce.promotion.manage'));
        for (const route of [routers.analytics, routers.budgetLedger]) await admit(input, route);
        for (const route of [routers.saveDraft, routers.updateDraft]) {
            if (draft) await admit(input, route);
            else await assert.rejects(admit(input, route), { code: 'ERR_AUTH_00003' });
        }
        for (const route of [routers.submit, routers.schedule, routers.suspend,
            routers.archive, routers.createCouponBatch, routers.reserveCouponBatch, routers.releaseCouponBatch]) {
            assert(route, 'Owner manage route exists');
            await assert.rejects(admit(input, route), { code: 'ERR_AUTH_00003' });
        }
        await assert.rejects(admit(input, routers.approve), { code: 'ERR_AUTH_00003' });
        const seller = Object.values(routers).filter(route => route.permission === 'commerce.coupon.seller.manage');
        assert.equal(seller.length, 3);
        for (const route of seller) {
            if (group.permissions.includes('commerce.coupon.seller.manage')) await admit(input, route);
            else await assert.rejects(admit(input, route), { code: 'ERR_AUTH_00003' });
        }
    }
});
