/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const applicationDocumentationContract = require("../../nodics.foundation/modules/nTooling/src/service/defaultApplicationDocumentationContractService.js");
const cataloguePath = path.join(root, "docs/catalogue.json");
const dataRoot = path.join(root, "data/core-v001");
const dataPath = path.join(dataRoot, "records/documentation");
const headerPath = path.join(
  dataRoot,
  "headers/nodicsDocumentationContentPackHeader.js",
);
const manifestPath = path.join(root, "data/manifest.json");
const checkOnly = process.argv.includes("--check");
const generatedOutputDirectories = [
  "data/core-v001/records/documentation/",
  "data/core-v001/headers/",
];
const generatedOutputFiles = ["data/manifest.json"];
const copyrightHeader = `/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

`;

const catalogue = JSON.parse(fs.readFileSync(cataloguePath, "utf8"));
applicationDocumentationContract.validateCatalogue({
  ownerRoot: root,
  sourceDirectory: "docs",
  cataloguePath: "docs/catalogue.json",
  catalogue: {
    pack: "nodics.docs",
    version: catalogue.release,
    navigationSections: catalogue.navigationSections,
    documents: catalogue.documents,
  },
  requireNavigationSections: true,
  requireEnterpriseMetadata: true,
  validateContentQuality: true,
});
const documents = catalogue.documents;

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function slug(value) {
  return String(value)
    .toLowerCase()
    .replace(/[`*_]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function camel(value) {
  return slug(value).replace(/-([a-z0-9])/g, (_, character) =>
    character.toUpperCase(),
  );
}

function wordCount(value) {
  return (value.match(/\b[\p{L}\p{N}][\p{L}\p{N}'’-]*\b/gu) || []).length;
}

function tableCells(line) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function isTableSeparator(line) {
  const cells = tableCells(line);
  return (
    cells.length > 0 &&
    cells.every((cell) => /^:?-{3,}:?$/.test(cell.replace(/\s/g, "")))
  );
}

function imageMimeType(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  if (extension === ".jpg" || extension === ".jpeg") return "image/jpeg";
  if (extension === ".png") return "image/png";
  if (extension === ".gif") return "image/gif";
  if (extension === ".webp") return "image/webp";
  if (extension === ".svg") return "image/svg+xml";
  return undefined;
}

function imageSource(source, contentPath) {
  if (/^(?:https?:\/\/|data:image\/|\/)/.test(source)) return source;
  const candidate = path.join(root, path.dirname(contentPath), source);
  const mimeType = imageMimeType(candidate);
  if (!mimeType || !fs.existsSync(candidate)) return source;
  return `data:${mimeType};base64,${fs.readFileSync(candidate).toString("base64")}`;
}

function markdownBlocks(markdown, pageCode, contentPath) {
  const blocks = [];
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  let pending = [];
  let index = 0;
  let headingIndex = 0;

  const flushParagraph = () => {
    const value = pending.join(" ").trim();
    pending = [];
    if (value) blocks.push({ kind: "paragraph", text: value });
  };

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      flushParagraph();
      const language = trimmed.slice(3).trim() || "text";
      const code = [];
      index += 1;
      while (index < lines.length && !lines[index].trim().startsWith("```")) {
        code.push(lines[index]);
        index += 1;
      }
      blocks.push({
        kind: language === "mermaid" ? "diagram" : "code",
        language,
        text: code.join("\n"),
      });
      index += 1;
      continue;
    }

    const heading = /^(#{1,4})\s+(.+)$/.exec(trimmed);
    if (heading) {
      flushParagraph();
      const level = heading[1].length;
      const text = heading[2].trim();
      if (level > 1) {
        headingIndex += 1;
        blocks.push({
          kind: "heading",
          level,
          text,
          anchor: `${pageCode}-${headingIndex}-${slug(text)}`,
        });
      }
      index += 1;
      continue;
    }

    const image = /^!\[([^\]]*)\]\(([^)\s]+)(?:\s+["']([^"']+)["'])?\)$/.exec(
      trimmed,
    );
    if (image) {
      flushParagraph();
      blocks.push({
        kind: "image",
        alt: image[1] || "Documentation illustration",
        source: imageSource(image[2], contentPath),
        title: image[3] || image[1] || "",
      });
      index += 1;
      continue;
    }

    if (
      trimmed.includes("|") &&
      index + 1 < lines.length &&
      isTableSeparator(lines[index + 1])
    ) {
      flushParagraph();
      const headers = tableCells(trimmed);
      const rows = [];
      index += 2;
      while (index < lines.length && lines[index].trim().includes("|")) {
        rows.push(tableCells(lines[index]));
        index += 1;
      }
      blocks.push({ kind: "table", headers, rows });
      continue;
    }

    const unordered = /^[-*]\s+(.+)$/.exec(trimmed);
    if (unordered) {
      flushParagraph();
      const items = [unordered[1]];
      index += 1;
      while (index < lines.length && lines[index].trim()) {
        const current = lines[index].trim();
        const item = /^[-*]\s+(.+)$/.exec(current);
        if (item) {
          items.push(item[1]);
          index += 1;
          continue;
        }
        if (
          /^(#{1,4})\s+/.test(current) ||
          /^\d+\.\s+/.test(current) ||
          current.startsWith("```") ||
          current.startsWith(">") ||
          /^!\[/.test(current)
        ) {
          break;
        }
        items[items.length - 1] += ` ${current}`;
        index += 1;
      }
      blocks.push({ kind: "unordered-list", items });
      continue;
    }

    const ordered = /^\d+\.\s+(.+)$/.exec(trimmed);
    if (ordered) {
      flushParagraph();
      const items = [ordered[1]];
      index += 1;
      while (index < lines.length && lines[index].trim()) {
        const current = lines[index].trim();
        const item = /^\d+\.\s+(.+)$/.exec(current);
        if (item) {
          items.push(item[1]);
          index += 1;
          continue;
        }
        if (
          /^(#{1,4})\s+/.test(current) ||
          /^[-*]\s+/.test(current) ||
          current.startsWith("```") ||
          current.startsWith(">") ||
          /^!\[/.test(current)
        ) {
          break;
        }
        items[items.length - 1] += ` ${current}`;
        index += 1;
      }
      blocks.push({ kind: "ordered-list", items });
      continue;
    }

    if (trimmed.startsWith(">")) {
      flushParagraph();
      const quote = [];
      while (index < lines.length && lines[index].trim().startsWith(">")) {
        quote.push(lines[index].trim().replace(/^>\s?/, ""));
        index += 1;
      }
      blocks.push({ kind: "blockquote", text: quote.join(" ").trim() });
      continue;
    }

    if (!trimmed) {
      flushParagraph();
      index += 1;
      continue;
    }

    pending.push(trimmed);
    index += 1;
  }

  flushParagraph();
  return blocks;
}

async function writeOrCheck(relativePath, content) {
  const normalizedPath = relativePath.replace(/\\/g, "/");
  const allowed =
    generatedOutputFiles.includes(normalizedPath) ||
    generatedOutputDirectories.some((directory) =>
      normalizedPath.startsWith(directory),
    );
  if (!allowed) {
    throw new Error(
      `Refusing to write non-generated documentation source: ${relativePath}`,
    );
  }
  const target = path.join(root, relativePath);
  if (checkOnly) {
    const current = fs.existsSync(target)
      ? fs.readFileSync(target, "utf8")
      : null;
    if (current !== content)
      throw new Error(`${relativePath} is not generated`);
    return;
  }
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
}

function jsModule(description, value) {
  return `${copyrightHeader}'use strict';\n\n/** @description ${description} */\nmodule.exports = ${JSON.stringify(value, omitUnsetFields, 2)};\n`;
}

function omitUnsetFields(_key, value) {
  return value === null ? undefined : value;
}

const defaultAudience = ["architect", "developer", "operator"];
const defaultSectionTitle = (document) =>
  document.functionalModule.replace(/^nodics\./, "Nodics ");
const sectionEntries = new Map();
(catalogue.navigationSections || []).forEach((section, index) => {
  const title = section.title;
  const code = section.code || slug(title);
  if (!title || !code) {
    throw new Error(
      `Invalid documentation navigation section at index ${index}`,
    );
  }
  sectionEntries.set(code, {
    code,
    title,
    order: section.order || (index + 1) * 10,
    summary: section.summary || "",
    audience: section.audience || defaultAudience,
    visibility: section.visibility || "public",
    accessMode: section.accessMode || "PUBLIC",
    lifecycleState: section.lifecycleState || "ONLINE",
  });
});
documents.forEach((document, index) => {
  const title = document.navigationSection || defaultSectionTitle(document);
  const code = document.navigationSectionCode || slug(title);
  if (!sectionEntries.has(code)) {
    sectionEntries.set(code, {
      code,
      title,
      order: document.navigationSectionOrder || (index + 1) * 10,
      summary: document.navigationSectionSummary || "",
      audience: document.audience || defaultAudience,
      visibility: document.visibility || "public",
      accessMode: document.accessMode || "PUBLIC",
      lifecycleState: document.lifecycleState || "ONLINE",
    });
  }
});
const sections = [...sectionEntries.values()].sort(
  (left, right) =>
    left.order - right.order || left.title.localeCompare(right.title),
);
const routeFor = (document, index) => {
  const route =
    document.route ||
    (index === 0
      ? "/docs/framework"
      : `/docs/framework/${slug(document.id.replace(/\./g, "-"))}`);
  if (!/^\/docs\/framework(?:\/[a-z0-9-]+)*$/.test(route)) {
    throw new Error(`Invalid framework documentation route: ${route}`);
  }
  return route;
};
const sourcePages = documents.map((document, index) => {
  const markdown = fs.readFileSync(path.join(root, document.content), "utf8");
  const sectionTitle =
    document.navigationSection || defaultSectionTitle(document);
  const sectionCode = document.navigationSectionCode || slug(sectionTitle);
  const section = sections.find((item) => item.code === sectionCode);
  const recordIdentity = document.recordCode || document.id;
  const blocks = markdownBlocks(
    markdown,
    camel(recordIdentity),
    document.content,
  );
  const documentHeadings = blocks
    .filter((block) => block.kind === "heading")
    .map((block) => ({
      text: block.text,
      anchor: block.anchor,
      level: block.level,
    }));
  return {
    ...document,
    markdown,
    blocks,
    headings: documentHeadings,
    route: routeFor(document, index),
    section,
    codeSuffix: camel(recordIdentity),
  };
});

function documentationPageSort(left, right) {
  return (
    (left.navigationGroupOrder || 100) - (right.navigationGroupOrder || 100) ||
    String(left.navigationGroup || left.section.title).localeCompare(
      String(right.navigationGroup || right.section.title),
    ) ||
    (left.navigationOrder || 100) - (right.navigationOrder || 100) ||
    left.title.localeCompare(right.title)
  );
}

const sectionPageOrder = new Map();
sections.forEach((section) => {
  sourcePages
    .filter((document) => document.section.code === section.code)
    .sort(documentationPageSort)
    .forEach((document, index) => {
      sectionPageOrder.set(document.id, (index + 1) * 10);
    });
});

function twoLevelNavigationOrder(document, fallbackIndex = 0) {
  return sectionPageOrder.get(document.id) || (fallbackIndex + 1) * 10;
}

const navigationItems = sourcePages.map((document, index) => ({
  code: document.id,
  title: document.title,
  route: document.route,
  section: document.section.code,
  sectionTitle: document.section.title,
  sectionOrder: document.section.order,
  group: document.section.code,
  groupTitle: document.section.title,
  groupOrder: document.section.order,
  subgroup: null,
  subgroupTitle: null,
  order: twoLevelNavigationOrder(document, index),
  parentId: document.section.code,
  hierarchyPath: [document.section.title, document.title],
  hierarchyDepth: 2,
  documentType: document.documentType || "overview",
  audience: document.audience || defaultAudience,
  businessAudience: document.businessAudience || [],
  technicalAudience: document.technicalAudience || [],
  summary: document.summary,
  visibility: document.visibility || "public",
  accessMode: document.accessMode || "PUBLIC",
  publiclyAvailable: document.publiclyAvailable !== false,
  requiresAuthentication: Boolean(document.requiresAuthentication),
  allowedRoles: document.allowedRoles || [],
  allowedGroups: document.allowedGroups || [],
  allowedPermissions: document.allowedPermissions || [],
  lifecycleState: document.lifecycleState || "ONLINE",
  maturityState: document.maturityState || "operational",
  implementationState: document.implementationState || "current",
  relatedPages: document.relatedPages || [],
  searchKeywords: document.searchKeywords || [],
  topicKeywords: document.topicKeywords || [],
  searchText: `${document.title} ${document.summary} ${document.markdown}`,
}));

function boundedCode(prefix, parts) {
  const raw = `${prefix}${parts.map((part) => camel(part)).join("")}`;
  if (raw.length <= 120) return raw;
  return `${raw.slice(0, 96)}${sha256(parts.join(":")).slice(0, 16)}`;
}

function schemaMaturity(value) {
  const normalized = String(value || "").toLowerCase();
  if (normalized.includes("reference")) return "REFERENCE";
  if (normalized.includes("planned")) return "PLANNED";
  if (normalized.includes("roadmap")) return "ROADMAP";
  return "IMPLEMENTED";
}

function pageCode(document) {
  return `nodicsDocsPage${document.codeSuffix}`;
}

function routeCode(document) {
  return `nodicsDocsRoute${document.codeSuffix}`;
}

function articleCode(document) {
  return `nodicsDocsComponent${document.codeSuffix}`;
}

function metadataPageCode(document) {
  return `nodicsDocsMetadata${document.codeSuffix}`;
}

const productCode = "nodicsDocumentationProduct";
const navigationCode = "nodicsDocumentationNavigation";
const rootNodeCode = "nodicsDocsNodeRoot";
const defaultLifecycle = "ONLINE";
const publicAccessPolicyCode = "nodicsDocsAccessPublic";
const authenticatedAccessPolicyCode = "nodicsDocsAccessAuthenticated";
const authoringPermissionsByTargetType = {
  PRODUCT: ["documentation.draft.update"],
  NAVIGATION: ["documentation.navigation.update"],
  NODE: ["documentation.navigation.update"],
  PAGE: ["documentation.draft.update"],
  DASHBOARD: ["documentation.dashboard.update"],
  SEARCH_METADATA: ["documentation.search.preview"],
  ACCESS_POLICY: ["documentation.accessPolicy.update"],
};
const workflowTriggersByTargetType = {
  PRODUCT: ["CONTENT_CHANGE", "ACCESS_POLICY_CHANGE"],
  NAVIGATION: ["NAVIGATION_CHANGE"],
  NODE: ["NAVIGATION_CHANGE", "DASHBOARD_CHANGE", "ACCESS_POLICY_CHANGE"],
  PAGE: ["CONTENT_CHANGE", "ACCESS_POLICY_CHANGE", "SOURCE_EVIDENCE_CHANGE"],
  DASHBOARD: ["DASHBOARD_CHANGE"],
  SEARCH_METADATA: ["SEARCH_METADATA_CHANGE"],
  ACCESS_POLICY: ["ACCESS_POLICY_CHANGE"],
};
const publicationDecisionPolicy = {
  reviewPermission: "documentation.review",
  approvePermission: "documentation.approve",
  publishPermission: "documentation.publish",
  permissionEnforced: true,
  adminOverrideAudited: true,
};
function workflowMetadata(targetType) {
  return {
    managedInAxis: true,
    axisAuthoringPermissions: authoringPermissionsByTargetType[targetType] || [
      "axis.documentation.read",
    ],
    workflowRequired: true,
    workflowTriggers: workflowTriggersByTargetType[targetType] || [
      "CONTENT_CHANGE",
    ],
  };
}
const accessPolicyRecords = {
  record0: {
    code: publicAccessPolicyCode,
    name: "Public documentation access",
    targetType: "PRODUCT",
    targetCode: productCode,
    accessMode: "PUBLIC",
    publiclyAvailable: true,
    requiresAuthentication: false,
    allowedRoles: [],
    allowedGroups: [],
    allowedPermissions: [],
    lifecycleVisibility: ["ONLINE"],
    ...workflowMetadata("ACCESS_POLICY"),
    priority: 10,
    active: true,
  },
  record1: {
    code: authenticatedAccessPolicyCode,
    name: "Authenticated documentation access",
    targetType: "PRODUCT",
    targetCode: productCode,
    accessMode: "AUTHENTICATED",
    publiclyAvailable: false,
    requiresAuthentication: true,
    allowedRoles: [],
    allowedGroups: [],
    allowedPermissions: [],
    lifecycleVisibility: ["ONLINE"],
    ...workflowMetadata("ACCESS_POLICY"),
    priority: 20,
    active: true,
  },
};
const accessPolicyFor = (item) =>
  (item && item.accessMode) === "PUBLIC"
    ? publicAccessPolicyCode
    : authenticatedAccessPolicyCode;

const productRecords = {
  record0: {
    code: productCode,
    name: "Nodics Documentation",
    description:
      "Business-friendly and developer-ready framework documentation rendered from a governed documentation content catalog.",
    contentCatalog: "documentationContentCatalog",
    site: "nodicsDocumentationSite",
    publicRootPath: "/docs/framework",
    defaultLocale: "en",
    channels: ["axis", "nexus", "web"],
    ownerFunctionalModule: "nodics.docs",
    audience: [
      "business",
      "architect",
      "administrator",
      "developer",
      "operator",
      "qa",
      "ai-tool",
    ],
    ...workflowMetadata("PRODUCT"),
    accessMode: "PUBLIC",
    lifecycleState: defaultLifecycle,
    maturityState: "IMPLEMENTED",
    active: true,
  },
};

const sectionNodeCodes = new Map();
const nodeRecords = [];
const dashboardRecords = [];

function pushDashboard(record) {
  dashboardRecords.push({
    ...record,
    product: productCode,
    accessPolicy: accessPolicyFor(record),
    accessMode: record.accessMode || "PUBLIC",
    lifecycleState: record.lifecycleState || defaultLifecycle,
    ...workflowMetadata("DASHBOARD"),
    active: true,
  });
}

pushDashboard({
  code: "nodicsDocsDashboardProduct",
  ownerType: "PRODUCT",
  ownerCode: productCode,
  title: "Nodics Documentation",
  summary:
    "Detailed landing content for the full Nodics documentation catalogue, including framework, application-suite, business capability, operations, publication, AI tooling, and reference journeys.",
  contentArea: {
    intent:
      "Help every reader choose the correct business or technical documentation journey before opening detailed pages.",
  },
  cards: sections.map((section) => ({
    code: section.code,
    title: section.title,
    summary: section.summary,
    order: section.order,
  })),
  journeyLinks: [
    { label: "Business user journey", targetNode: "documentation-roadmap" },
    {
      label: "Developer journey",
      targetNode: "developer-extension-and-project-customization",
    },
    {
      label: "Operations journey",
      targetNode: "operations-monitoring-and-recovery",
    },
  ],
  statusSummary: {
    sections: sections.length,
    pages: sourcePages.length,
    lifecycleState: defaultLifecycle,
  },
});

pushDashboard({
  code: "nodicsDocsDashboardNavigation",
  ownerType: "NAVIGATION",
  ownerCode: navigationCode,
  title: "Nodics Documentation Navigation",
  summary:
    "Expandable and searchable documentation navigation generated from backend content-catalog metadata, with section dashboards and page-level access controls.",
  contentArea: {
    navigationPattern:
      "Sections and page links are backend records that Axis can manage and render without hardcoded frontend menus.",
  },
  cards: sections.map((section) => ({
    code: section.code,
    title: section.title,
    summary: section.summary,
    order: section.order,
  })),
  journeyLinks: [
    {
      label: "Documentation Management",
      targetNode: "documentation-management",
    },
    {
      label: "Release, Staging, and Publication",
      targetNode: "release-staging-and-publication",
    },
  ],
  statusSummary: {
    sections: sections.length,
    pages: sourcePages.length,
    searchable: true,
    expandable: true,
  },
});

nodeRecords.push({
  code: rootNodeCode,
  product: productCode,
  navigation: navigationCode,
  nodeLevel: "SECTION",
  nodeType: "CONTAINER",
  nodeTitle: "Nodics Documentation",
  nodeSummary:
    "Root documentation node that owns every business-friendly framework, application, capability, operations, publication, tooling, and reference section.",
  nodeContentArea: {
    dashboard: "nodicsDocsDashboardProduct",
    purpose:
      "Give Axis and Nexus a backend-owned root for expandable documentation navigation.",
  },
  nodeDashboard: "nodicsDocsDashboardProduct",
  childSummaryCards: sections.map((section) => ({
    code: section.code,
    title: section.title,
    summary: section.summary,
    order: section.order,
  })),
  childJourneyLinks: [],
  childStatusSummary: {
    childCount: sections.length,
    pages: sourcePages.length,
  },
  nodeOrder: 10,
  expandable: true,
  expandedByDefault: true,
  nodeIcon: "book-open",
  nodeAudience: [
    "business",
    "architect",
    "administrator",
    "developer",
    "operator",
    "qa",
    "ai-tool",
  ],
  accessPolicy: publicAccessPolicyCode,
  accessMode: "PUBLIC",
  allowedRoles: [],
  allowedGroups: [],
  allowedPermissions: [],
  ...workflowMetadata("NODE"),
  lifecycleState: defaultLifecycle,
  maturityState: "IMPLEMENTED",
  searchKeywords: ["nodics", "documentation", "framework"],
  relatedNodes: [],
  locale: "en",
  channel: "web",
  active: true,
});

sections.forEach((section) => {
  const sectionNodeCode = boundedCode("nodicsDocsNodeSec", [section.code]);
  sectionNodeCodes.set(section.code, sectionNodeCode);
  const sectionPages = sourcePages.filter(
    (document) => document.section.code === section.code,
  );
  const sortedSectionPages = [...sectionPages].sort(documentationPageSort);
  const dashboardCode = boundedCode("nodicsDocsDashboardSec", [section.code]);

  pushDashboard({
    code: dashboardCode,
    ownerType: "SECTION",
    ownerCode: sectionNodeCode,
    title: section.title,
    summary: section.summary,
    contentArea: {
      businessPurpose: section.summary,
      technicalPurpose:
        "This section is a backend documentation node with direct page links, search metadata, access policy, and publication lifecycle state.",
    },
    cards: sortedSectionPages.map((document) => ({
      code: document.id,
      title: document.title,
      summary: document.summary,
      order: twoLevelNavigationOrder(document),
    })),
    journeyLinks: sortedSectionPages.slice(0, 6).map((document) => ({
      label: document.title,
      targetPage: document.id,
      route: document.route,
    })),
    statusSummary: { pages: sectionPages.length, navigationDepth: 2 },
    accessMode: section.accessMode || "PUBLIC",
    lifecycleState: section.lifecycleState || defaultLifecycle,
  });

  nodeRecords.push({
    code: sectionNodeCode,
    product: productCode,
    navigation: navigationCode,
    parentNode: rootNodeCode,
    nodeLevel: "SECTION",
    nodeType: sectionPages.length ? "CONTAINER" : "PAGE_LINK",
    nodeTitle: section.title,
    nodeSummary: section.summary,
    nodeContentArea: {
      dashboard: dashboardCode,
      navigationDepth: 2,
      pages: sortedSectionPages.map((document) => document.id),
    },
    nodeDashboard: dashboardCode,
    childSummaryCards: sortedSectionPages.map((document) => ({
      code: document.id,
      title: document.title,
      summary: document.summary,
      order: twoLevelNavigationOrder(document),
    })),
    childJourneyLinks: sortedSectionPages.slice(0, 6).map((document) => ({
      label: document.title,
      targetPage: document.id,
      route: document.route,
    })),
    childStatusSummary: {
      childCount: sectionPages.length,
      pages: sectionPages.length,
    },
    nodeOrder: section.order,
    expandable: true,
    expandedByDefault: false,
    nodeIcon: "folder",
    nodeAudience: section.audience || defaultAudience,
    accessPolicy: accessPolicyFor(section),
    accessMode: section.accessMode || "PUBLIC",
    allowedRoles: [],
    allowedGroups: [],
    allowedPermissions: [],
    ...workflowMetadata("NODE"),
    lifecycleState: section.lifecycleState || defaultLifecycle,
    maturityState: "IMPLEMENTED",
    searchKeywords: [section.code, section.title],
    relatedNodes: [],
    locale: "en",
    channel: "web",
    active: true,
  });
});

sourcePages.forEach((document, index) => {
  const sectionCode = document.section.code;
  nodeRecords.push({
    code: boundedCode("nodicsDocsNodePage", [document.id]),
    product: productCode,
    navigation: navigationCode,
    parentNode: sectionNodeCodes.get(sectionCode),
    nodeLevel: "PAGE_LINK",
    nodeType: "PAGE",
    nodeTitle: document.title,
    nodeSummary: document.summary,
    nodeContentArea: {
      route: document.route,
      documentType: document.documentType,
      businessAudience: document.businessAudience || [],
      technicalAudience: document.technicalAudience || [],
    },
    childSummaryCards: [],
    childJourneyLinks: [],
    childStatusSummary: { childCount: 0 },
    targetDocumentationPage: metadataPageCode(document),
    targetPage: pageCode(document),
    targetRoute: routeCode(document),
    nodeOrder: 10000 + twoLevelNavigationOrder(document, index),
    expandable: false,
    expandedByDefault: false,
    nodeIcon: "file-text",
    nodeAudience: document.audience || defaultAudience,
    accessPolicy: accessPolicyFor(document),
    accessMode: document.accessMode || "PUBLIC",
    allowedRoles: document.allowedRoles || [],
    allowedGroups: document.allowedGroups || [],
    allowedPermissions: document.allowedPermissions || [],
    ...workflowMetadata("NODE"),
    lifecycleState: document.lifecycleState || defaultLifecycle,
    maturityState: schemaMaturity(document.maturityState),
    searchKeywords: document.searchKeywords || [],
    relatedNodes: (document.relatedPages || []).map((relatedPage) =>
      boundedCode("nodicsDocsNodePage", [relatedPage]),
    ),
    locale: document.locale || "en",
    channel: "web",
    active: true,
  });
});

const navigationRecords = {
  record0: {
    code: navigationCode,
    product: productCode,
    name: "Nodics Documentation Navigation",
    renderer: "documentation.component.navigation",
    searchLabel: "Search framework documentation",
    searchPlaceholder: "Search documentation",
    emptyMessage: "No framework documentation matches your search.",
    expandable: true,
    accessMode: "PUBLIC",
    lifecycleState: defaultLifecycle,
    ...workflowMetadata("NAVIGATION"),
    active: true,
  },
};

const legacyNavigationCleanupRecords = {
  record0: {
    code: "nodicsDocumentationLegacyNavigationCleanup",
    reason:
      "Remove generated multi-level navigation containers before importing the two-level section and page-link hierarchy.",
    active: true,
  },
};

const dashboardRecordMap = Object.fromEntries(
  dashboardRecords.map((record, index) => [`record${index}`, record]),
);
const nodeRecordMap = Object.fromEntries(
  nodeRecords.map((record, index) => [`record${index}`, record]),
);

const pageMetadataRecords = Object.fromEntries(
  sourcePages.map((document, index) => [
    `record${index}`,
    {
      code: metadataPageCode(document),
      product: productCode,
      documentId: document.id,
      title: document.title,
      summary: document.summary,
      businessSummary: `${document.title} explains the business purpose, supported decisions, operational impact, and controls for the ${document.navigationGroup || document.section.title} journey.`,
      technicalSummary: `${document.title} records owning module ${document.functionalModule}, technical module ${document.technicalModule || "n/a"}, source path ${document.sourcePath || document.content}, extension points, validation, and troubleshooting evidence.`,
      ownerFunctionalModule: document.functionalModule,
      technicalModule: document.technicalModule || null,
      targetPage: pageCode(document),
      targetRoute: routeCode(document),
      articleComponent: articleCode(document),
      template: "nodicsDocumentationArticleTemplate",
      searchMetadata: boundedCode("nodicsDocsSearch", [
        "PAGE",
        metadataPageCode(document),
      ]),
      headings: document.headings,
      diagrams: document.blocks
        .filter((block) => block.kind === "diagram")
        .map((block) => ({
          language: block.language,
          anchor: block.anchor || null,
        })),
      visualAssets: document.blocks
        .filter((block) => block.kind === "image" || block.kind === "table")
        .map((block) => ({
          kind: block.kind,
          title: block.title || block.headers?.join(", ") || document.title,
        })),
      visualRequirements: document.visualRequirements || [],
      relatedPages: document.relatedPages || [],
      sourceRepository: "nodics.docs",
      sourcePath: document.sourcePath || document.content,
      sourceChecksum: sha256(document.markdown),
      sourceWordCount: wordCount(document.markdown),
      audience: document.audience || defaultAudience,
      ...workflowMetadata("PAGE"),
      accessPolicy: accessPolicyFor(document),
      accessMode: document.accessMode || "PUBLIC",
      lifecycleState: document.lifecycleState || defaultLifecycle,
      maturityState: schemaMaturity(document.maturityState),
      active: true,
    },
  ]),
);

const publicationTargets = [
  { type: "PRODUCT", code: productCode, lifecycleState: defaultLifecycle },
  {
    type: "NAVIGATION",
    code: navigationCode,
    lifecycleState: defaultLifecycle,
  },
  ...Object.values(accessPolicyRecords).map((record) => ({
    type: "ACCESS_POLICY",
    code: record.code,
    lifecycleState: defaultLifecycle,
  })),
  ...nodeRecords.map((record) => ({
    type: "NODE",
    code: record.code,
    lifecycleState: record.lifecycleState,
  })),
  ...dashboardRecords.map((record) => ({
    type: "DASHBOARD",
    code: record.code,
    lifecycleState: record.lifecycleState,
  })),
  ...sourcePages.map((document) => ({
    type: "PAGE",
    code: metadataPageCode(document),
    lifecycleState: document.lifecycleState || defaultLifecycle,
  })),
];
const publicationStateRecords = Object.fromEntries(
  publicationTargets.map((target, index) => [
    `record${index}`,
    {
      code: boundedCode("nodicsDocsPublication", [target.type, target.code]),
      targetType: target.type,
      targetCode: target.code,
      lifecycleState: target.lifecycleState || defaultLifecycle,
      publicationCode: "nodicsDocumentation",
      workflowReference: "nodicsDocumentationReviewWorkflow",
      stagedVersion: catalogue.release,
      ...(target.lifecycleState === "ONLINE"
        ? { onlineVersion: catalogue.release }
        : {}),
      validationResult: {
        generated: true,
        sourceAuthority: "docs/catalogue.json",
        publicationPath: "STAGED_REVIEW_APPROVAL_ONLINE",
        nexusVisibleOnlyWhenOnlineAndPublic: true,
      },
      checksum: sha256(
        `${target.type}:${target.code}:${target.lifecycleState || defaultLifecycle}:${catalogue.release}`,
      ),
      ...workflowMetadata(target.type),
      decisionPolicy: publicationDecisionPolicy,
      actor: "nodics.docs.generator",
      author: "nodics.docs.generator",
      reviewer: "nodics.docs.generator",
      approver: "nodics.docs.generator",
      publisher: "nodics.docs.generator",
      auditTrail: [],
      active: true,
    },
  ]),
);

const searchTargets = [
  {
    targetType: "PRODUCT",
    targetCode: productCode,
    title: "Nodics Documentation",
    summary: productRecords.record0.description,
    searchText: `${productRecords.record0.name} ${productRecords.record0.description}`,
    keywords: ["nodics", "documentation", "framework"],
    facets: {
      audience: productRecords.record0.audience,
      lifecycleState: defaultLifecycle,
    },
    accessMode: "PUBLIC",
    lifecycleState: defaultLifecycle,
  },
  {
    targetType: "NAVIGATION",
    targetCode: navigationCode,
    title: navigationRecords.record0.name,
    summary: navigationRecords.record0.searchPlaceholder,
    searchText: `${navigationRecords.record0.name} ${navigationRecords.record0.searchLabel} ${navigationRecords.record0.searchPlaceholder}`,
    keywords: ["navigation", "hierarchy", "expandable", "search"],
    facets: { documentType: "navigation", lifecycleState: defaultLifecycle },
    accessMode: navigationRecords.record0.accessMode || "PUBLIC",
    lifecycleState:
      navigationRecords.record0.lifecycleState || defaultLifecycle,
  },
  ...nodeRecords.map((node) => ({
    targetType: "NODE",
    targetCode: node.code,
    title: node.nodeTitle,
    summary: node.nodeSummary,
    searchText: `${node.nodeTitle} ${node.nodeSummary} ${(node.searchKeywords || []).join(" ")}`,
    keywords: node.searchKeywords || [node.nodeTitle],
    facets: {
      nodeLevel: node.nodeLevel,
      nodeType: node.nodeType,
      audience: node.nodeAudience || defaultAudience,
    },
    accessMode: node.accessMode || "PUBLIC",
    lifecycleState: node.lifecycleState || defaultLifecycle,
  })),
  ...dashboardRecords.map((dashboard) => ({
    targetType: "DASHBOARD",
    targetCode: dashboard.code,
    title: dashboard.title,
    summary: dashboard.summary,
    searchText: `${dashboard.title} ${dashboard.summary}`,
    keywords: [dashboard.ownerType, dashboard.ownerCode, dashboard.title],
    facets: {
      ownerType: dashboard.ownerType,
      ownerCode: dashboard.ownerCode,
    },
    accessMode: dashboard.accessMode || "PUBLIC",
    lifecycleState: dashboard.lifecycleState || defaultLifecycle,
  })),
  ...sourcePages.map((document) => ({
    targetType: "PAGE",
    targetCode: metadataPageCode(document),
    title: document.title,
    summary: document.summary,
    searchText: `${document.title} ${document.summary} ${document.markdown}`,
    keywords: [
      ...(document.searchKeywords || []),
      ...(document.topicKeywords || []),
    ],
    facets: {
      section: document.section.code,
      group: document.section.code,
      navigationDepth: 2,
      documentType: document.documentType,
      audience: document.audience || defaultAudience,
      maturityState: document.maturityState || "operational",
    },
    accessMode: document.accessMode || "PUBLIC",
    lifecycleState: document.lifecycleState || defaultLifecycle,
  })),
];
const searchMetadataRecords = Object.fromEntries(
  searchTargets.map((target, index) => [
    `record${index}`,
    {
      code: boundedCode("nodicsDocsSearch", [
        target.targetType,
        target.targetCode,
      ]),
      product: productCode,
      targetType: target.targetType,
      targetCode: target.targetCode,
      title: target.title,
      summary: target.summary,
      searchText: target.searchText,
      keywords: target.keywords,
      facets: target.facets,
      ...workflowMetadata("SEARCH_METADATA"),
      locale: "en",
      channel: "web",
      accessPolicy:
        target.accessMode === "PUBLIC"
          ? publicAccessPolicyCode
          : authenticatedAccessPolicyCode,
      accessMode: target.accessMode,
      lifecycleState: target.lifecycleState,
      indexState: "INDEX_READY",
      active: true,
    },
  ]),
);
Object.assign(
  publicationStateRecords,
  Object.fromEntries(
    Object.values(searchMetadataRecords).map((record, index) => [
      `record${publicationTargets.length + index}`,
      {
        code: boundedCode("nodicsDocsPublication", [
          "SEARCH_METADATA",
          record.code,
        ]),
        targetType: "SEARCH_METADATA",
        targetCode: record.code,
        lifecycleState: record.lifecycleState || defaultLifecycle,
        publicationCode: "nodicsDocumentation",
        workflowReference: "nodicsDocumentationReviewWorkflow",
        stagedVersion: catalogue.release,
        ...(record.lifecycleState === "ONLINE"
          ? { onlineVersion: catalogue.release }
          : {}),
        validationResult: {
          generated: true,
          sourceAuthority: "docs/catalogue.json",
          publicationPath: "STAGED_REVIEW_APPROVAL_ONLINE",
          nexusVisibleOnlyWhenOnlineAndPublic: true,
        },
        checksum: sha256(
          `SEARCH_METADATA:${record.code}:${record.lifecycleState || defaultLifecycle}:${catalogue.release}`,
        ),
        ...workflowMetadata("SEARCH_METADATA"),
        decisionPolicy: publicationDecisionPolicy,
        actor: "nodics.docs.generator",
        author: "nodics.docs.generator",
        reviewer: "nodics.docs.generator",
        approver: "nodics.docs.generator",
        publisher: "nodics.docs.generator",
        auditTrail: [],
        active: true,
      },
    ]),
  ),
);
const navigationComponent = {
  record0: {
    code: "nodicsDocumentationNavigation",
    typeCode: "nodicsDocumentationNavigationComponentType",
    renderer: "documentation.component.navigation",
    accessMode: "PUBLIC",
    properties: {
      title: "Nodics Framework",
      searchLabel: "Search framework documentation",
      searchPlaceholder: "Search documentation",
      emptyMessage: "No framework documentation matches your search.",
      sections,
      items: navigationItems,
    },
    active: true,
  },
};
const articleComponents = Object.fromEntries(
  sourcePages.map((document, index) => [
    `record${index + 1}`,
    {
      code: `nodicsDocsComponent${document.codeSuffix}`,
      typeCode: "nodicsDocumentationArticleComponentType",
      renderer: "documentation.component.article",
      accessMode: "PUBLIC",
      properties: {
        code: document.id,
        title: document.title,
        route: document.route,
        section: document.section.code,
        sectionTitle: document.section.title,
        group: document.section.code,
        groupTitle: document.section.title,
        subgroup: null,
        subgroupTitle: null,
        parentId: document.section.code,
        hierarchyPath: [document.section.title, document.title],
        hierarchyDepth: 2,
        documentType: document.documentType || "overview",
        audience: document.audience || defaultAudience,
        businessAudience: document.businessAudience || [],
        technicalAudience: document.technicalAudience || [],
        summary: document.summary,
        visibility: document.visibility || "public",
        accessMode: document.accessMode || "PUBLIC",
        publiclyAvailable: document.publiclyAvailable !== false,
        requiresAuthentication: Boolean(document.requiresAuthentication),
        allowedRoles: document.allowedRoles || [],
        allowedGroups: document.allowedGroups || [],
        allowedPermissions: document.allowedPermissions || [],
        lifecycleState: document.lifecycleState || "ONLINE",
        version: document.version || catalogue.release,
        maturityState: document.maturityState || "operational",
        implementationState: document.implementationState || "current",
        renderingComponent:
          document.renderingComponent || "documentation.component.article",
        relatedPages: document.relatedPages || [],
        sourceEvidence: document.sourceEvidence || [],
        visualRequirements: document.visualRequirements || [],
        searchKeywords: document.searchKeywords || [],
        topicKeywords: document.topicKeywords || [],
        headings: document.headings,
        blocks: document.blocks,
        searchText: `${document.title} ${document.summary} ${document.markdown}`,
        previous:
          index > 0
            ? {
                title: sourcePages[index - 1].title,
                route: sourcePages[index - 1].route,
              }
            : null,
        next:
          index < sourcePages.length - 1
            ? {
                title: sourcePages[index + 1].title,
                route: sourcePages[index + 1].route,
              }
            : null,
        source: {
          repository: "nodics.docs",
          functionalModule: document.functionalModule,
          technicalModule: document.technicalModule || null,
          owner: document.sourceOwner || "nodics.docs",
          sourcePath: document.sourcePath || document.content,
          path: document.content,
          wordCount: wordCount(document.markdown),
          checksum: sha256(document.markdown),
        },
      },
      active: true,
    },
  ]),
);
const componentRecords = { ...navigationComponent, ...articleComponents };

const pageRecords = Object.fromEntries(
  sourcePages.map((document, index) => [
    `record${index}`,
    {
      code: `nodicsDocsPage${document.codeSuffix}`,
      name: document.title,
      cmsSite: ["nodicsDocumentationSite"],
      typeCode: "nodicsDocumentationArticlePageType",
      template: "nodicsDocumentationArticleTemplate",
      renderer: "documentation.page.article",
      cmsComponents: [
        {
          target: "nodicsDocumentationNavigation",
          slot: "navigation",
          index: 5,
          active: true,
        },
        {
          target: `nodicsDocsComponent${document.codeSuffix}`,
          slot: "article",
          index: 10,
          active: true,
        },
      ],
      active: true,
    },
  ]),
);
const routeRecords = Object.fromEntries(
  sourcePages.map((document, index) => [
    `record${index}`,
    {
      code: `nodicsDocsRoute${document.codeSuffix}`,
      site: "nodicsDocumentationSite",
      path: document.route,
      locale: document.locale || "en",
      channel: "web",
      page: `nodicsDocsPage${document.codeSuffix}`,
      routeType: "PAGE",
      deliveryState: "ONLINE",
      accessMode: document.accessMode || "PUBLIC",
      active: true,
    },
  ]),
);

const files = {
  "data/core-v001/records/documentation/nodicsDocumentationSiteData.js":
    jsModule("Nodics framework documentation site.", {
      record0: {
        code: "nodicsDocumentationSite",
        name: "Nodics Documentation",
        catalog: "documentationContentCatalog",
        active: true,
      },
    }),
  "data/core-v001/records/documentation/nodicsDocumentationProductData.js":
    jsModule(
      "Generated Nodics framework documentation product catalogue metadata.",
      productRecords,
    ),
  "data/core-v001/records/documentation/nodicsDocumentationAccessPolicyData.js":
    jsModule(
      "Generated Nodics framework documentation access policies.",
      accessPolicyRecords,
    ),
  "data/core-v001/records/documentation/nodicsDocumentationNavigationData.js":
    jsModule(
      "Generated Nodics framework documentation navigation catalogue metadata.",
      navigationRecords,
    ),
  "data/core-v001/records/documentation/nodicsDocumentationDashboardData.js":
    jsModule(
      "Generated Nodics framework documentation hierarchy dashboards.",
      dashboardRecordMap,
    ),
  "data/core-v001/records/documentation/nodicsDocumentationLegacyNavigationCleanupData.js":
    jsModule(
      "Generated cleanup marker for retired multi-level documentation navigation records.",
      legacyNavigationCleanupRecords,
    ),
  "data/core-v001/records/documentation/nodicsDocumentationNodeData.js":
    jsModule(
      "Generated Nodics framework documentation hierarchy nodes.",
      nodeRecordMap,
    ),
  "data/core-v001/records/documentation/nodicsDocumentationPageMetadataData.js":
    jsModule(
      "Generated Nodics framework documentation page metadata.",
      pageMetadataRecords,
    ),
  "data/core-v001/records/documentation/nodicsDocumentationPublicationStateData.js":
    jsModule(
      "Generated Nodics framework documentation publication state metadata.",
      publicationStateRecords,
    ),
  "data/core-v001/records/documentation/nodicsDocumentationSearchMetadataData.js":
    jsModule(
      "Generated Nodics framework documentation search metadata.",
      searchMetadataRecords,
    ),
  "data/core-v001/records/documentation/nodicsDocumentationTypeCodeData.js":
    jsModule("Nodics framework documentation page and component types.", {
      record0: {
        code: "nodicsDocumentationArticlePageType",
        kind: "PAGE",
        contractVersion: 0,
        active: true,
      },
      record1: {
        code: "nodicsDocumentationArticleComponentType",
        kind: "COMPONENT",
        contractVersion: 0,
        active: true,
      },
      record2: {
        code: "nodicsDocumentationNavigationComponentType",
        kind: "COMPONENT",
        contractVersion: 0,
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
    }),
  "data/core-v001/records/documentation/nodicsDocumentationRendererData.js":
    jsModule(
      "Nodics framework documentation renderer mappings owned by Axis.",
      {
        record0: {
          code: "nodicsDocumentationArticlePageType",
          renderer: "documentation.page.article",
          contractVersion: 0,
          channels: ["web", "mobile-webview"],
          deprecated: false,
          active: true,
        },
        record1: {
          code: "nodicsDocumentationArticleComponentType",
          renderer: "documentation.component.article",
          contractVersion: 0,
          channels: ["web", "mobile-webview"],
          deprecated: false,
          active: true,
        },
        record2: {
          code: "nodicsDocumentationNavigationComponentType",
          renderer: "documentation.component.navigation",
          contractVersion: 0,
          channels: ["web", "mobile-webview"],
          deprecated: false,
          active: true,
        },
        record3: {
          code: "cmsRichTextComponent",
          renderer: "cms.component.rich-text",
          contractVersion: 0,
          channels: ["web", "mobile-webview"],
          deprecated: false,
          active: true,
        },
      },
    ),
  "data/core-v001/records/documentation/nodicsDocumentationSlotData.js":
    jsModule("Nodics framework documentation template slots.", {
      record0: {
        code: "nodicsDocumentationNavigationSlot",
        template: "nodicsDocumentationArticleTemplate",
        name: "navigation",
        minItems: 1,
        maxItems: 1,
        allowedComponentTypes: ["nodicsDocumentationNavigationComponentType"],
        active: true,
      },
      record1: {
        code: "nodicsDocumentationArticleSlot",
        template: "nodicsDocumentationArticleTemplate",
        name: "article",
        minItems: 1,
        maxItems: 1,
        allowedComponentTypes: [
          "nodicsDocumentationArticleComponentType",
          "cmsRichTextComponent",
        ],
        active: true,
      },
    }),
  "data/core-v001/records/documentation/nodicsDocumentationTemplateBootstrapData.js":
    jsModule(
      "Nodics framework documentation template bootstrap without unresolved slot relations.",
      {
        record0: {
          code: "nodicsDocumentationArticleTemplate",
          name: "Nodics Documentation Article",
          renderer: "documentation.template.article",
          contractVersion: 0,
          active: true,
        },
      },
    ),
  "data/core-v001/records/documentation/nodicsDocumentationTemplateData.js":
    jsModule("Nodics framework documentation template.", {
      record0: {
        code: "nodicsDocumentationArticleTemplate",
        name: "Nodics Documentation Article",
        renderer: "documentation.template.article",
        contractVersion: 0,
        slots: [
          "nodicsDocumentationNavigationSlot",
          "nodicsDocumentationArticleSlot",
        ],
        active: true,
      },
    }),
  "data/core-v001/records/documentation/nodicsDocumentationComponentData.js":
    jsModule(
      "Generated Nodics framework documentation navigation and article content.",
      componentRecords,
    ),
  "data/core-v001/records/documentation/nodicsDocumentationPageData.js":
    jsModule("Generated Nodics framework documentation pages.", pageRecords),
  "data/core-v001/records/documentation/nodicsDocumentationRouteData.js":
    jsModule("Generated Nodics framework documentation routes.", routeRecords),
  "data/core-v001/headers/nodicsDocumentationContentPackHeader.js": `${copyrightHeader}'use strict';\n\n/** @description Nodics foundation-import header for framework documentation. */\nmodule.exports = {\n  cms: {\n    nodicsDocumentationSiteData: { options: { enabled: true, schemaName: 'cmsSite', operation: 'saveAll', dataFilePrefix: 'nodicsDocumentationSiteData' }, query: { code: '$code' } },\n    nodicsDocumentationProductData: { options: { enabled: true, schemaName: 'cmsDocumentationProduct', operation: 'saveAll', dataFilePrefix: 'nodicsDocumentationProductData' }, query: { code: '$code' } },\n    nodicsDocumentationAccessPolicyData: { options: { enabled: true, schemaName: 'cmsDocumentationAccessPolicy', operation: 'saveAll', dataFilePrefix: 'nodicsDocumentationAccessPolicyData' }, query: { code: '$code' } },\n    nodicsDocumentationNavigationData: { options: { enabled: true, schemaName: 'cmsDocumentationNavigation', operation: 'saveAll', dataFilePrefix: 'nodicsDocumentationNavigationData' }, query: { code: '$code' } },\n    nodicsDocumentationDashboardData: { options: { enabled: true, schemaName: 'cmsDocumentationDashboard', operation: 'saveAll', dataFilePrefix: 'nodicsDocumentationDashboardData' }, query: { code: '$code' } },\n    nodicsDocumentationLegacyNavigationCleanupData: { options: { enabled: true, schemaName: 'cmsDocumentationNode', operation: 'remove', dataFilePrefix: 'nodicsDocumentationLegacyNavigationCleanupData' }, query: { product: '${productCode}', navigation: '${navigationCode}', nodeLevel: { $in: ['GROUP', 'SUBGROUP', 'TOPIC'] } } },\n    nodicsDocumentationNodeData: { options: { enabled: true, schemaName: 'cmsDocumentationNode', operation: 'saveAll', dataFilePrefix: 'nodicsDocumentationNodeData' }, query: { code: '$code' } },\n    nodicsDocumentationPageMetadataData: { options: { enabled: true, schemaName: 'cmsDocumentationPage', operation: 'saveAll', dataFilePrefix: 'nodicsDocumentationPageMetadataData' }, query: { code: '$code' } },\n    nodicsDocumentationPublicationStateData: { options: { enabled: true, schemaName: 'cmsDocumentationPublicationState', operation: 'saveAll', dataFilePrefix: 'nodicsDocumentationPublicationStateData' }, query: { code: '$code' } },\n    nodicsDocumentationSearchMetadataData: { options: { enabled: true, schemaName: 'cmsDocumentationSearchMetadata', operation: 'saveAll', dataFilePrefix: 'nodicsDocumentationSearchMetadataData' }, query: { code: '$code' } },\n    nodicsDocumentationTypeCodeData: { options: { enabled: true, schemaName: 'cmsTypeCode', operation: 'saveAll', dataFilePrefix: 'nodicsDocumentationTypeCodeData' }, query: { code: '$code' } },\n    nodicsDocumentationRendererData: { options: { enabled: true, schemaName: 'cmsTypeCode2Renderer', operation: 'saveAll', dataFilePrefix: 'nodicsDocumentationRendererData' }, query: { code: '$code' } },\n    nodicsDocumentationTemplateBootstrapData: { options: { enabled: true, schemaName: 'cmsPageTemplate', operation: 'saveAll', dataFilePrefix: 'nodicsDocumentationTemplateBootstrapData' }, query: { code: '$code' } },\n    nodicsDocumentationSlotData: { options: { enabled: true, schemaName: 'cmsSlotDefinition', operation: 'saveAll', dataFilePrefix: 'nodicsDocumentationSlotData' }, query: { code: '$code' } },\n    nodicsDocumentationTemplateData: { options: { enabled: true, schemaName: 'cmsPageTemplate', operation: 'saveAll', dataFilePrefix: 'nodicsDocumentationTemplateData' }, query: { code: '$code' } },\n    nodicsDocumentationComponentData: { options: { enabled: true, schemaName: 'cmsComponent', operation: 'saveAll', dataFilePrefix: 'nodicsDocumentationComponentData' }, query: { code: '$code' } },\n    nodicsDocumentationPageData: { options: { enabled: true, schemaName: 'cmsPage', operation: 'saveAll', dataFilePrefix: 'nodicsDocumentationPageData' }, query: { code: '$code' } },\n    nodicsDocumentationRouteData: { options: { enabled: true, schemaName: 'cmsPageRoute', operation: 'saveAll', dataFilePrefix: 'nodicsDocumentationRouteData' }, query: { code: '$code' } },\n  },\n};\n`,
};

for (const [relativePath, content] of Object.entries(files)) {
  await writeOrCheck(relativePath, content);
}

const generatedHashes = Object.fromEntries(
  Object.keys(files).map((relativePath) => [
    relativePath.replace(/^data\//, ""),
    sha256(fs.readFileSync(path.join(root, relativePath))),
  ]),
);
const documentationSection =
  applicationDocumentationContract.buildReleaseSection({
    contentPath: "core-v001",
    catalogue: { pack: "nodics.docs", version: catalogue.release },
    owningDomain: "documentation",
    environmentScope: ["ALL"],
    sensitivity: "PUBLIC",
    sourceAuthority: "docs/catalogue.json",
    sites: ["nodicsDocumentationSite"],
    accessMode: "PUBLIC",
    pages: sourcePages.length,
    components: Object.keys(componentRecords).length,
    routes: sourcePages.length,
    generatedHashes,
  });
const previousManifest = fs.existsSync(manifestPath)
  ? JSON.parse(fs.readFileSync(manifestPath, "utf8"))
  : { contractVersion: 0, module: "nodics.docs", sections: {} };
const manifest = {
  contractVersion: 0,
  module: "nodics.docs",
  sections: {
    ...(previousManifest.sections || {}),
    documentation: documentationSection,
  },
};
await writeOrCheck(
  path.relative(root, manifestPath),
  `${JSON.stringify(manifest, null, 2)}\n`,
);

console.log(
  `${checkOnly ? "Validated" : "Generated"} ${sourcePages.length} framework documentation pages`,
);
