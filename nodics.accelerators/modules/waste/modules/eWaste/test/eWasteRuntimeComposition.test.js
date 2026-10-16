/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @module eWaste/test/eWasteRuntimeComposition @description Proves owner routes, trusted channel provenance and independent presentation configuration. @owner eWaste @layer test */
const { test, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs"), path = require("node:path");
const controller = require("../src/controller/defaultEWasteJourneyController");
const experience = require("../src/service/defaultEWasteExperienceService");
const journey = require("../src/service/defaultEWasteJourneyService");
const defaults = require("../config/properties").eWaste;
afterEach(() => { delete global.CONFIG; delete global.SERVICE; });

test("journey controller validates launch provenance before the trusted mapper and fixes service selection", async () => {
  const calls = [], origin = { channel: "TELEGRAM", subject: "verified" };
  const request = { authData: { code: "owner" }, httpRequest: {
    headers: { "x-ewaste-telegram-launch": "signed" }, body: { serviceName: "Forged", origin: { subject: "forged" } },
  } };
  global.SERVICE = {
    DefaultEWasteChannelAuthenticationService: { origin: async (...args) => { calls.push(args); return origin; } },
    DefaultEWasteRequestService: { invoke: (...args) => { calls.push(args); return { data: "prepared" }; } },
  };
  assert.deepEqual(await controller.prepareSubmission(request), { data: "prepared" });
  assert.deepEqual(calls[0], ["signed", request, "TELEGRAM"]);
  assert.equal(calls[1][3], "DefaultEWasteJourneyService");
  assert.equal(calls[1][1].authData.eWasteOrigin, origin);
  assert.equal(request.authData.eWasteOrigin, undefined);
  SERVICE.DefaultEWasteChannelAuthenticationService.origin = async () => { throw Error("denied"); };
  await assert.rejects(controller.prepareSubmission(request), /denied/);
  assert.equal(calls.length, 2);
});

test("web requests cannot inject provenance and callback errors propagate", async () => {
  global.SERVICE = { DefaultEWasteRequestService: { invoke: async (op, req) => {
    assert.deepEqual(req.authData.eWasteOrigin, { channel: "WEB" }); throw Error("owner refused");
  } } };
  await new Promise(resolve => controller.prepareSubmission({ authData: {}, httpRequest: {
    body: { eWasteOrigin: { channel: "TELEGRAM" } },
  } }, err => { assert.match(err.message, /owner refused/); resolve(); }));
});

test("two independent applications inherit the same domain behavior without private routing in public projection", async () => {
  for (const [code, radius] of [["ALPHA", 80], ["BETA", 125]]) {
    const settings = { ...defaults, application: { code }, presentation: { brandName: code },
      journey: { ...defaults.journey, arrivalRadiusMetres: radius, reviewAssignment: { queueCode: "private" } } };
    global.CONFIG = { get: () => settings };
    global.SERVICE = { DefaultEWasteJourneyService: journey,
      DefaultWasteCollectionCentreService: { search: async () => ({ records: [], unavailableSources: [] }) } };
    const owner = { ...experience, store: () => ({ context: () => ({}), list: async () => [] }) };
    const result = await owner.experience({});
    assert.equal(result.application.code, code);
    assert.equal(result.journey.arrivalRadiusMetres, radius);
    assert.equal(Object.hasOwn(result.journey, "reviewAssignment"), false);
    assert.equal(journey.settings().reviewAssignment.queueCode, "private");
  }
});

test("shipped eWaste runtime contains no reference-application identifiers", () => {
  const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory()
    ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]);
  for (const file of [...walk(path.join(__dirname, "../src")), ...walk(path.join(__dirname, "../config"))])
    assert.doesNotMatch(fs.readFileSync(file, "utf8"), /circa|greenperks|renewworks|loopcycle/i, file);
});

test("every extracted route resolves an owner operation and guidance preserves failed policy validation", () => {
  const routes = require("../src/router/routers").eWaste.experience;
  const catalogue = require("../src/controller/defaultEWasteCatalogueController");
  for (const route of Object.values(routes)) {
    const owner = { DefaultEWasteJourneyController: controller, DefaultEWasteCatalogueController: catalogue }[route.controller];
    if (owner) assert.equal(typeof owner[route.operation], "function", route.key);
  }
  assert.equal(defaults.journey.arrivalRadiusMetres, 50);
  global.CONFIG = { get: () => defaults };
  global.SERVICE = { DefaultEWasteJourneyService: { settings: () => { throw Error("arrival policy required"); } } };
  const guidance = require("../src/service/defaultEWasteGuidanceService");
  assert.throws(() => guidance.fixedMessage("Why location?"), /arrival policy required/);
});
