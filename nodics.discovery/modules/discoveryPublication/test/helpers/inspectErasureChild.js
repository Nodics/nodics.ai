/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module discoveryPublication/test/inspectErasureChild
 * @description Independent read-only process reconstructing original erasure evidence from real providers. No inherited JavaScript receipt state and no mutation command.
 * @layer test @owner discoveryPublication
 */
const owner = require("../../src/service/defaultDiscoveryIndexRetirementService");
const provider = require("../../../../../nodics.foundation/modules/nSearch/elastic/test/helpers/isolatedRetirementProvider");
const persistence = require("../../../../../nodics.foundation/modules/nDatabase/mongodb/test/helpers/disposableJournal");
process.once("message", async (input) => {
  let elastic, journal;
  try {
    global.CLASSES = { NodicsError: class extends Error {} };
    global.SERVICE = {
      DefaultElasticIndexRetirementService: require("../../../../../nodics.foundation/modules/nSearch/elastic/src/service/defaultElasticIndexRetirementService"),
      DefaultModelCommandReceiptService: require("../../../../../nodics.foundation/modules/nDatabase/database/src/service/schema/defaultModelCommandReceiptService"),
    };
    elastic = await provider.openInspection(input.provider);
    journal = await persistence.create(
      require("../../src/schemas/schemas").discoveryPublication
        .discoveryIndexRetirementReceipt,
      input.databaseName,
    );
    SERVICE.DefaultDiscoveryDocumentProjectionService = {
      getSearchModel: () => elastic.model,
    };
    SERVICE.DefaultDiscoveryIndexRetirementReceiptService = journal.service;
    const request = {
      ...input.request,
      assertCurrent: async () => {},
      replacementEvidence: async () => {
        throw new Error("Read-only inspection must not require replacements");
      },
    };
    const result = owner.projectErasure(
      request,
      await owner.erasureEvidence(request),
    );
    process.send({ result });
  } catch {
    process.send({ error: "Independent inspection failed" });
    process.exitCode = 1;
  } finally {
    await journal?.close();
    await elastic?.close();
    process.disconnect();
  }
});
