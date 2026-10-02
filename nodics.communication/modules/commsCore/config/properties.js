/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module commsCore/config/properties @description Defines provider-neutral Communication delivery and retention defaults. @layer config @owner commsCore @override Projects configure providers and stricter policy through secured layered configuration. */
module.exports = {
  runtimeConfigurationSchemas: {
    runtimeRoleProfiles: {
      ENGAGEMENT: {
        telegramDelivery: {
          code: "telegramDelivery",
          ownerModule: "commsCore",
          capabilityGroup: "communication",
          category: "delivery",
          label: "Telegram delivery channel",
          description:
            "Logical bot credential for the Communication delivery runtime. Configuration authoring does not enable a provider or qualify sending.",
          refreshBehavior: "runtime",
          updatePermission: "runtime.config.update",
          viewPermission: "runtime.config.effective.view",
          fields: [
            {
              code: "botToken",
              label: "Telegram bot token",
              type: "string",
              required: true,
              sensitive: true,
              credentialReference: "telegram.bot.delivery",
              path: ["credentials", "telegram.bot.delivery", "value"],
              pattern: "^\\d+:[^\\s]+$",
              restartRequired: false,
              unconfiguredValues: [
                "",
                "sample",
                "placeholder",
                "changeme",
              ],
            },
          ],
        },
      },
    },
  },
  communication: {
    enabled: true,
    defaultProvider: "local",
    trustedSourceModules: [],
    templates: {},
    templateResources: {
      enabled: true,
      modules: {},
      selections: {},
      maximumFileBytes: 65536,
      maximumTemplatesPerModule: 100,
      maximumLayers: 512,
    },
    providers: {},
    providerTypes: {
      TELEGRAM: {
        code: "telegram",
        service: "DefaultTelegramCommunicationProviderService",
        timeoutMilliseconds: 10000,
      },
    },
    deliveryLeaseMilliseconds: 120000,
    allowedChannels: ["EMAIL", "SMS", "IN_APP", "TELEGRAM"],
    maximumAttempts: 5,
    baseRetryMilliseconds: 1000,
    maximumRetryMilliseconds: 300000,
    rendering: {
      dateTime: { locale: "en-GB", timeZone: "UTC" },
      maximumVariables: 50,
      maximumRenderedBytes: 65536,
      rejectUnknownVariables: true,
    },
    callbacks: { replayWindowSeconds: 300 },
    retention: { evidenceDays: 365, inboxDays: 90 },
  },
};
