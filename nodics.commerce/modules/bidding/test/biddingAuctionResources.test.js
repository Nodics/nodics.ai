/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module bidding/test/biddingAuctionResources @description Validates inert owner contributions through canonical Communication manifests and exact Cron release bytes. @layer test @owner bidding */
const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const properties = require('../config/properties');
test('all auction message resources use Communication manifests and explicit selections', () => {
  const templates = require('../../../../nodics.communication/modules/commsCore/src/service/defaultCommunicationTemplateService');
  const root = path.join(__dirname, '../src/templates/in_app');
  const declarations = fs.readdirSync(root).map(folder => JSON.parse(fs.readFileSync(path.join(root, folder, 'template.json'), 'utf8')));
  for (const [kind, code] of Object.entries(properties.bidding.auction.notifications.templates)) {
    const manifest = declarations.find(row => row.code === code);
    templates.validateManifest(manifest, 'IN_APP');
    assert.equal(manifest.purpose, 'AUCTION_' + kind);
    assert.equal(manifest.requiresSelection, true);
    assert.deepEqual(manifest.sourceModules, ['bidding']);
    assert.equal(properties.communication.dispatchEligibilityOwners.bidding[manifest.purpose], 'DefaultBiddingAuctionNotificationService');
  }
  assert.equal(properties.bidding.auction.notifications.enabled, false);
  assert.equal(properties.bidding.auction.notifications.qualified, false);
});
test('Cron release pins inactive definition and contributes no activation or invented recipient', () => {
  const section = require('../data/manifest.json').sections.auctionCloseSchedule;
  assert.equal(section.selectionPolicy, 'EXPLICIT'); assert.equal(section.installer, 'CRON_JOB'); assert.equal(section.destinationRole, 'CRON');
  for (const [file, digest] of Object.entries(section.files))
    assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(__dirname, '../data', file))).digest('hex'), digest);
  const definition = require('../data/init-v001/records/jobs/biddingAuctionCloseJobData').record1;
  assert.equal(definition.active, false); assert.equal(definition.runOnInit, false); assert.equal(definition.emails, undefined);
  assert.equal(definition.jobDetail.startNode, properties.bidding.auction.scheduler.startNode);
  assert.equal(properties.bidding.auction.scheduler.enabled, false);
});
