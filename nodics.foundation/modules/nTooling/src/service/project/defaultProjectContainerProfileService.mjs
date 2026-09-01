#!/usr/bin/env node
/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTooling/service/project/defaultProjectContainerProfileService
 * @description Resolves project container-environment profiles from environment-owned files.
 * @layer tooling
 * @owner nTooling
 */

import fs from 'node:fs';
import path from 'node:path';

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

/**
 * Builds the conventional environment name for a project profile code.
 * @param {Object} manifest Project manifest.
 * @param {string} profileCode Container profile code.
 * @param {string} [projectRoot] Project root.
 * @returns {string} Conventional environment name.
 */
export function conventionalEnvironmentName(manifest, profileCode, projectRoot = '') {
  const projectCode = projectRoot ? resolveProjectCode(projectRoot, manifest) : 'project';
  const projectSegment = String(projectCode).split('.').filter(Boolean).pop() || 'project';
  return projectSegment + profileCode.slice(0, 1).toUpperCase() + profileCode.slice(1);
}

/**
 * Resolves possible environment profile files for the given profile.
 * @param {string} projectRoot Project root.
 * @param {string} profileCode Container profile code.
 * @param {Object} manifest Project manifest.
 * @returns {string[]} Candidate profile files.
 */
export function profileFileCandidates(projectRoot, profileCode, manifest) {
  const candidates = [
    path.join(projectRoot, 'envs', conventionalEnvironmentName(manifest, profileCode, projectRoot), 'nodics.environment.json'),
    path.join(projectRoot, 'envs', profileCode, 'nodics.environment.json'),
  ].filter(Boolean);
  return [...new Set(candidates)];
}

/**
 * Reads an environment-owned container profile.
 * @param {string} projectRoot Project root.
 * @param {string} profileCode Container profile code.
 * @returns {Object} Resolved container profile.
 */
export function readContainerEnvironmentProfile(projectRoot, profileCode) {
  const manifest = readProjectManifest(projectRoot);
  const profileFile = profileFileCandidates(projectRoot, profileCode, manifest).find(candidate => fs.existsSync(candidate));
  const profile = profileFile ? JSON.parse(fs.readFileSync(profileFile, 'utf8')) : undefined;
  if (!profile) throw new Error(`Unknown container environment profile: ${profileCode}`);
  if (profile.profileCode && profile.profileCode !== profileCode) {
    throw new Error(`Container environment profile mismatch: expected ${profileCode}, found ${profile.profileCode}`);
  }
  const environment = profile.environment || conventionalEnvironmentName(manifest, profileCode, projectRoot);
  const composeFile = profile.composeFile || `envs/${environment}/docker/compose.yaml`;
  const generatedRoot = path.resolve(projectRoot, resolveTemplate(projectRoot, profile.generatedDirectory || `envs/${environment}/generated`));
  return {
    ...profile,
    code: profileCode,
    profilePath: profileFile,
    environment,
    composeFile,
    composePath: path.resolve(projectRoot, resolveTemplate(projectRoot, composeFile)),
    generatedRoot,
    environmentPath: path.join(generatedRoot, profile.environmentFile || 'docker.env'),
  };
}
