/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module copilotApi/config/properties
 * @description Defines generated configurable defaults for copilotApi.
 * @layer config
 * @owner generated
 * @override Project, environment, server, node, tenant, or customer layers may override these defaults through Nodics configuration layering.
 */
module.exports = {
  responseHandler: {
    copilotSseResponseHandler: "DefaultCopilotSseResponseHandlerService",
  },
  copilot: {
    api: {
      enabled: false,
      exposure: "copilotApi",
      streamHeartbeatMs: 15000,
      maximumRequestBytes: 131072,
      maximumPageSize: 50,
      maximumEventReplaySize: 500,
      maximumEventBytes: 65536,
    },
  },
  apiExposure: {
    categories: {
      copilotApi: {
        enabled: true,
      },
    },
  },
};
