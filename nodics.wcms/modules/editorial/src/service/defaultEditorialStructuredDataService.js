/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module editorial/service/DefaultEditorialStructuredDataService @description Maps safe Editorial delivery records to schema.org projections. @layer service @owner editorial */
module.exports = { /** Builds Article, NewsArticle, or BlogPosting JSON-LD. */ project: function (article) { let types = { NEWS: 'NewsArticle', BLOG: 'BlogPosting' }; return { '@context': 'https://schema.org', '@type': types[article.contentTypeCode] || 'Article', headline: article.title, description: article.summary, datePublished: article.publishFrom, author: (article.authorCodes || []).map(code => ({ '@type': 'Person', identifier: code })) }; } };
