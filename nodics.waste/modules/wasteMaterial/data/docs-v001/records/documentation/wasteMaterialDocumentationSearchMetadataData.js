/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @description Canonical module-owned documentation CMS component records. */
module.exports = {
  "nodicsDocsSearchnodenodicsdocsnodepagewastematerialtaxonomyevidence": {
    "code": "nodicsDocsSearchnodenodicsdocsnodepagewastematerialtaxonomyevidence",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePagewasteMaterialTaxonomyEvidence",
    "title": "Waste Material Taxonomy and Evidence",
    "summary": "Waste Material Taxonomy and Evidence: source-backed behavior, ownership, extension, failure handling and acceptance boundaries.",
    "searchText": "Waste Material Taxonomy and Evidence Waste Material Taxonomy and Evidence: source-backed behavior, ownership, extension, failure handling and acceptance boundaries.",
    "keywords": [
      "wasteMaterial",
      "source-backed",
      "ownership",
      "operations"
    ],
    "facets": {
      "nodeLevel": "PAGE_LINK",
      "nodeType": "PAGE",
      "audience": [
        "business",
        "architect",
        "administrator",
        "developer",
        "operator",
        "qa",
        "ai-tool"
      ]
    },
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.search.preview"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "SEARCH_METADATA_CHANGE"
    ],
    "locale": "en",
    "channel": "web",
    "accessPolicy": "nodicsDocsAccessPublic",
    "accessMode": "PUBLIC",
    "lifecycleState": "STAGED",
    "indexState": "INDEX_READY",
    "active": true
  },
  "nodicsDocsSearchpagenodicsdocsmetadatawastematerialtaxonomyevidence": {
    "code": "nodicsDocsSearchpagenodicsdocsmetadatawastematerialtaxonomyevidence",
    "product": "nodicsDocumentationProduct",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadatawasteMaterialTaxonomyEvidence",
    "title": "Waste Material Taxonomy and Evidence",
    "summary": "Waste Material Taxonomy and Evidence: source-backed behavior, ownership, extension, failure handling and acceptance boundaries.",
    "searchText": "Waste Material Taxonomy and Evidence Waste Material Taxonomy and Evidence: source-backed behavior, ownership, extension, failure handling and acceptance boundaries. # Waste Material Taxonomy and Evidence\n\nA beginner should distinguish a material category from evidence about an individual physical item. Start with an active material code and the fields required by the effective schema; then trace which waste capability references it. Naming an item as recyclable does not prove its weight, custody, processing or reward entitlement. Those observations and decisions belong to the separate operational owners referenced below.\n\n## Taxonomy ownership and business purpose\n\nCollection operators use taxonomy to classify an item consistently; customers and reviewers use its descriptor to see which observations are known, inferred or still missing. Partner developers supply actual catalogue records and supported consumer behavior. Start with the recorded facts and review hold, then inspect the owning submission or asset operation before treating the descriptor as verified physical evidence.\n\nwasteMaterial owns reusable families, categories, item types, material types, condition grades and evidence-policy metadata. An accelerator such as eWaste packages industry presets; a partner project supplies its own accepted materials, evidence requirements and operational choices through later data and configuration layers. A taxonomy entry is not a submission, custody receipt, measured impact result or Loyalty posting. Keeping these authorities separate prevents the same material label from becoming a second inventory or reward identity.\n\nThe owning schemas and DefaultWasteItemDescriptorService connect authorized submission or asset facts with taxonomy classification in a versioned item descriptor. It projects identity, classification, materials/components, physical ranges, environmental observations, reward status and evidenceReview. It does not return a dynamic form-property schema or resolve an evidencePolicyCode record; a form consumer must obtain and enforce those requirements through its owning operation. It is not independent confirmation that the user possesses the item, that an image is genuine or that a proposed quantity was weighed. Business users should see the declared requirements and any uncertainty before they submit. Operators retain the actual submission, verification and receipt evidence in the corresponding Waste capabilities rather than attaching operational truth to a CMS guide.\n\n```mermaid\nflowchart LR\n  Family[Waste family] --> Category[Category]\n  Category --> Item[Item type]\n  Material[Material and condition vocabulary] --> Item\n  Item --> Descriptor[Property and evidence descriptor]\n  Descriptor --> Submission[Consumer submission form]\n  Submission --> Verification[Separate verification and custody operations]\n```\n\n## Property coverage and lifecycle\n\nRead the schema definition and the property-coverage contract together before adding metadata. The descriptor normalizes supported facts and configured image-review presentation into a consumer contract, so a new property must survive persistence, descriptor projection and the actual form consumer. Adding arbitrary metadata does not automatically add a descriptor field. Adding a label to seed data alone does not establish this end-to-end behavior. Keep property identifiers stable and distinguish machine identity from localized display text; a translated label must not change the key used by validation or existing submissions.\n\nLifecycle policy belongs to the owning records and operations. Do not assume that a record referenced by code is usable merely because it exists. Check the selected item type, parent taxonomy and effective evidence policy through the current operation. A later module can extend supported fields through framework layering, but it must preserve inherited semantics and tests. catalogue reads ACTIVE families, categories, item types and materials in pages of 500, refusing incomplete or over-bound catalogues with ERR_WASTE_CATALOGUE_UNAVAILABLE. It does not load wasteEvidencePolicy or condition-grade records, nor evaluate effectiveFrom/effectiveTo as an extra lifecycle gate. Reusable family and material records stay in business releases such as core-v001 or sample-v001; this explanatory guide stays in docs-v001 and must not be required to install the taxonomy.\n\n| Concern | Owner | Evidence needed |\n| --- | --- | --- |\n| Material vocabulary | wasteMaterial | Schema and governed taxonomy records |\n| Industry presets | Accelerator capability | Explicit selected business release |\n| Image review policy | Descriptor and consumer review contract | Normalized policy plus actual review evidence |\n| Physical receipt | Waste custody capability | Owning transaction evidence |\n| Reward balance | Loyalty | Original append-only ledger posting |\n\n## Image evidence and safe consumer behavior\n\nImage evidence policy describes what the consuming operation needs to collect or review. It does not turn a model description into a verified material measurement. Keep raw evidence under Media and the authorized Waste operation; public CMS pages should use illustrative, non-sensitive assets rather than real employee or customer evidence. A consumer must bind any image review to the exact submitted evidence, selected item type and current operation. A generic picture of an electronic device cannot establish serial identity, ownership, material purity or physical custody.\n\nThe focused wasteImageEvidenceReview regression is the source-backed starting point for supported descriptor behavior. When extending policy, exercise absent metadata, malformed structures, unsupported combinations and round-trip persistence rather than only a successful UI fixture. Use explicit requirements so that an omitted review field is distinguishable from an intentional optional field. Do not copy provider SDKs, secrets, external image URLs or executable prompt policy into taxonomy data. Model/provider integration remains behind its canonical Copilot or provider seam and is subject to its own bounds and authorization. normalizeImageEvidence defaults uncertain or malformed classifications to manual review; ITEM_PHOTOGRAPH needs confidence at least minimumPhotoConfidence, default 0.8. A previous manualApprovalRequired hold remains sticky after a replacement photograph or reanalysis. evidenceReview compares the assessed evidence reference code with metadata.photo.code; a mismatch or missing assessment requires manual review. Legacy unassessed records have acknowledgementRequired false, while flagged records require explicit acknowledgement. A recorded manual approval changes explanatory presentation without clearing the historical hold.\n\nFor a partner adding a new accepted device family, first decide which existing category and material vocabulary applies. Prepare stable item-type data and the minimum properties required by the business operation. Review which evidence can be collected safely and which checks require a physical inspection. Import the selected business release into the intended runtime and inspect the normalized descriptor before enabling the form. Then test submission, review and receipt separately. The business benefit is a predictable onboarding path; it is not a promise that taxonomy configuration alone implements the whole collection workflow.\n\n## Verification and troubleshooting\n\nRun wasteItemDescriptorContract and wasteImageEvidenceReview whenever taxonomy metadata changes. Check that every newly supported property survives schema persistence and descriptor projection and is handled by the consuming form. Investigate an absent form field by comparing the stored record, normalized descriptor and consumer version in that order. Investigate rejected evidence through the owning review contract, not by weakening every item type. Keep installed taxonomy inspection permissioned and bounded. A passing source test proves local contract behavior; actual import, Media access, submission authorization, physical verification and Circa browser rendering remain separate acceptance stages.\n\n## Customize and extend safely\n\nAn operator introducing a new material keeps wasteFamily, wasteCategory, wasteItemType and wasteMaterialType records in customer-owned data/<release>/records using stable canonical codes. Policy fields such as requiresBrand and evidencePolicyCode remain taxonomy/consumer contracts, not automatically generated form controls. Put a real reporting-policy difference in later project config/properties.js under wasteMaterial.descriptor; preserve inherited defaults. Extend supported descriptor members only through project src/service/defaultWasteItemDescriptorService.js, with matching persistence and consumer work when a new field is introduced.\n\n```javascript\n// Later project config/properties.js: report more uncertain fact paths.\nmodule.exports = { wasteMaterial: { descriptor: {\n  minimumFieldConfidence: 0.7\n} } };\n// Existing default is 0.6. This changes reporting only;\n// it cannot clear evidence holds, grant approval or calculate impact.\n```\n\nFor a 0.65-confidence weightEstimate, this override adds that fact path to metadataQuality.lowConfidenceFields; missing confidence stays null. Advisory malformed ranges become UNKNOWN, while an invalid operator correction rejects with ERR_WASTE_DESCRIPTOR_INVALID. Supply numeric KG/CM ranges within configured bounds and canonical active material references; correct the actual authorized evidence rather than relaxing all item types. Before approval, confirmedFacts take precedence over draft/suggestion facts. Final reviewedFacts or verifiedFacts take precedence over original snapshots, including explicit empty material lists. Inferred ranges remain advisory; measured weight and deterministic impact retain their separate owners.\n\nUse wasteItemDescriptorContract and wasteImageEvidenceReview plus the Waste Submission schema-key alignment regression to verify normalization, customer allowlists, reviewed precedence and replacement-photo holds. If catalogue projection refuses its bound, inspect record counts and the complete paged read rather than accepting a truncated materials list. Test the consuming submission/review operation separately for permissions, acknowledgements and persistence; descriptor methods alone neither authorize nor approve.\n\n## Documentation selection assets and acceptance\n\nPartner extension guidance: select this capability through the existing module graph and use later project configuration or a loader-visible service extension for an intentional difference. Preserve its canonical identity, independent authorization, bounded inputs and original evidence. Add a focused regression for the changed policy and run the inherited owner tests. Do not fork the framework guide into another module merely to customize branding; reference it from a project guide that explains only the real difference.\n\nThis guide is canonical CMS data owned by wasteMaterial. Its optional CONTENT_PACK lives in data/docs-v001, separate from business DATA_RELEASE sections. A partner importing business records does not need to install this guide. Axis exposes the documentation profile independently and imports its declared CMS closure plus shared scaffold into WCMS Staged. The functional group provides navigation context without owning a duplicate article body. Follow owner-qualified related references for shared behavior; a reference must not silently install another capability pack or create a second implementation.\n\nImages belong to the same documentation release as their owning Media records and declared asset files. Preserve stable Media codes, release-relative asset paths and checksums. Shared images may stay with the explicitly included documentation foundation; capability-specific images stay with that capability. Diagrams and tables are canonical content blocks, not separate Markdown authoring copies. A new screenshot must be privacy-safe, accessible and traceable to the depicted version. An image is explanatory evidence only, not proof that a runtime operation succeeded.\n\nCanonical article corrections require source editorial review before authoring records may be STAGED and the owning route made selectable for normal publication. STAGED and route.active=true express editorial readiness and selection eligibility; they do not approve a Process task, create a live version or prove public delivery. The integration owner refreshes body counts and integrity metadata, declared-file hashes and composed checksums, validates references and the selected release, then imports and follows normal review, approval and publication. Preserve empty reviewer/approver fields and existing audit evidence until the owning process records real decisions. Installed import, approval, published delivery and signed-in browser acceptance remain separate results.\n\n## Common mistakes\n\nDo not confuse a helper result with a completed authorized business operation. Do not bypass the owning persistence, publication or recovery contract to clear a dashboard. Do not copy shared behavior into an accelerator or put capability data into a composition-only group. Do not treat fixture output, missing measurement or a passing source test as live qualification. Preserve original evidence and report uncertain outcomes without an automatic replay.\n",
    "keywords": [
      "wasteMaterial",
      "source-backed",
      "ownership",
      "operations"
    ],
    "facets": {
      "section": "accelerators-and-industry-solution-templates",
      "group": "accelerators-and-industry-solution-templates",
      "navigationDepth": 2,
      "documentType": "how-to",
      "audience": [
        "business",
        "architect",
        "administrator",
        "developer",
        "operator",
        "qa",
        "ai-tool"
      ],
      "maturityState": "partial"
    },
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.search.preview"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "SEARCH_METADATA_CHANGE"
    ],
    "locale": "en",
    "channel": "web",
    "accessPolicy": "nodicsDocsAccessPublic",
    "accessMode": "PUBLIC",
    "lifecycleState": "STAGED",
    "indexState": "INDEX_READY",
    "active": true
  }
};
