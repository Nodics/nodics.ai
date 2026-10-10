/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
const crypto = require("node:crypto");
const { isDeepStrictEqual } = require("node:util");
/** @module wasteCore/service/defaultWasteAssetTransferOperationService @description Persists ownership transfer state and optimistic asset locks without owning wallet or payment data. @layer service @owner wasteCore */
module.exports = {
  /** Resolves generated Waste repositories. */
  store: function () {
    return SERVICE.DefaultWastePersistenceService;
  },
  /** Derives one event identity from an authenticated command. */
  eventCode: function (request) {
    return (
      "TRANSFER_" +
      crypto
        .createHash("sha256")
        .update(request.actorRef.code + ":" + request.idempotencyKey)
        .digest("hex")
        .slice(0, 24)
        .toUpperCase()
    );
  },
  /** Locks an eligible asset before external settlement; replays use the recorded command. */
  begin: async function (request) {
    const store = this.store(),
      code = this.eventCode(request),
      asset = await store.one("wasteAsset", request, request.assetCode);
    const fingerprint = crypto
      .createHash("sha256")
      .update(
        JSON.stringify({
          assetCode: request.assetCode,
          type: request.transferType,
          to: request.toOwnerRef,
          price: request.rewardPrice || 0,
        }),
      )
      .digest("hex");
    let event = await store.one("wasteAssetOwnershipEvent", request, code);
    if (event) {
      if (event.metadata.fingerprint !== fingerprint)
        store.fail(
          "ERR_WASTE_COMMAND_CONFLICT",
          "This command was already used for different details",
        );
      return { asset, event };
    }
    if (!asset) store.fail("ERR_WASTE_RECORD_NOT_FOUND", "Asset not found");
    if (
      asset.metadata &&
      asset.metadata.pendingTransferCode === code &&
      asset.metadata.pendingTransferEvent
    ) {
      const saved = asset.metadata.pendingTransferEvent;
      if (saved.metadata.fingerprint !== fingerprint)
        store.fail(
          "ERR_WASTE_COMMAND_CONFLICT",
          "This command was already used for different details",
        );
      event = await store.create(
        "wasteAssetOwnershipEvent",
        request,
        Object.assign({}, saved, { occurredAt: new Date(saved.occurredAt) }),
      );
      return { asset, event };
    }
    if (request.transferType === "GIFT")
      store.owned(asset, request.actorRef, "ownerRef");
    if (asset.ownerRef.code === request.toOwnerRef.code)
      store.fail("ERR_WASTE_SELF_TRANSFER", "Choose a different recipient");
    store.revision(asset, request.expectedRevision);
    const allowed =
      request.transferType === "SELL"
        ? ["LISTED"]
        : ["OWNED", "SOLD", "GIFTED"];
    if (!allowed.includes(asset.assetStatus))
      store.fail(
        "ERR_WASTE_ASSET_BUSY",
        "This asset is not available for this action",
      );
    const eventModel = {
      code,
      assetCode: asset.code,
      fromOwnerRef: asset.ownerRef,
      toOwnerRef: request.toOwnerRef,
      transferType: request.transferType,
      transferStatus: "RESERVED",
      policyCode: request.policyCode,
      occurredAt: new Date(),
      idempotencyKey: request.idempotencyKey,
      revision: 0,
      metadata: {
        fingerprint,
        rewardPrice: request.rewardPrice || 0,
        carbonUnits: Number(
          (asset.metadata && asset.metadata.illustrativeCarbonUnits) || 0,
        ),
        previousStatus: asset.assetStatus,
        offer: request.offer,
      },
    };
    const locked = await store.update("wasteAsset", request, asset, {
      assetStatus:
        request.transferType === "SELL" ? "SALE_PENDING" : "GIFT_PENDING",
      metadata: Object.assign({}, asset.metadata, {
        pendingTransferCode: code,
        pendingTransferEvent: eventModel,
      }),
    });
    event = await store.create("wasteAssetOwnershipEvent", request, eventModel);
    return { asset: locked, event };
  },
  /** Commits ownership after the owning payment and reward services acknowledge settlement. */
  complete: async function (request) {
    const store = this.store(),
      event = await store.one(
        "wasteAssetOwnershipEvent",
        request,
        request.eventCode,
      );
    if (!event)
      store.fail("ERR_WASTE_TRANSFER_NOT_FOUND", "Transfer not found");
    if (event.transferStatus === "COMPLETED") return event;
    let asset = await store.one("wasteAsset", request, event.assetCode);
    if (asset.metadata.pendingTransferCode !== event.code)
      store.fail("ERR_WASTE_TRANSFER_CONFLICT", "Asset transfer changed");
    if (asset.ownerRef.code !== event.toOwnerRef.code)
      asset = await store.update("wasteAsset", request, asset, {
        ownerRef: event.toOwnerRef,
        digitalOwnerRef: event.toOwnerRef,
        assetStatus: event.transferType === "SELL" ? "SOLD" : "GIFTED",
        metadata: Object.assign({}, asset.metadata, {
          lastTransferCode: event.code,
        }),
      });
    return store.update("wasteAssetOwnershipEvent", request, event, {
      transferStatus: "COMPLETED",
      commerceOrderRef: request.commerceOrderRef,
      paymentRef: request.paymentRef,
      carbonSettlementRefs: request.carbonSettlementRefs || [],
      rewardSettlementRefs: request.rewardSettlementRefs || [],
    });
  },
  /** Reads one uncached digital-sale record through generated persistence; failed envelopes and ambiguous identities refuse. */
  digitalRead: async function (r, schema, code) {
    const response = await this.store().repository(schema).get({
      ...this.store().context(r), query: { code },
      searchOptions: { pageSize: 2, pageNumber: 1 }, options: { recursive: false, skipItemCache: true },
    });
    if (!response || !/^SUC_/.test(response.code || "") || response.success === false || response.error ||
        response.acknowledged === false || (response.errors && (!Array.isArray(response.errors) || response.errors.length)))
      throw new Error("Waste digital-sale read is unconfirmed");
    const rows = this.store().records(response);
    if (rows.length > 1 || (response.count !== undefined && response.count !== rows.length) || rows.some(row => row.code !== code))
      throw new Error("Waste digital-sale identity is ambiguous");
    return rows[0];
  },
  /** Requires the installed generated CAS and unique code identity, rather than trusting a qualification flag. */
  digitalPersistence: async function (r, schema) {
    const model = (NODICS.getModels("wasteCore", r.tenant) || {})[UTILS.createModelName(schema)];
    if (!model || model.versioned === true || model.primaryKey !== "code" || typeof model.compareAndSetItem !== "function")
      throw new Error("Waste digital-sale persistence is not qualified");
    const indexes = await SERVICE.DefaultDatabaseModelHandlerService.inspectIndexes(model);
    if (indexes?.versioned !== false || !indexes?.indexes?.some(index => index.unique === true && !index.sparse && !index.partialFilterExpression &&
        (!index.collation || index.collation.locale === "simple") && index.key?.code === 1 &&
        Object.keys(index.key).every(key => ["tenant", "code"].includes(key))))
      throw new Error("Waste digital-sale unique identity is unavailable");
    const field = SERVICE.DefaultModelConcurrencyService.getField(model.rawSchema);
    if ((schema === "wasteAsset" && field !== "revision") || (field !== undefined && field !== "revision"))
      throw new Error("Waste digital-sale revision owner is unavailable");
    return field;
  },
  /** Writes one revision-guarded patch; lost acknowledgement is accepted only after exact successor readback. Never retries a write. */
  digitalUpdate: async function (r, schema, current, patch) {
    const managed = await this.digitalPersistence(r, schema);
    if (!current || !Number.isSafeInteger(current.revision) || !Number.isSafeInteger(current.revision + 1))
      throw new Error("Waste digital-sale revision is unavailable");
    const intended = { ...patch, code: current.code, revision: current.revision + 1 };
    try {
      const response = await this.store().repository(schema).update({
        ...this.store().context(r), query: { code: current.code, revision: current.revision },
        model: { ...intended, revision: managed ? current.revision : intended.revision }, options: { recursive: false },
      });
      if (!/^SUC_/.test(response?.code || "") || response.result?.matchedCount !== 1)
        throw new Error("Waste digital-sale CAS is unconfirmed");
    } catch (error) {
      const saved = await this.digitalRead(r, schema, current.code);
      if (!saved || Object.keys(intended).some(key => !isDeepStrictEqual(saved[key], intended[key]))) throw error;
      return saved;
    }
    const saved = await this.digitalRead(r, schema, current.code);
    if (!saved || Object.keys(intended).some(key => !isDeepStrictEqual(saved[key], intended[key])))
      throw new Error("Waste digital-sale successor is unconfirmed");
    return saved;
  },
  /** Creates the original ownership event insert-only, recovering only the exact recorded event after an uncertain acknowledgement. */
  digitalCreate: async function (r, model) {
    await this.digitalPersistence(r, "wasteAssetOwnershipEvent");
    const matches = saved => saved?.active === true && Object.keys(model).every(key => isDeepStrictEqual(saved[key], model[key]));
    try {
      const response = await this.store().repository("wasteAssetOwnershipEvent").save({
        ...this.store().context(r), query: { code: model.code }, model: { active: true, ...model },
        options: { insertOnly: true, recursive: false },
      });
      if (!/^SUC_/.test(response?.code || "")) throw new Error("Waste transfer creation is unconfirmed");
    } catch (error) {
      const saved = await this.digitalRead(r, "wasteAssetOwnershipEvent", model.code);
      if (!matches(saved)) throw error;
      return saved;
    }
    const saved = await this.digitalRead(r, "wasteAssetOwnershipEvent", model.code);
    if (!matches(saved)) throw new Error("Waste transfer creation is unconfirmed");
    return saved;
  },
  /** Derives the stable digital event identity for reservation and original-command recovery. */
  digitalEventCode: function (r, command) {
    return "TRANSFER_" + crypto.createHash("sha256").update(JSON.stringify([r.tenant, command.enterpriseCode, command.ownerId, command.idempotencyKey])).digest("hex").slice(0, 32).toUpperCase();
  },
  /** Reserves one verified digital-only sale using the existing asset lock and ownership-event authority. */
  reserveDigitalSale: async function (r, command, reservationSeconds) {
    if (r.authData?.principalType !== "service" || !Number.isSafeInteger(reservationSeconds) || reservationSeconds < 1 || reservationSeconds > 86400)
      throw new Error("Qualified digital-sale reservation policy is required");
    const code = this.digitalEventCode(r, command);
    let asset = await this.digitalRead(r, "wasteAsset", command.assetCode);
    let event = await this.digitalRead(r, "wasteAssetOwnershipEvent", code);
    if (event) {
      if (!isDeepStrictEqual(event.metadata?.digitalSale?.command, command)) throw new Error("Digital-sale command conflict");
      return event;
    }
    const pending = asset?.metadata?.pendingTransferEvent;
    if (asset?.metadata?.pendingTransferCode === code && pending?.metadata?.digitalSale) {
      if (!isDeepStrictEqual(pending.metadata.digitalSale.command, command)) throw new Error("Digital-sale command conflict");
      return this.digitalCreate(r, pending);
    }
    if (!asset || asset.active !== true || asset.assetStatus !== "LISTED" || asset.metadata?.pendingTransferCode ||
        !isDeepStrictEqual(asset.ownerRef, command.sellerRef) || isDeepStrictEqual(command.sellerRef, command.buyerRef) ||
        !isDeepStrictEqual(asset.marketplaceProjectionRef, { module: "wasteCore", schema: "wasteAssetMarketplaceProjection", code: command.projectionCode }))
      throw new Error("Digital asset is unavailable");
    const occurredAt = new Date().toISOString();
    event = { code, assetCode: asset.code, fromOwnerRef: command.sellerRef, toOwnerRef: command.buyerRef,
      transferType: "SELL", transferStatus: "RESERVED", policyCode: command.transferPolicyCode,
      commerceOrderRef: { module: "order", schema: "commerceOrder", code: command.orderCode },
      commerceProjectionRef: asset.marketplaceProjectionRef, occurredAt, idempotencyKey: command.idempotencyKey, revision: 0,
      metadata: { digitalSale: { version: 1, command, expiresAt: new Date(Date.parse(occurredAt) + reservationSeconds * 1000).toISOString() } } };
    await this.digitalUpdate(r, "wasteAsset", asset, { assetStatus: "SALE_PENDING",
      metadata: { ...asset.metadata, pendingTransferCode: code, pendingTransferEvent: event } });
    return this.digitalCreate(r, event);
  },
  /** Fences settlement against cancellation before any ledger write; original capture evidence is immutable and survives uncertain outcomes. */
  prepareDigitalSettlement: async function (r, event, capture) {
    const current = await this.digitalRead(r, "wasteAssetOwnershipEvent", event.code);
    if (!current || !isDeepStrictEqual(current.metadata?.digitalSale?.command, event.metadata?.digitalSale?.command))
      throw new Error("Digital sale cannot settle");
    event = current;
    if (event.transferStatus !== "RESERVED" || !event.metadata?.digitalSale || event.metadata.digitalSale.compensationRecovery)
      throw new Error("Digital sale cannot settle");
    const retained = event.metadata.digitalSale.capture;
    if (retained) {
      if (!isDeepStrictEqual(retained, capture)) throw new Error("Original captured payment changed");
      return event;
    }
    if (Date.parse(event.metadata.digitalSale.expiresAt) <= Date.now()) throw new Error("Digital reservation expired; inspect payment before release");
    return this.digitalUpdate(r, "wasteAssetOwnershipEvent", event, {
      metadata: { ...event.metadata, digitalSale: { ...event.metadata.digitalSale, capture } },
    });
  },
  /** Cancels only after the coordinator proves terminal uncaptured payment. Time alone never releases scarce ownership. */
  cancelDigitalSale: async function (r, event) {
    if (!event?.metadata?.digitalSale || event.metadata.digitalSale.capture || event.metadata.digitalSale.compensationRecovery ||
        !["RESERVED", "CANCELLED", "EXPIRED"].includes(event.transferStatus))
      throw new Error("Digital sale requires settlement recovery, not release");
    if (event.transferStatus === "RESERVED") event = await this.digitalUpdate(r, "wasteAssetOwnershipEvent", event, {
      transferStatus: Date.parse(event.metadata.digitalSale.expiresAt) <= Date.now() ? "EXPIRED" : "CANCELLED",
    });
    const asset = await this.digitalRead(r, "wasteAsset", event.assetCode);
    if (asset?.metadata?.pendingTransferCode === event.code) {
      if (asset.assetStatus !== "SALE_PENDING" || !isDeepStrictEqual(asset.ownerRef, event.fromOwnerRef)) throw new Error("Digital cancellation lock changed");
      await this.digitalUpdate(r, "wasteAsset", asset, { assetStatus: "LISTED", metadata: {
        ...asset.metadata, pendingTransferCode: null, pendingTransferEvent: null,
      } });
    } else if (asset?.assetStatus !== "LISTED" || !isDeepStrictEqual(asset.ownerRef, event.fromOwnerRef)) {
      throw new Error("Digital release evidence is unconfirmed");
    }
    return event;
  },
  /** Reads only an unfenced original reservation or this exact cancellation fence; financial proof remains with the coordinator. */
  digitalCompensationState: async function (r, event) {
    const current = await this.digitalRead(r, "wasteAssetOwnershipEvent", event.code), d = current?.metadata?.digitalSale, c = d?.command;
    const marker = d?.compensationRecovery;
    if (current?.active !== true || (current.tenant !== undefined && current.tenant !== r.tenant) ||
        !c || c.tenant !== r.tenant || c.enterpriseCode !== r.enterpriseCode ||
        !isDeepStrictEqual(c, event.metadata?.digitalSale?.command) || current.transferType !== "SELL" || current.assetCode !== c.assetCode ||
        !isDeepStrictEqual(current.fromOwnerRef, c.sellerRef) || !isDeepStrictEqual(current.toOwnerRef, c.buyerRef) ||
        !isDeepStrictEqual(current.commerceOrderRef, { module: "order", schema: "commerceOrder", code: c.orderCode }) ||
        d.version !== 1 || d.capture !== undefined || d.settlement !== undefined || d.completedAt !== undefined || current.paymentRef ||
        (current.rewardSettlementRefs !== undefined && (!Array.isArray(current.rewardSettlementRefs) || current.rewardSettlementRefs.length)) ||
        (current.carbonSettlementRefs !== undefined && (!Array.isArray(current.carbonSettlementRefs) || current.carbonSettlementRefs.length)) ||
        !Number.isSafeInteger(current.revision) || current.revision < 0 ||
        (marker === undefined ? current.transferStatus !== "RESERVED" : current.transferStatus !== "CANCELLED" ||
          marker?.contractVersion !== 1 || !["FENCED", "COMPLETED"].includes(marker.status) || !marker.proof || !marker.custody))
      throw new Error("Digital sale requires settlement recovery, not release");
    const asset = await this.digitalRead(r, "wasteAsset", c.assetCode);
    const custody = asset && { physicalOwnerRef: asset.physicalOwnerRef ?? null, custodyStatus: asset.custodyStatus ?? null,
      digitalOwnerRef: asset.digitalOwnerRef ?? null };
    const locked = asset?.assetStatus === "SALE_PENDING" && asset.metadata?.pendingTransferCode === current.code &&
      isDeepStrictEqual(asset.metadata?.pendingTransferEvent?.metadata?.digitalSale?.command, c);
    const released = marker && asset?.assetStatus === "LISTED" && !asset.metadata?.pendingTransferCode && !asset.metadata?.pendingTransferEvent &&
      asset.metadata?.lastDigitalCompensationCode === current.code;
    if (asset?.active !== true || (asset.tenant !== undefined && asset.tenant !== r.tenant) ||
        !Number.isSafeInteger(asset.revision) || asset.revision < 0 || !isDeepStrictEqual(asset.ownerRef, c.sellerRef) ||
        !isDeepStrictEqual(asset.digitalOwnerRef, c.sellerRef) ||
        asset.metadata?.pendingRefundCode || asset.metadata?.pendingRefundEvent || asset.metadata?.lastTransferCode === current.code ||
        (!locked && !released) || (marker && (!isDeepStrictEqual(marker.custody, custody) ||
          !Number.isSafeInteger(marker.assetRevision) || !Number.isSafeInteger(marker.eventRevision) ||
          asset.revision !== marker.assetRevision + (released ? 1 : 0) ||
          current.revision !== marker.eventRevision + (marker.absence ? 1 : 0) + (marker.status === "COMPLETED" ? 1 : 0))))
      throw new Error("Digital cancellation lock changed");
    return { event: current, asset, custody };
  },
  /** CAS cancellation wins against capture before absence reads. Uncertainty retains the scarce-asset lock and immutable financial audit. */
  fenceDigitalCompensation: async function (r, event, proof) {
    const state = await this.digitalCompensationState(r, event), retained = state.event.metadata.digitalSale.compensationRecovery;
    if (retained) {
      if (!isDeepStrictEqual(retained.proof, proof)) throw new Error("Original digital compensation changed");
      return state.event;
    }
    if (proof?.contractVersion !== 1 || proof.reservationCode !== event.code || proof.checkoutIdempotencyKey !== state.event.metadata.digitalSale.command.checkoutIdempotencyKey ||
        !proof.capture?.paymentRef?.code || !proof.refundRef?.code || !proof.refundLedgerCode || !/^[a-f0-9]{64}$/.test(proof.commandDigest || ""))
      throw new Error("Original digital compensation is unconfirmed");
    return this.digitalUpdate(r, "wasteAssetOwnershipEvent", state.event, { transferStatus: "CANCELLED",
      metadata: { ...state.event.metadata, digitalSale: { ...state.event.metadata.digitalSale,
        compensationRecovery: { contractVersion: 1, status: "FENCED", proof: structuredClone(proof), custody: state.custody,
          assetRevision: state.asset.revision, eventRevision: state.event.revision + 1 } } } });
  },
  /** Clears only this fenced original lock after coordinator-owned absence proof; replay retains audit and never changes owners/custody. */
  completeDigitalCompensation: async function (r, event, proof, absence) {
    let state = await this.digitalCompensationState(r, event);
    const marker = state.event.metadata.digitalSale.compensationRecovery;
    if (!marker || !isDeepStrictEqual(marker.proof, proof) || absence?.contractVersion !== 1 || absence.reservationCode !== event.code ||
        absence.entitlementCount !== 0 || absence.sellerEarningCount !== 0 || !absence.sellerWalletCode ||
        absence.earningIdempotencyKey !== event.code + ":sale-proceeds" || (marker.absence && !isDeepStrictEqual(marker.absence, absence)))
      throw new Error("Digital compensation absence is unconfirmed");
    if (!marker.absence) {
      await this.digitalUpdate(r, "wasteAssetOwnershipEvent", state.event, { metadata: { ...state.event.metadata,
        digitalSale: { ...state.event.metadata.digitalSale, compensationRecovery: { ...marker, absence: structuredClone(absence) } } } });
      state = await this.digitalCompensationState(r, event);
    }
    if (state.asset.metadata?.pendingTransferCode === event.code) {
      await this.digitalUpdate(r, "wasteAsset", state.asset, { assetStatus: "LISTED", metadata: { ...state.asset.metadata,
        pendingTransferCode: null, pendingTransferEvent: null, lastDigitalCompensationCode: event.code } });
      state = await this.digitalCompensationState(r, event);
    }
    const saved = state.event.metadata.digitalSale.compensationRecovery;
    if (saved.status !== "COMPLETED") await this.digitalUpdate(r, "wasteAssetOwnershipEvent", state.event, { metadata: { ...state.event.metadata,
      digitalSale: { ...state.event.metadata.digitalSale, compensationRecovery: { ...saved, status: "COMPLETED" } } } });
    return (await this.digitalCompensationState(r, event)).event;
  },
  /** Commits digital ownership only after captured payment and verified original ledger evidence. Physical owner/custody remain unchanged. */
  completeDigitalSale: async function (r, event, settlement) {
    if (event.transferStatus === "COMPLETED") {
      if (!isDeepStrictEqual(event.metadata.digitalSale.settlement, settlement)) throw new Error("Original settlement changed");
    }
    if (!["RESERVED", "COMPLETED"].includes(event.transferStatus) || !event.metadata?.digitalSale?.capture) throw new Error("Captured digital-sale settlement is required");
    if (!event.metadata.digitalSale.settlement) event = await this.digitalUpdate(r, "wasteAssetOwnershipEvent", event, {
      metadata: { ...event.metadata, digitalSale: { ...event.metadata.digitalSale, settlement } },
    });
    else if (!isDeepStrictEqual(event.metadata.digitalSale.settlement, settlement)) throw new Error("Original settlement changed");
    let asset = await this.digitalRead(r, "wasteAsset", event.assetCode);
    if (asset?.metadata?.lastTransferCode !== event.code) {
      if (asset?.metadata?.pendingTransferCode !== event.code) throw new Error("Digital-sale lock changed");
      if (asset.assetStatus !== "SALE_PENDING" || !isDeepStrictEqual(asset.ownerRef, event.fromOwnerRef)) throw new Error("Digital-sale seller changed");
      asset = await this.digitalUpdate(r, "wasteAsset", asset, { ownerRef: event.toOwnerRef, digitalOwnerRef: event.toOwnerRef, assetStatus: "LOCKED",
        metadata: { ...asset.metadata, lastTransferCode: event.code, digitalSaleCompletedAt: new Date().toISOString() } });
    } else if (!["LOCKED", "SOLD"].includes(asset.assetStatus) || !isDeepStrictEqual(asset.ownerRef, event.toOwnerRef) ||
        !isDeepStrictEqual(asset.digitalOwnerRef, event.toOwnerRef)) throw new Error("Digital-sale completion changed");
    if (event.transferStatus !== "COMPLETED") {
      if (!Number.isFinite(Date.parse(asset.metadata.digitalSaleCompletedAt))) throw new Error("Original ownership timestamp is unavailable");
      event = await this.digitalUpdate(r, "wasteAssetOwnershipEvent", event, { transferStatus: "COMPLETED",
        metadata: { ...event.metadata, digitalSale: { ...event.metadata.digitalSale, completedAt: asset.metadata.digitalSaleCompletedAt } },
        rewardSettlementRefs: settlement.rewardSettlementRefs, carbonSettlementRefs: settlement.carbonSettlementRefs });
    }
    if (asset.assetStatus === "LOCKED" && asset.metadata.pendingTransferCode === event.code)
      await this.digitalUpdate(r, "wasteAsset", asset, { assetStatus: "SOLD",
        metadata: { ...asset.metadata, pendingTransferCode: null, pendingTransferEvent: null } });
    return this.verifyDigitalSale(r, event);
  },
  /** Verifies current ownership and original event evidence; an onward transfer/refund cannot masquerade as delivery replay. */
  verifyDigitalSale: async function (r, event) {
    const asset = await this.digitalRead(r, "wasteAsset", event.assetCode);
    const d = event.metadata?.digitalSale;
    if (event.active !== true || event.transferStatus !== "COMPLETED" || !d?.capture || !d.settlement ||
        !Number.isFinite(Date.parse(d.completedAt)) || d.completedAt !== asset?.metadata?.digitalSaleCompletedAt ||
        !isDeepStrictEqual(event.rewardSettlementRefs, d.settlement.rewardSettlementRefs) ||
        !isDeepStrictEqual(event.carbonSettlementRefs, d.settlement.carbonSettlementRefs) ||
        asset?.active !== true || asset.metadata?.pendingTransferCode || asset.metadata?.pendingTransferEvent ||
        asset?.assetStatus !== "SOLD" || asset.metadata?.lastTransferCode !== event.code ||
        !isDeepStrictEqual(asset.ownerRef, event.toOwnerRef) || !isDeepStrictEqual(asset.digitalOwnerRef, event.toOwnerRef))
      throw new Error("Digital ownership delivery is unconfirmed");
    return event;
  },
};
