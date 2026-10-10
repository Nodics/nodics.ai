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
  "record0": {
    "code": "nodicsDocsComponentacceleratorsCircaCollectionReference",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "accelerators.circa-collection-reference",
      "title": "Circa Collection-Centre Record Reference",
      "route": "/docs/framework/accelerators/circa/collection-reference",
      "section": "accelerators-and-industry-solution-templates",
      "sectionTitle": "Accelerators and Industry Solution Templates",
      "group": "accelerators-and-industry-solution-templates",
      "groupTitle": "Accelerators and Industry Solution Templates",
      "parentId": "accelerators-and-industry-solution-templates",
      "hierarchyPath": [
        "Accelerators and Industry Solution Templates",
        "Circa Collection-Centre Record Reference"
      ],
      "hierarchyDepth": 2,
      "documentType": "configuration",
      "audience": [
        "business",
        "architect",
        "administrator",
        "developer",
        "operator",
        "qa",
        "ai-tool"
      ],
      "businessAudience": [],
      "technicalAudience": [],
      "summary": "Exact authored collection point identities, coordinates, categories, operator and infrastructure-owner relationships.",
      "visibility": "public",
      "accessMode": "PUBLIC",
      "publiclyAvailable": true,
      "requiresAuthentication": false,
      "allowedRoles": [],
      "allowedGroups": [],
      "allowedPermissions": [],
      "lifecycleState": "ONLINE",
      "version": "0.16.16",
      "maturityState": "partial",
      "implementationState": "current",
      "renderingComponent": "documentation.component.article",
      "relatedPages": [
        "accelerators.circa-overview",
        "accelerators.circa-data-network",
        "accelerators.circa-customization"
      ],
      "sourceEvidence": [
        "../../../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/data/manifest.json",
        "package.json",
        "src/service"
      ],
      "visualRequirements": [
        "table"
      ],
      "searchKeywords": [
        "circa",
        "ewaste",
        "collection-reference",
        "configuration",
        "source records"
      ],
      "topicKeywords": [
        "Circa",
        "Source reference"
      ],
      "headings": [
        {
          "text": "How many collection points exist in source?",
          "anchor": "acceleratorsCircaCollectionReference-1-how-many-collection-points-exist-in-source",
          "level": 2
        },
        {
          "text": "Original three Circa points",
          "anchor": "acceleratorsCircaCollectionReference-2-original-three-circa-points",
          "level": 2
        },
        {
          "text": "Accepted category metadata and policy",
          "anchor": "acceleratorsCircaCollectionReference-3-accepted-category-metadata-and-policy",
          "level": 2
        },
        {
          "text": "Shared 17-point network",
          "anchor": "acceleratorsCircaCollectionReference-4-shared-17-point-network",
          "level": 2
        },
        {
          "text": "Sunmarke contribution",
          "anchor": "acceleratorsCircaCollectionReference-5-sunmarke-contribution",
          "level": 2
        },
        {
          "text": "Customize and extend safely",
          "anchor": "acceleratorsCircaCollectionReference-6-customize-and-extend-safely",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "acceleratorsCircaCollectionReference-7-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "acceleratorsCircaCollectionReference-8-verification",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "image",
          "alt": "Collection-point ownership and location relationships",
          "title": "Collection-point ownership and location relationships",
          "mediaCode": "nodicsDocsImage_04cc18321002883fc61a7d99"
        },
        {
          "kind": "paragraph",
          "text": "This source-backed diagram explains ownership and boundaries; it is not live deployment or acceptance evidence. Qualification notes remain part of the flow."
        },
        {
          "kind": "paragraph",
          "text": "This reference answers exactly which collection points the source provides and how their relationships are configured. Beginners must distinguish authored records, selected setup packages, installed records and currently visible eligible centres. The following inventory is source evidence as reviewed on 30 September 2026; it does not assert a live database count or real partner accreditation. Business and operator teams can use it to reconcile a deployment before changing allocations. The business problem is keeping discovery, operational ownership and staff access aligned: a visible centre alone proves neither authorization nor eligible arrival."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "How many collection points exist in source?",
          "anchor": "acceleratorsCircaCollectionReference-1-how-many-collection-points-exist-in-source"
        },
        {
          "kind": "table",
          "headers": [
            "Source contribution",
            "Number",
            "Selection and ownership"
          ],
          "rows": [
            [
              "Circa original `cc-dxb-*` points",
              "3",
              "`circa.ewaste:waste`, optional fresh-environment transaction sample; Location/Profile sections separate"
            ],
            [
              "Shared Waste Collection network",
              "17",
              "Setup selects `wasteCollection:sample-collection-points`, plus shared location/address packages"
            ],
            [
              "Sunmarke school point",
              "1",
              "Separate `sunmarke-waste`, `sunmarke-location`, `sunmarke-profile` manifest sections; not one of the three original points"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "There are 21 distinct authored point codes across those reviewed contributions. The default Circa setup package list selects the shared network and original Circa location data, but Circa Waste transactions are optional. It does not select the three Sunmarke sections in that list. Therefore neither 3, 20 nor 21 is a universal installed/visible count. Installed release receipts, point status/visibility, missing references and owner API filters determine what a customer actually sees."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Original three Circa points",
          "anchor": "acceleratorsCircaCollectionReference-2-original-three-circa-points"
        },
        {
          "kind": "table",
          "headers": [
            "Point code",
            "English name",
            "Location code",
            "Latitude",
            "Longitude"
          ],
          "rows": [
            [
              "cc-dxb-01",
              "Circa Green Hub Al Quoz",
              "cc-dxb-01-location",
              "25.1358",
              "55.2274"
            ],
            [
              "cc-dxb-02",
              "Emirates Circular Drop Box",
              "cc-dxb-02-location",
              "25.0470694",
              "55.243265"
            ],
            [
              "cc-dxb-03",
              "TechCycle Collection Desk",
              "cc-dxb-03-location",
              "25.2515",
              "55.3194"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "All three declare `collectionPointType: COLLECTION_CENTRE`, `operatingStatus: ACTIVE`, `publicVisibility: PUBLIC`, `status: ACTIVE`, `revision: 1` and `active: true`. Each `operatorEnterpriseRef` points to Profile enterprise `default`. None of these three authored point records declares a separate bin-owner reference. Do not infer one from the programme name or assign the shared network's owner automatically."
        },
        {
          "kind": "paragraph",
          "text": "Each `locationRef` has module `locationCore`, schema `location` and its listed code. Each Location points back through `sourceRef` to Waste Collection schema `wasteCollectionPoint` and the original point code. Location declares category WASTE_COLLECTION, type COLLECTION_CENTRE and public visibility. Its `addressRef` targets Profile `cc-dxb-01-address`, `cc-dxb-02-address` or `cc-dxb-03-address`. The authored address lines are Al Quoz Industrial Area 3, First Avenue Mall/Motor City, and Dubai Internet City Building 10 respectively. They are reference data, not independently verified real-world operating arrangements."
        },
        {
          "kind": "paragraph",
          "text": "All three publish a sample opening label Daily 09:00-20:00 and sample telephone metadata. The common acceptance summary is phones, computers and household electronics, with specialist items needing prior arrangement. A label is not time-aware availability or item acceptance enforcement."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Accepted category metadata and policy",
          "anchor": "acceleratorsCircaCollectionReference-3-accepted-category-metadata-and-policy"
        },
        {
          "kind": "paragraph",
          "text": "The original points each list 19 acceptedCategoryCodes: MOBILE_DEVICE, LAPTOP_COMPUTER, TABLET, DESKTOP_COMPUTER, MONITOR_DISPLAY, CABLE_CHARGER, SMALL_APPLIANCE, LITHIUM_BATTERY, POWER_BANK, MIXED_ELECTRONICS, CIRCA_MIX, CIRCA_LARGE_HOUSEHOLD_APPLIANCES, CIRCA_SMALL_HOUSEHOLD_APPLIANCES, CIRCA_IT_EQUIPMENT_INCLUDING_MONITORS, CIRCA_CONSUMER_ELECTRONICS_INCLUDING_TELEVISIONS, CIRCA_TOYS, CIRCA_TOOLS, CIRCA_MONITORING_AND_CONTROL_INSTRUMENTS and CIRCA_AUTOMATIC_DISPENSERS. These metadata values must remain distinct from owner acceptance-rule and preset decisions; do not invent eligibility from displayed text."
        },
        {
          "kind": "paragraph",
          "text": "The Circa policy overlay contributes EWASTE_DROP_OFF_STANDARD and CIRCA_MALL_DROP_OFF. The standard overlay chooses CIRCA_VERIFIED_DEVICE_RECOVERY, rule references EWASTE_DROP_OFF_MOBILE_DEVICE, EWASTE_DROP_OFF_LAPTOP and CIRCA_DROP_OFF_SMART_HOME, and DROP_OFF/RECEIPT/CIRCA_ONBOARDING capabilities. The mall record selects EWASTE_STANDARD_RECEIPT, EWASTE_STANDARD_VERIFICATION and EWASTE_STANDARD_PHOTO, with DROP_OFF/RECEIPT/PUBLIC_COUNTER capabilities. These are policy records, not proof that a specific point has completed receipt or applied every preset."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Shared 17-point network",
          "anchor": "acceleratorsCircaCollectionReference-4-shared-17-point-network"
        },
        {
          "kind": "paragraph",
          "text": "For the following table, each suffix expands to point code `WCP_SAMPLE_COLLECTION_CENTRE_<suffix>` and location code `LOC_SAMPLE_COLLECTION_CENTRE_<suffix>`:"
        },
        {
          "kind": "table",
          "headers": [
            "Suffix",
            "Authored English label"
          ],
          "rows": [
            [
              "YOU_AND_CO",
              "You&Co Collection Centre"
            ],
            [
              "AVERDA_NADD_AL_HAMAR",
              "Averda Recycling Center - Nadd Al Hamar"
            ],
            [
              "AVERDA_METRO_FOOTBRIDGE",
              "Averda Recycling Center - Metro Footbridge"
            ],
            [
              "AVERDA_AL_SAFA",
              "Averda Recycling Center - Al Safa"
            ],
            [
              "AVERDA_AL_SATWA",
              "Averda Recycling Center - Al Satwa"
            ],
            [
              "AVERDA_AL_RASHIDIYA",
              "Averda Recycling Center - Al Rashidiya"
            ],
            [
              "AVERDA_AL_NAHDA_2",
              "Averda Recycling Center - Al Nahda 2"
            ],
            [
              "AVERDA_MUHAISNAH_1",
              "Averda Recycling Center - Muhaisnah 1"
            ],
            [
              "EFATE_DEIRA",
              "EFATE - Deira"
            ],
            [
              "EFATE_SUSTAINABLE_CITY",
              "EFATE - The Sustainable City"
            ],
            [
              "EFATE_RIGGAT_AL_BUTEEN",
              "EFATE - Riggat Al Buteen"
            ],
            [
              "EFATE_DUBAI_MARINA",
              "EFATE - Dubai Marina"
            ],
            [
              "EFATE_AL_QUOZ",
              "EFATE - Al Quoz"
            ],
            [
              "EFATE_AL_QUOZ_1",
              "EFATE - Al Quoz 1"
            ],
            [
              "DU_TELECOM_DIAC",
              "DU Telecom - Dubai International Academic City"
            ],
            [
              "DU_HQ_DUBAI_HILLS",
              "DU HQ - Dubai Hills"
            ],
            [
              "AL_HAWAI_RESIDENCE_BARSHA_HEIGHTS",
              "Al-Hawai Residence - Barsha Heights"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "These sample points reference operator NODICS_WASTE_MANAGEMENT_CO and the separate `assetOwnerEnterpriseRef` infrastructure-owner field referencing BEAH_RECYCLING_SERVICES. Their labels do not establish commercial affiliation with the named places/companies. The enterprise and staff reference guide explains why operator, owner and employee permissions are distinct. Do not rewrite those references based on branding."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Sunmarke contribution",
          "anchor": "acceleratorsCircaCollectionReference-5-sunmarke-contribution"
        },
        {
          "kind": "paragraph",
          "text": "The optional point is `cc-dxb-sunmarke-jvt`, named Sunmarke School, JVT, referencing `cc-dxb-sunmarke-jvt-location` and operator `default`. The selected source location in `sample-v001/sunmarke-location` is latitude 25.0469679, longitude 55.193292, referencing `cc-dxb-sunmarke-jvt-address`. The point has PUBLIC/ACTIVE/sample metadata and the same 19-category list. This documents an authored user-requested local registration, not independently verified school access or installed status."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customize and extend safely",
          "anchor": "acceleratorsCircaCollectionReference-6-customize-and-extend-safely"
        },
        {
          "kind": "paragraph",
          "text": "A developer adds a point in a custom backend data release, with a reviewed unique code, Profile operator, optional separately governed owner, Location and address. For example, a fourth project point must not reuse cc-dxb-03 or overwrite its location. Install the selected owner releases, grant staff resource scopes and validate the point through the current collection/arrival APIs. Source extension alone does not publish it or change current installed records."
        },
        {
          "kind": "paragraph",
          "text": "Reject missing/inactive references, unauthorized operator changes, stale location and wrong-centre scope. Failed installation or arrival preserves existing history; inspect owner receipts before retrying. Test default and custom project layers, exact radius, public/private filtering, address resolution and independent bin ownership."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "acceleratorsCircaCollectionReference-7-common-mistakes"
        },
        {
          "kind": "paragraph",
          "text": "Reporting three as the entire network; reporting all source points as installed; using map camera coordinates; treating accepted-category copy as policy; using operator enterprise as automatic bin owner; and widening employee scope to repair a missing point are incorrect. Coordinate edits require approved owner mutation."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "acceleratorsCircaCollectionReference-8-verification"
        },
        {
          "kind": "paragraph",
          "text": "Source files are Circa manifest-selected Waste/Location/Profile records and shared Waste Collection sample records. DevOps must reconcile installed receipts and fresh owner projections independently. Live counts and geography were not queried for this documentation update. See [enterprise/staff references](/docs/framework/accelerators/circa/enterprise-reference), [source inventory](/docs/framework/accelerators/circa/source-inventory) and [data overview](/docs/framework/accelerators/circa/data-network)."
        }
      ],
      "searchText": "Circa Collection-Centre Record Reference Exact authored collection point identities, coordinates, categories, operator and infrastructure-owner relationships. # Circa Collection-Centre Record Reference\n\n![Collection-point ownership and location relationships](media:nodicsDocsImage_04cc18321002883fc61a7d99)\n\nThis source-backed diagram explains ownership and boundaries; it is not live deployment or acceptance evidence. Qualification notes remain part of the flow.\n\nThis reference answers exactly which collection points the source provides and how their relationships are configured. Beginners must distinguish authored records, selected setup packages, installed records and currently visible eligible centres. The following inventory is source evidence as reviewed on 30 September 2026; it does not assert a live database count or real partner accreditation. Business and operator teams can use it to reconcile a deployment before changing allocations. The business problem is keeping discovery, operational ownership and staff access aligned: a visible centre alone proves neither authorization nor eligible arrival.\n\n## How many collection points exist in source?\n\n| Source contribution | Number | Selection and ownership |\n| --- | --- | --- |\n| Circa original `cc-dxb-*` points | 3 | `circa.ewaste:waste`, optional fresh-environment transaction sample; Location/Profile sections separate |\n| Shared Waste Collection network | 17 | Setup selects `wasteCollection:sample-collection-points`, plus shared location/address packages |\n| Sunmarke school point | 1 | Separate `sunmarke-waste`, `sunmarke-location`, `sunmarke-profile` manifest sections; not one of the three original points |\n\nThere are 21 distinct authored point codes across those reviewed contributions. The default Circa setup package list selects the shared network and original Circa location data, but Circa Waste transactions are optional. It does not select the three Sunmarke sections in that list. Therefore neither 3, 20 nor 21 is a universal installed/visible count. Installed release receipts, point status/visibility, missing references and owner API filters determine what a customer actually sees.\n\n## Original three Circa points\n\n| Point code | English name | Location code | Latitude | Longitude |\n| --- | --- | --- | --- | --- |\n| cc-dxb-01 | Circa Green Hub Al Quoz | cc-dxb-01-location | 25.1358 | 55.2274 |\n| cc-dxb-02 | Emirates Circular Drop Box | cc-dxb-02-location | 25.0470694 | 55.243265 |\n| cc-dxb-03 | TechCycle Collection Desk | cc-dxb-03-location | 25.2515 | 55.3194 |\n\nAll three declare `collectionPointType: COLLECTION_CENTRE`, `operatingStatus: ACTIVE`, `publicVisibility: PUBLIC`, `status: ACTIVE`, `revision: 1` and `active: true`. Each `operatorEnterpriseRef` points to Profile enterprise `default`. None of these three authored point records declares a separate bin-owner reference. Do not infer one from the programme name or assign the shared network's owner automatically.\n\nEach `locationRef` has module `locationCore`, schema `location` and its listed code. Each Location points back through `sourceRef` to Waste Collection schema `wasteCollectionPoint` and the original point code. Location declares category WASTE_COLLECTION, type COLLECTION_CENTRE and public visibility. Its `addressRef` targets Profile `cc-dxb-01-address`, `cc-dxb-02-address` or `cc-dxb-03-address`. The authored address lines are Al Quoz Industrial Area 3, First Avenue Mall/Motor City, and Dubai Internet City Building 10 respectively. They are reference data, not independently verified real-world operating arrangements.\n\nAll three publish a sample opening label Daily 09:00-20:00 and sample telephone metadata. The common acceptance summary is phones, computers and household electronics, with specialist items needing prior arrangement. A label is not time-aware availability or item acceptance enforcement.\n\n## Accepted category metadata and policy\n\nThe original points each list 19 acceptedCategoryCodes: MOBILE_DEVICE, LAPTOP_COMPUTER, TABLET, DESKTOP_COMPUTER, MONITOR_DISPLAY, CABLE_CHARGER, SMALL_APPLIANCE, LITHIUM_BATTERY, POWER_BANK, MIXED_ELECTRONICS, CIRCA_MIX, CIRCA_LARGE_HOUSEHOLD_APPLIANCES, CIRCA_SMALL_HOUSEHOLD_APPLIANCES, CIRCA_IT_EQUIPMENT_INCLUDING_MONITORS, CIRCA_CONSUMER_ELECTRONICS_INCLUDING_TELEVISIONS, CIRCA_TOYS, CIRCA_TOOLS, CIRCA_MONITORING_AND_CONTROL_INSTRUMENTS and CIRCA_AUTOMATIC_DISPENSERS. These metadata values must remain distinct from owner acceptance-rule and preset decisions; do not invent eligibility from displayed text.\n\nThe Circa policy overlay contributes EWASTE_DROP_OFF_STANDARD and CIRCA_MALL_DROP_OFF. The standard overlay chooses CIRCA_VERIFIED_DEVICE_RECOVERY, rule references EWASTE_DROP_OFF_MOBILE_DEVICE, EWASTE_DROP_OFF_LAPTOP and CIRCA_DROP_OFF_SMART_HOME, and DROP_OFF/RECEIPT/CIRCA_ONBOARDING capabilities. The mall record selects EWASTE_STANDARD_RECEIPT, EWASTE_STANDARD_VERIFICATION and EWASTE_STANDARD_PHOTO, with DROP_OFF/RECEIPT/PUBLIC_COUNTER capabilities. These are policy records, not proof that a specific point has completed receipt or applied every preset.\n\n## Shared 17-point network\n\nFor the following table, each suffix expands to point code `WCP_SAMPLE_COLLECTION_CENTRE_<suffix>` and location code `LOC_SAMPLE_COLLECTION_CENTRE_<suffix>`:\n\n| Suffix | Authored English label |\n| --- | --- |\n| YOU_AND_CO | You&Co Collection Centre |\n| AVERDA_NADD_AL_HAMAR | Averda Recycling Center - Nadd Al Hamar |\n| AVERDA_METRO_FOOTBRIDGE | Averda Recycling Center - Metro Footbridge |\n| AVERDA_AL_SAFA | Averda Recycling Center - Al Safa |\n| AVERDA_AL_SATWA | Averda Recycling Center - Al Satwa |\n| AVERDA_AL_RASHIDIYA | Averda Recycling Center - Al Rashidiya |\n| AVERDA_AL_NAHDA_2 | Averda Recycling Center - Al Nahda 2 |\n| AVERDA_MUHAISNAH_1 | Averda Recycling Center - Muhaisnah 1 |\n| EFATE_DEIRA | EFATE - Deira |\n| EFATE_SUSTAINABLE_CITY | EFATE - The Sustainable City |\n| EFATE_RIGGAT_AL_BUTEEN | EFATE - Riggat Al Buteen |\n| EFATE_DUBAI_MARINA | EFATE - Dubai Marina |\n| EFATE_AL_QUOZ | EFATE - Al Quoz |\n| EFATE_AL_QUOZ_1 | EFATE - Al Quoz 1 |\n| DU_TELECOM_DIAC | DU Telecom - Dubai International Academic City |\n| DU_HQ_DUBAI_HILLS | DU HQ - Dubai Hills |\n| AL_HAWAI_RESIDENCE_BARSHA_HEIGHTS | Al-Hawai Residence - Barsha Heights |\n\nThese sample points reference operator NODICS_WASTE_MANAGEMENT_CO and the separate `assetOwnerEnterpriseRef` infrastructure-owner field referencing BEAH_RECYCLING_SERVICES. Their labels do not establish commercial affiliation with the named places/companies. The enterprise and staff reference guide explains why operator, owner and employee permissions are distinct. Do not rewrite those references based on branding.\n\n## Sunmarke contribution\n\nThe optional point is `cc-dxb-sunmarke-jvt`, named Sunmarke School, JVT, referencing `cc-dxb-sunmarke-jvt-location` and operator `default`. The selected source location in `sample-v001/sunmarke-location` is latitude 25.0469679, longitude 55.193292, referencing `cc-dxb-sunmarke-jvt-address`. The point has PUBLIC/ACTIVE/sample metadata and the same 19-category list. This documents an authored user-requested local registration, not independently verified school access or installed status.\n\n## Customize and extend safely\n\nA developer adds a point in a custom backend data release, with a reviewed unique code, Profile operator, optional separately governed owner, Location and address. For example, a fourth project point must not reuse cc-dxb-03 or overwrite its location. Install the selected owner releases, grant staff resource scopes and validate the point through the current collection/arrival APIs. Source extension alone does not publish it or change current installed records.\n\nReject missing/inactive references, unauthorized operator changes, stale location and wrong-centre scope. Failed installation or arrival preserves existing history; inspect owner receipts before retrying. Test default and custom project layers, exact radius, public/private filtering, address resolution and independent bin ownership.\n\n## Common mistakes\n\nReporting three as the entire network; reporting all source points as installed; using map camera coordinates; treating accepted-category copy as policy; using operator enterprise as automatic bin owner; and widening employee scope to repair a missing point are incorrect. Coordinate edits require approved owner mutation.\n\n## Verification\n\nSource files are Circa manifest-selected Waste/Location/Profile records and shared Waste Collection sample records. DevOps must reconcile installed receipts and fresh owner projections independently. Live counts and geography were not queried for this documentation update. See [enterprise/staff references](/docs/framework/accelerators/circa/enterprise-reference), [source inventory](/docs/framework/accelerators/circa/source-inventory) and [data overview](/docs/framework/accelerators/circa/data-network).\n",
      "previous": {
        "title": "Copilot Conversation Retention and Recovery",
        "route": "/docs/framework/copilot/retention-lifecycle"
      },
      "next": {
        "title": "Circa Enterprise, Staff and Scope Reference",
        "route": "/docs/framework/accelerators/circa/enterprise-reference"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.accelerators",
        "technicalModule": "eWaste",
        "owner": "eWaste",
        "sourcePath": "data/docs-v001/records/documentation/eWasteDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/eWasteDocumentationComponentData.js",
        "wordCount": 1009,
        "checksum": "b89ad75aa0dd26fc2b1ef4a03a8536a979994f22dc0278b336f8564bda786397"
      },
      "slug": "accelerators-circa-collection-reference",
      "locale": "en",
      "navigationGroup": "Circa eWaste Product",
      "navigationGroupCode": "circa-ewaste-product",
      "navigationGroupOrder": 20,
      "navigationOrder": 80,
      "references": [
        {
          "documentId": "accelerators.circa-overview",
          "owner": "eWaste"
        },
        {
          "documentId": "accelerators.circa-data-network",
          "owner": "eWaste"
        },
        {
          "documentId": "accelerators.circa-customization",
          "owner": "eWaste"
        }
      ]
    },
    "active": true
  },
  "record1": {
    "code": "nodicsDocsComponentacceleratorsCircaEnterpriseReference",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "accelerators.circa-enterprise-reference",
      "title": "Circa Enterprise, Staff and Scope Reference",
      "route": "/docs/framework/accelerators/circa/enterprise-reference",
      "section": "accelerators-and-industry-solution-templates",
      "sectionTitle": "Accelerators and Industry Solution Templates",
      "group": "accelerators-and-industry-solution-templates",
      "groupTitle": "Accelerators and Industry Solution Templates",
      "parentId": "accelerators-and-industry-solution-templates",
      "hierarchyPath": [
        "Accelerators and Industry Solution Templates",
        "Circa Enterprise, Staff and Scope Reference"
      ],
      "hierarchyDepth": 2,
      "documentType": "configuration",
      "audience": [
        "business",
        "architect",
        "administrator",
        "developer",
        "operator",
        "qa",
        "ai-tool"
      ],
      "businessAudience": [],
      "technicalAudience": [],
      "summary": "Enterprise source records, business capabilities, operational employees, resource scopes and ownership alignment caveats.",
      "visibility": "public",
      "accessMode": "PUBLIC",
      "publiclyAvailable": true,
      "requiresAuthentication": false,
      "allowedRoles": [],
      "allowedGroups": [],
      "allowedPermissions": [],
      "lifecycleState": "ONLINE",
      "version": "0.16.16",
      "maturityState": "partial",
      "implementationState": "current",
      "renderingComponent": "documentation.component.article",
      "relatedPages": [
        "accelerators.circa-overview",
        "accelerators.circa-data-network",
        "accelerators.circa-customization"
      ],
      "sourceEvidence": [
        "../../../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "../../../../../nodics.waste/modules/wasteCore/data/core-v001/records/profile/wasteCoreEnterpriseCoreData.js",
        "package.json",
        "src/service"
      ],
      "visualRequirements": [
        "table"
      ],
      "searchKeywords": [
        "circa",
        "ewaste",
        "enterprise-reference",
        "configuration",
        "source records"
      ],
      "topicKeywords": [
        "Circa",
        "Source reference"
      ],
      "headings": [
        {
          "text": "Which enterprises are referenced?",
          "anchor": "acceleratorsCircaEnterpriseReference-1-which-enterprises-are-referenced",
          "level": 2
        },
        {
          "text": "Operator and infrastructure-owner capabilities",
          "anchor": "acceleratorsCircaEnterpriseReference-2-operator-and-infrastructure-owner-capabilities",
          "level": 2
        },
        {
          "text": "Seven operational sample employees",
          "anchor": "acceleratorsCircaEnterpriseReference-3-seven-operational-sample-employees",
          "level": 2
        },
        {
          "text": "Scope and enterprise alignment checks",
          "anchor": "acceleratorsCircaEnterpriseReference-4-scope-and-enterprise-alignment-checks",
          "level": 2
        },
        {
          "text": "Hierarchy and platform authority",
          "anchor": "acceleratorsCircaEnterpriseReference-5-hierarchy-and-platform-authority",
          "level": 2
        },
        {
          "text": "Customize and extend safely",
          "anchor": "acceleratorsCircaEnterpriseReference-6-customize-and-extend-safely",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "acceleratorsCircaEnterpriseReference-7-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "acceleratorsCircaEnterpriseReference-8-verification",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "image",
          "alt": "Enterprise associations and explicit staff scope",
          "title": "Enterprise associations and explicit staff scope",
          "mediaCode": "nodicsDocsImage_04cc18321002883fc61a7d99"
        },
        {
          "kind": "paragraph",
          "text": "This source-backed diagram explains ownership and boundaries; it is not live deployment or acceptance evidence. Qualification notes remain part of the flow."
        },
        {
          "kind": "paragraph",
          "text": "This page explains the actual enterprise references beneath Circa's sample network, not only the intended operating model. Beginners should separate an enterprise's business roles, its parent relationship, an employee's permission groups and a resource scope assignment. The business value is controlled multi-organization participation without duplicating credentials or silently granting operational access."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Which enterprises are referenced?",
          "anchor": "acceleratorsCircaEnterpriseReference-1-which-enterprises-are-referenced"
        },
        {
          "kind": "table",
          "headers": [
            "Code",
            "Authored name and source",
            "Business roles",
            "Reference use"
          ],
          "rows": [
            [
              "default",
              "Default; Profile init-v001 enterprise initializer",
              "PLATFORM_OWNER",
              "Original three Circa points, optional Sunmarke and Circa Commerce store reference"
            ],
            [
              "NODICS_WASTE_MANAGEMENT_CO",
              "Nodics Waste Management Co.; Waste Core core-v001 contribution to Profile",
              "PROGRAM_OPERATOR, SERVICE_PROVIDER",
              "Operator of shared 17-point network"
            ],
            [
              "BEAH_RECYCLING_SERVICES",
              "BEAH Recycling Services; Waste Core core-v001 contribution to Profile",
              "SERVICE_PROVIDER, ASSET_OWNER, BUSINESS_PARTNER",
              "Shared network infrastructure-owner reference"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "The Circa module's profile sample itself contains three customers and three centre addresses, not three new enterprises. Across the reviewed point/store templates, three distinct enterprise codes are referenced. This is not a count of all enterprise records installed on Platform. The separately discussed seven-enterprise network is a preparation plan, not these persisted source records or an approved import."
        },
        {
          "kind": "paragraph",
          "text": "The initializer enterprise `default` declares `tenant: default:true`, description Default platform owner enterprise, address `defaultEntAddress` and contact `defaultEntContact`. Its capability scope is Profile PLATFORM_OWNER/GLOBAL. The colon-bearing tenant initializer representation is an import-layer value; it must not be copied into a customer HTTP tenant parameter or treated as another company."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Operator and infrastructure-owner capabilities",
          "anchor": "acceleratorsCircaEnterpriseReference-2-operator-and-infrastructure-owner-capabilities"
        },
        {
          "kind": "paragraph",
          "text": "NODICS_WASTE_MANAGEMENT_CO declares Waste Core PROGRAM_OPERATOR/WASTE_MANAGEMENT and SERVICE_PROVIDER/COLLECTION_CENTRE_OPERATION capability scopes. The BEAH reference declares SERVICE_PROVIDER/RECYCLING_SERVICE_OPERATION, ASSET_OWNER/COLLECTION_BIN_OWNERSHIP and BUSINESS_PARTNER/WASTE_MANAGEMENT_PARTNERSHIP. Both authored enterprise records are active with empty addresses/contacts."
        },
        {
          "kind": "paragraph",
          "text": "This demonstrates multi-role enterprises. It does not prove a real BEAH partnership, actual recycling capacity or current contract. A centre's operator reference identifies who operates it; a separately supplied owner reference identifies infrastructure ownership. Neither creates an employee membership or a data-access permission. The original Circa points provide an operator but no independent bin-owner field; that missing information must not be silently filled from shared sample assumptions."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Seven operational sample employees",
          "anchor": "acceleratorsCircaEnterpriseReference-3-seven-operational-sample-employees"
        },
        {
          "kind": "paragraph",
          "text": "The `circa.ewaste:operations` release contains 21 employee records and 22 scope records. The table below preserves the original seven-employee/eight-scope subset; the additional fourteen staff and fourteen enterprise scopes cover the seven partner enterprises. This public guide deliberately omits passwords, credential material and login details. It records stable sample employee codes and permission groups:"
        },
        {
          "kind": "table",
          "headers": [
            "Employee code",
            "userGroups contribution",
            "Scope sample"
          ],
          "rows": [
            [
              "circa-administrator",
              "wasteEnterpriseAdministratorUserGroup",
              "ENTERPRISE/default"
            ],
            [
              "circa-centre-operator",
              "wasteCentreOperatorUserGroup",
              "BUSINESS_UNIT/You&Co shared point code"
            ],
            [
              "circa-verifier",
              "wasteVerifierUserGroup",
              "BUSINESS_UNIT/You&Co shared point code"
            ],
            [
              "circa-approver",
              "wasteApproverUserGroup",
              "BUSINESS_UNIT/You&Co shared point code"
            ],
            [
              "circa-coupon-manager",
              "wasteCouponManagerUserGroup",
              "ENTERPRISE/default"
            ],
            [
              "circa-marketplace-moderator",
              "wasteMarketplaceModeratorUserGroup",
              "ENTERPRISE/default"
            ],
            [
              "circa-auditor",
              "wasteAuditorUserGroup",
              "ENTERPRISE/default"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "The eighth assignment in the original subset is `circa-scope-platform-admin`, targeting the existing platform admin principal with GLOBAL/* scope. It is not an eighth employee record. Assignments in that original subset use principalType human, tenantCode/enterpriseCode default, ALLOW, DIRECT inheritance and ACTIVE status; later partner assignments retain tenantCode default and their exact partner enterpriseCode. The centre scopes explicitly target `WCP_SAMPLE_COLLECTION_CENTRE_YOU_AND_CO`; they do not target cc-dxb-01, cc-dxb-02 or cc-dxb-03. An operator should expect a scope mismatch to reject and review intended allocation, not add unrestricted permissions to make a demo pass."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Scope and enterprise alignment checks",
          "anchor": "acceleratorsCircaEnterpriseReference-4-scope-and-enterprise-alignment-checks"
        },
        {
          "kind": "paragraph",
          "text": "Employee record codes, login/principal identifiers and enterprise memberships are not interchangeable. Scope principalCode must resolve through Profile's canonical principal semantics. Role groups describe permitted actions; operational scope limits where those actions apply. Profile admission, account freshness and route permissions remain independently required."
        },
        {
          "kind": "paragraph",
          "text": "The shared You&Co point references NODICS_WASTE_MANAGEMENT_CO, while these scope templates declare enterpriseCode default. Documenting both facts is not qualification of that cross-reference. Reconcile current installed memberships, target-owner scope semantics and approved staff allocation before operational acceptance. Do not rewrite source or extend access merely because the source records coexist."
        },
        {
          "kind": "paragraph",
          "text": "Circa sets requireScopes and requireVerification true and requireDifferentApprover false. A person with both explicitly authorized permissions may perform both review stages; the false flag does not give an operator the approver group. An enterprise administrator is not automatically a merchant operator at every outlet."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Hierarchy and platform authority",
          "anchor": "acceleratorsCircaEnterpriseReference-5-hierarchy-and-platform-authority"
        },
        {
          "kind": "paragraph",
          "text": "Profile already models superEnterprise/subEnterprises. None of the three enterprise initializer records reviewed here establishes the proposed GreenPerks parent/child network. Consent-based ancestor administration remains an accepted but incompletely enforced framework policy in the current batch. Default-false creation consent must not be assumed to exist as an activated configuration API."
        },
        {
          "kind": "paragraph",
          "text": "Authorized platform super administrators can have independent platform authority; ordinary PLATFORM_OWNER membership/business role cannot manufacture it. Enterprise super administration, employee membership, operational scopes and coupon commercial relationships must remain separate. Session permissions resolve for the selected enterprise, not a union of every membership. Last-super-admin and dependency invalidation improvements still require complete source/installed qualification."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customize and extend safely",
          "anchor": "acceleratorsCircaEnterpriseReference-6-customize-and-extend-safely"
        },
        {
          "kind": "paragraph",
          "text": "A custom project contributes approved enterprise records through Profile-owned data releases, then creates employee identities/memberships through lifecycle owners and assigns bounded operational scopes. A worked example assigns a verifier to a new centre: retain one canonical human identity, select the target enterprise, grant only verification permission and that centre's scope, and confirm approval remains denied. Do not clone an existing password, insert a generic admin or copy the platform GLOBAL scope."
        },
        {
          "kind": "paragraph",
          "text": "Developers test wrong enterprise, wrong centre, missing membership, inactive actor, revoked permission, DENY precedence, stale session and independent valid memberships. Recovery uses the qualified Profile access lifecycle with audit, not direct data editing. Operators inspect effective rights and saved assignments; DevOps preserves the actor and grant history through upgrades."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "acceleratorsCircaEnterpriseReference-7-common-mistakes"
        },
        {
          "kind": "paragraph",
          "text": "Counting customers as enterprises; counting the extra scope as an employee; deriving rights from enterprise roleCodes; assuming the shared operator owns every bin; confusing sample principal login with record code; and granting all descendants because a hierarchy exists violate owner boundaries."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "acceleratorsCircaEnterpriseReference-8-verification"
        },
        {
          "kind": "paragraph",
          "text": "Counts and fields come from Profile default initialization, Waste Core enterprise contribution and Circa operations records. No installed principal/membership inventory or credential validation was performed. Confirm actual mappings through approved owner APIs during joint acceptance. See [collection references](/docs/framework/accelerators/circa/collection-reference), [operations/rewards](/docs/framework/accelerators/circa/operations) and [customization](/docs/framework/accelerators/circa/customization)."
        }
      ],
      "searchText": "Circa Enterprise, Staff and Scope Reference Enterprise source records, business capabilities, operational employees, resource scopes and ownership alignment caveats. # Circa Enterprise, Staff and Scope Reference\n\n![Enterprise associations and explicit staff scope](media:nodicsDocsImage_04cc18321002883fc61a7d99)\n\nThis source-backed diagram explains ownership and boundaries; it is not live deployment or acceptance evidence. Qualification notes remain part of the flow.\n\nThis page explains the actual enterprise references beneath Circa's sample network, not only the intended operating model. Beginners should separate an enterprise's business roles, its parent relationship, an employee's permission groups and a resource scope assignment. The business value is controlled multi-organization participation without duplicating credentials or silently granting operational access.\n\n## Which enterprises are referenced?\n\n| Code | Authored name and source | Business roles | Reference use |\n| --- | --- | --- | --- |\n| default | Default; Profile init-v001 enterprise initializer | PLATFORM_OWNER | Original three Circa points, optional Sunmarke and Circa Commerce store reference |\n| NODICS_WASTE_MANAGEMENT_CO | Nodics Waste Management Co.; Waste Core core-v001 contribution to Profile | PROGRAM_OPERATOR, SERVICE_PROVIDER | Operator of shared 17-point network |\n| BEAH_RECYCLING_SERVICES | BEAH Recycling Services; Waste Core core-v001 contribution to Profile | SERVICE_PROVIDER, ASSET_OWNER, BUSINESS_PARTNER | Shared network infrastructure-owner reference |\n\nThe Circa module's profile sample itself contains three customers and three centre addresses, not three new enterprises. Across the reviewed point/store templates, three distinct enterprise codes are referenced. This is not a count of all enterprise records installed on Platform. The separately discussed seven-enterprise network is a preparation plan, not these persisted source records or an approved import.\n\nThe initializer enterprise `default` declares `tenant: default:true`, description Default platform owner enterprise, address `defaultEntAddress` and contact `defaultEntContact`. Its capability scope is Profile PLATFORM_OWNER/GLOBAL. The colon-bearing tenant initializer representation is an import-layer value; it must not be copied into a customer HTTP tenant parameter or treated as another company.\n\n## Operator and infrastructure-owner capabilities\n\nNODICS_WASTE_MANAGEMENT_CO declares Waste Core PROGRAM_OPERATOR/WASTE_MANAGEMENT and SERVICE_PROVIDER/COLLECTION_CENTRE_OPERATION capability scopes. The BEAH reference declares SERVICE_PROVIDER/RECYCLING_SERVICE_OPERATION, ASSET_OWNER/COLLECTION_BIN_OWNERSHIP and BUSINESS_PARTNER/WASTE_MANAGEMENT_PARTNERSHIP. Both authored enterprise records are active with empty addresses/contacts.\n\nThis demonstrates multi-role enterprises. It does not prove a real BEAH partnership, actual recycling capacity or current contract. A centre's operator reference identifies who operates it; a separately supplied owner reference identifies infrastructure ownership. Neither creates an employee membership or a data-access permission. The original Circa points provide an operator but no independent bin-owner field; that missing information must not be silently filled from shared sample assumptions.\n\n## Seven operational sample employees\n\nThe `circa.ewaste:operations` release contains 21 employee records and 22 scope records. The table below preserves the original seven-employee/eight-scope subset; the additional fourteen staff and fourteen enterprise scopes cover the seven partner enterprises. This public guide deliberately omits passwords, credential material and login details. It records stable sample employee codes and permission groups:\n\n| Employee code | userGroups contribution | Scope sample |\n| --- | --- | --- |\n| circa-administrator | wasteEnterpriseAdministratorUserGroup | ENTERPRISE/default |\n| circa-centre-operator | wasteCentreOperatorUserGroup | BUSINESS_UNIT/You&Co shared point code |\n| circa-verifier | wasteVerifierUserGroup | BUSINESS_UNIT/You&Co shared point code |\n| circa-approver | wasteApproverUserGroup | BUSINESS_UNIT/You&Co shared point code |\n| circa-coupon-manager | wasteCouponManagerUserGroup | ENTERPRISE/default |\n| circa-marketplace-moderator | wasteMarketplaceModeratorUserGroup | ENTERPRISE/default |\n| circa-auditor | wasteAuditorUserGroup | ENTERPRISE/default |\n\nThe eighth assignment in the original subset is `circa-scope-platform-admin`, targeting the existing platform admin principal with GLOBAL/* scope. It is not an eighth employee record. Assignments in that original subset use principalType human, tenantCode/enterpriseCode default, ALLOW, DIRECT inheritance and ACTIVE status; later partner assignments retain tenantCode default and their exact partner enterpriseCode. The centre scopes explicitly target `WCP_SAMPLE_COLLECTION_CENTRE_YOU_AND_CO`; they do not target cc-dxb-01, cc-dxb-02 or cc-dxb-03. An operator should expect a scope mismatch to reject and review intended allocation, not add unrestricted permissions to make a demo pass.\n\n## Scope and enterprise alignment checks\n\nEmployee record codes, login/principal identifiers and enterprise memberships are not interchangeable. Scope principalCode must resolve through Profile's canonical principal semantics. Role groups describe permitted actions; operational scope limits where those actions apply. Profile admission, account freshness and route permissions remain independently required.\n\nThe shared You&Co point references NODICS_WASTE_MANAGEMENT_CO, while these scope templates declare enterpriseCode default. Documenting both facts is not qualification of that cross-reference. Reconcile current installed memberships, target-owner scope semantics and approved staff allocation before operational acceptance. Do not rewrite source or extend access merely because the source records coexist.\n\nCirca sets requireScopes and requireVerification true and requireDifferentApprover false. A person with both explicitly authorized permissions may perform both review stages; the false flag does not give an operator the approver group. An enterprise administrator is not automatically a merchant operator at every outlet.\n\n## Hierarchy and platform authority\n\nProfile already models superEnterprise/subEnterprises. None of the three enterprise initializer records reviewed here establishes the proposed GreenPerks parent/child network. Consent-based ancestor administration remains an accepted but incompletely enforced framework policy in the current batch. Default-false creation consent must not be assumed to exist as an activated configuration API.\n\nAuthorized platform super administrators can have independent platform authority; ordinary PLATFORM_OWNER membership/business role cannot manufacture it. Enterprise super administration, employee membership, operational scopes and coupon commercial relationships must remain separate. Session permissions resolve for the selected enterprise, not a union of every membership. Last-super-admin and dependency invalidation improvements still require complete source/installed qualification.\n\n## Customize and extend safely\n\nA custom project contributes approved enterprise records through Profile-owned data releases, then creates employee identities/memberships through lifecycle owners and assigns bounded operational scopes. A worked example assigns a verifier to a new centre: retain one canonical human identity, select the target enterprise, grant only verification permission and that centre's scope, and confirm approval remains denied. Do not clone an existing password, insert a generic admin or copy the platform GLOBAL scope.\n\nDevelopers test wrong enterprise, wrong centre, missing membership, inactive actor, revoked permission, DENY precedence, stale session and independent valid memberships. Recovery uses the qualified Profile access lifecycle with audit, not direct data editing. Operators inspect effective rights and saved assignments; DevOps preserves the actor and grant history through upgrades.\n\n## Common mistakes\n\nCounting customers as enterprises; counting the extra scope as an employee; deriving rights from enterprise roleCodes; assuming the shared operator owns every bin; confusing sample principal login with record code; and granting all descendants because a hierarchy exists violate owner boundaries.\n\n## Verification\n\nCounts and fields come from Profile default initialization, Waste Core enterprise contribution and Circa operations records. No installed principal/membership inventory or credential validation was performed. Confirm actual mappings through approved owner APIs during joint acceptance. See [collection references](/docs/framework/accelerators/circa/collection-reference), [operations/rewards](/docs/framework/accelerators/circa/operations) and [customization](/docs/framework/accelerators/circa/customization).\n",
      "previous": {
        "title": "Circa Collection-Centre Record Reference",
        "route": "/docs/framework/accelerators/circa/collection-reference"
      },
      "next": {
        "title": "Circa Source Release and Record Inventory",
        "route": "/docs/framework/accelerators/circa/source-inventory"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.accelerators",
        "technicalModule": "eWaste",
        "owner": "eWaste",
        "sourcePath": "data/docs-v001/records/documentation/eWasteDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/eWasteDocumentationComponentData.js",
        "wordCount": 1036,
        "checksum": "f740a1b4473541a72fbd1bf393a83ff8d09d70bf3725bf40149ffe31124724b2"
      },
      "slug": "accelerators-circa-enterprise-reference",
      "locale": "en",
      "navigationGroup": "Circa eWaste Product",
      "navigationGroupCode": "circa-ewaste-product",
      "navigationGroupOrder": 20,
      "navigationOrder": 90,
      "references": [
        {
          "documentId": "accelerators.circa-overview",
          "owner": "eWaste"
        },
        {
          "documentId": "accelerators.circa-data-network",
          "owner": "eWaste"
        },
        {
          "documentId": "accelerators.circa-customization",
          "owner": "eWaste"
        }
      ]
    },
    "active": true
  },
  "record2": {
    "code": "nodicsDocsComponentacceleratorsCircaSourceInventory",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "accelerators.circa-source-inventory",
      "title": "Circa Source Release and Record Inventory",
      "route": "/docs/framework/accelerators/circa/source-inventory",
      "section": "accelerators-and-industry-solution-templates",
      "sectionTitle": "Accelerators and Industry Solution Templates",
      "group": "accelerators-and-industry-solution-templates",
      "groupTitle": "Accelerators and Industry Solution Templates",
      "parentId": "accelerators-and-industry-solution-templates",
      "hierarchyPath": [
        "Accelerators and Industry Solution Templates",
        "Circa Source Release and Record Inventory"
      ],
      "hierarchyDepth": 2,
      "documentType": "operations",
      "audience": [
        "business",
        "architect",
        "administrator",
        "developer",
        "operator",
        "qa",
        "ai-tool"
      ],
      "businessAudience": [],
      "technicalAudience": [],
      "summary": "Manifest versions, destinations, all source record counts, optional packages and publication boundaries.",
      "visibility": "public",
      "accessMode": "PUBLIC",
      "publiclyAvailable": true,
      "requiresAuthentication": false,
      "allowedRoles": [],
      "allowedGroups": [],
      "allowedPermissions": [],
      "lifecycleState": "ONLINE",
      "version": "0.16.16",
      "maturityState": "partial",
      "implementationState": "current",
      "renderingComponent": "documentation.component.article",
      "relatedPages": [
        "accelerators.circa-overview",
        "accelerators.circa-data-network",
        "accelerators.circa-customization"
      ],
      "sourceEvidence": [
        "../../../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/data/manifest.json",
        "package.json",
        "src/service",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/data/sample-v001/commerce/headers/circaCommerceCatalogHeader.js",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/data/sample-v001/commerce/records/circaProductData.js",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/data/sample-v001/commerce/records/circaProductVariantData.js",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/data/sample-v001/commerce/records/circaProductLocalizationData.js",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/data/sample-v001/commerce/records/circaProductVariantLocalizationData.js",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/data/sample-v001/commerce/records/circaPriceRowData.js",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/data/sample-v001/commerce/records/circaPromotionData.js",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/data/sample-v001/store/records/circaStoreData.js",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/src/service/defaultCircaDemoCommerceImportAdmissionService.js",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/test/circaCommerceForwardRelease.test.js",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/data/sample-v001/store/headers/circaStoreReferenceHeader.js",
        "llm/contracts/digital-ownership-sale.md",
        "src/service/defaultEWasteDigitalSaleService.js",
        "src/service/defaultEWasteOrderReversalService.js",
        "../../../../../nodics.commerce/modules/baseCommerce/modules/promotion/llm/contracts/accelerator-setup-contributions.md",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/llm/contracts/circa-promotion-setup.md",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/data/sample-v001/publication/records/publicationPlan.json",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/data/sample-v001/operations/asset-policy/headers/circaDigitalOwnershipPolicyHeader.js",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/test/circaPromotionInstructionPack.test.js",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/test/circaDigitalOwnershipPolicyPack.test.js",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/data/sample-v001/outlet-access/headers/circaOutletAccessHeader.js",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/data/sample-v001/outlet-access/records/circaMerchantOutletScopeData.js",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/test/circaMerchantOutletAccess.test.js",
        "../../../../../nodics.platform/modules/profile/config/properties.js",
        "../../../../../nodics.platform/modules/profile/data/core-v001/records/groups/commerceSetupPublisherGroupData.js",
        "../../../../../nodics.platform/modules/profile/data/core-v001/records/groups/commerceCouponIssuerGroupData.js"
      ],
      "visualRequirements": [
        "table"
      ],
      "searchKeywords": [
        "circa",
        "ewaste",
        "source-inventory",
        "configuration",
        "source records"
      ],
      "topicKeywords": [
        "Circa",
        "Source reference"
      ],
      "headings": [
        {
          "text": "Manifest sections and destinations",
          "anchor": "acceleratorsCircaSourceInventory-1-manifest-sections-and-destinations",
          "level": 2
        },
        {
          "text": "Profile, Location and operational files",
          "anchor": "acceleratorsCircaSourceInventory-2-profile-location-and-operational-files",
          "level": 2
        },
        {
          "text": "Waste transaction and reference files",
          "anchor": "acceleratorsCircaSourceInventory-3-waste-transaction-and-reference-files",
          "level": 2
        },
        {
          "text": "Loyalty files",
          "anchor": "acceleratorsCircaSourceInventory-4-loyalty-files",
          "level": 2
        },
        {
          "text": "Commerce files",
          "anchor": "acceleratorsCircaSourceInventory-5-commerce-files",
          "level": 2
        },
        {
          "text": "Content, assets and account composition",
          "anchor": "acceleratorsCircaSourceInventory-6-content-assets-and-account-composition",
          "level": 2
        },
        {
          "text": "Customize and extend safely",
          "anchor": "acceleratorsCircaSourceInventory-7-customize-and-extend-safely",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "acceleratorsCircaSourceInventory-8-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "acceleratorsCircaSourceInventory-9-verification",
          "level": 2
        },
        {
          "text": "Issuer-specific setup and publication",
          "anchor": "acceleratorsCircaSourceInventory-10-issuer-setup-and-publication",
          "level": 2
        },
        {
          "text": "Original asset policy selection",
          "anchor": "acceleratorsCircaSourceInventory-11-original-asset-policy-selection",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "This is the source-only data index for the Circa reference experience. Beginners can identify the owning module, explicit selection, destination and record shape before preparing a demonstration. Counts reflect repository source reviewed on 9 October 2026, not installed users, issued stock, current wallets, Online pointers or completed transactions. No native owner API, import, database or live receipt was used to certify these facts."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Manifest sections and destinations",
          "anchor": "acceleratorsCircaSourceInventory-1-manifest-sections-and-destinations"
        },
        {
          "kind": "paragraph",
          "text": "The business problem is release reconciliation: teams need to know which source packages contribute records before deciding what to import or publish. This inventory supplies that context without claiming a successful deployment."
        },
        {
          "kind": "paragraph",
          "text": "All paths below are beneath the customer backend `modules/circa.ewaste/data`; the manifest, not the oldest directory name, selects active contribution roots. The framework guide describes them without relocating the application's data into a framework domain."
        },
        {
          "kind": "table",
          "headers": [
            "Section",
            "Source root",
            "Version",
            "Destination",
            "Publication"
          ],
          "rows": [
            [
              "profile",
              "sample-v001",
              "0.0.1",
              "PLATFORM",
              "NONE"
            ],
            [
              "location",
              "sample-v001",
              "0.0.1",
              "LOCATION",
              "NONE"
            ],
            [
              "waste",
              "sample-v001",
              "0.0.1",
              "WASTE",
              "NONE"
            ],
            [
              "waste-policy",
              "core-v001",
              "0.0.1",
              "WASTE",
              "NONE"
            ],
            [
              "loyalty",
              "sample-v001",
              "0.0.1",
              "LOYALTY",
              "NONE"
            ],
            [
              "content",
              "sample-v001",
              "0.0.1",
              "WCMS_STAGED",
              "REQUIRED"
            ],
            [
              "commerce",
              "sample-v001",
              "0.0.1",
              "COMMERCE_STAGED",
              "REQUIRED"
            ],
            [
              "operations",
              "sample-v001",
              "0.0.1",
              "PLATFORM",
              "NONE"
            ],
            [
              "customer-workspace",
              "core-v001",
              "0.0.1",
              "WCMS_STAGED",
              "REQUIRED"
            ],
            [
              "sunmarke-profile",
              "sample-v001",
              "0.0.1",
              "PLATFORM",
              "NONE"
            ],
            [
              "sunmarke-location",
              "sample-v001",
              "0.0.1",
              "LOCATION",
              "NONE"
            ],
            [
              "sunmarke-waste",
              "sample-v001",
              "0.0.1",
              "WASTE",
              "NONE"
            ],
            [
              "circaPublicationPlan",
              "sample-v001",
              "0.0.1",
              "COMMERCE_STAGED",
              "REQUIRED; complete 84-root inventory, not one signed submission"
            ],
            [
              "store",
              "sample-v001",
              "0.0.1",
              "COMMERCE",
              "NONE"
            ],
            [
              "circaGreenPerksBudget",
              "sample-v001",
              "0.0.1",
              "COMMERCE",
              "NONE; original budget instructions only"
            ],
            [
              "circaGreenPerksIssuance",
              "sample-v001",
              "0.0.1",
              "COMMERCE",
              "NONE; after original admission and signed consent"
            ],
            [
              "circaGreenPerksPublicationPlan",
              "sample-v001",
              "0.0.1",
              "COMMERCE_STAGED",
              "REQUIRED"
            ],
            [
              "circaRenewWorksBudget",
              "sample-v001",
              "0.0.1",
              "COMMERCE",
              "NONE; original budget instructions only"
            ],
            [
              "circaRenewWorksIssuance",
              "sample-v001",
              "0.0.1",
              "COMMERCE",
              "NONE; after original admission and signed consent"
            ],
            [
              "circaRenewWorksPublicationPlan",
              "sample-v001",
              "0.0.1",
              "COMMERCE_STAGED",
              "REQUIRED"
            ],
            [
              "circaLoopCycleBudget",
              "sample-v001",
              "0.0.1",
              "COMMERCE",
              "NONE; original budget instructions only"
            ],
            [
              "circaLoopCycleIssuance",
              "sample-v001",
              "0.0.1",
              "COMMERCE",
              "NONE; after original admission and signed consent"
            ],
            [
              "circaLoopCyclePublicationPlan",
              "sample-v001",
              "0.0.1",
              "COMMERCE_STAGED",
              "REQUIRED"
            ],
            [
              "circaCataloguePublicationPlan",
              "sample-v001",
              "0.0.1",
              "COMMERCE_STAGED",
              "REQUIRED"
            ],
            [
              "circaDigitalOwnershipPolicies",
              "sample-v001",
              "0.0.1",
              "WASTE",
              "NONE; source policy before genuine binding and sale"
            ],
            [
              "circaMerchantOutletAccess",
              "sample-v001",
              "0.0.1",
              "PLATFORM",
              "NONE; explicit LOCAL Store scopes only"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "All 26 current business manifest sections use version 0.0.1 in core-v001 or sample-v001. Waste reference policy retains environmentScope ALL. The six budget/issuance packs, four signed publication subsets, circaDigitalOwnershipPolicies and circaMerchantOutletAccess are LOCAL-only; other sample selections retain their declared LOCAL and LOCAL_PRODUCTION_SIMULATION scopes. Read scope per selection, not by directory. Documentation remains a separate optional pack. Neither source visibility nor an ALL reference scope authorizes business replay, installed adoption or production operations."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Profile, Location and operational files",
          "anchor": "acceleratorsCircaSourceInventory-2-profile-location-and-operational-files"
        },
        {
          "kind": "table",
          "headers": [
            "Section/records filename",
            "Exports",
            "Role of records"
          ],
          "rows": [
            [
              "profile/circaAddressData.js",
              "3",
              "Original centre addresses"
            ],
            [
              "profile/circaCustomerData.js",
              "3",
              "Reference customers; no credentials reproduced"
            ],
            [
              "location/circaLocationData.js",
              "3",
              "Original canonical locations"
            ],
            [
              "operations/circaEnterpriseData.js",
              "7",
              "Canonical fictional enterprise identities"
            ],
            [
              "operations/circaOperationalEmployeeData.js",
              "21",
              "Existing templates plus directly scoped partner staff; not installed memberships"
            ],
            [
              "operations/circaOperationalScopeData.js",
              "22",
              "Explicit principal scopes; counts are not permission"
            ],
            [
              "operations/circaOutletAddressData.js",
              "2",
              "GreenPerks outlet addresses"
            ],
            [
              "outlet-access/circaMerchantOutletScopeData.js",
              "4",
              "Exact Store scopes for three existing merchant operators; no role, employee, credential or consent records"
            ],
            [
              "sunmarke-profile/sunmarkeAddressData.js",
              "1",
              "Optional school address"
            ],
            [
              "sunmarke-location/sunmarkeLocationData.js",
              "1",
              "Optional school location"
            ],
            [
              "sunmarke-waste/sunmarkeWasteCollectionPointData.js",
              "1",
              "Optional school point"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "For each section, filenames live under its source root and section's `records` directory. The explicitly selected circa.ewaste:circaMerchantOutletAccess section declares exactly two files: sample-v001/outlet-access/headers/circaOutletAccessHeader.js and sample-v001/outlet-access/records/circaMerchantOutletScopeData.js. Its Profile principalScopeAssignment saveAll header matches by code. It contributes four scopes independently of the unchanged operations pack's 21 staff and 22 scopes; it does not replay staff or credentials. Employee templates and scope principal identifiers need Profile lifecycle resolution; counts do not prove current membership or credential availability. Enterprise definitions are dependencies, not Circa profile records: Profile owns default initialization; Waste Core contributes the two shared-network enterprises."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Waste transaction and reference files",
          "anchor": "acceleratorsCircaSourceInventory-3-waste-transaction-and-reference-files"
        },
        {
          "kind": "table",
          "headers": [
            "Selected section/filename",
            "Exports"
          ],
          "rows": [
            [
              "waste/circaWasteAssetData.js",
              "11"
            ],
            [
              "waste/circaWasteAssetOwnershipEventData.js",
              "11"
            ],
            [
              "waste/circaWasteCollectionPointData.js",
              "3"
            ],
            [
              "waste/circaWasteEvidenceData.js",
              "21"
            ],
            [
              "waste/circaWasteImpactResultData.js",
              "11"
            ],
            [
              "waste/circaWasteSubmissionData.js",
              "21"
            ],
            [
              "waste/circaWasteVerificationData.js",
              "16"
            ],
            [
              "waste-policy/eWasteAcceptanceRuleData.js",
              "1"
            ],
            [
              "waste-policy/eWasteCategoryData.js",
              "25"
            ],
            [
              "waste-policy/eWasteCollectionPresetData.js",
              "2"
            ],
            [
              "waste-policy/eWasteImpactProfileData.js",
              "2"
            ],
            [
              "waste-policy/eWasteItemTypeData.js",
              "28"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "The selected submission field is `submissionStatus`: 11 APPROVED, 5 SUBMITTED, 5 REJECTED. Verification uses `verificationStatus`: 11 APPROVED, 5 REJECTED. Asset uses `assetStatus`: 6 OWNED, 5 LISTED. Older prose describing 20 submissions or ten approved records is a historical opening snapshot, not this successor count. Do not query a generic `status` field and report undefined values as lifecycle state."
        },
        {
          "kind": "paragraph",
          "text": "The policy counts describe Circa's source overlay exports, not total composed taxonomy. nImport can inherit the selected eWaste reference predecessor. Matching file names, export keys and header targets determine composition. Counting the two files as two full taxonomies would be incorrect. Historical core-v001 roots and earlier Waste samples are retained compatibility evidence, not extra active records to import alongside the successor."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Loyalty files",
          "anchor": "acceleratorsCircaSourceInventory-4-loyalty-files"
        },
        {
          "kind": "table",
          "headers": [
            "Filename in loyalty/records",
            "Exports"
          ],
          "rows": [
            [
              "circaLoyaltyProgramData.js",
              "1"
            ],
            [
              "circaLoyaltyRewardTypeData.js",
              "1"
            ],
            [
              "circaLoyaltyWalletData.js",
              "3"
            ],
            [
              "circaLoyaltyWalletRewardBalanceData.js",
              "6"
            ],
            [
              "circaRewardLedgerEntryData.js",
              "22"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Configuration uses programme circa, reward type points and carbon reward type circaCarbon. One Circa-authored reward-type export is not proof that the whole deployment has only one reward type: inspect inherited owner reference data. Opening ledger records are not repeatable top-ups. Preserve source references, original reward/asset history and owner balance arithmetic."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Commerce files",
          "anchor": "acceleratorsCircaSourceInventory-5-commerce-files"
        },
        {
          "kind": "table",
          "headers": [
            "Filename in commerce/records",
            "Exports",
            "Catalogue header selection"
          ],
          "rows": [
            [
              "circaCategoryData.js",
              "2",
              "Dispatched catalogue definition"
            ],
            [
              "circaCategoryLocalizationData.js",
              "4",
              "Dispatched catalogue definition"
            ],
            [
              "circaProductData.js",
              "43",
              "Dispatched catalogue definition"
            ],
            [
              "circaProductLocalizationData.js",
              "86",
              "Dispatched catalogue definition"
            ],
            [
              "circaProductVariantData.js",
              "43",
              "Dispatched catalogue definition"
            ],
            [
              "circaProductVariantLocalizationData.js",
              "86",
              "Dispatched catalogue definition"
            ],
            [
              "circaPriceBookData.js",
              "1",
              "Dispatched catalogue definition"
            ],
            [
              "circaPriceRowData.js",
              "43",
              "Dispatched catalogue definition"
            ],
            [
              "circaPromotionData.js",
              "38",
              "Dispatched catalogue definition"
            ],
            [
              "circaTaxPolicyData.js",
              "1",
              "Dispatched catalogue definition"
            ],
            [
              "circaWarehouseData.js",
              "1",
              "Dispatched catalogue definition"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Current Commerce source contains 43 Products: five asset listings and 38 coupon offers, with 43 variants/prices, 38 Promotions and 86 rows in each English/Arabic localization family. The categories remain circaAssets and circaCoupons. Active releases contain no raw Coupon, CouponBatch or InventoryBalance snapshot files. The commerce-operational release/header is retired; selecting it must refuse before dispatch. Historical snapshot shapes belong only in isolated refusal/compatibility fixtures, never an importable release. The separate circa.ewaste:store pack contains five Store masters: the GREENPERKS_ONLINE marketplace, two GREENPERKS_RETAIL outlets and the RenewWorks/LoopCycle outlets. See the [catalogue reference](/docs/framework/accelerators/circa/catalogue-reference) for approved terms and installed-data boundaries."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Content, assets and account composition",
          "anchor": "acceleratorsCircaSourceInventory-6-content-assets-and-account-composition"
        },
        {
          "kind": "paragraph",
          "text": "Content exports are circaCmsComponentData.js (10), circaCmsGroupData.js (1), circaCmsPageData.js (3), circaCmsRendererData.js (9), circaCmsRouteData.js (3), circaCmsSiteData.js (1), circaCmsSlotData.js (1), circaCmsTemplateData.js (1), circaCmsTypeData.js (9) and circaContentCatalogData.js (1). The assetManifest declares 18 media assets; circaMediaData.js maps those entries to Media hydration records. Do not count the asset manifest and hydration projection as 36 independent assets."
        },
        {
          "kind": "paragraph",
          "text": "Customer-workspace exports one record each from circaWorkspaceComponentData.js, GroupData.js, PageData.js, RendererData.js, RouteData.js, SlotData.js, TemplateData.js and TypeData.js (all with the circaWorkspace prefix). These records supply the published account composition, not eight customer transactions. The shared typed renderer consumes safe backend configuration; it does not execute server-supplied JavaScript or grant domain actions from copy."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customize and extend safely",
          "anchor": "acceleratorsCircaSourceInventory-7-customize-and-extend-safely"
        },
        {
          "kind": "paragraph",
          "text": "Developers add a focused custom release and update its authoritative manifest with existing tooling. A worked example changes only one account banner component while leaving transaction and opening-wallet sections unselected. Validate checksums, source keys, owner headers and generated artifacts before reviewing publication. Reject unknown baseline or conflicting release versions; recover through owner receipts rather than deleting history or editing generated hashes."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "acceleratorsCircaSourceInventory-8-common-mistakes"
        },
        {
          "kind": "paragraph",
          "text": "Summing overlapping historical/current roots; treating locale rows as products; counting policy overlays as complete composed taxonomy; treating exported opening balances as current balances; and reimporting transactions to update a banner are incorrect. Source status counts are dated documentation evidence, not live telemetry."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "acceleratorsCircaSourceInventory-9-verification"
        },
        {
          "kind": "paragraph",
          "text": "This inventory comes from the manifest's selected file lists and offline exported data shapes, with no runtimes or credentials. Operators/DevOps must verify installed receipts and authorized owner API inventory separately. Check source inventory again after any release change and preserve counts/source-root/version in documentation. See [collection centres](/docs/framework/accelerators/circa/collection-reference), [enterprise/staff](/docs/framework/accelerators/circa/enterprise-reference) and [configuration](/docs/framework/accelerators/circa/configuration-reference) for field-level interpretation."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Issuer-specific setup and publication",
          "anchor": "acceleratorsCircaSourceInventory-10-issuer-setup-and-publication"
        },
        {
          "kind": "paragraph",
          "text": "Selections below use the circa.ewaste: prefix. circaPublicationPlan remains an inert 84-root reconciliation inventory. Execute only four exact subsets under their respective signed enterprise. A caller cannot override signed authority through source data, and existing Process/publication approvals remain independent. Source checks prove coverage and fingerprints, not successful activation."
        },
        {
          "kind": "paragraph",
          "text": "Role adoption is a separate authorized Profile operation on existing identities, not part of outlet-scope import. The marketplace administrator uses COMMERCE_SETUP_PUBLISHER only; the three issuer administrators use COMMERCE_SETUP_PUBLISHER plus COMMERCE_COUPON_ISSUER for their own signed enterprise. These explicitly selected Profile core groups do not assign themselves to staff. Existing retail, repair and recycling operators use the existing MERCHANT_OPERATOR role plus their exact Store scope. Do not grant runtimeConfigAdminUserGroup, platform administration or every outlet to satisfy a setup gate. Re-read current membership and scope, then obtain a fresh session after any authorized role change. Separate human seller-consent review and original campaign admission remain required; no role, manifest, source test or scope record is commercial consent or live qualification."
        },
        {
          "kind": "table",
          "headers": [
            "Existing operator",
            "Signed enterprise",
            "Exact Store scope"
          ],
          "rows": [
            [
              "Retail operator",
              "GREENPERKS_RETAIL",
              "greenperks-cafe"
            ],
            [
              "Retail operator",
              "GREENPERKS_RETAIL",
              "greenperks-bistro"
            ],
            [
              "Repair operator",
              "RENEWWORKS_REPAIR_REUSE",
              "renewworks-repair"
            ],
            [
              "Recycling operator",
              "LOOPCYCLE_RECYCLING",
              "loopcycle-accessories"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Each outlet assignment is human, STORE, ALLOW, DIRECT and ACTIVE, with tenantCode default, the exact issuer enterpriseCode, capabilityCode digitalCore and permissionCode commerce.coupon.pos.redeem. There is no wildcard, marketplace outlet, inherited enterprise-wide redemption or new account. A wrong outlet, enterprise, tenant, missing current role or applicable DENY must still reject. Test scope-only import without role adoption, role-only adoption without Store scope, stale sessions and interrupted import recovery independently. Inspect the original release receipt and fresh Profile/Digital Core authorization before merchant acceptance; never rewrite receipts or replay operations to acquire access."
        },
        {
          "kind": "table",
          "headers": [
            "Signed enterprise",
            "Publication subset",
            "Roots",
            "Coverage"
          ],
          "rows": [
            [
              "GREENPERKS_ONLINE",
              "circaCataloguePublicationPlan",
              "46",
              "43 Products, PriceBook with 43 PriceRows, Warehouse, TaxPolicy"
            ],
            [
              "GREENPERKS_RETAIL",
              "circaGreenPerksPublicationPlan",
              "35",
              "Only this issuer's exact Promotion roots"
            ],
            [
              "RENEWWORKS_REPAIR_REUSE",
              "circaRenewWorksPublicationPlan",
              "2",
              "Only this issuer's exact Promotion roots"
            ],
            [
              "LOOPCYCLE_RECYCLING",
              "circaLoopCyclePublicationPlan",
              "1",
              "Only this issuer's exact Promotion roots"
            ]
          ]
        },
        {
          "kind": "table",
          "headers": [
            "Signed issuer",
            "Budget-only selection",
            "Later issuance selection",
            "Campaigns",
            "Bounded intent"
          ],
          "rows": [
            [
              "GREENPERKS_RETAIL",
              "circaGreenPerksBudget",
              "circaGreenPerksIssuance",
              "35",
              "100 per campaign; original admission checksum required"
            ],
            [
              "RENEWWORKS_REPAIR_REUSE",
              "circaRenewWorksBudget",
              "circaRenewWorksIssuance",
              "2",
              "100 per campaign; original admission checksum required"
            ],
            [
              "LOOPCYCLE_RECYCLING",
              "circaLoopCycleBudget",
              "circaLoopCycleIssuance",
              "1",
              "100 per campaign; original admission checksum required"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Budget packs contain only original campaign instructions and an empty couponBatches list. Issuance repeats the exact campaign fingerprint, Store/root and original command, and pins admissionContribution moduleName, releaseCode, version and checksum from the original budget pack. There is no replenishment. Quantities total 3,800 across 38 campaigns, not issued supply. Nine monetary budgets total 25,500; 29 exact ITEM campaigns have monetary budget zero. Budget intent and sample staff do not confer consent."
        },
        {
          "kind": "paragraph",
          "text": "Separate human issuer review through the existing Promotion consent command must name vendor GREENPERKS_ONLINE, expiry 2026-11-08T23:59:59.000Z and benefitConsumption ISSUED_COUPON_BENEFIT_V1, using a freshly read revision and original command reference. The nonimportable circaIssuerConsentReviewInstructions.json fixture is review context, not a grant. Re-read projected consent and original admission before issuance. Refer to the [Promotion owner guide](/docs/framework/promotion-campaigns-coupon-issuance) and its llm/contracts/accelerator-setup-contributions.md source contract."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Original asset policy selection",
          "anchor": "acceleratorsCircaSourceInventory-11-original-asset-policy-selection"
        },
        {
          "kind": "paragraph",
          "text": "The explicit LOCAL-only circaDigitalOwnershipPolicies WASTE reference pack contains three policy records and a code-keyed saveAll header. It carries reviewed fictional local intent before genuine listing/binding and original reservation, not operational sale, entitlement, approval, payment or wallet receipts."
        },
        {
          "kind": "table",
          "headers": [
            "Waste-owned schema",
            "Exact policy code",
            "Approved source intent"
          ],
          "rows": [
            [
              "wasteAssetTransferPolicy",
              "CIRCA_LOCAL_DIGITAL_OWNERSHIP_V1",
              "SELL to counterparty; 600-second reservation and required lock; original approval rewards retained; no custody/carbon transfer"
            ],
            [
              "wasteRewardSettlementPolicy",
              "CIRCA_LOCAL_DIGITAL_SALE_REWARD_V1",
              "CAPTURED_TOTAL to CURRENT_SELLER; circa/points; POINTS scale 2; no platform fee or split"
            ],
            [
              "wasteCarbonSettlementPolicy",
              "CIRCA_LOCAL_DIGITAL_SALE_CARBON_NONE_V1",
              "SALE / NONE; no mint or carbon ledger movement"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Before EWA-1047, EWA-1051, EWA-1052, EWA-1055 or EWA-1092 is sold, each quantity one, transfer metadata must retain digitalOwnership.refund = ORIGINAL_TRANSFER_REVERSAL_ONLY_BEFORE_ONWARD_TRANSFER. The original command retains all three current policy records. Refund requires unchanged original snapshots and separate original Order review/approval. Missing original terms, amended policies, onward ownership and uncertain payment remain refused/manual-review-only. Never backfill an event. eWaste llm/contracts/digital-ownership-sale.md#original-sale-refund is the canonical owner contract. This is SOURCE_ONLY intent, not native qualification."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart TD\n  Source[\"Reviewed v001 source only\"] --> Publish[\"Four signed publication subsets\"]\n  Publish --> Budget[\"Issuer original budget admission\"]\n  Budget --> Consent[\"Separate human consent and benefit purpose\"]\n  Consent --> Issue[\"Issuance pins original admission\"]\n  Source --> Policies[\"Waste original-sale policies\"]\n  Policies --> Binding[\"Genuine listing and Digital binding\"]\n  Binding --> Sale[\"Original capture and seller proceeds\"]\n  Sale --> Refund[\"Original Order refund approval\"]\n  Refund --> Check[\"Retained terms and no onward transfer\"]"
        }
      ],
      "searchText": "Circa Source Release and Record Inventory Manifest versions, destinations, all source record counts, optional packages and publication boundaries. # Circa Source Release and Record Inventory\n\nThis is the source-only data index for the Circa reference experience. Beginners can identify the owning module, explicit selection, destination and record shape before preparing a demonstration. Counts reflect repository source reviewed on 9 October 2026, not installed users, issued stock, current wallets, Online pointers or completed transactions. No native owner API, import, database or live receipt was used to certify these facts.\n\n## Manifest sections and destinations\n\nThe business problem is release reconciliation: teams need to know which source packages contribute records before deciding what to import or publish. This inventory supplies that context without claiming a successful deployment.\n\nAll paths below are beneath the customer backend `modules/circa.ewaste/data`; the manifest, not the oldest directory name, selects active contribution roots. The framework guide describes them without relocating the application's data into a framework domain.\n\n| Section | Source root | Version | Destination | Publication |\n| --- | --- | --- | --- | --- |\n| profile | sample-v001 | 0.0.1 | PLATFORM | NONE |\n| location | sample-v001 | 0.0.1 | LOCATION | NONE |\n| waste | sample-v001 | 0.0.1 | WASTE | NONE |\n| waste-policy | core-v001 | 0.0.1 | WASTE | NONE |\n| loyalty | sample-v001 | 0.0.1 | LOYALTY | NONE |\n| content | sample-v001 | 0.0.1 | WCMS_STAGED | REQUIRED |\n| commerce | sample-v001 | 0.0.1 | COMMERCE_STAGED | REQUIRED |\n| operations | sample-v001 | 0.0.1 | PLATFORM | NONE |\n| customer-workspace | core-v001 | 0.0.1 | WCMS_STAGED | REQUIRED |\n| sunmarke-profile | sample-v001 | 0.0.1 | PLATFORM | NONE |\n| sunmarke-location | sample-v001 | 0.0.1 | LOCATION | NONE |\n| sunmarke-waste | sample-v001 | 0.0.1 | WASTE | NONE |\n| circaPublicationPlan | sample-v001 | 0.0.1 | COMMERCE_STAGED | REQUIRED; complete 84-root inventory, not one signed submission |\n| store | sample-v001 | 0.0.1 | COMMERCE | NONE |\n| circaGreenPerksBudget | sample-v001 | 0.0.1 | COMMERCE | NONE; original budget instructions only |\n| circaGreenPerksIssuance | sample-v001 | 0.0.1 | COMMERCE | NONE; after original admission and signed consent |\n| circaGreenPerksPublicationPlan | sample-v001 | 0.0.1 | COMMERCE_STAGED | REQUIRED |\n| circaRenewWorksBudget | sample-v001 | 0.0.1 | COMMERCE | NONE; original budget instructions only |\n| circaRenewWorksIssuance | sample-v001 | 0.0.1 | COMMERCE | NONE; after original admission and signed consent |\n| circaRenewWorksPublicationPlan | sample-v001 | 0.0.1 | COMMERCE_STAGED | REQUIRED |\n| circaLoopCycleBudget | sample-v001 | 0.0.1 | COMMERCE | NONE; original budget instructions only |\n| circaLoopCycleIssuance | sample-v001 | 0.0.1 | COMMERCE | NONE; after original admission and signed consent |\n| circaLoopCyclePublicationPlan | sample-v001 | 0.0.1 | COMMERCE_STAGED | REQUIRED |\n| circaCataloguePublicationPlan | sample-v001 | 0.0.1 | COMMERCE_STAGED | REQUIRED |\n| circaDigitalOwnershipPolicies | sample-v001 | 0.0.1 | WASTE | NONE; source policy before genuine binding and sale |\n| circaMerchantOutletAccess | sample-v001 | 0.0.1 | PLATFORM | NONE; explicit LOCAL Store scopes only |\n\nAll 26 current business manifest sections use version 0.0.1 in core-v001 or sample-v001. Waste reference policy retains environmentScope ALL. The six budget/issuance packs, four signed publication subsets, circaDigitalOwnershipPolicies and circaMerchantOutletAccess are LOCAL-only; other sample selections retain their declared LOCAL and LOCAL_PRODUCTION_SIMULATION scopes. Read scope per selection, not by directory. Documentation remains a separate optional pack. Neither source visibility nor an ALL reference scope authorizes business replay, installed adoption or production operations.\n\n## Profile, Location and operational files\n\n| Section/records filename | Exports | Role of records |\n| --- | --- | --- |\n| profile/circaAddressData.js | 3 | Original centre addresses |\n| profile/circaCustomerData.js | 3 | Reference customers; no credentials reproduced |\n| location/circaLocationData.js | 3 | Original canonical locations |\n| operations/circaEnterpriseData.js | 7 | Canonical fictional enterprise identities |\n| operations/circaOperationalEmployeeData.js | 21 | Existing templates plus directly scoped partner staff; not installed memberships |\n| operations/circaOperationalScopeData.js | 22 | Explicit principal scopes; counts are not permission |\n| operations/circaOutletAddressData.js | 2 | GreenPerks outlet addresses |\n| outlet-access/circaMerchantOutletScopeData.js | 4 | Exact Store scopes for three existing merchant operators; no role, employee, credential or consent records |\n| sunmarke-profile/sunmarkeAddressData.js | 1 | Optional school address |\n| sunmarke-location/sunmarkeLocationData.js | 1 | Optional school location |\n| sunmarke-waste/sunmarkeWasteCollectionPointData.js | 1 | Optional school point |\n\nFor each section, filenames live under its source root and section's `records` directory. The explicitly selected circa.ewaste:circaMerchantOutletAccess section declares exactly two files: sample-v001/outlet-access/headers/circaOutletAccessHeader.js and sample-v001/outlet-access/records/circaMerchantOutletScopeData.js. Its Profile principalScopeAssignment saveAll header matches by code. It contributes four scopes independently of the unchanged operations pack's 21 staff and 22 scopes; it does not replay staff or credentials. Employee templates and scope principal identifiers need Profile lifecycle resolution; counts do not prove current membership or credential availability. Enterprise definitions are dependencies, not Circa profile records: Profile owns default initialization; Waste Core contributes the two shared-network enterprises.\n\n## Waste transaction and reference files\n\n| Selected section/filename | Exports |\n| --- | --- |\n| waste/circaWasteAssetData.js | 11 |\n| waste/circaWasteAssetOwnershipEventData.js | 11 |\n| waste/circaWasteCollectionPointData.js | 3 |\n| waste/circaWasteEvidenceData.js | 21 |\n| waste/circaWasteImpactResultData.js | 11 |\n| waste/circaWasteSubmissionData.js | 21 |\n| waste/circaWasteVerificationData.js | 16 |\n| waste-policy/eWasteAcceptanceRuleData.js | 1 |\n| waste-policy/eWasteCategoryData.js | 25 |\n| waste-policy/eWasteCollectionPresetData.js | 2 |\n| waste-policy/eWasteImpactProfileData.js | 2 |\n| waste-policy/eWasteItemTypeData.js | 28 |\n\nThe selected submission field is `submissionStatus`: 11 APPROVED, 5 SUBMITTED, 5 REJECTED. Verification uses `verificationStatus`: 11 APPROVED, 5 REJECTED. Asset uses `assetStatus`: 6 OWNED, 5 LISTED. Older prose describing 20 submissions or ten approved records is a historical opening snapshot, not this successor count. Do not query a generic `status` field and report undefined values as lifecycle state.\n\nThe policy counts describe Circa's source overlay exports, not total composed taxonomy. nImport can inherit the selected eWaste reference predecessor. Matching file names, export keys and header targets determine composition. Counting the two files as two full taxonomies would be incorrect. Historical core-v001 roots and earlier Waste samples are retained compatibility evidence, not extra active records to import alongside the successor.\n\n## Loyalty files\n\n| Filename in loyalty/records | Exports |\n| --- | --- |\n| circaLoyaltyProgramData.js | 1 |\n| circaLoyaltyRewardTypeData.js | 1 |\n| circaLoyaltyWalletData.js | 3 |\n| circaLoyaltyWalletRewardBalanceData.js | 6 |\n| circaRewardLedgerEntryData.js | 22 |\n\nConfiguration uses programme circa, reward type points and carbon reward type circaCarbon. One Circa-authored reward-type export is not proof that the whole deployment has only one reward type: inspect inherited owner reference data. Opening ledger records are not repeatable top-ups. Preserve source references, original reward/asset history and owner balance arithmetic.\n\n## Commerce files\n\n| Filename in commerce/records | Exports | Catalogue header selection |\n| --- | --- | --- |\n| circaCategoryData.js | 2 | Dispatched catalogue definition |\n| circaCategoryLocalizationData.js | 4 | Dispatched catalogue definition |\n| circaProductData.js | 43 | Dispatched catalogue definition |\n| circaProductLocalizationData.js | 86 | Dispatched catalogue definition |\n| circaProductVariantData.js | 43 | Dispatched catalogue definition |\n| circaProductVariantLocalizationData.js | 86 | Dispatched catalogue definition |\n| circaPriceBookData.js | 1 | Dispatched catalogue definition |\n| circaPriceRowData.js | 43 | Dispatched catalogue definition |\n| circaPromotionData.js | 38 | Dispatched catalogue definition |\n| circaTaxPolicyData.js | 1 | Dispatched catalogue definition |\n| circaWarehouseData.js | 1 | Dispatched catalogue definition |\n\nCurrent Commerce source contains 43 Products: five asset listings and 38 coupon offers, with 43 variants/prices, 38 Promotions and 86 rows in each English/Arabic localization family. The categories remain circaAssets and circaCoupons. Active releases contain no raw Coupon, CouponBatch or InventoryBalance snapshot files. The commerce-operational release/header is retired; selecting it must refuse before dispatch. Historical snapshot shapes belong only in isolated refusal/compatibility fixtures, never an importable release. The separate circa.ewaste:store pack contains five Store masters: the GREENPERKS_ONLINE marketplace, two GREENPERKS_RETAIL outlets and the RenewWorks/LoopCycle outlets. See the [catalogue reference](/docs/framework/accelerators/circa/catalogue-reference) for approved terms and installed-data boundaries.\n\n## Content, assets and account composition\n\nContent exports are circaCmsComponentData.js (10), circaCmsGroupData.js (1), circaCmsPageData.js (3), circaCmsRendererData.js (9), circaCmsRouteData.js (3), circaCmsSiteData.js (1), circaCmsSlotData.js (1), circaCmsTemplateData.js (1), circaCmsTypeData.js (9) and circaContentCatalogData.js (1). The assetManifest declares 18 media assets; circaMediaData.js maps those entries to Media hydration records. Do not count the asset manifest and hydration projection as 36 independent assets.\n\nCustomer-workspace exports one record each from circaWorkspaceComponentData.js, GroupData.js, PageData.js, RendererData.js, RouteData.js, SlotData.js, TemplateData.js and TypeData.js (all with the circaWorkspace prefix). These records supply the published account composition, not eight customer transactions. The shared typed renderer consumes safe backend configuration; it does not execute server-supplied JavaScript or grant domain actions from copy.\n\n## Customize and extend safely\n\nDevelopers add a focused custom release and update its authoritative manifest with existing tooling. A worked example changes only one account banner component while leaving transaction and opening-wallet sections unselected. Validate checksums, source keys, owner headers and generated artifacts before reviewing publication. Reject unknown baseline or conflicting release versions; recover through owner receipts rather than deleting history or editing generated hashes.\n\n## Common mistakes\n\nSumming overlapping historical/current roots; treating locale rows as products; counting policy overlays as complete composed taxonomy; treating exported opening balances as current balances; and reimporting transactions to update a banner are incorrect. Source status counts are dated documentation evidence, not live telemetry.\n\n## Verification\n\nThis inventory comes from the manifest's selected file lists and offline exported data shapes, with no runtimes or credentials. Operators/DevOps must verify installed receipts and authorized owner API inventory separately. Check source inventory again after any release change and preserve counts/source-root/version in documentation. See [collection centres](/docs/framework/accelerators/circa/collection-reference), [enterprise/staff](/docs/framework/accelerators/circa/enterprise-reference) and [configuration](/docs/framework/accelerators/circa/configuration-reference) for field-level interpretation.\n\n## Issuer-specific setup and publication\n\nSelections below use the circa.ewaste: prefix. circaPublicationPlan remains an inert 84-root reconciliation inventory. Execute only four exact subsets under their respective signed enterprise. A caller cannot override signed authority through source data, and existing Process/publication approvals remain independent. Source checks prove coverage and fingerprints, not successful activation.\n\nRole adoption is a separate authorized Profile operation on existing identities, not part of outlet-scope import. The marketplace administrator uses COMMERCE_SETUP_PUBLISHER only; the three issuer administrators use COMMERCE_SETUP_PUBLISHER plus COMMERCE_COUPON_ISSUER for their own signed enterprise. These explicitly selected Profile core groups do not assign themselves to staff. Existing retail, repair and recycling operators use the existing MERCHANT_OPERATOR role plus their exact Store scope. Do not grant runtimeConfigAdminUserGroup, platform administration or every outlet to satisfy a setup gate. Re-read current membership and scope, then obtain a fresh session after any authorized role change. Separate human seller-consent review and original campaign admission remain required; no role, manifest, source test or scope record is commercial consent or live qualification.\n\n| Existing operator | Signed enterprise | Exact Store scope |\n| --- | --- | --- |\n| Retail operator | GREENPERKS_RETAIL | greenperks-cafe |\n| Retail operator | GREENPERKS_RETAIL | greenperks-bistro |\n| Repair operator | RENEWWORKS_REPAIR_REUSE | renewworks-repair |\n| Recycling operator | LOOPCYCLE_RECYCLING | loopcycle-accessories |\n\nEach outlet assignment is human, STORE, ALLOW, DIRECT and ACTIVE, with tenantCode default, the exact issuer enterpriseCode, capabilityCode digitalCore and permissionCode commerce.coupon.pos.redeem. There is no wildcard, marketplace outlet, inherited enterprise-wide redemption or new account. A wrong outlet, enterprise, tenant, missing current role or applicable DENY must still reject. Test scope-only import without role adoption, role-only adoption without Store scope, stale sessions and interrupted import recovery independently. Inspect the original release receipt and fresh Profile/Digital Core authorization before merchant acceptance; never rewrite receipts or replay operations to acquire access.\n\n| Signed enterprise | Publication subset | Roots | Coverage |\n| --- | --- | --- | --- |\n| GREENPERKS_ONLINE | circaCataloguePublicationPlan | 46 | 43 Products, PriceBook with 43 PriceRows, Warehouse, TaxPolicy |\n| GREENPERKS_RETAIL | circaGreenPerksPublicationPlan | 35 | Only this issuer's exact Promotion roots |\n| RENEWWORKS_REPAIR_REUSE | circaRenewWorksPublicationPlan | 2 | Only this issuer's exact Promotion roots |\n| LOOPCYCLE_RECYCLING | circaLoopCyclePublicationPlan | 1 | Only this issuer's exact Promotion roots |\n\n| Signed issuer | Budget-only selection | Later issuance selection | Campaigns | Bounded intent |\n| --- | --- | --- | --- | --- |\n| GREENPERKS_RETAIL | circaGreenPerksBudget | circaGreenPerksIssuance | 35 | 100 per campaign; original admission checksum required |\n| RENEWWORKS_REPAIR_REUSE | circaRenewWorksBudget | circaRenewWorksIssuance | 2 | 100 per campaign; original admission checksum required |\n| LOOPCYCLE_RECYCLING | circaLoopCycleBudget | circaLoopCycleIssuance | 1 | 100 per campaign; original admission checksum required |\n\nBudget packs contain only original campaign instructions and an empty couponBatches list. Issuance repeats the exact campaign fingerprint, Store/root and original command, and pins admissionContribution moduleName, releaseCode, version and checksum from the original budget pack. There is no replenishment. Quantities total 3,800 across 38 campaigns, not issued supply. Nine monetary budgets total 25,500; 29 exact ITEM campaigns have monetary budget zero. Budget intent and sample staff do not confer consent.\n\nSeparate human issuer review through the existing Promotion consent command must name vendor GREENPERKS_ONLINE, expiry 2026-11-08T23:59:59.000Z and benefitConsumption ISSUED_COUPON_BENEFIT_V1, using a freshly read revision and original command reference. The nonimportable circaIssuerConsentReviewInstructions.json fixture is review context, not a grant. Re-read projected consent and original admission before issuance. Refer to the [Promotion owner guide](/docs/framework/promotion-campaigns-coupon-issuance) and its llm/contracts/accelerator-setup-contributions.md source contract.\n\n## Original asset policy selection\n\nThe explicit LOCAL-only circaDigitalOwnershipPolicies WASTE reference pack contains three policy records and a code-keyed saveAll header. It carries reviewed fictional local intent before genuine listing/binding and original reservation, not operational sale, entitlement, approval, payment or wallet receipts.\n\n| Waste-owned schema | Exact policy code | Approved source intent |\n| --- | --- | --- |\n| wasteAssetTransferPolicy | CIRCA_LOCAL_DIGITAL_OWNERSHIP_V1 | SELL to counterparty; 600-second reservation and required lock; original approval rewards retained; no custody/carbon transfer |\n| wasteRewardSettlementPolicy | CIRCA_LOCAL_DIGITAL_SALE_REWARD_V1 | CAPTURED_TOTAL to CURRENT_SELLER; circa/points; POINTS scale 2; no platform fee or split |\n| wasteCarbonSettlementPolicy | CIRCA_LOCAL_DIGITAL_SALE_CARBON_NONE_V1 | SALE / NONE; no mint or carbon ledger movement |\n\nBefore EWA-1047, EWA-1051, EWA-1052, EWA-1055 or EWA-1092 is sold, each quantity one, transfer metadata must retain digitalOwnership.refund = ORIGINAL_TRANSFER_REVERSAL_ONLY_BEFORE_ONWARD_TRANSFER. The original command retains all three current policy records. Refund requires unchanged original snapshots and separate original Order review/approval. Missing original terms, amended policies, onward ownership and uncertain payment remain refused/manual-review-only. Never backfill an event. eWaste llm/contracts/digital-ownership-sale.md#original-sale-refund is the canonical owner contract. This is SOURCE_ONLY intent, not native qualification.\n\n```mermaid\nflowchart TD\n  Source[\"Reviewed v001 source only\"] --> Publish[\"Four signed publication subsets\"]\n  Publish --> Budget[\"Issuer original budget admission\"]\n  Budget --> Consent[\"Separate human consent and benefit purpose\"]\n  Consent --> Issue[\"Issuance pins original admission\"]\n  Source --> Policies[\"Waste original-sale policies\"]\n  Policies --> Binding[\"Genuine listing and Digital binding\"]\n  Binding --> Sale[\"Original capture and seller proceeds\"]\n  Sale --> Refund[\"Original Order refund approval\"]\n  Refund --> Check[\"Retained terms and no onward transfer\"]\n```\n",
      "previous": {
        "title": "Circa Enterprise, Staff and Scope Reference",
        "route": "/docs/framework/accelerators/circa/enterprise-reference"
      },
      "next": {
        "title": "Circa Store, Product, Price and Coupon Record Reference",
        "route": "/docs/framework/accelerators/circa/catalogue-reference"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.accelerators",
        "technicalModule": "eWaste",
        "owner": "eWaste",
        "sourcePath": "data/docs-v001/records/documentation/eWasteDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/eWasteDocumentationComponentData.js",
        "wordCount": 2029,
        "checksum": "b3fcbebf6c74f8a18e9e5a8bbf49ed6c2c723ffcae88c0122d2fc3f6734cb1af"
      },
      "slug": "accelerators-circa-source-inventory",
      "locale": "en",
      "navigationGroup": "Circa eWaste Product",
      "navigationGroupCode": "circa-ewaste-product",
      "navigationGroupOrder": 20,
      "navigationOrder": 100,
      "references": [
        {
          "documentId": "accelerators.circa-overview",
          "owner": "eWaste"
        },
        {
          "documentId": "accelerators.circa-data-network",
          "owner": "eWaste"
        },
        {
          "documentId": "accelerators.circa-customization",
          "owner": "eWaste"
        }
      ]
    },
    "active": true
  },
  "record3": {
    "code": "nodicsDocsComponentacceleratorsCircaCatalogueReference",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "accelerators.circa-catalogue-reference",
      "title": "Circa Store, Product, Price and Coupon Record Reference",
      "route": "/docs/framework/accelerators/circa/catalogue-reference",
      "section": "accelerators-and-industry-solution-templates",
      "sectionTitle": "Accelerators and Industry Solution Templates",
      "group": "accelerators-and-industry-solution-templates",
      "groupTitle": "Accelerators and Industry Solution Templates",
      "parentId": "accelerators-and-industry-solution-templates",
      "hierarchyPath": [
        "Accelerators and Industry Solution Templates",
        "Circa Store, Product, Price and Coupon Record Reference"
      ],
      "hierarchyDepth": 2,
      "documentType": "configuration",
      "audience": [
        "business",
        "architect",
        "administrator",
        "developer",
        "operator",
        "qa",
        "ai-tool"
      ],
      "businessAudience": [],
      "technicalAudience": [],
      "summary": "Exact store, product, variant, points price, inventory, promotion, batch and code-pool sample records.",
      "visibility": "public",
      "accessMode": "PUBLIC",
      "publiclyAvailable": true,
      "requiresAuthentication": false,
      "allowedRoles": [],
      "allowedGroups": [],
      "allowedPermissions": [],
      "lifecycleState": "ONLINE",
      "version": "0.16.16",
      "maturityState": "partial",
      "implementationState": "current",
      "renderingComponent": "documentation.component.article",
      "relatedPages": [
        "accelerators.circa-overview",
        "accelerators.circa-data-network",
        "accelerators.circa-customization"
      ],
      "sourceEvidence": [
        "../../../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/data/manifest.json",
        "package.json",
        "src/service",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/data/sample-v001/commerce/headers/circaCommerceCatalogHeader.js",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/data/sample-v001/commerce/records/circaProductData.js",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/data/sample-v001/commerce/records/circaProductVariantData.js",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/data/sample-v001/commerce/records/circaProductLocalizationData.js",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/data/sample-v001/commerce/records/circaProductVariantLocalizationData.js",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/data/sample-v001/commerce/records/circaPriceRowData.js",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/data/sample-v001/commerce/records/circaPromotionData.js",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/data/sample-v001/store/records/circaStoreData.js",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/src/service/defaultCircaDemoCommerceImportAdmissionService.js",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/test/circaCommerceForwardRelease.test.js",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/data/sample-v001/store/headers/circaStoreReferenceHeader.js",
        "llm/contracts/digital-ownership-sale.md",
        "src/service/defaultEWasteDigitalSaleService.js",
        "src/service/defaultEWasteOrderReversalService.js",
        "../../../../../nodics.commerce/modules/baseCommerce/modules/promotion/llm/contracts/accelerator-setup-contributions.md",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/llm/contracts/circa-promotion-setup.md",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/data/sample-v001/publication/records/publicationPlan.json",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/data/sample-v001/operations/asset-policy/headers/circaDigitalOwnershipPolicyHeader.js",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/test/circaPromotionInstructionPack.test.js",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/test/circaDigitalOwnershipPolicyPack.test.js"
      ],
      "visualRequirements": [
        "table"
      ],
      "searchKeywords": [
        "circa",
        "ewaste",
        "catalogue-reference",
        "configuration",
        "source records"
      ],
      "topicKeywords": [
        "Circa",
        "Source reference"
      ],
      "headings": [
        {
          "text": "Store, warehouse and price book",
          "anchor": "acceleratorsCircaCatalogueReference-1-store-warehouse-and-price-book",
          "level": 2
        },
        {
          "text": "Legacy eight-product subset and prices",
          "anchor": "acceleratorsCircaCatalogueReference-2-all-eight-source-products-and-prices",
          "level": 2
        },
        {
          "text": "Inventory and coupon pool",
          "anchor": "acceleratorsCircaCatalogueReference-3-inventory-and-coupon-pool",
          "level": 2
        },
        {
          "text": "Legacy promotion actions versus current additions",
          "anchor": "acceleratorsCircaCatalogueReference-4-promotion-actions-versus-title-claims",
          "level": 2
        },
        {
          "text": "What is not configured by this source catalogue",
          "anchor": "acceleratorsCircaCatalogueReference-5-what-is-not-configured-by-this-source-catalogue",
          "level": 2
        },
        {
          "text": "Customize and extend safely",
          "anchor": "acceleratorsCircaCatalogueReference-6-customize-and-extend-safely",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "acceleratorsCircaCatalogueReference-7-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "acceleratorsCircaCatalogueReference-8-verification",
          "level": 2
        },
        {
          "text": "Approved budgets and owner selections",
          "anchor": "acceleratorsCircaCatalogueReference-9-approved-budgets-and-owner-selections",
          "level": 2
        },
        {
          "text": "Original asset sale and refund",
          "anchor": "acceleratorsCircaCatalogueReference-10-original-asset-sale-and-refund",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "This page lists the current authored catalogue rather than only explaining the shopping flow. Beginners should read it alongside the purchase journey: a Product name, a Price row and a Promotion action are different records. The business and operator value is being able to reconcile what a customer sees with the actual configured price, supply and eligibility before a programme is published."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Store, warehouse and price book",
          "anchor": "acceleratorsCircaCatalogueReference-1-store-warehouse-and-price-book"
        },
        {
          "kind": "paragraph",
          "text": "The business decision is whether an authored offer is ready to sell. Product copy, price, inventory and executable benefit conditions must agree; a sample title alone is not evidence of an enforceable discount."
        },
        {
          "kind": "paragraph",
          "text": "The independent circa.ewaste:store REFERENCE pack contains five masters: circaMainStore, greenperks-cafe, greenperks-bistro, renewworks-repair and loopcycle-accessories. It is EXPLICIT sample-v001 version 0.0.1, destination COMMERCE, with no content publication/versioning. The required USER-triggered step follows Location and precedes Commerce. The main Store explicitly references Profile enterprise GREENPERKS_ONLINE, retaining POINTS, English and Asia/Dubai. GreenPerks outlets retain GREENPERKS_RETAIL and existing primaryLocationRef descriptors. RenewWorks/LoopCycle belong to RENEWWORKS_REPAIR_REUSE and LOOPCYCLE_RECYCLING without invented Locations. Store data lives in sample-v001/store/records/circaStoreData.js, selected by store/headers/circaStoreReferenceHeader.js. Importing references creates no target identity, membership, consent, stock or fulfillment authority."
        },
        {
          "kind": "paragraph",
          "text": "nImport dispatches this pack through the existing generated Store saveAll operation with the caller's groups and tenant-qualified code selector. Store remains responsible for write authorization and managed revision checks. This is fresh setup, not insert-only protection: canonical saveAll may update existing Stores after revision reconciliation, and generic insertOnly is unsupported for this managed-concurrency schema. An exact CURRENT release receipt prevents replay; changed bytes at the same version require governed recovery without rewriting receipts. Store-only selection can pass independently, but selecting rejected coupon/balance snapshots in the same action still rejects the whole plan before Store writes. No live installation or activation is proven by source validation."
        },
        {
          "kind": "paragraph",
          "text": "These are source identities and should not be renamed while upgrading an installed programme. A fresh adopter can select its own approved store and programme through custom data/configuration. Price currency POINTS does not establish an AED exchange rate, carbon price or cash settlement policy."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Legacy eight-product subset and prices",
          "anchor": "acceleratorsCircaCatalogueReference-2-all-eight-source-products-and-prices"
        },
        {
          "kind": "table",
          "headers": [
            "Product code",
            "Authored name",
            "unitAmount POINTS",
            "Historical comparison only; deleted snapshot quantity"
          ],
          "rows": [
            [
              "CIRCA_ASSET_EWA-1047",
              "Damaged ThinkPad T480",
              "34",
              "1"
            ],
            [
              "CIRCA_ASSET_EWA-1051",
              "Office LED Monitor",
              "26",
              "1"
            ],
            [
              "CIRCA_ASSET_EWA-1052",
              "Home Wi-Fi Router",
              "16",
              "1"
            ],
            [
              "CIRCA_ASSET_EWA-1055",
              "Compact Digital Camera",
              "20",
              "1"
            ],
            [
              "CIRCA_ASSET_EWA-1092",
              "Mesh Router Pair",
              "16",
              "1"
            ],
            [
              "CIRCA_COUPON_CPN-GRN-30",
              "AED 30 repair credit",
              "14",
              "50"
            ],
            [
              "CIRCA_COUPON_CPN-ECO-15",
              "15% recycled accessories offer",
              "9",
              "50"
            ],
            [
              "CIRCA_COUPON_CPN-SVC-50",
              "AED 50 device diagnosis",
              "20",
              "50"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "The table preserves the original eight-product subset, not the complete current catalogue. Current `modules/circa.ewaste/data/sample-v001/commerce/records/circaProductData.js` contains 43 DIGITAL products with fulfillmentStrategy DIGITAL_COMMERCE: five assets and 38 COUPON_CODE offers, including the three legacy offers above and 35 GreenPerks additions. Categories remain circaAssets and circaCoupons. Corresponding Variant and PriceRow files each contain 43 records; ProductLocalization and ProductVariantLocalization each contain 86 English/Arabic rows. Use these canonical business records for the complete identities, localized terms and prices. Legacy quantities in this table are not live or admitted stock; current availability must come from the qualified owner."
        },
        {
          "kind": "paragraph",
          "text": "The product code maps to variant code `<product>_VARIANT`, SKU `<product>_SKU` and price row `<product>_POINTS`. Price rows reference circaPointsPriceBook, productCode, unitAmount as a decimal string, currency POINTS and minQuantity \"1\". Product and variant localized content has English and Arabic rows. Missing offer terms must not be invented from a product title."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Inventory and coupon pool",
          "anchor": "acceleratorsCircaCatalogueReference-3-inventory-and-coupon-pool"
        },
        {
          "kind": "paragraph",
          "text": "The table's legacy quantities describe deleted historical snapshots only, not active source stock. Neither commerce nor a separate current selection contains raw InventoryBalance, CouponBatch or Coupon files. commerce-operational and its header are retired; selecting the former release refuses before dispatch. Historical shape/refusal examples may exist only in isolated test fixtures, never importable packs. Coupons use canonical Promotion supply. The five assets use Waste ownership and exact Digital binding, never warehouse balances as a substitute."
        },
        {
          "kind": "paragraph",
          "text": "All 38 coupon variants and both variant-localization families retain <product>_BATCH identities and demoPurchaseUnits 100. Six immutable issuer-scoped instructions replace raw snapshots: each issuer selects Budget, separately reviews consent, then selects Issuance with the original budget contribution checksum. These request 3,800 units but import no raw token/hash, counters, spend or grants. Original command replay and current owner gates apply. There is no replenishment or claim that any pool has been issued."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Legacy promotion actions versus current additions",
          "anchor": "acceleratorsCircaCatalogueReference-4-promotion-actions-versus-title-claims"
        },
        {
          "kind": "table",
          "headers": [
            "Promotion suffix/product",
            "Campaign validFrom",
            "Campaign validTo",
            "Approved source action"
          ],
          "rows": [
            [
              "CPN-GRN-30",
              "2026-01-01",
              "2026-12-31 23:59:59Z",
              "AMOUNT 30 AED at renewworks-repair; budget 3000"
            ],
            [
              "CPN-ECO-15",
              "2026-01-01",
              "2026-11-15 23:59:59Z",
              "PERCENT 15, cap 30 AED at loopcycle-accessories; budget 3000"
            ],
            [
              "CPN-SVC-50",
              "2026-01-01",
              "2027-01-20 23:59:59Z",
              "AMOUNT 50 AED at renewworks-repair; budget 5000"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "These three original offers preserve campaign/Product codes, ACTIVE status, revision 1, priority 25, coupon requirement and campaign dates. Pre-launch v001 nominal one-unit examples were replaced by explicitly approved fictional local terms, not inferred titles. CPN-GRN-30 and CPN-SVC-50 have issuer RENEWWORKS_REPAIR_REUSE; CPN-ECO-15 has LOOPCYCLE_RECYCLING. All name vendor GREENPERKS_ONLINE and exact eligible outlet storeCodes. Source correction never rewrites previously installed or issued rights."
        },
        {
          "kind": "paragraph",
          "text": "The 35 GreenPerks policies retain issuer GREENPERKS_RETAIL and vendor GREENPERKS_ONLINE. Six have the exact monetary budgets below. The other 29 have zero monetary budget and explicit actions.items SKU/quantity lists, unit EACH and no substitutions. All 38 policies have purchasedCouponPolicy.validityDays 30 and disclosed terms, retained by canonical immutable capture. A source mapping is not a verified priced/POS delivery receipt, issuer grant, real venue commitment or qualification."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "What is not configured by this source catalogue",
          "anchor": "acceleratorsCircaCatalogueReference-5-what-is-not-configured-by-this-source-catalogue"
        },
        {
          "kind": "paragraph",
          "text": "Every campaign has canonical Profile enterpriseRef, issuerEnterpriseRef and vendorEnterpriseRef descriptors. Original offers select exact RenewWorks/LoopCycle outlets; GreenPerks uses cafe, bistro or both according to its source partition. Parentage or Store import grants no eligibility. Separate issuer review requires benefitConsumption ISSUED_COUPON_BENEFIT_V1, exact vendor and expiry through the existing consent owner. Budget intent is not benefit-consumption authority. Exact ITEM bundles still require the verified owning delivery integration and original fulfillment evidence."
        },
        {
          "kind": "paragraph",
          "text": "All 38 source policies retain 30-day purchase-relative validity and disclosed fictional local-demo terms. Campaign validFrom/validTo are separate constraints, not the successful-sale timestamp. When independently qualified, the owner computes expiry from original successful sale and preserves exact retained policy through delivery/retry/recovery. Immutable capture now includes purchasedCouponPolicy; publication and setup/admission pins were refreshed canonically. This does not convert historical issued rights or certify native acceptance."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customize and extend safely",
          "anchor": "acceleratorsCircaCatalogueReference-6-customize-and-extend-safely"
        },
        {
          "kind": "paragraph",
          "text": "A partner developer creates focused Product, Variant, price, policy and localized deltas in its customer repository, referencing reusable owners. Keep publication, operations and documentation separate. Select four signed publication subsets, then issuer budget, separate human consent and issuance in order. Use genuine asset listing/binding and original-sale policies before reservation. Never add raw supply, current spend, synthetic receipts or caller-selected authority. See the [source inventory](/docs/framework/accelerators/circa/source-inventory) and [purchase journey](/docs/framework/accelerators/circa/coupons-commerce)."
        },
        {
          "kind": "paragraph",
          "text": "Reject missing variant/price, invalid currency, exhausted pool, wrong owner/outlet, unsupported condition or incomplete persistence evidence. Recovery uses original checkout/order keys and qualified owner compensation, not fresh purchases or raw database edits. Test default and custom layers, price changes, fixed/retained expiry, pool exhaustion, double redemption, terms display and interrupted reversal."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "acceleratorsCircaCatalogueReference-7-common-mistakes"
        },
        {
          "kind": "paragraph",
          "text": "Assuming a title defines mathematical benefit; treating legacy snapshot quantities as live stock; exposing coupon tokens; describing the 35 authored additions as merely planned; treating authored additions as installed or qualified; and publishing a website instead of the Commerce projection are incorrect. Local sample values are not a vendor promise or production acceptance."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "acceleratorsCircaCatalogueReference-8-verification"
        },
        {
          "kind": "paragraph",
          "text": "Current facts come from Commerce records/header, the five-Store reference pack, manifest, exact publication plans, six Promotion instruction packs and the separate Waste policy pack. commerce-operational/header and raw supply files are deleted, not active compatibility imports. Refusal tests and defaultCircaDemoCommerceImportAdmissionService.js preserve canonical decisions. No current purchase, token, wallet, receipt or native qualification was inspected. Operators reconcile owner receipts, Online projections, original admission, signed consent, verified delivery and payment/ownership separately."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Approved budgets and owner selections",
          "anchor": "acceleratorsCircaCatalogueReference-9-approved-budgets-and-owner-selections"
        },
        {
          "kind": "table",
          "headers": [
            "Campaign",
            "Canonical issuer",
            "Exact monetary budget"
          ],
          "rows": [
            [
              "GP-B12",
              "GREENPERKS_RETAIL",
              "2500"
            ],
            [
              "GP-A07",
              "GREENPERKS_RETAIL",
              "1000"
            ],
            [
              "GP-A08",
              "GREENPERKS_RETAIL",
              "2000"
            ],
            [
              "GP-A09",
              "GREENPERKS_RETAIL",
              "3000"
            ],
            [
              "GP-A10",
              "GREENPERKS_RETAIL",
              "2000"
            ],
            [
              "GP-A11",
              "GREENPERKS_RETAIL",
              "4000"
            ],
            [
              "CPN-GRN-30",
              "RENEWWORKS_REPAIR_REUSE",
              "3000"
            ],
            [
              "CPN-ECO-15",
              "LOOPCYCLE_RECYCLING",
              "3000"
            ],
            [
              "CPN-SVC-50",
              "RENEWWORKS_REPAIR_REUSE",
              "5000"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "These nine budgets total 25,500: GreenPerks 14,500, RenewWorks 8,000 and LoopCycle 3,000. The 29 exact ITEM bundles have monetary budget zero. This is a liability limit, not POINTS funding, an AED exchange rate or current spend. All campaigns target 100 units without replenishment. Only fictional Local-demo source was approved; independent owner gates remain required."
        },
        {
          "kind": "table",
          "headers": [
            "Signed issuer",
            "Original budget pack",
            "Later issuance pack",
            "Campaigns",
            "Original linkage"
          ],
          "rows": [
            [
              "GREENPERKS_RETAIL",
              "circaGreenPerksBudget",
              "circaGreenPerksIssuance",
              "35",
              "100 per campaign; original admission checksum required"
            ],
            [
              "RENEWWORKS_REPAIR_REUSE",
              "circaRenewWorksBudget",
              "circaRenewWorksIssuance",
              "2",
              "100 per campaign; original admission checksum required"
            ],
            [
              "LOOPCYCLE_RECYCLING",
              "circaLoopCycleBudget",
              "circaLoopCycleIssuance",
              "1",
              "100 per campaign; original admission checksum required"
            ]
          ]
        },
        {
          "kind": "table",
          "headers": [
            "Signed enterprise",
            "Publication subset",
            "Roots",
            "Coverage"
          ],
          "rows": [
            [
              "GREENPERKS_ONLINE",
              "circaCataloguePublicationPlan",
              "46",
              "43 Products, PriceBook with 43 PriceRows, Warehouse, TaxPolicy"
            ],
            [
              "GREENPERKS_RETAIL",
              "circaGreenPerksPublicationPlan",
              "35",
              "Only this issuer's exact Promotion roots"
            ],
            [
              "RENEWWORKS_REPAIR_REUSE",
              "circaRenewWorksPublicationPlan",
              "2",
              "Only this issuer's exact Promotion roots"
            ],
            [
              "LOOPCYCLE_RECYCLING",
              "circaLoopCyclePublicationPlan",
              "1",
              "Only this issuer's exact Promotion roots"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "The aggregate circaPublicationPlan is an inventory, never one mixed-authority submission. Source pins include purchasedCouponPolicy. Budget-before-consent and issuance-after-consent use signed issuer identity; GREENPERKS_ONLINE is the vendor. The nonimportable checklist carries expiry 2026-11-08T23:59:59.000Z and benefitConsumption ISSUED_COUPON_BENEFIT_V1. A human issuer must review through canonical consent manage; re-read its projected purpose before issuance. See the [Promotion owner guide](/docs/framework/promotion-campaigns-coupon-issuance) and llm/contracts/accelerator-setup-contributions.md."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Original asset sale and refund",
          "anchor": "acceleratorsCircaCatalogueReference-10-original-asset-sale-and-refund"
        },
        {
          "kind": "table",
          "headers": [
            "Waste-owned schema",
            "Exact policy code",
            "Retained intent"
          ],
          "rows": [
            [
              "wasteAssetTransferPolicy",
              "CIRCA_LOCAL_DIGITAL_OWNERSHIP_V1",
              "SELL to counterparty; 600-second reservation and required lock; original approval rewards retained; no custody/carbon transfer"
            ],
            [
              "wasteRewardSettlementPolicy",
              "CIRCA_LOCAL_DIGITAL_SALE_REWARD_V1",
              "CAPTURED_TOTAL to CURRENT_SELLER; circa/points; POINTS scale 2; no platform fee or split"
            ],
            [
              "wasteCarbonSettlementPolicy",
              "CIRCA_LOCAL_DIGITAL_SALE_CARBON_NONE_V1",
              "SALE / NONE; no mint or carbon ledger movement"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Select circa.ewaste:circaDigitalOwnershipPolicies on WASTE, explicit and Local-only, before the five quantity-one assets are genuinely bound and sold. Transfer metadata includes digitalOwnership.refund ORIGINAL_TRANSFER_REVERSAL_ONLY_BEFORE_ONWARD_TRANSFER before reservation. This pack fabricates no seller, binding, grant, payment or event. Canonical Waste seller ownership remains authoritative; captured POINTS proceeds go entirely to the original current seller, not to the marketplace by association."
        },
        {
          "kind": "paragraph",
          "text": "Refund needs original Order review/approval, original seller earning reversal, original buyer capture and unchanged retained policies, with no onward transfer. Older snapshots missing the term remain refused/manual-review-only even if current policy is amended. Never backfill snapshots or imply physical custody reversal. Canonical details are eWaste llm/contracts/digital-ownership-sale.md#original-sale-refund, DefaultEWasteDigitalSaleService and DefaultEWasteOrderReversalService. This is SOURCE_ONLY, not native qualification."
        }
      ],
      "searchText": "Circa Store, Product, Price and Coupon Record Reference Exact store, product, variant, points price, inventory, promotion, batch and code-pool sample records. # Circa Store, Product, Price and Coupon Record Reference\n\nThis page lists the current authored catalogue rather than only explaining the shopping flow. Beginners should read it alongside the purchase journey: a Product name, a Price row and a Promotion action are different records. The business and operator value is being able to reconcile what a customer sees with the actual configured price, supply and eligibility before a programme is published.\n\n## Store, warehouse and price book\n\nThe business decision is whether an authored offer is ready to sell. Product copy, price, inventory and executable benefit conditions must agree; a sample title alone is not evidence of an enforceable discount.\n\nThe independent circa.ewaste:store REFERENCE pack contains five masters: circaMainStore, greenperks-cafe, greenperks-bistro, renewworks-repair and loopcycle-accessories. It is EXPLICIT sample-v001 version 0.0.1, destination COMMERCE, with no content publication/versioning. The required USER-triggered step follows Location and precedes Commerce. The main Store explicitly references Profile enterprise GREENPERKS_ONLINE, retaining POINTS, English and Asia/Dubai. GreenPerks outlets retain GREENPERKS_RETAIL and existing primaryLocationRef descriptors. RenewWorks/LoopCycle belong to RENEWWORKS_REPAIR_REUSE and LOOPCYCLE_RECYCLING without invented Locations. Store data lives in sample-v001/store/records/circaStoreData.js, selected by store/headers/circaStoreReferenceHeader.js. Importing references creates no target identity, membership, consent, stock or fulfillment authority.\n\nnImport dispatches this pack through the existing generated Store saveAll operation with the caller's groups and tenant-qualified code selector. Store remains responsible for write authorization and managed revision checks. This is fresh setup, not insert-only protection: canonical saveAll may update existing Stores after revision reconciliation, and generic insertOnly is unsupported for this managed-concurrency schema. An exact CURRENT release receipt prevents replay; changed bytes at the same version require governed recovery without rewriting receipts. Store-only selection can pass independently, but selecting rejected coupon/balance snapshots in the same action still rejects the whole plan before Store writes. No live installation or activation is proven by source validation.\n\nThese are source identities and should not be renamed while upgrading an installed programme. A fresh adopter can select its own approved store and programme through custom data/configuration. Price currency POINTS does not establish an AED exchange rate, carbon price or cash settlement policy.\n\n## Legacy eight-product subset and prices\n\n| Product code | Authored name | unitAmount POINTS | Historical comparison only; deleted snapshot quantity |\n| --- | --- | --- | --- |\n| CIRCA_ASSET_EWA-1047 | Damaged ThinkPad T480 | 34 | 1 |\n| CIRCA_ASSET_EWA-1051 | Office LED Monitor | 26 | 1 |\n| CIRCA_ASSET_EWA-1052 | Home Wi-Fi Router | 16 | 1 |\n| CIRCA_ASSET_EWA-1055 | Compact Digital Camera | 20 | 1 |\n| CIRCA_ASSET_EWA-1092 | Mesh Router Pair | 16 | 1 |\n| CIRCA_COUPON_CPN-GRN-30 | AED 30 repair credit | 14 | 50 |\n| CIRCA_COUPON_CPN-ECO-15 | 15% recycled accessories offer | 9 | 50 |\n| CIRCA_COUPON_CPN-SVC-50 | AED 50 device diagnosis | 20 | 50 |\n\nThe table preserves the original eight-product subset, not the complete current catalogue. Current `modules/circa.ewaste/data/sample-v001/commerce/records/circaProductData.js` contains 43 DIGITAL products with fulfillmentStrategy DIGITAL_COMMERCE: five assets and 38 COUPON_CODE offers, including the three legacy offers above and 35 GreenPerks additions. Categories remain circaAssets and circaCoupons. Corresponding Variant and PriceRow files each contain 43 records; ProductLocalization and ProductVariantLocalization each contain 86 English/Arabic rows. Use these canonical business records for the complete identities, localized terms and prices. Legacy quantities in this table are not live or admitted stock; current availability must come from the qualified owner.\n\nThe product code maps to variant code `<product>_VARIANT`, SKU `<product>_SKU` and price row `<product>_POINTS`. Price rows reference circaPointsPriceBook, productCode, unitAmount as a decimal string, currency POINTS and minQuantity \"1\". Product and variant localized content has English and Arabic rows. Missing offer terms must not be invented from a product title.\n\n## Inventory and coupon pool\n\nThe table's legacy quantities describe deleted historical snapshots only, not active source stock. Neither commerce nor a separate current selection contains raw InventoryBalance, CouponBatch or Coupon files. commerce-operational and its header are retired; selecting the former release refuses before dispatch. Historical shape/refusal examples may exist only in isolated test fixtures, never importable packs. Coupons use canonical Promotion supply. The five assets use Waste ownership and exact Digital binding, never warehouse balances as a substitute.\n\nAll 38 coupon variants and both variant-localization families retain <product>_BATCH identities and demoPurchaseUnits 100. Six immutable issuer-scoped instructions replace raw snapshots: each issuer selects Budget, separately reviews consent, then selects Issuance with the original budget contribution checksum. These request 3,800 units but import no raw token/hash, counters, spend or grants. Original command replay and current owner gates apply. There is no replenishment or claim that any pool has been issued.\n\n## Legacy promotion actions versus current additions\n\n| Promotion suffix/product | Campaign validFrom | Campaign validTo | Approved source action |\n| --- | --- | --- | --- |\n| CPN-GRN-30 | 2026-01-01 | 2026-12-31 23:59:59Z | AMOUNT 30 AED at renewworks-repair; budget 3000 |\n| CPN-ECO-15 | 2026-01-01 | 2026-11-15 23:59:59Z | PERCENT 15, cap 30 AED at loopcycle-accessories; budget 3000 |\n| CPN-SVC-50 | 2026-01-01 | 2027-01-20 23:59:59Z | AMOUNT 50 AED at renewworks-repair; budget 5000 |\n\nThese three original offers preserve campaign/Product codes, ACTIVE status, revision 1, priority 25, coupon requirement and campaign dates. Pre-launch v001 nominal one-unit examples were replaced by explicitly approved fictional local terms, not inferred titles. CPN-GRN-30 and CPN-SVC-50 have issuer RENEWWORKS_REPAIR_REUSE; CPN-ECO-15 has LOOPCYCLE_RECYCLING. All name vendor GREENPERKS_ONLINE and exact eligible outlet storeCodes. Source correction never rewrites previously installed or issued rights.\n\nThe 35 GreenPerks policies retain issuer GREENPERKS_RETAIL and vendor GREENPERKS_ONLINE. Six have the exact monetary budgets below. The other 29 have zero monetary budget and explicit actions.items SKU/quantity lists, unit EACH and no substitutions. All 38 policies have purchasedCouponPolicy.validityDays 30 and disclosed terms, retained by canonical immutable capture. A source mapping is not a verified priced/POS delivery receipt, issuer grant, real venue commitment or qualification.\n\n## What is not configured by this source catalogue\n\nEvery campaign has canonical Profile enterpriseRef, issuerEnterpriseRef and vendorEnterpriseRef descriptors. Original offers select exact RenewWorks/LoopCycle outlets; GreenPerks uses cafe, bistro or both according to its source partition. Parentage or Store import grants no eligibility. Separate issuer review requires benefitConsumption ISSUED_COUPON_BENEFIT_V1, exact vendor and expiry through the existing consent owner. Budget intent is not benefit-consumption authority. Exact ITEM bundles still require the verified owning delivery integration and original fulfillment evidence.\n\nAll 38 source policies retain 30-day purchase-relative validity and disclosed fictional local-demo terms. Campaign validFrom/validTo are separate constraints, not the successful-sale timestamp. When independently qualified, the owner computes expiry from original successful sale and preserves exact retained policy through delivery/retry/recovery. Immutable capture now includes purchasedCouponPolicy; publication and setup/admission pins were refreshed canonically. This does not convert historical issued rights or certify native acceptance.\n\n## Customize and extend safely\n\nA partner developer creates focused Product, Variant, price, policy and localized deltas in its customer repository, referencing reusable owners. Keep publication, operations and documentation separate. Select four signed publication subsets, then issuer budget, separate human consent and issuance in order. Use genuine asset listing/binding and original-sale policies before reservation. Never add raw supply, current spend, synthetic receipts or caller-selected authority. See the [source inventory](/docs/framework/accelerators/circa/source-inventory) and [purchase journey](/docs/framework/accelerators/circa/coupons-commerce).\n\nReject missing variant/price, invalid currency, exhausted pool, wrong owner/outlet, unsupported condition or incomplete persistence evidence. Recovery uses original checkout/order keys and qualified owner compensation, not fresh purchases or raw database edits. Test default and custom layers, price changes, fixed/retained expiry, pool exhaustion, double redemption, terms display and interrupted reversal.\n\n## Common mistakes\n\nAssuming a title defines mathematical benefit; treating legacy snapshot quantities as live stock; exposing coupon tokens; describing the 35 authored additions as merely planned; treating authored additions as installed or qualified; and publishing a website instead of the Commerce projection are incorrect. Local sample values are not a vendor promise or production acceptance.\n\n## Verification\n\nCurrent facts come from Commerce records/header, the five-Store reference pack, manifest, exact publication plans, six Promotion instruction packs and the separate Waste policy pack. commerce-operational/header and raw supply files are deleted, not active compatibility imports. Refusal tests and defaultCircaDemoCommerceImportAdmissionService.js preserve canonical decisions. No current purchase, token, wallet, receipt or native qualification was inspected. Operators reconcile owner receipts, Online projections, original admission, signed consent, verified delivery and payment/ownership separately.\n\n## Approved budgets and owner selections\n\n| Campaign | Canonical issuer | Exact monetary budget |\n| --- | --- | --- |\n| GP-B12 | GREENPERKS_RETAIL | 2500 |\n| GP-A07 | GREENPERKS_RETAIL | 1000 |\n| GP-A08 | GREENPERKS_RETAIL | 2000 |\n| GP-A09 | GREENPERKS_RETAIL | 3000 |\n| GP-A10 | GREENPERKS_RETAIL | 2000 |\n| GP-A11 | GREENPERKS_RETAIL | 4000 |\n| CPN-GRN-30 | RENEWWORKS_REPAIR_REUSE | 3000 |\n| CPN-ECO-15 | LOOPCYCLE_RECYCLING | 3000 |\n| CPN-SVC-50 | RENEWWORKS_REPAIR_REUSE | 5000 |\n\nThese nine budgets total 25,500: GreenPerks 14,500, RenewWorks 8,000 and LoopCycle 3,000. The 29 exact ITEM bundles have monetary budget zero. This is a liability limit, not POINTS funding, an AED exchange rate or current spend. All campaigns target 100 units without replenishment. Only fictional Local-demo source was approved; independent owner gates remain required.\n\n| Signed issuer | Original budget pack | Later issuance pack | Campaigns | Original linkage |\n| --- | --- | --- | --- | --- |\n| GREENPERKS_RETAIL | circaGreenPerksBudget | circaGreenPerksIssuance | 35 | 100 per campaign; original admission checksum required |\n| RENEWWORKS_REPAIR_REUSE | circaRenewWorksBudget | circaRenewWorksIssuance | 2 | 100 per campaign; original admission checksum required |\n| LOOPCYCLE_RECYCLING | circaLoopCycleBudget | circaLoopCycleIssuance | 1 | 100 per campaign; original admission checksum required |\n\n| Signed enterprise | Publication subset | Roots | Coverage |\n| --- | --- | --- | --- |\n| GREENPERKS_ONLINE | circaCataloguePublicationPlan | 46 | 43 Products, PriceBook with 43 PriceRows, Warehouse, TaxPolicy |\n| GREENPERKS_RETAIL | circaGreenPerksPublicationPlan | 35 | Only this issuer's exact Promotion roots |\n| RENEWWORKS_REPAIR_REUSE | circaRenewWorksPublicationPlan | 2 | Only this issuer's exact Promotion roots |\n| LOOPCYCLE_RECYCLING | circaLoopCyclePublicationPlan | 1 | Only this issuer's exact Promotion roots |\n\nThe aggregate circaPublicationPlan is an inventory, never one mixed-authority submission. Source pins include purchasedCouponPolicy. Budget-before-consent and issuance-after-consent use signed issuer identity; GREENPERKS_ONLINE is the vendor. The nonimportable checklist carries expiry 2026-11-08T23:59:59.000Z and benefitConsumption ISSUED_COUPON_BENEFIT_V1. A human issuer must review through canonical consent manage; re-read its projected purpose before issuance. See the [Promotion owner guide](/docs/framework/promotion-campaigns-coupon-issuance) and llm/contracts/accelerator-setup-contributions.md.\n\n## Original asset sale and refund\n\n| Waste-owned schema | Exact policy code | Retained intent |\n| --- | --- | --- |\n| wasteAssetTransferPolicy | CIRCA_LOCAL_DIGITAL_OWNERSHIP_V1 | SELL to counterparty; 600-second reservation and required lock; original approval rewards retained; no custody/carbon transfer |\n| wasteRewardSettlementPolicy | CIRCA_LOCAL_DIGITAL_SALE_REWARD_V1 | CAPTURED_TOTAL to CURRENT_SELLER; circa/points; POINTS scale 2; no platform fee or split |\n| wasteCarbonSettlementPolicy | CIRCA_LOCAL_DIGITAL_SALE_CARBON_NONE_V1 | SALE / NONE; no mint or carbon ledger movement |\n\nSelect circa.ewaste:circaDigitalOwnershipPolicies on WASTE, explicit and Local-only, before the five quantity-one assets are genuinely bound and sold. Transfer metadata includes digitalOwnership.refund ORIGINAL_TRANSFER_REVERSAL_ONLY_BEFORE_ONWARD_TRANSFER before reservation. This pack fabricates no seller, binding, grant, payment or event. Canonical Waste seller ownership remains authoritative; captured POINTS proceeds go entirely to the original current seller, not to the marketplace by association.\n\nRefund needs original Order review/approval, original seller earning reversal, original buyer capture and unchanged retained policies, with no onward transfer. Older snapshots missing the term remain refused/manual-review-only even if current policy is amended. Never backfill snapshots or imply physical custody reversal. Canonical details are eWaste llm/contracts/digital-ownership-sale.md#original-sale-refund, DefaultEWasteDigitalSaleService and DefaultEWasteOrderReversalService. This is SOURCE_ONLY, not native qualification.\n",
      "previous": {
        "title": "Circa Source Release and Record Inventory",
        "route": "/docs/framework/accelerators/circa/source-inventory"
      },
      "next": {
        "title": "Circa Configuration and Extension Reference",
        "route": "/docs/framework/accelerators/circa/configuration-reference"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.accelerators",
        "technicalModule": "eWaste",
        "owner": "eWaste",
        "sourcePath": "data/docs-v001/records/documentation/eWasteDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/eWasteDocumentationComponentData.js",
        "wordCount": 1736,
        "checksum": "f258f8f97748b8c4d6b676a125b743cf5ce8432f2ac411ed48facb239cc72fc6"
      },
      "slug": "accelerators-circa-catalogue-reference",
      "locale": "en",
      "navigationGroup": "Circa eWaste Product",
      "navigationGroupCode": "circa-ewaste-product",
      "navigationGroupOrder": 20,
      "navigationOrder": 110,
      "references": [
        {
          "documentId": "accelerators.circa-overview",
          "owner": "eWaste"
        },
        {
          "documentId": "accelerators.circa-data-network",
          "owner": "eWaste"
        },
        {
          "documentId": "accelerators.circa-customization",
          "owner": "eWaste"
        }
      ]
    },
    "active": true
  },
  "record4": {
    "code": "nodicsDocsComponentacceleratorsCircaConfigurationReference",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "accelerators.circa-configuration-reference",
      "title": "Circa Configuration and Extension Reference",
      "route": "/docs/framework/accelerators/circa/configuration-reference",
      "section": "accelerators-and-industry-solution-templates",
      "sectionTitle": "Accelerators and Industry Solution Templates",
      "group": "accelerators-and-industry-solution-templates",
      "groupTitle": "Accelerators and Industry Solution Templates",
      "parentId": "accelerators-and-industry-solution-templates",
      "hierarchyPath": [
        "Accelerators and Industry Solution Templates",
        "Circa Configuration and Extension Reference"
      ],
      "hierarchyDepth": 2,
      "documentType": "configuration",
      "audience": [
        "business",
        "architect",
        "administrator",
        "developer",
        "operator",
        "qa",
        "ai-tool"
      ],
      "businessAudience": [],
      "technicalAudience": [],
      "summary": "Application and domain configuration groups, current policy values, provider gates and later-layer customization.",
      "visibility": "public",
      "accessMode": "PUBLIC",
      "publiclyAvailable": true,
      "requiresAuthentication": false,
      "allowedRoles": [],
      "allowedGroups": [],
      "allowedPermissions": [],
      "lifecycleState": "ONLINE",
      "version": "0.16.16",
      "maturityState": "partial",
      "implementationState": "current",
      "renderingComponent": "documentation.component.article",
      "relatedPages": [
        "accelerators.circa-overview",
        "accelerators.circa-data-network",
        "accelerators.circa-customization"
      ],
      "sourceEvidence": [
        "../../../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/config/properties.js",
        "package.json",
        "src/service"
      ],
      "visualRequirements": [
        "table"
      ],
      "searchKeywords": [
        "circa",
        "ewaste",
        "configuration-reference",
        "configuration",
        "source records"
      ],
      "topicKeywords": [
        "Circa",
        "Source reference"
      ],
      "headings": [
        {
          "text": "Application and journey settings",
          "anchor": "acceleratorsCircaConfigurationReference-1-application-and-journey-settings",
          "level": 2
        },
        {
          "text": "Marketplace, rewards and review policy",
          "anchor": "acceleratorsCircaConfigurationReference-2-marketplace-rewards-and-review-policy",
          "level": 2
        },
        {
          "text": "Full top-level configuration ownership index",
          "anchor": "acceleratorsCircaConfigurationReference-3-full-top-level-configuration-ownership-index",
          "level": 2
        },
        {
          "text": "Providers, communication and secrets",
          "anchor": "acceleratorsCircaConfigurationReference-4-providers-communication-and-secrets",
          "level": 2
        },
        {
          "text": "Customize and extend safely",
          "anchor": "acceleratorsCircaConfigurationReference-5-customize-and-extend-safely",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "acceleratorsCircaConfigurationReference-6-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "acceleratorsCircaConfigurationReference-7-verification",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "This page indexes every top-level contribution in Circa's backend configuration, so beginners can locate a setting instead of searching unrelated framework defaults. The source is `modules/circa.ewaste/config/properties.js` in the customer backend. Values describe authored reference choices as reviewed on 30 September 2026; they are not an effective runtime export. Business/operator policy, environment layers, server/module load order and governed runtime configuration can change the outcome."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Application and journey settings",
          "anchor": "acceleratorsCircaConfigurationReference-1-application-and-journey-settings"
        },
        {
          "kind": "paragraph",
          "text": "The business value of layered configuration is adapting the Circa journey without copying authoritative domain engines. Developers and operators must distinguish project defaults from effective runtime policy and persisted records."
        },
        {
          "kind": "table",
          "headers": [
            "Property",
            "Source choice and meaning"
          ],
          "rows": [
            [
              "circaEWaste.application.code",
              "CIRCA_EWASTE; preserve on installed upgrades"
            ],
            [
              "application.frontendModuleName",
              "nodics.circa.eWaste"
            ],
            [
              "application.projectModuleName",
              "circa.ewaste"
            ],
            [
              "application.backendModuleName",
              "eWaste; reusable domain owner"
            ],
            [
              "application.frameworkModuleName",
              "nodics.waste; generic Waste authority"
            ],
            [
              "application.requiredScenarioModules",
              "eWaste and wasteRecycling; dependency selection is not journey acceptance"
            ],
            [
              "presentation.brandName/brandByline",
              "Circa / by Nodics"
            ],
            [
              "presentation.sampleMode",
              "true; do not hide illustrative limitations"
            ],
            [
              "presentation.walletLabels",
              "Reward points / Carbon units"
            ],
            [
              "journey.contractVersion",
              "2"
            ],
            [
              "journey.arrivalRadiusMetres",
              "Environment descriptor CIRCA_EWASTE_ARRIVAL_RADIUS_METRES, numeric fallback 50"
            ],
            [
              "journey.conversationMaximumCharacters",
              "1500"
            ],
            [
              "journey.reviewAssignment.queueCode",
              "CIRCA_EWASTE_REVIEW"
            ],
            [
              "journey.depositInstruction",
              "Parameterized centre-name display instruction, not receipt evidence"
            ],
            [
              "journeys",
              "submission, approvedAsset, marketplace, gift, donation, couponRedemption and recyclingHandoff enabled source flags"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Enabled journey flags describe selection, not completed production integration. Radius is distance-based and inclusive; reported accuracy does not replace direct distance or fresh coordinates. Do not assume historical values in old notes are the effective radius. The existing eWaste/Location owners define timing and validity requirements; the Circa module cannot manufacture an arrival proof."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Marketplace, rewards and review policy",
          "anchor": "acceleratorsCircaConfigurationReference-2-marketplace-rewards-and-review-policy"
        },
        {
          "kind": "paragraph",
          "text": "`eWaste.marketplace` selects circaPointsPriceBook, circaDigitalRegistry, CIRCA_LOCAL_DIGITAL_OWNERSHIP_V1, circaMainStore and circaStaged. Currency is POINTS, programme circa, reward type points and carbon reward type circaCarbon. rewardScale is 2, carbonScale 3, jurisdiction CIRCA_SAMPLE, saleMode DIGITAL_OWNERSHIP, couponCarbonMode UNCHANGED, orderCodePrefix CIRCA_ORDER_ and refundsEnabled true. autoPublishListings is a source policy choice, not permission to bypass publication approval. Listing presentation explicitly says no physical delivery is included."
        },
        {
          "kind": "paragraph",
          "text": "`circaEWaste.rewardValuation` declares illustrative true, version circa-weight-rewards-v2, pointsPerKg 10 and carbonUnitsPerEstimatedKg 1. The selected provider is DefaultCircaEWasteRewardValuationService. These are sample valuation settings, not cash conversion or certified carbon issuance. Owner Rules/ Loyalty evidence governs actual assessment and settlement. Later reassessments do not recalculate old balances automatically."
        },
        {
          "kind": "paragraph",
          "text": "`waste.projectOverlay` selects circa.ewaste:waste-policy as a PROJECT layer. `waste.operations` requires scopes and verification and does not require different approver. Broader business-role or application flags cannot relax those checks."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Full top-level configuration ownership index",
          "anchor": "acceleratorsCircaConfigurationReference-3-full-top-level-configuration-ownership-index"
        },
        {
          "kind": "table",
          "headers": [
            "Configuration subtree",
            "Purpose and owner interpretation"
          ],
          "rows": [
            [
              "tooling.acceptance.wasteManagement.fixture",
              "Inert acceptance fixture codes, expected metrics and receipt prerequisite; not automatic test execution"
            ],
            [
              "data.dataReleases.runtimeRoleProfiles",
              "WASTE initialization profile selecting material/eWaste/Circa references"
            ],
            [
              "product.runtimeRoleProfiles",
              "COMMERCE_STAGED authoring, circaStaged, en/ar locales"
            ],
            [
              "cart.runtimeRoleProfiles",
              "COMMERCE customer default jurisdiction AE and currency AED; not the marketplace POINTS price book"
            ],
            [
              "fulfillmentCore.runtimeRoleProfiles",
              "Configured physical shipping/return options; does not make digital ownership physically delivered"
            ],
            [
              "circaEWaste",
              "App/presentation/journey/sample valuation; see above"
            ],
            [
              "order.disputes/order.refunds",
              "CIRCA_ORDER_ scope and configured eWaste owner port/target authority"
            ],
            [
              "promotion.legacyTokenHashPolicies",
              "TENANT_COLON_UPPERCASE_SHA256 compatibility; not permission to expose tokens"
            ],
            [
              "digitalCore.merchantRedemption",
              "Source enabled flag; complete merchant/outlet qualification remains independent"
            ],
            [
              "profileExternalIdentity",
              "Circa TELEGRAM application binding and one-use browser-handoff requirement"
            ],
            [
              "runtimeConfigurationSchemas",
              "telegramExternalIdentity and telegramDelivery governance; sensitive secret fields, permissions and refresh behavior"
            ],
            [
              "bidding",
              "Enabled bid policy, exact amount scale/maximum and per-store choices"
            ],
            [
              "cms.publication",
              "Project publication choices; nPublish remains generic authority"
            ],
            [
              "backofficeApplicationInitialization.profiles",
              "Circa setup identity, capabilities, user-triggered packages and Online approval requirement"
            ],
            [
              "media.customerUploads",
              "Source enabled choice; Media still authorizes upload/storage"
            ],
            [
              "waste",
              "Project overlay and operational checks"
            ],
            [
              "wasteImpact.calculation",
              "Provider selection, fallback chain, timeout and explicit mock compatibility policy"
            ],
            [
              "eWaste",
              "Domain policy deltas, owner authorities, marketplace, communication/channel/guidance composition"
            ],
            [
              "apiExposure.categories.circaCustomer",
              "App route exposure; each route still enforces its permission/auth contract"
            ],
            [
              "copilot.runtimeRoleProfiles",
              "WASTE ingestion, scoped knowledge registry, provider references and generation profiles"
            ],
            [
              "wasteSubmission.runtimeRoleProfiles",
              "WASTE metadata suggestion enable/adapter/profile"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "This is a discovery index, not an invitation to duplicate those framework owners inside a project service. Read the owner contract for each subtree before changing it. Project configuration should contain actual selection/deltas, not copied default endpoints, service credentials or alternative authentication registries."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Providers, communication and secrets",
          "anchor": "acceleratorsCircaConfigurationReference-4-providers-communication-and-secrets"
        },
        {
          "kind": "paragraph",
          "text": "`wasteImpact.calculation` selects DefaultEWasteOpenAiImpactProviderService, then DefaultEWasteWarmImpactProviderService fallback, timeoutMs 90000 and failureMode RESULT. Its mock compatibility subtree defines illustrative weights/factors but does not activate a mock provider. Metadata suggestion separately selects OpenAI with profile eWastePhotoMetadata. Copilot profiles also include structuredTool and customerGuidance; guidance uses scoped customer knowledge and configured runtime provider choices. Provider/model configuration is not evidence of a successful call."
        },
        {
          "kind": "paragraph",
          "text": "`eWaste.channelAuthentication` selects TELEGRAM with Circa application binding and seamlessSignIn choice. Outcome communication selects engagement and WASTE_REVIEW_OUTCOME_V1. Target authorities separately identify ENGAGEMENT, COMMERCE, COMMERCE_STAGED and WCMS_STAGED. Optional coupon EMAIL/SMS resources do not become active lifecycle triggers through these waste-outcome settings."
        },
        {
          "kind": "paragraph",
          "text": "Telegram bot and provider secrets are referenced through governed runtime fields. This guide does not reproduce secret values, sample passwords or effective bearer tokens. Runtime configuration permissions and refresh/restart policy must be honored; source field declarations alone do not prove current credentials are present."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customize and extend safely",
          "anchor": "acceleratorsCircaConfigurationReference-5-customize-and-extend-safely"
        },
        {
          "kind": "paragraph",
          "text": "Developers export a focused project config delta. For example, select a custom published Store and price book together while preserving original installed order prefix/application identity during an upgrade. Use `$config` replace/ref/env/path descriptors only under their existing contracts; replacing an array can remove required predecessors and must be tested. Never let a customer request choose provider or service identifiers. Validate effective merge, rejected values, missing provider recovery and default-versus-later-layer behavior before activation."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "acceleratorsCircaConfigurationReference-6-common-mistakes"
        },
        {
          "kind": "paragraph",
          "text": "Using Cart AED defaults as the coupon POINTS currency; treating mock settings as an active provider; changing a flag as proof of integration; copying secret values; and confusing source policy with installed data are incorrect. Production DevOps must inspect the effective runtime and owner release evidence independently."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "acceleratorsCircaConfigurationReference-7-verification"
        },
        {
          "kind": "paragraph",
          "text": "Review this index whenever properties.js gains/removes a subtree. Check selected module/server order, environment references, governed runtime values and actual owner availability during joint acceptance. CMS documentation validation does not start providers or mutate runtime configuration. Continue with [customization](/docs/framework/accelerators/circa/customization), [record inventory](/docs/framework/accelerators/circa/source-inventory) and [deployment](/docs/framework/accelerators/circa/deployment-verification)."
        }
      ],
      "searchText": "Circa Configuration and Extension Reference Application and domain configuration groups, current policy values, provider gates and later-layer customization. # Circa Configuration and Extension Reference\n\nThis page indexes every top-level contribution in Circa's backend configuration, so beginners can locate a setting instead of searching unrelated framework defaults. The source is `modules/circa.ewaste/config/properties.js` in the customer backend. Values describe authored reference choices as reviewed on 30 September 2026; they are not an effective runtime export. Business/operator policy, environment layers, server/module load order and governed runtime configuration can change the outcome.\n\n## Application and journey settings\n\nThe business value of layered configuration is adapting the Circa journey without copying authoritative domain engines. Developers and operators must distinguish project defaults from effective runtime policy and persisted records.\n\n| Property | Source choice and meaning |\n| --- | --- |\n| circaEWaste.application.code | CIRCA_EWASTE; preserve on installed upgrades |\n| application.frontendModuleName | nodics.circa.eWaste |\n| application.projectModuleName | circa.ewaste |\n| application.backendModuleName | eWaste; reusable domain owner |\n| application.frameworkModuleName | nodics.waste; generic Waste authority |\n| application.requiredScenarioModules | eWaste and wasteRecycling; dependency selection is not journey acceptance |\n| presentation.brandName/brandByline | Circa / by Nodics |\n| presentation.sampleMode | true; do not hide illustrative limitations |\n| presentation.walletLabels | Reward points / Carbon units |\n| journey.contractVersion | 2 |\n| journey.arrivalRadiusMetres | Environment descriptor CIRCA_EWASTE_ARRIVAL_RADIUS_METRES, numeric fallback 50 |\n| journey.conversationMaximumCharacters | 1500 |\n| journey.reviewAssignment.queueCode | CIRCA_EWASTE_REVIEW |\n| journey.depositInstruction | Parameterized centre-name display instruction, not receipt evidence |\n| journeys | submission, approvedAsset, marketplace, gift, donation, couponRedemption and recyclingHandoff enabled source flags |\n\nEnabled journey flags describe selection, not completed production integration. Radius is distance-based and inclusive; reported accuracy does not replace direct distance or fresh coordinates. Do not assume historical values in old notes are the effective radius. The existing eWaste/Location owners define timing and validity requirements; the Circa module cannot manufacture an arrival proof.\n\n## Marketplace, rewards and review policy\n\n`eWaste.marketplace` selects circaPointsPriceBook, circaDigitalRegistry, CIRCA_LOCAL_DIGITAL_OWNERSHIP_V1, circaMainStore and circaStaged. Currency is POINTS, programme circa, reward type points and carbon reward type circaCarbon. rewardScale is 2, carbonScale 3, jurisdiction CIRCA_SAMPLE, saleMode DIGITAL_OWNERSHIP, couponCarbonMode UNCHANGED, orderCodePrefix CIRCA_ORDER_ and refundsEnabled true. autoPublishListings is a source policy choice, not permission to bypass publication approval. Listing presentation explicitly says no physical delivery is included.\n\n`circaEWaste.rewardValuation` declares illustrative true, version circa-weight-rewards-v2, pointsPerKg 10 and carbonUnitsPerEstimatedKg 1. The selected provider is DefaultCircaEWasteRewardValuationService. These are sample valuation settings, not cash conversion or certified carbon issuance. Owner Rules/ Loyalty evidence governs actual assessment and settlement. Later reassessments do not recalculate old balances automatically.\n\n`waste.projectOverlay` selects circa.ewaste:waste-policy as a PROJECT layer. `waste.operations` requires scopes and verification and does not require different approver. Broader business-role or application flags cannot relax those checks.\n\n## Full top-level configuration ownership index\n\n| Configuration subtree | Purpose and owner interpretation |\n| --- | --- |\n| tooling.acceptance.wasteManagement.fixture | Inert acceptance fixture codes, expected metrics and receipt prerequisite; not automatic test execution |\n| data.dataReleases.runtimeRoleProfiles | WASTE initialization profile selecting material/eWaste/Circa references |\n| product.runtimeRoleProfiles | COMMERCE_STAGED authoring, circaStaged, en/ar locales |\n| cart.runtimeRoleProfiles | COMMERCE customer default jurisdiction AE and currency AED; not the marketplace POINTS price book |\n| fulfillmentCore.runtimeRoleProfiles | Configured physical shipping/return options; does not make digital ownership physically delivered |\n| circaEWaste | App/presentation/journey/sample valuation; see above |\n| order.disputes/order.refunds | CIRCA_ORDER_ scope and configured eWaste owner port/target authority |\n| promotion.legacyTokenHashPolicies | TENANT_COLON_UPPERCASE_SHA256 compatibility; not permission to expose tokens |\n| digitalCore.merchantRedemption | Source enabled flag; complete merchant/outlet qualification remains independent |\n| profileExternalIdentity | Circa TELEGRAM application binding and one-use browser-handoff requirement |\n| runtimeConfigurationSchemas | telegramExternalIdentity and telegramDelivery governance; sensitive secret fields, permissions and refresh behavior |\n| bidding | Enabled bid policy, exact amount scale/maximum and per-store choices |\n| cms.publication | Project publication choices; nPublish remains generic authority |\n| backofficeApplicationInitialization.profiles | Circa setup identity, capabilities, user-triggered packages and Online approval requirement |\n| media.customerUploads | Source enabled choice; Media still authorizes upload/storage |\n| waste | Project overlay and operational checks |\n| wasteImpact.calculation | Provider selection, fallback chain, timeout and explicit mock compatibility policy |\n| eWaste | Domain policy deltas, owner authorities, marketplace, communication/channel/guidance composition |\n| apiExposure.categories.circaCustomer | App route exposure; each route still enforces its permission/auth contract |\n| copilot.runtimeRoleProfiles | WASTE ingestion, scoped knowledge registry, provider references and generation profiles |\n| wasteSubmission.runtimeRoleProfiles | WASTE metadata suggestion enable/adapter/profile |\n\nThis is a discovery index, not an invitation to duplicate those framework owners inside a project service. Read the owner contract for each subtree before changing it. Project configuration should contain actual selection/deltas, not copied default endpoints, service credentials or alternative authentication registries.\n\n## Providers, communication and secrets\n\n`wasteImpact.calculation` selects DefaultEWasteOpenAiImpactProviderService, then DefaultEWasteWarmImpactProviderService fallback, timeoutMs 90000 and failureMode RESULT. Its mock compatibility subtree defines illustrative weights/factors but does not activate a mock provider. Metadata suggestion separately selects OpenAI with profile eWastePhotoMetadata. Copilot profiles also include structuredTool and customerGuidance; guidance uses scoped customer knowledge and configured runtime provider choices. Provider/model configuration is not evidence of a successful call.\n\n`eWaste.channelAuthentication` selects TELEGRAM with Circa application binding and seamlessSignIn choice. Outcome communication selects engagement and WASTE_REVIEW_OUTCOME_V1. Target authorities separately identify ENGAGEMENT, COMMERCE, COMMERCE_STAGED and WCMS_STAGED. Optional coupon EMAIL/SMS resources do not become active lifecycle triggers through these waste-outcome settings.\n\nTelegram bot and provider secrets are referenced through governed runtime fields. This guide does not reproduce secret values, sample passwords or effective bearer tokens. Runtime configuration permissions and refresh/restart policy must be honored; source field declarations alone do not prove current credentials are present.\n\n## Customize and extend safely\n\nDevelopers export a focused project config delta. For example, select a custom published Store and price book together while preserving original installed order prefix/application identity during an upgrade. Use `$config` replace/ref/env/path descriptors only under their existing contracts; replacing an array can remove required predecessors and must be tested. Never let a customer request choose provider or service identifiers. Validate effective merge, rejected values, missing provider recovery and default-versus-later-layer behavior before activation.\n\n## Common mistakes\n\nUsing Cart AED defaults as the coupon POINTS currency; treating mock settings as an active provider; changing a flag as proof of integration; copying secret values; and confusing source policy with installed data are incorrect. Production DevOps must inspect the effective runtime and owner release evidence independently.\n\n## Verification\n\nReview this index whenever properties.js gains/removes a subtree. Check selected module/server order, environment references, governed runtime values and actual owner availability during joint acceptance. CMS documentation validation does not start providers or mutate runtime configuration. Continue with [customization](/docs/framework/accelerators/circa/customization), [record inventory](/docs/framework/accelerators/circa/source-inventory) and [deployment](/docs/framework/accelerators/circa/deployment-verification).\n",
      "previous": {
        "title": "Circa Store, Product, Price and Coupon Record Reference",
        "route": "/docs/framework/accelerators/circa/catalogue-reference"
      },
      "next": {
        "title": "Circa and the eWaste Product",
        "route": "/docs/framework/accelerators/circa"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.accelerators",
        "technicalModule": "eWaste",
        "owner": "eWaste",
        "sourcePath": "data/docs-v001/records/documentation/eWasteDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/eWasteDocumentationComponentData.js",
        "wordCount": 988,
        "checksum": "a7c9aae4fd3c8bcbd2d7e8ef66e30f991f70edad580daf79e61a9aaab6866b56"
      },
      "slug": "accelerators-circa-configuration-reference",
      "locale": "en",
      "navigationGroup": "Circa eWaste Product",
      "navigationGroupCode": "circa-ewaste-product",
      "navigationGroupOrder": 20,
      "navigationOrder": 120,
      "references": [
        {
          "documentId": "accelerators.circa-overview",
          "owner": "eWaste"
        },
        {
          "documentId": "accelerators.circa-data-network",
          "owner": "eWaste"
        },
        {
          "documentId": "accelerators.circa-customization",
          "owner": "eWaste"
        }
      ]
    },
    "active": true
  },
  "record5": {
    "code": "nodicsDocsComponentacceleratorsCircaOverview",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "accelerators.circa-overview",
      "title": "Circa and the eWaste Product",
      "route": "/docs/framework/accelerators/circa",
      "section": "accelerators-and-industry-solution-templates",
      "sectionTitle": "Accelerators and Industry Solution Templates",
      "group": "accelerators-and-industry-solution-templates",
      "groupTitle": "Accelerators and Industry Solution Templates",
      "parentId": "accelerators-and-industry-solution-templates",
      "hierarchyPath": [
        "Accelerators and Industry Solution Templates",
        "Circa and the eWaste Product"
      ],
      "hierarchyDepth": 2,
      "documentType": "overview",
      "audience": [
        "business",
        "architect",
        "administrator",
        "developer",
        "operator",
        "qa",
        "ai-tool"
      ],
      "businessAudience": [],
      "technicalAudience": [],
      "summary": "Source-backed product capability, audience, architecture and reference-application boundaries for Waste Management showcased through Circa.",
      "visibility": "public",
      "accessMode": "PUBLIC",
      "publiclyAvailable": true,
      "requiresAuthentication": false,
      "allowedRoles": [],
      "allowedGroups": [],
      "allowedPermissions": [],
      "lifecycleState": "ONLINE",
      "version": "0.16.15",
      "maturityState": "partial",
      "implementationState": "current",
      "renderingComponent": "documentation.component.article",
      "relatedPages": [
        "accelerators.circa-data-network",
        "accelerators.circa-submission-journey",
        "accelerators.circa-operations-rewards",
        "accelerators.circa-coupons-commerce",
        "accelerators.circa-customization",
        "accelerators.circa-deployment-verification"
      ],
      "sourceEvidence": [
        "../../../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "AGENTS.md",
        "../../../nexus/modules/nexus.web/data/sample-v001/content/records/wcms/corporate/nexusComponentData.js",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/README.md",
        "package.json",
        "src/service",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/data/manifest.json",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/data/sample-v001/commerce/headers/circaCommerceCatalogHeader.js",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/data/sample-v001/commerce/records/circaProductData.js",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/data/sample-v001/commerce/records/circaProductVariantData.js",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/data/sample-v001/commerce/records/circaProductLocalizationData.js",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/data/sample-v001/commerce/records/circaProductVariantLocalizationData.js",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/data/sample-v001/commerce/records/circaPriceRowData.js",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/data/sample-v001/commerce/records/circaPromotionData.js",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/data/sample-v001/store/records/circaStoreData.js",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/src/service/defaultCircaDemoCommerceImportAdmissionService.js",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/test/circaCommerceForwardRelease.test.js",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/data/sample-v001/store/headers/circaStoreReferenceHeader.js",
        "llm/contracts/digital-ownership-sale.md",
        "src/service/defaultEWasteDigitalSaleService.js",
        "src/service/defaultEWasteOrderReversalService.js",
        "../../../../../nodics.commerce/modules/baseCommerce/modules/promotion/llm/contracts/accelerator-setup-contributions.md",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/llm/contracts/circa-promotion-setup.md",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/data/sample-v001/publication/records/publicationPlan.json",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/data/sample-v001/operations/asset-policy/headers/circaDigitalOwnershipPolicyHeader.js",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/test/circaPromotionInstructionPack.test.js",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/test/circaDigitalOwnershipPolicyPack.test.js"
      ],
      "visualRequirements": [
        "table",
        "screen-flow"
      ],
      "searchKeywords": [
        "circa",
        "ewaste",
        "waste management",
        "product",
        "nexus",
        "accelerator"
      ],
      "topicKeywords": [
        "Circa",
        "eWaste",
        "Product boundaries"
      ],
      "headings": [
        {
          "text": "Detailed reference pages",
          "anchor": "acceleratorsCircaOverview-1-detailed-reference-pages",
          "level": 2
        },
        {
          "text": "Product capability map",
          "anchor": "acceleratorsCircaOverview-2-product-capability-map",
          "level": 2
        },
        {
          "text": "Repository and authority map",
          "anchor": "acceleratorsCircaOverview-3-repository-and-authority-map",
          "level": 2
        },
        {
          "text": "Customer navigation and screen flow",
          "anchor": "acceleratorsCircaOverview-4-customer-navigation-and-screen-flow",
          "level": 2
        },
        {
          "text": "Environmental and commercial limitations",
          "anchor": "acceleratorsCircaOverview-5-environmental-and-commercial-limitations",
          "level": 2
        },
        {
          "text": "Customize and extend safely",
          "anchor": "acceleratorsCircaOverview-6-customize-and-extend-safely",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "acceleratorsCircaOverview-7-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "acceleratorsCircaOverview-8-verification",
          "level": 2
        },
        {
          "text": "Reviewed source readiness",
          "anchor": "acceleratorsCircaOverview-9-reviewed-source-readiness",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "image",
          "alt": "Circa architecture and domain ownership",
          "title": "Circa architecture and domain ownership",
          "mediaCode": "nodicsDocsImage_8a863434057ea442ca58bae0"
        },
        {
          "kind": "paragraph",
          "text": "This source-backed diagram explains ownership and boundaries; it is not live deployment or acceptance evidence. Qualification notes remain part of the flow."
        },
        {
          "kind": "paragraph",
          "text": "Circa is Nodics' connected reference experience for electronic-waste participation and circular ownership. Nexus presents Waste Management as a framework product showcased through Circa. The reusable electronic-waste domain accelerator is `eWaste`; Circa is the application that composes it with Profile, Location, Media, Waste, Loyalty, Commerce, WCMS, Communication and Engagement. There is not a second Circa domain engine or independent wallet hidden behind the website."
        },
        {
          "kind": "paragraph",
          "text": "For beginners, start with a simple business scenario: a customer visits a collection centre, prepares a photographed electronic item, confirms a submission and waits for authorized review. The accepted outcome can produce an owned asset and governed rewards. The same account can browse assets or coupons and review purchases. Approval, physical receipt, environmental assessment, reward settlement, marketplace sale and coupon redemption are separate facts. One does not prove the others."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Detailed reference pages",
          "anchor": "acceleratorsCircaOverview-1-detailed-reference-pages"
        },
        {
          "kind": "paragraph",
          "text": "Use the [data network guide](/docs/framework/accelerators/circa/data-network) for the relationship overview, then consult these exact source references:"
        },
        {
          "kind": "table",
          "headers": [
            "Reference",
            "Details"
          ],
          "rows": [
            [
              "[Collection centres](/docs/framework/accelerators/circa/collection-reference)",
              "Three original points, 17 shared points, optional Sunmarke, coordinates, categories and ownership"
            ],
            [
              "[Enterprises and employees](/docs/framework/accelerators/circa/enterprise-reference)",
              "Canonical Profile roles and explicit scopes; source has seven enterprises, 21 employee templates and 22 scope templates, not installed memberships"
            ],
            [
              "[Source release inventory](/docs/framework/accelerators/circa/source-inventory)",
              "25 manifest sections at 0.0.1, six issuer budget/issuance packs, four publication subsets and a separate Waste asset-policy selection"
            ],
            [
              "[Catalogue records](/docs/framework/accelerators/circa/catalogue-reference)",
              "43 Products: five assets and 38 coupons; approved source versus labelled deleted historical snapshots"
            ],
            [
              "[Configuration reference](/docs/framework/accelerators/circa/configuration-reference)",
              "Application settings, domain ownership, providers and extension points"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Counts describe reviewed authored records, not installed or publicly visible totals. The [submission](/docs/framework/accelerators/circa/submission), [operations](/docs/framework/accelerators/circa/operations), [commerce](/docs/framework/accelerators/circa/coupons-commerce), [customization](/docs/framework/accelerators/circa/customization) and [deployment](/docs/framework/accelerators/circa/deployment-verification) guides explain the connected journeys."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Product capability map",
          "anchor": "acceleratorsCircaOverview-2-product-capability-map"
        },
        {
          "kind": "table",
          "headers": [
            "Experience",
            "What the current source supplies",
            "Authoritative owner"
          ],
          "rows": [
            [
              "Public website and help",
              "Published page composition, collection discovery, contact intake, application copy and imagery",
              "WCMS, Location, Engagement; Circa presentation"
            ],
            [
              "Customer identity",
              "Profile registration/sign-in and authenticated account context",
              "Profile and authentication framework"
            ],
            [
              "Guided eWaste submission",
              "Arrival check, temporary photo analysis, saved preparation, correction and explicit confirmation",
              "eWaste orchestration over Waste/Media"
            ],
            [
              "Staff review",
              "Scope-aware queues, evidence, verified overlays, decisions and recovery surfaces in Axis",
              "Waste/eWaste with Profile permissions"
            ],
            [
              "Environmental information",
              "Provider assessments, estimates, input-only limitations, provenance and assessment history",
              "Waste Impact and eWaste providers"
            ],
            [
              "Account workspace",
              "Drafts, submissions, assets, details, filters, quick view and authorized actions",
              "Owner-scoped eWaste projections"
            ],
            [
              "Rewards",
              "Wallet balance/history and references to approval settlement",
              "Loyalty; Rules/valuation evidence where configured"
            ],
            [
              "Asset marketplace",
              "Published catalogue, reviewed digital-ownership purchase, listing, gifts and bid surfaces",
              "Waste and Commerce, not frontend state"
            ],
            [
              "Coupons",
              "Published offers, purchase review, entitlement history, owner-authorized reveal and merchant-facing framework integration",
              "Promotion, Digital Commerce, Order and Payment"
            ],
            [
              "Updates",
              "Communication inbox and authorized item-linked outcome presentation",
              "Communication and source-domain resolution"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "These are source capabilities, not a promise that every deployment has activated all providers, permissions or data releases. Production merchant acceptance, commercial allocations and certain recovery/security improvements still require qualification. A visible button or enabled setting is not acceptance evidence."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Repository and authority map",
          "anchor": "acceleratorsCircaOverview-3-repository-and-authority-map"
        },
        {
          "kind": "paragraph",
          "text": "Framework source packages generic Waste behavior under `nodics.waste` and reusable electronics composition under `nodics.accelerators/modules/waste/modules/eWaste`. The reference customer backend `circa.ewaste` lives in Kickoff. It supplies application identity, site adapters, governed content/sample releases, deployment choices and illustrative policy. `nodics.circa.eWaste` supplies the customer UI; Axis supplies employee operations. Nexus supplies the framework product discovery experience. The implementing `eWaste` module owns this reusable accelerator guide and its canonical CMS records and unique assets under `data/docs-v001`. `nodics.docs` composes references to that release without owning a second article copy; genuine customer-specific runbooks remain with their backend owner."
        },
        {
          "kind": "paragraph",
          "text": "Developers must not move Circa-branded data into generic Waste merely because the reference is marketed as a Nodics product. Equally, reusable lifecycle corrections must not remain as a copied engine in Kickoff. Module availability, module `extends`, runtime `extends` and exported-service load order are distinct mechanisms."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customer navigation and screen flow",
          "anchor": "acceleratorsCircaOverview-4-customer-navigation-and-screen-flow"
        },
        {
          "kind": "paragraph",
          "text": "The web experience exposes Submit Waste, Find Collection Center, Shop and Help. Shop and Coupons have public browsing and independent details. Account views split dashboard, My items, Wallet, Bids, Purchases and coupons, and Ownership activity. Drafts are separate from submitted items. Mobile and Telegram use shared domain components while retaining host launch context through navigation and sign-in."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart TD\n  Discover[\"Discover centre\"] --> Identity[\"Sign in\"]\n  Identity --> Arrival[\"Fresh arrival check\"]\n  Arrival --> Photo[\"Analyze photo and prepare\"]\n  Photo --> Confirm[\"Explicit confirmation\"]\n  Confirm --> Review[\"Authorized staff review\"]\n  Review --> Account[\"Account outcome and owner evidence\"]\n  Account --> Wallet[\"Wallet and owned items\"]\n  Shop[\"Shop or Coupons\"] --> Details[\"Offer details\"]\n  Details --> Purchase[\"Explicit purchase review and confirm\"]\n  Purchase --> Order[\"Saved owner order\"]"
        },
        {
          "kind": "paragraph",
          "text": "Quick view is read-only. Browser return/reload must not create another submission, order, wallet effect or coupon. A customer account can have no items and an empty wallet; sample opening balances do not define registration behavior."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Environmental and commercial limitations",
          "anchor": "acceleratorsCircaOverview-5-environmental-and-commercial-limitations"
        },
        {
          "kind": "paragraph",
          "text": "Potential CO2e savings are estimates, not certified emission reductions. Carbon equivalent in tonnes is a unit conversion, not issued credits. Carbon units in the reference programme are reward units. Available input mass/count does not establish completed diversion. Unknown outcomes remain unknown; negative or zero calculated values are not hidden to make a benefit card look attractive."
        },
        {
          "kind": "paragraph",
          "text": "Reference asset offers describe digital ownership and do not promise physical delivery. A configured logistics partner does not imply fleet/dispatch orchestration. Repair/reuse business relationships do not by themselves activate a repair lifecycle. Telegram source integration and a host shell are not proof of actual-client acceptance. Nexus channel positioning must not be read as an activated WhatsApp identity, submission or delivery integration."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customize and extend safely",
          "anchor": "acceleratorsCircaOverview-6-customize-and-extend-safely"
        },
        {
          "kind": "paragraph",
          "text": "Adopters create their own backend application module and frontend brand, extending the existing eWaste capability. A minimal presentation change belongs in the custom module's `config/properties.js`, exporting a focused `circaEWaste.presentation` delta when extending the Circa reference. A domain change belongs in a focused `eWaste` policy/provider delta, not a copied submission service. Use new application identity for a new installation; preserve identity when upgrading an existing one."
        },
        {
          "kind": "paragraph",
          "text": "For example, change the brand display name and published banner while keeping the same arrival and authorization operations. Test effective configuration, published renderer compatibility, missing-content recovery and both mobile and desktop layout. Do not claim a new channel, certified benefit or payment method from copy changes alone. See [customization](/docs/framework/accelerators/circa/customization) for exact file patterns."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "acceleratorsCircaOverview-7-common-mistakes"
        },
        {
          "kind": "paragraph",
          "text": "Treating all configured journeys as production-qualified; treating parent enterprise membership as outlet authority; treating approval as physical receipt; copying sample wallets into a live programme; embedding coupon secrets in public content; and moving persisted data into a frontend are all incorrect. Operators should use saved owner evidence and review outstanding gates before activating a programme."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "acceleratorsCircaOverview-8-verification"
        },
        {
          "kind": "paragraph",
          "text": "This guide is grounded in Nexus backend product records, eWaste routes/contracts, Circa backend configuration/data and customer frontend source. Static documentation checks establish catalogue and content consistency, not live acceptance. DevOps and QA must separately record installed versions, effective policy, API authorization, failure/recovery and desktop/mobile/native-client evidence. Continue with the [data guide](/docs/framework/accelerators/circa/data-network), [submission journey](/docs/framework/accelerators/circa/submission), [operations](/docs/framework/accelerators/circa/operations), [commerce](/docs/framework/accelerators/circa/coupons-commerce) and [deployment guide](/docs/framework/accelerators/circa/deployment-verification)."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Reviewed source readiness",
          "anchor": "acceleratorsCircaOverview-9-reviewed-source-readiness"
        },
        {
          "kind": "paragraph",
          "text": "Reviewed fictional Local-only source carries 38 campaigns with 100-unit targets, nine exact monetary budgets, 29 no-substitution ITEM bundles and five quantity-one asset policies. Four signed subsets partition all 84 publication roots. Each issuer's original budget precedes separate signed consent and issuance linked to admission. Asset refund intent must be retained before original sale; missing historical terms cannot be repaired by editing a current policy."
        },
        {
          "kind": "paragraph",
          "text": "SOURCE_ONLY means repository records/contracts are inspectable offline, not that installed indexes, consent, transport, Online publication, payment, fulfillment, reveal, sale or refund are qualified. The [source inventory](/docs/framework/accelerators/circa/source-inventory) names exact boundaries. Operators complete independent approvals and owner evidence checks; optional documentation import never selects business data."
        }
      ],
      "searchText": "Circa and the eWaste Product Source-backed product capability, audience, architecture and reference-application boundaries for Waste Management showcased through Circa. # Circa and the eWaste Product\n\n![Circa architecture and domain ownership](media:nodicsDocsImage_8a863434057ea442ca58bae0)\n\nThis source-backed diagram explains ownership and boundaries; it is not live deployment or acceptance evidence. Qualification notes remain part of the flow.\n\nCirca is Nodics' connected reference experience for electronic-waste participation and circular ownership. Nexus presents Waste Management as a framework product showcased through Circa. The reusable electronic-waste domain accelerator is `eWaste`; Circa is the application that composes it with Profile, Location, Media, Waste, Loyalty, Commerce, WCMS, Communication and Engagement. There is not a second Circa domain engine or independent wallet hidden behind the website.\n\nFor beginners, start with a simple business scenario: a customer visits a collection centre, prepares a photographed electronic item, confirms a submission and waits for authorized review. The accepted outcome can produce an owned asset and governed rewards. The same account can browse assets or coupons and review purchases. Approval, physical receipt, environmental assessment, reward settlement, marketplace sale and coupon redemption are separate facts. One does not prove the others.\n\n## Detailed reference pages\n\nUse the [data network guide](/docs/framework/accelerators/circa/data-network) for the relationship overview, then consult these exact source references:\n\n| Reference | Details |\n| --- | --- |\n| [Collection centres](/docs/framework/accelerators/circa/collection-reference) | Three original points, 17 shared points, optional Sunmarke, coordinates, categories and ownership |\n| [Enterprises and employees](/docs/framework/accelerators/circa/enterprise-reference) | Canonical Profile roles and explicit scopes; source has seven enterprises, 21 employee templates and 22 scope templates, not installed memberships |\n| [Source release inventory](/docs/framework/accelerators/circa/source-inventory) | 25 manifest sections at 0.0.1, six issuer budget/issuance packs, four publication subsets and a separate Waste asset-policy selection |\n| [Catalogue records](/docs/framework/accelerators/circa/catalogue-reference) | 43 Products: five assets and 38 coupons; approved source versus labelled deleted historical snapshots |\n| [Configuration reference](/docs/framework/accelerators/circa/configuration-reference) | Application settings, domain ownership, providers and extension points |\n\nCounts describe reviewed authored records, not installed or publicly visible totals. The [submission](/docs/framework/accelerators/circa/submission), [operations](/docs/framework/accelerators/circa/operations), [commerce](/docs/framework/accelerators/circa/coupons-commerce), [customization](/docs/framework/accelerators/circa/customization) and [deployment](/docs/framework/accelerators/circa/deployment-verification) guides explain the connected journeys.\n\n## Product capability map\n\n| Experience | What the current source supplies | Authoritative owner |\n| --- | --- | --- |\n| Public website and help | Published page composition, collection discovery, contact intake, application copy and imagery | WCMS, Location, Engagement; Circa presentation |\n| Customer identity | Profile registration/sign-in and authenticated account context | Profile and authentication framework |\n| Guided eWaste submission | Arrival check, temporary photo analysis, saved preparation, correction and explicit confirmation | eWaste orchestration over Waste/Media |\n| Staff review | Scope-aware queues, evidence, verified overlays, decisions and recovery surfaces in Axis | Waste/eWaste with Profile permissions |\n| Environmental information | Provider assessments, estimates, input-only limitations, provenance and assessment history | Waste Impact and eWaste providers |\n| Account workspace | Drafts, submissions, assets, details, filters, quick view and authorized actions | Owner-scoped eWaste projections |\n| Rewards | Wallet balance/history and references to approval settlement | Loyalty; Rules/valuation evidence where configured |\n| Asset marketplace | Published catalogue, reviewed digital-ownership purchase, listing, gifts and bid surfaces | Waste and Commerce, not frontend state |\n| Coupons | Published offers, purchase review, entitlement history, owner-authorized reveal and merchant-facing framework integration | Promotion, Digital Commerce, Order and Payment |\n| Updates | Communication inbox and authorized item-linked outcome presentation | Communication and source-domain resolution |\n\nThese are source capabilities, not a promise that every deployment has activated all providers, permissions or data releases. Production merchant acceptance, commercial allocations and certain recovery/security improvements still require qualification. A visible button or enabled setting is not acceptance evidence.\n\n## Repository and authority map\n\nFramework source packages generic Waste behavior under `nodics.waste` and reusable electronics composition under `nodics.accelerators/modules/waste/modules/eWaste`. The reference customer backend `circa.ewaste` lives in Kickoff. It supplies application identity, site adapters, governed content/sample releases, deployment choices and illustrative policy. `nodics.circa.eWaste` supplies the customer UI; Axis supplies employee operations. Nexus supplies the framework product discovery experience. The implementing `eWaste` module owns this reusable accelerator guide and its canonical CMS records and unique assets under `data/docs-v001`. `nodics.docs` composes references to that release without owning a second article copy; genuine customer-specific runbooks remain with their backend owner.\n\nDevelopers must not move Circa-branded data into generic Waste merely because the reference is marketed as a Nodics product. Equally, reusable lifecycle corrections must not remain as a copied engine in Kickoff. Module availability, module `extends`, runtime `extends` and exported-service load order are distinct mechanisms.\n\n## Customer navigation and screen flow\n\nThe web experience exposes Submit Waste, Find Collection Center, Shop and Help. Shop and Coupons have public browsing and independent details. Account views split dashboard, My items, Wallet, Bids, Purchases and coupons, and Ownership activity. Drafts are separate from submitted items. Mobile and Telegram use shared domain components while retaining host launch context through navigation and sign-in.\n\n```mermaid\nflowchart TD\n  Discover[\"Discover centre\"] --> Identity[\"Sign in\"]\n  Identity --> Arrival[\"Fresh arrival check\"]\n  Arrival --> Photo[\"Analyze photo and prepare\"]\n  Photo --> Confirm[\"Explicit confirmation\"]\n  Confirm --> Review[\"Authorized staff review\"]\n  Review --> Account[\"Account outcome and owner evidence\"]\n  Account --> Wallet[\"Wallet and owned items\"]\n  Shop[\"Shop or Coupons\"] --> Details[\"Offer details\"]\n  Details --> Purchase[\"Explicit purchase review and confirm\"]\n  Purchase --> Order[\"Saved owner order\"]\n```\n\nQuick view is read-only. Browser return/reload must not create another submission, order, wallet effect or coupon. A customer account can have no items and an empty wallet; sample opening balances do not define registration behavior.\n\n## Environmental and commercial limitations\n\nPotential CO2e savings are estimates, not certified emission reductions. Carbon equivalent in tonnes is a unit conversion, not issued credits. Carbon units in the reference programme are reward units. Available input mass/count does not establish completed diversion. Unknown outcomes remain unknown; negative or zero calculated values are not hidden to make a benefit card look attractive.\n\nReference asset offers describe digital ownership and do not promise physical delivery. A configured logistics partner does not imply fleet/dispatch orchestration. Repair/reuse business relationships do not by themselves activate a repair lifecycle. Telegram source integration and a host shell are not proof of actual-client acceptance. Nexus channel positioning must not be read as an activated WhatsApp identity, submission or delivery integration.\n\n## Customize and extend safely\n\nAdopters create their own backend application module and frontend brand, extending the existing eWaste capability. A minimal presentation change belongs in the custom module's `config/properties.js`, exporting a focused `circaEWaste.presentation` delta when extending the Circa reference. A domain change belongs in a focused `eWaste` policy/provider delta, not a copied submission service. Use new application identity for a new installation; preserve identity when upgrading an existing one.\n\nFor example, change the brand display name and published banner while keeping the same arrival and authorization operations. Test effective configuration, published renderer compatibility, missing-content recovery and both mobile and desktop layout. Do not claim a new channel, certified benefit or payment method from copy changes alone. See [customization](/docs/framework/accelerators/circa/customization) for exact file patterns.\n\n## Common mistakes\n\nTreating all configured journeys as production-qualified; treating parent enterprise membership as outlet authority; treating approval as physical receipt; copying sample wallets into a live programme; embedding coupon secrets in public content; and moving persisted data into a frontend are all incorrect. Operators should use saved owner evidence and review outstanding gates before activating a programme.\n\n## Verification\n\nThis guide is grounded in Nexus backend product records, eWaste routes/contracts, Circa backend configuration/data and customer frontend source. Static documentation checks establish catalogue and content consistency, not live acceptance. DevOps and QA must separately record installed versions, effective policy, API authorization, failure/recovery and desktop/mobile/native-client evidence. Continue with the [data guide](/docs/framework/accelerators/circa/data-network), [submission journey](/docs/framework/accelerators/circa/submission), [operations](/docs/framework/accelerators/circa/operations), [commerce](/docs/framework/accelerators/circa/coupons-commerce) and [deployment guide](/docs/framework/accelerators/circa/deployment-verification).\n\n## Reviewed source readiness\n\nReviewed fictional Local-only source carries 38 campaigns with 100-unit targets, nine exact monetary budgets, 29 no-substitution ITEM bundles and five quantity-one asset policies. Four signed subsets partition all 84 publication roots. Each issuer's original budget precedes separate signed consent and issuance linked to admission. Asset refund intent must be retained before original sale; missing historical terms cannot be repaired by editing a current policy.\n\nSOURCE_ONLY means repository records/contracts are inspectable offline, not that installed indexes, consent, transport, Online publication, payment, fulfillment, reveal, sale or refund are qualified. The [source inventory](/docs/framework/accelerators/circa/source-inventory) names exact boundaries. Operators complete independent approvals and owner evidence checks; optional documentation import never selects business data.\n",
      "previous": {
        "title": "Circa Configuration and Extension Reference",
        "route": "/docs/framework/accelerators/circa/configuration-reference"
      },
      "next": {
        "title": "Circa Data, Enterprises and Collection Network",
        "route": "/docs/framework/accelerators/circa/data-network"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.accelerators",
        "technicalModule": "eWaste",
        "owner": "eWaste",
        "sourcePath": "data/docs-v001/records/documentation/eWasteDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/eWasteDocumentationComponentData.js",
        "wordCount": 1387,
        "checksum": "ab8f61450817dbc8bf45892cd06feaa60f783d23a99def57d64ff082f769fa90"
      },
      "slug": "accelerators-circa-overview",
      "locale": "en",
      "navigationGroup": "Circa eWaste Product",
      "navigationGroupCode": "circa-ewaste-product",
      "navigationGroupOrder": 20,
      "navigationOrder": 10,
      "references": [
        {
          "documentId": "accelerators.circa-data-network",
          "owner": "eWaste"
        },
        {
          "documentId": "accelerators.circa-submission-journey",
          "owner": "eWaste"
        },
        {
          "documentId": "accelerators.circa-operations-rewards",
          "owner": "eWaste"
        },
        {
          "documentId": "accelerators.circa-coupons-commerce",
          "owner": "eWaste"
        },
        {
          "documentId": "accelerators.circa-customization",
          "owner": "eWaste"
        },
        {
          "documentId": "accelerators.circa-deployment-verification",
          "owner": "eWaste"
        }
      ]
    },
    "active": true
  },
  "record6": {
    "code": "nodicsDocsComponentacceleratorsCircaDataNetwork",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "accelerators.circa-data-network",
      "title": "Circa Data, Enterprises and Collection Network",
      "route": "/docs/framework/accelerators/circa/data-network",
      "section": "accelerators-and-industry-solution-templates",
      "sectionTitle": "Accelerators and Industry Solution Templates",
      "group": "accelerators-and-industry-solution-templates",
      "groupTitle": "Accelerators and Industry Solution Templates",
      "parentId": "accelerators-and-industry-solution-templates",
      "hierarchyPath": [
        "Accelerators and Industry Solution Templates",
        "Circa Data, Enterprises and Collection Network"
      ],
      "hierarchyDepth": 2,
      "documentType": "configuration",
      "audience": [
        "business",
        "architect",
        "administrator",
        "developer",
        "operator",
        "qa",
        "ai-tool"
      ],
      "businessAudience": [],
      "technicalAudience": [],
      "summary": "Enterprise, employee, store, location, collection-point, catalogue and release configuration with installed-history preservation.",
      "visibility": "public",
      "accessMode": "PUBLIC",
      "publiclyAvailable": true,
      "requiresAuthentication": false,
      "allowedRoles": [],
      "allowedGroups": [],
      "allowedPermissions": [],
      "lifecycleState": "ONLINE",
      "version": "0.16.15",
      "maturityState": "partial",
      "implementationState": "current",
      "renderingComponent": "documentation.component.article",
      "relatedPages": [
        "accelerators.circa-overview",
        "accelerators.circa-customization"
      ],
      "sourceEvidence": [
        "../../../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/data/manifest.json",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/config/properties.js",
        "package.json",
        "src/service",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/data/sample-v001/commerce/headers/circaCommerceCatalogHeader.js",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/data/sample-v001/commerce/records/circaProductData.js",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/data/sample-v001/commerce/records/circaProductVariantData.js",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/data/sample-v001/commerce/records/circaProductLocalizationData.js",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/data/sample-v001/commerce/records/circaProductVariantLocalizationData.js",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/data/sample-v001/commerce/records/circaPriceRowData.js",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/data/sample-v001/commerce/records/circaPromotionData.js",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/data/sample-v001/store/records/circaStoreData.js",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/src/service/defaultCircaDemoCommerceImportAdmissionService.js",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/test/circaCommerceForwardRelease.test.js",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/data/sample-v001/store/headers/circaStoreReferenceHeader.js",
        "llm/contracts/digital-ownership-sale.md",
        "src/service/defaultEWasteDigitalSaleService.js",
        "src/service/defaultEWasteOrderReversalService.js",
        "../../../../../nodics.commerce/modules/baseCommerce/modules/promotion/llm/contracts/accelerator-setup-contributions.md",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/llm/contracts/circa-promotion-setup.md",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/data/sample-v001/publication/records/publicationPlan.json",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/data/sample-v001/operations/asset-policy/headers/circaDigitalOwnershipPolicyHeader.js",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/test/circaPromotionInstructionPack.test.js",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/test/circaDigitalOwnershipPolicyPack.test.js"
      ],
      "visualRequirements": [
        "table"
      ],
      "searchKeywords": [
        "circa",
        "enterprise",
        "store",
        "collection centre",
        "data release",
        "coupon",
        "location"
      ],
      "topicKeywords": [
        "Circa",
        "Data configuration"
      ],
      "headings": [
        {
          "text": "Data ownership and record relationships",
          "anchor": "acceleratorsCircaDataNetwork-1-data-ownership-and-record-relationships",
          "level": 2
        },
        {
          "text": "Enterprises and employee access",
          "anchor": "acceleratorsCircaDataNetwork-2-enterprises-and-employee-access",
          "level": 2
        },
        {
          "text": "Collection-centre configuration",
          "anchor": "acceleratorsCircaDataNetwork-3-collection-centre-configuration",
          "level": 2
        },
        {
          "text": "Store and catalogue configuration",
          "anchor": "acceleratorsCircaDataNetwork-4-store-and-catalogue-configuration",
          "level": 2
        },
        {
          "text": "Releases, inheritance and preservation",
          "anchor": "acceleratorsCircaDataNetwork-5-releases-inheritance-and-preservation",
          "level": 2
        },
        {
          "text": "Customize and extend safely",
          "anchor": "acceleratorsCircaDataNetwork-6-customize-and-extend-safely",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "acceleratorsCircaDataNetwork-7-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "acceleratorsCircaDataNetwork-8-verification",
          "level": 2
        },
        {
          "text": "Signed business data sequence",
          "anchor": "acceleratorsCircaDataNetwork-7-signed-business-data-sequence",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Circa composes records from several domain owners; it does not have one universal Circa table. For beginners, distinguish a business enterprise, a sellable store, a physical collection point and a coupon offer before importing data. Each has its own lifecycle and permissions. The business value of this separation is that one programme can change operators, locations or offers without rewriting customer ownership, credentials or settlement history."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Data ownership and record relationships",
          "anchor": "acceleratorsCircaDataNetwork-1-data-ownership-and-record-relationships"
        },
        {
          "kind": "table",
          "headers": [
            "Record or relationship",
            "Owner",
            "Meaning"
          ],
          "rows": [
            [
              "Enterprise, parent/child, employees and memberships",
              "Profile",
              "Organizational responsibility and explicit access, not automatic trade permissions"
            ],
            [
              "Location",
              "Location",
              "Canonical coordinates and location metadata"
            ],
            [
              "Waste collection point",
              "Waste Collection",
              "Collection eligibility, policies and references to a location/operator"
            ],
            [
              "Collection preset, taxonomy and acceptance policy",
              "Waste with eWaste references",
              "Supported items, evidence/receipt requirements and assessment selection"
            ],
            [
              "Submission, verification, evidence, receipt and asset",
              "Waste",
              "Customer facts, decisions, physical custody and ownership"
            ],
            [
              "Store, category, product, variant and localized copy",
              "Commerce Product/Store",
              "Published browsing and purchase context"
            ],
            [
              "Price book/rows, inventory and coupon batch",
              "Commerce/Promotion",
              "Cost and purchasable supply, separate from issued customer codes"
            ],
            [
              "Wallet, rewards and ledger",
              "Loyalty",
              "Governed value movement and immutable references"
            ],
            [
              "Page, route, renderer, component and media",
              "WCMS/Media",
              "Published presentation, not business transaction truth"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Collection-point references must resolve to real owner records. A map marker's display text is not the location authority. A physical redemption outlet is also not the online store that sold a coupon. A shared parent company does not make every subsidiary an eligible coupon merchant or every employee an operator."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Enterprises and employee access",
          "anchor": "acceleratorsCircaDataNetwork-2-enterprises-and-employee-access"
        },
        {
          "kind": "paragraph",
          "text": "The marketplace circaMainStore retains tenant default and explicitly references Profile enterprise GREENPERKS_ONLINE. It is a storefront role, not the canonical Waste seller or issuer of every benefit. Asset owner references remain unchanged. Five Stores distinguish marketplace, two GREENPERKS_RETAIL outlets and RenewWorks/LoopCycle. Names and parentage confer no ownership. Every employee needs current explicit membership, signed enterprise and owner-governed scope."
        },
        {
          "kind": "paragraph",
          "text": "Profile already represents parent/child enterprises. Hierarchy alone grants no membership, administrative delegation or outlet access. Consent-based ancestor delegation has an accepted framework policy, but complete enforcement remains unqualified in the current source batch. Keep existing exact-target/platform checks; do not grant access by inserting an ancestor lookup. Authorized platform admins are different from ordinary employees of a PLATFORM_OWNER enterprise."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Collection-centre configuration",
          "anchor": "acceleratorsCircaDataNetwork-3-collection-centre-configuration"
        },
        {
          "kind": "paragraph",
          "text": "Across the reviewed sources there are three original Circa points, 17 shared Waste Collection points and one separately selectable Sunmarke point: 21 authored codes, not an installed total. Setup selects shared packages; the Circa transaction sample is optional and Sunmarke sections are not selected in that setup list. The [collection reference](/docs/framework/accelerators/circa/collection-reference) lists all point identities, coordinates and associations. The [enterprise reference](/docs/framework/accelerators/circa/enterprise-reference) documents operator ownership, `assetOwnerEnterpriseRef` and staff scope caveats."
        },
        {
          "kind": "paragraph",
          "text": "The original Circa sample contains `cc-dxb-01`, `cc-dxb-02` and `cc-dxb-03`, linked respectively to `cc-dxb-01-location`, `cc-dxb-02-location` and `cc-dxb-03-location`. The collection record controls its eligible operations and reference policy; the Location record supplies coordinates. Arrival uses fresh reported customer coordinates and direct distance, not map route distance or an assertion that the customer has arrived. Confirm the active runtime location after an authorized coordinate change; editing source alone does not update persisted data."
        },
        {
          "kind": "paragraph",
          "text": "For a new centre, create/approve the enterprise allocation, canonical location, collection point and applicable presets through the existing owner tools/APIs. Assign employee centre scope separately. Then verify visibility, nearby discovery, eligible item handling and the inclusive arrival boundary. A missing or inactive centre must not be treated as eligible just because a browser retains its card."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Store and catalogue configuration",
          "anchor": "acceleratorsCircaDataNetwork-4-store-and-catalogue-configuration"
        },
        {
          "kind": "paragraph",
          "text": "The reference retains circaMainStore, circaStaged, circaPointsPriceBook and circaDigitalRegistry, with POINTS/English/Asia-Dubai presentation. Commerce has 43 Products, five assets and 38 coupons, but excludes Store and raw supply writes. The required circa.ewaste:store pack prepares five masters. commerce-operational/header and Coupon/CouponBatch/InventoryBalance files are removed; six issuer Promotion instructions replace supply snapshots. Genuine Digital/Waste binding needs the separate three-policy source before reservation. These relationships are not installed consent, supply, fulfillment or native qualification. See the [catalogue reference](/docs/framework/accelerators/circa/catalogue-reference)."
        },
        {
          "kind": "paragraph",
          "text": "Author catalogue data in Commerce Staged and publish through the owning governed projection. Publishing the website does not publish Commerce. An active source product that is not in the Online projection can correctly be absent from Shop. Optional localized offer copy includes terms, eligibility, exclusions, redemptionInstructions and purchaseConditions. Copy is not enforcement of minimum spend, a discount cap, stock or merchant authorization."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Releases, inheritance and preservation",
          "anchor": "acceleratorsCircaDataNetwork-5-releases-inheritance-and-preservation"
        },
        {
          "kind": "paragraph",
          "text": "circa.ewaste/data/manifest.json is authoritative and has 25 explicit sections at 0.0.1. Six owner setup packs, four signed publication subsets and original-sale asset policies are LOCAL-only. Other samples retain their declared scopes; core Waste reference may use ALL. Scope is per selection, not directory. Documentation is optional and separate; guide import never chooses business releases."
        },
        {
          "kind": "paragraph",
          "text": "The reference sequence retains eWaste:core-reference and circa.ewaste:waste-policy, 0.0.1 in core-v001, using existing nImport filename/key/header composition. Business and reference sources are consolidated into v001. All 25 current manifest sections use 0.0.1; optional Waste samples exclude taxonomy/profile writes. The 84-root inventory has four signed subsets. Original budget and later issuance are six separate selections. Source consolidation proves neither a fresh installed destination nor permission to replay established receipts."
        },
        {
          "kind": "paragraph",
          "text": "Before an upgrade, inventory installed receipts, checksum/version, existing codes, customer references and operational overrides through owner APIs. Unknown provenance blocks adoption. Never reimport opening wallets, submissions or ownership events over transactional history merely to refresh a demo. Do not manually edit generated manifest hashes or bypass import validation with direct database writes."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customize and extend safely",
          "anchor": "acceleratorsCircaDataNetwork-6-customize-and-extend-safely"
        },
        {
          "kind": "paragraph",
          "text": "Developers add only intentional records/deltas under their custom backend module's `data/<release>/headers` and `records` trees. Configure the module's governed release manifest through existing tooling. A worked example is a fourth collection point: use a new approved code, reference an approved Location and operator, select existing eWaste policy, and leave the original three points and customers untouched. Do not copy the entire eWaste taxonomy to change one collection profile."
        },
        {
          "kind": "paragraph",
          "text": "Test composition against a fresh fixture and an installed-reference fixture with divergent policy. Verify that only selected records change, old assessment/ledger evidence remains intact, ambiguous references reject and retries retain receipts. Rollback is an owner-reviewed release action, not deletion of records with history."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "acceleratorsCircaDataNetwork-7-common-mistakes"
        },
        {
          "kind": "paragraph",
          "text": "Confusing coupon offers with issued codes; conflating store and outlet; using a Maps camera coordinate instead of the selected place; deriving access from enterprise business roles; refreshing sample transactions on a live installation; and treating configuration edits as installed data changes all produce misleading programmes."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "acceleratorsCircaDataNetwork-8-verification"
        },
        {
          "kind": "paragraph",
          "text": "Operators and DevOps should inspect source manifests and installed owner receipts separately. Review cross-domain references, tenant/enterprise separation, missing references, duplicate codes, quantities and localization. Author negative and failure/recovery fixtures before joint imports. Source validation and pack generation do not execute imports. Continue with [submission](/docs/framework/accelerators/circa/submission), [coupon commerce](/docs/framework/accelerators/circa/coupons-commerce) and [customization](/docs/framework/accelerators/circa/customization)."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Signed business data sequence",
          "anchor": "acceleratorsCircaDataNetwork-7-signed-business-data-sequence"
        },
        {
          "kind": "table",
          "headers": [
            "Stage",
            "Canonical owner/evidence",
            "Source boundary"
          ],
          "rows": [
            [
              "Reference and Store",
              "Profile, Location, Waste and generated Store service",
              "No membership, consent or supply from references"
            ],
            [
              "Publication",
              "Product/Pricing/Inventory/Tax/Promotion with Process approvals",
              "Four signed subsets; aggregate inventory inert"
            ],
            [
              "Original budget",
              "Promotion retained policy and original admission command",
              "Three Budget packs; no spend reset/replenishment"
            ],
            [
              "Separate seller consent",
              "Human issuer, revision, vendor, expiry and benefit purpose",
              "Nonimportable review checklist; no grant data"
            ],
            [
              "Coupon issuance",
              "Promotion original admission checksum and current consent",
              "Three Issuance packs; 100 per campaign, no raw tokens"
            ],
            [
              "Asset policies and binding",
              "Waste policies, genuine listing, retained Digital binding",
              "Separate circaDigitalOwnershipPolicies before reservation"
            ],
            [
              "Sale and refund",
              "Original Order, Payment/Loyalty and Waste lock/event",
              "Quantity one; full seller proceeds; no fees/carbon; original refund terms"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Issuer, vendor, outlet, original seller and buyer remain distinct roles. Reference canonical owners rather than duplicating identity, policy execution or receipts in a project. Consult the [Promotion owner guide](/docs/framework/promotion-campaigns-coupon-issuance) and eWaste llm/contracts/digital-ownership-sale.md. Source/documentation checks confer no execution permission."
        }
      ],
      "searchText": "Circa Data, Enterprises and Collection Network Enterprise, employee, store, location, collection-point, catalogue and release configuration with installed-history preservation. # Circa Data, Enterprises and Collection Network\n\nCirca composes records from several domain owners; it does not have one universal Circa table. For beginners, distinguish a business enterprise, a sellable store, a physical collection point and a coupon offer before importing data. Each has its own lifecycle and permissions. The business value of this separation is that one programme can change operators, locations or offers without rewriting customer ownership, credentials or settlement history.\n\n## Data ownership and record relationships\n\n| Record or relationship | Owner | Meaning |\n| --- | --- | --- |\n| Enterprise, parent/child, employees and memberships | Profile | Organizational responsibility and explicit access, not automatic trade permissions |\n| Location | Location | Canonical coordinates and location metadata |\n| Waste collection point | Waste Collection | Collection eligibility, policies and references to a location/operator |\n| Collection preset, taxonomy and acceptance policy | Waste with eWaste references | Supported items, evidence/receipt requirements and assessment selection |\n| Submission, verification, evidence, receipt and asset | Waste | Customer facts, decisions, physical custody and ownership |\n| Store, category, product, variant and localized copy | Commerce Product/Store | Published browsing and purchase context |\n| Price book/rows, inventory and coupon batch | Commerce/Promotion | Cost and purchasable supply, separate from issued customer codes |\n| Wallet, rewards and ledger | Loyalty | Governed value movement and immutable references |\n| Page, route, renderer, component and media | WCMS/Media | Published presentation, not business transaction truth |\n\nCollection-point references must resolve to real owner records. A map marker's display text is not the location authority. A physical redemption outlet is also not the online store that sold a coupon. A shared parent company does not make every subsidiary an eligible coupon merchant or every employee an operator.\n\n## Enterprises and employee access\n\nThe marketplace circaMainStore retains tenant default and explicitly references Profile enterprise GREENPERKS_ONLINE. It is a storefront role, not the canonical Waste seller or issuer of every benefit. Asset owner references remain unchanged. Five Stores distinguish marketplace, two GREENPERKS_RETAIL outlets and RenewWorks/LoopCycle. Names and parentage confer no ownership. Every employee needs current explicit membership, signed enterprise and owner-governed scope.\n\nProfile already represents parent/child enterprises. Hierarchy alone grants no membership, administrative delegation or outlet access. Consent-based ancestor delegation has an accepted framework policy, but complete enforcement remains unqualified in the current source batch. Keep existing exact-target/platform checks; do not grant access by inserting an ancestor lookup. Authorized platform admins are different from ordinary employees of a PLATFORM_OWNER enterprise.\n\n## Collection-centre configuration\n\nAcross the reviewed sources there are three original Circa points, 17 shared Waste Collection points and one separately selectable Sunmarke point: 21 authored codes, not an installed total. Setup selects shared packages; the Circa transaction sample is optional and Sunmarke sections are not selected in that setup list. The [collection reference](/docs/framework/accelerators/circa/collection-reference) lists all point identities, coordinates and associations. The [enterprise reference](/docs/framework/accelerators/circa/enterprise-reference) documents operator ownership, `assetOwnerEnterpriseRef` and staff scope caveats.\n\nThe original Circa sample contains `cc-dxb-01`, `cc-dxb-02` and `cc-dxb-03`, linked respectively to `cc-dxb-01-location`, `cc-dxb-02-location` and `cc-dxb-03-location`. The collection record controls its eligible operations and reference policy; the Location record supplies coordinates. Arrival uses fresh reported customer coordinates and direct distance, not map route distance or an assertion that the customer has arrived. Confirm the active runtime location after an authorized coordinate change; editing source alone does not update persisted data.\n\nFor a new centre, create/approve the enterprise allocation, canonical location, collection point and applicable presets through the existing owner tools/APIs. Assign employee centre scope separately. Then verify visibility, nearby discovery, eligible item handling and the inclusive arrival boundary. A missing or inactive centre must not be treated as eligible just because a browser retains its card.\n\n## Store and catalogue configuration\n\nThe reference retains circaMainStore, circaStaged, circaPointsPriceBook and circaDigitalRegistry, with POINTS/English/Asia-Dubai presentation. Commerce has 43 Products, five assets and 38 coupons, but excludes Store and raw supply writes. The required circa.ewaste:store pack prepares five masters. commerce-operational/header and Coupon/CouponBatch/InventoryBalance files are removed; six issuer Promotion instructions replace supply snapshots. Genuine Digital/Waste binding needs the separate three-policy source before reservation. These relationships are not installed consent, supply, fulfillment or native qualification. See the [catalogue reference](/docs/framework/accelerators/circa/catalogue-reference).\n\nAuthor catalogue data in Commerce Staged and publish through the owning governed projection. Publishing the website does not publish Commerce. An active source product that is not in the Online projection can correctly be absent from Shop. Optional localized offer copy includes terms, eligibility, exclusions, redemptionInstructions and purchaseConditions. Copy is not enforcement of minimum spend, a discount cap, stock or merchant authorization.\n\n## Releases, inheritance and preservation\n\ncirca.ewaste/data/manifest.json is authoritative and has 25 explicit sections at 0.0.1. Six owner setup packs, four signed publication subsets and original-sale asset policies are LOCAL-only. Other samples retain their declared scopes; core Waste reference may use ALL. Scope is per selection, not directory. Documentation is optional and separate; guide import never chooses business releases.\n\nThe reference sequence retains eWaste:core-reference and circa.ewaste:waste-policy, 0.0.1 in core-v001, using existing nImport filename/key/header composition. Business and reference sources are consolidated into v001. All 25 current manifest sections use 0.0.1; optional Waste samples exclude taxonomy/profile writes. The 84-root inventory has four signed subsets. Original budget and later issuance are six separate selections. Source consolidation proves neither a fresh installed destination nor permission to replay established receipts.\n\nBefore an upgrade, inventory installed receipts, checksum/version, existing codes, customer references and operational overrides through owner APIs. Unknown provenance blocks adoption. Never reimport opening wallets, submissions or ownership events over transactional history merely to refresh a demo. Do not manually edit generated manifest hashes or bypass import validation with direct database writes.\n\n## Customize and extend safely\n\nDevelopers add only intentional records/deltas under their custom backend module's `data/<release>/headers` and `records` trees. Configure the module's governed release manifest through existing tooling. A worked example is a fourth collection point: use a new approved code, reference an approved Location and operator, select existing eWaste policy, and leave the original three points and customers untouched. Do not copy the entire eWaste taxonomy to change one collection profile.\n\nTest composition against a fresh fixture and an installed-reference fixture with divergent policy. Verify that only selected records change, old assessment/ledger evidence remains intact, ambiguous references reject and retries retain receipts. Rollback is an owner-reviewed release action, not deletion of records with history.\n\n## Common mistakes\n\nConfusing coupon offers with issued codes; conflating store and outlet; using a Maps camera coordinate instead of the selected place; deriving access from enterprise business roles; refreshing sample transactions on a live installation; and treating configuration edits as installed data changes all produce misleading programmes.\n\n## Verification\n\nOperators and DevOps should inspect source manifests and installed owner receipts separately. Review cross-domain references, tenant/enterprise separation, missing references, duplicate codes, quantities and localization. Author negative and failure/recovery fixtures before joint imports. Source validation and pack generation do not execute imports. Continue with [submission](/docs/framework/accelerators/circa/submission), [coupon commerce](/docs/framework/accelerators/circa/coupons-commerce) and [customization](/docs/framework/accelerators/circa/customization).\n\n## Signed business data sequence\n\n| Stage | Canonical owner/evidence | Source boundary |\n| --- | --- | --- |\n| Reference and Store | Profile, Location, Waste and generated Store service | No membership, consent or supply from references |\n| Publication | Product/Pricing/Inventory/Tax/Promotion with Process approvals | Four signed subsets; aggregate inventory inert |\n| Original budget | Promotion retained policy and original admission command | Three Budget packs; no spend reset/replenishment |\n| Separate seller consent | Human issuer, revision, vendor, expiry and benefit purpose | Nonimportable review checklist; no grant data |\n| Coupon issuance | Promotion original admission checksum and current consent | Three Issuance packs; 100 per campaign, no raw tokens |\n| Asset policies and binding | Waste policies, genuine listing, retained Digital binding | Separate circaDigitalOwnershipPolicies before reservation |\n| Sale and refund | Original Order, Payment/Loyalty and Waste lock/event | Quantity one; full seller proceeds; no fees/carbon; original refund terms |\n\nIssuer, vendor, outlet, original seller and buyer remain distinct roles. Reference canonical owners rather than duplicating identity, policy execution or receipts in a project. Consult the [Promotion owner guide](/docs/framework/promotion-campaigns-coupon-issuance) and eWaste llm/contracts/digital-ownership-sale.md. Source/documentation checks confer no execution permission.\n",
      "previous": {
        "title": "Circa and the eWaste Product",
        "route": "/docs/framework/accelerators/circa"
      },
      "next": {
        "title": "Circa Customer eWaste Submission",
        "route": "/docs/framework/accelerators/circa/submission"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.accelerators",
        "technicalModule": "eWaste",
        "owner": "eWaste",
        "sourcePath": "data/docs-v001/records/documentation/eWasteDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/eWasteDocumentationComponentData.js",
        "wordCount": 1329,
        "checksum": "26b45a64f35409ef3689e0c6f19f80517899f5f7ba2443cc0e242cf092eca227"
      },
      "slug": "accelerators-circa-data-network",
      "locale": "en",
      "navigationGroup": "Circa eWaste Product",
      "navigationGroupCode": "circa-ewaste-product",
      "navigationGroupOrder": 20,
      "navigationOrder": 20,
      "references": [
        {
          "documentId": "accelerators.circa-overview",
          "owner": "eWaste"
        },
        {
          "documentId": "accelerators.circa-customization",
          "owner": "eWaste"
        }
      ]
    },
    "active": true
  },
  "record7": {
    "code": "nodicsDocsComponentacceleratorsCircaSubmissionJourney",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "accelerators.circa-submission-journey",
      "title": "Circa Customer eWaste Submission",
      "route": "/docs/framework/accelerators/circa/submission",
      "section": "accelerators-and-industry-solution-templates",
      "sectionTitle": "Accelerators and Industry Solution Templates",
      "group": "accelerators-and-industry-solution-templates",
      "groupTitle": "Accelerators and Industry Solution Templates",
      "parentId": "accelerators-and-industry-solution-templates",
      "hierarchyPath": [
        "Accelerators and Industry Solution Templates",
        "Circa Customer eWaste Submission"
      ],
      "hierarchyDepth": 2,
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
      "businessAudience": [],
      "technicalAudience": [],
      "summary": "Customer authentication, fresh arrival, photo preparation, correction, confirmation, account workspace and safe recovery.",
      "visibility": "public",
      "accessMode": "PUBLIC",
      "publiclyAvailable": true,
      "requiresAuthentication": false,
      "allowedRoles": [],
      "allowedGroups": [],
      "allowedPermissions": [],
      "lifecycleState": "ONLINE",
      "version": "0.16.15",
      "maturityState": "partial",
      "implementationState": "current",
      "renderingComponent": "documentation.component.article",
      "relatedPages": [
        "accelerators.circa-operations-rewards",
        "accelerators.circa-deployment-verification"
      ],
      "sourceEvidence": [
        "../../../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "src/router/routers.js",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/src/router/routers.js",
        "../../../../../../nodics.exp/nodics.circa.eWaste/README.md",
        "package.json",
        "src/service",
        "../../../../../nodics.waste/modules/wasteReceipt/src/schemas/schemas.js",
        "../../../../../nodics.waste/modules/wasteReceipt/AGENTS.md",
        "../../../../../nodics.waste/modules/wasteMovement/src/schemas/schemas.js",
        "../../../../../nodics.waste/modules/wasteMovement/AGENTS.md",
        "../../../../../nodics.waste/modules/wasteCompliance/src/schemas/schemas.js",
        "../../../../../nodics.waste/modules/wasteCompliance/AGENTS.md"
      ],
      "visualRequirements": [
        "table",
        "screen-flow"
      ],
      "searchKeywords": [
        "circa",
        "submit ewaste",
        "arrival",
        "photo",
        "draft",
        "telegram",
        "account"
      ],
      "topicKeywords": [
        "Circa",
        "Submission journey"
      ],
      "headings": [
        {
          "text": "Sign-in, intent and channels",
          "anchor": "acceleratorsCircaSubmissionJourney-1-sign-in-intent-and-channels",
          "level": 2
        },
        {
          "text": "Locate a centre and prove arrival",
          "anchor": "acceleratorsCircaSubmissionJourney-2-locate-a-centre-and-prove-arrival",
          "level": 2
        },
        {
          "text": "Prepare the photo without an empty submission",
          "anchor": "acceleratorsCircaSubmissionJourney-3-prepare-the-photo-without-an-empty-submission",
          "level": 2
        },
        {
          "text": "Review, correction and confirmation",
          "anchor": "acceleratorsCircaSubmissionJourney-4-review-correction-and-confirmation",
          "level": 2
        },
        {
          "text": "Account workspace and customer outcomes",
          "anchor": "acceleratorsCircaSubmissionJourney-5-account-workspace-and-customer-outcomes",
          "level": 2
        },
        {
          "text": "Customize and extend safely",
          "anchor": "acceleratorsCircaSubmissionJourney-6-customize-and-extend-safely",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "acceleratorsCircaSubmissionJourney-7-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "acceleratorsCircaSubmissionJourney-8-verification",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "image",
          "alt": "eWaste submission and independent outcomes",
          "title": "eWaste submission and independent outcomes",
          "mediaCode": "nodicsDocsImage_fa3273ca875807769edfe105"
        },
        {
          "kind": "paragraph",
          "text": "This source-backed diagram explains ownership and boundaries; it is not live deployment or acceptance evidence. Qualification notes remain part of the flow."
        },
        {
          "kind": "paragraph",
          "text": "The submission experience guides a customer from intent to evidence and an explicit review request. Beginners should understand that recognizing a photographed item does not approve it, deposit it physically or credit a wallet. The business purpose is consistent evidence collection with fewer technical questions, while retaining customer ownership checks and staff accountability."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Sign-in, intent and channels",
          "anchor": "acceleratorsCircaSubmissionJourney-1-sign-in-intent-and-channels"
        },
        {
          "kind": "paragraph",
          "text": "The public Submit Waste action remains available on web and mobile. Sign-in retains the intended journey rather than forcing the customer to rediscover it. Registration uses the Circa adapter to forward business form fields to Profile; it does not construct credentials locally. A new account is independent and may have an empty wallet. OTP is not silently imposed on the reference customer registration journey."
        },
        {
          "kind": "paragraph",
          "text": "The web, mobile and Telegram host share domain components. Telegram launch assertions are verified by backend/Profile integration and governed credential references. A `/telegram` shell or valid launch check is not proof of durable account linking, browser-handoff recovery or actual native-client acceptance. Account linking must use authenticated proof, never matching an email or trusting a host user identifier. WhatsApp product positioning is not a qualified Circa WhatsApp implementation."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Locate a centre and prove arrival",
          "anchor": "acceleratorsCircaSubmissionJourney-2-locate-a-centre-and-prove-arrival"
        },
        {
          "kind": "paragraph",
          "text": "The customer can browse a centre list and map without proving arrival. If location is unavailable, browsing and help remain useful. A chosen pin, directions link or route estimate never unlocks photo preparation. Circa requests fresh device/browser coordinates and submits them to backend arrival validation against a current eligible collection point."
        },
        {
          "kind": "paragraph",
          "text": "`circaEWaste.journey.arrivalRadiusMetres` uses an environment-backed reference fallback of 50 metres. The boundary is inclusive and measured by direct distance. Accuracy is optional observation metadata, not an arrival gate in this policy. Invalid/stale coordinates reject; the browser must preserve saved work and offer a retry. Telegram uses its native location capability when available, with browser fallback where appropriate. Permission denial and inaccurate/unavailable readings have distinct recovery controls. Neither control changes backend policy."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Prepare the photo without an empty submission",
          "anchor": "acceleratorsCircaSubmissionJourney-3-prepare-the-photo-without-an-empty-submission"
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart TD\n  Arrival[\"Fresh arrival\"] --> Photo[\"Choose or capture photo\"]\n  Photo --> Analyze[\"Analyze temporary bytes\"]\n  Analyze --> Evidence[\"Metadata and mandatory assessment\"]\n  Evidence --> Draft[\"Save Media and prepared draft\"]\n  Draft --> Review[\"Customer review and correction\"]\n  Review --> Confirm[\"Explicit confirm\"]\n  Confirm --> Submitted[\"Saved submitted item\"]\n  Analyze --> Failure[\"Failure or cancellation: no new empty submission\"]"
        },
        {
          "kind": "paragraph",
          "text": "Arrival preview creates no submission. Automatic preparation analyzes temporary bytes before saving Media and a prepared Waste draft. Closing or failing before successful analysis does not create a new empty submission. A failed replacement retains the previously saved photo/item. Saved unfinished work appears in Drafts; the submitted-item collection excludes unfinished states so totals and pagination do not contradict the filter."
        },
        {
          "kind": "paragraph",
          "text": "Photo metadata and environmental assessment are separate operations. Suggested classification, materials and physical details remain advisory until staff review. Impact assessment is mandatory for the eWaste journey: configured provider/profile failure propagates for retry rather than producing an apparently ready empty result. Supported partial assessment is explicit and can have input-only coverage without numerical carbon savings."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Review, correction and confirmation",
          "anchor": "acceleratorsCircaSubmissionJourney-4-review-correction-and-confirmation"
        },
        {
          "kind": "paragraph",
          "text": "Customers see the photo, item name/description, supported details and environmental assessment with provenance/limitations. They edit name and description; authorized Axis reviewers own technical classification and physical/environmental correction. Inconclusive recognition can use the configured manual-review path rather than asking a customer to invent technical facts."
        },
        {
          "kind": "paragraph",
          "text": "Final confirmation is an explicit authenticated domain command. It preserves the displayed revision and stable idempotency identity, validates current permissions, ownership, evidence and policy, and transitions the saved preparation to submitted work. Local optimistic UI is not a successful submission acknowledgement. If a response is uncertain, inspect the owner record before retrying; do not create a second draft simply because a spinner timed out."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Account workspace and customer outcomes",
          "anchor": "acceleratorsCircaSubmissionJourney-5-account-workspace-and-customer-outcomes"
        },
        {
          "kind": "table",
          "headers": [
            "View",
            "Expected behavior"
          ],
          "rows": [
            [
              "Dashboard `/account`",
              "Owner-backed wallet cards, status totals, recent items and draft shortcuts"
            ],
            [
              "My items `/account/items`",
              "Server filters, stable pagination, exact counts and grid/list controls"
            ],
            [
              "Drafts",
              "Saved-photo preview and explicit Continue action"
            ],
            [
              "Submission `/account/submissions/:code`",
              "Independently authorized item detail and public review feedback"
            ],
            [
              "Asset `/account/assets/:code`",
              "Accepted descriptor, available ownership actions and assessment history"
            ],
            [
              "Mobile/Telegram item link",
              "Preserves requested selector through sign-in; never substitutes another draft"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Quick view is read-only. Full detail is independently fetched, not trusted from a previous list. WCMS `/account/waste` supplies presentation through `circa.wasteWorkspace`, while `/nodics/eWaste/v0/account/items` supplies owner-scoped records/actions. Missing published composition gives a recoverable content error. Private photos require authorized Media reads; WCMS never stores customer records."
        },
        {
          "kind": "paragraph",
          "text": "Updates show Communication inbox entries resolved to authorized source items. Missing or inaccessible sources use a generic outcome, not leaked item details. Raw message bodies, arbitrary URLs and internal references are not customer copy. Notifications can fail independently of a committed review; that requires delivery recovery, not repeated approval."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customize and extend safely",
          "anchor": "acceleratorsCircaSubmissionJourney-6-customize-and-extend-safely"
        },
        {
          "kind": "paragraph",
          "text": "In a custom backend `config/properties.js`, export a focused journey-radius delta or approved display instruction. Preserve eWaste request mapping, authenticated identity, fresh coordinates and Location distance ownership. To change account banner/detail order, author the custom WCMS page/component records and publish them; do not embed domain eligibility in a React component. A radius change affects new arrival decisions, not retroactive approval or automatic submission."
        },
        {
          "kind": "paragraph",
          "text": "Developers must test just-inside/exact/outside radius, stale location, inactive centre, denied camera/location permissions, cancelled preparation, failed replacement, unknown assessment, wrong-owner detail, repeated confirmation and later-layer policy. Check desktop/mobile text, touch/keyboard controls and host Back navigation jointly."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "acceleratorsCircaSubmissionJourney-7-common-mistakes"
        },
        {
          "kind": "paragraph",
          "text": "Treating directions as proof; storing an empty draft before analysis; overwriting original AI/evidence with reviewer corrections; showing input mass as achieved diversion; or using a customer-supplied owner/tenant/service name violates the journey. An expired token needs authentication recovery, not broader backend service access."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "acceleratorsCircaSubmissionJourney-8-verification"
        },
        {
          "kind": "paragraph",
          "text": "Source entry points include eWaste `src/router/routers.js`, Circa journey adapters and customer frontend `CustomerWasteWorkspace`/item-detail components. Operator and DevOps acceptance must verify owner records before and after cancellation/retries, not merely UI messages. Behavioral and visual tests are separate from documentation validation. Continue to [staff review and rewards](/docs/framework/accelerators/circa/operations) and [deployment/verification](/docs/framework/accelerators/circa/deployment-verification)."
        }
      ],
      "searchText": "Circa Customer eWaste Submission Customer authentication, fresh arrival, photo preparation, correction, confirmation, account workspace and safe recovery. # Circa Customer eWaste Submission\n\n![eWaste submission and independent outcomes](media:nodicsDocsImage_fa3273ca875807769edfe105)\n\nThis source-backed diagram explains ownership and boundaries; it is not live deployment or acceptance evidence. Qualification notes remain part of the flow.\n\nThe submission experience guides a customer from intent to evidence and an explicit review request. Beginners should understand that recognizing a photographed item does not approve it, deposit it physically or credit a wallet. The business purpose is consistent evidence collection with fewer technical questions, while retaining customer ownership checks and staff accountability.\n\n## Sign-in, intent and channels\n\nThe public Submit Waste action remains available on web and mobile. Sign-in retains the intended journey rather than forcing the customer to rediscover it. Registration uses the Circa adapter to forward business form fields to Profile; it does not construct credentials locally. A new account is independent and may have an empty wallet. OTP is not silently imposed on the reference customer registration journey.\n\nThe web, mobile and Telegram host share domain components. Telegram launch assertions are verified by backend/Profile integration and governed credential references. A `/telegram` shell or valid launch check is not proof of durable account linking, browser-handoff recovery or actual native-client acceptance. Account linking must use authenticated proof, never matching an email or trusting a host user identifier. WhatsApp product positioning is not a qualified Circa WhatsApp implementation.\n\n## Locate a centre and prove arrival\n\nThe customer can browse a centre list and map without proving arrival. If location is unavailable, browsing and help remain useful. A chosen pin, directions link or route estimate never unlocks photo preparation. Circa requests fresh device/browser coordinates and submits them to backend arrival validation against a current eligible collection point.\n\n`circaEWaste.journey.arrivalRadiusMetres` uses an environment-backed reference fallback of 50 metres. The boundary is inclusive and measured by direct distance. Accuracy is optional observation metadata, not an arrival gate in this policy. Invalid/stale coordinates reject; the browser must preserve saved work and offer a retry. Telegram uses its native location capability when available, with browser fallback where appropriate. Permission denial and inaccurate/unavailable readings have distinct recovery controls. Neither control changes backend policy.\n\n## Prepare the photo without an empty submission\n\n```mermaid\nflowchart TD\n  Arrival[\"Fresh arrival\"] --> Photo[\"Choose or capture photo\"]\n  Photo --> Analyze[\"Analyze temporary bytes\"]\n  Analyze --> Evidence[\"Metadata and mandatory assessment\"]\n  Evidence --> Draft[\"Save Media and prepared draft\"]\n  Draft --> Review[\"Customer review and correction\"]\n  Review --> Confirm[\"Explicit confirm\"]\n  Confirm --> Submitted[\"Saved submitted item\"]\n  Analyze --> Failure[\"Failure or cancellation: no new empty submission\"]\n```\n\nArrival preview creates no submission. Automatic preparation analyzes temporary bytes before saving Media and a prepared Waste draft. Closing or failing before successful analysis does not create a new empty submission. A failed replacement retains the previously saved photo/item. Saved unfinished work appears in Drafts; the submitted-item collection excludes unfinished states so totals and pagination do not contradict the filter.\n\nPhoto metadata and environmental assessment are separate operations. Suggested classification, materials and physical details remain advisory until staff review. Impact assessment is mandatory for the eWaste journey: configured provider/profile failure propagates for retry rather than producing an apparently ready empty result. Supported partial assessment is explicit and can have input-only coverage without numerical carbon savings.\n\n## Review, correction and confirmation\n\nCustomers see the photo, item name/description, supported details and environmental assessment with provenance/limitations. They edit name and description; authorized Axis reviewers own technical classification and physical/environmental correction. Inconclusive recognition can use the configured manual-review path rather than asking a customer to invent technical facts.\n\nFinal confirmation is an explicit authenticated domain command. It preserves the displayed revision and stable idempotency identity, validates current permissions, ownership, evidence and policy, and transitions the saved preparation to submitted work. Local optimistic UI is not a successful submission acknowledgement. If a response is uncertain, inspect the owner record before retrying; do not create a second draft simply because a spinner timed out.\n\n## Account workspace and customer outcomes\n\n| View | Expected behavior |\n| --- | --- |\n| Dashboard `/account` | Owner-backed wallet cards, status totals, recent items and draft shortcuts |\n| My items `/account/items` | Server filters, stable pagination, exact counts and grid/list controls |\n| Drafts | Saved-photo preview and explicit Continue action |\n| Submission `/account/submissions/:code` | Independently authorized item detail and public review feedback |\n| Asset `/account/assets/:code` | Accepted descriptor, available ownership actions and assessment history |\n| Mobile/Telegram item link | Preserves requested selector through sign-in; never substitutes another draft |\n\nQuick view is read-only. Full detail is independently fetched, not trusted from a previous list. WCMS `/account/waste` supplies presentation through `circa.wasteWorkspace`, while `/nodics/eWaste/v0/account/items` supplies owner-scoped records/actions. Missing published composition gives a recoverable content error. Private photos require authorized Media reads; WCMS never stores customer records.\n\nUpdates show Communication inbox entries resolved to authorized source items. Missing or inaccessible sources use a generic outcome, not leaked item details. Raw message bodies, arbitrary URLs and internal references are not customer copy. Notifications can fail independently of a committed review; that requires delivery recovery, not repeated approval.\n\n## Customize and extend safely\n\nIn a custom backend `config/properties.js`, export a focused journey-radius delta or approved display instruction. Preserve eWaste request mapping, authenticated identity, fresh coordinates and Location distance ownership. To change account banner/detail order, author the custom WCMS page/component records and publish them; do not embed domain eligibility in a React component. A radius change affects new arrival decisions, not retroactive approval or automatic submission.\n\nDevelopers must test just-inside/exact/outside radius, stale location, inactive centre, denied camera/location permissions, cancelled preparation, failed replacement, unknown assessment, wrong-owner detail, repeated confirmation and later-layer policy. Check desktop/mobile text, touch/keyboard controls and host Back navigation jointly.\n\n## Common mistakes\n\nTreating directions as proof; storing an empty draft before analysis; overwriting original AI/evidence with reviewer corrections; showing input mass as achieved diversion; or using a customer-supplied owner/tenant/service name violates the journey. An expired token needs authentication recovery, not broader backend service access.\n\n## Verification\n\nSource entry points include eWaste `src/router/routers.js`, Circa journey adapters and customer frontend `CustomerWasteWorkspace`/item-detail components. Operator and DevOps acceptance must verify owner records before and after cancellation/retries, not merely UI messages. Behavioral and visual tests are separate from documentation validation. Continue to [staff review and rewards](/docs/framework/accelerators/circa/operations) and [deployment/verification](/docs/framework/accelerators/circa/deployment-verification).\n",
      "previous": {
        "title": "Circa Data, Enterprises and Collection Network",
        "route": "/docs/framework/accelerators/circa/data-network"
      },
      "next": {
        "title": "Circa Review, Assets, Rewards and Environmental Evidence",
        "route": "/docs/framework/accelerators/circa/operations"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.accelerators",
        "technicalModule": "eWaste",
        "owner": "eWaste",
        "sourcePath": "data/docs-v001/records/documentation/eWasteDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/eWasteDocumentationComponentData.js",
        "wordCount": 1041,
        "checksum": "b599dde8ee52d670647b8fc37c5c8f23a7d6f30bbb68942a591f1e06d91667ff"
      },
      "slug": "accelerators-circa-submission-journey",
      "locale": "en",
      "navigationGroup": "Circa eWaste Product",
      "navigationGroupCode": "circa-ewaste-product",
      "navigationGroupOrder": 20,
      "navigationOrder": 30,
      "references": [
        {
          "documentId": "accelerators.circa-operations-rewards",
          "owner": "eWaste"
        },
        {
          "documentId": "accelerators.circa-deployment-verification",
          "owner": "eWaste"
        }
      ]
    },
    "active": true
  },
  "record8": {
    "code": "nodicsDocsComponentacceleratorsCircaOperationsRewards",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "accelerators.circa-operations-rewards",
      "title": "Circa Review, Assets, Rewards and Environmental Evidence",
      "route": "/docs/framework/accelerators/circa/operations",
      "section": "accelerators-and-industry-solution-templates",
      "sectionTitle": "Accelerators and Industry Solution Templates",
      "group": "accelerators-and-industry-solution-templates",
      "groupTitle": "Accelerators and Industry Solution Templates",
      "parentId": "accelerators-and-industry-solution-templates",
      "hierarchyPath": [
        "Accelerators and Industry Solution Templates",
        "Circa Review, Assets, Rewards and Environmental Evidence"
      ],
      "hierarchyDepth": 2,
      "documentType": "operations",
      "audience": [
        "business",
        "architect",
        "administrator",
        "developer",
        "operator",
        "qa",
        "ai-tool"
      ],
      "businessAudience": [],
      "technicalAudience": [],
      "summary": "Axis roles/scopes, verification, approval, custody, asset ownership, assessments, settlement and recovery boundaries.",
      "visibility": "public",
      "accessMode": "PUBLIC",
      "publiclyAvailable": true,
      "requiresAuthentication": false,
      "allowedRoles": [],
      "allowedGroups": [],
      "allowedPermissions": [],
      "lifecycleState": "ONLINE",
      "version": "0.16.15",
      "maturityState": "partial",
      "implementationState": "current",
      "renderingComponent": "documentation.component.article",
      "relatedPages": [
        "accelerators.circa-submission-journey",
        "accelerators.circa-coupons-commerce"
      ],
      "sourceEvidence": [
        "../../../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "src/router/routers.js",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/config/properties.js",
        "../../../../../../nodics.exp/nodics.circa.eWaste/README.md",
        "package.json",
        "src/service",
        "../../../../../nodics.waste/modules/wasteReceipt/src/schemas/schemas.js",
        "../../../../../nodics.waste/modules/wasteReceipt/AGENTS.md",
        "../../../../../nodics.waste/modules/wasteMovement/src/schemas/schemas.js",
        "../../../../../nodics.waste/modules/wasteMovement/AGENTS.md",
        "../../../../../nodics.waste/modules/wasteCompliance/src/schemas/schemas.js",
        "../../../../../nodics.waste/modules/wasteCompliance/AGENTS.md"
      ],
      "visualRequirements": [
        "table",
        "screen-flow"
      ],
      "searchKeywords": [
        "circa",
        "axis",
        "review",
        "approval",
        "reward",
        "carbon",
        "assessment",
        "custody"
      ],
      "topicKeywords": [
        "Circa",
        "Operations and rewards"
      ],
      "headings": [
        {
          "text": "Staff roles and resource boundaries",
          "anchor": "acceleratorsCircaOperationsRewards-1-staff-roles-and-resource-boundaries",
          "level": 2
        },
        {
          "text": "Review and decision screen flow",
          "anchor": "acceleratorsCircaOperationsRewards-2-review-and-decision-screen-flow",
          "level": 2
        },
        {
          "text": "Assets, receipt and ownership",
          "anchor": "acceleratorsCircaOperationsRewards-3-assets-receipt-and-ownership",
          "level": 2
        },
        {
          "text": "Environmental assessments and history",
          "anchor": "acceleratorsCircaOperationsRewards-4-environmental-assessments-and-history",
          "level": 2
        },
        {
          "text": "Rewards and settlement",
          "anchor": "acceleratorsCircaOperationsRewards-5-rewards-and-settlement",
          "level": 2
        },
        {
          "text": "Customize and extend safely",
          "anchor": "acceleratorsCircaOperationsRewards-6-customize-and-extend-safely",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "acceleratorsCircaOperationsRewards-7-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "acceleratorsCircaOperationsRewards-8-verification",
          "level": 2
        },
        {
          "text": "Downstream Waste owner boundaries",
          "anchor": "circa-downstream-waste-owner-boundaries",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Circa's operational journey connects customer evidence to accountable staff decisions. For beginners, verification means reviewing facts; approval means accepting a submission under policy; receipt means recording physical custody. Reward settlement is a separate owner operation. The business benefit is traceability: an operator can explain which actor accepted which facts and why a wallet changed, without using a website status badge as the source of truth."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Staff roles and resource boundaries",
          "anchor": "acceleratorsCircaOperationsRewards-1-staff-roles-and-resource-boundaries"
        },
        {
          "kind": "paragraph",
          "text": "Axis consumes backend-governed eWaste/Waste workspaces and permissions. Profile owns the employee identity, selected enterprise membership and operational scopes. eWaste contributes its concrete electronics navigation to generic Waste operations; the frontend does not own a parallel review registry or persistence route."
        },
        {
          "kind": "table",
          "headers": [
            "Responsibility",
            "What it permits conceptually",
            "What it does not imply"
          ],
          "rows": [
            [
              "Queue/read staff",
              "View authorized submissions and evidence",
              "Verification, approval or all-centre access"
            ],
            [
              "Verifier",
              "Record a verified overlay under permission",
              "Approval authority or editing original evidence"
            ],
            [
              "Approver",
              "Accept/reject authorized reviewed work",
              "Arbitrary wallet adjustment or physical receipt"
            ],
            [
              "Collection/custody operator",
              "Record authorized receipt/custody evidence",
              "Transport dispatch or enterprise administration"
            ],
            [
              "Merchant operator",
              "Use qualified store-scoped coupon operations",
              "Waste review or other outlet access"
            ],
            [
              "Enterprise administrator",
              "Govern bounded enterprise staff/access",
              "Automatic operational scope or platform authority"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "The Circa reference sets `waste.operations.requireScopes = true` and `requireVerification = true`. It sets `requireDifferentApprover = false`: one employee with both explicit grants may verify and approve the same item. Separate permission checks, verification prerequisites and actor audit records still apply. Deployments requiring separation of duties must set and qualify the narrower policy; two accounts in a sample are not enforcement by themselves."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Review and decision screen flow",
          "anchor": "acceleratorsCircaOperationsRewards-2-review-and-decision-screen-flow"
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart TD\n  Queue[\"Authorized queue\"] --> Detail[\"Current detail and evidence\"]\n  Detail --> Assignment[\"Assignment when required\"]\n  Assignment --> Verification[\"Verified correction and revision\"]\n  Verification --> Decision[\"Authorized decision\"]\n  Decision --> Outcome[\"Saved outcome\"]\n  Outcome --> Asset[\"Asset and settlement effects\"]\n  Outcome --> Notification[\"Independent notification delivery\"]"
        },
        {
          "kind": "paragraph",
          "text": "The review detail presents original photo/evidence, suggested data, customer fields, centre context, assessment and audit. Reviewer corrections are a verified overlay, not a silent replacement of submitted data or AI output. Customer-facing feedback must be distinguished from private reviewer notes. Rejection needs an appropriate reason; the customer account should show the saved public outcome, not private proof."
        },
        {
          "kind": "paragraph",
          "text": "The eWaste routes expose review-workspace listing/detail, assignment, recovery, settlement retry and notification resolution/retry. Their presence does not qualify every interruption path. A stale revision, changed assignment, missing scope or ambiguous owner response must reject rather than fabricate a completed decision. Inspect retained state before retrying a committed effect."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Assets, receipt and ownership",
          "anchor": "acceleratorsCircaOperationsRewards-3-assets-receipt-and-ownership"
        },
        {
          "kind": "paragraph",
          "text": "Approval and associated policy can create/update an owned Waste asset. Receipt and custody remain separately recorded Waste facts; they cannot be inferred from a customer reaching a map pin or uploading a photo. Preserve linked evidence and history through any subsequent owner transition."
        },
        {
          "kind": "paragraph",
          "text": "An approved asset may expose list, gift, purchase or other policy-defined actions. Available actions come from the backend and are revalidated at execution. The reference's marketplace is digital ownership, not a promise to deliver a device. Attached illustrative carbon can move with an asset while historical approval rewards remain with the original contributor. Donation/recycling handoff and repair/reuse presentation must not be mistaken for a qualified logistics or repair orchestration product. Only activate actions whose owner policy and integration have passed the deployment's acceptance gates."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Environmental assessments and history",
          "anchor": "acceleratorsCircaOperationsRewards-4-environmental-assessments-and-history"
        },
        {
          "kind": "paragraph",
          "text": "Circa selects `DefaultEWasteOpenAiImpactProviderService` with configured `DefaultEWasteWarmImpactProviderService` fallback under `wasteImpact.calculation`. The environmental call is separate from photo metadata. It uses normalized item information and source references; invalid/timed-out results advance through the configured chain. Secrets remain governed provider references, not authored records."
        },
        {
          "kind": "paragraph",
          "text": "Saved results retain provider/model or factor-set version, source references, units, mass ranges, geography, scenario assumptions and limitations. INPUT_ONLY represents available input information without defensible calculated savings. WARM proxy and bundle-reference comparisons need their disclosed assumptions; they are not a measurement of achieved treatment or a certified item composition."
        },
        {
          "kind": "paragraph",
          "text": "Axis exposes assessment history, reassessment and explicit acceptance with reasons and revision checks. Accepted customer/asset details and history use authorized owner projections. Changing the provider does not overwrite old results. Reassessment does not silently revalue settled approval rewards. Show true zero/negative values, unknown metrics and limitation messages rather than substituting appealing defaults."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Rewards and settlement",
          "anchor": "acceleratorsCircaOperationsRewards-5-rewards-and-settlement"
        },
        {
          "kind": "paragraph",
          "text": "Loyalty owns wallet balances, ledger, reservations, debits, transfers and reversals. Rules/valuation assessment and original approval evidence determine the configured reward path. Circa renders confirmed assessment and settlement evidence; legacy valuation is compatibility context, not permission to recalculate balances locally."
        },
        {
          "kind": "paragraph",
          "text": "The reference's illustrative programme selects `circa`, reward type `points` and carbon reward type `circaCarbon`. Its weight valuation configuration includes sample rates and an illustrative marker. Those rates are not production financial policy, cash conversion, carbon prices or issued credits. Reward points, carbon units, CO2e estimates and tonnes of carbon equivalent are different concepts."
        },
        {
          "kind": "paragraph",
          "text": "If approval commits but settlement fails, inspect the original approval and the owner settlement reference. Use the qualified settlement recovery operation with the same command identity. Do not approve again, add an opening ledger or manually increase a balance. Notification failure is independently recoverable and cannot be used as a reason to repeat a wallet effect."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customize and extend safely",
          "anchor": "acceleratorsCircaOperationsRewards-6-customize-and-extend-safely"
        },
        {
          "kind": "paragraph",
          "text": "A project can select approved acceptance/verification/receipt/impact policy records through its governed data overlay. For example, require independent approval by exporting `waste.operations.requireDifferentApprover: true` in the project config, then assign separate verifier/approver memberships and centre scopes. Do not copy review services, change private evidence in WCMS or remove freshness/CAS checks."
        },
        {
          "kind": "paragraph",
          "text": "Developers test same-actor refusal under the changed policy, successful independent review, wrong-centre rejection, last-minute scope loss, stale revisions, partial settlement, retained notification retries and original evidence preservation. DevOps verifies effective configuration and owner receipts, not just source values. Keep provider choice and reward programme explicit during upgrades; previous results must continue to be understandable under their saved versions."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "acceleratorsCircaOperationsRewards-7-common-mistakes"
        },
        {
          "kind": "paragraph",
          "text": "Showing certified carbon claims from sample factors; rewarding both preparation and approval; merging private/public comments; treating admin groups as all-centre scope; inferring custody from arrival; and retrying approval to repair delivery are incorrect. Review before accepting an environmental reassessment and preserve the original contributor's reward history after ownership transfer."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "acceleratorsCircaOperationsRewards-8-verification"
        },
        {
          "kind": "paragraph",
          "text": "Read the eWaste review workspace routes and Waste/Loyalty owner contracts alongside the current project policy. Verify positive, denied, stale, interrupted and later-layer scenarios through the joint acceptance plan. Static source and docs checks do not prove external provider accuracy, installed settlement or actual operator permissions. Continue with [commerce](/docs/framework/accelerators/circa/coupons-commerce) and [deployment verification](/docs/framework/accelerators/circa/deployment-verification)."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Downstream Waste owner boundaries",
          "anchor": "circa-downstream-waste-owner-boundaries"
        },
        {
          "kind": "paragraph",
          "text": "Submission review, physical receipt, downstream movement and compliance evidence are distinct. The accelerator references the common framework owners below, not a second receipt, logistics ledger or certification authority. Generated model services and routes are declared, but schemas alone do not prove custody orchestration, installed authorization, automatic revision checks, external logistics confirmation or legal certification."
        },
        {
          "kind": "table",
          "headers": [
            "Canonical owner",
            "Declared data",
            "Limit"
          ],
          "rows": [
            [
              "wasteReceipt",
              "wasteReceipt binds submissionCode, collectionPointCode, receivedBy and receivedAt. Facts, quantity, weight and receiptEvidenceRefs retain physical observations. receiptStatus distinguishes received, partial, not received, damaged, rejected and discrepancy.",
              "Online submission approval is not physical custody. Enum values do not enforce transitions or verify quantities."
            ],
            [
              "wasteMovement",
              "wasteBatch represents containers, pallets, shipments, processing lots and audit lots. wasteMovement records source/target locations, batch, operator, dates, evidence and movementStatus.",
              "Planned pickup is not arrival or recycling. Idempotency fields alone do not implement replay prevention."
            ],
            [
              "wasteCompliance",
              "Profiles declare jurisdiction, waste families, hazards, required evidence and claim policy. Evidence links sourceRef, evidenceRefs and chainOfCustodyRefs to a decision and time.",
              "APPROVED is a data value, not independent certification or an automatic jurisdiction-specific legal decision."
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Retain submission review separately from a physical receipt. For a partially received device quantity, preserve the discrepancy and original observed facts instead of rewriting the approved submission. Downstream batches may reference receipts and source/current locations; each movement retains its actual source and target. Compliance evidence can reference this custody chain without changing receipt ownership. Never infer completed recycling, diversion, environmental credit or commercial settlement from one stored status."
        },
        {
          "kind": "paragraph",
          "text": "Partners extend their own modules with jurisdiction policy, logistics integration and additional evidence. Reuse canonical framework identities and authorized owner APIs; Media owns files and the separate reward owner governs settlement. Before enabling a workflow, test permitted and rejected transitions, missing evidence, incorrect operator/location scope, duplicate commands, stale revisions and interrupted recovery. Inspect effective generated schema exposure and permissions in the installed runtime. This reviewed reference settles documentation ownership, not exhaustive module depth or live operational acceptance."
        }
      ],
      "searchText": "Circa Review, Assets, Rewards and Environmental Evidence Axis roles/scopes, verification, approval, custody, asset ownership, assessments, settlement and recovery boundaries. # Circa Review, Assets, Rewards and Environmental Evidence\n\nCirca's operational journey connects customer evidence to accountable staff decisions. For beginners, verification means reviewing facts; approval means accepting a submission under policy; receipt means recording physical custody. Reward settlement is a separate owner operation. The business benefit is traceability: an operator can explain which actor accepted which facts and why a wallet changed, without using a website status badge as the source of truth.\n\n## Staff roles and resource boundaries\n\nAxis consumes backend-governed eWaste/Waste workspaces and permissions. Profile owns the employee identity, selected enterprise membership and operational scopes. eWaste contributes its concrete electronics navigation to generic Waste operations; the frontend does not own a parallel review registry or persistence route.\n\n| Responsibility | What it permits conceptually | What it does not imply |\n| --- | --- | --- |\n| Queue/read staff | View authorized submissions and evidence | Verification, approval or all-centre access |\n| Verifier | Record a verified overlay under permission | Approval authority or editing original evidence |\n| Approver | Accept/reject authorized reviewed work | Arbitrary wallet adjustment or physical receipt |\n| Collection/custody operator | Record authorized receipt/custody evidence | Transport dispatch or enterprise administration |\n| Merchant operator | Use qualified store-scoped coupon operations | Waste review or other outlet access |\n| Enterprise administrator | Govern bounded enterprise staff/access | Automatic operational scope or platform authority |\n\nThe Circa reference sets `waste.operations.requireScopes = true` and `requireVerification = true`. It sets `requireDifferentApprover = false`: one employee with both explicit grants may verify and approve the same item. Separate permission checks, verification prerequisites and actor audit records still apply. Deployments requiring separation of duties must set and qualify the narrower policy; two accounts in a sample are not enforcement by themselves.\n\n## Review and decision screen flow\n\n```mermaid\nflowchart TD\n  Queue[\"Authorized queue\"] --> Detail[\"Current detail and evidence\"]\n  Detail --> Assignment[\"Assignment when required\"]\n  Assignment --> Verification[\"Verified correction and revision\"]\n  Verification --> Decision[\"Authorized decision\"]\n  Decision --> Outcome[\"Saved outcome\"]\n  Outcome --> Asset[\"Asset and settlement effects\"]\n  Outcome --> Notification[\"Independent notification delivery\"]\n```\n\nThe review detail presents original photo/evidence, suggested data, customer fields, centre context, assessment and audit. Reviewer corrections are a verified overlay, not a silent replacement of submitted data or AI output. Customer-facing feedback must be distinguished from private reviewer notes. Rejection needs an appropriate reason; the customer account should show the saved public outcome, not private proof.\n\nThe eWaste routes expose review-workspace listing/detail, assignment, recovery, settlement retry and notification resolution/retry. Their presence does not qualify every interruption path. A stale revision, changed assignment, missing scope or ambiguous owner response must reject rather than fabricate a completed decision. Inspect retained state before retrying a committed effect.\n\n## Assets, receipt and ownership\n\nApproval and associated policy can create/update an owned Waste asset. Receipt and custody remain separately recorded Waste facts; they cannot be inferred from a customer reaching a map pin or uploading a photo. Preserve linked evidence and history through any subsequent owner transition.\n\nAn approved asset may expose list, gift, purchase or other policy-defined actions. Available actions come from the backend and are revalidated at execution. The reference's marketplace is digital ownership, not a promise to deliver a device. Attached illustrative carbon can move with an asset while historical approval rewards remain with the original contributor. Donation/recycling handoff and repair/reuse presentation must not be mistaken for a qualified logistics or repair orchestration product. Only activate actions whose owner policy and integration have passed the deployment's acceptance gates.\n\n## Environmental assessments and history\n\nCirca selects `DefaultEWasteOpenAiImpactProviderService` with configured `DefaultEWasteWarmImpactProviderService` fallback under `wasteImpact.calculation`. The environmental call is separate from photo metadata. It uses normalized item information and source references; invalid/timed-out results advance through the configured chain. Secrets remain governed provider references, not authored records.\n\nSaved results retain provider/model or factor-set version, source references, units, mass ranges, geography, scenario assumptions and limitations. INPUT_ONLY represents available input information without defensible calculated savings. WARM proxy and bundle-reference comparisons need their disclosed assumptions; they are not a measurement of achieved treatment or a certified item composition.\n\nAxis exposes assessment history, reassessment and explicit acceptance with reasons and revision checks. Accepted customer/asset details and history use authorized owner projections. Changing the provider does not overwrite old results. Reassessment does not silently revalue settled approval rewards. Show true zero/negative values, unknown metrics and limitation messages rather than substituting appealing defaults.\n\n## Rewards and settlement\n\nLoyalty owns wallet balances, ledger, reservations, debits, transfers and reversals. Rules/valuation assessment and original approval evidence determine the configured reward path. Circa renders confirmed assessment and settlement evidence; legacy valuation is compatibility context, not permission to recalculate balances locally.\n\nThe reference's illustrative programme selects `circa`, reward type `points` and carbon reward type `circaCarbon`. Its weight valuation configuration includes sample rates and an illustrative marker. Those rates are not production financial policy, cash conversion, carbon prices or issued credits. Reward points, carbon units, CO2e estimates and tonnes of carbon equivalent are different concepts.\n\nIf approval commits but settlement fails, inspect the original approval and the owner settlement reference. Use the qualified settlement recovery operation with the same command identity. Do not approve again, add an opening ledger or manually increase a balance. Notification failure is independently recoverable and cannot be used as a reason to repeat a wallet effect.\n\n## Customize and extend safely\n\nA project can select approved acceptance/verification/receipt/impact policy records through its governed data overlay. For example, require independent approval by exporting `waste.operations.requireDifferentApprover: true` in the project config, then assign separate verifier/approver memberships and centre scopes. Do not copy review services, change private evidence in WCMS or remove freshness/CAS checks.\n\nDevelopers test same-actor refusal under the changed policy, successful independent review, wrong-centre rejection, last-minute scope loss, stale revisions, partial settlement, retained notification retries and original evidence preservation. DevOps verifies effective configuration and owner receipts, not just source values. Keep provider choice and reward programme explicit during upgrades; previous results must continue to be understandable under their saved versions.\n\n## Common mistakes\n\nShowing certified carbon claims from sample factors; rewarding both preparation and approval; merging private/public comments; treating admin groups as all-centre scope; inferring custody from arrival; and retrying approval to repair delivery are incorrect. Review before accepting an environmental reassessment and preserve the original contributor's reward history after ownership transfer.\n\n## Verification\n\nRead the eWaste review workspace routes and Waste/Loyalty owner contracts alongside the current project policy. Verify positive, denied, stale, interrupted and later-layer scenarios through the joint acceptance plan. Static source and docs checks do not prove external provider accuracy, installed settlement or actual operator permissions. Continue with [commerce](/docs/framework/accelerators/circa/coupons-commerce) and [deployment verification](/docs/framework/accelerators/circa/deployment-verification).\n\n## Downstream Waste owner boundaries\n\nSubmission review, physical receipt, downstream movement and compliance evidence are distinct. The accelerator references the common framework owners below, not a second receipt, logistics ledger or certification authority. Generated model services and routes are declared, but schemas alone do not prove custody orchestration, installed authorization, automatic revision checks, external logistics confirmation or legal certification.\n\n| Canonical owner | Declared data | Limit |\n| --- | --- | --- |\n| wasteReceipt | wasteReceipt binds submissionCode, collectionPointCode, receivedBy and receivedAt. Facts, quantity, weight and receiptEvidenceRefs retain physical observations. receiptStatus distinguishes received, partial, not received, damaged, rejected and discrepancy. | Online submission approval is not physical custody. Enum values do not enforce transitions or verify quantities. |\n| wasteMovement | wasteBatch represents containers, pallets, shipments, processing lots and audit lots. wasteMovement records source/target locations, batch, operator, dates, evidence and movementStatus. | Planned pickup is not arrival or recycling. Idempotency fields alone do not implement replay prevention. |\n| wasteCompliance | Profiles declare jurisdiction, waste families, hazards, required evidence and claim policy. Evidence links sourceRef, evidenceRefs and chainOfCustodyRefs to a decision and time. | APPROVED is a data value, not independent certification or an automatic jurisdiction-specific legal decision. |\n\nRetain submission review separately from a physical receipt. For a partially received device quantity, preserve the discrepancy and original observed facts instead of rewriting the approved submission. Downstream batches may reference receipts and source/current locations; each movement retains its actual source and target. Compliance evidence can reference this custody chain without changing receipt ownership. Never infer completed recycling, diversion, environmental credit or commercial settlement from one stored status.\n\nPartners extend their own modules with jurisdiction policy, logistics integration and additional evidence. Reuse canonical framework identities and authorized owner APIs; Media owns files and the separate reward owner governs settlement. Before enabling a workflow, test permitted and rejected transitions, missing evidence, incorrect operator/location scope, duplicate commands, stale revisions and interrupted recovery. Inspect effective generated schema exposure and permissions in the installed runtime. This reviewed reference settles documentation ownership, not exhaustive module depth or live operational acceptance.\n",
      "previous": {
        "title": "Circa Customer eWaste Submission",
        "route": "/docs/framework/accelerators/circa/submission"
      },
      "next": {
        "title": "Circa Shop, Coupon Purchase and Redemption",
        "route": "/docs/framework/accelerators/circa/coupons-commerce"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.accelerators",
        "technicalModule": "eWaste",
        "owner": "eWaste",
        "sourcePath": "data/docs-v001/records/documentation/eWasteDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/eWasteDocumentationComponentData.js",
        "wordCount": 1408,
        "checksum": "87a01694067f27a608cc295cafc21c0012c705761a31f3ae6b48361534b62359"
      },
      "slug": "accelerators-circa-operations-rewards",
      "locale": "en",
      "navigationGroup": "Circa eWaste Product",
      "navigationGroupCode": "circa-ewaste-product",
      "navigationGroupOrder": 20,
      "navigationOrder": 40,
      "references": [
        {
          "documentId": "accelerators.circa-submission-journey",
          "owner": "eWaste"
        },
        {
          "documentId": "accelerators.circa-coupons-commerce",
          "owner": "eWaste"
        }
      ],
      "sourceOwnership": [
        {
          "modulePath": "../../../../../nodics.waste/modules/wasteReceipt",
          "implementationState": "SCHEMA_DEFINED",
          "anchor": "circa-downstream-waste-owner-boundaries",
          "evidence": [
            "../../../../../nodics.waste/modules/wasteReceipt/src/schemas/schemas.js",
            "../../../../../nodics.waste/modules/wasteReceipt/AGENTS.md"
          ],
          "rationale": "This accelerator operations guide references the common-Waste schema owner and distinguishes declared data from custody, logistics and compliance orchestration. The module remains a canonical public capability boundary, not an internal-only retirement or live-workflow claim."
        },
        {
          "modulePath": "../../../../../nodics.waste/modules/wasteMovement",
          "implementationState": "SCHEMA_DEFINED",
          "anchor": "circa-downstream-waste-owner-boundaries",
          "evidence": [
            "../../../../../nodics.waste/modules/wasteMovement/src/schemas/schemas.js",
            "../../../../../nodics.waste/modules/wasteMovement/AGENTS.md"
          ],
          "rationale": "This accelerator operations guide references the common-Waste schema owner and distinguishes declared data from custody, logistics and compliance orchestration. The module remains a canonical public capability boundary, not an internal-only retirement or live-workflow claim."
        },
        {
          "modulePath": "../../../../../nodics.waste/modules/wasteCompliance",
          "implementationState": "SCHEMA_DEFINED",
          "anchor": "circa-downstream-waste-owner-boundaries",
          "evidence": [
            "../../../../../nodics.waste/modules/wasteCompliance/src/schemas/schemas.js",
            "../../../../../nodics.waste/modules/wasteCompliance/AGENTS.md"
          ],
          "rationale": "This accelerator operations guide references the common-Waste schema owner and distinguishes declared data from custody, logistics and compliance orchestration. The module remains a canonical public capability boundary, not an internal-only retirement or live-workflow claim."
        }
      ]
    },
    "active": true
  },
  "record9": {
    "code": "nodicsDocsComponentacceleratorsCircaCouponsCommerce",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "accelerators.circa-coupons-commerce",
      "title": "Circa Shop, Coupon Purchase and Redemption",
      "route": "/docs/framework/accelerators/circa/coupons-commerce",
      "section": "accelerators-and-industry-solution-templates",
      "sectionTitle": "Accelerators and Industry Solution Templates",
      "group": "accelerators-and-industry-solution-templates",
      "groupTitle": "Accelerators and Industry Solution Templates",
      "parentId": "accelerators-and-industry-solution-templates",
      "hierarchyPath": [
        "Accelerators and Industry Solution Templates",
        "Circa Shop, Coupon Purchase and Redemption"
      ],
      "hierarchyDepth": 2,
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
      "businessAudience": [],
      "technicalAudience": [],
      "summary": "Published browsing, reviewed purchase, reservation, expiry, entitlements, outlet fulfillment, refunds and notification limits.",
      "visibility": "public",
      "accessMode": "PUBLIC",
      "publiclyAvailable": true,
      "requiresAuthentication": false,
      "allowedRoles": [],
      "allowedGroups": [],
      "allowedPermissions": [],
      "lifecycleState": "ONLINE",
      "version": "0.16.22",
      "maturityState": "partial",
      "implementationState": "current",
      "renderingComponent": "documentation.component.article",
      "relatedPages": [
        "accelerators.circa-data-network",
        "accelerators.circa-customization"
      ],
      "sourceEvidence": [
        "../../../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "../../../../../nodics.commerce/modules/digitalCommerce/modules/digitalCore/llm/contracts/README.md",
        "../../../../../nodics.commerce/modules/baseCommerce/modules/promotion/config/properties.js",
        "data/docs-v001/records/documentation/circaDocumentationComponentData.js",
        "package.json",
        "src/service",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/data/manifest.json",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/data/sample-v001/commerce/headers/circaCommerceCatalogHeader.js",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/data/sample-v001/commerce/records/circaProductData.js",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/data/sample-v001/commerce/records/circaProductVariantData.js",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/data/sample-v001/commerce/records/circaProductLocalizationData.js",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/data/sample-v001/commerce/records/circaProductVariantLocalizationData.js",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/data/sample-v001/commerce/records/circaPriceRowData.js",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/data/sample-v001/commerce/records/circaPromotionData.js",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/data/sample-v001/store/records/circaStoreData.js",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/src/service/defaultCircaDemoCommerceImportAdmissionService.js",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/test/circaCommerceForwardRelease.test.js",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/data/sample-v001/store/headers/circaStoreReferenceHeader.js",
        "llm/contracts/digital-ownership-sale.md",
        "src/service/defaultEWasteDigitalSaleService.js",
        "src/service/defaultEWasteOrderReversalService.js",
        "../../../../../nodics.commerce/modules/baseCommerce/modules/promotion/llm/contracts/accelerator-setup-contributions.md",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/llm/contracts/circa-promotion-setup.md",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/data/sample-v001/publication/records/publicationPlan.json",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/data/sample-v001/operations/asset-policy/headers/circaDigitalOwnershipPolicyHeader.js",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/test/circaPromotionInstructionPack.test.js",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/test/circaDigitalOwnershipPolicyPack.test.js"
      ],
      "visualRequirements": [
        "table",
        "screen-flow"
      ],
      "searchKeywords": [
        "circa",
        "coupon",
        "purchase",
        "store",
        "expiry",
        "redeem",
        "refund",
        "shop"
      ],
      "topicKeywords": [
        "Circa",
        "Coupon commerce"
      ],
      "headings": [
        {
          "text": "October 2026 Owner Integration Update",
          "anchor": "acceleratorsCircaCouponsCommerce-1-october-2026-owner-integration-update",
          "level": 2
        },
        {
          "text": "Published browsing and offer content",
          "anchor": "acceleratorsCircaCouponsCommerce-2-published-browsing-and-offer-content",
          "level": 2
        },
        {
          "text": "Purchase screen flow and owner sequence",
          "anchor": "acceleratorsCircaCouponsCommerce-3-purchase-screen-flow-and-owner-sequence",
          "level": 2
        },
        {
          "text": "Offer, batch, code and entitlement",
          "anchor": "acceleratorsCircaCouponsCommerce-4-offer-batch-code-and-entitlement",
          "level": 2
        },
        {
          "text": "Expiry and retained purchase rights",
          "anchor": "acceleratorsCircaCouponsCommerce-5-expiry-and-retained-purchase-rights",
          "level": 2
        },
        {
          "text": "Claim, outlet fulfillment and customer refresh",
          "anchor": "acceleratorsCircaCouponsCommerce-6-claim-outlet-fulfillment-and-customer-refresh",
          "level": 2
        },
        {
          "text": "Cancellation, refunds and failure recovery",
          "anchor": "acceleratorsCircaCouponsCommerce-7-cancellation-refunds-and-failure-recovery",
          "level": 2
        },
        {
          "text": "Native Priced Basket And Merchant Confirmation",
          "anchor": "acceleratorsCircaCouponsCommerce-8-native-priced-basket-and-merchant-confirmation",
          "level": 2
        },
        {
          "text": "Committed Notifications And Recipient Authority",
          "anchor": "acceleratorsCircaCouponsCommerce-9-committed-notifications-and-recipient-authority",
          "level": 2
        },
        {
          "text": "Customize and extend safely",
          "anchor": "acceleratorsCircaCouponsCommerce-10-customize-and-extend-safely",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "acceleratorsCircaCouponsCommerce-11-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "acceleratorsCircaCouponsCommerce-12-verification",
          "level": 2
        },
        {
          "text": "Original asset refund source boundary",
          "anchor": "acceleratorsCircaCouponsCommerce-13-original-asset-refund-source-boundary",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "heading",
          "level": 2,
          "text": "October 2026 Owner Integration Update",
          "anchor": "acceleratorsCircaCouponsCommerce-1-october-2026-owner-integration-update"
        },
        {
          "kind": "paragraph",
          "text": "Promotion now has authored issuer-governed seller authorization. The issuer's exact scoped administrator grants/revokes bounded seller rights; sale reservation retains its consent revision. Generic writes cannot manufacture issuer permission. Issuer/vendor reference equality alone is still not authorization. Independent source/exposure qualifications remain false until installed acceptance."
        },
        {
          "kind": "paragraph",
          "text": "Digital Core requests purchase notifications only after confirmed checkout, capture and unit-delivery evidence. Refund notifications require confirmed owner refund completion, payment outcome and unit reversal. Delivery failure is separate from financial compensation: it cannot undo a placed order or repeat a refund. Communication owns frozen durable intents and same-original-intent retry. Templates remain layered module resources. Source-bound inspection/retry takes no caller destination, template, amount or arbitrary intent identifier."
        },
        {
          "kind": "paragraph",
          "text": "The separately qualified native operator workspace is GET `/orders/:code/notifications/workspace`. Its exact module base follows the selected runtime's router contract; consumers use the published operation route rather than hardcoding a deployment URL. The versioned DTO keeps order code/revision and financial state separate from event/channel delivery observations. A persisted intent status is not mailbox delivery or financial proof. Inspection rereads deterministic original EMAIL/SMS intents through Communication's source-scoped API; missing, denied or failed reads remain UNCONFIRMED, including partial observations. Purchase inspection uses original committed evidence even after a coupon is redeemed or refunded; it does not authorize a new purchase message. Retry stays limited to the original frozen intent, current source eligibility, fresh operator permission and a reviewed order revision. Axis handles uncertainty by inspection, never by automatically replaying purchase, refund or notification. Navigation, presentation and fixed commands are owned by Digital Core; later-layer configuration may customize labels without changing eligibility or persistence."
        },
        {
          "kind": "paragraph",
          "text": "The monetary-benefit source supports fixed discounts, percentages, caps and minimum spend through exact amount arithmetic and owner-priced transaction evidence. Browser subtotals and merchant text are not that evidence. SKU/bundle fulfillment remains refused without approved product mappings and an authoritative priced/POS integration. Offer display names never become executable SKU rules. Existing approved sample records are not supplemented with invented identities, mappings or terms."
        },
        {
          "kind": "paragraph",
          "text": "Verified-recipient and priced/POS adapters are not yet installed owning integrations. Qualification stays false and delivery remains disabled. Business users, beginners and operators must distinguish authored mechanics from an enabled Circa journey. Developers customize existing Promotion, Digital Core and Communication exports and resources through later layers; do not copy engines into Kickoff or put financial authority in Circa UI. Joint automated/visual acceptance remains NOT RUN. No runtime import, approval of sample commercial terms or message send follows from this release."
        },
        {
          "kind": "image",
          "alt": "Coupon purchase, redemption and recovery boundaries",
          "title": "Coupon purchase, redemption and recovery boundaries",
          "mediaCode": "nodicsDocsImage_d7e3133701b51b866ebc288b"
        },
        {
          "kind": "paragraph",
          "text": "This source-backed diagram explains ownership and boundaries; it is not live deployment or acceptance evidence. Qualification notes remain part of the flow."
        },
        {
          "kind": "paragraph",
          "text": "Circa uses Commerce for browsing and purchases, Waste for asset ownership, Promotion for coupon units and Digital Commerce for purchased entitlements. Beginners should distinguish the coupon offer a customer browses from the unique code received for a purchased unit. The business value is a single account experience with explicit purchase review, while the owning frameworks protect prices, inventory and value."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Published browsing and offer content",
          "anchor": "acceleratorsCircaCouponsCommerce-2-published-browsing-and-offer-content"
        },
        {
          "kind": "paragraph",
          "text": "`/shop` and `/coupons` share search, filters, sorting, grid/list layout, exact counts, server pagination and read-only quick view. Listing URLs preserve selectors through details/reload/return. Public Circa APIs are `GET /nodics/circa.ewaste/v0/catalogue` and `/catalogue/:code`, with kind ASSET or COUPON. Independent detail reads validate kind and current availability rather than trusting a card previously loaded in a listing."
        },
        {
          "kind": "paragraph",
          "text": "Selectors include q, category, condition, issuer, minPoints, maxPoints, validUntil, sort, page and pageSize. Sorts are FEATURED, POINTS_ASC, POINTS_DESC, NAME and coupon-only EXPIRY. `validUntil` asks that the listed coupon remains valid through the selected date; it is not a purchase-relative expiry switch. The reference composition reads Product pages in batches of 100 and bounds the catalogue at 2,000 published products, with default page size 12 and maximum 48. Repeated owner pages or bound overflow reject instead of silently presenting truncated totals."
        },
        {
          "kind": "paragraph",
          "text": "Product localized attributes can carry terms, eligibility, exclusions, redemptionInstructions and purchaseConditions as strings/arrays. Missing information is reported as missing. Developers must not convert descriptive copy into implied enforcement. In particular, the current illustrative sample offer names are not evidence of real partner commitments or production discount settlement."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Purchase screen flow and owner sequence",
          "anchor": "acceleratorsCircaCouponsCommerce-3-purchase-screen-flow-and-owner-sequence"
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart TD\n  Offer[\"Published offer\"] --> Review[\"Authenticated review\"]\n  Review --> Fresh[\"Fresh wallet and offer evidence\"]\n  Fresh --> Confirm[\"Explicit confirm with revision and command key\"]\n  Confirm --> Checkout[\"Commerce checkout\"]\n  Checkout --> Reserve[\"Coupon reservation\"]\n  Reserve --> Payment[\"Payment or value owner\"]\n  Payment --> Sale[\"Confirmed sale\"]\n  Sale --> Entitlement[\"Entitlement and delivery evidence\"]\n  Entitlement --> History[\"Customer purchase history\"]"
        },
        {
          "kind": "paragraph",
          "text": "The eWaste marketplace purchase route is `POST /nodics/eWaste/v0/marketplace/:code/purchase`. The request mapper supplies trusted context; caller bodies cannot choose service, store or owner. The displayed revision and stable command identity accompany explicit confirmation. Wallet refresh failure leaves confirmation unavailable; backend owners still validate/debit value. No browser wallet calculation acknowledges payment."
        },
        {
          "kind": "paragraph",
          "text": "For coupon-code-pool products, Digital Core expands purchased quantity into units and asks Promotion to reserve concrete supply. Quantity must be a bounded positive integer; `digitalCore.maximumCouponUnitsPerCheckout` defaults to 100 across the calculation. Confirmed partial acquisitions and the uncertain failing command are retained for Checkout compensation. An uncertain reservation is not successful release even if every known unit was released."
        },
        {
          "kind": "paragraph",
          "text": "Promotion owns reservation/sale/delivery state, original buyer/order/idempotency bindings and revisioned writes. The staged safety increment requires strict owner acknowledgement and uncached readback; it no longer accepts a locally constructed fallback as persisted success. Terminal sale/delivery replay cannot downgrade state or reset the original sale timestamp. Installed generated-owner CAS/uniqueness and cross-owner interrupted recovery still require qualification."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Offer, batch, code and entitlement",
          "anchor": "acceleratorsCircaCouponsCommerce-4-offer-batch-code-and-entitlement"
        },
        {
          "kind": "table",
          "headers": [
            "Concept",
            "Lifecycle significance"
          ],
          "rows": [
            [
              "Product/offer",
              "Browsable terms, price and listing context"
            ],
            [
              "Promotion",
              "Eligibility/actions and retained-rights source when qualified"
            ],
            [
              "Batch/pool",
              "Supply available for purchase, not customer entitlement"
            ],
            [
              "Coupon unit",
              "Concrete reserved/sold/customer-bound code"
            ],
            [
              "Digital entitlement",
              "Customer purchase/claim/delivery/reversal evidence"
            ],
            [
              "Merchant confirmation",
              "Authorized fulfillment at an eligible physical outlet"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "All 38 variants and both variant-localization families retain demoPurchaseUnits 100 and <product>_BATCH identities. Six immutable issuer instructions request 3,800 units through Promotion, not direct CouponBatch/Coupon/InventoryBalance import. commerce-operational is removed. Budget precedes separate human issuer review, then issuance pins original admission. Consent must retain benefitConsumption ISSUED_COUPON_BENEFIT_V1 for the canonical benefit receiver. Source intent is not issued supply, spend or a grant. Single-use and exact-outlet owner checks remain required."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Expiry and retained purchase rights",
          "anchor": "acceleratorsCircaCouponsCommerce-5-expiry-and-retained-purchase-rights"
        },
        {
          "kind": "paragraph",
          "text": "All 38 source offers author purchasedCouponPolicy.validityDays 30 and disclosed terms while retaining separate campaign dates. Canonical Promotion capture retains/fingerprints these rights, and exact publication/setup/admission pins were refreshed. Independent owner enablement and installed qualification still apply. Original successful sale, not publication, delivery or retry, determines expiry. Never replace old issued rights, infer qualification from flags or amend old snapshots to match new policy."
        },
        {
          "kind": "paragraph",
          "text": "Purchase history now displays owner expiry/terms; an expired or invalid supplied expiry hides reveal. Backend reveal/use checks remain authoritative. Generic mutation/provenance protection and installed acceptance are still outstanding, so this guide is not permission to turn the retained-rights gate on. Legacy fixed dates must not be rewritten without a governed compatibility plan."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Claim, outlet fulfillment and customer refresh",
          "anchor": "acceleratorsCircaCouponsCommerce-6-claim-outlet-fulfillment-and-customer-refresh"
        },
        {
          "kind": "paragraph",
          "text": "Authenticated eWaste routes expose coupon reveal, eligible merchants and claim. Merchant confirmation belongs to qualified Digital Commerce/Promotion operations with Profile employee context and canonical Store scope. Supported Promotion conditions include coupon ownership/product and explicit storeCodes. Richer receipt subtotal, minimum-spend and cap validation now uses the native priced-cart adapter described below. Unsupported SKU/bundle mappings and unknown conditions reject rather than being ignored; no offer prose is interpreted as executable benefit terms."
        },
        {
          "kind": "paragraph",
          "text": "Purchase history can refresh saved merchant/receipt evidence without executing purchase/claim/redemption again. Its default visible refresh is 60 seconds and on focus/return; the presentation option accepts 15-300 seconds. Failed refresh marks history stale and hides reveal actions. Session change clears displayed history and invalidates late reveals. Secret codes are not published into WCMS, email templates, analytics or an all-customer catalogue."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Cancellation, refunds and failure recovery",
          "anchor": "acceleratorsCircaCouponsCommerce-7-cancellation-refunds-and-failure-recovery"
        },
        {
          "kind": "paragraph",
          "text": "Order owns reviewed cancellation/refund orchestration; Payment owns original captured-value reversal; Digital Core/Promotion own entitlement/code revocation. Unused does not universally mean automatically refundable. Claimed/redeemed/mixed orders require review. The staged retained policy checks allowed request type and purchase-relative window before locking; absent retained refund policy requires manual review. General provider and seller-settlement qualification remain separate."
        },
        {
          "kind": "paragraph",
          "text": "Prepared units enter REFUND_PENDING with an original refund binding before value reversal. Completion requires saved matching revocation/reversal evidence. An exact bounded unit multiset is rechecked at preview, preparation and completion: missing/extra units or duplicate entitlement/code identities cannot produce success. Repeated order entries of one product are aggregated before comparison. An uncertain payment or partial owner write requires inspection under the same command, not a fresh refund. Purchase/refund EMAIL/SMS resources exist under Digital Core `src/templates`, with committed-evidence intent triggers wired to the owning purchase and refund boundaries. Recipient and privacy qualification remain independently gated. A resource file is not a sent notification; pending reversal must never send a completed-refund message."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Native Priced Basket And Merchant Confirmation",
          "anchor": "acceleratorsCircaCouponsCommerce-8-native-priced-basket-and-merchant-confirmation"
        },
        {
          "kind": "paragraph",
          "text": "The native provider accepts `CART:<existing-cart-code>` before validation. It is explicitly PRICED_CART: evidence of an existing basket priced by activated Nodics Pricing, not external POS settlement or payment capture. ORDER handles reject because today's prices must not reprice a committed order. A custom external POS connector requires its own provider contract and approved operational records."
        },
        {
          "kind": "paragraph",
          "text": "Cart owns buyer intent and quantities; Store owns the canonical outlet; Promotion owns the delivered/claimed purchased coupon; Pricing owns activated policy and exact line/subtotal arithmetic; Digital Core owns the current employee authorization and frozen native receipt. Pricing derives the buyer from the purchased coupon, checks issuer/outlet/Cart ownership and currency, then reads the complete bounded entry set. Client amounts, saved Cart totals and entry price fields are not authoritative prices. Ambiguous price precedence, partial reads, variants/quotes and missing activated roots reject. The adapter rereads coupon, Cart, entries, Store and published policy to detect drift before returning source evidence."
        },
        {
          "kind": "paragraph",
          "text": "Service-only POST `/internal/merchant/priced-transaction` accepts exactly `couponCode`, `storeCode` and `sourceReference`. It requires the configured runtime permission and signed tenant/enterprise scope, operational owning modules and private capture. Promotion calls it through existing authenticated module transport with bounded HTTPS and no redirects or retry. Later layers may select another qualified provider; they cannot replace owner evidence with browser totals or permissive fallback pricing."
        },
        {
          "kind": "paragraph",
          "text": "The merchant workspace exposes `pricedSourceRequired` and configured `pricedSourceLabel`. Axis collects the reference before POST `/merchant/redemptions/validate`, retains validationCode/expiry/revision and confirms with the same original reference. Validation compares current fixed/percentage/cap/ minimum terms and binds the exact benefit snapshot. Confirmation rereads current membership and pricing; changed basket/outlet/price/scope requires original-command review. An acknowledged receipt replay retains its original snapshot without repricing. Displayed monetary evidence never claims seller settlement or refund completion."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Committed Notifications And Recipient Authority",
          "anchor": "acceleratorsCircaCouponsCommerce-9-committed-notifications-and-recipient-authority"
        },
        {
          "kind": "image",
          "alt": "Circa committed-event, canonical-contact and delivery authority",
          "title": "Circa committed-event, canonical-contact and delivery authority",
          "mediaCode": "nodicsDocsImage_e3ee17309744359228b0ac4a"
        },
        {
          "kind": "paragraph",
          "text": "Solid arrows show owning proof/delivery interactions; dashed arrows show fresh source reread and separately reviewed retry. Green identifies user/operator entry, blue Commerce financial authority, teal Profile contact authority and rose Communication. The yellow note marks unexecuted installation and acceptance gates. The [editable diagram source](../assets/diagrams/circa-notification-authority.dot) contains no customer records, sender credentials or fabricated delivery evidence."
        },
        {
          "kind": "paragraph",
          "text": "Digital Core freezes intent only from committed purchase/refund evidence. It asks Profile's private `/internal/commerce/notification-recipient` with channel plus exact event coordinates: kind, orderCode, sourceCode and orderRevision. No recipient address or arbitrary buyer ID is accepted. Profile asks Digital Core's private `/internal/notifications/recipient-source` to independently prove the current committed event and derive its stored buyer. Only then may the selected Profile verified-contact owner read verification, transactional consent and suppression. The financial source is reread after contact admission; drift fails without a new intent or financial write."
        },
        {
          "kind": "paragraph",
          "text": "Communication owns template rendering, provider delivery, retained status and original retry semantics. Purchase is not marketing consent. Inspection and retry eligibility are separate operator outcomes; pending finance must never produce a completed-refund message. Approved recipients, sending grants, private capture, connection/TLS and contact-proof qualification remain mandatory. No email/SMS has been sent as part of source implementation or CMS documentation validation."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customize and extend safely",
          "anchor": "acceleratorsCircaCouponsCommerce-10-customize-and-extend-safely"
        },
        {
          "kind": "paragraph",
          "text": "In the custom backend, author products/variants/prices/promotion policies and localized copy in governed data releases, then publish Commerce. Select store, wallet reward type and approved fulfillment policy in focused configuration. A safe example adds offer exclusions and an explicit eligible outlet list while preserving code ownership, single-use CAS, current employee scope and reviewed purchase. Copy alone cannot implement a capped percentage benefit. New provider logic belongs with Promotion/Digital Commerce through the Nodics contribution process, not a Circa button or duplicate Kickoff checkout engine."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "acceleratorsCircaCouponsCommerce-11-common-mistakes"
        },
        {
          "kind": "paragraph",
          "text": "Equating catalogue validity with purchased expiry; refunding because a code looks unused; granting all group outlets implicitly; interpreting sample POINTS as AED; showing cached history as authorization; and treating a released known reservation as proof about an uncertain unit are incorrect. Preserve the original order/key."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "acceleratorsCircaCouponsCommerce-12-verification"
        },
        {
          "kind": "paragraph",
          "text": "Operator/DevOps acceptance must inspect owner order/payment/entitlement/receipt references, not only the success screen. Cover stock exhaustion, fractional and aggregate quantity limits, insufficient wallet, changed price/revision, duplicate confirm, expiry, wrong owner/outlet, double redemption, interrupted persistence, refund window and retry. Visual acceptance covers details, terms, empty/stale history and desktop/mobile purchase review. Continue with [customization](/docs/framework/accelerators/circa/customization) and [deployment](/docs/framework/accelerators/circa/deployment-verification)."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Original asset refund source boundary",
          "anchor": "acceleratorsCircaCouponsCommerce-13-original-asset-refund-source-boundary"
        },
        {
          "kind": "paragraph",
          "text": "The five quantity-one asset offers are not coupon units. Separate Local-only circaDigitalOwnershipPolicies carries the original refund term, full captured POINTS to the original current seller, no fees and no new carbon settlement. Genuine Waste listing and retained Digital binding must retain three policies before reservation. This pack installs no binding/event, grants no approval and qualifies no transport."
        },
        {
          "kind": "paragraph",
          "text": "Only original Order-reviewed digital refund may reverse original seller earning, refund original buyer capture and restore ownership under Waste lock/CAS checks. It requires ORIGINAL_TRANSFER_REVERSAL_ONLY_BEFORE_ONWARD_TRANSFER in the unchanged original policies and no onward transfer. Older missing terms stay refused/manual-review-only; physical return/custody is not authorized. eWaste llm/contracts/digital-ownership-sale.md#original-sale-refund owns the details; the [catalogue reference](/docs/framework/accelerators/circa/catalogue-reference) names the project's policy choices."
        }
      ],
      "searchText": "Circa Shop, Coupon Purchase and Redemption Published browsing, reviewed purchase, reservation, expiry, entitlements, outlet fulfillment, refunds and notification limits. # Circa Shop, Coupon Purchase and Redemption\n\n## October 2026 Owner Integration Update\n\nPromotion now has authored issuer-governed seller authorization. The issuer's exact scoped administrator grants/revokes bounded seller rights; sale reservation retains its consent revision. Generic writes cannot manufacture issuer permission. Issuer/vendor reference equality alone is still not authorization. Independent source/exposure qualifications remain false until installed acceptance.\n\nDigital Core requests purchase notifications only after confirmed checkout, capture and unit-delivery evidence. Refund notifications require confirmed owner refund completion, payment outcome and unit reversal. Delivery failure is separate from financial compensation: it cannot undo a placed order or repeat a refund. Communication owns frozen durable intents and same-original-intent retry. Templates remain layered module resources. Source-bound inspection/retry takes no caller destination, template, amount or arbitrary intent identifier.\n\nThe separately qualified native operator workspace is GET `/orders/:code/notifications/workspace`. Its exact module base follows the selected runtime's router contract; consumers use the published operation route rather than hardcoding a deployment URL. The versioned DTO keeps order code/revision and financial state separate from event/channel delivery observations. A persisted intent status is not mailbox delivery or financial proof. Inspection rereads deterministic original EMAIL/SMS intents through Communication's source-scoped API; missing, denied or failed reads remain UNCONFIRMED, including partial observations. Purchase inspection uses original committed evidence even after a coupon is redeemed or refunded; it does not authorize a new purchase message. Retry stays limited to the original frozen intent, current source eligibility, fresh operator permission and a reviewed order revision. Axis handles uncertainty by inspection, never by automatically replaying purchase, refund or notification. Navigation, presentation and fixed commands are owned by Digital Core; later-layer configuration may customize labels without changing eligibility or persistence.\n\nThe monetary-benefit source supports fixed discounts, percentages, caps and minimum spend through exact amount arithmetic and owner-priced transaction evidence. Browser subtotals and merchant text are not that evidence. SKU/bundle fulfillment remains refused without approved product mappings and an authoritative priced/POS integration. Offer display names never become executable SKU rules. Existing approved sample records are not supplemented with invented identities, mappings or terms.\n\nVerified-recipient and priced/POS adapters are not yet installed owning integrations. Qualification stays false and delivery remains disabled. Business users, beginners and operators must distinguish authored mechanics from an enabled Circa journey. Developers customize existing Promotion, Digital Core and Communication exports and resources through later layers; do not copy engines into Kickoff or put financial authority in Circa UI. Joint automated/visual acceptance remains NOT RUN. No runtime import, approval of sample commercial terms or message send follows from this release.\n\n![Coupon purchase, redemption and recovery boundaries](media:nodicsDocsImage_d7e3133701b51b866ebc288b)\n\nThis source-backed diagram explains ownership and boundaries; it is not live deployment or acceptance evidence. Qualification notes remain part of the flow.\n\nCirca uses Commerce for browsing and purchases, Waste for asset ownership, Promotion for coupon units and Digital Commerce for purchased entitlements. Beginners should distinguish the coupon offer a customer browses from the unique code received for a purchased unit. The business value is a single account experience with explicit purchase review, while the owning frameworks protect prices, inventory and value.\n\n## Published browsing and offer content\n\n`/shop` and `/coupons` share search, filters, sorting, grid/list layout, exact counts, server pagination and read-only quick view. Listing URLs preserve selectors through details/reload/return. Public Circa APIs are `GET /nodics/circa.ewaste/v0/catalogue` and `/catalogue/:code`, with kind ASSET or COUPON. Independent detail reads validate kind and current availability rather than trusting a card previously loaded in a listing.\n\nSelectors include q, category, condition, issuer, minPoints, maxPoints, validUntil, sort, page and pageSize. Sorts are FEATURED, POINTS_ASC, POINTS_DESC, NAME and coupon-only EXPIRY. `validUntil` asks that the listed coupon remains valid through the selected date; it is not a purchase-relative expiry switch. The reference composition reads Product pages in batches of 100 and bounds the catalogue at 2,000 published products, with default page size 12 and maximum 48. Repeated owner pages or bound overflow reject instead of silently presenting truncated totals.\n\nProduct localized attributes can carry terms, eligibility, exclusions, redemptionInstructions and purchaseConditions as strings/arrays. Missing information is reported as missing. Developers must not convert descriptive copy into implied enforcement. In particular, the current illustrative sample offer names are not evidence of real partner commitments or production discount settlement.\n\n## Purchase screen flow and owner sequence\n\n```mermaid\nflowchart TD\n  Offer[\"Published offer\"] --> Review[\"Authenticated review\"]\n  Review --> Fresh[\"Fresh wallet and offer evidence\"]\n  Fresh --> Confirm[\"Explicit confirm with revision and command key\"]\n  Confirm --> Checkout[\"Commerce checkout\"]\n  Checkout --> Reserve[\"Coupon reservation\"]\n  Reserve --> Payment[\"Payment or value owner\"]\n  Payment --> Sale[\"Confirmed sale\"]\n  Sale --> Entitlement[\"Entitlement and delivery evidence\"]\n  Entitlement --> History[\"Customer purchase history\"]\n```\n\nThe eWaste marketplace purchase route is `POST /nodics/eWaste/v0/marketplace/:code/purchase`. The request mapper supplies trusted context; caller bodies cannot choose service, store or owner. The displayed revision and stable command identity accompany explicit confirmation. Wallet refresh failure leaves confirmation unavailable; backend owners still validate/debit value. No browser wallet calculation acknowledges payment.\n\nFor coupon-code-pool products, Digital Core expands purchased quantity into units and asks Promotion to reserve concrete supply. Quantity must be a bounded positive integer; `digitalCore.maximumCouponUnitsPerCheckout` defaults to 100 across the calculation. Confirmed partial acquisitions and the uncertain failing command are retained for Checkout compensation. An uncertain reservation is not successful release even if every known unit was released.\n\nPromotion owns reservation/sale/delivery state, original buyer/order/idempotency bindings and revisioned writes. The staged safety increment requires strict owner acknowledgement and uncached readback; it no longer accepts a locally constructed fallback as persisted success. Terminal sale/delivery replay cannot downgrade state or reset the original sale timestamp. Installed generated-owner CAS/uniqueness and cross-owner interrupted recovery still require qualification.\n\n## Offer, batch, code and entitlement\n\n| Concept | Lifecycle significance |\n| --- | --- |\n| Product/offer | Browsable terms, price and listing context |\n| Promotion | Eligibility/actions and retained-rights source when qualified |\n| Batch/pool | Supply available for purchase, not customer entitlement |\n| Coupon unit | Concrete reserved/sold/customer-bound code |\n| Digital entitlement | Customer purchase/claim/delivery/reversal evidence |\n| Merchant confirmation | Authorized fulfillment at an eligible physical outlet |\n\nAll 38 variants and both variant-localization families retain demoPurchaseUnits 100 and <product>_BATCH identities. Six immutable issuer instructions request 3,800 units through Promotion, not direct CouponBatch/Coupon/InventoryBalance import. commerce-operational is removed. Budget precedes separate human issuer review, then issuance pins original admission. Consent must retain benefitConsumption ISSUED_COUPON_BENEFIT_V1 for the canonical benefit receiver. Source intent is not issued supply, spend or a grant. Single-use and exact-outlet owner checks remain required.\n\n## Expiry and retained purchase rights\n\nAll 38 source offers author purchasedCouponPolicy.validityDays 30 and disclosed terms while retaining separate campaign dates. Canonical Promotion capture retains/fingerprints these rights, and exact publication/setup/admission pins were refreshed. Independent owner enablement and installed qualification still apply. Original successful sale, not publication, delivery or retry, determines expiry. Never replace old issued rights, infer qualification from flags or amend old snapshots to match new policy.\n\nPurchase history now displays owner expiry/terms; an expired or invalid supplied expiry hides reveal. Backend reveal/use checks remain authoritative. Generic mutation/provenance protection and installed acceptance are still outstanding, so this guide is not permission to turn the retained-rights gate on. Legacy fixed dates must not be rewritten without a governed compatibility plan.\n\n## Claim, outlet fulfillment and customer refresh\n\nAuthenticated eWaste routes expose coupon reveal, eligible merchants and claim. Merchant confirmation belongs to qualified Digital Commerce/Promotion operations with Profile employee context and canonical Store scope. Supported Promotion conditions include coupon ownership/product and explicit storeCodes. Richer receipt subtotal, minimum-spend and cap validation now uses the native priced-cart adapter described below. Unsupported SKU/bundle mappings and unknown conditions reject rather than being ignored; no offer prose is interpreted as executable benefit terms.\n\nPurchase history can refresh saved merchant/receipt evidence without executing purchase/claim/redemption again. Its default visible refresh is 60 seconds and on focus/return; the presentation option accepts 15-300 seconds. Failed refresh marks history stale and hides reveal actions. Session change clears displayed history and invalidates late reveals. Secret codes are not published into WCMS, email templates, analytics or an all-customer catalogue.\n\n## Cancellation, refunds and failure recovery\n\nOrder owns reviewed cancellation/refund orchestration; Payment owns original captured-value reversal; Digital Core/Promotion own entitlement/code revocation. Unused does not universally mean automatically refundable. Claimed/redeemed/mixed orders require review. The staged retained policy checks allowed request type and purchase-relative window before locking; absent retained refund policy requires manual review. General provider and seller-settlement qualification remain separate.\n\nPrepared units enter REFUND_PENDING with an original refund binding before value reversal. Completion requires saved matching revocation/reversal evidence. An exact bounded unit multiset is rechecked at preview, preparation and completion: missing/extra units or duplicate entitlement/code identities cannot produce success. Repeated order entries of one product are aggregated before comparison. An uncertain payment or partial owner write requires inspection under the same command, not a fresh refund. Purchase/refund EMAIL/SMS resources exist under Digital Core `src/templates`, with committed-evidence intent triggers wired to the owning purchase and refund boundaries. Recipient and privacy qualification remain independently gated. A resource file is not a sent notification; pending reversal must never send a completed-refund message.\n\n## Native Priced Basket And Merchant Confirmation\n\nThe native provider accepts `CART:<existing-cart-code>` before validation. It is explicitly PRICED_CART: evidence of an existing basket priced by activated Nodics Pricing, not external POS settlement or payment capture. ORDER handles reject because today's prices must not reprice a committed order. A custom external POS connector requires its own provider contract and approved operational records.\n\nCart owns buyer intent and quantities; Store owns the canonical outlet; Promotion owns the delivered/claimed purchased coupon; Pricing owns activated policy and exact line/subtotal arithmetic; Digital Core owns the current employee authorization and frozen native receipt. Pricing derives the buyer from the purchased coupon, checks issuer/outlet/Cart ownership and currency, then reads the complete bounded entry set. Client amounts, saved Cart totals and entry price fields are not authoritative prices. Ambiguous price precedence, partial reads, variants/quotes and missing activated roots reject. The adapter rereads coupon, Cart, entries, Store and published policy to detect drift before returning source evidence.\n\nService-only POST `/internal/merchant/priced-transaction` accepts exactly `couponCode`, `storeCode` and `sourceReference`. It requires the configured runtime permission and signed tenant/enterprise scope, operational owning modules and private capture. Promotion calls it through existing authenticated module transport with bounded HTTPS and no redirects or retry. Later layers may select another qualified provider; they cannot replace owner evidence with browser totals or permissive fallback pricing.\n\nThe merchant workspace exposes `pricedSourceRequired` and configured `pricedSourceLabel`. Axis collects the reference before POST `/merchant/redemptions/validate`, retains validationCode/expiry/revision and confirms with the same original reference. Validation compares current fixed/percentage/cap/ minimum terms and binds the exact benefit snapshot. Confirmation rereads current membership and pricing; changed basket/outlet/price/scope requires original-command review. An acknowledged receipt replay retains its original snapshot without repricing. Displayed monetary evidence never claims seller settlement or refund completion.\n\n## Committed Notifications And Recipient Authority\n\n![Circa committed-event, canonical-contact and delivery authority](media:nodicsDocsImage_e3ee17309744359228b0ac4a)\n\nSolid arrows show owning proof/delivery interactions; dashed arrows show fresh source reread and separately reviewed retry. Green identifies user/operator entry, blue Commerce financial authority, teal Profile contact authority and rose Communication. The yellow note marks unexecuted installation and acceptance gates. The [editable diagram source](../assets/diagrams/circa-notification-authority.dot) contains no customer records, sender credentials or fabricated delivery evidence.\n\nDigital Core freezes intent only from committed purchase/refund evidence. It asks Profile's private `/internal/commerce/notification-recipient` with channel plus exact event coordinates: kind, orderCode, sourceCode and orderRevision. No recipient address or arbitrary buyer ID is accepted. Profile asks Digital Core's private `/internal/notifications/recipient-source` to independently prove the current committed event and derive its stored buyer. Only then may the selected Profile verified-contact owner read verification, transactional consent and suppression. The financial source is reread after contact admission; drift fails without a new intent or financial write.\n\nCommunication owns template rendering, provider delivery, retained status and original retry semantics. Purchase is not marketing consent. Inspection and retry eligibility are separate operator outcomes; pending finance must never produce a completed-refund message. Approved recipients, sending grants, private capture, connection/TLS and contact-proof qualification remain mandatory. No email/SMS has been sent as part of source implementation or CMS documentation validation.\n\n## Customize and extend safely\n\nIn the custom backend, author products/variants/prices/promotion policies and localized copy in governed data releases, then publish Commerce. Select store, wallet reward type and approved fulfillment policy in focused configuration. A safe example adds offer exclusions and an explicit eligible outlet list while preserving code ownership, single-use CAS, current employee scope and reviewed purchase. Copy alone cannot implement a capped percentage benefit. New provider logic belongs with Promotion/Digital Commerce through the Nodics contribution process, not a Circa button or duplicate Kickoff checkout engine.\n\n## Common mistakes\n\nEquating catalogue validity with purchased expiry; refunding because a code looks unused; granting all group outlets implicitly; interpreting sample POINTS as AED; showing cached history as authorization; and treating a released known reservation as proof about an uncertain unit are incorrect. Preserve the original order/key.\n\n## Verification\n\nOperator/DevOps acceptance must inspect owner order/payment/entitlement/receipt references, not only the success screen. Cover stock exhaustion, fractional and aggregate quantity limits, insufficient wallet, changed price/revision, duplicate confirm, expiry, wrong owner/outlet, double redemption, interrupted persistence, refund window and retry. Visual acceptance covers details, terms, empty/stale history and desktop/mobile purchase review. Continue with [customization](/docs/framework/accelerators/circa/customization) and [deployment](/docs/framework/accelerators/circa/deployment-verification).\n\n## Original asset refund source boundary\n\nThe five quantity-one asset offers are not coupon units. Separate Local-only circaDigitalOwnershipPolicies carries the original refund term, full captured POINTS to the original current seller, no fees and no new carbon settlement. Genuine Waste listing and retained Digital binding must retain three policies before reservation. This pack installs no binding/event, grants no approval and qualifies no transport.\n\nOnly original Order-reviewed digital refund may reverse original seller earning, refund original buyer capture and restore ownership under Waste lock/CAS checks. It requires ORIGINAL_TRANSFER_REVERSAL_ONLY_BEFORE_ONWARD_TRANSFER in the unchanged original policies and no onward transfer. Older missing terms stay refused/manual-review-only; physical return/custody is not authorized. eWaste llm/contracts/digital-ownership-sale.md#original-sale-refund owns the details; the [catalogue reference](/docs/framework/accelerators/circa/catalogue-reference) names the project's policy choices.\n",
      "previous": {
        "title": "Circa Review, Assets, Rewards and Environmental Evidence",
        "route": "/docs/framework/accelerators/circa/operations"
      },
      "next": {
        "title": "Customize and Extend Circa Safely",
        "route": "/docs/framework/accelerators/circa/customization"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.accelerators",
        "technicalModule": "eWaste",
        "owner": "eWaste",
        "sourcePath": "data/docs-v001/records/documentation/eWasteDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/eWasteDocumentationComponentData.js",
        "wordCount": 2381,
        "checksum": "56adf110394cdd90cea8c9cd366ae2a00e83391b736fd69cff9535169706b32d"
      },
      "slug": "accelerators-circa-coupons-commerce",
      "locale": "en",
      "navigationGroup": "Circa eWaste Product",
      "navigationGroupCode": "circa-ewaste-product",
      "navigationGroupOrder": 20,
      "navigationOrder": 50,
      "references": [
        {
          "documentId": "accelerators.circa-data-network",
          "owner": "eWaste"
        },
        {
          "documentId": "accelerators.circa-customization",
          "owner": "eWaste"
        }
      ]
    },
    "active": true
  },
  "record10": {
    "code": "nodicsDocsComponentacceleratorsCircaCustomization",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "accelerators.circa-customization",
      "title": "Customize and Extend Circa Safely",
      "route": "/docs/framework/accelerators/circa/customization",
      "section": "accelerators-and-industry-solution-templates",
      "sectionTitle": "Accelerators and Industry Solution Templates",
      "group": "accelerators-and-industry-solution-templates",
      "groupTitle": "Accelerators and Industry Solution Templates",
      "parentId": "accelerators-and-industry-solution-templates",
      "hierarchyPath": [
        "Accelerators and Industry Solution Templates",
        "Customize and Extend Circa Safely"
      ],
      "hierarchyDepth": 2,
      "documentType": "customization",
      "audience": [
        "business",
        "architect",
        "administrator",
        "developer",
        "operator",
        "qa",
        "ai-tool"
      ],
      "businessAudience": [],
      "technicalAudience": [],
      "summary": "Worked project-layer configuration, focused services, governed data/content, EMAIL/SMS resources and preserved framework guarantees.",
      "visibility": "public",
      "accessMode": "PUBLIC",
      "publiclyAvailable": true,
      "requiresAuthentication": false,
      "allowedRoles": [],
      "allowedGroups": [],
      "allowedPermissions": [],
      "lifecycleState": "ONLINE",
      "version": "0.16.15",
      "maturityState": "partial",
      "implementationState": "current",
      "renderingComponent": "documentation.component.article",
      "relatedPages": [
        "accelerators.circa-overview",
        "accelerators.circa-deployment-verification"
      ],
      "sourceEvidence": [
        "../../../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "../../../../../nodics.foundation/modules/nSetup/llm/contracts/customer-project-mode-contract.md",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/AGENTS.md",
        "package.json",
        "src/service"
      ],
      "visualRequirements": [
        "table",
        "code-example"
      ],
      "searchKeywords": [
        "circa",
        "customization",
        "extends",
        "templates",
        "email",
        "sms",
        "project overlay"
      ],
      "topicKeywords": [
        "Circa",
        "Customization"
      ],
      "headings": [
        {
          "text": "Choose the owning layer",
          "anchor": "acceleratorsCircaCustomization-1-choose-the-owning-layer",
          "level": 2
        },
        {
          "text": "Project file layout",
          "anchor": "acceleratorsCircaCustomization-2-project-file-layout",
          "level": 2
        },
        {
          "text": "Worked presentation and arrival example",
          "anchor": "acceleratorsCircaCustomization-3-worked-presentation-and-arrival-example",
          "level": 2
        },
        {
          "text": "Focused service overrides and trusted mapping",
          "anchor": "acceleratorsCircaCustomization-4-focused-service-overrides-and-trusted-mapping",
          "level": 2
        },
        {
          "text": "Data and publication customization",
          "anchor": "acceleratorsCircaCustomization-5-data-and-publication-customization",
          "level": 2
        },
        {
          "text": "EMAIL/SMS customization",
          "anchor": "acceleratorsCircaCustomization-6-email-sms-customization",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "acceleratorsCircaCustomization-7-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "acceleratorsCircaCustomization-8-verification",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "image",
          "alt": "Customization, import and publication layers",
          "title": "Customization, import and publication layers",
          "mediaCode": "nodicsDocsImage_761e5c607da7b3952ab06884"
        },
        {
          "kind": "paragraph",
          "text": "This source-backed diagram explains ownership and boundaries; it is not live deployment or acceptance evidence. Qualification notes remain part of the flow."
        },
        {
          "kind": "paragraph",
          "text": "Circa demonstrates framework composition, not a fork that adopters must maintain. Beginners should first decide whether a change concerns presentation, deployment, reference policy or reusable lifecycle behavior. Business differentiation normally belongs in a customer-owned application overlay. Framework invariants remain with their owners, even when a customer first requests the enhancement."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Choose the owning layer",
          "anchor": "acceleratorsCircaCustomization-1-choose-the-owning-layer"
        },
        {
          "kind": "table",
          "headers": [
            "Desired change",
            "Custom project surface",
            "Preserve"
          ],
          "rows": [
            [
              "Brand, banners, page copy/detail order",
              "Project WCMS records and frontend presentation",
              "Published renderer contract and safe media delivery"
            ],
            [
              "App identity/channel selection",
              "Project config/adapters using eWaste/Profile",
              "Authenticated proof, tenant context, secret references"
            ],
            [
              "Centre or outlet allocation",
              "Profile/Location/Waste/Store owner records and governed data",
              "Explicit scopes and cross-domain references"
            ],
            [
              "Arrival distance policy",
              "Focused journey config and existing eWaste arrival adapter",
              "Fresh coordinates, current centre, direct distance"
            ],
            [
              "Acceptance/assessment policy",
              "Project reference overlay/provider selection",
              "Original evidence, limitations, provider history"
            ],
            [
              "Coupon terms/supply",
              "Commerce/Promotion records and published catalogue",
              "Price/stock ownership and code/entitlement authority"
            ],
            [
              "New reusable lifecycle mechanics",
              "Nodics-owned framework/domain contribution",
              "Layer ownership, generated persistence, contracts/tests"
            ],
            [
              "EMAIL/SMS look and feel",
              "Layered module template resources",
              "Parameter validation, escaping, frozen intent and source authority"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Do not edit dependency source as a partner customization. Reuse then extend through the existing module hierarchy; request reusable changes through Nodics review and release. A custom module does not rename the functional capability it extends. Technical-module identity and product branding are not permission authorities."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Project file layout",
          "anchor": "acceleratorsCircaCustomization-2-project-file-layout"
        },
        {
          "kind": "paragraph",
          "text": "Use the standard module shape, keeping only files that actually contribute a delta:"
        },
        {
          "kind": "code",
          "language": "text",
          "text": "modules/acme.circular/\n  package.json\n  config/properties.js\n  src/service/defaultAcmePresentationService.js\n  src/templates/email/<notification>/template.json\n  src/templates/email/<notification>/en/subject.txt\n  src/templates/email/<notification>/en/email.html\n  src/templates/email/<notification>/en/email.txt\n  data/<release>/headers/\n  data/<release>/records/\n  data/manifest.json\n  test/\n  README.md\n  AGENTS.md\n  llm/contracts/\n  llm/examples/"
        },
        {
          "kind": "paragraph",
          "text": "This is an illustrative customer layout, not a new generator or mandatory duplicate service. Define functional inheritance using the existing module metadata and actual runtime boot chain. Package dependency makes source available; it does not establish service precedence. Effective exported members are merged in load order. Verify the selected module/server index rather than assuming a sibling folder wins."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Worked presentation and arrival example",
          "anchor": "acceleratorsCircaCustomization-3-worked-presentation-and-arrival-example"
        },
        {
          "kind": "paragraph",
          "text": "When extending the Circa reference, a custom `config/properties.js` can export a small delta:"
        },
        {
          "kind": "code",
          "language": "js",
          "text": "'use strict';\n/** @module acme.circular/config/properties @description Custom brand and approved arrival policy. @layer config @owner acme.circular */\nmodule.exports = {\n    circaEWaste: {\n        presentation: { brandName: 'Acme Circular' },\n        journey: { arrivalRadiusMetres: 40 }\n    }\n};"
        },
        {
          "kind": "paragraph",
          "text": "The example changes presentation and narrows the reference 50-metre radius. It does not create a new enterprise, update saved locations, grant permissions or publish content. A deployment must approve the radius and validate the effective merged value. Keep sample/estimate labels accurate. For an independent eWaste adoption, use its domain configuration and your own app presentation namespace rather than introducing a dependency on Circa-branded services."
        },
        {
          "kind": "paragraph",
          "text": "Invalid policy, stale coordinates or an outside-radius request must still reject. Recovery preserves saved work and asks for a fresh reading; it must not retry with made-up coordinates. Test inherited defaults, the custom layer, exact boundary, wrong centre, permission loss and restoration. The UI cannot override this gate."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Focused service overrides and trusted mapping",
          "anchor": "acceleratorsCircaCustomization-4-focused-service-overrides-and-trusted-mapping"
        },
        {
          "kind": "paragraph",
          "text": "Services use exported loader-visible members with file/function JSDocs. Customize the smallest existing member rather than copy the complete framework service or hide behavior in a closed local helper. Circa's catalogue composition changes the existing eWaste marketplace list boundary; purchase and other methods remain inherited. Controller adapters reuse `DefaultEWasteRequestService` with server-owned selection. User payloads cannot select a service, transport, owner or tenant."
        },
        {
          "kind": "paragraph",
          "text": "Before an override, read the nearest README/AGENTS/contracts and related fixtures. Record owner, business outcome, data/security/runtime effects, intended files and validation route. Retain authorization, DENY precedence, revisions, idempotency, current resource scope and exact persistence evidence. An override that removes these checks is not supported customization, even if the happy path still works."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Data and publication customization",
          "anchor": "acceleratorsCircaCustomization-5-data-and-publication-customization"
        },
        {
          "kind": "paragraph",
          "text": "Add intentional data records/deltas to a customer release, preserving installed codes and history. Existing nImport source-key inheritance supplies reusable fields when configured; matching filename/key/header semantics matter. Do not rewrite retained release bytes or manually adjust hashes. A new centre needs approved Location/operator references; a new coupon needs Product, price, batch, policy, eligible outlet and published projection, not just an HTML card."
        },
        {
          "kind": "paragraph",
          "text": "Use Staged validation/review/publication for WCMS and Commerce separately. Source changes, installed data, Online projection and browser cache are different states. Rollback must consider owner receipts and dependent transactions; deleting a failed deployment's records can destroy history. Test missing baseline, wrong version, ambiguous references and interrupted import through governed owners."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "EMAIL/SMS customization",
          "anchor": "acceleratorsCircaCustomization-6-email-sms-customization"
        },
        {
          "kind": "paragraph",
          "text": "Default templates come from their framework module under `src/templates/email` or `src/templates/sms`. Customize locale HTML/text/subject resources through later module/runtime layers using the same template identity and metadata contract. Keep static look/content in resource files and dynamic values as declared bounded parameters. OTP is purpose-specific secure data, not a browser configuration value."
        },
        {
          "kind": "paragraph",
          "text": "Read the framework [EMAIL/SMS guide](/docs/framework/communication-email-sms-templates) before adding a notification. Preserve sourceModules, channel/purpose, required selection and parameter validation. Do not send raw coupon secrets or claim a refund completed before owner proof. Retry must retain the qualified original intent/template selection rather than rebuild from mutable current content. Merely adding an optional Digital Core template does not wire a lifecycle trigger."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "acceleratorsCircaCustomization-7-common-mistakes"
        },
        {
          "kind": "paragraph",
          "text": "Copying whole services, storing template bodies in properties, editing framework-owned documentation from a customer project, relaxing permission checks for a demo, introducing a second wallet or identity store, and putting reusable logic into Kickoff all increase upgrade risk. One custom app can reuse several functional modules without becoming their persistence authority."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "acceleratorsCircaCustomization-8-verification"
        },
        {
          "kind": "paragraph",
          "text": "Developers and AI tools must verify default plus later-layer behavior, not only the overlay. Operators inspect effective configuration and installed/published records. DevOps checks missing dependency/provider recovery and version compatibility. Documentation needs concrete rejected, boundary, failure/recovery and customized examples. Behavioral/visual acceptance remains separate from static CMS data validation. See [deployment and verification](/docs/framework/accelerators/circa/deployment-verification) for commands, evidence gates and operational ownership."
        }
      ],
      "searchText": "Customize and Extend Circa Safely Worked project-layer configuration, focused services, governed data/content, EMAIL/SMS resources and preserved framework guarantees. # Customize and Extend Circa Safely\n\n![Customization, import and publication layers](media:nodicsDocsImage_761e5c607da7b3952ab06884)\n\nThis source-backed diagram explains ownership and boundaries; it is not live deployment or acceptance evidence. Qualification notes remain part of the flow.\n\nCirca demonstrates framework composition, not a fork that adopters must maintain. Beginners should first decide whether a change concerns presentation, deployment, reference policy or reusable lifecycle behavior. Business differentiation normally belongs in a customer-owned application overlay. Framework invariants remain with their owners, even when a customer first requests the enhancement.\n\n## Choose the owning layer\n\n| Desired change | Custom project surface | Preserve |\n| --- | --- | --- |\n| Brand, banners, page copy/detail order | Project WCMS records and frontend presentation | Published renderer contract and safe media delivery |\n| App identity/channel selection | Project config/adapters using eWaste/Profile | Authenticated proof, tenant context, secret references |\n| Centre or outlet allocation | Profile/Location/Waste/Store owner records and governed data | Explicit scopes and cross-domain references |\n| Arrival distance policy | Focused journey config and existing eWaste arrival adapter | Fresh coordinates, current centre, direct distance |\n| Acceptance/assessment policy | Project reference overlay/provider selection | Original evidence, limitations, provider history |\n| Coupon terms/supply | Commerce/Promotion records and published catalogue | Price/stock ownership and code/entitlement authority |\n| New reusable lifecycle mechanics | Nodics-owned framework/domain contribution | Layer ownership, generated persistence, contracts/tests |\n| EMAIL/SMS look and feel | Layered module template resources | Parameter validation, escaping, frozen intent and source authority |\n\nDo not edit dependency source as a partner customization. Reuse then extend through the existing module hierarchy; request reusable changes through Nodics review and release. A custom module does not rename the functional capability it extends. Technical-module identity and product branding are not permission authorities.\n\n## Project file layout\n\nUse the standard module shape, keeping only files that actually contribute a delta:\n\n```text\nmodules/acme.circular/\n  package.json\n  config/properties.js\n  src/service/defaultAcmePresentationService.js\n  src/templates/email/<notification>/template.json\n  src/templates/email/<notification>/en/subject.txt\n  src/templates/email/<notification>/en/email.html\n  src/templates/email/<notification>/en/email.txt\n  data/<release>/headers/\n  data/<release>/records/\n  data/manifest.json\n  test/\n  README.md\n  AGENTS.md\n  llm/contracts/\n  llm/examples/\n```\n\nThis is an illustrative customer layout, not a new generator or mandatory duplicate service. Define functional inheritance using the existing module metadata and actual runtime boot chain. Package dependency makes source available; it does not establish service precedence. Effective exported members are merged in load order. Verify the selected module/server index rather than assuming a sibling folder wins.\n\n## Worked presentation and arrival example\n\nWhen extending the Circa reference, a custom `config/properties.js` can export a small delta:\n\n```js\n'use strict';\n/** @module acme.circular/config/properties @description Custom brand and approved arrival policy. @layer config @owner acme.circular */\nmodule.exports = {\n    circaEWaste: {\n        presentation: { brandName: 'Acme Circular' },\n        journey: { arrivalRadiusMetres: 40 }\n    }\n};\n```\n\nThe example changes presentation and narrows the reference 50-metre radius. It does not create a new enterprise, update saved locations, grant permissions or publish content. A deployment must approve the radius and validate the effective merged value. Keep sample/estimate labels accurate. For an independent eWaste adoption, use its domain configuration and your own app presentation namespace rather than introducing a dependency on Circa-branded services.\n\nInvalid policy, stale coordinates or an outside-radius request must still reject. Recovery preserves saved work and asks for a fresh reading; it must not retry with made-up coordinates. Test inherited defaults, the custom layer, exact boundary, wrong centre, permission loss and restoration. The UI cannot override this gate.\n\n## Focused service overrides and trusted mapping\n\nServices use exported loader-visible members with file/function JSDocs. Customize the smallest existing member rather than copy the complete framework service or hide behavior in a closed local helper. Circa's catalogue composition changes the existing eWaste marketplace list boundary; purchase and other methods remain inherited. Controller adapters reuse `DefaultEWasteRequestService` with server-owned selection. User payloads cannot select a service, transport, owner or tenant.\n\nBefore an override, read the nearest README/AGENTS/contracts and related fixtures. Record owner, business outcome, data/security/runtime effects, intended files and validation route. Retain authorization, DENY precedence, revisions, idempotency, current resource scope and exact persistence evidence. An override that removes these checks is not supported customization, even if the happy path still works.\n\n## Data and publication customization\n\nAdd intentional data records/deltas to a customer release, preserving installed codes and history. Existing nImport source-key inheritance supplies reusable fields when configured; matching filename/key/header semantics matter. Do not rewrite retained release bytes or manually adjust hashes. A new centre needs approved Location/operator references; a new coupon needs Product, price, batch, policy, eligible outlet and published projection, not just an HTML card.\n\nUse Staged validation/review/publication for WCMS and Commerce separately. Source changes, installed data, Online projection and browser cache are different states. Rollback must consider owner receipts and dependent transactions; deleting a failed deployment's records can destroy history. Test missing baseline, wrong version, ambiguous references and interrupted import through governed owners.\n\n## EMAIL/SMS customization\n\nDefault templates come from their framework module under `src/templates/email` or `src/templates/sms`. Customize locale HTML/text/subject resources through later module/runtime layers using the same template identity and metadata contract. Keep static look/content in resource files and dynamic values as declared bounded parameters. OTP is purpose-specific secure data, not a browser configuration value.\n\nRead the framework [EMAIL/SMS guide](/docs/framework/communication-email-sms-templates) before adding a notification. Preserve sourceModules, channel/purpose, required selection and parameter validation. Do not send raw coupon secrets or claim a refund completed before owner proof. Retry must retain the qualified original intent/template selection rather than rebuild from mutable current content. Merely adding an optional Digital Core template does not wire a lifecycle trigger.\n\n## Common mistakes\n\nCopying whole services, storing template bodies in properties, editing framework-owned documentation from a customer project, relaxing permission checks for a demo, introducing a second wallet or identity store, and putting reusable logic into Kickoff all increase upgrade risk. One custom app can reuse several functional modules without becoming their persistence authority.\n\n## Verification\n\nDevelopers and AI tools must verify default plus later-layer behavior, not only the overlay. Operators inspect effective configuration and installed/published records. DevOps checks missing dependency/provider recovery and version compatibility. Documentation needs concrete rejected, boundary, failure/recovery and customized examples. Behavioral/visual acceptance remains separate from static CMS data validation. See [deployment and verification](/docs/framework/accelerators/circa/deployment-verification) for commands, evidence gates and operational ownership.\n",
      "previous": {
        "title": "Circa Shop, Coupon Purchase and Redemption",
        "route": "/docs/framework/accelerators/circa/coupons-commerce"
      },
      "next": {
        "title": "Circa Deployment, Operations and Verification",
        "route": "/docs/framework/accelerators/circa/deployment-verification"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.accelerators",
        "technicalModule": "eWaste",
        "owner": "eWaste",
        "sourcePath": "data/docs-v001/records/documentation/eWasteDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/eWasteDocumentationComponentData.js",
        "wordCount": 1040,
        "checksum": "4125940d9f9edfece89a12e1ad5211ab08c0c77e46f2702796d7cf417f02522c"
      },
      "slug": "accelerators-circa-customization",
      "locale": "en",
      "navigationGroup": "Circa eWaste Product",
      "navigationGroupCode": "circa-ewaste-product",
      "navigationGroupOrder": 20,
      "navigationOrder": 60,
      "references": [
        {
          "documentId": "accelerators.circa-overview",
          "owner": "eWaste"
        },
        {
          "documentId": "accelerators.circa-deployment-verification",
          "owner": "eWaste"
        }
      ]
    },
    "active": true
  },
  "record11": {
    "code": "nodicsDocsComponentacceleratorsCircaDeploymentVerification",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "accelerators.circa-deployment-verification",
      "title": "Circa Deployment, Operations and Verification",
      "route": "/docs/framework/accelerators/circa/deployment-verification",
      "section": "accelerators-and-industry-solution-templates",
      "sectionTitle": "Accelerators and Industry Solution Templates",
      "group": "accelerators-and-industry-solution-templates",
      "groupTitle": "Accelerators and Industry Solution Templates",
      "parentId": "accelerators-and-industry-solution-templates",
      "hierarchyPath": [
        "Accelerators and Industry Solution Templates",
        "Circa Deployment, Operations and Verification"
      ],
      "hierarchyDepth": 2,
      "documentType": "operations",
      "audience": [
        "business",
        "architect",
        "administrator",
        "developer",
        "operator",
        "qa",
        "ai-tool"
      ],
      "businessAudience": [],
      "technicalAudience": [],
      "summary": "Runtime/data/publication gates, development commands, joint acceptance matrix, troubleshooting and safe deployment recovery.",
      "visibility": "public",
      "accessMode": "PUBLIC",
      "publiclyAvailable": true,
      "requiresAuthentication": false,
      "allowedRoles": [],
      "allowedGroups": [],
      "allowedPermissions": [],
      "lifecycleState": "ONLINE",
      "version": "0.16.15",
      "maturityState": "partial",
      "implementationState": "current",
      "renderingComponent": "documentation.component.article",
      "relatedPages": [
        "accelerators.circa-overview",
        "accelerators.circa-customization"
      ],
      "sourceEvidence": [
        "../../../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "data/docs-v001/records/documentation/circaDocumentationComponentData.js",
        "../../../../../../nodics.exp/nodics.circa.eWaste/package.json",
        "package.json",
        "src/service"
      ],
      "visualRequirements": [
        "table",
        "command-example"
      ],
      "searchKeywords": [
        "circa",
        "deployment",
        "runtime",
        "publication",
        "testing",
        "recovery",
        "devops"
      ],
      "topicKeywords": [
        "Circa",
        "Deployment and verification"
      ],
      "headings": [
        {
          "text": "Runtime topology and prerequisites",
          "anchor": "acceleratorsCircaDeploymentVerification-1-runtime-topology-and-prerequisites",
          "level": 2
        },
        {
          "text": "Prepare data and publish separately",
          "anchor": "acceleratorsCircaDeploymentVerification-2-prepare-data-and-publish-separately",
          "level": 2
        },
        {
          "text": "Development commands and test boundaries",
          "anchor": "acceleratorsCircaDeploymentVerification-3-development-commands-and-test-boundaries",
          "level": 2
        },
        {
          "text": "Joint acceptance matrix",
          "anchor": "acceleratorsCircaDeploymentVerification-4-joint-acceptance-matrix",
          "level": 2
        },
        {
          "text": "Troubleshooting and recovery",
          "anchor": "acceleratorsCircaDeploymentVerification-5-troubleshooting-and-recovery",
          "level": 2
        },
        {
          "text": "Customize and extend safely",
          "anchor": "acceleratorsCircaDeploymentVerification-6-customize-and-extend-safely",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "acceleratorsCircaDeploymentVerification-7-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "acceleratorsCircaDeploymentVerification-8-verification",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Circa is a multi-owner product experience. Beginners should distinguish backend readiness, imported reference data, published content/catalogue and frontend health. A running Vite server proves none of the first three. The business objective of deployment verification is an understandable, recoverable programme whose customer and operator journeys agree with saved owner evidence."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Runtime topology and prerequisites",
          "anchor": "acceleratorsCircaDeploymentVerification-1-runtime-topology-and-prerequisites"
        },
        {
          "kind": "paragraph",
          "text": "The reference uses runtime authorities for Platform/Profile, Waste, Location, Media, Loyalty, Commerce Staged/Commerce, WCMS Staged/Online and Engagement/Communication, with Process for governed review/publication where required. Follow the chosen project's runtime descriptors and launch commands; these are deployment-specific, not a permanent list of universal ports. Backend readiness must work without a frontend checkout/server. Frontend startup and unavailable/retry UI remain frontend responsibilities."
        },
        {
          "kind": "paragraph",
          "text": "The current Circa frontend package uses React, TypeScript and Vite, with Location map UI and Leaflet/Mapbox dependencies. Its checked-in package and lockfile define exact supported dependencies; do not substitute remembered newest versions. Provider credentials are governed secret references. Browser endpoint/CORS settings, runtime role authority and application/channel bindings must be checked in their existing owners rather than copied into a second endpoint or authentication registry."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Prepare data and publish separately",
          "anchor": "acceleratorsCircaDeploymentVerification-2-prepare-data-and-publish-separately"
        },
        {
          "kind": "table",
          "headers": [
            "Gate",
            "Expected evidence",
            "Not sufficient"
          ],
          "rows": [
            [
              "Framework/schema readiness",
              "Owner runtimes ready and compatible schema/config",
              "Frontend renders a home shell"
            ],
            [
              "Reference preparation",
              "Selected release receipt, version/checksum and policy",
              "Files exist on disk"
            ],
            [
              "Operational allocation",
              "Approved enterprises, employees and centre/store scopes",
              "Shared admin credentials"
            ],
            [
              "WCMS publication",
              "Approved Online route/page/template/renderer references",
              "Staged page exists"
            ],
            [
              "Commerce publication",
              "Active published product/price/inventory/promotion projection",
              "Website publication succeeded"
            ],
            [
              "Transaction acceptance",
              "Order/payment/asset/entitlement/ledger references",
              "Browser success message"
            ],
            [
              "Notification delivery",
              "Qualified source intent and delivery evidence",
              "HTML/SMS resource exists"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "The Circa setup profile prepares maps/Waste policy, local sample profiles/operator access, collection centres, reward programme, Commerce Staged catalogue and website. Local sample sections are explicitly scoped. Never use setup replay to refresh transactional ownership/opening ledgers in an established installation. Inspect owner inventory and receipts first. Sample data is not production partner approval."
        },
        {
          "kind": "paragraph",
          "text": "For account composition, the `circa.ewaste:customer-workspace` release contributes WCMS `/account/waste` and `circa.wasteWorkspace`; install into Staged and publish through the normal approved route. Do not import old transaction samples merely because a new customer workspace page is required."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Development commands and test boundaries",
          "anchor": "acceleratorsCircaDeploymentVerification-3-development-commands-and-test-boundaries"
        },
        {
          "kind": "paragraph",
          "text": "Developers should use the checked-in lockfile and owner test entry points. Keep API mocks separate from connected acceptance, and record any provider/runtime assumption a fixture substitutes. A successful mocked interaction does not prove the installed owner's authorization, persistence acknowledgement or recovery."
        },
        {
          "kind": "paragraph",
          "text": "From the frontend checkout:"
        },
        {
          "kind": "code",
          "language": "bash",
          "text": "npm ci\nnpm run typecheck\nnpm run build\nnpm run dev -- --host 127.0.0.1 --port 3600"
        },
        {
          "kind": "paragraph",
          "text": "These are documented operator commands, not automatic runtime permission. Installation and builds can change local artifacts; use the approved project workflow. If the port is occupied, choose an available one and align browser configuration. The frontend's `npm run verify` includes behavioral tests/build; do not run it during a static-only work phase. Docker deployment guidance stays with the frontend's `docker/README.md`; do not move its lifecycle into backend properties."
        },
        {
          "kind": "paragraph",
          "text": "Backend adapters use module `npm test` under `circa.ewaste`. Frontend mocked behavior uses `npm run test`; connected browser scripts include `test/live/catalogue-browsing.mjs`, `customer-workspace.mjs`, `customer-journey.mjs` and `reviewed-descriptor.mjs`. Read each script's fixture and mutation requirements first. Catalogue browsing is designed to cancel purchase review; a complete customer journey can write real local records. Physical device, native Telegram and real provider delivery acceptance remain separate."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Joint acceptance matrix",
          "anchor": "acceleratorsCircaDeploymentVerification-4-joint-acceptance-matrix"
        },
        {
          "kind": "paragraph",
          "text": "Cover successful, unauthorized, boundary, interrupted and custom-layer behavior: registration and session switch; absent/stale location; centre browsing versus arrival; exact/outside radius; analysis failure/cancellation/replacement; persisted drafts; confirmation retry; wrong-owner item/media; staff scope and verified overlays; approval/rejection; partial assessment; original reward evidence; settlement retry; catalogue publication/filter totals; changed price; insufficient wallet; quantity limits; partial/uncertain coupon reservation; duplicate sale/redemption; expiry; wrong outlet; refund policy and original payment reversal; notification retry."
        },
        {
          "kind": "paragraph",
          "text": "Visual acceptance covers desktop/mobile/navigation, long localized text, keyboard and touch, loading/empty/stale/error states, private-photo delivery, quick view/detail return, saved draft resume, purchase terms and token clearing after session change. Use sanitized screenshots with runtime/version context. A screenshot cannot prove permission enforcement, physical custody or an external provider's calculation."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Troubleshooting and recovery",
          "anchor": "acceleratorsCircaDeploymentVerification-5-troubleshooting-and-recovery"
        },
        {
          "kind": "table",
          "headers": [
            "Symptom",
            "Inspect first",
            "Safe recovery boundary"
          ],
          "rows": [
            [
              "Empty Shop despite source products",
              "Store, published catalogue/price/inventory and kind",
              "Correct/review Staged projection; do not add browser fixtures as real data"
            ],
            [
              "Centre distance appears wrong",
              "Canonical/runtime location plus reported coordinates",
              "Approved Location correction, then fresh arrival check"
            ],
            [
              "Preparation fails",
              "Photo/provider/assessment contract and retained draft",
              "Retry analysis without creating empty duplicates"
            ],
            [
              "Approved item lacks rewards",
              "Saved decision and Loyalty settlement reference",
              "Qualified settlement recovery, not reapproval"
            ],
            [
              "Purchase response uncertain",
              "Checkout/order/payment and reservation checkpoint",
              "Owner inspection under original key, not a new purchase"
            ],
            [
              "Coupon history stale",
              "Authorized read and current customer session",
              "Read-only refresh; clear revealed token"
            ],
            [
              "Refund or message incomplete",
              "Original refund/intent, payment and delivery evidence",
              "Qualified recovery; no fabricated completion"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Log correlation/command identifiers and revisions without exposing passwords, bearers, OTPs, coupon tokens, private photos or unnecessary personal data. Unknown provenance, conflicting writes and incomplete invalidation should stop success. Backups and restore need cross-owner receipt/ledger consistency; no universal Circa rollback API is implied. Use the existing runtime release/rollback process."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customize and extend safely",
          "anchor": "acceleratorsCircaDeploymentVerification-6-customize-and-extend-safely"
        },
        {
          "kind": "paragraph",
          "text": "Deployments select actual endpoint/provider/channel differences in project/runtime layers. A minimal example changes the frontend port and its approved public endpoint while leaving backend launch ownership independent. Test unavailable backend startup, CORS/session behavior and correct retry UI. Do not embed backend start commands into frontend tests as a framework readiness dependency or copy secrets into example data. Use [customization](/docs/framework/accelerators/circa/customization) before changing functional defaults."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "acceleratorsCircaDeploymentVerification-7-common-mistakes"
        },
        {
          "kind": "paragraph",
          "text": "Calling source-written code accepted; running a mutating browser script against a non-disposable environment; merging after static checks alone; confusing docs catalogue ONLINE metadata with published runtime evidence; and treating production integration requirements as merely test gaps all obscure release risk."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "acceleratorsCircaDeploymentVerification-8-verification"
        },
        {
          "kind": "paragraph",
          "text": "Documentation checks are `npm run docs:check` and `npm run validate` in `nodics.docs`, with framework principle/context and scoped whitespace checks. They do not import or publish this guide. Record CMS source changes, release validation, rendered behavior, import/publication and live acceptance separately. The ongoing enterprise/coupon batch still has source gaps in delegation, complete administrator safeguards, commercial authority, rich benefit validation and trusted notification wiring. Complete those before declaring the whole product qualified. Release/merge/push requires the separately approved acceptance and Git process."
        }
      ],
      "searchText": "Circa Deployment, Operations and Verification Runtime/data/publication gates, development commands, joint acceptance matrix, troubleshooting and safe deployment recovery. # Circa Deployment, Operations and Verification\n\nCirca is a multi-owner product experience. Beginners should distinguish backend readiness, imported reference data, published content/catalogue and frontend health. A running Vite server proves none of the first three. The business objective of deployment verification is an understandable, recoverable programme whose customer and operator journeys agree with saved owner evidence.\n\n## Runtime topology and prerequisites\n\nThe reference uses runtime authorities for Platform/Profile, Waste, Location, Media, Loyalty, Commerce Staged/Commerce, WCMS Staged/Online and Engagement/Communication, with Process for governed review/publication where required. Follow the chosen project's runtime descriptors and launch commands; these are deployment-specific, not a permanent list of universal ports. Backend readiness must work without a frontend checkout/server. Frontend startup and unavailable/retry UI remain frontend responsibilities.\n\nThe current Circa frontend package uses React, TypeScript and Vite, with Location map UI and Leaflet/Mapbox dependencies. Its checked-in package and lockfile define exact supported dependencies; do not substitute remembered newest versions. Provider credentials are governed secret references. Browser endpoint/CORS settings, runtime role authority and application/channel bindings must be checked in their existing owners rather than copied into a second endpoint or authentication registry.\n\n## Prepare data and publish separately\n\n| Gate | Expected evidence | Not sufficient |\n| --- | --- | --- |\n| Framework/schema readiness | Owner runtimes ready and compatible schema/config | Frontend renders a home shell |\n| Reference preparation | Selected release receipt, version/checksum and policy | Files exist on disk |\n| Operational allocation | Approved enterprises, employees and centre/store scopes | Shared admin credentials |\n| WCMS publication | Approved Online route/page/template/renderer references | Staged page exists |\n| Commerce publication | Active published product/price/inventory/promotion projection | Website publication succeeded |\n| Transaction acceptance | Order/payment/asset/entitlement/ledger references | Browser success message |\n| Notification delivery | Qualified source intent and delivery evidence | HTML/SMS resource exists |\n\nThe Circa setup profile prepares maps/Waste policy, local sample profiles/operator access, collection centres, reward programme, Commerce Staged catalogue and website. Local sample sections are explicitly scoped. Never use setup replay to refresh transactional ownership/opening ledgers in an established installation. Inspect owner inventory and receipts first. Sample data is not production partner approval.\n\nFor account composition, the `circa.ewaste:customer-workspace` release contributes WCMS `/account/waste` and `circa.wasteWorkspace`; install into Staged and publish through the normal approved route. Do not import old transaction samples merely because a new customer workspace page is required.\n\n## Development commands and test boundaries\n\nDevelopers should use the checked-in lockfile and owner test entry points. Keep API mocks separate from connected acceptance, and record any provider/runtime assumption a fixture substitutes. A successful mocked interaction does not prove the installed owner's authorization, persistence acknowledgement or recovery.\n\nFrom the frontend checkout:\n\n```bash\nnpm ci\nnpm run typecheck\nnpm run build\nnpm run dev -- --host 127.0.0.1 --port 3600\n```\n\nThese are documented operator commands, not automatic runtime permission. Installation and builds can change local artifacts; use the approved project workflow. If the port is occupied, choose an available one and align browser configuration. The frontend's `npm run verify` includes behavioral tests/build; do not run it during a static-only work phase. Docker deployment guidance stays with the frontend's `docker/README.md`; do not move its lifecycle into backend properties.\n\nBackend adapters use module `npm test` under `circa.ewaste`. Frontend mocked behavior uses `npm run test`; connected browser scripts include `test/live/catalogue-browsing.mjs`, `customer-workspace.mjs`, `customer-journey.mjs` and `reviewed-descriptor.mjs`. Read each script's fixture and mutation requirements first. Catalogue browsing is designed to cancel purchase review; a complete customer journey can write real local records. Physical device, native Telegram and real provider delivery acceptance remain separate.\n\n## Joint acceptance matrix\n\nCover successful, unauthorized, boundary, interrupted and custom-layer behavior: registration and session switch; absent/stale location; centre browsing versus arrival; exact/outside radius; analysis failure/cancellation/replacement; persisted drafts; confirmation retry; wrong-owner item/media; staff scope and verified overlays; approval/rejection; partial assessment; original reward evidence; settlement retry; catalogue publication/filter totals; changed price; insufficient wallet; quantity limits; partial/uncertain coupon reservation; duplicate sale/redemption; expiry; wrong outlet; refund policy and original payment reversal; notification retry.\n\nVisual acceptance covers desktop/mobile/navigation, long localized text, keyboard and touch, loading/empty/stale/error states, private-photo delivery, quick view/detail return, saved draft resume, purchase terms and token clearing after session change. Use sanitized screenshots with runtime/version context. A screenshot cannot prove permission enforcement, physical custody or an external provider's calculation.\n\n## Troubleshooting and recovery\n\n| Symptom | Inspect first | Safe recovery boundary |\n| --- | --- | --- |\n| Empty Shop despite source products | Store, published catalogue/price/inventory and kind | Correct/review Staged projection; do not add browser fixtures as real data |\n| Centre distance appears wrong | Canonical/runtime location plus reported coordinates | Approved Location correction, then fresh arrival check |\n| Preparation fails | Photo/provider/assessment contract and retained draft | Retry analysis without creating empty duplicates |\n| Approved item lacks rewards | Saved decision and Loyalty settlement reference | Qualified settlement recovery, not reapproval |\n| Purchase response uncertain | Checkout/order/payment and reservation checkpoint | Owner inspection under original key, not a new purchase |\n| Coupon history stale | Authorized read and current customer session | Read-only refresh; clear revealed token |\n| Refund or message incomplete | Original refund/intent, payment and delivery evidence | Qualified recovery; no fabricated completion |\n\nLog correlation/command identifiers and revisions without exposing passwords, bearers, OTPs, coupon tokens, private photos or unnecessary personal data. Unknown provenance, conflicting writes and incomplete invalidation should stop success. Backups and restore need cross-owner receipt/ledger consistency; no universal Circa rollback API is implied. Use the existing runtime release/rollback process.\n\n## Customize and extend safely\n\nDeployments select actual endpoint/provider/channel differences in project/runtime layers. A minimal example changes the frontend port and its approved public endpoint while leaving backend launch ownership independent. Test unavailable backend startup, CORS/session behavior and correct retry UI. Do not embed backend start commands into frontend tests as a framework readiness dependency or copy secrets into example data. Use [customization](/docs/framework/accelerators/circa/customization) before changing functional defaults.\n\n## Common mistakes\n\nCalling source-written code accepted; running a mutating browser script against a non-disposable environment; merging after static checks alone; confusing docs catalogue ONLINE metadata with published runtime evidence; and treating production integration requirements as merely test gaps all obscure release risk.\n\n## Verification\n\nDocumentation checks are `npm run docs:check` and `npm run validate` in `nodics.docs`, with framework principle/context and scoped whitespace checks. They do not import or publish this guide. Record CMS source changes, release validation, rendered behavior, import/publication and live acceptance separately. The ongoing enterprise/coupon batch still has source gaps in delegation, complete administrator safeguards, commercial authority, rich benefit validation and trusted notification wiring. Complete those before declaring the whole product qualified. Release/merge/push requires the separately approved acceptance and Git process.\n",
      "previous": {
        "title": "Customize and Extend Circa Safely",
        "route": "/docs/framework/accelerators/circa/customization"
      },
      "next": {
        "title": "Nodics Documentation",
        "route": "/docs"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.accelerators",
        "technicalModule": "eWaste",
        "owner": "eWaste",
        "sourcePath": "data/docs-v001/records/documentation/eWasteDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/eWasteDocumentationComponentData.js",
        "wordCount": 1095,
        "checksum": "34f44877c8cc3aaae17274c3553270ed819384bada65d4d9a91239b4d1b51947"
      },
      "slug": "accelerators-circa-deployment-verification",
      "locale": "en",
      "navigationGroup": "Circa eWaste Product",
      "navigationGroupCode": "circa-ewaste-product",
      "navigationGroupOrder": 20,
      "navigationOrder": 70,
      "references": [
        {
          "documentId": "accelerators.circa-overview",
          "owner": "eWaste"
        },
        {
          "documentId": "accelerators.circa-customization",
          "owner": "eWaste"
        }
      ]
    },
    "active": true
  }
};
