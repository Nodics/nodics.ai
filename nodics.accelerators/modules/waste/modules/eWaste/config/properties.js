/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";

/** @module eWaste/config/properties @description Defines reusable e-waste defaults and project-injectable integration seams. @layer config @owner eWaste @override Later layers supply application codes, valuation services, marketplace policy and contextual guidance. */
module.exports = {
  copilot: { providers: { profiles: {
    eWasteEnvironmentalAssessment: { maximumOutputTokens: 10000, structuredOutput: true, webSearch: true, reasoningEffort: "medium" },
  } } },
  waste: {
    reviewWorkspace: {
      views: {
        "ewaste.overview": {
          ownerModule: "eWaste",
          label: "Electronics overview",
          mode: "OVERVIEW",
          familyCode: "ELECTRONICS",
        },
        "ewaste.submissions": {
          ownerModule: "eWaste",
          label: "Electronics submissions",
          mode: "SUBMISSIONS",
          familyCode: "ELECTRONICS",
        },
        "ewaste.reviewQueue": {
          ownerModule: "eWaste",
          label: "Electronics review queue",
          mode: "REVIEW_QUEUE",
          familyCode: "ELECTRONICS",
        },
      },
    },
  },

  wasteSubmission: {
    requireEnvironmentalAssessment: true,
    metadataSuggestion: {
      subjectLabel: "electronic item",
      allowBundles: true,
      manualReviewFallback: true,
      allowedFamilyCodes: ["ELECTRONICS", "BATTERY"],
      fallbackItemTypeCode: "UNKNOWN_ELECTRONIC_ITEM",
    },
  },
  wasteImpact: {
    calculation: {
      openAiEnvironmental: {
        adapter: "openai", profile: "eWasteEnvironmentalAssessment",
        geography: "Location unspecified; disclose the source geography and do not claim local applicability",
        maximumWeightKg: 10000,
        referenceStartingPoints: ["https://www.epa.gov/system/files/documents/2023-12/warm_electronics_v16_dec.pdf"],
      },
      // EPA WARM v16, December 2023, management practices Exhibit 1-1. Values are tCO2e per US short ton.
      warm: {
        datasetVersion: "EPA_WARM_V16_DEC2023",
        referenceYear: 2023,
        datasetRef: "https://nepis.epa.gov/Exe/ZyPURL.cgi?Dockey=P101982A.txt",
        geography:
          "United States reference factors; local conditions are not modelled",
        baselineScenario: "Landfilling",
        treatmentScenario: "Recycling (assumed future treatment)",
        systemBoundary:
          "WARM life-cycle waste-management comparison, including avoided virgin-material production; collection alone does not establish recycling",
        kgPerShortTon: 907.18474,
        // EPA WARM v16 Energy Impacts Exhibit 7-12; million Btu per US short ton.
        kWhPerMillionBtu: 293.0710701722222,
        energyRows: {
          DESKTOP_CPUS: { landfill: 0.27, recycling: -21.21 },
          PORTABLE_ELECTRONICS: { landfill: 0.27, recycling: -20.95 },
          FLAT_PANEL_DISPLAYS: { landfill: 0.27, recycling: -15.07 },
          CRT_DISPLAYS: { landfill: 0.27, recycling: -7.95 },
          ELECTRONIC_PERIPHERALS: { landfill: 0.27, recycling: -7.88 },
          HARD_COPY_DEVICES: { landfill: 0.27, recycling: -7.91 },
          MIXED_ELECTRONICS: { landfill: 0.27, recycling: -14.02 },
        },
        precision: 6,
        maximumWeightKg: 10000,
        allowPartialAssessment: true,
        rows: {
          DESKTOP_CPUS: { landfill: 0.02, recycling: -1.49 },
          PORTABLE_ELECTRONICS: { landfill: 0.02, recycling: -1.06 },
          FLAT_PANEL_DISPLAYS: { landfill: 0.02, recycling: -0.99 },
          CRT_DISPLAYS: { landfill: 0.02, recycling: -0.57 },
          ELECTRONIC_PERIPHERALS: { landfill: 0.02, recycling: -0.36 },
          HARD_COPY_DEVICES: { landfill: 0.02, recycling: -0.56 },
          MIXED_ELECTRONICS: { landfill: 0.02, recycling: -0.9 },
        },
        // Explicit modelling proxy, not a validated charger-specific coefficient.
        // A disclosed comparison against the EPA reference mix, not an inferred bundle composition.
        bundleReferenceScenario: {
          enabled: true,
          itemTypeCode: "UNKNOWN_ELECTRONIC_ITEM", categoryCode: "MIXED_ELECTRONICS",
          category: "MIXED_ELECTRONICS", version: "MIXED_BUNDLE_REFERENCE_V1",
          explanation: "This comparison uses the EPA mixed-electronics reference mix and your bundle’s total electronic-item weight. Your mix of cables, adapters or devices may differ from the reference mix. The range reflects weight uncertainty only; it does not cover differences in composition or local recycling processes.",
        },
        referenceScenarios: {
          CHARGER: {
            enabled: true, sizeClass: "SMALL", category: "ELECTRONIC_PERIPHERALS",
            version: "SMALL_CHARGER_REFERENCE_V1", minKg: 0.05, maxKg: 0.15,
            explanation: "Reference scenario: WARM electronic peripherals proxy, not a charger-specific factor. Assumed 50–150 g per small charger; modelling bounds, not measured weight or a statistical confidence interval.",
            weightSource: "Samsung published adapter examples: 87.7 g (25W) and 92.5 g (45W); expanded modelling assumption 50–150 g.",
            weightSourceRef: "https://www.samsung.com/ie/mobile-accessories/25w-power-adapter-black-ep-t2510xbeggb/",
            comparisonSourceRef: "https://www.samsung.com/za/business/mobile-accessories/45w-power-adapter-black-ep-t4511nbegww/",
          },
        },
        itemTypes: {
          MOBILE_PHONE: "PORTABLE_ELECTRONICS",
          SMARTPHONE: "PORTABLE_ELECTRONICS",
          FEATURE_PHONE: "PORTABLE_ELECTRONICS",
          LAPTOP: "PORTABLE_ELECTRONICS",
          TABLET_DEVICE: "PORTABLE_ELECTRONICS",
          DESKTOP_TOWER: "DESKTOP_CPUS",
        },
        // Display technology must be known before selecting a display-specific factor.
        categories: {
          MOBILE_DEVICE: "PORTABLE_ELECTRONICS",
          LAPTOP_COMPUTER: "PORTABLE_ELECTRONICS",
          TABLET: "PORTABLE_ELECTRONICS",
          DESKTOP_COMPUTER: "DESKTOP_CPUS",
          // An unidentified item does not establish the composition of a mixed electronics load.
        },
      },
      environmentalAssessment: {
        enabled: true,
        version: "EWASTE_ENVIRONMENTAL_V1",
        // Presentation mappings reference provider metrics; they supply no factors or measurements.
        indicators: {
          recyclingInputMass: {
            metricCode: "POTENTIAL_RECYCLING_INPUT_KG", label: "E-waste available for recycling",
            unitOfMeasure: "KG", requirements: ["Item weight or a disclosed reference-weight assumption"],
          },
          recyclingItemCount: {
            metricCode: "RECYCLING_INPUT_ITEM_COUNT", label: "Items in this assessment",
            unitOfMeasure: "EACH", requirements: ["Item count"],
          },
          avoidedEmissions: {
            metricCode: "ESTIMATED_CO2E_SAVED_KG",
            label: "Potential CO₂e savings",
            unitOfMeasure: "KG_CO2E",
            requirements: [
              "Item weight and composition",
              "Baseline and treatment scenarios",
              "Applicable emissions factors",
            ],
          },
          carbonEquivalent: {
            metricCode: "CARBON_EQUIVALENT_TCO2E",
            label: "Carbon equivalent",
            unitOfMeasure: "T_CO2E",
            requirements: ["Calculated CO₂e savings"],
          },
          baselineEmissions: {
            metricCode: "BASELINE_EMISSIONS_KG_CO2E",
            label: "Baseline emissions",
            unitOfMeasure: "KG_CO2E",
            requirements: [
              "Defined baseline scenario",
              "Methodology and geographic scope",
            ],
          },
          processingEmissions: {
            metricCode: "PROCESSING_EMISSIONS_KG_CO2E",
            label: "Treatment and recycling emissions",
            unitOfMeasure: "KG_CO2E",
            requirements: [
              "Treatment process and energy use",
              "Applicable emissions factors",
            ],
          },
          transportEmissions: {
            metricCode: "TRANSPORT_EMISSIONS_KG_CO2E",
            label: "Transport emissions",
            unitOfMeasure: "KG_CO2E",
            requirements: [
              "Distance, transport mode and load allocation",
              "Applicable transport factors",
            ],
          },
          netEmissionsBenefit: {
            metricCode: "NET_EMISSIONS_BENEFIT_KG_CO2E",
            label: "Net emissions benefit",
            unitOfMeasure: "KG_CO2E",
            allowNegative: true,
            requirements: [
              "Comparable baseline and intervention boundaries",
              "Treatment and transport emissions",
            ],
          },
          energySaved: {
            metricCode: "ENERGY_SAVED_KWH",
            label: "Energy saved",
            unitOfMeasure: "KWH",
            requirements: [
              "Applicable energy assessment",
              "Baseline and treatment scenarios",
            ],
          },
          waterSaved: {
            metricCode: "WATER_SAVED_L",
            label: "Water saved",
            unitOfMeasure: "L",
            requirements: [
              "Applicable water-use assessment",
              "Geography and process boundaries",
            ],
          },
          wasteDiverted: {
            metricCode: "DIVERTED_FROM_LANDFILL_KG",
            label: "Waste diverted from landfill",
            unitOfMeasure: "KG",
            requirements: [
              "Measured weight",
              "Confirmed treatment destination and baseline",
            ],
          },
          recoverableMaterials: {
            metricCode: "RECOVERABLE_MATERIAL_ESTIMATE_KG",
            label: "Recoverable materials",
            unitOfMeasure: "KG",
            requirements: [
              "Material composition and weight",
              "Recovery process and yield",
            ],
          },
          virginMaterialsAvoided: {
            metricCode: "VIRGIN_MATERIALS_AVOIDED_KG",
            label: "Virgin material use avoided",
            unitOfMeasure: "KG",
            requirements: [
              "Recovered material quality and yield",
              "Substitution methodology",
            ],
          },
          hazardousWasteManaged: {
            metricCode: "HAZARDOUS_WASTE_MANAGED_KG",
            label: "Hazardous waste safely managed",
            unitOfMeasure: "KG",
            requirements: [
              "Verified hazardous-content assessment",
              "Measured weight and authorized treatment evidence",
            ],
          },
        },
      },
    },
  },
  eWaste: {
    rewardRules: {
      propertyProviderCode: "eWaste.reward",
      policyType: "REWARD_SCORING",
      defaultPlatformScopeCode: "DEFAULT",
      domainScopeCode: "ELECTRONICS",
    },
    preparation: {
      maximumPhotoBytes: 5242880,
      permission: "waste.submission.create",
    },
    customerWorkspace: {
      defaultPageSize: 12,
      maximumPageSize: 48,
      maximumPage: 10000,
      maximumQueryLength: 180,
      draftStates: [
        "DRAFT",
        "MEDIA_STAGED",
        "METADATA_SUGGESTED",
        "AWAITING_SUBMITTER_CONFIRMATION",
      ],
      statuses: {
        submissions: [
          { code: "ALL", label: "All items" },
          { code: "PENDING", label: "In review" },
          { code: "APPROVED", label: "Approved" },
          { code: "REJECTED", label: "Rejected" },
        ],
        drafts: [
          { code: "ALL", label: "All drafts" },
          { code: "DRAFT", label: "Getting started" },
          { code: "MEDIA_STAGED", label: "Photo saved" },
          { code: "METADATA_SUGGESTED", label: "Details to check" },
          { code: "AWAITING_SUBMITTER_CONFIRMATION", label: "Ready to submit" },
        ],
        assets: [
          { code: "ALL", label: "All assets" },
          { code: "OWNED", label: "Owned" },
          { code: "LISTING_REQUESTED", label: "Listing in progress" },
          { code: "LISTED", label: "Listed for trade" },
          { code: "GIFT_PENDING", label: "Gift in progress" },
          { code: "GIFTED", label: "Received as gift" },
          { code: "SOLD", label: "Purchased" },
        ],
      },
      statusLabels: {
        DRAFT: { label: "Draft", tone: "neutral" },
        MEDIA_STAGED: { label: "Photo saved", tone: "neutral" },
        METADATA_SUGGESTED: { label: "Details to check", tone: "neutral" },
        AWAITING_SUBMITTER_CONFIRMATION: {
          label: "Ready to submit",
          tone: "neutral",
        },
        SUBMITTED: { label: "Awaiting review", tone: "pending" },
        UNDER_REVIEW: { label: "Under review", tone: "pending" },
        CHANGES_REQUESTED: { label: "Changes requested", tone: "pending" },
        APPROVED: { label: "Approved", tone: "positive" },
        REJECTED: { label: "Rejected", tone: "negative" },
        OWNED: { label: "Owned", tone: "positive" },
        LISTING_REQUESTED: { label: "Listing in progress", tone: "pending" },
        LISTED: { label: "Listed for trade", tone: "trade" },
        GIFT_PENDING: { label: "Gift in progress", tone: "pending" },
        GIFTED: { label: "Received as gift", tone: "positive" },
        SOLD: { label: "Purchased", tone: "positive" },
      },
      sorts: [
        { code: "RECENT", label: "Recently updated" },
        { code: "OLDEST", label: "Oldest update first" },
      ],
      actions: {
        continue: "Continue draft",
        list: "List for trade",
        gift: "Gift this asset",
        resumeListing: "Resume listing",
        openListing: "View trade listing",
      },
      history: {
        submitted: "Submitted for review",
        reviewed: "Review completed",
      },
      nextSteps: {
        DEFAULT: {
          title: "Your item, recorded",
          description:
            "Open the details to follow the current status and available next steps.",
        },
        DRAFT: {
          title: "Ready when you are",
          description:
            "Continue your saved draft to add a photo and check your item details.",
        },
        MEDIA_STAGED: {
          title: "Your photo is saved",
          description:
            "Continue your draft to identify the item and review its details.",
        },
        METADATA_SUGGESTED: {
          title: "Check your item",
          description:
            "Review the suggested name and description before submitting.",
        },
        AWAITING_SUBMITTER_CONFIRMATION: {
          title: "One final check",
          description:
            "Continue your draft and confirm when the details are ready.",
        },
        SUBMITTED: {
          title: "With the review team",
          description:
            "Your submission is saved. The team will review the evidence and record its decision here.",
        },
        UNDER_REVIEW: {
          title: "Review in progress",
          description:
            "The collection team is checking your item. Your submitted details are preserved.",
        },
        CHANGES_REQUESTED: {
          title: "Your item needs attention",
          description: "Read the review feedback for the requested next step.",
        },
        APPROVED: {
          title: "A new chapter begins",
          description:
            "Your submission is approved. If an asset has been created and you own it, you can open it below to see available next steps.",
        },
        REJECTED: {
          title: "Read the review feedback",
          description:
            "This submission was not approved. The reviewer’s public feedback explains the outcome.",
        },
        OWNED: {
          title: "Part of your collection",
          description:
            "You own this digital asset. Available transfer actions appear below.",
        },
        LISTING_REQUESTED: {
          title: "Your listing is being prepared",
          description:
            "Publication is in progress. Resume the saved listing when that action is available; it retains your original terms.",
        },
        LISTED: {
          title: "Available for trade",
          description:
            "Your asset is listed. Ownership remains yours until the sale and its settlement complete.",
        },
        GIFT_PENDING: {
          title: "Transfer in progress",
          description:
            "The gift is being settled. Refresh to see the recorded result before starting another action.",
        },
        GIFTED: {
          title: "A gift in your collection",
          description:
            "This digital asset is now yours. Its original approval rewards remain with the contributor.",
        },
        SOLD: {
          title: "Now part of your collection",
          description:
            "You purchased this digital asset. Its original approval rewards remain with the contributor.",
        },
      },
    },
    channelAuthentication: { enabled: false, timeoutMs: 15000, channels: {} },
    presetPack: {
      code: "EWASTE_CORE_PRESETS",
      enabled: true,
      targetModule: "nodics.waste",
    },
    applicationCode: "EWASTE",
    assetCreationPolicyCode: "EWASTE_APPROVED_ASSET_STANDARD",
    rewardValuationService: null,
    targetAuthorities: {},
    marketplace: {
      autoPublishListings: false,
      orderCodePrefix: "EWASTE_ORDER_",
    },
    conversation: {
      rewardGuidance:
        "Rewards and environmental estimates depend on the configured programme and verified assessment. Review the current offer and settlement terms before confirming an action.",
    },
  },

  apiExposure: {
    categories: {
      eWasteCustomer: {
        enabled: true,
      },
      wasteInternal: {
        enabled: true,
      },
    },
  },
};
