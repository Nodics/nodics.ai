/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module commsApi/config/properties @description Defines Communication API projections and callback replay policy. @layer config @owner commsApi @override Projects may narrow projections and callback providers. */
module.exports = {
  tooling: {
    commands: {
      "acceptance:communication-source-delivery": {
        acceptanceContract: true,
        projectHome: true,
        handler: "@nTooling/node-script",
        script:
          "src/service/acceptance/defaultCommunicationSourceDeliveryAcceptanceService.mjs",
      },
    },
  },
  bodyParserHandler: {
    telegramInboundBodyParserHandler: "DefaultTelegramInboundBodyParserHandlerService",
  },
  communicationApi: {
    acceptance: {
      requestTimeoutMs: 30000,
      maximumRetryWaitMs: 120000,
      pollIntervalMs: 500,
    },
    employeeInbox: { profileConnectionName: "profile", timeoutMs: 10000, maxResponseBytes: 8192 },
    projections: {
      inbox: [
        "source",
        "code",
        "title",
        "body",
        "actionReferences",
        "status",
        "createdAt",
        "readAt",
        "expiresAt",
        "correlationId",
      ],
      operation: [
        "intentCode",
        "revision",
        "status",
        "attempt",
        "nextAttemptAt",
        "correlationId",
      ],
      callback: [
        "providerCode",
        "providerReference",
        "status",
        "receivedAt",
        "correlationId",
      ],
    },
    maximumQueryLimit: 100,
  },
  apiExposure: {
    categories: {
      communicationTelegramInbound: { enabled: false },
      communicationCustomer: {
        enabled: true,
      },
      communicationIntegration: {
        enabled: true,
      },
      communicationManagement: {
        enabled: true,
      },
    },
  },
};
