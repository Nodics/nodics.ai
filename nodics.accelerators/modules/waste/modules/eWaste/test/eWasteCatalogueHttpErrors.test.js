/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @module eWaste/test/eWasteCatalogueHttpErrors @description Exercises catalogue refusals through the real controller and JSON error boundary. @owner eWaste @layer test */
const test = require('node:test');
const assert = require('node:assert/strict');
const catalogue = require('../src/service/defaultEWasteCatalogueService');
const statuses = require('../src/utils/statusDefinitions');
const controller = require('../src/controller/defaultEWasteCatalogueController');
const responseHandler = require('../../../../../../nodics.foundation/modules/nRouter/src/service/handlers/response/defaultJsonResponseHandlerService');
const NodicsError = require('../../../../../../nodics.foundation/modules/nCommon/src/lib/nodicsError');

test('catalogue owner refusals retain registered HTTP status through the actual request and response adapters', async () => {
  const previous = { CONFIG: global.CONFIG, SERVICE: global.SERVICE, CLASSES: global.CLASSES, UTILS: global.UTILS };
  try {
    global.CONFIG = { get: key => key === 'defaultErrorCodes' ? { NodicsError: 'ERR_SYS_00000' } : undefined };
    global.UTILS = { isObject: value => value !== null && typeof value === 'object' };
    global.CLASSES = { NodicsError };
    let ownerResponse;
    global.SERVICE = {
      DefaultStatusService: { get: code => statuses[code] || { code: '500', message: 'Internal error' } },
      DefaultEWasteRequestService: require('../src/service/defaultEWasteRequestService'),
      DefaultEWasteExperienceService: { resolveCustomer: async input => input },
      DefaultEWasteCatalogueService: { ...catalogue, products: async () => ownerResponse, offer: async () => null },
      DefaultWasteItemDescriptorService: { projectResponse: () => assert.fail('A blocked page must not return partial success') },
    };
    for (const [query, data, status, code] of [
      [{ kind: 'PRIVATE' }, null, 400, 'ERR_EWASTE_CUSTOMER_QUERY'],
      [{ kind: 'COUPON' }, {}, 503, 'ERR_EWASTE_CATALOGUE_UNAVAILABLE'],
      [{ kind: 'COUPON' }, { products: [{ localizedAttributes: { kind: 'COUPON' } }], total: 1, facets: {}, pagination: {} }, 503, 'ERR_EWASTE_CATALOGUE_PRICING_UNAVAILABLE'],
      [{ kind: 'COUPON' }, { products: [{ price: { unitAmount: '10' }, localizedAttributes: { kind: 'COUPON' } }], total: 1, facets: {}, pagination: {} }, 409, 'ERR_EWASTE_OFFER_CHANGED'],
    ]) {
      ownerResponse = data;
      const error = await new Promise(resolve => controller.catalogue({ httpRequest: { query, headers: {} } }, error => resolve(error)));
      assert(error instanceof NodicsError);
      const output = {};
      responseHandler.handleError.call({ ...responseHandler, LOG: { error() {} } }, {}, {
        status: value => { output.status = value; }, json: value => { output.body = value; },
      }, error);
      assert.equal(output.status, status);
      assert.equal(output.body.code, code);
      assert.equal(output.body.stack, undefined);
      assert.equal(output.body.metadata, undefined);
      if (status === 503) assert.equal(output.body.message, statuses[code].message);
    }
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete global[key]; else global[key] = value;
    }
  }
});
