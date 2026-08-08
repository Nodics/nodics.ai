import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cataloguePath = path.join(root, 'catalogue.json');
const dataRoot = path.join(root, 'data/core');
const dataPath = path.join(dataRoot, 'data/documentation');
const headerPath = path.join(dataRoot, 'headers/nodicsDocumentationContentPackHeader.js');
const manifestPath = path.join(root, 'manifest/generated-content-pack.json');
const checkOnly = process.argv.includes('--check');

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

function headings(value) {
  return value.split(/\r?\n/).flatMap((line) => {
    const match = /^#{2,4}\s+(.+)$/.exec(line.trim());
    return match?.[1] ? [match[1]] : [];
  });
}

function paragraphBlocks(markdown) {
  const blocks = [];
  let pending = [];
  const flushParagraph = () => {
    if (!pending.length) return;
    blocks.push({ kind: 'paragraph', text: pending.join(' ') });
    pending = [];
  };
  for (const line of markdown.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushParagraph();
    } else if (/^#{1,4}\s+/.test(trimmed)) {
      flushParagraph();
      const [, hashes, text] = /^(#{1,4})\s+(.+)$/.exec(trimmed);
      blocks.push({ kind: 'heading', level: hashes.length, text });
    } else if (/^[-*]\s+/.test(trimmed)) {
      flushParagraph();
      blocks.push({ kind: 'list', ordered: false, items: [trimmed.replace(/^[-*]\s+/, '')] });
    } else {
      pending.push(trimmed);
    }
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
  return `'use strict';\n\n/** @description ${description} */\nmodule.exports = ${JSON.stringify(value, null, 2)};\n`;
}

const sections = [...new Set(documents.map((document) => document.functionalModule))].map(
  (functionalModule, index) => ({
    code: slug(functionalModule),
    title: functionalModule.replace(/^nodics\./, 'Nodics '),
    order: (index + 1) * 10,
  }),
);
const routeFor = (document, index) =>
  index === 0 ? '/docs/framework' : `/docs/framework/${slug(document.id.replace(/\./g, '-'))}`;
const sourcePages = documents.map((document, index) => {
  const markdown = fs.readFileSync(path.join(root, document.content), 'utf8');
  const section = sections.find((item) => item.code === slug(document.functionalModule));
  const recordIdentity = document.recordCode || document.id;
  return {
    ...document,
    markdown,
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
        headings: headings(document.markdown),
        blocks: paragraphBlocks(document.markdown),
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
  'data/core/data/documentation/nodicsDocumentationCatalogData.js': jsModule(
    'Nodics framework documentation catalog.',
    {
      record0: {
        code: 'nodicsDocumentationContentCatalog',
        name: 'Nodics Documentation Content Catalog',
        active: true,
      },
    },
  ),
  'data/core/data/documentation/nodicsDocumentationSiteData.js': jsModule(
    'Nodics framework documentation site.',
    {
      record0: {
        code: 'nodicsDocumentationSite',
        name: 'Nodics Documentation',
        catalog: 'nodicsDocumentationContentCatalog',
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
  'data/core/headers/nodicsDocumentationContentPackHeader.js': `'use strict';\n\n/** @description Nodics core-import header for framework documentation. */\nmodule.exports = {\n  catalog: {\n    nodicsDocumentationCatalogData: { options: { enabled: true, schemaName: 'catalog', operation: 'saveAll', dataFilePrefix: 'nodicsDocumentationCatalogData' }, query: { code: '$code' } },\n  },\n  cms: {\n    nodicsDocumentationSiteData: { options: { enabled: true, schemaName: 'cmsSite', operation: 'saveAll', dataFilePrefix: 'nodicsDocumentationSiteData' }, query: { code: '$code' } },\n    nodicsDocumentationTypeCodeData: { options: { enabled: true, schemaName: 'cmsTypeCode', operation: 'saveAll', dataFilePrefix: 'nodicsDocumentationTypeCodeData' }, query: { code: '$code' } },\n    nodicsDocumentationRendererData: { options: { enabled: true, schemaName: 'cmsTypeCode2Renderer', operation: 'saveAll', dataFilePrefix: 'nodicsDocumentationRendererData' }, query: { code: '$code' } },\n    nodicsDocumentationSlotData: { options: { enabled: true, schemaName: 'cmsSlotDefinition', operation: 'saveAll', dataFilePrefix: 'nodicsDocumentationSlotData' }, query: { code: '$code' } },\n    nodicsDocumentationTemplateData: { options: { enabled: true, schemaName: 'cmsPageTemplate', operation: 'saveAll', dataFilePrefix: 'nodicsDocumentationTemplateData' }, query: { code: '$code' } },\n    nodicsDocumentationComponentData: { options: { enabled: true, schemaName: 'cmsComponent', operation: 'saveAll', dataFilePrefix: 'nodicsDocumentationComponentData' }, query: { code: '$code' } },\n    nodicsDocumentationPageData: { options: { enabled: true, schemaName: 'cmsPage', operation: 'saveAll', dataFilePrefix: 'nodicsDocumentationPageData' }, query: { code: '$code' } },\n    nodicsDocumentationRouteData: { options: { enabled: true, schemaName: 'cmsPageRoute', operation: 'saveAll', dataFilePrefix: 'nodicsDocumentationRouteData' }, query: { code: '$code' } },\n  },\n};\n`,
};

for (const [relativePath, content] of Object.entries(files)) {
  await writeOrCheck(relativePath, content);
}

const generatedHashes = Object.fromEntries(
  Object.keys(files).map((relativePath) => [
    relativePath,
    sha256(fs.readFileSync(path.join(root, relativePath))),
  ]),
);
const releaseChecksum = sha256(
  Object.keys(generatedHashes)
    .sort()
    .map((fileName) => `${fileName}:${generatedHashes[fileName]}`)
    .join('|'),
);
const manifest = {
  pack: 'nodics.docs',
  version: catalogue.release,
  contractVersion: 1,
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
await writeOrCheck(
  path.relative(root, manifestPath),
  `${JSON.stringify(manifest, null, 2)}\n`,
);

console.log(`${checkOnly ? 'Validated' : 'Generated'} ${sourcePages.length} framework documentation pages`);
