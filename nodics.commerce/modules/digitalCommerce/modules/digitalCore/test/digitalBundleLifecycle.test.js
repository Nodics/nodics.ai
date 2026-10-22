/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module digitalCore/test/digitalBundleLifecycle @description Exercises actual bundle/gift services through isolated managed-CAS persistence and component ports. No live database or provider calls. @owner digitalCore @layer test */
const test = require("node:test"), assert = require("node:assert/strict");
const bundles = require("../src/service/defaultDigitalBundleService");
const gifts = require("../src/service/defaultDigitalBundleGiftService");
const persistence = require("../src/service/defaultDigitalCommerceEntitlementService");
const defaults = require("../config/properties");
const clone = value => structuredClone(value);
const owner = code => ({ module: "profile", schema: "customer", code });
const component = code => ({ kind: "CERTIFICATE", reference: { module: "wasteCore", schema: "wasteAsset", code }, quantity: "1", expectedRevision: 1 });

function fixture(t) {
  const before = { CONFIG: global.CONFIG, SERVICE: global.SERVICE, NODICS: global.NODICS, UTILS: global.UTILS, CLASSES: global.CLASSES };
  t.after(() => Object.assign(global, before));
  const config = clone(defaults.digitalCore), rows = {}, effects = [], holdings = new Map(), receipts = new Map();
  config.bundles.ownerAuthorityService = "ProfileAuthority";
  config.bundles.componentProviders.CERTIFICATE = "CertificateOwner";
  let failTransfer = false, failReserveAcknowledgement = false;
  global.CONFIG = { get: key => key === "digitalCore" ? config : undefined };
  global.UTILS = { createModelName: value => value };
  global.NODICS = { getModels: () => Object.fromEntries(['digitalBundleManifest', 'digitalBundleOperation', 'digitalBundleOwnerPolicy']
    .map(name => [name, { primaryKey: 'code', compareAndSetItem: () => {}, rawSchema: {} }])) };
  global.SERVICE = { DefaultDigitalBundleService: bundles, DefaultDigitalBundleGiftService: gifts,
    DefaultDigitalCommerceEntitlementService: persistence,
    DefaultSecuredRequestPipelineService: { getGrantedPermissions: r => r.actor === 'scheduler' ? ['commerce.digital.bundle.expire'] : [],
      isPermissionGranted: (permission, granted) => granted.includes(permission) },
    DefaultModelConcurrencyService: { getField: () => 'revision' },
    DefaultDatabaseModelHandlerService: { inspectIndexes: async () => ({ versioned: false, indexes: [{ unique: true, key: { code: 1 } }] }) },
    DefaultServiceTokenService: { requireRuntimePrincipal: r => { if (r.actor !== 'scheduler') throw Error('Runtime required'); return r.authData; } },
    ProfileAuthority: {
      authorize: async (r, input) => {
        if (r.actor !== input.ownerRef.code) throw new Error("Profile denied owner");
        return { authorized: true, tenant: r.tenant, ownerRef: input.ownerRef, actorRef: owner(r.actor) };
      },
      resolveRecipient: async (_, input) => ({ active: input.ownerRef.code !== "missing", ownerRef: input.ownerRef }),
    },
  };
  for (const name of ["DefaultDigitalBundleManifestService", "DefaultDigitalBundleOperationService", "DefaultDigitalBundleOwnerPolicyService"]) {
    rows[name] = [];
    SERVICE[name] = {
      get: async r => {
        const match = (row, query) => Object.entries(query).every(([key, value]) => {
          if (key === '$or') return value.some(branch => match(row, branch));
          const actual = key.split('.').reduce((v, k) => v?.[k], row);
          if (value && typeof value === 'object') return Object.entries(value).every(([op, expected]) =>
            op === '$gt' ? actual > expected : op === '$lte' ? new Date(actual) <= expected : false);
          return actual === value;
        });
        const selected = rows[name].filter(row => match(row, r.query));
        if (r.searchOptions?.sort?.code === 1) selected.sort((a, b) => a.code.localeCompare(b.code));
        const size = r.searchOptions?.pageSize || 100, page = r.searchOptions?.pageNumber || 1;
        return { code: 'SUC_TEST', count: selected.length, result: clone(selected.slice((page - 1) * size, page * size)) };
      },
      save: async r => {
        assert.equal(r.options.insertOnly, undefined);
        assert.equal(r.options.recursive, false);
        if (rows[name].some(row => row.code === r.model.code)) throw Error("Duplicate identity");
        rows[name].push(clone(r.model));
        return { code: "SUC_TEST", result: clone(r.model) };
      },
      update: async r => {
        const row = rows[name].find(row => Object.entries(r.query).every(([key, value]) => row[key] === value));
        if (row) Object.assign(row, clone(r.model), { revision: r.query.revision + 1 });
        return { code: "SUC_TEST", result: { acknowledged: true, matchedCount: row ? 1 : 0 } };
      },
    };
  }
  const phase = (method, status) => async (_, input) => {
    const key = input.operationKey + ":" + method, code = input.component.reference.code;
    if (receipts.has(key)) return clone(receipts.get(key));
    if (method === "transfer" && failTransfer && code === "b") throw Error("Transfer outcome uncertain");
    const held = holdings.get(code);
    if (method === "reserve") {
      if (held && held.operationKey !== input.operationKey) throw Error("Competing holding");
      holdings.set(code, { operationKey: input.operationKey, status: "RESERVED" });
    } else if (method === "release") {
      if (held?.status === "TRANSFERRED" || held?.status === "COMPLETED") throw Error("Cannot release transfer");
      if (held && held.operationKey !== input.operationKey) throw Error("Foreign holding");
      holdings.delete(code);
    } else {
      assert.equal(held.operationKey, input.operationKey);
      if (method === "finalize") assert.equal(held.status, "TRANSFERRED");
      held.status = status;
    }
    const receipt = { status, operationKey: input.operationKey, reference: input.component.reference,
      quantity: input.component.quantity, receiptCode: key };
    receipts.set(key, clone(receipt)); effects.push(key);
    if (method === "reserve" && failReserveAcknowledgement) { failReserveAcknowledgement = false; throw Error("Reserve acknowledgement lost"); }
    return receipt;
  };
  SERVICE.CertificateOwner = { inspect: async (_, input) => ({ available: !holdings.has(input.component.reference.code), ownerRef: input.ownerRef, revision: 1 }),
    reserve: phase("reserve", "RESERVED"), transfer: phase("transfer", "TRANSFERRED"),
    release: phase("release", "RELEASED"), finalize: phase("finalize", "COMPLETED") };
  const r = actor => ({ tenant: "tenant", enterpriseCode: "market", actor,
    authData: { tenant: "tenant", ...(actor === 'scheduler' ? { principalType: 'service', tokenType: 'service', entCode: 'market' } : {}) } });
  const create = (values = [component("a"), component("b")], key = "manifest") => bundles.create(r("sender"), { ownerRef: owner("sender"), components: values, idempotencyKey: key });
  const send = async manifest => gifts.send(r("sender"), { manifestCode: manifest.code, manifestRevision: manifest.revision,
    recipientRef: owner("recipient"), idempotencyKey: "gift", confirmed: true });
  return { config, rows, effects, holdings, r, create, send,
    failTransfer: value => { failTransfer = value; }, loseReserve: () => { failReserveAcknowledgement = true; } };
}

test("nonempty manifests reject duplicates, rewards, coupons, zero carbon and foreign actors", async t => {
  const f = fixture(t);
  for (const values of [[], [component("a"), component("a")], [{ ...component("a"), kind: "REWARD" }],
    [{ ...component("a"), kind: "COUPON" }], [{ ...component("a"), kind: "REALIZED_CARBON", quantity: "0.0" }]])
    await assert.rejects(f.create(values));
  await assert.rejects(bundles.create(f.r("intruder"), { ownerRef: owner("sender"), components: [component("a")], idempotencyKey: "m" }), /denied/);
  const first = await f.create();
  assert.equal((await f.create()).code, first.code);
  await assert.rejects(f.create([component("other")]), /conflicts/);
});

test("reserve acknowledgement loss resumes original operation without duplicate holding", async t => {
  const f = fixture(t), manifest = await f.create(); f.loseReserve();
  await assert.rejects(f.send(manifest), /acknowledgement/);
  assert.equal(f.rows.DefaultDigitalBundleOperationService[0].status, "RESERVING");
  const pending = await f.send(manifest);
  assert.equal(pending.status, "PENDING");
  assert.equal(f.effects.filter(k => k.endsWith(":reserve")).length, 2);
  assert.equal(Object.keys(pending.checkpoints).length, 2);
});

test("resending a terminal gift returns original evidence without a false pending notification", async t => {
  const f = fixture(t), events = [];
  f.config.giftNotifications.enabled = true;
  SERVICE.DefaultDigitalBundleGiftNotificationService = { notify: async (_, code, event) => { events.push([code, event]); } };
  const pending = await f.send(await f.create());
  const released = await gifts.decide(f.r("sender"), {
    operationCode: pending.code, expectedRevision: pending.revision, decision: "CANCEL", confirmed: true,
  });
  assert.equal(released.status, "RELEASED");
  const replay = await f.send(await f.create());
  assert.equal(replay.code, released.code);
  assert.equal(replay.status, "RELEASED");
  assert.deepEqual(events.map(([, event]) => event), ["PENDING", "CANCELLED"]);
});

test("whole gift retains partial-transfer locks and resumes before any finalize", async t => {
  const f = fixture(t), pending = await f.send(await f.create());
  const decision = { operationCode: pending.code, expectedRevision: pending.revision, decision: "ACCEPT", confirmed: true };
  f.failTransfer(true);
  await assert.rejects(gifts.decide(f.r("recipient"), decision), /uncertain/);
  assert.equal(f.holdings.get("a").status, "TRANSFERRED");
  assert.equal(f.holdings.get("b").status, "RESERVED");
  assert.equal(f.effects.some(k => k.endsWith(":finalize")), false);
  await assert.rejects(gifts.decide(f.r("sender"), { ...decision, decision: "CANCEL" }), /Another gift decision/);
  f.failTransfer(false);
  const completed = await gifts.decide(f.r("recipient"), decision);
  assert.equal(completed.status, "COMPLETED");
  await gifts.decide(f.r("recipient"), decision);
  assert.equal(f.effects.filter(k => k.endsWith(":transfer")).length, 2);
  assert.equal(f.effects.filter(k => k.endsWith(":finalize")).length, 2);
});

test("accept and cancel compete on a single persisted revision", async t => {
  const f = fixture(t), pending = await f.send(await f.create());
  const common = { operationCode: pending.code, expectedRevision: pending.revision, confirmed: true };
  const results = await Promise.allSettled([
    gifts.decide(f.r("recipient"), { ...common, decision: "ACCEPT" }),
    gifts.decide(f.r("sender"), { ...common, decision: "CANCEL" }),
  ]);
  assert.equal(results.filter(result => result.status === "fulfilled").length, 1);
  assert.equal(f.effects.some(k => k.endsWith(":transfer")) && f.effects.some(k => k.endsWith(":release")), false);
});

test("expiry and recipient denial never bypass retained authority", async t => {
  const f = fixture(t), pending = await f.send(await f.create());
  await assert.rejects(gifts.decide(f.r("intruder"), { operationCode: pending.code, expectedRevision: pending.revision, decision: "ACCEPT", confirmed: true }), /denied/);
  const saved = f.rows.DefaultDigitalBundleOperationService[0]; saved.deadline = "2000-01-01T00:00:00.000Z";
  await assert.rejects(gifts.decide(f.r("recipient"), { operationCode: pending.code, expectedRevision: pending.revision, decision: "ACCEPT", confirmed: true }), /deadline/);
  assert.equal((await gifts.expire(f.r("scheduler"), pending.code)).status, "RELEASED");
  assert.equal(f.holdings.size, 0);
});

test("framework 72-hour expiry is usable and each gift retains its selected duration", async t => {
  const f = fixture(t), manifest = await f.create(), before = Date.now();
  assert.equal(f.config.bundles.giftExpirySeconds, 259200);
  const pending = await f.send(manifest), after = Date.now();
  assert.ok(Date.parse(pending.deadline) >= before + 259200000);
  assert.ok(Date.parse(pending.deadline) <= after + 259200000);
  f.config.bundles.giftExpirySeconds = 3600;
  assert.equal((await f.send(manifest)).deadline, pending.deadline);
  const other = await f.create([component("c")], "custom-manifest"), customStart = Date.now();
  const customized = await gifts.send(f.r("sender"), { manifestCode: other.code, manifestRevision: other.revision,
    recipientRef: owner("recipient"), idempotencyKey: "custom-gift", confirmed: true });
  assert.ok(Date.parse(customized.deadline) >= customStart + 3600000);
  assert.ok(Date.parse(customized.deadline) <= Date.now() + 3600000);
});

test("invalid and overflow gift durations cannot create an operation or reserve components", async t => {
  const f = fixture(t), manifest = await f.create([component("duration")]);
  f.config.bundles.giftExpirySeconds = Number.MAX_SAFE_INTEGER;
  const send = () => gifts.send(f.r("sender"), { manifestCode: manifest.code, manifestRevision: manifest.revision,
    recipientRef: owner("recipient"), idempotencyKey: "invalid-duration", confirmed: true });
  await assert.rejects(send(), /configuration/);
  f.config.bundles.validation.giftExpirySeconds.maximum = Number.MAX_SAFE_INTEGER;
  await assert.rejects(send(), /expiry configuration/);
  assert.equal(f.rows.DefaultDigitalBundleOperationService.length, 0);
  assert.equal(f.holdings.size, 0);
});

test("explicit null expiry and missing component owners fail closed", async t => {
  const f = fixture(t), manifest = await f.create();
  f.config.bundles.giftExpirySeconds = null;
  await assert.rejects(f.send(manifest), /expiry/);
  f.config.bundles.maximumComponents = 1;
  await assert.rejects(f.create(), /bounded/);
  f.config.bundles.componentProviders.CERTIFICATE = "Unavailable";
  await assert.rejects(f.create([component("a")], "new"), /owner is unavailable/);
});

test("bounded Cron-compatible sweep expires only pending gifts and resumes by stable key without skipping mutations", async t => {
  const f = fixture(t);
  f.config.bundles.giftExpirySweep = { maximumOperations: 2, pageSize: 1 };
  for (let n = 0; n < 3; n++) {
    const manifest = await f.create([component('sweep-' + n)], 'sweep-manifest-' + n);
    await gifts.send(f.r('sender'), { manifestCode: manifest.code, manifestRevision: manifest.revision,
      recipientRef: owner('recipient'), idempotencyKey: 'sweep-' + n, confirmed: true });
  }
  for (const row of f.rows.DefaultDigitalBundleOperationService) row.deadline = '2000-01-01T00:00:00.000Z';
  const first = await gifts.sweepExpired(f.r('scheduler'));
  assert.equal(first.scanned, 2); assert.equal(first.schedulerActivated, false); assert.ok(first.nextCursor);
  assert.equal(first.results.every(row => row.status === 'RELEASED'), true);
  const second = await gifts.sweepExpired(f.r('scheduler'), { afterCode: first.nextCursor });
  assert.equal(second.scanned, 1); assert.equal(second.nextCursor, null); assert.equal(f.holdings.size, 0);
  assert.equal((await gifts.sweepExpired(f.r('scheduler'))).scanned, 0);
});

test("gift sweep refuses human callers, foreign namespace, invalid defaults and arbitrary filters", async t => {
  const f = fixture(t);
  await assert.rejects(gifts.sweepExpired(f.r('sender')), /Runtime/);
  await assert.rejects(gifts.sweepExpired({ ...f.r('scheduler'), enterpriseCode: 'foreign' }), /scheduler/);
  await assert.rejects(gifts.sweepExpired(f.r('scheduler'), { status: 'TRANSFERRING' }), /bounds/);
  f.config.bundles.giftExpirySweep.pageSize = 0;
  await assert.rejects(gifts.sweepExpired(f.r('scheduler')), /bounds/);
});

function scheduledFixture(t) {
  const f = fixture(t), calls = [], scheduler = require("../src/service/defaultDigitalGiftExpirySchedulerService");
  const controller = require("../src/controller/defaultDigitalBundleMaintenanceController");
  const definition = structuredClone(require("../data/init-v001/records/jobs/digitalGiftExpiryJobData").record1);
  definition.tenant = "tenant";
  const auth = { ...f.r("scheduler").authData, serviceId: "cron-runtime", runtimeInstanceId: "instance", modules: ["digitalCore"],
    permissions: ["commerce.digital.bundle.expire"], groups: [], userGroups: [],
    runtimeScope: { projectCode: "project", environmentCode: "unit", serverCode: "cron", instanceCode: "instance", assignmentCode: "assignment" } };
  f.config.bundles.giftExpiryScheduler.enabled = true;
  Object.assign(SERVICE, { DefaultDigitalGiftExpirySchedulerService: scheduler,
    DefaultDigitalBundleAuthorityService: require("../src/service/defaultDigitalBundleAuthorityService"),
    DefaultServiceTokenService: require("../../../../../../nodics.foundation/modules/nAuth/src/service/identity/defaultServiceTokenService"),
    DefaultCronJobService: { assertOperational: async tenant => { assert.equal(tenant, "tenant"); return clone(auth); } },
    DefaultModuleService: { invokeModule: async call => {
      calls.push(clone(call)); assert.equal(call.moduleName, "digitalCore"); assert.equal(call.apiName, "/internal/bundles/gifts/expire");
      assert.deepEqual(call.header, { Authorization: "Bearer original-cron-credential", tenant: "tenant" });
      assert.deepEqual(call.request, { tenant: "tenant" }); assert.equal(call.maxAttempts, 1); assert.equal(call.followRedirects, false);
      const result = await controller.expireGifts({ ...f.r("scheduler"), authData: clone(auth), httpRequest: { body: call.requestBody } });
      if (f.lostAcknowledgement) { f.lostAcknowledgement = false; throw Error("Lost expiry acknowledgement"); }
      return result;
    } },
  });
  NODICS.getInternalAuthToken = () => "original-cron-credential";
  const input = { definition, authData: clone(auth) };
  const trigger = require("../../../../../../nodics.process/modules/cronjob/src/service/trigger/defaultCronJobTriggerHandlerService");
  const run = () => new Promise((resolve, reject) => trigger.triggerProcess.call({ ...trigger, LOG: { debug() {} } },
    { definition }, {}, { nextSuccess: (_, response) => resolve(response.success), error: (_, __, error) => reject(error) }));
  const expired = async (code = "expired") => {
    const manifest = await f.create([component(code)], "manifest-" + code);
    const gift = await gifts.send(f.r("sender"), { manifestCode: manifest.code, manifestRevision: manifest.revision,
      recipientRef: owner("recipient"), idempotencyKey: "gift-" + code, confirmed: true });
    f.rows.DefaultDigitalBundleOperationService.find(row => row.code === gift.code).deadline = "2000-01-01T00:00:00.000Z";
    return gift;
  };
  return Object.assign(f, { scheduler, definition, auth, input, calls, run, expired });
}

test("inactive owned Cron definition dispatches through actual trigger, binding, controller and persisted gift expiry", async t => {
  const f = scheduledFixture(t), p = f.config.bundles;
  assert.equal(f.definition.active, false); assert.equal(f.definition.runOnInit, false);
  assert.equal(defaults.digitalCore.bundles.giftExpiryScheduler.enabled, false);
  p.giftExpirySweep = { maximumOperations: 1, pageSize: 1 }; p.giftExpiryScheduler.maximumBatches = 2;
  await f.expired("one"); await f.expired("two"); await f.expired("three");
  const original = clone(f.auth), result = await f.run();
  assert.equal(result.results.length, 2); assert.equal(result.complete, false); assert.ok(result.nextCursor);
  assert.equal(result.recoveryRequired, 0); assert.equal(f.calls.length, 2); assert.deepEqual(f.auth, original);
  assert.equal(f.calls[1].requestBody.afterCode, result.results[0].operationCode);
  assert.equal((await f.run()).complete, true); assert.equal(f.holdings.size, 0);
  const effects = clone(f.effects); assert.equal((await f.run()).results.length, 0); assert.deepEqual(f.effects, effects);
});

test("Cron gift expiry preserves uncertain release and resumes the original receipt without duplicate release", async t => {
  const f = scheduledFixture(t), gift = await f.expired(), release = SERVICE.CertificateOwner.release;
  let fail = true;
  SERVICE.CertificateOwner.release = async (...args) => { const result = await release(...args); if (fail) { fail = false; throw Error("lost release"); } return result; };
  assert.equal((await f.run()).recoveryRequired, 1);
  assert.equal(f.rows.DefaultDigitalBundleOperationService.find(row => row.code === gift.code).status, "RELEASING");
  const effects = clone(f.effects); assert.equal((await f.run()).results[0].status, "RELEASED");
  assert.deepEqual(f.effects, effects);
  await f.expired("ack"); f.lostAcknowledgement = true;
  await assert.rejects(f.run(), /acknowledgement/);
  const after = clone(f.effects); assert.equal((await f.run()).results.length, 0); assert.deepEqual(f.effects, after);
});

test("Cron gift binding refuses disabled, substituted target, altered principal and policy or credential drift", async t => {
  const f = scheduledFixture(t), p = f.config.bundles.giftExpiryScheduler;
  p.enabled = false; await assert.rejects(f.run(), /binding/); p.enabled = true;
  p.target.moduleName = "foreign"; await assert.rejects(f.run(), /binding/); p.target.moduleName = "digitalCore";
  p.maximumBatches = 0; await assert.rejects(f.run(), /binding/); p.maximumBatches = 10;
  await assert.rejects(f.scheduler.sweep({ ...f.input, authData: { ...f.auth, entCode: "foreign" } }), /authority/);
  assert.equal(f.calls.length, 0);
  const invoke = SERVICE.DefaultModuleService.invokeModule;
  SERVICE.DefaultModuleService.invokeModule = async call => { const result = await invoke(call); p.enabled = false; return result; };
  await assert.rejects(f.run(), /authority/); p.enabled = true;
  SERVICE.DefaultModuleService.invokeModule = async call => { const result = await invoke(call); NODICS.getInternalAuthToken = () => "changed"; return result; };
  await assert.rejects(f.run(), /authority/);
});

test("gift schedule release is explicit, hash-checked and contributes only an inactive Cron-owned definition", () => {
  const fs = require("node:fs"), crypto = require("node:crypto");
  const section = require("../data/manifest.json").sections.giftExpirySchedule;
  assert.equal(section.selectionPolicy, "EXPLICIT"); assert.equal(section.destinationRole, "CRON"); assert.equal(section.installer, "CRON_JOB");
  for (const [file, hash] of Object.entries(section.files))
    assert.equal(crypto.createHash("sha256").update(fs.readFileSync(require("node:path").resolve(__dirname, "../data", file))).digest("hex"), hash);
  const header = require("../data/init-v001/headers/jobs/digitalGiftExpiryJobHeader").cronjob.digitalGiftExpiryJob;
  assert.equal(header.options.schemaName, "cronJob"); assert.equal(header.options.dataFilePrefix, "digitalGiftExpiryJobData");
  const definition = require("../data/init-v001/records/jobs/digitalGiftExpiryJobData").record1;
  assert.equal(definition.active, false); assert.equal(definition.runOnInit, false);
  assert.equal(definition.jobDetail.startNode, defaults.digitalCore.bundles.giftExpiryScheduler.startNode);
});

const notices = require("../src/service/defaultDigitalBundleGiftNotificationService");
const path = require("node:path"), root = path.resolve(__dirname, "../../../../../..");
const communication = require(path.join(root, "nodics.communication/modules/commsCore/src/service/defaultCommunicationRuntimeService"));
/** Real gift persistence/source, rendering and Communication intents; isolated transport and Profile protocol double. */
function notificationFixture(t) {
  const f = fixture(t), p = f.config.giftNotifications, calls = [], stores = {}, sensitive = new WeakSet();
  global.CLASSES = { NodicsError: class extends Error { constructor(code) { super(code); this.code = code; } } };
  const communicationApi = require(path.join(root, "nodics.communication/modules/commsApi/src/facade/defaultCommunicationApiFacade"));
  p.enabled = p.qualified = true;
  const runtimeScope = { projectCode: "project", environmentCode: "unit", serverCode: "profile", instanceCode: "instance", assignmentCode: "assignment" };
  p.sourceCallers = [{ tenant: "tenant", principalEnterpriseCode: "runtime", enterpriseCode: "market", serviceId: "profile-runtime", ...runtimeScope }];
  const auth = { tenant: "tenant", principalType: "service", tokenType: "service", entCode: "runtime",
    modules: ["profile", "digitalCore", "commsApi"], permissions: ["commerce.digital.notification.read", "communication.request"],
    serviceId: "profile-runtime", runtimeScope, runtimeInstanceId: "instance" };
  const trusted = body => ({ tenant: "tenant", entCode: "runtime", authData: clone(auth), body: clone(body) });
  const comms = clone(require(path.join(root, "nodics.communication/modules/commsCore/config/properties")).communication);
  comms.trustedSourceModules = ["digitalCore"];
  comms.dispatchEligibilityOwners = clone(defaults.communication.dispatchEligibilityOwners);
  for (const template of Object.values(p.templates)) comms.templateResources.selections[template] = true;
  global.CONFIG = { get: key => ({ digitalCore: f.config, communication: comms, runtimeRole: { code: "COMMERCE" } })[key] };
  const module = { name: "digitalCore", path: path.resolve(__dirname, "..") };
  Object.assign(NODICS, { getSelectedEnvironmentName: () => "unit", getIndexedModules: () => new Map([["digitalCore", module]]), getRawModule: () => module });
  Object.assign(SERVICE, {
    DefaultDigitalBundleGiftNotificationService: notices,
    DefaultDigitalCouponReminderDeliveryService: require("../src/service/defaultDigitalCouponReminderDeliveryService"),
    DefaultLoggerService: { runSensitiveOperation: async (r, fn) => { sensitive.add(r); return fn(); },
      assertSensitiveRequest: r => assert(sensitive.has(r)), hasPrivateCaptureProtection: r => sensitive.has(r) },
    DefaultServiceTokenService: { requireRuntimePrincipal: r => {
      if (r.authData?.principalType !== "service") throw Error("Runtime required"); return r.authData;
    } },
    DefaultCommunicationRuntimeService: communication,
    DefaultCommunicationOperationsService: require(path.join(root, "nodics.communication/modules/commsApi/src/service/defaultCommunicationOperationsService")),
    DefaultCommunicationCoreService: require(path.join(root, "nodics.communication/modules/commsCore/src/service/defaultCommunicationCoreService")),
    DefaultCommunicationTemplateService: require(path.join(root, "nodics.communication/modules/commsCore/src/service/defaultCommunicationTemplateService")),
  });
  for (const schema of ["CommsIntent", "CommsDeliveryAttempt", "CommsInboxMessage", "CommsSuppression"]) {
    stores[schema] = new Map();
    SERVICE["Default" + schema + "Service"] = {
      get: async ({ tenant, query }) => ({ code: "SUC_READ", result: [...stores[schema].values()].filter(row => row.tenant === tenant &&
        Object.entries(query).every(([k, v]) => row[k] === v)).map(clone) }),
      save: async ({ tenant, model }) => {
        if (schema === "CommsInboxMessage" && f.inboxFailure) throw Error("Inbox unavailable");
        const key = tenant + model.code;
        if (stores[schema].has(key)) throw Error("Duplicate");
        stores[schema].set(key, { ...clone(model), tenant, revision: 1 });
        return { code: "SUC_SAVE", result: clone(stores[schema].get(key)) };
      },
      update: async ({ tenant, query, model }) => {
        const row = stores[schema].get(tenant + query.code);
        if (!row || row.revision !== query.revision) throw Error("CAS failed");
        Object.assign(row, clone(model), { revision: row.revision + 1 });
        return { code: "SUC_UPDATE", result: { matchedCount: 1 } };
      },
    };
  }
  const source = async body => {
    const r = trusted(body);
    return SERVICE.DefaultLoggerService.runSensitiveOperation(r, () => notices.source(r));
  };
  SERVICE.DefaultModuleService = { invokeModule: async call => {
    calls.push(clone(call));
    assert.equal(call.requireInternalAuth, true); assert.equal(call.header, undefined); assert.equal(call.maxAttempts, 1);
    assert.deepEqual(call.request, { tenant: "tenant" }); assert.equal(call.secureTransport.required, true);
    if (call.moduleName === "profile") {
      if (f.profileFailure) throw Error("Profile unavailable");
      const body = call.requestBody, proof = await source({ ...body.source, channel: body.channel });
      const recipients = proof.eligible && !f.optOut?.includes(body.source.side) ? [{ recipientId: proof.ownerRef.code,
        recipientAddressReference: "profile-inbox:" + bundles.digest([proof.sourceDigest, proof.ownerRef, proof.ownerRef.code]) }] : [];
      const result = { ...proof, recipients };
      f.changeProof?.(result);
      return { data: result };
    }
    assert.equal(call.moduleName, "commsApi");
    const request = { ...trusted({}), payload: clone(call.requestBody), intentCode: call.apiName.split("/")[3] };
    const result = await SERVICE.DefaultLoggerService.runSensitiveOperation(request, () => call.apiName === "/internal/communications"
      ? communicationApi.requestCommunication(request) : communicationApi.inspectDelivery(request));
    if (f.lostAck) throw Error("Lost Communication acknowledgement");
    return { data: result };
  } };
  return Object.assign(f, { calls, stores, trusted, source, p });
}

test("gift notification defaults are off; enabled but unqualified fails without changing completed gift", async t => {
  const f = notificationFixture(t); f.p.enabled = false;
  const pending = await f.send(await f.create());
  assert.equal(f.calls.length, 0); assert.equal(pending.status, "PENDING");
  f.p.enabled = true; f.p.qualified = false;
  const completed = await gifts.decide(f.r("recipient"), { operationCode: pending.code, expectedRevision: pending.revision, decision: "ACCEPT", confirmed: true });
  assert.equal(completed.status, "COMPLETED"); assert.equal(f.calls.length, 0);
});

test("pending and completed gifts deliver original inbox intents; returned revisions remain current and private plans stay hidden", async t => {
  const f = notificationFixture(t), pending = await f.send(await f.create());
  assert.equal(f.stores.CommsInboxMessage.size, 2);
  assert.equal(pending.evidence.giftNotifications, undefined);
  assert.equal(pending.revision, f.rows.DefaultDigitalBundleOperationService[0].revision);
  const decision = { operationCode: pending.code, expectedRevision: pending.revision, decision: "ACCEPT", confirmed: true };
  const completed = await gifts.decide(f.r("recipient"), decision);
  assert.equal(completed.status, "COMPLETED"); assert.equal(completed.evidence.giftNotifications, undefined);
  assert.equal(f.stores.CommsInboxMessage.size, 4);
  assert.equal([...f.stores.CommsInboxMessage.values()].some(row => row.body.includes("{{")), false);
  const effects = clone(f.effects);
  await notices.retry(f.r("sender"), { operationCode: pending.code, event: "ACCEPTED", side: "SENDER" });
  assert.deepEqual(f.effects, effects); assert.equal(f.stores.CommsInboxMessage.size, 4);
  assert.equal(f.calls.filter(c => c.apiName.endsWith("/inspect")).length, 2);
  await assert.rejects(notices.retry(f.r("intruder"), { operationCode: pending.code, event: "ACCEPTED", side: "SENDER" }), /denied/);
});

for (const [decision, event, actor] of [["CANCEL", "CANCELLED", "sender"], ["DECLINE", "DECLINED", "recipient"], ["EXPIRE", "EXPIRED", "scheduler"]]) {
  test("confirmed " + event + " delivers both sides only after release, with no duplicate release on notification replay", async t => {
    const f = notificationFixture(t), pending = await f.send(await f.create());
    let result;
    if (decision === "EXPIRE") {
      f.rows.DefaultDigitalBundleOperationService[0].deadline = "2000-01-01T00:00:00.000Z";
      result = await gifts.expire(f.r(actor), pending.code);
    } else result = await gifts.decide(f.r(actor), { operationCode: pending.code, expectedRevision: pending.revision, decision, confirmed: true });
    assert.equal(result.status, "RELEASED"); assert.equal(f.holdings.size, 0);
    assert.equal([...f.stores.CommsIntent.values()].filter(row => row.sourceType === "DIGITAL_BUNDLE_GIFT_" + event).length, 2);
    const effects = clone(f.effects);
    await notices.retry(f.r("sender"), { operationCode: pending.code, event, side: "SENDER" });
    assert.deepEqual(f.effects, effects);
  });
}

test("lost Communication acknowledgements retain original keys and frozen presentation instead of transferring again", async t => {
  const f = notificationFixture(t); f.lostAck = true;
  const pending = await f.send(await f.create()), effects = clone(f.effects);
  assert.equal(pending.status, "PENDING"); assert.equal(f.stores.CommsInboxMessage.size, 2);
  const keys = [...f.stores.CommsIntent.keys()];
  f.lostAck = false; f.p.templates.PENDING = "CHANGED_TEMPLATE"; f.p.locale = "fr";
  const result = await notices.retry(f.r("sender"), { operationCode: pending.code, event: "PENDING", side: "SENDER" });
  assert.equal(result.status, "RECORDED"); assert.deepEqual([...f.stores.CommsIntent.keys()], keys);
  assert.deepEqual(f.effects, effects);
  assert.equal([...f.stores.CommsIntent.values()].every(row => row.locale === "en"), true);
});

test("pending Communication retry suppresses a decided gift and terminal retry respects current opt-out", async t => {
  const f = notificationFixture(t); f.inboxFailure = true;
  const pending = await f.send(await f.create());
  const pendingIntents = [...f.stores.CommsIntent.values()];
  assert.equal(pendingIntents.every(row => row.status === "RETRY_PENDING"), true);
  await gifts.decide(f.r("sender"), { operationCode: pending.code, expectedRevision: pending.revision, decision: "CANCEL", confirmed: true });
  f.inboxFailure = false;
  for (const intent of pendingIntents) {
    intent.nextAttemptAt = new Date(0);
    assert.equal((await communication.retry(f.trusted({}), intent.code)).status, "SUPPRESSED");
  }
  f.optOut = ["SENDER", "RECIPIENT"];
  for (const intent of [...f.stores.CommsIntent.values()].filter(row => row.sourceType.endsWith("CANCELLED"))) {
    intent.nextAttemptAt = new Date(0);
    assert.equal((await communication.retry(f.trusted({}), intent.code)).status, "SUPPRESSED");
  }
  assert.equal(f.stores.CommsInboxMessage.size, 0);
});

test("explicit empty selection is frozen; Profile unavailability is not an empty selection or actor fallback", async t => {
  const f = notificationFixture(t); f.optOut = ["SENDER", "RECIPIENT"];
  const pending = await f.send(await f.create());
  assert.equal(f.stores.CommsIntent.size, 0);
  f.optOut = [];
  await notices.retry(f.r("recipient"), { operationCode: pending.code, event: "PENDING", side: "RECIPIENT" });
  assert.equal(f.stores.CommsIntent.size, 0);
  const row = f.rows.DefaultDigitalBundleOperationService[0]; delete row.evidence.giftNotifications;
  f.profileFailure = true;
  assert.equal((await notices.retry(f.r("sender"), { operationCode: pending.code, event: "PENDING", side: "SENDER" })).status, "UNCONFIRMED");
  assert.equal(row.evidence.giftNotifications, undefined);
});

test("partial transfer never emits acceptance; malformed recipient proofs never create intents", async t => {
  const f = notificationFixture(t); f.changeProof = proof => { proof.ownerRef = { type: "CUSTOMER", code: "foreign" }; };
  const pending = await f.send(await f.create());
  assert.equal(f.stores.CommsIntent.size, 0); delete f.changeProof;
  f.failTransfer(true);
  await assert.rejects(gifts.decide(f.r("recipient"), { operationCode: pending.code, expectedRevision: pending.revision, decision: "ACCEPT", confirmed: true }), /uncertain/);
  await notices.retry(f.r("recipient"), { operationCode: pending.code, event: "ACCEPTED", side: "RECIPIENT" });
  assert.equal(f.stores.CommsIntent.size, 0); assert.equal(f.holdings.get("a").status, "TRANSFERRED");
});

test("source proof rejects foreign grants, conflicting aliases, transaction context and incomplete committed receipts", async t => {
  const f = notificationFixture(t), pending = await f.send(await f.create());
  const input = { enterpriseCode: "market", operationCode: pending.code, event: "PENDING", side: "RECIPIENT", channel: "IN_APP" };
  assert.equal((await f.source(input)).ownerRef.code, "recipient");
  await assert.rejects(f.source({ ...input, enterpriseCode: "foreign" }));
  const conflicting = { ...f.trusted(input), enterpriseCode: "market" };
  await assert.rejects(SERVICE.DefaultLoggerService.runSensitiveOperation(conflicting, () => notices.source(conflicting)));
  const transaction = { ...f.r("sender"), transactionContext: {} };
  assert.equal((await notices.notify(transaction, pending.code, "PENDING")).status, "UNCONFIRMED");
  delete f.rows.DefaultDigitalBundleOperationService[0].checkpoints[0].reserve;
  await assert.rejects(f.source(input));
});

test("notification routes/controllers use existing permissions, private source and participant-only facade without holdings mutation", async t => {
  const f = notificationFixture(t), pending = await f.send(await f.create());
  const controller = require("../src/controller/defaultDigitalBundleGiftNotificationController");
  const facade = require("../src/facade/defaultDigitalCommerceCustomerFacade");
  const routes = require("../src/router/routers").digitalCore.giftNotifications;
  const saved = global.FACADE; t.after(() => { global.FACADE = saved; });
  global.FACADE = { DefaultDigitalCommerceCustomerFacade: facade };
  const headers = {}, before = clone(f.effects);
  const request = { ...f.r("sender"), httpRequest: { body: { operationCode: pending.code, event: "PENDING", side: "SENDER" } },
    httpResponse: { setHeader: (k, v) => { headers[k] = v; } } };
  assert.equal((await controller.retry(request)).data.status, "RECORDED");
  assert.deepEqual(f.effects, before); assert.equal(headers["Cache-Control"], "no-store");
  assert.deepEqual(routes.source.authTokenTypes, ["service"]); assert.equal(routes.source.permission, "commerce.digital.notification.read");
  assert.equal(routes.giftNotificationRetry.permission, "commerce.digital.bundle.manage");
  assert.equal(routes.giftNotificationRetry.requestPrivacy.sensitive, true);
});

test("source callback refuses credential or policy drift across awaited evidence reads", async t => {
  const f = notificationFixture(t), pending = await f.send(await f.create());
  const body = { enterpriseCode: "market", operationCode: pending.code, event: "PENDING", side: "SENDER", channel: "IN_APP" };
  const request = f.trusted(body), read = SERVICE.DefaultDigitalBundleOperationService.get;
  SERVICE.DefaultDigitalBundleOperationService.get = async r => {
    const result = await read(r); request.authData.serviceId = "changed"; return result;
  };
  await assert.rejects(SERVICE.DefaultLoggerService.runSensitiveOperation(request, () => notices.source(request)));
});

for (const field of ["sourceModule", "sourceType"]) test(`notification recipient proof refuses foreign ${field}`, async t => {
  const f = notificationFixture(t); f.changeProof = proof => { proof[field] = "foreign"; };
  const pending = await f.send(await f.create());
  assert.equal(pending.status, "PENDING");
  assert.equal(f.stores.CommsIntent.size, 0);
  assert.equal((await notices.retry(f.r("sender"), { operationCode: pending.code, event: "PENDING", side: "SENDER" })).status, "UNCONFIRMED");
  assert.equal(f.stores.CommsIntent.size, 0);
});
