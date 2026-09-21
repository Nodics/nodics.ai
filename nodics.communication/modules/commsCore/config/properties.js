/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module commsCore/config/properties @description Defines provider-neutral Communication delivery and retention defaults. @layer config @owner commsCore @override Projects configure providers and stricter policy through secured layered configuration. */
module.exports = {
  communication: { enabled: true, defaultProvider: 'local', trustedSourceModules: [], templates: {}, providers: {}, deliveryLeaseMilliseconds: 120000, allowedChannels: ['EMAIL', 'SMS', 'IN_APP', 'TELEGRAM'], maximumAttempts: 5, baseRetryMilliseconds: 1000, maximumRetryMilliseconds: 300000, rendering: { maximumVariables: 50, maximumRenderedBytes: 65536, rejectUnknownVariables: true }, callbacks: { replayWindowSeconds: 300 }, retention: { evidenceDays: 365, inboxDays: 90 } },
  runtimeConfigurationSchemas: {
    telegramDelivery: {
      code: 'telegramDelivery',
      ownerModule: 'commsCore',
      label: 'Telegram delivery channel',
      description: 'Logical bot credential required for Communication Telegram sends. Source config declares the reference; operational values must come from governed runtime configuration.',
      refreshBehavior: 'runtime',
      updatePermission: 'runtime.config.request.create',
      viewPermission: 'runtime.config.effective.view',
      fields: [
        {
          code: 'botToken',
          label: 'Telegram bot token',
          type: 'string',
          required: true,
          sensitive: true,
          credentialReference: 'telegram.bot.local',
          path: ['credentials', 'telegram.bot.local', 'value'],
          pattern: '^\\d+:[^\\s]+$',
          restartRequired: false,
          unconfiguredValues: ['', 'sample', 'placeholder', 'changeme']
        }
      ]
    }
  }
};
