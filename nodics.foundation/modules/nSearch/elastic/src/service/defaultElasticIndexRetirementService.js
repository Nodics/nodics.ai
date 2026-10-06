/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module elastic/service/DefaultElasticIndexRetirementService
 * @description Qualifies retirement and separately reviewed erasure of one dedicated immutable index through its existing nSearch connection. Never reopens, recreates or changes credentials.
 * @layer service @owner elastic
 * @override Preserve exact physical identity, no aliases or wildcard expansion, full shard acknowledgement and no implicit retry. Index administrators must preserve immutable physical names during retirement.
 */
module.exports = {
  /** Rejects ambiguous provider evidence. @returns {never} Throws. */
  fail: function () {
    throw new Error("SEARCH_INDEX_RETIREMENT_UNCONFIRMED");
  },
  /** Resolves only a dedicated, explicitly qualified index on the existing connection. @param {Object} model nSearch model. @returns {Object} Provider binding. */
  binding: function (model) {
    const index = model?.indexDef?.indexName?.toLowerCase();
    if (
      typeof index !== "string" ||
      !/^[a-z0-9][a-z0-9._-]{0,199}$/.test(index) ||
      model.indexDef.retirement?.dedicated !== true ||
      model.indexDef.retirement?.immutablePhysicalName !== true
    )
      this.fail();
    const indices = model.searchEngine?.getConnection()?.indices;
    if (
      typeof indices?.get !== "function" ||
      typeof indices?.addBlock !== "function" ||
      indices.get.constructor.name !== "AsyncFunction" ||
      indices.addBlock.constructor.name !== "AsyncFunction"
    )
      this.fail();
    return { index, indices };
  },
  /** Reads exact UUID and write-block metadata without accepting aliases, data streams or provider error envelopes. @param {Object} model nSearch model. @param {boolean} [allowMissing=false] Accept only an exact typed index-not-found response for erasure inspection. @returns {Promise<Object>} Exact index evidence. */
  inspect: async function (model, allowMissing = false) {
    const { index, indices } = this.binding(model);
    let response;
    try {
      response = await indices.get(
        {
          index,
          allow_no_indices: false,
          ignore_unavailable: false,
          expand_wildcards: "none",
          flat_settings: true,
        },
        { maxRetries: 0 },
      );
    } catch (error) {
      const failure = error.meta?.body?.error;
      if (
        allowMissing === true &&
        error.meta?.statusCode === 404 &&
        failure?.type === "index_not_found_exception" &&
        failure.index === index
      )
        return { index, absent: true };
      throw error;
    }
    const body = response?.body || response;
    const record = body?.[index];
    const settings = record?.settings;
    if (
      !body ||
      Object.keys(body).length !== 1 ||
      !record ||
      record.data_stream ||
      !record.aliases ||
      Object.keys(record.aliases).length ||
      typeof settings?.["index.uuid"] !== "string" ||
      !/^[A-Za-z0-9_-]{10,128}$/.test(settings["index.uuid"]) ||
      (settings["index.blocks.write"] !== undefined &&
        !["true", "false", true, false].includes(
          settings["index.blocks.write"],
        ))
    )
      this.fail();
    return {
      index,
      uuid: settings["index.uuid"],
      blocked: [true, "true"].includes(settings["index.blocks.write"]),
    };
  },
  /** Applies one provider barrier after exact identity and caller revalidation; ambiguous acknowledgement is never quiescence. @param {Object} model nSearch model. @param {Object} input Reviewed UUID and owner guard. @returns {Promise<Object>} Qualified retirement. */
  retire: async function (model, input) {
    const original = await this.inspect(model);
    if (
      original.uuid !== input.expectedUUID ||
      original.blocked ||
      typeof input.assertCurrent !== "function"
    )
      this.fail();
    await input.assertCurrent();
    const { index, indices } = this.binding(model);
    if (index !== original.index) this.fail();
    const response = await indices.addBlock(
      {
        index,
        block: "write",
        allow_no_indices: false,
        ignore_unavailable: false,
        expand_wildcards: "none",
        timeout: "30s",
        master_timeout: "30s",
      },
      { maxRetries: 0 },
    );
    const body = response?.body || response;
    if (
      body?.acknowledged !== true ||
      body.shards_acknowledged !== true ||
      body.error ||
      body.success === false ||
      !Array.isArray(body.indices) ||
      body.indices.length !== 1 ||
      body.indices[0].name !== index ||
      body.indices[0].blocked !== true ||
      body.indices[0].exception ||
      body.indices[0].error
    )
      this.fail();
    const current = await this.inspect(model);
    if (current.uuid !== original.uuid || !current.blocked) this.fail();
    return { ...current, acknowledged: true, quiescent: true, retained: true };
  },
  /** Verifies the deployment's exhaustive API-key-only writer inventory without changing credentials or cluster settings. Unknown/mixed writers require a different qualified provider. @param {Object} model Registered model. @returns {Promise<Object>} Private decommissioning evidence. */
  decommissioned: async function (model) {
    const { index } = this.binding(model);
    const policy = model.indexDef.retirement.erasure;
    const ids = policy?.writerApiKeyIds;
    if (
      policy?.writerInventoryComplete !== true ||
      policy?.writerCredentialMode !== "API_KEY_ONLY" ||
      !Array.isArray(ids) ||
      ids.length < 1 ||
      ids.length > 100 ||
      new Set(ids).size !== ids.length ||
      ids.some(
        (id) => typeof id !== "string" || !/^[A-Za-z0-9_-]{1,256}$/.test(id),
      )
    )
      this.fail();
    const connection = model.searchEngine.getConnection();
    if (
      typeof connection.security?.getApiKey !== "function" ||
      typeof connection.cluster?.getSettings !== "function"
    )
      this.fail();
    const keys = [...ids].sort();
    for (const id of keys) {
      const response = await connection.security.getApiKey(
        { id },
        { maxRetries: 0 },
      );
      const body = response?.body || response;
      if (
        body?.error ||
        !Array.isArray(body?.api_keys) ||
        body.api_keys.length !== 1 ||
        body.api_keys[0].id !== id ||
        body.api_keys[0].invalidated !== true
      )
        this.fail();
    }
    const response = await connection.cluster.getSettings(
      { flat_settings: true, include_defaults: true },
      { maxRetries: 0 },
    );
    const settings = response?.body || response;
    const automatic =
      settings?.transient?.["action.auto_create_index"] ??
      settings?.persistent?.["action.auto_create_index"] ??
      settings?.defaults?.["action.auto_create_index"];
    if (settings?.error || ![false, "false"].includes(automatic)) this.fail();
    return {
      index,
      writerApiKeyIds: keys,
      invalidated: true,
      automaticCreationDisabled: true,
    };
  },
  /** Deletes exactly one reviewed, still-blocked UUID after independent decommissioning and owner checks. A timeout is never retried. @param {Object} model Registered model. @param {Object} input Original UUID and fresh owner guard. @returns {Promise<Object>} Acknowledged removal and absence. */
  erase: async function (model, input) {
    const connection = model.searchEngine?.getConnection();
    const original = await this.inspect(model);
    if (
      original.uuid !== input.expectedUUID ||
      original.blocked !== true ||
      typeof input.assertCurrent !== "function"
    )
      this.fail();
    await this.decommissioned(model);
    await input.assertCurrent();
    const latest = await this.inspect(model);
    if (latest.uuid !== original.uuid || latest.blocked !== true) this.fail();
    const { index, indices } = this.binding(model);
    if (
      index !== original.index ||
      model.searchEngine.getConnection() !== connection ||
      typeof indices.delete !== "function"
    )
      this.fail();
    const response = await indices.delete(
      {
        index,
        allow_no_indices: false,
        ignore_unavailable: false,
        expand_wildcards: "none",
        timeout: "30s",
        master_timeout: "30s",
      },
      { maxRetries: 0 },
    );
    const body = response?.body || response;
    if (body?.acknowledged !== true || body.error || body.success === false)
      this.fail();
    const current = await this.inspect(model, true);
    if (current.absent !== true || current.index !== original.index)
      this.fail();
    return { index, uuid: original.uuid, acknowledged: true, absent: true };
  },
};
