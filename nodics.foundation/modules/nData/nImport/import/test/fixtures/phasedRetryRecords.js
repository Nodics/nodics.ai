/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module import/test/fixtures/phasedRetryRecords @description Offline phase fixture; never runtime import data. @layer test @owner import */
module.exports = {
  header: {
    options: {
      moduleName: "fixture",
      schemaName: "item",
      operation: "saveAll",
    },
  },
  models: { first: { code: "pending" }, second: { code: "successful" } },
};
