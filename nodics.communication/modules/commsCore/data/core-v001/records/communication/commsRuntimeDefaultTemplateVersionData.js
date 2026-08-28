/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module commsCore/data/core-v001/records/communication/commsRuntimeDefaultTemplateVersionData @description Provides versioned body content for Communication runtime templates. @layer data @owner commsCore */
module.exports = {
    record0: {
        code: 'COMMUNICATION_RUNTIME_NOTICE:1:en:EMAIL',
        tenant: 'default',
        templateCode: 'COMMUNICATION_RUNTIME_NOTICE',
        version: 1,
        locale: 'en',
        channel: 'EMAIL',
        subjectTemplate: 'Notification {{reference}}',
        bodyTemplate: '{{message}}',
        checksum: 'f00fc88bd313618be0156dc948ca34b4eb262bc17f81f6644f87171a7e7fb5cf',
        status: 'ACTIVE',
        validatedAt: new Date('2026-08-24T00:00:00.000Z'),
        correlationId: 'communication-runtime-defaults',
        revision: 1,
        active: true
    },
    record1: {
        code: 'COMMUNICATION_RUNTIME_NOTICE:1:en:IN_APP',
        tenant: 'default',
        templateCode: 'COMMUNICATION_RUNTIME_NOTICE',
        version: 1,
        locale: 'en',
        channel: 'IN_APP',
        subjectTemplate: 'Notification {{reference}}',
        bodyTemplate: '{{message}}',
        checksum: 'f00fc88bd313618be0156dc948ca34b4eb262bc17f81f6644f87171a7e7fb5cf',
        status: 'ACTIVE',
        validatedAt: new Date('2026-08-24T00:00:00.000Z'),
        correlationId: 'communication-runtime-defaults',
        revision: 1,
        active: true
    }
};
