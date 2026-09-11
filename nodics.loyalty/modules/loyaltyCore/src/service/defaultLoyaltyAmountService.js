/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module loyaltyCore/src/service/defaultLoyaltyAmountService @description Normalizes decimal reward amounts without introducing floating point drift. @layer service @owner loyaltyCore @override Later modules may replace precision policy while preserving string amount contracts. */
module.exports = {
    /** Throws the owning operation error and stops processing; callers retain responsibility for recovery. */
    fail: function (code, message) {
        let error = typeof CLASSES !== 'undefined' && CLASSES.NodicsError ? new CLASSES.NodicsError(code, message) : new Error(message);
        error.code = code;
        throw error;
    },
    /** Validates a decimal reward amount and scale, rejecting excess precision instead of silently rounding. */
    normalize: function (amount, scale) {
        scale = scale === undefined ? 2 : Number(scale);
        if (!Number.isInteger(scale) || scale < 0 || scale > 8) this.fail('ERR_LOYALTY_AMOUNT_SCALE', 'reward amount scale is invalid');
        let raw = amount === undefined || amount === null ? '' : String(amount).trim();
        if (!/^-?\d+(\.\d+)?$/.test(raw)) this.fail('ERR_LOYALTY_AMOUNT_INVALID', 'reward amount is invalid');
        let sign = raw.charAt(0) === '-' ? '-' : '';
        let unsigned = sign ? raw.slice(1) : raw;
        let parts = unsigned.split('.');
        let whole = parts[0].replace(/^0+(?=\d)/, '') || '0';
        let fraction = (parts[1] || '').padEnd(scale, '0').slice(0, scale);
        if ((parts[1] || '').length > scale) this.fail('ERR_LOYALTY_AMOUNT_PRECISION', 'reward amount exceeds configured precision');
        return sign + whole + (scale ? '.' + fraction : '');
    },
    /** Requires a normalized reward amount strictly greater than zero. */
    assertPositive: function (amount, scale) {
        let normalized = this.normalize(amount, scale);
        if (normalized.replace('-', '').replace('.', '').replace(/^0+/, '') === '' || normalized.charAt(0) === '-') {
            this.fail('ERR_LOYALTY_AMOUNT_POSITIVE', 'reward amount must be positive');
        }
        return normalized;
    },
    /** Converts an exact decimal reward amount into signed BigInt minor units. */
    toMinor: function (amount, scale) {
        let normalized = this.normalize(amount, scale);
        let sign = normalized.charAt(0) === '-' ? -1 : 1;
        let unsigned = sign < 0 ? normalized.slice(1) : normalized;
        let parts = unsigned.split('.');
        let whole = parts[0] || '0';
        let fraction = (parts[1] || '').padEnd(scale === undefined ? 2 : Number(scale), '0');
        return BigInt(sign < 0 ? '-' + whole + fraction : whole + fraction);
    },
    /** Converts valid signed minor units into a fixed-scale decimal string. */
    fromMinor: function (minor, scale) {
        scale = scale === undefined ? 2 : Number(scale);
        if ((typeof minor !== 'bigint' && !Number.isInteger(minor)) || !Number.isInteger(scale) || scale < 0 || scale > 8) this.fail('ERR_LOYALTY_AMOUNT_MINOR', 'reward minor amount is invalid');
        minor = typeof minor === 'bigint' ? minor : BigInt(minor);
        let sign = minor < 0n ? '-' : '';
        let unsigned = (minor < 0n ? -minor : minor).toString().padStart(scale + 1, '0');
        if (!scale) return sign + unsigned;
        return sign + unsigned.slice(0, -scale) + '.' + unsigned.slice(-scale);
    },
    /** Adds reward amounts in integer minor units and returns a fixed-scale decimal string. */
    add: function (left, right, scale) {
        return this.fromMinor(this.toMinor(left, scale) + this.toMinor(right, scale), scale);
    },
    /** Subtracts reward amounts in integer minor units and returns a fixed-scale decimal string. */
    subtract: function (left, right, scale) {
        return this.fromMinor(this.toMinor(left, scale) - this.toMinor(right, scale), scale);
    },
    /** Compares exact reward amounts and returns -1, 0 or 1 without floating-point arithmetic. */
    compare: function (left, right, scale) {
        let delta = this.toMinor(left, scale) - this.toMinor(right, scale);
        return delta === 0n ? 0 : delta > 0n ? 1 : -1;
    }
};
