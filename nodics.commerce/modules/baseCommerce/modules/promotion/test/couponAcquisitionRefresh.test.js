/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/** @module promotion/test/couponAcquisitionRefresh
 * @description Composes the real Cron trigger, owner receiver, Digital confirmed source and Promotion persistence over unit-only storage/transport doubles.
 * @owner promotion @layer test
 * @override Extend fixtures for new owner policy; no timer, import, scheduler activation or live storage. Globals restore per test; failures assert retained coverage.
 */
const test = require('node:test'), assert = require('node:assert/strict'), path = require('node:path');
const root = path.resolve(__dirname, '../../../../../..');
const fixture = require('./helpers/couponAcquisitionFixture');
const refresh = require('../src/service/defaultCouponAcquisitionRefreshService');
const controller = require('../src/controller/defaultCouponAcquisitionRefreshController');
const defaults = require('../config/properties');
const digitalRoot = path.join(root, 'nodics.commerce/modules/digitalCommerce/modules/digitalCore');
const digital = require(path.join(digitalRoot, 'src/service/defaultDigitalCommerceCouponAcquisitionService'));
const trigger = require(path.join(root, 'nodics.process/modules/cronjob/src/service/trigger/defaultCronJobTriggerHandlerService'));
const clone = structuredClone;

/** Real owner composition with retained generated-record guards and isolated transactional storage, restored by the shared fixture. */
function composed(t) {
    const f = fixture(t), p = f.settings.acquisitionReporting;
    p.enabled = p.refresh.enabled = true; p.pageSize = 1;
    const digitalPolicy = clone(require(path.join(digitalRoot, 'config/properties')).digitalCore);
    const get = CONFIG.get; CONFIG.get = key => key === 'digitalCore' ? digitalPolicy : get(key);
    const auth = { tenant: 't', entCode: 'runtime', principalType: 'service', tokenType: 'service', serviceId: 'cron',
        runtimeInstanceId: 'instance', modules: ['promotion', 'digitalCore'], permissions: ['commerce.promotion.analytics'],
        runtimeScope: { projectCode: 'project', environmentCode: 'unit', serverCode: 'cron', instanceCode: 'instance', assignmentCode: 'assignment' } };
    p.refresh.callers = [{ tenant: 't', principalEnterpriseCode: 'runtime', serviceId: 'cron', ...auth.runtimeScope }];
    const definition = clone(require('../data/init-v002/records/jobs/promotionAcquisitionRefreshJobData').record1);
    definition.tenant = 't'; definition.jobDetail.channelCode = 'channel';
    const db = { DefaultDigitalEntitlementService: [], DefaultCartService: [], DefaultCheckoutCheckpointService: [], DefaultDigitalDeliveryService: [] };
    for (const code of ['one', 'two']) {
        const common = { tenant: 't', enterpriseCode: 'issuer', ownerId: 'buyer', orderCode: 'order-' + code };
        db.DefaultDigitalEntitlementService.push({ ...common, code, cartCode: 'cart-' + code, digitalDeliveryType: 'COUPON_CODE',
            providerOwner: 'promotion', providerCode: 'coupon-' + code, purchasedAt: '2026-01-01T00:00:00.000Z',
            purchasePolicy: { version: 2, originalOwnerRef: { type: 'ENTERPRISE', code: 'buyer-enterprise' }, promotionCode: 'offer', issuerEnterpriseRef: { code: 'issuer' } } });
        db.DefaultCartService.push({ ...common, code: 'cart-' + code, channelCode: 'channel', status: 'PLACED', active: false });
        db.DefaultCheckoutCheckpointService.push({ ...common, code: 'checkpoint-' + code, status: 'COMPLETED',
            evidence: { orderCode: common.orderCode, digitalDeliveryCodes: ['coupon-' + code] } });
        db.DefaultDigitalDeliveryService.push({ ...common, code: 'delivery-' + code, entitlementCode: code,
            providerCode: 'coupon-' + code, status: 'DELIVERED', deliveryType: 'COUPON_CODE' });
    }
    const calls = [], reads = [];
    for (const name of Object.keys(db)) SERVICE[name] = { get: async r => {
        reads.push({ name, request: clone(r) });
        const rows = db[name].filter(row => Object.entries(r.query).every(([key, value]) => row[key] === value)).sort((a, b) => a.code.localeCompare(b.code));
        const start = (r.searchOptions.pageNumber - 1) * r.searchOptions.pageSize;
        return { code: 'SUC_READ', count: rows.length, result: clone(rows.slice(start, start + r.searchOptions.pageSize)) };
    } };
    Object.assign(SERVICE, {
        DefaultCouponAcquisitionRefreshService: refresh, DefaultDigitalCommerceCouponAcquisitionService: digital,
        DefaultServiceTokenService: require(path.join(root, 'nodics.foundation/modules/nAuth/src/service/identity/defaultServiceTokenService')),
        DefaultIdentityGovernanceService: { getSystemAuthData: async () => ({ isSystem: true }) },
        DefaultCronJobService: { assertOperational: async tenant => { assert.equal(tenant, 't'); return clone(auth); } },
        DefaultModuleService: { invokeModule: async call => {
            calls.push(clone(call));
            assert.deepEqual(call.header, { Authorization: 'Bearer original', tenant: 't' });
            assert.equal(call.apiName, '/internal/acquisition-report/refresh'); assert.equal(call.maxAttempts, 1);
            const response = await controller.refresh({ tenant: 't', authData: clone(auth), httpRequest: { body: clone(call.requestBody) } });
            if (f.lostAck) { f.lostAck = false; throw Error('lost acknowledgement'); }
            return response;
        } },
    });
    NODICS.getInternalAuthToken = () => 'original';
    const run = () => new Promise((resolve, reject) => trigger.triggerProcess.call({ ...trigger, LOG: { debug() {} } },
        { definition }, {}, { nextSuccess: (_r, response) => resolve(response.success), error: (_r, _s, error) => reject(error) }));
    const projection = () => [...f.tables.get('couponAcquisitionProjection').values()][0];
    const due = () => { projection().evidence.refreshedAt = '2026-01-02T00:00:00.000Z'; projection().evidence.coverageThrough = '2026-01-01T00:00:00.000Z'; };
    return Object.assign(f, { p, auth, definition, db, calls, reads, run, projection, due });
}

test('inactive job invokes actual Cron dispatcher, private route, real complete Digital source and guarded persisted projection', async t => {
    const f = composed(t);
    assert.equal(f.definition.active, false); assert.equal(f.definition.runOnInit, false);
    assert.equal(defaults.promotion.acquisitionReporting.refresh.enabled, false);
    const route = require('../src/router/routers').promotion.acquisitionRefresh.refresh;
    assert.equal(route.controller, 'DefaultCouponAcquisitionRefreshController'); assert.equal(route.operation, 'refresh');
    assert.deepEqual(route.authTokenTypes, ['service']); assert.equal(route.permission, 'commerce.promotion.analytics');
    const result = await f.run();
    assert.equal(result.status, 'COMPLETE'); assert.equal(f.projection().evidence.events.length, 2);
    assert.equal(result.dataUpdatedThrough, f.projection().evidence.coverageThrough);
    assert.ok(f.projection().evidence.events.every(event => event.ownerRef.type === 'ENTERPRISE'));
    assert.equal(JSON.stringify(result).includes('buyer-enterprise'), false);
    const before = clone(f.projection()), count = f.reads.length;
    assert.equal((await f.run()).status, 'NOT_DUE'); assert.deepEqual(f.projection(), before); assert.equal(f.reads.length, count);
});

test('failed source, truncated pages, invalid snapshot and failed commit retain last completed watermark; later invocation recovers', async t => {
    const f = composed(t); await f.run(); f.due();
    const before = clone(f.projection());
    f.p.maximumPages = 1; await assert.rejects(f.run()); assert.deepEqual(f.projection(), before); f.p.maximumPages = 100;
    const original = SERVICE.DefaultDigitalCommerceCouponAcquisitionService;
    for (const kind of ['FOREIGN', 'DRIFT', 'DUPLICATE', 'FAILED']) {
        SERVICE.DefaultDigitalCommerceCouponAcquisitionService = { ...digital, reportingEvents: async r => {
            if (kind === 'FAILED') throw Error('source unavailable');
            const result = await digital.reportingEvents(r);
            if (kind === 'FOREIGN') result.tenant = 'other';
            if (kind === 'DRIFT' && r.cursor) result.snapshotId = 'changed';
            if (kind === 'DUPLICATE' && r.cursor) {
                result.events[0].sourceId = 'purchase:one'; result.events[0].confirmedAt = '2026-01-01T00:01:00.000Z';
            }
            return result;
        } };
        await assert.rejects(f.run(), undefined, kind); assert.deepEqual(f.projection(), before);
    }
    SERVICE.DefaultDigitalCommerceCouponAcquisitionService = original;
    f.state.failNextWrite = 'couponAcquisitionProjection'; await assert.rejects(f.run()); assert.deepEqual(f.projection(), before);
    assert.equal((await f.run()).status, 'COMPLETE');
});

test('lost acknowledgement never advances a separate cursor or replays Commerce transfer; retry returns original committed coverage', async t => {
    const f = composed(t), source = clone(f.db); f.lostAck = true;
    await assert.rejects(f.run(), /acknowledgement/); const before = clone(f.projection());
    assert.equal((await f.run()).status, 'NOT_DUE'); assert.deepEqual(f.projection(), before); assert.deepEqual(f.db, source);
});

test('source scope is the selected channel and signed tenant, never body authority or human grants', async t => {
    const f = composed(t);
    for (const mutate of [r => { r.authData.principalType = 'human'; }, r => { r.tenant = 'foreign'; },
        r => { r.authData.permissions = []; }, r => { r.authData.permissions = 'commerce.promotion.analytics'; },
        r => { r.authData.runtimeScope.assignmentCode = 'foreign'; },
        r => { r.enterpriseCode = 'other'; }, r => { r.httpRequest.body.tenant = 'other'; },
        r => { r.httpRequest.body.channelCode = '*'; }, r => { r.authData.modules = ['promotion']; }]) {
        const r = { tenant: 't', authData: clone(f.auth), httpRequest: { body: { channelCode: 'channel' } } }; mutate(r);
        await assert.rejects(controller.refresh(r)); assert.equal(f.projection(), undefined);
    }
    f.db.DefaultCartService[1].channelCode = 'elsewhere'; await f.run();
    assert.equal(f.projection().evidence.events.length, 1);
});

test('disabled or invalid framework policy rejects; inherited defaults and explicit range overrides remain authoritative', async t => {
    const f = composed(t);
    for (const change of [p => { p.refresh.enabled = false; }, p => { p.enabled = false; }, p => { p.pageSize = 0; },
        p => { p.maximumPages = Number.MAX_SAFE_INTEGER; }, p => { delete p.refresh.validation.timeoutMs; },
        p => { p.refresh.target.timeoutMs = 300001; }, p => { p.refresh.target.maxAttempts = 2; },
        p => { p.refresh.target.apiName = '/injected'; }, p => { p.refreshIntervalSeconds = Infinity; },
        p => { p.refresh.callers = []; }]) {
        const original = clone(f.p); change(f.p); await assert.rejects(f.run()); Object.assign(f.p, original);
    }
    f.p.refresh.validation.timeoutMs.maximum = 400000; f.p.refresh.target.timeoutMs = 300001;
    assert.equal((await f.run()).status, 'COMPLETE');
    assert.equal(f.calls.at(-1).timeoutMs, 300001);
});

test('definition, principal, credential and policy drift refuse; mid-source policy changes cannot commit a watermark', async t => {
    const f = composed(t), invoke = SERVICE.DefaultModuleService.invokeModule;
    f.definition.jobDetail.channelCode = null; await assert.rejects(f.run()); f.definition.jobDetail.channelCode = 'channel';
    await assert.rejects(refresh.run({ definition: f.definition, authData: { ...f.auth, serviceId: 'other' } }));
    const read = SERVICE.DefaultDigitalEntitlementService.get;
    SERVICE.DefaultDigitalEntitlementService.get = async r => { const result = await read(r); f.p.maximumPages++; return result; };
    await assert.rejects(f.run()); assert.equal(f.projection(), undefined); SERVICE.DefaultDigitalEntitlementService.get = read;
    SERVICE.DefaultModuleService.invokeModule = async call => { const result = await invoke(call); NODICS.getInternalAuthToken = () => 'rotated'; return result; };
    await assert.rejects(f.run()); assert.ok(f.projection());
});

test('failed or overbroad transport envelopes never report successful coverage', async t => {
    const f = composed(t);
    for (const response of [{ code: 'ERR_DOWNSTREAM', data: {} }, { data: { contractVersion: 1, status: 'COMPLETE',
        channelCode: 'channel', dataUpdatedThrough: '2026-01-01T00:00:00.000Z', timezone: 'UTC', events: [] } }]) {
        SERVICE.DefaultModuleService.invokeModule = async () => response; await assert.rejects(f.run());
    }
});

test('new explicit schedule contribution is hash-checked, inactive and has no selected business channel', () => {
    const fs = require('node:fs'), crypto = require('node:crypto');
    const section = require('../data/manifest.json').sections.acquisitionRefreshSchedule;
    assert.equal(section.installer, undefined); assert.equal(section.destinationRole, 'CRON'); assert.equal(section.selectionPolicy, 'EXPLICIT');
    const importer = path.join(root, 'nodics.foundation/modules/nData/nImport/import');
    const releases = { ...require(path.join(importer, 'src/service/release/defaultDataReleaseService')),
        configuration: () => require(path.join(importer, 'config/properties')).data.dataReleases };
    const inspected = releases.inspectManifest({ name: 'promotion', path: path.join(__dirname, '..') }, 'init',
        path.join(__dirname, '../data/manifest.json'), section, 'acquisitionRefreshSchedule', true);
    assert.equal(inspected.sourceRoot, 'init-v002'); assert.equal(inspected.installer, undefined);
    assert.equal(inspected.declaredFiles.length, 2);
    for (const [file, expected] of Object.entries(section.files))
        assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(__dirname, '../data', file))).digest('hex'), expected);
    const job = require('../data/init-v002/records/jobs/promotionAcquisitionRefreshJobData').record1;
    assert.equal(job.active, false); assert.equal(job.runOnInit, false); assert.equal(job.jobDetail.channelCode, null);
    assert.equal(job.jobDetail.startNode, defaults.promotion.acquisitionReporting.refresh.startNode);
});
