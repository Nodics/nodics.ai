/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/** @module commercialAgreement/schemas @description One atomic agreement aggregate retains all immutable term versions. @layer schema @owner commercialAgreement */
module.exports = { commercialAgreement: { commercialAgreement: {
    super: 'base', model: true, schemaPolicies: ['operational'],
    service: { enabled: true }, router: { enabled: false },
    cache: { enabled: false }, event: { enabled: false }, search: { enabled: false },
    indexes: { individual: { agreementIdentity: { name: 'code', enabled: true, options: { unique: true } } } },
    backoffice: { operations: [], concurrency: { field: 'revision', managed: true } },
    definition: {
        code: { type: 'string', required: true, description: 'Stable agreement identity; one shared package may serve either commercial model.' },
        enterpriseRef: { type: 'object', required: true, description: 'Profile Enterprise receiving the agreed service, never an employee identity.' },
        revision: { type: 'int', required: true, description: 'Generated persistence concurrency token.' },
        versions: { type: 'array', required: true, description: 'Append-only agreed snapshots with command identity, actor, effective dates and source evidence.' }
    }
} } };
