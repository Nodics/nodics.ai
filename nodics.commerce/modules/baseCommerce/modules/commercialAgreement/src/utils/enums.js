/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module commercialAgreement/enums @description Descriptive commercial vocabularies; no implied model selection. @layer utility @owner commercialAgreement */
module.exports = {
    commercialAgreementModels: { definition: ['FIXED_PRICE', 'SUBSCRIPTION'] },
    commercialAgreementPaymentTerms: { definition: ['PREPAID', 'INVOICE'] },
    commercialAgreementBenefitSources: { definition: ['PACKAGE_INCLUDED', 'ADD_ON'] },
    commercialAgreementTargetTypes: { definition: ['SELECTED_COUPONS', 'ALL_ENTERPRISE_COUPONS'] }
};
