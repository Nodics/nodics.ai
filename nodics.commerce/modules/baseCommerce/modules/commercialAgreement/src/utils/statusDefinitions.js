/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module commercialAgreement/statusDefinitions @description Stable agreement command errors. @layer utility @owner commercialAgreement */
module.exports = {
    ERR_AGREEMENT_SCOPE: { code: '403', message: 'Commercial agreement authority is required' },
    ERR_AGREEMENT_INPUT: { code: '400', message: 'Commercial agreement input is invalid' },
    ERR_AGREEMENT_CONFIG: { code: '503', message: 'Commercial agreement configuration is invalid' },
    ERR_AGREEMENT_STORAGE: { code: '503', message: 'Commercial agreement storage is unqualified' },
    ERR_AGREEMENT_REFERENCE: { code: '422', message: 'Commercial agreement owner reference is unavailable' },
    ERR_AGREEMENT_CONFLICT: { code: '409', message: 'Commercial agreement revision or command conflicts' },
    ERR_AGREEMENT_MISSING: { code: '404', message: 'Commercial agreement is unavailable in this scope' }
};
