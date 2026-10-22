/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
const crypto = require("node:crypto"), { isDeepStrictEqual } = require("node:util");
/** @module wasteCore/service/defaultWasteCertificateBundleComponentService
 * @description Implements revision-bound certificate holds and staged whole-bundle ownership through existing Waste asset/event CAS owners.
 * @owner wasteCore @layer service @override Domain adapters admit original service authority; persisted locks, ownership and beneficiary invariants remain mandatory.
 */
module.exports = {
  /**
   * Resolves the existing inspected persistence owner.
   * @returns {Object} Effective existing mutation owner; does not itself mutate records.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  operations: function () { return SERVICE.DefaultWasteAssetTransferOperationService; },
  /**
   * Requires the domain's fresh private admission on every phase; serialized inputs cannot provide this callback.
   * @param {Object} r Admitted tenant-scoped request; private admission must remain attached.
   * @returns {void} Admission succeeds without return data; effects and evidence checks are described above.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  authorize: function (r) {
    if (typeof r.validateAuthority !== "function" || r.authData?.tokenType !== "service" || r.authData?.tenant !== r.tenant)
      throw new Error("Admitted certificate component authority is required");
    r.validateAuthority();
  },
  /**
   * Accepts only canonical customer/Enterprise owners.
   * @param {Object} ref Typed canonical reference containing module, schema and code.
   * @returns {Object} Validated canonical beneficiary descriptor; no identity mutation.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  owner: function (ref) {
    if (ref?.module !== "profile" || !["customer", "enterprise"].includes(ref.schema) || typeof ref.code !== "string" || !ref.code)
      throw new Error("Canonical certificate owner is required");
    return { module: ref.module, schema: ref.schema, code: ref.code };
  },
  /**
   * Validates the fixed certificate component and revision.
   * @param {Object} input Operation-specific command or evidence input described above; not authorization.
   * @returns {*} Validates the fixed certificate component and revision.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  component: function (input) {
    const c = input.component;
    if (c?.kind !== "CERTIFICATE" || c.reference?.module !== "wasteCore" || c.reference?.schema !== "wasteAsset" ||
        typeof c.reference.code !== "string" || !/^[A-Za-z0-9_.:@-]{1,192}$/.test(c.reference.code) || c.quantity !== "1" ||
        !Number.isSafeInteger(c.expectedRevision) || c.expectedRevision < 0) throw new Error("Invalid certificate component");
    return c;
  },
  /**
   * Derives a durable event key and immutable source binding, independent of changing actor credentials.
   * @param {Object} r Admitted tenant-scoped request; private admission must remain attached.
   * @param {Object} input Operation-specific command or evidence input described above; not authorization.
   * @returns {*} Derives a durable event key and immutable source binding, independent of changing actor credentials.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  command: function (r, input) {
    const component = this.component(input), ownerRef = this.owner(input.ownerRef);
    if (!input.bundleCode || !Number.isSafeInteger(input.manifestRevision) || input.manifestRevision < 0 ||
        typeof input.operationKey !== "string" || input.operationKey.length > 200 || !input.operationKey ||
        !["LISTING", "GIFT"].includes(input.purpose)) throw new Error("Exact bundle component command is required");
    const command = { tenant: r.tenant, component, ownerRef, bundleCode: input.bundleCode,
      manifestRevision: input.manifestRevision, operationKey: input.operationKey, purpose: input.purpose,
      ...(input.purpose === "GIFT" ? { recipientRef: this.owner(input.recipientRef) } : {}) };
    const hash = value => crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
    return { code: "BUNDLE_COMPONENT_" + hash([r.tenant, input.operationKey]), command, fingerprint: hash(command) };
  },
  /**
   * Reads uncached canonical state without inferring supply from an index.
   * @param {Object} r Admitted tenant-scoped request; private admission must remain attached.
   * @param {Object} input Operation-specific command or evidence input described above; not authorization.
   * @returns {Promise<*>} Reads uncached canonical state without inferring supply from an index.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  inspect: async function (r, input) {
    this.authorize(r);
    const component = this.component(input), ownerRef = this.owner(input.ownerRef);
    const asset = await this.operations().digitalRead(r, "wasteAsset", component.reference.code);
    this.authorize(r);
    return { available: asset?.active === true && [ENUMS.WasteAssetStatus.OWNED.key, ENUMS.WasteAssetStatus.SOLD.key, ENUMS.WasteAssetStatus.GIFTED.key].includes(asset.assetStatus) &&
      !asset.metadata?.pendingTransferCode && !asset.lockRef && isDeepStrictEqual(asset.ownerRef, ownerRef) &&
      (!asset.digitalOwnerRef || isDeepStrictEqual(asset.digitalOwnerRef, ownerRef)), ownerRef: asset?.ownerRef, revision: asset?.revision };
  },
  /**
   * Projects a confirmed event receipt; private asset metadata never crosses the component boundary.
   * @param {Object} event Persisted asset operation event and revision.
   * @param {string} status Canonical lifecycle state to verify or project.
   * @returns {Object} Original persisted event receipt, excluding private asset metadata.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  receipt: function (event, status) {
    const command = event.metadata.bundleComponent.command;
    return { status, operationKey: command.operationKey, reference: command.component.reference, quantity: "1", receiptCode: event.code };
  },
  /**
   * Acquires the shared Waste lock before acknowledging reservation; partial event creation replays from the saved asset checkpoint.
   * @param {Object} r Admitted tenant-scoped request; private admission must remain attached.
   * @param {Object} input Operation-specific command or evidence input described above; not authorization.
   * @returns {Promise<*>} Acquires the shared Waste lock before acknowledging reservation; partial event creation replays from the saved asset checkpoint.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  reserve: async function (r, input) {
    this.authorize(r);
    const op = this.operations(), selected = this.command(r, input);
    let event = await op.digitalRead(r, "wasteAssetOwnershipEvent", selected.code);
    let asset = await op.digitalRead(r, "wasteAsset", selected.command.component.reference.code);
    this.authorize(r);
    if (event) {
      if (event.metadata?.bundleComponent?.fingerprint !== selected.fingerprint || event.metadata.bundleComponent.phase !== ENUMS.WasteCertificateOperationStatus.RESERVED.key ||
          asset?.metadata?.pendingTransferCode !== event.code || asset.assetStatus !== ENUMS.WasteAssetStatus.LOCKED.key) throw new Error("Certificate reservation changed");
      return this.receipt(event, ENUMS.WasteCertificateOperationStatus.RESERVED.key);
    }
    if (asset?.metadata?.pendingTransferCode === selected.code && asset.metadata.pendingTransferEvent?.metadata?.bundleComponent?.fingerprint === selected.fingerprint) {
      event = await op.digitalCreate(r, asset.metadata.pendingTransferEvent);
      return this.receipt(event, ENUMS.WasteCertificateOperationStatus.RESERVED.key);
    }
    const available = await this.inspect(r, input);
    if (!available.available || available.revision !== input.component.expectedRevision) throw new Error("Certificate is unavailable or changed");
    event = { code: selected.code, assetCode: asset.code, fromOwnerRef: selected.command.ownerRef,
      toOwnerRef: selected.command.recipientRef || selected.command.ownerRef,
      transferType: input.purpose === "GIFT" ? "GIFT" : "SELL", transferStatus: ENUMS.WasteCertificateOperationStatus.RESERVED.key, revision: 0,
      occurredAt: new Date(), idempotencyKey: input.operationKey, metadata: { bundleComponent: {
        command: selected.command, fingerprint: selected.fingerprint, phase: ENUMS.WasteCertificateOperationStatus.RESERVED.key, previousStatus: asset.assetStatus } } };
    this.authorize(r);
    await op.digitalUpdate(r, "wasteAsset", asset, { assetStatus: ENUMS.WasteAssetStatus.LOCKED.key,
      metadata: { ...asset.metadata, pendingTransferCode: event.code, pendingTransferEvent: event } });
    this.authorize(r);
    event = await op.digitalCreate(r, event);
    return this.receipt(event, ENUMS.WasteCertificateOperationStatus.RESERVED.key);
  },
  /**
   * Resolves only the original component event, preserving source owner and retained revision.
   * @param {Object} r Admitted tenant-scoped request; private admission must remain attached.
   * @param {Object} input Operation-specific command or evidence input described above; not authorization.
   * @returns {Promise<*>} Resolves only the original component event, preserving source owner and retained revision.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  state: async function (r, input) {
    this.authorize(r);
    const selected = this.command(r, input), op = this.operations();
    let event = await op.digitalRead(r, "wasteAssetOwnershipEvent", selected.code);
    const asset = await op.digitalRead(r, "wasteAsset", selected.command.component.reference.code);
    if (!event && asset?.metadata?.pendingTransferCode === selected.code &&
        asset.metadata.pendingTransferEvent?.metadata?.bundleComponent?.fingerprint === selected.fingerprint)
      event = await op.digitalCreate(r, asset.metadata.pendingTransferEvent);
    this.authorize(r);
    if (!event || event.active !== true || event.metadata?.bundleComponent?.fingerprint !== selected.fingerprint)
      throw new Error("Original certificate operation is unavailable");
    return { event, asset, op };
  },
  /**
   * Fences ownership transfer against release, then changes only digital ownership while retaining the scarce holding lock.
   * @param {Object} r Admitted tenant-scoped request; private admission must remain attached.
   * @param {Object} input Operation-specific command or evidence input described above; not authorization.
   * @returns {Promise<*>} Fences ownership transfer against release, then changes only digital ownership while retaining the scarce holding lock.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  transfer: async function (r, input) {
    let { event, asset, op } = await this.state(r, input);
    const recipientRef = this.owner(input.recipientRef), data = event.metadata.bundleComponent;
    if (isDeepStrictEqual(recipientRef, event.fromOwnerRef)) throw new Error("Same-owner certificate transfer is prohibited");
    if ([ENUMS.WasteCertificateOperationStatus.TRANSFERRED.key, ENUMS.WasteCertificateOperationStatus.COMPLETED.key].includes(data.phase)) {
      if (!isDeepStrictEqual(event.toOwnerRef, recipientRef)) throw new Error("Certificate recipient changed");
      return this.receipt(event, ENUMS.WasteCertificateOperationStatus.TRANSFERRED.key);
    }
    if (![ENUMS.WasteCertificateOperationStatus.RESERVED.key, ENUMS.WasteCertificateOperationStatus.TRANSFERRING.key].includes(data.phase) || asset?.metadata?.pendingTransferCode !== event.code || asset.assetStatus !== ENUMS.WasteAssetStatus.LOCKED.key)
      throw new Error("Certificate transfer lock changed");
    if (data.command.recipientRef && !isDeepStrictEqual(data.command.recipientRef, recipientRef)) throw new Error("Selected gift recipient changed");
    if (data.phase === ENUMS.WasteCertificateOperationStatus.RESERVED.key) event = await op.digitalUpdate(r, "wasteAssetOwnershipEvent", event,
      { toOwnerRef: recipientRef, metadata: { ...event.metadata, bundleComponent: { ...data, phase: ENUMS.WasteCertificateOperationStatus.TRANSFERRING.key } } });
    else if (!isDeepStrictEqual(event.toOwnerRef, recipientRef)) throw new Error("Certificate recipient changed");
    this.authorize(r);
    if (asset.metadata.lastTransferCode !== event.code) {
      if (!isDeepStrictEqual(asset.ownerRef, event.fromOwnerRef)) throw new Error("Certificate seller changed");
      asset = await op.digitalUpdate(r, "wasteAsset", asset, { ownerRef: recipientRef, digitalOwnerRef: recipientRef,
        metadata: { ...asset.metadata, lastTransferCode: event.code } });
    } else if (!isDeepStrictEqual(asset.ownerRef, recipientRef) || !isDeepStrictEqual(asset.digitalOwnerRef, recipientRef))
      throw new Error("Certificate transferred owner changed");
    this.authorize(r);
    event = await op.digitalUpdate(r, "wasteAssetOwnershipEvent", event, {
      metadata: { ...event.metadata, bundleComponent: { ...event.metadata.bundleComponent, phase: ENUMS.WasteCertificateOperationStatus.TRANSFERRED.key } } });
    return this.receipt(event, ENUMS.WasteCertificateOperationStatus.TRANSFERRED.key);
  },
  /**
   * Unlocks only an original transferred holding after Digital confirms the whole manifest. Replays retain original event evidence.
   * @param {Object} r Admitted tenant-scoped request; private admission must remain attached.
   * @param {Object} input Operation-specific command or evidence input described above; not authorization.
   * @returns {Promise<*>} Unlocks only an original transferred holding after Digital confirms the whole manifest. Replays retain original event evidence.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  finalize: async function (r, input) {
    let { event, asset, op } = await this.state(r, input);
    const data = event.metadata.bundleComponent;
    if (data.phase === ENUMS.WasteCertificateOperationStatus.COMPLETED.key) return this.receipt(event, ENUMS.WasteCertificateOperationStatus.COMPLETED.key);
    if (data.phase !== ENUMS.WasteCertificateOperationStatus.TRANSFERRED.key || !isDeepStrictEqual(event.toOwnerRef, this.owner(input.recipientRef)) ||
        !isDeepStrictEqual(asset?.ownerRef, event.toOwnerRef) || asset.metadata.lastTransferCode !== event.code)
      throw new Error("Certificate completion is unconfirmed");
    if (asset.metadata.pendingTransferCode === event.code) {
      if (asset.assetStatus !== ENUMS.WasteAssetStatus.LOCKED.key) throw new Error("Certificate holding lock changed");
      await op.digitalUpdate(r, "wasteAsset", asset, { assetStatus: event.transferType === "GIFT" ? ENUMS.WasteAssetStatus.GIFTED.key : ENUMS.WasteAssetStatus.SOLD.key,
        metadata: { ...asset.metadata, pendingTransferCode: null, pendingTransferEvent: null } });
    } else if (asset.metadata.pendingTransferCode) throw new Error("Another certificate operation owns this lock");
    this.authorize(r);
    event = await op.digitalUpdate(r, "wasteAssetOwnershipEvent", event, { transferStatus: ENUMS.WasteCertificateOperationStatus.COMPLETED.key,
      metadata: { ...event.metadata, bundleComponent: { ...data, phase: ENUMS.WasteCertificateOperationStatus.COMPLETED.key } } });
    return this.receipt(event, ENUMS.WasteCertificateOperationStatus.COMPLETED.key);
  },
  /**
   * Releases only a non-transferred original hold. Transfer/release CAS races cannot unlock an uncertain ownership mutation.
   * @param {Object} r Admitted tenant-scoped request; private admission must remain attached.
   * @param {Object} input Operation-specific command or evidence input described above; not authorization.
   * @returns {Promise<*>} Releases only a non-transferred original hold. Transfer/release CAS races cannot unlock an uncertain ownership mutation.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  release: async function (r, input) {
    let { event, asset, op } = await this.state(r, input);
    let data = event.metadata.bundleComponent;
    if (data.phase === ENUMS.WasteCertificateOperationStatus.RELEASED.key) return this.receipt(event, ENUMS.WasteCertificateOperationStatus.RELEASED.key);
    if (![ENUMS.WasteCertificateOperationStatus.RESERVED.key, ENUMS.WasteCertificateOperationStatus.RELEASING.key].includes(data.phase)) throw new Error("Transferred certificate cannot be released");
    if (data.phase === ENUMS.WasteCertificateOperationStatus.RESERVED.key) {
      event = await op.digitalUpdate(r, "wasteAssetOwnershipEvent", event,
        { metadata: { ...event.metadata, bundleComponent: { ...data, phase: ENUMS.WasteCertificateOperationStatus.RELEASING.key } } });
      data = event.metadata.bundleComponent;
    }
    this.authorize(r);
    if (!isDeepStrictEqual(asset?.ownerRef, event.fromOwnerRef)) throw new Error("Original certificate owner changed");
    if (asset.metadata.pendingTransferCode === event.code) {
      if (asset.assetStatus !== ENUMS.WasteAssetStatus.LOCKED.key) throw new Error("Certificate release lock changed");
      await op.digitalUpdate(r, "wasteAsset", asset, { assetStatus: data.previousStatus,
        metadata: { ...asset.metadata, pendingTransferCode: null, pendingTransferEvent: null } });
    } else if (asset.metadata.pendingTransferCode) throw new Error("Another certificate operation owns this lock");
    this.authorize(r);
    event = await op.digitalUpdate(r, "wasteAssetOwnershipEvent", event, { transferStatus: ENUMS.WasteCertificateOperationStatus.CANCELLED.key,
      metadata: { ...event.metadata, bundleComponent: { ...data, phase: ENUMS.WasteCertificateOperationStatus.RELEASED.key } } });
    return this.receipt(event, ENUMS.WasteCertificateOperationStatus.RELEASED.key);
  },
};
