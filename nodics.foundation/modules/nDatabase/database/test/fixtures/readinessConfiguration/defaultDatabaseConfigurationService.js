/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module database/test/fixtures/ReadinessConfiguration
 * @description Later-layer configuration admission used by the actual startup composition regression.
 * @layer test
 * @owner nDatabase
 */
module.exports = {
    /** Models a later-layer configuration refusal. @returns {never} Throws before any handle admission. */
    getDatabaseConfiguration: function () {
        throw new Error('Custom configuration refused');
    }
};
