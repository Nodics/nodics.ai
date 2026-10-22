/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module checkoutCore/data/spendAccessRole @description Explicit owner definition import; preserves installed decisions and assigns no employee. @layer data @owner checkoutCore */
module.exports = { profile: { checkoutSpendAccessRole: { options: {enabled:true,schemaName:'enterpriseRole',operation:'ensureReferenceAll',dataFilePrefix:'checkoutSpendAccessRoleData',userGroups:['adminGroup'],...(typeof CONFIG !== 'undefined' ? { tenants: [CONFIG.get('defaultTenant')] } : {})},query:{code:'$code'} } } };
