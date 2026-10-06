/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @file Exercises Waste delegation through isolated action persistence; no live collection points are written. */
'use strict';
const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const centre = require('../src/service/defaultCopilotCollectionCentreActionService');
const execution = require('../src/service/defaultCopilotActionExecutionService');
const core = require('../../copilotCore/src/service/defaultCopilotOrchestrationService');
const policy = require('../../copilotPolicy/src/service/defaultCopilotPolicyService');
let request, configuration, action, commands;
beforeEach(() => {
    configuration = {
        api: { enabled: true },
        core: {},
        conversation: {},
        workbench: {
            ...require('../config/properties').copilot.workbench,
            collectionCentreTarget: {
                enabled: true,
                moduleName: 'wasteCollection',
                connectionName: 'waste-owner',
            },
        },
    };
    request = {
        tenant: 'tenant',
        authData: {
            loginId: 'employee',
            enterpriseCode: 'ACME',
            permissions: [
                'copilot.mutation.prepare',
                'copilot.mutation.execute',
            ],
        },
        httpRequest: { headers: { authorization: 'Bearer employee' } },
        body: {
            operation: 'waste.collectionCentre.create',
            centres: [
                {
                    code: 'CENTRE_ONE',
                    name: { en: 'Collection centre' },
                    collectionPointType: 'COLLECTION_CENTRE',
                    locationRef: {
                        module: 'locationCore',
                        schema: 'location',
                        code: 'LOCATION_ONE',
                    },
                    operatorEnterpriseRef: {
                        module: 'profile',
                        schema: 'enterprise',
                        code: 'ACME',
                    },
                    operatingStatus: 'ACTIVE',
                    publicVisibility: 'BACKOFFICE',
                    status: 'DRAFT',
                },
            ],
        },
    };
    commands = [];
    action = undefined;
    global.CONFIG = { get: () => configuration };
    global.CLASSES = {
        NodicsError: class extends Error {
            constructor(code) {
                super(code);
                this.code = code;
            }
        },
    };
    global.SERVICE = {
        DefaultCopilotPolicyService: policy,
        DefaultCopilotOrchestrationService: core,
        DefaultCopilotCollectionCentreActionService: centre,
        DefaultCopilotActionExecutionService: execution,
        DefaultCopilotWorkbenchService: require('../src/service/defaultCopilotWorkbenchService'),
        DefaultCopilotActionService: {
            save: async (r) => {
                action = structuredClone(r.model);
                return { code: 'SUC_TEST', result: structuredClone(action) };
            },
            get: async () => ({
                code: 'SUC_TEST',
                result: action ? [structuredClone(action)] : [],
            }),
            update: async (r) => {
                const matches =
                    action.state === r.query.state &&
                    action.audit.revision === r.query['audit.revision'];
                if (matches) Object.assign(action, structuredClone(r.model));
                return {
                    code: 'SUC_TEST',
                    result: { matchedCount: matches ? 1 : 0 },
                };
            },
        },
        DefaultModuleService: {
            invokeModule: async (r) => {
                commands.push(r);
                return { code: 'SUC_WASTE', result: { ...r.request } };
            },
        },
    };
});
/** Uses the actual prepare and explicit approval path. @returns {Promise<Object>} Prepared confirmation. */
async function approve() {
    const prepared = await core.prepareCollectionCentrePlan(request);
    request.confirmationCode = prepared.actionCode;
    request.expectedRevision = prepared.confirmation.revision;
    request.argumentsDigest = prepared.confirmation.argumentsDigest;
    const approved = await core.approveConfirmation(request);
    request.expectedRevision = approved.confirmation.revision;
    return prepared;
}
test('full nested review precedes one-attempt Waste execution with employee identity', async () => {
    const prepared = await approve();
    assert.equal(commands.length, 0);
    const fields = Object.fromEntries(
        prepared.preview.review[0].fields.map((field) => [
            field.label,
            field.value,
        ]),
    );
    assert.equal(fields['Location module'], 'locationCore');
    assert.equal(fields['Operator enterprise'], 'ACME');
    assert.equal(fields['Name (en)'], 'Collection centre');
    assert.equal(fields.Revision, '0');
    const result = await core.executeConfirmation(request);
    assert.equal(result.state, 'CONSUMED');
    assert.equal(result.result.operationsCompleted, 1);
    assert.equal(commands[0].moduleName, 'wasteCollection');
    assert.equal(commands[0].apiName, '/wastecollectionpoint');
    assert.equal(commands[0].methodName, 'PUT');
    assert.equal(commands[0].local, false);
    assert.equal(commands[0].maxAttempts, 1);
    assert.equal(commands[0].header.Authorization, 'Bearer employee');
    assert.equal(commands[0].header['x-enterprise-code'], 'ACME');
    await assert.rejects(core.executeConfirmation(request));
    assert.equal(commands.length, 1);
});
test('missing fields clarify and malformed, foreign, duplicate or oversized records cannot prepare', async () => {
    const missing = await centre.prepare(
        {
            ...request,
            body: { operation: request.body.operation, centres: [{}] },
        },
        configuration,
    );
    assert.ok(missing.plan.missing.includes('centres.0.locationRef'));
    assert.equal(action, undefined);
    for (const patch of [
        {
            operatorEnterpriseRef: {
                module: 'profile',
                schema: 'enterprise',
                code: 'OTHER',
            },
        },
        {
            locationRef: {
                module: 'profile',
                schema: 'enterprise',
                code: 'LOCATION_ONE',
            },
        },
        { name: { en: '<'.repeat(257) } },
        { active: true },
        { revision: 9 },
        { status: 'BROKEN' },
    ])
        assert.throws(() =>
            centre.input(
                {
                    ...request.body,
                    centres: [{ ...request.body.centres[0], ...patch }],
                },
                { enterprise: 'ACME' },
            ),
        );
    assert.throws(() =>
        centre.input(
            {
                ...request.body,
                centres: [request.body.centres[0], request.body.centres[0]],
            },
            { enterprise: 'ACME' },
        ),
    );
    assert.throws(() =>
        centre.input(
            {
                ...request.body,
                centres: Array(21).fill(request.body.centres[0]),
            },
            { enterprise: 'ACME' },
        ),
    );
    assert.equal(commands.length, 0);
});
test('missing grants, bearer and disabled target fail before persistence or domain calls', async () => {
    request.authData.permissions = [];
    await assert.rejects(core.prepareCollectionCentrePlan(request));
    request.authData.permissions = ['*'];
    request.httpRequest.headers = {};
    await assert.rejects(core.prepareCollectionCentrePlan(request));
    request.httpRequest.headers.authorization = 'Bearer employee';
    configuration.workbench.collectionCentreTarget.enabled = false;
    await assert.rejects(core.prepareCollectionCentrePlan(request));
    assert.equal(action, undefined);
    assert.equal(commands.length, 0);
});

test('later-layer review labels are used without changing the executed arguments', async () => {
    configuration.workbench.collectionCentreReview = structuredClone(
        configuration.workbench.collectionCentreReview,
    );
    configuration.workbench.collectionCentreReview.fields[
        'operatorEnterpriseRef.code'
    ] = 'Operating organization';
    const prepared = await core.prepareCollectionCentrePlan(request);
    assert.equal(
        prepared.preview.review[0].fields.find(
            (field) => field.label === 'Operating organization',
        ).value,
        'ACME',
    );
    assert.equal(
        action.audit.plan.records[0].operatorEnterpriseRef.code,
        'ACME',
    );
});
test('target drift, reference tampering and stale revisions never reach Waste', async () => {
    await approve();
    configuration.workbench.collectionCentreTarget.connectionName = 'other';
    await assert.rejects(core.executeConfirmation(request));
    configuration.workbench.collectionCentreTarget.connectionName =
        'waste-owner';
    action.audit.plan.records[0].locationRef.code = 'OTHER';
    await assert.rejects(core.executeConfirmation(request));
    action.audit.plan.records[0].locationRef.code = 'LOCATION_ONE';
    request.expectedRevision--;
    await assert.rejects(core.executeConfirmation(request));
    assert.equal(commands.length, 0);
});
test('lost or contradictory acknowledgement stops subsequent writes and cannot be replayed', async () => {
    request.body.centres.push({
        ...structuredClone(request.body.centres[0]),
        code: 'CENTRE_TWO',
    });
    await approve();
    SERVICE.DefaultModuleService.invokeModule = async (r) => {
        commands.push(r);
        return {
            code: 'SUC_WASTE',
            error: 'conflict',
            result: { code: r.request.code },
        };
    };
    const result = await core.executeConfirmation(request);
    assert.deepEqual(
        result.rows.map((row) => row.state),
        ['OUTCOME_UNKNOWN', 'NOT_STARTED'],
    );
    await assert.rejects(core.executeConfirmation(request));
    assert.equal(commands.length, 1);
});
test('uncertain action save exposes no confirmation and explicit chat routes without a provider', async () => {
    const save = SERVICE.DefaultCopilotActionService.save;
    SERVICE.DefaultCopilotActionService.save = async (r) => ({
        code: 'SUC_TEST',
        result: { ...r.model, audit: {} },
    });
    await assert.rejects(core.prepareCollectionCentrePlan(request));
    SERVICE.DefaultCopilotActionService.save = save;
    request.message = JSON.stringify(request.body);
    const events = [];
    SERVICE.DefaultCopilotConversationService = {
        getOwned: async () => ({ code: 'conversation' }),
        acceptTurn: async () => ({ code: 'turn', state: 'ACCEPTED' }),
        appendEvent: async (_t, kind) => events.push(kind),
        complete: async () => {},
        fail: async () => assert.fail('Unexpected turn failure'),
    };
    const result = await core.performTurn(request);
    assert.equal(result.confirmation.operationId, request.body.operation);
    assert.equal(events[0], 'CONFIRMATION_REQUIRED');
    assert.equal(commands.length, 0);
});
