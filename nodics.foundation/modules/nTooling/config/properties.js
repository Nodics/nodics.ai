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
                canonicalContentPack: 'docs/catalogue.json',
                reason: 'Canonical framework documentation content is governed by the nodics.docs functional module.',
                entryPoint: 'README.md',
                publicRoot: 'nodics.docs/docs/pages',
                publicIndex: 'nodics.docs/docs/pages/nodics.foundation/overview.md',
                moduleCatalog: 'nodics.docs/docs/catalogue.json',
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
                    name: 'profile complete identity contract',
                    scope: 'all',
                    module: 'profile',
                    includeTests: true,
                    description: 'All Profile module lifecycle, identity, enterprise, tenant, user, group, permission, authentication, router, schema, service, data, and test contracts must remain fully documented.'
                },
                {
                    name: 'backoffice complete registry contract',
                    scope: 'all',
                    module: 'backoffice',
                    includeTests: true,
                    description: 'All BackOffice registry, bootstrap, contract lifecycle, catalogue, availability, Axis policy, router, schema, service, data, and test contracts must remain fully documented.'
                },
                {
                    name: 'cms complete content contract',
                    scope: 'all',
                    module: 'cms',
                    includeTests: true,
                    description: 'All CMS module lifecycle, configuration, initializer data, sample data, schema, router, interceptor, service, utility, and test contracts must remain fully documented.'
                },
                {
                    name: 'wcms complete web content contract',
                    scope: 'all',
                    module: 'wcms',
                    includeTests: true,
                    description: 'All WCMS module lifecycle, configuration, initializer data, import headers, router, schema, interceptor, pipeline, service, utility, and test contracts must remain fully documented.'
                },
                {
                    name: 'media complete governed asset contract',
                    scope: 'all',
                    module: 'media',
                    includeTests: true,
                    description: 'All Media module lifecycle, folders, formats, uploads, storage providers, delivery, references, sets, router, schema, service, data, and test contracts must remain fully documented.'
                },
                {
                    name: 'cronjob complete scheduler contract',
                    scope: 'all',
                    module: 'cronjob',
                    includeTests: true,
                    description: 'All cronjob module lifecycle, configuration, initializer data, router, schema, pipeline, scheduler container, lifecycle trigger, node responsibility, service, utility, and test contracts must remain fully documented.'
                },
                {
                    name: 'nEms complete event management contract',
                    scope: 'all',
                    module: 'nEms',
                    includeTests: true,
                    description: 'All nEms module lifecycle, configuration, initializer data, router, schema, event splitting, event dispatch, service, utility, and test contracts must remain fully documented.'
                },
                {
                    name: 'process workflow complete automation contract',
                    scope: 'all',
                    module: 'flow',
                    includeTests: true,
                    description: 'All Process workflow schema, API, runtime core, definition, instance, task, trigger, audit, router, service, and test contracts must remain fully documented.'
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
                { node: 'nodics.foundation/modules/nService/test/statusDefinitionCatalog.test.js' },
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
                { node: 'nodics.foundation/modules/nValidator/test/validatorServiceContract.test.js' },
                { node: 'nodics.foundation/modules/nDatabase/database/test/schemaIndexServiceContract.test.js' },
                { node: 'nodics.foundation/modules/nDatabase/database/test/schemaIndexControllerRequestMapping.test.js' },
                { node: 'nodics.foundation/modules/nCatalog/test/catalogCapabilityContract.test.js' },
                { node: 'nodics.foundation/modules/nOtp/test/otpCapabilityContract.test.js' }
            ],
            full: [
                { suite: 'basic' }
            ],
            config: [
                { node: 'nodics.foundation/modules/nConfig/test/configurationValidation.test.js' },
                { node: 'nodics.foundation/modules/nConfig/test/nonRuntimePackageDiscovery.test.js' },
                { node: 'nodics.foundation/modules/nDatabase/database/test/tenantDatabaseConfigurationValidation.test.js' },
                { node: 'nodics.foundation/modules/nDatabase/database/test/databaseConnectionHandlerRuntimeConfigContract.test.js' },
                { tool: ['module:metadata:validate'] },
                { suite: 'tooling' },
                { node: 'nodics.foundation/modules/nTest/test/layeredTestDiscovery.test.js' },
                { tool: ['llm:validate'] }
            ],
            tooling: [
                { node: 'nodics.foundation/modules/nTooling/test/toolingCommandOverride.test.js' },
                { node: 'nodics.foundation/modules/nTooling/test/repositoryToolingBoundary.test.js' },
                { node: 'nodics.foundation/modules/nTooling/test/repositoryGovernanceDocumentsContract.test.js' },
                { node: 'nodics.foundation/modules/nTooling/test/documentationNavigationQuality.test.js' },
                { node: 'nodics.foundation/modules/nTooling/test/applicationDocumentationRecordValidation.test.js' },
                { node: 'nodics.foundation/modules/nTooling/test/dependencyRuntimeContract.test.js' },
                { node: 'nodics.foundation/modules/nTooling/test/dependencyOwnershipContract.test.js' },
                { node: 'nodics.foundation/modules/nTooling/test/dataReleaseManifestGeneratorContract.test.js' },
                { node: 'nodics.foundation/modules/nTooling/test/dataLifecycleClassificationContract.test.js' },
                { node: 'nodics.foundation/modules/nTooling/test/releaseCheckCommandContract.test.js' },
                { node: 'nodics.foundation/modules/nTooling/test/repositoryBuildCompositionContract.test.js' },
                { node: 'nodics.foundation/modules/nTooling/test/projectPostmanCoverageOwnership.test.js' },
                { node: 'nodics.foundation/modules/nTooling/test/fullTestSuiteCoverageContract.test.js' },
                { node: 'nodics.foundation/modules/nTooling/test/moduleStructure.test.js' },
                { node: 'nodics.foundation/modules/nTooling/test/structureComplianceAudit.test.js' },
                { node: 'nodics.foundation/modules/nTooling/test/structureGeneratorAlignment.test.js' },
                { node: 'nodics.foundation/modules/nTooling/test/topologyPlanWorkflow.test.js' },
                { node: 'nodics.foundation/modules/nTooling/test/testSuiteCommandContract.test.js' },
                { node: 'nodics.foundation/modules/nTooling/test/syntaxCheckQualityService.test.js' },
                { node: 'nodics.foundation/modules/nTooling/test/llmChangeAcceptanceContract.test.js' },
                { node: 'nodics.foundation/modules/nTooling/test/mcpReadOnlyGovernanceContract.test.js' },
                { node: 'nodics.foundation/modules/nTooling/test/copyrightHeaderGovernance.test.js' },
                { node: 'nodics.foundation/modules/nTooling/test/projectCommandServiceContract.test.js' },
                { node: 'nodics.foundation/modules/nTooling/test/applicationBuilderSchemaContract.test.js' },
                { node: 'nodics.foundation/modules/nTooling/test/applicationBuilderGuidedContract.test.js' },
                { node: 'nodics.foundation/modules/nTooling/test/applicationBuilderAnswersTemplateContract.test.js' },
                { node: 'nodics.foundation/modules/nTooling/test/applicationBuilderQuestionnaireContract.test.js' },
                { node: 'nodics.foundation/modules/nTooling/test/applicationBuilderDryRunContract.test.js' },
                { node: 'nodics.foundation/modules/nTooling/test/applicationBuilderPlanningContract.test.js' },
                { node: 'nodics.foundation/modules/nTooling/test/applicationBuilderGenerationContract.test.js' },
                { node: 'nodics.foundation/modules/nTooling/test/applicationBuilderMultiDomainGenerationContract.test.js' },
                { node: 'nodics.foundation/modules/nTooling/test/applicationBuilderQualificationContract.test.js' },
                { node: 'nodics.foundation/modules/nTooling/test/applicationBuilderEndToEndJourneyContract.test.js' },
                { node: 'nodics.foundation/modules/nTooling/test/applicationBuilderUpgradeContract.test.js' },
                { node: 'nodics.foundation/modules/nTooling/test/applicationBuilderSafetyAcceptanceContract.test.js' },
                { node: 'nodics.foundation/modules/nTooling/test/localBootstrapAcceptanceProjectContract.test.js' }
            ],
            governance: [
                { node: 'nodics.foundation/modules/nConfig/test/layeredCustomizationContract.test.js' },
                { node: 'nodics.foundation/modules/nConfig/test/configurationOwnershipContract.test.js' },
                { node: 'nodics.foundation/modules/nConfig/test/schemaOverrideGovernance.test.js' },
                { node: 'nodics.foundation/modules/nConfig/test/routerOverrideGovernance.test.js' },
                { suite: 'runtime-overrides' },
                { suite: 'schema-access-policy' },
                { node: 'nodics.foundation/modules/nDatabase/database/test/schemaReadAccessPolicyService.test.js' },
                { node: 'nodics.foundation/modules/nDatabase/database/test/modelsGetInitializerPipelineContract.test.js' },
                { node: 'nodics.foundation/modules/nDatabase/database/test/modelSaveInitializerPipelineContract.test.js' },
                { node: 'nodics.foundation/modules/nDatabase/database/test/schemaTransactionGovernanceContract.test.js' },
                { node: 'nodics.foundation/modules/nDatabase/database/test/databaseTransactionContract.test.js' },
                { node: 'nodics.foundation/modules/nDatabase/mongodb/test/mongodbTransactionContract.test.js' },
                { node: 'nodics.foundation/modules/nDatabase/database/test/modelsSaveInitializerPipelineContract.test.js' },
                { node: 'nodics.foundation/modules/nDatabase/database/test/modelsRemoveUpdateInitializerPipelineContract.test.js' },
                { node: 'nodics.foundation/modules/nDatabase/database/test/schemaWriteAccessPolicyService.test.js' },
                { node: 'nodics.foundation/modules/nDatabase/database/vDatabase/test/versionedSchemaSelectionContract.test.js' },
                { node: 'nodics.foundation/modules/nDatabase/mongodb/vMongodb/test/versionedModelContract.test.js' },
                { node: 'nodics.foundation/modules/nPublish/test/publicationLifecycleService.test.js' },
                { node: 'nodics.foundation/modules/nConfig/test/artifactOverrideTraceability.test.js' }
            ],
            'runtime-overrides': [
                { node: 'nodics.foundation/modules/nConfig/test/runtimeOverrideGovernance.test.js' },
                { node: 'nodics.foundation/modules/nDynamo/test/runtimeRouterConfigurationService.test.js' },
                { node: 'nodics.foundation/modules/nDynamo/test/routerConfigurationGovernance.test.js' },
                { node: 'nodics.foundation/modules/nDynamo/test/runtimeConfigurationAuditService.test.js' },
                { node: 'nodics.foundation/modules/nDynamo/test/runtimeConfigurationActivationAudit.test.js' },
                { node: 'nodics.foundation/modules/nDynamo/test/runtimeConfigurationRollbackService.test.js' },
                { node: 'nodics.foundation/modules/nDynamo/test/runtimeConfigurationPreviewService.test.js' },
                { node: 'nodics.foundation/modules/nDynamo/test/runtimeConfigurationActivationPolicyService.test.js' },
                { node: 'nodics.foundation/modules/nDynamo/test/runtimeConfigurationActivationPolicyEnforcement.test.js' },
                { node: 'nodics.foundation/modules/nDynamo/test/runtimeConfigurationActivationRequestService.test.js' },
                { node: 'nodics.foundation/modules/nDynamo/test/runtimePropertyConfigurationGovernance.test.js' },
                { node: 'nodics.foundation/modules/nDynamo/test/runtimeConfigurationGovernanceSummaryService.test.js' },
                { node: 'nodics.foundation/modules/nDynamo/test/runtimeConfigurationGovernanceCleanupService.test.js' },
                { node: 'nodics.foundation/modules/nDynamo/test/schemaTransactionRuntimeGovernanceContract.test.js' }
            ],
            'schema-access-policy': [
                { node: 'nodics.foundation/modules/nDynamo/test/schemaAccessPolicyContractService.test.js' },
                { node: 'nodics.foundation/modules/nDynamo/test/schemaAccessPolicyResolverService.test.js' },
                { node: 'nodics.foundation/modules/nDynamo/test/schemaAccessPolicyGovernanceLifecycle.test.js' }
            ],
            traceability: [
                { node: 'nodics.foundation/modules/nCommon/test/errorTraceability.test.js' },
                { node: 'nodics.foundation/modules/nCommon/test/executionLayerTraceability.test.js' }
            ],
            headers: [
                { node: 'nodics.foundation/modules/nAuth/test/authSecurityContract.test.js' },
                { node: 'nodics.foundation/modules/nAuth/test/integration/authDistributedSharedCacheContract.test.js' },
                { node: 'nodics.foundation/modules/nAuth/test/integration/authIdentityIsolationContract.test.js' },
                { node: 'nodics.platform/modules/profile/test/identityGovernanceMigrationIntegration.test.js' },
                { node: 'nodics.foundation/modules/nAuth/test/integration/authModularAuthorizationContract.test.js' },
                { node: 'nodics.foundation/modules/nService/test/authTokenInvalidationService.test.js' },
                { node: 'nodics.foundation/modules/nRouter/test/authHeaderNormalization.test.js' },
                { node: 'nodics.foundation/modules/nRouter/test/routeActionAuthorization.test.js' },
                { node: 'nodics.foundation/modules/nService/test/moduleRequestHeaderNormalization.test.js' },
                { node: 'nodics.foundation/modules/nRouter/test/httpHardeningContract.test.js' },
                { node: 'nodics.foundation/modules/nRouter/test/requestPipelineResponseContract.test.js' },
                { node: 'nodics.foundation/modules/nRouter/test/jsonResponseStatusResolution.test.js' }
            ],
            'auth-distributed': [
                { node: 'nodics.foundation/modules/nAuth/test/integration/authDistributedSharedCacheContract.test.js' },
                { node: 'nodics.foundation/modules/nAuth/test/integration/authIdentityIsolationContract.test.js' },
                { node: 'nodics.platform/modules/profile/test/identityGovernanceMigrationIntegration.test.js' },
                { node: 'nodics.foundation/modules/nAuth/test/integration/authModularAuthorizationContract.test.js' },
                { node: 'nodics.foundation/modules/nAuth/test/integration/authRedisLiveIntegration.test.js' }
            ],
            'auth-redis-live': [
                { node: 'nodics.foundation/modules/nAuth/test/integration/authRedisLiveIntegration.test.js' }
            ],
            'route-contracts': [
                { tool: ['test:route-contracts'] },
                { node: 'nodics.foundation/modules/nRouter/test/openapiContractGeneration.test.js' }
            ],
            generated: [
                { node: 'nodics.foundation/modules/nTest/test/generatedTestRunnerLifecycleContract.test.js' },
                { node: 'nodics.foundation/modules/nTest/test/schemaTestGeneratorEffectiveSchema.test.js' },
                { node: 'nodics.foundation/modules/nTest/test/schemaTestGeneratorCrudFixtureInheritance.test.js' },
                { node: 'nodics.foundation/modules/nTest/test/schemaTestGeneratorEffectiveOverrideRemoval.test.js' },
                { tool: ['test:live-tenant-guard'] },
                { tool: ['test:suite-reporter'] },
                { tool: ['test:generated'] }
            ],
            import: [
                { node: 'nodics.foundation/modules/nData/nImport/import/test/systemDataImportInitializerValidation.test.js' },
                { node: 'nodics.foundation/modules/nData/nImport/import/test/importTenantPrecedence.test.js' },
                { node: 'nodics.foundation/modules/nData/nImport/import/test/testTenantImportIsolation.test.js' },
                { node: 'nodics.foundation/modules/nData/nImport/import/test/environmentSampleDataContribution.test.js' },
                { node: 'nodics.foundation/modules/nData/nImport/import/test/mandatoryInitDataImportContract.test.js' },
                { node: 'nodics.foundation/modules/nData/nImport/import/test/importLifecycleContract.test.js' },
                { node: 'nodics.foundation/modules/nData/nImport/import/test/remoteImportTransportGovernance.test.js' },
                { node: 'nodics.foundation/modules/nData/nImport/import/test/remoteImportInitializerContract.test.js' },
                { node: 'nodics.foundation/modules/nData/nImport/import/test/systemCoreSampleDataCatalog.test.js' },
                { node: 'nodics.foundation/modules/nData/nImport/import/test/multiFormatDataProcessors.test.js' },
                { node: 'nodics.foundation/modules/nData/nImport/import/test/profileTenantLocalFileImportContract.test.js' },
                { node: 'nodics.foundation/modules/nData/nImport/import/test/systemImportDiagnosticsValidationOnly.test.js' },
                { node: 'nodics.foundation/modules/nData/nImport/import/test/importRunSummaryContract.test.js' },
                { node: 'nodics.foundation/modules/nData/nImport/import/test/importRunHistoryService.test.js' },
                { node: 'nodics.foundation/modules/nData/nImport/import/test/importGovernanceLifecycleContract.test.js' },
                { node: 'nodics.foundation/modules/nData/nImport/import/test/importRunHistoryControllerRoute.test.js' },
                { node: 'nodics.foundation/modules/nData/nImport/import/test/importDuplicateHeaderDiagnostics.test.js' },
                { node: 'nodics.foundation/modules/nData/nImport/import/test/finalizedRecordCounter.test.js' },
                { node: 'nodics.foundation/modules/nData/nImport/import/test/finalizedImportDispatch.test.js' },
                { node: 'nodics.foundation/modules/nData/nImport/import/test/importTargetDispatchContract.test.js' },
                { node: 'nodics.foundation/modules/nData/nImport/import/test/importRecursiveErrorPropagation.test.js' },
                { node: 'nodics.foundation/modules/nData/nImport/import/test/importDiagnosticsPropagation.test.js' },
                { node: 'nodics.foundation/modules/nData/nImport/import/test/importFileArchivalLifecycle.test.js' },
                { node: 'nodics.foundation/modules/nData/nImport/import/test/importFailureTraceability.test.js' },
                { node: 'nodics.foundation/modules/nData/nImport/import/test/mediaReleaseAssetHydrationContract.test.js' },
                { node: 'nodics.foundation/modules/nData/nImport/import/test/importExportAccessPolicy.test.js' }
            ],
            export: [
                { node: 'nodics.foundation/modules/nData/nExport/export/test/dataExportCapabilityBehavior.test.js' }
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
                { node: 'nodics.platform/modules/backoffice/test/backofficeCapabilityRegistryService.test.js' },
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
                { node: 'nodics.foundation/modules/nService/test/moduleRegistrationAgent.test.js' }
            ],
            cache: [
                { node: 'nodics.foundation/modules/nCache/cache/test/cacheIsolationAndCorrectnessContract.test.js' },
                { node: 'nodics.foundation/modules/nCache/cache/test/cacheMutationSecurityContract.test.js' },
                { node: 'nodics.foundation/modules/nCache/cache/test/cacheDiagnosticsContract.test.js' },
                { node: 'nodics.foundation/modules/nCache/cache/test/cacheBenchmarkContract.test.js' },
                { node: 'nodics.foundation/modules/nCache/cache/test/cachePolicyContract.test.js' },
                { node: 'nodics.foundation/modules/nCache/cache/test/cacheAdapterContract.test.js' },
                { node: 'nodics.foundation/modules/nCache/cache/test/cacheInvalidationContract.test.js' },
                { node: 'nodics.foundation/modules/nCache/redisCache/test/cacheRedisLive.test.js' }
            ],
            'cache-redis-live': [
                { node: 'nodics.foundation/modules/nCache/redisCache/test/cacheRedisLive.test.js' }
            ],
            cronjob: [
                { node: 'nodics.process/modules/cronjob/test/cronJobRouteContract.test.js' },
                { node: 'nodics.process/modules/cronjob/test/cronJobControllerRequestMapping.test.js' },
                { node: 'nodics.process/modules/cronjob/test/cronJobServiceLifecycleContract.test.js' },
                { node: 'nodics.process/modules/cronjob/test/cronJobRuntimeServiceContract.test.js' },
                { node: 'nodics.process/modules/cronjob/test/cronJobEventHandlerContract.test.js' }
            ],
            ems: [
                { node: 'nodics.foundation/modules/nEms/emsClient/test/emsClientRouteContract.test.js' },
                { node: 'nodics.foundation/modules/nEms/emsClient/test/messageTenantResolution.test.js' },
                { node: 'nodics.foundation/modules/nEms/emsClient/test/emsClientServiceContract.test.js' },
                { node: 'nodics.foundation/modules/nEms/emsClient/test/emsMessageProcessContract.test.js' },
                { tool: ['test:capability-behavior', '--area=ems'] }
            ],
            search: [
                { node: 'nodics.foundation/modules/nSearch/search/test/searchRouteContract.test.js' },
                { node: 'nodics.foundation/modules/nSearch/search/test/searchControllerRequestMapping.test.js' },
                { node: 'nodics.foundation/modules/nSearch/search/test/searchServicePipelineContract.test.js' },
                { node: 'nodics.foundation/modules/nSearch/search/test/searchPipelineInitializerContract.test.js' },
                { node: 'nodics.foundation/modules/nSearch/search/test/indexerServiceContract.test.js' },
                { node: 'nodics.foundation/modules/nSearch/search/test/searchCachePolicyContract.test.js' },
                { node: 'nodics.foundation/modules/nSearch/elastic/test/elasticSearchModelOperationContract.test.js' },
                { node: 'nodics.foundation/modules/nSearch/elastic/test/elasticConnectionHandlerContract.test.js' }
            ],
            dynamo: [
                { node: 'nodics.foundation/modules/nDynamo/test/dynamoRouteContract.test.js' },
                { node: 'nodics.foundation/modules/nDynamo/test/classConfigurationControllerRequestMapping.test.js' },
                { node: 'nodics.foundation/modules/nDynamo/test/classConfigurationServiceContract.test.js' },
                { node: 'nodics.foundation/modules/nDynamo/test/dynamoRuntimeAdminSurfaceContract.test.js' },
                { node: 'nodics.foundation/modules/nDynamo/test/runtimeRouterConfigurationService.test.js' },
                { node: 'nodics.foundation/modules/nDynamo/test/routerConfigurationGovernance.test.js' },
                { node: 'nodics.foundation/modules/nDynamo/test/runtimeSchemaPipelineContract.test.js' },
                { node: 'nodics.foundation/modules/nDynamo/test/runtimeConfigurationAuditService.test.js' },
                { node: 'nodics.foundation/modules/nDynamo/test/runtimeConfigurationPreviewService.test.js' },
                { node: 'nodics.foundation/modules/nDynamo/test/runtimeConfigurationActivationPolicyService.test.js' },
                { node: 'nodics.foundation/modules/nDynamo/test/runtimeConfigurationActivationPolicyEnforcement.test.js' },
                { node: 'nodics.foundation/modules/nDynamo/test/runtimeConfigurationActivationRequestService.test.js' },
                { node: 'nodics.foundation/modules/nDynamo/test/runtimeConfigurationActivationAudit.test.js' },
                { node: 'nodics.foundation/modules/nDynamo/test/runtimeConfigurationRollbackService.test.js' },
                { node: 'nodics.foundation/modules/nDynamo/test/runtimePropertyConfigurationGovernance.test.js' },
                { node: 'nodics.foundation/modules/nDynamo/test/runtimeConfigurationGovernanceSummaryService.test.js' },
                { node: 'nodics.foundation/modules/nDynamo/test/runtimeConfigurationGovernanceCleanupService.test.js' },
                { node: 'nodics.foundation/modules/nDynamo/test/governanceReportMaturityMatrix.test.js' },
                { node: 'nodics.foundation/modules/nDynamo/test/schemaAccessPolicyContractService.test.js' },
                { node: 'nodics.foundation/modules/nDynamo/test/schemaAccessPolicyResolverService.test.js' },
                { node: 'nodics.foundation/modules/nDynamo/test/schemaAccessPolicyGovernanceLifecycle.test.js' }
            ],
            workflow: [
                { node: 'nodics.foundation/modules/nbpm/test/coreBootstrapWorkflowBridgeContract.test.js' },
                { node: 'nodics.foundation/modules/nbpm/test/removeWorkflowProcessBehavior.test.js' },
                { node: 'nodics.foundation/modules/nbpm/test/workflowLifecyclePipelineContract.test.js' }
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
                    { tool: ['quality:ownership'] },
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
                    { npmRun: ['quality:ownership'] },
                    { npmRun: ['quality:docs'] },
                    { npmRun: ['test:basic'] }
                ],
                fullSteps: [
                    { npmRun: ['test:full'] }
                ]
            },
            'qualification:security-boundary': {
                description: 'Run framework-owned automated local security boundary contracts.',
                handler: 'src/service/command/defaultNodeScriptCommandService.js',
                script: 'src/service/quality/defaultFrameworkQualificationEvidenceService.js',
                arguments: ['security-boundary']
            },
            'qualification:publishing-capacity': {
                description: 'Run framework-owned bounded publication capacity contracts.',
                handler: 'src/service/command/defaultNodeScriptCommandService.js',
                script: 'src/service/quality/defaultFrameworkQualificationEvidenceService.js',
                arguments: ['publishing-capacity']
            },
            'qualification:publishing-soak': {
                description: 'Run framework-owned sustained publication reliability contracts.',
                handler: 'src/service/command/defaultNodeScriptCommandService.js',
                script: 'src/service/quality/defaultFrameworkQualificationEvidenceService.js',
                arguments: ['publishing-soak']
            },
            'qualification:publishing-interruption-contracts': {
                description: 'Run framework-owned publication interruption and reconciliation contracts.',
                handler: 'src/service/command/defaultNodeScriptCommandService.js',
                script: 'src/service/quality/defaultFrameworkQualificationEvidenceService.js',
                arguments: ['publishing-interruption-contracts']
            },
            'project:validate': {
                description: 'Validate a generated or reference project contract from nodics.project.json.',
                handler: '@nTooling/project',
                operation: 'validate'
            },
            'project:run': {
                description: 'Run a project-declared command through nodics.project.json without encoding script paths in package aliases.',
                handler: '@nTooling/project',
                operation: 'run'
            },
            'project:topology': {
                description: 'Run a manifest-declared project local topology command from framework-owned tooling.',
                handler: 'src/service/command/defaultNodeScriptCommandService.js',
                script: 'src/service/project/defaultProjectTopologyService.mjs'
            },
            'project:container': {
                description: 'Run a manifest-declared project container environment profile from framework-owned tooling.',
                handler: 'src/service/command/defaultNodeScriptCommandService.js',
                script: 'src/service/project/defaultProjectContainerEnvironmentService.mjs'
            },
            'project:container-resilience': {
                description: 'Run manifest-declared backup, verification, and restore operations for a project container environment.',
                handler: 'src/service/command/defaultNodeScriptCommandService.js',
                script: 'src/service/project/defaultProjectContainerResilienceService.mjs'
            },
            'project:container-qualification': {
                description: 'Run manifest-declared container acceptance, qualification, resilience, and soak evidence.',
                handler: 'src/service/command/defaultNodeScriptCommandService.js',
                script: 'src/service/project/defaultProjectContainerQualificationService.mjs'
            },
            'project:documentation-content': {
                description: 'Generate or validate project documentation content packs from project-owned documentation facts.',
                handler: 'src/service/command/defaultNodeScriptCommandService.js',
                script: 'src/service/project/defaultProjectDocumentationContentService.mjs'
            },
            'project:data-manifests': {
                description: 'Generate project data-pack manifests from project-owned domain and pack facts.',
                handler: 'src/service/command/defaultNodeScriptCommandService.js',
                script: 'src/service/project/defaultProjectDataManifestService.mjs'
            },
            'project:functional-journey-acceptance': {
                description: 'Run project functional journey acceptance using project manifest facts and framework-owned orchestration.',
                handler: 'src/service/command/defaultNodeScriptCommandService.js',
                script: 'src/service/project/defaultProjectFunctionalJourneyAcceptanceService.mjs'
            },
            'project:capability-registry-acceptance': {
                description: 'Run project capability registry acceptance using project manifest facts and framework-owned assertions.',
                handler: 'src/service/command/defaultNodeScriptCommandService.js',
                script: 'src/service/project/defaultProjectCapabilityRegistryAcceptanceService.mjs'
            },
            'project:guided-initialization-acceptance': {
                description: 'Run project guided initialization acceptance using project manifest facts and framework-owned assertions.',
                handler: 'src/service/command/defaultNodeScriptCommandService.js',
                script: 'src/service/project/defaultProjectGuidedInitializationAcceptanceService.mjs'
            },
            'project:deployment-qualification': {
                description: 'Create or execute project deployment qualification evidence from framework-owned qualification orchestration.',
                handler: 'src/service/command/defaultNodeScriptCommandService.js',
                script: 'src/service/project/defaultProjectDeploymentQualificationService.mjs'
            },
            'project:configure-framework': {
                description: 'Validate project framework-root wiring without creating project-local framework links.',
                handler: 'src/service/command/defaultNodeScriptCommandService.js',
                script: 'src/service/project/defaultProjectFrameworkLinkService.js'
            },
            'project:runtime-start': {
                description: 'Start a project-declared Nodics runtime server using framework-owned startup mechanics.',
                handler: 'src/service/command/defaultNodeScriptCommandService.js',
                script: 'src/service/project/defaultProjectRuntimeStartService.js'
            },
            'project:local-bootstrap-acceptance': {
                description: 'Run project local bootstrap acceptance using framework-owned orchestration and project facts.',
                handler: 'src/service/command/defaultNodeScriptCommandService.js',
                script: 'src/service/project/defaultProjectLocalBootstrapAcceptanceService.mjs'
            },
            'project:agora-commerce-acceptance': {
                description: 'Run project Agora commerce customer journey acceptance through framework-owned tooling.',
                handler: 'src/service/command/defaultNodeScriptCommandService.js',
                script: 'src/service/project/defaultProjectAgoraCommerceAcceptanceService.mjs'
            },
            'project:agora-commerce-data-acceptance': {
                description: 'Run project Agora commerce staged data acceptance through framework-owned tooling.',
                handler: 'src/service/command/defaultNodeScriptCommandService.js',
                script: 'src/service/project/defaultProjectAgoraCommerceDataAcceptanceService.mjs'
            },
            'project:agora-commerce-publication-acceptance': {
                description: 'Run project Agora commerce staged-to-online publication acceptance through framework-owned tooling.',
                handler: 'src/service/command/defaultNodeScriptCommandService.js',
                script: 'src/service/project/defaultProjectAgoraCommercePublicationAcceptanceService.mjs'
            },
            'project:agora-commerce-live-qualification': {
                description: 'Run the project Agora commerce live qualification chain through framework-owned tooling.',
                handler: 'src/service/command/defaultNodeScriptCommandService.js',
                script: 'src/service/project/defaultProjectAgoraCommerceLiveQualificationService.mjs'
            },
            'project:agora-cms-media-seed': {
                description: 'Seed project Agora CMS and product media assets into WCMS Staged through media-owned upload APIs.',
                handler: 'src/service/command/defaultNodeScriptCommandService.js',
                script: 'src/service/project/defaultProjectAgoraCmsMediaSeedService.mjs'
            },
            'project:nexus-cms-media-seed': {
                description: 'Seed project Nexus CMS, Editorial, and testimonial media assets into WCMS Staged through media-owned upload APIs.',
                handler: 'src/service/command/defaultNodeScriptCommandService.js',
                script: 'src/service/project/defaultProjectNexusCmsMediaSeedService.mjs'
            },
            'project:editorial-live-journey-acceptance': {
                description: 'Run project editorial live journey acceptance through framework-owned tooling.',
                handler: 'src/service/command/defaultNodeScriptCommandService.js',
                script: 'src/service/project/defaultProjectEditorialLiveJourneyAcceptanceService.mjs'
            },
            'test:suite': {
                description: 'Run a configured Nodics test suite by name from tooling-owned suite configuration.',
                handler: 'src/service/command/defaultTestSuiteCommandService.js'
            },
            'check:syntax': {
                description: 'Run Node syntax validation over JavaScript-family source files without executing Nodics runtime code.',
                handler: 'src/service/command/defaultNodeScriptCommandService.js',
                script: 'src/service/quality/defaultSyntaxCheckQualityService.js'
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
            'quality:ownership': {
                description: 'Validate Nodics ownership language so consumer projects and frontend renderers do not claim framework-owned contracts.',
                handler: 'src/service/command/defaultNodeScriptCommandService.js',
                script: 'src/service/quality/defaultOwnershipLanguageQualityService.js'
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
            'builder:discover': {
                description: 'Discover a deterministic read-only Application Builder capability catalogue from explicit repository roots.',
                handler: '@nTooling/application-builder',
                operation: 'discover',
                catalogueService: 'defaultApplicationBuilderCatalogueService'
            },
            'builder:guide': {
                description: 'Convert beginner-facing answers into a governed Builder solution, approval-required plan, and optional review workspace.',
                handler: '@nTooling/application-builder',
                operation: 'guide',
                catalogueService: 'defaultApplicationBuilderCatalogueService',
                guidedService: 'defaultApplicationBuilderGuidedService'
            },
            'builder:answers-template': {
                description: 'Create a valid beginner guided answers document from simple flags and optionally include a dry-run result.',
                handler: '@nTooling/application-builder',
                operation: 'answers-template',
                catalogueService: 'defaultApplicationBuilderCatalogueService',
                guidedService: 'defaultApplicationBuilderGuidedService'
            },
            'builder:questionnaire': {
                description: 'Ask beginner Builder questions one at a time, create guided answers, and optionally include a dry-run result.',
                handler: '@nTooling/application-builder',
                operation: 'questionnaire',
                catalogueService: 'defaultApplicationBuilderCatalogueService',
                guidedService: 'defaultApplicationBuilderGuidedService'
            },
            'builder:dry-run': {
                description: 'Show a beginner-readable Application Builder plan from guided answers without writing review or application files.',
                handler: '@nTooling/application-builder',
                operation: 'dry-run',
                catalogueService: 'defaultApplicationBuilderCatalogueService',
                guidedService: 'defaultApplicationBuilderGuidedService'
            },
            'builder:validate': {
                description: 'Validate an Application Builder solution against structural, dependency, topology, frontend, and data-pack contracts.',
                handler: '@nTooling/application-builder',
                operation: 'validate',
                catalogueService: 'defaultApplicationBuilderCatalogueService',
                planningService: 'defaultApplicationBuilderPlanningService'
            },
            'builder:plan': {
                description: 'Emit an immutable approval-required Application Builder generation plan without writing customer application files.',
                handler: '@nTooling/application-builder',
                operation: 'plan',
                catalogueService: 'defaultApplicationBuilderCatalogueService',
                planningService: 'defaultApplicationBuilderPlanningService'
            },
            'builder:approve': {
                description: 'Bind an explicit approval reference to an unexpired immutable Application Builder plan.',
                handler: '@nTooling/application-builder',
                operation: 'approve',
                catalogueService: 'defaultApplicationBuilderCatalogueService',
                generationService: 'defaultApplicationBuilderGenerationService'
            },
            'builder:generate': {
                description: 'Generate a minimal customer application from an approved plan into an explicit absent absolute output root.',
                handler: '@nTooling/application-builder',
                operation: 'generate',
                catalogueService: 'defaultApplicationBuilderCatalogueService',
                generationService: 'defaultApplicationBuilderGenerationService'
            },
            'builder:qualify': {
                description: 'Qualify a generated Builder output through governed evidence gates and update its solution lock.',
                handler: '@nTooling/application-builder',
                operation: 'qualify',
                catalogueService: 'defaultApplicationBuilderCatalogueService',
                qualificationService: 'defaultApplicationBuilderQualificationService'
            },
            'builder:release-manifest': {
                description: 'Create a digest-bound local Builder release manifest from an approved target plan.',
                handler: '@nTooling/application-builder',
                operation: 'release-manifest',
                catalogueService: 'defaultApplicationBuilderCatalogueService',
                upgradeService: 'defaultApplicationBuilderUpgradeService'
            },
            'builder:upgrade-plan': {
                description: 'Compare a current generated solution lock with a target Builder release and emit a non-mutating upgrade plan.',
                handler: '@nTooling/application-builder',
                operation: 'upgrade-plan',
                catalogueService: 'defaultApplicationBuilderCatalogueService',
                upgradeService: 'defaultApplicationBuilderUpgradeService'
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
