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

const root = process.cwd();
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
    route: index === 0 ? '/docs/nodics-kickoff' : `/docs/nodics-kickoff/${slug(document.id.replace(/\./g, '-'))}`,
    codeSuffix,
  };
});

const sections = Array.isArray(catalogue.navigationSections)
  ? catalogue.navigationSections
  : [
      {
        code: 'nodics-kickoff',
        title: 'Nodics Kickoff',
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
  section: document.navigationSectionCode || 'nodics-kickoff',
  sectionTitle: document.navigationSection || 'Nodics Kickoff',
  sectionOrder: document.navigationSectionOrder || sections.find((section) => section.code === document.navigationSectionCode)?.order || 10,
  group: document.navigationGroupCode || document.navigationSectionCode || 'nodics-kickoff',
  groupTitle: document.navigationGroup || document.navigationSection || 'Nodics Kickoff',
  groupOrder: document.navigationGroupOrder || document.navigationOrder || (index + 1) * 10,
  subgroup: document.navigationSubgroupCode || null,
  subgroupTitle: document.navigationSubgroup || null,
  order: document.navigationOrder || (index + 1) * 10,
  parentId: document.parentId || null,
  hierarchyPath: document.hierarchyPath || ['Nodics Kickoff', document.title],
  hierarchyDepth: document.hierarchyDepth || 2,
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
  return `kickoffDocsPage${document.codeSuffix}`;
}

function routeCode(document) {
  return `kickoffDocsRoute${document.codeSuffix}`;
}

function articleCode(document) {
  return `kickoffDocsComponent${document.codeSuffix}`;
}

function metadataPageCode(document) {
  return `kickoffDocsMetadata${document.codeSuffix}`;
}

const productCode = 'kickoffDocumentationProduct';
const navigationCode = 'kickoffDocumentationNavigationTree';
const rootNodeCode = 'kickoffDocsNodeRoot';
const defaultLifecycle = 'ONLINE';
const publicAccessPolicyCode = 'kickoffDocsAccessPublic';
const authenticatedAccessPolicyCode = 'kickoffDocsAccessAuthenticated';
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
    name: 'Public Kickoff documentation access',
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
    name: 'Authenticated Kickoff documentation access',
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
    name: 'Nodics Kickoff Documentation',
    description: 'Project-owned documentation for the reference customer workspace, local setup, publication, qualification, customization, and functional journeys.',
    contentCatalog: 'documentationContentCatalog',
    site: 'kickoffDocumentationSite',
    publicRootPath: '/docs/kickoff',
    defaultLocale: 'en',
    channels: ['axis', 'nexus', 'web'],
    ownerFunctionalModule: 'nodics.kickoff',
    audience: ['business', 'architect', 'administrator', 'developer', 'operator', 'qa', 'ai-tool'],
    accessMode: 'PUBLIC',
    lifecycleState: defaultLifecycle,
    maturityState: 'IMPLEMENTED',
    active: true,
  },
};

const sectionNodeCodes = new Map();
const groupNodeCodes = new Map();
const subgroupNodeCodes = new Map();
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
  code: 'kickoffDocsDashboardProduct',
  ownerType: 'PRODUCT',
  ownerCode: productCode,
  title: 'Nodics Kickoff Documentation',
  summary: 'Landing content for the Kickoff customer-reference documentation catalogue, including setup, runtime, publication, qualification, customization, and functional journeys.',
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
  nodeTitle: 'Nodics Kickoff Documentation',
  nodeSummary: 'Root node for customer project documentation rendered through backend-owned, Axis-manageable content-catalog records.',
  nodeContentArea: { dashboard: 'kickoffDocsDashboardProduct' },
  nodeDashboard: 'kickoffDocsDashboardProduct',
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
  searchKeywords: ['kickoff', 'customer project', 'documentation'],
  relatedNodes: [],
  locale: 'en',
  channel: 'web',
  active: true,
});

sections.forEach((section) => {
  const sectionNodeCode = boundedCode('kickoffDocsNodeSec', [section.code]);
  sectionNodeCodes.set(section.code, sectionNodeCode);
  const sectionPages = sourcePages.filter((document) => (document.navigationSectionCode || 'nodics-kickoff') === section.code);
  const groups = [...new Map(sectionPages.map((document) => [
    document.navigationGroupCode || document.navigationSectionCode || 'nodics-kickoff',
    {
      code: document.navigationGroupCode || document.navigationSectionCode || 'nodics-kickoff',
      title: document.navigationGroup || document.navigationSection || 'Nodics Kickoff',
      order: document.navigationGroupOrder || 100,
    },
  ])).values()].sort((left, right) => left.order - right.order || left.title.localeCompare(right.title));
  const dashboardCode = boundedCode('kickoffDocsDashboardSec', [section.code]);
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
    cards: groups.map((group) => ({
      code: group.code,
      title: group.title,
      summary: `Open ${group.title} topics and implementation guidance.`,
      order: group.order,
    })),
    journeyLinks: sectionPages.slice(0, 6).map((document) => ({
      label: document.title,
      targetPage: document.id,
      route: document.route,
    })),
    statusSummary: { pages: sectionPages.length, groups: groups.length },
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
    childSummaryCards: groups.map((group) => ({
      code: group.code,
      title: group.title,
      order: group.order,
    })),
    childJourneyLinks: sectionPages.slice(0, 6).map((document) => ({
      label: document.title,
      targetPage: document.id,
      route: document.route,
    })),
    childStatusSummary: { childCount: groups.length, pages: sectionPages.length },
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
  const sectionCode = document.navigationSectionCode || 'nodics-kickoff';
  const groupCode = document.navigationGroupCode || document.navigationSectionCode || 'nodics-kickoff';
  const groupKey = `${sectionCode}:${groupCode}`;
  if (!groupNodeCodes.has(groupKey)) {
    const groupNodeCode = boundedCode('kickoffDocsNodeGrp', [sectionCode, groupCode]);
    const groupPages = sourcePages.filter((page) =>
      (page.navigationSectionCode || 'nodics-kickoff') === sectionCode &&
      (page.navigationGroupCode || page.navigationSectionCode || 'nodics-kickoff') === groupCode
    );
    const dashboardCode = boundedCode('kickoffDocsDashboardGrp', [sectionCode, groupCode]);
    groupNodeCodes.set(groupKey, groupNodeCode);
    pushDashboard({
      code: dashboardCode,
      ownerType: 'GROUP',
      ownerCode: groupNodeCode,
      title: document.navigationGroup || document.navigationSection || 'Nodics Kickoff',
      summary: `Detailed landing content for ${document.navigationGroup || document.navigationSection || 'Nodics Kickoff'}, including business purpose, customization behavior, and validation evidence.`,
      contentArea: {
        businessPurpose: 'Group customer-project documentation by the journey users recognize.',
        technicalPurpose: 'Keep project documentation navigation backend-owned and publication-governed.',
      },
      cards: groupPages.map((page) => ({
        code: page.id,
        title: page.title,
        summary: page.summary,
        order: page.navigationOrder,
      })),
      journeyLinks: groupPages.map((page) => ({
        label: page.title,
        targetPage: page.id,
        route: page.route,
      })),
      statusSummary: { pages: groupPages.length },
      accessMode: document.accessMode || 'PUBLIC',
      lifecycleState: document.lifecycleState || defaultLifecycle,
    });
    nodeRecords.push({
      code: groupNodeCode,
      product: productCode,
      navigation: navigationCode,
      parentNode: sectionNodeCodes.get(sectionCode),
      nodeLevel: 'GROUP',
      nodeType: 'CONTAINER',
      nodeTitle: document.navigationGroup || document.navigationSection || 'Nodics Kickoff',
      nodeSummary: `Business-friendly group for ${document.navigationGroup || document.navigationSection || 'Nodics Kickoff'} topics.`,
      nodeContentArea: { dashboard: dashboardCode, pages: groupPages.map((page) => page.id) },
      nodeDashboard: dashboardCode,
      childSummaryCards: groupPages.map((page) => ({
        code: page.id,
        title: page.title,
        summary: page.summary,
        order: page.navigationOrder,
      })),
      childJourneyLinks: groupPages.map((page) => ({
        label: page.title,
        targetPage: page.id,
        route: page.route,
      })),
      childStatusSummary: { childCount: groupPages.length },
      nodeOrder: document.navigationGroupOrder || document.navigationOrder || 100,
      expandable: true,
      expandedByDefault: false,
      nodeIcon: 'folder-open',
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
      relatedNodes: [],
      locale: document.locale || 'en',
      channel: 'web',
      active: true,
    });
  }
  let parentNode = groupNodeCodes.get(groupKey);
  if (document.navigationSubgroupCode) {
    const subgroupKey = `${groupKey}:${document.navigationSubgroupCode}`;
    if (!subgroupNodeCodes.has(subgroupKey)) {
      const subgroupNodeCode = boundedCode('kickoffDocsNodeSub', [sectionCode, groupCode, document.navigationSubgroupCode]);
      subgroupNodeCodes.set(subgroupKey, subgroupNodeCode);
      nodeRecords.push({
        code: subgroupNodeCode,
        product: productCode,
        navigation: navigationCode,
        parentNode,
        nodeLevel: 'SUBGROUP',
        nodeType: 'CONTAINER',
        nodeTitle: document.navigationSubgroup,
        nodeSummary: `Subgroup for ${document.navigationSubgroup} customer-project documentation topics.`,
        nodeContentArea: { pages: sourcePages.filter((page) => page.navigationSubgroupCode === document.navigationSubgroupCode).map((page) => page.id) },
        childSummaryCards: [],
        childJourneyLinks: [],
        childStatusSummary: { childCount: 0 },
        nodeOrder: document.navigationOrder || 100,
        expandable: true,
        expandedByDefault: false,
        nodeIcon: 'list-tree',
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
        relatedNodes: [],
        locale: document.locale || 'en',
        channel: 'web',
        active: true,
      });
    }
    parentNode = subgroupNodeCodes.get(subgroupKey);
  }
  nodeRecords.push({
    code: boundedCode('kickoffDocsNodeTopic', [document.id]),
    product: productCode,
    navigation: navigationCode,
    parentNode,
    nodeLevel: 'TOPIC',
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
    relatedNodes: (document.relatedPages || []).map((relatedPage) => boundedCode('kickoffDocsNodeTopic', [relatedPage])),
    locale: document.locale || 'en',
    channel: 'web',
    active: true,
  });
});

const navigationRecords = {
  record0: {
    code: navigationCode,
    product: productCode,
    name: 'Nodics Kickoff Documentation Navigation',
    renderer: 'documentation.component.navigation',
    searchLabel: 'Search Kickoff documentation',
    searchPlaceholder: 'Search setup, runtime, modules, and customization',
    emptyMessage: 'No Kickoff documentation matches your search.',
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
      template: 'kickoffDocumentationArticleTemplate',
      searchMetadata: boundedCode('kickoffDocsSearch', ['PAGE', metadataPageCode(document)]),
      headings: document.headings,
      diagrams: document.blocks.filter((block) => block.kind === 'diagram').map((block) => ({ language: block.language })),
      visualAssets: document.blocks.filter((block) => block.kind === 'image' || block.kind === 'table').map((block) => ({ kind: block.kind })),
      visualRequirements: document.visualRequirements || [],
      relatedPages: document.relatedPages || [],
      sourceRepository: 'nodics.kickoff',
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
      code: boundedCode('kickoffDocsPublication', [target.type, target.code]),
      targetType: target.type,
      targetCode: target.code,
      lifecycleState: target.lifecycleState || defaultLifecycle,
      publicationCode: 'kickoffDocumentation',
      workflowReference: 'kickoffDocumentationReviewWorkflow',
      stagedVersion: catalogue.release,
      ...(target.lifecycleState === 'ONLINE' ? { onlineVersion: catalogue.release } : {}),
      validationResult: {
        generated: true,
        sourceAuthority: 'docs/catalogue.json',
        publicationPath: 'STAGED_REVIEW_APPROVAL_ONLINE',
        nexusVisibleOnlyWhenOnlineAndPublic: true,
      },
      checksum: sha256(`${target.type}:${target.code}:${target.lifecycleState || defaultLifecycle}:${catalogue.release}`),
      ...workflowMetadata(target.type),
      decisionPolicy: publicationDecisionPolicy,
      actor: 'nodics.kickoff.generator',
      author: 'nodics.kickoff.generator',
      auditTrail: [],
      active: true,
    },
  ]),
);
const searchTargets = [
  {
    targetType: 'PRODUCT',
    targetCode: productCode,
    title: 'Nodics Kickoff Documentation',
    summary: productRecords.record0.description,
    searchText: `${productRecords.record0.name} ${productRecords.record0.description}`,
    keywords: ['kickoff', 'documentation', 'customer project'],
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
      section: document.navigationSectionCode || 'nodics-kickoff',
      group: document.navigationGroupCode || document.navigationSectionCode || 'nodics-kickoff',
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
      code: boundedCode('kickoffDocsSearch', [target.targetType, target.targetCode]),
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
        code: boundedCode('kickoffDocsPublication', ['SEARCH_METADATA', record.code]),
        targetType: 'SEARCH_METADATA',
        targetCode: record.code,
        lifecycleState: record.lifecycleState || defaultLifecycle,
        publicationCode: 'kickoffDocumentation',
        workflowReference: 'kickoffDocumentationReviewWorkflow',
        stagedVersion: catalogue.release,
        ...(record.lifecycleState === 'ONLINE' ? { onlineVersion: catalogue.release } : {}),
        validationResult: {
          generated: true,
          sourceAuthority: 'docs/catalogue.json',
          publicationPath: 'STAGED_REVIEW_APPROVAL_ONLINE',
          nexusVisibleOnlyWhenOnlineAndPublic: true,
        },
        checksum: sha256(`SEARCH_METADATA:${record.code}:${record.lifecycleState || defaultLifecycle}:${catalogue.release}`),
        ...workflowMetadata('SEARCH_METADATA'),
        decisionPolicy: publicationDecisionPolicy,
        actor: 'nodics.kickoff.generator',
        author: 'nodics.kickoff.generator',
        auditTrail: [],
        active: true,
      },
    ]),
  ),
);

const navigationComponent = {
  record0: {
    code: 'kickoffDocumentationNavigation',
    typeCode: 'kickoffDocumentationNavigationComponentType',
    renderer: 'documentation.component.navigation',
    accessMode: 'PUBLIC',
    properties: {
      title: 'Nodics Kickoff',
      searchLabel: 'Search Kickoff documentation',
      searchPlaceholder: 'Search setup, runtime, modules, and customization',
      emptyMessage: 'No Kickoff documentation matches your search.',
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
      code: `kickoffDocsComponent${document.codeSuffix}`,
      typeCode: 'kickoffDocumentationArticleComponentType',
      renderer: 'documentation.component.article',
      accessMode: 'PUBLIC',
      properties: {
        code: document.id,
        title: document.title,
        route: document.route,
        section: document.navigationSectionCode || 'nodics-kickoff',
        sectionTitle: document.navigationSection || 'Nodics Kickoff',
        group: document.navigationGroupCode || document.navigationSectionCode || 'nodics-kickoff',
        groupTitle: document.navigationGroup || document.navigationSection || 'Nodics Kickoff',
        parentId: document.parentId || null,
        hierarchyPath: document.hierarchyPath || ['Nodics Kickoff', document.title],
        hierarchyDepth: document.hierarchyDepth || 2,
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
          repository: 'nodics.kickoff',
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
      code: `kickoffDocsPage${document.codeSuffix}`,
      name: document.title,
      cmsSite: ['kickoffDocumentationSite'],
      typeCode: 'kickoffDocumentationArticlePageType',
      template: 'kickoffDocumentationArticleTemplate',
      renderer: 'documentation.page.article',
      cmsComponents: [
        { target: 'kickoffDocumentationNavigation', slot: 'navigation', index: 5, active: true },
        { target: `kickoffDocsComponent${document.codeSuffix}`, slot: 'article', index: 10, active: true },
      ],
      active: true,
    },
  ]),
);

const routeRecords = Object.fromEntries(
  sourcePages.map((document, index) => [
    `record${index}`,
    {
      code: `kickoffDocsRoute${document.codeSuffix}`,
      site: 'kickoffDocumentationSite',
      path: document.route,
      locale: document.locale || 'en',
      channel: 'web',
      page: `kickoffDocsPage${document.codeSuffix}`,
      routeType: 'PAGE',
      deliveryState: 'ONLINE',
      accessMode: 'PUBLIC',
      active: true,
    },
  ]),
);

const files = {
  'data/core-v001/records/documentation/kickoffDocumentationSiteData.js': jsModule(
    'Nodics Kickoff documentation site.',
    {
      record0: {
        code: 'kickoffDocumentationSite',
        name: 'Nodics Kickoff Documentation',
        catalog: 'documentationContentCatalog',
        active: true,
      },
    },
  ),
  'data/core-v001/records/documentation/kickoffDocumentationProductData.js': jsModule(
    'Generated Nodics Kickoff documentation product catalogue metadata.',
    productRecords,
  ),
  'data/core-v001/records/documentation/kickoffDocumentationAccessPolicyData.js': jsModule(
    'Generated Nodics Kickoff documentation access policies.',
    accessPolicyRecords,
  ),
  'data/core-v001/records/documentation/kickoffDocumentationNavigationData.js': jsModule(
    'Generated Nodics Kickoff documentation navigation catalogue metadata.',
    navigationRecords,
  ),
  'data/core-v001/records/documentation/kickoffDocumentationDashboardData.js': jsModule(
    'Generated Nodics Kickoff documentation hierarchy dashboards.',
    dashboardRecordMap,
  ),
  'data/core-v001/records/documentation/kickoffDocumentationNodeData.js': jsModule(
    'Generated Nodics Kickoff documentation hierarchy nodes.',
    nodeRecordMap,
  ),
  'data/core-v001/records/documentation/kickoffDocumentationPageMetadataData.js': jsModule(
    'Generated Nodics Kickoff documentation page metadata.',
    pageMetadataRecords,
  ),
  'data/core-v001/records/documentation/kickoffDocumentationPublicationStateData.js': jsModule(
    'Generated Nodics Kickoff documentation publication state metadata.',
    publicationStateRecords,
  ),
  'data/core-v001/records/documentation/kickoffDocumentationSearchMetadataData.js': jsModule(
    'Generated Nodics Kickoff documentation search metadata.',
    searchMetadataRecords,
  ),
  'data/core-v001/records/documentation/kickoffDocumentationTypeCodeData.js': jsModule(
    'Nodics Kickoff documentation page and component types.',
    {
      record0: { code: 'kickoffDocumentationArticlePageType', kind: 'PAGE', contractVersion: 0, active: true },
      record1: { code: 'kickoffDocumentationArticleComponentType', kind: 'COMPONENT', contractVersion: 0, active: true },
      record2: { code: 'kickoffDocumentationNavigationComponentType', kind: 'COMPONENT', contractVersion: 0, active: true },
    },
  ),
  'data/core-v001/records/documentation/kickoffDocumentationRendererData.js': jsModule(
    'Nodics Kickoff documentation renderer mappings consumed by Axis.',
    {
      record0: { code: 'kickoffDocumentationArticlePageType', renderer: 'documentation.page.article', contractVersion: 0, channels: ['web', 'mobile-webview'], deprecated: false, active: true },
      record1: { code: 'kickoffDocumentationArticleComponentType', renderer: 'documentation.component.article', contractVersion: 0, channels: ['web', 'mobile-webview'], deprecated: false, active: true },
      record2: { code: 'kickoffDocumentationNavigationComponentType', renderer: 'documentation.component.navigation', contractVersion: 0, channels: ['web', 'mobile-webview'], deprecated: false, active: true },
    },
  ),
  'data/core-v001/records/documentation/kickoffDocumentationSlotData.js': jsModule(
    'Nodics Kickoff documentation template slots.',
    {
      record0: { code: 'kickoffDocumentationNavigationSlot', template: 'kickoffDocumentationArticleTemplate', name: 'navigation', minItems: 1, maxItems: 1, allowedComponentTypes: ['kickoffDocumentationNavigationComponentType'], active: true },
      record1: { code: 'kickoffDocumentationArticleSlot', template: 'kickoffDocumentationArticleTemplate', name: 'article', minItems: 1, maxItems: 1, allowedComponentTypes: ['kickoffDocumentationArticleComponentType'], active: true },
    },
  ),
  'data/core-v001/records/documentation/kickoffDocumentationTemplateData.js': jsModule(
    'Nodics Kickoff documentation template.',
    {
      record0: { code: 'kickoffDocumentationArticleTemplate', name: 'Nodics Kickoff Documentation Article', renderer: 'documentation.template.article', contractVersion: 0, slots: ['kickoffDocumentationNavigationSlot', 'kickoffDocumentationArticleSlot'], active: true },
    },
  ),
  'data/core-v001/records/documentation/kickoffDocumentationComponentData.js': jsModule(
    'Generated Nodics Kickoff documentation navigation and article content.',
    componentRecords,
  ),
  'data/core-v001/records/documentation/kickoffDocumentationPageData.js': jsModule(
    'Generated Nodics Kickoff documentation pages.',
    pageRecords,
  ),
  'data/core-v001/records/documentation/kickoffDocumentationRouteData.js': jsModule(
    'Generated Nodics Kickoff documentation routes.',
    routeRecords,
  ),
  'data/core-v001/headers/kickoffDocumentationContentPackHeader.js': `${copyrightHeader}'use strict';\n\n/** @description Nodics Kickoff core-import header for project documentation. */\nmodule.exports = {\n  cms: {\n    kickoffDocumentationSiteData: { options: { enabled: true, schemaName: 'cmsSite', operation: 'saveAll', dataFilePrefix: 'kickoffDocumentationSiteData' }, query: { code: '$code' } },\n    kickoffDocumentationProductData: { options: { enabled: true, schemaName: 'cmsDocumentationProduct', operation: 'saveAll', dataFilePrefix: 'kickoffDocumentationProductData' }, query: { code: '$code' } },\n    kickoffDocumentationAccessPolicyData: { options: { enabled: true, schemaName: 'cmsDocumentationAccessPolicy', operation: 'saveAll', dataFilePrefix: 'kickoffDocumentationAccessPolicyData' }, query: { code: '$code' } },\n    kickoffDocumentationNavigationData: { options: { enabled: true, schemaName: 'cmsDocumentationNavigation', operation: 'saveAll', dataFilePrefix: 'kickoffDocumentationNavigationData' }, query: { code: '$code' } },\n    kickoffDocumentationDashboardData: { options: { enabled: true, schemaName: 'cmsDocumentationDashboard', operation: 'saveAll', dataFilePrefix: 'kickoffDocumentationDashboardData' }, query: { code: '$code' } },\n    kickoffDocumentationNodeData: { options: { enabled: true, schemaName: 'cmsDocumentationNode', operation: 'saveAll', dataFilePrefix: 'kickoffDocumentationNodeData' }, query: { code: '$code' } },\n    kickoffDocumentationPageMetadataData: { options: { enabled: true, schemaName: 'cmsDocumentationPage', operation: 'saveAll', dataFilePrefix: 'kickoffDocumentationPageMetadataData' }, query: { code: '$code' } },\n    kickoffDocumentationPublicationStateData: { options: { enabled: true, schemaName: 'cmsDocumentationPublicationState', operation: 'saveAll', dataFilePrefix: 'kickoffDocumentationPublicationStateData' }, query: { code: '$code' } },\n    kickoffDocumentationSearchMetadataData: { options: { enabled: true, schemaName: 'cmsDocumentationSearchMetadata', operation: 'saveAll', dataFilePrefix: 'kickoffDocumentationSearchMetadataData' }, query: { code: '$code' } },\n    kickoffDocumentationTypeCodeData: { options: { enabled: true, schemaName: 'cmsTypeCode', operation: 'saveAll', dataFilePrefix: 'kickoffDocumentationTypeCodeData' }, query: { code: '$code' } },\n    kickoffDocumentationRendererData: { options: { enabled: true, schemaName: 'cmsTypeCode2Renderer', operation: 'saveAll', dataFilePrefix: 'kickoffDocumentationRendererData' }, query: { code: '$code' } },\n    kickoffDocumentationTemplateData: { options: { enabled: true, schemaName: 'cmsPageTemplate', operation: 'saveAll', dataFilePrefix: 'kickoffDocumentationTemplateData' }, query: { code: '$code' } },\n    kickoffDocumentationSlotData: { options: { enabled: true, schemaName: 'cmsSlotDefinition', operation: 'saveAll', dataFilePrefix: 'kickoffDocumentationSlotData' }, query: { code: '$code' } },\n    kickoffDocumentationComponentData: { options: { enabled: true, schemaName: 'cmsComponent', operation: 'saveAll', dataFilePrefix: 'kickoffDocumentationComponentData' }, query: { code: '$code' } },\n    kickoffDocumentationPageData: { options: { enabled: true, schemaName: 'cmsPage', operation: 'saveAll', dataFilePrefix: 'kickoffDocumentationPageData' }, query: { code: '$code' } },\n    kickoffDocumentationRouteData: { options: { enabled: true, schemaName: 'cmsPageRoute', operation: 'saveAll', dataFilePrefix: 'kickoffDocumentationRouteData' }, query: { code: '$code' } },\n  },\n};\n`,
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
  owningDomain: 'kickoff.documentation',
  environmentScope: ['ALL'],
  sensitivity: 'PUBLIC',
  sourceAuthority: 'docs/catalogue.json',
  sites: ['kickoffDocumentationSite'],
  accessMode: 'PUBLIC',
  pages: sourcePages.length,
  components: Object.keys(componentRecords).length,
  routes: sourcePages.length,
});
const previousManifest = fs.existsSync(manifestPath)
  ? JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  : { contractVersion: 2, module: 'nodics.kickoff', sections: {} };
const manifest = {
  contractVersion: 2,
  module: 'nodics.kickoff',
  sections: { ...(previousManifest.sections || {}), documentation: documentationSection },
};

await writeOrCheck('data/manifest.json', `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`${checkOnly ? 'Validated' : 'Generated'} ${sourcePages.length} Kickoff documentation pages`);
