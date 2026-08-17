/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/** @module telcoSubscription/service/defaultTelcoSubscriptionService @description Governs Telco subscription lifecycle transitions. @layer service @owner telcoSubscription */
module.exports = { init: () => Promise.resolve(true), postInit: () => Promise.resolve(true), transitions: { DRAFT: ['PENDING_ACTIVATION', 'CANCELLED'], PENDING_ACTIVATION: ['ACTIVE', 'CANCELLED'], ACTIVE: ['SUSPENDED', 'CANCELLED'], SUSPENDED: ['ACTIVE', 'CANCELLED'], CANCELLED: [] }, canTransition: function (from, to) { return (this.transitions[from] || []).includes(to); }, validateNumberIntent: function (intent) { let valid = !!intent && ['NEW_NUMBER', 'PORT_IN', 'RETAIN_NUMBER'].includes(intent.intentType) && (intent.intentType !== 'PORT_IN' || !!intent.portabilityEvidence); return { valid: valid, errors: valid ? [] : ['TELCO_NUMBER_INTENT_INVALID'] }; } };
