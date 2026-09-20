/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module nexusCore/config/properties @description Owns inert Nexus initialization and acceptance descriptors. @layer config @owner nexusCore @override Customer modules may override application or deployment choices. */
module.exports = {
  "backofficeApplicationInitialization": {
    "profiles": {
      "nexus": {
        "code": "nexus",
        "type": "WEBSITE_BUNDLE",
        "owner": "nexus.web",
        "applicationCode": "nexus",
        "siteCode": "nexusCorporateSite",
        "baselineCode": "nexus",
        "presentation": {
          "title": "Nexus Corporate",
          "kind": "PROJECT",
          "category": "accelerator",
          "order": 100,
          "activationPolicy": {
            "approvalRequiredForOnline": true,
            "requiredDataTrigger": "ACTIVATION",
            "sampleDataTrigger": "USER"
          }
        },
        "dataPackages": {
          "$config": "replace",
          "value": [
            {
              "code": "nexus.web:nexusCorporateSite",
              "kind": "Corporate site content",
              "required": true,
              "trigger": "ACTIVATION",
              "dataType": "sample",
              "targetServer": "wcmsStaged",
              "targetRuntimeRole": "WCMS_STAGED"
            },
            {
              "code": "nexus.web:nexusCorporateMediaReferences",
              "kind": "Corporate media references",
              "required": true,
              "trigger": "ACTIVATION",
              "dataType": "sample",
              "targetServer": "wcmsStaged",
              "targetRuntimeRole": "WCMS_STAGED"
            },
            {
              "code": "nexus.web:nexusEditorialSource",
              "kind": "News and blog source",
              "required": true,
              "trigger": "ACTIVATION",
              "dataType": "sample",
              "targetServer": "wcmsStaged",
              "targetRuntimeRole": "WCMS_STAGED"
            },
            {
              "code": "nexus.web:nexusCorporateMediaAssets",
              "type": "MEDIA_ASSET_MANIFEST",
              "kind": "Corporate media files",
              "required": true,
              "trigger": "ACTIVATION",
              "targetServer": "wcmsStaged",
              "targetRuntimeRole": "WCMS_STAGED",
              "manifestPath": "data/sample-v001/content/assets/nexus-cms-media/assetManifest.js",
              "businessPurpose": "NEXUS_CORPORATE_CONTENT",
              "manifestModule": "nexus.web"
            },
            {
              "code": "nexus.web:nexusEngagementOperational",
              "kind": "Contact and testimonial experience",
              "required": true,
              "trigger": "ACTIVATION",
              "dataType": "sample",
              "targetServer": "engagementServer",
              "targetRuntimeRole": "ENGAGEMENT"
            }
          ]
        }
      },
      "nexusupdate": {
        "code": "nexusupdate",
        "type": "WEBSITE_BUNDLE_UPDATE",
        "owner": "nexus.web",
        "applicationCode": "nexus",
        "siteCode": "nexusCorporateSite",
        "baselineCode": "nexusupdate",
        "presentation": {
          "visible": false
        }
      },
      "nexusecosystemrepair": {
        "code": "nexusecosystemrepair",
        "type": "WEBSITE_BUNDLE_UPDATE",
        "owner": "nexus.web",
        "applicationCode": "nexus",
        "siteCode": "nexusCorporateSite",
        "baselineCode": "nexusecosystemrepair",
        "presentation": {
          "visible": false
        }
      }
    }
  },
  tooling: {
    acceptance: {
      "guidedInitialization": {
        "publicationProfiles": [
          "nexus",
          "nexusupdate",
          "nexusecosystemrepair"
        ],
        "deliveryProbe": {
          "site": "nexusCorporateSite",
          "path": "/",
          "locale": "en",
          "channel": "web"
        }
      }
    }
  }
};
