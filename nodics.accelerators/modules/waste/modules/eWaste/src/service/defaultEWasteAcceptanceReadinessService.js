/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";

/** @module eWaste/service/defaultEWasteAcceptanceReadinessService @description Owns Circa/eWaste channel, AI, media and accept/reject scenario readiness without calling external providers or moving authority into BackOffice. @owner eWaste @layer service @override Later layers may configure channel applications, credentials, provider adapters and media cleanup policy; readiness remains owner-owned and reports masked operator guidance only. */
module.exports = {
  config: function (key) {
    return (global.CONFIG && typeof CONFIG.get === "function" && CONFIG.get(key)) || {};
  },
  hasService: function (name) {
    return !!(global.SERVICE && SERVICE[name]);
  },
  credentialStores: function () {
    return [
      this.config("runtimeConfiguration"),
      this.config("secureConfiguration"),
      this.config("application"),
      this.config("policy"),
      this.config("credentials"),
      this.config("eWaste"),
    ];
  },
  readCredential: function (reference) {
    if (typeof reference !== "string" || !reference) return undefined;
    if (reference.startsWith("env:")) return process.env[reference.slice(4)];
    for (const store of this.credentialStores()) {
      const credentials = store && store.credentials;
      if (!credentials) continue;
      const value = credentials[reference];
      if (typeof value === "string") return value;
      if (value && typeof value.value === "string") return value.value;
    }
    return undefined;
  },
  blocker: function (code, severity, action, message, options) {
    options = options || {};
    return {
      blockerCode: code,
      code,
      severity: severity || "NEEDS_ATTENTION",
      ownerType: "EWASTE_ACCEPTANCE",
      source: "EWASTE_ACCEPTANCE_READINESS",
      action,
      message,
      disabledReason: options.disabledReason || message,
      suggestedAction: options.suggestedAction || action,
      businessImpact: options.businessImpact || "Circa/eWaste cannot complete a reliable customer acceptance scenario until this owner readiness issue is resolved.",
      recoveryHint: options.recoveryHint || options.suggestedAction || action,
      repair: {
        available: false,
        operation: options.repairOperation || "eWaste.acceptance.configure",
        action: options.repairAction || code,
        eligibility: "NOT_AVAILABLE",
        label: options.repairLabel || action,
      },
    };
  },
  channelReadiness: function () {
    const eWaste = this.config("eWaste");
    const channelConfig = eWaste.channelAuthentication || {};
    const telegram = (channelConfig.channels || {}).TELEGRAM || {};
    const profile = this.config("profileExternalIdentity");
    const appCode = telegram.applicationCode;
    const application = appCode && (profile.applications || {})[appCode];
    const credentialReference = application && application.credentialReference;
    const blockers = [];
    if (channelConfig.enabled !== true || telegram.enabled !== true) blockers.push(this.blocker(
      "EWASTE_TELEGRAM_CHANNEL_DISABLED",
      "NEEDS_ATTENTION",
      "Enable the Telegram channel in eWaste channelAuthentication",
      "Circa Telegram launch is not enabled in the eWaste channel policy.",
      { recoveryHint: "Configure eWaste.channelAuthentication.channels.TELEGRAM at the owning eWaste layer or a later runtime configuration layer." }
    ));
    if (typeof appCode !== "string" || !appCode) blockers.push(this.blocker(
      "EWASTE_TELEGRAM_APPLICATION_MISSING",
      "NEEDS_ATTENTION",
      "Configure the Circa Telegram application code",
      "The eWaste Telegram channel does not declare the Profile application code it should use."
    ));
    if (profile.enabled !== true) blockers.push(this.blocker(
      "PROFILE_EXTERNAL_IDENTITY_DISABLED",
      "NEEDS_ATTENTION",
      "Enable Profile external identity",
      "Profile external identity is not enabled, so Telegram proof cannot be exchanged for a customer handoff.",
      { businessImpact: "Telegram users will be forced into reconnect/login paths even when their channel proof is valid." }
    ));
    if (!application || application.enabled !== true) blockers.push(this.blocker(
      "PROFILE_EXTERNAL_APPLICATION_MISSING",
      "NEEDS_ATTENTION",
      "Configure the Profile external identity application for Circa",
      "Profile does not expose an enabled external-identity application matching the eWaste Telegram channel."
    ));
    if (application && application.provider !== "TELEGRAM") blockers.push(this.blocker(
      "PROFILE_EXTERNAL_PROVIDER_MISMATCH",
      "BLOCKED",
      "Align the Profile application provider with Telegram",
      "The configured Profile external-identity application is not mapped to the Telegram provider."
    ));
    if (!credentialReference || !this.readCredential(credentialReference)) blockers.push(this.blocker(
      "TELEGRAM_BOT_CREDENTIAL_MISSING",
      "NEEDS_ATTENTION",
      "Configure the Telegram bot credential through runtime configuration",
      "The Telegram bot credential reference is missing or unresolved.",
      { businessImpact: "Profile cannot verify Telegram launch assertions without the configured bot credential.",
        recoveryHint: "Provide the configured credential reference through layered properties or persisted runtime configuration; readiness never displays the secret value." }
    ));
    if (!this.hasService("DefaultEWasteChannelAuthenticationService")) blockers.push(this.blocker(
      "EWASTE_CHANNEL_SERVICE_UNAVAILABLE",
      "BLOCKED",
      "Start the eWaste channel authentication service",
      "The eWaste channel authentication service is not available in this runtime."
    ));
    if (!this.hasService("DefaultModuleService")) blockers.push(this.blocker(
      "MODULE_SERVICE_UNAVAILABLE",
      "BLOCKED",
      "Start runtime module invocation support",
      "eWaste cannot invoke Profile or Media owner APIs without the module service."
    ));
    return {
      configured: blockers.length === 0,
      blockers,
      applicationCode: appCode || null,
      seamlessSignIn: telegram.seamlessSignIn === true,
      profileApplicationConfigured: !!application,
      credentialReferenceConfigured: !!credentialReference,
    };
  },
  imageAnalysisReadiness: function () {
    const eWaste = this.config("eWaste");
    const wasteSubmission = this.config("wasteSubmission");
    const metadata = wasteSubmission.metadataSuggestion || {};
    const wasteImpact = this.config("wasteImpact");
    const copilot = this.config("copilot");
    const openAi = ((wasteImpact.calculation || {}).openAiEnvironmental) || {};
    const adapter = openAi.adapter && (((copilot.providers || {}).adapters || {})[openAi.adapter]);
    const profile = openAi.profile && (((copilot.providers || {}).profiles || {})[openAi.profile]);
    const credentialRef = adapter && adapter.credential && adapter.credential.secretRef;
    const blockers = [];
    [
      "DefaultEWasteSubmissionPreparationService",
      "DefaultWasteMetadataAnalysisService",
      "DefaultWasteItemDescriptorService",
      "DefaultWastePersistenceService",
      "DefaultModuleService",
    ].forEach(name => {
      if (!this.hasService(name)) blockers.push(this.blocker(
        "EWASTE_IMAGE_SERVICE_UNAVAILABLE",
        "BLOCKED",
        "Start eWaste image preparation dependencies",
        name + " is not available for customer photo preparation.",
        { repairAction: "START_IMAGE_PREPARATION_DEPENDENCIES" }
      ));
    });
    if (wasteSubmission.requireEnvironmentalAssessment !== true) blockers.push(this.blocker(
      "EWASTE_ENVIRONMENTAL_ASSESSMENT_NOT_REQUIRED",
      "NEEDS_ATTENTION",
      "Require environmental assessment before submit",
      "eWaste submissions are not configured to require environmental impact assessment before submit."
    ));
    if (metadata.manualReviewFallback !== true || !metadata.fallbackItemTypeCode) blockers.push(this.blocker(
      "EWASTE_IMAGE_MANUAL_FALLBACK_MISSING",
      "NEEDS_ATTENTION",
      "Configure a manual-review image-analysis fallback",
      "Image analysis does not have a configured manual-review fallback item type."
    ));
    if (!Array.isArray(metadata.allowedFamilyCodes) || metadata.allowedFamilyCodes.length === 0) blockers.push(this.blocker(
      "EWASTE_IMAGE_ALLOWED_FAMILIES_MISSING",
      "NEEDS_ATTENTION",
      "Configure supported eWaste item families",
      "Image analysis is missing the allowed eWaste item family list."
    ));
    if (!openAi.adapter || !openAi.profile || !adapter || !profile) blockers.push(this.blocker(
      "EWASTE_OPENAI_ASSESSMENT_PROFILE_MISSING",
      "NEEDS_ATTENTION",
      "Configure the OpenAI environmental assessment profile",
      "The eWaste OpenAI environmental assessment adapter/profile is not fully configured."
    ));
    if (adapter && adapter.enabled !== true) blockers.push(this.blocker(
      "EWASTE_OPENAI_ADAPTER_DISABLED",
      "NEEDS_ATTENTION",
      "Enable the configured OpenAI provider adapter when AI assessment is required",
      "The configured OpenAI adapter is disabled.",
      { businessImpact: "Customer photo analysis can use manual review fallback, but AI-assisted environmental assessment is not ready." }
    ));
    if (credentialRef && adapter && adapter.enabled === true && !this.readCredential(credentialRef)) blockers.push(this.blocker(
      "EWASTE_OPENAI_CREDENTIAL_MISSING",
      "NEEDS_ATTENTION",
      "Configure the OpenAI credential reference",
      "The configured OpenAI credential reference is unresolved.",
      { recoveryHint: "Provide the configured secret reference through private layered configuration or persisted runtime configuration; readiness only reports presence." }
    ));
    return {
      configured: !blockers.some(blocker => blocker.severity === "BLOCKED"),
      blockers,
      manualReviewFallbackReady: metadata.manualReviewFallback === true && !!metadata.fallbackItemTypeCode,
      allowedFamilyCodes: [].concat(metadata.allowedFamilyCodes || []),
      openAiProfileConfigured: !!openAi.adapter && !!openAi.profile && !!adapter && !!profile,
      openAiAdapterEnabled: adapter && adapter.enabled === true,
      openAiCredentialReferenceConfigured: !!credentialRef,
      maximumPhotoBytesConfigured: Number.isSafeInteger(eWaste.preparation && eWaste.preparation.maximumPhotoBytes),
    };
  },
  mediaLifecycleReadiness: function () {
    const policy = ((this.config("eWaste").acceptanceReadiness || {}).draftMedia) || {};
    const blockers = [];
    if (!this.hasService("DefaultEWasteSubmissionPreparationService")) blockers.push(this.blocker(
      "EWASTE_DRAFT_MEDIA_PREPARATION_UNAVAILABLE",
      "BLOCKED",
      "Start eWaste submission preparation",
      "Draft customer media cannot be attached because the eWaste preparation service is unavailable."
    ));
    if (!policy.rejectedCleanupStatus) blockers.push(this.blocker(
      "EWASTE_REJECTED_DRAFT_CLEANUP_POLICY_MISSING",
      "NEEDS_ATTENTION",
      "Configure rejected draft media cleanup policy",
      "Rejected or abandoned eWaste draft media cleanup policy is not declared."
    ));
    return {
      configured: blockers.length === 0,
      blockers,
      draftPhotoRetentionStatus: policy.retentionStatus || "NOT_DECLARED",
      rejectedDraftCleanupStatus: policy.rejectedCleanupStatus || "NOT_DECLARED",
      acceptedEvidenceRetentionStatus: policy.acceptedEvidenceRetentionStatus || "NOT_DECLARED",
      customerUploadPathReady: this.hasService("DefaultModuleService"),
    };
  },
  scenarioReadiness: function () {
    const required = [
      "DefaultEWasteExperienceService",
      "DefaultWasteVerificationOperationService",
      "DefaultEWasteRewardAssessmentOperationService",
      "DefaultWasteImpactAssessmentService",
      "DefaultEWasteOutcomeCommunicationService",
    ];
    const blockers = [];
    required.forEach(name => {
      if (!this.hasService(name)) blockers.push(this.blocker(
        "EWASTE_ACCEPT_REJECT_SERVICE_UNAVAILABLE",
        "BLOCKED",
        "Start eWaste accept/reject scenario dependencies",
        name + " is not available for governed accept/reject scenario readiness.",
        { repairAction: "START_ACCEPT_REJECT_DEPENDENCIES" }
      ));
    });
    const policy = (this.config("eWaste").acceptanceReadiness || {}).scenarios || {};
    if ((policy.accept || {}).enabled === false) blockers.push(this.blocker(
      "EWASTE_ACCEPT_SCENARIO_DISABLED",
      "NEEDS_ATTENTION",
      "Enable the accepted-asset scenario readiness gate",
      "Accepted-asset scenario validation is disabled by eWaste readiness policy."
    ));
    if ((policy.reject || {}).enabled === false) blockers.push(this.blocker(
      "EWASTE_REJECT_SCENARIO_DISABLED",
      "NEEDS_ATTENTION",
      "Enable the rejected-asset scenario readiness gate",
      "Rejected-asset scenario validation is disabled by eWaste readiness policy."
    ));
    return {
      configured: blockers.length === 0,
      blockers,
      acceptScenarioReady: blockers.length === 0 && (policy.accept || {}).enabled !== false,
      rejectScenarioReady: blockers.length === 0 && (policy.reject || {}).enabled !== false,
    };
  },
  readiness: function () {
    const channel = this.channelReadiness();
    const image = this.imageAnalysisReadiness();
    const media = this.mediaLifecycleReadiness();
    const scenarios = this.scenarioReadiness();
    const blockers = [].concat(channel.blockers, image.blockers, media.blockers, scenarios.blockers);
    return {
      contractVersion: 1,
      source: "EWASTE_ACCEPTANCE_READINESS",
      ownerModule: "eWaste",
      businessStatus: blockers.some(blocker => blocker.severity === "BLOCKED") ? "BLOCKED" :
        blockers.length ? "NEEDS_ATTENTION" : "READY",
      summary: {
        telegramChannelConfigured: channel.configured,
        profileExternalIdentityConfigured: channel.profileApplicationConfigured,
        customerAccountLinkReady: channel.configured,
        imageAnalysisConfigured: image.openAiProfileConfigured && image.openAiAdapterEnabled,
        manualReviewFallbackReady: image.manualReviewFallbackReady,
        openAiCredentialReferenceConfigured: image.openAiCredentialReferenceConfigured,
        draftPhotoRetentionStatus: media.draftPhotoRetentionStatus,
        rejectedDraftCleanupStatus: media.rejectedDraftCleanupStatus,
        acceptedEvidenceRetentionStatus: media.acceptedEvidenceRetentionStatus,
        acceptScenarioReady: scenarios.acceptScenarioReady,
        rejectScenarioReady: scenarios.rejectScenarioReady,
        blockerCount: blockers.length,
      },
      blockers,
      nextAction: blockers.length ? "Open eWaste configuration/readiness guidance and resolve the listed owner blockers." :
        "Circa/eWaste channel, AI, media and accept/reject scenario prerequisites are ready.",
    };
  },
};
