/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const crypto = require('node:crypto');
const AMOUNTS = require('../../../loyaltyCore/src/service/defaultLoyaltyAmountService');
const LEDGER = require('../../../loyaltyLedger/src/service/defaultLoyaltyLedgerPostingService');
const UTILS = require('../../../loyaltyCore/src/utils/utils');

/** @module loyaltyWallet/src/service/defaultLoyaltyRewardOperationService @description Coordinates reward earn, reserve, capture, release, and reverse operations against wallet balances and append-only ledger evidence. @layer service @owner loyaltyWallet @override Later modules may wrap persistence in stronger storage transactions while preserving ledger-backed balance semantics. */
module.exports = {
    unwrap: response => response && Object.prototype.hasOwnProperty.call(response, 'result') ? response.result : response,
    fail: function (code, message) {
        let error = typeof CLASSES !== 'undefined' && CLASSES.NodicsError ? new CLASSES.NodicsError(code, message) : new Error(message);
        error.code = code;
        throw error;
    },
    schemaDate: function (value) {
        return value instanceof Date ? value : value ? new Date(value) : new Date();
    },
    serviceAuthData: function (request) {
        return Object.assign({}, request.authData || {}, {
            tenant: request.tenant || request.authData && request.authData.tenant,
            principalId: 'loyaltyRewardOperationService',
            code: 'loyaltyRewardOperationService',
            loginId: 'loyaltyRewardOperationService',
            principalType: 'service',
            userGroups: ['serviceAccountUserGroup'],
            groups: ['serviceAccountUserGroup']
        });
    },
    service: function (name, required) {
        let service = typeof SERVICE !== 'undefined' ? SERVICE[name] : undefined;
        if (!service && required !== false) this.fail('ERR_LOYALTY_SERVICE_MISSING', name + ' is not available');
        return service;
    },
    serviceRequest: function (request, options) {
        options = options || {};
        let serviceRequest = {
            tenant: request.tenant || request.authData && request.authData.tenant,
            authData: this.serviceAuthData(request)
        };
        if (options.query) serviceRequest.query = options.query;
        if (options.model) serviceRequest.model = options.model;
        if (options.pageSize) serviceRequest.pageSize = options.pageSize;
        return serviceRequest;
    },
    getOne: async function (service, request) {
        if (!service || !service.get) return undefined;
        let result = this.unwrap(await service.get(request));
        return Array.isArray(result) ? result[0] : result;
    },
    persistenceModel: function (model) {
        let copy = Object.assign({}, model || {});
        ['tenant', 'enterpriseCode', 'authData', 'payload', 'httpRequest', 'scale'].forEach(field => delete copy[field]);
        return copy;
    },
    saveModel: async function (service, request, model, query) {
        if (!service) return model;
        let serviceRequest = this.serviceRequest(request, { model: this.persistenceModel(model), query: query });
        if (query && service.update) return this.unwrap(await service.update(serviceRequest));
        if (service.save) return this.unwrap(await service.save(serviceRequest));
        return model;
    },
    hashCode: function (prefix, parts) {
        return [prefix, crypto.createHash('sha1').update(parts.map(part => String(part || '')).join('|')).digest('hex')].join(':');
    },
    balanceCode: function (request) {
        let payload = request.payload || {};
        return request.balanceCode || payload.balanceCode || this.hashCode('loyaltyWalletRewardBalance', [
            request.walletCode || payload.walletCode,
            request.programCode || payload.programCode,
            request.rewardTypeCode || payload.rewardTypeCode
        ]);
    },
    reservationCode: function (request) {
        let payload = request.payload || {};
        return request.reservationCode || payload.reservationCode || this.hashCode('rewardReservation', [this.idempotencyKey(request)]);
    },
    redemptionCode: function (request) {
        let payload = request.payload || {};
        return request.redemptionCode || payload.redemptionCode || this.hashCode('rewardRedemption', [this.idempotencyKey(request), request.reservationCode || payload.reservationCode]);
    },
    ledgerCode: function (request, entryType) {
        return this.hashCode('rewardLedgerEntry', [entryType, this.idempotencyKey(request), request.walletCode, request.programCode, request.rewardTypeCode, request.reservationCode || '', request.redemptionCode || '']);
    },
    idempotencyKey: function (request) {
        let payload = request.payload || {};
        return request.idempotencyKey || payload.idempotencyKey || request.requestId;
    },
    correlationId: function (request) {
        let payload = request.payload || {};
        return request.correlationId || payload.correlationId || request.requestId || this.idempotencyKey(request);
    },
    operationRequest: function (request, entryType) {
        request = Object.assign({}, request || {});
        let payload = request.payload || {};
        request.walletCode = request.walletCode || payload.walletCode;
        request.programCode = request.programCode || payload.programCode;
        request.rewardTypeCode = request.rewardTypeCode || payload.rewardTypeCode;
        request.amount = request.amount || payload.amount;
        request.sourceType = request.sourceType || payload.sourceType || entryType;
        request.sourceCode = request.sourceCode || payload.sourceCode || this.idempotencyKey(request);
        request.targetType = request.targetType || payload.targetType;
        request.targetCode = request.targetCode || payload.targetCode;
        request.idempotencyKey = this.idempotencyKey(request);
        request.correlationId = this.correlationId(request);
        request.scale = request.scale === undefined ? payload.scale : request.scale;
        ['walletCode', 'programCode', 'rewardTypeCode', 'amount', 'idempotencyKey', 'correlationId'].forEach(field => {
            if (!UTILS.normalizeString(request[field])) this.fail('ERR_LOYALTY_OPERATION_REQUIRED', field + ' is required');
        });
        request.amount = AMOUNTS.assertPositive(request.amount, request.scale);
        return request;
    },
    balanceQuery: function (request) {
        if (request.balanceCode) return { code: request.balanceCode };
        return {
            walletCode: request.walletCode,
            programCode: request.programCode,
            rewardTypeCode: request.rewardTypeCode
        };
    },
    initialBalance: function (request) {
        let now = this.schemaDate(request.now);
        return {
            code: this.balanceCode(request),
            walletCode: request.walletCode,
            programCode: request.programCode,
            rewardTypeCode: request.rewardTypeCode,
            available: '0.00',
            reserved: '0.00',
            earned: '0.00',
            spent: '0.00',
            expired: '0.00',
            reversed: '0.00',
            revision: 0,
            updatedAt: now,
            active: true,
            created: now,
            updated: now
        };
    },
    getBalance: async function (request, createIfMissing) {
        let service = this.service('DefaultLoyaltyWalletRewardBalanceService');
        let balance = await this.getOne(service, this.serviceRequest(request, { query: this.balanceQuery(request), pageSize: 1 }));
        if (!balance && createIfMissing) return Object.assign(this.initialBalance(request), { _new: true });
        if (!balance) this.fail('ERR_LOYALTY_BALANCE_MISSING', 'loyalty wallet reward balance was not found');
        return balance;
    },
    saveBalance: async function (request, balance) {
        let model = Object.assign({}, balance);
        let isNew = !!model._new;
        delete model._new;
        return this.saveModel(this.service('DefaultLoyaltyWalletRewardBalanceService'), request, model, isNew ? undefined : { code: model.code });
    },
    getReservation: async function (request) {
        let service = this.service('DefaultRewardReservationService');
        let reservationCode = request.reservationCode || request.payload && request.payload.reservationCode;
        if (!reservationCode) this.fail('ERR_LOYALTY_RESERVATION_REQUIRED', 'reservationCode is required');
        let reservation = await this.getOne(service, this.serviceRequest(request, { query: { code: reservationCode }, pageSize: 1 }));
        if (!reservation) this.fail('ERR_LOYALTY_RESERVATION_MISSING', 'reward reservation was not found');
        return reservation;
    },
    saveReservation: async function (request, reservation, existing) {
        return this.saveModel(this.service('DefaultRewardReservationService'), request, reservation, existing ? { code: reservation.code } : undefined);
    },
    getLedgerEntry: async function (request) {
        let service = this.service('DefaultRewardLedgerEntryService');
        let entryCode = request.reversalOfEntryCode || request.payload && request.payload.reversalOfEntryCode;
        if (!entryCode) this.fail('ERR_LOYALTY_REVERSAL_REQUIRED', 'reversalOfEntryCode is required');
        let entry = await this.getOne(service, this.serviceRequest(request, { query: { code: entryCode }, pageSize: 1 }));
        if (!entry) this.fail('ERR_LOYALTY_LEDGER_ENTRY_MISSING', 'reward ledger entry was not found');
        return entry;
    },
    getOperationLedgerEntry: async function (request, entryType) {
        if (!request.idempotencyKey) return undefined;
        let query = { idempotencyKey: request.idempotencyKey, entryType: entryType };
        if (request.walletCode) query.walletCode = request.walletCode;
        if (request.programCode) query.programCode = request.programCode;
        if (request.rewardTypeCode) query.rewardTypeCode = request.rewardTypeCode;
        if (request.reservationCode) query.reservationCode = request.reservationCode;
        return this.getOne(this.service('DefaultRewardLedgerEntryService'), this.serviceRequest(request, { query: query, pageSize: 1 }));
    },
    getReservationByCode: async function (request, reservationCode) {
        if (!reservationCode) return undefined;
        return this.getOne(this.service('DefaultRewardReservationService'), this.serviceRequest(request, { query: { code: reservationCode }, pageSize: 1 }));
    },
    getRedemptionByRequest: async function (request) {
        let query = {};
        if (request.redemptionCode) query.code = request.redemptionCode;
        if (!query.code && request.idempotencyKey) query.idempotencyKey = request.idempotencyKey;
        if (request.reservationCode) query.reservationCode = request.reservationCode;
        if (!Object.keys(query).length) return undefined;
        return this.getOne(this.service('DefaultRewardRedemptionService'), this.serviceRequest(request, { query: query, pageSize: 1 }));
    },
    existingOperationResult: async function (operation, request, ledgerEntry) {
        let result = { operation: operation, ledgerEntry: ledgerEntry, idempotent: true };
        result.balance = await this.getBalance(request, false);
        if (operation === 'RESERVE' || operation === 'CAPTURE' || operation === 'RELEASE') {
            result.reservation = await this.getReservationByCode(request, ledgerEntry.reservationCode || request.reservationCode);
        }
        if (operation === 'CAPTURE') {
            result.redemption = await this.getRedemptionByRequest(Object.assign({}, request, { redemptionCode: ledgerEntry.redemptionCode }));
        }
        if (operation === 'REVERSE') {
            result.reversedEntry = await this.getOne(this.service('DefaultRewardLedgerEntryService'), this.serviceRequest(request, { query: { code: ledgerEntry.reversalOfEntryCode }, pageSize: 1 }));
        }
        return result;
    },
    saveLedgerEntry: async function (request, entry) {
        return this.saveModel(this.service('DefaultRewardLedgerEntryService'), request, entry);
    },
    saveRedemption: async function (request, redemption) {
        return this.saveModel(this.service('DefaultRewardRedemptionService'), request, redemption);
    },
    amountZero: function (scale) {
        return AMOUNTS.normalize('0', scale);
    },
    negative: function (amount, scale) {
        return AMOUNTS.subtract(this.amountZero(scale), amount, scale);
    },
    changeBalance: function (balance, request, deltas) {
        let now = this.schemaDate(request.now);
        let after = Object.assign({}, balance);
        ['available', 'reserved', 'earned', 'spent', 'expired', 'reversed'].forEach(field => {
            after[field] = AMOUNTS.normalize(after[field] || '0', request.scale);
            if (deltas[field]) after[field] = AMOUNTS.add(after[field], deltas[field], request.scale);
            if (AMOUNTS.compare(after[field], '0', request.scale) < 0) this.fail('ERR_LOYALTY_BALANCE_NEGATIVE', field + ' balance cannot be negative');
        });
        after.revision = Number(after.revision || 0) + 1;
        after.updatedAt = now;
        after.updated = now;
        return after;
    },
    ledgerEntry: function (request, balance, entryType, options) {
        options = options || {};
        let entry = LEDGER.buildEntry({
            code: this.ledgerCode(request, entryType),
            walletCode: request.walletCode,
            programCode: request.programCode,
            rewardTypeCode: request.rewardTypeCode,
            amount: request.amount,
            sourceType: request.sourceType,
            sourceCode: request.sourceCode,
            targetType: request.targetType,
            targetCode: request.targetCode,
            entryType: entryType,
            availableAfter: balance.available,
            reservedAfter: balance.reserved,
            reservationCode: request.reservationCode || options.reservationCode,
            redemptionCode: request.redemptionCode || options.redemptionCode,
            reversalOfEntryCode: request.reversalOfEntryCode || options.reversalOfEntryCode,
            idempotencyKey: request.idempotencyKey,
            correlationId: request.correlationId,
            reasonCode: request.reasonCode,
            metadata: request.metadata,
            scale: request.scale,
            postedAt: this.schemaDate(request.now)
        });
        return Object.assign({ active: true, created: entry.postedAt, updated: entry.postedAt }, entry);
    },
    transaction: async function (request, operation) {
        let transactionService = this.service('DefaultLoyaltyTransactionService', false);
        if (transactionService && transactionService.run) return transactionService.run(request, operation);
        return operation();
    },
    earn: async function (request) {
        request = this.operationRequest(request, 'EARN');
        return this.transaction(request, async () => {
            let existing = await this.getOperationLedgerEntry(request, 'EARN');
            if (existing) return this.existingOperationResult('EARN', request, existing);
            let before = await this.getBalance(request, true);
            let after = this.changeBalance(before, request, { available: request.amount, earned: request.amount });
            let ledgerEntry = this.ledgerEntry(request, after, 'EARN');
            let savedBalance = await this.saveBalance(request, after);
            let savedLedgerEntry = await this.saveLedgerEntry(request, ledgerEntry);
            return { operation: 'EARN', balance: savedBalance || after, ledgerEntry: savedLedgerEntry || ledgerEntry, before: before };
        });
    },
    reserve: async function (request) {
        request = this.operationRequest(request, 'RESERVE');
        request.reservationCode = this.reservationCode(request);
        return this.transaction(request, async () => {
            let existing = await this.getOperationLedgerEntry(request, 'RESERVE');
            if (existing) return this.existingOperationResult('RESERVE', request, existing);
            let before = await this.getBalance(request, false);
            let after = this.changeBalance(before, request, { available: this.negative(request.amount, request.scale), reserved: request.amount });
            let ledgerEntry = this.ledgerEntry(request, after, 'RESERVE', { reservationCode: request.reservationCode });
            let now = this.schemaDate(request.now);
            let reservation = {
                code: request.reservationCode,
                walletCode: request.walletCode,
                programCode: request.programCode,
                rewardTypeCode: request.rewardTypeCode,
                amount: request.amount,
                status: 'RESERVED',
                sourceType: request.sourceType,
                sourceCode: request.sourceCode,
                targetType: request.targetType,
                targetCode: request.targetCode,
                expiresAt: request.expiresAt || request.payload && request.payload.expiresAt || new Date(now.getTime() + 900000),
                createdAt: now,
                ledgerEntryCodes: [ledgerEntry.code],
                idempotencyKey: request.idempotencyKey,
                correlationId: request.correlationId,
                revision: 0,
                active: true,
                created: now,
                updated: now
            };
            let savedBalance = await this.saveBalance(request, after);
            let savedLedgerEntry = await this.saveLedgerEntry(request, ledgerEntry);
            let savedReservation = await this.saveReservation(request, reservation, false);
            return { operation: 'RESERVE', balance: savedBalance || after, ledgerEntry: savedLedgerEntry || ledgerEntry, reservation: savedReservation || reservation, before: before };
        });
    },
    capture: async function (request) {
        let incoming = request || {};
        let reservation = await this.getReservation(incoming);
        request = this.operationRequest(Object.assign({}, reservation, incoming, {
            amount: reservation.amount,
            walletCode: reservation.walletCode,
            programCode: reservation.programCode,
            rewardTypeCode: reservation.rewardTypeCode,
            reservationCode: reservation.code,
            targetType: incoming.targetType || incoming.payload && incoming.payload.targetType || reservation.targetType,
            targetCode: incoming.targetCode || incoming.payload && incoming.payload.targetCode || reservation.targetCode
        }), 'CAPTURE');
        request.reservationCode = reservation.code;
        request.redemptionCode = this.redemptionCode(request);
        let existing = await this.getOperationLedgerEntry(request, 'CAPTURE');
        if (existing) return this.existingOperationResult('CAPTURE', request, existing);
        if (reservation.status !== 'RESERVED') this.fail('ERR_LOYALTY_RESERVATION_STATUS', 'only RESERVED reward reservations can be captured');
        return this.transaction(request, async () => {
            let before = await this.getBalance(request, false);
            let after = this.changeBalance(before, request, { reserved: this.negative(request.amount, request.scale), spent: request.amount });
            let ledgerEntry = this.ledgerEntry(request, after, 'CAPTURE', { reservationCode: reservation.code, redemptionCode: request.redemptionCode });
            let now = this.schemaDate(request.now);
            let redemption = {
                code: request.redemptionCode,
                walletCode: request.walletCode,
                programCode: request.programCode,
                rewardTypeCode: request.rewardTypeCode,
                amount: request.amount,
                status: 'CAPTURED',
                targetType: request.targetType || 'EXTERNAL',
                targetCode: request.targetCode || request.idempotencyKey,
                reservationCode: reservation.code,
                captureLedgerEntryCode: ledgerEntry.code,
                providerReference: request.providerReference || request.payload && request.payload.providerReference,
                idempotencyKey: request.idempotencyKey,
                correlationId: request.correlationId,
                redeemedAt: now,
                revision: 0,
                active: true,
                created: now,
                updated: now
            };
            let updatedReservation = Object.assign({}, reservation, {
                status: 'CAPTURED',
                capturedAt: now,
                ledgerEntryCodes: (reservation.ledgerEntryCodes || []).concat(ledgerEntry.code),
                revision: Number(reservation.revision || 0) + 1,
                updated: now
            });
            let savedBalance = await this.saveBalance(request, after);
            let savedLedgerEntry = await this.saveLedgerEntry(request, ledgerEntry);
            let savedRedemption = await this.saveRedemption(request, redemption);
            let savedReservation = await this.saveReservation(request, updatedReservation, true);
            return { operation: 'CAPTURE', balance: savedBalance || after, ledgerEntry: savedLedgerEntry || ledgerEntry, redemption: savedRedemption || redemption, reservation: savedReservation || updatedReservation, before: before };
        });
    },
    release: async function (request) {
        let incoming = request || {};
        let reservation = await this.getReservation(incoming);
        request = this.operationRequest(Object.assign({}, reservation, incoming, {
            amount: reservation.amount,
            walletCode: reservation.walletCode,
            programCode: reservation.programCode,
            rewardTypeCode: reservation.rewardTypeCode,
            reservationCode: reservation.code,
            targetType: incoming.targetType || incoming.payload && incoming.payload.targetType || reservation.targetType,
            targetCode: incoming.targetCode || incoming.payload && incoming.payload.targetCode || reservation.targetCode
        }), 'RELEASE');
        request.reservationCode = reservation.code;
        let existing = await this.getOperationLedgerEntry(request, 'RELEASE');
        if (existing) return this.existingOperationResult('RELEASE', request, existing);
        if (reservation.status !== 'RESERVED') this.fail('ERR_LOYALTY_RESERVATION_STATUS', 'only RESERVED reward reservations can be released');
        return this.transaction(request, async () => {
            let before = await this.getBalance(request, false);
            let after = this.changeBalance(before, request, { available: request.amount, reserved: this.negative(request.amount, request.scale) });
            let ledgerEntry = this.ledgerEntry(request, after, 'RELEASE', { reservationCode: reservation.code });
            let now = this.schemaDate(request.now);
            let updatedReservation = Object.assign({}, reservation, {
                status: 'RELEASED',
                releasedAt: now,
                ledgerEntryCodes: (reservation.ledgerEntryCodes || []).concat(ledgerEntry.code),
                revision: Number(reservation.revision || 0) + 1,
                updated: now
            });
            let savedBalance = await this.saveBalance(request, after);
            let savedLedgerEntry = await this.saveLedgerEntry(request, ledgerEntry);
            let savedReservation = await this.saveReservation(request, updatedReservation, true);
            return { operation: 'RELEASE', balance: savedBalance || after, ledgerEntry: savedLedgerEntry || ledgerEntry, reservation: savedReservation || updatedReservation, before: before };
        });
    },
    reverseDeltas: function (entry, request) {
        let amount = AMOUNTS.assertPositive(entry.amount, request.scale);
        if (entry.entryType === 'EARN') return { available: this.negative(amount, request.scale), reversed: amount };
        if (entry.entryType === 'RESERVE') return { available: amount, reserved: this.negative(amount, request.scale), reversed: amount };
        if (entry.entryType === 'CAPTURE') return { available: amount, spent: this.negative(amount, request.scale), reversed: amount };
        if (entry.entryType === 'RELEASE') return { available: this.negative(amount, request.scale), reserved: amount, reversed: amount };
        if (entry.entryType === 'EXPIRE') return { available: amount, expired: this.negative(amount, request.scale), reversed: amount };
        this.fail('ERR_LOYALTY_REVERSAL_TYPE', 'ledger entry type cannot be reversed automatically');
    },
    reverse: async function (request) {
        let sourceEntry = await this.getLedgerEntry(request || {});
        request = this.operationRequest(Object.assign({}, request, {
            walletCode: sourceEntry.walletCode,
            programCode: sourceEntry.programCode,
            rewardTypeCode: sourceEntry.rewardTypeCode,
            amount: sourceEntry.amount,
            reversalOfEntryCode: sourceEntry.code,
            sourceType: request && (request.sourceType || request.payload && request.payload.sourceType) || 'REVERSAL',
            sourceCode: request && (request.sourceCode || request.payload && request.payload.sourceCode) || sourceEntry.code,
            targetType: sourceEntry.targetType,
            targetCode: sourceEntry.targetCode
        }), 'REVERSE');
        return this.transaction(request, async () => {
            let existing = await this.getOperationLedgerEntry(request, 'REVERSE');
            if (existing) return this.existingOperationResult('REVERSE', request, existing);
            let before = await this.getBalance(request, false);
            let after = this.changeBalance(before, request, this.reverseDeltas(sourceEntry, request));
            let ledgerEntry = this.ledgerEntry(request, after, 'REVERSE', { reversalOfEntryCode: sourceEntry.code });
            let savedBalance = await this.saveBalance(request, after);
            let savedLedgerEntry = await this.saveLedgerEntry(request, ledgerEntry);
            return { operation: 'REVERSE', balance: savedBalance || after, ledgerEntry: savedLedgerEntry || ledgerEntry, reversedEntry: sourceEntry, before: before };
        });
    }
};
