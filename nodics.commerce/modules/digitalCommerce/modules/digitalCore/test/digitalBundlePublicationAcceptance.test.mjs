/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module digitalCore/test/digitalBundlePublicationAcceptance @description Verifies the Digital-owned bundle publication acceptance runner and framework registration. @layer test @owner digitalCore */
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import defaults from '../config/properties.js';
import {
  digitalBundlePublicationAcceptanceArgument,
  digitalBundlePublicationSelection,
  runDigitalBundlePublicationAcceptance,
  selectDigitalBundlePublicationAcceptance,
} from '../src/service/acceptance/defaultDigitalBundlePublicationAcceptanceService.mjs';

const hex = character => character.repeat(64);
const ownerRef = { module: 'profile', schema: 'customer', code: 'owner' };
const certificate = { kind: 'CERTIFICATE', reference: { module: 'wasteCore', schema: 'wasteAsset', code: 'certificate' },
  quantity: '1', expectedRevision: 3 };
const carbon = { kind: 'REALIZED_CARBON', reference: { module: 'wasteCarbon', schema: 'wasteCarbonLot', code: 'carbon-lot' },
  quantity: '2.50', expectedRevision: 7, unitOfMeasure: 'KG_CO2E' };

function selection() {
  return {
    contractVersion: 1, approvalReference: 'approved', localDemo: true, isolatedPartition: true,
    tenant: 'tenant', runCode: 'run', owner: { ownerRef, enterpriseCode: 'participant-enterprise' },
    manifest: { idempotencyKey: 'manifest-key', components: [certificate, carbon] },
    listing: { idempotencyKey: 'listing-key', listingContextRef: { code: 'context', revision: 2 },
      storeEnterpriseCode: 'store-enterprise', name: 'Certificate and carbon bundle', description: 'Reviewed fixture',
      categoryCodes: ['circular'], storeCode: 'store', saleMode: 'FIXED', amount: '10.00', currency: 'POINTS',
      priceBookCode: 'rewards', reward: { programCode: 'program', rewardTypeCode: 'points', scale: 2 },
      startsAt: '2026-10-21T00:00:00.000Z', endsAt: null },
  };
}

function options(overrides = {}) {
  return { execute: true, selection: selection(), maximumComponents: 100, requestTimeoutMs: 30000,
    digitalBaseUrl: 'http://localhost:4350', productBaseUrl: 'http://localhost:4352',
    sessions: {
      participant: { authorization: 'Bearer participant', enterpriseCode: 'participant-enterprise' },
      digitalRuntime: { authorization: 'Bearer digital', enterpriseCode: 'store-enterprise' },
      productRuntime: { authorization: 'Bearer product', enterpriseCode: 'store-enterprise' },
    }, ...overrides };
}

test('registers one Digital-owned command and reusable acceptance bound', () => {
  assert.deepEqual(defaults.tooling.commands['acceptance:digital-bundle-publication'], {
    acceptanceContract: true, projectHome: true, handler: '@nTooling/node-script',
    script: 'src/service/acceptance/defaultDigitalBundlePublicationAcceptanceService.mjs',
  });
  assert.deepEqual(defaults.digitalCore.bundleListings.acceptance, { requestTimeoutMs: 30000 });
});

test('requires reviewed canonical certificate and realized-carbon selections without rewards', () => {
  assert.equal(digitalBundlePublicationSelection(options()).selection.manifest.components.length, 2);
  const withoutDescription = selection();
  delete withoutDescription.listing.description;
  assert.equal(digitalBundlePublicationSelection(options({ selection: withoutDescription })).selection.listing.description, undefined);
  for (const components of [
    [certificate],
    [certificate, { ...carbon, kind: 'PROSPECTIVE_CARBON' }],
    [certificate, carbon, { kind: 'REWARD', reference: certificate.reference, quantity: '1', expectedRevision: 1 }],
  ]) assert.throws(() => digitalBundlePublicationSelection(options({ selection: {
    ...selection(), manifest: { ...selection().manifest, components },
  } })), /COMPONENT|CARBON|PUBLICATION/);
  assert.throws(() => digitalBundlePublicationSelection(options({ sessions: {
    ...options().sessions, digitalRuntime: { authorization: 'Bearer digital', enterpriseCode: 'foreign' },
  } })), /SESSION/);
});

test('creates the exact manifest then proves Digital reservations and Product delegation', async () => {
  const manifestCode = 'bundle:' + hex('a'), operationCode = 'bundle-operation:' + hex('b');
  const components = [carbon, certificate];
  const product = { confirmed: true, publicationCode: operationCode, productCode: 'product', variantCode: 'variant',
    sku: 'sku', versionId: 0 };
  const terms = { storeCode: 'store', currency: 'POINTS', priceBookCode: 'rewards',
    reward: { programCode: 'program', rewardTypeCode: 'points', scale: 2 }, saleMode: 'FIXED',
    name: 'Certificate and carbon bundle', description: 'Reviewed fixture', amount: '10',
    startsAt: '2026-10-21T00:00:00.000Z', endsAt: null, categoryCodes: ['circular'] };
  const responses = [
    { code: manifestCode, status: 'ACTIVE', revision: 0, ownerRef, components, digest: hex('c') },
    { confirmed: true, operationCode, publicationCode: operationCode, status: 'PUBLISHED', quantity: '1',
      biddingMode: 'FIXED', listingContextRef: { code: 'context', revision: 2 }, ...product, bindingCode: 'binding' },
    { confirmed: true, enterpriseCode: 'store-enterprise', operationCode, ownerRef, termsDigest: hex('d'), terms,
      manifest: { code: manifestCode, revision: 0, digest: hex('c') }, product,
      price: { confirmed: true, receiptCode: 'price' }, release: null },
    { confirmed: true, status: 'ONLINE', publicationCode: operationCode, productCode: 'product', variantCode: 'variant',
      storeCode: 'store', targetVersion: 'version', receiptCode: 'receipt' },
  ];
  const calls = [];
  const fetch = async (url, init) => {
    calls.push({ url: String(url), init, body: JSON.parse(init.body) });
    return { ok: true, status: 200, json: async () => ({ data: responses.shift() }) };
  };
  const result = await runDigitalBundlePublicationAcceptance(options({ fetch }));
  assert.equal(result.state, 'PASSED');
  assert.equal(result.componentReservationsConfirmed, true);
  assert.equal(result.rewardsIncludedInBundle, false);
  assert.equal(result.productPublicationConfirmed, true);
  assert.deepEqual(result.componentKinds, ['CERTIFICATE', 'REALIZED_CARBON']);
  assert.equal(calls.length, 4);
  assert.match(calls[0].url, /\/nodics\/digitalCore\/v0\/bundles$/);
  assert.deepEqual(calls[0].body.components, [certificate, carbon]);
  assert.equal(calls[0].body.components.some(component => /REWARD/i.test(component.kind)), false);
  assert.deepEqual(calls[0].body.composition, { mode: 'FIXED', operationKey: 'listing-key',
    terms: { listingContextRef: { code: 'context', revision: 2 }, name: 'Certificate and carbon bundle',
      description: 'Reviewed fixture', categoryCodes: ['circular'], storeCode: 'store', saleMode: 'FIXED',
      amount: '10.00', currency: 'POINTS', priceBookCode: 'rewards',
      reward: { programCode: 'program', rewardTypeCode: 'points', scale: 2 },
      startsAt: '2026-10-21T00:00:00.000Z', endsAt: null } });
  assert.match(calls[1].url, /\/nodics\/digitalCore\/v0\/bundle-listings$/);
  assert.match(calls[2].url, /\/nodics\/digitalCore\/v0\/internal\/bundle-listings\/proof$/);
  assert.match(calls[3].url, /\/nodics\/product\/v0\/internal\/products\/bundle-listings\/inspect$/);
  assert.equal(calls[0].init.headers.Authorization, 'Bearer participant');
  assert.equal(calls[2].init.headers.Authorization, 'Bearer digital');
  assert.equal(calls[3].init.headers.Authorization, 'Bearer product');
  assert.equal(responses.length, 0);
});

test('returns recovery-required evidence without retrying an uncertain publication', async () => {
  let calls = 0;
  const result = await runDigitalBundlePublicationAcceptance(options({ fetch: async () => {
    calls += 1;
    throw new Error('unknown');
  } }));
  assert.deepEqual(result, { contractVersion: 1, state: 'RECOVERY_REQUIRED', stage: 'digitalCore:POST:/bundles',
    reasonCode: 'BUNDLE_PUBLICATION_HTTP_OUTCOME_UNCONFIRMED' });
  assert.equal(calls, 1);
});

test('selects only own project profiles and exposes explicit CLI help', () => {
  const fixture = selection();
  assert.equal(selectDigitalBundlePublicationAcceptance({ digitalBundlePublication: fixture }), fixture);
  assert.equal(digitalBundlePublicationAcceptanceArgument([]), 'digitalBundlePublication');
  assert.equal(digitalBundlePublicationAcceptanceArgument(['--acceptance=anotherPublication']), 'anotherPublication');
  assert.throws(() => selectDigitalBundlePublicationAcceptance(Object.create({ inherited: fixture }), 'inherited'), /UNAVAILABLE/);
  assert.throws(() => digitalBundlePublicationAcceptanceArgument(['--acceptance']), /SELECTION_INVALID/);
  const script = new URL('../src/service/acceptance/defaultDigitalBundlePublicationAcceptanceService.mjs', import.meta.url).pathname;
  const result = spawnSync(process.execPath, [script, '--help'], { cwd: '/', encoding: 'utf8', env: { PATH: process.env.PATH } });
  assert.equal(result.status, 0);
  assert.match(result.stdout, /acceptance:digital-bundle-publication --execute/);
  assert.equal(result.stderr, '');
});
