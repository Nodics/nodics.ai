/* Nodics - Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
const evidenceDefinition = require("../../src/service/operations/defaultBackofficeRepairEvidenceService");
const clone = value => structuredClone(value);
/** Generated-service and transaction doubles retain data across owner recreation. */
module.exports = function repairEvidenceHarness() {
  const state = { receipt: new Map(), lock: new Map(), commits: 0, failAcknowledgement: false };
  let queue = Promise.resolve();
  const matches = (row, query) => Object.entries(query).every(([key, value]) => row[key] === value);
  const store = kind => ({
    async get(request) {
      const map = request.transactionContext?.[kind] || state[kind];
      return { result: [...map.values()].filter(row => matches(row, request.query)).map(clone) };
    },
    async save(request) {
      const map = request.transactionContext?.[kind] || state[kind];
      if (map.has(request.model.code)) throw new Error("duplicate");
      const value = clone({ ...request.model, revision: 1 });
      request.model._id = "generated-metadata";
      map.set(value.code, value);
      return { result: clone(value) };
    },
    async update(request) {
      const map = request.transactionContext?.[kind] || state[kind];
      const row = map.get(request.query.code);
      if (!row || !matches(row, request.query)) return { result: { matchedCount: 0 } };
      map.set(row.code, clone({ ...row, ...request.model, revision: row.revision + 1 }));
      return { result: { matchedCount: 1 } };
    }
  });
  const services = {
    DefaultBackofficeRepairReceiptService: store("receipt"),
    DefaultBackofficeRepairTargetService: store("lock"),
    DefaultInfraService: { getValidatedBuildIdentity: () => ({ project: "project", environment: "local", server: "platform", inputDigest: "a".repeat(64) }) },
    DefaultIdentityGovernanceService: { getSystemAuthData: () => ({ isSystem: true }) },
    DefaultDatabaseTransactionService: {
      capabilities: () => ({ multiRecordAtomic: true, contextPropagation: true }),
      execute(binding, work) {
        const current = queue.then(async () => {
          const tx = { receipt: clone(state.receipt), lock: clone(state.lock) };
          const result = await work(tx);
          state.receipt = tx.receipt; state.lock = tx.lock; state.commits++;
          if (state.failAcknowledgement) { state.failAcknowledgement = false; throw new Error("lost acknowledgement"); }
          return result;
        });
        queue = current.catch(() => {});
        return current;
      }
    },
    DefaultBackofficeRepairEvidenceService: Object.assign({}, evidenceDefinition)
  };
  return { state, services, restart: () => { services.DefaultBackofficeRepairEvidenceService = Object.assign({}, evidenceDefinition); return services.DefaultBackofficeRepairEvidenceService; } };
};
