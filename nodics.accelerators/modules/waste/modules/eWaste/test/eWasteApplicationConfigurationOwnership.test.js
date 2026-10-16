/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module eWaste/test/eWasteApplicationConfigurationOwnership @description Proves neutral backend metadata remains owner-defined while customer identity and optional composition stay explicit. @layer test @owner eWaste */
const assert = require("node:assert/strict");
const test = require("node:test");
const binding = require("../../../../../../nodics.foundation/modules/nConfig/src/service/defaultConfigurationBindingService");
const properties = require("../config/properties");
const service = require("../src/service/defaultEWasteJourneyContractService");

test("eWaste owns neutral metadata profiles and evidence protocol without activation", () => {
  assert.deepEqual(properties.copilot.providers.profiles.eWastePhotoMetadata, {
    maximumOutputTokens: 2400,
    structuredOutput: true,
    imageDetail: "high",
  });
  assert.equal(
    properties.wasteSubmission.metadataSuggestion.profile,
    "eWastePhotoMetadata",
  );
  assert.equal(properties.eWaste.conversation.profile, "customerGuidance");
  const evidence = properties.eWaste.marketplace.digitalOwnership;
  assert.equal(evidence.enabled, false);
  assert.equal(evidence.qualified, false);
  assert.deepEqual(evidence.allowedServicePrincipals, []);
  assert.equal(evidence.customerEvidenceApiName, "/internal/customer-evidence");
  assert.deepEqual(evidence.targets, {
    commerce: "COMMERCE",
    loyalty: "LOYALTY",
    profile: "PLATFORM",
  });
  const changed = binding.merge(properties, {
    eWaste: {
      marketplace: {
        digitalOwnership: {
          customerEvidenceApiName: "/custom/customer-evidence",
          targets: { profile: "CUSTOM_PROFILE" },
        },
      },
    },
  });
  assert.equal(
    changed.eWaste.marketplace.digitalOwnership.targets.profile,
    "CUSTOM_PROFILE",
  );
  assert.equal(changed.eWaste.marketplace.digitalOwnership.enabled, false);
});

test("neutral application metadata does not choose customer branding or extra scenario modules", () => {
  const base = properties.eWaste.application;
  assert.deepEqual(base, {
    frameworkModuleName: "nodics.waste",
    backendModuleName: "eWaste",
  });
  const standard = service.journeyContract({ application: base });
  assert.equal(standard.moduleName, "eWaste");
  assert.equal(standard.frameworkModuleName, "nodics.waste");
  assert.equal(standard.projectModuleName, undefined);
  assert.equal(standard.frontendModuleName, undefined);
  assert.deepEqual(standard.requiredScenarioModules, ["eWaste"]);
  for (const code of ["CATALOGUE_RECOVERY", "COMMUNITY_REUSE"]) {
    const customer = {
      code,
      displayName: code,
      projectModuleName: "example." + code.toLowerCase(),
      frontendModuleName: "example.experience",
      requiredScenarioModules: {
        $config: "replace",
        value: ["eWaste", "wasteRecycling"],
      },
    };
    const merged = binding.merge(properties, {
      eWaste: { application: customer },
    });
    const actual = service.journeyContract({
      application: merged.eWaste.application,
    });
    const previous = service.journeyContract({
      application: {
        ...merged.eWaste.application,
        frameworkModuleName: "nodics.waste",
        backendModuleName: "eWaste",
      },
    });
    assert.equal(actual.code, previous.code);
    assert.equal(actual.moduleName, previous.moduleName);
    assert.equal(actual.frameworkModuleName, previous.frameworkModuleName);
    assert.equal(actual.projectModuleName, customer.projectModuleName);
    assert.deepEqual(actual.requiredScenarioModules, [
      "eWaste",
      "wasteRecycling",
    ]);
    const override = binding.merge(merged, {
      eWaste: { application: { backendModuleName: "customEWaste" } },
    });
    assert.equal(
      service.journeyContract({ application: override.eWaste.application })
        .moduleName,
      "customEWaste",
    );
  }
});
