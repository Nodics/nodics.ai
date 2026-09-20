/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module modules/nexus.web/data/sample-v001/content/records/editorial/nexusEditorialArticleTaxonomyData
 * @description Defines Kickoff project-owned data records for this module data pack.
 * @layer data
 * @owner nexus.web
 * @override Customer projects may extend or replace this artifact in their own project layer.
 */

/** @lifecycle PUBLISHABLE @destination WCMS_STAGED @owner nexus.web */

const articles = require('./nexusEditorialArticleData');

/** @description Primary topic links for Nexus local News and Blog authoring records. */
module.exports = Object.fromEntries(
    Object.values(articles).map((article, index) => {
        const termCode = article.taxonomyTermCodes[0];
        return [
            `record${index}`,
            {
                code: `${article.code}-${termCode}`,
                accessGroups: ['userGroup'],
                active: true,
                created: article.created,
                updated: article.updated,
                description: `Primary Nexus Editorial topic for ${article.code}.`,
                articleCode: article.code,
                termCode: termCode,
                relationType: 'PRIMARY'
            }
        ];
    })
);
