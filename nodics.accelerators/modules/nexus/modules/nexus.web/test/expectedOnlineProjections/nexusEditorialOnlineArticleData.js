/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";

/**
 * @module modules/nexus.web/test/expectedOnlineProjections/nexusEditorialOnlineArticleData
 * @description Defines expected Nexus Online projection fixtures for acceptance validation.
 * @layer test
 * @owner nexus.web
 * @override Customer projects may extend or replace this artifact in their own project layer.
 */

/** @lifecycle TEST_ONLY @description Expected Online projection; runtime import is prohibited. */

const authoringArticles = require("../../data/sample-v001/content/records/editorial/nexusEditorialArticleData");
const articleLocalizations = require("../../data/sample-v001/content/records/editorial/nexusEditorialArticleLocalizationData");

const localizationsByArticleCode = new Map(
  Object.values(articleLocalizations).map((localization) => [
    localization.articleCode,
    localization,
  ]),
);

const nexusEditorialOnlineArticleData = {
  /**
   * Resolves expected special-article projection fields.
   *
   * @param {Object} article Source article record.
   * @returns {Object} Expected special projection fields.
   */
  special: function (article) {
    return {
      special: article.special === true,
      specialLabel: article.specialLabel,
      specialRank: article.specialRank,
      specialFrom: article.specialFrom || null,
      specialUntil: article.specialUntil || null,
      specialVariant: article.specialVariant,
    };
  },

  /**
   * Creates one expected published Editorial Online projection record.
   *
   * @param {Object} article Source article record.
   * @returns {Object} Expected projection record.
   */
  projection: function (article) {
    const localization = localizationsByArticleCode.get(article.code);
    if (!localization)
      throw new Error(`Missing localization for ${article.code}`);
    return {
      code: `${article.code}-online-${localization.localeCode}`,
      active: true,
      created: article.created,
      updated: article.updated,
      articleCode: article.code,
      contentTypeCode: article.contentTypeCode,
      siteCode: "nexusCorporateSite",
      localeCode: localization.localeCode,
      slug: article.slug,
      payload: {
        articleCode: article.code,
        contentTypeCode: article.contentTypeCode,
        slug: article.slug,
        siteCode: "nexusCorporateSite",
        localeCode: localization.localeCode,
        title: localization.title,
        summary: localization.summary,
        body: localization.body,
        takeaways: localization.takeaways,
        ...this.special(article),
        publishFrom: null,
        publishUntil: null,
      },
      sourceRevision: article.revision,
      sourceHash: `${article.code}-v${article.revision}`,
      status: "CURRENT",
      publishedAt: article.publishFrom,
    };
  },

  /**
   * Creates all expected published Editorial Online projection records.
   *
   * @returns {Object} Expected projection records keyed by import record id.
   */
  records: function () {
    return Object.fromEntries(
      Object.values(authoringArticles)
        .toSorted((first, second) => first.sequence - second.sequence)
        .map((article, index) => [`record${index}`, this.projection(article)]),
    );
  },
};

/** @description Published Editorial Online projections for the Nexus reference site. */
module.exports = nexusEditorialOnlineArticleData.records();
