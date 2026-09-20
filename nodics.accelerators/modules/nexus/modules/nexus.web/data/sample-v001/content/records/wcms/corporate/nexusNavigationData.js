/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";

/**
 * @module modules/nexus.web/data/sample-v001/content/records/wcms/corporate/nexusNavigationData
 * @description Defines Kickoff project-owned data records for this module data pack.
 * @layer data
 * @owner nexus.web
 * @override Customer projects may extend or replace this artifact in their own project layer.
 */

/** @lifecycle PUBLISHABLE @destination WCMS_STAGED @owner nexus.web */

/** @description Nexus corporate navigation. */
module.exports = {
  record0: {
    code: "nexusNavHome",
    site: "nexusCorporateSite",
    name: "Home",
    title: "Home",
    nodeType: "ROUTE",
    targetRoute: "nexusHomeRoute",
    position: 10,
    status: "ACTIVE",
    locale: "en",
    channel: "web",
    active: true,
  },
  record1: {
    code: "nexusNavAbout",
    site: "nexusCorporateSite",
    name: "About",
    title: "About",
    nodeType: "ROUTE",
    targetRoute: "nexusAboutRoute",
    position: 20,
    status: "ACTIVE",
    locale: "en",
    channel: "web",
    active: true,
  },
  record2: {
    code: "nexusNavFeatures",
    site: "nexusCorporateSite",
    name: "Features",
    title: "Features",
    nodeType: "ROUTE",
    targetRoute: "nexusFeaturesRoute",
    position: 30,
    status: "ACTIVE",
    locale: "en",
    channel: "web",
    active: true,
  },
  record3: {
    code: "nexusNavProducts",
    site: "nexusCorporateSite",
    name: "Products",
    title: "Products",
    nodeType: "ROUTE",
    targetRoute: "nexusProductsRoute",
    position: 35,
    status: "ACTIVE",
    locale: "en",
    channel: "web",
    active: true,
  },
  record4: {
    code: "nexusNavSupport",
    site: "nexusCorporateSite",
    name: "Support",
    title: "Support",
    nodeType: "ROUTE",
    targetRoute: "nexusSupportRoute",
    position: 40,
    status: "ACTIVE",
    locale: "en",
    channel: "web",
    active: true,
  },
  record5: {
    code: "nexusNavBlogs",
    site: "nexusCorporateSite",
    name: "Blogs",
    title: "Blogs",
    nodeType: "ROUTE",
    targetRoute: "nexusEditorialListingRoute",
    position: 50,
    status: "ACTIVE",
    locale: "en",
    channel: "web",
    active: true,
  },
  record6: {
    code: "nexusNavContact",
    site: "nexusCorporateSite",
    name: "Contact",
    title: "Contact",
    nodeType: "ROUTE",
    targetRoute: "nexusContactRoute",
    position: 70,
    status: "ACTIVE",
    locale: "en",
    channel: "web",
    active: true,
  },
  record7: {
    code: "nexusNavSolutions",
    site: "nexusCorporateSite",
    name: "Solutions",
    title: "Solutions",
    nodeType: "ROUTE",
    targetRoute: "nexusSolutionsRoute",
    position: 36,
    status: "ACTIVE",
    locale: "en",
    channel: "web",
    active: true,
  },
};
