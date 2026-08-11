/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module editorial/service/DefaultEditorialScheduleService @description Contributes Editorial scheduling intent to Process/Cron without executing a scheduler. @layer service @owner editorial */
module.exports = {
    /** Creates Process-owned trigger metadata for a future Editorial publication. */
    schedule: function (request) {
        let input = request.editorial || {};
        if (!input.articleCode || !input.publishAt) throw new CLASSES.NodicsError('ERR_EDT_00006', 'Editorial schedule is invalid');
        return SERVICE.DefaultProcessRuntimeLifecycleService.createTrigger(Object.assign({}, request, { runtimeOperation: {
            code: input.triggerCode || 'editorial-publish-' + input.articleCode, definitionCode: input.definitionCode || 'editorialPublication', triggerType: 'CRON', ownerModule: 'editorial',
            cronJobCode: input.cronJobCode || 'editorial-publish-' + input.articleCode, status: 'ACTIVE', schedule: { runAt: input.publishAt }, context: { articleCode: input.articleCode, revision: input.revision }
        }}));
    }
};
