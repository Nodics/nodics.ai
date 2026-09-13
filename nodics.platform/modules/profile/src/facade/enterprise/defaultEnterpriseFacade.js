/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module profile/facade/enterprise/DefaultEnterpriseFacade
 * @description Delegates bounded runtime enterprise lookup to the existing Profile authority.
 * @layer facade
 * @owner profile
 * @override Preserve verified runtime scope and the enterprise projection when customizing.
 */
module.exports = {
    /** Returns the Profile-authorized runtime enterprise projection. */
    getRuntimeEnterprise: function (request) {
        return SERVICE.DefaultEnterpriseService.getRuntimeEnterprise(request);
    }
};
