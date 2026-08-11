import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cataloguePath = path.join(root, 'catalogue.json');
const dataRoot = path.join(root, 'data/core');
const dataPath = path.join(dataRoot, 'data/documentation');
const headerPath = path.join(dataRoot, 'headers/nodicsDocumentationContentPackHeader.js');
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
const documents = catalogue.documents;

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

function imageMimeType(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  if (extension === '.jpg' || extension === '.jpeg') return 'image/jpeg';
  if (extension === '.png') return 'image/png';
  if (extension === '.gif') return 'image/gif';
  if (extension === '.webp') return 'image/webp';
  if (extension === '.svg') return 'image/svg+xml';
  return undefined;
}

function imageSource(source, contentPath) {
  if (/^(?:https?:\/\/|data:image\/|\/)/.test(source)) return source;
  const candidate = path.join(root, path.dirname(contentPath), source);
  const mimeType = imageMimeType(candidate);
  if (!mimeType || !fs.existsSync(candidate)) return source;
  return `data:${mimeType};base64,${fs.readFileSync(candidate).toString('base64')}`;
}

function markdownBlocks(markdown, pageCode, contentPath) {
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
        source: imageSource(image[2], contentPath),
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

const sections = [...new Set(documents.map((document) => document.functionalModule))].map(
  (functionalModule, index) => ({
    code: slug(functionalModule),
    title: functionalModule.replace(/^nodics\./, 'Nodics '),
    order: (index + 1) * 10,
  }),
);
const routeFor = (document, index) => {
  const route = document.route ||
    (index === 0 ? '/docs/framework' : `/docs/framework/${slug(document.id.replace(/\./g, '-'))}`);
  if (!/^\/docs\/framework(?:\/[a-z0-9-]+)*$/.test(route)) {
    throw new Error(`Invalid framework documentation route: ${route}`);
  }
  return route;
};
const sourcePages = documents.map((document, index) => {
  const markdown = fs.readFileSync(path.join(root, document.content), 'utf8');
  const section = sections.find((item) => item.code === slug(document.functionalModule));
  const recordIdentity = document.recordCode || document.id;
  const blocks = markdownBlocks(markdown, camel(recordIdentity), document.content);
  const documentHeadings = blocks
    .filter((block) => block.kind === 'heading')
    .map((block) => ({ text: block.text, anchor: block.anchor, level: block.level }));
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
const navigationItems = sourcePages.map((document, index) => ({
  code: document.id,
  title: document.title,
  route: document.route,
  section: document.section.code,
  sectionTitle: document.section.title,
  sectionOrder: document.section.order,
  order: (index + 1) * 10,
  audience: ['architect', 'developer', 'operator'],
  summary: document.summary,
  searchText: `${document.title} ${document.summary} ${document.markdown}`,
}));
const navigationComponent = {
  record0: {
    code: 'nodicsDocumentationNavigation',
    typeCode: 'nodicsDocumentationNavigationComponentType',
    renderer: 'documentation.component.navigation',
    accessMode: 'AUTHENTICATED',
    properties: {
      title: 'Nodics Framework',
      searchLabel: 'Search framework documentation',
      searchPlaceholder: 'Search modules, contracts, registry, and runtime guidance',
      emptyMessage: 'No framework documentation matches your search.',
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
      typeCode: 'nodicsDocumentationArticleComponentType',
      renderer: 'documentation.component.article',
      accessMode: 'AUTHENTICATED',
      properties: {
        code: document.id,
        title: document.title,
        route: document.route,
        section: document.section.code,
        sectionTitle: document.section.title,
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
          repository: 'nodics.docs',
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
      code: `nodicsDocsPage${document.codeSuffix}`,
      name: document.title,
      cmsSite: ['nodicsDocumentationSite'],
      typeCode: 'nodicsDocumentationArticlePageType',
      template: 'nodicsDocumentationArticleTemplate',
      renderer: 'documentation.page.article',
      cmsComponents: [
        { target: 'nodicsDocumentationNavigation', slot: 'navigation', index: 5, active: true },
        {
          target: `nodicsDocsComponent${document.codeSuffix}`,
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
  sourcePages.map((document, index) => [
    `record${index}`,
    {
      code: `nodicsDocsRoute${document.codeSuffix}`,
      site: 'nodicsDocumentationSite',
      path: document.route,
      locale: document.locale || 'en',
      channel: 'web',
      page: `nodicsDocsPage${document.codeSuffix}`,
      routeType: 'PAGE',
      deliveryState: 'ONLINE',
      accessMode: 'AUTHENTICATED',
      active: true,
    },
  ]),
);

const files = {
  'data/core/data/documentation/nodicsDocumentationSiteData.js': jsModule(
    'Nodics framework documentation site.',
    {
      record0: {
        code: 'nodicsDocumentationSite',
        name: 'Nodics Documentation',
        catalog: 'documentationContentCatalog',
        active: true,
      },
    },
  ),
  'data/core/data/documentation/nodicsDocumentationTypeCodeData.js': jsModule(
    'Nodics framework documentation page and component types.',
    {
      record0: { code: 'nodicsDocumentationArticlePageType', kind: 'PAGE', contractVersion: 2, active: true },
      record1: { code: 'nodicsDocumentationArticleComponentType', kind: 'COMPONENT', contractVersion: 2, active: true },
      record2: { code: 'nodicsDocumentationNavigationComponentType', kind: 'COMPONENT', contractVersion: 2, active: true },
    },
  ),
  'data/core/data/documentation/nodicsDocumentationRendererData.js': jsModule(
    'Nodics framework documentation renderer mappings owned by Axis.',
    {
      record0: { code: 'nodicsDocumentationArticlePageType', renderer: 'documentation.page.article', contractVersion: 2, channels: ['web', 'mobile-webview'], deprecated: false, active: true },
      record1: { code: 'nodicsDocumentationArticleComponentType', renderer: 'documentation.component.article', contractVersion: 2, channels: ['web', 'mobile-webview'], deprecated: false, active: true },
      record2: { code: 'nodicsDocumentationNavigationComponentType', renderer: 'documentation.component.navigation', contractVersion: 2, channels: ['web', 'mobile-webview'], deprecated: false, active: true },
    },
  ),
  'data/core/data/documentation/nodicsDocumentationSlotData.js': jsModule(
    'Nodics framework documentation template slots.',
    {
      record0: { code: 'nodicsDocumentationNavigationSlot', template: 'nodicsDocumentationArticleTemplate', name: 'navigation', minItems: 1, maxItems: 1, allowedComponentTypes: ['nodicsDocumentationNavigationComponentType'], active: true },
      record1: { code: 'nodicsDocumentationArticleSlot', template: 'nodicsDocumentationArticleTemplate', name: 'article', minItems: 1, maxItems: 1, allowedComponentTypes: ['nodicsDocumentationArticleComponentType'], active: true },
    },
  ),
  'data/core/data/documentation/nodicsDocumentationTemplateData.js': jsModule(
    'Nodics framework documentation template.',
    {
      record0: { code: 'nodicsDocumentationArticleTemplate', name: 'Nodics Documentation Article', renderer: 'documentation.template.article', contractVersion: 2, slots: ['nodicsDocumentationNavigationSlot', 'nodicsDocumentationArticleSlot'], active: true },
    },
  ),
  'data/core/data/documentation/nodicsDocumentationComponentData.js': jsModule(
    'Generated Nodics framework documentation navigation and article content.',
    componentRecords,
  ),
  'data/core/data/documentation/nodicsDocumentationPageData.js': jsModule(
    'Generated Nodics framework documentation pages.',
    pageRecords,
  ),
  'data/core/data/documentation/nodicsDocumentationRouteData.js': jsModule(
    'Generated Nodics framework documentation routes.',
    routeRecords,
  ),
  'data/core/headers/nodicsDocumentationContentPackHeader.js': `${copyrightHeader}'use strict';\n\n/** @description Nodics core-import header for framework documentation. */\nmodule.exports = {\n  cms: {\n    nodicsDocumentationSiteData: { options: { enabled: true, schemaName: 'cmsSite', operation: 'saveAll', dataFilePrefix: 'nodicsDocumentationSiteData' }, query: { code: '$code' } },\n    nodicsDocumentationTypeCodeData: { options: { enabled: true, schemaName: 'cmsTypeCode', operation: 'saveAll', dataFilePrefix: 'nodicsDocumentationTypeCodeData' }, query: { code: '$code' } },\n    nodicsDocumentationRendererData: { options: { enabled: true, schemaName: 'cmsTypeCode2Renderer', operation: 'saveAll', dataFilePrefix: 'nodicsDocumentationRendererData' }, query: { code: '$code' } },\n    nodicsDocumentationSlotData: { options: { enabled: true, schemaName: 'cmsSlotDefinition', operation: 'saveAll', dataFilePrefix: 'nodicsDocumentationSlotData' }, query: { code: '$code' } },\n    nodicsDocumentationTemplateData: { options: { enabled: true, schemaName: 'cmsPageTemplate', operation: 'saveAll', dataFilePrefix: 'nodicsDocumentationTemplateData' }, query: { code: '$code' } },\n    nodicsDocumentationComponentData: { options: { enabled: true, schemaName: 'cmsComponent', operation: 'saveAll', dataFilePrefix: 'nodicsDocumentationComponentData' }, query: { code: '$code' } },\n    nodicsDocumentationPageData: { options: { enabled: true, schemaName: 'cmsPage', operation: 'saveAll', dataFilePrefix: 'nodicsDocumentationPageData' }, query: { code: '$code' } },\n    nodicsDocumentationRouteData: { options: { enabled: true, schemaName: 'cmsPageRoute', operation: 'saveAll', dataFilePrefix: 'nodicsDocumentationRouteData' }, query: { code: '$code' } },\n  },\n};\n`,
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
const releaseChecksum = sha256(
  Object.keys(generatedHashes)
    .sort()
    .map((fileName) => `${fileName}:${generatedHashes[fileName]}`)
    .join('|'),
);
const documentationSection = {
  kind: 'CONTENT_PACK',
  contentPath: 'core',
  pack: 'nodics.docs',
  version: catalogue.release,
  sourceMode: 'catalogue-markdown-source',
  sourceAuthority: 'catalogue.json',
  sites: ['nodicsDocumentationSite'],
  accessMode: 'AUTHENTICATED',
  pages: sourcePages.length,
  components: Object.keys(componentRecords).length,
  routes: sourcePages.length,
  releaseChecksum,
  generatedHashes,
};
const previousManifest = fs.existsSync(manifestPath)
  ? JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  : { contractVersion: 2, module: 'nodics.docs', sections: {} };
const manifest = {
  contractVersion: 2,
  module: 'nodics.docs',
  sections: { ...(previousManifest.sections || {}), documentation: documentationSection },
};
await writeOrCheck(
  path.relative(root, manifestPath),
  `${JSON.stringify(manifest, null, 2)}\n`,
);

console.log(`${checkOnly ? 'Validated' : 'Generated'} ${sourcePages.length} framework documentation pages`);
