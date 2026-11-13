/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module backoffice/src/schemas/schemas
 * @description Schema definition registry for this boundary.
 * @layer definition
 * @owner backoffice
 * @override Later active modules may extend or replace this registry through Nodics layering.
 */
module.exports = {
    backoffice: {
        backofficeRepairReceipt: {
            super: 'base', schemaPolicies: ['administrator'], model: true,
            isVersionedEnabled: false, cache: { enabled: false },
            transaction: { enabled: true, sideEffects: 'none' },
            backoffice: { concurrency: { managed: true, field: 'revision' } },
            service: { enabled: true }, event: { enabled: false }, router: { enabled: false },
            definition: {
                scopeKey: { type: 'string', required: true },
                revision: { type: 'int', required: true, default: 1 },
                targetKey: { type: 'string', required: true },
                requestHash: { type: 'string', required: true },
                idempotencyKey: { type: 'string', required: true },
                requestedBy: { type: 'string', required: true },
                ownerModule: { type: 'string', required: true },
                operation: { type: 'string', required: true },
                action: { type: 'string', required: true },
                targetIdentifiers: { type: 'object', required: true },
                status: { type: 'string', required: true, description: 'READY, RUNNING, UNCERTAIN or COMPLETED; no expiry takeover' },
                result: { type: 'object' },
                createdAt: { type: 'date', required: true },
                updatedAt: { type: 'date', required: true },
                buildIdentity: { type: 'object', required: true }
            },
            indexes: { individual: {
                repairReceiptCode: { name: 'code', enabled: true, options: { unique: true } },
                repairReceiptScope: { name: 'scopeKey', enabled: true, options: { unique: false } }
            } }
        },
        backofficeRepairTarget: {
            super: 'base', schemaPolicies: ['administrator'], model: true,
            isVersionedEnabled: false, cache: { enabled: false },
            transaction: { enabled: true, sideEffects: 'none' },
            backoffice: { concurrency: { managed: true, field: 'revision' } },
            service: { enabled: true }, event: { enabled: false }, router: { enabled: false },
            definition: {
                scopeKey: { type: 'string', required: true },
                revision: { type: 'int', required: true, default: 1 },
                executionCode: { type: 'string', description: 'Exact durable execution holding this target, empty only after verified completion' },
                updatedAt: { type: 'date', required: true }
            },
            indexes: { individual: {
                repairTargetCode: { name: 'code', enabled: true, options: { unique: true } }
            } }
        },
        backofficeReadinessSnapshot: {
            super: 'base', schemaPolicies: ['administrator'], model: true,
            service: { enabled: true }, event: { enabled: false }, router: { enabled: false },
            definition: {
                scopeKey: { type: 'string', required: true, description: 'Hash of tenant, deployment and authenticated observer authority' },
                observedAt: { type: 'date', required: true },
                expiresAt: { type: 'date', required: true },
                snapshot: { type: 'object', required: true, description: 'Bounded owner-derived historical observation; never execution authority' }
            },
            indexes: { individual: {
                readinessSnapshotCode: { name: 'code', enabled: true, options: { unique: true } },
                readinessSnapshotScope: { name: 'scopeKey', enabled: true, options: { unique: false } },
                readinessSnapshotExpiry: { name: 'expiresAt', enabled: true, options: { expireAfterSeconds: 0 } }
            } }
        },
        backofficeStartupAcknowledgement: {
            super: 'base', schemaPolicies: ['administrator'], model: true,
            service: { enabled: true }, event: { enabled: false }, router: { enabled: false },
            definition: {
                scopeKey: { type: 'string', required: true, description: 'Tenant and deployment observation scope' },
                findingCode: { type: 'string', required: true },
                findingIdentity: { type: 'string', required: true, description: 'Non-secret rule, deployment and validated build binding' },
                propertyPath: { type: 'string' },
                acknowledgedAt: { type: 'date', required: true },
                acknowledgedBy: { type: 'string', required: true },
                reasonCode: { type: 'string', required: true },
                reason: { type: 'string', required: true },
                expiresAt: { type: 'date', required: true },
                buildIdentity: { type: 'object', required: true }
            },
            indexes: { individual: {
                startupAcknowledgementCode: { name: 'code', enabled: true, options: { unique: true } },
                startupAcknowledgementScope: { name: 'scopeKey', enabled: true, options: { unique: false } },
                startupAcknowledgementExpiry: { name: 'expiresAt', enabled: true, options: { expireAfterSeconds: 0 } }
            } }
        },
        backofficeFunctionalModuleRegistration: {
            super: 'base',
            schemaPolicies: ['contractReader'],
            model: true,
            service: { enabled: true },
            event: { enabled: false },
            router: { groups: { schemaOperations: true }, enabled: true },
            tenants: ['default'],
            definition: {
                projectCode: { type: 'string', required: true, description: 'Stable customer project identity' },
                functionalModule: { type: 'string', required: true, description: 'Canonical functional-module identity' },
                displayName: { type: 'string', required: true, description: 'Business-facing functional-module name' },
                registeredVersion: { type: 'string', required: true, description: 'Last reconciled standard functional-module version' },
                moduleIndex: { type: 'string', required: false, description: 'Runtime package index used for stable module ordering' },
                registrationState: { type: 'string', required: true, description: 'Durable AVAILABLE, REGISTERED, or DEREGISTERED project decision' },
                compositionOnly: { type: 'boolean', description: 'Observed group no longer declares a business activation identity; historical record only' },
                enabled: { type: 'bool', required: true, default: true, description: 'Whether Axis may present the functional module' },
                required: { type: 'bool', required: true, default: false, description: 'Whether the project protects this functional module from disablement or deregistration' },
                runtimeState: { type: 'string', required: true, description: 'Observed ACTIVE, OFFLINE, DEGRADED, or INCOMPATIBLE state' },
                technicalModules: { type: 'array', required: true, description: 'Effective runtime descendants aggregated beneath the functional module' },
                activationDataPackages: { type: 'array', required: false, description: 'Module-owned nImport data-release packages required or offered during activation' },
                observedServers: { type: 'array', required: true, description: 'Stable environment/server/node coordinates currently serving the functional module' },
                catalogueRevision: { type: 'int', required: true, default: 1, description: 'Optimistic durable catalogue revision' },
                registeredAt: { type: 'date', required: true, description: 'First governed project registration time' },
                registeredBy: { type: 'string', required: true, description: 'Principal or runtime reconciler that created the registration' },
                updatedAt: { type: 'date', required: true, description: 'Last durable reconciliation or administrative update time' },
                updatedBy: { type: 'string', required: true, description: 'Principal or runtime reconciler that last changed the record' },
                lastObservedAt: { type: 'date', required: true, description: 'Last successful runtime observation time' }
            },
            indexes: {
                individual: {
                    functionalRegistrationCode: { name: 'code', enabled: true, options: { unique: true } },
                    functionalRegistrationProject: { name: 'projectCode', enabled: true, options: { unique: false } },
                    functionalRegistrationIdentity: { name: 'functionalModule', enabled: true, options: { unique: false } }
                }
            }
        },
        backofficeFunctionalModuleActivationReceipt: {
            super: 'base',
            schemaPolicies: ['contractReader'],
            model: true,
            service: { enabled: true },
            event: { enabled: false },
            router: { groups: { schemaOperations: true }, enabled: true },
            tenants: ['default'],
            definition: {
                projectCode: { type: 'string', required: true, description: 'Stable customer project identity' },
                functionalModule: { type: 'string', required: true, description: 'Canonical functional-module identity' },
                packageCode: { type: 'string', required: true, description: 'Activation data package or data-release code' },
                classification: { type: 'string', required: true, description: 'Business classification such as core, init, runtime-default, or sample' },
                owner: { type: 'string', required: true, description: 'Functional or technical owner of the data package' },
                required: { type: 'bool', required: true, default: true, description: 'Whether activation requires this package to be imported' },
                trigger: { type: 'string', required: true, description: 'ACTIVATION or USER trigger ownership' },
                targetModule: { type: 'string', required: false, description: 'Business target module for operator visibility' },
                targetServer: { type: 'string', required: false, description: 'Runtime target server for operator visibility' },
                targetDatabase: { type: 'string', required: false, description: 'Runtime target database for operator visibility' },
                operation: { type: 'string', required: true, description: 'Declared import operation family' },
                dataType: { type: 'string', required: true, description: 'nImport data release type: init, core, or sample' },
                status: { type: 'string', required: true, description: 'PLANNED, QUEUED, RUNNING, PENDING_IMPORT, WAITING_APPROVAL, IMPORTED, COMPLETED, RETRYABLE, FAILED, SKIPPED_USER_TRIGGERED, or DATA_LEFT_INTACT' },
                executionMode: { type: 'string', required: true, description: 'Executor used for the receipt, such as NIMPORT_RELEASE or USER_TRIGGERED' },
                message: { type: 'string', required: false, description: 'Bounded operator-facing receipt message' },
                importRunId: { type: 'string', required: false, description: 'nImport run id when one was created' },
                releaseStatus: { type: 'string', required: false, description: 'Data release status returned by nImport' },
                revision: { type: 'int', required: true, default: 1, description: 'Optimistic receipt revision' },
                lastAttemptAt: { type: 'date', required: true, description: 'Last import attempt or receipt update time' },
                updatedAt: { type: 'date', required: true, description: 'Last durable receipt update time' },
                updatedBy: { type: 'string', required: true, description: 'Principal or service that updated the receipt' },
                correlationId: { type: 'string', required: false, description: 'Lifecycle request correlation id' }
            },
            indexes: {
                individual: {
                    activationReceiptCode: { name: 'code', enabled: true, options: { unique: true } },
                    activationReceiptProject: { name: 'projectCode', enabled: true, options: { unique: false } },
                    activationReceiptFunctionalModule: { name: 'functionalModule', enabled: true, options: { unique: false } },
                    activationReceiptStatus: { name: 'status', enabled: true, options: { unique: false } }
                }
            }
        },
        backofficeContractSnapshot: {
            super: 'base',
            schemaPolicies: ['contractReader'],
            model: true,
            service: { enabled: true },
            event: { enabled: false },
            router: { groups: { schemaOperations: true }, enabled: true },
            tenants: ['default'],
            definition: {
                moduleName: { type: 'string', required: true, description: 'Module that owns the observed source contract' },
                contractType: { type: 'string', required: true, description: 'Observed source contract type' },
                contractVersion: { type: 'int', required: true, description: 'Module-declared contract version' },
                contractHash: { type: 'string', required: true, description: 'SHA-256 hash of the normalized observed contract' },
                operations: { type: 'array', required: true, description: 'Bounded normalized operation observations' },
                schemas: { type: 'array', required: true, description: 'Bounded normalized schema-name observations' },
                state: { type: 'string', required: true, description: 'DISCOVERED, ACTIVE, PENDING_APPROVAL, REJECTED, or SUPERSEDED lifecycle state' },
                changeClassification: { type: 'string', required: true, description: 'Classified impact relative to the active snapshot' },
                revision: { type: 'int', required: true, default: 0, description: 'Optimistic-concurrency revision for snapshot decisions' },
                discoveredAt: { type: 'date', required: true, description: 'Time the normalized observation was discovered' },
                decidedAt: { type: 'date', required: false, description: 'Time an administrator approved or rejected the candidate' },
                decidedBy: { type: 'string', required: false, description: 'Authenticated principal that made the decision' },
                decisionReason: { type: 'string', required: false, description: 'Bounded administrator decision reason' },
                sourceInstanceId: { type: 'string', required: false, description: 'Observed runtime instance without credentials or topology secrets' }
            },
            indexes: {
                individual: {
                    snapshotHash: { name: 'contractHash', enabled: true, options: { unique: false } },
                    snapshotModule: { name: 'moduleName', enabled: true, options: { unique: false } },
                    snapshotState: { name: 'state', enabled: true, options: { unique: false } }
                }
            }
        },
        backofficeContractActivation: {
            super: 'base',
            schemaPolicies: ['contractReader'],
            model: true,
            service: { enabled: true },
            event: { enabled: false },
            router: { groups: { schemaOperations: true }, enabled: true },
            tenants: ['default'],
            definition: {
                moduleName: { type: 'string', required: true, description: 'Module whose active observed contract is selected' },
                activeHash: { type: 'string', required: true, description: 'Hash of the active normalized snapshot' },
                previousHash: { type: 'string', required: false, description: 'Previously active hash retained for audit and rollback context' },
                revision: { type: 'int', required: true, default: 0, description: 'Compare-and-set revision used across BackOffice replicas' },
                activatedAt: { type: 'date', required: true, description: 'Time this active selection was written' },
                activatedBy: { type: 'string', required: false, description: 'Authenticated principal or discovery agent that selected the snapshot' },
                activationReason: { type: 'string', required: false, description: 'Bounded activation or rollback reason' }
            },
            indexes: {
                individual: {
                    activationModule: { name: 'moduleName', enabled: true, options: { unique: true } }
                }
            }
        },
        backofficeAxisPolicy: {
            super: 'base',
            schemaPolicies: ['administrator'],
            model: true,
            service: { enabled: true },
            event: { enabled: false },
            router: { groups: { schemaOperations: true }, enabled: true },
            definition: {
                contractVersion: { type: 'int', required: true, default: 1, description: 'Version of the client-safe Axis policy contract' },
                screenLockEnabled: { type: 'bool', required: true, default: true, description: 'Whether authenticated Axis sessions lock after inactivity' },
                idleTimeoutSeconds: { type: 'int', required: true, default: 900, description: 'Inactivity duration in seconds before Axis enters lock mode' },
                recentNavigationLimit: { type: 'int', required: true, default: 12, description: 'Maximum number of recent Axis navigation entries shown in the shell component' },
                revision: { type: 'int', required: true, default: 1, description: 'Optimistic-concurrency revision for operator updates' },
                updatedAt: { type: 'date', required: true, description: 'Time the effective persistent policy was last changed' },
                updatedBy: { type: 'string', required: true, description: 'Authenticated employee that changed the policy' }
            }
        }
    }
};

// Model-purpose presentation belongs to this schema owner; it grants no operations.
module.exports.backoffice.backofficeFunctionalModuleRegistration.backoffice = Object.assign({ description: "Registered functional-module presentation and activation policy for Axis. Registration does not install or start a runtime module." }, module.exports.backoffice.backofficeFunctionalModuleRegistration.backoffice);
module.exports.backoffice.backofficeFunctionalModuleActivationReceipt.backoffice = Object.assign({ description: "Retained functional-module activation outcomes. Use Module Registry commands for lifecycle changes." }, module.exports.backoffice.backofficeFunctionalModuleActivationReceipt.backoffice);
module.exports.backoffice.backofficeContractSnapshot.backoffice = Object.assign({ description: "Observed module API and capability contract snapshots used for compatibility review." }, module.exports.backoffice.backofficeContractSnapshot.backoffice);
module.exports.backoffice.backofficeContractActivation.backoffice = Object.assign({ description: "Reviewed module-contract activation state. Use contract governance commands to activate a snapshot." }, module.exports.backoffice.backofficeContractActivation.backoffice);
module.exports.backoffice.backofficeAxisPolicy.backoffice = Object.assign({ description: "Axis session and workspace policy records. Effective policy remains subject to BackOffice validation and permissions." }, module.exports.backoffice.backofficeAxisPolicy.backoffice);
