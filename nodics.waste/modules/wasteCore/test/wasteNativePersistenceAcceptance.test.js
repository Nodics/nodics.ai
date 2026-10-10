/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module wasteCore/test/wasteNativePersistenceAcceptance
 * @description Opt-in real MongoDB Waste owner lock/event qualification. Synthetic inputs contain no financial capture or approved customer policy.
 * @layer test @owner wasteCore
 */
const test = require("node:test"), assert = require("node:assert/strict");
const fixture = require("./helpers/nativePersistenceFixture");
const transfer = require("../src/service/defaultWasteAssetTransferOperationService");
const reversal = require("../src/service/defaultWasteAssetReversalOperationService");
const native = { skip: !process.env.NODICS_WASTE_NATIVE_MONGO_URI };
const ref = code => ({ module: "profile", schema: "customer", code });

/** Synthetic persistence input goes only through the generated owner save, never a raw collection write. */
async function asset(f, code, { unbound = false } = {}) {
  const model = { code, active: true, assetTypeCode: "synthetic_type", sourceSubmissionCode: "synthetic_submission",
    verificationRef: { module: "wasteVerification", schema: "wasteVerification", code: "synthetic_verification" },
    ownerRef: ref("synthetic_seller"), originalOwnerRef: ref("synthetic_seller"), digitalOwnerRef: ref("synthetic_seller"),
    physicalOwnerRef: ref("synthetic_custodian"), custodyStatus: "RECEIVED_BY_OPERATOR", assetStatus: "LISTED",
    ...(!unbound ? { marketplaceProjectionRef: { module: "wasteCore", schema: "wasteAssetMarketplaceProjection", code: "synthetic_projection" } } : {}),
    createdAt: new Date("2026-01-01T00:00:00.123Z"), revision: 0, metadata: {} };
  await SERVICE.DefaultWasteAssetService.save({ ...f.request, model, options: { recursive: false } });
  return transfer.digitalRead(f.request, "wasteAsset", code);
}
function command(assetCode, key) {
  return { assetCode, enterpriseCode: "synthetic_enterprise", ownerId: "synthetic_buyer", idempotencyKey: key,
    orderCode: "synthetic_order", sellerRef: ref("synthetic_seller"), buyerRef: ref("synthetic_buyer"),
    projectionCode: "synthetic_projection", transferPolicyCode: "synthetic_policy" };
}

test("native Waste listing: lost insert/attachment acknowledgements recover original relationship without changing ownership or custody", native, async t => {
  const f = await fixture.create(t, { listing: true }), original = await asset(f, "listing_asset", { unbound: true });
  const owner = require("../src/service/defaultWasteDigitalListingOperationService");
  const c = { tenant: f.tenant, enterpriseCode: "synthetic_enterprise", assetCode: original.code, projectionCode: "synthetic_projection",
    bindingCode: "synthetic_owner_command_not_native_digital_proof", productCode: "synthetic_product", storeCode: "synthetic_store", sku: "synthetic_sku",
    sellerRef: original.ownerRef, expectedAssetRevision: original.revision, transferPolicyCode: "synthetic_transfer",
    rewardSettlementPolicyCode: "synthetic_reward", carbonSettlementPolicyCode: "synthetic_carbon", idempotencyKey: "original_listing",
    custody: { physicalOwnerRef: original.physicalOwnerRef, custodyStatus: original.custodyStatus } };
  const repository = SERVICE.DefaultWasteAssetMarketplaceProjectionService, save = repository.save;
  let lost = true;
  repository.save = async input => { const result = await save(input); if (lost) { lost = false; throw Error("Lost native projection acknowledgement"); } return result; };
  const update = SERVICE.DefaultWasteAssetService.update;
  SERVICE.DefaultWasteAssetService.update = async input => { const result = await update(input); throw Error("Lost native asset attachment acknowledgement"); };
  const result = await owner.complete(f.request, c);
  assert.equal(result.status, "LISTED");
  const attached = await transfer.digitalRead(f.request, "wasteAsset", original.code);
  const projection = await transfer.digitalRead(f.request, "wasteAssetMarketplaceProjection", c.projectionCode);
  assert.equal(attached.revision, original.revision + 1);
  for (const field of ["ownerRef", "digitalOwnerRef", "physicalOwnerRef", "custodyStatus", "metadata", "assetStatus"])
    assert.deepEqual(attached[field], original[field]);
  assert.deepEqual(projection.commerceProductRef, { module: "product", schema: "product", code: c.productCode });
  await f.reconnect();
  assert.deepEqual(await owner.complete(f.request, c), result);
  assert.deepEqual(await transfer.digitalRead(f.request, "wasteAssetMarketplaceProjection", c.projectionCode), projection);
  await assert.rejects(owner.complete(f.request, { ...c, bindingCode: "changed_binding" }), /conflict/);
  assert.equal((await SERVICE.DefaultWasteAssetOwnershipEventService.get({ ...f.request, query: {} })).result.length, 0);
  t.diagnostic("Native Waste relationship persistence only; no Digital binding admission, signed transport, publication or financial proof claimed.");
});

test("native Waste listing: concurrent conflicting commands admit one relationship and cannot replace its original policy", native, async t => {
  const f = await fixture.create(t, { listing: true }), original = await asset(f, "race_listing_asset", { unbound: true });
  const owner = require("../src/service/defaultWasteDigitalListingOperationService");
  const c = { tenant: f.tenant, enterpriseCode: "synthetic_enterprise", assetCode: original.code, projectionCode: "race_projection",
    productCode: "synthetic_product", storeCode: "synthetic_store", sku: "synthetic_sku", sellerRef: original.ownerRef,
    expectedAssetRevision: original.revision, transferPolicyCode: "synthetic_transfer", rewardSettlementPolicyCode: "synthetic_reward",
    carbonSettlementPolicyCode: "synthetic_carbon", idempotencyKey: "original_listing",
    custody: { physicalOwnerRef: original.physicalOwnerRef, custodyStatus: original.custodyStatus } };
  const results = await Promise.allSettled(["first_binding", "second_binding"].map(bindingCode => owner.complete(f.request, { ...c, bindingCode })));
  assert.equal(results.filter(value => value.status === "fulfilled").length, 1);
  assert.equal(results.filter(value => value.status === "rejected").length, 1);
  const saved = await transfer.digitalRead(f.request, "wasteAssetMarketplaceProjection", c.projectionCode);
  await assert.rejects(owner.complete(f.request, { ...saved.metadata.digitalListing.command, transferPolicyCode: "changed" }), /conflict/);
  assert.deepEqual(await transfer.digitalRead(f.request, "wasteAssetMarketplaceProjection", c.projectionCode), saved);
});

test("Waste native fixture refuses non-loopback, credentials, business database and malformed port before connect", () => {
  assert.equal(fixture.validateUri("mongodb://127.0.0.1:27017/?replicaSet=local"), "mongodb://127.0.0.1:27017/?replicaSet=local");
  for (const uri of [undefined, "mongodb://localhost:27017", "mongodb://127.0.0.1:0", "mongodb://127.0.0.1:65536",
    "mongodb://user:secret@127.0.0.1:27017", "mongodb://127.0.0.1:27017/business", "mongodb://remote:27017",
    "mongodb://127.0.0.1:27017/?tls=false", "mongodb://127.0.0.1:27017,remote:27017"])
    assert.throws(() => fixture.validateUri(uri));
});

test("Waste native validator diagnostics disclose field and rule names only", () => {
  const error = fixture.validationError({ code: 121, errInfo: { failingDocumentId: "private-id", details: {
    operatorName: "$jsonSchema", schemaRulesNotSatisfied: [{ operatorName: "properties", propertiesNotSatisfied: [
      { propertyName: "created", details: [{ operatorName: "bsonType", consideredValue: "private-record-value" }] },
    ] }, { operatorName: "required", missingProperties: ["updated"] }] } } });
  assert.equal(error.code, 121);
  assert.match(error.message, /fields=created,updated/);
  assert.match(error.message, /bsonType/);
  assert.equal(JSON.stringify(error).includes("private"), false);
  assert.equal(error.message.includes("private"), false);
});

test("native Waste: actual unique identity, managed CAS, competing reservations, exact replay and custody preservation", native, async t => {
  const f = await fixture.create(t);
  assert.equal(f.settings.eWaste.marketplace.digitalOwnership.enabled, false);
  assert.equal(f.settings.eWaste.marketplace.digitalOwnership.qualified, false);
  await transfer.digitalPersistence(f.request, "wasteAsset");
  await transfer.digitalPersistence(f.request, "wasteAssetOwnershipEvent");
  const original = await asset(f, "race_asset");
  assert.ok(Number.isFinite(Date.parse(original.created)));
  assert.ok(Number.isFinite(Date.parse(original.updated)));
  const contenders = await Promise.allSettled(["first", "second"].map(key => transfer.reserveDigitalSale(f.request, command(original.code, key), 300)));
  assert.equal(contenders.filter(result => result.status === "fulfilled").length, 1);
  assert.equal(contenders.filter(result => result.status === "rejected").length, 1);
  const event = contenders.find(result => result.status === "fulfilled").value;
  assert.deepEqual(await transfer.reserveDigitalSale(f.request, event.metadata.digitalSale.command, 300), event);
  await assert.rejects(transfer.reserveDigitalSale(f.request, { ...event.metadata.digitalSale.command, orderCode: "another_order" }, 300), /command conflict/);
  const locked = await transfer.digitalRead(f.request, "wasteAsset", original.code);
  assert.equal(locked.revision, original.revision + 1);
  assert.equal(locked.assetStatus, "SALE_PENDING");
  assert.deepEqual(locked.physicalOwnerRef, original.physicalOwnerRef);
  assert.equal(locked.custodyStatus, original.custodyStatus);
  assert.equal((await SERVICE.DefaultWasteAssetOwnershipEventService.get({ ...f.request, query: { assetCode: original.code } })).result.length, 1);
  await assert.rejects(transfer.digitalUpdate(f.request, "wasteAsset", original, { assetStatus: "ARCHIVED" }));
  await assert.rejects(transfer.completeDigitalSale(f.request, event, {}), /Captured digital-sale settlement is required/);
  assert.equal(reversal.digitalEligible(locked, event), false);
  await assert.rejects(reversal.prepareDigital(f.request, event, { saleCode: event.code,
    orderCode: event.metadata.digitalSale.command.orderCode, refundCode: "unapproved_refund" }), /moved or is locked/);
  await f.reconnect();
  assert.deepEqual(await transfer.digitalRead(f.request, "wasteAsset", original.code), locked);
  assert.deepEqual(await transfer.digitalRead(f.request, "wasteAssetOwnershipEvent", event.code), event);
  await transfer.cancelDigitalSale(f.request, event);
  const released = await transfer.digitalRead(f.request, "wasteAsset", original.code);
  assert.equal(released.assetStatus, "LISTED");
  assert.equal(released.metadata.pendingTransferCode, null);
  assert.deepEqual(released.ownerRef, original.ownerRef);
  assert.deepEqual(released.physicalOwnerRef, original.physicalOwnerRef);
  assert.equal(released.custodyStatus, original.custodyStatus);
  t.diagnostic("Native Waste lock/event CAS, single winner, immutable replay, reconnect and cancellation proven; no capture, sale, signed service, refund or business-policy qualification claimed.");
});

test("native Waste: uncertain lock and event acknowledgements recover the original command, not replacement events", native, async t => {
  const f = await fixture.create(t);
  const original = await asset(f, "recovery_asset"), c = command(original.code, "original_recovery");
  const repository = SERVICE.DefaultWasteAssetOwnershipEventService, save = repository.save;
  const assetRepository = SERVICE.DefaultWasteAssetService, update = assetRepository.update;
  let lostLockAcknowledgement = true;
  assetRepository.update = async input => {
    const result = await update(input);
    if (lostLockAcknowledgement) { lostLockAcknowledgement = false; throw new Error("Asset lock acknowledgement lost after durable CAS"); }
    return result;
  };
  let failBefore = true, failAfter = true;
  repository.save = async input => {
    if (failBefore) { failBefore = false; throw new Error("Interrupted before event insert"); }
    const result = await save(input);
    if (failAfter) { failAfter = false; throw new Error("Event acknowledgement lost after durable insert"); }
    return result;
  };
  await assert.rejects(transfer.reserveDigitalSale(f.request, c, 300), /Interrupted before event insert/);
  const lock = await transfer.digitalRead(f.request, "wasteAsset", original.code);
  assert.equal(lock.assetStatus, "SALE_PENDING");
  assert.ok(lock.metadata.pendingTransferEvent);
  assert.equal((await repository.get({ ...f.request, query: {} })).result.length, 0);
  await f.reconnect();
  const recovered = await transfer.reserveDigitalSale(f.request, c, 300);
  assert.equal(recovered.code, lock.metadata.pendingTransferCode);
  assert.deepEqual(recovered.metadata.digitalSale.command, c);
  assert.equal((await repository.get({ ...f.request, query: {} })).result.length, 1);
  assert.deepEqual(await transfer.reserveDigitalSale(f.request, c, 300), recovered);
  await assert.rejects(transfer.digitalCreate(f.request, { ...recovered, idempotencyKey: "replacement" }));
  assert.deepEqual(await transfer.digitalRead(f.request, "wasteAssetOwnershipEvent", recovered.code), recovered);
  await transfer.cancelDigitalSale(f.request, recovered);
});

test("native Waste: native validators refuse invalid asset states and unsupported transactions cannot write", native, async t => {
  const f = await fixture.create(t), original = await asset(f, "transaction_asset");
  await assert.rejects(SERVICE.DefaultWasteAssetService.update({ ...f.request,
    query: { code: original.code, revision: original.revision }, model: { assetStatus: "INVENTED_STATE", revision: original.revision } }));
  for (const schema of ["wasteAsset", "wasteAssetOwnershipEvent"])
    assert.throws(() => SERVICE.DefaultDatabaseTransactionService.assertSchemaEligible(f.models[schema]), /not enabled for database transactions/);
  const commandCount = f.commands.length;
  await assert.rejects(SERVICE.DefaultDatabaseTransactionService.execute({ moduleName: "wasteCore", tenant: f.tenant }, async transactionContext => {
    await transfer.reserveDigitalSale({ ...f.request, transactionContext }, command(original.code, "rollback"), 300);
    assert.fail("An unsupported transactional reservation must not complete");
  }));
  assert.equal(f.commands.slice(commandCount).some(value => ["insert", "update", "findAndModify"].includes(value.name)), false);
  assert.deepEqual(await transfer.digitalRead(f.request, "wasteAsset", original.code), original);
  assert.equal((await SERVICE.DefaultWasteAssetOwnershipEventService.get({ ...f.request, query: {} })).result.length, 0);
  const reserved = await transfer.reserveDigitalSale(f.request, command(original.code, "journaled_commit"), 300);
  assert.equal((await transfer.digitalRead(f.request, "wasteAsset", original.code)).assetStatus, "SALE_PENDING");
  await transfer.cancelDigitalSale(f.request, reserved);
  t.diagnostic("Waste intentionally uses journaled lock/event recovery, not multi-record transactions. Unsupported transaction contexts refuse before native writes.");
});
