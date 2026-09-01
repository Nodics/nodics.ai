#!/usr/bin/env node
/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTooling/service/project/defaultProjectEnvironmentProfileService
 * @description Resolves project environment profile facts from environment-owned files.
 * @layer tooling
 * @owner nTooling
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  conventionalEnvironmentName,
  readProjectManifest,
  resolveProjectCode,
  resolveTemplate,
} from './defaultProjectContainerProfileService.mjs';

/**
 * Resolves candidate environment profile paths.
 * @param {string} projectRoot Project root.
 * @param {string} environmentCode Explicit environment code.
 * @param {Object} manifest Project manifest.
 * @returns {string[]} Candidate files.
 */
export function environmentProfileFileCandidates(projectRoot, environmentCode, manifest) {
  const candidates = [
    environmentCode && path.join(projectRoot, 'envs', environmentCode, 'nodics.environment.json'),
    path.join(projectRoot, 'envs', conventionalEnvironmentName(manifest, 'local', projectRoot), 'nodics.environment.json'),
    path.join(projectRoot, 'envs', 'local', 'nodics.environment.json'),
  ].filter(Boolean);
  return [...new Set(candidates)];
}

/**
 * Reads the active project environment profile.
 * @param {string} projectRoot Project root.
 * @param {string} environmentCode Explicit environment code.
 * @returns {Object} Resolved environment profile.
 */
export function readProjectEnvironmentProfile(projectRoot, environmentCode = '') {
  const manifest = readProjectManifest(projectRoot);
  const projectCode = resolveProjectCode(projectRoot, manifest);
  const profileFile = environmentProfileFileCandidates(projectRoot, environmentCode, manifest)
    .find(candidate => fs.existsSync(candidate));
  if (!profileFile) {
    throw new Error(`Unknown project environment profile: ${environmentCode || conventionalEnvironmentName(manifest, 'local', projectRoot)}`);
  }
  const profile = JSON.parse(fs.readFileSync(profileFile, 'utf8'));
  const environment = profile.environment || environmentCode || conventionalEnvironmentName(manifest, 'local', projectRoot);
  const stateDirectory = profile.topology?.stateDirectory ||
    `envs/${environment}/generated/local-topology`;
  return {
    ...profile,
    projectCode,
    profilePath: profileFile,
    environment,
    topology: {
      ...(profile.topology || {}),
      stateDirectory,
    },
    stateDirectory: path.resolve(projectRoot, resolveTemplate(projectRoot, stateDirectory)),
    acceptance: {
      ...(profile.acceptance || {}),
    },
  };
}

/**
 * Resolves an environment-owned domain composition descriptor.
 * @param {Object} compositionConfig Environment profile composition entry.
 * @param {string} value Comma-separated domain list, `all`, `commerce`, or `none`.
 * @returns {Object} Resolved domain composition descriptor.
 */
export function resolveDomainComposition(compositionConfig = {}, value = '') {
  const domainEntries = compositionConfig.domains || [];
  const supported = Object.fromEntries(domainEntries.map(domain => [domain.code, domain]));
  const selection = value || process.env.NODICS_AGORA_DOMAINS || compositionConfig.selection || 'all';
  const requested = selection === 'all'
    ? domainEntries.map(domain => domain.code)
    : selection === 'commerce' || selection === 'none'
      ? []
      : selection.split(',').map(item => item.trim()).filter(Boolean);
  const domains = [...new Set(requested)];
  const unknown = domains.filter(domain => !supported[domain]);
  if (unknown.length) throw new Error(`Unsupported domain composition selection: ${unknown.join(',')}`);
  const contributorDomains = new Set(domains);
  domains.forEach(domain => (supported[domain].impliedProductSearchContributorDomains || []).forEach(item => contributorDomains.add(item)));
  return Object.freeze({
    domains: Object.freeze(domains),
    frameworkGroups: Object.freeze(domains.map(domain => supported[domain].frameworkGroup).filter(Boolean)),
    sharedModules: Object.freeze((compositionConfig.sharedModules || [])
      .filter(rule => domains.length >= Number(rule.minSelectedDomains || 0))
      .map(rule => rule.module)
      .filter(Boolean)),
    projectPacks: Object.freeze(domains.map(domain => supported[domain].projectPack).filter(Boolean)),
    productSearchContributors: Object.freeze(Object.fromEntries([...contributorDomains]
      .sort()
      .map(domain => [domain, supported[domain]?.productSearchContributor])
      .filter(([, contributor]) => contributor)))
  });
}

/**
 * Reads and resolves a named environment composition.
 * @param {string} projectRoot Project root.
 * @param {string} environmentCode Environment code.
 * @param {string} compositionCode Composition entry code.
 * @returns {Object} Resolved composition.
 */
export function readProjectEnvironmentComposition(projectRoot, environmentCode = '', compositionCode = 'agora') {
  const profile = readProjectEnvironmentProfile(projectRoot, environmentCode);
  return resolveDomainComposition((profile.composition || {})[compositionCode] || {});
}
