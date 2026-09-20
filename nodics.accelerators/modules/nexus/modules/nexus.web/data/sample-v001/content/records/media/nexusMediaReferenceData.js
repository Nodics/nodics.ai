/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";

/**
 * @module modules/nexus.web/data/sample-v001/content/records/media/nexusMediaReferenceData
 * @description Defines Nexus media reference records for corporate CMS, Editorial, and testimonial delivery.
 * @layer data
 * @owner nexus.web
 * @override Customer projects may extend or replace this artifact in their own project layer.
 */

/** @lifecycle PUBLISHABLE @destination WCMS_STAGED @owner nexus.web */

const evidence = Object.freeze({
  source: "NODICS_SAMPLE_DATA",
  rightsStatus: "REPLACEMENT_REQUIRED",
  approvalStatus: "PENDING_ASSET_INTAKE",
  targetType: "NEXUS_CORPORATE_MEDIA",
  approvedReferenceSiteAsset: false,
  checksumRequired: true,
  reviewerRequired: true,
  productionUseAllowed: false,
  requiredProof: [
    "original filename",
    "source system",
    "checksum",
    "intake run",
  ],
  approvalChecklist: [
    "license type",
    "asset owner",
    "reviewer",
    "approval timestamp",
  ],
  activationChecklist: [
    "target type",
    "target code",
    "usage scope",
    "activation revision",
  ],
  rollbackChecklist: [
    "previous reference",
    "deactivation reason",
    "audit trail",
    "recovery note",
  ],
});

const reference = function (
  index,
  mediaCode,
  ownerSchema,
  ownerCode,
  relationType,
) {
  return {
    code: ownerCode + "-" + mediaCode,
    tenant: "default",
    ownerModule:
      ownerSchema === "testimonialProjection"
        ? "engagement"
        : ownerSchema === "editorialArticle"
          ? "editorial"
          : "cms",
    ownerSchema,
    ownerCode,
    mediaCode,
    relationType,
    position: index + 1,
    status: "INACTIVE",
    revision: 1,
    active: true,
    evidence,
  };
};

module.exports = Object.freeze({
  record0: reference(
    0,
    "nexusBlogAxisOperations",
    "editorialArticle",
    "nexusBlogAxisOperations",
    "EDITORIAL_FEATURED_MEDIA",
  ),
  record1: reference(
    1,
    "nexusBlogCustomerEngagement",
    "editorialArticle",
    "nexusBlogCustomerEngagement",
    "EDITORIAL_FEATURED_MEDIA",
  ),
  record2: reference(
    2,
    "nexusBlogEditorialPublication",
    "editorialArticle",
    "nexusBlogEditorialPublication",
    "EDITORIAL_FEATURED_MEDIA",
  ),
  record3: reference(
    3,
    "nexusBlogRuntimeDiscovery",
    "editorialArticle",
    "nexusBlogRuntimeDiscovery",
    "EDITORIAL_FEATURED_MEDIA",
  ),
  record4: reference(
    4,
    "nexusNewsAxisRuntime",
    "editorialArticle",
    "nexusNewsAxisRuntime",
    "EDITORIAL_FEATURED_MEDIA",
  ),
  record5: reference(
    5,
    "nexusNewsEditorialRelease",
    "editorialArticle",
    "nexusNewsEditorialRelease",
    "EDITORIAL_FEATURED_MEDIA",
  ),
  record6: reference(
    6,
    "nexusNewsEngagementApi",
    "editorialArticle",
    "nexusNewsEngagementApi",
    "EDITORIAL_FEATURED_MEDIA",
  ),
  record7: reference(
    7,
    "nexusNewsPublicExperience",
    "editorialArticle",
    "nexusNewsPublicExperience",
    "EDITORIAL_FEATURED_MEDIA",
  ),
  record8: reference(
    8,
    "nexusTestimonialAarohi",
    "testimonialProjection",
    "nexusTestimonialAarohi",
    "TESTIMONIAL_AVATAR",
  ),
  record9: reference(
    9,
    "nexusTestimonialDaniel",
    "testimonialProjection",
    "nexusTestimonialDaniel",
    "TESTIMONIAL_AVATAR",
  ),
  record10: reference(
    10,
    "nexusTestimonialMarcus",
    "testimonialProjection",
    "nexusTestimonialMarcus",
    "TESTIMONIAL_AVATAR",
  ),
  record11: reference(
    11,
    "nodicsAboutArchitecture",
    "cmsComponent",
    "nodicsAboutArchitecture",
    "COMPONENT_MEDIA",
  ),
  record12: reference(
    12,
    "nodicsAboutCollaboration",
    "cmsComponent",
    "nodicsAboutCollaboration",
    "COMPONENT_MEDIA",
  ),
  record13: reference(
    13,
    "nodicsAboutVerticalOperations",
    "cmsComponent",
    "nodicsAboutVerticalOperations",
    "COMPONENT_MEDIA",
  ),
  record14: reference(
    14,
    "nodicsAboutVerticalWorkshop",
    "cmsComponent",
    "nodicsAboutVerticalWorkshop",
    "COMPONENT_MEDIA",
  ),
  record15: reference(
    15,
    "nodicsContactArchitecture",
    "cmsComponent",
    "nodicsContactArchitecture",
    "COMPONENT_MEDIA",
  ),
  record16: reference(
    16,
    "nodicsDeveloperContractWorkshop",
    "cmsComponent",
    "nodicsDeveloperContractWorkshop",
    "COMPONENT_MEDIA",
  ),
  record17: reference(
    17,
    "nodicsDeveloperExperience",
    "cmsComponent",
    "nodicsDeveloperExperience",
    "COMPONENT_MEDIA",
  ),
  record18: reference(
    18,
    "nodicsFeaturesArchitecture",
    "cmsComponent",
    "nodicsFeaturesArchitecture",
    "COMPONENT_MEDIA",
  ),
  record19: reference(
    19,
    "nodicsMicroservicesHero",
    "cmsComponent",
    "nodicsMicroservicesHero",
    "COMPONENT_MEDIA",
  ),
  record20: reference(
    20,
    "nodicsModularHero",
    "cmsComponent",
    "nodicsModularHero",
    "COMPONENT_MEDIA",
  ),
  record21: reference(
    21,
    "nodicsProductOperatingModel",
    "cmsComponent",
    "nodicsProductOperatingModel",
    "COMPONENT_MEDIA",
  ),
  record22: reference(
    22,
    "nodicsSecureHero",
    "cmsComponent",
    "nodicsSecureHero",
    "COMPONENT_MEDIA",
  ),
  record23: reference(
    23,
    "oxaviaHeroTwo",
    "cmsComponent",
    "oxaviaHeroTwo",
    "COMPONENT_MEDIA",
  ),
  record24: reference(
    24,
    "nexusProduct-waste-home",
    "cmsComponent",
    "nexusProductWasteStory",
    "COMPONENT_MEDIA",
  ),
  record25: reference(
    25,
    "nexusProduct-waste-shop",
    "cmsComponent",
    "nexusProductWasteStory",
    "COMPONENT_MEDIA",
  ),
  record26: reference(
    26,
    "nexusProduct-waste-mobile",
    "cmsComponent",
    "nexusProductWasteStory",
    "COMPONENT_MEDIA",
  ),
  record27: reference(
    27,
    "nexusProduct-apparel-home-v2",
    "cmsComponent",
    "nexusProductApparelStory",
    "COMPONENT_MEDIA",
  ),
  record28: reference(
    28,
    "nexusProduct-apparel-shop-v2",
    "cmsComponent",
    "nexusProductApparelStory",
    "COMPONENT_MEDIA",
  ),
  record29: reference(
    29,
    "nexusProduct-apparel-mobile-v2",
    "cmsComponent",
    "nexusProductApparelStory",
    "COMPONENT_MEDIA",
  ),
  record30: reference(
    30,
    "nexusProduct-electronics-home",
    "cmsComponent",
    "nexusProductElectronicsStory",
    "COMPONENT_MEDIA",
  ),
  record31: reference(
    31,
    "nexusProduct-electronics-shop",
    "cmsComponent",
    "nexusProductElectronicsStory",
    "COMPONENT_MEDIA",
  ),
  record32: reference(
    32,
    "nexusProduct-electronics-mobile",
    "cmsComponent",
    "nexusProductElectronicsStory",
    "COMPONENT_MEDIA",
  ),
  record33: reference(
    33,
    "nexusProduct-telco-home",
    "cmsComponent",
    "nexusProductTelcoStory",
    "COMPONENT_MEDIA",
  ),
  record34: reference(
    34,
    "nexusProduct-telco-shop",
    "cmsComponent",
    "nexusProductTelcoStory",
    "COMPONENT_MEDIA",
  ),
  record35: reference(
    35,
    "nexusProduct-telco-mobile",
    "cmsComponent",
    "nexusProductTelcoStory",
    "COMPONENT_MEDIA",
  ),
  record36: reference(
    36,
    "nexusProduct-apparel-menu",
    "cmsComponent",
    "nexusProductApparelStory",
    "COMPONENT_MEDIA",
  ),
});
