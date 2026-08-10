/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
const crypto = require('crypto');
/** @module localCommsProvider/src/service/defaultLocalCommunicationProviderService @description Provides deterministic development delivery evidence without sending content externally. @layer service @owner localCommsProvider @override Production provider modules implement the same bounded transport port. */
module.exports = { /** Accepts local delivery and returns content-free provider evidence. */ deliver: async function (request) { return { status: 'DELIVERED', providerReference: 'local-' + crypto.createHash('sha256').update(request.intentCode + ':' + request.idempotencyKey).digest('hex').slice(0, 16), responseCode: 'LOCAL_ACCEPTED' }; } };
