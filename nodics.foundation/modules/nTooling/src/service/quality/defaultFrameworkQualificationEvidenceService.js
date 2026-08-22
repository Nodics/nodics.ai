#!/usr/bin/env node
/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTooling/service/quality/defaultFrameworkQualificationEvidenceService
 * @description Runs framework-owned qualification evidence suites from the resolved nodics.ai home.
 * @layer tooling
 * @owner nTooling
 * @override Projects may expose aliases to these qualification commands, but must not copy framework qualification logic.
 */

const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');
const { spawnSync } = require('child_process');

const frameworkRoot = process.cwd();

function assertFrameworkRoot() {
    const packagePath = path.join(frameworkRoot, 'package.json');
    if (!fs.existsSync(packagePath)) {
        throw new Error('Framework qualification must run from nodics.ai root: ' + frameworkRoot);
    }
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    if (packageJson.name !== 'nodics.ai') {
        throw new Error('Framework qualification resolved non-framework home: ' + frameworkRoot);
    }
}

function runContract(file, options = {}) {
    const started = performance.now();
    const result = spawnSync(process.execPath, [file], {
        cwd: frameworkRoot,
        stdio: options.stdio || 'ignore',
        encoding: options.encoding,
        maxBuffer: options.maxBuffer
    });
    return { result, durationMs: Math.ceil(performance.now() - started) };
}

function runSecurityBoundary() {
    const cases = [
        'nodics.foundation/modules/nAuth/test/authSecurityContract.test.js',
        'nodics.foundation/modules/nCache/cache/test/cacheMutationSecurityContract.test.js',
        'nodics.foundation/modules/nData/nImport/import/test/importExportAccessPolicy.test.js',
        'nodics.foundation/modules/nData/nImport/import/test/remoteImportTransportGovernance.test.js',
        'nodics.platform/modules/profile/test/profileAuthenticationRouteSecurity.test.js',
        'nodics.platform/modules/backoffice/test/backofficeAdministrativeSecurityService.test.js',
        'nodics.engagement/modules/engagementApi/test/engagementApiSecurityContract.test.js',
        'nodics.foundation/modules/nPublish/test/publicationAuthorityContract.test.js',
        'nodics.foundation/modules/nPublish/test/publicationAtomicAuditContract.test.js'
    ];
    const evidence = cases.map(file => {
        const { result, durationMs } = runContract(file);
        return {
            file,
            durationMs,
            exitCode: result.status ?? 1,
            state: result.status === 0 ? 'PASSED' : 'FAILED'
        };
    });
    console.log(JSON.stringify({ contractVersion: 0, environmentClass: 'LOCAL', kind: 'AUTOMATED_SECURITY_BOUNDARY', evidence }, null, 2));
    return evidence.every(entry => entry.state === 'PASSED');
}

function runPublishingCapacity() {
    const cases = [
        { id: 'freeze-deploy-activate-delivery-retry-rollback', workloadClass: 'LARGE_CONTRACT', file: 'nodics.wcms/modules/cms/test/cmsPublicationManifestContract.test.js', maxMs: 15000 },
        { id: 'media-promotion-retention', workloadClass: 'MEDIUM_CONTRACT', file: 'nodics.wcms/modules/media/test/mediaPublicationTransferContract.test.js', maxMs: 10000 },
        { id: 'transaction-response-loss', workloadClass: 'SMALL_CONTRACT', file: 'nodics.wcms/modules/cms/test/cmsPublicationTransactionReadiness.test.js', maxMs: 10000 },
        { id: 'lifecycle-retry-rollback', workloadClass: 'MEDIUM_CONTRACT', file: 'nodics.foundation/modules/nPublish/test/publicationLifecycleService.test.js', maxMs: 10000 },
        { id: 'outbox-concurrent-delivery', workloadClass: 'MEDIUM_CONTRACT', file: 'nodics.wcms/modules/cms/test/cmsPublicationOutboxReliability.test.js', maxMs: 10000 },
        { id: 'workflow-timeout-retry-handoff', workloadClass: 'SMALL_CONTRACT', file: 'nodics.wcms/modules/cms/test/cmsPublicationWorkflowService.test.js', maxMs: 10000 },
        { id: 'operations-metrics-recovery', workloadClass: 'SMALL_CONTRACT', file: 'nodics.foundation/modules/nPublish/test/publicationOperationsService.test.js', maxMs: 10000 },
        { id: 'audit-reconciliation-concurrency', workloadClass: 'MEDIUM_CONTRACT', file: 'nodics.foundation/modules/nPublish/test/publicationAuditReconciliationService.test.js', maxMs: 10000 }
    ];
    const evidence = cases.map(entry => {
        const { result, durationMs } = runContract(entry.file, { stdio: 'inherit' });
        return {
            ...entry,
            durationMs,
            state: result.status === 0 && durationMs <= entry.maxMs ? 'PASSED' : 'FAILED',
            exitCode: result.status ?? 1
        };
    });
    console.log(JSON.stringify({ contractVersion: 0, environmentClass: 'LOCAL', kind: 'BOUNDED_CONTRACT_BASELINE', evidence }, null, 2));
    return evidence.every(entry => entry.state === 'PASSED');
}

function runPublishingSoak() {
    const iterations = 25;
    const maximumDurationMs = 30000;
    const maximumRssGrowthBytes = 64 * 1024 * 1024;
    const cases = [
        'nodics.foundation/modules/nPublish/test/publicationLifecycleService.test.js',
        'nodics.foundation/modules/nPublish/test/publicationAuditReconciliationService.test.js',
        'nodics.wcms/modules/cms/test/cmsPublicationManifestContract.test.js',
        'nodics.wcms/modules/cms/test/cmsPublicationOutboxReliability.test.js',
        'nodics.wcms/modules/cms/test/cmsPublicationWorkflowService.test.js',
        'nodics.wcms/modules/media/test/mediaPublicationTransferContract.test.js'
    ];

    const started = performance.now();
    const rssBefore = process.memoryUsage().rss;
    const failures = [];
    for (let iteration = 1; iteration <= iterations; iteration += 1) {
        for (const file of cases) {
            const { result } = runContract(file);
            if (result.status !== 0) {
                failures.push({ iteration, file, exitCode: result.status ?? 1 });
            }
        }
    }
    const durationMs = Math.ceil(performance.now() - started);
    const rssGrowthBytes = Math.max(0, process.memoryUsage().rss - rssBefore);
    const state = failures.length === 0 && durationMs <= maximumDurationMs && rssGrowthBytes <= maximumRssGrowthBytes ? 'PASSED' : 'FAILED';
    console.log(JSON.stringify({
        contractVersion: 0,
        environmentClass: 'LOCAL',
        kind: 'SUSTAINED_CONTRACT_RELIABILITY',
        iterations,
        executions: iterations * cases.length,
        durationMs,
        maximumDurationMs,
        rssGrowthBytes,
        maximumRssGrowthBytes,
        failures,
        state
    }, null, 2));
    return state === 'PASSED';
}

function runPublishingInterruptionContracts() {
    const contracts = [
        ['manifest-idempotency-and-reconciliation', 'nodics.wcms/modules/cms/test/cmsPublicationManifestContract.test.js'],
        ['outbox-lease-and-startup-recovery', 'nodics.wcms/modules/cms/test/cmsPublicationOutboxReliability.test.js'],
        ['publication-workflow-orchestration', 'nodics.wcms/modules/cms/test/cmsPublicationWorkflowService.test.js'],
        ['wcms-publication-boundary', 'nodics.wcms/modules/wcms/test/wcmsPublicationWorkflowContract.test.js'],
        ['process-decision-callback', 'nodics.process/modules/workflow/modules/flowCore/test/processPublicationDecisionCallback.test.js'],
        ['process-publication-approval', 'nodics.process/modules/workflow/modules/flowCore/test/processPublicationApprovalService.test.js'],
        ['process-runtime-reconciliation', 'nodics.process/test/processRuntimeLifecycleService.test.js']
    ];

    const evidence = contracts.map(([id, contract]) => {
        const { result, durationMs } = runContract(contract, {
            encoding: 'utf8',
            maxBuffer: 64 * 1024 * 1024
        });
        return {
            id,
            contract,
            state: result.status === 0 ? 'PASSED' : 'FAILED',
            durationMs,
            ...(result.status === 0 ? {} : { message: (result.stderr || result.stdout || 'contract failed').trim().slice(-2000) })
        };
    });

    const report = {
        contractVersion: 0,
        environment: 'kickoffDockerLocal',
        qualificationClass: 'AUTOMATED_INTERRUPTION_AND_RECONCILIATION_CONTRACTS',
        directBusinessDatabaseCrud: false,
        evidence
    };
    console.log(JSON.stringify(report, null, 2));
    return evidence.every(item => item.state === 'PASSED');
}

function main() {
    const mode = process.argv[2] || 'help';
    assertFrameworkRoot();
    const runners = {
        'security-boundary': runSecurityBoundary,
        'publishing-capacity': runPublishingCapacity,
        'publishing-soak': runPublishingSoak,
        'publishing-interruption-contracts': runPublishingInterruptionContracts
    };
    if (!runners[mode]) {
        console.error('Usage: node defaultFrameworkQualificationEvidenceService.js <security-boundary|publishing-capacity|publishing-soak|publishing-interruption-contracts>');
        process.exitCode = 1;
        return;
    }
    if (!runners[mode]()) {
        process.exitCode = 1;
    }
}

try {
    main();
} catch (error) {
    console.error(error && error.stack ? error.stack : error);
    process.exitCode = 1;
}
