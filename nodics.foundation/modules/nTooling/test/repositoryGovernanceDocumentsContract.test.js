/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTooling/test/RepositoryGovernanceDocumentsContract
 * @description Verifies repository-level governance documents exist before
 * external adoption and preserve the legal, support, release, security, and
 * compatibility boundaries expected by Nodics.
 * @layer test
 * @owner nTooling
 * @override Project repositories may add stricter policy documents, but must
 * not remove these framework-level governance surfaces.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repositoryRoot = path.resolve(__dirname, '../../../..');

const requiredDocuments = {
    'LICENSE': [
        'SOURCE-AVAILABLE COMMERCIAL LICENSE',
        'Commercial Product',
        'separate written agreement'
    ],
    '.github/SECURITY.md': [
        'Supported branches',
        'Reporting vulnerabilities',
        'tenant and enterprise scope',
        'service-token versus human-token boundaries'
    ],
    '.github/CONTRIBUTING.md': [
        'AGENTS.md',
        'module `README.md`',
        'root-to-leaf',
        'pre-implementation readiness',
        'root `package.json`',
        'configuration-only',
        'npm run llm:generate'
    ],
    '.github/SUPPORT.md': [
        'source-available commercial software',
        'commercial/support agreement',
        'production SLA',
        'provider integration guidance'
    ],
    'governance/RELEASE.md': [
        'development',
        'master',
        'npm run release:check -- --execute',
        'npm audit --omit=dev',
        'GitHub Actions must delegate'
    ],
    'governance/VERSIONING.md': [
        'Major changes',
        'Minor changes',
        'Patch changes',
        'custom-module override contracts'
    ],
    'governance/DEPRECATION.md': [
        'replacement path',
        'migration steps',
        'Compatibility shims',
        'removal target'
    ],
    'governance/COMPATIBILITY.md': [
        'generated CRUD behavior',
        'OpenAPI output',
        'temporary compatibility shim',
        'customer modules'
    ],
    'governance/INCIDENT_RESPONSE.md': [
        'Identify the affected module',
        'tenant isolation',
        'private media/data exposure',
        'generated-route bypass'
    ],
    'governance/GOVERNANCE.md': [
        'backend/API framework authority',
        'AGENTS.md',
        'modules/nSetup/llm',
        'External adoption gate'
    ]
};

Object.entries(requiredDocuments).forEach(([documentPath, expectedFragments]) => {
    const absolutePath = path.join(repositoryRoot, documentPath);
    assert(fs.existsSync(absolutePath), 'Missing repository governance document: ' + documentPath);
    const source = fs.readFileSync(absolutePath, 'utf8');
    const searchableSource = source.toLowerCase();
    expectedFragments.forEach(fragment => {
        assert(searchableSource.includes(fragment.toLowerCase()),
            documentPath + ' must document repository governance fragment: ' + fragment);
    });
});

console.log('Repository governance documents contract validated');
