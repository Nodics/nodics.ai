/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module commercialAgreement/data/workspace/commercialAgreementCmsRouteData @description Owner-managed CMS presentation, never agreement or access authority. @layer data @owner commercialAgreement */
module.exports = {
    "record0": {
        "functionalModule": "nodics.commerce",
        "active": true,
        "code": "commercialAgreementWorkspaceRoute",
        "site": "axisCmsSite",
        "path": "/commerce/agreements",
        "locale": "en",
        "channel": "web",
        "page": "commercialAgreementWorkspacePage",
        "routeType": "PAGE",
        "deliveryState": "ONLINE",
        "accessMode": "AUTHENTICATED",
        "authoringScope": {
            "enterpriseCode": "default",
            "catalogCode": "axisContentCatalog",
            "siteCode": "axisCmsSite"
        }
    }
};
