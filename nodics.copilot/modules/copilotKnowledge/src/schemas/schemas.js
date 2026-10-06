/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module copilotKnowledge/src/schemas/schemas
 * @description Private generated persistence for source-maintenance authorization and completion receipts.
 * @layer definition
 * @owner copilotKnowledge
 * @override Preserve private receipt identity and audit evidence; never expose generic browser mutation routes.
 */
module.exports = {
  copilotKnowledge: {
    copilotKnowledgeMaintenance: {
      super: "base",
      model: true,
      service: { enabled: true },
      router: { enabled: false },
      cache: { enabled: false },
      event: { enabled: false },
      search: { enabled: false },
      indexes: {
        composite: {
          tenantCode: { name: "tenantCode", enabled: true },
          enterpriseCode: { name: "enterpriseCode", enabled: true },
          sourceCode: { name: "sourceCode", enabled: true },
          occurredAt: { name: "occurredAt", enabled: true },
          code: { name: "code", enabled: true },
        },
        individual: {
          receiptIdentity: {
            name: "code",
            enabled: true,
            options: { unique: true },
          },
        },
      },
      definition: {
        code: {
          type: "string",
          required: true,
          description: "Immutable maintenance receipt identity.",
        },
        operationCode: {
          type: "string",
          required: true,
          description:
            "Correlates authorization and completion receipts; not a replay credential.",
        },
        tenantCode: {
          type: "string",
          required: true,
          description: "Trusted tenant partition.",
        },
        enterpriseCode: {
          type: "string",
          required: true,
          description: "Employee enterprise context.",
        },
        principalCode: {
          type: "string",
          required: true,
          description: "Authenticated employee authorizing maintenance.",
        },
        sourceCode: {
          type: "string",
          required: true,
          description:
            "Governed source identity; no filesystem or index query.",
        },
        reviewDigest: {
          type: "string",
          required: true,
          description: "Reviewed source/policy/routing/revision fingerprint.",
        },
        revision: {
          type: "int",
          required: true,
          description: "Observed Discovery manifest revision.",
        },
        stage: {
          type: "string",
          required: true,
          description:
            "CLEANUP_AUTHORIZED, CLEANUP_COMPLETED, WRITER_RETIREMENT_AUTHORIZED or WRITER_RETIREMENT_COMPLETED; absent completion remains uncertain.",
        },
        occurredAt: {
          type: "string",
          required: true,
          description: "UTC ISO receipt timestamp.",
        },
      },
    },
  },
};
