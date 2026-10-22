/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module commercialAgreement/data/workspace/header @description Explicit CMS-owned import targets for Commercial Agreement presentation only. @layer data @owner commercialAgreement */
module.exports = {
    "cms": {
        "commercialAgreementCmsTypeData": {
            "options": {
                "enabled": true,
                "schemaName": "cmsTypeCode",
                "operation": "saveAll",
                "dataFilePrefix": "commercialAgreementCmsTypeData"
            },
            "query": {
                "code": "$code"
            }
        },
        "commercialAgreementCmsRendererData": {
            "options": {
                "enabled": true,
                "schemaName": "cmsTypeCode2Renderer",
                "operation": "saveAll",
                "dataFilePrefix": "commercialAgreementCmsRendererData"
            },
            "query": {
                "code": "$code"
            }
        },
        "commercialAgreementCmsComponentData": {
            "options": {
                "enabled": true,
                "schemaName": "cmsComponent",
                "operation": "saveAll",
                "dataFilePrefix": "commercialAgreementCmsComponentData"
            },
            "query": {
                "code": "$code"
            }
        },
        "commercialAgreementCmsPageData": {
            "options": {
                "enabled": true,
                "schemaName": "cmsPage",
                "operation": "saveAll",
                "dataFilePrefix": "commercialAgreementCmsPageData"
            },
            "query": {
                "code": "$code"
            }
        },
        "commercialAgreementCmsRouteData": {
            "options": {
                "enabled": true,
                "schemaName": "cmsPageRoute",
                "operation": "saveAll",
                "dataFilePrefix": "commercialAgreementCmsRouteData"
            },
            "query": {
                "code": "$code"
            }
        }
    }
};
