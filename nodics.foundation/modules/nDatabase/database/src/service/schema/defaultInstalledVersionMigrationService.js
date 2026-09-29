/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module database/service/schema/DefaultInstalledVersionMigrationService
 * @description Coordinates explicitly scoped offline provider migrations through the existing importRun journal.
 * @layer service
 * @owner database
 * @override Later layers may provide qualified provider operations without bypassing outage, immutable plan or durable intent checks.
 */
module.exports = {
    /** Rejects incomplete orchestration dependencies without performing effects. */
    validate: function (context) {
        if (!context || !context.provider || !context.journal || typeof context.assertOffline !== 'function' ||
            !Array.isArray(context.inputs) || context.inputs.length === 0) {
            throw new CLASSES.NodicsError('ERR_DBS_00003', 'Explicit migration provider, journal, outage and model scopes required');
        }
        const identities = context.inputs.map(input => context.journal.canonical(input.scope));
        if (new Set(identities).size !== identities.length) throw new CLASSES.NodicsError('ERR_DBS_00003', 'Duplicate migration scope');
    },

    /** Captures every selected schema before the first migration journal or data write. */
    plan: async function (context) {
        this.validate(context);
        if (await context.assertOffline() !== true) throw new CLASSES.NodicsError('ERR_DBS_00003', 'Verified outage required');
        const schemas = [];
        for (const input of context.inputs) schemas.push(await context.provider.plan({ ...input, assertOffline: context.assertOffline }));
        return { scope: context.scope, contractVersion: 1, schemas };
    },

    /** Executes or resumes one immutable multi-schema plan, persisting each intent before provider effects. */
    execute: async function (context, request) {
        this.validate(context);
        if (!['forward', 'rollback'].includes(request.direction)) {
            throw new CLASSES.NodicsError('ERR_DBS_00003', 'Explicit forward or rollback direction required');
        }
        if (!request.plan || request.plan.contractVersion !== 1 || !Array.isArray(request.plan.schemas) ||
            request.plan.schemas.length !== context.inputs.length ||
            context.journal.canonical(request.plan.scope) !== context.journal.canonical(context.scope)) {
            throw new CLASSES.NodicsError('ERR_DBS_00003', 'Migration plan differs from selected scope');
        }
        if (context.journal.checksum(request.plan) !== request.checksum) {
            throw new CLASSES.NodicsError('ERR_DBS_00003', 'Explicit reviewed plan checksum required');
        }
        if (await context.assertOffline() !== true) throw new CLASSES.NodicsError('ERR_DBS_00003', 'Verified outage required');
        for (let i = 0; i < context.inputs.length; i++) {
            context.provider.validatePlan({ ...context.inputs[i], plan: request.plan.schemas[i] });
        }
        let record;
        if (request.resume === true) {
            record = await context.journal.readMigration(request);
            if (record.migration?.compensation && request.direction !== 'rollback') {
                throw new CLASSES.NodicsError('ERR_DBS_00003', 'Linked compensation can only resume rollback');
            }
            if (!request.recovery || request.recovery.previousWorkerStopped !== true) {
                throw new CLASSES.NodicsError('ERR_DBS_00003', 'Stopped previous worker evidence required');
            }
            record = await context.journal.resumeMigration({ ...request, expectedRevision: record.migrationRevision,
                expectedAttempt: record.migrationAttempt });
        } else if (request.original) {
            if (request.direction !== 'rollback' || typeof context.journal.beginCompensation !== 'function') {
                throw new CLASSES.NodicsError('ERR_DBS_00003', 'Explicit linked rollback capability required');
            }
            const unchanged = [];
            for (let index = 0; index < context.inputs.length; index++) {
                unchanged.push(await context.provider.verify({ ...context.inputs[index], plan: request.plan.schemas[index],
                    assertOffline: context.assertOffline }));
            }
            if (await context.assertOffline() !== true) throw new CLASSES.NodicsError('ERR_DBS_00003', 'Outage lost before compensation');
            record = await context.journal.beginCompensation({ ...request, compensationEvidence: {
                outage: { verifiedAt: new Date().toISOString(), scope: context.scope, operatorControlled: true },
                unchangedTargetState: { schemas: unchanged }
            } });
        } else {
            if (request.direction !== 'forward') throw new CLASSES.NodicsError('ERR_DBS_00003', 'Rollback requires explicit recovery');
            record = await context.journal.beginMigration(request);
        }
        const acknowledgedBatches = new Set();
        const checkpoint = async intent => {
            const plan = request.plan.schemas.find(schema => schema.checksum === intent.checksum &&
                context.journal.canonical(schema.scope) === context.journal.canonical(intent.scope));
            if (!plan || intent.operationId !== context.provider.hash({ checksum: intent.checksum, operation: intent.operation })) {
                throw new CLASSES.NodicsError('ERR_DBS_00003', 'Unplanned migration intent');
            }
            let evidence = intent;
            let checkpointCode = intent.operationId;
            if (['backfill-record', 'restore-record'].includes(intent.operation.kind)) {
                const index = plan.records.findIndex(record => record.id === intent.operation.id);
                if (index < 0) throw new CLASSES.NodicsError('ERR_DBS_00003', 'Unplanned record intent');
                const start = Math.floor(index / plan.limits.pageSize) * plan.limits.pageSize;
                const rollback = intent.operation.kind === 'restore-record';
                const operations = plan.records.slice(start, start + plan.limits.pageSize).map(record =>
                    context.provider.hash({ checksum: plan.checksum, operation: {
                        kind: intent.operation.kind, id: record.id,
                        beforeHash: rollback ? record.afterHash : record.beforeHash,
                        afterHash: rollback ? record.beforeHash : record.afterHash
                    } }));
                if (!operations.includes(intent.operationId)) throw new CLASSES.NodicsError('ERR_DBS_00003', 'Record intent differs from immutable plan');
                evidence = { checksum: plan.checksum, scope: plan.scope, operations, start, kind: intent.operation.kind };
                checkpointCode = context.journal.checksum(evidence);
            }
            if (acknowledgedBatches.has(checkpointCode)) {
                return { durable: true, operationId: intent.operationId, checksum: intent.checksum };
            }
            record = await context.journal.checkpointMigration({ ...request, replay: false,
                expectedRevision: record.migrationRevision, expectedAttempt: record.migrationAttempt,
                checkpoint: { code: checkpointCode, state: 'PREPARED', evidence } });
            acknowledgedBatches.add(checkpointCode);
            return { durable: true, operationId: intent.operationId, checksum: intent.checksum };
        };
        const evidence = [];
        const order = context.inputs.map((input, index) => index);
        if (request.direction === 'rollback') order.reverse();
        for (const index of order) {
            const input = { ...context.inputs[index], plan: request.plan.schemas[index],
                assertOffline: context.assertOffline, checkpoint, direction: request.direction };
            await context.provider.recover(input);
        }
        if (await context.assertOffline() !== true) throw new CLASSES.NodicsError('ERR_DBS_00003', 'Outage lost before final verification');
        for (const index of order) {
            const input = { ...context.inputs[index], plan: request.plan.schemas[index],
                assertOffline: context.assertOffline, checkpoint };
            evidence.push(request.direction === 'rollback' ? await context.provider.rollback(input) : await context.provider.verify(input));
        }
        record = await context.journal.checkpointMigration({ ...request, replay: false,
            expectedRevision: record.migrationRevision, expectedAttempt: record.migrationAttempt,
            status: request.direction === 'rollback' ? 'ROLLED_BACK' : 'COMPLETED',
            checkpoint: { code: 'final-verification', state: 'VERIFIED', evidence: { schemas: evidence } } });
        return { status: record.status, migrationCode: record.code, revision: record.migrationRevision,
            checksum: request.checksum, evidence, writersMayRestart: false };
    }
};
