/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { createHash } from "node:crypto";

const moduleRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const manifest = JSON.parse(
  await readFile(resolve(moduleRoot, "data/manifest.json")),
);
const documentationBoundary = await readFile(
  resolve(moduleRoot, "docs/README.md"),
  "utf8",
);
const components = require(
  resolve(
    moduleRoot,
    "data/sample-v001/content/records/wcms/corporate/nexusComponentData.js",
  ),
);
const routes = require(
  resolve(
    moduleRoot,
    "data/sample-v001/content/records/wcms/corporate/nexusRouteData.js",
  ),
);
const pages = require(
  resolve(
    moduleRoot,
    "data/sample-v001/content/records/wcms/corporate/nexusPageData.js",
  ),
);
const renderers = require(
  resolve(
    moduleRoot,
    "data/sample-v001/content/records/wcms/corporate/nexusRendererData.js",
  ),
);
const sites = require(
  resolve(
    moduleRoot,
    "data/sample-v001/content/records/wcms/corporate/nexusSiteData.js",
  ),
);
const catalogs = require(
  resolve(
    moduleRoot,
    "data/sample-v001/content/records/wcms/corporate/nexusCatalogData.js",
  ),
);
const editorialAuthors = require(
  resolve(
    moduleRoot,
    "data/sample-v001/content/records/editorial/nexusEditorialAuthorData.js",
  ),
);
const editorialTaxonomyTerms = require(
  resolve(
    moduleRoot,
    "data/sample-v001/content/records/editorial/nexusEditorialTaxonomyTermData.js",
  ),
);
const editorialArticles = require(
  resolve(
    moduleRoot,
    "data/sample-v001/content/records/editorial/nexusEditorialArticleData.js",
  ),
);
const editorialArticleLocalizations = require(
  resolve(
    moduleRoot,
    "data/sample-v001/content/records/editorial/nexusEditorialArticleLocalizationData.js",
  ),
);
const editorialArticleTaxonomies = require(
  resolve(
    moduleRoot,
    "data/sample-v001/content/records/editorial/nexusEditorialArticleTaxonomyData.js",
  ),
);
const editorialOnlineArticles = require(
  resolve(
    moduleRoot,
    "test/expectedOnlineProjections/nexusEditorialOnlineArticleData.js",
  ),
);
const testimonials = require(
  resolve(
    moduleRoot,
    "data/sample-v001/content/records/engagement/nexusTestimonialProjectionData.js",
  ),
);
const mediaReferences = require(
  resolve(
    moduleRoot,
    "data/sample-v001/content/records/media/nexusMediaReferenceData.js",
  ),
);
const mediaRecords = require(
  resolve(
    moduleRoot,
    "data/sample-v001/content/records/media/nexusMediaData.js",
  ),
);
const componentMedia = require(
  resolve(
    moduleRoot,
    "data/sample-v001/content/records/media/nexusComponentMediaData.js",
  ),
);
const mediaAssetManifest = require(
  resolve(
    moduleRoot,
    "data/sample-v001/content/assets/nexus-cms-media/assetManifest.js",
  ),
);
const componentValues = Object.values(components);
const pageValues = Object.values(pages);
const rendererValues = Object.values(renderers);
const editorialAuthorValues = Object.values(editorialAuthors);
const editorialTaxonomyTermValues = Object.values(editorialTaxonomyTerms);
const editorialArticleValues = Object.values(editorialArticles);
const editorialArticleLocalizationValues = Object.values(
  editorialArticleLocalizations,
);
const editorialArticleTaxonomyValues = Object.values(
  editorialArticleTaxonomies,
);
const editorialOnlineArticleValues = Object.values(editorialOnlineArticles);
const mediaReferenceValues = Object.values(mediaReferences);
const mediaRecordValues = Object.values(mediaRecords);
const componentMediaValues = Object.values(componentMedia);
const site = Object.values(sites)[0];
const catalog = Object.values(catalogs)[0];
const homePage = pageValues.find((page) => page.code === "nexusHomePage");
const aboutPage = pageValues.find((page) => page.code === "nexusAboutPage");
const featuresPage = pageValues.find(
  (page) => page.code === "nexusFeaturesPage",
);
const productsPage = pageValues.find(
  (page) => page.code === "nexusProductsPage",
);
const supportPage = pageValues.find((page) => page.code === "nexusSupportPage");
const newsPage = pageValues.find(
  (page) => page.code === "nexusNewsListingPage",
);
const newsDetailPages = [
  "nexusNewsPublicExperiencePage",
  "nexusNewsAxisBusinessJourneyPage",
  "nexusNewsEngagementPublicApiPage",
  "nexusNewsEditorialReleaseFlowPage",
].map((code) => pageValues.find((page) => page.code === code));
const blogPage = pageValues.find(
  (page) => page.code === "nexusBlogListingPage",
);
const blogDetailPages = [
  "nexusBlogEngagementFrameworkPage",
  "nexusBlogEditorialPublicationPage",
  "nexusBlogRuntimeDiscoveryPage",
  "nexusBlogAxisBusinessOperationsPage",
].map((code) => pageValues.find((page) => page.code === code));
const editorialDetailPageExpectations = [
  ...newsDetailPages.map((page) => ({ page, contentTypeCode: "NEWS" })),
  ...blogDetailPages.map((page) => ({ page, contentTypeCode: "BLOG" })),
];
const componentByCode = new Map(
  componentValues.map((component) => [component.code, component]),
);
const orderedComponentTargets = (page, slot) =>
  page.cmsComponents
    .filter((association) =>
      slot ? association.slot === slot : association.slot !== "shell",
    )
    .toSorted((first, second) => first.index - second.index)
    .map((association) => association.target);

async function sha256(relativePath) {
  return createHash("sha256")
    .update(await readFile(resolve(moduleRoot, "data", relativePath)))
    .digest("hex");
}

assert.equal(site.code, "nexusCorporateSite");
assert.match(
  documentationBoundary,
  /ownership boundary for Nexus-specific authored\s+documentation/,
  "Nexus application documentation must remain module-owned",
);
assert.equal(site.catalog, "nexusContentCatalog");
assert.equal(catalog.code, "nexusContentCatalog");
assert.equal(
  pageValues.length,
  31,
  "Corporate release must contain the approved corporate and Editorial reference routes",
);
assert(homePage, "Homepage must exist in the importable CMS page payload");
assert(aboutPage, "About page must exist in the importable CMS page payload");
assert(
  featuresPage,
  "Features page must exist in the importable CMS page payload",
);
assert(
  productsPage,
  "Products page must exist in the importable CMS page payload",
);
assert(
  supportPage,
  "Support page must exist in the importable CMS page payload",
);
assert(
  newsPage,
  "News listing page must exist in the importable CMS page payload",
);
assert(
  newsDetailPages.every(Boolean),
  "All seeded News detail pages must exist in the importable CMS page payload",
);
assert(
  blogPage,
  "Blog listing page must exist in the importable CMS page payload",
);
assert(
  blogDetailPages.every(Boolean),
  "All seeded Blog detail pages must exist in the importable CMS page payload",
);
assert.equal(
  orderedComponentTargets(homePage).length,
  13,
  "Homepage must include the product and solution sections",
);
const homepageShellComponentCodes = orderedComponentTargets(homePage, "shell");
assert.deepEqual(
  homepageShellComponentCodes,
  ["nexusCorporateSiteHeader", "nexusCorporateSiteFooter"],
  "Homepage must include the backend-managed shared header and footer shell components",
);
const sharedHeader = componentByCode.get("nexusCorporateSiteHeader");
const sharedFooter = componentByCode.get("nexusCorporateSiteFooter");
assert.equal(
  sharedHeader?.properties.navigation.find((item) => item.id === "blogs")?.href,
  "/#blogs",
  "Shared header Blogs menu link must scroll to the homepage Blogs section",
);
assert.equal(
  sharedFooter?.properties.groups
    .flatMap((group) => group.links)
    .find((item) => item.label === "Blogs")?.href,
  "/#blogs",
  "Shared footer Blogs link must scroll to the homepage Blogs section",
);
const homepageComponentCodes = orderedComponentTargets(homePage);
assert(
  !homepageComponentCodes.includes("nexusHomePlatform"),
  "Platform Overview must remain excluded from the homepage composition",
);
assert(
  !homepageComponentCodes.includes("nexusHomeDevelopers"),
  "Developer Experience must remain consolidated into GitHub on the homepage",
);
const githubComponent = componentByCode.get("nexusHomeGithub");
assert.equal(
  githubComponent?.properties.organizationHref,
  "https://github.com/Nodics",
  "Homepage GitHub section must use the Nodics organization as the stable entry point",
);
assert.match(
  githubComponent?.properties.heading ?? "",
  /Nodics GitHub organization/,
  "Homepage GitHub heading must not present four repositories as the complete source surface",
);
assert.match(
  githubComponent?.properties.repositoryIntro ?? "",
  /Start with the installer/,
  "Homepage GitHub repository cards must be framed as families, not an exhaustive repo list",
);
assert.equal(
  githubComponent?.properties.repositories?.[0]?.name,
  "nodics.installer",
  "Homepage GitHub first card must point evaluators to the local setup installer",
);
assert.equal(
  githubComponent?.properties.repositories?.[0]?.href,
  "https://github.com/Nodics/nodics.installer",
  "Homepage GitHub installer card must link directly to the installer repository",
);
assert(
  githubComponent?.properties.repositories.every(
    (repository) =>
      typeof repository.linkLabel === "string" &&
      !/view repository/i.test(repository.linkLabel),
  ),
  "Homepage GitHub cards must use organization or catalogue CTAs instead of fixed repository-only labels",
);
const carousel = componentByCode.get("nexusHomeBannerCarousel");
assert(carousel, "Homepage banner carousel must exist");
assert.equal(carousel.typeCode, "nexusBannerCarouselType");
assert.deepEqual(
  carousel.subComponents.map((association) => association.target),
  ["nexusMicroservicesBanner", "nexusModularBanner", "nexusSecureBanner"],
);
assert.equal(carousel.properties.rotationIntervalMs, 10000);
const bannerSlides = componentValues.filter(
  (component) => component.typeCode === "nexusBannerSlideType",
);
assert.equal(
  bannerSlides.length,
  3,
  "Carousel must contain three independently managed banner components",
);
bannerSlides.forEach((slide) => {
  assert(
    slide.properties.referenceImageCode,
    `${slide.code} must reference a banner image`,
  );
  assert(slide.properties.title, `${slide.code} must define a title`);
  assert(slide.properties.heading, `${slide.code} must define a heading`);
  assert(slide.properties.subheading, `${slide.code} must define a subheading`);
  assert(
    slide.properties.buttons.length > 0,
    `${slide.code} must define buttons`,
  );
});
assert(
  !JSON.stringify({ pages, components }).toLowerCase().includes("wiki-home"),
  "Legacy Wiki pages must not enter Nexus content",
);
assert.deepEqual(
  homepageComponentCodes.slice(3, 7),
  [
    "nexusHomeProducts",
    "nexusHomeSolutions",
    "nexusHomeTechnology",
    "nexusHomeSupport",
  ],
  "Products, Solutions and Technology must follow Features before Support",
);
assert.equal(
  componentByCode.get("nexusHomeProducts")?.properties.href,
  "/products",
  "Homepage Products section CTA must open the Products page",
);
assert.equal(
  componentByCode.get("nexusHomeSupport")?.properties.href,
  "/support",
  "Homepage Support section CTA must open the Support page",
);
assert.equal(
  componentByCode.get("nexusHomeBlogs")?.properties.href,
  "/blogs",
  "Homepage Blogs section CTA must open the Blogs listing page",
);
const aboutComponentCodes = orderedComponentTargets(aboutPage);
assert.deepEqual(
  aboutComponentCodes.slice(0, 5),
  [
    "nexusAboutHero",
    "nexusAboutContent",
    "nexusAboutPrinciples",
    "nexusAboutMvpScale",
    "nexusAboutPromise",
  ],
  "About page must explain the Nodics position from story through MVP-to-scale and promise",
);
assert.equal(
  componentByCode.get("nexusAboutMvpScale")?.properties.anchor,
  "about-mvp-scale",
  "About MVP-to-scale section must expose a stable managed component anchor",
);
const featuresComponentCodes = orderedComponentTargets(featuresPage);
assert.deepEqual(
  featuresComponentCodes.slice(0, 7),
  [
    "nexusFeaturesHero",
    "nexusFeaturesContent",
    "nexusFeaturesPillars",
    "nexusFeaturesArchitecture",
    "nexusFeaturesCapabilities",
    "nexusFeaturesMvpScale",
    "nexusFeaturesJourney",
  ],
  "Features page must explain capability pillars, architecture, catalogue, MVP-to-scale, and partner journey",
);
assert.equal(
  componentByCode.get("nexusFeaturesCapabilities")?.properties.items.length,
  12,
  "Features page capability catalogue must expose the approved twelve capability cards",
);
const productsComponentCodes = orderedComponentTargets(productsPage);
assert.deepEqual(
  productsComponentCodes,
  ["nexusProductsHero", "nexusProductsDashboard"],
  "Products must open the managed comparison dashboard",
);
const portfolio = componentByCode.get("nexusProductsDashboard").properties
  .products;
assert.equal(
  portfolio.length,
  4,
  "The portfolio contains four implemented reference experiences",
);
assert.deepEqual(
  componentByCode.get("nexusHomeProducts").properties.products,
  portfolio,
  "Home and dashboard must expose the same product catalogue",
);
assert.equal(
  componentByCode.get("nexusHomeProducts").typeCode,
  "nexusProductPortfolioType",
);
for (const product of portfolio) {
  assert(
    typeof product.adoption === "string" && product.adoption.length > 20,
    "Every comparison row needs concrete adoption guidance",
  );
  const route = Object.values(routes).find(
    (entry) => entry.path === product.href,
  );
  assert(route, `${product.title} must have a public detail route`);
  const page = pageValues.find((entry) => entry.code === route.page);
  const targets = orderedComponentTargets(page);
  assert.equal(targets.length, 2);
  const story = componentByCode.get(targets[1]);
  assert.equal(story.typeCode, "nexusProductStoryType");
  assert.equal(
    story.properties.gallery.length,
    story.code === "nexusProductApparelStory" ? 4 : 3,
  );
  assert.equal(story.properties.capabilities.length, 6);
  assert.equal(story.properties.workflow.length, 4);
  assert.equal(story.properties.adoption.length, 3);
  for (const screen of story.properties.gallery) {
    assert(
      existsSync(
        resolve(
          moduleRoot,
          `data/sample-v001/content/assets/nexus-cms-media/files/${screen.referenceImageCode}.png`,
        ),
      ),
      `${product.title} screen must exist`,
    );
  }
}
assert(
  Object.values(routes).some((route) => route.path === "/solutions"),
  "Conceptual solutions have their own route",
);
assert.match(
  JSON.stringify(componentByCode.get("nexusProductTelcoStory").properties.faq),
  /separate integrations/,
);
assert.match(
  JSON.stringify(componentByCode.get("nexusProductWasteStory").properties.faq),
  /Physical receipt and custody/,
);
const supportComponentCodes = orderedComponentTargets(supportPage);
assert.deepEqual(
  supportComponentCodes.slice(0, 6),
  [
    "nexusSupportHero",
    "nexusSupportContent",
    "nexusSupportPaths",
    "nexusSupportResponseModel",
    "nexusSupportRequestChecklist",
    "nexusSupportBoundaries",
  ],
  "Support page must explain model, paths, response expectations, request evidence, and boundaries",
);
assert.equal(
  componentByCode.get("nexusSupportContent")?.properties.anchor,
  "support-overview",
  "Support overview must expose a stable managed component anchor",
);
assert.equal(
  componentByCode.get("nexusSupportResponseModel")?.properties.items.length,
  4,
  "Support response model must expose the approved four priority levels",
);
const newsComponentCodes = orderedComponentTargets(newsPage);
assert.deepEqual(
  newsComponentCodes.slice(0, 2),
  ["nexusNewsListingHero", "nexusNewsListing"],
  "News page must expose the shared hero and searchable listing components",
);
assert.equal(
  componentByCode.get("nexusNewsListing")?.properties.contentTypeCode,
  "NEWS",
  "News listing must be scoped to managed NEWS projections",
);
assert.equal(
  componentByCode.get("nexusNewsListing")?.properties.articles.length,
  4,
  "News listing must provide four seeded public news entries for local preview",
);
assert.equal(
  componentByCode
    .get("nexusNewsListing")
    ?.properties.articles.filter((article) => article.special === true).length,
  1,
  "News listing must expose exactly one special article for local preview",
);
componentByCode
  .get("nexusNewsListing")
  ?.properties.articles.forEach((article) => {
    assert.equal(
      typeof article.special,
      "boolean",
      `${article.code} must expose a boolean special flag for Axis management`,
    );
  });
newsDetailPages.forEach((page) => {
  const detailComponentCodes = orderedComponentTargets(page);
  assert.equal(
    detailComponentCodes.length,
    2,
    `${page.code} must expose one hero and one article detail component`,
  );
  assert.equal(
    componentByCode.get(detailComponentCodes[1])?.typeCode,
    "nexusEditorialDetailType",
    `${page.code} must use the shared Editorial detail renderer`,
  );
  assert.equal(
    componentByCode.get(detailComponentCodes[1])?.properties.contentTypeCode,
    "NEWS",
    `${page.code} must remain scoped to NEWS content`,
  );
  assert(
    componentByCode.get(detailComponentCodes[1])?.properties.sections.length >=
      3,
    `${page.code} must provide structured article sections`,
  );
});
const blogComponentCodes = orderedComponentTargets(blogPage);
assert.deepEqual(
  blogComponentCodes.slice(0, 2),
  ["nexusBlogListingHero", "nexusBlogListing"],
  "Blog page must expose the shared hero and searchable listing components",
);
assert.equal(
  componentByCode.get("nexusBlogListing")?.properties.contentTypeCode,
  "BLOG",
  "Blog listing must be scoped to managed BLOG projections",
);
assert.equal(
  componentByCode.get("nexusBlogListing")?.properties.articles.length,
  4,
  "Blog listing must provide four seeded public blog entries for local preview",
);
assert.equal(
  componentByCode
    .get("nexusBlogListing")
    ?.properties.articles.filter((article) => article.special === true).length,
  1,
  "Blog listing must expose exactly one special article for local preview",
);
componentByCode
  .get("nexusBlogListing")
  ?.properties.articles.forEach((article) => {
    assert.equal(
      typeof article.special,
      "boolean",
      `${article.code} must expose a boolean special flag for Axis management`,
    );
  });
const expectedEditorialArticleCodes = [
  ...componentByCode.get("nexusNewsListing").properties.articles,
  ...componentByCode.get("nexusBlogListing").properties.articles,
]
  .map((article) => article.code)
  .sort();
assert.equal(
  editorialAuthorValues.length,
  1,
  "Nexus sample Editorial data must include the owning authoring identity for Axis",
);
assert.equal(
  editorialTaxonomyTermValues.length,
  6,
  "Nexus sample Editorial data must include reusable taxonomy terms for Axis filters",
);
assert.deepEqual(
  editorialArticleValues.map((article) => article.code).sort(),
  expectedEditorialArticleCodes,
  "Nexus News and Blog listing samples must have matching Editorial authoring records for Axis",
);
assert.deepEqual(
  editorialArticleLocalizationValues
    .map((localization) => localization.articleCode)
    .sort(),
  expectedEditorialArticleCodes,
  "Every Nexus Editorial authoring article must have one English localization",
);
assert.deepEqual(
  editorialOnlineArticleValues.map((article) => article.articleCode).sort(),
  expectedEditorialArticleCodes,
  "Nexus online projections must remain aligned to the authoring records",
);
assert.deepEqual(
  editorialArticleTaxonomyValues.map((link) => link.articleCode).sort(),
  expectedEditorialArticleCodes,
  "Every Nexus Editorial authoring article must have a taxonomy link for filterable Axis data",
);
editorialArticleValues.forEach((article) => {
  assert.equal(
    article.status,
    "APPROVED",
    `${article.code} must be Axis-editable authoring data approved for local preview`,
  );
  assert.equal(
    article.siteCodes.includes("nexusCorporateSite"),
    true,
    `${article.code} must belong to the Nexus corporate site`,
  );
  assert.deepEqual(
    article.authorCodes,
    ["nodicsEditorialTeam"],
    `${article.code} must reference the Nexus Editorial authoring identity`,
  );
});
assert.deepEqual(
  editorialArticleValues
    .filter((article) => article.contentTypeCode === "NEWS" && article.special)
    .map((article) => article.code),
  ["nexus-news-public-experience"],
  "News featured state must be owned by Editorial authoring data",
);
assert.deepEqual(
  editorialArticleValues
    .filter((article) => article.contentTypeCode === "BLOG" && article.special)
    .map((article) => article.code),
  ["nexus-blog-editorial-publication"],
  "Blog featured state must be owned by Editorial authoring data",
);
editorialArticleLocalizationValues.forEach((localization) => {
  assert.equal(
    localization.status,
    "READY",
    `${localization.code} must be ready for Editorial publication`,
  );
  assert.equal(
    localization.localeCode,
    "en",
    `${localization.code} must seed the default Nexus locale`,
  );
  assert.equal(
    Array.isArray(localization.takeaways) && localization.takeaways.length > 0,
    true,
    `${localization.code} must seed article-specific takeaways`,
  );
});
editorialOnlineArticleValues.forEach((onlineArticle) => {
  assert.equal(
    Array.isArray(onlineArticle.payload.takeaways) &&
      onlineArticle.payload.takeaways.length > 0,
    true,
    `${onlineArticle.code} must publish article-specific takeaways`,
  );
  const authoringArticle = editorialArticleValues.find(
    (article) => article.code === onlineArticle.articleCode,
  );
  assert.equal(
    onlineArticle.payload.special,
    authoringArticle?.special === true,
    `${onlineArticle.code} must publish the authoring special flag`,
  );
});
editorialDetailPageExpectations.forEach(({ page, contentTypeCode }) => {
  const detailComponentCodes = orderedComponentTargets(page);
  const detailComponent = componentByCode.get(detailComponentCodes[1]);
  const detailProperties = detailComponent?.properties || {};
  const detailBodyLength = [
    detailProperties.bodyText || "",
    ...(detailProperties.sections || []).map((section) => section.body || ""),
  ].join("\n").length;
  assert.equal(
    detailComponentCodes.length,
    2,
    `${page.code} must expose one hero and one article detail component`,
  );
  assert.equal(
    detailComponent?.typeCode,
    "nexusEditorialDetailType",
    `${page.code} must use the shared Editorial detail renderer`,
  );
  assert.equal(
    detailProperties.contentTypeCode,
    contentTypeCode,
    `${page.code} must remain scoped to ${contentTypeCode} content`,
  );
  assert(
    detailProperties.sections.length >= 3,
    `${page.code} must provide structured article sections`,
  );
  assert(
    (detailProperties.bodyText || "").length >= 1800,
    `${page.code} must provide long-form article body copy`,
  );
  assert(
    detailBodyLength >= 3000,
    `${page.code} must provide LinkedIn-style article depth across body and sections`,
  );
});
assert.deepEqual(
  homepageComponentCodes.slice(7, 10),
  ["nexusHomeTestimonials", "nexusHomeBlogs", "nexusHomeNews"],
  "Testimonials, Blogs, and News must follow Support as one editorial sequence",
);
const retiredProductComponents = new Set([
  "nexusProductsContent",
  "nexusProductsSuite",
  "nexusProductsOperatingModel",
  "nexusProductsReadiness",
]);
for (const code of retiredProductComponents) {
  assert(
    pageValues.every(
      (page) => !page.cmsComponents.some((entry) => entry.target === code),
    ),
    `Retired product component ${code} cannot be associated with a live page`,
  );
}
componentValues.forEach((component) => {
  assert.equal(
    component.active,
    !retiredProductComponents.has(component.code),
    `CMS component ${component.code} must default active for Axis visibility control`,
  );
  assert.notEqual(
    component.properties?.enabled,
    true,
    `CMS component ${component.code} must use cmsComponent.active, not properties.enabled`,
  );
});
homepageComponentCodes.forEach((componentCode) => {
  const component = componentByCode.get(componentCode);
  assert(component, `Homepage component ${componentCode} must exist`);
  assert.equal(
    component.active,
    true,
    `Homepage component ${componentCode} must be visible by default`,
  );
});
pageValues
  .filter((page) => page.typeCode === "nexusCorporateStandardPageType")
  .forEach((page) => {
    const heroComponentCode = orderedComponentTargets(page)[0];
    const heroComponent = componentByCode.get(heroComponentCode);
    assert(
      heroComponent,
      `Standard second-level page ${page.code} must start with a CMS-managed hero component`,
    );
    assert.equal(
      heroComponent.typeCode,
      "nexusPageHeroType",
      `Standard second-level page ${page.code} must use the shared Nexus page hero renderer`,
    );
    assert.equal(
      heroComponent.active,
      true,
      `Standard second-level page hero ${heroComponent.code} must be visible by default`,
    );
    assert(
      heroComponent.properties?.referenceImageCode,
      `Standard second-level page hero ${heroComponent.code} must define a banner image`,
    );
  });
assert(
  rendererValues.every((entry) =>
    /^nexus\.(page|component|editorial)\./u.test(entry.renderer),
  ),
  "Renderer keys must be logical Nexus identifiers",
);
assert.equal(
  rendererValues.filter((entry) =>
    entry.renderer.startsWith("nexus.editorial."),
  ).length,
  9,
  "Reference data must declare the nine standard Editorial renderer contracts",
);
editorialArticleValues.forEach((article) => {
  assert(
    article.featuredMediaCode,
    `Editorial authoring article ${article.code} must expose a featured media code for Axis and Nexus previews`,
  );
});
const collectMediaCodes = (value, mediaCodes = new Set()) => {
  if (Array.isArray(value)) {
    value.forEach((item) => collectMediaCodes(item, mediaCodes));
    return mediaCodes;
  }
  if (!value || typeof value !== "object") return mediaCodes;
  Object.entries(value).forEach(([key, child]) => {
    if (
      [
        "referenceImageCode",
        "avatarReferenceImageCode",
        "featuredMediaCode",
      ].includes(key) &&
      typeof child === "string" &&
      child
    ) {
      mediaCodes.add(child);
    }
    collectMediaCodes(child, mediaCodes);
  });
  return mediaCodes;
};
const referencedMediaCodes = collectMediaCodes({
  components: Object.values(components).filter(component => component.active !== false),
  editorialArticles,
  testimonials,
});
const assetMediaCodes = new Set(
  mediaAssetManifest.map((asset) => asset.mediaCode),
);
const referenceMediaCodes = new Set(
  mediaReferenceValues.map((reference) => reference.mediaCode),
);
const mediaRecordCodes = new Set(mediaRecordValues.map((media) => media.code));
const componentMediaCodes = new Set(
  componentMediaValues.map((reference) => reference.mediaCode),
);
referencedMediaCodes.forEach((mediaCode) => {
  assert.equal(
    assetMediaCodes.has(mediaCode),
    true,
    `${mediaCode} must have a Nexus backend media asset manifest entry`,
  );
  assert.equal(
    referenceMediaCodes.has(mediaCode),
    true,
    `${mediaCode} must have a Nexus media reference record`,
  );
  assert.equal(
    mediaRecordCodes.has(mediaCode),
    true,
    `${mediaCode} must have a Nexus media object record`,
  );
  assert.equal(
    componentMediaCodes.has(mediaCode),
    true,
    `${mediaCode} must have a Nexus CMS component media binding for Staged-to-Online transfer`,
  );
});
mediaRecordValues.forEach((media) => {
  assert.match(
    media.asset.sourceFile,
    /^content\/assets\/nexus-cms-media\/files\/[A-Za-z0-9._-]+$/,
  );
  assert.equal(
    existsSync(resolve(moduleRoot, "data/sample-v001", media.asset.sourceFile)),
    true,
    `${media.code} must point at a release-owned physical asset`,
  );
});
componentMediaValues.forEach((reference) => {
  assert.notEqual(componentByCode.get(reference.componentCode)?.active, false, "Media must not bind retired components");
  assert(
    componentByCode.has(reference.componentCode),
    `${reference.componentMediaCode} must bind to a Nexus CMS component`,
  );
  assert.equal(
    assetMediaCodes.has(reference.mediaCode),
    true,
    `${reference.componentMediaCode} must point to a backend media asset manifest entry`,
  );
});
const corporateRelease = manifest.sections.nexusCorporateSite;
const editorialRelease = manifest.sections.nexusEditorialSource;
const engagementRelease = manifest.sections.nexusEngagementOperational;
const mediaRelease = manifest.sections.nexusCorporateMediaReferences;
assert.equal(corporateRelease.lifecycle, "PUBLISHABLE");
assert.equal(corporateRelease.destinationRole, "WCMS_STAGED");
assert.equal(corporateRelease.sourceRoot, "sample-v001");
assert.equal(editorialRelease.lifecycle, "PUBLISHABLE");
assert.equal(editorialRelease.destinationRole, "WCMS_STAGED");
assert.equal(editorialRelease.sourceRoot, "sample-v001");
assert.equal(engagementRelease.lifecycle, "OPERATIONAL_VERSIONED");
assert.equal(engagementRelease.destinationRole, "ENGAGEMENT");
assert.equal(engagementRelease.sourceRoot, "sample-v001");
assert.equal(engagementRelease.publicationPolicy, "NONE");
assert.equal(mediaRelease.lifecycle, "PUBLISHABLE");
assert.equal(mediaRelease.destinationRole, "WCMS_STAGED");
assert.equal(mediaRelease.sourceRoot, "sample-v001");
const moduleMetadata = JSON.parse(await readFile(resolve(moduleRoot, 'package.json'), 'utf8'));
assert.equal(moduleMetadata.name, 'nexus.web');
assert.deepEqual(moduleMetadata.nodics.extends, ['nexus']);
const accelerator = JSON.parse(await readFile(resolve(moduleRoot, '../../package.json'), 'utf8'));
assert.equal(accelerator.name, 'nexus');
assert(accelerator.requiredModules.includes('nexus.web'));

for (const release of Object.values(manifest.sections)) {
  for (const [relativePath, expectedHash] of Object.entries(release.files)) {
    assert.equal(
      await sha256(relativePath),
      expectedHash,
      `Manifest hash must match import payload ${relativePath}`,
    );
  }
}
assert(
  Object.keys(corporateRelease.files).every(
    (path) =>
      path.startsWith("sample-v001/content/headers/wcms/") ||
      path.startsWith("sample-v001/content/records/wcms/"),
  ),
  "The corporate release must contain only WCMS content files",
);
assert(
  Object.keys(editorialRelease.files).every(
    (path) =>
      path.startsWith("sample-v001/content/headers/editorial/") ||
      path.startsWith("sample-v001/content/records/editorial/"),
  ),
  "The Editorial release must contain only content authoring files",
);
assert(
  Object.keys(engagementRelease.files).every(
    (path) =>
      path.startsWith("sample-v001/content/headers/engagement/") ||
      path.startsWith("sample-v001/content/records/engagement/"),
  ),
  "The Engagement release must contain only engagement versioned files",
);
assert(
  !JSON.stringify(manifest).includes("nexusEditorialOnlineArticleData"),
  "Expected Online projections must never be runtime-importable manifest data",
);

console.log("Nexus corporate content contract passed.");

for (const anchor of ["products", "solutions"]) {
  assert.equal(
    sharedHeader.properties.navigation.find((item) => item.id === anchor).href,
    `/#${anchor}`,
  );
  assert(
    homepageComponentCodes.some(
      (code) => componentByCode.get(code).properties.anchor === anchor,
    ),
  );
}
assert.equal(
  componentByCode.get("nexusHomeSolutions").properties.href,
  "/solutions",
);
assert.equal(
  componentByCode.get("nexusHomeProducts").properties.href,
  "/products",
);

for (const code of ["nexusHomeSolutions", "nexusSolutionsContent"]) {
  const solution = componentByCode.get(code);
  assert.equal(solution.typeCode, "nexusSolutionsType");
  for (const entry of solution.properties.items) {
    assert(entry.useCases.length > 0 && entry.scope.length > 0);
    assert.equal(entry.href, `/solutions#${entry.code}`);
    assert.equal(entry.flow.length, 4);
  }
}
assert.equal(
  componentByCode.get("nexusSolutionsContent").properties.steps.length,
  4,
);
assert(
  !sharedHeader.properties.navigation.some((item) => item.id === "features"),
);
assert.equal(
  sharedHeader.properties.navigation.find((item) => item.id === "about").href,
  "/#aboutus",
);
assert(
  !sharedHeader.properties.navigation.some((item) => item.children?.length),
);

assert(
  homepageComponentCodes.some(
    (code) => componentByCode.get(code).properties.anchor === "features",
  ),
);
assert(Object.values(routes).some((route) => route.path === "/features"));
