/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module commerceSearchCore/interceptors @description Protects immutable published rule snapshots from generic mutation. @layer interceptors @owner commerceSearchCore */
module.exports = {
    commerceSearchHistorySave: { type: 'schema', item: 'commerceSearchRuleVersion', trigger: 'preSave', active: 'true', index: -70, handler: 'DefaultCommerceSearchPublicationService.protectHistory' },
    commerceSearchHistoryUpdate: { type: 'schema', item: 'commerceSearchRuleVersion', trigger: 'preUpdate', active: 'true', index: -70, handler: 'DefaultCommerceSearchPublicationService.protectHistoryMutation' },
    commerceSearchHistoryRemove: { type: 'schema', item: 'commerceSearchRuleVersion', trigger: 'preRemove', active: 'true', index: -70, handler: 'DefaultCommerceSearchPublicationService.protectHistoryMutation' }
};
