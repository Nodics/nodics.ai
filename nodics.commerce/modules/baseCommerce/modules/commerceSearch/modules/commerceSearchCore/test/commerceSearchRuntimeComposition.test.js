/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/**
 * @module commerceSearchCore/test/runtimeComposition
 * @description Composes Product pagination, Search, Agreement resolution, nSearch processors and
 * the Elastic adapter; only candidate retrieval, persisted agreement and provider transports are fixtures.
 * @layer test
 * @owner commerceSearchCore
 * @override Later policy overrides retain deterministic complete scans and original caller admission.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const ranking = require('../src/service/defaultCommerceSearchRankingService');
const policy = require('../src/service/defaultCommerceSearchPolicyService');
const benefit = require('../src/service/defaultCommerceSearchBenefitService');
const builder = require('../src/service/defaultCommerceSearchProjectionBuilderService');
const properties = require('../config/properties');
const indexes = require('../src/search/indexes');
const commerce = '../../../../';
const discovery = require(commerce + 'product/src/service/defaultProductDiscoveryService');
const catalogue = require(commerce + 'product/src/service/defaultProductCatalogueQueryService');
const productProperties = require(commerce + 'product/config/properties');
const agreement = require(commerce + 'commercialAgreement/src/service/defaultCommercialAgreementOperationService');
const admission = require(commerce + 'promotion/src/service/defaultPromotionDistributionAdmissionService');
const foundation = '../../../../../../../../nodics.foundation/modules/nSearch/';
const common = require(foundation + 'search/src/service/common');
const processor = require(foundation + 'search/src/service/procs/doSearch/defaultDoSearchModelsInitializerService');
const elastic = require(foundation + 'elastic/src/schemas/elasticSearchModel').default;
const generic = require('../../../../../../../../nodics.discovery/modules/discoveryRanking/src/service/defaultDiscoveryRankingEngineService');

/** Runs a real nSearch processor stage through its normal completion/error interface. */
function step(owner, name, request, response) {
    return new Promise((resolve, reject) => owner[name](request, response, {
        nextSuccess: resolve, error: (_request, _response, error) => reject(error)
    }));
}

test('indexed agreement ranking reaches Product before pagination and preserves failure/sort boundaries', async () => {
    const config = { commerceSearch: structuredClone(properties.commerceSearch), product: structuredClone(productProperties.product),
        commercialAgreement: structuredClone(require(commerce + 'commercialAgreement/config/properties').commercialAgreement),
        promotion: { couponIssuerMembership: { maximumProducts: 1 } } };
    // Exercise later-layer bounds without copying a second default authority.
    config.commerceSearch.ranking.rulePageSize = 2;
    config.product.discovery.rankingFailureBehavior = 'error';
    global.CONFIG = { get: key => config[key] };
    global.CLASSES = { NodicsError: class extends Error { constructor(code) { super(code); this.code = code; } } };
    const request = { tenant: 't', storeCode: 'shop', locale: 'en', now: '2026-10-26T12:00:00Z',
        authData: { tenant: 't', principalType: 'customer', tokenType: 'access', loginId: 'buyer' },
        query: { page: 1, pageSize: 2 } };
    const products = Array.from({ length: 88 }, (_, index) => ({ productCode: 'coupon-' + String(index).padStart(3, '0'),
        name: String(index).padStart(3, '0'), localizedAttributes: { digitalDeliveryType: 'COUPON_CODE' } }));
    const target = products[81].productCode;
    const coverage = { code: 'visibility', source: 'PACKAGE_INCLUDED', targetType: 'SELECTED_PRODUCTS',
        productCodes: [target], storeCode: 'shop', validFrom: '2026-10-25T00:00:00Z', validTo: '2026-11-08T19:59:59.999Z' };
    const persisted = { code: 'agreement', tenant: 't', enterpriseCode: 'issuer', versions: [{ version: 1,
        terms: { effectiveFrom: coverage.validFrom, effectiveTo: coverage.validTo, benefits: [coverage] } }] };
    let failure, reads = [], memberships = [];
    global.SERVICE = { DefaultCommerceSearchPolicyService: policy, DefaultCommerceSearchBenefitService: benefit,
        DefaultCommerceSearchRankingService: ranking, DefaultDiscoveryRankingEngineService: generic,
        DefaultCommercialAgreementOperationService: Object.assign(Object.create(agreement), {
            load: async (tenant, code, enterprise) => {
                assert.deepEqual([tenant, code, enterprise], ['t', 'agreement', 'issuer']);
                return structuredClone(persisted);
            }
        }),
        DefaultPromotionPublicationService: { deliveryEnabled: () => true },
        DefaultCouponSellerAuthorizationService: { policy: () => ({}) },
        DefaultPromotionOperationService: { couponIssuerMemberships: async (original, codes) => {
            assert.equal(original.authData, request.authData);
            assert.equal(admission.publicRequest({ ...original, productCode: codes[0] }).authData.principalType, 'customer');
            memberships.push(codes);
            if (failure) throw failure;
            return codes.map(productCode => ({ productCode, issuerEnterpriseCode: 'issuer' }));
        } }
    };
    const rules = ['first', 'second', 'third'].map(code => builder.build(request, { code, tenant: 't', storeCode: 'shop',
        locale: 'en', scopeType: 'GLOBAL', actions: [], revision: 1, validFrom: coverage.validFrom, validTo: coverage.validTo,
        benefitRef: { agreementCode: 'agreement', enterpriseCode: 'issuer', benefitCode: 'visibility' } }));
    const logger = { debug() {} };
    const adapter = { indexDef: { ...indexes.commerceSearchCore.commerceSearchRuleProjection, indexName: 'isolated_rules' },
        LOG: logger, searchEngine: { getOptions: () => ({}), getConnection: () => ({ search: async parameters => {
            reads.push(structuredClone(parameters));
            // This assertion fails on the original loadRules: its searchOptions.sort is discarded.
            assert.deepEqual(parameters.sort, [{ sourceHash: 'asc' }]);
            assert.equal(adapter.indexDef.properties.sourceHash.type, 'keyword');
            assert.equal(parameters.index, 'isolated_rules');
            assert.equal(parameters.size, 2);
            assert.equal(JSON.stringify(parameters.body.query).includes('$'), false);
            const sorted = rules.slice().sort((a, b) => a.sourceHash.localeCompare(b.sourceHash));
            return { body: { hits: { hits: sorted.slice(parameters.from || 0, (parameters.from || 0) + parameters.size)
                .map(_source => ({ _source })) } } };
        } }) } };
    elastic.defineDefaultDoSearch(adapter);
    const owner = Object.assign(Object.create(processor), { LOG: logger });
    SERVICE.DefaultPipelineService = { start: async (name, input, output) => {
        assert.equal(name, 'doSearchModelInitializerPipeline');
        for (const stage of ['validateRequest', 'buildOptions', 'executeQuery']) await step(owner, stage, input, output);
        return output.success;
    } };
    SERVICE.DefaultCommerceSearchRuleProjectionService = Object.assign(Object.create(common), { getSearchModel: () => adapter });
    const product = Object.assign(Object.create(discovery), { discoveryMetadata: () => ({ source: 'SEARCH_INDEX' }) });
    SERVICE.DefaultProductDiscoveryService = product;
    // Retained public candidate shape: 88 cards with the selected coupon initially at index 81.
    const query = Object.assign(Object.create(catalogue), { candidates: async () => products.slice() });
    const result = await query.list(request);
    assert.equal(result.products[0], products[81]);
    assert.equal(result.total, 88);
    assert.deepEqual(reads.map(input => input.from || 0), [0, 2]);
    assert.deepEqual(memberships, [[target]]);
    assert.equal(JSON.stringify(result).includes('benefitRef'), false);
    assert.equal(JSON.stringify(result).includes('sourceHash'), false);
    const calls = reads.length;
    const explicit = await query.list({ ...request, query: { ...request.query, sort: 'name-asc' } });
    assert.equal(explicit.products[0], products[0]);
    assert.equal(reads.length, calls);
    failure = new Error('controlled membership refusal');
    config.product.discovery.rankingFailureBehavior = 'omit';
    assert.equal((await query.list(request)).products[0], products[0]);
    config.product.discovery.rankingFailureBehavior = 'error';
    await assert.rejects(query.list(request), error => error === failure);
    // A service principal is deliberately refused by the existing public owner boundary.
    assert.throws(() => admission.publicRequest({ ...request, productCode: target,
        authData: { ...request.authData, principalType: 'service' } }), { code: 'ERR_PROMOTION_SELLER_UNCONFIRMED' });
});
