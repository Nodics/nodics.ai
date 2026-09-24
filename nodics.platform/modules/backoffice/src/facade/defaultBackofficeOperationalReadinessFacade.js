/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module backoffice/facade/DefaultBackofficeOperationalReadinessFacade @description Delegates startup/configuration readiness acknowledgement to the owning BackOffice service. */
module.exports = {
    /** Initializes the operational readiness facade. */
    init: function () { return Promise.resolve(true); },
    /** Finalizes operational readiness facade initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Delegates auditable startup finding acknowledgement. */
    acknowledgeStartupFinding: function (request) {
        return SERVICE.DefaultBackofficeOperationalReadinessService.acknowledgeFinding(request);
    },
    /** Delegates governed readiness repair execution/dry-run to BackOffice dispatcher. */
    executeRepair: function (request) {
        return SERVICE.DefaultBackofficeOperationalReadinessService.executeRepair(request);
    }
};
