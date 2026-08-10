/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/** @module engagementCore/src/service/defaultEngagementOperationsEvidenceRepositoryService @description Persists tenant-scoped batch, export, and repair execution evidence through generated internal model services. @layer service @owner engagementCore */
module.exports = {
    /** Returns the internal evidence-writer identity. */
    auth: function () { return { tokenType: 'internal', internal: true, groups: ['adminGroup'] }; },
    /** Finds one tenant-scoped batch receipt by idempotency key. */
    findBatch: function (tenant, idempotencyKey) { return SERVICE.DefaultEngagementBatchRunService.get({ tenant: tenant, authData: this.auth(), query: { tenant: tenant, idempotencyKey: idempotencyKey }, searchOptions: { limit: 1 } }).then(response => (response.result || [])[0]); },
    /** Persists one resumable batch receipt. */
    saveBatch: function (value) { return SERVICE.DefaultEngagementBatchRunService.save({ tenant: value.tenant, authData: this.auth(), model: value }).then(response => response.result || response); },
    /** Persists masked export evidence while returning approved rows only to the caller. */
    saveExport: function (value) { let model = Object.assign({}, value); delete model.rows; return SERVICE.DefaultEngagementExportEvidenceService.save({ tenant: value.tenant, authData: this.auth(), model: model }).then(response => Object.assign({}, value, { evidence: response.result || response })); },
    /** Persists one governed repair outcome. */
    saveRepair: function (value) { let model = Object.assign({}, value); delete model.repairedAt; return SERVICE.DefaultEngagementRepairCaseService.save({ tenant: value.tenant, authData: this.auth(), model: model }).then(response => response.result || response); }
    /** Persists one privacy execution outcome. */
    , savePrivacy: function (value) { return SERVICE.DefaultEngagementPrivacyCaseService.save({ tenant: value.tenant, authData: this.auth(), model: value }).then(response => response.result || response); }
};
