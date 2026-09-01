/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTooling/test/localBootstrapAcceptanceProjectContract
 * @description Proves local bootstrap acceptance reads project-declared capabilities instead of hard-coded project names.
 * @layer test
 * @owner nTooling
 * @override Customer-project acceptance may add customer documentation checks through nodics.project.json, but must not infer capabilities from a project code.
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const servicePath = path.join(
  process.cwd(),
  'nodics.foundation',
  'modules',
  'nTooling',
  'src',
  'service',
  'project',
  'defaultProjectLocalBootstrapAcceptanceService.mjs'
);
const source = fs.readFileSync(servicePath, 'utf8');

assert(
  !source.includes(['isReference', 'KickoffProject'].join('')),
  'local acceptance must not branch on a hard-coded project name'
);
assert(
  source.includes('const defaultAxisRoot = existsSync(resolve(workspaceRoot, "nodics.axis"))') &&
    source.includes('resolve(workspaceRoot, "nodics.exp", "nodics.axis")'),
  'local acceptance must discover the flat customer Axis checkout before falling back to nodics.exp'
);
assert(
  source.includes('function loadLocalBootstrapCapabilities()') &&
    source.includes('descriptor?.acceptance?.localBootstrap'),
  'local acceptance must load capability declarations from nodics.project.json'
);
assert(
  source.includes('function assertValidLocalBootstrapCapabilities(capabilities)') &&
    source.includes('Invalid acceptance.localBootstrap in nodics.project.json'),
  'local acceptance must reject invalid capability declarations with a beginner-readable descriptor error'
);
assert(
  source.includes('const projectCode = process.env.AXIS_PROJECT || resolveProjectCode(projectDescriptor, packageDescriptor);'),
  'local acceptance must derive the project code from package.json.name'
);
assert(
  source.includes('function defaultLocalBootstrapCapabilities()') &&
    source.includes('code: "kickoffDocumentation"'),
  'legacy fallback capabilities must preserve Kickoff documentation behavior when older projects do not declare localBootstrap'
);
assert(
  source.includes('AXIS_EXPECT_DOCUMENTATION: axisSmoke.expectDocumentation ? "1" : "0"') &&
    source.includes('for (const route of axisSmoke.routes)'),
  'Axis smoke flags and routes must come from declared capabilities'
);
assert(
  !source.includes('const profiles = [\n    { code: "frameworkdocs"') &&
    source.includes('profile.profileCode'),
  'documentation publication must use shared project-aware pack metadata'
);
assert(
  source.includes('await publishDocumentationBundles(headers);') &&
    !source.includes('documentation publication skipped: oversized documentation bundles remain Staged'),
  'fresh-schema acceptance must publish documentation packs now that CMS supports chunked site publication'
);

console.log('local bootstrap acceptance project contract passed');
