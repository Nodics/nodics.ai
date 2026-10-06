/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module discoveryPublication/test/discoveryErasureLive
 * @description Opt-in real secured Elastic and MongoDB journal acceptance for original index erasure. Trusted test declarations are not Profile login, Axis acceptance or a production migration.
 * @layer test @owner discoveryPublication
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const { fork } = require("node:child_process");
const { once } = require("node:events");
const path = require("node:path");
const owner = require("../src/service/defaultDiscoveryIndexRetirementService");
const receiptSchema = require("../src/schemas/schemas").discoveryPublication
  .discoveryIndexRetirementReceipt;

test(
  "qualified erasure uses real revoked writers, exact index removal and durable original receipts",
  {
    skip: process.env.NODICS_ERASURE_LIVE !== "1",
    timeout: 180000,
  },
  async (t) => {
    const provider = require("../../../../nodics.foundation/modules/nSearch/elastic/test/helpers/isolatedRetirementProvider");
    const persistence = require("../../../../nodics.foundation/modules/nDatabase/mongodb/test/helpers/disposableJournal");
    const previous = { SERVICE: global.SERVICE, CLASSES: global.CLASSES };
    t.after(() => Object.assign(global, previous));
    global.CLASSES = { NodicsError: class extends Error {} };
    global.SERVICE = {
      DefaultElasticIndexRetirementService: require("../../../../nodics.foundation/modules/nSearch/elastic/src/service/defaultElasticIndexRetirementService"),
      DefaultModelCommandReceiptService: require("../../../../nodics.foundation/modules/nDatabase/database/src/service/schema/defaultModelCommandReceiptService"),
      DefaultModelValidatorService: {
        ...require("../../../../nodics.foundation/modules/nDatabase/database/src/service/model/defaultModelValidatorService"),
        LOG: { debug() {} },
      },
    };
    const elastic = await provider.start();
    t.after(() => elastic.close());
    const journal = await persistence.create(receiptSchema);
    t.after(() => journal.close());
    SERVICE.DefaultDiscoveryIndexRetirementReceiptService = journal.service;
    const models = new Map();
    SERVICE.DefaultDiscoveryDocumentProjectionService = {
      getSearchModel: (input) => models.get(input.indexName),
    };
    let serial = 0;
    /** Confirms original evidence in a fresh process using private IPC, without printing credentials. */
    async function inspectFresh(request, target) {
      const child = fork(
        path.join(__dirname, "helpers/inspectErasureChild.js"),
        [],
        { stdio: ["ignore", "ignore", "ignore", "ipc"] },
      );
      const exited = once(child, "exit");
      const message = once(child, "message");
      const timer = setTimeout(() => child.kill("SIGTERM"), 15000);
      child.send({
        request,
        databaseName: journal.databaseName,
        provider: elastic.inspectionInput(target.model),
      });
      try {
        const response = await Promise.race([
          message,
          exited.then(() => {
            throw new Error("Inspection child exited before evidence");
          }),
        ]);
        assert.equal((await exited)[0], 0);
        assert.equal(response[0].error, undefined);
        return response[0].result;
      } finally {
        clearTimeout(timer);
        if (child.exitCode === null && child.signalCode === null) {
          child.kill("SIGTERM");
          await exited;
        }
      }
    }
    /** Supplies explicit disposable scope and real replacement counts to the existing owner. */
    async function prepare() {
      const scope = {
        tenantCode: "isolated",
        enterpriseCode: "erasure-test",
        ownerType: "COPILOT_KNOWLEDGE",
      };
      const target = await elastic.createTarget(scope);
      const logical = "isolated-legacy-" + ++serial;
      models.set(logical, target.model);
      const request = {
        tenant: scope.tenantCode,
        enterpriseCode: scope.enterpriseCode,
        ownerType: scope.ownerType,
        principalCode: "test-employee",
        legacyIndexName: logical,
        planCode: logical,
        assertCurrent: async () => {},
        replacementEvidence: target.replacementEvidence,
      };
      const preview = await owner.preview(request);
      assert.equal(
        (await owner.execute(request, preview.reviewDigest)).state,
        "RETIRED",
      );
      await assert.rejects(
        owner.previewErasure(request),
        /SEARCH_INDEX_RETIREMENT_UNCONFIRMED/,
      );
      await target.revoke();
      return { target, request, review: await owner.previewErasure(request) };
    }
    await t.test(
      "current writer refuses erasure; revoked writer permits one competing claim, reconnect inspection and no replay",
      async () => {
        const { target, request, review } = await prepare();
        const results = await Promise.allSettled([
          owner.erase(request, review.reviewDigest),
          owner.erase(request, review.reviewDigest),
        ]);
        assert.equal(
          results.filter((result) => result.status === "fulfilled").length,
          1,
        );
        await journal.reconnect();
        const result = owner.projectErasure(
          request,
          await owner.erasureEvidence(request),
        );
        assert.deepEqual(result, {
          contractVersion: 1,
          planCode: request.planCode,
          state: "ERASED",
          retainedLegacyData: false,
          physicalCleanupComplete: true,
        });
        assert.deepEqual(await inspectFresh(request, target), result);
        await assert.rejects(owner.erase(request, review.reviewDigest));
        await assert.rejects(
          owner.erasureEvidence({
            ...request,
            principalCode: "foreign-employee",
          }),
        );
        await assert.rejects(
          owner.erasureEvidence({
            ...request,
            enterpriseCode: "foreign-enterprise",
          }),
        );
      },
    );
    await t.test(
      "lost native delete acknowledgement persists uncertainty despite real absence",
      async () => {
        const { target, request, review } = await prepare();
        target.loseDeleteAcknowledgement();
        await assert.rejects(owner.erase(request, review.reviewDigest));
        await journal.reconnect();
        const evidence = await owner.erasureEvidence(request);
        assert.equal(evidence.physical.absent, true);
        assert.equal(
          owner.projectErasure(request, evidence).state,
          "OUTCOME_UNKNOWN",
        );
        assert.equal(
          (await inspectFresh(request, target)).state,
          "OUTCOME_UNKNOWN",
        );
        await assert.rejects(owner.erase(request, review.reviewDigest));
      },
    );
    await t.test(
      "lost completion response recovers only the persisted original result",
      async () => {
        const { request, review } = await prepare();
        const update = journal.service.update;
        journal.service.update = async (input) => {
          const result = await update(input);
          if (input.model.erasure?.state === "ERASED")
            throw new Error("Injected completion response loss");
          return result;
        };
        try {
          await assert.rejects(owner.erase(request, review.reviewDigest));
        } finally {
          journal.service.update = update;
        }
        await journal.reconnect();
        assert.equal(
          owner.projectErasure(request, await owner.erasureEvidence(request))
            .state,
          "ERASED",
        );
        await assert.rejects(owner.erase(request, review.reviewDigest));
      },
    );
    await t.test(
      "lost persisted claim acknowledgement never dispatches a delete or enables replay",
      async () => {
        const { target, request, review } = await prepare();
        const update = journal.service.update;
        journal.service.update = async (input) => {
          const result = await update(input);
          if (input.model.erasure?.state === "STARTED")
            throw new Error("Injected claim response loss");
          return result;
        };
        try {
          await assert.rejects(owner.erase(request, review.reviewDigest));
        } finally {
          journal.service.update = update;
        }
        assert.equal((await target.model.inspectRetirement()).blocked, true);
        assert.equal(
          (await inspectFresh(request, target)).state,
          "OUTCOME_UNKNOWN",
        );
        await assert.rejects(owner.erase(request, review.reviewDigest));
      },
    );
    await t.test(
      "revoked owner authority and a recreated physical UUID refuse the old review",
      async () => {
        const { target, request, review } = await prepare();
        await assert.rejects(
          owner.erase(
            {
              ...request,
              assertCurrent: async () => {
                throw new Error("Owner authority revoked");
              },
            },
            review.reviewDigest,
          ),
        );
        const before = await target.model.inspectRetirement();
        await target.recreate();
        const after = await target.model.inspectRetirement();
        assert.notEqual(after.uuid, before.uuid);
        await assert.rejects(owner.erase(request, review.reviewDigest));
        assert.equal((await target.model.inspectRetirement()).uuid, after.uuid);
      },
    );
    t.diagnostic(
      JSON.stringify({
        provider: elastic.version,
        evidence: "ISOLATED_REAL_PROVIDER_AND_DURABLE_JOURNAL",
        profileLoginVerified: false,
        axisVerified: false,
      }),
    );
  },
);
