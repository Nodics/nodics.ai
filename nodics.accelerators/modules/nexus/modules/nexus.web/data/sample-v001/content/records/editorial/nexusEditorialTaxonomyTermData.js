/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module modules/nexus.web/data/sample-v001/content/records/editorial/nexusEditorialTaxonomyTermData
 * @description Defines Kickoff project-owned data records for this module data pack.
 * @layer data
 * @owner nexus.web
 * @override Customer projects may extend or replace this artifact in their own project layer.
 */

/** @lifecycle PUBLISHABLE @destination WCMS_STAGED @owner nexus.web */

const created = new Date('2026-08-11T00:00:00.000Z');
const updated = new Date('2026-08-11T00:00:00.000Z');

const nexusEditorialTaxonomyTermData = {
    /**
     * Creates one Nexus editorial taxonomy term record.
     *
     * @param {string} code Term code.
     * @param {string} name Term name.
     * @param {string} slug Term slug.
     * @param {string} description Term description.
     * @returns {Object} Editorial taxonomy term record.
     */
    topic: function (code, name, slug, description) {
    return {
        code: code,
        accessGroups: ['userGroup'],
        active: true,
        created: created,
        updated: updated,
        description: description,
        taxonomyCode: 'nexusEditorialTopic',
        name: name,
        slug: slug,
        metadata: {
            siteCode: 'nexusCorporateSite',
            description: description
        }
    };
    },

    /**
     * Creates all Nexus editorial taxonomy term records.
     *
     * @returns {Object} Editorial taxonomy term records keyed by import record id.
     */
    records: function () {
        return {
    record0: this.topic('nexus-topic-platform', 'AI Foundation', 'ai-foundation', 'AI-assisted delivery on top of reusable enterprise foundations.'),
    record1: this.topic('nexus-topic-axis', 'Architecture', 'architecture', 'Architecture, ownership, boundaries, and long-term application evolution.'),
    record2: this.topic('nexus-topic-engagement', 'Application Growth', 'application-growth', 'How products move from prototype validation into serious customer-facing systems.'),
    record3: this.topic('nexus-topic-editorial', 'Nexus Publishing', 'nexus-publishing', 'Authoring, localization, approval, and publication flows for Nexus content.'),
    record4: this.topic('nexus-topic-runtime', 'Scalability', 'scalability', 'Scale across traffic, users, domains, integrations, teams, security, and time.'),
    record5: this.topic('nexus-topic-operations', 'Governance', 'governance', 'Operational control, release evidence, schema visibility, and delivery workflows.')
        };
    }
};

/** @description Editorial taxonomy terms used by Nexus local News and Blog samples. */
module.exports = nexusEditorialTaxonomyTermData.records();
