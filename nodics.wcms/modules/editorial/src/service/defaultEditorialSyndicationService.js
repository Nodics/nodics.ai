/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module editorial/service/DefaultEditorialSyndicationService @description Builds bounded RSS and sitemap projections from already-visible delivery records. @layer service @owner editorial */
module.exports = {
    /** Invalidates derived feeds after a successful publication transition. */ invalidate: function () { return Promise.resolve(true); },
    /** Builds bounded RSS items. */ rss: function (items) { return (items || []).slice(0, 100).map(item => ({ title: item.title, link: item.slug, description: item.summary, pubDate: item.publishFrom })); },
    /** Builds bounded sitemap entries. */ sitemap: function (items) { return (items || []).slice(0, 100).map(item => ({ loc: item.slug, lastmod: item.publishedAt || item.publishFrom })); }
};
