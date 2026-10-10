/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module wasteCore/test/helpers/installedOwnerAcceptance
 * @description Opt-in read-only inspection of actual generated ownership models in an already booted LOCAL Waste runtime. Integration flags and financial acceptance are independent.
 * @layer test @owner wasteCore
 * @sideEffects Reads provider topology and existing indexes only. No records, credentials, grants, configuration, collections or indexes are created or changed.
 */
function requireEvidence(condition, message) {
  if (!condition) throw new Error("Installed Waste acceptance: " + message);
}

/** Invoke inside the selected Waste process, not a separate unbooted Node process. Never returns database names, URIs or business rows. */
async function inspectOwnershipPersistence({ tenant } = {}) {
  requireEvidence(process.env.NODICS_WASTE_INSTALLED_ACCEPTANCE === "1", "explicit opt-in required");
  requireEvidence(typeof CONFIG !== "undefined" && typeof NODICS !== "undefined" &&
    typeof SERVICE !== "undefined" && typeof UTILS !== "undefined", "booted owner runtime required");
  const role = CONFIG.get("runtimeRole");
  requireEvidence((typeof role === "string" ? role : role?.code) === "WASTE" &&
    CONFIG.get("environment")?.class === "LOCAL", "LOCAL WASTE runtime required");
  requireEvidence(typeof NODICS.getServerState === "function" &&
    ["ready", "started"].includes(String(NODICS.getServerState()).toLowerCase()), "ready runtime required");
  requireEvidence(typeof tenant === "string" && /^[A-Za-z0-9_.:@-]{1,128}$/.test(tenant), "exact tenant required");
  const owner = SERVICE.DefaultWasteAssetTransferOperationService;
  requireEvidence(typeof owner?.digitalPersistence === "function" && typeof NODICS.getModels === "function" &&
    typeof UTILS.createModelName === "function", "installed persistence owner required");
  const models = NODICS.getModels("wasteCore", tenant) || {}, databases = new Set(), inspected = [];
  for (const schema of ["wasteAsset", "wasteAssetOwnershipEvent"]) {
    const model = models[UTILS.createModelName(schema)];
    requireEvidence(model?.moduleName === "wasteCore" && model.schemaName === schema && model.versioned === false,
      "actual unversioned generated owner required");
    const database = model.dataBase, uri = database?.getRUI?.();
    requireEvidence(typeof uri === "string" &&
      /^mongodb:\/\/127\.0\.0\.1:\d+\/?(?:\?replicaSet=[A-Za-z0-9._-]+)?$/.test(uri) &&
      Number(uri.match(/:(\d+)/)[1]) >= 1 && Number(uri.match(/:(\d+)/)[1]) <= 65535,
    "credential-free loopback provider required");
    try {
      if (!databases.has(database)) {
        const hello = await database.getConnection().command({ hello: 1 });
        requireEvidence(hello.isWritablePrimary === true && !hello.msg && !hello.passives?.length && !hello.arbiters?.length &&
          (!hello.setName || (Array.isArray(hello.hosts) && hello.hosts.length > 0 &&
            hello.hosts.every(host => /^127\.0\.0\.1:\d+$/.test(host)))), "writable native loopback provider required");
        databases.add(database);
      }
      // Reuse exactly the business owner's CAS/index/revision prerequisites; no qualification flag or completed sale is needed.
      const field = await owner.digitalPersistence({ tenant }, schema);
      inspected.push({ schema, uniqueIdentity: true, compareAndSet: true, revisionField: field ?? null });
    } catch (_) {
      throw new Error("Installed Waste acceptance: provider or generated persistence inspection unconfirmed");
    }
  }
  return { contractVersion: 1, acceptance: "INSTALLED_WASTE_OWNERSHIP_PERSISTENCE_PREFLIGHT", tenant,
    schemas: inspected, readOnly: true, integrationFlagsChanged: false, signedTransportProven: false,
    saleRefundProven: false, productionQualified: false };
}

module.exports = { inspectOwnershipPersistence };
