/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module wcmsExperience/config/properties
 * @description Configurable WCMS Experience defaults for resolver, projection, indexing, and delivery safety.
 * @layer configuration
 * @owner wcmsExperience
 * @override Project, environment, server, node, or tenant layers may tune limits and provider choices.
 */
module.exports = {
  // Search participation follows this capability, independently of runtime role labels.
  search: { wcmsExperience: { options: { enabled: true } } },
  wcmsExperience: {
    enabled: true,
    authoring: { maximumAbsolutePriority: 100000 },
    stagedPreview: {
      enabled: true,
      maximumPlacements: 100,
      maximumProjectionBytes: 262144,
      presentation: {
        prepare: "Prepare private preview",
        inspect: "Inspect preparation",
        notice: "Preparation creates a private Staged preview. It does not approve or publish content, or change Online delivery.",
        uncertain: "Preparation could not be confirmed. Inspect its current status before another preparation.",
        ready: "Private preview is ready. Run Staged preview to inspect this snapshot.",
        retire: "Retire pending preparation",
        retireTitle: "Retire this pending private preparation?",
        retireMessage: "This fences the inspected incomplete writer. It preserves the last complete preview, all retained bytes and Online delivery. Prepare a new preview explicitly afterwards.",
        confirm: "Retire inspected preparation",
        cancel: "Keep preparation",
      },
    },
    resolver: {
      enabled: true,
      defaultLocale: "en-US",
      defaultChannel: "web",
      defaultDevice: "desktop",
      maxSlots: 20,
      maxComponents: 200,
      maxDepth: 10,
      fallbackTargetType: "DEFAULT",
      fallbackTargetCode: "*",
    },
    indexing: {
      mode: "OUTBOX_EVENTUAL",
      maximumPlacements: 200,
      maximumRoutes: 200,
      maximumProjectionBytes: 1048576,
      stagedAliasTemplate: "cms_experience_${site}_staged_current",
      onlineAliasTemplate: "cms_experience_${site}_online_current",
      preservePreviousOnlineAliasOnFailure: true,
    },
    projection: {
      provider: "DISCOVERY",
      ownerType: "WCMS_EXPERIENCE",
      indexConfigurationCode: "cmsExperiencePlacement",
      indexName: "discoveryDocumentProjection",
      status: "CURRENT",
      publicationPolicy: {
        batchSize: 100,
        aliasSwitch: true,
        rollbackEnabled: true,
      },
    },
    cache: {
      enabled: true,
      ttl: 30000,
    },
    backoffice: {
      capabilityCode: "wcms-experience-studio",
      displayName: "Experience Studio",
      documentationRoute:
        "/docs/framework/wcms-experience-placement-delivery",
    },
  },
  apiExposure: {
    categories: {
      moduleInternal: { inheritUnknown: true },
      cmsAuthoring: {
        enabled: true,
      },
      cmsDelivery: {
        enabled: true,
      },
    },
  },
};
