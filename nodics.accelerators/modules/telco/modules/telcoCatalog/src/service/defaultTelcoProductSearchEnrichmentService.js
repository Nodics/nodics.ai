/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/** @module telcoCatalog/service/defaultTelcoProductSearchEnrichmentService @description Contributes customer-safe Telco plan details to Product search publication. @layer service @owner telcoCatalog */
module.exports = { init: () => Promise.resolve(true), postInit: () => Promise.resolve(true), records: response => Array.isArray(response) ? response : response && Array.isArray(response.result) ? response.result : [], enrich: async function (request, input) { const plans = this.records(await SERVICE.DefaultTelcoPlanOfferingService.get({ tenant: request.tenant, authData: request.authData, query: { tenant: request.tenant, productCode: input.product.code, status: 'ACTIVE' } })); if (!plans[0]) return {}; const allowances = plans[0].allowanceCodes && plans[0].allowanceCodes.length ? this.records(await SERVICE.DefaultTelcoAllowanceService.get({ tenant: request.tenant, authData: request.authData, query: { tenant: request.tenant, code: { $in: plans[0].allowanceCodes }, status: 'ACTIVE' } })) : []; return { telco: { planType: plans[0].planType, billingCycle: plans[0].billingCycle, minimumTermMonths: plans[0].minimumTermMonths, simTypes: plans[0].simTypes || [], compatibleDeviceProfileCodes: plans[0].compatibleDeviceProfileCodes || [], allowances: allowances.map(item => ({ code: item.code, type: item.allowanceType, amount: item.amount, unit: item.unit })) } }; } };
