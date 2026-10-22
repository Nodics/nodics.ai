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
const configuration = require("../utils/configuration");

/**
 * @module digitalCore/service/defaultDigitalBundleService
 * @description Persists immutable holdings manifests and revision-fenced whole-bundle operations
 * through generated Digital repositories.
 * Component owners retain scarce holdings and transfer evidence. Errors preserve original recovery
 * state.
 * @owner digitalCore
 * @layer service
 * @override Later layers select qualified component services in framework-defined bundles properties.
 * @remarks Digital bundles own immutable manifests and revision-fenced whole-component operations.
 * Component owners retain certificate/carbon locks and receipts; no rewards/coupons enter a manifest.
 * Transfer/release requires an already persisted coordinator fence, and installed uniqueness/CAS is
 * separately qualified.
 * Inputs and outputs are specified on each exported member below.
 * Effects and failures remain in the existing owner flow; missing evidence is never synthetic success.
 * Exported members: settings, digest, commandKey, owner, scope, authorize, provider, components, read,
 * participantOperation, insert, persistence, assertSuccessor, update, manifest, create, reserve,
 * componentsPhase, operationManifest, transfer, release.
 * @override Customize through the existing loader-visible module members, preserving private
 * authority.
 */
module.exports = {
  /**
   * Reads and validates complete framework configuration; missing dependencies do not imply
   * qualification.
   * @returns {Object} Complete validated bundle mechanics/provider policy.
   * @remarks Effects: Reads implementing properties; does not qualify providers.
   * Failure behavior: Rejects invalid component/page/expiry limits or missing definitions.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  settings: function () {
    const p = CONFIG.get("digitalCore")?.bundles;
    if (!p || ![p.maximumComponents, p.giftPageSize, p.maximumGiftPageSize].every(value => configuration.integer(value, p.validation?.capacity)) ||
        p.maximumGiftPageSize < p.giftPageSize ||
        !p.componentProviders || typeof p.enterpriseGiftingEnabled !== "boolean" ||
        typeof p.enterpriseReceivingEnabled !== "boolean" ||
        (p.giftExpirySeconds !== null && !configuration.integer(p.giftExpirySeconds, p.validation?.giftExpirySeconds)))
      throw new Error("Invalid Digital bundle configuration");
    return p;
  },
  /**
   * Creates deterministic command identities without exposing principal or component names.
   * @param {*} value Value being validated, normalized or hashed according to this member's contract.
   * @returns {string} Stable SHA-256 command/content identity.
   * @remarks Effects: Pure serialization/hash; no principal names appear in generated public codes.
   * Failure behavior: Unsupported serialization errors propagate.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  digest: function (value) { return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex"); },
  /**
   * Validates one opaque intake or recovery key against the effective owner policy.
   * @param {string} value Original caller key; preserved byte-for-byte for deterministic identities.
   * @returns {string} The unchanged valid key. No persistence or holdings effects.
   * @throws {Error} When policy is absent/invalid or the key is blank or exceeds its bound.
   * @override All manifest, operation and recovery paths dispatch through this member.
   */
  commandKey: function (value) {
    const maximum = this.settings().commandRecovery?.maximumKeyLength;
    if (!Number.isSafeInteger(maximum) || maximum < 1 || typeof value !== "string" ||
        !value.trim() || value.length > maximum) throw new Error("Original bundle command reference is required");
    return value;
  },
  /**
   * Validates canonical Profile references, retaining owner kind in same-owner comparisons.
   * @param {*} value Value being validated, normalized or hashed according to this member's contract.
   * @returns {Object} Normalized canonical typed Profile customer/enterprise reference.
   * @remarks Effects: Pure identity-shape validation; no owner admission is granted.
   * Failure behavior: Rejects noncanonical module/schema/code.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  owner: function (value) {
    if (!value || value.module !== "profile" || !["customer", "enterprise"].includes(value.schema) ||
        typeof value.code !== "string" || !/^[A-Za-z0-9][A-Za-z0-9_.:@-]{0,191}$/.test(value.code))
      throw new Error("Canonical Profile owner is required");
    return { module: "profile", schema: value.schema, code: value.code };
  },
  /**
   * Rejects foreign runtime partitions before any generated owner access. Internal callers must pass
   * canonical admitted context.
   * @param {Object} r Original admitted tenant/Enterprise request, preserving authData and private owner
   * context.
   * @returns {Object} Validated original tenant/Enterprise persistence partition.
   * @remarks Effects: Read-only context check; no auth mutation.
   * Failure behavior: Rejects empty/foreign signed tenant or missing partition.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  scope: function (r) {
    if (![r.tenant, r.enterpriseCode].every(v => typeof v === "string" && v.trim()) ||
        r.authData?.tenant && r.authData.tenant !== r.tenant) throw new Error("Digital bundle scope is required");
    return { tenant: r.tenant, enterpriseCode: r.enterpriseCode };
  },
  /**
   * Revalidates Profile owner/actor authority through the configured implementing owner, never body
   * flags.
   * @param {Object} r Original admitted tenant/Enterprise request, preserving authData and private owner
   * context.
   * @param {Object} ownerRef Canonical typed Profile purchasing/selling owner reference.
   * @param {string} action Fixed independently authorized bundle action.
   * @returns {Promise<Object>} Fresh action-specific typed owner/actor proof.
   * @remarks Effects: Delegates configured effective authority owner, never input-selected executable.
   * Failure behavior: Rejects missing service or unconfirmed/foreign owner admission.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  authorize: async function (r, ownerRef, action) {
    this.scope(r);
    const owner = this.owner(ownerRef), service = SERVICE[this.settings().ownerAuthorityService];
    if (!service?.authorize) throw new Error("Profile bundle owner authority is unavailable");
    const result = await service.authorize(r, { ownerRef: owner, action });
    if (!result || result.authorized !== true || result.tenant !== r.tenant ||
        !isDeepStrictEqual(result.ownerRef, owner) || !result.actorRef?.code)
      throw new Error("Digital bundle owner authority was not confirmed");
    return result;
  },
  /**
   * Uses only framework-selected component providers; manifests cannot select executable services.
   * @param {Object} component Canonical CERTIFICATE or REALIZED_CARBON component and reference.
   * @returns {Object} Effective framework-selected component provider.
   * @remarks Effects: Registry lookup only; manifest cannot select a service.
   * Failure behavior: Rejects unsupported component kind or incomplete provider.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  provider: function (component) {
    const name = this.settings().componentProviders[component.kind], service = SERVICE[name];
    if (!service || ["inspect", "reserve", "transfer", "release", "finalize"].some(k => typeof service[k] !== "function"))
      throw new Error("Bundle component owner is unavailable: " + component.kind);
    return service;
  },
  /**
   * Admits nonempty quantities and deduplicates canonical component references; rewards and coupons are
   * excluded.
   * @param {Object[]} values Selected component descriptions with canonical kind, reference and exact
   * quantity.
   * @returns {Object[]} Normalized nonempty deduplicated certificate/carbon components.
   * @remarks Effects: Pure exact quantity/reference validation.
   * Failure behavior: Rejects unsupported rewards/coupons, duplicate references, invalid quantity or
   * over-bound components.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  components: function (values) {
    if (!Array.isArray(values) || !values.length || values.length > this.settings().maximumComponents)
      throw new Error("A nonempty bounded bundle is required");
    const seen = new Set();
    return values.map(value => {
      if (!value || !["CERTIFICATE", "REALIZED_CARBON"].includes(value.kind) ||
          !value.reference || !["module", "schema", "code"].every(k => typeof value.reference[k] === "string" && /^[A-Za-z0-9][A-Za-z0-9_.:@-]{0,191}$/.test(value.reference[k])) ||
          !Number.isSafeInteger(value.expectedRevision) || value.expectedRevision < 0 ||
          typeof value.quantity !== "string" || !/^(0|[1-9]\d*)(\.\d+)?$/.test(value.quantity) ||
          value.quantity.length > 128 || !/[1-9]/.test(value.quantity) ||
          value.kind === "CERTIFICATE" && value.quantity !== "1") throw new Error("Invalid bundle component");
      const reference = { module: value.reference.module, schema: value.reference.schema, code: value.reference.code };
      const key = JSON.stringify(reference);
      if (seen.has(key)) throw new Error("Duplicate bundle component");
      seen.add(key);
      if (value.kind === "REALIZED_CARBON" && (typeof value.unitOfMeasure !== "string" || !value.unitOfMeasure.trim() || value.unitOfMeasure.length > 100))
        throw new Error("Carbon component unit is required");
      return { kind: value.kind, reference, quantity: value.quantity, expectedRevision: value.expectedRevision,
        ...(value.kind === "REALIZED_CARBON" ? { unitOfMeasure: value.unitOfMeasure } : {}) };
    }).sort((a, b) => JSON.stringify(a.reference).localeCompare(JSON.stringify(b.reference)));
  },
  /**
   * Reads one complete generated record in its fixed runtime/business scope.
   * @param {Object} r Original admitted tenant/Enterprise request, preserving authData and private owner
   * context.
   * @param {string} serviceName Fixed generated owner service selected by server code, never caller
   * executable input.
   * @param {string} code Exact original owner record code.
   * @returns {Promise<Object|undefined>} Single complete original generated record or confirmed absence.
   * @remarks Effects: Private scoped read with exact identity and bounded acknowledgement.
   * Failure behavior: Rejects failed, ambiguous, malformed or foreign owner rows.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  read: async function (r, serviceName, code) {
    const rows = await SERVICE.DefaultDigitalCommerceEntitlementService.readRecords(SERVICE[serviceName], r, { ...this.scope(r), code });
    if (rows.length > 1) throw new Error("Ambiguous bundle identity");
    if (rows[0] && (rows[0].active !== true || rows[0].tenant !== r.tenant || rows[0].enterpriseCode !== r.enterpriseCode || rows[0].code !== code))
      throw new Error("Bundle persistence scope changed");
    return rows[0];
  },
  /**
   * Resolves a fixed gift identity across business namespaces; the caller must authorize a retained
   * participant before projection or mutation.
   * @param {Object} r Original admitted tenant/Enterprise request, preserving authData and private owner
   * context.
   * @param {string} code Exact original owner record code.
   * @returns {Promise<Object|undefined>} Exact retained cross-namespace gift operation.
   * @remarks Effects: Private fixed-identity read; caller still must authorize a retained participant.
   * Failure behavior: Rejects duplicate/foreign/malformed evidence; returned record is not itself
   * admission.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  participantOperation: async function (r, code) {
    this.scope(r);
    if (typeof code !== "string" || !/^bundle-operation:[a-f0-9]{64}$/.test(code)) throw new Error("Invalid gift reference");
    const rows = await SERVICE.DefaultDigitalCommerceEntitlementService.readRecords(SERVICE.DefaultDigitalBundleOperationService, r,
      { tenant: r.tenant, code });
    if (rows.length !== 1 || rows[0].tenant !== r.tenant || rows[0].code !== code || rows[0].active !== true || rows[0].purpose !== "GIFT")
      throw new Error("Gift is unavailable");
    return rows[0];
  },
  /**
   * Inserts immutable command identity, then rereads; lost acknowledgements reconcile only the exact
   * original command.
   * @param {Object} r Original admitted tenant/Enterprise request, preserving authData and private owner
   * context.
   * @param {string} serviceName Fixed generated owner service selected by server code, never caller
   * executable input.
   * @param {Object} model Fixed generated model or owner-selected persistence record for this operation.
   * @returns {Promise<Object>} Read-back exact original immutable command.
   * @remarks Effects: Insert-only owner persistence with exact replay/lost-response reconciliation.
   * Failure behavior: Rejects digest/composition conflicts or unresolved insertion.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  insert: async function (r, serviceName, model) {
    await this.persistence(r, serviceName);
    const owner = SERVICE.DefaultDigitalCommerceEntitlementService, service = SERVICE[serviceName];
    if (!service?.save) throw new Error("Bundle persistence owner is unavailable");
    let row = await this.read(r, serviceName, model.code);
    if (!row) {
      try {
        owner.assertPersistence(await service.save({ tenant: r.tenant, authData: owner.serviceAuthData(r),
          query: { ...this.scope(r), code: model.code }, model: owner.persistenceModel(model), options: { recursive: false } }));
      } catch (error) {
        row = await this.read(r, serviceName, model.code);
        if (!row) throw error;
      }
      row = await this.read(r, serviceName, model.code);
    }
    if (!row || (model.commandDigest && row.commandDigest !== model.commandDigest) || (model.digest && row.digest !== model.digest) ||
        (model.compositionDigest && (row.compositionDigest !== model.compositionDigest || !isDeepStrictEqual(row.composition, model.composition))))
      throw new Error("Bundle command conflicts with original operation");
    return row;
  },
  /**
   * Requires installed generated CAS and unconditional unique identity before bundle writes.
   * @param {Object} r Original admitted tenant/Enterprise request, preserving authData and private owner
   * context.
   * @param {string} serviceName Fixed generated owner service selected by server code, never caller
   * executable input.
   * @returns {Promise<void>} Completes after installed identity and managed revision CAS qualification.
   * @remarks Effects: Inspects actual generated model/index metadata; no writes.
   * Failure behavior: Rejects versioned model, absent CAS, wrong key or non-unconditional unique index.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  persistence: async function (r, serviceName) {
    const schemas = { DefaultDigitalBundleManifestService: 'digitalBundleManifest', DefaultDigitalBundleOperationService: 'digitalBundleOperation',
      DefaultDigitalBundleOwnerPolicyService: 'digitalBundleOwnerPolicy' };
    const schema = schemas[serviceName];
    const model = schema && NODICS.getModels('digitalCore', r.tenant)?.[UTILS.createModelName(schema)];
    if (!model || model.versioned === true || model.primaryKey !== 'code' || typeof model.compareAndSetItem !== 'function' ||
        SERVICE.DefaultModelConcurrencyService.getField(model.rawSchema) !== 'revision') throw new Error('Bundle persistence CAS is not qualified');
    const indexes = await SERVICE.DefaultDatabaseModelHandlerService.inspectIndexes(model);
    if (indexes?.versioned !== false || !indexes.indexes?.some(index => index.unique === true && !index.sparse && !index.partialFilterExpression &&
        (!index.collation || index.collation.locale === 'simple') && index.key?.code === 1 &&
        Object.keys(index.key).every(key => ['code', 'tenant'].includes(key)))) throw new Error('Bundle unique identity is unavailable');
  },
  /**
   * Validates the exact retained successor after a managed revision write.
   * @param {Object|undefined} saved Original owner readback; absence is not a successful write.
   * @param {Object} expected Exact owner-selected patch, original code and next revision.
   * @returns {Object} Unchanged verified successor. Performs no reads or writes.
   * @throws {Error} Missing successor or fields differing from the original intended transition.
   * @override Both successful and lost-acknowledgement paths dispatch through this member.
   * Preserve exact readback binding; validation cannot grant private persistence authority.
   */
  assertSuccessor: function (saved, expected) {
    if (!saved) throw new Error('Bundle successor is unavailable');
    SERVICE.DefaultDigitalCommerceEntitlementService.assertSaved(saved, expected);
    return saved;
  },
  /**
   * Uses generated managed revisions and exact successor readback, including lost acknowledgements.
   * @param {Object} r Original admitted tenant/Enterprise request, preserving authData and private owner
   * context.
   * @param {Object} row Original persisted owner record and retained evidence.
   * @param {Object} patch Owner-selected fields for the next managed revision.
   * @param {string} [serviceName] Fixed generated owner service selected by server code, never caller
   * executable input.
   * @returns {Promise<Object>} Verified exact successor revision.
   * @remarks Effects: Performs existing managed revision CAS and original readback, including lost
   * acknowledgement.
   * Failure behavior: Rejects invalid revision, stale write or mismatched/unavailable successor.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  update: async function (r, row, patch, serviceName = 'DefaultDigitalBundleOperationService') {
    await this.persistence(r, serviceName);
    if (!Number.isSafeInteger(row.revision) || !Number.isSafeInteger(row.revision + 1)) throw new Error('Bundle revision is invalid');
    const owner = SERVICE.DefaultDigitalCommerceEntitlementService;
    const expected = { ...patch, code: row.code, revision: row.revision + 1 };
    try {
      const response = await SERVICE[serviceName].update({ tenant: r.tenant, authData: owner.serviceAuthData(r),
        query: { ...this.scope(r), code: row.code, revision: row.revision, status: row.status },
        model: { ...patch, code: row.code, revision: row.revision }, options: { recursive: false } });
      owner.assertPersistence(response);
      if (response.result?.matchedCount !== 1) throw new Error('Bundle lifecycle write lost its revision');
    } catch (error) {
      try { return this.assertSuccessor(await this.read(r, serviceName, row.code), expected); } catch (_) { throw error; }
    }
    return this.assertSuccessor(await this.read(r, serviceName, row.code), expected);
  },
  /**
   * Recomputes retained immutable contents; a matching stored digest alone is not integrity evidence.
   * @param {Object} row Original persisted owner record and retained evidence.
   * @returns {Object} Unchanged manifest after content/digest integrity validation.
   * @remarks Effects: Recomputes immutable contents; stored digest alone is not evidence.
   * Failure behavior: Rejects changed components/composition or invalid canonical owner.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  manifest: function (row) {
    if (!row || row.status !== "ACTIVE" || !Number.isSafeInteger(row.revision) ||
        !isDeepStrictEqual(this.components(row.components), row.components) ||
        this.digest({ ownerRef: this.owner(row.ownerRef), components: row.components }) !== row.digest)
      throw new Error("Original bundle manifest changed");
    return row;
  },
  /**
   * Persists a validated immutable manifest. No holdings are reserved until the original operation is
   * retained.
   * @param {Object} r Original admitted tenant/Enterprise request, preserving authData and private owner
   * context.
   * @param {Object} input Operation input/selectors validated by this owner; supplied identities do not
   * grant authority.
   * @returns {Promise<Object>} Original new or exactly replayed immutable manifest.
   * @remarks Effects: Persists validated contents only; no component holds until operation retention.
   * Failure behavior: Rejects owner denial, invalid original key or conflicting manifest replay.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  create: async function (r, input) {
    const ownerRef = this.owner(input.ownerRef);
    await this.authorize(r, ownerRef, "BUNDLE_CREATE");
    this.commandKey(input.idempotencyKey);
    const components = this.components(input.components), digest = this.digest({ ownerRef, components });
    const composition = input.composition === undefined ? undefined : SERVICE.DefaultDigitalBundleRecoveryService.composition(input.composition, ownerRef);
    const code = "bundle:" + this.digest([r.tenant, r.enterpriseCode, ownerRef, input.idempotencyKey]);
    const existing = await this.read(r, "DefaultDigitalBundleManifestService", code);
    if (existing) {
      if (existing.digest !== digest || !isDeepStrictEqual(existing.composition, composition) ||
          composition && existing.compositionDigest !== this.digest(composition)) throw new Error("Bundle command conflicts with original contents");
      return this.manifest(existing);
    }
    for (const component of components) {
      if (components.length > 1 && this.provider(component).retainsTransferLock === false)
        throw new Error("Component owner cannot yet retain a whole-bundle transfer lock");
      const result = await this.provider(component).inspect(r, { component, ownerRef });
      if (result?.available !== true || !isDeepStrictEqual(result.ownerRef, ownerRef) || result.revision !== component.expectedRevision)
        throw new Error("Bundle component is not available to this owner");
    }
    return this.insert(r, "DefaultDigitalBundleManifestService", { ...this.scope(r), code, revision: 0, status: "ACTIVE",
      ownerRef, components, digest, ...(composition ? { composition, compositionDigest: this.digest(composition) } : {}),
      idempotencyKey: input.idempotencyKey, correlationId: r.correlationId || input.idempotencyKey });
  },
  /**
   * Starts or resumes one immutable holdings operation; conflicting purposes compete at component-owner
   * locks.
   * @param {Object} r Original admitted tenant/Enterprise request, preserving authData and private owner
   * context.
   * @param {Object} input Operation input/selectors validated by this owner; supplied identities do not
   * grant authority.
   * @returns {Promise<Object>} Original operation in PENDING/HELD or retained recovery state.
   * @remarks Effects: Persists immutable operation first, then records each component owner's reserve
   * receipt.
   * Failure behavior: Rejects conflicting purpose/terms or uncertain owner receipt; original operation
   * remains recoverable.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  reserve: async function (r, input) {
    this.commandKey(input.idempotencyKey);
    const manifest = this.manifest(await this.read(r, "DefaultDigitalBundleManifestService", input.manifestCode));
    if (!manifest || manifest.revision !== input.manifestRevision || !["LISTING", "GIFT"].includes(input.purpose) || !input.idempotencyKey)
      throw new Error("Exact bundle manifest and operation are required");
    const authority = await this.authorize(r, manifest.ownerRef, input.purpose === "GIFT" ? "GIFT_SEND" : "BUNDLE_LIST");
    const recipientRef = input.recipientRef ? this.owner(input.recipientRef) : null;
    if (manifest.composition && (manifest.composition.mode !== 'GIFT' || input.purpose !== 'GIFT' ||
        manifest.composition.operationKey !== input.idempotencyKey || !isDeepStrictEqual(manifest.composition.recipientRef, recipientRef) ||
        manifest.compositionDigest !== this.digest(manifest.composition))) throw new Error('Original reviewed gift changed');
    if (recipientRef && isDeepStrictEqual(recipientRef, manifest.ownerRef)) throw new Error("Same-owner transfer is prohibited");
    if (input.purpose === "GIFT" && !recipientRef) throw new Error("Gift recipient is required");
    const digest = this.digest({ manifestCode: manifest.code, manifestRevision: manifest.revision, purpose: input.purpose, recipientRef });
    const code = "bundle-operation:" + this.digest([r.tenant, r.enterpriseCode, manifest.ownerRef, input.idempotencyKey]);
    let row = await this.read(r, "DefaultDigitalBundleOperationService", code);
    if (!row && input.purpose === "GIFT") {
      if (this.settings().giftExpirySeconds === null) throw new Error("Gift expiry must be explicitly selected");
      await SERVICE.DefaultDigitalBundleGiftService.admit(r, manifest.ownerRef, recipientRef, { code, digest });
    }
    row = await this.insert(r, "DefaultDigitalBundleOperationService", { ...this.scope(r), code, manifestCode: manifest.code,
      manifestRevision: manifest.revision, ownerRef: manifest.ownerRef, ...(recipientRef ? { recipientRef } : {}), purpose: input.purpose,
      status: "RESERVING", revision: 0, commandDigest: digest, checkpoints: {}, idempotencyKey: input.idempotencyKey,
      correlationId: r.correlationId || input.idempotencyKey,
      ...(input.purpose === "GIFT" ? { deadline: row?.deadline ?? configuration.deadline(Date.now(),
        this.settings().giftExpirySeconds, this.settings().validation.giftExpirySeconds) } : {}),
      evidence: { actorRef: authority.actorRef, manifestDigest: manifest.digest, manifestEnterpriseCode: manifest.enterpriseCode, finalSale: true } });
    if (row.status !== "RESERVING") return row;
    row = await this.componentsPhase(r, row, manifest, "reserve", "RESERVED");
    return this.update(r, row, { status: input.purpose === "GIFT" ? "PENDING" : "HELD" });
  },
  /**
   * Calls component owners with fixed original keys; each confirmed receipt is persisted before
   * advancing.
   * @param {Object} r Original admitted tenant/Enterprise request, preserving authData and private owner
   * context.
   * @param {Object} row Original persisted owner record and retained evidence.
   * @param {Object} manifest Original immutable manifest whose digest/content has been validated.
   * @param {string} phase Fixed owner lifecycle phase; never arbitrary executable input.
   * @param {string} expectedStatus Required canonical component receipt phase status.
   * @returns {Promise<Object>} Operation with each confirmed original component receipt retained.
   * @remarks Effects: Invokes fixed original keys and persists each acknowledgement before advancing.
   * Failure behavior: Partial/foreign/uncertain receipts stop advancement and retain original recovery.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  componentsPhase: async function (r, row, manifest, phase, expectedStatus) {
    for (let index = 0; index < manifest.components.length; index++) {
      const component = manifest.components[index], operationKey = row.code + ":" + index;
      const checkpoint = row.checkpoints[index] || {};
      if (checkpoint[phase]) continue;
      const receipt = await this.provider(component)[phase](r, { component, operationKey, bundleCode: manifest.code,
        componentCount: manifest.components.length,
        manifestRevision: manifest.revision, ownerRef: row.ownerRef, recipientRef: row.recipientRef,
        purpose: row.purpose, hold: checkpoint.reserve, transfer: checkpoint.transfer });
      if (receipt?.status !== expectedStatus || receipt.operationKey !== operationKey ||
          !isDeepStrictEqual(receipt.reference, component.reference) || receipt.quantity !== component.quantity || !receipt.receiptCode)
        throw new Error("Bundle component receipt is unconfirmed");
      row = await this.update(r, row, { checkpoints: { ...row.checkpoints, [index]: { ...checkpoint, [phase]: receipt } } });
    }
    return row;
  },
  /**
   * Reads the retained manifest partition, which can differ from the Store publication partition.
   * @param {Object} r Original admitted tenant/Enterprise request, preserving authData and private owner
   * context.
   * @param {Object} row Original persisted owner record and retained evidence.
   * @returns {Promise<Object>} Validated original manifest from its retained seller partition.
   * @remarks Effects: Exact manifest read; Store partition does not relocate contents.
   * Failure behavior: Rejects missing or changed original manifest identity/digest.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  operationManifest: async function (r, row) {
    if (!row?.evidence?.manifestEnterpriseCode) throw new Error("Original manifest namespace is unavailable");
    const manifest = this.manifest(await this.read({ ...r, enterpriseCode: row.evidence.manifestEnterpriseCode },
      "DefaultDigitalBundleManifestService", row.manifestCode));
    if (manifest.revision !== row.manifestRevision || manifest.digest !== row.evidence.manifestDigest ||
        !isDeepStrictEqual(manifest.ownerRef, row.ownerRef)) throw new Error("Original bundle manifest changed");
    return manifest;
  },
  /**
   * Resumes a fenced whole transfer. Only the owning gift or purchase coordinator may fence HELD/PENDING
   * into TRANSFERRING.
   * @param {Object} r Original admitted tenant/Enterprise request, preserving authData and private owner
   * context.
   * @param {string} operationCode Exact original persisted bundle operation identity.
   * @returns {Promise<Object>} Original operation completed after every transfer/finalize receipt.
   * @remarks Effects: Resumes only already fenced TRANSFERRING whole operation; no new transfer intent.
   * Failure behavior: Rejects unfenced/conflicting state or incomplete owner receipt; partial work stays
   * locked.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  transfer: async function (r, operationCode) {
    let row = await this.read(r, "DefaultDigitalBundleOperationService", operationCode);
    if (!row || !["TRANSFERRING", "TRANSFERRED", "COMPLETED"].includes(row.status)) throw new Error("Bundle transfer has not been admitted");
    if (row.status === "COMPLETED") return row;
    const manifest = await this.operationManifest(r, row);
    if (!manifest || manifest.revision !== row.manifestRevision || manifest.digest !== row.evidence.manifestDigest)
      throw new Error("Original bundle manifest changed");
    if (row.status === "TRANSFERRING") {
      row = await this.componentsPhase(r, row, manifest, "transfer", "TRANSFERRED");
      row = await this.update(r, row, { status: "TRANSFERRED" });
    }
    row = await this.componentsPhase(r, row, manifest, "finalize", "COMPLETED");
    return this.update(r, row, { status: "COMPLETED" });
  },
  /**
   * Releases only a previously fenced non-transferring operation; uncertain component results retain
   * RELEASING.
   * @param {Object} r Original admitted tenant/Enterprise request, preserving authData and private owner
   * context.
   * @param {string} operationCode Exact original persisted bundle operation identity.
   * @returns {Promise<Object>} Original RELEASED operation or exact replay.
   * @remarks Effects: Resumes only fenced RELEASING operation with original component keys.
   * Failure behavior: Rejects transferring/conflicting state or uncertain release; never silently
   * unlocks.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  release: async function (r, operationCode) {
    let row = await this.read(r, "DefaultDigitalBundleOperationService", operationCode);
    if (!row || !["RELEASING", "RELEASED"].includes(row.status)) throw new Error("Bundle release has not been admitted");
    if (row.status === "RELEASED") return row;
    const manifest = await this.operationManifest(r, row);
    if (!manifest || manifest.digest !== row.evidence.manifestDigest) throw new Error("Original bundle manifest changed");
    row = await this.componentsPhase(r, row, manifest, "release", "RELEASED");
    return this.update(r, row, { status: "RELEASED" });
  },
};
