import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = path.join(root, 'data/core/source/documentation');
const navigationPath = path.join(sourceRoot, 'navigation.json');
const dataRoot = path.join(root, 'data/core');
const dataPath = path.join(dataRoot, 'data/documentation');
const headerPath = path.join(dataRoot, 'headers/processDocumentationContentPackHeader.js');
const manifestPath = path.join(root, 'manifest/docs-content-pack.json');
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
          current.startsWith('>')
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

async function writeOrCheck(targetPath, content) {
  if (checkOnly) {
    const current = fs.existsSync(targetPath) ? fs.readFileSync(targetPath, 'utf8') : null;
    if (current !== content) {
      throw new Error(`${path.relative(root, targetPath)} is not generated`);
    }
    return;
  }
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, content);
}

function jsModule(description, value) {
  return `${copyrightHeader}'use strict';\n\n/** @description ${description} */\nmodule.exports = ${JSON.stringify(value, null, 2)};\n`;
}

const pages = navigation.pages.map((page, index) => {
  const markdown = fs.readFileSync(path.join(sourceRoot, page.source), 'utf8');
  const codeSuffix = camel(page.code);
  const blocks = markdownBlocks(markdown, codeSuffix);
  return {
    ...page,
    markdown,
    blocks,
    codeSuffix,
    previous: index > 0 ? navigation.pages[index - 1] : null,
    next: index < navigation.pages.length - 1 ? navigation.pages[index + 1] : null,
    headings: blocks
      .filter((block) => block.kind === 'heading')
      .map((block) => ({ text: block.text, anchor: block.anchor, level: block.level })),
  };
});

const sections = [...new Map(pages.map((page) => [
  page.section,
  { code: slug(page.section), title: page.section, order: page.sectionOrder || page.order },
])).values()].sort((left, right) => left.order - right.order);

const navigationItems = pages.map((page) => ({
  code: page.code,
  title: page.title,
  route: page.route,
  section: slug(page.section),
  sectionTitle: page.section,
  sectionOrder: page.sectionOrder || page.order,
  order: page.order,
  audience: page.audience || ['business-user', 'developer', 'operator'],
  summary: page.summary,
  searchText: `${page.title} ${page.summary} ${page.markdown}`,
}));

const componentRecords = {
  record0: {
    code: 'processDocumentationNavigation',
    typeCode: 'processDocumentationNavigationComponentType',
    renderer: 'documentation.component.navigation',
    accessMode: 'AUTHENTICATED',
    properties: {
      title: navigation.title || 'Nodics Process',
      searchLabel: 'Search process documentation',
      searchPlaceholder: 'Search process, workflow, tasks, triggers, and automation guidance',
      emptyMessage: 'No process documentation matches your search.',
      sections,
      items: navigationItems,
    },
    active: true,
  },
  ...Object.fromEntries(
    pages.map((page, index) => [
      `record${index + 1}`,
      {
        code: `processDocumentationComponent${page.codeSuffix}`,
        typeCode: 'processDocumentationArticleComponentType',
        renderer: 'documentation.component.article',
        accessMode: 'AUTHENTICATED',
        properties: {
          code: page.code,
          title: page.title,
          route: page.route,
          section: slug(page.section),
          sectionTitle: page.section,
          audience: page.audience || ['business-user', 'developer', 'operator'],
          summary: page.summary,
          headings: page.headings,
          blocks: page.blocks,
          searchText: `${page.title} ${page.summary} ${page.markdown}`,
          previous: page.previous ? { title: page.previous.title, route: page.previous.route } : null,
          next: page.next ? { title: page.next.title, route: page.next.route } : null,
          source: {
            repository: 'nodics.process',
            functionalModule: 'nodics.process',
            technicalModule: 'workflow',
            path: `data/core/source/documentation/${page.source}`,
            wordCount: wordCount(page.markdown),
            checksum: sha256(page.markdown),
          },
        },
        active: true,
      },
    ]),
  ),
};

const pageRecords = Object.fromEntries(
  pages.map((page, index) => [
    `record${index}`,
    {
      code: `processDocumentationPage${page.codeSuffix}`,
      name: page.title,
      cmsSite: ['processDocumentationSite'],
      typeCode: 'processDocumentationArticlePageType',
      template: 'processDocumentationArticleTemplate',
      renderer: 'documentation.page.article',
      cmsComponents: [
        { target: 'processDocumentationNavigation', slot: 'navigation', index: 5, active: true },
        { target: `processDocumentationComponent${page.codeSuffix}`, slot: 'article', index: 10, active: true },
      ],
      active: true,
    },
  ]),
);

const routeRecords = Object.fromEntries(
  pages.map((page, index) => [
    `record${index}`,
    {
      code: `processDocumentationRoute${page.codeSuffix}`,
      site: 'processDocumentationSite',
      path: page.route,
      locale: 'en',
      channel: 'web',
      page: `processDocumentationPage${page.codeSuffix}`,
      routeType: 'PAGE',
      deliveryState: 'ONLINE',
      accessMode: 'AUTHENTICATED',
      active: true,
    },
  ]),
);

const files = {
  [path.join(dataPath, 'processDocumentationSiteData.js')]: jsModule('Nodics Process documentation site.', {
    record0: {
      code: 'processDocumentationSite',
      name: 'Nodics Process Documentation',
      catalog: 'documentationContentCatalog',
      active: true,
    },
  }),
  [path.join(dataPath, 'processDocumentationTypeCodeData.js')]: jsModule('Nodics Process documentation page and component types.', {
    record0: { code: 'processDocumentationArticlePageType', kind: 'PAGE', contractVersion: 2, active: true },
    record1: { code: 'processDocumentationArticleComponentType', kind: 'COMPONENT', contractVersion: 2, active: true },
    record2: { code: 'processDocumentationNavigationComponentType', kind: 'COMPONENT', contractVersion: 2, active: true },
  }),
  [path.join(dataPath, 'processDocumentationRendererData.js')]: jsModule('Nodics Process documentation renderer mappings consumed by Axis.', {
    record0: { code: 'processDocumentationArticlePageType', renderer: 'documentation.page.article', contractVersion: 2, channels: ['web', 'mobile-webview'], deprecated: false, active: true },
    record1: { code: 'processDocumentationArticleComponentType', renderer: 'documentation.component.article', contractVersion: 2, channels: ['web', 'mobile-webview'], deprecated: false, active: true },
    record2: { code: 'processDocumentationNavigationComponentType', renderer: 'documentation.component.navigation', contractVersion: 2, channels: ['web', 'mobile-webview'], deprecated: false, active: true },
  }),
  [path.join(dataPath, 'processDocumentationSlotData.js')]: jsModule('Nodics Process documentation template slots.', {
    record0: { code: 'processDocumentationNavigationSlot', template: 'processDocumentationArticleTemplate', name: 'navigation', minItems: 1, maxItems: 1, allowedComponentTypes: ['processDocumentationNavigationComponentType'], active: true },
    record1: { code: 'processDocumentationArticleSlot', template: 'processDocumentationArticleTemplate', name: 'article', minItems: 1, maxItems: 1, allowedComponentTypes: ['processDocumentationArticleComponentType'], active: true },
  }),
  [path.join(dataPath, 'processDocumentationTemplateData.js')]: jsModule('Nodics Process documentation template.', {
    record0: { code: 'processDocumentationArticleTemplate', name: 'Nodics Process Documentation Article', renderer: 'documentation.template.article', contractVersion: 2, slots: ['processDocumentationNavigationSlot', 'processDocumentationArticleSlot'], active: true },
  }),
  [path.join(dataPath, 'processDocumentationComponentData.js')]: jsModule('Generated Nodics Process documentation navigation and article content.', componentRecords),
  [path.join(dataPath, 'processDocumentationPageData.js')]: jsModule('Generated Nodics Process documentation pages.', pageRecords),
  [path.join(dataPath, 'processDocumentationRouteData.js')]: jsModule('Generated Nodics Process documentation routes.', routeRecords),
  [headerPath]: `${copyrightHeader}'use strict';\n\n/** @description Nodics core-import header for Process documentation. */\nmodule.exports = {\n  cms: {\n    processDocumentationSiteData: { options: { enabled: true, schemaName: 'cmsSite', operation: 'saveAll', dataFilePrefix: 'processDocumentationSiteData' }, query: { code: '$code' } },\n    processDocumentationTypeCodeData: { options: { enabled: true, schemaName: 'cmsTypeCode', operation: 'saveAll', dataFilePrefix: 'processDocumentationTypeCodeData' }, query: { code: '$code' } },\n    processDocumentationRendererData: { options: { enabled: true, schemaName: 'cmsTypeCode2Renderer', operation: 'saveAll', dataFilePrefix: 'processDocumentationRendererData' }, query: { code: '$code' } },\n    processDocumentationSlotData: { options: { enabled: true, schemaName: 'cmsSlotDefinition', operation: 'saveAll', dataFilePrefix: 'processDocumentationSlotData' }, query: { code: '$code' } },\n    processDocumentationTemplateData: { options: { enabled: true, schemaName: 'cmsPageTemplate', operation: 'saveAll', dataFilePrefix: 'processDocumentationTemplateData' }, query: { code: '$code' } },\n    processDocumentationComponentData: { options: { enabled: true, schemaName: 'cmsComponent', operation: 'saveAll', dataFilePrefix: 'processDocumentationComponentData' }, query: { code: '$code' } },\n    processDocumentationPageData: { options: { enabled: true, schemaName: 'cmsPage', operation: 'saveAll', dataFilePrefix: 'processDocumentationPageData' }, query: { code: '$code' } },\n    processDocumentationRouteData: { options: { enabled: true, schemaName: 'cmsPageRoute', operation: 'saveAll', dataFilePrefix: 'processDocumentationRouteData' }, query: { code: '$code' } },\n  },\n};\n`,
};

for (const [targetPath, content] of Object.entries(files)) {
  await writeOrCheck(targetPath, content);
}

const generatedHashes = Object.fromEntries(
  Object.keys(files).map((targetPath) => [
    path.relative(root, targetPath),
    sha256(fs.readFileSync(targetPath)),
  ]),
);
const releaseChecksum = sha256(
  Object.keys(generatedHashes)
    .sort()
    .map((fileName) => `${fileName}:${generatedHashes[fileName]}`)
    .join('|'),
);
const manifest = {
  pack: 'nodics.process',
  version: navigation.version,
  contractVersion: navigation.contractVersion || 1,
  sourceMode: 'module-markdown-source',
  sourceAuthority: 'data/core/source/documentation/navigation.json',
  sites: ['processDocumentationSite'],
  accessMode: 'AUTHENTICATED',
  pages: pages.length,
  components: Object.keys(componentRecords).length,
  routes: pages.length,
  releaseChecksum,
  generatedHashes,
};

await writeOrCheck(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`${checkOnly ? 'Validated' : 'Generated'} ${pages.length} Process documentation pages`);
