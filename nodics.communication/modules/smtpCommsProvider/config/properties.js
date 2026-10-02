/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module smtpCommsProvider/config/properties @description Declares disabled sandbox/SMTP provider defaults; deployments select only their actual sender, secret references and transport policy. @layer config @owner smtpCommsProvider */
module.exports = {
    communication: { providerTypes: { SMTP: { code: 'smtp', service: 'DefaultSmtpCommunicationProviderService', timeoutMilliseconds: 5000 } }, senders: {} },
    smtpCommsProvider: {
        enabled: false, mode: 'SANDBOX', maturity: 'SMTP_TEST_CAPABLE', sandboxOnly: true, liveQualified: false,
        endpoint: '', credentialReference: '', senderReference: '', sandboxTransportService: '', timeoutMilliseconds: 5000,
        testOnly: true, allowedRecipients: [], maximumContentBytes: 65536,
        smtp: { host: '', port: 587, secure: false, requireTLS: true, allowInsecureLoopback: false }
    }
};
