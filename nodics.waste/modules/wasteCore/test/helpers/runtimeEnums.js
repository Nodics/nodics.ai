/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/**
 * @module wasteCore/test/helpers/runtimeEnums
 * @description Installs canonical owner enum definitions for isolated tests without runtime bootstrap.
 * @layer test
 * @owner wasteCore
 */
/**
 * Installs actual owner enum definitions in an isolated Node test process.
 * @returns {Object} Effective enum registry; does not initialize a runtime or persistence.
 */
module.exports = function runtimeEnums() {
    const Enum = require("../../../../../nodics.foundation/modules/nConfig/bin/enum");
    const definitions = Object.assign({}, require("../../src/utils/enums"));
    return global.ENUMS = Object.assign(global.ENUMS || {}, Object.fromEntries(
        Object.entries(definitions).map(([name, values]) => [name, new Enum(values.definition)])
    ));
};
