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
/** @module copilotKnowledge/service/DefaultCopilotKnowledgeWriterRecoveryService
 * @description Reviews and audits explicit retirement of one pending publication through Discovery CAS without stopping workers or deleting data.
 * @layer service @owner copilotKnowledge
 * @override Preserve independent recovery permission, current policy, exact pending identity and age, pre-command audit and uncertain-outcome handling. No takeover or retry timer.
 */
module.exports = {
  /** Rejects without source paths, generation tokens or index details. @returns {never} Throws. */
  fail: function () {
    throw new CLASSES.NodicsError("ERR_CPK_00020");
  },
  /** Resolves independently permitted maintenance and current age policy. @param {Object} request Trusted employee. @returns {Object} Scope and bounds. */
  authorize: function (request) {
    const selected = SERVICE.DefaultCopilotKnowledgeCleanupService.authorize(
      request,
      "copilot.knowledge.recovery.execute",
    );
    const policy = CONFIG.get("copilot")?.knowledge?.writerRecovery;
    if (
      policy?.enabled !== true ||
      !Number.isSafeInteger(policy.minimumPendingAgeMs) ||
      policy.minimumPendingAgeMs < 60000 ||
      policy.minimumPendingAgeMs > 86400000
    )
      this.fail();
    return {
      ...selected,
      minimumPendingAgeMs: policy.minimumPendingAgeMs,
      identity: JSON.stringify([
        request.tenant,
        request.securityContext?.enterprise,
        request.securityContext?.actor,
      ]),
    };
  },
  /** Rechecks source eligibility, index routing and recovery policy immediately before owner transitions. @param {Object} request Employee. @param {Object} selected Original scope. @returns {void} Throws on drift. */
  current: function (request, selected) {
    const fresh = this.authorize(request);
    if (
      fresh.identity !== selected.identity ||
      fresh.binding !== selected.binding ||
      fresh.source.sourcePolicyDigest !== selected.source.sourcePolicyDigest ||
      fresh.minimumPendingAgeMs !== selected.minimumPendingAgeMs
    )
      this.fail();
  },
  /** Binds the review to the private pending token without returning that token to Axis. @param {Object} request Employee. @param {Object} selected Scope. @param {Object} manifest Current publication. @returns {string} Review fingerprint. */
  digest: function (request, selected, manifest) {
    return crypto
      .createHash("sha256")
      .update(
        JSON.stringify([
          "RETIRE_PENDING_PUBLICATION",
          SERVICE.DefaultCopilotKnowledgeCleanupService.digest(
            request,
            selected,
            manifest.revision,
          ),
          manifest.pendingGeneration.token,
          selected.minimumPendingAgeMs,
        ]),
      )
      .digest("hex");
  },
  /** Requires an exact pending manifest and projects bounded eligibility. @param {Object} selected Scope. @param {Object} manifest Authoritative record. @returns {Object} Age and count. */
  pending: function (selected, manifest) {
    const pending = manifest?.pendingGeneration;
    const at = Date.parse(pending?.at);
    if (
      !pending ||
      !Number.isSafeInteger(manifest.revision) ||
      manifest.revision < 0 ||
      !Number.isFinite(at) ||
      at > Date.now() ||
      !Number.isSafeInteger(pending.count) ||
      pending.count < 0 ||
      pending.count > 1000000 ||
      !/^[a-f0-9-]{36}$/.test(pending.token || "") ||
      manifest.obsoleteGenerations.length >= 100
    )
      this.fail();
    return {
      startedAt: new Date(at).toISOString(),
      expectedChunks: pending.count,
      eligible: Date.now() - at >= selected.minimumPendingAgeMs,
    };
  },
  /** Reads one inert review without changing the writer or index. @param {Object} request Trusted employee. @returns {Promise<Object>} Minimized review. */
  preview: async function (request) {
    try {
      const selected = this.authorize(request);
      if (Object.keys(request.body || {}).length) this.fail();
      const manifest =
        await SERVICE.DefaultDiscoveryGenerationPublicationService.read(
          selected.scope,
        );
      const pending = this.pending(selected, manifest);
      this.current(request, selected);
      return {
        contractVersion: 1,
        state: "REVIEWED",
        sourceCode: selected.source.code,
        sourcePolicyDigest: selected.source.sourcePolicyDigest,
        revision: manifest.revision,
        reviewDigest: this.digest(request, selected, manifest),
        ...pending,
      };
    } catch {
      this.fail();
    }
  },
  /** Retires only the reviewed pending publication after durable authorization; uncertain acknowledgement never becomes success. @param {Object} request Explicit confirmation. @returns {Promise<Object>} Acknowledged retirement. */
  execute: async function (request) {
    try {
      const selected = this.authorize(request);
      const body = request.body || {};
      if (
        Object.keys(body).length !== 4 ||
        Object.keys(body).some(
          (key) =>
            ![
              "confirmed",
              "expectedRevision",
              "expectedPolicyDigest",
              "reviewDigest",
            ].includes(key),
        ) ||
        body.confirmed !== true ||
        !Number.isSafeInteger(body.expectedRevision) ||
        body.expectedRevision < 0 ||
        body.expectedPolicyDigest !== selected.source.sourcePolicyDigest
      )
        this.fail();
      const owner = SERVICE.DefaultDiscoveryGenerationPublicationService;
      const manifest = await owner.read(selected.scope);
      if (
        !this.pending(selected, manifest).eligible ||
        body.expectedRevision !== manifest.revision ||
        body.reviewDigest !== this.digest(request, selected, manifest)
      )
        this.fail();
      const operationCode = "retire-" + crypto.randomUUID();
      const audit = SERVICE.DefaultCopilotKnowledgeCleanupService;
      this.current(request, selected);
      await audit.audit(
        request,
        selected,
        operationCode,
        "WRITER_RETIREMENT_AUTHORIZED",
        manifest.revision,
      );
      const result = await owner.abandon(
        selected.scope,
        manifest.revision,
        manifest.pendingGeneration.token,
        {
          assertCurrent: () => this.current(request, selected),
        },
      );
      this.current(request, selected);
      if (
        !result ||
        result.pendingGeneration ||
        result.revision !== manifest.revision + 1 ||
        !result.obsoleteGenerations.includes(
          manifest.pendingGeneration.token,
        ) ||
        JSON.stringify(result.currentGeneration) !==
          JSON.stringify(manifest.currentGeneration)
      )
        this.fail();
      await audit.audit(
        request,
        selected,
        operationCode,
        "WRITER_RETIREMENT_COMPLETED",
        result.revision,
      );
      this.current(request, selected);
      return {
        contractVersion: 1,
        state: "RETIRED",
        sourceCode: selected.source.code,
        sourcePolicyDigest: selected.source.sourcePolicyDigest,
        revision: result.revision,
        cleanupPending: true,
      };
    } catch {
      this.fail();
    }
  },
};
