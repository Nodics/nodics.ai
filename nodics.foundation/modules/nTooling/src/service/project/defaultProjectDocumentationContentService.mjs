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
const dataRoot = path.join(root, 'data/core');
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

const sections = [
  {
    code: 'nodics-kickoff',
    title: 'Nodics Kickoff',
    order: 10,
  },
];

const navigationItems = sourcePages.map((document, index) => ({
  code: document.id,
  title: document.title,
  route: document.route,
  section: 'nodics-kickoff',
  sectionTitle: 'Nodics Kickoff',
  sectionOrder: 10,
  order: (index + 1) * 10,
  audience: ['architect', 'developer', 'operator'],
  summary: document.summary,
  searchText: `${document.title} ${document.summary} ${document.markdown}`,
}));

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
        section: 'nodics-kickoff',
        sectionTitle: 'Nodics Kickoff',
        audience: ['architect', 'developer', 'operator'],
        summary: document.summary,
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
  'data/core/data/documentation/kickoffDocumentationSiteData.js': jsModule(
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
  'data/core/data/documentation/kickoffDocumentationTypeCodeData.js': jsModule(
    'Nodics Kickoff documentation page and component types.',
    {
      record0: { code: 'kickoffDocumentationArticlePageType', kind: 'PAGE', contractVersion: 2, active: true },
      record1: { code: 'kickoffDocumentationArticleComponentType', kind: 'COMPONENT', contractVersion: 2, active: true },
      record2: { code: 'kickoffDocumentationNavigationComponentType', kind: 'COMPONENT', contractVersion: 2, active: true },
    },
  ),
  'data/core/data/documentation/kickoffDocumentationRendererData.js': jsModule(
    'Nodics Kickoff documentation renderer mappings consumed by Axis.',
    {
      record0: { code: 'kickoffDocumentationArticlePageType', renderer: 'documentation.page.article', contractVersion: 2, channels: ['web', 'mobile-webview'], deprecated: false, active: true },
      record1: { code: 'kickoffDocumentationArticleComponentType', renderer: 'documentation.component.article', contractVersion: 2, channels: ['web', 'mobile-webview'], deprecated: false, active: true },
      record2: { code: 'kickoffDocumentationNavigationComponentType', renderer: 'documentation.component.navigation', contractVersion: 2, channels: ['web', 'mobile-webview'], deprecated: false, active: true },
    },
  ),
  'data/core/data/documentation/kickoffDocumentationSlotData.js': jsModule(
    'Nodics Kickoff documentation template slots.',
    {
      record0: { code: 'kickoffDocumentationNavigationSlot', template: 'kickoffDocumentationArticleTemplate', name: 'navigation', minItems: 1, maxItems: 1, allowedComponentTypes: ['kickoffDocumentationNavigationComponentType'], active: true },
      record1: { code: 'kickoffDocumentationArticleSlot', template: 'kickoffDocumentationArticleTemplate', name: 'article', minItems: 1, maxItems: 1, allowedComponentTypes: ['kickoffDocumentationArticleComponentType'], active: true },
    },
  ),
  'data/core/data/documentation/kickoffDocumentationTemplateData.js': jsModule(
    'Nodics Kickoff documentation template.',
    {
      record0: { code: 'kickoffDocumentationArticleTemplate', name: 'Nodics Kickoff Documentation Article', renderer: 'documentation.template.article', contractVersion: 2, slots: ['kickoffDocumentationNavigationSlot', 'kickoffDocumentationArticleSlot'], active: true },
    },
  ),
  'data/core/data/documentation/kickoffDocumentationComponentData.js': jsModule(
    'Generated Nodics Kickoff documentation navigation and article content.',
    componentRecords,
  ),
  'data/core/data/documentation/kickoffDocumentationPageData.js': jsModule(
    'Generated Nodics Kickoff documentation pages.',
    pageRecords,
  ),
  'data/core/data/documentation/kickoffDocumentationRouteData.js': jsModule(
    'Generated Nodics Kickoff documentation routes.',
    routeRecords,
  ),
  'data/core/headers/kickoffDocumentationContentPackHeader.js': `${copyrightHeader}'use strict';\n\n/** @description Nodics Kickoff core-import header for project documentation. */\nmodule.exports = {\n  cms: {\n    kickoffDocumentationSiteData: { options: { enabled: true, schemaName: 'cmsSite', operation: 'saveAll', dataFilePrefix: 'kickoffDocumentationSiteData' }, query: { code: '$code' } },\n    kickoffDocumentationTypeCodeData: { options: { enabled: true, schemaName: 'cmsTypeCode', operation: 'saveAll', dataFilePrefix: 'kickoffDocumentationTypeCodeData' }, query: { code: '$code' } },\n    kickoffDocumentationRendererData: { options: { enabled: true, schemaName: 'cmsTypeCode2Renderer', operation: 'saveAll', dataFilePrefix: 'kickoffDocumentationRendererData' }, query: { code: '$code' } },\n    kickoffDocumentationTemplateData: { options: { enabled: true, schemaName: 'cmsPageTemplate', operation: 'saveAll', dataFilePrefix: 'kickoffDocumentationTemplateData' }, query: { code: '$code' } },\n    kickoffDocumentationSlotData: { options: { enabled: true, schemaName: 'cmsSlotDefinition', operation: 'saveAll', dataFilePrefix: 'kickoffDocumentationSlotData' }, query: { code: '$code' } },\n    kickoffDocumentationComponentData: { options: { enabled: true, schemaName: 'cmsComponent', operation: 'saveAll', dataFilePrefix: 'kickoffDocumentationComponentData' }, query: { code: '$code' } },\n    kickoffDocumentationPageData: { options: { enabled: true, schemaName: 'cmsPage', operation: 'saveAll', dataFilePrefix: 'kickoffDocumentationPageData' }, query: { code: '$code' } },\n    kickoffDocumentationRouteData: { options: { enabled: true, schemaName: 'cmsPageRoute', operation: 'saveAll', dataFilePrefix: 'kickoffDocumentationRouteData' }, query: { code: '$code' } },\n  },\n};\n`,
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
  contentPath: 'core',
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
