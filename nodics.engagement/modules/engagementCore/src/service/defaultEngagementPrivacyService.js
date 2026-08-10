/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
const crypto = require('crypto');
/** @module engagementCore/src/service/defaultEngagementPrivacyService @description Builds purpose-bound exports and legal-hold-aware anonymized records while leaving persistence to domain owners. @layer service @owner engagementCore */
module.exports = {
    /** Builds one purpose-bound allow-listed record export. */
    exportRecord: function (record, command, allowedFields) { if (!command.purpose || !command.actorId) throw new Error('privacy purpose and actor are required'); let fields = (command.fields || []).filter(field => (allowedFields || []).includes(field)); if (!fields.length) throw new Error('at least one allowed privacy export field is required'); let data = Object.fromEntries(fields.map(field => [field, record[field]])); return { data: data, fields: fields, checksum: crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex') }; },
    /** Applies legal-hold-aware owner-side anonymization policy. */
    anonymize: function (record, command, policy) { policy = policy || {}; if (!command.purpose || !command.actorId) throw new Error('privacy purpose and actor are required'); if (record.legalHold === true) return { record: record, status: 'DENIED_LEGAL_HOLD', changed: false }; let value = Object.assign({}, record); (policy.removeFields || []).forEach(field => { delete value[field]; }); (policy.redactFields || []).forEach(field => { if (value[field] !== undefined) value[field] = typeof value[field] === 'string' ? '[ANONYMIZED]' : undefined; }); (policy.clearArrayFields || []).forEach(field => { if (value[field] !== undefined) value[field] = []; }); value.ownerId = policy.anonymousOwner || 'ANONYMIZED'; value.anonymizedAt = command.now || new Date(); value.revision = Number(value.revision || 0) + 1; return { record: value, status: 'COMPLETED', changed: true }; },
    /** Creates bounded audit evidence for one privacy operation. */
    evidence: function (record, operation, command, result) { return { tenant: record.tenant, domainType: command.domainType, domainCode: record.code, operation: operation, purpose: command.purpose, requestedBy: command.actorId, status: result.status || 'COMPLETED', fields: result.fields, checksum: result.checksum, result: { changed: result.changed, revision: result.record && result.record.revision }, correlationId: command.correlationId, executedAt: command.now || new Date() }; }
};
