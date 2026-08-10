/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module localCommsProvider/config/properties @description Enables deterministic local delivery without external network transmission. @layer config @owner localCommsProvider */
module.exports = { communicationProviders: { local: { enabled: true, external: false, channels: ['EMAIL', 'SMS', 'IN_APP'] } } };
