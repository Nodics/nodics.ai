/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module media/acceptance/defaultMediaSeedAcceptanceService @description Canonical Staged media preparation using application-owned manifests. @owner media @layer tooling */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import commands from '../../../../../../nodics.foundation/modules/nTooling/src/service/defaultToolingCommandService.js';
import probe from '../../../../../../nodics.foundation/modules/nTooling/src/service/project/defaultProjectConfigurationProbeService.js';
import { readProjectEnvironmentConfiguration, projectRuntime, projectEndpointUrl, projectCorsOrigin } from '../../../../../../nodics.foundation/modules/nTooling/src/service/project/defaultProjectEnvironmentConfigurationService.mjs';
import { parseAcceptanceResponse, authenticateAcceptanceEmployee } from '../../../../../../nodics.foundation/modules/nTooling/src/service/project/defaultProjectAcceptanceService.mjs';
import { uploadAcceptanceMedia } from '../../../../../../nodics.foundation/modules/nTooling/src/service/project/defaultProjectAcceptanceMediaService.mjs';

const require = createRequire(import.meta.url);
const frameworkRoot = fileURLToPath(new URL('../../../../../../', import.meta.url));

function confined(root, relative) {
  if (typeof relative !== 'string' || !relative || path.isAbsolute(relative) || relative.split(/[\\/]/).includes('..'))
    throw new Error('Manifest paths must be module-relative');
  const base = fs.realpathSync(root);
  const target = fs.realpathSync(path.join(base, relative));
  const remainder = path.relative(base, target);
  if (!remainder || remainder.startsWith('..' + path.sep) || path.isAbsolute(remainder))
    throw new Error('Manifest path escapes its owner');
  return target;
}

/** Resolve selected manifests from effective Platform profiles; inactive optional selections are ignored, but empty selection fails. */
export function mediaSeedAssets({ profiles, modules, selectedModules }) {
  if (!Array.isArray(selectedModules) || !selectedModules.length || selectedModules.some(name => typeof name !== 'string' || !name))
    throw new Error('Select manifest modules explicitly');
  const assets = new Map();
  for (const profile of Object.values(profiles || {})) {
    if (profile.enabled === false) continue;
    for (const step of profile.dataPackages || []) {
      if (step.type !== 'MEDIA_ASSET_MANIFEST' || !selectedModules.includes(step.manifestModule)) continue;
      if (step.targetRuntimeRole !== 'WCMS_STAGED') throw new Error('Media seeding requires a WCMS_STAGED manifest');
      const owners = modules.filter(module => module.name === step.manifestModule);
      if (owners.length !== 1) throw new Error('Select one manifest owner: ' + step.manifestModule);
      const manifest = confined(owners[0].path, step.manifestPath);
      if (!fs.statSync(manifest).isFile()) throw new Error('Manifest must be a file');
      const files = confined(path.dirname(manifest), 'files');
      const entries = require(manifest);
      if (!Array.isArray(entries) || !entries.length) throw new Error('Media asset manifest is empty');
      for (const asset of entries) {
        if (!asset || typeof asset.mediaCode !== 'string' || !asset.mediaCode.trim()) throw new Error('Media code is required');
        const file = confined(files, asset.fileName);
        if (!fs.statSync(file).isFile()) throw new Error('Asset must be a file');
        const businessPurpose = asset.businessPurpose || step.businessPurpose;
        if (!businessPurpose) throw new Error('Application business purpose is required');
        const buffer = fs.readFileSync(file);
        const checksum = crypto.createHash('sha256').update(buffer).digest('hex');
        const value = { asset, assetFilesRoot: files, businessPurpose, checksum, buffer };
        const previous = assets.get(asset.mediaCode);
        if (previous && (previous.checksum !== checksum || previous.businessPurpose !== businessPurpose ||
            JSON.stringify(previous.asset) !== JSON.stringify(asset))) throw new Error('Conflicting media code: ' + asset.mediaCode);
        assets.set(asset.mediaCode, value);
      }
    }
  }
  if (!assets.size) throw new Error('No media manifests match the active application selection');
  return [...assets.values()];
}

/** Upload only to the selected Staged runtime using employee authority; publication is deliberately outside this command. */
export async function runMediaSeedAcceptance({
  projectRoot = process.env.NODICS_PROJECT_ROOT || process.cwd(), environment = process.env,
  selectedModules, execute = false, configuration, profiles, modules,
  fetch: fetchRequest = globalThis.fetch, log = console.log,
} = {}) {
  if (!execute) throw new Error('Explicit --execute is required for media seeding');
  const config = configuration || readProjectEnvironmentConfiguration(projectRoot, environment.NODICS_ENVIRONMENT || environment.ENV || '');
  const platform = projectRuntime(config, { role: 'PLATFORM' });
  const platformUrl = projectEndpointUrl(config, { role: 'PLATFORM' });
  const stagedUrl = projectEndpointUrl(config, { role: 'WCMS_STAGED' });
  const resolvedProfiles = profiles || probe.read({ projectRoot, frameworkRoot, environment: config.environment,
    server: platform.server, inheritEnvironment: true }).properties.backofficeApplicationInitialization?.profiles;
  const available = modules || commands.collectModules(projectRoot, commands.collectModules(frameworkRoot, []));
  // Validate every local asset before authentication or the first mutation.
  const assets = mediaSeedAssets({ profiles: resolvedProfiles, modules: available, selectedModules });
  const origin = environment.AXIS_ORIGIN || environment.NODICS_ACCEPTANCE_ORIGIN || projectCorsOrigin(config, 'axis');
  const enterprise = environment.AXIS_ENTERPRISE || environment.NODICS_ENTERPRISE_CODE || 'default';
  const common = { Origin: origin, 'x-enterprise-code': enterprise };
  const transport = (url, options) => fetchRequest(url, { ...options, signal: AbortSignal.timeout(30000) });
  const request = async (base, route, options = {}) => parseAcceptanceResponse(await transport(new URL(route, base), {
    ...options, headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...common, ...options.headers },
  }), { route, unwrap: body => body?.result ?? body?.data ?? body });
  const auth = await authenticateAcceptanceEmployee({ request, baseUrl: platformUrl,
    suppliedToken: environment.AXIS_AUTH_TOKEN || environment.NODICS_AUTH_TOKEN,
    credentials: { loginId: environment.AXIS_LOGIN_ID || 'admin', password: environment.AXIS_PASSWORD || environment.NODICS_BOOTSTRAP_ADMIN_PASSWORD },
    headers: common, routes: ['/nodics/profile/v0/employee/browser/authenticate', '/nodics/profile/v0/employee/authenticate'],
    missingToken: route => route + ' returned no employee auth token',
    failureMessage: 'Employee authentication returned no auth token',
  });
  for (const entry of assets) {
    const response = await uploadAcceptanceMedia({ ...entry,
      url: new URL('/nodics/media/v0/storage/upload', stagedUrl).toString(),
      headers: { ...common, ...auth }, fetchImpl: transport,
    });
    const stored = await parseAcceptanceResponse(response, { route: 'media upload', unwrap: body => body?.result ?? body?.data ?? body });
    if (stored?.code !== entry.asset.mediaCode || stored?.checksumAlgorithm !== 'sha256' || stored?.checksum !== entry.checksum)
      throw new Error('Media upload integrity verification failed: ' + entry.asset.mediaCode);
  }
  const evidence = { uploaded: assets.length, destination: 'WCMS_STAGED', publication: 'NOT_REQUESTED' };
  log(JSON.stringify(evidence));
  return evidence;
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  if (process.argv.includes('--help')) console.log('acceptance:media-seed --manifest-modules=<module,...> --execute. Uses active application manifests and employee-authorized Staged uploads only; publish through the normal approval lifecycle.');
  else await runMediaSeedAcceptance({ execute: process.argv.includes('--execute'),
    selectedModules: process.argv.find(arg => arg.startsWith('--manifest-modules='))?.split('=').slice(1).join('=').split(',') });
}
