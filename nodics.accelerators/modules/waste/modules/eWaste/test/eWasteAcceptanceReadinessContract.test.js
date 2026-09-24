/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module eWaste/test/eWasteAcceptanceReadinessContract @description Proves Circa/eWaste channel, AI, media and accept/reject readiness remains owner-owned and reports masked operator guidance. @owner eWaste @layer test */
const { test, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const service = require("../src/service/defaultEWasteAcceptanceReadinessService");

let configs;

function configuredServices() {
  return {
    DefaultEWasteChannelAuthenticationService: {},
    DefaultEWasteSubmissionPreparationService: {},
    DefaultWasteMetadataAnalysisService: {},
    DefaultWasteItemDescriptorService: {},
    DefaultWastePersistenceService: {},
    DefaultModuleService: {},
    DefaultEWasteExperienceService: {},
    DefaultWasteVerificationOperationService: {},
    DefaultEWasteRewardAssessmentOperationService: {},
    DefaultWasteImpactAssessmentService: {},
    DefaultEWasteOutcomeCommunicationService: {},
  };
}

beforeEach(() => {
  configs = {
    eWaste: {
      channelAuthentication: {
        enabled: true,
        channels: {
          TELEGRAM: { enabled: true, applicationCode: "circa.ewaste", seamlessSignIn: true },
        },
      },
      acceptanceReadiness: {
        draftMedia: {
          retentionStatus: "CUSTOMER_DRAFT_UNTIL_SUBMIT_OR_REPLACE",
          rejectedCleanupStatus: "OWNER_POLICY_REVIEW_REQUIRED",
          acceptedEvidenceRetentionStatus: "RETAIN_WITH_APPROVED_ASSET_EVIDENCE",
        },
        scenarios: { accept: { enabled: true }, reject: { enabled: true } },
      },
    },
    profileExternalIdentity: {
      enabled: true,
      applications: {
        "circa.ewaste": {
          enabled: true,
          provider: "TELEGRAM",
          credentialReference: "telegram.bot.circa",
        },
      },
    },
    runtimeConfiguration: {
      credentials: {
        "telegram.bot.circa": { value: "1234567890:telegram-secret" },
      },
    },
    wasteSubmission: {
      requireEnvironmentalAssessment: true,
      metadataSuggestion: {
        manualReviewFallback: true,
        fallbackItemTypeCode: "UNKNOWN_ELECTRONIC_ITEM",
        allowedFamilyCodes: ["ELECTRONICS", "BATTERY"],
      },
    },
    wasteImpact: {
      calculation: {
        openAiEnvironmental: { adapter: "openai", profile: "eWasteEnvironmentalAssessment" },
      },
    },
    copilot: {
      providers: {
        profiles: { eWasteEnvironmentalAssessment: { structuredOutput: true } },
        adapters: {
          openai: {
            enabled: true,
            credential: { secretRef: "env:OPENAI_API_KEY" },
          },
        },
      },
    },
  };
  process.env.OPENAI_API_KEY = "test-openai-key";
  global.CONFIG = { get: key => configs[key] };
  global.SERVICE = configuredServices();
});

test("reports Circa/eWaste readiness without exposing configured secrets", () => {
  const report = service.readiness();
  assert.equal(report.contractVersion, 1);
  assert.equal(report.businessStatus, "READY");
  assert.equal(report.summary.telegramChannelConfigured, true);
  assert.equal(report.summary.customerAccountLinkReady, true);
  assert.equal(report.summary.imageAnalysisConfigured, true);
  assert.equal(report.summary.manualReviewFallbackReady, true);
  assert.equal(report.summary.acceptScenarioReady, true);
  assert.equal(report.summary.rejectScenarioReady, true);
  assert.equal(report.blockers.length, 0);
  assert(!JSON.stringify(report).includes("telegram-secret"));
  assert(!JSON.stringify(report).includes("test-openai-key"));
});

test("surfaces Telegram/Profile mapping gaps as owner readiness blockers", () => {
  configs.profileExternalIdentity.applications = {};
  delete configs.runtimeConfiguration.credentials["telegram.bot.circa"];
  const report = service.readiness();
  assert.equal(report.businessStatus, "NEEDS_ATTENTION");
  assert(report.blockers.some(blocker => blocker.code === "PROFILE_EXTERNAL_APPLICATION_MISSING"));
  assert(report.blockers.some(blocker => blocker.code === "TELEGRAM_BOT_CREDENTIAL_MISSING"));
  assert(report.blockers.every(blocker => blocker.ownerType === "EWASTE_ACCEPTANCE"));
});

test("reports image/manual-fallback and scenario dependencies without calling providers", () => {
  delete process.env.OPENAI_API_KEY;
  configs.wasteSubmission.metadataSuggestion.manualReviewFallback = false;
  configs.copilot.providers.adapters.openai.enabled = false;
  delete global.SERVICE.DefaultWasteVerificationOperationService;
  const report = service.readiness();
  assert.equal(report.businessStatus, "BLOCKED");
  assert(report.blockers.some(blocker => blocker.code === "EWASTE_IMAGE_MANUAL_FALLBACK_MISSING"));
  assert(report.blockers.some(blocker => blocker.code === "EWASTE_OPENAI_ADAPTER_DISABLED"));
  assert(report.blockers.some(blocker => blocker.code === "EWASTE_ACCEPT_REJECT_SERVICE_UNAVAILABLE"
    && blocker.severity === "BLOCKED"));
});
