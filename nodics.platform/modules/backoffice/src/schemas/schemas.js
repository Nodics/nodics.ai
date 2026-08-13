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
        backofficeFunctionalModuleRegistration: {
            super: 'base',
            schemaPolicies: ['contractReader'],
            model: true,
            service: { enabled: true },
            event: { enabled: false },
            router: { enabled: false },
            tenants: ['default'],
            definition: {
                projectCode: { type: 'string', required: true, description: 'Stable customer project identity' },
                functionalModule: { type: 'string', required: true, description: 'Canonical functional-module identity' },
                displayName: { type: 'string', required: true, description: 'Business-facing functional-module name' },
                registeredVersion: { type: 'string', required: true, description: 'Last reconciled standard functional-module version' },
                registrationState: { type: 'string', required: true, description: 'Durable AVAILABLE, REGISTERED, or DEREGISTERED project decision' },
                enabled: { type: 'bool', required: true, default: true, description: 'Whether Axis may present the functional module' },
                required: { type: 'bool', required: true, default: false, description: 'Whether the project protects this functional module from disablement or deregistration' },
                runtimeState: { type: 'string', required: true, description: 'Observed ACTIVE, OFFLINE, DEGRADED, or INCOMPATIBLE state' },
                technicalModules: { type: 'array', required: true, description: 'Effective runtime descendants aggregated beneath the functional module' },
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
        backofficeContractSnapshot: {
            super: 'base',
            schemaPolicies: ['contractReader'],
            model: true,
            service: { enabled: true },
            event: { enabled: false },
            router: { enabled: false },
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
            router: { enabled: false },
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
            router: { enabled: false },
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
