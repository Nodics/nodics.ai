/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";

/** @module nTooling/project/defaultProjectConfigurationProbeService @description Backward-compatible tooling entry for nConfig's canonical isolated deployment projection; owns no runtime loader. @owner nTooling @layer tooling */
module.exports = require("../../../../nConfig/src/service/defaultDeploymentConfigurationProjectionService");

if (require.main === module) {
  const options = JSON.parse(process.argv[2]);
  process.argv = process.argv.slice(0, 2);
  process.stdout.write(JSON.stringify(module.exports.resolve(options)));
}
