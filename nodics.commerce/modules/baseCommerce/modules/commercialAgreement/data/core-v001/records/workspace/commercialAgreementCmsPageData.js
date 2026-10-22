/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module commercialAgreement/data/workspace/commercialAgreementCmsPageData @description Owner-managed CMS presentation, never agreement or access authority. @layer data @owner commercialAgreement */
module.exports = {
    "record0": {
        "functionalModule": "nodics.commerce",
        "active": true,
        "code": "commercialAgreementWorkspacePage",
        "name": "Commercial agreements",
        "cmsSite": [
            "axisCmsSite"
        ],
        "typeCode": "axisSchemaWorkbenchPageType",
        "template": "axisSchemaWorkbenchPageTemplate",
        "renderer": "axis.page.schema-workbench",
        "accessMode": "AUTHENTICATED",
        "authoringScope": {
            "enterpriseCode": "default",
            "catalogCode": "axisContentCatalog",
            "siteCode": "axisCmsSite"
        },
        "cmsComponents": [
            {
                "target": "commercialAgreementWorkspaceCopy",
                "slot": "header",
                "index": 10,
                "active": true,
                "authoringScope": {
                    "enterpriseCode": "default",
                    "catalogCode": "axisContentCatalog",
                    "siteCode": "axisCmsSite"
                }
            }
        ]
    }
};
