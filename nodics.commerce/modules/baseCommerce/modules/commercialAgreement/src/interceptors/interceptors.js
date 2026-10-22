/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module commercialAgreement/interceptors @description Requires owner-admitted immutable history commands on every generated writer. @layer interceptors @owner commercialAgreement */
module.exports = {
    agreementSave: { type: 'schema', item: 'commercialAgreement', trigger: 'preSave', active: 'true', index: -70, handler: 'DefaultCommercialAgreementOperationService.protect' },
    agreementUpdate: { type: 'schema', item: 'commercialAgreement', trigger: 'preUpdate', active: 'true', index: -70, handler: 'DefaultCommercialAgreementOperationService.protect' },
    agreementRemove: { type: 'schema', item: 'commercialAgreement', trigger: 'preRemove', active: 'true', index: -70, handler: 'DefaultCommercialAgreementOperationService.protectRemove' }
};
