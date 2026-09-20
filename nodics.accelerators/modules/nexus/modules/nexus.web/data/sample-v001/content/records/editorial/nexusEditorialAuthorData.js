/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module modules/nexus.web/data/sample-v001/content/records/editorial/nexusEditorialAuthorData
 * @description Defines Kickoff project-owned data records for this module data pack.
 * @layer data
 * @owner nexus.web
 * @override Customer projects may extend or replace this artifact in their own project layer.
 */

/** @lifecycle PUBLISHABLE @destination WCMS_STAGED @owner nexus.web */

const created = new Date('2026-08-11T00:00:00.000Z');
const updated = new Date('2026-08-11T00:00:00.000Z');

/** @description Editorial authoring identities used by Nexus local News and Blog samples. */
module.exports = {
    record0: {
        code: 'nodicsEditorialTeam',
        accessGroups: ['userGroup'],
        active: true,
        created: created,
        updated: updated,
        description: 'Nexus editorial authoring identity for local News and Blog sample content.',
        displayName: 'Nodics Editorial Team',
        biography: {
            en: 'Framework, BackOffice, content, and implementation notes from the Nodics team.'
        },
        socialLinks: {
            github: 'https://github.com/Nodics',
            linkedin: 'https://www.linkedin.com/company/nodics'
        },
        status: 'ACTIVE'
    }
};
