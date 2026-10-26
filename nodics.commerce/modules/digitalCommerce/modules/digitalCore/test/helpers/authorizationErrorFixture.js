/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
'use strict';
/**
 * @module digitalCore/test/helpers/authorizationErrorFixture
 * @description Installs the real common error class and Auth/Digital status definitions for isolated tests.
 * @owner digitalCore
 * @layer test
 */
module.exports = function installAuthorizationErrors(t) {
  const root = '../../../../../../../nodics.foundation/modules/';
  const previous = global.CLASSES;
  const config = CONFIG, services = SERVICE;
  const get = CONFIG.get;
  const status = SERVICE.DefaultStatusService;
  const defaults = require(root + 'nCommon/config/properties');
  const definitions = { ...require(root + 'nAuth/src/utils/statusDefinitions'),
    ...require('../../src/utils/statusDefinitions') };
  CONFIG.get = key => key === 'defaultErrorCodes' ? defaults[key] : get(key);
  SERVICE.DefaultStatusService = { get: code => definitions[code] };
  global.CLASSES = { ...previous, NodicsError: require(root + 'nCommon/src/lib/nodicsError') };
  t.after(() => {
    config.get = get;
    services.DefaultStatusService = status;
    if (previous === undefined) delete global.CLASSES;
    else global.CLASSES = previous;
  });
};
