/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('node:child_process');

const moduleRoot = path.resolve(__dirname, '..');
const catalogue = require('../../../../nodics.foundation/modules/nTooling/src/service/defaultApplicationDocumentationContractService').validateDataRelease(moduleRoot);
const sourceAuthority = require('../data/manifest.json').sections.documentation.sourceAuthority;

const page = catalogue.pages.find(item => item.code === 'experience-studio');
assert(page, 'Experience Studio documentation must be registered in the Axis catalogue');
assert.strictEqual(page.id, 'axis.experience-studio');
assert.strictEqual(page.route, '/docs/nodics-axis/experience-studio');
assert.strictEqual(page.navigationSection, 'Axis Capabilities');
assert.strictEqual(page.navigationGroup, 'Axis Workspaces and Operations');
assert(page.relatedPages.includes('axis.page-designer'), 'Experience Studio docs must link back to Page Designer');

const source = page.body;
for (const required of [
    '## Collection journey example',
    '## Brand journey example',
    '## Default fallback example',
    '## Performance contract',
    '## Customize and extend safely',
    '## Common mistakes',
    '## Verification',
    'Discovery / Elasticsearch',
    'wcmsExperience.cmsExperiencePlacement',
    '/shop?collection=new-arrivals&page=1&pageSize=10',
    '/shop?brand=atelier-minimal&page=1&pageSize=10'
]) {
    assert(source.includes(required), `Experience Studio documentation is missing required content: ${required}`);
}

const generatedPageData = fs.readFileSync(
    path.resolve(moduleRoot, sourceAuthority, 'axisDocumentationPageData.js'),
    'utf8',
);
const generatedRouteData = fs.readFileSync(
    path.resolve(moduleRoot, sourceAuthority, 'axisDocumentationRouteData.js'),
    'utf8',
);
const generatedComponentData = fs.readFileSync(
    path.resolve(moduleRoot, sourceAuthority, 'axisDocumentationComponentData.js'),
    'utf8',
);

assert(
    generatedPageData.includes('axisDocsPageexperiencestudio'),
    'Generated Axis documentation page data must include Experience Studio',
);
assert(
    generatedRouteData.includes('/docs/nodics-axis/experience-studio'),
    'Generated Axis documentation route data must include Experience Studio route',
);
assert(
    generatedComponentData.includes('Collection journey example') &&
        generatedComponentData.includes('Brand journey example') &&
        generatedComponentData.includes('Default fallback example'),
    'Generated Axis documentation component data must include Experience Studio body content',
);

const reportPaths = [
    'axis-documentation-validation-report.json',
    'axis-documentation-validation-report.md',
].map(name => path.join(moduleRoot, 'test/reports', name));
const previousReports = reportPaths.map(file => fs.existsSync(file) ? fs.readFileSync(file) : null);
const validationOutput = execFileSync(process.execPath, [
    path.join(moduleRoot, 'scripts/validate-axis-content-pack.mjs'),
    '--check',
], { encoding: 'utf8' });
assert(validationOutput.includes(`Validated ${catalogue.pages.length} Axis CMS documentation pages`));
for (const [index, file] of reportPaths.entries()) {
    assert.deepStrictEqual(fs.existsSync(file) ? fs.readFileSync(file) : null, previousReports[index],
        'Read-only source validation must not rewrite retained reports');
}

console.log('Axis Experience Studio documentation validated');
