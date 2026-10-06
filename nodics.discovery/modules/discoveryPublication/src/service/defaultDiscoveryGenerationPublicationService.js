/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
const crypto = require("node:crypto");
/** @module discoveryPublication/service/DefaultDiscoveryGenerationPublicationService
 * @description Publishes complete derived generations using private generated persistence and nSearch-backed projection, without source eligibility or scheduler authority.
 * @layer service @owner discoveryPublication
 * @override Preserve unique manifests, exact scope, CAS, explicit abandonment, immutable generation IDs and owner authorization before every invocation.
 */
module.exports = {
  /** Probes the actual indexed count for one generation after an explicit visibility refresh. @param {Object} request Trusted owner scope. @param {string} token Exact generation. @returns {Promise<number>} Exact indexed count. */
  count: async function (request, token) {
    const response =
      await SERVICE.DefaultDiscoveryDocumentProjectionService.doSearch({
        tenant: request.tenant,
        authData: request.authData,
        indexName: request.indexName,
        query: this.query(request, token),
        options: { size: 0, track_total_hits: true },
      });
    const hits = SERVICE.DefaultDiscoveryRuntimeService.findHits(response, 0);
    const result = response?.result?.body || response?.result;
    if (
      !this.acknowledged(response) ||
      result?.timed_out !== false ||
      result?._shards?.failed !== 0 ||
      !Number.isSafeInteger(result._shards.successful) ||
      result._shards.successful < 1 ||
      !hits ||
      hits.total?.relation !== "eq" ||
      !Number.isSafeInteger(hits.total.value) ||
      hits.total.value < 0
    )
      throw new Error("DISCOVERY_GENERATION_COUNT_UNCONFIRMED");
    return hits.total.value;
  },
  /** Fails closed on contradictory owner envelopes. @param {Object} response Owner response. @returns {boolean} Success envelope. */
  acknowledged: function (response) {
    return (
      !!response &&
      /^SUC_/.test(response.code || "") &&
      !response.error &&
      response.success !== false &&
      response.acknowledged !== false &&
      (response.errors === undefined ||
        (Array.isArray(response.errors) && !response.errors.length))
    );
  },
  /** Builds an exact tenant/index/source identity, accepting no query or physical index from a browser. @param {Object} request Trusted owner request. @returns {Object} Manifest identity. */
  scope: function (request) {
    const fields = [
      "indexName",
      "indexConfigurationCode",
      "ownerType",
      "ownerCode",
    ];
    if (
      typeof request.tenant !== "string" ||
      !/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(request.tenant) ||
      fields.some(
        (key) =>
          typeof request[key] !== "string" ||
          !/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(request[key]),
      )
    )
      throw new Error("DISCOVERY_GENERATION_SCOPE_INVALID");
    const scope = {
      tenantCode: request.tenant,
      ...Object.fromEntries(fields.map((key) => [key, request[key]])),
    };
    return {
      code:
        "generation-" +
        crypto.createHash("sha256").update(JSON.stringify(scope)).digest("hex"),
      ...scope,
    };
  },
  /** Resolves generated persistence without creating another storage adapter. @returns {Object} Generated owner. */
  store: function () {
    const store = SERVICE.DefaultDiscoveryGenerationService;
    if (
      !store ||
      !["get", "save", "update"].every(
        (key) => typeof store[key] === "function",
      )
    )
      throw new Error("DISCOVERY_GENERATION_STORAGE_REQUIRED");
    return store;
  },
  /** Verifies returned manifest identity and bounded immutable generation descriptors. @param {Object} row Persisted manifest. @param {Object} scope Expected identity. @returns {Object} Manifest. */
  validate: function (row, scope) {
    if (
      !row ||
      Object.entries(scope).some(([key, value]) => row[key] !== value) ||
      !Number.isSafeInteger(row.revision) ||
      row.revision < 0 ||
      !Array.isArray(row.obsoleteGenerations) ||
      row.obsoleteGenerations.length > 100 ||
      new Set(row.obsoleteGenerations).size !==
        row.obsoleteGenerations.length ||
      row.obsoleteGenerations.some((value) => !/^[a-f0-9-]{36}$/.test(value))
    )
      throw new Error("DISCOVERY_GENERATION_EVIDENCE_INVALID");
    for (const descriptor of [row.currentGeneration, row.pendingGeneration])
      if (
        descriptor != null &&
        (!/^[a-f0-9-]{36}$/.test(descriptor.token || "") ||
          !/^[a-f0-9]{64}$/.test(descriptor.digest || "") ||
          (descriptor.contentDigest !== undefined &&
            !/^[a-f0-9]{64}$/.test(descriptor.contentDigest)) ||
          !Number.isSafeInteger(descriptor.count) ||
          descriptor.count < 0 ||
          descriptor.count > 100000 ||
          typeof descriptor.at !== "string" ||
          !Number.isFinite(Date.parse(descriptor.at)))
      )
        throw new Error("DISCOVERY_GENERATION_EVIDENCE_INVALID");
    for (const descriptor of [row.currentGeneration, row.pendingGeneration])
      if (descriptor?.writer !== undefined) {
        this.validateWriter(descriptor.writer, descriptor.count);
        if (
          (descriptor.writer.state === "SEALED" &&
            descriptor.writer.completed !== descriptor.count) ||
          (descriptor.writer.state === "WRITING" &&
            descriptor.writer.completed >= descriptor.count)
        )
          throw new Error("DISCOVERY_GENERATION_WRITER_INVALID");
      }
    const retired = row.retiredWriters ?? {};
    if (
      !retired ||
      typeof retired !== "object" ||
      Array.isArray(retired) ||
      Object.keys(retired).length > 100 ||
      Object.keys(retired).some(
        (token) => !row.obsoleteGenerations.includes(token),
      )
    )
      throw new Error("DISCOVERY_GENERATION_EVIDENCE_INVALID");
    for (const writer of Object.values(retired))
      this.validateWriter(writer, 100000);
    const published = row.publishedObsoleteGenerations ?? [];
    if (
      !Array.isArray(published) ||
      published.length > 100 ||
      new Set(published).size !== published.length ||
      published.some((token) => !row.obsoleteGenerations.includes(token))
    )
      throw new Error("DISCOVERY_GENERATION_EVIDENCE_INVALID");
    if (
      (row.currentGeneration &&
        row.obsoleteGenerations.includes(row.currentGeneration.token)) ||
      (row.pendingGeneration &&
        (row.obsoleteGenerations.includes(row.pendingGeneration.token) ||
          row.pendingGeneration.token === row.currentGeneration?.token))
    )
      throw new Error("DISCOVERY_GENERATION_EVIDENCE_INVALID");
    return row;
  },
  /** Reads one exact manifest with no volatile or legacy fallback. @param {Object} request Trusted owner request. @returns {Promise<Object|null>} Manifest or absent. */
  read: async function (request) {
    const scope = this.scope(request);
    const response = await this.store().get({
      tenant: request.tenant,
      authData: request.authData,
      ...(request.guardedWrites === true
        ? { internalPersistence: "DURABLE_JOURNAL" }
        : {}),
      query: scope,
      options: { skipItemCache: true },
      searchOptions: { pageSize: 2, pageNumber: 1 },
    });
    if (
      !this.acknowledged(response) ||
      !Array.isArray(response.result) ||
      response.result.length > 1
    )
      throw new Error("DISCOVERY_GENERATION_READ_UNCONFIRMED");
    const current = response.result.length
      ? this.validate(response.result[0], scope)
      : null;
    this.assertGuarded(request, current);
    return current;
  },
  /** Prevents an older unguarded caller from modifying qualified writer evidence. @param {Object} request Trusted owner scope. @param {Object|null} current Manifest. @returns {void} Throws on protocol downgrade. */
  assertGuarded: function (request, current) {
    if (
      request.guardedWrites !== true &&
      (current?.pendingGeneration?.writer ||
        current?.currentGeneration?.writer ||
        Object.keys(current?.retiredWriters || {}).length)
    )
      throw new Error("DISCOVERY_GENERATION_GUARDED_WRITES_REQUIRED");
  },
  /** Advances a manifest only from its observed revision; uncertain acknowledgement never advances caller authority. @param {Object} request Trusted owner request. @param {Object} current Current manifest. @param {Object} patch Owner transition. @returns {Promise<Object>} Updated manifest. */
  transition: async function (request, current, patch) {
    const scope = this.scope(request);
    this.validate(current, scope);
    this.assertGuarded(request, current);
    const next = {
      ...current,
      ...patch,
      revision: current.revision + 1,
      updatedAt: new Date(),
    };
    this.validate(next, scope);
    this.assertGuarded(request, next);
    const response = await this.store().update({
      tenant: request.tenant,
      authData: request.authData,
      ...(request.guardedWrites === true
        ? { internalPersistence: "DURABLE_JOURNAL" }
        : {}),
      query: { ...scope, revision: current.revision },
      model: {
        ...patch,
        revision: next.revision,
        updatedAt: next.updatedAt,
      },
    });
    if (
      !this.acknowledged(response) ||
      response.result?.matchedCount !== 1 ||
      response.result.error ||
      response.result.success === false ||
      response.result.acknowledged === false ||
      (response.result.errors !== undefined &&
        (!Array.isArray(response.result.errors) ||
          response.result.errors.length))
    )
      throw new Error("DISCOVERY_GENERATION_TRANSITION_UNCONFIRMED");
    return next;
  },
  /** Claims a fresh generation after unique-key initialization; never steals an uncertain writer. @param {Object} request Trusted owner request. @param {Object} descriptor Source digest and expected document count. @returns {Promise<Object>} Claimed manifest. */
  begin: async function (request, descriptor) {
    let current = await this.read(request);
    if (!current) {
      const candidate = {
        ...this.scope(request),
        active: true,
        revision: 0,
        currentGeneration: null,
        pendingGeneration: null,
        obsoleteGenerations: [],
        publishedObsoleteGenerations: [],
        updatedAt: new Date(),
      };
      try {
        await this.store().save({
          tenant: request.tenant,
          authData: request.authData,
          model: candidate,
          options: { insertOnly: true },
          ...(request.guardedWrites === true
            ? { internalPersistence: "DURABLE_JOURNAL" }
            : {}),
        });
      } catch {
        /* A competing initializer may have inserted the unique identity. Re-read, never upsert. */
      }
      current = await this.read(request);
      if (!current)
        throw new Error("DISCOVERY_GENERATION_INITIALIZATION_UNCONFIRMED");
    }
    if (current.pendingGeneration)
      throw new Error("DISCOVERY_GENERATION_INSPECTION_REQUIRED");
    if (current.obsoleteGenerations.length >= 100)
      throw new Error("DISCOVERY_GENERATION_CLEANUP_REQUIRED");
    return this.transition(request, current, {
      pendingGeneration: {
        token: crypto.randomUUID(),
        digest: descriptor.digest,
        ...(descriptor.contentDigest !== undefined
          ? { contentDigest: descriptor.contentDigest }
          : {}),
        count: descriptor.count,
        at: new Date().toISOString(),
        ...(request.guardedWrites === true
          ? { writer: { version: 1, state: "IDLE", completed: 0, claim: null } }
          : {}),
      },
    });
  },
  /** Validates bounded write evidence independently of elapsed time or caller assertions. @param {Object} writer Persisted writer evidence. @param {number} count Maximum writes. @returns {void} Throws on malformed proof. */
  validateWriter: function (writer, count) {
    if (
      !writer ||
      writer.version !== 1 ||
      !["IDLE", "WRITING", "SEALED"].includes(writer.state) ||
      !Number.isSafeInteger(writer.completed) ||
      writer.completed < 0 ||
      writer.completed > count ||
      (writer.state === "WRITING"
        ? !/^[a-f0-9-]{36}$/.test(writer.claim || "")
        : writer.claim !== null)
    )
      throw new Error("DISCOVERY_GENERATION_WRITER_INVALID");
  },
  /** Claims one physical write before dispatch; retirement or a competing revision forbids new writes. @param {Object} request Trusted guarded scope. @param {Object} claimed Current private claim. @returns {Promise<Object>} Acknowledged write claim. */
  startWrite: async function (request, claimed) {
    this.validate(claimed, this.scope(request));
    const pending = claimed.pendingGeneration;
    if (
      request.guardedWrites !== true ||
      !pending?.writer ||
      pending.writer.state !== "IDLE" ||
      pending.writer.completed >= pending.count
    )
      throw new Error("DISCOVERY_GENERATION_WRITE_REFUSED");
    return this.transition(request, claimed, {
      pendingGeneration: {
        ...pending,
        writer: {
          ...pending.writer,
          state: "WRITING",
          claim: crypto.randomUUID(),
        },
      },
    });
  },
  /** Records only the caller's acknowledged original physical write, even after retirement; this never authorizes another write to a retired token. @param {Object} request Trusted guarded scope. @param {Object} claimed Original pre-dispatch claim. @returns {Promise<Object>} Updated manifest. */
  completeWrite: async function (request, claimed) {
    this.validate(claimed, this.scope(request));
    const original = claimed.pendingGeneration;
    if (request.guardedWrites !== true || original?.writer?.state !== "WRITING")
      throw new Error("DISCOVERY_GENERATION_WRITE_REFUSED");
    const current = await this.read(request);
    if (!current) throw new Error("DISCOVERY_GENERATION_WRITE_REFUSED");
    const pending = current.pendingGeneration?.token === original.token;
    const writer = pending
      ? current.pendingGeneration.writer
      : current.retiredWriters?.[original.token];
    if (
      !writer ||
      writer.state !== "WRITING" ||
      writer.claim !== original.writer.claim ||
      writer.completed !== original.writer.completed
    )
      throw new Error("DISCOVERY_GENERATION_WRITE_REFUSED");
    const completed = {
      ...writer,
      state: "IDLE",
      claim: null,
      completed: writer.completed + 1,
    };
    return this.transition(
      request,
      current,
      pending
        ? {
            pendingGeneration: {
              ...current.pendingGeneration,
              writer: completed,
            },
          }
        : {
            retiredWriters: {
              ...current.retiredWriters,
              [original.token]: completed,
            },
          },
    );
  },
  /** Seals a fully acknowledged generation before visibility/publication; sealed writers cannot dispatch again. @param {Object} request Trusted guarded scope. @param {Object} claimed Current manifest. @returns {Promise<Object>} Sealed manifest. */
  sealWriter: async function (request, claimed) {
    this.validate(claimed, this.scope(request));
    const pending = claimed.pendingGeneration;
    if (
      request.guardedWrites !== true ||
      pending?.writer?.state !== "IDLE" ||
      pending.writer.completed !== pending.count
    )
      throw new Error("DISCOVERY_GENERATION_WRITE_REFUSED");
    return this.transition(request, claimed, {
      pendingGeneration: {
        ...pending,
        writer: { ...pending.writer, state: "SEALED" },
      },
    });
  },
  /** Verifies unchanged current derived content without claiming a writer or mutating the index. @param {Object} request Trusted source scope. @param {Object} descriptor Policy/content digests and exact count. @param {Object} options Current caller-authority guard. @returns {Promise<Object|null>} Stable published manifest or changed/absent evidence. */
  unchanged: async function (request, descriptor, options = {}) {
    if (
      !/^[a-f0-9]{64}$/.test(descriptor?.digest || "") ||
      !/^[a-f0-9]{64}$/.test(descriptor?.contentDigest || "") ||
      !Number.isSafeInteger(descriptor.count) ||
      descriptor.count < 0 ||
      descriptor.count > 100000
    )
      throw new Error("DISCOVERY_GENERATION_DESCRIPTOR_INVALID");
    const manifest = await this.read(request);
    if (manifest?.pendingGeneration)
      throw new Error("DISCOVERY_GENERATION_INSPECTION_REQUIRED");
    const current = manifest?.currentGeneration;
    if (
      !current ||
      current.digest !== descriptor.digest ||
      current.contentDigest !== descriptor.contentDigest ||
      current.count !== descriptor.count
    )
      return null;
    if ((await this.count(request, current.token)) !== current.count)
      return null;
    const fresh = await this.read(request);
    if (
      !fresh ||
      fresh.revision !== manifest.revision ||
      fresh.pendingGeneration ||
      JSON.stringify(fresh.currentGeneration) !== JSON.stringify(current)
    )
      throw new Error("DISCOVERY_GENERATION_REVIEW_STALE");
    await options.assertCurrent?.();
    return fresh;
  },
  /** Publishes only the exact claimed writer after the caller acknowledges all projection writes and search visibility. @param {Object} request Trusted owner request. @param {Object} claimed Claimed manifest. @returns {Promise<Object>} Active manifest. */
  publish: async function (request, claimed) {
    if (!claimed.pendingGeneration)
      throw new Error("DISCOVERY_GENERATION_CLAIM_REQUIRED");
    if (
      claimed.pendingGeneration.writer &&
      claimed.pendingGeneration.writer.state !== "SEALED"
    )
      throw new Error("DISCOVERY_GENERATION_WRITE_REFUSED");
    return this.transition(request, claimed, {
      currentGeneration: claimed.pendingGeneration,
      pendingGeneration: null,
      publishedObsoleteGenerations: [
        ...(claimed.publishedObsoleteGenerations || []),
        ...(claimed.currentGeneration ? [claimed.currentGeneration.token] : []),
      ],
      obsoleteGenerations: [
        ...claimed.obsoleteGenerations,
        ...(claimed.currentGeneration ? [claimed.currentGeneration.token] : []),
      ],
    });
  },
  /** Explicitly fences a stuck writer; never publishes partial content or resumes its writes. @param {Object} request Trusted owner request. @param {number} revision Reviewed revision. @param {string} token Reviewed pending token. @param {Object} options Optional caller authority guard rechecked immediately before CAS. @returns {Promise<Object>} Manifest with obsolete unpublished generation. */
  abandon: async function (request, revision, token, options = {}) {
    const current = await this.read(request);
    if (
      !current ||
      current.revision !== revision ||
      current.pendingGeneration?.token !== token ||
      current.obsoleteGenerations.length >= 100
    )
      throw new Error("DISCOVERY_GENERATION_REVIEW_STALE");
    await options.assertCurrent?.();
    return this.transition(request, current, {
      pendingGeneration: null,
      obsoleteGenerations: [...current.obsoleteGenerations, token],
      ...(current.pendingGeneration.writer
        ? {
            retiredWriters: {
              ...(current.retiredWriters || {}),
              [token]: current.pendingGeneration.writer,
            },
          }
        : {}),
    });
  },
  /** Builds exact projection predicates for a recorded immutable generation. @param {Object} request Trusted owner scope. @param {string} token Generation token. @returns {Object} nSearch query. */
  query: function (request, token) {
    const scope = this.scope(request);
    if (!/^[a-f0-9-]{36}$/.test(token || ""))
      throw new Error("DISCOVERY_GENERATION_TOKEN_INVALID");
    return {
      bool: {
        filter: [
          { term: { tenant: request.tenant } },
          { term: { ownerType: scope.ownerType } },
          {
            term: {
              indexConfigurationCode: scope.indexConfigurationCode,
            },
          },
          {
            term: {
              "payload.publicationOwner.keyword": scope.ownerCode,
            },
          },
          {
            term: {
              "payload.publicationGeneration.keyword": token,
            },
          },
        ],
      },
    };
  },
  /** Selects obsolete tokens with published-origin or acknowledged quiescence proof. @param {Object} current Validated manifest. @param {Object} options Optional published-only restriction. @returns {string[]} Exact eligible generation tokens. */
  cleanupTokens: function (current, options = {}) {
    return current.obsoleteGenerations.filter(
      (token) =>
        (current.publishedObsoleteGenerations || []).includes(token) ||
        (options.publishedOnly !== true &&
          ["IDLE", "SEALED"].includes(current.retiredWriters?.[token]?.state)),
    );
  },
  /** Deletes recorded obsolete generations via Discovery/nSearch; uncertain and legacy writers remain ineligible. @param {Object} request Trusted owner request. @param {Object} options Optional reviewed revision, publishedOnly and current-authority check. @returns {Promise<Object>} Updated cleanup manifest. */
  cleanup: async function (request, options = {}) {
    let current = await this.read(request);
    if (!current) return null;
    if (
      options.expectedRevision !== undefined &&
      current.revision !== options.expectedRevision
    )
      throw new Error("DISCOVERY_GENERATION_REVIEW_STALE");
    if (options.publishedOnly === true && current.pendingGeneration)
      throw new Error("DISCOVERY_GENERATION_INSPECTION_REQUIRED");
    const selected = this.cleanupTokens(current, options);
    for (const token of selected) {
      await options.assertCurrent?.();
      const response =
        await SERVICE.DefaultDiscoveryDocumentProjectionService.doRemoveByQuery(
          {
            tenant: request.tenant,
            authData: request.authData,
            indexName: request.indexName,
            query: this.query(request, token),
            options: { refresh: true, conflicts: "abort" },
          },
        );
      const result = response?.result?.body || response?.result;
      if (
        !this.acknowledged(response) ||
        !result ||
        result.timed_out !== false ||
        result.version_conflicts !== 0 ||
        !Array.isArray(result.failures) ||
        result.failures.length ||
        !Number.isSafeInteger(result.deleted) ||
        result.deleted < 0
      )
        throw new Error("DISCOVERY_GENERATION_CLEANUP_UNCONFIRMED");
      current = await this.transition(request, current, {
        publishedObsoleteGenerations: (
          current.publishedObsoleteGenerations || []
        ).filter((value) => value !== token),
        obsoleteGenerations: current.obsoleteGenerations.filter(
          (value) => value !== token,
        ),
        retiredWriters: Object.fromEntries(
          Object.entries(current.retiredWriters || {}).filter(
            ([key]) => key !== token,
          ),
        ),
      });
    }
    return current;
  },
};
