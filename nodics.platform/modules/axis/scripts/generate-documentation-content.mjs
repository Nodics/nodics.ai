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
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const applicationDocumentationContract = require('../../../../nodics.foundation/modules/nTooling/src/service/defaultApplicationDocumentationContractService.js');
const sourceRoot = path.join(root, 'docs');
const navigationPath = path.join(sourceRoot, 'catalogue.json');
const pageOutputPath = path.join(
  root,
  'data/core-v001/records/documentation/axisDocumentationPageData.js',
);
const componentOutputPath = path.join(
  root,
  'data/core-v001/records/documentation/axisDocumentationComponentData.js',
);
const routeOutputPath = path.join(
  root,
  'data/core-v001/records/documentation/axisDocumentationRouteData.js',
);
const migrationRegisterPath = path.join(
  root,
  'docs/migration-register.json',
);
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

const navigation = JSON.parse(fs.readFileSync(navigationPath, 'utf8'));
const pages = navigation.pages;
const catalogueDocuments = pages.map((page) => ({
  id: page.id || `axis.${page.code}`,
  title: page.title,
  summary: page.summary,
  locale: page.locale || 'en',
  content: page.content || `docs/${page.source}`,
  slug: page.slug,
  parentId: page.parentId,
  hierarchyPath: page.hierarchyPath,
  hierarchyDepth: page.hierarchyDepth,
  navigationSection: page.navigationSection || page.section,
  navigationSectionCode: page.navigationSectionCode || slug(page.section),
  navigationGroup: page.navigationGroup || page.section,
  navigationGroupCode: page.navigationGroupCode || slug(page.navigationGroup || page.section),
  navigationOrder: page.navigationOrder || page.order,
  documentType: page.documentType,
  audience: page.audience,
  businessAudience: page.businessAudience || [],
  technicalAudience: page.technicalAudience || [],
  sourceOwner: page.sourceOwner || 'nodics.platform/modules/axis',
  sourcePath: page.sourcePath || `docs/${page.source}`,
  accessMode: page.accessMode || 'PUBLIC',
  lifecycleState: page.lifecycleState || 'ONLINE',
  maturityState: page.maturityState || 'operational',
  relatedPages: page.relatedPages || [],
  sourceEvidence: page.sourceEvidence || [page.evidence],
  visualRequirements: page.visualRequirements || [],
}));
applicationDocumentationContract.validateCatalogue({
  ownerRoot: root,
  sourceDirectory: 'docs',
  cataloguePath: 'docs/catalogue.json',
  catalogue: {
    pack: navigation.pack,
    version: navigation.version,
    navigationSections: navigation.navigationSections,
    documents: catalogueDocuments,
  },
  requireNavigationSections: true,
  requireEnterpriseMetadata: true,
  validateContentQuality: true,
});
const previousMigrationRegister = fs.existsSync(migrationRegisterPath)
  ? JSON.parse(fs.readFileSync(migrationRegisterPath, 'utf8'))
  : { sources: [] };
const previousMigrationByEvidence = new Map(
  previousMigrationRegister.sources.map((source) => [source.evidence, source]),
);
const routeByEvidence = new Map(
  pages.map((page) => [page.evidence.replace(/^docs\//, ''), page.route]),
);

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function slug(value) {
  return value
    .toLowerCase()
    .replace(/[`*_]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function camel(value) {
  return slug(String(value)).replace(/-([a-z0-9])/g, (_, character) =>
    character.toUpperCase(),
  );
}

function wordCount(value) {
  return (value.match(/\b[\p{L}\p{N}][\p{L}\p{N}'’-]*\b/gu) || []).length;
}

function markdownHeadings(value) {
  return value.split(/\r?\n/).flatMap((line) => {
    const match = /^#{2,4}\s+(.+)$/.exec(line.trim());
    return match?.[1] ? [match[1]] : [];
  });
}

function normalizeLinks(value) {
  return value.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, label, targetValue) => {
    const target = targetValue.trim();
    const [pathValue, anchor] = target.split('#');
    if (!pathValue.endsWith('.md')) return match;
    const baseName = path.basename(pathValue);
    const route =
      baseName === 'README.md' ? '/docs/nodics-axis' : routeByEvidence.get(baseName);
    if (!route) return match;
    return `[${label}](${route}${anchor ? `#${anchor}` : ''})`;
  });
}

function tableCells(line) {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => normalizeLinks(cell.trim()));
}

function isTableSeparator(line) {
  const cells = tableCells(line);
  return (
    cells.length > 0 &&
    cells.every((cell) => /^:?-{3,}:?$/.test(cell.replace(/\s/g, '')))
  );
}

function parseMarkdown(markdown, pageCode) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const blocks = [];
  let paragraph = [];
  let index = 0;
  let headingIndex = 0;

  const flushParagraph = () => {
    const value = paragraph.join(' ').trim();
    paragraph = [];
    if (value) blocks.push({ kind: 'paragraph', text: normalizeLinks(value) });
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
      if (level > 1) {
        headingIndex += 1;
        const text = normalizeLinks(heading[2].trim());
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
          current.startsWith('>')
        ) {
          break;
        }
        items[items.length - 1] += ` ${current}`;
        index += 1;
      }
      blocks.push({
        kind: 'unordered-list',
        items: items.map((item) => normalizeLinks(item)),
      });
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
          current.startsWith('>')
        ) {
          break;
        }
        items[items.length - 1] += ` ${current}`;
        index += 1;
      }
      blocks.push({
        kind: 'ordered-list',
        items: items.map((item) => normalizeLinks(item)),
      });
      continue;
    }

    if (trimmed.startsWith('>')) {
      flushParagraph();
      const quote = [];
      while (index < lines.length && lines[index].trim().startsWith('>')) {
        quote.push(lines[index].trim().replace(/^>\s?/, ''));
        index += 1;
      }
      blocks.push({
        kind: 'blockquote',
        text: normalizeLinks(quote.join(' ').trim()),
      });
      continue;
    }

    if (!trimmed || /^-{3,}$/.test(trimmed)) {
      flushParagraph();
      index += 1;
      continue;
    }

    paragraph.push(trimmed);
    index += 1;
  }

  flushParagraph();
  return blocks;
}

function recordModule(records, description) {
  return `${copyrightHeader}'use strict';\n\n/** @description ${description} */\nmodule.exports = ${JSON.stringify(
    records,
    omitUnsetFields,
    2,
  )};\n`;
}

function omitUnsetFields(_key, value) {
  return value === null ? undefined : value;
}

async function writeOrCheck(relativePath, content) {
  const absolutePath = path.join(root, relativePath);
  const formattedContent = content;
  if (checkOnly) {
    const current = fs.existsSync(absolutePath)
      ? fs.readFileSync(absolutePath, 'utf8')
      : undefined;
    if (current !== formattedContent) {
      throw new Error(`Generated documentation is stale: ${relativePath}`);
    }
    return;
  }
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, formattedContent);
}

const sourcePages = pages.map((page) => {
  const sourcePath = path.join(sourceRoot, page.source);
  const markdown = fs.readFileSync(sourcePath, 'utf8');
  const blocks = parseMarkdown(markdown, page.code);
  const headings = blocks
    .filter((block) => block.kind === 'heading')
    .map((block) => ({
      text: block.text,
      anchor: block.anchor,
      level: block.level,
    }));
  return {
    ...page,
    markdown,
    blocks,
    headings,
    sourceHash: sha256(markdown),
    wordCount: wordCount(markdown),
  };
});

const navigationItems = sourcePages.map((page) => ({
  code: page.id || `axis.${page.code}`,
  title: page.title,
  route: page.route,
  section: page.navigationSectionCode || slug(page.section),
  sectionTitle: page.navigationSection || page.section,
  sectionOrder: page.navigationSectionOrder || page.sectionOrder,
  group: page.navigationGroupCode || slug(page.navigationGroup || page.section),
  groupTitle: page.navigationGroup || page.section,
  groupOrder: page.navigationGroupOrder || page.navigationOrder || page.order,
  subgroup: page.navigationSubgroupCode || null,
  subgroupTitle: page.navigationSubgroup || null,
  order: page.navigationOrder || page.order,
  parentId: page.parentId || null,
  hierarchyPath: page.hierarchyPath || [page.section, page.title],
  hierarchyDepth: page.hierarchyDepth || 2,
  documentType: page.documentType || 'overview',
  audience: page.audience,
  businessAudience: page.businessAudience || [],
  technicalAudience: page.technicalAudience || [],
  summary: page.summary,
  visibility: page.visibility || 'public',
  accessMode: page.accessMode || 'PUBLIC',
  publiclyAvailable: page.publiclyAvailable !== false,
  requiresAuthentication: Boolean(page.requiresAuthentication),
  allowedRoles: page.allowedRoles || [],
  allowedGroups: page.allowedGroups || [],
  allowedPermissions: page.allowedPermissions || [],
  lifecycleState: page.lifecycleState || 'ONLINE',
  maturityState: page.maturityState || 'operational',
  implementationState: page.implementationState || 'current',
  visualRequirements: page.visualRequirements || [],
  relatedPages: page.relatedPages || [],
  searchKeywords: page.searchKeywords || [],
  topicKeywords: page.topicKeywords || [],
  searchText: `${page.title} ${page.summary} ${page.markdown}`,
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

const productCode = 'axisDocumentationProduct';
const navigationCode = 'axisDocumentationNavigationMetadata';
const rootNodeCode = 'axisDocsNodeRoot';
const defaultLifecycle = 'ONLINE';
const publicAccessPolicyCode = 'axisDocsAccessPublic';
const authenticatedAccessPolicyCode = 'axisDocsAccessAuthenticated';
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
const accessPolicyFor = (item) =>
  (item && item.accessMode) === 'PUBLIC'
    ? publicAccessPolicyCode
    : authenticatedAccessPolicyCode;
const pageRecordCode = (page) => `axisDocsPage${page.code.replaceAll('-', '')}`;
const routeRecordCode = (page) => `axisDocsRoute${page.code.replaceAll('-', '')}`;
const articleRecordCode = (page) =>
  `axisDocsComponent${page.code.replaceAll('-', '')}`;
const metadataPageCode = (page) =>
  `axisDocsMetadata${page.code.replaceAll('-', '')}`;

const sectionEntries = new Map();
(navigation.navigationSections || []).forEach((section, index) => {
  const title = section.title;
  const code = section.code || slug(title);
  if (!title || !code) {
    throw new Error(`Invalid Axis documentation navigation section at index ${index}`);
  }
  sectionEntries.set(code, {
    code,
    title,
    order: section.order || (index + 1) * 10,
    summary: section.summary || '',
    audience: section.audience || ['administrator', 'business-user', 'developer'],
    visibility: section.visibility || 'public',
    accessMode: section.accessMode || 'PUBLIC',
    lifecycleState: section.lifecycleState || defaultLifecycle,
  });
});
sourcePages.forEach((page, index) => {
  const title = page.navigationSection || page.section;
  const code = page.navigationSectionCode || slug(title);
  if (!sectionEntries.has(code)) {
    sectionEntries.set(code, {
      code,
      title,
      order: page.navigationSectionOrder || page.sectionOrder || (index + 1) * 10,
      summary: `${title} documentation topics for Axis business and technical users.`,
      audience: page.audience || ['administrator', 'business-user', 'developer'],
      visibility: page.visibility || 'public',
      accessMode: page.accessMode || 'PUBLIC',
      lifecycleState: page.lifecycleState || defaultLifecycle,
    });
  }
});
const sections = [...sectionEntries.values()].sort((left, right) =>
  left.order - right.order || left.title.localeCompare(right.title),
);

const accessPolicyRecords = {
  record0: {
    code: publicAccessPolicyCode,
    name: 'Public Axis documentation access',
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
    name: 'Authenticated Axis documentation access',
    targetType: 'PRODUCT',
    targetCode: productCode,
    accessMode: 'AUTHENTICATED',
    publiclyAvailable: false,
    requiresAuthentication: true,
    allowedRoles: ['documentationAuthor', 'axisViewer'],
    allowedGroups: ['employeeUserGroup'],
    allowedPermissions: ['axis.documentation.read'],
    lifecycleVisibility: ['ONLINE'],
    ...workflowMetadata('ACCESS_POLICY'),
    priority: 20,
    active: true,
  },
};

const productRecords = {
  record0: {
    code: productCode,
    name: 'Nodics Axis Documentation',
    description:
      'Business and developer documentation for the Axis BackOffice application, managed through the shared documentation content catalog.',
    contentCatalog: 'documentationContentCatalog',
    site: 'axisDocumentationSite',
    publicRootPath: '/docs/nodics-axis',
    defaultLocale: 'en',
    channels: ['axis', 'nexus', 'web'],
    ownerFunctionalModule: 'nodics.platform.axis',
    audience: ['business-user', 'administrator', 'developer', 'operator', 'ai-tool'],
    accessMode: 'PUBLIC',
    lifecycleState: defaultLifecycle,
    maturityState: 'IMPLEMENTED',
    active: true,
  },
};

const navigationComponent = {
  code: 'axisDocumentationNavigation',
  typeCode: 'axisDocumentationNavigationComponentType',
  renderer: 'documentation.component.navigation',
  accessMode: 'PUBLIC',
  properties: {
    title: navigation.title,
    searchLabel: 'Search Nodics Axis documentation',
    searchPlaceholder:
      'Search setup, architecture, features, security, and troubleshooting',
    emptyMessage: 'No Nodics Axis documentation matches your search.',
    sections: Array.isArray(navigation.navigationSections)
      ? navigation.navigationSections
      : Array.from(
          new Map(
            sourcePages.map((page) => [
              page.section,
              {
                code: slug(page.section),
                title: page.section,
                order: page.sectionOrder,
              },
            ]),
          ).values(),
        ),
    items: navigationItems,
  },
  active: true,
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
  code: 'axisDocsDashboardProduct',
  ownerType: 'PRODUCT',
  ownerCode: productCode,
  title: 'Nodics Axis Documentation',
  summary:
    'Documentation landing content for Axis setup, navigation, content operations, schema tools, publishing, security, and safe extension journeys.',
  contentArea: {
    intent:
      'Help administrators, business users, developers, and operators enter the correct Axis documentation journey without needing internal module names.',
  },
  cards: sections.map((section) => ({
    code: section.code,
    title: section.title,
    summary: section.summary,
    order: section.order,
  })),
  journeyLinks: [
    { label: 'Understand Axis', targetNode: 'discover-axis' },
    { label: 'Build and operate Axis', targetNode: 'build-and-operate-axis' },
    { label: 'Manage content and documentation', targetNode: 'content-and-documentation' },
  ],
  statusSummary: {
    sections: sections.length,
    pages: sourcePages.length,
    lifecycleState: defaultLifecycle,
  },
});

pushDashboard({
  code: 'axisDocsDashboardNavigation',
  ownerType: 'NAVIGATION',
  ownerCode: navigationCode,
  title: 'Nodics Axis Documentation Navigation',
  summary:
    'Expandable and searchable Axis documentation navigation generated from backend-owned content-catalog metadata.',
  contentArea: {
    navigationPattern:
      'Sections, groups, subgroups, and topics are content records so Axis can reorder, preview, submit, approve, and publish documentation without hardcoded frontend navigation.',
  },
  cards: sections.map((section) => ({
    code: section.code,
    title: section.title,
    summary: section.summary,
    order: section.order,
  })),
  journeyLinks: sourcePages.slice(0, 6).map((page) => ({
    label: page.title,
    targetPage: page.id || `axis.${page.code}`,
    route: page.route,
  })),
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
  parentNode: null,
  nodeLevel: 'SECTION',
  nodeType: 'CONTAINER',
  nodeTitle: 'Nodics Axis Documentation',
  nodeSummary:
    'Root Axis documentation node for application overview, management, rendering, setup, operations, and extension topics.',
  nodeContentArea: {
    dashboard: 'axisDocsDashboardProduct',
    purpose:
      'Give Axis and Nexus a backend-owned root for expandable Axis documentation navigation.',
  },
  nodeDashboard: 'axisDocsDashboardProduct',
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
  nodeAudience: ['business-user', 'administrator', 'developer', 'operator', 'ai-tool'],
  accessPolicy: publicAccessPolicyCode,
  accessMode: 'PUBLIC',
  allowedRoles: [],
  allowedGroups: [],
  allowedPermissions: [],
  ...workflowMetadata('NODE'),
  lifecycleState: defaultLifecycle,
  maturityState: 'IMPLEMENTED',
  searchKeywords: ['axis', 'documentation', 'backoffice'],
  relatedNodes: [],
  locale: 'en',
  channel: 'web',
  active: true,
});

sections.forEach((section) => {
  const sectionNodeCode = boundedCode('axisDocsNodeSec', [section.code]);
  sectionNodeCodes.set(section.code, sectionNodeCode);
  const sectionPages = sourcePages.filter(
    (page) => (page.navigationSectionCode || slug(page.section)) === section.code,
  );
  const groups = [
    ...new Map(
      sectionPages.map((page) => [
        page.navigationGroupCode || slug(page.navigationGroup || page.section),
        {
          code: page.navigationGroupCode || slug(page.navigationGroup || page.section),
          title: page.navigationGroup || page.section,
          order: page.navigationGroupOrder || page.navigationOrder || page.order,
        },
      ]),
    ).values(),
  ].sort((left, right) => left.order - right.order || left.title.localeCompare(right.title));
  const dashboardCode = boundedCode('axisDocsDashboardSec', [section.code]);
  pushDashboard({
    code: dashboardCode,
    ownerType: 'SECTION',
    ownerCode: sectionNodeCode,
    title: section.title,
    summary: section.summary || `Axis documentation section for ${section.title}.`,
    contentArea: {
      businessPurpose: section.summary || `Guide users through ${section.title}.`,
      technicalPurpose:
        'This section is a backend documentation node with ordered children, search metadata, access policy, and publication lifecycle state.',
    },
    cards: groups.map((group) => ({
      code: group.code,
      title: group.title,
      summary: `Open ${group.title} topics and implementation guidance.`,
      order: group.order,
    })),
    journeyLinks: sectionPages.slice(0, 6).map((page) => ({
      label: page.title,
      targetPage: page.id || `axis.${page.code}`,
      route: page.route,
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
    nodeSummary: section.summary || `Axis documentation section for ${section.title}.`,
    nodeContentArea: {
      dashboard: dashboardCode,
      groups: groups.map((group) => group.code),
      pages: sectionPages.map((page) => page.id || `axis.${page.code}`),
    },
    nodeDashboard: dashboardCode,
    childSummaryCards: groups.map((group) => ({
      code: group.code,
      title: group.title,
      order: group.order,
    })),
    childJourneyLinks: sectionPages.slice(0, 6).map((page) => ({
      label: page.title,
      targetPage: page.id || `axis.${page.code}`,
      route: page.route,
    })),
    childStatusSummary: { childCount: groups.length, pages: sectionPages.length },
    nodeOrder: section.order,
    expandable: true,
    expandedByDefault: false,
    nodeIcon: 'folder',
    nodeAudience: section.audience || ['administrator', 'business-user', 'developer'],
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

sourcePages.forEach((page) => {
  const sectionCode = page.navigationSectionCode || slug(page.section);
  const groupCode = page.navigationGroupCode || slug(page.navigationGroup || page.section);
  const groupKey = `${sectionCode}:${groupCode}`;
  if (!groupNodeCodes.has(groupKey)) {
    const groupNodeCode = boundedCode('axisDocsNodeGrp', [sectionCode, groupCode]);
    const groupPages = sourcePages.filter(
      (candidate) =>
        (candidate.navigationSectionCode || slug(candidate.section)) === sectionCode &&
        (candidate.navigationGroupCode ||
          slug(candidate.navigationGroup || candidate.section)) === groupCode,
    );
    const subgroups = [
      ...new Map(
        groupPages
          .filter((candidate) => candidate.navigationSubgroupCode)
          .map((candidate) => [
            candidate.navigationSubgroupCode,
            {
              code: candidate.navigationSubgroupCode,
              title: candidate.navigationSubgroup,
              order: candidate.navigationOrder || candidate.order,
            },
          ]),
      ).values(),
    ];
    const dashboardCode = boundedCode('axisDocsDashboardGrp', [sectionCode, groupCode]);
    groupNodeCodes.set(groupKey, groupNodeCode);
    pushDashboard({
      code: dashboardCode,
      ownerType: 'GROUP',
      ownerCode: groupNodeCode,
      title: page.navigationGroup || page.section,
      summary: `Detailed landing content for ${page.navigationGroup || page.section}, including business purpose, technical ownership, customization routes, and validation evidence.`,
      contentArea: {
        businessPurpose:
          'Group related Axis topics so business and development users can enter from the capability they recognize.',
        technicalPurpose:
          'Preserve Axis group ownership as backend records that can be reordered and summarized through Axis.',
      },
      cards: groupPages.map((candidate) => ({
        code: candidate.id || `axis.${candidate.code}`,
        title: candidate.title,
        summary: candidate.summary,
        order: candidate.navigationOrder || candidate.order,
      })),
      journeyLinks: groupPages.map((candidate) => ({
        label: candidate.title,
        targetPage: candidate.id || `axis.${candidate.code}`,
        route: candidate.route,
      })),
      statusSummary: { pages: groupPages.length, subgroups: subgroups.length },
      accessMode: page.accessMode || 'PUBLIC',
      lifecycleState: page.lifecycleState || defaultLifecycle,
    });
    nodeRecords.push({
      code: groupNodeCode,
      product: productCode,
      navigation: navigationCode,
      parentNode: sectionNodeCodes.get(sectionCode),
      nodeLevel: 'GROUP',
      nodeType: 'CONTAINER',
      nodeTitle: page.navigationGroup || page.section,
      nodeSummary: `Business-friendly group for ${page.navigationGroup || page.section} documentation topics.`,
      nodeContentArea: {
        dashboard: dashboardCode,
        pages: groupPages.map((candidate) => candidate.id || `axis.${candidate.code}`),
        subgroups: subgroups.map((subgroup) => subgroup.code),
      },
      nodeDashboard: dashboardCode,
      childSummaryCards: groupPages.map((candidate) => ({
        code: candidate.id || `axis.${candidate.code}`,
        title: candidate.title,
        summary: candidate.summary,
        order: candidate.navigationOrder || candidate.order,
      })),
      childJourneyLinks: groupPages.map((candidate) => ({
        label: candidate.title,
        targetPage: candidate.id || `axis.${candidate.code}`,
        route: candidate.route,
      })),
      childStatusSummary: { childCount: groupPages.length, subgroups: subgroups.length },
      nodeOrder: page.navigationGroupOrder || page.navigationOrder || page.order,
      expandable: true,
      expandedByDefault: false,
      nodeIcon: 'folder-open',
      nodeAudience: page.audience || ['administrator', 'business-user', 'developer'],
      accessPolicy: accessPolicyFor(page),
      accessMode: page.accessMode || 'PUBLIC',
      allowedRoles: page.allowedRoles || [],
      allowedGroups: page.allowedGroups || [],
      allowedPermissions: page.allowedPermissions || [],
      ...workflowMetadata('NODE'),
      lifecycleState: page.lifecycleState || defaultLifecycle,
      maturityState: schemaMaturity(page.maturityState),
      searchKeywords: page.searchKeywords || [],
      relatedNodes: [],
      locale: page.locale || 'en',
      channel: 'web',
      active: true,
    });
  }

  let parentNode = groupNodeCodes.get(groupKey);
  if (page.navigationSubgroupCode) {
    const subgroupKey = `${groupKey}:${page.navigationSubgroupCode}`;
    if (!subgroupNodeCodes.has(subgroupKey)) {
      const subgroupNodeCode = boundedCode('axisDocsNodeSub', [
        sectionCode,
        groupCode,
        page.navigationSubgroupCode,
      ]);
      const subgroupPages = sourcePages.filter(
        (candidate) =>
          (candidate.navigationSectionCode || slug(candidate.section)) === sectionCode &&
          (candidate.navigationGroupCode ||
            slug(candidate.navigationGroup || candidate.section)) === groupCode &&
          candidate.navigationSubgroupCode === page.navigationSubgroupCode,
      );
      const dashboardCode = boundedCode('axisDocsDashboardSub', [
        sectionCode,
        groupCode,
        page.navigationSubgroupCode,
      ]);
      subgroupNodeCodes.set(subgroupKey, subgroupNodeCode);
      pushDashboard({
        code: dashboardCode,
        ownerType: 'SUBGROUP',
        ownerCode: subgroupNodeCode,
        title: page.navigationSubgroup,
        summary: `Detailed landing content for ${page.navigationSubgroup}, with links to each owned Axis topic and implementation reference.`,
        contentArea: {
          businessPurpose:
            'Separate deeper Axis details without forcing users to know internal source paths.',
          technicalPurpose:
            'Keep related topics under a stable backend node for Axis-managed order, access, and publication lifecycle.',
        },
        cards: subgroupPages.map((candidate) => ({
          code: candidate.id || `axis.${candidate.code}`,
          title: candidate.title,
          summary: candidate.summary,
          order: candidate.navigationOrder || candidate.order,
        })),
        journeyLinks: subgroupPages.map((candidate) => ({
          label: candidate.title,
          targetPage: candidate.id || `axis.${candidate.code}`,
          route: candidate.route,
        })),
        statusSummary: { pages: subgroupPages.length },
        accessMode: page.accessMode || 'PUBLIC',
        lifecycleState: page.lifecycleState || defaultLifecycle,
      });
      nodeRecords.push({
        code: subgroupNodeCode,
        product: productCode,
        navigation: navigationCode,
        parentNode,
        nodeLevel: 'SUBGROUP',
        nodeType: 'CONTAINER',
        nodeTitle: page.navigationSubgroup,
        nodeSummary: `Subgroup for ${page.navigationSubgroup} Axis documentation topics.`,
        nodeContentArea: {
          dashboard: dashboardCode,
          pages: subgroupPages.map((candidate) => candidate.id || `axis.${candidate.code}`),
        },
        nodeDashboard: dashboardCode,
        childSummaryCards: subgroupPages.map((candidate) => ({
          code: candidate.id || `axis.${candidate.code}`,
          title: candidate.title,
          summary: candidate.summary,
          order: candidate.navigationOrder || candidate.order,
        })),
        childJourneyLinks: subgroupPages.map((candidate) => ({
          label: candidate.title,
          targetPage: candidate.id || `axis.${candidate.code}`,
          route: candidate.route,
        })),
        childStatusSummary: { childCount: subgroupPages.length },
        nodeOrder: page.navigationOrder || page.order,
        expandable: true,
        expandedByDefault: false,
        nodeIcon: 'list-tree',
        nodeAudience: page.audience || ['administrator', 'business-user', 'developer'],
        accessPolicy: accessPolicyFor(page),
        accessMode: page.accessMode || 'PUBLIC',
        allowedRoles: page.allowedRoles || [],
        allowedGroups: page.allowedGroups || [],
        allowedPermissions: page.allowedPermissions || [],
        ...workflowMetadata('NODE'),
        lifecycleState: page.lifecycleState || defaultLifecycle,
        maturityState: schemaMaturity(page.maturityState),
        searchKeywords: page.searchKeywords || [],
        relatedNodes: [],
        locale: page.locale || 'en',
        channel: 'web',
        active: true,
      });
    }
    parentNode = subgroupNodeCodes.get(subgroupKey);
  }

  nodeRecords.push({
    code: boundedCode('axisDocsNodeTopic', [page.id || `axis.${page.code}`]),
    product: productCode,
    navigation: navigationCode,
    parentNode,
    nodeLevel: 'TOPIC',
    nodeType: 'PAGE',
    nodeTitle: page.title,
    nodeSummary: page.summary,
    nodeContentArea: {
      route: page.route,
      documentType: page.documentType,
      businessAudience: page.businessAudience || [],
      technicalAudience: page.technicalAudience || [],
    },
    childSummaryCards: [],
    childJourneyLinks: [],
    childStatusSummary: { childCount: 0 },
    targetDocumentationPage: metadataPageCode(page),
    targetPage: pageRecordCode(page),
    targetRoute: routeRecordCode(page),
    nodeOrder: page.navigationOrder || page.order,
    expandable: false,
    expandedByDefault: false,
    nodeIcon: 'file-text',
    nodeAudience: page.audience || ['administrator', 'business-user', 'developer'],
    accessPolicy: accessPolicyFor(page),
    accessMode: page.accessMode || 'PUBLIC',
    allowedRoles: page.allowedRoles || [],
    allowedGroups: page.allowedGroups || [],
    allowedPermissions: page.allowedPermissions || [],
    ...workflowMetadata('NODE'),
    lifecycleState: page.lifecycleState || defaultLifecycle,
    maturityState: schemaMaturity(page.maturityState),
    searchKeywords: page.searchKeywords || [],
    relatedNodes: (page.relatedPages || []).map((relatedPage) =>
      boundedCode('axisDocsNodeTopic', [relatedPage]),
    ),
    locale: page.locale || 'en',
    channel: 'web',
    active: true,
  });
});

const navigationRecords = {
  record0: {
    code: navigationCode,
    product: productCode,
    name: 'Nodics Axis Documentation Navigation',
    renderer: 'documentation.component.navigation',
    searchLabel: 'Search Nodics Axis documentation',
    searchPlaceholder:
      'Search setup, architecture, features, security, and troubleshooting',
    emptyMessage: 'No Nodics Axis documentation matches your search.',
    expandable: true,
    accessMode: 'PUBLIC',
    lifecycleState: defaultLifecycle,
    ...workflowMetadata('NAVIGATION'),
    active: true,
  },
};

const dashboardRecordsMap = Object.fromEntries(
  dashboardRecords.map((record, index) => [`record${index}`, record]),
);
const nodeRecordsMap = Object.fromEntries(
  nodeRecords.map((record, index) => [`record${index}`, record]),
);

const pageRecords = Object.fromEntries(
  sourcePages.map((page, index) => [
    `record${index}`,
    {
      code: pageRecordCode(page),
      name: page.title,
      cmsSite: ['axisDocumentationSite'],
      typeCode: 'axisDocumentationArticlePageType',
      template: 'axisDocumentationArticleTemplate',
      renderer: 'documentation.page.article',
      cmsComponents: [
        {
          target: 'axisDocumentationNavigation',
          slot: 'navigation',
          index: 5,
          active: true,
        },
        {
          target: articleRecordCode(page),
          slot: 'article',
          index: 10,
          active: true,
        },
      ],
      active: true,
    },
  ]),
);

const routeRecords = Object.fromEntries(
  sourcePages.map((page, index) => [
    `record${index}`,
    {
      code: routeRecordCode(page),
      site: 'axisDocumentationSite',
      path: page.route,
      locale: page.locale || 'en',
      channel: 'web',
      page: pageRecordCode(page),
      routeType: 'PAGE',
      deliveryState: page.lifecycleState || 'ONLINE',
      accessMode: page.accessMode || 'PUBLIC',
      active: true,
    },
  ]),
);

const articleRecords = Object.fromEntries(
  sourcePages.map((page, index) => [
    `record${index + 1}`,
    {
      code: articleRecordCode(page),
      typeCode: 'axisDocumentationArticleComponentType',
      renderer: 'documentation.component.article',
      accessMode: 'PUBLIC',
      properties: {
        code: page.id || `axis.${page.code}`,
        title: page.title,
        route: page.route,
        section: page.navigationSectionCode || slug(page.section),
        sectionTitle: page.navigationSection || page.section,
        group: page.navigationGroupCode || slug(page.navigationGroup || page.section),
        groupTitle: page.navigationGroup || page.section,
        subgroup: page.navigationSubgroupCode || null,
        subgroupTitle: page.navigationSubgroup || null,
        parentId: page.parentId || null,
        hierarchyPath: page.hierarchyPath || [page.section, page.title],
        hierarchyDepth: page.hierarchyDepth || 2,
        documentType: page.documentType || 'overview',
        category: page.section,
        audience: page.audience,
        businessAudience: page.businessAudience || [],
        technicalAudience: page.technicalAudience || [],
        summary: page.summary,
        visibility: page.visibility || 'public',
        accessMode: page.accessMode || 'PUBLIC',
        publiclyAvailable: page.publiclyAvailable !== false,
        requiresAuthentication: Boolean(page.requiresAuthentication),
        allowedRoles: page.allowedRoles || [],
        allowedGroups: page.allowedGroups || [],
        allowedPermissions: page.allowedPermissions || [],
        lifecycleState: page.lifecycleState || 'ONLINE',
        version: page.version || navigation.version,
        maturityState: page.maturityState || 'operational',
        implementationState: page.implementationState || 'current',
        renderingComponent: page.renderingComponent || 'documentation.component.article',
        relatedPages: page.relatedPages || [],
        sourceEvidence: page.sourceEvidence || [],
        visualRequirements: page.visualRequirements || [],
        searchKeywords: page.searchKeywords || [],
        topicKeywords: page.topicKeywords || [],
        headings: page.headings,
        blocks: page.blocks,
        searchText: navigationItems[index].searchText,
        source: {
          repository: 'nodics.platform',
          module: 'axis',
          owner: page.sourceOwner || 'nodics.platform/modules/axis',
          sourcePath: page.sourcePath || `docs/${page.source}`,
          path: `modules/axis/docs/${page.source}`,
          evidence: page.evidence,
          hash: page.sourceHash,
          version: navigation.version,
        },
        previous:
          index > 0
            ? {
                title: sourcePages[index - 1].title,
                route: sourcePages[index - 1].route,
              }
            : undefined,
        next:
          index < sourcePages.length - 1
            ? {
                title: sourcePages[index + 1].title,
                route: sourcePages[index + 1].route,
              }
            : undefined,
      },
      active: true,
    },
  ]),
);

const componentRecords = {
  record0: navigationComponent,
  ...articleRecords,
};

const pageMetadataRecords = Object.fromEntries(
  sourcePages.map((page, index) => [
    `record${index}`,
    {
      code: metadataPageCode(page),
      product: productCode,
      documentId: page.id || `axis.${page.code}`,
      title: page.title,
      summary: page.summary,
      businessSummary: `${page.title} explains the business purpose, supported user decisions, operational effect, and Axis-facing controls for the ${page.navigationGroup || page.section} journey.`,
      technicalSummary: `${page.title} records Platform axis ownership, source path docs/${page.source}, renderer contract, extension path, validation, and troubleshooting evidence.`,
      ownerFunctionalModule: 'nodics.platform.axis',
      technicalModule: 'axis',
      targetPage: pageRecordCode(page),
      targetRoute: routeRecordCode(page),
      articleComponent: articleRecordCode(page),
      template: 'axisDocumentationArticleTemplate',
      searchMetadata: boundedCode('axisDocsSearch', ['PAGE', metadataPageCode(page)]),
      headings: page.headings,
      diagrams: page.blocks
        .filter((block) => block.kind === 'diagram')
        .map((block) => ({
          language: block.language,
          anchor: block.anchor || null,
        })),
      visualAssets: page.blocks
        .filter((block) => block.kind === 'image' || block.kind === 'table')
        .map((block) => ({
          kind: block.kind,
          title: block.title || block.headers?.join(', ') || page.title,
        })),
      visualRequirements: page.visualRequirements || [],
      relatedPages: page.relatedPages || [],
      sourceRepository: 'nodics.platform',
      sourcePath: page.sourcePath || `docs/${page.source}`,
      sourceChecksum: page.sourceHash,
      sourceWordCount: page.wordCount,
      audience: page.audience || [],
      ...workflowMetadata('PAGE'),
      accessPolicy: accessPolicyFor(page),
      accessMode: page.accessMode || 'PUBLIC',
      lifecycleState: page.lifecycleState || defaultLifecycle,
      maturityState: schemaMaturity(page.maturityState),
      active: true,
    },
  ]),
);

const publicationTargets = [
  { type: 'PRODUCT', code: productCode, lifecycleState: defaultLifecycle },
  { type: 'NAVIGATION', code: navigationCode, lifecycleState: defaultLifecycle },
  ...Object.values(accessPolicyRecords).map((record) => ({ type: 'ACCESS_POLICY', code: record.code, lifecycleState: defaultLifecycle })),
  ...nodeRecords.map((record) => ({
    type: 'NODE',
    code: record.code,
    lifecycleState: record.lifecycleState,
  })),
  ...dashboardRecords.map((record) => ({
    type: 'DASHBOARD',
    code: record.code,
    lifecycleState: record.lifecycleState,
  })),
  ...sourcePages.map((page) => ({
    type: 'PAGE',
    code: metadataPageCode(page),
    lifecycleState: page.lifecycleState || defaultLifecycle,
  })),
];
const publicationStateRecords = Object.fromEntries(
  publicationTargets.map((target, index) => [
    `record${index}`,
    {
      code: boundedCode('axisDocsPublication', [target.type, target.code]),
      targetType: target.type,
      targetCode: target.code,
      lifecycleState: target.lifecycleState || defaultLifecycle,
      publicationCode: 'axisDocumentation',
      workflowReference: 'axisDocumentationReviewWorkflow',
      stagedVersion: navigation.version,
      onlineVersion: target.lifecycleState === 'ONLINE' ? navigation.version : '',
      previousOnlineVersion: '',
      validationResult: {
        generated: true,
        sourceAuthority: 'docs/catalogue.json',
        publicationPath: 'STAGED_REVIEW_APPROVAL_ONLINE',
        nexusVisibleOnlyWhenOnlineAndPublic: true,
      },
      checksum: sha256(
        `${target.type}:${target.code}:${target.lifecycleState || defaultLifecycle}:${navigation.version}`,
      ),
      ...workflowMetadata(target.type),
      decisionPolicy: publicationDecisionPolicy,
      actor: 'nodics.platform.axis.generator',
      author: 'nodics.platform.axis.generator',
      submittedBy: '',
      submittedAt: '',
      reviewer: '',
      reviewedAt: '',
      approver: '',
      approvedAt: '',
      publisher: '',
      publishedAt: '',
      auditTrail: [],
      active: true,
    },
  ]),
);

const searchTargets = [
  {
    targetType: 'PRODUCT',
    targetCode: productCode,
    title: 'Nodics Axis Documentation',
    summary: productRecords.record0.description,
    searchText: `${productRecords.record0.name} ${productRecords.record0.description}`,
    keywords: ['axis', 'documentation', 'backoffice'],
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
      audience: node.nodeAudience || [],
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
  ...sourcePages.map((page) => ({
    targetType: 'PAGE',
    targetCode: metadataPageCode(page),
    title: page.title,
    summary: page.summary,
    searchText: `${page.title} ${page.summary} ${page.markdown}`,
    keywords: [...(page.searchKeywords || []), ...(page.topicKeywords || [])],
    facets: {
      section: page.navigationSectionCode || slug(page.section),
      group: page.navigationGroupCode || slug(page.navigationGroup || page.section),
      documentType: page.documentType,
      audience: page.audience || [],
      maturityState: page.maturityState || 'operational',
    },
    accessMode: page.accessMode || 'PUBLIC',
    lifecycleState: page.lifecycleState || defaultLifecycle,
  })),
];
const searchMetadataRecords = Object.fromEntries(
  searchTargets.map((target, index) => [
    `record${index}`,
    {
      code: boundedCode('axisDocsSearch', [target.targetType, target.targetCode]),
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
      accessPolicy:
        target.accessMode === 'PUBLIC'
          ? publicAccessPolicyCode
          : authenticatedAccessPolicyCode,
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
        code: boundedCode('axisDocsPublication', ['SEARCH_METADATA', record.code]),
        targetType: 'SEARCH_METADATA',
        targetCode: record.code,
        lifecycleState: record.lifecycleState || defaultLifecycle,
        publicationCode: 'axisDocumentation',
        workflowReference: 'axisDocumentationReviewWorkflow',
        stagedVersion: navigation.version,
        onlineVersion: record.lifecycleState === 'ONLINE' ? navigation.version : '',
        previousOnlineVersion: '',
        validationResult: {
          generated: true,
          sourceAuthority: 'docs/catalogue.json',
          publicationPath: 'STAGED_REVIEW_APPROVAL_ONLINE',
          nexusVisibleOnlyWhenOnlineAndPublic: true,
        },
        checksum: sha256(
          `SEARCH_METADATA:${record.code}:${record.lifecycleState || defaultLifecycle}:${navigation.version}`,
        ),
        ...workflowMetadata('SEARCH_METADATA'),
        decisionPolicy: publicationDecisionPolicy,
        actor: 'nodics.platform.axis.generator',
        author: 'nodics.platform.axis.generator',
        submittedBy: '',
        submittedAt: '',
        reviewer: '',
        reviewedAt: '',
        approver: '',
        approvedAt: '',
        publisher: '',
        publishedAt: '',
        auditTrail: [],
        active: true,
      },
    ]),
  ),
);

const migrationRegister = {
  pack: navigation.pack,
  version: navigation.version,
  generatedAtPolicy: 'deterministic-no-timestamp',
  sources: sourcePages.map((page) => {
    const evidencePath = path.join(root, page.evidence);
    const previousEvidence = previousMigrationByEvidence.get(page.evidence);
    const evidence = fs.existsSync(evidencePath)
      ? fs.readFileSync(evidencePath, 'utf8')
      : undefined;
    const evidenceHash =
      previousEvidence?.evidenceHash ?? (evidence && sha256(evidence));
    const evidenceWordCount =
      previousEvidence?.evidenceWordCount ?? (evidence && wordCount(evidence));
    const evidenceHeadings =
      previousEvidence?.evidenceHeadings ?? (evidence && markdownHeadings(evidence));
    if (
      typeof evidenceHash !== 'string' ||
      typeof evidenceWordCount !== 'number' ||
      !Array.isArray(evidenceHeadings)
    ) {
      throw new Error(`Migration evidence is unavailable: ${page.evidence}`);
    }
    return {
      evidence: page.evidence,
      evidenceStatus:
        page.evidence === 'README.md'
          ? 'retained-high-level-summary'
          : 'retired-after-verified-migration',
      evidenceHash,
      evidenceWordCount,
      evidenceHeadings,
      canonicalSource: `docs/${page.source}`,
      destinationRoute: page.route,
      disposition: 'migrated',
      sourceHash: page.sourceHash,
      wordCount: page.wordCount,
      headings: page.headings.map((heading) => heading.text),
    };
  }),
};

await writeOrCheck(
  'data/core-v001/records/documentation/axisDocumentationProductData.js',
  recordModule(
    productRecords,
    'Generated Nodics Axis documentation product catalogue metadata.',
  ),
);
await writeOrCheck(
  'data/core-v001/records/documentation/axisDocumentationAccessPolicyData.js',
  recordModule(accessPolicyRecords, 'Generated Nodics Axis documentation access policies.'),
);
await writeOrCheck(
  'data/core-v001/records/documentation/axisDocumentationNavigationData.js',
  recordModule(
    navigationRecords,
    'Generated Nodics Axis documentation navigation catalogue metadata.',
  ),
);
await writeOrCheck(
  'data/core-v001/records/documentation/axisDocumentationDashboardData.js',
  recordModule(dashboardRecordsMap, 'Generated Nodics Axis documentation hierarchy dashboards.'),
);
await writeOrCheck(
  'data/core-v001/records/documentation/axisDocumentationNodeData.js',
  recordModule(nodeRecordsMap, 'Generated Nodics Axis documentation hierarchy nodes.'),
);
await writeOrCheck(
  'data/core-v001/records/documentation/axisDocumentationPageMetadataData.js',
  recordModule(pageMetadataRecords, 'Generated Nodics Axis documentation page metadata.'),
);
await writeOrCheck(
  'data/core-v001/records/documentation/axisDocumentationPublicationStateData.js',
  recordModule(
    publicationStateRecords,
    'Generated Nodics Axis documentation publication state metadata.',
  ),
);
await writeOrCheck(
  'data/core-v001/records/documentation/axisDocumentationSearchMetadataData.js',
  recordModule(searchMetadataRecords, 'Generated Nodics Axis documentation search metadata.'),
);
await writeOrCheck(
  path.relative(root, pageOutputPath),
  recordModule(pageRecords, 'Generated Nodics Axis documentation pages.'),
);
await writeOrCheck(
  path.relative(root, componentOutputPath),
  recordModule(
    componentRecords,
    'Generated Nodics Axis documentation navigation and article content.',
  ),
);
await writeOrCheck(
  path.relative(root, routeOutputPath),
  recordModule(
    routeRecords,
    'Generated authenticated Nodics Axis documentation routes.',
  ),
);
await writeOrCheck(
  path.relative(root, migrationRegisterPath),
  `${JSON.stringify(migrationRegister, null, 2)}\n`,
);

await writeOrCheck(
  'data/core-v001/headers/axisDocumentationContentPackHeader.js',
  `${copyrightHeader}'use strict';\n\n/** @description Nodics foundation-import header for the Nodics Axis documentation content pack. */\nmodule.exports = {\n  cms: {\n    axisDocumentationSiteData: { options: { enabled: true, schemaName: 'cmsSite', operation: 'saveAll', dataFilePrefix: 'axisDocumentationSiteData' }, query: { code: '$code' } },\n    axisDocumentationProductData: { options: { enabled: true, schemaName: 'cmsDocumentationProduct', operation: 'saveAll', dataFilePrefix: 'axisDocumentationProductData' }, query: { code: '$code' } },\n    axisDocumentationAccessPolicyData: { options: { enabled: true, schemaName: 'cmsDocumentationAccessPolicy', operation: 'saveAll', dataFilePrefix: 'axisDocumentationAccessPolicyData' }, query: { code: '$code' } },\n    axisDocumentationNavigationData: { options: { enabled: true, schemaName: 'cmsDocumentationNavigation', operation: 'saveAll', dataFilePrefix: 'axisDocumentationNavigationData' }, query: { code: '$code' } },\n    axisDocumentationDashboardData: { options: { enabled: true, schemaName: 'cmsDocumentationDashboard', operation: 'saveAll', dataFilePrefix: 'axisDocumentationDashboardData' }, query: { code: '$code' } },\n    axisDocumentationNodeData: { options: { enabled: true, schemaName: 'cmsDocumentationNode', operation: 'saveAll', dataFilePrefix: 'axisDocumentationNodeData' }, query: { code: '$code' } },\n    axisDocumentationPageMetadataData: { options: { enabled: true, schemaName: 'cmsDocumentationPage', operation: 'saveAll', dataFilePrefix: 'axisDocumentationPageMetadataData' }, query: { code: '$code' } },\n    axisDocumentationPublicationStateData: { options: { enabled: true, schemaName: 'cmsDocumentationPublicationState', operation: 'saveAll', dataFilePrefix: 'axisDocumentationPublicationStateData' }, query: { code: '$code' } },\n    axisDocumentationSearchMetadataData: { options: { enabled: true, schemaName: 'cmsDocumentationSearchMetadata', operation: 'saveAll', dataFilePrefix: 'axisDocumentationSearchMetadataData' }, query: { code: '$code' } },\n    axisDocumentationTypeCodeData: { options: { enabled: true, schemaName: 'cmsTypeCode', operation: 'saveAll', dataFilePrefix: 'axisDocumentationTypeCodeData' }, query: { code: '$code' } },\n    axisDocumentationRendererData: { options: { enabled: true, schemaName: 'cmsTypeCode2Renderer', operation: 'saveAll', dataFilePrefix: 'axisDocumentationRendererData' }, query: { code: '$code' } },\n    axisDocumentationTemplateData: { options: { enabled: true, schemaName: 'cmsPageTemplate', operation: 'saveAll', dataFilePrefix: 'axisDocumentationTemplateData' }, query: { code: '$code' } },\n    axisDocumentationSlotData: { options: { enabled: true, schemaName: 'cmsSlotDefinition', operation: 'saveAll', dataFilePrefix: 'axisDocumentationSlotData' }, query: { code: '$code' } },\n    axisDocumentationComponentData: { options: { enabled: true, schemaName: 'cmsComponent', operation: 'saveAll', dataFilePrefix: 'axisDocumentationComponentData' }, query: { code: '$code' } },\n    axisDocumentationPageData: { options: { enabled: true, schemaName: 'cmsPage', operation: 'saveAll', dataFilePrefix: 'axisDocumentationPageData' }, query: { code: '$code' } },\n    axisDocumentationRouteData: { options: { enabled: true, schemaName: 'cmsPageRoute', operation: 'saveAll', dataFilePrefix: 'axisDocumentationRouteData' }, query: { code: '$code' } },\n  },\n};\n`,
);

const generatedFiles = [
  'data/core-v001/records/documentation/axisDocumentationAccessPolicyData.js',
  'data/core-v001/records/documentation/axisDocumentationDashboardData.js',
  'data/core-v001/records/documentation/axisDocumentationNavigationData.js',
  'data/core-v001/records/documentation/axisDocumentationNodeData.js',
  'data/core-v001/records/documentation/axisDocumentationPageMetadataData.js',
  'data/core-v001/records/documentation/axisDocumentationProductData.js',
  'data/core-v001/records/documentation/axisDocumentationPublicationStateData.js',
  'data/core-v001/records/documentation/axisDocumentationSearchMetadataData.js',
  'data/core-v001/records/documentation/axisDocumentationComponentData.js',
  'data/core-v001/records/documentation/axisDocumentationPageData.js',
  'data/core-v001/records/documentation/axisDocumentationRendererData.js',
  'data/core-v001/records/documentation/axisDocumentationRouteData.js',
  'data/core-v001/records/documentation/axisDocumentationSiteData.js',
  'data/core-v001/records/documentation/axisDocumentationSlotData.js',
  'data/core-v001/records/documentation/axisDocumentationTemplateData.js',
  'data/core-v001/records/documentation/axisDocumentationTypeCodeData.js',
  'data/core-v001/headers/axisDocumentationContentPackHeader.js',
];
const generatedHashes = Object.fromEntries(
  generatedFiles.map((fileName) => [
    fileName.replace(/^data\//, ''),
    sha256(fs.readFileSync(path.join(root, fileName))),
  ]),
);
const documentationSection = applicationDocumentationContract.buildReleaseSection({
  contentPath: 'core-v001',
  catalogue: { pack: navigation.pack, version: navigation.version },
  owningDomain: 'axis',
  environmentScope: ['ALL'],
  sensitivity: 'PUBLIC',
  sourceAuthority: 'docs/catalogue.json',
  sites: ['axisDocumentationSite'],
  accessMode: 'PUBLIC',
  pages: sourcePages.length,
  components: sourcePages.length + 1,
  routes: sourcePages.length,
  migrationRegister: 'docs/migration-register.json',
  generatedHashes,
});
const previousManifest = fs.existsSync(manifestPath)
  ? JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  : { contractVersion: 2, module: 'axis', sections: {} };
const preservedSections = { ...(previousManifest.sections || {}) };
if (
  preservedSections.core?.kind === 'DATA_RELEASE' &&
  documentationSection.contentPath === 'core-v001'
) {
  delete preservedSections.core;
}
const manifest = {
  contractVersion: 2,
  module: 'axis',
  sections: { ...preservedSections, documentation: documentationSection },
};
await writeOrCheck(
  path.relative(root, manifestPath),
  `${JSON.stringify(manifest, null, 2)}\n`,
);

console.log(
  `${checkOnly ? 'Validated' : 'Generated'} ${sourcePages.length} Axis documentation pages`,
);
