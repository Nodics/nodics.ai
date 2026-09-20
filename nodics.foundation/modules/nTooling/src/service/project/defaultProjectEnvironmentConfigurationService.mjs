#!/usr/bin/env node
/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTooling/service/project/defaultProjectEnvironmentConfigurationService
 * @description Resolves project environment operation inputs from existing module configuration.
 * @layer tooling
 * @owner nTooling
 */

import fs from 'node:fs';
import tooling from '../defaultToolingCommandService.js';
import path from 'node:path';
import routerProperties from '../../../../nRouter/config/properties.js';
import httpHardening from '../../../../nRouter/src/service/defaultHttpHardeningService.js';
import configurationBindings from '../../../../nConfig/src/service/defaultConfigurationBindingService.js';
import configuration from '../../../../nConfig/src/service/DefaultFrameworkInitializerService.js';
import { readProjectManifest, resolveProjectCode, resolveTemplate, selectEnvironmentConfiguration } from './defaultProjectContainerConfigurationService.mjs';

/** Projects startup/readiness coordinates from actual backend server configuration. @param {string} projectRoot Project root. @param {string} environmentCode Optional selected environment. @returns {Object} Derived tooling inputs, not another persisted configuration authority. */
export function readProjectEnvironmentConfiguration(projectRoot, environmentCode = '') {
  const manifest = readProjectManifest(projectRoot);
  const inheritedProperties = { tooling: { acceptance: configurationBindings.merge(tooling.loadFrameworkToolingDefaults('acceptance'), manifest.acceptance || {}) } };
  const selected = selectEnvironmentConfiguration(projectRoot, environmentCode, false, inheritedProperties);
  const environment = selected.code;
  const properties = selected.properties;
  const environmentRoot = path.join(projectRoot, 'envs', environment);
  const backends = fs.readdirSync(environmentRoot, { withFileTypes: true }).filter(entry => entry.isDirectory()).flatMap(entry => {
    const packageFile = path.join(environmentRoot, entry.name, 'package.json');
    if (!fs.existsSync(packageFile)) return [];
    const metadata = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
    if (metadata.nodics?.kind !== 'server' || metadata.nodics.runtimeModule !== true || metadata.nodics.retired === true) return [];
    const runtime = configuration.readDeploymentConfiguration({ projectRoot, environmentCode: environment, serverCode: entry.name });
    const launch = runtime.tooling?.runtime || {};
    if (launch.enabled === false) return [];
    const endpoint = runtime.servers?.default?.endpoint;
    if (!endpoint || !Number.isSafeInteger(endpoint.httpPort) || endpoint.httpPort < 1 || endpoint.httpPort > 65535)
      throw new Error('Runtime requires a valid configured HTTP port: ' + entry.name);
    return [{ code: entry.name, moduleIndex: metadata.index, label: metadata.nodics.displayName || metadata.name,
      ...(launch.script ? {} : { command: 'nodics', args: ['start', '--environment=' + environment, '--server=' + entry.name] }),
      ...launch, port: endpoint.httpPort, host: endpoint.httpHost || 'localhost', server: entry.name,
      role: typeof runtime.runtimeRole === 'string' ? runtime.runtimeRole : runtime.runtimeRole?.code,
      initializationProfiles: Object.entries(runtime.data?.dataReleases?.initializationProfiles || {})
        .filter(([, profile]) => profile && typeof profile === 'object' && !Array.isArray(profile) && profile.enabled !== false)
        .map(([code, profile]) => ({ code, template: profile.template })) }];
  });
  const moduleOrder = configuration.sortModules(backends.map(runtime => runtime.moduleIndex));
  backends.sort((left, right) => (left.order ?? moduleOrder.indexOf(left.moduleIndex)) - (right.order ?? moduleOrder.indexOf(right.moduleIndex)));
  const topology = properties.tooling?.topology || {};
  const stateDirectory = topology.stateDirectory || `envs/${environment}/generated/local-topology`;
  return {
    projectCode: resolveProjectCode(projectRoot, manifest),
    environment,
    cors: configurationBindings.merge(routerProperties.httpHardening.cors, properties.httpHardening?.cors || {}),
    composition: properties.activeModules?.compositions || {},
    topology: { ...topology, stateDirectory, groups: { backends } },
    stateDirectory: path.resolve(projectRoot, resolveTemplate(projectRoot, stateDirectory)),
    acceptance: properties.tooling?.acceptance || {},
  };
}

/** Constructs an HTTP origin from one explicitly selected, configured runtime. @param {Object} configuration Resolved deployment projection. @param {string|Object} code Declared backend code or semantic role selector. @param {string} group Topology group. @returns {string} Validated origin; missing or ambiguous selections reject. */
export function projectEndpointUrl(configuration, code, group = 'backends') {
  if (group !== 'backends') throw new Error('Select a valid endpoint group');
  const { host = 'localhost', protocol = 'http', port } = projectRuntime(configuration, code);
  if (!['http', 'https'].includes(protocol) || typeof host !== 'string' || !host || ['0.0.0.0', '::', '[::]'].includes(host) || /[\s\\/@?#]/.test(host) ||
      !Number.isSafeInteger(port) || port < 1 || port > 65535) throw new Error('Invalid configured endpoint: ' + code);
  const hostname = host.includes(':') && !host.startsWith('[') ? '[' + host + ']' : host;
  const url = new URL(protocol + '://' + hostname + ':' + port);
  return url.origin;
}

/** Resolves an explicitly selected application composition using nConfig. @param {Object} compositionConfig Declared application composition. @param {string} value Optional selection override. @returns {Object} Selected domains. */
export function resolveDomainComposition(compositionConfig = {}, value = '') {
  return configurationBindings.resolveDomainComposition(compositionConfig, value, process.env);
}

/** Reads application composition from the same project/environment properties used by runtime activation. @param {string} projectRoot Project root. @param {string} environmentCode Selected environment. @param {string} compositionCode Explicit composition. @returns {Object} Selected composition. */
export function readProjectEnvironmentComposition(projectRoot, environmentCode = '', compositionCode = '') {
  const { properties } = selectEnvironmentConfiguration(projectRoot, environmentCode);
  const compositions = properties.activeModules?.compositions || {};
  const selected = compositionCode || (Object.keys(compositions).length === 1 ? Object.keys(compositions)[0] : '');
  if (!selected || !Object.prototype.hasOwnProperty.call(compositions, selected)) throw new Error('Select an available application composition code');
  return resolveDomainComposition(compositions[selected]);
}

/** Selects an explicit backend CORS policy origin for API acceptance without contacting or starting a frontend. @param {Object} configuration Resolved environment projection. @param {string} code Security endpoint identity. @returns {string} Configured allowed origin. */
export function projectCorsOrigin(configuration, code) {
  const cors = configuration.cors || {};
  const endpoint = cors.originEndpoints?.[code];
  if (cors.enabled !== true || !endpoint || cors.originEndpointOverrides?.[code] === false) throw new Error('Select an enabled CORS policy origin: ' + code);
  const origin = httpHardening.createCorsOrigin(endpoint, cors.originDefaults || {});
  if ((cors.deniedOrigins || []).includes(origin)) throw new Error('CORS policy denies origin: ' + code);
  return origin;
}

/** Selects one declared backend by code/server or semantic role. Missing/ambiguous matches fail; discovery never activates capabilities. @param {Object} configuration Resolved deployment. @param {string|Object} selection Explicit runtime selection. @returns {Object} Existing topology descriptor. */
export function projectRuntime(configuration, selection) {
  const selector = typeof selection === 'string' ? { server: selection } : selection;
  if (!selector || typeof selector !== 'object' || Array.isArray(selector) ||
      Object.keys(selector).length !== 1 || !['server', 'role'].some(key => typeof selector[key] === 'string' && selector[key]))
    throw new Error('Select one configured endpoint by server or role');
  const matches = (configuration.topology?.groups?.backends || []).filter(runtime => runtime.enabled !== false &&
    (selector.role ? runtime.role === selector.role : runtime.code === selector.server || runtime.server === selector.server));
  if (matches.length !== 1) throw new Error('Select one configured endpoint: ' + JSON.stringify(selector));
  return matches[0];
}

/** Selects a declared enabled initialization profile, using an explicit code or a unique template match. @param {Object} runtime Selected topology descriptor. @param {string} code Optional explicit profile code. @param {string} template Optional framework template. @returns {string} Declared profile identity. */
export function projectInitializationProfile(runtime, code = '', template = '') {
  const matches = (runtime.initializationProfiles || []).filter(profile => code ? profile.code === code : !template || profile.template === template);
  if (matches.length !== 1) throw new Error('Select one enabled initialization profile for ' + runtime.server);
  return matches[0].code;
}
