/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

test('Nexus reference releases retain immutable destination classification', () => {
  const manifest = JSON.parse(fs.readFileSync(new URL('../data/manifest.json', import.meta.url), 'utf8'));
  assert.equal(manifest.contractVersion, 2);
  assert(manifest.sections.nexusCorporateSite);
  const releases = Object.values(manifest.sections).filter(section => section.kind === 'DATA_RELEASE');
  assert(releases.length);
  for (const release of releases) assert(release.version && release.lifecycle && release.destinationRole);
});
