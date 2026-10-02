/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module smsCommsProvider/config/properties @description Defines secret-reference-only SMS sandbox defaults. @layer config @owner smsCommsProvider */
module.exports = {
  communication: {
    providerTypes: {
      SMS_SANDBOX: {
        code: "sms-sandbox",
        service: "DefaultSmsCommunicationProviderService",
        timeoutMilliseconds: 5000,
      },
    },
  },
  smsCommsProvider: {
    enabled: false,
    maturity: "SANDBOX_CAPABLE",
    sandboxOnly: true,
    liveQualified: false,
    endpoint: "",
    credentialReference: "",
    senderReference: "",
    sandboxTransportService: "",
    maximumContentBytes: 1600,
    timeoutMilliseconds: 5000,
  },
};
