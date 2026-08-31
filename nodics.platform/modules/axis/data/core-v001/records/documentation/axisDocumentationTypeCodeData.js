/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";

/** @description Nodics Axis documentation page and component types. */
module.exports = {
  record0: {
    code: "axisDocumentationArticlePageType",
    kind: "PAGE",
    contractVersion: 0,
    active: true,
  },
  record1: {
    code: "axisDocumentationArticleComponentType",
    kind: "COMPONENT",
    contractVersion: 0,
    propertySchema: {
      code: "string",
      title: "string",
      route: "string",
      section: "string",
      sectionTitle: "string",
      audience: "array",
      summary: "string",
      headings: "array",
      blocks: "array",
      searchText: "string",
      previous: "object",
      next: "object",
    },
    active: true,
  },
  record2: {
    code: "axisDocumentationNavigationComponentType",
    kind: "COMPONENT",
    contractVersion: 0,
    propertySchema: {
      title: "string",
      searchLabel: "string",
      searchPlaceholder: "string",
      emptyMessage: "string",
      sections: "array",
      items: "array",
    },
    active: true,
  },
  record3: {
    code: "cmsRichTextComponent",
    kind: "COMPONENT",
    contractVersion: 0,
    propertySchema: {
      content: "object",
      blocks: "array",
      plainText: "string",
      format: "string",
    },
    active: true,
  },
};
