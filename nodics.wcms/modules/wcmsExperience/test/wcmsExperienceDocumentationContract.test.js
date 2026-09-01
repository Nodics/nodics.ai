/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/** @module wcmsExperience/test/wcmsExperienceDocumentationContract @description Freezes low-level developer, business, Axis, journey, and troubleshooting documentation coverage. @layer test @owner wcmsExperience */

const moduleRoot = path.resolve(__dirname, '..');

function readRequired(relativePath) {
    const absolutePath = path.join(moduleRoot, relativePath);
    assert.equal(fs.existsSync(absolutePath), true, `${relativePath} must exist`);
    const content = fs.readFileSync(absolutePath, 'utf8');
    assert.ok(content.trim().length > 0, `${relativePath} must not be empty`);
    return content;
}

function assertContains(content, phrase, label) {
    assert.match(
        content,
        new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
        `${label} must include "${phrase}"`
    );
}

(() => {
    const contractsReadme = readRequired('llm/contracts/README.md');
    const examplesReadme = readRequired('llm/examples/README.md');
    const governance = readRequired('llm/contracts/experience-governance-contract.md');
    const developer = readRequired('llm/contracts/developer-implementation-contract.md');
    const business = readRequired('llm/examples/business-configuration-guide.md');
    const axis = readRequired('llm/examples/axis-experience-studio-guide.md');
    const journeys = readRequired('llm/examples/journey-configuration-examples.md');
    const troubleshooting = readRequired('llm/examples/troubleshooting-and-index-status-guide.md');

    for (const fileName of [
        'developer-implementation-contract.md',
        'experience-governance-contract.md',
        'experience-index-document.json'
    ]) {
        assertContains(contractsReadme, fileName, 'contracts README');
    }

    for (const fileName of [
        'business-configuration-guide.md',
        'axis-experience-studio-guide.md',
        'journey-configuration-examples.md',
        'troubleshooting-and-index-status-guide.md'
    ]) {
        assertContains(examplesReadme, fileName, 'examples README');
    }

    assertContains(governance, 'Request-time resolution must query indexed placement projections', 'governance contract');
    assertContains(governance, 'Experience Studio', 'governance contract');
    assertContains(governance, 'WCMS_EXPERIENCE_PREVIEW', 'governance contract');
    assertContains(governance, 'WCMS_EXPERIENCE_PUBLISH_STATUS', 'governance contract');

    for (const phrase of [
        '```mermaid',
        'CMS_ONLINE_CHANGED',
        'Discovery/Elasticsearch',
        'previewMode=true',
        'pageSize',
        'must not scan all CMS components'
    ]) {
        assertContains(developer, phrase, 'developer implementation contract');
    }

    for (const phrase of [
        'collection journey',
        'brand journey',
        'default fallback',
        'Business users do not edit frontend code'
    ]) {
        assertContains(business, phrase, 'business configuration guide');
    }

    for (const phrase of [
        'Experience Studio',
        'Index Status',
        'WCMS_EXPERIENCE_PREVIEW',
        'WCMS_EXPERIENCE_PUBLISH_STATUS',
        'Preview screen',
        'Page Designer'
    ]) {
        assertContains(axis, phrase, 'Axis Experience Studio guide');
    }

    for (const phrase of [
        'Collection journey',
        '/search?collection=agoraNewArrivals&page=1&pageSize=10',
        'Brand journey',
        '/search?brand=atelier-minimal&page=1&pageSize=10',
        'Default fallback',
        '```mermaid'
    ]) {
        assertContains(journeys, phrase, 'journey configuration examples');
    }

    for (const phrase of [
        'Index Status',
        'CMS_ONLINE_CHANGED',
        'default fallback',
        'Performance troubleshooting',
        'Discovery'
    ]) {
        assertContains(troubleshooting, phrase, 'troubleshooting guide');
    }

    console.log('WCMS Experience documentation contract validated');
})();
