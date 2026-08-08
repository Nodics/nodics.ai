/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @description Nodics Axis documentation renderer mappings owned by the Axis client. */
module.exports = {
  record0: {
    code: 'axisDocumentationArticlePageType',
    renderer: 'documentation.page.article',
    contractVersion: 2,
    channels: ['web', 'mobile-webview'],
    deprecated: false,
    active: true,
  },
  record1: {
    code: 'axisDocumentationArticleComponentType',
    renderer: 'documentation.component.article',
    contractVersion: 2,
    channels: ['web', 'mobile-webview'],
    deprecated: false,
    active: true,
  },
  record2: {
    code: 'axisDocumentationNavigationComponentType',
    renderer: 'documentation.component.navigation',
    contractVersion: 2,
    channels: ['web', 'mobile-webview'],
    deprecated: false,
    active: true,
  },
};
