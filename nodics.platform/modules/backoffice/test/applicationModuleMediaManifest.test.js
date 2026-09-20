/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module backoffice/test/applicationModuleMediaManifest @description Verifies registry-owned accelerator assets, traversal rejection and project compatibility without uploads. @layer test @owner backoffice */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const service = require('../src/service/defaultBackofficeApplicationInitializationService');
global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message); this.code = code; } } };
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-module-assets-'));
try {
  const owner = path.join(root, 'owner');
  fs.mkdirSync(path.join(owner, 'data/files'), { recursive: true });
  fs.writeFileSync(path.join(owner, 'data/manifest.js'), 'module.exports = [{mediaCode:"referenceAsset"}]');
  fs.writeFileSync(path.join(owner, 'data/files/pixel.svg'), '<svg/>');
  fs.writeFileSync(path.join(root, 'outside.js'), 'module.exports = []');
  global.NODICS = { getRawModule: name => name === 'reference.web' ? { path: owner } : undefined };
  const step = service.normalizePreparationStep({ type: 'MEDIA_ASSET_MANIFEST', code: 'reference.web:assets', manifestModule: 'reference.web', manifestPath: 'data/manifest.js', targetServer: 'staged', targetRuntimeRole: 'WCMS_STAGED' }, 0);
  assert.equal(step.manifestModule, 'reference.web');
  assert.equal(service.mediaManifestAssetCount(step), 1);
  assert.equal(service.safeManifestAssetPath(step, 'pixel.svg'), fs.realpathSync(path.join(owner, 'data/files/pixel.svg')));
  assert.throws(() => service.normalizePreparationStep({ ...step, manifestModule: 'differentOwner' }, 0), /configuration is invalid/);
  assert.throws(() => service.safeManifestPath({ ...step, manifestModule: 'unknown' }), /declared module-relative/);
  assert.throws(() => service.safeManifestPath({ ...step, manifestPath: '../outside.js' }), /declared module-relative/);
  assert.throws(() => service.safeManifestAssetPath(step, '../../outside.js'), /path is invalid/);
  fs.symlinkSync(path.join(root, 'outside.js'), path.join(owner, 'data/link.js'));
  assert.throws(() => service.safeManifestPath({ ...step, manifestPath: 'data/link.js' }), /escapes/);
  fs.symlinkSync(path.join(root, 'outside.js'), path.join(owner, 'data/files/link.svg'));
  assert.throws(() => service.safeManifestAssetPath(step, 'link.svg'), /escapes/);
  fs.renameSync(path.join(owner, 'data/files'), path.join(owner, 'data/ownedFiles'));
  fs.mkdirSync(path.join(root, 'outsideFiles'));
  fs.writeFileSync(path.join(root, 'outsideFiles/pixel.svg'), '<svg/>');
  fs.symlinkSync(path.join(root, 'outsideFiles'), path.join(owner, 'data/files'));
  assert.throws(() => service.safeManifestAssetPath(step, 'pixel.svg'), /directory escapes/);
  const projectService = { ...service, projectRoot: () => owner };
  assert.equal(projectService.safeManifestPath({ manifestPath: 'data/manifest.js' }), path.join(owner, 'data/manifest.js'));
} finally { fs.rmSync(root, { recursive: true, force: true }); }
console.log('Module-owned media manifests and confinement validated');
