/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module modules/nexus.web/data/sample-v001/content/records/editorial/nexusEditorialArticleData
 * @description Defines Kickoff project-owned data records for this module data pack.
 * @layer data
 * @owner nexus.web
 * @override Customer projects may extend or replace this artifact in their own project layer.
 */

/** @lifecycle PUBLISHABLE @destination WCMS_STAGED @owner nexus.web */

const created = new Date('2026-08-18T00:00:00.000Z');
const updated = new Date('2026-08-29T00:00:00.000Z');
const publishFrom = new Date('2026-08-29T00:00:00.000Z');

const nexusEditorialArticleData = {
    /**
     * Creates one Nexus editorial authoring article record.
     *
     * @param {number} index Sequence number.
     * @param {string} code Article code.
     * @param {string} contentTypeCode Editorial content type.
     * @param {string} title Article title.
     * @param {string} slug Article slug.
     * @param {string} summary Article summary.
     * @param {string} taxonomyTermCode Topic taxonomy term code.
     * @param {string} featuredMediaCode Featured media code.
     * @param {boolean} special Whether the article is featured.
     * @returns {Object} Editorial authoring article record.
     */
    article: function (index, code, contentTypeCode, title, slug, summary, taxonomyTermCode, featuredMediaCode, special) {
    return {
        code: code,
        accessGroups: ['userGroup'],
        active: true,
        created: created,
        updated: updated,
        contentTypeCode: contentTypeCode,
        internalName: title.replace(/\.$/u, ''),
        description: summary,
        slug: slug,
        siteCodes: ['nexusCorporateSite'],
        authorCodes: ['nodicsEditorialTeam'],
        featuredMediaCode: featuredMediaCode,
        taxonomyTermCodes: [taxonomyTermCode],
        special: special === true,
        specialLabel: special === true ? (contentTypeCode === 'BLOG' ? 'Featured insight' : 'Featured release') : undefined,
        specialRank: special === true ? 10 : undefined,
        specialFrom: special === true ? created : undefined,
        specialUntil: undefined,
        specialVariant: special === true ? 'gold' : undefined,
        status: 'APPROVED',
        publishFrom: publishFrom,
        publicationCode: `${code}-publication-r1`,
        revision: 1,
        sequence: index
    };
    },

    /**
     * Creates all Nexus editorial authoring article records.
     *
     * @returns {Object} Editorial authoring article records keyed by import record id.
     */
    records: function () {
        return {
    record0: this.article(
        1,
        'nexus-news-public-experience',
        'NEWS',
        'Nodics publishes new article on architecture behind AI-built applications.',
        'ai-built-application-who-built-architecture',
        'The latest Nodics framework article explains why AI-built applications still need architecture, ownership, resilience, and governance when success arrives.',
        'nexus-topic-axis',
        'nexusNewsPublicExperience',
        true
    ),
    record1: this.article(
        2,
        'nexus-news-axis-business-journey',
        'NEWS',
        'Scalability article reframes growth as users, domains, teams, and time.',
        'scalability-beyond-servers-users-domains-teams-time',
        'A new Nodics article argues that scalable software must grow across roles, permissions, business complexity, integrations, teams, security, and time.',
        'nexus-topic-runtime',
        'nexusNewsAxisRuntime',
        false
    ),
    record2: this.article(
        3,
        'nexus-news-engagement-public-api',
        'NEWS',
        'Nodics thinking connects AI-assisted software with enterprise foundations.',
        'ai-assisted-software-needs-enterprise-foundations',
        'The first article in the series asks how AI-generated applications can graduate from fast prototypes into serious businesses.',
        'nexus-topic-platform',
        'nexusNewsEngagementApi',
        false
    ),
    record3: this.article(
        4,
        'nexus-news-editorial-release-flow',
        'NEWS',
        'Nexus News and Blogs now carry Nodics framework thought leadership.',
        'nexus-news-blogs-carry-nodics-framework-thinking',
        'Sample editorial placeholders are being replaced with governed Nexus content based on public Nodics framework articles and production-ready themes.',
        'nexus-topic-editorial',
        'nexusNewsEditorialRelease',
        false
    ),
    record4: this.article(
        5,
        'nexus-blog-engagement-framework',
        'BLOG',
        'Vibe coding on top of enterprise engineering.',
        'vibe-coding-on-top-of-enterprise-engineering',
        'AI-assisted development is making application creation faster, but successful software still needs security, tenancy, auditability, resilience, and integration foundations.',
        'nexus-topic-platform',
        'nexusBlogCustomerEngagement',
        false
    ),
    record5: this.article(
        6,
        'nexus-blog-editorial-publication',
        'BLOG',
        'Scalability is not only about servers.',
        'scalability-is-not-only-about-servers',
        'Infrastructure is only one dimension of scale; enterprise applications also need to scale across people, domains, integrations, governance, and change.',
        'nexus-topic-runtime',
        'nexusBlogEditorialPublication',
        true
    ),
    record6: this.article(
        7,
        'nexus-blog-runtime-discovery',
        'BLOG',
        'Who builds the architecture after AI builds the application?',
        'who-builds-architecture-after-ai-builds-application',
        'AI can accelerate implementation, but architecture decides whether a growing product can stay available, governable, observable, and changeable.',
        'nexus-topic-axis',
        'nexusBlogRuntimeDiscovery',
        false
    ),
    record7: this.article(
        8,
        'nexus-blog-axis-business-operations',
        'BLOG',
        'From prototype speed to governed scale in Nodics.',
        'prototype-speed-to-governed-scale-in-nodics',
        'Nodics connects fast application delivery with reusable module boundaries, publication control, runtime evidence, and operational governance.',
        'nexus-topic-operations',
        'nexusBlogAxisOperations',
        false
    )
        };
    }
};

/** @description Editorial authoring master records shown in Axis News and Blog workspaces. */
module.exports = nexusEditorialArticleData.records();
