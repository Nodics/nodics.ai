/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/**
 * @module digitalCore/test/digitalPolicyBounds
 * @description Exercises gift/reminder consumers and deadline arithmetic against owner defaults and intentional overrides. Assertion failures expose invalid admission; each test restores CONFIG. No timer, delivery, persistence or exports.
 * @owner digitalCore
 * @layer test
 * @override Extend tests from effective owner properties, never service-local or customer replacement defaults.
 */
const test = require("node:test"), assert = require("node:assert/strict");
const bundles = require("../src/service/defaultDigitalBundleService");
const reminder = require("../src/service/defaultDigitalCommerceCouponReminderService");
const delivery = require("../src/service/defaultDigitalCouponReminderDeliveryService");
const gift = require("../src/service/defaultDigitalBundleGiftNotificationService");
const configuration = require("../src/utils/configuration");
/** Supplies a cloned framework policy and restores the original CONFIG after each isolated case. */
function fixture(t) {
  const before = global.CONFIG; t.after(() => { global.CONFIG = before; });
  const policy = structuredClone(require("../config/properties").digitalCore);
  global.CONFIG = { get: () => policy };
  policy.couponReminders.enabled = true;
  Object.assign(policy.giftNotifications, { enabled: true, qualified: true });
  return policy;
}
test("Digital gift/reminder settings inherit owner ranges and honor explicit bounded overrides", t => {
  const p = fixture(t);
  assert.equal(bundles.settings().giftExpirySeconds, 259200);
  assert.equal(reminder.settings().maximumCandidates, 200);
  assert.equal(delivery.settings().timeoutMs, 10000);
  assert.equal(gift.settings().maximumRecipients, 20);
  p.bundles.giftExpirySeconds = 120;
  assert.equal(configuration.deadline(0, bundles.settings().giftExpirySeconds, p.bundles.validation.giftExpirySeconds), "1970-01-01T00:02:00.000Z");
  p.couponReminders.validation.maximumCandidates.maximum = 1500;
  p.couponReminders.maximumCandidates = 1200;
  assert.equal(reminder.settings().maximumCandidates, 1200);
  p.giftNotifications.validation.maximumRecipients.maximum = 150;
  p.giftNotifications.maximumRecipients = 120;
  assert.equal(gift.settings().maximumRecipients, 120);
});
test("Digital refuses missing/inverted ranges and invalid numbers instead of supplying inline defaults", t => {
  const p = fixture(t);
  for (const [owner, key, read] of [[p.bundles, "giftExpirySeconds", () => bundles.settings()],
    [p.couponReminders, "leadTimeSeconds", () => reminder.settings()],
    [p.couponReminders, "maximumCandidates", () => reminder.settings()],
    [p.couponReminders, "maximumTriggerAgeSeconds", () => reminder.settings()],
    [p.couponReminders.delivery, "timeoutMs", () => delivery.settings()],
    [p.couponReminders.delivery, "maximumRecipients", () => delivery.settings()],
    [p.giftNotifications, "maximumRecipients", () => gift.settings()]]) {
    const original = owner[key], range = structuredClone(owner.validation[key]);
    for (const invalid of [0, -1, 1.5, "1", NaN, Infinity, Number.MAX_SAFE_INTEGER, undefined]) {
      owner[key] = invalid; assert.throws(read);
    }
    owner[key] = original; delete owner.validation[key]; assert.throws(read);
    owner.validation[key] = { minimum: 2, maximum: 1 }; assert.throws(read);
    owner.validation[key] = range; read();
  }
});
test("even expanded owner ranges cannot admit arithmetic or Date overflow", t => {
  const p = fixture(t), range = p.bundles.validation.giftExpirySeconds;
  range.maximum = Number.MAX_SAFE_INTEGER;
  assert.throws(() => configuration.deadline(0, Number.MAX_SAFE_INTEGER, range), /expiry/);
  assert.throws(() => configuration.deadline(8640000000000000, 1, range), /expiry/);
  assert.equal(configuration.deadline(0, 1, range), "1970-01-01T00:00:01.000Z");
});
