/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @module digitalCore/test/merchantWorkspacePresentation @description Isolated presentation selection, not provider or runtime qualification. @layer test @owner digitalCore */
const test = require("node:test");
const assert = require("node:assert/strict");
const merchant = require("../src/service/defaultDigitalCommerceMerchantService");
const defaults = require("../config/properties").digitalCore;

test("workspace selects owner copy from admitted ITEM evidence and never from caller handles", async t => {
  const previous = { CONFIG: global.CONFIG, SERVICE: global.SERVICE, CLASSES: global.CLASSES };
  t.after(() => Object.assign(global, previous));
  const digital = structuredClone(defaults);
  const benefits = { enabled: true, qualified: false, itemEvidenceMode: "SIMULATION", itemEvidenceService: "ItemOwner" };
  let admitted = true;
  global.CONFIG = { get: key => key === "digitalCore" ? digital : key === "promotion" ? { merchantBenefits: benefits } : undefined };
  global.SERVICE = { ItemOwner: { evaluate: () => assert.fail("Presentation cannot evaluate fulfillment") },
    DefaultPromotionItemBenefitService: { simulationSelected: () => admitted } };
  global.CLASSES = { NodicsError: class extends Error {} };
  const owner = { ...merchant, staff: async request => request };
  const workspace = await owner.workspace({});
  assert.equal(workspace.pricedSourceLabel, "ITEM simulation reference");
  assert.equal(workspace.pricedSourceRequired, true);
  assert.equal(workspace.storeRequired, false);
  benefits.evidenceService = "DefaultPromotionPricedTransactionAdapterService";
  assert.equal((await owner.workspace({})).pricedSourceLabel, "Basket or simulated fulfillment reference");
  assert.equal((await owner.workspace({ payload: { couponCode: "unvalidated-monetary", merchantReceiptReference: "CART:example" } })).pricedSourceLabel,
    "Basket or simulated fulfillment reference");
  assert.equal((await owner.workspace({})).pricedSourceRequired, workspace.pricedSourceRequired);
  assert.equal((await owner.workspace({})).storeRequired, workspace.storeRequired);
  digital.merchantRedemption.presentation.mixedSimulatedItemSourceLabel = "Owner mixed reference";
  assert.equal((await owner.workspace({})).pricedSourceLabel, "Owner mixed reference");
  digital.merchantRedemption.presentation.mixedSimulatedItemSourceLabel = "";
  await assert.rejects(owner.workspace({}));
  admitted = false;
  assert.equal((await owner.workspace({})).pricedSourceLabel, "Native basket reference");
  admitted = true;
  benefits.itemEvidenceMode = "VERIFIED";
  benefits.qualified = true;
  assert.equal((await owner.workspace({})).pricedSourceLabel, "Basket or item fulfillment reference");
  delete benefits.evidenceService;
  benefits.itemEvidenceMode = "SIMULATION";
  benefits.qualified = false;
  digital.merchantRedemption.presentation.simulatedItemSourceLabel = "Selected demo reference";
  assert.equal((await owner.workspace({})).pricedSourceLabel, "Selected demo reference");
  digital.merchantRedemption.presentation.simulatedItemSourceLabel = "";
  await assert.rejects(owner.workspace({}));
  admitted = false;
  assert.equal((await owner.workspace({ payload: { merchantReceiptReference: "SIM:forged" } })).pricedSourceLabel, "Native basket reference");
  benefits.itemEvidenceMode = "VERIFIED";
  benefits.qualified = true;
  assert.equal((await owner.workspace({})).pricedSourceLabel, "Item fulfillment reference");
  benefits.enabled = false;
  assert.equal((await owner.workspace({})).pricedSourceRequired, false);
});
