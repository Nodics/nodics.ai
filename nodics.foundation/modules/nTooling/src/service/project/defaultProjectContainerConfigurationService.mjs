#!/usr/bin/env node
/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTooling/service/project/defaultProjectContainerConfigurationService
 * @description Resolves project container operation inputs from existing environment configuration.
 * @layer tooling
 * @owner nTooling
 */

import fs from 'node:fs';
import path from 'node:path';
import configuration from '../../../../nConfig/src/service/DefaultFrameworkInitializerService.js';

/**
 * Resolves project-relative template values used by environment profiles.
 * @param {string} projectRoot Project root.
 * @param {string} value Template value.
 * @returns {string} Resolved value.
 */
export function resolveTemplate(projectRoot, value) {
  const workspaceRoot = path.resolve(projectRoot, '..');
  return String(value || '')
    .replaceAll('{projectRoot}', projectRoot)
    .replaceAll('{workspaceRoot}', workspaceRoot);
}

/**
 * Reads the project manifest when present.
 * @param {string} projectRoot Project root.
 * @returns {Object} Parsed manifest.
 */
export function readProjectManifest(projectRoot) {
  const manifestPath = path.join(projectRoot, 'nodics.project.json');
  if (!fs.existsSync(manifestPath)) return {};
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  validateProjectManifest(manifest);
  return manifest;
}

/**
 * Rejects project descriptor facts that belong to package or environment owners.
 * @param {Object} manifest Parsed project descriptor.
 * @returns {void}
 */
export function validateProjectManifest(manifest = {}) {
  const keys = Object.keys(manifest);
  if (keys.length === 0) {
    throw new Error('Unnecessary nodics.project.json; remove the file unless project-owned tooling or acceptance overrides are required');
  }
  if (Object.prototype.hasOwnProperty.call(manifest, 'contractVersion')) {
    throw new Error('nodics.project.json must not declare contractVersion');
  }
  if (Object.prototype.hasOwnProperty.call(manifest, 'projectCode')) {
    throw new Error('nodics.project.json must not declare projectCode; use package.json.name');
  }
  const allowedTopLevel = ['acceptance', 'tooling'];
  keys.forEach(key => {
    if (!allowedTopLevel.includes(key)) {
      throw new Error(`Unsupported nodics.project.json property \`${key}\`. Allowed properties: acceptance, tooling`);
    }
  });
}

/**
 * Reads the project package metadata.
 * @param {string} projectRoot Project root.
 * @returns {Object} Parsed package metadata.
 */
export function readProjectPackage(projectRoot) {
  const packagePath = path.join(projectRoot, 'package.json');
  if (!fs.existsSync(packagePath)) throw new Error(`Missing package.json in project root: ${projectRoot}`);
  return JSON.parse(fs.readFileSync(packagePath, 'utf8'));
}

/**
 * Resolves canonical project identity from package.json.name.
 * @param {string} projectRoot Project root.
 * @param {Object} manifest Project manifest.
 * @returns {string} Canonical project code.
 */
export function resolveProjectCode(projectRoot, manifest = {}) {
  const projectCode = readProjectPackage(projectRoot).name;
  if (!projectCode || !/^[a-zA-Z][a-zA-Z0-9._-]*$/.test(projectCode)) {
    throw new Error('package.json requires a stable Nodics project name');
  }
  if (Object.prototype.hasOwnProperty.call(manifest, 'contractVersion')) {
    throw new Error('nodics.project.json must not declare contractVersion');
  }
  if (Object.prototype.hasOwnProperty.call(manifest, 'projectCode')) {
    throw new Error('nodics.project.json must not declare projectCode; use package.json.name');
  }
  return projectCode;
}

/** Selects declared environment configuration by exact identity or explicit policy, never a filename convention. @param {string} projectRoot Project root. @param {string} code Environment or container code. @param {boolean} container Container selection. @returns {Object} Selected identity and resolved properties. */
export function selectEnvironmentConfiguration(projectRoot, code = '', container = false, inheritedProperties = {}) {
  const environments = configuration.discoverDeploymentEnvironments(projectRoot);
  const explicit = environments.find(item => item.code === code);
  const read = item => ({ code: item.code, properties: configuration.readDeploymentConfiguration({ projectRoot, environmentCode: item.code, inheritedProperties }) });
  if (explicit) return read(explicit);
  const candidates = environments.map(read).filter(item => container
    ? item.properties.tooling?.container?.code === code
    : !code && item.properties.environment?.class === 'LOCAL');
  if (candidates.length === 1) return candidates[0];
  if (!code && !container && environments.length === 1) return read(environments[0]);
  throw new Error('Select an available environment: ' + environments.map(item => item.code).join(', '));
}

/** Reads container inputs from the existing environment contribution; no environment descriptor is loaded. @param {string} projectRoot Project root. @param {string} profileCode Explicit container/environment selector. @returns {Object} Derived operation inputs. */
export function readContainerEnvironmentConfiguration(projectRoot, profileCode) {
  readProjectManifest(projectRoot);
  const selected = selectEnvironmentConfiguration(projectRoot, profileCode, true);
  const environment = selected.code;
  const profile = selected.properties.tooling?.container;
  if (!profile) throw new Error('Selected environment does not configure container tooling');
  const composeFile = profile.composeFile || `envs/${environment}/docker/compose.yaml`;
  const generatedRoot = path.resolve(projectRoot, resolveTemplate(projectRoot, profile.generatedDirectory || `envs/${environment}/generated`));
  return {
    ...profile,
    composition: selected.properties.activeModules?.compositions || {},
    acceptance: selected.properties.tooling?.acceptance || {},
    qualificationClass: selected.properties.environment?.class,
    code: profile.code || profileCode,
    environment,
    composeFile,
    composePath: path.resolve(projectRoot, resolveTemplate(projectRoot, composeFile)),
    generatedRoot,
    environmentPath: path.join(generatedRoot, profile.environmentFile || 'docker.env'),
  };
}
