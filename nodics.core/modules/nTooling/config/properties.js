/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTooling/config/properties
 * @description Default non-runtime tooling properties for repository discovery, command scanning, and project-home inspection.
 * @layer config
 * @owner nTooling
 * @override Project tooling modules may override these properties through their own `config/properties.js` or by replacing the relevant nTooling service method through standard service merging.
 */
module.exports = {
    tooling: {
        discovery: {
            ignoreDotDirectories: true,
            ignoredDirectories: [
                '.git',
                '.idea',
                '.vscode',
                'node_modules',
                'logs',
                'temp',
                'tmp',
                'dist',
                'generated',
                'docs'
            ],
            ignoredFiles: [
                '.DS_Store'
            ]
        },
        documentationGovernance: {
            description: 'Documentation gates owned by non-runtime Nodics quality tooling. Add a gate only after that module/layer is fully documented.',
            navigation: {
                enabled: false,
                canonicalContentRepository: 'nodics.docs',
                canonicalContentPack: 'catalogue.json',
                reason: 'Canonical framework documentation content is governed by the nodics.docs functional module.',
                entryPoint: 'README.md',
                publicRoot: 'nodics.docs/content',
                publicIndex: 'nodics.docs/content/nodics.core/overview.md',
                moduleCatalog: 'nodics.docs/catalogue.json',
                excludedPublicPages: [],
                requiredEntryPoints: []
            },
            enforcedGates: [
                {
                    name: 'nRouter complete routing contract',
                    scope: 'all',
                    module: 'nRouter',
                    includeTests: true,
                    description: 'All nRouter module lifecycle, configuration, route metadata, router utilities, services, and contract tests must remain fully documented.'
                },
                {
                    name: 'nConfig complete startup and generation contract',
                    scope: 'all',
                    module: 'nConfig',
                    includeTests: true,
                    description: 'All nConfig runtime registries, configuration scripts, startup services, utilities, clean/build entrypoints, and governance tests must remain fully documented.'
                },
                {
                    name: 'nCommon complete shared platform contract',
                    scope: 'all',
                    module: 'nCommon',
                    includeTests: true,
                    description: 'All nCommon configuration, lifecycle, error, interceptor, processor, promise, file, security utility, access inheritance, event, status, and traceability contracts must remain fully documented.'
                },
                {
                    name: 'nTooling complete non-runtime command contract',
                    scope: 'all',
                    module: 'nTooling',
                    includeTests: true,
                    description: 'All nTooling command discovery, override governance, quality, context generation, metadata, adapters, and tests must remain fully documented.'
                },
                {
                    name: 'nTest complete test execution contract',
                    scope: 'all',
                    module: 'nTest',
                    includeTests: true,
                    description: 'All nTest module lifecycle, configuration, test execution, schema test generation, router, utility, and test contracts must remain fully documented.'
                },
                {
                    name: 'nDatabase runtime contract',
                    scope: 'runtime',
                    module: 'nDatabase',
                    description: 'nDatabase schema, connection, model, MongoDB adapter, generated CRUD, router, pipeline, controller, facade, and database wrapper contracts must remain fully documented.'
                },
                {
                    name: 'nPipeline complete pipeline contract',
                    scope: 'all',
                    module: 'nPipeline',
                    includeTests: true,
                    description: 'All nPipeline module lifecycle, configuration, schemas, routers, executors, listeners, utilities, and tests must remain fully documented.'
                },
                {
                    name: 'nService complete service and versioned-service contract',
                    scope: 'all',
                    module: 'nService',
                    includeTests: true,
                    description: 'All nService and vService module lifecycle, configuration, tenant, auth, authorization, communication, topology, utility, and test contracts must remain fully documented.'
                },
                {
                    name: 'nDefault complete baseline contract',
                    scope: 'all',
                    module: 'nDefault',
                    includeTests: true,
                    description: 'All nDefault module lifecycle, configuration, router, schema, pipeline, utility, and test scaffold contracts must remain fully documented.'
                },
                {
                    name: 'nPublish complete publish contract',
                    scope: 'all',
                    module: 'nPublish',
                    includeTests: true,
                    description: 'All nPublish module lifecycle, configuration, router, schema, pipeline, utility, and test scaffold contracts must remain fully documented.'
                },
                {
                    name: 'dataProcessor complete DEAP processing contract',
                    scope: 'all',
                    module: 'dataProcessor',
                    includeTests: true,
                    description: 'All dataProcessor module lifecycle, configuration, router, schema, pipeline, service, utility, and test contracts must remain fully documented.'
                },
                {
                    name: 'dataPublisher complete DEAP publishing contract',
                    scope: 'all',
                    module: 'dataPublisher',
                    includeTests: true,
                    description: 'All dataPublisher module lifecycle, configuration, router, schema, pipeline, service, utility, and test contracts must remain fully documented.'
                },
                {
                    name: 'cart complete commerce contract',
                    scope: 'all',
                    module: 'cart',
                    includeTests: true,
                    description: 'All cart module lifecycle, configuration, schema, router, interceptor, pipeline, service, utility, data, and test contracts must remain fully documented.'
                },
                {
                    name: 'order complete commerce contract',
                    scope: 'all',
                    module: 'order',
                    includeTests: true,
                    description: 'All order module lifecycle, configuration, initializer data, schema, router, interceptor, pipeline, service, utility, and test contracts must remain fully documented.'
                },
                {
                    name: 'cms complete content contract',
                    scope: 'all',
                    module: 'cms',
                    includeTests: true,
                    description: 'All CMS module lifecycle, configuration, initializer data, sample data, schema, router, interceptor, service, utility, and test contracts must remain fully documented.'
                },
                {
                    name: 'wcms complete workflow content contract',
                    scope: 'all',
                    module: 'wcms',
                    includeTests: true,
                    description: 'All WCMS module lifecycle, configuration, workflow initializer data, import headers, router, schema, interceptor, pipeline, service, utility, and test contracts must remain fully documented.'
                },
                {
                    name: 'cronjob complete scheduler contract',
                    scope: 'all',
                    module: 'cronjob',
                    includeTests: true,
                    description: 'All cronjob module lifecycle, configuration, initializer data, router, schema, pipeline, scheduler container, lifecycle trigger, node responsibility, service, utility, and test contracts must remain fully documented.'
                },
                {
                    name: 'nems complete event management contract',
                    scope: 'all',
                    module: 'nems',
                    includeTests: true,
                    description: 'All NEMS module lifecycle, configuration, initializer data, router, schema, event splitting, event dispatch, service, utility, and test contracts must remain fully documented.'
                },
                {
                    name: 'all modules complete source and test documentation contract',
                    scope: 'all',
                    includeTests: true,
                    description: 'Every checked Nodics module file and exported method across source, configuration, data, module lifecycle, and test surfaces must remain documented for AI tools and human developers.'
                }
            ],
            reportOnlyGates: [
                {
                    name: 'framework core rollout baseline',
                    scope: 'framework-core',
                    description: 'Non-blocking visibility for the remaining core framework documentation rollout.'
                }
            ]
        },
        testSuites: {
            basic: [
                { npm: 'check:syntax' },
                { npm: 'quality:copyright' },
                { suite: 'config' },
                { suite: 'governance' },
                { node: 'nodics.core/modules/nService/test/statusDefinitionCatalog.test.js' },
                { suite: 'traceability' },
                { suite: 'headers' },
                { suite: 'route-contracts' },
                { suite: 'generated' },
                { tool: ['test:capability-behavior', '--area=system'] },
                { suite: 'import' },
                { suite: 'profile' },
                { suite: 'backoffice' },
                { suite: 'cache' },
                { suite: 'cronjob' },
                { suite: 'ems' },
                { suite: 'search' },
                { suite: 'dynamo' },
                { node: 'nodics.core/modules/nValidator/test/validatorServiceContract.test.js' },
                { node: 'nodics.core/modules/nDatabase/database/test/schemaIndexServiceContract.test.js' },
                { node: 'nodics.core/modules/nDatabase/database/test/schemaIndexControllerRequestMapping.test.js' },
                { node: 'nodics.core/modules/nCatalog/test/catalogCapabilityContract.test.js' },
                { node: 'nodics.core/modules/nOtp/test/otpCapabilityContract.test.js' }
            ],
            full: [
                { suite: 'basic' }
            ],
            config: [
                { node: 'nodics.core/modules/nConfig/test/configurationValidation.test.js' },
                { node: 'nodics.core/modules/nConfig/test/nonRuntimePackageDiscovery.test.js' },
                { node: 'nodics.core/modules/nDatabase/database/test/tenantDatabaseConfigurationValidation.test.js' },
                { tool: ['module:metadata:validate'] },
                { suite: 'tooling' },
                { node: 'nodics.core/modules/nTest/test/layeredTestDiscovery.test.js' },
                { tool: ['llm:validate'] }
            ],
            tooling: [
                { node: 'nodics.core/modules/nTooling/test/toolingCommandOverride.test.js' },
                { node: 'nodics.core/modules/nTooling/test/repositoryToolingBoundary.test.js' },
                { node: 'nodics.core/modules/nTooling/test/repositoryGovernanceDocumentsContract.test.js' },
                { node: 'nodics.core/modules/nTooling/test/documentationNavigationQuality.test.js' },
                { node: 'nodics.core/modules/nTooling/test/dependencyRuntimeContract.test.js' },
                { node: 'nodics.core/modules/nTooling/test/dependencyOwnershipContract.test.js' },
                { node: 'nodics.core/modules/nTooling/test/releaseCheckCommandContract.test.js' },
                { node: 'nodics.core/modules/nTooling/test/projectPostmanCoverageOwnership.test.js' },
                { node: 'nodics.core/modules/nTooling/test/fullTestSuiteCoverageContract.test.js' },
                { node: 'nodics.core/modules/nTooling/test/moduleStructure.test.js' },
                { node: 'nodics.core/modules/nTooling/test/structureComplianceAudit.test.js' },
                { node: 'nodics.core/modules/nTooling/test/structureGeneratorAlignment.test.js' },
                { node: 'nodics.core/modules/nTooling/test/topologyPlanWorkflow.test.js' },
                { node: 'nodics.core/modules/nTooling/test/testSuiteCommandContract.test.js' },
                { node: 'nodics.core/modules/nTooling/test/llmChangeAcceptanceContract.test.js' },
                { node: 'nodics.core/modules/nTooling/test/mcpReadOnlyGovernanceContract.test.js' },
                { node: 'nodics.core/modules/nTooling/test/copyrightHeaderGovernance.test.js' }
            ],
            governance: [
                { node: 'nodics.core/modules/nConfig/test/layeredCustomizationContract.test.js' },
                { node: 'nodics.core/modules/nConfig/test/configurationOwnershipContract.test.js' },
                { node: 'nodics.core/modules/nConfig/test/schemaOverrideGovernance.test.js' },
                { node: 'nodics.core/modules/nConfig/test/routerOverrideGovernance.test.js' },
                { suite: 'runtime-overrides' },
                { suite: 'schema-access-policy' },
                { node: 'nodics.core/modules/nDatabase/database/test/schemaReadAccessPolicyService.test.js' },
                { node: 'nodics.core/modules/nDatabase/database/test/modelsGetInitializerPipelineContract.test.js' },
                { node: 'nodics.core/modules/nDatabase/database/test/modelSaveInitializerPipelineContract.test.js' },
                { node: 'nodics.core/modules/nDatabase/database/test/schemaTransactionGovernanceContract.test.js' },
                { node: 'nodics.core/modules/nDatabase/database/test/databaseTransactionContract.test.js' },
                { node: 'nodics.core/modules/nDatabase/mongodb/test/mongodbTransactionContract.test.js' },
                { node: 'nodics.core/modules/nDatabase/database/test/modelsSaveInitializerPipelineContract.test.js' },
                { node: 'nodics.core/modules/nDatabase/database/test/modelsRemoveUpdateInitializerPipelineContract.test.js' },
                { node: 'nodics.core/modules/nDatabase/database/test/schemaWriteAccessPolicyService.test.js' },
                { node: 'nodics.core/modules/nDatabase/database/vDatabase/test/versionedSchemaSelectionContract.test.js' },
                { node: 'nodics.core/modules/nDatabase/mongodb/vMongodb/test/versionedModelContract.test.js' },
                { node: 'nodics.core/modules/nPublish/test/publicationLifecycleService.test.js' },
                { node: 'nodics.core/modules/nConfig/test/artifactOverrideTraceability.test.js' }
            ],
            'runtime-overrides': [
                { node: 'nodics.core/modules/nConfig/test/runtimeOverrideGovernance.test.js' },
                { node: 'nodics.core/modules/nDynamo/test/runtimeRouterConfigurationService.test.js' },
                { node: 'nodics.core/modules/nDynamo/test/routerConfigurationGovernance.test.js' },
                { node: 'nodics.core/modules/nDynamo/test/runtimeConfigurationAuditService.test.js' },
                { node: 'nodics.core/modules/nDynamo/test/runtimeConfigurationActivationAudit.test.js' },
                { node: 'nodics.core/modules/nDynamo/test/runtimeConfigurationRollbackService.test.js' },
                { node: 'nodics.core/modules/nDynamo/test/runtimeConfigurationPreviewService.test.js' },
                { node: 'nodics.core/modules/nDynamo/test/runtimeConfigurationActivationPolicyService.test.js' },
                { node: 'nodics.core/modules/nDynamo/test/runtimeConfigurationActivationPolicyEnforcement.test.js' },
                { node: 'nodics.core/modules/nDynamo/test/runtimeConfigurationActivationRequestService.test.js' },
                { node: 'nodics.core/modules/nDynamo/test/runtimePropertyConfigurationGovernance.test.js' },
                { node: 'nodics.core/modules/nDynamo/test/runtimeConfigurationGovernanceSummaryService.test.js' },
                { node: 'nodics.core/modules/nDynamo/test/runtimeConfigurationGovernanceCleanupService.test.js' },
                { node: 'nodics.core/modules/nDynamo/test/schemaTransactionRuntimeGovernanceContract.test.js' }
            ],
            'schema-access-policy': [
                { node: 'nodics.core/modules/nDynamo/test/schemaAccessPolicyContractService.test.js' },
                { node: 'nodics.core/modules/nDynamo/test/schemaAccessPolicyResolverService.test.js' },
                { node: 'nodics.core/modules/nDynamo/test/schemaAccessPolicyGovernanceLifecycle.test.js' }
            ],
            traceability: [
                { node: 'nodics.core/modules/nCommon/test/errorTraceability.test.js' },
                { node: 'nodics.core/modules/nCommon/test/executionLayerTraceability.test.js' }
            ],
            headers: [
                { node: 'nodics.core/modules/nAuth/test/authSecurityContract.test.js' },
                { node: 'nodics.core/modules/nAuth/test/integration/authDistributedSharedCacheContract.test.js' },
                { node: 'nodics.core/modules/nAuth/test/integration/authIdentityIsolationContract.test.js' },
                { node: 'nodics.platform/modules/profile/test/identityGovernanceMigrationIntegration.test.js' },
                { node: 'nodics.core/modules/nAuth/test/integration/authModularAuthorizationContract.test.js' },
                { node: 'nodics.core/modules/nService/test/authTokenInvalidationService.test.js' },
                { node: 'nodics.core/modules/nRouter/test/authHeaderNormalization.test.js' },
                { node: 'nodics.core/modules/nRouter/test/routeActionAuthorization.test.js' },
                { node: 'nodics.core/modules/nService/test/moduleRequestHeaderNormalization.test.js' },
                { node: 'nodics.core/modules/nRouter/test/httpHardeningContract.test.js' },
                { node: 'nodics.core/modules/nRouter/test/requestPipelineResponseContract.test.js' },
                { node: 'nodics.core/modules/nRouter/test/jsonResponseStatusResolution.test.js' }
            ],
            'auth-distributed': [
                { node: 'nodics.core/modules/nAuth/test/integration/authDistributedSharedCacheContract.test.js' },
                { node: 'nodics.core/modules/nAuth/test/integration/authIdentityIsolationContract.test.js' },
                { node: 'nodics.platform/modules/profile/test/identityGovernanceMigrationIntegration.test.js' },
                { node: 'nodics.core/modules/nAuth/test/integration/authModularAuthorizationContract.test.js' },
                { node: 'nodics.core/modules/nAuth/test/integration/authRedisLiveIntegration.test.js' }
            ],
            'auth-redis-live': [
                { node: 'nodics.core/modules/nAuth/test/integration/authRedisLiveIntegration.test.js' }
            ],
            'route-contracts': [
                { tool: ['test:route-contracts'] },
                { node: 'nodics.core/modules/nRouter/test/openapiContractGeneration.test.js' }
            ],
            generated: [
                { node: 'nodics.core/modules/nTest/test/generatedTestRunnerLifecycleContract.test.js' },
                { node: 'nodics.core/modules/nTest/test/schemaTestGeneratorEffectiveSchema.test.js' },
                { node: 'nodics.core/modules/nTest/test/schemaTestGeneratorCrudFixtureInheritance.test.js' },
                { node: 'nodics.core/modules/nTest/test/schemaTestGeneratorEffectiveOverrideRemoval.test.js' },
                { tool: ['test:live-tenant-guard'] },
                { tool: ['test:suite-reporter'] },
                { tool: ['test:generated'] }
            ],
            import: [
                { node: 'nodics.core/modules/nData/nImport/import/test/systemDataImportInitializerValidation.test.js' },
                { node: 'nodics.core/modules/nData/nImport/import/test/importTenantPrecedence.test.js' },
                { node: 'nodics.core/modules/nData/nImport/import/test/testTenantImportIsolation.test.js' },
                { node: 'nodics.core/modules/nData/nImport/import/test/environmentSampleDataContribution.test.js' },
                { node: 'nodics.core/modules/nData/nImport/import/test/mandatoryInitDataImportContract.test.js' },
                { node: 'nodics.core/modules/nData/nImport/import/test/importLifecycleContract.test.js' },
                { node: 'nodics.core/modules/nData/nImport/import/test/remoteImportTransportGovernance.test.js' },
                { node: 'nodics.core/modules/nData/nImport/import/test/remoteImportInitializerContract.test.js' },
                { node: 'nodics.core/modules/nData/nImport/import/test/systemCoreSampleDataCatalog.test.js' },
                { node: 'nodics.core/modules/nData/nImport/import/test/multiFormatDataProcessors.test.js' },
                { node: 'nodics.core/modules/nData/nImport/import/test/profileTenantLocalFileImportContract.test.js' },
                { node: 'nodics.core/modules/nData/nImport/import/test/systemImportDiagnosticsValidationOnly.test.js' },
                { node: 'nodics.core/modules/nData/nImport/import/test/importRunSummaryContract.test.js' },
                { node: 'nodics.core/modules/nData/nImport/import/test/importRunHistoryService.test.js' },
                { node: 'nodics.core/modules/nData/nImport/import/test/importGovernanceLifecycleContract.test.js' },
                { node: 'nodics.core/modules/nData/nImport/import/test/importRunHistoryControllerRoute.test.js' },
                { node: 'nodics.core/modules/nData/nImport/import/test/importDuplicateHeaderDiagnostics.test.js' },
                { node: 'nodics.core/modules/nData/nImport/import/test/finalizedRecordCounter.test.js' },
                { node: 'nodics.core/modules/nData/nImport/import/test/finalizedImportDispatch.test.js' },
                { node: 'nodics.core/modules/nData/nImport/import/test/importTargetDispatchContract.test.js' },
                { node: 'nodics.core/modules/nData/nImport/import/test/importRecursiveErrorPropagation.test.js' },
                { node: 'nodics.core/modules/nData/nImport/import/test/importDiagnosticsPropagation.test.js' },
                { node: 'nodics.core/modules/nData/nImport/import/test/importFileArchivalLifecycle.test.js' },
                { node: 'nodics.core/modules/nData/nImport/import/test/importFailureTraceability.test.js' },
                { node: 'nodics.core/modules/nData/nImport/import/test/importExportAccessPolicy.test.js' }
            ],
            export: [
                { node: 'nodics.core/modules/nData/nExport/export/test/dataExportCapabilityBehavior.test.js' }
            ],
            profile: [
                { node: 'nodics.platform/modules/profile/test/initRequiredFlag.test.js' },
                { node: 'nodics.platform/modules/profile/test/profileInitRequiredDetection.test.js' },
                { node: 'nodics.platform/modules/profile/test/mandatoryIdentityBootstrapService.test.js' },
                { node: 'nodics.platform/modules/profile/test/userGroupPermissionResolution.test.js' },
                { node: 'nodics.platform/modules/profile/test/identityGovernanceContract.test.js' },
                { node: 'nodics.platform/modules/profile/test/identityGovernanceMigrationContract.test.js' },
                { node: 'nodics.platform/modules/profile/test/profileAuthenticationServiceContract.test.js' },
                { node: 'nodics.platform/modules/profile/test/profileRuntimeBoundInternalToken.test.js' },
                { tool: ['test:capability-behavior', '--area=profile'] }
            ],
            backoffice: [
                { node: 'nodics.platform/modules/backoffice/test/backofficeModuleBoundaryContract.test.js' },
                { node: 'nodics.platform/modules/backoffice/test/backofficeRegistryRouteContract.test.js' },
                { node: 'nodics.platform/modules/backoffice/test/backofficeApiContract.test.js' },
                { node: 'nodics.platform/modules/backoffice/test/backofficeDiscoveryService.test.js' },
                { node: 'nodics.platform/modules/backoffice/test/backofficeAvailabilityService.test.js' },
                { node: 'nodics.platform/modules/backoffice/test/backofficeAdministrativeSecurityService.test.js' },
                { node: 'nodics.platform/modules/backoffice/test/backofficePerformanceContract.test.js' },
                { node: 'nodics.platform/modules/backoffice/test/backofficeOperationalReadinessService.test.js' },
                { node: 'nodics.platform/modules/backoffice/test/backofficeContractRepositoryService.test.js' },
                { node: 'nodics.platform/modules/backoffice/test/backofficeContractLifecycleService.test.js' },
                { node: 'nodics.platform/modules/backoffice/test/backofficeAuditService.test.js' },
                { node: 'nodics.platform/modules/backoffice/test/backofficeRegistryService.test.js' },
                { node: 'nodics.platform/modules/backoffice/test/backofficeDistributedRegistryStore.test.js' },
                { node: 'nodics.platform/modules/backoffice/test/backofficeDistributedRegistryStoreLive.test.js' },
                { node: 'nodics.core/modules/nService/test/moduleRegistrationAgent.test.js' }
            ],
            cache: [
                { node: 'nodics.core/modules/nCache/cache/test/cacheIsolationAndCorrectnessContract.test.js' },
                { node: 'nodics.core/modules/nCache/cache/test/cacheMutationSecurityContract.test.js' },
                { node: 'nodics.core/modules/nCache/cache/test/cacheDiagnosticsContract.test.js' },
                { node: 'nodics.core/modules/nCache/cache/test/cacheBenchmarkContract.test.js' },
                { node: 'nodics.core/modules/nCache/cache/test/cachePolicyContract.test.js' },
                { node: 'nodics.core/modules/nCache/cache/test/cacheAdapterContract.test.js' },
                { node: 'nodics.core/modules/nCache/cache/test/cacheInvalidationContract.test.js' },
                { node: 'nodics.core/modules/nCache/redisCache/test/cacheRedisLive.test.js' }
            ],
            'cache-redis-live': [
                { node: 'nodics.core/modules/nCache/redisCache/test/cacheRedisLive.test.js' }
            ],
            cronjob: [
                { node: 'nodics.cron/modules/cronjob/test/cronJobRouteContract.test.js' },
                { node: 'nodics.cron/modules/cronjob/test/cronJobControllerRequestMapping.test.js' },
                { node: 'nodics.cron/modules/cronjob/test/cronJobServiceLifecycleContract.test.js' },
                { node: 'nodics.cron/modules/cronjob/test/cronJobRuntimeContainerContract.test.js' },
                { node: 'nodics.cron/modules/cronjob/test/cronJobEventHandlerContract.test.js' }
            ],
            ems: [
                { node: 'nodics.core/modules/nEms/emsClient/test/emsClientRouteContract.test.js' },
                { node: 'nodics.core/modules/nEms/emsClient/test/messageTenantResolution.test.js' },
                { node: 'nodics.core/modules/nEms/emsClient/test/emsClientServiceContract.test.js' },
                { node: 'nodics.core/modules/nEms/emsClient/test/emsMessageProcessContract.test.js' },
                { tool: ['test:capability-behavior', '--area=ems'] }
            ],
            search: [
                { node: 'nodics.core/modules/nSearch/search/test/searchRouteContract.test.js' },
                { node: 'nodics.core/modules/nSearch/search/test/searchControllerRequestMapping.test.js' },
                { node: 'nodics.core/modules/nSearch/search/test/searchServicePipelineContract.test.js' },
                { node: 'nodics.core/modules/nSearch/search/test/searchPipelineInitializerContract.test.js' },
                { node: 'nodics.core/modules/nSearch/search/test/indexerServiceContract.test.js' },
                { node: 'nodics.core/modules/nSearch/search/test/searchCachePolicyContract.test.js' },
                { node: 'nodics.core/modules/nSearch/elastic/test/elasticSearchModelOperationContract.test.js' },
                { node: 'nodics.core/modules/nSearch/elastic/test/elasticConnectionHandlerContract.test.js' }
            ],
            dynamo: [
                { node: 'nodics.core/modules/nDynamo/test/dynamoRouteContract.test.js' },
                { node: 'nodics.core/modules/nDynamo/test/classConfigurationControllerRequestMapping.test.js' },
                { node: 'nodics.core/modules/nDynamo/test/classConfigurationServiceContract.test.js' },
                { node: 'nodics.core/modules/nDynamo/test/dynamoRuntimeAdminSurfaceContract.test.js' },
                { node: 'nodics.core/modules/nDynamo/test/runtimeRouterConfigurationService.test.js' },
                { node: 'nodics.core/modules/nDynamo/test/routerConfigurationGovernance.test.js' },
                { node: 'nodics.core/modules/nDynamo/test/runtimeSchemaPipelineContract.test.js' },
                { node: 'nodics.core/modules/nDynamo/test/runtimeConfigurationAuditService.test.js' },
                { node: 'nodics.core/modules/nDynamo/test/runtimeConfigurationPreviewService.test.js' },
                { node: 'nodics.core/modules/nDynamo/test/runtimeConfigurationActivationPolicyService.test.js' },
                { node: 'nodics.core/modules/nDynamo/test/runtimeConfigurationActivationPolicyEnforcement.test.js' },
                { node: 'nodics.core/modules/nDynamo/test/runtimeConfigurationActivationRequestService.test.js' },
                { node: 'nodics.core/modules/nDynamo/test/runtimeConfigurationActivationAudit.test.js' },
                { node: 'nodics.core/modules/nDynamo/test/runtimeConfigurationRollbackService.test.js' },
                { node: 'nodics.core/modules/nDynamo/test/runtimePropertyConfigurationGovernance.test.js' },
                { node: 'nodics.core/modules/nDynamo/test/runtimeConfigurationGovernanceSummaryService.test.js' },
                { node: 'nodics.core/modules/nDynamo/test/runtimeConfigurationGovernanceCleanupService.test.js' },
                { node: 'nodics.core/modules/nDynamo/test/governanceReportMaturityMatrix.test.js' },
                { node: 'nodics.core/modules/nDynamo/test/schemaAccessPolicyContractService.test.js' },
                { node: 'nodics.core/modules/nDynamo/test/schemaAccessPolicyResolverService.test.js' },
                { node: 'nodics.core/modules/nDynamo/test/schemaAccessPolicyGovernanceLifecycle.test.js' }
            ],
            workflow: [
                { node: 'nodics.core/modules/nbpm/test/coreBootstrapWorkflowBridgeContract.test.js' },
                { node: 'nodics.core/modules/nbpm/test/removeWorkflowProcessBehavior.test.js' },
                { node: 'nodics.core/modules/nbpm/test/workflowLifecyclePipelineContract.test.js' }
            ]
        },
        commands: {
            'validate:root': {
                description: 'Validate the nodics.ai framework repository boundary and nSetup LLM taxonomy.',
                handler: 'src/service/command/defaultNodeScriptCommandService.js',
                script: 'src/service/quality/defaultFrameworkRootValidationService.js'
            },
            clean: {
                description: 'Clean generated Nodics artifacts through governed lifecycle steps.',
                handler: 'src/service/command/defaultNodicsLifecycleCommandService.js',
                steps: [
                    { tool: ['llm:clean'] },
                    { nodicsMethod: 'cleanAll' }
                ]
            },
            build: {
                description: 'Build Nodics artifacts and run generated-artifact governance gates.',
                handler: 'src/service/command/defaultNodicsLifecycleCommandService.js',
                steps: [
                    { tool: ['ai:validate'] },
                    { tool: ['quality:copyright', '--fail'] },
                    { tool: ['quality:docs'] },
                    { nodicsMethod: 'buildAll' },
                    { tool: ['quality:copyright', '--fix'] },
                    { tool: ['docs:openapi'] },
                    { tool: ['llm:generate'] },
                    { tool: ['ai:principle-audit'] },
                    { tool: ['governance:report'] },
                    { tool: ['docs:coverage', '--scope=generated', '--fail'] },
                    { tool: ['quality:copyright', '--fail'] }
                ]
            },
            'release:check': {
                description: 'Print or execute the clean-checkout release gate for dependency install, clean, build, documentation, LLM context, and tests.',
                handler: 'src/service/command/defaultReleaseCheckCommandService.js',
                steps: [
                    { npm: ['ci'] },
                    { npm: ['audit', '--omit=dev'] },
                    { npmRun: ['clean'] },
                    { npmRun: ['build'] },
                    { npmRun: ['llm:validate'] },
                    { npmRun: ['quality:docs'] },
                    { npmRun: ['test:basic'] }
                ],
                fullSteps: [
                    { npmRun: ['test:full'] }
                ]
            },
            'test:suite': {
                description: 'Run a configured Nodics test suite by name from tooling-owned suite configuration.',
                handler: 'src/service/command/defaultTestSuiteCommandService.js'
            },
            'ai:validate': {
                description: 'Run AI/developer governance validation for Nodics source contracts.',
                handler: 'src/service/command/defaultNodeScriptCommandService.js',
                script: 'src/service/quality/defaultAiGovernanceValidationService.js'
            },
            'ai:principle-audit': {
                description: 'Run the Nodics principle audit over governance and command contracts.',
                handler: 'src/service/command/defaultNodeScriptCommandService.js',
                script: 'src/service/quality/defaultDesignPrincipleAuditService.js'
            },
            'docs:coverage': {
                description: 'Inspect source documentation coverage for the target Nodics project.',
                handler: 'src/service/command/defaultDocumentationCoverageCommandService.js'
            },
            'quality:docs': {
                description: 'Run governed documentation quality gates for the target Nodics project.',
                handler: 'src/service/command/defaultDocumentationGatesCommandService.js'
            },
            'quality:copyright': {
                description: 'Validate standard Nodics copyright headers for JavaScript source and generated artifacts.',
                handler: 'src/service/command/defaultNodeScriptCommandService.js',
                script: 'src/service/quality/defaultCopyrightHeaderQualityService.js'
            },
            'structure:audit': {
                description: 'Report Nodics project/module/environment/server/node structure gaps against the canonical structure matrix.',
                handler: 'src/service/command/defaultNodeScriptCommandService.js',
                script: 'src/service/quality/defaultStructureComplianceQualityService.js'
            },
            'structure:generate': {
                description: 'Generate Nodics project/module/environment/server/node scaffolds from the canonical structure matrix.',
                handler: 'src/service/command/defaultNodeScriptCommandService.js',
                script: 'src/service/generation/defaultStructureGeneratorService.js'
            },
            'structure:plan': {
                description: 'Plan or apply an approval-first Nodics project topology using the canonical structure matrix.',
                handler: 'src/service/command/defaultNodeScriptCommandService.js',
                script: 'src/service/generation/defaultTopologyPlanService.js'
            },
            'llm:generate': {
                description: 'Generate module-owned LLM context for the target Nodics project.',
                handler: 'src/service/command/defaultNodeScriptCommandService.js',
                script: 'src/service/context/defaultGenerateModuleLlmContextService.js'
            },
            'llm:clean': {
                description: 'Remove generated module LLM context from the target Nodics project.',
                handler: 'src/service/command/defaultNodeScriptCommandService.js',
                script: 'src/service/context/defaultCleanModuleLlmContextService.js'
            },
            'llm:validate': {
                description: 'Validate generated module LLM context for the target Nodics project.',
                handler: 'src/service/command/defaultNodeScriptCommandService.js',
                script: 'test/moduleLlmContext.test.js'
            },
            'module:metadata': {
                description: 'Normalize canonical Nodics package metadata for the target project.',
                handler: 'src/service/command/defaultNodeScriptCommandService.js',
                script: 'src/service/context/defaultNormalizeModuleMetadataService.js'
            },
            'module:metadata:validate': {
                description: 'Validate canonical Nodics package metadata for the target project.',
                handler: 'src/service/command/defaultNodeScriptCommandService.js',
                script: 'test/moduleMetadata.test.js'
            },
            'mcp:governance': {
                description: 'Print read-only Nodics governance context for future MCP adapters.',
                handler: '@nTooling/mcp-governance',
                service: 'defaultMcpGovernanceService'
            },
            'mcp:validate': {
                description: 'Run approved Nodics validation checks and print structured MCP-safe results.',
                handler: '@nTooling/mcp-validate',
                service: 'defaultMcpValidationService'
            },
            'mcp:runtime-context': {
                description: 'Explain source-backed runtime hierarchy, active-module declarations, and override paths.',
                handler: '@nTooling/mcp-runtime-context',
                service: 'defaultMcpRuntimeContextService'
            },
            'mcp:mutation-plan': {
                description: 'Create guarded mutation or generation plans without executing writes by default.',
                handler: '@nTooling/mcp-mutation-plan',
                service: 'defaultMcpMutationGuardService'
            },
            'debug:clean': {
                description: 'Run Nodics clean under the debugger and break on startup.',
                handler: 'src/service/command/defaultNodeScriptCommandService.js',
                script: 'src/service/debug/defaultNodicsDebugService.js',
                arguments: ['clean', '--brk']
            },
            'debug:clean:inspect': {
                description: 'Run Nodics clean under the debugger without an initial breakpoint.',
                handler: 'src/service/command/defaultNodeScriptCommandService.js',
                script: 'src/service/debug/defaultNodicsDebugService.js',
                arguments: ['clean', '--no-brk']
            },
            'debug:build': {
                description: 'Run Nodics build under the debugger and break on startup.',
                handler: 'src/service/command/defaultNodeScriptCommandService.js',
                script: 'src/service/debug/defaultNodicsDebugService.js',
                arguments: ['build', '--brk']
            },
            'debug:build:inspect': {
                description: 'Run Nodics build under the debugger without an initial breakpoint.',
                handler: 'src/service/command/defaultNodeScriptCommandService.js',
                script: 'src/service/debug/defaultNodicsDebugService.js',
                arguments: ['build', '--no-brk']
            },
            'debug:start': {
                description: 'Run Nodics startup under the debugger and break on startup.',
                handler: 'src/service/command/defaultNodeScriptCommandService.js',
                script: 'src/service/debug/defaultNodicsDebugService.js',
                arguments: ['start', '--brk']
            },
            'debug:start:inspect': {
                description: 'Run Nodics startup under the debugger without an initial breakpoint.',
                handler: 'src/service/command/defaultNodeScriptCommandService.js',
                script: 'src/service/debug/defaultNodicsDebugService.js',
                arguments: ['start', '--no-brk']
            }
        }
    }
};
