/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/** @module commerceSearchCore/test/benefit @description Unit tests for timing, complete-set ranking and canonical commercial targeting with synthetic owner ports. @layer test @owner commerceSearchCore */
const test = require('node:test');
const assert = require('node:assert/strict');
const properties = require('../config/properties');
const promotionProperties = require('../../../../promotion/config/properties');
const ranking = require('../src/service/defaultCommerceSearchRankingService');
const builder = require('../src/service/defaultCommerceSearchProjectionBuilderService');
const publication = require('../src/service/defaultCommerceSearchPublicationService');
const benefitService = require('../src/service/defaultCommerceSearchBenefitService');
const policyService = require('../src/service/defaultCommerceSearchPolicyService');
const engine = require('../../../../../../../../nodics.discovery/modules/discoveryRanking/src/service/defaultDiscoveryRankingEngineService');
const request = { tenant: 't', storeCode: 'shop', locale: 'en', now: '2026-10-18T12:00:00Z', query: { sort: 'recommended' }, authData: { tenant: 't' } };
function rule(extra = {}) { return { code: 'rule', tenant: 't', storeCode: 'shop', scopeType: 'GLOBAL', status: 'CURRENT', revision: 1,
    actions: [], priority: 0, ...extra }; }
function product(code) { return { productCode: code, localizedAttributes: { digitalDeliveryType: 'COUPON_CODE' }, availability: { available: true } }; }
let policy, promotionPolicy, rules, benefit, calls, snapshots;
test.beforeEach(() => {
    policy = structuredClone(properties.commerceSearch); rules = []; calls = []; snapshots = new Map();
    promotionPolicy = structuredClone(promotionProperties.promotion);
    benefit = { agreementCode: 'agreement', benefitCode: 'visibility', enterpriseCode: 'issuer', version: 1,
        storeCode: 'shop', source: 'PACKAGE_INCLUDED', targetType: 'ALL_ENTERPRISE_COUPONS', productCodes: [],
        validFrom: '2026-10-01T00:00:00Z', validTo: '2026-11-01T00:00:00Z' };
    global.CONFIG = { get: key => key === 'commerceSearch' ? policy : key === 'promotion' ? promotionPolicy :
        key === 'discovery' ? { ranking: { boostScore: 9000, buryScore: -9000 } } : undefined };
    global.SERVICE = { DefaultCommerceSearchPolicyService: policyService, DefaultCommerceSearchBenefitService: benefitService,
        DefaultCommerceSearchProjectionBuilderService: builder,
        DefaultCommerceSearchRuleProjectionService: { get: async r => { calls.push(structuredClone(r));
            return { result: rules.slice(r.searchOptions.skip, r.searchOptions.skip + r.searchOptions.pageSize) }; } },
        DefaultCommercialAgreementOperationService: { resolveBenefit: async (r, ref) => {
            assert.equal(r.tenant, 't'); assert.equal(ref.agreementCode, 'agreement');
            return benefit && structuredClone(benefit);
        } },
        DefaultPromotionOperationService: { couponIssuerMemberships: async (r, codes) => {
            assert.equal(r.authData, request.authData);
            return codes.map(productCode => ({ productCode, issuerEnterpriseCode: productCode.startsWith('own') ? 'issuer' : 'foreign' }));
        } },
        DefaultCommerceSearchRuleVersionService: { get: async r => ({ result: snapshots.has(r.query.code) ? [snapshots.get(r.query.code)] : [] }),
            save: async r => { publication.protectHistory(r); if (snapshots.has(r.model.code)) throw new Error('duplicate'); snapshots.set(r.model.code, structuredClone(r.model)); } }
    };
    SERVICE.DefaultCommercialAgreementOperationService.authorizeBenefitPublication = (r, ref) =>
        SERVICE.DefaultCommercialAgreementOperationService.resolveBenefit(r, ref);
});

test('published windows survive hashing, snapshot persistence and repeatable failed indexing', async () => {
    const source = rule({ validFrom: '2026-10-01T00:00:00Z', validTo: '2026-11-01T00:00:00Z', status: 'APPROVED' });
    const projected = builder.build(request, source);
    assert.equal(projected.validFrom, '2026-10-01T00:00:00.000Z');
    assert.notEqual(projected.sourceHash, builder.build(request, { ...source, validTo: '2026-11-02T00:00:00Z' }).sourceHash);
    assert.equal(ranking.effective(projected, source.validFrom), true);
    assert.equal(ranking.effective(projected, source.validTo), false);
    SERVICE.DefaultCommerceSearchRuleService = { get: async () => ({ result: [source] }) };
    SERVICE.DefaultCommerceSearchRuleProjectionService.save = async () => {};
    SERVICE.DefaultCommerceSearchRuleProjectionService.doSave = async () => { throw new Error('synthetic index failure'); };
    global.CLASSES = { NodicsError: class extends Error { constructor(code) { super(code); this.code = code; } } };
    await assert.rejects(publication.publish(request, {}), /INDEX_WRITE/);
    assert.equal(snapshots.size, 1);
    let indexed;
    SERVICE.DefaultCommerceSearchRuleProjectionService.doSave = async r => { indexed = JSON.parse(JSON.stringify(r.model));
        return { result: [{ _id: indexed.code, result: 'created', _shards: { failed: 0 } }] }; };
    SERVICE.DefaultCommerceSearchRuleProjectionService.doSearch = async () => ({ result: { hits: {
        total: { value: 1, relation: 'eq' }, hits: [{ _id: indexed.code, _source: indexed }]
    } } });
    await publication.publish(request, {});
    assert.equal(snapshots.size, 1);
    assert.equal([...snapshots.values()][0].snapshot.validTo, projected.validTo);
    assert.throws(() => publication.protectHistory({ model: projected }), /publication owner/);
    assert.throws(() => publication.protectHistoryMutation(), /immutable/);
});

test('malformed windows, unsupported scopes and invalid action weights fail before publication', () => {
    for (const change of [{ validFrom: 'invalid' }, { validFrom: '2026-11-01', validTo: '2026-10-01' }, { scopeType: 'UNKNOWN' },
        { actions: [{ actionType: 'BOOST', productCode: 'p', weight: -1 }] }, { actions: [{ actionType: 'PIN', productCode: 'p', position: 0 }] }]) {
        assert.throws(() => builder.build(request, rule(change)));
    }
});

test('complete rule paging filters applicability before counting and never silently truncates excess', async () => {
    policy.ranking.rulePageSize = 2; policy.ranking.maximumRulesPerRequest = 1;
    rules = [0, 1, 2, 3].map(index => rule({ code: 'irrelevant-' + index, scopeType: 'CATEGORY', categoryCode: 'other' }));
    rules.push(rule({ actions: [{ actionType: 'BOOST', productCode: 'last' }] }));
    const ordered = await ranking.rank(request, [product('first'), product('last')]);
    assert.equal(ordered[0].productCode, 'last'); assert.equal(calls.length, 3);
    rules.push(rule({ code: 'excess' }));
    await assert.rejects(ranking.rank(request, [product('first'), product('last')]), /applicable rule limit/);
});

test('scan exhaustion and repeated provider pages reject incomplete ranking', async () => {
    policy.ranking.rulePageSize = 2; policy.ranking.maximumRuleScan = 2; policy.ranking.maximumRulesPerRequest = 2;
    rules = [rule({ code: 'a' }), rule({ code: 'b' })];
    await assert.rejects(ranking.loadRules(request), /complete rule scan/);
    policy.ranking.maximumRuleScan = 4;
    SERVICE.DefaultCommerceSearchRuleProjectionService.get = async () => ({ result: rules });
    await assert.rejects(ranking.loadRules(request), /paging is incomplete/);
});

test('configured weights, explicit zero and pin position behave identically with the generic engine', () => {
    policy.ranking.actionWeights.BOOST = 7; policy.ranking.actionWeights.BURY = -7;
    const products = ['a', 'b', 'c', 'd'].map(product);
    const selected = [rule({ actions: [{ actionType: 'BOOST', productCode: 'a', weight: 0 },
        { actionType: 'BOOST', productCode: 'b' }, { actionType: 'BOOST', productCode: 'c', weight: 8 },
        { actionType: 'PIN', productCode: 'd', position: 3 }] })];
    const local = ranking.ranked(products, selected).map(p => p.productCode);
    SERVICE.DefaultDiscoveryRankingEngineService = engine;
    assert.deepEqual(ranking.ranked(products, selected).map(p => p.productCode), local);
    assert.deepEqual(local, ['c', 'b', 'd', 'a']);
});

test('agreement coverage dynamically targets exact issuer coupons, including new eligible products, with no duplicate effects', async () => {
    const ref = { agreementCode: 'agreement', enterpriseCode: 'issuer', benefitCode: 'visibility' };
    rules = [rule({ benefitRef: ref }), rule({ code: 'duplicate-rule', benefitRef: ref })];
    const products = ['foreign', 'own-old', 'own-new'].map(product);
    const result = await ranking.rank(request, products);
    assert.deepEqual(result.map(p => p.productCode), ['own-old', 'own-new', 'foreign']);
    assert.equal(result.length, products.length);
    assert.equal(result[0], products[1]);
    assert.equal(Object.hasOwn(result[0], 'benefitRef'), false);
    const expanded = await benefitService.expand(request, products, rules);
    assert.equal(expanded.length, 1); assert.equal(expanded[0].actions.length, 2);
    benefit.targetType = 'SELECTED_COUPONS'; benefit.productCodes = ['own-new', 'foreign', 'sold-out-not-in-candidates'];
    assert.deepEqual((await ranking.rank(request, products)).map(p => p.productCode), ['own-new', 'foreign', 'own-old']);
    benefit = undefined;
    assert.deepEqual(await ranking.rank(request, products), products);
});

test('explicit customer sort bypasses boosts and ranking precedes caller pagination', async () => {
    rules = [rule({ actions: [{ actionType: 'BOOST', productCode: 'own-last' }] })];
    const products = ['first', 'second', 'own-last'].map(product);
    assert.equal((await ranking.rank(request, products)).slice(0, 1)[0].productCode, 'own-last');
    assert.deepEqual(await ranking.rank({ ...request, query: { sort: 'name-asc' } }, products), products);
});

test('publication rejects rule periods outside agreement coverage and independently selected boost actions', async () => {
    const staged = rule({ benefitRef: { agreementCode: 'agreement', enterpriseCode: 'issuer', benefitCode: 'visibility' },
        validFrom: '2026-10-01T00:00:00Z', validTo: '2026-11-01T00:00:00Z' });
    assert.equal((await benefitService.validatePublication(request, staged)).source, 'PACKAGE_INCLUDED');
    await assert.rejects(benefitService.validatePublication(request, { ...staged, validTo: '2026-11-02T00:00:00Z' }), /exceeds agreed/);
    await assert.rejects(benefitService.validatePublication(request, { ...staged, actions: [{ actionType: 'BOOST', productCode: 'own-one' }] }), /independently selected/);
});

test('membership rejects missing, duplicate and foreign selectors without inferring Enterprise authority', async () => {
    for (const rows of [[], [{ productCode: 'other', issuerEnterpriseCode: 'issuer' }], [{ productCode: 'own-one' }]]) {
        SERVICE.DefaultPromotionOperationService.couponIssuerMemberships = async () => rows;
        await assert.rejects(benefitService.memberships(request, [product('own-one')]), /membership/);
    }
    delete SERVICE.DefaultPromotionOperationService.couponIssuerMemberships;
    await assert.rejects(benefitService.memberships(request, [product('own-one')]), /complete coupon membership owner/);
});

test('agreement ranking batches 1001 coupon candidates using the effective Promotion bound', async () => {
    const products = Array.from({ length: 1001 }, (_, i) => product('own-' + i));
    rules = [rule({ benefitRef: { agreementCode: 'agreement', enterpriseCode: 'issuer', benefitCode: 'visibility' } })];
    for (const maximum of [promotionPolicy.couponIssuerMembership.maximumProducts, 37]) {
        promotionPolicy.couponIssuerMembership.maximumProducts = maximum;
        const batches = [];
        SERVICE.DefaultPromotionOperationService.couponIssuerMemberships = async (r, codes) => {
            assert.equal(r.authData, request.authData);
            assert.ok(codes.length > 0 && codes.length <= maximum);
            batches.push(codes.slice());
            return codes.map(productCode => ({ productCode, issuerEnterpriseCode: 'issuer' }));
        };
        const ranked = await ranking.rank(request, products);
        assert.deepEqual(batches.flat(), products.map(p => p.productCode));
        assert.equal(batches.length, Math.ceil(products.length / maximum));
        assert.deepEqual(ranked, products);
    }
});

test('membership refuses incomplete, cross-batch and failed later pages without returning partial coverage', async () => {
    promotionPolicy.couponIssuerMembership.maximumProducts = 2;
    const products = ['own-1', 'own-2', 'own-3'].map(product);
    for (const failure of ['missing', 'duplicate', 'foreign', 'failed']) {
        let batch = 0;
        SERVICE.DefaultPromotionOperationService.couponIssuerMemberships = async (r, codes) => {
            assert.equal(r, request);
            if (++batch === 1) return codes.map(productCode => ({ productCode, issuerEnterpriseCode: 'issuer' }));
            if (failure === 'failed') throw new Error('owner unavailable');
            if (failure === 'missing') return [];
            return [{ productCode: failure === 'duplicate' ? 'own-1' : 'foreign', issuerEnterpriseCode: 'issuer' }];
        };
        await assert.rejects(benefitService.memberships(request, products), /membership|owner unavailable/);
        assert.equal(batch, 2);
    }
});

test('membership refuses missing or malformed owner bounds before invoking Promotion', async () => {
    SERVICE.DefaultPromotionOperationService.couponIssuerMemberships = async () => assert.fail('Invalid bounds cannot dispatch');
    for (const maximum of [undefined, 0, -1, 0.5, NaN, '2']) {
        promotionPolicy.couponIssuerMembership.maximumProducts = maximum;
        await assert.rejects(benefitService.memberships(request, [product('own-1')]), /membership.*bound/);
    }
    assert.equal((await benefitService.memberships(request, [])).size, 0);
});

test('invalid effective defaults reject instead of falling back to another owner', () => {
    policy.ranking.actionWeights.BOOST = NaN;
    assert.throws(() => ranking.policy(), /configuration/);
});

test('configured omitted priority is shared by publication and ranking without replacing zero', () => {
    policy.ranking.defaultRulePriority = 9;
    const implicit = rule({ code: 'implicit', priority: undefined, actions: [{ actionType: 'PIN', productCode: 'a', position: 1 }] });
    const explicit = rule({ code: 'explicit', priority: 0, actions: [{ actionType: 'PIN', productCode: 'a', position: 2 }] });
    assert.equal(policyService.priority(implicit), 9);
    assert.equal(policyService.priority(explicit), 0);
    assert.equal(builder.build(request, implicit).priority, 9);
    assert.deepEqual(ranking.ranked(['b', 'a'].map(product), [explicit, implicit]).map(p => p.productCode), ['a', 'b']);
    delete policy.ranking.defaultRulePriority;
    assert.throws(() => policyService.policy(), /configuration/);
    policy.ranking.defaultRulePriority = 0.5;
    assert.throws(() => policyService.policy(), /configuration/);
});

test('canonical membership is mandatory even when legacy published-policy reads are available', async () => {
    delete SERVICE.DefaultPromotionOperationService.couponIssuerMemberships;
    SERVICE.DefaultPromotionOperationService.promotions = async () => { assert.fail('Legacy membership fallback must not run'); };
    SERVICE.DefaultPromotionPublicationService = { deliveryEnabled: () => true };
    const get = CONFIG.get;
    CONFIG.get = key => key === 'promotion' ? { publication: { delivery: { enabled: true } } } : get(key);
    await assert.rejects(benefitService.memberships(request, [product('own-one')]), /complete coupon membership owner/);
});

test('selected coverage resolves real Agreement history before requesting only the eligible membership union', async () => {
    const agreement = require('../../../../commercialAgreement/src/service/defaultCommercialAgreementOperationService');
    const agreementProperties = require('../../../../commercialAgreement/config/properties').commercialAgreement;
    const schema = require('../../../../commercialAgreement/src/schemas/schemas').commercialAgreement.commercialAgreement;
    const concurrency = require('../../../../../../../../nodics.foundation/modules/nDatabase/database/src/service/schema/defaultModelConcurrencyService');
    const get = CONFIG.get;
    CONFIG.get = key => key === 'commercialAgreement' ? agreementProperties : get(key);
    global.NODICS = { getModels: () => ({ CommercialAgreementModel: {
        primaryKey: 'code', rawSchema: schema, compareAndSetItem() { assert.fail('Read only'); }
    } }) };
    SERVICE.DefaultCommercialAgreementOperationService = agreement;
    SERVICE.DefaultModelConcurrencyService = concurrency;
    SERVICE.DefaultIdentityGovernanceService = { getSystemAuthData: () => ({ isSystem: true }) };
    SERVICE.DefaultDatabaseConfigurationService = { getSchemaInterceptors: () => Object.fromEntries(
        [['preSave', 'protect'], ['preUpdate', 'protect'], ['preRemove', 'protectRemove']]
            .map(([trigger, member]) => [trigger, [{ active: true, handler: 'DefaultCommercialAgreementOperationService.' + member }]])) };
    const events = [];
    const benefits = [
        { ...benefit, code: 'included', targetType: 'SELECTED_COUPONS', productCodes: ['own-a', 'absent'] },
        { ...benefit, code: 'addon', targetType: 'SELECTED_COUPONS', productCodes: ['own-a', 'own-b', 'foreign'] }
    ];
    SERVICE.DefaultCommercialAgreementService = {
        get: async r => {
            assert.equal(r.authData.isSystem, true);
            assert.deepEqual(r.query, { code: 'agreement', 'enterpriseRef.code': 'issuer' });
            events.push('agreement');
            return { result: [{ code: 'agreement', enterpriseRef: { code: 'issuer' }, revision: 1,
                versions: [{ version: 1, terms: { effectiveFrom: benefit.validFrom, effectiveTo: benefit.validTo, benefits } }] }] };
        },
        save() { assert.fail('Read only'); }, update() { assert.fail('Read only'); }
    };
    const customer = { ...request, authData: { tenant: 't', principalType: 'customer', tokenType: 'access', permissions: [] } };
    const ref = benefitCode => ({ agreementCode: 'agreement', enterpriseCode: 'issuer', benefitCode });
    rules = [rule({ code: 'included', benefitRef: ref('included') }), rule({ code: 'addon', benefitRef: ref('addon') })];
    const products = ['unrelated-legacy', 'foreign', 'own-a', 'own-b'].map(product);
    const membershipReads = [];
    SERVICE.DefaultPromotionOperationService.couponIssuerMemberships = async (r, codes) => {
        assert.equal(r.authData, customer.authData);
        assert.equal(events.filter(value => value === 'agreement').length, 2);
        events.push('membership'); membershipReads.push(codes);
        assert.ok(!codes.includes('unrelated-legacy'));
        return codes.map(productCode => ({ productCode, issuerEnterpriseCode: productCode === 'foreign' ? 'other' : 'issuer' }));
    };
    const ranked = await ranking.rank(customer, products);
    assert.deepEqual(membershipReads.flat(), ['foreign', 'own-a', 'own-b']);
    assert.deepEqual(ranked.map(p => p.productCode), ['own-a', 'own-b', 'unrelated-legacy', 'foreign']);
    SERVICE.DefaultPromotionOperationService.couponIssuerMemberships = async () => { throw new Error('selected owner refused'); };
    await assert.rejects(ranking.rank(customer, products), /selected owner refused/);
});

test('absent and foreign-Store benefits require no membership while mixed all coverage remains complete', async () => {
    const ref = { agreementCode: 'agreement', enterpriseCode: 'issuer', benefitCode: 'visibility' };
    rules = [rule({ benefitRef: ref })];
    const products = ['unrelated', 'own-one'].map(product);
    SERVICE.DefaultPromotionOperationService.couponIssuerMemberships = async () => assert.fail('No matching coverage');
    benefit.storeCode = 'other';
    assert.deepEqual(await ranking.rank(request, products), products);
    benefit = undefined;
    assert.deepEqual(await ranking.rank(request, products), products);
    SERVICE.DefaultCommercialAgreementOperationService.resolveBenefit = async (_request, reference) => ({
        ...reference, storeCode: 'shop', targetType: reference.benefitCode === 'all' ? 'ALL_ENTERPRISE_COUPONS' : 'SELECTED_COUPONS',
        productCodes: ['own-one']
    });
    rules.push(rule({ code: 'all', benefitRef: { ...ref, benefitCode: 'all' } }));
    SERVICE.DefaultPromotionOperationService.couponIssuerMemberships = async (_request, codes) => {
        assert.deepEqual(codes, ['unrelated', 'own-one']);
        throw new Error('all coverage owner refused');
    };
    await assert.rejects(ranking.rank(request, products), /all coverage owner refused/);
});
