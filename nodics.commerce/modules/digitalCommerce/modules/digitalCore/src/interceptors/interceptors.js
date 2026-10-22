/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module digitalCore/interceptors/interceptors @description Keeps Enterprise participation records private to admitted owner transactions. @layer interceptor @owner digitalCore */
module.exports = {};
for (const item of ['digitalBundleOwnerPolicy', 'digitalParticipationCommand']) {
    for (const trigger of ['preSave', 'preUpdate', 'preRemove']) module.exports[item + trigger] = {
        type: 'schema', item, trigger, active: 'true', index: -70,
        handler: 'DefaultDigitalParticipationService.protect',
    };
}
