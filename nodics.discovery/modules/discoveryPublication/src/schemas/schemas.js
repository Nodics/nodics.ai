/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module discoveryPublication/schemas @description Private generation manifests for atomic publication of complete derived projections. @layer schema @owner discoveryPublication @override Preserve private routing and unique identity; this is not a source record or scheduler. */
module.exports = {
  discoveryPublication: {
    discoveryIndexRetirementReceipt: {
      super: "base",
      model: true,
      service: { enabled: true },
      router: { enabled: false },
      cache: { enabled: false },
      event: { enabled: false },
      search: { enabled: false },
      backoffice: { enabled: false },
      indexes: {
        individual: {
          retirementIdentity: {
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
          description:
            "Unique tenant, logical index and immutable physical UUID retirement identity.",
        },
        tenantCode: {
          type: "string",
          required: true,
          description: "Trusted tenant.",
        },
        enterpriseCode: {
          type: "string",
          required: true,
          description: "Dedicated index enterprise owner.",
        },
        indexName: {
          type: "string",
          required: true,
          description: "Private logical index binding.",
        },
        indexUUID: {
          type: "string",
          required: true,
          description: "Original provider index UUID.",
        },
        ownerType: {
          type: "string",
          required: true,
          description: "Authorizing source owner.",
        },
        principalCode: {
          type: "string",
          required: true,
          description: "Original employee actor.",
        },
        planCode: {
          type: "string",
          required: true,
          description: "Configured owner migration plan.",
        },
        reviewDigest: {
          type: "string",
          required: true,
          description: "Exact actor, index and replacement-generation review.",
        },
        operationCode: {
          type: "string",
          required: true,
          description: "Unique original command reference.",
        },
        state: {
          type: "string",
          required: true,
          description:
            "STARTED or RETIRED; uncertainty never permits redispatch.",
        },
        startedAt: {
          type: "string",
          required: true,
          description: "ISO original claim time.",
        },
        completedAt: {
          type: "string",
          required: false,
          description: "ISO acknowledged provider barrier completion.",
        },
        erasure: {
          type: "object",
          required: false,
          description:
            "Separate irreversible erasure claim and original acknowledged completion; never reset or retried.",
        },
      },
    },
    discoveryGeneration: {
      super: "base",
      model: true,
      service: { enabled: true },
      router: { enabled: false },
      cache: { enabled: false },
      event: { enabled: false },
      search: { enabled: false },
      indexes: {
        individual: {
          generationIdentity: {
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
          description:
            "Deterministic tenant, index and source publication identity.",
        },
        tenantCode: {
          type: "string",
          required: true,
          description: "Trusted tenant partition.",
        },
        indexName: {
          type: "string",
          required: true,
          description:
            "Logical nSearch index identity, not a physical provider name.",
        },
        indexConfigurationCode: {
          type: "string",
          required: true,
          description: "Discovery index configuration identity.",
        },
        ownerType: {
          type: "string",
          required: true,
          description: "Source capability owner type.",
        },
        ownerCode: {
          type: "string",
          required: true,
          description: "Source partition identity, not an individual document.",
        },
        revision: {
          type: "int",
          required: true,
          description: "Monotonic compare-and-set publication revision.",
        },
        currentGeneration: {
          type: ["object", "null"],
          required: false,
          description: "Last completely acknowledged generation descriptor.",
        },
        pendingGeneration: {
          type: ["object", "null"],
          required: false,
          description:
            "Exclusive writer token; never taken over by elapsed time.",
        },
        obsoleteGenerations: {
          type: "array",
          required: true,
          description:
            "Exact unpublished generation identities eligible for cleanup.",
        },
        publishedObsoleteGenerations: {
          type: "array",
          required: false,
          description:
            "Obsolete IDs proven to originate from a completed publication; absent legacy evidence is not inferred.",
        },
        retiredWriters: {
          type: "object",
          required: false,
          description:
            "Bounded original write claims and quiescence evidence for obsolete generations; never inferred from elapsed time.",
        },
        updatedAt: {
          type: "date",
          required: true,
          description: "Last acknowledged manifest transition.",
        },
      },
    },
  },
};
