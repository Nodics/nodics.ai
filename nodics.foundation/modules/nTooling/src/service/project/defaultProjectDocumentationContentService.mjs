/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const root = path.resolve(process.env.NODICS_PROJECT_ROOT || process.cwd());
const require = createRequire(import.meta.url);
const applicationDocumentationContract = require('../defaultApplicationDocumentationContractService.js');
const cataloguePath = path.join(root, 'docs/catalogue.json');
const dataRoot = path.join(root, 'data/core-v001');
const dataPath = path.join(dataRoot, 'data/documentation');
const manifestPath = path.join(root, 'data/manifest.json');
const checkOnly = process.argv.includes('--check');
const copyrightHeader = `/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

`;
const catalogue = JSON.parse(fs.readFileSync(cataloguePath, 'utf8'));
const project = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const publication = catalogue.publication;
if (!publication || !project.name || catalogue.pack !== project.name) throw new Error('Project documentation requires its owning package and catalogue publication metadata');
for (const key of ['recordPrefix', 'codePrefix', 'sectionCode', 'owningDomain', 'keyword']) {
  if (typeof publication[key] !== 'string' || !/^[A-Za-z][A-Za-z0-9._-]*$/.test(publication[key])) throw new Error('Invalid documentation publication identifier: ' + key);
}
for (const key of ['routeRoot', 'publicRootPath']) {
  if (typeof publication[key] !== 'string' || !/^\/(?:[A-Za-z0-9_-]+\/?)+$/.test(publication[key])) throw new Error('Invalid documentation publication path: ' + key);
}
for (const key of ['label', 'shortLabel']) {
  if (typeof publication[key] !== 'string' || !publication[key].trim() || /[<>\r\n]|\*\//.test(publication[key])) throw new Error('Invalid documentation publication label: ' + key);
}
if (!Array.isArray(publication.channels) || !publication.channels.length || publication.channels.some(channel => typeof channel !== 'string' || !/^[a-z][a-z0-9-]*$/.test(channel))) throw new Error('Documentation publication channels must be declared');
const documents = catalogue.documents || [];
applicationDocumentationContract.validateCatalogue({
  ownerRoot: root,
  sourceDirectory: 'docs',
  cataloguePath: 'docs/catalogue.json',
  catalogue,
  requireNavigationSections: true,
  requireEnterpriseMetadata: true,
  validateContentQuality: true,
});

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function slug(value) {
  return String(value)
    .toLowerCase()
    .replace(/[`*_]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
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
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim());
}

function isTableSeparator(line) {
  const cells = tableCells(line);
  return (
    cells.length > 0 &&
    cells.every((cell) => /^:?-{3,}:?$/.test(cell.replace(/\s/g, '')))
  );
}

function markdownBlocks(markdown, pageCode) {
  const blocks = [];
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  let pending = [];
  let index = 0;
  let headingIndex = 0;

  const flushParagraph = () => {
    const value = pending.join(' ').trim();
    pending = [];
    if (value) blocks.push({ kind: 'paragraph', text: value });
  };

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    if (trimmed.startsWith('```')) {
      flushParagraph();
      const language = trimmed.slice(3).trim() || 'text';
      const code = [];
      index += 1;
      while (index < lines.length && !lines[index].trim().startsWith('```')) {
        code.push(lines[index]);
        index += 1;
      }
      blocks.push({
        kind: language === 'mermaid' ? 'diagram' : 'code',
        language,
        text: code.join('\n'),
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
          kind: 'heading',
          level,
          text,
          anchor: `${pageCode}-${headingIndex}-${slug(text)}`,
        });
      }
      index += 1;
      continue;
    }

    const image = /^!\[([^\]]*)\]\(([^)\s]+)(?:\s+["']([^"']+)["'])?\)$/.exec(trimmed);
    if (image) {
      flushParagraph();
      blocks.push({
        kind: 'image',
        alt: image[1] || 'Documentation illustration',
        source: image[2],
        title: image[3] || image[1] || '',
      });
      index += 1;
      continue;
    }

    if (
      trimmed.includes('|') &&
      index + 1 < lines.length &&
      isTableSeparator(lines[index + 1])
    ) {
      flushParagraph();
      const headers = tableCells(trimmed);
      const rows = [];
      index += 2;
      while (index < lines.length && lines[index].trim().includes('|')) {
        rows.push(tableCells(lines[index]));
        index += 1;
      }
      blocks.push({ kind: 'table', headers, rows });
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
          current.startsWith('```') ||
          current.startsWith('>') ||
          /^!\[/.test(current)
        ) {
          break;
        }
        items[items.length - 1] += ` ${current}`;
        index += 1;
      }
      blocks.push({ kind: 'unordered-list', items });
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
          current.startsWith('```') ||
          current.startsWith('>') ||
          /^!\[/.test(current)
        ) {
          break;
        }
        items[items.length - 1] += ` ${current}`;
        index += 1;
      }
      blocks.push({ kind: 'ordered-list', items });
      continue;
    }

    if (trimmed.startsWith('>')) {
      flushParagraph();
      const quote = [];
      while (index < lines.length && lines[index].trim().startsWith('>')) {
        quote.push(lines[index].trim().replace(/^>\s?/, ''));
        index += 1;
      }
      blocks.push({ kind: 'blockquote', text: quote.join(' ').trim() });
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
  const target = path.join(root, relativePath);
  if (checkOnly) {
    const current = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : null;
    if (current !== content) throw new Error(`${relativePath} is not generated`);
    return;
  }
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
}

function jsModule(description, value) {
  return `${copyrightHeader}'use strict';\n\n/** @description ${description} */\nmodule.exports = ${JSON.stringify(value, null, 2)};\n`;
}

const sourcePages = documents.map((document, index) => {
  const markdown = fs.readFileSync(path.join(root, document.content), 'utf8');
  const codeSuffix = camel(document.id);
  const blocks = markdownBlocks(markdown, codeSuffix);
  const documentHeadings = blocks
    .filter((block) => block.kind === 'heading')
    .map((block) => ({ text: block.text, anchor: block.anchor, level: block.level }));
  return {
    ...document,
    markdown,
    blocks,
    headings: documentHeadings,
    route: index === 0 ? publication.routeRoot : `${publication.routeRoot}/${slug(document.id.replace(/\./g, '-'))}`,
    codeSuffix,
  };
});

const sections = Array.isArray(catalogue.navigationSections)
  ? catalogue.navigationSections
  : [
      {
        code: publication.sectionCode,
        title: publication.label,
        order: 10,
        summary: 'Reference customer project documentation.',
        audience: ['architect', 'developer', 'operator'],
        visibility: 'public',
        accessMode: 'PUBLIC',
        publiclyAvailable: true,
        requiresAuthentication: false,
        lifecycleState: 'ONLINE',
      },
    ];

const navigationItems = sourcePages.map((document, index) => ({
  code: document.id,
  title: document.title,
  route: document.route,
  section: document.navigationSectionCode || publication.sectionCode,
  sectionTitle: document.navigationSection || publication.label,
  sectionOrder: document.navigationSectionOrder || sections.find((section) => section.code === document.navigationSectionCode)?.order || 10,
  group: document.navigationSectionCode || publication.sectionCode,
  groupTitle: document.navigationSection || publication.label,
  groupOrder: document.navigationSectionOrder || sections.find((section) => section.code === document.navigationSectionCode)?.order || 10,
  subgroup: null,
  subgroupTitle: null,
  order: document.navigationOrder || (index + 1) * 10,
  parentId: document.navigationSectionCode || publication.sectionCode,
  hierarchyPath: [document.navigationSection || publication.label, document.title],
  hierarchyDepth: 2,
  documentType: document.documentType || 'overview',
  audience: document.audience || ['architect', 'developer', 'operator'],
  businessAudience: document.businessAudience || [],
  technicalAudience: document.technicalAudience || [],
  summary: document.summary,
  visibility: document.visibility || 'public',
  accessMode: document.accessMode || 'PUBLIC',
  publiclyAvailable: document.publiclyAvailable !== false,
  requiresAuthentication: Boolean(document.requiresAuthentication),
  allowedRoles: document.allowedRoles || [],
  allowedGroups: document.allowedGroups || [],
  allowedPermissions: document.allowedPermissions || [],
  lifecycleState: document.lifecycleState || 'ONLINE',
  maturityState: document.maturityState || 'operational',
  implementationState: document.implementationState || 'current',
  relatedPages: document.relatedPages || [],
  searchKeywords: document.searchKeywords || [],
  topicKeywords: document.topicKeywords || [],
  searchText: `${document.title} ${document.summary} ${document.markdown}`,
}));

function boundedCode(prefix, parts) {
  const raw = `${prefix}${parts.map((part) => camel(part)).join('')}`;
  if (raw.length <= 120) return raw;
  return `${raw.slice(0, 96)}${sha256(parts.join(':')).slice(0, 16)}`;
}

function schemaMaturity(value) {
  const normalized = String(value || '').toLowerCase();
  if (normalized.includes('reference')) return 'REFERENCE';
  if (normalized.includes('planned')) return 'PLANNED';
  if (normalized.includes('roadmap')) return 'ROADMAP';
  return 'IMPLEMENTED';
}

function pageCode(document) {
  return `${publication.codePrefix}Page${document.codeSuffix}`;
}

function routeCode(document) {
  return `${publication.codePrefix}Route${document.codeSuffix}`;
}

function articleCode(document) {
  return `${publication.codePrefix}Component${document.codeSuffix}`;
}

function metadataPageCode(document) {
  return `${publication.codePrefix}Metadata${document.codeSuffix}`;
}

const productCode = (publication.recordPrefix + "Product");
const navigationCode = (publication.recordPrefix + "NavigationTree");
const rootNodeCode = (publication.codePrefix + "NodeRoot");
const defaultLifecycle = 'ONLINE';
const publicAccessPolicyCode = (publication.codePrefix + "AccessPublic");
const authenticatedAccessPolicyCode = (publication.codePrefix + "AccessAuthenticated");
const authoringPermissionsByTargetType = {
  PRODUCT: ['documentation.draft.update'],
  NAVIGATION: ['documentation.navigation.update'],
  NODE: ['documentation.navigation.update'],
  PAGE: ['documentation.draft.update'],
  DASHBOARD: ['documentation.dashboard.update'],
  SEARCH_METADATA: ['documentation.search.preview'],
  ACCESS_POLICY: ['documentation.accessPolicy.update'],
};
const workflowTriggersByTargetType = {
  PRODUCT: ['CONTENT_CHANGE', 'ACCESS_POLICY_CHANGE'],
  NAVIGATION: ['NAVIGATION_CHANGE'],
  NODE: ['NAVIGATION_CHANGE', 'DASHBOARD_CHANGE', 'ACCESS_POLICY_CHANGE'],
  PAGE: ['CONTENT_CHANGE', 'ACCESS_POLICY_CHANGE', 'SOURCE_EVIDENCE_CHANGE'],
  DASHBOARD: ['DASHBOARD_CHANGE'],
  SEARCH_METADATA: ['SEARCH_METADATA_CHANGE'],
  ACCESS_POLICY: ['ACCESS_POLICY_CHANGE'],
};
const publicationDecisionPolicy = {
  reviewPermission: 'documentation.review',
  approvePermission: 'documentation.approve',
  publishPermission: 'documentation.publish',
  permissionEnforced: true,
  adminOverrideAudited: true,
};
function workflowMetadata(targetType) {
  return {
    managedInAxis: true,
    axisAuthoringPermissions: authoringPermissionsByTargetType[targetType] || ['axis.documentation.read'],
    workflowRequired: true,
    workflowTriggers: workflowTriggersByTargetType[targetType] || ['CONTENT_CHANGE'],
  };
}
const accessPolicyRecords = {
  record0: {
    code: publicAccessPolicyCode,
    name: ("Public " + publication.shortLabel + " documentation access"),
    targetType: 'PRODUCT',
    targetCode: productCode,
    accessMode: 'PUBLIC',
    publiclyAvailable: true,
    requiresAuthentication: false,
    allowedRoles: [],
    allowedGroups: [],
    allowedPermissions: [],
    lifecycleVisibility: ['ONLINE'],
    ...workflowMetadata('ACCESS_POLICY'),
    priority: 10,
    active: true,
  },
  record1: {
    code: authenticatedAccessPolicyCode,
    name: ("Authenticated " + publication.shortLabel + " documentation access"),
    targetType: 'PRODUCT',
    targetCode: productCode,
    accessMode: 'AUTHENTICATED',
    publiclyAvailable: false,
    requiresAuthentication: true,
    allowedRoles: [],
    allowedGroups: [],
    allowedPermissions: [],
    lifecycleVisibility: ['ONLINE'],
    ...workflowMetadata('ACCESS_POLICY'),
    priority: 20,
    active: true,
  },
};
const accessPolicyFor = (item) =>
  (item && item.accessMode) === 'PUBLIC' ? publicAccessPolicyCode : authenticatedAccessPolicyCode;

const productRecords = {
  record0: {
    code: productCode,
    name: (publication.label + " Documentation"),
    description: 'Project-owned documentation for the reference customer workspace, local setup, publication, qualification, customization, and functional journeys.',
    contentCatalog: 'documentationContentCatalog',
    site: (publication.recordPrefix + "Site"),
    publicRootPath: publication.publicRootPath,
    defaultLocale: 'en',
    channels: publication.channels,
    ownerFunctionalModule: project.name,
    audience: ['business', 'architect', 'administrator', 'developer', 'operator', 'qa', 'ai-tool'],
    accessMode: 'PUBLIC',
    lifecycleState: defaultLifecycle,
    maturityState: 'IMPLEMENTED',
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
    accessMode: record.accessMode || 'PUBLIC',
    lifecycleState: record.lifecycleState || defaultLifecycle,
    ...workflowMetadata('DASHBOARD'),
    active: true,
  });
}

pushDashboard({
  code: (publication.codePrefix + "DashboardProduct"),
  ownerType: 'PRODUCT',
  ownerCode: productCode,
  title: (publication.label + " Documentation"),
  summary: ("Landing content for the " + publication.shortLabel + " customer-reference documentation catalogue, including setup, runtime, publication, qualification, customization, and functional journeys."),
  contentArea: {
    intent: 'Help customer teams and implementation partners choose the correct project-owned journey before opening detailed implementation pages.',
  },
  cards: sections.map((section) => ({
    code: section.code,
    title: section.title,
    summary: section.summary,
    order: section.order,
  })),
  journeyLinks: sourcePages.slice(0, 6).map((document) => ({
    label: document.title,
    targetPage: document.id,
    route: document.route,
  })),
  statusSummary: {
    sections: sections.length,
    pages: sourcePages.length,
    lifecycleState: defaultLifecycle,
  },
});

nodeRecords.push({
  code: rootNodeCode,
  product: productCode,
  navigation: navigationCode,
  nodeLevel: 'SECTION',
  nodeType: 'CONTAINER',
  nodeTitle: (publication.label + " Documentation"),
  nodeSummary: 'Root node for customer project documentation rendered through backend-owned, Axis-manageable content-catalog records.',
  nodeContentArea: { dashboard: (publication.codePrefix + "DashboardProduct") },
  nodeDashboard: (publication.codePrefix + "DashboardProduct"),
  childSummaryCards: sections.map((section) => ({
    code: section.code,
    title: section.title,
    summary: section.summary,
    order: section.order,
  })),
  childJourneyLinks: [],
  childStatusSummary: { childCount: sections.length, pages: sourcePages.length },
  nodeOrder: 10,
  expandable: true,
  expandedByDefault: true,
  nodeIcon: 'book-open',
  nodeAudience: ['business', 'architect', 'administrator', 'developer', 'operator', 'qa', 'ai-tool'],
  accessPolicy: publicAccessPolicyCode,
  accessMode: 'PUBLIC',
  allowedRoles: [],
  allowedGroups: [],
  allowedPermissions: [],
  ...workflowMetadata('NODE'),
  lifecycleState: defaultLifecycle,
  maturityState: 'IMPLEMENTED',
  searchKeywords: [publication.keyword, 'customer project', 'documentation'],
  relatedNodes: [],
  locale: 'en',
  channel: 'web',
  active: true,
});

sections.forEach((section) => {
  const sectionNodeCode = boundedCode((publication.codePrefix + "NodeSec"), [section.code]);
  sectionNodeCodes.set(section.code, sectionNodeCode);
  const sectionPages = sourcePages.filter((document) => (document.navigationSectionCode || publication.sectionCode) === section.code);
  const orderedPages = [...sectionPages].sort((left, right) =>
    (left.navigationOrder || 100) - (right.navigationOrder || 100) ||
    String(left.title).localeCompare(String(right.title))
  );
  const dashboardCode = boundedCode((publication.codePrefix + "DashboardSec"), [section.code]);
  pushDashboard({
    code: dashboardCode,
    ownerType: 'SECTION',
    ownerCode: sectionNodeCode,
    title: section.title,
    summary: section.summary,
    contentArea: {
      businessPurpose: section.summary,
      technicalPurpose: 'Project documentation section managed as backend content-catalog data with publication lifecycle and access metadata.',
    },
    cards: orderedPages.map((document) => ({
      code: document.id,
      title: document.title,
      summary: document.summary,
      order: document.navigationOrder || 100,
    })),
    journeyLinks: orderedPages.slice(0, 6).map((document) => ({
      label: document.title,
      targetPage: document.id,
      route: document.route,
    })),
    statusSummary: { pages: sectionPages.length },
    accessMode: section.accessMode || 'PUBLIC',
    lifecycleState: section.lifecycleState || defaultLifecycle,
  });
  nodeRecords.push({
    code: sectionNodeCode,
    product: productCode,
    navigation: navigationCode,
    parentNode: rootNodeCode,
    nodeLevel: 'SECTION',
    nodeType: 'CONTAINER',
    nodeTitle: section.title,
    nodeSummary: section.summary,
    nodeContentArea: { dashboard: dashboardCode, pages: sectionPages.map((document) => document.id) },
    nodeDashboard: dashboardCode,
    childSummaryCards: orderedPages.map((document) => ({
      code: document.id,
      title: document.title,
      summary: document.summary,
      order: document.navigationOrder || 100,
    })),
    childJourneyLinks: orderedPages.slice(0, 6).map((document) => ({
      label: document.title,
      targetPage: document.id,
      route: document.route,
    })),
    childStatusSummary: { childCount: sectionPages.length, pages: sectionPages.length },
    nodeOrder: section.order,
    expandable: true,
    expandedByDefault: false,
    nodeIcon: 'folder',
    nodeAudience: section.audience || ['architect', 'developer', 'operator'],
    accessPolicy: accessPolicyFor(section),
    accessMode: section.accessMode || 'PUBLIC',
    allowedRoles: [],
    allowedGroups: [],
    allowedPermissions: [],
    ...workflowMetadata('NODE'),
    lifecycleState: section.lifecycleState || defaultLifecycle,
    maturityState: 'IMPLEMENTED',
    searchKeywords: [section.code, section.title],
    relatedNodes: [],
    locale: 'en',
    channel: 'web',
    active: true,
  });
});

sourcePages.forEach((document) => {
  const sectionCode = document.navigationSectionCode || publication.sectionCode;
  nodeRecords.push({
    code: boundedCode((publication.codePrefix + "NodePage"), [document.id]),
    product: productCode,
    navigation: navigationCode,
    parentNode: sectionNodeCodes.get(sectionCode),
    nodeLevel: 'PAGE_LINK',
    nodeType: 'PAGE',
    nodeTitle: document.title,
    nodeSummary: document.summary,
    nodeContentArea: { route: document.route, documentType: document.documentType },
    childSummaryCards: [],
    childJourneyLinks: [],
    childStatusSummary: { childCount: 0 },
    targetDocumentationPage: metadataPageCode(document),
    targetPage: pageCode(document),
    targetRoute: routeCode(document),
    nodeOrder: document.navigationOrder || 100,
    expandable: false,
    expandedByDefault: false,
    nodeIcon: 'file-text',
    nodeAudience: document.audience || ['architect', 'developer', 'operator'],
    accessPolicy: accessPolicyFor(document),
    accessMode: document.accessMode || 'PUBLIC',
    allowedRoles: document.allowedRoles || [],
    allowedGroups: document.allowedGroups || [],
    allowedPermissions: document.allowedPermissions || [],
    ...workflowMetadata('NODE'),
    lifecycleState: document.lifecycleState || defaultLifecycle,
    maturityState: schemaMaturity(document.maturityState),
    searchKeywords: document.searchKeywords || [],
    relatedNodes: (document.relatedPages || []).map((relatedPage) => boundedCode((publication.codePrefix + "NodePage"), [relatedPage])),
    locale: document.locale || 'en',
    channel: 'web',
    active: true,
  });
});

const navigationRecords = {
  record0: {
    code: navigationCode,
    product: productCode,
    name: (publication.label + " Documentation Navigation"),
    renderer: 'documentation.component.navigation',
    searchLabel: ("Search " + publication.shortLabel + " documentation"),
    searchPlaceholder: 'Search setup, runtime, modules, and customization',
    emptyMessage: ("No " + publication.shortLabel + " documentation matches your search."),
    expandable: true,
    accessMode: 'PUBLIC',
    lifecycleState: defaultLifecycle,
    ...workflowMetadata('NAVIGATION'),
    active: true,
  },
};
const dashboardRecordMap = Object.fromEntries(dashboardRecords.map((record, index) => [`record${index}`, record]));
const nodeRecordMap = Object.fromEntries(nodeRecords.map((record, index) => [`record${index}`, record]));
const pageMetadataRecords = Object.fromEntries(
  sourcePages.map((document, index) => [
    `record${index}`,
    {
      code: metadataPageCode(document),
      product: productCode,
      documentId: document.id,
      title: document.title,
      summary: document.summary,
      businessSummary: `${document.title} explains customer-project purpose, supported operations, runtime impact, and implementation handoff.`,
      technicalSummary: `${document.title} records owning module ${document.functionalModule}, technical module ${document.technicalModule || 'n/a'}, source path ${document.sourcePath || document.content}, validation, and troubleshooting evidence.`,
      ownerFunctionalModule: document.functionalModule,
      technicalModule: document.technicalModule || null,
      targetPage: pageCode(document),
      targetRoute: routeCode(document),
      articleComponent: articleCode(document),
      template: (publication.recordPrefix + "ArticleTemplate"),
      searchMetadata: boundedCode((publication.codePrefix + "Search"), ['PAGE', metadataPageCode(document)]),
      headings: document.headings,
      diagrams: document.blocks.filter((block) => block.kind === 'diagram').map((block) => ({ language: block.language })),
      visualAssets: document.blocks.filter((block) => block.kind === 'image' || block.kind === 'table').map((block) => ({ kind: block.kind })),
      visualRequirements: document.visualRequirements || [],
      relatedPages: document.relatedPages || [],
      sourceRepository: project.name,
      sourcePath: document.sourcePath || document.content,
      sourceChecksum: sha256(document.markdown),
      sourceWordCount: wordCount(document.markdown),
      audience: document.audience || ['architect', 'developer', 'operator'],
      ...workflowMetadata('PAGE'),
      accessPolicy: accessPolicyFor(document),
      accessMode: document.accessMode || 'PUBLIC',
      lifecycleState: document.lifecycleState || defaultLifecycle,
      maturityState: schemaMaturity(document.maturityState),
      active: true,
    },
  ]),
);
const publicationTargets = [
  { type: 'PRODUCT', code: productCode, lifecycleState: defaultLifecycle },
  { type: 'NAVIGATION', code: navigationCode, lifecycleState: defaultLifecycle },
  ...Object.values(accessPolicyRecords).map((record) => ({ type: 'ACCESS_POLICY', code: record.code, lifecycleState: defaultLifecycle })),
  ...nodeRecords.map((record) => ({ type: 'NODE', code: record.code, lifecycleState: record.lifecycleState })),
  ...dashboardRecords.map((record) => ({ type: 'DASHBOARD', code: record.code, lifecycleState: record.lifecycleState })),
  ...sourcePages.map((document) => ({ type: 'PAGE', code: metadataPageCode(document), lifecycleState: document.lifecycleState || defaultLifecycle })),
];
const publicationStateRecords = Object.fromEntries(
  publicationTargets.map((target, index) => [
    `record${index}`,
    {
      code: boundedCode((publication.codePrefix + "Publication"), [target.type, target.code]),
      targetType: target.type,
      targetCode: target.code,
      lifecycleState: target.lifecycleState || defaultLifecycle,
      publicationCode: publication.recordPrefix,
      workflowReference: (publication.recordPrefix + "ReviewWorkflow"),
      stagedVersion: catalogue.release,
      ...(target.lifecycleState === 'ONLINE' ? { onlineVersion: catalogue.release } : {}),
      validationResult: {
        generated: true,
        sourceAuthority: 'docs/catalogue.json',
        publicationPath: 'STAGED_REVIEW_APPROVAL_ONLINE',
        publicVisibleOnlyWhenOnlineAndPublic: true,
      },
      checksum: sha256(`${target.type}:${target.code}:${target.lifecycleState || defaultLifecycle}:${catalogue.release}`),
      ...workflowMetadata(target.type),
      decisionPolicy: publicationDecisionPolicy,
      actor: (project.name + ".generator"),
      author: (project.name + ".generator"),
      auditTrail: [],
      active: true,
    },
  ]),
);
const searchTargets = [
  {
    targetType: 'PRODUCT',
    targetCode: productCode,
    title: (publication.label + " Documentation"),
    summary: productRecords.record0.description,
    searchText: `${productRecords.record0.name} ${productRecords.record0.description}`,
    keywords: [publication.keyword, 'documentation', 'customer project'],
    facets: { audience: productRecords.record0.audience, lifecycleState: defaultLifecycle },
    accessMode: 'PUBLIC',
    lifecycleState: defaultLifecycle,
  },
  {
    targetType: 'NAVIGATION',
    targetCode: navigationCode,
    title: navigationRecords.record0.name,
    summary: navigationRecords.record0.searchPlaceholder,
    searchText: `${navigationRecords.record0.name} ${navigationRecords.record0.searchLabel} ${navigationRecords.record0.searchPlaceholder}`,
    keywords: ['navigation', 'hierarchy', 'expandable', 'search'],
    facets: { documentType: 'navigation', lifecycleState: defaultLifecycle },
    accessMode: navigationRecords.record0.accessMode || 'PUBLIC',
    lifecycleState: navigationRecords.record0.lifecycleState || defaultLifecycle,
  },
  ...nodeRecords.map((node) => ({
    targetType: 'NODE',
    targetCode: node.code,
    title: node.nodeTitle,
    summary: node.nodeSummary,
    searchText: `${node.nodeTitle} ${node.nodeSummary} ${(node.searchKeywords || []).join(' ')}`,
    keywords: node.searchKeywords || [node.nodeTitle],
    facets: {
      nodeLevel: node.nodeLevel,
      nodeType: node.nodeType,
      audience: node.nodeAudience || ['architect', 'developer', 'operator'],
    },
    accessMode: node.accessMode || 'PUBLIC',
    lifecycleState: node.lifecycleState || defaultLifecycle,
  })),
  ...dashboardRecords.map((dashboard) => ({
    targetType: 'DASHBOARD',
    targetCode: dashboard.code,
    title: dashboard.title,
    summary: dashboard.summary,
    searchText: `${dashboard.title} ${dashboard.summary}`,
    keywords: [dashboard.ownerType, dashboard.ownerCode, dashboard.title],
    facets: {
      ownerType: dashboard.ownerType,
      ownerCode: dashboard.ownerCode,
    },
    accessMode: dashboard.accessMode || 'PUBLIC',
    lifecycleState: dashboard.lifecycleState || defaultLifecycle,
  })),
  ...sourcePages.map((document) => ({
    targetType: 'PAGE',
    targetCode: metadataPageCode(document),
    title: document.title,
    summary: document.summary,
    searchText: `${document.title} ${document.summary} ${document.markdown}`,
    keywords: [...(document.searchKeywords || []), ...(document.topicKeywords || [])],
    facets: {
      section: document.navigationSectionCode || publication.sectionCode,
      group: document.navigationSectionCode || publication.sectionCode,
      documentType: document.documentType,
      audience: document.audience || ['architect', 'developer', 'operator'],
    },
    accessMode: document.accessMode || 'PUBLIC',
    lifecycleState: document.lifecycleState || defaultLifecycle,
  })),
];
const searchMetadataRecords = Object.fromEntries(
  searchTargets.map((target, index) => [
    `record${index}`,
    {
      code: boundedCode((publication.codePrefix + "Search"), [target.targetType, target.targetCode]),
      product: productCode,
      targetType: target.targetType,
      targetCode: target.targetCode,
      title: target.title,
      summary: target.summary,
      searchText: target.searchText,
      keywords: target.keywords,
      facets: target.facets,
      ...workflowMetadata('SEARCH_METADATA'),
      locale: 'en',
      channel: 'web',
      accessPolicy: target.accessMode === 'PUBLIC' ? publicAccessPolicyCode : authenticatedAccessPolicyCode,
      accessMode: target.accessMode,
      lifecycleState: target.lifecycleState,
      indexState: 'INDEX_READY',
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
        code: boundedCode((publication.codePrefix + "Publication"), ['SEARCH_METADATA', record.code]),
        targetType: 'SEARCH_METADATA',
        targetCode: record.code,
        lifecycleState: record.lifecycleState || defaultLifecycle,
        publicationCode: publication.recordPrefix,
        workflowReference: (publication.recordPrefix + "ReviewWorkflow"),
        stagedVersion: catalogue.release,
        ...(record.lifecycleState === 'ONLINE' ? { onlineVersion: catalogue.release } : {}),
        validationResult: {
          generated: true,
          sourceAuthority: 'docs/catalogue.json',
          publicationPath: 'STAGED_REVIEW_APPROVAL_ONLINE',
          publicVisibleOnlyWhenOnlineAndPublic: true,
        },
        checksum: sha256(`SEARCH_METADATA:${record.code}:${record.lifecycleState || defaultLifecycle}:${catalogue.release}`),
        ...workflowMetadata('SEARCH_METADATA'),
        decisionPolicy: publicationDecisionPolicy,
        actor: (project.name + ".generator"),
        author: (project.name + ".generator"),
        auditTrail: [],
        active: true,
      },
    ]),
  ),
);

const navigationComponent = {
  record0: {
    code: (publication.recordPrefix + "Navigation"),
    typeCode: (publication.recordPrefix + "NavigationComponentType"),
    renderer: 'documentation.component.navigation',
    accessMode: 'PUBLIC',
    properties: {
      title: publication.label,
      searchLabel: ("Search " + publication.shortLabel + " documentation"),
      searchPlaceholder: 'Search setup, runtime, modules, and customization',
      emptyMessage: ("No " + publication.shortLabel + " documentation matches your search."),
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
      code: `${publication.codePrefix}Component${document.codeSuffix}`,
      typeCode: (publication.recordPrefix + "ArticleComponentType"),
      renderer: 'documentation.component.article',
      accessMode: 'PUBLIC',
      properties: {
        code: document.id,
        title: document.title,
        route: document.route,
        section: document.navigationSectionCode || publication.sectionCode,
        sectionTitle: document.navigationSection || publication.label,
        group: document.navigationSectionCode || publication.sectionCode,
        groupTitle: document.navigationSection || publication.label,
        parentId: document.navigationSectionCode || publication.sectionCode,
        hierarchyPath: [document.navigationSection || publication.label, document.title],
        hierarchyDepth: 2,
        documentType: document.documentType || 'overview',
        audience: document.audience || ['architect', 'developer', 'operator'],
        businessAudience: document.businessAudience || [],
        technicalAudience: document.technicalAudience || [],
        summary: document.summary,
        visibility: document.visibility || 'public',
        accessMode: document.accessMode || 'PUBLIC',
        publiclyAvailable: document.publiclyAvailable !== false,
        requiresAuthentication: Boolean(document.requiresAuthentication),
        allowedRoles: document.allowedRoles || [],
        allowedGroups: document.allowedGroups || [],
        allowedPermissions: document.allowedPermissions || [],
        lifecycleState: document.lifecycleState || 'ONLINE',
        maturityState: document.maturityState || 'operational',
        implementationState: document.implementationState || 'current',
        relatedPages: document.relatedPages || [],
        visualRequirements: document.visualRequirements || [],
        searchKeywords: document.searchKeywords || [],
        topicKeywords: document.topicKeywords || [],
        headings: document.headings,
        blocks: document.blocks,
        searchText: `${document.title} ${document.summary} ${document.markdown}`,
        previous: index > 0 ? {
          title: sourcePages[index - 1].title,
          route: sourcePages[index - 1].route,
        } : null,
        next: index < sourcePages.length - 1 ? {
          title: sourcePages[index + 1].title,
          route: sourcePages[index + 1].route,
        } : null,
        source: {
          repository: project.name,
          functionalModule: document.functionalModule,
          technicalModule: document.technicalModule || null,
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
      code: `${publication.codePrefix}Page${document.codeSuffix}`,
      name: document.title,
      cmsSite: [(publication.recordPrefix + "Site")],
      typeCode: (publication.recordPrefix + "ArticlePageType"),
      template: (publication.recordPrefix + "ArticleTemplate"),
      renderer: 'documentation.page.article',
      cmsComponents: [
        { target: (publication.recordPrefix + "Navigation"), slot: 'navigation', index: 5, active: true },
        { target: `${publication.codePrefix}Component${document.codeSuffix}`, slot: 'article', index: 10, active: true },
      ],
      active: true,
    },
  ]),
);

const routeRecords = Object.fromEntries(
  sourcePages.map((document, index) => [
    `record${index}`,
    {
      code: `${publication.codePrefix}Route${document.codeSuffix}`,
      site: (publication.recordPrefix + "Site"),
      path: document.route,
      locale: document.locale || 'en',
      channel: 'web',
      page: `${publication.codePrefix}Page${document.codeSuffix}`,
      routeType: 'PAGE',
      deliveryState: 'ONLINE',
      accessMode: 'PUBLIC',
      active: true,
    },
  ]),
);

const files = {
  [("data/core-v001/records/documentation/" + publication.recordPrefix + "SiteData.js")]: jsModule(
    (publication.label + " documentation site."),
    {
      record0: {
        code: (publication.recordPrefix + "Site"),
        name: (publication.label + " Documentation"),
        catalog: 'documentationContentCatalog',
        active: true,
      },
    },
  ),
  [("data/core-v001/records/documentation/" + publication.recordPrefix + "ProductData.js")]: jsModule(
    ("Generated " + publication.label + " documentation product catalogue metadata."),
    productRecords,
  ),
  [("data/core-v001/records/documentation/" + publication.recordPrefix + "AccessPolicyData.js")]: jsModule(
    ("Generated " + publication.label + " documentation access policies."),
    accessPolicyRecords,
  ),
  [("data/core-v001/records/documentation/" + publication.recordPrefix + "NavigationData.js")]: jsModule(
    ("Generated " + publication.label + " documentation navigation catalogue metadata."),
    navigationRecords,
  ),
  [("data/core-v001/records/documentation/" + publication.recordPrefix + "DashboardData.js")]: jsModule(
    ("Generated " + publication.label + " documentation hierarchy dashboards."),
    dashboardRecordMap,
  ),
  [("data/core-v001/records/documentation/" + publication.recordPrefix + "LegacyNavigationCleanupData.js")]: jsModule(
    (publication.label + " documentation legacy hierarchy cleanup marker."),
    {
      record0: {
        code: (publication.recordPrefix + "LegacyNavigationCleanup"),
        reason: 'Remove generated multi-level navigation nodes before importing the two-level section and page-link hierarchy.',
        active: true,
      },
    },
  ),
  [("data/core-v001/records/documentation/" + publication.recordPrefix + "NodeData.js")]: jsModule(
    ("Generated " + publication.label + " documentation hierarchy nodes."),
    nodeRecordMap,
  ),
  [("data/core-v001/records/documentation/" + publication.recordPrefix + "PageMetadataData.js")]: jsModule(
    ("Generated " + publication.label + " documentation page metadata."),
    pageMetadataRecords,
  ),
  [("data/core-v001/records/documentation/" + publication.recordPrefix + "PublicationStateData.js")]: jsModule(
    ("Generated " + publication.label + " documentation publication state metadata."),
    publicationStateRecords,
  ),
  [("data/core-v001/records/documentation/" + publication.recordPrefix + "SearchMetadataData.js")]: jsModule(
    ("Generated " + publication.label + " documentation search metadata."),
    searchMetadataRecords,
  ),
  [("data/core-v001/records/documentation/" + publication.recordPrefix + "TypeCodeData.js")]: jsModule(
    (publication.label + " documentation page and component types."),
    {
      record0: { code: (publication.recordPrefix + "ArticlePageType"), kind: 'PAGE', contractVersion: 0, active: true },
      record1: { code: (publication.recordPrefix + "ArticleComponentType"), kind: 'COMPONENT', contractVersion: 0, active: true },
      record2: { code: (publication.recordPrefix + "NavigationComponentType"), kind: 'COMPONENT', contractVersion: 0, active: true },
    },
  ),
  [("data/core-v001/records/documentation/" + publication.recordPrefix + "RendererData.js")]: jsModule(
    (publication.label + " documentation renderer mappings consumed by Axis."),
    {
      record0: { code: (publication.recordPrefix + "ArticlePageType"), renderer: 'documentation.page.article', contractVersion: 0, channels: ['web', 'mobile-webview'], deprecated: false, active: true },
      record1: { code: (publication.recordPrefix + "ArticleComponentType"), renderer: 'documentation.component.article', contractVersion: 0, channels: ['web', 'mobile-webview'], deprecated: false, active: true },
      record2: { code: (publication.recordPrefix + "NavigationComponentType"), renderer: 'documentation.component.navigation', contractVersion: 0, channels: ['web', 'mobile-webview'], deprecated: false, active: true },
    },
  ),
  [("data/core-v001/records/documentation/" + publication.recordPrefix + "SlotData.js")]: jsModule(
    (publication.label + " documentation template slots."),
    {
      record0: { code: (publication.recordPrefix + "NavigationSlot"), template: (publication.recordPrefix + "ArticleTemplate"), name: 'navigation', minItems: 1, maxItems: 1, allowedComponentTypes: [(publication.recordPrefix + "NavigationComponentType")], active: true },
      record1: { code: (publication.recordPrefix + "ArticleSlot"), template: (publication.recordPrefix + "ArticleTemplate"), name: 'article', minItems: 1, maxItems: 1, allowedComponentTypes: [(publication.recordPrefix + "ArticleComponentType")], active: true },
    },
  ),
  [("data/core-v001/records/documentation/" + publication.recordPrefix + "TemplateData.js")]: jsModule(
    (publication.label + " documentation template."),
    {
      record0: { code: (publication.recordPrefix + "ArticleTemplate"), name: (publication.label + " Documentation Article"), renderer: 'documentation.template.article', contractVersion: 0, slots: [(publication.recordPrefix + "NavigationSlot"), (publication.recordPrefix + "ArticleSlot")], active: true },
    },
  ),
  [("data/core-v001/records/documentation/" + publication.recordPrefix + "ComponentData.js")]: jsModule(
    ("Generated " + publication.label + " documentation navigation and article content."),
    componentRecords,
  ),
  [("data/core-v001/records/documentation/" + publication.recordPrefix + "PageData.js")]: jsModule(
    ("Generated " + publication.label + " documentation pages."),
    pageRecords,
  ),
  [("data/core-v001/records/documentation/" + publication.recordPrefix + "RouteData.js")]: jsModule(
    ("Generated " + publication.label + " documentation routes."),
    routeRecords,
  ),
  [("data/core-v001/headers/" + publication.recordPrefix + "ContentPackHeader.js")]: `${copyrightHeader}'use strict';\n\n/** @description ${publication.label} core-import header for project documentation. */\nmodule.exports = {\n  cms: {\n    ${publication.recordPrefix}SiteData: { options: { enabled: true, schemaName: 'cmsSite', operation: 'saveAll', dataFilePrefix: '${publication.recordPrefix}SiteData' }, query: { code: '$code' } },\n    ${publication.recordPrefix}ProductData: { options: { enabled: true, schemaName: 'cmsDocumentationProduct', operation: 'saveAll', dataFilePrefix: '${publication.recordPrefix}ProductData' }, query: { code: '$code' } },\n    ${publication.recordPrefix}AccessPolicyData: { options: { enabled: true, schemaName: 'cmsDocumentationAccessPolicy', operation: 'saveAll', dataFilePrefix: '${publication.recordPrefix}AccessPolicyData' }, query: { code: '$code' } },\n    ${publication.recordPrefix}NavigationData: { options: { enabled: true, schemaName: 'cmsDocumentationNavigation', operation: 'saveAll', dataFilePrefix: '${publication.recordPrefix}NavigationData' }, query: { code: '$code' } },\n    ${publication.recordPrefix}DashboardData: { options: { enabled: true, schemaName: 'cmsDocumentationDashboard', operation: 'saveAll', dataFilePrefix: '${publication.recordPrefix}DashboardData' }, query: { code: '$code' } },\n    ${publication.recordPrefix}LegacyNavigationCleanupData: { options: { enabled: true, schemaName: 'cmsDocumentationNode', operation: 'remove', dataFilePrefix: '${publication.recordPrefix}LegacyNavigationCleanupData' }, query: { product: '${productCode}', navigation: '${navigationCode}', nodeLevel: { $in: ['GROUP', 'SUBGROUP', 'TOPIC'] } } },\n    ${publication.recordPrefix}NodeData: { options: { enabled: true, schemaName: 'cmsDocumentationNode', operation: 'saveAll', dataFilePrefix: '${publication.recordPrefix}NodeData' }, query: { code: '$code' } },\n    ${publication.recordPrefix}PageMetadataData: { options: { enabled: true, schemaName: 'cmsDocumentationPage', operation: 'saveAll', dataFilePrefix: '${publication.recordPrefix}PageMetadataData' }, query: { code: '$code' } },\n    ${publication.recordPrefix}PublicationStateData: { options: { enabled: true, schemaName: 'cmsDocumentationPublicationState', operation: 'saveAll', dataFilePrefix: '${publication.recordPrefix}PublicationStateData' }, query: { code: '$code' } },\n    ${publication.recordPrefix}SearchMetadataData: { options: { enabled: true, schemaName: 'cmsDocumentationSearchMetadata', operation: 'saveAll', dataFilePrefix: '${publication.recordPrefix}SearchMetadataData' }, query: { code: '$code' } },\n    ${publication.recordPrefix}TypeCodeData: { options: { enabled: true, schemaName: 'cmsTypeCode', operation: 'saveAll', dataFilePrefix: '${publication.recordPrefix}TypeCodeData' }, query: { code: '$code' } },\n    ${publication.recordPrefix}RendererData: { options: { enabled: true, schemaName: 'cmsTypeCode2Renderer', operation: 'saveAll', dataFilePrefix: '${publication.recordPrefix}RendererData' }, query: { code: '$code' } },\n    ${publication.recordPrefix}TemplateData: { options: { enabled: true, schemaName: 'cmsPageTemplate', operation: 'saveAll', dataFilePrefix: '${publication.recordPrefix}TemplateData' }, query: { code: '$code' } },\n    ${publication.recordPrefix}SlotData: { options: { enabled: true, schemaName: 'cmsSlotDefinition', operation: 'saveAll', dataFilePrefix: '${publication.recordPrefix}SlotData' }, query: { code: '$code' } },\n    ${publication.recordPrefix}ComponentData: { options: { enabled: true, schemaName: 'cmsComponent', operation: 'saveAll', dataFilePrefix: '${publication.recordPrefix}ComponentData' }, query: { code: '$code' } },\n    ${publication.recordPrefix}PageData: { options: { enabled: true, schemaName: 'cmsPage', operation: 'saveAll', dataFilePrefix: '${publication.recordPrefix}PageData' }, query: { code: '$code' } },\n    ${publication.recordPrefix}RouteData: { options: { enabled: true, schemaName: 'cmsPageRoute', operation: 'saveAll', dataFilePrefix: '${publication.recordPrefix}RouteData' }, query: { code: '$code' } },\n  },\n};\n`,
};

for (const [relativePath, content] of Object.entries(files)) {
  await writeOrCheck(relativePath, content);
}

const generatedHashes = Object.fromEntries(
  Object.keys(files).map((relativePath) => [
    relativePath.replace(/^data\//, ''),
    sha256(fs.readFileSync(path.join(root, relativePath))),
  ]),
);
const documentationSection = applicationDocumentationContract.buildReleaseSection({
  catalogue,
  generatedHashes,
  contentPath: 'core-v001',
  owningDomain: publication.owningDomain,
  environmentScope: ['ALL'],
  sensitivity: 'PUBLIC',
  sourceAuthority: 'docs/catalogue.json',
  sites: [(publication.recordPrefix + "Site")],
  accessMode: 'PUBLIC',
  pages: sourcePages.length,
  components: Object.keys(componentRecords).length,
  routes: sourcePages.length,
});
const previousManifest = fs.existsSync(manifestPath)
  ? JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  : { contractVersion: 2, module: project.name, sections: {} };
const manifest = {
  contractVersion: 2,
  module: project.name,
  sections: { ...(previousManifest.sections || {}), documentation: documentationSection },
};

await writeOrCheck('data/manifest.json', `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`${checkOnly ? 'Validated' : 'Generated'} ${sourcePages.length} ${publication.shortLabel} documentation pages`);
