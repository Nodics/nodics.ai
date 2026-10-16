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
    DefaultExternalIdentityService: {},
    DefaultTelegramIdentityProviderService: require("../../../../../../nodics.platform/modules/profile/src/service/authentication/defaultTelegramIdentityProviderService"),
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
      providers: { TELEGRAM: { service: "DefaultTelegramIdentityProviderService" } },
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
  assert.equal(report.businessStatus, "NEEDS_ATTENTION");
  assert.equal(report.summary.telegramChannelConfigured, true);
  assert.equal(report.summary.customerAccountLinkReady, true);
  assert.equal(report.summary.imageAnalysisConfigured, true);
  assert.equal(report.summary.manualReviewFallbackReady, true);
  assert.equal(report.summary.acceptScenarioReady, true);
  assert.equal(report.summary.rejectScenarioReady, true);
  assert.equal(report.blockers.length, 2);
  assert(report.blockers.some(blocker => blocker.code === "EWASTE_DRAFT_MEDIA_RETENTION_DECISION_REQUIRED"));
  assert(report.blockers.some(blocker => blocker.code === "EWASTE_DRAFT_MEDIA_CLEANUP_CONTRACT_UNQUALIFIED"));
  assert.equal(report.summary.draftMediaCleanup.deletionEnabled, false);
  assert.equal(report.summary.draftMediaCleanup.retentionApprovalStatus, "NOT_ESTABLISHED");
  assert.equal(report.summary.draftMediaCleanup.schedulerActivationStatus, "UNKNOWN_NOT_PROVISIONED_BY_EWASTE");
  assert.equal(report.summary.draftMediaCleanup.permanentDemoDataPolicy, "PRESERVE_OWNER_DATA_PACKS_UNCONDITIONALLY");
  assert(!JSON.stringify(report).includes("telegram-secret"));
  assert(!JSON.stringify(report).includes("test-openai-key"));
});

test("implemented inspection and configured durations never imply retention approval or scheduled cleanup readiness", () => {
  SERVICE.DefaultEWasteDraftMediaRetentionService = require("../src/service/defaultEWasteDraftMediaRetentionService");
  configs.eWaste.acceptanceReadiness.draftMedia.cleanup = {
    enabled: true, executionEnabled: true, deletionEnabled: true,
    retention: { abandonedDraftMs: 1000, rejectedSubmissionMs: 1000, replacedDraftMediaMs: 1000 },
  };
  const report = service.readiness(), cleanup = report.summary.draftMediaCleanup;
  assert.equal(report.businessStatus, "NEEDS_ATTENTION");
  assert.equal(cleanup.ownerInspectionCapabilityAvailable, true);
  assert.equal(cleanup.ownerCleanupCapabilityAvailable, false);
  assert.equal(cleanup.retentionPolicyConfigured, true);
  assert.equal(cleanup.retentionApprovalStatus, "NOT_ESTABLISHED");
  assert.equal(cleanup.schedulerActivationStatus, "UNKNOWN_NOT_PROVISIONED_BY_EWASTE");
  assert.equal(cleanup.deletionEnabled, false);
  assert(report.blockers.some(blocker => blocker.code === "EWASTE_DRAFT_MEDIA_RETENTION_DECISION_REQUIRED"));
  assert(report.blockers.some(blocker => blocker.code === "EWASTE_DRAFT_MEDIA_CLEANUP_CONTRACT_UNQUALIFIED"));
});

test("surfaces Telegram/Profile mapping gaps as owner readiness blockers", () => {
  configs.profileExternalIdentity.applications = {};
  delete configs.runtimeConfiguration.credentials["telegram.bot.circa"];
  const report = service.readiness();
  assert.equal(report.businessStatus, "NEEDS_ATTENTION");
  assert(report.blockers.some(blocker => blocker.code === "PROFILE_EXTERNAL_APPLICATION_MISSING"));
  assert.equal(report.summary.customerAccountLinkReady, false);
  assert(report.blockers.every(blocker => blocker.ownerType === "EWASTE_ACCEPTANCE"));
});

test("split-runtime readiness does not require or inspect a Waste-local Telegram credential", () => {
  delete SERVICE.DefaultExternalIdentityService;
  delete SERVICE.DefaultTelegramIdentityProviderService;
  Object.defineProperty(configs, "profileExternalIdentity", { get() { throw new Error("Remote owner configuration must not be inspected"); } });
  Object.defineProperty(configs, "runtimeConfiguration", { get() { throw new Error("Remote credentials must not be inspected"); } });
  const channel = service.channelReadiness();
  assert.equal(channel.configured, false);
  assert.equal(channel.channelPolicyConfigured, true);
  assert.equal(channel.profileOwnerReadinessStatus, "REMOTE_OWNER_NOT_INSPECTED");
  assert.equal(channel.credentialReadinessStatus, "REMOTE_OWNER_NOT_INSPECTED");
  assert.equal(channel.profileApplicationConfigured, null);
  assert.equal(channel.credentialReferenceConfigured, null);
  assert.deepEqual(channel.blockers.map(item => item.code), ["EWASTE_PROFILE_OWNER_READINESS_UNKNOWN"]);
});

for (const remote of [false, true]) {
  test(`${remote ? "remote" : "local"} Profile readiness rejects the same invalid seamlessSignIn values as channel admission`, () => {
    const authentication = require("../src/service/defaultEWasteChannelAuthenticationService");
    global.CLASSES = { NodicsError: class extends Error {
      constructor(code) { super(code); this.code = code; }
    } };
    if (remote) {
      delete SERVICE.DefaultExternalIdentityService;
      delete SERVICE.DefaultTelegramIdentityProviderService;
    }
    for (const value of [undefined, null, 0, 1, "true", "false", {}, []]) {
      configs.eWaste.channelAuthentication.channels.TELEGRAM.seamlessSignIn = value;
      assert.throws(() => authentication.policy("TELEGRAM"), { code: "ERR_EWASTE_CHANNEL_UNAVAILABLE" });
      const channel = service.channelReadiness();
      assert.equal(channel.channelPolicyConfigured, false);
      assert.equal(channel.configured, false);
      assert(channel.blockers.some(item => item.code === "EWASTE_TELEGRAM_CHANNEL_POLICY_INVALID"));
      assert.equal(service.readiness().summary.telegramChannelPolicyConfigured, false);
      if (remote) assert.equal(channel.profileOwnerReadinessStatus, "REMOTE_OWNER_NOT_INSPECTED");
    }
  });

  test(`${remote ? "remote" : "local"} Profile readiness accepts both existing boolean seamlessSignIn modes`, () => {
    const authentication = require("../src/service/defaultEWasteChannelAuthenticationService");
    if (remote) {
      delete SERVICE.DefaultExternalIdentityService;
      delete SERVICE.DefaultTelegramIdentityProviderService;
    }
    for (const value of [true, false]) {
      configs.eWaste.channelAuthentication.channels.TELEGRAM.seamlessSignIn = value;
      assert.equal(authentication.policy("TELEGRAM").seamlessSignIn, value);
      const channel = service.channelReadiness();
      assert.equal(channel.channelPolicyConfigured, true);
      assert.equal(channel.configured, !remote);
      assert.equal(channel.blockers.some(item => item.code === "EWASTE_TELEGRAM_CHANNEL_POLICY_INVALID"), false);
      assert.equal(service.readiness().summary.telegramChannelPolicyConfigured, true);
    }
  });
}

test("local readiness delegates credential stores and later provider overrides to the Profile owner", () => {
  const reference = "telegram.bot.circa";
  for (const namespace of ["runtimeConfiguration", "secureConfiguration", "credentials"]) {
    delete configs.runtimeConfiguration;
    delete configs.secureConfiguration;
    delete configs.credentials;
    configs[namespace] = namespace === "credentials"
      ? { [reference]: { value: "123456789:synthetic-readiness-token" } }
      : { credentials: { [reference]: { token: "123456789:synthetic-readiness-token" } } };
    const channel = service.channelReadiness();
    assert.equal(channel.configured, true);
    assert.equal(channel.credentialReadinessStatus, "CONFIGURED");
    assert.equal(JSON.stringify(channel).includes("synthetic-readiness-token"), false);
  }
  configs.profileExternalIdentity.providers.TELEGRAM.service = "ProjectTelegramVerifier";
  SERVICE.ProjectTelegramVerifier = { configuredCredential(application, policy) {
    assert.equal(application, configs.profileExternalIdentity.applications["circa.ewaste"]);
    assert.equal(policy, configs.profileExternalIdentity);
    return { token: "123456789:project-private-token" };
  } };
  assert.equal(service.channelReadiness().configured, true);
});

test("missing local credentials and unavailable inspection remain distinct and never imply readiness", () => {
  delete configs.runtimeConfiguration;
  let channel = service.channelReadiness();
  assert.equal(channel.credentialReadinessStatus, "UNCONFIGURED");
  assert(channel.blockers.some(item => item.code === "TELEGRAM_BOT_CREDENTIAL_MISSING"));
  delete SERVICE.DefaultTelegramIdentityProviderService;
  channel = service.channelReadiness();
  assert.equal(channel.credentialReadinessStatus, "INSPECTION_UNAVAILABLE");
  assert(channel.blockers.some(item => item.code === "EWASTE_PROFILE_OWNER_READINESS_UNKNOWN"));
  SERVICE.DefaultTelegramIdentityProviderService = { configuredCredential() { throw new Error("private-resolver-diagnostic"); } };
  channel = service.channelReadiness();
  assert.equal(channel.configured, false);
  assert.equal(channel.credentialReadinessStatus, "INSPECTION_UNAVAILABLE");
  assert.equal(JSON.stringify(channel).includes("private-resolver-diagnostic"), false);
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
