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
assert(
  source.includes('const locationUrl = process.env.AXIS_LOCATION_URL || "http://127.0.0.1:4380";') &&
    source.includes('"start:location"'),
  'fresh-schema acceptance must include the Location runtime when the local reset provider owns Location data'
);
assert(
  source.includes('function resolveExpectedResetProviderCount(status)') &&
    !source.includes('result.providerCount !== 4'),
  'fresh-schema acceptance must verify the configured reset provider count instead of freezing a four-provider topology'
);
assert(
  source.includes('function isExpectedAcceptanceBackendNoise(message)') &&
    source.includes('message.includes("ERR_DBS_00004")') &&
    source.includes('message.includes("Module schemas are not available")') &&
    source.includes('.filter((message) => !isExpectedAcceptanceBackendNoise(message))'),
  'fresh-schema acceptance may ignore only explicit Schema Workbench module-discovery misses from Axis smoke, not all backend errors'
);
assert(
  source.includes('await ensureInitializationProfileCurrent(headers, platformUrl, "localPlatformFoundation", "Platform foundation");') &&
    source.includes('await ensureInitializationProfileCurrent(headers, locationUrl, "localLocationFoundation", "Location foundation");') &&
    source.includes('await verifyLocationMapDefaults(headers);') &&
    source.includes('/nodics/import/v0/initialization-profiles') &&
    source.includes('/nodics/locationMap/v0/location/maps/configurations/effective?surfaceCode=AXIS&usageCode=COLLECTION_CENTRE_MAP'),
  'fresh-schema acceptance must install the Platform and Location foundation profiles and prove the effective Axis map configuration'
);

console.log('local bootstrap acceptance project contract passed');
