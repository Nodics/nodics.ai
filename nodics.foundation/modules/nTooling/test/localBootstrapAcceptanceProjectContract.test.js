/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTooling/test/localBootstrapAcceptanceProjectContract
 * @description Proves local bootstrap acceptance keeps Kickoff-only documentation gates scoped to the reference project.
 * @layer test
 * @owner nTooling
 * @override Customer-project acceptance may add customer documentation checks, but must not require Kickoff-only packs or routes outside nodics.kickoff.
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
  source.includes('const isReferenceKickoffProject = projectCode === "nodics.kickoff";'),
  'local acceptance must identify the reference Kickoff project explicitly'
);
assert(
  source.includes('const defaultAxisRoot = existsSync(resolve(workspaceRoot, "nodics.axis"))') &&
    source.includes('resolve(workspaceRoot, "nodics.exp", "nodics.axis")'),
  'local acceptance must discover the flat customer Axis checkout before falling back to nodics.exp'
);
assert(
  source.includes('...(isReferenceKickoffProject ? [{') &&
    source.includes('code: "kickoffDocumentation"'),
  'kickoffDocumentation must be included only for the reference Kickoff project'
);
assert(
  source.includes('...(isReferenceKickoffProject ? ["/docs/nodics-kickoff"] : [])'),
  'the /docs/nodics-kickoff route must be optional for generated customer projects'
);
assert(
  !source.includes('const profiles = [\n    { code: "frameworkdocs"') &&
    source.includes('profile.profileCode'),
  'documentation publication must use shared project-aware pack metadata'
);

console.log('local bootstrap acceptance project contract passed');
