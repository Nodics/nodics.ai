/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/** @module apparelProduct/service/defaultApparelProductSearchEnrichmentService @description Contributes Apparel records to Product search publication. @layer service @owner apparelProduct */
module.exports = { init: () => Promise.resolve(true), postInit: () => Promise.resolve(true), records: response => Array.isArray(response) ? response : response && Array.isArray(response.result) ? response.result : [], enrich: async function (request, input) { const styles = this.records(await SERVICE.DefaultApparelStyleService.get({ tenant: request.tenant, authData: request.authData, query: { tenant: request.tenant, productCode: input.product.code, status: 'ACTIVE' } })); if (!styles[0]) return {}; const profiles = this.records(await SERVICE.DefaultApparelVariantProfileService.get({ tenant: request.tenant, authData: request.authData, query: { tenant: request.tenant, productCode: input.product.code, status: 'ACTIVE' } })); return SERVICE.DefaultApparelProductProjectionService.project(styles[0], profiles); } };
