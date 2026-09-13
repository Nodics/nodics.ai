/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module bidding/nodics @description Declares the Bidding capability lifecycle. @layer module @owner bidding */
module.exports = {
  /** Completes initialization without opening an additional resource. */
  init: function () { return Promise.resolve(true); },
  /** Completes post-initialization after dependencies are available. */
  postInit: function () { return Promise.resolve(true); },
};
