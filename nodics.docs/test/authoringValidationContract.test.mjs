/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */

/** @module nodics.docs/test/authoringValidationContract @description Checks current composed authoring records without inventing approval actors or relaxing public delivery. @layer test @owner nodics.docs */
import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const contract = require('../../nodics.foundation/modules/nTooling/src/service/defaultApplicationDocumentationContractService');
const validator = require('../../nodics.foundation/modules/nTooling/src/service/defaultApplicationDocumentationRecordValidationService');
const root = fileURLToPath(new URL('..', import.meta.url));
const catalogue = contract.validateDataRelease(root);
const families = {
  products: 'Product', navigation: 'Navigation', nodes: 'Node', dashboards: 'Dashboard',
  pages: 'PageMetadata', accessPolicies: 'AccessPolicy', publicationStates: 'PublicationState',
  searchMetadata: 'SearchMetadata', cmsPages: 'Page', routes: 'Route', components: 'Component',
};
const records = Object.fromEntries(Object.entries(families).map(([name, suffix]) =>
  [name, contract.readReleaseRecords(catalogue.releaseComposition, suffix).records]));
records.manifestHashes = JSON.parse(fs.readFileSync(new URL('../data/manifest.json', import.meta.url))).sections.documentation.generatedHashes;
const inspect = (input, validationScope = 'AUTHORING') => validator.validateRecords({
  records: input, options: { validationScope, release: catalogue.release, source: 'nodics.docs/data/manifest.json', owner: 'nodics.docs' },
});
const publicationEvidence = report => report.checks.find(check => check.id === 'publication-state-evidence');

test('current composed source records validate without future actors on staged authoring', () => {
  const before = structuredClone(records);
  assert.ok(records.publicationStates.some(state => state.lifecycleState === 'STAGED' && !Object.hasOwn(state, 'reviewer')));
  validator.assertReady(inspect(records));
  assert.deepEqual(records, before);
});

test('current source composition still rejects missing authors, null actors and absent later-state approval evidence', () => {
  for (const mutate of [state => { delete state.author; }, state => { state.reviewer = null; },
    state => { state.lifecycleState = 'APPROVED'; }]) {
    const changed = structuredClone(records);
    const staged = changed.publicationStates.find(state => state.lifecycleState === 'STAGED' && !Object.hasOwn(state, 'reviewer'));
    mutate(staged);
    const report = inspect(changed);
    assert.equal(publicationEvidence(report).passed, false);
    assert.throws(() => validator.assertReady(report));
  }
});

test('authoring readiness never makes current staged source valid public delivery', () => {
  const report = inspect(records, 'PUBLIC_DELIVERY');
  assert.equal(publicationEvidence(report).passed, false);
  assert.equal(report.checks.find(check => check.id === 'public-record-online-state').passed, false);
  assert.throws(() => validator.assertReady(report));
});
