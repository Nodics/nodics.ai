/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTooling/test/dataReleaseManifestGeneratorContract
 * @description Protects order-independent immutable data-release comparison in the aggregate-manifest generator.
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const source = fs.readFileSync(path.resolve(__dirname, '../bin/generate-data-release-manifests.js'), 'utf8');

assert(source.includes('function sameFileMap(left, right)'),
    'The manifest generator must compare file maps through one explicit helper');
assert(source.includes("Object.entries(left || {}).sort"),
    'The manifest generator must normalize file paths before comparison');
assert(source.includes('if (!sameFileMap(existing.files, files))'),
    'Release drift detection must use the order-independent comparison');
assert(source.includes('function releaseRootsFor(dataRoot, dataType)'),
    'The manifest generator must discover versioned release folders from the data root');
assert(source.includes("sourceRoot: entry.name"),
    'The manifest generator must derive sourceRoot from versioned release directory names');
assert(source.includes("sectionCode !== releaseRoot.sectionCode && contribution"),
    'Named destination-qualified sections must be distinguished from the conventional release section');
assert(source.includes("contribution.kind === 'DATA_RELEASE' && contribution.dataType === dataType"),
    'Only same-type data-release contributions may claim files from conventional generation');
assert(source.includes('releaseFiles = filesBelow(releaseRoot.root).filter(file => !contributionFiles.has(file))'),
    'Files claimed by named contributions must not be duplicated into the conventional release');

console.log('Data release manifest generator contract validated');
