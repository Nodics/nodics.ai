/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
const assert = require('node:assert/strict'); const test = require('node:test');
const catalogSchemas = require('../src/schemas/schemas').telcoCatalog; const validation = require('../src/service/defaultTelcoCatalogValidationService');
const subscriptionSchemas = require('../../telcoSubscription/src/schemas/schemas').telcoSubscription; const subscription = require('../../telcoSubscription/src/service/defaultTelcoSubscriptionService');
const provisioningSchemas = require('../../telcoProvisioning/src/schemas/schemas').telcoProvisioning; const provisioning = require('../../telcoProvisioning/src/service/defaultTelcoProvisioningService');
test('Telco composes plans subscriptions and provisioning without duplicating Electronics devices', () => { assert.deepEqual(Object.keys(catalogSchemas), ['telcoPlanOffering', 'telcoAllowance']); assert.deepEqual(Object.keys(subscriptionSchemas), ['telcoSubscription', 'telcoNumberIntent']); assert.deepEqual(Object.keys(provisioningSchemas), ['telcoServiceOrder']); assert.equal(catalogSchemas.electronicsDevice, undefined); });
test('Telco validates prepaid and postpaid catalog rules', () => { let allowances = [{ code: 'data20' }]; assert.equal(validation.validate({ productCode: 'plan', planType: 'POSTPAID', billingCycle: 'MONTHLY', simTypes: ['ESIM'], allowanceCodes: ['data20'] }, allowances).valid, true); assert.equal(validation.validate({ productCode: 'plan', planType: 'POSTPAID', simTypes: ['SIM'], allowanceCodes: ['missing'] }, allowances).valid, false); });
test('Telco governs subscription transitions and number intents', () => { assert.equal(subscription.canTransition('PENDING_ACTIVATION', 'ACTIVE'), true); assert.equal(subscription.canTransition('CANCELLED', 'ACTIVE'), false); assert.equal(subscription.validateNumberIntent({ intentType: 'PORT_IN', portabilityEvidence: { verified: true } }).valid, true); });
test('Telco provisioning is tenant-scoped and idempotent', () => { let request = { tenant: 'default', subscriptionCode: 'sub1', orderCode: 'order1', idempotencyKey: 'activate1' }; let first = provisioning.create(request, []); let replay = provisioning.create(request, [first.serviceOrder]); assert.equal(first.replayed, false); assert.equal(replay.replayed, true); assert.equal(replay.serviceOrder.status, 'PENDING'); });
