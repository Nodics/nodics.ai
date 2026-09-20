/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module modules/nexus.web/data/sample-v001/content/records/wcmsUpdate/corporate/nexusIncrementalProofData
 * @description Defines a small Nexus CMS text delta for Axis navigation incremental-update qualification.
 * @layer data
 * @owner nexus.web
 * @override Customer projects may extend or replace this artifact in their own project layer.
 */

/** @lifecycle PUBLISHABLE @destination WCMS_STAGED @owner nexus.web */

/** @description Nexus corporate CMS v1.0.3 incremental proof for source-to-Axis-to-Nexus validation. */
module.exports = {
    record0: {
        code: 'nexusMicroservicesBanner',
        typeCode: 'nexusBannerSlideType',
        accessMode: 'PUBLIC',
        active: true,
        properties: {
            kicker: 'Microservices architecture',
            heading: 'Enterprise capabilities that evolve independently.',
            subheading: 'Compose focused services through governed APIs, explicit ownership and observable runtime contracts. Incremental proof 2026-08-21.',
            primaryActionLabel: 'Explore Nodics',
            primaryActionHref: '/features',
            secondaryActionLabel: 'Read documentation',
            secondaryActionHref: '/docs'
        }
    }
};
