/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module modules/nexus.web/data/sample-v001/content/headers/editorial/nexusEditorialSampleDataHeader
 * @description Defines Kickoff project-owned import header records for this data pack.
 * @layer data-header
 * @owner nexus.web
 * @override Customer projects may extend or replace this artifact in their own project layer.
 */

/** @description Publishable Editorial authoring records for Nexus; Online projections are produced only by publication. */
module.exports = {
    editorial: {
        nexusEditorialAuthorData: { options: { enabled: true, schemaName: 'editorialAuthor', operation: 'saveAll', dataFilePrefix: 'nexusEditorialAuthorData', userGroups: ['adminGroup'] }, query: { code: '$code' } },
        nexusEditorialTaxonomyTermData: { options: { enabled: true, schemaName: 'editorialTaxonomyTerm', operation: 'saveAll', dataFilePrefix: 'nexusEditorialTaxonomyTermData', userGroups: ['adminGroup'] }, query: { code: '$code' } },
        nexusEditorialArticleData: { options: { enabled: true, schemaName: 'editorialArticle', operation: 'saveAll', dataFilePrefix: 'nexusEditorialArticleData', userGroups: ['adminGroup'] }, query: { code: '$code' } },
        nexusEditorialArticleLocalizationData: { options: { enabled: true, schemaName: 'editorialArticleLocalization', operation: 'saveAll', dataFilePrefix: 'nexusEditorialArticleLocalizationData', userGroups: ['adminGroup'] }, query: { code: '$code' } },
        nexusEditorialArticleTaxonomyData: { options: { enabled: true, schemaName: 'editorialArticleTaxonomy', operation: 'saveAll', dataFilePrefix: 'nexusEditorialArticleTaxonomyData', userGroups: ['adminGroup'] }, query: { code: '$code' } }
    }
};
