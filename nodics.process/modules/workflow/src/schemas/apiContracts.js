/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/**
 * @module workflow/schema/apiContracts
 * @description Declares inert JSON API contracts for private advisory native command metadata. These are HTTP projections, not persistence schemas.
 * @layer schema
 * @owner workflow
 * @override Preserve strict versions and non-executable states; original authorization remains with nRouter and Workflow commands.
 */
const authorization = { enum: ["AUTHORIZED", "DENIED", "UNAVAILABLE"] };
const triggerCommand = {
  type: "object", additionalProperties: false,
  required: ["authorization", "receiptInspection"],
  properties: { authorization, receiptInspection: authorization },
};
module.exports = {
  commandCapabilities: {
    type: "object", additionalProperties: false,
    required: ["contractVersion", "newRecording", "triggerCommands"],
    properties: {
      contractVersion: { type: "integer", enum: [1] },
      newRecording: { enum: ["ENABLED", "DISABLED", "UNAVAILABLE"] },
      triggerCommands: {
        type: "object", additionalProperties: false,
        required: ["create", "update", "archive", "execute"],
        properties: { create: triggerCommand, update: triggerCommand, archive: triggerCommand, execute: triggerCommand },
      },
    },
  },
};
