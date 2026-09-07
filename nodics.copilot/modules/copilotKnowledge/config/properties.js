/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module copilotKnowledge/config/properties
 * @description Defines generated configurable defaults for copilotKnowledge.
 * @layer config
 * @owner generated
 * @override Project, environment, server, node, tenant, or customer layers may override these defaults through Nodics configuration layering.
 */
module.exports = {
    copilot: { knowledge: {
        discoveryService: 'DefaultDiscoveryQueryService', maximumEvidenceItems: 20, requireCitations: true,
        ingestion: {
            enabled: false, indexConfigurationCode: 'copilotKnowledge', indexName: 'discoveryDocumentProjection', maximumFilesPerSource: 5000,
            maximumFileBytes: 1048576, maximumSourceBytes: 52428800, chunkCharacters: 4000,
            chunkOverlapCharacters: 400, allowedExtensions: ['.md', '.txt', '.js', '.ts', '.tsx', '.json', '.yaml', '.yml'],
            excludedSegments: ['.git', 'node_modules', 'coverage', 'dist', 'build', 'temp', 'llm/generated'],
            requireSecretScan: true
        },
        retrieval: {
            enabled: false, mode: 'LEXICAL', indexConfigurationCode: 'copilotKnowledge', defaultSize: 10, maximumSize: 20,
            maximumQueryCharacters: 2000, maximumExcerptCharacters: 4000,
            fields: ['payload.title', 'payload.content', 'payload.keywords']
        },
        repositoryRoots: {},
        sourceRegistry: {
            enabled: true, failOnInvalidSource: true,
            allowedClassifications: ['PUBLIC', 'CUSTOMER', 'INTERNAL', 'RESTRICTED'],
            minimumClassificationByType: {
                PUBLISHED_DOCUMENTATION: 'PUBLIC', AXIS_DOCUMENTATION: 'INTERNAL', README: 'INTERNAL',
                AGENTS_CONTRACT: 'RESTRICTED', LLM_CONTRACT: 'RESTRICTED', SOURCE_CODE: 'RESTRICTED',
                CUSTOMER_PROJECT: 'CUSTOMER', CURATED_MEMORY: 'RESTRICTED'
            },
            definitions: [
                {
                    code: 'nodics-framework-readmes', repository: 'nodics.ai', project: 'nodics', module: 'nodics.copilot',
                    owner: 'nodics.copilot', version: 'UNRESOLVED', sourceType: 'README', classification: 'INTERNAL',
                    paths: ['README.md', '**/README.md'], allowedChannels: ['AXIS_EMPLOYEE'],
                    requiredPermissions: ['copilot.knowledge.internal.read'], secretScanPolicy: 'REQUIRED', enabled: false
                },
                {
                    code: 'nodics-framework-contracts', repository: 'nodics.ai', project: 'nodics', module: 'nodics.copilot',
                    owner: 'nodics.copilot', version: 'UNRESOLVED', sourceType: 'AGENTS_CONTRACT', classification: 'RESTRICTED',
                    paths: ['AGENTS.md', '**/AGENTS.md', '**/llm/contracts/*.md'], allowedChannels: ['AXIS_EMPLOYEE'],
                    requiredPermissions: ['copilot.knowledge.restricted.read'], secretScanPolicy: 'REQUIRED', enabled: false
                }
            ]
        }
    } }
};
