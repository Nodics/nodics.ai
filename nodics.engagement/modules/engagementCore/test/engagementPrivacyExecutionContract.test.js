/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
const assert = require('assert');
const service = require('../src/service/defaultEngagementPrivacyService');
const record = { tenant: 't1', code: 'F1', ownerId: 'u1', message: 'private', subject: 'keep', attachmentCodes: ['m1'], revision: 2, legalHold: false };
const command = { purpose: 'customer request', actorId: 'privacy1', domainType: 'FEEDBACK', correlationId: 'corr1', fields: ['code', 'subject', 'message'] };
let exported = service.exportRecord(record, command, ['code', 'subject']); assert.deepStrictEqual(exported.data, { code: 'F1', subject: 'keep' }); assert.strictEqual(exported.checksum.length, 64);
let result = service.anonymize(record, command, { redactFields: ['message'], clearArrayFields: ['attachmentCodes'] }); assert.strictEqual(result.record.message, '[ANONYMIZED]'); assert.deepStrictEqual(result.record.attachmentCodes, []); assert.strictEqual(result.record.revision, 3);
let held = service.anonymize(Object.assign({}, record, { legalHold: true }), command, {}); assert.strictEqual(held.status, 'DENIED_LEGAL_HOLD'); assert.strictEqual(held.changed, false);
let evidence = service.evidence(record, 'ANONYMIZE', command, result); assert.strictEqual(evidence.status, 'COMPLETED'); assert.strictEqual(evidence.result.revision, 3);
console.log('Engagement privacy export, anonymization, and legal-hold contract validated');
