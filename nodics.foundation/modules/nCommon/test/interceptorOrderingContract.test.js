/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
/**
 * @module nCommon/test/interceptorOrderingContract
 * @description Verifies actual configured interceptor ordering across signed indexes and stable later-layer ties without runtime providers.
 * @layer test
 * @owner nCommon
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const lodash = require("lodash");
const owner = require("../src/service/config/defaultInterceptorConfigurationService");
const configurationUtils = require("../../nConfig/src/utils/utils");

global._ = lodash;
global.UTILS = {
  sortObject: configurationUtils.sortObject,
  isBlank: (value) => !value || Object.keys(value).length === 0,
};

test("actual configured sorter executes negative integrity guards before zero and positive hooks", () => {
  const source = [50, -30, 0, -60, -50, 10].map((index) => ({ index }));
  const before = source.slice();
  assert.deepEqual(
    owner.sortInterceptors({ preSave: source }).preSave.map((row) => row.index),
    [-60, -50, -30, 0, 10, 50],
  );
  assert.deepEqual(source, before);
});

test("configured integer strings preserve stable default/later-layer order at equal index", () => {
  const rows = [
    { index: "0", name: "zero" },
    { index: "-40", name: "defaultGuard" },
    { index: -40, name: "laterLayerGuard" },
    { index: "10", name: "finalize" },
  ];
  assert.deepEqual(
    owner.sortInterceptors({ preSave: rows }).preSave.map((row) => row.name),
    ["defaultGuard", "laterLayerGuard", "zero", "finalize"],
  );
});

test("prepared default and schema contributions keep each trigger independently ordered", () => {
  const service = {
    ...owner,
    rawInterceptors: {
      schema: {
        default: { timestamp: { trigger: "preSave", index: 0 } },
        password: {
          guard: { trigger: "preSave", index: -60 },
          hash: { trigger: "preSave", index: 0 },
          stamp: { trigger: "postUpdate", index: 10 },
          capture: { trigger: "postUpdate", index: -10 },
        },
      },
    },
  };
  const result = service.prepareItemInterceptors("password", "schema");
  assert.deepEqual(
    result.preSave.map((row) => row.name),
    ["guard", "timestamp", "hash"],
  );
  assert.deepEqual(
    result.postUpdate.map((row) => row.name),
    ["capture", "stamp"],
  );
  assert.deepEqual(owner.sortInterceptors({}), {});
});
