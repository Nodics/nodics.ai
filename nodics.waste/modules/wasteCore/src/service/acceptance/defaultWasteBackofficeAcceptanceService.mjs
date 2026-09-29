#!/usr/bin/env node
/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */


import { pathToFileURL } from 'node:url';
import { createAcceptanceContext } from '../../../../../../nodics.foundation/modules/nTooling/src/service/project/defaultProjectAcceptanceService.mjs';
import { projectRuntime } from '../../../../../../nodics.foundation/modules/nTooling/src/service/project/defaultProjectEnvironmentConfigurationService.mjs';
/** @module wasteCore/service/acceptance/defaultWasteBackofficeAcceptanceService @description Validates authorized Waste runtime discovery without changing grants or registration. @layer tooling @owner wasteCore */
const functionalModule = 'nodics.waste';
const providerModule = 'wasteCore';
const expectedCapabilityId = 'waste-management';
const expectedGroupId = 'sustainability-operations';
const expectedNavigationIds = [
  "waste-management",
  "waste-taxonomy",
  "waste-families",
  "waste-categories",
  "waste-materials",
  "waste-evidence-policies",
  "waste-collections",
  "waste-acceptance-rules",
  "waste-submissions",
  "waste-verification",
  "waste-receipts",
  "waste-impact",
  "waste-assets",
  "waste-asset-types",
  "waste-asset-creation-policies",
  "waste-asset-ownership-events",
  "waste-asset-marketplace-projections",
  "waste-asset-transfer-policies",
  "waste-marketplace-policies",
  "waste-reward-settlement-policies",
  "waste-carbon-settlement-policies",
  "waste-coupon-redemption-policies",
  "waste-movement",
  "waste-compliance",
];


export function validateWasteRegistration(registration, expectedObservedServer) {
  if (registration.functionalModule !== functionalModule) {
    throw new Error(`Expected ${functionalModule} registration, received ${registration.functionalModule}`);
  }
  if (registration.runtimeState !== "ACTIVE") {
    throw new Error(`${functionalModule} must be active before BackOffice discovery`);
  }
  if (!registration.observedServers.includes(expectedObservedServer)) {
    throw new Error(`${functionalModule} must be observed through ${expectedObservedServer}`);
  }
  [providerModule, "wasteApi", "wasteMaterial", "wasteCollection", "wasteSubmission"].forEach(moduleName => {
    if (!registration.technicalModules.includes(moduleName)) {
      throw new Error(`${functionalModule} registration must include ${moduleName}`);
    }
  });
}

function requireNavigation(navigation, id) {
  const item = navigation.find(entry => entry.id === id);
  if (!item) throw new Error(`Waste BackOffice navigation is missing ${id}`);
  return item;
}

export function validateWasteBootstrap(bootstrap) {
  const metadata = bootstrap.catalogue?.[providerModule];
  if (!metadata) throw new Error(`${providerModule} was not exposed in the authorized BackOffice bootstrap catalogue`);
  if (metadata.capabilityId !== expectedCapabilityId) {
    throw new Error(`Expected capability ${expectedCapabilityId}, received ${metadata.capabilityId}`);
  }
  if (!metadata.requiredPermissions?.includes("waste.backoffice.view")) {
    throw new Error("Waste BackOffice metadata must require waste.backoffice.view");
  }
  if (!Number.isInteger(metadata.activeModuleLeases) || metadata.activeModuleLeases < 1) {
    throw new Error("Waste BackOffice metadata must come from at least one active runtime lease");
  }
  expectedNavigationIds.forEach(id => requireNavigation(metadata.navigation || [], id));
  const root = requireNavigation(metadata.navigation || [], "waste-management");
  if (root.group?.id !== expectedGroupId) throw new Error(`Waste root navigation must be grouped under ${expectedGroupId}`);
  if (root.workbenchTarget?.moduleName !== providerModule || root.workbenchTarget?.schemaName !== "wasteLifecyclePolicy") {
    throw new Error("Waste root navigation must point at the generic waste lifecycle policy workbench");
  }
  const submissions = requireNavigation(metadata.navigation || [], "waste-submissions");
  if (submissions.workbenchTarget?.moduleName !== "wasteSubmission" ||
      submissions.workbenchTarget?.schemaName !== "wasteSubmission") {
    throw new Error("Waste submissions navigation must use the generic Waste submission schema workbench");
  }
  const assets = requireNavigation(metadata.navigation || [], "waste-assets");
  if (assets.workbenchTarget?.moduleName !== providerModule || assets.workbenchTarget?.schemaName !== "wasteAsset") {
    throw new Error("Waste assets navigation must use the generic Waste asset schema workbench");
  }
  const assetCreationPolicies = requireNavigation(metadata.navigation || [], "waste-asset-creation-policies");
  const marketplaceProjections = requireNavigation(metadata.navigation || [], "waste-asset-marketplace-projections");
  const transferPolicies = requireNavigation(metadata.navigation || [], "waste-asset-transfer-policies");
  const couponPolicies = requireNavigation(metadata.navigation || [], "waste-coupon-redemption-policies");
  if (assetCreationPolicies.workbenchTarget?.schemaName !== "wasteAssetCreationPolicy" ||
      marketplaceProjections.workbenchTarget?.schemaName !== "wasteAssetMarketplaceProjection" ||
      transferPolicies.workbenchTarget?.schemaName !== "wasteAssetTransferPolicy" ||
      couponPolicies.workbenchTarget?.schemaName !== "wasteCouponRedemptionSettlementPolicy") {
    throw new Error("Waste asset policy navigation must expose schema-driven creation, projection, transfer, and coupon settlement workbenches");
  }
  const movement = requireNavigation(metadata.navigation || [], "waste-movement");
  const compliance = requireNavigation(metadata.navigation || [], "waste-compliance");
  if (movement.featureState !== "PREVIEW" || compliance.featureState !== "PREVIEW") {
    throw new Error("Waste movement and compliance must remain preview navigation entries");
  }
  (metadata.navigation || []).forEach(item => {
    if (!item.requiredPermissions?.includes("waste.backoffice.view")) {
      throw new Error(`${item.id} must be filtered by waste.backoffice.view`);
    }
    if (!String(item.route || "").startsWith("/waste")) {
      throw new Error(`${item.id} must stay inside the Waste route namespace`);
    }
  });

  const effectiveGroup = (bootstrap.effectiveNavigationComposition?.groups || [])
    .find(group => group.id === expectedGroupId);
  if (!effectiveGroup) throw new Error(`Effective navigation must expose ${expectedGroupId}`);
  const effectiveRoot = (bootstrap.effectiveNavigationComposition?.navigation || [])
    .find(item => item.moduleName === providerModule && item.id === "waste-management");
  if (!effectiveRoot) throw new Error("Effective navigation must include the Waste Management workspace");
  if (effectiveRoot.routeOwner?.ownerType !== "WORKBENCH") {
    throw new Error("Waste Management workspace must resolve through the generic schema workbench");
  }
  if (bootstrap.modules?.[providerModule]?.[0]?.endpoint !== undefined) {
    throw new Error("Schema-backed Waste metadata must not invent a direct module endpoint for wasteCore");
  }
  return bootstrap;
}


/** Runs canonical discovery assertions against already active, authorized runtimes. */
export async function runWasteBackofficeAcceptance({ request, authenticate, project, observedServer } = {}) {
  if (!project || !observedServer) throw new Error('Project and observed Waste server are required');
  const headers = await authenticate();
  const registration = await request('PLATFORM', '/nodics/backoffice/v0/runtime/modules/registrations/nodics.waste?project=' + encodeURIComponent(project), { headers });
  if (registration.registrationState !== 'REGISTERED' || registration.enabled !== true)
    throw new Error('Waste must be registered and enabled through normal governed setup');
  validateWasteRegistration(registration, observedServer);
  const bootstrap = await request('PLATFORM', '/nodics/backoffice/v0/bootstrap', {
    headers: { ...headers, 'x-nodics-client-contract-version': '1' },
  });
  validateWasteBootstrap(bootstrap);
  return { state: 'PASSED', evidence: 'AUTHORIZED_BACKOFFICE_DISCOVERY', functionalModule, observedServer };
}
/** CLI help does not load configuration, authenticate, start runtimes or mutate state. */
export async function main(args = process.argv.slice(2), options = {}) {
  if (args.includes('--help')) return { usage: 'acceptance:waste-backoffice: read-only discovery; requires running PLATFORM/WASTE and authorized employee credentials' };
  if (args.length) throw new Error('Unknown Waste discovery option: ' + args.join(' '));
  const context = await createAcceptanceContext(options);
  const runtime = projectRuntime(context.configuration, { role: 'WASTE' });
  return runWasteBackofficeAcceptance({ ...context, project: context.configuration.projectCode,
    observedServer: [context.configuration.environment, runtime.server, 'default'].join(':') });
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  main().then(result => console.log(JSON.stringify(result, null, 2))).catch(error => { console.error(error.message); process.exitCode = 1; });
