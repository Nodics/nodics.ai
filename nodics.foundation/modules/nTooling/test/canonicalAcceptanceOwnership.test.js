/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const tooling = require('../src/service/defaultToolingCommandService');
const project = require('../src/service/command/defaultProjectCommandService');

/** @module nTooling/test/canonicalAcceptanceOwnership @description Proves partner-independent suite ownership and rejects shadowing without running acceptance. @owner nTooling @layer test */
function fixture(t, index = '1000.0') {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'partner-acceptance-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, 'config'), { recursive: true });
  fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify({ name: 'partner.independent', index,
    nodics: { kind: 'application', runtimeModule: false, loadableByNodicsModuleLoader: false } }));
  fs.writeFileSync(path.join(root, 'nodics.js'), 'module.exports = {};');
  return root;
}

test('an independent project inherits complete suites without customer implementation files', t => {
  const root = fixture(t);
  const registry = tooling.loadCommands(root);
  for (const [name, owner] of Object.entries({
    'acceptance:capability-registry': 'backoffice',
    'acceptance:guided-initialization': 'cms',
    'acceptance:media-seed': 'media',
    'acceptance:staged-sample-data': 'import',
    'qualification:deployment': 'nTooling',
    'qualification:commerce-live': 'nTooling',
    'acceptance:local': 'backoffice',
    'acceptance:functional': 'nTooling',
    'acceptance:runtime-grants': 'profile',
    'acceptance:editorial-live': 'editorial',
    'acceptance:commerce-journey': 'checkoutCore',
    'acceptance:commerce-publication': 'product',
    'acceptance:waste-backoffice': 'wasteCore',
    'acceptance:waste-management': 'wasteApi',
    'acceptance:loyalty-reward-checkout': 'loyaltyRewardProvider',
  })) {
    assert.equal(registry[name].sourceModule, owner);
    assert.equal(registry[name].acceptanceContract, true);
    assert(fs.existsSync(path.join(registry[name].sourcePath, registry[name].script)));
    const command = project.resolveCommands(root)[name];
    assert.equal(command.type, 'frameworkCommand');
    assert.equal(command.home, 'project');
  }
});

test('earlier and later partner modules cannot replace or weaken a canonical command', t => {
  for (const index of ['0.001', '9999.0']) {
    const root = fixture(t, index);
    for (const definition of [
      { acceptanceContract: false },
      { handler: 'src/skip.js', $override: { mode: 'replace' } },
      { arguments: ['--skip-required'] },
    ]) {
      fs.writeFileSync(path.join(root, 'config/properties.js'), 'module.exports = ' + JSON.stringify({
        tooling: { commands: { 'acceptance:guided-initialization': definition } },
      }));
      assert.throws(() => tooling.loadCommands(root), /acceptance contract cannot be overridden/);
    }
  }
});

test('project script alias collisions fail rather than select an alternate implementation', t => {
  const root = fixture(t);
  const scripts = path.join(root, 'scripts/acceptance');
  fs.mkdirSync(scripts, { recursive: true });
  fs.writeFileSync(path.join(scripts, 'defaultProjectGuidedInitializationAcceptanceService.mjs'), 'throw new Error("must not execute");');
  assert.throws(() => project.resolveCommands(root), /shadows framework acceptance contract/);
});

test('retired mixed script names cannot restore a customer copy of canonical suites', t => {
  const root = fixture(t);
  const scripts = path.join(root, 'scripts/acceptance');
  fs.mkdirSync(scripts, { recursive: true });
  for (const name of ['AgoraCommerce', 'AgoraCommerceLiveQualification', 'AgoraCommercePublication',
    'EditorialLiveJourney', 'FunctionalJourney', 'LocalBootstrap', 'LoyaltyRewardCheckout',
    'RuntimeDeploymentGrant', 'WasteBackofficeDiscovery', 'WasteManagement']) {
    const file = path.join(scripts, 'defaultProject' + name + (name.endsWith('Qualification') ? '' : 'Acceptance') + 'Service.mjs');
    fs.writeFileSync(file, 'throw new Error("must not execute");');
    assert.throws(() => project.resolveCommands(root), /shadows framework acceptance contract/, name);
    fs.unlinkSync(file);
  }
});
