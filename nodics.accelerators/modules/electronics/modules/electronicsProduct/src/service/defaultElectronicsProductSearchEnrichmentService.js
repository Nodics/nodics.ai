/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/** @module electronicsProduct/service/defaultElectronicsProductSearchEnrichmentService @description Contributes Electronics records to Product search publication. @layer service @owner electronicsProduct */
module.exports = { init: () => Promise.resolve(true), postInit: () => Promise.resolve(true), records: response => Array.isArray(response) ? response : response && Array.isArray(response.result) ? response.result : [], enrich: async function (request, input) { const profiles = this.records(await SERVICE.DefaultElectronicsSpecificationProfileService.get({ tenant: request.tenant, authData: request.authData, query: { tenant: request.tenant, productCode: input.product.code, status: 'ACTIVE' } })); if (!profiles[0]) return {}; let warranty; if (profiles[0].warrantyProfileCode) { const warranties = this.records(await SERVICE.DefaultElectronicsWarrantyProfileService.get({ tenant: request.tenant, authData: request.authData, query: { tenant: request.tenant, code: profiles[0].warrantyProfileCode, status: 'ACTIVE' } })); warranty = warranties[0]; } return SERVICE.DefaultElectronicsProductProjectionService.project(profiles[0], warranty); } };
