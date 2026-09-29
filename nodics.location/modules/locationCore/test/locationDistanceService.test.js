/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const service = require("../src/service/defaultLocationDistanceService");

test("pure direct distance handles identical, known, date-line and antipodal positions", () => {
  const origin = { latitude: 0, longitude: 0 };
  assert.equal(service.distance(origin, origin), 0);
  const degree = service.distance(origin, { latitude: 0, longitude: 1 });
  assert(Math.abs(degree - 111194.92664455874) < 0.000001);
  const west = { latitude: 0, longitude: 179 };
  const east = { latitude: 0, longitude: -179 };
  assert(Math.abs(service.distance(west, east) - 2 * degree) < 0.000001);
  assert.equal(service.distance(west, east), service.distance(east, west));
  assert(
    Math.abs(
      service.distance(origin, { latitude: 0, longitude: 180 }) -
        Math.PI * 6371000,
    ) < 0.000001,
  );
});
