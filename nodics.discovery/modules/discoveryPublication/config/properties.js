/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module discoveryPublication/config/properties @description Defines Discovery publication defaults. @layer config @owner discoveryPublication */
module.exports = {
  // Declare ownership without overriding existing unknown-category exposure policy.
  apiExposure: { categories: { moduleInternal: { inheritUnknown: true } } }, discovery: { publication: { targetAuthority: { publication: {$config: 'context', name: 'publication'}, server: null, environment: null }, defaultBatchSize: 100, aliasSwitchEnabled: true, rollbackEnabled: true } } };
