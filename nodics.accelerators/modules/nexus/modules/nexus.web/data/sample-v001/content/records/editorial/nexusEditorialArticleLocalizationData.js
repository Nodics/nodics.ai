/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module modules/nexus.web/data/sample-v001/content/records/editorial/nexusEditorialArticleLocalizationData
 * @description Defines Kickoff project-owned data records for this module data pack.
 * @layer data
 * @owner nexus.web
 * @override Customer projects may extend or replace this artifact in their own project layer.
 */

/** @lifecycle PUBLISHABLE @destination WCMS_STAGED @owner nexus.web */

const authoringArticles = require('./nexusEditorialArticleData');
const components = require('../wcms/corporate/nexusComponentData');
const created = new Date('2026-08-18T00:00:00.000Z');
const updated = new Date('2026-08-29T00:00:00.000Z');

const detailsByTitle = new Map(Object.values(components)
    .filter((component) => component.typeCode === 'nexusEditorialDetailType' && component.properties && component.properties.title)
    .map((component) => [component.properties.title, component.properties]));

const nexusEditorialArticleLocalizationData = {
    /**
     * Resolves localized article body blocks from detail components.
     *
     * @param {Object} article Authoring article record.
     * @returns {Object[]} Localized body blocks.
     */
    bodyBlocks: function (article) {
    const detail = detailsByTitle.get(article.internalName) || detailsByTitle.get(`${article.internalName}.`);
    const blocks = [];
    if (detail && detail.bodyText) {
        blocks.push({ type: 'paragraph', text: detail.bodyText });
    }
    if (detail && Array.isArray(detail.sections)) {
        detail.sections.forEach((section) => {
            blocks.push({ type: 'heading', text: section.title });
            blocks.push({ type: 'paragraph', text: section.body });
        });
    }
    return blocks.length > 0 ? blocks : [{ type: 'paragraph', text: article.description }];
    },

    /**
     * Creates one localized editorial article record.
     *
     * @param {Object} article Authoring article record.
     * @returns {Object} Localized editorial article record.
     */
    localization: function (article) {
    const title = article.internalName.endsWith('.') ? article.internalName : `${article.internalName}.`;
    const detail = detailsByTitle.get(title) || detailsByTitle.get(article.internalName);
    return {
        code: `${article.code}-en`,
        accessGroups: ['userGroup'],
        active: true,
        created: created,
        updated: updated,
        description: article.description,
        articleCode: article.code,
        localeCode: 'en',
        title: title,
        summary: article.description,
        body: {
            blocks: this.bodyBlocks(article)
        },
        takeaways: Array.isArray(detail && detail.takeaways) ? detail.takeaways : [],
        seo: {
            title: title,
            description: article.description
        },
        slug: article.slug,
        status: 'READY',
        revision: 1
    };
    },

    /**
     * Creates all localized editorial article records.
     *
     * @returns {Object} Localized editorial article records keyed by import record id.
     */
    records: function () {
        return Object.fromEntries(Object.values(authoringArticles).map((article, index) => [`record${index}`, this.localization(article)]));
    }
};

/** @description Localized editorial copy for Nexus local News and Blog authoring records. */
module.exports = nexusEditorialArticleLocalizationData.records();
