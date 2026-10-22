/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module loyaltyCore/src/service/defaultLoyaltyAmountService @description Normalizes decimal reward amounts without introducing floating point drift. @layer service @owner loyaltyCore @override Later modules may replace precision policy while preserving string amount contracts. */
module.exports = {
    /**
     * Resolves canonical framework precision or an explicit qualified reward-type precision.
     * @param {number} scale Validated decimal precision from the canonical reward unit or issued lot.
     * @returns {number} Validated effective precision; no persistence.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    precision: function (scale) {
        if (scale === undefined) scale = typeof CONFIG !== 'undefined' ? CONFIG.get('loyalty')?.amount?.scale : undefined;
        if (!Number.isInteger(scale) || scale < 0 || scale > 8) this.fail('ERR_LOYALTY_AMOUNT_SCALE', 'reward amount scale is invalid');
        return scale;
    },
    /**
     * Throws the owning operation error and stops processing; callers retain responsibility for recovery.
     * @param {string} code Exact record identity or stable owner error code, as described above.
     * @param {string} message Content-safe owner diagnostic.
     * @returns {never} Always throws a content-safe owner error; no business writes.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    fail: function (code, message) {
        let error = typeof CLASSES !== 'undefined' && CLASSES.NodicsError ? new CLASSES.NodicsError(code, message) : new Error(message);
        error.code = code;
        throw error;
    },
    /**
     * Validates a decimal reward amount and scale, rejecting excess precision instead of silently rounding.
     * @param {string} amount Exact decimal amount; no floating-point conversion.
     * @param {number} scale Validated decimal precision from the canonical reward unit or issued lot.
     * @returns {string} Validated exact decimal representation; no persistence.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    normalize: function (amount, scale) {
        scale = this.precision(scale);
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
    /**
     * Requires a normalized reward amount strictly greater than zero.
     * @param {string} amount Exact decimal amount; no floating-point conversion.
     * @param {number} scale Validated decimal precision from the canonical reward unit or issued lot.
     * @returns {string} Validated positive exact decimal representation; no persistence.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    assertPositive: function (amount, scale) {
        let normalized = this.normalize(amount, scale);
        if (normalized.replace('-', '').replace('.', '').replace(/^0+/, '') === '' || normalized.charAt(0) === '-') {
            this.fail('ERR_LOYALTY_AMOUNT_POSITIVE', 'reward amount must be positive');
        }
        return normalized;
    },
    /**
     * Converts an exact decimal reward amount into signed BigInt minor units.
     * @param {string} amount Exact decimal amount; no floating-point conversion.
     * @param {number} scale Validated decimal precision from the canonical reward unit or issued lot.
     * @returns {bigint} Exact minor units at the evidenced scale; no rounding or persistence.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    toMinor: function (amount, scale) {
        scale = this.precision(scale);
        let normalized = this.normalize(amount, scale);
        let sign = normalized.charAt(0) === '-' ? -1 : 1;
        let unsigned = sign < 0 ? normalized.slice(1) : normalized;
        let parts = unsigned.split('.');
        let whole = parts[0] || '0';
        let fraction = (parts[1] || '').padEnd(scale, '0');
        return BigInt(sign < 0 ? '-' + whole + fraction : whole + fraction);
    },
    /**
     * Converts valid signed minor units into a fixed-scale decimal string.
     * @param {bigint} minor Exact integral minor-unit amount.
     * @param {number} scale Validated decimal precision from the canonical reward unit or issued lot.
     * @returns {string} Exact decimal representation; no persistence.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    fromMinor: function (minor, scale) {
        scale = this.precision(scale);
        if ((typeof minor !== 'bigint' && !Number.isInteger(minor)) || !Number.isInteger(scale) || scale < 0 || scale > 8) this.fail('ERR_LOYALTY_AMOUNT_MINOR', 'reward minor amount is invalid');
        minor = typeof minor === 'bigint' ? minor : BigInt(minor);
        let sign = minor < 0n ? '-' : '';
        let unsigned = (minor < 0n ? -minor : minor).toString().padStart(scale + 1, '0');
        if (!scale) return sign + unsigned;
        return sign + unsigned.slice(0, -scale) + '.' + unsigned.slice(-scale);
    },
    /**
     * Adds reward amounts in integer minor units and returns a fixed-scale decimal string.
     * @param {string} left Left exact decimal operand.
     * @param {string} right Right exact decimal operand.
     * @param {number} scale Validated decimal precision from the canonical reward unit or issued lot.
     * @returns {string} Exact sum at the requested scale; no persistence.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    add: function (left, right, scale) {
        return this.fromMinor(this.toMinor(left, scale) + this.toMinor(right, scale), scale);
    },
    /**
     * Subtracts reward amounts in integer minor units and returns a fixed-scale decimal string.
     * @param {string} left Left exact decimal operand.
     * @param {string} right Right exact decimal operand.
     * @param {number} scale Validated decimal precision from the canonical reward unit or issued lot.
     * @returns {string} Exact difference at the requested scale; no persistence.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    subtract: function (left, right, scale) {
        return this.fromMinor(this.toMinor(left, scale) - this.toMinor(right, scale), scale);
    },
    /**
     * Compares exact reward amounts and returns -1, 0 or 1 without floating-point arithmetic.
     * @param {string} left Left exact decimal operand.
     * @param {string} right Right exact decimal operand.
     * @param {number} scale Validated decimal precision from the canonical reward unit or issued lot.
     * @returns {number} Exact ordering comparison; no persistence.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    compare: function (left, right, scale) {
        let delta = this.toMinor(left, scale) - this.toMinor(right, scale);
        return delta === 0n ? 0 : delta > 0n ? 1 : -1;
    }
};
