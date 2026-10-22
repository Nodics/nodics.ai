/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/** @module commercialAgreement/test/contract @description Unit verification through generated concurrency with synthetic persistence only. @layer test @owner commercialAgreement */
const test = require('node:test');
const assert = require('node:assert/strict');
const operation = require('../src/service/defaultCommercialAgreementOperationService');
const properties = require('../config/properties');
const schema = require('../src/schemas/schemas').commercialAgreement.commercialAgreement;
const concurrency = require('../../../../../../nodics.foundation/modules/nDatabase/database/src/service/schema/defaultModelConcurrencyService');
const controller = require('../src/controller/defaultCommercialAgreementController');
const facade = require('../src/facade/defaultCommercialAgreementFacade');
const Enum = require('../../../../../../nodics.foundation/modules/nConfig/bin/enum');
const enumDefinitions = require('../src/utils/enums');

function terms(model = 'FIXED_PRICE', paymentTerms = 'PREPAID') {
    return { model, paymentTerms, packageRef: { module: 'product', schema: 'product', code: 'package', versionId: 1 },
        priceRef: { module: 'pricing', schema: 'priceRow', code: 'price', versionId: 1 },
        services: 'Coupon visibility in the agreed Store', allowances: 'Descriptive allowance: all eligible coupons during the agreed period',
        effectiveFrom: '2026-10-01T00:00:00Z', effectiveTo: '2027-01-01T00:00:00Z', serviceStart: '2026-10-01T00:00:00Z',
        paymentSchedule: 'As agreed in contract document 1', ...(model === 'SUBSCRIPTION' ? { billingPeriod: 'Monthly' } : {}),
        renewal: { mode: 'NONE' }, terminationTerms: 'By mutual written agreement', financialTreatment: 'No automatic proration; agreed treatment in document 1',
        evidenceRef: 'document-1', financialReferences: [], benefits: [{ code: 'visibility', source: 'PACKAGE_INCLUDED',
            targetType: 'ALL_ENTERPRISE_COUPONS', productCodes: [], storeCode: 'shop', validFrom: '2026-10-01T00:00:00Z',
            validTo: '2026-12-01T00:00:00Z', evidenceRef: 'document-1' }] };
}
function request(overrides = {}) {
    return { tenant: 'tenant-a', authData: { tenant: 'tenant-a', enterpriseCode: 'merchant', principalType: 'human', tokenType: 'access',
        loginId: 'employee', userGroups: ['employeeUserGroup'], permissions: ['commerce.agreement.read', 'commerce.agreement.manage'] },
        payload: { code: 'agreement', enterpriseCode: 'merchant', expectedRevision: 0, commandId: 'create', terms: terms(), ...overrides } };
}
let rows, policy, writes, fault, model;
test.beforeEach(() => {
    rows = new Map(); writes = 0; fault = undefined; policy = structuredClone(properties.commercialAgreement);
    global.CLASSES = { NodicsError: class extends Error { constructor(code) { super(code); this.code = code; } } };
    global.CONFIG = { get: key => key === 'commercialAgreement' ? policy : undefined };
    global.ENUMS = Object.fromEntries(Object.entries(enumDefinitions).map(([name, value]) =>
        [name, new Enum(structuredClone(value.definition))]));
    const value = (row, key) => key.split('.').reduce((part, segment) => part?.[segment], row);
    const matches = (row, query) => Object.entries(query || {}).every(([key, expected]) => value(row, key) === expected);
    model = { primaryKey: 'code', rawSchema: schema,
        getItems: async r => ({ result: [...rows.values()].filter(row => matches(row, r.query)).map(row => structuredClone(row)) }),
        compareAndSetItem: async input => {
            writes++;
            if (fault === 'before') throw new Error('synthetic persistence failure');
            if (input.operation === 'create') {
                if (rows.has(input.model.code)) throw new Error('duplicate identity');
                rows.set(input.model.code, structuredClone(input.model));
                if (fault === 'after') throw new Error('synthetic lost acknowledgement');
                return structuredClone(input.model);
            }
            const row = rows.get(input.query.code);
            if (!row || !matches(row, input.query)) return null;
            Object.assign(row, structuredClone(input.model));
            if (fault === 'after') throw new Error('synthetic lost acknowledgement');
            return structuredClone(row);
        } };
    global.NODICS = { getModels: (name, tenant) => {
        assert.equal(name, 'commercialAgreement'); assert.equal(tenant, 'tenant-a'); return { CommercialAgreementModel: model };
    } };
    global.SERVICE = {
        DefaultCommercialAgreementOperationService: operation,
        DefaultModelConcurrencyService: concurrency,
        DefaultDatabaseConfigurationService: { getSchemaInterceptors: () => ({
            preSave: [{ active: true, handler: 'DefaultCommercialAgreementOperationService.protect' }],
            preUpdate: [{ active: true, handler: 'DefaultCommercialAgreementOperationService.protect' }],
            preRemove: [{ active: true, handler: 'DefaultCommercialAgreementOperationService.protectRemove' }]
        }) },
        DefaultDatabaseModelHandlerService: { inspectIndexes: async () => ({ versioned: false, indexes: [{ unique: true, key: { code: 1 } }] }) },
        DefaultSecuredRequestPipelineService: { getEffectiveUserGroupCodes: groups => groups,
            getGrantedPermissions: r => r.authData.permissions,
            isPermissionGranted: (permission, granted) => granted.includes(permission) },
        DefaultIdentityGovernanceService: { getSystemAuthData: () => ({ principalType: 'service' }) },
        DefaultCommercialAgreementService: {
            get: r => model.getItems(r),
            save: async r => { operation.protect(r); const command = { ...r, schemaModel: model }; concurrency.initializeSave(command);
                return { result: await concurrency.execute(command, 'save') }; },
            update: async r => { operation.protect(r); return { result: await concurrency.execute({ ...r, schemaModel: model }, 'update') }; }
        },
        DefaultEnterpriseService: { get: async r => ({ result: [{ code: r.query.code, active: false }] }) },
        DefaultProductService: { get: async () => ({ result: [{ code: 'package', versionId: 1, active: true }] }) },
        DefaultPriceRowService: { get: async () => ({ result: [{ code: 'price', productCode: 'package', versionId: 1, unitAmount: '125.00', currency: 'AED' }] }) }
    };
    global.FACADE = { DefaultCommercialAgreementFacade: facade };
});

test('shared package supports both independent model/payment combinations without charging or changing Profile status', async () => {
    for (const model of ['FIXED_PRICE', 'SUBSCRIPTION']) for (const payment of ['PREPAID', 'INVOICE']) {
        const r = request({ code: model + payment, terms: terms(model, payment) });
        const response = await controller.record({ authData: r.authData, httpRequest: { body: r.payload } });
        assert.equal(response.data.revision, 1);
        assert.equal(rows.get(r.payload.code).versions[0].agreedPrice.unitAmount, '125.00');
    }
    assert.equal(rows.size, 4);
    assert.equal(writes, 4);
});

test('effective layered enum keys drive workspace choices and agreement validation together', async () => {
    ENUMS.commercialAgreementPaymentTerms = new Enum(['PREPAID', 'PARTNER_INVOICE']);
    const workspace = operation.workspace({ ...request(), payload: { enterpriseCode: 'merchant' } });
    assert.deepEqual(workspace.options.paymentTerms, ['PREPAID', 'PARTNER_INVOICE']);
    workspace.options.paymentTerms.push('BROWSER_ONLY');
    assert.deepEqual(operation.vocabulary('commercialAgreementPaymentTerms'), ['PREPAID', 'PARTNER_INVOICE']);
    await operation.record(request({ terms: terms('FIXED_PRICE', 'PARTNER_INVOICE') }));
    assert.equal(rows.get('agreement').versions[0].terms.paymentTerms, 'PARTNER_INVOICE');
    await assert.rejects(operation.record(request({ code: 'raw-source', terms: terms('FIXED_PRICE', 'INVOICE') })),
        { code: 'ERR_AGREEMENT_INPUT' });
    await assert.rejects(operation.record(request({ code: 'browser', terms: terms('FIXED_PRICE', 'BROWSER_ONLY') })),
        { code: 'ERR_AGREEMENT_INPUT' });
});

test('absent or malformed effective enums refuse instead of restoring raw definitions', async () => {
    delete ENUMS.commercialAgreementModels;
    assert.throws(() => operation.workspace({ ...request(), payload: { enterpriseCode: 'merchant' } }),
        { code: 'ERR_AGREEMENT_CONFIG' });
    await assert.rejects(operation.record(request()), { code: 'ERR_AGREEMENT_CONFIG' });
    ENUMS.commercialAgreementModels = { enums: [{ key: 'FIXED_PRICE' }, { key: 'FIXED_PRICE' }] };
    assert.throws(() => operation.vocabulary('commercialAgreementModels'), { code: 'ERR_AGREEMENT_CONFIG' });
    assert.equal(writes, 0);
});

test('future amendments retain terms and price history while effective benefit resolution changes at the boundary', async () => {
    await operation.record(request());
    const original = structuredClone(rows.get('agreement').versions[0]);
    const next = terms('SUBSCRIPTION', 'INVOICE');
    next.effectiveFrom = next.serviceStart = '2026-11-01T00:00:00Z';
    next.benefits = [];
    await operation.record(request({ expectedRevision: 1, commandId: 'amend', terms: next }));
    assert.deepEqual(rows.get('agreement').versions[0], original);
    const reference = { agreementCode: 'agreement', enterpriseCode: 'merchant', benefitCode: 'visibility' };
    assert.equal((await operation.resolveBenefit({ tenant: 'tenant-a', now: '2026-10-31T23:59:59Z' }, reference)).version, 1);
    assert.equal(await operation.resolveBenefit({ tenant: 'tenant-a', now: '2026-11-01T00:00:00Z' }, reference), undefined);
    assert.equal((await operation.read({ ...request(), payload: { code: 'agreement', enterpriseCode: 'merchant' } })).versions.length, 2);
});

test('lost acknowledgement replays the same committed command after service reload without duplicate writes', async () => {
    fault = 'after';
    await assert.rejects(operation.record(request()), /lost acknowledgement/);
    fault = undefined;
    const reloaded = { ...operation };
    const replay = await reloaded.record(request());
    assert.equal(replay.replayed, true); assert.equal(writes, 1);
    const changed = request(); changed.payload.terms.services = 'Different service';
    await assert.rejects(reloaded.record(changed), { code: 'ERR_AGREEMENT_CONFLICT' });
});

test('concurrent amendments cannot discard history and stale commands are rejected', async () => {
    await operation.record(request());
    const next = terms(); next.effectiveFrom = next.serviceStart = next.benefits[0].validFrom = '2026-11-01T00:00:00Z';
    const results = await Promise.allSettled(['amend-1', 'amend-2'].map(commandId => operation.record(request({ commandId, expectedRevision: 1, terms: next }))));
    assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
    assert.equal(rows.get('agreement').versions.length, 2);
    await assert.rejects(operation.record(request({ expectedRevision: 0, commandId: 'stale' })), { code: 'ERR_AGREEMENT_CONFLICT' });
});

test('generic CRUD cannot replace, forge or remove agreement history', () => {
    assert.throws(() => operation.protect({ model: { versions: [] }, authData: { isSystem: true } }), { code: 'ERR_AGREEMENT_SCOPE' });
    assert.throws(() => operation.protectRemove(), { code: 'ERR_AGREEMENT_SCOPE' });
    assert.equal(schema.router.enabled, false);
});

test('tenant, Enterprise, employee and permission mismatches fail before persistence', async () => {
    for (const mutate of [r => { r.tenant = 'foreign'; }, r => { r.payload.enterpriseCode = 'foreign'; },
        r => { r.authData.principalType = 'customer'; }, r => { r.authData.permissions = []; }]) {
        const r = request(); mutate(r); await assert.rejects(operation.record(r), { code: 'ERR_AGREEMENT_SCOPE' });
    }
    assert.equal(writes, 0);
});

test('missing references, unqualified CAS and malformed configuration fail closed', async () => {
    SERVICE.DefaultPriceRowService.get = async () => ({ result: [] });
    await assert.rejects(operation.record(request()), { code: 'ERR_AGREEMENT_REFERENCE' });
    delete model.compareAndSetItem;
    await assert.rejects(operation.record(request()), { code: 'ERR_AGREEMENT_STORAGE' });
    policy.maximumBenefits = 0;
    assert.throws(() => operation.policy(), { code: 'ERR_AGREEMENT_CONFIG' });
    assert.equal(writes, 0);
});

test('explicit renewal, selected coverage, independent duration and add-on evidence are required', () => {
    for (const mutate of [t => { t.renewal = { mode: 'AUTOMATIC' }; }, t => { t.benefits[0].validTo = t.benefits[0].validFrom; },
        t => { t.benefits[0].targetType = 'SELECTED_COUPONS'; }, t => { t.benefits[0].source = 'ADD_ON'; },
        t => { t.benefits.push(t.benefits[0]); }, t => { t.unknownPaidFlag = true; }]) {
        const t = terms(); mutate(t); assert.throws(() => operation.terms(t), { code: 'ERR_AGREEMENT_INPUT' });
    }
    const selected = terms();
    selected.benefits[0] = { ...selected.benefits[0], targetType: 'SELECTED_COUPONS', productCodes: ['coupon'], source: 'ADD_ON', additionalBenefitTerms: 'An additional agreed campaign' };
    assert.equal(operation.terms(selected).benefits[0].productCodes[0], 'coupon');
});

test('framework bounds can be intentionally overridden and failures before writes leave no agreement', async () => {
    policy.maximumBenefits = 1;
    assert.equal(operation.terms(terms()).benefits.length, 1);
    const tooMany = terms(); tooMany.benefits.push({ ...tooMany.benefits[0], code: 'other' });
    assert.throws(() => operation.terms(tooMany), { code: 'ERR_AGREEMENT_INPUT' });
    fault = 'before'; await assert.rejects(operation.record(request()), /persistence failure/);
    assert.equal(rows.size, 0);
});

test('agreement search is scoped and bounded, while foreign benefit publication requires existing admin authority', async () => {
    await operation.record(request());
    const page = await operation.search({ ...request(), payload: { enterpriseCode: 'merchant', pageNumber: 1, pageSize: 5 } });
    assert.equal(page.agreements[0].code, 'agreement'); assert.equal(page.hasMore, false);
    await assert.rejects(operation.search({ ...request(), payload: { enterpriseCode: 'foreign', pageNumber: 1, pageSize: 5 } }), { code: 'ERR_AGREEMENT_SCOPE' });
    await assert.rejects(operation.authorizeBenefitPublication(request(), { agreementCode: 'agreement', enterpriseCode: 'foreign', benefitCode: 'visibility' }), { code: 'ERR_AGREEMENT_SCOPE' });
});

test('persisted agreement amendments drive Search targeting without copying prices, history or Product eligibility', async () => {
    await operation.record(request());
    const searchBase = '../../commerceSearch/modules/commerceSearchCore/';
    const ranking = require(searchBase + 'src/service/defaultCommerceSearchRankingService');
    const searchProperties = require(searchBase + 'config/properties');
    const promotionProperties = require('../../promotion/config/properties');
    const originalGet = CONFIG.get;
    CONFIG.get = key => key === 'commerceSearch' ? searchProperties.commerceSearch :
        key === 'promotion' ? promotionProperties.promotion : originalGet(key);
    Object.assign(SERVICE, {
        DefaultCommerceSearchPolicyService: require(searchBase + 'src/service/defaultCommerceSearchPolicyService'),
        DefaultCommerceSearchBenefitService: require(searchBase + 'src/service/defaultCommerceSearchBenefitService'),
        DefaultCommerceSearchRuleProjectionService: { get: async () => ({ result: [{ code: 'visibility-rule', tenant: 'tenant-a', storeCode: 'shop',
            status: 'CURRENT', scopeType: 'GLOBAL', actions: [], benefitRef: { agreementCode: 'agreement', enterpriseCode: 'merchant', benefitCode: 'visibility' } }] }) },
        DefaultPromotionOperationService: { couponIssuerMemberships: async (r, codes) => codes.map(productCode =>
            ({ productCode, issuerEnterpriseCode: productCode === 'ours' ? 'merchant' : 'foreign' })) }
    });
    const products = ['theirs', 'ours'].map(productCode => ({ productCode, localizedAttributes: { digitalDeliveryType: 'COUPON_CODE' } }));
    const context = { tenant: 'tenant-a', storeCode: 'shop', now: '2026-10-18T00:00:00Z' };
    assert.deepEqual((await ranking.rank(context, products)).map(p => p.productCode), ['ours', 'theirs']);
    assert.equal(Object.hasOwn(products[0], 'agreedPrice'), false);
    const amendment = terms(); amendment.effectiveFrom = amendment.serviceStart = '2026-10-19T00:00:00Z'; amendment.benefits = [];
    await operation.record(request({ commandId: 'stop-coverage', expectedRevision: 1, terms: amendment }));
    assert.deepEqual(await ranking.rank({ ...context, now: '2026-10-19T00:00:00Z' }, products), products);
    assert.equal(rows.get('agreement').versions.length, 2);
});

test('permission header loads without runtime globals and preserves configured authority tenancy', () => {
    const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
    const source = fs.readFileSync(path.join(__dirname, '../data/init-v001/headers/identity/commercialAgreementPermissionHeader.js'), 'utf8');
    for (const [configuration, tenant] of [[undefined, undefined], [{ get: () => undefined }, undefined],
        [{ get: () => null }, null], [{ get: () => '' }, ''],
        [{ get: key => { assert.equal(key, 'defaultTenant'); return 'authority-fixture'; } }, 'authority-fixture']]) {
        const context = { module: { exports: {} }, ...(configuration ? { CONFIG: configuration } : {}) };
        vm.runInNewContext(source, context);
        const header = context.module.exports.profile.commercialAgreementPermission;
        assert.equal(Object.hasOwn(header.options, 'tenants'), Boolean(configuration));
        if (configuration) {
            assert.equal(header.options.tenants.length, 1);
            assert.equal(header.options.tenants[0], tenant);
        }
        assert.equal(header.options.schemaName, 'permission');
        assert.equal(header.options.operation, 'ensureReferenceAll');
        assert.equal(header.options.dataFilePrefix, 'commercialAgreementPermissionData');
        assert.equal(header.query.code, '$code');
    }
});

test('declared permission data has exact checksums, defines no grants, and malformed installed index/hook evidence rejects writes', async () => {
    const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
    const manifest = require('../data/manifest.json');
    for (const [file, hash] of Object.entries(manifest.sections.permissionCatalogue.files)) {
        assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(__dirname, '../data', file))).digest('hex'), hash);
    }
    const permissions = require('../data/init-v001/records/identity/commercialAgreementPermissionData');
    assert.deepEqual(Object.values(permissions).map(row => row.code).sort(), ['commerce.agreement.manage', 'commerce.agreement.read']);
    assert(Object.values(permissions).every(row => !row.userGroups && !row.grants));
    SERVICE.DefaultDatabaseModelHandlerService.inspectIndexes = async () => ({ versioned: false, indexes: [] });
    await assert.rejects(operation.record(request()), { code: 'ERR_AGREEMENT_STORAGE' });
    SERVICE.DefaultDatabaseConfigurationService.getSchemaInterceptors = () => ({});
    await assert.rejects(operation.record(request()), { code: 'ERR_AGREEMENT_STORAGE' });
    assert.equal(writes, 0);
});

test('concrete module wires secured commands, retained-history guards and implemented Axis metadata without runtime activation', async () => {
    const descriptor = require('../package.json');
    assert.equal(descriptor.name, 'commercialAgreement');
    assert.equal(descriptor.index, '76.15');
    assert.equal(descriptor.nodics.kind, 'capability');
    assert.equal(descriptor.nodics.runtimeModule, true);
    assert.equal(descriptor.nodics.runtime.router, true);
    assert.equal(await require('../nodics').init(), true);
    const routes = require('../src/router/routers').commercialAgreement.management;
    assert.deepEqual(Object.keys(routes).sort(), ['read', 'record', 'search', 'workspace']);
    for (const [command, route] of Object.entries(routes)) {
        assert.equal(route.key, '/agreements/' + command);
        assert.equal(route.secured, true);
        assert.equal(route.method, 'POST');
        assert.deepEqual(route.authTokenTypes, ['access']);
        assert.deepEqual(route.accessGroups, ['employeeUserGroup']);
        assert.equal(route.permissionConfig, 'commercialAgreement.' + (command === 'record' ? 'writePermission' : 'readPermission'));
        assert.equal(typeof controller[route.operation], 'function');
        assert.equal(typeof facade[route.operation], 'function');
    }
    const hooks = Object.values(require('../src/interceptors/interceptors'));
    assert.deepEqual(hooks.map(hook => hook.trigger).sort(), ['preRemove', 'preSave', 'preUpdate']);
    assert(hooks.every(hook => hook.item === 'commercialAgreement' && hook.active === 'true'));
    const provider = require('../src/service/defaultCommercialAgreementBackofficeCapabilityService');
    let registered;
    SERVICE.DefaultModuleRegistrationAgentService = { registerBackofficeCapabilityProvider: (name, value) => { registered = { name, value }; } };
    SERVICE.DefaultBackofficeCapabilityDefinitionService = { capability: value => value, nativeWorkspace: value => value };
    await provider.init();
    assert.deepEqual(registered, { name: 'commercialAgreement', value: provider });
    const workspace = provider.getCapability().navigation[0];
    assert.equal(workspace.featureState, 'ACTIVE');
    assert(workspace.lifecycleActions.every(action => action.featureState === 'ACTIVE'));
    assert.equal(rows.size, 0);
});

test('workspace projects read-only versus manage admission, exact target and effective bounds without grants or business defaults', async () => {
    const r = { ...request(), payload: { enterpriseCode: 'merchant' } };
    const result = await controller.workspace(r);
    assert.deepEqual(result.data.availableCommands, ['search', 'read', 'record']);
    assert.equal(result.data.enterpriseCode, 'merchant');
    assert.equal(result.data.limits.pageSize, 25);
    assert.equal(result.data.mutation.automaticRetry, false);
    assert.equal(result.data.terms, undefined);
    r.authData.permissions = ['commerce.agreement.read'];
    assert.deepEqual(operation.workspace(r).availableCommands, ['search', 'read']);
    assert.throws(() => operation.workspace({ ...r, payload: { enterpriseCode: 'foreign' } }), { code: 'ERR_AGREEMENT_SCOPE' });
    policy.workspace.pageSize = 101;
    assert.throws(() => operation.workspace(r), { code: 'ERR_AGREEMENT_CONFIG' });
    assert.equal(writes, 0);
});

test('governed workspace copy has exact manifest hashes, localized definitions and no authority assignments', () => {
    const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
    const manifest = require('../data/manifest.json');
    for (const section of Object.values(manifest.sections)) {
        const files = section.kind === 'CONTENT_PACK' ? section.generatedHashes : section.files;
        for (const [file, hash] of Object.entries(files))
            assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(__dirname, '../data', file))).digest('hex'), hash);
    }
    const release = manifest.sections.agreementWorkspace;
    assert.equal(release.selectionPolicy, 'EXPLICIT');
    assert.equal(release.initialPublicationPolicy, 'ADMIN_INITIATED');
    const component = require('../data/core-v001/records/workspace/commercialAgreementCmsComponentData').record0;
    const type = require('../data/core-v001/records/workspace/commercialAgreementCmsTypeData').record0;
    assert.equal(component.code, 'commercialAgreementWorkspaceCopy');
    assert.deepEqual(Object.keys(component.properties).sort(), Object.keys(type.propertySchema).sort());
    assert(Object.values(type.propertySchema).every(value => value.type === 'string' && value.localized === true));
    assert.equal(component.permissions, undefined);
    assert.equal(component.activationMode, undefined);
});

test('all agreement operations reject incomplete policy while deliberate owner overrides remain effective', async () => {
    policy.workspace.pageSize = 7;
    policy.maximumPageSize = 9;
    policy.validation.maximumTextLength = 200;
    const workspaceRequest = { ...request(), payload: { enterpriseCode: 'merchant' } };
    assert.equal(operation.workspace(workspaceRequest).limits.pageSize, 7);
    assert.equal(operation.workspace(workspaceRequest).limits.maximumTextLength, 200);
    policy.workspace.pageSize = 10;
    await assert.rejects(operation.record(request()), /CONFIG/);
    policy.workspace.pageSize = 7;
    delete policy.writePermission;
    await assert.rejects(operation.record(request()), /CONFIG/);
    policy.writePermission = 'commerce.agreement.manage';
    policy.validation.maximumTextLength = policy.validation.maximumConfiguredBound + 1;
    await assert.rejects(operation.record(request()), /CONFIG/);
    assert.equal(writes, 0);
});

test('admin agreement commands still require consistent signed tenant and Enterprise identities', async () => {
    for (const mutate of [
        r => { delete r.authData.enterpriseCode; r.authData.userGroups.push('adminGroup'); },
        r => { r.authData.tenantCode = 'foreign'; },
        r => { r.authData.entCode = 'foreign'; }
    ]) {
        const r = request(); mutate(r);
        await assert.rejects(operation.record(r), { code: 'ERR_AGREEMENT_SCOPE' });
    }
    assert.equal(writes, 0);
    const admin = request({ enterpriseCode: 'other-enterprise' });
    admin.authData.userGroups.push('adminGroup');
    assert.equal((await operation.record(admin)).revision, 1);
});

test('Search benefit projection excludes descriptive agreement and add-on evidence', async () => {
    const r = request();
    Object.assign(r.payload.terms.benefits[0], {
        source: 'ADD_ON', additionalBenefitTerms: 'Private negotiated commercial terms', evidenceRef: 'private-contract'
    });
    await operation.record(r);
    const benefit = await operation.resolveBenefit({ tenant: 'tenant-a', now: '2026-10-20T00:00:00Z' },
        { agreementCode: 'agreement', enterpriseCode: 'merchant', benefitCode: 'visibility' });
    assert.deepEqual(Object.keys(benefit).sort(), ['agreementCode', 'benefitCode', 'code', 'enterpriseCode',
        'productCodes', 'source', 'storeCode', 'targetType', 'validFrom', 'validTo', 'version']);
    assert.equal(rows.get('agreement').versions[0].terms.benefits[0].evidenceRef, 'private-contract');
});

test('negative owner reference envelopes cannot mint an agreed price despite a plausible result', async () => {
    for (const failure of [{ code: 'ERR_REFERENCE' }, { acknowledged: false }, { errors: ['unavailable'] }, { errors: 'invalid' }]) {
        SERVICE.DefaultPriceRowService.get = async () => ({ ...failure, result: [
            { code: 'price', productCode: 'package', versionId: 1, unitAmount: '125.00', currency: 'AED' }
        ] });
        await assert.rejects(operation.record(request()), { code: 'ERR_AGREEMENT_STORAGE' });
    }
    assert.equal(writes, 0);
});
