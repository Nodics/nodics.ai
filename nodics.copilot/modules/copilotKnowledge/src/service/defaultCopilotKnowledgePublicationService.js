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
/** @module copilotKnowledge/service/DefaultCopilotKnowledgePublicationService
 * @description Binds eligible source chunks to Discovery-owned atomic generations and verifies durable index evidence.
 * @layer service @owner copilotKnowledge
 * @override Keep eligibility in Copilot, publication in Discovery and physical indexing in nSearch. Missing manifests never enable legacy chunks in generation mode.
 */
module.exports = {
  /** Canonicalizes JSON projection values independent of object insertion order. @param {*} value Safe derived JSON value. @returns {*} Canonical JSON value. */
  canonical: function (value) {
    if (value instanceof Date) return value.toISOString();
    if (Array.isArray(value)) return value.map((item) => this.canonical(item));
    if (value && typeof value === "object")
      return Object.fromEntries(
        Object.keys(value)
          .sort()
          .filter((key) => value[key] !== undefined)
          .map((key) => [key, this.canonical(value[key])]),
      );
    return value;
  },
  /** Fingerprints the complete derived source excluding only projection bookkeeping timestamps. @param {Object[]} projections Complete safe source documents. @returns {string} Versioned content fingerprint. */
  fingerprint: function (projections) {
    if (
      !Array.isArray(projections) ||
      projections.length > 100000 ||
      projections.some(
        (model) =>
          typeof model.code !== "string" || !model.code || !model.payload,
      ) ||
      new Set(projections.map((model) => model.code)).size !==
        projections.length
    )
      throw new Error("COPILOT_GENERATION_DOCUMENTS_INVALID");
    const content = projections
      .map(({ projectedAt, created, updated, ...document }) =>
        this.canonical(document),
      )
      .sort((left, right) =>
        left.code < right.code ? -1 : left.code > right.code ? 1 : 0,
      );
    return crypto
      .createHash("sha256")
      .update(JSON.stringify(["COPILOT_PROJECTION_V1", content]))
      .digest("hex");
  },
  /** Reuses only unchanged, physically intact, current source evidence; never repairs or cleans during this read. @param {Object} request Ingestion context. @param {Object[]} projections Complete scanned source. @returns {Promise<Object|null>} Reuse receipt or full refresh required. */
  unchanged: async function (request, projections) {
    const owner = SERVICE.DefaultDiscoveryGenerationPublicationService;
    const manifest = await owner.unchanged(
      this.scope(request, request.source),
      {
        digest: request.source.sourcePolicyDigest,
        contentDigest: this.fingerprint(projections),
        count: projections.length,
      },
      { assertCurrent: request.assertCurrent },
    );
    return manifest
      ? {
          generation: manifest.currentGeneration.token,
          cleanupPending: manifest.obsoleteGenerations.length > 0,
          evidence: "DURABLE_GENERATION",
          unchanged: true,
        }
      : null;
  },
  /** Projects trusted source and index identity to Discovery. @param {Object} request Ingestion or retrieval scope. @param {Object} source Registered source. @returns {Object} Owner request. */
  scope: function (request, source) {
    return {
      tenant: request.indexTenant,
      guardedWrites: true,
      authData: request.authData,
      ownerType: "COPILOT_KNOWLEDGE",
      ownerCode: source.code,
      indexName:
        request.configuration.indexName ||
        request.indexConfiguration?.indexName ||
        "discoveryDocumentProjection",
      indexConfigurationCode:
        request.configuration.indexConfigurationCode || "copilotKnowledge",
    };
  },
  /** Claims a generation after eligibility and bounded chunk construction. @param {Object} request Ingestion request. @param {Object[]} projections Safe derived documents. @returns {Promise<Object>} Discovery claim. */
  begin: async function (request, projections) {
    const scope = this.scope(request, request.source);
    const owner = SERVICE.DefaultDiscoveryGenerationPublicationService;
    if (!owner) throw new Error("COPILOT_GENERATION_PUBLICATION_REQUIRED");
    const claimed = await owner.begin(scope, {
      digest: request.source.sourcePolicyDigest,
      count: projections.length,
      contentDigest: this.fingerprint(projections),
    });
    for (const model of projections) {
      model.code += "|" + claimed.pendingGeneration.token;
      model.payload.publicationOwner = request.source.code;
      model.payload.publicationGeneration = claimed.pendingGeneration.token;
    }
    return claimed;
  },
  /** Guards one physical projection dispatch and records only its acknowledged completion. @param {Object} request Ingestion scope. @param {Object} claimed Private manifest. @param {Function} execute Physical write with strict acknowledgement validation. @returns {Promise<Object>} Same-generation write completion. */
  write: async function (request, claimed, execute) {
    const scope = this.scope(request, request.source);
    const owner = SERVICE.DefaultDiscoveryGenerationPublicationService;
    await request.assertCurrent?.();
    const started = await owner.startWrite(scope, claimed);
    await request.assertCurrent?.();
    await execute();
    const completed = await owner.completeWrite(scope, started);
    if (completed.pendingGeneration?.token !== started.pendingGeneration.token)
      throw new Error("COPILOT_GENERATION_WRITER_RETIRED");
    return completed;
  },
  /** Requires sealed writes, visible complete indexing and current policy before atomic publication; cleanup failure remains explicit. @param {Object} request Ingestion request. @param {Object} claimed Discovery writer claim. @returns {Promise<Object>} Safe publication receipt. */
  finish: async function (request, claimed) {
    const scope = this.scope(request, request.source);
    const owner = SERVICE.DefaultDiscoveryGenerationPublicationService;
    await request.assertCurrent?.();
    claimed = await owner.sealWriter(scope, claimed);
    const response =
      await SERVICE.DefaultDiscoveryDocumentProjectionService.doRefresh({
        tenant: scope.tenant,
        authData: scope.authData,
        indexName: scope.indexName,
      });
    const result = response?.result?.body || response?.result;
    if (
      !owner.acknowledged(response) ||
      !result?._shards ||
      result._shards.failed !== 0 ||
      !Number.isSafeInteger(result._shards.successful) ||
      result._shards.successful < 1
    )
      throw new Error("COPILOT_GENERATION_VISIBILITY_UNCONFIRMED");
    if (
      (await owner.count(scope, claimed.pendingGeneration.token)) !==
      claimed.pendingGeneration.count
    )
      throw new Error("COPILOT_GENERATION_INCOMPLETE");
    await request.assertCurrent?.();
    const current = await owner.publish(scope, claimed);
    let cleanupPending = current.obsoleteGenerations.length > 0;
    if (cleanupPending) {
      try {
        const cleaned = await owner.cleanup(scope, {
          expectedRevision: current.revision,
          publishedOnly: true,
          assertCurrent: request.assertCurrent,
        });
        cleanupPending = cleaned.obsoleteGenerations.length > 0;
      } catch {
        /* A published generation stays current; report cleanup debt without replaying ingestion. */
      }
    }
    return {
      generation: current.currentGeneration.token,
      cleanupPending,
      evidence: "DURABLE_GENERATION",
    };
  },
  /** Reads currently published policy-bound generations only for an already-authorized source set. @param {Object} request Retrieval request. @param {Object[]} sources Authorized sources. @returns {Promise<Map>} Source-to-generation binding. */
  active: async function (request, sources) {
    const owner = SERVICE.DefaultDiscoveryGenerationPublicationService;
    if (!owner) throw new Error("COPILOT_GENERATION_PUBLICATION_REQUIRED");
    const active = new Map();
    for (const source of sources) {
      if (["DATABASE", "EXTERNAL_LOG"].includes(source.sourceType)) continue;
      const manifest = await owner.read(this.scope(request, source));
      if (manifest?.currentGeneration?.digest === source.sourcePolicyDigest)
        active.set(source.code, manifest.currentGeneration.token);
    }
    return active;
  },
  /** Combines durable publication metadata with an actual current index-count probe. @param {Object} request Scoped owner read. @param {Object} source Registered source. @returns {Promise<Object>} Minimized status. */
  inspect: async function (request, source) {
    const owner = SERVICE.DefaultDiscoveryGenerationPublicationService;
    const scope = this.scope(request, source);
    const manifest = await owner.read(scope);
    const current = manifest?.currentGeneration;
    const matching = current?.digest === source.sourcePolicyDigest;
    const intact =
      matching && (await owner.count(scope, current.token)) === current.count;
    return {
      state: !current ? "UNKNOWN" : intact ? "PROJECTED" : "STALE",
      indexedVersion: intact ? source.version : null,
      refreshedAt: current?.at || null,
      evidence: "DURABLE_GENERATION",
      inspectionRequired: !!manifest?.pendingGeneration,
      cleanupPending: !!manifest?.obsoleteGenerations.length,
      ...(manifest?.pendingGeneration?.writer
        ? {
            progress: {
              phase: manifest.pendingGeneration.writer.state,
              acknowledgedChunks: manifest.pendingGeneration.writer.completed,
              expectedChunks: manifest.pendingGeneration.count,
            },
          }
        : {}),
    };
  },
};
