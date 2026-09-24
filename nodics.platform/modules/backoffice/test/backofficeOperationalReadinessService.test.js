/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module backoffice/test/backofficeOperationalReadinessService
 * @description Validates deployment configuration invariants and stable READY, DEGRADED, and NOT_READY operational assessment.
 * @layer test
 * @owner backoffice
 */
const assert = require('assert');
let registry = require('../config/properties').backofficeRegistry;
let bootstrapIdentity = {
    source: 'localSample',
    adminPassword: 'local-admin-password-12345',
};
let defaultAuthDetail = {
    apiKey: 'local-runtime-api-key-with-at-least-thirty-two-characters',
};
let tooling = {
    acceptance: {
        browserValidation: {
            enabled: true,
            reason: 'Local validation can run browser smoke checks against developer-visible applications.'
        }
    }
};
global.CONFIG = { get: key => key === 'backofficeRegistry' ? registry :
    key === 'bootstrapIdentity' ? bootstrapIdentity :
        key === 'defaultAuthDetail' ? defaultAuthDetail :
            key === 'runtimeRole' ? { code: 'PLATFORM' } :
                key === 'tooling' ? tooling :
                    key === 'search' ? { default: { options: { enabled: false, fallback: false, engine: 'elastic' } },
                        runtimeRoleProfiles: { PLATFORM: { discoveryProjection: { options: { enabled: true } } } } } : undefined };
let readinessContributor;
let publishedAlerts = [];
let auditEvents = [];
global.SERVICE = { AuditPublisher: { record: () => Promise.resolve(true) },
    DefaultBackofficeAuditService: { record: event => { auditEvents.push(event); return Promise.resolve(event); } },
    AlertPublisher: { record: event => { publishedAlerts.push(event); return Promise.resolve(true); } },
    DefaultBackofficeApplicationInitializationService: { status: async profileCode => ({
        profileCode: profileCode,
        applicationCode: 'circa',
        siteCode: 'circaSite',
        releaseCode: 'circa.ewaste:site',
        capability: {
            businessStatus: 'ONLINE',
            blockers: [],
            approvalDiagnostic: { status: 'APPROVED', message: 'Publication approval is complete.' },
            publicationSummary: { online: 'ONLINE', approval: 'APPROVED', media: 'READY_OR_NOT_REQUIRED' },
            nextAction: 'Monitor Online readiness'
        }
    }) },
    DefaultBackofficeDiscoveryService: { getDiagnostics: () => ({ attempts: 2, successes: 2, failures: 0,
        lastSuccessAt: '2026-09-24T00:00:00.000Z', activeSnapshots: 2, inflight: 0 }) },
    DefaultSearchConfigurationService: { getSearchReadiness: () => true },
    DefaultCopilotKnowledgeRuntimeService: { readiness: () => ({
        businessStatus: 'READY', retrievalEnabled: true, ingestionEnabled: true, sourceRegistryEnabled: true,
        sourceCount: 2, enabledSourceCount: 1, indexedSourceCount: 1, notIndexedSourceCount: 0,
        failedSourceCount: 0, lastRefreshAt: '2026-09-24T00:00:00.000Z', blockers: []
    }) },
    DefaultHealthService: { registerReadinessContributor: (name, contributor) => {
    assert.strictEqual(name, 'backofficeOperationalConfiguration'); readinessContributor = contributor;
} } };
const service = require('../src/service/operations/defaultBackofficeOperationalReadinessService');
service.init();
assert.strictEqual(readinessContributor.required, true);
assert.strictEqual(readinessContributor.check(), true);
assert.strictEqual(service.validateConfiguration().valid, true);
let ready = service.assess({ store: { available: true, metrics: {} }, availability: { queued: 0, metrics: {} }, discovery: {}, security: {} });
assert.strictEqual(ready.state, 'READY');
let degraded = service.assess({ store: { available: true, metrics: { errors: 1 } }, availability: { queued: 0,
    metrics: { attempts: 10, failures: 3 } }, discovery: { attempts: 10, failures: 3 }, security: { throttled: 1 } });
assert.strictEqual(degraded.state, 'DEGRADED');
assert(degraded.alerts.includes('REGISTRY_STORE_ERRORS'));
assert(degraded.alerts.includes('AVAILABILITY_FAILURE_RATE'));
assert(degraded.alerts.includes('DISCOVERY_FAILURE_RATE'));
assert(degraded.alerts.includes('ADMIN_REFRESH_THROTTLED'));
let originalStore = registry.store;
registry.store = Object.assign({}, originalStore, { mode: 'memory' });
registry.operations.requireDistributedStore = true;
assert.strictEqual(service.assess({ store: { available: true, metrics: {} } }).state, 'NOT_READY');
assert(service.validateConfiguration().failures.includes('DISTRIBUTED_STORE_REQUIRED'));
registry.operations.requireDistributedStore = false;
registry.store = originalStore;
assert.strictEqual(service.assess({ store: { available: false, metrics: {} } }).state, 'NOT_READY');
assert.strictEqual(service.assess({ store: { available: true, metrics: {} }, availability: { queued: 0, metrics: {} },
    discovery: {}, security: {} }).state, 'READY', 'provider recovery must restore readiness when alerts clear');
let originalThreshold = registry.operations.thresholds.availabilityFailurePercent;
registry.operations.thresholds.availabilityFailurePercent = 101;
assert(service.validateConfiguration().failures.includes('OPERATION_THRESHOLD_INVALID'));
registry.operations.thresholds.availabilityFailurePercent = originalThreshold;
let startupReport = service.startupValidationReport();
assert.strictEqual(startupReport.state, 'NEEDS_ATTENTION');
assert.strictEqual(startupReport.summary.warnings, 3);
assert.strictEqual(startupReport.bootstrapChecks.total, 3);
assert.strictEqual(startupReport.bootstrapChecks.ready, 3);
assert.strictEqual(startupReport.bootstrapChecks.missing, 0);
assert(startupReport.bootstrapChecks.checks.some(check => check.code === 'BOOTSTRAP_ADMIN_PASSWORD_PRESENT'));
assert(startupReport.findings.some(finding => finding.code === 'LOCAL_SAMPLE_ADMIN_PASSWORD'));
assert(startupReport.findings.some(finding => finding.propertyPath === 'defaultAuthDetail.apiKey'));
let sampleKeyFinding = startupReport.findings.find(finding => finding.propertyPath === 'defaultAuthDetail.apiKey');
assert.strictEqual(sampleKeyFinding.repair.available, true);
assert.strictEqual(sampleKeyFinding.repair.operation, 'runtimeConfiguration.update');
assert.strictEqual(sampleKeyFinding.repair.actionCode, 'ROTATE_DEFAULT_CONFIGURATION');
assert.strictEqual(sampleKeyFinding.repair.eligibility, 'MANUAL');
assert.strictEqual(sampleKeyFinding.repair.requiresConfirmation, true);
assert.strictEqual(startupReport.summary.acknowledged, 0);
service.acknowledgeFinding({
    tenant: 'default',
    authData: { loginId: 'admin' },
    correlationId: 'startup-ack-test',
    startupFindingAcknowledgement: {
        code: sampleKeyFinding.code,
        propertyPath: sampleKeyFinding.propertyPath,
        reason: 'Reviewed local development default before continuing.',
        reasonCode: 'LOCAL_DEV_ACCEPTED'
    }
});
let acknowledgedReport = service.startupValidationReport({ tenant: 'default' });
let acknowledgedFinding = acknowledgedReport.findings.find(finding => finding.code === sampleKeyFinding.code);
assert.strictEqual(acknowledgedReport.summary.acknowledged, 1);
assert.strictEqual(acknowledgedFinding.acknowledgement.acknowledged, true);
assert.strictEqual(acknowledgedFinding.acknowledgement.acknowledgedBy, 'admin');
assert(auditEvents.some(event => event.eventType === 'backoffice.startupFinding.acknowledge'
    && event.findingCode === sampleKeyFinding.code));
assert(!JSON.stringify(startupReport).includes(defaultAuthDetail.apiKey));
assert(!JSON.stringify(startupReport).includes(bootstrapIdentity.adminPassword));
let originalAdminPassword = bootstrapIdentity.adminPassword;
bootstrapIdentity.adminPassword = '';
let missingBootstrapReport = service.startupValidationReport();
assert.strictEqual(missingBootstrapReport.bootstrapChecks.missing, 1);
assert(missingBootstrapReport.bootstrapChecks.checks.some(check => check.code === 'BOOTSTRAP_ADMIN_PASSWORD_PRESENT' && check.state === 'MISSING'));
bootstrapIdentity.adminPassword = originalAdminPassword;
let originalRequiredProperties = registry.operations.startupValidation.requiredProperties;
registry.operations.startupValidation.requiredProperties = [{
    code: 'MISSING_TEST_PROPERTY',
    owner: 'testModule',
    ownerType: 'TEST',
    path: 'missing.required.value',
    message: 'A required test property is missing.',
    action: 'Configure the missing test value.'
}];
let missingReport = service.startupValidationReport();
assert.strictEqual(missingReport.state, 'NOT_READY');
assert(missingReport.findings.some(finding => finding.code === 'MISSING_TEST_PROPERTY'));
let missingFinding = missingReport.findings.find(finding => finding.code === 'MISSING_TEST_PROPERTY');
assert.strictEqual(missingFinding.repair.available, true);
assert.strictEqual(missingFinding.repair.actionCode, 'UPDATE_REQUIRED_CONFIGURATION');
registry.operations.startupValidation.requiredProperties = originalRequiredProperties;

async function validateDeliveryAndProductionPolicy() {
    let moduleInvocationCalls = [];
    let originalModuleService = global.SERVICE.DefaultModuleService;
    global.SERVICE.DefaultModuleService = { invokeModule: async descriptor => {
        moduleInvocationCalls.push(descriptor);
        return [{ releaseCode: 'circa.ewaste:sample', moduleName: 'circa.ewaste',
            displayName: 'Circa sample release',
            readiness: { businessStatus: 'PREPARED_STAGED', blockers: [] } }];
    } };
    let aggregateReport = await service.operationalReadinessReport({ tenant: 'default', httpRequest: { headers: { authorization: 'Bearer operator-token' } } }, {
        startupValidation: missingReport,
        modules: { backoffice: [{ instanceId: 'platformServer:backoffice', moduleName: 'backoffice', state: 'ACTIVE',
            environment: 'kickoffLocal', server: 'platformServer', node: 'default',
            runtimeRole: { code: 'PLATFORM', publication: 'OPERATIONAL' } }] },
        availability: { backoffice: { state: 'UP' } },
        documentationSources: [{ id: 'framework.docs', label: 'Framework docs', type: 'CMS', route: '/docs/framework' }],
        documentationPublication: { bySourceId: { 'framework.docs': { readiness: 'READY', ready: true } } },
        applicationInitializationProfiles: [{ code: 'circaewaste', title: 'Circa eWaste',
            dataPackages: [{ code: 'circa.ewaste:sample', dataType: 'sample', targetServer: 'wcmsStaged', targetRuntimeRole: 'WCMS_STAGED' }] }]
    });
    assert.strictEqual(aggregateReport.contractVersion, 1);
    assert.strictEqual(aggregateReport.state, 'NOT_READY');
    assert.strictEqual(service._lastOperationalReadinessSnapshot.state, 'NOT_READY');
    assert.strictEqual(service._lastOperationalReadinessSnapshot.source, 'backoffice.operationalReadiness.snapshot');
    assert(Array.isArray(aggregateReport.summary.timeline));
    assert(Array.isArray(aggregateReport.summary.recoveryMatrix));
    assert(aggregateReport.summary.recoveryMatrix.length >= 9);
    assert(aggregateReport.summary.recoveryMatrix.some(lane => lane.key === 'runtimeCommunication'
        && lane.label === 'Verify runtimes'));
    assert(aggregateReport.summary.recoveryMatrix.some(lane => lane.key === 'imports'
        && lane.label === 'Import data'
        && lane.route === '/operations/imports-exports'
        && lane.state === 'READY'));
    assert(aggregateReport.summary.recoveryMatrix.some(lane => lane.key === 'approval'
        && lane.label === 'Complete approvals'
        && lane.route === '/process/approval-queue'));
    assert(aggregateReport.summary.recoveryMatrix.some(lane => lane.key === 'acceptance'
        && lane.label === 'Capture validation evidence'
        && lane.issueCodes.includes('BROWSER_VALIDATION_EVIDENCE_REQUIRED')
        && lane.repairActions.some(action => action.includes('tooling.acceptance.browserValidation'))));
    assert(aggregateReport.summary.timeline.some(item => item.eventType === 'backoffice.operationalReadiness.snapshot'
        && item.state === 'NOT_READY'));
    assert(auditEvents.some(event => event.eventType === 'backoffice.operationalReadiness.snapshot'
        && event.state === 'NOT_READY'));
    assert(aggregateReport.sections.some(section => section.key === 'imports'
        && section.businessStatus === 'READY'
        && section.summary.releaseCount === 1
        && section.summary.releaseGroups.some(group => group.code === 'DATA_RELEASE'
            && group.releaseCount === 1)
        && section.summary.operatorCommands.includes('Validate blocked release group')));
    assert.strictEqual(moduleInvocationCalls[0].moduleName, 'import');
    assert.strictEqual(moduleInvocationCalls[0].apiName, '/sample');
    assert.strictEqual(moduleInvocationCalls[0].header.Authorization, 'Bearer operator-token');
    assert(aggregateReport.sections.some(section => section.key === 'publishing'
        && section.businessStatus === 'READY'
        && section.summary.onlineCount === 1));
    assert(aggregateReport.sections.some(section => section.key === 'approval'
        && section.businessStatus === 'READY'
        && section.summary.pendingApprovalCount === 0
        && section.summary.approvalStatusCounts.APPROVED === 1
        && section.summary.operatorCommands.includes('If missing, refresh publication status and Process runtime')));
    assert(aggregateReport.sections.some(section => section.key === 'media'
        && section.businessStatus === 'READY'
        && section.summary.readyOrNotRequiredCount === 1
        && section.summary.mediaStateCounts.READY_OR_NOT_REQUIRED === 1
        && section.summary.cleanupReviewRoute === '/media/cleanup-candidates'
        && section.summary.operatorCommands.includes('Reconcile product or content references')));
    assert(aggregateReport.sections.some(section => section.key === 'search'
        && section.businessStatus === 'READY'
        && section.summary.runtimeRole === 'PLATFORM'
        && section.summary.readSourcePolicy === 'SEARCH_ENGINE'
        && section.summary.renderingPolicy === 'SEARCH_ENGINE'
        && section.summary.runtimeProfileCount === 1
        && section.summary.discoveryAttempts === 2));
    assert(aggregateReport.sections.some(section => section.key === 'assistant'
        && section.businessStatus === 'READY'
        && section.summary.providerAvailable === true
        && section.summary.indexedSourceCount === 1
        && section.summary.operatorCommands.includes('Trigger indexing')));
    assert(aggregateReport.sections.some(section => section.key === 'documentation'
        && section.businessStatus === 'READY'
        && section.summary.sourceReadinessCounts.READY === 1));
    assert(aggregateReport.sections.some(section => section.key === 'runtimeCommunication'
        && section.businessStatus === 'READY'));
    let runtimeCommunication = aggregateReport.sections.find(section => section.key === 'runtimeCommunication');
    assert(runtimeCommunication.summary.reasonCodes.includes('RUNTIME_OBSERVED'));
    assert(runtimeCommunication.summary.communicationChecks.some(check => check.code === 'RUNTIME_API_KEY_GRANT_READY'
        && check.state === 'READY'));
    assert(runtimeCommunication.summary.runtimeObservations.some(observation => observation.server === 'platformServer'
        && observation.node === 'default'
        && observation.reasonCode === 'RUNTIME_OBSERVED'));
    assert.deepStrictEqual(runtimeCommunication.summary.operatorCommands, [
        'npm run local-recovery:readiness -- --live --json',
        'Open Module Registry and refresh runtime status',
        'Check server-level API key/grant readiness when probes fail'
    ]);
    let acceptanceSection = aggregateReport.sections.find(section => section.key === 'acceptance');
    assert(acceptanceSection);
    assert.strictEqual(acceptanceSection.businessStatus, 'NEEDS_ATTENTION');
    assert.strictEqual(acceptanceSection.summary.browserValidationEnabled, true);
    assert.strictEqual(acceptanceSection.summary.onlineProfileCount, 1);
    assert(acceptanceSection.blockers.some(blocker => blocker.code === 'BROWSER_VALIDATION_EVIDENCE_REQUIRED'
        && blocker.repair.operation === 'tooling.acceptance.browserValidation'));
    tooling.acceptance.browserValidation.latestEvidence = {
        state: 'PASSED',
        checkedAt: '2026-09-24T00:00:00.000Z',
        runId: 'browser-smoke-1',
        command: 'npm run acceptance:local',
        urls: ['http://localhost:3100/dashboard', 'http://localhost:3600'],
        message: 'Axis and Circa browser smoke passed.'
    };
    let acceptedSection = service.acceptanceSection({ statuses: [{
        capability: { businessStatus: 'ONLINE' }
    }], errors: [] });
    assert.strictEqual(acceptedSection.businessStatus, 'READY');
    assert.strictEqual(acceptedSection.summary.browserValidationState, 'PASSED');
    assert.strictEqual(acceptedSection.summary.browserValidationRunId, 'browser-smoke-1');
    assert.strictEqual(acceptedSection.blockers.length, 0);
    delete tooling.acceptance.browserValidation.latestEvidence;
    global.SERVICE.DefaultToolingAcceptanceEvidenceService = {
        latestBrowserValidationEvidence: () => ({
            state: 'PASSED',
            checkedAt: '2026-09-24T00:05:00.000Z',
            runId: 'provider-browser-smoke',
            command: 'npm run docker-local:acceptance',
            evidenceFile: 'envs/kickoffLocal/generated/acceptance/browser-validation-evidence.json',
            urls: ['http://localhost:3100/dashboard']
        })
    };
    let bridgedSection = service.acceptanceSection({ statuses: [{
        capability: { businessStatus: 'ONLINE' }
    }], errors: [] }, { environment: 'kickoffLocal' });
    assert.strictEqual(bridgedSection.businessStatus, 'READY');
    assert.strictEqual(bridgedSection.summary.browserValidationState, 'PASSED');
    assert.strictEqual(bridgedSection.summary.browserValidationSource, 'NTOOLING_ACCEPTANCE_EVIDENCE');
    assert.strictEqual(bridgedSection.summary.browserValidationEvidenceFile,
        'envs/kickoffLocal/generated/acceptance/browser-validation-evidence.json');
    assert.deepStrictEqual(bridgedSection.summary.operatorCommands, [
        'npm run docker-local:acceptance',
        'npm run project:post-reset-readiness -- --live --json',
        'Refresh Axis dashboard bootstrap'
    ]);
    global.SERVICE.DefaultToolingAcceptanceEvidenceService = {
        latestBrowserValidationEvidence: () => ({
            state: 'FAILED',
            checkedAt: '2026-09-24T00:06:00.000Z',
            runId: 'provider-browser-smoke-failed',
            failedStep: 'circaMiniApp',
            message: 'Circa browser validation failed.',
            nextAction: 'Fix Circa local URL and rerun acceptance.'
        })
    };
    let failedBridgeSection = service.acceptanceSection({ statuses: [{
        capability: { businessStatus: 'ONLINE' }
    }], errors: [] }, { environment: 'kickoffLocal' });
    assert.strictEqual(failedBridgeSection.businessStatus, 'NEEDS_ATTENTION');
    assert.strictEqual(failedBridgeSection.summary.browserValidationState, 'FAILED');
    assert.strictEqual(failedBridgeSection.summary.browserValidationFailedStep, 'circaMiniApp');
    assert(failedBridgeSection.blockers.some(blocker => blocker.code === 'BROWSER_VALIDATION_FAILED'
        && blocker.suggestedAction === 'Fix Circa local URL and rerun acceptance.'));
    delete global.SERVICE.DefaultToolingAcceptanceEvidenceService;
    assert(aggregateReport.sections.find(section => section.key === 'bootstrap').blockers
        .some(blocker => blocker.code === 'MISSING_TEST_PROPERTY' && blocker.repair.operation === 'runtimeConfiguration.update'));
    global.SERVICE.DefaultModuleService = originalModuleService;

    let repairCalls = [];
    global.SERVICE.DefaultBackofficeReadinessRepairService = {
        repairCapability: () => ({
            repairContractVersion: 1,
            available: true,
            supportedOperations: [{ operation: 'dataRelease.install', action: 'REPAIR_DATA_RELEASE' }]
        }),
        executeRepair: async repair => {
            repairCalls.push(repair);
            return {
                state: repair.dryRun ? 'DRY_RUN' : 'COMPLETED',
                changedCount: repair.dryRun ? 0 : 2,
                skippedCount: 1,
                blockersRemaining: repair.dryRun ? 1 : 0,
                retryable: repair.dryRun,
                evidenceReference: 'repair-evidence:sample',
                targetIdentifiers: repair.targetIdentifiers,
                preview: { changedCount: repair.dryRun ? 2 : 0, skippedCount: 1, targetCodes: ['circa.ewaste:sample'] },
                transaction: { atomic: false, rollbackAvailable: false, compensatingAction: 'Reinstall previous release' },
                policy: { environment: 'kickoffLocal', approvalRequired: false },
                retryPolicy: { safeToRetry: true, reuseIdempotencyKey: true },
                message: repair.dryRun ? 'Would repair import release.' : 'Import release repaired.',
                nextAction: repair.dryRun ? 'Execute repair.' : 'Refresh readiness.',
            };
        }
    };
    let dryRunRepair = await service.executeRepair({
        tenant: 'default',
        authData: { loginId: 'admin' },
        readinessRepair: {
            idempotencyKey: 'repair-dry-run-001',
            dryRun: true,
            operation: 'dataRelease.install',
            action: 'REPAIR_DATA_RELEASE',
            ownerModule: 'import',
            ownerType: 'DATA_RELEASE',
            source: 'IMPORT_RELEASE_CATALOGUE',
            blockerCode: 'INVALID_MANIFEST',
            eligibility: 'MANUAL',
            available: true,
            label: 'Repair data release',
            targetIdentifiers: { releaseCode: 'circa.ewaste:sample' }
        }
    });
    assert.strictEqual(dryRunRepair.state, 'DRY_RUN');
    assert.strictEqual(dryRunRepair.changedCount, 0);
    assert.strictEqual(dryRunRepair.repairContractVersion, 1);
    assert.strictEqual(dryRunRepair.preview.targetCodes[0], 'circa.ewaste:sample');
    assert.strictEqual(dryRunRepair.transaction.rollbackAvailable, false);
    assert.strictEqual(repairCalls.length, 1);
    let executedRepair = await service.executeRepair({
        tenant: 'default',
        authData: { loginId: 'admin' },
        readinessRepair: {
            idempotencyKey: 'repair-execute-001',
            dryRun: false,
            operation: 'dataRelease.install',
            action: 'REPAIR_DATA_RELEASE',
            ownerModule: 'import',
            eligibility: 'MANUAL',
            available: true,
            label: 'Repair data release',
            targetIdentifiers: { releaseCode: 'circa.ewaste:sample' }
        }
    });
    assert.strictEqual(executedRepair.state, 'COMPLETED');
    assert.strictEqual(executedRepair.changedCount, 2);
    assert.strictEqual(executedRepair.targetIdentifiers.releaseCode, 'circa.ewaste:sample');
    let replayedRepair = await service.executeRepair({
        tenant: 'default',
        authData: { loginId: 'admin' },
        readinessRepair: {
            idempotencyKey: 'repair-execute-001',
            dryRun: false,
            operation: 'dataRelease.install',
            action: 'REPAIR_DATA_RELEASE',
            ownerModule: 'import',
            eligibility: 'MANUAL',
            available: true,
            label: 'Repair data release',
            targetIdentifiers: { releaseCode: 'circa.ewaste:sample' }
        }
    });
    assert.strictEqual(replayedRepair.idempotentReplay, true);
    assert.strictEqual(repairCalls.length, 2);
    assert(service.repairHistory().some(item => item.idempotencyKey === 'repair-execute-001'
        && item.principal === 'admin'));
    assert(auditEvents.some(event => event.eventType === 'backoffice.operationalReadiness.repair'
        && event.idempotencyKey === 'repair-execute-001'));
    delete global.SERVICE.DefaultBackofficeReadinessRepairService;
    let unavailableRepair = await service.executeRepair({
        readinessRepair: {
            idempotencyKey: 'repair-unavailable-001',
            dryRun: false,
            operation: 'media.reconcile',
            action: 'REPAIR_MEDIA_REFERENCES',
            ownerModule: 'media',
            eligibility: 'NOT_AVAILABLE',
            available: false,
            label: 'Repair media references',
            targetIdentifiers: { mediaManifestCode: 'circa.ewaste:published-media' }
        }
    });
    assert.strictEqual(unavailableRepair.state, 'NOT_EXECUTABLE');

    registry.operations.alerts = { enabled: true, failClosed: true, requireAcknowledgement: true,
        publisherService: 'AlertPublisher' };
    service._lastPublishedSignature = null;
    assert.strictEqual(await service.publishAssessment(degraded), true);
    assert.strictEqual(publishedAlerts.length, 1);
    assert.deepStrictEqual(Object.keys(publishedAlerts[0]).sort(), ['alerts', 'checkedAt', 'eventType', 'state']);
    assert.strictEqual(await service.publishAssessment(degraded), false, 'unchanged alert state must be deduplicated');
    global.SERVICE.AlertPublisher.record = () => Promise.resolve(false);
    service._lastPublishedSignature = null;
    await assert.rejects(service.publishAssessment(degraded), error => error.code === 'ALERT_DELIVERY_UNACKNOWLEDGED');

    registry.operations.production.enabled = true;
    let productionFailures = service.validateConfiguration().failures;
    assert(productionFailures.includes('PRODUCTION_DISTRIBUTED_STORE_REQUIRED'));
    assert(productionFailures.includes('PRODUCTION_HTTPS_REQUIRED'));
    assert(productionFailures.includes('PRODUCTION_HOST_ALLOWLIST_REQUIRED'));
    assert(productionFailures.includes('PRODUCTION_AUDIT_DELIVERY_REQUIRED'));
    registry.store.mode = 'distributed';
    registry.allowedSchemes = ['https'];
    registry.discovery.allowedHosts = ['modules.internal.example'];
    registry.availability.allowedHosts = ['modules.internal.example'];
    registry.audit = { enabled: true, failClosed: true, requireAcknowledgement: true,
        publisherService: 'AuditPublisher' };
    assert.strictEqual(service.validateConfiguration().valid, true,
        'complete production security and delivery policy must qualify');
    registry.operations.production.enabled = false;
    console.log('BackOffice operational readiness service validated');
}

validateDeliveryAndProductionPolicy().catch(error => { console.error(error); process.exit(1); });
