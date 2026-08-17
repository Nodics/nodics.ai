/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/** @module telcoCatalog/service/defaultTelcoCatalogValidationService @description Validates reusable prepaid and postpaid plan semantics. @layer service @owner telcoCatalog */
module.exports = { init: () => Promise.resolve(true), postInit: () => Promise.resolve(true), validate: function (plan, allowances) { let errors = []; if (!plan || !plan.productCode || !['PREPAID', 'POSTPAID'].includes(plan.planType)) errors.push('TELCO_PLAN_INVALID'); if (!plan || !(plan.simTypes || []).some(type => ['SIM', 'ESIM'].includes(type))) errors.push('TELCO_SIM_TYPE_REQUIRED'); let known = new Set((allowances || []).map(item => item.code)); if (((plan && plan.allowanceCodes) || []).some(code => !known.has(code))) errors.push('TELCO_ALLOWANCE_UNKNOWN'); if (plan && plan.planType === 'POSTPAID' && !plan.billingCycle) errors.push('TELCO_BILLING_CYCLE_REQUIRED'); return { valid: errors.length === 0, errors: errors }; } };
