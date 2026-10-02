/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
/** @module promotion/test/promotionMerchantBenefitContract @description Authored exact amount, priced-owner binding and unsupported benefit fixtures; behavioral execution is deferred. @layer test @owner promotion */
const test = require("node:test");
const assert = require("node:assert/strict");
const benefit = require("../src/service/defaultPromotionMerchantBenefitService");
test("unselected monetary integration does not pretend to verify a transaction", async (t) => {
  const old = global.CONFIG;
  t.after(() => {
    global.CONFIG = old;
  });
  global.CONFIG = { get: () => ({ merchantBenefits: { enabled: false } }) };
  assert.equal(await benefit.validate({}, {}, {}), undefined);
});
test("later-layer selection still rejects unknown action and absent owner qualification", async (t) => {
  const previous = {
    CONFIG: global.CONFIG,
    SERVICE: global.SERVICE,
    CLASSES: global.CLASSES,
  };
  t.after(() => Object.assign(global, previous));
  global.CLASSES = {
    NodicsError: class extends Error {
      /** Preserves the fixture failure message without a runtime. */ constructor(
        _code,
        message,
      ) {
        super(message);
      }
    },
  };
  global.CONFIG = {
    get: () => ({
      merchantBenefits: {
        enabled: true,
        qualified: true,
        evidenceService: "PricedOwner",
      },
    }),
  };
  global.SERVICE = {
    PricedOwner: {
      evaluate: async () => {
        throw new Error("not reached");
      },
    },
  };
  await assert.rejects(
    benefit.validate({}, { actions: { freeSku: "UNAPPROVED" } }, {}),
    /unsupported/,
  );
  global.CONFIG.get = () => ({
    merchantBenefits: {
      enabled: true,
      qualified: false,
      evidenceService: "PricedOwner",
    },
  });
  await assert.rejects(
    benefit.validate({}, { actions: { discountAmount: "5.00" } }, {}),
    /unavailable/,
  );
});
