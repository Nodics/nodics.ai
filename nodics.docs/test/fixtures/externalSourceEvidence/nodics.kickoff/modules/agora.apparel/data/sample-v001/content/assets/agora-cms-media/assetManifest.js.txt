/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";

/**
 * @module modules/agora.apparel/data/sample-v001/content/assets/agora-cms-media/assetManifest
 * @description Declares agora.apparel-owned Agora media assets that must be uploaded to WCMS Staged before CMS publication.
 * @layer assets
 * @owner agora.apparel
 * @override Customer projects may replace these sample assets with their own approved commerce media.
 */

const cmsAsset = function (mediaCode, fileName, name, ownerCode) {
  return {
    mediaCode,
    fileName,
    name,
    ownerCode,
    folderCode: "cmsAssets",
    formatCode: "original",
    businessPurpose: "AGORA_STOREFRONT_CONTENT",
    ownerType: "CMS_COMPONENT",
    description: name + " for Agora storefront CMS delivery",
  };
};

const productAsset = function (mediaCode, fileName, name, productCode) {
  return {
    mediaCode,
    fileName,
    name,
    ownerCode: productCode,
    folderCode: "cmsAssets",
    formatCode: "original",
    businessPurpose: "AGORA_PRODUCT_PRIMARY_IMAGE",
    ownerType: "PRODUCT",
    description: name + " for Agora product discovery delivery",
  };
};

module.exports = Object.freeze([
  cmsAsset(
    "agora-owned-home-hero-summer-edit",
    "agora-owned-home-hero-summer-edit.jpg",
    "Agora white dress summer hero",
    "agoraApparelHomeHeroExperience",
  ),
  cmsAsset(
    "agora-owned-home-hero-signature-style",
    "agora-owned-home-hero-signature-style.jpg",
    "Agora wrapped dress signature hero",
    "agoraApparelHomeHeroExperience",
  ),
  cmsAsset(
    "agora-owned-home-hero-layered-edit",
    "agora-owned-home-hero-layered-edit.jpg",
    "Agora white dress layered hero",
    "agoraApparelHomeHeroExperience",
  ),
  cmsAsset(
    "agora-owned-product-listing-wide-hero",
    "agora-owned-product-listing-wide-hero.jpg",
    "Agora product listing wide editorial hero",
    "agoraApparelProductListingExperience",
  ),
  cmsAsset(
    "agora-owned-collection-new-in",
    "agora-owned-collection-new-in.jpg",
    "Agora new in collection tile",
    "agoraApparelHomeCollectionGrid",
  ),
  cmsAsset(
    "agora-owned-collection-promotion",
    "agora-owned-collection-promotion.jpg",
    "Agora promotion collection tile",
    "agoraApparelHomeCollectionGrid",
  ),
  cmsAsset(
    "agora-owned-collection-clothing",
    "agora-owned-collection-clothing.jpg",
    "Agora clothing collection tile",
    "agoraApparelHomeCollectionGrid",
  ),
  cmsAsset(
    "agora-owned-collection-dresses",
    "agora-owned-collection-dresses.jpg",
    "Agora dresses collection tile",
    "agoraApparelHomeCollectionGrid",
  ),
  cmsAsset(
    "agora-owned-collection-bags",
    "agora-owned-collection-bags.jpg",
    "Agora bags collection tile",
    "agoraApparelHomeCollectionGrid",
  ),
  cmsAsset(
    "agora-owned-collection-accessories",
    "agora-owned-collection-accessories.jpg",
    "Agora accessories collection tile",
    "agoraApparelHomeCollectionGrid",
  ),
  cmsAsset(
    "agora-owned-promo-capsule",
    "agora-owned-promo-capsule.jpg",
    "Agora capsule promotion tile",
    "agoraApparelEditorialPromoGrid",
  ),
  cmsAsset(
    "agora-owned-promo-texture-edit",
    "agora-owned-promo-texture-edit.jpg",
    "Agora texture edit promotion tile",
    "agoraApparelEditorialPromoGrid",
  ),
  cmsAsset(
    "agora-owned-promo-crossbody",
    "agora-owned-promo-crossbody.jpg",
    "Agora crossbody promotion tile",
    "agoraApparelEditorialPromoGrid",
  ),
  cmsAsset(
    "agora-owned-product-coupon-style-pass",
    "agora-owned-collection-promotion.jpg",
    "Agora Style Pass coupon menu tile",
    "agoraApparelGlobalHeader",
  ),
  cmsAsset(
    "agora-owned-product-coupon-capsule-edit",
    "agora-owned-promo-capsule.jpg",
    "Agora Capsule Edit coupon menu tile",
    "agoraApparelGlobalHeader",
  ),
  cmsAsset(
    "agora-owned-product-coupon-private-sale",
    "agora-owned-promo-texture-edit.jpg",
    "Agora Private Sale coupon menu tile",
    "agoraApparelGlobalHeader",
  ),
  cmsAsset(
    "agora-owned-testimonial-sybil",
    "agora-owned-testimonial-sybil.jpg",
    "Agora testimonial Sybil visual",
    "agoraApparelCustomerTestimonials",
  ),
  cmsAsset(
    "agora-owned-avatar-sybil",
    "agora-owned-avatar-sybil.jpg",
    "Agora testimonial Sybil avatar",
    "agoraApparelCustomerTestimonials",
  ),
  cmsAsset(
    "agora-owned-testimonial-mark",
    "agora-owned-testimonial-mark.jpg",
    "Agora testimonial Mark avatar",
    "agoraApparelCustomerTestimonials",
  ),
  cmsAsset(
    "agora-owned-avatar-mark",
    "agora-owned-avatar-mark.jpg",
    "Agora testimonial Mark portrait",
    "agoraApparelCustomerTestimonials",
  ),
  cmsAsset(
    "agora-owned-gallery-1",
    "agora-owned-gallery-1.jpg",
    "Agora social gallery one",
    "agoraApparelSocialGallery",
  ),
  cmsAsset(
    "agora-owned-gallery-2",
    "agora-owned-gallery-2.jpg",
    "Agora social gallery two",
    "agoraApparelSocialGallery",
  ),
  cmsAsset(
    "agora-owned-gallery-3",
    "agora-owned-gallery-3.jpg",
    "Agora social gallery three",
    "agoraApparelSocialGallery",
  ),
  cmsAsset(
    "agora-owned-gallery-4",
    "agora-owned-gallery-4.jpg",
    "Agora social gallery four",
    "agoraApparelSocialGallery",
  ),
  cmsAsset(
    "agora-owned-gallery-5",
    "agora-owned-gallery-5.jpg",
    "Agora social gallery five",
    "agoraApparelSocialGallery",
  ),
  productAsset(
    "agora-owned-product-linen-wrap-dress-primary",
    "agora-owned-product-linen-wrap-dress-primary.jpg",
    "Linen Wrap Dress primary image",
    "agoraLinenWrapDress",
  ),
  productAsset(
    "agora-owned-product-satin-midi-dress-primary",
    "agora-owned-product-satin-midi-dress-primary.jpg",
    "Satin Midi Dress primary image",
    "agoraSatinMidiDress",
  ),
  productAsset(
    "agora-owned-product-ribbed-knit-top-primary",
    "agora-owned-product-ribbed-knit-top-primary.jpg",
    "Ribbed Knit Top primary image",
    "agoraRibbedKnitTop",
  ),
  productAsset(
    "agora-owned-product-cotton-poplin-shirt-primary",
    "agora-owned-product-cotton-poplin-shirt-primary.jpg",
    "Cotton Poplin Shirt primary image",
    "agoraCottonPoplinShirtWomen",
  ),
  productAsset(
    "agora-owned-product-soft-leather-tote-primary",
    "agora-owned-product-soft-leather-tote-primary.jpg",
    "Soft Leather Tote primary image",
    "agoraLeatherTote",
  ),
  productAsset(
    "agora-owned-product-printed-silk-scarf-primary",
    "agora-owned-product-printed-silk-scarf-primary.jpg",
    "Printed Silk Scarf primary image",
    "agoraSilkScarf",
  ),
  productAsset(
    "agora-owned-product-oxford-shirt-primary",
    "agora-owned-product-oxford-shirt-primary.jpg",
    "Oxford Shirt primary image",
    "agoraOxfordShirt",
  ),
  productAsset(
    "agora-owned-product-linen-camp-shirt-primary",
    "agora-owned-product-linen-camp-shirt-primary.jpg",
    "Linen Camp Shirt primary image",
    "agoraLinenCampShirt",
  ),
  productAsset(
    "agora-owned-product-tailored-chino-primary",
    "agora-owned-product-tailored-chino-primary.jpg",
    "Tailored Chino primary image",
    "agoraTailoredChino",
  ),
  productAsset(
    "agora-owned-product-relaxed-trouser-primary",
    "agora-owned-product-relaxed-trouser-primary.jpg",
    "Relaxed Trouser primary image",
    "agoraRelaxedTrouser",
  ),
  productAsset(
    "agora-owned-product-canvas-utility-belt-primary",
    "agora-owned-product-canvas-utility-belt-primary.jpg",
    "Canvas Utility Belt primary image",
    "agoraCanvasBelt",
  ),
  productAsset(
    "agora-owned-product-fine-wool-cap-primary",
    "agora-owned-product-fine-wool-cap-primary.jpg",
    "Fine Wool Cap primary image",
    "agoraWoolCap",
  ),
  productAsset(
    "agora-owned-product-stretch-strap-top-primary",
    "agora-owned-product-stretch-strap-top-primary.jpg",
    "Stretch Strap Top primary image",
    "agoraStretchStrapTop",
  ),
  productAsset(
    "agora-owned-product-ramie-shirt-with-pockets-primary",
    "agora-owned-product-ramie-shirt-with-pockets-primary.jpg",
    "Ramie Shirt With Pockets primary image",
    "agoraRamiePocketShirt",
  ),
  productAsset(
    "agora-owned-product-rattan-bag-with-handle-primary",
    "agora-owned-product-rattan-bag-with-handle-primary.jpg",
    "Rattan Bag With Handle primary image",
    "agoraRattanHandleBag",
  ),
  productAsset(
    "agora-owned-product-striped-knit-dress-primary",
    "agora-owned-product-striped-knit-dress-primary.jpg",
    "Striped Knit Dress primary image",
    "agoraStripedKnitDress",
  ),
  productAsset(
    "agora-owned-product-belt-wrap-dress-primary",
    "agora-owned-product-belt-wrap-dress-primary.jpg",
    "Belt Wrap Dress primary image",
    "agoraBeltWrapDress",
  ),
  productAsset(
    "agora-owned-product-double-button-trench-coat-primary",
    "agora-owned-product-double-button-trench-coat-primary.jpg",
    "Double-button Trench Coat primary image",
    "agoraDoubleButtonTrench",
  ),
  productAsset(
    "agora-owned-product-buttoned-cotton-shirt-primary",
    "agora-owned-product-buttoned-cotton-shirt-primary.jpg",
    "Buttoned Cotton Shirt primary image",
    "agoraButtonedCottonShirt",
  ),
  productAsset(
    "agora-owned-product-layered-tank-top-primary",
    "agora-owned-product-layered-tank-top-primary.jpg",
    "Layered Tank Top primary image",
    "agoraLayeredTankTop",
  ),
  productAsset(
    "agora-owned-product-pleated-knit-dress-primary",
    "agora-owned-product-pleated-knit-dress-primary.jpg",
    "Pleated Knit Dress primary image",
    "agoraPleatedKnitDress",
  ),
  productAsset(
    "agora-owned-product-minimal-slip-dress-primary",
    "agora-owned-product-minimal-slip-dress-primary.jpg",
    "Minimal Slip Dress primary image",
    "agoraMinimalSlipDress",
  ),
  productAsset(
    "agora-owned-product-collar-knit-cardigan-primary",
    "agora-owned-product-collar-knit-cardigan-primary.jpg",
    "Collar Knit Cardigan primary image",
    "agoraCollarKnitCardigan",
  ),
  productAsset(
    "agora-owned-product-soft-shoulder-bag-primary",
    "agora-owned-product-soft-shoulder-bag-primary.jpg",
    "Soft Shoulder Bag primary image",
    "agoraSoftShoulderBag",
  ),
  productAsset(
    "agora-owned-product-summer-knit-vest-primary",
    "agora-owned-product-summer-knit-vest-primary.jpg",
    "Summer Knit Vest primary image",
    "agoraSummerKnitVest",
  ),
  productAsset(
    "agora-owned-product-tailored-sleeveless-top-primary",
    "agora-owned-product-tailored-sleeveless-top-primary.jpg",
    "Tailored Sleeveless Top primary image",
    "agoraTailoredSleevelessTop",
  ),
  productAsset(
    "agora-owned-product-wide-leg-linen-pant-primary",
    "agora-owned-product-wide-leg-linen-pant-primary.jpg",
    "Wide-leg Linen Pant primary image",
    "agoraWideLegLinenPant",
  ),
  productAsset(
    "agora-owned-product-textured-crossbody-bag-primary",
    "agora-owned-product-textured-crossbody-bag-primary.jpg",
    "Textured Crossbody Bag primary image",
    "agoraTexturedCrossbodyBag",
  ),
  productAsset(
    "agora-owned-product-minimal-ballet-flat-primary",
    "agora-owned-product-minimal-ballet-flat-primary.jpg",
    "Minimal Ballet Flat primary image",
    "agoraMinimalBalletFlat",
  ),
  productAsset(
    "agora-owned-product-open-weave-cardigan-primary",
    "agora-owned-product-open-weave-cardigan-primary.jpg",
    "Open Weave Cardigan primary image",
    "agoraOpenWeaveCardigan",
  ),
  productAsset(
    "agora-owned-product-refined-short-sleeve-dress-primary",
    "agora-owned-product-refined-short-sleeve-dress-primary.jpg",
    "Refined Short-sleeve Dress primary image",
    "agoraRefinedShortSleeveDress",
  ),
  productAsset(
    "agora-owned-product-gold-frame-sunglasses-primary",
    "agora-owned-product-gold-frame-sunglasses-primary.jpg",
    "Gold Frame Sunglasses primary image",
    "agoraGoldFrameSunglasses",
  ),
  productAsset(
    "agora-owned-product-soft-ribbed-dress-primary",
    "agora-owned-product-soft-ribbed-dress-primary.jpg",
    "Soft Ribbed Dress primary image",
    "agoraSoftRibbedDress",
  ),
  productAsset(
    "agora-owned-product-relaxed-cotton-tee-primary",
    "agora-owned-product-relaxed-cotton-tee-primary.jpg",
    "Relaxed Cotton Tee primary image",
    "agoraRelaxedCottonTee",
  ),
  productAsset(
    "agora-owned-product-compact-crossbody-bag-primary",
    "agora-owned-product-compact-crossbody-bag-primary.jpg",
    "Compact Crossbody Bag primary image",
    "agoraCompactCrossbody",
  ),
  productAsset(
    "agora-owned-product-sculpted-hoop-earrings-primary",
    "agora-owned-product-sculpted-hoop-earrings-primary.jpg",
    "Sculpted Hoop Earrings primary image",
    "agoraSculptedHoopEarrings",
  ),
  productAsset(
    "agora-owned-product-everyday-column-dress-primary",
    "agora-owned-product-everyday-column-dress-primary.jpg",
    "Everyday Column Dress primary image",
    "agoraEverydayColumnDress",
  ),
  productAsset(
    "agora-owned-product-sheer-ramie-shirt-primary",
    "agora-owned-product-sheer-ramie-shirt-primary.jpg",
    "Sheer Ramie Shirt primary image",
    "agoraSheerRamieShirt",
  ),
  productAsset(
    "agora-owned-product-fine-knit-polo-primary",
    "agora-owned-product-fine-knit-polo-primary.jpg",
    "Fine Knit Polo primary image",
    "agoraFineKnitPolo",
  ),
  productAsset(
    "agora-owned-product-natural-canvas-tote-primary",
    "agora-owned-product-natural-canvas-tote-primary.jpg",
    "Natural Canvas Tote primary image",
    "agoraNaturalCanvasTote",
  ),
  productAsset(
    "agora-owned-product-luxe-wrap-top-primary",
    "agora-owned-product-luxe-wrap-top-primary.jpg",
    "Luxe Wrap Top primary image",
    "agoraLuxeWrapTop",
  ),
  productAsset(
    "agora-owned-product-pearl-trim-cardigan-primary",
    "agora-owned-product-pearl-trim-cardigan-primary.jpg",
    "Pearl Trim Cardigan primary image",
    "agoraPearlTrimCardigan",
  ),
  productAsset(
    "agora-owned-product-bias-cut-midi-skirt-primary",
    "agora-owned-product-bias-cut-midi-skirt-primary.jpg",
    "Bias-cut Midi Skirt primary image",
    "agoraBiasCutMidiSkirt",
  ),
  productAsset(
    "agora-owned-product-textured-knit-pullover-primary",
    "agora-owned-product-textured-knit-pullover-primary.jpg",
    "Textured Knit Pullover primary image",
    "agoraTexturedKnitPullover",
  ),
  productAsset(
    "agora-owned-product-polished-mini-bag-primary",
    "agora-owned-product-polished-mini-bag-primary.jpg",
    "Polished Mini Bag primary image",
    "agoraPolishedMiniBag",
  ),
  productAsset(
    "agora-owned-product-clean-line-blazer-primary",
    "agora-owned-product-clean-line-blazer-primary.jpg",
    "Clean-line Blazer primary image",
    "agoraCleanLineBlazer",
  ),
  productAsset(
    "agora-owned-product-soft-linen-short-primary",
    "agora-owned-product-soft-linen-short-primary.jpg",
    "Soft Linen Short primary image",
    "agoraSoftLinenShort",
  ),
  productAsset(
    "agora-owned-product-classic-denim-shirt-primary",
    "agora-owned-product-classic-denim-shirt-primary.jpg",
    "Classic Denim Shirt primary image",
    "agoraClassicDenimShirt",
  ),
  productAsset(
    "agora-owned-product-overshirt-jacket-primary",
    "agora-owned-product-overshirt-jacket-primary.jpg",
    "Overshirt Jacket primary image",
    "agoraOvershirtJacket",
  ),
  productAsset(
    "agora-owned-product-slim-cotton-trouser-primary",
    "agora-owned-product-slim-cotton-trouser-primary.jpg",
    "Slim Cotton Trouser primary image",
    "agoraSlimCottonTrouser",
  ),
  productAsset(
    "agora-owned-product-relaxed-polo-shirt-primary",
    "agora-owned-product-relaxed-polo-shirt-primary.jpg",
    "Relaxed Polo Shirt primary image",
    "agoraRelaxedPoloShirt",
  ),
  productAsset(
    "agora-owned-product-washed-chore-jacket-primary",
    "agora-owned-product-washed-chore-jacket-primary.jpg",
    "Washed Chore Jacket primary image",
    "agoraWashedChoreJacket",
  ),
  productAsset(
    "agora-owned-product-everyday-crew-neck-primary",
    "agora-owned-product-everyday-crew-neck-primary.jpg",
    "Everyday Crew Neck primary image",
    "agoraEverydayCrewNeck",
  ),
  productAsset(
    "agora-owned-product-utility-cargo-trouser-primary",
    "agora-owned-product-utility-cargo-trouser-primary.jpg",
    "Utility Cargo Trouser primary image",
    "agoraUtilityCargoTrouser",
  ),
  productAsset(
    "agora-owned-product-leather-card-holder-primary",
    "agora-owned-product-leather-card-holder-primary.jpg",
    "Leather Card Holder primary image",
    "agoraLeatherCardHolder",
  ),
  productAsset(
    "agora-owned-product-signature-sunglasses-primary",
    "agora-owned-product-signature-sunglasses-primary.jpg",
    "Signature Sunglasses primary image",
    "agoraSignatureSunglasses",
  ),
  productAsset(
    "agora-owned-product-neutral-shoulder-bag-primary",
    "agora-owned-product-neutral-shoulder-bag-primary.jpg",
    "Neutral Shoulder Bag primary image",
    "agoraNeutralShoulderBag",
  ),
  productAsset(
    "agora-owned-product-modern-knit-set-primary",
    "agora-owned-product-modern-knit-set-primary.jpg",
    "Modern Knit Set primary image",
    "agoraModernKnitSet",
  ),
]);
