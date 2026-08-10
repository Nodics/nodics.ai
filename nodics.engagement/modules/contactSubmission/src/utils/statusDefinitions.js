/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module contactSubmission/src/utils/statusDefinitions @description Defines stable contact-domain errors. @layer utility @owner contactSubmission @override Later modules may add codes without changing these meanings. */
module.exports = { ERR_CONTACT_00000: { code: '400', message: 'Invalid contact submission' }, ERR_CONTACT_00001: { code: '422', message: 'Required contact field missing' }, ERR_CONTACT_00002: { code: '409', message: 'Invalid contact transition' }, ERR_CONTACT_00003: { code: '409', message: 'Contact revision conflict' }, ERR_CONTACT_00004: { code: '403', message: 'Internal correspondence is not customer visible' }, ERR_CONTACT_00005: { code: '410', message: 'Contact verification expired' }, ERR_CONTACT_00006: { code: '404', message: 'Contact submission capability is not enabled' }, ERR_CONTACT_00007: { code: '409', message: 'Contact handoff cannot be retried' }, ERR_CONTACT_00008: { code: '409', message: 'Contact handoff cannot be reconciled' } };
