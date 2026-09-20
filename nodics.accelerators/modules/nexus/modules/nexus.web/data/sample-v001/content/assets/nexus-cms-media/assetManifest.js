/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";

/**
 * @module modules/nexus.web/data/sample-v001/content/assets/nexus-cms-media/assetManifest
 * @description Declares project-owned Nexus media assets that must be uploaded to WCMS Staged before CMS publication.
 * @layer assets
 * @owner nexus.web
 * @override Customer projects may replace these sample assets with their own approved corporate media.
 */

const cmsAsset = function (mediaCode, fileName, name, ownerCode, ownerType) {
  return {
    mediaCode,
    fileName,
    name,
    ownerCode,
    folderCode: "cmsAssets",
    formatCode: "original",
    businessPurpose: "NEXUS_CORPORATE_CONTENT",
    ownerType: ownerType || "CMS_COMPONENT",
    description: name + " for Nexus CMS media delivery",
  };
};

module.exports = Object.freeze([
  cmsAsset(
    "nexusBlogAxisOperations",
    "nexusBlogAxisOperations.png",
    "Nexus Axis operations blog visual",
    "nexusBlogAxisOperations",
    "CMS_COMPONENT",
  ),
  cmsAsset(
    "nexusBlogCustomerEngagement",
    "nexusBlogCustomerEngagement.png",
    "Nexus customer engagement blog visual",
    "nexusBlogCustomerEngagement",
    "CMS_COMPONENT",
  ),
  cmsAsset(
    "nexusBlogEditorialPublication",
    "nexusBlogEditorialPublication.png",
    "Nexus editorial publication blog visual",
    "nexusBlogEditorialPublication",
    "CMS_COMPONENT",
  ),
  cmsAsset(
    "nexusBlogRuntimeDiscovery",
    "nexusBlogRuntimeDiscovery.png",
    "Nexus runtime discovery blog visual",
    "nexusBlogRuntimeDiscovery",
    "CMS_COMPONENT",
  ),
  cmsAsset(
    "nexusNewsAxisRuntime",
    "nexusNewsAxisRuntime.png",
    "Nexus Axis runtime news visual",
    "nexusNewsAxisRuntime",
    "CMS_COMPONENT",
  ),
  cmsAsset(
    "nexusNewsEditorialRelease",
    "nexusNewsEditorialRelease.png",
    "Nexus editorial release news visual",
    "nexusNewsEditorialRelease",
    "CMS_COMPONENT",
  ),
  cmsAsset(
    "nexusNewsEngagementApi",
    "nexusNewsEngagementApi.png",
    "Nexus engagement API news visual",
    "nexusNewsEngagementApi",
    "CMS_COMPONENT",
  ),
  cmsAsset(
    "nexusNewsPublicExperience",
    "nexusNewsPublicExperience.png",
    "Nexus public experience news visual",
    "nexusNewsPublicExperience",
    "CMS_COMPONENT",
  ),
  cmsAsset(
    "nexusTestimonialAarohi",
    "nexusTestimonialAarohi.png",
    "Nexus testimonial Aarohi avatar",
    "nexusTestimonialAarohi",
    "TESTIMONIAL",
  ),
  cmsAsset(
    "nexusTestimonialDaniel",
    "nexusTestimonialDaniel.png",
    "Nexus testimonial Daniel avatar",
    "nexusTestimonialDaniel",
    "TESTIMONIAL",
  ),
  cmsAsset(
    "nexusTestimonialMarcus",
    "nexusTestimonialMarcus.png",
    "Nexus testimonial Marcus avatar",
    "nexusTestimonialMarcus",
    "TESTIMONIAL",
  ),
  cmsAsset(
    "nodicsAboutArchitecture",
    "nodicsAboutArchitecture.png",
    "Nexus architecture workshop visual",
    "nodicsAboutArchitecture",
    "CMS_COMPONENT",
  ),
  cmsAsset(
    "nodicsAboutCollaboration",
    "nodicsAboutCollaboration.png",
    "Nexus AI collaboration visual",
    "nodicsAboutCollaboration",
    "CMS_COMPONENT",
  ),
  cmsAsset(
    "nodicsAboutVerticalOperations",
    "nodicsAboutVerticalOperations.png",
    "Nexus operations journey visual",
    "nodicsAboutVerticalOperations",
    "CMS_COMPONENT",
  ),
  cmsAsset(
    "nodicsAboutVerticalWorkshop",
    "nodicsAboutVerticalWorkshop.png",
    "Nexus framework workshop visual",
    "nodicsAboutVerticalWorkshop",
    "CMS_COMPONENT",
  ),
  cmsAsset(
    "nodicsContactArchitecture",
    "nodicsContactArchitecture.png",
    "Nexus contact architecture visual",
    "nodicsContactArchitecture",
    "CMS_COMPONENT",
  ),
  cmsAsset(
    "nodicsDeveloperContractWorkshop",
    "nodicsDeveloperContractWorkshop.png",
    "Nexus developer contract workshop visual",
    "nodicsDeveloperContractWorkshop",
    "CMS_COMPONENT",
  ),
  cmsAsset(
    "nodicsDeveloperExperience",
    "nodicsDeveloperExperience.png",
    "Nexus developer experience visual",
    "nodicsDeveloperExperience",
    "CMS_COMPONENT",
  ),
  cmsAsset(
    "nodicsFeaturesArchitecture",
    "nodicsFeaturesArchitecture.png",
    "Nexus feature architecture visual",
    "nodicsFeaturesArchitecture",
    "CMS_COMPONENT",
  ),
  cmsAsset(
    "nodicsMicroservicesHero",
    "nodicsMicroservicesHero.png",
    "Nexus microservices hero",
    "nodicsMicroservicesHero",
    "CMS_COMPONENT",
  ),
  cmsAsset(
    "nodicsModularHero",
    "nodicsModularHero.png",
    "Nexus modular architecture hero",
    "nodicsModularHero",
    "CMS_COMPONENT",
  ),
  cmsAsset(
    "nodicsProductOperatingModel",
    "nodicsProductOperatingModel.png",
    "Nexus product operating model visual",
    "nodicsProductOperatingModel",
    "CMS_COMPONENT",
  ),
  cmsAsset(
    "nodicsSecureHero",
    "nodicsSecureHero.png",
    "Nexus secure operations hero",
    "nodicsSecureHero",
    "CMS_COMPONENT",
  ),
  cmsAsset(
    "oxaviaHeroTwo",
    "oxaviaHeroTwo.jpg",
    "Nexus reference hero visual",
    "oxaviaHeroTwo",
    "CMS_COMPONENT",
  ),
  cmsAsset(
    "nexusProduct-waste-home",
    "nexusProduct-waste-home.png",
    "Waste Management reference home screen",
    "nexusProductWasteStory",
    "CMS_COMPONENT",
  ),
  cmsAsset(
    "nexusProduct-waste-shop",
    "nexusProduct-waste-shop.png",
    "Waste Management reference shop screen",
    "nexusProductWasteStory",
    "CMS_COMPONENT",
  ),
  cmsAsset(
    "nexusProduct-waste-mobile",
    "nexusProduct-waste-mobile.png",
    "Waste Management reference mobile screen",
    "nexusProductWasteStory",
    "CMS_COMPONENT",
  ),
  cmsAsset(
    "nexusProduct-apparel-home-v2",
    "nexusProduct-apparel-home-v2.png",
    "Agora Apparel reference home screen",
    "nexusProductApparelStory",
    "CMS_COMPONENT",
  ),
  cmsAsset(
    "nexusProduct-apparel-shop-v2",
    "nexusProduct-apparel-shop-v2.png",
    "Agora Apparel reference shop screen",
    "nexusProductApparelStory",
    "CMS_COMPONENT",
  ),
  cmsAsset(
    "nexusProduct-apparel-mobile-v2",
    "nexusProduct-apparel-mobile-v2.png",
    "Agora Apparel reference mobile screen",
    "nexusProductApparelStory",
    "CMS_COMPONENT",
  ),
  cmsAsset(
    "nexusProduct-apparel-menu",
    "nexusProduct-apparel-menu.png",
    "Agora Apparel grouped Shop mega menu",
    "nexusProductApparelStory",
    "CMS_COMPONENT",
  ),
  cmsAsset(
    "nexusProduct-electronics-home",
    "nexusProduct-electronics-home.png",
    "Agora Electronics reference home screen",
    "nexusProductElectronicsStory",
    "CMS_COMPONENT",
  ),
  cmsAsset(
    "nexusProduct-electronics-shop",
    "nexusProduct-electronics-shop.png",
    "Agora Electronics reference shop screen",
    "nexusProductElectronicsStory",
    "CMS_COMPONENT",
  ),
  cmsAsset(
    "nexusProduct-electronics-mobile",
    "nexusProduct-electronics-mobile.png",
    "Agora Electronics reference mobile screen",
    "nexusProductElectronicsStory",
    "CMS_COMPONENT",
  ),
  cmsAsset(
    "nexusProduct-telco-home",
    "nexusProduct-telco-home.png",
    "Agora Telco reference home screen",
    "nexusProductTelcoStory",
    "CMS_COMPONENT",
  ),
  cmsAsset(
    "nexusProduct-telco-shop",
    "nexusProduct-telco-shop.png",
    "Agora Telco reference shop screen",
    "nexusProductTelcoStory",
    "CMS_COMPONENT",
  ),
  cmsAsset(
    "nexusProduct-telco-mobile",
    "nexusProduct-telco-mobile.png",
    "Agora Telco reference mobile screen",
    "nexusProductTelcoStory",
    "CMS_COMPONENT",
  ),
]);
