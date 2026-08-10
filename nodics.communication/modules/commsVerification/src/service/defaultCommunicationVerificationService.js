/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
const crypto = require('crypto');
/** @module commsVerification/src/service/defaultCommunicationVerificationService @description Creates and verifies reusable communication challenges without owning identity authentication state. @layer service @owner commsVerification @override Purpose owners may wrap this service while preserving hashing, expiry, attempt, and replay controls. */
module.exports = {
    /** Hashes a challenge secret with its per-record salt. */ hash: (secret, salt) => crypto.createHash('sha256').update(String(salt) + ':' + String(secret)).digest('hex'),
    /** Creates challenge evidence and returns the transient secret separately. */ create: function (command, policy) { let secret = command.secret || crypto.randomBytes(Number(policy.secretBytes || 6)).toString('hex'); let salt = crypto.randomBytes(16).toString('hex'); let now = command.now || new Date(); return { secret: secret, challenge: { tenant: command.tenant, purpose: command.purpose, subjectReference: command.subjectReference, channel: command.channel, destinationHash: crypto.createHash('sha256').update(command.destination).digest('hex'), secretHash: salt + ':' + this.hash(secret, salt), attempt: 0, maximumAttempts: Number(policy.maximumAttempts || 5), status: 'PENDING', expiresAt: new Date(now.getTime() + Number(policy.ttlSeconds || 600) * 1000), correlationId: command.correlationId } }; },
    /** Verifies one challenge once and locks after bounded failure. */ verify: function (challenge, secret, now) { now = now || new Date(); if (challenge.status !== 'PENDING' && challenge.status !== 'DELIVERED') throw new Error('verification challenge is not active'); if (new Date(challenge.expiresAt) <= now) return Object.assign({}, challenge, { status: 'EXPIRED' }); let parts = challenge.secretHash.split(':'); let correct = crypto.timingSafeEqual(Buffer.from(parts[1]), Buffer.from(this.hash(secret, parts[0]))); if (correct) return Object.assign({}, challenge, { status: 'VERIFIED', verifiedAt: now }); let attempt = Number(challenge.attempt || 0) + 1; return Object.assign({}, challenge, { attempt: attempt, status: attempt >= challenge.maximumAttempts ? 'LOCKED' : challenge.status }); }
};
