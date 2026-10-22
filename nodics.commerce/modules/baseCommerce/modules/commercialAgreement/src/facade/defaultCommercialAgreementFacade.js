/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module commercialAgreement/facade @description Delegates commercial commands to their canonical owner. @layer facade @owner commercialAgreement */
module.exports = {
    /** Projects scoped commands and inert editor options without selecting business terms. */
    workspace: async function (request) { return SERVICE.DefaultCommercialAgreementOperationService.workspace(request); },
    /** Persists agreed terms through owner admission. */
    record: async function (request) { return SERVICE.DefaultCommercialAgreementOperationService.record(request); },
    /** Lists agreement summaries through owner admission. */
    search: async function (request) { return SERVICE.DefaultCommercialAgreementOperationService.search(request); },
    /** Returns only authorized commercial evidence. */
    read: async function (request) { return SERVICE.DefaultCommercialAgreementOperationService.read(request); }
};
