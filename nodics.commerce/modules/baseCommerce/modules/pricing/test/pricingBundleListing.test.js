/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module pricing/test/pricingBundleListing @description Composes actual Digital listing coordination with Pricing immutable retention, pointer CAS, original receipts and activated price selection using isolated generated persistence and external owner I/O. @layer test @owner pricing */
const test = require("node:test"), assert = require("node:assert/strict");
const fixture = require("../../../../digitalCommerce/modules/digitalCore/test/bundlePublicationFixture.cjs");
const digital = require("../../../../digitalCommerce/modules/digitalCore/src/service/defaultDigitalCommerceAuctionService");
const prices = require("../src/service/defaultPricingBundleListingService");
const publication = require("../src/service/defaultPricingPublicationService");
const selection = require("../src/service/defaultPriceSelectionService");
const clone = structuredClone;

/** Uses real Pricing target operations for initial book activation and every subsequent listing write. */
async function setup(t) {
  const f = fixture(t), pricing = clone(require("../config/properties").pricing), oldGet = CONFIG.get;
  Object.assign(pricing.bundleListings, { enabled: true, qualified: true });
  Object.assign(pricing.publication, { runtimeRole: "ONLINE", delivery: { enabled: true, rootCodes: ["rewards"] } });
  CONFIG.get = key => key === "pricing" ? pricing : oldGet(key);
  Object.assign(SERVICE, { DefaultDigitalCommerceAuctionService: digital, DefaultPricingBundleListingService: prices,
    DefaultPricingPublicationService: publication, DefaultIdentityGovernanceService: { getSystemAuthData: () => ({ isSystem: true }) } });
  const tables = {}, state = { writes: 0 };
  for (const kind of ["Release", "Pointer", "Receipt"]) {
    const rows = tables[kind] = new Map();
    SERVICE["DefaultPricingPolicy" + kind + "Service"] = {
      get: async r => {
        assert.equal(r.authData.isSystem, true);
        const result = clone([...rows.values()].filter(row => Object.entries(r.query).every(([k, v]) => row[k] === v)));
        await state.onRead?.(kind, r);
        return { code: state.failedRead ? "ERR_STORAGE" : "SUC_READ", result };
      },
      save: async r => {
        assert.equal(r.authData.isSystem, true); state.writes++;
        if (rows.has(r.model.code)) throw Error("Duplicate");
        rows.set(r.model.code, { ...clone(r.model), revision: 1 });
        await state.afterWrite?.(kind, "save", r);
        if (state.lostSave === kind) { state.lostSave = null; throw Error("Acknowledgement lost"); }
        return { code: "SUC_SAVE", result: clone(rows.get(r.model.code)) };
      },
      update: async r => {
        assert.equal(r.authData.isSystem, true); state.writes++;
        if (state.blockUpdate === kind) throw Error("Update unavailable");
        const row = rows.get(r.query.code);
        if (!row || !Object.entries(r.query).every(([k, v]) => row[k] === v)) return { code: "SUC_UPDATE", result: { matchedCount: 0 } };
        Object.assign(row, clone(r.model), { revision: row.revision + 1 });
        await state.afterWrite?.(kind, "update", r);
        if (state.lostUpdate === kind) { state.lostUpdate = null; throw Error("Acknowledgement lost"); }
        return { code: "SUC_UPDATE", result: { matchedCount: 1 } };
      },
    };
  }
  const scope = { tenant: "tenant", enterpriseCode: "market", authData: { isSystem: true } };
  const records = [{ schema: "priceBook", policy: { code: "rewards", tenant: "tenant", enterpriseCode: "market",
    versionId: 3, currency: "POINTS", active: true, status: "ACTIVE" } },
  { schema: "priceRow", policy: { code: "unrelated-row", tenant: "tenant", enterpriseCode: "market", versionId: 4,
    priceBookCode: "rewards", productCode: "unrelated", currency: "POINTS", unitAmount: "7", minQuantity: "1", active: true } }];
  const payload = { tenant: "tenant", enterpriseCode: "market", rootType: "priceBook", rootCode: "rewards", records };
  const code = publication.fingerprint(payload), seed = { ...payload, code, fingerprint: code, payload };
  await publication.prepareTarget(seed, scope);
  await publication.switchTarget({ publication: { code: "book-approved", rootType: "priceBook", rootCode: "rewards", sourceVersion: code },
    operationKey: "book-activation", targetVersion: code, expectedVersion: null, expectedRevision: 0 }, scope);
  // Profile/Store admission is external I/O here, not a successful Pricing adapter.
  SERVICE.DefaultBiddingAuctionService.participant = async r => {
    if (r.authData.loginId !== "seller" && r.authData.loginId !== "buyer") throw Error("Participant denied");
    return { ...r, enterpriseCode: "market" };
  };
  f.request.authData.enterpriseCode = f.request.enterpriseCode;
  SERVICE.DefaultDigitalBundleCompositionService = require("../../../../digitalCommerce/modules/digitalCore/src/service/defaultDigitalBundleCompositionService");
  const listingContext = { tenant: "tenant", enterpriseCode: "seller-enterprise", code: "listing-context", revision: 1,
    active: true, status: "ACTIVE", name: "Governed listing context", storeCode: "store", categoryCodes: [],
    currency: "POINTS", priceBookCode: "rewards", reward: { programCode: "program", rewardTypeCode: "points" } };
  SERVICE.DefaultDigitalBundleListingContextService = { get: async r => {
    const rows = Object.entries(r.query).every(([key, value]) => listingContext[key] === value) ? [clone(listingContext)] : [];
    return { code: "SUC_READ", result: rows, count: rows.length };
  } };
  const manifest = await f.create(), command = f.command(manifest);
  command.listingContextRef = { code: listingContext.code, revision: listingContext.revision };
  command.saleMode = "FIXED"; command.startsAt = null;
  const input = () => ({ operationCode: f.row().code, terms: clone(f.row().evidence.listing.terms),
    product: clone(f.row().evidence.listing.product), idempotencyKey: f.row().code + ":price" });
  const request = () => ({ ...f.request, enterpriseCode: "market" });
  return { ...f, pricing, tables, state, scope, records, command, input, request, listingContext,
    publish: () => digital.publish(f.request, command) };
}

test("actual Digital/Pricing/Product/nPublish composition persists immutable graph, activation journal and exact replay", async t => {
  const f = await setup(t), p = require("./helpers/bundleProductComposition")(t);
  const result = await f.publish();
  assert.equal(result.status, "PUBLISHED");
  const retained = f.row().evidence.listing, publications = p.records.DefaultPublicationRequestService;
  const publication = publications.get(f.row().code);
  assert.equal(publication.state, "ONLINE"); assert.equal(publication.sourceVersion, "1");
  assert.deepEqual(p.sources.product.map(row => row.versionId), [0, 1]);
  assert.equal(p.sources.product[0].publicationReferences, undefined);
  assert.equal(p.sources.product[1].publicationReferences.records.length, 3);
  assert.equal(p.sources.product[1].enterpriseCode, "market");
  assert.equal(f.listingContext.enterpriseCode, "seller-enterprise");
  const audit = publication.auditTrail.find(row => row.toState === "APPROVED");
  assert.equal(audit.details.automatic.priceReceiptCode, retained.price.receiptCode);
  assert.equal(audit.details.automatic.termsDigest, retained.termsDigest);
  const pointer = [...p.records.DefaultProductPublicationPointerService.values()][0];
  assert.equal(pointer.version, retained.publication.targetVersion);
  assert.equal(pointer.receipts.length, 1); assert.equal(pointer.receipts[0].committed, true);
  assert.equal(pointer.receipts[0].operationKey, retained.publication.receiptCode);
  assert.ok(p.state.calls.includes("/internal/products/publication/authorize-target"));
  assert.equal(p.records.DefaultPublicationAuditService.size, publication.auditTrail.length);
  assert.equal(f.tables.Receipt.get(retained.price.receiptCode).applied, true);
  const book = await SERVICE.DefaultPricingPublicationService.readConfigured({ ...f.scope, storeCode: "store" });
  const selected = selection.select({ ...f.scope, productCode: retained.product.productCode, currency: "POINTS", quantity: "1" },
    book.filter(row => row.schema === "priceBook").map(row => row.policy),
    book.filter(row => row.schema === "priceRow").map(row => row.policy), SERVICE.DefaultExactAmountService);
  assert.equal(selected.selected.unitAmount, retained.terms.amount);
  assert.equal(selected.selected.productCode, retained.product.productCode);
  assert.equal(retained.price.variantCode, retained.product.variantCode);
  assert.deepEqual(book.slice(0, 2), f.records);
  const priceWrites = f.state.writes, productWrites = p.state.writes.length, original = clone(retained);
  assert.deepEqual(await f.publish(), result);
  assert.equal(f.state.writes, priceWrites); assert.equal(p.state.writes.length, productWrites);
  assert.deepEqual(f.row().evidence.listing, original);
  assert.equal(f.holds.size, 1); assert.deepEqual(f.effects, ["reserve"]);
});

test("actual composition recovers lost Product activation acknowledgement through the public listing command without new price or graph", async t => {
  const f = await setup(t), p = require("./helpers/bundleProductComposition")(t);
  let lost = false;
  p.state.afterTarget = method => { if (method === "deploy" && !lost) { lost = true; throw Error("Activation acknowledgement lost"); } };
  await assert.rejects(f.publish(), /Activation acknowledgement lost/);
  const publication = p.records.DefaultPublicationRequestService.get(f.row().code);
  const pointer = [...p.records.DefaultProductPublicationPointerService.values()][0];
  const retainedPrice = clone(f.row().evidence.listing.price), priceWrites = f.state.writes;
  assert.equal(publication.state, "FAILED"); assert.equal(pointer.receipts.length, 1);
  assert.equal(f.row().evidence.listing.publication, undefined); assert.equal(f.holds.size, 1);
  assert.equal((await f.publish()).status, "PUBLISHED");
  assert.deepEqual(f.row().evidence.listing.price, retainedPrice); assert.equal(f.state.writes, priceWrites);
  assert.deepEqual(p.sources.product.map(row => row.versionId), [0, 1]);
  assert.deepEqual([...p.records.DefaultProductPublicationPointerService.values()][0], pointer);
  const recovered = p.records.DefaultPublicationRequestService.get(f.row().code);
  assert.equal(recovered.state, "ONLINE"); assert.equal(recovered.activationOperation.key, publication.activationOperation.key);
  assert.deepEqual(f.effects, ["reserve"]);
});

test("actual immutable publication ignores newer dependency versions but rejects mutation of the sealed version", async t => {
  const f = await setup(t), p = require("./helpers/bundleProductComposition")(t);
  await f.publish(); const original = clone(f.row().evidence.listing.publication);
  p.sources.productLocalization.push({ ...clone(p.sources.productLocalization[0]), versionId: 1, name: "Later authoring" });
  const priceWrites = f.state.writes, productWrites = p.state.writes.length;
  await f.publish(); assert.deepEqual(f.row().evidence.listing.publication, original);
  p.sources.productLocalization[0].name = "Corrupt sealed version";
  await assert.rejects(f.publish(), /source version is missing or changed/);
  assert.equal(f.state.writes, priceWrites); assert.equal(p.state.writes.length, productWrites);
  assert.equal(f.holds.size, 1);
});

test("actual composition rejects stale governed context before holds and refuses changed context/terms on replay", async t => {
  const f = await setup(t), p = require("./helpers/bundleProductComposition")(t);
  f.listingContext.revision++;
  await assert.rejects(f.publish()); assert.equal(f.holds.size, 0); assert.equal(p.state.writes.length, 0);
  f.listingContext.revision--; await f.publish();
  const priceWrites = f.state.writes, productWrites = p.state.writes.length;
  f.listingContext.priceBookCode = "foreign";
  await assert.rejects(f.publish());
  f.listingContext.priceBookCode = "rewards"; f.command.amount = "11";
  await assert.rejects(f.publish(), /conflicts with original/);
  assert.equal(f.state.writes, priceWrites); assert.equal(p.state.writes.length, productWrites);
});

test("actual composition refuses lost original Pricing receipt before any Product publication writes", async t => {
  const f = await setup(t), p = require("./helpers/bundleProductComposition")(t);
  p.state.beforeProduct = phase => { if (phase === "publish") throw Error("Product transport unavailable"); };
  await assert.rejects(f.publish(), /Product transport unavailable/);
  const original = clone(f.row().evidence.listing.price), priceWrites = f.state.writes, productWrites = p.state.writes.length;
  f.tables.Receipt.delete(original.receiptCode); p.state.beforeProduct = null;
  await assert.rejects(f.publish(), /unconfirmed/);
  assert.equal(f.state.writes, priceWrites); assert.equal(p.state.writes.length, productWrites);
  assert.equal(p.records.DefaultPublicationRequestService.size, 0); assert.equal(f.holds.size, 1);
});

test("actual composition rejects drift in Product activation receipt without fabricating replacement receipts", async t => {
  const f = await setup(t), p = require("./helpers/bundleProductComposition")(t);
  await f.publish(); const priceWrites = f.state.writes, productWrites = p.state.writes.length;
  const pointer = [...p.records.DefaultProductPublicationPointerService.values()][0];
  pointer.receipts[0].publicationCode = "foreign";
  await assert.rejects(f.publish(), /activation is unconfirmed/);
  assert.equal(f.state.writes, priceWrites); assert.equal(p.state.writes.length, productWrites);
  assert.equal(pointer.receipts.length, 1); assert.equal(f.holds.size, 1);
});

test("real Digital -> Pricing publishes exact persisted price and preserves complete approved book, selection and original receipt", async t => {
  const f = await setup(t), result = await f.publish(), before = f.state.writes;
  assert.equal(result.status, "PUBLISHED");
  const proof = await prices.inspect(f.request(), f.input());
  assert.equal(f.tables.Receipt.get(proof.receiptCode).applied, true);
  assert.equal(proof.amount, "10"); assert.equal(proof.variantCode, "unit");
  const records = await publication.readConfigured({ ...f.scope, storeCode: "store" });
  assert.deepEqual(records.slice(0, 2), f.records);
  const selected = selection.select({ ...f.scope, productCode: "product", currency: "POINTS", quantity: "1" },
    records.filter(r => r.schema === "priceBook").map(r => r.policy), records.filter(r => r.schema === "priceRow").map(r => r.policy), SERVICE.DefaultExactAmountService);
  assert.equal(selected.selected.unitAmount, "10"); assert.deepEqual(selected.conflicts, []);
  await f.publish(); assert.equal(f.state.writes, before);
  assert.equal(f.tables.Receipt.size, 2);
});

test("read-only inspection requires original receipt; missing implementation cannot be masked by prepared Product", async t => {
  const f = await setup(t); f.pricing.bundleListings.enabled = false;
  await assert.rejects(f.publish(), /not qualified/);
  assert.equal(f.row().evidence.listing.price, undefined);
  assert.equal(f.holds.size, 1);
  f.pricing.bundleListings.enabled = true;
  const before = f.state.writes;
  await assert.rejects(prices.inspect(f.request(), f.input()), /unconfirmed/);
  assert.equal(f.state.writes, before);
});

test("lost receipt/pointer acknowledgements reconcile only actual persisted originals", async t => {
  for (const kind of ["Pointer", "Receipt"]) {
    const f = await setup(t); f.state.lostUpdate = kind;
    assert.equal((await f.publish()).status, "PUBLISHED");
    assert.equal(f.tables.Receipt.size, 2);
    assert.equal((await prices.inspect(f.request(), f.input())).confirmed, true);
  }
});

test("partial pointer commit retains holds and original receipt; inspect cannot repair, publish resumes same amendment", async t => {
  const f = await setup(t); f.state.blockUpdate = "Receipt";
  await assert.rejects(f.publish(), /unavailable/);
  const before = f.state.writes;
  await assert.rejects(prices.inspect(f.request(), f.input()), /unconfirmed/);
  assert.equal(f.state.writes, before); assert.equal(f.holds.size, 1);
  f.state.blockUpdate = null;
  assert.equal((await f.publish()).status, "PUBLISHED"); assert.equal(f.tables.Receipt.size, 2);
});

test("changed source terms, unauthorized owner, unselected book and failed envelopes cannot publish", async t => {
  const f = await setup(t); f.pricing.bundleListings.enabled = false;
  await assert.rejects(f.publish()); f.pricing.bundleListings.enabled = true;
  const before = f.state.writes, input = f.input();
  input.terms.amount = "11"; await assert.rejects(prices.publish(f.request(), input));
  await assert.rejects(prices.publish({ ...f.request(), authData: { ...f.request().authData, loginId: "foreign" } }, f.input()));
  f.pricing.publication.delivery.rootCodes = ["foreign"]; await assert.rejects(prices.publish(f.request(), f.input()));
  f.pricing.publication.delivery.rootCodes = ["rewards"]; f.state.failedRead = true;
  await assert.rejects(prices.publish(f.request(), f.input()), /persistence response/);
  assert.equal(f.state.writes, before);
});

test("authority/configuration drift during persistence retires the continuation before further writes", async t => {
  const f = await setup(t); f.state.onRead = () => { f.pricing.bundleListings.qualified = false; };
  const before = f.state.writes; await assert.rejects(f.publish(), /qualified/);
  assert.equal(f.state.writes, before);
});

test("later book removal or corrupt original receipt never confirms a listing price", async t => {
  const f = await setup(t); await f.publish();
  const receipt = f.tables.Receipt.get(f.row().evidence.listing.price.receiptCode);
  receipt.publicationCode = "foreign"; await assert.rejects(prices.inspect(f.request(), f.input()), /unconfirmed/);
  receipt.publicationCode = f.row().code;
  const pointer = [...f.tables.Pointer.values()][0];
  const original = [...f.tables.Receipt.values()].find(r => r.publicationCode === "book-approved");
  Object.assign(pointer, { receiptCode: original.code, version: original.targetVersion, revision: original.expectedRevision + 1 });
  await assert.rejects(prices.inspect(f.request(), f.input()), /no longer effective/);
});

test("an admitted different buyer can inspect a published tuple without seller write authority", async t => {
  const f = await setup(t); await f.publish();
  const buyer = { ...f.request(), authData: { tenant: "tenant", loginId: "buyer" } }, before = f.state.writes;
  assert.equal((await prices.inspect(buyer, f.input())).confirmed, true);
  await assert.rejects(prices.publish(buyer, f.input()), /denied/);
  assert.equal(f.state.writes, before);
});

test("future start and elapsed intake do not erase original receipt needed for auction grace", async t => {
  const f = await setup(t);
  f.command.startsAt = "2999-01-01T00:00:00.000Z"; f.command.endsAt = "2999-02-01T00:00:00.000Z";
  await f.publish(); const proof = await prices.inspect(f.request(), f.input());
  const row = [...f.tables.Release.values()].find(r => r.payload.bundleListing)?.payload.records.at(-1).policy;
  assert.equal(row.validFrom, f.command.startsAt); assert.equal(row.validTo, f.command.endsAt);
  assert.equal(proof.amount, "10");
  assert.equal(selection.effective(row, new Date("2999-02-02T00:00:00.000Z")), false);
});

test("a competing managed pointer revision never gets overwritten or acknowledged as this listing", async t => {
  const f = await setup(t), pointer = [...f.tables.Pointer.values()][0];
  let changed = false;
  f.state.onRead = kind => {
    if (kind === "Release" && !changed && [...f.tables.Release.values()].some(r => r.payload.bundleListing)) {
      changed = true; pointer.revision++;
    }
  };
  await assert.rejects(f.publish());
  assert.equal(f.row().evidence.listing.price, undefined);
  assert.equal(f.holds.size, 1);
  assert.equal([...f.tables.Receipt.values()].filter(r => r.publicationCode === f.row().code && r.applied).length, 0);
});

test("configured ceiling is mandatory owner data and later overrides have no service fallback", async t => {
  const f = await setup(t), policy = f.pricing.bundleListings;
  assert.equal(require("../config/properties").pricing.bundleListings.maximumConfiguredBound, 10000);
  for (const value of [undefined, null, 1, 2.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    policy.maximumConfiguredBound = value;
    assert.throws(() => prices.settings(), /not qualified/);
  }
  policy.maximumConfiguredBound = 3; policy.maximumRecords = 4;
  assert.throws(() => prices.settings(), /not qualified/);
  policy.maximumRecords = 3;
  assert.equal((await f.publish()).status, "PUBLISHED");
  policy.maximumConfiguredBound = 12000; policy.maximumRecords = 11000;
  assert.equal(prices.settings().maximumRecords, 11000);
});

test("injected canonical auth factory runs only after owner admission and supplies every retained/pointer/receipt write", async t => {
  const f = await setup(t); f.pricing.bundleListings.enabled = false;
  await assert.rejects(f.publish()); f.pricing.bundleListings.enabled = true;
  const r = { ...f.request(), auth: "original-bearer" }, input = f.input(), original = clone(r);
  const authorize = SERVICE.Authority.authorize;
  let admitted = 0, factoryCalls = 0;
  const issued = { isSystem: true, factoryMarker: "admitted-only" }, writes = [];
  SERVICE.Authority.authorize = async (...args) => { const result = await authorize(...args); admitted++; return result; };
  SERVICE.DefaultIdentityGovernanceService.getSystemAuthData = () => {
    assert.ok(admitted > 0, "canonical auth must follow current original owner admission");
    factoryCalls++; assert.deepEqual(r, original); return issued;
  };
  f.state.afterWrite = (kind, operation, request) => {
    assert.equal(factoryCalls, 1); assert.strictEqual(request.authData, issued);
    assert.deepEqual(r, original); writes.push(kind + ":" + operation);
  };
  await assert.rejects(prices.publish({ ...r, authData: { ...r.authData, loginId: "denied" } }, input), /denied/);
  assert.equal(factoryCalls, 0); assert.equal(writes.length, 0);
  const proof = await prices.publish(r, input);
  assert.deepEqual(writes, ["Release:save", "Receipt:save", "Pointer:update", "Receipt:update"]);
  assert.equal(f.tables.Receipt.get(proof.receiptCode).applied, true);
  assert.ok(admitted >= 3); assert.deepEqual(r, original);
  for (const rows of Object.values(f.tables)) for (const row of rows.values()) {
    assert.equal(JSON.stringify(row).includes("original-bearer"), false);
    assert.equal(JSON.stringify(row).includes("factoryMarker"), false);
  }
});

test("credential pin survives every retained write and pointer CAS; drift stops all subsequent writes", async t => {
  for (const boundary of ["Release:save", "Receipt:save", "Pointer:update", "Receipt:update"]) {
    for (const credential of ["auth", "authorization", "authData", "headers"]) {
      await t.test(boundary + " / " + credential, async child => {
        const f = await setup(child); f.pricing.bundleListings.enabled = false;
        await assert.rejects(f.publish()); f.pricing.bundleListings.enabled = true;
        const r = { ...f.request(), auth: "bearer", authorization: "Bearer original",
          httpRequest: { headers: { authorization: "Bearer original" } } };
        let writesAtDrift;
        f.state.afterWrite = (kind, operation) => {
          if (kind + ":" + operation !== boundary || writesAtDrift !== undefined) return;
          writesAtDrift = f.state.writes;
          if (credential === "authData") r.authData = { ...r.authData, loginId: "foreign" };
          else if (credential === "headers") r.httpRequest.headers.authorization = "Bearer changed";
          else r[credential] = "changed";
        };
        await assert.rejects(prices.publish(r, f.input()), /authority or command changed/);
        assert.notEqual(writesAtDrift, undefined);
        assert.equal(f.state.writes, writesAtDrift, "no write follows observed credential drift");
        assert.equal(f.row().evidence.listing.price, undefined);
        assert.equal(f.holds.size, 1);
      });
    }
  }
});

test("factory-side credential mutation refuses before any Pricing persistence and retired context cannot write", async t => {
  const f = await setup(t); f.pricing.bundleListings.enabled = false;
  await assert.rejects(f.publish()); f.pricing.bundleListings.enabled = true;
  const r = { ...f.request(), auth: "original" }, before = f.state.writes;
  SERVICE.DefaultIdentityGovernanceService.getSystemAuthData = () => { r.auth = "changed"; return { isSystem: true }; };
  await assert.rejects(prices.publish(r, f.input()), /authority or command changed/);
  assert.equal(f.state.writes, before);
  r.auth = "original";
  SERVICE.DefaultIdentityGovernanceService.getSystemAuthData = () => ({ isSystem: true });
  let retainedContext;
  SERVICE.DefaultPricingPublicationService = { ...publication, prepareTarget: async (release, context) => {
    retainedContext = context; return publication.prepareTarget.call(SERVICE.DefaultPricingPublicationService, release, context);
  } };
  await prices.publish(r, f.input());
  const after = f.state.writes;
  await assert.rejects(publication.retain(SERVICE.DefaultPricingPolicyReceiptService,
    { tenant: "tenant", enterpriseCode: "market", code: "forged" }, retainedContext), /retired or changed/);
  assert.equal(f.state.writes, after);
});
