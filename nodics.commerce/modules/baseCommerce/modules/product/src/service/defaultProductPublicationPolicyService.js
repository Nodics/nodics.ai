/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
const crypto = require('node:crypto');
/** @module product/src/service/defaultProductPublicationPolicyService @description Produces staged immutable Product publication evidence. @layer service @owner product */
module.exports = { stage: function (request, product) {
    if (!request || !product || request.tenant !== product.tenant) throw new Error('Tenant-scoped product is required');
    if (product.status !== 'ACTIVE') throw new Error('Only active products can be staged');
    const source = { tenant: request.tenant, productCode: product.code, catalogVersion: product.catalogVersion, revision: product.revision };
    return Object.freeze(Object.assign(source, { status: 'STAGED', sourceHash: crypto.createHash('sha256').update(JSON.stringify(source)).digest('hex'), correlationId: request.correlationId }));
} };
