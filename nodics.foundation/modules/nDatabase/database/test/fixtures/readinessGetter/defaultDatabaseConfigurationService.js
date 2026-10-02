/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module database/test/fixtures/ReadinessGetter
 * @description Later-layer getter admission used by the actual startup composition regression.
 * @layer test
 * @owner nDatabase
 */
module.exports = {
    /** Models a later-layer missing handle or explicit admission refusal. @returns {undefined} No admitted handle. */
    getTenantDatabase: function () {
        if (this.fixtureGetterThrows) throw new Error('Custom getter refused');
        return undefined;
    }
};
