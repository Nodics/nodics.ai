/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module modules/nexus.web/data/sample-v001/content/records/wcmsUpdate/corporate/nexusProfessionalCopyUpdateData
 * @description Defines the Nexus CMS professional copy update used for governed incremental-publication qualification.
 * @layer data
 * @owner nexus.web
 * @override Customer projects may extend or replace this artifact in their own project layer.
 */

/** @lifecycle PUBLISHABLE @destination WCMS_STAGED @owner nexus.web */

/** @description Nexus corporate CMS v1.0.4 professional hero-copy update. */
module.exports = {
    record0: {
        code: 'nexusMicroservicesBanner',
        typeCode: 'nexusBannerSlideType',
        accessMode: 'PUBLIC',
        active: true,
        properties: {
            kicker: 'Microservices architecture',
            heading: 'Enterprise capabilities that evolve independently.',
            subheading: 'Compose focused services through governed APIs, explicit ownership, observable runtime contracts, and public experiences that evolve safely.',
            primaryActionLabel: 'Explore Nodics',
            primaryActionHref: '/features',
            secondaryActionLabel: 'Read documentation',
            secondaryActionHref: '/docs'
        }
    }
};
